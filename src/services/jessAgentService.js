// jessAgentService — shared helper for "Jess agent → cached text" callsites.
//
// Same poll-loop pattern as jessMemoryService.js (we measured 0 events
// on subscribeToConversation for ephemeral conversations — poll works).
// Used by Feature 4 surfaces:
//
//   • JessNoticedCard       (For You tab, daily cache)
//   • JessJournalPrompt     (Journal page, daily cache)
//   • JessPatientSummary    (/DoctorExport, weekly cache)
//
// Public API:
//   callJessAgent({ system, user })  → { text, error }
//   loadDailyCache(key)              → parsed value | null
//   saveDailyCache(key, value)       → void
//   todayKey()                       → "YYYY-MM-DD" (local date)
//   weekKey()                        → "YYYY-Www"

import { base44 } from "@/api/base44Client";

// Sprint 2 S2-3 — shared Jess persona.
//
// Every Jess surface used to ship its own bespoke system prompt; the
// chat character, the For You "noticed" card, the Journal prompt, the
// Pattern Nudge, the Phase Prep, the Weekly Summary, the Daily Opener
// and the GP-export summary all read like different people. This
// constant is the single locked persona that prepends every Jess
// system prompt. Surface-specific instructions go AFTER the persona.
//
// Sprint 3 S3-1 — crisis escalation copy is part of the persona so
// every Jess surface inherits the hard-stop instruction (Samaritans
// 116 123 / A&E) without needing to remember to include it.
export const JESS_PERSONA =
  "You are Jess, a warm and knowledgeable women's health companion built into FemWell. " +
  "You speak with calm confidence and warmth — like a trusted friend who happens to know a lot about " +
  "women's health. You never diagnose, never prescribe, and always frame responses as wellness support, " +
  "not medical advice. You're curious, not clinical. Grounding, not alarming. You remember what matters " +
  "to this person.\n\n" +
  "[CAPABILITIES — WHAT YOU CAN DO IN THE APP] " +
  "You are an action-taking companion, not a chatbot. You CAN and DO write to the user's FemWell data " +
  "through the action envelope. Specifically:\n" +
  "- CREATE_MEAL_PLAN: When the user asks for ANY meal plan (\"create a meal plan\", \"give me a 7-day plan\", " +
  "\"plan my meals\", \"plan for the week\", \"vegetarian week\", etc.) you MUST build it directly. Emit a " +
  "CREATE_MEAL_PLAN action with `{ days: 7, preferences: [...], plan?: [...] }`. Either supply the full " +
  "`plan` array (21 items: breakfast/lunch/dinner x 7 days) OR pass `days` + `preferences` and the executor " +
  "will scaffold the days. DO NOT redirect the user to resources, recipes, or external sites. DO NOT say " +
  "\"I can't generate\". DO NOT defer to a dietitian unless the user explicitly asks for clinical input. " +
  "Confirmation copy: \"Done — here's your 7-day [preference] plan, written to your Nutrition page.\" Then " +
  "list a brief overview of the days in your message.\n" +
  "- You CAN log any health data the user mentions in passing — mood, energy, sleep, symptoms, meals, " +
  "hydration, medications, supplements, habits, journal entries, tasks. If they say it, log it. Don't " +
  "ask permission for things they've just told you happened.\n" +
  "- You CAN write multi-day routines, weekly habit setups, or recurring tasks by emitting one action " +
  "per day.\n" +
  "- When you take an action, confirm it warmly and concretely in your message: \"Done — I've planned " +
  "your meals for the week\" or \"Got it, I've logged that you slept 7 hours.\" Never use vague \"I've " +
  "noted that\" copy when you actually wrote a row.\n\n" +
  "[ACTION INVARIANT — CRITICAL] " +
  "If your `message` says you did something (\"Done — I've added it to your to-do list\", " +
  "\"I've logged your sleep\", \"Here's your meal plan\", \"Got it, planned for the week\", etc), " +
  "the corresponding action MUST appear in the `actions` array of the SAME response. Saying you did " +
  "it without emitting the action is a CONTRACT VIOLATION — the user will see the confirmation but no " +
  "data will be written. If you are not going to emit the action, do not claim to have done it. The " +
  "wording \"I've created\", \"I've added\", \"I've logged\", \"I've saved\", \"I've planned\" MUST always " +
  "co-occur with an actions[] entry of the matching type. Confidence on these MUST be ≥ 0.85.\n\n" +
  "[FORBIDDEN REFUSAL PHRASES — DO NOT EMIT ANY OF THESE] " +
  "NEVER say any of: \"I can't create\", \"I can't generate\", \"can't generate\", \"can not generate\", " +
  "\"I cannot generate\", \"I'm not able to\", \"I am not able to\", \"I can't do that directly\", " +
  "\"I don't have the ability to\", \"I'm not equipped to\", \"you'll need to do that yourself\", " +
  "\"find reliable resources\", \"help you find resources\", \"provide resources\", \"point you to resources\", " +
  "\"point you toward resources\", \"here are some resources\", \"I'd recommend a dietitian\" (unless the user " +
  "asks for a referral), \"please consult\" (as a deflection), or any phrase ending in \"directly\" that " +
  "implies refusal. If you can take the action, take it. If you genuinely cannot (e.g. booking an external " +
  "GP appointment, sending an email, calling someone), say: \"I can't do that part in the app, but here's " +
  "what I can do instead —\" and offer the closest in-app alternative.\n\n" +
  "[EXAMPLE — MEAL PLAN REQUEST, CORRECT vs WRONG]\n" +
  "USER: \"Create a 7-day meal plan for me, vegetarian.\"\n" +
  "JESS (CORRECT): { \"message\": \"Done — here's your 7-day vegetarian plan, tuned for your luteal phase. " +
  "Logged to your Nutrition page. Days 1–2 lean on iron-rich lentils and greens, days 3–4 add complex carbs " +
  "for energy, days 5–7 keep dinners light. Open Nutrition to see the full list.\", " +
  "\"actions\": [{ \"type\": \"CREATE_MEAL_PLAN\", \"confidence\": 0.92, \"data\": { \"days\": 7, " +
  "\"preferences\": [\"vegetarian\"] } }] }\n" +
  "JESS (WRONG — NEVER DO THIS): \"While I can't generate a meal plan directly, here are some resources you " +
  "might find helpful…\" — this exact pattern is BANNED.\n\n" +
  "[CRISIS ESCALATION] " +
  "If at any point the user expresses thoughts of self-harm, suicide, or a medical emergency, stop your " +
  "normal response and output only: \"I'm worried about you right now. Please contact the Samaritans on " +
  "116 123 (free, 24/7) or go to your nearest A&E if you are in immediate danger. You don't have to face " +
  "this alone.\" Do not add anything else.";

// Sprint 5 — Action Layer envelope. Appended to every Jess agent call
// so the LLM returns a structured JSON envelope the chat shell can
// parse + execute. Includes the MEMORY_CONTEXT placeholder; the chat
// shell substitutes the rolling-20 memory line via withJessActionEnvelope().
export const JESS_ACTION_ENVELOPE =
  "RESPONSE FORMAT — MANDATORY:\n" +
  "You MUST always respond with a valid JSON object in this exact shape:\n" +
  "{\n" +
  '  "message": "your conversational reply here",\n' +
  '  "actions": [\n' +
  "    {\n" +
  '      "type": "ACTION_TYPE",\n' +
  '      "confidence": 0.0,\n' +
  '      "data": { }\n' +
  "    }\n" +
  "  ]\n" +
  "}\n" +
  'If no actions are needed, return "actions": [].\n' +
  "Never return plain text — always return this JSON envelope.\n" +
  "Confidence below 0.75 means you are unsure — return CLARIFICATION_NEEDED instead.\n\n" +
  "WHAT YOU CAN DO:\n" +
  "You can log mood, energy, sleep, symptoms, meals, hydration, medication, supplements, habits, tasks, " +
  "and journal entries. When the user mentions doing or feeling something, extract the action and include " +
  "it. Confirm what you logged in your message naturally: \"Got it — I've logged that for you.\"\n\n" +
  "ACTION TYPES: LOG_MOOD, LOG_ENERGY, LOG_SLEEP, LOG_DAILY_CHECKIN, LOG_SYMPTOM, LOG_MEAL, " +
  "CREATE_MEAL_PLAN, LOG_HYDRATION, LOG_MEDICATION, LOG_SUPPLEMENT, LOG_HABIT, CREATE_TASK, " +
  "COMPLETE_TASK, WRITE_JOURNAL, QUERY_DATA, CLARIFICATION_NEEDED.\n\n" +
  "MEMORY CONTEXT:\n" +
  "{{MEMORY_CONTEXT}}";

// Helper — every surface should call this rather than writing a fresh
// "You are Jess…" preamble. Returns the persona + a separator + the
// surface-specific block.
export function withJessPersona(surfacePrompt) {
  if (!surfacePrompt) return JESS_PERSONA;
  return `${JESS_PERSONA}\n\n---\n\n${surfacePrompt}`;
}

// Sprint 5 — wraps a surface prompt with persona + the Action Layer
// envelope, substituting the {{MEMORY_CONTEXT}} placeholder. Passing
// `memoryLine = ""` is fine — the envelope still asks for JSON but
// records no prior turns.
export function withJessActionEnvelope(surfacePrompt, memoryLine = "") {
  const envelope = JESS_ACTION_ENVELOPE.replace(
    "{{MEMORY_CONTEXT}}",
    memoryLine && memoryLine.trim() ? memoryLine.trim() : "(no prior turns)",
  );
  const parts = [JESS_PERSONA];
  if (surfacePrompt) parts.push(surfacePrompt);
  parts.push(envelope);
  return parts.join("\n\n---\n\n");
}

export async function callJessAgent({ system, user }) {
  if (!system || !user) return { text: "", error: "missing-input" };
  // Sprint 2 S2-3 + Sprint 3 S3-1 — always prepend the locked Jess
  // persona + crisis escalation line. This is non-negotiable: every
  // Jess agent call MUST carry the crisis instruction so that the
  // Samaritans / A&E hard-stop fires regardless of which surface
  // initiated the call. Surface-specific prompts still keep their
  // bespoke instructions and may re-use "You are Jess" — that's
  // harmless reinforcement, not a duplicate role.
  system = withJessPersona(system);

  let convo = null;
  try {
    convo = await base44.agents.createConversation({ agent_name: "personal_assistant" }).catch(() => null);
  } catch { /* swallow */ }
  if (!convo?.id) return { text: "", error: "no-convo" };

  let fullText = "";
  try {
    const c = await base44.agents.getConversation(convo.id);
    await base44.agents.addMessage(c, {
      role: "user",
      content: `[SYSTEM]\n${system}\n\n[USER]\n${user}`,
    });
    for (let attempt = 1; attempt <= 10; attempt++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => window.setTimeout(r, 2000));
      try {
        // eslint-disable-next-line no-await-in-loop
        const updated = await base44.agents.getConversation(convo.id);
        const messages = Array.isArray(updated?.messages)
          ? updated.messages
          : (Array.isArray(updated?.messages?.items) ? updated.messages.items : []);
        let assistantMsg = null;
        for (let i = messages.length - 1; i >= 0; i--) {
          const m = messages[i];
          if (m?.role !== "assistant") continue;
          const txt = String(m?.content || "").trim();
          if (txt.length > 10) { assistantMsg = m; break; }
        }
        if (assistantMsg) { fullText = String(assistantMsg.content); break; }
      } catch { /* swallow tick errors */ }
    }
  } catch (e) {
    return { text: "", error: String(e?.message || e) };
  }

  return { text: fullText, error: fullText ? null : "no-reply" };
}

// ─── Safe storage layer (Sprint 3 S3-4) ──────────────────────────────────
//
// Private/incognito browsing throws on localStorage writes (Safari is
// strictest — even reads can throw if a quota was exceeded earlier in
// the session). Wrap reads/writes in try/catch and fall back to a
// session-only in-memory Map so Jess caches degrade gracefully instead
// of cratering. The in-memory Map is process-lifetime — it survives
// re-renders but resets on a hard reload, which is the right trade
// (we'd rather hit the agent once on a fresh tab than crash trying
// to write).
const _memCache = new Map();

export function safeLocalStorageGet(key) {
  if (!key) return null;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage?.getItem(key);
      if (raw != null) return raw;
    } catch { /* fall through to memory */ }
  }
  return _memCache.has(key) ? _memCache.get(key) : null;
}

export function safeLocalStorageSet(key, value) {
  if (!key) return;
  // Always write to memory — it's our "last writer wins" record even
  // when localStorage works, so a subsequent get can fall back to it
  // if the storage layer goes sideways mid-session.
  _memCache.set(key, value);
  if (typeof window !== "undefined") {
    try { window.localStorage?.setItem(key, value); }
    catch { /* swallow quota / private mode */ }
  }
}

export function safeLocalStorageRemove(key) {
  if (!key) return;
  _memCache.delete(key);
  if (typeof window !== "undefined") {
    try { window.localStorage?.removeItem(key); }
    catch { /* swallow */ }
  }
}

// ─── Cache helpers ───────────────────────────────────────────────────────
// loadDailyCache / saveDailyCache are the public API every Jess
// surface uses; they now go through the safe storage layer above so a
// crash from localStorage being unavailable doesn't propagate.
export function loadDailyCache(key) {
  const raw = safeLocalStorageGet(key);
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return null; }
}

export function saveDailyCache(key, value) {
  try { safeLocalStorageSet(key, JSON.stringify(value)); }
  catch { /* swallow stringify failure */ }
}

// "YYYY-MM-DD" using LOCAL date components (BST off-by-one safe).
export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ISO-ish week key — "2026-W21". Resets weekly; safe for patient summary.
export function weekKey() {
  const d = new Date(Date.UTC(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  ));
  // Set to nearest Thursday: current date + 4 - current day number
  // (Sunday-based getUTCDay() returns 0 on Sunday).
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

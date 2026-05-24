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
  "[CRISIS ESCALATION] " +
  "If at any point the user expresses thoughts of self-harm, suicide, or a medical emergency, stop your " +
  "normal response and output only: \"I'm worried about you right now. Please contact the Samaritans on " +
  "116 123 (free, 24/7) or go to your nearest A&E if you are in immediate danger. You don't have to face " +
  "this alone.\" Do not add anything else.";

// Helper — every surface should call this rather than writing a fresh
// "You are Jess…" preamble. Returns the persona + a separator + the
// surface-specific block.
export function withJessPersona(surfacePrompt) {
  if (!surfacePrompt) return JESS_PERSONA;
  return `${JESS_PERSONA}\n\n---\n\n${surfacePrompt}`;
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

// jessMemoryService — Feature 2 of the Jess major build sprint.
//
// Persistent memory layer between conversations. Three responsibilities:
//
//  1. extractMemoriesFromConversation(messages, userId, convId, jessName)
//     — runs an ephemeral base44.agents extractor over the transcript
//       after a thread closes. Parses a JSON array, persists rows with
//       importance_score >= 5 to base44.entities.JessMemory.
//
//  2. loadTopMemories(userId, limit=5)
//     — reads the top N most-important active memories. Used by
//       buildJessContext() to inject into every new conversation.
//
//  3. deactivateMemory(memoryId)
//     — soft-deletes via is_active=false. Used by the settings sheet's
//       per-row ✕ button + the Clear-all action.
//
// Defensive guards: every base44.entities.JessMemory.* call is wrapped
// in try/catch so the feature degrades cleanly if the entity isn't
// provisioned in the schema yet.
//
// QA Fix 4 — extraction wasn't firing reliably. Two fixes:
//   • Resolve the LLM wait early as soon as a *complete* JSON array is
//     present in the streamed reply (otherwise the 8 s budget often
//     truncated a still-streaming response and we hit `parse-error`).
//   • Tag every return with a console.info so we can see, in production
//     dev-tools, exactly where each attempt landed (no-input, too-short,
//     no-entity, no-llm-reply, parse-error, extracted-N).

import { base44 } from "@/api/base44Client";

// One-line dev breadcrumb so devs can grep `[jess-memory]` in the
// console after a thread closes and see what happened. Uses
// console.log (not info) so the line shows up regardless of dev-tools
// console filter level — strict filters often hide info-level logs.
function trace(stage, payload) {
  try {
    // eslint-disable-next-line no-console
    console.log(`[jess-memory] ${stage}`, payload || "");
  } catch { /* console may be unavailable in some envs */ }
}

// ─── Extraction ───────────────────────────────────────────────────────────
// Build a transcript of the user ↔ Jess turns, feed it to a one-shot
// base44.agents conversation, parse the JSON array reply, persist rows.
export async function extractMemoriesFromConversation(messages, userId, convId, jessName = "Jess") {
  if (!Array.isArray(messages) || !userId) {
    const r = { extracted: 0, reason: "no-input" };
    trace("skip", r);
    return r;
  }
  // Filter to user + jess bubble messages only; skip dividers, opener
  // chips, the hidden [JESS CONTEXT] block, etc.
  const turns = messages
    .filter((m) => m && (m.role === "user" || m.role === "jess") && (m.type === "bubble" || !m.type))
    .map((m) => {
      const speaker = m.role === "user" ? "User" : jessName;
      const text = String(m.text || m.content || "").trim();
      // Belt-and-braces — drop the hidden context block if it ever
      // slipped into the local message list (it shouldn't, but).
      if (text.startsWith("[JESS CONTEXT")) return "";
      return text ? `${speaker}: ${text}` : "";
    })
    .filter(Boolean)
    .join("\n");

  // Too short → not worth a roundtrip.
  if (turns.length < 50) {
    const r = { extracted: 0, reason: "too-short", chars: turns.length };
    trace("skip", r);
    return r;
  }

  const Entity = base44?.entities?.JessMemory;
  // If the entity doesn't exist yet, run the LLM call anyway so we can
  // surface what *would* be remembered for debugging — but skip the
  // writes.
  const hasEntity = !!Entity;
  trace("start", { userId, convId, hasEntity, transcriptChars: turns.length });

  const systemLine =
    `You are a memory extractor for a women's health AI companion called ${jessName}. ` +
    `Extract memorable facts from this conversation that ${jessName} should remember for future conversations.\n\n` +
    `Return ONLY a JSON array (no other text, no markdown fences). Each item must have keys: memory_type, content, importance_score, tags. ` +
    `memory_type is one of: preference | health_pattern | emotional_context | explicit_statement | goal | follow_up. ` +
    `content is a concise 1-sentence memory. importance_score is 1-10. tags is a comma-separated keyword list. ` +
    `Only extract things genuinely worth remembering (importance >= 5). Return [] if nothing is memorable.`;

  // QA round 4 — granular breadcrumbs for every step of the LLM round
  // trip so we can see *exactly* where extraction stalls.
  trace("step:create-convo:before");
  let convo = null;
  try {
    convo = await base44.agents.createConversation({ agent_name: "personal_assistant" }).catch((e) => {
      trace("step:create-convo:rejected", String(e?.message || e));
      return null;
    });
  } catch (e) { trace("step:create-convo:throw", String(e?.message || e)); }
  trace("step:create-convo:after", { convoId: convo?.id || null, hasMessages: Array.isArray(convo?.messages) });
  if (!convo?.id) {
    const r = { extracted: 0, reason: "no-agent-convo" };
    trace("fail", r);
    return r;
  }

  // QA round 5 — switched from subscribeToConversation to a poll loop.
  // The streaming subscription doesn't reliably deliver events for
  // ephemeral extraction conversations (we measured 0 events across
  // multiple runs). But `getConversation` polled after the fact does
  // contain the assistant reply with a valid JSON memory array. Poll
  // every 2 s up to 10 times = 20 s ceiling.
  let fullText = "";
  try {
    trace("step:get-convo:before", { convoId: convo.id });
    const c = await base44.agents.getConversation(convo.id);
    // Normalise message count — base44 returns messages as an array OR
    // as { items: [...] } depending on endpoint version, so be
    // defensive.
    const initialMsgs = Array.isArray(c?.messages) ? c.messages : (Array.isArray(c?.messages?.items) ? c.messages.items : []);
    trace("step:get-convo:after", { hasMessages: Array.isArray(c?.messages), msgCount: initialMsgs.length, keys: c ? Object.keys(c).join(",") : "" });
    trace("step:add-message:before", { contentChars: turns.length + systemLine.length });
    await base44.agents.addMessage(c, {
      role: "user",
      content: `[SYSTEM]\n${systemLine}\n\n[CONVERSATION]\n${turns}`,
    });
    trace("step:add-message:after");
    trace("step:poll:start", { maxAttempts: 10, intervalMs: 2000 });
    for (let attempt = 1; attempt <= 10; attempt++) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => window.setTimeout(r, 2000));
      try {
        // eslint-disable-next-line no-await-in-loop
        const updated = await base44.agents.getConversation(convo.id);
        const messages = Array.isArray(updated?.messages)
          ? updated.messages
          : (Array.isArray(updated?.messages?.items) ? updated.messages.items : []);
        // findLast equivalent — newer-first scan for a substantive
        // assistant reply (>10 chars, post-trim).
        let assistantMsg = null;
        for (let i = messages.length - 1; i >= 0; i--) {
          const m = messages[i];
          if (m?.role !== "assistant") continue;
          const txt = String(m?.content || "").trim();
          if (txt.length > 10) { assistantMsg = m; break; }
        }
        const tick = {
          attempt,
          msgCount: messages.length,
          assistantFound: !!assistantMsg,
          assistantChars: assistantMsg ? String(assistantMsg.content).length : 0,
        };
        if (assistantMsg) {
          fullText = String(assistantMsg.content);
          trace("step:poll:hit", tick);
          break;
        }
        trace("step:poll:tick", tick);
      } catch (e) {
        trace("step:poll:throw", { attempt, error: String(e?.message || e) });
      }
    }
    if (!fullText) trace("step:poll:exhausted");
  } catch (e) { trace("step:agent:throw", String(e?.message || e)); }

  if (!fullText) {
    // Post-mortem so QA can see the final conversation state if the
    // poll loop never found an assistant turn.
    let postMortem = null;
    try {
      const c = await base44.agents.getConversation(convo.id);
      const msgs = Array.isArray(c?.messages)
        ? c.messages
        : (Array.isArray(c?.messages?.items) ? c.messages.items : []);
      postMortem = {
        msgCount: msgs.length,
        roles: msgs.map((m) => m?.role).join(","),
        lastContent: String(msgs.slice(-1)[0]?.content || "").slice(0, 200),
      };
    } catch (e) { postMortem = { error: String(e?.message || e) }; }
    trace("step:post-mortem", { postMortem });
  }

  if (!fullText) {
    const r = { extracted: 0, reason: "no-llm-reply" };
    trace("fail", r);
    return r;
  }

  // Parse — the model may wrap the array in prose, so extract the first
  // [ ... ] block. Strip ```json fences if present.
  let memories = [];
  try {
    const cleaned = fullText.replace(/```(?:json)?/gi, "").trim();
    const m = cleaned.match(/\[[\s\S]*\]/);
    if (!m) throw new Error("no JSON array");
    memories = JSON.parse(m[0]);
    if (!Array.isArray(memories)) throw new Error("not an array");
  } catch (e) {
    const r = { extracted: 0, reason: "parse-error", err: String(e), raw: fullText.slice(0, 200) };
    trace("fail", r);
    return r;
  }

  if (!memories.length) {
    const r = { extracted: 0, reason: "empty-array" };
    trace("done", r);
    return r;
  }
  if (!hasEntity) {
    const r = { extracted: 0, reason: "no-entity", queued: memories.length };
    trace("fail", r);
    return r;
  }

  let written = 0;
  let skippedLow = 0;
  let writeErrors = 0;
  for (const m of memories) {
    const score = Number(m?.importance_score);
    if (!Number.isFinite(score) || score < 5) { skippedLow += 1; continue; }
    const content = String(m?.content || "").trim();
    if (!content) { skippedLow += 1; continue; }
    try {
      await Entity.create({
        user_id: userId,
        memory_type: String(m?.memory_type || "explicit_statement"),
        content,
        source_conv_id: convId || "",
        importance_score: Math.max(1, Math.min(10, Math.round(score))),
        is_active: true,
        tags: String(m?.tags || ""),
      });
      written += 1;
    } catch (e) {
      writeErrors += 1;
      trace("write-error", String(e?.message || e));
    }
  }
  const r = { extracted: written, considered: memories.length, skippedLow, writeErrors };
  trace("done", r);
  return r;
}

// Cheap heuristic: does the text contain at least one fully-balanced
// JSON array (first unescaped `[` matches a later unescaped `]`)? We
// don't JSON.parse — that's too expensive to do on every stream event.
function hasBalancedJsonArray(text) {
  if (typeof text !== "string") return false;
  const start = text.indexOf("[");
  if (start < 0) return false;
  let depth = 0;
  let inStr = false;
  let strChar = "";
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (inStr) {
      if (ch === "\\") { escape = true; continue; }
      if (ch === strChar) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue; }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) return true;
    }
  }
  return false;
}

// ─── Read ─────────────────────────────────────────────────────────────────
// Top-N most-important active memories for a user. Used by the context
// builder to inject into every new conversation, and by the settings
// sheet to render the "Jess Remembers" list (with a higher limit).
export async function loadTopMemories(userId, limit = 5) {
  if (!userId) return [];
  const Entity = base44?.entities?.JessMemory;
  if (!Entity) return [];
  try {
    const rows = await Entity.filter(
      { user_id: userId, is_active: true },
      "-importance_score",
      limit,
    ).catch(() => []);
    return Array.isArray(rows) ? rows : [];
  } catch { return []; }
}

// ─── Soft-delete ──────────────────────────────────────────────────────────
// Flips is_active=false on a single memory id. Returns true on success.
export async function deactivateMemory(memoryId) {
  if (!memoryId) return false;
  const Entity = base44?.entities?.JessMemory;
  if (!Entity) return false;
  try {
    await Entity.update(memoryId, { is_active: false });
    return true;
  } catch { return false; }
}

// ─── User-authored memory (Jess v2 J2-5) ──────────────────────────────────
// Lets the user add their own memory rows from the settings sheet's
// "What Jess knows" section. These are tagged source_conv_id="user-added"
// so we can filter / surface them separately if we ever want to. Score
// defaults high (8) so they outrank low-confidence LLM extractions in
// loadTopMemories().
export async function createUserMemory(userId, content) {
  if (!userId) return null;
  const text = String(content || "").trim();
  if (text.length < 4) return null;
  const Entity = base44?.entities?.JessMemory;
  if (!Entity) return null;
  try {
    const row = await Entity.create({
      user_id: userId,
      memory_type: "explicit_statement",
      content: text,
      source_conv_id: "user-added",
      importance_score: 8,
      is_active: true,
      tags: "user-added",
    });
    return row || null;
  } catch { return null; }
}

// Update the text of an existing memory in place. Used when the user
// taps "Edit" on a memory card and saves changes.
export async function updateMemoryContent(memoryId, content) {
  if (!memoryId) return false;
  const text = String(content || "").trim();
  if (text.length < 4) return false;
  const Entity = base44?.entities?.JessMemory;
  if (!Entity) return false;
  try {
    await Entity.update(memoryId, { content: text });
    return true;
  } catch { return false; }
}

// ─── Bulk soft-delete ─────────────────────────────────────────────────────
// Used by the settings sheet's "Clear all memory" action.
export async function deactivateAllMemories(userId) {
  if (!userId) return 0;
  const Entity = base44?.entities?.JessMemory;
  if (!Entity) return 0;
  try {
    const rows = await Entity.filter({ user_id: userId, is_active: true }).catch(() => []);
    let cleared = 0;
    for (const r of rows || []) {
      try { await Entity.update(r.id, { is_active: false }); cleared += 1; }
      catch {}
    }
    return cleared;
  } catch { return 0; }
}

// ─── Render helper — memory_type → display label + colour token ───────────
// Used by JessSettingsSheet to render the badge next to each memory.
// Returns { label, bg, fg } so the badge component doesn't need to
// hard-code its own switch statement.
export function memoryTypeBadge(memoryType) {
  switch (memoryType) {
    case "preference":         return { label: "Preference",  bg: "#D4E6D4", fg: "#3A5A3A" }; // sage tints
    case "health_pattern":     return { label: "Pattern",     bg: "#F5D8DA", fg: "#7A2935" }; // blush tints
    case "emotional_context":  return { label: "Emotional",   bg: "#EDE4F8", fg: "#4A3B7A" }; // luteal lavender
    case "explicit_statement": return { label: "She said",    bg: "#EDE6D5", fg: "#3A2C1A" }; // cream/espresso
    case "goal":               return { label: "Goal",        bg: "#F5E8B0", fg: "#7A6320" }; // gold tints
    case "follow_up":          return { label: "Follow up",   bg: "#F4EDDB", fg: "#9B8B7A" }; // cream/muted
    default:                   return { label: "Memory",      bg: "#EDE6D5", fg: "#9B8B7A" };
  }
}

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

import { base44 } from "@/api/base44Client";

// ─── Extraction ───────────────────────────────────────────────────────────
// Build a transcript of the user ↔ Jess turns, feed it to a one-shot
// base44.agents conversation, parse the JSON array reply, persist rows.
export async function extractMemoriesFromConversation(messages, userId, convId, jessName = "Jess") {
  if (!Array.isArray(messages) || !userId) return { extracted: 0, reason: "no-input" };
  // Filter to user + jess bubble messages only; skip dividers, opener
  // chips, the hidden [JESS CONTEXT] block, etc.
  const turns = messages
    .filter((m) => m && (m.role === "user" || m.role === "jess") && (m.type === "bubble" || !m.type))
    .map((m) => {
      const speaker = m.role === "user" ? "User" : jessName;
      const text = String(m.text || m.content || "").trim();
      return text ? `${speaker}: ${text}` : "";
    })
    .filter(Boolean)
    .join("\n");

  // Too short → not worth a roundtrip.
  if (turns.length < 50) return { extracted: 0, reason: "too-short" };

  const Entity = base44?.entities?.JessMemory;
  // If the entity doesn't exist yet, run the LLM call anyway so we can
  // surface what *would* be remembered for debugging — but skip the
  // writes.
  const hasEntity = !!Entity;

  const systemLine =
    `You are a memory extractor for a women's health AI companion called ${jessName}. ` +
    `Extract memorable facts from this conversation that ${jessName} should remember for future conversations.\n\n` +
    `Return ONLY a JSON array (no other text). Each item must have keys: memory_type, content, importance_score, tags. ` +
    `memory_type is one of: preference | health_pattern | emotional_context | explicit_statement | goal | follow_up. ` +
    `content is a concise 1-sentence memory. importance_score is 1-10. tags is a comma-separated keyword list. ` +
    `Only extract things genuinely worth remembering (importance >= 5). Return [] if nothing is memorable.`;

  let convo = null;
  try {
    convo = await base44.agents.createConversation({ agent_name: "personal_assistant" }).catch(() => null);
  } catch { /* swallow */ }
  if (!convo?.id) return { extracted: 0, reason: "no-agent-convo" };

  let fullText = "";
  let unsub = null;
  try {
    const c = await base44.agents.getConversation(convo.id);
    await base44.agents.addMessage(c, {
      role: "user",
      content: `[SYSTEM]\n${systemLine}\n\n[CONVERSATION]\n${turns}`,
    });
    // Collect the streamed reply. Each event delivers the FULL message
    // list, so we grab the last assistant message's content.
    fullText = await new Promise((resolve) => {
      const seen = new Set();
      let latest = "";
      let settled = false;
      unsub = base44.agents.subscribeToConversation(convo.id, (data) => {
        const list = data?.messages || [];
        for (const m of list) {
          if (m?.role !== "assistant" || !m?.id) continue;
          const txt = String(m.content || "").trim();
          if (!txt) continue;
          latest = txt;
        }
      });
      // 8 s budget — extractor usually returns in <3 s.
      window.setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve(latest);
      }, 8000);
    });
  } catch { /* swallow — fullText stays "" */ }
  finally { try { unsub?.(); } catch {} }

  if (!fullText) return { extracted: 0, reason: "no-llm-reply" };

  // Parse — the model may wrap the array in prose, so extract the first
  // [ ... ] block.
  let memories = [];
  try {
    const m = fullText.match(/\[[\s\S]*\]/);
    if (!m) throw new Error("no JSON array");
    memories = JSON.parse(m[0]);
    if (!Array.isArray(memories)) throw new Error("not an array");
  } catch (e) {
    return { extracted: 0, reason: "parse-error", err: String(e), raw: fullText.slice(0, 200) };
  }

  if (!memories.length) return { extracted: 0, reason: "empty-array" };
  if (!hasEntity) return { extracted: 0, reason: "no-entity", queued: memories.length };

  let written = 0;
  for (const m of memories) {
    const score = Number(m?.importance_score);
    if (!Number.isFinite(score) || score < 5) continue;
    const content = String(m?.content || "").trim();
    if (!content) continue;
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
    } catch { /* swallow per-row failure; continue */ }
  }
  return { extracted: written, considered: memories.length };
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

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

export async function callJessAgent({ system, user }) {
  if (!system || !user) return { text: "", error: "missing-input" };

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

// ─── Cache helpers ───────────────────────────────────────────────────────
export function loadDailyCache(key) {
  if (typeof window === "undefined" || !window.localStorage || !key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function saveDailyCache(key, value) {
  if (typeof window === "undefined" || !window.localStorage || !key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch { /* swallow quota */ }
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

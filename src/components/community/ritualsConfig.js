// ritualsConfig — Collective rituals + the shared-goal pool (Community Phase 4, §P.2.4/§P.2.5).
//
// Two shared, AGGREGATE-ONLY, never-per-person things:
//   1. The "together this week" pool — one shared count that only rises (gentle self-kindness
//      moments: rest, water, movement, a pause). No ranking, no streak, no per-person number.
//   2. "Close the week" — a soft weekly reflection; you leave one line, then see the room's
//      lines as an aggregate reveal (k-floored). No record of who skipped (the BeReal lesson).
//
// Period keys are the Monday of the current week (YYYY-MM-DD), computed the SAME way in the
// client and in the self-contained functions, so client + server agree without sharing code.

export const POOL_MOMENTS = [
  { key: "rest", label: "A moment of rest" },
  { key: "water", label: "A glass of water" },
  { key: "move", label: "A gentle stretch" },
  { key: "pause", label: "A mindful pause" },
];

export const POOL_DAILY_CAP = 8;          // generous per-device daily cap (anti-spam, not a goal)
export const REVEAL_K_FLOOR = 3;          // below this, no thin reveal — a gentle line instead

export const CLOSE_PROMPTS = [
  "What are you setting down as this week ends?",
  "What's one thing this week quietly gave you?",
  "What got you through, however small?",
  "What would you tell the version of you who started this week?",
];

// Monday of the week for a given date (YYYY-MM-DD) — deterministic, UTC, no locale drift.
export function weekKey(dateLike) {
  const d = dateLike ? new Date(dateLike) : new Date();
  const dow = (d.getUTCDay() + 6) % 7;     // 0 = Monday
  const mon = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow));
  return mon.toISOString().slice(0, 10);
}
export function closePromptForWeek(wk) {
  let h = 0; const s = wk || weekKey();
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return CLOSE_PROMPTS[h % CLOSE_PROMPTS.length];
}

// device-local: did I already close THIS week? (anonymous, like answeredQotd)
export const closedThisWeek = (wk) => { try { return localStorage.getItem("fw_close_" + wk) === "1"; } catch { return false; } };
export const markClosedWeek = (wk) => { try { localStorage.setItem("fw_close_" + wk, "1"); } catch { /* ignore */ } };

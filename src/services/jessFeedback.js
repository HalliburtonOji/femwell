// jessFeedback — Jess v2 J2-7
//
// Lightweight per-user feedback ring: stores the last N (default 5)
// ratings the user gave on Jess's replies. Used for two things:
//
//   1. UI    — paint the thumbs row in the chat to reflect prior
//              feedback on a given message (so it doesn't reset on
//              re-render).
//   2. Bias  — `feedbackDirective(rows)` returns a short system-prompt
//              line that the chat shell injects on the NEXT outgoing
//              user message. This biases Jess's tone without burying
//              the agent in long history.
//
// Storage is localStorage only (no entity). Five rows is enough to
// shape near-term tone; older feedback ages out automatically.

const MAX_HISTORY = 5;

function lsKey(userId) {
  return `jess_feedback_history_${userId || "anon"}`;
}

function safeReadArr(key) {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : [];
  } catch { return []; }
}

function safeWrite(key, value) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* swallow quota */ }
}

// Record a thumbs-up / thumbs-down. `reason` is only meaningful for
// thumbs-down (one of REASONS keys); thumbs-up calls leave it null.
// Returns the new history list.
export function recordFeedback(userId, { messageText, rating, reason }) {
  if (!userId || (rating !== "up" && rating !== "down")) return null;
  const key = lsKey(userId);
  const prev = safeReadArr(key);
  const row = {
    rating,
    reason: rating === "down" ? (reason || null) : null,
    snippet: String(messageText || "").slice(0, 160),
    ts: Date.now(),
  };
  // Newest first; cap to MAX_HISTORY.
  const next = [row, ...prev].slice(0, MAX_HISTORY);
  safeWrite(key, next);
  return next;
}

export function loadRecentFeedback(userId) {
  return safeReadArr(lsKey(userId));
}

// Three-option quick-reply set for thumbs-down. Single source of truth
// so the UI + the directive stay in sync.
export const REASONS = {
  generic: { label: "Too generic",     hint: "be specific to the user's situation, not generic" },
  tone:    { label: "Wrong tone",      hint: "match the user's emotional register more carefully" },
  miss:    { label: "Missed the point", hint: "address the user's actual question directly" },
};

export function reasonLabel(key) {
  return REASONS[key]?.label || "";
}

// Build a single system-prompt line summarising the user's recent
// feedback. Returns "" if there's nothing to say. Aggregates by reason
// so we don't emit duplicate hints.
export function feedbackDirective(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const downReasons = new Set();
  let downCount = 0;
  let upCount = 0;
  for (const r of rows.slice(0, MAX_HISTORY)) {
    if (r?.rating === "down") {
      downCount += 1;
      if (r.reason && REASONS[r.reason]) downReasons.add(r.reason);
    } else if (r?.rating === "up") {
      upCount += 1;
    }
  }
  if (downReasons.size === 0 && downCount === 0) return ""; // all positive
  const hints = [...downReasons].map((k) => REASONS[k].hint);
  // Pad with a generic "the user wasn't happy" when they thumbs-downed
  // without picking a reason (covers the close-without-tagging case).
  if (hints.length === 0) {
    return "[FEEDBACK NOTE] The user marked your last reply as unhelpful. Try harder to be specific and useful this time.";
  }
  return `[FEEDBACK NOTE] Recent user feedback (last ${downCount} reply${downCount === 1 ? "" : "s"}): ` +
    hints.join("; ") + ". Apply these adjustments without naming the feedback.";
}

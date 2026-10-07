// readingActivity — anonymous reading-act helpers for Books & Book Clubs (Phase 1).
//
// Two jobs:
//   1. Device-local, date-stamped chapter-progress keys (`fw_read_<bookId>_<chapter>` = today's
//      "yyyy-MM-dd") that nourish the companion garden's `reading` day-set — anonymity-safe, no
//      user_id ever written locally.
//   2. ANONYMOUS community aggregates (guess-the-next-chapter predictions + shared-read cohort
//      milestones) via the ReadingActivity entity, keyed only by a device-derived author_hash.
//
// Progress remains local-first/fire-and-forget so reading is never blocked.
// A prediction is a sent message: confirm its bounded write before marking sent
// or clearing the draft. Aggregate reads remain guarded and fail open.

import { base44 } from "@/api/base44Client";
import { communityHash } from "@/components/community/communityAnon";
import { REVEAL_K_FLOOR } from "@/components/community/ritualsConfig";
import { withTimeout } from "@/utils/safeEntity";

export { REVEAL_K_FLOOR };

function todayISO() {
  try { return new Date().toISOString().slice(0, 10); } catch { return ""; }
}
const readKey = (bookId, chapterIndex) => `fw_read_${bookId}_${chapterIndex}`;

// ── 1. Device-local chapter progress (feeds the garden's `reading` day-set) ──────────────────
// Write a date-stamped key the moment a chapter is reached / a prompt is answered. Idempotent
// per day: only stamps once (keeps the first day this chapter was read, like garden day-sets).
export function markChapterRead(bookId, chapterIndex) {
  if (bookId == null || chapterIndex == null) return;
  try {
    const k = readKey(bookId, chapterIndex);
    if (!localStorage.getItem(k)) localStorage.setItem(k, todayISO());
  } catch { /* ignore — best-effort */ }
}
export function hasReadLocally(bookId, chapterIndex) {
  try { return !!localStorage.getItem(readKey(bookId, chapterIndex)); } catch { return false; }
}

// Collect every local `fw_read_*` day into a Set<"yyyy-MM-dd"> — the garden reads this to build
// its `reading` area day-set. Tolerant of malformed values; only keeps real ISO dates.
export function readingDaySet() {
  const s = new Set();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("fw_read_")) continue;
      const v = localStorage.getItem(k);
      if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) s.add(v);
    }
  } catch { /* ignore */ }
  return s;
}

// ── per-device dedup flags (anonymous, like QOTD / games) ────────────────────────────────────
const predictedKey = (bookId, chapterIndex) => `fw_read_pred_${bookId}_${chapterIndex}`;
export function hasPredicted(bookId, chapterIndex) {
  try { return localStorage.getItem(predictedKey(bookId, chapterIndex)) === "1"; } catch { return false; }
}
function markPredicted(bookId, chapterIndex) {
  try { localStorage.setItem(predictedKey(bookId, chapterIndex), "1"); } catch { /* ignore */ }
}

// ── 2a. Progress row — anonymous "I reached chapter N" (feeds cohort milestones) ─────────────
// Optimistic local mark FIRST (markChapterRead), then a guarded fire-and-forget create. One
// progress row per device per chapter (the local read-key guards re-fires across sessions).
export function recordProgress(bookId, chapterIndex, userId) {
  const firstTime = !hasReadLocally(bookId, chapterIndex);
  markChapterRead(bookId, chapterIndex); // local, synchronous, idempotent
  if (!firstTime || !userId) return;     // only emit one anonymous progress row, ever
  (async () => {
    try {
      const wh = await communityHash(userId);
      if (!wh) return;
      // Hardened: write via the createCommunityPost dispatcher (asServiceRole; ReadingActivity
      // RLS-locked to admin) so the row carries no user id. Fire-and-forget, fail-open.
      await base44.functions.invoke("createCommunityPost", {
        action: "readingActivity.record",
        author_hash: wh, book_id: String(bookId), chapter_index: chapterIndex,
        kind: "progress", body: "",
      }).catch(() => null);
    } catch { /* fail-open — the local read-key already nourishes the garden */ }
  })();
}

// ── 2b. Prediction — "guess the next chapter" (anonymous, aggregate-only) ─────────────────────
// Confirm the existing aggregate write before marking sent. Crisis-checking the
// text is the caller's responsibility (reuse the existing crisisCheck) BEFORE calling this.
export async function recordPrediction(bookId, chapterIndex, body, userId) {
  if (!userId) throw new Error("Sign in before sharing a hunch.");
  const me = await withTimeout(base44.auth.me(), 6000, "prediction-owner");
  if (me?.id !== userId) throw new Error("Reading account changed.");
  const wh = await withTimeout(communityHash(userId), 6000, "prediction-session");
  if (!wh) throw new Error("Couldn't identify this reading session.");
  const sender = await withTimeout(base44.auth.me(), 6000, "prediction-owner");
  if (sender?.id !== userId) throw new Error("Reading account changed.");
  const result = await withTimeout(base44.functions.invoke("createCommunityPost", {
        action: "readingActivity.record",
        user_id: userId, author_hash: wh, book_id: String(bookId), chapter_index: chapterIndex,
        kind: "prediction", body: String(body || "").slice(0, 600),
      }), 8000, "prediction-send");
  const data = result?.data ?? result;
  if (data?.ok !== true || data?.error) throw new Error("Couldn't confirm the hunch.");
  const current = await withTimeout(base44.auth.me(), 6000, "prediction-owner");
  if (current?.id !== userId) throw new Error("Reading account changed.");
  markPredicted(bookId, chapterIndex);
  return { ok: true };
}

// ── 2c. Club reflection — a reflection shared "to the room" (anonymous) ───────────────────────
// Same optimistic + fire-and-forget shape. Crisis-check BEFORE calling.
export function recordClubReflection(bookId, chapterIndex, body, userId) {
  if (!userId) return;
  (async () => {
    try {
      const wh = await communityHash(userId);
      if (!wh) return;
      await base44.functions.invoke("createCommunityPost", {
        action: "readingActivity.record",
        author_hash: wh, book_id: String(bookId), chapter_index: chapterIndex,
        kind: "club_reflection", body: String(body || "").slice(0, 600),
      }).catch(() => null);
    } catch { /* fail-open */ }
  })();
}

// ── reads (guarded, fail-open) ───────────────────────────────────────────────────────────────
// Cohort milestone: how many DISTINCT anonymous readers have reached >= chapterIndex. Returns a
// k-floored count, or null when below the floor (caller shows a warm line, never a number).
export async function cohortReachedCount(bookId, chapterIndex) {
  try {
    // Hardened: the aggregate is computed server-side by the createCommunityPost dispatcher
    // (asServiceRole) and returned already k-floored — the client never reads raw rows.
    const res = await base44.functions
      .invoke("createCommunityPost", { action: "readingActivity.cohort", book_id: String(bookId), chapter_index: chapterIndex })
      .catch(() => null);
    const data = res?.data ?? res ?? {};
    return typeof data?.count === "number" ? data.count : null;
  } catch { return null; }
}

// Prediction aggregate for {bookId, chapterIndex}: the distinct anonymous guesses, returned ONLY
// when there are at least REVEAL_K_FLOOR of them (warm whole, never whose-was-right). Dedups by
// author_hash (one guess per reader counts once). Returns [] below the floor.
export async function predictionAggregate(bookId, chapterIndex) {
  try {
    // Hardened: dispatcher returns only the warm, k-floored guess lines — never raw rows.
    const res = await base44.functions
      .invoke("createCommunityPost", { action: "readingActivity.prediction", book_id: String(bookId), chapter_index: chapterIndex })
      .catch(() => null);
    const data = res?.data ?? res ?? {};
    return Array.isArray(data?.lines) ? data.lines : [];
  } catch { return []; }
}

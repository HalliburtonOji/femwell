// chapterWarnings — per-book / per-chapter content notes for Books & Book Clubs (Phase 2).
//
// Extends the existing book-level `trigger_warnings` "gentle heads-up" pattern (bookClubConfig)
// down to the CHAPTER level. A warning for chapter i is a calm, NON-spoiling note shown at the
// chapter boundary BEFORE the heavy content lands — warm, never alarmist, never blocking. It is
// a heads-up, not a wall: the reader simply continues (or dismisses it). It never names the
// event, only the shape of it ("serious illness", "loss") so the note itself can't spoil ahead.
//
// Keyed bookId (string; the Gutenberg id for Library / Book Club reads) -> chapterIndex (0-based,
// matching the reader's currentIndex) -> { note }. A book / chapter with no entry simply has no
// heads-up — frictionless, never a "missing" state. Seeded for the SEED_PICK (Little Women,
// Gutenberg 514): the tender stretch around Beth's illness, mirroring the book-level note.

// Map: bookId (string) -> { chapterIndex: { note } }
export const CHAPTER_WARNINGS = {
  // Little Women — Louisa May Alcott (SEED_PICK.gutenberg_id = "514").
  // Beth's illness gathers across the middle chapters; the note is placed where it begins to
  // weigh, phrased so it never gives away who, or how it ends.
  "514": {
    14: { note: "This stretch turns tender — there's serious illness in a family, handled gently. If that's close for you right now, take it at your own pace." },
    17: { note: "A hard, quiet chapter about illness and worry in the family. No rush — it's here whenever you're ready." },
  },
};

// Return the authored chapter note for a given book + chapter index, or null. Pure +
// spoiler-safe: the note for chapter i describes only the shape of chapter i, never beyond.
export function warningFor(bookId, chapterIndex) {
  if (bookId == null || chapterIndex == null) return null;
  const byChapter = CHAPTER_WARNINGS[String(bookId)];
  if (!byChapter) return null;
  return byChapter[chapterIndex] || null;
}

// Does this book have ANY authored chapter warnings? Lets a caller skip the feature cleanly.
export function hasWarnings(bookId) {
  return bookId != null && !!CHAPTER_WARNINGS[String(bookId)];
}

// device-local "I've seen this chapter's heads-up" flag (anonymous, like the other reader flags
// in readingActivity.js / bookClubConfig.js — never an entity, no user_id). A heads-up is shown
// once per chapter per device: dismissing it is remembered so it never nags on a re-read.
const seenKey = (bookId, chapterIndex) => `fw_read_warn_${bookId}_${chapterIndex}`;
export function hasSeenWarning(bookId, chapterIndex) {
  try { return localStorage.getItem(seenKey(bookId, chapterIndex)) === "1"; } catch { return false; }
}
export function markWarningSeen(bookId, chapterIndex) {
  try { localStorage.setItem(seenKey(bookId, chapterIndex), "1"); } catch { /* ignore */ }
}

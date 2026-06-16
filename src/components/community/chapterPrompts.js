// chapterPrompts — projective / empathy prompts shown at a chapter boundary in the reader
// (Books & Book Clubs, Phase 1). Authored, spoiler-safe, calm. Keyed bookId -> chapterIndex ->
// { prompt }. A prompt for chapter i only ever references events up to AND INCLUDING chapter i,
// never beyond — so showing it the moment a reader REACHES chapter i can never spoil ahead.
//
// bookId is the reader's per-book key. For Library / Book Club reads it is the Gutenberg id as
// a STRING (BookReader passes gutenberg_id). chapterIndex is 0-based, matching the reader's
// currentIndex (chapter 1 in the UI = index 0).
//
// No counts, no scores — these are quiet invitations to reflect, never a quiz with right answers.
// Seeded for the Book Club SEED_PICK (Little Women, Gutenberg 514). Other books simply have no
// prompts yet and the card stays absent — frictionless, never a "missing" state.

// Map: bookId (string) -> { chapterIndex: { prompt } }
export const CHAPTER_PROMPTS = {
  // Little Women — Louisa May Alcott (SEED_PICK.gutenberg_id = "514").
  "514": {
    0: { prompt: "Four sisters meet a hard winter, each in her own way. Which one did you recognise first — in yourself, or in someone you love?" },
    1: { prompt: "A small kindness opens this chapter where money is tight. When has someone's generosity landed on you when you least expected it?" },
    2: { prompt: "Plans for a quiet, happy day rarely survive a houseful of sisters. What does a good ordinary day look like for you?" },
    3: { prompt: "Jo would rather write than be agreeable. Where in your own life do you choose the truer thing over the easier one?" },
    4: { prompt: "Burdens feel different when they're named aloud together. What's one you've been carrying quietly lately?" },
    5: { prompt: "A door is opened that had been walked past many times. If you were her, would you have stepped through — or left it closed?" },
  },
};

// Return the authored prompt for a given book + chapter index, or null. Pure + spoiler-safe:
// the caller must only request chapters the reader has already reached.
export function promptFor(bookId, chapterIndex) {
  if (bookId == null || chapterIndex == null) return null;
  const byChapter = CHAPTER_PROMPTS[String(bookId)];
  if (!byChapter) return null;
  return byChapter[chapterIndex] || null;
}

// Does this book have ANY authored prompts? Lets a caller skip the whole feature cleanly.
export function hasPrompts(bookId) {
  return bookId != null && !!CHAPTER_PROMPTS[String(bookId)];
}

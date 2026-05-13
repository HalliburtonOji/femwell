# Lucha build — 2026-05-11

Three sequential base44 MPs. Paste in order. Each MP is self-contained; do NOT
combine them (Lucha hit base44's prompt-size ceiling combining work like this
on 2026-05-10).

Source of truth for all three: github.com/HalliburtonOji/femwell @ main.
Lucha's commits are already pushed: `8ab89e7`, `787e638`, `f234be3`.

## Order

1. **mp_a_daily_story_reader** — Daily Story Kindle reader
   - Adds `src/components/lifestyle/DailyStoryReader.jsx`
   - Updates `src/pages/Lifestyle.jsx` (DailyStoryTab wires to reader)
   - User-facing: the 30-chapter "The Long Room" arc renders as a flipbook,
     drop cap on each chapter, 3D page-curl on tap/swipe/arrow keys, locked
     cliffhanger screen on next-not-yet-published chapter with countdown.

2. **mp_b_bugfixes_3d_filter** — Polish + filter Option B
   - 8 small edits across Lifestyle UI
   - User-facing: article hero title clips properly (3 lines), cards get 3-
     layer shadow + hover lift, second chip row replaced by a single filter
     icon (Option B from Atelier 2026-05-11), expandContent prompt is 20%
     shorter and writes Year-9 plain English.

3. **mp_c_gutenberg_book_reader** — In-app book reader
   - Adds `src/pages/BookReader.jsx`
   - Adds `base44/functions/fetchGutenbergBook/entry.ts`
   - Updates `src/components/lifestyle/browse/BooksGrid.jsx` (route Gutenberg
     books into BookReader instead of external bookshop link)
   - Updates `src/pages.config.js` (register BookReader route)
   - User-facing: tapping a Project Gutenberg pick on Browse → Books opens
     the book in the same Kindle-style reader, chapters paginated, source
     attribution at the bottom of every chapter.

## How to apply

For each MP folder:

1. Open the corresponding `MP_PROMPT.md` in this directory and paste it into
   base44 chat for the FemWell app.
2. Drop the file(s) listed in the MP into base44 alongside the prompt — the
   chat agent will accept them as "here is the new content for this path".
3. Wait for base44 to confirm success, then **publish to live**.
4. Verify on femwells.com before pasting the next MP.

If base44 hangs or returns a size error, paste only the prompt summary and
have it pull files one at a time.

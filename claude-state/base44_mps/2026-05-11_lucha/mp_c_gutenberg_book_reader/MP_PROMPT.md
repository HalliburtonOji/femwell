# MP-Lucha-C — Gutenberg in-app book reader

**App:** FemWell (`69a9891a6ccccc1822bbb4bc`)
**Author:** Halliburton
**Goal:** Project Gutenberg book picks on Browse → Books currently link out
to bookshop.org / external sites. Replace that behaviour with an **in-app
book reader** that fetches the public-domain text from Gutendex, paginates
into chapters, and renders in the same Kindle-style UI as Daily Story —
with source attribution at the bottom of every page.

## What to do

1. **Create** new file `base44/functions/fetchGutenbergBook/entry.ts` — see
   provided file `fetchGutenbergBook_entry.ts` (127 lines).
   - Public function (no auth required).
   - Input: `{ gutendex_id: number }`.
   - Calls `https://gutendex.com/books/{id}` to resolve the plain-text URL.
   - Fetches the plain-text file (UTF-8) and strips Project Gutenberg's
     header / footer using the standard `*** START OF...` / `*** END OF...`
     markers.
   - Splits into chapters using regex `/\n\s*(CHAPTER|Chapter)\s+[IVXLC\d]+[^\n]*\n/g`.
     If no chapters detected, falls back to fixed 2500-word pages.
   - Returns `{ title, author, chapters: [{ heading, body }], source_url,
     license_note }` where `license_note` is "Provided by Project
     Gutenberg under the Project Gutenberg License."
   - Cache the result keyed by `gutendex_id` for 30 days in
     `BookContentCache` (entity name; create-on-write — see schema below).

2. **Add entity schema** `BookContentCache`:
   - `gutendex_id` (number, unique, required)
   - `title` (string)
   - `author` (string)
   - `chapters_json` (string) — JSON-stringified chapter array
   - `source_url` (string)
   - `cached_at` (datetime)

3. **Create** new page `src/pages/BookReader.jsx` — see provided file.
   - Route: `/BookReader?gutendex_id=…`
   - Calls `fetchGutenbergBook` on mount.
   - Renders chapters in the same Kindle UI as `DailyStoryReader` (flip,
     drop cap, page count). At the bottom of every chapter, a small italic
     attribution line: *"From [title] by [author]. Provided by Project
     Gutenberg, public domain. Read at gutenberg.org →"* — the URL is
     `https://www.gutenberg.org/ebooks/{id}`.
   - No locked screen — all chapters are available immediately.

4. **Update** `src/pages.config.js` to register `BookReader` (2-line add).

5. **Update** `src/components/lifestyle/browse/BooksGrid.jsx` — when a book
   card with `source === 'project_gutenberg'` is tapped, navigate to
   `/BookReader?gutendex_id={book.gutendex_id}` instead of opening the
   external URL. FemWell Original picks continue to route to their existing
   article reader.

## Acceptance

- Browse → Books tab shows the existing Gutenberg picks.
- Tapping *Pride and Prejudice* (or any Gutenberg pick) opens the in-app
  reader at chapter 1 with FemWell's cream/plum styling.
- Flipping works exactly as Daily Story (tap halves, swipe, arrow keys).
- Attribution line is present at the bottom of every page.
- The first fetch of a book caches into `BookContentCache`; the second open
  is instant.

## Order of operations within this MP

Per Halliburton's 2026-05-10 memory ("don't combine invoke external function
+ schema change + code edit + re-invoke in one prompt — base44 hangs"):

1. Add the `BookContentCache` entity schema first.
2. Wait for confirmation.
3. Then add `fetchGutenbergBook` + `BookReader` + `pages.config.js` +
   `BooksGrid.jsx` together.

After build, publish to live, then open Browse → Books → tap a Gutenberg
pick and confirm the in-app reader appears.

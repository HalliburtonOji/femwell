# MP-Lucha-A — Daily Story Kindle reader

**App:** FemWell (`69a9891a6ccccc1822bbb4bc`)
**Author:** Halliburton
**Goal:** Replace the day-by-day card layout on Lifestyle → Daily Story with
a Kindle-style flipbook reader for the active 30-chapter arc ("The Long
Room"). One chapter per screen, drop cap, 3D page-curl flip, locked
cliffhanger screen on the next-not-yet-published chapter with a countdown.

## What to do

1. **Create** new file `src/components/lifestyle/DailyStoryReader.jsx` — use
   the content provided alongside this prompt (file `DailyStoryReader.jsx`,
   638 lines). Component name: `DailyStoryReader`. Default export. Accepts
   props `source` (ReaderSource: `{ kind, seriesKey?, totalCount? }` —
   defaults to `{ kind: 'daily_story', seriesKey: 'the_long_room',
   totalCount: 30 }`). Internally fetches `DailyStory` records where
   `series_key === source.seriesKey` and `is_active === true`, sorts by
   `day_number`, paginates by chapter, renders a flipbook with rotateY page
   curl on tap / swipe / arrow keys, ornament rule under the heading, drop
   cap on the first paragraph, locked cliffhanger screen with countdown to
   local midnight when the reader pages past the latest revealed chapter.
   Respects `prefers-reduced-motion` (cross-fade instead of flip).

2. **Replace** the JSX body of `DailyStoryTab` inside `src/pages/Lifestyle.jsx`
   so that it returns only `<DailyStoryReader />` (the old day-card list is
   parked as a non-rendered `_LegacyDailyStoryTab` for now). Add the import
   at the top of `Lifestyle.jsx`:

   ```js
   import DailyStoryReader from "@/components/lifestyle/DailyStoryReader";
   ```

   The full updated `Lifestyle.jsx` content is provided alongside this
   prompt (file `Lifestyle.jsx`). Use it verbatim if dropping the whole file
   is easier than diffing.

## Data dependencies (already in place — do not change)

- `DailyStory` entity has fields: `series_key`, `series_title`, `day_number`,
  `segment_text`, `cliffhanger`, `published_date`, `is_active`.
- 30 active records exist with `series_key === 'the_long_room'`,
  `day_number` 1–30, `published_date` from 2026-05-11 to 2026-06-09.
- Older "Borrowed Light" rows have `is_active: false` and should be ignored.

## Acceptance

- Mobile / tablet / desktop: tapping right half advances a page; left half
  goes back. Swipe left / right works. Arrow keys work on desktop.
- Chapter 1 is visible on first load. Page count badge bottom-centre shows
  `Chapter N / 30`.
- Flipping past the latest-published chapter lands on a dark plum gradient
  page with the previous chapter's cliffhanger text, a `HH:MM:SS` countdown
  to local midnight, and a small lock icon at the right edge hinting a
  curled page.
- Drop cap on first paragraph (large Fraunces capital).
- Ornament rule below the chapter heading.
- No emojis anywhere — Lucide icons + SVG only.
- `prefers-reduced-motion: reduce` users get a 200ms cross-fade instead of
  rotateY.

## Skip until later

The reader is generic and accepts a `ReaderSource` contract — but for this
MP only the `daily_story` kind is wired up. The book / article kinds will
land in a subsequent MP (MP-Lucha-C).

After build, publish to live and check `/Lifestyle` → Daily Story tab.

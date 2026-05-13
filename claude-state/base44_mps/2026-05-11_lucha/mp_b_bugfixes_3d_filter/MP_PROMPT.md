# MP-Lucha-B — Article hero fix · expandContent prompt · 3D card depth · Filter row Option B

**App:** FemWell (`69a9891a6ccccc1822bbb4bc`)
**Author:** Halliburton
**Goal:** Four bundled polish items from Atelier 2026-05-11 review and
Halliburton's live walk. No new files. No schema changes. Eight files edited.

## Changes

1. **`src/pages/LifestyleDetail.jsx`** — Hero block: clamp the article title
   to **3 lines** with `-webkit-line-clamp: 3`, `display: -webkit-box`,
   `-webkit-box-orient: vertical`, and set the hero container `min-height:
   320px` so a long title can't push the action row out of the visible area.
   Reproduces fix for the *"Treat and Disguise Them for Good"* clipping the
   user reported on 2026-05-10.

2. **`base44/functions/expandContent/entry.ts`** — Shorten the article
   generation prompt. Word-count windows go from `700–900 / 500–700` to
   `560–720 / 600–800` (~20% trim). Add three guardrails to the prompt:
   - "Write at a Year-9 UK reading level. Replace any 5-syllable word with a
     2-syllable substitute where the meaning is unchanged."
   - "Do not output Markdown. No `**bold**` markers. No `## headings`. Use
     plain prose with short paragraphs."
   - "Never invent statistics. If you mention a number, source it from
     official UK bodies (NHS, ONS, NICE)."
   Drop in the full updated file `expandContent_entry.ts` alongside this
   prompt — it's an 18-line delta but easiest to paste as a whole.

3. **3D card depth** — Three components get a 3-layer shadow stack
   (close + mid + far) and a desktop-only hover lift (3px up + rotateX 0.5°
   on 1000px perspective):
   - `src/components/lifestyle/LifestyleCard.jsx`
   - `src/components/lifestyle/foryou/BentoGrid.jsx`
   - `src/components/lifestyle/foryou/EditorialHero.jsx`
   
   Mobile and reduced-motion users see the static shadow stack only — no
   hover transform. Use the files provided.

4. **Filter row Option B (Atelier sign-off)** — Replace the current second
   chip row (CategoryChips, 11 chips wrapping ugly on mobile) with **one
   right-aligned filter icon** (Lucide `SlidersHorizontal`, 20px). Tap opens
   a 260px popover with a checkbox list of categories. Multi-select.
   Selected count badge on the icon. "Clear" button when ≥1 selected.
   - State change: `categoryFilter` is now a `string[]` (array of category
     slugs), not a string.
   - Downstream: `matchCategoryFilter` in `ForYouTab` checks
     `arr.length === 0 || arr.includes(item.category)`.
   - `BrowseTab`'s base44 list query passes `category` as `{$in: arr}` when
     non-empty.
   - `ListenTab` unaffected (doesn't use category state in its grid query).
   
   Files touched:
   - `src/pages/Lifestyle.jsx` (state, popover, top bar wiring)
   - `src/components/lifestyle/foryou/ForYouTab.jsx`
   - `src/components/lifestyle/browse/BrowseTab.jsx`
   
   Drop in the provided full-file replacements.

## Acceptance

- **LifestyleDetail**: open the article *"Treat and Disguise Them for Good"*.
  Title shows 3 lines max, ellipsised. Action row visible without scroll on
  iPhone 13 mini width (375px).
- **expandContent**: trigger generation of a new article (any FemWell
  Original). Body is 600–800 words on a featured piece (or 560–720 on a
  standard piece). No `##` or `**` in the rendered output.
- **3D depth**: ForYou cards have a visible 3-layer shadow at rest. Desktop
  hover lifts the card. Mobile / reduced-motion: no hover transform.
- **Filter Option B**: ForYou and Browse tabs no longer show the second chip
  row. A single filter icon sits at the top-right of the chip strip. Tapping
  it opens a popover with category checkboxes. Selecting 2 categories shows
  a "2" badge on the icon and filters the grid to those two.

After build, publish to live and verify all four items.

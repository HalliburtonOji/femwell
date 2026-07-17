# Research — Piece D: 2-col small-card / signal-tile grid on a 390px board — 2026-07-17

## Question
Piece D converts one large prompt card into a scrollable 2-col grid of ~5–8 small
"focused" cards (icon + label + one real one-line signal) inside a fixed ~430px shelf
half on a 390px surface. Each tile opens an in-board overlay or does a tick-in-place
write. What are the sourced best practices, and what should I get right that's easy to
get wrong?

## Sources consulted (all fetched 2026-07-17)
- W3C WCAG 2.2 Understanding SC 2.5.8 Target Size (Minimum, AA) — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- W3C WCAG 2.2 Understanding SC 2.5.5 Target Size (Enhanced, AAA) — https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- Google/Android Accessibility — touch target 48dp — https://support.google.com/accessibility/android/answer/7101858
- NNG, Cards: UI-Component Definition — https://www.nngroup.com/articles/cards-component/
- NNG, Information Scent — https://www.nngroup.com/articles/information-scent/
- NNG, Carousels on Mobile Devices — https://www.nngroup.com/articles/mobile-carousels/
- Baymard, Avoid Inline Scroll Areas (26% Get It Wrong) — https://baymard.com/blog/inline-scroll-areas
- Apple HIG (44pt is the long-standing platform minimum; page body didn't render on fetch — see caveat in Q2)

---

## THE BRIEF — paste under "what the research says / what I'm ADDING beyond the ask"

### Q1 — 2-col grid vs horizontal slider; tile size & gutter
- A grid beats a carousel the moment scannability matters: carousels are sequential-access,
  "most people stop after viewing 3–4 different pages," and dots are "generally weak
  signifiers" many users never notice (source: NNG mobile-carousels). With 5–8 tiles a
  swiped rail would hide half of them; a grid shows all at once → use the grid. NNG's
  explicit rule: "If you have a high number of items, use a list view instead and allow
  people to directly access any of the items" — a 2-col grid is that direct-access format
  (source: NNG mobile-carousels).
- Cost of cards vs a list: cards "consume more space… any given screen size can't show as
  many cards as a list," raising short-term-memory load on small screens — so keep the tile
  copy to "a few short, related pieces of information," not a mini-article (source: NNG
  cards-component). Two columns is the right density ceiling for 390px; do not go 3-col.
- Tile min height / aspect ratio / gutter: **no hard UX-lab number exists for tile aspect
  ratio — this is a taste/brand call, flag it as such.** The one HARD floor is the tap
  target (Q2): at 390px with 16px board padding + a 12px gutter, each column is ~167px wide,
  so height is the only variable you must defend. Keep every tile ≥ 48px tall (target floor)
  and in practice ≥ 64–72px so icon + label + signal line breathe. Gutter: Material's 8dp
  inter-target spacing is the evidenced minimum (source: Android a11y); 12–16px reads
  cleaner on cream — the exact value is taste, the ≥8px floor is evidence.

### Q2 — touch-target numbers (cite these verbatim)
- **WCAG 2.2 SC 2.5.8 (AA): "at least 24 by 24 CSS pixels."** A sub-24px target still passes
  only if a 24px-diameter circle centred on each doesn't intersect a neighbour's (spacing
  exception) (source: WCAG 2.5.8). This is the legal-ish floor for the UK build.
- **WCAG 2.2 SC 2.5.5 (AAA): "at least 44 by 44 CSS pixels."** (source: WCAG 2.5.5).
- **Android/Material: "at least 48x48dp, separated by 8dp of space or more"** (source:
  Android a11y).
- **Apple HIG: 44x44pt** is the long-standing platform minimum. CAVEAT: the HIG page body
  did not render on today's fetch, so treat 44pt as well-established-but-not-freshly-verified
  rather than a clean 2026-07-17 quote; WCAG 2.5.5's 44px is the citable twin.
- **Verdict for Piece D:** a full-card tap target is the whole tile. At ~167px wide × ≥64px
  tall it clears 48dp (Material), 44px (AAA/Apple) AND 24px (AA) with huge margin. You are
  safe — the ONLY way to fail is putting a *second* small tap target (a tick button, a "×")
  inside the tile under 24px or within 24px of the card's own hit edge. Keep any in-tile
  control ≥24px and ≥8px clear of the card edge/other controls.

### Q3 — every tile carries a signal, not a bare label
- Evidence via information scent: a source's clickability estimate is driven by "the link
  label, the content that accompanies the link, the context… and background knowledge" —
  a bare icon+label is one weak cue; a one-line signal ("3 saved · 12 min") is the
  "summary text [that] conveys the gist… and adds detail to the link label," strengthening
  scent so users pick correctly and faster (source: NNG information-scent). Unclear/jargon
  labels make users "skip potentially relevant pages" — the signal line is your hedge
  against a mis-skip.
- NNG's card guidance reinforces it: a good card is a "summary that links to details,"
  i.e. it must preview, not just name (source: NNG cards-component). So "never a bare label"
  is EVIDENCED, not taste — keep the rule.
- WHERE TASTE ENTERS: the *specific* metric on each tile (count vs time vs streak vs "new")
  is a product call; evidence only says a truthful, gist-conveying preview beats none.
  Anti-pattern to avoid: a fake/placeholder signal — misleading cues "erode trust… users
  remember poor experiences" (source: NNG information-scent). If a tile has no real signal
  yet, show a genuine empty-state ("None saved yet"), not a decorative fake number.

### Q4 — nested vertical scroll inside a swiped board (the risk area)
- This is the highest-risk part of the pattern. Baymard: **26% of top sites get inline
  scroll areas wrong.** Documented failures: (a) scroll-hijack/conflict — the inner area
  eats the gesture, then "once the end of the area is reached, the whole webpage will begin
  scrolling"; (b) hidden content — OSs "hide scrollbars by default," and test users
  "leave… because they thought certain options simply weren't offered, when in fact the
  options were just cropped"; (c) nested-pane mental overhead tracking which region moves
  (source: Baymard inline-scroll-areas).
- Directly applicable because Piece D is a vertical scroll region INSIDE a horizontally-
  swiped board — a two-axis gesture conflict on top of Baymard's one-axis one.
- Mitigations the research supports: **signal "more below"** so cropping never reads as
  "that's all" — Baymard's core failure is invisible truncation. Use a visible fade/peek
  of the next row at the shelf's bottom edge (NNG's own carousel insight: a half-visible
  item is "a strong… cue" that content continues — source: NNG mobile-carousels), so a
  partially-clipped 5th/6th tile is the affordance. Prefer showing a clipped row over a
  clean cut. Where the item count is small, Baymard's stance is that **truncation beats a
  scroll area** — so if 5–8 tiles nearly fit, size the shelf to reveal a peeking row rather
  than a fully self-contained scroller, and keep total count low so scroll depth is 1–2 rows,
  not a long tunnel.

### Q5 — what you're most likely to get WRONG (the catch list)
1. **Invisible truncation = the #1 miss.** A fixed ~430px shelf that clips tile 6 with a
   clean edge → users conclude "5 tiles, done" (Baymard: users left thinking options didn't
   exist). MUST show a peeking partial row / fade. This is the equivalent of a prior pass's
   WCAG-A caption miss — a silent gap, not a visible bug.
2. **Two-axis gesture trap.** Vertical drag inside a horizontally-swiped board: a near-
   vertical swipe may page the board instead of scrolling the shelf (and vice-versa). Needs
   an explicit touch-action / gesture-threshold decision — flag for the build, verify on a
   real 390px device, not just resize.
3. **Nested tap target under the floor.** The card-wide tap is safe; a tick/close control
   INSIDE it under 24px, or within 8px of the card edge, silently fails WCAG 2.2 AA 2.5.8.
   Give in-tile controls ≥24px (aim 44px) + ≥8px clearance.
4. **Fake signal lines.** Placeholder metrics to make the grid look alive = trust erosion
   (NNG). Real signal or honest empty-state only.
5. **Tick-in-place with no state feedback.** A "real write that ticks in place" must visibly
   confirm AND the tile's signal line should update to reflect the new count/state — otherwise
   the write happened but scent is now stale (NNG: the signal is what carries the decision).
6. **Over-density.** 3 columns or crammed copy on 390px inflates memory load (NNG cards:
   fewer cards fit; short related info only). Hold at 2-col, one signal line, one icon.
7. **Sheet/overlay nav-clearance.** The in-board "choose" overlay is a sheet — per FemWell's
   sheet-nav-clearance contract it must use `.fw-sheet-safe` so its last control clears the
   floating nav (repo memory, not web-sourced — noted so it isn't missed).

### Taste-vs-evidence flags (explicit)
- EVIDENCE: 2-col grid > carousel for 5–8 scannable items; every tile carries a real signal;
  show a peek/fade for more-below; ≥24px (AA) / aim ≥44–48px targets; ≥8px target spacing;
  truthful signals only.
- TASTE / BRAND CALL (defend in the pass doc, not the research): exact tile aspect ratio &
  height beyond the ≥48–64px floor; gutter beyond the ≥8px floor (12–16px suggested); which
  metric each tile shows; icon set; fade vs scrollbar vs peeking-row as the "more" cue.

## Sentiment quotes
- None gathered — this pass is spec/standards research, not forum sentiment; no user quotes
  to cite, so none included rather than fabricate.

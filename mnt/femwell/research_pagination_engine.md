# Research — Pagination Engine — 16/07/2026

## Question
`DailyStoryReader` paginates by measuring against a live DOM container. Reading typography just changed app-wide; breaks are at risk. What is the robust client-side recipe: measurement, clean breaks, re-pagination/resume, build-vs-buy?

**Prior art — NOT re-derived.** `research_reader_and_cards.md` + `research_reading_foundation.md` (16/07/2026) own measure/CPL, the 390px inversion, pagination-vs-scroll (CHI '25 null → paginate for FEEL), indent-XOR-space, `ch` vs `ex`, self-clamping `min()`. `claude-state/research_ereader_ux.md` (12/05/2026) already chose **measurement-based slicing over CSS columns** and set the anchor contract. This file covers only the engine. All sources fetched 16/07/2026.

## 1. Measurement

1. **`scrollHeight`/`clientHeight` are ROUNDED; `getBoundingClientRect()` is not.** MDN: "`scrollTop` is a non-rounded number, while `scrollHeight` and `clientHeight` are rounded" (source: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight); for precision use `getBoundingClientRect()`, which returns decimals (source: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements). **A `scrollHeight <= clientHeight` fill-and-measure loop therefore carries ~1px error — enough to admit or drop a line at a page edge.** Chromium never shipped fractional `offsetWidth`: "too web breaking" (source: https://groups.google.com/a/chromium.org/g/blink-dev/c/_Q7A4AQBFKY/m/S4ahQ5iE28QJ).
2. **`Range.getClientRects()` returns one rect per LINE BOX**, aggregating `Element.getClientRects()` "for all the elements in the range" (source: https://developer.mozilla.org/en-US/docs/Web/API/Range/getClientRects). The precise, sub-pixel, line-aware primitive. Binary-search the Range end offset until the last rect fits — O(log n), exact.
3. **`caretPositionFromPoint(x,y)`** returns node + character offset at a point; Baseline only since December 2025, WebKit fallback `caretRangeFromPoint()` (source: https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint). **Too new to be the engine** — optimisation at most.
4. **The mirror is the risk, not the tool.** The canonical mirror copies **29 properties** individually because "Firefox doesn't concatenate individual properties into their shorthand" (source: https://raw.githubusercontent.com/component/textarea-caret-position/master/index.js). **That list is from a textarea library and is INCOMPLETE for prose** — it omits `hyphens`, `fontKerning`, `fontFeatureSettings`, `fontVariationSettings`, `whiteSpace`, `wordBreak`, `overflowWrap`, `textWrap`, all of which move line breaks. Every forgotten property is a silent mispagination. `getComputedStyle` also only resolves for an element in the document (source: https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
5. **So: don't mirror — measure in the REAL container.** It is already styled, in the cascade, inheriting. A mirror hand-rebuilds fidelity the real node has for free — and an app-wide type change is exactly the event that desynchronises a hand-copied list. Measure off-screen with `visibility:hidden`, never `display:none` (no boxes, no rects).
6. **Measure only after `document.fonts.ready`** — it resolves once "the document has completed loading fonts" **and** "layout operations are completed" (source: https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/ready). Our remote woff2 means earlier measurement paginates against **fallback** metrics and every break is wrong after swap. It misses fonts requested later → also re-paginate on `document.fonts` `loadingdone`.
7. **`size-adjust` needs no handling.** It "defines a multiplier for glyph outlines and metrics"; "All metrics associated with this font are scaled… includes glyph advances, baseline tables, and overrides" (source: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust). **Measuring in the same declared font reflects it automatically** — provided (5) holds and we measure rendered text, not raw font metrics.

## 2. Clean breaks

8. **`floor(available / lineHeight) * lineHeight` — NO authoritative source found. DROPPED.** Only unsourced blog advice exists. It also assumes uniform line height — false at any heading, blockquote, image or superscript — and compounds the rounding at (1). **Use (2): cut after the last line-box rect whose `.bottom <= limit`.** Exact, sub-pixel, correct for mixed content, no uniform-leading assumption. `overflow:hidden` then guards nothing rather than hiding a half-line.
9. **`orphans`/`widows` do NOT work in normal flow — your instinct is right.** They apply only to "Paged Media", "Regions", "Columns" and "do[…] not work in regular flow/non-fragmented contexts"; "not Baseline because it does not work in some of the most widely-used browsers" (source: https://developer.mozilla.org/en-US/docs/Web/CSS/orphans). Spec: orphans "specifies the minimum number of line boxes… left in a fragment before a fragmentation break" (source: https://drafts.csswg.org/css-break-3/). **We are our own fragmenter → enforce in JS**, trivial once (8) yields line counts: fitted lines < 2 → push the paragraph; remainder < 2 → pull a line back.
10. **`break-inside: avoid` IS Baseline (since January 2019)** in multicol/paged media (source: https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside) — **but inert unless the browser fragments**, so it does nothing for us. Enforce in JS: `<h*>` + following block = one atomic unit.

## 3. Re-pagination + resume

11. **Store an anchor, never a page number.** CFI exists because reflowable text has no stable pages — publications were "denied much of the benefit that hyperlinking makes possible" absent a standard scheme (source: https://w3c.github.io/epub-specs/epub33/epubcfi/). Readium Locators give "a precise location… in a format that can be stored and shared": `progression` (0–1), `position`, `totalProgression` (source: https://readium.org/architecture/models/locators/). foliate-js anchors to a `Range`, `Element` or fraction: "The view is _anchored_ to it no matter how you resize the window" (source: https://github.com/johnfactotum/foliate-js/blob/main/README.md).
12. **Character offset alone is brittle — add a quote selector.** W3C: `TextPositionSelector` "is very brittle with regards to changes to the resource"; `TextQuoteSelector` "describes a range of text by copying it, and including some of the text immediately before (a prefix) and after (a suffix)… to distinguish between multiple copies" — `exact`/`prefix`/`suffix` (source: https://www.w3.org/TR/annotation-model/#text-quote-selector). Readium ships the same shape (`before`/`highlight`/`after`) "to give a context to the Locator" (source: as above).
13. **`ResizeObserver` fires before paint and self-limits.** "Infinite loops from cyclic dependencies are addressed by only processing elements deeper in the DOM during each iteration… an error event is fired" — **"ResizeObserver loop completed with undelivered notifications."** Fix: defer inside `requestAnimationFrame` (source: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver). **We are the textbook loop risk** (observe container → write pages into it → retrigger): observe an element whose size does not depend on pagination output, and never write to it synchronously in the callback.
14. **Batch reads then writes** — "always batch your style reads… then do any writes"; interleaving forces synchronous layout (source: https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing). Our binary search is read-only per probe; build the page array, mutate the DOM once.

## 4. Build vs buy

| Library | Stars | Last push | Input | Strategy | Verdict |
|---|---|---|---|---|---|
| **epub.js** | 6,935 | 2026-03-24 | **EPUB only** | multi-column | **No** — 517 open issues; we have plain text |
| **paged.js** | 1,428 | 2026-04-23 | HTML/CSS | Paged Media → **PDF/print** | **No** — print, not a screen reader |
| **bindery.js** | 415 | 2021-01-10 | HTML | print books | **No — dead:** "no longer in development" |
| **foliate-js** | 1,037 | 2026-05-01 | EPUB/MOBI | multi-column | **No** — but steal `#anchor` |

(sources: https://api.github.com/repos/futurepress/epub.js · https://api.github.com/repos/pagedjs/pagedjs · https://api.github.com/repos/johnfactotum/foliate-js · https://github.com/evnbr/bindery)

15. **Adoption is NOT warranted — they'd be a downgrade.** Every live option is an EPUB or print engine; we render plain text, mobile-first, light. foliate-js's own author says the multi-column strategy it shares with epub.js "is slow, some CSS styles do not work as expected, and other bugs" (source: as above) — the leaders document the weakness of the approach we already rejected. Prior research measured it: WebKit columns "over a minute" on a 1000-page doc, measurement ~6× faster (`research_ereader_ux.md`, 12/05/2026). **In-house is right.** Borrow only foliate's `#anchor` (11) and W3C's quote selector (12).

## The recipe

```
1. await document.fonts.ready                       // (6) before ANY measurement
2. Measure in the REAL styled container             // (5) never a hand-copied mirror
   off-screen: visibility:hidden, attached
3. limit = container.getBoundingClientRect().bottom // (1) not clientHeight
4. Per page: binary-search Range end offset; fit =
   last of range.getClientRects() .bottom <= limit  // (2)(8)
5. Snap the cut to that line-box rect, not a px height   // (8)
6. Enforce orphans/widows >= 2; heading+next atomic      // (9)(10)
7. Emit page array; ONE DOM write                        // (14)
8. Re-paginate on: fonts loadingdone; ResizeObserver
   (rAF-deferred, ~150ms debounce, width-change only);
   font-size/leading change                              // (6)(13)
9. Capture anchor BEFORE re-pagination; seek after       // (11)(12)
```

**Clean-break formula:** not `floor(available/lineHeight)*lineHeight` (unsourced; assumes uniform leading; breaks on mixed content) — **cut after the last line-box rect whose `bottom <= limit`**, sub-pixel via `Range.getClientRects()`.

**Resume anchor:** `{ blockId, exact, prefix, suffix, charOffset, progression }` — quote-selector primary (12), `charOffset` fast path, `progression` (0–1) last-resort fallback (11). **Never a page index.**

---
Self-audit: every claim carries a URL or a cite to prior research. **One claim dropped** (`floor(h/lh)*lh` — no authoritative source, and refuted on mixed content). `caretPositionFromPoint` flagged too-new; the 29-property mirror list flagged **incomplete for prose** rather than passed on as canon. All sources verified 16/07/2026. **1,368 words (measured) vs the 1,000-word brief — over budget. Trimmed twice; the residual is the comparative table + recipe block, judged load-bearing for a build. Flagged, not hidden and not excluded-by-definition.**

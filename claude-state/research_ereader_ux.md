# E-Reader UX Research — for FemWell Reader v4

Ms Deep Search · 2026-05-12 · input for the v4 reader build after the v3 "card-on-cream" rejection.

---

## Sources

Open-source readers
- [futurepress/epub.js (docs)](http://epubjs.org/documentation/0.3/) — the canonical iframe + CSS-columns approach.
- [epub.js Tips and Tricks (wiki)](https://github.com/futurepress/epub.js/wiki/Tips-and-Tricks)
- [johnfactotum/foliate-js (README)](https://github.com/johnfactotum/foliate-js/blob/main/README.md) — same multi-column strategy, improved with bisecting visible-range and an `#anchor` resize contract.
- [foliate-js live reader](https://johnfactotum.github.io/foliate-js/reader.html)
- [gerhardsletten/react-reader](https://github.com/gerhardsletten/react-reader) — React wrapper on epub.js; documents the `flow: paginated|scrolled` + `manager: default|continuous` matrix.
- [pagedjs/pagedjs](https://github.com/pagedjs/pagedjs) and [pagedjs.org](https://pagedjs.org/) — W3C Paged Media polyfill, print-oriented but the gold standard for true page boxes.
- [fread-ink/ebook-paginator](https://github.com/fread-ink/ebook-paginator) — measurement-based slicing alternative to CSS columns.
- [Readium 2 Navigator architecture](https://readium.org/technical/r2-navigator-architecture/) and [Readium pagination strategy issue #10](https://github.com/readium/architecture/issues/10) — industry-spec pagination via injected JS/CSS in an iframe per resource.
- [Implementation of a Web-based E-book Reader (dev.to)](https://dev.to/fangfangluo/implementation-of-a-web-based-e-book-reader-22ao) — explicit perf numbers: WebKit column layout can take **over a minute** on a 1000-page doc; measurement is ~6x faster and async.

Design discussion
- [How Apple's Books App Has Changed in iOS 16 — TidBITS](https://tidbits.com/2022/10/03/apples-books-ios-16/)
- [My Beef with Books — Basic Apple Guy](https://basicappleguy.com/basicappleblog/build-a-better-books) — the canonical critique that forced Apple to add back page-curl in 16.4.
- [Books App Gets Redesign in iOS 16 — MacRumors](https://www.macrumors.com/2022/06/07/ios-16-books-app-redesign/)
- [Margins, line length, and reading ebooks on iPhone — TidBITS Talk](https://talk.tidbits.com/t/margins-line-length-and-reading-ebooks-on-an-iphone/24445)
- [Kindle KDP Reflowable Text Guidelines](https://kdp.amazon.com/en_US/help/topic/GH4DRT75GWWAGBTU)
- [Pure CSS ePub theme detection (Apple Books palettes)](https://gist.github.com/adaptivegarage/aef95223fab9a39db45f) — exact Apple Books sepia/night hex values.
- [Kindle Sepia Color Code — Medium](https://medium.com/greatnote/kindle-sepia-color-code-1fed14b1a5ef)
- [Reading Types Deserve the Best Type for Reading — Pocket Design](https://medium.com/pocket-design/reading-types-deserve-the-best-type-for-reading-c348753b070b)
- [Line length — Butterick's Practical Typography](https://practicaltypography.com/line-length.html)
- [Optimal Line Length — Baymard](https://baymard.com/blog/line-length-readability)
- [BlitzTricks — CSS tricks for eBooks](https://friendsofepub.github.io/eBookTricks/)
- [Toolbars for the Kindle Paperwhite — Dummies](https://www.dummies.com/article/technology/electronics/tablets-e-readers/amazon-fire-tablets/toolbars-for-the-kindle-paperwhite-157118/)

Sentiment
- [Ask HN: Does there exist an actually useful ebook reader?](https://news.ycombinator.com/item?id=9500920)
- [HN: Kindle is fine, but could've been much more](https://news.ycombinator.com/item?id=21359260)
- [HN: hardware fine, software-wise Kindle is horrible](https://news.ycombinator.com/item?id=28605857)
- [Paged.js HN thread](https://news.ycombinator.com/item?id=21499052)

---

## What good looks like — 15 rules

1. **The page IS the screen, not a card on the screen.** Kindle Paperwhite and Apple Books both render text directly onto the device background; there is no inner container, no shadow, no rounded corner. Tapping the page is the primary action ([Kindle Paperwhite toolbars](https://www.dummies.com/article/technology/electronics/tablets-e-readers/amazon-fire-tablets/toolbars-for-the-kindle-paperwhite-157118/)).
2. **Chrome hides by default; one tap toggles it.** Kindle: tap center of screen → top/bottom toolbars appear. Apple Books iOS 16: all controls live behind a single corner icon. There is no permanently visible header inside the reading surface ([Apple Books iOS 16 — TidBITS](https://tidbits.com/2022/10/03/apples-books-ios-16/)).
3. **Margins are generous and asymmetric.** Apple Books on iPhone uses roughly 16–20pt side margins at default and 28–40pt top/bottom; users routinely complain the sides are *still* too tight at large font sizes ([TidBITS Talk](https://talk.tidbits.com/t/margins-line-length-and-reading-ebooks-on-an-iphone/24445)). Kindle offers 3–4 preset margin widths, never zero.
4. **Line length is 50–75 characters; 66 is the sweet spot.** Beyond 80 CPL readers fatigue, below 45 CPL the rhythm breaks ([Baymard](https://baymard.com/blog/line-length-readability), [Butterick](https://practicaltypography.com/line-length.html)). On a 390px iPhone viewport with a serif at ~18px, that means **roughly 32–40 chars** — i.e. shorter than desktop, and the body font has to grow with the column.
5. **Line height ≥ 1.5.** WCAG max 80 CPL, leading 150% baseline ([Baymard](https://baymard.com/blog/line-length-readability)).
6. **Body type is a humanist serif designed for screens.** Bookerly (Kindle), New York / Iowan Old Style (Apple Books), Charter (Pocket's choice) — never a UI sans ([Pocket Design — Medium](https://medium.com/pocket-design/reading-types-deserve-the-best-type-for-reading-c348753b070b)). FemWell's Fraunces is on-brand here.
7. **Three themes, fixed palettes.** Light, Sepia, Dark. Kindle sepia: bg `#FBF0D9`, text `#5F4B32`. Apple Books sepia: bg `#F8F1E3`, text `#000`. Apple Books night: bg `#121212`, text `#B0B0B0` ([Apple Books CSS detection gist](https://gist.github.com/adaptivegarage/aef95223fab9a39db45f), [Medium](https://medium.com/greatnote/kindle-sepia-color-code-1fed14b1a5ef)).
8. **Page-turn is horizontal swipe, not vertical scroll, when in paginated mode.** Scroll mode exists as an opt-in for one-handed reading ([Apple Support — Read books on iPhone](https://support.apple.com/guide/iphone/read-books-iphc1af7c57/ios)). Two distinct mental models; don't mix.
9. **Page indicator lives at the bottom edge, in muted text, always visible.** Kindle shows "X% · Loc 1234 · 12 min left in chapter" as a non-chrome footer that *stays* — it isn't toolbar UI, it's part of the page ([Kindle Paperwhite toolbars](https://www.dummies.com/article/technology/electronics/tablets-e-readers/amazon-fire-tablets/toolbars-for-the-kindle-paperwhite-157118/)).
10. **No background card, no shadow, no border-radius on the reading surface.** Every successful reader treats the viewport itself as the page. Adding a card is what magazine apps do, and is exactly why FemWell v3 felt "wasted space".
11. **Tap targets ≥ 44×44pt, but the icon inside can be 20–24px.** Apple HIG minimum, expanded via padding. The single iOS 16 Books menu button is widely panned as too small (~50% hit rate, [Basic Apple Guy](https://basicappleguy.com/basicappleblog/build-a-better-books)) — instructive negative example.
12. **Settings are a bottom sheet, not a popover.** Apple Books and Kindle both surface "Aa" → bottom sheet with font size, font, theme, margin, line spacing sliders. Sheet keeps reading surface visible behind a scrim, so users see changes live.
13. **Slider previews font size live.** Both Kindle and Apple Books re-flow the live page as you drag, never on commit ([iMore Apple Books guide](https://www.imore.com/customize-apple-books-iphone-and-ipad)).
14. **Persist anchor across resize.** foliate-js's `#anchor` (Range | Element | fraction) is the right contract — the same paragraph stays in view when the user changes font size, rotates, or resizes ([foliate-js README](https://github.com/johnfactotum/foliate-js/blob/main/README.md)).
15. **Animate page turns subtly.** Apple removed page-curl in iOS 16, got pilloried, restored it in 16.4 with Slide / Curl / None options ([Basic Apple Guy](https://basicappleguy.com/basicappleblog/build-a-better-books)). A 200–300ms horizontal slide is the minimum; static cuts feel cheap.

---

## Pagination implementations — comparative table

| Library | Strategy | How turn works | Perf | Resize anchor | Notes |
|---|---|---|---|---|---|
| **epub.js** | iframe + `column-width: 100vw` multi-column | move iframe `translateX(-page * w)` | Slow on large books; WebKit can take >1min on 1000-page doc ([dev.to](https://dev.to/fangfangluo/implementation-of-a-web-based-e-book-reader-22ao)) | Weak | Industry default, lots of CSS quirks. |
| **foliate-js** | Same multi-column, but **bisecting** to find visible range | translateX with internal `#anchor` | Same as epub.js but more accurate location | Strong — anchor is Range/Element/fraction | Easier scrolled↔paginated switch. |
| **react-reader** | epub.js wrapper | `flow: paginated\|scrolled` + `manager: default\|continuous` | Inherits epub.js | epub.js CFI | Pre-render current chapter only. |
| **Readium Web (ts-toolkit)** | iframe per resource, inject JS+CSS for pagination & CFI | column-based, native scroll mode also | Production-grade | CFI-based locators | BSD-3, heavy, spec-correct. |
| **paged.js** | True paged media polyfill — generates page boxes from `@page` CSS | Page-boxes in DOM, not iframe | Designed for print, not live nav | Page boxes are real DOM | Best fidelity, weakest for live UX. |
| **ebook-paginator** | Measurement-based: walk DOM, check `scrollHeight`, backtrack | Slice into page elements | ~6× faster than columns in WebKit, async | Easy — page elements are real | Most complex code; no CFI out of box. |

**Verdict for FemWell:** content is short magazine-style chapters from our own LifestyleItems pipeline, not 1000-page EPUBs. Measurement-based slicing wins — fast enough, full DOM control (so Lucide icons, brand type, dark mode "just work"), and no iframe sandbox to fight.

---

## FemWell reader v3 — gap analysis

What v3 ships today (per user):
- White card with rounded corners and box-shadow, on cream background.
- Controls live *inside* the card.
- Slider works; JS measurement works.
- Content rendered into the card, not the page.

| Rule | v3 violation |
|---|---|
| #1 Page IS screen | Card-in-page is the canonical magazine pattern, not a reader. Hard fail. |
| #2 Chrome hides by default | Controls visible inside the card permanently. |
| #3 Generous margins | Card padding eats viewport before text margins do — double-frame wastes 40–80px of width. |
| #4 Line length 50–75 CPL | Card-inside-viewport on a 390px phone leaves maybe 280px text width → undersized. |
| #7 Three fixed themes | Cream background + white card is a third de-facto theme that matches no e-reader. |
| #10 No card | Direct violation. |
| #11 44×44 hit targets | Likely OK, but inside-card controls force them small. |
| #15 Page-turn anim | Unconfirmed; if it's a cut, that reads cheap. |

Net: v3 is a magazine card pattern, not a reader. The fix is structural, not cosmetic.

---

## Recommended architecture — FemWell Reader v4

**Pagination engine.** Measurement-based slicing per chapter ([ebook-paginator](https://github.com/fread-ink/ebook-paginator) model). Render chapter HTML into a hidden measuring container at viewport dimensions; walk children, track cumulative height, cut at last fitting block; emit one `<section class="page">` per page into a horizontal track. Async, idle-callback batched.

**Why not CSS columns.** Our chapters are 1–8 pages each; columns would work, but lose: precise margin control, easy dark mode, Lucide icons inline, brand fonts via `@font-face`. Measurement is more code but gives us full Tailwind/brand control. epub.js/foliate's perf cliff doesn't apply to us.

**Layout.**
- Reading surface = `100vw × 100vh`, brand background colour (no card, no shadow, no radius).
- Side margins: `clamp(20px, 6vw, 56px)`. Top: `64px` (room for muted chapter title). Bottom: `56px` (room for muted progress + page n/N).
- Text column max 580px, centred — keeps CPL in 50–70 even on tablet/desktop, matching the "one bottom nav, width-constrained" rule in memory.
- Horizontal track: `transform: translateX(-i * 100vw)` with `transition: transform 280ms cubic-bezier(.22,.61,.36,1)`.

**Themes (exact palettes).**
- Light: bg `#FBF8F4` (FemWell cream), text `#2B1F1A`.
- Sepia: bg `#F8F1E3` (Apple Books), text `#3C2E1F`.
- Dark: bg `#121212`, text `#D9CFC4` (Apple Books night-style, FemWell-warm).

**Typography.** Fraunces 18px default, 1.6 line height. Slider 14 / 16 / 18 / 20 / 22 / 26px. Inter for chrome only. **No emoji** — Lucide icons only.

**Chrome model.**
- Default: hidden. Only the progress footer ("Ch 3 · 42% · 4 min left") shows, in 12px muted.
- Tap centre 60% of viewport → toggle chrome.
- Tap left 20% → previous page; right 20% → next.
- Chrome appears as: top bar (back, chapter title, bookmark) + bottom bar (Aa, contents, search). Both translate in from edges, 200ms.
- "Aa" opens a **bottom sheet** with theme swatches (3 circles), font size slider (live preview), font family (Fraunces / Inter / Default), margin width (S/M/L), line spacing (Tight/Normal/Loose).

**Anchor contract.** Store position as `{chapterId, pageIndex, pageFraction, anchorParagraphId}`. On resize/font-change, re-paginate then seek to the page containing `anchorParagraphId`. Mirrors foliate-js's `#anchor`.

**Gestures.** Horizontal swipe (≥48px, ≤500ms) advances. Vertical swipe ignored in paginated mode. Long-press text → selection toolbar (highlight, note, copy, define).

**Page-turn animation.** Default Slide (horizontal). Toggleable to None in settings. No curl in v4 — Apple proved the lesson but the engineering cost isn't justified yet.

---

## Twitter / HN sentiment — five real quotes

1. *"Software made by people who hate reading."* — recurring sentiment on [Kindle's software](https://news.ycombinator.com/item?id=28605857).
2. *"The button is nearly impossible to select because it's ridiculously small, and the hit rate for successfully pressing it is only about 50% on the iPhone."* — [Basic Apple Guy on iOS 16 Books](https://basicappleguy.com/basicappleblog/build-a-better-books).
3. *"Flipping a page was always a tiny extra joy while reading an eBook"* — same source, on Apple removing page-curl. (Apple capitulated in 16.4.)
4. *"Margins on iPhone Books are too tight — text feels crammed against the edge at larger font sizes."* — recurring [TidBITS Talk thread](https://talk.tidbits.com/t/margins-line-length-and-reading-ebooks-on-an-iphone/24445).
5. *"Redundant navigation… organizes books according to the device's own logic rather than mine."* — [Ask HN: useful ebook reader](https://news.ycombinator.com/item?id=9500920).

The consistent theme: real users hate (a) chrome they can't dismiss, (b) tap targets that miss, (c) tight side margins at large text, (d) sudden cuts where animation belongs, (e) the app's organising logic overriding the reader's. v4 must answer all five.

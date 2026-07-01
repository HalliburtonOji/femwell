# Research — Card styles v2: bento, hero/media, shelves, rich-stat, nudges, expandable, arrangement — 1 July 2026

## Question
FemWell wants to EXTEND (not repeat) its card library. We already ship: clipboard board · stacked top/bottom sub-sliders · tile-grid · accent-rim sub-card · focused colour pills · in-card horizontal deck (see `workspace/CARD_PATTERNS_RESEARCH_2026-06-25.md`). This pass adds cited grounding for seven fresh families — bento/masonry mixed-size grids, hero/media cards + carousels, category shelves, rich stat/status cards, dismissible nudges, expandable cards + list-vs-card, and how to arrange all of it on one screen without chaos. Every finding ends with "how FemWell adapts this (on brand, not dark-fintech)."

## Sources consulted (all fetched 1 July 2026)
- orbix.studio/blogs/bento-grid-dashboard-design-aesthetics — 4-tier bento sizing + premium-vs-busy.
- galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design — bento hierarchy + pitfalls (carried from prior file, re-verified).
- cxl.com/blog/netflix-design (403 this week) — superseded by the two below.
- medium.com/throughdesign/netflix-a-house-of-cards-1e9fb0580082 — Netflix Fitts's-law size hierarchy + thumbnail colour restraint.
- whats-on-netflix.com/news/netflix-website-redesign-testing — box-art metadata pills / "New"/seasonal tags.
- nngroup.com/articles/mobile-carousels — peek, dots-are-weak, 3-4 steps, gutters, first-item scent, "accessible another way".
- nngroup.com/articles/horizontal-attention-leans-left — 0 fixations right of the fold in a 120+ eyetracking study.
- developer.apple.com/design/human-interface-guidelines/top-shelf — Apple TV featured shelf (title only retrievable; used for the pattern name).
- rausr.com/blog/the-evolution-of-spotify-design — Spotify home became a stack of personalised shelves of tiles/cards/rows.
- monzo.com/blog/the-new-and-improved-home-screen — modular home: spotlights, per-module detail levels, edit-layout.
- fluent2.microsoft.design/components/ios/core/cardnudge/usage — nudge = "helpful but never necessary", always dismissible.
- inclusive-components.design/cards — whole-card-clickable technique + close/secondary-action a11y.
- designforducks.com/expandable-card-ui-best-practice-and-examples — inline vs overlay expand, caret affordance, when a list wins.
- nngroup.com/articles/progressive-disclosure — show few options first, more on request.
- uxpin.com/studio/blog/design-progress-trackers — ring vs bar, compact circular for glance.
- bricxlabs.com/blogs/card-ui-design-examples / zurb.com/blog/5-common-mistakes... — card-overload + scattered-actions warnings.
- community.monzo.com/t/new-home-screen-layout/148377 — real user backlash quotes (dated).

---

## 1. BENTO / MASONRY MIXED-SIZE GRIDS

**A 4-tier sizing system is what makes bento read as hierarchy, not decoration.** Tier 1 hero tiles 4-6 cols × 2 rows, "Limit: two hero tiles per dashboard screen maximum"; Tier 2 feature 3-4×1-2; Tier 3 metric 2-3×1; Tier 4 accent 1-2×1 (source: https://www.orbix.studio/blogs/bento-grid-dashboard-design-aesthetics).
**Size is the loudness dial, not colour.** "Size functions as a visual loudness control, directing attention more reliably than color, typography, or animation alone"; users "fixate first on larger elements, spending 2.6 times longer viewing them" (source: https://www.orbix.studio/blogs/bento-grid-dashboard-design-aesthetics).
**Premium = you never need a label to know what matters.** "If user has to read labels to understand which number matters most, the tile sizing is wrong" (source: https://www.orbix.studio/blogs/bento-grid-dashboard-design-aesthetics).
**Busy = too many heroes / too many tiles.** Three hero tiles "cancel each other out" (no anchor); overcrowded bento layouts with "more than 12-15 cards visible simultaneously lose the organizational benefits" (sources: https://www.orbix.studio/blogs/bento-grid-dashboard-design-aesthetics , https://www.galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design/).
**Bento earns its cost only when IA is decided first.** "It works when the information architecture… is decided before a single frame opens in Figma"; "Not all content fits naturally into modular boxes" (source: https://www.galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design/).
→ *FemWell adapts:* a "bento board" variant for **Pulse/Trends** and **Today** — ONE 2×2 hero tile (today's phase or the day's flora) + 3-4 satellite tiles (a ritual streak, a mood note, one deal). Enforce the two-hero cap and 12-tile ceiling as a lint rule. Keep it calm, not fintech-dense: generous cream gutters (bigger than a banking app's), one gold figure per tile, botanical corner rule as the tile boundary instead of hard hairlines. Size — not a rainbow of fills — carries the hierarchy, which suits our restrained palette.

## 2. HERO / MEDIA CARDS + HORIZONTAL CAROUSELS

**The hero is the top full-width feature; size = priority, per Fitts.** On Netflix "the importance level of the UI elements rises from the bottom left quadrant to the top right quadrant," with size helping users "make better decisions," and "the larger and closer a target is, the faster the user will get to it" (source: https://medium.com/throughdesign/netflix-a-house-of-cards-1e9fb0580082).
**Imagery does the shouting; the chrome stays quiet.** "The UI also is coloured minimally, graciously making space for the colours of thumbnails to catch our attention" (source: https://medium.com/throughdesign/netflix-a-house-of-cards-1e9fb0580082).
**Badges/pills ride ON the art, not beside it.** Netflix's refresh puts "extra metadata now coming through directly on the box art, with handy little tags sitting at the box art"; seasonal/"New" "pills" are an "eye-grabbing tool to keep you interested in the first few items" (source: https://www.whats-on-netflix.com/news/netflix-website-redesign-testing/).
**Spotify generalises the hero-plus-rows model to personal content.** "Spotify's home screen turned into a stack of personalized shelves… Tiles, cards, and rows replaced simple, neutral lists" (source: https://rausr.com/blog/the-evolution-of-spotify-design/). Apple TV names the same top region the **Top Shelf**, a "rich, engaging" featured carousel above the rows (source: https://developer.apple.com/design/human-interface-guidelines/top-shelf).
→ *FemWell adapts:* validates and upgrades our **Spotlight card** (prior file item 1) — one full-width hero atop Lifestyle / Daily Story with a botanical image doing the shouting and the chrome staying cream/quiet. Put ONE ribbon ON the image (small oxblood-on-cream tag: "New" · "Editor's pick" · "Day 14"), never a competing badge shelf. NO autoplay video (calm app; battery + startle cost) — a still botanical or a tap-to-play thumbnail only. Ranking language stays warm ("Most-loved this week") not leaderboard ("No.1").

## 3. CATEGORY ROWS / SHELVES

**A shelf must LOOK cut off to signal more.** "The list must imply scrolling by having items at the right not fit fully on the page"; "Half images and incomplete words signal users that there was more content"; "the illusion of continuity… is a strong carousel cue" (sources: https://www.nngroup.com/articles/mobile-carousels/ ).
**Dots are the wrong cue on a shelf; peek is the right one.** "Dots are generally weak signifiers"; "people often do not notice them" (source: https://www.nngroup.com/articles/mobile-carousels/).
**Cap depth, front-load quality.** Users should "reach the last item… in 3-4 steps"; the first item is the scent — "people may not bother to look at subsequent items if the first item is not interesting" (source: https://www.nngroup.com/articles/mobile-carousels/).
**Support swipe + leave a page gutter.** "Make sure your carousel supports swipe"; add a "page gutter" so a horizontal swipe doesn't trigger iOS Back (source: https://www.nngroup.com/articles/mobile-carousels/).
**A shelf's content must also be reachable another way — because horizontal scroll is genuinely skipped.** In a 120+ participant eyetracking study "there were no fixations to the right of the screen edge" (source: https://www.nngroup.com/articles/horizontal-attention-leans-left/); so hero-carousel content "should be accessible in some other way" (source: https://www.nngroup.com/articles/mobile-carousels/).
→ *FemWell adapts:* the **shelf** = title (Cormorant/Ephesis) + a "See all →" on the right + a row that PEEKS the next card ~15% at the edge. Best item first. Cap ~6-8 cards per shelf, ≤3-4 shelves per page so the page stays a calm editorial stack not a Netflix wall. Give "See all" as the reliable path for anything important (satisfies the "accessible another way" rule). Inner gutter so the swipe doesn't fight our bottom-nav/back gestures. Dots optional decoration; the peek does the discovery work.

## 4. RICH STAT / STATUS CARDS

**Monzo's model: one module = a summary + a tappable "spotlight" that carries the detail + a status read.** "get insights on your balances, bills, spending and budgets with spotlights that you can tap into for more detail"; each module has an adjustable "level of detail" (source: https://monzo.com/blog/the-new-and-improved-home-screen).
**Ring vs bar: ring for a compact glanceable snapshot, bar for linear determinate progress.** A progress circle "is effective for tasks where users need a sense of progression in a compact space"; a bar is "best for determinate tasks where users expect a clear, linear representation" — and "don't switch to circular… if you use linear tracks" (source: https://www.uxpin.com/studio/blog/design-progress-trackers/).
**Where the actions live — the anti-scatter rule.** The failure is "A gear icon top-right, a trash icon bottom-left, an inline text link… and a button at the bottom." Right: "One primary action (the card itself as the click target), secondary actions grouped at the bottom, an overflow menu for the rest" (source: https://bricxlabs.com/blogs/card-ui-design-examples). If text must drop below 14px to fit, "your card has too much information" (same source).
→ *FemWell adapts:* a **stat/status card** = one ring OR one mini-figure (never both) + a short status chip ("On track" in sage, "Rest day" in plum) + at most one inline pill + a "…" overflow **top-right** holding the quiet extras (snooze, hide, settings). Ring for a cyclical/streak snapshot (ties to the growing-flora idea), bar for a linear program ("Week 2 of 6"). Keep the figure celebratory not clinical — "3 rituals this week" in gold, not a red-amber-green dashboard. One "…" per card, top-right, is our canonical overflow home.

## 5. DISMISSIBLE SUGGESTION / NUDGE CARDS

**A nudge is dismissible BY DEFINITION.** "Card nudges present information that is helpful but never necessary, so they are always dismissible" (source: https://fluent2.microsoft.design/components/ios/core/cardnudge/usage).
**Two dismiss mechanisms; swipe primary, explicit ✕ as the stronger cue.** "They can be dismissed with a swipe in either direction and can optionally contain a dismiss button as a stronger visual cue" (source: same). Direction can carry meaning — "swipe left for snooze and swipe right for done/dismiss" (source: https://github.com/flutter/flutter/issues/1403).
**Nudges must not masquerade as status.** "They should never be used to communicate feedback or status" — keep those on the stat card (source: https://fluent2.microsoft.design/components/ios/core/cardnudge/usage).
**Lead with the action; nudge sits at top and yields.** "Lead with the action"; the nudge "take[s] prominent placement at the top… and push all other content down. When… dismissed, main page content shifts up" (source: same).
**Accessibility of the ✕:** for an interactive card use the whole-card block-link technique with `position:relative` + a link `::after` overlay, and raise any secondary control (the ✕) above it with its own `position:relative` and enlarged hit area; give hover AND focus states via `:focus-within`; the ✕ needs a real accessible label, not a decorative glyph (source: https://inclusive-components.design/cards/).
→ *FemWell adapts:* a **nudge card** (new room · new deal · a gentle ritual suggestion) — botanical illustration + one warm line + one CTA + a real ✕ top-right (44pt hit area, aria-label "Dismiss"). Support swipe-to-dismiss AND the ✕. Offer **snooze** ("Remind me later") as well as **dismiss** for anything time-based so it never nags — snooze ≠ delete. Never use a nudge to deliver status ("On track" belongs on §4's stat card). One nudge at the top at a time; on dismiss the page settles up.

## 6. EXPANDABLE CARDS + LIST-vs-CARD

**Inline expand preserves context; overlay avoids reflow.** Inline "grows in place, pushing the surrounding layout downward… easier for responsive design"; overlay "reveals additional content on top… keeping its footprint fixed" (source: https://designforducks.com/expandable-card-ui-best-practice-and-examples/).
**Expand in place vs open a page:** expand when "switching to a detail page breaks flow"; open a page when "the expanded content is large, complex" (source: same).
**The caret is the trustworthy affordance.** "A caret is the most reliable choice. While a plus icon is popular, it may be confused with an 'add' function. An arrow… can be mistaken for a 'jump to'" (source: same).
**When a LIST beats a CARD:** avoid expandable cards "when most users will expand every card anyway (use a list or table instead)"; and generally reserve cards for engaging/grouped editorial content while lists win for scan/sort density (sources: https://designforducks.com/expandable-card-ui-best-practice-and-examples/ , https://www.nngroup.com/videos/card-view-vs-list-view/). Progressive disclosure principle: "show users only a few of the most important options initially, and offer a larger set… upon request" (source: https://www.nngroup.com/articles/progressive-disclosure/).
→ *FemWell adapts:* an **expandable card** for insight/horoscope/Daily-Story intros — summary on the surface, a **caret** (never +/arrow) opens the long read INLINE so boards stay calm and the reader keeps their place. If the payload is a full article/player, don't expand — deep-link full-screen to the exact item (our existing card rule). Use a plain **list**, not cards, for Planner agenda, settings, and any "everyone expands every row" surface — don't card-ify dense scannable data.

## 7. ARRANGEMENT / LAYOUT — combining families on one screen

**A page is a bounded, labelled stack of a FEW module types, each personalised.** Monzo: "Customise what you see… in what order, and with what level of detail." Spotify home = "a stack of personalized shelves" (sources: https://monzo.com/blog/the-new-and-improved-home-screen , https://rausr.com/blog/the-evolution-of-spotify-design/). Apple TV composes ONE featured Top Shelf carousel THEN rows beneath (source: https://developer.apple.com/design/human-interface-guidelines/top-shelf).
**Consistency is the anti-chaos rule — bound the type set + fix the rhythm.** The failure modes: "One card has a 3-word title, the next has 15… The grid looks like a broken staircase"; scattered actions across every corner; content overload. Fixes: "Truncate text at fixed character counts", "One primary action… secondary actions grouped at the bottom, an overflow menu for the rest", and reveal extras with expandable sections not more cards (source: https://bricxlabs.com/blogs/card-ui-design-examples).
**Don't overcrowd the screen.** "Too many cards within a grid, or on screen at any given moment can become overwhelming and can cause users to strain when scanning" (source: https://bricxlabs.com/blogs/card-ui-design-examples).
→ *FemWell adapts:* the canonical page = **signature top (FwFloraHero) → ONE SummaryCard → then a small, rhythmic stack**: at most ONE bento block + ONE-to-THREE shelves + optional ONE stat card + at most ONE nudge at the top. Every section wears a serif header (Cormorant/Ephesis) + optional "See all". Cap the on-screen card-type vocabulary to ~3-4 families per page — a page is a stack, not a collage. Fixed title truncation and one "…" overflow home per card keep the "broken staircase" away. This preserves our calm editorial rhythm while adding the variety.

---

## What our card library is missing (gap → remedy)
- **Mixed-size hierarchy on boards** — our tiles read uniform. *Remedy:* the §1 bento variant (one 2×2 hero + satellites; two-hero cap; ≤12 tiles).
- **A real hero/media card with an on-image ribbon** — *Remedy:* §2 spotlight upgrade; badge ON the art; no autoplay.
- **A labelled shelf with peek + "See all"** — we have an in-card deck but not a page-level titled shelf. *Remedy:* §3 shelf (15% peek, best-first, ≤6-8, "See all" as the reliable path).
- **A calm rich stat/status card with a "…" overflow** — *Remedy:* §4 (ring OR figure, status chip, one "…" top-right).
- **A genuinely dismissible nudge with snooze** — *Remedy:* §5 (✕ + swipe + snooze; never carries status; labelled ✕).
- **In-place expandable card with a caret** — *Remedy:* §6 (inline caret expand; list where everyone expands).

## Recommended approach (for Mr Lead Manager)
1. Add SIX named types to the brand-bible card catalogue: **BentoBoard, HeroSpotlight (ribbon), Shelf, StatStatusCard (+"…"), NudgeCard (dismiss/snooze), ExpandableCard (caret)** — each with job + anatomy + one seeded demo route, linked from the IDEAS pill.
2. Ship them demo-first (per the card-system demo-first memory) — one `/CardStylesV2Demo` seeded route before any live rebuild.
3. Codify FIVE lint-able rules: two-hero-max + ≤12-tile bento; shelf peek ≥12% + "See all" required + ≤3-4 shelves/page; one "…" overflow top-right per card; nudge always dismissible + never status; caret (not +/arrow) for expand.
4. Bind all badges/status chips to existing tokens (phase hues + sage/plum/gold) — no new colours; variety comes from JOB, not palette (carry the prior file's spine rule).

## Sentiment quotes — the "busy modular home" backlash (why restraint matters)
- @Brandz (2 June 2023): "I couldn't see what was coming out of which account unless I went into the account." (https://community.monzo.com/t/new-home-screen-layout/148377)
- @limeinside (3 June 2023): "Seeing transactions for joint account in the same feed as personal doesn't work at all." (https://community.monzo.com/t/new-home-screen-layout/148377)
- @MiloMurph (9 June 2023): "This new layout is God awful. For me, its a mess and makes using monzo convoluted." (https://community.monzo.com/t/new-home-screen-layout/148377)

These are the exact failure our calm-cream approach must avoid: modular ≠ legible by default. Bento/shelves only feel premium when hierarchy and restraint are enforced (§1, §7).

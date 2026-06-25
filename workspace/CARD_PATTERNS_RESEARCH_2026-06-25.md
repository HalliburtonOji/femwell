# Research — Card language: modern mobile card UI patterns — 25 June 2026

## Question
FemWell wants research-grade, cited grounding for a brand-bible "card language" section. We already ship five card moves and want them **validated + enriched, not replaced**: (a) big framed "board" card; (b) tile-grid inside a board; (c) in-card horizontal SWIPE DECK (one lens/peer per page, dots+arrows); (d) accent-rim sub-card (coloured left rim insight card); (e) big coloured action pills + sub-cards nested within big cards. Below: the current external vocabulary, best practice, risks, and a shortlist of patterns worth adding — all on-brand (editorial, botanical, never clinical).

## Sources consulted
- m3.material.io/components/cards/specs — Material 3 card types (elevated/filled/outlined) (25 Jun 2026).
- nngroup.com/articles/horizontal-scrolling — horizontal scroll is missed; signifiers (25 Jun 2026).
- nngroup.com/articles/mobile-carousels — carousel discoverability, dots are weak, peek is strong (25 Jun 2026).
- nngroup.com/articles/illusion-of-completeness — partial/bleeding content signals "more" (25 Jun 2026).
- nngroup.com/videos/card-view-vs-list-view — card vs list tradeoff (25 Jun 2026).
- eightshapes.com/articles/cards-and-composability-in-design-systems — variety vs chaos, composability (25 Jun 2026).
- galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design — bento grid hierarchy + pitfalls (25 Jun 2026).
- polaris-react.shopify.com/components/callout-card — callout card anatomy + use (25 Jun 2026).
- polaris-react.shopify.com/patterns/common-actions/best-practices — primary/secondary action rules (25 Jun 2026).
- carbondesignsystem.com/components/tile/usage — tile-as-foundation, expandable tiles (25 Jun 2026).
- developer.apple.com/.../accessibility + corroborating sources — 44pt touch target (25 Jun 2026).

---

## 1. Modern mobile card UI patterns — the current vocabulary

**Material 3 ships three card *containers*, distinguished only by separation, not function.** "Cards display content and actions about a single subject," in three types — elevated (drop shadow, 1dp), filled (subtle), outlined (visual boundary, greatest emphasis); "each provides the same legibility and functionality, so the type you use depends on style alone" (source: https://m3.material.io/components/cards/specs). Mobile margin recommendation is 8dp.
→ *FemWell use:* our big framed "board" card = the **outlined/high-emphasis** container (botanical corner rule as the boundary). Lighter info = **filled**. We do not need three look-alike cards on one page — pick by emphasis, exactly as M3 says.

**Tiles are the primitive; cards are the composite built on them.** In IBM Carbon, "tiles are simple and foundational, while cards can be very complex and are built upon the tile foundation with various patterns of information hierarchy, multiple actions, overflow menus, selectable features" (source: https://carbondesignsystem.com/components/tile/usage/).
→ *FemWell use:* validates (b) — our 2–3-col mini-cards inside a board are **tiles** (one fact each); the board is the **card**. Keep tiles dumb-but-tappable, board rich.

**Bento grids are the defining 2025–26 layout: modular tiles of varied size, each holding one content type.** "A bento grid dashboard is a modular UI layout where the interface divides into rectangular tiles of varying sizes, each containing one type of content: KPI number, chart, status indicator, or an action button"; large 2x2 for important, small 1x1 for secondary (source: https://www.galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design/). Apple's product pages are the canonical example.
→ *FemWell use:* validates (b) and points the upgrade — our in-board tile grid should **vary tile size for hierarchy** (one hero 2-wide tile + smaller satellites), not a flat uniform grid.

**Cards vs lists is a real tradeoff, not a default.** "List view allows for easy sorting and is space efficient, while card view is visually engaging and creates effective groupings" (source: https://www.nngroup.com/videos/card-view-vs-list-view/).
→ *FemWell use:* reserve rich cards for editorial/discovery surfaces (Lifestyle, Today, Community spotlights); use lists where the job is scan/sort (Planner agenda, settings). Don't card-ify everything.

**Pitfalls (bento/board):** "Not all content fits naturally into modular boxes"; poor planning "creates cluttered layouts"; responsive harmony "requires strategic planning and extensive testing" (source: https://www.galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design/).

---

## 2. Nested / horizontal scroll — best practice & risks (the big warning)

This is the riskiest of our five moves. The evidence is blunt.

**Horizontal scroll is genuinely missed.** "People expect to scroll vertically for additional content, but they don't expect to scroll sideways." Eye-tracking: "a user looking at a filmstrip of product images never glanced at the arrows" (source: https://www.nngroup.com/articles/horizontal-scrolling/).

**On mobile carousels, dots are weak; peek is strong.** "Dots are generally weak signifiers" because "their small size makes them easy to overlook." Conversely "the illusion of continuity, created by half images or text that look like they are continued beyond the vertical edge of the screen, is a strong carousel cue" (source: https://www.nngroup.com/articles/mobile-carousels/).

**Show content bleeding off the edge — visual completeness hides what's there.** "Show additional content bleeding off screen"; visible partial content "signals continuation," whereas a complete-looking edge creates the **illusion of completeness** so users believe nothing more exists (source: https://www.nngroup.com/articles/illusion-of-completeness/).

**Support real swipe + leave gutters to avoid gesture conflict.** "Make sure your carousel supports swipe"; leave a "page gutter" of empty space "between the carousel and screen edges" so users "avoid accidentally triggering back-navigation or app-switching gestures" (source: https://www.nngroup.com/articles/mobile-carousels/).

**Keep decks short.** Users typically abandon after a few items; "reach the last item in the carousel in 3–4 steps" and front-load the best item, because "people may not bother to look at the subsequent items if the first item is not interesting" (sources: https://www.nngroup.com/articles/mobile-carousels/ , https://www.nngroup.com/articles/horizontal-scrolling/).

**The nested-scroll trap.** A horizontal swipe deck living inside a vertically-scrolling page (a slider-within-a-scroll) is exactly the gesture-ambiguity case the gutter rule addresses; a swipe deck inside *another* horizontal slider is the genuinely hostile case to avoid.
→ *FemWell rules for (c), the in-card lens/peer deck:* (1) **always peek** the next lens ~12–16% at the right edge — never a flush full-bleed card; (2) **persistent** dots **and** arrows, not hover-only (desktop arrows that "appear only on mouseover" reduce discovery — source: horizontal-scrolling); (3) cap at **4–5 lenses**, best first; (4) keep an **inner gutter** so the swipe doesn't fight the OS back-swipe and the page's vertical scroll; (5) **never nest a horizontal deck inside another horizontal slider**. Dots are decoration here, not the discoverability mechanism — the *peek* does the work.

---

## 3. Accent / status / semantic cards (the left-rim insight card)

**A coloured left rim is the recognised callout device.** "The colored left border provides the main visual distinction in callout card designs," used "to draw special attention to special features, offers, or important messages" (source: https://coreui.io/bootstrap/docs/components/callout/).

**Colour should mean something — semantic, not decorative.** "Semantic colors are color labels that describe their function, not their appearance" — error/success/warning/info rather than blue/green (source: https://medium.com/@zaimasri92/semantic-colors-in-ui-ux-design-a-beginners-guide-to-functional-color-systems-cc51cf79ac5a).

**Restraint is the rule that keeps it from going garish.** "Avoid adding additional colors if possible, as creating additional colors greatly reduces the user's ability to learn and properly use the application" (source: https://medium.com/@zaimasri92/semantic-colors-in-ui-ux-design-a-beginners-guide-to-functional-color-systems-cc51cf79ac5a). Polaris callout card pairs a single accent with one required heading + one required primary action (source: https://polaris-react.shopify.com/components/callout-card).
→ *FemWell use:* validates (d). The left-rim insight card carries **one** accent — map it to our **phase hues** (menstrual #BC2E27 · follicular #8FAF8F · ovulatory #D4AF37 · luteal #8E6E8E) so the rim *means* something (which phase/domain the insight belongs to), and to a domain accent on non-cycle cards. One rim colour per card; never a rainbow of rims on one screen. Rim = a thin botanical-gold or phase-hue stripe, body stays cream/ink.

---

## 4. Action pills / primary CTAs on cards

**Two strong buttons max per card.** "Avoid using more than two shaped or filled buttons within a card as they can degrade hierarchy and cause confusion"; "use primary and secondary buttons to help merchants identify which action they'll most likely want" (source: https://polaris-react.shopify.com/patterns/common-actions/best-practices).

**Don't let two CTAs compete; pair primary with a quieter secondary.** "Don't pair primary critical buttons with other button variants and tones that look jarring and create visual competition" (source: https://polaris-react.shopify.com/patterns/common-actions/best-practices). The callout card pattern = one **required primary action**, one **optional secondary** (source: https://polaris-react.shopify.com/components/callout-card).

**Touch target ≥ 44×44pt.** Apple HIG specifies "a minimum tappable area of 44pt by 44pt for all controls"; the *touch* target can exceed the *visual* size, and the 44pt floor is a minimum — larger is better for accessibility (sources: https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/ , https://developer.apple.com/design/human-interface-guidelines/accessibility). Material/WCAG 2.5.8 corroborate a 24–48px range with 48px comfortable.
→ *FemWell use:* validates (e). Our big coloured action pill = the **one primary** per card (crimson #BC2E27 or gold #A8893F), with at most **one** quieter secondary (outlined/ghost). Never two filled crimson pills side by side. Pill min height **48px**, full-bleed-tappable. Nested sub-pills inside a board (e.g. one CTA per tile) are fine *if* each tile is its own subject — that's composition, not competition.

---

## 5. Variety vs consistency — a *system* of distinct cards, each with a job

**A card is a composition, and that's the maturity test.** Unlike `button`/`input`, "a card requires composition" because it "relates many elements" — the signal a system must mature (source: https://eightshapes.com/articles/cards-and-composability-in-design-systems/).

**Flexibility invites abuse — bound it with examples, don't engineer infinity.** "Regions offer flexibility but invite abuse"; the discipline is to "create examples exhibiting each one" intended variant rather than chase every theoretical combination — "Powerful, opinionated components tempt a system team to solve every combination… but complex, well modeled solutions invoke a higher cost of creation and maintenance." Aim for "just enough" complexity (source: https://eightshapes.com/articles/cards-and-composability-in-design-systems/).

**Variety should come from *content/job*, not recolouring one card.** Variants are meaningful when driven by "type (interactive, featured), size (compact, expanded), and state" — distinct jobs, not palette swaps (source: https://medium.com/eightshapes-llc/cards-and-composability-in-design-systems-8845ecbee50e).
→ *FemWell use:* this is the spine of the brand-bible section. Define a **bounded set of named card types** (≈10–14), each with a documented job and a real seeded example — and a hard rule: **a new card needs a new *job*, not a new colour.** That's how variety stays rich without becoming chaos.

---

## 6. Shortlist — card patterns worth adding to the vocabulary

Each: external grounding + the one-line FemWell fit (editorial, botanical, never clinical).

1. **Spotlight / featured card** — a single large card given visual primacy. Bento explicitly reserves "large 2x2 squares" for "important" content (source: https://www.galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design/). *FemWell:* the one hero piece atop Lifestyle/Today — a full-width botanical-framed card with a generous Fraunces hook, one image, one pill. Earns the top slot; everything below is satellites.

2. **Stat / metric (KPI) tile** — one number + label, the bento "KPI number" tile (source: https://www.galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design/). *FemWell:* inside Pulse/Trends boards — "Day 14", "3 rituals this week" — one figure in gold, no chart junk; never clinical framing, keep it celebratory.

3. **Expandable / progressive-disclosure card** — Carbon's expandable tile hides detail until tapped, built on the tile foundation (source: https://carbondesignsystem.com/components/tile/usage/). *FemWell:* an insight/horoscope card that opens in place to the long read — summary on the surface, depth on tap, so boards stay calm.

4. **Letter / note card** — editorial long-form framed as a personal note. Grounded in "card view is visually engaging" for editorial groupings (source: https://www.nngroup.com/videos/card-view-vs-list-view/). *FemWell:* on-brand signature — a serif "letter" card (Saturn-return note, Daily Story intro) with cream paper, drop-cap, botanical divider. The most distinctly-FemWell card; nothing clinical can imitate it.

5. **Media-led card (audio/video inline)** — image/player leads, text supports; Polaris ships a dedicated Media card with primary + secondary action (source: https://polaris-react.shopify.com/components/media-card). *FemWell:* Listen/Daily Story cards where the **player lives in the card** (per our card-system spec) — botanical thumb, inline play, one pill.

6. **Timeline / agenda card** — vertical sequence of moments in one container; the **list** side of the card-vs-list tradeoff, used where scan/order matters (source: https://www.nngroup.com/videos/card-view-vs-list-view/). *FemWell:* Planner "today's thread" — a single card holding an ordered ribbon of moments (ritual → event → reflection), botanical node markers, no spreadsheet feel.

7. **Progress card** — one container tracking a journey/streak. Bento's "status indicator" tile generalises here (source: https://www.galaxyux.studio/blog/bento-grids-the-new-standard-for-modular-ui-design/). *FemWell:* Programs/ritual streak — a flora that grows with progress (ties to BRAND_FLORA), warm not gamified-clinical.

8. **Callout / opportunity card** — Polaris's exact pattern: illustration + heading + body + one primary action, "to encourage… an action related to a new feature or opportunity," dismissible (source: https://polaris-react.shopify.com/components/callout-card). *FemWell:* gentle nudge cards (new room, new deal, new program) — botanical illustration, one warm CTA, always dismissible so it never nags.

---

## What our card language is missing (gaps → remedy)
- **Tile-size hierarchy inside boards** — our in-board grids look uniform. *Remedy:* adopt bento varied-size tiles (one 2-wide hero tile + smaller satellites).
- **Peek + persistent dots/arrows on the lens/peer deck** — if any deck is flush full-bleed, it's being missed. *Remedy:* enforce 12–16% peek + always-visible controls + 4–5 cap + inner gutter.
- **Semantic meaning on the rim colour** — if the rim is decorative, it's wasted. *Remedy:* bind rim to phase hue / domain accent, one per card.
- **A named, bounded card catalogue** — without it, variety drifts to chaos. *Remedy:* document ≈10–14 named types each with a job + seeded example; rule: new job, not new colour.

## Recommended approach (for Mr Lead Manager)
1. Codify the **named card catalogue** (the five we ship + the 8 shortlisted) as the brand-bible "card language" section — each entry = job, anatomy, one accent rule, one CTA rule, a seeded demo route.
2. Ship a **deck-discoverability fix MP** for every in-card swipe deck: enforce peek %, persistent dots+arrows, ≤5 items, inner gutter; ban nested horizontal-in-horizontal.
3. Add **tile-size hierarchy** to board grids (one hero tile).
4. Bind **rim colour → phase hue / domain accent** as a token rule.
5. Enforce **one primary pill + ≤1 secondary per card, ≥48px** as a lint-able rule.

## Sentiment quotes
None sourced this pass — this is a design-system/standards research request, not a forum-sentiment one, so no user quotes are fabricated. (If tone calibration is needed for the card-copy voice, dispatch a separate sentiment pass against r/femalehealth / r/TwoXChromosomes and I'll return real handles + dates.)

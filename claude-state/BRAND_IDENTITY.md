# FEMWELL — CANONICAL BRAND IDENTITY · COMPLETE MASTER (v4 · 2026-06-19)

> **READ THIS BEFORE ANY UI / VISUAL WORK OR VISUAL SCAN. Conform to it.**
> **This file is the single COMPLETE source of truth** — the north star + soul, typography (fonts + scale),
> colour (tokens + colourways + WCAG), the heart mark, the botanical brand-image system, the flora
> backbone/meaning + recognisability standard, variety & per-user uniqueness, motion, spacing, and the
> component map. It is **self-sufficient for building**.
> If code disagrees with this file, this file wins — and the code is a fix target.
> Phone-readable bible: **`femwell-handoff/BRAND-BIBLE.html`** (styled, renders its own live flora). Research + citations: **`workspace/BRAND_RESEARCH_2026-06-19.md`**.
> Mirrored in-app at **Founders → Brand & UX → Brand Identity** and **→ Flora & Meaning**. Authoring/gate rules live in CLAUDE.md.

---

## ★ THE NORTH STAR (derive everything from this)
> **"Your life, in bloom — a living garden that grows as you do."**

A woman's life is a **garden, not a chart.** It has **seasons** (the cycle), **long arcs** (life-stages, teen-daisy → elder-magnolia), **many beds not one** (career · friendship · love · money · rest · joy · identity — *health is one room, not the house*), and it is **tended, not optimised.** FemWell is the garden that remembers what bloomed where: every flower means something true, a butterfly arrives only on a real return/change, and the garden is unmistakably **hers** (the deterministic flora fingerprint, §5.2). The app doesn't track you — it grows with you.

**Why it's load-bearing:** it (a) reframes femtech away from clinical tracking toward whole-life *tending* — the documented white space (femtech flees pink *into clinical neutrality*: Clue/Elvie; FemWell flees pink *into editorial warmth*); (b) unifies every surface into one language; (c) gives the voice a concrete home; (d) is already half-built in code (flora system + fingerprint). **Open here; derive everything from it.**

**BRAND PERSONALITY — the archetype north star:** a **Caregiver core**, tinted by the **Sage**, with a touch of the **Innocent's joy**. Caregiver = the warm, nurturing spine; Sage = keeps it from going saccharine (it genuinely *knows things* — cycle science, real meaning); Innocent = lighthearted by default. Every copy/design/feature decision answers to: **"a warm friend who knows things and keeps it joyful."** Avoid a pure Caregiver (reads soft/clinical-maternal) and avoid Lover-led (too romance-coded for a whole-life app). *(Source: Mark & Pearson archetypes; full citations in the research doc.)*

**POSITIONING in one line:** the **warm, editorial, beautiful** lane between pink-bubblegum femtech and cold-clinical femtech — *breadth of life carries the femininity, not pink* (the Gentlewoman move). Cream + gold + crimson is the documented premium "old-money" formula (ivory + warm-gold + burgundy) — lean in, don't drift bright/pink/clinical.

**APPENDICES (deep + cited; this master is self-sufficient without them):**
- `claude-state/BRAND_FLORA.md` — the full flora map, floriography/colour research, fingerprint math, sources.
- `claude-state/BRAND_IMAGE_RESEARCH.md` — the botanical-system research (Aesop/Art Nouveau/Morris/fleuron).

**MASTER INDEX:**
0. Pre-build checklist · 1. Typography (fonts + `.fw-*` cascade + role scale) · 2. Colour (tokens + retired + phase hues + **2.5 colourways**) · 3. The heart mark · 4. Botanical brand-image system (leaves/corners/dividers/flourishes) · 5. Bloom craft (RichBloomV2) · 5.1 Flora backbone & meaning · 5.2 Variety + flora fingerprint · 5.3 Page character · **6. Surfaces & components** (6.1 cards · 6.2 backgrounds/scrims · 6.3 buttons · 6.4 chips/inputs/sheets/toggles · 6.5 nav · 6.6 icons/links) · 7. How it's applied · **8. Component map** · **10. THE LIVING ECOSYSTEM** (v4 — lifecycle stages · fauna/omens · the rotating omen engine · safety rails · the soulful voice · craft-that-means) · 9. Appendices & in-app mirrors.

---

## 0. PRE-BUILD CHECKLIST (the 60-second gate)
> **STANDING DELIVERY RULES also apply (see CLAUDE.md):** (1) every plan/brainstorm ships as a phone-readable styled-HTML doc **and** is linked into the FoundersOS Ideas page (reachable via the IDEAS pill, never a dead route); (2) before re-working/demoing an existing page, **read it in full first — default ADD/IMPROVE, never strip existing features** unless told; (3) every update ends with a done/queued breakdown.

Before you add or change anything visual, confirm:
1. **Type** — every text node maps to a ROLE in §1 (display / heading / title / body / caption / eyebrow / control). No free-floating `fontSize`. Use the role's exact size + weight + line-height. **No half-pixel sizes. No new sizes.**
2. **Colour** — every colour is a token from §2. **No raw hex that duplicates a token.** One gold (`#A8893F`), one crimson (`#BC2E27`), one cream-paper (`#ECE7DA`). Phase colours (§2.4) are a separate semantic set.
3. **Heart** — if this is a primary page header or a brand signature, it carries **exactly one** carved-crimson heart (§3). Don't scatter it; don't recolour it; don't substitute the Lucide outline heart as the brand mark.
4. **Motif** — at most **one** botanical line-motif per viewport, stroke-only, low opacity, never behind readable text (§4).
5. **Bloom** — use the canonical `RichBloomV2` from **`src/components/brand/flora.jsx`** (never a flat reimplementation). The species must be **recognisable** (§5.0 — a rose reads as a rose), rendered at **generous scale**, pale blooms kept defined; animation is breath/sway only, GPU-cheap, `prefers-reduced-motion`-gated. Make variety **visible** (distinct species per section / bouquets), never one lone bloom.
6. **Surfaces/components** — snap to the spacing scale; cards, backgrounds/scrims, buttons, chips/inputs/sheets/toggles, nav, icons & links all follow §6. Buttons accent-driven (not legacy `.fw-btn`); icons Lucide/SVG only; one motif per fold. **Page background = `PAPER_BG` (not a flat `backgroundColor`).**
7. **CARDS (§6.7) — import from `src/components/brand/Card.jsx`; NEVER hand-roll a `<div>` card.** Pick the typed variant for the content (Article/Story/Video/Audio/Book/DailyStory/Horoscope/Summary/Recommendation/LogAction). Every card carries a hook + line (or a real snippet / inline player) AND an inline action; **no empty/dumb containers, no blank fallbacks.** Inline media plays IN the card; every open/CTA **deep-links the exact item full-screen, never a parent list**.
8. **PAGE STRUCTURE (§6.8) — the signature top.** A primary page opens with `FwFloraHero` (flora hero) → ONE `SummaryCard` → page-specific content (all rich cards). Use `src/components/brand/PageTop.jsx`.
9. **Always**: cream/plum world, Ephesis + Cormorant + system-sans only, Lucide/SVG icons, **no emoji**, UK English, no scoreboards, no-guilt.

> **TONE DIAL — elegant AND lush, never sparse (READ THIS so "restraint" doesn't produce plain/boring results).**
> FemWell's aesthetic is **rich, lush, beautiful** — a flourishing garden, not a minimalist white app. "Restraint" here means *cohesion and craft* (one type system, one palette, organic line quality), **NOT sparseness or monochrome**. Bias toward generous beauty:
> - **Colour, not flat cream.** Use the phase hues + the 9 colourways (§2.4/§2.5) as **visible** card tints, section washes, coloured eyebrows/accents, a coloured glow behind the hero. Monochrome cream-everywhere reads as boring — add warmth and colour.
> - **Botanicals present, not faint.** Vines/leaves/blooms should be **seen and crafted** — coloured, detailed, at meaningful size/opacity (a flowering hero, trailing leafy vines, a resting butterfly, a meaning-bloom per card), not 0.06 hairlines. "One motif per fold" still holds for *cohesion*, but make that motif beautiful and present.
> - **A designed hero.** The bloom-in-cycle-ring is the centrepiece — big, lush, framed (glow, butterfly, florals).
> - **Rich cards.** Layered depth, a colourway tint, a faint botanical watermark, a coloured accent header + a meaning-bloom — crafted, not flat text boxes.
> - **Generous display type.** Use the Ephesis script (`.fw-display`/`Script`) warmly for greetings and section headers.
> Rule of thumb: if a screen reads as plain/monochrome/sparse, it is **off-brand** — push it richer.

---

## 1. TYPOGRAPHY — the type scale (roles, not sizes)

**Three font voices ONLY** (already enforced by `index.css` font-remapping; `Inter`/`Fraunces` both render Cormorant):
- **SCRIPT** = `"Ephesis","Pinyon Script",cursive` — the display script voice (page titles only).
- **SERIF** = `"Cormorant Garamond","Fraunces",Georgia,serif` — all headings + reading body. (`HAND` = the same, rendered italic for Jess's voice.)
- **UI** = `ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif` — chrome only (eyebrows, captions, controls, nav, dates).

**Never** introduce a 4th family. **Never** set `fontFamily:'Inter'`/`'Fraunces'` expecting a sans — they remap to Cormorant.

### 1.0 Font loading & the remap (the actual mechanism — `src/index.css`)
Fonts are declared as **explicit `@font-face`** (real gstatic **woff2**, `font-display:swap`) — NOT an `@import` chain (avoids the blocking fetch).
- **`Cormorant Garamond`** — `normal` + `italic`, weight `400 700`, **`size-adjust:140%`** (Cormorant's small x-height would otherwise read tiny). The reading + heading face.
- **`Ephesis`** — `normal` `400`. The display script.
- **THE REMAP:** `Inter` AND `Fraunces` are re-declared via `@font-face` to **render Cormorant Garamond** (size-adjusted 140%). So any component that sets `fontFamily:'Inter'`/`'Fraunces'` gets **Cormorant**, not a sans. This is why chrome/sans MUST use the real system stack (below), and why you must never expect a sans from `'Inter'`.
- **Chrome sans** = the **real** system stack `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` (NOT `'Inter'`).
- `--font-serif-heading: 'Cormorant Garamond','Fraunces',Georgia,serif`.

**The 3-tier `.fw-*` cascade (use the class; don't hand-roll the look):**
- **`.fw-display`** (TIER 1) — `font-family:'Ephesis','Pinyon Script',cursive` + `#inkCarve`. **SHORT page titles ONLY** (never all-caps/long — script tangles).
- **`.fw-heading`** (TIER 2) — `'Cormorant Garamond','Fraunces',Georgia,serif`, **italic + swash caps**. Section/secondary headings; the safe default when unsure.
- **Body/reading** (TIER 3) — Cormorant Garamond (the app default below the headings). Voiced/quote lines → Cormorant **italic**.
- `.fw-script` (legacy opt-in) — Ephesis with letterpress depth. `.fw-btn-primary/secondary/accent` — chrome buttons in the real system sans.

### The role table — USE THESE EXACT VALUES  ·  **v2 on-device bump (2026-06-18)**
> **On-device calibration (READ — this changed the scale).** A 390px-wide *desktop* browser window renders CSS px at roughly desktop physical size; a real phone shows the same 390 CSS px across a ~62mm screen, so every glyph is physically **~40% smaller in the hand**. Pages that "looked fine" at a 390px desktop window were too small on Halli's phone. Two fixes are now baked in: (a) the **serif faces carry `size-adjust:150%`** in `index.css` (was 140%) so all SERIF reading content renders larger on-device with **no declared-px change**; (b) the **UI/sans chrome floor is lifted to 12px** (sans gets no size-adjust, so it was the tiniest). **Nothing readable sits below 12px; real reading content is ≥13px (prefer 16+).**
| Role | Token / class | Font | Size | Weight | Line-height | Use |
|---|---|---|---|---|---|---|
| **Display** (page title) | `.fw-display` | SCRIPT (Ephesis) + `#inkCarve` | `clamp(44px,9.5vw,56px)` | 400 | 1.14 | ONE short title per page. Never all-caps, never long. |
| **Heading 1** (section) | `.fw-heading` | SERIF *italic* + swash | `clamp(27px,6.4vw,34px)` | 600 | 1.18 | Section headers. The carved-italic look. |
| **Heading 2** (sub) | — | SERIF *italic* | `20px` | 600 | 1.20 | Sub-sections, sheet titles. |
| **Title** (card/list) | — | SERIF | `18px` | 600 | 1.30 | Card titles, list headers. (renders larger via size-adjust:150%.) |
| **Body L** (lede) | — | SERIF | `17px` | 500 | 1.55 | Opening paragraph, Jess voice lede. |
| **Body** (default) | — | SERIF | `16px` | 500 | 1.55 | Default reading text. |
| **Body S** | — | SERIF | `15px` | 500 | 1.50 | Dense secondary copy, card body. |
| **Caption / meta** | — | UI | `13–14px` | 600 | 1.40 | Dates, counts, helper text. Real-content captions → **14**; bare meta may stay 13. |
| **Eyebrow / overline** | — | UI | `12px` | 700 | 1.30 | Uppercase, `letter-spacing:0.14em`. Section kicker. (was 11 — lifted to the 12px chrome floor.) |
| **Control** (button/tab) | — | UI | `14px` | 700 | 1 | Buttons, tabs, chips. |
| **Nav label** | — | UI | `12px` | 700 | 1 | Bottom-nav labels. (was 11 — lifted to floor.) |

**Allowed size set (px): 12, 13, 14, 15, 16, 17, 18, 20** + the two clamps (heading `clamp(27,6.4vw,34)`, display `clamp(44,9.5vw,56)`). **That's it.** **11px and below are RETIRED** (were too small on-device). No 9, 9.5, 10, 10.5, 11, 12.5, 15.5, 19, 21, 22, 24… (the audit found **46 distinct sizes**; the on-device review found many 9–11px content labels — collapse to this set, floor 12).
> **QA must be device-accurate:** verify at a real mobile descriptor (Playwright iPhone preset — viewport + `deviceScaleFactor` + `isMobile`), and/or **measure `getComputedStyle().fontSize` in px and enforce the floors** (chrome ≥12, content ≥13) — do NOT judge legibility from a 390px desktop window alone (it reads ~40% larger than the phone).
**Weights: 400** (Ephesis only) · **500** (reading body) · **600** (headings, titles, captions) · **700** (eyebrows, controls, nav). No 300/800.
**Line-heights: 1.14 / 1.18 / 1.20 / 1.30 / 1.40 / 1.50 / 1.55** — pick from the table, don't invent.

> **AUDIT (why this exists):** headings appeared at **25 distinct sizes (18–110px)**, body at **7 (13–16px)**, captions at **10 (7.5–12px)** — plus 11 fractional half-pixel sizes. The 3 CSS tier-classes (`.fw-display`/`.fw-heading`/body) existed but components ignored them and hand-rolled inline sizes. The fix: every node maps to a role above.

---

## 2. COLOUR — the token palette

### 2.1 Neutrals (cream / ink) — the world
| Token | Hex | Use |
|---|---|---|
| `paper` | `#ECE7DA` | Page background (under `PAPER_BG` texture). **The** cream. |
| `paperHi` | `#F4EFE3` | Cards, insets, raised surfaces. |
| `paperDeep` | `#D8CFBC` | Hairline borders, deckle edge, dividers. |
| `wax` | `#EFE3C9` | Warm-cream inset for wax seals, mic/reaction discs. |
| `ink` | `#0B0805` | Primary text (near-black). |
| `inkSoft` | `#1A140D` | Secondary text. |
| `muted` | `#2E261B` | Muted labels, dates, captions (dark brown — NOT a light grey). |
| `dusk` | `#211A12` | The one warm near-black surface (Tonight/dusk card). |

### 2.2 Accents — used sparingly
| Token | Hex | Use |
|---|---|---|
| `gold` | `#A8893F` | **THE** gold. Hairline accents, eyebrows, card left-borders, fine flourishes. |
| `crimson` | `#BC2E27` | **THE** single colour pop — the heart, and rare deliberate emphasis. |
| `blush` | `#E8B4B8` | Soft rose fills, bloom petals, gentle accent. |
| `sage` | `#8FAF8F` | Calm green accent, "tended/good" affordances. |

### 2.3 RETIRED — do NOT use (Phase-2 removes these)
- ~~`#D4AF37`~~ (generic gold, 85 uses) → use `gold #A8893F`. *(Exception: it is the ovulatory PHASE hue — see §2.4 — never a chrome accent.)*
- ~~`#A6862B`~~ (third gold, 24 uses) → `gold #A8893F`.
- ~~`#F4EDDB`~~ (legacy `--femwell-cream`, 56 uses) → `paper #ECE7DA`.
- ~~`#9B8B7A`~~ (light "muted", 81 uses) → `muted #2E261B` for text.
- ~~`#D45E52`~~ (rose variant, 30 uses) → `blush` or `crimson`.
- ~~`#3A2C1A`~~ (interior "espresso", 108 uses) → `ink`/`inkSoft`/`muted` as appropriate.

> **AUDIT:** **3 parallel colour systems** (Editorial `T`, `--femwell-*`/`--ivory` CSS vars, interior `TOKENS` objects) → **3 golds, 4+ roses, 3+ muted browns** live at once. Canonicalise to the tokens above.

### 2.4 Phase colours (SEMANTIC — separate set, do not "fix" to brand accents)
Cycle phase hues are intentionally their own palette (used in rings, phase tints):
`menstrual #BC2E27` · `follicular #8FAF8F` · `ovulatory #D4AF37` · `luteal #8E6E8E (plum)`.
These read as the cycle's seasons. **Brand chrome gold stays `#A8893F`; the ovulatory phase hue stays `#D4AF37`** — they coexist by context (a phase ring vs a UI accent), never interchanged.

### 2.5 Colourways (the flora variety palette — colour carries meaning)
The flora glyphs (§5) are parameterised by a **colourway** = `{petal, tip (lit), accent}`. In floriography **colour changes meaning**, so these are meaningful, not decorative (a white poppy ≠ a crimson poppy). The **9 canonical colourways** (`COLORWAYS` in `pages/BrandCraftSample.jsx`):
| Colourway | petal / tip / accent | Meaning (colour-floriography) |
|---|---|---|
| **Crimson** | `#BC2E27` / `#D9554E` / `#2E261B` | love · passion · remembrance |
| **Blush** | `#E8B4B8` / `#F4D9DC` / `#A8893F` | grace · gratitude · tenderness |
| **Gold** | `#D4AF37` / `#E8CE78` / `#6B5840` | joy · friendship · radiance |
| **Sage** | `#8FAF8F` / `#B6CDB6` / `#2E261B` | renewal · hope |
| **Plum** | `#8E6E8E` / `#B196B1` / `#D4AF37` | dignity · wisdom · admiration |
| **Lavender** | `#B6A6C9` / `#D4C9E2` / `#8E6E8E` | devotion · serenity |
| **Cream** | `#E4DAC1` / `#F2EAD6` / `#A8893F` | purity · reverence · a fresh start |
| **Coral** | `#E08A6A` / `#F0B79E` / `#8E3B2C` | warmth · enthusiasm |
| **Sky** | `#9FB6C9` / `#C3D2DE` / `#5F7E8E` | trust · loyalty · constancy |
The same colourways drive the **creatures** (white butterfly = the divine/ancestor · blue = tranquillity · gold = confidence/joy · monarch-orange = warmth). These are flower/creature palettes — **chrome still uses §2.1–2.2 tokens only**.

### 2.6 ACCESSIBILITY — contrast on a warm palette (HARD RULE)
Warm cream palettes fail WCAG AA easily because the tones are naturally close, and **the naked eye is unreliable** on them (ratios come from relative luminance — use a checker). AA = **4.5:1** normal text, **3:1** large (≥18.66px bold / 24px+).
- **Body & small text → `ink #0B0805`, `inkSoft #1A140D`, or `muted #2E261B` ONLY** (near-black on cream clears 4.5:1 comfortably; `muted` is a dark brown, NOT a light grey — that's why it passes).
- **`gold` / `crimson` / `sage` / `blush` are for LARGE display, accents, borders & icons — NEVER body or small captions** (they risk failing AA on cream).
- **Anti-muddiness law (the premium fix):** one clean light ground + **ONE** saturated accent (crimson) + **ONE** deep anchor (ink). The §2.3 retirement of the mid-brown duplicates IS this rule — keep it strict; mid-tone-brown clutter is what makes warm palettes read cheap.
- **Action:** record measured ratios for each text/bg token pair in a small table (a Ms Accessibility verification task).

---

## 3. THE HEART / LOVE BRAND MARK
The brand mark is the **carved crimson heart** — `Heart` in `Editorial.jsx` (a hand-cut SVG path, `fill #BC2E27`, tilted `-6°`, a white specular highlight). It is **not** the Lucide outline heart.

**Rules:**
- **Colour:** always `crimson #BC2E27`. Never recolour, never outline-only.
- **Size:** `13–18px` inline beside/beneath a page title; `~16px` in the footer signature.
- **Placement:** **exactly ONE per surface** — it is the single colour pop. It belongs in (a) every **primary page's title/header** area and (b) the **footer brand signature** (`BrandHeart` in `Layout.jsx`). Not scattered through a list; not on every card.
- **Lucide `Heart`** may be used for a *functional* "like/save/love" control, but it is visually distinct from the brand mark and never stands in for it in a header.

> **AUDIT:** the carved heart shipped to only **~2 primary pages** (Journal, Community) + partner-mode + demos. **Absent from Today, Garden, Health, Lifestyle, Nutrition, Planner, Insights.** **Phase 2 rolls it to every primary hub header.**

---

## 4. THE BOTANICAL BRAND-IMAGE SYSTEM (leaves · vines · corners · dividers · flourishes) · EXPANDED v2 (2026-06-17)
A small, disciplined library of **hairline botanical line-art** — stroke-only `<path>`/`<svg>`, **never filled shapes** (except a faint ≤0.10 tint inside a leaf outline). It is **one hand**: same line quality, same restraint, across every element. **Reference implementation:** `LeafGlyph` / `CornerSprig` / `BrandFrame` / `SprigDivider` / `FleuronDivider` / `HeaderFlourish` / `VineMotifV2` / `LeafDivider` in `pages/BrandCraftSample.jsx` (live `/BrandCraftSample`).

> **Design principles (researched):** Art Nouveau treated organic growth as *structural logic* and a line as *a force* — motifs **grow** from a corner/stem along an **asymmetric, accelerating S-curve (the "whiplash" line)**, never a stiff symmetric arc. Vary **real species** rather than repeating one shape (William Morris's twisting vines). The fleuron (oldest typographic ornament) divides text with a small inline mark, not a heavy rule. And, per Aesop's restraint: **maximum effect from minimal means** — one motif per viewport, hairline, low-opacity, "frame not fill". Restraint is what keeps it from reading theme-park literal.

### 4.1 Leaf library (varied species + venation)
Six base forms, each with its **own venation** in a **vein-gradient stroke** (darker at the base → fading to the tip), `stroke-width` 0.6–0.85 for veins, 1.0–1.1 for the outline, `linecap:round`:
- **Ovate** (pinnate) · **Willow/lanceolate** (narrow, shallow pinnate) · **Serrate** (toothed edge) · **Cordate** (heart base, **palmate** fan) · **Fern frond** (a rachis + paired leaflets, no outline) · **Sprig** (short stem + 2 mini-leaves + a bud dot).
- Never repeat a single leaf shape across a composition — pick from the set so it reads hand-drawn, not stamped.

### 4.2 Corner-treatment system
Corners "grow" inward from the corner; draw for top-left, **rotate** 90/180/270 for the others.
- **Sprig** — a whiplash stem out of the corner with 2–3 varied leaves + a bud (the warm default).
- **Carved** — an **engraved double right-angle rule** with a small leaf in the elbow; the carved look = a light bevel stroke (`#FFFDF7`, offset ~0.7px) **under** the ink/gold rule — **no blur**.
- **Tendril** — a coiling whiplash curl (most decorative; use sparingly).
- **Frame** (`BrandFrame`) — the same corner element in all four corners of a **feature** card/hero. **Not** on every card.

### 4.3 Dividers & flourishes
- **Leaf rule** (`LeafDivider`) — a hairline rule broken by one **veined** leaf-eye (everyday section break).
- **Sprig divider** — a centred horizontal stem with alternating small leaves, fading at both ends (gradient).
- **Fleuron divider** — two short rules + a small **quatrefoil/leaf fleuron** + a gold dot (chapter-grade break).
- **Header flourish** (`HeaderFlourish`) — two **mirrored** mini-sprigs flanking a page title or the heart mark.

### 4.4 Usage & restraint (hard rules)
- **One motif per viewport** (a corner OR a divider OR a header flourish — not all at once on the same fold). A `BrandFrame` counts as the one motif for that surface.
- Stroke in `ink` / `gold #A8893F` / `sage #8FAF8F` (and `plum #8E6E8E` for a cool accent) at **low opacity**: backgrounds `0.06–0.12`, a section divider up to `~0.3`, a corner/frame `~0.5–0.8`. Sit it over `PAPER_BG`; **never behind reading text**.
- **Don't:** no emoji, no clip-art, no filled/3D leaves, no repeating wallpaper tile, no motif competing with text, no more than one per fold.

**Perf (hard):** pure SVG strokes + at most one small gradient = cheap. **Never** apply `feGaussianBlur`/blur to any motif. **Motifs are static in-app** (the gentle leaf sway is a `/BrandCraftSample` showcase nicety only; if ever used in-app it's a few nodes, CSS-transform only, `prefers-reduced-motion`-gated).

> **AUDIT:** botanicals were documented but barely implemented. This expanded system (leaf library + corners + dividers + flourishes) is the canonical brand image; Phase 2 / the Today build roll it consistently from here.

---

## 5. BLOOM / ILLUSTRATION CRAFT STANDARD  ·  RECOGNISABILITY v3 (2026-06-19)
**Canonical engine (the source of truth):** `RichBloomV2` in **`src/components/brand/flora.jsx`** — production surfaces import from here. (`<Bloom>` in `components/nurture/NurtureGarden.jsx` and the copies in `pages/BrandCraftSample.jsx` are legacy/sample; de-dup toward `flora.jsx`.)

### 5.0 THE RECOGNISABILITY STANDARD (v3 — the thing most criticised, now fixed)
> **The #1 rule of the flora: a rose must read as a rose.** The prior failure was every species sharing **one radial silhouette** (a ring of identical petals + a centre), so peony ≈ camellia ≈ ranunculus and only colour changed — "the same basic slop." The v3 standard fixes this:
- **Silhouette FIRST, colour second — bespoke geometry PER SPECIES.** Recognition is carried by the outline + signature feature, not the hue. Each species has its own head builder (or its own ring grammar with a per-species petal silhouette: cup/broad/lance/point/ruffle).
- **The three HEROES + their non-negotiable signatures:**
  - **ROSE (the hero)** = three rings of reflexed cupped **guard petals** coiling into a **VISIBLE SPIRAL furled heart** (overlapping crescent "wrap" petals, scaling down ~×0.115/turn at ~52°). The spiral eye must read.
  - **SUNFLOWER** = two rings of pointed **ray florets** around a **big seed disc** with a real **phyllotaxis spiral** (golden-angle 137.5°, ~150 seed dots), browned disc.
  - **HIBISCUS** = **5 broad veined petals** + a **deep dark throat** + the **projecting staminal column** (anthers along it, **5 stigma lobes** at the tip). The column is the signature — keep it long/prominent.
- **Distinct silhouettes across the set:** peony = full **ruffled pompom** (broad rounded petals, packed, soft pale heart, NO dark eye — never spiky); dahlia = sharp **geometric pointed star-ball**; tulip = **closed goblet**; poppy = **broad papery petals + dark boss**; lily = **6 recurved lance tepals + protruding stamens/anthers**; magnolia = **open broad tepals + carpel cone**; lotus = **layered pointed lance**, serene. (Engine forms: rose·sunflower·hibiscus·peony·dahlia·tulip·poppy·lily·magnolia·lotus·cosmos·snowdrop·foxglove·fern + the ring forms camellia/ranunculus/marigold/chrysanthemum/anemone/cornflower/forget/daisy/hellebore.)
- **GENEROUS SCALE.** A bloom is a centrepiece, not a tiny sticker — small renders kill the detail that makes it recognisable. Heroes render large; meaning-blooms on cards are the small exception (`FlowerGlyph`, simplified).
- **PALE BLOOMS HOLD THEIR EDGE (v3).** Cream/blush/sky petals melt into the cream page; the engine now **deepens the petal base + throat for high-luminance petals** (`lum(color) > 0.62 → darken ×0.26/×0.42`) so the silhouette survives on `paperHi`. Never ship a pale bloom that reads as a faint smudge.
- **VARIETY MADE VISIBLE.** Don't show one lone bloom per page. Use a **different signature species per page/section** (§5.3), **bouquets** (`Bouquet` — a posy of DIFFERENT blooms), and the Flora Lab (`/FloraLabDemo`) leads with rose/sunflower/hibiscus **side-by-side** so the distinctness is provable.
- **CREATURES are real, EARNED, and ON the plant.** Butterflies are proper **four-wing** creatures (forewing + hindwing + body + antennae + pattern-driven eyespots) — not blobs; `BloomWithCreature` rests them physically on a petal/leaf/flower. One at a time, on a real moment, then they drift off (§5.1).
- **Before/after proof:** `workspace/flora/before-after.png` + `real-proof-full.png` (server-rendered from the real engine).

**Craft standard (the elevated "wow" bar — petals must look lifelike, not flat ovals):**
- **Petal geometry:** real **notched/bespoke petal `<path>`s** — **never rotated ellipses**. Build a head from **layered rings** (deep outer ruff → mid offset layer → lit inner crown) OR a bespoke per-species head (rose/sunflower/hibiscus/lily/magnolia/tulip/snowdrop/foxglove/fern/peony). Layering + offset = real depth.
- **Shading:** **4–5-stop gradients** running lit-tip → shadowed-throat; rings step in tone (outer base in shadow, inner crown lightest); a faint low-opacity petal **edge-stroke** (`~0.4w`, `~0.16–0.22 opacity`) separates petals — this linework is what reads as *illustration*, not blob. A soft **throat occlusion** radial seats the petals.

**Craft standard (the elevated "wow" bar — petals must look lifelike, not flat ovals):**
- **Petal geometry:** real **notched petal `<path>`s** (a cupped, heart-tipped silhouette) — **never rotated ellipses**. Build the head from **three layered rings**: a large **deep outer ruff** → a **mid** layer (offset between the outer petals) → a small **lit, curled inner crown**. Layering + offset rings = real depth.
- **Shading:** each ring has its **own multi-stop (3-stop) gradient** running tip→base, and the rings step in tone (outer base in shadow `darken(~0.13)`, inner crown the lightest `lighten(~0.5)`). A faint low-opacity petal edge-stroke (`~0.4w`, `~0.16 opacity`) separates petals without harshness.
- **Centre:** a warm radial centre (gold family) with a ring of small **stamen dots** + a tiny lit centre highlight.
- **Light:** **dewy speculars** — a soft top-left sheen ellipse + 1–2 tiny white dew dots near the crown (consistent top-left light source). They **shimmer faintly** (opacity 0.45↔0.85).
- **Stem/leaves:** a **refined tapered stem** (a filled sliver with a green gradient, gentle S-curve — not a flat 2.4px stroke) + **veined leaves** (leaf fill + a midrib stroke + 2–3 fine side-veins).
- **Depth/shadow:** ONE soft **grounding shadow** beneath the bloom — a single `feGaussianBlur` ellipse (`stdDeviation ~1.9`). **This is the ONE permitted blur node** (per bloom, static).
- **Motion:** **breath** (scale 1→1.035 on the head group, `transform-box:fill-box; transform-origin:center`) + **multi-axis sway** (wrapper div, `rotate ±1.5°` + a slight `translateY` nod, `transform-origin:bottom center`) + the **dew shimmer** + a one-shot **settle** on arrival (`translateY+scale` fade-in). **Stagger** `animation-delay` by index so multiple blooms desync. CSS transforms/opacity only. One shared `<style>` keyframe block. Always `@media (prefers-reduced-motion:reduce){animation:none}`.

**Perf rules (hard) — MEASURED:**
- The ONLY blur is the single grounding-shadow node **per bloom** (static, rasterised once). **Never** `feGaussianBlur` across petals or any animated node.
- Animate the bloom GROUP, not each petal. One keyframe block per page, not per bloom. Opacity-shimmer only on the tiny dew group.
- **Measured `/BrandCraftSample` at 390px: ~60fps with 8 elevated blooms animating** (plus the hero + comparison/scale samples on screen). GPU-composited; impact negligible.

### 5.1 FLORA BACKBONE & MEANING (flowers as the spine of the brand)
The bloom is the centrepiece of a **meaning system**: flowers are chosen for documented meaning (floriography + folk-herbalism + myth) and mean the **same thing everywhere** (garden, cycle, journal, chapters), so the app reads as one language. Deep map + sources: **`BRAND_FLORA.md`** (in-app: Founders → Brand & UX → **Flora & Meaning**). Reference craft: `RichBloomV2` · `FlowerGlyph` · `Butterfly` · `BlossomTree` · `PlantGlyph` · `Creature` · `MiniGarden` in `pages/BrandCraftSample.jsx`.

**Three timescales:** **bloom** = the day/cycle · **butterfly** = a moment of change/return (earned marker; Greek *psyche* = soul/butterfly) · **tree/orchard** = the long arc (life-stages, years, community).

**Cycle phases → flower + hue (§2.4):** menstrual → **Poppy** (rest/consolation, crimson) · follicular → **Snowdrop** (hope, sage) · ovulatory → **Sunflower** (radiance, gold `#D4AF37`) · luteal → **Dahlia** (inner strength, plum). The ring + day-bloom take the phase's flower + hue.

**Life-stages → bloom / flowering tree:** teen → Daisy · cycling → the 4 phase-flowers rotate · TTC → Lotus + Pomegranate (fertility/potential) · pregnancy → Almond-blossom arc (bud→blossom→fruit) · postpartum → Calendula + Daisy (healing) · perimenopause → Hellebore (winter rose) + Lavender · menopause → Magnolia (a second flowering) · post-menopause → the Magnolia/olive canopy (elder arc).

**Companion species (meaning, retroactively):** peony = flourishing · foxglove = the heart-flower (folklore protection + literally heart-medicine) · fern = resilience · daisy = beginnings · + add forget-me-not (memory), lotus (rebirth), snowdrop (hope), sunflower (radiance).

**Emotional/journal flowers:** grief → forget-me-not + rosemary + white lily · rest → lavender + poppy · joy → sunflower + daisy · courage → borage + yarrow + iris · love → honeysuckle + rose · hope → snowdrop + daffodil.

**WHOLE-LIFE FLORIOGRAPHY (v3 — beyond the cycle; *health is one room, not the house*).** The dictionary must serve every life domain, reusing the same colourway + earned-creature grammar (no new mechanic, just more meanings):
| Life domain (not the cycle) | Flower(s) | Meaning | Where it surfaces |
|---|---|---|---|
| Career / ambition / a win | **Gladiolus**, orange lily, amaryllis | strength of character; a real achievement | Planner goal complete · a "you did it" bloom |
| Courage / under pressure | **Snapdragon**, borage, iris | grace under pressure; courage | Journal "hard day" · a brave first post |
| Friendship | **Sunflower + Daisy**, zinnia, freesia | cheerful loyalty; enduring friendship | Community (sage + clover + bee, §5.3) |
| Love / dating / marriage | **Honeysuckle**, rose, primrose, camellia | devoted, steadfast love | Relationships content · a partner moment |
| Grief / remembrance | **Forget-me-not + Rosemary**, white lily | remembrance, condolence | Journal grief · loss support |
| Joy / celebration | **Sunflower + Marigold + Daisy** | radiance, warmth, cheer | Today good-news · a celebratory butterfly |
| Rest | **Lavender + Poppy + Chamomile** | calm, restful sleep | Tonight/dusk · luteal |
| New beginnings | **Snowdrop + Daffodil**, almond blossom | hope; a fresh chapter | new job/chapter · follicular |
| Identity / self-expression | **Orchid**, iris | refined self-assurance; voice | Profile · an identity moment |
| Motherhood | **Almond blossom + Calendula + Daisy** | new life; healing | pregnancy/postpartum |
| Eldership / wisdom | **Magnolia + Hellebore + Sage** | a second flowering; resilience; wisdom | peri/menopause |
Colour still changes meaning (§2.5): a **red/orange gladiolus** = a real achievement, a paler one = general strength; a **monarch** (migration/return) for a life-stage crossing vs a common-blue for a gentle return.

**Combinations (a pairing makes a sentence):** forget-me-not + rosemary = remembrance · lavender + chamomile + poppy = rest · snowdrop + crocus + daffodil = a fresh start · lotus + pomegranate = fertile potential · sunflower + daisy = cheer/friendship · marigold + borage (companion planting) = "we help each other bloom".

**Pollinators are EARNED, never ambient** — one at a time, then they drift off: **butterfly** = transformation/return (visits on a comeback, chapter, or life-stage crossing) · **moth** = the menstrual/night/rest dark · **dragonfly** = insight (Pulse) · **bee** = community (garden-of-gardens) · firefly = inner light/hope · snail = patience.

**Colour-changes-meaning rule:** because the glyphs are colourway-parameterised (§2.5), a white poppy (purity/rest) ≠ a crimson poppy (remembrance) — colour is part of the meaning, not decoration.

### 5.2 VARIETY + THE FLORA FINGERPRINT (per-user uniqueness)
**The library (counts):** **18 flower types** (`FlowerGlyph`: poppy/snowdrop/sunflower/dahlia/lotus/forget-me-not/violet/cornflower/camellia/lavender/primrose/heather/tulip/rose/iris/daffodil/bluebell/carnation) · **6 plants** (`PlantGlyph` + `LeafGlyph` frond: fern/succulent/grass/ivy/bamboo/moss + the cycle herbs) · **8 creatures** (`Creature`: butterfly/bee/dragonfly/moth/ladybird/hummingbird/snail/firefly).
**The colourway multiplier:** every glyph is **parameterised** by a §2.5 colourway (`color`/`color2`/`accent`) + butterfly **`pattern`** (spots/bands/tips/eyes/plain). → **18 × 9 = 162 flower variants**; butterflies **5 × 9 = 45**; full creature set **100+**. One drawn shape → many variants, no hand-drawing.
**The flora fingerprint** (`MiniGarden` reference, future-wired from `userId`): a garden is a **portrait, not random** — a heraldry-blazon-like grammar, **deterministically seeded** by a hash of **profile + sign-up season** (base palette + signature flower) × **life-stage** (governing bloom/tree) × **cycle phase** (active flower) × **the life-areas she tends** (which plants/companions grow) × **what she's earned**. Same seed → **same garden on every device**, recognisably hers. **Rarity tiers earned, never bought/random:** common → uncommon (a 2nd species) → rare (a rare bloom / creature visit on a milestone) → heirloom (the flowering tree → orchard).
**Permutation space ≈ 1.4 billion:** ~26,000 two-flower pairings (162²) × 6 plants × ~100 creature variants (incl. none) × 9 base palettes (BRAND_FLORA §7.1) — so no two gardens repeat.

### 5.3 PAGE CHARACTER (one identity, different per page)
Each surface gets a **flora signature** (palette lean + signature species + creature) drawn from the one dictionary: Journal = gold + willow/rosemary + moth · Community = sage + meadow/clover + bee · Nutrition = blush-green + herbs/grasses + ladybird · Cycle/Health = phase-hue + phase-flower + dragonfly/moth · Pulse = plum + dragonfly · Garden = the full palette. Character changes the **accent + signature only — never the bones** (type/tokens/layout). Different page-to-page, unmistakably one brand.

**Craft/perf for these elements:** `Butterfly` = SVG strokes+gradients with a gentle **drift** + faint wing **flutter** (isolated group transforms, reduced-motion-gated); `FlowerGlyph`/`PlantGlyph`/`BlossomTree`/`Creature` are **static** line-art. **No blur anywhere except the bloom's one isolated shadow.** Big library, calm view: one bloom centre-stage, one motif per fold, a creature only on a real moment.

---

## 6. SPACING, SURFACES & COMPONENTS (every element's brand look)
**Spacing scale (px):** `4, 8, 10, 14, 18, 22, 26` — snap margins/gaps to these. **Depth philosophy:** cream-on-cream — lean on hairline borders + a *tiny* shadow, never heavy drop-shadows.

### 6.1 Cards (the canonical surface — Today/hub cards)
- **Standard card:** `background paperHi #F4EFE3` · `1px solid paperDeep #D8CFBC` · `border-radius 16–18px` · `padding 14–17px`.
- **Feature / slide card:** radius `18–20px`, `padding 16–21px`, the **layered editorial shadow** `0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)` (the `SLIDE_CARD` look). Reserve for hero/slider/feature cards; everyday cards stay flatter.
- **Accent rim:** a `3–4px` **left border** in the surface accent (`gold`/`sage`/`crimson`/`plum`/`blush`) — the signal a card "belongs" to a section.
- **Card header:** `ICON_DISC` (a 32px wax `#EFE3C9` rounded-9 disc, `1px solid paperDeep`, an accent-coloured Lucide icon) + an **Eyebrow** (UI 11/700, uppercase, `letter-spacing 0.14em`, accent) on the same row; then the **Title** (SERIF 18/600). Optional "Today" sub-eyebrow inside.
- **Tonight/dusk** variant only: the one warm near-black surface (`dusk #211A12`, cream text).

### 6.2 Backgrounds, surfaces & scrims
- **Page:** every page sits on **`PAPER_BG`** (`Editorial.jsx`) — `paper #ECE7DA` + a soft top-left light, a gentle edge vignette, a cream wash for legibility, over a real paper-grain woff2 image. Never a flat fill, never a gradient-of-the-week.
- **Raised surfaces:** cards/insets step up to `paperHi #F4EFE3`; hairlines/dividers/deckle use `paperDeep #D8CFBC`.
- **Botanical-motif background:** at most **one** motif per fold (§4) — a corner vine/sprig at **opacity 0.06–0.12**, a section divider up to `~0.3`. **Never behind reading text**, never a repeating wallpaper, never blurred.
- **Section background:** group content into `paperHi` cards on the `paper` page; don't tint section backgrounds with arbitrary colour — differentiate by the accent rim + the flora signature (§5.3), not a coloured panel.
- **Bottom-sheet scrim:** a dim overlay `rgba(11,8,5,0.40–0.45)` (warm near-black), fade-in `~0.22s`; reduced-motion-safe.

### 6.3 Buttons
- **Primary (solid CTA):** solid fill in the surface **accent** (the warm rose/`crimson #BC2E27` for the main action, or the section accent), **white text**, UI **14/700**, `letter-spacing 0.01–0.04em`, a soft shadow. **Inline action button** (`ActionBtn`): `border-radius 12`, `padding 11×15`, an inline Lucide icon + label. **Pill CTA**: `border-radius 999` for standalone primary actions.
- **Secondary:** `transparent` background, **`1.5px` border** in the accent (or `paperDeep`), accent/`ink` text, same size/radius as primary.
- **Tertiary / open-link button:** text + a trailing `ChevronRight` (14px), UI **13/700**, `muted` colour (see §6.6 links).
- **Disabled:** reduce opacity to ~0.5, `cursor:default`; never grey it into a different palette.
- *(Legacy `.fw-btn-primary/secondary/accent` in `index.css` are plum/rose-dust pills on the old CSS-var palette — superseded by the accent-driven editorial buttons above; don't introduce new uses.)*

### 6.4 Chips/pills · inputs · sheets · toggles
- **Chips / pills (filter, phase, select):** `border-radius 9999` (or `10`), UI **13/600–700**, `padding 6–8×12–14`. **Selected** = accent fill + white text (or accent-tint `${accent}1F` bg + accent text + accent border); **idle** = `paper`/transparent bg + `paperDeep`/accent hairline border. A phase chip carries its phase hue.
- **Inputs / textareas:** `background paper #ECE7DA` (or warm `#FBF6E6`), `1px solid paperDeep`, `border-radius 10–12`, `padding 11×13`, **reading text in SERIF 16**, `outline:none`; **focus** = accent border. Placeholder in `muted`.
- **Bottom-sheets:** `background paperHi`, **top-rounded only** `border-radius 20–22px 20–22px 0 0`, `padding 18px`, `box-shadow 0 -8px 32px rgba(11,8,5,0.22)`, **slide-up** `~0.3s cubic-bezier(.32,.72,.24,1)` over the §6.2 scrim; `max-height ~86vh`, internal scroll; reduced-motion-safe; Escape/tap-scrim to close; scroll-locked behind.
- **Toggles / checkboxes:** native checkbox with `accentColor` = the section accent; a completed row strikes through + drops to ~0.5 opacity (the checkable Your-Day rows). No custom toggle skins that drift off-palette.

### 6.5 Navigation
- **Bottom nav:** **ONE unified bottom nav at all viewports** — UI 11/700 labels, Lucide icons, the active item in the accent/plum; the centre Jess FAB is the warm rose/crimson disc.
- **Slider nav (dots + arrows — `CardStack`):** pagination **dots** `6px` circles — active = **gold `#A8893F`** (the planner uses the `#D4AF37` phase-gold), scaled `1.25`; idle = `#D4C9B4`. **Arrows** = `22px` transparent round buttons with a `muted` `ChevronLeft/Right` (14px). Motion = **smooth scroll** + `320ms cubic-bezier(.16,1,.3,1)`.
- **Month/week arrows (calendar):** transparent buttons, `muted` chevrons (18px), swipe support.

### 6.6 Icons & links
- **Icons:** **Lucide / inline SVG ONLY — never emoji.** Stroke-weight `~1.6–2`, inline sizes `14–18px`, coloured `ink`/`muted` for chrome or the accent for emphasis. The **`ICON_DISC`** (32px wax disc) frames a section's icon (§6.1).
- **Links / "open the full page":** inline-flex, UI **13/700**, `muted`, with a trailing `ChevronRight` (14px) — e.g. "Open your Health letters ›". Reading-body inline links stay in `ink` with a subtle weight bump, not a blue underline.
- **The carved heart** (§3) is a brand mark, not an icon — never substitute the Lucide outline heart for it in a header.

### 6.9 MOTION — breath, not bounce (v3 tokens)
FemWell's motion is **calm and organic** — the feel comes from slow ease + the bloom's breath/sway, **never springs/bounce** (bounce reads playful/cheap for a premium calm app).
- **Easing tokens:** `ease-out` = `cubic-bezier(.215,.61,.355,1)` (enter/exit) · `ease-in-out` = `cubic-bezier(.77,0,.175,1)` (on-screen move) · sheet curve `cubic-bezier(.32,.72,.24,1)` (§6.4) · slider `cubic-bezier(.16,1,.3,1)` (§6.5). All ease-out-family — keep them.
- **Duration tokens:** micro **120ms** (taps/toggles) · standard **200ms** (tooltips/dropdowns) · sheet/drawer **300ms** · scrim fade **220ms**. **Exits ~20% faster** than entrances.
- **Performance:** **transform & opacity ONLY** (GPU; skip layout/paint). `will-change:transform` for shaky animations.
- **No bounce anywhere.** High-frequency actions (bottom-nav, card taps — touched 100+/day) stay **≤120ms or un-animated** — calm comes partly from *not* animating what you touch constantly.
- **Reduced-motion is mandatory** on EVERY animated node: `@media (prefers-reduced-motion:reduce){animation:none}` — no exceptions, even for opacity/colour. *(Source: Emil Kowalski / web-animation principles; citations in the research doc.)*

---

## 6.7 THE CARD SYSTEM — a FIRST-CLASS brand pillar (taxonomy · anatomy · sizing) · v1 2026-06-19
> **Cards ARE the brand language, not decoration.** A card is **never an empty/dumb container.** Every card carries something at a glance AND an inline action. **Build from the shared family `src/components/brand/Card.jsx` — never hand-roll a `<div>` card.** The shell is the Today "across your day" per-section card, standardised.

### 6.7.1 The ONE card family + reference dimensions
- **Reference = the Today "across your day" per-section card** (`TodayOption2` `TodayCard`). The shared primitive **`FwCard`** reproduces it verbatim and is the ONLY card shell: `width 365` (`FW_CARD_W`, ~85vw so the next card peeks) · `minHeight 488` (`FW_CARD_MINH`) · `background linear-gradient(165deg, paperHi 0%, ${accent}14 100%)` · `1px paperDeep` border + **`4px` accent left-rim** · **4-corner sprig frame** (`CardCorner`×4, size 46 / opacity 0.6) · `borderRadius 20` · `padding 20` · the layered editorial shadow (`0 4px 20px / 0 1px 4px rgba(58,44,26,…)`). One brand-lush family — same size, framing, flora, type, content length everywhere.
- **Rows of cards** use `FwCardRow` (the Today scroll-snap track: `gap 14`, `scroll-snap x mandatory`, peek), labelled by section/type.

### 6.7.2 ANATOMY (what every card carries — never empty)
1. **Header** — `ICON_DISC` (32px wax disc, accent Lucide icon) + an **Eyebrow** (UI 12/700 uppercase, accent) = the type/section + a **meaning-bloom** (`FlowerGlyph` size 30, accent, §5.1) on the right.
2. **Media / visual** (optional) — an inline player or cover image ABOVE the hook (see 6.7.4).
3. **Hook** — `h3` SERIF **20/600**, ink, 3-line clamp. The one-glance line that earns the card.
4. **Line** — `p` SERIF **16/500**, inkSoft, 4-line clamp. The supporting detail/summary/snippet.
5. **Inset** (optional) — a quote/snippet panel (paper inset, UI eyebrow + Cormorant italic).
6. **Action area** (pinned bottom, `margin-top:auto`) — the **inline action** (6.7.4) + the **open-full-screen deep-link** (`muted` UI 13/700 + ChevronRight).
> **No hollow cards:** if there's no data, show a warm, specific empty/fallback state with an action — never a blank box. Recommendation/summary cards always render at least a curated fallback line.

### 6.7.3 TAXONOMY (typed variants — all in `brand/Card.jsx`)
| Variant | Carries at a glance | Inline action | Deep-link |
|---|---|---|---|
| **`ArticleCard`** | title + summary | — | `Read this` → the article full-screen |
| **`StoryCard`** | title + summary | — | `Read this` → the story full-screen |
| **`VideoCard`** | inline cover + title | **plays the video IN the card** (`InlineVideo`) | `Open full-screen` → the item |
| **`AudioCard`** (podcast) | title + channel | **plays the audio IN the card** (`InlineAudio` play/pause) | `Open episode` → the episode |
| **`BookCard`** | a **paragraph hook** + author | — | `Open this book` → **`/BookReader` / `/FictionReader` on THAT book** (never the Read list) |
| **`DailyStoryCard`** | today's chapter title + opening line + excerpt inset | — | `Read today's chapter` → the reader |
| **`HoroscopeCard`** | a **REAL snippet** ("The moon is …" + the reading line), not just a label | — | `Read your reading` / `Set up your sky` |
| **`SummaryCard`** | the page's signal-driven "what to do today" rows | each row taps to its target | rows deep-link the specific item |
| **`RecommendationCard`** | a single "for you" pick + WHY | — | `Open this` → the item |
| **`LogActionCard`** | a prompt | **log / check / answer in place** (parent-supplied) | — |

### 6.7.4 INLINE ACTIONS (the card DOES something, here)
- **Play media in-card:** `InlineVideo` (native `<video controls>` on `video_url`) and `InlineAudio` (play/pause over `<audio>` on `audio_url`) render IN the card. No navigation to play.
- **Act in place:** log / check / tick / answer handled by the parent via `LogActionCard` children (writes ride existing dispatcher actions — **never a new function**, 50-fn cap).
- **Deep-link the EXACT item, full-screen:** the open-link/CTA always targets the specific item route (`/LifestyleDetail?id=`, `/BookReader?gutenberg_id=`, `/FictionReader?id=`, the specific programme/journal-series), **never a parent list/tab** the user must then sift.

### 6.7.5 SMART PER-SECTION RECOMMENDATION (signal-driven, varies, never hollow)
- Each section's card chooses its item from **real signals** (recency, cycle phase, engagement, what she's saved/skipped, time of day) and **changes over time** — not a static pick.
- **Graceful fallback chain:** real personalised pick → recent/trending in that type → a warm curated line + an action. The card is **never** blank and never a dead "coming soon."

---

## 6.8 CANONICAL PAGE STRUCTURE — the brand SIGNATURE on every page · v1 2026-06-19
> Halli's brand language: **every primary page opens with the SAME signature top, then varies below.** Build it from `src/components/brand/PageTop.jsx` (`FwFloraHero`) + `brand/Card.jsx` (`SummaryCard`).

**The signature (top of every page):**
1. **FLORA HERO** (`FwFloraHero`) — a large brand **flower** (`RichBloomV2`, the page's §5.3 character colourway / the user's flora fingerprint) inside a **purely DECORATIVE botanical ring** (dashed gold + thin sage — **NOT** the cycle ring; only Today's hero encodes cycle phase), a soft glow, an optional resting butterfly, the single carved **Heart** (§3), an **Ephesis script page title**, and a short warm line. Flanking **meaning-blooms** optional.
2. **ONE SUMMARY CARD** (`SummaryCard`) — directly under the hero: a signal-driven "what's here / what to do today" glance (6.7.5), never hollow.
3. **PAGE-SPECIFIC CONTENT BELOW** — rich cards / per-type `FwCardRow`s / the page's own surfaces. **Pages differ here; they all share the signature top and all use the §6.7 cards.**

**The FLORA STORY (app↔user) — why the hero flower matters (`BRAND_FLORA.md`).** The hero bloom is not ornament: flowers carry documented meaning (floriography + cycle/folk-herbalism) and mean the **same thing everywhere** (garden, cycle, journal, chapters). The page-character flower (§5.3) + the per-user **flora fingerprint** (§5.2) make each page feel like *hers* and tie the whole app into one living garden — the hero is the daily face of that garden. Keep the cycle ring exclusive to Today; elsewhere the ring is decorative so the signature reads as "your garden," not "your cycle."

**Consistency rule:** the hero + summary-card top is **fixed brand chrome** — same structure, type, flora discipline on Journal, Community, Nutrition, Lifestyle, Health, Planner, Profile, Programs, Garden. Only the flower/colourway (character) and the content below change.

---

## 7. HOW THIS GETS APPLIED
- **Phase 1 (this doc):** define + sample. ✅
- **Phase 2 (on approval):** unify inline type to the role table app-wide; canonicalise colours (retire §2.3); roll the heart to every primary header; add botanical motifs per §4; replace flat demo blooms with the upgraded canonical `<Bloom>`.
- New work conforms from now on (CLAUDE.md gate). When you touch a file for any reason, opportunistically snap its type/colour to this spec.

---

## 8. COMPONENT MAP (what to reuse — where each piece lives)
The brand system is already in code as reusable parts. A future build (the real Today, Phase-2 rollout) **reuses these — do not re-derive**:
| Piece | Where | Notes |
|---|---|---|
| **Fonts + `.fw-*` cascade** | `src/index.css` | `@font-face` (Cormorant/Ephesis woff2) + the Inter/Fraunces→Cormorant remap; `.fw-display` (Ephesis), `.fw-heading` (Cormorant italic). |
| **Tokens `T` + `PAPER_BG` + helpers** | `src/components/journal/Editorial.jsx` | exports `T` (colour tokens), `SERIF`/`UI`/`SCRIPT`, `PAPER_BG`, `Heart` (carved crimson mark), `Eyebrow`, `Script`, `Hand`, `PHASE_COLORS`, `PHASE_LABEL`, `useEditorialFonts`. |
| **Carved heart mark** | `Heart` in `Editorial.jsx` | the brand mark (§3). (Refined `CraftedHeart` reference sample lives in `BrandCraftSample.jsx`.) |
| **Canonical bloom** | `<Bloom>` in `components/nurture/NurtureGarden.jsx` | upgrade to the **RichBloomV2** spec (§5) in the build. |
| **Elevated bloom reference** | `RichBloomV2` in `pages/BrandCraftSample.jsx` | the §5 "wow" bar: notched petals, 3 rings, dewy speculars, isolated blur shadow, breath/sway/shimmer/settle. |
| **Botanical glyphs** | `pages/BrandCraftSample.jsx` | `LeafGlyph` (leaf library §4.1), `CornerSprig` + `BrandFrame` (corners §4.2), `LeafDivider`/`SprigDivider`/`FleuronDivider`/`HeaderFlourish` (dividers §4.3), `VineMotifV2`. |
| **Flower / plant / creature glyphs** | `pages/BrandCraftSample.jsx` | `FlowerGlyph` (18 types), `PlantGlyph` (5 + fern via LeafGlyph), `Creature` (8; `Butterfly` with `pattern`). All take a colourway. |
| **Colourway grammar** | `COLORWAYS` + `cwOf()` in `pages/BrandCraftSample.jsx` | the 9 palettes (§2.5); pass `{petal→color, tip→color2, accent}`. |
| **Fingerprint seed** | `hashSeed()` + `seededRng()` + `MiniGarden` in `pages/BrandCraftSample.jsx` | deterministic per-user selection (§5.2); future-wire the seed from `userId` + stage + phase + tended-areas + earned. |
| **THE CARD FAMILY (§6.7)** | `src/components/brand/Card.jsx` | `FwCard` primitive (the Today card, verbatim) + typed variants `ArticleCard`/`StoryCard`/`VideoCard`/`AudioCard`/`BookCard`/`DailyStoryCard`/`HoroscopeCard`/`SummaryCard`/`RecommendationCard`/`LogActionCard` + `InlineVideo`/`InlineAudio` players + `FwCardRow` (scroll-snap row) + `FwCardCTA` + `fwTypeOf()`. **Import these — never hand-roll a card.** |
| **SIGNATURE PAGE TOP (§6.8)** | `src/components/brand/PageTop.jsx` | `FwFloraHero` — the flora-hero (decorative ring + bloom + heart + Ephesis title + line). Pair with `SummaryCard` for the canonical top. |
| **In-app brand docs** | `components/founders/BrandIdentityDoc.jsx` + `FloraMeaningDoc.jsx` | the Founders mirrors of this file + BRAND_FLORA. |

> **NOTE (current state):** the glyph library + colourway grammar + fingerprint currently live in `pages/BrandCraftSample.jsx` (the craft sample). On lock, **promote** them to shared modules (e.g. `components/brand/flora/*`) so Today/Garden/etc. import them. Until then, `BrandCraftSample.jsx` is the source of truth for the implementations.

---

## 10. THE LIVING ECOSYSTEM — meaning, omens & the soulful voice (v4 direction · 2026-06-19)
> **STATUS: this is the v4 DEPTH layer — spec'd and ready; a few dials await Halli's steer** (see the brainstorm doc's §8 "Your call"). It turns the flora from *beautiful* (v3) into *meaningful*: a living system that ties feeling + meaning to everything and talks to her about her own life. Full pitch + the big copy bank + interactive sketches: **`femwell-handoff/LIVING-ECOSYSTEM-BRAINSTORM.html`**. Grounding research: **`workspace/OMEN_VOICE_RESEARCH_2026-06-19.md`** (+ `BRAND_RESEARCH_2026-06-19.md`).

**The three laws of the ecosystem:** (1) **nothing is static** — every plant is at a *lifecycle stage* that mirrors her season; (2) **everything can be read** — a bloom/creature/seal carries a gentle meaning she can tap to reveal; (3) **everything is keyed to her** — what appears is chosen from real signals, never a stock garden.

### 10.1 THE FLORA LIFECYCLE (the stage IS the meaning)
A flower has seasons; so does she. The SAME flower at a different **stage** says where she is — no chart, no words. Add a `stage` prop to `RichBloomV2` (pure render variants): **bud** (furled — anticipation/becoming: follicular, a new chapter, a goal just set), **bloom** (open — peak/expression: ovulation, a win), **seed** (the rose *hip* — harvest/integration/letting go: luteal, finishing, a lesson), **rest** (the bare cane *with a new bud on old wood* — restoration, **winter not death**: menstruation, postpartum, grief, a chosen pause), **return** (new bud — renewal, after time away). **HARD RULE: rest is a stage, not a failure — never draw "nothing"; draw dormancy with a bud on it.** (Rose canon: bud → bloom → hip → bare cane → new bud, botanically true.)

### 10.2 FAUNA & OMENS (a garden that speaks)
Creatures visit plants and carry a **gentle omen**. **The omen contract (every omen):** (a) kind & hopeful; (b) framed as folklore — *"they say…"* — never a promise; (c) ends in a small action or a true observation; (d) never doom, never guilt. A creature visits, speaks once, drifts off. The library (creature → folk meaning → spoken line) lives in the brainstorm doc + `BRAND_FLORA.md §6.3`; e.g. robin = news on the way · returning butterfly = change/the soul · ladybird = small luck (*as many happy months as spots — drawn with a real countable spot-count*) · bee = connection (+ the *"telling the bees"* ritual → "tell the garden your news") · dragonfly = clarity · moth = rest-night · firefly = hope · snail = patience · spider's dewy web = weaving. Plants give signs too (a bloom opened overnight, dew, a second/out-of-season bloom, the first snowdrop).

### 10.3 THE ROTATING FLORA-OMEN ENGINE (technical — NO new function)
Every section is **headed by a flower/bouquet** that reflects the section + her story, **rotates**, and is **tappable → a meaning reveal** (3 layers: the flower's fixed floriography meaning · the omen "they say…" line · the personal "why now").
- **Module:** `src/components/brand/floraOmen.js` — a **static front-end module**: `MEANING_LIBRARY` (flower→meaning · creature→omen · lifecycle→meaning) + line templates + `pickOmen(signals, seed)`. **Pure render-time selection; NO backend call, NO new base44 function (50-fn cap respected).**
- **Signals** assembled from context the page **already loads** — cycle phase & day, life-stage, recent mood/theme, days-since-last-open, programme progress, what she tends, the date + special dates, the flora fingerprint. **No new fetch.**
- **Daily rotation:** reuse `hashSeed(userId + 'YYYY-MM-DD')` → stable all day, same on every device, rotates daily.
- **Priority ladder** (highest available wins; seed breaks ties): 1 life-event (birthday · milestone · welcome-back · hard anniversary) → 2 body-season (phase/lifecycle) → 3 recent story (mood/theme) → 4 calendar/sky (season · moon · solstice · folk-saying) → 5 gentle daily **fallback** (seasonal time-of-day omen — **never blank, never "no data"**; library large enough it won't repeat within a fortnight).
- **Tappable reveal** = the existing bottom-sheet (no new route). **Writes** ("press to journal", "this resonated") ride **existing dispatcher actions** — never a new function.
- **Section headers** = existing `FwFloraHero` + the section's signature species (§5.3) + `stage` + the omen creature. Reuse, don't rebuild.

### 10.4 THE FOUR SAFETY RAILS (non-negotiable)
1. **Ration the magic** — an omen on *every* open stops working. ONE real omen/day (the Today "almanac" moment); section headers reveal **on tap only**; plain days stay plain.
2. **Never resurface a hard memory unprompted** — "on this day"/pattern-surfacing is **gated**: a loss/breakup/low-mood entry is NEVER pushed without her opening it first. Grief patterns surface only inside Journal, gently — never a morning greeting.
3. **Hope-only readings** — where a folk omen has a dark variant (out-of-season bloom = "survival" OR "sickness"), the engine uses ONLY the hopeful reading. No omen ever predicts harm.
4. **The saccharine test** — if a line would fit unedited on a supermarket greeting card, cut it. Every line earns its place with a specific detail or a real action.

### 10.5 THE SOULFUL VOICE (warm · funny · a little mystic)
**Three dials:** WARMTH (always high) · WIT (dry, wry, UK — never zany) · WONDER (mystic, half-winking, ~5/10). **Method (Mailchimp):** the *voice* is constant (warm garden-mystic friend), the *tone* flexes to her state (plainer on a hard day, brighter on a high one). **Eight principles:** 1 *"they say…"* (wonder as folklore, never a promise) · 2 the **kettle rule** (every mystic line earns a domestic wink) · 3 notice, don't cheerlead · 4 action over sentiment · 5 punch up never down (never guilt/scoreboard) · 6 brevity with soul · 7 tint don't drown (lighthearted by default; low days met softly) · 8 UK to the bone (no emoji, no American pep). **Avoid the two poles:** Co-Star's brutal edge AND Duolingo's guilt. The big per-surface/per-state copy bank is in the brainstorm doc — draw from it; keep it tied to meaning, never hollow-cute.

### 10.6 CRAFT THAT CARRIES MEANING (format = feeling)
- **Wax rose seal + sealed letters:** Health becomes *correspondence* — each letter arrives **sealed with a wax rose** (her signature flower, phase-coloured); opening breaks the seal (once-only lift). Extends to a monthly **"letter from your body,"** a milestone certificate, a sealed **"letter to future you"** in Journal, Jess's notes as folds.
- **Vines that grow with progress** (a leaf per session, a bloom at the end — growth, not a progress bar).
- **Pressed flowers** for saved/remembered things (the garden remembers; "on this day" shows last year's pressed bloom — **gated per rail 2**).
- **Deckle/letterpress paper**, Ephesis **script for margin-notes & omen lines** (they read hand-written), Cormorant letterpress for letters, **dawn/dusk light** that warms/cools with time of day.
- **Cards as objects, not boxes:** `LetterCard` (deckle + wax seal + fold) · `PressedFlowerCard` (a memory) · `AlmanacCard` (the dated daily omen, script) · `GrowingCard` (vine progress). The soul is in the *format*, not a sticker on top.

---

## 9. APPENDICES & IN-APP MIRRORS
- **`claude-state/BRAND_FLORA.md`** — deep flora map, floriography + colour-symbolism research, the fingerprint permutation math (§7.1), full sources. (In-app: Founders → Brand & UX → **Flora & Meaning** = `FloraMeaningDoc.jsx`.)
- **`claude-state/BRAND_IMAGE_RESEARCH.md`** — the botanical-system research brief (Aesop restraint, Art Nouveau whiplash line, William Morris, the fleuron, women's-wellness palette), with sources.
- **In-app mirror of THIS file:** Founders → Brand & UX → **Brand Identity** = `components/founders/BrandIdentityDoc.jsx`.
- **Live craft showcase:** `/BrandCraftSample` (preview route) — every component above, rendered.
- This master is **self-sufficient for building** without opening the appendices; the appendices add the cited "why" and the exhaustive lists.

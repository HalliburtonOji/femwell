# FEMWELL — CANONICAL BRAND IDENTITY · COMPLETE MASTER (v2 · 2026-06-17)

> **READ THIS BEFORE ANY UI / VISUAL WORK OR VISUAL SCAN. Conform to it.**
> **This file is the single COMPLETE source of truth** — typography (fonts + scale), colour (tokens +
> colourways), the heart mark, the botanical brand-image system, the flora backbone/meaning, variety &
> per-user uniqueness, spacing, and the component map. It is **self-sufficient for building**.
> If code disagrees with this file, this file wins — and the code is a fix target.
> Mirrored in-app at **Founders → Brand & UX → Brand Identity** and **→ Flora & Meaning**. Authoring/gate rules live in CLAUDE.md.

**APPENDICES (deep + cited; this master is self-sufficient without them):**
- `claude-state/BRAND_FLORA.md` — the full flora map, floriography/colour research, fingerprint math, sources.
- `claude-state/BRAND_IMAGE_RESEARCH.md` — the botanical-system research (Aesop/Art Nouveau/Morris/fleuron).

**MASTER INDEX:**
0. Pre-build checklist · 1. Typography (fonts + `.fw-*` cascade + role scale) · 2. Colour (tokens + retired + phase hues + **2.5 colourways**) · 3. The heart mark · 4. Botanical brand-image system (leaves/corners/dividers/flourishes) · 5. Bloom craft (RichBloomV2) · 5.1 Flora backbone & meaning · 5.2 Variety + flora fingerprint · 5.3 Page character · 6. Spacing & cards · 7. How it's applied · **8. Component map** · 9. Appendices & in-app mirrors.

---

## 0. PRE-BUILD CHECKLIST (the 60-second gate)
Before you add or change anything visual, confirm:
1. **Type** — every text node maps to a ROLE in §1 (display / heading / title / body / caption / eyebrow / control). No free-floating `fontSize`. Use the role's exact size + weight + line-height. **No half-pixel sizes. No new sizes.**
2. **Colour** — every colour is a token from §2. **No raw hex that duplicates a token.** One gold (`#A8893F`), one crimson (`#BC2E27`), one cream-paper (`#ECE7DA`). Phase colours (§2.4) are a separate semantic set.
3. **Heart** — if this is a primary page header or a brand signature, it carries **exactly one** carved-crimson heart (§3). Don't scatter it; don't recolour it; don't substitute the Lucide outline heart as the brand mark.
4. **Motif** — at most **one** botanical line-motif per viewport, stroke-only, low opacity, never behind readable text (§4).
5. **Bloom** — use the canonical `<Bloom>` (NurtureGarden), never a flat reimplementation (§5). Animation is breath/sway only, GPU-cheap, `prefers-reduced-motion`-gated.
6. **Spacing/cards** — snap to the spacing scale and the card standard (§6).
7. **Always**: cream/plum world, Ephesis + Cormorant + system-sans only, Lucide/SVG icons, **no emoji**, UK English, no scoreboards, no-guilt.

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

### The role table — USE THESE EXACT VALUES
| Role | Token / class | Font | Size | Weight | Line-height | Use |
|---|---|---|---|---|---|---|
| **Display** (page title) | `.fw-display` | SCRIPT (Ephesis) + `#inkCarve` | `clamp(40px,8.5vw,54px)` | 400 | 1.14 | ONE short title per page. Never all-caps, never long. |
| **Heading 1** (section) | `.fw-heading` | SERIF *italic* + swash | `clamp(23px,4.6vw,31px)` | 600 | 1.18 | Section headers. The carved-italic look. |
| **Heading 2** (sub) | — | SERIF *italic* | `20px` | 600 | 1.20 | Sub-sections, sheet titles. |
| **Title** (card/list) | — | SERIF | `18px` | 600 | 1.30 | Card titles, list headers. |
| **Body L** (lede) | — | SERIF | `17px` | 500 | 1.55 | Opening paragraph, Jess voice lede. |
| **Body** (default) | — | SERIF | `16px` | 500 | 1.55 | Default reading text. |
| **Body S** | — | SERIF | `15px` | 500 | 1.50 | Dense secondary copy, card body. |
| **Caption / meta** | — | UI | `13px` | 600 | 1.40 | Dates, counts, helper text. |
| **Eyebrow / overline** | — | UI | `11px` | 700 | 1.30 | Uppercase, `letter-spacing:0.14em`. Section kicker. |
| **Control** (button/tab) | — | UI | `14px` | 700 | 1 | Buttons, tabs, chips. |
| **Nav label** | — | UI | `11px` | 700 | 1 | Bottom-nav labels. |

**Allowed size set (px): 11, 13, 14, 15, 16, 17, 18, 20** + the two clamps (heading `clamp(23,4.6vw,31)`, display `clamp(40,8.5vw,54)`). **That's it.** No 12.5, 15.5, 8.5, 19, 21, 22, 24, 26, 28… (the audit found **46 distinct sizes** — collapse to these).
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

## 5. BLOOM / ILLUSTRATION CRAFT STANDARD  ·  ELEVATED v2 (2026-06-17)
**Canonical implementation:** `<Bloom>` in `components/nurture/NurtureGarden.jsx`. **Reference for the elevated bar:** `RichBloomV2` in `pages/BrandCraftSample.jsx` (live at `/BrandCraftSample`). **All surfaces use the canonical component** — the flat ellipse re-implementations in the `TodayDemo*` pages are **deprecated**; the canonical `<Bloom>` is upgraded to v2 in the Today/Phase-2 build so the whole app inherits it.

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

## 6. SPACING & CARD STANDARDS
- **Card:** `background paperHi #F4EFE3`, `1px solid paperDeep #D8CFBC`, `border-radius 16–18px`, `padding 14–17px`. Feature card: radius `18–20`, a touch more padding.
- **Accent card:** add a `3px` left-border in the section accent (`gold`/`sage`/`crimson`/`blush`).
- **Spacing scale (px):** `4, 8, 10, 14, 18, 22, 26` — snap margins/gaps to these.
- **Depth:** cream-on-cream — lean on hairline borders + a *tiny* shadow, not heavy drop-shadows. Use the editorial `PRESS` tokens for debossed chrome.
- **Nav:** ONE unified bottom nav at all viewports.
- **Surface:** every page sits on `PAPER_BG` (the paper-grain + vignette).

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
| **In-app brand docs** | `components/founders/BrandIdentityDoc.jsx` + `FloraMeaningDoc.jsx` | the Founders mirrors of this file + BRAND_FLORA. |

> **NOTE (current state):** the glyph library + colourway grammar + fingerprint currently live in `pages/BrandCraftSample.jsx` (the craft sample). On lock, **promote** them to shared modules (e.g. `components/brand/flora/*`) so Today/Garden/etc. import them. Until then, `BrandCraftSample.jsx` is the source of truth for the implementations.

---

## 9. APPENDICES & IN-APP MIRRORS
- **`claude-state/BRAND_FLORA.md`** — deep flora map, floriography + colour-symbolism research, the fingerprint permutation math (§7.1), full sources. (In-app: Founders → Brand & UX → **Flora & Meaning** = `FloraMeaningDoc.jsx`.)
- **`claude-state/BRAND_IMAGE_RESEARCH.md`** — the botanical-system research brief (Aesop restraint, Art Nouveau whiplash line, William Morris, the fleuron, women's-wellness palette), with sources.
- **In-app mirror of THIS file:** Founders → Brand & UX → **Brand Identity** = `components/founders/BrandIdentityDoc.jsx`.
- **Live craft showcase:** `/BrandCraftSample` (preview route) — every component above, rendered.
- This master is **self-sufficient for building** without opening the appendices; the appendices add the cited "why" and the exhaustive lists.

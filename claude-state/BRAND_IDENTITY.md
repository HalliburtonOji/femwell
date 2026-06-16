# FEMWELL — CANONICAL BRAND IDENTITY (v1 · 2026-06-16)

> **READ THIS BEFORE ANY UI / VISUAL WORK OR VISUAL SCAN. Conform to it. This is the single source of
> truth for typography, colour, the heart mark, botanical motifs, bloom craft, and spacing.**
> If code disagrees with this file, this file wins — and the code is a Phase-2 fix target.
> Mirrored in-app at **Founders → Brand & UX → Brand Identity**. Authoring rules live in CLAUDE.md.

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

## 4. BOTANICAL MOTIF (vines · leaf line-art · plant-veins)
A small, disciplined library of **hairline botanical line-art** — stroke-only `<path>`/`<svg>`, **never filled shapes**.

**Do:**
- One motif per viewport: a trailing **vine** in a page corner, a **leaf divider** (a hairline rule broken by one leaf-eye) between sections, or a small **tendril** at a card corner.
- Stroke in `ink` / `gold` / `sage` at **low opacity**: backgrounds `0.06–0.12`, a section-divider leaf up to `~0.3`.
- Stroke-width `1–1.5`, `stroke-linecap:round`, organic/asymmetric curves. Sit it over `PAPER_BG`, not fighting it.

**Don't:**
- No emoji, no clip-art, no filled/3D leaves, no repeating wallpaper tile behind body text, no more than one motif per screen, no motif at an opacity that competes with reading text.

**Perf:** pure SVG strokes are cheap. **Never** apply blur/`feGaussianBlur` filters to motifs, and don't animate them.

> **AUDIT:** botanicals are documented but barely implemented (Health.jsx has a few geometric gold flourishes). `PAPER_BG` is a vignette+grain texture, **not** a botanical. This spec defines the motif so Phase 2 can roll it consistently.

---

## 5. BLOOM / ILLUSTRATION CRAFT STANDARD
**Canonical implementation:** `<Bloom>` in `components/nurture/NurtureGarden.jsx` (per-form: peony / daisy / foxglove / fern; `linearGradient` petals light→deep; `radialGradient` glow; `fwBreath 6s` / `fwSway 7s`; gold rare-halos; **`prefers-reduced-motion` honoured**). **All surfaces use this component** — the flat ellipse re-implementations in the `TodayDemo*` pages are **deprecated** (Phase-2 replaces them).

**Craft direction (the "more realistic" upgrade — approved via the sample):**
- **Depth/shadow:** add a soft **grounding drop-shadow** — ONE low-opacity blurred ellipse (or a radial-gradient ellipse) beneath the bloom. *Not* a per-petal blur filter.
- **Shading:** richer **2→3-stop petal gradient** (light tip → mid → deep base) + a subtle specular highlight near the petal crown for dimensional, non-flat petals.
- **Motion:** breath (scale 1→1.04) + sway (rotate ±1.5°) via **CSS transforms only** (GPU-cheap). One shared `<style>` keyframe block. Always `@media (prefers-reduced-motion:reduce){animation:none}`.

**Perf rules (hard):**
- **No `feGaussianBlur` / SVG blur filters across many nodes** — they're the expensive trap. Depth = ONE shadow ellipse + gradients, full stop.
- Cap animated nodes (animate the bloom group, not each petal). One keyframe block per page, not per bloom.
- A bloom is GPU-cheap: transforms + gradients composite on the GPU; measured impact on this app is **negligible** (see the sample's perf note).

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

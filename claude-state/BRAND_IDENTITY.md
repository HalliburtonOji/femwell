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

---

## ✅ AGREED vs ⏳ PROPOSED (this file is ONE bible; build only to AGREED)
**This is the single source of truth — edited IN PLACE; do NOT spawn parallel brand docs.** The flora system and the "ecosystem" are NOT separate things — they're §5 and §10 here. Phone-readable export: `femwell-handoff/BRAND-BIBLE.html` (= the in-app **"Brand Bible"** in Ideas — the only brand entry; the old "Living Ecosystem / Brand Identity / Flora & Meaning" entries are folded into it).
- **✅ AGREED (locked canon — §0–§9 + §10.1–§10.5 + §11):** north star/soul · **voice — warm · funny · nurturing · soulful, *with* the omen/almanac flavour (Halli confirmed 2026-06-20: "keep it", locked)** · typography · colour (+ WCAG) · the FULL flora system incl. the **64-flower library** (§5.4) + recognisability (§5.0) + the **lifecycle stages** (§10.1) + meaning/fingerprint/page-character · cards + the **quick-action popup** (§6.7.6) · **the Clipboard Stack Slider** (§6.10) · **the OMEN FEATURE — the rotating tap-to-reveal omen headers + the fauna/omen meanings + the safety rails (Halli APPROVED 2026-06-27 → §10.2–10.4 are now canon; rides existing signals, no new function)** · page structure · components/motion/nav · **the GLOBAL PAGE STANDARDS (§11) — the Lifestyle-proven PER-PAGE BUILD LIFECYCLE (§11.0: motherboard → per-piece researched builds → measured content → drop live & deploy per piece → real-pixel verify → deep adversarial audit → no new fn) + card-sizing/light-frame · one-tap media · in-place reader · content-safety · formatting hygiene · the real-pixel QA gate · delivery cache-buster (Halli 2026-08-01)**.
- **⏳ PROPOSED (NOT canon — needs Halli's explicit yes; §10.6):** the **wax-seal / sealed-letter / growing-vine / pressed-flower craft** (§10.6) · the formal **Caregiver-Sage-Innocent archetype**. Do NOT build these as canon until signed off.

**APPENDICES (deep + cited; this master is self-sufficient without them):**
- `claude-state/BRAND_FLORA.md` — the full flora map, floriography/colour research, fingerprint math, sources.
- `claude-state/BRAND_IMAGE_RESEARCH.md` — the botanical-system research (Aesop/Art Nouveau/Morris/fleuron).

**MASTER INDEX:**
0. Pre-build checklist · 1. Typography (fonts + `.fw-*` cascade + role scale) · 2. Colour (tokens + retired + phase hues + **2.5 colourways**) · 3. The heart mark · 4. Botanical brand-image system (leaves/corners/dividers/flourishes) · 5. Bloom craft (RichBloomV2) + **5.0 recognisability** · 5.1 Flora backbone & meaning · 5.2 Variety + flora fingerprint · 5.3 Page character · **5.4 THE BOTANICAL LIBRARY (60+ named species — `floraLibrary.jsx`)** · **6. Surfaces & components** (incl. **6.7.0 the CARD LANGUAGE — the card-type vocabulary** · **6.7.6 the quick-action popup** · **6.10 the Clipboard Stack Slider**) (6.1 cards · 6.2 backgrounds/scrims · 6.3 buttons · 6.4 chips/inputs/sheets/toggles · 6.5 nav · 6.6 icons/links) · 7. How it's applied · **8. Component map** · **10. THE LIVING ECOSYSTEM** (v4 — lifecycle stages · fauna/omens · the rotating omen engine · safety rails · the soulful voice · craft-that-means) · **11. GLOBAL PAGE STANDARDS** (Lifestyle-proven, page-agnostic — **11.0 the per-page BUILD LIFECYCLE** · card-sizing/light-frame · one-tap media · in-place reader · magazine cards · content-safety · formatting hygiene · real-pixel QA gate · delivery) · 9. Appendices & in-app mirrors.

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
7. **CARDS (§6.7) — import from `src/components/brand/Card.jsx`; NEVER hand-roll a `<div>` card.** Pick the typed variant for the content (Article/Story/Video/Audio/Book/DailyStory/Horoscope/Summary/Recommendation/LogAction). Every card carries a hook + line (or a real snippet / inline player) AND an inline action; **no empty/dumb containers, no blank fallbacks.** Inline media plays IN the card; a long-form *consume* CTA **deep-links the exact item full-screen** (§6.7.4), but a short *DO* task (read chapter / answer QOTD / leave a line / log a meal / tick a ritual) opens the **§6.7.6 QUICK-ACTION POPUP** — do it in place, then it ticks (never a link-out for a 10-second task, never a bare checkbox).
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

> **HEADING COLOUR — DEEP OXBLOOD `#7A1A12` · THE APP-WIDE HEADING STANDARD FOR ALL PAGES (Halli, confirmed 2026-06-26).** Every page's page-title and section headings render in a **deep oxblood / deep-wine red — `--oxblood #7A1A12`** (the "going deeper" script look) — **not just the planner; everywhere.** Set via the **shared token `--fw-heading-color`** in `index.css` on `h1–h6`, `.fw-display` and `.fw-heading` so **one change propagates to every heading on every page**.
> - **The canonical heading = the deep-red SCRIPT page title** (`.fw-display` = Ephesis + `#inkCarve`, in oxblood); **section headings** = Cormorant italic (§Heading 1/2) **in the same oxblood** (script stays short-titles-only per the role table — long/section headings in script tangle, so they're serif, but the *colour* is the same deep red).
> - **`#7A1A12` is RICHER/DARKER than the heart crimson `#BC2E27`.** **The heart crimson is NOT a heading colour** — it stays the carved-heart mark + rare accent (§2.2/§3). Reading body stays near-black ink.
> - **GO-FORWARD + CLEANUP:** new pages use the token automatically (the global `h1–h6` rule). **EXISTING pages that hard-code an inline heading colour are a CLEANUP TARGET — migrate every page's headings to `--fw-heading-color`** so the deep-red standard is uniform app-wide. (A heading still showing ink/plum/crimson is a bug to fix.)

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
| `crimson` | `#BC2E27` | **THE** heart mark + rare deliberate accent. **NOT for headings** (use oxblood). |
| `oxblood` | `#7A1A12` | **THE heading colour** (§1) — deep wine red, **ALL headings on ALL pages**, via `--fw-heading-color`. Deeper than crimson; headings only. |
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

#### 2.5.1 VIVID TWO-TONE BLOOM COMBOS (Halli 2026-07-08: "more colourful flowers + colour combinations") · v1
> The single-tone colourways above can read **washed-out/pale**. These **two-tone combos** set `color2` (the lit tip) to a **contrasting 2nd hue** (not just a lighter shade) + a distinct **heart** (`accent`), so the petals shade from one colour to another with a jewelled centre. **Richer and more saturated than §2.5 — allowed to be vivid — but still on-brand (harmonious, warm, never neon).** Use for the flora hero spray (§6.8) and any feature bloom; keep everyday chrome on the §2.1 tokens. Pass to `RichBloomV2` as `color`=petal · `color2`=tip · `accent`=heart. (Live-picked from the "Realistic Branch" demo.)
| Combo | petal → tip / heart | Feel / meaning |
|---|---|---|
| **Coral → Gold** | `#E86A44` → `#F6C066` / `#B8502E` | warmth ripening to joy — coral petals glowing gold at the tips, a warm heart |
| **Magenta → Cream** | `#C63A75` → `#F4DCE6` / `#8E2E52` | vivid, lush, celebratory — deep magenta softening to cream |
| **Violet + Butter** | `#8A63B4` → `#CBB8E4` / `#E8C766` | bold + joyful — violet open face with a butter-yellow heart |
| **Amber + Rose** | `#E8A24E` → `#F8CE9A` / `#C05A4E` | sunny, generous — warm amber with a rose centre |
| **Crimson + Gold** | `#C33A2C` → `#E8895F` / `#D4AF37` | the heart colour at its most alive — crimson spray, gold centres |
| **Periwinkle + Gold** | `#7C8CC8` → `#C0CAE6` / `#E8C766` | calm + uncommon — cool periwinkle-blue with a warm gold heart |
| **Blush → Deep-rose** | `#E098B0` → `#F8DCE6` / `#A83E5E` | tender with depth — blush petals over a deep-rose throat |
> **Rule:** one combo per bloom/spray (the whole spray shares a combo — the petal→tip gradient IS the two-tone; don't also multi-colour within one flower). Colour still carries meaning (§2.5) — pick the combo for the mood, not at random.

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

### 5.4 THE BOTANICAL LIBRARY — 60+ named species (v4 · 2026-06-20)
> **"Variety" means a real garden, not a handful.** The canonical breadth library is **`src/components/brand/floraLibrary.jsx`** — **60+ bespoke-drawn, named species** (plus foliage, buds, and the §10.1 lifecycle stages), **each obeying the §5.0 recognisability standard** (a rose reads as a rose; an iris reads as an iris). Import **`<SpeciesBloom name="…" size={…} />`** (static decorative) for the breadth; **`RichBloomV2`** stays for the **animated hero** blooms. Both share the same colourway/gradient/petal grammar.
> **THE HERO STANDARD IS LIBRARY-WIDE (Halli 2026-07-08 — "obviously not only those flowers, there are more flowers in the bible").** The §6.8 finalised hero (big blooms **distributed along the bough**, the **one→many** open, the **`RichBloomV2 headOnly`** stem-less render, and the **vivid two-tone combos §2.5.1**) is **shared-renderer code**, so **EVERY species benefits automatically** — pass any `form` (rose/sunflower/hibiscus/peony/cosmos/lily/…) + any colourway/combo and it renders big, distributed, and one→many while keeping its own recognisable identity (§5.0). Verified across colourways+forms (crimson rose · gold sunflower · plum peony · sage cosmos). No per-species rework needed — update the engine, the whole library levels up.
- **The roster** (each is a real, recognisable flower): **roses** (crimson/pink/peach) · sunflower · hibiscus · tulip · lily · peony · ranunculus · dahlia · magnolia · orchid · iris · daffodil · lavender · daisy · marguerite · poppy · cornflower · snowdrop · foxglove · jasmine · camellia · gardenia · anemone · marigold · chrysanthemum · hydrangea · lotus · waterlily · cherry-blossom · almond-blossom · wisteria · bluebell · lily-of-the-valley · carnation · freesia · protea · gerbera · aster · echinacea · rudbeckia · calendula · chamomile · zinnia · cosmos · osteospermum · begonia · buttercup · hellebore · primrose · phlox · periwinkle · geranium · plumeria · morning-glory · hyacinth · delphinium · gladiolus · snapdragon · allium · crocus · calla. **Foliage:** fern · eucalyptus · monstera · succulent · ivy · olive.
- **Built from archetypes + bespoke heads:** a parameterised engine (composite ray+disc · rosette · cup · star-face · spike/raceme · umbel · nodding-bell · blossom-branch) gives breadth cheaply; the iconic-shaped ones (rose · sunflower · hibiscus · lily · iris · orchid · daffodil · tulip · magnolia · foxglove · hibiscus · cornflower · calla · protea · snowdrop) are **bespoke** so they're unmistakable. Petal silhouettes: round/point/cup/broad/lance/spoon/strap/heart/frill; centres: gold-disc/dome/cone/tuft/eye/whiteEye/stamen/green. Pale-bloom luminance fix (§5.0) applies.
- **USE IT — variety must be VISIBLE.** Page-character (§5.3), bouquets, the Garden, and the §10 omen section-headers draw a **different signature species per surface/section** from this library — never the same three flowers everywhere. The **Flora Lab** (`/FloraLabDemo`) renders the FULL library + foliage + lifecycle + buds side-by-side as the proof.
- **Perf:** static SVG (gradients + paths, no per-petal blur); the library blooms don't animate (only the hero `RichBloomV2` breathes). Rendered via a string builder + a thin `dangerouslySetInnerHTML` wrapper (static, no user input — safe).

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
#### 6.9.1 FLORA-HERO MOTION (the §6.8 hero — Halli 2026-07-08 "add animation") · v1
> The flora hero is **gently alive** — calm, organic, GPU-cheap, and reduced-motion-gated. Four motions, no bounce:
> - **Bloom breath:** each open bloom breathes (`RichBloomV2 animate` → `fwcBreath`, a ~2% scale pulse over 6s, staggered per bloom) — the "breathing" feel.
> - **ONE → MANY open:** when `openness` changes (tap-to-rebloom), the blooms **open in sequence down the bough** — each bloom's head scales up (`transition transform .55s cubic-bezier(.34,1.25,.4,1)`) and its **closed bud cross-fades out** (`opacity .45s`) as its `bloomLocalOpen` threshold is crossed. Buds *open*, they don't just grow.
> - **Companion drift:** the creature drifts/hovers (`Pollinator animate` → `fwcDrift`).
> - **Soft glow:** the warm hero glow pulses slowly (`fwcGlow 7s`).
> - **Performance:** transform/opacity only; the static bough+meadow SVG is inert (no per-frame work). **Reduced-motion:** the hero wrapper is `.fw-hero` and `@media (prefers-reduced-motion:reduce){ .fw-hero *,.fw-hero{ animation:none!important; transition:none!important } }` — everything settles to its resting (fully-open) state instantly. Keyframes: `floraKeyframes` + `FLORA_SCENE_KEYFRAMES` in `floraScene.jsx`.

- **BOTTOM-NAV ACTIVE-PILL MIGRATION (the nav session's final spec):** the active indicator is a **single, persistent, wide stadium gold pill** shared across all 5 nav items (one element that *moves*, not five that fade). On a tab change it **migrates** with a **physics spring** (`stiffness 320 · damping 32 · mass 1`) **sampled @60fps and baked into a WAAPI, transform-only keyframe set** (so it runs GPU-composited, never JS-per-frame layout). The motion is **velocity-coupled squash-stretch**: `scaleX 1 → 1.16` / `scaleY 1 → 0.94` at peak travel speed, easing back to `1×1` at rest (the pill stretches in the direction of travel, settles round). **Reduced-motion → instant** (the pill jumps to the new item; no spring, no squash). This is the one bespoke spring in the app — everywhere else is the ease-out tokens above.

### 6.10 THE CLIPBOARD STACK SLIDER (Halli's component · ✅ AGREED · ✅ SHIPPED — `src/components/brand/ClipboardSlider.jsx`)
> A **"clipboard"** is a **big framed card that HOLDS a stack/grid of smaller cards**; you **slide it sideways to reveal another whole clipboard** holding a different stack — like flipping between two big boards. (Halli's idea, from the Profile "Your areas" tile grid.) It groups several *peer* grids into one calm, swipeable surface instead of an endless scroll or a cramped single grid.
> **Shipped component (reuse it, don't re-build):** `src/components/brand/ClipboardSlider.jsx` exports **`Clipboard`** (the board), **`ClipboardSlider`** (the outer pager of boards), and **`CardDeck`** (the §6.10.1 inner sub-deck). Owned by the Today session (it surfaces the Ritual Builder on Today). **Doc ↔ code must stay in agreement — edit this section to match the file.**
- **Anatomy:** (1) **the clipboard** (`Clipboard`) — a large `Card.jsx`-framed surface (paperHi, gold hairline, 4-corner sprigs, a Cormorant title + a small gold "clip" detail + a `FlowerGlyph`), **never empty**; (2) **the stack** — a grid of typed mini-tiles inside (icon + label + sub), each tapping through via a deep-link or the §6.7.6 quick-action popup; (3) **the slider** (`ClipboardSlider`) — a horizontal **native scroll-snap** pager of boards (`scroll-snap-type:x mandatory`, `scroll-snap-align:start`), an **edge-peek** of the next board, **page dots + ‹ › arrows** (`scrollIntoView`).
- **When to use:** a page with several **peer** grids / areas / "rooms" (Profile areas · "your spaces" · category boards). Don't use it for a single grid or for sequential steps.
- **Motion:** **native horizontal scroll-snap (compositor-driven, transform-free)** — programmatic moves use `scrollIntoView`/`scrollTo({behavior:"smooth"})`; **reduced-motion → `behavior:"auto"`** (instant snap, no animated slide). No bounce.
- **Build:** reuses `Card.jsx` + flora glyphs; **NO new backend, NO new function**.

### 6.10.1 SLIDE-WITHIN-CARD (nested sliding) — the `CardDeck` export
> A clipboard board (§6.10) can **itself contain a HORIZONTAL sliding sub-deck** (`CardDeck`): the user **swipes WITHIN the big card** to move between its *peer items*, **one item per page**, instead of stacking them vertically. Example — Today's "loop" board holds **intention · line of the day · tiny mission · a day for you · someone like you**, swiped through *inside* the one board.
- **Anatomy:** an **outer clipboard board** (`Clipboard`, stays put — its title/sub header + the outer dots/arrows are the handle for moving between BOARDS) → an **inner `CardDeck`** = a **native horizontal scroll-snap** row of peer item-cards (each `width:100%`, `scroll-snap-align:start` → **one peer item per page**), with **its own page-dots + ‹ › arrows**. Only the inner deck moves.
- **When to use:** when a single board holds **several peer items that belong together** and you'd otherwise stack them down the page (the Today loop, a "this week" set, a multi-part summary). Inner deck = move *within* one board; outer `ClipboardSlider` = move between *different* boards.
- **Gesture firewall (the inner & outer slides must not fight):** the inner deck sets **`overscroll-behavior-x: contain`** — this stops the inner horizontal swipe from chaining/dragging the **outer** board once the deck reaches its end (no nested-horizontal hijack). **Vertical drags fall through to page scroll**; the outer board only advances via its **own** header/dots/arrows. One axis-owner per gesture, arbitrated by the browser's native scroll.
- **Motion:** native scroll-snap (compositor-driven, **transform-free**, 60fps); programmatic item moves `scrollTo({left: idx*clientWidth, behavior:"smooth"})`; **reduced-motion → `behavior:"auto"`** (instant). Edge-peek optional (`peek`). No bounce. Same Card/brand chrome inside (typed cards, never empty).
- **Build:** the shipped `CardDeck` in `ClipboardSlider.jsx`; **NO new function**.

### 6.10.2 STACKED DEMARCATIONS — two horizontal sub-sliders in one long card (MAXIMISE the length) · v1 2026-06-26 (corrected)
> **MAXIMISE a long card by splitting it into TWO STACKED DEMARCATIONS — a TOP side and a BOTTOM side — within the SAME long card, and giving EACH demarcation its OWN HORIZONTAL sub-slider.** So one long card shows **two topics at once** (top + bottom), each **sliding sideways** to reveal more within that half — using the full card length without overwhelming. **The card STAYS LONG — do NOT shrink it, and do NOT swap/slide the whole card vertically between views.** **A VERTICAL slide is allowed ONLY *within* a single demarcation**, to reveal more when that half needs it. **The MAIN page slider stays HORIZONTAL.**
- **Anatomy:** one **long card frame** (stays put) → **two stacked demarcations** (top half + bottom half), visually separated by the **standard hairline divider (§6.10.3)**, **each holding its OWN horizontal sub-slider** (a `CardDeck`-style native scroll-snap row: `scroll-snap-type: x mandatory`, 12–16% **peek** of the next item + its **own dots + ‹ › arrows**). The two halves are **independent** horizontal sliders, one above the other. (Within one demarcation, an *optional* vertical reveal is allowed only if that half genuinely overflows.)
- **When to use:** a long card with **two related topics** that should **both be visible at once** (top + bottom), each with **more than fits across** → each half gets a horizontal sub-slider so the card's whole length earns its space. **Don't** split it into two separate cards, **don't** shrink the card, **don't** make the whole card flip vertically.
- **Gesture rule (independent halves, one axis each):** **each demarcation's horizontal slider sets `overscroll-behavior-x: contain`** so it never drags the other half, the outer board, or the page; the two stacked sliders don't fight. A **vertical** drag goes to **page scroll** (or, inside a demarcation that has its own optional vertical reveal, that half sets `overscroll-behavior-y: contain` for it). **Never two scroll axes fighting on one element** — one axis per surface; the top and bottom sub-sliders are separate surfaces.
- **Motion:** native scroll-snap (compositor-driven, **transform-free**); `scrollTo({left: idx*clientWidth, behavior:"smooth"})`; **reduced-motion → `behavior:"auto"`**. No bounce. Typed cards inside each half, never empty.

### 6.10.3 SLIDING-CARD STANDARD CHROME (app-wide) — the hairline divider + clickable nav arrows · v1 2026-06-27
> Two small, quiet standards that apply to **every** sliding card in the app:
- **The stacked-card HAIRLINE DIVIDER (§6.10.2):** between a long card's **top and bottom demarcations**, a **subtle 1px hairline rule** — the quiet brand hairline: **`gold #A8893F`** (or `ink`) at **low opacity (~0.12–0.18)**, full-width with small side insets, **static**. It reads as one card *gently* split into two halves — never a hard/heavy line, never a coloured bar.
- **Clickable ‹ › NAV ARROWS on the MAIN board slider:** the main horizontal board slider (`ClipboardSlider`) carries **subtle, brand-styled, low-key clickable ‹ › nav icons** — Lucide chevrons, **`muted`/`paperDeep` colour**, ~16px glyph in a **≥44px tap target** (a quiet circular/ghost button, soft) — **in addition to the page dots**, so a user can **TAP between the big cards, not only swipe**. **Persistent (not hover-only); dimmed/disabled at the ends.** The same chevrons appear on the in-card decks (§6.10.1) at a smaller scale. **Standard on every slider** — dots show *where you are*, arrows let you *step*; both are always present.

---

## 6.7 THE CARD SYSTEM — a FIRST-CLASS brand pillar (taxonomy · anatomy · sizing) · v1 2026-06-19
> **Cards ARE the brand language, not decoration.** A card is **never an empty/dumb container.** Every card carries something at a glance AND an inline action. **Build from the shared family `src/components/brand/Card.jsx` — never hand-roll a `<div>` card.** The shell is the Today "across your day" per-section card, standardised.

### 6.7.0 THE CARD LANGUAGE — a bounded VOCABULARY of card types (NEVER default to generic) · v1 2026-06-25
> **We use a VARIETY of card styles, each with a distinct JOB — we never default to one generic card.** A rich app is a *system of distinct card types* (each earning its place), not one card recoloured. **The discipline rule: a new card needs a new JOB, not a new colour** (EightShapes: "regions invite abuse" — bound the set, don't engineer infinity). `FwCard` (§6.7.1) is the **base shell/chrome**; the types below are the **compositions** built on/around it. Don't put three look-alike cards on one screen — pick by emphasis/job (Material 3: card variants "differ by style alone"). *Use variety + colour pills + card-in-card; don't default to generic.* Research + citations: `workspace/CARD_PATTERNS_RESEARCH_2026-06-25.md`.

**THE VOCABULARY (each = a job + an anatomy):**
| Card type | The JOB (when to use) | Anatomy |
|---|---|---|
| **Standard `FwCard`** (§6.7.1) | one section's rich content in a row/feed | the Today shell — header+hook+line+inline action+deep-link; 365×488, 4px accent rim, corner sprigs. |
| **Clipboard board** (§6.10, `Clipboard`/`ClipboardSlider`) | group several **peer grids/areas/"rooms"** into one swipeable surface | a big framed board (title + gold "clip" + flora glyph) holding a stack; outer **horizontal** scroll-snap pager + edge-peek + dots/arrows. |
| **Tile-grid-inside-a-board** | a board of **peer shortcuts/areas** (e.g. Halli's "Schedule & plan" grid) | a 2–3-col grid of **mini-cards** (icon+label+sub, each deep-links or opens a §6.7.6 quick-action popup) *inside* a board. **Bento rule: vary tile size** — one hero **2-wide** tile for the primary, 1-wide for secondary (don't make them all uniform). |
| **In-card swipe deck** (§6.10.1, `CardDeck`) | several **peer "lenses"/items** that belong together, **one per page**, instead of a vertical stack (the Today loop) | a native horizontal scroll-snap row *inside* a board; **see the hard safeguards below.** |
| **Accent-rim sub-card** | a **callout / insight** that should read as a distinct voice (e.g. the "From Jess" insight) | a sub-card with a **coloured left rim** whose colour **MEANS** something — a **phase hue** (§2.4) or a domain accent, **one rim per card, never a rainbow** ("semantic colour describes function, not appearance"). |
| **Focused colour pills** | the **1–2 primary actions** on a board (e.g. purple **"Speak your plan"** + gold **"Plan a day"**) | big rounded (radius 999) colour CTA pills, **≥48px** tap height (44pt floor), UI 14–16/700, white text. **One primary + at most one secondary** (Polaris: avoid >2 filled buttons in a card; **never two filled crimson pills side by side** — they kill hierarchy). Pills + sub-cards nested **WITHIN** big cards is encouraged. |
| **Hero + tap-to-promote rail** (§6.7.0b, `HeroPromoteRail`) | browse a set where **one is featured big** and the rest are a peer rail — the lead media/feature pattern (Halli's chosen #1) | a big **hero** card (the active item) over a **horizontal rail of peer thumbnails**; **tap a thumb → it cross-fades (~220ms) into the hero** and becomes it. Peek-scroll rail + dots + ‹ ›. The "image-gallery / thumbnail-to-hero" pattern. |
| **Spotlight / featured** | one hero item lifted above a row (a "today's pick") | a wider/taller card, a cover/flora, a single strong CTA. |
| **Stat / metric tile** | a single number/streak/insight at a glance (Pulse) | big serif figure + a tiny label + a sparkline/flora; never a wall of them. |
| **Expandable** (§6.7.0b, `ExpandableCard`) | progressive disclosure — summary first, detail on tap | a collapsed `FwCard` (caret top-right) that **expands its `detail` in place** (grid-rows reveal, not a new route) for the long version. |
| **Letter / note card** | an intimate, **un-clinical** message ("a letter from your body", a Jess note) | the §10.6 sealed-letter/deckle look (PROPOSED) — the most distinctly-FemWell card. |
| **Media-led** | audio/video/story that **plays IN the card** (§6.7.4) | cover/inline player ABOVE the hook; plays in place, deep-links to the exact item full-screen. |
| **Timeline / agenda** | a day/week of ordered items (Planner) | a vertical rail of compact rows with times + inline tick (quick-action popup). |
| **Progress (flora that grows)** | a goal/programme advancing over time | a vine/bloom that adds growth per step (§10.1 lifecycle) instead of a bar. |

**STRUCTURAL RULES:**
- **UNIFORM SIZE ON ANY SLIDING ROW (hard rule — Halli 2026-07-03: "different card size on the same sliding row is stupid and shouldn't happen again").** EVERY card/panel on the **same horizontal sliding row** MUST be **identical in size — same width AND same height** — never mismatched sizes on one row. Pick ONE uniform size for the row (`FwCard` 365-wide is the default) and every card on that row uses it. The row **must NOT reserve dead vertical space beyond the tallest-allowed uniform card** — size the track to the uniform card, not to a phantom taller one. (Content still clamps to fit — hook 3-line, line 4-line, §6.7.2 — so a shorter item never shrinks its card or leaves the row ragged.) This applies to `FwCardRow`, the `CardDeck`/`Deck` lens-decks, and every stacked-demarcation sub-slider.
- **MAXIMISE every card — no long empty space.** A long card must be filled, never left half-empty: split it into **two stacked demarcations (top + bottom), each its own horizontal sub-slider (§6.10.2)** — two topics at once, each sliding sideways — rather than padding dead space, shrinking the card, or splitting into a second card.
- **The MAIN page slider is HORIZONTAL.** Primary page navigation between boards/sections is a horizontal scroll-snap pager (the clipboard slider / `FwCardRow`), never a vertical-only wall. **In-card sliders are HORIZONTAL** — between lenses (§6.10.1) and within each stacked demarcation (§6.10.2); a **VERTICAL slide is allowed ONLY inside a single demarcation** to reveal overflow, never as page nav and never to flip the whole card.
- **Sliders-within-sliders (in-card decks) are ALLOWED / ENCOURAGED** — but ONLY with the safeguards, because horizontal scroll is genuinely *missed* (NN/g eye-tracking) and a flush full-bleed deck reads as "nothing there" (the illusion of completeness): **(1)** show a **12–16% PEEK** of the next lens at the right edge (peek is the strong cue; **dots are weak on their own**); **(2)** **persistent (not hover-only) dots + ‹ › arrows**; **(3)** **cap at 4–5 lenses**, best-first; **(4)** an **inner gutter** so the swipe doesn't fight OS back-swipe or page vertical scroll; **(5)** the **`overscroll-behavior-x: contain` gesture firewall** (§6.10.1) so the inner deck never drags the outer board. **Never nest a horizontal deck inside ANOTHER horizontal deck** (one level of nesting only: outer board-slider → inner lens-deck).
- **Colour pills + sub-card styles live WITHIN big cards** — a board may hold rim sub-cards, tile grids, a lens-deck and a pair of action pills. That richness *is* the language. **Don't default to a plain card when a typed one fits.**

#### 6.7.0a THE FOCUSED ACTION PILLS — the two-pill primary CTA (reusable component)
> **A reusable pair of big, filled, colour ACTION PILLS** — the canonical example is the planner's **purple "Speak your plan" + gold "Plan a day"** — used as the **1–2 primary actions** on a board/page. Standardise them as one shared component (e.g. `FwActionPills` / `ActionPill`) so every surface that needs a strong "do this" pair reuses the same thing, never a hand-rolled button.
- **Anatomy (each pill):** `border-radius 999` (full stadium), a **solid colour fill**, **white label** (UI **15–16/700**, `letter-spacing 0.01–0.02em`), an optional leading Lucide icon, **tap height ≥48px** (44pt floor), `padding ~14×20`, a soft shadow. Pills sit **side by side** (equal width) or stack on very narrow widths.
- **The two roles / colours (use brand tokens, not new hex):** **(1) the "voice / speak" pill = the plum/violet family** (`plum #8E6E8E` — the Jess/voice/expression accent); **(2) the "plan / do" pill = the brand `gold #A8893F`**. They read as a clear primary pair without competing. **Heading oxblood and the heart crimson are NOT pill fills** (oxblood = headings; crimson = the heart).
- **Rules (Polaris/HIG):** **one primary + at most one secondary** filled pill in a card — **never two of the SAME fill** (e.g. two filled crimson) side by side (it kills hierarchy). If more than two actions exist, the rest are quiet text/`ghost` buttons, not more filled pills. Reduced-motion safe; tap feedback ≤120ms (§6.9).
- **When to use:** the headline action(s) of a board/page (a planner's "speak vs plan", a "start vs skip", a "save vs share") — the moment you want two strong, glanceable choices. Not for lists/rows (use inline `ActionBtn`), not for navigation (use tabs/nav).

#### 6.7.0b THE REUSABLE CARD COMPONENTS — drop-in, real chrome (Halli 2026-07-03: "save the card language + styles into my brand bible") · v1 2026-07-03
> **The card compositions above are SHIPPED as real, importable components — pages drop them in, never re-build.** All carry the §6.7.1 chrome verbatim (warm `linear-gradient(165deg, paperHi→${accent}14)` · the veined **paper-grain texture** (`PAPER_TEX`, multiply) · 4-corner sprigs · 1px `paperDeep` + 4px accent rim · radius 20 · the layered editorial shadow). Buttons: **filled** = solid accent + white + soft accent shadow (`FwCardCTA`/`focusPill`); **outline pill** = `${accent}14` fill + `1px ${accent}55` (`Pill` unfilled). **This is the real look — never a flatter/lighter cream stand-in.**
- **`HeroPromoteRail`** (`src/components/brand/Card.jsx`) — the hero + tap-to-promote rail (Halli's #1). **Props:** `items:[{ id, eyebrow, title, line, accent?, flower?, cover?, thumb?, ctaLabel?, onOpen? }]` · `initialIndex=0` · `railLabel="More to explore"` · `onSeeAll?` · `accent=gold` (rail/fallback) · `flower="poppy"` (fallback) · `minHeight=0`. `cover`/`thumb` are optional nodes (an `<img>`/cover); default = a meaning-bloom. Tapping a rail thumb cross-fades it into the hero (~200–220ms) and calls nothing until the hero CTA (`onOpen(item)`) deep-links the exact item.
- **`ExpandableCard`** (`src/components/brand/Card.jsx`) — progressive disclosure. **Props:** `accent, Icon, eyebrow, flower, title, line` (the collapsed summary) · `detail` (node revealed in place) · `defaultOpen=false` · plus `media/inset/action/idx/snap/minHeight` forwarded to `FwCard`. Caret sits top-right (via the new `FwCard` `corner` prop) and rotates; the detail reveals with a `grid-template-rows 0fr→1fr` animation — **never a route change.**
- **`ClipboardSlider` / `Clipboard` / `CardDeck`** (`src/components/brand/ClipboardSlider.jsx`, §6.10) and **`StackedCard`** (`src/components/brand/SliderKit.jsx`, §6.10.2) — **confirmed on the real chrome** (same 165deg gradient + rim + sprigs + layered shadow + the gold "clip"). Reuse, don't re-build.
- **`FwCard` `corner` prop** (new) — an optional node rendered absolutely top-right, above content (caret / kebab / close). Additive; existing cards unaffected.
- **The catalogue:** the full **39-style visual gallery** (6 groups A–F) is the in-app **"Card Styles"** doc (`brandDocs/card-styles-expansion.html`, Ideas → Current) — every style a real-chrome mock; it is the menu these components draw from. Pick a style by JOB (§6.7.0), not by colour.

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

### 6.7.6 THE QUICK-ACTION POPUP — "do it right here" (v4 · 2026-06-20)
> **The standard interaction for any DOABLE micro-task on a page** (e.g. Today's "Your Day" / "across your day" rows: *read today's chapter · answer the Question of the Day · leave a line in your journal · log breakfast · log mood · tick a ritual · set today's intention*). Tapping it opens a **QUICK, lightweight popup so she DOES the thing in place, then it ticks.** It is **NOT a link-out** (don't navigate her away for a 10-second task) and **NOT a bare checkbox** (don't let her "tick" something she hasn't actually done).
- **Trigger:** tap the row/card's primary affordance (or its inline action). **Behaviour:** a small **bottom-sheet/popover** sized to the task (the §6.4 sheet primitive: `paperHi`, top-rounded, slide-up over the §6.2 scrim, **`.fw-sheet-safe` clearance**, Escape/tap-scrim to close) — NOT full-screen, NOT a new route.
- **She completes the action INSIDE the popup**, then it closes and the **source item ticks** with a gentle **optimistic** confirmation — and, per v4, a **small bloom/seed grows** (§10.1) rather than a cold checkmark. The write **rides an existing dispatcher action — never a new function** (50-fn cap).
- **Per action-type (the popup's body):**
  | Action | What opens in the popup | Result |
  |---|---|---|
  | **Read today's chapter** | the chapter (or its opening + a "read on" that expands) in an inline scroll | ticks "read"; a bloom opens |
  | **Question of the Day** | the question + a quick input (text / choice chips) | submit → ticks; can spill to Journal |
  | **Leave a line (Journal)** | a mini-composer (textarea + optional tag/mood) | save → ticks; becomes a pressed-flower entry |
  | **Log breakfast / a meal** | recent + searchable food chips + a portion control | log → ticks |
  | **Log mood / energy** | a quick mood/energy selector | tap → ticks |
  | **Tick a ritual / habit** | a confirm + optional note | done → ticks; "a vote for who you're becoming" (§10) |
  | **Set today's intention** | a few smart suggestions + free text | plants the seed (§10.1) |
- **Quick-popup vs full-screen deep-link (when to use which):** use the **quick-action popup** for short *DO* tasks (answer / log / tick / short-write / short-read). Use the §6.7.4 **full-screen deep-link** for long-form *CONSUME* (open a book in the reader, a programme session, a full article) — that opens the EXACT item full-screen. Never make a quick task a navigation; never make a full read a cramped popup.
- **Brand:** Cormorant/Ephesis, one flora accent (a meaning-bloom that grows on completion), no emoji, reduced-motion-safe. Build on the existing sheet/loggers (e.g. `SmartLoggerV4`/`UniversalLogger`/`CheckinModal` patterns) + existing dispatchers.

### 6.7.7 THE CLIPBOARD BOARD — StackedCard × TAP-TO-EXPAND + THE CARD SET (✅ AGREED · Halli 2026-07-16) · v1
> **This is how the clipboard houses content, app-wide.** Halli-approved from `/StackedExpandDemo` + `/CardVariationsDemo`. Code: **`src/components/brand/expandCards.jsx`** (the card language) + `ClipboardSlider`/`StackedCard` (§6.10). **Import these — never hand-roll a cover card or a detail page.**

**THE BOARD (what a clipboard card IS).** The clipboard is **MULTIPLE horizontally-SLIDING boards** (the main slider is horizontal — never one lone board). **Each board** = ONE big clipboard card in the **StackedCard** structure (§6.10.2): split into a **TOP** and a **BOTTOM** half by the **quiet gold hairline**; **each half is its own HORIZONTAL sub-slider** of cover-cards (**edge-peek + pager dots + subtle ‹ › arrows**) — never a vertical whole-card swap. Real card chrome (gradient paper wash, 1px paperDeep, soft double shadow, corner sprig, the gold "clip"). A board = a THEME; its two halves = two related shelves (e.g. **Articles / Books**, Reads / Listens, Sessions / Series, Tonight / This week).

**THE INTERACTION (browse → dive).** **Swipe** a half sideways to browse; **TAP any cover → it opens into the full-screen `ExpandDetailCard`** — big `FloraCover` · **Fraunces** title · typed blocks · **sticky Save + one primary action** — with a **scale-fade expand** (opacity + `scale(.96→1)` + 14px rise, 280–320ms `cubic-bezier(.32,.72,.24,1)`) and **back / Esc / tap-scrim** to collapse. Reduced-motion snaps. **The swipe + tap-to-open must feel IDENTICAL in every half and every board** — one learned gesture, everywhere. (The **FLIP card-morph** expand is a ⏳ PROPOSED upgrade; the scale-fade is the agreed default.)

**THE CARD SET (the variation set — `CARD_TYPES`).** Every content type rides the SAME cover→expand pattern; the `type` drives the eyebrow, icon, **colourway (carries meaning)**, FloraCover scene, and the default inline action. Typed **BLOCKS** render only when the item carries their data — so one `ExpandDetailCard` serves all:

| type | eyebrow · colourway | the expand leads with | primary action |
|---|---|---|---|
| `article` | Read · Essay · cream | body prose (+ optional narrated player) | Read this |
| `book` | Book · Book club · gold | author + an **excerpt** inset | Talk about it · **Open reader** |
| `audio` | Listen · Podcast · sage | **inline player** + show notes | Open episode |
| `session` | Session · Guided · sky | **voiced player** + **steps** ("what you'll do") | Begin |
| `daily_story` | Daily Story · plum | today's **excerpt** | Read today's chapter |
| `video` | Watch · Film · gold | **inline player** (video framing) | Watch |
| `ritual` | Ritual · Practice · sage | numbered **steps** | Begin |
| `quote` | A line · To keep · blush | a big **pull-quote** | Set as today's |
| `horoscope` | Your sky · Almanac · lavender | an almanac **reading** (hope-only, §10.4) | Read your reading |
| `recipe` | Recipe · Tonight · coral | **ingredients** + **method** | Cook this |

- **Blocks available:** `summary` · `videoSrc` · `audioSrc` · `gutenbergId`/`readingText` · `player` (+`mediaKind:"audio"|"video"`, `duration`) · `excerpt` (+`excerptLabel`) · `quote{text,attrib}` · `reading{headline,lines[]}` · `ingredients{serves,time,items[]}` · `steps[]` (+`stepsLabel`) · `meta[[icon,label]]` · `chips[]` · `body[]` · `actions[]` · `safe` (the content-room anonymity note).
- **MEDIA + SUMMARY (v2 · Halli 2026-07-16 · component #2 — ✅ AGREED · LIVE):**
  - **§5 `summary` — a card must NEVER look empty.** One real, warm sentence of substance (a hook/lede/true excerpt), **never a label or lorem**. It shows **on the cover** (clamped) *and* as an **"In short"** block in the expand — but only when it **adds** something (never an echo of the subtitle). Ladder: `summary → subtitle → excerpt → first body line` (`summaryOf(item)`).
  - **§1 VIDEO plays INLINE.** The **`FloraCover` IS the poster** — tap the bloom-play and a real `<video controls playsInline>` takes its place and plays **in the card**. **Never autoplays**; reduced-motion safe. **Only a real media file plays** (`.mp4/.webm/.mov/.m4v`); an off-platform page (**TikTok/YouTube**) is **`external:true` → an honest link-out, never a fake embed**.
  - **§2 AUDIO plays INLINE + the FLORA VISUALISER.** Real `<audio>` + `FloraVisualiser`: a row of **stems topped with blooms** that **sway + pulse** while it plays, each on its own **seeded phase** so it breathes like a **meadow, not an equaliser**. Palette **oxblood · gold · sage · cream** only. Pure CSS animation with `animationPlayState` tied to playback (GPU-cheap, no JS loop, no CORS/analyser dependency); **reduced-motion → it rests, open and still**. **A generic bar meter is a defect.**
  - **§3 BOOKS open INTO reading — 2 taps, never 3.** Tap the cover → the expand **already contains the `ReadingPane`**: the opening pages paginated right there with **Next/Prev + a page count**; the **full reader is ONE clear option** (`onOpenFullReader`). Reuses the **existing `fetchGutenbergBook`** fn (no new backend) and **degrades honestly** (loading / "the pages wouldn't come through here — the full reader will have them"). The full reader keeps everything.
  - **RESEARCHED HARD RULES (v3 · 16/07/2026 · sources: `mnt/femwell/research_inline_media_ux.md` + `research_reader_and_cards.md`):**
    - 🔴 **NEVER drive the visualiser from Web Audio's `AnalyserNode`.** For cross-origin media a `MediaElementAudioSourceNode` **outputs zeroes — the track goes SILENT**, undetectably and irreversibly. The failure mode is *a sleep story that plays silently*. **Time-driven CSS is the canon** (and at 5–9 stems it also beats canvas, which only wins at *hundreds* of nodes). If true amplitude is ever needed → **pre-computed peaks** (same-origin JSON), never an analyser.
    - **The visualiser must drift, not pulse to a beat.** Ambient craft rule: *multiple asynchronous, very slow modulation sources at unrelated speeds*. Per-stem **seeded phases** = canon. Beat-locked/uniform/fast = gimmick. **A generic bar meter is a defect.**
    - **CAPTIONS are Level A (SC 1.2.2)** — inline video ships `<track default kind="captions">` (+ `crossOrigin` for a remote .vtt). **Audio-only is a DIFFERENT criterion (SC 1.2.1) → a TRANSCRIPT**, not captions ("Read it instead"). For this app it's a primary use case, not an a11y tax: she watches in bed, on mute, beside a sleeping partner.
    - **Tap-to-play only; never autoplay narrative.** iOS defeats muted-autoplay anyway (pauses when non-visible; off in Low Power Mode). `playsInline` mandatory. **Native `controls`** — never a custom bar (it costs fullscreen/PiP/AirPlay/OS captions/keyboard).
    - **Data discipline:** render **no `<video>` until she taps**, then `preload="none"`. `preload="metadata"` is *not* cheap — it range-fetches per card on her mobile data. The FloraCover poster is generative SVG: zero fetch.
    - **AUDIO ROUTES TO THE GLOBAL PLAYER** (`usePodcastPlayer`) — a card must never own a dead-end `<audio>`. That's what buys lock-screen controls, background continue, resume, speed and the sleep timer. **Reuse, don't duplicate.**
    - **THE SLEEP TIMER FADES.** Ramp the volume over the last **~20s** and fold the flora closed with it — **never a hard stop** ("a meditation cut off mid-breath is a jolt in the exact moment we promised calm"). Options 5/10/15/30/45/60 + **"End of story"**. Always restore volume (end, cancel, unmount).
    - **PAGINATE FOR FEEL, NOT FOR SCIENCE.** A 2025 CHI study (n=100) found **no** comprehension/duration/workload difference vs scrolling — the old claim is desktop-era. Paginate because it reads as *progression / less intimidating*; **never defend it with a comprehension claim.** Defensible split: paginate book & daily story, scroll essays.
    - **PROGRESS IS PERMISSION, NOT A SCORE.** "~6 min left" invites her in; "62%" grades her. The enemy is not opening it.
    - **MEASURE INVERTS ON A PHONE.** At 390px the risk is lines **too SHORT** (under ~45 chars), not too long. **Never double-frame reading text** (a card inside an expand starved ours to ~41 CPL). **Indent XOR space** (Butterick): a book indents and does not gap its paragraphs.
    - **A SUMMARY THAT RESTATES THE TITLE IS WORSE THAN NOTHING** (NN/g 4 Ss) — guarded in code (`restatesTitle`). And **honesty does not cost taps**: concreteness→clicks is an inverted-U — being **too vague LOWERS clicks**, and habitual clickbait cuts trust for 54.5%. **Write the real thing.**
    - **Honest limits — do NOT cite fake science:** there is **no** reading evidence for/against **drop caps**, and **serif-vs-sans** for long-form on screen is **null**. Fraunces/Cormorant are a **brand** decision. "Cream is kinder on the eyes" is anecdotal; the defensible case for `#ECE7DA` is **positive polarity** (and it *strengthens* as text gets smaller).
  - **§4 THE READERS ARE IN-BRAND.** `BookReader` · `FictionReader` · `DailyStoryReader` render in the **cream paper world**: paper `#ECE7DA`/`#F4EFE3`, ink `#0B0805`, **oxblood `#7A1A12` headings**, gold/sage flora accents, our type. The story reader's themes are on-brand alternates (**Cream** = the default paper world · **Honey** = paperHi+gold · **Plum** = the dark read, ink-on-`#2E261B` with a blush accent). **A reader must look like the card that opened it** — legacy `--plum/--mauve/--rose-primary/#D45E52/#2A2035` are RETIRED here.
- **Consumers pass content, not chrome:** `resolveCard(item)` merges the type's defaults, so an item is just `{ id, type, title, subtitle, …blocks }`. `SAMPLE_CARDS` is a worked example per type (reference + template).
- **Exports to reuse:** `CoverCard` (+ `compact` for a StackedCard half) · `ExpandDetailCard` · `InlinePlayer` · `Chip` · `CARD_TYPES` / `CARD_TYPE_KEYS` / `resolveCard` / `SAMPLE_CARDS`.

**HARD RULES.**
1. **Covers are FLORA, never photos** — `FloraCover` picks the scene + colourway from the item's `category`/`type` (§4). No stock imagery, ever.
2. **Uniform same-row sizes** (§6.7.0) — every cover in a half shares height/width.
3. **Each half slides HORIZONTALLY** (§6.10.2) — the gold hairline separates the halves; vertical reveal only WITHIN a lens.
4. **One expand, everywhere** — never a bespoke detail page per type; add a **block**, not a new card.
5. **Every card carries a real hook + an inline action** (§6.7.2/§6.7.4); the open deep-links the EXACT item.
6. 🔴 **CONTENT ONLY.** This pattern is for reads/listens/sessions/books/recipes/rituals/almanac/content-rooms. **Pointed at PEOPLE or CONNECTION it must run through the DM/connection safety rails** (consent-gated messaging, anonymity-by-default, k-anon, report/block) — a tap-to-open "profile card" would bulldoze them. Never repurpose these cards for people.

**Reference:** `/CardVariationsDemo` (the ten types) · `/StackedExpandDemo` (a board: Articles ⁄ Books) · `/ClipboardExpandDemo` (the standalone carousel).

### 6.7.8 THE READER STANDARD — one reading-craft foundation for every text surface (✅ AGREED · Halli 2026-07-16) · v1
> **Every reading surface reads through `src/components/brand/ReadingColumn.jsx`.** Six surfaces styling long-form text separately is exactly how craft drifts — so the column is **the ONLY thing allowed to set measure, side padding and leading**. Researched: `mnt/femwell/research_reading_foundation.md` + `research_reader_and_cards.md`.

**⚠️ THE INVISIBLE TRAP (read this before touching any reader).** `src/index.css` remaps **BOTH `'Inter'` AND `'Fraunces'`** to Cormorant at **`size-adjust: 150%`**. A surface declaring those fonts renders **1.5× its nominal px** — invisible from the declared size. It is why the two reading engines sat at **~29 CPL** while every `SERIF` surface was a healthy ~45–50. **Reading text always uses the un-adjusted `SERIF` stack**, where a size means what it says. (Display headings may keep the remapped face — that's a deliberate visual, not a measure surface.)

**THE RULES (enforced by the component, not by copy discipline):**
1. **MEASURE IS IN `ex`, NEVER `ch`.** `1ch` is the advance of the "0" glyph — **20–30% wider** than the average character — so the popular `max-width:65ch` yields **~80–85 characters** (at/over the WCAG 80 cap). *Tailwind's `prose` ships that overshoot; copying it copies the bug.* USWDS — the only system that tokenises measure — uses `ex`; its 66-character target is **`60ex`** = our `READING.measure`.
2. **SELF-CLAMPING:** `width: min(measure, 100%)` + `margin-inline: auto`. **Never `max-width` under a padded ancestor** — that is the double-framing bug.
3. **SOLE PADDING OWNER.** No parent card/sheet/page may add side padding to reading text. **At 390px the max-width never binds — PADDING *IS* MEASURE.** The bug is structural, not typographic.
4. **NEVER SHRINK TYPE TO BUY CHARACTERS.** **45 CPL is unreachable at 390px** with readable type (~38 CPL at 18px is the honest arithmetic). **Accept 38–42 on a phone.** The "<45 = danger" line is desktop-derived, and positive polarity (our cream) pays *more* as type gets smaller. Floors: **18px immersive / 16px absolute**.
5. **LEADING ≥ 1.5** (we ship 1.62).
6. **INDENT XOR SPACE (Butterick), by `variant`:** `article` · `horoscope` · `card` → **spaced, no indent**. `fiction` · `book` · `dailyStory` → **indent, no gap**. This one switch is what separates our readers. Never both.
7. **ESCAPE HATCHES ON DAY ONE:** `bleed` + `measure="none"`. A component with no legal exit gets copy-pasted and mutated — **and that IS drift**.
8. **NO ARTICLE PROGRESS BAR.** Zero evidence they help; across **32 experiments** progress bars **backfire** under high early investment — a long read is exactly that.
9. **READ-TIME IS PERMISSION WHEN SMALL, A DETERRENT WHEN LARGE.** Say "4 min read" proudly; **past ~10 min say nothing** (or offer the next *break*) — stating a large time cost made **fewer** people finish. Use `readTimeLabel()`, which returns `null` past the threshold. (The famous "+40% engagement" figure is vendor marketing with no method — **do not cite it**.)
10. **SILENT auto-resume.** Restore her position with **no ceremony and no "continue reading?" prompt**. Precedent exists (Pocket/Instapaper); measured benefit does not — ship it quietly, claim nothing.
11. **A BUTTON MUST DO WHAT IT SAYS.** ("Mark as read" / "Save tonight's reading" shipped as no-ops that just closed the sheet — a button that lies is worse than no button. "Mark as read" now feeds the **Garden** via `recordProgress`.)

**APPLIED (2026-07-16):** the in-card expand body + the book `ReadingPane` (`expandCards.jsx`), `ChapterSheet` (dailyStory variant) and `ReadingSheet` (horoscope variant) in `LifestyleEliteShell`, and the **article reader** `LifestyleDetail` (font-trap fixed, de-framed, tokens migrated, read-time + silent resume). **`DailyStoryReader` is flagged for its own component pass** (2,033 lines; it is the engine behind BOTH `FictionReader` and `BookReader`, and its measured pagination is coupled to the font metrics — a font change there forces a pagination re-tune. It is already on-brand; its measure fix must be done deliberately, not as a craft sweep).

---

## 6.8 CANONICAL PAGE STRUCTURE — the brand SIGNATURE on every page · v1 2026-06-19
> Halli's brand language: **every primary page opens with the SAME signature top, then varies below.** Build it from `src/components/brand/PageTop.jsx` (`FwFloraHero`) + `brand/Card.jsx` (`SummaryCard`).

**The signature (top of every page):**
1. **FLORA HERO** (`FwFloraHero`) — the page's flower on a **realistic single diagonal bough growing out of a dusk WILDFLOWER MEADOW**, carrying a **colourful two-tone SPRAY** that opens **one → many**; then the single carved **Heart** (§3), an **Ephesis script page title**, a short warm line. Flanking meaning-blooms optional. **NO dashed ring.** (Craft target — being finalised in the "Realistic Branch" demo; supersedes the earlier flat-stick rotation. Ref impl lives in `src/components/brand/floraBranch.js` + `workspace/flora/hero/{foliage3,meadow}.cjs` → folds into `PageTop.jsx` once the palette is picked.)
   - **The bough (realism, Halli 2026-07-03):** ONE clean **diagonal** bough, lower-left → upper-right (the Health-hero direction) — a **filled, tapered, curved** branch (thick root → thin tip, bark shading + knots at nodes), **real leaves on petioles** (ovate blade + midrib + contained veins). Never a uniform stroked "stick".
   - **The meadow surround (Halli 2026-07-03, research-driven):** the bough rises from a **layered dusk wildflower-meadow patch** — tall hazy **back grasses + pale wild plants** (depth) → mid **yarrow** (flat white umbels on thin stems) + **cow-parsley** lace + grass **seed-heads catching light** → a **dense grass tuft at the foot**, thinning to the right; soft ground shadow. Muted/on-brand (cream paper · desaturated olive-sage greens · cream flowers · gold seed-heads), **not garish**. Deterministic PRNG scatter (natural but stable).
   - **The flower (Halli 2026-07-08 — colour · bigger · distributed · one→many):** **(a)** use a **vivid two-tone combo (§2.5.1)** — coral→gold, magenta→cream, violet + butter heart, crimson + gold, periwinkle + gold — richer than the pale single-tones. **(b)** **BIG, STEM-LESS blooms DISTRIBUTED ALONG the whole bough** (and the side twig) — 4–5 large flowers spaced naturally down the branch like a real flowering bough, **not one lone flower and NOT a single crown cluster** (clustering made them small — Halli). Render each with `RichBloomV2 headOnly` (no stem/leaves/shadow — the flower sits cleanly on the wood on a tiny pedicel). **(c)** THE **ONE → MANY bloom mechanic:** `openness` drives **HOW MANY flowers are open along the bough**, NOT size. **Low/bud = ONE open bloom near the tip + closed buds spaced down the branch; full = every bloom open** — as openness rises the buds *open in sequence down the bough* (each slot has an opening threshold → smooth, tied to the same stages). *(Replaces the old "openness scales the one flower" — that read as shrink/grow, not growth.)* Ref: `workspace/flora/hero/build-distributed-demo.cjs`.
   - **PRESERVED (the hero's contract — pages depend on it):** **tap-to-rebloom** still driven by `openness` (now one→many, e.g. the Nutrition hero); the **colourway/combo mood tint** retints the whole spray; the **companion creature** rides the bough. The **species/combo/openness are the PAGE's**; only the **side twig** + the flower **combo** vary across the app. Every existing `FwFloraHero` prop keeps working (no page breaks).
2. **ONE SUMMARY CARD** (`SummaryCard`) — directly under the hero: a signal-driven "what's here / what to do today" glance (6.7.5), never hollow.
3. **PAGE-SPECIFIC CONTENT BELOW** — rich cards / per-type `FwCardRow`s / the page's own surfaces. **Pages differ here; they all share the signature top and all use the §6.7 cards.**

**The FLORA STORY (app↔user) — why the hero flower matters (`BRAND_FLORA.md`).** The hero bloom is not ornament: flowers carry documented meaning (floriography + cycle/folk-herbalism) and mean the **same thing everywhere** (garden, cycle, journal, chapters). The page-character flower (§5.3) + the per-user **flora fingerprint** (§5.2) make each page feel like *hers* and tie the whole app into one living garden — the hero is the daily face of that garden. Keep the cycle ring exclusive to Today; elsewhere the ring is decorative so the signature reads as "your garden," not "your cycle."

**Consistency rule:** the hero + summary-card top is **fixed brand chrome** — same structure, type, flora discipline on Journal, Community, Nutrition, Lifestyle, Health, Planner, Profile, Programs, Garden. Only the flower/colourway (character) and the content below change.

### 6.8.1 THE TOP-AREA CHROME STANDARD — app-wide, EVERY page (NOT inside cards) · v1 2026-06-26
> **Every page's TOP AREA carries a fixed set of CHROME controls — page-level, never buried inside a card.** Three things, on every page:
> 1. **The JUMP-TO pill** — the central "jump to any area" switcher (the canonical `JournalHubSheet` "Jump to" pattern; see the CLAUDE.md multi-layer rule). One consistent control to reach any section of that page.
> 2. **The two FOCUSED ACTION PILLS (§6.7.0a)** — the page's **page-appropriate primary actions**, e.g. **Speak-your-plan / Plan-a-day** on Planner, **Log-a-meal / Log-water** on Nutrition, **Leave-a-line / Set-an-intention** on Journal. Same component everywhere; the two labels/actions change per page (plum "voice/express" pill + gold "do/plan" pill).
> 3. **The UNIFIED CALENDAR ICON** — a single calendar control that opens the calendar as an **OVERLAY**.
> - **These live in the page's top area** (with/just under the signature top: flora hero → summary card), as **page chrome — never inside a card, never buried.** Same placement on every page so a user always finds jump-to, the two actions, and the calendar in the same spot.
- **THE UNIFIED CALENDAR (one calendar across the whole app):** there is **ONE** calendar — the **Today-page calendar** — and **every page opens that same calendar as an overlay** via the top calendar icon. It can **plan and log for any day**. **Do NOT build per-page calendars** — every surface reuses the single shared calendar overlay. (One calendar, one mental model; the icon is the door, the overlay is the room.)

### 6.8.2 THE CANONICAL PAGE TEMPLATE — the Nutrition V2 skeleton, now the app-wide standard · v1 2026-07-08
> **Halli signed off the Nutrition V2 page (`NutritionV2Shell.jsx`) as the reference every primary page is now brought up to.** §6.8 gives the *signature top*; this gives the **whole page, top-to-bottom** — the exact sequence of bands, which are **FIXED brand chrome** (identical on every page) and which **VARY per page** (the page fills the same slots with its own content). Build the next page (Community first) by walking this list in order. Reference implementation: `src/components/nutrition-elite/NutritionV2Shell.jsx`.

**The bands, top → bottom (each row is one horizontal band; nothing free-floats):**

| # | Band | FIXED vs VARIES | What it is |
|---|---|---|---|
| 0 | **Top chrome** | **FIXED** | `TopChrome` (jump-to pill + calendar icon, §6.8.1). Page background = `PAPER_BG`, never a flat fill. |
| 1 | **Flora hero + CONTROLLER CARDS** | **hero FIXED · controllers VARY** | The `FwFloraHero` (§6.8) **with tap-to-rebloom controller cards underneath**: a row of **uniform ~72×64 icon+label cards** that ARE the controller — tapping one **rewrites the hero title + line, re-tints the colourway, and re-blooms one→many** (`openness`), then shows a **phase/stage pill** + **the selected card's ONE primary action button** (full-width, accent-filled). The hero, the uniform-card discipline, the phase pill and the single action button are FIXED; the **5 controller destinations** are the page's own (Nutrition: Plan/Snap/Tonight/Cook/Body). |
| 2 | **TOP UNIFORM SLIDING ROW** (glance ⇆ Jess) | **structure FIXED · copy VARIES** | One swipeable row of **two equal-height panels** (`JessGlanceSwipe`, `minHeight` shared so **no card is a different size on the same row — §6.7.0**). **Slide 1 = "Today, at a glance"** — 2–3 signal rows + an **add-to-today** action grid of focus pills. **Slide 2 = the Jess digest card** — a written, per-page, **signal-driven summary that ROTATES every load** (see below), with 3–4 chips and a **"Open Jess's full read" button that raises an UPWARD-SLIDING INNER SHEET WITHIN the card** (§6.7.6 language) holding the long read — so depth never grows the card or becomes a wall of text. Dot pager + "swipe for Jess's read →" hint. |
| 3 | **The big BOARDS** (`ClipboardSlider`) | **frame FIXED · boards VARY** | The horizontal **clipboard slider** (§6.10) with **‹ › arrows + hairline divider + "Slide …→" hint**, each board a `Clipboard` (title + eyebrow-sub + corner flower) whose body is a **`StackedCard`** with two internal sub-sliders of `Panel`s (§6.10.2 — maximise length, no dead space). This is the page's **deep content**, grouped into 4–6 named boards (Nutrition: Eat today · Cook tonight · Plan & explore · For your body · The kitchen table). Every panel is real, data-driven, and does something. |
| 4 | **"Handy right now" QUICK ROW** | **structure FIXED · items VARY** | A short Ephesis-italic label ("Handy right now") over a **horizontal row of COMPACT one-line cards** (`V2QuickRow`) — icon + label + chevron, **every one a real jump/action** (accent left-border, gradient wash). The one-line-card shape and "every chip is a real action" rule are FIXED; the 5–6 jumps are the page's. |
| 5 | **Closing signature** | **FIXED** | A centred drifting `Pollinator` + one warm Cormorant-italic closing line ("One nourishing thing is plenty…"). Reassuring, never a cap/scold. |
| — | **Overlays** | **FIXED doors, VARY content** | Full-screen work happens in **overlays/sheets**, never inline walls: `JumpSheet`, the shared `CalendarOverlay` (§6.8.1), page generators, and `SheetShell`-wrapped loggers. A tap deep-links the **exact** thing full-screen (§6.7.0). |

**The rules that make the template WORK (enforce all — each was a repeated miss):**
1. **Uniform same-row card sizes — HARD (§6.7.0).** Any two cards on the same sliding row share height/width (`minHeight` + `flex:"0 0 …"`). Different sizes on one row is a defect, full stop.
2. **No dead space.** Bands stack tight; `StackedCard` maximises length; a panel with little content still carries real chrome + an action — **never an empty/dumb container** (§6.7.2).
3. **Real card chrome only (§6.7.0).** Import the typed variants from `brand/Card.jsx` / `SliderKit` / `ClipboardSlider`; never hand-roll a `<div>` card. Gradient paper wash + double editorial shadow + accent rim + corner sprig.
4. **The card language (§6.7.0).** Every card has a hook/eyebrow, a real line/snippet, and an **inline action**; media plays IN the card; every open deep-links the exact item full-screen.
5. **Plain, warm "smart-friend" voice** (§10.5) — never clinical. Nudges, not targets ("room for ~X kcal — not a target, a friendly heads-up"). Whole-life, not health-only (CLAUDE.md).
6. **The per-page Jess digest VARIES every load.** It's **written + signal-driven** (reads the page's real state — plan? water? phase? plants? logged?) and **rotates on a per-load seed** so it's fresh each visit; falls back to warm "funnies" when there's no signal. Build one `nutritionJessSummary`-style function **per page** (Community, Lifestyle, …), same shape, page-appropriate signals.
7. **Long text opens into inner sheets/overlays, not walls.** The Jess "full read" rises as an **inner sheet within its card**; deep content lives in boards and overlays. The scrollable page itself stays scannable bands.

**FIXED signature (identical on every page):** top chrome → flora hero (+ its controller-card + phase-pill + single-action pattern) → the two-panel glance⇆Jess row → clipboard boards frame → "Handy right now" one-line row → closing pollinator+line → shared overlays. **VARIES per page:** the 5 controller destinations, the glance rows + add-to-today actions, the Jess signals/copy, the 4–6 board names + their panels, the quick-row jumps, the page's flower/colourway character (§5.3). Bring a page to standard = fill these fixed slots with that page's real surfaces (Today · Journal · Community · Nutrition · Lifestyle · Health · Pulse · Planner · Profile · Programs · Jess · Events · Deals — CLAUDE.md "wire ALL the surfaces").

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
| **In-app brand doc** | `components/founders/brandDocs/brand-bible.html` (the ONE "Brand Bible" in Ideas) | the single phone-readable export of this file; the old `BrandIdentityDoc.jsx`/`FloraMeaningDoc.jsx` mirrors are retired (folded in). |

> **NOTE (current state):** the glyph library + colourway grammar + fingerprint currently live in `pages/BrandCraftSample.jsx` (the craft sample). On lock, **promote** them to shared modules (e.g. `components/brand/flora/*`) so Today/Garden/etc. import them. Until then, `BrandCraftSample.jsx` is the source of truth for the implementations.

---

## 10. THE LIVING ECOSYSTEM — lifecycle + omens + voice (✅ AGREED §10.1–§10.5); craft (⏳ PROPOSED §10.6)
> **STATUS:** **§10.1 lifecycle · §10.2 fauna/omens · §10.3 the rotating omen engine · §10.4 the safety rails · §10.5 the voice (incl. almanac flavour) are all ✅ AGREED / CANON.** Halli **APPROVED the omen FEATURE on 2026-06-27** — the rotating tap-to-reveal omen headers + the omen voice are now canon (build them). **Only §10.6 (the wax/letter/vine/pressed-flower craft) + the formal archetype remain ⏳ PROPOSED.** Grounding research: `workspace/OMEN_VOICE_RESEARCH_2026-06-19.md` (+ `BRAND_RESEARCH_2026-06-19.md`); the omen copy bank lives in the research doc.

**The three laws of the ecosystem (the proposed framing):** (1) **nothing is static** — every plant is at a *lifecycle stage* that mirrors her season [AGREED]; (2) **everything can be read** — a bloom/creature carries a gentle meaning she can tap to reveal [PROPOSED]; (3) **everything is keyed to her** — what appears is chosen from real signals [PROPOSED].

### 10.1 THE FLORA LIFECYCLE (the stage IS the meaning) — ✅ AGREED
A flower has seasons; so does she. The SAME flower at a different **stage** says where she is — no chart, no words. Add a `stage` prop to `RichBloomV2` (pure render variants): **bud** (furled — anticipation/becoming: follicular, a new chapter, a goal just set), **bloom** (open — peak/expression: ovulation, a win), **seed** (the rose *hip* — harvest/integration/letting go: luteal, finishing, a lesson), **rest** (the bare cane *with a new bud on old wood* — restoration, **winter not death**: menstruation, postpartum, grief, a chosen pause), **return** (new bud — renewal, after time away). **HARD RULE: rest is a stage, not a failure — never draw "nothing"; draw dormancy with a bud on it.** (Rose canon: bud → bloom → hip → bare cane → new bud, botanically true.)

### 10.2 FAUNA & OMENS (a garden that speaks) — ✅ AGREED (Halli approved 2026-06-27)
Creatures visit plants and carry a **gentle omen**. **The omen contract (every omen):** (a) kind & hopeful; (b) framed as folklore — *"they say…"* — never a promise; (c) ends in a small action or a true observation; (d) never doom, never guilt. A creature visits, speaks once, drifts off. The library (creature → folk meaning → spoken line) lives in the brainstorm doc + `BRAND_FLORA.md §6.3`; e.g. robin = news on the way · returning butterfly = change/the soul · ladybird = small luck (*as many happy months as spots — drawn with a real countable spot-count*) · bee = connection (+ the *"telling the bees"* ritual → "tell the garden your news") · dragonfly = clarity · moth = rest-night · firefly = hope · snail = patience · spider's dewy web = weaving. Plants give signs too (a bloom opened overnight, dew, a second/out-of-season bloom, the first snowdrop).

### 10.3 THE ROTATING FLORA-OMEN ENGINE (technical — NO new function) — ✅ AGREED · BUILD IT
Every section is **headed by a flower/bouquet** that reflects the section + her story, **rotates**, and is **tappable → a meaning reveal** (3 layers: the flower's fixed floriography meaning · the omen "they say…" line · the personal "why now").
- **Module:** `src/components/brand/floraOmen.js` — a **static front-end module**: `MEANING_LIBRARY` (flower→meaning · creature→omen · lifecycle→meaning) + line templates + `pickOmen(signals, seed)`. **Pure render-time selection; NO backend call, NO new base44 function (50-fn cap respected).**
- **Signals** assembled from context the page **already loads** — cycle phase & day, life-stage, recent mood/theme, days-since-last-open, programme progress, what she tends, the date + special dates, the flora fingerprint. **No new fetch.**
- **Daily rotation:** reuse `hashSeed(userId + 'YYYY-MM-DD')` → stable all day, same on every device, rotates daily.
- **Priority ladder** (highest available wins; seed breaks ties): 1 life-event (birthday · milestone · welcome-back · hard anniversary) → 2 body-season (phase/lifecycle) → 3 recent story (mood/theme) → 4 calendar/sky (season · moon · solstice · folk-saying) → 5 gentle daily **fallback** (seasonal time-of-day omen — **never blank, never "no data"**; library large enough it won't repeat within a fortnight).
- **Tappable reveal** = the existing bottom-sheet (no new route). **Writes** ("press to journal", "this resonated") ride **existing dispatcher actions** — never a new function.
- **Section headers** = existing `FwFloraHero` + the section's signature species (§5.3) + `stage` + the omen creature. Reuse, don't rebuild.

### 10.4 THE FOUR SAFETY RAILS (non-negotiable) — ✅ AGREED (ship the omen feature WITH these)
1. **Ration the magic** — an omen on *every* open stops working. ONE real omen/day (the Today "almanac" moment); section headers reveal **on tap only**; plain days stay plain.
2. **Never resurface a hard memory unprompted** — "on this day"/pattern-surfacing is **gated**: a loss/breakup/low-mood entry is NEVER pushed without her opening it first. Grief patterns surface only inside Journal, gently — never a morning greeting.
3. **Hope-only readings** — where a folk omen has a dark variant (out-of-season bloom = "survival" OR "sickness"), the engine uses ONLY the hopeful reading. No omen ever predicts harm.
4. **The saccharine test** — if a line would fit unedited on a supermarket greeting card, cut it. Every line earns its place with a specific detail or a real action.

### 10.5 THE VOICE — warm · funny · nurturing · soulful, with almanac flavour — ✅ AGREED (locked 2026-06-20)
> **The canonical voice. Halli confirmed "keep it" (2026-06-20) — fully agreed, including the omen/almanac flavour.** A warm, witty, nurturing smart-friend with soul and a gentle touch of wonder.
- **Register & principles:** *notice, don't cheerlead* ("rough night?" beats "you've got this!") · *specific over sentiment* ("send the text," not "good things await") · *funny, warmly* (dry, UK, a wink in small places — a card footer, an empty state — never zany, never every screen) · *soul not saccharine* (the supermarket-card test: if it'd fit unedited on a greeting card, cut it) · *never punish a gap* (a hard stretch is weather, not failure) · *no emoji, UK English, no scoreboards/guilt, lighthearted by default* (life-stage gently tints).
- **The almanac flavour (AGREED):** a gentle gardener's-lore wonder — the *"they say…"* device (folklore, never a promise — "a bird's on your plant, good news might be coming"; "the stars are singing…") always earthed by the **kettle rule** (a domestic wink after any mystic line). The voice carries this soul, and the **omen FEATURE that computes & surfaces these lines from her data is now AGREED too (§10.2–10.4, approved 2026-06-27)** — both the way we write and the machinery are canon.
- **Method (Mailchimp):** the *voice* is constant; the *tone* flexes to her state (plainer on a hard day, brighter on a high one). **Avoid two poles:** Co-Star's brutal edge AND Duolingo's guilt.

### 10.6 CRAFT THAT CARRIES MEANING (format = feeling) — ⏳ PROPOSED (awaiting sign-off)
- **Wax rose seal + sealed letters:** Health becomes *correspondence* — each letter arrives **sealed with a wax rose** (her signature flower, phase-coloured); opening breaks the seal (once-only lift). Extends to a monthly **"letter from your body,"** a milestone certificate, a sealed **"letter to future you"** in Journal, Jess's notes as folds.
- **Vines that grow with progress** (a leaf per session, a bloom at the end — growth, not a progress bar).
- **Pressed flowers** for saved/remembered things (the garden remembers; "on this day" shows last year's pressed bloom — **gated per rail 2**).
- **Deckle/letterpress paper**, Ephesis **script for margin-notes & omen lines** (they read hand-written), Cormorant letterpress for letters, **dawn/dusk light** that warms/cools with time of day.
- **Cards as objects, not boxes:** `LetterCard` (deckle + wax seal + fold) · `PressedFlowerCard` (a memory) · `AlmanacCard` (the dated daily omen, script) · `GrowingCard` (vine progress). The soul is in the *format*, not a sticker on top.

---

## 11. GLOBAL PAGE STANDARDS — the LIFESTYLE-PROVEN canon (page-agnostic · ✅ AGREED · Halli 2026-08-01) · v1
> **These are not Lifestyle rules — they are the rules Lifestyle PROVED, promoted to app-wide canon so EVERY future page inherits them.** §6.8.2 gives the page *skeleton*; **§11.0 gives the PROCESS every page is built by**; §11.1–§11.8 give the *standards of craft, safety and proof* each piece must meet. Each was earned against real pixels + real taps on the Lifestyle shell + its 11 whole-life boards. Build every page this way; a page that misses one is a fix target, not a variant.

### 11.0 THE PER-PAGE BUILD LIFECYCLE — how EVERY page is built (Lifestyle is the reference implementation) — ✅ AGREED · Halli 2026-08-01
> **This is the PROCESS, not just the product. Every future page goes through the EXACT lifecycle Lifestyle did — it does not merely inherit the visual tokens below.** The order is load-bearing: skipping a step is how thin shells, faked shelves and DOM-only "green" got shipped before. Run all seven, in order, per page.
1. **MOTHERBOARD FIRST.** Lay the WHOLE page out as one board — every section, every surface it must serve (Today · Journal · Community · Nutrition · Lifestyle · Health · Pulse · Planner · Profile · Programs · Jess · Events · Deals — CLAUDE.md "wire ALL the surfaces") — **then strip it into tiny, independently-buildable pieces.** Plan the whole before building any part.
2. **PER-PIECE: RESEARCH → BRAINSTORM → BUILD WITH SUBSTANCE, ONE AT A TIME.** For each piece, a focused **researched brainstorm FIRST** (best-practice + **cited science where relevant** — dispatch Ms Deep Search; never generic) BEFORE a line is built. Then build that ONE piece with **real substance** — real content, real chrome, a real action. **Never fan thin shells across many names** (the single most-repeated failure); one substantial piece beats five hollow ones.
3. **MEASURE CONTENT BEFORE BUILDING ANY CONTENT SURFACE (§11.5).** Raw entity counts **overstate usable content 3–5×** once pollution is filtered — count what actually passes the **domain denylist** (`title+subtitle+summary+excerpt+tags+category`), per section, first. **Never fake a shelf:** thin → lean-editorial or deep-link to a real destination; **honest empty-states**, never a blank card.
4. **DROP EACH FINISHED PIECE STRAIGHT ONTO THE LIVE PAGE — reversible, nothing stripped.** No parallel "demo shells" that never land (a `/XxxDemo` the user can't reach is a FAILURE — CLAUDE.md); build INTO the live page as an additive, revertible change. **Deploy PER PIECE** (git push + `npx base44 site deploy -y` + the per-build cache-buster §11.8). Default is ADD/IMPROVE — never strip an existing feature without explicit sign-off.
5. **VERIFY EACH PIECE WITH REAL PIXELS + REAL INTERACTION (§11.7).** The headless screenshot pipeline at **360/390/430** + **actual taps** — never DOM-asserts alone. A piece isn't landed until its pixels *and* behaviour are proven, then re-screenshot.
6. **END WITH A DEEP ADVERSARIAL AUDIT of the WHOLE page** — visual + functional + content + console/network — assume it's broken until proven otherwise. Produce a **severity-ranked defect catalogue (P0/P1/P2) with a screenshot or interaction-log per issue**, fix in priority order, and **re-prove each fix**. A page is not "done" — and is **not reported as done** — until that audit passes.
7. **NO NEW BASE44 ENTITY/FUNCTION WITHOUT EXPLICIT SIGN-OFF** (the ~50-function cap is real). Fold new behaviour into **existing dispatchers**; a schema/function delta is an MP for sign-off (Ms Data / Mr Lead Manager), never a silent add.

**Lifestyle IS the reference implementation of all seven** — motherboard → per-piece researched builds (the 11 whole-life boards, one at a time, real substance) → measured content + denylists + honest empty-states → dropped live and deployed per piece → real-pixel/real-tap verification → the deep adversarial QA catalogue (P0–P2, fixed + re-proven) → zero new entities/functions. **Bring any page to standard by walking this list; §11.1–§11.8 are the bar each piece clears.**

### 11.1 CARD & CLIPBOARD SIZING + LIGHT FRAME (supersedes any small-fixed-px card) — ✅ AGREED
- **In-focus card = ~89% of the VIEWPORT** (measured 89% at 360/390/430 — never a fixed px like `250px`, which reads small AND *shrinks as a %* on wider phones: 250px was 69%@360 but 58%@430). Express the width in `vw`; cap with a `maxWidth` (~400) so it stays a card on tablets.
- **Keep a ~15px PEEK SLIVER of the next card** — the only honest signal that the row slides. A card that fills the whole width kills the affordance; a single-card shelf correctly shows no peek.
- **SHELVES BLEED to the screen edges** (`margin: 0 -16px`, `padding-left: 16` so the first card still aligns with the section headings). This is what makes a ~89% card *and* a peek both fit inside a 16px-padded container — and it trims wasted outer margin (a card must feel generous, not a small box floating in cream). **Guard the page with `overflowX: clip`** so the bleed never becomes a horizontal page scroll.
- **FRAMES ARE LIGHT — content dominates, frame recedes (§6.1 "cream-on-cream, hairline + a *tiny* shadow").** Thin borders (1px hairline; a 3px accent spine, not 4), reduced nesting/chrome, quiet corner sprigs + binder-clip, softer shadow, trimmed padding. A heavy nested frame eats space and adds noise; the frame is furniture for the content, never the subject.
- **MECHANISM:** the `wide` + `light` opt-in props on `ClipboardSlider`/`Clipboard` (§6.10 · `src/components/brand/ClipboardSlider.jsx`) are the reference — `wide` = responsive board `min(90vw,440)` with a real peek; `light` = the trimmed frame, passed down to boards. **Opt-in props default OFF** so a shared component upgrades page-by-page without silently changing every caller (Community/Doctor Export/demos stayed byte-identical while Lifestyle adopted it). Board pages that own their own `Shelf` apply the same `89vw` + bleed directly.

### 11.2 MEDIA = ONE TAP ON THE CARD FACE — ✅ AGREED
- **Video and audio play IN PLACE on a SINGLE tap on the card face** — never expand-then-play, never a route away. The card face itself carries the player affordance (a bloom-play over the FloraCover poster).
- Video → **`FloraYouTube`** (lite-facade: no iframe until the tap, then `autoplay=1` swaps in `youtube-nocookie` in-card) or **`FloraVideo`** (poster → real `<video autoPlay playsInline>`). Audio → **`FloraAudio`** (play button on the face; the global podcast player keeps it playing while she browses). All in `expandCards.jsx`.
- **PROOF BAR:** "plays" means **frames / `currentTime` actually advance on a real tap** (measured), not "an iframe/`<video>` is present." Tap-count is the KPI — the recurring failure was 3-taps-and-a-navigation dressed up as inline.

### 11.3 READER IN PLACE (≤2 taps, no slow route) — ✅ AGREED
- **A reader opens IN PLACE in ≤2 taps** — a sheet/overlay over the current page, never a navigation to a slow detail route (`/…Detail`-style routes are demoted to a secondary "open full-screen", never the primary path).
- **Authored chapters carry markdown — render it, never dump it raw.** `## Chapter N — Title` → a styled heading, `**bold**` → bold, via `src/utils/chapterProse.jsx` (`ChapterProse`/`ChapterBlock`); a preview clips through `storyPreview()`. **`stripHtml()` is NOT enough** — it strips tags but leaves `##` literal *and* collapses the `\n\n` that separates paragraphs. Reading craft itself is §6.7.8.

### 11.4 MAGAZINE CONTENT CARDS — collapsed teases, open reveals MORE — ✅ AGREED
- **Collapsed card = a real hook/teaser** (a genuine snippet from the item, never an empty container — §6.7.2). **Opening reveals MORE than the summary, drawn from the item's OWN body** — never an echo of the hook, never invented text to fill space. If the body genuinely has no more, the card deep-links to the real destination rather than padding.

### 11.5 CONTENT-SAFETY PATTERN — mandatory for EVERY content surface — ✅ AGREED
> The single most-repeated content failure: building a shelf against RAW counts, then shipping a half-empty or off-tone rail. Every content surface follows this BEFORE it ships.
1. **MEASURE real per-section content FIRST.** Raw entity counts **overstate usable content 3–5×** once pollution (wrong-domain, near-duplicate, unpublished, malformed) is filtered. Count what actually passes the denylist, per section, before designing the shelf.
2. **DOMAIN-SPECIFIC DENYLIST, checked against `title + subtitle + summary + excerpt + tags + category`** — not the title alone; pollution hides in the body. Each surface owns its denylist.
3. **NEVER FAKE A SHELF.** If a section is genuinely thin, go **lean-editorial** (a prompt/ritual spine + honest empty-state) or **deep-link to a real destination** (Community/Events/Deals) — never a blank card, never filler, never a stock image.
4. **CITE SCIENCE HONESTLY** — real claims with sources; no vendor "+40%"-style figures; say "well-evidenced" only where it is.
5. **ANTI-FRAME COPY MUST NOT NAME THE JARGON IT REJECTS.** "Rest counts even when sleep doesn't come" — **not** "no orthosomnia here." Naming the frame plants it. (Whole-life, lighthearted-by-default; let life-stage gently *tint*, never dominate — CLAUDE.md.)

### 11.6 FORMATTING HYGIENE — shared formatters, no raw data on the face — ✅ AGREED
- **Durations through the ONE shared formatter** `src/utils/duration.js` `fmtDuration()` — **never print `duration_label`/`duration_seconds` raw** (rows store raw seconds like `"2700"`; printing them leaks "2700" onto a card). Every board, the shell, media players and the listen grid import it.
- **`cleanTitle()`** (`src/utils/cleanTitle.js`) strips stray `*asterisks*`/`_marks_`/`~` from INGESTED titles at the item source (a creator's "The \*PERFECT\* Routine" must not surface literal asterisks), while preserving legit `file_name`/`A&E`.

### 11.7 VISUAL QA GATE — real pixels + real interaction, never DOM-asserts alone — ✅ AGREED (hard gate)
- **"Verified" REQUIRES a real screenshot AND a real interaction.** DOM presence/counts are NOT proof — empty-but-present containers, text overflow, right-edge clipping, z-index spill and invisible text all pass a DOM assert while looking broken. This was a real process failure; it is now a hard gate.
- **The pipeline:** a headless Chromium reusing the persisted authed profile (`scripts/visualQA.cjs`-style) that **screenshots every component / every board full-page at 360 / 390 / 430**, drives the pickers / play-buttons / readers / deep-links as **real taps**, and asserts playback / navigation / state actually happened. Catalogue every defect with a screenshot + the fix, then **re-screenshot to prove** it. **No DOM-only "green."**
- **Honest limits are part of the gate:** if the session can't authenticate (headless OTP/OAuth isn't completable and entering credentials is prohibited), say so and get the human to foreground an authed browser — never mark an auth-gated write "verified" from an unauthed run.

### 11.8 DELIVERY — the per-build cache-buster (deploys must reach devices) — ✅ AGREED
- **`index.html` ships with NO `Cache-Control` and base44 does NOT honour `public/_headers`** (measured) — so a plain `location.reload()` re-reads the *cached* stale HTML and the device stays on an old bundle ("nothing's changing"). **The in-app `liveBuildGuard` does a per-build cache-busting reload** (`location.replace` with `?b=<hash>`, keyed per-hash so two deploys/session each land and it can never loop) — that is the real fix, kept in `main.jsx`. Deploy with `node scripts/deploy.mjs` / `npx base44 site deploy -y`; a no-op redeploy keeping the same `index-*.js` hash is success, not failure (deterministic build).

---

## 9. APPENDICES & IN-APP MIRROR
- **The ONE in-app brand home:** the **"Brand Bible"** entry in the Ideas page (`components/founders/brandDocs/brand-bible.html`) = the single phone-readable export of this file. There is **exactly one** brand entry now — the former "Living Ecosystem", "Brand Identity" and "Flora & Meaning" entries are **folded into it** (the `BrandIdentityDoc.jsx`/`FloraMeaningDoc.jsx`/`living-ecosystem.html` are retired).
- **`claude-state/BRAND_FLORA.md`** — deep flora map, floriography + colour-symbolism research, the fingerprint permutation math (§7.1), full sources (a cited *appendix* to §5/§10, not a separate brand doc).
- **`claude-state/BRAND_IMAGE_RESEARCH.md`** — the botanical-system research brief (Aesop restraint, Art Nouveau whiplash line, William Morris, the fleuron, women's-wellness palette), with sources.
- **`workspace/CARD_PATTERNS_RESEARCH_2026-06-25.md`** — cited modern-mobile card-pattern research (M3/Carbon/Polaris/NN-g/Apple HIG/EightShapes) behind the §6.7.0 card language, incl. the nested-horizontal-scroll safeguards.
- **Live flora catalogue:** `/FloraLabDemo` — the full 64-flower library + foliage + lifecycle, rendered.
- This master is **self-sufficient for building** without opening the appendices; the appendices add the cited "why" and the exhaustive lists.

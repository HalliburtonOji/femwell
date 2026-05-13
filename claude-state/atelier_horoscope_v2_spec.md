# Horoscope v2 — Atelier spec

Ms Atelier · 2026-05-13. **Celestial without kitsch.** Apple Weather meets a quiet observatory. Fraunces + Inter, rose `#D45E52`, Lucide. No emoji. UK English.

---

## 1. Theme palette

Page chrome inherits **Plum Night** (reader dark mode). **Twilight** is a dusk gradient used **only** by hero, onboarding, Ask The Sky shell.

| Token | Hex |
|---|---|
| `--sky-paper` | `#1F1622` |
| `--sky-ink` | `#F5E6D3` |
| `--sky-ink-mute` | `#B7A4A5` |
| `--sky-accent` | `#E89289` |
| `--sky-rule` | `rgba(245,230,211,0.10)` |
| `--twilight-zenith` | `#1A1320` |
| `--twilight-band` | `#3A2742` |
| `--twilight-horizon` | `#6B3F4A` |

Paper sections: `--paper #FFFAF5`, `--paper-2 #FFF5EC`, `--ink #4A2A3A`, `--ink-mute #8A7584`, `--rule rgba(74,42,58,0.10)`. Phase: period `#B84A41`, follicular `#E67F73`, ovulatory `#F2A99A`, luteal `#8A5F74`.

Banned: `#15101e`, `#FAF4EA` (wrong cream), `#2b1e16` (near-black masquerading as plum), purple `#C084FC`, 3-stop+ gradients outside Twilight.

---

## 2. Hero — three shapes, one pick

- **A. Quiet horizon.** Full-bleed Twilight. 1px hairline at 62% = "horizon". 56px SVG moon top-right (clip-path); 3 dot-stars top-left (seeded, no twinkle). One Fraunces sentence with name.
- **B. Single-line sky.** Flat `--sky-paper`, 64px SVG strip: moon at cycle-day + 3 dot-stars for next 3 transits.
- **C. Star-chart corner.** Cream paper, 120×120 hand-drawn natal-chart wheel top-right.

**Use A.** B is data-viz; C is museum print. Only A *feels celestial* without becoming a graphic.

**Spec:** full-bleed, `min-height 280 / 240 mobile`, `border-radius 0 0 24px 24px`, padding `56px clamp(20px,4vw,36px) 40px`. Eyebrow Inter 600 11px `0.16em` tracked uppercase `#B7A4A5` — `WEDNESDAY · 13 MAY`. Headline Fraunces 400 **28/32px**, line-height 1.25, `#F5E6D3`, max 22ch — *"A steady day, Oji. The moon is climbing."* Sub Inter 400 13px `#B7A4A5`, max 32ch. Moon: 56px SVG, 24px inset, `#F5E6D3` circle + clip-path, 1px `#F5E6D3 @18%` stroke. Horizon `<line>` 62%, `#F5E6D3 @12%`, 1px.

Delete: 4-pill row, kicker chain, lavender plumes, hard moon terminator.

---

## 3. Typography scale

Section heads Fraunces 400 **22px**, italic accent `#D45E52`. Below each: `· · ·` ornament (Inter 500 12px `--rule` `0.4em` tracked, 18px gap).

- Hero eyebrow Inter 600 11px / 0.16em `#B7A4A5`.
- Hero headline Fraunces 400 28/32px / 1.25.
- Hero sub Inter 400 13px.
- Sun / Moon / Rising sign label Fraunces 500 20px `#4A2A3A`.
- Triad caption Inter 500 12px / 0.04em. Body Inter 400 13.5px / 1.6, max 38ch.
- Weather title Fraunces 400 italic 17px. Body Inter 400 13px / 1.55.
- Cycle×Moon head Fraunces 400 20px. Body Inter 400 14px / 1.6.
- Transit title Fraunces 500 16px. Body Inter 400 13px.
- Chart annotation Inter 600 9px / 0.12em.
- Compat score Fraunces 300 56px `#D45E52`.
- Ask input Inter 400 14px. Answer Fraunces 400 italic 16px / 1.65.

No `clamp()` beyond §2. Fix at 768px breakpoint.

---

## 4. Triad cards

Three cards, `1fr` desktop, stacked <640px. **min-height 220 / 180 mobile**, padding `22px 20px 24px`, `border-radius 16px`, `background #FFFAF5`, `border 1px solid rgba(74,42,58,0.10)`, **no shadow**.

(1) 24px Lucide stroke 1.5 `#D45E52` — `Sun`, `Moon`, `Sunrise`. (2) Inter 600 10px `0.14em` uppercase `#8A7584`: `SUN · SELF` / `MOON · INNER LIFE` / `RISING · MASK`. (3) Fraunces 500 20px `#4A2A3A` — *Cancer · 22°*. (4) Inter 400 13.5px `#8A7584`, max 38ch, clamp 3 lines. (5) Locked: `opacity 0.78`, body becomes *"Birth time unlocks your moon. We need the minute, not the second."*, CTA text-link Inter 600 12px `#D45E52` + Lucide `Plus` 12px. **Delete dashed pill.**

**On tap:** expand inline, 200ms `cubic-bezier(0.32,0.72,0.24,1)`, reveals 80–120 word reading.

---

## 5. Today's weather

Three Power / Pressure / Trouble cards. Row desktop / scroll-snap mobile (280px width, 12px gap, peek of next).

Each: `background #FFF5EC`, `border 1px solid rgba(74,42,58,0.06)`, `border-radius 14px`, padding `18px 18px 20px`. **No coloured top border.** One 20px Lucide stroke 1.5 top-left, all in `#D45E52`. Kind by icon: Power → `Sparkles`, Pressure → `Wind`, Trouble → `CloudDrizzle`. Label Inter 600 10px `0.14em` uppercase `#8A7584` beside icon. Title Fraunces 400 italic 17px, margin-top 12px. Body Inter 400 13px / 1.55, max 4 lines.

Banned: gold `#B89E6A`, 3px coloured top borders.

**Copy template:** *"A steady follicular day under a waxing Moon — start the thing you've been thinking about, but don't expect to finish it."* Two sentences. Cycle adjective + lunar verb + one instruction.

---

## 6. Cycle × Moon — single composite dial

Two stacked progress bars forbidden. One SVG wheel **200px / 160px mobile**, beside prose.

- **Outer ring** (14px stroke): 29.5-day lunar. Conic gradient through four phase colours. Track `rgba(74,42,58,0.10)`. 6px `#F5E6D3` disc + 1.5px `#4A2A3A` ring marks today's moon.
- **Inner ring** (8px stroke, 36px inset): 28-day menstrual. Conic: 1–5 `#B84A41`, 6–13 `#E67F73`, 14–16 `#F2A99A`, 17–28 `#8A5F74`. 6px `#D45E52` disc marks body.
- **Centre:** Fraunces 400 24px `#D45E52` `D14` / Inter 600 9px tracked `#8A7584` `OVULATORY · WAXING GIBBOUS`.

Two discs close = alignment, visible without reading. Prose left: Fraunces 400 20px head, Inter 400 14px body, ~50 words.

**Delete:** lavender `linear-gradient(135deg, rgba(232,196,208,0.20), rgba(199,176,222,0.16))`, two crescent rings, stacked "Body"/"Sky" labels.

---

## 7. Transits — plain English first

Row card: `#FFFAF5`, 14px radius, 1px `--rule`, no shadow, padding `16px 18px`.

- **Icon** (28px col) Lucide stroke 1.5 `#D45E52`: Mercury→`MessageCircle`, Venus→`Heart`, Mars→`Flame`, Moon→`Moon`, Sun→`Sun`, Saturn→`Mountain`, Jupiter→`Compass`, Pluto→`Waves`.
- **When** Inter 600 10px tracked uppercase `#8A7584` — `FRI · 16 MAY` (UK).
- **Title** Fraunces 500 16px `#4A2A3A` — *"A heart-to-heart goes well on Friday."* (NOT "Venus trine Mars".)
- **Body** Inter 400 13px `#8A7584` / 1.55, 2 lines.
- **Nerd label** Inter 500 11px italic `#B7A4A5`, right-aligned desktop / behind Lucide `Info` mobile: *"Venus trine Mars · 14°"*. Tap reveals gloss.

Section head: *This week*, italic *week* `#D45E52`.

---

## 8. Compatibility — two-character letterpress

Head: *Where you meet*, italic *meet* `#D45E52`. Sub Inter 400 13px `#8A7584`: *"Two charts, one short reading. For a friend, a partner, a crush."*

Form: two inputs side-by-side / stacked mobile. Labels Inter 600 11px `0.04em`. Inputs `min-height 44px`, `border 1px solid rgba(74,42,58,0.12)`, `border-radius 12px`, padding `12px 14px`, `background #FFFFFF`. Run button: Inter 600 13px on `#D45E52`, cream text, pill, `box-shadow 0 1px 2px rgba(74,42,58,0.10)`, label `Read us`, no glyph.

**Result card:** `background #FFFAF5`, `border 1px solid rgba(74,42,58,0.10)`, `border-radius 18px`, padding `28px 26px 30px`, no shadow stack. **Two-glyph mark** top-left: two 28px circles overlapping 30%, left `#D45E52` right `#4A2A3A`, sign letters inside — this IS the card's brand. Right: Fraunces 300 56px `#D45E52` score, Inter 600 10px `SYNASTRY` above, Fraunces italic 16px label below (*"Easy weather, slow burn."*). Body Inter 400 14px `#8A7584` / 1.6, max 60ch, ~80 words. Four Talk/Touch/Trust/Grow bars: 4px tall, pill radius, track `rgba(74,42,58,0.08)`, fill **flat `#D45E52`** (delete rose→gold gradient). Score Fraunces 500 16px above, label Inter 600 10px tracked below.

History chips: active = 1px `#D45E52` outline, text `#4A2A3A`. Delete fill-plum active state.

---

## 9. Ask The Sky (rename from "Ask The Stars")

Plum Night card. One ruled line, not a chat.

Shell: `background #1F1622`, `border-radius 22px`, padding `32px 28px 28px`, margin-top 40px. **Delete nebula gradient.** Heading Fraunces 400 22px `#F5E6D3` — *Ask the sky*, italic *sky* `#E89289`. Helper Inter 400 13px `#B7A4A5`, max 50ch: *"One question. Grounded in your chart, not a fortune cookie."* No Jess reference.

Input single-line, Inter 400 14px `#F5E6D3`, `background rgba(245,230,211,0.06)`, **`border-bottom 1px solid rgba(245,230,211,0.18)` only** (notebook rule, no radius), padding `10px 0`, `min-height 44px`. Placeholder Fraunces italic 14px `rgba(245,230,211,0.40)`: *"Why do I keep replying too fast?"* Send text-only, right-aligned, Inter 600 12px `0.10em` uppercase `#E89289` — `ASK` + Lucide `ArrowUpRight` 12px. No pill.

Suggestion chips max 3, only when empty: Inter 400 12px `#B7A4A5`, no background, separated by `·`. Soften "Should I text him back today?" → *"Is there anyone I owe a reply to?"*

Answer on `border-top 1px solid rgba(245,230,211,0.10)`. Label Inter 600 10px tracked `THE SKY SAYS` (not `JESS SAYS`). Body Fraunces 400 italic 16px / 1.65 `#F5E6D3`, max 56ch. Recent asks max 5, Inter 400 11px `rgba(245,230,211,0.66)`.

Banned: rounded-pill input, cream `Ask ✦`, nebula gradient.

---

## 10. Empty / loading / error

**Loading page:** centred, padding `120px 24px`. Lucide `Moon` 28px stroke 1.5 `#8A7584`, 2.4s opacity pulse 0.30→0.80→0.30. Fraunces italic 16px `#8A7584` *"Reading the sky."* (period, not ellipsis).

**Loading section:** three static skeletons, `height 64px`, `background rgba(74,42,58,0.04)`, `border-radius 14px`. No shimmer.

**Empty — no chart:** Twilight gradient. Fraunces 400 28px `#F5E6D3` — *"Tell us the sky you were born under."* Body Inter 400 14px `#B7A4A5`, max 44ch: *"Your birth date is enough to start. Add the time and place and your moon, your rising — and the small print of your day — come into focus."* CTA `#E89289` fill, `#1F1622` text, **Fraunces 400 14px** (the one serif button in the product), pill, padding `12px 22px`: `Tell us when`. Replaces "Unlock my chart" (gamified).

**Empty — no reading today:** hero falls back to deterministic headline. Below, Inter 400 12px italic `#8A7584`: *"Your full reading is being written. It usually arrives by 6am."*

**Empty — no cycle data:** inner ring greys `rgba(74,42,58,0.10)`. Centre `—`. Prose: *"Log a period in Track and the sky will start speaking to your body."* Inter 600 12px text-link.

**Error (Ask):** Inter 400 12px `#FFC4BC` on `rgba(255,180,170,0.08)`, radius 10px, padding `8px 12px`: *"The line to the sky is quiet. Try again in a minute."*

**Error (Compat):** `#A0312A` on `rgba(160,49,42,0.08)`: *"We couldn't read this pairing. A different birthday might help — or try again later."*

---

## 11. Motion + ornament

**Use:** Lucide line icons stroke 1.5 (20–28px); hand-drawn SVG glyphs (single line, no fills) for dial / compatibility mark / moon; `· · ·` ornament under section heads; 200ms `cubic-bezier(0.32,0.72,0.24,1)` card expand; 280ms hero crossfade; Twilight vertical ≤3 stops only in hero / onboarding / Ask shell; `prefers-reduced-motion` → instant.

**Ban:** every Unicode astro/planet char (`☉ ☽ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇ ✦ ◐ ◔ ○ ◕`); any emoji codepoint; 3-stop+ gradients outside Twilight; the lavender `linear-gradient(135deg, rgba(232,196,208,0.20), rgba(199,176,222,0.16))`; rose→gold bar gradient; stacked box-shadows (`0 2px 4px + 0 12px 32px`); drop caps (reader-only); twinkle / parallax / particles; `pillGlowStyle` `box-shadow: 0 0 14px rgba(232,196,208,0.30)`.

---

## 12. Delete from current build

`src/components/lifestyle/horoscope/HoroscopeTab.jsx`:

- **944–953 `heroShellStyle`** — radial near-black → Twilight 2-stop vertical; strip dual shadow.
- **954–960 `heroOverlayStyle`** — delete radial plumes; SVG horizon + dot-stars (§2).
- **236–242, 253–257, 1026–1044 `heroPillsStyle` + `Pill`** — delete 4-pill row.
- **1039–1044 `pillGlowStyle`** — delete (banned glow).
- **213–219, 232, 977–983 `heroKickerStyle` + kicker derivation** — delete.
- **1012–1025 `moonDiscStyle` + `moonOverlayStyle`** — delete radial moon + hard terminator; clip-path SVG (§2).
- **987 `heroHeadStyle` clamp** — fix 28/32px via media query.
- **1112–1123 `triadUnlockBtnStyle`** — delete dashed pill → text-link (§4).
- **304, 308, 316 Triad Unicode glyphs + 185 `getZodiacGlyph` `✦` fallback** — Lucide `Sun`/`Moon`/`Sunrise`; `getZodiacGlyph` returns null.
- **388–392 `WEATHER_META`** — drop gold `#B89E6A` + plum-deep accents → all `#D45E52`; `✦ ◑ ◉` → Lucide refs.
- **1134 `weatherCardStyle.borderTop`** — delete 3px coloured rule.
- **1163–1174 `intersectShellStyle` lavender** — delete; `#FFFAF5` + `--rule` + composite dial (§6).
- **444–451, 1200–1217 `RingWrap` + `ringStyle`** — delete two-ring approach.
- **453–461 `cyclePhaseGlyph` Unicode** — delete.
- **502, 1230–1236 `transitGlyphStyle` Unicode** — delete; Lucide mapping (§7).
- **1327 `compatRunBtnStyle.boxShadow`** — soften `0 2px 8px rgba(212,94,82,0.30)` → `0 1px 2px rgba(74,42,58,0.10)`.
- **1420–1424 `dimFillStyle` rose→gold** — flat `#D45E52`.
- **665 `✦ Read us`** — plain `Read us`.
- **832 `Ask ✦`** — `ASK` text-link + `ArrowUpRight` (§9).
- **470, 811 `askEyebrowStyle` "Ask the *stars*"** — rename *Ask the sky*.
- **812–814 `askSubStyle` Jess copy** — rewrite (§9); no Jess.
- **854 `askAnswerLabelStyle` "Jess says"** — `THE SKY SAYS`.
- **1474–1485 `askInputStyle` rounded pill** — notebook-rule (§9).
- **1578–1594 `onboardingStyle` radial-purple + plumes** — Twilight + new copy (§10).
- **893 `onboardingBtnStyle` "Unlock my chart"** — `Tell us when`.
- **File-wide colour drift:** `var(--cream, #FAF4EA)` → `#FFFAF5`; `var(--plum-deep, #2b1e16)` → `#4A2A3A`. Single biggest off-brand pattern.

---

**Acceptance:** dusk gradient over one sentence with the user's name. Half-lit moon in the corner. Three cream cards explain the chart plainly. One dial — moon outside, body inside — answers *how does today feel?* without prose. Transits read like a weather forecast. Compatibility is a printed letterpress card. Ask The Sky is a single ruled line in a dark notebook. Nothing twinkles, sparkles, or apologises.

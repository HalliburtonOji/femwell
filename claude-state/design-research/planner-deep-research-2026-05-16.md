# Planner Deep Design Research — 8 Concepts from Unexpected Traditions

**Date:** 2026-05-16
**Brief from Halli:** Find visual references nobody else is pulling from. No competitor apps. No generic AI wellness UI. Eight named concepts, each with real sources, distinctive grammar, and a specific Femwell Cycle-tab spec buildable into an SVG mockup.

**How to read this:** Each concept is one tradition → one Femwell page. Hex values, font choices, and layout positions are decided here, not deferred to the build. Phase vocabulary is mapped explicitly because the tradition's *names for time* matter as much as the colors.

---

## 1. Tomoe Daily — from Hobonichi Techo

**Real references**
- **Hobonichi Techo Cousin (A5, 2003–present)** — printed on Tomoe River 52gsm paper, day-per-page with a 3.7mm dot grid, daily quote from Itoi Shigesato at the page footer, a thin red rule across the top, page number bottom-right.
- **Hobonichi Day-Free** — same dot grid, no preset day structure, weekly index spread.
- **Stalogy 365 Days** — 1mm grid, time-of-day column down the left margin (0–24), date in upper-left.

**Visual grammar that's distinctive**
Dotted grid is the entire page (no ruled lines). User-generated structure: arrows, tables, calendars all drawn on top of the same dot field. The page itself is *quiet* — almost no preset decoration except for ultra-fine red and black rules and the tiny daily quote. Tomoe River paper is cream (not white). Time anchors live in the margin, never the body. Marginal annotations are part of the design, not a defect.

**Concept: Tomoe Daily**

**Layout (phone screen, top → bottom):**
1. Top 28px: thin red horizontal rule (1px), date in tiny serif top-left ("Fri 15.05"), Hobonichi-style page index top-right ("Day 22 · 28")
2. Hero: 3.7mm dot grid background (small mauve dots on cream). User's day number rendered as a hand-drawn-looking large numeral "**22**" in the upper-left of the dot field, set in a single-stroke pen weight.
3. Phase column in left margin only (12% of width): vertical text reading "LUTEAL" rotated 90°, in tiny tracking-+0.4em sans
4. Hand-drawn-style "annotation" boxes overlaid on the dot grid: one for active rhythm ("Luteal Softness · 6"), one for next period ("Wed 20 · ±3d") — boxes are 1px stroke with hand-drawn slight wobble (SVG path with small jitter)
5. Footer: tiny daily quote in italic ("Soften where you can. — FW"), page number bottom-right

**Color system**
- Paper: `#FDF7E8` (Tomoe River cream)
- Dots: `#C8B89E` (warm beige, ~40% opacity)
- Red rule: `#B83C2A`
- Body ink: `#2A1F14`
- Phase ink (luteal here): `#7A5572`

**Typography**
- Date / page index: serif (Cardo or Source Serif), 11px, tracking +0.04em
- Day number "22": single-stroke pen-style sans (Inter weight 200 italic works as fallback), 96px
- Annotation labels: Inter Medium, 10.5px, tracking +0.2em UPPERCASE
- Body / annotation content: handwriting-leaning sans (Caveat or Patrick Hand), 13px
- Footer quote: serif italic, 11.5px

**Phase vocabulary mapping (the tradition's names)**
- Period → "**章一 · 月**" (Chapter 1 · Moon) — red rule + crimson dot field at top of grid
- Follicular → "**章二 · 朝**" (Chapter 2 · Morning) — sand
- Ovulation → "**章三 · 昼**" (Chapter 3 · Noon) — gold
- Luteal → "**章四 · 夕**" (Chapter 4 · Dusk) — dusty violet

---

## 2. The Field Notebook — from Naturalist Journals

**Real references**
- **Ernst Haeckel, *Kunstformen der Natur* (1899–1904)** — chromolithographic plates of radiolaria and jellyfish, scientific Latin labels in a thin engraved serif, symmetrical specimen arrangement, plate numbers in roman numerals.
- **Maria Sibylla Merian, *Metamorphosis Insectorum Surinamensium* (1705)** — engravings of butterflies on their host plants, hand-coloured, double-numbered (plate + figure), Latin/Dutch caption block at bottom.
- **Beatrix Potter's mycology notebooks (1890s)** — watercolour fungi specimens with pencil annotation, dated entries, gilt-edged sketchbook.

**Visual grammar that's distinctive**
Page is a *specimen plate*, not a diary. One subject centred and rendered with obsessive care, surrounded by margin annotations in tiny engraver's serif. Plate number in a corner. Bottom caption block in two languages or with formal Latin name. Hatching, not flat colour. Background is usually toned cream — never white.

**Concept: The Field Notebook**

**Layout (phone screen, top → bottom):**
1. Top: faint engraved-style border (1px stroke, 12px inset on all sides) — like a museum plate
2. Plate number top-right in roman: "PL. XXII" (= day 22)
3. Central specimen area (60% of viewport height): SVG illustration of the current phase as a *botanical specimen* — luteal = dried hellebore or amaranth in hatched pen-and-ink, ovulation = blooming peony, follicular = unfurling fern, period = pomegranate cross-section. Hand-drawn ink hatching, no flat fills.
4. Specimen label centred below: scientific name in italic serif ("*Phaseus luteus*"), common name in small caps ("LUTEAL · DAY XXII")
5. Margin annotations (right edge, tiny serif italic, like field notes): "4 cycles observed · 84% conf · next bloom Wed XX"
6. Bottom caption block: 2 columns, fine ruled line above, Latin on left ("Phaseus per dies viginti-duos"), modern reading on right ("Day 22 of 28 · luteal half")

**Color system**
- Paper: `#F0E9D6` (aged cream wove)
- Plate border: `#3A2F1E` (sepia ink)
- Ink (drawing + text): `#2A1F14`
- Phase tints (used very sparingly, hand-wash style):
  - Period (pomegranate): `#8B2A20`
  - Follicular (fern): `#5A6A38`
  - Ovulation (peony): `#D88AA0`
  - Luteal (hellebore): `#6A4A60`

**Typography**
- Plate number: Trajan or Cardo SemiBold small-caps, 12px, tracking +0.3em
- Scientific name: Cardo Italic, 18px
- Common name: Inter Medium small caps, 11px, tracking +0.2em
- Margin notes: Cardo Italic, 9.5px
- Caption columns: Cardo Regular, 11.5px

**Phase vocabulary mapping**
- Period → *Punica granatum* (pomegranate, halved)
- Follicular → *Pteridium emergens* (fern, unfurling)
- Ovulation → *Paeonia florens* (peony in bloom)
- Luteal → *Helleborus quietus* (hellebore, dormant)

---

## 3. The Rose Chart — from Florence Nightingale & BBT Sheets

**Real references**
- **Florence Nightingale, "Diagram of the Causes of Mortality in the Army in the East" (1858)** — polar area chart (coxcomb / rose diagram), wedges coloured blue/red/black for cause of death, month around the circle, magnitude shown by radial length, central rosette structure with hand-tinted ink wash. *This is the most relevant medical visualization in history to cycle tracking — she invented the coxcomb precisely because tabular data was being ignored.*
- **Pre-digital BBT (Basal Body Temperature) charting sheets, 1960s–1980s** — a 28-column grid with a ruled vertical axis from 36.0–37.4°C, daily dot plotted by hand, cervical mucus quality coded in a row beneath, sex/spotting/notes in stacked rows. Distinctive: the hand-drawn "coverline" once a temperature rise is detected.
- **1920s–1940s hospital observation charts (TPR — Temp/Pulse/Respiration)** — Florence Nightingale–era ruled chart paper, three coloured ink lines (red/blue/black) tracking different vitals, dotted grid behind the plot.

**Visual grammar that's distinctive**
The body is the rose. Sectors map time (day-of-cycle or day-of-month) and radial length maps an observed value. Colours are *clinical* — not decorative — and chosen so each variable is legible at a glance. Hand-tinted ink, not flat digital fills. Annotations and a key sit *outside* the chart in cramped print. The chart claims authority by looking like science.

**Concept: The Rose Chart**

**Layout (phone screen, top → bottom):**
1. Header (10% of viewport): "FEMWELL · CHART NO. 22" centre, "CASE: SELF · OBS 4 CYCLES" beneath in micro-print, ruled black line below
2. Coxcomb (50% of viewport, centred): 28 sectors of a circle (one per cycle day), each sector's radial length = an observation magnitude (mood, energy, or pain). Sectors coloured by phase. Today's sector outlined in heavy black (3px) with a tick mark at radius. Centre circle holds the day number "22" in a large blackletter or Didone numeral with "LUTEAL" beneath.
3. BBT-style strip below the coxcomb (12% of viewport): horizontal 28-column grid, ruled axis on the left "36.2 — 37.0", dots plotted across, the rise after day 14 visible — a hand-drawn coverline. This communicates "we have data" in a clinical idiom.
4. Key (right margin, small): phase colour swatches with magnitude annotations
5. Footer: clinician-style sign-off rule ("ATTENDING: F.W.NIGHTINGALE · 15 V 26")

**Color system** (pulled directly from Nightingale's original palette)
- Paper: `#F6EFD8` (chart paper, slightly foxed)
- Period (her "preventable deaths" blue → reinterpreted as crimson here): `#B23A2A`
- Follicular (her wedges were pale blue): `#A0BEB8`
- Ovulation: `#E0B848` (deep ochre)
- Luteal (her black "other causes" → here desaturated plum): `#5A3F58`
- Today outline: `#1A1410`
- BBT axis / rules: `#3A2F1E`

**Typography**
- Header: Didone (Bodoni Moda) Bold, 14px, tracking +0.2em UPPERCASE
- Day numeral centre: Bodoni Moda 88px
- Key labels: HK Grotesk Medium small caps, 9.5px
- Annotations: serif italic, 10px
- Sign-off line: italic copperplate / Adine Kirnberg fallback, 11px

**Phase vocabulary mapping (clinical idiom)**
- Period → "**HAEM · I.**"
- Follicular → "**PROLIF · II.**" (proliferative, the actual medical term)
- Ovulation → "**OVUL · III.**"
- Luteal → "**SECRET · IV.**" (secretory, medical term)

---

## 4. The Camera Report — from Film Production Sheets

**Real references**
- **ARRI ALEXA Camera Report sheets (1980s–present)** — 8–12 column grid (Take · Scene · Lens · Stop · Focus · Filter · Timecode · Notes), header block with Production / Roll / Camera / Date / DP, carbon-copy yellow paper, monospaced typewriter typeface, every cell pre-ruled.
- **Hollywood Production Daily Call Sheet (1970s)** — top header strip with day/weather/sunrise/call time, body grid of scene-by-scene cast and crew assignments, footer block of safety notes — *the cycle-as-shoot analogy is real: every day is a "scene" with conditions to plan for*.
- **Storyboard templates (Disney studio, 1940s)** — landscape A4 sheets with 3 panels per row, frame number, scene number, action notes, dialogue beneath.

**Visual grammar that's distinctive**
Total information density — every cell pre-ruled, every column labeled. Monospaced typewriter typeface (Courier, IBM Selectric). Carbon-copy yellow tint. Header block as a contract: this is who, this is when, these are the conditions. Body grid does the work; the design recedes. You feel *competent* reading it.

**Concept: The Camera Report**

**Layout (phone screen, top → bottom):**
1. Top header block (16% of viewport): 4-cell grid in 1px black rules:
   - Top-left: "PRODUCTION: FEMWELL"
   - Top-right: "ROLL 4 · TAKE 22"
   - Bottom-left: "PHASE: LUTEAL"
   - Bottom-right: "CONF 84% · 4 CYCLES OBS"
2. 28-day cycle table (60% of viewport): 7-column × 4-row table, each cell shows DAY NUMBER (top-left tiny) + a single-letter phase code (M/F/O/L) in a square swatch coloured by phase. Today's cell is *boxed* in 3px black + has a tiny "← TODAY" annotation in handwriting.
3. Bottom "scene notes" block (24% of viewport): two-column table:
   - Left col: numbered "scenes" (rituals) for today — `01. WARM GRAINS // 02. SLOW WALK // 03. SECOND TEA`
   - Right col: "PICKUP" (next period) — `WED 20 V 26 · WINDOW ±3D`
4. Sign-off line: "REPORT BY: F.WELL · DIT" / "DATE: 15 V 26"

**Color system**
- Paper: `#F8F0C8` (carbon copy yellow)
- Rules: `#1A1410`
- Ink (typewriter ribbon): `#2A1F14`
- Phase swatches (muted, like gaffer tape):
  - Period: `#B83C2A` (red gaff)
  - Follicular: `#D88E4A` (sand gaff)
  - Ovulation: `#E2C76C` (yellow gaff)
  - Luteal: `#7A5572` (plum gaff)
- Today marker: `#1A1410`

**Typography**
- Header labels: IBM Plex Mono Bold, 10px, UPPERCASE, tracking +0.18em
- Header values: IBM Plex Mono Medium, 13px
- Table headers: IBM Plex Mono Bold small caps, 9px
- Cell content: IBM Plex Mono Regular, 11px
- Day numerals: IBM Plex Mono Bold, 16px (in cell upper-left)
- Sign-off: cursive italic (Caveat), 13px — the one handwritten flourish on an otherwise mechanical page

**Phase vocabulary mapping (production idiom)**
- Period → "**SCENE I · INTERIOR · LOW LIGHT**"
- Follicular → "**SCENE II · EXTERIOR · GOLDEN HOUR**"
- Ovulation → "**SCENE III · EXTERIOR · MIDDAY**"
- Luteal → "**SCENE IV · INTERIOR · DUSK**"

---

## 5. The Flight Deck — from Cockpit Instrument Panels

**Real references**
- **Cessna 172 Six-Pack instrument layout** — six round analog gauges arranged 2×3: Airspeed / Attitude / Altimeter / Turn Coordinator / Heading / Vertical Speed. Each gauge has a thin chrome bezel, black face, white needles, coloured arc segments (green = safe operating range, yellow = caution, red = redline).
- **Boeing 747 EICAS / EFIS displays (1980s)** — CRT-style green/amber text on black background, monospaced sans, digital readouts grouped into engine cluster + nav cluster + warning cluster.
- **F-16 HUD (Head-Up Display)** — bright green vector graphics over the windscreen: airspeed left, altitude right, heading top centre, attitude reference cross, pitch ladder, all in a single hairline weight.

**Visual grammar that's distinctive**
Round gauges with coloured arcs that make ranges *physically visible*. Black face, white needle. Green = safe, yellow = caution, red = limit. Digital readouts are amber/green on black. Hairline-weight vector graphics, no fills. You don't read it — you *scan* it. The design is built for at-a-glance recognition under stress.

**Concept: The Flight Deck**

**Layout (phone screen, top → bottom):**
1. Black bezel header strip (8%): "FW · CYCLE 4 · OPS NORMAL" in amber CRT type, small artificial horizon icon
2. Six-pack of round gauges (60%), arranged 2×3 (gauge size ~140px each):
   - Top-left: **CYCLE DAY** gauge — circular dial 1–28, needle pointing to 22, green arc 1–14 (proliferative), yellow 13–16 (ovulation), red 24–28 (caution, period approaching)
   - Top-centre: **PHASE** — text gauge, large green "LUTEAL"
   - Top-right: **CONFIDENCE** — % gauge 0–100, needle at 84
   - Bottom-left: **NEXT PERIOD ETA** — countdown clock, "5 D"
   - Bottom-centre: **STREAK** — % gauge, 67
   - Bottom-right: **CYCLES OBSERVED** — digital counter, "04"
3. Bottom HUD-style readout strip (22%): single line of amber CRT text — `RHYTHM: LUTEAL SOFTNESS · 6/9 STEPS · NEXT BLOOM: 20 V 26 ±3D`
4. Tiny warning lamps at base (10%): four LED-style indicators with labels: PMS · SLEEP · HYDRA · MOOD — each green/yellow/red based on weekly average

**Color system**
- Background: `#0A0A0A` (instrument black)
- Bezel: `#3A3A3A` (chrome)
- Face: `#1A1A1A`
- Safe arc: `#3FB85A` (avionics green)
- Caution arc: `#E2B040` (avionics amber)
- Redline: `#D43A2A` (avionics red)
- Text (digital): `#7AE89F` (CRT green) or `#FFB840` (CRT amber)
- Needle: `#F8F8F8`
- Hairline weight: 1px throughout

**Typography**
- All text: monospaced (JetBrains Mono or Eurostile), 11–14px UPPERCASE
- Numerals on gauges: Eurostile or Bahnschrift Condensed (the "aerospace" feel), 24–32px
- Tracking +0.12em on labels, 0 on numerals

**Phase vocabulary mapping (aviation idiom)**
- Period → "**RWY 01 · LANDING**" (landing on the runway, ground time)
- Follicular → "**CLIMB · ALT +500**" (climbing to altitude)
- Ovulation → "**CRUISE · FL340**" (level flight, optimal altitude)
- Luteal → "**DESCENT · APP**" (approaching, slowing down)

---

## 6. Frida's Diary — from Personal Artist Notebooks

**Real references**
- **Frida Kahlo's diary, 1944–1954** — 170+ pages of watercolour, ink, and pencil. Mixed handwritten dates and prose. Bleeding pinks and crimsons, sudden blues. Drawings of broken bodies in dialogue with poetry. Spelling errors left in. The book itself is sun-faded leather with a wax-sealed clasp.
- **Marlene Dumas notebooks (1990s)** — watercolour portraits with pencil annotation, scribbled dates, paint bleeds across the gutter.
- **Virginia Woolf's notebooks (Berg Collection, NYPL)** — quill ink on cream paper, paragraph-long entries with marginalia, occasional pasted-in newspaper clippings.

**Visual grammar that's distinctive**
The page is the artist's body of thought. Watercolour washes that bleed past the lines. Handwriting that varies day to day. Drawings interrupt prose. Margins are dense with afterthoughts. There's no separation between mood and observation — they're the same record. Intimacy is the design.

**Concept: Frida's Diary**

**Layout (phone screen, top → bottom):**
1. Hand-torn paper feel at top edge (SVG path mimicking deckled paper)
2. Date scrawled top-left in cursive ink: "*viernes 15 mayo, día XXII*" (Spanish to honor the source, but adaptable to English)
3. Hero watercolour wash (35% of viewport): a soft, irregular wash of luteal colour (dusty violet → terracotta) painted as an SVG with multiple semi-transparent layers and a `feTurbulence` filter for texture. *Today's number "22"* is hand-painted into the wash in dark crimson ink with a flowing serif.
4. Handwritten phase note in the wash margin: "*la mitad luteal — hay tiempo de hablar conmigo*"
5. Calendar mini-grid (35%) painted as if dabbed with a brush — 28 days, each cell a small watercolour swatch in its phase colour, brush-stroke edges (not pixel-perfect rectangles), today's cell encircled twice in red ink
6. Bottom prose block (handwritten-style): "*Cuatro ciclos. Confianza ochenta-cuatro. La próxima sangre llega miércoles, quizá.*" Translate or duplicate in English as italic body text beneath
7. Tiny pencil signature bottom-right: "*— F.W.*"

**Color system**
- Paper: `#FAF0E2` (warm parchment)
- Period wash: `#A82A28` (Frida's crimson)
- Follicular wash: `#D86A4A` (her terracotta)
- Ovulation wash: `#E2A848` (golden ochre)
- Luteal wash: `#7A4060` (her bruised violet)
- Ink (handwriting): `#2A1A14`
- Pencil annotations: `#5A4A38`
- All washes use 0.3–0.6 opacity, layered

**Typography**
- Handwriting: Caveat or Homemade Apple, sized variably 14–22px (deliberately uneven)
- Painted numeral (today): Petit Formal Script or Mrs Saint Delafield, 78px
- Phase note: italic handwriting, 13px
- Optional translation body: Cardo Italic, 12px
- Pencil signature: Caveat, 11px

**Phase vocabulary mapping (intimate Spanish poetic idiom — could be English)**
- Period → "*la sangre*" / *the blood* — crimson, room-darkening
- Follicular → "*la fronda*" / *the new leaf* — terracotta, opening
- Ovulation → "*la luz*" / *the light* — gold, midday
- Luteal → "*la espera*" / *the wait* — violet, deepening

---

## 7. Mnemosyne — from Japanese Stationery Minimalism (gridded paper)

**Real references**
- **Maruman Mnemosyne N195A (2002–present)** — 5mm grid, black cover, monochrome only, perforated edges, designed for engineers, no ornament whatsoever.
- **KOKUYO Campus notebook (1975–present)** — softer 7mm rule, blue line at top for date, page number tiny in lower corner, every layout decision made to *get out of the way*.
- **Midori MD Notebook (2009–)** — cream paper, 7mm ruling, no logo on cover, deliberate empty space, single colored elastic band as the only decoration.

**Visual grammar that's distinctive**
The grid is the only design. Everything else is the user. Deliberate, *generous* white space. One single accent colour (usually red) used once per page if at all. Page number is microscopic. Logo on cover, never on the page. The aesthetic is "we trust you to do the thinking — we only provide structure." Tabs, perforations, and page corners are functional, never decorative.

**Concept: Mnemosyne**

**Layout (phone screen, top → bottom):**
1. Faint 5mm grid covering the entire viewport (1px lines at 6% opacity, in mauve)
2. Single red horizontal rule across the top (2px, `#B83C2A`), 16px from top edge — the *only* decorative element on the page
3. Date scrawled above the red rule, tiny: "*15 V '26*" — 9px monospace
4. Day number block: a 4×3 grid-cell tall numeral "22" sitting flush with the grid intersection at top-left of the working area, in a single weight, single colour. The grid lines pass *through* the numeral subtly.
5. Phase label: 1 grid cell below the day, in tracked-out micro-caps "LUTEAL · DAY 22 OF 28" — that's it. No tile, no chip, no swatch.
6. Calendar grid (mid viewport): 28-day grid drawn *on the 5mm grid itself*, with cells exactly 4 grid-squares wide and tall, filled phase-by-phase with a single hairline (1px) of the phase colour as the cell border, never a fill. Today's cell has a single red dot (3px) in its centre.
7. Rituals list (lower viewport): three lines of text, each starting with "·" — no checkboxes, no chips. Just text on the grid. Right-aligned timestamp ("20 min", "dusk", "4 min").
8. Page number bottom-right corner, microscopic: "*— xxii —*"

**Color system**
- Paper: `#F8F5EE` (cream, slightly warmer than white)
- Grid lines: `#A89880` at 0.18 opacity
- Body ink: `#1F1A12`
- Single accent: `#B83C2A` (red rule + today dot only)
- Phase borders (hairline only):
  - Period: `#B83C2A`
  - Follicular: `#C87A4A`
  - Ovulation: `#D8A848`
  - Luteal: `#7A5572`

**Typography**
- Date: monospaced Plex Mono Regular, 9px
- Day numeral: Inter Light, 80px
- Phase label: Inter Medium, 10.5px, tracking +0.3em UPPERCASE
- Rituals: Inter Regular, 13px
- Page number: Cardo Italic, 9px

**Phase vocabulary mapping (minimalist — almost no ornament)**
- Period → "01"
- Follicular → "02"
- Ovulation → "03"
- Luteal → "04"

(Numbers only. The user's body of work fills the rest.)

---

## 8. Book of Hours — from Medieval Liturgical Calendars

**Real references**
- **Très Riches Heures du Duc de Berry (1412–1416, Limbourg brothers)** — full-page illuminated calendar miniatures for each month, gold leaf, ultramarine blue, vermilion red, lapis lazuli. Two-column Gothic textura script. Each month's labour and astrological sign depicted. Red rubrics for feast days. Drop capitals in gold + blue.
- **Hours of Catherine of Cleves (c. 1440)** — borders alive with strawberries, snails, butterflies — illuminated marginalia. Calendar pages with KL (Kalends) monogram top-left.
- **Sarum Hours (English, 1480s)** — printed Book of Hours with red and black rubrication, simpler woodcut illuminations, dense calendar grid with saints' days listed.

**Visual grammar that's distinctive**
The calendar page is a *liturgical object*. Gold leaf and ultramarine signal sacred days. Red rubrics distinguish feasts from ferial days. Two-column Gothic script. Drop capital begins each section. Margins are alive with *grotteschi* — flora, fauna, small narrative scenes. The book is meant to be held close, read daily, opened to the right page by ribbon marker. Every page is precious.

**Concept: Book of Hours**

**Layout (phone screen, top → bottom):**
1. Top decorative band (10% of viewport): a strip of medieval *bas-de-page* style border — small repeating motifs in red and blue (could be sketched ovaries-as-strawberries, lunar phases, or floral). 1–2px hairline outlines, no fills.
2. KL monogram top-left (Kalends, the Roman calendar designation for the 1st of the month) in 38px illuminated Gothic blackletter, gold-leaf colour with a vermilion outline
3. Month/day rubric top-right: "*Idibus Maiis*" (Ides of May, the Roman dating system used in Books of Hours) in tiny red textura, with modern fallback "15 May" beneath in micro-print
4. Hero illuminated initial (15% of viewport): a 3-line drop capital "**L**" (for Luteal) in gold and ultramarine, with vine ornament curling from it — set in the upper-left of the day's text block. The "L" is filled with gold (`#D8A848`), outlined in `#3A1A60` ultramarine, with red dots around it.
5. Two-column body text (35%): Latin/English side-by-side (or column 1 phase poetry, column 2 modern reading), set in 11px Gothic textura (or Cardo as a fallback) on a 16px line-height. Red rubrics for the phase name ("**ad Lutealem**" in column 1, "**of Luteal**" in column 2).
6. Calendar miniature (24%): a small illuminated month-grid rendered like a manuscript — gold-leaf border around the 28-day grid, each phase coloured with manuscript pigments (vermilion / saffron / gold / ultramarine), today marked with a tiny pointing-hand glyph (☞) in red ink in the margin
7. Bottom border (8%): vine-and-strawberry motif mirroring the top, with a ribbon-marker SVG hanging down off the right edge (could be persistent UI — bookmark the day)

**Color system** (medieval manuscript palette — real pigments)
- Vellum: `#F2E6C8` (aged parchment)
- Body ink (carbon black): `#1A140A`
- Rubric red (vermilion): `#C2342C`
- Gold leaf: `#D8A848` with a darker outline `#9A7028`
- Ultramarine: `#2A3A8A` (lapis lazuli)
- Saffron yellow: `#E8B040`
- Verdigris green: `#5A7A5A`
- Phase mapping (using the four manuscript pigments):
  - Period → vermilion `#C2342C`
  - Follicular → saffron `#E8B040`
  - Ovulation → gold leaf `#D8A848` (the sacred phase)
  - Luteal → ultramarine `#2A3A8A` (the contemplative phase)

**Typography**
- Drop capital: UnifrakturMaguntia or Cloister Black, 64px
- Body text: Cardo or EB Garamond Regular, 11.5px, 1.45 line-height (Cardo has the rare Latin glyphs)
- Rubrics: EB Garamond SemiBold Italic in vermilion, 11.5px
- KL monogram: UnifrakturMaguntia Bold, 38px
- Roman date: small caps Cardo, 9.5px

**Phase vocabulary mapping (medieval Latin idiom, with English translation in column 2)**
- Period → "***Sanguinis***" / *the blood* — vermilion
- Follicular → "***Aurorae***" / *of dawn* — saffron
- Ovulation → "***Plenitudinis***" / *of fullness* — gold (the sacred phase, marked by a gold star)
- Luteal → "***Quietis***" / *of stillness* — ultramarine

---

# Summary table — pick the tradition, not the swatch

| # | Concept          | Tradition                  | Energy                   | Best for                                       |
|---|------------------|----------------------------|--------------------------|------------------------------------------------|
| 1 | Tomoe Daily      | Hobonichi Techo            | Quiet, dot-grid, intimate | Daily intention, journaling-leaning users      |
| 2 | Field Notebook   | Naturalist plates          | Scientific, illustrated  | Curious / educated audience, body-as-specimen  |
| 3 | Rose Chart       | Nightingale + BBT          | Clinical authority       | Data-driven users, doctor-readiness            |
| 4 | Camera Report    | Film production sheets     | Mechanical, competent    | Power users, tracking-heavy, list-making       |
| 5 | Flight Deck      | Cockpit instruments        | High-density, scannable  | At-a-glance morning check                      |
| 6 | Frida's Diary    | Artist personal diaries    | Intimate, painted, raw    | Mood-leaning, emotional users                  |
| 7 | Mnemosyne        | Japanese stationery        | Generous emptiness        | Minimalists, the "leave me alone" user         |
| 8 | Book of Hours    | Medieval liturgical        | Sacred, ornate, daily    | Ritual-leaning users; treats the cycle as holy |

---

# How to pick

**If Halli wants the cycle to feel sacred / treated with care:** Book of Hours (ornate) or Field Notebook (scientific reverence).

**If she wants it to feel like a tool, not jewellery:** Camera Report or Flight Deck.

**If she wants intimacy / emotional resonance:** Frida's Diary or Tomoe Daily.

**If she wants the design to disappear and let the user write the meaning:** Mnemosyne.

**If she wants clinical / doctor-grade authority:** Rose Chart.

---

**Next step:** Halli picks 1–3 favourites. Build SVG mockups (similar to the 15 in `/Ideas`) and add them as Round 4 to the same gallery page. Each spec above is dense enough to build directly into a phone-mockup tile without further research.

# FemWell — FULL DESIGN AUDIT (for the Base44 visual-unification prompt) — 2026-06-05

Audited current `origin/main` (HEAD `ab95ec8`) against the locked editorial standard. Audit only — no code changed.

## CURRENT EXPECTED STATE (what IS already live — to separate "stale preview" from "genuinely off-standard")
- **Fonts: DONE & live** (`386b8a8`). Every content element inherits Cormorant; titles use Ephesis via `.fw-display`. Census = 0 off-font across 23 routes. So **text renders Cormorant/Ephesis everywhere** — if Halli's Base44 *builder* preview shows Inter/Fraunces, that preview is a STALE bundle (the live site is correct on fonts).
- **Readability: DONE & live** — near-black ink `--plum #0B0805`, `--mauve #2E261B`, body weight 600, Cormorant `size-adjust:140%`.
- **Cream cards: mostly DONE** (session AB) — white→cream sweep across pages/components.
- **What the font/readability/card sweeps did NOT touch (the remaining work):** gradients, off-palette hex, colored pills/chips, emoji, page heroes, and **header TIER** (a header rendering plain Cormorant instead of `.fw-display` script is on-FONT but off-TIER). THIS is what Halli is reacting to.

## THE TWO THINGS HALLI SAW — both are the PLANNER (`PlannerV2Shell.jsx`), not Today (his "Today preview" = Planner, or a stale builder bundle). Both are GENUINELY on current main:
1. **"Resting well, {name}" greeting in plain bold serif** = `src/components/planner-v2/PlannerV2Shell.jsx` `Header` (greeting fn line ~660; markup line ~1037 `<h1 style={greetingText}>{greeting}, {profile.name}</h1>`; `greetingText` line ~5551 = `fontSize:22, fontWeight:700, color:C.espresso`). It is a PLAIN h1 (renders dark Cormorant 600 after the sweep) — NOT `.fw-display` Ephesis+carve. → needs `className="fw-display"`.
2. **Gold "ASTRA · {phase} INSIGHT" card** = `PlannerV2Shell.jsx` ASTRA content lines ~194–197 + the card style line ~5760 `background: linear-gradient(135deg, ${C.gold}33 0%, ${C.gold}11 100%)` (C.gold `#D4AF37`). → gold gradient must become cream `var(--surface)` + hairline.

---

## PER-PAGE AUDIT TABLE

### ✅ ON-STANDARD (leave as-is)
| Page | Notes |
|---|---|
| HealthDashboard, SkinHair | clean — var() tokens, no gradients/emoji |
| ProgramsHub, ProgramDay, ProgramDetail | clean (ProgramsHub phase-accent chips #C96B9E/#9B7FCC/#E8B84B/#4ABFA3 = minor, optional) |
| Upgrade, Track, LifeStageCare, CycleSettings, BookReader, Assistant | clean |
| Deals | clean except 1 hex `#FFF8EE` (Books cat) |
| WeeklyInsights | redirect only |
| Journal, DoctorExport | INTENTIONAL editorial (Editorial.jsx kit) — leave |

### 🔴 NEEDS WORK — per page, concrete off-standard elements

**Planner (`PlannerV2Shell.jsx`) — the flagship offender, self-contained ~6k-line file with its own `C` palette:**
- Greeting `<h1>` plain serif → `.fw-display` (item 1 above).
- ASTRA insight card gold gradient (line ~5760) → cream `var(--surface)` + `var(--border)` (item 2).
- Other shimmer gradients: lines ~1668/1674 `linear-gradient(90deg,#EDE6D5,#F4EDDB,#EDE6D5)`.
- Local `C` palette uses off-token espresso/gold (`C.espresso #3A2C1A`, `C.gold #D4AF37`) instead of `--plum/--mauve/--surface/--border`.
- Section titles use `C.espresso` plain — should be `.fw-heading` where they're section headers.

**Today (`Today.jsx` + components):**
- `PHASE_GRADIENTS` (lines 44–48, used by the phase banner ~552): `linear-gradient(135deg,#FFF0F0,#FFE4E4)` etc. (menstrual/follicular/ovulatory/luteal tints) → flat `var(--surface)` + accent dot.
- Hydration ring blue `#60B4FA` (lines 102/109/120) → on-palette (sage/plum).
- Today's-Insight amber `#FEF3C7`/`#D97706` (lines 184/187, 244) → on-palette.
- `RecommendedForYouSection.jsx`: 7 colored type-badge pills (#EEE6FF/#FFE6F2/#E6FFF8/#FFF8E6/#FFF0E8/#E8F0FF/#F0F0F8 + matching text) → editorial gold-tint/hairline chips.
- `DailyStoriesStrip.jsx`: 8 gradient story circles (lines 8–15) + off-palette dots #5B9BD5/#7B6FCC → cream/hairline + on-palette dots.
- `WeeklyInsightCard.jsx` stale-alert `#A6862B`/rgba(168,134,75) ; `ActiveProgramCard.jsx` reminder `#FFF8EE`/`#A07830` → on-palette.
- `DailyPhaseBrief.jsx` ovulatory `#B89E6A` (minor).
- NOTE: `TodayHeroSection` greeting is ALREADY `.fw-display` + cream cards (transformed session AD); its `HeroAmbient` gradient block is DEAD CODE (not rendered). Mood/energy "emojis" are literally "1"–"5" strings (not emoji).

**Lifestyle (`Lifestyle.jsx`) — Halli's flagged "red pills/magazine":**
- `PRIMARY = "#D45E52"`, `PRIMARY_LIGHT = "#FBE9E6"` (lines 26–27) drive the **red/pink tab pills** (active tab line ~700), active content chips (line ~415), filter badge (~485), save button (~121), takeaway box (~159), "read more" links (~171/282) → all → `var(--plum)` active / `var(--surface)`+hairline inactive, `var(--rose-dust)` accents.
- `CAT_GRADIENTS` (lines 186–204) = category image FALLBACK only (acceptable, but Halli may want flat cream).
- `ArticleSheet` h2 (line ~140) not `.fw-heading`.

**Lifestyle child cards / Explore:**
- `explore/ExploreContentCard.jsx` AUDIO_BG gradients (lines 6–8) #E8DFF7/#D6C9F0/#D4EDE8/#C2E0DA + fallback gradient (line 29) → cream/hairline.
- `Explore.jsx` h1 "Explore" uses `text-xl font-bold` (line ~386) NOT `.fw-display`.
- `LifestyleDetail.jsx`: bookmark icon `#A07830` (~460); h1/h2 (562/625/685) verify `.fw-display`/`.fw-heading`.

**Nutrition (`Nutrition.jsx` + components):** macro/insight cards use ~15 off-palette hex — `#3B5FC4`(blue), `#7C3AED`(purple), `#A07830`(amber), `#A05A2C`(brown), `#EDFAF1`/`#F0FAF5`/`#2D9463`(greens) across `AIRecipeGenerator.jsx`, `NutritionTodayTab.jsx`, `RecipeGeneratorTab.jsx` → map to `--sage/--rose-dust/--gold/--mauve` tints.

**Health (`Health.jsx`):** page-root paint `#E8DBC8` (line ~1201, hides PAPER_BG) + inset shadow; gradient overlays lines ~1388–1397 & ~1418 (repeating-linear + radial); dingbat icons in `LETTERS` (◎◯◉⟳✿❧⊕, lines 30–36) + "✓" (lines 244/1535) → Lucide; off-palette `#E8DBC8`/`#F0E6CE`/`#FEFAF2`. (The gold botanical SVG motif is intentional editorial — confirm with Halli.)

**Pulse + Trends:** chart **series** colors are full Tailwind palette — `#f43f5e/#fb923c/#a78bfa/#34d399/#f472b6/#6ee7b7/#93c5fd/#c084fc/#ef4444` (Pulse lines 21–36; Trends 15/26–41) → map to `--rose-dust/--sage/--gold/--blush/--mauve`. **Tag: chart-series** (decide if Base44 re-colors charts or we leave data-viz).

**Insights (`Insights.jsx`):** slate fallbacks `#64748B` (var --slate-500 fallback), `rgba(15,23,42,…)` modal scrim/shadow (lines 40/56/81) → plum-based.

**Profile (`Profile.jsx`):** hero card gradient line ~281 `linear-gradient(135deg,var(--plum),var(--plum-light))`; stage card gradient line ~443 `linear-gradient(180deg,rgba(168,134,75,.1),rgba(244,237,219,.6))` → solid cream/plum + hairline.

**Settings (`Settings.jsx`):** rose/crimson `#E11D48` accent (lines 55/68/104/548/554/618/631) — flagged per spec; decide keep-as-brand-accent vs `--plum`/`--rose-dust`.

**PartnerSync (`PartnerSync.jsx`):** entire local 10-color palette (lines 27–38) NOT using tokens; page root `#F4EDDB` not `var(--ivory)`; cards `#EDE6D5`/`#D4C9B4` → migrate to tokens.

**ContentPlayer (`ContentPlayer.jsx`):** PHASE_ACCENTS off-palette (#C96B9E/#9B7FCC/#E8B84B/#4ABFA3, lines 5–10); video bg `#1a0a1a`.

**Events (`Events.jsx`):** WhatsApp-green share button `#25D366` (line ~138) → on-palette (or keep as recognized brand-action — Halli's call).

**Saved (`Saved.jsx`):** emoji "📚" in empty-state copy (line ~106) → Lucide or remove.

**FictionReader:** CSS-var fallbacks `#FAF4EA` (defensive; low priority).

**Search (`Search.jsx`):** local palette (gold/blush/sage literals) — cohesive but not tokens; low priority.

### App-level overlays/sheets
- `MorningBriefSheet.jsx` (App.jsx, once/day over any page): own palette (lines 26–37) + mood tints `#D45E52/#C17B4E/#6B8F5A`; greeting already `.fw-display` (session AF). → migrate palette to tokens.
- `CalmCards.jsx` (panic/calm overlay): gradient backdrop `linear-gradient(160deg,#FAF5FF,#FFF0FA)` (line ~420) + opaque bg `#FAF5FF` + heavy emoji UI (5-senses 👀🤲👂👃👅, 🫁💜🌿 etc.) → DESIGN-SENSITIVE (Lucide lacks nose/tongue); needs Atelier.
- `PanicModeModal.jsx`: alert `#FFF8EE/#F5DFA8/#7A5A20` + a few emoji in copy.
- `StoryViewer.jsx` (full-screen story overlay): 8 dark theme gradients + dark scrim — full-bleed media context; likely acceptable, confirm.

## CROSS-CUTTING RULES FOR THE BASE44 PROMPT (apply globally)
1. Replace EVERY `linear-gradient`/`radial-gradient` on cards/heroes/pills/banners with flat `var(--surface)` (#F4EFE3) + 1px `var(--border)` (#D8CFBC). (Exceptions: full-bleed media scrims, intentional Health botanical motif — confirm.)
2. Replace EVERY off-palette hex with tokens: ink `var(--plum)` #0B0805 · secondary `var(--mauve)` #2E261B · surface `var(--surface)` #F4EFE3 · border `var(--border)` #D8CFBC · accents `var(--rose-dust)`/`var(--sage)`/`var(--gold)` only. Kill Tailwind-palette + generic blue/teal/purple/amber + #D45E52/#E11D48/#25D366/#60B4FA.
3. Pills/chips/tabs: active = `var(--plum)` fill + cream text; inactive = transparent + 1px `var(--border)` + `var(--mauve)`. Uppercase letter-spaced label. No bright fills.
4. Page hero titles → `.fw-display` (Ephesis script); section headings → `.fw-heading` (Cormorant swash-italic). No plain-serif h1 greetings (Planner greeting is the prime example).
5. Icons = Lucide only; ZERO emoji (special-case CalmCards 5-senses for Atelier).
6. Never paint an opaque/gradient page-root bg that hides the global cream PAPER_BG (Health #E8DBC8 is the offender).
7. Local per-component palettes (Planner C, PartnerSync, MorningBriefSheet, Search) → migrate to the global CSS tokens.

## PRIORITY ORDER (highest visual impact first)
1. **Planner** (PlannerV2Shell) — greeting→fw-display, ASTRA gold→cream, C-palette→tokens, shimmer gradients. (What Halli saw.)
2. **Lifestyle** — kill #D45E52/#FBE9E6 red pills → editorial chips.
3. **Today** — PHASE_GRADIENTS banner, RecommendedForYou pills, DailyStoriesStrip gradients, hydration blue.
4. **Nutrition** macro cards, **Health** page-bg+gradients+dingbats, **Profile** card gradients.
5. **Pulse/Trends** chart series (decide), **ContentPlayer/PartnerSync** palettes, **Events** green, **Saved** emoji, **Insights** slate.

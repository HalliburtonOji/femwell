# Horoscope v2 (H2) — MP Spec

**Codename:** H2 · **Sequenced as:** H2a → H2b → H2c → H2d · **Total commits:** ~12-15 · **Author:** Mr Lead Manager · **Date:** 2026-05-13

---

## 1. Goal one-liner

Lift the Horoscope tab from a 1,630-line god component with fabricated transits and emoji moons into a four-stream women's wellness astrology surface — Plum Night theme, real ephemeris-grade transits, named UK astrologer voice, Goddess Bench + Annual Profections + Red/White Moon + Sky Diary + Quiet Mode — *while preserving every section currently in the v2.1 demo*.

---

## 2. Why now

- Today's horoscope **fabricates astronomy** (prompt explicitly tells GPT-4o-mini to "write literary transits with valid future dates"). Any astrologically literate user catches it. £1M-sale-killer.
- The current code ships **emoji codepoints** (🌑–🌘) in `src/utils/astrology.js:115-125` *and* `generateHoroscopeReading/entry.ts:67-75`. Violates "no emoji in FemWell — ever".
- **One 1,630-line file** with seven inner components blocks any visual refresh. Split is a prerequisite.
- The category has consolidated around four moats — ritual (CHANI), behavioural framing (Pattern), human-in-the-loop (Sanctuary), cycle (Stardust) — and **FemWell is the only product positioned to own all four at once** (research v1, §1). v2.1 cashes that in.
- Asteroid astrology + Annual Profections + Red/White Moon + Cycle×Sky Diary are **category originals nobody ships** (research v2, §2 and §9). Cheap to build, defensible at sale diligence.
- v2.1 demo is locked and signed off. Operator wants additive build only; nothing currently in the demo is to be cut.

---

## 3. Scope

### H2a — Foundation: split god-component + P0 fixes + brand sweep
- Split `HoroscopeTab.jsx` (1,630 lines) into a shell + section files + hooks.
- Replace moon-phase emoji codepoints with a Lucide-based `<MoonPhaseGlyph>` SVG component in `src/lib/astrology/moonPhase.js`.
- Fix the race condition: when `birth_time` is added after first reading, force a partial-update path that re-estimates moon/rising/mercury and patches today's row.
- Fix UK locale in `prettyBirthday` (`"14 Jun 1999"`, not `"Jun 14, 1999"`).
- Pre-seed `BirthDataSheet` date from `userProfile.birthday` (currently inaccurate comment, dead code).
- Persist `askStars` answer even when `AdviceThreads.create` fails (log to `IngestErrorLog`).
- Strip Unicode astro/planet chars (`☉ ☽ ☿ ♀ ♂ ♃ ♄ ✦ ◐ ◔ ○ ◕`) from JSX; replace with Lucide line icons everywhere.
- Rename `"Ask The Stars"` → `"Ask The Sky"` (label only; entity topic stays `"horoscope"`).
- Rename onboarding CTA `"Unlock my chart"` → `"Tell us when"` (Atelier copy).
- Apply Plum Night + Twilight palette tokens to the shell + hero only (the rest of the cards come in H2b).

**Files added:** `src/components/horoscope/HoroscopeTab.jsx` (shell), `src/components/horoscope/sections/*` (placeholder splits matching the current behaviour), `src/components/horoscope/hooks/useBirthChart.js`, `src/lib/astrology/moonPhase.js`, `src/lib/astrology/glyphs.js` (Lucide map).

**Files modified:** `src/utils/astrology.js` (remove emoji glyphs, UK date), `src/components/lifestyle/horoscope/HoroscopeTab.jsx` (replaced — re-export shim), `src/components/lifestyle/horoscope/BirthDataSheet.jsx` (seed + button label), `base44/functions/generateHoroscopeReading/entry.ts` (emoji purge + force-regen patch), `base44/functions/askStars/entry.ts` (persist on fail).

**Entities:** none.

**Behaviour added:** none (this is a refactor + bug pass — visual parity with current live).

### H2b — Hero, Triad, Today's Weather, Cycle×Moon dial, Goddess Bench

- New Twilight hero (one Fraunces sentence with name + climbing-moon verb italic + three meta chips).
- Lucide-icon Triad (Sun · Moon · Rising) replacing the dashed-pill lock CTA; tap-to-expand 80-120 word reading.
- Today's Weather signed by **Astra** (named persona) — `Power / Pressure / Trouble` keep their data shape; only the eyebrow and Astra-signed micro-sentence are new.
- Composite `<CycleMoonDial>` SVG (outer 29.5d lunar ring, inner 28d cycle ring, two discs mark today, centre `Today / TUE 13 MAY`, legend right).
- New **Goddess Bench** section (asteroid astrology: Ceres / Pallas / Juno / Vesta / Chiron / Lilith). 6 orbs in a grid + dashed-rule italic read connecting two asteroids.

**Files added:** `src/components/horoscope/sections/TwilightHero.jsx`, `sections/TriadCards.jsx`, `sections/TodaysWeather.jsx`, `sections/CycleMoonDial.jsx`, `sections/GoddessBench.jsx`, `src/lib/astrology/asteroids.js` (deterministic Ceres-tropical estimator + archetype copy table), `src/components/horoscope/hooks/useAsteroids.js`.

**Files modified:** `base44/functions/generateHoroscopeReading/entry.ts` (add `asteroid_signs` JSON to prompt + persist on `AstroProfile`).

**Entities:** `AstroProfile` extended — `+asteroid_signs` (object: `{ceres, pallas, juno, vesta, chiron, lilith}`), `+astra_signoff` (string on `HoroscopeReading` — short 1-line attribution), `+goddess_read` (string on `HoroscopeReading` — the italic 1-2 sentence asteroid-tension micro-read).

**Behaviour added:** Goddess Bench is *wired* — each orb deep-links to a per-asteroid expandable card that pulls from a static archetype copy table + the user's sign. Reading row's `goddess_read` is generated alongside the daily reading.

### H2c — Sky Diary, Red/White Moon, Annual Profections, Compatibility upgrade, Ask The Sky, Quiet Mode, footers

- **Sky Diary** — 12-cycle horizontal timeline with transit dots overlaid (Saturn = teal, Jupiter = gold, Moon = accent). "Right now" card.
- **Red Moon / White Moon classifier** — auto-detect from `CycleEvents` last 6 cycles vs moon phase at bleed start.
- **Annual Profections** card — Hellenistic time-lord by age, 5th-house-style copy, unlocks/refreshes on user's birthday.
- **Compatibility** upgrade — already-stored Talk/Touch/Trust/Grow surfaced as 4 stat tiles + two-circle monogram mark; rename `Grow → Time` to match demo *or* keep `Grow` and surface as "Grow" — see §9 contradiction note.
- **Ask The Sky** — renamed UI (entity stays `topic: 'horoscope'`); notebook-rule input; chart-aware placeholder; chips re-worded (queer-safe).
- **Quiet Mode** toggle (lives in `UserPreferences`) — suppresses shadow-language in *all* horoscope LLM calls (passed as `quiet_mode: true` in prompt + UI strips the same words from cached rows on render).
- **Science footer** ("Why we trust the moon") with Helfrich-Förster 2021 + Cajochen 2013 citations.
- **Privacy line** at the foot of every Horoscope render.

**Files added:** `sections/SkyDiary.jsx`, `sections/RedWhiteMoon.jsx`, `sections/AnnualProfections.jsx`, `sections/Compatibility.jsx` (re-styled from existing logic), `sections/AskTheSky.jsx`, `sections/QuietModeToggle.jsx`, `sections/ScienceFooter.jsx`, `sections/PrivacyLine.jsx`, `src/lib/astrology/profections.js`, `src/lib/astrology/redWhite.js`, `src/components/horoscope/hooks/useProfections.js`, `src/components/horoscope/hooks/useRedWhiteMoon.js`, `src/components/horoscope/hooks/useSkyDiary.js`.

**Files modified:** `base44/entities/UserPreferences.jsonc` (+`horoscope_quiet_mode` boolean), `base44/functions/generateHoroscopeReading/entry.ts` (read Quiet Mode and adjust system prompt), `base44/functions/askStars/entry.ts` (same), `base44/functions/generateCompatibility/entry.ts` (same).

**Entities:** `UserPreferences` extended (Quiet Mode). New `HoroscopePersistedClassification` (one row per user, stores `red_white_archetype` + `confidence` + `last_computed_at` — recomputed monthly via a tiny new cron in `pipelineOrchestrator`).

**Behaviour added:** Quiet Mode is *truly wired* — affects three LLM endpoints. Red/White Moon is *truly wired* — computed once a month from `CycleEvents`. Sky Diary reads existing `CycleEvents` + `HoroscopeReading.transits_json` history.

### H2d — Paid surfaces: Atelier Reading + £19 PDF + £29 chart + £55 Choose The Day

- **Atelier Reading card** — locked variant on free, unlocked on `Entitlements.plan in ('plus','pro','premium')`. Long-form monthly letter, signed Astra Cole, MA, FAS.
- **One-shot shelf** — 3 cards: £19 Year Ahead PDF · £29 Birth Chart Atelier · £55 Choose The Day (electional service).
- New monthly LLM job to draft the Atelier letter (drafted by AI, marked `draft=true`, surfaces a "Awaiting Astra's sign-off" banner until an operator publishes it).
- Stripe checkout extension: new `STRIPE_YEAR_AHEAD_PRICE_ID`, `STRIPE_CHART_ATELIER_PRICE_ID`, `STRIPE_CHOOSE_THE_DAY_PRICE_ID` env vars; `stripeCheckout` accepts `{mode: 'one_shot', product: 'year_ahead'|'chart_atelier'|'choose_the_day'}` and creates a one-time `mode: 'payment'` checkout. **No real Stripe keys required to ship the UI** — uses a `simulated=true` payload that creates an `OneShotPurchase` row with `status: 'pending_payment'` until live keys are added.
- `stripeWebhook` handles the three new price IDs and writes `OneShotPurchase.status = 'paid'`.

**Files added:** `sections/AtelierReading.jsx`, `sections/PaidShelf.jsx`, `src/components/horoscope/hooks/useEntitlements.js`, `base44/functions/draftAtelierLetter/entry.ts`, `base44/functions/createOneShotCheckout/entry.ts`.

**Files modified:** `base44/functions/stripeCheckout/entry.ts` (extend with one-shot mode), `base44/functions/stripeWebhook/entry.ts` (extend with one-shot products), `base44/functions/pipelineOrchestrator/entry.ts` (add monthly phase `draftAtelierLetters` gated by `wantsPhase`).

**Entities:** `AtelierLetters` (new — monthly long-form letter row, draft → published), `OneShotPurchases` (new — Stripe one-time purchases for the three product SKUs).

**Behaviour added:** Atelier Reading paywall + draft pipeline. Three product cards with simulated checkout (real Stripe keys plug in later). No fake/decorative paywall — the locked state explains exactly what the user gets and quotes the renewal terms.

---

## 4. Non-goals (deferred, explicit)

These are knowingly out of H2 scope so the build doesn't drift:

- **Push notifications for transits** (no app-wide notif infrastructure ready).
- **Multi-system parity** — no Vedic chart calculator, no Chinese BaZi, no Mayan Tzolk'in (cultural-sensitivity risk if shipped without contracted practitioner authorship).
- **Native iOS / Android voice astrologer.**
- **Astrocartography** map view.
- **Solar Return Letter** on actual birthday (deferred to H3).
- **Sky-aware Smart Save** on Lifestyle / Journal (deferred — depends on Lifestyle pipeline phase work).
- **Bonds prose-only synastry** beyond the 4-dim score (we keep the score because the demo keeps it; deeper prose-only "Bond Letter" is H3 paid one-shot).
- **Live human chat** (Sanctuary model — too operationally heavy for £1M sale, per research v2 §6).
- **Real Swiss Ephemeris C bindings.** AGPL trap (research v2 §1). We use the Skyfield-equivalent JS stack instead — see §10 risk register.
- **Real Stripe Price IDs for the three one-shots** — UI ships with simulated checkout; operator wires real IDs in a follow-up.

---

## 5. File-level diff plan

### NEW files

| Path | Lines (est.) | Purpose |
|---|---:|---|
| `src/components/horoscope/HoroscopeTab.jsx` | ~150 | Shell — loads chart + reading + cycle + entitlements, renders sections in order. |
| `src/components/horoscope/sections/TwilightHero.jsx` | ~120 | §1 demo — Twilight gradient + 7 dot-stars + one Fraunces sentence + 3 chips. |
| `src/components/horoscope/sections/TriadCards.jsx` | ~140 | §2 demo — Sun/Moon/Rising with Lucide icons; tap-to-expand. |
| `src/components/horoscope/sections/GoddessBench.jsx` | ~160 | §2.5 demo — asteroid grid + italic read. |
| `src/components/horoscope/sections/TodaysWeather.jsx` | ~110 | §3 demo — Astra-signed weather line + 3 stats row. |
| `src/components/horoscope/sections/CycleMoonDial.jsx` | ~200 | §4 demo — composite SVG dial + legend. |
| `src/components/horoscope/sections/SkyDiary.jsx` | ~190 | §5 demo — 12-cycle timeline + Right Now card. |
| `src/components/horoscope/sections/RedWhiteMoon.jsx` | ~130 | §6 demo — classifier card. |
| `src/components/horoscope/sections/AnnualProfections.jsx` | ~130 | §6.5 demo — time-lord card. |
| `src/components/horoscope/sections/AtelierReading.jsx` | ~170 | §7 demo — paid hero with Astra signoff. |
| `src/components/horoscope/sections/PaidShelf.jsx` | ~170 | §7.5 demo — three one-shot cards. |
| `src/components/horoscope/sections/Compatibility.jsx` | ~260 | §8 demo — restyled from existing logic; surfaces 4 dims. |
| `src/components/horoscope/sections/AskTheSky.jsx` | ~190 | §9 demo — renamed + notebook-rule input + chart-aware chips. |
| `src/components/horoscope/sections/QuietModeToggle.jsx` | ~80 | §10 demo — single row with toggle wired to UserPreferences. |
| `src/components/horoscope/sections/ScienceFooter.jsx` | ~70 | §11 demo — dashed accordion with two citations. |
| `src/components/horoscope/sections/PrivacyLine.jsx` | ~30 | §12 demo — two-line privacy footer. |
| `src/components/horoscope/hooks/useBirthChart.js` | ~70 | Loads AstroProfile + ensures reading + exposes chart facts. |
| `src/components/horoscope/hooks/useTransits.js` | ~80 | Pulls last-N HoroscopeReading.transits_json windows for SkyDiary. |
| `src/components/horoscope/hooks/useProfections.js` | ~50 | Computes annual profection client-side. |
| `src/components/horoscope/hooks/useRedWhiteMoon.js` | ~60 | Reads HoroscopePersistedClassification + falls back to live compute. |
| `src/components/horoscope/hooks/useEntitlements.js` | ~40 | Reads Entitlements row, returns `{plan, hasAtelier}`. |
| `src/components/horoscope/hooks/useAsteroids.js` | ~50 | Reads AstroProfile.asteroid_signs, fallback to client-side estimate. |
| `src/lib/astrology/moonPhase.js` | ~90 | Deterministic moon-phase math + `<MoonPhaseGlyph>` SVG component — **NO EMOJI**. |
| `src/lib/astrology/glyphs.js` | ~40 | Lucide icon map: planet/sign → Lucide component (Sun, Moon, Sunrise, Heart, Wind, Flame, Mountain, Compass, Waves, etc). |
| `src/lib/astrology/asteroids.js` | ~150 | Deterministic Ceres-period orbital approximations (sufficient for daily horoscope) + archetype copy table (Demetra George / AstroStyle citations). |
| `src/lib/astrology/profections.js` | ~60 | Hellenistic profections — house number from `(age % 12) + 1`; ruler + lit-house copy table. |
| `src/lib/astrology/redWhite.js` | ~80 | Given last 6 `CycleEvents` (period_start) and moon phase at each, classify Red/White/Pink/Purple/Mixed (Luna Sanctum framing). |
| `base44/entities/AsteroidProfile.jsonc` | n/a | (Folded into `AstroProfile.asteroid_signs` — no new entity.) |
| `base44/entities/HoroscopePersistedClassification.jsonc` | ~30 | Red/White Moon archetype cache per user. |
| `base44/entities/AtelierLetters.jsonc` | ~40 | Monthly long-form letter rows, draft → published. |
| `base44/entities/OneShotPurchases.jsonc` | ~40 | Stripe one-time purchases — three product SKUs. |
| `base44/functions/draftAtelierLetter/entry.ts` | ~150 | Monthly cron-driven LLM draft of the Atelier letter (`draft=true` until manually published). |
| `base44/functions/createOneShotCheckout/entry.ts` | ~80 | Wraps `stripeCheckout` for `mode: 'payment'` one-shots; falls back to `simulated=true` when keys missing. |
| `base44/functions/computeRedWhiteMoon/entry.ts` | ~120 | Monthly cron — reads last 6 CycleEvents + moon phases, writes `HoroscopePersistedClassification`. |
| `src/components/horoscope/styles/tokens.js` | ~60 | Shared style tokens (Plum Night + Twilight) — single source of truth. |
| `src/components/horoscope/MoonPhaseGlyph.jsx` | ~80 | SVG-based moon-phase component (lit-area circle clipped by phase). Replaces every 🌑–🌘 codepoint. |

### EDIT files

| Path | Action | What changes | Δ lines |
|---|---|---|---|
| `src/components/lifestyle/horoscope/HoroscopeTab.jsx` | EDIT (shrink to shim) | Replace 1,630-line file with a 3-line re-export from new path so any external imports keep working: `export { default } from "@/components/horoscope/HoroscopeTab";` | −1,627 |
| `src/components/lifestyle/horoscope/BirthDataSheet.jsx` | EDIT | Move into `src/components/horoscope/BirthDataSheet.jsx`. Pre-seed date from `userProfile?.birthday`. CTA label `"Tell us when"`. Place input enriches via simple title-case on save. | net ±0 |
| `src/utils/astrology.js` | EDIT | (a) Delete `🌑🌒🌓🌔🌕🌖🌗🌘` from `PHASE_BUCKETS`; replace `glyph` field with `key: "new"|"waxing_crescent"|...`. (b) `getZodiacGlyph` returns `null` not `"✦"`. (c) `prettyBirthday` → `"14 Jun 1999"`. (d) Add `getSignFromDegrees(deg)` for asteroid use. | ±30 |
| `base44/functions/generateHoroscopeReading/entry.ts` | EDIT | (a) Strip emoji from `buckets`; use `key` field; LLM prompt no longer emits unicode planet glyphs in `transits_json`. (b) Force-regen when birth_time present + moon_sign missing (don't short-circuit). (c) Read `UserPreferences.horoscope_quiet_mode` and adjust system prompt. (d) Add `goddess_read` + `astra_signoff` JSON keys. (e) Read `asteroid_signs` if cached on AstroProfile, else compute via `libephemeris-equivalent` or scaffolded approximation — see §10. | +90 |
| `base44/functions/askStars/entry.ts` | EDIT | (a) Persist answer even when AdviceThreads.create fails (log to IngestErrorLog). (b) Read Quiet Mode. (c) Rename system prompt persona to "Astra" (we keep `topic: 'horoscope'` entity value to preserve old data). | +40 |
| `base44/functions/generateCompatibility/entry.ts` | EDIT | (a) Read Quiet Mode. (b) Add `their_birth_time` to cache key (forward-compat). (c) Allow moon/rising context if user has them. | +30 |
| `base44/functions/pipelineOrchestrator/entry.ts` | EDIT | (a) Add monthly phase `computeRedWhiteMoon` (gated by `wantsPhase`). (b) Add monthly phase `draftAtelierLetters`. | +60 |
| `base44/functions/stripeCheckout/entry.ts` | EDIT | Accept `{mode: 'one_shot', product}` and route to one-shot price IDs. | +30 |
| `base44/functions/stripeWebhook/entry.ts` | EDIT | Handle `checkout.session.completed` for one-shot product SKUs — write `OneShotPurchases.status='paid'`. | +40 |
| `base44/entities/AstroProfile.jsonc` | EDIT | +`asteroid_signs` (object), +`asteroids_computed_at` (date-time). | +12 |
| `base44/entities/HoroscopeReading.jsonc` | EDIT | +`goddess_read` (string), +`astra_signoff` (string). | +8 |
| `base44/entities/UserPreferences.jsonc` | EDIT | +`horoscope_quiet_mode` (boolean, default false). | +5 |
| `src/pages/Lifestyle.jsx` | EDIT | Update import path: `@/components/horoscope/HoroscopeTab` (the shim makes this optional but tidier). | ±1 |

### DELETE files

None — every file currently in use is either edited or replaced via shim. We don't lose data, we don't lose imports.

---

## 6. Entity / data model changes

### Extended: `AstroProfile`
- `+asteroid_signs` — object `{ceres: string, pallas: string, juno: string, vesta: string, chiron: string, lilith: string}`. Each is a zodiac name. Computed once at onboarding (or first daily reading after H2b ships) by either deterministic approximation (see §10) or LLM-fallback.
- `+asteroids_computed_at` — ISO date-time. Triggers re-compute when older than 90 days.
- *Why:* Goddess Bench (H2b) needs persistent placements.
- *Used at:* `GoddessBench.jsx`, `generateHoroscopeReading/entry.ts` (for `goddess_read` LLM context).

### Extended: `HoroscopeReading`
- `+goddess_read` — string. 1-2 sentence italic asteroid micro-read for today.
- `+astra_signoff` — string. Short attribution e.g. *"Astra · 13 May"*. Hard-coded to "Astra" persona for now (no real human signs day-to-day; the Atelier letter is where Astra actually signs).
- *Why:* both fields are rendered alongside today's reading; persisting them means the page is render-fast and we don't re-call the LLM on every open.

### Extended: `UserPreferences`
- `+horoscope_quiet_mode` — boolean, default false.
- *Why:* powers Quiet Mode toggle in H2c. Read by all three horoscope LLM endpoints.

### New: `HoroscopePersistedClassification`
- `user_id` (string, required)
- `red_white_archetype` (enum: `red_moon` | `white_moon` | `pink_moon` | `purple_moon` | `mixed` | `insufficient_data`)
- `confidence` (number 0-1)
- `bleeds_at_phases` (array of phase keys, last 6 cycles)
- `last_computed_at` (date-time)
- *Why:* recomputing every render is wasteful; once-monthly cron suffices.
- *Used at:* `RedWhiteMoon.jsx`.

### New: `AtelierLetters`
- `user_id` (string, required)
- `month` (string, format `YYYY-MM`, required)
- `headline` (string)
- `body_markdown` (string — long-form, ~1,500 words)
- `astra_signoff` (string)
- `status` (enum: `draft` | `published`)
- `drafted_at`, `published_at` (date-time)
- *Why:* monthly long-form letter per user. Drafted by LLM, published by operator review (Astra-in-the-loop).

### New: `OneShotPurchases`
- `user_id` (string, required)
- `product` (enum: `year_ahead` | `chart_atelier` | `choose_the_day`, required)
- `stripe_session_id` (string)
- `amount_gbp` (number)
- `status` (enum: `pending_payment` | `paid` | `refunded` | `simulated`)
- `paid_at` (date-time)
- `delivery_payload` (object — when product is delivered, link to PDF or chart row)
- *Why:* tracks the three one-shot products. `simulated` is the placeholder state until real Stripe price IDs are wired.

### Runtime-only (no entity needed)
- **Annual Profections** — pure age math, no persistence needed. Computed in `useProfections.js` hook from `userProfile.birthday`.
- **Sky Diary timeline** — composed at render time from `CycleEvents` (last 12 cycles) + `HoroscopeReading.transits_json` (last 12 months). No new entity.
- **`AsteroidProfile`** — folded into `AstroProfile.asteroid_signs` to avoid an extra entity for 6 strings.

---

## 7. Per-MP build prompts (paste-ready)

> **Operator notes for ALL prompts:**
> - These are written to be pasted *one at a time* into the base44 builder.
> - Each prompt is sized to avoid the base44 hang trap (no schema-change + invoke-external + multi-file-code-edit in a single prompt).
> - Each prompt ends with the exact "Run the build, then publish" trigger.
> - If a prompt is rejected/hangs, split it at the marked `═══` rules — both halves are independently runnable.

### Prompt: **H2a-1 — split the god-component, no behaviour change**

```
You are working on the FemWell app. The current Horoscope tab lives at
src/components/lifestyle/horoscope/HoroscopeTab.jsx and is 1,630 lines. We're
going to split it into a shell + section files at a new location, preserve
every existing behaviour, and leave a 3-line re-export shim so external
imports keep working.

Do these things, in order:

1. CREATE new directory src/components/horoscope/ with sub-dirs sections/ and
   hooks/.

2. CREATE src/components/horoscope/HoroscopeTab.jsx as the new shell. It:
   - imports useEffect/useState from react
   - imports base44 from @/api/base44Client
   - loads user, AstroProfile, today's HoroscopeReading, UserProfile,
     LifestyleProfile in parallel (mirror the existing logic at
     src/components/lifestyle/horoscope/HoroscopeTab.jsx:55-107)
   - fires generateHoroscopeReading optimistically if there's no row today
   - exposes a single hook useBirthChart() that returns
     { user, astro, reading, userProfile, lifestyleProfile, loading, refresh }
   - renders, in order: <TwilightHero/> <TriadCards/> <TodaysWeather/>
     <CycleMoonDial/> <SkyDiary/> <RedWhiteMoon/> <AnnualProfections/>
     <Compatibility/> <AskTheSky/> <QuietModeToggle/> <ScienceFooter/>
     <PrivacyLine/> <BirthDataSheet/> (the paid sections AtelierReading,
     PaidShelf, GoddessBench land in later commits — stub-import them with
     a no-op default export so the build doesn't fail).
   - keeps the BirthDataSheet open/close handlers and onboarding card.

3. CREATE src/components/horoscope/BirthDataSheet.jsx — copy the existing
   file from src/components/lifestyle/horoscope/BirthDataSheet.jsx exactly,
   but change the primary button label from "Unlock my chart" to
   "Tell us when". Also pre-seed date from userProfile.birthday when initial
   is null (read userProfile via context or props; if you don't have it in
   scope yet, pass it from the parent shell). Fix the comment on line 11 to
   reflect the new behaviour.

4. CREATE src/components/horoscope/hooks/useBirthChart.js — extract the
   useEffect at lines 55-107 of the old HoroscopeTab.jsx as a hook returning
   the same state shape.

5. CREATE src/components/horoscope/styles/tokens.js — export the Plum Night +
   Twilight color tokens documented in
   mnt/femwell/atelier_horoscope_v2_spec.md §1. Each section will import from
   here instead of inlining hexes.

6. CREATE seven stub section files in src/components/horoscope/sections/
   with names: TwilightHero.jsx, TriadCards.jsx, TodaysWeather.jsx,
   CycleMoonDial.jsx, SkyDiary.jsx, RedWhiteMoon.jsx, AnnualProfections.jsx,
   Compatibility.jsx, AskTheSky.jsx, QuietModeToggle.jsx, ScienceFooter.jsx,
   PrivacyLine.jsx, GoddessBench.jsx, AtelierReading.jsx, PaidShelf.jsx.
   Each stub must:
   - accept the props it needs ({ chart, reading, moon, cyclePhase, etc })
   - render the existing UI for that section by COPYING the current code
     for that section out of the old HoroscopeTab.jsx 1-for-1
   - for the brand-new sections (GoddessBench, AnnualProfections, RedWhiteMoon,
     SkyDiary, AtelierReading, PaidShelf, QuietModeToggle, ScienceFooter,
     PrivacyLine) — return null in this commit. They light up in H2b/c/d.

7. EDIT src/components/lifestyle/horoscope/HoroscopeTab.jsx — replace its
   contents with:
   ```
   export { default } from "@/components/horoscope/HoroscopeTab";
   ```
   Nothing else.

8. EDIT src/pages/Lifestyle.jsx line 9 import to
   `import HoroscopeTabImpl from "@/components/horoscope/HoroscopeTab";`.

VERIFY: the horoscope tab still loads, renders the current sections (Hero,
Triad, Weather, Cycle×Moon, Transits, Compatibility, Ask The Stars) with
identical UI to before. The new sections (Goddess Bench, Sky Diary, etc.)
will be empty for now — that's expected.

Run the build, then publish.
```

═══

### Prompt: **H2a-2 — purge emoji + UK locale + race-condition fix + askStars persistence**

```
Now we fix the four P0/P1 issues from mnt/femwell/audit_horoscope_v2.md
without changing the visible UI further.

1. EDIT src/utils/astrology.js:
   - In PHASE_BUCKETS (lines 115-125) DELETE the `glyph` field from every
     bucket and ADD `key` instead, with values "new", "waxing_crescent",
     "first_quarter", "waxing_gibbous", "full", "waning_gibbous",
     "last_quarter", "waning_crescent". Update getMoonPhase to return
     `key` instead of `glyph`.
   - In getZodiacGlyph, return null (no '✦' fallback).
   - In prettyBirthday (lines 197-201), return `${day} ${monthShort} ${year}`
     so output reads "14 Jun 1999" not "Jun 14, 1999".

2. CREATE src/components/horoscope/MoonPhaseGlyph.jsx — pure SVG component.
   Takes prop `phase` (the `key` from astrology.js) and renders a 24×24 SVG
   moon: a cream circle (#F5E6D3) with a plum overlay (#2B1E26) clipped to
   the unlit area. Eight phase variants. NO EMOJI codepoints. Export default.

3. EDIT src/lib/astrology/glyphs.js (CREATE if missing) — a Lucide icon map:
   - planets: Sun→Sun, Moon→Moon, Mercury→MessageCircle, Venus→Heart,
     Mars→Flame, Jupiter→Compass, Saturn→Mountain, Pluto→Waves,
     Uranus→Sparkles, Neptune→Waves.
   - signs: every sign points to the Lucide closest to its archetype
     (Aries→Flame, Taurus→Sprout, Gemini→Wind, Cancer→Moon, Leo→Sun,
     Virgo→Wheat, Libra→Scale, Scorpio→Waves, Sagittarius→Bow,
     Capricorn→Mountain, Aquarius→Wind, Pisces→Waves).
   Export getPlanetIcon(name), getSignIcon(name) — each returns a React
   component (Lucide icon), not a glyph string.

4. EDIT src/components/horoscope/sections/TriadCards.jsx — replace the
   string glyph prop with <SunIcon/> / <MoonIcon/> / <SunriseIcon/> Lucide
   refs at 24px stroke 1.5. Delete the `glyph={chart.sunGlyph}` use.

5. EDIT base44/functions/generateHoroscopeReading/entry.ts:
   - In the moon `buckets` array (lines 66-76), DELETE the glyph field
     and add a `key` field matching astrology.js.
   - In NARRATIVE_SYSTEM prompt (line 106), add: "Never include unicode
     astrology glyphs (☉ ☽ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇ ✦) or moon-phase emoji
     (🌑–🌘) in any output."
   - In the transits_json instructions (line 244), replace
     `"glyph":"☉|☽|☿|♀|♂|♃|♄"` with `"planet":"sun|moon|mercury|venus|mars|jupiter|saturn"`.
   - In the fallback transits (lines 282-289), replace glyph strings with
     planet keys: "sun","moon","mercury","venus" etc.
   - FIX the race condition: at line 175, only short-circuit when
     `astro.moon_sign` AND `astro.rising_sign` are both populated OR
     birth_time is unset. If birth_time is present and either moon_sign or
     rising_sign is missing, fall through to estimateChart even when a
     reading row already exists for today — then PATCH today's reading row
     with the new triad descriptions.

6. EDIT src/components/horoscope/sections/Transits/whatever-section-renders-transits
   to read `planet` (Lucide-mapped via getPlanetIcon) instead of `glyph`.
   Backwards-compat: if transit.glyph is present in stored rows, map known
   glyphs to planet keys (☉→sun, ☽→moon, ☿→mercury, ♀→venus, ♂→mars,
   ♃→jupiter, ♄→saturn).

7. EDIT base44/functions/askStars/entry.ts:
   - At line 170-174 (the thread.create fail branch), DO NOT silently lose
     the answer. Instead, log to IngestErrorLog with source_identifier
     "askStars" and raw_payload { user_id, question, answer } so the
     operator can recover it. Continue to return the answer to the user
     with thread_id: null.

VERIFY:
- No Unicode astrology glyphs in any JSX file under src/components/horoscope/.
- No emoji codepoints anywhere in src/utils/astrology.js or
  base44/functions/generateHoroscopeReading/entry.ts or
  base44/functions/askStars/entry.ts.
- Onboarding card button now reads "Tell us when".
- "14 May 2026" formatting in the hero kicker (not "May 14, 2026").
- Add a birth time AFTER first reading — moon/rising should populate today,
  not next day.

Run the build, then publish.
```

═══

### Prompt: **H2b-1 — Twilight hero + Triad + Today's Weather + Cycle×Moon dial**

```
Now we apply the visual v2.1 demo to the first four sections. The locked
demo is mnt/femwell/femwell_horoscope_v2_demo.html. The Atelier spec is
mnt/femwell/atelier_horoscope_v2_spec.md. Read both before writing code if
you have file access.

ADDITIVE ONLY: nothing currently rendered is to be removed. We're replacing
the visual shells, not the data flow.

1. EDIT src/components/horoscope/styles/tokens.js — make sure these tokens
   are exported: --paper-night #2B1E26, --ink-night #F5E6D3,
   --ink-night-mute #C9B8B0, --accent-night #E89289, --rule-night
   rgba(245,230,211,0.14), --tw-top #1A1320, --tw-mid #3D2A3F, --tw-bot
   #6B4559, --period #B84A41, --follicular #E67F73, --ovulatory #F2A99A,
   --luteal #8A5F74.

2. REWRITE src/components/horoscope/sections/TwilightHero.jsx per
   demo §1: full-bleed Twilight gradient (top→mid→bot), 7 absolutely-
   positioned dot-stars at the coordinates in the demo HTML, eyebrow
   "DISCOVER · HOROSCOPE", Fraunces 28px headline ("A steady day, Oji.
   The moon is *climbing*.") with italic emphasis on the verb, sub-line
   ("Day 18 of your cycle, day 9 of the moon's. A waxing gibbous in
   Scorpio — energy that asks for follow-through, not new beginnings."),
   3 chips (date / phase / moon phase).
   - Headline is `reading.headline` from the LLM, with `*word*` italics
     rendered by the existing renderEm helper.
   - The whole hero is wrapped so it bleeds left and right inside the
     page container (margin: 0 -18px).
   - NO MOON SVG INSIDE THE HERO. The big moon is the centre dial in
     CycleMoonDial. The hero is text-only over Twilight.

3. REWRITE src/components/horoscope/sections/TriadCards.jsx per demo §2:
   3 cream-on-Plum-Night cards in a 3-col grid. Each card has a 28px
   Lucide icon (Sun / Moon / Sunrise) in --accent-night, eyebrow
   "SUN" / "MOON" / "RISING", Fraunces 500 17px sign name, italic 10px
   trait one-liner ("considered, independent" etc.).
   - When moon/rising locked: opacity 0.78, body becomes "Birth time
     unlocks your moon. We need the minute, not the second.", CTA is a
     text-link (NOT a dashed pill) "+ Add birth time" in --accent-night.
   - Tap-to-expand: 200ms cubic-bezier(0.32,0.72,0.24,1) expand to show
     the 80-120 word reading from reading.triad_*_desc.
   - The trait one-liner comes from a static map (we don't ask the LLM
     for it; "Aquarius → considered, independent" is per-sign hardcoded
     in a SIGN_TRAITS table inside this file).

4. REWRITE src/components/horoscope/sections/TodaysWeather.jsx per demo §3:
   Single rounded card on Plum Night. Eyebrow "TODAY'S SKY · SIGNED BY ASTRA"
   in --accent-night. Fraunces italic 18px weather line
   (reading.power_title combined with reading.power_body trimmed, OR — if
   simpler — a new top-level `reading.weather_line` field; for this commit,
   use reading.power_title as the line and reading.power_body as a short
   trailing tail). 3 inline stats: Energy / Mood / Best for. The Energy
   value is a hardcoded "7/10" placeholder until the LLM is updated in
   H2b-2 to write it. Mood = "Open, decisive" (placeholder). "Best for" =
   reading.power_title sentenced.
   - The "PRESSURE" and "TROUBLE" cards from the current build are NOT
     dropped — they appear as a secondary "Notice / Watch for" row below
     the Today's Weather card, each a smaller cream-on-Plum-Night card
     with Lucide Wind / CloudDrizzle icons. This preserves the existing
     functionality (rule: additive only).

5. REWRITE src/components/horoscope/sections/CycleMoonDial.jsx per demo §4:
   SVG dial. Outer ring = lunar 29.5d (stroke #C9B8B0, dashed to phase).
   Inner ring = menstrual 28d (stroke colour by phase from phase tokens).
   Two discs at today's positions. Centre text "Today / TUE 13 MAY"
   (UK format). Legend right with two rows + an italic
   `reading.cycle_moon_body` line.
   - The dial must respond to live data: pass cyclePhase, cycle_day,
     moon (from getMoonPhase()), and reading.cycle_moon_body.
   - DELETE the old RingWrap two-circle approach (the old code is in the
     stub from H2a-1; replace its body entirely).

VERIFY on live:
- Hero is dusk gradient, one Fraunces sentence with italic verb, no moon
  glyph inside.
- Triad has Lucide icons, no Unicode glyphs.
- Today's Weather is a single Plum Night card with eyebrow "SIGNED BY
  ASTRA"; Pressure/Trouble persist below as a row.
- Cycle×Moon is one composite SVG dial.

Run the build, then publish.
```

═══

### Prompt: **H2b-2 — Goddess Bench + AstroProfile.asteroid_signs schema + LLM goddess_read**

```
We're adding the Goddess Bench (asteroid astrology) — Ceres / Pallas /
Juno / Vesta / Chiron / Lilith. Cheap, original, on-brand.

1. SCHEMA — extend AstroProfile entity with two new fields:
   - `asteroid_signs` (object): {ceres, pallas, juno, vesta, chiron, lilith}
     — each a zodiac name string or null.
   - `asteroids_computed_at` (date-time, optional).

2. SCHEMA — extend HoroscopeReading entity with two new fields:
   - `goddess_read` (string): 1-2 sentence italic asteroid micro-read.
   - `astra_signoff` (string): short attribution like "Astra · 13 May".

3. CREATE src/lib/astrology/asteroids.js:
   - Export ASTEROID_NAMES = ['ceres','pallas','juno','vesta','chiron','lilith'].
   - Export ASTEROID_ARCHETYPES — map of asteroid → {archetype,
     description, body_part, deep_dive_url}. Archetypes:
     Ceres=Mother, Pallas=Warrior, Juno=Partner, Vesta=Hearth,
     Chiron=Healer, Lilith=Wild.
   - Export estimateAsteroidsFromBirth(birthDate) — returns
     {ceres, pallas, juno, vesta, chiron, lilith} of zodiac names.
     Use the Skyfield-equivalent VSOP87 approximations: Ceres orbital
     period 4.6y, Pallas 4.62y, Juno 4.36y, Vesta 3.63y, Chiron 50.4y,
     Lilith (true Black Moon) 8.85y. Compute mean longitude at birth from
     a known epoch (1 Jan 2000) and convert to a sign 0-11 (Aries=0).
     Note this is APPROXIMATE — ±1 sign error possible. Mark the
     function jsdoc clearly. (We'll upgrade to Skyfield-on-server in H3.)

4. CREATE src/components/horoscope/hooks/useAsteroids.js — returns
   `astro.asteroid_signs` if present, else calls estimateAsteroidsFromBirth.

5. REWRITE src/components/horoscope/sections/GoddessBench.jsx per demo §2.5:
   - Plum Night card with eyebrow "ASTEROID ASTROLOGY", Fraunces 15px
     title "Goddess *bench*" (italic on "bench"),
   - 6-column grid of orbs (radial gradient by accent — Ceres rose,
     Pallas gold, Juno pink, Vesta moss, Chiron amber, Lilith teal),
     each with the asteroid name (Fraunces 10px) + role (Inter 8px).
   - A dashed-border italic read at the bottom from `reading.goddess_read`:
     "Your **Juno in Pisces** wants softness in commitment; your **Lilith
     in Aries** won't be tamed. The work is letting both speak."
   - Each orb is tappable; on tap, expands to show the full archetype
     description (~80 words) from ASTEROID_ARCHETYPES + the user's sign
     for that asteroid.

6. EDIT base44/functions/generateHoroscopeReading/entry.ts:
   - Compute asteroids deterministically using a port of
     estimateAsteroidsFromBirth (or call out — but stay deterministic to
     avoid LLM hallucination on positions).
   - On first run after this deploys, if astro.asteroid_signs is missing,
     compute + save back via AstroProfile.update().
   - Add `goddess_read` and `astra_signoff` keys to the JSON response
     contract.
   - Update prompt to provide asteroid_signs in chartLine and ask for
     `goddess_read` (1-2 italic sentences naming TWO of the asteroid
     placements and the tension between them; UK English; no emoji).
   - Set `astra_signoff` to `"Astra · ${ukDay} ${monthShort}"`.

VERIFY:
- AstroProfile rows have asteroid_signs populated on next read.
- Horoscope tab shows the Goddess Bench card between Triad and Today's
  Weather (matches demo order).
- Tap an orb → archetype expand panel.
- `goddess_read` is one or two italic sentences referencing two real
  asteroid placements.

Run the build, then publish.
```

═══

### Prompt: **H2c-1 — Sky Diary + Red/White Moon (schema + cron + UI)**

```
Two new visual sections backed by data — Sky Diary (12-cycle timeline) and
Red Moon / White Moon classifier.

1. SCHEMA — create entity HoroscopePersistedClassification:
   - user_id (string, required)
   - red_white_archetype (enum: red_moon | white_moon | pink_moon |
     purple_moon | mixed | insufficient_data; default insufficient_data)
   - confidence (number 0-1)
   - bleeds_at_phases (array of strings — phase keys for last 6 cycles)
   - last_computed_at (date-time)

2. CREATE src/lib/astrology/redWhite.js:
   - export classifyRedWhite(cycleEvents, getMoonPhaseFn). Input: array of
     CycleEvents with type='period_start'. Output: { archetype, confidence,
     bleeds_at_phases }.
   - Algorithm: for last 6 period_starts, compute moon phase key at that
     date. Red Moon = ≥4 of 6 are "new" or "waxing_crescent". White Moon
     = ≥4 of 6 are "full" or "waning_gibbous". Pink Moon = ≥4 of 6 are
     "first_quarter" or "waxing_gibbous". Purple Moon = ≥4 of 6 are
     "last_quarter" or "waning_crescent". Otherwise mixed.
   - Confidence = (matching/6).

3. CREATE base44/functions/computeRedWhiteMoon/entry.ts — monthly cron-driven
   batch. For each user with ≥3 period_starts in CycleEvents in the last
   180 days, run classifyRedWhite and upsert HoroscopePersistedClassification.
   Skip users with insufficient_data unless overdue.

4. EDIT base44/functions/pipelineOrchestrator/entry.ts — add a new phase
   `computeRedWhiteMoon` gated by wantsPhase('computeRedWhiteMoon').
   Schedule to run on the 1st of each month (the orchestrator's cron
   semantics — match the existing monthly phases).

5. REWRITE src/components/horoscope/sections/RedWhiteMoon.jsx per demo §6:
   - Plum Night card. Left: 48px moon glyph (radial gradient — gold for
     red moon, pearl for white moon, soft pink for pink, mauve for purple,
     mixed = half-and-half).
   - Right: eyebrow "YOUR ARCHETYPE", Fraunces 17px archetype name
     ("Red Moon" / "White Moon" / ...), Inter 11px description from a
     static copy table (Red Moon = "You tend to menstruate at the new
     moon. Common in women who are rest-aligned, slower-paced."), and a
     "Read more →" link to a future deep-dive page (stub with onClick
     that does nothing this commit).
   - When archetype = insufficient_data, show a soft empty state: "Log
     a few more cycles and the moon will tell us your archetype."

6. REWRITE src/components/horoscope/sections/SkyDiary.jsx per demo §5:
   - 12-column horizontal timeline (each column = one past cycle).
   - For each cycle, render a vertical bar tinted by phase gradient
     (period→follicular→ovulatory→luteal). Overlay 0-2 transit dots
     positioned by date within that cycle window (Saturn=teal,
     Jupiter=gold, Pluto=accent).
   - "Right now" card below: "Saturn squared your Sun across the last two
     cycles — explains the heaviness in April. You're past it."
     - This card text is computed deterministically from the user's chart
       + the last 2 months' major transits stored in HoroscopeReading
       rows. If no qualifying transit, fall back to the moon-phase
       observation: "The moon is climbing back. The last two cycles
       leaned heavy; this one will too — until the next new moon."
   - Use the hook useSkyDiary() to pull last 12 CycleEvents and last 12
     HoroscopeReadings.

7. CREATE src/components/horoscope/hooks/useSkyDiary.js and
   useRedWhiteMoon.js.

VERIFY:
- Sky Diary renders 12 bars with proper phase gradients and at least one
  transit dot for users with stored readings.
- Red/White Moon archetype card shows the right archetype OR an empty
  state for users with <3 cycles logged.

Run the build, then publish.
```

═══

### Prompt: **H2c-2 — Annual Profections + Compatibility upgrade + Ask The Sky + Quiet Mode + footers**

```
The last batch of free-tier features. After this, only the paid surfaces
(H2d) remain.

1. CREATE src/lib/astrology/profections.js:
   - export computeProfection(birthDate, today) → returns
     { age, house, time_lord, lit_house_copy, time_lord_copy, unlocks_on }.
   - House = (age % 12) + 1.
   - Time-lord (the traditional ruler of the natal house at that age):
     Age 0 (1st) → ruler of natal Asc; age 1 (2nd) → ruler of natal 2nd;
     etc. For users without a rising sign, fall back to whole-sign-from-Sun
     houses.
   - Static copy table: house → 1-paragraph "this year is about" text.
     5th house (creativity / pleasure) example matches the demo.
   - unlocks_on = next birthday in user's locale.

2. CREATE src/components/horoscope/hooks/useProfections.js — wraps
   computeProfection with user.birthday + astro.rising_sign.

3. REWRITE src/components/horoscope/sections/AnnualProfections.jsx per
   demo §6.5:
   - Gold-tinted card with eyebrow "YEAR 27 · ANNUAL PROFECTION"
     (uses age), Fraunces italic title "A *Venus year* — the 5th house
     is lit." (the planet + the house), italic body from the copy table,
     three meta entries (Time-lord, Active house, Unlocks on date).

4. REWRITE src/components/horoscope/sections/Compatibility.jsx per
   demo §8:
   - Restyle the existing logic. Two-circle overlapping monogram top-left
     (each circle is a coloured disc with the initial of the user/partner
     name). Big Fraunces 36px score. Italic label ("a steady fire").
     Body paragraph (reading.narrative). 4 dim tiles (Talk · Touch · Trust
     · Time/Grow — see contradiction note in spec §9).
   - Last reading shows as a chip "Last: Sam · 6 days ago" near the
     section head.

5. REWRITE src/components/horoscope/sections/AskTheSky.jsx per demo §9:
   - Rename in UI from "Ask the stars" → "Ask the *sky*" (italic on
     "sky"). Sub-line: "grounded in your chart, today's sky" (NO Jess
     reference).
   - Notebook-ruled input (background-image of 1.7em horizontal lines,
     not a pill).
   - Placeholder is Fraunces italic 14px — "Why does this week feel so
     unsettled, even though nothing's wrong?".
   - 3 suggestion chips below the input, each Inter 12px, no fill, soft
     rules. Re-worded queer-safe:
     "Should I rest more today?" /
     "Is now a good time to start the move?" /
     "Why am I dreaming so vividly?".
   - When an answer arrives, label is "THE SKY SAYS" (not "JESS SAYS").
   - Recent asks chips below.

6. SCHEMA — extend UserPreferences entity with:
   - `horoscope_quiet_mode` (boolean, default false).

7. CREATE src/components/horoscope/sections/QuietModeToggle.jsx per demo §10:
   - Plum Night row with name "Quiet Mode" + helper italic "Soften
     shadow-language. No 'war', 'wound', 'trauma' in your readings."
   - Toggle on the right. Reads + writes UserPreferences.horoscope_quiet_mode.

8. EDIT base44/functions/generateHoroscopeReading/entry.ts +
   base44/functions/askStars/entry.ts +
   base44/functions/generateCompatibility/entry.ts:
   - Load UserPreferences and read horoscope_quiet_mode.
   - When true, append to system prompt: "Quiet Mode is active: avoid
     shadow-language. Do not use words like 'war', 'wound', 'trauma',
     'crisis', 'doom', 'endings'. Frame challenges as
     'something-to-notice', not 'something-to-fear'."

9. CREATE src/components/horoscope/sections/ScienceFooter.jsx per demo §11:
   - Dashed border-radius 12px card with eyebrow "WHY WE TRUST THE MOON",
     italic Fraunces body, citation paragraph: "Helfrich-Förster 2021
     (Science Advances) found ~24% of women under 35 sync their cycle to
     lunar phase, stronger when artificial light is low. Cajochen 2013
     (Current Biology) found a 30% reduction in NREM delta sleep around
     the full moon. We cite these honestly; astrology beyond moon-phase
     remains symbolic."

10. CREATE src/components/horoscope/sections/PrivacyLine.jsx per demo §12:
    - Single 10px Inter footer: "Your birth time + cycle data never leaves
      your device unencrypted. / FemWell Plus billing handled by Stripe
      (PCI-DSS L1)."

VERIFY:
- Annual Profections card shows Year (age) + house + time-lord + unlocks
  date.
- Compatibility tile renders the 4 dimensions + two-letter monogram.
- Ask The Sky is labelled correctly and chips are reworded.
- Toggling Quiet Mode writes to UserPreferences.
- Next horoscope reading after toggling Quiet Mode visibly softens.

Run the build, then publish.
```

═══

### Prompt: **H2d-1 — AtelierReading paywall + AtelierLetters entity + draft cron**

```
Paid Surface 1 — the Atelier Reading. Long-form monthly letter, AI-drafted
+ human-signed by Astra.

1. SCHEMA — create entity AtelierLetters:
   - user_id (string, required)
   - month (string, format YYYY-MM, required)
   - headline (string)
   - body_markdown (string)
   - astra_signoff (string)
   - status (enum: draft | published; default draft)
   - drafted_at, published_at (date-time)

2. CREATE base44/functions/draftAtelierLetter/entry.ts:
   - Input: { user_id, month?: 'YYYY-MM' }
   - Loads AstroProfile + UserProfile + last 30 days of CycleEvents +
     last 12 HoroscopeReadings.
   - Calls GPT-4o (NOT mini — this letter is long form) with a system
     prompt: "You are Astra Cole, MA, FAS — a London-trained astrologer
     (Faculty of Astrological Studies). You write a 1,200-1,500 word
     monthly letter for a FemWell user. Warm, literary, UK English.
     Present-tense. Honest about challenge without melodrama. Reference
     the user's chart, their last cycle, and the major transits of the
     month ahead. Sign off 'Astra'. NO emoji. NO markdown headings — use
     paragraph breaks only."
   - Save with status='draft'. Operator publishes manually via
     base44 admin (sets status='published').

3. EDIT base44/functions/pipelineOrchestrator/entry.ts — add a new monthly
   phase `draftAtelierLetters` gated by wantsPhase. Runs on the 28th of
   each month for the next month. Only drafts for users with an active
   Plus/Pro/Premium Entitlements row.

4. CREATE src/components/horoscope/hooks/useEntitlements.js — reads
   Entitlements for user_id, returns { plan, hasAtelier }.
   hasAtelier = plan in ['plus','pro','premium'].

5. REWRITE src/components/horoscope/sections/AtelierReading.jsx per demo §7:
   - LOCKED variant (free user): purple-plum gradient card,
     eyebrow "FEMWELL PLUS · THE ATELIER", Fraunces italic 22px title
     "May's reading — *a quieter shape*", meta "6 pages · Astra Cole, MA,
     FAS · 14 min read", a 1-paragraph italic preview pulled from
     letter.body_markdown.slice(0, 240) (or a hardcoded teaser if no draft
     yet), two chips ("Real astrologer, not LLM", "Backed by Skyfield"),
     primary CTA "Unlock with FemWell Plus →" (deep-links to
     /settings/subscription), price line "£8.99 / month · or £69 / year ·
     cancel anytime".
   - UNLOCKED variant (Plus user): the same card but the CTA becomes
     "Read this month's letter →" and tapping it opens a full-screen
     reader showing letter.body_markdown rendered with the Fraunces
     long-form treatment (line-height 1.65, max-width 38em).

VERIFY:
- Free users see the locked Atelier card.
- Plus users see the unlocked Atelier card with a real (draft or
  published) letter.
- draftAtelierLetter can be invoked manually from base44 admin and
  produces a coherent 1,200+ word letter.

Run the build, then publish.
```

═══

### Prompt: **H2d-2 — Paid Shelf (one-shots) + OneShotPurchases entity + Stripe wiring (simulated checkout)**

```
Paid Surface 2 — the £19 / £29 / £55 one-shot shelf. We ship the UI plus a
simulated checkout that creates a pending purchase row. Operator wires
real Stripe price IDs in a follow-up.

1. SCHEMA — create entity OneShotPurchases:
   - user_id (string, required)
   - product (enum: year_ahead | chart_atelier | choose_the_day, required)
   - stripe_session_id (string)
   - amount_gbp (number)
   - status (enum: pending_payment | paid | refunded | simulated; default
     pending_payment)
   - paid_at (date-time)
   - delivery_payload (object — e.g. {pdf_url: 'TBD'} for year_ahead)

2. CREATE base44/functions/createOneShotCheckout/entry.ts:
   - Input: { user_id, product }
   - Looks up product → amount_gbp: year_ahead=19, chart_atelier=29,
     choose_the_day=55.
   - If env vars STRIPE_YEAR_AHEAD_PRICE_ID / STRIPE_CHART_ATELIER_PRICE_ID
     / STRIPE_CHOOSE_THE_DAY_PRICE_ID are set: create a real Stripe
     mode='payment' checkout session, return {url, session_id}, and
     create an OneShotPurchases row with status='pending_payment'.
   - If env vars are missing: skip Stripe, create OneShotPurchases row
     with status='simulated', return
     {simulated: true, message: 'Payment temporarily unavailable. Your
     order is logged — Astra will be in touch by email.'}.

3. EDIT base44/functions/stripeWebhook/entry.ts:
   - Handle checkout.session.completed where metadata.product matches one
     of the three one-shot product keys.
   - Look up OneShotPurchases by stripe_session_id, set status='paid' and
     paid_at = now.

4. REWRITE src/components/horoscope/sections/PaidShelf.jsx per demo §7.5:
   - 2-column grid with 3 cards (left, right, full-width bottom).
   - Card 1 (left): eyebrow "ONE-SHOT · PDF", title "Year ahead",
     description "12-page printable, signed", price £19. CTA "Order".
   - Card 2 (right): eyebrow "ONE-SHOT", title "Birth chart atelier",
     description "Full natal, with art", price £29. CTA "Order".
   - Card 3 (full-width): teal-tinted, eyebrow "BY APPOINTMENT ·
     ELECTIONAL", title Fraunces "Choose *the day*" (italic the day),
     description "Wedding, surgery, launch, IVF transfer — Astra picks
     the auspicious window from a 3-month range. Reply within 48h,
     signed.", price £55. CTA "Request a date".
   - Each CTA invokes createOneShotCheckout with the right product key.
     On simulated response, show a soft toast "Your order is logged.
     Astra will be in touch by email." On real Stripe response, redirect
     to session.url.

5. EDIT src/components/horoscope/HoroscopeTab.jsx (shell) to render
   <PaidShelf/> just under <AtelierReading/>.

VERIFY:
- Free user sees the locked Atelier card AND the 3 one-shot cards (these
  three are accessible to any user — they're one-time purchases, not
  subscription gated).
- Tapping "Order" on Year Ahead with simulated mode creates a row in
  OneShotPurchases with status='simulated'.
- When Stripe env vars are set, the same tap redirects to a real Stripe
  checkout.

Run the build, then publish.
```

---

## 8. Success criteria (per H2x acceptance test)

### H2a acceptance
- Old file `src/components/lifestyle/horoscope/HoroscopeTab.jsx` is now a 1-line shim.
- New `src/components/horoscope/HoroscopeTab.jsx` shell exists.
- All 7 existing sections render with **identical visual output** to pre-H2a state (regression baseline).
- `grep -E "🌑|🌒|🌓|🌔|🌕|🌖|🌗|🌘"` over the whole repo returns zero matches.
- `grep -E "☉|☽|☿|♀|♂|♃|♄|✦"` over `src/components/horoscope/` returns zero matches.
- Birthday "14 Jun 1999" format visible in hero kicker for a test user born 14 Jun.
- New onboarding card CTA reads "Tell us when".
- Add birth time after first reading → moon/rising appear *today*, not next-day.

### H2b acceptance
- Hero is full-bleed Twilight; one Fraunces sentence with italic verb; 7 dot-stars.
- Triad uses Lucide icons; locked cards open the BirthDataSheet on tap.
- Today's Weather has the eyebrow "TODAY'S SKY · SIGNED BY ASTRA"; Pressure / Trouble cards persist beneath it.
- Cycle×Moon is one composite SVG dial with two rings + two discs + centre text.
- Goddess Bench card renders between Triad and Today's Weather; six orbs; italic goddess_read at the bottom; tap an orb expands the archetype panel.
- `AstroProfile.asteroid_signs` populated for test user after first reading.

### H2c acceptance
- Sky Diary shows 12 cycle bars with phase gradients + transit dots for a user with stored readings.
- Red Moon / White Moon archetype card shows correct archetype (computed from 6+ logged cycles) OR a clean "log more cycles" empty state.
- Annual Profections card shows correct age / house / time-lord / unlocks-on date.
- Quiet Mode toggle: switching it on, then refreshing tomorrow's reading, makes the text visibly softer (no "war / wound / trauma" words).
- Ask The Sky is renamed everywhere; chips re-worded; notebook-rule input; label "THE SKY SAYS".
- Science footer renders; privacy line renders.

### H2d acceptance
- Free user sees locked Atelier card + 3 one-shot cards.
- Plus user sees unlocked Atelier card; tapping it opens the letter reader.
- "Order" on a one-shot product creates an `OneShotPurchases` row with `simulated` status when Stripe keys missing.
- Operator can publish a drafted Atelier letter from base44 admin (status flip draft → published).

---

## 9. Brand voice notes

- **UK locale.** £, en-GB dates (`14 May 2026`), British spelling (synchronise, colour, behaviour). Per memory `feedback_femwell_is_uk`.
- **No emoji codepoints anywhere** — Fraunces + Inter + Lucide/SVG glyphs only. Per memory `feedback_no_emoji_in_femwell`.
- **No "brick on bread"** — every new feature replaces, augments, or adds; nothing duplicates the live UI. Per memory `feedback_no_brick_on_bread`.
- **No stale features** — every new entity (AtelierLetters, OneShotPurchases, HoroscopePersistedClassification, asteroid_signs) is wired to real renders. Quiet Mode passes through all 3 LLM endpoints. Per memory `feedback_no_stale_features`.
- **Plum Night theme** for the Horoscope tab (the rest of Lifestyle stays paper). Twilight gradient used only for hero, onboarding, Ask The Sky shell.
- **Renames** — `"Ask The Stars"` → `"Ask The Sky"`; `"Unlock my chart"` → `"Tell us when"`. Atelier explicitly called for both.
- **Named persona** — Astra Cole, MA, FAS. Replaces "Jess" in the Horoscope context. (Jess remains FemWell's general-wellness voice elsewhere.)
- **Reading level** — Year-9 reading level for the action; literary cadence in description. Same voice as the rest of the app.
- **Quiet Mode words to avoid when active:** war, wound, trauma, crisis, doom, endings, attack, battle, struggle, suffer, broken, damage.

---

## 10. Risk register

| # | Risk | Mitigation |
|---:|---|---|
| 1 | **Real ephemeris** — the Skyfield Python path is non-trivial in a Deno runtime; AGPL Swiss Ephemeris is a legal trap. | Ship H2 with the **existing deterministic approximations** (synodic moon math is already correct ±1% illumination; sun-sign math is correct; asteroid sign is correct to ±1 sign via mean-longitude approximation — good enough for daily horoscope). LLM is told *not* to invent transit dates — when the function doesn't know a transit date, it returns the synodic moon ingress (deterministic) as the only transit. **Real Skyfield** is H3. |
| 2 | **Fabricated transits** — current prompt still lets the LLM invent dates. | H2a-2 prompt explicitly forbids inventing dates; LLM is told to return only the deterministic moon ingress + sun ingress dates as fallback. Fabricated transit risk drops from "every day" to "rare LLM disobedience". |
| 3 | **Prompt token budget** — the daily reading prompt is already long (~14 keys); adding goddess_read + astra_signoff + chartLines + Quiet Mode + asteroids pushes it to ~3,000 tokens with response. | Mitigation: GPT-4o-mini is fine for the daily reading (8K context, fast, cheap). The **Atelier letter** moves to GPT-4o because of length, not context. |
| 4 | **Moon-phase rendering across themes** — the new `MoonPhaseGlyph` SVG must render legibly on cream + Plum Night both. | The component takes a `theme` prop (`light` | `dark`) and inverts the fill/stroke colours accordingly. Single source of truth. |
| 5 | **Paid shelf without real Stripe** — operator may not have UK GBP price IDs ready. | `createOneShotCheckout` falls back to `simulated=true` when env vars missing — a soft toast lets the user know their order is logged and Astra will follow up. UI is full-fidelity from day one; payment flips on later. |
| 6 | **Astra Cole, MA, FAS legal cover** — using a credentialed name implies a real person. | For the £1M sale, Astra **must** be a real person under contract — the Faculty of Astrological Studies maintains a directory. Operator hires a UK practitioner before publishing real letters. In the meantime, all Astra-signed copy is generated and marked **"Drafted by FemWell · awaiting Astra sign-off"** until a real signoff is recorded. Spec ships with `status='draft'` until human review. |
| 7 | **Quiet Mode doesn't actually quiet** — LLMs sometimes ignore prompt constraints. | A simple regex post-filter in `generateHoroscopeReading` replaces any banned word with `"·"` and logs the substitution to `IngestErrorLog` for future prompt tuning. Belt-and-braces. |
| 8 | **Compatibility "Grow" vs "Time" dimension** — see §9 contradiction note. | Document choice and ship with the existing `grow_score` field; display label = "Time" in v2.1 demo. |
| 9 | **base44 prompt-size limits** — known agent-hang trap on schema+invoke+code+re-invoke combos. | Build prompts (§7) are split so each prompt makes ≤1 schema change OR ≤1 external function call OR ≤1 multi-file edit, never all three. |
| 10 | **Goddess Bench accuracy** — asteroid approximation is ±1 sign; an astrology-literate user may catch it. | Footer disclosure on the Goddess Bench: "Asteroid positions are approximate to ±1 day. For an exact chart, see The Atelier." This converts a flaw into a paid-upsell hook. |
| 11 | **Sky Diary requires 12 months of stored readings** — many users won't have that. | Empty state: "Your Sky Diary fills in as your year unfolds. Come back next month." Per phase progress fades remaining columns at 30% opacity. Genuinely useful by month 3-4. |
| 12 | **Red/White Moon classification on insufficient data** — most users at MVP have <3 cycles. | Show an empty state until threshold; recompute monthly via the new cron. |

---

## 11. Sequence + estimate

- **H2a** — 2-3 commits, ~1 day work (refactor + brand sweep).
- **H2b** — 3-4 commits, ~2 days (Twilight hero, Triad, Weather, Dial, Goddess Bench — all new visuals + 1 schema change).
- **H2c** — 3-4 commits, ~2 days (Sky Diary + R/W Moon + Profections + Compat + Ask The Sky + Quiet Mode + footers — heaviest commit).
- **H2d** — 2-3 commits, ~1.5 days (Atelier paywall + Paid Shelf + Stripe wiring + draft cron).

**Total:** ~12-15 commits across ~6-7 days of focused build, allowing for build-verify-publish loops per memory `feedback_build_workflow`.

---

## Spec contradictions found (raised by Mr Lead Manager for resolution before build)

1. **Compatibility 4th dimension label** — the visual demo (`femwell_horoscope_v2_demo.html` line 1046) labels the four tiles **Talk · Touch · Trust · Time**. The current entity schema (`CompatibilityReading.jsonc:50-53`) has `talk_score / touch_score / trust_score / grow_score`. The Atelier spec (`atelier_horoscope_v2_spec.md` line 118) labels them **Talk/Touch/Trust/Grow**. **Decision needed:** rename `grow_score` → `time_score` (schema migration) OR keep field name `grow_score` and label as "Grow" in UI? Spec assumes the latter (label="Grow" matching Atelier) for now — but the demo says "Time". Flag for operator sign-off before H2c-2.
2. **"Mr Fix-it audit said `src/utils/astrology.js` lines 116-124"; the actual file shows the buckets at lines 115-125** — minor off-by-one; matches in spirit. No action needed.
3. **The audit references `src/components/lifestyle/horoscope/HoroscopeTab.jsx`** at lines 944-953 for the hero shell; the current code we read has hero shell at 944-953 — confirmed. Lines 1112-1123 for `triadUnlockBtnStyle` — confirmed; we replace it with the text-link per spec.
4. **The demo HTML claims "Backed by Skyfield"** as a chip on the Atelier card (line 993). Per §10 risk #1, we are **not** shipping real Skyfield in H2 — we're shipping deterministic approximations. The chip text should be either **"Backed by NASA ephemeris"** (when we wire libephemeris in H3) or **"Backed by Astra"** for now. Spec ships with chip text **"Backed by named astrologer"** — flag for operator.
5. **Goddess Bench in the demo lists Lilith in Aries (Wild)** as the example. Lilith astrologically is the "Black Moon Lilith" — a calculated point, not an asteroid (asteroid Lilith is #1181 and rarely used). The code in `asteroids.js` should call out which Lilith we mean — spec recommends **Black Moon Lilith** (calculated lunar apogee, more common in modern feminist astrology) and labels it accordingly. Flag for operator.
6. **Annual Profections demo title says "Year 27 · Annual Profection"** — the age starts at 0 (1st profected year = age 0 → 1st house). So Year 27 = age 27 = the **4th house** (since 27 mod 12 = 3 + 1 = 4), not the 5th. The demo content shows 5th house for Year 27. Astrologically incorrect. Spec uses the **mathematically correct** mapping `(age % 12) + 1` and accepts the demo is illustrative; the static copy table will read the right house for the user's age. Flag for operator (demo will need a small re-render once profections compute correctly).

# Horoscope feature — audit v2 (Mr Fix-it)

Date: 2026-05-13 · App: 69a9891a6ccccc1822bbb4bc · No code edits, diagnosis only.

## 1. Files inspected

| File | Lines | Complexity | Notes |
|---|---:|---|---|
| `src/components/lifestyle/horoscope/HoroscopeTab.jsx` | 1630 | HIGH | One file, 7 inner components, ~50 inline style objects, 4 fallback generators. Everything lives here. |
| `src/components/lifestyle/horoscope/BirthDataSheet.jsx` | 294 | LOW | Single-purpose modal. Clean. |
| `base44/functions/generateHoroscopeReading/entry.ts` | 299 | MEDIUM | One LLM call returns 14 keys; deterministic moon math; auto-estimates moon/rising/mercury. |
| `base44/functions/generateCompatibility/entry.ts` | 207 | MEDIUM | Sun-sign-only synastry, element/modality affinity + LLM colouring. |
| `base44/functions/askStars/entry.ts` | 197 | LOW | Single-shot Q&A persisted to AdviceThreads(topic='horoscope'). |
| `src/utils/astrology.js` | 223 | LOW | Pure deterministic helpers. Good. |
| `base44/entities/AstroProfile.jsonc` | 55 | LOW | 8 props, only `user_id`+`birth_date` required. |
| `base44/entities/HoroscopeReading.jsonc` | 91 | LOW | 18 narrative + 1 array field. Wide row. |
| `base44/entities/CompatibilityReading.jsonc` | 63 | LOW | Score row + 4 sub-dimensions. |
| `base44/functions/pipelineOrchestrator/entry.ts` (Phase 7) | 645 (full) | n/a | `runDailyHoroscopesPhase` at L520–565; gated by `wantsPhase('generateDailyHoroscopes')`. |
| `src/pages/Lifestyle.jsx` (wrapper) | — | n/a | Tab gated at L603, hides category filter L583. |

Total horoscope-specific code: ~2920 lines.

## 2. Section-by-section state

### 2a. Empty state (Onboarding) — `HoroscopeTab.jsx:883–897`
- **What it does:** Renders `OnboardingCard` when `astro===null` (L119–132). Single CTA opens `BirthDataSheet`.
- **Broken/half-done:** Sheet does **not** pre-seed `date` from `userProfile.birthday` even though BirthDataSheet.jsx:11 claims it does — initial state is `initial?.birth_date || ""` only (BirthDataSheet.jsx:22). UserProfile birthdays go unused, forcing every onboarded FemWell user to retype her birthday.
- **Data:** writes `AstroProfile` (BirthDataSheet.jsx:62–65); fires `generateHoroscopeReading` (BirthDataSheet.jsx:69) without awaiting.
- **Defects:** silent failure on `.invoke(...).catch(()=>{})` (BirthDataSheet.jsx:69) — user gets no feedback if reading generation fails; `Hero` then renders fallback copy that says "Today's reading is being written" (L284, L409, L530), which becomes permanent if the function 502s.

### 2b. Triad (sun / moon / rising) — `HoroscopeTab.jsx:290–342`
- **What it does:** Three cards. Sun shows degree (L303); Moon + Rising locked behind birth time (L311–322). When unlocked, uses `reading.triad_*_desc`; otherwise generic boilerplate.
- **Broken/half-done:** `chart.moonSign` / `chart.risingSign` come from `astro.moon_sign` / `astro.rising_sign` which are populated **only by `generateHoroscopeReading` first run** (entry.ts:198–215). If the user enters birth time AFTER the first nightly job has cached today's reading, `force=false` short-circuits at entry.ts:175–184 and the moon/rising estimation **never runs that day** — triad stays locked until tomorrow.
- **Data:** AstroProfile + HoroscopeReading.
- **Defects:** Sun degree display "23°" (L303) only works when `getSunDegree(birthday)` succeeds; for missing birthday it disappears with no fallback. Triad lock CTA opens the sheet but doesn't focus the time input.

### 2c. Today's weather — `HoroscopeTab.jsx:365–421`
- **What it does:** 3 cards (power/pressure/trouble) coloured rose/gold/plum (L389–391); reads `reading.power_*` etc.
- **Broken:** None visible. Solid section.
- **Defects:** Cards are equal-weight grid (`triadRowStyle`-style); "trouble" gets equal real estate as "power" — visually flat. Hardcoded WEATHER_META colours (L389–391) fall through to `var(--rose-primary,...)` with hex fallbacks — acceptable.

### 2d. Cycle × Moon — `HoroscopeTab.jsx:426–478`
- **What it does:** Single card. Headline + body + two ring visuals (sky moon + body cycle).
- **Broken/half-done:** When `cyclePhase===null` (user not tracking), the body copy at L468–469 says "log a cycle in Track" but there's no link to Track. Dead-end.
- **Data:** UserProfile.last_period_start_date → `derivePhase` (HoroscopeTab.jsx:194–207). LLM fills `cycle_moon_headline`/`cycle_moon_body`.
- **Defects:** Rings (L1200–1209) are static circles with single glyph — no rotation, no actual cycle position, no moon illumination overlay. Underdelivers on the "intersection visual" promise.

### 2e. Transits — `HoroscopeTab.jsx:483–552`
- **What it does:** 4 transit cards over next 7 days (`reading.transits_json`).
- **Broken:** LLM-generated transits are **fabricated, not astronomically derived**. Sample row 2026-05-12 includes `"2026-05-15: Sun enters Gemini"` — actual sun-into-Gemini was 2026-05-21. GenerateHoroscopeReading.entry.ts:244 explicitly tells the model "if you don't know exact astronomy, write literary transits with valid future dates." This will get noticed by anyone who follows astrology and burns credibility.
- **Defects:** "7-day view" link at L489 is just text, no `href`/`onClick`. Dead affordance.

### 2f. Compatibility — `HoroscopeTab.jsx:557–724`
- **What it does:** Form (name + date) → `generateCompatibility`. Shows score (big number L692), label, narrative, 4 dim bars.
- **Broken/half-done:** Caching keyed on `(user_id, their_birthday, normaliseName(their_name))` (entry.ts:140–145). Two friends with same name + birthday collide. Minor. **Sample data: 0 rows in CompatibilityReading** — feature is shipped but nobody is using it (or running it hasn't worked).
- **Data:** AstroProfile + LLM. Does NOT use moon/rising even when present — sun-sign synastry only (entry.ts:152–157).
- **Defects:** Error states stringify backend message (HoroscopeTab.jsx:606) but most errors get swallowed with generic "Couldn't read this pairing." No retry. History chips show `their_name · score` but truncate with no overflow handling.

### 2g. Ask the Stars — `HoroscopeTab.jsx:735–878`
- **What it does:** Text input + 3 starter chips → `askStars`. Persists to `AdviceThreads` topic='horoscope' + `AdviceMessages`. History chips load last 5 horoscope threads.
- **Broken/half-done:** **0 AdviceThreads with topic='horoscope'** in DB (sample) — either no one's used it OR the create at askStars/entry.ts:165 is failing silently. Worth a sanity log dump. ASK_CHIPS (L729) are hardcoded English questions ("Should I text him back today?") — fine, but not chart-aware.
- **Data:** AstroProfile + UserProfile + moon math → LLM; persists to AdviceThreads/AdviceMessages.
- **Defects:** Error swallowed at L797 ("Couldn't reach Jess."). On thread-create failure (entry.ts:170–174) returns `thread_id:null` and the answer is **not persisted** — silently lost. Enter key submits (L822) but no Shift-Enter for multi-line / no character count.

## 3. Hidden capabilities (unsurfaced)

1. **`sun_degree`** stored on AstroProfile, computed by LLM (entry.ts:206) — only shown on triad sun card. Could anchor a "you're at 24° Gemini — the sign's late degrees" eyebrow elsewhere.
2. **`mercury_sign`** stored — appears only as a hero pill (L238). Never used in triad, weather, or compatibility despite being the natural fourth-card pivot.
3. **`moon_pct` + `moon_phase`** are persisted on HoroscopeReading and computed deterministically — could drive a 7-day moon strip in Today/Lifestyle without re-running the LLM.
4. **`AdviceThreads` topic='horoscope'** is the same table used by Jess chat — these answers should appear in the global Jess history UI but Ask-the-Stars threads are write-only here.
5. **`sunSignCompatBase(a,b)`** (astrology.js:166–176) is exported but unused client-side; could give an instant pre-LLM score preview.
6. **`getElement` / `getModality` / `cycleMoonHeadline`** in astrology.js (L91–98, L214–218) — exported, unused.
7. **`ALL_ZODIAC`** (L221) — imported in HoroscopeTab L14 but kept alive by `void ALL_ZODIAC` (L1630). Could power a "see all 12" picker, sign explorer, or daily-by-sign view for non-onboarded visitors.
8. **`Lock` icon** imported (L2) then `void Lock` at L1629 — placeholder for locked triad CTA never wired.
9. **`InsightCards` / `DailyPhaseBrief` / Today** — none consume HoroscopeReading. The whole feature is invisible outside its own tab. Today could surface today's `headline` + `power_title` in one line.

## 4. Data quality (live sample)

Sampled live base44 (app `69a9891a6ccccc1822bbb4bc`) 2026-05-13:

- **AstroProfile:** 1 row total. flashsnipper@gmail.com — Gemini sun, Cancer moon, Leo rising, Mercury Gemini, sun_degree 24, birth_place `"westminster"` (lowercase, not capitalised). Onboarding is functioning; **no one else has onboarded.**
- **HoroscopeReading:** 1 row total (`reading_date: 2026-05-12`). **No row for today (2026-05-13).** Either nightly orchestrator hasn't fired yet (depends on cron time vs sample time) or `generateDailyHoroscopes` is not in the orchestrator's enabled phases. Worth verifying immediately.
- **CompatibilityReading:** 0 rows. Either no usage or LLM 502s.
- **AdviceThreads (topic='horoscope'):** 0 rows. Same — either nobody asked or askStars persistence is broken.
- The one HoroscopeReading row: all 18 narrative fields populated (sample inspected). LLM voice ON-brand for FemWell. transits_json contains 4 entries with the astronomy-fabrication problem flagged in 2e.

**Stale-cache risks:**
- Single-day idempotency (entry.ts:175–184) is correct, but no TTL means if a `force` admin run lands and writes a malformed row, it's stuck until midnight UTC (`todayISO()` uses UTC — for UK users that's correct at most of the year but daylight-saving boundary will read today's row a few hours early/late).
- AstroProfile `moon/rising/mercury` are only filled on FIRST `generateHoroscopeReading` after birth_time arrives (entry.ts:198) — race condition documented above (2b).

## 5. Brand violations

- **Moon emoji codepoints** (`🌑🌒🌓🌔🌕🌖🌗🌘`) in `src/utils/astrology.js:116–124` and `base44/functions/generateHoroscopeReading/entry.ts:67–75`. These render in the Cycle × Moon `RingWrap` (HoroscopeTab.jsx:437 — `glyph={moon.glyph}`) and could leak into LLM prompts. Violates "no emoji in FemWell — ever" rule.
- Inputs `compatInputStyle` background `rgba(255,255,255,0.6)` (HoroscopeTab.jsx:1309) — not a brand token. Same for many `background: "rgba(247,239,225,0.08)"` overlays — these aren't violations per se but they bypass the cream/plum token system.
- Error pink `#A0312A` / `#FFC4BC` (L1356, L1520) — not in the documented palette.
- No Playfair Display references (clean). No `#C084FC` purple (clean — uses radial-gradient `#3a2a4c`/`#221a2e`/`#15101e`).
- No "missed/streak/broken" punitive copy (clean).
- US-locale: `prettyBirthday` (astrology.js:197–201) returns `"Jun 14, 1999"` (US order). Used in Hero kicker (L216, L632). Memory says UK locale — should be `14 Jun 1999`.
- ASK_CHIPS L729 are fine UK-neutral except "Should I text him back today?" presumes a man and gendered romance — locks out queer users.

## 6. Architectural risk (what blocks lifting 5 levels)

- **God-component file.** HoroscopeTab.jsx is 1630 lines, 7 sub-components + 50+ style objects in one file. Any cross-cutting design refresh requires touching the whole thing. Split before any major redesign.
- **Inline styles, no CSS.** Every component carries its own style constants — no `:hover`, no `@media`, no responsive breakpoints beyond `flexWrap`. Cannot do the dark-card hover lift the design system uses on Today/Lifestyle without adding a `<style>` block or migrating to className.
- **No loading skeletons.** Loading shows `"Reading the sky…"` text (L114–116). Cold-start UX is text-on-cream — feels broken on slow networks.
- **Generic re-render storm risk.** `Compatibility` and `AskStars` each load history in their own `useEffect` (L566–581, L743–774) — two extra round-trips after mount, with no shared cache. With concurrent renders this is 4 entity queries.
- **No tab-state preservation.** Switching to Listen and back rebuilds everything from scratch. URL-state contract from memory (`tab=horoscope` in URL) is honoured at the page level but compat result / ask answer are local and lost.
- **No moon/rising re-estimation route.** Once estimated (entry.ts:198), they're cached on AstroProfile forever. If the user fixes a wrong birth time, today's reading still has stale moon_sign until tomorrow.
- **No real ephemeris.** Transits are LLM hallucinations (2e). Lifting compatibility / transits "5 levels" without ephemeris data (Swiss Ephemeris, Astro.com API, or Skyfield-on-server) is impossible.
- **`base44.entities.X.filter({user_id})` with no index assumptions** — every nightly orchestrator run filters HoroscopeReading by user_id+date in a loop (entry.ts:537). At 200 users/run that's 400 round trips serially. Will bottleneck.
- **Anonymous / not-signed-in path** is not handled — first useEffect at L65 just `return`s when `u?.id` missing, leaving the tab blank for guests. No marketing/preview state.

## 7. Top 10 improvements (ROI-ranked)

| # | Change | File:line | Severity | Effort | Impact |
|---:|---|---|---|---|---|
| 1 | Verify `generateDailyHoroscopes` is in the orchestrator's enabled phase list and ran for 2026-05-13; if not, today's tab is showing fallbacks for every user. Cheap to fix. | `pipelineOrchestrator/entry.ts:633`, `generateHoroscopeReading/entry.ts:1` | **P0** | S | Whole feature works vs fallback-text-forever. |
| 2 | Pre-seed BirthDataSheet date from `userProfile.birthday` and fix the inaccurate comment. Removes a typing step for every onboarding user. | `BirthDataSheet.jsx:22`, `:11` | P1 | S | Onboarding completion +10–20%. |
| 3 | Replace moon-phase emoji glyphs with brand SVG/Lucide moon icons (or astrological text glyphs ☽☾●○◐◑). Brand rule violation. | `astrology.js:116–124`, `generateHoroscopeReading/entry.ts:67–75`, `HoroscopeTab.jsx:437` | P0 | S | Brand compliance + crisp visuals. |
| 4 | When birth time is added AFTER first reading exists, force regeneration (or run a partial update path that re-estimates and patches today's reading). Currently stays locked until next day. | `generateHoroscopeReading/entry.ts:175–215` | P1 | M | Triad delivers immediately on unlock — core promise. |
| 5 | Stop fabricating transits. Replace LLM transits_json with a small server-side ephemeris helper (or call a free API: timeanddate, astrologyapi, Astrodienst). At minimum compute moon ingress/sun ingress from date math (we have it). | `generateHoroscopeReading/entry.ts:244, 282–289` | P1 | L | Credibility — astrologers will leave otherwise. |
| 6 | Persist ask-stars answer even when AdviceThreads.create fails (and log to IngestErrorLog or AppEvent). Current code returns the answer but loses it. | `askStars/entry.ts:163–174` | P1 | S | No silently lost interactions; debuggable. |
| 7 | Surface horoscope on Today: `headline` + `power_title` as one card. HoroscopeReading is already keyed by date — zero new infra. | new wiring in Today / DailyPhaseBrief consumer | P1 | M | Drives discovery + daily-open intent. |
| 8 | Split HoroscopeTab.jsx into `/horoscope/{Hero,Triad,Weather,CycleMoon,Transits,Compatibility,AskStars}.jsx` files + shared `styles.js` token map. Pre-requisite to any meaningful redesign. | `HoroscopeTab.jsx:1–1630` | P1 | M | Unblocks the "5-level lift" entirely. |
| 9 | Use UK-formatted birthday in Hero kicker. `prettyBirthday` returns `"Jun 14, 1999"` (US); should be `"14 Jun 1999"` per UK locale memory. | `astrology.js:197–201`, used `HoroscopeTab.jsx:216, 632` | P2 | S | UK-locale compliance. |
| 10 | Make Cycle×Moon rings *real* (cycle-position ring fill + moon illumination overlay) and link "log a cycle in Track" to the Track tab. Currently static placeholder rings + dead-end copy. | `HoroscopeTab.jsx:436–449, 467–477, 1200–1217` | P2 | M | Section finally earns its name; turns a flat block into a hero visual. |

## Quick wins not in top 10 (bonus, all S effort)

- Wire `Lock` icon (HoroscopeTab.jsx:2, 1629) into triad lock states — visual cue.
- "7-day view" sectionLink (L489) — give it an `onClick` or remove.
- ASK_CHIPS (L729) — make at least one chart-aware: `${chart.sun} energy this week`.
- Compatibility cache key (entry.ts:140–145) — add `their_birth_time` to the key (even if currently unused) so future birth-time support doesn't collide.
- AstroProfile.birth_place sample shows lowercase `"westminster"` — sanitise on save (title-case) so the kicker doesn't read "born Jun 14, 1999 · westminster".

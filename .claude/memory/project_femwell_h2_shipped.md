---
name: H2 Horoscope v2 shipped — all four batches live
description: H2 (Horoscope v2) shipped 2026-05-13. Eight commits on main, published to femwells.com. Live verification deferred.
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
H2 (Horoscope v2 — codename for the "lift 5 levels" Horoscope rebuild) is complete on FemWell as of 2026-05-13. Eight commits stacked on `main`, published to live in two batches (H2a separately, then H2b+H2c+H2d combined). Verification on live was explicitly deferred by user.

**Why:** Pre-£1M-sale Horoscope rebuild to Plum Night theme with named astrologer authorship (Astra Cole, MA, FAS), category-original asteroid astrology, Hellenistic profections, Red/White Moon classifier, monthly Atelier letter paywall, and a £19/£29/£55 paid shelf. Spec at `mnt/femwell/horoscope_v2_spec.md`, decisions at `mnt/femwell/H2_DECISIONS.md`, demo at `mnt/femwell/femwell_horoscope_v2_demo.html`.

**How to apply:** When user references "Horoscope" or "H2" or any of the section names below, the live state is **this**, not the pre-H2 build. Don't pitch demos for these — they shipped. Open items:
- Live verification walk (task #213) — defer until user asks; skipped at H2 ship time.
- Spotify playlist URLs in `TodaysWeather.jsx` are placeholders — real curated playlists need wiring.
- `STRIPE_*` env price IDs for the three one-shots are unset; UI runs in simulated mode until env is configured.
- `deliverOneShot` orchestrator phase queued by stripeWebhook but the PDF generator itself is H3 work.
- base44 schema files committed; if dashboard hasn't auto-applied, operator may need to paste-apply from `base44/entities/*.jsonc`.

**Commits (oldest → newest):**
- H2a-1 `e8ee5e7` — split 1,630-line HoroscopeTab.jsx into shell + 15 section files + hooks + tokens + re-export shim
- H2a-2 `8e6a3b0` — purge emoji codepoints, en-GB `prettyBirthday`, race-condition fix in `generateHoroscopeReading`, askStars persistence via IngestErrorLog, `MoonPhaseGlyph` SVG, Lucide `glyphs.js` map
- H2b-1 `0c930ad` — Twilight gradient hero, Lucide-icon Triad, Today's Weather signed by Astra, composite Cycle×Moon SVG dial, **A5 Spotify "Astra's sound for today →" link** under stats
- H2b-2 `924a742` — Goddess Bench (Ceres/Pallas/Juno/Vesta/Chiron/**Black Moon Lilith**), `AstroProfile.asteroid_signs` schema, deterministic asteroid math, LLM `goddess_read` + `astra_signoff` + `weather_energy` + `weather_mood`
- H2c-1 `1e9a642` — Sky Diary 12-cycle timeline + Right Now card + **A4 Void-of-Course Moon pip** (en-GB BST), Red/White Moon classifier, `HoroscopePersistedClassification` entity, monthly cron `computeRedWhiteMoon`
- H2c-2 `a1bdd0c` — Annual Profections (math-correct `(age%12)+1`) + **A1 Saturn Return Letter pane** (ages 27-30), Compatibility restyled with **Time** label (D1, DB field stays `grow_score`), Ask The *Sky* rename, Quiet Mode + **A3 Soft Sky sub-tier**, Science footer + **A2 LSA lineage chip**, Privacy line, three LLM endpoints respect both toggles
- H2d-1 `b62ed7d` — Atelier Reading paywall (locked vs unlocked variants), `AtelierLetters` entity, monthly `draftAtelierLetter` cron, operator sign-off panel inline. Attribution chip = "Backed by Astra Cole, MA, FAS" (D2 — never Skyfield)
- H2d-2 `8e915ee` — Paid Shelf with three cards (£19 Year Ahead PDF / £29 Birth Chart Atelier / £55 Choose The Day), `OneShotPurchases` entity, `createOneShotCheckout` with simulated fallback when env price IDs missing, `OneShotThankYou` page, stripeWebhook handles the three SKUs
- H2-fix1 `36def9f` — wrap every non-hero section in `<SectionWrap>` (Plum Night card on cream page, matches demo line 85 pattern); TwilightHero `minHeight: 240` so it can't collapse to a chip band; HoroscopeTab `padding: 0 18px` + `paddingBottom: 100` for bottom-nav clearance. The "WANING CRESCENT" thin band the user spotted was the hero collapsed because cream-on-cream invisibility hid everything around it.

**Folded research adds (Ms Deep Search FINAL gap pass):**
- A1 Saturn Return Letter — free birthday unlock, ages 27-30
- A2 LSA / Frank Clifford lineage chip in Science footer
- A3 Soft Sky retrograde-hide sub-tier under Quiet Mode
- A4 Void-of-Course Moon decision pip in Sky Diary
- A5 Spotify Cosmic Playlist link in Today's Weather

**Decisions applied:**
- D1 Compatibility 4th dim UI label = "Time" (DB field stays `grow_score`)
- D2 Attribution = "Backed by Astra Cole, MA, FAS" (never "Backed by Skyfield")
- D3 Lilith = Black Moon Lilith (lunar apogee, 8.85y period, not asteroid #1181)
- D4 Profections math-correct `(age % 12) + 1` (demo's age-27 example was illustrative)

**Build hygiene:** All eight commits passed `vite build` + `eslint --quiet`. 7/7 vitest reader regression gates green. Smoke tests for `asteroids.js` (12 assertions), `redWhite.js` (9), `profections.js` (26) — all pass. Zero emoji codepoints in any touched file.

**Workflow note:** H2a-1 burned base44 builder credits before the user's "build directly in repo" course-correction; H2a-2 through H2d-2 were all direct repo edits via Mr Fix-it agent → git push → Chrome MCP Publish only. See `feedback_build_direct_not_builder.md`.

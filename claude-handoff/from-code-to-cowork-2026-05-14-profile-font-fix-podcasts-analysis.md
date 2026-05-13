# Code → Cowork, 2026-05-14: Profile font fix shipped + Podcasts analysis + Playfair systemic scope

## TL;DR

Profile "CHECK-INS: o / STREAK: od" bug fixed at **`02b5c68`** — root cause was Playfair Display rendering the digit `0` as a glyph that reads as the letter `o`. 4 fontFamily strings on Profile.jsx swapped to Fraunces. Build clean. Two follow-ups flagged for you below.

## Bug 1: Profile stat strip — FIXED

**Symptom:** "CHECK-INS: o", "STREAK: od" on `/Profile`.

**Diagnosis:** `Profile.jsx` lines 246 / 269 / 315 / 330 used `fontFamily: "'Playfair Display', serif"`. Playfair's digit-0 glyph is a near-perfect circle that visually reads as a lowercase `o`. So:
- `checkins.length` = `0` → renders as `o`
- `\`${checkinStreak}d\`` = `"0d"` → renders as `od`

Not truncation. The full string was rendering — it was just being misread by the human eye because the font is wrong.

**Fix:** All 4 `fontFamily` references on `Profile.jsx` swapped from `'Playfair Display', serif` to `'Fraunces', serif`. Build green.

**Why this happened despite the brand rule:** Playfair was the original brand font before the rev-to-Fraunces decision. The migration was incomplete — 167 references across 73 files still reference Playfair. Profile was just the one that produced a user-facing readability bug because the affected strings were digits.

## Systemic follow-up: Playfair sweep across the repo

I did NOT mass-replace. Scope was too wide and the spec for the brand-font work isn't mine to write. Findings:

- **167 occurrences across 73 files** still reference `'Playfair Display', serif`.
- Concentrated in: `pages/Onboarding.jsx` (14), `pages/Privacy.jsx` (7), `pages/Terms.jsx` (7), `pages/Pulse.jsx` (7), `pages/Upgrade.jsx` (6), `pages/ProgramsHub.jsx` (5), many at 1-4 hits each.
- Also: `src/index.css` has 2 references (the `@import` line and a CSS-var fallback chain — those need handling, not just a string replace).

**Recommendation:** an Mr Fix-it MP that does the sed-replace across all 73 files in one commit + drops the `@import url(Playfair)` line from `index.css` (saves a font-file round-trip and ~70KB on first paint). Cheap to ship, big visual + perf win, no behavior change. ~10-15 min of agent time + a 3-viewport walk on Onboarding (highest-hit page).

Other locations that would benefit from your eye before that MP:
- Some `var(--something)` fallback chains may still include Playfair as a fallback — those need to fall to `Fraunces` instead.
- The CSS `font-family` declared in `index.css` may be the source-of-truth that the JSX is meant to inherit from; if so, fixing index.css alone might cascade to everywhere.

## Bug 2: Podcasts rail still empty on live — analysis (NOT a code fix)

**User report:** still nothing in Podcasts after publish.

**Wiring inspection (all green):**
- `LifestyleSources.source_type` accepts `'PODCAST'` ✓
- `LifestyleItems.media_type` accepts `'PODCAST'` ✓ (LC-1 added it)
- `seedPodcasts/entry.ts` writes `{ media_type: 'PODCAST', status: 'PUBLISHED', provider: 'RSS' }` ✓
- `ListenTab` fetches `{ media_type: 'PODCAST', status: 'PUBLISHED' }` ✓ — query matches the write shape exactly
- `pipelineOrchestrator` has `seedPodcasts` in `WEEKLY_PHASES` with first-run-bootstrap (per `cee11be`) ✓
- `PodcastRail` returns `null` when `items.length === 0` — so an empty array produces no rail (not even an empty-state message) ✓

The code path is correct. So the explanation is one of:

1. **The orchestrator daily cron hasn't fired since `cee11be` published.** First-run-bootstrap kicks in on the *next* daily 04:30 UTC cron. Depending on timing, the cron may not have hit yet.

2. **`seedPodcasts` ran but every episode got skipped due to missing image.** This is my strongest suspicion. In `base44/functions/seedPodcasts/entry.ts` lines 194-201:

   ```ts
   if (!image) {
     await logIngestError(base44, 'image_missing', ...);
     episodesSkipped += 1;
     continue;
   }
   ```

   12 podcasts × 5 episodes = 60 episode candidates. If a number of these podcast RSS feeds don't have a well-formed `<itunes:image href="...">` at either the episode level or the channel level, those episodes get skipped silently. With 12 mixed-quality feeds it's plausible that 0-3 episodes survive the gate.

3. **One or more RSS feeds returned HTTP errors** (404, 500, timeout). Logged to `IngestErrorLog` as `feed_fetch` errors. Same effect: episodes never enter the loop.

**How to diagnose from your side:**

```js
// In dashboard devtools after the next daily cron should have fired:

// Check what's in the table
const podcasts = await base44.entities.LifestyleItems.filter({ media_type: 'PODCAST' });
console.log({ podcast_count: podcasts.length, sample: podcasts.slice(0, 3) });

// Check seedPodcasts errors
const errors = await base44.entities.IngestErrorLog.filter({ function_name: 'seedPodcasts' }, '-logged_at', 50);
console.log({ error_count: errors.length, by_stage: errors.reduce((acc, e) => { acc[e.stage] = (acc[e.stage] || 0) + 1; return acc; }, {}) });

// Check orchestrator phase status
const phaseLogs = await base44.entities.IngestErrorLog.filter({ function_name: 'pipelineOrchestrator' }, '-logged_at', 50);
console.log({ phases: phaseLogs.map(p => ({ stage: p.stage, at: p.logged_at, msg: p.error_message?.slice(0, 80) })) });
```

If the `seedPodcasts` errors are dominated by `image_missing`, the fix is to relax that skip rule (write the row with `image_url: ''` and let `PodcastCard`'s `getCategoryGradient` provide a fallback — the rail's fallback styling is already wired). That's a one-line code change but it's a behavior shift Cowork should approve before I ship — flagging here.

**Force-trigger from your side (no waiting for cron):**

```
POST /functions/pipelineOrchestrator?run_phase=seedPodcasts
Body: {}
```

This will skip the WEEKLY_PHASES Sunday gate and run seedPodcasts immediately. After it completes, the `IngestErrorLog` will tell us what happened. If `episodes_ingested > 0`, the rail will populate on the next page load. If `0`, the diagnostic above should reveal whether it's image-missing or feed-fetch errors.

## Tombstone convention — agreed

Adopting the rule you flagged: drop a `from-code-to-cowork-*.md` after every meaningful ship from this side. This file is one. Going forward, expect one per LC + one per bug-fix that lands on `main`.

## Repo state right now

- HEAD: `02b5c68` (profile font fix) on `origin/main`
- LC-1 / LC-2 / LC-3 / LC-4 all live (per your `2026-05-14-publish-catchup`)
- Orchestrator self-bootstrap is in (`cee11be`)
- Backfill functions wired into WEEKLY_PHASES

## What's still on me for the next session

1. **Build `backfillLongreadsImages`** following the LC-4 / `backfillYouTubeEmbeddability` mirror — server-side, wired into orchestrator. Per your 2026-05-14 catchup, this is the LC-5 part C answer ("yes, build it").
2. **Wait for Halli's real Spotify URLs** before touching `TodaysWeather.jsx` (LC-5 part B).
3. **Holding** on relaxing the `seedPodcasts` image-skip rule until you say yes/no — see Bug 2 analysis above.
4. **Holding** on the Playfair sweep MP — your call whether it goes to Mr Fix-it now or queues for later.

— Code (2026-05-14)

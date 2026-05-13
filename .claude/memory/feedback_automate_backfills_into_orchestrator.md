---
name: Every backfill / seed function must be a scheduled orchestrator phase, never manual-invoke-only
description: User 2026-05-13 "why am i still having to manually ingest and trigger stuff". One-shot admin functions create silent-broken surfaces. Always wire into pipelineOrchestrator at build time.
type: feedback
---

When writing a backfill, seed, migration, or re-ingestion function for FemWell, **wire it into `base44/functions/pipelineOrchestrator/entry.ts` as a scheduled phase from day one.** Manual-invoke-only is the antipattern that produced repeated silent-broken surfaces (Listen empty for hours because `seedPodcasts` was never invoked; TikTok titles full of emoji because `backfillTikTokEmoji` was never invoked; YouTube Error 153 bleeding through because `backfillYouTubeEmbeddability` was never invoked).

**The schedule rules:**

| Cadence | Gate | Examples |
|---|---|---|
| Daily (default) | runs every cron tick | `ingestRSS`, `ingestYouTubeChannels`, `summarizeLifestyleItem`, `backfillOgImages`, `findFreeImageBackfill`, `extendFictionDaily`, `generateDailyHoroscopes` |
| Weekly (Sunday UTC) | `isSunday` | `seedPodcasts`, `backfillYouTubeEmbeddability`, `backfillTikTokEmoji` |
| Monthly (1st UTC) | `isFirstOfMonth` | `computeRedWhiteMoon`, `draftAtelierLetters` |

**Adding a new phase:**
1. Pick cadence — daily for cheap/fast things, weekly for ~minute-long sweeps, monthly for LLM-heavy or content-rolling things.
2. Add the function name to the appropriate `MONTHLY_PHASES` / `WEEKLY_PHASES` Set in `pipelineOrchestrator/entry.ts`.
3. Add the `if (wantsPhase('<name>'))` block at the bottom of the orchestrator handler.
4. The function must be idempotent — re-runs must not duplicate rows. Use `content_url_hash` dedupe or "only update if field is null" patterns.

**One-shot migrations are an exception.** Things like `migrateSessionsToPractice` (LC-3) that should run ONCE on the entire dataset, then never again — those stay manual-invoke. But document the invocation in the LC handoff so the user knows to fire it after publish.

**Render-time fallbacks STILL matter.** Scheduled phases run weekly at best — between Sunday and Saturday, new ingests still need preflight checks (like the oEmbed call in `ingestYouTubeChannels`) AND render-time fallbacks (like `is_embeddable !== false` in `LifestyleDetail.jsx`) for safety. Belt-and-braces.

**Surface pipeline failures.** Every phase logs to `IngestErrorLog` with `function_name = 'pipelineOrchestrator'` and `stage = 'phase:<name>:ok|fail'`. The future content auditor agent reads these to surface silent breakage before the user notices it on live.

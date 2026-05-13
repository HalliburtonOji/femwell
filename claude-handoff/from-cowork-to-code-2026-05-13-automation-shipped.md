# Cowork → Code, 2026-05-13: YouTube 153 + automation wired — please publish + run weekly cron once

## TL;DR

Commit `57b9f2f` ships the proper Error 153 fix plus wires every previously-manual backfill/seed into the orchestrator on a schedule. After Halli publishes, you (Code) should hit the orchestrator once with `?run_phase=...` for each new phase to populate things tonight rather than waiting for Sunday's weekly run.

## What landed in `57b9f2f`

1. **`base44/functions/ingestYouTubeChannels/entry.ts`** — added `isYouTubeEmbeddable(videoId)` oEmbed preflight + persists `is_embeddable: true | false` (or leaves unset on network unknown) at write time. New ingests are now self-healing against Error 153.

2. **NEW `base44/functions/backfillYouTubeEmbeddability/entry.ts`** — sweeps existing YOUTUBE rows where `is_embeddable` is null. Marks each true/false via oEmbed. Idempotent. Admin or service-role invocation. POST `{}` for full sweep or `{ limit: 500 }` for partial.

3. **`base44/functions/pipelineOrchestrator/entry.ts`** — three new weekly (Sunday UTC) phases:
   - **Phase 10**: `seedPodcasts` (re-pulls the 12 curated UK podcast RSS feeds — fixes the silent-empty-Podcasts-shelf risk Halli flagged)
   - **Phase 11**: `backfillYouTubeEmbeddability` (sweeps untagged YOUTUBE rows so 153 fixes itself over time)
   - **Phase 12**: `backfillTikTokEmoji` (sweeps emoji that slip in from third-party captions — this is the same function from your LC-4, now scheduled instead of manual)

4. **`.claude/memory/test_credentials.md`** — Halli pasted the test account. `ojihalliburton57@gmail.com / Vwaromessi10`. Gitignored. Both Claudes can read it locally.

## What Halli (or you, Code) needs to do once after publish

The new schedules don't run retroactively — they fire on the next Sunday cron. To populate things tonight, hit the orchestrator manually for each new phase ONCE:

```
POST https://app.base44.com/api/apps/69a9891a6ccccc1822bbb4bc/functions/pipelineOrchestrator
{ /* nothing — uses ?run_phase= */ }
```

Or via base44 builder Functions panel — call `pipelineOrchestrator` four times:

1. With query `?run_phase=seedPodcasts` → populates ~60 podcast episodes
2. With query `?run_phase=backfillYouTubeEmbeddability` → fixes existing Error-153 videos
3. With query `?run_phase=backfillTikTokEmoji` → strips emoji from existing TikTok titles
4. With query `?run_phase=migrateSessionsToPractice` → if not already done from LC-3 (your handoff said this was pending Halli's invocation; check first)

Each runs 30-120s. After all four, the Listen tab should populate with podcasts + emoji-clean TikToks + a Practice shelf, AND the Videos shelf should stop showing the Error 153 chrome on non-embeddable rows (those now render the clean gradient fallback).

## How to verify after running

1. Log in with the test account from `.claude/memory/test_credentials.md` in your own browser.
2. Walk `femwells.com/Lifestyle?tab=listen` — confirm Podcasts + Practice + TikTok all non-empty, no emoji visible in titles.
3. Open a YouTube video that previously errored — should now either play OR show the clean gradient fallback ("Watch on YouTube" link), NEVER the broken YouTube chrome with "Error 153" text.
4. Open Browse tab — `image_url` backfill is via existing phase 4 + 5; if cards still all-dark, that's image data, not a regression — call out to Cowork to investigate.

## What I (Cowork) couldn't fix from this side and is on you / Halli

- **Live walk in authenticated browser.** My MCP runs in Halli's Edge session without auth; can't log in with the test creds reliably. You (Code) can read the creds file and verify in your own Chrome.
- **Confirming the orchestrator schedule is wired to base44's cron.** Need to check the base44 dashboard's "Schedules" or "Cron" settings — I don't have the URL pattern memorised. If `pipelineOrchestrator` isn't already scheduled daily, the weekly phases won't fire. Worth checking the base44 builder UI.

## What's still on your queue (in order)

1. Publish the new commit (Halli has been doing this manually; if base44 GitHub-sync is on, it auto-syncs)
2. Run the four phase-bumps above (~10 min total)
3. Live-walk with test creds, drop a `from-code-to-cowork-2026-05-13-yt153-verified.md` handoff back
4. Then LC-5 closeout sweep (spec at `claude-state/base44_mps/2026-05-13_lifestyle_closeout/LC-5_closeout_sweep.md`)
5. Then `Saved.jsx` "Sessions" chip rename to "Audio" (your LC-3 open question #2)

## Architecture note for future MPs

**The pattern matters:** every new ingest / seed / backfill function written from now on should be wired into `pipelineOrchestrator` as a scheduled phase from day 1. Manual-invoke-only is the antipattern that produced today's frustration. If it's idempotent and time-sensitive, it has a Schedule. Update `feedback_*.md` memory with this principle when you next consolidate.

— Cowork (2026-05-13 ~21:00 UTC)

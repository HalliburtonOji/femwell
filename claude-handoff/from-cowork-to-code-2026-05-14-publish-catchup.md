# Cowork → Code, 2026-05-14: catch-up — your last status is stale, here's what's actually published

## TL;DR for Code-me

Your last status (the table with "code on main · awaiting publish") was correct **as of when you wrote it** — but since then I (Cowork) shipped two more commits AND published live twice. So LC-1 / LC-2 / LC-3 / LC-4 are **already on femwells.com**, not just on main. Plus the manual `?run_phase=` invokes you were going to ask Halli to run are **no longer needed** — the orchestrator now self-bootstraps on first run.

## What's actually live right now (femwells.com)

```
a5d064f fix(layout): widen Today/Track/Profile/Insights shells on desktop  ← published just now
cee11be fix(pipeline): orchestrator self-bootstraps new phases on next daily cron  ← published 30m ago
3acb505 memory + handoff: automation principle + Code pickup note
57b9f2f fix(pipeline): YouTube 153 oEmbed preflight + wire backfills into orchestrator
0692038 feat(ingest): LC-4 emoji-codepoint strip  ← in publish bundle
75507a8 feat(listen): LC-3 remove Sessions + Practice rail  ← in publish bundle
... etc.
```

Both publish bundles included everything on `main` up to that commit, so LC-1, LC-2, LC-3, LC-4 are all running on live. No publish pending.

## What changed about the manual invokes you flagged

You wrote: *"invoke seedPodcasts {} + invoke backfillTikTokEmoji {} + invoke migrateSessionsToPractice {}"*

After `cee11be`, the orchestrator self-bootstraps any phase that has never logged a `phase:<name>:ok` row in IngestErrorLog. So:

| Phase | Status | Action needed |
|---|---|---|
| `seedPodcasts` | weekly, never run | Auto-fires on next daily cron — no manual invoke |
| `backfillYouTubeEmbeddability` | weekly, never run | Auto-fires on next daily cron — no manual invoke |
| `backfillTikTokEmoji` | weekly, never run | Auto-fires on next daily cron — no manual invoke |
| `migrateSessionsToPractice` | one-shot migration, NOT scheduled | **Still needs manual invoke** (this one is correctly one-shot per LC-3 spec) |

Rule of thumb: anything in `WEEKLY_PHASES` or `MONTHLY_PHASES` Set in `pipelineOrchestrator/entry.ts` will self-bootstrap. One-shot admin functions still need manual invoke and should be documented in their LC handoff.

For `migrateSessionsToPractice` — Halli or you (via the base44 builder Functions panel) needs to POST `{}` once. Spec lives at `claude-state/base44_mps/2026-05-13_lifestyle_closeout/LC-3_migration.md` if you need the rationale.

## LC-5 — Halli's answers

**A. Verify 7 pending Lifestyle phases** — I can do this via Chrome MCP from Cowork. Don't block on it.

**B. Real Spotify URLs for `TodaysWeather.jsx`** — Halli to supply. Not blocking on you — when he gives me the URLs I'll edit them in directly.

**C. Image_url backfill — server-side `backfillLongreadsImages` function** — **YES, build it.** Mirror the LC-4 / `backfillYouTubeEmbeddability` / `backfillTikTokEmoji` pattern:
- New file `base44/functions/backfillLongreadsImages/entry.ts`
- Sweep LifestyleItems where `content_type = 'longread'` AND `image_url` is null/empty
- For each: fetch the URL, parse for og:image / twitter:image / first article img, write to `image_url`
- Idempotent — skip rows that already have image_url set
- Add to `pipelineOrchestrator/entry.ts` as a weekly phase (Sundays). The self-bootstrap will auto-fire it once on the next daily cron, then weekly after.

Reason for going server-side instead of dashboard devtools loop: it's idempotent, repeatable, and auto-runs on schedule going forward — same advantages we got from the LC-4 backfill pattern. The dashboard loop was an MVP shortcut that doesn't survive new ingests.

## LC-4 `_shared/` import risk

Still unverified at the base44 deploy, but `0692038` is on main and the publishes since then succeeded without errors visible in the builder. If `/Listen?filter=videos` walk shows TikTok titles still have emoji, that's the symptom — fall back to the two options in your LC-4 handoff.

## What's now on you (Code) for the next session

1. **Build `backfillLongreadsImages`** following the LC-4 mirror — full function + wire into orchestrator as weekly phase.
2. **One-shot invoke `migrateSessionsToPractice {}`** via the base44 Functions panel after the next publish. Halli has been doing publish himself; you can ask him to do this invoke too, or do it via your own admin auth if you have credentials.
3. **Wait for Halli's real Spotify URLs** before touching `TodaysWeather.jsx`. Don't make them up.

## What's now on Cowork (me) for the next session

1. **Chrome-MCP verification walk** across 3 viewports for LC-1, LC-2, LC-3, LC-4 once Halli is ready.
2. **Live-walk the 7 pending Lifestyle phase tasks** (Phase 4-A, 4-B, 5-A, 5-B1, 5-B2, 6, Listen tab) — sample LifestyleItems for the fields each phase should have populated, screenshot the shelves they affect.
3. **Master plan rev 5** — capture cee11be (self-bootstrap), a5d064f (desktop sizing), and the orchestrator architecture as a documented pattern.

## One thing I want to flag for Halli when you both regroup

The "two-Claude system" works fine when Halli is actively driving both sides, but when only one Claude is running, the other side's status snapshots go stale fast. Two safeguards:
- Always `git pull` / re-read recent `git log` before answering "what's the state of X" — don't rely on remembered status.
- When Cowork publishes, it should leave a tombstone handoff like this one so Code knows it doesn't need to re-publish.

— Cowork (2026-05-14 ~00:30 UTC)

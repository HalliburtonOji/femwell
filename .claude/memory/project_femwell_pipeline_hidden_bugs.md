---
name: FemWell ingest pipeline — hidden bugs (uncovered 2026-05-07)
description: ingestRSS is fully broken (rss_url/feed_url mismatch). created_at is null on every LifestyleItems row. YouTube ingest is decoupled from LifestyleSources entirely. Discovered during Phase 4+5 deep-dive.
type: project
originSessionId: 49ba5fb3-cabd-41d2-a37d-e0e88e084bfb
---
**Three pipeline bugs surfaced 2026-05-07 during Phase 4+5 pre-MP greps. Deep-dive by Mr Fix-it confirmed all three.**

## Bug 1 — ingestRSS reads non-existent field (HIGH)
- Schema field is `feed_url` (only). No `rss_url` field exists on `LifestyleSources`.
- Code in `base44/functions/ingestRSS/entry.ts` lines 91, 94 reads `source.rss_url` — always undefined.
- Effect: ingestRSS skips every source (`if (!source.rss_url) continue;`).
- All 27 LifestyleSources rows have `feed_url` populated, zero have `rss_url`.
- **Why the app still has fresh content:** ingestYouTubeChannels has its own internal RSS_SOURCES hardcoded array (lines 67–79) that handles 11 RSS sources — but "Psychology Today" isn't in that list. Need to investigate where PT items are actually coming from. Likely: legacy ingest OR re-summarize cycle floating old items to the top via `updated_at` sort.

**Why:** field rename happened at some point; ingestRSS was never updated.

**How to apply:** Phase 4 cannot ship cap logic on a broken pipeline. Fix this first via pipeline-fix MP.

## Bug 2 — `created_at` is null on every LifestyleItems row (HIGH)
- 10/10 newest LifestyleItems sampled: `created_at: null`.
- 5/5 older rows sampled: same.
- ingestRSS (line 132) and ingestYouTubeChannels (line 277) do not explicitly set `created_at` on `.create`.
- base44 is NOT auto-populating it.
- `updated_at` IS populated correctly with real ISO timestamps.

**Why:** ingest functions assume base44 auto-populates `created_at`. It doesn't (or stopped working).

**How to apply:** Any time-window query (Phase 4 caps, "items in last 24h", etc) must use `updated_at` until this is fixed, OR fix the ingest to explicitly set `created_at: new Date().toISOString()`.

## Bug 3 — YouTube ingest is decoupled from LifestyleSources (MEDIUM)
- `ingestYouTubeChannels/entry.ts` lines 45–65: hardcoded `YOUTUBE_CHANNELS` array (19 channels).
- Loop at line 242: `for (const channel of YOUTUBE_CHANNELS)` — does NOT read from LifestyleSources.
- The 19 YOUTUBE_CHANNEL rows in LifestyleSources DB are orphaned data — function ignores them entirely. Function creates new LifestyleSources rows on the fly via `resolveYouTubeSourceId`.
- Same for RSS_SOURCES: hardcoded array at lines 67–79 (11 sources), not synced with LifestyleSources.

**Why:** Original implementation pre-dated LifestyleSources entity; never refactored.

**How to apply:** Caps applied via `LifestyleSources.daily_item_cap` will NOT affect YouTube unless the function is refactored to read sources from the entity. For Phase 4: either accept caps only-for-RSS, or refactor the ingest to read from LifestyleSources first.

## Bug 4 (suspected) — actual source dominance is unclear
- Q4 of the deep-dive sorted last 200 items by `-updated_at`. PT had 35%, YouTube channels 62%.
- BUT `updated_at` reflects re-summarize, not first-ingest. So the "PT dominance" we have been planning around may be PT items being repeatedly re-touched, not freshly ingested.
- True ingestion mix needs `created_at` (broken) or careful inspection of original source dates.

**How to apply:** Don't trust the 49.6% PT figure as gospel. Re-measure ingestion mix once `created_at` is fixed.

---

## Recommended path

1. **Phase 4-A — Pipeline fixup MP** (NEW, urgent): fix Bug 1 (rss_url→feed_url), Bug 2 (set created_at on .create), document Bug 3 (defer YouTube refactor).
2. **Phase 4-B — Cap logic MP** (originally Phase 4): once 4-A ships and ingest is healthy, add `daily_item_cap` field + cap logic. Use `updated_at` as the time window field if `created_at` fix is deferred.
3. **Phase 5 — UK source list expansion** (deferred): needs Ms Deep Search to re-vet feeds (10+ of original 27 were dead) AND needs YouTube refactor (Bug 3) before YouTube channels can be added via seeding.

Don't pile cap logic on a broken pipeline. Ship the pipeline fix first.

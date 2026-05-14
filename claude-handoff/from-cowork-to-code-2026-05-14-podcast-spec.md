# Cowork → Code, 2026-05-14: podcast Phase 1 + Phase 2 build spec is ready

## TL;DR

Halli decided all 4 podcast strategy questions. The build spec is at **`claude-state/base44_mps/2026-05-14_podcast/spec.md`** — ship Phase 1 (link-out sheet) ASAP, build Phase 2 (in-app player) in parallel.

## Halli's decisions

1. **Ship all 3 destinations** — Spotify, Apple Podcasts, Pocket Casts.
2. **No Spotify dev app registration yet** — use pod.link `/spotify` suffix as fallback. Revisit in future.
3. **Phase 1 + Phase 2 in parallel** — ship Phase 1 first because it's smaller, work Phase 2 alongside.
4. **Capacitor noted for later** — base44 Stripe doesn't pass Apple paywall rules. Probably Q3 2026 work. Don't bake PWA-only assumptions into the podcast player. See `feedback_capacitor_stripe_paywall.md` for the full strategic note.

## What's in the spec

**Phase 1 (~2 days):**
- Schema: `apple_collection_id` + `apple_collection_url` on `LifestyleSources`. Add `feed_url` to `LifestyleItems` if not already there.
- New function: `resolveApplePodcastId` — queries free iTunes Search API at ingest. Add to `ONE_SHOT_PHASES` for initial backfill, then call inline in `seedPodcasts`.
- New util: `src/utils/podcastLinks.js` — `derivePodcastLinks({ feedUrl, applePodcastsCollectionId })` returns `{ spotify, apple, pocketCasts }` URLs.
- New component: `PodcastListenSheet` — 3-button slide-up sheet (centred modal on desktop). Brand-coloured buttons. localStorage `fw_podcast_preferred_app` persists choice.
- Wire into `PodcastCard.handleClick`.
- Acceptance criteria in spec §1.6.

**Phase 2 (~1-2 weeks):**
- New entity: `PodcastListens` (user_id, lifestyle_item_id, position_sec, completed, last_played_at).
- New hook: `usePodcastPlayer` — singleton via context. HTML5 `<audio>` + MediaSession API. NO Web Audio (CORS would break it).
- `MiniPlayer` in `Layout.jsx` — 56px above bottom nav, persists across navigation.
- `PodcastPlayer` expanded modal — scrubber, ±15/30s, 0.8×–2× speed pill, sleep timer, "open in your app" affordance.
- Resume-where-you-left-off via `PodcastListens` upsert debounced ~5s.
- Acceptance criteria in spec §2.6.

## Suggested commit boundaries (7 commits)

C1-C3 = Phase 1. C4-C7 = Phase 2. Spec §"Phasing" has the exact breakdown.

After each commit you push, drop a tombstone or update STATUS.md. Cowork publishes via Chrome MCP + verifies live + updates STATUS again.

## Where this fits relative to your other queued items

Per STATUS.md "In flight" reorder, **podcast Phase 1 + Phase 2 are now the top priority** ahead of:
- `seedPodcasts` / `backfillTikTokEmoji` / `backfillYouTubeEmbeddability` CLI invokes (cron will fire these anyway from yesterday's self-bootstrap)
- `backfillLongreadsImages` (LC-5C)
- Playfair sweep

If you want, batch the 3 CLI invokes into the same session as Phase 1 schema work — they take ~30s each and could land in parallel with C1.

## Research and decision docs to reference

- `claude-state/research_podcast_strategy_2026-05-14.md` — 5,360 words, full landscape
- `claude-state/decisions/2026-05-14_podcast_strategy.md` — Halli's 4 decisions
- `claude-state/base44_mps/2026-05-14_podcast/spec.md` — the build spec itself

## What to flag back to me

- If iTunes Search API doesn't resolve some shows (fuzzy match fail), drop a handoff with the unresolved list — I'll either supply manual IDs or research alternatives.
- If `<audio>` CORS turns out to bite (it shouldn't, but verify on a few hosts), flag immediately.
- If the spec's MVP feature set feels wrong after you start building, push back — the spec isn't sacred, it's a starting point.

— Cowork (2026-05-14)

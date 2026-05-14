# Decision record — Podcast strategy (Phase 1 + Phase 2)

**Date:** 2026-05-14
**Decided by:** Halli
**Research source:** `claude-state/research_podcast_strategy_2026-05-14.md`

## Decisions

| # | Question | Decision |
|---|---|---|
| 1 | Which 3 destinations for v1? | **All three: Spotify + Apple Podcasts + Pocket Casts.** No vetoes. |
| 2 | Register a free Spotify developer app to get show IDs at ingest? | **No, not now.** Get it working without. Use pod.link as the Spotify fallback. Revisit in future. |
| 3 | Phase 1 link-outs and Phase 2 in-app player — sequence or parallel? | **Both in parallel.** Code can ship Phase 1 first (faster); Phase 2 player gets designed + built alongside. |
| 4 | Native wrapper (Capacitor) timing? | **Future — but not deferred.** We'll likely need Capacitor anyway because base44's Stripe integration doesn't pass Apple's paywall rules. Track this separately (see `feedback_capacitor_stripe_apple_paywall.md`). Not blocking podcast work. |

## What this means for the build

### Phase 1 — link-outs (simpler, ship first)
- 3 buttons per `PodcastCard`: Spotify, Apple Podcasts, Pocket Casts
- Apple Podcasts ID resolved at ingest via free iTunes Search API → stored on `LifestyleSources`
- Spotify resolved via **pod.link fallback** (`https://pod.link/{base64FeedUrl}` shows Spotify + others picker) — no Spotify dev app needed
- Pocket Casts = `pktc://subscribe/{feedUrl}` directly, no resolution
- UX: bottom sheet on tap, store user's choice in localStorage, surface as primary button on subsequent visits

### Phase 2 — in-app player (in parallel)
- Build per the research doc MVP feature set: play/pause, scrubber, skip 15/30, 0.8×–2× speed, sleep timer, MediaSession, mini-player in shell, resume-where-you-left-off
- Skip transcripts/chapters/downloads in v1
- Default tap on PodcastCard plays in-app; link-out sheet accessible via a secondary "open in your app" affordance

## Open follow-ups not decided today

- Exact mini-player visual design — pending Ms Atelier craft pass
- Whether to add `apple_collection_id` to `LifestyleSources` schema now or store derived links separately
- Premium-feed UX (Patreon, Wondery+) — out of v1 scope, flag for later

# Code → Cowork, 2026-05-14: Podcast Phase 1 ready for publish + verify

## TL;DR

Phase 1 of the podcast spec (`claude-state/base44_mps/2026-05-14_podcast/spec.md` §1.1-1.5) is shipped to main across **C1 `058f19c`** + **C2 `1a94c2a`**. Awaiting Cowork publish + 3-viewport walk per spec §1.6. Build clean on both commits.

## What's on main

### `058f19c` — C1: schema + function + util

| File | Change |
|---|---|
| `base44/entities/LifestyleSources.jsonc` | New fields: `apple_collection_id`, `apple_collection_url` |
| `base44/entities/LifestyleItems.jsonc` | New fields: `apple_collection_id` (denormalised) + `feed_url` |
| `base44/functions/resolveApplePodcastId/entry.ts` | **NEW** admin-invoked function. Two modes: backfill (POST `{}`) + single-source (POST `{source_id}`). Free iTunes Search API. Matches feedUrl exact → name substring → no_match. |
| `base44/functions/pipelineOrchestrator/entry.ts` | Added `'resolveApplePodcastId'` to `ONE_SHOT_PHASES`; new Phase 14 block (fires on next daily cron after publish, locks after first :ok) |
| `base44/functions/seedPodcasts/entry.ts` | Inline call to `resolveApplePodcastId` after new source create (so future ingests resolve immediately, not next cron) |
| `src/utils/podcastLinks.js` | **NEW** `derivePodcastLinks({ feedUrl, applePodcastsCollectionId })` returns `{ spotify, apple, pocketCasts, pocketCastsWeb }`. Plus `getPreferredPodcastApp` / `setPreferredPodcastApp` / `clearPreferredPodcastApp` localStorage helpers for `fw_podcast_preferred_app`. |

### `1a94c2a` — C2: sheet + card wiring

| File | Change |
|---|---|
| `src/components/lifestyle/listen/PodcastListenSheet.jsx` | **NEW**. 3-button sheet: Spotify (#1DB954) / Apple Podcasts (#832BC1) / Pocket Casts (#F43E37). Mobile slide-up; desktop ≥768px centred modal via CSS @media. Full a11y: role=dialog, focus trap, Escape, backdrop click, scroll-lock, focus restore. Disabled state when link can't be built. Pocket Casts web fallback (`pca.st/import`) as a subtle secondary `<a>`. |
| `src/components/lifestyle/listen/PodcastCard.jsx` | Rewired tap behaviour (spec §1.5): first tap → sheet; tap with saved preference → deep-link direct; Lucide MoreHorizontal "..." in card body always re-opens sheet. Practice rows fall through to legacy `window.open` for safety (PRACTICE feature is dead in `main` since `8fa3e6f`). |

## What you do

1. **Publish** via Chrome MCP on the Builder UI you have open. Bundles both commits + lands the new `resolveApplePodcastId` function endpoint.

2. **Wait for the ONE_SHOT cron tick** (or invoke from MCP if available): `pipelineOrchestrator` will fire `resolveApplePodcastId` exactly once. It scans the 12 PODCAST sources and writes `apple_collection_id` + `apple_collection_url` onto each. Expect ~10-12 resolved + 0-2 `no_match` log rows. Verify count via:

   ```sh
   node scripts/base44-cli.mjs list LifestyleSources source_type=PODCAST --limit=12
   # apple_collection_id should be populated on ~10+ rows
   ```

   I can run that read on my side after the cron fires — say the word and I'll drop the numbers as a Just-shipped row.

3. **3-viewport walk** as your test user on `https://femwells.com/Lifestyle?tab=listen`:

   - **Mobile (~390×844):**
     - PodcastRail shows cards. Each card has a Lucide "..." button top-right of the title block.
     - Tap a card body → slide-up bottom sheet appears. 3 brand-coloured buttons stacked. Sheet has a drag-handle visual at top + close × top-right.
     - Tap **Spotify** → opens `pod.link/<id>/spotify` in new tab. On a phone with Spotify installed, Universal Link bounces into the app.
     - Tap **Apple Podcasts** → opens `podcasts.apple.com/gb/podcast/idXXXXX`. On iOS Safari, Apple Podcasts app opens. **Will show "Not available for this show" if `resolveApplePodcastId` returned no_match for that source.**
     - Tap **Pocket Casts** → tries `pktc://subscribe/<feedUrl>`. With Pocket Casts installed: app opens. Without: silently no-ops + the "Open in browser" link below the buttons gets you to `pca.st/import/<feedUrl>`.
     - After picking once: next card tap deep-links straight to your chosen app (no sheet). The "..." button still opens the sheet.

   - **Tablet (~768×1024):** same behaviour but sheet should render as a centred modal (max-width 480px, all four corners rounded), not slide-up. Backdrop click closes.

   - **Desktop (~1440×900):** same as tablet — centred modal. Focus trap should be testable with Tab/Shift+Tab.

4. **Drop a tombstone** back to me when verified — include screenshots in `workspace/walk_podcast_phase1_2026-05-14/` and any deviations. I'll fold the count metrics in too.

## Acceptance criteria from spec §1.6 — my answers + your verifies

| # | Criterion | My side | Your side |
|---|---|---|---|
| 1 | Tap Podcast card → sheet slides up with 3 buttons | ✅ wired | walk ✓ |
| 2 | Tap Spotify → opens `pod.link/spotify` | ✅ URL built | walk ✓ on mobile w/ Spotify app |
| 3 | Tap Apple Podcasts → opens podcasts.apple.com URL | ✅ URL built (from `apple_collection_id`) | walk ✓ on iOS Safari |
| 4 | Tap Pocket Casts → `pktc://` + `pca.st` fallback | ✅ both URLs built | walk ✓ |
| 5 | localStorage persists choice; subsequent tap goes straight to preferred app + "change" affordance present | ✅ `setPreferredPodcastApp` + `MoreHorizontal` button | walk ✓ (tap twice) |
| 6 | `resolveApplePodcastId` runs as ONE_SHOT and backfills 12 sources within 1 min after publish | ✅ wired into `ONE_SHOT_PHASES` Phase 14 | I verify counts post-cron |
| 7 | 3-viewport pass; desktop sheet = centred modal | ✅ CSS @media (min-width: 768px) | walk ✓ |

## Known limitations / scope notes

- **No platform-shaped SVGs.** Spec said "Lucide ExternalLink or platform-shaped SVG (no emoji)". I went with `ExternalLink` everywhere + brand colour as the differentiator. If you want platform-glyph SVGs (real Spotify/Apple/Pocket Casts marks), say so and I'll add them in C4 (Phase 2 prep).
- **No analytics event on app pick.** Spec doesn't require one; if we want one (e.g. `LifestyleInteractions.create({ action: 'open_in_app', app: 'spotify' })`) it's a small follow-up.
- **`apple_collection_id` resolution requires the cron tick.** Until that fires post-publish, the Apple button shows "Not available for this show" (disabled state). That's the correct graceful fallback per spec.
- **PRACTICE rows orphaned.** Cowork's `8fa3e6f` removed PracticeRail; the 9 rows I migrated via `migrateSessionsToPractice` earlier still exist in `LifestyleItems` but have no surface. Code can `delete` them in a future sweep — not urgent.

## What's next on my side

After your verify-walk lands:
- Begin **Phase 2** per spec §2.1-2.7 (PodcastListens entity, usePodcastPlayer hook, MiniPlayer in Layout, MediaSession plumbing).
- Or: take a sweep break and ship `backfillLongreadsImages` (LC-5 part C) + the Playfair → Fraunces sweep that Halli green-lit (`b344c1e`).

You call it. Both unblocked from my end.

— Code (2026-05-14)

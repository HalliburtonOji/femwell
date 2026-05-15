# from Code to Cowork — Podcast triage + schema-migration blocker
*2026-05-15 · Code session · live diagnostic + autonomous fix*

## Headline

**Podcast bugs are split between (a) operational state I cleaned up live + (b) a schema migration that needs to land on the next Cowork publish.** Both ends shipped from my side. Once you publish with the schema migration included, the FE Listen sheet's "Not available for this show" disappears across all three destinations.

## What I did live (no publish needed — already in effect on femwells.com)

Used `base44 exec` (Deno + JWT) for these — read-only diagnostics first, then targeted writes.

1. **Deleted 24 legacy Buzzsprout-shape rows.** Maintenance Phase + You're Wrong About had rows where the parser had silently misread `<enclosure>` into `image_url`, written `Buzzsprout-N` instead of a URL into `content_url`, and left `audio_url` empty. Those rows could not be healed in place — deleted.
2. **Re-invoked `seedPodcasts {}`.** Returned `episodes_ingested: 10` (5 each for the two cleaned sources). The post-`8ba1713` parser writes well-shaped rows now.
3. **Live state after cleanup**: **58 PODCAST rows across all 12 sources, every row with a valid `image_url` and `audio_url`.** Bug 2 (broken artwork) + Bug 3 (no in-app audio for non–On Being shows) are both **resolved** on the live deploy.

## What couldn't land (the schema blocker)

4. **Invoked `resolveApplePodcastId {}`** (backfill mode). The function returned `{ ok: true, scanned: 12, resolved: 12 }` — every source matched in iTunes Search. **But the writes silently dropped.** Re-read every source row after the function returned: `apple_collection_id` is still empty on all 12.
5. **Why writes dropped — confirmed via a controlled test**: called `LifestyleSources.update(id, { apple_collection_id: "TEST_999_XYZ", apple_collection_url: "..." })` directly. The returned row includes `is_active`, `language`, `type`, `priority`, `tags`, `feed_url`, `updated_date`, etc. — but `apple_collection_id` and `apple_collection_url` are **stripped from the return payload**. A subsequent re-fetch confirms they were never persisted. **Conclusion: the live base44 schema for `LifestyleSources` does not yet have those two fields.**
6. **Same on `LifestyleItems`.** The fields `feed_url` and `apple_collection_id` are declared in `base44/entities/LifestyleItems.jsonc` but writes to them are silently dropped — meaning the live schema doesn't have them either.
7. **Why this matters for Bug 1**: the FE's `PodcastListenSheet` builds Spotify (via pod.link) from `LifestyleItems.feed_url`, Apple from `LifestyleItems.apple_collection_id`, Pocket Casts from `LifestyleItems.feed_url`. With all three fields missing on the live schema, the sheet shows "Not available for this show" for every destination — exactly what Halli's screenshot reported.

## What Cowork needs to do at next publish

The schema additions in these two files need to make it to the live base44 schema:

```
base44/entities/LifestyleSources.jsonc   — add: apple_collection_id, apple_collection_url
base44/entities/LifestyleItems.jsonc     — add: apple_collection_id, feed_url
```

On Base44 builder this is usually a separate "update entity schema" action (Code's prior publish carried the `.jsonc` file but didn't migrate the live entity). If the builder UI auto-detects new fields and offers a "deploy schema" step, click it. If not, the schema needs an explicit migration via the Base44 builder dialog or the MCP `update_entity_schema` tool.

When my MCP token expired mid-session I couldn't run that migration myself. Halli or Cowork via fresh auth can.

## What I shipped to `main` for the next publish to carry

| What | Where |
|---|---|
| `seedPodcasts` now writes `feed_url` + `apple_collection_id` onto every `LifestyleItems` row at create time (sourced from the parent `LifestyleSources` row) | `base44/functions/seedPodcasts/entry.ts` |
| New `backfillPodcastFields` Deno function — admin-invoked or orchestrator-fired. (a) Joins each existing PODCAST item to its source and patches `feed_url` + `apple_collection_id` if missing. (b) Deletes any remaining Buzzsprout-shape broken rows. Idempotent. | `base44/functions/backfillPodcastFields/entry.ts` |
| Wired into `pipelineOrchestrator` as **Phase 18 in `ONE_SHOT_PHASES`** — fires once on the next daily cron after publish then locks closed | `base44/functions/pipelineOrchestrator/entry.ts` |
| `AstraSidecar` (Planner Cycle tab) gated on `profile.birthday` per your observation #2 | `src/components/planner/cycle/WarmthBundleCycle.jsx` |

## Post-publish, what happens automatically

1. Next daily orchestrator tick runs `backfillPodcastFields` (one-shot, bootstrap-fires regardless of cadence on first run).
2. For each of the 58 existing PODCAST `LifestyleItems`, it patches `feed_url` (always set on parent source) + `apple_collection_id` (will be set on parent source IF `resolveApplePodcastId` actually persists once schema is live).
3. The orchestrator already has `resolveApplePodcastId` in `ONE_SHOT_PHASES`. Its first-run-bootstrap may have already logged a `:ok` row earlier (when the writes silently dropped), in which case it's locked closed. **Cowork should manually re-invoke `resolveApplePodcastId {}` once schema is live, OR clear the prior `phase:resolveApplePodcastId:ok` log entry so the bootstrap re-fires.**

After all that, the FE Listen sheet's three buttons all resolve. Spotify via pod.link, Apple via collection ID, Pocket Casts via pca.st fallback.

## Cowork's three minor Planner observations

1. **Confidence pill not visible** — confirmed correct: no cycle data → no `.ph-sub` → pill doesn't render. Will appear once a user logs a period.
2. **Astra Cole sidecar visible despite empty cycle data** — fixed in this commit. Now gated on `profile.birthday`.
3. **Tonight's Window not visible** — verified in code: TonightCard renders unconditionally inside the Today tab's `loading? : (...)` block, no time-of-day or data gate. May have been a scroll miss in the walk, or possibly the empty-account view collapsed it visually below the "soft, open day" fallback. Worth a second look on a live account with at least one habit/plan.

## Files touched

```
base44/functions/seedPodcasts/entry.ts                  (modified — write feed_url + apple_collection_id onto LifestyleItems)
base44/functions/backfillPodcastFields/entry.ts         (new — admin/orchestrator)
base44/functions/pipelineOrchestrator/entry.ts          (modified — wire Phase 18 + add to ONE_SHOT_PHASES)
src/components/planner/cycle/WarmthBundleCycle.jsx      (modified — AstraSidecar zodiac gate)
src/pages/Planner.jsx                                   (modified — pass profile to AstraSidecar)
claude-state/STATUS.md                                  (updated)
claude-handoff/from-code-to-cowork-2026-05-15-podcast-schema-blocker.md (this file)
```

## Next moves from here

1. **Cowork publish** with schema migration included (the critical step — without it none of the deep-link writes can persist).
2. After publish: confirm `backfillPodcastFields` fired on next cron OR invoke manually via builder; manually re-invoke `resolveApplePodcastId {}` if the prior `:ok` log locked it closed.
3. **3-viewport walk on `/Lifestyle?tab=listen`** — verify cards have artwork (already true), in-app audio works on the non–On Being shows (already true post-cleanup), Listen sheet shows enabled buttons for all three destinations (needs schema + backfill).

— Code

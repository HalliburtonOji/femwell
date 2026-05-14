# Code → Cowork, 2026-05-14: please publish — 4 things queued + my next moves after

## TL;DR

Halli confirmed you have the Builder UI open in Chrome MCP + test-user creds for the live app. That makes you the **publish + walk** half of a fully closed two-Claude loop. Four items on `main` need your Publish click to take effect; after that I invoke + verify everything programmatically and drop a tombstone with the counts.

## What's waiting on Publish (HEAD `cde30a7`)

| Commit | What it lands |
|---|---|
| `02b5c68` | Profile.jsx font fix — Playfair Display → Fraunces (Halli's "CHECK-INS: o / STREAK: od" bug) |
| `0692038` | LC-4: emoji-strip on every ingest write site + new `backfillTikTokEmoji` function |
| `cde30a7` | seedPodcasts UA + image-skip fix |
| (also) | New `src/utils/stripEmoji.js` + `base44/functions/_shared/stripEmoji.ts` from LC-4 |

The `backfillYouTubeEmbeddability` function you shipped earlier (`57b9f2f`) — I confirmed it's also 404'd on the platform side. **Also awaits this publish.**

## Confirmed live state right now (queried directly via my SDK)

```
LifestyleItems where media_type=PODCAST   → 0   (seedPodcasts fix unpublished, prior runs all skipped)
LifestyleItems where media_type=PRACTICE  → 9   ← migrated this session
LifestyleItems where media_type=TIKTOK    → not checked
IngestErrorLog for seedPodcasts (latest)  → 8 feed_fetch errors + 5 image_missing skips
```

## What you do

1. **Publish** from the Builder UI you have open. After "Your app is published and live online!" toast, ping me here or push a tombstone.
2. **(Optional, batch with the above)** Walk femwells.com as the test user at mobile/tablet/desktop:
   - `/Lifestyle?tab=listen` — should show PracticeRail (9 cards) + PodcastRail (will populate after I invoke seedPodcasts post-publish) + TikTokRail
   - `/Profile` — confirm CHECK-INS / STREAK now render as numbers, not "o" / "od"
   - `/Sessions` — should 404 (LC-3 acceptance test)
   - Take screenshots to `workspace/walk_post_2026-05-14_publish/`

## What I do immediately after you publish

I'll run these in order and report the counts in a single tombstone:

```sh
# 1. Fix Podcasts — should yield podcast rows now that UA + image-skip are fixed
echo 'const r = await base44.functions.invoke("seedPodcasts", {});
console.log(JSON.stringify(r.data || r));' | npx base44 exec
# Then: node scripts/base44-cli.mjs count LifestyleItems media_type=PODCAST

# 2. Clean TikTok titles
echo 'const r = await base44.functions.invoke("backfillTikTokEmoji", {});
console.log(JSON.stringify(r.data || r));' | npx base44 exec

# 3. Backfill YouTube embeddability flags
echo 'const r = await base44.functions.invoke("backfillYouTubeEmbeddability", {});
console.log(JSON.stringify(r.data || r));' | npx base44 exec

# 4. Verify still_dirty = 0 across the 5 emoji-checked fields
node scripts/base44-cli.mjs list LifestyleItems media_type=PODCAST --limit=10
```

Expected outcomes:
- **podcast count > 0** (was 0; UA fix + image-skip relax should land 12-60 rows from 12 seed feeds)
- **TikTok emoji backfill updated > 0** (matches the ~24 emoji-dirty rows Ms Verify saw)
- **YouTube backfill** — count whatever the function reports

If any of those returns `0 updated` or unexpected errors, I diagnose via `node scripts/base44-cli.mjs logs <fn>` and either ship another fix or escalate.

## What you do after my tombstone

Visual walk verification of the data populated:
- PodcastRail should show podcast cards with titles + thumbnails (or category-gradient fallbacks for the few that don't have artwork)
- Video shelf titles should be emoji-free
- No Error 153 / "Watch on YouTube" fallback on videos that are now flagged unembeddable

## Then the queue is clear for LC-5

LC-5 part C (`backfillLongreadsImages`) is my next code-side task. I'll mirror the LC-4 pattern: new file under `base44/functions/`, wire into orchestrator WEEKLY_PHASES, push. **It'll be in the publish bundle AFTER this current one** — no rush, just queued.

LC-5 parts A (verify pending phase tasks) + B (Spotify URLs) still on you/Halli per your earlier handoff.

## Two-Claude protocol — confirming the new norm

- **I push code + invoke functions + verify entity state**
- **You publish + visual-walk + drop tombstone with screenshots**
- **Halli** approves scope changes, supplies external data (real URLs), and decides when to flip from one LC to the next

This is the tightest loop we've had. If publish-after-each-Code-push is too costly in credits, say so and I'll batch.

— Code (2026-05-14)

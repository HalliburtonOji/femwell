// backfillPodcastFields — one-shot operator/orchestrator-invoked.
//
// Two jobs in one pass:
//
// 1. **Deep-link fields on existing LifestyleItems.** Earlier seedPodcasts
//    only wrote feed_url + apple_collection_id on the LifestyleSources row.
//    The FE's PodcastListenSheet reads these off the LifestyleItems row to
//    build Spotify (pod.link) / Apple / Pocket Casts URLs — without them
//    every destination shows "Not available for this show". This pass joins
//    each PODCAST item to its source (by source_id, falling back to
//    source_name) and writes the missing fields.
//
// 2. **Cleanup the Buzzsprout-shape broken rows.** A subset of legacy rows
//    (Maintenance Phase + You're Wrong About) were written with image_url
//    pointing at the .mp3 file + empty audio_url + content_url like
//    'Buzzsprout-12345' instead of a URL. These predate the
//    parsePodcastItems link-fallback chain in 8ba1713 and can't be healed
//    in place — they get DELETED here so the next seedPodcasts pass writes
//    fresh well-shaped rows from the same feeds.
//
// Body:
//   POST {}                         — sweep + delete (default)
//   POST { dry_run: true }          — counts only, no writes
//
// Returns: { ok, scanned, updated_items, deleted_items, missing_source, dry_run }
//
// Spec ref: podcast Phase 1 bug report (claude-handoff/from-cowork-to-code-
//   2026-05-15-podcast-bugs-and-planner-walk.md) — three bugs, one root cause.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function isBrokenRow(row) {
  // Image_url is actually the audio file (Buzzsprout shape — parser bug
  // before 8ba1713). audio_url empty. content_url is the Buzzsprout-N
  // string instead of a real URL.
  const imageIsMp3 = typeof row?.image_url === 'string' && /\.mp3(\?|$)/i.test(row.image_url);
  const audioEmpty = !row?.audio_url;
  const contentNotUrl = typeof row?.content_url === 'string' && !/^https?:\/\//i.test(row.content_url);
  // Treat ANY of these as broken — they all surface to the user as a
  // dead card with no playable audio.
  return imageIsMp3 || audioEmpty || contentNotUrl;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (me && me.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dry_run;

    const sb = base44.asServiceRole;

    // Load every PODCAST item + every PODCAST source up front so we don't
    // hammer the API with per-row lookups.
    const [items, sources] = await Promise.all([
      sb.entities.LifestyleItems.filter({ media_type: 'PODCAST' }, '-created_date', 500).catch(() => []),
      sb.entities.LifestyleSources.filter({ source_type: 'PODCAST' }, '-created_date', 100).catch(() => []),
    ]);
    const sourcesById = new Map();
    const sourcesByName = new Map();
    for (const s of sources || []) {
      if (s.id) sourcesById.set(s.id, s);
      if (s.name) sourcesByName.set(s.name, s);
    }

    let scanned = 0;
    let updated = 0;
    let deleted = 0;
    let missingSource = 0;
    const errors = [];

    for (const item of items || []) {
      scanned += 1;
      try {
        // Delete-first path — broken rows can't be patched in place.
        if (isBrokenRow(item)) {
          if (!dryRun) {
            await sb.entities.LifestyleItems.delete(item.id);
          }
          deleted += 1;
          continue;
        }

        const src = (item.source_id && sourcesById.get(item.source_id))
          || (item.source_name && sourcesByName.get(item.source_name))
          || null;
        if (!src) { missingSource += 1; continue; }

        const needsFeed = !item.feed_url && !!src.feed_url;
        const needsApple = !item.apple_collection_id && !!src.apple_collection_id;
        if (!needsFeed && !needsApple) continue;

        const patch = {};
        if (needsFeed) patch.feed_url = src.feed_url;
        if (needsApple) patch.apple_collection_id = src.apple_collection_id;

        if (!dryRun) {
          await sb.entities.LifestyleItems.update(item.id, patch);
        }
        updated += 1;
      } catch (err) {
        errors.push({ item_id: item?.id, error: String(err?.message || err) });
      }
    }

    return Response.json({
      ok: true,
      dry_run: dryRun,
      scanned,
      updated_items: updated,
      deleted_items: deleted,
      missing_source: missingSource,
      errors: errors.slice(0, 20),
    });
  } catch (err) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});

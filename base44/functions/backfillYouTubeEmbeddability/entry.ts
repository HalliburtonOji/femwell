// backfillYouTubeEmbeddability —
// Sweep existing LifestyleItems rows where provider='YOUTUBE' AND is_embeddable
// is null/undefined (i.e. ingested before the preflight landed). For each,
// hit YouTube's oEmbed endpoint:
//   - 200 → is_embeddable: true
//   - 401/403/404 → is_embeddable: false
//   - other → leave unchanged (network blip, retry on next sweep)
//
// Scheduled by pipelineOrchestrator as a weekly phase (every Sunday UTC).
// Also invokable directly: POST {} for full sweep, or POST { limit: N } for partial.
//
// This is the binding fix for Error 153 on already-ingested videos. New
// ingests are preflight-checked by ingestYouTubeChannels directly.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function logIngestError(base44, stage, ctx, err) {
  try {
    const e = err && typeof err === 'object' ? err : new Error(String(err));
    await base44.asServiceRole.entities.IngestErrorLog.create({
      function_name: 'backfillYouTubeEmbeddability',
      stage,
      source_identifier: ctx.source_identifier || '',
      item_id: ctx.item_id || '',
      error_message: e?.message || String(err),
      error_stack: e?.stack || '',
      raw_payload: ctx.raw_payload ? JSON.stringify(ctx.raw_payload).slice(0, 4000) : '',
      logged_at: new Date().toISOString(),
      status: 'logged',
    });
  } catch (logErr) {
    console.error('[backfill-yt-emb] log-failed', logErr?.message);
  }
}

async function isYouTubeEmbeddable(videoId) {
  if (!videoId) return null;
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`;
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'FemWell/1.0 (+https://femwells.com)' },
    });
    if (res.ok) return true;
    if ([401, 403, 404].includes(res.status)) return false;
    return null;
  } catch {
    return null;
  }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Allow service-role (scheduler) and admin (manual).
    const me = await base44.auth.me().catch(() => null);
    const isService = req.headers.get('x-base44-service-role') === 'true';
    if (!isService && me?.role !== 'admin') {
      return Response.json({ error: 'Admin or service-role only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const limit = Number(body?.limit) || 500;

    // Pull YOUTUBE rows. Filter for ones missing the is_embeddable flag.
    const all = await base44.asServiceRole.entities.LifestyleItems.filter(
      { provider: 'YOUTUBE' }, '-created_at', limit,
    ).catch(() => []);

    let scanned = 0;
    let alreadyTagged = 0;
    let markedEmbeddable = 0;
    let markedNotEmbeddable = 0;
    let unknown = 0;
    let errors = 0;

    for (const row of (all || [])) {
      scanned += 1;
      // If is_embeddable is already a boolean, skip (it was set at ingest or
      // a previous sweep). Only target rows where the field is null/undefined.
      if (typeof row.is_embeddable === 'boolean') { alreadyTagged += 1; continue; }
      if (!row.video_id) { unknown += 1; continue; }

      const embeddable = await isYouTubeEmbeddable(row.video_id);
      if (embeddable === null) { unknown += 1; await sleep(120); continue; }

      try {
        await base44.asServiceRole.entities.LifestyleItems.update(row.id, {
          is_embeddable: embeddable,
          updated_at: new Date().toISOString(),
        });
        if (embeddable) markedEmbeddable += 1;
        else markedNotEmbeddable += 1;
      } catch (err) {
        errors += 1;
        await logIngestError(base44, 'update', {
          source_identifier: row.source_name || '',
          item_id: row.id,
          raw_payload: { video_id: row.video_id, embeddable },
        }, err);
      }

      // Light rate-limit on YouTube's oEmbed endpoint. ~5 req/sec is safe.
      await sleep(200);
    }

    return Response.json({
      ok: true,
      scanned,
      already_tagged: alreadyTagged,
      marked_embeddable: markedEmbeddable,
      marked_not_embeddable: markedNotEmbeddable,
      unknown,
      errors,
    });
  } catch (err) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});

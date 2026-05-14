// resolveApplePodcastId — admin-invoked.
//
// Two call modes:
// 1. **Backfill mode** (POST {}): scans LifestyleSources where source_type='PODCAST'
//    AND apple_collection_id is missing/empty AND is_active=true. Resolves each
//    via iTunes Search API. Idempotent — re-runs skip rows that already have an ID.
//    Wired into pipelineOrchestrator ONE_SHOT_PHASES so the first daily cron after
//    deploy backfills the 12 curated sources.
// 2. **Single-source mode** (POST { source_id }): resolves just that one row.
//    Called inline from seedPodcasts after a new source is created so subsequent
//    ingests don't wait for the next cron tick.
//
// iTunes Search API: free, no auth, ~20 req/min courteous rate limit.
//   GET https://itunes.apple.com/search?media=podcast&entity=podcast&term=<name>&limit=10
//
// Match strategy (in order):
//   a) Exact feedUrl match against result.feedUrl
//   b) Case-insensitive substring trackName.toLowerCase().includes(seedName) OR vice-versa
//   c) None — log :no_match, leave row unchanged.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function logResult(base44, source, stage, payload) {
  try {
    await base44.asServiceRole.entities.IngestErrorLog.create({
      function_name: 'resolveApplePodcastId',
      stage,
      source_identifier: source?.name || '',
      item_id: source?.id || '',
      error_message: payload?.message || '',
      raw_payload: payload ? JSON.stringify(payload).slice(0, 4000) : '',
      logged_at: new Date().toISOString(),
      status: 'logged',
    });
  } catch { /* non-fatal */ }
}

async function searchItunes(name) {
  const url = `https://itunes.apple.com/search?media=podcast&entity=podcast&term=${encodeURIComponent(name)}&limit=10`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`iTunes Search HTTP ${res.status}`);
  const json = await res.json();
  return Array.isArray(json?.results) ? json.results : [];
}

function pickBest(results, source) {
  if (!results.length) return null;
  const feed = (source.feed_url || '').toLowerCase().replace(/\/+$/, '');
  if (feed) {
    const exact = results.find((r) => (r.feedUrl || '').toLowerCase().replace(/\/+$/, '') === feed);
    if (exact) return exact;
  }
  const name = (source.name || '').toLowerCase().trim();
  if (name) {
    const sub = results.find((r) => {
      const t = (r.trackName || '').toLowerCase();
      return t === name || t.includes(name) || name.includes(t);
    });
    if (sub) return sub;
  }
  return null;
}

async function resolveOne(base44, source) {
  if (source?.apple_collection_id) {
    await logResult(base44, source, 'skip:already_resolved', { collectionId: source.apple_collection_id });
    return { skipped: true };
  }
  let results = [];
  try {
    results = await searchItunes(source.name || '');
  } catch (err) {
    await logResult(base44, source, 'fail:search', { message: err?.message || String(err) });
    return { error: 'search' };
  }
  const match = pickBest(results, source);
  if (!match || !match.collectionId) {
    await logResult(base44, source, 'no_match', { name: source.name, hits: results.length });
    return { no_match: true };
  }
  const collectionId = String(match.collectionId);
  const collectionUrl = match.collectionViewUrl || `https://podcasts.apple.com/podcast/id${collectionId}`;
  try {
    await base44.asServiceRole.entities.LifestyleSources.update(source.id, {
      apple_collection_id: collectionId,
      apple_collection_url: collectionUrl,
    });
  } catch (err) {
    await logResult(base44, source, 'fail:update', { message: err?.message || String(err) });
    return { error: 'update' };
  }
  await logResult(base44, source, 'ok', { collectionId, trackName: match.trackName });
  return { resolved: true, collectionId, collectionUrl };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (me && me.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const sb = base44.asServiceRole;

    // Single-source mode
    if (body?.source_id) {
      const rows = await sb.entities.LifestyleSources.filter({ id: body.source_id }, undefined, 1).catch(() => []);
      const source = rows?.[0];
      if (!source) return Response.json({ ok: false, error: 'not_found' }, { status: 404 });
      const r = await resolveOne(base44, source);
      return Response.json({ ok: true, source_id: source.id, ...r });
    }

    // Backfill mode — all unresolved PODCAST sources.
    const sources = await sb.entities.LifestyleSources.filter(
      { source_type: 'PODCAST', is_active: true }, '-updated_date', 100,
    ).catch(() => []);

    let resolved = 0;
    let skipped = 0;
    let no_match = 0;
    let errors = 0;
    for (const s of (sources || [])) {
      const r = await resolveOne(base44, s);
      if (r?.resolved) resolved += 1;
      else if (r?.skipped) skipped += 1;
      else if (r?.no_match) no_match += 1;
      else if (r?.error) errors += 1;
      // be courteous to iTunes Search — small delay between calls
      await new Promise((r) => setTimeout(r, 250));
    }

    return Response.json({
      ok: true,
      scanned: sources.length,
      resolved,
      skipped,
      no_match,
      errors,
    });
  } catch (err) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});

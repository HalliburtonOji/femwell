import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// -- Inlined helper (matches Phase 1+2 pattern) --
async function logIngestError(base44, function_name, stage, ctx, err) {
  try {
    const e = err && typeof err === 'object' ? err : new Error(String(err));
    await base44.asServiceRole.entities.IngestErrorLog.create({
      function_name,
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
    console.error(`[ingest-error-log-failed] ${function_name} ${stage}`, logErr?.message);
  }
  console.error(`[ingest-error] ${function_name} ${stage}`, err?.message || err);
}

async function headCheck(url) {
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    // Some publishers reject HEAD with 405 or 403 -- fall back to GET.
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err?.message || String(err) };
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startedAt = new Date().toISOString();

  // Pick PUBLISHED items where revalidated_at is null OR older than 7 days.
  const neverChecked = await base44.asServiceRole.entities.LifestyleItems.filter(
    { status: 'PUBLISHED', revalidated_at: null }, '-published_at', 250
  ).catch(() => []);
  const stale = await base44.asServiceRole.entities.LifestyleItems.filter(
    { status: 'PUBLISHED', revalidated_at: { $lt: sevenDaysAgo } }, 'revalidated_at', 250
  ).catch(() => []);

  // Dedupe by id, total cap 500.
  const seen = new Set();
  const items = [];
  for (const it of [...neverChecked, ...stale]) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    items.push(it);
    if (items.length >= 500) break;
  }

  const counts = { checked: 0, ok: 0, dead: 0, no_url: 0 };

  for (const item of items) {
    if (!item.content_url) {
      counts.no_url++;
      continue;
    }
    const res = await headCheck(item.content_url);
    counts.checked++;
    const nowIso = new Date().toISOString();
    if (res.ok) {
      await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
        revalidated_at: nowIso,
        updated_at: nowIso,
      }).catch(() => {});
      counts.ok++;
    } else {
      // Single-strike: flip to DEAD_LINK immediately.
      // Future MP can add 2-strikes via a counter field if false-positive rate is too high.
      await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
        status: 'DEAD_LINK',
        revalidated_at: nowIso,
        rejection_reason: `dead_link_http_${res.status}`,
        updated_at: nowIso,
      }).catch(() => {});
      counts.dead++;
      await logIngestError(base44, 'revalidateUrls', 'url_validation',
        { item_id: item.id, source_identifier: item.source_name || '',
          raw_payload: { url: item.content_url, http_status: res.status } },
        new Error(`dead link: HTTP ${res.status}`));
    }
  }

  await logIngestError(base44, 'revalidateUrls', 'run_summary',
    { source_identifier: 'revalidateUrls',
      raw_payload: { startedAt, ...counts, candidate_count: items.length } },
    new Error(`run complete: checked=${counts.checked} dead=${counts.dead}`));

  return Response.json({ started_at: startedAt, finished_at: new Date().toISOString(), ...counts });
});
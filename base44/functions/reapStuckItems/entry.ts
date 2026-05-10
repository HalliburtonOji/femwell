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

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Stuck = NEEDS_REVIEW AND ingested_at < 48h ago. Limit 100 per run.
  const stuck = await base44.asServiceRole.entities.LifestyleItems.filter(
    { status: 'NEEDS_REVIEW', ingested_at: { $lt: fortyEightHoursAgo } },
    'ingested_at', 100
  ).catch(() => []);

  let retried = 0, failed = 0, repaired = 0;

  for (const item of stuck) {
    const hasSummary = item.summary && item.summary.length > 20;
    const hasPhaseTags = Array.isArray(item.phase_tags) && item.phase_tags.length > 0;

    // Repair branch: summarize ran but status didn't flip -- promote to PUBLISHED.
    if (hasSummary || hasPhaseTags) {
      await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
        status: 'PUBLISHED',
        published_at: item.published_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).catch(() => {});
      repaired++;
      continue;
    }

    // Already retried once? Mark FAILED.
    if (item.rejection_reason && item.rejection_reason.startsWith('reaper_retry_')) {
      await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
        status: 'FAILED',
        rejection_reason: 'reaper_failed_after_retry',
        updated_at: new Date().toISOString(),
      }).catch(() => {});
      failed++;
      await logIngestError(base44, 'reapStuckItems', 'final_fail',
        { item_id: item.id, source_identifier: item.source_name || '' },
        new Error('marked FAILED after one retry'));
      continue;
    }

    // First retry: stamp rejection_reason + invoke summarize for this item only.
    await base44.asServiceRole.entities.LifestyleItems.update(item.id, {
      rejection_reason: `reaper_retry_${new Date().toISOString()}`,
      updated_at: new Date().toISOString(),
    }).catch(() => {});
    try {
      await base44.asServiceRole.functions.invoke('summarizeLifestyleItem', { item_id: item.id });
      retried++;
    } catch (err) {
      await logIngestError(base44, 'reapStuckItems', 'retry_invoke_failed',
        { item_id: item.id, source_identifier: item.source_name || '' }, err);
    }
  }

  await logIngestError(base44, 'reapStuckItems', 'run_summary',
    { source_identifier: 'reapStuckItems',
      raw_payload: { stuck_count: stuck.length, retried, failed, repaired } },
    new Error(`reap complete: stuck=${stuck.length} retried=${retried} failed=${failed} repaired=${repaired}`));

  return Response.json({ stuck: stuck.length, retried, failed, repaired });
});
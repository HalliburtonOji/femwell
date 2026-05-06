// Daily retention sweep for IngestErrorLog. Hard-deletes rows older than 30 days.
// Cheap: no LLM, just paginated DB deletes.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const cutoffMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const cutoffIso = new Date(cutoffMs).toISOString();

    let deleted = 0;
    let scanned = 0;

    // Page through oldest-first; stop once we hit a row newer than cutoff.
    // Cap at 5000 deletions per run to bound execution time.
    const MAX_DELETES = 5000;
    while (deleted < MAX_DELETES) {
      const batch = await base44.asServiceRole.entities.IngestErrorLog.list('logged_at', 200);
      if (!batch || batch.length === 0) break;
      scanned += batch.length;

      const stale = batch.filter((row) => row.logged_at && row.logged_at < cutoffIso);
      if (stale.length === 0) break;

      for (const row of stale) {
        await base44.asServiceRole.entities.IngestErrorLog.delete(row.id).catch(() => {});
        deleted += 1;
        if (deleted >= MAX_DELETES) break;
      }

      // If the batch had non-stale rows mixed in, we've reached the boundary.
      if (stale.length < batch.length) break;
    }

    return Response.json({ deleted, scanned, cutoff: cutoffIso });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
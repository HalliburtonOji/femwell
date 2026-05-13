// backfillTikTokEmoji — one-shot operator-invoked backfill.
// Sweeps existing LifestyleItems rows for emoji codepoints in title /
// author_name / summary / lede / channel_name. Updates each row with the
// scrubbed text in-place. Idempotent — re-runs are no-ops because the strip
// has nothing left to remove.
//
// Body (admin-only):
//   POST {}              — full sweep across all media_types.
//   POST { media_type }  — limit to one media_type (e.g. 'TIKTOK').
//   POST { dry_run: true } — counts only, no writes.
// Returns: { ok, scanned, updated, fields_cleaned, errors }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { stripEmoji, hasEmoji } from '../_shared/stripEmoji.ts';

const TEXT_FIELDS = ['title', 'author_name', 'summary', 'lede', 'channel_name'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (me?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dry_run;
    const onlyMedia = body?.media_type;

    const sb = base44.asServiceRole;
    let scanned = 0;
    let updated = 0;
    const fieldsCleaned = {};
    const errors = [];

    // Pull in pages of 200 to avoid 3-minute function cap.
    const pageSize = 200;
    let offset = 0;
    // Cap total scan at 5000 — well above current corpus, prevents runaway.
    while (offset < 5000) {
      const rows = await sb.entities.LifestyleItems.list(
        '-created_date', pageSize, offset,
      ).catch(() => []);
      if (!rows || rows.length === 0) break;

      for (const row of rows) {
        if (onlyMedia && row.media_type !== onlyMedia) continue;
        scanned += 1;

        const patch = {};
        let dirty = false;
        for (const field of TEXT_FIELDS) {
          const orig = row[field];
          if (typeof orig === 'string' && hasEmoji(orig)) {
            patch[field] = stripEmoji(orig);
            fieldsCleaned[field] = (fieldsCleaned[field] || 0) + 1;
            dirty = true;
          }
        }
        if (!dirty) continue;

        if (dryRun) { updated += 1; continue; }

        try {
          await sb.entities.LifestyleItems.update(row.id, patch);
          updated += 1;
        } catch (err) {
          errors.push({ id: row.id, error: err?.message || String(err) });
        }
      }

      if (rows.length < pageSize) break;
      offset += pageSize;
    }

    return Response.json({
      ok: true,
      dry_run: dryRun,
      scanned,
      updated,
      fields_cleaned: fieldsCleaned,
      errors: errors.slice(0, 20),
    });
  } catch (err) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});

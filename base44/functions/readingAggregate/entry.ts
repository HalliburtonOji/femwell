// readingAggregate (Books & Book Clubs — Phase 2 hardening) — the ANONYMOUS read path for the
// reading aggregates. ReadingActivity is RLS-locked to admin, so clients can't read rows
// directly; this asServiceRole function returns ONLY the warm aggregate — never raw rows, never
// metadata — so a client can never de-anonymise authors. Two modes:
//   - cohort:     a k-floored DISTINCT-reader count who reached >= chapter_index (or null below floor)
//   - prediction: the distinct anonymous guess LINES for {book_id, chapter_index} (or [] below floor)
// Self-contained (no shared imports). Nothing after Deno.serve.
// Body: { book_id, chapter_index, mode: "cohort" | "prediction" }  Returns: { ok, count?, lines? } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const K_FLOOR = 3; // below this, no thin aggregate — caller shows a gentle line instead

function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

    let p: any = {};
    try { const j = await req.json(); if (j && typeof j === 'object') p = j; } catch { p = {}; }
    const book_id = String(p?.book_id || '').trim().slice(0, 128);
    const chapter_index = Number(p?.chapter_index);
    const mode = String(p?.mode || '').trim();
    if (!book_id || !Number.isFinite(chapter_index) || (mode !== 'cohort' && mode !== 'prediction')) {
      return Response.json({ error: 'book_id, chapter_index and mode (cohort|prediction) required' }, { status: 400 });
    }

    const sb = base44.asServiceRole;

    if (mode === 'cohort') {
      const rows = await withTimeout(
        sb.entities.ReadingActivity.filter({ book_id, kind: 'progress', hidden: false }, '-created_date', 1000),
        4000, 'filter').catch(() => []);
      const hashes = new Set<string>();
      for (const r of (Array.isArray(rows) ? rows : [])) {
        if (r && typeof r.chapter_index === 'number' && r.chapter_index >= chapter_index && r.author_hash) {
          hashes.add(String(r.author_hash));
        }
      }
      const n = hashes.size;
      return Response.json({ ok: true, count: n >= K_FLOOR ? n : null });
    }

    // prediction
    const rows = await withTimeout(
      sb.entities.ReadingActivity.filter({ book_id, chapter_index, kind: 'prediction', hidden: false }, '-created_date', 400),
      4000, 'filter').catch(() => []);
    const seen = new Set<string>();
    const lines: string[] = [];
    for (const r of (Array.isArray(rows) ? rows : [])) {
      if (!r || !r.body || !r.author_hash) continue;
      if (seen.has(String(r.author_hash))) continue;
      seen.add(String(r.author_hash));
      lines.push(String(r.body).slice(0, 600));
    }
    return Response.json({ ok: true, lines: lines.length >= K_FLOOR ? lines : [] });
  } catch (e: any) {
    console.error('readingAggregate error:', e?.message || e);
    return Response.json({ error: 'Could not gather' }, { status: 500 });
  }
});

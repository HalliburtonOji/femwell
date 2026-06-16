// readingActivityFn (Books & Book Clubs — Phase 2 hardening) — the ANONYMOUS write + read path
// for reading acts, in ONE function (the app is at the 50-function cap, so one combined endpoint
// instead of two). ReadingActivity is RLS-locked to role:admin, so clients can't touch rows
// directly; everything goes through this asServiceRole function:
//   op:"write"      → create a row (prediction | progress | club_reflection). Row is written
//                     under the SERVICE identity, so created_by is the service — never the user's
//                     email — hardening anonymity beyond the app-level author_hash.
//   op:"cohort"     → a k-floored DISTINCT-reader count who reached >= chapter_index (or null).
//   op:"prediction" → the distinct anonymous guess LINES for {book_id, chapter_index} (or []).
// Reads return ONLY the warm aggregate — never raw rows/metadata — so a client can't de-anonymise.
// Self-contained (no shared imports). Nothing after Deno.serve. Free-text body is crisis-checked
// + scrubbed CLIENT-SIDE before write; we clamp length + validate shape here.
// Body: { op, author_hash?, book_id, chapter_index, kind?, body? }  Returns: { ok, count?, lines? } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const KINDS = ['prediction', 'progress', 'club_reflection'];
const K_FLOOR = 3; // below this, no thin aggregate — caller shows a gentle line instead

// Timeout guard — an awaited platform call that HANGS would wedge the function.
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

    const op = String(p?.op || '').trim();
    const book_id = String(p?.book_id || '').trim().slice(0, 128);
    const chapter_index = Number(p?.chapter_index);
    // empty/invalid call (e.g. a registration probe) → clean 400, NO side effects
    if (!book_id || !Number.isFinite(chapter_index) || !['write', 'cohort', 'prediction'].includes(op)) {
      return Response.json({ error: 'op (write|cohort|prediction), book_id and chapter_index required' }, { status: 400 });
    }

    const sb = base44.asServiceRole;

    if (op === 'write') {
      const author_hash = String(p?.author_hash || '').trim().slice(0, 128);
      const kind = String(p?.kind || '').trim();
      if (!author_hash || !KINDS.includes(kind)) {
        return Response.json({ error: 'author_hash and a valid kind are required for write' }, { status: 400 });
      }
      const body = kind === 'progress' ? '' : String(p?.body || '').slice(0, 600);
      const created = await withTimeout(sb.entities.ReadingActivity.create({
        author_hash, book_id, chapter_index, kind, body, hidden: false,
      }), 6000, 'create').catch((e: any) => { console.error('readingActivityFn create failed:', e?.message || e); return null; });
      if (!created) return Response.json({ error: 'Write failed' }, { status: 500 });
      return Response.json({ ok: true });
    }

    if (op === 'cohort') {
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

    // op === 'prediction'
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
    console.error('readingActivityFn error:', e?.message || e);
    return Response.json({ error: 'Could not process' }, { status: 500 });
  }
});

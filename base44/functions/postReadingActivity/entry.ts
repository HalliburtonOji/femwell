// postReadingActivity (Books & Book Clubs — Phase 2 hardening) — the ANONYMOUS write path for
// reading acts (guess-the-next-chapter predictions + shared-read cohort progress + club
// reflections). The client used to create ReadingActivity rows directly; now the entity is
// RLS-locked to admin and ALL writes go through this asServiceRole function, so:
//   - a normal client can no longer create/read others' rows directly (RLS holds), and
//   - the row is written under the SERVICE identity, so the platform's auto created_by is the
//     service — never the user's email — hardening anonymity beyond the app-level author_hash.
// The free-text `body` is crisis-checked + scrubbed CLIENT-SIDE before this is called; we still
// clamp length + validate shape here. Self-contained (no shared imports). Nothing after
// Deno.serve. Body: { author_hash, book_id, chapter_index, kind, body? }  Returns: { ok } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const KINDS = ['prediction', 'progress', 'club_reflection'];

// Timeout guard — an awaited platform write that HANGS would wedge the function.
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

    const author_hash = String(p?.author_hash || '').trim().slice(0, 128);
    const book_id = String(p?.book_id || '').trim().slice(0, 128);
    const kind = String(p?.kind || '').trim();
    const chapter_index = Number(p?.chapter_index);
    // empty/invalid call (e.g. a registration probe) → clean 400, NO side effects
    if (!author_hash || !book_id || !KINDS.includes(kind) || !Number.isFinite(chapter_index)) {
      return Response.json({ error: 'author_hash, book_id, chapter_index and a valid kind are required' }, { status: 400 });
    }
    const body = kind === 'progress' ? '' : String(p?.body || '').slice(0, 600);

    const sb = base44.asServiceRole;
    const created = await withTimeout(sb.entities.ReadingActivity.create({
      author_hash, book_id, chapter_index, kind, body, hidden: false,
    }), 6000, 'create').catch((e: any) => { console.error('postReadingActivity create failed:', e?.message || e); return null; });
    if (!created) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true });
  } catch (e: any) {
    console.error('postReadingActivity error:', e?.message || e);
    return Response.json({ error: 'Could not record' }, { status: 500 });
  }
});

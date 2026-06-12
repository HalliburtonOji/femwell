// createPostDiag — TEMPORARY diagnostic to isolate why asServiceRole.CommunityPost.create
// hangs/fails (while postEcho's Echo.create works). It attempts a series of INCREMENTAL
// create payloads against CommunityPost, each TIMEOUT-GUARDED (so a hang surfaces as a fast
// rejection instead of wedging), stops at the first failure, reports the exact outcome of
// each step, then deletes the rows it created. One fast call pinpoints the offending field
// (or shows that even a required-only create fails → entity/RLS/platform, not a field).
//
// As a control it also tries a minimal Echo.create (known-working) so we can see Echo succeed
// and CommunityPost fail side by side in the SAME call/environment.
//
// Self-contained (gotcha #1); NOTHING after Deno.serve (gotcha #3); asServiceRole.
// Body: { author_hash? }   Returns: { ok, results, control } | { error }
// REMOVE after the cause is found.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

    let p: any;
    try { p = await req.json(); } catch { p = {}; }
    const ah = String(p?.author_hash || 'diag_probe_hash');
    const sb = base44.asServiceRole;
    const TIMEOUT = 4000;
    const body = '[diag] probe — safe to delete';

    // Incremental CommunityPost payloads — each adds ONE field on top of the previous, so the
    // first one that fails names the offending field. required = room, author_hash, body.
    const variants: { label: string; data: Record<string, unknown> }[] = [
      { label: 'required-only (room,author_hash,body)', data: { room: 'lounge', author_hash: ah, body } },
      { label: '+comments_mode', data: { room: 'lounge', author_hash: ah, body, comments_mode: 'open' } },
      { label: '+by', data: { room: 'lounge', author_hash: ah, body, comments_mode: 'open', by: 'member' } },
      { label: '+hidden', data: { room: 'lounge', author_hash: ah, body, comments_mode: 'open', by: 'member', hidden: false } },
      { label: '+report_count', data: { room: 'lounge', author_hash: ah, body, comments_mode: 'open', by: 'member', hidden: false, report_count: 0 } },
      { label: '+flagged', data: { room: 'lounge', author_hash: ah, body, comments_mode: 'open', by: 'member', hidden: false, report_count: 0, flagged: false } },
      { label: '+circle', data: { room: 'circles', author_hash: ah, body, comments_mode: 'open', by: 'member', hidden: false, report_count: 0, flagged: false, circle: 'books' } },
      { label: '+club', data: { room: 'clubs', author_hash: ah, body, comments_mode: 'open', by: 'member', hidden: false, report_count: 0, flagged: false, club: 'slow-mornings' } },
    ];

    const results: any[] = [];
    const createdIds: string[] = [];
    for (const v of variants) {
      const started = Date.now();
      try {
        const row: any = await withTimeout(sb.entities.CommunityPost.create(v.data), TIMEOUT, v.label);
        const ms = Date.now() - started;
        if (row?.id) createdIds.push(row.id);
        results.push({ step: v.label, ok: true, ms, id: row?.id || null });
      } catch (e: any) {
        const ms = Date.now() - started;
        results.push({ step: v.label, ok: false, ms, error: e?.message || String(e) });
        break;   // first failure names the cause; no point testing further fields
      }
    }

    // Control: a minimal Echo.create (known-working) in the same call/environment.
    let control: any;
    const cs = Date.now();
    try {
      const nowIso = new Date().toISOString();
      const echo: any = await withTimeout(sb.entities.Echo.create({
        body, author_hash: ah, live_at: nowIso, expires_at: nowIso, hidden: true,
      }), TIMEOUT, 'echo-control');
      control = { ok: true, ms: Date.now() - cs, id: echo?.id || null };
      if (echo?.id) await withTimeout(sb.entities.Echo.delete(echo.id), TIMEOUT, 'echo-del').catch(() => {});
    } catch (e: any) {
      control = { ok: false, ms: Date.now() - cs, error: e?.message || String(e) };
    }

    // Clean up any CommunityPost rows the probe created (best-effort, timeout-guarded).
    const cleanup: any[] = [];
    for (const id of createdIds) {
      try { await withTimeout(sb.entities.CommunityPost.delete(id), TIMEOUT, 'cp-del'); cleanup.push({ id, deleted: true }); }
      catch (e: any) { cleanup.push({ id, deleted: false, error: e?.message || String(e) }); }
    }

    return Response.json({ ok: true, results, control, cleanup });
  } catch (e: any) {
    console.error('createPostDiag error:', e?.message || e);
    return Response.json({ error: 'diag failed', detail: e?.message || String(e) }, { status: 500 });
  }
});

// leaveCircle (Community Phase 4) — remove an anonymous Circle membership. Self-contained
// (gotcha #1); asServiceRole; NOTHING after Deno.serve (gotcha #3). Idempotent (no row → ok).
//
// Body: { user_id?, author_hash, circle_key }
// Returns: { ok, left } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

    let p: any;
    try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
    const { user_id, author_hash, circle_key } = p || {};
    if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (!author_hash || !circle_key) return Response.json({ error: 'author_hash + circle_key required' }, { status: 400 });

    const sb = base44.asServiceRole;
    const rows = await sb.entities.CircleMembership.filter({ circle_key: String(circle_key), author_hash: String(author_hash) }, '-created_date', 10).catch(() => []);
    let left = 0;
    for (const row of (Array.isArray(rows) ? rows : [])) {
      const ok = await sb.entities.CircleMembership.delete(row.id).then(() => true).catch(() => false);
      if (ok) left += 1;
    }
    return Response.json({ ok: true, left });
  } catch (e: any) {
    console.error('leaveCircle error:', e?.message || e);
    return Response.json({ error: 'Could not leave' }, { status: 500 });
  }
});

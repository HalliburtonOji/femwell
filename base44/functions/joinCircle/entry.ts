// joinCircle — Circle membership dispatcher (consolidated for the 50-fn cap). Self-contained;
// asServiceRole (created_by is the service, never the member); NOTHING after Deno.serve.
//   action "join" (default) → record an anonymous opt-in membership (dedups)
//   action "leave"          → remove membership(s) (idempotent)
// (Merged from the former joinCircle/leaveCircle — same behaviour.)
//
// Body: { action?, user_id?, author_hash, circle_key, consented? }
// Returns: join → { ok, joined } | { ok, already } ; leave → { ok, left } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Keep in sync with src/components/community/circlesConfig.js CIRCLE_KEYS.
const CIRCLE_KEYS = new Set([
  'ttc', 'pregnancy', 'postpartum', 'perimenopause', 'menopause',
  'pcos', 'endo', 'pmdd',
  'books', 'career', 'creativity', 'movement',
]);

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
    try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
    p = p || {};
    const action = String(p.action || 'join');
    const { user_id, author_hash, circle_key } = p;
    if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (!author_hash || !circle_key) return Response.json({ error: 'author_hash + circle_key required' }, { status: 400 });

    const sb = base44.asServiceRole;

    if (action === 'leave') {
      const rows = await withTimeout(sb.entities.CircleMembership.filter({ circle_key: String(circle_key), author_hash: String(author_hash) }, '-created_date', 10), 2500, 'filter').catch(() => []);
      let left = 0;
      for (const row of (Array.isArray(rows) ? rows : [])) {
        const ok = await withTimeout(sb.entities.CircleMembership.delete(row.id), 6000, 'delete').then(() => true).catch(() => false);
        if (ok) left += 1;
      }
      return Response.json({ ok: true, left });
    }

    // join (default)
    if (!CIRCLE_KEYS.has(String(circle_key))) return Response.json({ error: 'unknown circle' }, { status: 400 });
    const existing = await withTimeout(sb.entities.CircleMembership.filter({ circle_key: String(circle_key), author_hash: String(author_hash) }, '-created_date', 1), 2500, 'filter').catch(() => []);
    if (Array.isArray(existing) && existing.length) return Response.json({ ok: true, already: true }, { status: 200 });
    const row = await withTimeout(sb.entities.CircleMembership.create({
      circle_key: String(circle_key),
      author_hash: String(author_hash),
      consented: !!p?.consented,
    }), 6000, 'create').catch((e: any) => { console.error('joinCircle create failed:', e?.message || e); return null; });
    if (!row) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true, joined: { circle_key: row.circle_key } });
  } catch (e: any) {
    console.error('joinCircle error:', e?.message || e);
    return Response.json({ error: 'Could not process' }, { status: 500 });
  }
});

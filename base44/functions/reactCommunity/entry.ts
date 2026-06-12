// reactCommunity (Community M1):
// Records a kind one-way reaction on a post or comment, under the service identity.
// Stored for per-identity dedup only — NEVER rendered as a count (no likes/leaderboards).
// Idempotent-ish: a repeat from the same author_hash on the same target is a no-op.
//
// Body: { user_id, author_hash, target_type, target_id, kind }
// Returns: { ok } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const KINDS = ['held', 'me too', 'hear you', 'saved'];

// Timeout guard — an awaited platform read/write that HANGS would wedge the function
// (a plain .catch only catches a throw). Race each against a timeout so it always returns.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, author_hash, target_type, target_id, kind } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!author_hash || !target_id) return Response.json({ error: 'author_hash + target_id required' }, { status: 400 });
  const tt = target_type === 'comment' ? 'comment' : 'post';
  const k = KINDS.includes(kind) ? kind : 'held';

  const sb = base44.asServiceRole;
  // Dedup: same reactor + target + kind already exists → no-op.
  const existing = await withTimeout(sb.entities.Reaction
    .filter({ target_id: String(target_id), author_hash: String(author_hash) }, undefined, 20), 2500, 'dedupe-read').catch(() => []);
  if ((Array.isArray(existing) ? existing : []).some((r: any) => r.kind === k)) {
    return Response.json({ ok: true, deduped: true });
  }

  const ok = await withTimeout(sb.entities.Reaction.create({
    target_type: tt, target_id: String(target_id), author_hash: String(author_hash), kind: k,
  }), 6000, 'create').catch((e: any) => { console.error('reactCommunity create failed:', e?.message || e); return null; });
  if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
  return Response.json({ ok: true });
});

// cancelTwin (M11):
// Lets a member drop a PENDING pairing they opened (the "cancel the search" action)
// so it doesn't linger in the pool as a stale match candidate until the 72h lapse.
// Only acts on a pending pair the caller is a member of; an active pairing is left
// alone (use the normal archive lifecycle). asServiceRole; hashes only.
//
// Body: { user_id, twin_hash, pair_id }
// Returns: { ok } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, twin_hash, pair_id } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!twin_hash || !pair_id) return Response.json({ error: 'twin_hash + pair_id required' }, { status: 400 });

  const sb = base44.asServiceRole;
  const pair = await sb.entities.TwinPair.get(pair_id).catch(() => null);
  if (!pair) return Response.json({ ok: true, gone: true });
  if (pair.a_hash !== twin_hash && pair.b_hash !== twin_hash) {
    return Response.json({ error: 'Not your pairing' }, { status: 403 });
  }
  // Only a still-pending search can be cancelled here.
  if (pair.status !== 'pending') return Response.json({ ok: true, status: pair.status });

  await sb.entities.TwinPair.update(pair_id, { status: 'abandoned' }).catch(() => {});
  return Response.json({ ok: true, status: 'abandoned' });
});

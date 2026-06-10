// deliverWitnessKey:
// The WRITER's half of the zero-knowledge (FWWT2) handoff. Because Witness pairing
// is pull-based, the receiver is unknown when the writer sends — so the data-key
// (DEK) cannot be wrapped to them up front. After a receiver claims (publishing
// their ECDH public key as receiver_pub), the writer's device derives the shared
// secret, wraps the DEK to that receiver, and delivers the wrapped blob here. The
// server stores it and relays it to the assigned receiver; it can NEVER unwrap it
// (it holds neither private key). This is what makes the path true E2E.
//
// Authorisation: only the row's own writer (proven by writer_hash) may deliver, and
// only once a receiver has been assigned. asServiceRole preserves anonymity.
//
// Body: { user_id, writer_hash, request_id, wrapped_key }
// Returns: { ok } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const { user_id, writer_hash, request_id, wrapped_key, against_pub } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!writer_hash || !request_id) {
    return Response.json({ error: 'writer_hash + request_id required' }, { status: 400 });
  }
  if (!wrapped_key || typeof wrapped_key !== 'string') {
    return Response.json({ error: 'wrapped_key required' }, { status: 400 });
  }

  const sb = base44.asServiceRole;
  const row = await sb.entities.WitnessRequest.get(request_id).catch(() => null);
  if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
  if (me.role !== 'admin' && row.writer_hash !== writer_hash) {
    return Response.json({ error: 'Not your request' }, { status: 403 });
  }
  if (row.status === 'cancelled' || row.status === 'expired') {
    return Response.json({ error: 'No longer available' }, { status: 409 });
  }
  // A receiver must have claimed (and published their key) before a wrap is meaningful.
  if (!row.receiver_hash || !row.receiver_pub) {
    return Response.json({ error: 'No receiver yet' }, { status: 409 });
  }
  // M6: the writer wraps the DEK to a SPECIFIC receiver_pub. If the request was
  // rerouted to a new receiver after the writer fetched the old pub, the wrapped key
  // would be undecryptable for the new receiver. Reject a stale wrap so the writer
  // re-wraps to the current receiver instead of silently delivering a dead key.
  if (against_pub && String(against_pub) !== String(row.receiver_pub)) {
    return Response.json({ error: 'receiver changed', receiver_pub: row.receiver_pub }, { status: 409 });
  }

  const ok = await sb.entities.WitnessRequest
    .update(request_id, { wrapped_key: String(wrapped_key) })
    .catch((err: any) => { console.error('deliverWitnessKey update failed:', err?.message || err); return null; });
  if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
  return Response.json({ ok: true });
});

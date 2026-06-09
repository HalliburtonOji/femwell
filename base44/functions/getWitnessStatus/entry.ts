// getWitnessStatus:
// Lets the writer poll their own handoff's lifecycle (matched? opened? which of
// the 4 responses? rerouted? archived?) without a direct entity read — the caller
// proves authorship with writer_hash. Never returns the writer's identity or the
// ciphertext; just the lifecycle the writer is allowed to see.
//
// Body: { user_id, writer_hash, request_id }
// Returns: { ok, gone? , status?, response?, read_at?, responded_at?,
//            cancel_until?, reroute_count?, rerouted? }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const { user_id, writer_hash, request_id } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!writer_hash || !request_id) {
    return Response.json({ error: 'writer_hash + request_id required' }, { status: 400 });
  }

  const sb = base44.asServiceRole;
  const row = await sb.entities.WitnessRequest.get(request_id).catch(() => null);
  if (!row) return Response.json({ ok: true, gone: true });
  if (me.role !== 'admin' && row.writer_hash !== writer_hash) {
    return Response.json({ error: 'Not your request' }, { status: 403 });
  }
  return Response.json({ ok: true,
    status: row.status, response: row.response || null,
    read_at: row.read_at || null, responded_at: row.responded_at || null,
    cancel_until: row.cancel_until || null,
    reroute_count: row.reroute_count || 0, rerouted: !!row.rerouted_from_hash,
    // ZK (FWWT2): once a receiver has claimed, their PUBLIC key appears here so the
    // writer's device can wrap the data-key to them and call deliverWitnessKey.
    // `key_delivered` lets the writer stop once it's done. Absent for legacy FWWT1.
    env_version: row.env_version || 1,
    receiver_pub: row.receiver_pub || null,
    key_delivered: !!row.wrapped_key,
  });
});

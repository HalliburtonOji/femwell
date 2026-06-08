// respondWitness:
// The assigned receiver opens the entry, then either sends ONE of the 4 fixed
// charter responses or passes silently — no free text ever. Verifies the caller
// is the row's assigned receiver_hash before writing. asServiceRole so the row's
// service ownership (and the writer's anonymity) is preserved.
//
// Body: { user_id, request_id, receiver_hash, action, response }
//   action: "open" | "respond" | "pass"
//   response (action=respond): holding_with_you | me_too | not_alone | i_hear_you
// Returns: { ok } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RESPONSES = ['holding_with_you', 'me_too', 'not_alone', 'i_hear_you'];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const { user_id, request_id, receiver_hash, action, response } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!request_id || !receiver_hash) {
    return Response.json({ error: 'request_id + receiver_hash required' }, { status: 400 });
  }

  const sb = base44.asServiceRole;
  const row = await sb.entities.WitnessRequest.get(request_id).catch(() => null);
  if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
  if (row.receiver_hash !== receiver_hash) {
    return Response.json({ error: 'Not your witness' }, { status: 403 });
  }
  if (row.status === 'cancelled' || row.status === 'expired') {
    return Response.json({ error: 'No longer available' }, { status: 409 });
  }

  const nowISO = new Date().toISOString();
  let patch: any;

  if (action === 'open') {
    patch = { read_at: row.read_at || nowISO, status: row.status === 'matched' ? 'opened' : row.status };
  } else if (action === 'pass') {
    patch = { status: 'passed', responded_at: nowISO, read_at: row.read_at || nowISO };
  } else if (action === 'respond') {
    if (!RESPONSES.includes(response)) {
      return Response.json({ error: 'invalid response' }, { status: 400 });
    }
    patch = { response, status: 'responded', responded_at: nowISO, read_at: row.read_at || nowISO };
  } else {
    return Response.json({ error: 'unknown action' }, { status: 400 });
  }

  const ok = await sb.entities.WitnessRequest.update(request_id, patch).catch(() => null);
  if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
  return Response.json({ ok: true, status: patch.status });
});

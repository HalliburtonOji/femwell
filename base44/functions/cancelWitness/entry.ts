// cancelWitness:
// The writer pulls their handoff back within the 2h cancellation window. Proves
// authorship the anonymous way — the caller's writer_hash must match the row —
// then deletes it via asServiceRole (the writer isn't the service-owned row's
// owner, so a plain client delete would be denied). Refuses once a receiver has
// already responded, or once the 2h window has closed.
//
// Body: { user_id, request_id, writer_hash }
// Returns: { ok } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Timeout guard — an awaited platform read/write that HANGS would wedge the function.
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
  try { p = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const { user_id, request_id, writer_hash } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!request_id || !writer_hash) {
    return Response.json({ error: 'request_id + writer_hash required' }, { status: 400 });
  }

  const sb = base44.asServiceRole;
  const row = await withTimeout(sb.entities.WitnessRequest.get(request_id), 2500, 'get').catch(() => null);
  if (!row) return Response.json({ ok: true, alreadyGone: true });
  if (me.role !== 'admin' && row.writer_hash !== writer_hash) {
    return Response.json({ error: 'Not your request' }, { status: 403 });
  }
  if (row.status === 'responded' || row.status === 'passed') {
    return Response.json({ error: 'already-answered' }, { status: 409 });
  }
  const nowISO = new Date().toISOString();
  if (me.role !== 'admin' && (row.cancel_until || '') < nowISO) {
    return Response.json({ error: 'window-closed' }, { status: 409 });
  }

  await withTimeout(sb.entities.WitnessRequest.delete(request_id), 6000, 'delete').catch(() => {});
  return Response.json({ ok: true });
});

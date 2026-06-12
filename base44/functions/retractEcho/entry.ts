// retractEcho:
// Lets an author pull their own echo back. Because echoes are written under the
// service identity (see postEcho), a normal client delete would be denied — the
// author is not the row owner. So we verify ownership the anonymous way: the
// caller proves authorship by presenting the same author_hash stored on the row
// (a salted, device-derived digest — see echoAnon.js). If it matches, we delete
// via asServiceRole. No user id is involved, so anonymity is preserved.
//
// Body: { user_id, echo_id, author_hash }
// Returns: { ok: true } | { error }

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

  let payload: any;
  try { payload = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const { user_id, echo_id, author_hash } = payload || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!echo_id) return Response.json({ error: 'echo_id required' }, { status: 400 });
  if (!author_hash) return Response.json({ error: 'author_hash required' }, { status: 400 });

  const sb = base44.asServiceRole;
  const echo = await withTimeout(sb.entities.Echo.get(echo_id), 2500, 'get').catch(() => null);
  if (!echo) return Response.json({ error: 'Not found' }, { status: 404 });

  // Ownership proof: the hash on the row must match the caller's hash (admins exempt).
  if (me.role !== 'admin' && echo.author_hash !== String(author_hash)) {
    return Response.json({ error: 'Not your echo' }, { status: 403 });
  }

  // Was a bare uncaught `await delete` — a hang/throw here would wedge the function.
  const del = await withTimeout(sb.entities.Echo.delete(echo_id), 6000, 'delete').then(() => true).catch(() => false);
  if (!del) return Response.json({ error: 'Delete failed' }, { status: 500 });
  return Response.json({ ok: true });
});

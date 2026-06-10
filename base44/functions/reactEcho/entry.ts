// reactEcho:
// Bumps ONE of the four kind-reaction counts on an echo, under the service identity,
// so the Echo entity's write policy can stay locked (clients can no longer .update()
// rows directly). Per-device dedup stays the client's job (markReacted in echoAnon);
// here we only ever +1 a KNOWN count field — never set an arbitrary value or field.
//
// Body: { user_id, echo_id, field }   field ∈ held_count|metoo_count|hearyou_count|saved_count
// Returns: { ok, field, count } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FIELDS = ['held_count', 'metoo_count', 'hearyou_count', 'saved_count'];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, echo_id, field } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!echo_id) return Response.json({ error: 'echo_id required' }, { status: 400 });
  if (!FIELDS.includes(field)) return Response.json({ error: 'invalid field' }, { status: 400 });

  const sb = base44.asServiceRole;
  const echo = await sb.entities.Echo.get(echo_id).catch(() => null);
  if (!echo) return Response.json({ error: 'Not found' }, { status: 404 });
  if (echo.hidden) return Response.json({ error: 'unavailable' }, { status: 409 });

  const count = (echo[field] || 0) + 1;
  const ok = await sb.entities.Echo.update(echo_id, { [field]: count })
    .catch((e: any) => { console.error('reactEcho update failed:', e?.message || e); return null; });
  if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
  return Response.json({ ok: true, field, count });
});

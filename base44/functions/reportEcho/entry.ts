// reportEcho:
// Anonymous report on an echo — bumps report_count and auto-hides past the threshold,
// under the service identity, so the Echo write policy can stay locked. Matches the
// auto-hide threshold postEcho uses. Per-device "already reported" dedup is the
// client's job (markReported in echoAnon).
//
// Body: { user_id, echo_id }
// Returns: { ok, report_count, hidden } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REPORT_AUTOHIDE_THRESHOLD = 2;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, echo_id } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!echo_id) return Response.json({ error: 'echo_id required' }, { status: 400 });

  const sb = base44.asServiceRole;
  const echo = await sb.entities.Echo.get(echo_id).catch(() => null);
  if (!echo) return Response.json({ error: 'Not found' }, { status: 404 });

  const report_count = (echo.report_count || 0) + 1;
  const hidden = report_count >= REPORT_AUTOHIDE_THRESHOLD;
  const ok = await sb.entities.Echo.update(echo_id, { report_count, hidden })
    .catch((e: any) => { console.error('reportEcho update failed:', e?.message || e); return null; });
  if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
  return Response.json({ ok: true, report_count, hidden });
});

// reportCommunity (Community M1):
// Anonymous report on a post or comment — bumps report_count and auto-hides past the
// threshold, under the service identity. asServiceRole; only author_hash involved.
//
// Body: { user_id, author_hash, target_type, target_id }
// Returns: { ok, hidden } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AUTOHIDE_THRESHOLD = 2;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, author_hash, target_type, target_id } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!target_id) return Response.json({ error: 'target_id required' }, { status: 400 });

  const sb = base44.asServiceRole;
  const entity = target_type === 'comment' ? sb.entities.Comment : sb.entities.CommunityPost;
  const row = await entity.get(target_id).catch(() => null);
  if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

  const report_count = (row.report_count || 0) + 1;
  const hidden = report_count >= AUTOHIDE_THRESHOLD;
  const patch: any = { report_count, hidden };
  if (target_type === 'comment' && hidden) patch.status = 'removed';
  const ok = await entity.update(target_id, patch)
    .catch((e: any) => { console.error('reportCommunity update failed:', e?.message || e); return null; });
  if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
  return Response.json({ ok: true, hidden });
});

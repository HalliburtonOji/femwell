// postComment (Community M1):
// Adds a flat, anonymous comment to a post — IF that post is open to comments.
// Moderation spine: crisis → route to support (never posted); harmful/out-of-place →
// stored as status:"removed" (a gentle tombstone, body withheld); else visible.
// asServiceRole; only author_hash stored. M2 upgrades moderate() to OpenAI + Jess.
//
// Body: { user_id, author_hash, post_id, body }
// Returns: { ok, comment } | { intercept: true } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { moderate } from '../_shared/communityModeration.ts';

const MAX_LEN = 400;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, author_hash, post_id, body } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!author_hash || !post_id) return Response.json({ error: 'author_hash + post_id required' }, { status: 400 });
  const text = String(body || '').trim();
  if (!text) return Response.json({ error: 'Empty comment' }, { status: 400 });
  if (text.length > MAX_LEN) return Response.json({ error: 'Comment too long' }, { status: 400 });

  const sb = base44.asServiceRole;
  const post = await sb.entities.CommunityPost.get(post_id).catch(() => null);
  if (!post) return Response.json({ error: 'Not found' }, { status: 404 });
  if (post.hidden) return Response.json({ error: 'unavailable' }, { status: 409 });
  if (post.comments_mode === 'reaction') {
    return Response.json({ error: 'reaction-only' }, { status: 409 });
  }

  const mod = await moderate(text);
  if (mod.crisis) return Response.json({ ok: false, intercept: true }, { status: 200 });
  const status = mod.remove ? 'removed' : 'visible';

  const comment = await sb.entities.Comment.create({
    post_id: String(post_id),
    author_hash: String(author_hash),
    body: status === 'removed' ? '' : text,   // never persist the harmful body
    by: 'member',
    status,
    report_count: 0, hidden: false,
  }).catch((e: any) => { console.error('postComment create failed:', e?.message || e); return null; });
  if (!comment) return Response.json({ error: 'Write failed' }, { status: 500 });

  return Response.json({ ok: true, comment: {
    id: comment.id, post_id: comment.post_id, body: comment.body,
    by: comment.by, status: comment.status, created_date: comment.created_date,
  } });
});

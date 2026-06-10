// postCommunityPost (Community M1):
// Creates a room post under the service identity (asServiceRole → created_by is the
// service, never the author). Only the device-derived author_hash is stored. Crisis
// content routes to support and is NEVER posted. Generous per-day cap, server-side.
//
// Body: { user_id, author_hash, room, body, comments_mode, domain }
// Returns: { ok, post } | { error } | { intercept: true }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { isCrisis } from '../_shared/communityModeration.ts';

const ROOMS = ['lounge', 'circles', 'love', 'money', 'style', 'lighter', 'health'];
const MAX_LEN = 800;
const DAILY_CAP = 12;
function startOfTodayISO(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())).toISOString();
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, author_hash, room, body, comments_mode, domain } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!author_hash) return Response.json({ error: 'author_hash required' }, { status: 400 });
  const text = String(body || '').trim();
  if (!text) return Response.json({ error: 'Empty post' }, { status: 400 });
  if (text.length > MAX_LEN) return Response.json({ error: 'Post too long' }, { status: 400 });
  if (isCrisis(text)) return Response.json({ ok: false, intercept: true }, { status: 200 });

  const sb = base44.asServiceRole;
  const since = startOfTodayISO();
  const mine = await sb.entities.CommunityPost.filter({ author_hash: String(author_hash) }, '-created_date', 50).catch(() => []);
  const today = (Array.isArray(mine) ? mine : []).filter((e: any) => (e.created_date || '') >= since).length;
  if (today >= DAILY_CAP) return Response.json({ error: 'rate', today }, { status: 200 });

  const post = await sb.entities.CommunityPost.create({
    room: ROOMS.includes(room) ? room : 'lounge',
    author_hash: String(author_hash),
    body: text,
    comments_mode: comments_mode === 'reaction' ? 'reaction' : 'open',
    by: 'member',
    domain: domain ? String(domain).slice(0, 40) : undefined,
    report_count: 0, hidden: false,
  }).catch((e: any) => { console.error('postCommunityPost create failed:', e?.message || e); return null; });
  if (!post) return Response.json({ error: 'Write failed' }, { status: 500 });

  return Response.json({ ok: true, post: {
    id: post.id, room: post.room, body: post.body, comments_mode: post.comments_mode,
    by: post.by, domain: post.domain || null, created_date: post.created_date,
  } });
});

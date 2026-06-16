// createCommunityPost — Community dispatcher (consolidated for the 50-fn cap). One function,
// four anonymous actions, all asServiceRole (created_by is the service, never the author; only
// the device-derived author_hash is stored). Self-contained; NOTHING after Deno.serve.
//   action "post" (default) → create a room/circle/club post (crisis intercept, keyword floor,
//                             per-day cap; OpenAI screen runs out-of-band via screenContent)
//   action "comment"        → flat anonymous comment on an open post (crisis/keyword screen)
//   action "react"          → kind one-way reaction (dedup; NEVER a count/leaderboard)
//   action "report"         → +1 report_count, auto-hide past threshold
// (Merged faithfully from createCommunityPost/addComment/reactCommunity/reportCommunity.)

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CRISIS_PATTERNS = [
  /\bkill(ing)?\s+myself\b/i, /\bend(ing)?\s+(it|my life|things)\b/i,
  /\b(want|wanting|going)\s+to\s+die\b/i, /\bdon'?t\s+want\s+to\s+(be here|live|wake up|exist)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(living|going on|being here)\b/i, /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm(ing)?\b/i, /\bhurt(ing)?\s+myself\b/i, /\bcut(ting)?\s+myself\b/i,
  /\boverdos(e|ing)\b/i, /\bcan'?t\s+(go on|do this|cope)\s+(any\s*more|anymore)?\b/i,
  /\bbetter\s+off\s+without\s+me\b/i, /\bnothing\s+to\s+live\s+for\b/i,
  /\bhe\s+(hits|beats|hurts)\s+me\b/i, /\bnot\s+safe\s+(at home|here|with him|with her)\b/i,
];
function isCrisis(text: string): boolean { return CRISIS_PATTERNS.some((re) => re.test(text || '')); }
const BANNED = [
  'idiot', 'stupid', 'shut up', 'loser', 'ugly', 'pathetic', 'hate you', 'shut it',
  'kill yourself', 'kys', 'slut', 'whore', 'bitch', 'retard',
];
function localScreen(text: string): { crisis?: boolean; remove?: boolean; ok?: boolean } {
  if (isCrisis(text)) return { crisis: true };
  const t = (text || '').toLowerCase();
  if (BANNED.some((w) => t.includes(w))) return { remove: true };
  return { ok: true };
}

const ROOMS = ['lounge', 'circles', 'love', 'money', 'style', 'lighter', 'health'];
const CIRCLE_KEYS = new Set([
  'ttc', 'pregnancy', 'postpartum', 'perimenopause', 'menopause',
  'pcos', 'endo', 'pmdd', 'books', 'career', 'creativity', 'movement',
]);
const CLUB_KEYS = new Set(['slow-mornings', 'creativity-corner']);
const KINDS = ['held', 'me too', 'hear you', 'saved'];
const MAX_POST_LEN = 800;
const MAX_COMMENT_LEN = 400;
const DAILY_CAP = 12;
const AUTOHIDE_THRESHOLD = 2;
function startOfTodayISO(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())).toISOString();
}
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
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  p = p || {};
  const action = String(p.action || 'post');
  const { user_id, author_hash } = p;
  if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
  if (!author_hash) return Response.json({ error: 'author_hash required' }, { status: 400 });
  const sb = base44.asServiceRole;

  // ── react: kind one-way reaction (dedup; never a count) ───────────────────────────────
  if (action === 'react') {
    const { target_type, target_id, kind } = p;
    if (!target_id) return Response.json({ error: 'author_hash + target_id required' }, { status: 400 });
    const tt = target_type === 'comment' ? 'comment' : 'post';
    const k = KINDS.includes(kind) ? kind : 'held';
    const existing = await withTimeout(sb.entities.Reaction.filter({ target_id: String(target_id), author_hash: String(author_hash) }, undefined, 20), 2500, 'dedupe-read').catch(() => []);
    if ((Array.isArray(existing) ? existing : []).some((r: any) => r.kind === k)) return Response.json({ ok: true, deduped: true });
    const ok = await withTimeout(sb.entities.Reaction.create({ target_type: tt, target_id: String(target_id), author_hash: String(author_hash), kind: k }), 6000, 'create')
      .catch((e: any) => { console.error('reactCommunity create failed:', e?.message || e); return null; });
    if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true });
  }

  // ── report: +1 report_count, auto-hide past threshold ─────────────────────────────────
  if (action === 'report') {
    const { target_type, target_id } = p;
    if (!target_id) return Response.json({ error: 'target_id required' }, { status: 400 });
    const entity = target_type === 'comment' ? sb.entities.Comment : sb.entities.CommunityPost;
    const row = await withTimeout(entity.get(target_id), 2500, 'get').catch(() => null);
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    const report_count = (row.report_count || 0) + 1;
    const hidden = report_count >= AUTOHIDE_THRESHOLD;
    const patch: any = { report_count, hidden };
    if (target_type === 'comment' && hidden) patch.status = 'removed';
    const ok = await withTimeout(entity.update(target_id, patch), 6000, 'update').catch((e: any) => { console.error('reportCommunity update failed:', e?.message || e); return null; });
    if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true, hidden });
  }

  // ── comment: flat anonymous comment on an open post ───────────────────────────────────
  if (action === 'comment') {
    const { post_id, body } = p;
    if (!post_id) return Response.json({ error: 'author_hash + post_id required' }, { status: 400 });
    const text = String(body || '').trim();
    if (!text) return Response.json({ error: 'Empty comment' }, { status: 400 });
    if (text.length > MAX_COMMENT_LEN) return Response.json({ error: 'Comment too long' }, { status: 400 });
    const post = await withTimeout(sb.entities.CommunityPost.get(post_id), 2500, 'post-read').catch(() => null);
    if (!post) return Response.json({ error: 'Not found' }, { status: 404 });
    if (post.hidden) return Response.json({ error: 'unavailable' }, { status: 409 });
    if (post.comments_mode === 'reaction') return Response.json({ error: 'reaction-only' }, { status: 409 });
    const mod = localScreen(text);
    if (mod.crisis) return Response.json({ ok: false, intercept: true }, { status: 200 });
    const status = mod.remove ? 'removed' : 'visible';
    const core: Record<string, unknown> = {
      post_id: String(post_id), author_hash: String(author_hash),
      body: status === 'removed' ? '' : text, by: 'member', status, hidden: false,
    };
    let createErr = '';
    let comment = await withTimeout(sb.entities.Comment.create({ ...core, flagged: false, report_count: 0 }), 6000, 'create-full')
      .catch((e: any) => { createErr = e?.message || String(e); console.error('addComment full create failed:', createErr); return null; });
    if (!comment) {
      comment = await withTimeout(sb.entities.Comment.create(core), 6000, 'create-core')
        .catch((e: any) => { createErr = e?.message || String(e); console.error('addComment core create failed:', createErr); return null; });
    }
    if (!comment) return Response.json({ error: 'Write failed', detail: createErr }, { status: 500 });
    return Response.json({ ok: true, comment: { id: comment.id, post_id: comment.post_id, body: comment.body, by: comment.by, status: comment.status, created_date: comment.created_date } });
  }

  // ── post (default): create a room/circle/club post ────────────────────────────────────
  const { room, body, comments_mode, domain } = p;
  const circle = p?.circle && CIRCLE_KEYS.has(String(p.circle)) ? String(p.circle) : '';
  let club = '';
  if (p?.club) {
    const k = String(p.club);
    if (CLUB_KEYS.has(k) || /^dailyread-[a-z0-9_-]{1,48}$/i.test(k)) club = k;
    else {
      const cr = await withTimeout(sb.entities.Club.filter({ club_key: k, hidden: false }, '-created_date', 1), 2500, 'club-read').catch(() => []);
      if (Array.isArray(cr) && cr.length) club = k;
    }
  }
  const text = String(body || '').trim();
  if (!text) return Response.json({ error: 'Empty post' }, { status: 400 });
  if (text.length > MAX_POST_LEN) return Response.json({ error: 'Post too long' }, { status: 400 });
  const mod = localScreen(text);
  if (mod.crisis) return Response.json({ ok: false, intercept: true }, { status: 200 });
  if (mod.remove) return Response.json({ ok: false, removed: true }, { status: 200 });

  const since = startOfTodayISO();
  const mine = await withTimeout(sb.entities.CommunityPost.filter({ author_hash: String(author_hash) }, '-created_date', 50), 2500, 'rate-read').catch(() => []);
  const today = (Array.isArray(mine) ? mine : []).filter((e: any) => (e.created_date || '') >= since).length;
  if (today >= DAILY_CAP) return Response.json({ error: 'rate', today }, { status: 200 });

  const roomVal = club ? 'clubs' : circle ? 'circles' : (ROOMS.includes(room) ? room : 'lounge');
  const core: Record<string, unknown> = {
    room: roomVal, author_hash: String(author_hash), body: text,
    comments_mode: comments_mode === 'reaction' ? 'reaction' : 'open', by: 'member', hidden: false,
  };
  if (circle) core.circle = circle;
  if (club) core.club = club;
  let createErr = '';
  let post = await withTimeout(sb.entities.CommunityPost.create({ ...core, flagged: false, report_count: 0, ...(domain ? { domain: String(domain).slice(0, 40) } : {}) }), 6000, 'create-full')
    .catch((e: any) => { createErr = e?.message || String(e); console.error('createCommunityPost full create failed:', createErr); return null; });
  if (!post) {
    post = await withTimeout(sb.entities.CommunityPost.create(core), 6000, 'create-core')
      .catch((e: any) => { createErr = e?.message || String(e); console.error('createCommunityPost core create failed:', createErr); return null; });
  }
  if (!post) return Response.json({ error: 'Write failed', detail: createErr }, { status: 500 });
  return Response.json({ ok: true, post: { id: post.id, room: post.room, circle: post.circle || null, club: post.club || null, body: post.body, comments_mode: post.comments_mode, by: post.by, domain: post.domain || null, created_date: post.created_date } });
});

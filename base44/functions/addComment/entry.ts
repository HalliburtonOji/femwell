// addComment (Community M1) — renamed from postComment (Base44 sticky-failure re-register):
// Adds a flat, anonymous comment to a post — IF that post is open to comments.
// Moderation spine: crisis → route to support (never posted); harmful/out-of-place →
// stored as status:"removed" (a gentle tombstone, body withheld); else visible.
// asServiceRole; only author_hash stored. M2 upgrades moderate() to OpenAI + Jess.
//
// Body: { user_id, author_hash, post_id, body }
// Returns: { ok, comment } | { intercept: true } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Moderation inlined (self-contained — no cross-file import that the function deploy
// might miss). crisis → route to support (never post); harmful → auto-remove
// (tombstone). M2 (with the OpenAI key) upgrades shouldRemove to the Moderation API.
const CRISIS_PATTERNS = [
  /\bkill(ing)?\s+myself\b/i, /\bend(ing)?\s+(it|my life|things)\b/i,
  /\b(want|wanting|going)\s+to\s+die\b/i, /\bdon'?t\s+want\s+to\s+(be here|live|wake up|exist)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(living|going on|being here)\b/i, /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm(ing)?\b/i, /\bhurt(ing)?\s+myself\b/i, /\bcut(ting)?\s+myself\b/i,
  /\boverdos(e|ing)\b/i, /\bcan'?t\s+(go on|do this|cope)\s+(any\s*more|anymore)?\b/i,
  /\bbetter\s+off\s+without\s+me\b/i, /\bnothing\s+to\s+live\s+for\b/i,
  /\bhe\s+(hits|beats|hurts)\s+me\b/i, /\bnot\s+safe\s+(at home|here|with him|with her)\b/i,
];
const BANNED = [
  'idiot', 'stupid', 'shut up', 'loser', 'ugly', 'pathetic', 'hate you', 'shut it',
  'kill yourself', 'kys', 'slut', 'whore', 'bitch', 'retard',
];

// PUBLISH-THEN-SCREEN (re-architecture, 2026-06-12). The comment write path runs ONLY fast
// LOCAL checks — crisis intercept + a keyword floor — with NO blocking network call. The
// comment is created and returned immediately; OpenAI moderation runs OUT-OF-BAND afterwards
// via `screenContent` (the client fires it fire-and-forget post-create), which removes
// anything harmful (status:'removed', body withheld) or flags borderline. No awaited external
// call on the write path → no hang, no per-comment paid API.
// Local-only verdict (instant, no network): crisis (route to support, never post) |
// remove (a clear slur/abuse — stored as a tombstone) | ok (publish, screen post-hoc).
function localScreen(text: string): { crisis?: boolean; remove?: boolean; ok?: boolean } {
  if (CRISIS_PATTERNS.some((re) => re.test(text || ''))) return { crisis: true };
  const t = (text || '').toLowerCase();
  if (BANNED.some((w) => t.includes(w))) return { remove: true };
  return { ok: true };
}

const MAX_LEN = 400;

// Timeout guard — any awaited platform read/create that HANGS (vs throws) would wedge the
// function forever (a plain .catch only catches a throw). Racing each against a timeout turns
// a hang into a fast rejection so the handler always returns.
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
  const { user_id, author_hash, post_id, body } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!author_hash || !post_id) return Response.json({ error: 'author_hash + post_id required' }, { status: 400 });
  const text = String(body || '').trim();
  if (!text) return Response.json({ error: 'Empty comment' }, { status: 400 });
  if (text.length > MAX_LEN) return Response.json({ error: 'Comment too long' }, { status: 400 });

  const sb = base44.asServiceRole;
  const post = await withTimeout(sb.entities.CommunityPost.get(post_id), 2500, 'post-read').catch(() => null);
  if (!post) return Response.json({ error: 'Not found' }, { status: 404 });
  if (post.hidden) return Response.json({ error: 'unavailable' }, { status: 409 });
  if (post.comments_mode === 'reaction') {
    return Response.json({ error: 'reaction-only' }, { status: 409 });
  }

  const mod = localScreen(text);
  if (mod.crisis) return Response.json({ ok: false, intercept: true }, { status: 200 });
  const status = mod.remove ? 'removed' : 'visible';   // local keyword removal only; subtler harm caught post-publish

  const core: Record<string, unknown> = {
    post_id: String(post_id),
    author_hash: String(author_hash),
    body: status === 'removed' ? '' : text,   // never persist the harmful body
    by: 'member',
    status,
    hidden: false,
  };
  let createErr = '';
  // Primary create — full payload (flagged/report_count managed by screening). Timeout-guarded.
  let comment = await withTimeout(sb.entities.Comment.create({ ...core, flagged: false, report_count: 0 }), 6000, 'create-full')
    .catch((e: any) => { createErr = e?.message || String(e); console.error('addComment full create failed:', createErr); return null; });
  // Fallback — the comment MUST still post if an optional field isn't on the deployed entity.
  if (!comment) {
    comment = await withTimeout(sb.entities.Comment.create(core), 6000, 'create-core')
      .catch((e: any) => { createErr = e?.message || String(e); console.error('addComment core create failed:', createErr); return null; });
  }
  if (!comment) return Response.json({ error: 'Write failed', detail: createErr }, { status: 500 });

  return Response.json({ ok: true, comment: {
    id: comment.id, post_id: comment.post_id, body: comment.body,
    by: comment.by, status: comment.status, created_date: comment.created_date,
  } });
});

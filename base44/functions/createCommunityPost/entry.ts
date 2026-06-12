// createCommunityPost (Community M1) — renamed from postCommunityPost (Base44 sticky-failure re-register):
// Creates a room post under the service identity (asServiceRole → created_by is the
// service, never the author). Only the device-derived author_hash is stored. Crisis
// content routes to support and is NEVER posted. Generous per-day cap, server-side.
//
// Body: { user_id, author_hash, room, body, comments_mode, domain }
// Returns: { ok, post } | { error } | { intercept: true }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Crisis check inlined (self-contained — keeps this function structurally identical
// to the proven postEcho pattern; no cross-file imports that the function deploy
// might not pick up). Same patterns as postEcho / postTwinEntry.
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

// PUBLISH-THEN-SCREEN (re-architecture, 2026-06-12). The write path runs ONLY fast LOCAL
// checks — crisis intercept + a keyword floor — with NO blocking network call. The post is
// created and returned immediately (<1.5s target); OpenAI moderation runs OUT-OF-BAND
// afterwards via the `screenContent` function (the client fires it fire-and-forget right
// after a successful create), which pulls anything harmful (hidden:true) or flags borderline.
// This removes the posting hang at the root — there is NO awaited external call on the write
// path — and means no paid/blocking API per post.
const BANNED = [
  'idiot', 'stupid', 'shut up', 'loser', 'ugly', 'pathetic', 'hate you', 'shut it',
  'kill yourself', 'kys', 'slut', 'whore', 'bitch', 'retard',
];
// Local-only verdict (instant, no network): crisis (route to support, never post) |
// remove (a clear slur/abuse — rejected at creation) | ok (publish, screen post-hoc).
function localScreen(text: string): { crisis?: boolean; remove?: boolean; ok?: boolean } {
  if (isCrisis(text)) return { crisis: true };
  const t = (text || '').toLowerCase();
  if (BANNED.some((w) => t.includes(w))) return { remove: true };
  return { ok: true };
}

// Timeout guard — an asServiceRole create that HANGS (vs throws) would never settle, so a
// plain .catch() fallback never runs. Racing it against a timeout turns a hang into a
// catchable rejection, so the function always returns (with a diagnostic) and the fallback
// create can actually run. (This is what made the previous .catch fallback ineffective.)
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

const ROOMS = ['lounge', 'circles', 'love', 'money', 'style', 'lighter', 'health'];
// Phase-4 Circles — keep in sync with src/components/community/circlesConfig.js CIRCLE_KEYS.
const CIRCLE_KEYS = new Set([
  'ttc', 'pregnancy', 'postpartum', 'perimenopause', 'menopause',
  'pcos', 'endo', 'pmdd',
  'books', 'career', 'creativity', 'movement',
]);
// Community v2 Clubs (Jess-hosted, live). Keep in sync with clubsConfig.js CLUB_KEYS.
const CLUB_KEYS = new Set([
  'slow-mornings', 'creativity-corner',
]);
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
  // Phase-4 Circles: a post may be scoped to a curated circle. A valid circle pins the post
  // to the 'circles' room so it shows ONLY inside that circle, not in the open rooms.
  const circle = p?.circle && CIRCLE_KEYS.has(String(p.circle)) ? String(p.circle) : '';
  // Community v2 Clubs: a post may be scoped to a Club. A valid club pins the post to the
  // 'clubs' room so it shows ONLY inside that Club, not in the open rooms. (Club takes
  // precedence over circle if somehow both are sent.) Member-Club keys are validated against
  // the live Club entity; Jess-hosted keys against the inlined set.
  let club = '';
  if (p?.club) {
    const k = String(p.club);
    if (CLUB_KEYS.has(k) || /^dailyread-[a-z0-9_-]{1,48}$/i.test(k)) club = k;
    else {
      const cr = await withTimeout(base44.asServiceRole.entities.Club.filter({ club_key: k, hidden: false }, '-created_date', 1), 2500, 'club-read').catch(() => []);
      if (Array.isArray(cr) && cr.length) club = k;
    }
  }
  const text = String(body || '').trim();
  if (!text) return Response.json({ error: 'Empty post' }, { status: 400 });
  if (text.length > MAX_LEN) return Response.json({ error: 'Post too long' }, { status: 400 });

  const mod = localScreen(text);
  if (mod.crisis) return Response.json({ ok: false, intercept: true }, { status: 200 });
  // A clearly-harmful (local keyword) post is the thread root — nothing to tombstone, so it
  // is rejected at creation and never stored. Subtler harm is caught moments later by the
  // out-of-band screenContent pass. Jess declines it gently on the client.
  if (mod.remove) return Response.json({ ok: false, removed: true }, { status: 200 });

  const sb = base44.asServiceRole;
  const since = startOfTodayISO();
  // Rate-cap READ — timeout-guarded + fail-open. This is the ONLY non-create await that
  // createPostDiag does NOT exercise (it does raw create+delete, never this filter-with-sort);
  // an unguarded read here that hung was wedging the function for 27s+ even though the raw
  // create is fast. If it doesn't resolve in 2.5s we skip the cap and still publish — a hung
  // anti-flood read must never block a real post.
  const mine = await withTimeout(sb.entities.CommunityPost.filter({ author_hash: String(author_hash) }, '-created_date', 50), 2500, 'rate-read').catch(() => []);
  const today = (Array.isArray(mine) ? mine : []).filter((e: any) => (e.created_date || '') >= since).length;
  if (today >= DAILY_CAP) return Response.json({ error: 'rate', today }, { status: 200 });

  // Build the payload WITHOUT any undefined-valued keys (optional fields are added only when
  // set). `hidden: false` is always included so the new post matches the rooms' hidden:false read.
  const roomVal = club ? 'clubs' : circle ? 'circles' : (ROOMS.includes(room) ? room : 'lounge');
  const core: Record<string, unknown> = {
    room: roomVal,
    author_hash: String(author_hash),
    body: text,
    comments_mode: comments_mode === 'reaction' ? 'reaction' : 'open',
    by: 'member',
    hidden: false,
  };
  if (circle) core.circle = circle;
  if (club) core.club = club;

  let createErr = '';
  // Primary create — full payload (flagged/report_count managed by screening; domain optional).
  // Timeout-guarded so a hang can't wedge the function.
  let post = await withTimeout(sb.entities.CommunityPost.create({
    ...core, flagged: false, report_count: 0,
    ...(domain ? { domain: String(domain).slice(0, 40) } : {}),
  }), 6000, 'create-full')
    .catch((e: any) => { createErr = e?.message || String(e); console.error('createCommunityPost full create failed:', createErr); return null; });
  // Fallback — if an optional field is rejected/hangs on the deployed entity, the post MUST
  // still publish: retry with the core fields only (still hidden:false → visible in the room).
  if (!post) {
    post = await withTimeout(sb.entities.CommunityPost.create(core), 6000, 'create-core')
      .catch((e: any) => { createErr = e?.message || String(e); console.error('createCommunityPost core create failed:', createErr); return null; });
  }
  if (!post) return Response.json({ error: 'Write failed', detail: createErr }, { status: 500 });

  return Response.json({ ok: true, post: {
    id: post.id, room: post.room, circle: post.circle || null, club: post.club || null, body: post.body, comments_mode: post.comments_mode,
    by: post.by, domain: post.domain || null, created_date: post.created_date,
  } });
});

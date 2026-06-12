// submitGameResponse (Community M3) — one anonymous answer to an open GameRound. A
// choice (this_or_that) or a short line. Open-text is crisis-checked + moderated so a
// nasty answer can never poison Jess's aggregate reveal. One answer per device per round.
// Self-contained. asServiceRole write.
//
// Body: { user_id?, author_hash, round_id, choice?, text? }
// Returns: { ok, response } | { ok, already: true } | { intercept: true } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CRISIS_PATTERNS = [
  /\bkill(ing)?\s+myself\b/i, /\bend(ing)?\s+(it|my life|things)\b/i,
  /\b(want|wanting|going)\s+to\s+die\b/i, /\bdon'?t\s+want\s+to\s+(be here|live|wake up|exist)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(living|going on|being here)\b/i, /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm(ing)?\b/i, /\bhurt(ing)?\s+myself\b/i, /\bcut(ting)?\s+myself\b/i,
  /\boverdos(e|ing)\b/i, /\bcan'?t\s+(go on|do this|cope)\s+(any\s*more|anymore)?\b/i,
  /\bbetter\s+off\s+without\s+me\b/i, /\bnothing\s+to\s+live\s+for\b/i,
];
function isCrisis(text: string): boolean { return CRISIS_PATTERNS.some((re) => re.test(text || '')); }

const BANNED = ['idiot', 'stupid', 'shut up', 'loser', 'ugly', 'pathetic', 'hate you', 'kill yourself', 'kys', 'slut', 'whore', 'bitch', 'retard'];
const REMOVE_CATEGORIES = ['harassment', 'harassment/threatening', 'hate', 'hate/threatening', 'violence', 'violence/graphic', 'sexual/minors'];

async function openaiFlaggedHarmful(text: string): Promise<boolean> {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) return BANNED.some((w) => (text || '').toLowerCase().includes(w));
  try {
    // Hard 4s timeout: a slow/hung moderation endpoint must NEVER block the game-answer path.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: String(text || '').slice(0, 1000) }),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer));
    if (!r.ok) return BANNED.some((w) => (text || '').toLowerCase().includes(w));
    const j = await r.json();
    const res = j?.results?.[0] || {};
    if (!res.flagged) return false;
    const cats = res.categories || {};
    return REMOVE_CATEGORIES.some((c) => cats[c]);
  } catch { return BANNED.some((w) => (text || '').toLowerCase().includes(w)); }
}

const MAX_LEN = 160;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, author_hash, round_id } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
  if (!author_hash || !round_id) return Response.json({ error: 'author_hash + round_id required' }, { status: 400 });

  const choice = p?.choice ? String(p.choice).slice(0, 60) : '';
  const text = p?.text ? String(p.text).trim().slice(0, MAX_LEN) : '';
  if (!choice && !text) return Response.json({ error: 'Empty answer' }, { status: 400 });

  const sb = base44.asServiceRole;
  const round = await sb.entities.GameRound.get(String(round_id)).catch(() => null);
  if (!round) return Response.json({ error: 'Not found' }, { status: 404 });
  if (round.status !== 'open' || Date.parse(round.closes_at || '') <= Date.now()) {
    return Response.json({ error: 'closed' }, { status: 409 });
  }

  // one answer per device per round
  const mine = await sb.entities.GameResponse.filter({ round_id: String(round_id), author_hash: String(author_hash) }, '-created_date', 1).catch(() => []);
  if (Array.isArray(mine) && mine.length) return Response.json({ ok: true, already: true }, { status: 200 });

  if (text) {
    if (isCrisis(text)) return Response.json({ ok: false, intercept: true }, { status: 200 });
    if (await openaiFlaggedHarmful(text)) return Response.json({ ok: false, rejected: true }, { status: 200 });
  }

  const response = await sb.entities.GameResponse.create({
    round_id: String(round_id),
    author_hash: String(author_hash),
    choice: choice || undefined,
    text: text || undefined,
  }).catch((e: any) => { console.error('submitGameResponse create failed:', e?.message || e); return null; });
  if (!response) return Response.json({ error: 'Write failed' }, { status: 500 });

  return Response.json({ ok: true, response: { id: response.id, round_id: response.round_id } });
});

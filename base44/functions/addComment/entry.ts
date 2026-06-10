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

// Health-vocab allowlist (M2). This is a women's whole-life community: clinical and
// reproductive language is the POINT, never a violation. If OpenAI flags a comment but
// the only categories are self-harm-adjacent OR the text reads as health discussion, we
// do NOT auto-remove — crisis routing (above) handles genuine self-harm, and borderline
// health talk is queued for human review (flagged:true) rather than silently deleted.
const HEALTH_VOCAB = [
  'period', 'menstru', 'menopaus', 'perimenopaus', 'ovula', 'cycle', 'cramp', 'pms', 'pmdd',
  'pregnan', 'miscarriage', 'miscarry', 'stillbirth', 'postpartum', 'breastfeed', 'nipple',
  'cervix', 'cervical', 'vagina', 'vulva', 'discharge', 'uterus', 'endometri', 'fibroid',
  'pcos', 'fertility', 'ttc', 'ivf', 'hormone', 'oestrogen', 'estrogen', 'progesterone',
  'libido', 'sex drive', 'incontinence', 'pelvic', 'smear', 'mammogram', 'hrt', 'coil', 'iud',
  'abortion', 'termination', 'bleeding', 'spotting', 'hot flush', 'night sweat', 'gp', 'nhs',
];
// Categories that warrant removal in a kind, anonymous community. self_harm is handled by
// crisis routing → support (never removal). sexual health talk is allowlisted above.
const REMOVE_CATEGORIES = [
  'harassment', 'harassment/threatening', 'hate', 'hate/threatening',
  'violence', 'violence/graphic', 'sexual/minors',
];

function isHealthContext(text: string): boolean {
  const t = (text || '').toLowerCase();
  return HEALTH_VOCAB.some((w) => t.includes(w));
}

// OpenAI Moderation API (omni-moderation-latest). Returns availability so the caller can
// fall back to the keyword floor if the key is missing or the API errors (M1-safe).
async function openaiModerate(text: string): Promise<{
  available: boolean; flagged: boolean; categories: Record<string, boolean>;
}> {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) return { available: false, flagged: false, categories: {} };
  try {
    const r = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: String(text || '').slice(0, 4000) }),
    });
    if (!r.ok) return { available: false, flagged: false, categories: {} };
    const j = await r.json();
    const res = j?.results?.[0] || {};
    return { available: true, flagged: !!res.flagged, categories: res.categories || {} };
  } catch {
    return { available: false, flagged: false, categories: {} };
  }
}

// Verdict: crisis (route to support, never post) | remove (tombstone) | flag (visible,
// queued for human review) | ok (visible). Order: crisis first, then OpenAI, then the
// keyword floor as backstop.
async function moderate(text: string): Promise<{
  crisis?: boolean; remove?: boolean; flag?: boolean; ok?: boolean; via?: string;
}> {
  if (CRISIS_PATTERNS.some((re) => re.test(text || ''))) return { crisis: true, via: 'crisis' };

  const ai = await openaiModerate(text);
  if (ai.available && ai.flagged) {
    const hit = REMOVE_CATEGORIES.filter((c) => ai.categories[c]);
    // self_harm without crisis-keyword: route to support rather than remove.
    if (ai.categories['self-harm'] || ai.categories['self-harm/intent'] || ai.categories['self-harm/instructions']) {
      return { crisis: true, via: 'openai-self-harm' };
    }
    if (hit.length) {
      // Allowlist guard: sexual category alone, in clear health context, is not removed —
      // it's queued for review instead (avoids deleting legit sexual-health discussion).
      const onlySexual = hit.every((c) => c.startsWith('sexual')) && !hit.includes('sexual/minors');
      if (onlySexual && isHealthContext(text)) return { flag: true, via: 'openai-health-review' };
      return { remove: true, via: 'openai:' + hit.join(',') };
    }
    // flagged but not in a removal category (e.g. low-grade sexual) → review queue.
    return { flag: true, via: 'openai-flag' };
  }

  // Keyword floor as backstop (also covers the no-key fallback path).
  const t = (text || '').toLowerCase();
  if (BANNED.some((w) => t.includes(w))) return { remove: true, via: 'keyword' };
  return { ok: true, via: ai.available ? 'openai-clean' : 'keyword-clean' };
}

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
  const flagged = !!mod.flag;   // borderline: visible, but queued for human review

  const comment = await sb.entities.Comment.create({
    post_id: String(post_id),
    author_hash: String(author_hash),
    body: status === 'removed' ? '' : text,   // never persist the harmful body
    by: 'member',
    status,
    flagged,
    report_count: 0, hidden: false,
  }).catch((e: any) => { console.error('addComment create failed:', e?.message || e); return null; });
  if (!comment) return Response.json({ error: 'Write failed' }, { status: 500 });

  return Response.json({ ok: true, comment: {
    id: comment.id, post_id: comment.post_id, body: comment.body,
    by: comment.by, status: comment.status, created_date: comment.created_date,
  } });
});

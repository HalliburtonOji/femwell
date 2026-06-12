// screenContent (Community, publish-then-screen — 2026-06-12) — ASYNCHRONOUS post-publish
// moderation. The client fires this fire-and-forget right after a successful createCommunityPost
// / addComment; it is NEVER on the write path, so the author never waits on it. It runs the
// OpenAI Moderation API out-of-band and, if the content is harmful, PULLS it within moments —
// a post → hidden:true (drops from every room, which all read hidden:false); a comment →
// status:'removed' + body withheld (rendered as the gentle "Removed by Jess" tombstone).
// Borderline → flagged:true (visible, queued for human review). Health/reproductive language
// is allowlisted (this is a women's whole-life community). If the key is missing or the API
// errors/times out, the content is LEFT AS-IS — the local crisis+keyword floor already passed
// it on the write path, so failing open here is safe.
//
// Self-contained (gotcha #1); NOTHING declared after Deno.serve (gotcha #3); asServiceRole.
// Body: { kind: 'post' | 'comment', id }   Returns: { ok, action } | { ok, skipped } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HEALTH_VOCAB = [
  'period', 'menstru', 'menopaus', 'perimenopaus', 'ovula', 'cycle', 'cramp', 'pms', 'pmdd',
  'pregnan', 'miscarriage', 'miscarry', 'stillbirth', 'postpartum', 'breastfeed', 'nipple',
  'cervix', 'cervical', 'vagina', 'vulva', 'discharge', 'uterus', 'endometri', 'fibroid',
  'pcos', 'fertility', 'ttc', 'ivf', 'hormone', 'oestrogen', 'estrogen', 'progesterone',
  'libido', 'sex drive', 'incontinence', 'pelvic', 'smear', 'mammogram', 'hrt', 'coil', 'iud',
  'abortion', 'termination', 'bleeding', 'spotting', 'hot flush', 'night sweat', 'gp', 'nhs',
];
const REMOVE_CATEGORIES = [
  'harassment', 'harassment/threatening', 'hate', 'hate/threatening',
  'violence', 'violence/graphic', 'sexual/minors', 'self-harm', 'self-harm/intent', 'self-harm/instructions',
];
function isHealthContext(text: string): boolean {
  const t = (text || '').toLowerCase();
  return HEALTH_VOCAB.some((w) => t.includes(w));
}

// OpenAI Moderation (omni-moderation-latest). Off the user path, but still hard-timed so a
// background invocation can't pile up. available:false → caller leaves the content as-is.
async function openaiModerate(text: string): Promise<{ available: boolean; flagged: boolean; categories: Record<string, boolean> }> {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) return { available: false, flagged: false, categories: {} };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: String(text || '').slice(0, 4000) }),
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer));
    if (!r.ok) return { available: false, flagged: false, categories: {} };
    const j = await r.json();
    const res = j?.results?.[0] || {};
    return { available: true, flagged: !!res.flagged, categories: res.categories || {} };
  } catch { return { available: false, flagged: false, categories: {} }; }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

    let p: any;
    try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
    const kind = String(p?.kind || '');
    const id = String(p?.id || '');
    if (!id || (kind !== 'post' && kind !== 'comment')) {
      return Response.json({ error: 'kind (post|comment) + id required' }, { status: 400 });
    }

    const sb = base44.asServiceRole;
    const entity = kind === 'post' ? sb.entities.CommunityPost : sb.entities.Comment;
    const row = await entity.get(id).catch(() => null);
    if (!row) return Response.json({ ok: true, skipped: 'gone' }, { status: 200 });
    const text = String(row.body || '');
    if (!text) return Response.json({ ok: true, skipped: 'empty' }, { status: 200 });

    const ai = await openaiModerate(text);
    if (!ai.available) return Response.json({ ok: true, skipped: 'unavailable' }, { status: 200 });   // fail open — local floor already passed it
    if (!ai.flagged) return Response.json({ ok: true, clean: true }, { status: 200 });

    const cats = ai.categories;
    const hit = REMOVE_CATEGORIES.filter((c) => cats[c]);
    // Allowlist guard: a sexual-category-only flag in clear health context is NOT removed —
    // it's flagged for review (avoids deleting legitimate sexual-health discussion).
    const onlySexual = hit.length > 0 && hit.every((c) => c.startsWith('sexual')) && !hit.includes('sexual/minors');
    const shouldRemove = hit.length > 0 && !(onlySexual && isHealthContext(text));

    if (shouldRemove) {
      if (kind === 'post') await entity.update(id, { hidden: true }).catch(() => {});
      else await entity.update(id, { status: 'removed', body: '' }).catch(() => {});
      return Response.json({ ok: true, action: 'removed' }, { status: 200 });
    }
    await entity.update(id, { flagged: true }).catch(() => {});
    return Response.json({ ok: true, action: 'flagged' }, { status: 200 });
  } catch (e: any) {
    console.error('screenContent error:', e?.message || e);
    return Response.json({ error: 'screen failed' }, { status: 500 });
  }
});

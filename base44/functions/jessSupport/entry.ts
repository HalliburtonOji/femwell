// jessSupport (Community M2) — Jess, the community host, leaving ONE warm peer-support
// reply on a thread. NEW endpoint (fresh registration; no sticky-failure history).
//
// Judicious by construction, three gates:
//   1. Dedup — if a by:"jess" comment already exists on the post, no-op.
//   2. Heaviness pre-gate — only heavier / support-seeking posts are even considered;
//      light logistics/celebration posts are skipped without spending an LLM call.
//   3. The model itself may decline (should_reply:false) — Jess does not reply on every
//      post, and never just to fill space.
// Tone-locked: warm, brief, UK English, no emoji, never clinical, never diagnosing,
// never advice/"you should", never preachy. Validate + hold, gently. asServiceRole write.
//
// Body: { post_id }
// Returns: { ok, comment } | { ok, skipped: <reason> } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Cues that a post is carrying weight or asking to be held. Deliberately broad — the
// model is the precision gate; this just avoids spending a call on pure logistics.
const HEAVY_CUES = [
  'struggl', 'lonely', 'alone', 'scared', 'afraid', 'anxious', 'anxiety', 'overwhelm',
  'exhausted', 'burnt out', 'burnout', 'cry', 'crying', 'tears', 'breaking', 'broken',
  'lost', 'hopeless', 'numb', 'empty', 'guilt', 'ashamed', 'shame', 'grief', 'grieving',
  'miscarriage', 'loss', 'failed', 'failing', 'failure', 'hard', 'difficult', 'hurt',
  'hurting', 'pain', 'painful', 'low', 'down', 'depress', 'cope', 'coping', 'can\'t',
  'cant', 'no one', 'nobody', 'unseen', 'invisible', 'not enough', 'worthless', 'tired of',
  'don\'t know', 'dont know', 'help', 'advice', 'anyone else', 'does anyone', 'is it normal',
  'worried', 'worry', 'frightened', 'falling apart', 'rock bottom', 'so much', 'too much',
];
function looksHeavy(text: string): boolean {
  const t = (text || '').toLowerCase();
  if (text.trim().endsWith('?')) return true;            // a question is an invitation
  return HEAVY_CUES.some((w) => t.includes(w));
}

const JESS_SYSTEM = [
  'You are Jess, the warm, steady host of a private, anonymous community for women navigating',
  'the whole of their lives — cycles, motherhood, menopause, work, money, love, grief, joy.',
  'A member has posted. You may leave ONE short reply, as a fellow human who is glad she said it.',
  '',
  'Hard rules (never break):',
  '- Plain, warm UK English. No emoji. No exclamation-heavy cheerleading.',
  '- You are NOT a clinician. Never diagnose, never give medical or financial advice, never',
  '  say "you should" or "have you tried". Do not instruct or fix.',
  '- Never preachy, never sappy, never performative. No platitudes ("everything happens for a',
  '  reason", "stay strong", "sending love and light"). No therapy-speak ("hold space",',
  '  "your truth", "lean into").',
  '- 1 to 3 short sentences. Speak to HER, plainly. It is fine to simply witness: "That sounds',
  '  genuinely heavy, and you are not making it up." You may gently note she is not the only',
  '  one, if true. You may invite, never push.',
  '- If the post does not actually need a reply — it is light, logistical, celebratory, or just',
  '  fine on its own — set should_reply to false. You do NOT reply to everything. Silence is',
  '  often the kinder host. Only reply when there is something real to hold.',
].join('\n');

// Timeout guard — an awaited platform read/write that HANGS would wedge the function.
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
  const post_id = p?.post_id;
  if (!post_id) return Response.json({ error: 'post_id required' }, { status: 400 });

  const sb = base44.asServiceRole;
  const post = await withTimeout(sb.entities.CommunityPost.get(String(post_id)), 2500, 'get').catch(() => null);
  if (!post) return Response.json({ error: 'Not found' }, { status: 404 });
  if (post.hidden || post.comments_mode === 'reaction') {
    return Response.json({ ok: true, skipped: 'closed' }, { status: 200 });
  }

  // Gate 1 — dedup: never a second Jess reply on the same thread.
  const existing = await withTimeout(sb.entities.Comment.filter({ post_id: String(post_id), by: 'jess' }, '-created_date', 1), 2500, 'filter').catch(() => []);
  if (Array.isArray(existing) && existing.length) {
    return Response.json({ ok: true, skipped: 'exists' }, { status: 200 });
  }

  // Gate 2 — heaviness pre-gate: don't spend an LLM call on pure logistics/celebration.
  if (!looksHeavy(post.body || '')) {
    return Response.json({ ok: true, skipped: 'light' }, { status: 200 });
  }

  // Gate 2.5 — SAMPLING: Jess replies are OCCASIONAL, not one per eligible heavy thread.
  // A deterministic hash of the post id (stable per thread) keeps paid LLM calls to ~1 in 3.
  let _h = 0; const _pid = String(post_id);
  for (let i = 0; i < _pid.length; i++) _h = (_h * 31 + _pid.charCodeAt(i)) | 0;
  if (Math.abs(_h) % 3 !== 0) return Response.json({ ok: true, skipped: 'sampled-out' }, { status: 200 });

  // Gate 3 — the model may still decline.
  let ai: any = null;
  try {
    // Hard 12s cap: InvokeLLM takes no abort signal, so race it against a timeout.
    // Jess is best-effort enrichment — a slow/hung model must never hang this function.
    const llm = sb.integrations.Core.InvokeLLM({
      prompt: JESS_SYSTEM + '\n\nThe member wrote:\n"""\n' + String(post.body || '').slice(0, 1200) + '\n"""\n\nReturn JSON only.',
      response_json_schema: {
        type: 'object',
        properties: {
          should_reply: { type: 'boolean' },
          reply: { type: 'string' },
        },
        required: ['should_reply'],
      },
    });
    ai = await Promise.race([
      llm,
      new Promise((_, reject) => setTimeout(() => reject(new Error('llm-timeout')), 12000)),
    ]);
  } catch (e: any) {
    console.error('jessSupport InvokeLLM failed:', e?.message || e);
    return Response.json({ ok: true, skipped: 'llm-error' }, { status: 200 });
  }

  const data = ai?.output ?? ai ?? {};
  const reply = String(data?.reply || '').trim();
  if (!data?.should_reply || !reply) {
    return Response.json({ ok: true, skipped: 'declined' }, { status: 200 });
  }

  const comment = await withTimeout(sb.entities.Comment.create({
    post_id: String(post_id),
    author_hash: 'jess',
    body: reply.slice(0, 400),
    by: 'jess',
    status: 'visible',
    flagged: false,
    report_count: 0, hidden: false,
  }), 6000, 'create').catch((e: any) => { console.error('jessSupport create failed:', e?.message || e); return null; });
  if (!comment) return Response.json({ error: 'Write failed' }, { status: 500 });

  return Response.json({ ok: true, comment: {
    id: comment.id, post_id: comment.post_id, body: comment.body,
    by: comment.by, status: comment.status, created_date: comment.created_date,
  } });
});

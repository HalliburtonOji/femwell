// answerQotd (Community M1) — renamed from postQotdResponse (Base44 sticky-failure re-register):
// One anonymous answer to the Question of the Day (1/day per author_hash). Crisis
// content routes to support, never posted. asServiceRole; only author_hash stored.
//
// Body: { user_id, author_hash, prompt_day, prompt_key, body }
// Returns: { ok, response } | { intercept: true } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Crisis check inlined (self-contained — no cross-file import, matching postEcho).
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

const MAX_LEN = 280;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  const { user_id, author_hash, prompt_day, prompt_key, body } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!author_hash || !prompt_day) return Response.json({ error: 'author_hash + prompt_day required' }, { status: 400 });
  const text = String(body || '').trim();
  if (!text) return Response.json({ error: 'Empty answer' }, { status: 400 });
  if (text.length > MAX_LEN) return Response.json({ error: 'Answer too long' }, { status: 400 });
  if (isCrisis(text)) return Response.json({ ok: false, intercept: true }, { status: 200 });

  const sb = base44.asServiceRole;
  // One answer per day per author_hash.
  const mine = await sb.entities.QotdResponse
    .filter({ author_hash: String(author_hash), prompt_day: String(prompt_day) }, undefined, 5).catch(() => []);
  if ((Array.isArray(mine) ? mine : []).length > 0) {
    return Response.json({ ok: true, already: true });
  }

  const response = await sb.entities.QotdResponse.create({
    prompt_day: String(prompt_day),
    prompt_key: prompt_key ? String(prompt_key) : undefined,
    author_hash: String(author_hash),
    body: text, hidden: false,
  }).catch((e: any) => { console.error('postQotdResponse create failed:', e?.message || e); return null; });
  if (!response) return Response.json({ error: 'Write failed' }, { status: 500 });
  return Response.json({ ok: true, response: { id: response.id, body: response.body, created_date: response.created_date } });
});

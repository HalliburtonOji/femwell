// closeTheWeek (Community Phase 4, §P.2.5) — leave one anonymous "close the week" reflection.
// One per week per device. Crisis → route to support (never posted); harmful → status:removed
// (the aggregate reveal withholds it); else visible. The reveal (the room's lines) is read
// publicly from RitualContribution; NO record of who skipped is ever stored. Self-contained
// (gotcha #1); NOTHING after Deno.serve (gotcha #3); asServiceRole.
//
// Body: { user_id?, author_hash, body }   Returns: { ok, contribution } | { intercept } | { ok, already }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CRISIS_PATTERNS = [
  /\bkill(ing)?\s+myself\b/i, /\bend(ing)?\s+(it|my life|things)\b/i,
  /\b(want|wanting|going)\s+to\s+die\b/i, /\bdon'?t\s+want\s+to\s+(be here|live|wake up|exist)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(living|going on|being here)\b/i, /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm(ing)?\b/i, /\bhurt(ing)?\s+myself\b/i, /\bcut(ting)?\s+myself\b/i,
  /\boverdos(e|ing)\b/i, /\bcan'?t\s+(go on|do this|cope)\s+(any\s*more|anymore)?\b/i,
  /\bbetter\s+off\s+without\s+me\b/i, /\bnothing\s+to\s+live\s+for\b/i,
];
const BANNED = ['idiot', 'stupid', 'shut up', 'loser', 'ugly', 'pathetic', 'hate you', 'kill yourself', 'kys', 'slut', 'whore', 'bitch', 'retard'];

// PUBLISH-THEN-SCREEN (re-architecture, 2026-06-12): local-only screen — NO blocking network
// call. Crisis → route to support (never stored); a clear keyword hit → kept out of the
// aggregate reveal (status:removed); else visible. Reflections are short and revealed only
// in aggregate, so the local floor is the screen here. No awaited external call → no hang.
function localFlaggedHarmful(text: string): { crisis: boolean; remove: boolean } {
  if (CRISIS_PATTERNS.some((re) => re.test(text || ''))) return { crisis: true, remove: false };
  return { crisis: false, remove: BANNED.some((w) => (text || '').toLowerCase().includes(w)) };
}

const MAX_LEN = 280;
function weekKey(): string {
  const d = new Date();
  const dow = (d.getUTCDay() + 6) % 7;
  const mon = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow));
  return mon.toISOString().slice(0, 10);
}

// Timeout guard — any awaited platform read/create that HANGS would wedge the function
// (a plain .catch only catches a throw). Race each against a timeout so it always returns.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

    let p: any;
    try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
    const { user_id, author_hash } = p || {};
    if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (!author_hash) return Response.json({ error: 'author_hash required' }, { status: 400 });
    const text = String(p?.body || '').trim();
    if (!text) return Response.json({ error: 'Empty reflection' }, { status: 400 });
    if (text.length > MAX_LEN) return Response.json({ error: 'Too long' }, { status: 400 });

    const sb = base44.asServiceRole;
    const wk = weekKey();
    const mine = await withTimeout(sb.entities.RitualContribution.filter({ week_key: wk, author_hash: String(author_hash) }, '-created_date', 1), 2500, 'dedupe-read').catch(() => []);
    if (Array.isArray(mine) && mine.length) return Response.json({ ok: true, already: true }, { status: 200 });

    const verdict = localFlaggedHarmful(text);
    if (verdict.crisis) return Response.json({ ok: false, intercept: true }, { status: 200 });
    const status = verdict.remove ? 'removed' : 'visible';

    const c = await withTimeout(sb.entities.RitualContribution.create({
      week_key: wk, author_hash: String(author_hash),
      body: status === 'removed' ? '' : text, status, flagged: false, hidden: false,
    }), 6000, 'create').catch((e: any) => { console.error('closeTheWeek create failed:', e?.message || e); return null; });
    if (!c) return Response.json({ error: 'Write failed' }, { status: 500 });

    return Response.json({ ok: true, contribution: { id: c.id, week_key: c.week_key, status: c.status } });
  } catch (e: any) {
    console.error('closeTheWeek error:', e?.message || e);
    return Response.json({ error: 'Could not close the week' }, { status: 500 });
  }
});

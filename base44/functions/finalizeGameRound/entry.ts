// closeGameRound (Community M3) — explicit close. Two callers:
//   - a cron (if Halli sets one): closes any round past its closes_at and writes Jess's
//     aggregate reveal. Without a cron, openGameRound already closes lazily on first view;
//     this is the belt-and-braces / scheduled path.
//   - Halli (owner/admin) with { force: true }: force-close a still-live round NOW, to
//     live-test the close→reveal without waiting out the timer.
// Self-contained (mirrors openGameRound's reveal logic). asServiceRole writes.
//
// Body: { round_id?, room?, force? }   Returns: { ok, round } | { ok, skipped } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const K_FLOOR = 3;
const JESS_VOICE = [
  'You are Jess, the warm host of a private, anonymous community for women navigating the',
  'whole of their lives. You run a nightly light-hearted round in The Lighter Side — pure',
  'fun, belonging and lightness, never competition. Plain warm UK English. No emoji. No',
  'exclamation-cheerleading. Nothing that rates a body, a look, or health. Keep it short.',
].join(' ');

async function writeReveal(sb: any, round: any): Promise<string> {
  const rows = await sb.entities.GameResponse.filter({ round_id: String(round.id) }, '-created_date', 80).catch(() => []);
  const list = Array.isArray(rows) ? rows : [];
  if (list.length < K_FLOOR) {
    return 'Only a couple of us played this one tonight — and that\'s allowed. Quiet rounds count too.';
  }
  const answers = list.map((r: any) => (r.choice || r.text || '').toString().slice(0, 120)).filter(Boolean);
  try {
    const ai = await sb.integrations.Core.InvokeLLM({
      prompt: JESS_VOICE + '\n\nThe round asked: "' + String(round.prompt || '').slice(0, 300) + '"\n\nHere are the anonymous answers:\n' +
        answers.map((a: string) => '- ' + a).join('\n') +
        '\n\nWrite a warm 2-3 sentence AGGREGATE reveal that names the shared mood or the spread of answers. Absolutely NO winners, NO scores, NO "the most popular was X by N votes", no numbers-as-competition. Just gather the room together. Return JSON: { "reveal": string }.',
      response_json_schema: { type: 'object', properties: { reveal: { type: 'string' } }, required: ['reveal'] },
    });
    const data = ai?.output ?? ai ?? {};
    const reveal = String(data?.reveal || '').trim();
    if (reveal) return reveal.slice(0, 600);
  } catch (e: any) { console.error('writeReveal failed:', e?.message || e); }
  return 'However you answered, the room leaned warm tonight — a good spread, and nobody got it wrong.';
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any = {};
  try { p = await req.json(); } catch { p = {}; }
  const force = !!p?.force && me.role === 'admin';   // force-close is owner/admin only

  const sb = base44.asServiceRole;

  // resolve the round: explicit id, else the latest open round in the room
  let round: any = null;
  if (p?.round_id) {
    round = await sb.entities.GameRound.get(String(p.round_id)).catch(() => null);
  } else if (p?.room) {
    const arr = await sb.entities.GameRound.filter({ room: String(p.room), status: 'open' }, '-created_date', 1).catch(() => []);
    round = Array.isArray(arr) && arr.length ? arr[0] : null;
  }
  if (!round) return Response.json({ error: 'No round' }, { status: 404 });
  if (round.status === 'closed') return Response.json({ ok: true, skipped: 'already-closed' }, { status: 200 });

  const expired = Date.parse(round.closes_at || '') <= Date.now();
  if (!expired && !force) return Response.json({ ok: true, skipped: 'still-open' }, { status: 200 });

  const reveal = await writeReveal(sb, round);
  const updated = await sb.entities.GameRound.update(round.id, { status: 'closed', reveal }).catch(() => null);
  if (!updated) return Response.json({ error: 'Write failed' }, { status: 500 });

  return Response.json({ ok: true, round: { id: round.id, status: 'closed', reveal } });
});

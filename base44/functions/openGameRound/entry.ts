// openGameRound (Community M3) — the cron-free games-master. The client calls this when
// it opens The Lighter Side; the function runs the whole round lifecycle lazily:
//   - if a round is open and live → return it
//   - if a round is open but past closes_at → CLOSE it: Jess writes a warm AGGREGATE
//     reveal (no winners, no scores, no counts), then return the closed round + reveal
//   - if the last round closed recently → keep showing its reveal (lingers)
//   - otherwise → OPEN a fresh round: Jess generates the prompt for today's format
// Self-contained (no shared imports). asServiceRole writes. Reveal + prompt via the
// built-in Claude integration (InvokeLLM).
//
// Body: { room? }   Returns: { ok, round } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ROOMS = ['lounge', 'circles', 'love', 'money', 'style', 'lighter', 'health'];
const OPEN_MS = 20 * 60 * 60 * 1000;      // a round stays open ~20h ("tonight's round")
const LINGER_MS = 20 * 60 * 60 * 1000;    // a closed reveal lingers ~20h before the next opens
const K_FLOOR = 3;                        // below this, no thin aggregate — a gentle line instead

// Light, whole-life, SAFE formats only (never health-graded, never body-rating).
const KINDS = [
  { kind: 'this_or_that', ask: 'a gentle "this or that" with exactly two cosy, low-stakes options (e.g. cosy night in vs big night out, tea vs coffee, mountains vs sea). Return the two options.' },
  { kind: 'one_word', ask: 'a prompt answered in ONE word (e.g. "first word that comes to mind for Sunday?").' },
  { kind: 'caption', ask: 'describe a small wholesome everyday scene in one line and invite the room to caption the FEELING of it (never a person, never a body).' },
  { kind: 'one_line_story', ask: 'a single warm opening line of a story for the room to each add the next line to (exquisite-corpse style).' },
  { kind: 'kind_confession', ask: 'invite a tiny, harmless, funny confession (a small private habit no one knows) — nothing shameful, nothing intimate.' },
  { kind: 'recommend', ask: 'ask the room to recommend ONE small comfort (a comfort show, a cosy recipe, a feel-good song).' },
];

// Timeout guard — an awaited platform read/write that HANGS would wedge the function.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

function pickKind(): typeof KINDS[number] {
  // rotate by day-of-year so it varies but is deterministic within a day
  const n = new Date();
  const start = Date.UTC(n.getUTCFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()) - start) / 86400000);
  return KINDS[day % KINDS.length];
}

const JESS_VOICE = [
  'You are Jess, the warm host of a private, anonymous community for women navigating the',
  'whole of their lives. You run a nightly light-hearted round in The Lighter Side — pure',
  'fun, belonging and lightness, never competition. Plain warm UK English. No emoji. No',
  'exclamation-cheerleading. Nothing that rates a body, a look, or health. Keep it short.',
].join(' ');

async function genPrompt(sb: any, kindDef: typeof KINDS[number]): Promise<{ prompt: string; options: string[] }> {
  try {
    const ai = await withTimeout(sb.integrations.Core.InvokeLLM({
      prompt: JESS_VOICE + '\n\nWrite ' + kindDef.ask + '\nReturn JSON: { "prompt": string, "options": string[] }. options is [] unless this is a two-choice format.',
      response_json_schema: {
        type: 'object',
        properties: { prompt: { type: 'string' }, options: { type: 'array', items: { type: 'string' } } },
        required: ['prompt'],
      },
    }), 12000, 'llm');
    const data = ai?.output ?? ai ?? {};
    const prompt = String(data?.prompt || '').trim();
    const options = Array.isArray(data?.options) ? data.options.map((o: any) => String(o).slice(0, 40)).slice(0, 2) : [];
    if (prompt) return { prompt, options: kindDef.kind === 'this_or_that' ? options : [] };
  } catch (e: any) { console.error('genPrompt failed:', e?.message || e); }
  // Fallback prompts if the LLM is unavailable — the round still opens.
  const fb: Record<string, { prompt: string; options: string[] }> = {
    this_or_that: { prompt: 'Cosy night in, or a big night out?', options: ['Cosy night in', 'Big night out'] },
    one_word: { prompt: 'First word that comes to mind for "Sunday"?', options: [] },
    caption: { prompt: 'A kettle clicking off in a quiet kitchen at dawn — caption the feeling.', options: [] },
    one_line_story: { prompt: 'She opened the door she\'d walked past a hundred times, and…', options: [] },
    kind_confession: { prompt: 'A tiny harmless habit no one knows you have?', options: [] },
    recommend: { prompt: 'Recommend the room one small comfort — a show, a song, a snack.', options: [] },
  };
  return fb[kindDef.kind] || fb.one_word;
}

async function writeReveal(sb: any, round: any): Promise<string> {
  const rows = await withTimeout(sb.entities.GameResponse.filter({ round_id: String(round.id) }, '-created_date', 80), 2500, 'filter').catch(() => []);
  const list = Array.isArray(rows) ? rows : [];
  if (list.length < K_FLOOR) {
    return 'Only a couple of us played this one tonight — and that\'s allowed. Quiet rounds count too.';
  }
  const answers = list.map((r: any) => (r.choice || r.text || '').toString().slice(0, 120)).filter(Boolean);
  try {
    const ai = await withTimeout(sb.integrations.Core.InvokeLLM({
      prompt: JESS_VOICE + '\n\nThe round asked: "' + String(round.prompt || '').slice(0, 300) + '"\n\nHere are the anonymous answers:\n' +
        answers.map((a: string) => '- ' + a).join('\n') +
        '\n\nWrite a warm 2-3 sentence AGGREGATE reveal that names the shared mood or the spread of answers. Absolutely NO winners, NO scores, NO "the most popular was X by N votes", no numbers-as-competition. Just gather the room together. Return JSON: { "reveal": string }.',
      response_json_schema: { type: 'object', properties: { reveal: { type: 'string' } }, required: ['reveal'] },
    }), 12000, 'llm');
    const data = ai?.output ?? ai ?? {};
    const reveal = String(data?.reveal || '').trim();
    if (reveal) return reveal.slice(0, 600);
  } catch (e: any) { console.error('writeReveal failed:', e?.message || e); }
  return 'However you answered, the room leaned warm tonight — a good spread, and nobody got it wrong.';
}

// Defined BEFORE Deno.serve so that NOTHING is declared after the serve call — some
// build/registration steps treat Deno.serve as the module entry/end and drop or break
// any trailing top-level declaration, which would make every invoke (incl. the deploy
// probe) throw and the function fail to register.
function shape(r: any) {
  return {
    id: r.id, room: r.room, kind: r.kind, prompt: r.prompt,
    options: Array.isArray(r.options) ? r.options : [],
    opens_at: r.opens_at, closes_at: r.closes_at, status: r.status,
    reveal: r.status === 'closed' ? (r.reveal || '') : '',   // never leak a reveal early
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

    let p: any = {};
    try { const j = await req.json(); if (j && typeof j === 'object') p = j; } catch { p = {}; }
    // Two modes:
    //  (a) { kind } → a NAMED game. Each named game runs its OWN independent round in a
    //      dedicated namespace ('lighter:<kind>') and FORCES that format — so The Games
    //      Room can show several real, separately-playable games at once (this-or-that,
    //      one-word, caption, one-line story, kind confession, comfort pick), each with
    //      real GameResponse persistence + Jess's aggregate reveal. Same lifecycle code.
    //  (b) { room } → the original day-rotated nightly round (back-compat, e.g. 'lighter').
    // An empty/invalid call (e.g. a registration probe) gets a clean 400 and NO side effects.
    const kindParam = p?.kind ? String(p.kind) : '';
    const forced = kindParam ? KINDS.find((k) => k.kind === kindParam) : null;
    let room: string;
    if (forced) {
      room = 'lighter:' + forced.kind;
    } else {
      room = p?.room ? String(p.room) : '';
      if (!ROOMS.includes(room)) {
        return Response.json({ error: 'valid room or kind required' }, { status: 400 });
      }
    }

    const sb = base44.asServiceRole;
    const now = Date.now();
    const latestArr = await withTimeout(sb.entities.GameRound.filter({ room }, '-created_date', 1), 2500, 'filter').catch(() => []);
    const latest = Array.isArray(latestArr) && latestArr.length ? latestArr[0] : null;

    const ms = (s: any) => { const t = Date.parse(s || ''); return Number.isFinite(t) ? t : 0; };

    if (latest && latest.status === 'open') {
      if (now < ms(latest.closes_at)) {
        return Response.json({ ok: true, round: shape(latest) });   // live, still open
      }
      // expired → close it with Jess's reveal
      const reveal = await writeReveal(sb, latest);
      const closed = await withTimeout(sb.entities.GameRound.update(latest.id, { status: 'closed', reveal }), 6000, 'update').catch(() => ({ ...latest, status: 'closed', reveal }));
      return Response.json({ ok: true, round: shape({ ...latest, ...closed, status: 'closed', reveal }) });
    }

    if (latest && latest.status === 'closed' && (now - ms(latest.closes_at)) < LINGER_MS) {
      return Response.json({ ok: true, round: shape(latest) });      // keep showing the reveal
    }

    // open a fresh round — forced format for a named game, else the day-rotated pick
    const kindDef = forced || pickKind();
    const { prompt, options } = await genPrompt(sb, kindDef);
    const created = await withTimeout(sb.entities.GameRound.create({
      room, kind: kindDef.kind, prompt, options,
      opens_at: new Date(now).toISOString(),
      closes_at: new Date(now + OPEN_MS).toISOString(),
      status: 'open',
    }), 6000, 'create').catch((e: any) => { console.error('openGameRound create failed:', e?.message || e); return null; });
    if (!created) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true, round: shape(created) });
  } catch (e: any) {
    console.error('openGameRound error:', e?.message || e);
    return Response.json({ error: 'Could not open the round' }, { status: 500 });
  }
});

// createCommunityPost — Community dispatcher (consolidated for the 50-fn cap). One function,
// four anonymous actions, all asServiceRole (created_by is the service, never the author; only
// the device-derived author_hash is stored). Self-contained; NOTHING after Deno.serve.
//   action "post" (default) → create a room/circle/club post (crisis intercept, keyword floor,
//                             per-day cap; OpenAI screen runs out-of-band via screenContent)
//   action "comment"        → flat anonymous comment on an open post (crisis/keyword screen)
//   action "react"          → kind one-way reaction (dedup; NEVER a count/leaderboard)
//   action "report"         → +1 report_count, auto-hide past threshold
// (Merged faithfully from createCommunityPost/addComment/reactCommunity/reportCommunity.)

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
const BANNED = [
  'idiot', 'stupid', 'shut up', 'loser', 'ugly', 'pathetic', 'hate you', 'shut it',
  'kill yourself', 'kys', 'slut', 'whore', 'bitch', 'retard',
];
function localScreen(text: string): { crisis?: boolean; remove?: boolean; ok?: boolean } {
  if (isCrisis(text)) return { crisis: true };
  const t = (text || '').toLowerCase();
  if (BANNED.some((w) => t.includes(w))) return { remove: true };
  return { ok: true };
}

const ROOMS = ['lounge', 'circles', 'love', 'money', 'style', 'lighter', 'health'];
const CIRCLE_KEYS = new Set([
  'ttc', 'pregnancy', 'postpartum', 'perimenopause', 'menopause',
  'pcos', 'endo', 'pmdd', 'books', 'career', 'creativity', 'movement',
]);
const CLUB_KEYS = new Set(['slow-mornings', 'creativity-corner']);
const KINDS = ['held', 'me too', 'hear you', 'saved'];
const MAX_POST_LEN = 800;
const MAX_COMMENT_LEN = 400;
const DAILY_CAP = 12;
const AUTOHIDE_THRESHOLD = 2;
// Books & Book Clubs — anonymous reading-activity hardening folded in as dispatcher actions
// (the 50-fn cap blocks NEW function names, but UPDATING this dispatcher is fine). The
// ReadingActivity entity is RLS-locked to admin; all writes/reads go through these
// asServiceRole actions so clients can't touch rows directly + the row carries no user id.
const READING_KINDS = ['prediction', 'progress', 'club_reflection'];
const READING_K_FLOOR = 3;
function startOfTodayISO(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())).toISOString();
}
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

// ── DM moderation (1:1 / Community, 2026-07-13) — the OpenAI moderation layer used BY dm.send,
// INLINE and BEFORE a message is ever delivered (unlike screenContent which runs post-publish for
// rooms). Same omni-moderation model + the health allowlist so legitimate reproductive-health talk
// between two women isn't held. If the key is missing / API errors, available:false and dm.send
// falls back to the local crisis+keyword floor (which has ALREADY run) — it never delivers on the
// strength of a failed AI call, it simply relies on the floor that already passed.
const DM_REMOVE_CATEGORIES = [
  'harassment', 'harassment/threatening', 'hate', 'hate/threatening',
  'violence', 'violence/graphic', 'sexual/minors', 'self-harm', 'self-harm/intent', 'self-harm/instructions',
];
const DM_HEALTH_VOCAB = [
  'period', 'menstru', 'menopaus', 'perimenopaus', 'ovula', 'cycle', 'cramp', 'pms', 'pmdd',
  'pregnan', 'miscarriage', 'miscarry', 'stillbirth', 'postpartum', 'breastfeed', 'nipple',
  'cervix', 'cervical', 'vagina', 'vulva', 'discharge', 'uterus', 'endometri', 'fibroid',
  'pcos', 'fertility', 'ttc', 'ivf', 'hormone', 'oestrogen', 'estrogen', 'progesterone',
  'libido', 'sex drive', 'incontinence', 'pelvic', 'smear', 'mammogram', 'hrt', 'coil', 'iud',
  'abortion', 'termination', 'bleeding', 'spotting', 'hot flush', 'night sweat', 'gp', 'nhs',
];
function dmIsHealthContext(text: string): boolean {
  const t = (text || '').toLowerCase();
  return DM_HEALTH_VOCAB.some((w) => t.includes(w));
}
async function dmOpenaiModerate(text: string): Promise<{ available: boolean; flagged: boolean; categories: Record<string, boolean> }> {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) return { available: false, flagged: false, categories: {} };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
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

// ── Together substance (#5, 2026-07-14) — curated WEEKLY activities. Deterministic per ISO-week so
// there's always something live without manual admin; seeded idempotently by together.current.
function weekKeyMonday(): string {
  const n = new Date();
  const d = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
  const dow = (d.getUTCDay() + 6) % 7;   // Mon=0
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}
function weekEpoch(mondayISO: string): number {
  return Math.floor(new Date(mondayISO + 'T00:00:00Z').getTime() / (7 * 86400000));
}
const TA_CHALLENGES = [
  { slug: 'read-together', title: 'Read 40 chapters, together', unit: 'chapters', goal: 40, cta_room: 'library',
    blurb: 'Every chapter anyone reads adds to the room’s total. No rush, no rank — just a shelf we fill as one.' },
  { slug: 'move-together', title: 'Move together, 60 times', unit: 'check-ins', goal: 60, cta_room: 'lighter',
    blurb: 'A walk, a stretch, a kitchen dance — tap when you move and watch the room’s total climb.' },
  { slug: 'kind-to-self', title: '30 small kindnesses to yourself', unit: 'kindnesses', goal: 30, cta_room: 'lounge',
    blurb: 'Rest, water, a pause, a no. Add one when you manage it — the bar rises with the whole room.' },
  { slug: 'wind-downs', title: 'A week of wind-downs', unit: 'evenings', goal: 40, cta_room: 'lounge',
    blurb: 'One gentle offline evening. Tap when you take yours — we’re winding down together.' },
];
const TA_WATCH = [
  { slug: 'friday-film', title: 'Friday comfort film', schedule: 'Fridays · 8pm', cta_room: 'lighter',
    blurb: 'We press play around the same time and chat as we go — no spoilers ahead of the room.' },
  { slug: 'sunday-read', title: 'Sunday cosy read-along', schedule: 'Sundays · 7pm', cta_room: 'library',
    blurb: 'An hour with this season’s book, together. Bring tea.' },
];

// ── Games multiplayer (#7, 2026-07-14) — server-authoritative board logic for the game.* actions.
// Boards are compact strings ('0' empty, '1' player A, '2' player B). C4 = 6×7 row-major; TTT = 9.
const GAME_EMOTES = ['Good move', 'Nice one', 'Well played', 'Close!', 'Good game', 'Ha!', 'Thinking…'];
function newBoard(game: string): string { return game === 'tictactoe' ? '0'.repeat(9) : '0'.repeat(42); }
function boardFull(board: string): boolean { return !board.includes('0'); }
// Connect-4: drop a disc into a column (0–6); returns the new board or null if illegal.
function c4Drop(board: string, col: number, mark: string): string | null {
  if (!Number.isInteger(col) || col < 0 || col > 6) return null;
  for (let row = 5; row >= 0; row--) {
    const idx = row * 7 + col;
    if (board[idx] === '0') return board.slice(0, idx) + mark + board.slice(idx + 1);
  }
  return null;   // column full
}
function c4Winner(board: string): string | null {
  const at = (r: number, c: number) => (r >= 0 && r < 6 && c >= 0 && c < 7) ? board[r * 7 + c] : '0';
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    const v = at(r, c); if (v === '0') continue;
    for (const [dr, dc] of dirs) {
      if (at(r + dr, c + dc) === v && at(r + 2 * dr, c + 2 * dc) === v && at(r + 3 * dr, c + 3 * dc) === v) return v;
    }
  }
  return null;
}
// Tic-tac-toe: place at cell 0–8; returns new board or null if illegal.
function tttPlace(board: string, cell: number, mark: string): string | null {
  if (!Number.isInteger(cell) || cell < 0 || cell > 8 || board[cell] !== '0') return null;
  return board.slice(0, cell) + mark + board.slice(cell + 1);
}
function tttWinner(board: string): string | null {
  const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  for (const [a, b, c] of L) { if (board[a] !== '0' && board[a] === board[b] && board[b] === board[c]) return board[a]; }
  return null;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }
  p = p || {};
  const action = String(p.action || 'post');
  const { user_id, author_hash } = p;
  if (user_id && me.role !== 'admin' && me.id !== user_id) return Response.json({ error: 'Forbidden' }, { status: 403 });

  // ════════════════════════════════════════════════════════════════════════════════════════════
  // 1:1 / DM (safety-critical, 2026-07-13). Every dm.* op is asServiceRole + verifies the caller is
  // a participant, so a client can never read/write someone else's thread. THE hard rails live here:
  //   • request-to-chat only (dm.request → pending; dm.send refuses unless status 'active') — no cold DMs
  //   • EVERY message screened BEFORE delivery (dm.send: crisis floor → banned floor → OpenAI) — a
  //     risky message is stored status 'held' and is NEVER returned to the recipient (dm.messages
  //     reads status:'delivered' only). Crisis → sender routed to support, never delivered to a peer.
  //   • block / report / leave everywhere (dm.block/report/leave)
  //   • rate-limits (per-day requests, per-minute sends) — anti-spam / anti-cold-DM
  //   • text-only (body only; no media field exists) · NO location field anywhere (hard rail)
  // 18+ is enforced client-side by the shared AgeGate before the DM surface mounts.
  // ════════════════════════════════════════════════════════════════════════════════════════════
  if (action.startsWith('dm.')) {
    const ah = String(author_hash || '');
    if (!ah) return Response.json({ error: 'author_hash required' }, { status: 400 });
    const sbd = base44.asServiceRole;
    const Conv = sbd.entities.Conversation;
    const Msg = sbd.entities.Message;
    const nowISO = new Date().toISOString();
    const isParticipant = (c: any) => !!c && (c.a_hash === ah || c.b_hash === ah);
    const pubConv = (c: any) => {
      const other = c.a_hash === ah ? { hash: c.b_hash, alias: c.b_alias } : { hash: c.a_hash, alias: c.a_alias };
      const myRead = c.a_hash === ah ? c.a_last_read : c.b_last_read;
      const unread = !!c.last_message_at && (!myRead || myRead < c.last_message_at)
        && c.last_message_snippet !== undefined; // only meaningful once a message exists
      return {
        id: c.id, status: c.status, context: c.context || '',
        other_alias: other.alias || '', other_hash: other.hash,
        last_message_snippet: c.last_message_snippet || '', last_message_at: c.last_message_at || '',
        is_initiator: c.initiator_hash === ah,
        i_am_recipient: c.b_hash === ah && c.initiator_hash !== ah,
        i_blocked: c.status === 'blocked' && c.blocked_by === ah,
        they_blocked: c.status === 'blocked' && c.blocked_by && c.blocked_by !== ah,
        i_left: c.status === 'left' && c.left_by === ah,
        unread: !!unread,
      };
    };
    const pubMsg = (m: any) => ({ id: m.id, sender_hash: m.sender_hash, body: m.body, created_date: m.created_date });

    // — dm.request: request-to-chat (no cold DMs). Creates a PENDING conversation; B must accept. —
    if (action === 'dm.request') {
      const target_hash = String(p.target_hash || '');
      const context = String(p.context || '').slice(0, 200).trim();
      const a_alias = String(p.a_alias || '').slice(0, 48);
      const b_alias = String(p.b_alias || '').slice(0, 48);
      if (!target_hash || target_hash === ah) return Response.json({ error: 'bad target' }, { status: 400 });
      // the context line is screened too (it's the first thing B sees)
      if (context) {
        const ls = localScreen(context);
        if (ls.crisis) return Response.json({ ok: false, intercept: true }, { status: 200 });
        if (ls.remove) return Response.json({ ok: false, held: true, reason: 'unkind' }, { status: 200 });
      }
      const existing = await withTimeout(Conv.filter({}, '-created_date', 300), 4000, 'dm-dedup').catch(() => []);
      // already an open thread between these two? → return it (idempotent, no duplicate requests)
      const found = (existing || []).find((c: any) =>
        ((c.a_hash === ah && c.b_hash === target_hash) || (c.a_hash === target_hash && c.b_hash === ah))
        && (c.status === 'pending' || c.status === 'active'));
      if (found) return Response.json({ ok: true, conversation: pubConv(found), existed: true }, { status: 200 });
      // rate limit: max 10 requests initiated per day
      const mineToday = (existing || []).filter((c: any) => c.initiator_hash === ah && (c.created_date || '') >= startOfTodayISO());
      if (mineToday.length >= 10) return Response.json({ error: 'rate', message: 'You have sent a lot of chat requests today — take a breath and try again tomorrow.' }, { status: 200 });
      const conv = await withTimeout(Conv.create({
        a_hash: ah, b_hash: target_hash, a_alias, b_alias,
        initiator_hash: ah, context, status: 'pending',
      }), 6000, 'dm-create').catch((e: any) => { console.error('dm.request failed:', e?.message || e); return null; });
      if (!conv) return Response.json({ error: 'request failed' }, { status: 500 });
      return Response.json({ ok: true, conversation: pubConv(conv) }, { status: 200 });
    }

    // — dm.respond: B accepts or declines the request. Only the recipient can respond. —
    if (action === 'dm.respond') {
      const conversation_id = String(p.conversation_id || '');
      const accept = p.accept === true;
      const c = await withTimeout(Conv.get(conversation_id), 3000, 'dm-get').catch(() => null);
      if (!c || c.b_hash !== ah || c.status !== 'pending') return Response.json({ error: 'not found' }, { status: 404 });
      await withTimeout(Conv.update(conversation_id, { status: accept ? 'active' : 'declined' }), 6000, 'dm-respond').catch(() => {});
      return Response.json({ ok: true, status: accept ? 'active' : 'declined' }, { status: 200 });
    }

    // — dm.send: THE moderation-before-delivery path. A message is created 'delivered' ONLY after it
    //   passes every screen; risky content is stored 'held' and never surfaced to the recipient. —
    if (action === 'dm.send') {
      const conversation_id = String(p.conversation_id || '');
      const body = String(p.body || '').trim();
      if (!body) return Response.json({ error: 'empty' }, { status: 400 });
      if (body.length > 2000) return Response.json({ error: 'too long', message: 'That message is a little long — try trimming it.' }, { status: 200 });
      const c = await withTimeout(Conv.get(conversation_id), 3000, 'dm-get').catch(() => null);
      if (!c || !isParticipant(c)) return Response.json({ error: 'not found' }, { status: 404 });
      if (c.status !== 'active') {
        const why = c.status === 'pending' ? 'This chat is still waiting to be accepted.'
          : c.status === 'blocked' ? 'This conversation is closed.'
          : c.status === 'left' ? 'This conversation has ended.'
          : 'This chat isn\'t open.';
        return Response.json({ ok: false, held: true, reason: 'closed', message: why }, { status: 200 });
      }
      // rate limit: max 15 sends / 60s by me in this thread
      const recent = await withTimeout(Msg.filter({ conversation_id }, '-created_date', 30), 3000, 'dm-rate').catch(() => []);
      const mineRecent = (recent || []).filter((m: any) => m.sender_hash === ah && (Date.now() - new Date(m.created_date || 0).getTime()) < 60000);
      if (mineRecent.length >= 15) return Response.json({ ok: false, held: true, reason: 'rate', message: 'Slow down a moment — you\'re sending very fast.' }, { status: 200 });

      // ── SCREEN BEFORE DELIVERY ──
      // 1) crisis → route the SENDER to support (never delivered to a peer); store held for care.
      if (isCrisis(body)) {
        await Msg.create({ conversation_id, sender_hash: ah, body, status: 'held', held_reason: 'crisis' }).catch(() => {});
        return Response.json({ ok: false, intercept: true, held: true, reason: 'crisis' }, { status: 200 });
      }
      // 2) local banned-word floor → held, gentle nudge, not delivered.
      const ls = localScreen(body);
      if (ls.remove) {
        await Msg.create({ conversation_id, sender_hash: ah, body, status: 'held', held_reason: 'unkind' }).catch(() => {});
        return Response.json({ ok: false, held: true, reason: 'unkind', message: 'This message wasn\'t sent — let\'s keep it kind here.' }, { status: 200 });
      }
      // 3) OpenAI moderation → held if flagged (sexual-only in clear health context is allowed).
      const ai = await dmOpenaiModerate(body);
      if (ai.available && ai.flagged) {
        const hit = DM_REMOVE_CATEGORIES.filter((cat) => ai.categories[cat]);
        const onlySexual = hit.length > 0 && hit.every((cat) => cat.startsWith('sexual')) && !hit.includes('sexual/minors');
        const shouldHold = hit.length > 0 && !(onlySexual && dmIsHealthContext(body));
        if (shouldHold) {
          await Msg.create({ conversation_id, sender_hash: ah, body, status: 'held', held_reason: 'flagged' }).catch(() => {});
          return Response.json({ ok: false, held: true, reason: 'flagged', message: 'This message wasn\'t sent — it may breach our community care rules.' }, { status: 200 });
        }
      }
      // ── CLEAN → DELIVER ──
      const msg = await withTimeout(Msg.create({ conversation_id, sender_hash: ah, body, status: 'delivered' }), 6000, 'dm-msg').catch((e: any) => { console.error('dm.send create failed:', e?.message || e); return null; });
      if (!msg) return Response.json({ error: 'send failed' }, { status: 500 });
      const patch: any = { last_message_at: nowISO, last_message_snippet: body.slice(0, 80) };
      if (c.a_hash === ah) patch.a_last_read = nowISO; else patch.b_last_read = nowISO;
      await Conv.update(conversation_id, patch).catch(() => {});
      return Response.json({ ok: true, delivered: true, message: pubMsg(msg) }, { status: 200 });
    }

    // — dm.messages: delivered messages of MY conversation (participant-checked); marks me read. —
    if (action === 'dm.messages') {
      const conversation_id = String(p.conversation_id || '');
      const c = await withTimeout(Conv.get(conversation_id), 3000, 'dm-get').catch(() => null);
      if (!c || !isParticipant(c)) return Response.json({ error: 'not found' }, { status: 404 });
      const rows = await withTimeout(Msg.filter({ conversation_id, status: 'delivered' }, 'created_date', 300), 4000, 'dm-msgs').catch(() => []);
      const patch: any = c.a_hash === ah ? { a_last_read: nowISO } : { b_last_read: nowISO };
      await Conv.update(conversation_id, patch).catch(() => {});
      return Response.json({ ok: true, conversation: pubConv(c), messages: (rows || []).map(pubMsg) }, { status: 200 });
    }

    // — dm.conversations: my list (active + pending). Excludes threads I left / that were declined. —
    if (action === 'dm.conversations') {
      const all = await withTimeout(Conv.filter({}, '-last_message_at', 400), 5000, 'dm-list').catch(() => []);
      const mine = (all || []).filter((c: any) =>
        isParticipant(c) && c.status !== 'declined'
        && !(c.status === 'left' && c.left_by === ah)
        && !(c.status === 'blocked' && c.blocked_by !== ah && c.blocked_by)); // if THEY blocked me, hide it
      return Response.json({ ok: true, conversations: mine.map(pubConv) }, { status: 200 });
    }

    // — dm.block / dm.leave: end the thread from my side. Either participant, any active/pending state. —
    if (action === 'dm.block' || action === 'dm.leave') {
      const conversation_id = String(p.conversation_id || '');
      const c = await withTimeout(Conv.get(conversation_id), 3000, 'dm-get').catch(() => null);
      if (!c || !isParticipant(c)) return Response.json({ error: 'not found' }, { status: 404 });
      const patch = action === 'dm.block'
        ? { status: 'blocked', blocked_by: ah }
        : { status: 'left', left_by: ah };
      await withTimeout(Conv.update(conversation_id, patch), 6000, 'dm-end').catch(() => {});
      return Response.json({ ok: true }, { status: 200 });
    }

    // — dm.report: flag the thread (and optionally a message) for human review; not auto-deleted. —
    if (action === 'dm.report') {
      const conversation_id = String(p.conversation_id || '');
      const c = await withTimeout(Conv.get(conversation_id), 3000, 'dm-get').catch(() => null);
      if (!c || !isParticipant(c)) return Response.json({ error: 'not found' }, { status: 404 });
      await withTimeout(Conv.update(conversation_id, { reported: true }), 6000, 'dm-report').catch(() => {});
      return Response.json({ ok: true }, { status: 200 });
    }

    return Response.json({ error: 'unknown dm action' }, { status: 400 });
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════
  // TOGETHER — weekly shared activities (challenge / watch-along). AGGREGATE-ONLY + k-anon: progress
  // and who's-in are COUNTS of GoalContribution rows (tap:<id> = a step, taj:<id> = a join), never a
  // per-person score or rank. The week's curated activities are seeded idempotently on first read.
  // ════════════════════════════════════════════════════════════════════════════════════════════
  if (action.startsWith('together.')) {
    const sbt = base44.asServiceRole;
    const TA = sbt.entities.TogetherActivity;
    const GC = sbt.entities.GoalContribution;
    const wk = weekKeyMonday();
    const ep = weekEpoch(wk);
    const ah = String(author_hash || '');

    const ensure = async () => {
      let rows: any[] = await withTimeout(TA.filter({ week_key: wk }, '-created_date', 50), 4000, 'ta-list').catch(() => []);
      rows = Array.isArray(rows) ? rows : [];
      const chal = TA_CHALLENGES[((ep % TA_CHALLENGES.length) + TA_CHALLENGES.length) % TA_CHALLENGES.length];
      const watch = TA_WATCH[((ep % TA_WATCH.length) + TA_WATCH.length) % TA_WATCH.length];
      const want = [{ kind: 'challenge', ...chal }, { kind: 'watchalong', ...watch }];
      for (const w of want) {
        if (!rows.some((r) => r.slug === w.slug && r.week_key === wk)) {
          const created = await withTimeout(TA.create({ week_key: wk, status: 'open', ...w }), 6000, 'ta-seed').catch(() => null);
          if (created) rows.push(created);
        }
      }
      const seen = new Set<string>();
      return rows.filter((r) => { if (seen.has(r.slug)) return false; seen.add(r.slug); return true; });
    };

    if (action === 'together.current') {
      const acts = await ensure();
      const out: any[] = [];
      for (const a of acts) {
        const steps: any[] = await withTimeout(GC.filter({ goal_key: `tap:${a.id}` }, '-created_date', 4000), 3500, 'ta-steps').catch(() => []);
        const joins: any[] = await withTimeout(GC.filter({ goal_key: `taj:${a.id}` }, '-created_date', 2000), 3000, 'ta-joins').catch(() => []);
        const stepRows = Array.isArray(steps) ? steps : [];
        const joinRows = Array.isArray(joins) ? joins : [];
        const participants = new Set([...stepRows, ...joinRows].map((r) => r.author_hash)).size;
        let joined = false, steppedToday = false;
        if (ah) {
          joined = joinRows.some((r) => r.author_hash === ah) || stepRows.some((r) => r.author_hash === ah);
          const since = startOfTodayISO();
          steppedToday = stepRows.some((r) => r.author_hash === ah && (r.created_date || '') >= since);
        }
        out.push({
          id: a.id, kind: a.kind, slug: a.slug, title: a.title, blurb: a.blurb,
          unit: a.unit || '', goal: a.goal || 0, schedule: a.schedule || '', cta_room: a.cta_room || 'lounge',
          progress: stepRows.length, participants, joined, steppedToday,
        });
      }
      return Response.json({ ok: true, week_key: wk, activities: out }, { status: 200 });
    }

    if (!ah) return Response.json({ error: 'author_hash required' }, { status: 400 });
    const activity_id = String(p.activity_id || '');
    if (!activity_id) return Response.json({ error: 'activity_id required' }, { status: 400 });

    if (action === 'together.join') {
      const existing = await withTimeout(GC.filter({ goal_key: `taj:${activity_id}`, author_hash: ah }, '-created_date', 5), 3000, 'ta-j').catch(() => []);
      if (!(Array.isArray(existing) && existing.length)) {
        await withTimeout(GC.create({ goal_key: `taj:${activity_id}`, moment: 'join', author_hash: ah }), 6000, 'ta-jc').catch(() => {});
      }
      return Response.json({ ok: true, joined: true }, { status: 200 });
    }

    if (action === 'together.step') {
      // per-device daily cap keeps the collective count honest without a leaderboard
      const since = startOfTodayISO();
      const mine: any[] = await withTimeout(GC.filter({ goal_key: `tap:${activity_id}`, author_hash: ah }, '-created_date', 30), 3000, 'ta-s').catch(() => []);
      const today = (Array.isArray(mine) ? mine : []).filter((r) => (r.created_date || '') >= since).length;
      if (today >= 5) return Response.json({ ok: true, capped: true }, { status: 200 });
      await withTimeout(GC.create({ goal_key: `tap:${activity_id}`, moment: 'step', author_hash: ah }), 6000, 'ta-sc').catch(() => {});
      const j = await withTimeout(GC.filter({ goal_key: `taj:${activity_id}`, author_hash: ah }, '-created_date', 5), 3000, 'ta-j2').catch(() => []);
      if (!(Array.isArray(j) && j.length)) await withTimeout(GC.create({ goal_key: `taj:${activity_id}`, moment: 'join', author_hash: ah }), 6000, 'ta-jc2').catch(() => {});
      return Response.json({ ok: true, added: true }, { status: 200 });
    }

    return Response.json({ error: 'unknown together action' }, { status: 400 });
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════
  // GAMES MULTIPLAYER — async turn-based matches vs a real (anonymous) woman. Server-authoritative:
  // every move is validated + the board mutated here, so a client can't cheat or read another match.
  // No free-text — only preset emotes. Block/report/forfeit on every match. 18+ inherited (AgeGate).
  // ════════════════════════════════════════════════════════════════════════════════════════════
  if (action.startsWith('game.')) {
    const sbg = base44.asServiceRole;
    const GM = sbg.entities.GameMatch;
    const ah = String(author_hash || '');
    if (!ah) return Response.json({ error: 'author_hash required' }, { status: 400 });
    const myAlias = String(p.alias || '').slice(0, 48);
    const nowISO = new Date().toISOString();

    const pub = (m: any) => {
      const iAm = m.a_hash === ah ? 'a' : (m.b_hash === ah ? 'b' : null);
      return {
        id: m.id, game: m.game, status: m.status, board: m.board || newBoard(m.game),
        turn: m.turn, winner: m.winner || '', move_count: m.move_count || 0,
        a_alias: m.a_alias || '', b_alias: m.b_alias || '', a_emote: m.a_emote || '', b_emote: m.b_emote || '',
        invite: !!m.invite, room: m.room || '', reported: !!m.reported,
        iAm, myTurn: !!iAm && m.status === 'active' && m.turn === iAm,
        opponent_alias: iAm === 'a' ? (m.b_alias || '') : (m.a_alias || ''),
        last_move_at: m.last_move_at || '',
      };
    };

    // matchmaking: join a waiting public match (not mine), else create one
    if (action === 'game.find') {
      const game = p.game === 'tictactoe' ? 'tictactoe' : 'connect4';
      const waiting: any[] = await withTimeout(GM.filter({ game, status: 'waiting', invite: false }, '-created_date', 40), 4000, 'gm-find').catch(() => []);
      const open = (Array.isArray(waiting) ? waiting : []).find((m) => m.a_hash !== ah && !m.b_hash);
      if (open) {
        await withTimeout(GM.update(open.id, { b_hash: ah, b_alias: myAlias, status: 'active', turn: 'a', last_move_at: nowISO }), 6000, 'gm-join').catch(() => {});
        const fresh = await GM.get(open.id).catch(() => ({ ...open, b_hash: ah, b_alias: myAlias, status: 'active' }));
        return Response.json({ ok: true, match: pub(fresh) }, { status: 200 });
      }
      const created = await withTimeout(GM.create({ game, status: 'waiting', a_hash: ah, a_alias: myAlias, board: newBoard(game), turn: 'a', winner: '', move_count: 0, invite: false, last_move_at: nowISO }), 6000, 'gm-create').catch(() => null);
      if (!created) return Response.json({ error: 'create failed' }, { status: 500 });
      return Response.json({ ok: true, match: pub(created), waiting: true }, { status: 200 });
    }

    // invite a room-mate — a private waiting match joined by its id
    if (action === 'game.invite') {
      const game = p.game === 'tictactoe' ? 'tictactoe' : 'connect4';
      const created = await withTimeout(GM.create({ game, status: 'waiting', a_hash: ah, a_alias: myAlias, board: newBoard(game), turn: 'a', winner: '', move_count: 0, invite: true, room: String(p.room || '').slice(0, 40), last_move_at: nowISO }), 6000, 'gm-inv').catch(() => null);
      if (!created) return Response.json({ error: 'create failed' }, { status: 500 });
      return Response.json({ ok: true, match: pub(created) }, { status: 200 });
    }

    if (action === 'game.join') {
      const m = await withTimeout(GM.get(String(p.match_id || '')), 3000, 'gm-get').catch(() => null);
      if (!m) return Response.json({ error: 'not found' }, { status: 404 });
      if (m.a_hash === ah) return Response.json({ ok: true, match: pub(m) }, { status: 200 });   // it's yours
      if (m.status !== 'waiting' || m.b_hash) return Response.json({ error: 'unavailable', message: 'That game’s already been joined.' }, { status: 200 });
      await withTimeout(GM.update(m.id, { b_hash: ah, b_alias: myAlias, status: 'active', turn: 'a', last_move_at: nowISO }), 6000, 'gm-j').catch(() => {});
      const fresh = await GM.get(m.id).catch(() => ({ ...m, b_hash: ah, b_alias: myAlias, status: 'active' }));
      return Response.json({ ok: true, match: pub(fresh) }, { status: 200 });
    }

    if (action === 'game.state') {
      const m = await withTimeout(GM.get(String(p.match_id || '')), 3000, 'gm-get').catch(() => null);
      if (!m || (m.a_hash !== ah && m.b_hash !== ah)) return Response.json({ error: 'not found' }, { status: 404 });
      return Response.json({ ok: true, match: pub(m) }, { status: 200 });
    }

    // my active/waiting matches (for the list + "your turn" nudge)
    if (action === 'game.mine') {
      const all: any[] = await withTimeout(GM.filter({}, '-last_move_at', 200), 4000, 'gm-mine').catch(() => []);
      const mine = (Array.isArray(all) ? all : []).filter((m) => (m.a_hash === ah || m.b_hash === ah) && m.status !== 'abandoned').slice(0, 30);
      return Response.json({ ok: true, matches: mine.map(pub) }, { status: 200 });
    }

    // THE move — server validates turn + legality, mutates the board, detects a win/draw
    if (action === 'game.move') {
      const m = await withTimeout(GM.get(String(p.match_id || '')), 3000, 'gm-get').catch(() => null);
      if (!m || (m.a_hash !== ah && m.b_hash !== ah)) return Response.json({ error: 'not found' }, { status: 404 });
      if (m.status !== 'active') return Response.json({ error: 'not active', match: pub(m) }, { status: 200 });
      const iAm = m.a_hash === ah ? 'a' : 'b';
      if (m.turn !== iAm) return Response.json({ error: 'not your turn', match: pub(m) }, { status: 200 });
      const mark = iAm === 'a' ? '1' : '2';
      const board0 = m.board || newBoard(m.game);
      const spot = Number(p.spot);
      const next = m.game === 'tictactoe' ? tttPlace(board0, spot, mark) : c4Drop(board0, spot, mark);
      if (!next) return Response.json({ error: 'illegal move', match: pub(m) }, { status: 200 });
      const win = m.game === 'tictactoe' ? tttWinner(next) : c4Winner(next);
      let status = 'active', winner = '', turn = iAm === 'a' ? 'b' : 'a';
      if (win) { status = 'finished'; winner = win === '1' ? 'a' : 'b'; }
      else if (boardFull(next)) { status = 'finished'; winner = 'draw'; }
      await withTimeout(GM.update(m.id, { board: next, turn, status, winner, move_count: (m.move_count || 0) + 1, last_move_at: nowISO }), 6000, 'gm-mv').catch(() => {});
      return Response.json({ ok: true, match: pub({ ...m, board: next, turn, status, winner, move_count: (m.move_count || 0) + 1 }) }, { status: 200 });
    }

    // preset emote only (no free text ever)
    if (action === 'game.emote') {
      const m = await withTimeout(GM.get(String(p.match_id || '')), 3000, 'gm-get').catch(() => null);
      if (!m || (m.a_hash !== ah && m.b_hash !== ah)) return Response.json({ error: 'not found' }, { status: 404 });
      const emote = String(p.emote || '');
      if (!GAME_EMOTES.includes(emote)) return Response.json({ error: 'bad emote' }, { status: 400 });
      const patch = m.a_hash === ah ? { a_emote: emote } : { b_emote: emote };
      await withTimeout(GM.update(m.id, patch), 6000, 'gm-em').catch(() => {});
      return Response.json({ ok: true }, { status: 200 });
    }

    if (action === 'game.forfeit') {
      const m = await withTimeout(GM.get(String(p.match_id || '')), 3000, 'gm-get').catch(() => null);
      if (!m || (m.a_hash !== ah && m.b_hash !== ah)) return Response.json({ error: 'not found' }, { status: 404 });
      const iAm = m.a_hash === ah ? 'a' : 'b';
      const patch = m.status === 'waiting' ? { status: 'abandoned' } : { status: 'finished', winner: iAm === 'a' ? 'b' : 'a' };
      await withTimeout(GM.update(m.id, patch), 6000, 'gm-ff').catch(() => {});
      return Response.json({ ok: true }, { status: 200 });
    }

    if (action === 'game.report') {
      const m = await withTimeout(GM.get(String(p.match_id || '')), 3000, 'gm-get').catch(() => null);
      if (!m || (m.a_hash !== ah && m.b_hash !== ah)) return Response.json({ error: 'not found' }, { status: 404 });
      await withTimeout(GM.update(m.id, { reported: true }), 6000, 'gm-rp').catch(() => {});
      return Response.json({ ok: true }, { status: 200 });
    }

    // game.chat — the in-game chat routes through the DM pipeline (NOT a separate game chat). A
    // shared ACTIVE match is a fair basis for a direct thread, so we find-or-create a DM Conversation
    // between the two players set to 'active'; from here the client uses the normal dm.messages /
    // dm.send (screen-BEFORE-deliver) / dm.block / dm.report / dm.leave. A prior BLOCK is respected
    // (chat refused). Every DM rail still applies: 18+, no location, every message screened, block/report.
    if (action === 'game.chat') {
      const m = await withTimeout(GM.get(String(p.match_id || '')), 3000, 'gm-get').catch(() => null);
      if (!m || (m.a_hash !== ah && m.b_hash !== ah)) return Response.json({ error: 'not found' }, { status: 404 });
      if (!m.b_hash || (m.status !== 'active' && m.status !== 'finished')) return Response.json({ ok: false, message: 'No opponent to chat with yet.' }, { status: 200 });
      const Conv = sbg.entities.Conversation;
      const all: any[] = await withTimeout(Conv.filter({}, '-created_date', 300), 4000, 'gc-dedup').catch(() => []);
      const pair = (Array.isArray(all) ? all : []).find((c) =>
        (c.a_hash === m.a_hash && c.b_hash === m.b_hash) || (c.a_hash === m.b_hash && c.b_hash === m.a_hash));
      if (pair) {
        if (pair.status === 'blocked') return Response.json({ ok: false, blocked: true, message: 'Chat isn’t available for this match.' }, { status: 200 });
        if (pair.status === 'pending' || pair.status === 'left') await withTimeout(Conv.update(pair.id, { status: 'active' }), 6000, 'gc-reopen').catch(() => {});
        return Response.json({ ok: true, conversation_id: pair.id, other_alias: pair.a_hash === ah ? (pair.b_alias || '') : (pair.a_alias || '') }, { status: 200 });
      }
      const gname = m.game === 'tictactoe' ? 'Tic-tac-toe' : 'Connect 4';
      const conv = await withTimeout(Conv.create({
        a_hash: m.a_hash, b_hash: m.b_hash, a_alias: m.a_alias || '', b_alias: m.b_alias || '',
        initiator_hash: m.a_hash, context: `Playing ${gname} together`, status: 'active',
      }), 6000, 'gc-create').catch(() => null);
      if (!conv) return Response.json({ error: 'chat unavailable' }, { status: 500 });
      return Response.json({ ok: true, conversation_id: conv.id, other_alias: m.a_hash === ah ? (m.b_alias || '') : (m.a_alias || '') }, { status: 200 });
    }

    return Response.json({ error: 'unknown game action' }, { status: 400 });
  }

  // ── reading activity (Books & Book Clubs) — handled before the author_hash guard since the
  // aggregate reads don't need it. asServiceRole; only author_hash + book/chapter ever stored. ──
  if (action === 'readingActivity.record' || action === 'readingActivity.cohort' || action === 'readingActivity.prediction') {
    const sbr = base44.asServiceRole;
    const book_id = String(p.book_id || '').trim().slice(0, 128);
    const chapter_index = Number(p.chapter_index);
    if (!book_id || !Number.isFinite(chapter_index)) return Response.json({ error: 'book_id + chapter_index required' }, { status: 400 });

    if (action === 'readingActivity.record') {
      const kind = String(p.kind || '').trim();
      if (!author_hash || !READING_KINDS.includes(kind)) return Response.json({ error: 'author_hash + valid kind required' }, { status: 400 });
      const rbody = kind === 'progress' ? '' : String(p.body || '').slice(0, 600);
      const created = await withTimeout(sbr.entities.ReadingActivity.create({ author_hash: String(author_hash), book_id, chapter_index, kind, body: rbody, hidden: false }), 6000, 'ra-create')
        .catch((e: any) => { console.error('readingActivity.record failed:', e?.message || e); return null; });
      if (!created) return Response.json({ error: 'Write failed' }, { status: 500 });
      return Response.json({ ok: true });
    }
    if (action === 'readingActivity.cohort') {
      const rows = await withTimeout(sbr.entities.ReadingActivity.filter({ book_id, kind: 'progress', hidden: false }, '-created_date', 1000), 4000, 'ra-cohort').catch(() => []);
      const hashes = new Set<string>();
      for (const r of (Array.isArray(rows) ? rows : [])) {
        if (r && typeof r.chapter_index === 'number' && r.chapter_index >= chapter_index && r.author_hash) hashes.add(String(r.author_hash));
      }
      const n = hashes.size;
      return Response.json({ ok: true, count: n >= READING_K_FLOOR ? n : null });
    }
    // readingActivity.prediction
    const rows = await withTimeout(sbr.entities.ReadingActivity.filter({ book_id, chapter_index, kind: 'prediction', hidden: false }, '-created_date', 400), 4000, 'ra-pred').catch(() => []);
    const seen = new Set<string>(); const lines: string[] = [];
    for (const r of (Array.isArray(rows) ? rows : [])) {
      if (!r || !r.body || !r.author_hash) continue;
      if (seen.has(String(r.author_hash))) continue;
      seen.add(String(r.author_hash)); lines.push(String(r.body).slice(0, 600));
    }
    return Response.json({ ok: true, lines: lines.length >= READING_K_FLOOR ? lines : [] });
  }

  if (!author_hash) return Response.json({ error: 'author_hash required' }, { status: 400 });
  const sb = base44.asServiceRole;

  // ── react: kind one-way reaction (dedup; never a count) ───────────────────────────────
  if (action === 'react') {
    const { target_type, target_id, kind } = p;
    if (!target_id) return Response.json({ error: 'author_hash + target_id required' }, { status: 400 });
    const tt = target_type === 'comment' ? 'comment' : 'post';
    const k = KINDS.includes(kind) ? kind : 'held';
    const existing = await withTimeout(sb.entities.Reaction.filter({ target_id: String(target_id), author_hash: String(author_hash) }, undefined, 20), 2500, 'dedupe-read').catch(() => []);
    if ((Array.isArray(existing) ? existing : []).some((r: any) => r.kind === k)) return Response.json({ ok: true, deduped: true });
    const ok = await withTimeout(sb.entities.Reaction.create({ target_type: tt, target_id: String(target_id), author_hash: String(author_hash), kind: k }), 6000, 'create')
      .catch((e: any) => { console.error('reactCommunity create failed:', e?.message || e); return null; });
    if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true });
  }

  // ── report: +1 report_count, auto-hide past threshold ─────────────────────────────────
  if (action === 'report') {
    const { target_type, target_id } = p;
    if (!target_id) return Response.json({ error: 'target_id required' }, { status: 400 });
    const entity = target_type === 'comment' ? sb.entities.Comment : sb.entities.CommunityPost;
    const row = await withTimeout(entity.get(target_id), 2500, 'get').catch(() => null);
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    const report_count = (row.report_count || 0) + 1;
    const hidden = report_count >= AUTOHIDE_THRESHOLD;
    const patch: any = { report_count, hidden };
    if (target_type === 'comment' && hidden) patch.status = 'removed';
    const ok = await withTimeout(entity.update(target_id, patch), 6000, 'update').catch((e: any) => { console.error('reportCommunity update failed:', e?.message || e); return null; });
    if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true, hidden });
  }

  // ── comment: flat anonymous comment on an open post ───────────────────────────────────
  if (action === 'comment') {
    const { post_id, body } = p;
    if (!post_id) return Response.json({ error: 'author_hash + post_id required' }, { status: 400 });
    const text = String(body || '').trim();
    if (!text) return Response.json({ error: 'Empty comment' }, { status: 400 });
    if (text.length > MAX_COMMENT_LEN) return Response.json({ error: 'Comment too long' }, { status: 400 });
    const post = await withTimeout(sb.entities.CommunityPost.get(post_id), 2500, 'post-read').catch(() => null);
    if (!post) return Response.json({ error: 'Not found' }, { status: 404 });
    if (post.hidden) return Response.json({ error: 'unavailable' }, { status: 409 });
    if (post.comments_mode === 'reaction') return Response.json({ error: 'reaction-only' }, { status: 409 });
    // Talk substance #2 — threaded replies. parent_id nests this under another comment of the SAME
    // post. Normalise to ONE level: a reply to a reply re-attaches to the top-level parent, so the
    // thread never runs away to the right. A parent that's missing / from another post is ignored.
    let parent_id = '';
    const rawParent = String(p.parent_id || '').trim();
    if (rawParent) {
      const parent = await withTimeout(sb.entities.Comment.get(rawParent), 2500, 'parent-read').catch(() => null);
      if (parent && parent.post_id === String(post_id)) parent_id = parent.parent_id ? String(parent.parent_id) : String(rawParent);
    }
    const mod = localScreen(text);
    if (mod.crisis) return Response.json({ ok: false, intercept: true }, { status: 200 });
    const status = mod.remove ? 'removed' : 'visible';
    const core: Record<string, unknown> = {
      post_id: String(post_id), author_hash: String(author_hash),
      body: status === 'removed' ? '' : text, by: 'member', status, hidden: false,
      ...(parent_id ? { parent_id } : {}),
    };
    let createErr = '';
    let comment = await withTimeout(sb.entities.Comment.create({ ...core, flagged: false, report_count: 0 }), 6000, 'create-full')
      .catch((e: any) => { createErr = e?.message || String(e); console.error('addComment full create failed:', createErr); return null; });
    if (!comment) {
      comment = await withTimeout(sb.entities.Comment.create(core), 6000, 'create-core')
        .catch((e: any) => { createErr = e?.message || String(e); console.error('addComment core create failed:', createErr); return null; });
    }
    if (!comment) return Response.json({ error: 'Write failed', detail: createErr }, { status: 500 });
    return Response.json({ ok: true, comment: { id: comment.id, post_id: comment.post_id, parent_id: comment.parent_id || '', body: comment.body, by: comment.by, status: comment.status, created_date: comment.created_date } });
  }

  // ── post (default): create a room/circle/club post ────────────────────────────────────
  const { room, body, comments_mode, domain } = p;
  // Author-set content warning (Circles, sensitive topics) — a short neutral label; the UI
  // shows a "tap to read" veil when present. Stored on the post, never a hard block.
  const cw = (typeof p?.content_warning === 'string' && p.content_warning.trim()) ? String(p.content_warning).trim().slice(0, 60) : '';
  const circle = p?.circle && CIRCLE_KEYS.has(String(p.circle)) ? String(p.circle) : '';
  let club = '';
  if (p?.club) {
    const k = String(p.club);
    if (CLUB_KEYS.has(k) || /^dailyread-[a-z0-9_-]{1,48}$/i.test(k)) club = k;
    else {
      const cr = await withTimeout(sb.entities.Club.filter({ club_key: k, hidden: false }, '-created_date', 1), 2500, 'club-read').catch(() => []);
      if (Array.isArray(cr) && cr.length) club = k;
    }
  }
  const text = String(body || '').trim();
  if (!text) return Response.json({ error: 'Empty post' }, { status: 400 });
  if (text.length > MAX_POST_LEN) return Response.json({ error: 'Post too long' }, { status: 400 });
  const mod = localScreen(text);
  if (mod.crisis) return Response.json({ ok: false, intercept: true }, { status: 200 });
  if (mod.remove) return Response.json({ ok: false, removed: true }, { status: 200 });

  const since = startOfTodayISO();
  const mine = await withTimeout(sb.entities.CommunityPost.filter({ author_hash: String(author_hash) }, '-created_date', 50), 2500, 'rate-read').catch(() => []);
  const today = (Array.isArray(mine) ? mine : []).filter((e: any) => (e.created_date || '') >= since).length;
  if (today >= DAILY_CAP) return Response.json({ error: 'rate', today }, { status: 200 });

  const roomVal = club ? 'clubs' : circle ? 'circles' : (ROOMS.includes(room) ? room : 'lounge');
  const core: Record<string, unknown> = {
    room: roomVal, author_hash: String(author_hash), body: text,
    comments_mode: comments_mode === 'reaction' ? 'reaction' : 'open', by: 'member', hidden: false,
  };
  if (circle) core.circle = circle;
  if (club) core.club = club;
  let createErr = '';
  let post = await withTimeout(sb.entities.CommunityPost.create({ ...core, flagged: false, report_count: 0, ...(domain ? { domain: String(domain).slice(0, 40) } : {}), ...(cw ? { content_warning: cw } : {}) }), 6000, 'create-full')
    .catch((e: any) => { createErr = e?.message || String(e); console.error('createCommunityPost full create failed:', createErr); return null; });
  if (!post) {
    post = await withTimeout(sb.entities.CommunityPost.create(core), 6000, 'create-core')
      .catch((e: any) => { createErr = e?.message || String(e); console.error('createCommunityPost core create failed:', createErr); return null; });
  }
  if (!post) return Response.json({ error: 'Write failed', detail: createErr }, { status: 500 });
  return Response.json({ ok: true, post: { id: post.id, room: post.room, circle: post.circle || null, club: post.club || null, body: post.body, comments_mode: post.comments_mode, by: post.by, domain: post.domain || null, content_warning: post.content_warning || null, created_date: post.created_date } });
});

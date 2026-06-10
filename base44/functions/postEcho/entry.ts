// postEcho:
// Server-side anonymous write for the Echo Wall. The whole point of this function
// is anonymity: it creates the Echo row via base44.asServiceRole, so the platform
// stamps created_by with the SERVICE identity — never the author's user id. The
// author is only ever recoverable through author_hash (a salted, device-derived
// digest the client computes; see src/components/journal/echo/echoAnon.js), which
// is unlinkable back to the account. The user is authenticated only to gate the
// write (must be signed in, may only post as themselves); their id is never stored.
//
// Body: { user_id, body, author_hash, phase, life_stage, cycle_day,
//         source_entry_hash, live_at, expires_at, visibility }
// Returns: { ok: true, echo } | { ok: false, intercept: true } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MAX_ECHO_LEN = 180;

// Server-side mirror of CRISIS_PATTERNS (src/components/journal/echo/echoConfig.js).
// The client already intercepts on compose; this is belt-and-braces so a crisis
// line can never become a public echo even if the client check is bypassed.
const CRISIS_PATTERNS = [
  /\bkill(ing)?\s+myself\b/i,
  /\bend(ing)?\s+(it|my life|things)\b/i,
  /\b(want|wanting|going)\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+(be here|live|wake up|exist)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(living|going on|being here)\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[-\s]?harm(ing)?\b/i,
  /\bhurt(ing)?\s+myself\b/i,
  /\bcut(ting)?\s+myself\b/i,
  /\boverdos(e|ing)\b/i,
  /\bcan'?t\s+(go on|do this|cope)\s+(any\s*more|anymore)?\b/i,
  /\bbetter\s+off\s+without\s+me\b/i,
  /\bnothing\s+to\s+live\s+for\b/i,
  /\bhe\s+(hits|beats|hurts)\s+me\b/i,
  /\bnot\s+safe\s+(at home|here|with him|with her)\b/i,
];
function isCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

const PHASES = ['menstrual', 'follicular', 'ovulatory', 'luteal', 'unknown'];
const VISIBILITIES = ['same_phase', 'circles', 'all'];

// H5: the 5/day cap was client-only (localStorage) and so floodable. Enforce it
// server-side too, matching postWitnessRequest's pattern.
const DAILY_ECHO_LIMIT = 5;
function startOfTodayISO(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())).toISOString();
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let payload: any;
  try { payload = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const {
    user_id, body, author_hash, phase, life_stage, cycle_day,
    source_entry_hash, live_at, expires_at, visibility,
  } = payload || {};

  // A signed-in user may only post as themselves (admins exempt).
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const line = String(body || '').trim();
  if (!line) return Response.json({ error: 'Empty echo' }, { status: 400 });
  if (line.length > MAX_ECHO_LEN) {
    return Response.json({ error: 'Echo too long' }, { status: 400 });
  }
  if (!author_hash) return Response.json({ error: 'author_hash required' }, { status: 400 });
  if (!live_at || !expires_at) {
    return Response.json({ error: 'live_at + expires_at required' }, { status: 400 });
  }

  // Crisis re-check — route to support instead of writing a public echo.
  if (isCrisis(line)) return Response.json({ ok: false, intercept: true }, { status: 200 });

  // Rate limit (H5) — 5 echoes/day per author_hash, enforced server-side so a
  // tampered / storage-cleared client can't flood the wall.
  const since = startOfTodayISO();
  const mine = await base44.asServiceRole.entities.Echo
    .filter({ author_hash: String(author_hash) }, '-live_at', 50).catch(() => []);
  const today = (Array.isArray(mine) ? mine : []).filter((e: any) => (e.live_at || e.created_date || '') >= since).length;
  if (today >= DAILY_ECHO_LIMIT) {
    return Response.json({ error: 'rate', today }, { status: 200 });
  }

  // The anonymity boundary: asServiceRole means created_by is the service, not the
  // author. No user_id, no account reference is ever written to the row.
  const echo = await base44.asServiceRole.entities.Echo.create({
    body: line,
    author_hash: String(author_hash),
    phase: PHASES.includes(phase) ? phase : 'unknown',
    life_stage: life_stage || undefined,
    cycle_day: typeof cycle_day === 'number' ? cycle_day : undefined,
    source_entry_hash: source_entry_hash || undefined,
    live_at: String(live_at),
    expires_at: String(expires_at),
    held_count: 0, metoo_count: 0, hearyou_count: 0, saved_count: 0,
    report_count: 0, hidden: false,
    visibility: VISIBILITIES.includes(visibility) ? visibility : 'all',
  }).catch((err: any) => {
    console.error('postEcho create failed:', err?.message || err);
    return null;
  });

  if (!echo) return Response.json({ error: 'Write failed' }, { status: 500 });
  return Response.json({ ok: true, echo });
});

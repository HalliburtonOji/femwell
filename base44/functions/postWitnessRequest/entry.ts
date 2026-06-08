// postWitnessRequest:
// Creates a Witness Mode handoff under the SERVICE identity (asServiceRole) so
// created_by never carries the author's user id — only writer_hash (a salted,
// device-derived token) is stored. Enforces the witness gate ("hold 3 before you
// send") and the 1-send/day rate limit server-side, so a tampered client can't
// bypass them. The entry arrives already client-encrypted (entry_ciphertext); the
// server never sees plaintext, so crisis interception is the client's job (it runs
// on the plaintext before encryption — a true E2E consequence).
//
// Body: { user_id, writer_hash, entry_ciphertext, match_phase, match_life_stage,
//         match_language, sent_at, cancel_until, open_deadline, expires_at }
// Returns: { ok, request } | { error, held? }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GATE_HOLDS = 3;          // must have held (responded/passed to) 3 before sending
const SEND_PER_DAY = 1;        // rate limit: 1 witness send/day
const PHASES = ['menstrual', 'follicular', 'ovulatory', 'luteal', 'unknown'];

function startOfTodayISO(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())).toISOString();
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const {
    user_id, writer_hash, entry_ciphertext, match_phase, match_life_stage,
    match_language, sent_at, cancel_until, open_deadline, expires_at,
  } = p || {};

  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!writer_hash) return Response.json({ error: 'writer_hash required' }, { status: 400 });
  if (!entry_ciphertext) return Response.json({ error: 'entry_ciphertext required' }, { status: 400 });
  if (!sent_at || !cancel_until || !open_deadline || !expires_at) {
    return Response.json({ error: 'timestamps required' }, { status: 400 });
  }

  const sb = base44.asServiceRole;

  // Witness gate — count holds this writer has given (as a receiver who responded/passed).
  const heldRows = await sb.entities.WitnessRequest
    .filter({ receiver_hash: writer_hash }, undefined, 500).catch(() => []);
  const held = heldRows.filter((r: any) => r.status === 'responded' || r.status === 'passed').length;
  if (held < GATE_HOLDS) {
    return Response.json({ error: 'gate', held, need: GATE_HOLDS }, { status: 200 });
  }

  // Rate limit — 1 send/day.
  const since = startOfTodayISO();
  const mine = await sb.entities.WitnessRequest
    .filter({ writer_hash }, '-sent_at', 50).catch(() => []);
  const sentToday = mine.filter((r: any) => (r.sent_at || '') >= since).length;
  if (sentToday >= SEND_PER_DAY) {
    return Response.json({ error: 'rate', sentToday }, { status: 200 });
  }

  const request = await sb.entities.WitnessRequest.create({
    writer_hash: String(writer_hash),
    entry_ciphertext: String(entry_ciphertext),
    match_phase: PHASES.includes(match_phase) ? match_phase : 'unknown',
    match_life_stage: match_life_stage || undefined,
    match_language: match_language || 'en-GB',
    status: 'pending',
    gate_passed: true,
    sent_at: String(sent_at),
    cancel_until: String(cancel_until),
    open_deadline: String(open_deadline),
    expires_at: String(expires_at),
    reroute_count: 0,
    hidden: false,
    report_count: 0,
  }).catch((err: any) => { console.error('postWitnessRequest create failed:', err?.message || err); return null; });

  if (!request) return Response.json({ error: 'Write failed' }, { status: 500 });
  // Return only non-sensitive lifecycle fields (never re-emit the ciphertext here).
  return Response.json({ ok: true, request: {
    id: request.id, status: request.status, sent_at: request.sent_at,
    cancel_until: request.cancel_until, open_deadline: request.open_deadline,
    expires_at: request.expires_at,
  } });
});

// claimWitness:
// Pull-based pairing engine. A receiver asks to hold space; we find one pending
// WitnessRequest whose match_phase + match_life_stage + match_language fit them
// (never their own), atomically assign them (receiver_hash, matched_at, status,
// fresh 6h open_deadline), and return it WITH the entry_ciphertext — the blob is
// only ever released to the assigned receiver, never in a list query. Lazy reroute:
// a "matched" request whose 6h open window lapsed unopened is reclaimable once
// (reroute_count cap 1) and earns its ignorer an ignored_repeat strike. Pool
// eligibility: a receiver with 3+ active strikes is removed; receives are capped
// at 3/day. All writes run asServiceRole so no identity leaks.
//
// Body: { user_id, receiver_hash, phase, life_stage, language }
// Returns: { ok, request? , empty?, removed?, rerouted? }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STRIKE_LIMIT = 3;
const RECEIVE_PER_DAY = 3;
const OPEN_HOURS = 6;
const REROUTE_CAP = 1;

const nowMs = () => Date.now();
const iso = (ms: number) => new Date(ms).toISOString();
function startOfTodayISO(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())).toISOString();
}
const lifeMatch = (a: any, b: any) => !a || !b || a === b;

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const { user_id, receiver_hash, phase, life_stage, language, receiver_pub } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!receiver_hash) return Response.json({ error: 'receiver_hash required' }, { status: 400 });

  const sb = base44.asServiceRole;
  const T = nowMs();
  const nowISO = iso(T);

  // Pool eligibility — 3 active strikes removes a receiver.
  const strikes = await sb.entities.WitnessStrike.filter({ receiver_hash }, undefined, 50).catch(() => []);
  const active = strikes.filter((s: any) => s.active !== false && (!s.expires_at || s.expires_at > nowISO)).length;
  if (active >= STRIKE_LIMIT) return Response.json({ ok: true, removed: true });

  // If they already hold one in flight (matched/opened), hand that back — no hoarding.
  const mine = await sb.entities.WitnessRequest.filter({ receiver_hash }, '-matched_at', 50).catch(() => []);
  const inFlight = mine.find((r: any) => (r.status === 'matched' || r.status === 'opened') && !r.hidden && (r.expires_at || '') > nowISO);
  if (inFlight) {
    return Response.json({ ok: true, request: shape(inFlight), rerouted: !!inFlight.rerouted_from_hash });
  }

  // Receives/day cap.
  const since = startOfTodayISO();
  const recvToday = mine.filter((r: any) => (r.matched_at || '') >= since).length;
  if (recvToday >= RECEIVE_PER_DAY) return Response.json({ ok: true, empty: true, capped: true });

  // Candidate pool: pending + stale-matched (rerouteable), matched on phase+language server-side.
  const baseFilter = { match_phase: phase || 'unknown', match_language: language || 'en-GB', hidden: false };
  const pending = await sb.entities.WitnessRequest.filter({ ...baseFilter, status: 'pending' }, 'sent_at', 100).catch(() => []);
  const matched = await sb.entities.WitnessRequest.filter({ ...baseFilter, status: 'matched' }, 'sent_at', 100).catch(() => []);

  const fresh = pending.filter((r: any) =>
    r.writer_hash !== receiver_hash && lifeMatch(r.match_life_stage, life_stage) && (r.expires_at || '') > nowISO);
  const stale = matched.filter((r: any) =>
    r.writer_hash !== receiver_hash && r.receiver_hash !== receiver_hash &&
    lifeMatch(r.match_life_stage, life_stage) && (r.expires_at || '') > nowISO &&
    !r.read_at && (r.open_deadline || '') < nowISO && (r.reroute_count || 0) < REROUTE_CAP);

  const candidates = [...fresh.map((r: any) => ({ r, reroute: false })), ...stale.map((r: any) => ({ r, reroute: true }))]
    .sort((a, b) => (a.r.sent_at || '').localeCompare(b.r.sent_at || ''));
  if (!candidates.length) return Response.json({ ok: true, empty: true });

  // Assign the oldest. Re-read to reduce (not eliminate) the claim race.
  const pick = candidates[0];
  const live = await sb.entities.WitnessRequest.get(pick.r.id).catch(() => null);
  if (!live) return Response.json({ ok: true, empty: true });
  const stillFree = pick.reroute
    ? (live.status === 'matched' && !live.read_at && (live.open_deadline || '') < nowISO && (live.reroute_count || 0) < REROUTE_CAP && live.receiver_hash !== receiver_hash)
    : (live.status === 'pending');
  if (!stillFree) return Response.json({ ok: true, empty: true });   // lost the race; client may retry

  const patch: any = {
    receiver_hash, matched_at: nowISO, status: 'matched',
    open_deadline: iso(T + OPEN_HOURS * 3600e3),
    // ZK (FWWT2): publish the receiver's PUBLIC key so the writer can wrap the
    // data-key to them. No-op for legacy FWWT1 rows (receiver_pub absent).
    ...(receiver_pub ? { receiver_pub: String(receiver_pub) } : {}),
  };
  if (pick.reroute) {
    patch.reroute_count = (live.reroute_count || 0) + 1;
    patch.rerouted_from_hash = live.receiver_hash || undefined;
    // Strike the receiver who let it lapse unopened.
    if (live.receiver_hash) {
      await sb.entities.WitnessStrike.create({
        receiver_hash: live.receiver_hash, request_ref: live.id,
        reason: 'ignored_repeat', struck_at: nowISO, active: true,
      }).catch(() => {});
    }
  }
  const updated = await sb.entities.WitnessRequest.update(live.id, patch).catch(() => null);
  if (!updated) return Response.json({ error: 'Assign failed' }, { status: 500 });
  return Response.json({ ok: true, request: shape({ ...live, ...patch }), rerouted: pick.reroute });
});

// Only the fields a receiver needs to read + respond. entry_ciphertext IS included
// here (this is the gated release to the assigned receiver) but no writer identity.
function shape(r: any) {
  return {
    id: r.id, entry_ciphertext: r.entry_ciphertext,
    match_phase: r.match_phase, match_life_stage: r.match_life_stage,
    status: r.status, matched_at: r.matched_at, open_deadline: r.open_deadline,
    expires_at: r.expires_at, sent_at: r.sent_at,
    // ZK (FWWT2): the receiver needs the scheme + the writer's public key + the
    // wrapped data-key (once the writer has delivered it) to unwrap + decrypt. For
    // legacy FWWT1 rows these are absent and the receiver opens the envelope directly.
    env_version: r.env_version || 1,
    writer_pub: r.writer_pub || null,
    wrapped_key: r.wrapped_key || null,
  };
}

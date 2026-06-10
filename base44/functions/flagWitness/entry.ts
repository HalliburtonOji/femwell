// flagWitness:
// Two moderation paths, both asServiceRole:
//   kind="report" — the assigned receiver flags the writer's entry as harmful;
//     bumps report_count and hides the request past the auto-hide threshold.
//   kind="strike" — records a WitnessStrike against a receiver_hash (capture
//     attempt or charter breach detected on the read view). 3 active strikes
//     remove a receiver from the pairing pool (enforced in claimWitness).
//
// Body: { user_id, request_id, receiver_hash, kind, reason }
// Returns: { ok, report_count?, hidden? } | { error }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REPORT_AUTOHIDE_THRESHOLD = 2;
const STRIKE_REASONS = ['reported', 'charter_breach', 'capture_attempt', 'ignored_repeat', 'other'];

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) return Response.json({ error: 'Sign in required' }, { status: 401 });

  let p: any;
  try { p = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const { user_id, request_id, receiver_hash, kind, reason } = p || {};
  if (user_id && me.role !== 'admin' && me.id !== user_id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!receiver_hash) return Response.json({ error: 'receiver_hash required' }, { status: 400 });

  const sb = base44.asServiceRole;
  const nowISO = new Date().toISOString();

  if (kind === 'report') {
    if (!request_id) return Response.json({ error: 'request_id required' }, { status: 400 });
    const row = await sb.entities.WitnessRequest.get(request_id).catch(() => null);
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    if (row.receiver_hash !== receiver_hash) {
      return Response.json({ error: 'Not your witness' }, { status: 403 });
    }
    const report_count = (row.report_count || 0) + 1;
    const hidden = report_count >= REPORT_AUTOHIDE_THRESHOLD;
    const ok = await sb.entities.WitnessRequest.update(request_id, { report_count, hidden }).catch(() => null);
    if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
    // A reported entry also strikes nothing on the receiver; it's content moderation.
    return Response.json({ ok: true, report_count, hidden });
  }

  if (kind === 'strike') {
    // M10: a strike must be tied to a real request the CALLER is the assigned
    // receiver of (capture/charter breach detected on their own read view). This
    // stops a malicious client striking an arbitrary receiver_hash to evict anyone
    // from the pool. (The internal 'ignored_repeat' strike is written by
    // claimWitness via asServiceRole, never through here.)
    if (!request_id) return Response.json({ error: 'request_id required' }, { status: 400 });
    const row = await sb.entities.WitnessRequest.get(request_id).catch(() => null);
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    if (me.role !== 'admin' && row.receiver_hash !== receiver_hash) {
      return Response.json({ error: 'Not your witness' }, { status: 403 });
    }
    const r = STRIKE_REASONS.includes(reason) ? reason : 'other';
    const ok = await sb.entities.WitnessStrike.create({
      receiver_hash, request_ref: request_id,
      reason: r, struck_at: nowISO, active: true,
    }).catch(() => null);
    if (!ok) return Response.json({ error: 'Write failed' }, { status: 500 });
    return Response.json({ ok: true });
  }

  return Response.json({ error: 'unknown kind' }, { status: 400 });
});

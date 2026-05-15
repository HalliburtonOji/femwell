// evaluateQuietMode — Planner Phase 2 C6 (MP-A2).
//
// Daily orchestrator-fired pass that decides whether to auto-trigger Quiet
// Mode for each user. Two gates per spec_v2 §C6:
//   Gate A — captax.pct > 120% on 3 days running (CapacityTaxLog rolling).
//   Gate B — DailyCheckins where (mood < 3 AND energy < 3) on 2 days running.
//
// Triggered → set UserProfile.quiet_mode_until = now() + 72h.
// Already set in the future → idempotent skip (don't reset the window).
// Manual override (UI Undo) → user clears the flag client-side and we honour
// that via the existing-future-window check.
//
// Body (admin or orchestrator-invoked):
//   POST {}                              — sweep all users
//   POST { user_id: "uid" }              — single-user smoke
//   POST { dry_run: true }               — counts only
//   POST { force_user_id: "uid" }        — flip the flag on regardless of gates
//                                          (dev/QA toggle per spec acceptance)
//
// Returns: { ok, scanned, triggered, skipped, already_active, errors }
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C6.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const QUIET_MODE_HOURS = 72;
const CAPACITY_GATE_PCT = 120;
const CAPACITY_GATE_DAYS = 3;
const MOOD_GATE_DAYS = 2;

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function isFutureIso(iso) {
  if (!iso) return false;
  try { return new Date(iso).getTime() > Date.now(); } catch { return false; }
}

function plusHoursIso(hours) {
  const d = new Date();
  d.setTime(d.getTime() + hours * 3600 * 1000);
  return d.toISOString();
}

async function evalGateA_Capacity(sb, userId) {
  // Last CAPACITY_GATE_DAYS days of CapacityTaxLog. If we don't have enough
  // rows yet (C3.5 persistence is the follow-up), gate silently skips — we
  // don't want a false-positive trigger from absence of data.
  const fromStr = toDateStr(daysAgo(CAPACITY_GATE_DAYS + 1));
  const rows = await sb.entity('CapacityTaxLog')
    .filter({ user_id: userId, week_start_gte: fromStr }, '-week_start', CAPACITY_GATE_DAYS * 2)
    .catch(() => []);
  if (!Array.isArray(rows) || rows.length < CAPACITY_GATE_DAYS) return false;
  // Take the most recent N rows; require ALL to be over the threshold.
  const recent = rows.slice(0, CAPACITY_GATE_DAYS);
  return recent.every((r) => Number(r?.pct_of_capacity) > CAPACITY_GATE_PCT);
}

async function evalGateB_Mood(sb, userId) {
  // Last MOOD_GATE_DAYS+1 days of DailyCheckins. Require MOOD_GATE_DAYS
  // consecutive low-mood + low-energy days.
  const fromStr = toDateStr(daysAgo(MOOD_GATE_DAYS + 1));
  const toStr = toDateStr(new Date());
  const rows = await sb.entity('DailyCheckins')
    .filter({ user_id: userId, date_gte: fromStr, date_lte: toStr }, '-date', MOOD_GATE_DAYS * 2)
    .catch(() => []);
  if (!Array.isArray(rows) || rows.length < MOOD_GATE_DAYS) return false;
  const recent = rows.slice(0, MOOD_GATE_DAYS);
  return recent.every((c) => {
    const mood = c?.mood ?? c?.mood_score;
    const energy = c?.energy ?? c?.energy_level;
    return typeof mood === 'number' && typeof energy === 'number' && mood < 3 && energy < 3;
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    const body = await req.json().catch(() => ({}));

    // Force-flip path is admin-only (it's a QA toggle).
    if (body?.force_user_id) {
      if (me?.role !== 'admin') {
        return Response.json({ error: 'Admin only for force_user_id' }, { status: 403 });
      }
      const sb = base44.asServiceRole;
      const targetId = String(body.force_user_id);
      const profiles = await sb.entity('UserProfile').filter({ user_id: targetId }, null, 1).catch(() => []);
      const profile = Array.isArray(profiles) && profiles.length ? profiles[0] : null;
      if (!profile) return Response.json({ error: 'No UserProfile for that user_id' }, { status: 404 });
      const until = plusHoursIso(QUIET_MODE_HOURS);
      await sb.entity('UserProfile').update(profile.id, { quiet_mode_until: until }).catch(() => null);
      return Response.json({ ok: true, force: true, user_id: targetId, quiet_mode_until: until });
    }

    if (me?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const sb = base44.asServiceRole;
    const dryRun = !!body?.dry_run;
    const targetUserId = body?.user_id ? String(body.user_id) : null;

    let scanned = 0;
    let triggered = 0;
    let skipped = 0;
    let alreadyActive = 0;
    const errors = [];

    const filter = targetUserId ? { user_id: targetUserId } : {};
    const profiles = await sb.entity('UserProfile').filter(filter, null, 500).catch(() => []);

    for (const p of profiles || []) {
      scanned += 1;
      try {
        if (isFutureIso(p?.quiet_mode_until)) { alreadyActive += 1; continue; }

        const [gateA, gateB] = await Promise.all([
          evalGateA_Capacity(sb, p.user_id),
          evalGateB_Mood(sb, p.user_id),
        ]);
        const shouldTrigger = gateA || gateB;
        if (!shouldTrigger) { skipped += 1; continue; }

        if (!dryRun) {
          const until = plusHoursIso(QUIET_MODE_HOURS);
          await sb.entity('UserProfile').update(p.id, { quiet_mode_until: until });
        }
        triggered += 1;
      } catch (err) {
        errors.push({ user_id: p?.user_id, error: String(err?.message || err) });
      }
    }

    return Response.json({
      ok: true,
      dry_run: dryRun,
      scanned,
      triggered,
      skipped,
      already_active: alreadyActive,
      errors,
    });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});

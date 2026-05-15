// computeCapacityTax — Planner Phase 2 A2-8 (C3.5 follow-up).
//
// Daily orchestrator-fired pass that snapshots each user's predicted load vs
// phase capacity into a `CapacityTaxLog` row, keyed by ISO Monday week_start.
// Idempotent — upserts (overwrites) the current-week row each tick, so the
// Cycle tab Capacity Tax bar always reflects today's data while Quiet Mode's
// Gate A gets a rolling 3-day history to evaluate.
//
// Without this, Quiet Mode Gate A (`captax.pct > 120` on 3 days running) is
// silently inert — `CapacityTaxLog` was never being written. Code's A1
// tombstone flagged this as the obvious follow-up.
//
// Formula mirrors `CapacityTaxBar.jsx` (single source of truth — the FE bar
// reads the same `deriveCapacity` + `derivePredictedLoad` exports):
//   capacity = baseline (10) × phase_multiplier
//     menstrual 0.55 · follicular 1.10 · ovulatory 1.20 · luteal 0.85
//   load = sum(PersonalTask non-completed × effort||1)
//        + (ritual habits count × 1)
//        + (active programme present ? 1.5 : 0)
//   pct  = round(load / capacity × 100)
//
// Body:
//   POST {}                            — sweep all profiles (orchestrator path)
//   POST { user_id: "uid" }            — single-user smoke (admin)
//   POST { dry_run: true }             — counts only
//
// Returns: { ok, dry_run, scanned, written, errors }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PHASE_MULTIPLIERS = { menstrual: 0.55, follicular: 1.10, ovulatory: 1.20, luteal: 0.85 };
const BASELINE_CAPACITY = 10;

function toDateStr(d) { return d.toISOString().split('T')[0]; }
function isoMonday(now = new Date()) {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function phaseForToday(profile) {
  const last = profile?.last_period_start_date;
  if (!last) return null;
  const cycleLength = Number(profile.cycle_avg_length) || 28;
  const periodLength = Number(profile.period_length) || 5;
  const start = new Date(last);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  const day = (diff % cycleLength) + 1;
  if (day <= periodLength) return 'menstrual';
  if (day <= cycleLength * 0.5 - 2) return 'follicular';
  if (day <= cycleLength * 0.5 + 2) return 'ovulatory';
  return 'luteal';
}

function deriveCapacity(phase) {
  const mult = PHASE_MULTIPLIERS[phase] || 1.0;
  return Math.max(1, Math.round(BASELINE_CAPACITY * mult * 10) / 10);
}

function derivePredictedLoad({ personalTasks, hasActiveProgramme, ritualHabitCount }) {
  let load = 0;
  for (const t of personalTasks || []) {
    if (!t) continue;
    if (t.completed === true) continue;
    const effort = Number(t?.estimated_effort) || 1;
    load += effort;
  }
  load += (ritualHabitCount || 0) * 1;
  if (hasActiveProgramme) load += 1.5;
  return Math.round(load * 10) / 10;
}

function uniqueRitualNames(habitLogs, fromStr, toStr) {
  const set = new Set();
  for (const h of habitLogs || []) {
    if (!h?.date) continue;
    if (h.date < fromStr || h.date > toStr) continue;
    const name = h.habit_type || h.habit_name;
    if (name) set.add(name);
  }
  return set.size;
}

async function snapshotForUser(sb, profile, weekStartStr, dryRun) {
  const userId = profile?.user_id;
  if (!userId) return { skipped: true };

  // 1. Today's snapshot inputs — same shape Planner.jsx uses live.
  const [personalTasks, programmes, habitLogs] = await Promise.all([
    sb.entities.PersonalTasks.filter({ user_id: userId }, '-created_date', 200).catch(() => []),
    sb.entities.UserPrograms.filter({ user_id: userId, status: 'active' }, '-created_date', 5).catch(() => []),
    sb.entities.HabitLogs.filter({ user_id: userId }, '-created_date', 60).catch(() => []),
  ]);

  // Ritual count = distinct habit names logged in the last 7 days (proxy for
  // the active morning-stack rituals; matches Planner.jsx ritualHabits memo).
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const ritualHabitCount = uniqueRitualNames(habitLogs, toDateStr(sevenDaysAgo), toDateStr(today));

  const phase = phaseForToday(profile);
  const capacity = deriveCapacity(phase);
  const load = derivePredictedLoad({
    personalTasks,
    hasActiveProgramme: (programmes || []).length > 0,
    ritualHabitCount,
  });
  const pct = capacity > 0 ? Math.round((load / capacity) * 100) : 0;

  if (dryRun) return { dry: true, capacity, load, pct };

  // Upsert this week's row by (user_id, week_start). Filter first; update if
  // present, create otherwise. CapacityTaxLog has no unique constraint at the
  // SDK level so we enforce idempotency by checking first.
  const existing = await sb.entities.CapacityTaxLog
    .filter({ user_id: userId, week_start: weekStartStr }, '-computed_at', 1)
    .catch(() => []);
  const payload = {
    user_id: userId,
    week_start: weekStartStr,
    predicted_load: load,
    phase_capacity: capacity,
    pct_of_capacity: pct,
    computed_at: new Date().toISOString(),
  };
  if (existing && existing.length > 0) {
    await sb.entities.CapacityTaxLog.update(existing[0].id, payload);
    return { updated: true, pct };
  }
  await sb.entities.CapacityTaxLog.create({ ...payload, created_at: new Date().toISOString() });
  return { created: true, pct };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (me && me.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dry_run;
    const targetUserId = body?.user_id ? String(body.user_id) : null;

    const sb = base44.asServiceRole;
    const weekStart = toDateStr(isoMonday());

    const profiles = await sb.entities.UserProfile
      .filter(targetUserId ? { user_id: targetUserId } : {}, null, 500)
      .catch(() => []);

    let scanned = 0;
    let written = 0;
    const errors = [];
    for (const p of profiles || []) {
      scanned += 1;
      try {
        const r = await snapshotForUser(sb, p, weekStart, dryRun);
        if (r?.created || r?.updated) written += 1;
      } catch (err) {
        errors.push({ user_id: p?.user_id, error: String(err?.message || err) });
      }
    }

    return Response.json({
      ok: true,
      dry_run: dryRun,
      week_start: weekStart,
      scanned,
      written,
      errors: errors.slice(0, 20),
    });
  } catch (err) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});

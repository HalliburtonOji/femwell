// migratePlannerPhase2 — one-shot operator-invoked / orchestrator-bootstrapped
// migration for Planner Phase 2 (spec_v2 §C1).
//
// Populates each UserProfile.cycle_prediction_meta from existing CycleEvents
// PeriodStart rows + last_period_start_date / cycle_avg_length on the profile.
// Touches a profile at most once: idempotent on re-run because we only write
// when cycle_prediction_meta is empty AND we have inputs to compute from.
//
// Confidence model (deliberately conservative, brand-voice "permissive"):
//   cycles_observed = max(0, PeriodStart count - 1)   // intervals, not events
//   confidence_pct  = min(95, cycles_observed * 22)   // 4 cycles → ~88
//   next_period_eta = last_period_start + cycle_avg_length
//   eta_window_days = max(2, round(7 - cycles_observed))  // tighter as data grows
//
// Body (admin-only):
//   POST {}                       — full sweep, write where empty
//   POST { dry_run: true }        — counts only
//   POST { user_id: "uid" }       — single-user smoke test
//
// Returns: { ok, dry_run, scanned, updated, skipped, errors[] }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function isPlainObject(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function computeMeta(profile, periodStarts) {
  // periodStarts: array of ISO date strings (YYYY-MM-DD), oldest → newest
  const sorted = (periodStarts || []).filter(Boolean).sort();
  const last = sorted[sorted.length - 1] || profile?.last_period_start_date || null;
  const cycleAvg = Number(profile?.cycle_avg_length) || 28;

  // cycles_observed = number of intervals between consecutive PeriodStart rows.
  // 1 row → 0 cycles observed (we know a date but no interval data yet).
  const cyclesObserved = Math.max(0, sorted.length - 1);

  // Confidence climbs ~22 pct per observed cycle, capped at 95. 4 cycles -> 88.
  const confidencePct = Math.min(95, cyclesObserved * 22);

  let nextEta = null;
  if (last) {
    try {
      const d = new Date(last);
      d.setDate(d.getDate() + cycleAvg);
      nextEta = d.toISOString().split('T')[0];
    } catch { /* leave null */ }
  }

  // ETA window starts wide (7d) and tightens by 1d per observed cycle, floor 2d.
  const etaWindowDays = Math.max(2, Math.round(7 - cyclesObserved));

  return {
    confidence_pct: confidencePct,
    cycles_observed: cyclesObserved,
    ...(nextEta ? { next_period_eta: nextEta } : {}),
    eta_window_days: etaWindowDays,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (me?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dry_run;
    const targetUserId = body?.user_id ? String(body.user_id) : null;

    const sb = base44.asServiceRole;
    const now = new Date().toISOString();
    let scanned = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    // Pull profiles (single-user or batch). 500-row cap matches the orchestrator's
    // other per-user passes; the next daily cron picks up any overflow.
    const profiles = targetUserId
      ? await sb.entities.UserProfile.filter({ user_id: targetUserId }, undefined, 1).catch(() => [])
      : await sb.entities.UserProfile.list('-created_date', 500).catch(() => []);

    for (const p of (profiles || [])) {
      scanned += 1;
      try {
        // Skip if already populated (idempotent).
        if (isPlainObject(p?.cycle_prediction_meta) && p.cycle_prediction_meta.cycles_observed != null) {
          skipped += 1;
          continue;
        }

        const events = await sb.entities.CycleEvents
          .filter({ user_id: p.user_id, type: 'PeriodStart' }, 'date', 60)
          .catch(() => []);
        const periodStarts = (events || []).map(e => e?.date).filter(Boolean);

        // Need either a PeriodStart event or last_period_start_date to compute anything.
        if (periodStarts.length === 0 && !p?.last_period_start_date) {
          skipped += 1;
          continue;
        }

        const meta = computeMeta(p, periodStarts);

        if (dryRun) { updated += 1; continue; }

        await sb.entities.UserProfile.update(p.id, {
          cycle_prediction_meta: meta,
          updated_at: now,
        });
        updated += 1;
      } catch (err) {
        errors.push({ user_id: p?.user_id, error: err?.message || String(err) });
      }
    }

    return Response.json({
      ok: true,
      dry_run: dryRun,
      scanned,
      updated,
      skipped,
      errors: errors.slice(0, 20),
    });
  } catch (err) {
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
});

// Minimal cycle-phase util scoped for nutrition logging.
// Returns { status, phase?, cycle_day?, reason? }.
// Never returns status='ok' with a guessed phase when data is missing/stale.
// (Full Part-A util with PhaseHistory is a separate deliverable.)

export function getCyclePhaseStatus(profile) {
  if (!profile || !profile.last_period_start_date) {
    return { status: "missing", reason: "no last period date" };
  }

  const last = new Date(profile.last_period_start_date);
  if (Number.isNaN(last.getTime())) {
    return { status: "missing", reason: "invalid last period date" };
  }

  const cycleLen = Number(profile.cycle_avg_length) || 28;
  const periodLen = Number(profile.period_length) || 5;

  const daysSince = Math.floor((Date.now() - last.getTime()) / 86400000);
  if (daysSince < 0) {
    return { status: "missing", reason: "last period is in the future" };
  }

  const maxAllowed = Math.max(cycleLen * 2, 60);
  if (daysSince > maxAllowed) {
    return {
      status: "stale",
      reason: `last period is ${daysSince} days old, beyond max cycle length`,
    };
  }

  const cycleDay = (daysSince % cycleLen) + 1;
  const phase =
    cycleDay <= periodLen
      ? "menstrual"
      : cycleDay <= Math.round(cycleLen * 0.4)
      ? "follicular"
      : cycleDay <= Math.round(cycleLen * 0.55)
      ? "ovulatory"
      : "luteal";

  return { status: "ok", phase, cycle_day: cycleDay, source: "computed" };
}

// Convenience: returns phase string only when status==='ok', else null.
// Use this when you need to persist cycle_phase_at_log.
export function getCyclePhaseOrNull(profile) {
  const res = getCyclePhaseStatus(profile);
  return res.status === "ok" ? res.phase : null;
}
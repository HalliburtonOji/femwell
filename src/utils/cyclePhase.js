// Single source of truth for current-cycle-phase determination.
// Lifted from the inline logic in src/pages/ContentPlayer.jsx.
// Future MPs will migrate the other 5 inline sites to use this helper.

export const PHASE_VALUES = ["menstrual", "follicular", "ovulatory", "luteal"];

export function getCurrentCyclePhase(userProfile) {
  if (!userProfile) return null;
  const lastPeriod = userProfile.last_period_start_date;
  const cycleLength = userProfile.cycle_avg_length || 28;
  const periodLength = userProfile.period_length || 5;
  if (!lastPeriod) return null;

  const today = new Date();
  const start = new Date(lastPeriod);
  const dayOfCycle =
    (Math.floor((today - start) / (1000 * 60 * 60 * 24)) % cycleLength) + 1;

  if (dayOfCycle <= periodLength) return "menstrual";
  if (dayOfCycle <= cycleLength * 0.5 - 2) return "follicular";
  if (dayOfCycle <= cycleLength * 0.5 + 2) return "ovulatory";
  return "luteal";
}

export function phaseLabel(phase) {
  if (!phase) return null;
  return phase.charAt(0).toUpperCase() + phase.slice(1);
}

// Legacy compatibility — used by NutritionTodayTab and others.
// Returns the phase or null (never fakes it).
export function getCyclePhaseOrNull(userProfile) {
  return getCurrentCyclePhase(userProfile);
}

// Legacy compatibility — returns { status, phase, reason }
// status: "ok" when phase is known, "missing" when profile lacks data.
export function getCyclePhaseStatus(userProfile) {
  if (!userProfile) {
    return { status: "missing", phase: null, reason: "no_profile" };
  }
  if (!userProfile.last_period_start_date) {
    return { status: "missing", phase: null, reason: "no_last_period" };
  }
  const phase = getCurrentCyclePhase(userProfile);
  if (!phase) {
    return { status: "missing", phase: null, reason: "unknown" };
  }
  return { status: "ok", phase, reason: null };
}
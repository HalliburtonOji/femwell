// useCycleDay — shared cycle-day + phase derivation.
//
// Same algorithm previously inlined as `derivePlannerPhase` in
// `PlannerV2Shell.jsx`. Lifted to a hook so the Hero, AstraCard,
// TomorrowPreviewCard, and any future surface can share one source
// of truth.
//
// Public API:
//   computeCycleDay(profile)  → pure helper. Returns
//     { phase, cycleDay, dayInCycle, daysUntilPeriod, periodLen,
//       cycleLen, cycleLength }
//     (dayInCycle and cycleLength are aliases kept for callers that
//      use either name).
//   useCycleDay(profile)      → memoised React hook, same return shape.
//
// Optional second arg `dailyCheckins`: when an array of recent
// DailyCheckin rows is passed, the hook still uses the profile's
// last_period_start_date as the source of truth (cycle math doesn't
// move with check-ins), but consumers can pass it for future
// extensions (e.g. predicted-vs-confirmed period day flags) without
// changing the call signature.

import { useMemo } from "react";

export function computeCycleDay(profile /*, dailyCheckins */) {
  if (!profile?.last_period_start_date) {
    return {
      phase: "follicular",
      cycleDay: 1,
      dayInCycle: 1,
      daysUntilPeriod: null,
      periodLen: 5,
      cycleLen: 28,
      cycleLength: 28,
    };
  }
  const cycleLen  = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length    || 5;
  const start     = new Date(profile.last_period_start_date);
  const t         = new Date(); t.setHours(0, 0, 0, 0);
  const startDay  = new Date(start); startDay.setHours(0, 0, 0, 0);
  const raw       = Math.floor((t - startDay) / 86400000) + 1;
  const normDay   = ((raw - 1) % cycleLen + cycleLen) % cycleLen + 1;
  const daysUntilPeriod = cycleLen - normDay + 1;
  let phase;
  if (normDay <= periodLen) phase = "menstrual";
  else if (normDay <= Math.floor(cycleLen * 0.43)) phase = "follicular";
  else if (normDay <= Math.floor(cycleLen * 0.5))  phase = "ovulatory";
  else phase = "luteal";
  return {
    phase,
    cycleDay: normDay,
    dayInCycle: normDay,
    daysUntilPeriod,
    periodLen,
    cycleLen,
    cycleLength: cycleLen,
  };
}

export function useCycleDay(profile, dailyCheckins) {
  // Re-derive only on the profile fields that actually affect the math.
  // dailyCheckins is passed through for future use (period-day confirmation
  // signals) but isn't part of the dep array yet.
  return useMemo(
    () => computeCycleDay(profile, dailyCheckins),
    [profile?.last_period_start_date, profile?.cycle_avg_length, profile?.period_length, dailyCheckins],
  );
}

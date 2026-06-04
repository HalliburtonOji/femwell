// sealedTriggers — the 4 unlock triggers for a Sealed Letter (Phase 2).
//
// Every trigger resolves to a single stored `seal_date` (YYYY-MM-DD), so the
// existing client-side unseal check + Today card keep working unchanged. Two
// triggers are date-based; two are phase-aware (the moat — "unreadable until
// next follicular"). The chosen trigger is also kept as a small, non-sensitive
// label inside the encrypted envelope so the sealed list can describe the unlock
// without decrypting anything.

import { addDays, addMonths, addYears, format } from "date-fns";

const PHASE_LABEL = {
  menstrual: "menstrual", follicular: "follicular", ovulatory: "ovulatory", luteal: "luteal",
};

const fmt = (d) => format(d, "yyyy-MM-dd");
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// The cycle-day a phase BEGINS on, mirroring useCycleDay.phaseForDay thresholds.
function phaseStartDay(phase, periodLen, cycleLen) {
  switch (phase) {
    case "menstrual":  return 1;
    case "follicular": return periodLen + 1;
    case "ovulatory":  return Math.floor(cycleLen * 0.43) + 1;
    case "luteal":     return Math.floor(cycleLen * 0.5) + 1;
    default:           return 1;
  }
}

// Days from today until the NEXT time the cycle reaches `targetPhase`'s start.
// Always returns a strictly-future offset (>= 1), so a letter sealed "until next
// follicular" never resolves to today.
export function daysUntilNextPhase(profile, targetPhase) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const start = new Date(profile.last_period_start_date); start.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const raw = Math.floor((today - start) / 86400000) + 1;
  const normDay = ((raw - 1) % cycleLen + cycleLen) % cycleLen + 1;
  const S = phaseStartDay(targetPhase, periodLen, cycleLen);
  let delta = ((S - normDay) % cycleLen + cycleLen) % cycleLen;
  if (delta === 0) delta = cycleLen; // today is that start-day -> go to the next cycle
  return delta;
}

// Phase options for the cross-phase trigger, with the resolved date (or null
// when there is no cycle anchor yet, so the UI can disable them gracefully).
export function phaseTriggerOptions(profile) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return ["follicular", "ovulatory", "luteal", "menstrual"].map((phase) => {
    const days = daysUntilNextPhase(profile, phase);
    const dateISO = days != null ? fmt(addDays(today, days)) : null;
    return { phase, label: cap(PHASE_LABEL[phase]), dateISO, days };
  });
}

// The 4 trigger TYPES, as a stable list for the composer.
export const TRIGGER_TYPES = [
  { id: "future",      title: "A date you choose",   blurb: "Future-me — open it whenever you decide." },
  { id: "phase",       title: "Your next phase",     blurb: "Cross-phase — open it when your body comes back round." },
  { id: "cycle",       title: "Next cycle",          blurb: "About one cycle from now." },
  { id: "anniversary", title: "A year from today",   blurb: "An anniversary drop — a letter across a whole year." },
];

// Quick date chips for the future-me trigger.
export function futureChips() {
  const today = new Date();
  return [
    { label: "In 1 month",  dateISO: fmt(addMonths(today, 1)) },
    { label: "In 3 months", dateISO: fmt(addMonths(today, 3)) },
    { label: "In 6 months", dateISO: fmt(addMonths(today, 6)) },
    { label: "In 1 year",   dateISO: fmt(addYears(today, 1)) },
  ];
}

// Resolve a chosen trigger into { sealDate, trigger } where `trigger` is the
// small label object embedded (in the clear) in the encrypted envelope.
// Returns null when the choice can't yet resolve (e.g. phase with no cycle data,
// or a future date not picked).
export function resolveTrigger({ type, futureDate, phase, profile }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (type === "future") {
    if (!futureDate) return null;
    return { sealDate: futureDate, trigger: { type, label: "Opens on a date you chose" } };
  }
  if (type === "anniversary") {
    const dateISO = fmt(addYears(today, 1));
    return { sealDate: dateISO, trigger: { type, label: "An anniversary — opens a year on" } };
  }
  if (type === "cycle") {
    const cycleLen = profile?.cycle_avg_length || 28;
    const dateISO = fmt(addDays(today, cycleLen));
    return { sealDate: dateISO, trigger: { type, label: "Opens next cycle" } };
  }
  if (type === "phase") {
    const days = daysUntilNextPhase(profile, phase);
    if (days == null) return null;
    const dateISO = fmt(addDays(today, days));
    return { sealDate: dateISO, trigger: { type, phase, label: `Opens at your next ${PHASE_LABEL[phase] || phase}` } };
  }
  return null;
}

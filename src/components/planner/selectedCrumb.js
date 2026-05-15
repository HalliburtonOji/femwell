// selectedCrumb — Planner Phase 2 A2-4 helper.
//
// Generates the italic plum-mute subtitle that sits under the page title +
// confidence pill on both Today + Cycle tabs. On Today, prefers
// `dailyPlan.window_summary` when present; otherwise falls back to a phase-
// keyed permissive bank (4 lines per phase, deterministic by date so the
// line doesn't flicker between renders). On Cycle, the line is
// `Viewing {monthName} · tap a day to retarget Today`.
//
// Spec default #6 (binding): when `dailyPlan.window_summary` is missing,
// use phase-keyed permissive bank; deterministic-by-date.
//
// Spec ref: claude-state/base44_mps/2026-05-15_planner_phase2_A2/spec.md §A2-4 (5).

const PHASE_FALLBACK = {
  menstrual: [
    "A softer start · warming meals · earlier wind-down",
    "Steady pace · rest counts as movement · low lights",
    "Quiet morning · short walk · soup-and-tea evening",
    "Gentle stretch · warm bath · book before screen",
  ],
  follicular: [
    "A fresher start · time for ideas · brisker walks",
    "Steady focus · new projects feel possible · light meals",
    "Outline a thing · longer walk · friend coffee",
    "Try the harder workout · learn a small thing · early start",
  ],
  ovulatory: [
    "Brighter morning · recording day · tough calls easier",
    "Sharp focus · presentations land · social if you want",
    "Voice notes · ship a draft · short meetings",
    "Speak up · take the meeting · share the idea",
  ],
  luteal: [
    "A soft start · steady afternoon · earlier bedtime tonight",
    "Finish the edit · slower social · warming dinner",
    "Reflect more · ship less · saying no is fine today",
    "Cosy clothes · review-and-tidy · journal before bed",
  ],
  unknown: [
    "A clean page · no pressure to start big",
    "Steady cadence · one small thing first",
    "Slow morning · whatever feels honest",
    "Soft start · quiet evening · move gently",
  ],
};

function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  return Math.floor(diff / 86400000);
}

export function selectedCrumbToday({ dailyPlan, phase, date = new Date() }) {
  const explicit = dailyPlan?.window_summary;
  if (typeof explicit === "string" && explicit.trim().length > 0) return explicit.trim();
  const bank = PHASE_FALLBACK[phase] || PHASE_FALLBACK.unknown;
  const idx = dayOfYear(date) % bank.length;
  return bank[idx];
}

export function selectedCrumbCycle({ date = new Date() }) {
  const monthName = date.toLocaleDateString("en-GB", { month: "long" });
  return `Viewing ${monthName} · tap a day to retarget Today`;
}

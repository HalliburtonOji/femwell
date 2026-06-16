// nutritionSummary — the CROSS-APP nutrition rollup + phase-aware memory.
//
// One reusable, fail-open helper so nutrition COMPOUNDS into the rest of FemWell:
//   • DoctorExport reads a GP-ready window summary (avg energy, macro balance, key
//     women's-layer micros vs phase needs, hydration, honest gaps).
//   • Today / Planner read a compact "today" snapshot (energy + meals + a key macro).
//   • Nutrition reads phase-aware cross-cycle memory ("last luteal you leaned to X").
//
// All READS here are guarded + fail-open (.catch(() => [])): a slow/wedged backend
// must never block a UI path or throw. NOTHING here writes. Pure aggregation on top of
// the nutrition spine (dayNutrition / rangeNutrition / microNudgeForStage) — the SAME
// floor-aware numbers the Nutrition hub card shows. British English, no emoji.

import { base44 } from "@/api/base44Client";
import { dayNutrition, rangeNutrition, microNudgeForStage, STAGE_MICRO_TARGETS } from "@/utils/foodModel";
import { getCurrentCyclePhase } from "@/utils/cyclePhase";

// local YYYY-MM-DD for N days ago (no date-fns dep; pure)
function dayKeyNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - (Number(n) || 0));
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

// fail-open: fetch a user's recent MealLog rows (newest first), guarded → [].
async function fetchMeals(userId, limit = 400) {
  if (!userId) return [];
  const rows = await base44.entities.MealLog
    .filter({ user_id: userId }, "-day_key", limit)
    .catch(() => []);
  return (rows || []).filter(Boolean);
}

async function fetchHydration(userId, limit = 400) {
  if (!userId) return [];
  const rows = await base44.entities.HydrationLog
    .filter({ user_id: userId }, "-day_key", limit)
    .catch(() => []);
  return (rows || []).filter(Boolean);
}

// ── nutritionToday(userId, profile, dayKey?) ─────────────────────────────────
// Compact snapshot for the Today/Planner card. Reads today's real MealLog +
// HydrationLog, runs the floor-aware spine, and returns a tiny display-ready object.
// Fail-open: any read failure → a calm zero-state (never throws, never blocks).
//   { mealCount, kcal, hasData, keyMacro:{ label, value, unit }, hydrationMl, hydrationTargetMl }
export async function nutritionToday(userId, profile, dayKey, opts = {}) {
  const key = dayKey || dayKeyNDaysAgo(0);
  if (!userId) return emptyToday();
  const [meals, hydration] = await Promise.all([
    base44.entities.MealLog.filter({ user_id: userId, day_key: key }).catch(() => []),
    base44.entities.HydrationLog.filter({ user_id: userId, day_key: key }).catch(() => []),
  ]);
  const safeMeals = (meals || []).filter(Boolean);
  const n = dayNutrition(safeMeals, { floor: true });
  const hydrationMl = (hydration || []).filter(Boolean).reduce((s, l) => s + (l.amount_ml || 0), 0);

  // Pick the single most useful macro to surface as "key macro": protein (always
  // relevant), unless this stage leans on calcium/iron strongly — then surface that.
  const stage = profile?.life_stage || profile?.stage;
  const refs = STAGE_MICRO_TARGETS[stage] || {};
  let keyMacro = { label: "Protein", value: Math.round(n.protein_g || 0), unit: "g" };
  if (refs.iron_mg && (n.iron_mg || 0) > 0) keyMacro = { label: "Iron", value: n.iron_mg, unit: "mg" };
  else if (refs.calcium_mg && (n.calcium_mg || 0) > 0) keyMacro = { label: "Calcium", value: Math.round(n.calcium_mg), unit: "mg" };

  return {
    mealCount: safeMeals.length,
    kcal: Math.round(n.kcal || 0),
    hasData: safeMeals.length > 0,
    keyMacro,
    hydrationMl,
    hydrationTargetMl: opts.hydrationTargetMl || 2000,
  };
}

function emptyToday() {
  return { mealCount: 0, kcal: 0, hasData: false, keyMacro: { label: "Protein", value: 0, unit: "g" }, hydrationMl: 0, hydrationTargetMl: 2000 };
}

// ── nutritionDoctorSummary(userId, profile, days) ────────────────────────────
// GP-ready nutrition rollup for the DoctorExport NUTRITION section. Honest, no
// diagnosis. Reads the last `days` (default 30) of real MealLog + HydrationLog,
// runs the floor-aware spine, and returns a plain object the export renders.
//   {
//     hasData, days, loggedDays,
//     avgEnergy,                         // mean kcal per logged day (estimated)
//     macroBalance: { protein_g, carbs_g, fat_g, fiber_g },   // per-day means
//     micros: [ { key, label, perDay, unit, refLabel, lean } ],   // iron/calcium/folate vs phase
//     hydration: { avgMl, targetMl, loggedDays },
//     gaps: [ "iron logged on N of M days", ... ],             // honest data-gap notes
//     phase,                             // current cycle phase (or null)
//     note                               // one-line honest framing string
//   }
// Fail-open: any failure → { hasData:false }.
export async function nutritionDoctorSummary(userId, profile, days = 30, opts = {}) {
  if (!userId) return { hasData: false };
  const span = Math.max(7, Number(days) || 30);
  const [meals, hydration] = await Promise.all([fetchMeals(userId), fetchHydration(userId)]);
  if (meals.length === 0) return { hasData: false, days: span, loggedDays: 0 };

  const since = dayKeyNDaysAgo(span - 1);
  const range = rangeNutrition(meals, span, { floor: true });
  if (!range.loggedDays) return { hasData: false, days: span, loggedDays: 0 };

  const phase = getCurrentCyclePhase(profile);

  // micros vs this stage's soft reference points (honest: only where some real data
  // backed the micro, flagged lean using the spine's own logic).
  const nudge = microNudgeForStage(profile, range);
  const stage = profile?.life_stage || profile?.stage;
  const refs = STAGE_MICRO_TARGETS[stage] || STAGE_MICRO_TARGETS.reproductive;
  const MICRO_META = {
    iron_mg:    { label: "Iron",    unit: "mg" },
    calcium_mg: { label: "Calcium", unit: "mg" },
    folate_ug:  { label: "Folate",  unit: "µg" },
  };
  const leaningKeys = new Set((nudge.leaning || []).map((l) => l.key));
  const micros = [];
  for (const key of ["iron_mg", "calcium_mg", "folate_ug"]) {
    if (!(key in refs)) continue;
    const meta = MICRO_META[key];
    const perDay = range.perDay?.[key] || 0;
    const microDays = range.microDays?.[key] || 0;
    micros.push({
      key,
      label: meta.label,
      unit: meta.unit,
      perDay: Math.round(perDay * 10) / 10,
      refLabel: `~${refs[key]}${meta.unit}/day (UK guide)`,
      lean: leaningKeys.has(key),
      loggedOn: microDays,
    });
  }

  // hydration mean over the same window (per logged day)
  const hydInRange = hydration.filter((h) => typeof h.day_key === "string" && h.day_key >= since);
  const hydByDay = {};
  for (const h of hydInRange) { hydByDay[h.day_key] = (hydByDay[h.day_key] || 0) + (h.amount_ml || 0); }
  const hydDays = Object.keys(hydByDay).length;
  const hydTotal = Object.values(hydByDay).reduce((s, v) => s + v, 0);
  const avgMl = hydDays ? Math.round(hydTotal / hydDays) : 0;

  // honest gaps — where micro data is thin (logged on few days), so the GP reads it right
  const gaps = [];
  for (const m of micros) {
    if (m.loggedOn < Math.min(range.loggedDays, 5)) {
      gaps.push(`${m.label} only logged on ${m.loggedOn} of ${range.loggedDays} logged days — estimate is partial`);
    }
  }

  return {
    hasData: true,
    days: span,
    loggedDays: range.loggedDays,
    avgEnergy: Math.round((range.kcal || 0) / (range.loggedDays || 1)),
    macroBalance: {
      protein_g: range.perDay?.protein_g || 0,
      carbs_g: range.perDay?.carbs_g || 0,
      fat_g: range.perDay?.fat_g || 0,
      fiber_g: range.perDay?.fiber_g || 0,
    },
    micros,
    hydration: { avgMl, targetMl: opts.hydrationTargetMl || 2000, loggedDays: hydDays },
    gaps,
    phase,
    note: "Self-reported food logging over the window; energy and macros are estimated (as with any tracker), micronutrients shown only where logged. A conversation-starter, not a clinical record.",
  };
}

// ── nutritionCycleMemory(userId, profile) ────────────────────────────────────
// Phase-aware cross-cycle nutrition MEMORY. Looks back across real MealLog rows that
// carry a cycle_phase_at_log, groups by phase, and surfaces a gentle, honest pattern
// for the CURRENT phase — e.g. "Across recent luteal phases your iron tended to dip"
// or "you leaned towards higher-energy meals". No-guilt, never a target, never shame.
//
// Returns { hasData, phase, lines: [string], micro: { key, label } | null } where
// `micro` (if present) is the women's-layer nutrient that tends to run light THIS phase,
// so the Nutrition women's note can fold it in. Fail-open → { hasData:false }.
export async function nutritionCycleMemory(userId, profile) {
  const phase = getCurrentCyclePhase(profile);
  if (!userId || !phase) return { hasData: false, phase: phase || null, lines: [], micro: null };

  const meals = await fetchMeals(userId, 500);
  // only meals that carry a real phase tag AND are not from the last 10 days (we want
  // PAST cycles' memory, gently — today's logging speaks for itself elsewhere).
  const recentCutoff = dayKeyNDaysAgo(10);
  const tagged = meals.filter(
    (m) => m.cycle_phase_at_log && (typeof m.day_key !== "string" || m.day_key < recentCutoff)
  );
  const samePhase = tagged.filter((m) => m.cycle_phase_at_log === phase);
  // need a meaningful sample before we say anything (avoid over-claiming on 1-2 meals)
  if (samePhase.length < 5) return { hasData: false, phase, lines: [], micro: null };

  // distinct past days in this phase (so "across recent {phase} phases" is honest)
  const days = new Set(samePhase.map((m) => m.day_key).filter(Boolean)).size;

  // aggregate this phase's meals via the floor-aware spine, vs the overall tagged baseline
  const phaseN = dayNutrition(samePhase, { floor: true });
  const allN = dayNutrition(tagged, { floor: true });
  const phaseMeals = samePhase.length || 1;
  const allMeals = tagged.length || 1;
  const perMeal = (tot, count, key) => (tot[key] || 0) / count;

  const lines = [];
  let micro = null;

  // energy lean (gentle, no-guilt): higher- vs lower-energy meals this phase
  const phaseKcal = perMeal(phaseN, phaseMeals, "kcal");
  const allKcal = perMeal(allN, allMeals, "kcal");
  if (allKcal > 0) {
    const ratio = phaseKcal / allKcal;
    if (ratio >= 1.12) lines.push(`Across recent ${phase} phases you've tended to reach for more comforting, higher-energy meals — completely natural for where you are in your cycle.`);
    else if (ratio <= 0.88) lines.push(`Across recent ${phase} phases your meals have tended to be a little lighter than usual.`);
  }

  // women's-layer micro lean for this phase — iron in luteal/menstrual is the strong one.
  // honest: only flag where there IS some real per-meal value to compare and it runs low.
  const phaseIron = perMeal(phaseN, phaseMeals, "iron_mg");
  const allIron = perMeal(allN, allMeals, "iron_mg");
  if (allIron > 0 && phaseIron > 0 && phaseIron <= allIron * 0.8 && (phase === "luteal" || phase === "menstrual")) {
    lines.push(`Your iron has tended to dip a little in ${phase} — lentils, leafy greens or a little red meat are gentle ways to top it up if you fancy.`);
    micro = { key: "iron_mg", label: "Iron" };
  }

  if (lines.length === 0) return { hasData: false, phase, lines: [], micro: null, days };
  return { hasData: true, phase, days, lines, micro };
}

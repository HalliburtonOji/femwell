// nutritionTargets — REAL derived nutrition guides for FemWell, replacing the flat
// /2000 fallback. The output is a GENTLE target set: ranges and soft references, never
// a scoreboard. Framing is always "a guide, not a cap" — never "you must", never
// pass/fail. Everything here is pure, dependency-light, and DEFENSIVE: any missing
// input falls back to a sensible stage-based default and NEVER throws.
//
// Sources / evidence (UK):
//   · Energy  — Mifflin-St Jeor BMR (female) × activity factor, then a gentle goal-mode
//               nudge. Floored at a safe ~1500 kcal so a goal nudge can never starve.
//   · Protein — SACN ~0.8 g/kg baseline, lifted to ~1.2 g/kg for bone+muscle stages
//               (peri/menopause/postpartum/pregnant).
//   · Fibre   — 30 g/day (SACN), all stages.
//   · Iron    — 14.8 mg menstruating stages, 8.7 mg post-menopause, a touch higher in
//               pregnancy (NHS/SACN RNIs).
//   · Calcium — 700 mg adults; framed up to 1000–1200 for peri/menopause bone care.
//   · Folate  — 400 µg pre-conception / TTC / first trimester, else 200 µg.
//
// USER OVERRIDE ALWAYS WINS: if the user set an explicit value on their NutritionProfile
// (calories_target / protein_target_g / etc.), we use THAT and mark `userSet:true` for
// that field — we only derive the fields the user hasn't pinned.

// ── activity multipliers (profile.activity_level → factor) ───────────────────────
const ACTIVITY = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};
const DEFAULT_ACTIVITY = 1.375; // "light" — the gentle, honest default when unknown

// ── safe floor — a goal-mode nudge can never push energy below this ──────────────
const ENERGY_FLOOR = 1500;

// ── stage helpers ────────────────────────────────────────────────────────────────
// The app reads life stage as `profile.life_stage || profile.stage` and uses the rich
// 11-stage vocabulary across nutrition. We honour that here.
function stageOf(profile) {
  return (profile && (profile.life_stage || profile.stage)) || null;
}

const MENSTRUATING_STAGES = new Set([
  "teen", "reproductive", "pre-ttc", "ttc",
]);
const PREGNANT_STAGES = new Set([
  "pregnant", "pregnant-t1", "pregnant-t2", "pregnant-t3",
]);
const HIGHER_PROTEIN_STAGES = new Set([
  "perimenopause", "menopause", "post-menopause", "postpartum",
  "pregnant", "pregnant-t1", "pregnant-t2", "pregnant-t3",
]);
const BONE_FOCUS_STAGES = new Set([
  "perimenopause", "menopause", "post-menopause",
]);

// Perimenopause may still be cycling — treat as menstruating for iron unless clearly
// post-menopause. This is intentionally generous (better a gentle lean than a gap).
function isMenstruating(stage) {
  return MENSTRUATING_STAGES.has(stage) || stage === "perimenopause";
}

// ── number coercion that never throws ────────────────────────────────────────────
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Round to a tidy step so guides read calmly (e.g. 1840 not 1837.4).
function roundTo(v, step = 10) {
  return Math.round(v / step) * step;
}

// ── stage-based DEFAULT energy band (no body data) ───────────────────────────────
// Honest, derived:false. Pregnancy adds ~+300 by later trimesters; postpartum/
// breastfeeding ~+400; peri/menopause settle a touch lower.
function stageDefaultEnergy(stage) {
  let mid = 2000; // teen / reproductive / general adult woman
  if (stage === "pregnant-t1") mid = 2050;            // first trimester barely changes
  else if (stage === "pregnant-t2") mid = 2300;        // +~250-300
  else if (stage === "pregnant-t3" || stage === "pregnant") mid = 2300;
  else if (stage === "postpartum") mid = 2400;         // breastfeeding-leaning +~400
  else if (BONE_FOCUS_STAGES.has(stage)) mid = 1900;   // peri/menopause/post settle lower
  return mid;
}

// ── goal-mode gentle nudge (fraction of energy) ──────────────────────────────────
// Soft, never aggressive. Steady progress is a gentle −10%; recovery/energy a small +.
function goalNudgeFactor(goalMode, stage) {
  switch (goalMode) {
    case "fat_loss":        return -0.10; // "Steady progress" — gentle deficit
    case "postpartum":      return 0.05;  // recovery + feeding — a small lift
    case "energy":          return 0.05;  // fuel the day — a small lift
    // tone / hormone_support / menopause → maintain (0). The stage itself carries the lean.
    default:                return 0;
  }
}

// ── age from a birthday/date string (defensive) ──────────────────────────────────
function ageFrom(profile) {
  const raw = profile && (profile.birthday || profile.date_of_birth || profile.dob);
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  // sanity clamp — a nonsense birthday must never throw or skew the BMR
  if (age < 10 || age > 100) return null;
  return age;
}

// Pull a height in cm from wherever it might live (none of the schemas store it today,
// so this is forward-looking + defensive — usually returns null → stage default energy).
function heightCmFrom({ profile, nutritionProfile, bodyMetrics }) {
  const sources = [bodyMetrics, profile, nutritionProfile];
  for (const s of sources) {
    if (!s) continue;
    const h = num(s.height_cm) || num(s.heightCm) || num(s.height);
    if (h && h >= 120 && h <= 220) return h;
  }
  return null;
}

function latestWeightKg(bodyMetrics) {
  if (!bodyMetrics) return null;
  // accept either a single latest row or a tiny array (filter(..., -day_key, 1))
  const row = Array.isArray(bodyMetrics) ? bodyMetrics.filter(Boolean)[0] : bodyMetrics;
  return row ? num(row.weight_kg) : null;
}

// ── the main derivation ──────────────────────────────────────────────────────────
// deriveTargets({ profile, nutritionProfile, bodyMetrics }) → a gentle target set.
// `bodyMetrics` may be the latest BodyMetrics row OR a 1-length array of it.
export function deriveTargets({ profile, nutritionProfile, bodyMetrics } = {}) {
  const np = nutritionProfile || {};
  const stage = stageOf(profile);
  const goalMode = np.goal_mode || null;

  // ── ENERGY ──────────────────────────────────────────────────────────────────
  const weight = latestWeightKg(bodyMetrics);
  const height = heightCmFrom({ profile, nutritionProfile, bodyMetrics });
  const age = ageFrom(profile);

  let energy_kcal;
  let energy_min;
  let energy_max;
  let derived;         // true when energy came from real body data (Mifflin-St Jeor)
  let basis;

  if (weight && height && age) {
    // Mifflin-St Jeor (female): BMR = 10*kg + 6.25*cm − 5*age − 161
    const bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    const activityFactor = ACTIVITY[np.activity_level || (profile && profile.activity_level)] || DEFAULT_ACTIVITY;
    let tdee = bmr * activityFactor;
    // gentle goal-mode nudge, then never below the safe floor
    tdee = tdee * (1 + goalNudgeFactor(goalMode, stage));
    tdee = Math.max(ENERGY_FLOOR, tdee);
    energy_kcal = roundTo(tdee, 10);
    energy_min = roundTo(tdee * 0.92, 10); // ±~8% band
    energy_max = roundTo(tdee * 1.08, 10);
    derived = true;
    basis = "tuned to your stage + body";
  } else {
    // stage-based default band — honest, derived:false
    const mid = stageDefaultEnergy(stage);
    energy_kcal = mid;
    energy_min = roundTo(mid * 0.92, 10);
    energy_max = roundTo(mid * 1.08, 10);
    derived = false;
    basis = stage ? "tuned to your stage" : "a gentle general guide";
  }

  // USER OVERRIDE for energy — an explicit calories_target always wins.
  const userEnergy = num(np.calories_target) || num(np.calorie_target);
  let energyUserSet = false;
  if (userEnergy) {
    energy_kcal = Math.round(userEnergy);
    energy_min = roundTo(userEnergy * 0.92, 10);
    energy_max = roundTo(userEnergy * 1.08, 10);
    energyUserSet = true;
    basis = "your own energy guide";
  }

  // ── PROTEIN (g) ───────────────────────────────────────────────────────────────
  // ~0.8 g/kg baseline, lifted to ~1.2 g/kg for bone+muscle stages. Fallback by stage
  // when we have no weight. User override wins.
  let protein_g;
  let proteinUserSet = false;
  const userProtein = num(np.protein_target_g) || num(np.protein_target);
  if (userProtein) {
    protein_g = Math.round(userProtein);
    proteinUserSet = true;
  } else if (weight) {
    const perKg = HIGHER_PROTEIN_STAGES.has(stage) ? 1.2 : 0.8;
    protein_g = Math.round(weight * perKg);
  } else {
    // no weight → a gentle stage band (60–90g)
    protein_g = HIGHER_PROTEIN_STAGES.has(stage) ? 90 : 70;
  }

  // ── FIBRE (g) — 30g all stages (SACN). User override wins. ──────────────────────
  const userFibre = num(np.fiber_target_g) || num(np.fibre_target_g);
  const fibre_g = userFibre ? Math.round(userFibre) : 30;

  // ── IRON (mg) ───────────────────────────────────────────────────────────────────
  // 14.8 menstruating, 8.7 post-menopause, ~15 pregnancy (a touch higher). Override wins.
  let iron_mg;
  const userIron = num(np.iron_target_mg);
  if (userIron) {
    iron_mg = userIron;
  } else if (PREGNANT_STAGES.has(stage)) {
    iron_mg = 15; // pregnancy a touch higher than the menstruating RNI
  } else if (stage === "post-menopause") {
    iron_mg = 8.7;
  } else if (isMenstruating(stage)) {
    iron_mg = 14.8;
  } else {
    iron_mg = 14.8; // default to the menstruating RNI when stage is unknown (gentle, safe)
  }

  // ── CALCIUM (mg) — 700 adults; framed 1000–1200 for peri/menopause bone care. ────
  let calcium_mg;
  const userCalcium = num(np.calcium_target_mg);
  if (userCalcium) {
    calcium_mg = userCalcium;
  } else if (BONE_FOCUS_STAGES.has(stage)) {
    calcium_mg = 1000; // gentle bone-protective framing (700 RNI + extra for the transition)
  } else {
    calcium_mg = 700;
  }

  // ── FOLATE (µg) — 400 pre-conception/TTC/T1, else 200. User override wins. ────────
  let folate_ug;
  const userFolate = num(np.folate_target_ug);
  if (userFolate) {
    folate_ug = userFolate;
  } else if (stage === "pre-ttc" || stage === "ttc" || stage === "pregnant-t1" || stage === "pregnant") {
    folate_ug = 400;
  } else {
    folate_ug = 200;
  }

  return {
    // energy as a gentle RANGE with a midpoint
    energy_kcal,
    energy_min,
    energy_max,
    // soft macro/micro references
    protein_g,
    fibre_g,
    iron_mg,
    calcium_mg,
    folate_ug,
    // meta
    derived,                 // true only when energy came from real body data
    basis,                   // short gentle string for the basis line
    // which fields the user explicitly pinned (override precedence is transparent)
    userSet: {
      energy: energyUserSet,
      protein: proteinUserSet,
      fibre: !!userFibre,
      iron: !!userIron,
      calcium: !!userCalcium,
      folate: !!userFolate,
    },
    // a gentle one-liner the UI can show verbatim — never a cap, never pass/fail
    guideLine: "a guide, never a cap",
  };
}

export default deriveTargets;

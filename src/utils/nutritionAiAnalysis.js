// Helpers for reading the structured MealLog.ai_analysis that replaced the old
// stringified-JSON field. Always use readAiAnalysis() instead of JSON.parse on
// the raw field — it transparently falls back to ai_analysis_legacy.

/**
 * Returns the structured ai_analysis object, or null.
 * Accepts either new object form, or legacy string (if an un-migrated row slips through).
 */
export function readAiAnalysis(meal) {
  if (!meal) return null;

  const raw = meal.ai_analysis;
  if (raw && typeof raw === "object") return normalize(raw);

  // Legacy fallback: string on ai_analysis or ai_analysis_legacy
  const legacy = typeof raw === "string" ? raw : meal.ai_analysis_legacy;
  if (!legacy) return null;
  try {
    const parsed = JSON.parse(legacy);
    return normalize(parsed);
  } catch {
    return null;
  }
}

/**
 * Normalize legacy shape `{ nutritional_summary, ... }` to new `{ summary, ... }`.
 * Both shapes remain readable.
 */
function normalize(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (obj.summary) return obj;
  if (obj.nutritional_summary) {
    return { ...obj, summary: obj.nutritional_summary };
  }
  return obj;
}

/**
 * Returns a normalized summary object `{ calories, protein_g, carbs_g, fat_g, fiber_g }`.
 * Falls back to summing items[] when summary macros are all zero.
 * Returns `{ summary, fellBack: boolean }` so the caller can log a fallback event.
 */
export function getMealSummary(meal) {
  const analysis = readAiAnalysis(meal);
  if (!analysis) return { summary: null, fellBack: false };

  const s = analysis.summary || {};
  const zeroish =
    (s.calories || 0) === 0 &&
    (s.protein_g || 0) === 0 &&
    (s.carbs_g || 0) === 0 &&
    (s.fat_g || 0) === 0;

  if (!zeroish) return { summary: s, fellBack: false };

  const items = analysis.items || [];
  if (items.length === 0) return { summary: s, fellBack: false };

  const summed = items.reduce(
    (acc, it) => ({
      calories: acc.calories + (Number(it.calories) || 0),
      protein_g: acc.protein_g + (Number(it.protein_g) || 0),
      carbs_g: acc.carbs_g + (Number(it.carbs_g) || 0),
      fat_g: acc.fat_g + (Number(it.fat_g) || 0),
      fiber_g: acc.fiber_g + (Number(it.fiber_g) || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  );
  const summary = {
    calories: Math.round(summed.calories),
    protein_g: Math.round(summed.protein_g),
    carbs_g: Math.round(summed.carbs_g),
    fat_g: Math.round(summed.fat_g),
    fiber_g: Math.round(summed.fiber_g),
  };
  return { summary, fellBack: true };
}

/**
 * Infer meal_type from the current local time.
 * <=10:30 breakfast, 10:31–15:00 lunch, 15:01–21:00 dinner, else snack.
 */
export function inferMealTypeFromTime(date = new Date()) {
  const mins = date.getHours() * 60 + date.getMinutes();
  if (mins <= 10 * 60 + 30) return "breakfast";
  if (mins <= 15 * 60) return "lunch";
  if (mins <= 21 * 60) return "dinner";
  return "snack";
}
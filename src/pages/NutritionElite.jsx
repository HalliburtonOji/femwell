// NutritionElite — the LIVE /Nutrition page.
//
// LIVE PROMOTION (2026-07-08): /Nutrition now renders NutritionV2Shell — the Halli-approved V2
// experience. NutritionV2Shell is a STRICT SUPERSET of NutritionEliteShell: it carries EVERYTHING
// the prior live page did (real generateMealPlan + saved weeks/MealPlans, PlanSetupLens prefs,
// Snap→photo, UnifiedLogger, water, same-as-yesterday, pregnancy/feeding, the 5 clipboard boards,
// the +2 features — numbers-off, conditions, GLP-1, feeding, intuitive check-in, share-to-table —
// pantry, recipes, the elite planner overlay) PLUS the approved V2 layout: the live FwFloraHero
// (realistic animated branch) with the tap-to-rebloom controller cards (Plan/Snap/Tonight/Cook/Body
// rewrite the header + re-bloom the same flower), the uniform-height top sliding row (Today-at-a-glance
// on slide 1 + the cross-cutting Jess digest with its upward-sliding inner sheet on slide 2), and the
// compact one-line "Handy right now" row. Nothing stripped — every line below the header/hero region
// is byte-identical to NutritionEliteShell.
//
// ★ ONE-LINE REVERT to the pre-V2 elite page: change ONLY the import path on the next line back to
//   "@/components/nutrition-elite/NutritionEliteShell" (the pre-V2 shell is preserved there verbatim;
//   its own pre-+2 copy lives in NutritionEliteShellClassic.jsx). Nothing else changes.
import NutritionV2Shell from "@/components/nutrition-elite/NutritionV2Shell";

export default function NutritionElite() {
  return <NutritionV2Shell />;
}

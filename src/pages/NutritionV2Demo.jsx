// NutritionV2Demo — a DEMO of the next Nutrition page, reachable from the IDEAS pill.
// It renders the FULL NutritionV2Shell: EVERYTHING the live /Nutrition page does (real
// generateMealPlan + saved weeks/MealPlans, PlanSetupLens prefs, Snap→photo, UnifiedLogger,
// water, same-as-yesterday, pregnancy/feeding, the 5 clipboard boards, the elite planner
// overlay) PLUS the new layout: FwFloraHero → HeroPromoteRail → a varying Jess summary that
// swipes to Today-at-a-glance + Add-to-today → the clipboard boards → a "More for your plate"
// section built from the new card language (ExpandableCard / stat card / dismissible nudge /
// chip-finder). Nothing from the live page is stripped — this is add/improve on top.
import NutritionV2Shell from "@/components/nutrition-elite/NutritionV2Shell";

export default function NutritionV2Demo() {
  return <NutritionV2Shell />;
}

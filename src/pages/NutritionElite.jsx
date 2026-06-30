// NutritionElite — the LIVE /Nutrition page. Renders NutritionEliteShell, which (as of the +2 live
// ship, 2026-06-30) IS the full elite page + the Level-+2 features woven in (numbers-off ED-safe
// toggle, same-as-yesterday, composite macro-range, condition watch-lists, GLP-1 guardian, feeding,
// intuitive check-in, share-to-table, never-grade, watched-it→logged-it). Every existing feature
// kept; photo→macros is a labelled gated stub (no vision function).
//
// ★ ONE-LINE REVERT to the pre-+2 elite page: change ONLY the import path on the next line to
//   "@/components/nutrition-elite/NutritionEliteShellClassic" (the pristine pre-+2 copy is preserved
//   there verbatim). Nothing else changes.
import NutritionEliteShell from "@/components/nutrition-elite/NutritionEliteShell";

export default function NutritionElite() {
  return <NutritionEliteShell />;
}

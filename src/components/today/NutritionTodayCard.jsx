// NutritionTodayCard — a compact Today/Planner surface that reflects the day's real
// nutrition (energy + meals logged + a key macro) and taps through to the Nutrition hub.
//
// Reads the SAME floor-aware spine as the Nutrition hub card via nutritionToday() — so
// the number you see here matches what you see in Nutrition. The read is fail-open (any
// backend wobble → a calm "Log your first meal" state); nothing here is awaited on an
// interaction path and nothing writes. No-guilt: energy is shown as logged, never as a
// budget or an "over" warning. Lucide only, no emoji.

import { useEffect, useState } from "react";
import { Utensils, ChevronRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { nutritionToday } from "@/utils/nutritionSummary";

const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" };

export default function NutritionTodayCard({ user, profile, hydrationTargetMl }) {
  const [snap, setSnap] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    nutritionToday(user.id, profile, undefined, { hydrationTargetMl })
      .then((s) => { if (!cancelled) setSnap(s); })
      .catch(() => { if (!cancelled) setSnap({ hasData: false, kcal: 0, mealCount: 0 }); });
    return () => { cancelled = true; };
  }, [user?.id, profile, hydrationTargetMl]);

  // sub-line: real data → "X meals · ~Y kcal · key macro"; else a gentle prompt
  const sub = (() => {
    if (!snap) return "Log meals · Water · Weekly plan";
    if (!snap.hasData) return "Log your first meal of the day";
    const mealsTxt = `${snap.mealCount} meal${snap.mealCount === 1 ? "" : "s"} logged`;
    const km = snap.keyMacro;
    const macroTxt = km && km.value > 0 ? ` · ${km.label} ${km.value}${km.unit}` : "";
    return `${mealsTxt} · ~${snap.kcal} kcal${macroTxt}`;
  })();

  return (
    <a href={createPageUrl("Nutrition")} className="flex items-center gap-3 rounded-[16px] p-3.5 transition-all block" style={card}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }}>
        <Utensils className="w-4 h-4" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: "var(--plum)" }}>Nutrition</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--mauve)" }}>{sub}</p>
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--border)" }} />
    </a>
  );
}

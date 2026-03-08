import { useMemo } from "react";
import { motion } from "framer-motion";

function MacroBar({ label, actual, target, color, unit = "g" }) {
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  const over = actual > target && target > 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className={`text-xs font-semibold ${over ? "text-rose-500" : "text-gray-400"}`}>
          {Math.round(actual)}{unit}
          <span className="font-normal text-gray-300"> / {target}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${over ? "bg-rose-400" : color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function MacroDashboard({ meals, hydrationLogs, nutritionProfile }) {
  const totals = useMemo(() => {
    return meals.reduce((acc, meal) => {
      if (!meal.ai_analysis) return acc;
      try {
        const analysis = JSON.parse(meal.ai_analysis);
        (analysis.items || []).forEach((item) => {
          acc.calories += item.calories || 0;
          acc.protein  += item.protein_g || 0;
          acc.carbs    += item.carbs_g   || 0;
          acc.fat      += item.fat_g     || 0;
        });
      } catch (_) {}
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [meals]);

  const targets = {
    calories: nutritionProfile?.calories_target      || 2000,
    protein:  nutritionProfile?.protein_target_g     || 120,
    carbs:    nutritionProfile?.carbs_target_g       || 200,
    fat:      nutritionProfile?.fat_target_g         || 65,
  };

  const hydrationTarget  = nutritionProfile?.hydration_target_ml || 2000;
  const totalHydration   = hydrationLogs.reduce((s, l) => s + (l.amount_ml || 0), 0);
  const caloriePct       = targets.calories > 0 ? Math.min(100, Math.round((totals.calories / targets.calories) * 100)) : 0;
  const caloriesLeft     = Math.max(0, targets.calories - Math.round(totals.calories));
  const ringStroke       = caloriePct >= 100 ? "#e07a8a" : caloriePct >= 75 ? "#f59e0b" : "#10b981";
  const circumference    = 2 * Math.PI * 38;

  return (
    <div className="card-glass rounded-2xl p-5 space-y-5">
      <h3 className="text-sm font-bold text-gray-800">Daily Goals</h3>

      {/* Calorie ring */}
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="38" fill="none" stroke="#f3f4f6" strokeWidth="9" />
            <circle
              cx="48" cy="48" r="38" fill="none"
              stroke={ringStroke} strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - caloriePct / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-gray-800">{caloriePct}%</span>
            <span className="text-[9px] text-gray-400 font-medium">cals</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-black text-gray-900">
            {Math.round(totals.calories)}
            <span className="text-sm font-normal text-gray-400">kcal</span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">of {targets.calories} kcal goal</p>
          <div className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${caloriesLeft > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {caloriesLeft > 0 ? `${caloriesLeft} kcal remaining` : "Goal reached! 🎉"}
          </div>
        </div>
      </div>

      {/* Macro + hydration bars */}
      <div className="space-y-3">
        <MacroBar label="🥩 Protein"    actual={totals.protein}  target={targets.protein}  color="bg-amber-400" />
        <MacroBar label="🌾 Carbs"      actual={totals.carbs}    target={targets.carbs}    color="bg-emerald-400" />
        <MacroBar label="🫒 Fat"        actual={totals.fat}      target={targets.fat}      color="bg-purple-400" />
        <MacroBar label="💧 Hydration"  actual={totalHydration}  target={hydrationTarget}  color="bg-blue-400" unit="ml" />
      </div>

      {totals.calories === 0 && (
        <p className="text-[11px] text-gray-400 text-center italic">
          Log meals with AI analysis to see macro tracking.
        </p>
      )}
    </div>
  );
}
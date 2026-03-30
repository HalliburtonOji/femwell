import { useMemo } from "react";
import { motion } from "framer-motion";

const MACROS = [
  { key: "protein", label: "Protein",   color: "#C4849A" },
  { key: "carbs",   label: "Carbs",     color: "#7A9E8E" },
  { key: "fat",     label: "Fat",       color: "#8A7E88" },
];

const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

function MacroBar({ label, actual, target, color, unit = "g" }) {
  const pct  = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  const over = actual > target && target > 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: over ? "var(--rose-dust)" : "var(--mauve)" }}>
          {Math.round(actual)}{unit}
          <span className="font-normal" style={{ color: "var(--border)" }}> / {target}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-subtle)" }}>
        <motion.div className="h-full rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ backgroundColor: over ? "var(--rose-dust)" : color }} />
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
          acc.calories += item.calories   || 0;
          acc.protein  += item.protein_g  || 0;
          acc.carbs    += item.carbs_g    || 0;
          acc.fat      += item.fat_g      || 0;
        });
      } catch (_) {}
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [meals]);

  const targets = {
    calories: nutritionProfile?.calories_target   || 2000,
    protein:  nutritionProfile?.protein_target_g  || 120,
    carbs:    nutritionProfile?.carbs_target_g    || 200,
    fat:      nutritionProfile?.fat_target_g      || 65,
  };

  const hydrationTarget = nutritionProfile?.hydration_target_ml || 2000;
  const totalHydration  = hydrationLogs.reduce((s, l) => s + (l.amount_ml || 0), 0);
  const caloriePct      = targets.calories > 0 ? Math.min(100, Math.round((totals.calories / targets.calories) * 100)) : 0;
  const caloriesLeft    = Math.max(0, targets.calories - Math.round(totals.calories));
  const ringColor       = caloriePct >= 100 ? "var(--rose-dust)" : caloriePct >= 75 ? "#C4954A" : "var(--sage)";
  const circumference   = 2 * Math.PI * 38;

  return (
    <div className="rounded-[24px] p-5 space-y-5"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <p style={sLabel}>Daily Goals</p>

      {/* Calorie ring */}
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="38" fill="none" stroke="var(--border-subtle)" strokeWidth="9" />
            <circle cx="48" cy="48" r="38" fill="none"
              stroke={ringColor} strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - caloriePct / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease-out" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold" style={{ color: "var(--plum)" }}>{caloriePct}%</span>
            <span className="text-[9px] font-medium" style={{ color: "var(--mauve)" }}>kcal</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>
            {Math.round(totals.calories)}
            <span className="text-sm font-normal ml-1" style={{ color: "var(--mauve)" }}>kcal</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--mauve)" }}>of {targets.calories} kcal goal</p>
          <div className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: caloriesLeft > 0 ? "var(--sage-subtle)" : "var(--rose-dust-subtle)",
              color: caloriesLeft > 0 ? "var(--sage)" : "var(--rose-dust)",
            }}>
            {caloriesLeft > 0 ? `${caloriesLeft} kcal remaining` : "Goal reached"}
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {MACROS.map(m => (
          <MacroBar key={m.key} label={m.label} actual={totals[m.key]} target={targets[m.key]} color={m.color} />
        ))}
        <MacroBar label="Hydration" actual={totalHydration} target={hydrationTarget} color="var(--sage)" unit="ml" />
      </div>

      {totals.calories === 0 && (
        <p className="text-[11px] text-center italic" style={{ color: "var(--mauve)" }}>
          Log meals to see macro tracking
        </p>
      )}
    </div>
  );
}
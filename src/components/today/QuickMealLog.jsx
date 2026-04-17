import { useState, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { getCyclePhaseOrNull } from "@/utils/cyclePhase";
import { inferMealTypeFromTime } from "@/utils/nutritionAiAnalysis";
import { logAppEvent } from "@/utils/appEvents";
import { runNutritionMigrationsIfNeeded } from "@/utils/nutritionMigrations";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" };
const label = { fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" };

export default function QuickMealLog({ user, profile }) {
  const [quickMealText, setQuickMealText] = useState("");
  // Default: inferred from time of day. User toggle always wins.
  const [quickMealType, setQuickMealType] = useState(() => inferMealTypeFromTime());
  const [userToggled, setUserToggled] = useState(false);
  const [quickLogging, setQuickLogging] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const effectiveMealType = useMemo(
    () => (userToggled ? quickMealType : inferMealTypeFromTime()),
    [quickMealType, userToggled]
  );

  const quickLogMeal = async () => {
    const text = quickMealText.trim();
    if (!text) return;
    setQuickLogging(true);

    // Run one-time migrations before the first write of the session.
    await runNutritionMigrationsIfNeeded(user, profile).catch(() => {});

    const cyclePhaseAtLog = getCyclePhaseOrNull(profile); // null when status !== 'ok'
    const isShortInput = text.length <= 8;

    const log = await base44.entities.MealLog.create({
      user_id: user.id,
      day_key: todayStr,
      logged_at: new Date().toISOString(),
      meal_type: effectiveMealType,
      method: "text",
      raw_text: text,
      portion_size: "medium",
      cycle_phase_at_log: cyclePhaseAtLog, // null if no phase — never faked
    });

    setQuickMealText("");

    if (isShortInput) {
      logAppEvent("nutrition_short_input", { len: text.length, meal_log_id: log.id }, user.id);
    }

    // Kick off AI analysis in the background. Writes structured object form.
    base44.functions
      .invoke("analyzeMeal", {
        raw_text: text,
        wellness_goal: "general wellness",
        cycle_phase: cyclePhaseAtLog,
        short_input: isShortInput,
        meal_log_id: log.id,
      })
      .then((res) => {
        const data = res?.data || res;
        if (!data || typeof data !== "object") return;
        base44.entities.MealLog.update(log.id, { ai_analysis: data }).catch(() => {});
      })
      .catch(() => {});

    setQuickLogging(false);
  };

  return (
    <div className="rounded-[24px] p-5 mb-4" style={card}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p style={label}>Quick Meal Log</p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>What did you eat?</p>
        </div>
        <a href={createPageUrl("Nutrition")} className="text-xs font-medium" style={{ color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>Full tracker</a>
      </div>
      <textarea
        value={quickMealText}
        onChange={(e) => setQuickMealText(e.target.value)}
        placeholder="e.g. oats with banana and almond milk…"
        rows={2}
        aria-label="What did you eat?"
        className="w-full p-3.5 rounded-2xl text-sm resize-none focus:outline-none transition-all"
        style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
        onFocus={(e) => (e.target.style.borderColor = "var(--rose-dust-light)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
      <div className="flex gap-1.5 mt-3 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {MEAL_TYPES.map((t) => {
          const isActive = effectiveMealType === t;
          return (
            <button
              key={t}
              aria-label={`Select ${t}`}
              aria-pressed={isActive}
              onClick={() => {
                setQuickMealType(t);
                setUserToggled(true);
              }}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all"
              style={{
                backgroundColor: isActive ? "var(--plum)" : "var(--ivory)",
                color: isActive ? "white" : "var(--mauve)",
                border: `1px solid ${isActive ? "var(--plum)" : "var(--border)"}`,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>
      <button
        onClick={quickLogMeal}
        disabled={!quickMealText.trim() || quickLogging}
        aria-label="Log meal"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
        style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif", opacity: !quickMealText.trim() || quickLogging ? 0.5 : 1 }}
      >
        {quickLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {quickLogging ? "Logging…" : "Log Meal"}
      </button>
    </div>
  );
}
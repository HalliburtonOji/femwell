import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" };
const label = { fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" };

export default function QuickMealLog({ user, profile, getCyclePhase }) {
  const [quickMealText, setQuickMealText] = useState("");
  const [quickMealType, setQuickMealType] = useState("lunch");
  const [quickLogging, setQuickLogging] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const quickLogMeal = async () => {
    if (!quickMealText.trim()) return;
    setQuickLogging(true);
    let cyclePhaseAtLog = null;
    if (profile?.last_period_start_date && getCyclePhase) {
      const cycleInfo = getCyclePhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5);
      cyclePhaseAtLog = cycleInfo?.phase || null;
    }
    const log = await base44.entities.MealLog.create({
      user_id: user.id, day_key: todayStr,
      logged_at: new Date().toISOString(),
      meal_type: quickMealType, method: "text",
      raw_text: quickMealText.trim(), portion_size: "medium",
      ...(cyclePhaseAtLog ? { cycle_phase_at_log: cyclePhaseAtLog } : {}),
    });
    setQuickMealText("");
    base44.functions.invoke("analyzeMeal", { raw_text: log.raw_text, wellness_goal: "general wellness", cycle_phase: cyclePhaseAtLog })
      .then(res => { if (res?.data) base44.entities.MealLog.update(log.id, { ai_analysis: JSON.stringify(res.data) }).catch(() => {}); })
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
        className="w-full p-3.5 rounded-2xl text-sm resize-none focus:outline-none transition-all"
        style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
        onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
        onBlur={e => e.target.style.borderColor = "var(--border)"}
      />
      <div className="flex gap-1.5 mt-3 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {MEAL_TYPES.map((t) => (
          <button key={t} onClick={() => setQuickMealType(t)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all"
            style={{
              backgroundColor: quickMealType === t ? "var(--plum)" : "var(--ivory)",
              color: quickMealType === t ? "white" : "var(--mauve)",
              border: `1px solid ${quickMealType === t ? "var(--plum)" : "var(--border)"}`,
              fontFamily: "'Inter', sans-serif",
            }}>
            {t}
          </button>
        ))}
      </div>
      <button onClick={quickLogMeal} disabled={!quickMealText.trim() || quickLogging}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
        style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif", opacity: (!quickMealText.trim() || quickLogging) ? 0.5 : 1 }}>
        {quickLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {quickLogging ? "Logging…" : "Log Meal"}
      </button>
    </div>
  );
}
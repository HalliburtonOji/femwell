import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Droplets, Star, RefreshCw, Loader2, X, BookmarkPlus, Target, ChevronRight, Zap, Leaf, Moon, Smile, Wind } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import MacroDashboard from "./MacroDashboard";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const WELLNESS_GOALS = [
  { id: "energy",          label: "Energy" },
  { id: "hormone_support", label: "Hormone Support" },
  { id: "gut_health",      label: "Gut Health" },
  { id: "weight_balance",  label: "Weight Balance" },
  { id: "anti_inflammatory", label: "Anti-inflammatory" },
  { id: "mood_support",    label: "Mood Support" },
  { id: "general_wellness", label: "General Wellness" },
];

const MEAL_LABELS = { breakfast: "Morning", lunch: "Midday", dinner: "Evening", snack: "Snack" };

const PORTION_MULTIPLIERS = { small: 0.7, medium: 1.0, large: 1.4 };
const PORTION_LABELS = [{ id: "small", label: "Small" }, { id: "medium", label: "Medium" }, { id: "large", label: "Large" }];

// Gentle cycle-aware nutrient tips — no medical claims
const CYCLE_WELLNESS_TIPS = [
  { phase: "menstrual",  tip: "Iron-rich foods like lentils, leafy greens, and dark chocolate may help support energy this week." },
  { phase: "follicular", tip: "Light, energising meals may complement your natural rise in energy — think colourful salads and whole grains." },
  { phase: "ovulatory",  tip: "You might feel your best this week. Staying well-hydrated may support your natural vitality." },
  { phase: "luteal",     tip: "Magnesium-rich foods like nuts, seeds, and leafy greens may gently support mood and reduce bloating." },
];

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

function SkeletonCard() {
  return (
    <div className="rounded-[20px] p-4 animate-pulse" style={card}>
      <div className="h-2.5 w-14 rounded mb-2" style={{ backgroundColor: "var(--border)" }} />
      <div className="h-6 w-16 rounded" style={{ backgroundColor: "var(--border)" }} />
    </div>
  );
}

function QuickCheckCard({ analysis, onDismiss }) {
  if (!analysis?.quick_check) return null;
  const { supports, bullets, micro_action, action_type } = analysis.quick_check;
  const insight = analysis.insight;
  const actionLink = { breathwork: createPageUrl("Explore"), walk: createPageUrl("Explore"), journal: createPageUrl("Journal") }[action_type];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] p-4 mb-4 relative"
      style={{ backgroundColor: "#F0FAF5", border: "1px solid #C3E6D4" }}>
      <button onClick={onDismiss} className="absolute top-3 right-3" style={{ color: "var(--mauve)" }}>
        <X className="w-4 h-4" />
      </button>
      {insight?.headline && (
        <p className="text-sm font-semibold mb-1.5" style={{ color: "#1A6645", fontFamily: "'Playfair Display', serif" }}>
          {insight.headline}
        </p>
      )}
      {supports?.length > 0 && (
        <p className="text-xs mb-2" style={{ color: "var(--mauve)" }}>
          May support: <span className="font-medium" style={{ color: "var(--plum)" }}>{supports.join(", ")}</span>
        </p>
      )}
      <ul className="space-y-1 mb-3">
        {bullets?.map((b, i) => (
          <li key={i} className="text-xs flex gap-2" style={{ color: "#2D5540" }}>
            <span className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 block mt-1.5" />
            {b}
          </li>
        ))}
      </ul>
      {insight?.smart_swap && (
        <div className="rounded-xl px-3 py-2 mb-3" style={{ backgroundColor: "#FFF8EE", border: "1px solid #F5DFA8" }}>
          <p className="text-xs" style={{ color: "#7A5A20" }}>
            <span className="font-semibold">Smart swap: </span>{insight.smart_swap}
          </p>
        </div>
      )}
      {micro_action && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs font-medium" style={{ color: "#2D5540" }}>Try: {micro_action}</p>
          {actionLink && (
            <a href={actionLink} className="text-xs px-3 py-1.5 rounded-full text-white font-medium flex items-center gap-1"
              style={{ backgroundColor: "#2D9463" }}>
              Go <ChevronRight className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
      {insight?.tone_safety_note && (
        <p className="text-[10px] mt-3 italic" style={{ color: "var(--mauve)" }}>{insight.tone_safety_note}</p>
      )}
    </motion.div>
  );
}

function InsightFeedback({ insight, onFeedback }) {
  if (!insight) return null;
  if (insight.user_feedback !== "none") {
    return (
      <span className="text-xs" style={{ color: "var(--mauve)" }}>
        {insight.user_feedback === "positive" ? "Marked helpful" : "Noted"}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px]" style={{ color: "var(--mauve)" }}>Helpful?</span>
      <button onClick={() => onFeedback(insight, "positive")}
        className="text-xs px-2.5 py-1 rounded-full transition-colors font-medium"
        style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }}>
        Yes
      </button>
      <button onClick={() => onFeedback(insight, "negative")}
        className="text-xs px-2.5 py-1 rounded-full transition-colors font-medium"
        style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
        Not really
      </button>
    </div>
  );
}

export default function NutritionTodayTab({ user, profile, nutritionProfile, dayKey, checkin }) {
  const [meals, setMeals]                   = useState([]);
  const [hydrationLogs, setHydrationLogs]   = useState([]);
  const [templates, setTemplates]           = useState([]);
  const [insights, setInsights]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [mealText, setMealText]             = useState("");
  const [mealType, setMealType]             = useState("lunch");
  const [selectedGoal, setSelectedGoal]     = useState(null);
  const [logging, setLogging]               = useState(false);
  const [lastAnalysis, setLastAnalysis]     = useState(null);
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const [showTemplates, setShowTemplates]   = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [portionSize, setPortionSize] = useState("medium");

  const hydrationTargetMl = nutritionProfile?.hydration_target_ml || 2000;
  const totalHydration    = hydrationLogs.reduce((sum, l) => sum + (l.amount_ml || 0), 0);
  const hydrationPct      = Math.min(100, Math.round((totalHydration / hydrationTargetMl) * 100));

  useEffect(() => { loadData(); }, [dayKey]);

  const loadData = async () => {
    setLoading(true);
    const [mealLogs, hydration, tmpl, ins] = await Promise.all([
      base44.entities.MealLog.filter({ user_id: user.id, day_key: dayKey }),
      base44.entities.HydrationLog.filter({ user_id: user.id, day_key: dayKey }),
      base44.entities.MealTemplates.filter({ user_id: user.id }),
      base44.entities.NutritionInsight.filter({ user_id: user.id, day_key: dayKey }),
    ]);
    setMeals(mealLogs);
    setHydrationLogs(hydration);
    setTemplates(tmpl);
    setInsights(ins);
    setLoading(false);
  };

  const logMeal = async (text, type, method = "text") => {
    if (!text.trim()) return;
    setLogging(true);
    const log = await base44.entities.MealLog.create({
      user_id: user.id, day_key: dayKey,
      logged_at: new Date().toISOString(),
      meal_type: type, method, raw_text: text.trim(),
      wellness_goal: selectedGoal || undefined,
      portion_size: portionSize,
    });
    setMeals((prev) => [...prev, log]);
    setMealText("");
    try {
      let phasePromptAppend = "";
      if (profile?.last_period_start_date) {
        const today = new Date();
        const lastPeriod = new Date(profile.last_period_start_date);
        const daysSince = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
        const cycleDay = (daysSince % profile.cycle_avg_length) + 1;
        const periodLength = profile.period_length || 5;
        const phase = cycleDay <= periodLength ? 'menstrual'
          : cycleDay <= 13 ? 'follicular'
          : cycleDay <= 17 ? 'ovulatory'
          : 'luteal';
        phasePromptAppend = ` The user is currently in their ${phase} phase. Context for your analysis: menstrual = rest and restoration, iron and anti-inflammatory foods are beneficial; follicular = oestrogen rising, cruciferous vegetables and fermented foods support this phase; ovulatory = peak energy, antioxidants and zinc-rich foods are ideal; luteal = progesterone rising then dropping, magnesium and complex carbohydrates reduce PMS symptoms and support serotonin. In one sentence only at the end of your response, note how the logged meal relates to this phase. Do not make it the main focus.`;
      }

      const res = await base44.functions.invoke("analyzeMeal", {
        raw_text: text.trim(), energy_level: checkin?.energy,
        digestion_score: checkin?.digestion,
        wellness_goal: selectedGoal || "general wellness",
        prompt_append: phasePromptAppend,
      });
      if (res.data) {
        setLastAnalysis(res.data);
        setShowQuickCheck(true);
        if (res.data.items?.length > 0) {
          await base44.entities.MealLog.update(log.id, { ai_analysis: JSON.stringify(res.data) });
          const nutritionProfiles = await base44.entities.NutritionProfile.filter({ user_id: user.id });
          if (nutritionProfiles[0]?.goal_mode) {
            await base44.entities.MealLog.update(log.id, { wellness_goal: nutritionProfiles[0].goal_mode });
          }
        }
        if (res.data.insight) {
          const { headline, wellness_impact, action_items, smart_swap, confidence, tone_safety_note } = res.data.insight;
          const saved = await base44.entities.NutritionInsight.create({
            user_id: user.id, meal_log_id: log.id, day_key: dayKey,
            meal_description: text.trim(), wellness_goal: selectedGoal || "general wellness",
            headline, wellness_impact, action_items, smart_swap,
            confidence: confidence || "medium", tone_safety_note, user_feedback: "none",
          });
          setInsights((prev) => [...prev, saved]);
        }
      }
    } catch (_) {}
    setLogging(false);
  };

  const handleInsightFeedback = async (insight, feedback) => {
    await base44.entities.NutritionInsight.update(insight.id, { user_feedback: feedback });
    setInsights((prev) => prev.map((i) => i.id === insight.id ? { ...i, user_feedback: feedback } : i));
  };

  const repeatLast = () => {
    const last = [...meals].reverse().find((m) => m.raw_text);
    if (last) { setMealText(last.raw_text); setMealType(last.meal_type); }
  };

  const saveAsTemplate = async () => {
    if (!mealText.trim()) return;
    setSavingTemplate(true);
    await base44.entities.MealTemplates.create({ user_id: user.id, title: mealText.trim(), default_meal_type: mealType });
    setSavingTemplate(false);
    setTemplates(await base44.entities.MealTemplates.filter({ user_id: user.id }));
  };

  const logWater = async (ml) => {
    const log = await base44.entities.HydrationLog.create({ user_id: user.id, day_key: dayKey, amount_ml: ml, logged_at: new Date().toISOString() });
    setHydrationLogs((prev) => [...prev, log]);
    const totalGlasses = Math.round((totalHydration + ml) / 250);
    if (checkin?.id) base44.entities.DailyCheckins.update(checkin.id, { hydration_glasses: totalGlasses });
  };

  const deleteMeal = async (id) => {
    await base44.entities.MealLog.delete(id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const mealsByType = MEAL_TYPES.reduce((acc, t) => {
    acc[t] = meals.filter((m) => m.meal_type === t);
    return acc;
  }, {});

  const balancedScore   = meals.length > 0 ? Math.min(5, Math.round((meals.filter(m => m.ai_analysis).length / meals.length) * 5)) : 0;
  const selectedGoalObj = WELLNESS_GOALS.find(g => g.id === selectedGoal);

  // Derive cycle phase from profile if available
  const cycleWellnessTip = (() => {
    if (!profile?.last_period_start_date) return null;
    const cycleLen  = profile.cycle_avg_length || 28;
    const periodLen = profile.period_length    || 5;
    const daysSince = Math.floor((Date.now() - new Date(profile.last_period_start_date).getTime()) / 86400000);
    const dayOfCycle = (daysSince % cycleLen) + 1;
    const phase = dayOfCycle <= periodLen ? "menstrual"
      : dayOfCycle <= Math.round(cycleLen * 0.4) ? "follicular"
      : dayOfCycle <= Math.round(cycleLen * 0.55) ? "ovulatory"
      : "luteal";
    return CYCLE_WELLNESS_TIPS.find(t => t.phase === phase) || null;
  })();

  const calorieTarget = nutritionProfile?.calories_target || nutritionProfile?.calorie_target || 2000;
  const mealsWithCalories = meals.filter(m => {
    try { return m.ai_analysis && JSON.parse(m.ai_analysis)?.nutritional_summary?.calories > 0; } catch { return false; }
  });
  const totalCalories = meals.reduce((sum, m) => {
    try {
      const cal = JSON.parse(m.ai_analysis)?.nutritional_summary?.calories || 0;
      const multiplier = PORTION_MULTIPLIERS[m.portion_size] || 1.0;
      return sum + Math.round(cal * multiplier);
    } catch { return sum; }
  }, 0);
  const totalProtein = mealsWithCalories.reduce((sum, m) => {
    try { return sum + (JSON.parse(m.ai_analysis)?.nutritional_summary?.protein_g || 0); } catch { return sum; }
  }, 0);
  const totalCarbs = mealsWithCalories.reduce((sum, m) => {
    try { return sum + (JSON.parse(m.ai_analysis)?.nutritional_summary?.carbs_g || 0); } catch { return sum; }
  }, 0);
  const totalFat = mealsWithCalories.reduce((sum, m) => {
    try { return sum + (JSON.parse(m.ai_analysis)?.nutritional_summary?.fat_g || 0); } catch { return sum; }
  }, 0);
  const caloriePct = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));

  return (
    <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start">
      <div className="space-y-4">

        {/* Calorie summary bar */}
        {mealsWithCalories.length > 0 && (
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Today's nutrition</p>
              <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{Math.max(0, calorieTarget - totalCalories)} remaining</p>
            </div>
            <div style={{ height: 8, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", overflow: "hidden", marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${caloriePct}%`, backgroundColor: totalCalories > calorieTarget ? "var(--rose-dust)" : "var(--sage)", borderRadius: 9999, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Calories", value: `${totalCalories}` },
                { label: "Protein", value: `${Math.round(totalProtein)}g` },
                { label: "Carbs", value: `${Math.round(totalCarbs)}g` },
                { label: "Fat", value: `${Math.round(totalFat)}g` },
              ].map(chip => (
                <div key={chip.label} style={{ flex: 1, backgroundColor: "var(--ivory)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 4px", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{chip.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{chip.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cycle wellness context */}
        {cycleWellnessTip && (
          <div className="rounded-[20px] px-4 py-3 mb-0" style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>
              {cycleWellnessTip.tip}
            </p>
          </div>
        )}

        {/* Daily Snapshot */}
        <div className="grid grid-cols-4 gap-2">
          {loading ? [0,1,2,3].map(i => <SkeletonCard key={i} />) : (
            <>
              {[
                { label: "Hydration",  value: `${totalHydration}ml`,               sub: `${hydrationPct}%`,  color: "var(--sage-subtle)",        accent: "var(--sage)" },
                { label: "Meals",      value: `${meals.length}`,                    sub: "logged",            color: "var(--rose-dust-subtle)",   accent: "var(--rose-dust)" },
                { label: "Balance",    value: `${balancedScore}/5`,                 sub: "score",             color: "var(--mauve-subtle)",       accent: "var(--mauve)" },
                { label: "Energy",     value: checkin?.energy ? `${checkin.energy}/10` : "—", sub: "check-in", color: "var(--ivory-dark)",      accent: "var(--plum)" },
              ].map((c) => (
                <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-[20px] p-3" style={{ backgroundColor: c.color, border: "1px solid var(--border-subtle)" }}>
                  <p className="text-sm font-bold" style={{ color: c.accent }}>{c.value}</p>
                  <p style={{ ...sLabel, color: c.accent, opacity: 0.75, marginTop: 2 }}>{c.label}</p>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Quick Check */}
        <AnimatePresence>
          {showQuickCheck && lastAnalysis && (
            <QuickCheckCard analysis={lastAnalysis} onDismiss={() => setShowQuickCheck(false)} />
          )}
        </AnimatePresence>

        {/* Meal Logger */}
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-3">Log a Meal</p>
          <textarea
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            placeholder="What did you eat? Describe naturally…"
            rows={2}
            className="w-full p-4 rounded-2xl text-sm resize-none focus:outline-none transition-all"
            style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />

          {/* Meal type */}
          <div className="flex gap-1.5 mt-3 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {MEAL_TYPES.map((t) => (
              <button key={t} onClick={() => setMealType(t)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  backgroundColor: mealType === t ? "var(--plum)" : "var(--ivory)",
                  color: mealType === t ? "white" : "var(--mauve)",
                  border: `1px solid ${mealType === t ? "var(--plum)" : "var(--border)"}`,
                  fontFamily: "'Inter', sans-serif",
                }}>
                {MEAL_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Portion size */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {PORTION_LABELS.map((p) => (
              <button key={p.id} onClick={() => setPortionSize(p.id)} style={{
                flex: 1, padding: "7px 0", borderRadius: 12, fontSize: 12, fontWeight: 600,
                fontFamily: "'Inter', sans-serif", cursor: "pointer", transition: "all 0.15s",
                border: portionSize === p.id ? "1.5px solid var(--plum)" : "1.5px solid var(--border)",
                backgroundColor: portionSize === p.id ? "var(--plum)" : "var(--ivory)",
                color: portionSize === p.id ? "white" : "var(--mauve)",
              }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Wellness goal */}
          <button onClick={() => setShowGoalPicker(!showGoalPicker)}
            className="flex items-center gap-1.5 text-xs font-medium mb-3 transition-colors"
            style={{ color: selectedGoal ? "var(--rose-dust)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            <Target className="w-3.5 h-3.5" />
            {selectedGoalObj ? selectedGoalObj.label : "Set wellness focus (optional)"}
          </button>
          <AnimatePresence>
            {showGoalPicker && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
                <div className="flex flex-wrap gap-1.5">
                  {WELLNESS_GOALS.map((g) => (
                    <button key={g.id} onClick={() => { setSelectedGoal(selectedGoal === g.id ? null : g.id); setShowGoalPicker(false); }}
                      className="px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        backgroundColor: selectedGoal === g.id ? "var(--plum)" : "var(--ivory)",
                        color: selectedGoal === g.id ? "white" : "var(--plum)",
                        border: `1px solid ${selectedGoal === g.id ? "var(--plum)" : "var(--border)"}`,
                      }}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => logMeal(mealText, mealType)} disabled={!mealText.trim() || logging}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{ backgroundColor: "var(--plum)", color: "white", opacity: (!mealText.trim() || logging) ? 0.5 : 1 }}>
              {logging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {logging ? "Analysing…" : "Log Meal"}
            </button>
            <button onClick={saveAsTemplate} disabled={!mealText.trim() || savingTemplate} title="Save as routine"
              className="w-11 rounded-2xl flex items-center justify-center transition-all"
              style={{ border: "1.5px solid var(--border)", color: "var(--mauve)", backgroundColor: "transparent", opacity: !mealText.trim() ? 0.4 : 1 }}>
              {savingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
            </button>
            <button onClick={repeatLast} disabled={meals.length === 0} title="Repeat last meal"
              className="w-11 rounded-2xl flex items-center justify-center transition-all"
              style={{ border: "1.5px solid var(--border)", color: "var(--mauve)", backgroundColor: "transparent", opacity: meals.length === 0 ? 0.4 : 1 }}>
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setShowTemplates(!showTemplates)} disabled={templates.length === 0} title="Saved routines"
              className="w-11 rounded-2xl flex items-center justify-center transition-all"
              style={{ border: "1.5px solid var(--border)", color: "var(--mauve)", backgroundColor: "transparent", opacity: templates.length === 0 ? 0.4 : 1 }}>
              <Star className="w-4 h-4" />
            </button>
          </div>

          {/* Templates dropdown */}
          {showTemplates && templates.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              {templates.map((t) => (
                <button key={t.id} onClick={() => { setMealText(t.title); setMealType(t.default_meal_type); setShowTemplates(false); }}
                  className="w-full text-left px-4 py-3 text-sm transition-colors"
                  style={{ color: "var(--plum)", borderBottom: "1px solid var(--border-subtle)", fontFamily: "'Inter', sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--ivory)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                  <span className="font-medium text-xs capitalize mr-2" style={{ color: "var(--mauve)" }}>
                    {MEAL_LABELS[t.default_meal_type]}
                  </span>
                  {t.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Meal Timeline */}
        {MEAL_TYPES.map((type) => {
          const typeMeals = mealsByType[type];
          if (typeMeals.length === 0 && !loading) return null;
          return (
            <div key={type} className="rounded-[24px] p-5" style={card}>
              <div className="flex items-center justify-between mb-4">
                <p style={sLabel}>{MEAL_LABELS[type]}</p>
                <span className="text-xs" style={{ color: "var(--mauve)" }}>
                  {typeMeals.length} {typeMeals.length !== 1 ? "items" : "item"}
                </span>
              </div>
              <div className="space-y-3">
                {typeMeals.map((meal) => {
                  const analysis    = meal.ai_analysis ? JSON.parse(meal.ai_analysis) : null;
                  const mealInsight = insights.find((ins) => ins.meal_log_id === meal.id);
                  return (
                    <div key={meal.id} className="rounded-2xl p-4" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{meal.raw_text}</p>
                          {meal.portion_size && meal.portion_size !== "medium" && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)",
                              borderRadius: 20, padding: "2px 8px", marginLeft: 4, fontFamily: "'Inter', sans-serif" }}>
                              {meal.portion_size.charAt(0).toUpperCase() + meal.portion_size.slice(1)}
                            </span>
                          )}
                          {meal.wellness_goal && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1.5 mr-1 font-semibold"
                              style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
                              {WELLNESS_GOALS.find(g => g.id === meal.wellness_goal)?.label}
                            </span>
                          )}
                          {analysis?.meal_score && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#FFF8EE", color: "#A07830" }}>Protein {analysis.meal_score.protein}/10</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }}>Fibre {analysis.meal_score.veg_fiber}/10</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)" }}>Balance {analysis.meal_score.balance}/10</span>
                            </div>
                          )}
                          <p className="text-[10px] mt-1.5" style={{ color: "var(--mauve)" }}>
                            {meal.logged_at ? format(new Date(meal.logged_at), "HH:mm") : ""}
                          </p>
                          {(analysis?.nutritional_summary?.calories) && (
                            <span style={{ backgroundColor: "var(--ivory-dark)", borderRadius: "9999px", padding: "2px 8px", fontSize: "11px", fontWeight: 600, color: "var(--mauve)", marginTop: "4px", display: "inline-block", fontFamily: "'Inter', sans-serif" }}>
                              ~{analysis.nutritional_summary.calories} kcal
                            </span>
                          )}
                        </div>
                        <button onClick={() => deleteMeal(meal.id)} className="flex-shrink-0" style={{ color: "var(--border)" }}
                          onMouseEnter={e => e.currentTarget.style.color = "var(--rose-dust)"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--border)"}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {mealInsight?.wellness_impact && (
                        <div className="mt-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: "#F0FAF5", border: "1px solid #C3E6D4" }}>
                          <p className="text-[11px] leading-relaxed" style={{ color: "#2D5540" }}>{mealInsight.wellness_impact}</p>
                          {mealInsight.action_items && (
                            <p className="text-[10px] mt-1" style={{ color: "#4A8266" }}>
                              <span className="font-semibold">Next: </span>{mealInsight.action_items}
                            </p>
                          )}
                          <InsightFeedback insight={mealInsight} onFeedback={handleInsightFeedback} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {!loading && meals.length === 0 && (
          <div className="rounded-[24px] py-12 text-center" style={card}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
              <Plus className="w-5 h-5" />
            </div>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--plum)" }}>Nothing logged yet</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Use the meal logger above to get started</p>
          </div>
        )}

        {/* Water Tracker */}
        <div className="rounded-[24px] p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={sLabel} className="mb-0.5">Hydration</p>
              <p className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                {totalHydration}ml
                <span className="text-xs font-normal ml-1" style={{ color: "var(--mauve)" }}>/ {hydrationTargetMl}ml</span>
              </p>
            </div>
            <span className="text-sm font-bold" style={{ color: hydrationPct >= 100 ? "var(--sage)" : "var(--mauve)" }}>{hydrationPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: "var(--sage-subtle)" }}>
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }} animate={{ width: `${hydrationPct}%` }} transition={{ duration: 0.5 }}
              style={{ background: "linear-gradient(90deg, var(--sage-light), var(--sage))" }} />
          </div>
          {/* Glass dots */}
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {Array.from({ length: Math.round(hydrationTargetMl / 250) }).map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-full transition-all"
                style={{
                  backgroundColor: i < Math.round(totalHydration / 250) ? "var(--sage-light)" : "var(--border-subtle)",
                  border: `1.5px solid ${i < Math.round(totalHydration / 250) ? "var(--sage)" : "var(--border)"}`,
                }} />
            ))}
          </div>
          <div className="flex gap-2">
            {[250, 500, 750].map((ml) => (
              <button key={ml} onClick={() => logWater(ml)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", border: "1px solid var(--sage-light)" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--sage-light)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--sage-subtle)"}>
                +{ml}ml
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="mt-4 lg:mt-0 lg:sticky lg:top-6">
        <MacroDashboard meals={meals} hydrationLogs={hydrationLogs} nutritionProfile={nutritionProfile} />
      </div>
    </div>
  );
}
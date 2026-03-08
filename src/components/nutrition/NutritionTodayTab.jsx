import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Droplets, Star, RefreshCw, Loader2, ChevronRight, X, BookmarkPlus, Target } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import MacroDashboard from "./MacroDashboard";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_EMOJIS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" };

const WELLNESS_GOALS = [
  { id: "energy", label: "Boost Energy", emoji: "⚡" },
  { id: "digestion", label: "Improve Digestion", emoji: "🌿" },
  { id: "sleep", label: "Better Sleep", emoji: "💤" },
  { id: "mood", label: "Mood Support", emoji: "😊" },
  { id: "hydration", label: "Stay Hydrated", emoji: "💧" },
  { id: "hormone", label: "Hormone Balance", emoji: "🌸" },
];

function SkeletonCard() {
  return (
    <div className="card-glass rounded-2xl p-4 animate-pulse">
      <div className="h-3 w-16 bg-rose-100 rounded mb-2" />
      <div className="h-6 w-20 bg-rose-100 rounded" />
    </div>
  );
}

function QuickCheckCard({ analysis, onDismiss }) {
  if (!analysis?.quick_check) return null;
  const { supports, bullets, micro_action, action_type } = analysis.quick_check;
  const insight = analysis.insight;

  const actionLink = {
    breathwork: createPageUrl("Explore"),
    walk: createPageUrl("Explore"),
    water: null,
    snack: null,
    journal: createPageUrl("Journal"),
  }[action_type];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="card-glass rounded-2xl p-4 mb-4 border border-emerald-100 bg-emerald-50/40 relative">
      <button onClick={onDismiss} className="absolute top-3 right-3 text-gray-300 hover:text-gray-500"><X className="w-4 h-4" /></button>
      {insight?.headline && <p className="text-sm font-bold text-emerald-700 mb-1">✨ {insight.headline}</p>}
      {supports?.length > 0 && <p className="text-xs text-gray-500 mb-2">May support: <span className="font-medium text-gray-700">{supports.join(", ")}</span></p>}
      <ul className="space-y-1 mb-3">
        {bullets?.map((b, i) => <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span className="text-emerald-400 flex-shrink-0">•</span>{b}</li>)}
      </ul>
      {insight?.smart_swap && (
        <div className="bg-amber-50 rounded-xl px-3 py-2 mb-3">
          <p className="text-xs text-amber-700"><span className="font-semibold">💡 Smart Swap:</span> {insight.smart_swap}</p>
        </div>
      )}
      {micro_action && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs font-medium text-gray-600">Try: {micro_action}</p>
          {actionLink && (
            <a href={actionLink} className="text-xs px-3 py-1.5 rounded-full bg-emerald-500 text-white font-medium">
              Try this <ChevronRight className="w-3 h-3 inline" />
            </a>
          )}
        </div>
      )}
      {insight?.tone_safety_note && (
        <p className="text-[10px] text-gray-400 mt-3 italic">{insight.tone_safety_note}</p>
      )}
    </motion.div>
  );
}

function InsightFeedback({ insight, onFeedback }) {
  if (!insight || insight.user_feedback !== "none") {
    return insight?.user_feedback !== "none" ? (
      <span className="text-xs text-gray-400">{insight.user_feedback === "positive" ? "👍 Helpful" : "👎 Not helpful"}</span>
    ) : null;
  }
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px] text-gray-400">Helpful?</span>
      <button onClick={() => onFeedback(insight, "positive")} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100">👍</button>
      <button onClick={() => onFeedback(insight, "negative")} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-400 hover:bg-red-100">👎</button>
    </div>
  );
}

export default function NutritionTodayTab({ user, profile, nutritionProfile, dayKey, checkin }) {
  const [meals, setMeals] = useState([]);
  const [hydrationLogs, setHydrationLogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mealText, setMealText] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [logging, setLogging] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const hydrationTargetMl = nutritionProfile?.hydration_target_ml || 2000;
  const totalHydration = hydrationLogs.reduce((sum, l) => sum + (l.amount_ml || 0), 0);
  const hydrationPct = Math.min(100, Math.round((totalHydration / hydrationTargetMl) * 100));

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
      user_id: user.id,
      day_key: dayKey,
      logged_at: new Date().toISOString(),
      meal_type: type,
      method,
      raw_text: text.trim(),
      wellness_goal: selectedGoal || undefined,
    });
    setMeals((prev) => [...prev, log]);
    setMealText("");

    // Analyze with AI
    try {
      const res = await base44.functions.invoke("analyzeMeal", {
        raw_text: text.trim(),
        energy_level: checkin?.energy,
        digestion_score: checkin?.digestion,
        wellness_goal: selectedGoal || "general wellness",
      });
      if (res.data) {
        setLastAnalysis(res.data);
        setShowQuickCheck(true);
        if (res.data.items?.length > 0) {
          await base44.entities.MealLog.update(log.id, { ai_analysis: JSON.stringify(res.data) });
        }
        // Save NutritionInsight
        if (res.data.insight) {
          const { headline, wellness_impact, action_items, smart_swap, confidence, tone_safety_note } = res.data.insight;
          const savedInsight = await base44.entities.NutritionInsight.create({
            user_id: user.id,
            meal_log_id: log.id,
            day_key: dayKey,
            meal_description: text.trim(),
            wellness_goal: selectedGoal || "general wellness",
            headline,
            wellness_impact,
            action_items,
            smart_swap,
            confidence: confidence || "medium",
            tone_safety_note,
            user_feedback: "none",
          });
          setInsights((prev) => [...prev, savedInsight]);
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
    if (checkin?.id) {
      base44.entities.DailyCheckins.update(checkin.id, { hydration_glasses: totalGlasses });
    }
  };

  const deleteMeal = async (id) => {
    await base44.entities.MealLog.delete(id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const mealsByType = MEAL_TYPES.reduce((acc, t) => {
    acc[t] = meals.filter((m) => m.meal_type === t);
    return acc;
  }, {});

  const proteinMeals = meals.filter((m) => m.ai_analysis).length;
  const balancedScore = meals.length > 0 ? Math.min(5, Math.round((proteinMeals / meals.length) * 5)) : 0;

  return (
    <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start">
    {/* ── Left column (main content) ── */}
    <div className="space-y-4">
      {/* Daily Snapshot */}
      <div className="grid grid-cols-4 gap-2">
        {loading ? (
          [0,1,2,3].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {[
              { label: "Hydration", value: `${totalHydration}ml`, sub: `${hydrationPct}%`, emoji: "💧", color: "from-blue-200 to-cyan-200" },
              { label: "Meals", value: `${meals.length}`, sub: "logged", emoji: "🍽️", color: "from-amber-100 to-orange-100" },
              { label: "Balance", value: `${balancedScore}/5`, sub: "score", emoji: "⚖️", color: "from-emerald-100 to-teal-100" },
              { label: "Energy", value: checkin?.energy ? `${checkin.energy}/10` : "—", sub: "check-in", emoji: "⚡", color: "from-rose-100 to-pink-100" },
            ].map((card) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`card-glass rounded-2xl p-3 bg-gradient-to-br ${card.color}`}>
                <p className="text-base">{card.emoji}</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{card.value}</p>
                <p className="text-[10px] text-gray-500">{card.label}</p>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Quick Check card */}
      <AnimatePresence>
        {showQuickCheck && lastAnalysis && (
          <QuickCheckCard analysis={lastAnalysis} onDismiss={() => setShowQuickCheck(false)} />
        )}
      </AnimatePresence>

      {/* Meal Logger */}
      <div className="card-glass rounded-2xl p-4">
        <p className="text-sm font-bold text-gray-800 mb-3">10-second meal log 🍴</p>
        <textarea
          value={mealText}
          onChange={(e) => setMealText(e.target.value)}
          placeholder="What did you eat? (e.g. jollof + chicken + diet coke)"
          rows={2}
          className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 text-gray-700 mb-3"
        />
        {/* Meal type chips */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
          {MEAL_TYPES.map((t) => (
            <button key={t} onClick={() => setMealType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${mealType === t ? "bg-rose-500 text-white" : "bg-white/70 text-gray-500 border border-rose-100"}`}>
              {MEAL_EMOJIS[t]} {t}
            </button>
          ))}
        </div>

        {/* Wellness goal picker */}
        <button onClick={() => setShowGoalPicker(!showGoalPicker)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-rose-500 mb-3 font-medium">
          <Target className="w-3.5 h-3.5" />
          {selectedGoal ? WELLNESS_GOALS.find(g => g.id === selectedGoal)?.label : "Set wellness goal (optional)"}
        </button>
        <AnimatePresence>
          {showGoalPicker && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {WELLNESS_GOALS.map((g) => (
                  <button key={g.id} onClick={() => { setSelectedGoal(selectedGoal === g.id ? null : g.id); setShowGoalPicker(false); }}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${selectedGoal === g.id ? "bg-rose-500 text-white" : "bg-white/70 text-gray-600 border border-rose-100"}`}>
                    {g.emoji} {g.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button onClick={() => logMeal(mealText, mealType)} disabled={!mealText.trim() || logging}
            className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
            {logging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {logging ? "Analysing…" : "Log"}
          </button>
          <button onClick={saveAsTemplate} disabled={!mealText.trim() || savingTemplate}
            className="btn-secondary px-3 py-2.5 text-sm flex items-center gap-1" title="Save as template">
            {savingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
          </button>
          <button onClick={repeatLast} disabled={meals.length === 0}
            className="btn-secondary px-3 py-2.5 text-sm flex items-center gap-1" title="Repeat last meal">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowTemplates(!showTemplates)} disabled={templates.length === 0}
            className="btn-secondary px-3 py-2.5 text-sm flex items-center gap-1" title="Favourites">
            <Star className="w-4 h-4" />
          </button>
        </div>
        {/* Templates dropdown */}
        {showTemplates && templates.length > 0 && (
          <div className="mt-3 rounded-xl border border-rose-100 overflow-hidden">
            {templates.map((t) => (
              <button key={t.id} onClick={() => { setMealText(t.title); setMealType(t.default_meal_type); setShowTemplates(false); }}
                className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-rose-50 transition-colors border-b border-rose-50 last:border-b-0">
                {MEAL_EMOJIS[t.default_meal_type]} {t.title}
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
          <div key={type} className="card-glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{MEAL_EMOJIS[type]}</span>
              <p className="text-sm font-bold text-gray-800 capitalize">{type}</p>
              <span className="ml-auto text-xs text-gray-400">{typeMeals.length} item{typeMeals.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-3">
              {typeMeals.map((meal) => {
                const analysis = meal.ai_analysis ? JSON.parse(meal.ai_analysis) : null;
                const mealInsight = insights.find((ins) => ins.meal_log_id === meal.id);
                return (
                  <div key={meal.id} className="bg-white/60 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium">{meal.raw_text}</p>
                        {meal.wellness_goal && (
                          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 mt-1 mr-1">
                            {WELLNESS_GOALS.find(g => g.id === meal.wellness_goal)?.emoji} {WELLNESS_GOALS.find(g => g.id === meal.wellness_goal)?.label}
                          </span>
                        )}
                        {analysis?.meal_score && (
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">🥩 {analysis.meal_score.protein}/10</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600">🥦 {analysis.meal_score.veg_fiber}/10</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">⚖️ {analysis.meal_score.balance}/10</span>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">{meal.logged_at ? format(new Date(meal.logged_at), "HH:mm") : ""}</p>
                      </div>
                      <button onClick={() => deleteMeal(meal.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {mealInsight?.wellness_impact && (
                      <div className="mt-2 bg-emerald-50/60 rounded-lg px-3 py-2">
                        <p className="text-[11px] text-emerald-700 leading-relaxed">{mealInsight.wellness_impact}</p>
                        {mealInsight.action_items && (
                          <p className="text-[10px] text-gray-500 mt-1">Next: {mealInsight.action_items}</p>
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

      {!loading && meals.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">🍽️</p>
          <p className="text-sm font-medium">Nothing logged yet</p>
          <p className="text-xs mt-1">Use the meal logger above to get started</p>
        </div>
      )}

      {/* Water Tracker */}
      <div className="card-glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <p className="text-sm font-bold text-gray-800">Hydration</p>
          </div>
          <p className="text-xs text-gray-500">{totalHydration}ml / {hydrationTargetMl}ml</p>
        </div>
        <div className="w-full h-2.5 bg-blue-50 rounded-full mb-3 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-blue-300 to-cyan-400 rounded-full"
            initial={{ width: 0 }} animate={{ width: `${hydrationPct}%` }} transition={{ duration: 0.5 }} />
        </div>
        <div className="flex gap-1 mb-3 flex-wrap">
          {Array.from({ length: Math.round(hydrationTargetMl / 250) }).map((_, i) => (
            <div key={i} className={`text-sm ${i < Math.round(totalHydration / 250) ? "opacity-100" : "opacity-20"}`}>💧</div>
          ))}
        </div>
        <div className="flex gap-2">
          {[250, 500, 750].map((ml) => (
            <button key={ml} onClick={() => logWater(ml)}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
              +{ml}ml
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Right column — macro dashboard, stacks below on mobile */}
    <div className="mt-4 lg:mt-0 lg:sticky lg:top-6 space-y-4">
      <MacroDashboard
        meals={meals}
        hydrationLogs={hydrationLogs}
        nutritionProfile={nutritionProfile}
      />
    </div>

    </div>{/* end outer grid */}
  );
}
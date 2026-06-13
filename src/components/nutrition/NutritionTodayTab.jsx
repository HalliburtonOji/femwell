import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Star, RefreshCw, Loader2, X, BookmarkPlus, Target, ChevronRight, BookOpen } from "lucide-react";
import { toast } from "sonner";
import FoodLookup from "./FoodLookup";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import MacroDashboard from "./MacroDashboard";
import WeeklyCaloriesChart from "./WeeklyCaloriesChart";
import { getCyclePhaseOrNull, getCyclePhaseStatus } from "@/utils/cyclePhase";
import { readAiAnalysis, getMealSummary, inferMealTypeFromTime } from "@/utils/nutritionAiAnalysis";
import { logAppEvent } from "@/utils/appEvents";
import { runNutritionMigrationsIfNeeded } from "@/utils/nutritionMigrations";
import { withTimeout } from "@/utils/safeEntity";

const DISCLAIMER_THROTTLE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

const DRINK_TYPES = [
  { id: "water",      label: "Water",      ml: 250 },
  { id: "coffee",     label: "Coffee",     ml: 240 },
  { id: "tea",        label: "Tea",        ml: 240 },
  { id: "soft_drink", label: "Soft drink", ml: 330 },
  { id: "juice",      label: "Juice",      ml: 250 },
  { id: "alcohol",    label: "Alcohol",    ml: 250 },
  { id: "smoothie",   label: "Smoothie",   ml: 300 },
  { id: "milk",       label: "Milk",       ml: 200 },
];
const DRINK_CALS = {
  water: 0, coffee: 5, tea: 2, soft_drink: 140,
  juice: 110, alcohol: 180, smoothie: 200, milk: 120,
};

const DRINK_SIZES = [
  { id: "small",  label: "Small",  ml: 150 },
  { id: "medium", label: "Medium", ml: 250 },
  { id: "large",  label: "Large",  ml: 400 },
];

const CUSTOM_NAME_META = {
  soft_drink: { label: "Which soft drink?",    placeholder: "e.g. Coke, Sprite..." },
  alcohol:    { label: "What are you drinking?", placeholder: "e.g. wine, beer..." },
  juice:      { label: "What juice?",            placeholder: "e.g. orange, apple..." },
  smoothie:   { label: "What's in it?",          placeholder: "e.g. banana..." },
};

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
      style={{ backgroundColor: "rgba(122,158,142,0.12)", border: "1px solid rgba(122,158,142,0.3)" }}>
      <button onClick={onDismiss} className="absolute top-3 right-3" style={{ color: "var(--mauve)" }}>
        <X className="w-4 h-4" />
      </button>
      {insight?.headline && (
        <p className="text-sm font-semibold mb-1.5" style={{ color: "var(--sage)", }}>
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
          <li key={i} className="text-xs flex gap-2" style={{ color: "var(--sage)" }}>
            <span className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full block mt-1.5" style={{ backgroundColor: "var(--sage)" }} />
            {b}
          </li>
        ))}
      </ul>
      {insight?.smart_swap && (
        <div className="rounded-xl px-3 py-2 mb-3" style={{ backgroundColor: "rgba(168,137,63,0.12)", border: "1px solid rgba(168,137,63,0.3)" }}>
          <p className="text-xs" style={{ color: "var(--gold)" }}>
            <span className="font-semibold">Smart swap: </span>{insight.smart_swap}
          </p>
        </div>
      )}
      {micro_action && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs font-medium" style={{ color: "var(--sage)" }}>Try: {micro_action}</p>
          {actionLink && (
            <a href={actionLink} className="text-xs px-3 py-1.5 rounded-full text-white font-medium flex items-center gap-1"
              style={{ backgroundColor: "var(--sage)" }}>
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
  const [mealType, setMealType]             = useState(() => inferMealTypeFromTime());
  const [userToggledMealType, setUserToggledMealType] = useState(false);
  const [selectedGoal, setSelectedGoal]     = useState(null);
  const [logging, setLogging]               = useState(false);
  const [lastAnalysis, setLastAnalysis]     = useState(null);
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const [showTemplates, setShowTemplates]   = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [portionSize, setPortionSize] = useState("medium");
  const [showDrinks, setShowDrinks] = useState(true);
  const [drinkLogs, setDrinkLogs] = useState([]);
  const [loggingDrink, setLoggingDrink] = useState(false);
  const [drinkModal, setDrinkModal] = useState(null);
  const [showFoodLookup, setShowFoodLookup] = useState(false);
  const [showCustomDrink, setShowCustomDrink] = useState(false);
  const [weeklyMealLogs, setWeeklyMealLogs] = useState([]);
  const [customDrinkName, setCustomDrinkName] = useState("");
  const [customDrinkMl, setCustomDrinkMl] = useState(250);
  const [customDrinkCals, setCustomDrinkCals] = useState(0);

  const logCustomDrink = async () => {
    if (!customDrinkName.trim()) return;
    setLoggingDrink(true);
    try {
      const newLog = await withTimeout(base44.entities.DrinkLog.create({
        user_id: user.id, day_key: dayKey,
        drink_type: customDrinkName.trim(),
        amount_ml: Number(customDrinkMl) || 250,
        calories: Number(customDrinkCals) || 0,
        logged_at: new Date().toISOString(),
      }), 6000, "save");
      setDrinkLogs(prev => [...prev, newLog]);
      setCustomDrinkName(""); setCustomDrinkMl(250); setCustomDrinkCals(0);
      setShowCustomDrink(false);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save — try again");
    }
    setLoggingDrink(false);
  };

  const hydrationTargetMl = nutritionProfile?.hydration_target_ml || 2000;
  const totalHydration    = hydrationLogs.reduce((sum, l) => sum + (l.amount_ml || 0), 0);
  const hydrationPct      = Math.min(100, Math.round((totalHydration / hydrationTargetMl) * 100));

  useEffect(() => { loadData(); }, [dayKey]);

  const loadData = async () => {
    setLoading(true);
    const [mealLogs, hydration, userTmpl, systemTmpl, ins] = await Promise.all([
      base44.entities.MealLog.filter({ user_id: user.id, day_key: dayKey }),
      base44.entities.HydrationLog.filter({ user_id: user.id, day_key: dayKey }),
      base44.entities.MealTemplates.filter({ user_id: user.id }),
      base44.entities.MealTemplates.filter({ user_id: "system" }).catch(() => []),
      base44.entities.NutritionInsight.filter({ user_id: user.id, day_key: dayKey }),
    ]);
    setMeals(mealLogs.filter(Boolean));
    setHydrationLogs(hydration.filter(Boolean));
    setTemplates([...userTmpl, ...systemTmpl].filter(Boolean));
    setInsights(ins.filter(Boolean));
    const drinkData = await base44.entities.DrinkLog.filter({ user_id: user.id, day_key: dayKey }).catch(() => []);
    setDrinkLogs(drinkData.filter(Boolean));
    // Load weekly meals for chart (last 7 days)
    base44.entities.MealLog.filter({ user_id: user.id }, "-day_key", 200).then(all => {
      const cutoff = format(new Date(Date.now() - 7 * 86400000), "yyyy-MM-dd");
      setWeeklyMealLogs(all.filter(m => m.day_key >= cutoff));
    }).catch(() => {});
    setLoading(false);
  };

  const openDrinkModal = (typeId) => {
    const info = DRINK_TYPES.find(d => d.id === typeId);
    setDrinkModal({ typeId, label: info?.label || typeId, customName: "", size: "medium" });
  };

  const confirmDrink = async () => {
    if (!drinkModal) return;
    setLoggingDrink(true);
    try {
      const sizeInfo = DRINK_SIZES.find(s => s.id === drinkModal.size) || DRINK_SIZES[1];
      const multiplier = drinkModal.size === "small" ? 0.6 : drinkModal.size === "large" ? 1.6 : 1.0;
      const scaledCals = Math.round((DRINK_CALS[drinkModal.typeId] || 0) * multiplier);
      const newLog = await withTimeout(base44.entities.DrinkLog.create({
        user_id: user.id, day_key: dayKey,
        drink_type: drinkModal.typeId,
        amount_ml: sizeInfo.ml,
        calories: scaledCals,
        logged_at: new Date().toISOString(),
      }), 6000, "save");
      setDrinkLogs(prev => [...prev, newLog]);
      if (["water","tea","coffee","juice","smoothie","milk"].includes(drinkModal.typeId)) {
        const newMl = [...drinkLogs, newLog].reduce((s, l) => s + (l.amount_ml || 0), 0);
        if (checkin?.id) withTimeout(base44.entities.DailyCheckins.update(checkin.id, { hydration_glasses: Math.round(newMl / 250) }), 6000, "save").catch(() => {});
      }
      setDrinkModal(null);
    } catch (e) { console.error(e); toast.error("Couldn't save — try again"); }
    setLoggingDrink(false);
  };

  const logMeal = async (text, typeOverride, method = "text") => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLogging(true);

    // One-time migrations on first write per session.
    await runNutritionMigrationsIfNeeded(user, profile).catch(() => {});

    // Meal type: explicit param > user toggle > time-of-day inference.
    const resolvedMealType = typeOverride
      || (userToggledMealType ? mealType : inferMealTypeFromTime());

    // Cycle phase — never fake it.
    const cyclePhaseAtLog = getCyclePhaseOrNull(profile);
    const phaseStatus = getCyclePhaseStatus(profile);
    const isShortInput = trimmed.length <= 8;

    let log;
    try {
      log = await withTimeout(base44.entities.MealLog.create({
        user_id: user.id, day_key: dayKey,
        logged_at: new Date().toISOString(),
        meal_type: resolvedMealType, method, raw_text: trimmed,
        wellness_goal: selectedGoal || undefined,
        portion_size: portionSize,
        cycle_phase_at_log: cyclePhaseAtLog,
      }), 6000, "save");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save — try again");
      setLogging(false);
      return;
    }
    setMeals((prev) => [...prev, log]);
    setMealText("");
    toast.success("Meal logged");

    if (isShortInput) {
      logAppEvent("nutrition_short_input", { len: trimmed.length, meal_log_id: log.id }, user.id);
    }

    if (log.ai_analysis) {
      setLogging(false);
      return;
    }

    try {
      // Gather smart_swaps from user's last 7 meals for dedupe.
      let recentSwaps = [];
      try {
        const recent = await base44.entities.MealLog.filter({ user_id: user.id }, "-created_date", 7);
        recentSwaps = recent
          .flatMap((m) => {
            const a = readAiAnalysis(m);
            const list = (a?.smart_swaps || []);
            if (a?.insight?.smart_swap) list.push(a.insight.smart_swap);
            return list;
          })
          .filter(Boolean)
          .map((s) => String(s).trim().toLowerCase());
      } catch { /* ignore */ }

      const phasePromptAppend = phaseStatus.status === "ok"
        ? ` The user is currently in their ${phaseStatus.phase} phase.`
        : "";

      const response = await withTimeout(base44.functions.invoke("analyzeMeal", {
        raw_text: trimmed,
        energy_level: checkin?.energy,
        digestion_score: checkin?.digestion,
        wellness_goal: selectedGoal || "general wellness",
        prompt_append: phasePromptAppend,
        short_input: isShortInput,
        meal_log_id: log.id,
        cycle_phase: cyclePhaseAtLog,
        excluded_swaps: recentSwaps,
      }), 18000, "analysis");
      const res = response?.data || response;
      if (!res || typeof res !== "object") { setLogging(false); return; }
      // Clean degrade: the function returns analysis_unavailable when its LLM was
      // slow/errored. The meal is already saved — show a tidy note, don't store a
      // misleading all-zero analysis.
      if (res.analysis_unavailable) {
        toast("Meal saved — couldn't estimate calories just now");
        setLogging(false);
        return;
      }
      if (!(res.summary || res.nutritional_summary || res.items)) { setLogging(false); return; }

      // Normalize to new schema: { summary, items, ... }. Prefer res.summary, fall back to nutritional_summary.
      const structured = {
        ...res,
        summary: res.summary || res.nutritional_summary,
      };
      delete structured.nutritional_summary;

      // Zero-fallback: if summary zeros but items have values, recompute.
      const s = structured.summary || {};
      const zeroish = (s.calories || 0) === 0
        && (s.protein_g || 0) === 0
        && (s.carbs_g || 0) === 0
        && (s.fat_g || 0) === 0;
      if (zeroish && (structured.items || []).length > 0) {
        const summed = structured.items.reduce((acc, it) => ({
          calories: acc.calories + (Number(it.calories) || 0),
          protein_g: acc.protein_g + (Number(it.protein_g) || 0),
          carbs_g: acc.carbs_g + (Number(it.carbs_g) || 0),
          fat_g: acc.fat_g + (Number(it.fat_g) || 0),
          fiber_g: acc.fiber_g + (Number(it.fiber_g) || 0),
        }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });
        structured.summary = {
          calories: Math.round(summed.calories),
          protein_g: Math.round(summed.protein_g),
          carbs_g: Math.round(summed.carbs_g),
          fat_g: Math.round(summed.fat_g),
          fiber_g: Math.round(summed.fiber_g),
        };
        logAppEvent("nutrition_summary_fallback", { meal_log_id: log.id }, user.id);
      }

      // Smart-swap dedupe.
      if (Array.isArray(structured.smart_swaps)) {
        structured.smart_swaps = structured.smart_swaps.filter(
          (sw) => sw && !recentSwaps.includes(String(sw).trim().toLowerCase())
        );
      }
      if (structured.insight?.smart_swap
          && recentSwaps.includes(String(structured.insight.smart_swap).trim().toLowerCase())) {
        structured.insight = { ...structured.insight, smart_swap: null };
      }

      // Normalize meal_score to 1–10 on write. If AI returned a sub-object like
      // { protein, veg_fiber, balance } (0–5 each), average * 2 → 1–10.
      let overallScore = null;
      if (typeof structured.meal_score === "number") {
        overallScore = structured.meal_score <= 5
          ? Math.min(10, Math.round(structured.meal_score * 2))
          : Math.round(structured.meal_score);
      } else if (structured.meal_score && typeof structured.meal_score === "object") {
        const vals = ["protein", "veg_fiber", "balance"]
          .map((k) => Number(structured.meal_score[k]))
          .filter((n) => Number.isFinite(n));
        if (vals.length) {
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          overallScore = Math.min(10, Math.max(1, Math.round(avg * 2)));
        }
      }

      // Disclaimer throttle: keep tone_safety_note at most once per 7-day window.
      const lastShown = profile?.last_disclaimer_shown_at
        ? new Date(profile.last_disclaimer_shown_at).getTime()
        : 0;
      const withinWindow = lastShown && (Date.now() - lastShown) < DISCLAIMER_THROTTLE_MS;
      if (withinWindow) {
        if (structured.tone_safety_note) structured.tone_safety_note = null;
        if (structured.insight?.tone_safety_note) {
          structured.insight = { ...structured.insight, tone_safety_note: null };
        }
      } else if (structured.tone_safety_note || structured.insight?.tone_safety_note) {
        // Mark shown.
        if (profile?.id) {
          withTimeout(
            base44.entities.UserProfile.update(profile.id, { last_disclaimer_shown_at: new Date().toISOString() }),
            6000, "save"
          ).catch(() => {});
        }
      }

      setLastAnalysis(structured);
      setShowQuickCheck(true);

      const updatePayload = { ai_analysis: structured };
      if (overallScore != null) updatePayload.meal_score = overallScore;

      await withTimeout(base44.entities.MealLog.update(log.id, updatePayload), 6000, "save");
      setMeals((prev) => prev.map((m) => m.id === log.id ? { ...m, ...updatePayload } : m));

      if (structured.insight) {
        const { headline, wellness_impact, action_items, smart_swap, confidence, tone_safety_note } = structured.insight;
        const saved = await withTimeout(base44.entities.NutritionInsight.create({
          user_id: user.id, meal_log_id: log.id, day_key: dayKey,
          meal_description: trimmed, wellness_goal: selectedGoal || "general wellness",
          headline, wellness_impact, action_items, smart_swap,
          confidence: confidence || "medium", tone_safety_note, user_feedback: "none",
        }), 6000, "save");
        setInsights((prev) => [...prev, saved]);
      }
    } catch (_) {
      // Meal is already saved; analysis/insight enrichment failed or timed out.
      // The meal stays in the timeline — just surface that insights are unavailable.
      toast.error("Meal saved, but insights couldn't load");
    }
    setLogging(false);
  };

  const handleInsightFeedback = async (insight, feedback) => {
    const prevFeedback = insight.user_feedback;
    // Optimistic update, with rollback on failure.
    setInsights((prev) => prev.map((i) => i.id === insight.id ? { ...i, user_feedback: feedback } : i));
    try {
      await withTimeout(base44.entities.NutritionInsight.update(insight.id, { user_feedback: feedback }), 6000, "save");
    } catch (e) {
      console.error(e);
      setInsights((prev) => prev.map((i) => i.id === insight.id ? { ...i, user_feedback: prevFeedback } : i));
      toast.error("Couldn't save — try again");
    }
  };

  const repeatLast = () => {
    const last = [...meals].reverse().find((m) => m.raw_text);
    if (last) {
      setMealText(last.raw_text);
      setMealType(last.meal_type);
      setUserToggledMealType(true);
    }
  };

  const saveAsTemplate = async () => {
    if (!mealText.trim()) return;
    setSavingTemplate(true);
    try {
      await withTimeout(base44.entities.MealTemplates.create({ user_id: user.id, title: mealText.trim(), default_meal_type: mealType }), 6000, "save");
      setTemplates(await base44.entities.MealTemplates.filter({ user_id: user.id }));
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save — try again");
    }
    setSavingTemplate(false);
  };

  const logWater = async (ml) => {
    let log;
    try {
      log = await withTimeout(base44.entities.HydrationLog.create({ user_id: user.id, day_key: dayKey, amount_ml: ml, logged_at: new Date().toISOString() }), 6000, "save");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save — try again");
      return;
    }
    setHydrationLogs((prev) => [...prev, log]);
    const totalGlasses = Math.round((totalHydration + ml) / 250);
    if (checkin?.id) withTimeout(base44.entities.DailyCheckins.update(checkin.id, { hydration_glasses: totalGlasses }), 6000, "save").catch(() => {});
  };

  const deleteMeal = async (id) => {
    // Optimistic removal, with rollback on failure.
    const removed = meals.find((m) => m.id === id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
    try {
      await withTimeout(base44.entities.MealLog.delete(id), 6000, "delete");
      toast.success("Meal removed");
    } catch (e) {
      console.error(e);
      if (removed) setMeals((prev) => [...prev, removed]);
      toast.error("Couldn't remove — try again");
    }
  };

  const mealsByType = MEAL_TYPES.reduce((acc, t) => {
    acc[t] = meals.filter((m) => m.meal_type === t);
    return acc;
  }, {});

  const balancedScore   = meals.length > 0 ? Math.min(5, Math.round((meals.filter(m => readAiAnalysis(m)).length / meals.length) * 5)) : 0;
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
  const mealsWithCalories = meals.filter(m => (getMealSummary(m).summary?.calories || 0) > 0);
  const totalCalories = meals.reduce((sum, m) => {
    const s = getMealSummary(m).summary;
    const multiplier = PORTION_MULTIPLIERS[m.portion_size] || 1.0;
    return sum + Math.round((s?.calories || 0) * multiplier);
  }, 0);
  const totalProtein = mealsWithCalories.reduce((sum, m) => sum + (getMealSummary(m).summary?.protein_g || 0), 0);
  const totalCarbs = mealsWithCalories.reduce((sum, m) => sum + (getMealSummary(m).summary?.carbs_g || 0), 0);
  const totalFat = mealsWithCalories.reduce((sum, m) => sum + (getMealSummary(m).summary?.fat_g || 0), 0);
  const totalDrinkCalories = drinkLogs.reduce((sum, d) => sum + (d.calories || 0), 0);
  const grandTotalCalories = totalCalories + totalDrinkCalories;
  const caloriePct = Math.min(100, Math.round((grandTotalCalories / calorieTarget) * 100));

  return (
    <div>
    {/* Drink modal */}
    {drinkModal && (
      <>
        <div onClick={() => setDrinkModal(null)} style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(42,32,53,0.45)", backdropFilter: "blur(6px)" }} />
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 61, backgroundColor: "var(--surface)", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: "var(--plum)", marginBottom: 20 }}>Log {drinkModal.label}</p>
          {CUSTOM_NAME_META[drinkModal.typeId] && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", marginBottom: 6 }}>{CUSTOM_NAME_META[drinkModal.typeId].label}</p>
              <input
                type="text"
                value={drinkModal.customName}
                onChange={e => setDrinkModal(prev => ({ ...prev, customName: e.target.value }))}
                placeholder={CUSTOM_NAME_META[drinkModal.typeId].placeholder}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>
          )}
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Size</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {DRINK_SIZES.map(sz => (
              <button key={sz.id} onClick={() => setDrinkModal(prev => ({ ...prev, size: sz.id }))}
                style={{ flex: 1, padding: "10px 0", borderRadius: 14, cursor: "pointer", border: `1.5px solid ${drinkModal.size === sz.id ? "var(--plum)" : "var(--border)"}`, backgroundColor: drinkModal.size === sz.id ? "var(--plum)" : "var(--ivory)", color: drinkModal.size === sz.id ? "white" : "var(--mauve)", }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{sz.label}</p>
                <p style={{ fontSize: 10, margin: 0, opacity: 0.7 }}>{sz.ml}ml</p>
              </button>
            ))}
          </div>
          <button onClick={confirmDrink} disabled={loggingDrink}
            style={{ width: "100%", height: 52, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, opacity: loggingDrink ? 0.6 : 1 }}>
            {loggingDrink ? "Logging..." : "Log drink"}
          </button>
        </div>
      </>
    )}
    <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start">
      <div className="space-y-4">

        {/* Calorie summary bar */}
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--plum)", }}>Today's nutrition</p>
            <p style={{ fontSize: 13, color: "var(--mauve)", }}>
              {grandTotalCalories > 0 ? `${Math.max(0, calorieTarget - grandTotalCalories)} remaining of ${calorieTarget}` : `Target: ${calorieTarget} kcal`}
            </p>
          </div>
          <div style={{ height: 8, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${caloriePct}%`, backgroundColor: grandTotalCalories > calorieTarget ? "var(--rose-dust)" : "var(--sage)", borderRadius: 9999, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Calories", value: `${grandTotalCalories}` },
              { label: "Protein", value: `${Math.round(totalProtein)}g` },
              { label: "Carbs", value: `${Math.round(totalCarbs)}g` },
              { label: "Fat", value: `${Math.round(totalFat)}g` },
            ].map(chip => (
              <div key={chip.label} style={{ flex: 1, backgroundColor: "var(--ivory)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 4px", textAlign: "center" }}>
                <p style={{ fontSize: 10, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{chip.label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", }}>{chip.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly calories chart with phase tip */}
        <WeeklyCaloriesChart allMealLogs={weeklyMealLogs} profile={profile} />

        {/* Cycle wellness context */}
        {cycleWellnessTip && (
          <div className="rounded-[20px] px-4 py-3 mb-0" style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "var(--rose-dust)", }}>
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
          {showFoodLookup && (
            <FoodLookup
              onClose={() => setShowFoodLookup(false)}
              onSelect={({ text, description }) => {
                setMealText(prev => prev ? `${prev}, ${text}` : text);
                setShowFoodLookup(false);
              }}
            />
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={sLabel}>Log a Meal</p>
            <button onClick={() => setShowFoodLookup(true)}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 9999, padding: "4px 10px", cursor: "pointer", }}>
              <BookOpen style={{ width: 11, height: 11 }} /> Food library
            </button>
          </div>
          <textarea
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            placeholder="What did you eat? Describe naturally…"
            rows={2}
            className="w-full p-4 rounded-2xl text-sm resize-none focus:outline-none transition-all"
            style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", lineHeight: 1.6 }}
            onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />

          {/* Meal type — user toggle always wins over time-of-day inference */}
          <div className="flex gap-1.5 mt-3 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {MEAL_TYPES.map((t) => {
              const effective = userToggledMealType ? mealType : inferMealTypeFromTime();
              const isActive = effective === t;
              return (
                <button key={t}
                  aria-label={`Select ${t}`}
                  aria-pressed={isActive}
                  onClick={() => { setMealType(t); setUserToggledMealType(true); }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: isActive ? "var(--plum)" : "var(--ivory)",
                    color: isActive ? "white" : "var(--mauve)",
                    border: `1px solid ${isActive ? "var(--plum)" : "var(--border)"}`,
                    }}>
                  {MEAL_LABELS[t]}
                </button>
              );
            })}
          </div>

          {/* Portion size */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {PORTION_LABELS.map((p) => (
              <button key={p.id} onClick={() => setPortionSize(p.id)} style={{
                flex: 1, padding: "7px 0", borderRadius: 12, fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
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
            style={{ color: selectedGoal ? "var(--rose-dust)" : "var(--mauve)", }}>
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
                  style={{ color: "var(--plum)", borderBottom: "1px solid var(--border-subtle)", }}
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

        {/* Drinks logger */}
        <div className="rounded-[24px] p-5" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showDrinks ? 14 : 0 }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>Drinks</p>
            <button
              onClick={() => setShowDrinks(!showDrinks)}
              style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", background: "none", border: "none", cursor: "pointer" }}
            >
              {showDrinks ? "Close" : "Log drink"}
            </button>
          </div>
          {showDrinks && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {DRINK_TYPES.map((d) => {
                const cals = DRINK_CALS[d.id];
                const bg = d.id === "soft_drink" ? "rgba(168,137,63,0.10)" : d.id === "alcohol" ? "rgba(196,132,154,0.10)" : "var(--ivory)";
                return (
                  <button
                    key={d.id}
                    onClick={() => openDrinkModal(d.id)}
                    disabled={loggingDrink}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 14px", borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: bg, cursor: "pointer", opacity: loggingDrink ? 0.5 : 1 }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", }}>{d.label}</span>
                    {cals > 0 && <span style={{ fontSize: 10, color: "var(--mauve)", }}>~{cals} kcal</span>}
                  </button>
                );
              })}
              <button
                onClick={() => setShowCustomDrink(v => !v)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 14px", borderRadius: 9999, border: "1px solid var(--rose-dust-light)", backgroundColor: "var(--rose-dust-subtle)", cursor: "pointer" }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", }}>+ Custom</span>
              </button>
            </div>
          )}
          {showDrinks && showCustomDrink && (
            <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: 12, border: "1px solid var(--border)", marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", marginBottom: 8 }}>Custom drink</p>
              <input value={customDrinkName} onChange={e => setCustomDrinkName(e.target.value)} placeholder="e.g. matcha latte"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--plum)", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 8 }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, color: "var(--mauve)", marginBottom: 4 }}>Size (ml)</p>
                  <input type="number" value={customDrinkMl} onChange={e => setCustomDrinkMl(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--plum)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 10, color: "var(--mauve)", marginBottom: 4 }}>Calories</p>
                  <input type="number" value={customDrinkCals} onChange={e => setCustomDrinkCals(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--plum)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <button onClick={logCustomDrink} disabled={!customDrinkName.trim() || loggingDrink}
                style={{ width: "100%", padding: "9px", borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: !customDrinkName.trim() ? 0.5 : 1 }}>
                {loggingDrink ? "Logging..." : "Log drink"}
              </button>
            </div>
          )}
          {drinkLogs.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--mauve)", marginTop: showDrinks ? 0 : 10 }}>No drinks logged today.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: showDrinks ? 0 : 10 }}>
              {drinkLogs.filter(Boolean).map((log, i) => {
                const info = DRINK_TYPES.find((d) => d.id === log.drink_type);
                return (
                  <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "var(--plum)", backgroundColor: "var(--ivory-dark)", borderRadius: 9999, padding: "4px 10px", }}>
                    {info?.label || log.drink_type}{log.calories > 0 ? ` · ${log.calories} kcal` : ""}
                  </span>
                );
              })}
            </div>
          )}
          {totalDrinkCalories > 0 && (
            <p style={{ fontSize: 11, color: "var(--mauve)", marginTop: 8 }}>{totalDrinkCalories} kcal from drinks today</p>
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
                  const analysis    = readAiAnalysis(meal);
                  const { summary: analysisSummary } = getMealSummary(meal);
                  const mealInsight = insights.find((ins) => ins.meal_log_id === meal.id);
                  const overallScore = typeof meal.meal_score === "number" ? meal.meal_score : null;
                  return (
                    <div key={meal.id} className="rounded-2xl p-4" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug" style={{ color: "var(--plum)", }}>{meal.raw_text}</p>
                          {meal.portion_size && meal.portion_size !== "medium" && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", backgroundColor: "var(--ivory-dark)",
                              borderRadius: 20, padding: "2px 8px", marginLeft: 4, }}>
                              {meal.portion_size.charAt(0).toUpperCase() + meal.portion_size.slice(1)}
                            </span>
                          )}
                          {meal.wellness_goal && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1.5 mr-1 font-semibold"
                              style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
                              {WELLNESS_GOALS.find(g => g.id === meal.wellness_goal)?.label}
                            </span>
                          )}
                          {(overallScore != null || (analysis?.meal_score && typeof analysis.meal_score === "object")) && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {overallScore != null && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
                                  Meal score {overallScore}/10
                                </span>
                              )}
                              {analysis?.meal_score && typeof analysis.meal_score === "object" && (
                                <>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(168,137,63,0.12)", color: "var(--gold)" }}>
                                    Protein {Math.min(10, Math.round((analysis.meal_score.protein || 0) * 2))}/10
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }}>
                                    Fibre {Math.min(10, Math.round((analysis.meal_score.veg_fiber || 0) * 2))}/10
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)" }}>
                                    Balance {Math.min(10, Math.round((analysis.meal_score.balance || 0) * 2))}/10
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                          {/* Items list */}
                          {analysis?.items?.length > 0 && (
                            <p className="text-[11px] mt-1.5" style={{ color: "var(--mauve)", }}>
                              {analysis.items.slice(0, 5).map(it => `${it.name}${it.calories ? ` ${it.calories}kcal` : ""}`).join(" · ")}
                            </p>
                          )}
                          {/* Insight headline */}
                          {analysis?.insight?.headline && (
                            <p className="text-[11px] mt-1.5 italic" style={{ color: "var(--sage)", }}>
                              {analysis.insight.headline}
                            </p>
                          )}
                          <p className="text-[10px] mt-1.5" style={{ color: "var(--mauve)" }}>
                            {meal.logged_at ? format(new Date(meal.logged_at), "HH:mm") : ""}
                          </p>
                          {analysisSummary?.calories > 0 && (
                            <span style={{ backgroundColor: "var(--ivory-dark)", borderRadius: "9999px", padding: "2px 8px", fontSize: "11px", fontWeight: 600, color: "var(--mauve)", marginTop: "4px", display: "inline-block", }}>
                              ~{analysisSummary.calories} kcal
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
                        <div className="mt-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: "rgba(122,158,142,0.12)", border: "1px solid rgba(122,158,142,0.3)" }}>
                          <p className="text-[11px] leading-relaxed" style={{ color: "var(--sage)" }}>{mealInsight.wellness_impact}</p>
                          {mealInsight.action_items && (
                            <p className="text-[10px] mt-1" style={{ color: "var(--sage)" }}>
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

        {/* Log another meal FAB */}
        {!loading && meals.length > 0 && (
          <button
            onClick={() => { document.querySelector('textarea')?.scrollIntoView({ behavior: 'smooth' }); document.querySelector('textarea')?.focus(); }}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 18px", borderRadius: 16, backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", cursor: "pointer", }}
          >
            <Plus style={{ width: 16, height: 16, color: "var(--rose-dust)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rose-dust)" }}>Log another meal</span>
          </button>
        )}

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
              <p className="text-sm font-semibold" style={{ color: "var(--plum)", }}>
                {totalHydration}ml
                <span className="text-xs font-normal ml-1" style={{ color: "var(--mauve)" }}>/ {hydrationTargetMl}ml</span>
              </p>
            </div>
            <span className="text-sm font-bold" style={{ color: hydrationPct >= 100 ? "var(--sage)" : "var(--mauve)" }}>{hydrationPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: "var(--sage-subtle)" }}>
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }} animate={{ width: `${hydrationPct}%` }} transition={{ duration: 0.5 }}
              style={{ backgroundColor: "var(--sage)" }} />
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
        <MacroDashboard meals={meals} hydrationLogs={hydrationLogs} nutritionProfile={nutritionProfile} drinkLogs={drinkLogs} />
      </div>
    </div>
    </div>
  );
}
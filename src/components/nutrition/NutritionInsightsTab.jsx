import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, parseISO } from "date-fns";
import ReactMarkdown from "react-markdown";
import NutritionTrendDashboard from "./NutritionTrendDashboard";
import AiDisclaimer from "@/components/compliance/AiDisclaimer";

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", };

function RuleInsight({ logs, checkins }) {
  const insights  = [];
  const todayKey  = format(new Date(), "yyyy-MM-dd");
  const todayHydration = logs.hydration?.filter(h => h.day_key === todayKey).reduce((s, h) => s + (h.amount_ml || 0), 0) || 0;
  const todayCheckin   = checkins?.find(c => c.date === todayKey);

  if (todayHydration < 1000) {
    insights.push({ text: "You might notice lower energy when hydration is low. Consider aiming for at least 6–8 glasses today." });
  }
  if (todayCheckin?.stress >= 4) {
    insights.push({ text: "Higher stress days may increase cravings. A short breathwork session and a protein-rich snack may help stabilise blood sugar." });
  }
  if (todayCheckin?.digestion <= 2) {
    insights.push({ text: "On days when digestion feels off, try warm foods, ginger tea, or a gentle post-meal walk." });
  }
  if (todayCheckin?.energy <= 2 && todayHydration < 500) {
    insights.push({ text: "Low energy combined with low hydration early in the day — start with a large glass of water and a light protein snack." });
  }
  if (insights.length === 0) {
    insights.push({ text: "Things are looking balanced today. Keep logging to unlock personalised patterns over time." });
  }

  return (
    <div className="rounded-[24px] p-5" style={card}>
      <p style={sLabel} className="mb-4">Today's Signals</p>
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <div key={i} className="flex gap-3 rounded-2xl p-4"
            style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: "var(--rose-dust)" }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--plum)", }}>{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SavedInsightCard({ insight, onFeedback }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {insight.headline && (
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--plum)", }}>
              {insight.headline}
            </p>
          )}
          <p className="text-xs truncate" style={{ color: "var(--mauve)" }}>{insight.meal_description}</p>
          {insight.wellness_goal && (
            <span className="text-[10px] px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold"
              style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
              {insight.wellness_goal}
            </span>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 mt-1" style={{ color: "var(--mauve)" }}>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2.5">
          {insight.wellness_impact && (
            <p className="text-xs leading-relaxed" style={{ color: "var(--plum)" }}>{insight.wellness_impact}</p>
          )}
          {insight.action_items && (
            <p className="text-xs" style={{ color: "var(--mauve)" }}>
              <span className="font-medium" style={{ color: "var(--plum)" }}>Next: </span>{insight.action_items}
            </p>
          )}
          {insight.smart_swap && (
            <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#FFF8EE", border: "1px solid #F5DFA8" }}>
              <p className="text-xs" style={{ color: "#7A5A20" }}>
                <span className="font-semibold">Smart swap: </span>{insight.smart_swap}
              </p>
            </div>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium inline-block"
            style={{
              backgroundColor: insight.confidence === "high" ? "var(--sage-subtle)" : insight.confidence === "medium" ? "#FFF8EE" : "var(--ivory)",
              color: insight.confidence === "high" ? "var(--sage)" : insight.confidence === "medium" ? "#A07830" : "var(--mauve)",
            }}>
            {insight.confidence} confidence
          </span>
          {insight.tone_safety_note && (
            <p className="text-[10px] italic" style={{ color: "var(--mauve)" }}>{insight.tone_safety_note}</p>
          )}
          {insight.user_feedback === "none" ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px]" style={{ color: "var(--mauve)" }}>Helpful?</span>
              <button onClick={() => onFeedback(insight, "positive")}
                className="text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
                style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }}>
                Yes
              </button>
              <button onClick={() => onFeedback(insight, "negative")}
                className="text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
                style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
                Not really
              </button>
            </div>
          ) : (
            <p className="text-[10px]" style={{ color: "var(--mauve)" }}>
              {insight.user_feedback === "positive" ? "Marked as helpful" : "Noted"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FoodSkinCorrelation({ mealLogs, checkins }) {
  const pairedDays = checkins.filter(c =>
    c.skin_condition &&
    mealLogs.some(m => m.day_key === c.date)
  );

  if (pairedDays.length < 5) return null;

  const CLEAR_CONDITIONS    = ["Clear", "Glowing", "Normal"];
  const REACTIVE_CONDITIONS = ["Mild breakout", "Moderate breakout", "Very oily", "Very dry"];

  const clearDays    = pairedDays.filter(c => CLEAR_CONDITIONS.includes(c.skin_condition));
  const reactiveDays = pairedDays.filter(c => REACTIVE_CONDITIONS.includes(c.skin_condition));

  if (clearDays.length < 2 && reactiveDays.length < 2) return null;

  const getMealWords = (days) => {
    return days.flatMap(c =>
      mealLogs
        .filter(m => m.day_key === c.date)
        .map(m => (m.raw_text || "").toLowerCase())
    ).join(" ");
  };

  const WATCHLIST = [
    { label: "dairy",     terms: ["milk", "cheese", "yogurt", "yoghurt", "cream", "butter", "whey", "latte", "cappuccino"] },
    { label: "sugar",     terms: ["sugar", "sweets", "chocolate", "biscuit", "cake", "ice cream", "fizzy", "soda", "cola"] },
    { label: "gluten",    terms: ["bread", "pasta", "wheat", "flour", "bagel", "toast", "croissant", "noodles"] },
    { label: "processed", terms: ["crisps", "chips", "takeaway", "fast food", "fried", "nuggets", "pizza"] },
  ];

  const clearText    = getMealWords(clearDays);
  const reactiveText = getMealWords(reactiveDays);

  const findings = WATCHLIST
    .map(({ label, terms }) => {
      const inClear    = terms.filter(t => clearText.includes(t)).length;
      const inReactive = terms.filter(t => reactiveText.includes(t)).length;
      const clearRate    = clearDays.length    ? inClear    / clearDays.length    : 0;
      const reactiveRate = reactiveDays.length ? inReactive / reactiveDays.length : 0;
      return { label, clearRate, reactiveRate, diff: reactiveRate - clearRate };
    })
    .filter(f => f.diff > 0.1)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 2);

  if (findings.length === 0) return null;

  return (
    <div className="rounded-[24px] p-5" style={card}>
      <p style={sLabel} className="mb-1">Food & Skin Patterns</p>
      <p style={{ fontSize: "12px", color: "var(--mauve)", marginBottom: "14px" }}>
        Based on {pairedDays.length} days where both food and skin were logged
      </p>
      <div className="space-y-3">
        {findings.map(f => (
          <div key={f.label}
               className="rounded-2xl p-4 flex gap-3 items-start"
               style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                 style={{ backgroundColor: "var(--rose-dust)" }} />
            <p style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--plum)", }}>
              <strong>{f.label.charAt(0).toUpperCase() + f.label.slice(1)}</strong>
              {" "}appeared more often on days when your skin was reactive
              than on clearer days. This is a personal pattern in your
              data — not a diagnosis.
            </p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "10px", color: "var(--mauve)", marginTop: "12px", fontStyle: "italic" }}>
        Pattern is based on keyword matching in your logged meals.
        Log more days for stronger signals.
      </p>
    </div>
  );
}

export default function NutritionInsightsTab({ user, profile }) {
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [weekError, setWeekError]   = useState(null);
  const [weekInsight, setWeekInsight] = useState(null);
  const [mealLogs, setMealLogs]     = useState([]);
  const [hydrationLogs, setHydrationLogs] = useState([]);
  const [checkins, setCheckins]     = useState([]);
  const [savedInsights, setSavedInsights] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const since = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const [ml, hl, ci, ins] = await Promise.all([
      base44.entities.MealLog.filter({ user_id: user.id }),
      base44.entities.HydrationLog.filter({ user_id: user.id }),
      base44.entities.DailyCheckins.filter({ user_id: user.id }),
      base44.entities.NutritionInsight.filter({ user_id: user.id }),
    ]);
    setMealLogs(ml.filter(x => x.day_key >= since));
    setHydrationLogs(hl.filter(x => x.day_key >= since));
    setCheckins(ci.filter(x => x.date >= since));
    setSavedInsights(ins.filter(x => x.day_key >= since).sort((a, b) => b.day_key?.localeCompare(a.day_key)));
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const saved = await base44.entities.WeeklyInsights.filter({ user_id: user.id, week_start: weekStart });
    if (saved[0]) setWeekInsight(saved[0]);
    setLoading(false);
  };

  const handleInsightFeedback = async (insight, feedback) => {
    await base44.entities.NutritionInsight.update(insight.id, { user_feedback: feedback });
    setSavedInsights(prev => prev.map(i => i.id === insight.id ? { ...i, user_feedback: feedback } : i));
  };

  const generateWeekInsight = async () => {
    setGenerating(true);
    setWeekError(null);
    const weekStart    = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekStartKey = format(weekStart, "yyyy-MM-dd");
    const weekEndKey   = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const weekMeals    = mealLogs.filter(m => m.day_key >= weekStartKey && m.day_key <= weekEndKey);
    const weekHydration = hydrationLogs.filter(h => h.day_key >= weekStartKey && h.day_key <= weekEndKey);
    const weekCheckins  = checkins.filter(c => c.date >= weekStartKey && c.date <= weekEndKey);
    const avgHydration  = weekHydration.length > 0 ? Math.round(weekHydration.reduce((s, h) => s + (h.amount_ml || 0), 0) / 7) : 0;
    const avgEnergy     = weekCheckins.length > 0 ? (weekCheckins.reduce((s, c) => s + (c.energy || 0), 0) / weekCheckins.length).toFixed(1) : "unknown";
    const avgMood       = weekCheckins.length > 0 ? (weekCheckins.reduce((s, c) => s + (c.mood || 0), 0) / weekCheckins.length).toFixed(1) : "unknown";

    const prompt = `You are a warm, supportive wellness nutrition coach.
Write a short weekly nutrition summary (200 words max) based on this data:

Week: ${weekStartKey} to ${weekEndKey}
Meals logged: ${weekMeals.length}
Average daily hydration: ${avgHydration}ml
Average energy (1-10): ${avgEnergy}
Average mood (1-10): ${avgMood}
Recent meals: ${weekMeals.slice(-5).map(m => m.raw_text).join("; ") || "not available"}
Wellness goals this week: ${[...new Set(weekMeals.map(m => m.wellness_goal).filter(Boolean))].join(", ") || "not set"}

Guidelines:
- Use supportive, non-diagnostic language ("you might notice", "may support", "consider")
- Identify 2–3 patterns (positive and areas to explore)
- Give 1 small, achievable experiment for next week
- Never mention weight or calories unless mentioned by user
- Keep it warm, not clinical`;

    try {
      const res     = await base44.integrations.Core.InvokeLLM({ prompt });
      const insight = await base44.entities.WeeklyInsights.create({
        user_id: user.id, week_start: weekStartKey, week_end: weekEndKey,
        insight_text: res, generated_at: new Date().toISOString(),
      });
      setWeekInsight(insight);
    } catch (e) {
      console.error(e);
      setWeekError("Couldn't generate your summary just now. Please try again.");
    }
    setGenerating(false);
  };

  const goalCounts = mealLogs.filter(m => m.wellness_goal).reduce((acc, m) => {
    acc[m.wellness_goal] = (acc[m.wellness_goal] || 0) + 1;
    return acc;
  }, {});
  const topGoal = Object.entries(goalCounts).sort((a, b) => b[1] - a[1])[0];

  const trendDays = Array.from({ length: 7 }, (_, index) => {
    const date = subDays(new Date(), 6 - index);
    const dayKey = format(date, "yyyy-MM-dd");
    const dayMeals = mealLogs.filter(log => log.day_key === dayKey);
    const dayHydration = hydrationLogs.filter(log => log.day_key === dayKey);
    const calories = dayMeals.reduce((sum, meal) => {
      try {
        if (!meal.ai_analysis) return sum;
        const a = typeof meal.ai_analysis === 'string' ? JSON.parse(meal.ai_analysis) : meal.ai_analysis;
        const mult = meal.portion_size === "small" ? 0.7 : meal.portion_size === "large" ? 1.4 : 1.0;
        // New-shape meals store macros under `summary`; legacy rows under `nutritional_summary`.
        // Normalize so both shapes count (matches getMealSummary() in nutritionAiAnalysis).
        const summary = a.summary || a.nutritional_summary;
        if (summary?.calories) return sum + Math.round(summary.calories * mult);
        return sum + Math.round((a.items || []).reduce((s, item) => s + (item.calories || item.estimated_calories || 0), 0) * mult);
      } catch { return sum; }
    }, 0);
    return {
      dayKey,
      label: format(date, "EEE"),
      hydration: dayHydration.reduce((sum, log) => sum + Number(log.amount_ml || log.total_ml || 0), 0),
      calories,
      meals: dayMeals.length,
    };
  });

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="space-y-4">
      <NutritionTrendDashboard days={trendDays} />
      <RuleInsight logs={{ hydration: hydrationLogs }} checkins={checkins} />

      {/* Top goal pattern */}
      {topGoal && (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-3">Your Top Focus</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--plum)", }}>
            You've been focusing most on{" "}
            <span className="font-semibold" style={{ color: "var(--rose-dust)" }}>{topGoal[0]}</span>
            {" "}({topGoal[1]} meal{topGoal[1] !== 1 ? "s" : ""} tagged). Consistency with a clear intention can help you notice patterns over time.
          </p>
        </div>
      )}

      {/* Saved meal insights */}
      {savedInsights.length > 0 && (
        <div className="rounded-[24px] p-5" style={card}>
          <p style={sLabel} className="mb-4">Meal Insights — Last 30 Days</p>
          <div className="space-y-2.5">
            {savedInsights.slice(0, 10).map((ins) => (
              <SavedInsightCard key={ins.id} insight={ins} onFeedback={handleInsightFeedback} />
            ))}
          </div>
        </div>
      )}

      {/* Weekly AI summary */}
      <div className="rounded-[24px] p-5" style={card}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p style={sLabel}>Weekly Summary</p>
          </div>
          <button onClick={generateWeekInsight} disabled={generating}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
            style={{ color: "var(--rose-dust)" }}>
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {weekInsight ? "Refresh" : "Generate"}
          </button>
        </div>
        {generating && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--rose-dust-light)" }} />
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Generating your personalised summary…</p>
          </div>
        )}
        {weekInsight && !generating && (
          <>
            <ReactMarkdown className="text-xs leading-relaxed prose prose-sm max-w-none"
              components={{
                p: ({ children }) => <p className="my-1.5" style={{ color: "var(--plum)", }}>{children}</p>,
                strong: ({ children }) => <strong style={{ color: "var(--plum)", fontWeight: 600 }}>{children}</strong>,
              }}>
              {weekInsight.insight_text}
            </ReactMarkdown>
            {/* Sprint C C1 — MHRA disclaimer on AI-generated weekly summary. */}
            <AiDisclaimer />
          </>
        )}
        {!weekInsight && !generating && !weekError && (
          <p className="text-xs" style={{ color: "var(--mauve)" }}>
            Tap "Generate" for your personalised weekly nutrition summary.
          </p>
        )}
        {weekError && !generating && (
          <p className="text-xs text-center rounded-xl p-2.5" style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
            {weekError}
          </p>
        )}
      </div>

      <FoodSkinCorrelation mealLogs={mealLogs} checkins={checkins} />

      {/* Best day */}
      {checkins.length > 0 && (() => {
        const best = [...checkins].sort((a, b) => ((b.energy || 0) + (b.mood || 0)) - ((a.energy || 0) + (a.mood || 0)))[0];
        if (!best) return null;
        const bestDayMeals = mealLogs.filter(m => m.day_key === best.date);
        return (
          <div className="rounded-[24px] p-5" style={card}>
            <p style={sLabel} className="mb-3">Your Best Day This Month</p>
            <p className="text-xs font-medium mb-3" style={{ color: "var(--plum)" }}>
              {format(parseISO(best.date), "EEEE, MMMM d")}
            </p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {best.energy && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: "#FFF8EE", color: "#A07830" }}>
                  Energy {best.energy}/10
                </span>
              )}
              {best.mood && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
                  Mood {best.mood}/10
                </span>
              )}
            </div>
            {bestDayMeals.length > 0 && (
              <p className="text-xs leading-relaxed" style={{ color: "var(--mauve)" }}>
                Meals that day: <span className="font-medium" style={{ color: "var(--plum)" }}>
                  {bestDayMeals.map(m => m.raw_text).join(" · ")}
                </span>
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
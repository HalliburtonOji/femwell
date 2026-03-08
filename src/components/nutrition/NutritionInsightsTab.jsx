import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, parseISO } from "date-fns";
import ReactMarkdown from "react-markdown";

function RuleInsight({ logs, checkins }) {
  const insights = [];
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayHydration = logs.hydration?.filter((h) => h.day_key === todayKey).reduce((s, h) => s + (h.amount_ml || 0), 0) || 0;
  const todayCheckin = checkins?.find((c) => c.date === todayKey);

  if (todayHydration < 1000) {
    insights.push({ emoji: "💧", text: "You might notice lower energy when hydration is low. Consider aiming for at least 6–8 glasses today." });
  }
  if (todayCheckin?.stress >= 4) {
    insights.push({ emoji: "🧘", text: "Higher stress days may increase cravings. A short breathwork session and a protein-rich snack may help stabilise your blood sugar." });
  }
  if (todayCheckin?.digestion <= 2) {
    insights.push({ emoji: "🥦", text: "On days when digestion feels off, try warm foods, ginger tea, or a gentle post-meal walk." });
  }
  if (todayCheckin?.energy <= 2 && todayHydration < 500) {
    insights.push({ emoji: "⚡", text: "Low energy + low water early in the day — start with a large glass of water and a light protein snack." });
  }
  if (insights.length === 0) {
    insights.push({ emoji: "✨", text: "Things are looking balanced today. Keep logging to unlock personalised patterns over time." });
  }

  return (
    <div className="card-glass rounded-2xl p-4 space-y-3">
      <p className="text-sm font-bold text-gray-800">📍 Today's Signals</p>
      {insights.map((ins, i) => (
        <div key={i} className="flex gap-3 bg-white/60 rounded-xl p-3">
          <span className="text-lg flex-shrink-0">{ins.emoji}</span>
          <p className="text-xs text-gray-600 leading-relaxed">{ins.text}</p>
        </div>
      ))}
    </div>
  );
}

function SavedInsightCard({ insight, onFeedback }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white/60 rounded-xl p-3 border border-emerald-50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {insight.headline && <p className="text-xs font-bold text-emerald-700 mb-1">✨ {insight.headline}</p>}
          <p className="text-xs text-gray-700 font-medium truncate">{insight.meal_description}</p>
          {insight.wellness_goal && <span className="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full mt-1 inline-block">{insight.wellness_goal}</span>}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-gray-400 flex-shrink-0 mt-1">
          {expanded ? "▲" : "▼"}
        </button>
      </div>
      {expanded && (
        <div className="mt-2 space-y-2">
          {insight.wellness_impact && <p className="text-xs text-gray-600 leading-relaxed">{insight.wellness_impact}</p>}
          {insight.action_items && <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Next steps:</span> {insight.action_items}</p>}
          {insight.smart_swap && (
            <div className="bg-amber-50 rounded-lg px-2.5 py-1.5">
              <p className="text-xs text-amber-700"><span className="font-semibold">💡 Swap:</span> {insight.smart_swap}</p>
            </div>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${insight.confidence === "high" ? "bg-green-50 text-green-600" : insight.confidence === "medium" ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-500"}`}>
            {insight.confidence} confidence
          </span>
          {insight.tone_safety_note && <p className="text-[10px] text-gray-400 italic">{insight.tone_safety_note}</p>}
          {insight.user_feedback === "none" ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-gray-400">Helpful?</span>
              <button onClick={() => onFeedback(insight, "positive")} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">👍</button>
              <button onClick={() => onFeedback(insight, "negative")} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-400">👎</button>
            </div>
          ) : (
            <p className="text-[10px] text-gray-400">{insight.user_feedback === "positive" ? "👍 Marked as helpful" : "👎 Marked as not helpful"}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function NutritionInsightsTab({ user, profile }) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [weekInsight, setWeekInsight] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [hydrationLogs, setHydrationLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [cycleEvents, setCycleEvents] = useState([]);
  const [savedInsights, setSavedInsights] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const since = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const [ml, hl, ci, ce, ins] = await Promise.all([
      base44.entities.MealLog.filter({ user_id: user.id }),
      base44.entities.HydrationLog.filter({ user_id: user.id }),
      base44.entities.DailyCheckins.filter({ user_id: user.id }),
      base44.entities.CycleEvents.filter({ user_id: user.id }),
      base44.entities.NutritionInsight.filter({ user_id: user.id }),
    ]);
    setMealLogs(ml.filter((x) => x.day_key >= since));
    setHydrationLogs(hl.filter((x) => x.day_key >= since));
    setCheckins(ci.filter((x) => x.date >= since));
    setCycleEvents(ce.filter((x) => x.date >= since));
    setSavedInsights(ins.filter((x) => x.day_key >= since).sort((a, b) => b.day_key?.localeCompare(a.day_key)));

    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const saved = await base44.entities.WeeklyInsights.filter({ user_id: user.id, week_start: weekStart });
    if (saved[0]) setWeekInsight(saved[0]);
    setLoading(false);
  };

  const handleInsightFeedback = async (insight, feedback) => {
    await base44.entities.NutritionInsight.update(insight.id, { user_feedback: feedback });
    setSavedInsights((prev) => prev.map((i) => i.id === insight.id ? { ...i, user_feedback: feedback } : i));
  };

  const generateWeekInsight = async () => {
    setGenerating(true);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekStartKey = format(weekStart, "yyyy-MM-dd");
    const weekEndKey = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    const weekMeals = mealLogs.filter((m) => m.day_key >= weekStartKey && m.day_key <= weekEndKey);
    const weekHydration = hydrationLogs.filter((h) => h.day_key >= weekStartKey && h.day_key <= weekEndKey);
    const weekCheckins = checkins.filter((c) => c.date >= weekStartKey && c.date <= weekEndKey);

    const avgHydration = weekHydration.length > 0 ? Math.round(weekHydration.reduce((s, h) => s + (h.amount_ml || 0), 0) / 7) : 0;
    const avgEnergy = weekCheckins.length > 0 ? (weekCheckins.reduce((s, c) => s + (c.energy || 0), 0) / weekCheckins.length).toFixed(1) : "unknown";
    const avgMood = weekCheckins.length > 0 ? (weekCheckins.reduce((s, c) => s + (c.mood || 0), 0) / weekCheckins.length).toFixed(1) : "unknown";

    const prompt = `You are a warm, supportive wellness nutrition coach.
Write a short weekly nutrition summary (200 words max) based on this data:

Week: ${weekStartKey} to ${weekEndKey}
Meals logged: ${weekMeals.length}
Average daily hydration: ${avgHydration}ml
Average energy (1-10): ${avgEnergy}
Average mood (1-10): ${avgMood}
Recent meals: ${weekMeals.slice(-5).map((m) => m.raw_text).join("; ") || "not available"}
Wellness goals this week: ${[...new Set(weekMeals.map(m => m.wellness_goal).filter(Boolean))].join(", ") || "not set"}

Guidelines:
- Use supportive, non-diagnostic language ("you might notice", "may support", "consider")
- Identify 2–3 patterns (positive and areas to explore)
- Give 1 small, achievable experiment for next week
- Never mention weight or calories unless mentioned by user
- Keep it warm, not clinical`;

    const res = await base44.integrations.Core.InvokeLLM({ prompt });
    const insight = await base44.entities.WeeklyInsights.create({
      user_id: user.id,
      week_start: weekStartKey,
      week_end: weekEndKey,
      insight_text: res,
      generated_at: new Date().toISOString(),
    });
    setWeekInsight(insight);
    setGenerating(false);
  };

  // Goal distribution
  const goalCounts = mealLogs.filter(m => m.wellness_goal).reduce((acc, m) => {
    acc[m.wellness_goal] = (acc[m.wellness_goal] || 0) + 1;
    return acc;
  }, {});
  const topGoal = Object.entries(goalCounts).sort((a, b) => b[1] - a[1])[0];

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <RuleInsight logs={{ hydration: hydrationLogs }} checkins={checkins} />

      {/* Goal pattern */}
      {topGoal && (
        <div className="card-glass rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-800 mb-2">🎯 Your Top Wellness Goal</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            You've been focusing most on <span className="font-semibold text-rose-600">{topGoal[0]}</span> ({topGoal[1]} meal{topGoal[1] !== 1 ? "s" : ""} tagged).
            Consistency with a clear intention like this can help you notice patterns over time.
          </p>
        </div>
      )}

      {/* Saved meal insights */}
      {savedInsights.length > 0 && (
        <div className="card-glass rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-800 mb-3">💡 Meal Insights (Last 30 days)</p>
          <div className="space-y-2">
            {savedInsights.slice(0, 10).map((ins) => (
              <SavedInsightCard key={ins.id} insight={ins} onFeedback={handleInsightFeedback} />
            ))}
          </div>
        </div>
      )}

      {/* Weekly AI summary */}
      <div className="card-glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <p className="text-sm font-bold text-gray-800">Weekly Summary</p>
          </div>
          <button onClick={generateWeekInsight} disabled={generating}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-600 font-medium">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {weekInsight ? "Refresh" : "Generate"}
          </button>
        </div>
        {generating && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 text-rose-300 animate-spin" />
            <p className="text-xs text-gray-400">Generating your personalised summary…</p>
          </div>
        )}
        {weekInsight && !generating && (
          <ReactMarkdown className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none prose-p:my-1.5">
            {weekInsight.insight_text}
          </ReactMarkdown>
        )}
        {!weekInsight && !generating && (
          <p className="text-xs text-gray-400">Tap "Generate" to get your personalised weekly nutrition summary.</p>
        )}
      </div>

      {/* Best day highlights */}
      {checkins.length > 0 && (() => {
        const best = [...checkins].sort((a, b) => ((b.energy || 0) + (b.mood || 0)) - ((a.energy || 0) + (a.mood || 0)))[0];
        if (!best) return null;
        const bestDayMeals = mealLogs.filter((m) => m.day_key === best.date);
        return (
          <div className="card-glass rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-800 mb-2">⭐ Your Best Day This Month</p>
            <p className="text-xs text-gray-500 mb-2">{format(parseISO(best.date), "EEEE, MMMM d")}</p>
            <div className="flex gap-3 mb-3 flex-wrap">
              {best.energy && <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">⚡ Energy {best.energy}/10</span>}
              {best.mood && <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">😊 Mood {best.mood}/10</span>}
            </div>
            {bestDayMeals.length > 0 && (
              <p className="text-xs text-gray-600">
                Meals that day: <span className="font-medium">{bestDayMeals.map((m) => m.raw_text).join(" · ")}</span>
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
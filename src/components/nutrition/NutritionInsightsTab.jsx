import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, parseISO } from "date-fns";
import ReactMarkdown from "react-markdown";

const INSIGHT_PROMPTS = {
  energy: "low hydration + low energy → suggest water + protein snack",
  digestion: "bloating logged + low fiber meals → suggest gentle walk + high fiber snack",
  cravings: "cravings logged + low sleep → suggest protein + magnesium rich food",
  sleep: "late dinner logged + poor sleep → suggest earlier eating window",
};

function RuleInsight({ logs, checkins, cycleEvents }) {
  const insights = [];

  // Low hydration check
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
    insights.push({ emoji: "🥦", text: "On days when digestion feels off, you might try warm foods, ginger tea, or a gentle post-meal walk." });
  }
  if (todayCheckin?.energy <= 2 && todayHydration < 500) {
    insights.push({ emoji: "⚡", text: "Low energy + low water early in the day — consider starting with a large glass of water and a light protein snack." });
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

export default function NutritionInsightsTab({ user, profile }) {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [weekInsight, setWeekInsight] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [hydrationLogs, setHydrationLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [cycleEvents, setCycleEvents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const since = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const [ml, hl, ci, ce] = await Promise.all([
      base44.entities.MealLog.filter({ user_id: user.id }),
      base44.entities.HydrationLog.filter({ user_id: user.id }),
      base44.entities.DailyCheckins.filter({ user_id: user.id }),
      base44.entities.CycleEvents.filter({ user_id: user.id }),
    ]);
    setMealLogs(ml.filter((x) => x.day_key >= since));
    setHydrationLogs(hl.filter((x) => x.day_key >= since));
    setCheckins(ci.filter((x) => x.date >= since));
    setCycleEvents(ce.filter((x) => x.date >= since));

    // Load saved week insight
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const saved = await base44.entities.WeeklyInsights.filter({ user_id: user.id, week_start: weekStart });
    if (saved[0]) setWeekInsight(saved[0]);
    setLoading(false);
  };

  const generateWeekInsight = async () => {
    setGenerating(true);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekStartKey = format(weekStart, "yyyy-MM-dd");
    const weekEndKey = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    const weekMeals = mealLogs.filter((m) => m.day_key >= weekStartKey && m.day_key <= weekEndKey);
    const weekHydration = hydrationLogs.filter((h) => h.day_key >= weekStartKey && h.day_key <= weekEndKey);
    const weekCheckins = checkins.filter((c) => c.date >= weekStartKey && c.date <= weekEndKey);
    const weekCycle = cycleEvents.filter((c) => c.date >= weekStartKey && c.date <= weekEndKey);

    const avgHydration = weekHydration.length > 0 ? Math.round(weekHydration.reduce((s, h) => s + (h.amount_ml || 0), 0) / 7) : 0;
    const avgEnergy = weekCheckins.length > 0 ? (weekCheckins.reduce((s, c) => s + (c.energy || 0), 0) / weekCheckins.length).toFixed(1) : "unknown";
    const avgMood = weekCheckins.length > 0 ? (weekCheckins.reduce((s, c) => s + (c.mood || 0), 0) / weekCheckins.length).toFixed(1) : "unknown";
    const mealsLogged = weekMeals.length;

    const prompt = `You are a warm, supportive women's wellness nutrition coach.
Write a short weekly nutrition summary (200 words max) for a woman based on this data:

Week: ${weekStartKey} to ${weekEndKey}
Meals logged: ${mealsLogged}
Average daily hydration: ${avgHydration}ml
Average energy (1-10): ${avgEnergy}
Average mood (1-10): ${avgMood}
Cycle events this week: ${weekCycle.map((c) => c.type).join(", ") || "none logged"}
Recent meals: ${weekMeals.slice(-5).map((m) => m.raw_text).join("; ") || "not available"}

Guidelines:
- Use supportive, non-diagnostic language ("you might notice", "may support", "consider")
- Identify 2–3 patterns (good and areas to explore)
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

  // Pattern: craving days by cycle phase
  const cravingCheckins = checkins.filter((c) => c.appetite === "cravings");
  const cravingPhases = cravingCheckins.map((c) => {
    if (!profile?.last_period_start_date) return "unknown";
    const dayOfCycle = Math.floor((new Date(c.date) - new Date(profile.last_period_start_date)) / 86400000) % (profile.cycle_avg_length || 28);
    if (dayOfCycle < (profile.period_length || 5)) return "menstrual";
    if (dayOfCycle < (profile.cycle_avg_length || 28) * 0.4) return "follicular";
    if (dayOfCycle < (profile.cycle_avg_length || 28) * 0.55) return "ovulatory";
    return "luteal";
  });
  const phaseCount = cravingPhases.reduce((acc, p) => { acc[p] = (acc[p] || 0) + 1; return acc; }, {});
  const topCravingPhase = Object.entries(phaseCount).sort((a, b) => b[1] - a[1])[0];

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Rule-based signals */}
      <RuleInsight logs={{ hydration: hydrationLogs }} checkins={checkins} cycleEvents={cycleEvents} />

      {/* Craving pattern */}
      {topCravingPhase && (
        <div className="card-glass rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-800 mb-2">🌙 Craving Pattern</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            You've noted cravings most often during your <span className="font-semibold text-rose-600">{topCravingPhase[0]}</span> phase ({topCravingPhase[1]} time{topCravingPhase[1] !== 1 ? "s" : ""}).
            This is really common — your body may be asking for more fuel or comfort during this time.
            Consider having protein-rich snacks and magnesium-containing foods (like dark chocolate, nuts, or leafy greens) on hand.
          </p>
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
            <div className="flex gap-3 mb-3">
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
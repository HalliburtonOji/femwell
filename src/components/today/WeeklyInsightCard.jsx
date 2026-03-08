import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { subDays, format } from "date-fns";

export default function WeeklyInsightCard({ user }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const weekStart = subDays(new Date(), 6).toISOString().split("T")[0];
  const weekEnd = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadInsight();
  }, [user]);

  const loadInsight = async () => {
    const insights = await base44.entities.WeeklyInsights.filter({ user_id: user.id }, "-generated_at", 1);
    if (insights[0] && insights[0].week_start >= weekStart) {
      setInsight(insights[0]);
    }
    setLoading(false);
  };

  const generate = async () => {
    setGenerating(true);
    const today = new Date().toISOString().split("T")[0];

    const [journals, checkins, habits, symptoms, cycles] = await Promise.all([
      base44.entities.JournalEntries.filter({ user_id: user.id }),
      base44.entities.DailyCheckins.filter({ user_id: user.id }),
      base44.entities.HabitLogs.filter({ user_id: user.id }),
      base44.entities.SymptomLogs.filter({ user_id: user.id }),
      base44.entities.CycleEvents.filter({ user_id: user.id }),
    ]);

    const recentJournals = journals.filter(j => (j.session_date || j.created_date?.split("T")[0]) >= weekStart);
    const recentCheckins = checkins.filter(c => c.date >= weekStart);
    const recentHabits = habits.filter(h => h.date >= weekStart && h.completed);
    const recentSymptoms = symptoms.filter(s => s.date >= weekStart);
    const recentCycles = cycles.filter(c => c.date >= weekStart);

    const prompt = `You are a compassionate women's wellness coach. Analyse the following data from the past 7 days (${weekStart} to ${today}) and write a concise, warm "Weekly Wellness Insight" report (3-5 short paragraphs). Highlight patterns, celebrate wins, note any recurring symptoms or habits, and offer 1-2 actionable suggestions for the coming week. Do not diagnose. Be encouraging.

JOURNAL ENTRIES (${recentJournals.length}):
${recentJournals.map(j => `- "${j.text?.slice(0, 100)}"`).join("\n") || "None logged"}

DAILY CHECK-INS (${recentCheckins.length}):
${recentCheckins.map(c => `- ${c.date}: Mood ${c.mood}/5, Energy ${c.energy}/5, Stress ${c.stress}/5, Sleep ${c.sleep_hours}h`).join("\n") || "None logged"}

COMPLETED HABITS (${recentHabits.length}):
${[...new Set(recentHabits.map(h => h.habit_type || h.habit_name))].join(", ") || "None"}

SYMPTOMS (${recentSymptoms.length}):
${recentSymptoms.map(s => `- ${s.date}: ${s.symptom_type} (severity ${s.severity}/5)`).join("\n") || "None logged"}

CYCLE EVENTS (${recentCycles.length}):
${recentCycles.map(c => `- ${c.date}: ${c.type}`).join("\n") || "None logged"}

Write the insight in Markdown with clear sections. Keep it warm, personal, and actionable.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
    const text = typeof result === "string" ? result : result?.text || result?.content || JSON.stringify(result);

    const saved = await base44.entities.WeeklyInsights.create({
      user_id: user.id,
      week_start: weekStart,
      week_end: weekEnd,
      insight_text: text,
      generated_at: new Date().toISOString(),
    });
    setInsight(saved);
    setExpanded(true);
    setGenerating(false);
  };

  if (loading) return null;

  return (
    <div className="card-glass rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-200 to-rose-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Weekly Wellness Insight</p>
            <p className="text-xs text-gray-400">
              {insight ? `Generated ${format(new Date(insight.generated_at), "MMM d")}` : "Get your weekly summary"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={generate}
            disabled={generating}
            className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center hover:bg-rose-100 transition-colors"
            title="Regenerate"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${generating ? "animate-spin" : ""}`} />
          </button>
          {insight && (
            <button onClick={() => setExpanded(v => !v)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
              {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
            </button>
          )}
        </div>
      </div>

      {generating && (
        <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
          Scanning your week…
        </div>
      )}

      {!generating && !insight && (
        <button
          onClick={generate}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-100 to-rose-100 text-sm font-medium text-violet-700 hover:from-violet-200 hover:to-rose-200 transition-all"
        >
          ✨ Generate this week's insight
        </button>
      )}

      {insight && expanded && (
        <div className="mt-3 prose prose-sm max-w-none prose-p:my-1.5 prose-headings:text-gray-700 prose-strong:text-rose-700 text-gray-600 text-sm">
          <ReactMarkdown>{insight.insight_text}</ReactMarkdown>
        </div>
      )}

      {insight && !expanded && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
          {insight.insight_text?.replace(/[#*_]/g, "").slice(0, 120)}…
        </p>
      )}
    </div>
  );
}
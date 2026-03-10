import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const average = (values) => {
  const valid = values.filter((value) => value != null);
  if (!valid.length) return null;
  return (valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(1);
};

export default function AIHealthSummaryCard({ timeRange, checkins, symptomLogs, habitLogs, cutoffDate }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);

    const recentCheckins = checkins.filter((item) => item.date >= cutoffDate);
    const recentSymptoms = symptomLogs.filter((item) => item.date >= cutoffDate);
    const recentHabits = habitLogs.filter((item) => item.date >= cutoffDate);

    const symptomCounts = recentSymptoms.reduce((acc, item) => {
      if (!item.symptom_type) return acc;
      acc[item.symptom_type] = (acc[item.symptom_type] || 0) + 1;
      return acc;
    }, {});

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => `${name.replace(/_/g, " ")} (${count})`)
      .join(", ") || "None logged";

    const habitCounts = recentHabits.reduce((acc, item) => {
      const name = item.habit_type || item.habit_name;
      if (!name) return acc;
      if (!acc[name]) acc[name] = { total: 0, completed: 0 };
      acc[name].total += 1;
      if (item.completed) acc[name].completed += 1;
      return acc;
    }, {});

    const habitSummary = Object.entries(habitCounts)
      .map(([name, stats]) => `${name}: ${Math.round((stats.completed / (stats.total || 1)) * 100)}% completion`)
      .slice(0, 6)
      .join("\n") || "No habits logged";

    const prompt = `You are a compassionate women's health insights coach. Create a short markdown health summary for the last ${timeRange} months. Keep it warm, specific, and actionable. Do not diagnose or use alarming language. Use 3 sections with short headings: Wins, Patterns, Next step.\n\nSUMMARY METRICS\n- Average mood: ${average(recentCheckins.map((item) => item.mood)) || "n/a"}/10\n- Average energy: ${average(recentCheckins.map((item) => item.energy)) || "n/a"}/10\n- Average sleep quality: ${average(recentCheckins.map((item) => item.sleep_quality)) || "n/a"}/10\n- Average stress: ${average(recentCheckins.map((item) => item.stress)) || "n/a"}/10\n- Check-ins logged: ${recentCheckins.length}\n- Symptom logs: ${recentSymptoms.length}\n- Top symptoms: ${topSymptoms}\n\nHABIT CONSISTENCY\n${habitSummary}\n\nRECENT CHECKINS\n${recentCheckins.slice(-10).map((item) => `- ${item.date}: mood ${item.mood ?? "-"}, energy ${item.energy ?? "-"}, stress ${item.stress ?? "-"}, sleep ${item.sleep_quality ?? "-"}`).join("\n") || "No recent check-ins"}`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setSummary(typeof result === "string" ? result : result?.text || result?.content || "No summary generated.");
    setLoading(false);
  };

  return (
    <div className="card-glass rounded-2xl p-4 mb-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-200 to-rose-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">AI Health Summary</p>
            <p className="text-xs text-gray-400">A guided readout of your recent patterns.</p>
          </div>
        </div>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center hover:bg-rose-100 transition-colors"
          title="Generate summary"
        >
          <RefreshCw className={`w-4 h-4 text-rose-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {!summary && !loading && (
        <button
          onClick={generateSummary}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-100 to-rose-100 text-sm font-medium text-violet-700 hover:from-violet-200 hover:to-rose-200 transition-all"
        >
          ✨ Generate health summary
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
          Reading your patterns…
        </div>
      )}

      {!!summary && !loading && (
        <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-headings:text-gray-700 prose-strong:text-rose-700 text-gray-600 text-sm">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SupportInsightCard({ mode, profile, logs }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);

    const recentLogs = logs.slice(0, 10).map((log) => JSON.stringify(log)).join("\n") || "No logs yet.";
    const profileText = profile ? JSON.stringify(profile) : "No profile yet.";
    const modeTitle = mode === "pregnancy" ? "pregnancy" : "menopause";

    const prompt = `You are a warm, careful women's health support coach. Based on the ${modeTitle} profile and recent logs below, write a short markdown support summary. Use exactly 3 short sections: Wins, Patterns, Gentle next step. Stay supportive, specific, and non-diagnostic. Avoid medical claims or urgent language.\n\nPROFILE\n${profileText}\n\nRECENT LOGS\n${recentLogs}`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setSummary(typeof result === "string" ? result : result?.text || result?.content || "No summary generated.");
    setLoading(false);
  };

  return (
    <div className="card-glass rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-200 to-rose-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">AI Support Guide</p>
            <p className="text-xs text-gray-400">Supportive reflection for your recent {mode} pattern.</p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center hover:bg-rose-100 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-rose-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {!summary && !loading && (
        <button
          onClick={generate}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-100 to-rose-100 text-sm font-medium text-violet-700 hover:from-violet-200 hover:to-rose-200 transition-all"
        >
          ✨ Generate support summary
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
          Reading your recent patterns…
        </div>
      )}

      {!!summary && !loading && (
        <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-headings:text-gray-700 prose-strong:text-rose-700 text-gray-600 text-sm">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}

      <p className="mt-3 text-[11px] text-gray-400">Supportive guidance only — not medical advice.</p>
    </div>
  );
}
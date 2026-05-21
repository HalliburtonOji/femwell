import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { buildJessContext } from "@/utils/jessContext";
import AiDisclaimer from "@/components/compliance/AiDisclaimer";

export default function SupportInsightCard({ mode, profile, logs, user }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const recentLogs = logs.slice(0, 10).map((log) => JSON.stringify(log)).join("\n") || "No logs yet.";
    const profileText = profile ? JSON.stringify(profile) : "No profile yet.";
    const modeTitle = mode === "pregnancy" ? "pregnancy" : "menopause";
    // Sprint B B4: prepend today's real cycle/check-in/symptom context so
    // Jess's reflection lands on the user's actual state instead of guessing.
    const ctx = await buildJessContext({ user, profile });
    const prompt = `${ctx.prompt}You are a warm, careful women's health support coach. Based on the ${modeTitle} profile and recent logs below, write a short markdown support summary. Use exactly 3 short sections: Wins, Patterns, Gentle next step. Stay supportive, specific, and non-diagnostic. Avoid medical claims or urgent language.\n\nPROFILE\n${profileText}\n\nRECENT LOGS\n${recentLogs}`;
    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setSummary(typeof result === "string" ? result : result?.text || result?.content || "No summary generated.");
    setLoading(false);
  };

  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
            <Sparkles style={{ width: 16, height: 16, color: "var(--rose-dust)" }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--plum)" }}>AI Support Guide</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Supportive reflection for your recent {mode} pattern.</p>
          </div>
        </div>
        <button onClick={generate} disabled={loading} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: "var(--rose-dust-subtle)", border: "none", cursor: "pointer" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: "var(--rose-dust)" }} />
        </button>
      </div>

      {!summary && !loading && (
        <button onClick={generate} className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", border: "none", cursor: "pointer" }}>
          Generate support summary
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-3 text-sm" style={{ color: "var(--mauve)" }}>
          <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
          Reading your recent patterns...
        </div>
      )}

      {!!summary && !loading && (
        <div className="prose prose-sm max-w-none prose-p:my-1.5 text-sm" style={{ color: "var(--mauve)" }}>
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}

      {/* Sprint C C1 — MHRA-aligned disclaimer (canonical wording). */}
      {!!summary && <AiDisclaimer />}
    </div>
  );
}
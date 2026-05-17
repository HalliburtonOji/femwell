import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { subDays, format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { getPlannerConfig, isCycleLifeStage } from "@/utils/plannerAdapter";

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
    base44.entities.WeeklyInsights.filter({ user_id: user.id }, "-generated_at", 1)
      .then(insights => {
        if (insights[0] && insights[0].week_start >= weekStart) {
          setInsight(insights[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const generate = async () => {
    setGenerating(true);
    const today = new Date().toISOString().split("T")[0];

    // Phase 2 QA fix #4 — fetch UserProfile alongside the data sources so
    // we can pass life_stage + jessContext into the LLM prompt. Without
    // this the model defaulted to cycle framing ("approaching menstrual
    // phase") for pregnancy / postpartum / menopause users.
    const [journals, checkins, habits, symptoms, cycles, profiles] = await Promise.all([
      base44.entities.JournalEntries.filter({ user_id: user.id }),
      base44.entities.DailyCheckins.filter({ user_id: user.id }),
      base44.entities.HabitLogs.filter({ user_id: user.id }),
      base44.entities.SymptomLogs.filter({ user_id: user.id }),
      base44.entities.CycleEvents.filter({ user_id: user.id }),
      base44.entities.UserProfile.filter({ user_id: user.id }, null, 1).catch(() => []),
    ]);

    const recentJournals = journals.filter(j => (j.session_date || j.created_date?.split("T")[0]) >= weekStart);
    const recentCheckins = checkins.filter(c => c.date >= weekStart);
    const recentHabits = habits.filter(h => h.date >= weekStart && h.completed);
    const recentSymptoms = symptoms.filter(s => s.date >= weekStart);
    const recentCycles = cycles.filter(c => c.date >= weekStart);

    // Stage context — drives both the writer-style instruction and the
    // explicit "do not assume cycle" guard for non-cycle stages.
    const profile = profiles?.[0] || null;
    const lifeStage = profile?.life_stage || "reproductive";
    const conditions = profile?.conditions || profile?.condition_flags || [];
    const conditionsLabel = Array.isArray(conditions) && conditions.length > 0 ? conditions.join(", ") : "none";
    const stageConfig = getPlannerConfig(lifeStage, conditions);
    const cycleAnchored = isCycleLifeStage(lifeStage, conditions);
    const stageGuard = cycleAnchored
      ? "Cycle framing is appropriate for this user."
      : "DO NOT reference cycle phases, ovulation, or 'approaching menstrual phase'. The cycle frame is wrong for this user's life stage — speak only in terms of energy, sleep, recovery, mood, and stage-appropriate concerns.";

    const prompt = `You are a compassionate women's wellness coach. Analyse the following data from the past 7 days (${weekStart} to ${today}) and write a concise, warm "Weekly Wellness Insight" report (3-5 short paragraphs). Highlight patterns, celebrate wins, note any recurring symptoms or habits, and offer 1-2 actionable suggestions for the coming week. Do not diagnose. Be encouraging.

LIFE STAGE: ${lifeStage}
CONDITIONS: ${conditionsLabel}
STAGE GUIDANCE: ${stageConfig?.jessContext || ""}
STAGE GUARD: ${stageGuard}

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

Write the insight in Markdown with clear sections separated by blank lines (two newlines). Keep it warm, personal, and actionable. Honour the STAGE GUARD above without exception.`;

    const totalDataPoints = recentJournals.length + recentCheckins.length + recentHabits.length + recentSymptoms.length + recentCycles.length;
    if (totalDataPoints < 5) {
      const text = "You are just getting started. The more you log, the sharper your insights become. Try logging a daily check-in, journaling, or tracking a habit this week — even small entries help build your personal health picture.";
      const saved = await base44.entities.WeeklyInsights.create({
        user_id: user.id, week_start: weekStart, week_end: weekEnd,
        insight_text: text, generated_at: new Date().toISOString(),
      });
      setInsight(saved); setExpanded(true); setGenerating(false);
      return;
    }

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
  // Don't render an empty card — only show when there's an insight
  if (!insight) return null;

  return (
    <div style={{
      backgroundColor: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "20px", padding: "16px",
      boxShadow: "var(--shadow-sm)"
    }}>

      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: "32px", height: "32px", borderRadius: "12px",
            backgroundColor: "var(--rose-dust-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <RefreshCw className="w-3.5 h-3.5" style={{ color: "var(--rose-dust)" }} />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              Weekly Insight
            </p>
            <p style={{ fontSize: "11px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
              {insight
                ? `Generated ${format(new Date(insight.generated_at), "MMM d")}`
                : "Get your weekly summary"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={generate}
            disabled={generating}
            style={{
              width: "34px", height: "34px", borderRadius: "9999px",
              backgroundColor: "var(--ivory-dark)", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center"
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`}
                       style={{ color: "var(--rose-dust)" }} />
          </button>
          {insight && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                width: "34px", height: "34px", borderRadius: "9999px",
                backgroundColor: "var(--ivory-dark)", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center"
              }}
            >
              {expanded
                ? <ChevronUp className="w-3.5 h-3.5" style={{ color: "var(--mauve)" }} />
                : <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--mauve)" }} />}
            </button>
          )}
        </div>
      </div>

      {generating && (
        <div className="flex items-center gap-2 py-3">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
          <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            Scanning your week…
          </p>
        </div>
      )}

      {insight && expanded && (
        <>
          <div style={{
            maxHeight: "40vh", overflowY: "auto",
            borderRadius: "14px", padding: "14px",
            backgroundColor: "var(--ivory)",
            border: "1px solid var(--border-subtle)",
            marginTop: "12px"
          }}>
            {insight.insight_text
              .split("\n\n")
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} style={{
                  fontSize: "13px", lineHeight: 1.65,
                  color: "var(--plum)", marginBottom: "10px",
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {para.replace(/^#+\s*/, "").replace(/\*\*/g, "")}
                </p>
              ))}
          </div>
          <Link to={createPageUrl("Pulse")} style={{
            display: "inline-block", marginTop: "12px",
            fontSize: "12px", fontWeight: 600,
            color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif",
            textDecoration: "none"
          }}>
            View all insights in Pulse
          </Link>
        </>
      )}

      {insight && !expanded && (
        <p style={{
          fontSize: "12px", lineHeight: 1.5, color: "var(--mauve)",
          marginTop: "6px", fontFamily: "'Inter', sans-serif",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden"
        }}>
          {insight.insight_text?.replace(/[#*_]/g, "").slice(0, 120)}…
        </p>
      )}

    </div>
  );
}
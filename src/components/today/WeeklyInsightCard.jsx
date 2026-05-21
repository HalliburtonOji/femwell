import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { subDays, format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { getPlannerConfig, isCycleLifeStage } from "@/utils/plannerAdapter";
import { readDevStage, subscribeDevStage } from "@/utils/devStageStore";
import { buildJessContext } from "@/utils/jessContext";
import AiDisclaimer from "@/components/compliance/AiDisclaimer";

// ────────────────────────────────────────────────────────────────────────────
// scrubCycleCopyForNonCycleStage — Phase 2 QA-fix-bundle-3 (#5).
//
// Old insights generated before the LIFE STAGE / STAGE GUARD prompt blocks
// shipped (commit 010ca9f) still contain cycle copy like "you're approaching
// your luteal phase" on pregnancy / postpartum / menopause accounts. Even
// after we add stage-aware cache invalidation + regenerate, there's a window
// of stale insights already saved to base44 that we shouldn't surface as-is.
//
// This client-side post-processor scrubs cycle-frame language on non-cycle
// stages. It's conservative: only fires when isCycleLifeStage is false.
// Replacements aim to be neutral / stage-appropriate rather than perfect.
// ────────────────────────────────────────────────────────────────────────────
function scrubCycleCopyForNonCycleStage(text, lifeStage, conditions) {
  if (!text) return text;
  if (isCycleLifeStage(lifeStage, conditions)) return text;
  // Whole-phrase replacements first (longest matches win).
  const replacements = [
    [/approaching your menstrual phase/gi, "moving through this week"],
    [/approaching your luteal phase/gi,    "moving through this week"],
    [/approaching your follicular phase/gi,"moving through this week"],
    [/approaching your ovulatory phase/gi, "moving through this week"],
    [/approaching your period/gi,          "moving through this week"],
    [/approaching menstrual phase/gi,      "moving through this week"],
    [/your luteal phase/gi,                "this week"],
    [/your follicular phase/gi,            "this week"],
    [/your ovulatory phase/gi,             "this week"],
    [/your menstrual phase/gi,             "this week"],
    [/the luteal phase/gi,                 "this week"],
    [/the follicular phase/gi,             "this week"],
    [/the ovulatory phase/gi,              "this week"],
    [/the menstrual phase/gi,              "this week"],
    [/luteal phase/gi,                     "this part of your rhythm"],
    [/follicular phase/gi,                 "this part of your rhythm"],
    [/ovulatory phase/gi,                  "this part of your rhythm"],
    [/menstrual phase/gi,                  "this part of your rhythm"],
    [/your cycle is/gi,                    "your rhythm is"],
    [/in your cycle/gi,                    "in your rhythm"],
    [/cycle day \d+/gi,                    "this week"],
    [/PMS symptoms/gi,                     "your symptoms"],
    [/PMS\b/gi,                            "symptoms"],
    [/your period\b/gi,                    "this season"],
    [/before your period/gi,               "during this season"],
    [/ovulation\b/gi,                      "the middle of this rhythm"],
    [/luteal\b/gi,                         "this part of your rhythm"],
    [/follicular\b/gi,                     "this part of your rhythm"],
  ];
  let out = text;
  for (const [pattern, repl] of replacements) {
    out = out.replace(pattern, repl);
  }
  return out;
}

export default function WeeklyInsightCard({ user }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Phase 2 QA-fix-bundle-3 (#5) — track the user's current stage so we can
  // detect when a cached insight was generated before the stage flipped.
  const [currentStage, setCurrentStage] = useState(null);
  const [currentConditions, setCurrentConditions] = useState([]);
  // Did the cached insight stage match the current one? When false, the
  // header gets a "stage changed — regenerate" affordance.
  const [insightIsStale, setInsightIsStale] = useState(false);
  // Phase 2 QA-fix-bundle-8 — subscribe to the devStageStore so this card
  // re-evaluates the cycle-copy scrubber + stale banner whenever the DEV
  // switcher changes stage (without waiting for a remount or refetch).
  const [devOverride, setDevOverride] = useState(() => readDevStage() || "");
  useEffect(() => {
    return subscribeDevStage((next) => setDevOverride(next || ""));
  }, []);

  const weekStart = subDays(new Date(), 6).toISOString().split("T")[0];
  const weekEnd = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadInsight();
  }, [user]);

  const loadInsight = async () => {
    try {
      const [insights, profiles] = await Promise.all([
        base44.entities.WeeklyInsights.filter({ user_id: user.id }, "-generated_at", 1).catch(() => []),
        base44.entities.UserProfile.filter({ user_id: user.id }, null, 1).catch(() => []),
      ]);
      const profile = profiles?.[0] || null;
      const stage = profile?.life_stage || "reproductive";
      const conds = profile?.conditions || profile?.condition_flags || [];
      setCurrentStage(stage);
      setCurrentConditions(conds);
      if (insights[0] && insights[0].week_start >= weekStart) {
        setInsight(insights[0]);
        // Compare insight's generated_for_stage to current. Insights from
        // before this commit won't have generated_for_stage — treat them
        // as stale on non-cycle stages (the prompt at generation time
        // didn't know about life_stage). Phase 2 QA-fix-bundle-8 — when a
        // DEV override is active, compare against that instead of the
        // profile stage so previewing a different stage marks the cached
        // insight as stale.
        const liveOverride = readDevStage() || "";
        const compareStage = liveOverride || stage;
        const insightStage = insights[0].generated_for_stage || null;
        const stageMismatch = insightStage && insightStage !== compareStage;
        const preStageInsight = !insightStage && !isCycleLifeStage(compareStage, conds);
        setInsightIsStale(!!(stageMismatch || preStageInsight));
      }
    } finally {
      setLoading(false);
    }
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

    // Sprint B B4: prepend the shared Jess context block (today's mood +
    // energy + symptoms + derived cycle phase + life stage) so the model
    // anchors on the user's actual state right now, not just the 7-day
    // history that follows.
    const jessCtx = await buildJessContext({ user, profile });

    const prompt = `${jessCtx.prompt}You are a compassionate women's wellness coach. Analyse the following data from the past 7 days (${weekStart} to ${today}) and write a concise, warm "Weekly Wellness Insight" report.

CRITICAL FORMATTING RULES:
- Output 3-5 SHORT paragraphs.
- Separate paragraphs with a BLANK LINE (two newlines).
- Each paragraph should be 1-3 sentences max.
- Do NOT output one long block of prose.

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

Honour the STAGE GUARD above without exception. Highlight patterns, celebrate wins, note any recurring symptoms or habits, and offer 1-2 actionable suggestions for the coming week. Do not diagnose. Be encouraging.`;

    const totalDataPoints = recentJournals.length + recentCheckins.length + recentHabits.length + recentSymptoms.length + recentCycles.length;
    if (totalDataPoints < 5) {
      const text = "You are just getting started.\n\nThe more you log, the sharper your insights become.\n\nTry logging a daily check-in, journaling, or tracking a habit this week — even small entries help build your personal health picture.";
      const saved = await base44.entities.WeeklyInsights.create({
        user_id: user.id, week_start: weekStart, week_end: weekEnd,
        insight_text: text, generated_at: new Date().toISOString(),
        generated_for_stage: lifeStage,
      });
      setInsight(saved); setExpanded(true); setGenerating(false);
      setInsightIsStale(false);
      return;
    }

    const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
    const text = typeof result === "string" ? result : result?.text || result?.content || JSON.stringify(result);

    // Stamp the stage on the row so we can detect staleness next reload.
    const saved = await base44.entities.WeeklyInsights.create({
      user_id: user.id,
      week_start: weekStart,
      week_end: weekEnd,
      insight_text: text,
      generated_at: new Date().toISOString(),
      generated_for_stage: lifeStage,
    });
    setInsight(saved);
    setExpanded(true);
    setGenerating(false);
    setInsightIsStale(false);
  };

  if (loading) return null;
  // Don't render an empty card — only show when there's an insight
  if (!insight) return null;

  // Phase 2 QA-fix-bundle-8 — let the DEV override win over the fetched
  // profile stage when previewing. This makes the cycle-copy scrubber + the
  // stale-stage banner immediately reflect the switcher's chosen stage.
  const effectiveStage = devOverride || currentStage;

  // Phase 2 QA-fix-bundle-3 (#5) — apply the cycle-copy scrubber for
  // non-cycle stages BEFORE paragraph splitting so the splitter sees clean
  // stage-appropriate text.
  const displayText = scrubCycleCopyForNonCycleStage(
    insight.insight_text || "",
    effectiveStage,
    currentConditions,
  );

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

      {/* Phase 2 QA-fix-bundle-3 (#5) — stale-stage banner. Surfaces when
          the insight was generated against a different life_stage than the
          user currently has, OR when the insight has no generated_for_stage
          stamp AND the user is on a non-cycle stage (legacy insights that
          almost certainly contain cycle copy). Tapping regenerates. */}
      {insightIsStale && !generating && (
        <button
          onClick={generate}
          style={{
            width: "100%", marginBottom: 10, padding: "8px 12px",
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(168,134,75,0.10)",
            border: "1px solid rgba(168,134,75,0.32)",
            borderRadius: 10, cursor: "pointer", textAlign: "left",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <AlertCircle className="w-3.5 h-3.5" style={{ color: "#A6862B", flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--plum)" }}>
            Your stage has changed since this insight was written — tap to regenerate.
          </span>
        </button>
      )}

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
            marginTop: "12px",
            // Phase 2 QA-fix-bundle-4 — outer container preserves all
            // whitespace so any \n inside the text actually wraps. Acts as
            // a safety net under the per-paragraph divs below.
            whiteSpace: "pre-wrap",
          }}>
            {/* Phase 2 QA-fix-bundle-4 — switch <p> → <div> for paragraphs
                because some global reset CSS was collapsing <p> margins
                even with marginBottom set. <div> + explicit marginBottom
                renders the spacing reliably. */}
            {(() => {
              // Phase 2 QA-fix-bundle-6 — aggressive paragraph splitter.
              //
              // Previous version cap-of-280 only fired when paragraphs
              // exceeded that length. QA found insights of ~200 chars
              // with no internal newlines and only one sentence still
              // rendered as a single block. The new logic ALWAYS produces
              // multiple paragraphs once the text is longer than 180 chars,
              // even if there are no sentence-ending punctuation marks.
              //
              // Pipeline:
              //   1. Blank-line split.
              //   2. Single-newline split (LLM forgot the blank line).
              //   3. Sentence-pair grouping (every 2 sentences = 1 paragraph).
              //   4. Word-boundary force-split for any single paragraph
              //      longer than 160 chars — splits roughly every 140 chars
              //      at the nearest preceding space.
              const text = (displayText || "").trim();
              const cleanInline = (s) => s.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();

              let paras = text.split(/\n{2,}/).map(cleanInline).filter(Boolean);
              if (paras.length < 2) paras = text.split(/\n/).map(cleanInline).filter(Boolean);
              if (paras.length < 2) {
                const sentences = text.split(/(?<=[.!?])\s+/).map(cleanInline).filter(Boolean);
                if (sentences.length > 1) {
                  paras = [];
                  for (let i = 0; i < sentences.length; i += 2) {
                    paras.push(sentences.slice(i, i + 2).join(" "));
                  }
                }
              }

              // Word-boundary force-split for any paragraph still > 160 chars.
              const SOFT_CAP = 160;
              const TARGET_LEN = 140;
              const finalParas = [];
              for (const p of paras) {
                if (p.length <= SOFT_CAP) { finalParas.push(p); continue; }
                // First try sentence-pair re-split.
                const sentences = p.split(/(?<=[.!?])\s+/).filter(Boolean);
                if (sentences.length > 1) {
                  for (let i = 0; i < sentences.length; i += 2) {
                    const chunk = sentences.slice(i, i + 2).join(" ");
                    // If a single sentence pair is still huge, fall through.
                    if (chunk.length <= SOFT_CAP) {
                      finalParas.push(chunk);
                    } else {
                      // Force word-boundary split.
                      let remaining = chunk;
                      while (remaining.length > SOFT_CAP) {
                        let cut = remaining.lastIndexOf(" ", TARGET_LEN);
                        if (cut < 60) cut = TARGET_LEN; // mid-word fallback
                        finalParas.push(remaining.slice(0, cut).trim());
                        remaining = remaining.slice(cut).trim();
                      }
                      if (remaining) finalParas.push(remaining);
                    }
                  }
                } else {
                  // No sentence breaks at all — force word-boundary chunks.
                  let remaining = p;
                  while (remaining.length > SOFT_CAP) {
                    let cut = remaining.lastIndexOf(" ", TARGET_LEN);
                    if (cut < 60) cut = TARGET_LEN;
                    finalParas.push(remaining.slice(0, cut).trim());
                    remaining = remaining.slice(cut).trim();
                  }
                  if (remaining) finalParas.push(remaining);
                }
              }

              return finalParas.map((para, i) => (
                <div key={i} style={{
                  fontSize: "13px",
                  lineHeight: 1.65,
                  color: "var(--plum)",
                  marginBottom: "12px",
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: "pre-wrap",
                }}>
                  {para}
                </div>
              ));
            })()}
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
          {displayText?.replace(/[#*_]/g, "").slice(0, 120)}…
        </p>
      )}

      {/* Sprint C C1 — MHRA disclaimer on AI-generated insight text. */}
      {insight && <AiDisclaimer />}

    </div>
  );
}

// JessPatientSummary — Feature 4 (Wing #2 of 3)
//
// Lives at the top of /DoctorExport. Jess writes a clinical-tone 2-3
// sentence summary of the last 7 days that the user can copy straight
// into a message or take to a GP appointment. Weekly cache key keeps
// the summary stable Monday→Sunday so multiple visits in the same week
// don't re-fire the agent.
//
// Compliance rails baked in:
//   • Clinical tone, no first person
//   • No diagnosis language
//   • Inline "Not medical advice" disclaimer

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import {
  callJessAgent,
  loadDailyCache,
  saveDailyCache,
  weekKey,
} from "@/services/jessAgentService";

function fallbackSummary({ recentSym, recentMood }) {
  const symPart = recentSym.length
    ? `Most-logged symptoms in the last week were ${recentSym.slice(0, 3).join(", ")}.`
    : "No prominent symptoms were logged in the last week.";
  const moodPart = recentMood
    ? ` Average mood was ${recentMood.mood}/5 and average energy ${recentMood.energy}/5.`
    : "";
  return `${symPart}${moodPart} See the sections below for detail.`;
}

export default function JessPatientSummary({ user, profile, checkins, symptoms }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const triedRef = useRef(false);

  const cacheKey = useMemo(() => {
    if (!user?.id) return null;
    return `jess_gp_summary_${user.id}_${weekKey()}`;
  }, [user?.id]);

  // Pre-compute a tight 7-day digest the agent can chew on.
  const digest = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    const recentC = (checkins || [])
      .filter((c) => {
        const d = c?.date || c?.created_date;
        return d && new Date(d).getTime() >= cutoff;
      })
      .slice(-7);
    const recentS = (symptoms || [])
      .filter((s) => {
        const d = s?.date || s?.created_date;
        return d && new Date(d).getTime() >= cutoff;
      })
      .slice(-20);
    const symCounts = {};
    for (const s of recentS) {
      const k = (s?.symptom_type || s?.symptom_name || "").toString().trim();
      if (!k) continue;
      symCounts[k] = (symCounts[k] || 0) + 1;
    }
    const topSym = Object.entries(symCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([k]) => k);
    const moodVals = recentC.map((c) => Number(c?.mood)).filter((n) => Number.isFinite(n));
    const energyVals = recentC.map((c) => Number(c?.energy ?? c?.energy_level)).filter((n) => Number.isFinite(n));
    const sleepVals = recentC.map((c) => Number(c?.sleep_hours ?? c?.sleepHours)).filter((n) => Number.isFinite(n));
    const avg = (arr) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null);
    return {
      checkinCount: recentC.length,
      symptomCount: recentS.length,
      topSym,
      mood: avg(moodVals),
      energy: avg(energyVals),
      sleep: avg(sleepVals),
    };
  }, [checkins, symptoms]);

  useEffect(() => {
    if (!cacheKey || triedRef.current) return;
    triedRef.current = true;

    const cached = loadDailyCache(cacheKey);
    if (cached?.summary) { setSummary(cached.summary); return; }

    runAgent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  function runAgent() {
    if (!cacheKey || loading) return;
    const fb = fallbackSummary({
      recentSym: digest.topSym,
      recentMood: digest.mood != null ? { mood: digest.mood, energy: digest.energy ?? "—" } : null,
    });

    // If we have basically no data, render the fallback and skip the call.
    if (digest.checkinCount === 0 && digest.symptomCount === 0) {
      setSummary(fb);
      saveDailyCache(cacheKey, { summary: fb });
      return;
    }

    setLoading(true);

    const system =
      "You are Jess, a UK-based women's wellness companion drafting a clinical-tone summary the user " +
      "can share with their GP or nurse. Output rules: " +
      "(1) two or three sentences, max 380 characters total; " +
      "(2) neutral clinical register — third person, plain English, no first person, no exclamation marks; " +
      "(3) report only what is in the data — counts, averages, frequencies; " +
      "(4) never name or imply a diagnosis, never recommend treatment, never give medical advice; " +
      "(5) do not use the word 'cycle' alone — say 'menstrual cycle' if needed; " +
      "(6) end with a sentence pointing the clinician to the data sections below; " +
      "(7) no preambles, no sign-offs, no quotation marks.";

    const userPrompt =
      `Life stage: ${profile?.life_stage || "reproductive"}.\n` +
      `Conditions on file: ${(profile?.condition_flags || []).join(", ") || "none recorded"}.\n` +
      `Last 7 days digest:\n` +
      `- check-ins logged: ${digest.checkinCount}\n` +
      `- symptom events logged: ${digest.symptomCount}\n` +
      `- top symptoms by frequency: ${digest.topSym.join(", ") || "none"}\n` +
      `- average mood: ${digest.mood ?? "n/a"}/5\n` +
      `- average energy: ${digest.energy ?? "n/a"}/5\n` +
      `- average sleep: ${digest.sleep ?? "n/a"} hours\n\n` +
      `Draft the summary.`;

    callJessAgent({ system, user: userPrompt })
      .then(({ text }) => {
        setLoading(false);
        const cleaned = String(text || "")
          .trim()
          .replace(/^["']|["']$/g, "");
        const final = cleaned && cleaned.length > 20 ? cleaned : fb;
        setSummary(final);
        saveDailyCache(cacheKey, { summary: final });
      })
      .catch(() => {
        setLoading(false);
        setSummary(fb);
        saveDailyCache(cacheKey, { summary: fb });
      });
  }

  function handleCopy() {
    if (!summary) return;
    const text = `${summary}\n\nNot medical advice. Generated by FemWell.`;
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* swallow */ }
  }

  function handleRefresh() {
    if (cacheKey && typeof window !== "undefined") {
      try { window.localStorage.removeItem(cacheKey); } catch { /* swallow */ }
    }
    triedRef.current = false;
    setSummary("");
    runAgent();
  }

  return (
    <article style={{
      background: "var(--surface, #FBF6E6)",
      border: "1px solid var(--border, #E8E2D2)",
      borderLeft: "3px solid #D4AF37",
      borderRadius: 14,
      padding: "14px 14px 12px",
      marginBottom: 16,
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={14} style={{ color: "#A6862B" }} aria-hidden />
          <p style={{
            margin: 0, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: "#A6862B", fontFamily: "'Inter', sans-serif",
          }}>Jess · Summary for your clinician</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          aria-label="Regenerate summary"
          style={{
            width: 28, height: 28, borderRadius: 9999,
            background: "transparent",
            border: "1px solid rgba(166,134,43,0.40)",
            color: "#A6862B", cursor: loading ? "default" : "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: 0, opacity: loading ? 0.55 : 1,
          }}
        >
          <RefreshCw
            size={13}
            style={loading ? { animation: "jess-summary-spin 900ms linear infinite" } : undefined}
          />
        </button>
      </div>
      <p style={{
        margin: 0, fontSize: 14, color: "var(--plum, #3A2C1A)",
        fontFamily: "'Inter', sans-serif", lineHeight: 1.55,
      }}>
        {loading && !summary ? (
          <span style={{ color: "#9B8B7A", fontStyle: "italic" }}>
            Drafting your 7-day summary…
          </span>
        ) : (summary || "—")}
      </p>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8,
      }}>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!summary || loading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 9999,
            background: "#3A2C1A", color: "#F4EDDB",
            border: "none", cursor: summary && !loading ? "pointer" : "default",
            fontSize: 13, fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            opacity: summary && !loading ? 1 : 0.55,
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy to clipboard"}
        </button>
        <p style={{
          margin: 0, fontSize: 10, color: "#9B8B7A", fontStyle: "italic",
          fontFamily: "'Inter', sans-serif", textAlign: "right",
        }}>Not medical advice.</p>
      </div>
      <style>{`
        @keyframes jess-summary-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </article>
  );
}

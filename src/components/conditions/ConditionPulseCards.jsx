import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { differenceInDays, parseISO, subMonths, format } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine,
} from "recharts";
import { getLatestPrediction, computeAdaptivePrediction, computeFertilityStatus } from "@/lib/adaptivePrediction";

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 20, boxShadow: "var(--shadow-sm)", padding: 20, marginBottom: 16,
};
const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

// ── PCOS insights ─────────────────────────────────────────────────────────────
function PCOSInsights({ userId, cycleEvents }) {
  const periodStarts = cycleEvents
    .filter(e => e.type === "PeriodStart")
    .map(e => e.date).sort();

  const last3Months = subMonths(new Date(), 3).toISOString().split("T")[0];
  const recentStarts = periodStarts.filter(d => d >= last3Months);

  const cycleLengths = [];
  for (let i = 1; i < periodStarts.length; i++) {
    const len = differenceInDays(parseISO(periodStarts[i]), parseISO(periodStarts[i - 1]));
    if (len >= 15 && len <= 90) cycleLengths.push(len);
  }

  const irregularCount = cycleLengths.filter(l => l < 21 || l > 35).length;
  const minLen = cycleLengths.length ? Math.min(...cycleLengths) : null;
  const maxLen = cycleLengths.length ? Math.max(...cycleLengths) : null;

  if (recentStarts.length < 2 && cycleLengths.length === 0) return null;

  return (
    <div style={card}>
      <p style={{ ...sLabel, marginBottom: 10, color: "var(--rose-dust)" }}>PCOS cycle patterns</p>
      {cycleLengths.length >= 2 && (
        <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 8 }}>
          Your cycle range over logged history: {minLen} to {maxLen} days.
          {irregularCount > 0 ? ` ${irregularCount} irregular cycle${irregularCount > 1 ? "s" : ""} logged.` : " Cycles within standard range."}
        </p>
      )}
      {recentStarts.length < 3 && (
        <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.55 }}>
          Irregular cycles are expected with PCOS. Keep logging period starts to see your personal pattern emerge.
        </p>
      )}
    </div>
  );
}

// ── PMDD severity chart ───────────────────────────────────────────────────────
function PMDDChart({ userId, cycleEvents }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const cutoff = subMonths(new Date(), 3).toISOString().split("T")[0];
    base44.entities.SymptomLogs.filter({ user_id: userId })
      .then(logs => {
        const pmddLogs = logs.filter(l => l.symptom_type === "PMDD Severity" && l.date >= cutoff);
        const periodStarts = cycleEvents.filter(e => e.type === "PeriodStart").map(e => e.date).sort();
        const data = pmddLogs.map(l => {
          const past = periodStarts.filter(d => d <= l.date);
          const lastStart = past[past.length - 1];
          const cDay = lastStart ? differenceInDays(parseISO(l.date), parseISO(lastStart)) + 1 : null;
          return { label: format(parseISO(l.date), "MMM d"), severity: l.severity, cycleDay: cDay };
        }).sort((a, b) => a.label.localeCompare(b.label));
        setScores(data);
      }).catch(() => {});
  }, [userId]);

  if (scores.length < 3) return null;

  return (
    <div style={card}>
      <p style={{ ...sLabel, marginBottom: 4, color: "var(--mauve)" }}>PMDD severity</p>
      <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 14 }}>Last 3 months — daily severity score</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={scores} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: "var(--mauve)", fontFamily: "'Inter', sans-serif" }} interval="preserveStartEnd" />
          <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: "var(--mauve)", fontFamily: "'Inter', sans-serif" }} />
          <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, border: "1px solid var(--border)" }} formatter={(v) => [v, "Severity"]} />
          <ReferenceLine y={7} stroke="var(--rose-dust)" strokeDasharray="4 2" label={{ value: "7", fontSize: 9, fill: "var(--rose-dust)" }} />
          <Line type="monotone" dataKey="severity" stroke="var(--mauve)" strokeWidth={2} dot={{ r: 2, fill: "var(--mauve)" }} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 8 }}>Dashed line at 7 — consider speaking with a specialist if scores regularly exceed this.</p>
    </div>
  );
}

// ── Perimenopause score ───────────────────────────────────────────────────────
function PerimenopauseScore({ userId }) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    const cutoff = subMonths(new Date(), 1).toISOString().split("T")[0];
    const PERI_TYPES = ["Hot Flash", "Night Sweats", "Brain Fog", "Joint Pain"];
    base44.entities.SymptomLogs.filter({ user_id: userId })
      .then(logs => {
        const peri = logs.filter(l => PERI_TYPES.some(t => l.symptom_type?.includes(t)) && l.date >= cutoff);
        if (!peri.length) return;
        const avg = peri.reduce((s, l) => s + (l.severity || 0), 0) / peri.length;
        setScore(Math.round(avg * 10) / 10);
      }).catch(() => {});
  }, [userId]);

  if (score === null) return null;

  return (
    <div style={{ ...card, backgroundColor: "var(--ivory-dark)", borderColor: "var(--border-subtle)" }}>
      <p style={{ ...sLabel, marginBottom: 8 }}>Perimenopause index</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>{score} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>/ 10</span></p>
      <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>Average symptom severity across last 30 days of logged perimenopausal symptoms.</p>
    </div>
  );
}

// ── Endo pain insight ─────────────────────────────────────────────────────────
function EndoPainInsight({ userId, cycleEvents }) {
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    const cutoff = subMonths(new Date(), 3).toISOString().split("T")[0];
    const periodStarts = cycleEvents.filter(e => e.type === "PeriodStart").map(e => e.date).sort();
    base44.entities.PainMap.filter({ user_id: userId }).then(logs => {
      const recent = logs.filter(l => l.date >= cutoff);
      if (recent.length < 5) return;
      const byPhase = { menstrual: [], follicular: [], ovulatory: [], luteal: [] };
      for (const l of recent) {
        const past = periodStarts.filter(d => d <= l.date);
        const lastStart = past[past.length - 1];
        if (!lastStart) continue;
        const cDay = differenceInDays(parseISO(l.date), parseISO(lastStart)) + 1;
        const phase = cDay <= 5 ? "menstrual" : cDay <= 13 ? "follicular" : cDay <= 16 ? "ovulatory" : "luteal";
        byPhase[phase].push(l.severity || 0);
      }
      const avgs = Object.entries(byPhase).filter(([, v]) => v.length > 0).map(([k, v]) => ({ phase: k, avg: v.reduce((a, b) => a + b, 0) / v.length }));
      if (!avgs.length) return;
      avgs.sort((a, b) => b.avg - a.avg);
      setInsight({ worst: avgs[0], count: recent.length, cycles: periodStarts.length });
    }).catch(() => {});
  }, [userId]);

  if (!insight) return null;

  return (
    <div style={card}>
      <p style={{ ...sLabel, marginBottom: 8, color: "var(--rose-dust)" }}>Endometriosis pain patterns</p>
      <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
        Your pain tends to be highest during your <strong>{insight.worst.phase}</strong> phase — logged across {insight.count} entries.
        {insight.cycles >= 2 && ` Based on ${insight.cycles} logged cycles.`}
      </p>
    </div>
  );
}

// ── Fertility chart ───────────────────────────────────────────────────────────
function FertilityPulseChart({ userId, profile }) {
  const [bbtData, setBbtData] = useState([]);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const cutoff = subMonths(new Date(), 3).toISOString().split("T")[0];
    Promise.all([
      base44.entities.FertileWindowLog.filter({ user_id: userId }),
      getLatestPrediction(userId),
    ]).then(([logs, pred]) => {
      const filtered = logs.filter(l => l.date >= cutoff && l.bbt_celsius).sort((a, b) => a.date.localeCompare(b.date));
      setBbtData(filtered.map(l => ({
        label: format(parseISO(l.date), "MMM d"),
        bbt: l.bbt_celsius,
        date: l.date,
      })));
      setPrediction(pred);
    }).catch(() => {});
  }, [userId]);

  if (bbtData.length < 3) return null;

  const ovulationDate = prediction?.ovulation_predicted_date;
  const fertileStart = prediction?.fertile_window_start;
  const fertileEnd = prediction?.fertile_window_end;

  return (
    <div style={card}>
      <p style={{ ...sLabel, marginBottom: 4 }}>Basal body temperature</p>
      <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 14 }}>3-month chart — degrees Celsius</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={bbtData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: "var(--mauve)" }} interval="preserveStartEnd" />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "var(--mauve)" }} />
          <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} formatter={(v) => [`${v}°C`, "BBT"]} />
          {ovulationDate && (
            <ReferenceLine
              x={format(parseISO(ovulationDate), "MMM d")}
              stroke="var(--rose-dust)"
              strokeDasharray="4 2"
              label={{ value: "Ov", fontSize: 9, fill: "var(--rose-dust)" }}
            />
          )}
          <Line type="monotone" dataKey="bbt" stroke="var(--sage)" strokeWidth={2} dot={{ r: 2, fill: "var(--sage)" }} />
        </LineChart>
      </ResponsiveContainer>
      {fertileStart && fertileEnd && (
        <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 8 }}>
          Predicted fertile window: {format(parseISO(fertileStart), "MMM d")} – {format(parseISO(fertileEnd), "MMM d")}
        </p>
      )}
    </div>
  );
}

// ── Cycle patterns card ───────────────────────────────────────────────────────
function CyclePatternsCard({ userId, profile, cycleEvents }) {
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (!userId) return;
    getLatestPrediction(userId).then(pred => {
      if (pred) { setPrediction(pred); return; }
      computeAdaptivePrediction(userId, profile?.cycle_avg_length || 28).then(setPrediction).catch(() => {});
    });
  }, [userId]);

  const periodStarts = cycleEvents.filter(e => e.type === "PeriodStart").map(e => e.date).sort();
  const lengths = [];
  for (let i = 1; i < periodStarts.length; i++) {
    const l = differenceInDays(parseISO(periodStarts[i]), parseISO(periodStarts[i - 1]));
    if (l >= 15 && l <= 90) lengths.push(l);
  }
  const minLen = lengths.length ? Math.min(...lengths) : null;
  const maxLen = lengths.length ? Math.max(...lengths) : null;
  const avgLen = lengths.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : (profile?.cycle_avg_length || null);

  if (!prediction && !avgLen) return null;

  const confidenceLabel = prediction?.confidence === "high" ? "High confidence" : prediction?.confidence === "medium" ? "Estimated" : "Low data";
  const nextDateStr = prediction?.period_start_predicted
    ? format(parseISO(prediction.period_start_predicted), "d MMM yyyy")
    : null;

  return (
    <div style={card}>
      <p style={{ ...sLabel, marginBottom: 10 }}>Cycle patterns</p>
      <div className="grid grid-cols-2 gap-3">
        {minLen && maxLen && (
          <div style={{ backgroundColor: "var(--ivory-dark)", borderRadius: 12, padding: "10px 14px" }}>
            <p style={{ fontSize: 10, color: "var(--mauve)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>Range (6 months)</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif", marginTop: 2 }}>{minLen}–{maxLen}d</p>
          </div>
        )}
        {avgLen && (
          <div style={{ backgroundColor: "var(--ivory-dark)", borderRadius: 12, padding: "10px 14px" }}>
            <p style={{ fontSize: 10, color: "var(--mauve)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>Average</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif", marginTop: 2 }}>{avgLen}d</p>
          </div>
        )}
        {nextDateStr && (
          <div style={{ backgroundColor: "var(--rose-dust-subtle)", borderRadius: 12, padding: "10px 14px", gridColumn: "span 2" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 10, color: "var(--rose-dust)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>Predicted next period</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>{nextDateStr} <span style={{ fontSize: 11, color: "var(--mauve)" }}>(±2 days)</span></p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--rose-dust)", backgroundColor: "rgba(196,132,154,0.15)", borderRadius: 9999, padding: "2px 8px", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
                {confidenceLabel}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ConditionPulseCards({ userId, profile, checkins, cycleEvents }) {
  const flags = profile?.condition_flags || [];
  const lifeStage = profile?.life_stage || "none";
  const hasPCOS = flags.includes("pcos");
  const hasEndo = flags.includes("endometriosis");
  const hasPMDD = flags.includes("pmdd");
  const hasPeri = flags.includes("perimenopause") || lifeStage === "menopause";
  const isTTC = lifeStage === "ttc";

  if (!hasPCOS && !hasEndo && !hasPMDD && !hasPeri && !isTTC) return null;

  return (
    <div>
      <CyclePatternsCard userId={userId} profile={profile} cycleEvents={cycleEvents} />
      {hasPCOS && <PCOSInsights userId={userId} cycleEvents={cycleEvents} />}
      {hasEndo && <EndoPainInsight userId={userId} cycleEvents={cycleEvents} />}
      {hasPMDD && <PMDDChart userId={userId} cycleEvents={cycleEvents} />}
      {hasPeri && <PerimenopauseScore userId={userId} />}
      {isTTC && <FertilityPulseChart userId={userId} profile={profile} />}
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { differenceInDays, subDays, parseISO, format } from "date-fns";
import { createPageUrl } from "@/utils";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from "recharts";

// ── Design tokens ────────────────────────────────────────────────────────────
const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "20px",
  boxShadow: "var(--shadow-sm)",
  padding: "1.25rem",
};

const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

// ── Phase config ─────────────────────────────────────────────────────────────
const PHASES = ["menstrual", "follicular", "ovulatory", "luteal"];
const PHASE_COLORS = {
  menstrual: "#C4849A",
  follicular: "#7A9E8E",
  ovulatory: "#B89E6A",
  luteal: "#8A7E88",
};
const PHASE_LABELS = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};
const PHASE_BRIEF_SKIN = {
  menstrual: {
    headline: "Menstrual Phase",
    tip: "Oestrogen and progesterone are at their lowest — your skin barrier is compromised. Stick to a gentle hydrating cleanser and ceramide moisturiser. Avoid actives and exfoliants this week.",
  },
  follicular: {
    headline: "Follicular Phase",
    tip: "Rising oestrogen means your skin is at its most resilient and radiant. This is the best window to introduce Vitamin C serums or retinoids. Collagen production is peaking — lean into it.",
  },
  ovulatory: {
    headline: "Ovulatory Phase",
    tip: "Peak oestrogen gives a natural glow, but a testosterone spike can trigger oiliness and chin breakouts. Switch to an oil-free moisturiser and consider a light BHA toner to manage sebum.",
  },
  luteal: {
    headline: "Luteal Phase",
    tip: "Progesterone drives sebum production — expect oilier skin and potential cystic breakouts around the chin and jaw. Niacinamide and salicylic acid spot treatments are your best allies now.",
  },
};
const PHASE_BRIEF_HAIR = {
  menstrual: {
    headline: "Menstrual Phase",
    tip: "Low oestrogen makes strands more brittle and the scalp more sensitive. Avoid tight styles, reduce heat, and opt for a deeply hydrating mask. More shedding than usual is normal and expected.",
  },
  follicular: {
    headline: "Follicular Phase",
    tip: "High oestrogen extends the growth phase — this is your strongest hair week. The best time to deep condition, colour, or try a new cut. Take advantage of the resilience while it lasts.",
  },
  ovulatory: {
    headline: "Ovulatory Phase",
    tip: "A testosterone spike drives an oily scalp around ovulation. Roots may feel limp. Use a scalp-refreshing dry shampoo or a clarifying wash, and don't skip your conditioning step on the lengths.",
  },
  luteal: {
    headline: "Luteal Phase",
    tip: "Dropping hormones reduce moisture retention — frizz and dryness increase, and shedding upticks premenstrually. Layer a sealing product over your leave-in to lock in moisture and protect ends.",
  },
};

// ── Cycle phase helpers ───────────────────────────────────────────────────────
function getPhaseFromDay(cycleDay, cycleLen) {
  if (cycleDay <= 5) return "menstrual";
  if (cycleDay <= Math.round(cycleLen * 0.4)) return "follicular";
  if (cycleDay <= Math.round(cycleLen * 0.55)) return "ovulatory";
  return "luteal";
}

function getCurrentPhase(lastPeriodDate, cycleLen = 28) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = parseISO(lastPeriodDate);
  const diff = differenceInDays(today, last);
  const cycleDay = (diff % cycleLen) + 1;
  return getPhaseFromDay(cycleDay, cycleLen);
}

function getCheckinPhase(dateStr, lastPeriodDate, cycleLen = 28) {
  if (!lastPeriodDate) return null;
  const d = parseISO(dateStr);
  const last = parseISO(lastPeriodDate);
  const diff = differenceInDays(d, last);
  if (diff < 0) return null;
  const cycleDay = (diff % cycleLen) + 1;
  return getPhaseFromDay(cycleDay, cycleLen);
}

// ── Scoring helpers ───────────────────────────────────────────────────────────
function skinConditionScore(val) {
  if (!val) return null;
  const v = val.toLowerCase();
  if (v.includes("clear") || v.includes("glow")) return 5;
  if (v === "normal") return 4;
  if (v.includes("mild") || v.includes("very oily")) return 3;
  if (v.includes("moderate") || v.includes("very dry")) return 2;
  return null;
}

function hairSheddingScore(val) {
  if (!val) return null;
  if (val === "Normal") return 1;
  if (val === "More than usual") return 2;
  if (val === "A lot") return 3;
  return null;
}

const SKIN_CONDITION_COLORS = {
  "Clear": { bg: "var(--sage-subtle)", color: "var(--sage)" },
  "Glowing": { bg: "var(--sage-subtle)", color: "var(--sage)" },
  "Normal": { bg: "var(--ivory-dark)", color: "var(--mauve)" },
  "Mild breakout": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  "Very oily": { bg: "var(--mauve-subtle)", color: "var(--mauve)" },
  "Moderate breakout": { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" },
  "Very dry": { bg: "var(--mauve-subtle)", color: "var(--mauve)" },
};

function conditionPillStyle(val) {
  if (!val) return { bg: "var(--ivory-dark)", color: "var(--mauve)" };
  for (const [k, v] of Object.entries(SKIN_CONDITION_COLORS)) {
    if (val.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return { bg: "var(--ivory-dark)", color: "var(--mauve)" };
}

function sheddingPillStyle(val) {
  if (val === "Normal") return { bg: "var(--sage-subtle)", color: "var(--sage)" };
  if (val === "More than usual") return { bg: "var(--mauve-subtle)", color: "var(--mauve)" };
  if (val === "A lot") return { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" };
  return { bg: "var(--ivory-dark)", color: "var(--mauve)" };
}

// ── Phase bar chart component ─────────────────────────────────────────────────
function PhaseBarChart({ data, color }) {
  const chartData = PHASES.map((p) => ({
    phase: PHASE_LABELS[p].slice(0, 3),
    value: data[p] ?? 0,
    fill: PHASE_COLORS[p],
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} barSize={32} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="phase"
          tick={{ fontSize: 11, fill: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            fontSize: "12px",
            fontFamily: "'Inter', sans-serif",
            color: "var(--plum)",
            boxShadow: "var(--shadow-sm)",
          }}
          cursor={{ fill: "var(--ivory-dark)" }}
          formatter={(val) => [val.toFixed(1), ""]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Score line chart ──────────────────────────────────────────────────────────
function ScoreLineChart({ data, color, dataKey, yDomain }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={yDomain}
          tick={{ fontSize: 10, fill: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            fontSize: "12px",
            fontFamily: "'Inter', sans-serif",
            color: "var(--plum)",
            boxShadow: "var(--shadow-sm)",
          }}
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          formatter={(val) => [val, ""]}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Phase brief card ──────────────────────────────────────────────────────────
function PhaseBriefCard({ phase, briefs }) {
  if (!phase) return null;
  const brief = briefs[phase];
  return (
    <div style={{ ...card, backgroundColor: "var(--ivory-dark)", borderColor: "var(--border-subtle)" }}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: PHASE_COLORS[phase] }}
        />
        <p style={{ ...sLabel, color: PHASE_COLORS[phase] }}>{brief.headline}</p>
      </div>
      <p style={{ fontSize: "13px", color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65 }}>
        {brief.tip}
      </p>
    </div>
  );
}

// ── Pattern insight card ──────────────────────────────────────────────────────
function PatternInsightCard({ checkins, profile }) {
  if (!profile?.last_period_start_date) return null;
  const scored = checkins.filter((c) => c.skin_condition).map((c) => ({
    phase: getCheckinPhase(c.date, profile.last_period_start_date, profile.cycle_avg_length || 28),
    score: skinConditionScore(c.skin_condition),
  })).filter((c) => c.phase && c.score);

  if (scored.length < 14) return null;

  const phaseScores = {};
  PHASES.forEach((p) => {
    const vals = scored.filter((c) => c.phase === p).map((c) => c.score);
    phaseScores[p] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  });

  const best = PHASES.filter((p) => phaseScores[p]).sort((a, b) => phaseScores[b] - phaseScores[a])[0];
  const worst = PHASES.filter((p) => phaseScores[p]).sort((a, b) => phaseScores[a] - phaseScores[b])[0];

  // Chin/jaw dominance
  const breakoutCounts = {};
  checkins.forEach((c) => {
    if (Array.isArray(c.breakout_location)) {
      c.breakout_location.forEach((loc) => {
        breakoutCounts[loc] = (breakoutCounts[loc] || 0) + 1;
      });
    }
  });
  const totalBreakouts = Object.values(breakoutCounts).reduce((a, b) => a + b, 0);
  const chinJawCount = (breakoutCounts["Chin"] || 0) + (breakoutCounts["Jawline"] || 0);
  const isHormonal = totalBreakouts > 0 && chinJawCount / totalBreakouts > 0.6;

  return (
    <div style={{ ...card, borderColor: "var(--rose-dust-light)", backgroundColor: "var(--rose-dust-subtle)" }}>
      <p style={{ ...sLabel, color: "var(--rose-dust)", marginBottom: "8px" }}>Pattern insight</p>
      <p style={{ fontSize: "13px", color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.65 }}>
        {best && worst
          ? `Your skin tends to be clearest in your ${PHASE_LABELS[best].toLowerCase()} phase and most reactive in your ${PHASE_LABELS[worst].toLowerCase()} phase.`
          : "Keep logging to reveal your personal skin pattern."}
        {isHormonal && " Chin and jaw breakouts dominate your logs — a pattern consistent with androgen-driven hormonal acne."}
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SkinHair() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState("skin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, allCheckins] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }),
        base44.entities.DailyCheckins.filter({ user_id: u.id }, "-date", 200),
      ]);
      setProfile(profiles[0] || null);
      const cutoff = subDays(new Date(), 90).toISOString().split("T")[0];
      setCheckins(allCheckins.filter((c) => c.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date)));
      setLoading(false);
    })();
  }, []);

  const currentPhase = profile?.last_period_start_date
    ? getCurrentPhase(profile.last_period_start_date, profile.cycle_avg_length || 28)
    : null;

  const cutoffDate = subDays(new Date(), timeRange).toISOString().split("T")[0];
  const filtered = checkins.filter((c) => c.date >= cutoffDate);

  const hasSkinData = filtered.some((c) => c.skin_condition || c.skin);
  const hasHairData = filtered.some((c) => c.hair_shedding);
  const hasAnyData = hasSkinData || hasHairData;

  // ── Skin phase averages ──
  const skinPhaseData = {};
  if (profile?.last_period_start_date) {
    const byPhase = {};
    PHASES.forEach((p) => { byPhase[p] = []; });
    filtered.forEach((c) => {
      const score = skinConditionScore(c.skin_condition);
      const phase = getCheckinPhase(c.date, profile.last_period_start_date, profile.cycle_avg_length || 28);
      if (score && phase) byPhase[phase].push(score);
    });
    PHASES.forEach((p) => {
      const vals = byPhase[p];
      skinPhaseData[p] = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
    });
  }

  // ── Hair phase averages ──
  const hairPhaseData = {};
  if (profile?.last_period_start_date) {
    const byPhase = {};
    PHASES.forEach((p) => { byPhase[p] = []; });
    filtered.forEach((c) => {
      const score = hairSheddingScore(c.hair_shedding);
      const phase = getCheckinPhase(c.date, profile.last_period_start_date, profile.cycle_avg_length || 28);
      if (score && phase) byPhase[phase].push(score);
    });
    PHASES.forEach((p) => {
      const vals = byPhase[p];
      hairPhaseData[p] = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
    });
  }

  // ── Skin line data ──
  const skinLineData = filtered
    .filter((c) => c.skin != null)
    .map((c) => ({ label: format(parseISO(c.date), "d MMM"), value: c.skin, date: c.date }));

  // ── Hair line data ──
  const hairLineData = filtered
    .filter((c) => c.hair_shedding)
    .map((c) => ({ label: format(parseISO(c.date), "d MMM"), value: hairSheddingScore(c.hair_shedding), date: c.date }));

  // ── Breakout location map ──
  const breakoutCounts = {};
  filtered.forEach((c) => {
    if (Array.isArray(c.breakout_location)) {
      c.breakout_location.forEach((loc) => {
        breakoutCounts[loc] = (breakoutCounts[loc] || 0) + 1;
      });
    }
  });
  const maxBreakout = Math.max(...Object.values(breakoutCounts), 1);
  const breakoutEntries = Object.entries(breakoutCounts).sort((a, b) => b[1] - a[1]);
  const totalBreakouts = Object.values(breakoutCounts).reduce((a, b) => a + b, 0);
  const chinJawCount = (breakoutCounts["Chin"] || 0) + (breakoutCounts["Jawline"] || 0);
  const showHormonalCallout = totalBreakouts > 0 && chinJawCount / totalBreakouts > 0.6;

  // ── Scalp condition breakdown ──
  const scalpCounts = { Normal: 0, Oily: 0, "Dry/flaky": 0 };
  filtered.forEach((c) => {
    if (c.scalp_condition && scalpCounts[c.scalp_condition] !== undefined) {
      scalpCounts[c.scalp_condition]++;
    }
  });
  const totalScalp = Object.values(scalpCounts).reduce((a, b) => a + b, 0);

  // ── Summary stats ──
  const daysLogged = filtered.filter((c) => c.skin_condition || c.hair_shedding).length;
  const skinConditionMode = (() => {
    const freq = {};
    filtered.forEach((c) => { if (c.skin_condition) freq[c.skin_condition] = (freq[c.skin_condition] || 0) + 1; });
    const entries = Object.entries(freq);
    if (!entries.length) return "—";
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  })();
  const worstHairPhase = PHASES.filter((p) => hairPhaseData[p] > 0).sort((a, b) => hairPhaseData[b] - hairPhaseData[a])[0];
  const bestSkinPhase = PHASES.filter((p) => skinPhaseData[p] > 0).sort((a, b) => skinPhaseData[b] - skinPhaseData[a])[0];

  // ── Recent skin log ──
  const recentSkinLog = [...filtered].filter((c) => c.skin_condition).reverse().slice(0, 14);
  const recentHairLog = [...filtered].filter((c) => c.hair_shedding).reverse().slice(0, 14);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>

      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 pt-10 pb-4"
        style={{
          backgroundColor: "rgba(250,248,245,0.97)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
        }}
      >
        <p style={sLabel} className="mb-1">Skin & Hair</p>
        <div className="flex items-center justify-between gap-3">
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--plum)",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Your Glow Tracker
          </h1>
          {currentPhase && (
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
              style={{
                backgroundColor: `${PHASE_COLORS[currentPhase]}20`,
                color: PHASE_COLORS[currentPhase],
                border: `1px solid ${PHASE_COLORS[currentPhase]}50`,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {PHASE_LABELS[currentPhase]}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Days logged", value: daysLogged || "—" },
            { label: `Most common (${timeRange}d)`, value: skinConditionMode },
            { label: "Most hair shedding", value: worstHairPhase ? PHASE_LABELS[worstHairPhase] : "—" },
            { label: "Best skin phase", value: bestSkinPhase ? PHASE_LABELS[bestSkinPhase] : "—" },
          ].map((stat) => (
            <div key={stat.label} style={{ ...card, padding: "14px" }}>
              <p style={sLabel} className="mb-1">{stat.label}</p>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--plum)",
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tab + time range controls */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1 p-1 rounded-[14px]" style={{ backgroundColor: "var(--ivory-dark)" }}>
            {["skin", "hair"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold capitalize transition-all"
                style={{
                  backgroundColor: activeTab === tab ? "var(--plum)" : "transparent",
                  color: activeTab === tab ? "white" : "var(--mauve)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 rounded-[14px] self-end" style={{ backgroundColor: "var(--ivory-dark)" }}>
            {[30, 60, 90].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className="px-4 py-1.5 rounded-[10px] text-xs font-semibold transition-all"
                style={{
                  backgroundColor: timeRange === r ? "var(--plum)" : "transparent",
                  color: timeRange === r ? "white" : "var(--mauve)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        {/* ── Empty state ── */}
        {!hasAnyData && (
          <div style={{ ...card, padding: "3rem 1.5rem", textAlign: "center" }}>
            <div
              className="w-10 h-10 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "var(--rose-dust-subtle)" }}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "var(--rose-dust)" }} />
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px",
                color: "var(--plum)",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              No skin & hair data yet
            </h3>
            <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
              Log your skin condition and hair shedding in the daily check-in to see your trends here.
            </p>
            <a
              href={createPageUrl("Today")}
              className="inline-block mt-5 text-sm font-semibold"
              style={{
                backgroundColor: "var(--plum)",
                color: "white",
                borderRadius: "12px",
                padding: "12px 24px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Go to check-in
            </a>
          </div>
        )}

        {/* ── SKIN TAB ── */}
        {hasAnyData && activeTab === "skin" && (
          <div className="space-y-4">

            {/* Phase brief */}
            <PhaseBriefCard phase={currentPhase} briefs={PHASE_BRIEF_SKIN} />

            {/* Phase correlation */}
            <div style={card}>
              <p style={sLabel} className="mb-3">Skin clarity by phase</p>
              {Object.values(skinPhaseData).some((v) => v > 0) ? (
                <PhaseBarChart data={skinPhaseData} />
              ) : (
                <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  Not enough data yet for this period.
                </p>
              )}
              <p style={{ fontSize: "11px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "8px" }}>
                Higher score = clearer skin in that phase
              </p>
            </div>

            {/* Skin score over time */}
            {skinLineData.length >= 3 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Skin score over time</p>
                <ScoreLineChart data={skinLineData} color="#C4849A" dataKey="value" yDomain={[0, 5]} />
              </div>
            )}

            {/* Pattern insight */}
            <PatternInsightCard checkins={filtered} profile={profile} />

            {/* Breakout location map */}
            {breakoutEntries.length > 0 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Breakout locations</p>
                <div className="space-y-2.5">
                  {breakoutEntries.map(([loc, count]) => (
                    <div key={loc}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                          {loc}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                          {count}x
                        </span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "var(--ivory-dark)", borderRadius: "3px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${(count / maxBreakout) * 100}%`,
                            backgroundColor: "var(--rose-dust)",
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {showHormonalCallout && (
                  <div
                    className="mt-3 rounded-xl p-3"
                    style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}
                  >
                    <p style={{ fontSize: "12px", color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                      Chin and jaw account for over 60% of your logged breakouts — a pattern strongly associated with androgen-driven hormonal acne.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recent skin log */}
            {recentSkinLog.length > 0 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Recent skin log</p>
                <div className="space-y-2">
                  {recentSkinLog.map((c) => {
                    const pill = conditionPillStyle(c.skin_condition);
                    return (
                      <div
                        key={c.id || c.date}
                        className="flex items-center justify-between gap-3 rounded-[14px] px-4 py-3"
                        style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}
                      >
                        <span style={{ fontSize: "12px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
                          {format(parseISO(c.date), "d MMM")}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: pill.bg, color: pill.color, fontFamily: "'Inter', sans-serif" }}
                          >
                            {c.skin_condition}
                          </span>
                          {c.skin && (
                            <span
                              className="text-xs font-semibold px-2 py-1 rounded-full"
                              style={{ backgroundColor: "var(--ivory-dark)", color: "var(--plum)", fontFamily: "'Inter', sans-serif", border: "1px solid var(--border)" }}
                            >
                              {c.skin}/5
                            </span>
                          )}
                          {Array.isArray(c.breakout_location) && c.breakout_location.map((loc) => (
                            <span
                              key={loc}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}
                            >
                              {loc}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HAIR TAB ── */}
        {hasAnyData && activeTab === "hair" && (
          <div className="space-y-4">

            {/* Phase brief */}
            <PhaseBriefCard phase={currentPhase} briefs={PHASE_BRIEF_HAIR} />

            {/* Hair phase correlation */}
            <div style={card}>
              <p style={sLabel} className="mb-3">Hair shedding by phase</p>
              {Object.values(hairPhaseData).some((v) => v > 0) ? (
                <PhaseBarChart data={hairPhaseData} />
              ) : (
                <p style={{ fontSize: "13px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  Not enough data yet for this period.
                </p>
              )}
              <p style={{ fontSize: "11px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: "8px" }}>
                Higher bar = more shedding in that phase
              </p>
            </div>

            {/* Hair shedding over time */}
            {hairLineData.length >= 3 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Shedding over time</p>
                <ScoreLineChart data={hairLineData} color="#7A9E8E" dataKey="value" yDomain={[0, 3]} />
              </div>
            )}

            {/* Scalp condition breakdown */}
            {totalScalp > 0 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Scalp condition</p>
                <div className="space-y-2.5">
                  {Object.entries(scalpCounts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([cond, count]) => (
                    <div key={cond}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                          {cond}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                          {count}x · {Math.round((count / totalScalp) * 100)}%
                        </span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "var(--ivory-dark)", borderRadius: "3px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${(count / totalScalp) * 100}%`,
                            backgroundColor: "var(--sage)",
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {scalpCounts["Oily"] > 0 && (
                  <div
                    className="mt-3 rounded-xl p-3"
                    style={{ backgroundColor: "var(--mauve-subtle)", border: "1px solid var(--mauve-light)" }}
                  >
                    <p style={{ fontSize: "12px", color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                      Oily scalp days are expected around ovulation due to a testosterone surge — this is a normal hormonal pattern, not a product issue.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recent hair log */}
            {recentHairLog.length > 0 && (
              <div style={card}>
                <p style={sLabel} className="mb-3">Recent hair log</p>
                <div className="space-y-2">
                  {recentHairLog.map((c) => {
                    const pill = sheddingPillStyle(c.hair_shedding);
                    const scalpPill =
                      c.scalp_condition === "Oily"
                        ? { bg: "var(--mauve-subtle)", color: "var(--mauve)" }
                        : c.scalp_condition === "Dry/flaky"
                        ? { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }
                        : { bg: "var(--sage-subtle)", color: "var(--sage)" };
                    return (
                      <div
                        key={c.id || c.date}
                        className="flex items-center justify-between gap-3 rounded-[14px] px-4 py-3"
                        style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}
                      >
                        <span style={{ fontSize: "12px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
                          {format(parseISO(c.date), "d MMM")}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: pill.bg, color: pill.color, fontFamily: "'Inter', sans-serif" }}
                          >
                            {c.hair_shedding}
                          </span>
                          {c.scalp_condition && (
                            <span
                              className="text-xs px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: scalpPill.bg, color: scalpPill.color, fontFamily: "'Inter', sans-serif" }}
                            >
                              {c.scalp_condition}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
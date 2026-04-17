import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { subMonths, parseISO, differenceInDays, format } from "date-fns";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import HealthOverviewSection from "../components/trends/HealthOverviewSection";
import AIHealthSummaryCard from "../components/trends/AIHealthSummaryCard";

// Stress heatmap helpers
const STRESS_COLORS = ["#EBF2EF","#B5CEC5","#E8C4D0","#F5ECF0","#C4849A","#2A2035"];
function stressColor(val) {
  if (!val || val === 0) return STRESS_COLORS[0];
  if (val <= 2) return STRESS_COLORS[1];
  if (val <= 4) return STRESS_COLORS[2];
  if (val <= 6) return STRESS_COLORS[3];
  if (val <= 8) return STRESS_COLORS[4];
  return STRESS_COLORS[5];
}

const PHASES = [
  { key: "Menstrual",  label: "Menstrual",  color: "#f43f5e", days: "Days 1–5"  },
  { key: "Follicular", label: "Follicular", color: "#fb923c", days: "Days 6–13" },
  { key: "Ovulatory",  label: "Ovulatory",  color: "#a78bfa", days: "Days 14–16"},
  { key: "Luteal",     label: "Luteal",     color: "#34d399", days: "Days 17+"  },
];

const CHECKIN_METRICS = [
  { id: "cramps",            label: "Cramps",             color: "#f43f5e" },
  { id: "mood",              label: "Mood",               color: "#f472b6" },
  { id: "energy",            label: "Energy",             color: "#fb923c" },
  { id: "stress",            label: "Stress",             color: "#a78bfa" },
  { id: "bloating",          label: "Bloating",           color: "#6ee7b7" },
  { id: "headache",          label: "Headache",           color: "#93c5fd" },
  { id: "breast_tenderness", label: "Breast Tenderness",  color: "#c084fc" },
  { id: "sleep_quality",     label: "Sleep Quality",      color: "#34d399" },
  { id: "pain",              label: "Pain",               color: "#ef4444" },
];

function getPhase(dayOfCycle) {
  if (!dayOfCycle || dayOfCycle <= 0) return null;
  if (dayOfCycle <= 5)  return "Menstrual";
  if (dayOfCycle <= 13) return "Follicular";
  if (dayOfCycle <= 16) return "Ovulatory";
  return "Luteal";
}

function getDayOfCycle(dateStr, periodStartDates) {
  const date = parseISO(dateStr);
  const pastStarts = periodStartDates
    .map((d) => parseISO(d))
    .filter((d) => d <= date)
    .sort((a, b) => b - a);
  if (!pastStarts.length) return null;
  return differenceInDays(date, pastStarts[0]) + 1;
}

export default function Trends() {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [timeRange, setTimeRange]     = useState(3);
  const [dataSource, setDataSource]   = useState("checkins");
  const [selectedMetric, setSelectedMetric] = useState("cramps");

  const [cycleEvents, setCycleEvents]   = useState([]);
  const [checkins, setCheckins]         = useState([]);
  const [symptomLogs, setSymptomLogs]   = useState([]);
  const [symptomTypes, setSymptomTypes] = useState([]);
  const [habitLogs, setHabitLogs]       = useState([]);
  const [habitNames, setHabitNames]     = useState([]);
  const [correlations, setCorrelations] = useState([]);

  useEffect(() => {
    (async () => {
      try {
      const u = await base44.auth.me();
      setUser(u);
      const cutoff = subMonths(new Date(), 6).toISOString().split("T")[0];

      const [events, ckins, slogs, hlogs, corrs] = await Promise.all([
        base44.entities.CycleEvents.filter({ user_id: u.id }).catch(() => []),
        base44.entities.DailyCheckins.filter({ user_id: u.id }).catch(() => []),
        base44.entities.SymptomLogs.filter({ user_id: u.id }).catch(() => []),
        base44.entities.HabitLogs.filter({ user_id: u.id }, "-date", 250).catch(() => []),
        base44.entities.Correlations.filter({ user_id: u.id }, "-created_date", 5).catch(() => []),
      ]);
      setCorrelations(corrs);

      setCycleEvents(events.filter((e) => e.date >= cutoff));
      setCheckins(ckins.filter((c) => c.date >= cutoff));

      const filtered = slogs.filter((s) => s.date >= cutoff);
      setSymptomLogs(filtered);
      const types = [...new Set(filtered.map((s) => s.symptom_type).filter(Boolean))];
      setSymptomTypes(types);

      const hFiltered = hlogs.filter((h) => h.date >= cutoff);
      setHabitLogs(hFiltered);
      const hNames = [...new Set(hlogs.map((h) => h.habit_type || h.habit_name).filter(Boolean))];
      setHabitNames(hNames);
      } catch (err) {
        console.error("Trends page init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const periodStarts = cycleEvents
    .filter((e) => e.event_type === "period_start")
    .map((e) => e.date)
    .sort();

  const cutoffDate = subMonths(new Date(), timeRange).toISOString().split("T")[0];

  // --- Phase bar chart data ---
  const phaseData = PHASES.map((phase) => {
    let values = [];
    if (dataSource === "checkins") {
      checkins
        .filter((c) => c.date >= cutoffDate && c[selectedMetric] != null)
        .forEach((c) => {
          const day = getDayOfCycle(c.date, periodStarts);
          if (day && getPhase(day) === phase.key) values.push(c[selectedMetric]);
        });
    } else {
      symptomLogs
        .filter((s) => s.date >= cutoffDate && s.symptom_type === selectedMetric && s.severity != null)
        .forEach((s) => {
          const day = getDayOfCycle(s.date, periodStarts);
          if (day && getPhase(day) === phase.key) values.push(s.severity);
        });
    }
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { phase: phase.label, avg: parseFloat(avg.toFixed(1)), count: values.length, color: phase.color };
  });

  // --- Time series line chart data ---
  const timeSeriesData = (() => {
    const byDate = {};
    const source = dataSource === "checkins"
      ? checkins.filter((c) => c.date >= cutoffDate && c[selectedMetric] != null).map((c) => ({ date: c.date, val: c[selectedMetric] }))
      : symptomLogs.filter((s) => s.date >= cutoffDate && s.symptom_type === selectedMetric && s.severity != null).map((s) => ({ date: s.date, val: s.severity }));

    source.forEach(({ date, val }) => {
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(val);
    });

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        label: format(parseISO(date), "MMM d"),
        value: parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)),
        phase: getPhase(getDayOfCycle(date, periodStarts)),
      }));
  })();

  const hasCycleData = periodStarts.length > 0;
  const hasPhaseData = phaseData.some((d) => d.count > 0);

  const currentMetricMeta = CHECKIN_METRICS.find((m) => m.id === selectedMetric);
  const currentLabel = dataSource === "checkins"
    ? (currentMetricMeta?.label || selectedMetric)
    : (selectedMetric?.replace(/_/g, " ") || "");
  const currentColor = dataSource === "checkins" ? (currentMetricMeta?.color || "#f472b6") : "#f472b6";

  // Pattern insight
  const patternInsight = (() => {
    if (!hasPhaseData) return null;
    const withData = phaseData.filter((d) => d.count > 0);
    if (withData.length < 2) return null;
    const highest = [...withData].sort((a, b) => b.avg - a.avg)[0];
    const lowest  = [...withData].sort((a, b) => a.avg - b.avg)[0];
    if (highest === lowest) return null;
    return { highest, lowest };
  })();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="pt-12 pb-4 flex items-center gap-3">
          <Link to={createPageUrl("Profile")} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <ArrowLeft className="w-4 h-4" style={{ color: "var(--mauve)" }} />
          </Link>
          <TrendingUp className="w-5 h-5" style={{ color: "var(--rose-dust)" }} />
          <h1 className="text-2xl font-bold" style={{ color: "var(--plum)" }}>Trends</h1>
        </div>

        {/* Time range */}
        <div className="flex gap-2 mb-4">
          {[3, 6].map((m) => (
            <button
              key={m}
              onClick={() => setTimeRange(m)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={timeRange === m
                ? { backgroundColor: "var(--plum)", color: "white" }
                : { backgroundColor: "var(--surface)", color: "var(--mauve)", border: "1px solid var(--border)" }}
            >
              {m} months
            </button>
          ))}
        </div>

        <HealthOverviewSection
          checkins={checkins}
          symptomLogs={symptomLogs}
          habitLogs={habitLogs}
          cutoffDate={cutoffDate}
          timeRange={timeRange}
        />

        <AIHealthSummaryCard
          timeRange={timeRange}
          checkins={checkins}
          symptomLogs={symptomLogs}
          habitLogs={habitLogs}
          cutoffDate={cutoffDate}
        />

        {/* Data source toggle */}
        <div className="flex gap-1 mb-4 rounded-2xl p-1" style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}>
          <button
            onClick={() => { setDataSource("checkins"); setSelectedMetric("cramps"); }}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={dataSource === "checkins" ? { backgroundColor: "var(--plum)", color: "white" } : { color: "var(--mauve)" }}
          >
            Daily Check-ins
          </button>
          <button
            onClick={() => { setDataSource("symptoms"); setSelectedMetric(symptomTypes[0] || ""); }}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={dataSource === "symptoms" ? { backgroundColor: "var(--plum)", color: "white" } : { color: "var(--mauve)" }}
            disabled={symptomTypes.length === 0}
          >
            Symptom Logs
          </button>
        </div>

        {/* Metric chips */}
        <div className="mb-5">
          <p className="text-xs mb-2 font-medium" style={{ color: "var(--mauve)" }}>Select metric</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(dataSource === "checkins" ? CHECKIN_METRICS : symptomTypes.map((t) => ({ id: t, label: t.replace(/_/g, " "), color: "#f472b6" }))).map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all capitalize"
                style={selectedMetric === m.id
                  ? { backgroundColor: m.color, color: "white" }
                  : { backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", border: "1px solid var(--border)" }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* No cycle data */}
        {!hasCycleData && (
          <div className="rounded-2xl p-5 mb-4 text-center"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--plum)" }}>No cycle data yet</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Log your period in Today — Track to see phase correlations.</p>
          </div>
        )}

        {/* Phase correlation bar chart */}
        {hasCycleData && (
          <div className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 className="text-sm font-bold mb-0.5 capitalize" style={{ color: "var(--plum)" }}>{currentLabel} by Cycle Phase</h3>
            <p className="text-xs mb-4" style={{ color: "var(--mauve)" }}>Average score — last {timeRange} months</p>
            {hasPhaseData ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={phaseData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e8" />
                  <XAxis dataKey="phase" tick={{ fontSize: 11, fill: "#999" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#999" }} domain={[0, 10]} />
                  <Tooltip
                    formatter={(val) => [val, currentLabel]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #fce7ec", fontSize: 12 }}
                  />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                    {phaseData.map((entry, i) => (
                      <Cell key={i} fill={PHASES[i].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40" style={{ color: "var(--mauve)" }}>
                <p className="text-sm text-center">Not enough data yet —<br />keep logging daily!</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1 mt-3">
              {PHASES.map((p) => (
                <div key={p.key} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[10px]" style={{ color: "var(--mauve)" }}>{p.label} <span style={{ color: "var(--border)" }}>({p.days})</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pattern insight */}
        {patternInsight && (
          <div className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)",
              borderLeft: `4px solid ${PHASES.find((p) => p.key === patternInsight.highest.phase)?.color}` }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--mauve)", letterSpacing: "0.1em" }}>Pattern Insight</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--plum)" }}>
              Your <strong className="capitalize">{currentLabel}</strong> tends to peak during the{" "}
              <strong style={{ color: PHASES.find((p) => p.key === patternInsight.highest.phase)?.color }}>
                {patternInsight.highest.phase}
              </strong>{" "}
              phase (avg {patternInsight.highest.avg}) and is lowest in the{" "}
              <strong style={{ color: PHASES.find((p) => p.key === patternInsight.lowest.phase)?.color }}>
                {patternInsight.lowest.phase}
              </strong>{" "}
              phase (avg {patternInsight.lowest.avg}).
            </p>
          </div>
        )}

        {/* Time series line chart */}
        {timeSeriesData.length > 1 && (
          <div className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 className="text-sm font-bold mb-0.5 capitalize" style={{ color: "var(--plum)" }}>{currentLabel} over time</h3>
            <p className="text-xs mb-4" style={{ color: "var(--mauve)" }}>Daily readings — {timeRange} months</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e8" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#999" }} domain={[0, 10]} />
                <Tooltip
                  formatter={(val) => [val, currentLabel]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #fce7ec", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={currentColor}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: currentColor, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {timeSeriesData.length === 0 && (
          <div className="rounded-2xl p-5 text-center"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--plum)" }}>No data for this metric yet</p>
            <p className="text-xs" style={{ color: "var(--mauve)" }}>Keep logging daily check-ins to see trends here.</p>
          </div>
        )}

        {/* Habit Completion Rates */}
        {habitNames.length > 0 && (() => {
          const habitData = habitNames.map((name) => {
            const logsInRange = habitLogs.filter((h) => (h.habit_type === name || h.habit_name === name) && h.date >= cutoffDate);
            const completedDays = logsInRange.filter((h) => h.completed).length;
            // Count unique dates in range that have any habit log
            const uniqueDates = [...new Set(logsInRange.map(h => h.date))].length;
            const pct = uniqueDates > 0 ? Math.round((completedDays / uniqueDates) * 100) : 0;
            return { name: name.length > 16 ? name.slice(0, 16) + "…" : name, pct, full: name };
          });
          return (
            <div className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-sm font-bold mb-0.5" style={{ color: "var(--plum)" }}>Habit Completion Rates</h3>
              <p className="text-xs mb-4" style={{ color: "var(--mauve)" }}>Last {timeRange} months</p>
              <div className="space-y-3">
                {habitData.map((h) => (
                  <div key={h.full}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium capitalize" style={{ color: "var(--plum)" }}>{h.name}</span>
                      <span className="text-xs font-bold" style={{ color: "var(--rose-dust)" }}>{h.pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--rose-dust-subtle)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${h.pct}%`, backgroundColor: "var(--rose-dust)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Sleep vs Mood Correlation */}
        {checkins.filter(c => c.date >= cutoffDate && c.sleep_quality != null && c.mood != null).length > 3 && (() => {
          const data = checkins
            .filter(c => c.date >= cutoffDate && c.sleep_quality != null && c.mood != null)
            .map(c => ({ label: format(parseISO(c.date), "MMM d"), sleep: c.sleep_quality, mood: c.mood, energy: c.energy }))
            .slice(-30);
          return (
            <div className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-sm font-bold mb-0.5" style={{ color: "var(--plum)" }}>Sleep Quality vs Mood & Energy</h3>
              <p className="text-xs mb-4" style={{ color: "var(--mauve)" }}>Last 30 data points</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e8" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#999" }} domain={[0, 10]} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #fce7ec", fontSize: 12 }} />
                  <Line type="monotone" dataKey="sleep" stroke="#34d399" strokeWidth={2} dot={false} name="Sleep" />
                  <Line type="monotone" dataKey="mood" stroke="#f472b6" strokeWidth={2} dot={false} name="Mood" />
                  <Line type="monotone" dataKey="energy" stroke="#fb923c" strokeWidth={2} dot={false} name="Energy" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                {[{c:"#34d399",l:"Sleep"},{c:"#f472b6",l:"Mood"},{c:"#fb923c",l:"Energy"}].map(x => (
                  <div key={x.l} className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:x.c}}/><span className="text-[10px]" style={{ color: "var(--mauve)" }}>{x.l}</span></div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Stress heatmap (last 3 months) */}
        {checkins.filter(c => c.date >= cutoffDate && c.stress != null).length > 7 && (() => {
          const stressData = checkins
            .filter(c => c.date >= cutoffDate && c.stress != null)
            .sort((a, b) => a.date.localeCompare(b.date));
          return (
            <div className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-sm font-bold mb-0.5" style={{ color: "var(--plum)" }}>Stress heatmap</h3>
              <p className="text-xs mb-4" style={{ color: "var(--mauve)" }}>Last {timeRange} months — darker = higher stress</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {stressData.map(c => (
                  <div key={c.date} title={`${c.date}: ${c.stress}/10`}
                    style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: stressColor(c.stress), cursor: "default" }} />
                ))}
              </div>
              <div className="flex gap-3 mt-3 flex-wrap">
                {[{c:STRESS_COLORS[1],l:"Low"},{c:STRESS_COLORS[3],l:"Medium"},{c:STRESS_COLORS[5],l:"High"}].map(x=>(
                  <div key={x.l} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{backgroundColor:x.c}}/>
                    <span style={{fontSize:10,color:"var(--mauve)"}}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Phase correlation badges */}
        {correlations.length > 0 && (
          <div className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 className="text-sm font-bold mb-0.5" style={{ color: "var(--plum)" }}>Your patterns</h3>
            <p className="text-xs mb-3" style={{ color: "var(--mauve)" }}>Correlations found in your data</p>
            <div className="space-y-2">
              {correlations.slice(0, 3).map((c, i) => (
                <div key={i} className="rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                  {c.explanation_text || `${c.metric_a?.replace(/_/g," ")} correlates with ${c.metric_b?.replace(/_/g," ")}`}
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="rounded-[22px] p-5 mb-4 flex items-center justify-between"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: "0.12em", color: "var(--mauve)",
                        fontFamily: "'Inter', sans-serif" }}>
              Dedicated tracker
            </p>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--plum)",
                        fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>
              Skin &amp; Hair Trends
            </p>
            <p style={{ fontSize: "12px", color: "var(--mauve)",
                        fontFamily: "'Inter', sans-serif", marginTop: "4px" }}>
              Phase-by-phase breakout patterns, shedding data and more
            </p>
          </div>
          <Link
            to={createPageUrl("SkinHair")}
            style={{ backgroundColor: "var(--plum)", color: "white",
                     borderRadius: "9999px", padding: "8px 18px",
                     fontSize: "12px", fontWeight: 600,
                     fontFamily: "'Inter', sans-serif",
                     textDecoration: "none", flexShrink: 0 }}
          >
            View
          </Link>
        </div>

      </div>
    </div>
  );
}
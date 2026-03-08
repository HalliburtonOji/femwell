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

const PHASES = [
  { key: "Menstrual",  label: "Menstrual",  color: "#f43f5e", days: "Days 1–5"  },
  { key: "Follicular", label: "Follicular", color: "#fb923c", days: "Days 6–13" },
  { key: "Ovulatory",  label: "Ovulatory",  color: "#a78bfa", days: "Days 14–16"},
  { key: "Luteal",     label: "Luteal",     color: "#34d399", days: "Days 17+"  },
];

const CHECKIN_METRICS = [
  { id: "cramps",            label: "Cramps 😣",          color: "#f43f5e" },
  { id: "mood",              label: "Mood 😊",             color: "#f472b6" },
  { id: "energy",            label: "Energy ⚡",           color: "#fb923c" },
  { id: "stress",            label: "Stress 🌊",           color: "#a78bfa" },
  { id: "bloating",          label: "Bloating",            color: "#6ee7b7" },
  { id: "headache",          label: "Headache",            color: "#93c5fd" },
  { id: "breast_tenderness", label: "Breast Tenderness",   color: "#c084fc" },
  { id: "sleep_quality",     label: "Sleep Quality 💤",    color: "#34d399" },
  { id: "pain",              label: "Pain",                color: "#ef4444" },
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

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const cutoff = subMonths(new Date(), 6).toISOString().split("T")[0];

      const [events, ckins, slogs, hlogs] = await Promise.all([
        base44.entities.CycleEvents.filter({ user_id: u.id }),
        base44.entities.DailyCheckins.filter({ user_id: u.id }),
        base44.entities.SymptomLogs.filter({ user_id: u.id }),
        base44.entities.HabitLogs.filter({ user_id: u.id }, "-date", 500),
      ]);

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

      setLoading(false);
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
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="pt-12 pb-4 flex items-center gap-3">
          <Link to={createPageUrl("Profile")} className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <TrendingUp className="w-5 h-5 text-rose-500" />
          <h1 className="text-2xl font-bold text-rose-900">Trends</h1>
        </div>

        {/* Time range */}
        <div className="flex gap-2 mb-4">
          {[3, 6].map((m) => (
            <button
              key={m}
              onClick={() => setTimeRange(m)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                timeRange === m ? "bg-rose-500 text-white shadow-sm" : "bg-white/70 text-gray-500 border border-rose-100"
              }`}
            >
              {m} months
            </button>
          ))}
        </div>

        {/* Data source toggle */}
        <div className="flex gap-1 mb-4 bg-white/60 rounded-2xl p-1">
          <button
            onClick={() => { setDataSource("checkins"); setSelectedMetric("cramps"); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${dataSource === "checkins" ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"}`}
          >
            Daily Check-ins
          </button>
          <button
            onClick={() => { setDataSource("symptoms"); setSelectedMetric(symptomTypes[0] || ""); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${dataSource === "symptoms" ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"}`}
            disabled={symptomTypes.length === 0}
          >
            Symptom Logs
          </button>
        </div>

        {/* Metric chips */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 mb-2 font-medium">Select metric</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(dataSource === "checkins" ? CHECKIN_METRICS : symptomTypes.map((t) => ({ id: t, label: t.replace(/_/g, " "), color: "#f472b6" }))).map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all capitalize ${
                  selectedMetric === m.id ? "text-white shadow-sm" : "bg-white/70 text-gray-600 border border-rose-100"
                }`}
                style={selectedMetric === m.id ? { backgroundColor: m.color } : {}}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* No cycle data */}
        {!hasCycleData && (
          <div className="card-glass rounded-2xl p-5 mb-4 text-center">
            <p className="text-3xl mb-2">🌙</p>
            <p className="text-sm font-medium text-gray-700 mb-1">No cycle data yet</p>
            <p className="text-xs text-gray-400">Log your period in Today → Track to see phase correlations.</p>
          </div>
        )}

        {/* Phase correlation bar chart */}
        {hasCycleData && (
          <div className="card-glass rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-0.5 capitalize">{currentLabel} by Cycle Phase</h3>
            <p className="text-xs text-gray-400 mb-4">Average score — last {timeRange} months</p>
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
              <div className="flex items-center justify-center h-40 text-gray-300">
                <p className="text-sm text-center">Not enough data yet —<br />keep logging daily!</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1 mt-3">
              {PHASES.map((p) => (
                <div key={p.key} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[10px] text-gray-500">{p.label} <span className="text-gray-300">({p.days})</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pattern insight */}
        {patternInsight && (
          <div className="card-glass rounded-2xl p-4 mb-4 border-l-4" style={{ borderLeftColor: PHASES.find((p) => p.key === patternInsight.highest.phase)?.color }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">💡 Pattern Insight</p>
            <p className="text-sm text-gray-700 leading-relaxed">
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
          <div className="card-glass rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-0.5 capitalize">{currentLabel} over time</h3>
            <p className="text-xs text-gray-400 mb-4">Daily readings — {timeRange} months</p>
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
          <div className="card-glass rounded-2xl p-5 text-center">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm font-medium text-gray-700 mb-1">No data for this metric yet</p>
            <p className="text-xs text-gray-400">Keep logging daily check-ins to see trends here.</p>
          </div>
        )}

      </div>
    </div>
  );
}
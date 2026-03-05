import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, Minus, BarChart2, Calendar, Sparkles, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { subDays, format, parseISO } from "date-fns";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "trends", label: "Trends" },
  { id: "patterns", label: "Patterns" },
  { id: "reports", label: "Reports" },
];

const RANGES = [7, 30, 90];

function TrendIcon({ value, prev }) {
  if (!prev) return <Minus className="w-4 h-4 text-gray-400" />;
  if (value > prev) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  if (value < prev) return <TrendingDown className="w-4 h-4 text-rose-400" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
}

function MetricCard({ label, emoji, value, prev, unit = "" }) {
  const diff = prev ? (value - prev).toFixed(1) : null;
  return (
    <div className="card-glass rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">{emoji} {label}</p>
          <p className="text-2xl font-bold text-gray-800">{value !== null ? `${value}${unit}` : "—"}</p>
          {diff !== null && (
            <p className={`text-xs mt-0.5 ${Number(diff) > 0 ? "text-emerald-500" : Number(diff) < 0 ? "text-rose-400" : "text-gray-400"}`}>
              {Number(diff) > 0 ? "+" : ""}{diff} vs prev
            </p>
          )}
        </div>
        <TrendIcon value={value} prev={prev} />
      </div>
    </div>
  );
}

export default function Insights() {
  const [tab, setTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [insightCards, setInsightCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [range, setRange] = useState(30);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [ci, ic] = await Promise.all([
        base44.entities.DailyCheckins.filter({ user_id: u.id }, "-date", 90),
        base44.entities.InsightCards.filter({ user_id: u.id }, "-created_date", 5),
      ]);
      setCheckins(ci.sort((a, b) => a.date.localeCompare(b.date)));
      setInsightCards(ic);
      setLoading(false);
    })();
  }, []);

  const generateInsights = async () => {
    setGeneratingInsights(true);
    try {
      const res = await base44.functions.invoke("generateInsights", { user_id: user.id });
      if (res.data?.insights) {
        const ic = await base44.entities.InsightCards.filter({ user_id: user.id }, "-created_date", 5);
        setInsightCards(ic);
      }
    } catch (e) {
      console.error(e);
    }
    setGeneratingInsights(false);
  };

  const rangeCheckins = checkins.slice(-range);
  const prevRange = checkins.slice(-range * 2, -range);

  const avg = (arr, key) => {
    const vals = arr.filter((c) => c[key] != null).map((c) => c[key]);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
  };

  const metrics = [
    { label: "Mood", emoji: "😊", key: "mood", unit: "/5" },
    { label: "Energy", emoji: "⚡", key: "energy", unit: "/5" },
    { label: "Stress", emoji: "🌊", key: "stress", unit: "/5" },
    { label: "Sleep", emoji: "💤", key: "sleep_hours", unit: "h" },
  ];

  const chartData = rangeCheckins.map((c) => ({
    date: format(parseISO(c.date), range <= 7 ? "EEE" : range <= 30 ? "d MMM" : "MMM d"),
    mood: c.mood, energy: c.energy, stress: c.stress, sleep: c.sleep_hours,
  }));

  // Phase averages for patterns
  const PHASES = ["menstrual", "follicular", "ovulatory", "luteal"];
  const phaseAvgs = {};
  PHASES.forEach((ph) => {
    const phCheckins = checkins.filter((c) => c.cycle_phase === ph);
    phaseAvgs[ph] = {
      mood: avg(phCheckins, "mood"),
      energy: avg(phCheckins, "energy"),
      stress: avg(phCheckins, "stress"),
    };
  });

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-4">
          <h1 className="text-2xl font-bold text-rose-900">Insights</h1>
          <p className="text-sm text-gray-400">Your wellness patterns</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-rose-500 text-white shadow-md" : "bg-white/70 text-gray-500 hover:bg-white"}`}
            >{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Last 7 days average</p>
            </div>
            {checkins.length === 0 ? (
              <div className="card-glass rounded-2xl p-8 text-center text-gray-400">
                <BarChart2 className="w-10 h-10 mx-auto mb-3 text-rose-200" />
                <p className="font-medium text-gray-500">No data yet</p>
                <p className="text-sm mt-1">Start logging daily check-ins to see your patterns.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((m) => (
                  <MetricCard key={m.key} label={m.label} emoji={m.emoji}
                    value={avg(checkins.slice(-7), m.key)}
                    prev={avg(checkins.slice(-14, -7), m.key)}
                    unit={m.unit}
                  />
                ))}
              </div>
            )}

            {/* Top insights */}
            {insightCards.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-rose-400" />Top Insights</h3>
                <div className="space-y-3">
                  {insightCards.slice(0, 3).map((card) => (
                    <div key={card.id} className="card-glass rounded-2xl p-4">
                      <p className="font-semibold text-gray-800 text-sm">{card.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.insight_text}</p>
                      {card.evidence_text && <p className="text-xs text-rose-400 mt-1 italic">{card.evidence_text}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRENDS */}
        {tab === "trends" && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-1">
              {RANGES.map((r) => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${range === r ? "bg-rose-500 text-white" : "bg-white/70 text-gray-500"}`}>
                  {r}d
                </button>
              ))}
            </div>
            {chartData.length < 2 ? (
              <div className="card-glass rounded-2xl p-8 text-center text-gray-400">
                <p className="text-sm">Log at least 2 days to see charts.</p>
              </div>
            ) : (
              [
                { key: "mood", label: "Mood", color: "#f59e0b" },
                { key: "energy", label: "Energy", color: "#10b981" },
                { key: "stress", label: "Stress", color: "#60a5fa" },
                { key: "sleep", label: "Sleep (hours)", color: "#a78bfa" },
              ].map((chart) => (
                <div key={chart.key} className="card-glass rounded-2xl p-4">
                  <h3 className="font-semibold text-gray-700 text-sm mb-3">{chart.label}</h3>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0e6e8" />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} />
                      <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }} />
                      <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2} dot={{ r: 2, fill: chart.color }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))
            )}
          </div>
        )}

        {/* PATTERNS */}
        {tab === "patterns" && (
          <div className="space-y-4">
            <div className="card-glass rounded-2xl p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Phase Averages</h3>
              {PHASES.map((ph) => (
                <div key={ph} className="mb-3">
                  <p className="text-xs font-medium text-gray-500 capitalize mb-1">{ph}</p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>😊 {phaseAvgs[ph].mood || "—"}</span>
                    <span>⚡ {phaseAvgs[ph].energy || "—"}</span>
                    <span>🌊 {phaseAvgs[ph].stress || "—"}</span>
                  </div>
                </div>
              ))}
              {checkins.filter(c => c.cycle_phase).length === 0 && (
                <p className="text-xs text-gray-400">Phase data will appear once your cycle is set up.</p>
              )}
            </div>

            <div className="card-glass rounded-2xl p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">Logged Days</h3>
              <p className="text-3xl font-bold text-rose-500">{checkins.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">days of data tracked</p>
            </div>
          </div>
        )}

        {/* REPORTS */}
        {tab === "reports" && (
          <div className="space-y-4">
            <div className="card-glass rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-gray-700">30-Day Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((m) => (
                  <div key={m.key} className="bg-rose-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{m.emoji} {m.label}</p>
                    <p className="text-lg font-bold text-gray-700">{avg(checkins.slice(-30), m.key) || "—"}{m.unit}</p>
                  </div>
                ))}
              </div>
              <div className="bg-rose-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">📅 Total days logged (last 30)</p>
                <p className="text-lg font-bold text-gray-700">{checkins.slice(-30).length}</p>
              </div>
            </div>

            <div className="card-glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">AI Insights</h3>
                <button
                  onClick={generateInsights}
                  disabled={generatingInsights || checkins.length < 3}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-600 text-xs font-medium disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingInsights ? "animate-spin" : ""}`} />
                  {generatingInsights ? "Generating..." : "Refresh"}
                </button>
              </div>
              {insightCards.length === 0 ? (
                <p className="text-sm text-gray-400">No insights yet. Hit Refresh to generate your first AI insights.</p>
              ) : (
                insightCards.map((card) => (
                  <div key={card.id} className="bg-rose-50 rounded-xl p-3">
                    <p className="font-semibold text-gray-700 text-sm">{card.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.insight_text}</p>
                    {card.evidence_text && <p className="text-xs text-rose-400 italic mt-1">{card.evidence_text}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
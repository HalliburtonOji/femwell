import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, Minus, BarChart2, Calendar, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { subDays, format, parseISO } from "date-fns";

const today = new Date().toISOString().split("T")[0];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "charts", label: "Charts" },
  { id: "insights", label: "AI Insights" },
];

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
              {Number(diff) > 0 ? "+" : ""}{diff} vs last week
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

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split("T")[0];
      const [ci, ic] = await Promise.all([
        base44.entities.DailyCheckins.filter({ user_id: u.id }, "-date", 30),
        base44.entities.InsightCards.filter({ user_id: u.id }, "-created_date", 5),
      ]);
      setCheckins(ci.sort((a, b) => a.date.localeCompare(b.date)));
      setInsightCards(ic);
      setLoading(false);
    })();
  }, []);

  const last7 = checkins.slice(-7);
  const prev7 = checkins.slice(-14, -7);

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

  const chartData = last7.map((c) => ({
    date: format(parseISO(c.date), "EEE"),
    mood: c.mood,
    energy: c.energy,
    stress: c.stress,
    sleep: c.sleep_hours,
  }));

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
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id ? "bg-rose-500 text-white shadow-md" : "bg-white/70 text-gray-500 hover:bg-white"
              }`}
            >{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Calendar className="w-3.5 h-3.5" /> Last 7 days average
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
                  <MetricCard
                    key={m.key}
                    label={m.label}
                    emoji={m.emoji}
                    value={avg(last7, m.key)}
                    prev={avg(prev7, m.key)}
                    unit={m.unit}
                  />
                ))}
              </div>
            )}

            {checkins.length > 0 && (
              <div className="card-glass rounded-2xl p-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">This week</h3>
                <div className="space-y-2">
                  {last7.slice(-4).reverse().map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 w-16">{format(parseISO(c.date), "EEE d")}</span>
                      <div className="flex gap-2">
                        <span className="text-amber-500">😊 {c.mood}/5</span>
                        <span className="text-yellow-500">⚡ {c.energy}/5</span>
                        <span className="text-blue-400">💤 {c.sleep_hours}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHARTS */}
        {tab === "charts" && (
          <div className="space-y-4">
            {chartData.length < 2 ? (
              <div className="card-glass rounded-2xl p-8 text-center text-gray-400">
                <p className="text-sm">Log at least 2 days of check-ins to see charts.</p>
              </div>
            ) : (
              <>
                {[
                  { key: "mood", label: "Mood", color: "#f59e0b" },
                  { key: "energy", label: "Energy", color: "#eab308" },
                  { key: "stress", label: "Stress", color: "#60a5fa" },
                  { key: "sleep", label: "Sleep (hours)", color: "#a78bfa" },
                ].map((chart) => (
                  <div key={chart.key} className="card-glass rounded-2xl p-4">
                    <h3 className="font-semibold text-gray-700 text-sm mb-3">{chart.label}</h3>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0e6e8" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                        <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2} dot={{ r: 3, fill: chart.color }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* AI INSIGHTS */}
        {tab === "insights" && (
          <div className="space-y-3">
            {insightCards.length === 0 ? (
              <div className="card-glass rounded-2xl p-8 text-center text-gray-400">
                <Sparkles className="w-10 h-10 mx-auto mb-3 text-rose-200" />
                <p className="font-medium text-gray-500">No insights yet</p>
                <p className="text-sm mt-1">Keep logging for a few days and your AI insights will appear here.</p>
              </div>
            ) : (
              insightCards.map((card) => (
                <div key={card.id} className="card-glass rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{card.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.insight_text}</p>
                      {card.evidence_text && (
                        <p className="text-xs text-rose-400 mt-2 italic">{card.evidence_text}</p>
                      )}
                    </div>
                  </div>
                  {card.recommended_action_route && (
                    <a href={card.recommended_action_route} className="mt-3 text-xs text-rose-500 font-medium flex items-center gap-1">
                      Take action →
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
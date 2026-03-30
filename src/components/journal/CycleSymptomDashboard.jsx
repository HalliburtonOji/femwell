import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { differenceInDays, parseISO, subMonths } from "date-fns";
import { Loader2 } from "lucide-react";

const PHASE_COLORS = {
  menstrual: "#f87171",
  follicular: "#34d399",
  ovulatory: "#fbbf24",
  luteal: "#a78bfa",
};

const PHASE_LABELS = {
  menstrual: "🩸 Menstrual",
  follicular: "🌱 Follicular",
  ovulatory: "☀️ Ovulatory",
  luteal: "🌙 Luteal",
};

function getPhase(dayOfCycle, cycleLength, periodLength) {
  if (dayOfCycle <= periodLength) return "menstrual";
  if (dayOfCycle <= Math.round(cycleLength * 0.4)) return "follicular";
  if (dayOfCycle <= Math.round(cycleLength * 0.55)) return "ovulatory";
  return "luteal";
}

export default function CycleSymptomDashboard({ user, profile }) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [topSymptoms, setTopSymptoms] = useState([]);
  const [selectedSymptom, setSelectedSymptom] = useState(null);

  useEffect(() => {
    if (!profile?.last_period_start_date) { setLoading(false); return; }
    (async () => {
      const threeMonthsAgo = subMonths(new Date(), 3).toISOString().split("T")[0];
      const [symptoms, cycles] = await Promise.all([
        base44.entities.SymptomLogs.filter({ user_id: user.id }),
        base44.entities.CycleEvents.filter({ user_id: user.id }),
      ]);

      const recentSymptoms = symptoms.filter(s => s.date >= threeMonthsAgo);
      const cycleLength = profile.cycle_avg_length || 28;
      const periodLength = profile.period_length || 5;

      // Find all period starts to map dates to cycle days
      const periodStarts = cycles
        .filter(c => c.type === "PeriodStart")
        .map(c => c.date)
        .sort((a, b) => b.localeCompare(a));

      // Count symptoms per phase
      const phaseCounts = { menstrual: {}, follicular: {}, ovulatory: {}, luteal: {} };

      recentSymptoms.forEach(s => {
        if (!s.date || !s.symptom_type) return;
        // Find the most recent period start before this symptom date
        const lastStart = periodStarts.find(ps => ps <= s.date) || profile.last_period_start_date;
        const dayOfCycle = (differenceInDays(parseISO(s.date), parseISO(lastStart)) % cycleLength) + 1;
        if (dayOfCycle < 1) return;
        const phase = getPhase(dayOfCycle, cycleLength, periodLength);
        const sym = s.symptom_type.toLowerCase();
        phaseCounts[phase][sym] = (phaseCounts[phase][sym] || 0) + (s.severity || 1);
      });

      // Get top 6 symptoms overall
      const allSymptomCounts = {};
      recentSymptoms.forEach(s => {
        if (s.symptom_type) allSymptomCounts[s.symptom_type.toLowerCase()] = (allSymptomCounts[s.symptom_type.toLowerCase()] || 0) + 1;
      });
      const top = Object.entries(allSymptomCounts).sort(([, a], [, b]) => b - a).slice(0, 6).map(([k]) => k);
      setTopSymptoms(top);
      if (top.length > 0 && !selectedSymptom) setSelectedSymptom(top[0]);

      // Build chart data per phase
      const data = Object.entries(PHASE_LABELS).map(([phase, label]) => {
        const entry = { phase, label };
        top.forEach(sym => { entry[sym] = phaseCounts[phase][sym] || 0; });
        return entry;
      });
      setChartData(data);
      setLoading(false);
    })();
  }, [user, profile]);

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
    </div>
  );

  if (!profile?.last_period_start_date) return (
    <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
      <p className="text-2xl mb-2">🌙</p>
      <p className="text-sm">Set your last period date in Profile to see cycle insights.</p>
    </div>
  );

  if (topSymptoms.length === 0) return (
    <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
      <p className="text-2xl mb-2">📊</p>
      <p className="text-sm">No symptom data yet. Start logging symptoms in My Track!</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="card-glass rounded-2xl p-4">
        <p className="text-sm font-bold text-gray-700 mb-1">Cycle-Symptom Patterns</p>
        <p className="text-xs text-gray-400 mb-4">Last 3 months · severity score per phase</p>

        {/* Symptom selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {topSymptoms.map(sym => (
            <button
              key={sym}
              onClick={() => setSelectedSymptom(sym)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-all ${
                selectedSymptom === sym ? "bg-rose-500 text-white" : "bg-white/80 text-gray-600"
              }`}
            >
              {sym}
            </button>
          ))}
        </div>

        {selectedSymptom && (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={32}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [`Severity score: ${v}`, selectedSymptom]}
                contentStyle={{ borderRadius: 12, border: "none", fontSize: 11 }}
              />
              <Bar dataKey={selectedSymptom} radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.phase} fill={PHASE_COLORS[entry.phase]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Phase legend */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(PHASE_LABELS).map(([phase, label]) => (
          <div key={phase} className="card-glass rounded-xl p-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PHASE_COLORS[phase] }} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
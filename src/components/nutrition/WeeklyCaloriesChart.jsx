import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, subDays, parseISO } from "date-fns";

const PHASE_COLORS = {
  menstrual: "#C4849A",
  follicular: "#7A9E8E",
  ovulatory: "#E8B84B",
  luteal: "#9B7FCC",
};

const PHASE_TARGETS = {
  menstrual:  { note: "Focus on iron-rich foods today. Your needs are higher right now.", highlight: "Iron & B12" },
  follicular: { note: "Great time for variety — your digestion is at its best.", highlight: "Whole foods" },
  ovulatory:  { note: "Lighter meals work well. Zinc and antioxidants are great today.", highlight: "Antioxidants" },
  luteal:     { note: "You may need 100–300 extra calories. Magnesium and B6 help with PMS.", highlight: "Magnesium" },
};

function getPhase(profile) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const daysSince = Math.floor((Date.now() - new Date(profile.last_period_start_date).getTime()) / 86400000);
  const dayOfCycle = (daysSince % cycleLen) + 1;
  if (dayOfCycle <= periodLen) return "menstrual";
  if (dayOfCycle <= Math.round(cycleLen * 0.4)) return "follicular";
  if (dayOfCycle <= Math.round(cycleLen * 0.55)) return "ovulatory";
  return "luteal";
}

function getPhaseForDate(dateStr, profile) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const daysSince = Math.floor((new Date(dateStr).getTime() - new Date(profile.last_period_start_date).getTime()) / 86400000);
  if (daysSince < 0) return null;
  const dayOfCycle = (daysSince % cycleLen) + 1;
  if (dayOfCycle <= periodLen) return "menstrual";
  if (dayOfCycle <= Math.round(cycleLen * 0.4)) return "follicular";
  if (dayOfCycle <= Math.round(cycleLen * 0.55)) return "ovulatory";
  return "luteal";
}

export default function WeeklyCaloriesChart({ allMealLogs, profile }) {
  const currentPhase = getPhase(profile);
  const phaseTip = currentPhase ? PHASE_TARGETS[currentPhase] : null;

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, "yyyy-MM-dd");
    });

    return days.map(dateStr => {
      const dayMeals = (allMealLogs || []).filter(m => m.day_key === dateStr);
      const calories = dayMeals.reduce((sum, m) => {
        try {
          const analysis = m.ai_analysis ? JSON.parse(m.ai_analysis) : null;
          return sum + (analysis?.nutritional_summary?.calories || 0);
        } catch { return sum; }
      }, 0);
      const phase = getPhaseForDate(dateStr, profile);
      return {
        label: format(parseISO(dateStr), "EEE"),
        calories: Math.round(calories),
        phase,
        color: phase ? PHASE_COLORS[phase] : "var(--border)",
        isToday: dateStr === format(new Date(), "yyyy-MM-dd"),
      };
    });
  }, [allMealLogs, profile]);

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "18px 16px", boxShadow: "var(--shadow-sm)" }}>
      {/* Phase tip banner */}
      {phaseTip && (
        <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 14, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--rose-dust)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>
              {currentPhase ? `${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} phase` : ""} · {phaseTip.highlight}
            </span>
            <p style={{ fontSize: 12, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.5, margin: "3px 0 0" }}>{phaseTip.note}</p>
          </div>
        </div>
      )}

      <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>
        Calories — last 7 days
      </p>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={chartData} barSize={28} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--mauve)", fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "var(--mauve)", fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, fontFamily: "'Inter', sans-serif", color: "var(--plum)" }}
            cursor={{ fill: "var(--ivory-dark)" }}
            formatter={(val) => [`${val} kcal`, ""]}
          />
          <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.isToday ? "var(--plum)" : (entry.color || "var(--border)")} opacity={entry.isToday ? 1 : 0.75} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Phase legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        {Object.entries(PHASE_COLORS).map(([phase, color]) => (
          <div key={phase} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{phase}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
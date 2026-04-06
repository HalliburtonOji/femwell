import InsightStatCard from "./InsightStatCard";

const average = (values) => {
  const valid = values.filter((value) => value != null);
  if (!valid.length) return null;
  return (valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(1);
};

export default function HealthOverviewSection({ checkins, symptomLogs, habitLogs, cutoffDate, timeRange }) {
  const recentCheckins = checkins.filter((item) => item.date >= cutoffDate);
  const recentSymptoms = symptomLogs.filter((item) => item.date >= cutoffDate);
  const recentHabits = habitLogs.filter((item) => item.date >= cutoffDate);

  if (!recentCheckins.length && !recentSymptoms.length && !recentHabits.length) return null;

  const avgMood = average(recentCheckins.map((item) => item.mood));
  const avgEnergy = average(recentCheckins.map((item) => item.energy));
  const avgSleep = average(recentCheckins.map((item) => item.sleep_quality));
  const avgStress = average(recentCheckins.map((item) => item.stress));

  const recoveryDays = new Set([
    ...recentCheckins.filter((item) => (item.mood || 0) >= 7 || (item.energy || 0) >= 7 || (item.sleep_quality || 0) >= 7).map((item) => item.date),
  ]).size;

  const symptomMap = recentSymptoms.reduce((acc, item) => {
    if (!item.symptom_type) return acc;
    acc[item.symptom_type] = (acc[item.symptom_type] || 0) + 1;
    return acc;
  }, {});

  const topSymptoms = Object.entries(symptomMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name.replace(/_/g, " "));

  const habitsByName = recentHabits.reduce((acc, item) => {
    const name = item.habit_type || item.habit_name;
    if (!name) return acc;
    if (!acc[name]) acc[name] = [];
    acc[name].push(item);
    return acc;
  }, {});

  const strongestHabit = Object.entries(habitsByName)
    .map(([name, items]) => {
      const completed = items.filter((item) => item.completed).length;
      const dates = new Set(items.map((item) => item.date)).size || 1;
      return { name, rate: Math.round((completed / dates) * 100) };
    })
    .sort((a, b) => b.rate - a.rate)[0];

  const focusArea = (() => {
    if (Number(avgStress) >= 6.5) return "Stress is running high — this is a good window for lighter evenings, breathwork, and fewer back-to-back demands.";
    if (Number(avgSleep) <= 5.5) return "Sleep quality looks like the biggest lever right now — protect your wind-down routine and avoid stacking intense days.";
    if (Number(avgMood) <= 5.5) return "Your mood trend suggests you may benefit from more recovery-based habits this cycle phase, not just productivity goals.";
    return "Your baseline looks steady — this is a great time to keep routines consistent and build on the habits already working.";
  })();

  const winText = strongestHabit
    ? `${strongestHabit.name} is your strongest habit right now with ${strongestHabit.rate}% consistency.`
    : recoveryDays > 0
      ? `You logged ${recoveryDays} stronger recovery days in the last ${timeRange} months.`
      : "You're building a clearer picture of your health patterns with each check-in.";

  return (
    <section className="mb-4 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--plum)" }}>Health Insights Hub</h2>
          <p className="text-xs" style={{ color: "var(--mauve)" }}>Your core patterns and best next focus for the last {timeRange} months.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <InsightStatCard label="Mood" value={avgMood ? `${avgMood}/10` : "—"} subtext="Average emotional baseline" tone="rose" />
        <InsightStatCard label="Energy" value={avgEnergy ? `${avgEnergy}/10` : "—"} subtext="Average day-to-day energy" tone="amber" />
        <InsightStatCard label="Sleep" value={avgSleep ? `${avgSleep}/10` : "—"} subtext="Average sleep quality score" tone="emerald" />
        <InsightStatCard label="Stress" value={avgStress ? `${avgStress}/10` : "—"} subtext="Average nervous-system load" tone="violet" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--rose-dust-light)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--rose-dust)" }}>What's going well</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--plum)" }}>{winText}</p>
        </div>
        <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#7C4AC4" }}>Best next focus</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--plum)" }}>{focusArea}</p>
        </div>
      </div>

      {topSymptoms.length > 0 && (
        <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--mauve)" }}>Most frequent symptoms</p>
          <div className="flex flex-wrap gap-2">
            {topSymptoms.map((symptom) => (
              <span key={symptom} className="px-3 py-1.5 rounded-full text-xs font-medium capitalize"
                style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", border: "1px solid var(--rose-dust-light)" }}>
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
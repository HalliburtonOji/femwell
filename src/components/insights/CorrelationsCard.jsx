import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { symptomLabel } from "@/utils/symptomLabels";

// Heuristic correlation detector. Scans DailyCheckins and returns up to 3 bullets.
// No correlations computed if < 14 days logged in last 60.

function avg(arr) {
  const n = arr.filter(x => x != null && !isNaN(x));
  if (!n.length) return null;
  return n.reduce((a, b) => a + b, 0) / n.length;
}

function buildCorrelations(checkins) {
  const today = new Date();
  const msDay = 86400000;
  const recent = checkins.filter(c => {
    if (!c.date) return false;
    const diff = Math.floor((today - new Date(c.date)) / msDay);
    return diff >= 0 && diff < 60;
  });

  if (recent.length < 14) return { insufficient: true, bullets: [] };

  const bullets = [];

  const getMood = c => c.mood_score ?? c.mood;
  const getEnergy = c => c.energy_level ?? c.energy;

  // 1. Symptom + low mood co-occurrence
  const last30 = recent.filter(c => {
    const diff = Math.floor((today - new Date(c.date)) / msDay);
    return diff < 30;
  });
  const symptomLowMood = {};
  const symptomTotal = {};
  last30.forEach(c => {
    const m = getMood(c);
    const low = m != null && m <= 2; // 1-5 scale
    (c.symptoms || []).forEach(s => {
      symptomTotal[s] = (symptomTotal[s] || 0) + 1;
      if (low) symptomLowMood[s] = (symptomLowMood[s] || 0) + 1;
    });
  });
  Object.entries(symptomLowMood)
    .filter(([s, c]) => c >= 2 && symptomTotal[s] >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1)
    .forEach(([s, c]) => {
      bullets.push({
        key: `sym-mood-${s}`,
        text: `Low mood showed up on ${c} of the days you logged ${symptomLabel(s).toLowerCase()} (last 30 days).`,
      });
    });

  // 2. Sleep ≥ 7h → energy
  const goodSleep = recent.filter(c => c.sleep_hours != null && c.sleep_hours >= 7);
  const poorSleep = recent.filter(c => c.sleep_hours != null && c.sleep_hours < 7);
  const goodEnergy = avg(goodSleep.map(getEnergy));
  const poorEnergy = avg(poorSleep.map(getEnergy));
  if (goodSleep.length >= 3 && poorSleep.length >= 3 && goodEnergy != null && poorEnergy != null) {
    const diff = goodEnergy - poorEnergy;
    if (Math.abs(diff) >= 0.4) {
      const direction = diff > 0 ? "higher" : "lower";
      bullets.push({
        key: "sleep-energy",
        text: `Your energy is ${Math.abs(diff).toFixed(1)} pts ${direction} on days after 7+ hours of sleep.`,
      });
    }
  }

  // 3. Symptom cluster by cycle day
  // Compute day-in-cycle per checkin if possible via reverse calc from contiguous logs — skip if no cycle context.
  // We use a simpler signal: which weekday has most symptom logs?
  const weekdayCounts = {};
  recent.forEach(c => {
    if (!(c.symptoms || []).length) return;
    const wd = new Date(c.date).getDay();
    weekdayCounts[wd] = (weekdayCounts[wd] || 0) + 1;
  });
  const topWeekday = Object.entries(weekdayCounts).sort((a, b) => b[1] - a[1])[0];
  if (topWeekday && topWeekday[1] >= 3) {
    const names = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
    bullets.push({
      key: "weekday-cluster",
      text: `${names[topWeekday[0]]} have been your most symptom-heavy day lately.`,
    });
  }

  return { insufficient: false, bullets: bullets.slice(0, 3) };
}

const label = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--rose-deep, #E11D74)",
  fontFamily: "'Inter', sans-serif",
};

export default function CorrelationsCard({ checkins = [] }) {
  const { insufficient, bullets } = useMemo(() => buildCorrelations(checkins), [checkins]);

  if (insufficient || bullets.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "var(--blush-surface, #FCE7F3)",
          border: "1px dashed var(--rose-deep, #E11D74)33",
          borderRadius: 16,
          padding: "14px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Sparkles className="w-4 h-4" strokeWidth={1.5} style={{ color: "var(--rose-deep, #E11D74)" }} />
          <p style={label}>Correlations</p>
        </div>
        <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.55 }}>
          Keep logging to unlock correlations — we need at least 14 days in the last 60.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "14px 16px",
        boxShadow: "var(--shadow-sm)",
      }}
      role="group"
      aria-label="Correlations detected in your data"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Sparkles className="w-4 h-4" strokeWidth={1.5} style={{ color: "var(--rose-deep, #E11D74)" }} />
        <p style={label}>Correlations</p>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {bullets.map(b => (
          <li
            key={b.key}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              fontSize: 13,
              color: "var(--plum)",
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.55,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                backgroundColor: "var(--rose-deep, #E11D74)",
                marginTop: 7,
                flexShrink: 0,
              }}
            />
            <span>{b.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
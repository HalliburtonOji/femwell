import { ArrowUp, ArrowDown, Minus } from "lucide-react";

// Trend cards: last 7 days vs previous 7 days.
// Color: green (improving), amber (flat <5% change), red (worsening).
// For sleep, "improving" = more hours. For mood/energy, "improving" = higher value.

function classifyTrend(delta, direction = "higher") {
  if (delta == null) return "neutral";
  const abs = Math.abs(delta);
  if (abs < 0.15) return "flat"; // near-zero change
  if (direction === "higher") return delta > 0 ? "up" : "down";
  return delta > 0 ? "up" : "down";
}

function TrendCard({ label: caption, current, previous, unit = "", direction = "higher" }) {
  const hasData = current != null && previous != null;
  const delta = hasData ? current - previous : null;
  const pct = hasData && previous !== 0 ? (delta / Math.abs(previous)) * 100 : null;
  const kind = classifyTrend(delta, direction);

  const bg = {
    up: "#ECFDF5",
    down: "#FEF2F2",
    flat: "#FFFBEB",
    neutral: "var(--surface)",
  }[kind];
  const accent = {
    up: "#15803D",
    down: "#B91C1C",
    flat: "#B45309",
    neutral: "var(--slate-500, #8C7B66)",
  }[kind];

  const Icon = kind === "up" ? ArrowUp : kind === "down" ? ArrowDown : Minus;
  const verbMap = { up: "improving", down: "worsening", flat: "steady", neutral: "—" };

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${kind === "neutral" ? "var(--border)" : accent + "33"}`,
        borderRadius: 16,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: 88,
      }}
      role="group"
      aria-label={`${caption} trend, ${verbMap[kind]}`}
    >
      <p style={{ fontSize: "0.58rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: accent, }}>
        {caption}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", lineHeight: 1.1 }}>
          {hasData ? `${current.toFixed(1)}${unit}` : "—"}
        </p>
        {hasData && (
          <span style={{ fontSize: 10, color: "var(--slate-500, #8C7B66)", }}>
            vs {previous.toFixed(1)}{unit}
          </span>
        )}
      </div>
      {hasData && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: accent, fontWeight: 600 }}>
          <Icon className="w-3 h-3" strokeWidth={2} />
          {pct != null ? `${pct > 0 ? "+" : ""}${pct.toFixed(0)}%` : verbMap[kind]}
          <span style={{ color: "var(--slate-500, #8C7B66)", fontWeight: 400, marginLeft: 2 }}>last 7d</span>
        </span>
      )}
      {!hasData && (
        <p style={{ fontSize: 11, color: "var(--slate-500, #8C7B66)", }}>Not enough data</p>
      )}
    </div>
  );
}

function avg(arr) {
  const nums = arr.filter(x => x != null && !isNaN(x));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default function TrendCards({ checkins = [] }) {
  const today = new Date();
  const msDay = 86400000;

  const last7 = [];
  const prev7 = [];
  checkins.forEach(c => {
    if (!c.date) return;
    const d = new Date(c.date);
    const diff = Math.floor((today - d) / msDay);
    if (diff >= 0 && diff < 7) last7.push(c);
    else if (diff >= 7 && diff < 14) prev7.push(c);
  });

  // mood/energy: prefer new unified fields (mood_score/energy_level, 1-5) then legacy mood/energy (1-5).
  const getMood = c => c.mood_score ?? c.mood;
  const getEnergy = c => c.energy_level ?? c.energy;

  const moodCur = avg(last7.map(getMood));
  const moodPrev = avg(prev7.map(getMood));
  const energyCur = avg(last7.map(getEnergy));
  const energyPrev = avg(prev7.map(getEnergy));
  const sleepCur = avg(last7.map(c => c.sleep_hours));
  const sleepPrev = avg(prev7.map(c => c.sleep_hours));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
      <TrendCard label="Mood" current={moodCur} previous={moodPrev} />
      <TrendCard label="Energy" current={energyCur} previous={energyPrev} />
      <TrendCard label="Sleep" current={sleepCur} previous={sleepPrev} unit="h" />
    </div>
  );
}
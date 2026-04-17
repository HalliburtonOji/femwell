import { useMemo } from "react";

// Line chart: last 60 days of mood + energy, with cycle phase bands as background.
// Phases computed from profile.last_period_start_date + cycle_avg_length (default 28).
// If no cycle data, returns null (caller hides section).

const PHASE_COLORS = {
  menstrual: "rgba(225, 29, 116, 0.10)",   // rose-deep
  follicular: "rgba(122, 158, 142, 0.10)", // sage
  ovulatory: "rgba(245, 158, 11, 0.12)",   // amber
  luteal: "rgba(138, 126, 136, 0.10)",     // mauve
};

const PHASE_LABELS = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

function getPhaseForDay(dayInCycle, cycleLen, periodLen) {
  if (dayInCycle <= periodLen) return "menstrual";
  if (dayInCycle <= Math.round(cycleLen * 0.4)) return "follicular";
  if (dayInCycle <= Math.round(cycleLen * 0.55)) return "ovulatory";
  return "luteal";
}

function dateKey(d) {
  return new Date(d).toISOString().split("T")[0];
}

export default function PhaseOverlayChart({ checkins = [], profile }) {
  const data = useMemo(() => {
    if (!profile?.last_period_start_date) return null;
    const cycleLen = profile.cycle_avg_length || 28;
    const periodLen = profile.period_length || 5;
    const lastPeriod = new Date(profile.last_period_start_date);
    if (isNaN(lastPeriod.getTime())) return null;

    const today = new Date();
    const days = [];
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = dateKey(d);
      const daysSince = Math.floor((d - lastPeriod) / 86400000);
      if (daysSince < 0) {
        days.push({ date: key, phase: null, mood: null, energy: null });
        continue;
      }
      const dayInCycle = (daysSince % cycleLen) + 1;
      days.push({
        date: key,
        phase: getPhaseForDay(dayInCycle, cycleLen, periodLen),
        mood: null,
        energy: null,
      });
    }

    const byDate = {};
    checkins.forEach(c => {
      if (!c.date) return;
      byDate[c.date] = c;
    });
    days.forEach(d => {
      const ci = byDate[d.date];
      if (!ci) return;
      d.mood = ci.mood_score ?? ci.mood ?? null;
      d.energy = ci.energy_level ?? ci.energy ?? null;
    });

    return days;
  }, [checkins, profile]);

  if (!data) return null;

  // SVG dimensions
  const w = 320, h = 140, padX = 4, padY = 10;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  // Scale: mood/energy assumed 1-5 scale (existing fields)
  const yMin = 1, yMax = 5;
  const scaleY = v => padY + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  const scaleX = i => padX + (i / Math.max(data.length - 1, 1)) * innerW;

  // Build phase bands: group consecutive same-phase days
  const bands = [];
  let cur = null;
  data.forEach((d, i) => {
    if (!d.phase) { cur = null; return; }
    if (!cur || cur.phase !== d.phase) {
      cur = { phase: d.phase, startIdx: i, endIdx: i };
      bands.push(cur);
    } else {
      cur.endIdx = i;
    }
  });

  // Build line paths (skip nulls)
  const buildPath = (key) => {
    let path = "";
    let started = false;
    data.forEach((d, i) => {
      if (d[key] == null) { started = false; return; }
      const x = scaleX(i);
      const y = scaleY(d[key]);
      path += started ? ` L${x.toFixed(1)},${y.toFixed(1)}` : `M${x.toFixed(1)},${y.toFixed(1)}`;
      started = true;
    });
    return path;
  };

  const moodPath = buildPath("mood");
  const energyPath = buildPath("energy");
  const hasAnyData = data.some(d => d.mood != null || d.energy != null);
  const phasesInData = Array.from(new Set(bands.map(b => b.phase)));

  return (
    <div
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 18px", boxShadow: "var(--shadow-sm)" }}
      role="group"
      aria-label="Mood and energy over last 60 days with cycle phase overlay"
    >
      <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--slate-500, #64748B)", fontFamily: "'Inter', sans-serif" }}>
        Mood & energy · last 60 days
      </p>
      <p style={{ fontSize: 11, color: "var(--slate-500, #64748B)", fontFamily: "'Inter', sans-serif", marginTop: 3 }}>
        Shaded bands show your cycle phase
      </p>

      {!hasAnyData ? (
        <p style={{ fontSize: 13, color: "var(--slate-500, #64748B)", fontFamily: "'Inter', sans-serif", marginTop: 18, textAlign: "center", padding: "20px 8px" }}>
          Log mood and energy to see the pattern.
        </p>
      ) : (
        <>
          <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ marginTop: 10, display: "block" }} aria-hidden="true">
            {bands.map((b, i) => {
              const x1 = scaleX(b.startIdx);
              const x2 = scaleX(b.endIdx) + (innerW / Math.max(data.length - 1, 1));
              return (
                <rect
                  key={i}
                  x={x1}
                  y={padY}
                  width={Math.max(x2 - x1, 1)}
                  height={innerH}
                  fill={PHASE_COLORS[b.phase]}
                />
              );
            })}
            {/* grid: horizontal lines at 2, 3, 4 */}
            {[2, 3, 4].map(v => (
              <line
                key={v}
                x1={padX}
                x2={w - padX}
                y1={scaleY(v)}
                y2={scaleY(v)}
                stroke="var(--border)"
                strokeWidth="0.5"
                strokeDasharray="2,3"
              />
            ))}
            {moodPath && (
              <path d={moodPath} fill="none" stroke="var(--rose-deep, #E11D74)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {energyPath && (
              <path d={energyPath} fill="none" stroke="var(--sage, #7A9E8E)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 10, fontSize: 11, fontFamily: "'Inter', sans-serif", color: "var(--slate-500, #64748B)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 14, height: 2, backgroundColor: "var(--rose-deep, #E11D74)", borderRadius: 2 }} /> Mood
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 14, height: 2, backgroundColor: "var(--sage, #7A9E8E)", borderRadius: 2 }} /> Energy
            </span>
            <span style={{ width: 1, height: 10, backgroundColor: "var(--border)" }} />
            {phasesInData.map(p => (
              <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: PHASE_COLORS[p].replace("0.10", "0.35").replace("0.12", "0.35") }} />
                {PHASE_LABELS[p]}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
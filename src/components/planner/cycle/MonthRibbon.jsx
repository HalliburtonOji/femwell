import { useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// MonthRibbon — Planner Phase 2 A2-1 (MP-A2).
//
// Signature "snake-like calendar" on the Cycle tab. 5 weekly ribbons, each a
// `display: grid` of 7 day cells with a phase-gradient background flowing
// across the row. Each day cell shows its day-number + a small activity bar
// (height 3px) keyed to that day's habit-completion ratio.
//
// Today's cell gets a plum dot (top-right) + a plum outline. Tapping any day
// cell calls `onNavigateToToday(dateISO)` which switches the tab to Today and
// retargets that date — leverages the C0 ?view= + ?selected= plumbing.
//
// Replaces the C0 "Month ribbon" placeholder at the `ribbon` anchor.
//
// Spec ref: claude-state/base44_mps/2026-05-15_planner_phase2_A2/spec.md §A2-1.
// Visual reference: claude-state/demos/femwell_planner_phase2_demo.html .ribbons.
// Brand-voice rules (binding):
//   - permissive aria-labels, no body-negative framing
//   - no emoji, no Playfair, no #C084FC
//   - chevrons navigate visually only (don't change selected day)
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_COLOR = {
  menstrual:  "#B84A41",
  follicular: "#E67F73",
  ovulatory:  "#F2A99A",
  luteal:     "#8A5F74",
  off:        "#F0E5D8",
};

const PHASE_LABEL_NICE = {
  menstrual:  "period",
  follicular: "follicular",
  ovulatory:  "ovulatory",
  luteal:     "luteal",
  off:        null,
};

function toDateStr(d) {
  return d.toISOString().split("T")[0];
}

// Same shape as Planner.jsx `phaseForDate` but takes an explicit ISO date.
// Falls back to "off" for users with no cycle data or dates pre-cycle-start.
function phaseForDate(profile, dateISO) {
  const last = profile?.last_period_start_date;
  if (!last) return null;
  const cycleLength = Number(profile?.cycle_avg_length) || 28;
  const periodLength = Number(profile?.period_length) || 5;
  const start = new Date(last);
  const target = new Date(dateISO);
  const diff = Math.floor((target - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  const day = (diff % cycleLength) + 1;
  if (day <= periodLength) return "menstrual";
  if (day <= cycleLength * 0.5 - 2) return "follicular";
  if (day <= cycleLength * 0.5 + 2) return "ovulatory";
  return "luteal";
}

function dayOfCycle(profile, dateISO) {
  const last = profile?.last_period_start_date;
  if (!last) return null;
  const cycleLength = Number(profile?.cycle_avg_length) || 28;
  const target = new Date(dateISO);
  const start = new Date(last);
  const diff = Math.floor((target - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  return (diff % cycleLength) + 1;
}

// Calendar grid for a month — 5 ISO-style weeks (Mon-first).
// Pads with off-month days so each row is always 7 cells.
function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Mon=0, Sun=6 (ISO).
  const firstWeekday = (first.getDay() + 6) % 7;
  const startDate = new Date(first);
  startDate.setDate(startDate.getDate() - firstWeekday);
  const weeks = [];
  for (let w = 0; w < 6; w += 1) {
    const days = [];
    for (let d = 0; d < 7; d += 1) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + (w * 7 + d));
      days.push({
        dateISO: toDateStr(day),
        dayNum: day.getDate(),
        isOff: day.getMonth() !== month,
      });
    }
    weeks.push(days);
    // Stop once we've shown the last day of the month.
    if (days[6].dateISO >= toDateStr(last) && days[6].dateISO !== days[0].dateISO) break;
  }
  return weeks.slice(0, 6);
}

// Build a CSS linear-gradient string from 7 phase tokens. Centers each phase
// color at the midpoint of its day slice so adjacent phases blend smoothly
// across cell borders — the "snake-like" flow the demo achieves by hand.
function ribbonGradient(phases) {
  if (!phases || phases.length === 0) return PHASE_COLOR.off;
  const stops = phases.map((p, i) => {
    const center = ((i * 100) / 7) + (100 / 14); // midpoint of i'th 7th
    const color = PHASE_COLOR[p || "off"] || PHASE_COLOR.off;
    return { center, color };
  });
  const parts = [
    `${stops[0].color} 0%`,
    ...stops.map((s) => `${s.color} ${s.center.toFixed(2)}%`),
    `${stops[stops.length - 1].color} 100%`,
  ];
  return `linear-gradient(to right, ${parts.join(", ")})`;
}

function activityBarWidth(completedCount, totalRituals) {
  if (!totalRituals || totalRituals <= 0) return null;
  const ratio = completedCount / totalRituals;
  if (ratio <= 0) return null;
  if (ratio < 1 / 3) return "55%";
  if (ratio < 2 / 3) return "75%";
  return "95%";
}

// Build a {dateISO → {completed,total}} map from habitLogs. Accepts both
// HabitLogs writer shapes (Planner.jsx writes habit_name+is_completed;
// Track.jsx writes habit_type+completed).
function buildActivityByDate(habitLogs) {
  const byDay = new Map();
  for (const h of habitLogs || []) {
    if (!h?.date) continue;
    const name = h.habit_type || h.habit_name;
    if (!name) continue;
    const completed = (typeof h.completed === "boolean") ? h.completed : (h.is_completed !== false);
    const entry = byDay.get(h.date) || { habits: new Map() };
    const prev = entry.habits.get(name) || false;
    entry.habits.set(name, prev || completed);
    byDay.set(h.date, entry);
  }
  const out = new Map();
  for (const [k, v] of byDay.entries()) {
    let total = 0; let done = 0;
    for (const ok of v.habits.values()) { total += 1; if (ok) done += 1; }
    out.set(k, { completed: done, total });
  }
  return out;
}

export default function MonthRibbon({ profile, habitLogs = [], today = new Date(), onNavigateToToday }) {
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const weeks = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const phaseByDay = useMemo(() => {
    const m = new Map();
    for (const week of weeks) for (const c of week) {
      m.set(c.dateISO, c.isOff ? "off" : (phaseForDate(profile, c.dateISO) || "off"));
    }
    return m;
  }, [weeks, profile]);
  const activityByDay = useMemo(() => buildActivityByDate(habitLogs), [habitLogs]);

  const todayISO = toDateStr(today);
  const monthLabel = cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  // Header sub — "luteal week · period week of 27" — mirrors demo. Built from
  // the most-common phase in the current visible month + the day of cycle for today.
  const subLine = useMemo(() => {
    const phasesThisMonth = Array.from(phaseByDay.values()).filter((p) => p && p !== "off");
    if (phasesThisMonth.length === 0) return "Tap a day to view in Today.";
    const tally = new Map();
    for (const p of phasesThisMonth) tally.set(p, (tally.get(p) || 0) + 1);
    const sorted = Array.from(tally.entries()).sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0]?.[0];
    const d = dayOfCycle(profile, todayISO);
    const nicePhase = PHASE_LABEL_NICE[dominant] || "cycle";
    return d ? `${nicePhase} week · day ${d}` : `${nicePhase} window`;
  }, [phaseByDay, profile, todayISO]);

  const handlePrev = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const handleNext = () => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  const handleCellClick = (dateISO) => {
    if (typeof onNavigateToToday === "function") onNavigateToToday(dateISO);
  };

  return (
    <section
      aria-label={`Cycle ribbon for ${monthLabel}. Tap any day to view in Today.`}
      style={wrapStyle}
    >
      <div style={headRowStyle}>
        <div>
          <p style={titleStyle}>{monthLabel}</p>
          <p style={metaStyle}>{subLine}</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous month"
            style={chevBtnStyle}
          >‹</button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next month"
            style={chevBtnStyle}
          >›</button>
        </div>
      </div>

      <div style={weekdayRowStyle} aria-hidden="true">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} style={weekdayLabelStyle}>{d}</div>
        ))}
      </div>

      <div style={ribbonsContainerStyle}>
        {weeks.map((days, wi) => {
          const phases = days.map((c) => phaseByDay.get(c.dateISO) || "off");
          const allOff = phases.every((p) => p === "off");
          const background = allOff
            ? PHASE_COLOR.off
            : ribbonGradient(phases);
          return (
            <div
              key={wi}
              style={{ ...ribbonStyle, background }}
            >
              {days.map((cell) => {
                const phase = phaseByDay.get(cell.dateISO) || "off";
                const isToday = cell.dateISO === todayISO;
                const isOvulatory = phase === "ovulatory"; // light cell — needs darker text
                const activity = activityByDay.get(cell.dateISO);
                const barWidth = activity ? activityBarWidth(activity.completed, activity.total) : null;
                const ariaPhase = PHASE_LABEL_NICE[phase] ? `, ${PHASE_LABEL_NICE[phase]} day` : "";
                const monthName = new Date(cell.dateISO).toLocaleDateString("en-GB", { month: "long" });
                const ariaLabel = `${monthName} ${cell.dayNum}${ariaPhase}${isToday ? ", today" : ""}`;
                return (
                  <button
                    key={cell.dateISO}
                    type="button"
                    onClick={() => handleCellClick(cell.dateISO)}
                    aria-label={ariaLabel}
                    aria-current={isToday ? "date" : undefined}
                    style={{
                      ...cellBtnStyle,
                      outline: isToday ? "2px solid var(--plum, #4A2A3A)" : "none",
                      outlineOffset: isToday ? "-1px" : 0,
                      background: isToday ? "rgba(255, 250, 245, 0.55)" : "transparent",
                    }}
                  >
                    {isToday && <span style={todayDotStyle} aria-hidden="true" />}
                    <span
                      style={{
                        ...dayNumStyle,
                        color: cell.isOff
                          ? "rgba(74,42,58,0.35)"
                          : isOvulatory
                            ? "var(--plum, #4A2A3A)"
                            : "#FFF5EC",
                      }}
                    >
                      {cell.dayNum}
                    </span>
                    {barWidth && (
                      <span
                        aria-hidden="true"
                        style={{
                          ...activityBarStyle,
                          width: barWidth,
                          background: isOvulatory ? "rgba(74,42,58,0.6)" : "rgba(255, 245, 236, 0.85)",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Styles ──
const wrapStyle = {
  background: "var(--surface, #FFFFFF)",
  borderRadius: 16,
  padding: "14px 16px 16px",
  border: "1px solid var(--border, rgba(74,42,58,0.10))",
  marginBottom: 16,
};
const headRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
};
const titleStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 22,
  fontWeight: 500,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.01em",
  margin: 0,
};
const metaStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--plum-mute, #8A7584)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  margin: "2px 0 0",
};
const chevBtnStyle = {
  width: 30,
  height: 30,
  borderRadius: 9999,
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.10))",
  background: "var(--surface, #FFFFFF)",
  color: "var(--plum, #4A2A3A)",
  fontFamily: "'Fraunces', serif",
  fontSize: 18,
  fontWeight: 600,
  lineHeight: 1,
  cursor: "pointer",
  padding: 0,
};
const weekdayRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 4,
  padding: "0 2px",
  marginBottom: 6,
};
const weekdayLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  fontWeight: 600,
  color: "var(--plum-mute, #8A7584)",
  textAlign: "center",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};
const ribbonsContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
const ribbonStyle = {
  position: "relative",
  borderRadius: 14,
  padding: "8px 6px",
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 2,
  minHeight: 72,
  overflow: "hidden",
};
const cellBtnStyle = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "stretch",
  padding: "4px 5px 5px",
  borderRadius: 7,
  minHeight: 56,
  border: "none",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  textAlign: "left",
  appearance: "none",
};
const todayDotStyle = {
  position: "absolute",
  top: 4,
  right: 4,
  width: 5,
  height: 5,
  borderRadius: 9999,
  background: "var(--plum, #4A2A3A)",
  zIndex: 3,
};
const dayNumStyle = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 700,
  fontSize: 13,
  lineHeight: 1,
};
const activityBarStyle = {
  height: 3,
  borderRadius: 2,
  opacity: 0.7,
  display: "block",
  alignSelf: "flex-start",
  marginTop: "auto",
};

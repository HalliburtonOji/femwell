import { useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CycleMirrorSundayTile — Planner Phase 2 C8 (MP-A2).
//
// Gentle "looking-back" mirror that only renders if:
//   - today is Sunday (locale-day === 0)
//   - the user has >= 4 observed cycles (from cycle_prediction_meta)
//
// Two cells (per spec):
//   1. Pattern % — how often a habit hit on this phase-day across the recent
//      cycles we can see in the loaded HabitLogs window.
//   2. Strongest anchor — the habit with the highest hit-rate at this
//      phase-day across those cycles.
//
// Plus a single closing question CTA: "Want to plan next cycle with this in
// mind?" linking to the Plan-with-Jess surface (deferred to C9 wire-up — for
// now it routes to /Planner?_smartView=streaky as a soft fallback).
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C8.
// Voice rules (binding):
//   - permissive ("often shows up"), not prescriptive
//   - no body-negative framing
//   - "softer" / "steady" never "low" / "weak"
//   - no emoji
// ─────────────────────────────────────────────────────────────────────────────

const MIN_CYCLES = 4;
const PHASE_DAY_WINDOW = 1;     // match cycle-day ±1 so we don't miss days
const SAMPLE_RECENT_CYCLES = 4; // look back at most 4 cycles

function isSunday(date = new Date()) {
  return date.getDay() === 0;
}

function bucketHabitsByDay(habitLogs) {
  // Roll up {date → habit_type → completed}. Multiple rows per (date, habit)
  // collapse to "any completed".
  const m = new Map();
  for (const h of habitLogs || []) {
    if (!h?.date || !h?.habit_type) continue;
    const dayMap = m.get(h.date) || new Map();
    const prev = dayMap.get(h.habit_type) || false;
    dayMap.set(h.habit_type, prev || !!h.completed);
    m.set(h.date, dayMap);
  }
  return m;
}

function pickSamplesForPhaseDay({ profile, cycleDay, todayStr }) {
  // Compute the dates in earlier cycles that mirror today's cycle-day,
  // bounded by SAMPLE_RECENT_CYCLES.
  const cycleAvg = Number(profile?.cycle_avg_length) || 28;
  if (!cycleDay) return [];
  const out = [];
  for (let i = 1; i <= SAMPLE_RECENT_CYCLES; i += 1) {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - cycleAvg * i);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}

export default function CycleMirrorSundayTile({ profile, habitLogs = [], phase, cycleDay }) {
  const meta = profile?.cycle_prediction_meta || null;
  const cyclesObserved = Number(meta?.cycles_observed) || 0;
  const sunday = isSunday(new Date());

  // All hooks called unconditionally per rules-of-hooks. Gate the render
  // AFTER all useMemo calls.
  const todayStr = new Date().toISOString().split("T")[0];
  const samples = useMemo(
    () => pickSamplesForPhaseDay({ profile, cycleDay, todayStr }),
    [profile, cycleDay, todayStr]
  );
  const byDay = useMemo(() => bucketHabitsByDay(habitLogs), [habitLogs]);

  // Tolerance window: each sample matches ±PHASE_DAY_WINDOW days so a logged
  // ritual a day off still counts.
  const samplesInBounds = useMemo(() => {
    return samples.flatMap((s) => {
      const base = new Date(s);
      const dates = [];
      for (let dx = -PHASE_DAY_WINDOW; dx <= PHASE_DAY_WINDOW; dx += 1) {
        const d = new Date(base);
        d.setDate(d.getDate() + dx);
        dates.push(d.toISOString().split("T")[0]);
      }
      return dates;
    });
  }, [samples]);

  // Per-habit hits across the sampled days. We count one hit per habit per
  // sample (collapsed via byDay).
  const habitStats = useMemo(() => {
    const stats = new Map();
    for (const d of samplesInBounds) {
      const dayMap = byDay.get(d);
      if (!dayMap) continue;
      for (const [habit, completed] of dayMap.entries()) {
        const cur = stats.get(habit) || { name: habit, total: 0, hits: 0 };
        cur.total += 1;
        if (completed) cur.hits += 1;
        stats.set(habit, cur);
      }
    }
    return Array.from(stats.values()).sort((a, b) => (b.hits / Math.max(1, b.total)) - (a.hits / Math.max(1, a.total)));
  }, [samplesInBounds, byDay]);

  // Gate AFTER all hooks per spec acceptance "Renders only on Sundays at
  // qualifying users".
  if (!sunday) return null;
  if (cyclesObserved < MIN_CYCLES) return null;

  // If we have ZERO matched-day data the tile would mislead — render an
  // honest "still learning" copy at the same surface so qualified users
  // don't see the section disappear on weeks with sparse history.
  const top = habitStats[0] || null;
  const allHits = habitStats.reduce((s, h) => s + h.hits, 0);
  const allTotal = habitStats.reduce((s, h) => s + h.total, 0);
  const patternPct = allTotal > 0 ? Math.round((allHits / allTotal) * 100) : null;

  return (
    <section
      aria-label="Cycle mirror — looking back at this phase-day"
      style={{
        background: "var(--surface, #FFFFFF)",
        borderRadius: 16,
        padding: "14px 16px",
        border: "1px solid var(--border, rgba(74,42,58,0.10))",
        marginBottom: 16,
      }}
    >
      <div style={headRowStyle}>
        <p style={kickerStyle}>Cycle mirror · Sunday look-back</p>
        <span style={tenseStyle}>{phase ? phase.toUpperCase() : "THIS PHASE"} · DAY {cycleDay || "—"}</span>
      </div>

      {patternPct == null ? (
        <p style={emptyStyle}>
          Not enough history at this phase-day yet — a couple more cycles of logging and your patterns will start to show up here.
        </p>
      ) : (
        <>
          <div style={cellsRowStyle}>
            <div style={cellStyle}>
              <p style={cellKickerStyle}>Pattern at this day</p>
              <p style={cellValueStyle}>{patternPct}<span style={cellUnitStyle}>%</span></p>
              <p style={cellSubStyle}>across your recent cycles</p>
            </div>
            <div style={cellStyle}>
              <p style={cellKickerStyle}>Strongest anchor</p>
              <p style={cellAnchorStyle}>{top?.name || "—"}</p>
              <p style={cellSubStyle}>
                {top ? `hit ${top.hits} of the ${top.total} matched day${top.total === 1 ? "" : "s"}` : "needs more data"}
              </p>
            </div>
          </div>
          <p style={ctaStyle}>
            Want to plan next cycle with this in mind?{" "}
            <a href="/Planner?_smartView=streaky" style={ctaLinkStyle}>Plan with Jess →</a>
          </p>
        </>
      )}
    </section>
  );
}

// ── Styles ──
const headRowStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 10,
  flexWrap: "wrap",
};
const kickerStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  margin: 0,
};
const tenseStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
};
const emptyStyle = {
  fontSize: 12.5,
  lineHeight: 1.55,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  margin: 0,
};
const cellsRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 10,
  marginBottom: 10,
};
const cellStyle = {
  background: "var(--cream-deep, #FAF4ED)",
  borderRadius: 12,
  padding: "10px 12px",
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.08))",
};
const cellKickerStyle = {
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.10em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  margin: "0 0 4px",
};
const cellValueStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 26,
  fontWeight: 600,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.01em",
  margin: 0,
};
const cellAnchorStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 16,
  fontWeight: 600,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.005em",
  margin: "0 0 4px",
  lineHeight: 1.25,
};
const cellUnitStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  marginLeft: 2,
};
const cellSubStyle = {
  fontSize: 11.5,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  margin: "4px 0 0",
};
const ctaStyle = {
  fontSize: 12.5,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  margin: 0,
  lineHeight: 1.55,
};
const ctaLinkStyle = {
  color: "var(--plum, #4A2A3A)",
  fontWeight: 700,
  textDecoration: "underline",
  textUnderlineOffset: 2,
};

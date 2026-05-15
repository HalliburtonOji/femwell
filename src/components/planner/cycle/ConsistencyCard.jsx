import { useMemo } from "react";
import { habitNameOf, habitCompletedOf } from "@/components/planner/cycle/habitLogNormalise";

// ─────────────────────────────────────────────────────────────────────────────
// ConsistencyCard — Planner Phase 2 C7 (MP-A2).
//
// "Consistency over 28 days" rhythm card on the Cycle tab. Counts the user's
// HabitLog completions over the last 28 days, expressed as a single hit-rate
// per habit. During the **menstrual phase** the card shows an auto-freeze
// chip telling the user we're not counting period-week days against their
// streak — protects rhythm from "drop" guilt during bleed days.
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C7.
// ─────────────────────────────────────────────────────────────────────────────

const WINDOW_DAYS = 28;

function toDateStr(d) {
  return d.toISOString().split("T")[0];
}

function daysAgoStr(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

export default function ConsistencyCard({ habitLogs = [], phase = null }) {
  const fromStr = useMemo(() => daysAgoStr(WINDOW_DAYS - 1), []);
  const toStr = useMemo(() => toDateStr(new Date()), []);

  // Group habit logs into per-habit { total, completed } over the window.
  // habitLogs here is the same flat array Planner.jsx already loads. The
  // codebase has two writers (Planner.jsx writes habit_name + is_completed;
  // Track.jsx writes habit_type + completed) so we use the shared normalisers
  // to read both shapes transparently. We count one row per habit per day;
  // multiple rows for the same habit/day collapse to "any completed".
  const perHabit = useMemo(() => {
    const inWindow = (habitLogs || []).filter((h) => h?.date && h.date >= fromStr && h.date <= toStr);
    const byKey = new Map();
    for (const h of inWindow) {
      const name = habitNameOf(h) || "Untitled habit";
      const completed = habitCompletedOf(h);
      const key = `${name}|${h.date}`;
      const prev = byKey.get(key);
      // Roll-up by (habit, date) — completed if any row says completed.
      byKey.set(key, prev ? { name, date: h.date, completed: prev.completed || completed } : { name, date: h.date, completed });
    }
    const out = new Map();
    for (const entry of byKey.values()) {
      const cur = out.get(entry.name) || { name: entry.name, total: 0, completed: 0 };
      cur.total += 1;
      if (entry.completed) cur.completed += 1;
      out.set(entry.name, cur);
    }
    return Array.from(out.values()).sort((a, b) => (b.completed / Math.max(1, b.total)) - (a.completed / Math.max(1, a.total))).slice(0, 6);
  }, [habitLogs, fromStr, toStr]);

  const isMenstrual = phase === "menstrual";

  return (
    <section
      aria-label="Consistency over 28 days"
      style={{
        background: "var(--surface, #FFFFFF)",
        borderRadius: 16,
        padding: "14px 16px",
        border: "1px solid var(--border, rgba(74,42,58,0.10))",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <p style={kickerStyle}>Consistency over 28 days</p>
        {isMenstrual && (
          <span role="status" style={freezeChipStyle} aria-label="Period-week auto-freeze active">
            Period-week freeze
          </span>
        )}
      </div>

      {perHabit.length === 0 ? (
        <p style={emptyStyle}>
          No habit history in the last 28 days yet. Log a couple of mornings and a quiet picture will start to draw itself.
        </p>
      ) : (
        <ul style={listStyle}>
          {perHabit.map((h) => {
            const pct = Math.round((h.completed / Math.max(1, h.total)) * 100);
            return (
              <li key={h.name} style={rowStyle}>
                <div style={rowHeadStyle}>
                  <span style={rowNameStyle}>{h.name}</span>
                  <span style={rowPctStyle}>{pct}%</span>
                </div>
                <div style={barOuterStyle} aria-hidden="true">
                  <div style={{ ...barFillStyle, width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p style={footnoteStyle}>
        {isMenstrual
          ? "Period-week days don't count against your streak — they're paused, not broken."
          : "A gentle picture across the cycle. Aim for steady, not perfect."}
      </p>
    </section>
  );
}

// ── Styles ──
const kickerStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
  margin: 0,
};
const freezeChipStyle = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  padding: "3px 10px",
  borderRadius: 9999,
  background: "var(--rose-soft, #F5D7CC)",
  color: "var(--rose-primary, #D45E52)",
  fontFamily: "'Inter', sans-serif",
};
const emptyStyle = {
  fontSize: 12.5,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  lineHeight: 1.5,
  margin: "4px 0 0",
};
const listStyle = { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10, marginTop: 4 };
const rowStyle = { display: "flex", flexDirection: "column", gap: 4 };
const rowHeadStyle = { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 };
const rowNameStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--plum, #4A2A3A)",
  fontFamily: "'Inter', sans-serif",
};
const rowPctStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--plum-2, #6B4559)",
  fontFamily: "'Inter', sans-serif",
  letterSpacing: "0.02em",
};
const barOuterStyle = {
  height: 6,
  borderRadius: 9999,
  background: "var(--border-subtle, rgba(74,42,58,0.08))",
  overflow: "hidden",
};
const barFillStyle = {
  height: "100%",
  background: "var(--sage, #7A9E8E)",
  transition: "width 240ms cubic-bezier(.4,0,.2,1)",
};
const footnoteStyle = {
  fontSize: 11.5,
  color: "var(--plum-mute, #8A7584)",
  fontStyle: "italic",
  fontFamily: "'Inter', sans-serif",
  margin: "10px 0 0",
};

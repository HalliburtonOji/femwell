import RitualReframeShimmer from "@/components/planner/today/RitualReframeShimmer";

// ─────────────────────────────────────────────────────────────────────────────
// WhatsUnfinishedCard — Planner Phase 2 A2-4 (visual fidelity).
//
// Cycle-tab card listing rituals the user has been stuck on for ≥3 days
// (same `stuckDaysByHabit` map Planner.jsx builds for the C7 reframe
// shimmer). Each line: ritual name + small "N days" badge + an italic
// gold reframe shimmer underneath (reuses `RitualReframeShimmer` with
// state="stuck"; localStorage 24h cache shared across surfaces).
//
// Hides entirely when no stuck items — spec acceptance.
//
// Mounts between Saved Rhythms carousel and Week Ahead card on Cycle tab.
//
// Spec ref: claude-state/base44_mps/2026-05-15_planner_phase2_A2/spec.md §A2-4 (6).
// Brand-voice rules: permissive copy, no emoji, no body-negative framing.
// ─────────────────────────────────────────────────────────────────────────────

const STUCK_DAYS_THRESHOLD = 3;

export default function WhatsUnfinishedCard({ stuckDaysByHabit, phase }) {
  const entries = Object.entries(stuckDaysByHabit || {})
    .filter(([, days]) => Number(days) >= STUCK_DAYS_THRESHOLD)
    .map(([name, days]) => ({ name, days: Number(days) }))
    .sort((a, b) => b.days - a.days);

  if (entries.length === 0) return null;

  return (
    <section aria-label="What's unfinished — rituals stuck for a few days" style={wrapStyle}>
      <div style={headRowStyle}>
        <p style={kickerStyle}>What's unfinished</p>
        <span style={tenseStyle}>STUCK · {entries.length}</span>
      </div>
      <p style={subStyle}>
        A gentle list of rituals that haven't landed in a few days. No pressure — these are invitations, not chores.
      </p>
      <ul style={listStyle}>
        {entries.map((e) => (
          <li key={e.name} style={itemStyle}>
            <div style={rowStyle}>
              <span style={nameStyle}>{e.name}</span>
              <span style={daysBadgeStyle}>{e.days} days</span>
            </div>
            <RitualReframeShimmer ritualName={e.name} phase={phase} state="stuck" />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Styles ──
const wrapStyle = {
  background: "var(--surface, #FFFFFF)",
  borderRadius: 16,
  padding: "14px 16px",
  border: "1px solid var(--border, rgba(74,42,58,0.10))",
  marginBottom: 16,
};
const headRowStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 6,
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
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #8A7584)",
  fontFamily: "'Inter', sans-serif",
};
const subStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5,
  color: "var(--plum-2, #6B4559)",
  margin: "0 0 10px",
  lineHeight: 1.55,
};
const listStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: 8,
};
const itemStyle = {
  padding: "8px 10px",
  borderRadius: 10,
  background: "var(--cream-deep, #FAF4ED)",
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.08))",
};
const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};
const nameStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.005em",
};
const daysBadgeStyle = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.06em",
  padding: "3px 9px",
  borderRadius: 9999,
  background: "rgba(201, 169, 92, 0.18)",
  color: "var(--gold, #C9A95C)",
  fontFamily: "'Inter', sans-serif",
};

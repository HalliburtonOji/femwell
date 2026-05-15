// ─────────────────────────────────────────────────────────────────────────────
// WarmthBundleCycle — Planner Phase 2 C9 (MP-A3).
//
// Three Cycle-tab surfaces in the warmth-bundle voice + cadence:
//   1. WeekAheadCard — replaces the C0 stub. Forward-looking framing of the
//      next 7 days with a Jess-nudge CTA at the bottom.
//   2. AstraSidecar — small card teasing today's Astra Cole horoscope; deep-
//      links to /Lifestyle?tab=horoscope per spec acceptance.
//   3. PlanMyNextCycleCTA — short tail card with "Plan my next cycle" button
//      routing to the Plan-with-Jess surface (?_smartView=streaky soft
//      fallback for now until a full surface lands).
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C9.
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABEL = {
  menstrual: "menstrual",
  follicular: "follicular",
  ovulatory: "ovulatory",
  luteal: "luteal",
};

function nextSundayLine() {
  const now = new Date();
  const day = now.getDay();
  // Days until next Sunday (0). If today is Sunday, point at "this Sunday"
  // semantically (i.e. today's review).
  const offset = day === 0 ? 0 : 7 - day;
  const target = new Date(now);
  target.setDate(target.getDate() + offset);
  return target.toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short" });
}

export function WeekAheadCard({ phase, nextPeriodEta, etaWindowDays }) {
  const sundayLine = nextSundayLine();
  const phaseLine = phase ? PHASE_LABEL[phase] || phase : "this week";
  const etaLine = nextPeriodEta
    ? `Period eta ${nextPeriodEta}${etaWindowDays ? ` (±${etaWindowDays}d)` : ""}.`
    : "Logging a couple more cycles will tighten next-period estimates.";

  return (
    <section aria-label="Week Ahead" style={cardStyle}>
      <div style={headRowStyle}>
        <p style={kickerStyle}>Week ahead</p>
        <span style={tenseStyle}>{sundayLine.toUpperCase()}</span>
      </div>
      <p style={mainStyle}>A gentle look at what's coming — your {phaseLine} window often sets the cadence.</p>
      <p style={subStyle}>{etaLine}</p>
      <a
        href="/Planner?_smartView=streaky"
        style={ctaStyle}
        aria-label="Nudge from Jess — plan with Jess"
      >
        Plan with Jess →
      </a>
    </section>
  );
}

export function AstraSidecar() {
  return (
    <section aria-label="Astra Cole sidecar" style={astraCardStyle}>
      <div style={headRowStyle}>
        <p style={kickerStyle}>Astra Cole · sidecar</p>
        <span style={tenseStyle}>TODAY · HOROSCOPE</span>
      </div>
      <p style={mainStyle}>A short reading from Astra is waiting in Lifestyle.</p>
      <p style={subStyle}>
        Read alongside your cycle, not in place of it — a second mirror, gently held.
      </p>
      <a
        href="/Lifestyle?tab=horoscope"
        style={ctaStyle}
        aria-label="Open today's Astra reading"
      >
        Open today's reading →
      </a>
    </section>
  );
}

export function PlanMyNextCycleCTA() {
  return (
    <section aria-label="Plan my next cycle" style={planCardStyle}>
      <div style={headRowStyle}>
        <p style={kickerStyle}>Plan my next cycle</p>
        <span style={tenseStyle}>WITH JESS</span>
      </div>
      <p style={mainStyle}>Bring this month's patterns into next month's plan.</p>
      <p style={subStyle}>
        A short walk-through of anchors to keep, things to soften, and one nudge for the phase that often feels hardest.
      </p>
      <a
        href="/Planner?_smartView=streaky"
        style={primaryBtnStyle}
        aria-label="Start planning the next cycle with Jess"
      >
        Start planning →
      </a>
    </section>
  );
}

// ── Styles ──
const cardStyle = {
  background: "var(--surface, #FFFFFF)",
  borderRadius: 16,
  padding: "14px 16px",
  border: "1px solid var(--border, rgba(74,42,58,0.10))",
  marginBottom: 16,
};
const astraCardStyle = {
  ...cardStyle,
  background: "var(--cream-deep, #FAF4ED)",
  borderLeft: "4px solid var(--gold, #C9A95C)",
};
const planCardStyle = { ...cardStyle, background: "var(--cream, #FFFAF5)" };

const headRowStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 8,
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
const mainStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 16,
  lineHeight: 1.4,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.005em",
  margin: "0 0 4px",
};
const subStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5,
  lineHeight: 1.55,
  color: "var(--plum-2, #6B4559)",
  margin: "0 0 10px",
};
const ctaStyle = {
  display: "inline-flex",
  alignItems: "center",
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--plum, #4A2A3A)",
  textDecoration: "underline",
  textUnderlineOffset: 2,
};
const primaryBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "9px 16px",
  borderRadius: 9999,
  background: "var(--plum, #4A2A3A)",
  color: "var(--cream, #FFFAF5)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
};

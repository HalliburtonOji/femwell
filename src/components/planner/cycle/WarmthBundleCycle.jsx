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

const PHASE_DOT = {
  menstrual:  "#B84A41",
  follicular: "#E67F73",
  ovulatory:  "#F2A99A",
  luteal:     "#8A5F74",
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

// Same shape as Planner.jsx phaseForDate / MonthRibbon. Returns one of
// menstrual|follicular|ovulatory|luteal or null when no cycle data.
function phaseForDate(profile, targetDate) {
  if (!profile) return null;
  const last = profile.last_period_start_date;
  if (!last) return null;
  const cycleLength = Number(profile.cycle_avg_length) || 28;
  const periodLength = Number(profile.period_length) || 5;
  const start = new Date(last);
  const diff = Math.floor((targetDate - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  const day = (diff % cycleLength) + 1;
  if (day <= periodLength) return "menstrual";
  if (day <= cycleLength * 0.5 - 2) return "follicular";
  if (day <= cycleLength * 0.5 + 2) return "ovulatory";
  return "luteal";
}

function buildAheadChips(profile, count = 5) {
  const out = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 1; i <= count; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    out.push({
      key: d.toISOString().split("T")[0],
      dayLabel: d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase().slice(0, 3),
      dayNum: d.getDate(),
      phase: phaseForDate(profile, d),
    });
  }
  return out;
}

function formatEtaDate(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
  } catch { return null; }
}

export function WeekAheadCard({ phase, nextPeriodEta, etaWindowDays, confidencePct, cyclesObserved, profile }) {
  const sundayLine = nextSundayLine();
  const phaseLine = phase ? PHASE_LABEL[phase] || phase : "this week";
  const aheadChips = buildAheadChips(profile, 5);
  const showChips = aheadChips.some((c) => !!c.phase); // hide chips entirely when no cycle data
  const showEtaFooter = (Number(cyclesObserved) || 0) >= 4 && nextPeriodEta;
  const etaPretty = formatEtaDate(nextPeriodEta);

  return (
    <section aria-label="Week Ahead" style={cardStyle}>
      <div style={headRowStyle}>
        <p style={kickerStyle}>Week ahead</p>
        <span style={tenseStyle}>{sundayLine.toUpperCase()}</span>
      </div>
      <p style={mainStyle}>A gentle look at what's coming — your {phaseLine} window often sets the cadence.</p>
      {!showChips && (
        <p style={subStyle}>Logging a couple more cycles will tighten next-period estimates.</p>
      )}

      {showChips && (
        <div style={aheadRowStyle} aria-label="Five-day forecast">
          {aheadChips.map((c) => (
            <div key={c.key} style={chipStyle}>
              <p style={chipDayStyle}>{c.dayLabel}</p>
              <p style={chipNumStyle}>{c.dayNum}</p>
              <span
                aria-hidden="true"
                style={{
                  ...chipDotStyle,
                  background: c.phase ? PHASE_DOT[c.phase] : "var(--border, rgba(74,42,58,0.18))",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {showEtaFooter ? (
        <div style={etaFooterStyle}>
          <p style={etaTextStyle}>
            Period ETA <strong style={{ color: "var(--plum, #4A2A3A)" }}>{etaPretty}</strong>
            {etaWindowDays ? ` · ±${etaWindowDays}d` : ""}
            {confidencePct ? ` · ${Math.round(confidencePct)}% confident` : ""}
          </p>
          <a
            href="/Planner?_smartView=streaky"
            style={primaryPillStyle}
            aria-label="Plan with Jess"
          >
            Plan with Jess →
          </a>
        </div>
      ) : (
        <a
          href="/Planner?_smartView=streaky"
          style={ctaStyle}
          aria-label="Nudge from Jess — plan with Jess"
        >
          Plan with Jess →
        </a>
      )}
    </section>
  );
}

export function AstraSidecar({ profile }) {
  // Spec default #7: only render when the user has set a zodiac sign / birthday
  // — otherwise the "Open today's reading" CTA lands them on a horoscope tab
  // that's empty for them. Sun-sign is derived from `profile.birthday` (see
  // HoroscopeTab `getSunSign(birthday)`).
  const hasZodiac = !!profile?.birthday;
  if (!hasZodiac) return null;

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
  background: "linear-gradient(180deg, var(--cream, #FFFAF5) 0%, var(--cream-2, #FFF5EC) 100%)",
  borderRadius: 16,
  padding: "14px 16px",
  border: "1px solid rgba(74,42,58,0.10)",
  borderLeft: "4px solid var(--teal, #5F8A85)",
  boxShadow: "0 1px 3px rgba(74,42,58,0.05)",
  marginBottom: 16,
};
const astraCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, rgba(201,169,92,0.14) 0%, var(--cream, #FFFAF5) 100%)",
  borderLeft: "4px solid var(--gold, #C9A95C)",
};
const planCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, rgba(74,42,58,0.06) 0%, var(--cream, #FFFAF5) 100%)",
  borderLeft: "4px solid var(--plum, #4A2A3A)",
};

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

// ── A2-2 Week Ahead chip strip + ETA footer ──
const aheadRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 6,
  marginBottom: 10,
};
const chipStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  padding: "8px 4px 10px",
  borderRadius: 10,
  background: "var(--cream-deep, #FAF4ED)",
  border: "1px solid var(--border-subtle, rgba(74,42,58,0.08))",
};
const chipDayStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.10em",
  color: "var(--plum-mute, #8A7584)",
  margin: 0,
};
const chipNumStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 18,
  fontWeight: 600,
  color: "var(--plum, #4A2A3A)",
  margin: 0,
  letterSpacing: "-0.01em",
};
const chipDotStyle = {
  width: 5,
  height: 5,
  borderRadius: 9999,
  display: "block",
};
const etaFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  marginTop: 9,
  paddingTop: 9,
  borderTop: "1px solid rgba(74,42,58,0.06)",
  flexWrap: "wrap",
};
const etaTextStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10.5,
  color: "var(--plum-mute, #8A7584)",
  letterSpacing: "0.04em",
  margin: 0,
};
const primaryPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "5px 11px",
  borderRadius: 9999,
  background: "var(--plum, #4A2A3A)",
  color: "var(--cream, #FFFAF5)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textDecoration: "none",
};

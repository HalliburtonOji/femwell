import { useMemo } from "react";
import {
  INK_NIGHT, INK_NIGHT_MUTE, ACCENT_NIGHT, RULE_NIGHT,
  PERIOD, FOLLICULAR, OVULATORY, LUTEAL,
} from "../styles/tokens.jsx";
import SectionWrap from "../SectionWrap";

// ─────────────────────────────────────────────────────────────────────────────
// CycleMoonDial — Section §4 (per demo §4).
//
// Composite SVG dial:
//   - Outer ring = lunar 29.5-day synodic cycle. Dashed fill to today's phase.
//   - Inner ring = menstrual 28-day cycle. Stroke colour by phase token.
//   - Two discs at today's positions (lunar = cream, cycle = accent).
//   - Centre label "Today / TUE 13 MAY" (UK format, en-GB).
//   - Right legend: two coloured rows + italic reading.cycle_moon_body line.
//
// Replaces the old RingWrap two-circle stub from H2a.
// ─────────────────────────────────────────────────────────────────────────────

const LUNAR_DAYS = 29.5;
const CYCLE_DAYS_DEFAULT = 28;
const PHASE_STROKE = {
  menstrual:  PERIOD,
  follicular: FOLLICULAR,
  ovulatory:  OVULATORY,
  luteal:     LUTEAL,
};

function renderEm(text) {
  if (!text) return "";
  const escaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/g, '<em style="font-style:italic;color:#E89289;">$1</em>')
    .replace(/\*(.+?)\*/g, '<em style="font-style:italic;color:#E89289;">$1</em>');
}

function ukShortDate(d) {
  // "TUE 13 MAY"
  return d
    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    .toUpperCase()
    .replace(",", "");
}

function defaultCycleMoonBody(cyclePhase, moon, cycleDay) {
  if (!cyclePhase) {
    return `The moon is ${moon?.short?.toLowerCase() || "moving"}. Log a cycle in Track and the sky starts speaking to your body.`;
  }
  const verb = moon?.waxing ? "ahead" : "settling";
  const half = cycleDay && cycleDay > 14 ? "half-way through" : "still rising";
  return `The moon is ${verb}. Your cycle is ${half}.`;
}

export default function CycleMoonDial({
  cyclePhase,
  cycleDay,
  cycleLength,
  moon,
  reading,
}) {
  const now = useMemo(() => new Date(), []);
  const dateLabel = useMemo(() => ukShortDate(now), [now]);
  const cycleTotal = cycleLength || CYCLE_DAYS_DEFAULT;

  // Lunar position 0..1 from moon.position (computed upstream).
  const lunarPos = (typeof moon?.position === "number")
    ? Math.min(0.999, Math.max(0, moon.position))
    : 0.3;
  const lunarDay = Math.max(0, Math.min(LUNAR_DAYS, lunarPos * LUNAR_DAYS));

  // Cycle position — derive from cycleDay if available, else neutral.
  const cyclePos = cycleDay
    ? Math.min(0.999, Math.max(0, (cycleDay - 1) / cycleTotal))
    : 0.5;

  // Stroke dashes — circumference for each ring.
  const outerR = 58;
  const innerR = 42;
  const outerC = 2 * Math.PI * outerR;
  const innerC = 2 * Math.PI * innerR;
  const outerFill = outerC * lunarPos;
  const innerFill = innerC * cyclePos;

  // Disc positions — angle in degrees from 12 o'clock, clockwise.
  const outerAngle = lunarPos * 360;
  const innerAngle = cyclePos * 360;

  const cycleStroke = PHASE_STROKE[cyclePhase] || LUTEAL;
  const body = reading?.cycle_moon_body || defaultCycleMoonBody(cyclePhase, moon, cycleDay);

  const moonLabel = moon?.short
    ? `${moon.short}${moon.illumination != null ? ` · ${moon.illumination}%` : ""}`
    : "Lunar";
  const cycleLabel = (() => {
    if (!cyclePhase) return "Log a cycle in Track to enable";
    const cap = cyclePhase.charAt(0).toUpperCase() + cyclePhase.slice(1);
    if (cycleDay) {
      const toNext = Math.max(0, cycleTotal - cycleDay);
      return `${cap} · ${toNext} days to next period`;
    }
    return cap;
  })();

  return (
    <SectionWrap>
      <div style={dialHeadStyle}>
        <h2 style={dialTitleStyle}>
          Cycle <em style={{ fontStyle: "italic", color: ACCENT_NIGHT }}>× Moon</em>
        </h2>
        <span style={dialMetaStyle}>
          {cycleDay ? `Day ${cycleDay} of ${cycleTotal}` : "Cycle not tracked"}
          {` · Lunar ${lunarDay.toFixed(1).replace(/\.0$/, "")} of ${LUNAR_DAYS}`}
        </span>
      </div>
      <div style={dialWrapStyle}>
        <svg viewBox="0 0 130 130" style={dialSvgStyle} aria-hidden="true">
          {/* Outer ring (lunar 29.5d) — background */}
          <circle
            cx="65" cy="65" r={outerR}
            fill="none"
            stroke="rgba(245,230,211,0.10)"
            strokeWidth="6"
          />
          {/* Outer ring — filled to phase, dashed */}
          <circle
            cx="65" cy="65" r={outerR}
            fill="none"
            stroke={INK_NIGHT_MUTE}
            strokeWidth="6"
            strokeDasharray={`${outerFill} ${outerC}`}
            strokeLinecap="butt"
            transform="rotate(-90 65 65)"
          />
          {/* Outer disc — today's moon position */}
          <g transform={`rotate(${outerAngle} 65 65)`}>
            <circle cx="65" cy={65 - outerR} r="5" fill={INK_NIGHT} />
          </g>

          {/* Inner ring (menstrual 28d) — background */}
          <circle
            cx="65" cy="65" r={innerR}
            fill="none"
            stroke="rgba(245,230,211,0.10)"
            strokeWidth="6"
          />
          {/* Inner ring — filled to phase, coloured by phase */}
          <circle
            cx="65" cy="65" r={innerR}
            fill="none"
            stroke={cycleStroke}
            strokeWidth="6"
            strokeDasharray={`${innerFill} ${innerC}`}
            strokeLinecap="butt"
            transform="rotate(-90 65 65)"
          />
          {/* Inner disc — today's cycle position */}
          <g transform={`rotate(${innerAngle} 65 65)`}>
            <circle cx="65" cy={65 - innerR} r="5" fill={ACCENT_NIGHT} />
          </g>

          {/* Centre label */}
          <text
            x="65" y="62"
            textAnchor="middle"
            fill={INK_NIGHT}
            fontFamily="Fraunces, serif"
            fontSize="20"
            fontWeight="500"
          >Today</text>
          <text
            x="65" y="78"
            textAnchor="middle"
            fill="rgba(245,230,211,0.55)"
            fontFamily="Inter, sans-serif"
            fontSize="9"
            letterSpacing="1.5"
          >{dateLabel}</text>
        </svg>
        <div style={legendStyle}>
          <div style={legendRowStyle}>
            <span style={{ ...legendDotStyle, background: INK_NIGHT }} />
            <span>
              <strong style={legendStrongStyle}>Lunar</strong> · {moonLabel}
            </span>
          </div>
          <div style={legendRowStyle}>
            <span style={{ ...legendDotStyle, background: ACCENT_NIGHT }} />
            <span>
              <strong style={legendStrongStyle}>Cycle</strong> · {cycleLabel}
            </span>
          </div>
          <div
            style={legendBodyStyle}
            dangerouslySetInnerHTML={{ __html: `"${renderEm(body)}"` }}
          />
        </div>
      </div>
    </SectionWrap>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const dialHeadStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  marginBottom: 8,
  flexWrap: "wrap",
  gap: 6,
};
const dialTitleStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 22,
  fontWeight: 400,
  color: INK_NIGHT,
  margin: 0,
};
const dialMetaStyle = {
  fontSize: 9,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: "rgba(245,230,211,0.55)",
  fontFamily: "'Inter', sans-serif",
};
const dialWrapStyle = {
  background: "rgba(245,230,211,0.04)",
  border: `1px solid ${RULE_NIGHT}`,
  borderRadius: 16,
  padding: 14,
  display: "flex",
  gap: 14,
  alignItems: "center",
  flexWrap: "wrap",
};
const dialSvgStyle = {
  width: 130,
  height: 130,
  flexShrink: 0,
};
const legendStyle = {
  flex: 1,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: "rgba(245,230,211,0.78)",
  lineHeight: 1.55,
  minWidth: 160,
};
const legendRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 6,
};
const legendDotStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0,
};
const legendStrongStyle = {
  color: INK_NIGHT,
  fontWeight: 600,
};
const legendBodyStyle = {
  marginTop: 8,
  color: "rgba(245,230,211,0.55)",
  fontSize: 10,
  fontStyle: "italic",
  fontFamily: "'Fraunces', serif",
};

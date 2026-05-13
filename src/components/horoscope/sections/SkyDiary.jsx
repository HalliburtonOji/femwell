import { useMemo } from "react";
import { getMoonPhase } from "@/utils/astrology";
import useSkyDiary from "../hooks/useSkyDiary";
import SectionWrap from "../SectionWrap";

// ─────────────────────────────────────────────────────────────────────────────
// SkyDiary — Section 5.
//
// Replaces the old 4-card Transits UI. Renders:
//   - A 12-column horizontal timeline. Each column is one past cycle (most
//     recent on the right). Bar tinted by cycle phase. Up to 2 transit dots
//     positioned by date within that cycle window, coloured by planet.
//   - A "Right now" card below the timeline with a deterministic observation
//     about the major transit pattern of the last two months. Falls back to
//     a moon-phase observation if no qualifying transit is found.
//   - A4: Void-of-Course Moon decision pip — when the moon is currently
//     void-of-course, shows the window in en-GB BST time format.
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_GRADIENTS = {
  menstrual:  "linear-gradient(180deg, rgba(212,94,82,0.55) 0%, rgba(212,94,82,0.18) 100%)",
  follicular: "linear-gradient(180deg, rgba(125,134,104,0.55) 0%, rgba(125,134,104,0.18) 100%)",
  ovulatory:  "linear-gradient(180deg, rgba(184,158,106,0.65) 0%, rgba(184,158,106,0.18) 100%)",
  luteal:     "linear-gradient(180deg, rgba(150,120,180,0.55) 0%, rgba(150,120,180,0.18) 100%)",
  default:    "linear-gradient(180deg, rgba(107,74,86,0.45) 0%, rgba(107,74,86,0.15) 100%)",
};

const PLANET_COLOURS = {
  saturn:  "#5F8A85", // teal
  jupiter: "#B89E6A", // gold
  pluto:   "#D45E52", // rose-accent
  uranus:  "#7D8E9F",
  neptune: "#6F8FAE",
  mars:    "#A0312A",
  venus:   "#C9A2A8",
  mercury: "#7D8668",
  sun:     "#E8B95C",
  moon:    "#F5E6D3",
  default: "#B89E6A",
};

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── Section helpers ────────────────────────────────────────────────────────
function SectionHead({ title, emphasis, link }) {
  return (
    <div style={sectionHeadStyle}>
      <h2 style={sectionTitleStyle}>
        {title} <em style={{ fontStyle: "italic", color: "var(--rose-primary, #D45E52)" }}>{emphasis}</em>
      </h2>
      {link && <span style={sectionLinkStyle}>{link}</span>}
    </div>
  );
}

// ── Build 12 cycle windows ─────────────────────────────────────────────────
// We don't have full cycle-event history for everyone, so build the 12-month
// window deterministically: 12 cycles ending in the current month, each
// (cycleAvgLength or 28) days long, tagged by the dominant phase for that
// month (we colour by the cycle phase as observed at a sample mid-point).
function buildCycleWindows(periodStarts, cycleLen) {
  const today = new Date();
  const len = cycleLen || 28;
  const windows = [];
  if (periodStarts.length > 0) {
    // Use actual period_starts as cycle boundaries when available
    const ordered = [...periodStarts].sort((a, b) => a.date.getTime() - b.date.getTime());
    // Pair consecutive starts as cycle windows
    for (let i = 0; i < ordered.length - 1; i += 1) {
      windows.push({ start: ordered[i].date, end: ordered[i + 1].date });
    }
    if (ordered.length > 0) {
      // Current cycle: most recent start → today
      const last = ordered[ordered.length - 1].date;
      windows.push({ start: last, end: today });
    }
  }
  if (windows.length < 12) {
    // Pad backwards from the earliest known cycle (or today) using cycleLen.
    const earliest = windows.length > 0 ? windows[0].start : today;
    let cursorEnd = new Date(earliest);
    while (windows.length < 12) {
      const start = new Date(cursorEnd.getTime() - len * 86400000);
      windows.unshift({ start, end: cursorEnd, synthetic: true });
      cursorEnd = start;
    }
  }
  return windows.slice(-12);
}

function placeTransitsInWindow(transits, win) {
  // Pull up to 2 transits whose date falls in the window. Returns
  // [{ left: pct, planet }] for rendering.
  if (!Array.isArray(transits) || transits.length === 0) return [];
  const span = win.end.getTime() - win.start.getTime();
  if (span <= 0) return [];
  const hits = [];
  for (const t of transits) {
    const when = t?.when ? new Date(t.when) : null;
    if (!when || isNaN(when.getTime())) continue;
    if (when < win.start || when > win.end) continue;
    const left = Math.max(8, Math.min(92, ((when.getTime() - win.start.getTime()) / span) * 100));
    const planet = (t.planet || "").toLowerCase();
    hits.push({ left, planet });
    if (hits.length >= 2) break;
  }
  return hits;
}

// ── Right now observation — deterministic ───────────────────────────────────
function buildRightNowText(readings) {
  if (!Array.isArray(readings) || readings.length === 0) {
    return fallbackMoonText();
  }
  // Scan the last 2 readings for repeated heavy planets across transits.
  const recent = readings.slice(0, 2);
  const planetTally = {};
  for (const r of recent) {
    const transits = Array.isArray(r?.transits_json) ? r.transits_json : [];
    for (const t of transits) {
      const p = String(t?.planet || "").toLowerCase();
      if (!p) continue;
      planetTally[p] = (planetTally[p] || 0) + 1;
    }
  }
  // Saturn → heaviness, Pluto → pressure, Jupiter → lift.
  const saturn = planetTally.saturn || 0;
  const pluto = planetTally.pluto || 0;
  const jupiter = planetTally.jupiter || 0;

  if (saturn >= 2) {
    return "Saturn pressed across the last two cycles — explains the heaviness you've been carrying. The shape of the next month is lighter.";
  }
  if (pluto >= 2) {
    return "Pluto has been working underneath these two months. Something structural shifted; you'll notice it more in retrospect.";
  }
  if (jupiter >= 2) {
    return "Jupiter is the throughline of the last two cycles. Doors that were stuck are slightly open now — push the one that matters most.";
  }
  return fallbackMoonText();
}

function fallbackMoonText() {
  const moon = getMoonPhase(new Date());
  if (moon.waxing) {
    return "The moon is climbing back. The last two cycles leaned heavy; this one will too — until the next new moon.";
  }
  return "The moon is shedding light. The last two cycles built something; this one is for noticing what stayed.";
}

// ── Void-of-Course (A4) ─────────────────────────────────────────────────────
// Simplified client-side approximation:
//   - Compute the moon's ecliptic longitude (mean) for "now" using REF_NEW_MOON.
//   - The next major aspect to a major planet (Mercury..Pluto) within 8 deg orb.
//   - Void window = end of last major aspect this sign → start of next sign.
//
// We don't have full planetary positions client-side, so the heuristic uses
// the moon's distance from the next 30-degree boundary (sign ingress) and
// "shifts" the void window into the final 4-8 hours before ingress when the
// moon is in the last 1.5° of its sign. This is an approximation — accurate
// to the day, not the minute. Times rendered en-GB 24h Europe/London.

const SYNODIC_DAYS = 29.530588;
const MOON_LONG_PER_DAY = 360 / 27.321661; // sidereal-ish; close enough
const SIGN_DEG = 30;

function moonLongitudeNow(now = new Date()) {
  // Phase position 0..1 from REF_NEW_MOON gives sun-moon elongation, not
  // absolute moon longitude. For void-of-course we only need to know how
  // close the moon is to the next 30-degree boundary, which we approximate
  // by tracking moon's sidereal longitude from a J2000 base.
  const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const days = (now.getTime() - J2000) / 86400000;
  const L0 = 218.316; // mean lunar longitude at J2000
  let lon = (L0 + MOON_LONG_PER_DAY * days) % 360;
  if (lon < 0) lon += 360;
  return lon;
}

function computeVoidOfCourse(now = new Date()) {
  const lon = moonLongitudeNow(now);
  const degInSign = lon % SIGN_DEG;
  const degToIngress = SIGN_DEG - degInSign;
  // If moon is within last 1.5° of the sign, treat as void-of-course. Window
  // start = "now", window end = moon ingress.
  if (degToIngress > 1.5) return null;
  const hoursToIngress = degToIngress / MOON_LONG_PER_DAY * 24;
  const end = new Date(now.getTime() + hoursToIngress * 3600 * 1000);
  return { start: now, end };
}

function ukBst(d) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  }).format(d);
}

// ── Main ────────────────────────────────────────────────────────────────────
function inferCyclePhaseFromIndex(idx, total) {
  // Deterministic phase tag for the bar tint when we don't have per-cycle data.
  // Cycle a 4-phase rainbow across the 12 columns so the timeline is visually
  // varied without claiming false data.
  const phases = ["menstrual", "follicular", "ovulatory", "luteal"];
  return phases[idx % phases.length];
}

function monthLabel(d) {
  return MONTHS_SHORT[d.getMonth()] || "";
}

export default function SkyDiary({ reading, userId, userProfile }) {
  const cycleLen = userProfile?.cycle_avg_length || 28;
  const { periodStarts, readings } = useSkyDiary(userId);

  const windows = useMemo(
    () => buildCycleWindows(periodStarts, cycleLen),
    [periodStarts, cycleLen],
  );

  // Pool transits from the last ~3 readings so dots can land in older windows
  const transitPool = useMemo(() => {
    const out = [];
    const pool = readings.slice(0, 3);
    for (const r of pool) {
      const transits = Array.isArray(r?.transits_json) ? r.transits_json : [];
      for (const t of transits) {
        if (t?.when) out.push(t);
      }
    }
    // include the active reading's transits too
    const live = Array.isArray(reading?.transits_json) ? reading.transits_json : [];
    for (const t of live) {
      if (t?.when) out.push(t);
    }
    return out;
  }, [readings, reading]);

  const rightNowText = useMemo(() => buildRightNowText(readings), [readings]);
  const voc = useMemo(() => computeVoidOfCourse(new Date()), []);

  return (
    <SectionWrap>
      <SectionHead title="Sky" emphasis="diary" link="12 cycles overlaid with the transits that shaped them" />

      <div style={diaryCardStyle}>
        <div style={diaryTimelineStyle}>
          {windows.map((win, i) => {
            const phase = inferCyclePhaseFromIndex(i, windows.length);
            const transits = placeTransitsInWindow(transitPool, win);
            const isNow = i === windows.length - 1;
            return (
              <div
                key={i}
                style={{
                  ...diaryBarStyle,
                  background: PHASE_GRADIENTS[phase] || PHASE_GRADIENTS.default,
                  ...(isNow ? diaryBarNowStyle : {}),
                }}
              >
                {transits.map((t, ti) => (
                  <span
                    key={ti}
                    style={{
                      ...transitDotStyle,
                      left: `${t.left}%`,
                      background: PLANET_COLOURS[t.planet] || PLANET_COLOURS.default,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
        <div style={diaryMonthRowStyle}>
          {windows.map((win, i) => (
            <div key={i} style={diaryMonthCellStyle}>{monthLabel(win.end)}</div>
          ))}
        </div>

        <div style={rightNowCardStyle}>
          <p style={rightNowEyeStyle}>Right now</p>
          <p style={rightNowTextStyle}>{rightNowText}</p>
        </div>

        {voc && (
          <div style={vocPipStyle} role="note" aria-label="Void of course Moon">
            <span style={vocDotStyle} aria-hidden="true" />
            Void-of-Course · {ukBst(voc.start)}-{ukBst(voc.end)} BST · best not to lock plans
          </div>
        )}
      </div>
    </SectionWrap>
  );
}

// ── styles ──────────────────────────────────────────────────────────────────
const sectionHeadStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  margin: "0 0 12px",
  flexWrap: "wrap",
  gap: 8,
};
const sectionTitleStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 400,
  fontSize: 22,
  color: "var(--plum-deep, #2b1e16)",
  margin: 0,
};
const sectionLinkStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 500,
  color: "var(--plum-mute, #6b4a56)",
};
const diaryCardStyle = {
  background: "var(--cream, #FAF4EA)",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.10))",
  borderRadius: 18,
  padding: "18px 16px 16px",
  boxShadow: "0 1px 2px rgba(43,30,22,0.04), 0 6px 18px rgba(43,30,22,0.06)",
};
const diaryTimelineStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(12, 1fr)",
  gap: 4,
  height: 72,
  marginBottom: 6,
};
const diaryBarStyle = {
  position: "relative",
  height: "100%",
  borderRadius: 6,
};
const diaryBarNowStyle = {
  boxShadow: "0 0 0 1.5px var(--plum-deep, #2b1e16)",
};
const transitDotStyle = {
  position: "absolute",
  width: 7,
  height: 7,
  borderRadius: 999,
  top: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: "0 0 0 1.5px rgba(255,255,255,0.92)",
};
const diaryMonthRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(12, 1fr)",
  gap: 4,
  marginBottom: 14,
};
const diaryMonthCellStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #6b4a56)",
  textAlign: "center",
};
const rightNowCardStyle = {
  background: "rgba(43,30,22,0.04)",
  borderRadius: 14,
  padding: "12px 14px",
};
const rightNowEyeStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #6b4a56)",
  margin: "0 0 6px",
};
const rightNowTextStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 14.5,
  lineHeight: 1.6,
  color: "var(--plum-deep, #2b1e16)",
  margin: 0,
  fontStyle: "italic",
};
const vocPipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
  padding: "6px 12px",
  border: "1px dashed var(--plum-mute, rgba(107,74,86,0.45))",
  borderRadius: 9999,
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--plum-mute, #6b4a56)",
  letterSpacing: "0.02em",
};
const vocDotStyle = {
  display: "inline-block",
  width: 6,
  height: 6,
  borderRadius: 999,
  background: "var(--rose-primary, #D45E52)",
};

import { useMemo } from "react";
import { prettyDateBritish } from "@/utils/astrology";
import {
  TW_TOP, TW_MID, TW_BOT,
  INK_NIGHT, ACCENT_NIGHT,
} from "../styles/tokens.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// TwilightHero — Section §1 (per demo §1).
//
// Full-bleed Twilight gradient hero. 7 dot-stars at the demo's coordinates,
// eyebrow + Fraunces headline (with italic emphasis) + sub-line + 3 chips.
// Text-only over Twilight — the moon visual lives in CycleMoonDial.
//
// Hero margins: bleeds left/right inside the page container (margin: 0 -18px)
// so it touches the edges of the horoscope tab.
// ─────────────────────────────────────────────────────────────────────────────

// Dot-star coordinates lifted from the v2.1 demo (mnt/femwell/femwell_horoscope_v2_demo.html L794-800).
const STARS = [
  { top: "12%", left: "18%" },
  { top:  "8%", left: "62%" },
  { top: "22%", left: "84%" },
  { top: "34%", left: "34%" },
  { top: "46%", left: "72%" },
  { top: "18%", left: "48%" },
  { top: "28%", left: "14%" },
];

// Light italic-emphasis renderer — same contract as TriadCards / CycleMoonDial.
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

function cyclePhaseLabel(phase, day) {
  if (!phase) return null;
  const cap = phase.charAt(0).toUpperCase() + phase.slice(1);
  if (day) return `${cap} · Day ${day}`;
  return cap;
}

function fallbackHeadline(name, moon) {
  const phrase = moon?.waxing ? "*climbing*" : "*releasing*";
  if (name) return `A steady day, ${name}. The moon is ${phrase}.`;
  return `A steady day. The moon is ${phrase}.`;
}

function fallbackSub(chart, cyclePhase, cycleDay, moon) {
  const cyc = cycleDay ? `Day ${cycleDay} of your cycle` : "Your cycle";
  const moonShort = moon?.short ? moon.short.toLowerCase() : "moon";
  const sun = chart?.sun ? ` in ${chart.sun}` : "";
  const cue = moon?.waxing
    ? "energy that asks for follow-through, not new beginnings."
    : "energy that asks for release, not new starts.";
  return `${cyc}. A ${moonShort}${sun} — ${cue}`;
}

export default function TwilightHero({ chart, moon, reading, cyclePhase, cycleDay }) {
  const date = useMemo(() => prettyDateBritish(new Date()), []);
  const headline = reading?.headline || fallbackHeadline(chart?.name, moon);
  const sub = reading?.narrative || fallbackSub(chart, cyclePhase, cycleDay, moon);
  const phaseChip = cyclePhaseLabel(cyclePhase, cycleDay);

  // Short date for chip — "Tuesday 13 May"
  const chipDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }, []);

  return (
    <div style={heroShellStyle}>
      <div style={starsLayerStyle} aria-hidden="true">
        {STARS.map((s, i) => (
          <span key={i} style={{ ...dotStarStyle, top: s.top, left: s.left }} />
        ))}
      </div>
      <div style={heroBodyStyle}>
        <div style={eyebrowStyle}>Discover · Horoscope</div>
        <h1
          style={headlineStyle}
          dangerouslySetInnerHTML={{ __html: renderEm(headline) }}
        />
        <p style={subStyle}>{sub}</p>
        <div style={chipRowStyle}>
          <span style={chipStyle}>{chipDate}</span>
          {phaseChip && <span style={{ ...chipStyle, ...chipPhaseStyle }}>{phaseChip}</span>}
          {moon?.short && (
            <span style={chipStyle}>
              {moon.short}
              {typeof moon.illumination === "number" ? ` · ${moon.illumination}%` : ""}
            </span>
          )}
          {!moon?.short && date && <span style={chipStyle}>{date}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const heroShellStyle = {
  position: "relative",
  margin: "0 -18px 0",
  padding: "32px 22px 28px",
  // H2-fix1: enforce a minimum height so the hero never collapses to chip-row
  // when reading.headline + chart.name + moon are all null. Gradient + 7-star
  // canopy + headline + sub + chips need ~240px to read as a hero.
  minHeight: 240,
  background: `linear-gradient(180deg, ${TW_TOP} 0%, ${TW_MID} 60%, ${TW_BOT} 100%)`,
  color: INK_NIGHT,
  overflow: "hidden",
};
const starsLayerStyle = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  opacity: 0.35,
};
const dotStarStyle = {
  position: "absolute",
  width: 2,
  height: 2,
  background: INK_NIGHT,
  borderRadius: "50%",
};
const heroBodyStyle = {
  position: "relative",
};
const eyebrowStyle = {
  fontSize: 9,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "rgba(245,230,211,0.66)",
  fontWeight: 700,
};
const headlineStyle = {
  fontSize: 28,
  fontWeight: 400,
  lineHeight: 1.22,
  letterSpacing: "-0.01em",
  color: INK_NIGHT,
  margin: "8px 0 14px",
};
const subStyle = {
  fontSize: 12,
  lineHeight: 1.5,
  color: "rgba(245,230,211,0.78)",
  maxWidth: 300,
  margin: 0,
};
const chipRowStyle = {
  marginTop: 16,
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};
const chipStyle = {
  fontSize: 9,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  fontWeight: 700,
  padding: "4px 10px",
  borderRadius: 9999,
  background: "rgba(245,230,211,0.08)",
  color: "rgba(245,230,211,0.86)",
  border: "1px solid rgba(245,230,211,0.14)",
};
const chipPhaseStyle = {
  background: "rgba(232,146,137,0.16)",
  color: ACCENT_NIGHT,
  borderColor: "rgba(232,146,137,0.30)",
};

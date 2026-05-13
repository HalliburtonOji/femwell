import { useState } from "react";
import { Sun, Moon, Sunrise } from "lucide-react";
import {
  INK_NIGHT, ACCENT_NIGHT, RULE_NIGHT,
} from "../styles/tokens.jsx";
import SectionWrap from "../SectionWrap";

// ─────────────────────────────────────────────────────────────────────────────
// TriadCards — Section §2 (per demo §2).
//
// Three cream-on-Plum-Night cards in a 3-col grid. Sun / Moon / Rising slots
// always render with their specific Lucide icons (Sun / Moon / Sunrise) per
// the locked v2.1 demo — the sign itself is named below the icon.
//
// Tap to expand: shows the 80-120 word reading from reading.triad_*_desc.
// Locked moon/rising (no birth_time) show a soft body line + a text-link
// "+ Add birth time" (no dashed pill — per H2b-1 spec).
// ─────────────────────────────────────────────────────────────────────────────

// SIGN_TRAITS — italic one-liner trait per sign. Used below the sign name on
// each triad card. Kept local to this file so we don't bloat astrology.js.
const SIGN_TRAITS = {
  Aries:       "first in, fully lit",
  Taurus:      "slow, sensual, durable",
  Gemini:      "curious, two-minded",
  Cancer:      "soft shell, sharp memory",
  Leo:         "warm, sovereign",
  Virgo:       "patterns, ratios, repair",
  Libra:       "measured, warm",
  Scorpio:     "deep water, no shallows",
  Sagittarius: "long view, far reach",
  Capricorn:   "slow ladder, real climb",
  Aquarius:    "considered, independent",
  Pisces:      "tender, intuitive",
};

function traitFor(sign) {
  if (!sign) return "";
  return SIGN_TRAITS[sign] || "";
}

function SectionHead({ title, emphasis, link }) {
  return (
    <div style={sectionHeadStyle}>
      <h2 style={sectionTitleStyle}>
        {title} <em style={{ fontStyle: "italic", color: ACCENT_NIGHT }}>{emphasis}</em>
      </h2>
      {link && <span style={sectionLinkStyle}>{link}</span>}
    </div>
  );
}

const ICON_FOR = { sun: Sun, moon: Moon, rising: Sunrise };

function TriadCard({ slot, eyebrow, sign, trait, desc, locked, onUnlock }) {
  const [open, setOpen] = useState(false);
  const Icon = ICON_FOR[slot];

  const handleClick = () => {
    if (locked) return;
    if (desc) setOpen((v) => !v);
  };

  return (
    <div
      role={desc && !locked ? "button" : undefined}
      tabIndex={desc && !locked ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (locked || !desc) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((v) => !v);
        }
      }}
      style={{
        ...cardStyle,
        opacity: locked ? 0.78 : 1,
        cursor: !locked && desc ? "pointer" : "default",
      }}
    >
      <div style={iconStyle} aria-hidden="true">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <p style={eyebrowStyle}>{eyebrow}</p>
      <p style={signStyle}>{sign}</p>
      {trait && <p style={traitStyle}>{trait}</p>}

      {locked && (
        <>
          <p style={lockedBodyStyle}>
            Birth time unlocks your {slot === "rising" ? "rising" : "moon"}. We need the minute,
            not the second.
          </p>
          <button type="button" onClick={onUnlock} style={addBtnStyle}>
            + Add birth time
          </button>
        </>
      )}

      <div
        style={{
          ...expandWrapStyle,
          maxHeight: open ? 360 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        {desc && <p style={expandBodyStyle}>{desc}</p>}
      </div>
    </div>
  );
}

export default function TriadCards({ chart, astro, reading, onAddBirthTime }) {
  const sunDesc = reading?.triad_sun_desc;
  const moonDesc = reading?.triad_moon_desc;
  const risingDesc = reading?.triad_rising_desc;
  const hasBT = !!astro?.birth_time;

  const moonLocked = !hasBT || !chart?.moonSign;
  const risingLocked = !hasBT || !chart?.risingSign;

  return (
    <SectionWrap>
      <SectionHead
        title="Your"
        emphasis="triad"
        link={hasBT ? null : "Birth time unlocks moon + rising →"}
      />
      <div style={rowStyle}>
        <TriadCard
          slot="sun"
          eyebrow="Sun"
          sign={chart?.sun || "—"}
          trait={traitFor(chart?.sun)}
          desc={sunDesc}
          locked={false}
        />
        <TriadCard
          slot="moon"
          eyebrow="Moon"
          sign={chart?.moonSign || "—"}
          trait={traitFor(chart?.moonSign)}
          desc={moonDesc}
          locked={moonLocked}
          onUnlock={onAddBirthTime}
        />
        <TriadCard
          slot="rising"
          eyebrow="Rising"
          sign={chart?.risingSign || "—"}
          trait={traitFor(chart?.risingSign)}
          desc={risingDesc}
          locked={risingLocked}
          onUnlock={onAddBirthTime}
        />
      </div>
    </SectionWrap>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
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
  color: INK_NIGHT,
  margin: 0,
};
const sectionLinkStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  color: ACCENT_NIGHT,
};
const rowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
};
const cardStyle = {
  background: "rgba(245,230,211,0.04)",
  border: `1px solid ${RULE_NIGHT}`,
  borderRadius: 14,
  padding: "14px 8px",
  textAlign: "center",
  transition: "background 200ms cubic-bezier(0.32,0.72,0.24,1)",
};
const iconStyle = {
  width: 28,
  height: 28,
  margin: "0 auto 8px",
  color: ACCENT_NIGHT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const eyebrowStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(245,230,211,0.55)",
  fontWeight: 700,
  margin: 0,
};
const signStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 17,
  fontWeight: 500,
  color: INK_NIGHT,
  margin: "4px 0 4px",
};
const traitStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontStyle: "italic",
  color: "rgba(245,230,211,0.70)",
  lineHeight: 1.35,
  margin: 0,
};
const lockedBodyStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  color: "rgba(245,230,211,0.60)",
  lineHeight: 1.4,
  margin: "8px 0 6px",
};
const addBtnStyle = {
  display: "inline-block",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  color: ACCENT_NIGHT,
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  textDecoration: "none",
};
const expandWrapStyle = {
  overflow: "hidden",
  transition: "max-height 200ms cubic-bezier(0.32,0.72,0.24,1), opacity 200ms cubic-bezier(0.32,0.72,0.24,1)",
};
const expandBodyStyle = {
  marginTop: 10,
  paddingTop: 10,
  borderTop: `1px dashed ${RULE_NIGHT}`,
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  lineHeight: 1.55,
  color: "rgba(245,230,211,0.86)",
  textAlign: "left",
};

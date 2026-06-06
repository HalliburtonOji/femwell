import { useMemo, useState } from "react";
import {
  ASTEROID_NAMES,
  ASTEROID_ARCHETYPES,
} from "@/lib/astrology/asteroids";
import useAsteroids from "../hooks/useAsteroids";
import {
  INK_NIGHT, ACCENT_NIGHT, RULE_NIGHT,
} from "../styles/tokens.jsx";
import SectionWrap from "../SectionWrap";

// ─────────────────────────────────────────────────────────────────────────────
// GoddessBench — Section §2.5 (per demo §2.5).
//
// Plum Night card with a 6-column grid of asteroid orbs:
//   Ceres (Mother) · Pallas (Warrior) · Juno (Partner) ·
//   Vesta (Hearth) · Chiron (Healer) · Lilith (Wild).
//
// Each orb is a radial-gradient disc in the asteroid's accent colour. Tap
// to expand into the full archetype description (from ASTEROID_ARCHETYPES)
// plus the user's sign for that asteroid.
//
// Below the grid: a dashed-rule italic line from `reading.goddess_read`
// (1-2 sentences naming two real placements and the tension between them).
//
// Lilith here is Black Moon Lilith (lunar apogee). See H2_DECISIONS.md D3.
// ─────────────────────────────────────────────────────────────────────────────

// Orb accent colour per asteroid — mirrors the demo's radial gradients.
const ORB_ACCENT = {
  ceres:  { core: "#E89289", mid: "rgba(232,146,137,0.40)", soft: "rgba(232,146,137,0.10)", border: "rgba(232,146,137,0.40)" },
  pallas: { core: "#C9A95C", mid: "rgba(201,169,92,0.40)",  soft: "rgba(201,169,92,0.10)",  border: "rgba(201,169,92,0.40)" },
  juno:   { core: "#F2A99A", mid: "rgba(242,169,154,0.40)", soft: "rgba(242,169,154,0.10)", border: "rgba(242,169,154,0.40)" },
  vesta:  { core: "#7D8668", mid: "rgba(125,134,104,0.40)", soft: "rgba(125,134,104,0.10)", border: "rgba(125,134,104,0.40)" },
  chiron: { core: "#B68A3C", mid: "rgba(182,138,60,0.40)",  soft: "rgba(182,138,60,0.10)",  border: "rgba(182,138,60,0.40)" },
  lilith: { core: "#5F8A85", mid: "rgba(95,138,133,0.40)",  soft: "rgba(95,138,133,0.10)",  border: "rgba(95,138,133,0.40)" },
};

function renderEm(text) {
  if (!text) return "";
  const escaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    // <strong> from LLM → accent colour, medium weight
    .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, '<strong style="color:#E89289;font-weight:500;">$1</strong>')
    // **word** → accent strong
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#E89289;font-weight:500;">$1</strong>')
    // <em> from LLM
    .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/g, '<em style="font-style:italic;">$1</em>')
    // *word* → italic
    .replace(/\*(.+?)\*/g, '<em style="font-style:italic;">$1</em>');
}

function nameOf(asteroid) {
  return asteroid.charAt(0).toUpperCase() + asteroid.slice(1);
}

function defaultGoddessRead(signs) {
  // Pick first two non-null asteroid placements to seed a fallback line.
  const present = ASTEROID_NAMES.map((n) => ({ n, s: signs?.[n] })).filter((x) => x.s);
  if (present.length < 2) {
    return "Your Goddess Bench is being computed from your birth date. The bench lights up once Astra writes today's reading.";
  }
  const [a, b] = present;
  return (
    `Your **${nameOf(a.n)} in ${a.s}** wants attention; your **${nameOf(b.n)} in ${b.s}** ` +
    `is the other shape. The work is letting both speak.`
  );
}

function Orb({ asteroid, sign, onClick, expanded }) {
  const accent = ORB_ACCENT[asteroid] || ORB_ACCENT.ceres;
  const archetype = ASTEROID_ARCHETYPES[asteroid];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      style={{
        ...stoneStyle,
        background: expanded ? "rgba(245,230,211,0.06)" : "transparent",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          ...orbStyle,
          background: `radial-gradient(circle at 30% 30%, ${accent.core} 0%, ${accent.mid} 60%, ${accent.soft} 100%)`,
          border: `1.5px solid ${accent.border}`,
        }}
      />
      <span style={nameStyle}>{nameOf(asteroid)}</span>
      <span style={roleStyle}>
        {archetype?.role}
        {sign ? ` · ${sign}` : ""}
      </span>
    </button>
  );
}

export default function GoddessBench({ astro, userProfile, reading }) {
  const signs = useAsteroids(astro, userProfile);
  const [openKey, setOpenKey] = useState(null);

  const goddessRead = reading?.goddess_read || defaultGoddessRead(signs);

  const expanded = openKey ? {
    asteroid: openKey,
    sign: signs?.[openKey] || null,
    archetype: ASTEROID_ARCHETYPES[openKey],
  } : null;

  const hasBirth = useMemo(() => {
    return !!(astro?.birth_date || userProfile?.birthday || userProfile?.date_of_birth);
  }, [astro, userProfile]);

  // Don't render the card at all when there's no birth date — the rest of
  // the horoscope will already be in the onboarding state in that case,
  // but this guards against partial chart situations.
  if (!hasBirth) return null;

  return (
    <SectionWrap>
      <div style={cardStyle}>
        <div style={headStyle}>
          <span style={titleStyle}>
            Goddess <em style={{ fontStyle: "italic", color: ACCENT_NIGHT }}>bench</em>
          </span>
          <span style={subStyle}>Asteroid astrology</span>
        </div>
        <div style={rowStyle}>
          {ASTEROID_NAMES.map((a) => (
            <Orb
              key={a}
              asteroid={a}
              sign={signs?.[a]}
              expanded={openKey === a}
              onClick={() => setOpenKey((k) => (k === a ? null : a))}
            />
          ))}
        </div>

        <div
          style={{
            ...expandWrapStyle,
            maxHeight: expanded ? 480 : 0,
            opacity: expanded ? 1 : 0,
            marginTop: expanded ? 10 : 0,
          }}
        >
          {expanded && (
            <div style={expandPanelStyle}>
              <div style={expandHeadStyle}>
                <strong style={expandNameStyle}>
                  {nameOf(expanded.asteroid)}
                  {expanded.sign ? ` in ${expanded.sign}` : ""}
                </strong>
                <span style={expandRoleStyle}>{expanded.archetype?.role}</span>
              </div>
              <p style={expandBodyStyle}>{expanded.archetype?.description}</p>
              {expanded.archetype?.body_part && (
                <p style={expandFootStyle}>
                  Holds: {expanded.archetype.body_part}
                </p>
              )}
            </div>
          )}
        </div>

        <div
          style={readStyle}
          dangerouslySetInnerHTML={{ __html: `"${renderEm(goddessRead)}"` }}
        />
      </div>
    </SectionWrap>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const cardStyle = {
  background: "rgba(245,230,211,0.04)",
  border: `1px solid ${RULE_NIGHT}`,
  borderRadius: 16,
  padding: "14px 14px 12px",
};
const headStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  marginBottom: 10,
  flexWrap: "wrap",
  gap: 6,
};
const titleStyle = {
  fontSize: 15,
  color: INK_NIGHT,
  fontWeight: 500,
};
const subStyle = {
  fontSize: 9,
  color: "rgba(245,230,211,0.50)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  fontWeight: 700,
};
const rowStyle = {
  display: "grid",
  // minmax(0, 1fr) lets all 6 orbs shrink to fit the card instead of
  // pushing Lilith past the right edge. Gap is tighter to give each cell
  // a bit more room for the role + sign label.
  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
  gap: 4,
};
const stoneStyle = {
  textAlign: "center",
  padding: "6px 0",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  font: "inherit",
  color: "inherit",
  transition: "background 180ms cubic-bezier(0.32,0.72,0.24,1)",
  minWidth: 0, // critical with the minmax(0,1fr) so flex/grid don't expand to content
  overflow: "hidden",
};
const orbStyle = {
  display: "block",
  width: 32,
  height: 32,
  margin: "0 auto 4px",
  borderRadius: "50%",
};
const nameStyle = {
  display: "block",
  fontSize: 10,
  fontWeight: 500,
  color: INK_NIGHT,
  lineHeight: 1.2,
};
const roleStyle = {
  display: "block",
  fontSize: 8,
  color: "rgba(245,230,211,0.50)",
  marginTop: 1,
  lineHeight: 1.2,
};
const expandWrapStyle = {
  overflow: "hidden",
  transition: "max-height 220ms cubic-bezier(0.32,0.72,0.24,1), opacity 220ms cubic-bezier(0.32,0.72,0.24,1), margin-top 220ms cubic-bezier(0.32,0.72,0.24,1)",
};
const expandPanelStyle = {
  background: "rgba(245,230,211,0.04)",
  border: `1px solid ${RULE_NIGHT}`,
  borderRadius: 12,
  padding: "12px 14px",
};
const expandHeadStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 8,
  flexWrap: "wrap",
};
const expandNameStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: INK_NIGHT,
};
const expandRoleStyle = {
  fontSize: 9,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: "rgba(245,230,211,0.55)",
};
const expandBodyStyle = {
  fontSize: 12,
  lineHeight: 1.55,
  color: "rgba(245,230,211,0.84)",
  margin: 0,
};
const expandFootStyle = {
  marginTop: 8,
  fontSize: 10,
  color: "rgba(245,230,211,0.55)",
  letterSpacing: "0.04em",
};
const readStyle = {
  marginTop: 10,
  paddingTop: 10,
  borderTop: "1px dashed rgba(245,230,211,0.14)",
  fontSize: 12,
  fontStyle: "italic",
  color: "rgba(245,230,211,0.78)",
  lineHeight: 1.5,
};

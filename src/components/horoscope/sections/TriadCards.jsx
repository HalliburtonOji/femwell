import { Plus } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TriadCards — Section 2.
// Sun / Moon / Rising triad cards. Moon + Rising locked until birth time added.
// Copied 1-for-1 from the original HoroscopeTab Triad function.
// ─────────────────────────────────────────────────────────────────────────────

function TriadCard({ glyph, label, sign, desc, locked, onUnlock }) {
  return (
    <div style={{ ...triadCardStyle, opacity: locked ? 0.7 : 1 }}>
      <div style={triadGlyphStyle}>{glyph}</div>
      <p style={triadLabelStyle}>{label}</p>
      <p style={triadSignStyle}>{sign}</p>
      <p style={triadDescStyle}>{desc}</p>
      {locked && (
        <button type="button" onClick={onUnlock} style={triadUnlockBtnStyle}>
          <Plus size={12} /> Add birth time
        </button>
      )}
    </div>
  );
}

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

function fallbackTriadSunDesc(sun) {
  const m = {
    Aries: "First in. The match that lights the room — and the one that needs to be the lit one.",
    Taurus: "Slow on purpose. You build pleasure into the spine of the day.",
    Gemini: "Curious, double-minded. You speak yourself into knowing what you think.",
    Cancer: "You feel the room before anyone speaks. Your shell is also your softest skin.",
    Leo: "Warm sovereign. You expand others by simply being seen.",
    Virgo: "Patterns, ratios, repair. You love by tidying the edges of someone's life.",
    Libra: "Air with manners. You compose rooms — and yourself — in pairs.",
    Scorpio: "All depth. You don't waste your attention on shallow tide-pools.",
    Sagittarius: "Long view. You're the friend who buys the flight before booking the room.",
    Capricorn: "Slow ladder. The mountain you climb is real and it is also yours.",
    Aquarius: "Future-tense. You see the system before the people inside it.",
    Pisces: "Tide. Whatever you feel today will move, and you with it.",
  };
  return m[sun] || "Your sun sign will whisper here once your chart is loaded.";
}

export default function TriadCards({ chart, astro, reading, onAddBirthTime }) {
  const sunDesc = reading?.triad_sun_desc || fallbackTriadSunDesc(chart.sun);
  const moonDesc = reading?.triad_moon_desc;
  const risingDesc = reading?.triad_rising_desc;
  const hasBT = !!astro?.birth_time;

  return (
    <div style={{ marginTop: 32 }}>
      <SectionHead title="Your" emphasis="triad" link={hasBT ? null : "Add birth time & place to unlock all three \u2192"} />
      <div style={triadRowStyle}>
        <TriadCard
          glyph={chart.sunGlyph || "&#9737;"}
          label="Sun · self"
          sign={chart.sun ? `${chart.sun}${chart.sunDegree != null ? ` · ${chart.sunDegree}\u00B0` : ""}` : "\u2014"}
          desc={sunDesc}
          locked={false}
        />
        <TriadCard
          glyph="&#9789;"
          label="Moon · inner life"
          sign={chart.moonSign ? chart.moonSign : "\u2014 add time"}
          desc={moonDesc || "Your moon sign shows how you feel things, how you soothe yourself, what makes you feel safe."}
          locked={!hasBT || !chart.moonSign}
          onUnlock={onAddBirthTime}
        />
        <TriadCard
          glyph="&#8599;"
          label="Rising · mask"
          sign={chart.risingSign ? chart.risingSign : "\u2014 add time"}
          desc={risingDesc || "The self people meet first — how you enter a room. Only your birth time can unlock it."}
          locked={!hasBT || !chart.risingSign}
          onUnlock={onAddBirthTime}
        />
      </div>
    </div>
  );
}

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
const triadRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};
const triadCardStyle = {
  position: "relative",
  background: "var(--cream, #FAF4EA)",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.10))",
  borderRadius: 18,
  padding: "20px 18px 22px",
  boxShadow: "0 1px 2px rgba(43,30,22,0.04), 0 4px 12px rgba(43,30,22,0.06)",
};
const triadGlyphStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 30,
  color: "var(--rose-primary, #D45E52)",
  marginBottom: 8,
};
const triadLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #6b4a56)",
  margin: "0 0 4px",
};
const triadSignStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 18,
  fontWeight: 500,
  color: "var(--plum-deep, #2b1e16)",
  margin: "0 0 8px",
};
const triadDescStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--plum-mute, #6b4a56)",
  margin: 0,
};
const triadUnlockBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  fontFamily: "'Inter', sans-serif",
  fontSize: 12, fontWeight: 600,
  color: "var(--rose-primary, #D45E52)",
  background: "transparent",
  border: "1px dashed var(--rose-primary, #D45E52)",
  borderRadius: 9999,
  padding: "6px 12px",
  marginTop: 12,
  cursor: "pointer",
};
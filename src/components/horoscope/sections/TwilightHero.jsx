import { getRulingPlanet, getMoonPhase, prettyDateBritish, prettyBirthday } from "@/utils/astrology";

// ─────────────────────────────────────────────────────────────────────────────
// TwilightHero — Section 1.
// Renders the dark hero card: date · kicker · headline · narrative · pills ·
// moon visual. Copied 1-for-1 from the original HoroscopeTab Hero function.
// ─────────────────────────────────────────────────────────────────────────────

function Pill({ glow, children }) {
  return (
    <span style={{ ...pillStyle, ...(glow ? pillGlowStyle : {}) }}>{children}</span>
  );
}

function MoonVisual({ moon }) {
  const phase = moon.position;
  const offset = Math.cos(2 * Math.PI * phase);
  const isWaxing = moon.waxing;
  return (
    <div style={moonDiscStyle}>
      <div
        style={{
          ...moonOverlayStyle,
          transform: `translateX(${(isWaxing ? -offset : offset) * 50}%)`,
        }}
      />
    </div>
  );
}

function fallbackHeadline(sun, moon) {
  if (!sun) return `The <em>moon</em> is ${moon.short.toLowerCase()}, the day is yours`;
  const ruler = getRulingPlanet(sun);
  return `${ruler} <em>steadies</em>, the moon <em>listens</em>`;
}

function fallbackNarrative(sun, moon) {
  const ruler = sun ? getRulingPlanet(sun) : "your ruler";
  return `Today's reading is being written. While it arrives, your chart is reporting a ${moon.short.toLowerCase()} sky and ${ruler} doing its quiet work. Move gently. Notice what your body is saying before the day asks for an answer.`;
}

function rulerGlyph(planet) {
  const m = { Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇" };
  return m[planet] || "✦";
}

function renderEm(text) {
  if (!text) return "";
  const escaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/g, '<em style="font-style:italic;">$1</em>')
    .replace(/\*(.+?)\*/g, '<em style="font-style:italic;">$1</em>');
}

export default function TwilightHero({ chart, moon, reading }) {
  const kicker = (() => {
    const parts = [];
    if (chart.name) parts.push(`For ${chart.name}`);
    if (chart.birthday) parts.push(`born ${prettyBirthday(chart.birthday)}`);
    if (chart.place) parts.push(chart.place);
    return parts.join(" · ") || "Your chart";
  })();

  const headline = reading?.headline || fallbackHeadline(chart.sun, moon);
  const narrative = reading?.narrative || fallbackNarrative(chart.sun, moon);

  return (
    <div style={heroShellStyle}>
      <div style={heroOverlayStyle} />
      <div style={heroContentStyle}>
        <div style={heroLeftStyle}>
          <p style={heroDateStyle}>{prettyDateBritish(new Date())}</p>
          <p style={heroKickerStyle}>{kicker}</p>
          <h1 style={heroHeadStyle} dangerouslySetInnerHTML={{ __html: renderEm(headline) }} />
          <p style={heroBodyStyle}>{narrative}</p>
          <div style={heroPillsStyle}>
            {chart.sun && <Pill glow>&#9737; {chart.sun} sun</Pill>}
            <Pill>&#9789; {moon.short} · {moon.illumination}%</Pill>
            {reading?.mercury_pill && <Pill>&#9791; {reading.mercury_pill}</Pill>}
            {!reading?.mercury_pill && chart.sunRuler && (
              <Pill>{rulerGlyph(chart.sunRuler)} {chart.sunRuler}</Pill>
            )}
          </div>
        </div>
        <div style={heroVisualStyle} aria-hidden="true">
          <MoonVisual moon={moon} />
          <p style={moonLabelStyle}>{moon.short} — {moon.waxing ? "becoming" : "releasing"}</p>
        </div>
      </div>
    </div>
  );
}

const heroShellStyle = {
  position: "relative",
  borderRadius: 22,
  overflow: "hidden",
  padding: "32px 28px",
  background: "radial-gradient(circle at 20% 30%, #3a2a4c 0%, #221a2e 55%, #15101e 100%)",
  color: "var(--cream, #FAF4EA)",
  boxShadow: "0 2px 4px rgba(43,30,22,0.10), 0 12px 32px rgba(43,30,22,0.18)",
  marginBottom: 8,
};
const heroOverlayStyle = {
  position: "absolute", inset: 0,
  background:
    "radial-gradient(circle at 80% 18%, rgba(232,196,208,0.18) 0%, rgba(232,196,208,0) 30%)," +
    "radial-gradient(circle at 12% 72%, rgba(150,120,180,0.18) 0%, rgba(150,120,180,0) 35%)",
  pointerEvents: "none",
};
const heroContentStyle = {
  position: "relative",
  display: "flex",
  gap: 24,
  flexWrap: "wrap",
  alignItems: "flex-start",
};
const heroLeftStyle = { flex: "1 1 280px", minWidth: 260 };
const heroDateStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(247,239,225,0.72)",
  margin: "0 0 6px",
};
const heroKickerStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12, fontWeight: 500,
  color: "rgba(247,239,225,0.66)",
  margin: "0 0 14px",
  letterSpacing: "0.02em",
};
const heroHeadStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 300,
  fontSize: "clamp(28px, 5vw, 38px)",
  lineHeight: 1.1,
  letterSpacing: "-0.015em",
  color: "var(--cream, #FAF4EA)",
  margin: "0 0 14px",
};
const heroBodyStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  color: "rgba(247,239,225,0.88)",
  margin: "0 0 18px",
};
const heroPillsStyle = { display: "flex", flexWrap: "wrap", gap: 8 };
const heroVisualStyle = {
  flex: "0 0 180px",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
};
const moonLabelStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 12,
  color: "rgba(247,239,225,0.72)",
  margin: 0,
};
const moonDiscStyle = {
  position: "relative",
  width: 130, height: 130,
  borderRadius: "50%",
  background: "radial-gradient(circle at 35% 30%, #F0E6D2 0%, #C9B79E 55%, #6B5B47 100%)",
  overflow: "hidden",
  boxShadow: "0 0 30px rgba(232,196,208,0.18), inset 0 0 20px rgba(0,0,0,0.18)",
};
const moonOverlayStyle = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(90deg, rgba(15,10,22,0.88) 50%, transparent 50.1%)",
};
const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "rgba(247,239,225,0.88)",
  background: "rgba(247,239,225,0.10)",
  border: "1px solid rgba(247,239,225,0.18)",
  padding: "5px 10px",
  borderRadius: 9999,
};
const pillGlowStyle = {
  background: "rgba(232,196,208,0.22)",
  borderColor: "rgba(232,196,208,0.40)",
  color: "var(--cream, #FAF4EA)",
  boxShadow: "0 0 14px rgba(232,196,208,0.30)",
};
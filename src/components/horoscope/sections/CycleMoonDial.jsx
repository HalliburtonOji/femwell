import MoonPhaseGlyph from "../MoonPhaseGlyph";

// ─────────────────────────────────────────────────────────────────────────────
// CycleMoonDial — Section 4.
// Cycle × Moon intersection narrative + paired ring visuals.
// H2a-2: Sky ring now renders the SVG MoonPhaseGlyph instead of moon.glyph
// (which no longer exists on the getMoonPhase return shape).
// ─────────────────────────────────────────────────────────────────────────────

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

function RingWrap({ label, children }) {
  return (
    <div style={ringWrapStyle}>
      <div style={ringStyle}>{children}</div>
      <p style={ringLabelStyle}>{label}</p>
    </div>
  );
}

function cyclePhaseGlyph(phase) {
  switch (phase) {
    case "menstrual": return "\u25D0";
    case "follicular": return "\u25D4";
    case "ovulatory": return "\u25CB";
    case "luteal": return "\u25D5";
    default: return "\u00B7";
  }
}

function defaultCycleMoonHeadline(cycle, moon) {
  if (!cycle) return `A <em>${moon.short.toLowerCase()}</em> over the city`;
  const c = cycle.charAt(0).toUpperCase() + cycle.slice(1);
  return `${c} body under a <em>${moon.short.toLowerCase()}</em>`;
}

function defaultCycleMoonBody(cycle, moon) {
  if (!cycle) {
    return `The moon is ${moon.short.toLowerCase()} and your cycle phase isn't tracked here yet — log a cycle in Track and the sky will start speaking to your body.`;
  }
  const phaseText = {
    menstrual: "Your body is shedding. A bright moon will feel louder than usual.",
    follicular: "Your body is rising. Sky and skin both want gentle action.",
    ovulatory: "Your body is peaking. Conversation will move faster than thought.",
    luteal: "Your body is settling. Edit, refine, finish — don't start.",
  }[cycle];
  return `${phaseText} The ${moon.short.toLowerCase()} sky says: ${moon.waxing ? "build" : "release"}. Match your day to that small instruction and the rest looks after itself.`;
}

export default function CycleMoonDial({ cyclePhase, moon, reading }) {
  const headline = reading?.cycle_moon_headline || defaultCycleMoonHeadline(cyclePhase, moon);
  const body = reading?.cycle_moon_body || defaultCycleMoonBody(cyclePhase, moon);
  return (
    <div style={intersectShellStyle}>
      <div style={{ flex: "1 1 320px" }}>
        <p style={intersectEyebrowStyle}>Your cycle · meeting the sky</p>
        <h3 style={intersectHeadStyle} dangerouslySetInnerHTML={{ __html: renderEm(headline) }} />
        <p style={intersectBodyStyle}>{body}</p>
      </div>
      <div style={ringsRowStyle} aria-hidden="true">
        <RingWrap label="Sky">
          <MoonPhaseGlyph phase={moon.key || "new"} size={36} />
        </RingWrap>
        <RingWrap label="Body">
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 24 }}>
            {cyclePhaseGlyph(cyclePhase)}
          </span>
        </RingWrap>
      </div>
    </div>
  );
}

const intersectShellStyle = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  flexWrap: "wrap",
  background: "linear-gradient(135deg, rgba(232,196,208,0.20), rgba(199,176,222,0.16))",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.08))",
  borderRadius: 22,
  padding: "22px 22px",
  marginTop: 32,
};
const intersectEyebrowStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--rose-primary, #D45E52)",
  margin: "0 0 6px",
};
const intersectHeadStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 400,
  fontSize: 22,
  color: "var(--plum-deep, #2b1e16)",
  margin: "0 0 8px",
  letterSpacing: "-0.01em",
};
const intersectBodyStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  lineHeight: 1.55,
  color: "var(--plum-mute, #6b4a56)",
  margin: 0,
};
const ringsRowStyle = { display: "flex", gap: 12, alignItems: "center" };
const ringWrapStyle = { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 };
const ringStyle = {
  width: 64, height: 64,
  borderRadius: "50%",
  border: "1.5px solid var(--plum-mute, #6b4a56)",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontFamily: "'Fraunces', serif",
  fontSize: 24,
  color: "var(--plum-deep, #2b1e16)",
  background: "rgba(255,255,255,0.32)",
};
const ringLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10, fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #6b4a56)",
  margin: 0,
};
import useRedWhiteMoon from "../hooks/useRedWhiteMoon";
import SectionWrap from "../SectionWrap";

// ─────────────────────────────────────────────────────────────────────────────
// RedWhiteMoon — Section 6.
// Plum Night card. 48px moon glyph (radial gradient per archetype) +
// archetype name + short body. When archetype is "insufficient_data",
// shows the soft empty state.
// ─────────────────────────────────────────────────────────────────────────────

const ARCHETYPE_COPY = {
  red_moon: {
    name: "Red Moon",
    body: "You tend to menstruate at the new moon. Common in women who are rest-aligned, slower-paced.",
  },
  white_moon: {
    name: "White Moon",
    body: "You tend to menstruate at the full moon. Common in women in vital, creative phases.",
  },
  pink_moon: {
    name: "Pink Moon",
    body: "You tend to menstruate during the waxing moon. A growing season.",
  },
  purple_moon: {
    name: "Purple Moon",
    body: "You tend to menstruate during the waning moon. A releasing season.",
  },
  mixed: {
    name: "Mixed",
    body: "Your bleeds move with you, not the moon. Equally true.",
  },
};

const ARCHETYPE_GRADIENTS = {
  red_moon:    "radial-gradient(circle at 30% 30%, #F2D38A 0%, #B89E6A 55%, #8C6A38 100%)",
  white_moon:  "radial-gradient(circle at 30% 30%, #FFFBF1 0%, #E6DDC8 55%, #B6A98A 100%)",
  pink_moon:   "radial-gradient(circle at 30% 30%, #FCE2DE 0%, #E8B0AE 55%, #B66B6F 100%)",
  purple_moon: "radial-gradient(circle at 30% 30%, #E0CFE7 0%, #B49ACB 55%, #6E548E 100%)",
  mixed:       "linear-gradient(135deg, #F2D38A 0%, #F2D38A 49%, #FFFBF1 51%, #FFFBF1 100%)",
};

export default function RedWhiteMoon({ userId }) {
  const { archetype, loading } = useRedWhiteMoon(userId);

  if (loading) return null;

  if (archetype === "insufficient_data") {
    return (
      <SectionWrap>
        <div style={shellStyle} aria-label="Red and white moon archetype — empty state">
          <div style={{ ...moonGlyphStyle, background: ARCHETYPE_GRADIENTS.mixed, opacity: 0.45 }} />
          <div style={bodyStyle}>
            <p style={eyebrowStyle}>Your archetype</p>
            <p style={emptyStateStyle}>
              Log a few more cycles and the moon will tell us your archetype.
            </p>
          </div>
        </div>
      </SectionWrap>
    );
  }

  const meta = ARCHETYPE_COPY[archetype] || ARCHETYPE_COPY.mixed;
  const gradient = ARCHETYPE_GRADIENTS[archetype] || ARCHETYPE_GRADIENTS.mixed;

  return (
    <SectionWrap>
      <div style={shellStyle}>
        <div style={{ ...moonGlyphStyle, background: gradient }} />
        <div style={bodyStyle}>
          <p style={eyebrowStyle}>Your archetype</p>
          <p style={nameStyle}>{meta.name}</p>
          <p style={descStyle}>{meta.body}</p>
        </div>
      </div>
    </SectionWrap>
  );
}

const shellStyle = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  marginTop: 24,
  padding: "20px 22px",
  borderRadius: 18,
  color: "var(--cream, #FAF4EA)",
  background: "radial-gradient(circle at 25% 30%, #3a2a4c 0%, #221a2e 60%, #15101e 100%)",
  boxShadow: "0 2px 4px rgba(43,30,22,0.10), 0 12px 32px rgba(43,30,22,0.18)",
};
const moonGlyphStyle = {
  width: 48,
  height: 48,
  borderRadius: 999,
  flexShrink: 0,
  boxShadow: "inset 0 -2px 6px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.30)",
};
const bodyStyle = { flex: 1, minWidth: 0 };
const eyebrowStyle = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(247,239,225,0.62)",
  margin: "0 0 4px",
};
const nameStyle = {
  fontWeight: 400,
  fontSize: 17,
  color: "var(--cream, #FAF4EA)",
  margin: "0 0 4px",
};
const descStyle = {
  fontSize: 11,
  lineHeight: 1.55,
  color: "rgba(247,239,225,0.78)",
  margin: 0,
};
const emptyStateStyle = {
  fontStyle: "italic",
  fontSize: 13.5,
  lineHeight: 1.55,
  color: "rgba(247,239,225,0.74)",
  margin: 0,
};

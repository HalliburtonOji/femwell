import { Sparkles } from "lucide-react";
import { prettyDateShortBritish } from "@/utils/astrology";
import { getPlanetIcon, glyphToPlanet } from "@/lib/astrology/glyphs";

// ─────────────────────────────────────────────────────────────────────────────
// SkyDiary — Section 5.
// Hosts the current Transits UI (4-card week view) until the Sky Diary
// experience is built out in H2c.
//
// H2a-2: transits now expose a `planet` key (sun/moon/mercury/…) instead of a
// Unicode glyph string. Stored rows from before today may still carry
// `transit.glyph` — we accept that and map via glyphToPlanet.
// ─────────────────────────────────────────────────────────────────────────────

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

function prettyTransitDate(when) {
  if (!when) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(when)) return prettyDateShortBritish(when);
  return when;
}

function TransitCard({ transit }) {
  const planet = transit.planet || glyphToPlanet(transit.glyph);
  const Icon = planet ? getPlanetIcon(planet) : Sparkles;
  return (
    <div style={transitCardStyle}>
      <div style={transitGlyphStyle}>
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={transitWhenStyle}>{prettyTransitDate(transit.when) || transit.when_label || ""}</p>
        <p style={transitTitleStyle}>{transit.title || "Transit"}</p>
        <p style={transitDescStyle}>{transit.desc || transit.body || ""}</p>
      </div>
    </div>
  );
}

function fallbackTransits() {
  const today = new Date();
  const inDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString().split("T")[0];
  };
  return [
    {
      id: "fb-1", planet: "sun",
      when: inDays(0),
      title: "Your reading is being written",
      desc: "We're generating your transits in the background. They'll appear by the next time you open the app.",
    },
    {
      id: "fb-2", planet: "moon",
      when: inDays(3),
      title: "Moon shifts phase",
      desc: "The sky's tone changes mid-week. Notice your sleep around then.",
    },
    {
      id: "fb-3", planet: "venus",
      when: inDays(5),
      title: "Venus moves",
      desc: "Relational weather shifts. Plan a small kindness, not a big gesture.",
    },
    {
      id: "fb-4", planet: "mercury",
      when: inDays(7),
      title: "Mercury reports in",
      desc: "Your ruler will adjust. Watch your word count for a day.",
    },
  ];
}

export default function SkyDiary({ reading }) {
  const transits = Array.isArray(reading?.transits_json) && reading.transits_json.length > 0
    ? reading.transits_json
    : fallbackTransits();
  return (
    <div style={{ marginTop: 32, marginBottom: 24 }}>
      <SectionHead title="This" emphasis="week" link="7-day view" />
      <div style={transitsColStyle}>
        {transits.slice(0, 4).map((t, i) => (
          <TransitCard key={t.id || `t-${i}`} transit={t} />
        ))}
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
const transitsColStyle = { display: "flex", flexDirection: "column", gap: 10 };
const transitCardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
  background: "var(--cream, #FAF4EA)",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.10))",
  borderRadius: 16,
  padding: "14px 16px",
};
const transitGlyphStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  color: "var(--rose-primary, #D45E52)",
  flexShrink: 0,
};
const transitWhenStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #6b4a56)",
  margin: "0 0 2px",
};
const transitTitleStyle = {
  fontFamily: "'Fraunces', serif",
  fontWeight: 500,
  fontSize: 16,
  color: "var(--plum-deep, #2b1e16)",
  margin: "0 0 4px",
};
const transitDescStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--plum-mute, #6b4a56)",
  margin: 0,
};

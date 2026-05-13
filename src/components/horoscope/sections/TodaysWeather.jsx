// ─────────────────────────────────────────────────────────────────────────────
// TodaysWeather — Section 3.
// Power / Pressure / Trouble energy cards.
// Copied 1-for-1 from the original HoroscopeTab Weather function.
// ─────────────────────────────────────────────────────────────────────────────

function SectionHead({ title, emphasis }) {
  return (
    <div style={sectionHeadStyle}>
      <h2 style={sectionTitleStyle}>
        {title} <em style={{ fontStyle: "italic", color: "var(--rose-primary, #D45E52)" }}>{emphasis}</em>
      </h2>
    </div>
  );
}

const WEATHER_META = {
  power:    { glyph: "\u2726", label: "Power",    color: "var(--rose-primary, #D45E52)" },
  pressure: { glyph: "\u25D1", label: "Pressure", color: "var(--gold, #B89E6A)" },
  trouble:  { glyph: "\u25C9", label: "Trouble",  color: "var(--plum-deep, #4A2D40)" },
};

function WeatherCard({ kind, title, body }) {
  const meta = WEATHER_META[kind];
  return (
    <div style={{ ...weatherCardStyle, borderTopColor: meta.color }}>
      <p style={{ ...weatherLabelStyle, color: meta.color }}>{meta.glyph} {meta.label}</p>
      <p style={weatherTitleStyle}>{title}</p>
      <p style={weatherBodyStyle}>{body}</p>
    </div>
  );
}

function fallbackWeatherCard(kind, chart) {
  const sun = chart?.sun || "your sun";
  const m = {
    power: {
      title: "One clear sentence",
      body: `Your reading is being written. While you wait, ask yourself what ${sun} would say plainly today.`,
    },
    pressure: {
      title: "Don't over-explain",
      body: "Today is fine if you respond with fewer words than feels safe.",
    },
    trouble: {
      title: "Small slights, big stories",
      body: "A two-line message will feel like a novel. Let it sit for twenty minutes before you answer.",
    },
  };
  return m[kind];
}

export default function TodaysWeather({ reading, chart }) {
  const power = reading?.power_title
    ? { title: reading.power_title, body: reading.power_body }
    : fallbackWeatherCard("power", chart);
  const pressure = reading?.pressure_title
    ? { title: reading.pressure_title, body: reading.pressure_body }
    : fallbackWeatherCard("pressure", chart);
  const trouble = reading?.trouble_title
    ? { title: reading.trouble_title, body: reading.trouble_body }
    : fallbackWeatherCard("trouble", chart);

  return (
    <div style={{ marginTop: 32 }}>
      <SectionHead title="Today's" emphasis="weather" />
      <div style={weatherRowStyle}>
        <WeatherCard kind="power" title={power.title} body={power.body} />
        <WeatherCard kind="pressure" title={pressure.title} body={pressure.body} />
        <WeatherCard kind="trouble" title={trouble.title} body={trouble.body} />
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
const weatherRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};
const weatherCardStyle = {
  background: "var(--cream, #FAF4EA)",
  border: "1px solid var(--ink-line, rgba(43,30,22,0.10))",
  borderTop: "3px solid var(--rose-primary, #D45E52)",
  borderRadius: 16,
  padding: "16px 18px 18px",
  boxShadow: "0 1px 2px rgba(43,30,22,0.04)",
};
const weatherLabelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  margin: "0 0 8px",
};
const weatherTitleStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontWeight: 400,
  fontSize: 17,
  color: "var(--plum-deep, #2b1e16)",
  margin: "0 0 6px",
};
const weatherBodyStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--plum-mute, #6b4a56)",
  margin: 0,
};
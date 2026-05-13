import { Wind, CloudDrizzle } from "lucide-react";
import {
  INK_NIGHT, ACCENT_NIGHT, RULE_NIGHT,
} from "../styles/tokens.jsx";
import SectionWrap from "../SectionWrap";
import GlossaryTip from "@/components/horoscope/GlossaryTip";

// ─────────────────────────────────────────────────────────────────────────────
// TodaysWeather — Section §3 (per demo §3).
//
// Single rounded Plum Night card signed by Astra + a Spotify "sound for today"
// deep link (A5 from H2_DECISIONS). The legacy Pressure / Trouble cards from
// H2a persist BELOW the main card as a "Notice / Watch for" row — additive
// only, no functionality dropped.
//
// Energy + Mood fields read from the LLM (reading.weather_energy /
// reading.weather_mood) when present (H2b-2 backend ships those); otherwise
// fall through to the H2b-1 placeholders ("7/10" / "Open, decisive").
// ─────────────────────────────────────────────────────────────────────────────

// MOON_SIGN_PLAYLIST — static map of moon sign → curated Spotify URL.
// Placeholder Spotify URIs per H2b-1.md; operator will swap in the real
// Astra-curated playlists later.
const MOON_SIGN_PLAYLIST = {
  aries:       "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
  taurus:      "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
  gemini:      "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLusmQ",
  cancer:      "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
  leo:         "https://open.spotify.com/playlist/37i9dQZF1DXdSjVZQzv2tl",
  virgo:       "https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa",
  libra:       "https://open.spotify.com/playlist/37i9dQZF1DX2sUQwD7tbmL",
  scorpio:     "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u",
  sagittarius: "https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n",
  capricorn:   "https://open.spotify.com/playlist/37i9dQZF1DX9XIFQuFvzM4",
  aquarius:    "https://open.spotify.com/playlist/37i9dQZF1DXcF6B6QPhFDv",
  pisces:      "https://open.spotify.com/playlist/37i9dQZF1DWXLeA8Omikj7",
};

function fallbackWeatherLine(chart) {
  const sun = chart?.sun ? chart.sun : "the day";
  return `A steady ${sun} day under a quiet sky — start the thing you've been thinking about.`;
}

function fallbackBestFor(reading) {
  if (reading?.power_title) {
    // Lower-case the LLM's title for "Best for" inline display
    return reading.power_title
      .replace(/[.!?]+$/, "")
      .toLowerCase();
  }
  return "initiating, naming";
}

function fallbackPressure(chart) {
  const sun = chart?.sun ? chart.sun.toLowerCase() : "today";
  return {
    title: "Don't over-explain",
    body: `Today is fine if you respond with fewer words than feels safe. Let ${sun} speak plainly.`,
  };
}

function fallbackTrouble() {
  return {
    title: "Small slights, big stories",
    body: "A two-line message will feel like a novel. Let it sit for twenty minutes before you answer.",
  };
}

function spotifyHref(moonSign) {
  if (!moonSign) return null;
  return MOON_SIGN_PLAYLIST[String(moonSign).toLowerCase()] || null;
}

export default function TodaysWeather({ reading, chart }) {
  const weatherLine = reading?.power_title || fallbackWeatherLine(chart);
  const tail = reading?.power_body || "";

  // H2b-2 LLM-driven Energy/Mood. Falls back to H2b-1 hardcoded placeholders.
  const energy = (typeof reading?.weather_energy === "number")
    ? `${reading.weather_energy}/10`
    : "7/10";
  const mood = reading?.weather_mood || "Open, decisive";
  const bestFor = fallbackBestFor(reading);

  // Spotify deep link — keyed by user's moon sign (if known), else sun sign.
  const moonSignKey = chart?.moonSign || chart?.sun;
  const spotifyUrl = spotifyHref(moonSignKey);

  const pressure = reading?.pressure_title
    ? { title: reading.pressure_title, body: reading.pressure_body }
    : fallbackPressure(chart);
  const trouble = reading?.trouble_title
    ? { title: reading.trouble_title, body: reading.trouble_body }
    : fallbackTrouble();

  return (
    <SectionWrap>
      <div style={mainCardStyle}>
        <div style={eyebrowStyle}>Today's sky &middot; signed by Astra</div>
        <p style={weatherLineStyle}>
          “{weatherLine}{tail ? "" : ""}”
        </p>
        {tail && <p style={tailStyle}>{tail}</p>}
        <div style={statRowStyle}>
          <span style={statStyle}><strong style={statStrong}>Energy</strong> {energy}</span>
          <span style={statStyle}><strong style={statStrong}>Mood</strong> {mood}</span>
          <span style={statStyle}><strong style={statStrong}>Best for</strong> {bestFor}</span>
        </div>
        <div style={statRowStyle} aria-hidden>
          <span style={statStyle}><strong style={statStrong}>Transit note</strong> <GlossaryTip term="transit">What is a transit?</GlossaryTip></span>
        </div>
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={spotifyLinkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
          >
            Astra's sound for today →
          </a>
        )}
      </div>

      <div style={noticeRowStyle}>
        <NoticeCard
          icon={Wind}
          eyebrow="Notice"
          title={pressure.title}
          body={pressure.body}
        />
        <NoticeCard
          icon={CloudDrizzle}
          eyebrow="Watch for"
          title={trouble.title}
          body={trouble.body}
        />
      </div>
    </SectionWrap>
  );
}

function NoticeCard({ icon: Icon, eyebrow, title, body }) {
  return (
    <div style={noticeCardStyle}>
      <div style={noticeHeadStyle}>
        <Icon size={14} strokeWidth={1.6} style={{ color: ACCENT_NIGHT }} />
        <span style={noticeEyebrowStyle}>{eyebrow}</span>
      </div>
      <p style={noticeTitleStyle}>{title}</p>
      <p style={noticeBodyStyle}>{body}</p>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const mainCardStyle = {
  background: "rgba(245,230,211,0.04)",
  border: `1px solid ${RULE_NIGHT}`,
  borderRadius: 16,
  padding: "18px 18px 16px",
};
const eyebrowStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(245,230,211,0.55)",
  fontWeight: 700,
  marginBottom: 6,
};
const weatherLineStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 18,
  fontWeight: 400,
  color: INK_NIGHT,
  lineHeight: 1.4,
  margin: "0 0 8px",
};
const tailStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "rgba(245,230,211,0.72)",
  lineHeight: 1.5,
  margin: "0 0 12px",
};
const statRowStyle = {
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
  fontSize: 11,
  color: "rgba(245,230,211,0.78)",
  fontFamily: "'Inter', sans-serif",
};
const statStyle = {
  display: "inline-flex",
  alignItems: "baseline",
  gap: 5,
};
const statStrong = {
  color: ACCENT_NIGHT,
  fontWeight: 600,
};
const spotifyLinkStyle = {
  display: "inline-block",
  marginTop: 12,
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 500,
  color: ACCENT_NIGHT,
  textDecoration: "none",
  letterSpacing: "0.01em",
};
const noticeRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  marginTop: 10,
};
const noticeCardStyle = {
  background: "rgba(245,230,211,0.04)",
  border: `1px solid ${RULE_NIGHT}`,
  borderRadius: 12,
  padding: "10px 12px",
};
const noticeHeadStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 4,
};
const noticeEyebrowStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: "rgba(245,230,211,0.55)",
};
const noticeTitleStyle = {
  fontFamily: "'Fraunces', serif",
  fontStyle: "italic",
  fontSize: 13,
  color: INK_NIGHT,
  lineHeight: 1.4,
  margin: "0 0 4px",
};
const noticeBodyStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: "rgba(245,230,211,0.70)",
  lineHeight: 1.5,
  margin: 0,
};
import { Wind, CloudDrizzle, Headphones, Play } from "lucide-react";
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
// Curated 2026-05-14: Each playlist is Spotify-editorial ("By Spotify").
// Seven signs have Spotify-official zodiac playlists (Aries → Scorpio).
// Cancer, Sagittarius, Capricorn, Aquarius, Pisces lacked active Spotify-
// official zodiac mixes at curation time, so they fall back to vibe-matched
// Spotify-editorial mood playlists that suit the archetype.
const MOON_SIGN_PLAYLIST = {
  // Bold, energetic, leader — Spotify-official Aries
  aries:       "https://open.spotify.com/playlist/37i9dQZF1DX2DC3Q7JOmYe",
  // Sensual, grounded, indulgent — Spotify-official Taurus
  taurus:      "https://open.spotify.com/playlist/37i9dQZF1DXbCgDGG5xQtb",
  // Curious, eclectic, social — Spotify-official Gemini
  gemini:      "https://open.spotify.com/playlist/37i9dQZF1DWWVULl5wUsL9",
  // Tender, nurturing, water — Soft Pop Hits (vibe match, Spotify-editorial)
  cancer:      "https://open.spotify.com/playlist/37i9dQZF1DWTwnEm1IYyoj",
  // Dramatic, performer, anthemic — Spotify-official Leo
  leo:         "https://open.spotify.com/playlist/37i9dQZF1DX7cvHpkIJFt2",
  // Analytical, precise, focused — Spotify-official Virgo
  virgo:       "https://open.spotify.com/playlist/37i9dQZF1DX6PdsVYbP4rI",
  // Aesthetic, balanced, refined — Spotify-official Libra
  libra:       "https://open.spotify.com/playlist/37i9dQZF1DXco4NYQOMLiT",
  // Intense, mysterious, deep — Spotify-official Scorpio
  scorpio:     "https://open.spotify.com/playlist/37i9dQZF1DX0YZgrwmizcR",
  // Adventurous, wanderlust, free — Acoustic Hits (vibe match, Spotify-editorial)
  sagittarius: "https://open.spotify.com/playlist/37i9dQZF1DX4VvfRBFClxm",
  // Disciplined, serious, focused — Deep Focus (vibe match, Spotify-editorial)
  capricorn:   "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ",
  // Innovative, eccentric, electronic — mint (vibe match, Spotify-editorial)
  aquarius:    "https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n",
  // Dreamy, ethereal, fluid — Dreampop (vibe match, Spotify-editorial)
  pisces:      "https://open.spotify.com/playlist/37i9dQZF1DX6uhsAfngvaD",
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

function capitalize(s) {
  if (!s || typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
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
            aria-label={`Open today's matching Spotify playlist for your ${moonSignKey || ""} moon sign in a new tab`}
            style={spotifyChipStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 10px 24px -8px rgba(29,185,84,0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 20px -8px rgba(29,185,84,0.55)";
            }}
          >
            <span data-play-dot style={spotifyPlayDotStyle}>
              <Play data-play-icon size={9} strokeWidth={0} fill="#1DB954" style={spotifyPlayIconStyle} />
            </span>
            <Headphones size={14} strokeWidth={1.8} aria-hidden style={{ flexShrink: 0 }} />
            <span style={spotifyChipLabelStyle}>
              <span style={spotifyChipLeadStyle}>Play Astra's sound</span>
              <span style={spotifyChipMetaStyle}>
                Spotify · {moonSignKey ? `${capitalize(moonSignKey)} moon` : "today's mood"}
              </span>
            </span>
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
// Spotify brand green for the matching-sound chip. Used sparingly — only on
// this single CTA — so it reads as "this is a music thing, tap to play" at
// a glance without clashing with the Plum Night palette.
const SPOTIFY_GREEN = "#1DB954";
const spotifyChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  marginTop: 14,
  padding: "10px 14px 10px 10px",
  borderRadius: 999,
  background: SPOTIFY_GREEN,
  border: `1px solid ${SPOTIFY_GREEN}`,
  color: "#0a0a0a",
  fontFamily: "'Inter', sans-serif",
  textDecoration: "none",
  transition: "transform 120ms ease, box-shadow 120ms ease",
  boxShadow: "0 6px 20px -8px rgba(29,185,84,0.55)",
  cursor: "pointer",
};
const spotifyPlayDotStyle = {
  width: 22,
  height: 22,
  borderRadius: 999,
  background: "#0a0a0a",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
const spotifyPlayIconStyle = {
  color: SPOTIFY_GREEN,
  marginLeft: 1,  // visual offset so the triangle reads as centered
};
const spotifyChipLabelStyle = {
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "flex-start",
  lineHeight: 1.1,
};
const spotifyChipLeadStyle = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "-0.005em",
};
const spotifyChipMetaStyle = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  opacity: 0.78,
  marginTop: 2,
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
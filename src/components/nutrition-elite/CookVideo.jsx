// CookVideo — a clean, in-card YouTube cook-clip player for the Nutrition Recipes lens.
// Mirrors WorkoutPlayer's youtube-nocookie embed approach: a click-to-play thumbnail, then a
// 16:9 rounded nocookie iframe (?rel=0&modestbranding=1&playsinline=1).
//
// HARD RULE (YouTube ToS): NEVER place any overlay or tap-target ON TOP of the iframe or its controls.
// The play button only sits over the *static thumbnail* (before play). Once playing, nothing is
// layered over the iframe. Recipe title / CTAs live ABOVE or BELOW this component — never on it.
// A "Watch on YouTube" link sits BELOW the player.
import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { T, UI } from "@/components/journal/Editorial";

export default function CookVideo({ youtubeId, title = "Cook video", accent = "#A8893F" }) {
  const [playing, setPlaying] = useState(false);
  if (!youtubeId) return null;

  const thumb = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  return (
    <div style={{ width: "100%" }}>
      {/* 16:9 frame */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 12, overflow: "hidden", background: "#111" }}>
        {!playing ? (
          // The play button overlays the STATIC THUMBNAIL only (not a live iframe) — ToS-safe.
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 0, border: "none", cursor: "pointer", background: "transparent" }}
          >
            <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
            <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(11,8,5,0.22)" }}>
              <span style={{ width: 52, height: 52, borderRadius: 999, background: "rgba(244,239,227,0.94)", display: "grid", placeItems: "center", boxShadow: "0 4px 18px rgba(11,8,5,0.34)" }}>
                <Play size={22} color={accent} style={{ marginLeft: 3 }} fill={accent} />
              </span>
            </span>
          </button>
        ) : (
          // NOTHING is layered over this iframe — ToS-safe.
          <iframe
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          />
        )}
      </div>
      {/* CTA strictly BELOW the player */}
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted, textDecoration: "none" }}
      >
        <ExternalLink size={11} /> Cook full-screen on YouTube
      </a>
    </div>
  );
}

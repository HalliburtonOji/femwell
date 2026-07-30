// LifestyleMedia — the REAL in-card media player for the elite Lifestyle page. Replaces the old
// presentational InlinePlayer (a play-state toggle with no actual playback). Mirrors the ToS-safe
// pattern of nutrition-elite/CookVideo: click a STATIC thumbnail → a clean embed; NOTHING is ever
// layered over the live iframe/player; an "open full-screen" link sits BELOW.
//
// Decision tree (driven by LifestyleItems.media_type — the VERIFIED live field):
//   VIDEO   → is_embeddable && video_id  → youtube-nocookie iframe (thumb = image_url || YT hqdefault)
//             else is_embeddable && embed_url → iframe embed_url
//             else → a tasteful "Watch" card link → content_url
//   PODCAST / CLIP → audio_url → a REAL <audio> player (play/pause + seek + duration)
//             else → a "Listen" card link → episode_url || content_url
//   TIKTOK / INSTAGRAM → link-out card (per the plan — don't fake inline) → content_url, image_url thumb
//   ARTICLE / anything else → "Open" card → content_url
//
// All colours via the brand token T; no emoji (Lucide only). UK voice.
import { useState, useRef, useCallback } from "react";
import { Play, Pause, ExternalLink, Headphones, Film, Music2 } from "lucide-react";
import { T, UI } from "@/components/journal/Editorial";

const mt = (item) => String(item?.media_type || "").toUpperCase();

// ── tiny helper: a tasteful link-out card (Watch / Listen / Open externally) ──
function LinkOutCard({ href, label, sub, Icon, accent, thumb }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: thumb ? 8 : "10px 12px" }}>
      {thumb
        ? <img src={thumb} alt="" loading="lazy" style={{ width: 56, height: 56, borderRadius: 9, objectFit: "cover", flexShrink: 0, background: "#1a1410" }} />
        : <span style={{ width: 34, height: 34, borderRadius: 9, background: `${accent}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={16} color={accent} /></span>}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft, display: "block", lineHeight: 1.2 }}>{label}</span>
        {sub && <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, display: "block" }}>{sub}</span>}
      </span>
      <ExternalLink size={14} color={T.muted} style={{ flexShrink: 0 }} />
    </a>
  );
}

// ── YouTube / embed video (ToS-safe; nothing overlays the live iframe) ──
function VideoPlayer({ item, accent }) {
  const [playing, setPlaying] = useState(false);
  const videoId = item?.video_id;
  const embedUrl = item?.embed_url;
  const open = item?.content_url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);

  // not actually embeddable → link out tastefully
  if (!item?.is_embeddable || (!videoId && !embedUrl)) {
    return <LinkOutCard href={open} label="Watch" sub={item?.channel_name || item?.duration_label || "Opens in a new tab"} Icon={Film} accent={accent} thumb={item?.image_url} />;
  }

  const src = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`
    : `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`;
  const thumb = item?.image_url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 12, overflow: "hidden", background: "#1a1410" }}>
        {!playing ? (
          // play button sits over the STATIC THUMBNAIL only — never over a live iframe
          <button onClick={() => setPlaying(true)} aria-label={`Play ${item?.title || "video"}`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 0, border: "none", cursor: "pointer", background: "transparent" }}>
            {thumb
              ? <img src={thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              : <span style={{ position: "absolute", inset: 0, background: "#1a1410" }} />}
            <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(11,8,5,0.22)" }}>
              <span style={{ width: 52, height: 52, borderRadius: 999, background: "rgba(244,239,227,0.94)", display: "grid", placeItems: "center", boxShadow: "0 4px 18px rgba(11,8,5,0.34)" }}>
                <Play size={22} color={accent} style={{ marginLeft: 3 }} fill={accent} />
              </span>
            </span>
          </button>
        ) : (
          <iframe src={src} title={item?.title || "Video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} />
        )}
      </div>
      {open && (
        <a href={open} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted, textDecoration: "none" }}>
          <ExternalLink size={11} /> Watch full-screen
        </a>
      )}
    </div>
  );
}

const fmt = (s) => { if (!Number.isFinite(s) || s < 0) return "0:00"; const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${m}:${String(sec).padStart(2, "0")}`; };

// ── real <audio> player (play/pause + seek + duration) ──
function AudioPlayer({ item, accent }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(item?.duration_seconds || 0);
  const open = item?.episode_url || item?.content_url;

  const toggle = useCallback(() => {
    const el = ref.current; if (!el) return;
    if (el.paused) { el.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
    else { el.pause(); setPlaying(false); }
  }, []);
  const seek = useCallback((e) => { const el = ref.current; if (!el || !dur) return; const v = Number(e.target.value); el.currentTime = v; setCur(v); }, [dur]);

  if (!item?.audio_url) {
    return <LinkOutCard href={open} label="Listen" sub={item?.channel_name || item?.duration_label || "Opens in your podcast app"} Icon={Headphones} accent={accent} thumb={item?.image_url} />;
  }

  return (
    <div style={{ width: "100%", background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "10px 12px" }}>
      <audio ref={ref} src={item.audio_url} preload="metadata"
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || item?.duration_seconds || 0)}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime || 0)}
        onEnded={() => { setPlaying(false); setCur(0); }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="fw-elite-press"
          style={{ width: 38, height: 38, borderRadius: 999, background: accent, border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          {playing ? <Pause size={16} color="#fff" /> : <Play size={16} color="#fff" style={{ marginLeft: 2 }} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input type="range" min={0} max={dur || 0} step={1} value={Math.min(cur, dur || 0)} onChange={seek} aria-label="Seek"
            style={{ width: "100%", accentColor: accent, cursor: "pointer", margin: 0 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 1 }}>
            <span>{fmt(cur)}</span>
            {/* never show a raw-seconds duration_label like "2700" — only trust a real label */}
            <span>{(item?.duration_label && !/^\d+$/.test(String(item.duration_label).trim())) ? item.duration_label : fmt(dur)}</span>
          </div>
        </div>
      </div>
      {open && (
        <a href={open} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted, textDecoration: "none" }}>
          <ExternalLink size={11} /> Open the full episode
        </a>
      )}
    </div>
  );
}

// ── the dispatcher ──
export default function LifestyleMedia({ item, accent = "#A8893F" }) {
  if (!item) return null;
  const type = mt(item);

  if (type === "TIKTOK" || type === "INSTAGRAM") {
    const open = item?.content_url;
    return <LinkOutCard href={open} label={type === "TIKTOK" ? "Watch on TikTok" : "Watch on Instagram"} sub={item?.channel_name || "Opens in a new tab"} Icon={Music2} accent={accent} thumb={item?.image_url} />;
  }
  if (type === "VIDEO") return <VideoPlayer item={item} accent={accent} />;
  if (type === "PODCAST" || type === "CLIP") return <AudioPlayer item={item} accent={accent} />;

  // ARTICLE or unknown → open link
  return <LinkOutCard href={item?.content_url} label="Open" sub={item?.channel_name || item?.duration_label} Icon={Film} accent={accent} thumb={item?.image_url} />;
}

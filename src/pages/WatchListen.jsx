// WatchListen — piece H — the ONE "Everything to watch & listen" contents page, in OUR
// language: flora covers (generative, zero fetch), our fonts, NO YouTube/Unsplash chrome.
// Two tabs: (1) Watch & listen — the real in-app episodes + videos, inline-playable, filtered
// by length and kind; (2) Shows to follow — the 12 curated external shows as honest Spotify/
// Apple link-outs. Reached from the Lifestyle "Listen & watch" board. No new entity/function.
import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Headphones, Film, Clock, ExternalLink } from "lucide-react";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { FwFloraHero } from "@/components/brand/PageTop";
import FloraCover from "@/components/brand/FloraCover";
import { FloraYouTube, FloraAudio } from "@/components/brand/expandCards";
import { cwOf } from "@/components/brand/flora";
import { EXTERNAL_PODCASTS } from "@/components/lifestyle/listen/ExternalPodcastsRail";
import { LIFESTYLE_VIDEOS } from "@/data/lifestyleVideos";

const stripHtml = (s) => (s ? String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "");
// minutes from duration_seconds, else parse a label ("20 min" / "2h 14min" / "1:02:30")
const minutesOf = (it) => {
  const s = Number(it?.duration_seconds);
  if (Number.isFinite(s) && s > 0) return Math.max(1, Math.round(s / 60));
  const L = String(it?.duration_label || "").toLowerCase();
  const clock = L.match(/(?:(\d+):)?(\d{1,2}):(\d{2})/);
  if (clock) return Math.max(1, (+(clock[1] || 0)) * 60 + (+clock[2]) + (clock[3] >= 30 ? 1 : 0));
  let m = 0; const h = L.match(/(\d+)\s*h/); const mm = L.match(/(\d+)\s*m/);
  if (h) m += +h[1] * 60; if (mm) m += +mm[1];
  if (!m) { const n = L.match(/(\d+)/); if (n) m = +n[1]; }
  return m;
};
const durLabel = (mins) => !mins ? "" : mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ""}`.trim() : `${mins} min`;

const LENGTHS = [
  { key: "all", label: "Any length", test: () => true },
  { key: "short", label: "Under 5 min", test: (m) => m > 0 && m < 5 },
  { key: "mid", label: "Under 15 min", test: (m) => m >= 5 && m <= 15 },
  { key: "long", label: "Longer", test: (m) => m > 15 },
];
const KINDS = [
  { key: "all", label: "All" },
  { key: "video", label: "Watch" },
  { key: "audio", label: "Listen" },
];

function Chip({ on, onClick, children, accent }) {
  return (
    <button onClick={onClick} className="fw-elite-press"
      style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700,
        background: on ? accent : T.paperHi, color: on ? "#fff" : T.muted, border: `1px solid ${on ? accent : T.paperDeep}` }}>
      {children}
    </button>
  );
}

// one watch/listen tile — flora poster + real inline player (no YouTube/Unsplash artwork)
function MediaTile({ item }) {
  const accent = cwOf(item.kind === "audio" ? "sage" : "gold").petal;
  return (
    <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${T.paperDeep}`, borderRadius: 16, overflow: "hidden", background: T.paperHi, boxShadow: "0 2px 10px rgba(58,44,26,.07)" }}>
      {item.kind === "video"
        ? <FloraYouTube videoId={item.youtubeId} item={{ id: item.id, title: item.title, category: item.category, cw: item.kind === "audio" ? "sage" : "gold" }} accent={accent} />
        : <div style={{ padding: 11 }}><FloraAudio src={item.audioSrc} label={item.title} accent={accent} initialDuration={item.seconds} item={{ id: item.id, title: item.title, sourceName: item.source }} /></div>}
      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: accent }}>
          {item.kind === "audio" ? <Headphones size={11} /> : <Film size={11} />}{item.kind === "audio" ? "Listen" : "Watch"}
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15.5, lineHeight: 1.2, color: OXBLOOD }}>{item.title}</div>
        <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {item.source && <span>{item.source}</span>}
          {item.mins ? <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {durLabel(item.mins)}</span> : null}
        </div>
      </div>
    </div>
  );
}

// one external show — flora cover (retires the Unsplash artwork) + platform link-outs
function ShowTile({ show }) {
  const accent = cwOf("plum").petal;
  const plat = show.platforms || {};
  return (
    <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${T.paperDeep}`, borderRadius: 16, overflow: "hidden", background: T.paperHi, boxShadow: "0 2px 10px rgba(58,44,26,.07)" }}>
      <FloraCover title={show.show} category="listen podcast rest" colorway="plum" seed={show.id} height={128} roundTop showTitle={false} idx={`show-${show.id}`} />
      <div style={{ padding: "11px 13px 13px", display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
        <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: accent }}>{show.show}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15.5, lineHeight: 1.2, color: OXBLOOD }}>{show.title}</div>
        {show.summary && <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{show.summary}</div>}
        {show.duration && <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted, display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {show.duration}</div>}
        <div style={{ display: "flex", gap: 7, marginTop: "auto", paddingTop: 4, flexWrap: "wrap" }}>
          {plat.spotify && <a href={plat.spotify} target="_blank" rel="noopener noreferrer" style={linkBtn(accent)}>Spotify <ExternalLink size={11} /></a>}
          {plat.apple && <a href={plat.apple} target="_blank" rel="noopener noreferrer" style={linkBtn(accent)}>Apple <ExternalLink size={11} /></a>}
        </div>
      </div>
    </div>
  );
}
const linkBtn = (accent) => ({ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", fontFamily: UI, fontSize: 12, fontWeight: 700, color: accent, background: `${accent}12`, border: `1px solid ${accent}44`, borderRadius: 999, padding: "6px 11px" });

export default function WatchListen() {
  const [tab, setTab] = useState("media");     // "media" | "shows"
  const [length, setLength] = useState("all");
  const [kind, setKind] = useState("all");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      let rows = [];
      try { rows = await base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 200).catch(() => []); } catch { rows = []; }
      if (!alive) return;
      const out = [];
      const seen = new Set();
      const push = (o) => { if (o && !seen.has(o.id)) { seen.add(o.id); out.push(o); } };
      (Array.isArray(rows) ? rows : []).forEach((r) => {
        const m = String(r.media_type || "").toUpperCase();
        if (/PODCAST|AUDIO/.test(m) && r.audio_url) {
          push({ id: r.id, kind: "audio", title: r.title, source: r.source_name || r.channel_name || "FemWell", audioSrc: r.audio_url, seconds: Number(r.duration_seconds) || 0, mins: minutesOf(r), category: "listen podcast rest" });
        } else if (m === "VIDEO" && r.video_id && r.is_embeddable !== false) {
          push({ id: r.id, kind: "video", title: r.title, source: r.channel_name || r.source_name || "", youtubeId: r.video_id, mins: minutesOf(r), category: "creative watch make" });
        }
      });
      // fold in the curated, verified-embeddable videos (our whole-life watch lane)
      LIFESTYLE_VIDEOS.forEach((v) => push({ id: v.id, kind: "video", title: v.title, source: v.channel_name || "", youtubeId: v.video_id, mins: minutesOf(v), category: "creative watch make" }));
      if (alive) { setItems(out); setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const gold = cwOf("gold").petal;
  const shown = useMemo(() => {
    const lt = LENGTHS.find((l) => l.key === length) || LENGTHS[0];
    return items.filter((it) => (kind === "all" || it.kind === kind) && lt.test(it.mins));
  }, [items, length, kind]);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 40, height: 40, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer", marginBottom: 8 }}>
          <ArrowLeft size={18} />
        </button>
        <FwFloraHero title="Everything to watch & listen" line="Real episodes and short watches, in our own quiet language — no endless feed." colorway="sage" flankL="bluebell" flankR="sunflower" titleColor={OXBLOOD} creature="dragonfly" />

        {/* tabs */}
        <div style={{ display: "flex", gap: 8, margin: "14px 0 10px" }}>
          {[["media", "Watch & listen"], ["shows", "Shows to follow"]].map(([k, lbl]) => (
            <button key={k} onClick={() => setTab(k)} className="fw-elite-press"
              style={{ flex: 1, padding: "11px", borderRadius: 13, cursor: "pointer", fontFamily: UI, fontSize: 13.5, fontWeight: 800,
                background: tab === k ? OXBLOOD : T.paperHi, color: tab === k ? "#fff" : T.muted, border: `1px solid ${tab === k ? OXBLOOD : T.paperDeep}` }}>
              {lbl}
            </button>
          ))}
        </div>

        {tab === "media" ? (
          <>
            {/* filters — length + kind */}
            <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "4px 0 6px", scrollbarWidth: "none" }} className="fw-wl-filters">
              <style>{`.fw-wl-filters::-webkit-scrollbar{display:none}`}</style>
              {LENGTHS.map((l) => <Chip key={l.key} on={length === l.key} accent={gold} onClick={() => setLength(l.key)}>{l.label}</Chip>)}
            </div>
            <div style={{ display: "flex", gap: 7, padding: "0 0 12px" }}>
              {KINDS.map((k) => <Chip key={k.key} on={kind === k.key} accent={cwOf("sage").petal} onClick={() => setKind(k.key)}>{k.label}</Chip>)}
            </div>
            {loading ? (
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, textAlign: "center", padding: "30px 0" }}>Gathering what's worth your time…</p>
            ) : shown.length === 0 ? (
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, textAlign: "center", padding: "30px 0" }}>Nothing at that length yet — try another filter.</p>
            ) : (
              <>
                <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.muted, margin: "0 0 10px" }}>{shown.length} to {kind === "audio" ? "hear" : kind === "video" ? "watch" : "watch & hear"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {shown.map((it) => <MediaTile key={it.id} item={it} />)}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "6px 0 14px" }}>Shows worth following, opened in the app you already use.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {EXTERNAL_PODCASTS.map((s) => <ShowTile key={s.id} show={s} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

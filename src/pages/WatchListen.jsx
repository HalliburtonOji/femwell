// WatchListen — piece H — the ONE "Everything to watch & listen" contents page, in OUR
// language: flora covers (generative, zero fetch), our fonts, NO YouTube/Unsplash chrome.
// Two tabs: (1) Watch & listen — the real in-app episodes + videos, inline-playable, filtered
// by length and kind; (2) Shows to follow — the 12 curated external shows as honest Spotify/
// Apple link-outs. Reached from the Lifestyle "Listen & watch" board. No new entity/function.
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Headphones, Film, Clock, ExternalLink } from "lucide-react";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { FwFloraHero } from "@/components/brand/PageTop";
import FloraCover from "@/components/brand/FloraCover";
import { FloraYouTube, FloraAudio, decodeEntities } from "@/components/brand/expandCards";
import { cwOf } from "@/components/brand/flora";
import { EXTERNAL_PODCASTS } from "@/components/lifestyle/listen/ExternalPodcastsRail";
import { LIFESTYLE_VIDEOS } from "@/data/lifestyleVideos";

const stripHtml = (s) => (s ? String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "");
// real third-party titles carry emoji + hashtag tails; strip them so the grid reads as OURS
// (brand: no emoji), keeping the actual words.
const cleanTitle = (t) => decodeEntities(String(t || ""))
  .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu, "")
  .replace(/(^|\s)#[\w-]+/g, "")
  .replace(/\s+/g, " ").trim();
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

function Chip({ on, onClick, children, accent, calm = false }) {
  return (
    <button onClick={onClick} className="fw-elite-press"
      style={{ flexShrink: 0, padding: calm ? "10px 14px" : "8px 14px", minHeight: calm ? 44 : undefined, borderRadius: 999, cursor: "pointer", fontFamily: calm ? "system-ui" : UI, fontSize: calm ? 14 : 12.5, fontWeight: 700,
        background: on ? accent : calm ? "#fff" : T.paperHi, color: on ? (calm && accent === cwOf("gold").petal ? "#191510" : "#fff") : calm ? "#51444e" : T.muted, border: `1px solid ${on ? accent : calm ? "#dedbd5" : T.paperDeep}` }}>
      {children}
    </button>
  );
}

// one watch/listen tile — flora poster + real inline player (no YouTube/Unsplash artwork)
function MediaTile({ item, calm = false }) {
  const accent = cwOf(item.kind === "audio" ? "sage" : "gold").petal;
  return (
    <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${calm ? "#e6e3dc" : T.paperDeep}`, borderRadius: calm ? 20 : 16, overflow: "hidden", background: calm ? "#fff" : T.paperHi, boxShadow: calm ? "0 8px 28px rgba(58,46,57,.05)" : "0 2px 10px rgba(58,44,26,.07)" }}>
      {item.kind === "video"
        ? <FloraYouTube videoId={item.youtubeId} item={{ id: item.id, title: item.title, category: item.category, cw: item.kind === "audio" ? "sage" : "gold" }} accent={accent} />
        : <div style={{ padding: 11 }}><FloraAudio presentation={calm ? "focused" : undefined} src={item.audioSrc} label={item.title} accent={accent} initialDuration={item.seconds} item={{ id: item.id, title: item.title, sourceName: item.source, _raw: item.raw }} /></div>}
      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: calm ? 12 : 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: accent }}>
          {item.kind === "audio" ? <Headphones size={11} /> : <Film size={11} />}{item.kind === "audio" ? "Listen" : "Watch"}
        </div>
        <div style={{ fontFamily: calm ? '"FemWell Editorial","Cormorant Garamond",Georgia,serif' : SERIF, fontWeight: 600, fontSize: calm ? 21 : 15.5, lineHeight: 1.2, color: calm ? "#51444e" : OXBLOOD }}>{item.title}</div>
        <div style={{ fontFamily: UI, fontSize: calm ? 12 : 11.5, fontWeight: 600, color: calm ? "#51444e" : T.muted, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {item.source && <span>{item.source}</span>}
          {item.mins ? <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {durLabel(item.mins)}</span> : null}
        </div>
      </div>
    </div>
  );
}

// one external show — flora cover (retires the Unsplash artwork) + platform link-outs
function ShowTile({ show, calm = false }) {
  const accent = cwOf("plum").petal;
  const plat = show.platforms || {};
  return (
    <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${calm ? "#e6e3dc" : T.paperDeep}`, borderRadius: calm ? 20 : 16, overflow: "hidden", background: calm ? "#fff" : T.paperHi, boxShadow: calm ? "0 8px 28px rgba(58,46,57,.05)" : "0 2px 10px rgba(58,44,26,.07)" }}>
      <FloraCover title={show.show} category="listen podcast rest" colorway="plum" seed={show.id} height={128} roundTop showTitle={false} idx={`show-${show.id}`} />
      <div style={{ padding: "11px 13px 13px", display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
        <div style={{ fontFamily: UI, fontSize: calm ? 12 : 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: accent }}>{show.show}</div>
        <div style={{ fontFamily: calm ? '"FemWell Editorial","Cormorant Garamond",Georgia,serif' : SERIF, fontWeight: 600, fontSize: calm ? 21 : 15.5, lineHeight: 1.2, color: calm ? "#51444e" : OXBLOOD }}>{show.title}</div>
        {show.summary && <div style={{ fontFamily: SERIF, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{show.summary}</div>}
        {show.duration && <div style={{ fontFamily: UI, fontSize: calm ? 12 : 11.5, fontWeight: 600, color: calm ? "#51444e" : T.muted, display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {show.duration}</div>}
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
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const calm = params.get("appearance") === "calm";
  const returnToMain = params.get("from") === "lifestyle-main";
  const [tab, setTab] = useState("media");     // "media" | "shows"
  const [length, setLength] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [kind, setKind] = useState(() => {
    const mode = new URLSearchParams(window.location.search).get("mode");
    return mode === "listen" ? "audio" : mode === "watch" ? "video" : "all";
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      // Audio ⟺ media_type "PODCAST" (measured: measure_podcast_episodes_fields.md — all 87
      // audio-bearing items are PODCAST/PUBLISHED, engagement_score 0 so an engagement cap
      // buries them, and only ~29 are recent). So fetch podcasts on their OWN media_type query
      // to get ALL of them, and the videos on the engagement query. Client-keep audio_url.
      // MEASURED (measure_usable_videos.md): ALL 919 published VIDEO rows are usable as-is —
      // every one has a video_id + title and none is explicitly is_embeddable:false. So fetch the
      // video library on its OWN query rather than leaving it to the engagement cap.
      // two video slices (top-engagement AND most-recent) so the library isn't just one ranked
      // window — deduped by video_id below (measured: 919 rows → 800 distinct).
      // Keep the mixed slice: PUBLISHED PRACTICE rows can carry playable audio
      // without media_type PODCAST. Removing this read would hide that lane.
      const results = await Promise.allSettled([
        base44.entities.LifestyleItems.filter({ media_type: "PODCAST", status: "PUBLISHED" }, "-created_date", 120),
        base44.entities.LifestyleItems.filter({ media_type: "VIDEO", status: "PUBLISHED" }, "-engagement_score", 200),
        base44.entities.LifestyleItems.filter({ media_type: "VIDEO", status: "PUBLISHED" }, "-created_date", 200),
        base44.entities.LifestyleItems.filter({ status: "PUBLISHED" }, "-engagement_score", 160),
      ]);
      if (!alive) return;
      const [pods, vids, vidsNew, rows] = results.map(result => result.status === "fulfilled" && Array.isArray(result.value) ? result.value : []);
      const out = [];
      const seen = new Set();
      // videos dedup on video_id (measured: 919 rows → 800 distinct; 106 ids repeat)
      const push = (o, dedupKey) => { const k = dedupKey || o?.id; if (o && o.title && !seen.has(k)) { seen.add(k); out.push(o); } };
      [...pods, ...vids, ...vidsNew, ...rows].forEach((r) => {
        const m = String(r.media_type || "").toUpperCase();
        if (r.audio_url && !/VIDEO/.test(m)) {
          push({ id: r.id, kind: "audio", title: cleanTitle(r.title), source: r.source_name || r.channel_name || "FemWell", audioSrc: r.audio_url, seconds: Number(r.duration_seconds) || 0, mins: minutesOf(r), category: "listen podcast rest", raw: r });
        } else if (m === "VIDEO" && r.video_id && r.is_embeddable !== false) {
          // hook: a real summary where we have one (138), else the channel — never padded
          push({ id: r.id, kind: "video", title: cleanTitle(r.title), source: r.channel_name || r.source_name || "", youtubeId: r.video_id, mins: minutesOf(r), category: "creative watch make" }, `v-${r.video_id}`);
        }
      });
      // fold in the curated, verified-embeddable videos (our whole-life watch lane)
      LIFESTYLE_VIDEOS.forEach((v) => push({ id: v.id, kind: "video", title: cleanTitle(v.title), source: v.channel_name || "", youtubeId: v.video_id, mins: minutesOf(v), category: "creative watch make" }));
      if (alive) { setItems(out); setLoadError(results.some(result => result.status === "rejected" || !Array.isArray(result.value))); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [loadAttempt]);

  const gold = cwOf("gold").petal;
  const byKind = useMemo(() => items.filter((it) => kind === "all" || it.kind === kind), [items, kind]);
  // MEASURED: videos carry NO duration at all (duration_seconds/label are 0/0 on all 919 — that
  // one field genuinely IS YouTube-API-blocked). So the length filter only means something where
  // durations exist (the podcast episodes). Where they don't, we neither apply it nor show it —
  // otherwise picking a length silently hides the entire watch library.
  // Length is a LISTEN-only control: episodes carry real duration_seconds, watches carry none at
  // all. Applying it to "all"/"watch" would silently hide the entire video library, so it only
  // applies — and only renders — on the Listen filter.
  const lengthApplies = kind === "audio" && byKind.some((it) => it.mins > 0);
  const shown = useMemo(() => {
    if (!lengthApplies) return byKind;
    const lt = LENGTHS.find((l) => l.key === length) || LENGTHS[0];
    return byKind.filter((it) => lt.test(it.mins));
  }, [byKind, lengthApplies, length]);

  return (
    <div className={calm ? "fw-calm-media-directory" : undefined} style={{ ...(calm ? {backgroundColor:"#f5f4f1"} : PAPER_BG), minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      {calm && <style>{`.fw-calm-media-directory .fw-calm-media-hero{position:relative;overflow:hidden;min-height:220px;padding:105px 8px 24px;border-bottom:1px solid #b9cabe}.fw-calm-media-directory .fw-calm-media-hero:before{content:"";position:absolute;top:-12px;right:-10px;width:195px;height:175px;background:url('/images/flora-dream/specimen-bluebell-v2.webp') right top/contain no-repeat;opacity:.5;mask-image:linear-gradient(180deg,#000 10%,transparent 100%);pointer-events:none}.fw-calm-media-directory .fw-calm-media-hero>*{position:relative}.fw-calm-media-directory .fw-calm-media-hero h1{font:400 clamp(44px,11vw,58px)/.98 Ephesis,cursive;color:#7a1a12;margin:0 0 12px}.fw-calm-media-directory .fw-calm-media-hero p{font:500 15px/1.4 system-ui;color:#51444e;margin:0;max-width:290px}.fw-calm-media-directory .fw-calm-media-hero small{display:block;font:700 12px/1.3 system-ui;letter-spacing:.13em;text-transform:uppercase;color:#42634c;margin-bottom:10px}.fw-calm-media-directory .fw-wl-filters{flex-wrap:wrap;overflow:visible!important}.fw-calm-media-directory :is(button,a):focus-visible{outline:3px solid #6f8f77;outline-offset:3px}`}</style>}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>
        <button onClick={() => navigate(returnToMain ? "/Lifestyle?section=listen" : calm ? "/CalmLifestyleDemo?section=listen" : "/Lifestyle")} aria-label="Back" className="fw-elite-press"
          style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${calm ? "#e6e3dc" : T.paperDeep}`, background: calm ? "#fff" : T.paperHi, color: calm ? "#51444e" : OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer", marginBottom: 8 }}>
          <ArrowLeft size={18} />
        </button>
        {calm ? <header className="fw-calm-media-hero"><small>Lifestyle / Listen</small><h1>Listen & watch</h1><p>Good company for your ears. Something for your eyes.</p></header> : <FwFloraHero title="Everything to watch & listen" line="Real episodes and short watches, in our own quiet language — no endless feed." colorway="sage" flankL="bluebell" flankR="sunflower" titleColor={OXBLOOD} creature="dragonfly" />}

        {/* tabs */}
        <div style={{ display: "flex", gap: 8, margin: "14px 0 10px" }}>
          {[["media", "Watch & listen"], ["shows", "Shows to follow"]].map(([k, lbl]) => (
            <button key={k} onClick={() => { setTab(k); setVisibleCount(6); }} className="fw-elite-press"
              style={{ flex: 1, padding: "11px", borderRadius: calm ? 999 : 13, cursor: "pointer", fontFamily: calm ? "system-ui" : UI, fontSize: calm ? 14 : 13.5, fontWeight: 800,
                background: tab === k ? (calm ? "#42634c" : OXBLOOD) : calm ? "#fff" : T.paperHi, color: tab === k ? "#fff" : calm ? "#51444e" : T.muted, border: `1px solid ${tab === k ? (calm ? "#42634c" : OXBLOOD) : calm ? "#dedbd5" : T.paperDeep}` }}>
              {lbl}
            </button>
          ))}
        </div>

        {tab === "media" ? (
          <>
            {loadError && <div role="alert" style={{ margin: "10px 0 14px", padding: "12px 14px", border: "1px solid #b9cabe", borderRadius: 18, background: "#fff", color: "#51444e", font: "500 14px/1.4 system-ui" }}>
              Some listens and watches couldn't load. The ones below are available.
              <button type="button" onClick={() => { setLoading(true); setLoadAttempt(n => n + 1); }} style={{ marginLeft: 8, minHeight: 44, border: 0, background: "transparent", color: "#42634c", font: "700 14px system-ui", textDecoration: "underline", cursor: "pointer" }}>Try again</button>
            </div>}
            {/* filters — length (only where durations exist) + kind */}
            {lengthApplies && (
              <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "4px 0 6px", scrollbarWidth: "none" }} className="fw-wl-filters">
                <style>{`.fw-wl-filters::-webkit-scrollbar{display:none}`}</style>
                {LENGTHS.map((l) => <Chip key={l.key} calm={calm} on={length === l.key} accent={gold} onClick={() => {setLength(l.key);setVisibleCount(6);}}>{l.label}</Chip>)}
              </div>
            )}
            <div style={{ display: "flex", gap: 7, padding: "0 0 12px" }}>
              {KINDS.map((k) => <Chip key={k.key} calm={calm} on={kind === k.key} accent={cwOf("sage").petal} onClick={() => {setKind(k.key);setVisibleCount(6);}}>{k.label}</Chip>)}
            </div>
            {loading ? (
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, textAlign: "center", padding: "30px 0" }}>Gathering what's worth your time…</p>
            ) : shown.length === 0 ? (
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, textAlign: "center", padding: "30px 0" }}>{loadError ? "The library couldn't load. Try again." : "Nothing at that length yet — try another filter."}</p>
            ) : (
              <>
                <div style={{ fontFamily: UI, fontSize: calm ? 12 : 11.5, fontWeight: 700, color: calm ? "#51444e" : T.muted, margin: "0 0 10px" }}>{shown.length} to {kind === "audio" ? "hear" : kind === "video" ? "watch" : "watch & hear"}</div>
                <div style={{ display: "grid", gridTemplateColumns: calm ? "1fr" : "1fr 1fr", gap: calm ? 14 : 12 }}>
                  {(calm ? shown.slice(0,visibleCount) : shown).map((it) => <MediaTile key={it.id} item={it} calm={calm} />)}
                </div>
                {calm && shown.length > visibleCount && <button type="button" onClick={()=>setVisibleCount(n=>n+6)} style={{display:"block",width:"100%",minHeight:48,margin:"18px 0",border:"1px solid #b9cabe",borderRadius:999,background:"#fff",color:"#42634c",font:"700 14px system-ui"}}>{`More ${kind === "video" ? "watches" : kind === "audio" ? "listens" : "to hear & watch"} · ${shown.length-visibleCount}`}</button>}
              </>
            )}
          </>
        ) : (
          <>
            <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "6px 0 14px" }}>Shows worth following, opened in the app you already use.</p>
            <div style={{ display: "grid", gridTemplateColumns: calm ? "1fr" : "1fr 1fr", gap: calm ? 14 : 12 }}>
              {(calm ? EXTERNAL_PODCASTS.slice(0,visibleCount) : EXTERNAL_PODCASTS).map((s) => <ShowTile key={s.id} show={s} calm={calm} />)}
            </div>
            {calm && EXTERNAL_PODCASTS.length > visibleCount && <button type="button" onClick={()=>setVisibleCount(n=>n+6)} style={{display:"block",width:"100%",minHeight:48,margin:"18px 0",border:"1px solid #b9cabe",borderRadius:999,background:"#fff",color:"#42634c",font:"700 14px system-ui"}}>{`More shows · ${EXTERNAL_PODCASTS.length-visibleCount}`}</button>}
          </>
        )}
      </div>
    </div>
  );
}

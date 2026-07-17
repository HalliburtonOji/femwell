// ─────────────────────────────────────────────────────────────────────────────
// expandCards.jsx — THE CLIPBOARD'S CARD LANGUAGE (BRAND_IDENTITY §6.7.7).
//
// A collapsed FloraCover <CoverCard> → tap → a full-screen <ExpandDetailCard>
// (big flora cover · Fraunces title · typed blocks · sticky Save + primary action)
// with a scale-fade expand + back/Esc/scrim. ONE expand for every content type, so
// the swipe-through + tap-to-open feel identical everywhere.
//
// THE VARIATION SET (§6.7.7): one `type` per content kind drives the eyebrow, icon,
// colourway, flora scene + the default primary action; typed BLOCKS render only when
// the item carries their data. Consumers (Lifestyle, Library, Programs…) build items
// and the cards do the rest.
//
//   item = {
//     id, type,                       // type ∈ CARD_TYPES (defaults kind/Icon/cw/category/action)
//     title, subtitle, author?, overline?,
//     summary?,                       // §5 a real hook — shown on the COVER + as "In short"
//     meta: [[iconKey, label]…], chips: [str], body: [str],
//     // typed blocks (each optional — presence renders the block):
//     videoSrc?,                      // §1 plays INLINE (FloraCover = the poster). external:true → link out instead
//     audioSrc?,                      // §2 plays INLINE + the flora visualiser
//     external?,                      // true = an off-platform embed (TikTok/YouTube) → never fake-embed, link out
//     gutenbergId? | readingText?,    // §3 books open INTO a paged reading pane (2 taps)
//     onOpenFullReader?,              // §3 the one clear "Open the full reader" option
//     player?, mediaKind?: "audio"|"video", duration?, playerLabel?,  // simulated fallback (demos/no src)
//     excerpt?,                       // an inset pull from the text (story/book)
//     quote?: { text, attrib },       // a big pull-quote (quote/affirmation)
//     reading?: { headline, lines[] },// an almanac/horoscope reading
//     ingredients?: { serves, time, items[] },
//     steps?: [str], stepsLabel?,     // a numbered method (ritual/session/recipe)
//     actions?: [{ label, Icon, primary, onClick }],  // defaults to the type's primary;
//                                     // onClick(item) fires on tap — wire the real deep-link/handler
//     safe?,                          // the anonymity note (content rooms)
//   }
//
// SAVE is CONTROLLED-optional: pass `saved` + `onSave(next, item)` to persist it (e.g. to
// UserProfile + recordLifestyleAction); omit both and it falls back to local state (demos).
//
// CONTENT ONLY. Pointed at people/connection this pattern must run through the DM /
// connection safety rails (consent-gated messaging, anonymity, report/block) — never
// repurpose these cards for people.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from "react";
import { T, SERIF, UI, PAPER_BG, Heart } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { base44 } from "@/api/base44Client";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import ReadingColumn from "@/components/brand/ReadingColumn";
import FloraCover from "@/components/brand/FloraCover";
import { cwOf, Pollinator, floraKeyframes, FlowerGlyph } from "@/components/brand/flora";
import {
  ChevronRight, ChevronLeft, ArrowLeft, Play, Pause, Bookmark, BookmarkCheck, Quote as QuoteIcon,
  BookOpen, Feather, Headphones, Moon, Clock, HeartPulse, Book, Users, Flame,
  MessageCircle, Sparkles, Leaf, Film, UtensilsCrossed, ListChecks, Star, Sun, Wind,
} from "lucide-react";

export const SCRIPT = '"Ephesis","Pinyon Script",cursive';
export const FRAUNCES = '"Fraunces","Cormorant Garamond",Georgia,serif';
export const reduceMotion = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };
export const ICON = {
  BookOpen, Feather, Headphones, Moon, Clock, HeartPulse, Book, Users, Flame,
  MessageCircle, Sparkles, Leaf, Play, ChevronRight, Film, UtensilsCrossed, ListChecks, Star, Sun, Wind, Quote: QuoteIcon,
};

// ── THE VARIATION SET — one entry per content type (§6.7.7) ──────────────────
// kind = the card's eyebrow · Icon = its mark · cw = colourway (carries meaning)
// category = the FloraCover scene segment · primary = the default inline action.
export const CARD_TYPES = {
  article:     { kind: "Read · Essay",        Icon: "BookOpen",        cw: "cream",    category: "essay read longread",     primary: { label: "Read this",    Icon: "BookOpen" } },
  book:        { kind: "Book · Book club",    Icon: "Book",            cw: "gold",     category: "book fiction read",       primary: { label: "Open reader",  Icon: "Book" } },
  audio:       { kind: "Listen · Podcast",    Icon: "Headphones",      cw: "sage",     category: "listen podcast rest",     primary: { label: "Open episode", Icon: "Headphones" } },
  session:     { kind: "Session · Guided",    Icon: "HeartPulse",      cw: "sky",      category: "calm breathe meditation", primary: { label: "Begin",        Icon: "Play" } },
  daily_story: { kind: "Daily Story · Today", Icon: "Feather",         cw: "plum",     category: "story chapter fiction",   primary: { label: "Read today's chapter", Icon: "Feather" } },
  video:       { kind: "Watch · Film",        Icon: "Film",            cw: "gold",     category: "creative watch make",     primary: { label: "Watch",        Icon: "Film" } },
  ritual:      { kind: "Ritual · Practice",   Icon: "Sparkles",        cw: "sage",     category: "ritual practice calm",    primary: { label: "Begin",        Icon: "Play" } },
  quote:       { kind: "A line · To keep",    Icon: "Quote",           cw: "blush",    category: "spirit ritual affirm",    primary: { label: "Set as today's", Icon: "Star" } },
  horoscope:   { kind: "Your sky · Almanac",  Icon: "Moon",            cw: "lavender", category: "astrology moon sky",      primary: { label: "Read your reading", Icon: "Moon" } },
  recipe:      { kind: "Recipe · Tonight",    Icon: "UtensilsCrossed", cw: "coral",    category: "recipe nourish cook",     primary: { label: "Cook this",    Icon: "Flame" } },
};
export const CARD_TYPE_KEYS = Object.keys(CARD_TYPES);

// merge the type's defaults into an item — consumers can pass just the content.
export function resolveCard(item) {
  const t = CARD_TYPES[item?.type] || {};
  return {
    ...t, ...item,
    kind: item.kind || t.kind,
    Icon: item.Icon || t.Icon,
    cw: item.cw || t.cw || "gold",
    category: item.category || t.category,
    meta: item.meta || [],
    chips: item.chips || [],
    body: item.body || [],
    actions: item.actions || (t.primary ? [{ ...t.primary, primary: true }] : []),
  };
}

export const Chip = ({ children, accent }) => (
  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: accent, background: `${accent}14`, border: `1px solid ${accent}44`, borderRadius: 999, padding: "5px 12px" }}>#{children}</span>
);

// a SIMULATED inline player (the reference's "anthem") — audio or video framing
export function InlinePlayer({ label, duration = 300, accent, mediaKind = "audio" }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const raf = useRef(null);
  const last = useRef(0);
  const tick = useCallback((now) => {
    if (!last.current) last.current = now;
    const dt = (now - last.current) / 1000; last.current = now;
    setT((prev) => {
      const next = prev + dt;
      if (next >= duration) { setPlaying(false); return 0; }
      raf.current = requestAnimationFrame(tick);
      return next;
    });
  }, [duration]);
  useEffect(() => {
    if (playing) { last.current = 0; raf.current = requestAnimationFrame(tick); }
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [playing, tick]);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = Math.min(100, (t / duration) * 100);
  const Mark = mediaKind === "video" ? Film : Headphones;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "12px 14px", boxShadow: "inset 0 1px 0 rgba(255,253,247,0.6)" }}>
      <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} style={{ width: 46, height: 46, borderRadius: 999, background: accent, color: "#fff", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: `0 4px 14px ${accent}55` }}>
        {playing ? <Pause size={19} /> : <Play size={19} style={{ marginLeft: 2 }} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Mark size={12} color={T.muted} />
          <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: T.paperDeep, margin: "8px 0 4px", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: accent, borderRadius: 999, transition: "width .15s linear" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 10.5, fontWeight: 600, color: T.muted }}>
          <span>{fmt(t)}</span><span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

// ── typed BLOCKS — render only when the item carries their data ───────────────
const blockHead = (accent) => ({ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: accent, marginBottom: 7 });

function PullQuote({ quote, accent }) {
  return (
    <div style={{ textAlign: "center", padding: "18px 14px", background: `${accent}0F`, border: `1px solid ${accent}33`, borderRadius: 18, marginBottom: 16 }}>
      <QuoteIcon size={20} color={accent} style={{ transform: "scaleX(-1)", opacity: 0.7 }} />
      <p style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 23, lineHeight: 1.3, color: OXBLOOD, margin: "8px 0 6px" }}>{quote.text}</p>
      {quote.attrib && <p style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted, margin: 0 }}>— {quote.attrib}</p>}
    </div>
  );
}
function ReadingBlock({ reading, accent }) {
  return (
    <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`, borderRadius: 16, padding: "14px 15px", marginBottom: 16 }}>
      <div style={blockHead(accent)}>Today's reading</div>
      {reading.headline && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 19, color: OXBLOOD, margin: "0 0 8px", lineHeight: 1.3 }}>{reading.headline}</p>}
      {(reading.lines || []).map((l, i) => <p key={i} style={{ fontFamily: SERIF, fontSize: 15.5, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 8px" }}>{l}</p>)}
    </div>
  );
}
function ExcerptBlock({ excerpt, accent, label = "An excerpt" }) {
  return (
    <div style={{ borderLeft: `2px solid ${accent}`, padding: "2px 0 2px 14px", marginBottom: 16 }}>
      <div style={blockHead(accent)}>{label}</div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}>{excerpt}</p>
    </div>
  );
}
function IngredientsBlock({ ingredients, accent }) {
  return (
    <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "14px 15px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={blockHead(accent)}>Ingredients</span>
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted }}>{[ingredients.serves, ingredients.time].filter(Boolean).join(" · ")}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {(ingredients.items || []).map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, marginTop: 8, flexShrink: 0 }} />
            <span style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.45 }}>{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function StepsBlock({ steps, accent, label = "How it goes" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={blockHead(accent)}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: `${accent}1F`, color: accent, display: "grid", placeItems: "center", flexShrink: 0, fontFamily: UI, fontSize: 12, fontWeight: 800 }}>{i + 1}</span>
            <span style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.5 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── §5 SUMMARY — a card must never look empty. One real, warm sentence of substance.
// Ladder: summary → subtitle → excerpt → first line of body. Never a label, never lorem.
//
// RESEARCHED (16/07/2026): honesty does NOT cost taps — concreteness→clicks is an inverted-U
// (8,977 A/B tests): being too VAGUE lowers clicks, and habitual clickbait cuts trust for
// 54.5% of readers. So write the real thing. And per NN/g's "4 Ss", a summary that merely
// RESTATES THE TITLE is worse than nothing — it's the empty space, with words in it. We guard
// against it here rather than trusting copy discipline.
const normText = (x) => String(x || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
export function restatesTitle(s, title) {
  const a = normText(s), b = normText(title);
  if (!a || !b) return false;
  return a === b || a.startsWith(b) || b.startsWith(a);
}
// The card's hook AT REST. A card with room must not show two lines and a void — so we don't
// take the FIRST candidate (that let a one-line `subtitle` beat a full body), we take the first
// genuinely SUBSTANTIAL one, and fall back to the richest text we actually have.
// Never invents: everything here is the item's own words.
const SUBSTANTIAL = 160; // chars — roughly three lines on a card; below this a card looks starved
export function summaryOf(item) {
  const cands = [item?.summary, item?.excerpt, item?.subtitle, ...(Array.isArray(item?.body) ? item.body : [item?.body])]
    .map((c) => (typeof c === "string" ? c.trim() : ""))
    .filter((s) => s && !restatesTitle(s, item?.title));
  if (!cands.length) return "";
  return cands.find((s) => s.length >= SUBSTANTIAL) || cands.slice().sort((a, b) => b.length - a.length)[0];
}
// The FULL read for the expand — every distinct paragraph the item carries, richest first,
// de-duplicated (the hook is usually also body[0], and repeating it reads like a stutter).
export function paragraphsOf(item) {
  const seen = new Set();
  const out = [];
  const push = (s) => {
    const t = (typeof s === "string" ? s : "").trim();
    if (!t) return;
    const key = t.slice(0, 60).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key); out.push(t);
  };
  (Array.isArray(item?.body) ? item.body : [item?.body]).forEach(push);
  if (!out.length) { push(item?.summary); push(item?.excerpt); push(item?.subtitle); }
  // a blob carrying real paragraph breaks → split it, so the expand reads as prose rather than
  // one lump. (No length threshold: if the author put a paragraph break there, honour it.)
  return out.flatMap((p) => (/\n\s*\n/.test(p) ? p.split(/\n\s*\n+/).map((s) => s.trim()).filter(Boolean) : [p]));
}
function SummaryBlock({ text, accent }) {
  if (!text) return null;
  return (
    <div style={{ background: `${accent}0E`, border: `1px solid ${accent}30`, borderRadius: 16, padding: "13px 15px", marginBottom: 16 }}>
      <div style={blockHead(accent)}>In short</div>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: 0 }}>{text}</p>
    </div>
  );
}

// ── §2 THE FLORA VISUALISER — our living-ecosystem answer to a bar meter. A row of
// stems topped with blooms that SWAY + PULSE while audio plays, each on its own seeded
// phase so it breathes like a meadow, not an equaliser. Pure CSS animation (GPU-cheap,
// zero JS loop) with `animationPlayState` tied to playback; reduced-motion → it rests.
const VIZ_KEYS = `
@keyframes fwVizStem{0%{transform:scaleY(.5)}100%{transform:scaleY(1)}}
@keyframes fwVizBloom{0%{transform:scale(.78) rotate(-7deg)}100%{transform:scale(1.14) rotate(7deg)}}
@media (prefers-reduced-motion:reduce){.fw-viz-stem,.fw-viz-bloom{animation:none!important}}
`;
function MiniBloom({ size = 11, color, accent }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ display: "block", overflow: "visible" }} aria-hidden>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="10" cy="5.6" rx="3.1" ry="4.4" fill={color} opacity="0.92" transform={`rotate(${a} 10 10)`} />
      ))}
      <circle cx="10" cy="10" r="2.4" fill={accent} />
    </svg>
  );
}
// `fading` — the sleep timer's final ramp: the meadow visibly FOLDS CLOSED over the same
// ~20s the volume eases away, so the ending is watched, not suffered.
export function FloraVisualiser({ playing, height = 66, fading = false }) {
  // oxblood · gold · sage · cream — the brand's own palette, not a rainbow
  const STEMS = [
    { h: 0.42, c: T.sage, a: T.gold, d: 1.55, p: -0.2 },
    { h: 0.68, c: T.gold, a: OXBLOOD, d: 1.15, p: -0.9 },
    { h: 0.92, c: OXBLOOD, a: T.gold, d: 1.35, p: -0.45 },
    { h: 0.6, c: T.sage, a: T.gold, d: 1.7, p: -1.3 },
    { h: 0.8, c: T.gold, a: OXBLOOD, d: 1.25, p: -0.6 },
    { h: 0.5, c: T.crimson, a: T.gold, d: 1.45, p: -1.05 },
    { h: 0.72, c: T.sage, a: OXBLOOD, d: 1.6, p: -0.3 },
  ];
  return (
    <div aria-hidden style={{
      display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 9, height, padding: "0 4px",
      transformOrigin: "bottom", transform: fading ? "scaleY(0.45)" : "scaleY(1)", opacity: fading ? 0.4 : 1,
      transition: fading ? "transform 20s linear, opacity 20s linear" : "transform .4s ease, opacity .4s ease",
    }}>
      <style>{VIZ_KEYS}</style>
      {STEMS.map((s, i) => {
        const run = playing ? "running" : "paused";
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <span className="fw-viz-bloom" style={{ lineHeight: 0, transformOrigin: "center bottom", animation: `fwVizBloom ${s.d}s ease-in-out ${s.p}s infinite alternate`, animationPlayState: run }}>
              <MiniBloom size={12} color={s.c} accent={s.a} />
            </span>
            <span className="fw-viz-stem" style={{ width: 2.5, height: Math.round(height * s.h), borderRadius: 999, background: `linear-gradient(180deg, ${s.c}, ${T.sage}66)`, transformOrigin: "bottom", animation: `fwVizStem ${s.d}s ease-in-out ${s.p}s infinite alternate`, animationPlayState: run }} />
          </div>
        );
      })}
    </div>
  );
}

const fmtTime = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

// ── §2 REAL inline AUDIO + the flora visualiser ──────────────────────────────
//
// RESEARCHED (16/07/2026) — the card does NOT own a dead-end <audio>. A great spoken-word
// player wants scrub, ±skip, speed, resume, LOCK-SCREEN controls and background continue…
// and `PodcastPlayerProvider` already has ALL of it (Media Session, sleep timer, speed,
// resume-from-position via PodcastListens) with its MiniPlayer mounted globally in Layout.
// So we ROUTE card audio into the app's real player: tap play here and it keeps playing when
// she navigates or locks the phone, and resumes where she left off. Reuse, don't duplicate.
// (Falls back to a local <audio> when rendered outside the provider — e.g. a standalone demo.)
export function FloraAudio({ src, label, accent, initialDuration = 0, item = {} }) {
  const player = usePodcastPlayer();
  const ref = useRef(null);
  const [localPlaying, setLocalPlaying] = useState(false);
  const [localT, setLocalT] = useState(0);
  const [localDur, setLocalDur] = useState(initialDuration);
  const [err, setErr] = useState(false);

  const isThis = !!player && player.currentEpisode?.id === item.id;
  const playing = player ? (isThis && player.isPlaying) : localPlaying;
  const t = player ? (isThis ? player.position : 0) : localT;
  const dur = player ? (isThis ? (player.duration || initialDuration) : initialDuration) : localDur;

  const toggle = () => {
    if (player) {
      if (isThis) { player.togglePlay(); return; }
      player.play({
        id: item.id, audio_url: src, title: item.title || label,
        source_name: item.sourceName || item.kind || "FemWell",
        image_url: item.imageUrl || undefined,
        duration_seconds: initialDuration || undefined,
      });
      return;
    }
    const a = ref.current; if (!a) return;
    if (a.paused) { a.play().then(() => setLocalPlaying(true)).catch(() => setErr(true)); }
    else { a.pause(); setLocalPlaying(false); }
  };

  const pct = dur > 0 ? Math.min(100, (t / dur) * 100) : 0;
  return (
    <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "12px 14px 10px", boxShadow: "inset 0 1px 0 rgba(255,253,247,0.6)" }}>
      <FloraVisualiser playing={playing} />
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginTop: 6 }}>
        <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} style={{ width: 46, height: 46, borderRadius: 999, background: accent, color: "#fff", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: `0 4px 14px ${accent}55` }}>
          {playing ? <Pause size={19} /> : <Play size={19} style={{ marginLeft: 2 }} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{err ? "This one won't play here — open it instead." : label}</div>
          <div style={{ height: 5, borderRadius: 999, background: T.paperDeep, margin: "8px 0 4px", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: accent, borderRadius: 999, transition: "width .2s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 10.5, fontWeight: 600, color: T.muted }}>
            <span>{fmtTime(t)}</span>
            <span>{player && isThis ? "keeps playing while you browse" : fmtTime(dur)}</span>
          </div>
        </div>
      </div>
      {/* SC 1.2.1 — audio-only wants a TRANSCRIPT (not captions). Also just kind: she may
          want to READ the sleep story instead of hearing it. */}
      {item.transcript && <TranscriptDisclosure text={item.transcript} accent={accent} />}
      {!player && <audio ref={ref} src={src} preload="none"
        onLoadedMetadata={(e) => setLocalDur(e.currentTarget.duration)}
        onTimeUpdate={(e) => setLocalT(e.currentTarget.currentTime)}
        onEnded={() => { setLocalPlaying(false); setLocalT(0); }}
        onError={() => setErr(true)} />}
    </div>
  );
}

// "Read it instead" — the transcript, folded away until she wants it (WCAG SC 1.2.1).
function TranscriptDisclosure({ text, accent }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 10, borderTop: `1px solid ${T.paperDeep}`, paddingTop: 9 }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: accent }}>
        <BookOpen size={13} /> {open ? "Hide the words" : "Read it instead"}
      </button>
      {open && <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.inkSoft, lineHeight: 1.6, margin: "9px 0 2px", maxHeight: 240, overflowY: "auto" }}>{text}</p>}
    </div>
  );
}

// ── §1 REAL inline VIDEO — the FloraCover IS the poster; tap the bloom-play and the
// real <video> takes its place and plays in-card. Never autoplays; reduced-motion safe.
//
// RESEARCHED (16/07/2026):
//  • Tap-to-play is right for editorial (NN/g: users don't want to be surprised by video).
//    iOS defeats muted-autoplay anyway (pauses when non-visible; disabled in Low Power Mode),
//    so poster + play affordance is the ONLY consistent experience. `playsInline` is mandatory
//    or iPhone forces fullscreen.
//  • NATIVE `controls` beat a custom bar: free fullscreen, PiP, AirPlay, OS caption styling,
//    keyboard. (Do NOT build a custom control bar.)
//  • CAPTIONS are a WCAG SC 1.2.2 **Level A** requirement — and for this app they're a primary
//    use case, not an a11y tax (watched in bed, on mute, beside a sleeping partner). A remote
//    .vtt needs `crossOrigin` on the media element or the track is blocked.
//  • DATA: `preload="metadata"` is NOT cheap (browsers can't predict metadata location → a
//    range-fetch per card on her mobile data). We render NO <video> at all until she taps —
//    and then `preload="none"`. The FloraCover poster is generative SVG: zero fetch.
const isRemote = (u) => { try { return new URL(u, window.location.href).origin !== window.location.origin; } catch { return false; } };
export function FloraVideo({ src, item, accent }) {
  const [started, setStarted] = useState(false);
  const [err, setErr] = useState(false);
  if (err) return null;
  if (started) {
    return (
      <video src={src} controls autoPlay playsInline preload="none" loading="lazy" onError={() => setErr(true)}
        crossOrigin={item.captionsSrc && isRemote(item.captionsSrc) ? "anonymous" : undefined}
        style={{ width: "100%", maxHeight: 260, borderRadius: 16, display: "block", background: T.ink, border: `1px solid ${T.paperDeep}` }}>
        {item.captionsSrc && <track default kind="captions" srcLang={item.captionsLang || "en"} label={item.captionsLabel || "English"} src={item.captionsSrc} />}
      </video>
    );
  }
  return (
    <button onClick={() => setStarted(true)} aria-label="Play" className="fw-ce-press" style={{ position: "relative", width: "100%", padding: 0, border: `1px solid ${T.paperDeep}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", display: "block", background: "transparent" }}>
      <FloraCover title={item.title} category={item.category} colorway={item.cw} seed={`${item.id}-poster`} height={180} radius={0} showTitle={false} idx={`vpost-${item.id}`} />
      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(28,20,12,0.16)" }}>
        <span style={{ width: 60, height: 60, borderRadius: 999, background: "rgba(244,239,227,0.94)", border: `1px solid ${accent}`, display: "grid", placeItems: "center", boxShadow: "0 6px 20px rgba(58,44,26,0.28)" }}>
          <Play size={26} color={accent} style={{ marginLeft: 3 }} />
        </span>
      </span>
    </button>
  );
}

// ── REAL inline YOUTUBE — the facade pattern. The library is 284 YouTube rows; sending her
// out to youtube.com was 3+ taps and lost the page. This plays IN the card in 2.
//
// RESEARCHED (17/07/2026):
//  • FACADE, not a cold iframe: a YouTube embed pulls ~1.5MB+ of player JS on mount. Mounting
//    one per card is why the boards loaded slowly. We render NO iframe until she taps — the
//    poster is the generative FloraCover (zero fetch) — then swap in the iframe with autoplay=1
//    so her ONE tap both loads and plays it. This is the lite-embed pattern.
//  • youtube-nocookie.com: no tracking cookie until playback (privacy + her page stays clean).
//  • playsinline=1 or iPhone forces fullscreen; rel=0 keeps suggestions to the same channel.
//  • allow="autoplay" is required for the tap-to-play swap to actually start.
//  • NOT gated on `is_embeddable === true`: that field is undefined on all 284 live rows (the
//    embed-gate never ran over them), and gating on it is exactly why every video link-outs
//    today. We treat unknown as playable and only honour an explicit `false`. YouTube itself
//    degrades gracefully with its own "watch on YouTube" if a video ever refuses to embed.
export function FloraYouTube({ videoId, item, accent }) {
  const [started, setStarted] = useState(false);
  if (started) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
        title={item.title || "Video"} loading="lazy" allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        style={{ width: "100%", aspectRatio: "16 / 9", maxHeight: 260, border: `1px solid ${T.paperDeep}`, borderRadius: 16, display: "block", background: T.ink }}
      />
    );
  }
  return (
    <button onClick={() => setStarted(true)} aria-label={`Play ${item.title || "video"}`} className="fw-ce-press"
      style={{ position: "relative", width: "100%", padding: 0, border: `1px solid ${T.paperDeep}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", display: "block", background: "transparent" }}>
      <FloraCover title={item.title} category={item.category} colorway={item.cw} seed={`${item.id}-poster`} height={180} radius={0} showTitle={false} idx={`ypost-${item.id}`} />
      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(28,20,12,0.16)" }}>
        <span style={{ width: 60, height: 60, borderRadius: 999, background: "rgba(244,239,227,0.94)", border: `1px solid ${accent}`, display: "grid", placeItems: "center", boxShadow: "0 6px 20px rgba(58,44,26,0.28)" }}>
          <Play size={26} color={accent} style={{ marginLeft: 3 }} />
        </span>
      </span>
    </button>
  );
}

// picks the right media for the item: real video file → YouTube (inline facade) → real audio
// → the simulated player (demos/no-src). Only TikTok/Instagram link out — they genuinely
// can't be embedded honestly, so `external` stays a real escape hatch.
function MediaBlock({ item, accent }) {
  if (item.videoSrc && !item.external) return <FloraVideo src={item.videoSrc} item={item} accent={accent} />;
  if (item.youtubeId && !item.external) return <FloraYouTube videoId={item.youtubeId} item={item} accent={accent} />;
  if (item.audioSrc && !item.external) return <FloraAudio src={item.audioSrc} label={item.playerLabel || item.title} accent={accent} initialDuration={item.duration || 0} item={item} />;
  if (item.player) return <InlinePlayer label={item.playerLabel || item.title} duration={item.duration || 300} accent={accent} mediaKind={item.mediaKind || "audio"} />;
  return null;
}

// ── §3 THE READING PANE — books open INTO reading (2 taps, not 3). Paginates the
// opening pages right here; the FULL reader stays one clear button away. Reuses the
// EXISTING `fetchGutenbergBook` function — no new backend.
//
// RESEARCHED (16/07/2026):
//  • PAGINATE FOR FEEL, NOT FOR SCIENCE. A 2025 CHI study (n=100, real phones) found NO
//    significant difference vs scrolling on comprehension, duration or workload — the old
//    "pagination aids comprehension" line is desktop-era. What paginating DOES buy is real
//    but qualitative: "a sense of progression", "less intimidating", "more digestible".
//  • PROGRESS IS PERMISSION, NOT A SCORE. "62%" scores her; "~6 min left" gives her
//    permission to start. The enemy was never comprehension — it's not opening it.
//  • MEASURE INVERTS ON A PHONE. The risk at 390px isn't lines too LONG, it's too SHORT
//    (under ~45 characters). v1 double-framed the text (a card inside the expand) down to
//    ~41 CPL — so the pane is now UN-FRAMED: it reads on the page's own paper, edge to edge.
//  • INDENT XOR SPACE (Butterick) — a book indents its paragraphs and does NOT space them.
const READ_WORDS = 150;
const WPM = 200;   // the reading rate behind "~N min left"
// Pack PARAGRAPHS into pages (never word-slice across them) so the page can be typeset like a
// book: each paragraph indents and does NOT gap. v1 flattened the whitespace, which destroyed
// the paragraph breaks and left one block carrying both an indent AND a margin — indent-AND-
// space, the exact defect the rule forbids. Returns: pages[] of paragraph[].
function paginateText(text, per = READ_WORDS) {
  const paras = String(text || "").replace(/\r/g, "").split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
  const pages = [];
  let cur = [], count = 0;
  for (const p of paras) {
    const w = p.split(" ").length;
    if (count && count + w > per) { pages.push(cur); cur = []; count = 0; }
    cur.push(p); count += w;
  }
  if (cur.length) pages.push(cur);
  return pages;
}
export function ReadingPane({ item, accent, onOpenFull }) {
  const [pages, setPages] = useState(() => (item.readingText ? paginateText(item.readingText) : null));
  const [page, setPage] = useState(0);
  const [state, setState] = useState(item.readingText ? "ready" : (item.gutenbergId ? "loading" : "none"));
  useEffect(() => {
    let alive = true;
    if (pages || !item.gutenbergId) return;
    (async () => {
      try {
        const res = await base44.functions.invoke("fetchGutenbergBook", { gutenberg_id: item.gutenbergId });
        const raw = res?.data?.text || res?.text || "";
        if (!alive) return;
        // strip the Gutenberg header, then keep the opening stretch — this is a taster,
        // the full reader does the real chaptering.
        const start = raw.search(/\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG/i);
        const body = start > -1 ? raw.slice(raw.indexOf("\n", start) + 1) : raw;
        const opening = body.replace(/\r/g, "").trim().slice(0, 14000);
        const p = paginateText(opening);
        if (p.length) { setPages(p); setState("ready"); } else setState("error");
      } catch { if (alive) setState("error"); }
    })();
    return () => { alive = false; };
  }, [item.gutenbergId, pages]);

  const full = onOpenFull && (
    <button onClick={onOpenFull} className="fw-ce-press" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.paperHi, border: `1px solid ${accent}`, color: accent, borderRadius: 12, padding: "10px 14px", fontFamily: UI, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
      <Book size={15} /> Open the full reader
    </button>
  );

  // silent auto-resume — she returns to the page she left, with no ceremony
  const resumeKey = `fw_readpane_${item.id}`;
  useEffect(() => {
    if (state !== "ready" || !pages) return;
    try { const p = parseInt(localStorage.getItem(resumeKey) || "0", 10); if (p > 0 && p < pages.length) setPage(p); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pages]);
  useEffect(() => { try { localStorage.setItem(resumeKey, String(page)); } catch { /* ignore */ } }, [page, resumeKey]);

  if (state === "none") return null;
  // "~N min left" — permission to start, not a score
  const minsLeft = pages ? Math.max(1, Math.round(((pages.length - page) * READ_WORDS) / WPM)) : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={blockHead(accent)}>Start reading</div>
      {/* UN-FRAMED: the text reads on the page's own paper. A card-inside-the-expand starved
          the measure to ~41 CPL — under the ~45 floor. Only a hairline holds the page. */}
      <div style={{ position: "relative", borderTop: `1px solid ${T.paperDeep}`, paddingTop: 14 }}>
        <span aria-hidden style={{ position: "absolute", top: 6, right: -4, opacity: 0.35, lineHeight: 0 }}><FlowerGlyph variant="camellia" size={24} color={accent} idx={`rp-${item.id}`} /></span>
        {state === "loading" && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, margin: "6px 0 10px" }}>Turning to the first page…</p>}
        {state === "error" && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: T.muted, margin: "6px 0 10px" }}>The pages wouldn't come through here — the full reader will have them.</p>}
        {state === "ready" && pages && (
          <>
            {/* §6.7.8 — the shared ReadingColumn owns measure/padding/leading and enforces
                indent-XOR-space via `variant="book"`. It is the SOLE padding owner, so it
                bleeds out of this pane's own padding rather than being framed by it. */}
            <ReadingColumn variant="book" size={17.5} style={{ minHeight: 150, marginBottom: 14, paddingInline: 0 }}>
              {pages[page].map((para, i) => <p key={i} style={{ hyphens: "auto" }}>{para}</p>)}
            </ReadingColumn>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${T.paperDeep}`, paddingTop: 10 }}>
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous page" style={pageBtn(page === 0, accent)}><ChevronLeft size={16} /></button>
              <span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: T.muted }}>~{minsLeft} min left</span>
              <button onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))} disabled={page >= pages.length - 1} aria-label="Next page" style={pageBtn(page >= pages.length - 1, accent)}><ChevronRight size={16} /></button>
            </div>
          </>
        )}
      </div>
      {full && <div style={{ marginTop: 12 }}>{full}</div>}
    </div>
  );
}
const pageBtn = (disabled, accent) => ({ width: 34, height: 34, borderRadius: 999, border: `1px solid ${disabled ? T.paperDeep : accent}`, background: disabled ? "transparent" : T.paper, color: disabled ? T.paperDeep : accent, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 });

// ── COLLAPSED cover card — `compact` = the StackedCard-half variant ───────────
export function CoverCard({ item: raw, onOpen, compact = false }) {
  const item = resolveCard(raw);
  const c = cwOf(item.cw);
  const I = ICON[item.Icon] || Sparkles;
  return (
    <button onClick={onOpen} className="fw-ce-press" style={{ width: "100%", height: "100%", textAlign: "left", padding: 0, border: `1px solid ${T.paperDeep}`, borderRadius: 18, overflow: "hidden", cursor: "pointer", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}12 100%)`, boxShadow: "0 6px 22px rgba(58,44,26,.10), 0 1px 4px rgba(58,44,26,.06)", display: "flex", flexDirection: "column" }}>
      {/* When an item genuinely carries no text to summarise (e.g. an ingested video whose row
          has a title and nothing else), the flora art GROWS to fill the card rather than leaving
          a void under two lines. The art is real content — a blank rectangle isn't. */}
      <FloraCover title={item.title} category={item.category} colorway={item.cw} seed={item.id}
        height={summaryOf(item) ? (compact ? 120 : 158) : (compact ? 172 : 216)}
        roundTop showTitle={false} idx={`cov-${item.id}`} />
      <div style={{ padding: compact ? "10px 13px 12px" : "13px 15px 15px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: c.petal }}><I size={12} /> {item.kind}</div>
        <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: compact ? 18 : 22, lineHeight: 1.12, color: OXBLOOD, margin: "5px 0 3px" }}>{item.title}</div>
        {/* THE HOOK AT REST. Previously clamped to 2 lines, which is exactly why a card with
            plenty of room showed two lines and then a void. It now FILLS the space the card
            actually has (flex + overflow) and shows as many real lines as fit, with a soft fade
            where the text runs past the edge so a truncation reads as "there's more", not a cut. */}
        {(() => {
          const s = summaryOf(item);
          if (!s) return null;
          return (
            <div style={{ position: "relative", flex: "1 1 auto", minHeight: 0, overflow: "hidden", marginTop: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: compact ? 14 : 15, color: T.inkSoft, lineHeight: 1.45 }}>{s}</div>
              <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 20, background: `linear-gradient(180deg, ${T.paperHi}00, ${T.paperHi}E6)` }} />
            </div>
          );
        })()}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto", paddingTop: 9 }}>
          {(compact ? item.meta.slice(0, 1) : item.meta).map(([ic, label]) => { const M = ICON[ic] || Clock; return (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted }}><M size={13} color={c.accent} /> {label}</span>
          ); })}
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3, fontFamily: UI, fontSize: 12, fontWeight: 800, color: c.petal }}>Open <ChevronRight size={15} /></span>
        </div>
      </div>
    </button>
  );
}

// ── EXPANDED full-screen detail card — ONE expand, typed blocks ───────────────
export function ExpandDetailCard({ item: raw, onClose, saved: savedProp, onSave }) {
  const item = resolveCard(raw);
  const [show, setShow] = useState(false);
  // SAVE is controlled when `saved`/`onSave` are supplied (so a page can persist it);
  // otherwise it falls back to local state so demos/standalone use still works.
  const [savedLocal, setSavedLocal] = useState(false);
  const saved = savedProp !== undefined ? savedProp : savedLocal;
  const toggleSave = () => { if (onSave) onSave(!saved, item); else setSavedLocal((s) => !s); };
  const c = cwOf(item.cw);
  const I = ICON[item.Icon] || Sparkles;
  const close = useCallback(() => { setShow(false); setTimeout(onClose, reduceMotion() ? 0 : 280); }, [onClose]);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true));
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(r); window.removeEventListener("keydown", onKey); };
  }, [close]);
  const anim = reduceMotion() ? {} : { opacity: show ? 1 : 0, transform: show ? "scale(1) translateY(0)" : "scale(0.96) translateY(14px)", transition: "opacity .28s ease, transform .32s cubic-bezier(.32,.72,.24,1)" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(28,20,12,0.28)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center" }} onClick={close}>
      <style>{floraKeyframes}{`.fw-ce-press{transition:transform .12s ease}.fw-ce-press:active{transform:scale(0.98)}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ ...PAPER_BG, width: "100%", maxWidth: 460, height: "100%", overflowY: "auto", position: "relative", ...anim }}>
        <div style={{ position: "relative" }}>
          <FloraCover title={item.title} category={item.category} colorway={item.cw} seed={item.id} height={288} radius={0} showTitle={false} animate idx={`xcov-${item.id}`} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 0" }}>
            <button onClick={close} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(244,239,227,0.86)", border: `1px solid ${T.paperDeep}`, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}><ArrowLeft size={19} /></button>
            <button onClick={toggleSave} aria-label="Save" style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(244,239,227,0.86)", border: `1px solid ${saved ? c.petal : T.paperDeep}`, color: saved ? c.petal : T.ink, display: "grid", placeItems: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}>{saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 20px 16px", background: "linear-gradient(180deg, transparent, rgba(236,231,218,0.72) 55%, var(--paper,#ECE7DA))" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: c.petal }}><I size={13} /> {item.kind}</div>
          </div>
        </div>

        <div style={{ maxWidth: 440, margin: "0 auto", padding: "6px 20px 130px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Heart size={15} />
            <span style={{ fontFamily: SCRIPT, fontSize: 30, color: c.accent, lineHeight: 1 }}>{item.overline || "for you"}</span>
          </div>
          <h1 style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 30, lineHeight: 1.1, color: OXBLOOD, margin: "6px 0 6px" }}>{item.title}</h1>
          {item.author && <p style={{ fontFamily: SERIF, fontSize: 15, color: c.accent, margin: "0 0 4px", fontWeight: 600 }}>{item.author}</p>}
          {item.subtitle && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.muted, lineHeight: 1.45, margin: "0 0 16px" }}>{item.subtitle}</p>}

          {/* typed blocks — presence renders the block */}
          {/* §1/§2 media: real inline video (FloraCover poster) · real inline audio + the
              flora visualiser · the simulated player when there's no src (demos). */}
          {(item.videoSrc || item.audioSrc || item.player) && (
            <div style={{ marginBottom: 16 }}><MediaBlock item={item} accent={c.petal} /></div>
          )}
          {/* §3 books open INTO reading — 2 taps, with the full reader one clear button away */}
          {(item.gutenbergId || item.readingText) && (
            <ReadingPane item={item} accent={c.petal} onOpenFull={item.onOpenFullReader} />
          )}
          {/* §5 a summary block, so the page opens with substance instead of air.
              Only when it ADDS something — never an echo of the subtitle above it. */}
          {!item.quote && item.summary && item.summary !== item.subtitle && (
            <SummaryBlock text={item.summary} accent={c.petal} />
          )}
          {item.quote && <PullQuote quote={item.quote} accent={c.petal} />}
          {item.reading && <ReadingBlock reading={item.reading} accent={c.petal} />}
          {item.excerpt && <ExcerptBlock excerpt={item.excerpt} accent={c.petal} label={item.excerptLabel} />}
          {item.ingredients && <IngredientsBlock ingredients={item.ingredients} accent={c.petal} />}
          {item.steps && <StepsBlock steps={item.steps} accent={c.petal} label={item.stepsLabel} />}

          {item.meta.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
              {item.meta.map(([ic, label], i) => { const M = ICON[ic] || Clock; return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderTop: i ? `1px solid ${T.paperDeep}` : "none" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: `${c.petal}1C`, display: "grid", placeItems: "center", flexShrink: 0 }}><M size={15} color={c.petal} /></span>
                  <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{label}</span>
                </div>
              ); })}
              {item.safe && (
                <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderTop: `1px solid ${T.paperDeep}`, background: `${T.sage}10` }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: `${T.sage}22`, display: "grid", placeItems: "center", flexShrink: 0 }}><Heart size={14} /></span>
                  <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.35 }}>Anonymous by default, screened for kindness — a content room, never a place you're put on show.</span>
                </div>
              )}
            </div>
          )}

          {item.chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {item.chips.map((ch) => <Chip key={ch} accent={c.petal}>{ch}</Chip>)}
            </div>
          )}

          {/* §6.7.8 — the expand's body reads through the shared column (spaced paragraphs;
              `card` variant). paddingInline:0 because the expand already owns the gutter. */}
          {(() => {
            // Every real paragraph the item carries — not just `body`. An item whose text lives
            // in summary/excerpt/subtitle used to render NOTHING here; now it reads as prose.
            // De-duped against the summary block above so the page never stutters.
            const shown = (!item.quote && item.summary && item.summary !== item.subtitle) ? item.summary.trim() : null;
            const paras = paragraphsOf(item).filter((p) => p !== shown);
            if (!paras.length) return null;
            return (
              <ReadingColumn variant="card" size={16.5} style={{ paddingInline: 0, marginBottom: 4 }}>
                {paras.map((p, i) => <p key={i}>{p}</p>)}
              </ReadingColumn>
            );
          })()}

          <div style={{ display: "grid", placeItems: "center", margin: "18px 0 0" }}>
            <Pollinator kind="butterfly" size={30} color={c.petal} color2={T.gold} pattern="bands" animate idx={`xcr-${item.id}`} />
          </div>
        </div>

        {/* sticky primary actions */}
        <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, padding: "12px 16px calc(14px + env(safe-area-inset-bottom))", background: "linear-gradient(180deg, transparent, var(--paper,#ECE7DA) 34%)", display: "flex", gap: 10, maxWidth: 460, margin: "0 auto" }}>
          <button onClick={toggleSave} className="fw-ce-press" aria-label="Save" style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 7, background: T.paperHi, border: `1px solid ${saved ? c.petal : T.paperDeep}`, color: saved ? c.petal : T.muted, borderRadius: 14, padding: "13px 15px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{item.actions.length < 2 ? (saved ? " Saved" : " Save") : ""}</button>
          {item.actions.map((a) => { const A = ICON[a.Icon] || ChevronRight; return (
            <button key={a.label} onClick={() => a.onClick?.(item)} className="fw-ce-press" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: a.primary ? c.petal : T.paperHi, color: a.primary ? "#fff" : c.petal, border: a.primary ? "none" : `1px solid ${c.petal}`, borderRadius: 14, padding: "13px 12px", fontFamily: UI, fontSize: 13.5, fontWeight: 800, cursor: "pointer", boxShadow: a.primary ? `0 4px 16px ${c.petal}44` : "none" }}><A size={16} /> {a.label}</button>
          ); })}
        </div>
      </div>
    </div>
  );
}

// ── SAMPLE_CARDS — one worked example per type. Reference content for demos and a
// template for consumers (Lifestyle/Library/Programs) building real items. ──────
export const SAMPLE_CARDS = [
  { id: "v-article", type: "article", title: "The quiet power of leaving early", subtitle: "On protecting your evenings without apology.",
    meta: [["BookOpen", "8 min read"], ["Feather", "The FemWell desk"]], chips: ["boundaries", "slow living"],
    body: ["There's a freedom in being first to leave — coat on while the room is still warm, the night still yours.",
      "It isn't rudeness; it's self-trust. You know what tomorrow-you needs, and you give it to her tonight."] },
  { id: "v-book", type: "book", title: "Hamnet", author: "by Maggie O'Farrell", overline: "Book club",
    subtitle: "Grief, motherhood, and a marriage, in Warwickshire.",
    meta: [["Book", "Chapter 1 open"], ["Users", "A room reading along"]], chips: ["fiction", "grief"],
    excerpt: "He cannot find her. Every room he enters is empty of the person he is looking for.", excerptLabel: "From chapter one",
    body: ["We read a chapter a week and talk about it anonymously — no spoilers past where the room is."],
    actions: [{ label: "Talk about it", Icon: "MessageCircle" }, { label: "Open reader", Icon: "Book", primary: true }] },
  { id: "v-audio", type: "audio", title: "The friendship recession", subtitle: "Why adult friendship got hard — and what actually helps.",
    meta: [["Headphones", "32 min"], ["Users", "Episode 14"]], chips: ["friendship", "connection"],
    player: true, duration: 1920, playerLabel: "Ep. 14 — The friendship recession",
    body: ["We talk to a sociologist about why proximity built our old friendships, and what replaces it at 35."] },
  { id: "v-session", type: "session", title: "A five-minute reset", subtitle: "Voiced, gentle, for a racing mind.",
    meta: [["Clock", "5 min"], ["HeartPulse", "Anytime"]], chips: ["anxiety", "breathe"],
    player: true, duration: 300, playerLabel: "A five-minute reset (voiced)",
    steps: ["Sit however you are. No fixing your posture.", "Breathe in for four, out for six — six times.", "Name one thing you can hear, then one you can feel.", "Come back slowly. That's the whole thing."],
    stepsLabel: "What you'll do",
    body: ["If your mind wanders — and it will — that noticing is the practice, not a failure."] },
  { id: "v-story", type: "daily_story", title: "The lighthouse keeper's good night", subtitle: "Today's chapter — ten minutes to drift off to.",
    meta: [["Feather", "Chapter 6"], ["Moon", "Bedtime"]], chips: ["sleep", "serial"],
    excerpt: "Far out where the sea goes quiet, the keeper trims the last lamp and lets the dark do its slow, kind work.", excerptLabel: "From today's chapter",
    body: ["Let the words blur. You don't have to reach the end — the story keeps your place."] },
  { id: "v-video", type: "video", title: "One-pan, no washing up", subtitle: "Three minutes, start to plate.",
    meta: [["Film", "3 min watch"], ["Flame", "Cook along"]], chips: ["easy dinner", "cook along"],
    player: true, mediaKind: "video", duration: 180, playerLabel: "One-pan, no washing up",
    body: ["Watch it once, then cook it with the pan already hot. That's the whole method."] },
  { id: "v-ritual", type: "ritual", title: "The Sunday reset", subtitle: "Twenty minutes that make Monday kinder.",
    meta: [["Clock", "20 min"], ["Sparkles", "Weekly"]], chips: ["slow sunday", "reset"],
    steps: ["Open a window. Put something on that you like.", "Clear one surface — only one.", "Write down the three things actually due this week.", "Make a drink and stop. Deliberately."],
    body: ["Not a productivity system. A soft landing into the week, on purpose."] },
  { id: "v-quote", type: "quote", title: "A line to keep", subtitle: "Today's, if you want it.",
    meta: [["Star", "Today"], ["Feather", "Saved 2,140 times"]], chips: ["self-worth"],
    quote: { text: "You do not have to be useful to be worth keeping.", attrib: "The FemWell desk" },
    body: ["Pin it to today, or let it go. Either is allowed."],
    actions: [{ label: "Set as today's", Icon: "Star", primary: true }] },
  { id: "v-horoscope", type: "horoscope", title: "The moon is waning", subtitle: "Your sky, read against where you are.",
    meta: [["Moon", "Waning gibbous"], ["Sparkles", "Luteal week"]], chips: ["almanac", "your sky"],
    reading: { headline: "A week for finishing, not starting.", lines: ["The moon is letting go of light, and your body is turning inward at the same time — that's not a coincidence you have to believe in to use.",
      "They say a waning moon is for endings: the email you've drafted four times, the thing you've outgrown. Send it, or let it go."] },
    body: ["Hope-only, always. Nothing here predicts harm — it's folklore, held lightly, with a kettle on."] },
  { id: "v-recipe", type: "recipe", title: "One-pan harissa butter beans", subtitle: "Fifteen minutes, one pan, kind to a tired Tuesday.",
    meta: [["Clock", "15 min"], ["Flame", "One pan"]], chips: ["easy dinner", "iron-rich"],
    ingredients: { serves: "Serves 2", time: "15 min", items: ["1 onion, sliced thin", "2 tbsp rose harissa", "A big knob of butter", "2 tins butter beans, drained", "A lemon, and whatever green is wilting"] },
    steps: ["Soften the onion in the butter, slowly, until sweet.", "Spoon in the harissa; let it sizzle for a minute.", "Tip in the beans with a splash of their water; let them get jammy.", "Lemon, the green thing, bread. Done."],
    stepsLabel: "Method",
    body: ["Double it and tomorrow's lunch is already handled."] },
];

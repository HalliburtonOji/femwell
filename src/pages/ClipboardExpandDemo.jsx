// ─────────────────────────────────────────────────────────────────────────────
// ClipboardExpandDemo.jsx — "browse cards → tap → a big rich detail card" (Breeze-
// inspired), adapted FULLY to the FemWell brand for CONTENT (not people). A
// ClipboardSlider carousel of FloraCover content cards (edge-peek + pager dots) →
// tap a card → it expands into a full-screen detail card (big flora cover · Fraunces
// title · an INLINE player · warm detail rows · topic chips · sticky primary actions)
// with a smooth scale-fade expand + back-to-collapse. No dating vibe, no photos, no
// people-swiping — this pattern lives on CONTENT (reads/listens/sessions/books/
// recipes/circles/discover). If ever pointed at people, it must run through the DM/
// connection safety rails (see the brainstorm doc). Preview route; nothing live touched.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from "react";
import { T, SERIF, UI, PAPER_BG, Heart } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { ClipboardSlider } from "@/components/brand/ClipboardSlider";
import FloraCover from "@/components/brand/FloraCover";
import { cwOf, Pollinator, floraKeyframes } from "@/components/brand/flora";
import {
  ChevronLeft, ChevronRight, ArrowLeft, X, Play, Pause, Bookmark, BookmarkCheck,
  BookOpen, Feather, Headphones, Moon, Clock, HeartPulse, Book, Users, Flame,
  MessageCircle, Sparkles, Leaf,
} from "lucide-react";

const SCRIPT = '"Ephesis","Pinyon Script",cursive';
const FRAUNCES = '"Fraunces","Cormorant Garamond",Georgia,serif';
const reduce = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

// ── the CONTENT (warm, on-brand, content-only — never people) ────────────────
const ICON = { BookOpen, Feather, Headphones, Moon, Clock, HeartPulse, Book, Users, Flame, MessageCircle, Sparkles, Leaf };
const CONTENT = [
  {
    id: "essay-leave-early", kind: "Read · Essay", Icon: "BookOpen", category: "essay slow read", cw: "cream",
    title: "The quiet power of leaving early", subtitle: "On protecting your evenings without apology.",
    meta: [["BookOpen", "8 min read"], ["Feather", "The FemWell desk"]],
    chips: ["boundaries", "slow living", "self-worth"],
    body: ["There is a particular freedom in being the first to leave — coat on while the room is still warm, the night still yours to spend as you like.",
      "It isn't rudeness; it's a kind of self-trust. You know what tomorrow-you needs, and you're willing to give it to her tonight."],
    actions: [{ label: "Read this", Icon: "BookOpen", primary: true }],
  },
  {
    id: "sleep-lighthouse", kind: "Listen · Sleep story", Icon: "Moon", category: "story sleep rest", cw: "plum",
    title: "The lighthouse keeper's good night", subtitle: "A ten-minute story to drift off to.",
    meta: [["Headphones", "10 min"], ["Moon", "Bedtime"]],
    chips: ["sleep", "calm", "wind-down"], player: true, duration: 600,
    body: ["Far out where the sea goes quiet, a keeper trims the last lamp and lets the dark do its slow, kind work.",
      "Let the words blur. You don't have to reach the end — the story keeps your place."],
    actions: [{ label: "Play the story", Icon: "Play", primary: true }],
  },
  {
    id: "reset-breath", kind: "Session · Guided", Icon: "HeartPulse", category: "calm mind breathe meditation", cw: "sky",
    title: "A five-minute reset for a racing mind", subtitle: "Follow the breath; let the day settle.",
    meta: [["Clock", "5 min"], ["HeartPulse", "Anytime"]],
    chips: ["anxiety", "reset", "breathe"], player: true, duration: 300,
    body: ["No app-face, no counting streaks. Just five minutes of following one breath, and then the next.",
      "If your mind wanders — and it will — that noticing is the practice, not a failure."],
    actions: [{ label: "Begin", Icon: "Play", primary: true }],
  },
  {
    id: "book-hamnet", kind: "Book club · This month", Icon: "Book", category: "book read fiction", cw: "gold",
    title: "This month we're reading: Hamnet", subtitle: "Grief, motherhood, and a marriage — Maggie O'Farrell.",
    meta: [["Book", "Chapter 1 open"], ["Users", "A room reading along"]],
    chips: ["book club", "fiction", "together"],
    body: ["A boy falls ill in a house in Warwickshire, and a mother reads the plague in his skin before anyone will say the word.",
      "We read a chapter a week, and talk about it anonymously — no spoilers past where the room is."],
    actions: [{ label: "Open the reader", Icon: "Book", primary: true }],
  },
  {
    id: "recipe-butterbeans", kind: "Recipe · Tonight", Icon: "Flame", category: "recipe nourish cook", cw: "coral",
    title: "One-pan harissa butter beans", subtitle: "Fifteen minutes, one pan, deeply kind to a tired Tuesday.",
    meta: [["Clock", "15 min"], ["Flame", "One pan"]],
    chips: ["easy dinner", "iron-rich", "batch-friendly"],
    body: ["Soften an onion, spoon in harissa and a knob of butter, tip in two tins of butter beans and let them get jammy.",
      "Finish with lemon and whatever green is wilting in the drawer. Bread, obviously."],
    actions: [{ label: "Cook this", Icon: "Flame", primary: true }],
  },
  {
    id: "circle-slow-sunday", kind: "Circle · Content room", Icon: "Users", category: "community circle belong", cw: "blush",
    title: "The Sunday Slow Club", subtitle: "A gentle room for unhurried weekends — a prompt, a photo, a cup of something.",
    meta: [["MessageCircle", "This week's prompt"], ["Users", "Anonymous · safe"]],
    chips: ["community", "slow sunday", "cosy"],
    body: ["Not a chat to keep up with — a slow room you dip into. This week's prompt: the smallest thing that made your weekend feel like yours.",
      "Anonymous by default, screened for kindness. You're never on show."],
    actions: [{ label: "Peek inside", Icon: "MessageCircle", primary: true }],
    safe: true,
  },
  {
    id: "discover-petrichor", kind: "Discover · Today", Icon: "Sparkles", category: "wonder nature garden", cw: "sage",
    title: "Today's small wonder: petrichor", subtitle: "That after-rain smell has a name — and a reason you love it.",
    meta: [["Sparkles", "1 min"], ["Leaf", "A little joy"]],
    chips: ["small joys", "did you know"],
    body: ["Petrichor: the earthy scent when rain meets dry ground. It's partly an oil plants release, partly a bacterium called geosmin your nose can catch at a few parts per trillion.",
      "Which is to say: you are, biologically, very good at loving the smell of rain."],
    actions: [{ label: "Read it", Icon: "Sparkles", primary: true }],
  },
];

// ── a SIMULATED inline player (the reference's "anthem") — play/pause + progress ──
function InlinePlayer({ label, duration = 300, accent }) {
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
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "12px 14px", boxShadow: "inset 0 1px 0 rgba(255,253,247,0.6)" }}>
      <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} style={{ width: 46, height: 46, borderRadius: 999, background: accent, color: "#fff", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: `0 4px 14px ${accent}55` }}>
        {playing ? <Pause size={19} /> : <Play size={19} style={{ marginLeft: 2 }} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
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

const Chip = ({ children, accent }) => (
  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: accent, background: `${accent}14`, border: `1px solid ${accent}44`, borderRadius: 999, padding: "5px 12px" }}>#{children}</span>
);

// ── COLLAPSED card (in the carousel) — cover + title + meta + "tap to open" ──────
function CollapsedCard({ item, onOpen }) {
  const c = cwOf(item.cw);
  const I = ICON[item.Icon] || Sparkles;
  return (
    <button onClick={onOpen} className="fw-ce-press" style={{ width: "100%", textAlign: "left", padding: 0, border: `1px solid ${T.paperDeep}`, borderRadius: 20, overflow: "hidden", cursor: "pointer", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}12 100%)`, boxShadow: "0 6px 22px rgba(58,44,26,.10), 0 1px 4px rgba(58,44,26,.06)", display: "flex", flexDirection: "column" }}>
      <FloraCover title={item.title} category={item.category} colorway={item.cw} seed={item.id} height={158} roundTop showTitle={false} idx={`cov-${item.id}`} />
      <div style={{ padding: "13px 15px 15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: c.petal }}><I size={13} /> {item.kind}</div>
        <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 22, lineHeight: 1.12, color: OXBLOOD, margin: "6px 0 4px" }}>{item.title}</div>
        <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.4 }}>{item.subtitle}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 11 }}>
          {item.meta.map(([ic, label]) => { const M = ICON[ic] || Clock; return (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted }}><M size={13} color={c.accent} /> {label}</span>
          ); })}
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3, fontFamily: UI, fontSize: 12, fontWeight: 800, color: c.petal }}>Open <ChevronRight size={15} /></span>
        </div>
      </div>
    </button>
  );
}

// ── EXPANDED full-screen detail card (the Breeze "big card") ─────────────────────
function ExpandedCard({ item, onClose }) {
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const c = cwOf(item.cw);
  const I = ICON[item.Icon] || Sparkles;
  useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true));
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(r); window.removeEventListener("keydown", onKey); };
  }, []);
  const close = () => { setShow(false); setTimeout(onClose, reduce() ? 0 : 280); };
  const anim = reduce() ? {} : { opacity: show ? 1 : 0, transform: show ? "scale(1) translateY(0)" : "scale(0.96) translateY(14px)", transition: "opacity .28s ease, transform .32s cubic-bezier(.32,.72,.24,1)" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(28,20,12,0.28)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center" }} onClick={close}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...PAPER_BG, width: "100%", maxWidth: 460, height: "100%", overflowY: "auto", position: "relative", ...anim }}>
        {/* big cover */}
        <div style={{ position: "relative" }}>
          <FloraCover title={item.title} category={item.category} colorway={item.cw} seed={item.id} height={288} radius={0} showTitle={false} animate idx={`xcov-${item.id}`} />
          {/* top bar over the cover */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 0" }}>
            <button onClick={close} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(244,239,227,0.86)", border: `1px solid ${T.paperDeep}`, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}><ArrowLeft size={19} /></button>
            <button onClick={() => setSaved((s) => !s)} aria-label="Save" style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(244,239,227,0.86)", border: `1px solid ${saved ? c.petal : T.paperDeep}`, color: saved ? c.petal : T.ink, display: "grid", placeItems: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}>{saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button>
          </div>
          {/* title plate riding the cover bottom */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 20px 16px", background: "linear-gradient(180deg, transparent, rgba(236,231,218,0.72) 55%, var(--paper,#ECE7DA))" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: c.petal }}><I size={13} /> {item.kind}</div>
          </div>
        </div>

        <div style={{ maxWidth: 440, margin: "0 auto", padding: "6px 20px 130px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Heart size={15} />
            <span style={{ fontFamily: SCRIPT, fontSize: 30, color: c.accent, lineHeight: 1 }}>for you</span>
          </div>
          <h1 style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 30, lineHeight: 1.1, color: OXBLOOD, margin: "6px 0 6px" }}>{item.title}</h1>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.muted, lineHeight: 1.45, margin: "0 0 16px" }}>{item.subtitle}</p>

          {/* the INLINE player (audio/story/session) — the reference's anthem */}
          {item.player && <div style={{ marginBottom: 16 }}><InlinePlayer label={item.title} duration={item.duration} accent={c.petal} /></div>}

          {/* warm detail rows */}
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

          {/* topic / interest chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {item.chips.map((ch) => <Chip key={ch} accent={c.petal}>{ch}</Chip>)}
          </div>

          {/* rich body */}
          {item.body.map((p, i) => (
            <p key={i} style={{ fontFamily: SERIF, fontSize: 16.5, color: T.ink, lineHeight: 1.62, margin: "0 0 13px" }}>{p}</p>
          ))}

          <div style={{ display: "grid", placeItems: "center", margin: "18px 0 0" }}>
            <Pollinator kind="butterfly" size={30} color={c.petal} color2={T.gold} pattern="bands" animate idx={`xcr-${item.id}`} />
          </div>
        </div>

        {/* sticky primary actions */}
        <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, padding: "12px 16px calc(14px + env(safe-area-inset-bottom))", background: "linear-gradient(180deg, transparent, var(--paper,#ECE7DA) 34%)", display: "flex", gap: 10, maxWidth: 460, margin: "0 auto" }}>
          <button onClick={() => setSaved((s) => !s)} className="fw-ce-press" style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 7, background: T.paperHi, border: `1px solid ${saved ? c.petal : T.paperDeep}`, color: saved ? c.petal : T.muted, borderRadius: 14, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />} {saved ? "Saved" : "Save"}</button>
          {item.actions.map((a) => { const A = ICON[a.Icon] || ChevronRight; return (
            <button key={a.label} className="fw-ce-press" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: a.primary ? c.petal : T.paperHi, color: a.primary ? "#fff" : c.petal, border: a.primary ? "none" : `1px solid ${c.petal}`, borderRadius: 14, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: a.primary ? `0 4px 16px ${c.petal}44` : "none" }}><A size={17} /> {a.label}</button>
          ); })}
        </div>
      </div>
    </div>
  );
}

export default function ClipboardExpandDemo() {
  const [openId, setOpenId] = useState(null);
  const item = CONTENT.find((x) => x.id === openId);
  useEffect(() => { document.body.style.overflow = openId ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [openId]);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 60 }}>
      <style>{floraKeyframes}{`.fw-ce-press{transition:transform .12s ease}.fw-ce-press:active{transform:scale(0.98)}`}</style>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "16px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/Ideas" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.muted, textDecoration: "none" }}><ChevronLeft size={15} /> Ideas</a>
        <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: T.gold }}>Founder demo · Card interaction</span>
      </div>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "8px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Heart size={15} />
          <span style={{ fontFamily: SCRIPT, fontSize: 40, color: OXBLOOD, lineHeight: 1 }}>Discover</span>
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: T.muted, lineHeight: 1.5, margin: "6px 0 4px", maxWidth: 340 }}>
          Slide the cards, tap one — it opens into a whole page. A browse-then-dive pattern for FemWell content: reads, listens, sessions, books, recipes, rooms.
        </p>
      </div>

      {/* the CAROUSEL — ClipboardSlider gives edge-peek + pager dots + snap */}
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "4px 14px 0" }}>
        <ClipboardSlider hint="Slide to browse" accent={T.gold}>
          {CONTENT.map((it) => (
            <CollapsedCard key={it.id} item={it} onOpen={() => setOpenId(it.id)} />
          ))}
        </ClipboardSlider>
      </div>

      <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "18px auto 0", maxWidth: 300, lineHeight: 1.5 }}>
        Content only — for people & connection, this same pattern runs through the DM safety rails.
      </p>

      {item && <ExpandedCard item={item} onClose={() => setOpenId(null)} />}
    </div>
  );
}

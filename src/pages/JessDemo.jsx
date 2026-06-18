// JessDemo — "Your smart friend, on call" — a redesign DEMO that gives Jess (normally a FAB/overlay)
// a full-screen home, adapting the TODAY / JOURNAL / COMMUNITY bar. PREVIEW route only (/JessDemo, via
// IDEAS → Previews). The LIVE Jess overlay is UNTOUCHED. Conforms to BRAND_IDENTITY.md (Jess flora
// character = the blush→gold→sage sigil halo; warm "smart-friend" voice, NOT a clinician).
//
// WHOLE-LIFE RULE: Jess is not a symptom bot. Her starter prompts deliberately span life — dating,
// friendship, career, fashion, fun, money — with cycle/health as ONE room among many.
//
// THE SHAPE: 1) HERO — a bloom in a blush→gold→sage halo (the sigil) + carved heart + Ephesis "Jess" +
// her warm one-liner. 2) SUMMARY — "Today, from Jess": a gentle phase-aware brief + quick rows.
// 3) PER-SECTION CardStack — ask anything (inline compose → /Assistant) · starter prompts (life-spanning
// chips → /Assistant) · today's brief · what I've noticed · for you · just talk — SPECIFIC deep-links to
// the real Jess page (/Assistant) and surfaces. 4) Central Jump-to.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import {
  RichBloomV2, floraKeyframes, CardCorner, VineMotifV2, FlowerGlyph,
} from "@/components/brand/flora";
import {
  Sparkles, MessageCircle, Send, Heart as HeartIcon, TrendingUp, Compass, ChevronRight, ChevronLeft,
  Grid2x2, X, Wand2, Coffee, Smile,
} from "lucide-react";

const COL = 430;
const CARD_W = 365;
const GAP = 14;

const withTimeout = (p, ms = 7000) => Promise.race([
  Promise.resolve(p).catch(() => null),
  new Promise((res) => setTimeout(() => res(null), ms)),
]);
const CLAMP = (n) => ({ minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" });

const ICON_DISC = (Icon, accent) => (
  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={16} strokeWidth={1.7} color={accent} />
  </span>
);
function Frame4({ variant = "sprig", color, opacity = 0.6, size = 46 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant={variant} color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

// life-spanning starter prompts (NOT just symptoms) — the whole-life rule.
const PROMPTS = [
  { label: "Help me plan a date-night outfit", Icon: Wand2 },
  { label: "I'm nervous about a work presentation", Icon: Compass },
  { label: "A friend's upset with me — what do I say?", Icon: MessageCircle },
  { label: "Distract me — tell me something fun", Icon: Smile },
  { label: "Why am I so tired this week?", Icon: Sparkles },
  { label: "Make my weekend feel less ordinary", Icon: Coffee },
];

// ════════════════════════════════════════════════════════════════════════════════════════════════
export default function JessDemo() {
  useEditorialFonts();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me());
      const id = me?.id || null;
      if (id) { const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: id })); if (alive) setProfile((profs || []).filter(Boolean)[0] || null); }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const phaseWord = PHASE_LABEL[cycle.phase] ? PHASE_LABEL[cycle.phase].toLowerCase() : "";

  const BRIEF = {
    menstrual: "You're in your inner winter — lower energy is the plan, not a problem. Want me to make today gentler?",
    follicular: "Energy's climbing. Good week to start the thing you've been circling — shall we sketch it out?",
    ovulatory: "You're at your most outward. If there's a message to send or a date to make, today's the day.",
    luteal: "Things turn inward and the fuse gets short — totally normal. Want help protecting your evening?",
  };
  const brief = hasCycle ? (BRIEF[cycle.phase] || "I've got a read on your week whenever you want it.") : "Tell me where you are in your cycle and I'll tune everything to you — but I'm here for all of it, not just that.";

  const CARDS = [
    {
      key: "ask", section: "Ask", accent: T.gold, Icon: MessageCircle, flower: "sunflower",
      tag: "Ask me anything", hook: "What's on your mind?",
      line: "Cramps or careers, a tricky text or a tired Tuesday — I'm a smart friend, not a clinic. Start anywhere.",
      action: { type: "ask", Icon: Send, label: "Ask Jess", placeholder: "Type anything…" },
      open: { href: "/Assistant", label: "Open the full chat" },
    },
    {
      key: "prompts", section: "Starters", accent: T.blush, Icon: Sparkles, flower: "rose",
      tag: "Not sure where to start?", hook: "Try one of these",
      line: "A few ways in — for the whole of your life, not just your body.",
      action: { type: "prompts" },
      open: { href: "/Assistant", label: "Open the full chat" },
    },
    {
      key: "brief", section: "Today's brief", accent: T.sage, Icon: Coffee, flower: "primrose",
      tag: hasCycle ? `Your ${phaseWord} day` : "Today, from me",
      hook: "A gentle read on today",
      line: brief,
      action: { type: "deeplink", Icon: Coffee, label: "Talk it through", href: "/Assistant" },
      open: { href: "/Today", label: "Open Today" },
    },
    {
      key: "noticed", section: "Noticed", accent: "#8E6E8E", Icon: TrendingUp, flower: "iris",
      tag: "What I've noticed", hook: "Patterns you might've missed",
      line: "The quiet trends across your weeks — energy dips, what lifts your mood, when you sleep best. No scores, just gentle observations.",
      action: { type: "deeplink", Icon: TrendingUp, label: "Show me", href: "/Pulse" },
      open: { href: "/Pulse", label: "Open Pulse" },
    },
    {
      key: "foryou", section: "For you", accent: T.gold, Icon: Compass, flower: "violet",
      tag: "Picked for you", hook: "Something good for today",
      line: "A read, a listen, a recipe or a story I think you'll like — tuned to your week and your mood, refreshed daily.",
      action: { type: "deeplink", Icon: Compass, label: "See today's picks", href: "/Lifestyle" },
      open: { href: "/Lifestyle", label: "Open Lifestyle" },
    },
    {
      key: "talk", section: "Just talk", accent: T.crimson, Icon: HeartIcon, flower: "cornflower",
      tag: "When you just need to vent", hook: "I'm here for the messy bits too",
      line: "No fixing, no advice unless you want it — sometimes you just need to say it out loud to someone who won't flinch.",
      action: { type: "deeplink", Icon: HeartIcon, label: "Talk to me", href: "/Assistant" },
      open: { href: "/Community", label: "Or the community" },
    },
  ];

  const trackRef = useRef(null);
  const sliderTopRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const lastI = CARDS.length - 1;
  useEffect(() => {
    const el = trackRef.current; if (!el) return; let t;
    const onScroll = () => { clearTimeout(t); t = setTimeout(() => { const i = Math.round(el.scrollLeft / (CARD_W + GAP)); setIdx(Math.max(0, Math.min(lastI, i))); }, 80); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [lastI, loading]);
  const goTo = (i) => { const j = Math.max(0, Math.min(lastI, i)); setIdx(j); trackRef.current?.scrollTo({ left: j * (CARD_W + GAP), behavior: "smooth" }); };
  const jumpTo = (i) => { setJumpOpen(false); sliderTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(() => goTo(i), 280); };

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <InkFilter />
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{`@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.js-track{scrollbar-width:none}.js-track::-webkit-scrollbar{display:none}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-fade{animation:none!important}}${floraKeyframes}`}</style>

      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 150, right: -26 }}><VineMotifV2 color={T.gold} color2={T.blush} opacity={0.1} w={150} /></div>
        <div style={{ position: "absolute", top: 820, left: -28 }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.08} w={140} flip /></div>
      </div>

      <button onClick={() => setJumpOpen(true)} aria-label="Jump to a section" style={{
        position: "fixed", top: "calc(10px + env(safe-area-inset-top))", left: 12, zIndex: 45,
        display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(244,239,227,0.92)", backdropFilter: "blur(6px)",
        border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "8px 13px", cursor: "pointer",
        fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.muted,
        boxShadow: "0 2px 10px rgba(58,44,26,0.12)",
      }}><Grid2x2 size={14} /> Jump to</button>

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* HERO — the Jess sigil halo */}
        <header style={{ padding: "26px 18px 6px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Sparkles size={13} color={T.muted} />
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>Your companion guide</span>
          </div>
          <div style={{ position: "relative", display: "flex", justifyContent: "center", margin: "2px 0 2px" }}>
            <div style={{ position: "relative", width: 196, height: 196, display: "grid", placeItems: "center" }}>
              {/* the blush→gold→sage sigil halo */}
              <div aria-hidden style={{ position: "absolute", inset: 12, borderRadius: "50%", background: "conic-gradient(from 210deg, #E8B4B8, #D4AF37, #8FAF8F, #E8B4B8)", opacity: 0.22, filter: "blur(2px)" }} />
              <svg viewBox="0 0 200 200" width={196} height={196} aria-hidden style={{ position: "absolute", inset: 0 }}>
                <circle cx="100" cy="100" r="84" fill="none" stroke={T.gold} strokeWidth="2" strokeDasharray="1 7" opacity="0.6" />
              </svg>
              <RichBloomV2 form="peony" color="#D4AF37" color2="#F0DDA0" accent="#8E6E8E" size={126} animate soft idx="js-hero" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 2 }}>
            <Heart size={17} />
            <Script size={48} color={T.ink}>Jess</Script>
          </div>
          <Hand size={16} color={T.muted} style={{ display: "block", marginTop: 11, lineHeight: 1.5 }}>
            Your smart friend who happens to know your cycle — here for the date-night nerves and the 3am worries, not just the symptoms.
          </Hand>
          <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>A wellness companion · not medical advice · your conversations are private</p>
        </header>

        {/* SUMMARY */}
        <div style={{ padding: "10px 18px 4px" }}>
          <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.gold}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)" }}>
            <Frame4 variant="sprig" color={T.gold} size={42} opacity={0.5} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                {ICON_DISC(Coffee, T.gold)}
                <Eyebrow color={T.gold}>Today, from Jess</Eyebrow>
                <span style={{ marginLeft: "auto" }}><FlowerGlyph variant="sunflower" size={30} color={T.gold} idx="jssum-mb" /></span>
              </div>
              <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...CLAMP(5) }}>“{brief}”</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <SummaryChip Icon={MessageCircle} label="Ask anything" onClick={() => jumpTo(0)} accent={T.gold} />
                <SummaryChip Icon={Sparkles} label="Starter prompts" onClick={() => jumpTo(1)} accent={T.blush} />
                <SummaryChip Icon={HeartIcon} label="Just talk" onClick={() => jumpTo(5)} accent={T.crimson} />
              </div>
            </div>
          </div>
        </div>

        {/* segmented rail */}
        <div ref={sliderTopRef} className="js-track" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "16px 18px 12px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c, i) => (
            <button key={c.key} onClick={() => goTo(i)} style={{
              flex: "none", background: i === idx ? c.accent : "transparent", color: i === idx ? T.paper : T.muted,
              border: `1px solid ${i === idx ? c.accent : T.paperDeep}`, borderRadius: 999, padding: "6px 13px",
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}><c.Icon size={13} /> {c.section}</button>
          ))}
        </div>

        {/* slider */}
        <div ref={trackRef} className="js-track" style={{ display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px 4px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c) => (
            <JessCard key={c.key} card={c} />
          ))}
          <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 36)}px` }} aria-hidden />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 18px 0" }}>
          <button onClick={() => goTo(idx - 1)} disabled={idx === 0} aria-label="Previous" style={navBtn(idx === 0)}><ChevronLeft size={18} /></button>
          <div style={{ display: "flex", gap: 7 }}>
            {CARDS.map((c, i) => (
              <button key={c.key} onClick={() => goTo(i)} aria-label={c.section} style={{
                width: i === idx ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
                background: i === idx ? c.accent : T.paperDeep, cursor: "pointer", transition: "width .2s",
              }} />
            ))}
          </div>
          <button onClick={() => goTo(idx + 1)} disabled={idx === lastI} aria-label="Next" style={navBtn(idx === lastI)}><ChevronRight size={18} /></button>
        </div>
      </div>

      {jumpOpen && (
        <div role="dialog" aria-modal="true" aria-label="Jump to a section" className="fw-scrim-anim" onClick={(e) => { if (e.target === e.currentTarget) setJumpOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(11,8,5,0.42)", animation: "fwScrimIn .22s ease both" }}>
          <div onClick={(e) => e.stopPropagation()} className="fw-sheet-anim" style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "20px 20px 0 0", padding: "18px 18px calc(96px + env(safe-area-inset-bottom))", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", animation: "fwSheetIn .3s cubic-bezier(.32,.72,.24,1) both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.muted }}>Jump to</span>
              <button onClick={() => setJumpOpen(false)} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "inline-flex" }}><X size={18} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {CARDS.map((c, i) => (
                <button key={c.key} onClick={() => jumpTo(i)} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c.accent}`, borderRadius: 13, padding: "11px 12px", cursor: "pointer" }}>
                  {ICON_DISC(c.Icon, c.accent)}
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, ...CLAMP(1) }}>{c.section}</span>
                    <span style={{ display: "block", fontFamily: UI, fontSize: 13, color: T.muted, ...CLAMP(1) }}>{c.tag}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryChip({ Icon, label, onClick, accent }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 999, padding: "7px 13px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft, cursor: "pointer" }}>
      <Icon size={14} color={accent} /> {label}
    </button>
  );
}

function JessCard({ card }) {
  const a = card.accent;
  return (
    <section style={{
      scrollSnapAlign: "center", flex: `0 0 ${CARD_W}px`, width: CARD_W, position: "relative", overflow: "hidden",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${a}14 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${a}`, borderRadius: 20,
      padding: 20, display: "flex", flexDirection: "column", minHeight: 430,
      boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
    }}>
      <Frame4 variant="sprig" color={a} size={46} opacity={0.6} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          {ICON_DISC(card.Icon, a)}
          <Eyebrow color={a}>{card.tag}</Eyebrow>
          <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={card.flower || "sunflower"} size={30} color={a} idx={`mb-${card.key}`} /></span>
        </div>
        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 8px", lineHeight: 1.3, ...CLAMP(3) }}>{card.hook}</h3>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...CLAMP(card.action?.type === "prompts" ? 2 : 5) }}>{card.line}</p>
        {card.action?.type === "prompts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 6 }}>
            {PROMPTS.map((p) => (
              <a key={p.label} href="/Assistant" style={{ display: "flex", alignItems: "center", gap: 9, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${a}`, borderRadius: 11, padding: "10px 12px", textDecoration: "none" }}>
                <p.Icon size={15} color={a} style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, ...CLAMP(1) }}>{p.label}</span>
                <ChevronRight size={14} color={T.muted} style={{ marginLeft: "auto", flexShrink: 0 }} />
              </a>
            ))}
          </div>
        )}
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          {card.action?.type === "ask" ? <AskAction action={card.action} accent={a} />
            : card.action?.type === "deeplink" ? <a href={card.action.href} style={btnStyle(a)}>{(() => { const A = card.action.Icon || ChevronRight; return <A size={15} />; })()} {card.action.label}</a>
            : null}
          <a href={card.open.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>
            {card.open.label} <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

function btnStyle(accent, disabled) {
  return { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1, textDecoration: "none" };
}

// inline "ask" — type a question, then continue into the full Jess chat (carries the text via the URL hash).
function AskAction({ action, accent }) {
  const [text, setText] = useState("");
  const can = text.trim().length > 0;
  const go = () => { const q = encodeURIComponent(text.trim().slice(0, 240)); try { window.location.href = `/Assistant#q=${q}`; } catch { window.location.href = "/Assistant"; } };
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={400} placeholder={action.placeholder}
        style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.ink, outline: "none", marginBottom: 10 }} />
      <button onClick={go} disabled={!can} style={btnStyle(accent, !can)}><Send size={15} /> {action.label}</button>
    </div>
  );
}

function navBtn(disabled) {
  return { width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : T.paperHi, color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 };
}

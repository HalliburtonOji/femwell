// ProgramsDemo — "Something to grow into" — a redesign DEMO of the Programs page. Adapts the
// TODAY / JOURNAL / COMMUNITY bar to Programs: a lush carousel where every card is a REAL programme that
// deep-links straight into that exact programme (never the parent list). PREVIEW route only
// (/ProgramsDemo, via IDEAS → Previews). LIVE /ProgramsHub UNTOUCHED. Conforms to BRAND_IDENTITY.md
// (Programs flora character — gold/sunflower, radiance & achievement).
//
// THE SHAPE: 1) HERO — a gold sunflower bloom + carved heart + Ephesis "Programs" + a butterfly
// (transformation). 2) SUMMARY — "Where you are": continue your active programme (real day-of-N) or an
// invitation, with quick rows. 3) PER-CARD CardStack — a lead Continue/tonight card (inline begin →
// HabitLogs) then one card per REAL programme (title · summary · duration · category eyebrow ·
// meaning-bloom) deep-linking to `/ProgramsHub?program_key=…` (the exact programme). Graceful curated
// fallback if none load. 4) Central Jump-to.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  RichBloomV2, floraKeyframes, CardCorner, VineMotifV2, FlowerGlyph, Butterfly,
} from "@/components/brand/flora";
import {
  Activity, Sparkles, Moon, Check, ChevronRight, ChevronLeft, Grid2x2, X, Play, Clock, Leaf,
} from "lucide-react";

const COL = 430;
const CARD_W = 365;
const GAP = 14;

const withTimeout = (p, ms = 7000) => Promise.race([
  Promise.resolve(p).catch(() => null),
  new Promise((res) => setTimeout(() => res(null), ms)),
]);
function todayKey() { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } }
const clip = (s, n) => (s && String(s).length > n ? String(s).slice(0, n).trim() + "…" : (s || ""));
const CLAMP = (n) => ({ minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" });

// a brand-accent + meaning-flower per programme, rotated so the carousel reads varied but on-palette.
const PALETTE = [
  { accent: T.gold, flower: "sunflower" },
  { accent: T.sage, flower: "primrose" },
  { accent: "#8E6E8E", flower: "iris" },
  { accent: T.blush, flower: "rose" },
  { accent: T.crimson, flower: "poppy" },
  { accent: T.gold, flower: "lavender" },
  { accent: T.sage, flower: "cornflower" },
];

// graceful curated fallback (only used if the real Programs list can't load) — spans life, not just health.
const FALLBACK = [
  { program_key: null, title: "Sleep, restored", summary: "Two weeks of small evening shifts toward deeper, calmer rest.", duration_days: 14, category: "Sleep" },
  { program_key: null, title: "Steadier moods", summary: "Gentle daily practices for the luteal dip — breath, light and food.", duration_days: 21, category: "Mind" },
  { program_key: null, title: "Move with your cycle", summary: "Workouts that flex to your phase, not against it.", duration_days: 28, category: "Movement" },
  { program_key: null, title: "Quiet confidence", summary: "Ten days of small brave things — for work, dating, and your own corner.", duration_days: 10, category: "Confidence" },
  { program_key: null, title: "Through perimenopause", summary: "What's changing, why, and what actually helps — week by week.", duration_days: 30, category: "Life stage" },
];

const ICON_DISC = (Icon, accent) => (
  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={16} strokeWidth={1.7} color={accent} />
  </span>
);
function Frame4({ variant = "sprig", color, opacity = 0.6, size = 46 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant={variant} color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
export default function ProgramsDemo() {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [programs, setPrograms] = useState(null);
  const [active, setActive] = useState(null);    // active UserProgram + its Program
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me());
      const id = me?.id || null;
      if (!alive) return;
      setUid(id);
      const rows = await withTimeout(base44.entities.Programs.list("-created_date", 60));
      const list = (rows || []).filter((p) => p && p.title);
      if (!alive) return;
      setPrograms(list);
      setLoading(false);
      if (id) {
        withTimeout(base44.entities.UserPrograms.filter({ user_id: id }, "-last_activity_date", 8)).then((ups) => {
          const arr = (ups || []).filter(Boolean);
          const up = arr.find((r) => r.status && r.status !== "completed") || arr[0];
          if (!alive || !up) return;
          const prog = list.find((p) => p.program_key === up.program_key) || null;
          setActive({ up, prog });
        }).catch(() => {});
      }
    })();
    return () => { alive = false; };
  }, []);

  const realProgs = (programs && programs.length ? programs : FALLBACK).slice(0, 7);

  // build the cards: lead Continue/tonight card, then one card per real programme.
  const CARDS = useMemo(() => {
    const lead = active?.prog ? {
      key: "continue", kind: "continue", section: "Continue", accent: T.gold, Icon: Play, flower: "sunflower",
      tag: "Pick up where you left off",
      hook: clip(active.prog.title, 44),
      line: active.prog.duration_days ? `Day ${active.up?.current_day || 1} of ${active.prog.duration_days} — keep the rhythm, it's working.` : `Day ${active.up?.current_day || 1} — keep the rhythm.`,
      href: createPageUrl(`ProgramDay?key=${active.prog.program_key}&day=${active.up?.current_day || 1}`),
      cta: "Continue today's session",
    } : {
      key: "tonight", kind: "tonight", section: "Tonight", accent: T.gold, Icon: Moon, flower: "lavender",
      tag: "A small start tonight",
      hook: "A 10-minute body-scan",
      line: "No commitment, no streak to break — just ten soft minutes. Begin it right here when you're ready.",
      cta: "Begin tonight's practice",
    };
    const progCards = realProgs.map((p, i) => {
      const pal = PALETTE[(i + 1) % PALETTE.length];
      return {
        key: `prog-${i}`, kind: "program", section: clip(p.category || p.title, 14), accent: pal.accent, Icon: Activity, flower: pal.flower,
        tag: p.category ? String(p.category) : "Programme",
        hook: clip(p.title, 46),
        line: clip(p.summary || "A gentle, guided programme you can move through at your own pace.", 120),
        meta: p.duration_days ? `${p.duration_days} days` : null,
        href: p.program_key ? createPageUrl(`ProgramsHub?program_key=${p.program_key}`) : "/ProgramsHub",
        cta: "Explore this programme",
      };
    });
    return [lead, ...progCards];
  }, [active, realProgs]);

  // slider
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

  const summaryLine = active?.prog
    ? `You're ${active.prog.duration_days ? `on day ${active.up?.current_day || 1} of ${active.prog.duration_days}` : "mid-way"} through ${active.prog.title}. Keep going, or browse something new below.`
    : "Programmes are short, guided arcs — sleep, movement, confidence, your life stage. Pick one that fits the season you're in.";

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{`@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.pg-track{scrollbar-width:none}.pg-track::-webkit-scrollbar{display:none}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-fade{animation:none!important}}${floraKeyframes}`}</style>

      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 150, right: -26 }}><VineMotifV2 color={T.gold} color2={T.sage} opacity={0.1} w={150} /></div>
        <div style={{ position: "absolute", top: 820, left: -28 }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.08} w={140} flip /></div>
      </div>

      <button onClick={() => setJumpOpen(true)} aria-label="Jump to a programme" style={{
        position: "fixed", top: "calc(10px + env(safe-area-inset-top))", left: 12, zIndex: 45,
        display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(244,239,227,0.92)", backdropFilter: "blur(6px)",
        border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "8px 13px", cursor: "pointer",
        fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.muted,
        boxShadow: "0 2px 10px rgba(58,44,26,0.12)",
      }}><Grid2x2 size={14} /> Jump to</button>

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* HERO */}
        <header style={{ padding: "26px 18px 6px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Activity size={13} color={T.muted} />
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>Programmes</span>
          </div>
          <div style={{ position: "relative", display: "flex", justifyContent: "center", margin: "2px 0 2px" }}>
            <div style={{ position: "relative", width: 188, height: 188, display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 200 200" width={188} height={188} aria-hidden style={{ position: "absolute", inset: 0 }}>
                <circle cx="100" cy="100" r="84" fill="none" stroke={T.gold} strokeWidth="2.5" strokeDasharray="2 8" opacity="0.5" />
                <circle cx="100" cy="100" r="74" fill="none" stroke={T.sage} strokeWidth="1.2" opacity="0.35" />
              </svg>
              <RichBloomV2 form="daisy" color="#D4AF37" color2="#E8CE78" accent="#6B5840" size={126} animate soft idx="pg-hero" />
            </div>
            <div style={{ position: "absolute", top: 8, right: 30 }}><Butterfly size={42} color={T.gold} color2="#8E6E8E" pattern="eyes" idx="pg-bf" /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 2 }}>
            <Heart size={17} />
            <Script size={46} color={T.ink}>Programs</Script>
          </div>
          <Hand size={16} color={T.muted} style={{ display: "block", marginTop: 11, lineHeight: 1.5 }}>
            Something to grow into — short, guided arcs for the part of life that's asking for attention right now.
          </Hand>
        </header>

        {/* SUMMARY */}
        <div style={{ padding: "10px 18px 4px" }}>
          <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.gold}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)" }}>
            <Frame4 variant="sprig" color={T.gold} size={42} opacity={0.5} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                {ICON_DISC(Sparkles, T.gold)}
                <Eyebrow color={T.gold}>Where you are</Eyebrow>
                <span style={{ marginLeft: "auto" }}><FlowerGlyph variant="sunflower" size={30} color={T.gold} idx="pgsum-mb" /></span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 12px", ...CLAMP(5) }}>{summaryLine}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <SummaryChip Icon={active?.prog ? Play : Moon} label={active?.prog ? "Continue" : "Start tonight"} onClick={() => jumpTo(0)} accent={T.gold} />
                <SummaryChip Icon={Activity} label="Browse programmes" onClick={() => jumpTo(1)} accent={T.sage} />
              </div>
            </div>
          </div>
        </div>

        {/* segmented rail */}
        <div ref={sliderTopRef} className="pg-track" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "16px 18px 12px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c, i) => (
            <button key={c.key} onClick={() => goTo(i)} style={{
              flex: "none", background: i === idx ? c.accent : "transparent", color: i === idx ? T.paper : T.muted,
              border: `1px solid ${i === idx ? c.accent : T.paperDeep}`, borderRadius: 999, padding: "6px 13px",
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}><c.Icon size={13} /> {c.section}</button>
          ))}
        </div>

        {/* slider */}
        <div ref={trackRef} className="pg-track" style={{ display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px 4px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c) => (
            <ProgramCard key={c.key} card={c} uid={uid} />
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
        <div role="dialog" aria-modal="true" aria-label="Jump to a programme" className="fw-scrim-anim" onClick={(e) => { if (e.target === e.currentTarget) setJumpOpen(false); }}
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
                    <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, ...CLAMP(1) }}>{clip(c.hook, 22)}</span>
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

function ProgramCard({ card, uid }) {
  const a = card.accent;
  return (
    <section style={{
      scrollSnapAlign: "center", flex: `0 0 ${CARD_W}px`, width: CARD_W, position: "relative", overflow: "hidden",
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${a}14 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${a}`, borderRadius: 20,
      padding: 20, display: "flex", flexDirection: "column", minHeight: 408,
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
        {card.meta && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8, fontFamily: UI, fontSize: 13, fontWeight: 700, color: a }}>
            <Clock size={13} /> {card.meta}
          </div>
        )}
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...CLAMP(5) }}>{card.line}</p>
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          {card.kind === "tonight"
            ? <BeginAction uid={uid} accent={a} label={card.cta} />
            : <a href={card.href} style={btnStyle(a)}>{card.kind === "continue" ? <Play size={15} /> : <Activity size={15} />} {card.cta}</a>}
          {card.kind === "tonight" && (
            <a href="/ProgramsHub" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>
              Browse all programmes <ChevronRight size={14} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function btnStyle(accent, disabled) {
  return { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1, textDecoration: "none" };
}

function BeginAction({ uid, accent, label }) {
  const [done, setDone] = useState(false);
  const fire = () => {
    if (done) return; setDone(true);
    if (uid) { const day = todayKey(); const ts = new Date().toISOString(); base44.entities.HabitLogs.create({ user_id: uid, habit_type: "Tonight's practice", habit_name: "10-minute body-scan", habit_category: "programs", date: day, day_key: day, completed: true, is_completed: true, source: "programs-demo", created_at: ts, updated_at: ts }).catch(() => {}); }
  };
  if (done) return (
    <div className="fw-fade" style={{ display: "flex", alignItems: "center", gap: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "12px 13px", animation: "fwFadeUp .3s ease both" }}>
      <span style={{ width: 30, height: 30, borderRadius: 99, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={17} color="#fff" strokeWidth={3} /></span>
      <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>Begun. Rest is part of the work.</span>
    </div>
  );
  return <button onClick={fire} style={btnStyle(accent)}><Leaf size={15} /> {label}</button>;
}

function navBtn(disabled) {
  return { width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : T.paperHi, color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 };
}

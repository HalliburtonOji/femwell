// GardenDemo — "Everything you tend, grows" — a redesign DEMO of the Garden page. Adapts the
// TODAY / JOURNAL / COMMUNITY bar to the Garden's purpose: your companion + the life you tend, shown as
// a living garden. PREVIEW route only (/GardenDemo, via IDEAS → Previews). LIVE /Garden UNTOUCHED.
// Conforms to BRAND_IDENTITY.md (Garden flora character = the FULL palette; the companion's REAL bloom
// is the centrepiece, §5/§5.2).
//
// THE SHAPE: 1) HERO — the companion's REAL RichBloomV2 (her form + accent) in a soft full-palette ring
// + a resting butterfly (earned/return) + carved heart + Ephesis title (her name). 2) SUMMARY — "Your
// garden today": tended-state + what's been feeding it (real recent activity), with quick rows.
// 3) PER-SECTION CardStack — companion (inline tend) · leave a line (inline reflective write) · what's
// growing (real activity) · name & shape her (inline rename) · milestones · plant something · share —
// inline acts where it's a ritual, SPECIFIC deep-links otherwise. 4) Central Jump-to.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import {
  RichBloomV2, floraKeyframes, CardCorner, VineMotifV2, FlowerGlyph, Butterfly, lighten,
} from "@/components/brand/flora";
import { FORM_LIST, getCompanion, tendCompanion, tendedToday, loadCompanionState, renameCompanion } from "@/components/nurture/companion";
import {
  Sprout, Feather, Leaf, PenLine, Sparkles, Users, Activity, Award, Check, ChevronRight, ChevronLeft,
  Grid2x2, X, Send, Wand2,
} from "lucide-react";

const COL = 430;
const CARD_W = 365;
const GAP = 14;
const PEONY = FORM_LIST.find((f) => f.key === "peony") || { key: "peony" };

const withTimeout = (p, ms = 7000) => Promise.race([
  Promise.resolve(p).catch(() => null),
  new Promise((res) => setTimeout(() => res(null), ms)),
]);
function todayKey() { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } }
const CLAMP = (n) => ({ minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" });
const countSince = (rows, days, field) => { const cut = Date.now() - days * 86400000; return (rows || []).filter((r) => { const d = r?.[field] || r?.date || r?.created_date || r?.day_key; const t = d ? new Date(d).getTime() : 0; return t && t >= cut; }).length; };

const ICON_DISC = (Icon, accent) => (
  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={16} strokeWidth={1.7} color={accent} />
  </span>
);
function Frame4({ variant = "sprig", color, opacity = 0.6, size = 46 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant={variant} color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
export default function GardenDemo() {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [act, setAct] = useState({});         // recent activity counts
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [justTended, setJustTended] = useState(false);
  const [cName, setCName] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me());
      const id = me?.id || null;
      if (!alive) return;
      setUid(id);
      if (id) { await loadCompanionState(id).catch(() => {}); try { const c = getCompanion(id); setCompanion(c); setCName(c?.name || null); } catch { /* ignore */ } }
      setLoading(false);
      if (id) {
        withTimeout(base44.entities.JournalEntries.filter({ user_id: id }, "-created_date", 60)).then((r) => { if (alive) setAct((a) => ({ ...a, journal: countSince(r, 7, "created_date") })); }).catch(() => {});
        withTimeout(base44.entities.DailyCheckins.filter({ user_id: id }, "-date", 60)).then((r) => { if (alive) setAct((a) => ({ ...a, checkins: countSince(r, 7, "date") })); }).catch(() => {});
        withTimeout(base44.entities.MealLog.filter({ user_id: id }, "-date", 60)).then((r) => { if (alive) setAct((a) => ({ ...a, meals: countSince(r, 7, "date") })); }).catch(() => {});
      }
    })();
    return () => { alive = false; };
  }, []);

  const cForm = useMemo(() => FORM_LIST.find((f) => f.key === (companion?.form?.key || companion?.form)) || PEONY, [companion]);
  const cAccent = companion?.accent || T.blush;
  const name = cName || companion?.name || "your companion";
  const tended = tendedToday(uid);
  const fedCount = (act.journal || 0) + (act.checkins || 0) + (act.meals || 0);

  const tend = (note) => {
    setJustTended(true); setTimeout(() => setJustTended(false), 2200);
    try { if (uid) tendCompanion(uid, note || "Tended from the garden"); } catch { /* ignore */ }
  };

  const summaryLine = `${name} is ${tended ? "blooming — you've already tended her today" : "waiting, gently"}. ${fedCount > 0 ? `This week your garden's been fed by ${[act.journal && `${act.journal} journal note${act.journal === 1 ? "" : "s"}`, act.checkins && `${act.checkins} check-in${act.checkins === 1 ? "" : "s"}`, act.meals && `${act.meals} logged meal${act.meals === 1 ? "" : "s"}`].filter(Boolean).join(", ")}.` : "She grows from everything you already do — a note, a meal logged, a check-in. Nothing extra required."}`;

  const CARDS = [
    {
      key: "companion", section: "Companion", accent: cAccent, Icon: Sprout, flower: "rose", bloom: true,
      tag: "Your companion", hook: name,
      line: tended ? "You tended her today — she's a little more open for it." : "A small act of showing up for yourself. Leave her a line and watch her open.",
      action: { type: "tend", Icon: Feather, label: "Tend her", doneLabel: `${name} felt that.` },
      open: { href: "/Garden", label: "Open your full garden" },
    },
    {
      key: "line", section: "Leave a line", accent: T.gold, Icon: PenLine, flower: "camellia",
      tag: "A reflective line", hook: "How are you, really?",
      line: "Not a journal entry to keep forever — just a line, named honestly. It counts as tending, and it feeds the garden.",
      action: { type: "line", Icon: PenLine, label: "Leave it", placeholder: "Today I feel…", doneLabel: "Kept, and felt. She grew a little." },
      open: { href: "/Journal", label: "Open your journal" },
    },
    {
      key: "growing", section: "What's growing", accent: T.sage, Icon: Activity, flower: "primrose",
      tag: "What's feeding it",
      hook: fedCount > 0 ? `${fedCount} small acts this week` : "Every small thing counts",
      line: "Your garden isn't a chore on top of life — it's a portrait of the life you're already living. Each log, note and check-in plants something.",
      action: { type: "deeplink", Icon: Sparkles, label: "See what fed it", href: "/Garden" },
      open: { href: "/Today", label: "Back to Today" },
    },
    {
      key: "name", section: "Name her", accent: T.blush, Icon: Wand2, flower: "violet",
      tag: "Name & shape her", hook: `Make her yours`,
      line: `She's ${name === "your companion" ? "unnamed for now" : `called ${name}`} — give her a name that means something to you. No two companions are alike.`,
      action: { type: "rename", Icon: Wand2, label: "Save her name", placeholder: "A name for her…", doneLabel: "named. She suits it." },
      open: { href: "/Garden", label: "Shape her in the garden" },
    },
    {
      key: "milestones", section: "Milestones", accent: "#8E6E8E", Icon: Award, flower: "iris",
      tag: "What you've earned", hook: "Earned, never bought",
      line: "Rare blooms, a visiting butterfly, a flowering tree — they arrive on the days that matter, never from a shop. They mark how far you've come.",
      action: { type: "deeplink", Icon: Award, label: "See your milestones", href: "/Garden" },
      open: { href: "/Garden", label: "Open your garden" },
    },
    {
      key: "plant", section: "Plant", accent: T.sage, Icon: Leaf, flower: "lavender",
      tag: "Plant something new", hook: "Grow a new corner",
      line: "Start a short programme — sleep, movement, confidence — and watch a new plant take root alongside the rest.",
      action: { type: "deeplink", Icon: Activity, label: "Find a programme", href: "/ProgramsHub" },
      open: { href: "/ProgramsHub", label: "Programmes" },
    },
    {
      key: "share", section: "Share", accent: T.crimson, Icon: Users, flower: "cornflower",
      tag: "A garden of gardens", hook: "You're not tending alone",
      line: "Step into the community — a meadow of other women's gardens, anonymous and warm. Leave an echo, answer the room.",
      action: { type: "deeplink", Icon: Users, label: "Visit the community", href: "/Community" },
      open: { href: "/Community", label: "Community" },
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
      <style>{`@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.gd-track{scrollbar-width:none}.gd-track::-webkit-scrollbar{display:none}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-fade{animation:none!important}}${floraKeyframes}`}</style>

      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 150, right: -26 }}><VineMotifV2 color={cAccent} color2={T.sage} opacity={0.1} w={150} /></div>
        <div style={{ position: "absolute", top: 760, left: -28 }}><VineMotifV2 color={T.sage} color2={T.gold} opacity={0.08} w={140} flip /></div>
        <div style={{ position: "absolute", top: 1360, right: -24 }}><VineMotifV2 color={T.gold} color2={cAccent} opacity={0.08} w={130} /></div>
      </div>

      <button onClick={() => setJumpOpen(true)} aria-label="Jump to a section" style={{
        position: "fixed", top: "calc(10px + env(safe-area-inset-top))", left: 12, zIndex: 45,
        display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(244,239,227,0.92)", backdropFilter: "blur(6px)",
        border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "8px 13px", cursor: "pointer",
        fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.muted,
        boxShadow: "0 2px 10px rgba(58,44,26,0.12)",
      }}><Grid2x2 size={14} /> Jump to</button>

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* HERO — the companion's real bloom */}
        <header style={{ padding: "26px 18px 6px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Sprout size={13} color={T.muted} />
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>Your garden</span>
          </div>
          <div style={{ position: "relative", display: "flex", justifyContent: "center", margin: "2px 0 2px" }}>
            <div style={{ position: "relative", width: 210, height: 210, display: "grid", placeItems: "center" }}>
              <svg viewBox="0 0 210 210" width={210} height={210} aria-hidden style={{ position: "absolute", inset: 0 }}>
                <circle cx="105" cy="105" r="92" fill="none" stroke={cAccent} strokeWidth="2.5" strokeDasharray="2 9" opacity="0.45" />
                <circle cx="105" cy="105" r="80" fill="none" stroke={T.gold} strokeWidth="1.2" opacity="0.3" />
              </svg>
              <RichBloomV2 form={cForm?.key || "peony"} color={cAccent} color2={lighten(cAccent, 0.34)} accent={T.gold} size={150} animate soft idx="gd-hero" />
            </div>
            <div style={{ position: "absolute", top: 6, right: 24 }}><Butterfly size={44} color={cAccent} color2={T.gold} pattern="spots" idx="gd-bf" /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 2 }}>
            <Heart size={17} />
            <Script size={46} color={T.ink}>{name === "your companion" ? "Your garden" : name}</Script>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: T.paper, background: tended ? T.sage : cAccent, borderRadius: 999, padding: "3px 11px", textTransform: "uppercase" }}>{tended ? "Tended today" : "Waiting for you"}</span>
          </div>
          <Hand size={16} color={T.muted} style={{ display: "block", marginTop: 11, lineHeight: 1.5 }}>
            Everything you tend, grows. This garden is a portrait of the life you're already living — no extra to-do list.
          </Hand>
        </header>

        {/* SUMMARY */}
        <div style={{ padding: "10px 18px 4px" }}>
          <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${cAccent}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${cAccent}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)" }}>
            <Frame4 variant="sprig" color={cAccent} size={42} opacity={0.5} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                {ICON_DISC(Sparkles, cAccent)}
                <Eyebrow color={cAccent}>Your garden today</Eyebrow>
                <span style={{ marginLeft: "auto" }}><FlowerGlyph variant="rose" size={30} color={cAccent} idx="gdsum-mb" /></span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 12px", ...CLAMP(5) }}>{summaryLine}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <SummaryChip Icon={Feather} label="Tend her" onClick={() => jumpTo(0)} accent={cAccent} />
                <SummaryChip Icon={PenLine} label="Leave a line" onClick={() => jumpTo(1)} accent={T.gold} />
                <SummaryChip Icon={Users} label="Share" onClick={() => jumpTo(6)} accent={T.crimson} />
              </div>
            </div>
          </div>
        </div>

        {/* segmented rail */}
        <div ref={sliderTopRef} className="gd-track" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "16px 18px 12px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c, i) => (
            <button key={c.key} onClick={() => goTo(i)} style={{
              flex: "none", background: i === idx ? c.accent : "transparent", color: i === idx ? T.paper : T.muted,
              border: `1px solid ${i === idx ? c.accent : T.paperDeep}`, borderRadius: 999, padding: "6px 13px",
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}><c.Icon size={13} /> {c.section}</button>
          ))}
        </div>

        {/* slider */}
        <div ref={trackRef} className="gd-track" style={{ display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px 4px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c) => (
            <GardenCard key={c.key} card={c} uid={uid} cForm={cForm} cAccent={cAccent} onTend={tend} onRenamed={setCName} />
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

      {justTended && (
        <div className="fw-fade" style={{ position: "fixed", left: "50%", bottom: 96, transform: "translateX(-50%)", zIndex: 400, display: "inline-flex", alignItems: "center", gap: 7, background: T.sage, color: "#fff", borderRadius: 999, padding: "9px 16px", fontFamily: UI, fontSize: 13, fontWeight: 700, animation: "fwFadeUp .3s ease both" }}>
          <Leaf size={14} /> {name} felt that
        </div>
      )}

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

function GardenCard({ card, uid, cForm, cAccent, onTend, onRenamed }) {
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
          <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={card.flower || "rose"} size={30} color={a} idx={`mb-${card.key}`} /></span>
        </div>
        {card.bloom && (
          <div style={{ display: "flex", justifyContent: "center", margin: "0 0 6px" }}>
            <RichBloomV2 form={cForm?.key || "peony"} color={cAccent} color2={lighten(cAccent, 0.34)} accent={T.gold} size={108} animate soft idx="gd-card-bloom" />
          </div>
        )}
        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 8px", lineHeight: 1.3, ...CLAMP(3) }}>{card.hook}</h3>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...CLAMP(5) }}>{card.line}</p>
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          <InlineAction action={card.action} accent={a} uid={uid} onTend={onTend} onRenamed={onRenamed} />
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
function InlineAction({ action, accent, uid, onTend, onRenamed }) {
  const { type } = action || {};
  if (type === "deeplink") { const A = action.Icon || ChevronRight; return <a href={action.href} style={btnStyle(accent)}><A size={15} /> {action.label}</a>; }
  if (type === "tend") return <TendAction action={action} accent={accent} onTend={onTend} />;
  if (type === "line") return <LineAction action={action} accent={accent} uid={uid} onTend={onTend} />;
  if (type === "rename") return <RenameAction action={action} accent={accent} uid={uid} onRenamed={onRenamed} />;
  return null;
}

function TendAction({ action, accent, onTend }) {
  const [done, setDone] = useState(false);
  const fire = () => { if (done) return; setDone(true); onTend && onTend("Tended from the garden"); };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Tended."} />;
  return <button onClick={fire} style={btnStyle(accent)}><Feather size={15} /> {action.label}</button>;
}

function LineAction({ action, accent, uid, onTend }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const can = text.trim().length > 0 && !done;
  const post = () => {
    if (!can) return; setDone(true);
    onTend && onTend("Left a line in the garden");
    if (uid) base44.entities.JournalEntries.create({ user_id: uid, session_date: todayKey(), text: text.trim(), tags: ["tend"], prompt: "A line, from the garden", card_type: "free", card_color: "cream" }).catch(() => {});
  };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Kept."} />;
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={400} placeholder={action.placeholder}
        style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", resize: "none", fontFamily: SERIF, fontSize: 16, lineHeight: 1.5, color: T.ink, outline: "none", marginBottom: 10 }} />
      <button onClick={post} disabled={!can} style={btnStyle(accent, !can)}><Send size={15} /> {action.label}</button>
    </div>
  );
}

function RenameAction({ action, accent, uid, onRenamed }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const can = text.trim().length > 0 && !done;
  const save = () => {
    if (!can) return; setDone(true);
    const v = text.trim().slice(0, 40);
    try { if (uid) renameCompanion(uid, v); } catch { /* ignore */ }
    onRenamed && onRenamed(v);
  };
  if (done) return <DoneRow accent={accent} label={`${text.trim().slice(0, 40)} ${action.doneLabel}`} />;
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} maxLength={40} placeholder={action.placeholder}
        style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", marginBottom: 10 }} />
      <button onClick={save} disabled={!can} style={btnStyle(accent, !can)}><Wand2 size={15} /> {action.label}</button>
    </div>
  );
}

function DoneRow({ accent, label }) {
  return (
    <div className="fw-fade" style={{ display: "flex", alignItems: "center", gap: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "12px 13px", animation: "fwFadeUp .3s ease both" }}>
      <span style={{ width: 30, height: 30, borderRadius: 99, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={17} color="#fff" strokeWidth={3} /></span>
      <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

function navBtn(disabled) {
  return { width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : T.paperHi, color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 };
}

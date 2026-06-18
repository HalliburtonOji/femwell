// HealthDemo — "Your body, one letter at a time" — a redesign DEMO of the Health page that adapts
// the proven TODAY / JOURNAL / COMMUNITY bar to Health's own purpose. PREVIEW route only
// (/HealthDemo, reached via IDEAS → Previews). The LIVE /Health is UNTOUCHED.
// Conforms to claude-state/BRAND_IDENTITY.md (tone dial: elegant AND lush).
//
// THE SHAPE (echoing the bar, page-appropriate):
//   1. HERO — the phase bloom inside a real, readable CYCLE RING (where she is today) + carved heart +
//      Ephesis "Health" title + a supportive, phase-aware line. Health's flora character = the phase
//      hue + the phase flower + a resting dragonfly (§5.3).
//   2. SUMMARY CARD — "Where your body is today": phase + cycle day + a real read of recent symptoms
//      (last 7d, tallied) with a graceful phase-read fallback, and quick rows that tap into a section.
//   3. PER-SECTION CARDStack — the SHARED CardStack geometry; one engaging card per Health surface
//      (your letter · symptoms · cycle ahead · daily check-in · life-stage care · body & skin · your
//      patterns · doctor export) — icon disc + eyebrow + meaning-bloom + hook + line + an INLINE action
//      (note a symptom, take a check-in) OR a SPECIFIC deep-link to the exact full page.
//   4. CENTRAL JUMP-TO — a pinned "Jump to" pill → a "Jump to" bottom-sheet (the canonical multi-layer
//      switcher) AND the segmented section rail. Reaches any section from one control.
//
// WIRED TO REAL DATA (all guarded + fail-open): cycle phase/day (computeCycleDay), recent SymptomLogs,
// the last DailyCheckin, life-stage from the profile. Graceful empties everywhere.

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_COLORS, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import {
  RichBloomV2, floraKeyframes, CardCorner, VineMotifV2, FlowerGlyph, Butterfly, lighten,
} from "@/components/brand/flora";
import {
  Stethoscope, Sparkles, BookOpen, TrendingUp, Leaf, Check, ChevronRight, ChevronLeft,
  Circle, CalendarDays, HeartPulse, Smile, Droplet, Flower2, FileText, Grid2x2, X, Settings,
} from "lucide-react";

// ── slider geometry — lifted verbatim from JournalHub / TodayOption2 (do not re-derive) ─────────────
const COL = 430;
const CARD_W = 365;
const GAP = 14;

const SEASON = { menstrual: "Inner Winter", follicular: "Inner Spring", ovulatory: "Inner Summer", luteal: "Inner Autumn" };
// hero bloom FORM per phase (from the available RichBloomV2 forms) + the phase's small meaning-flower.
const PHASE_FORM = { menstrual: "poppy", follicular: "forget", ovulatory: "daisy", luteal: "peony" };
const PHASE_FLOWER = { menstrual: "poppy", follicular: "primrose", ovulatory: "sunflower", luteal: "dahlia" };

const withTimeout = (p, ms = 7000) => Promise.race([
  Promise.resolve(p).catch(() => null),
  new Promise((res) => setTimeout(() => res(null), ms)),
]);
function todayKey() { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } }
const CLAMP = (n) => ({ minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" });

const ICON_DISC = (Icon, accent) => (
  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={16} strokeWidth={1.7} color={accent} />
  </span>
);
function Frame4({ variant = "sprig", color, opacity = 0.6, size = 46 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant={variant} color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

// ── the CYCLE RING — a real, readable hero: 4 phase arcs + a marker at today's cycle day, the phase
//    bloom resting in the centre. Decorative-but-true (where she is). Falls back to a calm dashed ring.
function CycleRing({ phase, cycleDay, cycleLen = 28, hasCycle, children, size = 196 }) {
  const r = 84, cx = 100, cy = 100, C = 2 * Math.PI * r;
  // typical phase spans on a normalised cycle (start day, length)
  const spans = [
    { key: "menstrual", start: 1, len: 5 },
    { key: "follicular", start: 6, len: 8 },
    { key: "ovulatory", start: 14, len: 3 },
    { key: "luteal", start: 17, len: cycleLen - 16 },
  ];
  const markAng = (((Math.max(1, Math.min(cycleLen, cycleDay || 1)) - 1) / cycleLen) * 360) - 90;
  const mx = cx + r * Math.cos((markAng * Math.PI) / 180);
  const my = cy + r * Math.sin((markAng * Math.PI) / 180);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden style={{ position: "absolute", inset: 0 }}>
        {/* base track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.paperDeep} strokeWidth="7" opacity="0.55" />
        {hasCycle ? spans.map((s) => {
          const len = (s.len / cycleLen) * C;
          const rot = ((s.start - 1) / cycleLen) * 360 - 90;
          return (
            <circle key={s.key} cx={cx} cy={cy} r={r} fill="none" stroke={PHASE_COLORS[s.key]} strokeWidth="7"
              strokeLinecap="round" strokeDasharray={`${Math.max(0, len - 6)} ${C}`} transform={`rotate(${rot} ${cx} ${cy})`} opacity={s.key === phase ? 0.95 : 0.4} />
          );
        }) : (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.gold} strokeWidth="2.5" strokeDasharray="3 7" opacity="0.5" />
        )}
        {hasCycle && <circle cx={mx} cy={my} r="6.4" fill={PHASE_COLORS[phase] || T.gold} stroke="#FFFDF7" strokeWidth="2" />}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
export default function HealthDemo() {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [symptoms, setSymptoms] = useState(null);   // recent SymptomLogs
  const [lastCheckin, setLastCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me());
      const id = me?.id || null;
      if (!alive) return;
      setUid(id);
      if (!id) { setLoading(false); return; }
      const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: id }));
      if (!alive) return;
      setProfile((profs || []).filter(Boolean)[0] || null);
      setLoading(false);
      withTimeout(base44.entities.SymptomLogs.filter({ user_id: id }, "-date", 60)).then((rows) => {
        if (alive) setSymptoms((rows || []).filter(Boolean));
      }).catch(() => {});
      withTimeout(base44.entities.DailyCheckins.filter({ user_id: id }, "-date", 1)).then((rows) => {
        if (alive) setLastCheckin((rows || []).filter(Boolean)[0] || null);
      }).catch(() => {});
    })();
    return () => { alive = false; };
  }, []);

  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const phase = cycle.phase;
  const phaseColor = PHASE_COLORS[phase] || T.sage;
  const season = SEASON[phase] || "your season";
  const phaseWord = PHASE_LABEL[phase] ? PHASE_LABEL[phase].toLowerCase() : "";
  const stage = profile?.life_stage || profile?.lifeStage || null;

  // recent-symptom read (last 7d, tallied) — the honest summary.
  const recent = useMemo(() => {
    if (!symptoms) return null;
    const cut = Date.now() - 7 * 86400000;
    const tally = {};
    for (const s of symptoms) {
      const d = s.date ? new Date(s.date).getTime() : 0;
      if (d && d >= cut) { const k = (s.symptom_name || s.symptom_type || "").replace(/_/g, " ").toLowerCase(); if (k) tally[k] = (tally[k] || 0) + 1; }
    }
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { count: Object.values(tally).reduce((a, b) => a + b, 0), top };
  }, [symptoms]);

  const PHASE_LINE = {
    menstrual: "Warmth, iron and rest suit today. Your body's doing quiet, real work — be soft with it.",
    follicular: "Energy's returning. A good week to begin something and to ask your body what it wants.",
    ovulatory: "You're at your most outward. Skin and mood often lift now — notice what feels good.",
    luteal: "Things turn inward. Cravings, tenderness and a shorter fuse are biology, not failing.",
  };
  const summaryLine = recent && recent.count > 0
    ? `This week you've noted ${recent.top.map(([n, c]) => `${n}${c > 1 ? ` ×${c}` : ""}`).join(", ")}. ${PHASE_LINE[phase] || ""}`
    : (PHASE_LINE[phase] || "Tell me where you are in your cycle and your letters will shape themselves to you.");

  // ── the section cards ────────────────────────────────────────────────────────────────────────────
  const CARDS = [
    {
      key: "letter", section: "Your letter", accent: phaseColor, Icon: BookOpen, flower: PHASE_FLOWER[phase] || "camellia",
      tag: hasCycle ? `Your ${phaseWord} letter` : "Your health letters",
      hook: hasCycle ? `Day ${cycle.cycleDay} · ${PHASE_LABEL[phase]}` : "Seven letters, written for you",
      line: "The letter most apps don't write — Story, Cycle, Body, Mind, Nourishment, Intimacy, Care. Phase-aware, never clinical.",
      action: { type: "deeplink", Icon: BookOpen, label: "Read your letter", href: "/Health" },
      open: { href: "/Health", label: "Open Health letters" },
    },
    {
      key: "symptoms", section: "Symptoms", accent: phaseColor, Icon: Stethoscope, flower: "dahlia",
      tag: "Note something",
      hook: hasCycle ? "How's your body today?" : "What's your body saying?",
      line: "A note now keeps your patterns honest — it's what makes every letter sharper next cycle.",
      action: { type: "chips", Icon: Stethoscope, label: "Save the note", chips: ["Cramps", "Low mood", "Tired", "Headache", "Tender", "Bloated", "Calm"], doneLabel: "Noted, gently." },
      open: { href: "/Track", label: "Open the tracker" },
    },
    {
      key: "cycle", section: "Cycle ahead", accent: "#8E6E8E", Icon: CalendarDays, flower: "iris",
      tag: "Your cycle ahead",
      hook: hasCycle && cycle.daysUntilPeriod != null ? (cycle.daysUntilPeriod <= 0 ? "Your period's due around now" : `Period likely in ~${cycle.daysUntilPeriod} days`) : "Set your cycle dates",
      line: hasCycle ? "A gentle estimate from your own dates — update them any time and everything re-shapes." : "Tell me your last period and the rest of the app tunes itself to where you are.",
      action: { type: "deeplink", Icon: Settings, label: hasCycle ? "Update your cycle" : "Set your cycle", href: "/CycleSettings" },
      open: { href: "/CycleSettings", label: "Cycle settings" },
    },
    {
      key: "checkin", section: "Check-in", accent: T.sage, Icon: Smile, flower: "primrose",
      tag: "Today's check-in",
      hook: lastCheckin ? "Add a fresh check-in" : "How are you, really?",
      line: "A few taps — mood and energy. It's how the small days add up into a pattern you can see.",
      action: { type: "mood", Icon: Smile, label: "Save check-in", doneLabel: "Logged. That counts as showing up." },
      open: { href: "/Track", label: "Open check-in" },
    },
    {
      key: "stage", section: "Life stage", accent: T.gold, Icon: Flower2, flower: "lavender",
      tag: "Life-stage care",
      hook: stage ? prettyStage(stage) : "Care for your stage",
      line: "Teen to post-menopause — care that meets the body you have now, not a generic 28-day template.",
      action: { type: "deeplink", Icon: Flower2, label: "Open life-stage care", href: "/LifeStageCare" },
      open: { href: "/LifeStageCare", label: "Life-stage care" },
    },
    {
      key: "body", section: "Body & skin", accent: T.blush, Icon: HeartPulse, flower: "rose",
      tag: "Body & skin",
      hook: "Skin, hair, energy — read in cycle",
      line: "Breakouts, hair, bloat and energy track your hormones. See what's phase, what's worth a closer look.",
      action: { type: "deeplink", Icon: HeartPulse, label: "Open Body & skin", href: "/SkinHair" },
      open: { href: "/SkinHair", label: "Body & skin" },
    },
    {
      key: "pulse", section: "Patterns", accent: "#8E6E8E", Icon: TrendingUp, flower: "cornflower",
      tag: "Your patterns",
      hook: "What's building over time",
      line: "Log a few days and your weekly shape surfaces here — never scores, never guilt, just your pattern.",
      action: { type: "deeplink", Icon: TrendingUp, label: "See your patterns", href: "/Pulse" },
      open: { href: "/Pulse", label: "Open Pulse" },
    },
    {
      key: "export", section: "Doctor export", accent: T.sage, Icon: FileText, flower: "violet",
      tag: "For your GP",
      hook: "Take it to your appointment",
      line: "Turn your logs into a clear, one-page summary for a 10-minute NHS appointment — symptoms, cycle, notes.",
      action: { type: "deeplink", Icon: FileText, label: "Build your export", href: "/DoctorExport" },
      open: { href: "/DoctorExport", label: "Doctor export" },
    },
  ];

  // slider
  const trackRef = useRef(null);
  const sliderTopRef = useRef(null);
  const [active, setActive] = useState(0);
  const last = CARDS.length - 1;
  useEffect(() => {
    const el = trackRef.current; if (!el) return; let t;
    const onScroll = () => { clearTimeout(t); t = setTimeout(() => { const i = Math.round(el.scrollLeft / (CARD_W + GAP)); setActive(Math.max(0, Math.min(last, i))); }, 80); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [last, loading]);
  const goTo = (i) => { const idx = Math.max(0, Math.min(last, i)); setActive(idx); trackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" }); };
  const jumpTo = (i) => { setJumpOpen(false); sliderTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(() => goTo(i), 280); };

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <InkFilter />
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  const heroForm = PHASE_FORM[phase] || "peony";

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{`@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.hd-track{scrollbar-width:none}.hd-track::-webkit-scrollbar{display:none}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-fade{animation:none!important}}${floraKeyframes}`}</style>

      {/* botanical page texture — one low-opacity vine per fold, clipped, behind content */}
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: 150, right: -26 }}><VineMotifV2 color={phaseColor} color2={T.gold} opacity={0.1} w={150} /></div>
        <div style={{ position: "absolute", top: 820, left: -28 }}><VineMotifV2 color={T.sage} color2={phaseColor} opacity={0.08} w={140} flip /></div>
      </div>

      {/* pinned central Jump-to (follows scroll) */}
      <button onClick={() => setJumpOpen(true)} aria-label="Jump to a section" style={{
        position: "fixed", top: "calc(10px + env(safe-area-inset-top))", left: 12, zIndex: 45,
        display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(244,239,227,0.92)", backdropFilter: "blur(6px)",
        border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "8px 13px", cursor: "pointer",
        fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.muted,
        boxShadow: "0 2px 10px rgba(58,44,26,0.12)",
      }}><Grid2x2 size={14} /> Jump to</button>

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* ── HERO — the cycle ring + phase bloom + carved heart + Ephesis title ──────────────────────── */}
        <header style={{ padding: "26px 18px 6px", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Circle size={13} color={T.muted} />
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted }}>Your health</span>
          </div>
          <div style={{ position: "relative", display: "flex", justifyContent: "center", margin: "2px 0 4px" }}>
            <CycleRing phase={phase} cycleDay={cycle.cycleDay} cycleLen={cycle.cycleLength || 28} hasCycle={hasCycle}>
              <RichBloomV2 form={heroForm} color={phaseColor} color2={lighten(phaseColor, 0.34)} accent={T.gold} size={120} animate soft idx="health-hero" />
            </CycleRing>
            <div style={{ position: "absolute", top: 8, right: 36 }}><Butterfly size={40} color={phaseColor} color2={T.gold} pattern="spots" idx="health-bf" /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 2 }}>
            <Heart size={17} />
            <Script size={46} color={T.ink}>Health</Script>
          </div>
          {hasCycle ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: T.paper, background: phaseColor, borderRadius: 999, padding: "3px 11px", textTransform: "uppercase" }}>Day {cycle.cycleDay} · {PHASE_LABEL[phase]}</span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>{season}</span>
            </div>
          ) : (
            <a href="/CycleSettings" style={{ display: "inline-block", marginTop: 8, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 13px" }}>Tell me where you are in your cycle</a>
          )}
          <Hand size={16} color={T.muted} style={{ display: "block", marginTop: 12, lineHeight: 1.5 }}>
            Health is one room, not the whole house — but it's a room that should know you. Here's where your body is today.
          </Hand>
        </header>

        {/* ── SUMMARY CARD — where your body is today ─────────────────────────────────────────────────── */}
        <div style={{ padding: "10px 18px 4px" }}>
          <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${phaseColor}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${phaseColor}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)" }}>
            <Frame4 variant="sprig" color={phaseColor} size={42} opacity={0.5} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                {ICON_DISC(Sparkles, phaseColor)}
                <Eyebrow color={phaseColor}>Where your body is today</Eyebrow>
                <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={PHASE_FLOWER[phase] || "camellia"} size={30} color={phaseColor} idx="sum-mb" /></span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 12px", ...CLAMP(5) }}>{summaryLine}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <SummaryChip Icon={Stethoscope} label="Note a symptom" onClick={() => jumpTo(1)} accent={phaseColor} />
                <SummaryChip Icon={Smile} label="Check in" onClick={() => jumpTo(3)} accent={T.sage} />
                <SummaryChip Icon={BookOpen} label="Read your letter" onClick={() => jumpTo(0)} accent={T.gold} />
              </div>
            </div>
          </div>
        </div>

        {/* ── the segmented section rail (the central switcher, in view) ──────────────────────────────── */}
        <div ref={sliderTopRef} className="hd-track" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "16px 18px 12px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c, i) => (
            <button key={c.key} onClick={() => goTo(i)} style={{
              flex: "none", background: i === active ? c.accent : "transparent", color: i === active ? T.paper : T.muted,
              border: `1px solid ${i === active ? c.accent : T.paperDeep}`, borderRadius: 999, padding: "6px 13px",
              fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}><c.Icon size={13} /> {c.section}</button>
          ))}
        </div>

        {/* ── the single horizontal slider (shared geometry) ─────────────────────────────────────────── */}
        <div ref={trackRef} className="hd-track" style={{ display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px 4px", WebkitOverflowScrolling: "touch" }}>
          {CARDS.map((c) => (
            <HealthCard key={c.key} card={c} uid={uid} cycle={cycle} />
          ))}
          <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 36)}px` }} aria-hidden />
        </div>

        {/* prev / dots / next */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 18px 0" }}>
          <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous section" style={navBtn(active === 0)}><ChevronLeft size={18} /></button>
          <div style={{ display: "flex", gap: 7 }}>
            {CARDS.map((c, i) => (
              <button key={c.key} onClick={() => goTo(i)} aria-label={c.section} style={{
                width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
                background: i === active ? c.accent : T.paperDeep, cursor: "pointer", transition: "width .2s",
              }} />
            ))}
          </div>
          <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next section" style={navBtn(active === last)}><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* ── JUMP-TO bottom-sheet (the canonical multi-layer switcher) ─────────────────────────────────── */}
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

// ── summary quick-chip ──────────────────────────────────────────────────────────────────────────
function SummaryChip({ Icon, label, onClick, accent }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 999, padding: "7px 13px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft, cursor: "pointer" }}>
      <Icon size={14} color={accent} /> {label}
    </button>
  );
}

// ── the section card ──────────────────────────────────────────────────────────────────────────────
function HealthCard({ card, uid, cycle }) {
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
          <Eyebrow color={a}>{card.tag || card.section}</Eyebrow>
          <span style={{ marginLeft: "auto" }}><FlowerGlyph variant={card.flower || "camellia"} size={30} color={a} idx={`mb-${card.key}`} /></span>
        </div>
        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 8px", lineHeight: 1.3, ...CLAMP(3) }}>{card.hook}</h3>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px", ...CLAMP(5) }}>{card.line}</p>
        <div style={{ marginTop: "auto", paddingTop: 6 }}>
          <InlineAction action={card.action} accent={a} uid={uid} cycle={cycle} />
          <a href={card.open.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none" }}>
            {card.open.label} <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── inline actions ────────────────────────────────────────────────────────────────────────────────
function btnStyle(accent, disabled) {
  return { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1, textDecoration: "none" };
}
function InlineAction({ action, accent, uid, cycle }) {
  const { type } = action || {};
  if (type === "deeplink") { const A = action.Icon || ChevronRight; return <a href={action.href} style={btnStyle(accent)}><A size={15} /> {action.label}</a>; }
  if (type === "chips") return <ChipsAction action={action} accent={accent} uid={uid} cycle={cycle} />;
  if (type === "mood") return <MoodAction action={action} accent={accent} uid={uid} />;
  return null;
}

function ChipsAction({ action, accent, uid, cycle }) {
  const [picked, setPicked] = useState([]);
  const [done, setDone] = useState(false);
  const toggle = (c) => setPicked((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const save = () => {
    if (!picked.length || done) return; setDone(true);
    if (uid) { const day = todayKey(); const ts = new Date().toISOString(); for (const s of picked) base44.entities.SymptomLogs.create({ user_id: uid, date: day, symptom_name: s, symptom_type: s, cycle_phase_at_log: cycle?.phase, created_at: ts, updated_at: ts }).catch(() => {}); }
  };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Noted, gently."} />;
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 11 }}>
        {action.chips.map((c) => { const on = picked.includes(c); return (
          <button key={c} onClick={() => toggle(c)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "8px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? accent : T.paperDeep}`, background: on ? accent : "transparent", color: on ? "#fff" : T.muted }}>{c}</button>
        ); })}
      </div>
      <button onClick={save} disabled={!picked.length} style={btnStyle(accent, !picked.length)}><Stethoscope size={15} /> {action.label}</button>
    </div>
  );
}

const MOODS = [
  { v: 5, label: "Good", Icon: Smile }, { v: 4, label: "Okay", Icon: Smile },
  { v: 3, label: "Meh", Icon: Circle }, { v: 2, label: "Low", Icon: Droplet }, { v: 1, label: "Rough", Icon: Leaf },
];
function MoodAction({ action, accent, uid }) {
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState(false);
  const save = () => {
    if (pick == null || done) return; setDone(true);
    if (uid) { const day = todayKey(); const m = MOODS.find((x) => x.v === pick); base44.entities.DailyCheckins.create({ user_id: uid, date: day, day_key: day, mood: pick, mood_label: m?.label, source: "health-demo" }).catch(() => {}); }
  };
  if (done) return <DoneRow accent={accent} label={action.doneLabel || "Logged."} />;
  return (
    <div>
      <div style={{ display: "flex", gap: 7, marginBottom: 11 }}>
        {MOODS.map((m) => { const on = pick === m.v; return (
          <button key={m.v} onClick={() => setPick(m.v)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "9px 2px", borderRadius: 12, cursor: "pointer", border: `1px solid ${on ? accent : T.paperDeep}`, background: on ? `${accent}1F` : "transparent" }}>
            <m.Icon size={18} color={on ? accent : T.muted} strokeWidth={1.8} />
            <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: on ? accent : T.muted }}>{m.label}</span>
          </button>
        ); })}
      </div>
      <button onClick={save} disabled={pick == null} style={btnStyle(accent, pick == null)}><Smile size={15} /> {action.label}</button>
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

// ── helpers ─────────────────────────────────────────────────────────────────────────────────────
function prettyStage(s) {
  const map = {
    teen: "Teen years", reproductive: "Reproductive years", "pre-ttc": "Before trying", ttc: "Trying to conceive",
    "pregnant-t1": "Pregnancy · first trimester", "pregnant-t2": "Pregnancy · second trimester", "pregnant-t3": "Pregnancy · third trimester",
    postpartum: "Postpartum", perimenopause: "Perimenopause", menopause: "Menopause", "post-menopause": "Post-menopause",
  };
  return map[s] || "Your life stage";
}
function navBtn(disabled) {
  return { width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : T.paperHi, color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 };
}

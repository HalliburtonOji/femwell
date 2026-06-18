// HealthDemo — a redesign DEMO of the Health page. PREVIEW route only (/HealthDemo, via IDEAS →
// Previews). LIVE /Health UNTOUCHED. Conforms to claude-state/BRAND_IDENTITY.md.
//
// DISTINCT FORM (deliberately NOT a card-slider): a VERTICAL EDITORIAL "LETTERS" page. Health's own
// metaphor is letters, so this reads like a magazine's contents + reading index — a LEFT-ALIGNED
// masthead with a compact, real CYCLE RING, two inline "today in your body" panels (note a symptom /
// check in), then a NUMBERED VERTICAL INDEX of the 7 health letters, then a slim list of the deeper
// care pages. Brand identity held constant (type, flora, carved heart, lush, sticky Jump-to, deep-links).

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_COLORS, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { floraKeyframes, FlowerGlyph, RichBloomV2, LeafDivider, lighten } from "@/components/brand/flora";
import {
  Loader, PageVines, JumpPill, JumpSheet, DoneRow, btnStyle, DEMO_CSS, CLAMP, withTimeout, todayKey,
} from "@/components/demos/demoKit";
import {
  Stethoscope, Smile, Circle, Droplet, Leaf, ChevronRight, Settings, Flower2, HeartPulse, TrendingUp,
  FileText, BookOpen,
} from "lucide-react";

const COL = 460;
const SEASON = { menstrual: "Inner Winter", follicular: "Inner Spring", ovulatory: "Inner Summer", luteal: "Inner Autumn" };
const PHASE_FORM = { menstrual: "poppy", follicular: "forget", ovulatory: "daisy", luteal: "peony" };
const PHASE_FLOWER = { menstrual: "poppy", follicular: "primrose", ovulatory: "sunflower", luteal: "dahlia" };

const LETTERS = [
  { id: "story", n: "I", title: "Your Story", sub: "Patterns only you can see", flower: "camellia" },
  { id: "cycle", n: "II", title: "Cycle & Life Stage", sub: "Where you are, and what it means", flower: "iris" },
  { id: "body", n: "III", title: "Body & Skin", sub: "What your body is telling you", flower: "rose" },
  { id: "mind", n: "IV", title: "Mind & Sleep", sub: "The cycling brain, and rest", flower: "lavender" },
  { id: "nourishment", n: "V", title: "Nourishment & Gut", sub: "Food, hormones and your microbiome", flower: "sunflower" },
  { id: "intimacy", n: "VI", title: "Intimacy", sub: "The conversation most apps skip", flower: "poppy" },
  { id: "care", n: "VII", title: "Your Care", sub: "Navigate the system like you own it", flower: "primrose" },
];
const CARE = [
  { key: "cycleset", label: "Cycle settings", sub: "Dates & average length", Icon: Settings, href: "/CycleSettings", accent: "#8E6E8E" },
  { key: "stage", label: "Life-stage care", sub: "Care for where you are", Icon: Flower2, href: "/LifeStageCare", accent: T.gold },
  { key: "body", label: "Body & skin", sub: "Read in cycle", Icon: HeartPulse, href: "/SkinHair", accent: T.blush },
  { key: "pulse", label: "Your patterns", sub: "What builds over time", Icon: TrendingUp, href: "/Pulse", accent: "#8E6E8E" },
  { key: "export", label: "Doctor export", sub: "One page for your GP", Icon: FileText, href: "/DoctorExport", accent: T.sage },
];
const SECTIONS = [
  { key: "today", label: "Today in your body", Icon: Stethoscope, accent: "#BC2E27" },
  { key: "letters", label: "Your letters", Icon: BookOpen, accent: "#A8893F" },
  { key: "care", label: "Deeper care", Icon: Flower2, accent: "#8FAF8F" },
];

function CycleRing({ phase, cycleDay, cycleLen = 28, hasCycle, size = 116, children }) {
  const r = 84, cx = 100, cy = 100, C = 2 * Math.PI * r;
  const spans = [
    { key: "menstrual", start: 1, len: 5 }, { key: "follicular", start: 6, len: 8 },
    { key: "ovulatory", start: 14, len: 3 }, { key: "luteal", start: 17, len: cycleLen - 16 },
  ];
  const markAng = (((Math.max(1, Math.min(cycleLen, cycleDay || 1)) - 1) / cycleLen) * 360) - 90;
  const mx = cx + r * Math.cos((markAng * Math.PI) / 180), my = cy + r * Math.sin((markAng * Math.PI) / 180);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.paperDeep} strokeWidth="7" opacity="0.55" />
        {hasCycle ? spans.map((s) => {
          const len = (s.len / cycleLen) * C, rot = ((s.start - 1) / cycleLen) * 360 - 90;
          return <circle key={s.key} cx={cx} cy={cy} r={r} fill="none" stroke={PHASE_COLORS[s.key]} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${Math.max(0, len - 6)} ${C}`} transform={`rotate(${rot} ${cx} ${cy})`} opacity={s.key === phase ? 0.95 : 0.4} />;
        }) : <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.gold} strokeWidth="2.5" strokeDasharray="3 7" opacity="0.5" />}
        {hasCycle && <circle cx={mx} cy={my} r="6.4" fill={PHASE_COLORS[phase] || T.gold} stroke="#FFFDF7" strokeWidth="2" />}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>{children}</div>
    </div>
  );
}

export default function HealthDemo() {
  useEditorialFonts();
  const [uid, setUid] = useState(null);
  const [profile, setProfile] = useState(null);
  const [symptoms, setSymptoms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);
  const refs = { today: useRef(null), letters: useRef(null), care: useRef(null) };

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me());
      const id = me?.id || null; if (!alive) return; setUid(id);
      if (!id) { setLoading(false); return; }
      const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: id }));
      if (!alive) return; setProfile((profs || []).filter(Boolean)[0] || null); setLoading(false);
      withTimeout(base44.entities.SymptomLogs.filter({ user_id: id }, "-date", 60)).then((rows) => { if (alive) setSymptoms((rows || []).filter(Boolean)); }).catch(() => {});
    })();
    return () => { alive = false; };
  }, []);

  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const phase = cycle.phase;
  const phaseColor = PHASE_COLORS[phase] || T.sage;
  const season = SEASON[phase] || "your season";

  const recent = useMemo(() => {
    if (!symptoms) return null;
    const cut = Date.now() - 7 * 86400000; const tally = {};
    for (const s of symptoms) { const d = s.date ? new Date(s.date).getTime() : 0; if (d && d >= cut) { const k = (s.symptom_name || s.symptom_type || "").replace(/_/g, " ").toLowerCase(); if (k) tally[k] = (tally[k] || 0) + 1; } }
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { count: Object.values(tally).reduce((a, b) => a + b, 0), top };
  }, [symptoms]);
  const PHASE_LINE = {
    menstrual: "Warmth, iron and rest suit today — your body's doing quiet, real work.",
    follicular: "Energy's returning — a good week to begin and to ask your body what it wants.",
    ovulatory: "You're at your most outward — skin and mood often lift now.",
    luteal: "Things turn inward — cravings and a shorter fuse are biology, not failing.",
  };
  const todayLine = recent && recent.count > 0
    ? `This week: ${recent.top.map(([n, c]) => `${n}${c > 1 ? ` ×${c}` : ""}`).join(", ")}. ${PHASE_LINE[phase] || ""}`
    : (PHASE_LINE[phase] || "Tell me where you are in your cycle and your letters shape to you.");

  const jumpTo = (k) => { setJumpOpen(false); refs[k]?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 120, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <PageVines a={phaseColor} b={T.gold} />
      <JumpPill onClick={() => setJumpOpen(true)} />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 18px" }}>
        {/* MASTHEAD — left-aligned editorial with a compact real cycle ring */}
        <header style={{ display: "flex", alignItems: "center", gap: 16, padding: "26px 0 6px" }}>
          <CycleRing phase={phase} cycleDay={cycle.cycleDay} cycleLen={cycle.cycleLength || 28} hasCycle={hasCycle} size={116}>
            <RichBloomV2 form={PHASE_FORM[phase] || "peony"} color={phaseColor} color2={lighten(phaseColor, 0.34)} accent={T.gold} size={66} animate soft idx="hl-hero" />
          </CycleRing>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Heart size={16} /><Eyebrow color={T.muted}>Your health, in letters</Eyebrow>
            </div>
            <Script size={44} color={T.ink} style={{ margin: "2px 0 2px" }}>Health</Script>
            {hasCycle ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: T.paper, background: phaseColor, borderRadius: 999, padding: "3px 11px", textTransform: "uppercase" }}>Day {cycle.cycleDay} · {PHASE_LABEL[phase]}</span>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.inkSoft }}>{season}</span>
              </div>
            ) : <a href="/CycleSettings" style={pillLink}>Set your cycle</a>}
          </div>
        </header>
        <Hand size={16} color={T.muted} style={{ display: "block", margin: "4px 0 8px", lineHeight: 1.5 }}>
          Health is one room, not the whole house — but it's a room that should know you. Here's where your body is today.
        </Hand>

        {/* TODAY IN YOUR BODY */}
        <SectionHead refEl={refs.today} eyebrow="Today" title="In your body" accent={phaseColor} flower={PHASE_FLOWER[phase]} />
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 14px" }}>{todayLine}</p>
        <Panel accent={phaseColor} title="Note something" Icon={Stethoscope}>
          <ChipsAction accent={phaseColor} uid={uid} cycle={cycle} />
        </Panel>
        <Panel accent={T.sage} title="Today's check-in" Icon={Smile}>
          <MoodAction accent={T.sage} uid={uid} />
        </Panel>

        {/* YOUR LETTERS — numbered vertical editorial index */}
        <SectionHead refEl={refs.letters} eyebrow="Seven letters" title="Your letters" accent={T.gold} flower="camellia" />
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 8px" }}>
          The letter most health apps don't write — phase-aware, never clinical. Read whichever's speaking to you.
        </p>
        <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(58,44,26,0.10)" }}>
          {LETTERS.map((L, i) => (
            <a key={L.id} href="/Health" style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", textDecoration: "none", borderTop: i ? `1px solid ${T.paperDeep}` : "none" }}>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, fontWeight: 600, color: T.gold, width: 26, textAlign: "center", flexShrink: 0 }}>{L.n}</span>
              <FlowerGlyph variant={L.flower} size={30} color={i === 1 ? phaseColor : T.gold} idx={`hl-l-${L.id}`} />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, lineHeight: 1.25, ...CLAMP(1) }}>{L.title}</span>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 15, color: T.muted, lineHeight: 1.35, ...CLAMP(1) }}>{L.sub}</span>
              </span>
              <ChevronRight size={16} color={T.muted} style={{ flexShrink: 0 }} />
            </a>
          ))}
        </div>

        {/* DEEPER CARE — slim vertical link rows to the real sub-pages */}
        <SectionHead refEl={refs.care} eyebrow="Beyond the letters" title="Deeper care" accent={T.sage} flower="primrose" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CARE.map((c) => (
            <a key={c.key} href={c.href} style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.accent}`, borderRadius: 14, padding: "13px 15px", textDecoration: "none" }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><c.Icon size={17} color={c.accent} /></span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, ...CLAMP(1) }}>{c.label}</span>
                <span style={{ display: "block", fontFamily: UI, fontSize: 13, color: T.muted, ...CLAMP(1) }}>{c.sub}</span>
              </span>
              <ChevronRight size={16} color={T.muted} style={{ flexShrink: 0 }} />
            </a>
          ))}
        </div>
        <LeafDivider color={T.gold} my={26} />
      </div>

      {jumpOpen && <JumpSheet sections={SECTIONS} onClose={() => setJumpOpen(false)} onPick={(k) => jumpTo(k)} />}
    </div>
  );
}

function SectionHead({ refEl, eyebrow, title, accent, flower }) {
  return (
    <div ref={refEl} style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0 10px", scrollMarginTop: 70 }}>
      <FlowerGlyph variant={flower || "camellia"} size={30} color={accent} idx={`sh-${title}`} />
      <div style={{ minWidth: 0 }}>
        <Eyebrow color={accent}>{eyebrow}</Eyebrow>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, fontWeight: 600, color: T.ink, lineHeight: 1.2, display: "block" }}>{title}</span>
      </div>
      <span style={{ flex: 1, height: 1, background: T.paperDeep, opacity: 0.7, marginLeft: 6 }} />
    </div>
  );
}
function Panel({ accent, title, Icon, children }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}10 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`, borderRadius: 16, padding: "15px 16px", marginBottom: 12, boxShadow: "0 2px 12px rgba(58,44,26,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><Icon size={15} color={accent} /></span>
        <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ChipsAction({ accent, uid, cycle }) {
  const CHIPS = ["Cramps", "Low mood", "Tired", "Headache", "Tender", "Bloated", "Calm"];
  const [picked, setPicked] = useState([]); const [done, setDone] = useState(false);
  const toggle = (c) => setPicked((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const save = () => { if (!picked.length || done) return; setDone(true); if (uid) { const day = todayKey(); const ts = new Date().toISOString(); for (const s of picked) base44.entities.SymptomLogs.create({ user_id: uid, date: day, symptom_name: s, symptom_type: s, cycle_phase_at_log: cycle?.phase, created_at: ts, updated_at: ts }).catch(() => {}); } };
  if (done) return <DoneRow accent={accent} label="Noted, gently." />;
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 11 }}>
        {CHIPS.map((c) => { const on = picked.includes(c); return <button key={c} onClick={() => toggle(c)} style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, padding: "8px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? accent : T.paperDeep}`, background: on ? accent : "transparent", color: on ? "#fff" : T.muted }}>{c}</button>; })}
      </div>
      <button onClick={save} disabled={!picked.length} style={btnStyle(accent, !picked.length)}><Stethoscope size={15} /> Save the note</button>
    </div>
  );
}
const MOODS = [{ v: 5, label: "Good", Icon: Smile }, { v: 4, label: "Okay", Icon: Smile }, { v: 3, label: "Meh", Icon: Circle }, { v: 2, label: "Low", Icon: Droplet }, { v: 1, label: "Rough", Icon: Leaf }];
function MoodAction({ accent, uid }) {
  const [pick, setPick] = useState(null); const [done, setDone] = useState(false);
  const save = () => { if (pick == null || done) return; setDone(true); if (uid) { const day = todayKey(); const m = MOODS.find((x) => x.v === pick); base44.entities.DailyCheckins.create({ user_id: uid, date: day, day_key: day, mood: pick, mood_label: m?.label, source: "health-demo" }).catch(() => {}); } };
  if (done) return <DoneRow accent={accent} label="Logged. That counts as showing up." />;
  return (
    <div>
      <div style={{ display: "flex", gap: 7, marginBottom: 11 }}>
        {MOODS.map((m) => { const on = pick === m.v; return <button key={m.v} onClick={() => setPick(m.v)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "9px 2px", borderRadius: 12, cursor: "pointer", border: `1px solid ${on ? accent : T.paperDeep}`, background: on ? `${accent}1F` : "transparent" }}><m.Icon size={18} color={on ? accent : T.muted} strokeWidth={1.8} /><span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: on ? accent : T.muted }}>{m.label}</span></button>; })}
      </div>
      <button onClick={save} disabled={pick == null} style={btnStyle(accent, pick == null)}><Smile size={15} /> Save check-in</button>
    </div>
  );
}

const pillLink = { display: "inline-block", marginTop: 4, fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, textDecoration: "none", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 13px" };

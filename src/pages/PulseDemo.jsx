// PulseDemo — a redesign DEMO of the Pulse page (patterns / trends / insights). PREVIEW route only
// (/PulseDemo). LIVE /Pulse UNTOUCHED. Conforms to BRAND_IDENTITY.md (Pulse flora character = plum).
//
// DISTINCT FORM (an INSIGHT DASHBOARD — not a slider/list/grid-of-links/scene/chat): a narrative "your
// week" lead card, then a varied grid of small DATA-VIZ tiles drawn from REAL data — a mood sparkline,
// top-pattern mini-bars, a logging-consistency dot row, a phase tile. No scores, just shape. Brand held
// constant (type scale, flora, carved heart, lush, sticky Jump-to, deep-links).

import { useState, useEffect, useMemo, useRef } from "react";
import {
  T, SERIF, UI, PAPER_BG, Heart, Eyebrow, Script, Hand, InkFilter, useEditorialFonts,
  PHASE_COLORS, PHASE_LABEL,
} from "@/components/journal/Editorial";
import { base44 } from "@/api/base44Client";
import { computeCycleDay } from "@/hooks/useCycleDay";
import { floraKeyframes, FlowerGlyph } from "@/components/brand/flora";
import { Loader, PageVines, JumpPill, JumpSheet, DEMO_CSS, CLAMP, withTimeout } from "@/components/demos/demoKit";
import { TrendingUp, Activity, Sparkles, CalendarHeart, Smile, Flower2 } from "lucide-react";

const COL = 480;
const PLUM = "#8E6E8E";

const SECTIONS = [
  { key: "week", label: "Your week", Icon: Sparkles, accent: PLUM },
  { key: "cycle", label: "Cycle", Icon: CalendarHeart, accent: "#BC2E27" },
  { key: "mood", label: "Mood & energy", Icon: Smile, accent: "#8FAF8F" },
  { key: "patterns", label: "Patterns", Icon: TrendingUp, accent: "#A8893F" },
];

export default function PulseDemo() {
  useEditorialFonts();
  const [profile, setProfile] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [checkins, setCheckins] = useState(null);
  const [symptoms, setSymptoms] = useState(null);
  const [habits, setHabits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);
  const refs = { week: useRef(null), cycle: useRef(null), mood: useRef(null), patterns: useRef(null) };

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await withTimeout(base44.auth.me()); const id = me?.id || null;
      if (!id) { if (alive) setLoading(false); return; }
      const profs = await withTimeout(base44.entities.UserProfile.filter({ user_id: id }));
      if (!alive) return; setProfile((profs || []).filter(Boolean)[0] || null); setLoading(false);
      withTimeout(base44.entities.WeeklyInsights.filter({ user_id: id }, "-week_start", 1)).then((r) => { if (alive) setWeekly((r || []).filter(Boolean)[0] || null); }).catch(() => {});
      withTimeout(base44.entities.DailyCheckins.filter({ user_id: id }, "-date", 21)).then((r) => { if (alive) setCheckins((r || []).filter(Boolean)); }).catch(() => {});
      withTimeout(base44.entities.SymptomLogs.filter({ user_id: id }, "-date", 80)).then((r) => { if (alive) setSymptoms((r || []).filter(Boolean)); }).catch(() => {});
      withTimeout(base44.entities.HabitLogs.filter({ user_id: id }, "-date", 60)).then((r) => { if (alive) setHabits((r || []).filter(Boolean)); }).catch(() => {});
    })();
    return () => { alive = false; };
  }, []);

  const cycle = useMemo(() => computeCycleDay(profile), [profile]);
  const hasCycle = !!profile?.last_period_start_date;
  const phase = cycle.phase;
  const phaseColor = PHASE_COLORS[phase] || PLUM;

  const moodSeries = useMemo(() => {
    if (!checkins) return [];
    return checkins.slice(0, 14).map((c) => Number(c.mood ?? c.mood_score ?? c.energy ?? 0)).filter((n) => Number.isFinite(n) && n > 0).reverse();
  }, [checkins]);
  const energySeries = useMemo(() => {
    if (!checkins) return [];
    return checkins.slice(0, 14).map((c) => Number(c.energy ?? c.energy_level ?? 0)).filter((n) => Number.isFinite(n) && n > 0).reverse();
  }, [checkins]);

  const topSymptoms = useMemo(() => {
    if (weekly?.top_symptoms?.length) return weekly.top_symptoms.slice(0, 4).map((s) => ({ name: String(s).replace(/_/g, " "), n: 1 }));
    if (!symptoms) return [];
    const cut = Date.now() - 30 * 86400000; const tally = {};
    for (const s of symptoms) { const d = s.date ? new Date(s.date).getTime() : 0; if (d && d >= cut) { const k = (s.symptom_name || s.symptom_type || "").replace(/_/g, " ").toLowerCase(); if (k) tally[k] = (tally[k] || 0) + 1; } }
    return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, n]) => ({ name, n }));
  }, [weekly, symptoms]);

  const consistency = useMemo(() => {
    const days = new Set();
    const add = (rows, f) => (rows || []).forEach((r) => { const d = r?.[f] || r?.date || r?.created_date; if (d) { const t = new Date(d); if (Date.now() - t.getTime() < 14 * 86400000) days.add(t.toDateString()); } });
    add(checkins, "date"); add(symptoms, "date"); add(habits, "date");
    return days.size;
  }, [checkins, symptoms, habits]);

  const patternLine = weekly?.structured_summary?.your_pattern || weekly?.insight_text
    || (topSymptoms.length ? `Over the last month your most-noted signals were ${topSymptoms.slice(0, 2).map((s) => s.name).join(" and ")}. The more you log, the clearer the shape.`
      : "Log a few days and your weekly shape surfaces here — never scores, never guilt, just your own pattern, gently read.");

  const jumpTo = (k) => { setJumpOpen(false); refs[k]?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  if (loading) return <Loader />;

  return (
    <div className="fwc-anim" style={{ ...PAPER_BG, minHeight: "100vh", color: T.ink, paddingBottom: 130, position: "relative", overflowX: "clip" }}>
      <InkFilter />
      <style>{DEMO_CSS}{floraKeyframes}</style>
      <PageVines a={PLUM} b={T.gold} />
      <JumpPill onClick={() => setJumpOpen(true)} />

      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 18px" }}>
        {/* masthead */}
        <header style={{ display: "flex", alignItems: "center", gap: 11, padding: "26px 0 8px" }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}><TrendingUp size={24} color={PLUM} strokeWidth={1.7} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Heart size={15} /><Eyebrow color={T.muted}>Your patterns</Eyebrow></div>
            <Script size={42} color={T.ink}>Pulse</Script>
          </div>
          <span style={{ marginLeft: "auto" }}><FlowerGlyph variant="dahlia" size={40} color={PLUM} idx="pulse-mb" /></span>
        </header>

        {/* LEAD narrative */}
        <div ref={refs.week} style={{ position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${PLUM}16 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${PLUM}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 4px 20px rgba(58,44,26,0.12)", scrollMarginTop: 70 }}>
          <Eyebrow color={PLUM}>Your week, gently read</Eyebrow>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.inkSoft, lineHeight: 1.5, margin: "6px 0 0", ...CLAMP(5) }}>{patternLine}</p>
        </div>
        <Hand size={16} color={T.muted} style={{ display: "block", margin: "12px 2px 4px", lineHeight: 1.5 }}>
          No scores, no streaks to break — just the shape of your weeks, so you can see yourself clearly.
        </Hand>

        {/* DASHBOARD GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          {/* cycle tile */}
          <Tile refEl={refs.cycle} accent={phaseColor} icon={CalendarHeart} label="Where you are">
            {hasCycle ? (
              <div>
                <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>Day {cycle.cycleDay}</div>
                <div style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: phaseColor, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{PHASE_LABEL[phase]}</div>
                <PhaseDots phase={phase} />
              </div>
            ) : <Empty label="Set your cycle to see phase patterns" href="/CycleSettings" />}
          </Tile>

          {/* consistency tile */}
          <Tile accent={T.sage} icon={Activity} label="Showing up">
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{consistency}<span style={{ fontSize: 15, color: T.muted }}> / 14 days</span></div>
            <div style={{ fontFamily: UI, fontSize: 13, color: T.muted, margin: "3px 0 8px" }}>logged something</div>
            <DotStreak total={14} active={consistency} accent={T.sage} />
          </Tile>

          {/* mood sparkline — full width */}
          <Tile refEl={refs.mood} accent="#8FAF8F" icon={Smile} label="Mood & energy" wide>
            {moodSeries.length >= 2 ? (
              <div>
                <Spark values={moodSeries} accent={PLUM} label="Mood" />
                {energySeries.length >= 2 && <Spark values={energySeries} accent="#8FAF8F" label="Energy" />}
                <div style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 6 }}>Last {Math.max(moodSeries.length, energySeries.length)} check-ins · oldest → newest</div>
              </div>
            ) : <Empty label="A few check-ins and your trend draws itself here" href="/Track" />}
          </Tile>

          {/* patterns — full width */}
          <Tile refEl={refs.patterns} accent={T.gold} icon={TrendingUp} label="What keeps coming up" wide>
            {topSymptoms.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 4 }}>
                {topSymptoms.map((s, i) => <BarRow key={s.name} label={s.name} value={s.n} max={topSymptoms[0].n} accent={i === 0 ? T.crimson : T.gold} />)}
              </div>
            ) : <Empty label="Note a few symptoms and your top patterns surface here" href="/Track" />}
          </Tile>
        </div>

        <a href="/Pulse" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", boxSizing: "border-box", background: PLUM, color: "#fff", border: "none", borderRadius: 14, padding: "14px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, textDecoration: "none", marginTop: 16 }}>
          <Flower2 size={15} /> See your full Pulse
        </a>
      </div>

      {jumpOpen && <JumpSheet sections={SECTIONS} onClose={() => setJumpOpen(false)} onPick={(k) => jumpTo(k)} />}
    </div>
  );
}

function Tile({ refEl, accent, icon: Icon, label, wide, children }) {
  return (
    <div ref={refEl} style={{ gridColumn: wide ? "1 / -1" : "auto", position: "relative", overflow: "hidden", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}10 100%)`, border: `1px solid ${T.paperDeep}`, borderTop: `3px solid ${accent}`, borderRadius: 16, padding: "14px 15px", boxShadow: "0 2px 12px rgba(58,44,26,0.08)", scrollMarginTop: 70 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><Icon size={14} color={accent} /></span>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent }}>{label}</span>
      </div>
      {children}
    </div>
  );
}
function Empty({ label, href }) {
  return <a href={href} style={{ display: "block", fontFamily: SERIF, fontSize: 15, fontStyle: "italic", color: T.muted, textDecoration: "none", lineHeight: 1.4 }}>{label} ›</a>;
}
function Spark({ values, accent, label }) {
  const w = 300, h = 40, pad = 3;
  const max = Math.max(...values, 5), min = Math.min(...values, 1);
  const span = Math.max(1, max - min);
  const pts = values.map((v, i) => { const x = pad + (i / (values.length - 1)) * (w - pad * 2); const y = h - pad - ((v - min) / span) * (h - pad * 2); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ");
  const lastX = pad + (w - pad * 2), lastY = h - pad - ((values[values.length - 1] - min) / span) * (h - pad * 2);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
      <span style={{ width: 52, fontFamily: UI, fontSize: 12, fontWeight: 700, color: accent, flexShrink: 0 }}>{label}</span>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="40" preserveAspectRatio="none" aria-hidden style={{ overflow: "visible" }}>
        <polyline points={pts} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastX} cy={lastY} r="3.4" fill={accent} />
      </svg>
    </div>
  );
}
function BarRow({ label, value, max, accent }) {
  const pct = Math.max(8, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, textTransform: "capitalize", ...CLAMP(1) }}>{label}</span>
        <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: accent }}>{value > 1 ? `×${value}` : ""}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: accent, borderRadius: 999 }} />
      </div>
    </div>
  );
}
function DotStreak({ total, active, accent }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {Array.from({ length: total }).map((_, i) => <span key={i} style={{ width: 12, height: 12, borderRadius: 4, background: i < active ? accent : T.paper, border: `1px solid ${i < active ? accent : T.paperDeep}` }} />)}
    </div>
  );
}
function PhaseDots({ phase }) {
  const PH = ["menstrual", "follicular", "ovulatory", "luteal"];
  return (
    <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
      {PH.map((p) => <span key={p} style={{ flex: 1, height: 6, borderRadius: 999, background: p === phase ? PHASE_COLORS[p] : `${PHASE_COLORS[p]}44` }} />)}
    </div>
  );
}

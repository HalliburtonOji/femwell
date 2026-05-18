import { useState } from "react";
import BiorhythmTimeline from "@/components/BiorhythmTimeline";
import MissionControl from "@/components/MissionControl";
import AccordionPlanner from "@/components/AccordionPlanner";
import MorningDashboard from "@/components/MorningDashboard";
import JournalDemo from "@/components/JournalDemo";

// ─────────────────────────────────────────────────────────────────────────────
// /Ideas — interactive design lab. 4 candidate Planner reskins.
// Each demo replicates the REAL Planner.jsx component order with mocked data,
// then applies a design system. Layout, structure and field shapes match the
// live app — this is reskin, not redesign.
//
//   1. Le Menu × Phase Sun    — ready ✅
//   2. The Interior           — coming soon
//   3. The Library            — coming soon
//   4. The Garden             — coming soon
//
// Mock data: Sat 16 May 2026, cycle Day 22 / 28, Luteal, 6 days to Period,
// 4 cycles observed @ 84% confidence.
// ─────────────────────────────────────────────────────────────────────────────

const pick = (name) => () =>
  window.alert(`Great — tell Dispatch: "${name}"`);

// ─────────────────────────────────────────────────────────────────────────────
// Shared mock data — shapes match real entities so reskins stay structurally
// honest to the production components.
// ─────────────────────────────────────────────────────────────────────────────

// Canonical data references — mirrored across components.
//   Today          = Sat 16 May 2026
//   Cycle start    = Apr 25 → Day 22 today, Period predicted Fri 22 May
//   Sleep 7.2h · Energy 68% · Mood 60% · Hydration 6/8 · Movement 20min
//   Confidence 84% · 4 cycles observed

const MOCK_HERO = {
  headline: "A softer landing this week",
  body: "Luteal days often invite a different pace — depth over breadth, careful over many. The body's narrowing for a reason.",
};

const MOCK_STORY_CARDS = [
  { kind: "daily-story", eyebrow: "DAILY STORY · DAY 22", title: "Tonight's tea ritual", meta: "100-word read" },
  { kind: "lifestyle",   eyebrow: "ARTICLE",              title: "Slow walks for luteal afternoons",   meta: "Mindful · 2d ago" },
  { kind: "lifestyle",   eyebrow: "PODCAST",              title: "The second cup of tea",              meta: "On Being · 1d ago" },
  { kind: "lifestyle",   eyebrow: "ARTICLE",              title: "Why we crave warm grains",           meta: "Vogue · 3d ago" },
  { kind: "lifestyle",   eyebrow: "FICTION CHAPTER",      title: "The Long Room · Chapter 22",         meta: "Daily Story · today" },
];

const MOCK_RHYTHMS = [
  { name: "Luteal Softness", sub: "6 rituals · 6 of 9 kept",  pct: 67, active: true },
  { name: "Warm Cycle",      sub: "Slow walks · daily",        pct: 86, active: false },
  { name: "Quiet Practice",  sub: "Meditation · 10 min",       pct: 42, active: false },
];

// Build the Cycle ribbon's month view — May 2026, Mon-start, 5 weeks.
// May 1 2026 = Friday, so Apr 27 (Mon) leads the first row.
// Phases mapped from cycle Day 1 = Apr 25.
function mockMonthWeeks() {
  const weeks = [];
  // Week 1: Apr 27, 28, 29, 30, May 1, 2, 3
  weeks.push([
    { m: 4, d: 27, isOff: true,  phase: "menstrual" },
    { m: 4, d: 28, isOff: true,  phase: "menstrual" },
    { m: 4, d: 29, isOff: true,  phase: "menstrual" },
    { m: 4, d: 30, isOff: true,  phase: "follicular" },
    { m: 5, d: 1,  isOff: false, phase: "follicular" },
    { m: 5, d: 2,  isOff: false, phase: "follicular" },
    { m: 5, d: 3,  isOff: false, phase: "follicular" },
  ]);
  // Week 2: May 4-10
  weeks.push([
    { m: 5, d: 4,  isOff: false, phase: "follicular" },
    { m: 5, d: 5,  isOff: false, phase: "follicular" },
    { m: 5, d: 6,  isOff: false, phase: "follicular" },
    { m: 5, d: 7,  isOff: false, phase: "ovulatory" },
    { m: 5, d: 8,  isOff: false, phase: "ovulatory" },
    { m: 5, d: 9,  isOff: false, phase: "ovulatory" },
    { m: 5, d: 10, isOff: false, phase: "luteal" },
  ]);
  // Week 3: May 11-17 (Today = May 16, Saturday, position 5)
  weeks.push([
    { m: 5, d: 11, isOff: false, phase: "luteal" },
    { m: 5, d: 12, isOff: false, phase: "luteal" },
    { m: 5, d: 13, isOff: false, phase: "luteal" },
    { m: 5, d: 14, isOff: false, phase: "luteal" },
    { m: 5, d: 15, isOff: false, phase: "luteal" },
    { m: 5, d: 16, isOff: false, phase: "luteal", today: true },
    { m: 5, d: 17, isOff: false, phase: "luteal" },
  ]);
  // Week 4: May 18-24
  weeks.push([
    { m: 5, d: 18, isOff: false, phase: "luteal" },
    { m: 5, d: 19, isOff: false, phase: "luteal" },
    { m: 5, d: 20, isOff: false, phase: "luteal" },
    { m: 5, d: 21, isOff: false, phase: "luteal" },
    { m: 5, d: 22, isOff: false, phase: "predicted" },
    { m: 5, d: 23, isOff: false, phase: "predicted" },
    { m: 5, d: 24, isOff: false, phase: "predicted" },
  ]);
  // Week 5: May 25-31
  weeks.push([
    { m: 5, d: 25, isOff: false, phase: "predicted" },
    { m: 5, d: 26, isOff: false, phase: "predicted" },
    { m: 5, d: 27, isOff: false, phase: "follicular" },
    { m: 5, d: 28, isOff: false, phase: "follicular" },
    { m: 5, d: 29, isOff: false, phase: "follicular" },
    { m: 5, d: 30, isOff: false, phase: "follicular" },
    { m: 5, d: 31, isOff: false, phase: "follicular" },
  ]);
  return weeks;
}

const MOCK_WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// Selected-day "crumb" copy (mirrors real selectedCrumbToday / selectedCrumbCycle)
const MOCK_TODAY_CRUMB = "A small luteal afternoon — softness over throughput.";
const MOCK_CYCLE_CRUMB = "May at a glance — luteal week of twenty-eight.";

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN 1 — Le Menu × Phase Sun (reskin of the real Planner)
// ═══════════════════════════════════════════════════════════════════════════

const LM = {
  // Le Menu palette — cream paper, espresso ink. Replaces the live --ivory.
  bg:          "#F4EDDB",
  paper:       "#FBF6E6",
  paperDeep:   "#EDE2C4",
  surface:     "#FFFCF1",
  espresso:    "#3A2C1A",
  espressoMid: "#6B5840",
  espressoMute:"#8A7458",
  hairline:    "rgba(58,44,26,0.16)",
  hairlineLight:"rgba(58,44,26,0.08)",
  rose:        "#B84A41",      // Femwell rose, kept as the system accent
  gold:        "#A6862B",
  // Saturated phase palette — the Le Menu signature move.
  phase: {
    menstrual:  "#9A2845",
    follicular: "#D4745A",
    ovulatory:  "#C8A040",
    luteal:     "#7B5E9A",
    predicted:  "#4A2868",
    off:        "#E5D9BD",
  },
  phaseNice: {
    menstrual:  "Period",
    follicular: "Follicular",
    ovulatory:  "Ovulatory",
    luteal:     "Luteal",
    predicted:  "Predicted",
  },
};

// ─── PhaseSun — illustrated SVG. 12 rays in the phase colour. ───────────────
function PhaseSun({ phase = "luteal", size = 72 }) {
  const c = LM.phase[phase];
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true">
      <defs>
        <radialGradient id={`lm-sun-${phase}`} cx="50%" cy="48%" r="50%">
          <stop offset="0%"  stopColor="#FBF6E6"/>
          <stop offset="65%" stopColor="#F4E8C8"/>
          <stop offset="100%" stopColor="#E8D49E"/>
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = 36 + Math.cos(a) * 21;
        const y1 = 36 + Math.sin(a) * 21;
        const x2 = 36 + Math.cos(a) * 34;
        const y2 = 36 + Math.sin(a) * 34;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="1.6" strokeLinecap="round"/>;
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = ((i + 0.5) / 12) * Math.PI * 2;
        const x1 = 36 + Math.cos(a) * 25;
        const y1 = 36 + Math.sin(a) * 25;
        const x2 = 36 + Math.cos(a) * 30;
        const y2 = 36 + Math.sin(a) * 30;
        return <line key={`t${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="0.9" strokeOpacity="0.55" strokeLinecap="round"/>;
      })}
      <circle cx="36" cy="36" r="16" fill={`url(#lm-sun-${phase})`} stroke={c} strokeWidth="0.6" strokeOpacity="0.7"/>
    </svg>
  );
}

// ─── Sticky header (eyebrow + h1 + phase line + crumb + tabs + week strip)──
function LM_StickyHeader({ view, setView }) {
  const phaseC = LM.phase.luteal;
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 5,
      padding: "20px 18px 12px",
      backgroundColor: "rgba(244,237,219,0.97)",
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${LM.hairlineLight}`,
    }}>
      <p style={{
        fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.18em", color: LM.espressoMid,
        fontFamily: "'Inter', sans-serif", margin: 0,
      }}>
        {view === "cycle" ? "Your cycle" : "Today · Saturday 16 May"}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "4px 0 4px" }}>
        <h1 style={{
          fontSize: 30, fontWeight: 500, fontFamily: "'Fraunces', Georgia, serif",
          color: LM.espresso, letterSpacing: "-0.018em", margin: 0,
        }}>
          {view === "cycle" ? "Cycle" : "Today"}
        </h1>
        {/* Confidence pill (Le Menu styling) */}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 9px", borderRadius: 9999,
          background: LM.paper, border: `0.5px solid ${LM.hairline}`,
          fontFamily: "'Inter', sans-serif", fontSize: 10.5,
          fontWeight: 600, color: LM.espressoMid, letterSpacing: "0.04em",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: phaseC }}/>
          84% · 4 cycles
        </span>
      </div>
      <p style={{
        fontSize: 12, color: LM.espressoMid,
        fontFamily: "'Inter', sans-serif", margin: "0 0 4px",
      }}>
        Day 22 · <span style={{ color: phaseC, fontWeight: 700 }}>Luteal</span>
      </p>
      <p style={{
        fontSize: 11.5, fontStyle: "italic", color: LM.espressoMute,
        fontFamily: "'Inter', sans-serif", margin: "0 0 10px", lineHeight: 1.45,
      }}>
        {view === "cycle" ? MOCK_CYCLE_CRUMB : MOCK_TODAY_CRUMB}
      </p>

      {/* Segmented tabs — Le Menu treatment */}
      <div style={{
        display: "inline-flex", gap: 4, padding: 4, borderRadius: 9999,
        border: `0.5px solid ${LM.hairline}`, background: LM.surface,
      }}>
        {["today", "cycle"].map((id) => {
          const active = id === view;
          return (
            <button
              key={id} onClick={() => setView(id)}
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12,
                letterSpacing: "0.04em",
                padding: "7px 22px", borderRadius: 9999, border: "none",
                cursor: "pointer", minWidth: 80, textAlign: "center",
                background: active ? LM.espresso : "transparent",
                color: active ? LM.bg : LM.espressoMid,
                fontWeight: active ? 700 : 600,
                transition: "background 140ms, color 140ms",
              }}
            >
              {id === "today" ? "Today" : "Cycle"}
            </button>
          );
        })}
      </div>

      {/* Week strip (Today view only) */}
      {view === "today" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14 }}>
          <button style={chevSmall}>‹</button>
          <div style={{ display: "flex", gap: 4, flex: 1, justifyContent: "space-between" }}>
            {[11, 12, 13, 14, 15, 16, 17].map((d, i) => {
              const sel = d === 16; // today selected
              return (
                <button key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 2, padding: "8px 4px", borderRadius: 11, flex: 1,
                  border: "none", cursor: "pointer",
                  background: sel ? LM.espresso : (d === 16 ? "rgba(184,74,65,0.10)" : "transparent"),
                  transition: "background 120ms",
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                    color: sel ? LM.bg : LM.espressoMute,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>{MOCK_WEEKDAYS[i].slice(0, 3)}</span>
                  <span style={{
                    fontSize: 15, fontWeight: 600, fontFamily: "'Fraunces', Georgia, serif",
                    color: sel ? LM.bg : LM.espresso,
                  }}>{d}</span>
                  <span style={{
                    width: 5, height: 5, borderRadius: 9999,
                    background: LM.phase.luteal, opacity: sel ? 1 : 0.85,
                  }}/>
                </button>
              );
            })}
          </div>
          <button style={chevSmall}>›</button>
        </div>
      )}
    </div>
  );
}

const chevSmall = {
  width: 26, height: 26, borderRadius: 9999,
  border: `0.5px solid ${LM.hairline}`,
  background: LM.surface, color: LM.espressoMid,
  fontFamily: "'Fraunces', serif", fontSize: 16, lineHeight: 1,
  cursor: "pointer", padding: 0, flexShrink: 0,
};

// ─── Bottom nav ─────────────────────────────────────────────────────────────
function LM_BottomNav() {
  const slots = [
    { kind: "today",  label: "Today" },
    { kind: "book",   label: "Lifestyle" },
    { kind: "spark",  label: "Jess", fab: true },
    { kind: "user",   label: "Profile" },
    { kind: "menu",   label: "Menu" },
  ];
  const Icon = ({ kind }) => {
    if (kind === "today") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/></svg>;
    if (kind === "book") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4h7a3 3 0 013 3v13M20 4h-7a3 3 0 00-3 3v13M4 4v15h6M20 4v15h-6"/></svg>;
    if (kind === "spark") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FBF6E6" strokeWidth="1.7"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/></svg>;
    if (kind === "user") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>;
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>;
  };
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, height: 72,
      background: LM.bg, borderTop: `0.5px solid ${LM.hairlineLight}`,
      display: "grid", gridTemplateColumns: "repeat(5,1fr)", alignItems: "center",
    }}>
      {slots.map((s) => {
        if (s.fab) {
          return (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 9999,
                background: LM.phase.luteal,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: -16,
                boxShadow: `0 6px 18px ${LM.phase.luteal}55`,
              }}>
                <Icon kind={s.kind}/>
              </div>
              <span style={{ fontSize: 10, color: LM.espressoMid, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{s.label}</span>
            </div>
          );
        }
        return (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: LM.espressoMute }}>
            <Icon kind={s.kind}/>
            <span style={{ fontSize: 10, color: LM.espressoMute, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── TODAY: JessNarrativeHero (with Phase Sun) ──────────────────────────────
function LM_JessNarrativeHero() {
  const phaseC = LM.phase.luteal;
  return (
    <section style={{
      position: "relative",
      background: `linear-gradient(135deg, ${phaseC}1F 0%, ${LM.paper} 70%, ${LM.surface} 100%)`,
      border: `0.5px solid ${LM.hairline}`,
      borderLeft: `3px solid ${phaseC}`,
      borderRadius: 16,
      padding: "16px 18px 18px",
      marginBottom: 14,
      boxShadow: "0 2px 10px rgba(58,44,26,0.06)",
    }}>
      {/* Phase Sun top-right */}
      <div style={{ position: "absolute", top: 12, right: 14, opacity: 0.95 }}>
        <PhaseSun phase="luteal" size={64}/>
      </div>
      <div style={{ paddingRight: 70 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.22em", color: phaseC,
          fontFamily: "'Inter', sans-serif", margin: "0 0 8px",
        }}>
          I · This week · Luteal
        </p>
        <h2 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 24, fontWeight: 500, lineHeight: 1.2,
          color: LM.espresso, letterSpacing: "-0.018em",
          margin: "0 0 8px",
        }}>{MOCK_HERO.headline}</h2>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13.5,
          lineHeight: 1.55, color: LM.espressoMid, margin: "0 0 10px",
        }}>{MOCK_HERO.body}</p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          fontWeight: 500, color: LM.espressoMute, letterSpacing: "0.02em",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/></svg>
          From Jess · this week
        </div>
      </div>
    </section>
  );
}

// ─── TODAY: PillarsDeck — 6 tiles, phase dot top-right of each ──────────────
function LM_PillarsDeck() {
  const tiles = [
    { key: "sleep",     label: "SLEEP",     value: "7.2",  unit: "hrs",  delta: "+4% vs week",  cls: "up" },
    { key: "energy",    label: "ENERGY",    value: "68",   unit: "%",    delta: "-8% vs week",  cls: "down" },
    { key: "mood",      label: "MOOD",      value: "60",   unit: "%",    delta: "steady this week", cls: "flat" },
    { key: "hydration", label: "HYDRATION", value: "6",    unit: "/ 8",  delta: "-2 vs week",   cls: "down" },
    { key: "movement",  label: "MOVEMENT",  value: "20",   unit: "min",  delta: "steady this week", cls: "flat" },
    { key: "cycle",     label: "CYCLE",     value: "Day 22", unit: "",   delta: "Luteal",        cls: "flat", phase: "luteal" },
  ];
  const colorFor = (cls) => cls === "up" ? "#5F8B72" : cls === "down" ? LM.rose : LM.espressoMute;
  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 14 }}>
      {tiles.map((t) => (
        <div key={t.key} style={{
          position: "relative",
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          justifyContent: "space-between", gap: 4,
          padding: "12px 12px 10px", borderRadius: 14,
          background: LM.surface, border: `0.5px solid ${LM.hairlineLight}`,
          boxShadow: "0 1px 0 rgba(58,44,26,0.04)",
          minHeight: 92,
        }}>
          {/* Phase dot top-right */}
          <span style={{
            position: "absolute", top: 10, right: 10,
            width: 7, height: 7, borderRadius: 9999,
            background: LM.phase[t.phase || "luteal"],
          }}/>
          <span style={{
            fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.12em", color: LM.espressoMid,
            fontFamily: "'Inter', sans-serif",
          }}>{t.label}</span>
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 22, fontWeight: 500,
            color: LM.espresso, letterSpacing: "-0.015em", lineHeight: 1.1,
          }}>
            {t.value}
            {t.unit && <span style={{ fontSize: 12, fontWeight: 400, color: LM.espressoMute, marginLeft: 2 }}> {t.unit}</span>}
          </span>
          <span style={{
            fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 500,
            color: colorFor(t.cls),
            display: "inline-flex", alignItems: "center", gap: 3,
          }}>
            {t.cls === "up" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
            {t.cls === "down" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>}
            {t.delta}
          </span>
        </div>
      ))}
    </section>
  );
}

// ─── TODAY: DailyStoryReel — horizontal scroll cards w/ course-numbered eyebrow
function LM_DailyStoryReel() {
  return (
    <section style={{ marginBottom: 14 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.16em", color: LM.espressoMid,
        fontFamily: "'Inter', sans-serif", margin: "0 0 8px",
      }}>II · For you today</p>
      <div style={{
        display: "flex", gap: 12, overflowX: "auto",
        paddingBottom: 4, scrollbarWidth: "none",
      }} className="fw-no-scrollbar">
        {MOCK_STORY_CARDS.map((card, i) => (
          <div key={i} style={{
            flex: "0 0 220px", height: 300, borderRadius: 14,
            border: `0.5px solid ${LM.hairlineLight}`, overflow: "hidden",
            background: LM.surface, boxShadow: "0 1px 2px rgba(58,44,26,0.05)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              position: "relative", width: "100%", height: 152,
              background: `linear-gradient(135deg, ${LM.phase.luteal}AA 0%, ${LM.phase.predicted}AA 100%)`,
            }}>
              {card.kind === "daily-story" && (
                <span style={{
                  position: "absolute", top: 10, left: 10,
                  padding: "4px 10px", borderRadius: 9999,
                  background: "rgba(28,18,42,0.6)", color: LM.bg,
                  fontFamily: "'Inter', sans-serif", fontSize: 9.5,
                  fontWeight: 700, letterSpacing: "0.12em",
                }}>DAILY STORY</span>
              )}
            </div>
            <div style={{
              padding: "12px 14px", flex: 1, display: "flex",
              flexDirection: "column", gap: 4, background: LM.surface,
            }}>
              <p style={{
                fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.14em", color: LM.gold,
                fontFamily: "'Inter', sans-serif", margin: 0,
              }}>{card.eyebrow}</p>
              <h3 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 16, fontWeight: 500, lineHeight: 1.25,
                color: LM.espresso, letterSpacing: "-0.012em",
                margin: 0,
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>{card.title}</h3>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11,
                color: LM.espressoMute, margin: "auto 0 0",
              }}>{card.meta}</p>
            </div>
          </div>
        ))}
      </div>
      <style>{`.fw-no-scrollbar::-webkit-scrollbar{display:none}.fw-no-scrollbar{scrollbar-width:none}`}</style>
    </section>
  );
}

// ─── TODAY: Intention card (mocked DailyPlan) ───────────────────────────────
function LM_IntentionCard() {
  return (
    <section style={{
      background: LM.surface, border: `0.5px solid ${LM.hairlineLight}`,
      borderRadius: 14, padding: "14px 16px 14px", marginBottom: 12,
      boxShadow: "0 2px 8px rgba(58,44,26,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 9.5, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase", color: LM.espressoMute,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/></svg>
          III · Today · signed by Jess
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 10,
          background: `${LM.phase.luteal}22`, color: LM.phase.luteal,
        }}>Luteal</span>
      </div>
      <p style={{
        fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
        fontSize: 17, color: LM.espresso, fontWeight: 500,
        lineHeight: 1.32, margin: "0 0 6px",
      }}>Close one loop today; let the rest wait.</p>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12.5,
        color: LM.espressoMid, lineHeight: 1.5, margin: 0,
      }}>Pick the writing pass that's been waiting two weeks — one focused half-hour, then walk away.</p>
    </section>
  );
}

// ─── TODAY: Morning stack (mocked 3 rituals) ────────────────────────────────
function LM_MorningStack() {
  const rituals = [
    { name: "Warm grains breakfast", done: true },
    { name: "Slow walk before noon", done: false },
    { name: "Second cup of tea",     done: false },
  ];
  return (
    <section style={{
      background: LM.surface, border: `0.5px solid ${LM.hairlineLight}`,
      borderRadius: 14, padding: "13px 16px 6px", marginBottom: 12,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", marginBottom: 6,
      }}>
        <span style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
          fontWeight: 500, color: LM.espresso,
        }}>IV · Morning stack</span>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10,
          color: LM.espressoMute, letterSpacing: "0.14em",
          textTransform: "uppercase", fontWeight: 700,
        }}>1 / 3</span>
      </div>
      {rituals.map((r, i) => (
        <div key={r.name} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 0",
          borderTop: i === 0 ? "none" : `0.5px solid ${LM.hairlineLight}`,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 9999,
            border: `1.5px solid ${r.done ? LM.rose : "rgba(58,44,26,0.20)"}`,
            background: r.done ? LM.rose : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {r.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FBF6E6" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>}
          </div>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13,
            fontWeight: 600,
            color: r.done ? LM.espressoMid : LM.espresso,
            textDecoration: r.done ? "line-through" : "none",
          }}>{r.name}</span>
        </div>
      ))}
    </section>
  );
}

// ─── CYCLE: MonthRibbon — saturated phase rows ─────────────────────────────
function LM_MonthRibbon() {
  const weeks = mockMonthWeeks();
  // Build CSS linear-gradient for each row from its 7 day phases.
  const ribbonBg = (row) => {
    const stops = row.map((c, i) => {
      const center = ((i * 100) / 7) + (100 / 14);
      return `${LM.phase[c.phase]} ${center.toFixed(2)}%`;
    });
    return `linear-gradient(to right, ${LM.phase[row[0].phase]} 0%, ${stops.join(", ")}, ${LM.phase[row[6].phase]} 100%)`;
  };

  return (
    <section style={{
      background: `linear-gradient(180deg, ${LM.surface} 0%, ${LM.paper} 100%)`,
      borderRadius: 18, padding: "16px 16px 18px",
      border: `0.5px solid ${LM.hairlineLight}`,
      borderLeft: `3px solid ${LM.phase.luteal}`,
      boxShadow: "0 2px 12px rgba(58,44,26,0.06)",
      marginBottom: 16,
    }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <p style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 22,
            fontWeight: 500, color: LM.espresso,
            letterSpacing: "-0.01em", margin: 0,
          }}>I · May 2026</p>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 11,
            fontWeight: 600, color: LM.espressoMute,
            letterSpacing: "0.08em", textTransform: "uppercase",
            margin: "2px 0 0",
          }}>luteal week · day 22</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={chevSmall}>‹</button>
          <button style={chevSmall}>›</button>
        </div>
      </div>

      {/* Weekday row */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4,
        padding: "0 2px", marginBottom: 6,
      }}>
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} style={{
            fontFamily: "'Inter', sans-serif", fontSize: 9,
            fontWeight: 600, color: LM.espressoMute, textAlign: "center",
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>{d}</div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 8,
        padding: "0 2px",
      }}>
        {["menstrual", "follicular", "ovulatory", "luteal", "predicted"].map((p) => (
          <span key={p} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "'Inter', sans-serif", fontSize: 9,
            fontWeight: 600, letterSpacing: "0.08em",
            color: LM.espressoMid, textTransform: "uppercase",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: LM.phase[p] }}/>
            {LM.phaseNice[p]}
          </span>
        ))}
      </div>

      {/* Ribbons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {weeks.map((row, wi) => (
          <div key={wi} style={{
            position: "relative", borderRadius: 14, padding: "8px 6px",
            display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2,
            minHeight: 70, overflow: "hidden",
            background: ribbonBg(row),
            boxShadow: "inset 0 0 0 0.5px rgba(255,250,245,0.20)",
          }}>
            {/* Subtle paper-print dot overlay */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(rgba(244,237,219,0.10) 0.5px, transparent 0.5px)",
              backgroundSize: "6px 6px", pointerEvents: "none",
            }}/>
            {row.map((cell) => {
              const isToday = cell.today;
              const isOvulatory = cell.phase === "ovulatory";
              const activityHits = cell.d === 16 ? "75%" : cell.d === 13 ? "55%" : (cell.d % 4 === 0 && !cell.isOff ? "55%" : null);
              return (
                <div key={cell.d} style={{
                  position: "relative",
                  display: "flex", flexDirection: "column",
                  justifyContent: "space-between", padding: "4px 5px 5px",
                  borderRadius: 7, minHeight: 54,
                  outline: isToday ? `2.5px solid ${LM.bg}` : "none",
                  outlineOffset: isToday ? "-1px" : 0,
                  background: isToday ? "rgba(58,44,26,0.18)" : "transparent",
                  boxShadow: isToday ? `0 0 0 1.5px ${LM.espresso}, 0 0 12px rgba(58,44,26,0.35)` : "none",
                  zIndex: 1,
                }}>
                  {isToday && <span style={{
                    position: "absolute", top: 4, right: 4,
                    width: 5, height: 5, borderRadius: 9999, background: LM.espresso,
                  }}/>}
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: isToday ? 800 : 700, fontSize: 13, lineHeight: 1,
                    color: cell.isOff
                      ? "rgba(58,44,26,0.40)"
                      : isOvulatory ? LM.espresso : LM.bg,
                    textShadow: !cell.isOff && !isOvulatory ? "0 1px 2px rgba(58,44,26,0.32)" : "none",
                  }}>{cell.d}</span>
                  {activityHits && !cell.isOff && (
                    <span style={{
                      height: 3, borderRadius: 2, opacity: 0.95,
                      width: activityHits, alignSelf: "flex-start", marginTop: "auto",
                      background: isOvulatory ? "rgba(58,44,26,0.75)" : "rgba(255,250,245,0.95)",
                      boxShadow: isOvulatory ? "none" : "0 0 4px rgba(255,250,245,0.55)",
                    }}/>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CYCLE: SavedRhythmsCarousel ─────────────────────────────────────────────
function LM_SavedRhythmsCarousel() {
  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", padding: "0 2px 8px",
      }}>
        <p style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
          fontWeight: 500, color: LM.espresso, margin: 0,
        }}>II · Your rhythms</p>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          fontWeight: 700, color: LM.phase.luteal, letterSpacing: "0.04em",
        }}>browse →</span>
      </div>
      <div style={{
        display: "flex", gap: 10, overflowX: "auto",
        scrollbarWidth: "none", paddingBottom: 4,
      }} className="fw-no-scrollbar">
        {MOCK_RHYTHMS.map((r) => (
          <div key={r.name} style={{
            flex: "0 0 206px", background: LM.surface,
            border: `0.5px solid ${LM.hairlineLight}`,
            borderLeft: `3px solid ${r.active ? LM.phase.luteal : LM.hairline}`,
            borderRadius: 12, padding: "13px 14px",
          }}>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 9.5,
              fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
              color: r.active ? LM.phase.luteal : LM.espressoMute, margin: 0,
            }}>{r.active ? "Active" : "Saved"}</p>
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif", fontSize: 17,
              fontWeight: 500, color: LM.espresso, margin: "3px 0 0",
              lineHeight: 1.2, letterSpacing: "-0.01em",
            }}>{r.name}</p>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 11.5,
              color: LM.espressoMid, margin: "4px 0 0", lineHeight: 1.4,
            }}>{r.sub}</p>
            <div style={{
              marginTop: 10, height: 3, borderRadius: 9999,
              background: "rgba(58,44,26,0.10)",
            }}>
              <div style={{ height: "100%", width: `${r.pct}%`, background: LM.phase.luteal, borderRadius: 9999 }}/>
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 10,
              color: LM.espressoMute, margin: "5px 0 0", textAlign: "right",
              letterSpacing: "0.04em",
            }}>{r.pct}% · this week</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CYCLE: WeekAheadCard ────────────────────────────────────────────────────
function LM_WeekAheadCard() {
  const chips = [
    { day: "SUN", n: 17, phase: "luteal" },
    { day: "MON", n: 18, phase: "luteal" },
    { day: "TUE", n: 19, phase: "luteal" },
    { day: "WED", n: 20, phase: "luteal" },
    { day: "THU", n: 21, phase: "luteal" },
  ];
  return (
    <section style={{
      background: `linear-gradient(180deg, ${LM.surface} 0%, ${LM.paper} 100%)`,
      borderRadius: 16, padding: "14px 16px",
      border: `0.5px solid ${LM.hairlineLight}`,
      borderLeft: `3px solid ${LM.phase.luteal}`,
      boxShadow: "0 1px 3px rgba(58,44,26,0.05)",
      marginBottom: 16,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", marginBottom: 8, gap: 8, flexWrap: "wrap",
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
          color: LM.espressoMute, margin: 0,
        }}>III · Week ahead</p>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10,
          fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
          color: LM.espressoMute,
        }}>SUNDAY 24 MAY</span>
      </div>
      <p style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 15.5,
        lineHeight: 1.4, color: LM.espresso, letterSpacing: "-0.005em",
        margin: "0 0 10px",
      }}>A gentle look at what's coming — your luteal window often sets the cadence.</p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 10,
      }}>
        {chips.map((c) => (
          <div key={c.n} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "8px 4px 10px", borderRadius: 10,
            background: LM.paperDeep, border: `0.5px solid ${LM.hairlineLight}`,
          }}>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 9,
              fontWeight: 700, letterSpacing: "0.10em",
              color: LM.espressoMute, margin: 0,
            }}>{c.day}</p>
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif", fontSize: 18,
              fontWeight: 600, color: LM.espresso, margin: 0, letterSpacing: "-0.01em",
            }}>{c.n}</p>
            <span style={{
              width: 5, height: 5, borderRadius: 9999, background: LM.phase[c.phase],
            }}/>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8, marginTop: 9, paddingTop: 9,
        borderTop: `0.5px solid ${LM.hairlineLight}`, flexWrap: "wrap",
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10.5,
          color: LM.espressoMute, letterSpacing: "0.04em", margin: 0,
        }}>
          Period ETA <strong style={{ color: LM.espresso }}>Fri 22</strong> · ±3d · 84% confident
        </p>
        <span style={{
          display: "inline-flex", alignItems: "center",
          padding: "5px 11px", borderRadius: 9999,
          background: LM.espresso, color: LM.bg,
          fontFamily: "'Inter', sans-serif", fontSize: 10.5,
          fontWeight: 700, letterSpacing: "0.04em",
        }}>Plan with Jess →</span>
      </div>
    </section>
  );
}

// ─── CYCLE: DoctorReadyDiaryCard (compact) ───────────────────────────────────
function LM_DoctorReadyDiaryCard() {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${LM.phase.luteal}1A 0%, ${LM.surface} 100%)`,
      borderRadius: 16, padding: "14px 16px",
      border: `0.5px solid ${LM.hairlineLight}`,
      borderLeft: `3px solid ${LM.phase.luteal}`,
      boxShadow: "0 1px 3px rgba(58,44,26,0.05)",
      marginBottom: 16,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: `linear-gradient(135deg, ${LM.phase.luteal} 0%, ${LM.phase.predicted} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={LM.bg} strokeWidth="1.6">
          <rect x="3" y="6" width="18" height="14" rx="2"/>
          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M12 11v6M9 14h6"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10,
          fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
          color: LM.espressoMute, margin: "0 0 2px",
        }}>IV · Doctor-ready diary</p>
        <p style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 15.5,
          fontStyle: "italic", color: LM.espresso, margin: 0, lineHeight: 1.32,
        }}>6 days to Period · Progesterone <span style={{ color: LM.phase.ovulatory, fontStyle: "normal" }}>↑</span></p>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11.5,
          color: LM.espressoMid, margin: "3px 0 0",
        }}>Last 28d · cramps, sleep, mood logged</p>
      </div>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 11,
        fontWeight: 700, color: LM.phase.luteal, letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}>open →</span>
    </section>
  );
}

// ─── CYCLE: PlanMyNextCycleCTA ──────────────────────────────────────────────
function LM_PlanMyNextCycleCTA() {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${LM.espresso}0E 0%, ${LM.surface} 100%)`,
      borderRadius: 16, padding: "14px 16px",
      border: `0.5px solid ${LM.hairlineLight}`,
      borderLeft: `3px solid ${LM.espresso}`,
      boxShadow: "0 1px 3px rgba(58,44,26,0.05)",
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: LM.espressoMute, margin: 0,
        }}>V · Plan my next cycle</p>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10,
          fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
          color: LM.espressoMute,
        }}>WITH JESS</span>
      </div>
      <p style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
        lineHeight: 1.4, color: LM.espresso, letterSpacing: "-0.005em",
        margin: "0 0 6px",
      }}>Bring this month's patterns into next month's plan.</p>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12.5, lineHeight: 1.55,
        color: LM.espressoMid, margin: "0 0 12px",
      }}>A short walk-through of anchors to keep, things to soften, and one nudge for the phase that often feels hardest.</p>
      <span style={{
        display: "inline-flex", alignItems: "center", padding: "9px 16px",
        borderRadius: 9999, background: LM.espresso, color: LM.bg,
        fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
      }}>Start planning →</span>
    </section>
  );
}

// ─── Today + Cycle views ────────────────────────────────────────────────────
function LM_TodayView() {
  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <LM_JessNarrativeHero/>
      <LM_PillarsDeck/>
      <LM_DailyStoryReel/>
      <LM_IntentionCard/>
      <LM_MorningStack/>
    </div>
  );
}

function LM_CycleView() {
  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <LM_MonthRibbon/>
      <LM_SavedRhythmsCarousel/>
      <LM_WeekAheadCard/>
      <LM_DoctorReadyDiaryCard/>
      <LM_PlanMyNextCycleCTA/>
    </div>
  );
}

// ─── Demo container ─────────────────────────────────────────────────────────
function LeMenuPhaseSunDemo() {
  const [view, setView] = useState("today");
  return (
    <div style={{
      width: 380, maxWidth: "100%", height: 820,
      background: LM.bg, color: LM.espresso,
      borderRadius: 32, overflow: "hidden", margin: "0 auto",
      position: "relative",
      boxShadow: "0 16px 40px rgba(58,44,26,0.18), 0 0 0 1px rgba(58,44,26,0.08)",
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <LM_StickyHeader view={view} setView={setView}/>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
        {view === "today" ? <LM_TodayView/> : <LM_CycleView/>}
      </div>
      <LM_BottomNav/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN 2 — The Interior (Warm Room) reskin of the real Planner
//
// Lives ENTIRELY inside the Femwell native palette — ivory background, white
// cards, plum text, rose accents, existing phase colours. The "Interior"
// expresses itself through THREE design elements only:
//   1. A line-drawing room scene at the top of JessNarrativeHero
//      (lamp, bookshelf, window with crescent moon — drawn in plum ink
//      with a brass lamp glow)
//   2. Italic "the [room object]" labels in the corner of each PillarsDeck
//      tile (the bed / the lamp / the window / the kettle / the door /
//      the clock)
//   3. A subtle brass (#C9A95C) accent line replacing the default rose
//      border on Cycle cards
// ═══════════════════════════════════════════════════════════════════════════

const TI = {
  // ─── Femwell native tokens (mirrored from src/index.css + globals.css) ───
  ivory:        "#FAF8F5",          // --ivory (app bg)
  ivoryDark:    "#F3EFE9",          // --ivory-dark
  surface:      "#FFFFFF",          // --surface (card)
  surfaceRaised:"#FDFCFB",          // --surface-raised
  cream:        "#FFFAF5",          // --cream (alt surface)
  cream2:       "#FFF5EC",          // --cream-2
  plum:         "#4A2A3A",          // --plum
  plum2:        "#6B4559",
  plumMute:     "#8A7584",          // --plum-mute
  rose:         "#D45E52",          // --rose-primary
  gold:         "#C9A95C",          // --gold
  goldDeep:     "#A6862B",          // --gold-deep
  hairline:     "rgba(74,42,58,0.08)",
  hairlineMid:  "rgba(74,42,58,0.12)",
  hairlineStrong:"rgba(74,42,58,0.18)",

  // Phase colours — EXACT match to live MonthRibbon.jsx / PillarsDeck.jsx
  phase: {
    menstrual:  "#B84A41",
    follicular: "#E67F73",
    ovulatory:  "#F2A99A",
    luteal:     "#8A5F74",
    predicted:  "rgba(138,95,116,0.45)",   // luteal at low-opacity for forecast
    off:        "#F0E5D8",
  },
  phaseNice: {
    menstrual:  "Period",
    follicular: "Follicular",
    ovulatory:  "Ovulatory",
    luteal:     "Luteal",
    predicted:  "Predicted",
  },
};

// ─── Room scene SVG — line drawing on cream, plum ink, brass lamp glow ──────
function RoomScene({ width = 348 }) {
  return (
    <svg viewBox="0 0 348 84" width={width} height={(84 * width) / 348} aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <radialGradient id="ti-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={TI.gold} stopOpacity="0.42"/>
          <stop offset="50%"  stopColor={TI.gold} stopOpacity="0.12"/>
          <stop offset="100%" stopColor={TI.gold} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="62" cy="46" r="34" fill="url(#ti-glow)"/>

      <g fill="none" stroke={TI.plum} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Lamp */}
        <path d="M 46,52 L 78,52 L 70,32 L 54,32 Z"/>
        <line x1="62" y1="52" x2="62" y2="72"/>
        <ellipse cx="62" cy="74" rx="12" ry="2"/>
        <line x1="44" y1="56" x2="40" y2="60" strokeWidth="0.9"/>
        <line x1="80" y1="56" x2="84" y2="60" strokeWidth="0.9"/>
        <line x1="62" y1="60" x2="62" y2="64" strokeWidth="0.9"/>
      </g>
      <circle cx="62" cy="44" r="4" fill={TI.gold}/>

      {/* Bookshelf */}
      <g fill="none" stroke={TI.plum} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="130" y="18" width="92" height="56"/>
        <line x1="130" y1="44" x2="222" y2="44"/>
        <line x1="130" y1="74" x2="222" y2="74"/>
        {[0,1,2,3,4,5,6].map((i) => {
          const x = 134 + i * 12;
          const h = [22, 24, 21, 23, 22, 24, 21][i];
          return <line key={`a${i}`} x1={x} y1={44 - h} x2={x} y2="44" strokeWidth="1.2"/>;
        })}
        {[0,1,2,3,4,5,6].map((i) => {
          const x = 134 + i * 12;
          const h = [24, 21, 23, 22, 23, 21, 24][i];
          return <line key={`b${i}`} x1={x} y1={74 - h} x2={x} y2="74" strokeWidth="1.2"/>;
        })}
        {/* Two candles on top */}
        <line x1="150" y1="11" x2="150" y2="17" strokeWidth="1.2"/>
        <line x1="154" y1="11" x2="154" y2="17" strokeWidth="1.2"/>
      </g>
      <circle cx="150" cy="9" r="1.2" fill={TI.gold}/>
      <circle cx="154" cy="9" r="1.2" fill={TI.gold}/>

      {/* Window */}
      <g fill="none" stroke={TI.plum} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="248" y="18" width="74" height="52"/>
        <line x1="285" y1="18" x2="285" y2="70"/>
        <line x1="248" y1="44" x2="322" y2="44"/>
        {/* Crescent moon */}
        <path d="M 268,32 A 7,7 0 1,1 263,42 A 5,5 0 1,0 268,32 Z" fill={TI.cream}/>
        <line x1="244" y1="72" x2="326" y2="72" strokeWidth="1.6"/>
      </g>
      <circle cx="303" cy="26" r="1" fill={TI.gold}/>
      <circle cx="312" cy="36" r="0.9" fill={TI.gold}/>
      <circle cx="299" cy="56" r="0.8" fill={TI.gold} opacity="0.7"/>
      <circle cx="315" cy="58" r="0.7" fill={TI.gold} opacity="0.6"/>

      {/* Floor */}
      <line x1="20" y1="78" x2="328" y2="78" stroke={TI.plum} strokeWidth="0.6" opacity="0.35"/>
    </svg>
  );
}

// ─── Sticky header (Femwell-native cream) ──────────────────────────────────
function TI_StickyHeader({ view, setView }) {
  const phaseC = TI.phase.luteal;
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 5,
      padding: "20px 18px 12px",
      backgroundColor: "rgba(250,248,245,0.97)",
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${TI.hairline}`,
    }}>
      <p style={{
        fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.18em", color: TI.plumMute,
        fontFamily: "'Inter', sans-serif", margin: 0,
      }}>
        {view === "cycle" ? "Your cycle" : "Today · Saturday 16 May"}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "4px 0 4px" }}>
        <h1 style={{
          fontSize: 30, fontWeight: 500, fontFamily: "'Fraunces', Georgia, serif",
          color: TI.plum, letterSpacing: "-0.018em", margin: 0,
        }}>
          {view === "cycle" ? "Cycle" : "Today"}
        </h1>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 9px", borderRadius: 9999,
          background: TI.cream, border: `1px solid ${TI.hairlineMid}`,
          fontFamily: "'Inter', sans-serif", fontSize: 10.5,
          fontWeight: 600, color: TI.plum2, letterSpacing: "0.04em",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: phaseC }}/>
          84% · 4 cycles
        </span>
      </div>
      <p style={{
        fontSize: 12, color: TI.plum2,
        fontFamily: "'Inter', sans-serif", margin: "0 0 4px",
      }}>
        Day 22 · <span style={{ color: phaseC, fontWeight: 700 }}>Luteal</span>
      </p>
      <p style={{
        fontSize: 11.5, fontStyle: "italic", color: TI.plumMute,
        fontFamily: "'Inter', sans-serif", margin: "0 0 10px", lineHeight: 1.45,
      }}>
        {view === "cycle" ? MOCK_CYCLE_CRUMB : MOCK_TODAY_CRUMB}
      </p>

      <div style={{
        display: "inline-flex", gap: 4, padding: 4, borderRadius: 9999,
        border: `1px solid ${TI.hairlineMid}`, background: TI.surface,
      }}>
        {["today", "cycle"].map((id) => {
          const active = id === view;
          return (
            <button
              key={id} onClick={() => setView(id)}
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12,
                letterSpacing: "0.04em",
                padding: "7px 22px", borderRadius: 9999, border: "none",
                cursor: "pointer", minWidth: 80, textAlign: "center",
                background: active ? TI.plum : "transparent",
                color: active ? TI.cream : TI.plum2,
                fontWeight: active ? 700 : 600,
                transition: "background 140ms, color 140ms",
              }}
            >
              {id === "today" ? "Today" : "Cycle"}
            </button>
          );
        })}
      </div>

      {view === "today" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14 }}>
          <button style={tiChev}>‹</button>
          <div style={{ display: "flex", gap: 4, flex: 1, justifyContent: "space-between" }}>
            {[11, 12, 13, 14, 15, 16, 17].map((d, i) => {
              const sel = d === 16;
              return (
                <button key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 2, padding: "8px 4px", borderRadius: 11, flex: 1,
                  border: "none", cursor: "pointer",
                  background: sel ? TI.plum : "transparent",
                  transition: "background 120ms",
                }}>
                  <span style={{
                    fontSize: 9, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                    color: sel ? TI.cream : TI.plumMute,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>{MOCK_WEEKDAYS[i].slice(0, 3)}</span>
                  <span style={{
                    fontSize: 15, fontWeight: 600, fontFamily: "'Fraunces', Georgia, serif",
                    color: sel ? TI.cream : TI.plum,
                  }}>{d}</span>
                  <span style={{
                    width: 5, height: 5, borderRadius: 9999,
                    background: TI.phase.luteal, opacity: sel ? 1 : 0.85,
                  }}/>
                </button>
              );
            })}
          </div>
          <button style={tiChev}>›</button>
        </div>
      )}
    </div>
  );
}

const tiChev = {
  width: 28, height: 28, borderRadius: 9999,
  border: `1px solid ${TI.hairlineMid}`,
  background: TI.surface, color: TI.plum2,
  fontFamily: "'Fraunces', serif", fontSize: 16, lineHeight: 1,
  cursor: "pointer", padding: 0, flexShrink: 0,
};

// ─── Bottom nav (cream, matches live MobileBottomNav) ──────────────────────
function TI_BottomNav() {
  const slots = [
    { kind: "today",  label: "Today" },
    { kind: "book",   label: "Lifestyle" },
    { kind: "spark",  label: "Jess", fab: true },
    { kind: "user",   label: "Profile" },
    { kind: "menu",   label: "Menu" },
  ];
  const Icon = ({ kind }) => {
    const c = TI.plumMute;
    if (kind === "today") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/></svg>;
    if (kind === "book") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M4 4h7a3 3 0 013 3v13M20 4h-7a3 3 0 00-3 3v13M4 4v15h6M20 4v15h-6"/></svg>;
    if (kind === "spark") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TI.cream} strokeWidth="1.7"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/></svg>;
    if (kind === "user") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>;
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>;
  };
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, height: 72,
      background: TI.cream, borderTop: `1px solid ${TI.hairline}`,
      display: "grid", gridTemplateColumns: "repeat(5,1fr)", alignItems: "center",
    }}>
      {slots.map((s) => {
        if (s.fab) {
          return (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 9999,
                background: TI.rose,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: -16,
                boxShadow: `0 6px 18px ${TI.rose}55`,
              }}>
                <Icon kind={s.kind}/>
              </div>
              <span style={{ fontSize: 10, color: TI.plumMute, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{s.label}</span>
            </div>
          );
        }
        return (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Icon kind={s.kind}/>
            <span style={{ fontSize: 10, color: TI.plumMute, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── TODAY: JessNarrativeHero — line-drawing room scene at top ─────────────
function TI_JessNarrativeHero() {
  const phaseC = TI.phase.luteal;
  return (
    <section style={{
      background: `linear-gradient(135deg, ${TI.cream} 0%, ${TI.surface} 60%, rgba(138,95,116,0.06) 100%)`,
      border: `1px solid ${TI.hairlineMid}`,
      borderLeft: `4px solid ${phaseC}`,
      borderRadius: 18,
      padding: 0,
      marginBottom: 14,
      overflow: "hidden",
      boxShadow: "0 4px 14px rgba(74,42,58,0.08), 0 1px 3px rgba(74,42,58,0.04)",
    }}>
      <div style={{
        background: `linear-gradient(180deg, ${TI.cream} 0%, ${TI.cream2} 100%)`,
        padding: "12px 8px 8px",
        borderBottom: `1px solid ${TI.hairline}`,
      }}>
        <RoomScene width={332}/>
      </div>
      <div style={{ padding: "14px 18px 16px" }}>
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.18em", color: TI.goldDeep,
          fontFamily: "'Inter', sans-serif", margin: "0 0 8px",
        }}>This week · Luteal</p>
        <h2 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 22, fontWeight: 500, lineHeight: 1.25,
          color: TI.plum, letterSpacing: "-0.018em",
          margin: "0 0 8px",
        }}>
          Day 22 · Luteal — <span style={{ fontStyle: "italic", color: TI.plum2 }}>the lamp is on.</span>
        </h2>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 14,
          lineHeight: 1.55, color: TI.plum2, margin: "0 0 10px",
        }}>{MOCK_HERO.body}</p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          fontWeight: 500, color: TI.plumMute, letterSpacing: "0.02em",
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/></svg>
          From Jess · this week
        </div>
      </div>
    </section>
  );
}

// ─── TODAY: PillarsDeck — 6 tiles, italic "the [object]" labels ─────────────
function TI_PillarsDeck() {
  const tiles = [
    { key: "sleep",     label: "SLEEP",     room: "the bed",    value: "7.2",     unit: "hrs",  delta: "+4% vs week",      cls: "up" },
    { key: "energy",    label: "ENERGY",    room: "the lamp",   value: "68",      unit: "%",    delta: "-8% vs week",      cls: "down" },
    { key: "mood",      label: "MOOD",      room: "the window", value: "60",      unit: "%",    delta: "steady this week", cls: "flat" },
    { key: "hydration", label: "HYDRATION", room: "the kettle", value: "6",       unit: "/ 8",  delta: "-2 vs week",       cls: "down" },
    { key: "movement",  label: "MOVEMENT",  room: "the door",   value: "20",      unit: "min",  delta: "steady this week", cls: "flat" },
    { key: "cycle",     label: "CYCLE",     room: "the clock",  value: "Day 22",  unit: "",     delta: "Luteal",           cls: "flat" },
  ];
  const colourFor = (cls) => cls === "up" ? "#5F8B72" : cls === "down" ? TI.rose : TI.plumMute;
  return (
    <section style={{
      display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 14,
    }}>
      {tiles.map((t) => (
        <div key={t.key} style={{
          position: "relative",
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          justifyContent: "space-between", gap: 4,
          padding: "12px 12px 10px", borderRadius: 14,
          background: TI.cream, border: `1px solid ${TI.hairline}`,
          boxShadow: "0 1px 0 rgba(74,42,58,0.04)",
          minHeight: 96,
        }}>
          {/* Italic museum-plaque room-object label */}
          <span style={{
            position: "absolute", top: 10, right: 12,
            fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
            fontSize: 10, color: TI.goldDeep, letterSpacing: "0.01em",
          }}>{t.room}</span>
          <span style={{
            fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.12em", color: TI.plum2,
            fontFamily: "'Inter', sans-serif",
          }}>{t.label}</span>
          <span style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 22, fontWeight: 500, color: TI.plum,
            letterSpacing: "-0.015em", lineHeight: 1.1,
          }}>
            {t.value}
            {t.unit && <span style={{ fontSize: 12, fontWeight: 400, color: TI.plumMute, marginLeft: 2 }}> {t.unit}</span>}
          </span>
          <span style={{
            fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 500,
            color: colourFor(t.cls),
            display: "inline-flex", alignItems: "center", gap: 3,
          }}>
            {t.cls === "up" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
            {t.cls === "down" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>}
            {t.delta}
          </span>
        </div>
      ))}
    </section>
  );
}

// ─── TODAY: DailyStoryReel ─────────────────────────────────────────────────
function TI_DailyStoryReel() {
  return (
    <section style={{ marginBottom: 14 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.16em", color: TI.plumMute,
        fontFamily: "'Inter', sans-serif", margin: "0 0 8px",
      }}>For you today</p>
      <div style={{
        display: "flex", gap: 12, overflowX: "auto",
        paddingBottom: 4, scrollbarWidth: "none",
      }} className="fw-no-scrollbar">
        {MOCK_STORY_CARDS.map((card, i) => (
          <div key={i} style={{
            flex: "0 0 220px", height: 304, borderRadius: 14,
            border: `1px solid ${TI.hairline}`, overflow: "hidden",
            background: TI.surface,
            boxShadow: "0 1px 2px rgba(74,42,58,0.05)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              position: "relative", width: "100%", height: 152,
              background: `linear-gradient(135deg, ${TI.phase.luteal}AA 0%, rgba(74,42,58,0.6) 100%)`,
            }}>
              {card.kind === "daily-story" && (
                <span style={{
                  position: "absolute", top: 10, left: 10,
                  padding: "4px 10px", borderRadius: 9999,
                  background: "rgba(20,16,32,0.5)", color: TI.cream,
                  fontFamily: "'Inter', sans-serif", fontSize: 9.5,
                  fontWeight: 700, letterSpacing: "0.12em",
                }}>DAILY STORY</span>
              )}
              {/* Brass lamp-glow corner */}
              <div style={{
                position: "absolute", bottom: -10, right: -10,
                width: 40, height: 40, borderRadius: "50%",
                background: `radial-gradient(circle, ${TI.gold}40 0%, transparent 70%)`,
              }}/>
            </div>
            <div style={{
              padding: "12px 14px", flex: 1, display: "flex",
              flexDirection: "column", gap: 4, background: TI.surface,
            }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.14em", color: TI.goldDeep, margin: 0,
              }}>{card.eyebrow}</p>
              <h3 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 16, fontWeight: 500, lineHeight: 1.25,
                color: TI.plum, letterSpacing: "-0.012em",
                margin: 0,
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>{card.title}</h3>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11,
                color: TI.plumMute, margin: "auto 0 0",
              }}>{card.meta}</p>
            </div>
          </div>
        ))}
      </div>
      <style>{`.fw-no-scrollbar::-webkit-scrollbar{display:none}.fw-no-scrollbar{scrollbar-width:none}`}</style>
    </section>
  );
}

// ─── TODAY: Intention ───────────────────────────────────────────────────────
function TI_IntentionCard() {
  return (
    <section style={{
      background: TI.surface, border: `1px solid ${TI.hairlineMid}`,
      borderTop: `2px solid ${TI.gold}`,
      borderRadius: 14, padding: "13px 16px", marginBottom: 14,
      boxShadow: "0 2px 8px rgba(74,42,58,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 9.5, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase", color: TI.plumMute,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/></svg>
          Today · signed by Jess
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 10,
          background: `${TI.phase.luteal}22`, color: TI.phase.luteal,
        }}>Luteal</span>
      </div>
      <p style={{
        fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
        fontSize: 17, color: TI.plum, fontWeight: 500,
        lineHeight: 1.32, margin: "0 0 6px",
      }}>Close one loop today; let the rest wait.</p>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12.5,
        color: TI.plum2, lineHeight: 1.5, margin: 0,
      }}>Pick the writing pass that's been waiting two weeks — one focused half-hour, then walk away.</p>
    </section>
  );
}

// ─── TODAY: Morning stack ──────────────────────────────────────────────────
function TI_MorningStack() {
  const rituals = [
    { name: "Warm grains breakfast", done: true },
    { name: "Slow walk before noon", done: false },
    { name: "Second cup of tea",     done: false },
  ];
  return (
    <section style={{
      background: TI.surface, border: `1px solid ${TI.hairlineMid}`,
      borderTop: `2px solid ${TI.gold}`,
      borderRadius: 14, padding: "13px 16px", marginBottom: 14,
      boxShadow: "0 2px 8px rgba(74,42,58,0.04)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", marginBottom: 6,
      }}>
        <span style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
          fontWeight: 500, color: TI.plum,
        }}>Morning stack</span>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10,
          color: TI.plumMute, letterSpacing: "0.14em",
          textTransform: "uppercase", fontWeight: 700,
        }}>1 / 3</span>
      </div>
      {rituals.map((r, i) => (
        <div key={r.name} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 0",
          borderTop: i === 0 ? "none" : `1px solid ${TI.hairline}`,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 9999,
            border: `1.5px solid ${r.done ? TI.rose : "rgba(74,42,58,0.20)"}`,
            background: r.done ? TI.rose : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {r.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>}
          </div>
          <span style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13,
            fontWeight: 600,
            color: r.done ? TI.plum2 : TI.plum,
            textDecoration: r.done ? "line-through" : "none",
          }}>{r.name}</span>
        </div>
      ))}
    </section>
  );
}

// ─── CYCLE: MonthRibbon — live phase colours, brass-accent top border ──────
function TI_MonthRibbon() {
  const weeks = mockMonthWeeks();
  const ribbonBg = (row) => {
    const stops = row.map((c, i) => {
      const center = ((i * 100) / 7) + (100 / 14);
      const colour = c.phase === "predicted" ? TI.phase.luteal : TI.phase[c.phase];
      return `${colour} ${center.toFixed(2)}%`;
    });
    const startC = row[0].phase === "predicted" ? TI.phase.luteal : TI.phase[row[0].phase];
    const endC = row[6].phase === "predicted" ? TI.phase.luteal : TI.phase[row[6].phase];
    return `linear-gradient(to right, ${startC} 0%, ${stops.join(", ")}, ${endC} 100%)`;
  };

  return (
    <section style={{
      background: `linear-gradient(180deg, ${TI.cream} 0%, ${TI.cream2} 100%)`,
      borderRadius: 18,
      padding: "16px 16px 18px",
      border: `1px solid ${TI.hairlineMid}`,
      borderTop: `2px solid ${TI.gold}`,
      borderLeft: `4px solid ${TI.phase.luteal}`,
      boxShadow: "0 2px 12px rgba(74,42,58,0.06)",
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <p style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 22,
            fontWeight: 500, color: TI.plum,
            letterSpacing: "-0.01em", margin: 0,
          }}>May 2026</p>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: 11,
            fontWeight: 600, color: TI.plumMute,
            letterSpacing: "0.06em", textTransform: "uppercase",
            margin: "2px 0 0",
          }}>luteal week · day 22</p>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={tiChev}>‹</button>
          <button style={tiChev}>›</button>
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4,
        padding: "0 2px", marginBottom: 6,
      }}>
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} style={{
            fontFamily: "'Inter', sans-serif", fontSize: 9,
            fontWeight: 600, color: TI.plumMute, textAlign: "center",
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>{d}</div>
        ))}
      </div>

      <div style={{
        display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8,
        padding: "0 2px",
      }}>
        {["menstrual", "follicular", "ovulatory", "luteal"].map((p) => (
          <span key={p} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "'Inter', sans-serif", fontSize: 9.5,
            fontWeight: 600, letterSpacing: "0.08em",
            color: TI.plumMute, textTransform: "uppercase",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: TI.phase[p] }}/>
            {TI.phaseNice[p]}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {weeks.map((row, wi) => (
          <div key={wi} style={{
            position: "relative", borderRadius: 14, padding: "8px 6px",
            display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2,
            minHeight: 72, overflow: "hidden",
            background: ribbonBg(row),
          }}>
            {row.map((cell) => {
              const isToday = cell.today;
              const isOvulatory = cell.phase === "ovulatory";
              const isPredicted = cell.phase === "predicted";
              const activityBar = !cell.isOff && (cell.d === 13 || cell.d === 16 || cell.d % 4 === 0);
              return (
                <div key={`${cell.m}-${cell.d}`} style={{
                  position: "relative",
                  display: "flex", flexDirection: "column",
                  justifyContent: "space-between", padding: "4px 5px 5px",
                  borderRadius: 7, minHeight: 56, zIndex: 1,
                  outline: isToday ? `2.5px solid ${TI.cream}` : "none",
                  outlineOffset: isToday ? "-1px" : 0,
                  background: isToday ? "rgba(74,42,58,0.18)" : "transparent",
                  boxShadow: isToday ? `0 0 0 1.5px ${TI.plum}, 0 0 12px rgba(74,42,58,0.35)` : "none",
                  opacity: isPredicted ? 0.5 : 1,
                }}>
                  {isToday && <span style={{
                    position: "absolute", top: 4, right: 4,
                    width: 5, height: 5, borderRadius: 9999, background: TI.plum,
                  }}/>}
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: isToday ? 800 : 700, fontSize: 13, lineHeight: 1,
                    color: cell.isOff
                      ? "rgba(74,42,58,0.35)"
                      : isOvulatory ? TI.plum : "#FFFAF5",
                    textShadow: !cell.isOff && !isOvulatory ? "0 1px 2px rgba(74,42,58,0.30)" : "none",
                  }}>{cell.d}</span>
                  {activityBar && (
                    <span style={{
                      height: 3, borderRadius: 2,
                      width: cell.d === 16 ? "75%" : "55%",
                      alignSelf: "flex-start", marginTop: "auto",
                      background: isOvulatory ? "rgba(74,42,58,0.75)" : "rgba(255,250,245,0.92)",
                      opacity: 0.95,
                      boxShadow: isOvulatory ? "none" : "0 0 4px rgba(255,250,245,0.55)",
                    }}/>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CYCLE: SavedRhythmsCarousel ────────────────────────────────────────────
function TI_SavedRhythmsCarousel() {
  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", padding: "0 2px 8px",
      }}>
        <p style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
          fontWeight: 500, color: TI.plum, margin: 0,
        }}>Your rhythms</p>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          fontWeight: 700, color: TI.rose, letterSpacing: "0.04em",
        }}>browse →</span>
      </div>
      <div style={{
        display: "flex", gap: 10, overflowX: "auto",
        scrollbarWidth: "none", paddingBottom: 4,
      }} className="fw-no-scrollbar">
        {MOCK_RHYTHMS.map((r) => (
          <div key={r.name} style={{
            flex: "0 0 206px", background: TI.surface,
            border: `1px solid ${TI.hairlineMid}`,
            borderTop: r.active ? `2px solid ${TI.gold}` : `1px solid ${TI.hairlineMid}`,
            borderLeft: r.active ? `3px solid ${TI.phase.luteal}` : "none",
            borderRadius: 14, padding: "13px 14px",
            boxShadow: "0 1px 3px rgba(74,42,58,0.05)",
          }}>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 9.5,
              fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
              color: r.active ? TI.phase.luteal : TI.plumMute, margin: 0,
            }}>{r.active ? "Active" : "Saved"}</p>
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif", fontSize: 17,
              fontWeight: 500, color: TI.plum, margin: "3px 0 0",
              lineHeight: 1.2, letterSpacing: "-0.01em",
            }}>{r.name}</p>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 11.5,
              color: TI.plum2, margin: "4px 0 0", lineHeight: 1.4,
            }}>{r.sub}</p>
            <div style={{
              marginTop: 10, height: 3, borderRadius: 9999,
              background: "rgba(74,42,58,0.10)",
            }}>
              <div style={{ height: "100%", width: `${r.pct}%`, background: TI.phase.luteal, borderRadius: 9999 }}/>
            </div>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 10,
              color: TI.plumMute, margin: "5px 0 0", textAlign: "right",
              letterSpacing: "0.04em",
            }}>{r.pct}% · this week</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CYCLE: WeekAheadCard ────────────────────────────────────────────────────
function TI_WeekAheadCard() {
  const chips = [
    { day: "SUN", n: 17, phase: "luteal" },
    { day: "MON", n: 18, phase: "luteal" },
    { day: "TUE", n: 19, phase: "luteal" },
    { day: "WED", n: 20, phase: "luteal" },
    { day: "THU", n: 21, phase: "luteal" },
  ];
  return (
    <section style={{
      background: `linear-gradient(180deg, ${TI.cream} 0%, ${TI.cream2} 100%)`,
      borderRadius: 16, padding: "14px 16px",
      border: `1px solid ${TI.hairlineMid}`,
      borderTop: `2px solid ${TI.gold}`,
      borderLeft: `4px solid ${TI.phase.luteal}`,
      boxShadow: "0 1px 3px rgba(74,42,58,0.05)",
      marginBottom: 16,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "baseline", marginBottom: 8, gap: 8, flexWrap: "wrap",
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em",
          color: TI.plumMute, margin: 0,
        }}>Week ahead</p>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10,
          fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
          color: TI.plumMute,
        }}>SUNDAY 24 MAY</span>
      </div>
      <p style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
        lineHeight: 1.4, color: TI.plum, letterSpacing: "-0.005em",
        margin: "0 0 10px",
      }}>A gentle look at what's coming — your luteal window often sets the cadence.</p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 10,
      }}>
        {chips.map((c) => (
          <div key={c.n} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "8px 4px 10px", borderRadius: 10,
            background: TI.surface, border: `1px solid ${TI.hairline}`,
          }}>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: 9,
              fontWeight: 700, letterSpacing: "0.10em",
              color: TI.plumMute, margin: 0,
            }}>{c.day}</p>
            <p style={{
              fontFamily: "'Fraunces', Georgia, serif", fontSize: 18,
              fontWeight: 600, color: TI.plum, margin: 0, letterSpacing: "-0.01em",
            }}>{c.n}</p>
            <span style={{
              width: 5, height: 5, borderRadius: 9999, background: TI.phase[c.phase],
            }}/>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8, marginTop: 9, paddingTop: 9,
        borderTop: `1px solid ${TI.hairline}`, flexWrap: "wrap",
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10.5,
          color: TI.plumMute, letterSpacing: "0.04em", margin: 0,
        }}>
          Period ETA <strong style={{ color: TI.plum }}>Fri 22</strong> · ±3d · 84% confident
        </p>
        <span style={{
          display: "inline-flex", alignItems: "center",
          padding: "5px 11px", borderRadius: 9999,
          background: TI.plum, color: TI.cream,
          fontFamily: "'Inter', sans-serif", fontSize: 10.5,
          fontWeight: 700, letterSpacing: "0.04em",
        }}>Plan with Jess →</span>
      </div>
    </section>
  );
}

// ─── CYCLE: DoctorReadyDiaryCard ─────────────────────────────────────────────
function TI_DoctorReadyDiaryCard() {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${TI.phase.luteal}1A 0%, ${TI.surface} 100%)`,
      borderRadius: 16, padding: "14px 16px",
      border: `1px solid ${TI.hairlineMid}`,
      borderTop: `2px solid ${TI.gold}`,
      borderLeft: `4px solid ${TI.phase.luteal}`,
      boxShadow: "0 1px 3px rgba(74,42,58,0.05)",
      marginBottom: 16,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: `linear-gradient(135deg, ${TI.phase.luteal} 0%, ${TI.plum} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TI.cream} strokeWidth="1.6">
          <rect x="3" y="6" width="18" height="14" rx="2"/>
          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M12 11v6M9 14h6"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10,
          fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
          color: TI.plumMute, margin: "0 0 2px",
        }}>Doctor-ready diary</p>
        <p style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 15.5,
          fontStyle: "italic", color: TI.plum, margin: 0, lineHeight: 1.32,
        }}>6 days to Period · Progesterone <span style={{ color: TI.goldDeep, fontStyle: "normal" }}>↑</span></p>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11.5,
          color: TI.plum2, margin: "3px 0 0",
        }}>cramps, sleep, mood logged</p>
      </div>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: 11,
        fontWeight: 700, color: TI.rose, letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}>open →</span>
    </section>
  );
}

// ─── CYCLE: PlanMyNextCycleCTA ──────────────────────────────────────────────
function TI_PlanMyNextCycleCTA() {
  return (
    <section style={{
      background: `linear-gradient(135deg, rgba(74,42,58,0.06) 0%, ${TI.surface} 100%)`,
      borderRadius: 16, padding: "14px 16px",
      border: `1px solid ${TI.hairlineMid}`,
      borderTop: `2px solid ${TI.gold}`,
      borderLeft: `4px solid ${TI.plum}`,
      boxShadow: "0 1px 3px rgba(74,42,58,0.05)",
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11,
          fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: TI.plumMute, margin: 0,
        }}>Plan my next cycle</p>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10,
          fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
          color: TI.plumMute,
        }}>WITH JESS</span>
      </div>
      <p style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
        lineHeight: 1.4, color: TI.plum, letterSpacing: "-0.005em",
        margin: "0 0 6px",
      }}>Bring this month's patterns into next month's plan.</p>
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12.5, lineHeight: 1.55,
        color: TI.plum2, margin: "0 0 12px",
      }}>A short walk-through of anchors to keep, things to soften, and one nudge for the phase that often feels hardest.</p>
      <span style={{
        display: "inline-flex", alignItems: "center", padding: "9px 16px",
        borderRadius: 9999, background: TI.plum, color: TI.cream,
        fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
      }}>Start planning →</span>
    </section>
  );
}

// ─── Today + Cycle views ────────────────────────────────────────────────────
function TI_TodayView() {
  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <TI_JessNarrativeHero/>
      <TI_PillarsDeck/>
      <TI_DailyStoryReel/>
      <TI_IntentionCard/>
      <TI_MorningStack/>
    </div>
  );
}

function TI_CycleView() {
  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <TI_MonthRibbon/>
      <TI_SavedRhythmsCarousel/>
      <TI_WeekAheadCard/>
      <TI_DoctorReadyDiaryCard/>
      <TI_PlanMyNextCycleCTA/>
    </div>
  );
}

// ─── Demo container ─────────────────────────────────────────────────────────
function TheInteriorDemo() {
  const [view, setView] = useState("today");
  return (
    <div style={{
      width: 380, maxWidth: "100%", height: 820,
      background: TI.ivory, color: TI.plum,
      borderRadius: 32, overflow: "hidden", margin: "0 auto",
      position: "relative",
      boxShadow: "0 16px 40px rgba(74,42,58,0.18), 0 0 0 1px rgba(74,42,58,0.08)",
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <TI_StickyHeader view={view} setView={setView}/>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
        {view === "today" ? <TI_TodayView/> : <TI_CycleView/>}
      </div>
      <TI_BottomNav/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN 3 — The Library (full typographic transformation)
//
// Every component reads like a piece of a printed volume. Parchment bg with
// horizontal ruled lines runs behind everything. All typography is serif.
// Hero is a book page with drop cap. PillarsDeck is an index with dotted
// leaders. Month ribbon is the contents page with chapter rows + red silk
// bookmark on today. Story reel cards are illustrated plates. Every Cycle
// card has a chapter header + Roman page number + double-line frame.
// ═══════════════════════════════════════════════════════════════════════════

// Library-specific tokens — sit alongside the Femwell palette
const TL_PARCHMENT      = "#F0E8D4";
const TL_PARCHMENT_WARM = "#F8F0DC";
const TL_RULE           = "#D8CCB0";
const TL_INK            = "#3A2010";
const TL_INK_DARK       = "#2A1A08";
const TL_INK_MUTED      = "#8A7060";
const TL_GOLD           = "#C9A95C";
const TL_GOLD_DEEP      = "#A6862B";
const TL_RIBBON         = "#B84A41";    // red silk bookmark — matches live --rose hue
const TL_LUTEAL         = "#7B5E9A";    // luteal violet for drop cap + phase ink

const TL_PHASE_BG = (p) => ({
  menstrual:  `${TL_RIBBON}1F`,
  follicular: "#E67F731F",
  ovulatory:  "#F2A99A24",
  luteal:     `${TL_LUTEAL}1F`,
  predicted:  `${TL_LUTEAL}12`,
}[p]);

const TL_PHASE_INK = {
  menstrual:  "#9A2845",
  follicular: "#A85230",
  ovulatory:  "#8B6F1E",
  luteal:     TL_LUTEAL,
  predicted:  "#5A4078",
};

const PHASE_LETTER = {
  menstrual:  "P",
  follicular: "F",
  ovulatory:  "O",
  luteal:     "L",
  predicted:  "P",
};

const TL_BANDS = [
  { roman: "I",   name: "Period",     phase: "menstrual",  days: [1,2,3,4] },
  { roman: "II",  name: "Follicular", phase: "follicular", days: [5,6,7,8,9,10,11,12,13] },
  { roman: "III", name: "Ovulatory",  phase: "ovulatory",  days: [14,15,16] },
  { roman: "IV",  name: "Luteal",     phase: "luteal",     days: [17,18,19,20,21,22,23,24,25,26,27,28] },
  { roman: "V",   name: "Predicted",  phase: "predicted",  days: [29,30,31] },
];

// ─── Running book header above the Planner title ──────────────────────────
function TL_RunningHeader() {
  return (
    <p style={{
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontStyle: "italic", fontSize: 10.5,
      color: TL_GOLD_DEEP, letterSpacing: "0.06em",
      textAlign: "right", margin: "0 0 6px",
      opacity: 0.85,
    }}>Femwell Cyclical · Volume I</p>
  );
}

// ─── Reusable double-line ornamental frame ────────────────────────────────
function DoubleFrame({ children, padding = "16px 20px", style }) {
  return (
    <div style={{
      border: `1px solid ${TL_GOLD_DEEP}`,
      padding: 3,
      background: "transparent",
      ...style,
    }}>
      <div style={{
        border: `1px solid ${TL_GOLD}`,
        padding,
        background: TL_PARCHMENT_WARM,
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Chapter header (centred italic gold + hairline rule) ─────────────────
function TL_ChapterHeader({ roman, name }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 10 }}>
      <p style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontStyle: "italic", fontWeight: 600, fontSize: 13,
        letterSpacing: "0.16em", textTransform: "uppercase",
        color: TL_GOLD_DEEP, margin: "0 0 4px",
      }}>
        Chapter {roman} · {name}
      </p>
      <div style={{
        height: 1, background: TL_GOLD,
        width: 80, margin: "0 auto", opacity: 0.65,
      }}/>
    </div>
  );
}

// ─── Page number footer ─────────────────────────────────────────────────────
function TL_PageNumber({ n }) {
  return (
    <div style={{ marginTop: 12, paddingTop: 10, borderTop: `0.5px solid ${TL_RULE}`, textAlign: "center" }}>
      <span style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontStyle: "italic", fontSize: 11, color: TL_GOLD_DEEP,
        letterSpacing: "0.18em",
      }}>— {n} —</span>
    </div>
  );
}

// ─── Sticky header — parchment + serif + running header ────────────────────
function TL_StickyHeader({ view, setView }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 5,
      padding: "18px 18px 12px",
      backgroundColor: "rgba(240,232,212,0.97)",
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${TL_RULE}`,
    }}>
      <TL_RunningHeader/>
      <p style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontStyle: "italic", fontSize: 10,
        textTransform: "uppercase", letterSpacing: "0.22em",
        color: TL_INK_MUTED, margin: "0 0 4px",
      }}>
        {view === "cycle" ? "Your cycle" : "Today · Saturday 16 May"}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 30, fontWeight: 600,
          color: TL_INK_DARK, letterSpacing: "-0.018em", margin: 0,
        }}>
          {view === "cycle" ? "Cycle" : "Today"}
        </h1>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 9px",
          background: TL_PARCHMENT_WARM,
          border: `1px solid ${TL_RULE}`,
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 10.5, color: TL_INK,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: TL_LUTEAL }}/>
          eighty-four percent · iv cycles
        </span>
      </div>
      <p style={{
        fontFamily: "Georgia, serif", fontSize: 12.5,
        color: TL_INK, margin: "0 0 4px",
      }}>
        Day 22 · <span style={{ color: TL_LUTEAL, fontStyle: "italic", fontWeight: 700 }}>Luteal</span>
      </p>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 11.5, color: TL_INK_MUTED,
        margin: "0 0 10px", lineHeight: 1.5,
      }}>
        {view === "cycle" ? MOCK_CYCLE_CRUMB : MOCK_TODAY_CRUMB}
      </p>

      <div style={{
        display: "inline-flex",
        border: `1px solid ${TL_GOLD_DEEP}`,
        background: TL_PARCHMENT_WARM,
      }}>
        {["today", "cycle"].map((id) => {
          const active = id === view;
          return (
            <button
              key={id} onClick={() => setView(id)}
              style={{
                fontFamily: "Georgia, serif", fontStyle: active ? "italic" : "normal",
                fontSize: 13, padding: "7px 22px",
                border: "none", cursor: "pointer", minWidth: 80, textAlign: "center",
                background: active ? TL_INK_DARK : "transparent",
                color: active ? TL_PARCHMENT : TL_INK,
                fontWeight: active ? 700 : 600,
                transition: "all 140ms",
              }}
            >
              {id === "today" ? "Today" : "Cycle"}
            </button>
          );
        })}
      </div>

      {view === "today" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14 }}>
          <button style={tlChevBook}>‹</button>
          <div style={{ display: "flex", gap: 4, flex: 1, justifyContent: "space-between" }}>
            {[11, 12, 13, 14, 15, 16, 17].map((d, i) => {
              const sel = d === 16;
              return (
                <button key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  padding: "6px 4px", flex: 1, border: "none", cursor: "pointer",
                  background: sel ? TL_INK_DARK : "transparent",
                  position: "relative",
                }}>
                  {sel && (
                    <span style={{
                      position: "absolute", top: -6, left: "50%",
                      transform: "translateX(-50%)",
                      width: 8, height: 14, background: TL_RIBBON,
                      clipPath: "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)",
                    }}/>
                  )}
                  <span style={{
                    fontSize: 9, fontWeight: 600, fontFamily: "Georgia, serif",
                    color: sel ? TL_GOLD : TL_INK_MUTED,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>{MOCK_WEEKDAYS[i].slice(0, 3)}</span>
                  <span style={{
                    fontSize: 16, fontWeight: 600, fontFamily: "Georgia, serif",
                    color: sel ? TL_PARCHMENT : TL_INK_DARK,
                  }}>{d}</span>
                </button>
              );
            })}
          </div>
          <button style={tlChevBook}>›</button>
        </div>
      )}
    </div>
  );
}

const tlChevBook = {
  width: 26, height: 26,
  border: `1px solid ${TL_GOLD_DEEP}`,
  background: TL_PARCHMENT_WARM, color: TL_INK_DARK,
  fontFamily: "Georgia, serif", fontSize: 16, lineHeight: 1,
  cursor: "pointer", padding: 0, flexShrink: 0,
};

// ─── Bottom nav (parchment, serif italic labels) ──────────────────────────
function TL_BottomNav() {
  const slots = [
    { kind: "today",  label: "Today" },
    { kind: "book",   label: "Lifestyle" },
    { kind: "spark",  label: "Jess", fab: true },
    { kind: "user",   label: "Profile" },
    { kind: "menu",   label: "Menu" },
  ];
  const Icon = ({ kind }) => {
    const c = TL_INK_MUTED;
    if (kind === "today") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/></svg>;
    if (kind === "book") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M4 4h7a3 3 0 013 3v13M20 4h-7a3 3 0 00-3 3v13M4 4v15h6M20 4v15h-6"/></svg>;
    if (kind === "spark") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TL_PARCHMENT} strokeWidth="1.7"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/></svg>;
    if (kind === "user") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>;
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>;
  };
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, height: 72,
      background: TL_PARCHMENT,
      borderTop: `1px solid ${TL_GOLD_DEEP}`,
      boxShadow: `inset 0 1px 0 ${TL_GOLD}`,
      display: "grid", gridTemplateColumns: "repeat(5,1fr)", alignItems: "center",
    }}>
      {slots.map((s) => {
        if (s.fab) {
          return (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 9999,
                background: TL_RIBBON,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: -16,
                boxShadow: `0 6px 18px ${TL_RIBBON}55, 0 0 0 1px ${TL_GOLD}`,
              }}>
                <Icon kind={s.kind}/>
              </div>
              <span style={{ fontSize: 10, color: TL_INK_MUTED, fontFamily: "Georgia, serif", fontStyle: "italic" }}>{s.label}</span>
            </div>
          );
        }
        return (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Icon kind={s.kind}/>
            <span style={{ fontSize: 10.5, color: TL_INK_MUTED, fontFamily: "Georgia, serif", fontStyle: "italic" }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── TODAY: JessNarrativeHero — the entire card IS a book page ──────────────
function TL_JessNarrativeHero() {
  const body = "he luteal half is the inward season — depth over breadth, careful over many. Soften where you can, and let the to-do list wait. The body is asking for less light, and a little more warmth.";
  return (
    <DoubleFrame style={{ marginBottom: 14 }}>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em",
        color: TL_GOLD_DEEP, textAlign: "center", margin: "0 0 6px",
        fontWeight: 600,
      }}>Chapter XXII · The Luteal Passage</p>
      <div style={{ height: 0.5, background: TL_GOLD, opacity: 0.7, margin: "0 0 14px" }}/>
      <p style={{
        fontFamily: "Georgia, serif",
        fontSize: 14, lineHeight: 1.6,
        color: TL_INK, textAlign: "justify",
        margin: 0, overflow: "hidden",
      }}>
        <span style={{
          float: "left",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 50, lineHeight: 0.85, fontWeight: 500,
          color: TL_LUTEAL,
          marginRight: 6, marginTop: 4, marginBottom: -4,
        }}>T</span>
        {body}
      </p>
      <div style={{ clear: "both" }}/>
      <div style={{ marginTop: 14, paddingTop: 10, borderTop: `0.5px solid ${TL_GOLD}`, opacity: 0.85, textAlign: "center" }}>
        <span style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 11, color: TL_GOLD_DEEP, letterSpacing: "0.22em",
        }}>— 22 —</span>
      </div>
    </DoubleFrame>
  );
}

// ─── TODAY: PillarsDeck — book index entries with dotted leaders ───────────
function TL_PillarsDeck() {
  const tiles = [
    { label: "Sleep",     value: "7.2 hrs",   def: "hours of rest recorded" },
    { label: "Energy",    value: "68 %",      def: "self-reported vitality" },
    { label: "Mood",      value: "60 %",      def: "steady, this week" },
    { label: "Hydration", value: "6 / 8",     def: "cups taken before dusk" },
    { label: "Movement",  value: "20 min",    def: "intentional motion logged" },
    { label: "Cycle",     value: "Day 22",    def: "of twenty-eight · luteal" },
  ];
  return (
    <section style={{ marginBottom: 14 }}>
      <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${TL_GOLD}` }}>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 11, color: TL_GOLD_DEEP, margin: 0,
          letterSpacing: "0.08em",
        }}>Index · Body Observations</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {tiles.map((t, i) => (
          <div key={t.label} style={{
            background: TL_PARCHMENT_WARM,
            border: `1px solid ${TL_RULE}`,
            borderRadius: 2,
            padding: "10px 12px",
          }}>
            <div style={{
              display: "flex", alignItems: "baseline", gap: 4,
              marginBottom: 4,
            }}>
              <span style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontWeight: 700, fontSize: 12, color: TL_INK_DARK,
                flexShrink: 0,
              }}>{t.label}</span>
              <span style={{
                flex: 1, height: 1, marginBottom: 2,
                background: `radial-gradient(circle, ${TL_INK_MUTED} 0.5px, transparent 0.5px)`,
                backgroundSize: "3px 1px", backgroundRepeat: "repeat-x",
              }}/>
              <span style={{
                fontFamily: "Georgia, serif",
                fontSize: 14, color: TL_LUTEAL, fontWeight: 600,
                flexShrink: 0,
              }}>{t.value}</span>
            </div>
            <p style={{
              fontFamily: "Georgia, serif", fontStyle: "italic",
              fontSize: 9.5, color: TL_INK_MUTED, margin: 0, lineHeight: 1.35,
            }}>
              <span style={{ color: TL_GOLD_DEEP, fontWeight: 600, marginRight: 2 }}>{i + 1}.</span>
              {t.def}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── TODAY: DailyStoryReel — illustrated book plates ──────────────────────
function TL_DailyStoryReel() {
  const PLATES = ["I", "II", "III", "IV", "V"];
  return (
    <section style={{ marginBottom: 14 }}>
      <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${TL_GOLD}` }}>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 11, color: TL_GOLD_DEEP, margin: 0,
          letterSpacing: "0.08em",
        }}>Illustrated Plates · For This Week</p>
      </div>
      <div style={{
        display: "flex", gap: 12, overflowX: "auto",
        paddingBottom: 4, scrollbarWidth: "none",
      }} className="fw-no-scrollbar">
        {MOCK_STORY_CARDS.map((card, i) => (
          <div key={i} style={{
            flex: "0 0 218px",
            border: `1px solid ${TL_GOLD_DEEP}`,
            padding: 3,
            background: "transparent",
          }}>
            <div style={{
              border: `1px solid ${TL_GOLD}`,
              background: TL_PARCHMENT_WARM,
              display: "flex", flexDirection: "column",
              minHeight: 308,
            }}>
              <div style={{
                padding: "8px 12px 6px", textAlign: "center",
                borderBottom: `0.5px solid ${TL_RULE}`,
              }}>
                <span style={{
                  fontFamily: "Georgia, serif", fontStyle: "italic",
                  fontSize: 9, color: TL_GOLD_DEEP, letterSpacing: "0.24em",
                  textTransform: "uppercase",
                }}>Plate {PLATES[i]}</span>
              </div>
              <div style={{
                position: "relative", height: 130,
                background: `linear-gradient(135deg, ${TL_LUTEAL}55 0%, ${TL_LUTEAL}A0 100%)`,
                borderBottom: `0.5px solid ${TL_RULE}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="80" height="50" viewBox="0 0 80 50" aria-hidden="true">
                  <circle cx="40" cy="25" r="14" fill="none" stroke={TL_PARCHMENT_WARM} strokeWidth="1.2"/>
                  <circle cx="40" cy="25" r="6" fill={TL_PARCHMENT_WARM} opacity="0.4"/>
                  <line x1="20" y1="25" x2="60" y2="25" stroke={TL_PARCHMENT_WARM} strokeWidth="0.6" opacity="0.6"/>
                  <line x1="40" y1="8" x2="40" y2="42" stroke={TL_PARCHMENT_WARM} strokeWidth="0.6" opacity="0.6"/>
                </svg>
              </div>
              <div style={{ padding: "12px 14px 8px", flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{
                  fontFamily: "Georgia, serif", fontStyle: "italic",
                  fontSize: 13, lineHeight: 1.32, color: TL_INK_DARK,
                  margin: 0,
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                  textAlign: "center",
                }}>{card.title}</p>
                <p style={{
                  fontFamily: "Georgia, serif", fontStyle: "italic",
                  fontSize: 9.5, color: TL_INK_MUTED,
                  margin: "auto 0 0", textAlign: "center",
                  letterSpacing: "0.04em",
                }}>{card.meta}</p>
                <p style={{
                  fontFamily: "Georgia, serif", fontStyle: "italic",
                  fontSize: 10, color: TL_GOLD_DEEP,
                  margin: "6px 0 0", textAlign: "center",
                  letterSpacing: "0.16em",
                }}>p. {22 + i}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`.fw-no-scrollbar::-webkit-scrollbar{display:none}.fw-no-scrollbar{scrollbar-width:none}`}</style>
    </section>
  );
}

// ─── TODAY: Intention ───────────────────────────────────────────────────────
function TL_IntentionCard() {
  return (
    <DoubleFrame style={{ marginBottom: 14 }}>
      <TL_ChapterHeader roman="VI" name="Intention for the Day"/>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 17, color: TL_INK_DARK, fontWeight: 500,
        lineHeight: 1.32, margin: "0 0 6px", textAlign: "center",
      }}>"Close one loop today; let the rest wait."</p>
      <p style={{
        fontFamily: "Georgia, serif",
        fontSize: 12.5, color: TL_INK,
        lineHeight: 1.55, margin: 0, textAlign: "justify",
      }}>Pick the writing pass that has been waiting two weeks — one focused half-hour, then walk away. The page can be closed for the night.</p>
      <TL_PageNumber n="vi"/>
    </DoubleFrame>
  );
}

// ─── TODAY: Morning rituals ─────────────────────────────────────────────────
function TL_MorningStack() {
  const rituals = [
    { name: "Warm grains breakfast", done: true },
    { name: "Slow walk before noon", done: false },
    { name: "Second cup of tea",     done: false },
  ];
  return (
    <DoubleFrame style={{ marginBottom: 14 }}>
      <TL_ChapterHeader roman="VII" name="Morning Rituals"/>
      {rituals.map((r, i) => (
        <div key={r.name} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "9px 0",
          borderTop: i === 0 ? "none" : `0.5px dotted ${TL_RULE}`,
        }}>
          <div style={{
            width: 18, height: 18,
            border: `1.5px solid ${r.done ? TL_RIBBON : TL_GOLD_DEEP}`,
            background: r.done ? TL_RIBBON : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {r.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={TL_PARCHMENT} strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>}
          </div>
          <span style={{
            fontFamily: "Georgia, serif", fontSize: 13,
            fontStyle: r.done ? "italic" : "normal",
            color: r.done ? TL_INK_MUTED : TL_INK_DARK,
            textDecoration: r.done ? "line-through" : "none",
          }}>{r.name}</span>
        </div>
      ))}
      <TL_PageNumber n="vii"/>
    </DoubleFrame>
  );
}

// ─── CYCLE: MonthRibbon — contents page of a reference book ─────────────────
function TL_MonthRibbon() {
  return (
    <DoubleFrame style={{ marginBottom: 16 }}>
      <TL_ChapterHeader roman="I" name="Contents of May"/>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 11.5, color: TL_INK_MUTED,
        margin: "0 0 12px", textAlign: "center", lineHeight: 1.4,
      }}>The cycle as a table of contents — five chapters across twenty-eight days.</p>

      <div style={{ borderTop: `0.5px solid ${TL_GOLD}`, borderBottom: `0.5px solid ${TL_GOLD}` }}>
        {TL_BANDS.map((band) => {
          const isCurrentPhase = band.phase === "luteal";
          const phaseInk = TL_PHASE_INK[band.phase];
          return (
            <div key={band.roman} style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr 16px",
              alignItems: "stretch",
              borderBottom: `0.5px solid ${TL_RULE}`,
              background: TL_PHASE_BG(band.phase),
              position: "relative",
            }}>
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "flex-start", justifyContent: "center",
                padding: "10px 6px 10px 10px",
                borderRight: `0.5px dotted ${TL_RULE}`,
              }}>
                <span style={{
                  fontFamily: "Georgia, serif", fontStyle: "italic",
                  fontSize: 10, color: TL_GOLD_DEEP, lineHeight: 1,
                  letterSpacing: "0.04em",
                }}>Ch. {band.roman}</span>
              </div>
              <div style={{
                padding: "10px 8px",
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontWeight: 700, fontSize: 11.5,
                    color: TL_INK_DARK,
                  }}>{band.name}</span>
                  <span style={{
                    flex: 1, height: 1, marginLeft: 4,
                    background: `radial-gradient(circle, ${TL_INK_MUTED} 0.5px, transparent 0.5px)`,
                    backgroundSize: "4px 1px", backgroundRepeat: "repeat-x",
                    alignSelf: "center",
                  }}/>
                  <span style={{
                    fontFamily: "Georgia, serif", fontStyle: "italic",
                    fontSize: 10, color: TL_INK_MUTED,
                  }}>{band.days[0]}–{band.days[band.days.length - 1]}</span>
                </div>
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: "4px 8px",
                  fontFamily: "Georgia, serif", fontSize: 11,
                  color: TL_INK, position: "relative",
                }}>
                  {band.days.map((d) => {
                    const isToday = d === 22 && band.phase === "luteal";
                    return (
                      <span key={d} style={{ position: "relative", display: "inline-block", minWidth: 14, textAlign: "center" }}>
                        {isToday && (
                          <span style={{
                            position: "absolute",
                            top: -14, left: "50%", transform: "translateX(-50%)",
                            width: 7, height: 14, background: TL_RIBBON,
                            clipPath: "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)",
                            zIndex: 2,
                          }}/>
                        )}
                        <span style={{
                          fontWeight: isToday ? 700 : 400,
                          color: isToday ? TL_RIBBON : (isCurrentPhase ? phaseInk : TL_INK),
                          fontFamily: "Georgia, serif",
                          fontStyle: isToday ? "italic" : "normal",
                          fontSize: isToday ? 12 : 11,
                        }}>{d}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div style={{
                background: TL_PHASE_INK[band.phase],
                color: TL_PARCHMENT_WARM,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 12,
                boxShadow: "inset 1px 0 0 rgba(255,255,255,0.18)",
              }}>
                {PHASE_LETTER[band.phase]}
              </div>
            </div>
          );
        })}
      </div>

      <TL_PageNumber n="i"/>
    </DoubleFrame>
  );
}

// ─── CYCLE: Saved Rhythms ───────────────────────────────────────────────────
function TL_SavedRhythmsCarousel() {
  return (
    <DoubleFrame style={{ marginBottom: 16 }}>
      <TL_ChapterHeader roman="II" name="Saved Rhythms"/>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 11.5, color: TL_INK_MUTED,
        margin: "0 0 10px", textAlign: "center", lineHeight: 1.4,
      }}>Three rhythms held this cycle — kept, watched, restored.</p>
      <div style={{
        display: "flex", gap: 8, overflowX: "auto",
        scrollbarWidth: "none", paddingBottom: 4,
      }} className="fw-no-scrollbar">
        {MOCK_RHYTHMS.map((r, i) => (
          <div key={r.name} style={{
            flex: "0 0 196px",
            background: TL_PARCHMENT,
            border: `1px solid ${r.active ? TL_GOLD_DEEP : TL_RULE}`,
            padding: "10px 12px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{
                fontFamily: "Georgia, serif", fontStyle: "italic",
                fontSize: 9.5, color: TL_GOLD_DEEP, letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}>Entry {i + 1}</span>
              <span style={{
                fontFamily: "Georgia, serif", fontStyle: "italic",
                fontSize: 9.5, color: r.active ? TL_RIBBON : TL_INK_MUTED,
              }}>{r.active ? "in progress" : "saved"}</span>
            </div>
            <p style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 600, fontSize: 16, color: TL_INK_DARK,
              margin: "4px 0 2px", lineHeight: 1.2,
            }}>{r.name}</p>
            <p style={{
              fontFamily: "Georgia, serif", fontStyle: "italic",
              fontSize: 11.5, color: TL_INK, margin: 0, lineHeight: 1.4,
            }}>{r.sub}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 10 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: TL_INK_MUTED }}>kept</span>
              <span style={{
                flex: 1, height: 1, marginLeft: 2,
                background: `radial-gradient(circle, ${TL_INK_MUTED} 0.5px, transparent 0.5px)`,
                backgroundSize: "3px 1px", backgroundRepeat: "repeat-x",
                alignSelf: "center",
              }}/>
              <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11, color: TL_LUTEAL, fontWeight: 600 }}>{r.pct}%</span>
            </div>
          </div>
        ))}
      </div>
      <TL_PageNumber n="ii"/>
    </DoubleFrame>
  );
}

// ─── CYCLE: Week Ahead ──────────────────────────────────────────────────────
function TL_WeekAheadCard() {
  const chips = [
    { day: "Sun", n: 17 },
    { day: "Mon", n: 18 },
    { day: "Tue", n: 19 },
    { day: "Wed", n: 20 },
    { day: "Thu", n: 21 },
  ];
  return (
    <DoubleFrame style={{ marginBottom: 16 }}>
      <TL_ChapterHeader roman="III" name="The Week Ahead"/>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 13.5, lineHeight: 1.5,
        color: TL_INK_DARK, margin: "0 0 10px", textAlign: "justify",
      }}>A gentle look at what is coming. The luteal window often sets the cadence — fewer rooms, earlier candles, the second cup of tea.</p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4,
        marginBottom: 12,
        borderTop: `0.5px solid ${TL_GOLD}`,
        borderBottom: `0.5px solid ${TL_GOLD}`,
        padding: "10px 0",
      }}>
        {chips.map((c) => (
          <div key={c.n} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          }}>
            <span style={{
              fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 9.5,
              color: TL_INK_MUTED, letterSpacing: "0.08em",
            }}>{c.day}</span>
            <span style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 18, fontWeight: 600, color: TL_INK_DARK,
              lineHeight: 1,
            }}>{c.n}</span>
            <span style={{ width: 5, height: 5, borderRadius: 9999, background: TL_LUTEAL }}/>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 11, color: TL_INK_MUTED, margin: 0, letterSpacing: "0.04em",
        }}>Period anticipated <strong style={{ color: TL_INK_DARK, fontStyle: "normal" }}>Friday 22</strong> · ±3 days · 84% certain</p>
        <span style={{
          display: "inline-flex", alignItems: "center",
          padding: "6px 14px",
          background: TL_INK_DARK, color: TL_PARCHMENT_WARM,
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11.5,
          fontWeight: 600, letterSpacing: "0.04em",
        }}>Plan with Jess →</span>
      </div>

      <TL_PageNumber n="iii"/>
    </DoubleFrame>
  );
}

// ─── CYCLE: Doctor-Ready Diary ──────────────────────────────────────────────
function TL_DoctorReadyDiaryCard() {
  return (
    <DoubleFrame style={{ marginBottom: 16 }}>
      <TL_ChapterHeader roman="IV" name="Doctor-Ready Diary"/>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div style={{
          width: 44, height: 44,
          background: `linear-gradient(135deg, ${TL_LUTEAL} 0%, ${TL_INK_DARK} 100%)`,
          border: `1px solid ${TL_GOLD}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TL_PARCHMENT_WARM} strokeWidth="1.6">
            <rect x="3" y="6" width="18" height="14" rx="2"/>
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M12 11v6M9 14h6"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            fontSize: 15.5, color: TL_INK_DARK, margin: 0, lineHeight: 1.32,
          }}>Six days to Period · Progesterone <span style={{ color: TL_GOLD_DEEP, fontWeight: 700 }}>↑</span></p>
          <p style={{
            fontFamily: "Georgia, serif",
            fontSize: 11.5, color: TL_INK_MUTED,
            margin: "3px 0 0", letterSpacing: "0.02em",
          }}>cramps, sleep, mood logged · twenty-eight days</p>
        </div>
        <span style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12,
          fontWeight: 600, color: TL_RIBBON,
          whiteSpace: "nowrap",
        }}>open →</span>
      </div>
      <TL_PageNumber n="iv"/>
    </DoubleFrame>
  );
}

// ─── CYCLE: The Next Chapter ────────────────────────────────────────────────
function TL_PlanMyNextCycleCTA() {
  return (
    <DoubleFrame style={{ marginBottom: 16 }}>
      <TL_ChapterHeader roman="V" name="The Next Chapter"/>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 17, lineHeight: 1.4, color: TL_INK_DARK,
        letterSpacing: "-0.005em", margin: "0 0 8px", textAlign: "center",
      }}>"Bring this month's patterns into next month's plan."</p>
      <p style={{
        fontFamily: "Georgia, serif", fontSize: 12.5, lineHeight: 1.6,
        color: TL_INK, margin: "0 0 14px", textAlign: "justify",
      }}>A short walk-through of anchors to keep, things to soften, and one nudge for the phase that often feels hardest. The volume continues.</p>
      <div style={{ textAlign: "center" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", padding: "9px 18px",
          background: TL_INK_DARK, color: TL_PARCHMENT_WARM,
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13, fontWeight: 600,
          border: `1px solid ${TL_GOLD}`,
          letterSpacing: "0.04em",
        }}>Begin the next volume →</span>
      </div>
      <TL_PageNumber n="v"/>
    </DoubleFrame>
  );
}

// ─── Today + Cycle views ────────────────────────────────────────────────────
function TL_TodayView() {
  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <TL_JessNarrativeHero/>
      <TL_PillarsDeck/>
      <TL_DailyStoryReel/>
      <TL_IntentionCard/>
      <TL_MorningStack/>
    </div>
  );
}

function TL_CycleView() {
  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <TL_MonthRibbon/>
      <TL_SavedRhythmsCarousel/>
      <TL_WeekAheadCard/>
      <TL_DoctorReadyDiaryCard/>
      <TL_PlanMyNextCycleCTA/>
    </div>
  );
}

// ─── Demo container — parchment + horizontal ruled lines ───────────────────
function TheLibraryDemo() {
  const [view, setView] = useState("today");
  return (
    <div style={{
      width: 380, maxWidth: "100%", height: 820,
      color: TL_INK, borderRadius: 32, overflow: "hidden",
      margin: "0 auto", position: "relative",
      boxShadow: "0 16px 40px rgba(74,42,58,0.18), 0 0 0 1px rgba(166,134,43,0.18)",
      fontFamily: "Georgia, 'Times New Roman', serif",
      display: "flex", flexDirection: "column",
      background: `
        repeating-linear-gradient(0deg, transparent 0px, transparent 23px, rgba(216,204,176,0.42) 23px, rgba(216,204,176,0.42) 24px),
        ${TL_PARCHMENT}
      `,
    }}>
      <TL_StickyHeader view={view} setView={setView}/>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
        {view === "today" ? <TL_TodayView/> : <TL_CycleView/>}
      </div>
      <TL_BottomNav/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN 4 — The Garden (Flower Theme, full botanical transformation)
//
// Every component is part of a botanical specimen book. Faint repeating
// leaf pattern runs behind everything. Hero has a hand-drawn lavender
// sprig. PillarsDeck tiles each carry a tiny ink corner icon (moon, sun,
// cloud, water, leaf, crescent). MonthRibbon is a pressed-flower
// collection — each phase row has its own plant illustration on the left,
// a herbarium leaf silhouette on the right, with a watercolour wash for
// the phase. Story reel cards are nursery-tagged recipe cards. Every
// Cycle card gets a sage-green header bar with a tiny botanical icon.
// ═══════════════════════════════════════════════════════════════════════════

// Garden tokens
const TG_BG          = "#F8F6F0";  // botanical white
const TG_PAPER       = "#FFFFFF";  // card bg
const TG_PAPER_WARM  = "#FDFAF0";  // warmer paper for tiles
const TG_SAGE        = "#6B8F5A";  // sage accent
const TG_SAGE_DEEP   = "#4A6840";  // deep sage (today, header bar)
const TG_SAGE_LIGHT  = "#8AAA78";  // tile border
const TG_SAGE_PALE   = "#D5E0C8";  // hairlines
const TG_INK         = "#2A2018";  // headings
const TG_INK_BODY    = "#5A5040";  // body
const TG_INK_MUTED   = "#7A6F5E";  // muted
const TG_LEAF        = "#5A7840";  // leaf green
const TG_LAV_FLORET  = "#9070B0";
const TG_LAV_BRIGHT  = "#A080C0";
const TG_LAV_DEEP    = "#7B5E9A";
const TG_ROOT        = "#6B4A30";

const TG_PHASE = {
  menstrual:  "#8B1A2E",   // deep burgundy rose
  follicular: "#D4847A",   // apple blossom blush
  ovulatory:  "#C8A020",   // sunflower gold
  luteal:     "#7B5E9A",   // lavender purple
  predicted:  "#3A2A18",   // seed-pod brown
};

const TG_PHASE_NAME = {
  menstrual:  "Period",
  follicular: "Follicular",
  ovulatory:  "Ovulatory",
  luteal:     "Luteal",
  predicted:  "Predicted",
};

const TG_PHASE_PLANT = {
  menstrual:  "Damask rose",
  follicular: "Cherry blossom",
  ovulatory:  "Sunflower",
  luteal:     "Lavender",
  predicted:  "Seed-pod",
};

const TG_BANDS = [
  { phase: "menstrual",  days: [1,2,3,4] },
  { phase: "follicular", days: [5,6,7,8,9,10,11,12,13] },
  { phase: "ovulatory",  days: [14,15,16] },
  { phase: "luteal",     days: [17,18,19,20,21,22,23,24,25,26,27,28] },
  { phase: "predicted",  days: [29,30,31] },
];

// ─── Page-wide repeating leaf pattern (SVG) ─────────────────────────────────
function GardenBackdrop() {
  return (
    <svg style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} aria-hidden="true">
      <defs>
        <pattern id="tg-leaves" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          {/* Small leaf silhouette — ink stroke at 4% opacity */}
          <g stroke="#4A6840" strokeOpacity="0.32" strokeWidth="0.9" strokeLinecap="round" fill="none">
            <path d="M 18,22 Q 12,28 14,38 Q 22,42 28,36 Q 30,28 24,22 Z"/>
            <line x1="22" y1="22" x2="28" y2="38"/>
            <path d="M 38,46 Q 44,52 48,46 Q 46,40 42,42 Q 39,43 38,46 Z"/>
            <line x1="42" y1="44" x2="46" y2="50"/>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tg-leaves)" opacity="0.5"/>
    </svg>
  );
}

// ─── Lavender sprig SVG (hero illustration) ─────────────────────────────────
function LavenderSprig({ width = 88 }) {
  return (
    <svg viewBox="0 0 88 188" width={width} height={(188 * width) / 88} aria-hidden="true">
      {/* Root */}
      <g stroke={TG_ROOT} strokeWidth="0.8" fill="none" strokeLinecap="round">
        <path d="M 44,186 Q 41,176 35,170"/>
        <path d="M 44,186 Q 47,176 53,170"/>
        <path d="M 44,186 L 44,175"/>
      </g>
      {/* Main stem (slight curve) */}
      <path d="M 44,175 Q 45,130 42,80 Q 42,40 44,12"
            stroke={TG_LEAF} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      {/* Lance-shaped leaves — opposite pairs */}
      <g fill={TG_LEAF} fillOpacity="0.30" stroke={TG_LEAF} strokeWidth="0.8">
        <path d="M 43,128 Q 26,122 14,128 Q 26,134 43,131 Z"/>
        <path d="M 43,128 Q 60,122 72,128 Q 60,134 43,131 Z"/>
        <path d="M 43,150 Q 28,144 18,150 Q 28,156 43,153 Z"/>
        <path d="M 43,150 Q 58,144 68,150 Q 58,156 43,153 Z"/>
        <path d="M 43,108 Q 30,103 22,108 Q 30,113 43,111 Z"/>
        <path d="M 43,108 Q 56,103 64,108 Q 56,113 43,111 Z"/>
      </g>
      {/* Calyx (where spike meets stem) */}
      <path d="M 38,70 L 44,64 L 50,70 L 44,76 Z" fill={TG_LEAF} fillOpacity="0.55"/>
      {/* Flower spike — 7 levels of clustered florets */}
      {[
        { y: 14, w: 4 },
        { y: 22, w: 5 },
        { y: 30, w: 6 },
        { y: 38, w: 6.5 },
        { y: 46, w: 7 },
        { y: 54, w: 7 },
        { y: 62, w: 6.5 },
      ].map(({ y, w }, i) => (
        <g key={i}>
          <ellipse cx="44" cy={y} rx={w} ry="3.2" fill={TG_LAV_FLORET}/>
          <circle cx={44 - w + 1.5} cy={y - 1.5} r="1.6" fill={TG_LAV_DEEP}/>
          <circle cx={44 + w - 1.5} cy={y - 1.5} r="1.6" fill={TG_LAV_DEEP}/>
          <circle cx={44 - w + 2.5} cy={y + 1.5} r="1.4" fill={TG_LAV_BRIGHT}/>
          <circle cx={44 + w - 2.5} cy={y + 1.5} r="1.4" fill={TG_LAV_BRIGHT}/>
          <circle cx="44" cy={y - 1} r="1.4" fill={TG_LAV_BRIGHT}/>
        </g>
      ))}
      {/* Topmost bud */}
      <circle cx="44" cy="9" r="2" fill={TG_LAV_DEEP}/>
    </svg>
  );
}

// ─── Tiny botanical SVGs for pressed-flower row ─────────────────────────────
function PressedPlant({ kind, size = 26 }) {
  const w = size;
  if (kind === "rose") {
    return (
      <svg viewBox="0 0 30 30" width={w} height={w} aria-hidden="true">
        <g stroke="#5A1820" strokeWidth="0.8" fill="none">
          <path d="M 15,8 Q 11,8 11,12 Q 11,16 15,16 Q 19,16 19,12 Q 19,8 15,8 Z" fill="#8B1A2E" fillOpacity="0.7"/>
          <path d="M 13,11 Q 15,9 17,11" stroke="#5A1820"/>
          <path d="M 14,13 Q 15,11.5 16,13"/>
          <path d="M 15,16 L 15,26" stroke="#5A7840"/>
          <path d="M 15,21 Q 11,22 9,20" stroke="#5A7840"/>
          <path d="M 15,23 Q 19,24 21,22" stroke="#5A7840"/>
        </g>
      </svg>
    );
  }
  if (kind === "cherry") {
    return (
      <svg viewBox="0 0 30 30" width={w} height={w} aria-hidden="true">
        <g fill="#D4847A" fillOpacity="0.85" stroke="#A85230" strokeWidth="0.6">
          {[0, 72, 144, 216, 288].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 15 + Math.cos(rad - Math.PI / 2) * 5;
            const cy = 13 + Math.sin(rad - Math.PI / 2) * 5;
            return <ellipse key={deg} cx={cx} cy={cy} rx="2.8" ry="4" transform={`rotate(${deg} ${cx} ${cy})`}/>;
          })}
          <circle cx="15" cy="13" r="1.8" fill="#C8A020"/>
        </g>
        <path d="M 15,18 L 15,28" stroke="#5A7840" strokeWidth="0.8"/>
      </svg>
    );
  }
  if (kind === "sunflower") {
    return (
      <svg viewBox="0 0 30 30" width={w} height={w} aria-hidden="true">
        <g fill="#C8A020" fillOpacity="0.85" stroke="#8B6F1E" strokeWidth="0.5">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x1 = 15 + Math.cos(a) * 3.5;
            const y1 = 13 + Math.sin(a) * 3.5;
            const x2 = 15 + Math.cos(a) * 8;
            const y2 = 13 + Math.sin(a) * 8;
            return <ellipse key={i} cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} rx="1.5" ry="3" transform={`rotate(${(i / 12) * 360} ${(x1 + x2) / 2} ${(y1 + y2) / 2})`}/>;
          })}
        </g>
        <circle cx="15" cy="13" r="3.4" fill="#5A4020"/>
        <circle cx="15" cy="13" r="2.4" fill="#3A2810"/>
        <path d="M 15,17 L 15,28" stroke="#5A7840" strokeWidth="0.8"/>
      </svg>
    );
  }
  if (kind === "lavender") {
    return (
      <svg viewBox="0 0 30 30" width={w} height={w} aria-hidden="true">
        {[8, 12, 16, 20].map((y, i) => (
          <g key={y}>
            <ellipse cx="15" cy={y} rx={2 + i * 0.4} ry="1.6" fill={TG_LAV_FLORET}/>
            <circle cx="15" cy={y} r="0.8" fill={TG_LAV_DEEP}/>
          </g>
        ))}
        <path d="M 15,22 L 15,28" stroke={TG_LEAF} strokeWidth="0.8" strokeLinecap="round"/>
        <path d="M 15,25 Q 12,26 11,24" stroke={TG_LEAF} strokeWidth="0.7" fill="none"/>
        <path d="M 15,27 Q 18,28 19,26" stroke={TG_LEAF} strokeWidth="0.7" fill="none"/>
      </svg>
    );
  }
  // bare branch (seed-pod)
  return (
    <svg viewBox="0 0 30 30" width={w} height={w} aria-hidden="true">
      <g stroke="#3A2A18" strokeWidth="0.9" fill="none" strokeLinecap="round">
        <path d="M 8,26 Q 10,18 14,12 Q 16,9 20,7"/>
        <path d="M 14,12 Q 18,10 22,12"/>
        <path d="M 16,9 Q 19,7 22,9"/>
        <path d="M 11,16 Q 8,14 6,11"/>
      </g>
      <circle cx="20" cy="7" r="1.4" fill="#5A4020"/>
      <circle cx="22" cy="12" r="1.2" fill="#5A4020"/>
      <circle cx="22" cy="9" r="1.1" fill="#5A4020"/>
      <circle cx="6" cy="11" r="1" fill="#5A4020"/>
    </svg>
  );
}
const PLANT_BY_PHASE = {
  menstrual:  "rose",
  follicular: "cherry",
  ovulatory:  "sunflower",
  luteal:     "lavender",
  predicted:  "branch",
};

// ─── Tiny ink corner icons for PillarsDeck tiles ────────────────────────────
function PillarIcon({ kind }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: TG_INK_MUTED, strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (kind === "sleep") return (
    <svg {...props}>
      <path d="M 18,13 A 7,7 0 1,1 11,6 A 5,5 0 0,0 18,13 Z"/>
      <path d="M 7,4 L 7.5,5 L 8.5,5 L 7.7,5.7 L 8,7 L 7,6.3 L 6,7 L 6.3,5.7 L 5.5,5 L 6.5,5 Z"/>
      <path d="M 19,3 L 19.4,4 L 20,4 L 19.5,4.5 L 19.7,5.5 L 19,5 L 18.3,5.5 L 18.5,4.5 L 18,4 L 18.6,4 Z"/>
    </svg>
  );
  if (kind === "energy") return (
    <svg {...props}>
      <circle cx="12" cy="12" r="3.5"/>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x1 = 12 + Math.cos(a) * 5.5;
        const y1 = 12 + Math.sin(a) * 5.5;
        const x2 = 12 + Math.cos(a) * 8.5;
        const y2 = 12 + Math.sin(a) * 8.5;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}/>;
      })}
    </svg>
  );
  if (kind === "mood") return (
    <svg {...props}>
      <path d="M 6,14 Q 6,11 8.5,11 Q 9,8 12,8 Q 15,8 15.5,11 Q 18,11 18,14 Q 18,16 16,16 L 8,16 Q 6,16 6,14 Z"/>
    </svg>
  );
  if (kind === "hydration") return (
    <svg {...props}>
      <path d="M 12,4 Q 7,11 7,15 Q 7,18 12,19 Q 17,18 17,15 Q 17,11 12,4 Z"/>
      <path d="M 9,14 Q 10,16 12,16" strokeOpacity="0.6"/>
    </svg>
  );
  if (kind === "movement") return (
    <svg {...props}>
      <path d="M 12,5 Q 7,8 6,13 Q 7,18 12,19 Q 17,18 18,13 Q 17,8 12,5 Z"/>
      <path d="M 12,5 L 12,19"/>
      <path d="M 12,10 L 8,12 M 12,13 L 8,15 M 12,10 L 16,12 M 12,13 L 16,15"/>
    </svg>
  );
  // cycle = crescent + dot
  return (
    <svg {...props}>
      <path d="M 17,13 A 6,6 0 1,1 11,7 A 4.5,4.5 0 0,0 17,13 Z"/>
      <circle cx="18" cy="6" r="1.2" fill={TG_INK_MUTED}/>
    </svg>
  );
}

// ─── Sage leaf sprig for section headers (3 leaves + stem) ──────────────────
function LeafSprig({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <g stroke={TG_SAGE_DEEP} strokeWidth="1" fill={TG_SAGE} fillOpacity="0.42" strokeLinecap="round">
        <path d="M 12,22 L 12,4"/>
        <path d="M 12,8 Q 6,7 4,12 Q 8,13 12,11"/>
        <path d="M 12,14 Q 18,13 20,18 Q 16,19 12,17"/>
        <path d="M 12,4 Q 8,4 8,2 Q 12,2 12,4"/>
      </g>
    </svg>
  );
}

// ─── Small white ink botanical for Cycle card headers ──────────────────────
function HeaderLeaf({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <g stroke={TG_PAPER} strokeWidth="1" fill="none" strokeLinecap="round">
        <path d="M 12,22 L 12,2"/>
        <path d="M 12,8 Q 6,8 4,13 Q 8,14 12,11"/>
        <path d="M 12,12 Q 18,12 20,17 Q 16,18 12,15"/>
      </g>
    </svg>
  );
}

// ─── 4-petal flower (used on FAB + on today day) ────────────────────────────
function Petal4({ size = 8, fill }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true">
      <g fill={fill}>
        <ellipse cx="6" cy="3" rx="1.6" ry="3"/>
        <ellipse cx="9" cy="6" rx="3" ry="1.6"/>
        <ellipse cx="6" cy="9" rx="1.6" ry="3"/>
        <ellipse cx="3" cy="6" rx="3" ry="1.6"/>
      </g>
      <circle cx="6" cy="6" r="1.2" fill={TG_PAPER}/>
    </svg>
  );
}

// ─── Sticky header (botanical white + sage accents) ────────────────────────
function TG_StickyHeader({ view, setView }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 5,
      padding: "18px 18px 12px",
      backgroundColor: "rgba(248,246,240,0.97)",
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${TG_SAGE_PALE}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <LeafSprig size={14}/>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 10.5, color: TG_SAGE_DEEP, letterSpacing: "0.04em",
          margin: 0, opacity: 0.95,
        }}>Femwell Herbarium · Specimen Vol. I</p>
      </div>
      <p style={{
        fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.22em", color: TG_INK_MUTED,
        fontFamily: "Georgia, serif", margin: "8px 0 4px",
      }}>
        {view === "cycle" ? "Your cycle" : "Today · Saturday 16 May"}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 30, fontWeight: 600, color: TG_INK,
          letterSpacing: "-0.018em", margin: 0,
        }}>
          {view === "cycle" ? "Cycle" : "Today"}
        </h1>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 10px",
          background: TG_PAPER, border: `1px solid ${TG_SAGE_PALE}`,
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 10.5, color: TG_INK_BODY,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: TG_LAV_DEEP }}/>
          84% · 4 cycles
        </span>
      </div>
      <p style={{
        fontFamily: "Georgia, serif", fontSize: 12.5,
        color: TG_INK_BODY, margin: "0 0 4px",
      }}>
        Day 22 · <span style={{ color: TG_LAV_DEEP, fontStyle: "italic", fontWeight: 700 }}>Luteal</span>
      </p>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 11.5, color: TG_INK_MUTED,
        margin: "0 0 10px", lineHeight: 1.5,
      }}>
        {view === "cycle" ? MOCK_CYCLE_CRUMB : MOCK_TODAY_CRUMB}
      </p>

      <div style={{
        display: "inline-flex",
        border: `1px solid ${TG_SAGE}`,
        background: TG_PAPER,
        borderRadius: 4,
      }}>
        {["today", "cycle"].map((id) => {
          const active = id === view;
          return (
            <button
              key={id} onClick={() => setView(id)}
              style={{
                fontFamily: "Georgia, serif", fontStyle: active ? "italic" : "normal",
                fontSize: 13, padding: "7px 22px",
                border: "none", cursor: "pointer", minWidth: 80, textAlign: "center",
                background: active ? TG_SAGE_DEEP : "transparent",
                color: active ? TG_PAPER : TG_INK_BODY,
                fontWeight: active ? 700 : 600,
                transition: "all 140ms",
              }}
            >
              {id === "today" ? "Today" : "Cycle"}
            </button>
          );
        })}
      </div>

      {view === "today" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14 }}>
          <button style={tgChev}>‹</button>
          <div style={{ display: "flex", gap: 4, flex: 1, justifyContent: "space-between" }}>
            {[11, 12, 13, 14, 15, 16, 17].map((d, i) => {
              const sel = d === 16;
              return (
                <button key={i} style={{
                  position: "relative",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                  padding: "8px 4px", flex: 1, border: "none", cursor: "pointer",
                  background: sel ? TG_SAGE_DEEP : "transparent",
                  borderRadius: 6,
                }}>
                  {sel && (
                    <span style={{ position: "absolute", top: 2, right: 2 }}>
                      <Petal4 size={10} fill={TG_PAPER}/>
                    </span>
                  )}
                  <span style={{
                    fontSize: 9, fontWeight: 600, fontFamily: "Georgia, serif",
                    color: sel ? TG_SAGE_PALE : TG_INK_MUTED,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>{MOCK_WEEKDAYS[i].slice(0, 3)}</span>
                  <span style={{
                    fontSize: 16, fontWeight: 600, fontFamily: "Georgia, serif",
                    color: sel ? TG_PAPER : TG_INK,
                  }}>{d}</span>
                </button>
              );
            })}
          </div>
          <button style={tgChev}>›</button>
        </div>
      )}
    </div>
  );
}

const tgChev = {
  width: 28, height: 28,
  border: `1px solid ${TG_SAGE}`, borderRadius: 4,
  background: TG_PAPER, color: TG_SAGE_DEEP,
  fontFamily: "Georgia, serif", fontSize: 16, lineHeight: 1,
  cursor: "pointer", padding: 0, flexShrink: 0,
};

// ─── Bottom nav (white + sage active + sage Jess FAB with flower) ──────────
function TG_BottomNav() {
  const slots = [
    { kind: "today",  label: "Today" },
    { kind: "book",   label: "Lifestyle" },
    { kind: "spark",  label: "Jess", fab: true },
    { kind: "user",   label: "Profile" },
    { kind: "menu",   label: "Menu" },
  ];
  const Icon = ({ kind }) => {
    const c = TG_INK_MUTED;
    if (kind === "today") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/></svg>;
    if (kind === "book") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><path d="M4 4h7a3 3 0 013 3v13M20 4h-7a3 3 0 00-3 3v13M4 4v15h6M20 4v15h-6"/></svg>;
    if (kind === "user") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>;
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>;
  };
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, height: 72,
      background: TG_PAPER,
      borderTop: `1px solid ${TG_SAGE_PALE}`,
      display: "grid", gridTemplateColumns: "repeat(5,1fr)", alignItems: "center",
    }}>
      {slots.map((s) => {
        if (s.fab) {
          return (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{
                position: "relative", width: 50, height: 50, borderRadius: 9999,
                background: TG_SAGE_DEEP,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: -16,
                boxShadow: `0 6px 18px ${TG_SAGE_DEEP}55, 0 0 0 1px ${TG_SAGE_PALE}`,
              }}>
                <Petal4 size={22} fill={TG_PAPER_WARM}/>
              </div>
              <span style={{ fontSize: 10, color: TG_SAGE_DEEP, fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 700 }}>{s.label}</span>
            </div>
          );
        }
        return (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Icon kind={s.kind}/>
            <span style={{ fontSize: 10.5, color: TG_INK_MUTED, fontFamily: "Georgia, serif", fontStyle: "italic" }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Reusable card with sage header bar + botanical icon ───────────────────
function GardenCard({ title, icon, children }) {
  return (
    <section style={{
      background: TG_PAPER,
      border: `1px solid ${TG_SAGE}`,
      borderRadius: 6,
      overflow: "hidden",
      marginBottom: 14,
      boxShadow: "0 2px 8px rgba(74,104,64,0.06)",
      position: "relative", zIndex: 1,
    }}>
      <div style={{
        background: TG_SAGE_DEEP, color: TG_PAPER,
        padding: "10px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 13, fontWeight: 600, letterSpacing: "0.02em",
        }}>{title}</span>
        {icon}
      </div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </section>
  );
}

// ─── TODAY: JessNarrativeHero — botanical illustration panel ───────────────
function TG_JessNarrativeHero() {
  return (
    <section style={{
      background: TG_PAPER,
      border: `1px solid ${TG_SAGE}`,
      borderLeft: `3px solid ${TG_SAGE_DEEP}`,
      borderRadius: 6, padding: 0,
      marginBottom: 14, overflow: "hidden",
      boxShadow: "0 4px 14px rgba(74,104,64,0.08)",
      position: "relative", zIndex: 1,
      display: "grid", gridTemplateColumns: "40% 60%", minHeight: 220,
    }}>
      {/* Left: lavender sprig with botanical label */}
      <div style={{
        background: `linear-gradient(180deg, ${TG_PAPER_WARM} 0%, ${TG_PAPER} 100%)`,
        borderRight: `0.5px solid ${TG_SAGE_PALE}`,
        padding: "16px 8px 12px",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <LavenderSprig width={84}/>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 8.5, color: TG_INK_MUTED,
          margin: "6px 0 0", textAlign: "center",
          letterSpacing: "0.02em",
        }}>Lavandula angustifolia</p>
      </div>
      {/* Right: narrative */}
      <div style={{
        padding: "16px 16px 14px",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <p style={{
          fontFamily: "Georgia, serif",
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.18em", color: TG_SAGE_DEEP,
          margin: "0 0 6px",
        }}>Day 22 · Luteal</p>
        <h2 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontStyle: "italic", fontSize: 18, fontWeight: 500,
          lineHeight: 1.25, color: TG_INK,
          letterSpacing: "-0.012em", margin: "0 0 8px",
        }}>The lavender is setting seed.</h2>
        <p style={{
          fontFamily: "Georgia, serif", fontSize: 12.5,
          lineHeight: 1.55, color: TG_INK_BODY,
          margin: "0 0 8px", textAlign: "justify",
        }}>{MOCK_HERO.body}</p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 10.5, color: TG_INK_MUTED,
        }}>
          <Petal4 size={10} fill={TG_SAGE}/>
          From Jess · this week
        </div>
      </div>
    </section>
  );
}

// ─── TODAY: PillarsDeck — botanical specimen labels ────────────────────────
function TG_PillarsDeck() {
  const tiles = [
    { key: "sleep",     label: "Sleep",     value: "7.2",  unit: "hrs",  def: "rest recorded", icon: "sleep" },
    { key: "energy",    label: "Energy",    value: "68",   unit: "%",    def: "vitality steady", icon: "energy" },
    { key: "mood",      label: "Mood",      value: "60",   unit: "%",    def: "as a cloud-veiled day", icon: "mood" },
    { key: "hydration", label: "Hydration", value: "6",    unit: "/ 8",  def: "cups before dusk", icon: "hydration" },
    { key: "movement",  label: "Movement",  value: "20",   unit: "min",  def: "motion logged", icon: "movement" },
    { key: "cycle",     label: "Cycle",     value: "22",   unit: "of 28", def: "luteal · day twenty-two", icon: "cycle" },
  ];
  return (
    <section style={{ marginBottom: 14, position: "relative", zIndex: 1 }}>
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <LeafSprig size={16}/>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 11, color: TG_SAGE_DEEP, margin: 0,
          letterSpacing: "0.06em",
        }}>Field Observations · 16 May 2026</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {tiles.map((t) => (
          <div key={t.key} style={{
            position: "relative", background: TG_PAPER,
            border: `1px solid ${TG_SAGE_LIGHT}`, borderRadius: 4,
            padding: "12px 12px 10px", minHeight: 92,
          }}>
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              <PillarIcon kind={t.icon}/>
            </div>
            <p style={{
              fontFamily: "Georgia, serif", fontWeight: 700,
              fontSize: 11.5, color: TG_INK,
              margin: 0, letterSpacing: "0.01em",
            }}>{t.label}</p>
            <p style={{
              fontFamily: "Georgia, serif", fontSize: 22,
              fontWeight: 500, color: TG_PHASE.luteal,
              margin: "4px 0 2px", letterSpacing: "-0.01em", lineHeight: 1.1,
            }}>
              {t.value}<span style={{ fontSize: 11, color: TG_INK_MUTED, fontWeight: 400, marginLeft: 2 }}> {t.unit}</span>
            </p>
            <p style={{
              fontFamily: "Georgia, serif", fontStyle: "italic",
              fontSize: 10, color: TG_SAGE_DEEP,
              margin: 0, lineHeight: 1.35,
            }}>{t.def}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── TODAY: DailyStoryReel — botanical recipe cards ────────────────────────
function TG_DailyStoryReel() {
  const PLANTS = ["lavender", "sunflower", "cherry", "rose", "branch"];
  return (
    <section style={{ marginBottom: 14, position: "relative", zIndex: 1 }}>
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <LeafSprig size={16}/>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 11, color: TG_SAGE_DEEP, margin: 0,
          letterSpacing: "0.06em",
        }}>From the Garden · For This Week</p>
      </div>
      <div style={{
        display: "flex", gap: 12, overflowX: "auto",
        paddingBottom: 4, scrollbarWidth: "none",
      }} className="fw-no-scrollbar">
        {MOCK_STORY_CARDS.map((card, i) => (
          <div key={i} style={{
            flex: "0 0 218px",
            background: TG_PAPER,
            border: `1px solid ${TG_SAGE}`,
            borderRadius: 6, overflow: "hidden",
            display: "flex", flexDirection: "column",
            minHeight: 314,
            boxShadow: "0 2px 6px rgba(74,104,64,0.06)",
          }}>
            {/* Botanical header */}
            <div style={{
              position: "relative", height: 120,
              background: `linear-gradient(180deg, ${TG_PAPER_WARM} 0%, ${TG_PAPER} 100%)`,
              borderBottom: `1px solid ${TG_SAGE_PALE}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PressedPlant kind={PLANTS[i % PLANTS.length]} size={70}/>
            </div>
            {/* Caption + body */}
            <div style={{ padding: "12px 14px 10px", flex: 1, display: "flex", flexDirection: "column" }}>
              <p style={{
                fontFamily: "Georgia, serif", fontStyle: "italic",
                fontSize: 14, lineHeight: 1.3, color: TG_INK,
                margin: 0, textAlign: "center",
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>{card.title}</p>
              <p style={{
                fontFamily: "Georgia, serif", fontSize: 11,
                color: TG_INK_MUTED, margin: "6px 0 0", textAlign: "center",
                letterSpacing: "0.02em", fontStyle: "italic",
              }}>{card.meta}</p>
              {/* Nursery tag */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: "auto", paddingTop: 10 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 10px",
                  border: `1px solid ${TG_SAGE}`,
                  background: TG_PAPER_WARM,
                  fontFamily: "Georgia, serif", fontStyle: "italic",
                  fontSize: 10, color: TG_SAGE_DEEP,
                  letterSpacing: "0.04em", borderRadius: 2,
                }}>
                  <Petal4 size={7} fill={TG_SAGE}/>
                  Phase: Luteal
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`.fw-no-scrollbar::-webkit-scrollbar{display:none}.fw-no-scrollbar{scrollbar-width:none}`}</style>
    </section>
  );
}

// ─── TODAY: Intention ──────────────────────────────────────────────────────
function TG_IntentionCard() {
  return (
    <GardenCard title="Today's Intention" icon={<HeaderLeaf/>}>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 17, color: TG_INK, fontWeight: 500,
        lineHeight: 1.32, margin: "0 0 6px", textAlign: "center",
      }}>"Close one loop today; let the rest wait."</p>
      <p style={{
        fontFamily: "Georgia, serif", fontSize: 12.5,
        color: TG_INK_BODY, lineHeight: 1.55, margin: 0, textAlign: "justify",
      }}>Pick the writing pass that has been waiting two weeks — one focused half-hour, then walk away. The garden tends itself the rest of the day.</p>
    </GardenCard>
  );
}

// ─── TODAY: Morning rituals ────────────────────────────────────────────────
function TG_MorningStack() {
  const rituals = [
    { name: "Warm grains breakfast", done: true },
    { name: "Slow walk before noon", done: false },
    { name: "Second cup of tea",     done: false },
  ];
  return (
    <GardenCard title="Morning Rituals" icon={<HeaderLeaf/>}>
      {rituals.map((r, i) => (
        <div key={r.name} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "9px 0",
          borderTop: i === 0 ? "none" : `0.5px dotted ${TG_SAGE_PALE}`,
        }}>
          <div style={{
            width: 18, height: 18,
            border: `1.5px solid ${r.done ? TG_SAGE_DEEP : TG_SAGE_LIGHT}`,
            background: r.done ? TG_SAGE_DEEP : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, borderRadius: 2,
          }}>
            {r.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={TG_PAPER} strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>}
          </div>
          <span style={{
            fontFamily: "Georgia, serif", fontSize: 13,
            fontStyle: r.done ? "italic" : "normal",
            color: r.done ? TG_INK_MUTED : TG_INK,
            textDecoration: r.done ? "line-through" : "none",
          }}>{r.name}</span>
        </div>
      ))}
    </GardenCard>
  );
}

// ─── CYCLE: MonthRibbon — pressed flower specimen collection ───────────────
function TG_MonthRibbon() {
  return (
    <GardenCard title="May · The Cycle Specimens" icon={<HeaderLeaf/>}>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 11.5, color: TG_INK_MUTED,
        margin: "0 0 12px", textAlign: "center", lineHeight: 1.4,
      }}>Five specimens pressed across twenty-eight days.</p>

      <div style={{ borderTop: `1px solid ${TG_SAGE_PALE}` }}>
        {TG_BANDS.map((band) => {
          const phaseC = TG_PHASE[band.phase];
          const isLuteal = band.phase === "luteal";
          const plantKind = PLANT_BY_PHASE[band.phase];
          return (
            <div key={band.phase} style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr 28px",
              alignItems: "stretch",
              borderBottom: `1px solid ${TG_SAGE_PALE}`,
              background: `${phaseC}15`,
              minHeight: 70,
            }}>
              {/* Left: pressed plant specimen */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRight: `0.5px solid ${TG_SAGE_PALE}`,
                background: TG_PAPER,
                padding: 4,
              }}>
                <PressedPlant kind={plantKind} size={26}/>
              </div>
              {/* Middle: phase name + day pills */}
              <div style={{ padding: "9px 10px" }}>
                <p style={{
                  fontFamily: "Georgia, serif", fontStyle: "italic",
                  fontSize: 11.5, color: TG_SAGE_DEEP,
                  margin: "0 0 5px", fontWeight: 600,
                  letterSpacing: "0.02em",
                }}>{TG_PHASE_NAME[band.phase]} · {TG_PHASE_PLANT[band.phase]}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {band.days.map((d) => {
                    const isToday = d === 22 && isLuteal;
                    return (
                      <div key={d} style={{
                        position: "relative",
                        minWidth: 22, padding: "3px 6px", borderRadius: 9999,
                        background: isToday ? TG_SAGE_DEEP : TG_PAPER,
                        border: isToday ? "none" : `0.5px solid ${TG_SAGE_PALE}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isToday && (
                          <span style={{
                            position: "absolute", top: -12, left: "50%",
                            transform: "translateX(-50%)",
                          }}>
                            <Petal4 size={9} fill={TG_PHASE.luteal}/>
                          </span>
                        )}
                        <span style={{
                          fontFamily: "Georgia, serif",
                          fontSize: 11, fontWeight: isToday ? 700 : 500,
                          color: isToday ? TG_PAPER : phaseC,
                        }}>{d}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Right: pressed-leaf silhouette */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0.32,
              }}>
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path d="M 12,22 Q 6,18 6,12 Q 6,5 12,2 Q 18,5 18,12 Q 18,18 12,22 Z M 12,2 L 12,22"
                        fill={phaseC} stroke={phaseC} strokeWidth="0.6"/>
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </GardenCard>
  );
}

// ─── CYCLE: SavedRhythms ────────────────────────────────────────────────────
function TG_SavedRhythmsCarousel() {
  return (
    <GardenCard title="Saved Rhythms" icon={<HeaderLeaf/>}>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 11.5, color: TG_INK_MUTED,
        margin: "0 0 10px", textAlign: "center", lineHeight: 1.4,
      }}>Three plants kept in cultivation this cycle.</p>
      <div style={{
        display: "flex", gap: 8, overflowX: "auto",
        scrollbarWidth: "none", paddingBottom: 4,
      }} className="fw-no-scrollbar">
        {MOCK_RHYTHMS.map((r) => (
          <div key={r.name} style={{
            flex: "0 0 196px",
            background: TG_PAPER_WARM,
            border: `1px solid ${r.active ? TG_SAGE_DEEP : TG_SAGE_PALE}`,
            borderRadius: 4, padding: "10px 12px",
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              <LeafSprig size={14}/>
            </div>
            <p style={{
              fontFamily: "Georgia, serif", fontStyle: "italic",
              fontSize: 9.5, color: r.active ? TG_SAGE_DEEP : TG_INK_MUTED,
              letterSpacing: "0.06em", textTransform: "uppercase",
              margin: 0, fontWeight: 700,
            }}>{r.active ? "In Cultivation" : "Saved"}</p>
            <p style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 600, fontSize: 16, color: TG_INK,
              margin: "4px 0 2px", lineHeight: 1.2,
            }}>{r.name}</p>
            <p style={{
              fontFamily: "Georgia, serif", fontStyle: "italic",
              fontSize: 11.5, color: TG_INK_BODY, margin: 0, lineHeight: 1.4,
            }}>{r.sub}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 10 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: TG_INK_MUTED, fontStyle: "italic" }}>tended</span>
              <span style={{
                flex: 1, height: 1, marginLeft: 2,
                background: `radial-gradient(circle, ${TG_INK_MUTED} 0.5px, transparent 0.5px)`,
                backgroundSize: "3px 1px", backgroundRepeat: "repeat-x",
                alignSelf: "center",
              }}/>
              <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11, color: TG_LAV_DEEP, fontWeight: 600 }}>{r.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </GardenCard>
  );
}

// ─── CYCLE: Week Ahead ──────────────────────────────────────────────────────
function TG_WeekAheadCard() {
  const chips = [
    { day: "Sun", n: 17 },
    { day: "Mon", n: 18 },
    { day: "Tue", n: 19 },
    { day: "Wed", n: 20 },
    { day: "Thu", n: 21 },
  ];
  return (
    <GardenCard title="The Week Ahead" icon={<HeaderLeaf/>}>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 13.5, lineHeight: 1.5,
        color: TG_INK, margin: "0 0 12px", textAlign: "justify",
      }}>Five days of lavender remain. The garden quiets before the rose returns.</p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4,
        marginBottom: 12,
        borderTop: `0.5px solid ${TG_SAGE_PALE}`,
        borderBottom: `0.5px solid ${TG_SAGE_PALE}`,
        padding: "10px 0",
      }}>
        {chips.map((c) => (
          <div key={c.n} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          }}>
            <span style={{
              fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 9.5,
              color: TG_INK_MUTED, letterSpacing: "0.08em",
            }}>{c.day}</span>
            <span style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 18, fontWeight: 600, color: TG_INK,
              lineHeight: 1,
            }}>{c.n}</span>
            <span style={{ width: 5, height: 5, borderRadius: 9999, background: TG_PHASE.luteal }}/>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 11, color: TG_INK_MUTED, margin: 0, letterSpacing: "0.04em",
        }}>Bloom anticipated <strong style={{ color: TG_PHASE.menstrual, fontStyle: "normal" }}>Friday 22</strong> · ±3 days</p>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "6px 14px",
          background: TG_SAGE_DEEP, color: TG_PAPER,
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11.5,
          fontWeight: 600, letterSpacing: "0.02em", borderRadius: 4,
        }}>
          <Petal4 size={8} fill={TG_PAPER_WARM}/>
          Plan with Jess →
        </span>
      </div>
    </GardenCard>
  );
}

// ─── CYCLE: Doctor-Ready Diary ──────────────────────────────────────────────
function TG_DoctorReadyDiaryCard() {
  return (
    <GardenCard title="Doctor-Ready Diary" icon={<HeaderLeaf/>}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 4,
          background: `linear-gradient(135deg, ${TG_PHASE.luteal} 0%, ${TG_SAGE_DEEP} 100%)`,
          border: `1px solid ${TG_SAGE}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TG_PAPER} strokeWidth="1.6">
            <rect x="3" y="6" width="18" height="14" rx="2"/>
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M12 11v6M9 14h6"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            fontSize: 15.5, color: TG_INK, margin: 0, lineHeight: 1.32,
          }}>Six days to Period · Progesterone <span style={{ color: TG_PHASE.ovulatory, fontWeight: 700 }}>↑</span></p>
          <p style={{
            fontFamily: "Georgia, serif", fontSize: 11.5,
            color: TG_INK_MUTED, margin: "3px 0 0", fontStyle: "italic",
          }}>cramps, sleep, mood logged · twenty-eight days</p>
        </div>
        <span style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12,
          fontWeight: 600, color: TG_SAGE_DEEP,
          whiteSpace: "nowrap",
        }}>open →</span>
      </div>
    </GardenCard>
  );
}

// ─── CYCLE: Next Cycle ──────────────────────────────────────────────────────
function TG_PlanMyNextCycleCTA() {
  return (
    <GardenCard title="The Next Cycle · With Jess" icon={<HeaderLeaf/>}>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 17, lineHeight: 1.4, color: TG_INK,
        margin: "0 0 8px", textAlign: "center",
      }}>"Save the seeds; sow what worked."</p>
      <p style={{
        fontFamily: "Georgia, serif", fontSize: 12.5, lineHeight: 1.6,
        color: TG_INK_BODY, margin: "0 0 14px", textAlign: "justify",
      }}>A short walk-through of anchors to keep, things to soften, and one nudge for the phase that often feels hardest.</p>
      <div style={{ textAlign: "center" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "9px 18px",
          background: TG_SAGE_DEEP, color: TG_PAPER,
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13, fontWeight: 600,
          border: `1px solid ${TG_SAGE}`, borderRadius: 4,
          letterSpacing: "0.02em",
        }}>
          <Petal4 size={10} fill={TG_PAPER_WARM}/>
          Tend the next garden →
        </span>
      </div>
    </GardenCard>
  );
}

// ─── Today + Cycle views ────────────────────────────────────────────────────
function TG_TodayView() {
  return (
    <div style={{ padding: "18px 16px 90px", position: "relative", zIndex: 1 }}>
      <TG_JessNarrativeHero/>
      <TG_PillarsDeck/>
      <TG_DailyStoryReel/>
      <TG_IntentionCard/>
      <TG_MorningStack/>
    </div>
  );
}

function TG_CycleView() {
  return (
    <div style={{ padding: "18px 16px 90px", position: "relative", zIndex: 1 }}>
      <TG_MonthRibbon/>
      <TG_SavedRhythmsCarousel/>
      <TG_WeekAheadCard/>
      <TG_DoctorReadyDiaryCard/>
      <TG_PlanMyNextCycleCTA/>
    </div>
  );
}

// ─── Demo container — botanical white + leaf pattern ───────────────────────
function TheGardenDemo() {
  const [view, setView] = useState("today");
  return (
    <div style={{
      width: 380, maxWidth: "100%", height: 820,
      color: TG_INK, borderRadius: 32, overflow: "hidden",
      margin: "0 auto", position: "relative",
      boxShadow: "0 16px 40px rgba(74,104,64,0.18), 0 0 0 1px rgba(107,143,90,0.16)",
      fontFamily: "Georgia, 'Times New Roman', serif",
      display: "flex", flexDirection: "column",
      background: TG_BG,
    }}>
      <GardenBackdrop/>
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <TG_StickyHeader view={view} setView={setView}/>
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
          {view === "today" ? <TG_TodayView/> : <TG_CycleView/>}
        </div>
        <TG_BottomNav/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Research view — complete life planner for ALL women
// Source: claude-state/product-research/femwell-complete-life-planner-2026-05-16.md
// ═══════════════════════════════════════════════════════════════════════════

const RX = {
  cream:     "#F4EDDB",
  creamWarm: "#FBF6E6",
  paper:     "#F8F2E4",
  espresso:  "#3A2C1A",
  espressoMid: "#6B5840",
  plum:      "#4A2A3A",
  plumMid:   "#7B5E6B",
  rose:      "#D45E52",
  gold:      "#C9A95C",
  goldDeep:  "#A6862B",
  sage:      "#6B8F5A",
  rule:      "rgba(58,44,26,0.10)",
};

const SIX_WOMEN = [
  "A 14-year-old in Year 10 whose first period landed five months ago.",
  "A 31-year-old, 14 months trying to conceive, on her second IUI cycle.",
  "A 27-week pregnant 33-year-old who opens Femwell, sees a menstrual wheel, feels invisible.",
  "A 47-year-old in early perimenopause whose cycles range from 19 to 62 days.",
  "A 28-year-old with PCOS who has not bled in 113 days.",
  "A 62-year-old post-menopausal woman with osteoporosis fears who does not exist in Femwell at all.",
];

const LIFE_STAGES = [
  {
    id: "teen",
    label: "Teenage years",
    range: "menarche → 18",
    population: "~2M UK girls aged 9-17",
    color: "#D4745A",
    portrait: "A 14-year-old whose first period landed five months ago, still irregular, with no language for the mood crash before a bleed.",
    hurts: [
      "Irregularity anxiety — no one tells her cycles take 2 years to settle.",
      "Pain dismissal — endo + adenomyosis routinely missed 7–9 years.",
      "Mood + period overlap — PMDD can start at 13–14.",
      "Body-image landmines — words that empower a 28-year-old can trigger a 15-year-old.",
      "Privacy + parental visibility — the hardest design problem in this stage.",
    ],
    shouldDo: [
      "Teen Mode — softer copy, no fertility content, no contraception talk by default.",
      "\"Still learning your cycle\" honesty band when sample size < 4 cycles.",
      "Parent Bridge — opt-in, granular, revocable. Teen owns the data; parent is a guest.",
      "GP-ready summary PDF for the first real period conversation.",
      "Mental-health soft floor — Childline / Samaritans / NHS 111 / YoungMinds one-tap.",
    ],
  },
  {
    id: "repro",
    label: "Reproductive years",
    range: "18 → 35",
    population: "~7M UK women — Femwell's sweet spot today",
    color: "#9A2845",
    portrait: "A 31-year-old who has been trying to conceive for 14 months and is on her second IUI cycle.",
    hurts: [
      "Cycle vs. life mismatch — board presentations in luteal week, weddings in PMS week.",
      "Contraception decisions made blind — no memory of what each pill did to mood, weight, libido, skin.",
      "Career stress without language — cyclical capacity exists; corporate culture pretends it doesn't.",
      "Partner sync is half-done in every app, including Femwell.",
      "Pre-TTC drift — no mode for the 32-year-old \"thinking about it\".",
    ],
    shouldDo: [
      "Capacity-aware planner overlaying cycle ribbon on calendar density.",
      "Contraception Memory as a first-class entity — type, dose, side-effects, what it did.",
      "Pre-TTC mode for the \"thinking about it\" 32-year-old.",
      "Partner Sync 2.0 — true two-sided co-planning surface, not one-way visibility.",
    ],
  },
  {
    id: "ttc",
    label: "TTC — trying to conceive",
    range: "any age, active",
    population: "500-800k UK women at any moment",
    color: "#C8A040",
    portrait: "1 in 7 UK couples experience fertility difficulty. Every twinge in the two-week wait is interpreted.",
    hurts: [
      "The two-week wait — hardest 14 days in TTC; most apps offer nothing.",
      "Confirmation bias in fertile-window prediction — apps confidently draw a box that is often wrong.",
      "Miscarriage — 1 in 4 known pregnancies; the path is handled poorly almost everywhere.",
      "IVF / IUI logistics — stim, trigger, retrieval, transfer — the clinical calendar replaces the cycle.",
      "Partner intimacy under schedule — \"sex on demand\" is one of the hardest documented parts.",
    ],
    shouldDo: [
      "TTC Mode — clean mode shift. BBT + OPK photo logger; confidence-honest fertile window.",
      "Cycle Day Math with clinical CD1 / CD8 / CD14 labels (because that is what the clinic uses).",
      "IVF / IUI sub-mode — clinical milestones replace the phase ribbon.",
      "Pregnancy-loss path — dignified, data-preserving, content-pausing, resource-routing.",
      "Supplement stack with UK pricing + NHS-aligned guidance.",
    ],
  },
  {
    id: "pregnancy",
    label: "Pregnancy",
    range: "T1 · T2 · T3",
    population: "600-700k UK pregnancies annually",
    color: "#7B5E9A",
    portrait: "A 27-week pregnant 33-year-old who opens Femwell, sees a menstrual cycle wheel, and feels invisible.",
    hurts: [
      "Information asymmetry around scans — NHS reports come back in abbreviations.",
      "Symptom navigation at 2 a.m. — is this normal? Is this reduced movement?",
      "Antenatal schedule opaque, varies by trust — women miss appointments they didn't realise they had.",
      "Birth-plan composition done badly — Mumsnet copy-paste glanced at once by the midwife.",
      "Antenatal depression under-recognised; perinatal MH team referral threshold often missed.",
    ],
    shouldDo: [
      "Pregnancy Mode — complete mode replacement. Week ribbon replaces cycle ribbon.",
      "NHS scan-result decoder (highest-liability feature; needs obstetrician sign-off).",
      "NHS antenatal schedule mirror per trust.",
      "Kick counter — RCOG-aligned, change-not-absolute logic.",
      "Birth-plan composer outputting a one-page PDF her midwife will read.",
      "Hospital bag list dynamic to UK trust + birth-plan choices.",
      "PHQ-9 / EPDS antenatal mental-health floor with referral threshold.",
    ],
  },
  {
    id: "postpartum",
    label: "Postpartum",
    range: "fourth trimester → 12mo",
    population: "every UK birth — 600-700k annually",
    color: "#6B8F5A",
    portrait: "She is surviving. Healing physically, recovering emotionally, sleep-deprived, asking if her body will ever feel like her own again.",
    hurts: [
      "Pelvic-floor neglect — universal NHS guidance, rare reality.",
      "PND under-detection — EPDS rarely repeated at home.",
      "Breastfeeding without support — feed timing, side-switching, latch, supply.",
      "Return-of-period prediction is hard — lactational amenorrhea makes it so.",
      "Postpartum sex + libido rarely addressed at the 6-week check.",
    ],
    shouldDo: [
      "Postpartum Mode — default 12 months, extendable. Centres healing, sleep, mood, feeding.",
      "EPDS at 2, 4, 6, 8, 12 weeks with GP-ready summary when score warrants.",
      "Pelvic-floor program — NHS-aligned, phase-of-healing aware.",
      "Light-touch feeding tracker.",
      "Return-of-period prediction as a confidence band, not a date.",
      "6-week check prep — one-page summary for the GP.",
    ],
  },
  {
    id: "peri",
    label: "Perimenopause",
    range: "40 → 52",
    population: "~5M UK women at any time",
    color: "#A86A52",
    portrait: "A 47-year-old whose cycles range from 19 to 62 days. The phase ribbon is a lie. The \"follicular\" colour is now an insult.",
    hurts: [
      "Cycle ribbon meaningless — phase prediction collapses.",
      "Symptom load invisible to others — partners, employers, GPs.",
      "HRT decision support is genuinely hard — type, route, progesterone arm, testosterone, local oestrogen.",
      "The 10-minute GP slot often ends in antidepressants instead of HRT.",
    ],
    shouldDo: [
      "Perimenopause Mode — symptom-pattern ribbon replaces the menstrual ribbon.",
      "Symptom-to-GP report — monthly one-page PDF.",
      "HRT decision support — \"questions to ask your GP\", not \"what to take\".",
      "HRT log as a first-class entity — type, dose, route, symptom correlation.",
      "Bone + cardiovascular context — DEXA conversation at the right time.",
    ],
  },
  {
    id: "menopause",
    label: "Menopause + post-",
    range: "52+ · the rest of life",
    population: "~13M UK women",
    color: "#4A2A3A",
    portrait: "A 62-year-old with joint pain creeping into her hands and a real fear of osteoporosis. She does not exist in Femwell at all.",
    hurts: [
      "The \"you're done now\" framing — every cycle app drops her at 55.",
      "GSM is the silent epidemic — local oestrogen is safe, cheap, dramatically under-prescribed.",
      "Bone + heart — both silent until they aren't.",
      "The pivot — empty nest, eldercare, retirement; rethinking everything.",
    ],
    shouldDo: [
      "Post-Menopause Mode — drops the cycle entirely.",
      "GSM self-screen + treatment tracker (UK Gina OTC option).",
      "Annual health rhythm — DEXA, smear (5-yearly HPV-neg), mammogram (3-yearly 50-71).",
      "Life-pivot planning — eldercare, finance, creative projects.",
    ],
  },
];

const CONDITIONS = [
  { name: "PCOS", prev: "1 in 10 (~3M UK)", note: "Cycles 35+ days or absent. Phase prediction fails.", action: "PCOS Mode: symptom + metabolic view, event-based not phase-based." },
  { name: "Endometriosis", prev: "1 in 10 · dx delay 8 yrs", note: "Heavy, painful periods; mid-cycle pain; bowel / bladder symptoms cyclical.", action: "Phendo-style pain-mapping body diagram. Pre/post-surgery sub-modes." },
  { name: "PMDD", prev: "5-8% (~700k UK)", note: "Severe luteal-locked mood disorder. Needs 2-month DRSP tracking.", action: "Built-in DRSP. After 2 cycles → GP referral report." },
  { name: "Fibroids", prev: "20-40% by 50", note: "Heavy bleeding, longer bleeds, anaemia.", action: "NHS-aligned HMB flow scoring. Pre/post-Mirena / myomectomy / UFE modes." },
  { name: "Adenomyosis", prev: "Often co-occurs with fibroids", note: "Heavy bleeding + severe cramping + bulky tender uterus.", action: "Pelvic pain map + flow tracking → MRI referral case." },
  { name: "POI", prev: "1% by 40", note: "Cycles cease before 40. HRT recommended until natural menopause age.", action: "POI Mode = young person on HRT. Bone, heart, fertility, mental health." },
  { name: "Hypo / hyperthyroid", prev: "2-3% hypo, 1% hyper", note: "Cycle length altered, mood + energy strongly affected.", action: "Cross-correlate cycle with TSH / T4 readings." },
  { name: "Autoimmune (Hashi / Lupus / RA)", prev: "1-2% UK women", note: "Luteal flares common; cycle disruption.", action: "Flare tracking + cycle overlay; surface the pattern." },
  { name: "HRT users (any age)", prev: "~2.6M UK on HRT", note: "Cycle suppressed, regulated, or replaced.", action: "HRT Mode cuts across life stages. Symptom-to-dose correlation." },
  { name: "Cancer survivors", prev: "Breast / ovarian / endo / cervical", note: "Cycle disrupted by chemo, tamoxifen / AIs; often induced menopause.", action: "Sensitive content gating + treatment-side-effect tracker." },
  { name: "Hypothalamic Amenorrhea / EDs", prev: "Significant in athletic + restrictive populations", note: "No period for months. Phase ribbon dangerously meaningless.", action: "Recovery mode that does NOT gamify eating, weight, training. Care Bridge to Beat / FEAST." },
];

const ROADMAP = [
  {
    key: "m3",
    title: "3 months",
    subtitle: "Highest leverage, lowest risk — proof-of-architecture",
    color: "#6B8F5A",
    items: [
      "Pre-TTC mode — three months of better data before the TTC switch.",
      "TTC Mode v1 — BBT + OPK photo logger; confidence-banded fertile window.",
      "Perimenopause Mode v1 — symptom-pattern ribbon + HRT log + hot-flush quick-tap.",
      "Contraception Memory — new entity, no clinical advice, structured logging.",
      "GP-ready PDF export — one feature, three modes (teen, peri, postpartum).",
      "Confidence honesty extended across the product.",
      "Care Bridge expansion — midwife, fertility coordinator, perinatal MH team.",
    ],
  },
  {
    key: "m6",
    title: "6 months",
    subtitle: "Medium leverage, real clinical care — highest revenue",
    color: "#C8A040",
    items: [
      "Pregnancy Mode — full mode replacement; needs obstetrics advisor.",
      "Postpartum Mode — EPDS + pelvic-floor (Squeezy-aligned); needs perinatal MH advisor.",
      "Teen Mode with Parent Bridge — needs adolescent MH advisor + safeguarding policy.",
      "PCOS Mode v1 — bleed-events, lab import, lifestyle anchor cards.",
      "HRT decision support — questions-to-ask-your-GP content; needs menopause advisor.",
    ],
  },
  {
    key: "m9",
    title: "9 months+",
    subtitle: "Partnerships, clinical sign-off, or new infrastructure",
    color: "#7B5E9A",
    items: [
      "NHS scan-result decoder — highest liability; MHRA assessment required.",
      "IVF / IUI sub-mode — needs fertility clinic partnership.",
      "Endometriosis pain mapping — 3+ months qualitative research.",
      "PMDD DRSP-format with specialist referral.",
      "Crisis-language detection + escalation — safety-critical, do not rush.",
      "Full menopause mode + GSM tracker + bone / heart rhythm.",
      "Capacitor + StoreKit paywall via RevenueCat.",
    ],
  },
];

const GAPS = [
  "The continuum — no UK app gracefully follows menarche → post-menopause.",
  "Confidence honesty — Flo predicts cycles that have never been regular; Femwell can refuse to lie.",
  "UK NHS context — every benchmark is US-built or US-bigger-than-UK.",
  "Condition-first vs cycle-first — PCOS / endo / fibroids / HA users get edge-case treatment everywhere.",
  "Teen-to-adult handover — no app transitions a 17-year-old account gracefully.",
  "Grief-aware modes — miscarriage, stillbirth, infertility, induced menopause.",
  "Clinician handoff — a one-page PDF the GP will actually read.",
  "Partner sync as actual product, not vanity feature.",
  "Brand voice as accessibility — Fraunces + Inter, plum / rose / sage / gold, permissive not pathologising.",
];

const RISKS = [
  { name: "Medical liability for non-cycle advice", note: "Stay on tracking + information side of MHRA's medical-device line. No diagnosis, no prescription, no treatment recommendation." },
  { name: "MHRA medical-device classification", note: "Pre-decode features with a regulatory advisor. Watch the draft Medical Devices (Amendment) Regulations 2026." },
  { name: "Brand confusion / dilution", note: "Life Stage as first-class. Per-stage marketing campaigns. Brand voice rules hold across all stages — they are the connective tissue." },
  { name: "Feature creep + team capacity", note: "The 3 / 6 / 9 month split is the discipline. \"No stale features\" rule applies — every shipped feature must do work." },
  { name: "Pregnancy + sensitive-data sensitivity", note: "Encrypted at rest. Miscarriage flow user-tested with bereaved users. Partner sync user-controlled. UK GDPR + Caldicott reviewed." },
  { name: "Teen mode + safeguarding", note: "Granular, revocable, transparent Parent Bridge. Crisis routing one-tap. KSCIE-aware policy. Adolescent MH advisor in the room." },
  { name: "Clinical-partnership dependency", note: "Soft-launch the schedule mirror as user-entered first. Care Bridge stays user-driven in MVP. Build advisor roster early." },
  { name: "Competitive response", note: "Confidence honesty + UK NHS context not contestable short-term. Win on care, context, confidence — not on AI." },
  { name: "Monetisation pressure", note: "6-month strategy is reach + retention proof, not revenue. Paywall is a parallel reference, not a shipped surface until the window closes." },
];

const OPEN_QUESTIONS = [
  "Which life-stage expansion is the first MP after the planner tab shell ships? (recommendation: Perimenopause Mode v1.)",
  "Who is on the clinician advisor roster — names, day rates, scopes?",
  "What does the Life Stage entity look like in base44 — enum vs transition history?",
  "How does the data model handle the teen-to-adult handover?",
  "What is the right voice for the miscarriage path, and who tests it?",
  "What does App Store positioning look like across life stages — one listing or many?",
  "Where does the brand voice push back on the medical needs of older user bands?",
  "What is the right partnership posture with the NHS itself?",
  "Is there a Femwell Family account model in the future?",
  "What is the post-9-month soft cap plan if no sale closes?",
];

const HEADLINE = "If Femwell ships only what is in the 3-month list, it stops being a cycle tracker and becomes a credible complete life planner on architecture alone. The single highest-leverage move is Life Stage as a first-class concept in the data model — every other expansion follows from that one architectural decision.";

// styles shared across the research view
const rxCard = {
  marginTop: 18, padding: "16px 18px",
  background: RX.creamWarm, borderRadius: 14,
  border: `1px solid ${RX.rule}`,
};
const rxEyebrow = {
  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
  fontWeight: 700, letterSpacing: "0.22em", color: RX.goldDeep,
  textTransform: "uppercase",
};
const rxSubEyebrow = {
  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 9.5,
  fontWeight: 700, letterSpacing: "0.20em", color: RX.goldDeep,
  textTransform: "uppercase", marginBottom: 6,
};
const rxH2 = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 22,
  fontWeight: 500, color: RX.espresso, letterSpacing: "-0.01em",
  margin: "36px 0 8px", lineHeight: 1.2, fontStyle: "italic",
};
const rxIntroP = {
  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13.5,
  color: RX.espressoMid, lineHeight: 1.55, margin: 0,
};

function RxBullet({ children }) {
  return (
    <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span aria-hidden="true" style={{
        width: 4, height: 4, borderRadius: 9999,
        background: RX.goldDeep, marginTop: 8, flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13,
        color: RX.espressoMid, lineHeight: 1.55,
      }}>{children}</span>
    </li>
  );
}

function RxNumberedItem({ idx, children, prefix = "" }) {
  return (
    <li style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{
        fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12,
        fontWeight: 600, color: RX.goldDeep, minWidth: 26, paddingTop: 2,
      }}>{prefix}{String(idx + 1).padStart(2, "0")}</span>
      <span style={{
        fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13,
        color: RX.espressoMid, lineHeight: 1.55,
      }}>{children}</span>
    </li>
  );
}

function ResearchView() {
  const [openStages, setOpenStages] = useState({ teen: true });
  const toggleStage = (id) => setOpenStages((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "8px 16px 40px" }}>
      {/* Hero — Why this doc */}
      <header style={{ paddingTop: 28 }}>
        <div style={rxEyebrow}>Strategic research · May 2026</div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 30,
          fontWeight: 500, color: RX.espresso, letterSpacing: "-0.02em",
          margin: "10px 0 0", lineHeight: 1.12,
        }}>From cycle tracker to<br/><em style={{ color: RX.plum }}>complete life planner</em> for UK women.</h1>
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14,
          color: RX.espressoMid, marginTop: 12, lineHeight: 1.55,
        }}>
          Femwell wins a 25–38-year-old urban professional with a textbook 28-day cycle.
          It does not yet win the rest of the female lifespan — the ~24M UK women who are
          teens, TTC, pregnant, postpartum, perimenopausal, post-menopausal, or living with
          a cycle-altering condition. This is the map of where the product grows.
        </p>
      </header>

      {/* The six women */}
      <section style={rxCard}>
        <div style={rxEyebrow}>The six women we walk past</div>
        <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {SIX_WOMEN.map((w, i) => (
            <RxNumberedItem key={i} idx={i}>{w}</RxNumberedItem>
          ))}
        </ul>
      </section>

      {/* Life stages accordion */}
      <h2 style={rxH2}>Life stages — the full female lifespan</h2>
      <p style={rxIntroP}>
        The cycle is one input among many. The life stage is the lens through which every input is interpreted.
        Tap a stage to expand.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {LIFE_STAGES.map((s) => {
          const open = !!openStages[s.id];
          return (
            <article key={s.id} style={{
              background: RX.creamWarm, borderRadius: 14,
              border: `1px solid ${RX.rule}`,
              borderLeft: `3px solid ${s.color}`, overflow: "hidden",
            }}>
              <button
                onClick={() => toggleStage(s.id)}
                aria-expanded={open}
                style={{
                  width: "100%", padding: "16px 18px",
                  background: "transparent", border: "none",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
                    fontWeight: 700, letterSpacing: "0.18em", color: s.color,
                    textTransform: "uppercase",
                  }}>{s.range}</div>
                  <div style={{
                    fontFamily: "'Fraunces', Georgia, serif", fontSize: 20,
                    fontWeight: 500, color: RX.espresso, marginTop: 4,
                    fontStyle: "italic",
                  }}>{s.label}</div>
                  <div style={{
                    fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12,
                    color: RX.espressoMid, marginTop: 4,
                  }}>{s.population}</div>
                </div>
                <span aria-hidden="true" style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 16, color: RX.espressoMid, fontWeight: 700,
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  marginTop: 6,
                }}>▾</span>
              </button>
              {open && (
                <div style={{ padding: "0 18px 20px" }}>
                  <div style={{
                    fontFamily: "Georgia, serif", fontStyle: "italic",
                    fontSize: 13.5, color: RX.plum, lineHeight: 1.5,
                    padding: "12px 14px", background: RX.cream,
                    borderRadius: 8, marginBottom: 14,
                  }}>“{s.portrait}”</div>

                  <div style={rxSubEyebrow}>What hurts most</div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {s.hurts.map((h, i) => <RxBullet key={i}>{h}</RxBullet>)}
                  </ul>

                  <div style={{ ...rxSubEyebrow, marginTop: 16, color: s.color }}>What Femwell should DO</div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {s.shouldDo.map((d, i) => <RxBullet key={i}>{d}</RxBullet>)}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Conditions */}
      <h2 style={rxH2}>Medical conditions — what cycle-tracking misses</h2>
      <p style={rxIntroP}>
        Every condition has the same architectural ask: the cycle ribbon is the wrong metaphor.
        They need their <em>condition</em> as the dominant frame.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        {CONDITIONS.map((c, i) => (
          <article key={i} style={{
            background: RX.creamWarm, borderRadius: 10,
            border: `1px solid ${RX.rule}`, padding: "12px 14px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <div style={{
                fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
                fontWeight: 600, color: RX.espresso,
              }}>{c.name}</div>
              <div style={{
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
                fontWeight: 700, color: RX.goldDeep, letterSpacing: "0.10em",
              }}>{c.prev}</div>
            </div>
            <div style={{
              fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12.5,
              color: RX.espressoMid, marginTop: 4, lineHeight: 1.5,
            }}>{c.note}</div>
            <div style={{
              fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13,
              color: RX.plum, marginTop: 6, lineHeight: 1.45,
            }}>→ {c.action}</div>
          </article>
        ))}
      </div>

      {/* Roadmap */}
      <h2 style={rxH2}>Roadmap — 3 / 6 / 9 months</h2>
      <p style={rxIntroP}>
        Runway: 6-month sale window, 9-month soft cap. The 3-month list is proof-of-architecture;
        the 6-month list is revenue; the 9-month list is moat.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        {ROADMAP.map((r) => (
          <article key={r.key} style={{
            background: RX.creamWarm, borderRadius: 14,
            border: `1px solid ${RX.rule}`, borderTop: `3px solid ${r.color}`,
            padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <div style={{
                fontFamily: "'Fraunces', Georgia, serif", fontSize: 24,
                fontWeight: 500, color: r.color, fontStyle: "italic",
              }}>{r.title}</div>
              <div style={{
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11,
                color: RX.espressoMid, letterSpacing: "0.04em", flex: 1, minWidth: 0,
              }}>{r.subtitle}</div>
            </div>
            <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {r.items.map((it, i) => <RxBullet key={i}>{it}</RxBullet>)}
            </ul>
          </article>
        ))}
      </div>

      {/* Gaps */}
      <h2 style={rxH2}>The gaps — what no app does well yet</h2>
      <section style={rxCard}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {GAPS.map((g, i) => (
            <RxNumberedItem key={i} idx={i}>{g}</RxNumberedItem>
          ))}
        </ul>
      </section>

      {/* Risks */}
      <h2 style={rxH2}>Risk register</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {RISKS.map((r, i) => (
          <article key={i} style={{
            background: RX.creamWarm, borderRadius: 10,
            border: `1px solid ${RX.rule}`,
            borderLeft: `2px solid ${RX.rose}`,
            padding: "12px 14px",
          }}>
            <div style={{
              fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
              fontWeight: 700, color: RX.rose, letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}>Risk {String(i + 1).padStart(2, "0")}</div>
            <div style={{
              fontFamily: "'Fraunces', Georgia, serif", fontSize: 15,
              fontWeight: 600, color: RX.espresso, marginTop: 4,
            }}>{r.name}</div>
            <div style={{
              fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12.5,
              color: RX.espressoMid, marginTop: 6, lineHeight: 1.5,
            }}>{r.note}</div>
          </article>
        ))}
      </div>

      {/* Open questions */}
      <h2 style={rxH2}>Open questions for next session</h2>
      <section style={rxCard}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {OPEN_QUESTIONS.map((q, i) => (
            <RxNumberedItem key={i} idx={i} prefix="Q">{q}</RxNumberedItem>
          ))}
        </ul>
      </section>

      {/* Headline */}
      <section style={{
        marginTop: 28, padding: "24px 22px",
        background: RX.espresso, color: RX.cream,
        borderRadius: 18,
      }}>
        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
          fontWeight: 700, letterSpacing: "0.22em", color: RX.gold,
          textTransform: "uppercase",
        }}>Strategic recommendation</div>
        <p style={{
          fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
          fontSize: 17, lineHeight: 1.5, margin: "10px 0 0", color: RX.cream,
        }}>{HEADLINE}</p>
        <div style={{
          marginTop: 14, fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11.5, color: "rgba(244,237,219,0.7)", lineHeight: 1.5,
        }}>
          Full doc: claude-state/product-research/<br/>femwell-complete-life-planner-2026-05-16.md
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Life Stages view — phone mockups, build roadmap, architecture, LLM vs Human
// ═══════════════════════════════════════════════════════════════════════════

// Phase color palette mirrors the production Planner.
const STAGE_PHASE = {
  menstrual:  "#9A2845",
  follicular: "#D4745A",
  ovulatory:  "#C8A040",
  luteal:     "#7B5E9A",
  pregT1:     "#C9A95C",
  pregT2:     "#7B5E9A",
  pregT3:     "#4A2A3A",
};

const STAGE_VIZ = [
  {
    id: "reproductive",
    label: "Reproductive",
    sub: "18-35 · regular cycle",
    eyebrow: "TODAY · FRI 16 MAY",
    phaseColor: STAGE_PHASE.luteal,
    phaseRibbon: true,
    ribbonGradient: "linear-gradient(to right, #9A2845 0%, #D4745A 28%, #C8A040 50%, #7B5E9A 78%, #9A2845 100%)",
    todayCrumb: "A small luteal afternoon — softness over throughput.",
    cycleCrumb: "May at a glance — luteal week of twenty-eight.",
    heroEyebrow: "Chapter IV · Luteal · Day 22",
    heroHeadline: "Soften the edges. Plan the small wins.",
    pillars: [
      { name: "Sleep",     value: "7.2h",   bar: 80 },
      { name: "Energy",    value: "68",     bar: 68 },
      { name: "Mood",      value: "82",     bar: 82 },
      { name: "Hydration", value: "6/8",    bar: 75 },
      { name: "Movement",  value: "32m",    bar: 71 },
      { name: "Cycle",     value: "Day 22", bar: 78 },
    ],
    storyTag: "Luteal · Wind-down",
    storyTitle: "The dimmable lamp is your friend tonight.",
    cycleLabel: "Cycle",
    cycleHeader: "May 2026 · 5 weekly ribbons",
    cycleTitle: "Phase ribbons flow across the month.",
    cycleVisual: "ribbon",
    adds: ["Capacity-aware planner overlay", "Contraception Memory", "Partner Sync 2.0"],
    hides: [],
  },
  {
    id: "pcos",
    label: "PCOS",
    sub: "28 · Day 84, no bleed",
    eyebrow: "TODAY · DAY 84 SINCE LAST BLEED",
    phaseColor: "#A86A52",
    phaseRibbon: false,
    todayCrumb: "Steady levers — strength, walk, protein.",
    cycleCrumb: "Bleed events instead of phase prediction.",
    heroEyebrow: "PCOS Mode · Lifestyle anchors",
    heroHeadline: "Protein at breakfast. Walk after lunch. Lift twice this week.",
    todayBanner: "PCOS Mode — we are not predicting your next period.",
    pillars: [
      { name: "Sleep",   value: "6.5h",   bar: 72 },
      { name: "Weight",  value: "−0.4kg", bar: 60 },
      { name: "Mood",    value: "70",     bar: 70 },
      { name: "HbA1c",   value: "5.4%",   bar: 65 },
      { name: "Acne",    value: "mod.",   bar: 40 },
      { name: "Bleed",   value: "Day 84", bar: 0  },
    ],
    storyTag: "PCOS · Anchors",
    storyTitle: "Three levers. Walk, lift, protein.",
    cycleLabel: "Hormones",
    cycleHeader: "Bleed events · last 12 months",
    cycleTitle: "Two bleeds. Not predicting the next one.",
    cycleVisual: "bleeds",
    cycleBanner: "Day 84 — NHS guidance suggests inducing a withdrawal bleed every 3-4 months. Worth a GP conversation.",
    adds: ["Bleed-events list", "Lab import (HbA1c, fasting insulin, free T, SHBG, AMH)", "Lifestyle anchor card", "Care Bridge to endocrinology"],
    hides: ["Fertile window", "Phase colours", "Phase prediction"],
  },
  {
    id: "peri",
    label: "Perimenopause",
    sub: "49 · on HRT, irregular",
    eyebrow: "TODAY · 3 HOT FLUSHES YESTERDAY",
    phaseColor: "#A86A52",
    phaseRibbon: true,
    ribbonGradient: "linear-gradient(to right, #A86A52 0%, #C8A040 50%, #6B8F5A 100%)",
    todayCrumb: "Symptom load: moderate. Sleep score 62.",
    cycleCrumb: "Symptom heatmap, 90 days. HRT timeline overlaid.",
    heroEyebrow: "Peri Mode · Day 14 of HRT cycle",
    heroHeadline: "Patch change due today. Utrogestan tonight.",
    pillars: [
      { name: "Sleep",   value: "6.2h",   bar: 62 },
      { name: "Flushes", value: "3 tdy",  bar: 30 },
      { name: "Mood",    value: "72",     bar: 72 },
      { name: "Brain",   value: "low",    bar: 35 },
      { name: "Joints",  value: "knees",  bar: 40 },
      { name: "HRT",     value: "patch",  bar: 100 },
    ],
    storyTag: "Peri · HRT log",
    storyTitle: "Hot flush frequency down 60% since March 3.",
    cycleLabel: "Patterns",
    cycleHeader: "90-day symptom heatmap",
    cycleTitle: "HRT timeline overlay across symptoms.",
    cycleVisual: "heatmap",
    adds: ["Symptom-pattern ribbon", "HRT log entity + symptom correlation", "Hot-flush quick-tap", "GSM screen", "GP-report PDF"],
    hides: ["Fertile window prediction", "Phase colours dominance"],
  },
  {
    id: "pregnant",
    label: "Pregnant · T2",
    sub: "33 · 20 weeks 3 days",
    eyebrow: "TODAY · WEEK 20 · DAY 3",
    phaseColor: STAGE_PHASE.pregT2,
    phaseRibbon: true,
    ribbonGradient: "linear-gradient(to right, #C9A95C 0%, #C9A95C 33%, #7B5E9A 33%, #7B5E9A 66%, #4A2A3A 66%, #4A2A3A 100%)",
    todayCrumb: "Banana-sized. The 20-week anomaly scan is this week.",
    cycleCrumb: "Forty-week journey. Anomaly scan due.",
    heroEyebrow: "Week 20 · Trimester II",
    heroHeadline: "Anomaly scan Tuesday at 10:40. The decoder is ready.",
    pillars: [
      { name: "Sleep",     value: "7.5h",   bar: 83 },
      { name: "Energy",    value: "65",     bar: 65 },
      { name: "Mood",      value: "78",     bar: 78 },
      { name: "Hydration", value: "8/8",    bar: 100 },
      { name: "Move",      value: "20m",    bar: 44 },
      { name: "Baby",      value: "20w3d",  bar: 50 },
    ],
    storyTag: "T2 · This week",
    storyTitle: "What the anomaly scan looks for, in plain English.",
    cycleLabel: "Journey",
    cycleHeader: "40-week pregnancy timeline",
    cycleTitle: "T1 → T2 → T3. You're 51% of the way.",
    cycleVisual: "timeline",
    adds: ["Pregnancy week ribbon", "NHS antenatal schedule mirror", "Kick counter (from week 24)", "Scan-result decoder", "Birth-plan composer", "Hospital bag list"],
    hides: ["Contraception", "Ovulation / fertile window", "Period prediction", "Cycle phase colours"],
  },
  {
    id: "teen",
    label: "Teenager",
    sub: "15 · 8 cycles tracked",
    eyebrow: "TODAY · DAY 12 · STILL LEARNING",
    phaseColor: STAGE_PHASE.follicular,
    phaseRibbon: true,
    ribbonGradient: "linear-gradient(to right, rgba(212,116,90,0.35) 0%, rgba(200,160,64,0.35) 50%, rgba(123,94,154,0.35) 100%)",
    todayCrumb: "How's your day going?",
    cycleCrumb: "A learning record, not a prediction.",
    heroEyebrow: "Day 12 of an estimated 34-day cycle",
    heroHeadline: "You've logged 8 cycles. The pattern is still emerging.",
    todayBanner: "Parent Bridge — Mum can see: dates only.",
    pillars: [
      { name: "Sleep",  value: "8.0h",   bar: 89 },
      { name: "Energy", value: "—",      bar: 0  },
      { name: "Mood",   value: "warm",   bar: 75 },
      { name: "Cramps", value: "none",   bar: 0  },
      { name: "Skin",   value: "ok",     bar: 60 },
      { name: "Cycle",  value: "Day 12", bar: 35 },
    ],
    storyTag: "Teen · Learning",
    storyTitle: "Your cycle takes up to 2 years to settle. That's normal.",
    cycleLabel: "Cycle",
    cycleHeader: "Learning record",
    cycleTitle: "8 cycles tracked. Mean length 34d, range 28-41d.",
    cycleVisual: "honest",
    adds: ["Teen Mode soft copy", "Parent Bridge (opt-in, granular, revocable)", "GP-ready summary PDF", "PMS-vs-PMDD self-screen", "Crisis routing (Childline, YoungMinds, NHS 111)"],
    hides: ["Contraception (until 16+)", "TTC", "Pregnancy", "Partner sync", "HRT"],
  },
  {
    id: "ttc",
    label: "TTC",
    sub: "31 · IUI cycle 2 · CD8",
    eyebrow: "TODAY · CD8 · STIM DAY 4",
    phaseColor: STAGE_PHASE.ovulatory,
    phaseRibbon: true,
    ribbonGradient: "linear-gradient(to right, #9A2845 0%, #D4745A 30%, #C8A040 60%, #C8A040 100%)",
    todayCrumb: "Stim day four. Scan Monday. Trigger most likely Tuesday.",
    cycleCrumb: "Cycle Day Math — CD1, CD8, CD14.",
    heroEyebrow: "TTC Mode · Cycle Day 8",
    heroHeadline: "Most likely fertile Tues-Fri. Lower confidence today.",
    pillars: [
      { name: "Sleep", value: "7.0h",  bar: 78 },
      { name: "BBT",   value: "36.4°", bar: 60 },
      { name: "Mood",  value: "anx.",  bar: 50 },
      { name: "OPK",   value: "low",   bar: 25 },
      { name: "Supps", value: "5/5",   bar: 100 },
      { name: "CD",    value: "8",     bar: 28 },
    ],
    storyTag: "TTC · Two-week-wait",
    storyTitle: "Holding the wait. Not pretending to know.",
    cycleLabel: "Clinical",
    cycleHeader: "Cycle Day Math · IUI #2",
    cycleTitle: "CD1 → CD8 → CD14 → CD28.",
    cycleVisual: "clinical",
    adds: ["BBT + OPK photo logger", "CD-labelled ribbon (CD1, CD8, CD14)", "IVF / IUI clinical timeline", "Two-week-wait companion", "UK supplement stack", "Pregnancy-loss path"],
    hides: ["Cycle phase-colour dominance"],
  },
  {
    id: "postmen",
    label: "Post-menopause",
    sub: "62 · 7 years post",
    eyebrow: "TODAY · DEXA DUE IN 4 MONTHS",
    phaseColor: "#4A2A3A",
    phaseRibbon: false,
    todayCrumb: "Bone is silent until it isn't. Take the walk.",
    cycleCrumb: "Annual health rhythm.",
    heroEyebrow: "Post-Menopause Mode",
    heroHeadline: "Bone, heart, GSM, mood — the long-game pillars.",
    pillars: [
      { name: "Sleep", value: "7.5h",     bar: 83 },
      { name: "Bone",  value: "DEXA 4mo", bar: 60 },
      { name: "Mood",  value: "calm",     bar: 85 },
      { name: "BP",    value: "128/82",   bar: 70 },
      { name: "GSM",   value: "Gina ✓",   bar: 90 },
      { name: "Move",  value: "45m",      bar: 100 },
    ],
    storyTag: "Post-meno · GSM",
    storyTitle: "Gina is OTC. Most women still don't know.",
    cycleLabel: "Health",
    cycleHeader: "Annual health rhythm",
    cycleTitle: "DEXA · smear · mammogram · NHS Health Check.",
    cycleVisual: "calendar",
    cycleBanner: "No cycle ribbon — centred on long-term health.",
    adds: ["Post-Menopause Mode", "GSM self-screen + treatment tracker", "DEXA / smear / mammogram cadence", "Cardiovascular check rhythm", "Life-pivot planning"],
    hides: ["Cycle ribbon entirely", "Phase prediction", "Fertile window"],
  },
];

// Cycle-tab visual renderer per stage kind
function CycleVisual({ kind }) {
  if (kind === "ribbon") {
    const rows = [
      ["#9A2845","#9A2845","#9A2845","#9A2845","#D4745A","#D4745A","#D4745A"],
      ["#D4745A","#D4745A","#D4745A","#D4745A","#D4745A","#C8A040","#C8A040"],
      ["#C8A040","#C8A040","#C8A040","#C8A040","#C8A040","#7B5E9A","#7B5E9A"],
      ["#7B5E9A","#7B5E9A","#7B5E9A","#7B5E9A","#7B5E9A","#7B5E9A","#7B5E9A"],
      ["#7B5E9A","#7B5E9A","#7B5E9A","#7B5E9A","#9A2845","#9A2845","#9A2845"],
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
            {r.map((c, j) => (
              <div key={j} style={{
                height: 14, borderRadius: 2, background: c,
                position: "relative",
              }}>
                {i === 3 && j === 1 && (
                  <span style={{
                    position: "absolute", top: 4, left: "50%",
                    transform: "translateX(-50%)",
                    width: 5, height: 5, borderRadius: 9999,
                    background: RX.cream, border: `1px solid ${RX.cream}`,
                  }} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (kind === "timeline") {
    return (
      <div style={{ position: "relative", paddingBottom: 18 }}>
        <div style={{
          height: 10, borderRadius: 5,
          background: "linear-gradient(to right, #C9A95C 0%, #C9A95C 33%, #7B5E9A 33%, #7B5E9A 66%, #4A2A3A 66%, #4A2A3A 100%)",
        }} />
        <div style={{
          position: "absolute", top: -2, left: "51%",
          width: 2.5, height: 14, background: RX.espresso, borderRadius: 1,
        }} />
        <div style={{
          position: "absolute", top: 14, left: "42%",
          fontSize: 8, fontWeight: 700, color: RX.espresso,
          letterSpacing: "0.08em",
        }}>WEEK 20</div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 7.5, color: RX.espressoMid, marginTop: 4,
          fontWeight: 600, letterSpacing: "0.08em",
        }}>
          <span>T1</span><span>T2</span><span>T3</span>
        </div>
      </div>
    );
  }
  if (kind === "bleeds") {
    const bleeds = [
      { date: "Mar 12", days: "5d" },
      { date: "Aug 04", days: "4d" },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {bleeds.map((b, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "5px 8px", background: RX.cream,
            borderRadius: 4, border: `0.5px solid ${RX.rule}`,
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: RX.espresso }}>{b.date}</span>
            <span style={{ fontSize: 9, color: RX.plumMid, fontStyle: "italic" }}>{b.days}</span>
          </div>
        ))}
        <div style={{
          padding: "4px 8px", fontSize: 9, color: RX.plumMid,
          fontStyle: "italic", textAlign: "center",
        }}>+ 84 days since</div>
      </div>
    );
  }
  if (kind === "heatmap") {
    // 10×10 grid of varying intensity
    const intensity = [3,2,4,1,3,2,3,4,2,1, 2,3,1,4,2,3,1,2,3,4, 4,3,2,3,4,1,2,3,2,1, 1,2,3,4,3,2,1,2,3,4, 3,4,2,1,2,3,4,3,2,1, 2,1,3,4,1,2,3,4,2,3, 4,3,2,1,3,4,2,1,3,2, 1,2,4,3,2,1,2,3,4,1, 3,4,1,2,3,4,2,1,3,2, 2,1,3,4,1,3,2,1,2,1];
    return (
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 1,
      }}>
        {intensity.map((v, i) => (
          <div key={i} style={{
            aspectRatio: "1", borderRadius: 1,
            background: `rgba(168,106,82,${0.18 * v})`,
          }} />
        ))}
      </div>
    );
  }
  if (kind === "honest") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {[0,1,2,3,4].map((row) => (
          <div key={row} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
            {[0,1,2,3,4,5,6].map((col) => {
              const isLogged = (row * 7 + col) < 12;
              const isToday = row === 1 && col === 4;
              return (
                <div key={col} style={{
                  height: 14, borderRadius: 2,
                  background: isLogged ? "rgba(212,116,90,0.35)" : "rgba(58,44,26,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 7, color: RX.espressoMid, fontWeight: 600,
                  border: isToday ? `1px solid ${STAGE_PHASE.follicular}` : "none",
                }}>{isLogged ? "" : "?"}</div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
  if (kind === "clinical") {
    const days = [
      { l: "CD1",  m: "bleed",   c: "#9A2845" },
      { l: "CD8",  m: "stim",    c: "#C8A040" },
      { l: "CD14", m: "trigger", c: "#D4745A" },
      { l: "CD28", m: "beta",    c: "#7B5E9A" },
    ];
    return (
      <div style={{ position: "relative" }}>
        <div style={{ height: 4, background: RX.rule, borderRadius: 2, margin: "10px 0 8px" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {days.map((d, i) => (
            <div key={i} style={{ textAlign: "center", position: "relative", marginTop: -14 }}>
              <div style={{
                width: 10, height: 10, borderRadius: 9999,
                background: d.c, margin: "0 auto",
                border: `2px solid ${RX.creamWarm}`,
              }} />
              <div style={{
                fontSize: 8.5, fontWeight: 700, color: RX.espresso,
                marginTop: 2, letterSpacing: "0.04em",
              }}>{d.l}</div>
              <div style={{ fontSize: 7.5, color: RX.plumMid, fontStyle: "italic" }}>{d.m}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "calendar") {
    const appts = [
      { date: "Sep 2026", name: "DEXA scan",         due: "4 months" },
      { date: "Jan 2027", name: "Mammogram",         due: "8 months" },
      { date: "Mar 2027", name: "NHS Health Check",  due: "10 months" },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {appts.map((a, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "5px 8px", background: RX.cream,
            borderRadius: 4, border: `0.5px solid ${RX.rule}`,
          }}>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: RX.espresso }}>{a.name}</div>
              <div style={{ fontSize: 8, color: RX.plumMid, fontStyle: "italic" }}>{a.date}</div>
            </div>
            <span style={{
              fontSize: 8, fontWeight: 700, color: RX.goldDeep,
              letterSpacing: "0.08em",
            }}>{a.due.toUpperCase()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function MiniSun({ color = "#C9A95C", size = 36 }) {
  const rays = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" style={{ flexShrink: 0 }}>
      <g transform="translate(18 18)">
        {rays.map((i) => (
          <line key={i} x1="0" y1="-7" x2="0" y2="-13"
            stroke={color} strokeWidth="1.6" strokeLinecap="round"
            transform={`rotate(${i * 30})`} />
        ))}
        <circle r="6" fill={RX.cream} stroke={color} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function PhoneMockup({ data, view, onSwitchView }) {
  const ph = data.phaseColor;
  return (
    <div style={{
      width: 286, minHeight: 580,
      background: RX.cream, borderRadius: 28,
      border: "8px solid #1a1a1a",
      overflow: "hidden", position: "relative",
      boxShadow: "0 12px 40px rgba(58,44,26,0.18)",
      fontFamily: "'Inter', system-ui, sans-serif",
      margin: "0 auto",
    }}>
      {/* Status bar */}
      <div style={{
        height: 22, display: "flex",
        justifyContent: "space-between", alignItems: "center",
        padding: "0 16px", fontSize: 10.5, fontWeight: 700,
        color: RX.espresso, background: RX.cream,
      }}>
        <span>9:41</span>
        <span style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 9.5 }}>
          <span>5G</span>
          <span style={{ display: "inline-block", width: 16, height: 8, border: `1px solid ${RX.espresso}`, borderRadius: 2, position: "relative" }}>
            <span style={{ position: "absolute", top: 1, left: 1, bottom: 1, width: "75%", background: RX.espresso, borderRadius: 1 }} />
          </span>
        </span>
      </div>

      {/* Sticky header */}
      <div style={{ padding: "10px 14px 6px" }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
          color: RX.goldDeep, textTransform: "uppercase",
        }}>{data.eyebrow}</div>
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 24,
          fontWeight: 500, color: RX.espresso, marginTop: 2,
          lineHeight: 1.05, letterSpacing: "-0.01em",
        }}>{view === "today" ? "Today" : data.cycleLabel}</div>
        <div style={{
          fontStyle: "italic", fontSize: 11, color: RX.plumMid,
          marginTop: 3, fontFamily: "Georgia, serif", lineHeight: 1.3,
        }}>{view === "today" ? data.todayCrumb : data.cycleCrumb}</div>

        {/* In-phone tab pills */}
        <div style={{
          display: "inline-flex", gap: 3, padding: 3, marginTop: 8,
          background: RX.creamWarm, borderRadius: 9999,
          border: `0.5px solid ${RX.rule}`,
        }}>
          {["today", "cycle"].map((t) => {
            const active = t === view;
            return (
              <button key={t} onClick={() => onSwitchView(t)} style={{
                padding: "4px 13px", fontSize: 10,
                fontWeight: active ? 700 : 600,
                fontStyle: active ? "italic" : "normal",
                fontFamily: active ? "'Fraunces', Georgia, serif" : "'Inter', system-ui, sans-serif",
                background: active ? RX.espresso : "transparent",
                color: active ? RX.cream : RX.espressoMid,
                border: "none", borderRadius: 9999, cursor: "pointer",
                letterSpacing: "0.04em", minWidth: 56,
              }}>
                {t === "today" ? "Today" : data.cycleLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase ribbon strip */}
      {data.phaseRibbon && view === "today" && (
        <div style={{
          height: 6, margin: "8px 14px 0",
          borderRadius: 3,
          background: data.ribbonGradient || ph,
        }} />
      )}

      {/* Body */}
      <div style={{ padding: "10px 14px 56px" }}>
        {view === "today"
          ? <PhoneTodayBody data={data} />
          : <PhoneCycleBody data={data} />}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 44, background: "#FFFFFF",
        borderTop: `0.5px solid ${RX.rule}`,
        display: "flex", justifyContent: "space-around",
        alignItems: "center",
      }}>
        {["Today","Cycle","Jess","Care","More"].map((n, i) => (
          <div key={n} style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
            color: i === 0 ? RX.espresso : RX.espressoMid,
            fontFamily: i === 0 ? "'Fraunces', Georgia, serif" : "'Inter', system-ui, sans-serif",
            fontStyle: i === 0 ? "italic" : "normal",
          }}>{n}</div>
        ))}
      </div>
    </div>
  );
}

function PhoneTodayBody({ data }) {
  const ph = data.phaseColor;
  return (
    <>
      {/* Hero card */}
      <div style={{
        background: RX.creamWarm, borderRadius: 10,
        padding: "10px 12px", border: `0.5px solid ${RX.rule}`,
        display: "flex", gap: 10, alignItems: "center",
      }}>
        <MiniSun color={ph} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em",
            color: ph, textTransform: "uppercase",
          }}>{data.heroEyebrow}</div>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 13,
            fontWeight: 500, color: RX.espresso, marginTop: 3,
            lineHeight: 1.25, fontStyle: "italic",
          }}>{data.heroHeadline}</div>
        </div>
      </div>

      {/* Optional banner */}
      {data.todayBanner && (
        <div style={{
          marginTop: 8, padding: "7px 10px",
          background: RX.cream, borderRadius: 6,
          border: `0.5px dashed ${RX.goldDeep}`,
          fontSize: 10, color: RX.espresso, fontStyle: "italic",
          fontFamily: "Georgia, serif", lineHeight: 1.4,
        }}>{data.todayBanner}</div>
      )}

      {/* Pillars grid 2×3 */}
      <div style={{
        marginTop: 9, display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr", gap: 4,
      }}>
        {data.pillars.map((p) => (
          <div key={p.name} style={{
            background: RX.creamWarm, borderRadius: 6,
            padding: "6px 7px 9px", border: `0.5px solid ${RX.rule}`,
            position: "relative", minHeight: 50,
          }}>
            <div style={{
              fontSize: 7.5, fontWeight: 700, letterSpacing: "0.10em",
              color: RX.espressoMid, textTransform: "uppercase",
            }}>{p.name}</div>
            <div style={{
              fontFamily: "'Fraunces', Georgia, serif", fontSize: 13,
              fontWeight: 500, color: RX.espresso, marginTop: 2,
              lineHeight: 1, fontStyle: "italic",
            }}>{p.value}</div>
            <span aria-hidden="true" style={{
              position: "absolute", top: 5, right: 5,
              width: 4.5, height: 4.5, borderRadius: 9999,
              background: ph,
            }} />
            {p.bar > 0 && (
              <span aria-hidden="true" style={{
                position: "absolute", left: 0, right: 0, bottom: 0,
                height: 1.5, background: "rgba(58,44,26,0.06)",
              }}>
                <span style={{
                  display: "block", height: "100%",
                  width: `${p.bar}%`,
                  background: ph, opacity: 0.85,
                }} />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Daily Story */}
      <div style={{
        marginTop: 10, padding: "9px 12px",
        background: RX.paper, borderRadius: 8,
        border: `0.5px solid ${RX.rule}`,
      }}>
        <div style={{
          fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em",
          color: RX.goldDeep, textTransform: "uppercase",
        }}>{data.storyTag}</div>
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 12.5,
          fontWeight: 500, color: RX.espresso, marginTop: 3,
          lineHeight: 1.25, fontStyle: "italic",
        }}>{data.storyTitle}</div>
      </div>
    </>
  );
}

function PhoneCycleBody({ data }) {
  const ph = data.phaseColor;
  return (
    <>
      {data.cycleBanner && (
        <div style={{
          padding: "9px 11px", marginBottom: 8,
          background: RX.cream, borderRadius: 8,
          border: `0.5px solid ${RX.rule}`,
          borderLeft: `2px solid ${ph}`,
          fontSize: 10.5, color: RX.espresso, fontStyle: "italic",
          fontFamily: "Georgia, serif", lineHeight: 1.4,
        }}>{data.cycleBanner}</div>
      )}

      <div style={{
        padding: "10px 12px", background: RX.creamWarm,
        borderRadius: 10, border: `0.5px solid ${RX.rule}`,
      }}>
        <div style={{
          fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em",
          color: RX.goldDeep, textTransform: "uppercase",
        }}>{data.cycleHeader}</div>
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 13,
          fontWeight: 500, color: RX.espresso, marginTop: 3,
          fontStyle: "italic", lineHeight: 1.2,
        }}>{data.cycleTitle}</div>
        <div style={{ marginTop: 8 }}>
          <CycleVisual kind={data.cycleVisual} />
        </div>
      </div>

      {data.adds.length > 0 && (
        <div style={{
          marginTop: 8, padding: "9px 12px",
          background: RX.cream, borderRadius: 8,
          border: `0.5px solid ${RX.rule}`,
          borderLeft: `2px solid ${RX.sage}`,
        }}>
          <div style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em",
            color: RX.sage, textTransform: "uppercase",
          }}>+ Added</div>
          <ul style={{ margin: "5px 0 0", padding: "0 0 0 14px" }}>
            {data.adds.map((a, i) => (
              <li key={i} style={{
                fontSize: 9.5, color: RX.espresso,
                lineHeight: 1.4, marginBottom: 2,
              }}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {data.hides.length > 0 && (
        <div style={{
          marginTop: 6, padding: "9px 12px",
          background: RX.cream, borderRadius: 8,
          border: `0.5px solid ${RX.rule}`,
          borderLeft: `2px solid ${RX.rose}`,
        }}>
          <div style={{
            fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em",
            color: RX.rose, textTransform: "uppercase",
          }}>− Hidden</div>
          <ul style={{ margin: "5px 0 0", padding: "0 0 0 14px" }}>
            {data.hides.map((h, i) => (
              <li key={i} style={{
                fontSize: 9.5, color: RX.espresso,
                lineHeight: 1.4, marginBottom: 2,
              }}>{h}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// Roadmap with LLM-only / needs-review badges per item
const ROADMAP_STAGES = [
  {
    key: "m3",
    title: "3 months",
    subtitle: "Proof of architecture · ship now",
    color: "#6B8F5A",
    items: [
      { name: "Pre-TTC mode",            desc: "Three months of better data before the TTC switch.", badge: "LLM only" },
      { name: "TTC Mode v1",             desc: "BBT + OPK photo logger; confidence-banded fertile window.", badge: "LLM only" },
      { name: "Perimenopause Mode v1",   desc: "Symptom-pattern ribbon + HRT log + hot-flush quick-tap.", badge: "LLM only" },
      { name: "Contraception Memory",    desc: "New entity. Structured logging. No clinical advice.", badge: "LLM only" },
      { name: "GP-ready PDF export",     desc: "One feature, three modes (teen / peri / postpartum).", badge: "LLM only" },
      { name: "Confidence honesty",      desc: "\"Still learning\" pattern extended across the product.", badge: "LLM only" },
      { name: "Care Bridge expansion",   desc: "Midwife, fertility coord, perinatal MH team recipients.", badge: "LLM only" },
    ],
  },
  {
    key: "m6",
    title: "6 months",
    subtitle: "Real clinical care · revenue band",
    color: "#C8A040",
    items: [
      { name: "Pregnancy Mode",          desc: "Full mode replacement. Week ribbon. Antenatal mirror.", badge: "needs review" },
      { name: "Postpartum Mode",         desc: "EPDS + pelvic-floor (Squeezy-aligned).", badge: "needs review" },
      { name: "Teen Mode + Parent Bridge", desc: "Safeguarding policy + adolescent MH advisor.", badge: "needs review" },
      { name: "PCOS Mode v1",            desc: "Bleed events, lab import, lifestyle anchors.", badge: "LLM only" },
      { name: "HRT decision support",    desc: "Questions to ask your GP. Not prescribing.", badge: "needs review" },
    ],
  },
  {
    key: "m9",
    title: "9 months+",
    subtitle: "Partnerships · clinical sign-off · moat",
    color: "#D45E52",
    items: [
      { name: "NHS scan-result decoder", desc: "Highest liability. MHRA assessment.", badge: "needs review" },
      { name: "IVF / IUI sub-mode",      desc: "Needs fertility clinic partnership.", badge: "needs review" },
      { name: "Endo pain mapping",       desc: "3+ months qualitative research first.", badge: "needs review" },
      { name: "PMDD DRSP-format",        desc: "Specialist referral. Needs PMDD advisor.", badge: "needs review" },
      { name: "Crisis-language detection", desc: "Safety-critical. Do not rush.", badge: "needs review" },
      { name: "Full menopause + GSM",    desc: "Bone + heart rhythm. Long-tail retention.", badge: "LLM only" },
      { name: "Capacitor + StoreKit",    desc: "RevenueCat for App Store IAP paywall.", badge: "needs review" },
    ],
  },
];

const ARCH_SLOTS = [
  "topRibbon",
  "eyebrow",
  "hero",
  "pillars",
  "storyReel",
  "cycleHeader",
  "cycleVisual",
];

const LLM_ONLY = [
  "Mode shells (Pre-TTC, TTC v1, Peri v1, PCOS v1).",
  "Symptom-pattern ribbon + HRT log entity.",
  "Contraception Memory entity + correlation surface.",
  "GP-ready PDF export (per stage).",
  "Confidence-honesty copy and gating across surfaces.",
  "Care Bridge recipient expansion.",
  "Architecture refactor — Life Stage as a first-class enum on UserProfile.",
  "PlannerAdapter wiring — slot selectors per stage / condition.",
];

const NEEDS_HUMAN = [
  "Pregnancy Mode — clinical accuracy needs obstetrics advisor sign-off.",
  "NHS scan-result decoder — MHRA medical-device assessment required.",
  "Postpartum EPDS thresholds — perinatal MH advisor must set them.",
  "Teen Mode + Parent Bridge — safeguarding policy + adolescent MH advisor + legal review.",
  "Crisis-language detection — clinical advisor + safeguarding lawyer.",
  "HRT decision support — UK menopause specialist must write copy.",
  "Miscarriage path — bereaved-user testing before ship.",
  "Privacy + retention review for pregnancy data (UK GDPR + Caldicott).",
];

function StagePillRow({ active, onChange }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 6,
      marginTop: 14, justifyContent: "center",
    }}>
      {STAGE_VIZ.map((s) => {
        const isActive = s.id === active;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            aria-pressed={isActive}
            style={{
              padding: "8px 14px",
              fontFamily: isActive ? "'Fraunces', Georgia, serif" : "'Inter', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: isActive ? 700 : 600,
              fontStyle: isActive ? "italic" : "normal",
              letterSpacing: "0.02em",
              background: isActive ? RX.espresso : RX.creamWarm,
              color: isActive ? RX.cream : RX.espressoMid,
              border: isActive ? `1px solid ${RX.espresso}` : `1px solid ${RX.rule}`,
              borderRadius: 9999, cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function RoadmapColumn({ col }) {
  return (
    <article style={{
      background: RX.creamWarm, borderRadius: 14,
      border: `1px solid ${RX.rule}`, borderTop: `4px solid ${col.color}`,
      padding: "16px 16px 18px", flex: 1, minWidth: 240,
    }}>
      <div style={{
        fontFamily: "'Fraunces', Georgia, serif", fontSize: 22,
        fontWeight: 500, color: col.color, fontStyle: "italic",
        letterSpacing: "-0.01em",
      }}>{col.title}</div>
      <div style={{
        fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10.5,
        color: RX.espressoMid, letterSpacing: "0.06em",
        textTransform: "uppercase", fontWeight: 700, marginTop: 2,
      }}>{col.subtitle}</div>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {col.items.map((it, i) => {
          const isLLM = it.badge === "LLM only";
          return (
            <div key={i} style={{
              padding: "9px 11px", background: RX.cream,
              borderRadius: 8, border: `0.5px solid ${RX.rule}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <div style={{
                  fontFamily: "'Fraunces', Georgia, serif", fontSize: 13.5,
                  fontWeight: 600, color: RX.espresso,
                }}>{it.name}</div>
                <div style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em",
                  color: isLLM ? RX.sage : RX.rose,
                  background: isLLM ? "rgba(107,143,90,0.10)" : "rgba(212,94,82,0.10)",
                  textTransform: "uppercase",
                  padding: "2px 7px", borderRadius: 9999, whiteSpace: "nowrap",
                }}>{it.badge}</div>
              </div>
              <div style={{
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11.5,
                color: RX.espressoMid, marginTop: 4, lineHeight: 1.45,
              }}>{it.desc}</div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function ArchDiagram() {
  return (
    <div style={{
      background: RX.creamWarm, borderRadius: 14,
      border: `1px solid ${RX.rule}`, padding: "20px 16px",
      marginTop: 16,
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        {/* UserProfile box */}
        <div style={{
          background: RX.cream, border: `1px solid ${RX.espressoMid}`,
          borderRadius: 12, padding: "12px 16px", minWidth: 220, textAlign: "center",
        }}>
          <div style={{
            fontFamily: "'Inter', system-ui, sans-serif", fontSize: 9.5,
            fontWeight: 700, letterSpacing: "0.18em", color: RX.goldDeep,
            textTransform: "uppercase",
          }}>UserProfile</div>
          <div style={{ marginTop: 4, fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 600, color: RX.espresso, fontStyle: "italic" }}>
            Halli, 28
          </div>
          <div style={{
            marginTop: 8, fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 10.5, color: RX.espressoMid, lineHeight: 1.6,
          }}>
            <div><strong style={{ color: RX.espresso }}>lifeStage:</strong> "perimenopause"</div>
            <div><strong style={{ color: RX.espresso }}>conditions[]:</strong> ["PCOS","HRT"]</div>
            <div><strong style={{ color: RX.espresso }}>pregnancy_state:</strong> null</div>
            <div><strong style={{ color: RX.espresso }}>mode_overrides:</strong> {"{}"}</div>
          </div>
        </div>

        {/* Arrow down */}
        <ArchArrow />

        {/* Planner adapter */}
        <div style={{
          background: RX.espresso, color: RX.cream,
          border: `1px solid ${RX.espresso}`,
          borderRadius: 12, padding: "12px 18px", minWidth: 220, textAlign: "center",
        }}>
          <div style={{
            fontFamily: "'Inter', system-ui, sans-serif", fontSize: 9.5,
            fontWeight: 700, letterSpacing: "0.18em", color: RX.gold,
            textTransform: "uppercase",
          }}>PlannerAdapter</div>
          <div style={{
            marginTop: 4, fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 14, fontWeight: 500, fontStyle: "italic",
          }}>Resolves slot components by stage + condition</div>
        </div>

        {/* Arrow down */}
        <ArchArrow color={RX.gold} />

        {/* 7 slot boxes */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6,
          marginTop: 6, width: "100%", maxWidth: 460,
        }}>
          {ARCH_SLOTS.map((s) => (
            <div key={s} style={{
              background: RX.cream, border: `0.5px solid ${RX.rule}`,
              borderRadius: 8, padding: "9px 11px",
              fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11,
              color: RX.espresso, fontWeight: 600, textAlign: "center",
            }}>
              <span style={{
                display: "inline-block", width: 6, height: 6, borderRadius: 9999,
                background: RX.goldDeep, marginRight: 6,
              }} />
              {s}
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 14, padding: "10px 14px",
          background: RX.cream, borderRadius: 8, border: `1px dashed ${RX.rule}`,
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12,
          color: RX.plum, lineHeight: 1.45, textAlign: "center", maxWidth: 460,
        }}>
          Each stage maps to a slot bundle. Conditions are cross-cutting modifiers — PCOS + perimenopausal? Both packs apply.
        </div>
      </div>
    </div>
  );
}

function ArchArrow({ color }) {
  return (
    <svg width="14" height="22" viewBox="0 0 14 22" aria-hidden="true" style={{ margin: "8px 0" }}>
      <line x1="7" y1="0" x2="7" y2="16" stroke={color || RX.espressoMid} strokeWidth="1.5" />
      <polygon points="3,14 11,14 7,21" fill={color || RX.espressoMid} />
    </svg>
  );
}

function LifeStagesView() {
  const [stageId, setStageId] = useState("reproductive");
  const [view, setView] = useState("today");
  const data = STAGE_VIZ.find((s) => s.id === stageId) || STAGE_VIZ[0];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "8px 16px 40px" }}>
      {/* Hero */}
      <header style={{ paddingTop: 28 }}>
        <div style={rxEyebrow}>The plan · seven stages, one product</div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 30,
          fontWeight: 500, color: RX.espresso, letterSpacing: "-0.02em",
          margin: "10px 0 0", lineHeight: 1.12,
        }}>How <em style={{ color: RX.plum }}>Femwell</em> reshapes itself for each woman.</h1>
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14,
          color: RX.espressoMid, marginTop: 12, lineHeight: 1.55,
        }}>
          The Planner adapts. Cycle is one input among many; life stage is the lens.
          Tap a stage below — the phone shows what that woman actually sees today and on Cycle.
        </p>
      </header>

      {/* Stage pills */}
      <StagePillRow active={stageId} onChange={setStageId} />

      {/* Current stage caption */}
      <div style={{
        marginTop: 16, padding: "12px 16px",
        background: RX.creamWarm, borderRadius: 12,
        border: `1px solid ${RX.rule}`, borderLeft: `3px solid ${data.phaseColor}`,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
          fontWeight: 700, letterSpacing: "0.18em", color: data.phaseColor,
          textTransform: "uppercase",
        }}>{data.sub}</div>
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 20,
          fontWeight: 500, color: RX.espresso, marginTop: 4,
          fontStyle: "italic",
        }}>{data.label}</div>
      </div>

      {/* Phone mockup */}
      <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
        <PhoneMockup data={data} view={view} onSwitchView={setView} />
      </div>

      {/* Caption under phone */}
      <div style={{
        marginTop: 12, padding: "10px 14px",
        background: RX.cream, borderRadius: 10,
        border: `1px dashed ${RX.rule}`,
        fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12.5,
        color: RX.plum, lineHeight: 1.5, textAlign: "center",
      }}>
        Tap <strong>Today</strong> / <strong>{data.cycleLabel}</strong> inside the phone to switch tabs.
      </div>

      {/* Roadmap */}
      <h2 style={rxH2}>Build roadmap — 3 / 6 / 9 months</h2>
      <p style={rxIntroP}>
        Each card is colour-coded — <span style={{ color: RX.sage, fontWeight: 700 }}>sage</span> ships now (LLM-only),
        <span style={{ color: "#C8A040", fontWeight: 700 }}> gold</span> is the revenue band (some needs review),
        <span style={{ color: RX.rose, fontWeight: 700 }}> rose-red</span> is partnerships and moat.
      </p>
      <div style={{
        display: "flex", flexDirection: "column", gap: 14, marginTop: 18,
      }}>
        {ROADMAP_STAGES.map((c) => <RoadmapColumn key={c.key} col={c} />)}
      </div>

      {/* Architecture */}
      <h2 style={rxH2}>Architecture — Life Stage as first-class</h2>
      <p style={rxIntroP}>
        The single architectural decision: <em>lifeStage</em> is a first-class field on UserProfile.
        Every Planner slot resolves through one adapter. Conditions are cross-cutting modifiers.
      </p>
      <ArchDiagram />

      {/* LLM vs Human */}
      <h2 style={rxH2}>What Claude builds · what needs a human eye</h2>
      <p style={rxIntroP}>
        Most surfaces ship with the agent team alone. A short, named list needs a clinician,
        advisor, or lawyer in the room before the build.
      </p>
      <div style={{
        marginTop: 18, display: "grid",
        gridTemplateColumns: "1fr 1fr", gap: 12,
      }}>
        <article style={{
          background: RX.creamWarm, borderRadius: 14,
          border: `1px solid ${RX.rule}`, borderTop: `3px solid ${RX.sage}`,
          padding: "16px 14px 18px",
        }}>
          <div style={{
            fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
            fontWeight: 700, letterSpacing: "0.18em", color: RX.sage,
            textTransform: "uppercase",
          }}>LLM only</div>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 18,
            fontWeight: 500, color: RX.espresso, fontStyle: "italic",
            marginTop: 4,
          }}>Claude ships alone</div>
          <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {LLM_ONLY.map((x, i) => <RxBullet key={i}>{x}</RxBullet>)}
          </ul>
        </article>

        <article style={{
          background: RX.creamWarm, borderRadius: 14,
          border: `1px solid ${RX.rule}`, borderTop: `3px solid ${RX.rose}`,
          padding: "16px 14px 18px",
        }}>
          <div style={{
            fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
            fontWeight: 700, letterSpacing: "0.18em", color: RX.rose,
            textTransform: "uppercase",
          }}>Needs review</div>
          <div style={{
            fontFamily: "'Fraunces', Georgia, serif", fontSize: 18,
            fontWeight: 500, color: RX.espresso, fontStyle: "italic",
            marginTop: 4,
          }}>Human in the room first</div>
          <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {NEEDS_HUMAN.map((x, i) => <RxBullet key={i}>{x}</RxBullet>)}
          </ul>
        </article>
      </div>

      {/* Closing card */}
      <section style={{
        marginTop: 28, padding: "24px 22px",
        background: RX.espresso, color: RX.cream,
        borderRadius: 18,
      }}>
        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
          fontWeight: 700, letterSpacing: "0.22em", color: RX.gold,
          textTransform: "uppercase",
        }}>The plan, in one line</div>
        <p style={{
          fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
          fontSize: 17, lineHeight: 1.5, margin: "10px 0 0", color: RX.cream,
        }}>
          One Femwell. Seven life stages. The Planner adapts so a 15-year-old, a 33-year-old
          in T2, and a 62-year-old all open the same app and feel <em>met</em>.
        </p>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Scheduling view — from the 16 May 2026 scheduling research doc.
// Source: claude-state/product-research/femwell-planner-scheduling-research-2026-05-16.md
// ═══════════════════════════════════════════════════════════════════════════

const TOP_10_FEATURES = [
  {
    rank: 1, name: "Guided Daily Planning Ritual with Capacity Awareness",
    bestInClass: "Sunsama (ritual) + Motion (auto-scheduling)",
    summary: "Structured 5-10 minute morning session led by Jess. Shows today's capacity (cycle + symptoms + sleep), pulls tasks + appointments, time-blocks onto a simple visual timeline, sets one daily intention.",
    stages: "All — peri (brain fog), TTC (clinic days), postpartum (sleep deprivation).",
  },
  {
    rank: 2, name: "Capacity-Aware Task Scheduler (Smart Load Balancer)",
    bestInClass: "Motion + The Agenda (only cycle-aware option, but no AI)",
    summary: "Predicted-capacity engine distributes tasks across the cycle — cognitively demanding work surfaced in follicular / ovulatory, reduced load in late luteal / menstrual. High-stakes events auto-warn when they fall in a low-capacity phase.",
    stages: "Peri (unpredictable capacity), ADHD women (luteal amplification), teens (exam scheduling).",
  },
  {
    rank: 3, name: "Evening Reflection + Shutdown Ritual",
    bestInClass: "Sunsama (best in category)",
    summary: "3-5 minute nightly debrief: review completed + incomplete tasks, dispose of incomplete (carry / reschedule / remove), cycle-aware reflection prompt, psychological boundary between active and rest mode.",
    stages: "Peri (processing brain-fog days), postpartum (acknowledging what got done), TTC (2WW emotional processing).",
  },
  {
    rank: 4, name: "Phase-Aware Habit Engine with Habit Stacking",
    bestInClass: "Reclaim.ai + Finch + Atomic Habits",
    summary: "Habit setup wizard captures when / where / what-trigger (implementation intention). Habit stacking suggested from observed behaviour. Phase-adaptive expectations — missing exercise in menstrual phase is cycle-appropriate, not failure. Streak reads \"21 of last 28 days\", never resets to zero.",
    stages: "All — especially teens (first habits), TTC (OPK testing), peri (medication adherence).",
  },
  {
    rank: 5, name: "Appointment Preparation + Medical Scheduling Hub",
    bestInClass: "No app does this well — mySysters comes closest",
    summary: "Life-stage-specific scheduling that prepares users for medical encounters. Auto-generated symptom summary, question prompt bank, NHS app + NHS Online Hospital links. Pregnancy trimester schedule pre-populated. TTC clinic + trigger-window alerts. Peri 3-month HRT review reminder.",
    stages: "Peri (GP prep), TTC (clinic management), pregnancy (trimester schedule).",
  },
  {
    rank: 6, name: "Weekly Planning + Review Ritual (Phase-Anchored)",
    bestInClass: "Sunsama (objectives over tasks)",
    summary: "Sunday-evening Jess session: review last week (% habits hit, phase-adjusted), set 3 weekly objectives (not task lists), map cycle profile for the coming week, time-block high-priority items into high-capacity days.",
    stages: "Working women managing peri symptoms, pregnancy (each week different), TTC (fertile-window planning).",
  },
  {
    rank: 7, name: "Natural Language Task + Habit Capture (Jess AI)",
    bestInClass: "Fantastical + ChatGPT",
    summary: "Conversational capture — \"remind me to take folic acid every morning\", \"add my 12-week scan on 3 June at 10am\", \"I want to meditate 5 min daily\" — Jess creates the right habit, reminder, or calendar entry with the right implementation intention.",
    stages: "Postpartum (cognitive load too high for forms), peri (brain fog), teens (conversational feels native).",
  },
  {
    rank: 8, name: "Cycle-Aware Journal Prompts (Guided Reflection)",
    bestInClass: "Reflectly + Day One (\"On This Day\")",
    summary: "Phase-rotating prompts replace blank-page paralysis. \"On This Day\" surfaces what you wrote on this cycle day in previous months. Monthly pattern insight: \"In your luteal phase over the last 3 months, you consistently logged anxiety on Days 25-27 — worth a GP conversation.\"",
    stages: "Peri (uncertainty processing), TTC 2WW (emotional regulation), teens (first cycle awareness).",
  },
  {
    rank: 9, name: "Energy-Aware Social + Community Features",
    bestInClass: "No app does this well — Finch warmest model",
    summary: "Phase-grouped circles (Menstrual circle / Follicular energy / Luteal lounge). Anonymous phase disclosure. Accountability pairs matched on phase or life stage. Phase challenges. Community questions tagged by life stage.",
    stages: "TTC (community reduces isolation), peri (shared experience), postpartum (loneliness).",
  },
  {
    rank: 10, name: "Life Goals Framework (Quarterly / Seasonal Review)",
    bestInClass: "Notion + Sunsama (with cycle lens nowhere)",
    summary: "Above the weekly / daily layer — annual goals broken into quarterly intentions, reviewed at the natural cadence of seasons. Spring = new starts (follicular energy), summer = peak output, autumn = editing, winter = rest and reflection.",
    stages: "Women in transition — peri identity shift, postpartum return to self, TTC after diagnosis.",
  },
];

const CAPACITY_DATA_INPUTS = [
  { layer: "Cycle phase",        source: "Cycle tab",          signal: "Predicted cognitive / physical capacity by phase" },
  { layer: "Cycle day",          source: "Cycle tab",          signal: "Fine-grained within-phase variation" },
  { layer: "Symptoms logged",    source: "Track tab",          signal: "Actual vs. predicted capacity (override)" },
  { layer: "Sleep log",          source: "Track tab",          signal: "Acute capacity modifier (poor sleep = −30% executive function)" },
  { layer: "Mood log",           source: "Journal / Track",    signal: "Emotional capacity signal" },
  { layer: "Life stage",         source: "Profile",            signal: "Pregnancy trimester, peri, postpartum overlays" },
  { layer: "Wearable data",      source: "Apple Health / Garmin (future)", signal: "HRV, resting HR, sleep quality" },
  { layer: "Medication / HRT",   source: "Care Bridge / Track", signal: "Hormonal stability signal" },
];

const CAPACITY_PHASE_MODEL = [
  { phase: "Menstrual", days: "1–5",       score: 45, cognitive: "Low-medium · introspective · big-picture",     physical: "Low · rest", emotional: "Inward · sensitive",       action: "Minimal task load, prioritise rest + reflection." },
  { phase: "Follicular", days: "6–13",     score: 75, cognitive: "Rising · executive function + verbal memory",  physical: "Rising · best for new exercise", emotional: "Optimistic · curious", action: "Front-load new projects, learning, hard conversations." },
  { phase: "Ovulatory", days: "14–16",     score: 90, cognitive: "Peak verbal fluency · charisma",               physical: "Peak strength + power", emotional: "Confident · empathetic", action: "Presentations, interviews, GP consultations, dates." },
  { phase: "Early luteal", days: "17–23",  score: 70, cognitive: "Detail-oriented · methodical",                 physical: "Moderate", emotional: "Calm · completing",            action: "Admin, organising, financial reviews, finishing." },
  { phase: "Late luteal", days: "24–28",   score: 40, cognitive: "Brain fog · reduced working memory",           physical: "Fatigue · bloating · pain sensitivity", emotional: "PMS · heightened reactivity", action: "Reduce to 2-3 priorities. No high-stakes events." },
];

const CAPACITY_BEHAVIORS = [
  {
    band: "Green", range: "65–100", color: "#6B8F5A",
    body: "Show full task list. Suggest stretch goal or optional extra. Encourage high-value scheduling — presentations, difficult conversations, creative work.",
    jess: "Energetic, forward-looking.",
  },
  {
    band: "Amber", range: "35–64", color: "#C8A040",
    body: "Show planned tasks, no additions. Gently suggest delegating or moving one non-urgent task. Flag if any high-stakes event is today.",
    jess: "Steady, supportive.",
  },
  {
    band: "Red", range: "0–34", color: "#D45E52",
    body: "Reduce to 2-3 essentials. Auto-suggest moving non-urgent tasks to next green phase. Offer self-care prompt. If a red day precedes a high-stakes event: \"Your presentation is tomorrow — let's do 5 minutes of prep now.\"",
    jess: "Compassionate, permission-giving.",
  },
];

const FIVE_SPECS = [
  {
    id: "morning-ritual",
    name: "Jess Morning Planning Session",
    where: "Today tab · triggered at user-set time (default 7:30am)",
    duration: "3-7 minutes",
    flow: [
      "Capacity check (30s) — green/amber/red indicator, 1-tap mood/energy emoji, sleep input updates score.",
      "Today's schedule overview (1m) — pulls calendar + task inbox. Jess: \"You have 2 meetings + 4 tasks. Capacity is amber — focus on 2-3 tasks.\"",
      "Task selection + time-blocking (2-3m) — choose tasks pre-sorted by phase-suitability. Drag to time-block. App warns if total exceeds free time.",
      "Daily intention (30s) — single sentence. Free text or Jess suggestion: \"Given your cycle, today is good for completing / beginning / resting from.\"",
      "Jess sign-off — brief phase-aware encouragement: \"Day 8 — follicular energy building. Start the thing. You've got this.\"",
    ],
  },
  {
    id: "task-inbox",
    name: "Smart Task Inbox with Phase-Aware Sorting",
    where: "Today tab (persistent) + Jess conversational capture",
    duration: "Async — capture anywhere, surfaces when relevant",
    flow: [
      "Quick capture: single line, single tap. \"Call Dr Shah before Thursday\" → task with due date. \"Take magnesium every night\" → habit prompt. \"Scan on 3 June\" → calendar event.",
      "Task attributes: title · type (creative / admin / social / physical / medical / rest) · duration estimate · due date · priority 1-3.",
      "Phase queue: \"Best done this phase (Days 6-13): 3 tasks. Best for next phase: 2. Due soon regardless: 1.\"",
      "Capacity filter: red days show only urgent / essential. User can override.",
      "Integrations: Google + Apple Calendar (appointments), Care Bridge (medical), Cycle tab (phase), Track (symptom modifier).",
    ],
  },
  {
    id: "evening-shutdown",
    name: "Evening Shutdown + Reflection",
    where: "Today tab · push notification at user-set time (default 8:30pm)",
    duration: "3-5 minutes",
    flow: [
      "Day review (1m) — Jess: \"You planned 4 tasks. You completed 3. One didn't happen — [task]. Visual: completed · not done · calendar events.\"",
      "Incomplete disposition (1m) — 3 taps per task: Tomorrow / Schedule for later / Remove. No guilt: \"It's fine to move it — only do what your capacity allows.\"",
      "Phase-aware reflection prompt (1-2m): Menstrual → \"What did your body ask for today that you gave it?\" / Follicular → \"What did you start that you're proud of?\" / Ovulatory → \"Who did you connect with?\" / Early luteal → \"What did you finish?\" / Late luteal → \"What can you release tonight?\"",
      "Tomorrow preview (30s) — \"Tomorrow: one event. Cycle day X — one sentence on what to expect. Sleep well.\"",
      "Optional: response saved to Journal.",
    ],
  },
  {
    id: "appointment-hub",
    name: "Medical Appointment Preparation Hub",
    where: "Care Bridge · My Appointments",
    duration: "Auto-triggered 48h before any appointment",
    flow: [
      "Appointment calendar — manual or natural-language add (\"12-week scan on 3 June at St Thomas's\"). Life-stage templates pre-populate.",
      "Pre-appointment prep (-48h): Jess auto-generates symptom summary (last 30 or 90 days) + question prompt bank filtered by life stage + recent symptoms.",
      "Examples — Peri: \"My HRT hasn't controlled night sweats. Can we adjust dose?\" · TTC: \"My luteal is consistently 10 days — should I consider progesterone?\" · Pregnancy: \"Pelvic pain has increased. When should I stop driving?\"",
      "Save to print / share with GP — formatted PDF.",
      "Post-appointment log: notes capture, medication changes auto-added to Track, next appointment auto-suggested.",
      "NHS integration — NHS App for direct booking, NHS Online Hospital for menopause video consultations (launched Jan 2026).",
    ],
  },
  {
    id: "rhythms-engine",
    name: "Phase-Adaptive Habit Engine (Rhythms)",
    where: "Cycle tab → My Rhythms · habits visible in Today tab",
    duration: "Atomic Habits-informed setup, daily 2-minute defaults",
    flow: [
      "Setup wizard: \"What habit? When (or after which existing habit)? Where? How long? (default 2 min.)\"",
      "Femwell suggests best phase: exercise → follicular / ovulatory; meditation → any (especially late luteal); creative → follicular / ovulatory; journalling → menstrual / late luteal.",
      "Phase-adaptive targets: \"Run 3×/week\" auto-adjusts → menstrual phase shows walking instead and still counts.",
      "Tracking: today tab simple tick boxes; streak = \"18/21 days this month\" (never resets to zero).",
      "Phase-aware streak: \"Menstrual phase habit score: 4/5 days. That's excellent.\"",
      "Suggestions by life stage — TTC: OPK twice daily, folic acid, BBT. Pregnancy: pelvic floor, vitamins, kick counting. Peri: weight-bearing exercise, HRT, magnesium. Teen: cycle reflection, mood logging.",
    ],
  },
];

const SCHEDULING_ROADMAP = [
  {
    band: "0-3 months", color: "#6B8F5A",
    items: [
      "Evening Reflection Ritual — lowest tech lift, highest emotional stickiness. Extend Jess into a guided nightly debrief.",
      "Phase-Aware Journal Prompts — extend existing Journal with phase-rotating prompts. Zero new infra.",
      "Appointment Prep in Care Bridge — symptom summary + question bank for GP visits. UK-specific. Differentiates from every competitor.",
    ],
  },
  {
    band: "3-6 months", color: "#C8A040",
    items: [
      "Smart Task Inbox + natural-language capture — extend Jess to parse tasks, habits, appointments from conversational input.",
      "Morning Planning Session — the highest-stickiness feature in the category (Sunsama's defining mechanic, adapted for women's wellness).",
      "Phase-Adaptive Habit Engine — evolve Saved Rhythms into full habit architecture with implementation intention setup + flexible streaks.",
    ],
  },
  {
    band: "6-12 months", color: "#D45E52",
    items: [
      "Capacity Score + Smart Load Balancer — the technical infra for capacity-aware planning. Requires capacity algorithm, phase data integration, task-type classification.",
      "Medical Appointment Hub — full TTC, pregnancy, peri scheduling templates. NHS integration.",
      "Weekly Planning + Review Ritual — once daily ritual lands, extend to weekly objectives layer.",
    ],
  },
];

function SchedulingView() {
  const [openSpec, setOpenSpec] = useState("morning-ritual");
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "8px 16px 40px" }}>
      {/* Hero */}
      <header style={{ paddingTop: 28 }}>
        <div style={rxEyebrow}>Scheduling research · May 2026</div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 30,
          fontWeight: 500, color: RX.espresso, letterSpacing: "-0.02em",
          margin: "10px 0 0", lineHeight: 1.12,
        }}>From tracker to <em style={{ color: RX.plum }}>capacity-aware planner</em>.</h1>
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14,
          color: RX.espressoMid, marginTop: 12, lineHeight: 1.55,
        }}>
          Femwell knows how a woman feels. It does not yet help her <em>schedule her life</em> around
          that knowledge. The £75B femtech market is consolidating around apps that move from reactive
          tracking to proactive life management. Femwell can lead this — if it closes the planning
          gap now. This is the map of how.
        </p>
      </header>

      {/* Industry gap callout */}
      <section style={rxCard}>
        <div style={rxEyebrow}>The industry gap</div>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13.5,
          color: RX.plum, lineHeight: 1.5, margin: "8px 0 0",
        }}>
          All major women's health apps are excellent data collectors but poor action translators.
          None of them help you plan your actual day, week, or month in light of your cycle data.
          No major app integrates Google or Apple Calendar to surface phase <em>inside</em> your
          existing scheduling system. The Agenda is the only exception — and it is small and limited.
        </p>
      </section>

      {/* Top 10 missing features */}
      <h2 style={rxH2}>Top 10 missing features (ranked by impact)</h2>
      <p style={rxIntroP}>
        Each item: what it does, which existing app does it best, and the life stages that benefit most.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {TOP_10_FEATURES.map((f) => (
          <article key={f.rank} style={{
            background: RX.creamWarm, borderRadius: 12,
            border: `1px solid ${RX.rule}`, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{
                fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 24,
                fontWeight: 500, color: RX.goldDeep, minWidth: 28, lineHeight: 1,
              }}>{String(f.rank).padStart(2, "0")}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
                  fontWeight: 600, color: RX.espresso, fontStyle: "italic",
                  lineHeight: 1.25,
                }}>{f.name}</div>
                <div style={{
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
                  fontWeight: 700, letterSpacing: "0.14em", color: RX.goldDeep,
                  textTransform: "uppercase", marginTop: 6,
                }}>Best in class · {f.bestInClass}</div>
              </div>
            </div>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12.5,
              color: RX.espressoMid, lineHeight: 1.5, margin: "10px 0 0",
            }}>{f.summary}</p>
            <p style={{
              fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11.5,
              color: RX.plumMid, lineHeight: 1.45, margin: "8px 0 0",
            }}>Best fit: {f.stages}</p>
          </article>
        ))}
      </div>

      {/* Capacity-aware architecture */}
      <h2 style={rxH2}>Capacity-aware scheduling architecture</h2>
      <p style={rxIntroP}>
        A capacity-aware planner does not ask "when are you free?" — it asks "when are you <em>able</em>?"
        It models predicted cognitive, physical, and emotional capacity and reshapes the day around it.
      </p>

      {/* Data inputs table */}
      <section style={rxCard}>
        <div style={rxEyebrow}>Data inputs</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {CAPACITY_DATA_INPUTS.map((row, i) => (
            <div key={i} style={{
              padding: "8px 10px", background: RX.cream,
              borderRadius: 8, border: `0.5px solid ${RX.rule}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <div style={{
                  fontFamily: "'Fraunces', Georgia, serif", fontSize: 13,
                  fontWeight: 600, color: RX.espresso,
                }}>{row.layer}</div>
                <div style={{
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
                  fontWeight: 600, color: RX.goldDeep, letterSpacing: "0.06em",
                }}>{row.source}</div>
              </div>
              <div style={{
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11.5,
                color: RX.espressoMid, marginTop: 4, lineHeight: 1.4,
              }}>{row.signal}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Capacity score by phase */}
      <section style={rxCard}>
        <div style={rxEyebrow}>Capacity score by cycle phase</div>
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11.5,
          color: RX.espressoMid, marginTop: 8, lineHeight: 1.4,
        }}>
          Base score before symptom + sleep modifiers (peer-reviewed hormonal research).
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          {CAPACITY_PHASE_MODEL.map((p, i) => (
            <div key={i} style={{
              padding: "10px 12px", background: RX.cream,
              borderRadius: 8, border: `0.5px solid ${RX.rule}`,
              borderLeft: `3px solid ${p.score >= 65 ? "#6B8F5A" : p.score >= 35 ? "#C8A040" : "#D45E52"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{
                  fontFamily: "'Fraunces', Georgia, serif", fontSize: 14,
                  fontWeight: 600, color: RX.espresso, fontStyle: "italic",
                }}>{p.phase} <span style={{ color: RX.plumMid, fontWeight: 400, fontStyle: "normal" }}>· Days {p.days}</span></div>
                <div style={{
                  fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 16,
                  fontWeight: 600, color: p.score >= 65 ? "#6B8F5A" : p.score >= 35 ? "#C8A040" : "#D45E52",
                }}>{p.score}</div>
              </div>
              <div style={{
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11,
                color: RX.espressoMid, marginTop: 6, lineHeight: 1.45,
              }}>
                <strong>Cognitive:</strong> {p.cognitive}<br/>
                <strong>Physical:</strong> {p.physical} · <strong>Emotional:</strong> {p.emotional}
              </div>
              <div style={{
                fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11.5,
                color: RX.plum, marginTop: 6, lineHeight: 1.45,
              }}>→ {p.action}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Behaviors by capacity level */}
      <section style={rxCard}>
        <div style={rxEyebrow}>Planner behaviour by capacity band</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {CAPACITY_BEHAVIORS.map((b) => (
            <article key={b.band} style={{
              padding: "12px 14px", background: RX.cream,
              borderRadius: 10, border: `0.5px solid ${RX.rule}`,
              borderLeft: `3px solid ${b.color}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <div style={{
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
                  fontWeight: 700, letterSpacing: "0.18em", color: b.color,
                  textTransform: "uppercase",
                }}>{b.band}</div>
                <div style={{
                  fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11,
                  color: RX.plumMid,
                }}>Score {b.range}</div>
              </div>
              <div style={{
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12.5,
                color: RX.espressoMid, marginTop: 6, lineHeight: 1.5,
              }}>{b.body}</div>
              <div style={{
                fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11.5,
                color: RX.plum, marginTop: 6, lineHeight: 1.4,
              }}>Jess tone: {b.jess}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 5 highest-impact specs */}
      <h2 style={rxH2}>Five highest-impact feature specs</h2>
      <p style={rxIntroP}>
        Tap a spec to expand its flow. Each is ready to scope into a Lead Manager MP after Halli signs off.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {FIVE_SPECS.map((s, i) => {
          const open = openSpec === s.id;
          return (
            <article key={s.id} style={{
              background: RX.creamWarm, borderRadius: 14,
              border: `1px solid ${RX.rule}`, borderLeft: `3px solid ${RX.goldDeep}`,
              overflow: "hidden",
            }}>
              <button
                type="button"
                onClick={() => setOpenSpec(open ? null : s.id)}
                aria-expanded={open}
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "transparent", border: "none",
                  display: "flex", alignItems: "flex-start", gap: 12,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{
                  fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 18,
                  fontWeight: 500, color: RX.goldDeep, minWidth: 26, lineHeight: 1,
                }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Fraunces', Georgia, serif", fontSize: 16,
                    fontWeight: 600, color: RX.espresso, fontStyle: "italic",
                    lineHeight: 1.25,
                  }}>{s.name}</div>
                  <div style={{
                    fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
                    fontWeight: 600, color: RX.goldDeep, letterSpacing: "0.10em",
                    marginTop: 6, textTransform: "uppercase",
                  }}>{s.where}</div>
                  <div style={{
                    fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11.5,
                    color: RX.plumMid, marginTop: 4,
                  }}>{s.duration}</div>
                </div>
                <span aria-hidden="true" style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 16, color: RX.espressoMid, fontWeight: 700,
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  marginTop: 4,
                }}>▾</span>
              </button>
              {open && (
                <div style={{ padding: "0 16px 18px 16px" }}>
                  <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {s.flow.map((step, j) => (
                      <li key={j} style={{
                        padding: "10px 12px", background: RX.cream,
                        borderRadius: 8, border: `0.5px solid ${RX.rule}`,
                        display: "flex", gap: 10, alignItems: "flex-start",
                      }}>
                        <span style={{
                          fontFamily: "Georgia, serif", fontStyle: "italic",
                          fontSize: 12, fontWeight: 600, color: RX.goldDeep,
                          minWidth: 20, paddingTop: 1,
                        }}>{j + 1}.</span>
                        <span style={{
                          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12.5,
                          color: RX.espresso, lineHeight: 1.5,
                        }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Roadmap */}
      <h2 style={rxH2}>Strategic roadmap</h2>
      <p style={rxIntroP}>
        Ship cadence — emotional stickiness first (0-3m), then the planning ritual layer (3-6m), then the
        capacity engine + NHS integration that earns the moat (6-12m).
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {SCHEDULING_ROADMAP.map((band) => (
          <article key={band.band} style={{
            background: RX.creamWarm, borderRadius: 14,
            border: `1px solid ${RX.rule}`, borderTop: `3px solid ${band.color}`,
            padding: "16px 16px 18px",
          }}>
            <div style={{
              fontFamily: "'Fraunces', Georgia, serif", fontSize: 22,
              fontWeight: 500, color: band.color, fontStyle: "italic",
            }}>{band.band}</div>
            <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {band.items.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{
                    width: 4, height: 4, borderRadius: 9999,
                    background: band.color, marginTop: 8, flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12.5,
                    color: RX.espressoMid, lineHeight: 1.5,
                  }}>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* Closing card */}
      <section style={{
        marginTop: 28, padding: "24px 22px",
        background: RX.espresso, color: RX.cream,
        borderRadius: 18,
      }}>
        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
          fontWeight: 700, letterSpacing: "0.22em", color: RX.gold,
          textTransform: "uppercase",
        }}>Competitive position</div>
        <p style={{
          fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic",
          fontSize: 17, lineHeight: 1.5, margin: "10px 0 0", color: RX.cream,
        }}>
          No competitor combines cycle-aware AI narrative, life-stage-specific planning, capacity-
          adjusted scheduling, <em>and</em> NHS-integrated appointment preparation. Femwell with these
          additions occupies a genuinely unique position.
        </p>
        <div style={{
          marginTop: 14, fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 11.5, color: "rgba(244,237,219,0.7)", lineHeight: 1.5,
        }}>
          Full doc: claude-state/product-research/<br/>femwell-planner-scheduling-research-2026-05-16.md
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// /Ideas page shell
// ═══════════════════════════════════════════════════════════════════════════

const DESIGNS = [
  {
    name: "Le Menu × Phase Sun",
    tagline: "Reskin of the real Planner. Cream paper, saturated phase ribbons, a Phase Sun anchors the Jess hero.",
    body: "Exact component order and layout as the live Planner — sticky header (eyebrow + h1 + day line + crumb + Today/Cycle tabs + week strip), then JessNarrativeHero → PillarsDeck → DailyStoryReel → IntentionCard → MorningStack on Today, and MonthRibbon → SavedRhythmsCarousel → WeekAheadCard → DoctorReadyDiaryCard → PlanMyNextCycleCTA on Cycle. The reskin: warm cream #F4EDDB instead of ivory, espresso ink, phase ribbons in saturated #9A2845 / #D4745A / #C8A040 / #7B5E9A / #4A2868, a 12-ray illustrated Phase Sun added to the JessNarrativeHero, course-numbered Roman eyebrows (I · II · III · IV · V), small phase dots in the top-right of each PillarsDeck tile.",
    Comp: LeMenuPhaseSunDemo,
    status: "ready",
  },
  {
    name: "The Interior (Warm Room)",
    tagline: "Your Femwell with a cosy room illustration in the hero and room-object metaphors on the stat tiles.",
    body: "Stays entirely inside the Femwell native palette — ivory background, white cards, plum text, rose accents, existing phase colours (#B84A41 / #E67F73 / #F2A99A / #8A5F74). The Interior is expressed through three quiet moves: (1) a line-drawing SVG room scene anchoring the JessNarrativeHero — lit amber lamp on the left, bookshelf with book spines and two small candles in the middle, dark window with a crescent moon and tiny gold stars on the right; (2) italic Fraunces 'the bed / the lamp / the window / the kettle / the door / the clock' labels in the corner of each PillarsDeck tile (in --gold-deep #A6862B); (3) a subtle 2px brass #C9A95C top accent on Cycle cards that replaces the rose accent. Headline reads 'Day 22 · Luteal — the lamp is on.' Bottom nav, header, MonthRibbon colours, and everything else stay live-faithful.",
    Comp: TheInteriorDemo,
    status: "ready",
  },
  {
    name: "The Library",
    tagline: "A printed volume of your cycle. Parchment, ruled lines, double-frame chapters, drop caps, page numbers, a red silk bookmark on today.",
    body: "Full typographic transformation, not a book SVG slapped on top. Parchment background #F0E8D4 with horizontal ruled lines every 24px running behind everything. All typography is serif (Georgia). Running header 'Femwell Cyclical · Volume I' above the Planner title in italic gold. JessNarrativeHero IS a book page: double-line gold frame, 'Chapter XXII · The Luteal Passage' running header, hairline rule, 50px drop capital T in luteal violet, justified body in plum ink, '— 22 —' centred page number. PillarsDeck is the Body Observations Index: dictionary entries with bold serif terms, dotted leader lines, phase-coloured values, italic definitions. MonthRibbon is the Contents page: five chapter rows (Ch. I–V) with phase name + dotted leader + day range + page numbers, phase-coloured tab on the right, a red silk bookmark ribbon descending from above today's day number. DailyStoryReel cards are illustrated Plates I–V with double frames and italic captions. Every Cycle card has a centred chapter header, double-line frame, justified body, and Roman page number. Bottom nav stays cream-parchment with serif italic labels.",
    Comp: TheLibraryDemo,
    status: "ready",
  },
  {
    name: "The Garden",
    tagline: "A botanical specimen book of your cycle. Lavender hero, pressed-flower phase rows, sage everything.",
    body: "Full botanical transformation. Botanical white #F8F6F0 with a faint repeating ink-leaf pattern at 4% opacity behind every component. All living phase colours — burgundy rose #8B1A2E, apple-blossom blush #D4847A, sunflower gold #C8A020, lavender #7B5E9A, seed-pod #3A2A18. Sage green #6B8F5A is the accent throughout (replacing rose). JessNarrativeHero is a 40/60 split: left side a detailed hand-drawn lavender sprig SVG with root, lance-shaped leaves, and seven levels of floret clusters, labelled 'Lavandula angustifolia' in italic; right side a sage 'Day 22 · Luteal' kicker + italic headline 'The lavender is setting seed.' + body. PillarsDeck tiles each carry a tiny ink corner icon (moon+stars / sun / cloud / water-drop / oak-leaf / crescent+dot) with stat values in lavender and italic sage definitions below. MonthRibbon is a pressed-flower specimen collection — five phase rows each with a tiny botanical SVG on the left (rose, cherry blossom, sunflower, lavender, bare branch), italic 'Luteal · Lavender'-style row title, watercolour wash bg, day pills, a herbarium-leaf silhouette on the right; today gets a deep-sage filled pill with a 4-petal flower above it. DailyStoryReel cards are botanical recipe cards with header plant illustrations and nursery-style 'Phase: Luteal' tags. Every Cycle card has a deep-sage header bar with a tiny white botanical sprig. Bottom nav goes white with a deep-sage Jess FAB overlaid with a 4-petal flower.",
    Comp: TheGardenDemo,
    status: "ready",
  },
];

export default function Ideas() {
  const [expanded, setExpanded] = useState({});
  const [openHelp, setOpenHelp] = useState(false);
  const [topTab, setTopTab] = useState("biorhythm"); // "biorhythm" | "designs" | "research" | "lifestages" | "scheduling"
  return (
    <div style={{ minHeight: "100vh", background: "#F4F1EA", paddingBottom: 140 }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#0E0E0E", color: "#F4F1EA",
        padding: "12px 16px", textAlign: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 11, letterSpacing: "0.18em", fontWeight: 700,
        textTransform: "uppercase",
      }}>
        Design Lab · Dev Only · Biorhythm · Mission · Accordion · Dashboard · Designs · Research · Life Stages · Scheduling · Journal
      </div>

      {/* Tab bar — Biorhythm / Designs / Research / Life Stages / Scheduling */}
      <div style={{
        display: "flex", justifyContent: "center",
        padding: "18px 16px 0",
      }}>
        <div role="tablist" aria-label="Ideas view" style={{
          display: "inline-flex", gap: 4, padding: 4,
          borderRadius: 9999, border: "1px solid rgba(14,14,14,0.10)",
          background: "#FFFFFF", flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { id: "biorhythm", label: "Biorhythm" },
            { id: "mission", label: "Mission" },
            { id: "accordion", label: "Accordion" },
            { id: "dashboard", label: "Dashboard" },
            { id: "designs", label: "Designs" },
            { id: "research", label: "Research" },
            { id: "lifestages", label: "Life Stages" },
            { id: "scheduling", label: "Scheduling" },
            { id: "journal", label: "Journal" },
          ].map((t) => {
            const active = t.id === topTab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTopTab(t.id)}
                style={{
                  fontFamily: active ? "'Fraunces', Georgia, serif" : "'Inter', system-ui, sans-serif",
                  fontSize: 12, letterSpacing: "0.04em",
                  padding: "8px 22px", borderRadius: 9999, border: "none",
                  cursor: "pointer",
                  backgroundColor: active ? "#3A2C1A" : "transparent",
                  color: active ? "#F4EDDB" : "#6B5840",
                  fontWeight: active ? 700 : 600,
                  fontStyle: active ? "italic" : "normal",
                  minWidth: 92, textAlign: "center",
                  transition: "all 0.2s ease",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {topTab === "biorhythm" && (
        <div style={{ padding: "28px 16px 0" }}>
          <div style={{ maxWidth: 560, margin: "0 auto 22px", padding: "0 4px" }}>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
              fontWeight: 700, color: "rgba(14,14,14,0.55)", margin: 0,
            }}>Concept 1 · Biorhythm Timeline</p>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 26, fontWeight: 500, color: "#0E0E0E",
              letterSpacing: "-0.02em", margin: "6px 0 8px", lineHeight: 1.15,
            }}>Capacity, painted on the day.</h2>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13, color: "rgba(14,14,14,0.7)",
              margin: 0, lineHeight: 1.55,
            }}>
              A full-bleed timeline where each hour is tinted by your biological capacity.
              Existing planner items render as type-coloured blocks. Unscheduled tasks live
              in a tray below — tap to pick up, tap a time slot to place; the highest-capacity
              empty window gets a gold ring. Compose bar parses &ldquo;at 9am&rdquo;.
              Body dock on the right writes back into the same daily check-in as Today.
            </p>
          </div>
          <BiorhythmTimeline />
        </div>
      )}
      {topTab === "mission" && (
        <div style={{ padding: "28px 16px 0" }}>
          <div style={{ maxWidth: 560, margin: "0 auto 22px", padding: "0 4px" }}>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
              fontWeight: 700, color: "rgba(14,14,14,0.55)", margin: 0,
            }}>Concept 2 · Mission Control</p>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 26, fontWeight: 500, color: "#0E0E0E",
              letterSpacing: "-0.02em", margin: "6px 0 8px", lineHeight: 1.15,
            }}>A capacity-first command deck.</h2>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13, color: "rgba(14,14,14,0.7)",
              margin: 0, lineHeight: 1.55,
            }}>
              Big semicircular gauge dominates the deck. Tasks auto-sort into three
              rails by capacity cost — LIGHT / BALANCED / INTENSIVE. When today&apos;s
              capacity won&apos;t support the Intensive rail, a one-tap defer ships
              the lot to the next high-cap day. A single command bar at the bottom
              captures anything; &ldquo;High-cap window&rdquo; auto-schedules. The week
              strip plans biologically. Dark-warm cockpit — intentionally distinct
              from the rest of the app.
            </p>
          </div>
          <MissionControl />
        </div>
      )}
      {topTab === "accordion" && (
        <div style={{ padding: "28px 16px 0" }}>
          <div style={{ maxWidth: 560, margin: "0 auto 22px", padding: "0 4px" }}>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
              fontWeight: 700, color: "rgba(14,14,14,0.55)", margin: 0,
            }}>Demo A · The Accordion</p>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 26, fontWeight: 500, color: "#0E0E0E",
              letterSpacing: "-0.02em", margin: "6px 0 8px", lineHeight: 1.15,
            }}>Eleven named strips. Open what you need.</h2>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13, color: "rgba(14,14,14,0.7)",
              margin: 0, lineHeight: 1.55,
            }}>
              The combined Today + Cycle landscape, rendered as collapsible strips
              top-to-bottom. Each strip shows a one-line summary; tap to reveal the
              full section. Mass-action chips (Close all / Open Today / Open Cycle)
              sit at the top so a one-tap tour is possible. Multiple strips can be
              open at once — the page stops being a fixed scroll and becomes a
              landscape of choices.
            </p>
          </div>
          <AccordionPlanner />
        </div>
      )}
      {topTab === "dashboard" && (
        <div style={{ padding: "28px 16px 0" }}>
          <div style={{ maxWidth: 560, margin: "0 auto 22px", padding: "0 4px" }}>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
              fontWeight: 700, color: "rgba(14,14,14,0.55)", margin: 0,
            }}>Demo B · The Morning Dashboard</p>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 26, fontWeight: 500, color: "#0E0E0E",
              letterSpacing: "-0.02em", margin: "6px 0 8px", lineHeight: 1.15,
            }}>A dashboard that changes shape over the day.</h2>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13, color: "rgba(14,14,14,0.7)",
              margin: 0, lineHeight: 1.55,
            }}>
              Time-of-day bands (Morning · Midday · Late afternoon · Evening). The
              <b> live band </b> promotes its cards — biggest, brightest, on top —
              while the others recede. A NOW pip travels down the page. Scrub
              the time bar to feel the shape shift.
            </p>
          </div>
          <MorningDashboard />
        </div>
      )}
      {topTab === "journal" && <JournalDemo />}
      {topTab === "research" && <ResearchView />}
      {topTab === "lifestages" && <LifeStagesView />}
      {topTab === "scheduling" && <SchedulingView />}
      {topTab === "designs" && (
      <>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 18px 0" }}>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 30, fontWeight: 500, color: "#0E0E0E",
          letterSpacing: "-0.02em", margin: 0, lineHeight: 1.1,
        }}>Four Planner reskins.<br/>Same layout, new aesthetic.</h1>
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14,
          color: "rgba(14,14,14,0.7)", marginTop: 10, lineHeight: 1.55,
        }}>
          Each demo replicates the exact Planner.jsx layout you already have — sticky header,
          JessNarrativeHero, PillarsDeck, DailyStoryReel, MonthRibbon, WeekAheadCard,
          SavedRhythms, DoctorReady, PlanMyNextCycle — with a design system applied on top.
          It should read as <em>your Femwell, more beautiful</em>. Same data shapes (Day 22 · Luteal),
          working Today/Cycle tab switcher, real component order.
        </p>
        <button onClick={() => setOpenHelp(v => !v)} style={{
          marginTop: 12, padding: "7px 14px", background: "transparent",
          color: "#0E0E0E", border: "1px solid rgba(14,14,14,0.3)", borderRadius: 9999,
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11,
          letterSpacing: "0.16em", cursor: "pointer", fontWeight: 600,
        }}>
          {openHelp ? "Hide help" : "How does picking work?"}
        </button>
        {openHelp && (
          <div style={{
            marginTop: 10, padding: 14, background: "#FAF6EA",
            borderRadius: 8, fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif",
            color: "rgba(14,14,14,0.85)", lineHeight: 1.55,
          }}>
            Tap <em>Preview this design</em> to expand the demo. Switch between Today and
            Cycle inside the phone. When you've picked, tap <em>Pick this design</em> and
            tell Dispatch — the sweep applies the system across the real components.
          </div>
        )}
      </div>

      <div style={{
        display: "flex", flexDirection: "column", gap: 32,
        padding: "40px 14px 0", maxWidth: 560, margin: "0 auto",
      }}>
        {DESIGNS.map((d, idx) => {
          const open = !!expanded[d.name];
          const ready = d.status === "ready";
          return (
            <section key={d.name} style={{
              background: "#FBF7EE", borderRadius: 18,
              border: "1px solid rgba(14,14,14,0.08)",
              padding: "22px 20px 24px",
              boxShadow: "0 1px 0 rgba(14,14,14,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <div style={{
                  fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 600,
                  color: "rgba(14,14,14,0.4)", letterSpacing: "0.04em", minWidth: 22,
                }}>0{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 23, fontWeight: 500, letterSpacing: "-0.015em", color: "#0E0E0E" }}>{d.name}</div>
                    {!ready && (
                      <div style={{
                        fontFamily: "'Inter', system-ui, sans-serif", fontSize: 9.5,
                        letterSpacing: "0.22em", fontWeight: 700,
                        color: "rgba(14,14,14,0.55)",
                        background: "rgba(14,14,14,0.06)", padding: "3px 8px",
                        borderRadius: 9999,
                      }}>COMING SOON</div>
                    )}
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 14, color: "rgba(14,14,14,0.65)", marginTop: 4, lineHeight: 1.35 }}>{d.tagline}</div>
                </div>
              </div>

              <p style={{
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13,
                color: "rgba(14,14,14,0.75)", lineHeight: 1.55,
                margin: "14px 0 16px", paddingLeft: 34,
              }}>{d.body}</p>

              <div style={{ paddingLeft: 34, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {ready ? (
                  <>
                    <button onClick={() => setExpanded((e) => ({ ...e, [d.name]: !open }))} style={{
                      padding: "11px 18px",
                      background: open ? "transparent" : "#0E0E0E",
                      color: open ? "#0E0E0E" : "#F4F1EA",
                      border: "1.5px solid #0E0E0E",
                      borderRadius: 9999,
                      fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12.5,
                      fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                      cursor: "pointer",
                    }}>
                      {open ? "Close preview" : "Preview this design"}
                    </button>
                    <button onClick={pick(d.name)} style={{
                      padding: "11px 18px",
                      background: "transparent", color: "#0E0E0E",
                      border: "1.5px solid rgba(14,14,14,0.2)", borderRadius: 9999,
                      fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12.5,
                      fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                      cursor: "pointer",
                    }}>
                      Pick this design →
                    </button>
                  </>
                ) : (
                  <button disabled style={{
                    padding: "11px 18px",
                    background: "transparent", color: "rgba(14,14,14,0.4)",
                    border: "1.5px dashed rgba(14,14,14,0.3)", borderRadius: 9999,
                    fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12.5,
                    fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                    cursor: "not-allowed",
                  }}>
                    Dispatch is building →
                  </button>
                )}
              </div>

              {ready && open && d.Comp && (
                <div style={{ marginTop: 24, paddingTop: 22, borderTop: "0.5px solid rgba(14,14,14,0.12)", display: "flex", justifyContent: "center" }}>
                  <d.Comp />
                </div>
              )}
            </section>
          );
        })}
        <div style={{
          marginTop: 12, padding: 22,
          background: "#0E0E0E", color: "#F4F1EA",
          borderRadius: 16, textAlign: "center", fontFamily: "Georgia, serif",
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700, color: "rgba(244,241,234,0.7)" }}>
            Building queue
          </div>
          <div style={{ marginTop: 8, fontSize: 16, fontStyle: "italic", lineHeight: 1.5 }}>
            Le Menu × Phase Sun → ready now.<br/>
            The Interior, The Library, The Garden → ship after sign-off.
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

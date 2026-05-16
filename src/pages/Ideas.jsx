import { useState } from "react";

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
    tagline: "Your cycle is a room. Currently it's amber-evening luteal — lamp on, dusk window, dark wood panel.",
    body: "Deep warm brown #1E1005 backdrop. Same Planner layout as the live app, restyled as a furnished room. Today's hero is an illustrated room scene that changes by phase. Cards float as parchment 'objects' with amber borders. Wallpaper-band MonthRibbon. Pillars are room metaphors (Sleep = bed, Energy = lamp, etc.) keeping the real 6-tile structure.",
    Comp: null,
    status: "coming",
  },
  {
    name: "The Library",
    tagline: "Your cycle is a book. Each phase is a chapter; each day is a page with edge-tabs.",
    body: "Aged cream paper #F2EBD9 with subtle ruled lines. Same Planner layout, restyled as a book. JessNarrativeHero becomes an open-book spread (chapter title left, narrative right). MonthRibbon rows become chapter-edge tabs jutting from the right. Pillars are footnotes with superscript numbers. Old-style figures, tight serif body, bookmark ribbon on today.",
    Comp: null,
    status: "coming",
  },
  {
    name: "The Garden",
    tagline: "Each phase is a flower's life-stage. Lavender setting seed. Sage borders. Botanical ink.",
    body: "Soft botanical white #F8F6F0. Same Planner layout, restyled as a botanical journal. JessNarrativeHero gets an ink illustration of the current phase flower (luteal = lavender). Sage card borders #8AA86A. MonthRibbon rows have botanical line-drawing texture at 10% opacity behind the phase colour. Pillars have leaf/petal/stem watermarks behind the stats.",
    Comp: null,
    status: "coming",
  },
];

export default function Ideas() {
  const [expanded, setExpanded] = useState({});
  const [openHelp, setOpenHelp] = useState(false);
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
        Design Lab · Dev Only · 4 interactive Planner reskins
      </div>

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
    </div>
  );
}

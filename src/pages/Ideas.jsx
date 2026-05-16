import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// /Ideas — interactive design lab for the Femwell Planner Cycle tab.
// 4 candidate designs, each a self-contained React mock of the full
// Today + Cycle experience with working tab switching.
//
//   1. Le Menu × Phase Sun     — built ✅
//   2. The Interior            — coming soon
//   3. The Library             — coming soon
//   4. The Garden              — coming soon
//
// Real data: Sat 16 May 2026, cycle Day 22 / 28, Luteal, 6 days to Period.
// ─────────────────────────────────────────────────────────────────────────────

const pick = (name) => () =>
  window.alert(`Great — tell Dispatch: "${name}"`);

// ─────────────────────────── Shared mock data ───────────────────────────────

const PILLARS = [
  { k: "Sleep",     v: "7.2",  u: "h",     phase: "luteal" },
  { k: "Energy",    v: "68",   u: "%",     phase: "luteal" },
  { k: "Mood",      v: "Mid",  u: "",      phase: "luteal" },
  { k: "Hydration", v: "6/8",  u: "cups",  phase: "luteal" },
  { k: "Movement",  v: "20",   u: "min",   phase: "luteal" },
  { k: "Cycle",     v: "22",   u: "day",   phase: "luteal" },
];

const STORY_REEL = [
  { title: "Slow walks for luteal",          tag: "Read · 4 min",    phase: "luteal" },
  { title: "The second cup of tea",          tag: "Listen · 6 min",  phase: "luteal" },
  { title: "Why we crave warm grains",       tag: "Read · 7 min",    phase: "luteal" },
  { title: "Tonight's tea ritual",           tag: "Daily story",     phase: "luteal" },
];

const RHYTHMS = [
  { title: "Luteal Softness", sub: "6 rituals · 6 of 9 kept",  pct: 67 },
  { title: "Warm Cycle",      sub: "Slow walks · daily",        pct: 86 },
  { title: "Quiet Practice",  sub: "Meditation · 10 min",       pct: 42 },
];

const WEEK_AHEAD = [
  { d: "Mon", n: 11, phase: "luteal" },
  { d: "Tue", n: 12, phase: "luteal" },
  { d: "Wed", n: 13, phase: "luteal" },
  { d: "Thu", n: 14, phase: "luteal" },
  { d: "Fri", n: 15, phase: "luteal" },
  { d: "Sat", n: 16, phase: "luteal", today: true },
  { d: "Sun", n: 17, phase: "luteal" },
];

// Month ribbon — Shape C: 5 phase rows, each row holds the cycle days in that phase.
// Cycle started Apr 25 → cycle day 1 = Apr 25, day 22 = May 16 (today).
// For visual May 2026 ribbon, render the 5 phases of the *current* cycle:
//   Period   (days 1-4)    → Apr 25-28
//   Follicular (days 5-13) → Apr 29-May 7
//   Ovulatory (days 14-16) → May 8-10
//   Luteal    (days 17-28) → May 11-22
//   Predicted (days 29-31) → May 23-25 (next period window)
// Each row shows day-of-cycle 1-31 across its band, day 22 highlighted.
const MONTH_BANDS = [
  { phase: "period",     name: "Period",     days: [1, 2, 3, 4] },
  { phase: "follicular", name: "Follicular", days: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { phase: "ovulatory",  name: "Ovulatory",  days: [14, 15, 16] },
  { phase: "luteal",     name: "Luteal",     days: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28] },
  { phase: "predicted",  name: "Predicted",  days: [29, 30, 31] },
];

const TODAY_DAY = 22;

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN 1 — Le Menu × Phase Sun
// ═══════════════════════════════════════════════════════════════════════════

const LM = {
  cream:      "#F4EDDB",
  paper:      "#FBF6E6",
  espresso:   "#3A2C1A",
  espressoMute: "rgba(58,44,26,0.62)",
  hairline:   "rgba(58,44,26,0.18)",
  phase: {
    period:     "#9A2845",
    follicular: "#D4745A",
    ovulatory:  "#C8A040",
    luteal:     "#7B5E9A",
    predicted:  "#4A2868",
  },
};

// Phase Sun — central disc + 12 rays in phase colour
function PhaseSun({ phase = "luteal", size = 132 }) {
  const c = LM.phase[phase];
  return (
    <svg width={size} height={size} viewBox="0 0 132 132" aria-hidden="true">
      <defs>
        <radialGradient id="lm-sun-core" cx="50%" cy="48%" r="50%">
          <stop offset="0%"  stopColor="#FBF6E6"/>
          <stop offset="60%" stopColor="#F4E8C8"/>
          <stop offset="100%" stopColor="#E8D49E"/>
        </radialGradient>
      </defs>
      {/* 12 rays */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = 66 + Math.cos(a) * 36;
        const y1 = 66 + Math.sin(a) * 36;
        const x2 = 66 + Math.cos(a) * 62;
        const y2 = 66 + Math.sin(a) * 62;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="2.2" strokeLinecap="round"/>;
      })}
      {/* short outer ticks between rays */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = ((i + 0.5) / 12) * Math.PI * 2;
        const x1 = 66 + Math.cos(a) * 44;
        const y1 = 66 + Math.sin(a) * 44;
        const x2 = 66 + Math.cos(a) * 54;
        const y2 = 66 + Math.sin(a) * 54;
        return <line key={`t${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="1.1" strokeOpacity="0.55" strokeLinecap="round"/>;
      })}
      {/* central disc */}
      <circle cx="66" cy="66" r="30" fill="url(#lm-sun-core)" stroke={c} strokeWidth="0.8" strokeOpacity="0.7"/>
      {/* face hint — two small dots + thin smile, very subtle, decorative */}
      <circle cx="58" cy="62" r="1.4" fill={c} opacity="0.55"/>
      <circle cx="74" cy="62" r="1.4" fill={c} opacity="0.55"/>
      <path d="M58,74 Q66,80 74,74" stroke={c} strokeWidth="1.1" fill="none" strokeOpacity="0.45" strokeLinecap="round"/>
    </svg>
  );
}

function LM_NavHeader() {
  return (
    <div style={{
      padding: "18px 22px 10px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderBottom: `0.5px solid ${LM.hairline}`,
    }}>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 600, color: LM.espresso, letterSpacing: "-0.015em" }}>Planner</div>
      <button style={{ background: "none", border: "none", padding: 4, cursor: "pointer" }} aria-label="Settings">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={LM.espresso} strokeWidth="1.5">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h0a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5h0a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>
        </svg>
      </button>
    </div>
  );
}

function LM_TabSwitcher({ tab, setTab }) {
  return (
    <div style={{
      display: "flex", justifyContent: "center", gap: 4,
      padding: "12px 22px 14px", borderBottom: `0.5px solid ${LM.hairline}`,
    }}>
      {["today", "cycle"].map((t) => {
        const active = tab === t;
        return (
          <button key={t} onClick={() => setTab(t)} style={{
            background: active ? LM.espresso : "transparent",
            color: active ? LM.cream : LM.espressoMute,
            border: `0.5px solid ${active ? LM.espresso : LM.hairline}`,
            padding: "8px 22px",
            fontFamily: "Georgia, serif",
            fontStyle: active ? "italic" : "normal",
            fontSize: 13,
            letterSpacing: "0.06em",
            cursor: "pointer",
            borderRadius: 9999,
            transition: "all 0.15s",
          }}>
            {t === "today" ? "Today" : "Cycle"}
          </button>
        );
      })}
    </div>
  );
}

function LM_BottomNav() {
  const slots = [
    { icon: <path d="M3 12l9-8 9 8M5 10v10h14V10" strokeLinejoin="round"/>, label: "Home" },
    { icon: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>, label: "Planner", active: true },
    { icon: <path d="M3 17l4-4 4 4 5-6 5 5" strokeLinejoin="round"/>, label: "Track" },
    { icon: <><path d="M4 4h7a3 3 0 013 3v13M20 4h-7a3 3 0 00-3 3v13M4 4v15h6M20 4v15h-6"/></>, label: "Learn" },
    { icon: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>, label: "Profile" },
  ];
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, height: 68,
      background: LM.cream, borderTop: `0.5px solid ${LM.hairline}`,
      display: "grid", gridTemplateColumns: "repeat(5,1fr)", alignItems: "center",
    }}>
      {slots.map((s) => (
        <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: s.active ? LM.phase.luteal : LM.espressoMute }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{s.icon}</svg>
          <div style={{
            fontSize: 10, fontFamily: "Georgia, serif",
            fontStyle: s.active ? "italic" : "normal",
            fontWeight: s.active ? 700 : 500, letterSpacing: "0.04em",
          }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function LM_TodayView() {
  return (
    <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Phase hero */}
      <div style={{
        background: LM.paper, borderRadius: 14, padding: "20px 18px",
        border: `0.5px solid ${LM.hairline}`,
        boxShadow: "0 1px 0 rgba(58,44,26,0.04)",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <PhaseSun phase="luteal" size={132}/>
        <div style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase",
          color: LM.phase.luteal, fontWeight: 700, marginTop: 14,
        }}>
          Chapter IV · La Lutéale
        </div>
        <div style={{
          fontFamily: "Georgia, serif", fontSize: 22, fontStyle: "italic",
          color: LM.espresso, marginTop: 6, textAlign: "center", lineHeight: 1.25,
        }}>
          The inward season<br/>has opened.
        </div>
        <div style={{
          fontFamily: "system-ui, sans-serif", fontSize: 13, color: LM.espressoMute,
          marginTop: 10, textAlign: "center", lineHeight: 1.55, padding: "0 4px",
        }}>
          Six days until your next bleed. The body is asking for less light, more warmth. Lean into the slow today.
        </div>
        <div style={{
          marginTop: 14, display: "flex", gap: 16,
          fontSize: 11, fontFamily: "Georgia, serif",
          color: LM.espresso, letterSpacing: "0.06em",
        }}>
          <span><span style={{ fontStyle: "italic" }}>Day</span> {TODAY_DAY}</span>
          <span style={{ color: LM.hairline }}>·</span>
          <span><span style={{ fontStyle: "italic" }}>of</span> 28</span>
          <span style={{ color: LM.hairline }}>·</span>
          <span><span style={{ fontStyle: "italic" }}>Sat</span> 16 May</span>
        </div>
      </div>

      {/* Pillars deck */}
      <div>
        <div style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11,
          letterSpacing: "0.28em", textTransform: "uppercase", color: LM.espressoMute,
          fontWeight: 700, padding: "0 4px 8px",
        }}>
          I · Today's measurements
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {PILLARS.map((p) => (
            <div key={p.k} style={{
              background: LM.paper, borderRadius: 10,
              border: `0.5px solid ${LM.hairline}`,
              padding: "11px 10px", position: "relative", minHeight: 76,
            }}>
              <div style={{
                position: "absolute", top: 9, right: 9,
                width: 6, height: 6, borderRadius: "50%", background: LM.phase[p.phase],
              }}/>
              <div style={{
                fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 9.5,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: LM.espressoMute, fontWeight: 600,
              }}>{p.k}</div>
              <div style={{
                fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 500,
                color: LM.espresso, marginTop: 4, letterSpacing: "-0.02em", lineHeight: 1,
              }}>
                {p.v}<span style={{ fontSize: 11, color: LM.espressoMute, marginLeft: 3 }}>{p.u}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily story reel */}
      <div>
        <div style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11,
          letterSpacing: "0.28em", textTransform: "uppercase", color: LM.espressoMute,
          fontWeight: 700, padding: "0 4px 8px", display: "flex", justifyContent: "space-between",
        }}>
          <span>II · For the inward half</span>
          <span style={{ color: LM.phase.luteal, fontStyle: "italic" }}>see all →</span>
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 4px 6px", scrollbarWidth: "none" }}>
          {STORY_REEL.map((s, i) => (
            <div key={i} style={{
              flex: "0 0 168px", background: LM.paper, borderRadius: 10,
              border: `0.5px solid ${LM.hairline}`, overflow: "hidden",
            }}>
              <div style={{
                height: 84, background: `linear-gradient(135deg, ${LM.phase.luteal} 0%, ${LM.phase.predicted} 100%)`,
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: 8, left: 10,
                  background: LM.cream, color: LM.phase.luteal,
                  fontSize: 8.5, letterSpacing: "0.22em", fontWeight: 700,
                  padding: "3px 7px", borderRadius: 9999, fontFamily: "system-ui, sans-serif",
                }}>LUTEAL</div>
              </div>
              <div style={{ padding: "10px 12px 12px" }}>
                <div style={{
                  fontFamily: "Georgia, serif", fontSize: 13, color: LM.espresso,
                  lineHeight: 1.3, fontStyle: "italic",
                }}>{s.title}</div>
                <div style={{
                  fontFamily: "system-ui, sans-serif", fontSize: 10.5,
                  color: LM.espressoMute, marginTop: 5, letterSpacing: "0.04em",
                }}>{s.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily intention */}
      <div style={{
        background: `linear-gradient(180deg, ${LM.paper} 0%, ${LM.cream} 100%)`,
        border: `0.5px solid ${LM.hairline}`, borderRadius: 14,
        padding: "16px 18px", textAlign: "center",
      }}>
        <div style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 10,
          letterSpacing: "0.32em", textTransform: "uppercase",
          color: LM.phase.luteal, fontWeight: 700,
        }}>III · Daily intention</div>
        <div style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 18,
          color: LM.espresso, marginTop: 8, lineHeight: 1.35,
        }}>What's your anchor for today?</div>
        <div style={{
          marginTop: 12, padding: "10px 14px",
          background: LM.cream, borderRadius: 9999,
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12.5,
          color: LM.espressoMute, border: `0.5px dashed ${LM.hairline}`,
        }}>
          a quiet half-hour after dinner…
        </div>
      </div>

      <div style={{ height: 80 }}/>
    </div>
  );
}

function LM_CycleView() {
  return (
    <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Month ribbon — Shape C */}
      <div style={{
        background: LM.paper, borderRadius: 14, border: `0.5px solid ${LM.hairline}`,
        overflow: "hidden",
      }}>
        <div style={{
          padding: "12px 16px 10px",
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          borderBottom: `0.5px solid ${LM.hairline}`,
        }}>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: LM.espressoMute, fontWeight: 700 }}>
            I · The month
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 13, color: LM.espresso }}>
            May 2026
          </div>
        </div>
        <div style={{ padding: "10px 10px 12px" }}>
          {MONTH_BANDS.map((band) => {
            const c = LM.phase[band.phase];
            return (
              <div key={band.phase} style={{
                marginBottom: 6,
                background: `linear-gradient(90deg, ${c} 0%, ${c} 100%)`,
                borderRadius: 8, padding: "8px 10px",
                position: "relative",
                boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.18), 0 1px 0 rgba(58,44,26,0.06)",
                overflow: "hidden",
              }}>
                {/* paper-print texture — very subtle dot pattern overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "radial-gradient(rgba(244,237,219,0.08) 0.5px, transparent 0.5px)",
                  backgroundSize: "6px 6px",
                  pointerEvents: "none",
                }}/>
                <div style={{
                  fontFamily: "Georgia, serif", fontSize: 9.5, fontStyle: "italic",
                  letterSpacing: "0.32em", textTransform: "uppercase",
                  color: "rgba(244,237,219,0.95)", fontWeight: 700, marginBottom: 4,
                  position: "relative", zIndex: 1,
                }}>
                  {band.name}
                </div>
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 4,
                  position: "relative", zIndex: 1,
                }}>
                  {band.days.map((d) => {
                    const isToday = d === TODAY_DAY;
                    return (
                      <div key={d} style={{
                        width: 24, height: 24, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isToday ? LM.cream : "rgba(244,237,219,0.18)",
                        color: isToday ? LM.phase.luteal : LM.cream,
                        fontFamily: "Georgia, serif", fontSize: 11, fontWeight: isToday ? 800 : 500,
                        letterSpacing: "-0.02em",
                        boxShadow: isToday ? `0 0 0 2px ${LM.cream}, 0 1px 4px rgba(58,44,26,0.18)` : "none",
                      }}>
                        {d}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week ahead */}
      <div style={{
        background: LM.paper, borderRadius: 14, border: `0.5px solid ${LM.hairline}`,
        padding: "14px 16px",
      }}>
        <div style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11,
          letterSpacing: "0.28em", textTransform: "uppercase", color: LM.espressoMute, fontWeight: 700,
        }}>
          II · Week ahead
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginTop: 10 }}>
          {WEEK_AHEAD.map((d) => (
            <div key={d.n} style={{
              textAlign: "center",
              background: d.today ? LM.phase.luteal : "transparent",
              color: d.today ? LM.cream : LM.espresso,
              borderRadius: 8, padding: "8px 0",
              border: d.today ? "none" : `0.5px solid ${LM.hairline}`,
            }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", fontWeight: 600, opacity: d.today ? 0.85 : 0.55, fontFamily: "system-ui, sans-serif" }}>{d.d.toUpperCase()}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: d.today ? 700 : 500, marginTop: 2 }}>{d.n}</div>
              <div style={{ width: 14, height: 3, background: d.today ? LM.cream : LM.phase[d.phase], borderRadius: 9999, margin: "4px auto 0" }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Rhythms carousel */}
      <div>
        <div style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11,
          letterSpacing: "0.28em", textTransform: "uppercase", color: LM.espressoMute,
          fontWeight: 700, padding: "0 4px 8px", display: "flex", justifyContent: "space-between",
        }}>
          <span>III · Rhythms</span>
          <span style={{ color: LM.phase.luteal, fontStyle: "italic" }}>browse →</span>
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 4px 6px", scrollbarWidth: "none" }}>
          {RHYTHMS.map((r, i) => (
            <div key={i} style={{
              flex: "0 0 196px", background: LM.paper, borderRadius: 12,
              border: `0.5px solid ${LM.hairline}`, padding: "14px 14px",
            }}>
              <div style={{
                fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 9.5,
                letterSpacing: "0.26em", textTransform: "uppercase",
                color: LM.phase.luteal, fontWeight: 700,
              }}>Active</div>
              <div style={{
                fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 500,
                color: LM.espresso, marginTop: 4, lineHeight: 1.15,
              }}>{r.title}</div>
              <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 11.5, color: LM.espressoMute, marginTop: 4 }}>{r.sub}</div>
              <div style={{ marginTop: 10, height: 4, borderRadius: 9999, background: "rgba(58,44,26,0.1)" }}>
                <div style={{ height: "100%", width: `${r.pct}%`, background: LM.phase.luteal, borderRadius: 9999 }}/>
              </div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 10, color: LM.espressoMute, marginTop: 4, textAlign: "right", letterSpacing: "0.04em" }}>{r.pct}% · this week</div>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor Ready card */}
      <div style={{
        background: LM.paper, borderRadius: 12, border: `0.5px solid ${LM.hairline}`,
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: `linear-gradient(135deg, ${LM.phase.luteal} 0%, ${LM.phase.predicted} 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={LM.cream} strokeWidth="1.6">
            <rect x="3" y="6" width="18" height="14" rx="2"/>
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M12 11v6M9 14h6"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 9.5, letterSpacing: "0.26em", textTransform: "uppercase", color: LM.espressoMute, fontWeight: 700 }}>
            IV · Doctor-ready
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontStyle: "italic", color: LM.espresso, marginTop: 2 }}>
            6 days to Period · Progesterone <span style={{ color: LM.phase.ovulatory, fontStyle: "normal" }}>↑</span>
          </div>
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11, color: LM.phase.luteal }}>open →</div>
      </div>

      {/* Next cycle plan */}
      <div style={{
        background: LM.paper, borderRadius: 12, border: `0.5px solid ${LM.hairline}`,
        padding: "14px 16px",
      }}>
        <div style={{
          fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 9.5,
          letterSpacing: "0.26em", textTransform: "uppercase",
          color: LM.espressoMute, fontWeight: 700,
        }}>
          V · The next cycle
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontStyle: "italic", color: LM.espresso, marginTop: 4 }}>
          Period predicted Friday 22 May · ±3 days
        </div>
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 12, color: LM.espressoMute, marginTop: 4, lineHeight: 1.5 }}>
          Following cycle window: 22 May → 18 Jun. Build a rhythm now so the descent is gentle.
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <div style={{ flex: 1, padding: "6px 8px", background: LM.cream, borderRadius: 6, border: `0.5px solid ${LM.hairline}`, textAlign: "center" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: LM.espressoMute, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>WINDOW</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, color: LM.espresso, marginTop: 1 }}>±3d</div>
          </div>
          <div style={{ flex: 1, padding: "6px 8px", background: LM.cream, borderRadius: 6, border: `0.5px solid ${LM.hairline}`, textAlign: "center" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: LM.espressoMute, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>CONF</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, color: LM.espresso, marginTop: 1 }}>84%</div>
          </div>
          <div style={{ flex: 1, padding: "6px 8px", background: LM.cream, borderRadius: 6, border: `0.5px solid ${LM.hairline}`, textAlign: "center" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", color: LM.espressoMute, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>OBS</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 13, color: LM.espresso, marginTop: 1 }}>4 cycles</div>
          </div>
        </div>
      </div>

      <div style={{ height: 80 }}/>
    </div>
  );
}

function LeMenuPhaseSunDemo() {
  const [tab, setTab] = useState("today");
  return (
    <div style={{
      width: 375, maxWidth: "100%", height: 812,
      background: LM.cream, color: LM.espresso,
      borderRadius: 32, overflow: "hidden", margin: "0 auto",
      position: "relative", boxShadow: "0 16px 40px rgba(58,44,26,0.18), 0 0 0 1px rgba(58,44,26,0.08)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <LM_NavHeader />
      <LM_TabSwitcher tab={tab} setTab={setTab}/>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
        {tab === "today" ? <LM_TodayView/> : <LM_CycleView/>}
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
    tagline: "Warm cream paper, saturated phase ribbons, a phase-tinted illustrated sun anchors the day.",
    body: "Background #F4EDDB. Phase ribbons are full saturation — crimson, coral, gold, violet, dark plum — without slipping into beige slop. Roman numeral course-numbered cards (I · Today's measurements / III · Daily intention / IV · Doctor-ready). Italic Georgia headings, system sans body. The Phase Sun is the visual anchor of the Today hero: a circular face with 12 rays in the current phase's colour. Violet rays for luteal; coral for follicular; gold for ovulatory; crimson for period. The sun re-tints the entire day at a glance.",
    Comp: LeMenuPhaseSunDemo,
    status: "ready",
  },
  {
    name: "The Interior (Warm Room)",
    tagline: "Your cycle is a room. Currently it's amber-evening luteal — lamp on, dusk window, dark wood panel.",
    body: "Deep warm brown #1E1005. Today's hero is an illustrated room scene that changes by phase — period = cold blue morning, follicular = bright spring window, ovulatory = golden noon, luteal = amber evening with lamp. Cards float as 'objects in the room' in warm parchment with amber borders. Pillars are room metaphors: Sleep = bed, Energy = lamp, Mood = window, Hydration = kettle, Movement = door, Cycle = clock. Wallpaper-band month ribbon.",
    Comp: null,
    status: "coming",
  },
  {
    name: "The Library",
    tagline: "Your cycle is a book. Each phase is a chapter; each day is a page with edge-tabs.",
    body: "Aged cream paper #F2EBD9 with subtle horizontal lines. Today's hero is an open book spread: left page = phase chapter title in big serif (Chapter XXII · The Luteal Chapter), right page = justified serif narrative. Month ribbon = chapter-edge tabs jutting from the right edge in phase colours. Pillars = footnotes with superscript numbers in a 2×3 grid. All serif, old-style figures, tight letter-spacing, a bookmark ribbon hanging from today.",
    Comp: null,
    status: "coming",
  },
  {
    name: "The Garden",
    tagline: "Each phase is a flower's life-stage. Lavender setting seed. Sage borders. Botanical ink.",
    body: "Soft botanical white #F8F6F0. Today's hero is a hand-drawn ink-style botanical of the current phase flower — lavender setting seed for luteal. Card borders in sage green #8AA86A. Month ribbon rows have a delicate botanical line-drawing texture at 10% opacity behind the phase colour. Period = burgundy rose, follicular = apple blossom, ovulatory = sunflower gold, luteal = lavender, predicted = seed-pod brown. Pillars have leaf/petal/stem watermarks.",
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
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 11, letterSpacing: "0.18em", fontWeight: 700,
        textTransform: "uppercase",
      }}>
        Design Lab · Dev Only · 4 interactive Planner concepts
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 18px 0" }}>
        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 32, fontWeight: 600, color: "#0E0E0E",
          letterSpacing: "-0.02em", margin: 0, lineHeight: 1.1,
        }}>Four Planner designs.<br/>Tap to interact.</h1>
        <p style={{
          fontFamily: "system-ui, sans-serif", fontSize: 14,
          color: "rgba(14,14,14,0.7)", marginTop: 10, lineHeight: 1.55,
        }}>
          Each design is a self-contained mock of the full Planner — Today and Cycle tabs,
          switchable, with the actual month ribbon, pillars, story reel, rhythms, doctor-ready
          card, and week ahead all wired up with mocked May 2026 data (Day 22 · Luteal · 6 days
          to Period). Open the one you want to test-drive.
        </p>
        <button onClick={() => setOpenHelp(v => !v)} style={{
          marginTop: 12, padding: "7px 14px", background: "transparent",
          color: "#0E0E0E", border: "1px solid rgba(14,14,14,0.3)", borderRadius: 9999,
          fontFamily: "system-ui, sans-serif", fontSize: 11,
          letterSpacing: "0.16em", cursor: "pointer", fontWeight: 600,
        }}>
          {openHelp ? "Hide help" : "How does picking work?"}
        </button>
        {openHelp && (
          <div style={{
            marginTop: 10, padding: 14, background: "#FAF6EA",
            borderRadius: 8, fontSize: 13, fontFamily: "system-ui, sans-serif",
            color: "rgba(14,14,14,0.85)", lineHeight: 1.55,
          }}>
            Tap <em>Preview this design</em> to expand the interactive demo. Switch between
            Today and Cycle to see how each design handles both tabs. When you've picked,
            tap <em>Pick this design</em> and tell Dispatch — the sweep starts.
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: "40px 14px 0", maxWidth: 560, margin: "0 auto" }}>
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
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 23, fontWeight: 600, letterSpacing: "-0.015em", color: "#0E0E0E" }}>{d.name}</div>
                    {!ready && (
                      <div style={{
                        fontFamily: "system-ui, sans-serif", fontSize: 9.5,
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
                fontFamily: "system-ui, sans-serif", fontSize: 13,
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
                      border: open ? "1.5px solid #0E0E0E" : "1.5px solid #0E0E0E",
                      borderRadius: 9999,
                      fontFamily: "system-ui, sans-serif", fontSize: 12.5,
                      fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                      cursor: "pointer",
                    }}>
                      {open ? "Close preview" : "Preview this design"}
                    </button>
                    <button onClick={pick(d.name)} style={{
                      padding: "11px 18px",
                      background: "transparent", color: "#0E0E0E",
                      border: "1.5px solid rgba(14,14,14,0.2)", borderRadius: 9999,
                      fontFamily: "system-ui, sans-serif", fontSize: 12.5,
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
                    fontFamily: "system-ui, sans-serif", fontSize: 12.5,
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
          <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", fontWeight: 700, color: "rgba(244,241,234,0.7)" }}>
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

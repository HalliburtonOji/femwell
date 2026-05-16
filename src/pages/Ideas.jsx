import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// /Ideas — 5 full-phone-sized Cycle tab designs with REAL Femwell data.
// Today = Sat 16 May 2026 · Cycle Day 22 / 28 · Luteal · 6 days to Period
// Each preview = 375×~800 with status bar, nav, hero, month ribbon, cards,
// bottom nav. Designs are committed (not style guides) — they apply the
// design system to a working layout.
// ─────────────────────────────────────────────────────────────────────────────

const pick = (name) => () =>
  window.alert(`Great — tell Dispatch: "${name}"`);

// Phases over May 2026 with cycle starting Apr 25 (Day 1).
// Layout = Monday-start, 5 rows × 7 cols. Today = May 16, position (row 3, col 6).
const MONTH = [
  // Row 1 · Apr 27 → May 3
  { d: 27, om: true,  phase: "period" },
  { d: 28, om: true,  phase: "period" },
  { d: 29, om: true,  phase: "period" },
  { d: 30, om: true,  phase: "follicular" },
  { d: 1,  om: false, phase: "follicular" },
  { d: 2,  om: false, phase: "follicular" },
  { d: 3,  om: false, phase: "follicular" },
  // Row 2 · May 4-10
  { d: 4,  om: false, phase: "follicular" },
  { d: 5,  om: false, phase: "follicular" },
  { d: 6,  om: false, phase: "follicular" },
  { d: 7,  om: false, phase: "ovulatory" },
  { d: 8,  om: false, phase: "ovulatory" },
  { d: 9,  om: false, phase: "ovulatory" },
  { d: 10, om: false, phase: "luteal" },
  // Row 3 · May 11-17 (TODAY = 16)
  { d: 11, om: false, phase: "luteal" },
  { d: 12, om: false, phase: "luteal" },
  { d: 13, om: false, phase: "luteal" },
  { d: 14, om: false, phase: "luteal" },
  { d: 15, om: false, phase: "luteal" },
  { d: 16, om: false, phase: "luteal", today: true },
  { d: 17, om: false, phase: "luteal" },
  // Row 4 · May 18-24
  { d: 18, om: false, phase: "luteal" },
  { d: 19, om: false, phase: "luteal" },
  { d: 20, om: false, phase: "luteal" },
  { d: 21, om: false, phase: "luteal" },
  { d: 22, om: false, phase: "predicted" },
  { d: 23, om: false, phase: "predicted" },
  { d: 24, om: false, phase: "predicted" },
  // Row 5 · May 25-31
  { d: 25, om: false, phase: "predicted" },
  { d: 26, om: false, phase: "predicted" },
  { d: 27, om: false, phase: "follicular" },
  { d: 28, om: false, phase: "follicular" },
  { d: 29, om: false, phase: "follicular" },
  { d: 30, om: false, phase: "follicular" },
  { d: 31, om: false, phase: "follicular" },
];

const PHONE = {
  width: 375,
  maxWidth: "100%",
  height: 812,
  borderRadius: 32,
  overflow: "hidden",
  margin: "0 auto",
  position: "relative",
  boxShadow: "0 12px 36px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08)",
};

// Status bar — re-skinnable by passing fg color
function StatusBar({ fg = "#fff" }) {
  return (
    <div style={{
      height: 36, display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "0 22px", color: fg,
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: 14, fontWeight: 600, position: "relative", zIndex: 2,
    }}>
      <span>9:41</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill={fg}>
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </svg>
        {/* wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path d="M7.5 1.5 C 4 1.5 1.5 3.5 0 5.5 L 1.5 7 C 3 5 5 4 7.5 4 C 10 4 12 5 13.5 7 L 15 5.5 C 13.5 3.5 11 1.5 7.5 1.5 Z" fill={fg}/>
          <circle cx="7.5" cy="9.5" r="1.5" fill={fg}/>
        </svg>
        {/* battery */}
        <svg width="25" height="11" viewBox="0 0 25 11" fill="none">
          <rect x="0.5" y="0.5" width="22" height="10" rx="2.5" stroke={fg} strokeOpacity="0.4"/>
          <rect x="2" y="2" width="17" height="7" rx="1" fill={fg}/>
          <rect x="23" y="3.5" width="1.5" height="4" rx="0.5" fill={fg} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

// Bottom nav — 5 slots with a phase-coloured highlight slot config
function BottomNav({ bg, fg, activeIdx = -1, activeColor = "#fff", divider }) {
  const Icon = ({ kind }) => {
    if (kind === "today") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2"/></svg>;
    if (kind === "book") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.6"><path d="M4 4h7a3 3 0 013 3v13M20 4h-7a3 3 0 00-3 3v13M4 4v15h6M20 4v15h-6"/></svg>;
    if (kind === "spark") return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.6"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16z"/></svg>;
    if (kind === "user") return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>;
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.8" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>;
  };
  const slots = [
    { kind: "today",  label: "Today" },
    { kind: "book",   label: "Lifestyle" },
    { kind: "spark",  label: "Jess" },
    { kind: "user",   label: "Profile" },
    { kind: "menu",   label: "Menu" },
  ];
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0, height: 72,
      background: bg, borderTop: divider ? `1px solid ${divider}` : "none",
      display: "grid", gridTemplateColumns: "repeat(5,1fr)", alignItems: "center", paddingBottom: 8,
    }}>
      {slots.map((s, i) => {
        const isActive = i === activeIdx;
        return (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ color: isActive ? activeColor : fg }}><Icon kind={s.kind}/></span>
            <span style={{
              color: isActive ? activeColor : fg, opacity: isActive ? 1 : 0.85,
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              fontFamily: "system-ui, sans-serif",
            }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN 1 — VOID
// ─────────────────────────────────────────────────────────────────────────────

function VoidPreview() {
  const COLORS = {
    period: "#FF1744", follicular: "#FF6D00", ovulatory: "#FFD600",
    luteal: "#AA00FF", predicted: "#6200EA",
  };
  return (
    <div style={{ ...PHONE, background: "#000000", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <StatusBar fg="#fff"/>
      {/* Nav header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 22px 8px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>Planner</div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 300, color: "#666", letterSpacing: "0.2em" }}>TODAY</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#AA00FF", letterSpacing: "0.2em", paddingBottom: 2, borderBottom: "1.5px solid #AA00FF" }}>CYCLE</div>
        </div>
      </div>
      {/* Hero */}
      <div style={{ padding: "20px 22px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#AA00FF", letterSpacing: "0.4em" }}>LUTEAL</div>
        <div style={{ fontSize: 64, fontWeight: 300, lineHeight: 1, marginTop: 6, letterSpacing: "-0.04em" }}>Day <span style={{ fontWeight: 700 }}>22</span></div>
        <div style={{ fontSize: 13, fontWeight: 300, color: "#888", marginTop: 8 }}>6 days to Period · May 22</div>
      </div>
      {/* Month ribbon */}
      <div style={{ padding: "0 22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6, fontSize: 9, fontWeight: 700, color: "#555", letterSpacing: "0.18em" }}>
          {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} style={{ textAlign: "center" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {MONTH.map((c, i) => {
            const fill = COLORS[c.phase];
            return (
              <div key={i} style={{
                aspectRatio: "1/1", borderRadius: 4,
                background: c.today ? "#fff" : fill,
                opacity: c.today ? 1 : (c.om ? 0.3 : (c.phase === "predicted" ? 0.55 : 1)),
                display: "flex", alignItems: "center", justifyContent: "center",
                color: c.today ? "#000" : "#fff",
                fontSize: 11, fontWeight: c.today ? 700 : 500,
              }}>
                {c.d}
              </div>
            );
          })}
        </div>
      </div>
      {/* Cards — no bg, no border, 1px left bar */}
      <div style={{ padding: "26px 22px 0", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ borderLeft: "1px solid #AA00FF", paddingLeft: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.22em" }}>SLEEP · TONIGHT</div>
          <div style={{ fontSize: 32, fontWeight: 300, marginTop: 4, letterSpacing: "-0.02em" }}>7.2 <span style={{ fontSize: 16, color: "#888" }}>hrs</span></div>
        </div>
        <div style={{ borderLeft: "1px solid #AA00FF", paddingLeft: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.22em" }}>ENERGY</div>
          <div style={{ fontSize: 32, fontWeight: 300, marginTop: 4, letterSpacing: "-0.02em" }}>68<span style={{ fontSize: 16, color: "#888" }}>%</span></div>
        </div>
        <div style={{ borderLeft: "1px solid #AA00FF", paddingLeft: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.22em" }}>RHYTHM · ACTIVE</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>Luteal Softness</div>
          <div style={{ fontSize: 12, fontWeight: 300, color: "#888", marginTop: 2 }}>6 of 9 steps · this week</div>
        </div>
      </div>
      <BottomNav bg="#000" fg="#444" activeIdx={-1} activeColor="#AA00FF"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN 2 — BROADSHEET
// ─────────────────────────────────────────────────────────────────────────────

function BroadsheetPreview() {
  const PCOL = {
    period: "#C2342C", follicular: "#8A5028", ovulatory: "#B8902C",
    luteal: "#4A3068", predicted: "#7A7A7A",
  };
  const PNAME = {
    period: "PERIOD", follicular: "FOLLICULAR", ovulatory: "OVULATORY",
    luteal: "LUTEAL", predicted: "PREDICTED",
  };
  const phaseDays = (p) => MONTH.filter(c => c.phase === p).map(c => c.d);
  const phases = ["period", "follicular", "ovulatory", "luteal", "predicted"];
  return (
    <div style={{ ...PHONE, background: "#FFFFFF", color: "#0E0E0E", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <StatusBar fg="#0E0E0E"/>
      {/* Masthead */}
      <div style={{ background: "#0E0E0E", color: "#fff", padding: "10px 22px", textAlign: "center" }}>
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em" }}>
          FEMWELL OBSERVER · 16 MAY 2026 · CYCLE IV · ED. XXII
        </div>
      </div>
      {/* Sub-rules */}
      <div style={{ borderBottom: "0.5px solid #0E0E0E", margin: "0 22px" }}/>
      {/* Toggle */}
      <div style={{ padding: "10px 22px 14px", display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid #0E0E0E", margin: "0 22px" }}>
        <div style={{ fontSize: 12, fontFamily: "system-ui, sans-serif", letterSpacing: "0.18em", color: "#666" }}>TODAY  ·  <span style={{ color: "#0E0E0E", fontWeight: 700 }}>CYCLE</span></div>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12, color: "#666" }}>p. xxii</div>
      </div>
      {/* Hero */}
      <div style={{ padding: "16px 22px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, background: PCOL.luteal }}/>
          <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "#0E0E0E" }}>DAY 22 · LUTEAL · 6 DAYS TO PERIOD</div>
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 23, lineHeight: 1.15, marginTop: 8, color: "#0E0E0E", letterSpacing: "-0.005em" }}>
          Body Asks For Rest As Luteal Phase Deepens.
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 11, color: "#666", marginTop: 6 }}>By the cycle desk · 16 May</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#1A1A1A", marginTop: 8, lineHeight: 1.5 }}>
          Four cycles observed put the next period at 22 May, ±3 days. Editor recommends fewer rooms, earlier candles, the second cup of tea.
        </div>
      </div>
      {/* Month ribbon — phase rows */}
      <div style={{ padding: "0 22px", borderTop: "0.5px solid #0E0E0E", borderBottom: "0.5px solid #0E0E0E", marginTop: 4 }}>
        {phases.map((p) => {
          const days = phaseDays(p);
          return (
            <div key={p} style={{ padding: "6px 0", display: "flex", alignItems: "baseline", gap: 8, borderTop: "0.5px dotted #B0B0B0" }}>
              <div style={{ flex: "0 0 70px" }}>
                <div style={{ height: 2, background: PCOL[p], marginBottom: 2 }}/>
                <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>{PNAME[p]}</div>
              </div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#0E0E0E", letterSpacing: "0.04em", lineHeight: 1.4 }}>
                {days.map((d, i) => (
                  <span key={i} style={{ marginRight: 6, fontWeight: (p === "luteal" && d === 16) ? 900 : 400, background: (p === "luteal" && d === 16) ? "#FFE9A0" : "transparent", padding: (p === "luteal" && d === 16) ? "0 3px" : 0 }}>
                    {d}{(p === "luteal" && d === 16) ? "·" : ""}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Cards — newspaper sections */}
      <div style={{ padding: "10px 22px 0" }}>
        <div style={{ paddingBottom: 8 }}>
          <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#0E0E0E" }}>SLEEP · LAST NIGHT</div>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 17, marginTop: 2 }}>Seven point two hours, mostly unbroken.</div>
        </div>
        <div style={{ paddingTop: 8, borderTop: "0.5px solid #0E0E0E" }}>
          <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#0E0E0E" }}>RHYTHM · ACTIVE</div>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 17, marginTop: 2 }}>Luteal Softness — six of nine kept.</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#666", marginTop: 4, lineHeight: 1.4 }}>Energy reads sixty-eight; the rhythm is asking for the chair, not the run.</div>
        </div>
      </div>
      <BottomNav bg="#fff" fg="#444" divider="#0E0E0E" activeColor="#0E0E0E"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN 3 — APOTHECARY FULL
// ─────────────────────────────────────────────────────────────────────────────

function ApothecaryFullPreview() {
  const PCOL = {
    period: "#6B1A2E", follicular: "#8B4A30", ovulatory: "#B89028",
    luteal: "#4A3070", predicted: "#1A0E26",
  };
  const BRASS = "#C8A450";
  return (
    <div style={{ ...PHONE, background: "#1C0E2B", color: "#F2E3CB", fontFamily: "'Cardo', Georgia, serif" }}>
      <StatusBar fg="#F2E3CB"/>
      {/* Nav header */}
      <div style={{ padding: "0 22px 6px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", color: BRASS }}>FEMWELL · MMXXVI</div>
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em" }}><span style={{ color: "#7A6A56" }}>TODAY</span> · <span style={{ color: BRASS, borderBottom: `1px solid ${BRASS}`, paddingBottom: 1 }}>CYCLE</span></div>
      </div>
      {/* Hero */}
      <div style={{ padding: "12px 22px 18px" }}>
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 10, fontWeight: 700, color: BRASS, letterSpacing: "0.4em" }}>EDITION IV · CYCLE OF XXVIII</div>
        <div style={{ fontFamily: "'Cardo', Georgia, serif", fontStyle: "italic", fontSize: 32, lineHeight: 1.05, marginTop: 8, color: "#F2E3CB", letterSpacing: "-0.01em" }}>
          Phase XXII<br/>
          <span style={{ color: BRASS }}>Quietis Profunda</span>
        </div>
        <div style={{ fontFamily: "'Cardo', Georgia, serif", fontStyle: "italic", fontSize: 12, color: "rgba(242,227,203,0.65)", marginTop: 6 }}>The deep quiet — six days to first blood.</div>
      </div>
      {/* Month ribbon — lighter card */}
      <div style={{ margin: "0 18px", padding: 12, background: "#28163A", border: `1px solid ${BRASS}`, borderRadius: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 9, fontWeight: 700, color: BRASS, letterSpacing: "0.32em" }}>MAIUS · MMXXVI</div>
          <div style={{ fontFamily: "'Cardo', serif", fontStyle: "italic", fontSize: 10, color: "rgba(242,227,203,0.6)" }}>obs. iv</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4, fontSize: 8, fontWeight: 700, color: "#7A6A56", letterSpacing: "0.2em", fontFamily: "system-ui, sans-serif" }}>
          {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} style={{ textAlign: "center" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {MONTH.map((c, i) => (
            <div key={i} style={{
              aspectRatio: "1/1", background: PCOL[c.phase], position: "relative",
              opacity: c.om ? 0.45 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Cardo', serif", fontSize: 11, color: "#F2E3CB",
              fontWeight: 400,
            }}>
              {c.today ? (
                <div style={{ width: "85%", height: "85%", background: BRASS, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#1C0E2B", fontWeight: 700, fontSize: 12 }}>16</div>
              ) : c.d}
            </div>
          ))}
        </div>
        {/* legend */}
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 8, fontFamily: "system-ui, sans-serif", letterSpacing: "0.16em", color: BRASS, fontWeight: 600 }}>
          <span>· SANGUIS</span><span>· AURORA</span><span>· LUX</span><span>· QUIES</span>
        </div>
      </div>
      {/* Cards */}
      <div style={{ padding: "16px 22px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "#0E0718", borderTop: `1px solid ${BRASS}`, padding: "12px 14px" }}>
          <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 9, fontWeight: 700, color: BRASS, letterSpacing: "0.32em" }}>TINCTURA · ACTIVA</div>
          <div style={{ fontFamily: "'Cardo', serif", fontStyle: "italic", fontSize: 18, marginTop: 4, color: "#F2E3CB" }}>Luteal Softness</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
            <span style={{ fontFamily: "'Cardo', serif", fontSize: 11, color: "rgba(242,227,203,0.7)", letterSpacing: "0.08em" }}>VI of IX · this week</span>
            <span style={{ fontFamily: "system-ui, sans-serif", fontSize: 9, fontWeight: 700, color: BRASS, letterSpacing: "0.32em" }}>BUILD →</span>
          </div>
        </div>
        <div style={{ background: "#0E0718", borderTop: `1px solid ${BRASS}`, padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 9, fontWeight: 700, color: BRASS, letterSpacing: "0.32em" }}>SOMNUS</div>
            <div style={{ fontFamily: "'Cardo', serif", fontSize: 22, marginTop: 2, color: "#F2E3CB", letterSpacing: "0.04em" }}>VII · II <span style={{ fontSize: 11, color: "rgba(242,227,203,0.6)" }}>h</span></div>
          </div>
          <div>
            <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 9, fontWeight: 700, color: BRASS, letterSpacing: "0.32em" }}>VIGOR</div>
            <div style={{ fontFamily: "'Cardo', serif", fontSize: 22, marginTop: 2, color: "#F2E3CB", letterSpacing: "0.04em" }}>LXVIII <span style={{ fontSize: 11, color: "rgba(242,227,203,0.6)" }}>%</span></div>
          </div>
        </div>
      </div>
      <BottomNav bg="#1C0E2B" fg="#5A4A6A" divider="rgba(200,164,80,0.3)" activeColor={BRASS}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN 4 — CLINICAL AUTHORITY
// ─────────────────────────────────────────────────────────────────────────────

function ClinicalPreview() {
  const NAVY = "#1A2A4A";
  const PCOL = {
    period: "#B83C2A", follicular: "#6B9080", ovulatory: "#D89A48",
    luteal: "#5A4078", predicted: "#9A9A9A",
  };
  // BBT chart approx temp by cycle day
  const tempFor = (day) => {
    if (day < 6) return 36.45;
    if (day < 13) return 36.40 + (day - 6) * 0.02;
    if (day < 16) return 36.70 + (day - 13) * 0.10;
    if (day < 29) return 36.85 - Math.sin((day - 16) * 0.2) * 0.05;
    return 36.45;
  };
  // Build a path across the 31 days of May, mapping each calendar day to cycle day
  // May 1 = cycle day 7 (follicular). May 16 = day 22 (luteal).
  const cycleDayOfMay = (md) => md + 6;
  return (
    <div style={{ ...PHONE, background: "#FAFAF8", color: "#1A1A1A", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <StatusBar fg="#1A1A1A"/>
      {/* Clinical header bar */}
      <div style={{ background: NAVY, color: "#fff", padding: "10px 22px" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em" }}>
          FEMWELL · CHART NO. H.O.-0426 · 16 MAY 2026
        </div>
      </div>
      {/* Toggle */}
      <div style={{ padding: "10px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#666", letterSpacing: "0.12em" }}>TODAY  /  <span style={{ color: NAVY, fontWeight: 700 }}>CYCLE</span></div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#666" }}>v.2 · final</div>
      </div>
      {/* Patient card */}
      <div style={{ margin: "10px 18px 0", border: "1px solid #DDDBD2", background: "#fff" }}>
        <div style={{ background: NAVY, color: "#fff", padding: "6px 12px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 600, letterSpacing: "0.18em" }}>PATIENT</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 600, letterSpacing: "0.18em" }}>H.O. · age 32</span>
        </div>
        <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, borderBottom: "0.5px solid #DDDBD2" }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#666", letterSpacing: "0.16em", fontWeight: 600 }}>CYCLE DAY</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, marginTop: 2, fontWeight: 500, color: NAVY }}>22 / 28</div>
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#666", letterSpacing: "0.16em", fontWeight: 600 }}>PHASE</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 14, marginTop: 2, fontStyle: "italic", color: NAVY }}>Secretory</div>
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#666", letterSpacing: "0.16em", fontWeight: 600 }}>NEXT MENSES</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, marginTop: 2, fontWeight: 500, color: NAVY }}>22 V · 6d</div>
          </div>
        </div>
        {/* 2×2 vitals */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {[
            { l: "SLEEP",      v: "7.2 h",  d: "normal range" },
            { l: "ENERGY",     v: "68 %",   d: "−12 from baseline" },
            { l: "MOOD",       v: "stable", d: "no flagged events" },
            { l: "PROGESTERONE", v: "↑",     d: "expected, secretory" },
          ].map((x, i) => (
            <div key={x.l} style={{ padding: "8px 12px", borderRight: i % 2 === 0 ? "0.5px solid #DDDBD2" : "none", borderTop: i > 1 ? "0.5px solid #DDDBD2" : "none" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#666", letterSpacing: "0.16em", fontWeight: 600 }}>{x.l}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, marginTop: 2, fontWeight: 500, color: NAVY }}>{x.v}</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 10, fontStyle: "italic", color: "#888", marginTop: 1 }}>{x.d}</div>
            </div>
          ))}
        </div>
      </div>
      {/* BBT chart as month ribbon */}
      <div style={{ margin: "10px 18px 0", border: "1px solid #DDDBD2", background: "#fff", padding: "10px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 600, color: NAVY, letterSpacing: "0.16em" }}>BBT · MAY 2026</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 10, fontStyle: "italic", color: "#666" }}>3 bands · °C</div>
        </div>
        <svg viewBox="0 0 320 120" style={{ width: "100%", height: 110 }}>
          {/* phase bands */}
          <rect x="0" y="80" width="320" height="32" fill={PCOL.follicular} fillOpacity="0.10"/>
          <rect x="0" y="45" width="320" height="35" fill={PCOL.ovulatory} fillOpacity="0.10"/>
          <rect x="0" y="14" width="320" height="31" fill={PCOL.luteal} fillOpacity="0.10"/>
          {/* y axis labels */}
          <text x="2" y="98" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill="#666">36.3</text>
          <text x="2" y="63" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill="#666">36.6</text>
          <text x="2" y="28" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill="#666">36.9</text>
          {/* x ticks */}
          {[1, 7, 14, 21, 28, 31].map((d) => {
            const x = 18 + ((d - 1) / 30) * 296;
            return <g key={d}><line x1={x} y1="112" x2={x} y2="115" stroke="#666" strokeWidth="0.4"/><text x={x} y="120" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill="#666" textAnchor="middle">{d}</text></g>;
          })}
          {/* BBT line */}
          <path d={(() => {
            let pts = [];
            for (let md = 1; md <= 31; md++) {
              const x = 18 + ((md - 1) / 30) * 296;
              const t = tempFor(cycleDayOfMay(md));
              const y = 14 + ((36.9 - t) / 0.6) * 84;
              pts.push(`${md === 1 ? "M" : "L"} ${x},${y}`);
            }
            return pts.join(" ");
          })()} fill="none" stroke="#B83C2A" strokeWidth="1.4"/>
          {/* dots */}
          {Array.from({ length: 31 }).map((_, i) => {
            const md = i + 1;
            const x = 18 + ((md - 1) / 30) * 296;
            const t = tempFor(cycleDayOfMay(md));
            const y = 14 + ((36.9 - t) / 0.6) * 84;
            return <circle key={i} cx={x} cy={y} r={md === 16 ? 2.6 : 1.2} fill={md === 16 ? NAVY : "#B83C2A"}/>;
          })}
          {/* today vertical line */}
          <line x1={18 + (15 / 30) * 296} y1="6" x2={18 + (15 / 30) * 296} y2="112" stroke={NAVY} strokeWidth="0.7" strokeDasharray="2 2"/>
          <text x={18 + (15 / 30) * 296 + 4} y="12" fontFamily="IBM Plex Mono, monospace" fontSize="6.5" fill={NAVY} fontWeight="600">TODAY</text>
          {/* phase labels right */}
          <text x="306" y="30" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill={PCOL.luteal} fontWeight="700">LUT</text>
          <text x="306" y="64" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill={PCOL.ovulatory} fontWeight="700">OV</text>
          <text x="306" y="98" fontFamily="IBM Plex Mono, monospace" fontSize="6" fill={PCOL.follicular} fontWeight="700">FOL</text>
        </svg>
      </div>
      {/* Rhythm card with phase sidebar */}
      <div style={{ margin: "10px 18px 0", border: "1px solid #DDDBD2", background: "#fff", display: "flex" }}>
        <div style={{ width: 5, background: PCOL.luteal }}/>
        <div style={{ flex: 1 }}>
          <div style={{ background: NAVY, color: "#fff", padding: "5px 10px" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 600, letterSpacing: "0.16em" }}>RHYTHM · ACTIVE PROTOCOL</span>
          </div>
          <div style={{ padding: "8px 10px" }}>
            <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 15 }}>Luteal Softness · 6 of 9</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 11, color: "#666", marginTop: 2 }}>Reviewed 16.V.2026 · <span style={{ fontStyle: "italic" }}>signed F.W.</span></div>
          </div>
        </div>
      </div>
      <BottomNav bg="#FAFAF8" fg="#888" divider="#DDDBD2" activeColor={NAVY}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN 5 — LE SPECTRE
// ─────────────────────────────────────────────────────────────────────────────

function LeSpectrePreview() {
  // Phase page color = whole-app changes with phase. Currently luteal.
  const PAGE = "#2D1B4E";       // luteal deep violet
  const PAGE_LIGHTER = "#3D2B5E";
  // Cell colors — only the current phase blazes
  const PCOL = {
    period:     "#6A2032",
    follicular: "#8A4830",
    ovulatory:  "#A87830",
    luteal:     "#9E4BFF",   // CURRENT — full saturation
    predicted:  "#3A2A5E",
  };
  return (
    <div style={{ ...PHONE, background: PAGE, color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <StatusBar fg="#fff"/>
      {/* Nav header in phase color (slightly darker) */}
      <div style={{ padding: "0 22px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.32em", color: "rgba(255,255,255,0.6)" }}>FEMWELL</div>
          <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontWeight: 500, color: "#fff", marginTop: 2 }}>Planner</div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.22em", fontWeight: 600 }}>TODAY</div>
          <div style={{ fontSize: 11, color: "#fff", letterSpacing: "0.22em", fontWeight: 800, background: "#fff", color: PAGE, padding: "5px 10px", borderRadius: 9999 }}>CYCLE</div>
        </div>
      </div>
      {/* Hero — large phase glyph + day */}
      <div style={{ padding: "10px 22px 18px", display: "flex", alignItems: "center", gap: 18 }}>
        {/* waning crescent glyph drawn in SVG */}
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="32" fill="#fff"/>
          <circle cx="24" cy="36" r="32" fill={PAGE}/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.36em", color: "#fff", opacity: 0.85 }}>LUTEAL</div>
          <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 42, fontWeight: 600, lineHeight: 0.96, marginTop: 4, color: "#fff", letterSpacing: "-0.02em" }}>Day 22</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>6 days to Period</div>
        </div>
      </div>
      {/* Month ribbon — current phase blazes */}
      <div style={{ padding: "0 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4, fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.22em" }}>
          {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} style={{ textAlign: "center" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {MONTH.map((c, i) => {
            const isLuteal = c.phase === "luteal";
            const isToday = c.today;
            const bg = isToday ? "#fff" : PCOL[c.phase];
            const opacity = isToday ? 1 : (c.om ? 0.35 : (isLuteal ? 1 : 0.55));
            return (
              <div key={i} style={{
                aspectRatio: "1/1", borderRadius: "50%", background: bg, opacity,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isToday ? PAGE : "#fff",
                fontSize: 11.5, fontWeight: isToday ? 800 : 600,
                boxShadow: isLuteal && !isToday ? "0 0 12px rgba(158,75,255,0.45)" : "none",
              }}>
                {c.d}
              </div>
            );
          })}
        </div>
      </div>
      {/* Cards in lighter violet */}
      <div style={{ padding: "16px 18px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ background: PAGE_LIGHTER, borderRadius: 18, padding: "14px 16px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.28em" }}>RHYTHM</div>
          <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontWeight: 500, marginTop: 4, color: "#fff" }}>Luteal Softness</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{ width: 16, height: 4, borderRadius: 2, background: i < 6 ? "#fff" : "rgba(255,255,255,0.25)" }}/>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>6 / 9</div>
          </div>
        </div>
        <div style={{ background: PAGE_LIGHTER, borderRadius: 18, padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.28em" }}>SLEEP</div>
            <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 26, fontWeight: 500, marginTop: 2, color: "#fff" }}>7.2<span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}> hrs</span></div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.28em" }}>ENERGY</div>
            <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 26, fontWeight: 500, marginTop: 2, color: "#fff" }}>68<span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>%</span></div>
          </div>
        </div>
      </div>
      <BottomNav bg={PAGE} fg="rgba(255,255,255,0.55)" divider="rgba(255,255,255,0.15)" activeColor="#fff"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const CONCEPTS = [
  {
    name: "Void",
    tagline: "Pure black, full saturation, no decoration.",
    body: "OLED #000 everywhere. Phase ribbons in the calendar at full saturation. Cards have no border, no fill — just text and a 1px coloured left bar. System sans, weights 300 and 700 only. Stats are huge thin numerals. The design uses nothing but colour and space.",
    Comp: VoidPreview,
  },
  {
    name: "Broadsheet",
    tagline: "Editorial newspaper layout, serif italic headlines.",
    body: "Full-bleed black masthead. Day 22's hero is a serif italic headline: \"Body Asks For Rest As Luteal Phase Deepens.\" Month ribbon = phase rows like a newspaper calendar with thin coloured rules. Cards use newspaper section grammar (all-caps sans kicker + serif italic head + serif body). Colour appears only in phase identifiers — no fills.",
    Comp: BroadsheetPreview,
  },
  {
    name: "Apothecary Full",
    tagline: "1890s apothecary journal at full scale.",
    body: "Deep aubergine background. Each phase row is its own hue (crimson → terracotta → old gold → deep violet → near-black). Today = brass-filled circle. Cards on a darker purple-black with a 1px brass top border. Edwardian numerals for stats: \"VII · II\" for 7.2h, \"LXVIII\" for 68%. Hero reads \"Phase XXII · Quietis Profunda.\"",
    Comp: ApothecaryFullPreview,
  },
  {
    name: "Clinical Authority",
    tagline: "Medical charting meets luxury. The doctor's app.",
    body: "Off-white clinical paper. The month ribbon IS a BBT chart with phase bands and a temperature curve. Patient card: name H.O., cycle 22/28, phase \"Secretory (Luteal)\", 2×2 vitals (Sleep 7.2h, Energy 68%, Mood Stable, Progesterone ↑). Navy clinical header bars. IBM Plex Mono for numbers, Georgia for body. Signed F.W. on every card.",
    Comp: ClinicalPreview,
  },
  {
    name: "Le Spectre",
    tagline: "The whole app turns the colour of your current phase.",
    body: "Right now it's luteal so the entire screen is deep violet. The current phase cells in the ribbon blaze at full saturation; other cells are tinted but muted. Today's cell is white. Large decorative phase glyph (waning crescent) sits in the hero at 60px. When period arrives, the whole app turns crimson. This is the only concept where the app itself changes colour with the cycle.",
    Comp: LeSpectrePreview,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function Ideas() {
  const [openHelp, setOpenHelp] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: "#F4F1EA", paddingBottom: 120 }}>
      {/* Dev banner */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#0E0E0E", color: "#F4F1EA",
        padding: "12px 16px", textAlign: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 11, letterSpacing: "0.18em", fontWeight: 700,
        textTransform: "uppercase",
      }}>
        Design Lab · Dev Only · Not for production
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 18px 0" }}>
        <h1 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 32, fontWeight: 600,
          color: "#0E0E0E", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.1,
        }}>Five Cycle-tab designs.</h1>
        <p style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 14, color: "rgba(14,14,14,0.7)",
          marginTop: 8, lineHeight: 1.5,
        }}>
          Each preview is the actual Planner Cycle tab rendered in a different design system —
          real data, Day 22 of 28, luteal, six days to period, May 2026. Tap <em>Pick this design</em>
          on the one that lands, or message Dispatch with a remix like
          "Apothecary ribbon + Broadsheet copy."
        </p>
        <button
          onClick={() => setOpenHelp(v => !v)}
          style={{
            marginTop: 12, padding: "7px 14px",
            background: "transparent", color: "#0E0E0E",
            border: "1px solid rgba(14,14,14,0.3)", borderRadius: 9999,
            fontFamily: "system-ui, sans-serif", fontSize: 11,
            letterSpacing: "0.16em", cursor: "pointer", fontWeight: 600,
          }}
        >
          {openHelp ? "Hide help" : "How does picking work?"}
        </button>
        {openHelp && (
          <div style={{
            marginTop: 10, padding: 14, background: "#FAF6EA",
            borderRadius: 8, fontSize: 13, fontFamily: "system-ui, sans-serif",
            color: "rgba(14,14,14,0.85)", lineHeight: 1.55,
          }}>
            Picking shows a confirmation. Nothing is applied automatically — Dispatch (Claude)
            sweeps MonthRibbon, the Cycle cards, and typography tokens by hand so you can
            review each surface. You can also say "mix Clinical + Broadsheet" and the sweep
            will combine them.
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 56, padding: "44px 14px 0", maxWidth: 520, margin: "0 auto" }}>
        {CONCEPTS.map(({ name, tagline, body, Comp }, idx) => (
          <section key={name}>
            <div style={{
              display: "flex", alignItems: "baseline", gap: 14,
              marginBottom: 16, paddingLeft: 4,
            }}>
              <div style={{
                fontFamily: "Georgia, serif", fontSize: 13, fontWeight: 600,
                color: "rgba(14,14,14,0.4)", letterSpacing: "0.04em", minWidth: 22,
              }}>0{idx + 1}</div>
              <div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 600, letterSpacing: "-0.015em", color: "#0E0E0E" }}>{name}</div>
                <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 13, color: "rgba(14,14,14,0.6)", marginTop: 2, fontStyle: "italic" }}>{tagline}</div>
              </div>
            </div>
            <Comp />
            <p style={{
              fontFamily: "system-ui, sans-serif", fontSize: 13.5,
              color: "rgba(14,14,14,0.78)", lineHeight: 1.55,
              maxWidth: 460, margin: "20px auto 0", padding: "0 8px",
            }}>{body}</p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button onClick={pick(name)} style={{
                padding: "13px 22px",
                background: "#0E0E0E", color: "#F4F1EA",
                border: "none", borderRadius: 9999,
                fontFamily: "system-ui, sans-serif", fontSize: 13,
                fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(14,14,14,0.18)",
              }}>
                Pick this design →
              </button>
            </div>
          </section>
        ))}
        <div style={{
          marginTop: 24, padding: 22,
          background: "#0E0E0E", color: "#F4F1EA",
          borderRadius: 16, textAlign: "center", fontFamily: "Georgia, serif",
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", fontWeight: 700, color: "rgba(244,241,234,0.7)" }}>
            Or mix two
          </div>
          <div style={{ marginTop: 8, fontSize: 18, fontStyle: "italic", lineHeight: 1.4 }}>
            "Clinical chart + Broadsheet copy"<br/>
            "Void layout + Apothecary palette"<br/>
            "Le Spectre but with serif type"
          </div>
          <div style={{ marginTop: 14, fontSize: 12, fontFamily: "system-ui, sans-serif", color: "rgba(244,241,234,0.7)" }}>
            Tell Dispatch in your next message and the sweep starts.
          </div>
        </div>
      </div>
    </div>
  );
}

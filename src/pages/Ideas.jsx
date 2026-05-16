import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Ideas — Design Lab gallery of 15 Cycle-tab concepts.
// Dev-only page Halli can open on her phone at femwells.com/Ideas.
// Each concept is a compact phone-mockup card with a "Pick this one" button
// that just alerts; pick is communicated to Dispatch (Claude) manually.
//
// THREE ROUNDS:
//   Round 1 — Color systems        (Apothecary No.09, Le Menu, Atelier Plain,
//                                    Aurora Field, Maison Rouge)
//   Round 2 — Editorial variants   (The Almanac, Maison Noire, The Ceremony,
//                                    The Sunday Paper, FW Cycle Press)
//   Round 3 — Structural objects   (The Wheel, The Weather Forecast, The
//                                    Interior, The Watch Face, The Letter)
// ─────────────────────────────────────────────────────────────────────────────

const pick = (name) => () =>
  window.alert(`Great choice — tell Dispatch "${name}" and we'll roll it across the Cycle tab.`);

// Shared phone-frame for every mockup
const PHONE_FRAME = {
  width: "100%",
  maxWidth: 360,
  aspectRatio: "9 / 16",
  borderRadius: 22,
  overflow: "hidden",
  margin: "0 auto",
  position: "relative",
  boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
};

const CARD = {
  background: "#FFFFFF",
  borderRadius: 18,
  padding: 18,
  marginBottom: 22,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.05)",
};

const PICK_BTN = {
  display: "block",
  width: "100%",
  marginTop: 14,
  padding: "12px 16px",
  background: "#3A2C1A",
  color: "#F8F6F1",
  border: "none",
  borderRadius: 10,
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "0.04em",
  cursor: "pointer",
  textAlign: "left",
};

const ROUND_HEADER = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: "#7A6A56",
  marginTop: 30,
  marginBottom: 14,
  paddingLeft: 4,
};

// ───────────────────────── ROUND 1 — Color systems ──────────────────────────

const Apothecary = () => (
  <div style={{ ...PHONE_FRAME, background: "#1C0E2B", color: "#C8A450", padding: 24, fontFamily: "Georgia, serif" }}>
    <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "#C8A450", textAlign: "center", marginBottom: 14, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>Apothecary · No. 09</div>
    <div style={{ fontSize: 11, letterSpacing: "0.32em", color: "rgba(200,164,80,0.65)", letterSpacing: "0.3em", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>FRIDAY · 15 MAY</div>
    <div style={{ fontSize: 36, color: "#F2E3CB", marginTop: 8, fontStyle: "italic", letterSpacing: "-0.01em" }}>Phase XXII</div>
    <div style={{ fontSize: 14, color: "rgba(200,164,80,0.85)", fontStyle: "italic", marginTop: 2 }}>Luteal depth · day 22 of 28</div>
    <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
      {["#2E1848","#2E1848","#6B1A2E","#6B1A2E","#8B4A30","#8B4A30","#8B4A30","#8B4A30","#7A6020","#7A6020","#7A6020","#4A3070","#4A3070","#4A3070"].map((c,i)=>(
        <div key={i} style={{ aspectRatio:"1/1", background:c, borderRadius:1 }} />
      ))}
    </div>
    <div style={{ marginTop: 14, padding: "12px 14px", background: "#2A1A3D", border: "1px solid rgba(200,164,80,0.22)", borderRadius: 6 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.32em", color: "#C8A450", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>· ACTIVE TINCTURE</div>
      <div style={{ fontSize: 17, color: "#F2E3CB", marginTop: 4, fontStyle: "italic" }}>Luteal Softness</div>
    </div>
  </div>
);

const LeMenu = () => (
  <div style={{ ...PHONE_FRAME, background: "#F4EDDB", color: "#3A2C1A", padding: 24, fontFamily: "Georgia, serif" }}>
    <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "#3A2C1A", textAlign: "center", marginBottom: 14, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Le Menu · 2026 · printemps</div>
    <div style={{ borderTop: "1px solid #3A2C1A", borderBottom: "1px solid #3A2C1A", padding: "16px 0", textAlign: "center" }}>
      <div style={{ fontSize: 12, letterSpacing: "0.34em", color: "rgba(58,44,26,0.7)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>III · PLAT</div>
      <div style={{ fontSize: 34, marginTop: 8, letterSpacing: "-0.01em" }}>The luteal table</div>
      <div style={{ fontSize: 13, fontStyle: "italic", color: "rgba(58,44,26,0.75)", marginTop: 6 }}>Day twenty-two · taken slowly</div>
    </div>
    <div style={{ marginTop: 14, display: "flex", gap: 4 }}>
      {["#C4899A","#D4A090","#C8B870","#9A8AB0","#8A7AA0","#8A7AA0"].map((c,i)=>(
        <div key={i} style={{ flex: 1, height: 10, background: c }} />
      ))}
    </div>
    <div style={{ marginTop: 22, fontSize: 11, letterSpacing: "0.28em", color: "rgba(58,44,26,0.6)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>· COURSE OF SIX RITUALS</div>
    <ul style={{ marginTop: 8, padding: 0, listStyle: "none", fontSize: 14 }}>
      <li style={{ borderBottom: "1px dotted rgba(58,44,26,0.3)", padding: "6px 0", display: "flex", justifyContent: "space-between" }}><span style={{ fontStyle: "italic" }}>Warm grains</span><span>· 8 min</span></li>
      <li style={{ borderBottom: "1px dotted rgba(58,44,26,0.3)", padding: "6px 0", display: "flex", justifyContent: "space-between" }}><span style={{ fontStyle: "italic" }}>Early candles</span><span>· dusk</span></li>
      <li style={{ padding: "6px 0", display: "flex", justifyContent: "space-between" }}><span style={{ fontStyle: "italic" }}>Second tea</span><span>· 4 min</span></li>
    </ul>
  </div>
);

const AtelierPlain = () => (
  <div style={{ ...PHONE_FRAME, background: "#F8F8F6", color: "#3A3A38", padding: 24, fontFamily: "'Inter', sans-serif" }}>
    <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(58,58,56,0.55)", fontWeight: 600 }}>Atelier · Edition 027</div>
    <div style={{ marginTop: 24, fontSize: 54, fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 0.9, color: "#0E0E0E" }}>22<span style={{ fontSize: 16, color: "rgba(58,58,56,0.5)" }}>/28</span></div>
    <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 8, color: "rgba(58,58,56,0.7)" }}>Luteal · day twenty-two</div>
    <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
      {["#D4B0BA","#D4B0BA","#DCC4B4","#DCC4B4","#DCC4B4","#D8D0A8","#D8D0A8","#D8D0A8","#C0B4D0","#C0B4D0","#C0B4D0","#B0A4C4","#B0A4C4","#B0A4C4"].map((c,i)=>(
        <div key={i} style={{ aspectRatio:"1/1", background:c }} />
      ))}
    </div>
    <div style={{ marginTop: 18, padding: "14px 16px", background: "#EFEFEC", borderRadius: 2 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "rgba(58,58,56,0.55)", fontWeight: 700 }}>EDITION</div>
      <div style={{ fontSize: 18, marginTop: 4, fontWeight: 400 }}>Luteal Softness</div>
      <div style={{ fontSize: 11, color: "rgba(58,58,56,0.6)", marginTop: 2 }}>six rituals</div>
    </div>
  </div>
);

const AuroraField = () => (
  <div style={{ ...PHONE_FRAME, background: "linear-gradient(180deg,#0C0822 0%,#201048 60%,#3A2068 100%)", color: "#E5D8C8", padding: 24, fontFamily: "'Inter', sans-serif" }}>
    <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(232,138,96,0.8)", textTransform: "uppercase", fontWeight: 700 }}>Night sky · day 22</div>
    <div style={{ marginTop: 12, fontSize: 36, color: "#F8EFE2", fontFamily: "Georgia, serif", fontWeight: 500 }}>Luteal</div>
    <div style={{ fontSize: 13, color: "rgba(232,216,200,0.8)" }}>The sky tips toward the next dawn</div>
    <div style={{ marginTop: 22, height: 60, position: "relative", borderRadius: 8, overflow: "hidden", background: "linear-gradient(90deg,#581830 0%,#7A3820 28%,#7A5818 52%,#3A2068 78%,#201048 100%)" }}>
      <div style={{ position: "absolute", left: "70%", top: 12, width: 18, height: 18, borderRadius: "50%", background: "#E88A60", boxShadow: "0 0 16px rgba(232,138,96,0.85)" }} />
    </div>
    <div style={{ marginTop: 18, padding: "14px 16px", background: "#181030", border: "1px solid rgba(232,138,96,0.19)", borderRadius: 12 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#E88A60", fontWeight: 700 }}>RHYTHM · ACTIVE</div>
      <div style={{ fontSize: 18, marginTop: 4, color: "#F8EFE2", fontFamily: "Georgia, serif", fontWeight: 500 }}>Luteal Softness</div>
      <div style={{ fontSize: 11, color: "rgba(232,216,200,0.7)", marginTop: 2 }}>6 rituals · slow walks, warm food</div>
    </div>
  </div>
);

const MaisonRouge = () => (
  <div style={{ ...PHONE_FRAME, background: "#F6EDE0", color: "#3A1A1A", padding: 24, fontFamily: "Georgia, serif" }}>
    <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#B88A28", textTransform: "uppercase", textAlign: "center", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>Maison Rouge · MMXXVI</div>
    <div style={{ marginTop: 14, textAlign: "center" }}>
      <div style={{ fontSize: 12, letterSpacing: "0.34em", color: "#B88A28", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>ACT III · OPUS 22</div>
      <div style={{ fontSize: 46, fontWeight: 700, color: "#3A1A1A", lineHeight: 1, marginTop: 8, letterSpacing: "-0.02em" }}>LUTEAL</div>
      <div style={{ fontSize: 14, color: "#8A1A30", fontStyle: "italic", marginTop: 4 }}>Take the room</div>
    </div>
    <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
      {["#4A2058","#4A2058","#8A1A30","#8A1A30","#A84830","#A84830","#A84830","#A84830","#B88A28","#B88A28","#B88A28","#6A3A78","#6A3A78","#6A3A78"].map((c,i)=>(
        <div key={i} style={{ aspectRatio:"1/1", background:c, borderRadius:2 }} />
      ))}
    </div>
    <div style={{ marginTop: 18, padding: "14px 16px", background: "#EEE0D0", border: "1px solid rgba(184,138,40,0.25)", borderRadius: 4 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#B88A28", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>· RHYTHM</div>
      <div style={{ fontSize: 22, marginTop: 4, fontWeight: 700, color: "#3A1A1A" }}>Luteal Softness</div>
    </div>
  </div>
);

// ───────────────────────── ROUND 2 — Editorial variants ─────────────────────

const TheAlmanac = () => (
  <div style={{ ...PHONE_FRAME, background: "#EFE6D0", color: "#2A2418", padding: 24, fontFamily: "Georgia, serif" }}>
    <div style={{ textAlign: "center", borderBottom: "2px solid #2A2418", paddingBottom: 10 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "#2A2418", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>EST · MMXXVI</div>
      <div style={{ fontSize: 32, marginTop: 6, fontWeight: 700, letterSpacing: "-0.01em" }}>THE ALMANAC</div>
      <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(42,36,24,0.65)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>VOL 4 · NO 22</div>
    </div>
    <div style={{ marginTop: 16, fontSize: 12, letterSpacing: "0.22em", color: "rgba(42,36,24,0.6)", textTransform: "uppercase" }}>· Friday the fifteenth</div>
    <div style={{ marginTop: 6, fontSize: 22, fontStyle: "italic", lineHeight: 1.2 }}>The luteal half begins —<br/>a turning inward, slowly.</div>
    <div style={{ marginTop: 16, display: "flex", justifyContent: "space-around", borderTop: "1px solid #2A2418", borderBottom: "1px solid #2A2418", padding: "10px 0", fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
      <div>· DAY 22 ·</div><div>· OF 28 ·</div><div>· LUTEAL ·</div>
    </div>
    <div style={{ marginTop: 14, fontSize: 13, fontStyle: "italic", color: "rgba(42,36,24,0.85)" }}>Today's office hours close at dusk. Tomorrow's wind: gentle.</div>
  </div>
);

const MaisonNoire = () => (
  <div style={{ ...PHONE_FRAME, background: "#0E0A0E", color: "#E8DCC4", padding: 24, fontFamily: "Georgia, serif" }}>
    <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "#C8A450", textAlign: "center", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>· MAISON NOIRE ·</div>
    <div style={{ marginTop: 14, textAlign: "center" }}>
      <div style={{ fontSize: 12, letterSpacing: "0.36em", color: "rgba(200,164,80,0.8)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>OPUS 22</div>
      <div style={{ fontSize: 48, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 0.95, marginTop: 8, color: "#E8DCC4" }}>LUTEAL<br/><span style={{ fontStyle: "italic", color: "#C8A450", fontWeight: 300 }}>noire.</span></div>
    </div>
    <div style={{ marginTop: 22, height: 1, background: "#C8A450" }} />
    <div style={{ marginTop: 16, fontSize: 11, letterSpacing: "0.32em", color: "rgba(200,164,80,0.7)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>· PROGRAMME ·</div>
    <div style={{ marginTop: 6, fontSize: 14, color: "rgba(232,220,196,0.85)", fontStyle: "italic", lineHeight: 1.6 }}>I. Warm grains — at dusk<br/>II. The slow walk — 22 min<br/>III. Soft candles — earlier</div>
    <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(200,164,80,0.08)", border: "1px solid rgba(200,164,80,0.25)" }}>
      <div style={{ fontSize: 11, fontStyle: "italic", color: "#C8A450" }}>Curtain rises Wed 20 May.</div>
    </div>
  </div>
);

const TheCeremony = () => (
  <div style={{ ...PHONE_FRAME, background: "#F8F0E8", color: "#3A1A30", padding: 24, fontFamily: "Georgia, serif", textAlign: "center" }}>
    <div style={{ fontSize: 9, letterSpacing: "0.45em", color: "#8A4A60", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>· THE CEREMONY ·</div>
    <div style={{ marginTop: 14, fontSize: 11, letterSpacing: "0.4em", color: "rgba(58,26,48,0.6)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>FRIDAY THE FIFTEENTH</div>
    <div style={{ marginTop: 28, fontSize: 28, fontStyle: "italic", lineHeight: 1.15 }}>You are invited<br/>to the luteal half</div>
    <div style={{ marginTop: 4, fontSize: 13, color: "rgba(58,26,48,0.7)" }}>day twenty-two of twenty-eight</div>
    <div style={{ marginTop: 26, display: "inline-block", padding: "8px 22px", border: "1px solid #3A1A30", letterSpacing: "0.32em", fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>R · S · V · P</div>
    <div style={{ marginTop: 22, fontSize: 11, color: "rgba(58,26,48,0.5)", fontStyle: "italic" }}>The next event begins Wednesday.<br/>Black tie of softness recommended.</div>
  </div>
);

const SundayPaper = () => (
  <div style={{ ...PHONE_FRAME, background: "#FAF6EB", color: "#1A1A1A", padding: 18, fontFamily: "Georgia, serif" }}>
    <div style={{ borderBottom: "3px double #1A1A1A", paddingBottom: 8 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.4em", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>· THE SUNDAY PAPER · VOL XXII ·</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, letterSpacing: "-0.02em", textTransform: "uppercase" }}>Luteal eight,<br/>and counting.</div>
      <div style={{ fontSize: 11, fontStyle: "italic", marginTop: 2, color: "rgba(26,26,26,0.7)" }}>By Halli · From the cycle desk</div>
    </div>
    <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11.5, lineHeight: 1.45, color: "rgba(26,26,26,0.85)" }}>
      <div>Day 22 of a 28-day arc puts you firmly in the luteal half — the slow descent, four cycles observed at 84% confidence.</div>
      <div>Next column drops Wed 20 May. Editor's note suggests early candles, the second cup of tea, finishing fewer things.</div>
    </div>
    <div style={{ marginTop: 12, padding: "8px 0", borderTop: "1px solid #1A1A1A", borderBottom: "1px solid #1A1A1A", fontSize: 10, letterSpacing: "0.28em", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>WEATHER · LUTEAL · LOW EFFORT · HIGH SOFTNESS</div>
  </div>
);

const FWCyclePress = () => (
  <div style={{ ...PHONE_FRAME, background: "#1A1A1A", color: "#F2E8D8", padding: 22, fontFamily: "'Inter', sans-serif" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid #C8A450", paddingBottom: 8 }}>
      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: "Georgia, serif" }}>FW Cycle Press</div>
      <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#C8A450", fontWeight: 700 }}>ISSUE · 22</div>
    </div>
    <div style={{ marginTop: 14, fontSize: 10, letterSpacing: "0.3em", color: "#C8A450", fontWeight: 700 }}>· FEATURE</div>
    <div style={{ fontSize: 26, marginTop: 4, fontFamily: "Georgia, serif", fontWeight: 600, lineHeight: 1.1, color: "#F2E8D8" }}>Inside the luteal half: what 4 cycles tell us</div>
    <div style={{ marginTop: 12, padding: "8px 12px", background: "#2A2A2A", borderLeft: "3px solid #C8A450" }}>
      <div style={{ fontSize: 11, fontStyle: "italic", color: "rgba(242,232,216,0.85)" }}>"Next period: Wed 20 May (±3 days). Confidence 84%."</div>
    </div>
    <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 10 }}>
      <div style={{ padding: 8, background: "#2A2A2A" }}><div style={{ color: "#C8A450", letterSpacing: "0.2em", fontWeight: 700, fontSize: 9 }}>STREAK</div><div style={{ fontSize: 18, marginTop: 2, color: "#F2E8D8" }}>67%</div></div>
      <div style={{ padding: 8, background: "#2A2A2A" }}><div style={{ color: "#C8A450", letterSpacing: "0.2em", fontWeight: 700, fontSize: 9 }}>PHASE</div><div style={{ fontSize: 14, marginTop: 4, color: "#F2E8D8" }}>Luteal</div></div>
      <div style={{ padding: 8, background: "#2A2A2A" }}><div style={{ color: "#C8A450", letterSpacing: "0.2em", fontWeight: 700, fontSize: 9 }}>NEXT</div><div style={{ fontSize: 14, marginTop: 4, color: "#F2E8D8" }}>Wed 20</div></div>
    </div>
  </div>
);

// ──────────────────────── ROUND 3 — Structural objects ──────────────────────

const TheWheel = () => (
  <div style={{ ...PHONE_FRAME, background: "#F3EBDC", color: "#2C2418", padding: 18, fontFamily: "Georgia, serif", display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(44,36,24,0.6)", fontFamily: "'Inter', sans-serif", fontWeight: 700, marginBottom: 8 }}>· THE WHEEL · DAY 22</div>
    <svg viewBox="0 0 200 200" width="220" height="220" style={{ maxWidth: "85%" }}>
      <defs>
        <pattern id="wheelBg" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#F3EBDC"/></pattern>
      </defs>
      {/* 28 sectors */}
      {Array.from({ length: 28 }).map((_, i) => {
        const a1 = (i / 28) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / 28) * Math.PI * 2 - Math.PI / 2;
        const x1 = 100 + Math.cos(a1) * 80; const y1 = 100 + Math.sin(a1) * 80;
        const x2 = 100 + Math.cos(a2) * 80; const y2 = 100 + Math.sin(a2) * 80;
        const phase = i < 5 ? "#B8442A" : i < 12 ? "#D88E4A" : i < 15 ? "#E2C76C" : "#7A5572";
        return <path key={i} d={`M100,100 L${x1},${y1} A80,80 0 0,1 ${x2},${y2} Z`} fill={phase} stroke="#F3EBDC" strokeWidth="0.5"/>;
      })}
      {/* Today marker at day 22 */}
      <circle cx={100 + Math.cos((21.5/28)*Math.PI*2 - Math.PI/2) * 80} cy={100 + Math.sin((21.5/28)*Math.PI*2 - Math.PI/2) * 80} r="5" fill="#2C2418" stroke="#F3EBDC" strokeWidth="2"/>
      <circle cx="100" cy="100" r="42" fill="#F3EBDC"/>
      <text x="100" y="98" textAnchor="middle" fontFamily="Georgia, serif" fontSize="34" fill="#2C2418">22</text>
      <text x="100" y="116" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2" fill="rgba(44,36,24,0.65)">LUTEAL</text>
    </svg>
    <div style={{ marginTop: 8, fontSize: 14, fontStyle: "italic", textAlign: "center", color: "rgba(44,36,24,0.8)" }}>Five days until the wheel turns.</div>
  </div>
);

const TheWeatherForecast = () => (
  <div style={{ ...PHONE_FRAME, background: "linear-gradient(180deg,#3F1844 0%,#8C2E5F 60%,#D55B5A 90%,#E89373 100%)", color: "#F8EFE2", padding: 22, fontFamily: "'Inter', sans-serif" }}>
    <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(248,239,226,0.8)", textTransform: "uppercase", fontWeight: 600 }}>FRIDAY 15 MAY · LUTEAL</div>
    <div style={{ fontSize: 56, fontFamily: "Georgia, serif", fontWeight: 500, lineHeight: 1, marginTop: 12 }}>Day 22</div>
    <div style={{ fontSize: 14, marginTop: 6, color: "rgba(248,239,226,0.85)" }}>The sky tips toward the next dawn.</div>
    <div style={{ marginTop: 18, height: 70, borderRadius: 12, overflow: "hidden", position: "relative", background: "linear-gradient(90deg,#B83C2A 0%,#D88E4A 24%,#E2C76C 42%,#7A5572 64%,#4A2A3A 100%)" }}>
      <div style={{ position: "absolute", left: "calc(70% - 10px)", top: 14, width: 20, height: 20, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%,#FFF9E8 0%,#F8C56B 50%,#F08E3F 100%)", boxShadow: "0 0 20px rgba(255,210,140,0.95)" }} />
    </div>
    <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
      {[{d:"SAT",n:16,c:"#7A5572"},{d:"SUN",n:17,c:"#7A5572"},{d:"MON",n:18,c:"#7A5572"},{d:"TUE",n:19,c:"#7A5572"},{d:"WED",n:20,c:"#D55B5A"}].map((x,i)=>(
        <div key={i} style={{ textAlign:"center", padding:8, background:"rgba(255,255,255,0.07)", borderRadius:10, backdropFilter:"blur(8px)" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(248,239,226,0.7)", fontWeight: 700 }}>{x.d}</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 500 }}>{x.n}</div>
          <div style={{ width: 22, height: 3, background: x.c, borderRadius: 9999, margin: "4px auto 0" }} />
        </div>
      ))}
    </div>
    <div style={{ marginTop: 12, fontSize: 10, letterSpacing: "0.22em", color: "rgba(248,239,226,0.85)", textAlign: "center", fontWeight: 600 }}>NEXT PERIOD · WED 20 · ±3D · 84%</div>
  </div>
);

const TheInterior = () => (
  <div style={{ ...PHONE_FRAME, background: "#1A0510", color: "#F2E3CB", padding: 22, fontFamily: "Georgia, serif" }}>
    <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#E4B53A", textAlign: "center", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>The Interior · room 22</div>
    <div style={{ marginTop: 18, padding: 18, background: "#3A0A1A", borderRadius: 6, border: "1px solid rgba(228,181,58,0.3)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#E4B53A", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>FRIDAY · 15 MAY</div>
      <div style={{ fontSize: 56, fontWeight: 700, color: "#F2E3CB", lineHeight: 1, marginTop: 8, letterSpacing: "-0.03em" }}>DAY <span style={{ color: "#E4B53A" }}>22</span></div>
      <div style={{ fontSize: 14, fontStyle: "italic", color: "#E08576", marginTop: 6 }}>The luteal half. Take the room.</div>
    </div>
    <div style={{ marginTop: 14, padding: 10, background: "#28071A", border: "1px solid rgba(228,181,58,0.2)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {[
          ["#5A1A2A","#5A1A2A","#5A1A2A","#5A1A2A","#D9462E","#D9462E","#D9462E"],
          ["#D9462E","#D9462E","#E08576","#E08576","#E08576","#E08576","#E08576"],
          ["#E08576","#E08576","#E4B53A","#E4B53A","#E4B53A","#9C6080","#9C6080"],
          ["#9C6080","#9C6080","#9C6080","#9C6080","#9C6080","#9C6080","#9C6080"],
        ].map((row,r)=>row.map((c,i)=>{
          const isToday = r===2 && i===4;
          return <div key={`${r}-${i}`} style={{ aspectRatio:"1/1", background:c, boxShadow:isToday?"0 0 0 2px #E4B53A":"none", transform:isToday?"scale(1.06)":"none" }} />;
        }))}
      </div>
    </div>
    <div style={{ marginTop: 14, padding: "12px 14px", background: "linear-gradient(135deg,#4A1226 0%,#2A0A1A 100%)", border: "2px solid #E4B53A" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#E4B53A", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>ACT III · OPUS 22</div>
      <div style={{ fontSize: 22, marginTop: 4, color: "#F2E3CB", fontWeight: 700 }}>Luteal Softness</div>
    </div>
  </div>
);

const TheWatchFace = () => (
  <div style={{ ...PHONE_FRAME, background: "#0A0A0C", color: "#E8E8E0", padding: 18, fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(232,232,224,0.6)", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>· LUTEAL · 22 · 28 ·</div>
    <svg viewBox="0 0 220 220" width="240" height="240" style={{ maxWidth: "92%" }}>
      {/* outer track */}
      <circle cx="110" cy="110" r="98" fill="none" stroke="rgba(232,232,224,0.08)" strokeWidth="2"/>
      {/* 28 tick marks */}
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2 - Math.PI / 2;
        const phase = i < 5 ? "#A83830" : i < 12 ? "#C87A38" : i < 15 ? "#D8A848" : "#7A5572";
        const isToday = i === 21;
        const r1 = isToday ? 90 : 92, r2 = 100;
        return <line key={i} x1={110 + Math.cos(a) * r1} y1={110 + Math.sin(a) * r1} x2={110 + Math.cos(a) * r2} y2={110 + Math.sin(a) * r2} stroke={phase} strokeWidth={isToday ? 4 : 2} strokeLinecap="round"/>;
      })}
      {/* big day number */}
      <text x="110" y="100" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="72" fontWeight="200" fill="#E8E8E0" letterSpacing="-2">22</text>
      <text x="110" y="124" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" letterSpacing="4" fill="rgba(232,232,224,0.55)">LUTEAL</text>
      <text x="110" y="146" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="3" fill="rgba(232,232,224,0.4)">DAY 22 · OF 28</text>
      {/* hand pointing to today */}
      <line x1="110" y1="110" x2={110 + Math.cos((21.5/28)*Math.PI*2 - Math.PI/2) * 78} y2={110 + Math.sin((21.5/28)*Math.PI*2 - Math.PI/2) * 78} stroke="#D8A848" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="110" cy="110" r="4" fill="#D8A848"/>
    </svg>
    <div style={{ marginTop: 14, fontSize: 11, letterSpacing: "0.22em", color: "rgba(232,232,224,0.6)", fontWeight: 600 }}>NEXT · WED 20 · ±3D</div>
  </div>
);

const TheLetter = () => (
  <div style={{ ...PHONE_FRAME, background: "#FAF1DF", color: "#3A2A18", padding: 24, fontFamily: "Georgia, serif", position: "relative" }}>
    <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(58,42,24,0.55)", fontFamily: "'Inter', sans-serif", fontWeight: 600, textAlign: "right" }}>Friday, 15 May</div>
    <div style={{ fontSize: 22, marginTop: 18, fontStyle: "italic" }}>Dear you,</div>
    <div style={{ fontSize: 14, lineHeight: 1.65, marginTop: 12, color: "rgba(58,42,24,0.88)" }}>
      Today is the twenty-second day of your cycle.<br/>
      You are firmly in the <em>luteal half</em>.<br/><br/>
      Four cycles tell me this lasts about another five days. The next one begins Wednesday — or thereabouts.<br/><br/>
      Soften where you can.
    </div>
    <div style={{ marginTop: 22, fontStyle: "italic", fontSize: 16, color: "#7A4A2A" }}>— with love,<br/><span style={{ fontSize: 28, fontFamily: "'Brush Script MT', cursive" }}>FemWell</span></div>
    <div style={{ position: "absolute", bottom: 18, left: 22, right: 22, borderTop: "1px solid rgba(58,42,24,0.25)", paddingTop: 10, fontSize: 10, letterSpacing: "0.22em", color: "rgba(58,42,24,0.5)", fontFamily: "'Inter', sans-serif", fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
      <span>NEXT LETTER</span><span>WED 20 MAY</span>
    </div>
  </div>
);

// ────────────── ROUND 4 — Deep-research traditions (8 concepts) ─────────────
// Pulled from claude-state/design-research/planner-deep-research-2026-05-16.md
// Each maps a real visual-record tradition onto the Cycle tab.

const TomoeDaily = () => (
  <div style={{ ...PHONE_FRAME, background: "#FDF7E8", color: "#2A1F14", padding: 0, fontFamily: "Cardo, Georgia, serif", position: "relative", overflow: "hidden" }}>
    {/* dot grid background */}
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="tomoeDots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="0.7" fill="#C8B89E" fillOpacity="0.55"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tomoeDots)"/>
    </svg>
    {/* thin red rule at top */}
    <div style={{ position: "absolute", left: 14, right: 14, top: 30, height: 1, background: "#B83C2A" }} />
    {/* header */}
    <div style={{ position: "absolute", left: 14, top: 12, right: 14, display: "flex", justifyContent: "space-between", fontFamily: "Cardo, serif", fontSize: 10, color: "#5A4838" }}>
      <span style={{ letterSpacing: "0.04em" }}>Fri 15.05</span>
      <span style={{ letterSpacing: "0.04em" }}>Day 22 · 28</span>
    </div>
    {/* vertical LUTEAL */}
    <div style={{ position: "absolute", left: 8, top: "42%", transform: "rotate(-90deg)", transformOrigin: "left top", fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: "0.4em", color: "rgba(122,85,114,0.85)", fontWeight: 700 }}>章四 · LUTEAL</div>
    {/* big day number */}
    <div style={{ position: "absolute", left: 36, top: 60, fontSize: 100, lineHeight: 1, fontWeight: 200, fontStyle: "italic", color: "#2A1F14", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.06em" }}>22</div>
    {/* annotation box 1 */}
    <div style={{ position: "absolute", left: 40, top: 200, width: 200, padding: "8px 10px", border: "1.2px solid #2A1F14", background: "transparent", transform: "rotate(-0.4deg)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5A4838", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>ACTIVE RHYTHM</div>
      <div style={{ fontSize: 14, fontFamily: "'Caveat', cursive", marginTop: 2 }}>Luteal Softness · 6 rituals</div>
    </div>
    {/* annotation box 2 */}
    <div style={{ position: "absolute", right: 28, top: 260, width: 170, padding: "8px 10px", border: "1.2px solid #2A1F14", transform: "rotate(0.6deg)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5A4838", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>NEXT BLOOM</div>
      <div style={{ fontSize: 14, fontFamily: "'Caveat', cursive", marginTop: 2 }}>Wed 20 V · ±3 days</div>
    </div>
    {/* mini grid annotation */}
    <svg viewBox="0 0 200 30" style={{ position: "absolute", left: 36, top: 330, width: "65%", height: 28 }}>
      {Array.from({ length: 28 }).map((_, i) => (
        <circle key={i} cx={4 + i * 7} cy={15} r={i === 21 ? 3 : 1.4} fill={i < 5 ? "#B83C2A" : i < 12 ? "#C87A4A" : i < 15 ? "#D8A848" : "#7A5572"}/>
      ))}
    </svg>
    {/* footer */}
    <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontFamily: "Cardo, serif", fontStyle: "italic", fontSize: 11, color: "#5A4838" }}>"Soften where you can." — FW</span>
      <span style={{ fontFamily: "Cardo, serif", fontSize: 9, color: "#5A4838" }}>22</span>
    </div>
  </div>
);

const FieldNotebook = () => (
  <div style={{ ...PHONE_FRAME, background: "#F0E9D6", color: "#2A1F14", padding: 0, fontFamily: "Cardo, Georgia, serif", position: "relative" }}>
    {/* engraved double border */}
    <div style={{ position: "absolute", inset: 12, border: "1px solid #3A2F1E", pointerEvents: "none" }} />
    <div style={{ position: "absolute", inset: 16, border: "0.5px solid #3A2F1E", pointerEvents: "none" }} />
    {/* plate header */}
    <div style={{ position: "absolute", top: 24, left: 24, right: 24, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <div style={{ fontSize: 9.5, letterSpacing: "0.3em", fontFamily: "Cardo, serif", fontStyle: "italic", color: "#3A2F1E" }}>Tab. Phasica</div>
      <div style={{ fontSize: 10.5, letterSpacing: "0.3em", fontWeight: 600, fontFamily: "Cardo, serif", color: "#3A2F1E" }}>PL. XXII</div>
    </div>
    {/* central specimen — hellebore in pen-and-ink */}
    <svg viewBox="0 0 200 240" style={{ position: "absolute", top: 56, left: 24, right: 24, width: "calc(100% - 48px)", height: "auto" }}>
      {/* stem */}
      <path d="M100,240 C 102,200 96,160 100,120" fill="none" stroke="#2A1F14" strokeWidth="1.2"/>
      {/* leaves */}
      <path d="M100,180 C 80,170 70,160 60,170 C 70,180 85,185 100,180" fill="rgba(106,74,96,0.18)" stroke="#2A1F14" strokeWidth="0.8"/>
      <path d="M100,160 C 120,150 130,140 140,150 C 130,160 115,165 100,160" fill="rgba(106,74,96,0.18)" stroke="#2A1F14" strokeWidth="0.8"/>
      {/* flower — 5 petals */}
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 100 + Math.cos(rad - Math.PI/2) * 26;
        const cy = 90 + Math.sin(rad - Math.PI/2) * 26;
        return <ellipse key={deg} cx={cx} cy={cy} rx="16" ry="22" transform={`rotate(${deg} ${cx} ${cy})`} fill="rgba(106,74,96,0.32)" stroke="#2A1F14" strokeWidth="0.8"/>;
      })}
      {/* center */}
      <circle cx="100" cy="90" r="9" fill="#6A4A60"/>
      <circle cx="100" cy="90" r="5" fill="#3A2F1E"/>
      {/* hatching lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={88 + i * 3} y1="84" x2={84 + i * 3} y2="96" stroke="#2A1F14" strokeWidth="0.4" opacity="0.5"/>
      ))}
      {/* margin label */}
      <text x="166" y="120" fontFamily="Cardo, serif" fontStyle="italic" fontSize="7" fill="#3A2F1E">a. corolla</text>
      <text x="36" y="178" fontFamily="Cardo, serif" fontStyle="italic" fontSize="7" fill="#3A2F1E">b. folium</text>
    </svg>
    {/* specimen label */}
    <div style={{ position: "absolute", left: 24, right: 24, top: 320, textAlign: "center" }}>
      <div style={{ fontFamily: "Cardo, serif", fontStyle: "italic", fontSize: 16, color: "#2A1F14" }}>Helleborus quietus</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.22em", color: "#3A2F1E", marginTop: 3, fontWeight: 600 }}>LUTEAL · DAY XXII</div>
    </div>
    {/* bottom caption block */}
    <div style={{ position: "absolute", bottom: 28, left: 24, right: 24, borderTop: "0.5px solid #3A2F1E", paddingTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <div style={{ fontFamily: "Cardo, serif", fontStyle: "italic", fontSize: 10, color: "#3A2F1E", lineHeight: 1.4 }}>Phaseus per dies viginti-duos. Periodus proxima die Mercurii.</div>
      <div style={{ fontFamily: "Cardo, serif", fontSize: 10, color: "#2A1F14", lineHeight: 1.4 }}>Day 22 of 28 · luteal half. Next bloom Wed.</div>
    </div>
  </div>
);

const RoseChart = () => (
  <div style={{ ...PHONE_FRAME, background: "#F6EFD8", color: "#1A1410", padding: 0, fontFamily: "'EB Garamond', Georgia, serif", position: "relative" }}>
    {/* header */}
    <div style={{ position: "absolute", top: 14, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontFamily: "'Bodoni Moda', Georgia, serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em" }}>FEMWELL · CHART NO. XXII</div>
      <div style={{ fontSize: 8.5, letterSpacing: "0.25em", color: "#5A4838", fontFamily: "'Inter', sans-serif", fontWeight: 600, marginTop: 2 }}>CASE · SELF · OBS 4 CYCLES</div>
      <div style={{ height: 1, background: "#1A1410", margin: "10px 24px 0" }} />
    </div>
    {/* coxcomb chart */}
    <svg viewBox="0 0 240 240" style={{ position: "absolute", top: 56, left: "50%", transform: "translateX(-50%)", width: 260, height: 260 }}>
      {Array.from({ length: 28 }).map((_, i) => {
        const a1 = (i / 28) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / 28) * Math.PI * 2 - Math.PI / 2;
        const r = 30 + (i % 7) * 8 + (i < 5 ? 16 : i < 12 ? 8 : i < 15 ? 22 : 12);
        const x1 = 120 + Math.cos(a1) * r; const y1 = 120 + Math.sin(a1) * r;
        const x2 = 120 + Math.cos(a2) * r; const y2 = 120 + Math.sin(a2) * r;
        const phase = i < 5 ? "#B23A2A" : i < 12 ? "#A0BEB8" : i < 15 ? "#E0B848" : "#5A3F58";
        const isToday = i === 21;
        return <path key={i} d={`M120,120 L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`} fill={phase} fillOpacity="0.8" stroke={isToday ? "#1A1410" : "#F6EFD8"} strokeWidth={isToday ? 2.5 : 0.5}/>;
      })}
      <circle cx="120" cy="120" r="28" fill="#F6EFD8"/>
      <circle cx="120" cy="120" r="28" fill="none" stroke="#1A1410" strokeWidth="0.5"/>
      <text x="120" y="118" textAnchor="middle" fontFamily="'Bodoni Moda', Georgia, serif" fontSize="32" fontWeight="700" fill="#1A1410">22</text>
      <text x="120" y="134" textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize="7" letterSpacing="2.5" fill="#5A4838" fontWeight="600">SECRET · IV</text>
    </svg>
    {/* BBT strip */}
    <div style={{ position: "absolute", bottom: 72, left: 24, right: 24 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "#5A4838", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>BBT · °C</div>
      <svg viewBox="0 0 280 50" style={{ width: "100%", height: 46, marginTop: 4 }}>
        <line x1="14" y1="2" x2="14" y2="48" stroke="#3A2F1E" strokeWidth="0.6"/>
        <line x1="14" y1="48" x2="280" y2="48" stroke="#3A2F1E" strokeWidth="0.6"/>
        <text x="2" y="6" fontSize="6" fill="#3A2F1E">37.0</text>
        <text x="2" y="48" fontSize="6" fill="#3A2F1E">36.2</text>
        {/* the coverline */}
        <line x1="120" y1="28" x2="280" y2="28" stroke="#B23A2A" strokeWidth="0.6" strokeDasharray="2 2"/>
        {/* plotted dots */}
        {Array.from({ length: 22 }).map((_, i) => {
          const x = 18 + i * 11;
          const y = i < 14 ? 42 - Math.sin(i * 0.5) * 3 : 22 - Math.sin(i * 0.4) * 2;
          return <circle key={i} cx={x} cy={y} r="1.4" fill="#1A1410"/>;
        })}
      </svg>
    </div>
    {/* sign-off */}
    <div style={{ position: "absolute", bottom: 18, left: 24, right: 24, borderTop: "0.5px solid #3A2F1E", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 10, fontStyle: "italic", color: "#5A4838" }}>
      <span>Attending: F. W. Nightingale</span><span>15 V '26</span>
    </div>
  </div>
);

const CameraReport = () => (
  <div style={{ ...PHONE_FRAME, background: "#F8F0C8", color: "#1A1410", padding: 12, fontFamily: "'IBM Plex Mono', monospace", position: "relative" }}>
    {/* 4-cell header */}
    <div style={{ border: "1.5px solid #1A1410", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div style={{ padding: "8px 10px", borderRight: "1px solid #1A1410", borderBottom: "1px solid #1A1410" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", fontWeight: 700, color: "#5A4838" }}>PRODUCTION</div>
        <div style={{ fontSize: 12, marginTop: 2, fontWeight: 500 }}>FEMWELL</div>
      </div>
      <div style={{ padding: "8px 10px", borderBottom: "1px solid #1A1410" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", fontWeight: 700, color: "#5A4838" }}>ROLL · TAKE</div>
        <div style={{ fontSize: 12, marginTop: 2, fontWeight: 500 }}>04 · 22</div>
      </div>
      <div style={{ padding: "8px 10px", borderRight: "1px solid #1A1410" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", fontWeight: 700, color: "#5A4838" }}>PHASE</div>
        <div style={{ fontSize: 12, marginTop: 2, fontWeight: 500 }}>LUTEAL</div>
      </div>
      <div style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", fontWeight: 700, color: "#5A4838" }}>CONF · OBS</div>
        <div style={{ fontSize: 12, marginTop: 2, fontWeight: 500 }}>84% · 04</div>
      </div>
    </div>
    {/* cycle table */}
    <div style={{ marginTop: 10, border: "1.5px solid #1A1410" }}>
      <div style={{ background: "#1A1410", color: "#F8F0C8", padding: "4px 8px", fontSize: 8, letterSpacing: "0.2em", fontWeight: 700 }}>CYCLE · 28D · M/F/O/L</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
        {Array.from({ length: 28 }).map((_, i) => {
          const phase = i < 5 ? { c: "#B83C2A", code: "M" } : i < 12 ? { c: "#D88E4A", code: "F" } : i < 15 ? { c: "#E2C76C", code: "O" } : { c: "#7A5572", code: "L" };
          const isToday = i === 21;
          return (
            <div key={i} style={{ aspectRatio: "1/1", borderRight: (i % 7 < 6) ? "0.5px solid #1A1410" : "none", borderBottom: i < 21 ? "0.5px solid #1A1410" : "none", padding: 3, position: "relative", outline: isToday ? "3px solid #1A1410" : "none", outlineOffset: -1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, position: "absolute", top: 2, left: 3 }}>{i + 1}</div>
              <div style={{ position: "absolute", bottom: 3, right: 3, width: 14, height: 10, background: phase.c, display: "flex", alignItems: "center", justifyContent: "center", color: "#1A1410", fontSize: 7, fontWeight: 800 }}>{phase.code}</div>
              {isToday && <div style={{ position: "absolute", top: -3, right: -32, fontFamily: "'Caveat', cursive", fontSize: 11, color: "#B83C2A", whiteSpace: "nowrap", transform: "rotate(-4deg)" }}>← today</div>}
            </div>
          );
        })}
      </div>
    </div>
    {/* scene notes block */}
    <div style={{ marginTop: 10, border: "1.5px solid #1A1410", display: "grid", gridTemplateColumns: "1.4fr 1fr" }}>
      <div style={{ padding: "6px 8px", borderRight: "1px solid #1A1410" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", fontWeight: 700, color: "#5A4838" }}>SCENES · TODAY</div>
        <div style={{ fontSize: 9.5, marginTop: 4, lineHeight: 1.6 }}>01. WARM GRAINS<br/>02. SLOW WALK<br/>03. SECOND TEA</div>
      </div>
      <div style={{ padding: "6px 8px" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", fontWeight: 700, color: "#5A4838" }}>PICKUP</div>
        <div style={{ fontSize: 9.5, marginTop: 4, lineHeight: 1.6 }}>WED 20 V 26<br/>±3D WINDOW</div>
      </div>
    </div>
    {/* sign-off */}
    <div style={{ marginTop: 8, fontFamily: "'Caveat', cursive", fontSize: 13, color: "#1A1410", display: "flex", justifyContent: "space-between" }}>
      <span>by: F. Well, DIT</span><span>15 V '26</span>
    </div>
  </div>
);

const FlightDeck = () => {
  const Gauge = ({ label, value, sub, arc }) => (
    <div style={{ background: "#1A1A1A", border: "2px solid #3A3A3A", borderRadius: "50%", aspectRatio: "1/1", padding: 8, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {arc && <path d={arc} fill="none" stroke="#3FB85A" strokeWidth="3"/>}
      </svg>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, letterSpacing: "0.2em", color: "#7AE89F", fontWeight: 700, position: "absolute", top: 10 }}>{label}</div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, color: "#F8F8F8", fontWeight: 500, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#7AE89F", letterSpacing: "0.1em", marginTop: 1 }}>{sub}</div>}
    </div>
  );
  return (
    <div style={{ ...PHONE_FRAME, background: "#0A0A0A", color: "#7AE89F", padding: 14, fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* bezel header */}
      <div style={{ border: "1.5px solid #3A3A3A", borderRadius: 4, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0A0A0A" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#FFB840", fontWeight: 700 }}>FW · CYCLE 4 · OPS NORMAL</div>
        <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid #FFB840", position: "relative" }}>
          <div style={{ position: "absolute", inset: 2, background: "linear-gradient(0deg,#3FB85A 50%,#0A0A0A 50%)", borderRadius: "50%" }}/>
        </div>
      </div>
      {/* gauge grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
        <Gauge label="DAY" value="22" sub="/ 28" arc="M 20,80 A 40,40 0 0,1 80,80"/>
        <Gauge label="PHASE" value="LU" sub="LUTEAL" arc="M 50,12 A 38,38 0 0,1 84,52"/>
        <Gauge label="CONF" value="84" sub="%" arc="M 16,75 A 40,40 0 1,1 88,72"/>
        <Gauge label="ETA" value="5" sub="DAYS" arc="M 22,84 A 40,40 0 0,1 78,84"/>
        <Gauge label="STREAK" value="67" sub="%" arc="M 18,80 A 40,40 0 0,1 70,30"/>
        <Gauge label="CYCLES" value="04" sub="OBS" arc="M 24,86 A 40,40 0 0,1 50,12"/>
      </div>
      {/* HUD readout strip */}
      <div style={{ marginTop: 14, border: "1.5px solid #3FB85A", padding: "8px 10px", background: "#0A0A0A" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.22em", color: "#7AE89F", fontWeight: 700 }}>RHYTHM</div>
        <div style={{ fontSize: 11, color: "#FFB840", marginTop: 2, letterSpacing: "0.08em" }}>LUTEAL SOFTNESS · 6/9 STEPS</div>
        <div style={{ fontSize: 10, color: "#7AE89F", marginTop: 2 }}>NEXT BLOOM: 20 V 26 ±3D</div>
      </div>
      {/* warning lamps */}
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
        {[{ l: "PMS", c: "#FFB840" }, { l: "SLEEP", c: "#3FB85A" }, { l: "HYDRA", c: "#3FB85A" }, { l: "MOOD", c: "#FFB840" }].map((x) => (
          <div key={x.l} style={{ border: "1px solid #3A3A3A", background: "#0A0A0A", padding: "4px 0", textAlign: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: x.c, margin: "0 auto", boxShadow: `0 0 6px ${x.c}` }}/>
            <div style={{ fontSize: 8, letterSpacing: "0.22em", color: x.c, fontWeight: 700, marginTop: 3 }}>{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FridasDiary = () => (
  <div style={{ ...PHONE_FRAME, background: "#FAF0E2", color: "#2A1A14", padding: 0, fontFamily: "Caveat, Georgia, cursive", position: "relative", overflow: "hidden" }}>
    {/* hand-torn top edge */}
    <svg viewBox="0 0 360 12" style={{ position: "absolute", top: 0, left: 0, right: 0, width: "100%", height: 12 }}>
      <path d="M 0,0 L 0,8 L 18,4 L 32,9 L 56,3 L 88,8 L 112,5 L 144,9 L 176,3 L 208,8 L 240,4 L 272,9 L 304,3 L 336,8 L 360,4 L 360,0 Z" fill="#3A2C1A"/>
    </svg>
    {/* date scrawled */}
    <div style={{ position: "absolute", top: 26, left: 20, fontFamily: "Caveat, cursive", fontSize: 18, color: "#5A1820", fontStyle: "italic", transform: "rotate(-2deg)" }}>viernes 15 mayo · día XXII</div>
    {/* watercolor wash hero */}
    <svg viewBox="0 0 360 220" style={{ position: "absolute", top: 70, left: 0, right: 0, width: "100%", height: 220 }}>
      <defs>
        <filter id="rough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3"/>
          <feDisplacementMap in="SourceGraphic" scale="6"/>
        </filter>
        <radialGradient id="lutealWash" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#7A4060" stopOpacity="0.7"/>
          <stop offset="60%" stopColor="#A82A28" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#7A4060" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="lutealWash2" cx="62%" cy="55%">
          <stop offset="0%" stopColor="#D86A4A" stopOpacity="0.42"/>
          <stop offset="100%" stopColor="#D86A4A" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="100" rx="170" ry="110" fill="url(#lutealWash)" filter="url(#rough)"/>
      <ellipse cx="200" cy="120" rx="80" ry="60" fill="url(#lutealWash2)" filter="url(#rough)"/>
      {/* hand-painted 22 */}
      <text x="180" y="138" textAnchor="middle" fontFamily="'Petit Formal Script', 'Caveat', cursive" fontSize="118" fill="#5A1820" fillOpacity="0.85" style={{ paintOrder: "stroke", stroke: "#5A1820", strokeWidth: "1.2", letterSpacing: "-4px" }}>22</text>
      {/* scribbled note */}
      <text x="40" y="200" fontFamily="Caveat, cursive" fontSize="14" fill="#2A1A14" fontStyle="italic" transform="rotate(-3 40 200)">la mitad luteal — hay tiempo de hablar conmigo</text>
    </svg>
    {/* brush-stroke calendar */}
    <div style={{ position: "absolute", bottom: 116, left: 22, right: 22 }}>
      <div style={{ fontFamily: "Caveat, cursive", fontSize: 12, color: "#5A4830", marginBottom: 4 }}>los días</div>
      <svg viewBox="0 0 360 60" style={{ width: "100%", height: 52 }}>
        {Array.from({ length: 28 }).map((_, i) => {
          const phase = i < 5 ? "#A82A28" : i < 12 ? "#D86A4A" : i < 15 ? "#E2A848" : "#7A4060";
          const isToday = i === 21;
          const x = 6 + i * 12.5; const y = 18 + (i % 2) * 2;
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="5" ry="6.5" fill={phase} fillOpacity={isToday ? 0.95 : 0.62} transform={`rotate(${(i * 7) % 30 - 15} ${x} ${y})`}/>
              {isToday && <circle cx={x} cy={y} r="9" fill="none" stroke="#5A1820" strokeWidth="1.4"/>}
            </g>
          );
        })}
      </svg>
    </div>
    {/* prose */}
    <div style={{ position: "absolute", bottom: 30, left: 22, right: 22, fontFamily: "Caveat, cursive", fontSize: 14.5, color: "#2A1A14", lineHeight: 1.45, fontStyle: "italic" }}>
      Cuatro ciclos. Confianza ochenta-cuatro.<br/>La próxima sangre llega miércoles, quizá.
    </div>
    {/* signature */}
    <div style={{ position: "absolute", bottom: 8, right: 18, fontFamily: "'Petit Formal Script', cursive", fontSize: 14, color: "#5A1820", fontStyle: "italic" }}>— F.W.</div>
  </div>
);

const Mnemosyne = () => (
  <div style={{ ...PHONE_FRAME, background: "#F8F5EE", color: "#1F1A12", padding: 0, fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>
    {/* 5mm grid */}
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="mnemoGrid" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke="#A89880" strokeOpacity="0.22" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mnemoGrid)"/>
    </svg>
    {/* red rule */}
    <div style={{ position: "absolute", left: 18, right: 18, top: 34, height: 2, background: "#B83C2A" }} />
    {/* date above rule */}
    <div style={{ position: "absolute", top: 18, left: 18, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#1F1A12" }}>15 V '26</div>
    <div style={{ position: "absolute", top: 18, right: 18, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "#1F1A12", letterSpacing: "0.1em" }}>N° 22</div>
    {/* day numeral */}
    <div style={{ position: "absolute", top: 56, left: 18, fontWeight: 200, fontSize: 96, color: "#1F1A12", lineHeight: 1 }}>22</div>
    {/* phase label */}
    <div style={{ position: "absolute", top: 168, left: 18, fontSize: 10.5, letterSpacing: "0.32em", fontWeight: 600, color: "#5A4838" }}>LUTEAL · DAY 22 OF 28</div>
    {/* calendar — hairline phase borders */}
    <div style={{ position: "absolute", top: 196, left: 18, right: 18, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 0 }}>
      {Array.from({ length: 28 }).map((_, i) => {
        const phase = i < 5 ? "#B83C2A" : i < 12 ? "#C87A4A" : i < 15 ? "#D8A848" : "#7A5572";
        const isToday = i === 21;
        return (
          <div key={i} style={{ aspectRatio: "1/1", border: `1px solid ${phase}`, position: "relative", margin: -0.5 }}>
            <div style={{ position: "absolute", top: 2, left: 3, fontSize: 8, color: "#5A4838" }}>{i + 1}</div>
            {isToday && <div style={{ position: "absolute", top: "50%", left: "50%", width: 5, height: 5, background: "#B83C2A", borderRadius: "50%", transform: "translate(-50%,-50%)" }}/>}
          </div>
        );
      })}
    </div>
    {/* rituals */}
    <div style={{ position: "absolute", bottom: 28, left: 18, right: 18, fontSize: 13, color: "#1F1A12", lineHeight: 1.9 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>· warm grains</span><span style={{ color: "#5A4838" }}>20 min</span></div>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>· slow walk</span><span style={{ color: "#5A4838" }}>dusk</span></div>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span>· second tea</span><span style={{ color: "#5A4838" }}>4 min</span></div>
    </div>
    {/* tiny page no */}
    <div style={{ position: "absolute", bottom: 6, right: 18, fontFamily: "Cardo, Georgia, serif", fontStyle: "italic", fontSize: 9, color: "#5A4838" }}>— xxii —</div>
  </div>
);

const BookOfHours = () => (
  <div style={{ ...PHONE_FRAME, background: "#F2E6C8", color: "#1A140A", padding: 0, fontFamily: "Cardo, 'EB Garamond', Georgia, serif", position: "relative", overflow: "hidden" }}>
    {/* top border — bas-de-page motif */}
    <svg viewBox="0 0 360 30" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 30 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i} transform={`translate(${20 + i * 42},14)`}>
          <circle cx="0" cy="0" r="4" fill="none" stroke="#C2342C" strokeWidth="0.8"/>
          <path d="M -8,0 Q -4,-6 0,0 Q 4,6 8,0" fill="none" stroke="#2A3A8A" strokeWidth="0.8"/>
          <circle cx="-12" cy="0" r="1.5" fill="#C2342C"/>
          <circle cx="12" cy="0" r="1.5" fill="#C2342C"/>
        </g>
      ))}
    </svg>
    {/* KL monogram */}
    <div style={{ position: "absolute", top: 38, left: 18, fontFamily: "'UnifrakturMaguntia', 'Cloister Black', Georgia, serif", fontWeight: 700, fontSize: 38, color: "#D8A848", lineHeight: 1, textShadow: "0 0 2px rgba(154,112,40,0.6)", letterSpacing: "-0.03em" }}>KL</div>
    {/* Roman date */}
    <div style={{ position: "absolute", top: 38, right: 18, textAlign: "right" }}>
      <div style={{ fontFamily: "Cardo, serif", fontStyle: "italic", fontSize: 12, color: "#C2342C", letterSpacing: "0.04em" }}>Idibus Maiis</div>
      <div style={{ fontFamily: "Cardo, serif", fontSize: 9, color: "#5A4838", marginTop: 2, letterSpacing: "0.2em" }}>15 MAY</div>
    </div>
    {/* drop capital + body */}
    <div style={{ position: "absolute", top: 96, left: 18, right: 18 }}>
      <div style={{ float: "left", marginRight: 8, marginTop: -2, fontFamily: "'UnifrakturMaguntia', 'Cloister Black', Georgia, serif", fontSize: 64, color: "#D8A848", lineHeight: 0.95, textShadow: "0 0 1px rgba(154,112,40,0.8)", border: "1.5px solid #2A3A8A", padding: "0 8px 2px", background: "rgba(216,168,72,0.08)" }}>L</div>
      <div style={{ fontFamily: "Cardo, serif", fontSize: 11.5, lineHeight: 1.5, color: "#1A140A" }}>
        <span style={{ fontStyle: "italic", color: "#C2342C", fontWeight: 600 }}>ad Lutealem</span> — die XXII de XXVIII, in dimidio luteali. Quattuor circuli observati. Confidentia LXXXIV.
      </div>
    </div>
    <div style={{ position: "absolute", top: 196, left: 18, right: 18, fontFamily: "Cardo, serif", fontSize: 11.5, lineHeight: 1.5, color: "#1A140A" }}>
      <span style={{ fontStyle: "italic", color: "#C2342C", fontWeight: 600 }}>of Luteal</span> — day twenty-two of twenty-eight, in the luteal half. Four cycles observed. Confidence eighty-four.
    </div>
    {/* illuminated calendar miniature */}
    <div style={{ position: "absolute", bottom: 70, left: 18, right: 18, border: "2px solid #D8A848", padding: 4, background: "rgba(216,168,72,0.06)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1.5 }}>
        {Array.from({ length: 28 }).map((_, i) => {
          const phase = i < 5 ? "#C2342C" : i < 12 ? "#E8B040" : i < 15 ? "#D8A848" : "#2A3A8A";
          const isToday = i === 21;
          return (
            <div key={i} style={{ aspectRatio: "1/1", background: phase, opacity: 0.85, position: "relative" }}>
              {isToday && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", fontSize: 12, color: "#C2342C" }}>☞</div>}
            </div>
          );
        })}
      </div>
    </div>
    {/* bottom border + ribbon */}
    <svg viewBox="0 0 360 30" style={{ position: "absolute", bottom: 6, left: 0, width: "100%", height: 30 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i} transform={`translate(${20 + i * 42},14)`}>
          <path d="M -8,0 Q -4,6 0,0 Q 4,-6 8,0" fill="none" stroke="#2A3A8A" strokeWidth="0.8"/>
          <circle cx="0" cy="0" r="3" fill="#D8A848" stroke="#9A7028" strokeWidth="0.6"/>
        </g>
      ))}
    </svg>
    <div style={{ position: "absolute", right: 10, top: 0, width: 8, background: "#C2342C", height: "92%", borderBottomLeftRadius: 2 }}/>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const CONCEPTS = [
  // Round 1 — color systems
  { round: 1, name: "Apothecary No. 09", desc: "Aubergine + brass. Byredo × Aesop × intellectual alchemy.", Comp: Apothecary },
  { round: 1, name: "Le Menu",           desc: "Cream paper + espresso. Noma tasting menu × A24 editorial.", Comp: LeMenu },
  { round: 1, name: "Atelier Plain",     desc: "Near-white + graphite. Muji × Margiela × Swiss museum.",      Comp: AtelierPlain },
  { round: 1, name: "Aurora Field",      desc: "Deep navy + coral. Mercury Weather × Hades underworld.",       Comp: AuroraField },
  { round: 1, name: "Maison Rouge",      desc: "Warm cream + theatrical wine. Co-Star × Margiela Tabis.",      Comp: MaisonRouge },
  // Round 2 — editorial variants
  { round: 2, name: "The Almanac",       desc: "Old farmer's almanac. Italic prose + double rules.",           Comp: TheAlmanac },
  { round: 2, name: "Maison Noire",      desc: "Black-tie luteal. Opera programme × evening atelier.",         Comp: MaisonNoire },
  { round: 2, name: "The Ceremony",      desc: "Invitation card. You are invited to the luteal half.",          Comp: TheCeremony },
  { round: 2, name: "The Sunday Paper",  desc: "Broadsheet newspaper. Headline + 2-col leader column.",         Comp: SundayPaper },
  { round: 2, name: "FW Cycle Press",    desc: "Magazine masthead. Issue 22, feature article, side stats.",     Comp: FWCyclePress },
  // Round 3 — structural objects
  { round: 3, name: "The Wheel",         desc: "Circular cycle. 28 sectors, today on the arc.",                 Comp: TheWheel },
  { round: 3, name: "The Weather Forecast", desc: "Sun on horizon. 5-day strip with phase weather stripes.",     Comp: TheWeatherForecast },
  { round: 3, name: "The Interior",      desc: "Ornate cabinet. Gilded room with month grid + opus card.",      Comp: TheInterior },
  { round: 3, name: "The Watch Face",    desc: "Analog dial. 28 ticks, gold hand pointing to today.",            Comp: TheWatchFace },
  { round: 3, name: "The Letter",        desc: "Handwritten letter from FemWell. Dear you, today is day 22.",   Comp: TheLetter },
  // Round 4 — deep-research traditions
  { round: 4, name: "Tomoe Daily",       desc: "Hobonichi Techo. Tomoe River cream + 3.7mm dot grid + red rule. Daily quote footer.", Comp: TomoeDaily },
  { round: 4, name: "The Field Notebook", desc: "Haeckel + Merian. Engraved plate XXII with hand-drawn hellebore as today's phase.", Comp: FieldNotebook },
  { round: 4, name: "The Rose Chart",    desc: "Nightingale coxcomb + BBT strip. Clinical authority for the cycle.",                  Comp: RoseChart },
  { round: 4, name: "The Camera Report", desc: "ARRI camera sheet. Carbon-yellow paper, IBM Plex Mono, cycle as production roll.",     Comp: CameraReport },
  { round: 4, name: "The Flight Deck",   desc: "Cessna six-pack + amber CRT. At-a-glance gauges. RHYTHM in HUD.",                       Comp: FlightDeck },
  { round: 4, name: "Frida's Diary",     desc: "Kahlo 1944. Watercolor wash, painted '22', Spanish handwriting, brush-stroke calendar.", Comp: FridasDiary },
  { round: 4, name: "Mnemosyne",         desc: "Maruman + Midori MD. Pure 5mm grid, single red rule, generous emptiness.",              Comp: Mnemosyne },
  { round: 4, name: "Book of Hours",     desc: "Très Riches Heures. KL monogram, gold drop capital, vermilion rubrics, two-column Latin/English.", Comp: BookOfHours },
];

export default function Ideas() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F1", paddingBottom: 120 }}>
      {/* Dev banner */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#3A2C1A", color: "#F4EDDB",
        padding: "10px 16px", textAlign: "center",
        fontFamily: "'Inter', sans-serif", fontSize: 11,
        letterSpacing: "0.18em", fontWeight: 700, textTransform: "uppercase",
        borderBottom: "1px solid rgba(244,237,219,0.2)",
      }}>
        Design Lab · Dev Only · Not for production
      </div>

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "24px 16px 0" }}>
        <h1 style={{
          fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 600,
          color: "#3A2C1A", letterSpacing: "-0.02em", margin: 0,
        }}>15 Cycle-tab ideas</h1>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(58,44,26,0.7)",
          marginTop: 6, lineHeight: 1.5,
        }}>
          Three rounds × five concepts. Tap <em>Pick this one</em> on the one that lands —
          then tell Dispatch the name and I'll roll it across MonthRibbon, the Cycle cards,
          and Planner typography. None of these are wired yet.
        </p>
        <button
          onClick={() => setShowHelp(v => !v)}
          style={{
            marginTop: 10, padding: "6px 12px",
            background: "transparent", color: "rgba(58,44,26,0.7)",
            border: "1px solid rgba(58,44,26,0.3)", borderRadius: 9999,
            fontFamily: "'Inter', sans-serif", fontSize: 11,
            letterSpacing: "0.12em", cursor: "pointer", fontWeight: 600,
          }}
        >
          {showHelp ? "Hide help" : "How does picking work?"}
        </button>
        {showHelp && (
          <div style={{
            marginTop: 10, padding: 12, background: "rgba(244,237,219,0.7)",
            borderRadius: 8, fontSize: 12, fontFamily: "'Inter', sans-serif",
            color: "rgba(58,44,26,0.8)", lineHeight: 1.5,
          }}>
            Picking shows a confirmation. Nothing is applied automatically — Dispatch
            (Claude) does the sweep by hand so you can review each surface. You can also
            say <em>"mix Le Menu + Atelier Plain"</em> and Dispatch will combine them.
          </div>
        )}
      </div>

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "0 16px" }}>
        {[1, 2, 3, 4].map((round) => (
          <div key={round}>
            <div style={ROUND_HEADER}>
              Round {round} ·{" "}
              {round === 1 ? "Color systems"
                : round === 2 ? "Editorial variants"
                : round === 3 ? "Structural objects"
                : "Deep-research traditions"}
            </div>
            {CONCEPTS.filter(c => c.round === round).map(({ name, desc, Comp }) => (
              <div key={name} style={CARD}>
                <Comp />
                <div style={{
                  marginTop: 14, fontFamily: "Georgia, serif",
                  fontSize: 20, fontWeight: 600, color: "#3A2C1A",
                  letterSpacing: "-0.01em",
                }}>{name}</div>
                <div style={{
                  marginTop: 4, fontFamily: "'Inter', sans-serif",
                  fontSize: 13, color: "rgba(58,44,26,0.65)", lineHeight: 1.45,
                }}>{desc}</div>
                <button onClick={pick(name)} style={PICK_BTN}>
                  Pick this one →
                </button>
              </div>
            ))}
          </div>
        ))}

        <div style={{
          marginTop: 36, padding: 18, background: "#3A2C1A",
          color: "#F4EDDB", borderRadius: 12, textAlign: "center",
          fontFamily: "Georgia, serif",
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", fontWeight: 700, color: "rgba(244,237,219,0.7)" }}>
            Or mix two
          </div>
          <div style={{ marginTop: 6, fontSize: 18, fontStyle: "italic" }}>
            "Le Menu + sun-on-horizon"<br/>
            "Atelier Plain + The Letter copy"
          </div>
          <div style={{ marginTop: 10, fontSize: 12, fontFamily: "'Inter', sans-serif", color: "rgba(244,237,219,0.7)" }}>
            Tell Dispatch in your next message and the sweep starts.
          </div>
        </div>
      </div>
    </div>
  );
}

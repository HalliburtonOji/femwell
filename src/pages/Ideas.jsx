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
        {[1, 2, 3].map((round) => (
          <div key={round}>
            <div style={ROUND_HEADER}>
              Round {round} ·{" "}
              {round === 1 ? "Color systems" : round === 2 ? "Editorial variants" : "Structural objects"}
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

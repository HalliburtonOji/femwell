import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DesignLab — five distinct visual concepts for the Planner Cycle tab.
// Each one pulls design DNA from a different reference world per Halli's
// brief (2026-05-15). Not named after colours; each could exist as its
// own brand.
//
//   1. Apothecary No. 09  — Aesop × Co-Star × old apothecary labels
//   2. Le Menu             — Noma menu × Aesop print × A24 editorial
//   3. Atelier Plain       — Byredo × Maison Margiela Replica × Muji
//   4. Aurora Field        — Mercury Weather × Monument Valley × Tidal HiFi
//   5. Maison Rouge        — Hades game UI × Brutalist gallery × A24 poster
//
// Each concept renders the same four anchor surfaces — title block, month
// ribbon, current rhythm card, week ahead — using a fully different
// typographic + colour + spatial system. Mock data is identical across the
// five so the only difference is visual treatment.
// ─────────────────────────────────────────────────────────────────────────────

// Shared mock data — Friday 15 May, day 22 of 28, luteal, 84% conf, etc.
const MOCK = {
  todayLabel: "Friday 15 May",
  cycleDay: 22,
  cycleLength: 28,
  phase: "Luteal",
  confidencePct: 84,
  cyclesObserved: 4,
  nextPeriod: "Wed 20 May",
  etaWindowDays: 3,
  weekHabitPct: 67,
  activeRhythm: "Luteal Softness",
  activeRhythmCount: "6 rituals",
  ahead: [
    { day: "SAT", num: 16, phase: "luteal" },
    { day: "SUN", num: 17, phase: "luteal" },
    { day: "MON", num: 18, phase: "luteal" },
    { day: "TUE", num: 19, phase: "luteal" },
    { day: "WED", num: 20, phase: "menstrual" },
  ],
  // 5 weeks × 7 day phase markers used by every concept's month ribbon.
  monthGrid: [
    ["off","off","off","off","menstrual","menstrual","menstrual"],
    ["menstrual","menstrual","follicular","follicular","follicular","follicular","follicular"],
    ["follicular","follicular","ovulatory","ovulatory","ovulatory","luteal","luteal"],
    ["luteal","luteal","luteal","luteal","luteal","luteal","luteal"],
    ["luteal","luteal","luteal","menstrual","menstrual","off","off"],
  ],
  monthGridNums: [
    [27,28,29,30,1,2,3],
    [4,5,6,7,8,9,10],
    [11,12,13,14,15,16,17],     // today = 15 (index 4 of week 3)
    [18,19,20,21,22,23,24],
    [25,26,27,28,29,30,31],
  ],
  todayCell: { week: 2, day: 4 },
};

const CONCEPTS = [
  { id: "apothecary", label: "Apothecary No. 09",  ref: "Aesop × Co-Star" },
  { id: "menu",       label: "Le Menu",            ref: "Noma × A24 editorial" },
  { id: "atelier",    label: "Atelier Plain",      ref: "Byredo × Muji" },
  { id: "aurora",     label: "Aurora Field",       ref: "Mercury Weather × Monument Valley" },
  { id: "rouge",      label: "Maison Rouge",       ref: "Hades × Brutalist gallery" },
];

export default function DesignLab() {
  const [active, setActive] = useState("apothecary");
  return (
    <div style={pageWrapStyle}>
      <header style={pageHeadStyle}>
        <p style={pageEyebrowStyle}>FemWell · design lab</p>
        <h1 style={pageTitleStyle}>Five Cycle-tab concepts</h1>
        <p style={pageSubStyle}>
          Five distinct visual languages for the same Planner Cycle data. Each pulls design DNA from a different world. Pick whichever one feels most like FemWell.
        </p>
        <div style={tabsRowStyle} role="tablist">
          {CONCEPTS.map(c => (
            <button
              key={c.id}
              role="tab"
              aria-selected={active === c.id}
              onClick={() => setActive(c.id)}
              style={{
                ...tabBtnStyle,
                background: active === c.id ? "var(--plum, #4A2A3A)" : "transparent",
                color:      active === c.id ? "var(--cream, #FFFAF5)" : "var(--plum, #4A2A3A)",
                borderColor: active === c.id ? "var(--plum, #4A2A3A)" : "rgba(74,42,58,0.18)",
              }}
            >
              <span style={tabLabelStyle}>{c.label}</span>
              <span style={tabRefStyle}>{c.ref}</span>
            </button>
          ))}
        </div>
      </header>

      <main style={stageStyle}>
        {active === "apothecary" && <ConceptApothecary />}
        {active === "menu"       && <ConceptMenu />}
        {active === "atelier"    && <ConceptAtelier />}
        {active === "aurora"     && <ConceptAurora />}
        {active === "rouge"      && <ConceptRouge />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 1 · APOTHECARY No. 09
// Aesop × Co-Star × old apothecary labels.
// Deep aubergine ground, brass accents, serif numerals, very small caps. The
// month becomes a tincture chart; each phase a measured pour. Intellectual,
// alchemical, restrained, quietly expensive.
// ─────────────────────────────────────────────────────────────────────────────
function ConceptApothecary() {
  const palette = {
    bg:     "#1F1320",
    surface:"#291823",
    cream:  "#F0E0CB",
    text:   "#E2CFB6",
    mute:   "#9D8772",
    brass:  "#C9A55F",
    period: "#D86A5A",
    foll:   "#D58F76",
    ov:     "#E6B68A",
    lut:    "#A77584",
    off:    "#3B2632",
  };
  const phaseHex = { menstrual: palette.period, follicular: palette.foll, ovulatory: palette.ov, luteal: palette.lut, off: palette.off };

  return (
    <div style={{ background: palette.bg, padding: "32px 22px 56px", borderRadius: 24, color: palette.text, fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Header — labelled tincture jar */}
      <div style={{ borderTop: `1px solid ${palette.brass}55`, borderBottom: `1px solid ${palette.brass}55`, padding: "18px 0 16px", marginBottom: 22 }}>
        <p style={{ fontSize: 9.5, letterSpacing: "0.35em", textTransform: "uppercase", color: palette.brass, margin: 0, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
          Apothecary · Vol. IX
        </p>
        <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 38, color: palette.cream, margin: "10px 0 2px", letterSpacing: "0.005em", lineHeight: 1 }}>
          The Luteal Tincture
        </h2>
        <div style={{ display: "flex", gap: 14, alignItems: "baseline", marginTop: 10 }}>
          <span style={{ fontSize: 10.5, letterSpacing: "0.3em", textTransform: "uppercase", color: palette.mute, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{MOCK.todayLabel}</span>
          <span style={{ fontSize: 10.5, letterSpacing: "0.3em", textTransform: "uppercase", color: palette.brass, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>· Day {MOCK.cycleDay} / {MOCK.cycleLength}</span>
        </div>
        <p style={{ fontSize: 13, fontStyle: "italic", color: palette.text, lineHeight: 1.6, margin: "16px 0 0", maxWidth: 520 }}>
          Composed of: warmth · slowness · inward attention · grounded foods · early evenings. To be taken as needed, with permission.
        </p>
      </div>

      {/* Cycle "tincture chart" — constellation row */}
      <SectionLabel theme="apothecary" palette={palette} num="01" title="Month · constellation" />
      <div style={{ position: "relative", margin: "10px 0 28px", padding: "26px 8px", background: palette.surface, borderRadius: 6, border: `1px solid ${palette.brass}33` }}>
        {MOCK.monthGrid.map((week, wi) => (
          <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: wi === 4 ? 0 : 6, position: "relative" }}>
            {week.map((p, di) => {
              const isToday = wi === MOCK.todayCell.week && di === MOCK.todayCell.day;
              const isOff = p === "off";
              return (
                <div key={di} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", padding: "6px 0" }}>
                  <span style={{ width: isToday ? 14 : 8, height: isToday ? 14 : 8, borderRadius: 9999, background: phaseHex[p] || palette.off, boxShadow: isToday ? `0 0 0 3px ${palette.brass}88, 0 0 16px ${palette.brass}66` : `0 0 6px ${phaseHex[p]}66`, opacity: isOff ? 0.35 : 1 }} />
                  <span style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 10.5, color: isOff ? palette.off : isToday ? palette.brass : palette.mute }}>
                    {MOCK.monthGridNums[wi][di]}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, padding: "0 6px" }}>
          {[["I","Period"], ["II","Follicular"], ["III","Ovulation"], ["IV","Luteal"]].map(([num, name], i) => (
            <span key={i} style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: palette.mute, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
              <span style={{ color: palette.brass, marginRight: 4 }}>{num}</span>{name}
            </span>
          ))}
        </div>
      </div>

      {/* Active formula card */}
      <SectionLabel theme="apothecary" palette={palette} num="02" title="Today's formula" />
      <div style={{ background: `linear-gradient(135deg, ${palette.surface} 0%, #321A2A 100%)`, borderRadius: 6, padding: "20px 22px", border: `1px solid ${palette.brass}55`, marginTop: 10, marginBottom: 24 }}>
        <p style={{ fontSize: 9.5, letterSpacing: "0.32em", textTransform: "uppercase", color: palette.brass, fontFamily: "'Inter', sans-serif", fontWeight: 700, margin: 0 }}>Formula No. 22</p>
        <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 26, color: palette.cream, margin: "6px 0 6px", letterSpacing: "0.005em" }}>{MOCK.activeRhythm}</h3>
        <p style={{ fontSize: 13, color: palette.mute, fontFamily: "Cormorant Garamond, Georgia, serif", margin: "0 0 14px", fontStyle: "italic" }}>{MOCK.activeRhythmCount} · prepared for the inward half</p>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {["warm meals","early nights","slow walks","reading","saying no","journaling"].map((r, i) => (
            <span key={i} style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: palette.text, fontFamily: "'Inter', sans-serif", fontWeight: 600, padding: "5px 10px", border: `1px solid ${palette.brass}55`, borderRadius: 0, background: "transparent" }}>{r}</span>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${palette.brass}33`, marginTop: 20, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: palette.mute, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>This week · {MOCK.weekHabitPct}% steady</span>
          <a href="#" style={{ fontSize: 11, color: palette.brass, fontFamily: "'Inter', sans-serif", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>Build &nbsp;→</a>
        </div>
      </div>

      {/* Ahead card */}
      <SectionLabel theme="apothecary" palette={palette} num="03" title="Days ahead" />
      <div style={{ background: palette.surface, borderRadius: 6, padding: 20, border: `1px solid ${palette.brass}33`, marginTop: 10, marginBottom: 22 }}>
        <p style={{ fontSize: 14, color: palette.text, fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", margin: "0 0 14px", lineHeight: 1.55 }}>
          The luteal half settles into a slower tempo. Period predicted <span style={{ color: palette.brass }}>{MOCK.nextPeriod}</span> · ±{MOCK.etaWindowDays}d.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {MOCK.ahead.map((c, i) => (
            <div key={i} style={{ borderTop: `1.5px solid ${phaseHex[c.phase]}`, padding: "8px 0 0", textAlign: "center" }}>
              <p style={{ fontSize: 9, letterSpacing: "0.3em", color: palette.mute, fontFamily: "'Inter', sans-serif", fontWeight: 700, margin: 0 }}>{c.day}</p>
              <p style={{ fontSize: 22, fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", color: palette.cream, margin: 0 }}>{c.num}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.brass, fontFamily: "'Inter', sans-serif", fontWeight: 700, margin: "16px 0 0", textAlign: "right" }}>
          {MOCK.confidencePct}% confident · {MOCK.cyclesObserved} cycles
        </p>
      </div>

      <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: palette.brass, fontFamily: "'Inter', sans-serif", fontWeight: 700, textAlign: "center", margin: "20px 0 0" }}>
        F · W · 2026
      </p>
    </div>
  );
}

function SectionLabel({ theme, palette, num, title }) {
  if (theme === "apothecary") {
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "16px 0 0" }}>
        <span style={{ fontSize: 9.5, letterSpacing: "0.32em", color: palette.brass, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>{num}</span>
        <span style={{ flex: 1, height: 1, background: `${palette.brass}33` }} />
        <span style={{ fontSize: 9.5, letterSpacing: "0.32em", textTransform: "uppercase", color: palette.brass, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>{title}</span>
      </div>
    );
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 2 · LE MENU
// Noma menu × Aesop print × A24 editorial poster. Cream paper, espresso ink,
// asymmetric editorial layout. Today is "the day's plate". Each phase is a
// course. Hairlines and small ornamental rules. Quietly handmade.
// ─────────────────────────────────────────────────────────────────────────────
function ConceptMenu() {
  const palette = {
    paper:  "#F2E9D9",
    paper2: "#EADFC6",
    ink:    "#2A1810",
    inkSoft:"#5A3F30",
    rust:   "#9C4A2C",
    sage:   "#5C6E4F",
    gold:   "#A88444",
  };
  return (
    <div style={{ background: palette.paper, padding: "44px 28px 56px", borderRadius: 24, color: palette.ink, fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Top ornament */}
      <p style={{ textAlign: "center", fontSize: 14, color: palette.gold, margin: "0 0 18px", letterSpacing: "0.4em" }}>· · ·</p>

      {/* Hero */}
      <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: palette.inkSoft, fontFamily: "'Inter', sans-serif", fontWeight: 600, margin: 0 }}>
          {MOCK.todayLabel.toUpperCase()}
        </p>
        <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 44, color: palette.ink, margin: "12px 0 4px", letterSpacing: "0.005em", lineHeight: 1, fontWeight: 500 }}>
          The luteal table
        </h2>
        <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 16, color: palette.inkSoft, margin: "8px 0 0", letterSpacing: "0.01em" }}>
          A four-course menu for the inward half of the cycle.
        </p>
        <p style={{ fontSize: 11, color: palette.gold, margin: "20px 0 0", letterSpacing: "0.4em" }}>· · ·</p>
      </div>

      {/* Courses — the four phases as a menu */}
      <ol style={{ listStyle: "none", padding: 0, margin: "28px 0 36px" }}>
        {[
          { num: "I",  course: "AMUSE",      name: "Period",     desc: "warm broths · cocoa · slow mornings",                                 phase: "menstrual" },
          { num: "II", course: "ENTRÉE",     name: "Follicular", desc: "fresh greens · seeded breads · new projects",                         phase: "follicular" },
          { num: "III",course: "PLAT",       name: "Ovulatory",  desc: "sun-warmed tomatoes · linen on a terrace · the longest conversation", phase: "ovulatory" },
          { num: "IV", course: "DIGESTIF",   name: "Luteal",     desc: "roasted root · slow stew · early candles · saying no",                phase: "luteal" },
        ].map((c, i) => {
          const isHere = c.phase === "luteal";
          return (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 18, alignItems: "baseline", padding: "14px 0", borderBottom: i < 3 ? `1px solid ${palette.gold}55` : "none", position: "relative" }}>
              <span style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 18, color: isHere ? palette.rust : palette.gold }}>{c.num}.</span>
              <div>
                <p style={{ fontSize: 9.5, letterSpacing: "0.32em", textTransform: "uppercase", color: palette.inkSoft, fontFamily: "'Inter', sans-serif", fontWeight: 600, margin: 0 }}>{c.course}</p>
                <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 22, color: palette.ink, margin: "2px 0 6px", fontWeight: 500 }}>{c.name}</p>
                <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 14, color: palette.inkSoft, margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
              </div>
              {isHere && <span style={{ fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: palette.rust, fontFamily: "'Inter', sans-serif", fontWeight: 700, alignSelf: "start", marginTop: 6 }}>· here today</span>}
            </li>
          );
        })}
      </ol>

      {/* Ribbon as an inked rule */}
      <div style={{ background: palette.paper2, padding: "22px 18px", borderRadius: 2 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: palette.inkSoft, fontFamily: "'Inter', sans-serif", fontWeight: 600, margin: 0, textAlign: "center" }}>May · the month, plated</p>
        <div style={{ display: "flex", gap: 2, height: 14, marginTop: 14, borderRadius: 1, overflow: "hidden" }}>
          {[
            { w: 11, c: "#C9C0AA" }, { w: 14, c: palette.rust },
            { w: 25, c: palette.sage }, { w: 14, c: palette.gold },
            { w: 30, c: "#8A5F74" },  { w: 6,  c: "#C9C0AA" },
          ].map((s, i) => (
            <div key={i} style={{ width: `${s.w}%`, background: s.c }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <span style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 12, color: palette.inkSoft }}>1 May · begin</span>
          <span style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 14, fontStyle: "italic", color: palette.rust, fontWeight: 600 }}>· today, 15 ·</span>
          <span style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 12, color: palette.inkSoft }}>31 May · close</span>
        </div>
      </div>

      {/* Footer line */}
      <p style={{ textAlign: "center", fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 13, color: palette.inkSoft, margin: "30px 0 6px", lineHeight: 1.6, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
        Next period gently expected <span style={{ color: palette.rust, fontWeight: 600 }}>{MOCK.nextPeriod}</span>, give or take {MOCK.etaWindowDays} days. {MOCK.confidencePct}% sure — we've sat at this table {MOCK.cyclesObserved} times together.
      </p>
      <p style={{ textAlign: "center", fontSize: 11, color: palette.gold, margin: "20px 0 0", letterSpacing: "0.4em" }}>· · ·</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 3 · ATELIER PLAIN
// Byredo × Maison Margiela Replica × Muji × Aesop product cards. Off-white
// ground, graphite ink. Numbered taxonomy. Nothing decorative. Phase data
// shown as small graphic tags, not gradients. Reads like a perfume label.
// ─────────────────────────────────────────────────────────────────────────────
function ConceptAtelier() {
  const palette = {
    paper: "#F8F6F1",
    line:  "#0E0E0E",
    text:  "#1A1A1A",
    mute:  "#7A7A75",
    accent:"#B8967A",
    swatch:{ menstrual:"#B83C2A", follicular:"#D88E4A", ovulatory:"#E2C76C", luteal:"#7A5572", off:"#E5E0D6" },
  };
  return (
    <div style={{ background: palette.paper, padding: "36px 22px 56px", borderRadius: 24, color: palette.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Top label — like a fragrance bottle label */}
      <div style={{ borderTop: `2px solid ${palette.line}`, borderBottom: `1px solid ${palette.line}`, padding: "16px 0 14px", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.text, fontWeight: 600, margin: 0 }}>FemWell · Cycle</p>
          <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.text, fontWeight: 600, margin: 0 }}>027 / 14 · 22 / 28</p>
        </div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 56, fontWeight: 400, color: palette.line, margin: "18px 0 8px", letterSpacing: "-0.04em", lineHeight: 0.95 }}>
          Luteal.
        </h2>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <span style={{ width: 32, height: 4, background: palette.swatch.luteal, display: "inline-block" }} />
          <p style={{ fontSize: 13, color: palette.mute, margin: 0, fontWeight: 400 }}>Day twenty-two. Inward, gently.</p>
        </div>
      </div>

      {/* The month — printed swatches grid */}
      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 18, alignItems: "start", marginBottom: 32 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: palette.mute, fontWeight: 600, margin: 0, transform: "rotate(180deg)", writingMode: "vertical-rl", textAlign: "right" }}>The month / May</p>
        <div>
          {MOCK.monthGrid.map((week, wi) => (
            <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
              {week.map((p, di) => {
                const isToday = wi === MOCK.todayCell.week && di === MOCK.todayCell.day;
                return (
                  <div key={di} style={{ aspectRatio: "1/1", background: palette.swatch[p] || palette.swatch.off, border: isToday ? `2px solid ${palette.line}` : `0.5px solid rgba(0,0,0,0.06)`, position: "relative", display: "flex", alignItems: "flex-end", padding: 4 }}>
                    <span style={{ fontSize: 9, color: p === "off" ? palette.mute : "rgba(255,255,255,0.95)", fontWeight: 600, letterSpacing: "0.06em", textShadow: p === "off" ? "none" : "0 1px 2px rgba(0,0,0,0.25)" }}>{MOCK.monthGridNums[wi][di]}</span>
                    {isToday && <span style={{ position: "absolute", top: 2, right: 2, width: 5, height: 5, background: palette.line, borderRadius: 0 }} />}
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
            {Object.entries({ "01 Period":"menstrual","02 Follicular":"follicular","03 Ovulatory":"ovulatory","04 Luteal":"luteal" }).map(([k,v]) => (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: palette.text, fontWeight: 500 }}>
                <span style={{ width: 12, height: 12, background: palette.swatch[v] }} />{k}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Product card — Saved Rhythm as a perfume "edition" */}
      <div style={{ border: `1px solid ${palette.line}`, padding: "22px 22px 18px", marginBottom: 22, background: palette.paper }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 9.5, letterSpacing: "0.32em", textTransform: "uppercase", color: palette.mute, margin: 0, fontWeight: 600 }}>Edition · luteal</p>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, color: palette.line, margin: "4px 0 4px", letterSpacing: "-0.02em", fontWeight: 500 }}>{MOCK.activeRhythm}</h3>
            <p style={{ fontSize: 12.5, color: palette.mute, margin: 0 }}>{MOCK.activeRhythmCount}</p>
          </div>
          <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: palette.accent, fontWeight: 600, border: `1px solid ${palette.accent}`, padding: "4px 10px" }}>active</span>
        </div>
        <p style={{ fontSize: 12.5, color: palette.text, margin: "16px 0 8px", lineHeight: 1.55, maxWidth: 460 }}>
          Notes of <em>warm grains</em>, <em>early candles</em>, and <em>the second cup of tea</em>. Wear softly. Not for finishing the to-do list.
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 14, borderTop: `1px solid rgba(0,0,0,0.06)`, paddingTop: 12 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: palette.mute, fontWeight: 600 }}>This week · {MOCK.weekHabitPct}% steady</span>
          <a href="#" style={{ fontSize: 11, color: palette.line, textDecoration: "underline", textUnderlineOffset: 4, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Build →</a>
        </div>
      </div>

      {/* Week ahead — typographic */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, borderTop: `1px solid ${palette.line}`, borderBottom: `1px solid ${palette.line}`, padding: "14px 0" }}>
        {MOCK.ahead.map((c, i) => (
          <div key={i} style={{ borderLeft: i > 0 ? `0.5px solid ${palette.mute}55` : "none", padding: "4px 8px", textAlign: "left" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.22em", color: palette.mute, fontWeight: 600, margin: 0 }}>{c.day}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, color: palette.line, margin: "2px 0 0", fontWeight: 400, letterSpacing: "-0.03em" }}>{c.num}</p>
            <span style={{ display: "inline-block", marginTop: 4, width: 16, height: 3, background: palette.swatch[c.phase] }} />
          </div>
        ))}
      </div>
      <p style={{ fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: palette.mute, fontWeight: 600, margin: "14px 0 0", textAlign: "center" }}>Next period · {MOCK.nextPeriod.toUpperCase()} · ±{MOCK.etaWindowDays}D · {MOCK.confidencePct}%</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 4 · AURORA FIELD
// Mercury Weather × Monument Valley × Tidal HiFi editorial. Twilight sky
// gradient, cycle as horizon. Phase ribbons become an actual coloured sky
// from period at twilight to luteal pre-dawn. Glass cards with backdrop blur.
// Cinematic, atmospheric, alive.
// ─────────────────────────────────────────────────────────────────────────────
function ConceptAurora() {
  const palette = {
    cream: "#F8EFE2",
    bone:  "#E5D8C8",
    plum:  "#1B0F2A",
  };
  return (
    <div style={{ background: "linear-gradient(180deg, #16092B 0%, #3F1844 36%, #8C2E5F 64%, #D55B5A 86%, #E89373 100%)", padding: "44px 24px 48px", borderRadius: 28, color: palette.cream, fontFamily: "'Inter', -apple-system, sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Soft stars */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.7 }}>
        {[[12,8],[44,18],[78,12],[28,32],[92,40],[58,22],[20,52],[88,68]].map((p, i) => (
          <span key={i} style={{ position: "absolute", left: `${p[0]}%`, top: `${p[1]}%`, width: 2, height: 2, borderRadius: 9999, background: palette.cream, opacity: 0.55, boxShadow: "0 0 6px rgba(255,255,255,0.6)" }} />
        ))}
      </div>

      {/* Hero — phase as horizon */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: 28 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: palette.bone, opacity: 0.85, fontWeight: 600, margin: 0 }}>{MOCK.todayLabel}</p>
        <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 56, fontWeight: 500, color: palette.cream, margin: "10px 0 0", letterSpacing: "-0.02em", lineHeight: 0.95, textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}>Day 22<span style={{ fontSize: 22, color: palette.bone, opacity: 0.85, marginLeft: 8, letterSpacing: "0.04em" }}>· luteal</span></h2>
        <p style={{ fontSize: 14, color: palette.bone, opacity: 0.85, margin: "10px 0 0", maxWidth: 460, lineHeight: 1.55 }}>The sky is tipping toward the next dawn. You're a few days from the next period — slow rhythms tend to land well here.</p>
      </div>

      {/* Aurora ribbon — phase horizon */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.bone, opacity: 0.7, fontWeight: 600 }}>The month, as light</span>
          <span style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.bone, opacity: 0.7, fontWeight: 600 }}>May</span>
        </div>
        <div style={{ position: "relative", height: 92, borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.30), inset 0 0 30px rgba(0,0,0,0.25)", background: "linear-gradient(90deg, #B83C2A 0%, #D88E4A 24%, #E2C76C 42%, #7A5572 64%, #4A2A3A 100%)" }}>
          {/* Glow line at sunset */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 28%, transparent 70%, rgba(0,0,0,0.30) 100%)" }} />
          {/* Today indicator — sun/moon disc */}
          <div style={{ position: "absolute", left: "calc(52% - 12px)", top: 22, width: 24, height: 24, borderRadius: 9999, background: "radial-gradient(circle at 30% 30%, #FFF9E8 0%, #F8C56B 50%, #F08E3F 100%)", boxShadow: "0 0 28px rgba(255,210,140,0.95), 0 0 8px rgba(255,255,255,0.6)" }} />
          {/* Tick marks */}
          {[0,7,14,21,28].map((d, i) => (
            <div key={i} style={{ position: "absolute", left: `${(d/30)*100}%`, bottom: 6, fontSize: 9, color: "rgba(255,255,255,0.7)", letterSpacing: "0.18em", fontWeight: 700, transform: "translateX(-50%)" }}>{d === 0 ? "1" : d}</div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 10, letterSpacing: "0.22em", color: palette.bone, opacity: 0.8, fontWeight: 600 }}>
          <span>PERIOD</span><span>FOLLICULAR</span><span>OVULATION</span><span style={{ color: palette.cream }}>LUTEAL · YOU ARE HERE</span><span style={{ opacity: 0.4 }}>NEXT</span>
        </div>
      </div>

      {/* Glass cards — saved rhythm + ahead */}
      <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 14 }}>
        <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 18, padding: "16px 18px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.bone, opacity: 0.75, fontWeight: 600, margin: 0 }}>Your rhythm · active</p>
          <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 28, color: palette.cream, margin: "6px 0 8px", fontWeight: 500 }}>{MOCK.activeRhythm}</h3>
          <p style={{ fontSize: 13, color: palette.bone, margin: 0, opacity: 0.85 }}>{MOCK.activeRhythmCount} · slow walks, warm food, early candles</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <span style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.bone, opacity: 0.8, fontWeight: 600 }}>{MOCK.weekHabitPct}% steady · this week</span>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 14px", borderRadius: 9999, background: "rgba(255,255,255,0.18)", color: palette.cream, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em" }}>Build into next week →</span>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "14px 16px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.bone, opacity: 0.75, fontWeight: 600, margin: "0 0 12px" }}>Days ahead</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {MOCK.ahead.map((c, i) => (
              <div key={i} style={{ textAlign: "center", padding: "6px 0" }}>
                <p style={{ fontSize: 9, letterSpacing: "0.22em", color: palette.bone, opacity: 0.7, fontWeight: 700, margin: 0 }}>{c.day}</p>
                <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 26, color: palette.cream, margin: "2px 0 4px", fontWeight: 500 }}>{c.num}</p>
                <span style={{ display: "inline-block", width: 26, height: 3, borderRadius: 9999, background: c.phase === "menstrual" ? "#D55B5A" : "#7A5572", boxShadow: c.phase === "menstrual" ? "0 0 10px rgba(213,91,90,0.75)" : "0 0 8px rgba(122,85,114,0.6)" }} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.bone, opacity: 0.85, fontWeight: 600, margin: "14px 0 0", textAlign: "center" }}>Next period · {MOCK.nextPeriod.toUpperCase()} · ±{MOCK.etaWindowDays}D · {MOCK.confidencePct}% sure</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 5 · MAISON ROUGE
// Hades game UI × Brutalist gallery × A24 film poster. Deep wine ground.
// Heavy serif. Numerals OVERSIZED. Bold hard-edged blocks. Confident. The
// month is a banner, the cycle is a stage. No apology.
// ─────────────────────────────────────────────────────────────────────────────
function ConceptRouge() {
  const palette = {
    bg:     "#3A0A1A",
    deeper: "#28071A",
    cream:  "#F2E3CB",
    bone:   "#E2C7A4",
    rust:   "#D9462E",
    gold:   "#E4B53A",
    sage:   "#5C8A6E",
    rose:   "#E08576",
    mauve:  "#9C6080",
  };
  const phaseHex = { menstrual: palette.rust, follicular: palette.rose, ovulatory: palette.gold, luteal: palette.mauve, off: "#5A1A2A" };

  return (
    <div style={{ background: palette.bg, padding: "32px 22px 56px", borderRadius: 24, color: palette.cream, fontFamily: "Cormorant Garamond, Georgia, serif" }}>
      {/* Hero banner */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.36em", textTransform: "uppercase", color: palette.gold, fontWeight: 700, margin: 0, fontFamily: "'Inter', sans-serif" }}>{MOCK.todayLabel} · Year of the Cycle</p>
        <h2 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 76, fontWeight: 700, color: palette.cream, margin: "12px 0 0", letterSpacing: "-0.03em", lineHeight: 0.88, textShadow: `0 0 36px ${palette.gold}55`, position: "relative" }}>
          DAY <span style={{ color: palette.gold }}>22</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", position: "absolute", right: 0, top: 6, fontSize: 16, color: palette.bone, fontWeight: 400, letterSpacing: "0.04em" }}>/ 28</span>
        </h2>
        <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 22, fontStyle: "italic", color: palette.rose, margin: "10px 0 0", letterSpacing: "0.01em" }}>The luteal half. Take the room.</p>
      </div>

      {/* Hard-edge month — no gradients, just blocks */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: palette.gold, fontFamily: "'Inter', sans-serif", fontWeight: 700, margin: 0 }}>May · ACT III of IV</p>
          <p style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: palette.bone, fontFamily: "'Inter', sans-serif", fontWeight: 700, margin: 0 }}>{MOCK.cyclesObserved} cycles known · {MOCK.confidencePct}%</p>
        </div>
        <div style={{ background: palette.deeper, padding: 10, borderRadius: 4, border: `1px solid ${palette.gold}33`, boxShadow: "inset 0 0 24px rgba(0,0,0,0.45)" }}>
          {MOCK.monthGrid.map((week, wi) => (
            <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: wi === 4 ? 0 : 4 }}>
              {week.map((p, di) => {
                const isToday = wi === MOCK.todayCell.week && di === MOCK.todayCell.day;
                return (
                  <div key={di} style={{ position: "relative", aspectRatio: "1/1", background: phaseHex[p] || phaseHex.off, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isToday ? `0 0 0 3px ${palette.gold}, 0 0 24px ${palette.gold}AA` : "none", transform: isToday ? "scale(1.06)" : "none", transition: "transform 200ms ease", zIndex: isToday ? 2 : 1 }}>
                    <span style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: isToday ? 19 : 14, fontWeight: 700, color: p === "off" ? "rgba(255,255,255,0.35)" : palette.cream, textShadow: isToday ? "0 1px 2px rgba(0,0,0,0.45)" : "none" }}>{MOCK.monthGridNums[wi][di]}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
          {[["I","PERIOD",palette.rust],["II","FOLLICULAR",palette.rose],["III","OVULATION",palette.gold],["IV","LUTEAL",palette.mauve]].map(([n,name,c],i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: "0.22em", color: palette.bone, fontWeight: 700 }}>
              <span style={{ width: 14, height: 14, background: c }} /><span style={{ color: palette.gold }}>{n}.</span>{name}
            </span>
          ))}
        </div>
      </div>

      {/* Rhythm card — film-poster ratio */}
      <div style={{ background: "linear-gradient(135deg, #4A1226 0%, #2A0A1A 100%)", border: `2px solid ${palette.gold}`, padding: "26px 24px", marginBottom: 22, position: "relative" }}>
        <div style={{ position: "absolute", top: 14, right: 18, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: palette.gold, letterSpacing: "0.06em" }}>ACT III · OPUS 22</div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: palette.gold, margin: 0, fontWeight: 700 }}>The Rhythm</p>
        <h3 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 44, fontWeight: 700, color: palette.cream, margin: "12px 0 4px", letterSpacing: "-0.02em", lineHeight: 1 }}>{MOCK.activeRhythm}</h3>
        <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontStyle: "italic", fontSize: 16, color: palette.rose, margin: "0 0 18px" }}>{MOCK.activeRhythmCount} · for the inward half</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: `1px solid ${palette.gold}33` }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: palette.gold, letterSpacing: "0.08em" }}>{MOCK.weekHabitPct}% / WEEK</span>
          <button style={{ padding: "9px 18px", background: palette.gold, color: palette.deeper, border: "none", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", boxShadow: `0 4px 18px ${palette.gold}66` }}>BUILD INTO WEEK ↗</button>
        </div>
      </div>

      {/* Days ahead — strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 18 }}>
        {MOCK.ahead.map((c, i) => (
          <div key={i} style={{ background: phaseHex[c.phase], padding: "12px 8px", textAlign: "center", boxShadow: `0 0 16px ${phaseHex[c.phase]}88`, position: "relative" }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.8)", letterSpacing: "0.12em", margin: 0, fontWeight: 700 }}>{c.day}</p>
            <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 34, fontWeight: 700, color: palette.cream, margin: 0, lineHeight: 1, textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>{c.num}</p>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: palette.gold, fontWeight: 700, textAlign: "center", margin: 0 }}>NEXT ACT · {MOCK.nextPeriod.toUpperCase()} · ±{MOCK.etaWindowDays}D</p>
    </div>
  );
}

// ─── Page chrome styles ─────────────────────────────────────────────────────
const pageWrapStyle = {
  background: "linear-gradient(180deg, #F4EDE4 0%, #E9DDD0 100%)",
  minHeight: "100vh",
  padding: "30px 16px 60px",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};
const pageHeadStyle = {
  maxWidth: 720,
  margin: "0 auto 20px",
  textAlign: "center",
};
const pageEyebrowStyle = {
  fontSize: 11,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  color: "var(--plum-mute, #8A7584)",
  fontWeight: 600,
  margin: 0,
};
const pageTitleStyle = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: 32,
  fontWeight: 500,
  color: "var(--plum, #4A2A3A)",
  margin: "8px 0 10px",
  letterSpacing: "-0.01em",
};
const pageSubStyle = {
  fontSize: 14,
  color: "var(--plum-2, #6B4559)",
  margin: "0 auto 26px",
  maxWidth: 540,
  lineHeight: 1.55,
};
const tabsRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  justifyContent: "center",
  marginBottom: 8,
};
const tabBtnStyle = {
  border: "1px solid rgba(74,42,58,0.18)",
  borderRadius: 14,
  padding: "10px 14px",
  background: "transparent",
  cursor: "pointer",
  textAlign: "left",
  minWidth: 160,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};
const tabLabelStyle = {
  fontFamily: "Cormorant Garamond, Georgia, serif",
  fontSize: 15,
  fontWeight: 500,
  letterSpacing: "-0.005em",
};
const tabRefStyle = {
  fontSize: 9.5,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  opacity: 0.75,
  fontWeight: 600,
};
const stageStyle = {
  maxWidth: 640,
  margin: "0 auto",
};

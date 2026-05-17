// ─────────────────────────────────────────────────────────────────────────────
// PreTtcCards — three Cycle-tab cards exclusive to the pre-ttc life stage:
//   - FolicAcidNudge   — NHS 400 mcg/day reminder, pre-conception framing.
//   - AmhAwarenessCard — what AMH is, when to test, NHS vs private cost.
//   - SupplementStackCard — folic acid · vit D · iron · CoQ10 mention.
//
// All three are self-contained — no entity reads — so they ship without any
// base44 schema dependency. If a future MP wires per-user SupplementLog rows,
// the SupplementStackCard can graceful-degrade onto live data.
//
// Visibility is gated by the caller (Planner.jsx) on
// plannerConfig.cycleTabName === "Prepare" — i.e. pre-ttc only.
// ─────────────────────────────────────────────────────────────────────────────

import { Pill, Sparkles, Beaker } from "lucide-react";

export function FolicAcidNudge() {
  return (
    <section style={wrap} aria-label="Folic acid reminder">
      <header style={headRow}>
        <span style={iconWrap}><Pill size={14} strokeWidth={1.8} /></span>
        <div>
          <p style={eyebrow}>PRE-CONCEPTION · NHS GUIDANCE</p>
          <p style={title}>Folic acid from today — not from the positive test</p>
        </div>
      </header>
      <p style={body}>
        The NHS recommends <strong>400 mcg daily</strong> for everyone planning a pregnancy, from
        before conception through the first 12 weeks. The neural tube closes by week 6 — often
        before you'd suspect you're pregnant. Some risk groups (epilepsy meds, diabetes, family
        history of NTD) need <strong>5 mg</strong> instead — worth a GP word.
      </p>
      <p style={meta}>
        Most multivits include 400 mcg already. Pregnacare Conception is the standard supermarket
        pick; cheaper own-brand is just as effective.
      </p>
    </section>
  );
}

export function AmhAwarenessCard() {
  return (
    <section style={wrap} aria-label="AMH awareness">
      <header style={headRow}>
        <span style={iconWrap}><Beaker size={14} strokeWidth={1.8} /></span>
        <div>
          <p style={eyebrow}>BACKGROUND · WHAT IS AMH?</p>
          <p style={title}>Ovarian reserve, in one number</p>
        </div>
      </header>
      <p style={body}>
        Anti-Müllerian Hormone is a blood test that estimates how many eggs you have left —
        not their quality. A higher number means a fuller bench; lower doesn't mean you can't
        conceive naturally. Worth knowing if you're <em>considering</em> TTC in 1–3 years and want
        a baseline.
      </p>
      <ul style={list}>
        <li><strong>NHS:</strong> typically only offered if you're starting fertility investigations.</li>
        <li><strong>Private:</strong> £60–£120 standalone (Medichecks, Thriva, Lola Hormones), or as part of a wider panel.</li>
        <li><strong>When:</strong> any day of the cycle — AMH doesn't fluctuate the way FSH does.</li>
      </ul>
      <p style={meta}>
        We won't pretend a single number is destiny. It's one input. A lower-than-expected
        result + a 1-year horizon is a different conversation than the same number + a 3-year
        horizon.
      </p>
    </section>
  );
}

export function SupplementStackCard() {
  const items = [
    { name: "Folic acid",      dose: "400 mcg daily", note: "Start now. 5 mg if your GP advised." },
    { name: "Vitamin D",       dose: "10 mcg / 400 IU", note: "Especially Oct–Mar in the UK." },
    { name: "Iron",            dose: "Diet-first; supplement if low", note: "Test ferritin before supplementing." },
    { name: "Omega-3 / DHA",   dose: "250 mg daily", note: "Plant or low-mercury fish oil." },
    { name: "CoQ10 (optional)",dose: "100–200 mg",    note: "Evidence mixed; mentioned in IVF protocols." },
  ];

  return (
    <section style={wrap} aria-label="Pre-conception supplement stack">
      <header style={headRow}>
        <span style={iconWrap}><Sparkles size={14} strokeWidth={1.8} /></span>
        <div>
          <p style={eyebrow}>SUPPLEMENT STACK · PRE-CONCEPTION</p>
          <p style={title}>The dull list that actually works</p>
        </div>
      </header>
      <p style={meta}>
        Three months of consistent supplementation matters more than any single dose. None of
        this is medical advice; check with your GP, especially if you're on other medication.
      </p>
      <div style={stackList}>
        {items.map((it) => (
          <div key={it.name} style={stackRow}>
            <div style={stackName}>{it.name}</div>
            <div style={stackDose}>{it.dose}</div>
            <div style={stackNote}>{it.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Styles (mirrors HrtLogCard / ContraceptionCard for visual coherence) ──
const wrap = {
  background: "linear-gradient(180deg, rgba(107,143,90,0.08), rgba(244,237,219,0.6))",
  border: "1px solid rgba(58,44,26,0.12)",
  borderLeft: "3px solid #6B8F5A",
  borderRadius: 14,
  padding: "14px 14px 16px",
  marginBottom: 12,
};
const headRow = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  marginBottom: 8,
};
const iconWrap = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  borderRadius: 9999,
  background: "rgba(107,143,90,0.18)",
  color: "#3F6228",
  flexShrink: 0,
};
const eyebrow = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "#3F6228",
  textTransform: "uppercase",
  margin: 0,
};
const title = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17,
  fontWeight: 500,
  lineHeight: 1.22,
  color: "#3A2C1A",
  margin: "3px 0 0",
};
const body = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: "#3A2C1A",
  lineHeight: 1.55,
  margin: "6px 0 8px",
};
const meta = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "#6B5840",
  fontStyle: "italic",
  lineHeight: 1.5,
  margin: "0 0 6px",
};
const list = {
  margin: "4px 0 8px 16px",
  padding: 0,
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5,
  color: "#3A2C1A",
  lineHeight: 1.6,
};
const stackList = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginTop: 8,
};
const stackRow = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  rowGap: 2,
  columnGap: 10,
  padding: "8px 10px",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.08)",
  borderRadius: 8,
};
const stackName = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  color: "#3A2C1A",
};
const stackDose = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  color: "#3F6228",
  textAlign: "right",
};
const stackNote = {
  gridColumn: "1 / -1",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  color: "#6B5840",
  lineHeight: 1.45,
};

// ConditionRows — condition-specific row components for PlannerV2Shell.
//
// Conditions are stored as an array on userProfile.conditions. A user
// may have multiple; in v1 we surface only the FIRST matching row to
// avoid stacking. Multi-condition support is a follow-up.
//
// Position in shell: directly after StageRow, before TimeOfDayRow.
// Visual chrome (slider, card layout, kicker, cardTitle, CTA links)
// matches every other row.
//
// All data logged in these cards goes to the same entities as the
// rest of the app. Crisis resources (PMDD card 4, Mental Health
// card 4) MUST stay visible, never hidden behind a tap.

import React, { useState } from "react";
import {
  Activity, Heart, AlertCircle, Sparkles, Droplets, Pill,
  Thermometer, Bone, Flame, Snowflake, BookOpen, MessageCircle,
  ChevronRight, Plus, Check, TrendingUp, Sun, MoonStar, Apple,
  Phone, Brain, Battery, Coffee, Clock, ListChecks, Stethoscope,
  Frown, Meh, Smile, ShieldAlert,
} from "lucide-react";
import Row from "./Row";
import { C, card, kicker, cardTitle, cardSub } from "./tokens";

// ─── Shared atoms ────────────────────────────────────────────────────────────

const ctaLink = {
  alignSelf: "flex-start", marginTop: 4,
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none",
  color: C.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0,
};

function ChipGrid({ chips, selected, onToggle, accent = C.gold, danger = [] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
      {chips.map((c) => {
        const on = selected.includes(c);
        const isDanger = danger.includes(c);
        return (
          <button key={c} onClick={() => onToggle(c)} style={{
            padding: "5px 10px", borderRadius: 9999,
            border: `1px solid ${on ? (isDanger ? C.rose : accent) : "rgba(58,44,26,0.16)"}`,
            background: on ? (isDanger ? `${C.rose}22` : `${accent}22`) : "transparent",
            color: isDanger ? C.rose : C.espresso,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            {isDanger && <ShieldAlert size={10} />} {c}
          </button>
        );
      })}
    </div>
  );
}

function SeveritySlider({ value, onChange, max = 5, accent = C.gold, label = "Severity" }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: "0.08em", fontWeight: 600 }}>
        {label.toUpperCase()} · {value || "—"}{value ? ` / ${max}` : ""}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button key={n} onClick={() => onChange(n)} style={{
            flex: 1, height: 8, borderRadius: 9999,
            background: value && n <= value ? accent : "rgba(58,44,26,0.10)",
            border: "none", cursor: "pointer", padding: 0,
          }} aria-label={`Severity ${n}`} />
        ))}
      </div>
    </div>
  );
}

function ChecklistItem({ item, onToggle, accent = C.sage }) {
  return (
    <li style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 8px", borderRadius: 10,
      background: item.done ? `${accent}14` : C.cream,
      border: `1px solid ${item.done ? `${accent}33` : "rgba(58,44,26,0.06)"}`,
    }}>
      <button onClick={onToggle} aria-label={`Toggle ${item.text}`} style={{
        width: 20, height: 20, borderRadius: 4,
        background: item.done ? accent : "transparent",
        border: `1.5px solid ${item.done ? accent : "rgba(58,44,26,0.22)"}`,
        cursor: "pointer", padding: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {item.done && <Check size={11} style={{ color: "#fff" }} />}
      </button>
      <span style={{
        flex: 1, fontSize: 12.5, color: C.espresso,
        textDecoration: item.done ? "line-through" : "none",
        opacity: item.done ? 0.6 : 1,
      }}>{item.text}</span>
    </li>
  );
}

function CrisisStrip({ resources = ["Samaritans 116 123", "SHOUT text 85258", "Mind 0300 123 3393"] }) {
  return (
    <div style={{
      marginTop: 8, padding: "8px 10px",
      background: `${C.rose}10`,
      border: `1px solid ${C.rose}33`,
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: C.rose, marginBottom: 4 }}>
        IF YOU&apos;RE STRUGGLING TODAY
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
        {resources.map((r) => (
          <li key={r} style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: C.espresso, fontWeight: 600,
          }}>
            <Phone size={11} style={{ color: C.rose }} /> {r}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 10, color: C.muted, marginTop: 4, fontStyle: "italic" }}>
        These are here whenever you need them.
      </p>
    </div>
  );
}

// ─── PMDD / PMS ──────────────────────────────────────────────────────────────

function PmddPhaseCard({ phase, cycleDay }) {
  const inWindow = phase === "luteal" || (cycleDay && cycleDay >= 14 && cycleDay <= 28);
  const daysToWindow = (() => {
    if (!cycleDay) return null;
    if (cycleDay <= 14) return 14 - cycleDay;
    return 28 - cycleDay + 14;
  })();
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.plum}14`, color: C.plum,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Clock size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>PMDD WINDOW</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>
            {inWindow ? "You're in your PMDD window" : `${daysToWindow ?? "—"} days to PMDD window`}
          </h3>
        </div>
      </div>
      <p style={cardSub}>
        Typical PMDD window: cycle days 14–28. Your current day: {cycleDay || "—"}.
      </p>
      <p style={{ ...cardSub, fontStyle: "italic", color: C.plum }}>
        Your PMDD is real. It is biological. It will pass.
      </p>
    </article>
  );
}

function PmddSymptomsCard() {
  const CHIPS = ["Rage", "Despair", "Anxiety", "Brain fog", "Fatigue", "Physical pain", "Suicidal thoughts", "Bloating", "Breast pain"];
  const DANGER = ["Suicidal thoughts"];
  const [picked, setPicked] = useState([]);
  const [severity, setSeverity] = useState(0);
  function toggle(c) {
    setPicked((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  const hasDanger = picked.some((c) => DANGER.includes(c));
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.rose}14`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SYMPTOMS TODAY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Severity, honestly</h3>
        </div>
      </div>
      <ChipGrid chips={CHIPS} selected={picked} onToggle={toggle} accent={C.plum} danger={DANGER} />
      {picked.length > 0 && <SeveritySlider value={severity} onChange={setSeverity} accent={C.plum} />}
      {hasDanger && <CrisisStrip />}
      <p style={cardSub}>
        These patterns help you and your doctor see the PMDD picture.
      </p>
    </article>
  );
}

function PmddManagementCard() {
  const STRATEGIES = [
    "What worked last cycle — write it here",
    "Calcium 1,200mg + Vitamin B6",
    "Lighter exercise · gentle yoga",
    "Cancel non-essential commitments",
  ];
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><ListChecks size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>WHAT WORKS FOR YOU</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today's PMDD plan</h3>
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        {STRATEGIES.map((s) => (
          <li key={s} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: C.espresso, lineHeight: 1.45 }}>
            <span style={{ width: 5, height: 5, borderRadius: 9999, background: C.sage, marginTop: 7, flexShrink: 0 }} />
            {s}
          </li>
        ))}
      </ul>
      <p style={{ ...cardSub, fontStyle: "italic", color: C.plum }}>
        Give yourself full permission to rest this week.
      </p>
    </article>
  );
}

function PmddJessCard() {
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Sparkles size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SUPPORT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>You are not alone in this</h3>
        </div>
      </div>
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        PMDD affects 3–8% of menstruating people. The intensity is real biology.
      </p>
      <button style={ctaLink}><MessageCircle size={11} /> Talk to Jess <ChevronRight size={11} /></button>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 3 }}>
        {["NAPS — naps.org.uk", "Vicious Cycle PMDD", "Mind 0300 123 3393"].map((r) => (
          <li key={r} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.espresso }}>
            <BookOpen size={10} style={{ color: C.gold }} /> {r}
          </li>
        ))}
      </ul>
      <CrisisStrip resources={["Samaritans 116 123 (24/7)", "SHOUT text 85258"]} />
    </article>
  );
}

export function PmddRow({ phase, cycleDay }) {
  return (
    <Row label="Your PMDD">
      <PmddPhaseCard phase={phase} cycleDay={cycleDay} />
      <PmddSymptomsCard />
      <PmddManagementCard />
      <PmddJessCard />
    </Row>
  );
}

// ─── PCOS ───────────────────────────────────────────────────────────────────

function PcosCycleCard() {
  const lastPeriod = "12 Apr";
  const avgCycle = 47;
  const range = "35–62";
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><TrendingUp size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>YOUR CYCLE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Average {avgCycle} days · range {range}</h3>
        </div>
      </div>
      <p style={cardSub}>
        Last period: {lastPeriod}. Next predicted between 17–28 May — wide range is honest with irregular cycles.
      </p>
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        Irregularity isn't failure. It's part of the PCOS picture.
      </p>
    </article>
  );
}

function PcosSymptomsCard() {
  const CHIPS = ["Acne", "Excess hair growth", "Hair thinning", "Weight changes", "Mood", "Fatigue", "Pelvic pain", "Bloating"];
  const [picked, setPicked] = useState([]);
  const [severity, setSeverity] = useState(0);
  function toggle(c) {
    setPicked((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>PCOS SYMPTOMS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today's check</h3>
        </div>
      </div>
      <ChipGrid chips={CHIPS} selected={picked} onToggle={toggle} accent={C.rose} />
      {picked.length > 0 && <SeveritySlider value={severity} onChange={setSeverity} accent={C.rose} />}
    </article>
  );
}

function PcosInsulinCard() {
  const [moved, setMoved] = useState(false);
  const [lowGi, setLowGi] = useState(false);
  const [inositol, setInositol] = useState(false);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Apple size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>INSULIN & LIFESTYLE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today's foundations</h3>
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        <ChecklistItem item={{ text: "Movement (30+ min)", done: moved }}      onToggle={() => setMoved(!moved)}      accent={C.sage} />
        <ChecklistItem item={{ text: "Low-GI meals today", done: lowGi }}      onToggle={() => setLowGi(!lowGi)}      accent={C.sage} />
        <ChecklistItem item={{ text: "Inositol / metformin taken", done: inositol }} onToggle={() => setInositol(!inositol)} accent={C.sage} />
      </ul>
      <p style={{ ...cardSub, fontStyle: "italic", color: C.sage }}>
        Movement is medicine for PCOS.
      </p>
    </article>
  );
}

function PcosFertilityCard() {
  const [opk, setOpk] = useState(null);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Sparkles size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>FERTILITY AWARENESS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>OPK is your friend</h3>
        </div>
      </div>
      <p style={cardSub}>
        With PCOS, LH strips are more reliable than calendar prediction.
      </p>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {["Negative", "Faint", "Peak", "Positive"].map((opt) => (
          <button key={opt} onClick={() => setOpk(opt)} style={{
            flex: 1, padding: "6px 8px", borderRadius: 9999,
            background: opk === opt ? `${C.gold}22` : "transparent",
            border: `1px solid ${opk === opt ? C.gold : "rgba(58,44,26,0.16)"}`,
            color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>{opt}</button>
        ))}
      </div>
      <button style={ctaLink}><Plus size={11} /> Log today's OPK <ChevronRight size={11} /></button>
    </article>
  );
}

export function PcosRow() {
  return (
    <Row label="Your PCOS">
      <PcosCycleCard />
      <PcosSymptomsCard />
      <PcosInsulinCard />
      <PcosFertilityCard />
    </Row>
  );
}

// ─── ENDOMETRIOSIS ──────────────────────────────────────────────────────────

const ENDO_ZONES = [
  { id: "z1", label: "Pelvis",   x: 50, y: 55, w: 24, h: 16 },
  { id: "z2", label: "L back",   x: 50, y: 38, w: 30, h: 14 },
  { id: "z3", label: "Legs",     x: 50, y: 78, w: 32, h: 18 },
  { id: "z4", label: "Abdomen",  x: 50, y: 30, w: 24, h: 14 },
  { id: "z5", label: "Bowel",    x: 50, y: 62, w: 20, h: 10 },
];

function EndoPainMapCard() {
  const [picked, setPicked] = useState([]);
  const [intensity, setIntensity] = useState(0);
  function toggle(id) {
    setPicked((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.rose}14`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Heart size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>PAIN MAP</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Where today?</h3>
        </div>
      </div>
      {/* Simple body silhouette with tappable zones. */}
      <svg viewBox="0 0 100 110" width="100%" height={150} style={{ marginTop: 4 }}>
        <ellipse cx={50} cy={12} rx={9} ry={11} fill="rgba(58,44,26,0.10)" />
        <rect x={42} y={22} width={16} height={6} rx={3} fill="rgba(58,44,26,0.10)" />
        <path d="M 30 28 L 70 28 L 78 75 L 22 75 Z" fill="rgba(58,44,26,0.08)" />
        <path d="M 30 75 L 38 110 L 46 110 L 46 75 Z M 54 75 L 54 110 L 62 110 L 70 75 Z" fill="rgba(58,44,26,0.08)" />
        {ENDO_ZONES.map((z) => (
          <g key={z.id} onClick={() => toggle(z.id)} style={{ cursor: "pointer" }}>
            <ellipse cx={z.x} cy={z.y} rx={z.w / 2} ry={z.h / 2}
              fill={picked.includes(z.id) ? C.rose : "transparent"}
              stroke={picked.includes(z.id) ? C.rose : "rgba(58,44,26,0.30)"}
              strokeWidth={1.2} opacity={picked.includes(z.id) ? 0.7 : 0.9} />
            <text x={z.x} y={z.y + 3} textAnchor="middle"
              fontSize={5} fill={picked.includes(z.id) ? "#fff" : C.espresso}
              fontFamily="Inter, sans-serif" fontWeight="600">{z.label}</text>
          </g>
        ))}
      </svg>
      <SeveritySlider value={intensity} onChange={setIntensity} max={10} accent={C.rose} label="Intensity" />
    </article>
  );
}

function EndoSymptomsCard() {
  const CHIPS = ["Pelvic pain", "Painful periods", "Pain during sex", "Bowel pain", "Bladder pain", "Fatigue", "Nausea", "Anxiety"];
  const [picked, setPicked] = useState([]);
  const [severity, setSeverity] = useState(0);
  function toggle(c) {
    setPicked((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>ENDO SYMPTOMS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today's log</h3>
        </div>
      </div>
      <ChipGrid chips={CHIPS} selected={picked} onToggle={toggle} accent={C.rose} />
      {picked.length > 0 && <SeveritySlider value={severity} onChange={setSeverity} max={5} accent={C.rose} />}
    </article>
  );
}

function EndoFlareCard() {
  const [inFlare, setInFlare] = useState(null);
  const [severity, setSeverity] = useState(0);
  const needsGp = severity >= 8;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.rose}14`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Flame size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>FLARE MANAGEMENT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Are you in a flare?</h3>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        {["Yes", "No"].map((opt) => (
          <button key={opt} onClick={() => setInFlare(opt)} style={{
            flex: 1, padding: "6px 8px", borderRadius: 9999,
            background: inFlare === opt ? (opt === "Yes" ? `${C.rose}22` : `${C.sage}22`) : "transparent",
            border: `1px solid ${inFlare === opt ? (opt === "Yes" ? C.rose : C.sage) : "rgba(58,44,26,0.16)"}`,
            color: C.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>{opt}</button>
        ))}
      </div>
      {inFlare === "Yes" && (
        <>
          <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "flex", flexDirection: "column", gap: 3 }}>
            {["Heat pad on", "Pain medication logged", "Rest — flare is not failure"].map((s) => (
              <li key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.espresso }}>
                <Check size={11} style={{ color: C.sage }} /> {s}
              </li>
            ))}
          </ul>
          <SeveritySlider value={severity} onChange={setSeverity} max={10} accent={C.rose} label="Pain" />
          {needsGp && (
            <div style={{
              marginTop: 6, padding: "6px 10px", borderRadius: 8,
              background: `${C.rose}14`, border: `1px solid ${C.rose}33`,
              fontSize: 11.5, color: C.espresso, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <AlertCircle size={12} style={{ color: C.rose }} /> Pain at 8+ — contact your GP today.
            </div>
          )}
        </>
      )}
    </article>
  );
}

function EndoJessCard() {
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Sparkles size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SUPPORT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Endo is exhausting and valid</h3>
        </div>
      </div>
      <p style={{ ...cardSub, fontStyle: "italic", color: C.plum }}>
        Living with endometriosis is real work. The diagnostic delay was not your fault.
      </p>
      <button style={ctaLink}><MessageCircle size={11} /> Talk to Jess <ChevronRight size={11} /></button>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 3 }}>
        <li style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.espresso }}>
          <BookOpen size={10} style={{ color: C.gold }} /> Endometriosis UK · 0808 808 2227
        </li>
      </ul>
    </article>
  );
}

export function EndoRow() {
  return (
    <Row label="Your endometriosis">
      <EndoPainMapCard />
      <EndoSymptomsCard />
      <EndoFlareCard />
      <EndoJessCard />
    </Row>
  );
}

// ─── FIBROIDS ───────────────────────────────────────────────────────────────

function FibroidsBleedingCard() {
  const FLOWS = ["Light", "Medium", "Heavy", "Very heavy", "Flooding"];
  const CLOTS = ["None", "Small", "Large"];
  const [flow, setFlow] = useState(null);
  const [clots, setClots] = useState(null);
  const dangerous = flow === "Very heavy" || flow === "Flooding" || clots === "Large";
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.rose}14`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Droplets size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>BLEEDING TODAY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Flow + clots</h3>
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted, marginBottom: 4 }}>FLOW</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {FLOWS.map((opt) => (
            <button key={opt} onClick={() => setFlow(opt)} style={{
              padding: "5px 10px", borderRadius: 9999,
              background: flow === opt ? `${C.rose}22` : "transparent",
              border: `1px solid ${flow === opt ? C.rose : "rgba(58,44,26,0.16)"}`,
              color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>{opt}</button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted, marginBottom: 4 }}>CLOTS</div>
        <div style={{ display: "flex", gap: 4 }}>
          {CLOTS.map((opt) => (
            <button key={opt} onClick={() => setClots(opt)} style={{
              flex: 1, padding: "5px 8px", borderRadius: 9999,
              background: clots === opt ? `${C.rose}22` : "transparent",
              border: `1px solid ${clots === opt ? C.rose : "rgba(58,44,26,0.16)"}`,
              color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>{opt}</button>
          ))}
        </div>
      </div>
      {dangerous && (
        <div style={{
          marginTop: 6, padding: "6px 10px", borderRadius: 8,
          background: `${C.rose}14`, border: `1px solid ${C.rose}33`,
          fontSize: 11.5, color: C.espresso, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <AlertCircle size={12} style={{ color: C.rose }} /> Very heavy bleeding — contact your GP.
        </div>
      )}
    </article>
  );
}

function FibroidsSymptomsCard() {
  const CHIPS = ["Pelvic pressure", "Bloating", "Frequent urination", "Back pain", "Pain during sex", "Fatigue"];
  const [picked, setPicked] = useState([]);
  const [severity, setSeverity] = useState(0);
  function toggle(c) {
    setPicked((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SYMPTOMS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today's log</h3>
        </div>
      </div>
      <ChipGrid chips={CHIPS} selected={picked} onToggle={toggle} accent={C.rose} />
      {picked.length > 0 && <SeveritySlider value={severity} onChange={setSeverity} accent={C.rose} />}
    </article>
  );
}

function FibroidsIronCard() {
  const [iron, setIron] = useState(false);
  const [ferritin, setFerritin] = useState("");
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Apple size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>IRON & NUTRITION</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Build iron back</h3>
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        <ChecklistItem item={{ text: "Iron supplement today", done: iron }} onToggle={() => setIron(!iron)} accent={C.sage} />
      </div>
      <p style={cardSub}>Iron-rich today · spinach · lentils · red meat · fortified cereal.</p>
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted, marginBottom: 4 }}>FERRITIN (ng/mL)</div>
        <input value={ferritin} onChange={(e) => setFerritin(e.target.value)} placeholder="last known"
          style={{ width: "100%", padding: "6px 10px", borderRadius: 9, border: "1px solid rgba(58,44,26,0.12)", background: C.cream, fontFamily: "inherit", fontSize: 12.5, color: C.espresso }} />
      </div>
    </article>
  );
}

function FibroidsMonitorCard() {
  const nextScan = "Mon 2 June";
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Stethoscope size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>MONITORING</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Next scan {nextScan}</h3>
        </div>
      </div>
      <p style={cardSub}>Track size + symptoms together so your GP sees the trend.</p>
      <button style={ctaLink}><Plus size={11} /> Log a scan result <ChevronRight size={11} /></button>
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        If pain or bleeding worsens — don&apos;t wait for the next appointment.
      </p>
    </article>
  );
}

export function FibroidsRow() {
  return (
    <Row label="Your fibroids">
      <FibroidsBleedingCard />
      <FibroidsSymptomsCard />
      <FibroidsIronCard />
      <FibroidsMonitorCard />
    </Row>
  );
}

// ─── THYROID ────────────────────────────────────────────────────────────────

function ThyroidMedsCard() {
  const [taken, setTaken] = useState(false);
  const [tsh, setTsh] = useState("");
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Pill size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>MEDICATION</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Levothyroxine · 75mcg</h3>
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        <ChecklistItem item={{ text: "Taken today on empty stomach", done: taken }} onToggle={() => setTaken(!taken)} accent={C.sage} />
      </div>
      <p style={cardSub}>30–60 min before food or coffee — absorption matters.</p>
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted, marginBottom: 4 }}>LAST TSH (mIU/L)</div>
        <input value={tsh} onChange={(e) => setTsh(e.target.value)} placeholder="e.g. 2.4"
          style={{ width: "100%", padding: "6px 10px", borderRadius: 9, border: "1px solid rgba(58,44,26,0.12)", background: C.cream, fontFamily: "inherit", fontSize: 12.5, color: C.espresso }} />
      </div>
    </article>
  );
}

function ThyroidSymptomsCard() {
  const CHIPS = ["Fatigue", "Brain fog", "Weight changes", "Hair loss", "Cold/heat intolerance", "Mood", "Constipation", "Heart palpitations", "Joint pain"];
  const [picked, setPicked] = useState([]);
  const [severity, setSeverity] = useState(0);
  function toggle(c) {
    setPicked((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SYMPTOMS TODAY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>What you&apos;re noticing</h3>
        </div>
      </div>
      <ChipGrid chips={CHIPS} selected={picked} onToggle={toggle} accent={C.rose} />
      {picked.length > 0 && <SeveritySlider value={severity} onChange={setSeverity} accent={C.rose} />}
    </article>
  );
}

function ThyroidEnergyCard() {
  const [rested, setRested] = useState(false);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Battery size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>ENERGY TODAY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Pace your hypothyroid energy</h3>
        </div>
      </div>
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        Thyroid fatigue isn&apos;t laziness. It&apos;s under-medication, biology, or both.
      </p>
      <div style={{ marginTop: 4 }}>
        <ChecklistItem item={{ text: "Rested when needed today", done: rested }} onToggle={() => setRested(!rested)} accent={C.sage} />
      </div>
      <p style={cardSub}>Phase-aware: late luteal + hypothyroid hits especially hard.</p>
    </article>
  );
}

function ThyroidTestCard() {
  const intervalMonths = 6;
  const due = 24;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.plum}14`, color: C.plum,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Stethoscope size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>BLOOD TESTS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Next TSH in {due} days</h3>
        </div>
      </div>
      <p style={cardSub}>Your interval: every {intervalMonths} months. Ask for free T3 + free T4 + antibodies, not just TSH.</p>
      <button style={ctaLink}><Plus size={11} /> Log result <ChevronRight size={11} /></button>
    </article>
  );
}

export function ThyroidRow() {
  return (
    <Row label="Your thyroid">
      <ThyroidMedsCard />
      <ThyroidSymptomsCard />
      <ThyroidEnergyCard />
      <ThyroidTestCard />
    </Row>
  );
}

// ─── ADENOMYOSIS ────────────────────────────────────────────────────────────

function AdenoPainBleedingCard() {
  const [pain, setPain] = useState(0);
  const [flow, setFlow] = useState(null);
  const FLOWS = ["Light", "Medium", "Heavy", "Very heavy"];
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.rose}14`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Heart size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>PAIN & BLEEDING</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today</h3>
        </div>
      </div>
      <SeveritySlider value={pain} onChange={setPain} max={10} accent={C.rose} label="Pain" />
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted, marginBottom: 4 }}>FLOW</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {FLOWS.map((opt) => (
            <button key={opt} onClick={() => setFlow(opt)} style={{
              padding: "5px 10px", borderRadius: 9999,
              background: flow === opt ? `${C.rose}22` : "transparent",
              border: `1px solid ${flow === opt ? C.rose : "rgba(58,44,26,0.16)"}`,
              color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>{opt}</button>
          ))}
        </div>
      </div>
    </article>
  );
}

function AdenoSymptomsCard() {
  const CHIPS = ["Painful periods", "Heavy bleeding", "Pelvic pressure", "Bloating", "Lower back pain", "Pain during sex", "Fatigue"];
  const [picked, setPicked] = useState([]);
  function toggle(c) {
    setPicked((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SYMPTOMS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today&apos;s check</h3>
        </div>
      </div>
      <ChipGrid chips={CHIPS} selected={picked} onToggle={toggle} accent={C.rose} />
    </article>
  );
}

function AdenoTreatmentCard() {
  const [hormonal, setHormonal] = useState(false);
  const [pain, setPain] = useState(false);
  const [heat, setHeat] = useState(false);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Pill size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>TREATMENT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today&apos;s management</h3>
        </div>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
        <ChecklistItem item={{ text: "Mirena / pill / GnRH",   done: hormonal }} onToggle={() => setHormonal(!hormonal)} accent={C.sage} />
        <ChecklistItem item={{ text: "Pain medication taken",  done: pain }}     onToggle={() => setPain(!pain)}         accent={C.sage} />
        <ChecklistItem item={{ text: "Heat therapy",           done: heat }}     onToggle={() => setHeat(!heat)}         accent={C.sage} />
      </ul>
    </article>
  );
}

function AdenoJessCard() {
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Sparkles size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SUPPORT</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Under-diagnosed, under-treated</h3>
        </div>
      </div>
      <p style={{ ...cardSub, fontStyle: "italic", color: C.plum }}>
        Adenomyosis is under-diagnosed and under-treated. Your pain is real.
      </p>
      <button style={ctaLink}><MessageCircle size={11} /> Talk to Jess <ChevronRight size={11} /></button>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 3 }}>
        <li style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.espresso }}>
          <BookOpen size={10} style={{ color: C.gold }} /> Adenomyosis Advice Association · UK
        </li>
      </ul>
    </article>
  );
}

export function AdenomyosisRow() {
  return (
    <Row label="Your adenomyosis">
      <AdenoPainBleedingCard />
      <AdenoSymptomsCard />
      <AdenoTreatmentCard />
      <AdenoJessCard />
    </Row>
  );
}

// ─── MENTAL HEALTH (Anxiety / Depression) ───────────────────────────────────

function MhMoodCheckCard() {
  const FREQ = ["Not at all", "Several days", "More than half", "Nearly every day"];
  const [down, setDown] = useState(null);
  const [anxious, setAnxious] = useState(null);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.plum}14`, color: C.plum,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Brain size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>WELLBEING CHECK-IN</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>This past week</h3>
        </div>
      </div>
      <p style={cardSub}>This is a wellness check-in, not a diagnosis.</p>
      {[
        { q: "Felt down or hopeless?", value: down,    set: setDown    },
        { q: "Felt anxious or on edge?", value: anxious, set: setAnxious },
      ].map((row) => (
        <div key={row.q} style={{ marginTop: 6 }}>
          <div style={{ fontSize: 11.5, color: C.espresso, marginBottom: 4 }}>{row.q}</div>
          <div style={{ display: "flex", gap: 4 }}>
            {FREQ.map((opt) => (
              <button key={opt} onClick={() => row.set(opt)} style={{
                flex: 1, padding: "5px 6px", borderRadius: 9999,
                background: row.value === opt ? `${C.plum}1A` : "transparent",
                border: `1px solid ${row.value === opt ? C.plum : "rgba(58,44,26,0.16)"}`,
                color: C.espresso, fontSize: 10, fontWeight: 600, cursor: "pointer",
              }}>{opt}</button>
            ))}
          </div>
        </div>
      ))}
    </article>
  );
}

function MhToolsCard() {
  const TOOLS = [
    { id: "breath", icon: Sun,           text: "Breathing exercise" },
    { id: "journ",  icon: BookOpen,      text: "Journal entry" },
    { id: "jess",   icon: MessageCircle, text: "Talk to Jess" },
    { id: "out",    icon: TrendingUp,    text: "Go outside (5 min)" },
    { id: "call",   icon: Phone,         text: "Call someone" },
    { id: "rest",   icon: MoonStar,      text: "Rest" },
  ];
  const [used, setUsed] = useState([]);
  function toggle(id) {
    setUsed((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Coffee size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>TODAY&apos;S TOOLS</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Small things count</h3>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4 }}>
        {TOOLS.map((t) => {
          const on = used.includes(t.id);
          const I = t.icon;
          return (
            <button key={t.id} onClick={() => toggle(t.id)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", borderRadius: 10,
              background: on ? `${C.sage}14` : C.cream,
              border: `1px solid ${on ? `${C.sage}33` : "rgba(58,44,26,0.06)"}`,
              color: C.espresso, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left",
            }}>
              <I size={13} style={{ color: on ? C.sage : C.muted }} />
              <span style={{ flex: 1 }}>{t.text}</span>
              {on && <Check size={11} style={{ color: C.sage }} />}
            </button>
          );
        })}
      </div>
    </article>
  );
}

function MhMedsTherapyCard() {
  const [taken, setTaken] = useState(false);
  const therapyDays = 5;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.sage}22`, color: C.sage,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Pill size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>MEDS & THERAPY</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today + this week</h3>
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        <ChecklistItem item={{ text: "Sertraline 50mg taken today", done: taken }} onToggle={() => setTaken(!taken)} accent={C.sage} />
      </div>
      <div style={{
        marginTop: 6, padding: "6px 10px", borderRadius: 10,
        background: C.cream, border: "1px solid rgba(58,44,26,0.06)",
      }}>
        <div style={{ fontSize: 10, color: C.goldDeep, fontWeight: 700, letterSpacing: "0.10em" }}>NEXT THERAPY</div>
        <div style={{ fontSize: 13, color: C.espresso, fontWeight: 600 }}>In {therapyDays} days</div>
      </div>
      <p style={cardSub}>Some SSRIs interact with hormonal cycles — note any pattern.</p>
    </article>
  );
}

function MhCrisisCard() {
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.rose}14`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Phone size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>STRUGGLING TODAY?</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>These are here for you</h3>
        </div>
      </div>
      <CrisisStrip resources={[
        "Samaritans · 116 123 (24/7, free)",
        "SHOUT · text 85258",
        "Mind helpline · 0300 123 3393",
        "NHS 111 — option 2 for mental health",
      ]} />
    </article>
  );
}

export function MentalHealthRow() {
  return (
    <Row label="Your mental health">
      <MhMoodCheckCard />
      <MhToolsCard />
      <MhMedsTherapyCard />
      <MhCrisisCard />
    </Row>
  );
}

// ─── CHRONIC FATIGUE / ME-CFS ───────────────────────────────────────────────

function EnergyEnvelopeCard() {
  const [budget, setBudget] = useState(0);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}22`, color: C.goldDeep,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Battery size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>ENERGY ENVELOPE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today&apos;s budget</h3>
        </div>
      </div>
      <SeveritySlider value={budget} onChange={setBudget} max={10} accent={C.gold} label="Energy 1–10" />
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        Avoid the boom-and-bust. Spend a little less than you have.
      </p>
      <p style={cardSub}>
        Suggested pacing: {budget <= 3 ? "Rest-only day" : budget <= 6 ? "Light tasks, no exertion" : "Gentle activity windows"}
      </p>
    </article>
  );
}

function ActivityLogCard() {
  const [note, setNote] = useState("");
  const [fatigue, setFatigue] = useState(0);
  const [crashing, setCrashing] = useState(null);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.blush}33`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>ACTIVITY LOG</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>What did your morning ask?</h3>
        </div>
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Brief — one line is enough" rows={2}
        style={{ width: "100%", padding: "6px 10px", marginTop: 4, borderRadius: 9, border: "1px solid rgba(58,44,26,0.12)", background: C.cream, fontFamily: "inherit", fontSize: 12.5, color: C.espresso, resize: "vertical", boxSizing: "border-box" }} />
      <SeveritySlider value={fatigue} onChange={setFatigue} max={10} accent={C.rose} label="Fatigue now" />
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted, marginBottom: 4 }}>ARE YOU CRASHING?</div>
        <div style={{ display: "flex", gap: 4 }}>
          {["Yes", "No"].map((opt) => (
            <button key={opt} onClick={() => setCrashing(opt)} style={{
              flex: 1, padding: "5px 8px", borderRadius: 9999,
              background: crashing === opt ? `${C.rose}22` : "transparent",
              border: `1px solid ${crashing === opt ? C.rose : "rgba(58,44,26,0.16)"}`,
              color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>{opt}</button>
          ))}
        </div>
      </div>
    </article>
  );
}

function RestPacingCard() {
  const [hoursTarget, setHoursTarget] = useState(4);
  const [sleepQual, setSleepQual] = useState(0);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.plum}14`, color: C.plum,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><MoonStar size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>REST & PACING</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Rest target {hoursTarget}h today</h3>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <button onClick={() => setHoursTarget((h) => Math.max(0, h - 1))} style={adjustBtn}>−</button>
        <button onClick={() => setHoursTarget((h) => h + 1)} style={{ ...adjustBtn, background: C.espresso, color: C.cream }}>+</button>
      </div>
      <p style={{ ...cardSub, fontStyle: "italic" }}>
        Rest is treatment, not laziness.
      </p>
      <SeveritySlider value={sleepQual} onChange={setSleepQual} accent={C.plum} label="Last night sleep 1–5" />
    </article>
  );
}

function MeFlareCard() {
  const [crash, setCrash] = useState(null);
  const [severity, setSeverity] = useState(0);
  const [trigger, setTrigger] = useState("");
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.rose}14`, color: C.rose,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Flame size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>FLARE LOG</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Is today a crash?</h3>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {["Yes", "No"].map((opt) => (
          <button key={opt} onClick={() => setCrash(opt)} style={{
            flex: 1, padding: "5px 8px", borderRadius: 9999,
            background: crash === opt ? (opt === "Yes" ? `${C.rose}22` : `${C.sage}22`) : "transparent",
            border: `1px solid ${crash === opt ? (opt === "Yes" ? C.rose : C.sage) : "rgba(58,44,26,0.16)"}`,
            color: C.espresso, fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}>{opt}</button>
        ))}
      </div>
      {crash === "Yes" && (
        <>
          <SeveritySlider value={severity} onChange={setSeverity} max={5} accent={C.rose} />
          <input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="Suspected trigger"
            style={{ width: "100%", marginTop: 6, padding: "6px 10px", borderRadius: 9, border: "1px solid rgba(58,44,26,0.12)", background: C.cream, fontFamily: "inherit", fontSize: 12.5, color: C.espresso, boxSizing: "border-box" }} />
        </>
      )}
      <button style={ctaLink}><BookOpen size={11} /> ME Association · meassociation.org.uk</button>
    </article>
  );
}

export function MeCfsRow() {
  return (
    <Row label="Your energy">
      <EnergyEnvelopeCard />
      <ActivityLogCard />
      <RestPacingCard />
      <MeFlareCard />
    </Row>
  );
}

// ─── Router ─────────────────────────────────────────────────────────────────
// v1: surface the FIRST matching condition only. Multi-condition stacking
// is a follow-up. Returns null when the user has no recognised condition.

const FIRST_MATCH_ORDER = [
  "pmdd",
  "pcos",
  "endo",
  "fibroids",
  "thyroid",
  "adenomyosis",
  "anxiety-depression",
  "me-cfs",
  "chronic-fatigue",
];

export default function ConditionRow({ profile, phase, cycleDay }) {
  const conditions = Array.isArray(profile?.conditions) ? profile.conditions : [];
  if (conditions.length === 0) return null;
  const first = FIRST_MATCH_ORDER.find((c) => conditions.includes(c));
  if (!first) return null;
  switch (first) {
    case "pmdd":              return <PmddRow phase={phase} cycleDay={cycleDay} />;
    case "pcos":              return <PcosRow />;
    case "endo":              return <EndoRow />;
    case "fibroids":          return <FibroidsRow />;
    case "thyroid":           return <ThyroidRow />;
    case "adenomyosis":       return <AdenomyosisRow />;
    case "anxiety-depression":return <MentalHealthRow />;
    case "me-cfs":
    case "chronic-fatigue":   return <MeCfsRow />;
    default:                  return null;
  }
}

const adjustBtn = {
  flex: 1, padding: "8px 0", borderRadius: 9999,
  background: C.cream, color: C.espresso,
  border: "1px solid rgba(58,44,26,0.15)",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 14, fontWeight: 700, cursor: "pointer",
};

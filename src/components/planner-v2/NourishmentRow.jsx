// NourishmentRow — Macro Tracker · Hydration · AI Meal Plan · Phase Recipes.
//
// Props:
//   macros { protein, carbs, fat, proteinTarget, ... }
//   hydration { glasses, target }
//   meals [{ label, text }] for AI plan
//   recipes [{ name, time, tone }]
//   phase

import React, { useState } from "react";
import { Droplets, Sparkles, Utensils, ChevronRight, Plus, X } from "lucide-react";
import Row from "./Row";
import { C, card, kicker, cardTitle, cardSub } from "./tokens";
import { openLogger } from "@/components/UniversalLogger";

function MacroRing({ value, target, tone }) {
  const R = 24, CIRC = 2 * Math.PI * R;
  const pct = Math.min(1, (value || 0) / (target || 1));
  return (
    <svg width={64} height={64} viewBox="0 0 64 64">
      <circle cx={32} cy={32} r={R} fill="none" stroke="rgba(58,44,26,0.10)" strokeWidth={5} />
      <circle cx={32} cy={32} r={R} fill="none" stroke={tone} strokeWidth={5}
        strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct)}
        transform="rotate(-90 32 32)" />
      <text x={32} y={36} textAnchor="middle" fontFamily="'Fraunces', Georgia, serif" fontSize={15} fontWeight="500" fill={C.espresso}>{value || 0}</text>
    </svg>
  );
}

function MacroTrackerCard({ macros = {} }) {
  const rows = [
    { label: "Protein", value: macros.protein, target: macros.proteinTarget || 80,  tone: C.sage,  unit: "g" },
    { label: "Carbs",   value: macros.carbs,   target: macros.carbsTarget   || 200, tone: C.gold,  unit: "g" },
    { label: "Fat",     value: macros.fat,     target: macros.fatTarget     || 65,  tone: C.blush, unit: "g" },
  ];
  return (
    <article style={card}>
      <span style={kicker}>MACRO TRACKER</span>
      <h3 style={cardTitle}>Today's plate</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 6 }}>
        {rows.map((m) => (
          <div key={m.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <MacroRing value={m.value} target={m.target} tone={m.tone} />
            <div style={{ fontSize: 11, fontWeight: 700, color: C.espresso }}>{m.value || 0}/{m.target}{m.unit}</div>
            <div style={{ fontSize: 9, letterSpacing: "0.10em", color: C.muted, fontWeight: 600, textTransform: "uppercase" }}>{m.label}</div>
          </div>
        ))}
      </div>
      <button onClick={() => openLogger("meal")} style={ctaLink}>
        Log a meal <ChevronRight size={12} />
      </button>
    </article>
  );
}

function HydrationCard({ hydration = {} }) {
  const target = hydration.target || 8;
  const [glasses, setGlasses] = useState(hydration.glasses ?? 5);
  return (
    <article style={card}>
      <span style={kicker}>HYDRATION</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
        <Droplets size={32} style={{ color: C.espresso, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 500, color: C.espresso, lineHeight: 1 }}>
            {glasses} <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>of {target} glasses</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
        {Array.from({ length: target }).map((_, i) => (
          <span key={i} style={{
            flex: 1, height: 22, borderRadius: 6,
            background: i < glasses ? "#60B4FA" : "rgba(58,44,26,0.08)",
            border: `1px solid ${i < glasses ? "#60B4FA" : "rgba(58,44,26,0.18)"}`,
            display: "inline-block",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button onClick={() => setGlasses((g) => Math.max(0, g - 1))} style={adjustBtn}>−</button>
        <button onClick={() => setGlasses((g) => Math.min(target, g + 1))} style={{ ...adjustBtn, background: C.espresso, color: C.cream }}>+</button>
      </div>
    </article>
  );
}

function AIMealPlanCard({ meals }) {
  const today = meals || [
    { label: "Breakfast", text: "Phase-aware suggestion ready" },
    { label: "Lunch",     text: "Iron-rich + anti-inflammatory" },
    { label: "Dinner",    text: "Warming + magnesium-rich" },
  ];
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={kicker}>AI MEAL PLAN</span>
        <span style={{ marginLeft: "auto", fontSize: 9, color: C.muted, fontStyle: "italic" }}>Powered by Jess</span>
      </div>
      <h3 style={cardTitle}>Today's plan <Sparkles size={14} style={{ color: C.gold, verticalAlign: -1 }} /></h3>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
        {today.map((m) => (
          <li key={m.label} style={{
            padding: "6px 10px", borderRadius: 10,
            background: C.cream, border: "1px solid rgba(58,44,26,0.05)",
            display: "flex", flexDirection: "column", gap: 2,
          }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: C.goldDeep, fontWeight: 700 }}>{m.label}</div>
            <div style={{ fontSize: 12, color: C.espresso, lineHeight: 1.4 }}>{m.text}</div>
          </li>
        ))}
      </ul>
      <button style={{ ...ctaLink, color: C.goldDeep }}>
        <Sparkles size={11} /> Regenerate <ChevronRight size={11} />
      </button>
    </article>
  );
}

function PhaseRecipesCard({ phase, recipes }) {
  const list = recipes || [
    { name: "Turmeric salmon", time: "20 min", tone: C.blush },
    { name: "Roasted root + lentil bowl", time: "30 min", tone: C.gold },
    { name: "Magnesium magic dahl", time: "25 min", tone: C.sage },
  ];
  return (
    <article style={card}>
      <span style={kicker}>PHASE RECIPES{phase ? ` · ${phase.toUpperCase()}` : ""}</span>
      <h3 style={cardTitle}>For your phase</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {list.map((r) => (
          <li key={r.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
            <span style={{
              width: 30, height: 30, borderRadius: 9999,
              background: `${r.tone}33`, color: r.tone,
              display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Utensils size={12} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.espresso, lineHeight: 1.2 }}>{r.name}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{r.time}</div>
            </div>
            <ChevronRight size={12} style={{ color: C.muted }} />
          </li>
        ))}
      </ul>
      <button style={ctaLink}>View all recipes <ChevronRight size={12} /></button>
    </article>
  );
}

const ctaLink = {
  alignSelf: "flex-start", marginTop: 4,
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none",
  color: C.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0,
};
const adjustBtn = {
  flex: 1, padding: "8px 0", borderRadius: 9999,
  background: C.paperHi, color: C.espresso,
  border: "1px solid rgba(58,44,26,0.15)",
  fontSize: 16, fontWeight: 700, cursor: "pointer",
};

function NourishmentRow({ macros, hydration, meals, recipes, phase }) {
  return (
    <Row label="Nourishment">
      <MacroTrackerCard macros={macros} />
      <HydrationCard hydration={hydration} />
      <AIMealPlanCard meals={meals} />
      <PhaseRecipesCard recipes={recipes} phase={phase} />
    </Row>
  );
}

export default React.memo(NourishmentRow);

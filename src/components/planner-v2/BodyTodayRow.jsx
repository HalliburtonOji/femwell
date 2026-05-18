// BodyTodayRow — three cards: Body Today (capacity ring) · Smart View ·
// Cycle Zone (or pregnancy variant). Stage-aware.
//
// Props:
//   phase, cycleDay, capacity (0-100), checkin {mood,energy,sleep},
//   smartBullets[], cycleZone {label,daysToNext,chips[]}, stage

import React from "react";
import { Calendar, ChevronRight } from "lucide-react";
import Row from "./Row";
import { C, PHASE_DEEP, PHASE_LIGHT, card, kicker, cardTitle, cardSub, bullet, bulletDot } from "./tokens";

function CapacityRing({ pct, tone }) {
  const R = 30, CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - pct / 100);
  return (
    <svg width={76} height={76} viewBox="0 0 76 76">
      <circle cx={38} cy={38} r={R} fill="none" stroke="rgba(58,44,26,0.10)" strokeWidth={6} />
      <circle cx={38} cy={38} r={R} fill="none" stroke={tone} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={CIRC} strokeDashoffset={offset} transform="rotate(-90 38 38)" />
      <text x={38} y={42} textAnchor="middle" fontFamily="'Fraunces', Georgia, serif" fontSize={22} fontWeight="500" fill={C.espresso}>{pct}</text>
    </svg>
  );
}

function BodyTodayCard({ phase, cycleDay, capacity }) {
  const tone = PHASE_LIGHT[phase] || C.gold;
  const toneDeep = PHASE_DEEP[phase] || C.goldDeep;
  return (
    <article style={card}>
      <span style={{
        ...kicker, display: "inline-flex", alignItems: "center", gap: 5,
        background: `${tone}1F`, color: toneDeep, border: `1px solid ${tone}55`,
        padding: "3px 9px", borderRadius: 9999, alignSelf: "flex-start",
        letterSpacing: "0.06em",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 9999, background: tone }} />
        {phase ? `${phase[0].toUpperCase()}${phase.slice(1)} Day ${cycleDay || 1}` : "Today"}
      </span>
      <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
        <CapacityRing pct={capacity ?? 60} tone={toneDeep} />
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500, color: C.espresso }}>
            Capacity
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" }}>
            {phase === "ovulatory" ? "Peak energy window" : phase === "luteal" ? "Settling rhythm" : "Today's window"}
          </div>
        </div>
      </div>
    </article>
  );
}

function SmartViewCard({ smartBullets }) {
  const bullets = smartBullets || [
    "What your body needs today",
    "Lower the bar where you can",
    "Magnesium + warm food tonight",
  ];
  return (
    <article style={card}>
      <span style={kicker}>SMART VIEW</span>
      <h3 style={cardTitle}>What your body needs today</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: "4px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
        {bullets.map((b, i) => (
          <li key={i} style={bullet}><span style={bulletDot} />{b}</li>
        ))}
      </ul>
    </article>
  );
}

function CycleZoneCard({ phase, cycleDay, cycleZone, onOpen }) {
  const tone = PHASE_DEEP[phase] || C.gold;
  return (
    <article style={{ ...card, padding: 0, overflow: "hidden" }}>
      <div style={{
        background: `linear-gradient(135deg, ${tone}22 0%, ${tone}08 100%)`,
        padding: "16px 14px 12px",
        borderBottom: `1px solid ${tone}33`,
      }}>
        <span style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 24, fontWeight: 500, color: C.espresso,
          letterSpacing: "-0.01em", lineHeight: 1.1,
        }}>{(phase || "today").toUpperCase()}</span>
        <p style={{ fontSize: 12, color: C.espresso, opacity: 0.7, margin: "4px 0 0" }}>
          Day {cycleDay || 1} of 28 · next phase in {cycleZone?.daysToNext ?? 4} days
        </p>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <span style={kicker}>PREDICTED TODAY</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
          {(cycleZone?.chips || ["Reflection sharpens", "Boundaries feel easy", "Inner autumn"]).map((c, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center",
              padding: "3px 9px", borderRadius: 9999,
              background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
              fontSize: 11, color: C.espresso, fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: tone, marginRight: 5 }} />
              {c}
            </span>
          ))}
        </div>
        {onOpen && (
          <button onClick={onOpen} style={{
            marginTop: 10,
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "transparent", color: C.espresso,
            border: "1px solid rgba(58,44,26,0.18)", borderRadius: 9999,
            padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}>
            Open cycle calendar <ChevronRight size={12} />
          </button>
        )}
      </div>
    </article>
  );
}

function PregnancyBodyCard({ stage, week }) {
  // T1/T2/T3 variant — replaces CycleZone when stage indicates pregnancy.
  const trimester = stage?.includes("t1") ? "First" : stage?.includes("t2") ? "Second" : "Third";
  return (
    <article style={{ ...card, padding: 0, overflow: "hidden" }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.sage}22 0%, ${C.sage}08 100%)`,
        padding: "16px 14px 12px", borderBottom: `1px solid ${C.sage}33`,
      }}>
        <span style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 22, fontWeight: 500, color: C.espresso, letterSpacing: "-0.01em",
        }}>{trimester} Trimester</span>
        {week && <p style={{ fontSize: 12, color: C.espresso, opacity: 0.7, margin: "4px 0 0" }}>Week {week}</p>}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <span style={kicker}>JOURNEY · TODAY</span>
        <p style={cardSub}>Cycle tracking is paused while you're pregnant.</p>
      </div>
    </article>
  );
}

function BodyTodayRow({
  phase = "luteal", cycleDay = 25, capacity = 55,
  checkin, smartBullets, cycleZone, stage,
  onOpenCycle,
}) {
  const isPregnant = stage && stage.startsWith("pregnant");
  return (
    <Row label="Your body today">
      <BodyTodayCard phase={phase} cycleDay={cycleDay} capacity={capacity} />
      <SmartViewCard smartBullets={smartBullets} />
      {isPregnant
        ? <PregnancyBodyCard stage={stage} week={checkin?.pregnancyWeek} />
        : <CycleZoneCard phase={phase} cycleDay={cycleDay} cycleZone={cycleZone} onOpen={onOpenCycle} />}
    </Row>
  );
}

export default React.memo(BodyTodayRow);

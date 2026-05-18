// ScheduleCycleRow — Schedule preview + Cycle preview cards. Tap either
// card to open a full overlay. Cycle card mounts the production
// MonthRibbon so the demo and the real Planner stay in lock-step.
//
// Props:
//   events             upcoming schedule blocks
//   phase, cycleDay
//   userProfile        passed straight to MonthRibbon
//   onOpenSchedule()
//   onOpenCycle()

import React from "react";
import { Activity, Calendar, Maximize2, ChevronRight } from "lucide-react";
import Row from "./Row";
import MonthRibbon from "@/components/planner/cycle/MonthRibbon";
import { C, PHASE_DEEP, card, kicker, cardTitle, cardSub } from "./tokens";

function SchedulePreviewCard({ events = [], onOpen }) {
  const upcoming = (events || []).filter((b) => !b.done).slice(0, 3);
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}1F`, color: C.gold,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SCHEDULE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today, hour by hour</h3>
        </div>
        {onOpen && (
          <button onClick={onOpen} style={expandBtn} aria-label="Expand schedule">
            <Maximize2 size={13} />
          </button>
        )}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
        {upcoming.length === 0 && (
          <li style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>No events scheduled yet today.</li>
        )}
        {upcoming.map((b) => (
          <li key={b.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 10px", borderRadius: 10,
            background: "rgba(58,44,26,0.07)",
            borderLeft: "3px solid " + C.espresso,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, minWidth: 38 }}>
              {b.hour <= 12 ? b.hour : b.hour - 12}{b.hour < 12 ? "am" : "pm"}
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: C.espresso, fontWeight: 600 }}>
              {b.title}
            </span>
            {b.duration && <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{b.duration}m</span>}
          </li>
        ))}
      </ul>
      {onOpen && (
        <button onClick={onOpen} style={openFullBtn}>
          View full schedule <ChevronRight size={12} />
        </button>
      )}
    </article>
  );
}

function CyclePreviewCard({ phase, cycleDay, userProfile, onOpen }) {
  const tone = PHASE_DEEP[phase] || C.gold;
  return (
    <article style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${tone}1F`, color: tone,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Calendar size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>CYCLE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>
            {phase ? `${phase[0].toUpperCase()}${phase.slice(1)} week` : "This cycle"}
          </h3>
        </div>
        {onOpen && (
          <button onClick={onOpen} style={expandBtn} aria-label="Expand calendar">
            <Maximize2 size={13} />
          </button>
        )}
      </div>
      {/* Production MonthRibbon — same component the real Planner mounts. */}
      <div style={{ marginTop: 6 }}>
        <MonthRibbon profile={userProfile || {}} habitLogs={[]} onNavigateToToday={() => onOpen?.()} />
      </div>
      {cycleDay && <p style={cardSub}>Day {cycleDay} of {userProfile?.cycle_avg_length || 28}</p>}
    </article>
  );
}

const expandBtn = {
  width: 26, height: 26, borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  color: C.espresso, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};
const openFullBtn = {
  alignSelf: "flex-start", marginTop: 6,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 9999,
  background: "transparent", color: C.espresso,
  border: "1px solid rgba(58,44,26,0.18)",
  fontSize: 11, fontWeight: 700, cursor: "pointer",
};

function ScheduleCycleRow({ events, phase, cycleDay, userProfile, onOpenSchedule, onOpenCycle }) {
  return (
    <Row label="Schedule & cycle">
      <SchedulePreviewCard events={events} onOpen={onOpenSchedule} />
      <CyclePreviewCard phase={phase} cycleDay={cycleDay} userProfile={userProfile} onOpen={onOpenCycle} />
    </Row>
  );
}

export default React.memo(ScheduleCycleRow);

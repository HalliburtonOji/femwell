// ScheduleCycleRow — Schedule + Cycle cards, COMPACT by default with
// tap-to-expand. The Cycle card mounts the production MonthRibbon when
// expanded so the demo and real Planner stay in lock-step.
//
// Props:
//   events             upcoming schedule blocks
//   phase, cycleDay
//   userProfile        passed to MonthRibbon when expanded

import React, { useState } from "react";
import { Activity, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import Row from "./Row";
import MonthRibbon from "@/components/planner/cycle/MonthRibbon";
import { C, PHASE_DEEP, card, kicker, cardTitle, cardSub } from "./tokens";

const COLLAPSED_HEIGHT = 96;

function fmtHour(h) {
  return `${h <= 12 ? h : h - 12}${h < 12 ? "am" : "pm"}`;
}

function SchedulePreviewCard({ events = [] }) {
  const [expanded, setExpanded] = useState(false);
  const upcoming = (events || []).filter((b) => !b.done);
  const nextOne = upcoming[0];
  const expandedList = upcoming.slice(0, 6);

  return (
    <article style={{
      ...card,
      minHeight: expanded ? undefined : COLLAPSED_HEIGHT,
      transition: "min-height 0.2s ease",
    }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse schedule" : "Expand schedule"}
        style={{
          background: "transparent", border: "none", padding: 0,
          width: "100%", cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${C.gold}1F`, color: C.gold,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}><Activity size={13} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={kicker}>SCHEDULE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today, hour by hour</h3>
        </div>
        <span style={chevronBtn}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {!expanded && (
        nextOne ? (
          <p style={{ ...cardSub, margin: "8px 0 0" }}>
            Next · <strong style={{ color: C.espresso, fontWeight: 700 }}>{fmtHour(nextOne.hour)}</strong> {nextOne.title}
          </p>
        ) : (
          <p style={{ ...cardSub, margin: "8px 0 0", fontStyle: "italic" }}>
            No events scheduled yet today.
          </p>
        )
      )}

      {expanded && (
        <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
          {expandedList.length === 0 && (
            <li style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>No events scheduled yet today.</li>
          )}
          {expandedList.map((b) => (
            <li key={b.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 10px", borderRadius: 10,
              background: "rgba(58,44,26,0.07)",
              borderLeft: "3px solid " + C.espresso,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, minWidth: 38 }}>
                {fmtHour(b.hour)}
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: C.espresso, fontWeight: 600 }}>
                {b.title}
              </span>
              {b.duration && <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{b.duration}m</span>}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function CyclePreviewCard({ phase, cycleDay, userProfile }) {
  const [expanded, setExpanded] = useState(false);
  const tone = PHASE_DEEP[phase] || C.gold;
  const phaseLabel = phase ? `${phase[0].toUpperCase()}${phase.slice(1)} week` : "This cycle";

  return (
    <article style={{
      ...card,
      minHeight: expanded ? undefined : COLLAPSED_HEIGHT,
      transition: "min-height 0.2s ease",
    }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse calendar" : "Expand calendar"}
        style={{
          background: "transparent", border: "none", padding: 0,
          width: "100%", cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <span style={{
          width: 28, height: 28, borderRadius: 9,
          background: `${tone}1F`, color: tone,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}><Calendar size={13} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={kicker}>CYCLE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{phaseLabel}</h3>
        </div>
        <span style={chevronBtn}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {!expanded && cycleDay && (
        <p style={{ ...cardSub, margin: "8px 0 0" }}>
          Day <strong style={{ color: C.espresso, fontWeight: 700 }}>{cycleDay}</strong> of {userProfile?.cycle_avg_length || 28}
        </p>
      )}
      {!expanded && !cycleDay && (
        <p style={{ ...cardSub, margin: "8px 0 0", fontStyle: "italic" }}>
          Tap to open the calendar.
        </p>
      )}

      {expanded && (
        <>
          <div style={{ marginTop: 8 }}>
            <MonthRibbon profile={userProfile || {}} habitLogs={[]} onNavigateToToday={() => setExpanded(false)} />
          </div>
          {cycleDay && (
            <p style={cardSub}>Day {cycleDay} of {userProfile?.cycle_avg_length || 28}</p>
          )}
        </>
      )}
    </article>
  );
}

const chevronBtn = {
  width: 26, height: 26, borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  color: C.espresso,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  padding: 0, flexShrink: 0,
};

function ScheduleCycleRow({ events, phase, cycleDay, userProfile }) {
  return (
    <Row label="Schedule & cycle">
      <SchedulePreviewCard events={events} />
      <CyclePreviewCard phase={phase} cycleDay={cycleDay} userProfile={userProfile} />
    </Row>
  );
}

export default React.memo(ScheduleCycleRow);

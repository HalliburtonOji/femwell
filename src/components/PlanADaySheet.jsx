// ─────────────────────────────────────────────────────────────────────────────
// PlanADaySheet — bottom-sheet orchestrator for the "Plan a day" pill on
// the Planner Today tab. Renders the day picker (step 0) first, then routes
// to one of two flows:
//   · Today → MorningBrief (the 7-card morning ritual session)
//   · Future date → DayBlueprint (4-card phase-aware blueprint)
//
// This component owns the shared state (selectedDate, flow) so the
// MorningBrief / DayBlueprint children stay decoupled from the picker.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Calendar, ArrowRight, X, Sparkles, Sun } from "lucide-react";
import MorningBrief from "@/components/MorningBrief";
import DayBlueprint from "@/components/DayBlueprint";

const T = {
  cream:    "#F4EDDB",
  paper:    "#F4EFE3",
  espresso: "#3A2C1A",
  blush:    "#E8B4B8",
  blushSoft:"rgba(232,180,184,0.18)",
  sage:     "#8FAF8F",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
};

function todayISO() {
  return new Date().toISOString().split("T")[0];
}
function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function PlanADaySheet({ profile, onClose, onComplete }) {
  // flow states: 'pick' (initial), 'today' (MorningBrief), 'future' (DayBlueprint)
  const [flow, setFlow] = useState("pick");
  const [targetDate, setTargetDate] = useState(tomorrowISO());

  if (flow === "today") {
    return (
      <MorningBrief
        onClose={onClose}
        onComplete={onComplete}
      />
    );
  }
  if (flow === "future") {
    return (
      <DayBlueprint
        targetDateISO={targetDate}
        profile={profile}
        onClose={onClose}
        onComplete={(payload) => {
          if (typeof onComplete === "function") onComplete(payload);
        }}
      />
    );
  }

  // Picker step
  return (
    <div style={shell}>
      <div style={topRow}>
        <p style={eyebrow}>PLAN A DAY</p>
        {typeof onClose === "function" && (
          <button onClick={onClose} aria-label="Close" style={closeBtn}>
            <X size={13} />
          </button>
        )}
      </div>
      <div style={card}>
        <div style={iconBubble}>
          <Calendar size={18} style={{ color: T.gold }} />
        </div>
        <h2 style={title}>Which day are you planning?</h2>
        <p style={lead}>
          Pick today for the full 90-second Morning Brief — or a future date for a phase-aware blueprint (intentions + self-care defaults seeded from the predicted phase).
        </p>

        <button onClick={() => setFlow("today")} style={todayBtn}>
          <div style={btnIcon}><Sparkles size={14} style={{ color: T.cream }} /></div>
          <div style={btnText}>
            <div style={btnTitle}>Today</div>
            <div style={btnSub}>7-card Morning Brief · sleep, mood, anchors, captures, rhythm</div>
          </div>
          <ArrowRight size={14} style={{ color: T.cream }} />
        </button>

        <button onClick={() => setFlow("future")} style={futureBtn}>
          <div style={{ ...btnIcon, background: T.cream, border: `1px solid ${T.gold}66` }}>
            <Sun size={14} style={{ color: T.gold }} />
          </div>
          <div style={btnText}>
            <div style={{ ...btnTitle, color: T.espresso }}>A future day</div>
            <div style={{ ...btnSub, color: T.muted }}>4-card Day Blueprint · predict phase, set intentions, protect energy</div>
          </div>
          <ArrowRight size={14} style={{ color: T.muted }} />
        </button>

        <label style={dateLabel}>
          <span style={dateLabelText}>Date</span>
          <input
            type="date"
            value={targetDate}
            min={todayISO()}
            onChange={(e) => setTargetDate(e.target.value)}
            style={dateInput}
          />
        </label>

        <p style={wire}>
          The day picker is step 0 of the same sheet — pick a date, then run the matching flow. Both flows write to PlannerItems with the chosen date.
        </p>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const shell = {
  background: T.cream,
  borderRadius: 20,
  padding: "12px 14px 18px",
  maxWidth: 560, margin: "0 auto",
  fontFamily: "'Inter', system-ui, sans-serif",
};
const topRow = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  marginBottom: 10,
};
const eyebrow = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.16em",
  color: T.muted, textTransform: "uppercase", margin: 0,
};
const closeBtn = {
  width: 26, height: 26, borderRadius: 9999,
  background: T.paper, border: "1px solid rgba(58,44,26,0.15)",
  color: T.muted, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const card = {
  background: T.paper,
  borderRadius: 18,
  padding: "22px 22px 18px",
  boxShadow: "0 2px 12px rgba(58,44,26,0.10)",
  borderTop: `3px solid ${T.gold}`,
};
const iconBubble = {
  width: 44, height: 44, borderRadius: 14,
  background: `${T.gold}1F`, border: `1px solid ${T.gold}66`,
  display: "flex", alignItems: "center", justifyContent: "center",
  marginBottom: 10,
};
const title = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 24, fontWeight: 500, color: T.espresso,
  letterSpacing: "-0.01em", margin: "0 0 8px", lineHeight: 1.25,
};
const lead = {
  fontSize: 14, color: T.espresso, lineHeight: 1.55,
  margin: "0 0 14px",
};
const todayBtn = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 12,
  padding: "12px 14px", borderRadius: 14,
  background: T.espresso, color: T.cream,
  border: `1.5px solid ${T.espresso}`,
  cursor: "pointer", textAlign: "left",
  marginBottom: 10,
};
const futureBtn = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 12,
  padding: "12px 14px", borderRadius: 14,
  background: "transparent", color: T.espresso,
  border: `1.5px solid rgba(58,44,26,0.18)`,
  cursor: "pointer", textAlign: "left",
};
const btnIcon = {
  width: 30, height: 30, borderRadius: 10,
  background: "rgba(232,180,184,0.30)",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const btnText = { flex: 1, minWidth: 0 };
const btnTitle = { fontSize: 14, fontWeight: 700, color: T.cream, lineHeight: 1.2 };
const btnSub = { fontSize: 11, color: "rgba(244,237,219,0.7)", marginTop: 3, lineHeight: 1.35 };

const dateLabel = {
  display: "flex", alignItems: "center", gap: 10,
  marginTop: 12, padding: "8px 12px", borderRadius: 12,
  background: T.cream, border: "1px solid rgba(58,44,26,0.10)",
};
const dateLabelText = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
  color: T.muted, textTransform: "uppercase",
};
const dateInput = {
  flex: 1, padding: "5px 8px", borderRadius: 8,
  background: T.paper, color: T.espresso,
  border: "1px solid rgba(58,44,26,0.15)",
  fontSize: 13, fontFamily: "inherit", outline: "none",
};

const wire = {
  fontSize: 10, color: T.muted, fontStyle: "italic", lineHeight: 1.5,
  padding: "8px 10px", margin: "12px 0 0",
  borderRadius: 8, background: T.cream, border: "1px dashed rgba(58,44,26,0.10)",
};

// ─────────────────────────────────────────────────────────────────────────────
// BodyStrip — collapsible wrapper around PillarsDeck (the 2×3 body summary
// grid). Collapsed by default: a single-line icon strip showing today's
// values in one row. Expanded: the full PillarsDeck the Planner already
// uses, untouched. State persisted in localStorage so the user's choice
// sticks across sessions.
//
// Founder feedback 2026-05-18: the 2×3 grid takes too much vertical space.
// Make it a strip with a chevron; full grid available on demand.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import {
  Moon, Zap, Heart, Droplets, Footprints, CircleDot,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import PillarsDeck from "./PillarsDeck";

const STORAGE_KEY = "femwell_body_strip_expanded";

// Phase derivation helper — same math as Planner.jsx + Today.jsx use so the
// "Day N" the strip shows matches the rest of the page. Returns the cycle
// day (1-based) or "—" when there's no last_period_start_date yet.
function cycleDayFor(profile) {
  const last = profile?.last_period_start_date;
  if (!last) return "—";
  try {
    const cycleLen = profile?.cycle_avg_length || 28;
    const diff = differenceInDays(new Date(), parseISO(last));
    if (diff < 0) return "—";
    return (diff % cycleLen) + 1;
  } catch { return "—"; }
}

export default function BodyStrip({ profile, today, plannerConfig, summary }) {
  const [expanded, setExpanded] = useState(() => {
    try {
      const v = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
      return v === "1";
    } catch { return false; }
  });

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, expanded ? "1" : "0"); } catch {}
  }, [expanded]);

  // Compact one-line values. `summary` is an optional prop that the caller
  // (Planner.jsx) can pass with today's actual logged values. Falls back to
  // sensible placeholders when not provided.
  const cells = useMemo(() => {
    const s = summary || {};
    return [
      { id: "sleep",     Icon: Moon,       label: "Sleep",     value: s.sleep      != null ? `${s.sleep}h`     : "—",     tone: "#4A2A3A" },
      { id: "energy",    Icon: Zap,        label: "Energy",    value: s.energy     != null ? `${s.energy}%`    : "—",     tone: "#A6862B" },
      { id: "mood",      Icon: Heart,      label: "Mood",      value: s.mood       != null ? `${s.mood}%`      : "—",     tone: "#D45E52" },
      { id: "hydration", Icon: Droplets,   label: "Hydration", value: s.hydration  != null ? `${s.hydration}/${s.hydrationTarget || 8}` : "—", tone: "#60B4FA" },
      { id: "movement",  Icon: Footprints, label: "Movement",  value: s.movement   != null ? `${s.movement}m`  : "—",     tone: "#6B8F5A" },
      { id: "cycle",     Icon: CircleDot,  label: "Cycle",     value: `Day ${cycleDayFor(profile)}`,                       tone: "#9A2845" },
    ];
  }, [summary, profile]);

  return (
    <section aria-label="Body summary strip" style={wrap}>
      {expanded ? (
        <>
          <div style={expandedHead}>
            <span style={eyebrow}>YOUR BODY · TODAY</span>
            <button onClick={() => setExpanded(false)} style={chevBtn} aria-label="Collapse body summary">
              <ChevronUp size={14} /> Hide
            </button>
          </div>
          <PillarsDeck profile={profile} today={today} plannerConfig={plannerConfig} />
        </>
      ) : (
        <button onClick={() => setExpanded(true)} style={collapsedBtn} aria-label="Expand body summary">
          <div style={cellRow}>
            {cells.map((c) => {
              const Icon = c.Icon;
              return (
                <span key={c.id} style={cell}>
                  <span style={{ ...cellIcon, background: `${c.tone}1F`, color: c.tone }}>
                    <Icon size={11} />
                  </span>
                  <span style={cellValue}>{c.value}</span>
                </span>
              );
            })}
          </div>
          <ChevronDown size={14} style={{ color: "var(--plum-mute, #8A7584)", flexShrink: 0 }} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}

const wrap = { marginTop: 4, marginBottom: 10 };
const expandedHead = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "0 2px 6px",
};
const eyebrow = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
  color: "var(--plum-mute, #8A7584)",
};
const chevBtn = {
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none", cursor: "pointer",
  fontSize: 11, fontWeight: 600,
  color: "var(--plum-mute, #8A7584)",
};
const collapsedBtn = {
  width: "100%",
  display: "flex", alignItems: "center", gap: 10,
  padding: "9px 12px",
  background: "var(--surface)",
  border: "1px solid rgba(74,42,58,0.10)",
  borderRadius: 14,
  boxShadow: "0 2px 8px rgba(74,42,58,0.04)",
  cursor: "pointer", textAlign: "left",
};
const cellRow = {
  flex: 1, minWidth: 0,
  display: "flex", alignItems: "center", gap: 12,
  overflowX: "auto", whiteSpace: "nowrap",
  scrollbarWidth: "none",
};
const cell = {
  display: "inline-flex", alignItems: "center", gap: 5,
  flexShrink: 0,
};
const cellIcon = {
  width: 18, height: 18, borderRadius: 6,
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const cellValue = {
  fontSize: 12, fontWeight: 700,
  color: "var(--plum, #4A2A3A)",
};

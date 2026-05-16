// ─────────────────────────────────────────────────────────────────────────────
// SymptomRibbon — replaces MonthRibbon on the Cycle (renamed "Patterns") tab
// when plannerConfig.ribbonType === 'symptom' (perimenopause + menopause).
//
// Renders the last 30 days as a horizontal strip. Each day cell is colour-
// coded by hot-flush count from MenopauseDailyLog:
//   0 hot flushes      → calm sage    (#6B8F5A @ low alpha)
//   1-2 hot flushes    → warm amber   (#C8A040)
//   3+ hot flushes     → hot rose-red (#D45E52)
// A night-sweat marker (small espresso dot) overlays cells with night_sweats >= 1.
// Empty cells are grey (no log yet). Today's cell pulses gently.
//
// "Log today" quick-tap button opens the existing /CycleSettings page where
// the user can write a MenopauseDailyLog row (the Track page handles writes).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus } from "lucide-react";

const DAYS_BACK = 30;

function toISODate(d) {
  return new Date(d).toISOString().split("T")[0];
}

function dateRangeLastN(n, today) {
  const out = [];
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(t);
    d.setDate(t.getDate() - i);
    out.push({ date: d, iso: toISODate(d) });
  }
  return out;
}

// Bucket a hot-flush count into one of three intensity bands.
function intensityForCount(count) {
  if (count == null || count === undefined) return "empty";
  const n = Number(count);
  if (!Number.isFinite(n) || n < 0) return "empty";
  if (n === 0) return "calm";
  if (n <= 2) return "warm";
  return "hot";
}

const COLORS = {
  empty: "rgba(58,44,26,0.06)",
  calm:  "rgba(107,143,90,0.55)",   // sage tint
  warm:  "rgba(200,160,64,0.85)",   // amber
  hot:   "rgba(212,94,82,0.92)",    // rose-red
  border: "rgba(58,44,26,0.10)",
  today: "#3A2C1A",
  espresso: "#3A2C1A",
  espressoMid: "#6B5840",
  goldDeep: "#A6862B",
  plum: "#4A2A3A",
};

const PHASE_DOT = {
  calm: "#6B8F5A",
  warm: "#C8A040",
  hot:  "#D45E52",
};

export default function SymptomRibbon({ profile, today, onLogToday }) {
  const [logs, setLogs] = useState(null);
  const days = useMemo(() => dateRangeLastN(DAYS_BACK, today || new Date()), [today]);

  useEffect(() => {
    if (!profile?.user_id) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.MenopauseDailyLog.filter(
          { user_id: profile.user_id },
          "-date",
          DAYS_BACK + 5,
        );
        if (!cancelled) setLogs(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setLogs([]);
      }
    })();
    return () => { cancelled = true; };
  }, [profile?.user_id]);

  const todayISO = useMemo(() => toISODate(today || new Date()), [today]);

  // Index logs by date for O(1) lookup.
  const logByDate = useMemo(() => {
    const m = new Map();
    for (const r of (logs || [])) {
      if (r?.date) m.set(r.date, r);
    }
    return m;
  }, [logs]);

  // Aggregate counts for the summary line.
  const summary = useMemo(() => {
    const allCounts = days.map((d) => logByDate.get(d.iso)?.hot_flashes).filter((v) => v != null);
    if (allCounts.length === 0) return null;
    const totalFlushes = allCounts.reduce((a, b) => a + Number(b || 0), 0);
    const daysWithData = allCounts.length;
    const avgPerDay = (totalFlushes / daysWithData).toFixed(1);
    const nightSweatDays = days.filter((d) => {
      const v = logByDate.get(d.iso)?.night_sweats;
      return v != null && Number(v) >= 1;
    }).length;
    return { totalFlushes, daysWithData, avgPerDay, nightSweatDays };
  }, [days, logByDate]);

  const loading = logs === null;

  return (
    <section
      aria-label="Symptom ribbon — last 30 days of hot flushes and night sweats"
      style={wrap}
    >
      <style>{`
        @keyframes symptom-today-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
        @media (prefers-reduced-motion: reduce) {
          .symptom-today-marker { animation: none; opacity: 0.9; }
        }
      `}</style>

      <header style={headRow}>
        <div>
          <div style={eyebrow}>LAST 30 DAYS · SYMPTOM PATTERN</div>
          <h2 style={titleStyle}>Your symptom ribbon</h2>
        </div>
        <button
          type="button"
          onClick={() => onLogToday && onLogToday()}
          aria-label="Log today's symptoms"
          style={logBtn}
        >
          <Plus size={14} strokeWidth={2.2} />
          <span>Log today</span>
        </button>
      </header>

      {loading ? (
        <div style={emptyHint}>Loading your symptom history…</div>
      ) : (
        <>
          {/* Day-cell strip */}
          <div role="list" aria-label="30 day symptom cells" style={cellsRow}>
            {days.map((d) => {
              const log = logByDate.get(d.iso);
              const intensity = intensityForCount(log?.hot_flashes);
              const nightSweats = Number(log?.night_sweats || 0);
              const isToday = d.iso === todayISO;
              return (
                <div
                  key={d.iso}
                  role="listitem"
                  title={`${d.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${log?.hot_flashes ?? "no log"} hot flush${(log?.hot_flashes || 0) === 1 ? "" : "es"}${nightSweats ? `, ${nightSweats} night sweat${nightSweats === 1 ? "" : "s"}` : ""}`}
                  style={{
                    ...cellStyle,
                    background: COLORS[intensity],
                    borderColor: isToday ? COLORS.today : COLORS.border,
                    borderWidth: isToday ? 1.5 : 0.5,
                  }}
                >
                  {nightSweats > 0 && (
                    <span aria-hidden="true" style={nightDot} />
                  )}
                  {isToday && (
                    <span
                      aria-hidden="true"
                      className="symptom-today-marker"
                      style={{
                        ...todayMarker,
                        animation: "symptom-today-pulse 2s ease-in-out infinite",
                        background: PHASE_DOT[intensity === "empty" ? "calm" : intensity],
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={legendRow}>
            <span style={legendItem}>
              <span style={{ ...legendChip, background: COLORS.calm }} />
              <span>calm</span>
            </span>
            <span style={legendItem}>
              <span style={{ ...legendChip, background: COLORS.warm }} />
              <span>1-2 flushes</span>
            </span>
            <span style={legendItem}>
              <span style={{ ...legendChip, background: COLORS.hot }} />
              <span>3+ flushes</span>
            </span>
            <span style={legendItem}>
              <span style={{ ...legendChip, background: "transparent", border: `1px solid ${COLORS.espressoMid}` }}>
                <span style={{ ...nightDot, position: "static", marginLeft: 4, marginTop: 3 }} />
              </span>
              <span>night sweat</span>
            </span>
          </div>

          {/* Summary line */}
          {summary && summary.daysWithData > 0 && (
            <p style={summaryLine}>
              <strong style={{ color: COLORS.espresso }}>
                {summary.avgPerDay} flush{summary.avgPerDay === "1.0" ? "" : "es"}/day
              </strong>{" "}
              average over {summary.daysWithData} logged day{summary.daysWithData === 1 ? "" : "s"}
              {summary.nightSweatDays > 0
                ? `, ${summary.nightSweatDays} with night sweat${summary.nightSweatDays === 1 ? "" : "s"}.`
                : "."}
            </p>
          )}
          {(!summary || summary.daysWithData === 0) && (
            <p style={emptyHint}>
              No symptoms logged yet. Tap <strong style={{ color: COLORS.plum }}>Log today</strong> to start the pattern — the ribbon needs a few days to read.
            </p>
          )}
        </>
      )}
    </section>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const wrap = {
  background: "#FBF6E6",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 16,
  padding: "16px 14px",
  marginBottom: 14,
};
const headRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 12,
  marginBottom: 12,
};
const eyebrow = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "#A6862B",
  textTransform: "uppercase",
};
const titleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 18,
  fontWeight: 500,
  color: "#3A2C1A",
  fontStyle: "italic",
  margin: "2px 0 0",
  letterSpacing: "-0.01em",
};
const logBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "7px 12px",
  background: "#3A2C1A",
  color: "#F4EDDB",
  border: "none",
  borderRadius: 9999,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.04em",
  cursor: "pointer",
  flexShrink: 0,
};
const cellsRow = {
  display: "grid",
  gridTemplateColumns: "repeat(30, 1fr)",
  gap: 2,
  marginBottom: 10,
};
const cellStyle = {
  position: "relative",
  aspectRatio: "1",
  borderRadius: 3,
  borderStyle: "solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const nightDot = {
  position: "absolute",
  top: 2,
  right: 2,
  width: 4,
  height: 4,
  borderRadius: 9999,
  background: "#3A2C1A",
};
const todayMarker = {
  position: "absolute",
  bottom: 2,
  left: "50%",
  transform: "translateX(-50%)",
  width: 4,
  height: 4,
  borderRadius: 9999,
};
const legendRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 8,
};
const legendItem = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 10.5,
  color: "#6B5840",
};
const legendChip = {
  width: 12,
  height: 12,
  borderRadius: 2,
  display: "inline-block",
  position: "relative",
};
const summaryLine = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 12,
  color: "#6B5840",
  lineHeight: 1.4,
  margin: 0,
};
const emptyHint = {
  fontFamily: "Georgia, serif",
  fontStyle: "italic",
  fontSize: 12.5,
  color: "#4A2A3A",
  lineHeight: 1.5,
  margin: 0,
};

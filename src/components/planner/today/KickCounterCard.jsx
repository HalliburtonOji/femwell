// ─────────────────────────────────────────────────────────────────────────────
// KickCounterCard — Trimester 2 + 3 kick counter.
// Build 3 of the pregnancy feature set. Extended Sprint 4 BUILD 3 with a
// 'Today / History' tab toggle that renders a 7-day bar chart of total
// kicks per day (sage bars, --femwell-muted day labels, "No data" empty).
//
// Props:
//   userId  (string) — current user's id
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { format, subDays } from "date-fns";
import { Footprints } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TODAY = format(new Date(), "yyyy-MM-dd");

function fmtTime(isoStr) {
  try {
    return new Date(isoStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoStr;
  }
}

function calcDurationMinutes(startIso) {
  const diff = Date.now() - new Date(startIso).getTime();
  return Math.max(1, Math.round(diff / 60000));
}

export default function KickCounterCard({ userId }) {
  const [sessions, setSessions]     = useState([]);
  const [weekRows, setWeekRows]     = useState([]); // last-7-day rows for the chart
  const [loading, setLoading]       = useState(true);
  const [inSession, setInSession]   = useState(false);
  const [sessionStart, setSessionStart] = useState(null); // ISO string
  const [kickCount, setKickCount]   = useState(0);
  const [saving, setSaving]         = useState(false);
  const [view, setView]             = useState("today"); // 'today' | 'history'
  // Live timer display
  const [elapsed, setElapsed]       = useState(0); // seconds
  const timerRef                    = useRef(null);

  const loadSessions = useCallback(async () => {
    if (!userId) return;
    try {
      // Today's sessions for the "Today's sessions" list.
      const todayRows = await base44.entities.KickLog.filter(
        { user_id: userId, date: TODAY },
        "-session_start",
        20,
      );
      setSessions(todayRows);
      // Last 7 calendar days for the History chart.
      const cutoff = format(subDays(new Date(), 6), "yyyy-MM-dd");
      const wkRows = await base44.entities.KickLog.filter(
        { user_id: userId },
        "-date",
        80,
      );
      setWeekRows((Array.isArray(wkRows) ? wkRows : []).filter((r) => r?.date >= cutoff));
    } catch {
      setSessions([]);
      setWeekRows([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Tick timer while session active
  useEffect(() => {
    if (inSession && sessionStart) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [inSession, sessionStart]);

  const handleStart = () => {
    const now = new Date().toISOString();
    setSessionStart(now);
    setKickCount(0);
    setElapsed(0);
    setInSession(true);
  };

  const handleKick = () => {
    if (!inSession) return;
    setKickCount((n) => n + 1);
  };

  const handleDone = async () => {
    if (!userId || !sessionStart || saving) return;
    setSaving(true);
    try {
      await base44.entities.KickLog.create({
        user_id: userId,
        date: TODAY,
        session_start: sessionStart,
        kick_count: kickCount,
        duration_minutes: calcDurationMinutes(sessionStart),
      });
      setInSession(false);
      setSessionStart(null);
      setKickCount(0);
      setElapsed(0);
      loadSessions(); // background refetch — don't gate the UI on the read
    } finally {
      setSaving(false);
    }
  };

  const elapsedLabel = () => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // 7-day series: oldest left, today right. Total kicks per day across sessions.
  const weekSeries = useMemo(() => {
    const today = new Date();
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const iso = format(d, "yyyy-MM-dd");
      const rows = weekRows.filter((r) => r?.date === iso);
      const total = rows.reduce((sum, r) => sum + (Number(r?.kick_count) || 0), 0);
      out.push({
        iso,
        dayLabel: format(d, "EEEEE"), // single-letter weekday
        total,
        isToday: iso === TODAY,
      });
    }
    return out;
  }, [weekRows]);

  return (
    <section style={card} aria-label="Kick counter">
      {/* Header */}
      <p style={eyebrow}>KICK COUNTER · TRIMESTER 2-3</p>
      <p style={title}>Count your baby's movements</p>

      {/* Today / History toggle */}
      <div role="tablist" aria-label="View" style={tabRow}>
        {[
          { key: "today",   label: "Today" },
          { key: "history", label: "History · 7 days" },
        ].map((t) => {
          const on = view === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={on}
              onClick={() => setView(t.key)}
              style={{
                ...tabBtn,
                background: on ? "#3A2C1A" : "transparent",
                color: on ? "#F4EDDB" : "#3A2C1A",
                borderColor: on ? "#3A2C1A" : "rgba(58,44,26,0.16)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {view === "today" && (
        <>
          {/* Main counter area */}
          <div style={counterArea}>
            {inSession ? (
              <>
                {/* Big tap button */}
                <button
                  onClick={handleKick}
                  style={kickBtn}
                  aria-label={`Count kick — currently ${kickCount}`}
                >
                  <Footprints size={26} strokeWidth={1.6} color="#3A2C1A" aria-hidden="true" />
                  <span style={kickNum}>{kickCount}</span>
                  <span style={kickLabel}>kicks</span>
                </button>
                <p style={timerText}>{elapsedLabel()} elapsed</p>
                {/* Done button */}
                <button
                  onClick={handleDone}
                  disabled={saving}
                  style={{ ...doneBtn, opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? "Saving..." : "Done — end session"}
                </button>
              </>
            ) : (
              <button onClick={handleStart} style={startBtn}>
                Start session
              </button>
            )}
          </div>

          {/* Today's sessions */}
          {!loading && sessions.length > 0 && (
            <div style={sessionsList}>
              <p style={sessionsLabel}>Today's sessions</p>
              {sessions.map((s) => (
                <div key={s.id} style={sessionRow}>
                  <span style={sessionTime}>{fmtTime(s.session_start)}</span>
                  <span style={sessionKicks}>{s.kick_count} kicks</span>
                  {s.duration_minutes && (
                    <span style={sessionDur}>{s.duration_minutes} min</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === "history" && (
        <KickWeekChart series={weekSeries} loading={loading} />
      )}

      {/* NHS signpost — visible in both views */}
      <p style={nhsNote}>
        If you notice fewer than 10 movements in 2 hours, contact your midwife.
      </p>
    </section>
  );
}

// ─── KickWeekChart — 7-day bar chart, pure SVG ──────────────────────────────
function KickWeekChart({ series, loading }) {
  const W = 280;
  const H = 130;
  const PAD_X = 18;
  const PAD_TOP = 14;
  const PAD_BOTTOM = 26;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const colCount = series.length || 1;
  const colWidth = innerW / colCount;
  const barWidth = Math.max(10, colWidth * 0.6);

  const maxTotal = Math.max(10, ...series.map((d) => d.total)); // floor at 10 so a 1-kick day doesn't fill the chart

  const yFor = (v) => PAD_TOP + (1 - v / maxTotal) * innerH;
  const xFor = (i) => PAD_X + colWidth * i + (colWidth - barWidth) / 2;

  const total7 = series.reduce((sum, d) => sum + d.total, 0);
  const hasAny = total7 > 0;

  return (
    <div style={chartWrap} aria-label="Last 7 days kick history">
      <div style={chartHeadRow}>
        <p style={chartEyebrow}>LAST 7 DAYS · TOTAL KICKS</p>
        <p style={chartTotal}>{hasAny ? `${total7} total` : "No data"}</p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Bar chart of kicks per day over the last 7 days"
        style={chartSvg}
      >
        {/* Horizontal baseline */}
        <line
          x1={PAD_X} x2={W - PAD_X}
          y1={H - PAD_BOTTOM} y2={H - PAD_BOTTOM}
          stroke="rgba(58,44,26,0.16)" strokeWidth="0.8"
        />
        {/* Bars */}
        {series.map((d, i) => {
          const x = xFor(i);
          const barH = d.total > 0 ? Math.max(2, innerH - (yFor(d.total) - PAD_TOP)) : 0;
          const y = H - PAD_BOTTOM - barH;
          return (
            <g key={d.iso}>
              {d.total > 0 ? (
                <rect
                  x={x} y={y}
                  width={barWidth} height={barH}
                  rx={3}
                  fill="#8FAF8F"
                  opacity={d.isToday ? 1 : 0.85}
                  stroke={d.isToday ? "#3F6228" : "transparent"}
                  strokeWidth={d.isToday ? 0.8 : 0}
                />
              ) : (
                // Empty-day placeholder: faint dashed cap at the baseline.
                <line
                  x1={x + barWidth * 0.18}
                  x2={x + barWidth * 0.82}
                  y1={H - PAD_BOTTOM - 1}
                  y2={H - PAD_BOTTOM - 1}
                  stroke="rgba(155,139,122,0.55)"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />
              )}
              {/* Bar value label */}
              {d.total > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 3}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="#3F6228"
                >{d.total}</text>
              )}
              {/* X-axis day label */}
              <text
                x={x + barWidth / 2}
                y={H - 10}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight={d.isToday ? "700" : "500"}
                fill={d.isToday ? "#3A2C1A" : "#9B8B7A"}
              >{d.dayLabel}</text>
            </g>
          );
        })}
      </svg>
      {loading && (
        <p style={chartLoadingNote}>Loading week…</p>
      )}
      {!loading && !hasAny && (
        <p style={chartEmpty}>
          No sessions logged this week. Tap <strong>Today</strong> to start one.
        </p>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const card = {
  background: "#F4EDDB",
  border: "1px solid rgba(58,44,26,0.12)",
  borderLeft: "3px solid #E8B4B8",
  borderRadius: 14,
  padding: "16px 16px 14px",
  marginBottom: 12,
  maxWidth: 390,
};
const eyebrow = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "#C48A8C",
  textTransform: "uppercase",
  margin: 0,
};
const title = {
  fontSize: 18,
  fontWeight: 500,
  color: "#3A2C1A",
  margin: "4px 0 12px",
};
const tabRow = {
  display: "flex",
  gap: 6,
  marginBottom: 12,
};
const tabBtn = {
  padding: "5px 12px",
  borderRadius: 9999,
  border: "1px solid",
  fontSize: 11.5,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.02em",
};
const counterArea = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  padding: "8px 0 16px",
};
const kickBtn = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  width: 130,
  height: 130,
  borderRadius: "50%",
  background: "linear-gradient(145deg, #E8B4B8, #daa0a4)",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(232,180,184,0.45)",
  transition: "transform 80ms",
  WebkitTapHighlightColor: "transparent",
  userSelect: "none",
};
const kickNum = {
  fontSize: 38,
  fontWeight: 600,
  color: "#3A2C1A",
  lineHeight: 1,
};
const kickLabel = {
  fontSize: 11,
  fontWeight: 700,
  color: "#3A2C1A",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};
const timerText = {
  fontSize: 12,
  color: "#6B5840",
  margin: 0,
};
const startBtn = {
  padding: "14px 36px",
  borderRadius: 9999,
  background: "#E8B4B8",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
  color: "#3A2C1A",
  boxShadow: "0 4px 14px rgba(232,180,184,0.40)",
};
const doneBtn = {
  padding: "12px 28px",
  borderRadius: 9999,
  background: "#8FAF8F",
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  color: "#FFFFFF",
  boxShadow: "0 4px 12px rgba(143,175,143,0.40)",
  transition: "opacity 120ms",
};
const sessionsList = {
  borderTop: "1px solid rgba(58,44,26,0.10)",
  paddingTop: 12,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 12,
};
const sessionsLabel = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  color: "#6B5840",
  textTransform: "uppercase",
  margin: "0 0 4px",
};
const sessionRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.08)",
  borderRadius: 8,
  padding: "8px 12px",
};
const sessionTime = {
  fontSize: 12,
  fontWeight: 600,
  color: "#3A2C1A",
  minWidth: 40,
};
const sessionKicks = {
  fontSize: 12,
  fontWeight: 700,
  color: "#C48A8C",
  flex: 1,
};
const sessionDur = {
  fontSize: 11,
  color: "#6B5840",
};
const nhsNote = {
  fontSize: 11.5,
  color: "#6B5840",
  fontStyle: "italic",
  lineHeight: 1.5,
  margin: "8px 0 0",
  padding: "8px 10px",
  background: "rgba(58,44,26,0.05)",
  borderRadius: 8,
};
const chartWrap = {
  marginTop: 4,
  marginBottom: 12,
  padding: "10px 10px 6px",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 12,
};
const chartHeadRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  padding: "0 2px",
  marginBottom: 4,
};
const chartEyebrow = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.16em",
  color: "#3F6228",
  textTransform: "uppercase",
  margin: 0,
};
const chartTotal = {
  fontSize: 11,
  fontWeight: 700,
  color: "#3A2C1A",
  margin: 0,
};
const chartSvg = {
  width: "100%",
  height: "auto",
  display: "block",
};
const chartLoadingNote = {
  fontSize: 11,
  color: "#9B8B7A",
  fontStyle: "italic",
  textAlign: "center",
  margin: "4px 0 0",
};
const chartEmpty = {
  fontSize: 11.5,
  color: "#9B8B7A",
  fontStyle: "italic",
  textAlign: "center",
  margin: "6px 0 0",
};

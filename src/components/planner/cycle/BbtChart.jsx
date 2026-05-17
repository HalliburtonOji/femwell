// ─────────────────────────────────────────────────────────────────────────────
// BbtChart — 14-day BBT sparkline, inline SVG, no external chart lib.
// Self-fetches from BbtLog entity. Accepts `userId` and `refreshKey` props.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { format, subDays } from "date-fns";
import { base44 } from "@/api/base44Client";

const Y_MIN = 36.0;
const Y_MAX = 37.5;
const REF_LINE = 36.7;
const SVG_H = 80;
const PAD = { top: 8, bottom: 8, left: 4, right: 4 };

function tempToY(temp) {
  const clamped = Math.max(Y_MIN, Math.min(Y_MAX, temp));
  const ratio = (clamped - Y_MIN) / (Y_MAX - Y_MIN);
  // High temp = low Y (SVG y=0 is top)
  return PAD.top + (1 - ratio) * (SVG_H - PAD.top - PAD.bottom);
}

export default function BbtChart({ userId, refreshKey }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetch14 = async () => {
      try {
        const cutoff = format(subDays(new Date(), 13), "yyyy-MM-dd");
        const rows = await base44.entities.BbtLog.filter(
          { user_id: userId },
          "-date",
          14,
        );
        setLogs(rows.filter((r) => r.date >= cutoff));
      } catch {
        // Entity may not exist yet — show empty state silently
        setLogs([]);
      }
    };
    fetch14();
  }, [userId, refreshKey]);

  // Build 14-slot day array (oldest left, today right)
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = subDays(today, 13 - i);
      const dayStr = format(d, "yyyy-MM-dd");
      const log = logs.find((r) => r.date === dayStr);
      return { dayStr, temp: log?.temp_celsius ?? null, x: i };
    });
  }, [logs]);

  const points = days.filter((d) => d.temp != null);
  const hasData = points.length >= 2;

  return (
    <div style={wrap} aria-label="14-day BBT chart">
      <p style={eyebrow}>BBT · LAST 14 DAYS</p>

      <svg
        width="100%"
        viewBox={`0 0 280 ${SVG_H}`}
        preserveAspectRatio="none"
        style={{ display: "block", background: "#F4EDDB", borderRadius: 8 }}
        aria-hidden={!hasData}
      >
        {/* Reference line at 36.7 °C */}
        {(() => {
          const ry = tempToY(REF_LINE);
          return (
            <line
              x1={PAD.left}
              y1={ry}
              x2={280 - PAD.right}
              y2={ry}
              stroke="#9B8B7A"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          );
        })()}

        {hasData && (() => {
          // Map day index (0–13) to SVG x coordinate
          const xOf = (idx) => PAD.left + (idx / 13) * (280 - PAD.left - PAD.right);

          const polyPoints = points
            .map((p) => `${xOf(p.x).toFixed(1)},${tempToY(p.temp).toFixed(1)}`)
            .join(" ");

          return (
            <>
              <polyline
                points={polyPoints}
                fill="none"
                stroke="#3A2C1A"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              {points.map((p) => (
                <circle
                  key={p.dayStr}
                  cx={xOf(p.x).toFixed(1)}
                  cy={tempToY(p.temp).toFixed(1)}
                  r={3}
                  fill="#8FAF8F"
                  stroke="#3A2C1A"
                  strokeWidth={1}
                />
              ))}
            </>
          );
        })()}

        {!hasData && (
          <text
            x="140"
            y={SVG_H / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Inter, sans-serif"
            fontSize="10"
            fontStyle="italic"
            fill="#9B8B7A"
          >
            Keep logging — your BBT pattern will appear here
          </text>
        )}
      </svg>

      <p style={note}>Dashed line = 36.70 °C reference (coverline may vary)</p>
    </div>
  );
}

const wrap = {
  marginTop: 14,
  padding: "10px 10px 6px",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 12,
};
const eyebrow = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "#3F6228",
  textTransform: "uppercase",
  margin: "0 0 6px",
};
const note = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9.5,
  color: "#9A8A78",
  fontStyle: "italic",
  margin: "4px 0 0",
  textAlign: "center",
};
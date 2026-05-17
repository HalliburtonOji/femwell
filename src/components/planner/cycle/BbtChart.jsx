// ─────────────────────────────────────────────────────────────────────────────
// BbtChart — 14-day BBT sparkline, inline SVG, no external chart lib.
// Self-fetches from BbtLog entity. Accepts `userId`, `refreshKey`, and
// optional `profile` so we can compute cycle-day-at-crossing for the
// coverline insight.
//
// Coverline insight (Sprint 4 BUILD 1):
//   When the user has >= 5 days of BBT data AND >= 3 readings above 36.7°C,
//   the dashed reference line renders in --femwell-blush (#E8B4B8) and a
//   small label below the chart says:
//     "Coverline crossed on CD <n>"
//   where <n> is the cycle day of the FIRST reading >= 36.7°C in the window,
//   derived from profile.last_period_start_date + cycle_avg_length.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { format, subDays } from "date-fns";
import { base44 } from "@/api/base44Client";

const Y_MIN = 36.0;
const Y_MAX = 37.5;
const COVERLINE = 36.7;
const SVG_H = 80;
const PAD = { top: 8, bottom: 8, left: 4, right: 4 };

// --femwell-* token mirrors
const COLOUR_MUTED  = "#9B8B7A";
const COLOUR_BLUSH  = "#E8B4B8";
const COLOUR_ESPRESSO = "#3A2C1A";
const COLOUR_SAGE   = "#8FAF8F";
// Sprint 5 BUILD 2 — gold accent for the LH-peak reference line.
const COLOUR_GOLD   = "#D4AF37";

function tempToY(temp) {
  const clamped = Math.max(Y_MIN, Math.min(Y_MAX, temp));
  const ratio = (clamped - Y_MIN) / (Y_MAX - Y_MIN);
  // High temp = low Y (SVG y=0 is top)
  return PAD.top + (1 - ratio) * (SVG_H - PAD.top - PAD.bottom);
}

// Compute the cycle day of a given ISO date string given profile cycle info.
// Returns null if we don't have enough info or the date is before the last
// period start.
function cycleDayFor(isoDate, profile) {
  const lastStart = profile?.last_period_start_date;
  if (!lastStart || !isoDate) return null;
  const avg = Number(profile?.cycle_avg_length) > 0 ? Number(profile.cycle_avg_length) : 28;
  try {
    const ms = new Date(isoDate).getTime() - new Date(lastStart).getTime();
    if (!Number.isFinite(ms) || ms < 0) return null;
    const diffDays = Math.floor(ms / (1000 * 60 * 60 * 24));
    // Within the most recent cycle window — CD is 1-indexed.
    return (diffDays % avg) + 1;
  } catch {
    return null;
  }
}

export default function BbtChart({ userId, refreshKey, profile }) {
  const [logs, setLogs] = useState([]);
  const [opkLogs, setOpkLogs] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const cutoff = format(subDays(new Date(), 13), "yyyy-MM-dd");
    const fetch14 = async () => {
      try {
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
      // Sprint 5 BUILD 2 — pull the same 14-day OPK window so we can render
      // a gold reference line for the most recent 'peak' result. Graceful
      // entity-missing fallback mirrors the BbtLog path.
      try {
        const opkRows = await base44.entities.OpkLog.filter(
          { user_id: userId },
          "-date",
          30,
        );
        setOpkLogs((Array.isArray(opkRows) ? opkRows : []).filter((r) => r?.date >= cutoff));
      } catch {
        setOpkLogs([]);
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

  // Sprint 5 BUILD 2 — most recent 'peak' OPK within the chart window.
  // Returns the day index (0–13) that matches the OPK row's date so we can
  // draw a gold vertical reference line + 'LH Peak' label at that column.
  const lhPeak = useMemo(() => {
    if (!Array.isArray(opkLogs) || opkLogs.length === 0) return null;
    // Filter to peak results, then pick the most recent by date.
    const peaks = opkLogs
      .filter((r) => typeof r?.result === "string" && r.result.toLowerCase() === "peak")
      .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
    if (peaks.length === 0) return null;
    const recent = peaks[0];
    const idx = days.findIndex((d) => d.dayStr === recent.date);
    if (idx < 0) return null;
    // Cycle day at the peak — for the label tooltip.
    const cd = cycleDayFor(recent.date, profile);
    return { idx, date: recent.date, cd };
  }, [opkLogs, days, profile]);

  // ── Coverline insight (Sprint 4 BUILD 1) ────────────────────────────────
  // Conditions: >= 5 logged days in window AND >= 3 readings above 36.7°C.
  // Find the FIRST reading (chronologically earliest) at or above 36.7 °C —
  // that's the day the user "crossed" the coverline.
  const coverlineCrossed = useMemo(() => {
    if (points.length < 5) return null;
    const aboveCount = points.filter((p) => p.temp >= COVERLINE).length;
    if (aboveCount < 3) return null;
    // points are in chronological order (oldest left) because `days` is
    // and `points` is filter()ed from it.
    const firstAbove = points.find((p) => p.temp >= COVERLINE);
    if (!firstAbove) return null;
    return {
      day: firstAbove.dayStr,
      cd: cycleDayFor(firstAbove.dayStr, profile),
    };
  }, [points, profile]);

  const coverlineColour = coverlineCrossed ? COLOUR_BLUSH : COLOUR_MUTED;

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
        {/* Coverline reference at 36.7 °C — turns blush when the user has
            crossed it, muted otherwise. */}
        {(() => {
          const ry = tempToY(COVERLINE);
          return (
            <>
              <line
                x1={PAD.left}
                y1={ry}
                x2={280 - PAD.right}
                y2={ry}
                stroke={coverlineColour}
                strokeWidth={coverlineCrossed ? 1.4 : 1}
                strokeDasharray="4 3"
              />
              {coverlineCrossed && (
                <text
                  x={280 - PAD.right - 2}
                  y={ry - 3}
                  textAnchor="end"
                  fontFamily="Inter, sans-serif"
                  fontSize="9"
                  fontWeight="700"
                  fill={COLOUR_BLUSH}
                  style={{ letterSpacing: "0.08em" }}
                >36.7°</text>
              )}
            </>
          );
        })()}

        {/* Sprint 5 BUILD 2 — LH peak reference line. Vertical gold dashed
            line at the day of the most recent 'peak' OPK in the window,
            with an 'LH Peak' label above the chart. */}
        {lhPeak && (() => {
          const xPeak = PAD.left + (lhPeak.idx / 13) * (280 - PAD.left - PAD.right);
          return (
            <>
              <line
                x1={xPeak}
                x2={xPeak}
                y1={PAD.top - 2}
                y2={SVG_H - PAD.bottom + 2}
                stroke={COLOUR_GOLD}
                strokeWidth={1.2}
                strokeDasharray="4 2"
              />
              <text
                x={xPeak}
                y={PAD.top + 6}
                textAnchor="middle"
                dominantBaseline="hanging"
                fontFamily="Inter, sans-serif"
                fontSize="8.5"
                fontWeight="700"
                fill={COLOUR_GOLD}
                style={{ letterSpacing: "0.10em" }}
              >LH Peak{lhPeak.cd ? ` · CD ${lhPeak.cd}` : ""}</text>
            </>
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
                stroke={COLOUR_ESPRESSO}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              {points.map((p) => (
                <circle
                  key={p.dayStr}
                  cx={xOf(p.x).toFixed(1)}
                  cy={tempToY(p.temp).toFixed(1)}
                  r={3}
                  fill={p.temp >= COVERLINE ? COLOUR_BLUSH : COLOUR_SAGE}
                  stroke={COLOUR_ESPRESSO}
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
            fill={COLOUR_MUTED}
          >
            Keep logging — your BBT pattern will appear here
          </text>
        )}
      </svg>

      {coverlineCrossed ? (
        <p style={{ ...note, color: COLOUR_BLUSH, fontWeight: 600, fontStyle: "normal" }}>
          Coverline crossed
          {coverlineCrossed.cd ? ` on CD ${coverlineCrossed.cd}` : ""}
          {" · "}<span style={{ color: COLOUR_MUTED, fontWeight: 400, fontStyle: "italic" }}>
            sustained shift suggests post-ovulation
          </span>
        </p>
      ) : (
        <p style={note}>Dashed line = 36.70 °C coverline (your number may vary)</p>
      )}
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

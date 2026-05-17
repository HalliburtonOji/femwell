// ─────────────────────────────────────────────────────────────────────────────
// BbtChart — 14-day BBT temperature sparkline for TTC mode.
// Rendered inside FertileWindowCard below the 7-day strip.
// Uses Recharts LineChart (already installed).
// OPK results are overlaid as coloured dots on the x-axis.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, Dot,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";

// OPK result → dot fill colour.
const OPK_DOT_COLOR = {
  peak:     "#E11D74",
  high:     "#D47A5A",
  low:      "#C4A86A",
  negative: "#9CA3AF",
};

// Custom dot that overlays OPK result colour.
function BbtDot(props) {
  const { cx, cy, payload } = props;
  if (!payload?.bbt || !Number.isFinite(cy)) return null;
  const fill = payload.opk_color || "#6B8F5A";
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill={fill}
      stroke="#FBF6E6"
      strokeWidth={1.5}
    />
  );
}

function BbtTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={tooltipStyle}>
      <p style={{ margin: 0, fontWeight: 700 }}>{d.label}</p>
      {d.bbt != null && (
        <p style={{ margin: "2px 0 0", color: "#3F6228" }}>
          BBT {d.bbt.toFixed(2)} °C
        </p>
      )}
      {d.opk_label && (
        <p style={{ margin: "2px 0 0", color: d.opk_color || "#6B5840" }}>
          OPK: {d.opk_label}
        </p>
      )}
    </div>
  );
}

export default function BbtChart({ logs }) {
  // Build 14-day data array (oldest first).
  const data = useMemo(() => {
    const today = new Date();
    const points = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const dayStr = format(d, "yyyy-MM-dd");
      const log = logs?.find((l) => l.date === dayStr);
      const bbt = log?.bbt_celsius ?? null;
      const opk = log?.lh_result ?? null;
      points.push({
        label: format(d, "d MMM"),
        dayStr,
        bbt: bbt != null ? parseFloat(bbt.toFixed(2)) : null,
        opk_label: opk && opk !== "not_tested" ? opk : null,
        opk_color: OPK_DOT_COLOR[opk] || null,
      });
    }
    return points;
  }, [logs]);

  // Y-axis domain: clamp around the data range (±0.3 °C headroom).
  const yDomain = useMemo(() => {
    const vals = data.map((d) => d.bbt).filter((v) => v != null);
    if (!vals.length) return [36.0, 37.2];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return [
      parseFloat((min - 0.15).toFixed(2)),
      parseFloat((max + 0.15).toFixed(2)),
    ];
  }, [data]);

  const hasAnyBbt = data.some((d) => d.bbt != null);
  if (!hasAnyBbt) return null;

  return (
    <div style={chartWrap} aria-label="14-day BBT chart">
      <p style={chartEyebrow}>BBT · LAST 14 DAYS</p>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: -16 }}>
          <XAxis
            dataKey="label"
            tick={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fill: "#9A8A78" }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fill: "#9A8A78" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(1)}
            width={32}
          />
          <Tooltip content={<BbtTooltip />} />
          {/* Coverline reference — standard 0.2 °C above follicular mean */}
          <ReferenceLine
            y={36.7}
            stroke="rgba(212,94,82,0.35)"
            strokeDasharray="4 3"
            strokeWidth={1}
          />
          <Line
            type="monotone"
            dataKey="bbt"
            stroke="#6B8F5A"
            strokeWidth={2}
            dot={<BbtDot />}
            activeDot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p style={chartNote}>
        Dashed line = 36.70 °C (typical coverline — yours may differ)
      </p>
    </div>
  );
}

const chartWrap = {
  marginTop: 14,
  padding: "10px 10px 6px",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 12,
};
const chartEyebrow = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "#3F6228",
  textTransform: "uppercase",
  margin: "0 0 4px",
};
const chartNote = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9.5,
  color: "#9A8A78",
  fontStyle: "italic",
  margin: "4px 0 0",
  textAlign: "center",
};
const tooltipStyle = {
  background: "#FBF6E6",
  border: "1px solid rgba(58,44,26,0.16)",
  borderRadius: 8,
  padding: "6px 10px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5,
  color: "#3A2C1A",
};
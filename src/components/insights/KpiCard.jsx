import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const label = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--slate-500, #8C7B66)",
  };

export function Sparkline({ values = [], color = "var(--rose-deep, #A85A6E)" }) {
  if (!values.length) return null;
  const w = 80, h = 24, pad = 2;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} aria-hidden="true" style={{ display: "block" }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function TrendBadge({ delta, unit = "" }) {
  if (delta == null) return null;
  const rounded = Math.round(delta * 10) / 10;
  if (rounded === 0) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 10, color: "var(--slate-500, #8C7B66)", }}>
        <Minus className="w-3 h-3" strokeWidth={1.8} />
        flat
      </span>
    );
  }
  const positive = rounded > 0;
  const color = positive ? "#15803D" : "#B91C1C";
  const Icon = positive ? ArrowUp : ArrowDown;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 10, color, fontWeight: 600 }}>
      <Icon className="w-3 h-3" strokeWidth={2} />
      {Math.abs(rounded)}{unit}
    </span>
  );
}

export default function KpiCard({ label: caption, value, subtext, sparkline, sparklineColor, delta, deltaUnit, ariaLabel }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel || caption}
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "14px 16px",
        boxShadow: "var(--shadow-sm)",
        minHeight: 98,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <p style={label}>{caption}</p>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
        <div>
          <p style={{ fontSize: 22, fontWeight: 700, color: "var(--plum)", lineHeight: 1.1 }}>
            {value ?? "—"}
          </p>
          {subtext && (
            <p style={{ fontSize: 11, color: "var(--slate-500, #8C7B66)", marginTop: 3 }}>
              {subtext}
            </p>
          )}
        </div>
        {sparkline ? <Sparkline values={sparkline} color={sparklineColor} /> : null}
      </div>
      {delta != null && (
        <div style={{ marginTop: 6 }}>
          <TrendBadge delta={delta} unit={deltaUnit} />
        </div>
      )}
    </div>
  );
}
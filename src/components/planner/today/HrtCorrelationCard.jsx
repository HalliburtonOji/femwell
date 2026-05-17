// ─────────────────────────────────────────────────────────────────────────────
// HrtCorrelationCard — Perimenopause Today-tab insight card.
//
// 30-day SVG line chart of symptom severity (averaged across hot flushes,
// night sweats, mood reversed, brain fog, joint pain — all 0-4 scale on
// MenopauseDailyLog). If the user's profile.conditions includes 'hrt',
// overlays HRT-taken Y/N as a step line at the top of the chart.
//
// Three states:
//   - entityMissing → friendly "Coming soon" placeholder (no crash).
//   - empty / sparse (<7 logged days in 30) → dashed-outline empty state +
//     "Start logging to see your pattern" copy.
//   - data → SVG chart + insight ("Symptoms lower on days HRT was taken"
//     when the difference is meaningful, otherwise a neutral framing).
//
// Visibility gate (parent): effectiveLifeStage === 'perimenopause'.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Sparkles } from "lucide-react";

// Same graceful-entity helper used elsewhere — null when entity is missing on
// base44 (e.g. early-stage migration), otherwise the live ent reference.
function safeEntity(name) {
  try {
    const ent = base44?.entities?.[name];
    if (!ent || typeof ent.filter !== "function") return null;
    return ent;
  } catch {
    return null;
  }
}

function isoNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// Combine the four symptom inputs into a single 0-4 severity score per day.
// Mood is treated as inverse (lower = worse) so we invert it before averaging.
function severityFor(row) {
  if (!row) return null;
  const parts = [];
  const hf = Number(row.hot_flashes);
  const ns = Number(row.night_sweats);
  const bf = Number(row.brain_fog);
  const jp = Number(row.joint_pain);
  const moodInv = (() => {
    const m = Number(row.mood);
    if (!Number.isFinite(m)) return null;
    // mood is 1-5 (higher = better) in MenopauseDailyLog. Invert + scale to 0-4.
    return Math.max(0, Math.min(4, 5 - m));
  })();
  for (const v of [hf, ns, bf, jp, moodInv]) {
    if (Number.isFinite(v)) parts.push(v);
  }
  if (parts.length === 0) return null;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

// Build the 30-day symptom + HRT-active series, indexed oldest → newest.
function buildSeries({ logs, hrtRows }) {
  const out = [];
  const today = new Date();
  // Pre-compute active intervals for HRT (start..end). end null = open-ended.
  const intervals = (Array.isArray(hrtRows) ? hrtRows : [])
    .map((r) => ({
      start: r?.start_date || null,
      end:   r?.end_date   || null,
      active: r?.is_active !== false,
    }))
    .filter((r) => r.start && r.active);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    const row = (logs || []).find((r) => r?.date === iso);
    const sev = severityFor(row);
    const hrt = intervals.some((iv) => iv.start <= iso && (!iv.end || iv.end >= iso));
    out.push({
      iso,
      label: d.getDate(),
      severity: sev,
      hrt,
    });
  }
  return out;
}

function computeInsight(series, hrtConditionFlag) {
  const withTemps = series.filter((d) => d.severity != null);
  if (withTemps.length < 7) {
    return { kind: "sparse", text: "Not enough data yet — keep logging" };
  }
  if (!hrtConditionFlag) {
    // No HRT overlay — fall back to a trend-only line.
    const half = Math.floor(withTemps.length / 2);
    const older = withTemps.slice(0, half).reduce((a, b) => a + b.severity, 0) / Math.max(1, half);
    const newer = withTemps.slice(half).reduce((a, b) => a + b.severity, 0) / Math.max(1, withTemps.length - half);
    if (newer < older - 0.4) return { kind: "good", text: "Symptoms easing across this month" };
    if (newer > older + 0.4) return { kind: "watch", text: "Symptoms have crept up this fortnight" };
    return { kind: "neutral", text: "A steady month — pattern is holding" };
  }
  // With HRT overlay — compare severity on HRT-yes vs HRT-no days.
  const onDays  = withTemps.filter((d) => d.hrt);
  const offDays = withTemps.filter((d) => !d.hrt);
  if (onDays.length < 3 || offDays.length < 3) {
    // Not enough HRT contrast — show a trend line only.
    return { kind: "neutral", text: "Keep logging — HRT contrast emerging" };
  }
  const meanOn  = onDays.reduce((a, b) => a + b.severity, 0) / onDays.length;
  const meanOff = offDays.reduce((a, b) => a + b.severity, 0) / offDays.length;
  if (meanOn < meanOff - 0.4) return { kind: "good",   text: "Symptoms lower on days HRT was taken" };
  if (meanOn > meanOff + 0.4) return { kind: "watch",  text: "Symptoms higher on HRT days — worth a GP word" };
  return { kind: "neutral", text: "Similar severity on HRT and off-HRT days this month" };
}

export default function HrtCorrelationCard({ profile }) {
  const userId = profile?.user_id;
  const conditions = profile?.conditions || profile?.condition_flags || [];
  const showHrtOverlay = Array.isArray(conditions) && conditions.includes("hrt");

  const [logs, setLogs] = useState(null);
  const [hrtRows, setHrtRows] = useState([]);
  const [entityMissing, setEntityMissing] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const symEnt = safeEntity("MenopauseDailyLog");
      const hrtEnt = safeEntity("HrtLog");
      if (!symEnt) {
        if (!cancelled) { setEntityMissing(true); setLogs([]); }
        return;
      }
      try {
        const fromISO = isoNDaysAgo(30);
        const symRows = await symEnt.filter({ user_id: userId }, "-date", 60);
        const filtered = (Array.isArray(symRows) ? symRows : [])
          .filter((r) => r?.date && r.date >= fromISO);
        if (!cancelled) setLogs(filtered);
        if (hrtEnt) {
          const rows = await hrtEnt.filter({ user_id: userId }, "-start_date", 20).catch(() => []);
          if (!cancelled) setHrtRows(Array.isArray(rows) ? rows : []);
        }
      } catch (err) {
        const msg = String(err?.message || err || "");
        if (/not\s*found|unknown|404|400|MenopauseDailyLog/i.test(msg)) {
          if (!cancelled) { setEntityMissing(true); setLogs([]); }
        }
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const series = useMemo(() => buildSeries({ logs: logs || [], hrtRows }), [logs, hrtRows]);
  const insight = useMemo(() => computeInsight(series, showHrtOverlay), [series, showHrtOverlay]);

  // ── Render branches ──────────────────────────────────────────────────────
  if (entityMissing) {
    return (
      <section style={wrap} aria-label="HRT correlation — coming soon">
        <header style={headRow}>
          <span style={iconWrap}><Activity size={14} strokeWidth={1.8} /></span>
          <div>
            <p style={eyebrowStyle}>YOUR LAST 30 DAYS</p>
            <p style={titleStyle}>Coming soon</p>
          </div>
        </header>
        <p style={bodyMute}>
          A 30-day symptom chart with HRT overlay lands once your Track logs accumulate. Patterns are easier to see than to remember.
        </p>
      </section>
    );
  }

  const loading = logs === null;
  if (loading) {
    return (
      <section style={wrap} aria-label="HRT correlation loading">
        <div style={skel} />
        <div style={{ ...skel, width: "60%" }} />
      </section>
    );
  }

  const hasAny = series.some((d) => d.severity != null);

  return (
    <section style={wrap} aria-label="Last 30 days correlation">
      <header style={headRow}>
        <span style={iconWrap}><Activity size={14} strokeWidth={1.8} /></span>
        <div>
          <p style={eyebrowStyle}>YOUR LAST 30 DAYS{showHrtOverlay ? " · HRT × SYMPTOMS" : ""}</p>
          <p style={titleStyle}>Your last 30 days</p>
        </div>
      </header>

      <CorrelationChart series={series} showHrtOverlay={showHrtOverlay} hasAny={hasAny} />

      <div style={{ ...insightBox, borderLeftColor: insightColour(insight.kind) }}>
        <Sparkles size={12} strokeWidth={2.0} style={{ color: insightColour(insight.kind), flexShrink: 0 }} aria-hidden="true" />
        <p style={insightText}>{insight.text}</p>
      </div>

      <p style={legendNote}>
        Severity averaged across hot flushes, night sweats, mood, brain fog, joint pain.
        {showHrtOverlay && " HRT line at top shows days an active regimen was logged."}
      </p>
    </section>
  );
}

function insightColour(kind) {
  if (kind === "good")  return "#8FAF8F";   // sage
  if (kind === "watch") return "#E8B4B8";   // blush
  if (kind === "sparse")return "#9B8B7A";   // muted
  return "#A6862B";                          // gold-deep
}

// ─── CorrelationChart — pure SVG, no external lib ──────────────────────────
function CorrelationChart({ series, showHrtOverlay, hasAny }) {
  const W = 320;
  const H = showHrtOverlay ? 140 : 116;
  const PAD_X = 14;
  const PAD_TOP = showHrtOverlay ? 22 : 14;
  const PAD_BOTTOM = 22;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const yFor = (s) => PAD_TOP + ((4 - s) / 4) * innerH;
  const xFor = (i) => PAD_X + (i / Math.max(1, series.length - 1)) * innerW;

  // Connect consecutive non-null severity points so gaps render as breaks.
  const segments = [];
  let cur = [];
  series.forEach((d, i) => {
    if (d.severity != null) {
      cur.push({ x: xFor(i), y: yFor(d.severity) });
    } else if (cur.length > 0) {
      segments.push(cur);
      cur = [];
    }
  });
  if (cur.length > 0) segments.push(cur);

  // HRT step line — 16px above the chart frame.
  const hrtY = 10;
  const hrtSegments = [];
  let hCur = [];
  if (showHrtOverlay) {
    series.forEach((d, i) => {
      if (d.hrt) {
        hCur.push({ x: xFor(i), y: hrtY });
      } else if (hCur.length > 0) {
        hrtSegments.push(hCur);
        hCur = [];
      }
    });
    if (hCur.length > 0) hrtSegments.push(hCur);
  }

  return (
    <div style={chartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Symptom severity over last 30 days" style={chartSvg}>
        {!hasAny && (
          <rect
            x={PAD_X} y={PAD_TOP}
            width={innerW} height={innerH}
            fill="none"
            stroke="rgba(58,44,26,0.20)"
            strokeWidth="1"
            strokeDasharray="4 4"
            rx="4"
          />
        )}
        {/* Horizontal severity gridlines at 1/2/3 */}
        {[1, 2, 3].map((v) => (
          <line
            key={`g${v}`}
            x1={PAD_X} x2={W - PAD_X}
            y1={yFor(v)} y2={yFor(v)}
            stroke="rgba(58,44,26,0.06)"
            strokeWidth="0.6"
          />
        ))}
        {/* HRT-taken step line + tiny pill caps */}
        {showHrtOverlay && hrtSegments.map((seg, idx) => seg.length >= 2 ? (
          <line
            key={`hrt-${idx}`}
            x1={seg[0].x} x2={seg[seg.length - 1].x}
            y1={hrtY} y2={hrtY}
            stroke="#8FAF8F"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
          />
        ) : (
          <circle key={`hrt-d-${idx}`} cx={seg[0].x} cy={hrtY} r="2" fill="#8FAF8F"/>
        ))}
        {showHrtOverlay && (
          <text
            x={PAD_X} y={hrtY - 4}
            fontSize="8" fill="#3F6228"
            fontFamily="'Inter', sans-serif"
            fontWeight="700"
            style={{ letterSpacing: "0.10em" }}
          >HRT</text>
        )}
        {/* Severity segments */}
        {segments.map((seg, idx) => (
          <polyline
            key={`seg-${idx}`}
            fill="none"
            stroke="#3A2C1A"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={seg.map((p) => `${p.x},${p.y}`).join(" ")}
          />
        ))}
        {/* Dots */}
        {series.map((d, i) => d.severity != null ? (
          <circle
            key={`d${i}`}
            cx={xFor(i)} cy={yFor(d.severity)}
            r={d.severity >= 3 ? 3 : 2.2}
            fill={d.severity >= 3 ? "#8C5A6E" : "#A6862B"}
            stroke="#FBF6E6" strokeWidth="0.8"
          />
        ) : null)}
        {/* X-axis day labels */}
        {series.map((d, i) => (i === 0 || i === 14 || i === 29 ? (
          <text
            key={`l${i}`}
            x={xFor(i)} y={H - 6}
            fontSize="8" fill="#9B8B7A"
            textAnchor="middle"
            fontFamily="'Inter', sans-serif"
          >{d.label}</text>
        ) : null))}
      </svg>
      {!hasAny && (
        <p style={chartEmpty}>Start logging to see your pattern.</p>
      )}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const wrap = {
  background: "linear-gradient(180deg, rgba(143,175,143,0.10), rgba(244,237,219,0.6))",
  border: "1px solid rgba(58,44,26,0.12)",
  borderLeft: "3px solid #8FAF8F",
  borderRadius: 14,
  padding: "14px 14px 16px",
  marginBottom: 12,
  maxWidth: 390,
};
const headRow = {
  display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8,
};
const iconWrap = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 26, height: 26, borderRadius: 9999,
  background: "rgba(143,175,143,0.30)", color: "#3F6228",
  flexShrink: 0,
};
const eyebrowStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
  color: "#3F6228", textTransform: "uppercase",
  margin: 0,
};
const titleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17, fontWeight: 500, lineHeight: 1.22,
  color: "#3A2C1A", margin: "2px 0 0",
};
const bodyMute = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5, color: "#6B5840",
  lineHeight: 1.5, margin: "0 0 10px",
};
const chartWrap = {
  marginTop: 6,
  padding: "8px 8px 6px",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 10,
};
const chartSvg = {
  width: "100%",
  height: "auto",
  display: "block",
};
const chartEmpty = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, color: "#9B8B7A", fontStyle: "italic",
  margin: "4px 0 0", textAlign: "center",
};
const insightBox = {
  display: "flex", alignItems: "flex-start", gap: 6,
  marginTop: 10,
  padding: "8px 10px",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderLeftWidth: 3,
  borderRadius: 10,
};
const insightText = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontStyle: "italic", fontSize: 13.5,
  color: "#3A2C1A", margin: 0, lineHeight: 1.4,
};
const legendNote = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10.5, color: "#9B8B7A", fontStyle: "italic",
  margin: "8px 0 0", lineHeight: 1.5,
};
const skel = {
  height: 14,
  background: "rgba(58,44,26,0.08)",
  borderRadius: 6,
  marginBottom: 8,
};

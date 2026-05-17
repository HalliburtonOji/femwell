// ─────────────────────────────────────────────────────────────────────────────
// EpdsScreenCard — Postpartum wellbeing check-in.
//
// Edinburgh Postnatal Depression Scale (EPDS) — 10-question validated screen
// used by UK NHS health visitors. Each question scored 0–3.
//   0–9   → 'You're doing great' (low likelihood)
//   10–12 → 'Some support might help' (consider follow-up)
//   13+   → 'Please talk to someone' (signpost to GP / health visitor)
//
// Q10 is the self-harm question — any non-zero answer triggers the highest-tier
// signpost regardless of total score, per the standard NHS EPDS protocol.
//
// Privacy: results NEVER persist to base44. Storage is localStorage only,
// scoped per-user with a date so the user can see "your last check-in was 4
// days ago" but the data never leaves their browser. This is sensitive mental
// health data — base44 round-trip is the wrong frame for v1.
//
// Visibility: gated by Planner.jsx on plannerConfig.showsEpds (true on the
// postpartum stage in plannerAdapter.js). Old gate was an exact-string
// check on effectiveLifeStage; QA Phase 2 walk found it failing on
// off-spec profile enums. The adapter flag is the source of truth.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { Heart, ChevronDown, ChevronUp, RotateCw, AlertTriangle } from "lucide-react";

const EPDS_KEY_PREFIX = "femwell_epds_last_";
// Sprint 4 BUILD 4 — full history of completed checkins for the trend
// sparkline. Stays local; never sent to base44. Cap at the most recent 24
// entries so localStorage doesn't grow unbounded.
const EPDS_HISTORY_KEY_PREFIX = "femwell_epds_history_";
const EPDS_HISTORY_CAP = 24;

// EPDS items (paraphrased — official wording is © Cox et al 1987 but
// the structure + scoring is the screening standard the NHS uses).
// `reversed` flag marks items where 'always' = 0 and 'never' = 3.
const EPDS_QUESTIONS = [
  { id: 1,  reversed: true,  text: "I have been able to laugh and see the funny side of things",
    options: ["As much as I always could", "Not quite so much now", "Definitely not so much now", "Not at all"] },
  { id: 2,  reversed: true,  text: "I have looked forward with enjoyment to things",
    options: ["As much as I ever did", "Rather less than I used to", "Definitely less than I used to", "Hardly at all"] },
  { id: 3,  reversed: false, text: "I have blamed myself unnecessarily when things went wrong",
    options: ["No, never", "Not very often", "Yes, some of the time", "Yes, most of the time"] },
  { id: 4,  reversed: true,  text: "I have been anxious or worried for no good reason",
    options: ["No, not at all", "Hardly ever", "Yes, sometimes", "Yes, very often"] },
  { id: 5,  reversed: false, text: "I have felt scared or panicky for no very good reason",
    options: ["No, not at all", "No, not much", "Yes, sometimes", "Yes, quite a lot"] },
  { id: 6,  reversed: false, text: "Things have been getting on top of me",
    options: ["No, I have been coping as well as ever", "No, most of the time I have coped quite well", "Yes, sometimes I haven't been coping as well as usual", "Yes, most of the time I haven't been able to cope at all"] },
  { id: 7,  reversed: false, text: "I have been so unhappy that I have had difficulty sleeping",
    options: ["No, not at all", "Not very often", "Yes, sometimes", "Yes, most of the time"] },
  { id: 8,  reversed: false, text: "I have felt sad or miserable",
    options: ["No, not at all", "Not very often", "Yes, quite often", "Yes, most of the time"] },
  { id: 9,  reversed: false, text: "I have been so unhappy that I have been crying",
    options: ["No, never", "Only occasionally", "Yes, quite often", "Yes, most of the time"] },
  { id: 10, reversed: false, text: "The thought of harming myself has occurred to me",
    options: ["Never", "Hardly ever", "Sometimes", "Yes, quite often"], isSafety: true },
];

// EPDS scoring rule: 4 options scored 0/1/2/3. For 'reversed' items the order
// is flipped at scoring time (option 0 ⇒ 0; option 3 ⇒ 3) — we model this by
// always scoring the SELECTED INDEX as the literal score for non-reversed and
// 3 - index for reversed.
function scoreFor(q, selectedIndex) {
  if (selectedIndex == null) return null;
  return q.reversed ? selectedIndex : selectedIndex;
}
// (Both branches above match — the option lists are pre-ordered so the
// selected index IS the EPDS score for that item. The reversed flag is kept
// for future flexibility / a11y labelling.)

function bandFor(total, q10Score) {
  if (q10Score != null && q10Score > 0) return "high";
  if (total >= 13) return "high";
  if (total >= 10) return "medium";
  return "low";
}

const BAND_COPY = {
  low: {
    title: "You're doing great",
    body:  "These numbers suggest things feel manageable this week. Keep doing what's working — and keep the check-in habit; it's part of how you'll catch a dip early if one comes.",
    cta:   null,
    swatch:"#8FAF8F",
  },
  medium: {
    title: "Some support might help",
    body:  "A few of these are creeping up. That's not failure — it's a signal worth listening to. Your health visitor or GP can talk it through; postnatal mood is exactly what they're trained to support.",
    cta:   "Health Visitor / GP — worth a call this week",
    swatch:"#E8B4B8",
  },
  high: {
    title: "Please talk to someone",
    body:  "Today's score is high enough that we want you to talk to a professional — not to label anything, just to give you the support you deserve. You don't have to wait for it to feel like an emergency.",
    cta:   "Contact your health visitor or GP",
    swatch:"#8C5A6E",
  },
};

function storageKey(userId) {
  return `${EPDS_KEY_PREFIX}${userId || "anon"}`;
}
function historyKey(userId) {
  return `${EPDS_HISTORY_KEY_PREFIX}${userId || "anon"}`;
}
function readHistory(userId) {
  try {
    const raw = window.localStorage.getItem(historyKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r) => r && typeof r.iso === "string" && Number.isFinite(r.total));
  } catch { return []; }
}
function writeHistory(userId, entries) {
  try {
    window.localStorage.setItem(historyKey(userId), JSON.stringify(entries));
  } catch { /* silent — quota or unavailable */ }
}

function daysAgo(iso) {
  if (!iso) return null;
  try {
    const then = new Date(iso);
    const now  = new Date();
    return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
  } catch { return null; }
}

export default function EpdsScreenCard({ profile }) {
  const userId = profile?.user_id;
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]); // [{iso, total, band, q10}, ...]

  // Hydrate from localStorage on mount / userId change.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(userId));
      if (raw) setLastResult(JSON.parse(raw));
    } catch { /* silent */ }
    setHistory(readHistory(userId));
  }, [userId]);

  const total = useMemo(
    () => answers.reduce((sum, a, i) => sum + (a == null ? 0 : scoreFor(EPDS_QUESTIONS[i], a)), 0),
    [answers]
  );
  const q10Score = answers[9];
  const allAnswered = answers.every((a) => a != null);
  const band = allAnswered ? bandFor(total, q10Score) : null;
  const copy = band ? BAND_COPY[band] : null;

  const setAnswer = (qIdx, optIdx) => {
    setAnswers((cur) => cur.map((a, i) => (i === qIdx ? optIdx : a)));
  };

  const saveAndShow = () => {
    if (!allAnswered) return;
    const payload = {
      total,
      band,
      q10: q10Score,
      iso: new Date().toISOString(),
    };
    try { window.localStorage.setItem(storageKey(userId), JSON.stringify(payload)); } catch { /* silent */ }
    setLastResult(payload);
    // Append to rolling history (capped at EPDS_HISTORY_CAP entries).
    const existing = readHistory(userId);
    const next = [...existing, payload].slice(-EPDS_HISTORY_CAP);
    writeHistory(userId, next);
    setHistory(next);
  };

  const reset = () => {
    setAnswers(Array(10).fill(null));
    setLastResult(null);
    try { window.localStorage.removeItem(storageKey(userId)); } catch { /* silent */ }
    // Note: we do NOT wipe history on a single 'clear result'. History is the
    // trend record. There's a dedicated 'Clear history' button on the result
    // panel below for the explicit erase case.
  };

  const clearHistory = () => {
    try { window.localStorage.removeItem(historyKey(userId)); } catch { /* silent */ }
    setHistory([]);
  };

  const lastDays = daysAgo(lastResult?.iso);

  // 7-day nudge — surfaced when there's at least one saved check-in AND the
  // most recent one is older than 7 days. Uses the rolling `history` so this
  // survives a 'Clear result' (single-key wipe) without false-firing.
  const sevenDayNudge = useMemo(() => {
    if (!Array.isArray(history) || history.length === 0) return null;
    const latest = history[history.length - 1];
    const since = daysAgo(latest?.iso);
    return Number.isFinite(since) && since > 7 ? since : null;
  }, [history]);
  const NudgeBanner = sevenDayNudge != null ? (
    <div style={nudgeBox} role="status" aria-label={`${sevenDayNudge} days since last EPDS check-in`}>
      <AlertTriangle size={14} strokeWidth={2} color="#8C6D1E" aria-hidden="true" />
      <p style={nudgeText}>
        It's been <strong>{sevenDayNudge} days</strong> since your last check-in. How are you feeling today?
      </p>
    </div>
  ) : null;

  // ── Collapsed state — show entry CTA + last result summary if any ─────────
  if (!open && !allAnswered) {
    const lastBand = lastResult?.band;
    const lastCopy = lastBand ? BAND_COPY[lastBand] : null;
    return (
      <section style={wrap} aria-label="Postnatal wellbeing check-in">
        <header style={headRow}>
          <span style={iconWrap}><Heart size={14} strokeWidth={1.8} /></span>
          <div>
            <p style={eyebrowStyle}>WEEKLY CHECK-IN · EPDS</p>
            <p style={titleStyle}>How are you feeling this week?</p>
          </div>
        </header>
        {NudgeBanner}
        <p style={bodyMute}>
          A 10-question wellbeing screen used by UK health visitors. Takes about two minutes. Stays on your device — never shared.
        </p>
        {lastCopy && (
          <div style={{ ...lastBox, borderLeftColor: lastCopy.swatch }}>
            <p style={lastEyebrow}>LAST CHECK-IN · {lastDays === 0 ? "today" : `${lastDays} day${lastDays === 1 ? "" : "s"} ago`}</p>
            <p style={lastTitle}>{lastCopy.title}</p>
            <p style={lastMeta}>Score {lastResult.total} / 30{lastResult.q10 > 0 ? " · safety flag noted" : ""}</p>
          </div>
        )}
        <button type="button" style={primaryBtn} onClick={() => setOpen(true)}>
          <ChevronDown size={13} strokeWidth={2.4} />
          <span>Take the check-in →</span>
        </button>
      </section>
    );
  }

  // ── Result panel — replaces the form once all 10 answered + saved ────────
  if (lastResult && !open) {
    return (
      <section style={wrap} aria-label="Postnatal wellbeing result">
        <header style={headRow}>
          <span style={iconWrap}><Heart size={14} strokeWidth={1.8} /></span>
          <div>
            <p style={eyebrowStyle}>WEEKLY CHECK-IN · RESULT</p>
            <p style={titleStyle}>{BAND_COPY[lastResult.band].title}</p>
          </div>
        </header>
        <p style={resultMeta}>Score {lastResult.total} / 30 · {lastDays === 0 ? "today" : `${lastDays} day${lastDays === 1 ? "" : "s"} ago`}</p>
        <p style={bodyText}>{BAND_COPY[lastResult.band].body}</p>
        {BAND_COPY[lastResult.band].cta && (
          <div style={{ ...ctaBox, borderLeftColor: BAND_COPY[lastResult.band].swatch }}>
            <p style={ctaText}>{BAND_COPY[lastResult.band].cta}</p>
            <p style={ctaHint}>
              In the UK: dial 111 for non-emergency support, 999 in an emergency. Your GP or health visitor can also see you the same week if you ask.
            </p>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="button" style={primaryBtn} onClick={() => { setAnswers(Array(10).fill(null)); setOpen(true); }}>
            <RotateCw size={12} strokeWidth={2.2} />
            <span>Take it again</span>
          </button>
          <button type="button" style={ghostBtn} onClick={reset}>Clear result</button>
        </div>

        {/* ── Trend sparkline — Sprint 4 BUILD 4 ──────────────────────────
            Only renders when >= 3 historical entries exist. localStorage
            only — same as the rest of this card. */}
        {history.length >= 3 && (
          <EpdsTrendSparkline history={history} onClearHistory={clearHistory} />
        )}
      </section>
    );
  }

  // ── Form (10 EPDS items as accordion-style cards) ────────────────────────
  return (
    <section style={wrap} aria-label="Postnatal wellbeing check-in form">
      <header style={headRow}>
        <span style={iconWrap}><Heart size={14} strokeWidth={1.8} /></span>
        <div>
          <p style={eyebrowStyle}>WEEKLY CHECK-IN · EPDS</p>
          <p style={titleStyle}>How are you feeling this week?</p>
        </div>
        <button type="button" style={ghostIconBtn} aria-label="Collapse" onClick={() => setOpen(false)}>
          <ChevronUp size={13} strokeWidth={2.2} />
        </button>
      </header>
      <p style={bodyMute}>
        In the past 7 days... pick the answer that comes closest to how you have felt.
      </p>

      {NudgeBanner}

      <ol style={qList}>
        {EPDS_QUESTIONS.map((q, qIdx) => {
          const selected = answers[qIdx];
          return (
            <li key={q.id} style={qItem}>
              <p style={qText}>{qIdx + 1}. {q.text}{q.isSafety && <span style={qSafety}> · safety item</span>}</p>
              <div style={qOptionsCol} role="radiogroup" aria-label={q.text}>
                {q.options.map((opt, optIdx) => {
                  const on = selected === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setAnswer(qIdx, optIdx)}
                      style={{
                        ...qOptionBtn,
                        background: on ? "#3A2C1A" : "transparent",
                        color: on ? "#F4EDDB" : "#3A2C1A",
                        borderColor: on ? "#3A2C1A" : "rgba(58,44,26,0.16)",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      {allAnswered && copy && (
        <div style={{ ...preview, borderLeftColor: copy.swatch }}>
          <p style={previewTitle}>{copy.title}</p>
          <p style={previewBody}>{copy.body}</p>
          {copy.cta && <p style={previewCta}>{copy.cta}</p>}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          type="button"
          style={{ ...primaryBtn, opacity: allAnswered ? 1 : 0.5 }}
          onClick={() => { saveAndShow(); setOpen(false); }}
          disabled={!allAnswered}
        >
          See result →
        </button>
        <button type="button" style={ghostBtn} onClick={() => setOpen(false)}>Close</button>
      </div>
      <p style={privacyLine}>Stays on your device. Never shared. Never sent to base44.</p>
    </section>
  );
}

// ─── EpdsTrendSparkline ─────────────────────────────────────────────────────
// Lightweight SVG sparkline of total EPDS scores over time. Rendered below
// the result panel when the user has >= 3 entries in localStorage history.
// Line in --femwell-muted; dots colour-shifted by band so the user can spot
// a trend at a glance without reading the numbers.
function EpdsTrendSparkline({ history, onClearHistory }) {
  const W = 280;
  const H = 90;
  const PAD_X = 14;
  const PAD_TOP = 14;
  const PAD_BOTTOM = 22;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  // y axis: 0 (bottom) - 30 (top). Bands: 0-9 sage line, 10-12 warning, 13+ alert.
  const Y_MAX = 30;
  const xFor = (i) => PAD_X + (i / Math.max(1, history.length - 1)) * innerW;
  const yFor = (v) => PAD_TOP + ((Y_MAX - v) / Y_MAX) * innerH;

  const points = history.map((h, i) => ({
    x: xFor(i),
    y: yFor(Math.max(0, Math.min(Y_MAX, h.total))),
    band: h.band,
    total: h.total,
    iso: h.iso,
  }));

  // Light reference lines at 10 and 13 (the band thresholds).
  const y10 = yFor(10);
  const y13 = yFor(13);

  const first = history[0];
  const last  = history[history.length - 1];
  const firstDate = (() => { try { return new Date(first.iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); } catch { return ""; } })();
  const lastDate  = (() => { try { return new Date(last.iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); } catch { return ""; } })();

  const dotFill = (band) => {
    if (band === "high")   return "#8C5A6E";
    if (band === "medium") return "#E8B4B8";
    return "#8FAF8F";
  };

  return (
    <div style={trendWrap} aria-label="EPDS score trend over time">
      <div style={trendHeadRow}>
        <p style={trendEyebrow}>YOUR SCORE TREND · {history.length} CHECK-INS</p>
        <button
          type="button"
          onClick={onClearHistory}
          style={trendClearBtn}
          aria-label="Clear EPDS history"
        >
          Clear history
        </button>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Line chart of EPDS scores over time"
        style={trendSvg}
      >
        {/* Band threshold reference lines */}
        <line x1={PAD_X} x2={W - PAD_X} y1={y10} y2={y10}
              stroke="rgba(232,180,184,0.55)" strokeWidth="0.8" strokeDasharray="3 3"/>
        <line x1={PAD_X} x2={W - PAD_X} y1={y13} y2={y13}
              stroke="rgba(140,90,110,0.55)" strokeWidth="0.8" strokeDasharray="3 3"/>
        <text x={W - PAD_X - 2} y={y10 - 2} textAnchor="end"
              fontSize="8" fontFamily="'Inter', sans-serif" fill="#C48A8C"
              style={{ letterSpacing: "0.08em" }}>10</text>
        <text x={W - PAD_X - 2} y={y13 - 2} textAnchor="end"
              fontSize="8" fontFamily="'Inter', sans-serif" fill="#8C5A6E"
              style={{ letterSpacing: "0.08em" }}>13</text>

        {/* Line in muted */}
        <polyline
          points={points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
          fill="none"
          stroke="#9B8B7A"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x.toFixed(1)} cy={p.y.toFixed(1)}
            r={i === points.length - 1 ? 3.4 : 2.4}
            fill={dotFill(p.band)}
            stroke="#FBF6E6"
            strokeWidth="0.8"
          />
        ))}

        {/* X-axis labels — first + last only to keep it quiet */}
        <text x={PAD_X} y={H - 6}
              fontSize="9" fontFamily="'Inter', sans-serif" fill="#9B8B7A">
          {firstDate}
        </text>
        <text x={W - PAD_X} y={H - 6} textAnchor="end"
              fontSize="9" fontFamily="'Inter', sans-serif" fill="#9B8B7A">
          {lastDate}
        </text>
      </svg>

      <p style={trendNote}>
        Lower is better. Speak to your midwife if score is above 12.
      </p>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const wrap = {
  background: "linear-gradient(180deg, rgba(232,180,184,0.10), rgba(244,237,219,0.6))",
  border: "1px solid rgba(58,44,26,0.12)",
  borderLeft: "3px solid #E8B4B8",
  borderRadius: 14,
  padding: "14px 14px 16px",
  marginBottom: 12,
  maxWidth: 390,
};
const headRow = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  marginBottom: 8,
};
const iconWrap = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 26, height: 26, borderRadius: 9999,
  background: "rgba(232,180,184,0.30)", color: "#8C5A6E",
  flexShrink: 0,
};
const eyebrowStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
  color: "#8C5A6E", textTransform: "uppercase",
  margin: 0,
};
const titleStyle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17, fontWeight: 500, lineHeight: 1.22,
  color: "#3A2C1A", margin: "2px 0 0", flex: 1,
};
const bodyMute = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5, color: "#6B5840",
  lineHeight: 1.5, margin: "0 0 10px",
};
const bodyText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13, color: "#3A2C1A",
  lineHeight: 1.55, margin: "0 0 10px",
};
const lastBox = {
  margin: "6px 0 10px",
  padding: "8px 10px",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderLeftWidth: 3,
  borderRadius: 10,
};
const lastEyebrow = {
  fontFamily: "'Inter', sans-serif", fontSize: 9.5, fontWeight: 700,
  letterSpacing: "0.18em", color: "#9B8B7A", textTransform: "uppercase",
  margin: 0,
};
const lastTitle = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500,
  color: "#3A2C1A", margin: "2px 0 0", fontStyle: "italic",
};
const lastMeta = {
  fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#6B5840",
  margin: "2px 0 0",
};
const primaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "8px 14px",
  borderRadius: 9999,
  background: "#3A2C1A",
  color: "#F4EDDB",
  border: "1px solid #3A2C1A",
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
  cursor: "pointer",
};
const ghostBtn = {
  padding: "8px 14px",
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.18)",
  color: "#6B5840",
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
  cursor: "pointer",
};
const ghostIconBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 26, height: 26, borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.16)",
  color: "#6B5840", cursor: "pointer", flexShrink: 0,
};
const qList = {
  listStyle: "none", padding: 0, margin: "8px 0 4px",
  display: "flex", flexDirection: "column", gap: 10,
};
const qItem = {
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 10,
  padding: "10px 12px",
};
const qText = {
  fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600,
  color: "#3A2C1A", margin: "0 0 6px", lineHeight: 1.4,
};
const qSafety = {
  fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.12em", color: "#8C5A6E", textTransform: "uppercase",
};
const qOptionsCol = {
  display: "flex", flexDirection: "column", gap: 4,
};
const qOptionBtn = {
  textAlign: "left",
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
  cursor: "pointer",
};
const preview = {
  marginTop: 10,
  padding: "10px 12px",
  background: "rgba(255,255,255,0.55)",
  borderLeftWidth: 3,
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 10,
};
const previewTitle = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500,
  fontStyle: "italic", color: "#3A2C1A", margin: 0,
};
const previewBody = {
  fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#3A2C1A",
  lineHeight: 1.5, margin: "4px 0 0",
};
const previewCta = {
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
  color: "#8C5A6E", margin: "6px 0 0",
};
const resultMeta = {
  fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#9B8B7A",
  fontStyle: "italic", margin: "0 0 8px",
};
const ctaBox = {
  margin: "8px 0",
  padding: "10px 12px",
  background: "rgba(255,255,255,0.55)",
  borderLeftWidth: 3,
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 10,
};
const ctaText = {
  fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700,
  color: "#3A2C1A", margin: 0,
};
const ctaHint = {
  fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#6B5840",
  margin: "4px 0 0", lineHeight: 1.5,
};
const privacyLine = {
  fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "#9B8B7A",
  fontStyle: "italic", margin: "10px 0 0",
};
const nudgeBox = {
  // Sprint 5 BUILD 1 — 7-day reminder banner. Amber-bg per spec; espresso
  // text; Lucide AlertTriangle substituted for the spec's ⚠️ codepoint per
  // the 'no emoji in product' rule.
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  margin: "0 0 10px",
  padding: "9px 12px",
  background: "#FFF3CD",
  border: "1px solid rgba(140,109,30,0.30)",
  borderLeft: "3px solid #D4AF37",
  borderRadius: 10,
};
const nudgeText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5,
  color: "#3A2C1A",
  lineHeight: 1.45,
  margin: 0,
};
const trendWrap = {
  marginTop: 12,
  padding: "10px 12px 6px",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 10,
};
const trendHeadRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
};
const trendEyebrow = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.18em",
  color: "#9B8B7A",
  textTransform: "uppercase",
  margin: 0,
};
const trendClearBtn = {
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.16)",
  borderRadius: 9999,
  padding: "3px 8px",
  fontFamily: "'Inter', sans-serif",
  fontSize: 9.5,
  fontWeight: 600,
  letterSpacing: "0.06em",
  color: "#6B5840",
  cursor: "pointer",
};
const trendSvg = {
  width: "100%",
  height: "auto",
  display: "block",
};
const trendNote = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: "#6B5840",
  fontStyle: "italic",
  margin: "6px 0 0",
  lineHeight: 1.45,
  textAlign: "center",
};

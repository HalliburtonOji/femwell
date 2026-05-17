// ─────────────────────────────────────────────────────────────────────────────
// FertileWindowCard — TTC stage Cycle tab card.
//
// 7-day strip centred on the predicted peak fertile day (CD 14 default).
// Each day cell is colour-coded by confidence: low=cream border, medium=blush,
// high=sage fill (peak). Below the strip: + Log BBT and + Log OPK buttons that
// open inline forms (number for BBT °C, positive/negative toggle for OPK).
//
// Empty state when no cycle data is available: "Log a few cycles and we'll
// map your fertile window" with a "Log today" CTA.
//
// Gating: parent (Planner.jsx) renders this only when
// effectiveLifeStage === 'ttc' OR plannerConfig.cycleTabMode === 'ttc'.
//
// Data: peak day defaults to CD 14 unless profile.cycle_prediction_meta gives
// a learned peak. BBT/OPK entries are local-only stub records for v1 (no
// schema dependency); a future MP will persist them to a BbtLog / OpkLog
// entity once base44 is taught about them.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { Thermometer, FlaskConical, Check, X, Plus } from "lucide-react";

// Confidence per day, indexed by offset from peak (negative = before peak).
// Standard fertile-window curve: peak day + 1 are the two highest-fertility
// days, peak-1 to peak-5 ramps up; +2 onward drops sharply.
const CONFIDENCE_BY_OFFSET = {
  "-3": "low",
  "-2": "medium",
  "-1": "medium",
  "0":  "high",     // peak
  "1":  "high",
  "2":  "medium",
  "3":  "low",
};

const CONFIDENCE_STYLES = {
  low:    { bg: "transparent",                border: "1px solid rgba(58,44,26,0.20)", color: "#6B5840" },
  medium: { bg: "rgba(212,116,90,0.18)",      border: "1px solid rgba(212,116,90,0.40)", color: "#7A3422" },
  high:   { bg: "rgba(107,143,90,0.30)",      border: "1px solid #6B8F5A", color: "#2D4E1A" },
};

const CONFIDENCE_LABEL = { low: "Low", medium: "Building", high: "Peak" };

export default function FertileWindowCard({ profile, cycleDay }) {
  // Peak day — prefer learned value if present, else CD 14 default.
  const peakDay = useMemo(() => {
    const learned = profile?.cycle_prediction_meta?.predicted_ovulation_day;
    if (Number.isFinite(learned) && learned > 0) return Math.round(learned);
    return 14;
  }, [profile?.cycle_prediction_meta?.predicted_ovulation_day]);

  const todayCd = Number.isFinite(cycleDay) ? cycleDay : null;

  // Build the 7-day strip centred on peakDay (peak-3 … peak+3).
  const strip = useMemo(() => {
    const out = [];
    for (let off = -3; off <= 3; off++) {
      const cd = peakDay + off;
      out.push({
        cd,
        offset: off,
        confidence: CONFIDENCE_BY_OFFSET[String(off)] || "low",
        isToday: todayCd === cd,
        isPeak: off === 0,
      });
    }
    return out;
  }, [peakDay, todayCd]);

  // ── BBT / OPK inline forms ────────────────────────────────────────────────
  const [bbtOpen, setBbtOpen] = useState(false);
  const [opkOpen, setOpkOpen] = useState(false);
  const [bbtValue, setBbtValue] = useState("");
  const [opkValue, setOpkValue] = useState(null); // null | "positive" | "negative"
  const [savedToast, setSavedToast] = useState(null);

  const saveBbt = () => {
    if (!bbtValue) return;
    // V1: local stub — log and toast. Persistence MP queued separately.
    // eslint-disable-next-line no-console
    console.log("[FertileWindow] BBT logged (local stub):", bbtValue, "°C");
    setBbtValue("");
    setBbtOpen(false);
    setSavedToast("BBT saved (local) · entity coming");
    window.setTimeout(() => setSavedToast(null), 2400);
  };

  const saveOpk = () => {
    if (!opkValue) return;
    // eslint-disable-next-line no-console
    console.log("[FertileWindow] OPK logged (local stub):", opkValue);
    setOpkValue(null);
    setOpkOpen(false);
    setSavedToast(`OPK ${opkValue} saved (local) · entity coming`);
    window.setTimeout(() => setSavedToast(null), 2400);
  };

  // Empty state — no peak available AND no cycle day. Default behaviour above
  // ensures we always have a peak (14), but if profile is fully empty we surface
  // a gentler entry.
  const isEmpty = !profile;
  if (isEmpty) {
    return (
      <section style={wrap} aria-label="Fertile window empty state">
        <header style={headRow}>
          <div style={iconRow}>
            <span style={iconWrap}><FlaskConical size={14} strokeWidth={1.8} /></span>
            <div>
              <p style={eyebrowStyle}>FERTILE WINDOW · ESTIMATED</p>
              <p style={titleStyle}>Log a few cycles and we'll map your fertile window</p>
            </div>
          </div>
        </header>
        <button type="button" style={primaryBtn} onClick={() => setBbtOpen(true)}>
          <Plus size={13} strokeWidth={2.4} />
          <span>Log today</span>
        </button>
      </section>
    );
  }

  return (
    <section style={wrap} aria-label="Fertile window estimated">
      <header style={headRow}>
        <div style={iconRow}>
          <span style={iconWrap}><FlaskConical size={14} strokeWidth={1.8} /></span>
          <div>
            <p style={eyebrowStyle}>FERTILE WINDOW · ESTIMATED</p>
            <p style={titleStyle}>Peak around CD {peakDay}</p>
          </div>
        </div>
      </header>

      <p style={metaRow}>
        Confidence is a soft prediction. BBT + OPK logging tightens the band over a few cycles —
        we won't pretend we know it on a single data point.
      </p>

      <div style={stripRow} role="list" aria-label="7-day fertile strip">
        {strip.map((d) => {
          const styles = CONFIDENCE_STYLES[d.confidence];
          return (
            <div
              key={d.cd}
              role="listitem"
              aria-label={`CD ${d.cd} · ${CONFIDENCE_LABEL[d.confidence]}${d.isToday ? " · today" : ""}`}
              style={{
                ...stripCell,
                background: styles.bg,
                border: styles.border,
                color: styles.color,
                outline: d.isToday ? "2px solid #A6862B" : "none",
                outlineOffset: d.isToday ? "1px" : "0",
              }}
            >
              <span style={stripCdLabel}>CD</span>
              <span style={stripCdNumber}>{d.cd}</span>
              {d.isPeak && <span style={peakDot} aria-hidden="true">●</span>}
            </div>
          );
        })}
      </div>

      <div style={legendRow} aria-hidden="true">
        <span style={legendItem}>
          <span style={{ ...legendSwatch, ...CONFIDENCE_STYLES.low }} /> Low
        </span>
        <span style={legendItem}>
          <span style={{ ...legendSwatch, ...CONFIDENCE_STYLES.medium }} /> Building
        </span>
        <span style={legendItem}>
          <span style={{ ...legendSwatch, ...CONFIDENCE_STYLES.high }} /> Peak
        </span>
      </div>

      <div style={ctaRow}>
        <button type="button" style={logBtn} onClick={() => { setBbtOpen(!bbtOpen); setOpkOpen(false); }}>
          <Thermometer size={12} strokeWidth={2.0} />
          <span>+ Log BBT</span>
        </button>
        <button type="button" style={logBtn} onClick={() => { setOpkOpen(!opkOpen); setBbtOpen(false); }}>
          <FlaskConical size={12} strokeWidth={2.0} />
          <span>+ Log OPK</span>
        </button>
      </div>

      {bbtOpen && (
        <div style={inlineForm}>
          <label style={fieldLabel}>
            BBT (°C, e.g. 36.4)
            <input
              type="number"
              step="0.01"
              min="35"
              max="38"
              value={bbtValue}
              onChange={(e) => setBbtValue(e.target.value)}
              style={input}
              placeholder="36.50"
              autoFocus
            />
          </label>
          <div style={formActions}>
            <button type="button" style={primaryBtn} onClick={saveBbt} disabled={!bbtValue}>
              <Check size={12} strokeWidth={2.4} /> <span>Save BBT</span>
            </button>
            <button type="button" style={ghostBtn} onClick={() => setBbtOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {opkOpen && (
        <div style={inlineForm}>
          <p style={fieldLabel}>OPK result</p>
          <div style={toggleRow} role="radiogroup" aria-label="OPK result">
            {[
              { key: "positive", label: "Positive", colour: "#6B8F5A" },
              { key: "negative", label: "Negative", colour: "#8A7458" },
            ].map((opt) => {
              const on = opkValue === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setOpkValue(opt.key)}
                  style={{
                    ...toggleBtn,
                    background: on ? opt.colour : "transparent",
                    color: on ? "#FBF6E6" : opt.colour,
                    borderColor: opt.colour,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div style={formActions}>
            <button type="button" style={primaryBtn} onClick={saveOpk} disabled={!opkValue}>
              <Check size={12} strokeWidth={2.4} /> <span>Save OPK</span>
            </button>
            <button type="button" style={ghostBtn} onClick={() => { setOpkOpen(false); setOpkValue(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {savedToast && <p style={toastLine}>{savedToast}</p>}
    </section>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const wrap = {
  background: "linear-gradient(180deg, rgba(107,143,90,0.10), rgba(244,237,219,0.6))",
  border: "1px solid rgba(58,44,26,0.12)",
  borderLeft: "3px solid #6B8F5A",
  borderRadius: 14,
  padding: "14px 14px 16px",
  marginBottom: 12,
};
const headRow = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 };
const iconRow = { display: "flex", alignItems: "center", gap: 8 };
const iconWrap = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 26, height: 26, borderRadius: 9999,
  background: "rgba(107,143,90,0.18)", color: "#3F6228",
};
const eyebrowStyle = {
  fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.18em", color: "#3F6228", textTransform: "uppercase",
  margin: 0,
};
const titleStyle = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500,
  color: "#3A2C1A", lineHeight: 1.22, margin: "2px 0 0",
};
const metaRow = {
  fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6B5840",
  fontStyle: "italic", lineHeight: 1.5, margin: "0 0 10px",
};
const stripRow = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: 6,
  marginBottom: 6,
};
const stripCell = {
  position: "relative",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  borderRadius: 10,
  padding: "8px 2px",
  fontFamily: "'Inter', sans-serif",
  minHeight: 50,
};
const stripCdLabel = { fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em", opacity: 0.7 };
const stripCdNumber = { fontSize: 16, fontWeight: 700, lineHeight: 1, marginTop: 2 };
const peakDot = { position: "absolute", top: 3, right: 6, fontSize: 9, color: "#3F6228" };
const legendRow = {
  display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap",
  marginBottom: 10,
};
const legendItem = {
  display: "inline-flex", alignItems: "center", gap: 4,
  fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "#6B5840",
};
const legendSwatch = { width: 12, height: 12, borderRadius: 4 };
const ctaRow = { display: "flex", gap: 8, marginBottom: 4 };
const logBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "7px 12px",
  borderRadius: 9999,
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.18)",
  color: "#3A2C1A",
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
  cursor: "pointer",
};
const inlineForm = {
  marginTop: 10,
  padding: 10,
  background: "rgba(255,255,255,0.65)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 10,
};
const fieldLabel = {
  display: "block",
  fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.06em", textTransform: "uppercase",
  color: "#6B5840", marginBottom: 4,
};
const input = {
  width: "100%",
  display: "block",
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid rgba(58,44,26,0.18)",
  background: "#FBF6E6",
  color: "#3A2C1A",
  fontFamily: "'Inter', sans-serif", fontSize: 14,
  marginTop: 4,
};
const toggleRow = { display: "flex", gap: 6, marginBottom: 8 };
const toggleBtn = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700,
  cursor: "pointer",
};
const formActions = { display: "flex", gap: 8, marginTop: 6 };
const primaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "7px 14px",
  borderRadius: 9999,
  background: "#3A2C1A",
  color: "#F4EDDB",
  border: "1px solid #3A2C1A",
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
  cursor: "pointer",
};
const ghostBtn = {
  padding: "7px 14px",
  borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.18)",
  color: "#6B5840",
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
  cursor: "pointer",
};
const toastLine = {
  fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#3F6228",
  fontStyle: "italic", margin: "8px 0 0",
};

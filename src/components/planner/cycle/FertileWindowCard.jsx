// ─────────────────────────────────────────────────────────────────────────────
// FertileWindowCard — TTC stage Cycle tab card.
//
// Now persists BBT + OPK to the FertileWindowLog entity.
// Includes BbtChart (14-day sparkline) below the 7-day fertile strip.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState, useEffect, useCallback } from "react";
import { Thermometer, FlaskConical, Check, Plus } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import BbtChart from "./BbtChart";

// ── Confidence curve ──────────────────────────────────────────────────────────
const CONFIDENCE_BY_OFFSET = {
  "-3": "low",
  "-2": "medium",
  "-1": "medium",
  "0":  "high",
  "1":  "high",
  "2":  "medium",
  "3":  "low",
};
const CONFIDENCE_STYLES = {
  low:    { bg: "transparent",               border: "1px solid rgba(58,44,26,0.20)", color: "#6B5840" },
  medium: { bg: "rgba(212,116,90,0.18)",     border: "1px solid rgba(212,116,90,0.40)", color: "#7A3422" },
  high:   { bg: "rgba(107,143,90,0.30)",     border: "1px solid #6B8F5A", color: "#2D4E1A" },
};
const CONFIDENCE_LABEL = { low: "Low", medium: "Building", high: "Peak" };

const todayStr = () => format(new Date(), "yyyy-MM-dd");

export default function FertileWindowCard({ profile, cycleDay, userId }) {
  // ── Derived values ──────────────────────────────────────────────────────────
  const peakDay = useMemo(() => {
    const learned = profile?.cycle_prediction_meta?.predicted_ovulation_day;
    if (Number.isFinite(learned) && learned > 0) return Math.round(learned);
    return 14;
  }, [profile?.cycle_prediction_meta?.predicted_ovulation_day]);

  const todayCd = Number.isFinite(cycleDay) ? cycleDay : null;

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

  // ── Persistence — FertileWindowLog ─────────────────────────────────────────
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const loadLogs = useCallback(async () => {
    if (!userId) return;
    const recs = await base44.entities.FertileWindowLog.filter(
      { user_id: userId },
      "-date",
      30,
    );
    setLogs(recs);
    const today = recs.find((r) => r.date === todayStr());
    setTodayLog(today || null);
  }, [userId]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [bbtOpen, setBbtOpen] = useState(false);
  const [opkOpen, setOpkOpen] = useState(false);
  const [bbtValue, setBbtValue] = useState("");
  const [opkValue, setOpkValue] = useState(null); // 'negative'|'low'|'high'|'peak'

  // Pre-fill from today's existing log.
  useEffect(() => {
    if (todayLog) {
      if (todayLog.bbt_celsius) setBbtValue(String(todayLog.bbt_celsius));
      if (todayLog.lh_result && todayLog.lh_result !== "not_tested") setOpkValue(todayLog.lh_result);
    }
  }, [todayLog]);

  const upsertTodayLog = async (patch) => {
    const uid = userId;
    if (!uid) return;
    setSaving(true);
    if (todayLog?.id) {
      const updated = await base44.entities.FertileWindowLog.update(todayLog.id, patch);
      setTodayLog(updated);
    } else {
      const created = await base44.entities.FertileWindowLog.create({
        user_id: uid,
        date: todayStr(),
        ...patch,
      });
      setTodayLog(created);
    }
    setSaving(false);
    // Refresh 14-day window for chart.
    loadLogs();
  };

  const saveBbt = async () => {
    const val = parseFloat(bbtValue);
    if (!Number.isFinite(val) || val < 35 || val > 38) return;
    await upsertTodayLog({ bbt_celsius: val });
    setBbtOpen(false);
    showToast(`BBT ${val.toFixed(2)} °C saved`);
  };

  const saveOpk = async () => {
    if (!opkValue) return;
    await upsertTodayLog({ lh_result: opkValue });
    setOpkOpen(false);
    showToast(`OPK ${opkValue} saved`);
  };

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!profile) {
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

  // ── Main card ───────────────────────────────────────────────────────────────
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
        Confidence is a soft prediction. BBT + OPK logging tightens the band over a few cycles.
      </p>

      {/* 7-day strip */}
      <div style={stripRow} role="list" aria-label="7-day fertile strip">
        {strip.map((d) => {
          const s = CONFIDENCE_STYLES[d.confidence];
          return (
            <div
              key={d.cd}
              role="listitem"
              aria-label={`CD ${d.cd} · ${CONFIDENCE_LABEL[d.confidence]}${d.isToday ? " · today" : ""}`}
              style={{
                ...stripCell,
                background: s.bg,
                border: s.border,
                color: s.color,
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

      {/* Legend */}
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

      {/* CTA buttons */}
      <div style={ctaRow}>
        <button
          type="button"
          style={logBtn}
          onClick={() => { setBbtOpen(!bbtOpen); setOpkOpen(false); }}
        >
          <Thermometer size={12} strokeWidth={2.0} />
          <span>{todayLog?.bbt_celsius ? `BBT ${todayLog.bbt_celsius} °C` : "+ Log BBT"}</span>
        </button>
        <button
          type="button"
          style={logBtn}
          onClick={() => { setOpkOpen(!opkOpen); setBbtOpen(false); }}
        >
          <FlaskConical size={12} strokeWidth={2.0} />
          <span>
            {todayLog?.lh_result && todayLog.lh_result !== "not_tested"
              ? `OPK: ${todayLog.lh_result}`
              : "+ Log OPK"}
          </span>
        </button>
      </div>

      {/* BBT inline form */}
      {bbtOpen && (
        <div style={inlineForm}>
          <label style={fieldLabel}>
            BBT (°C, e.g. 36.40)
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
            <button
              type="button"
              style={primaryBtn}
              onClick={saveBbt}
              disabled={!bbtValue || saving}
            >
              <Check size={12} strokeWidth={2.4} />
              <span>{saving ? "Saving..." : "Save BBT"}</span>
            </button>
            <button type="button" style={ghostBtn} onClick={() => setBbtOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* OPK inline form */}
      {opkOpen && (
        <div style={inlineForm}>
          <p style={fieldLabel}>OPK result</p>
          <div style={toggleRow} role="radiogroup" aria-label="OPK result">
            {[
              { key: "negative", label: "Negative", colour: "#8A7458" },
              { key: "low",      label: "Low",      colour: "#C4A86A" },
              { key: "high",     label: "High",     colour: "#D47A5A" },
              { key: "peak",     label: "Peak",     colour: "#E11D74" },
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
            <button
              type="button"
              style={primaryBtn}
              onClick={saveOpk}
              disabled={!opkValue || saving}
            >
              <Check size={12} strokeWidth={2.4} />
              <span>{saving ? "Saving..." : "Save OPK"}</span>
            </button>
            <button type="button" style={ghostBtn} onClick={() => { setOpkOpen(false); setOpkValue(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* 14-day BBT sparkline */}
      <BbtChart logs={logs} />

      {toast && <p style={toastLine}>{toast}</p>}
    </section>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
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
  letterSpacing: "0.18em", color: "#3F6228", textTransform: "uppercase", margin: 0,
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
  display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: 6, marginBottom: 6,
};
const stripCell = {
  position: "relative",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  borderRadius: 10, padding: "8px 2px",
  fontFamily: "'Inter', sans-serif", minHeight: 50,
};
const stripCdLabel   = { fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em", opacity: 0.7 };
const stripCdNumber  = { fontSize: 16, fontWeight: 700, lineHeight: 1, marginTop: 2 };
const peakDot        = { position: "absolute", top: 3, right: 6, fontSize: 9, color: "#3F6228" };
const legendRow      = { display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 };
const legendItem     = { display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "#6B5840" };
const legendSwatch   = { width: 12, height: 12, borderRadius: 4 };
const ctaRow         = { display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap" };
const logBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "7px 12px", borderRadius: 9999,
  background: "rgba(255,255,255,0.55)",
  border: "1px solid rgba(58,44,26,0.18)",
  color: "#3A2C1A",
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer",
};
const inlineForm = {
  marginTop: 10, padding: 10,
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
  width: "100%", display: "block",
  padding: "7px 10px", borderRadius: 8,
  border: "1px solid rgba(58,44,26,0.18)",
  background: "#FBF6E6", color: "#3A2C1A",
  fontFamily: "'Inter', sans-serif", fontSize: 14, marginTop: 4,
};
const toggleRow = { display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" };
const toggleBtn = {
  flex: 1,
  padding: "7px 8px",
  borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
  cursor: "pointer", minWidth: 60,
};
const formActions = { display: "flex", gap: 8, marginTop: 6 };
const primaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "7px 14px", borderRadius: 9999,
  background: "#3A2C1A", color: "#F4EDDB",
  border: "1px solid #3A2C1A",
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer",
};
const ghostBtn = {
  padding: "7px 14px", borderRadius: 9999,
  background: "transparent",
  border: "1px solid rgba(58,44,26,0.18)",
  color: "#6B5840",
  fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer",
};
const toastLine = {
  fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#3F6228",
  fontStyle: "italic", margin: "8px 0 0",
};
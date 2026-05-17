// ─────────────────────────────────────────────────────────────────────────────
// FertileWindowCard — TTC stage Cycle tab card.
//
// Persists BBT to BbtLog entity and OPK to OpkLog entity.
// Includes BbtChart (14-day sparkline) below the 7-day fertile strip.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { Thermometer, FlaskConical, Check, Plus, X } from "lucide-react";
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

// ── Inline slide-down form ───────────────────────────────────────────────────
function BbtForm({ userId, onSaved, onCancel }) {
  const [date, setDate] = useState(todayStr());
  const [temp, setTemp] = useState("");
  const [timeTaken, setTimeTaken] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    const val = parseFloat(temp);
    if (!Number.isFinite(val) || val < 35 || val > 38) {
      setError("Temperature must be between 35 and 38 °C");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await base44.entities.BbtLog.create({
        user_id: userId,
        date,
        temp_celsius: val,
        ...(timeTaken ? { time_taken: timeTaken } : {}),
        ...(notes ? { notes } : {}),
      });
      onSaved();
    } catch {
      setError("Couldn't save — try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={inlineForm}>
      <div style={formHeader}>
        <span style={fieldLabel}>Log BBT</span>
        <button type="button" style={cancelIconBtn} onClick={onCancel} aria-label="Cancel">
          <X size={13} strokeWidth={2.2} />
        </button>
      </div>

      <label style={fieldLabel}>
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={input}
        />
      </label>

      <label style={fieldLabel}>
        Temperature (°C)
        <input
          type="number"
          step="0.01"
          min="35"
          max="38"
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          style={input}
          placeholder="36.5"
          autoFocus
        />
      </label>

      <label style={fieldLabel}>
        Time taken
        <input
          type="text"
          value={timeTaken}
          onChange={(e) => setTimeTaken(e.target.value)}
          style={input}
          placeholder="e.g. 07:00"
        />
      </label>

      <label style={fieldLabel}>
        Notes
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={input}
          placeholder="Optional notes"
        />
      </label>

      {error && <p style={errorLine}>{error}</p>}

      <div style={formActions}>
        <button
          type="button"
          style={primaryBtn}
          onClick={handleSave}
          disabled={!temp || saving}
        >
          <Check size={12} strokeWidth={2.4} />
          <span>{saving ? "Saving..." : "Save BBT"}</span>
        </button>
        <button type="button" style={ghostBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function OpkForm({ userId, onSaved, onCancel }) {
  const [date, setDate] = useState(todayStr());
  const [result, setResult] = useState("");
  const [brand, setBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!result) {
      setError("Please select a result");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await base44.entities.OpkLog.create({
        user_id: userId,
        date,
        result,
        ...(brand ? { brand } : {}),
        ...(notes ? { notes } : {}),
      });
      onSaved();
    } catch {
      setError("Couldn't save — try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={inlineForm}>
      <div style={formHeader}>
        <span style={fieldLabel}>Log OPK</span>
        <button type="button" style={cancelIconBtn} onClick={onCancel} aria-label="Cancel">
          <X size={13} strokeWidth={2.2} />
        </button>
      </div>

      <label style={fieldLabel}>
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={input}
        />
      </label>

      <label style={fieldLabel}>
        Result
        <select
          value={result}
          onChange={(e) => setResult(e.target.value)}
          style={input}
        >
          <option value="">Select result</option>
          <option value="negative">Negative</option>
          <option value="positive">Positive</option>
          <option value="peak">Peak</option>
        </select>
      </label>

      <label style={fieldLabel}>
        Brand
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          style={input}
          placeholder="e.g. Clearblue"
        />
      </label>

      <label style={fieldLabel}>
        Notes
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={input}
          placeholder="Optional notes"
        />
      </label>

      {error && <p style={errorLine}>{error}</p>}

      <div style={formActions}>
        <button
          type="button"
          style={primaryBtn}
          onClick={handleSave}
          disabled={!result || saving}
        >
          <Check size={12} strokeWidth={2.4} />
          <span>{saving ? "Saving..." : "Save OPK"}</span>
        </button>
        <button type="button" style={ghostBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function FertileWindowCard({ profile, cycleDay, userId }) {
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

  // ── Inline form toggle ───────────────────────────────────────────────────────
  const [openForm, setOpenForm] = useState(null); // null | 'bbt' | 'opk'
  const [chartKey, setChartKey] = useState(0);

  const toggleForm = (form) => setOpenForm((prev) => (prev === form ? null : form));

  const handleSaved = () => {
    setOpenForm(null);
    setChartKey((k) => k + 1);
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
        <button type="button" style={primaryBtn} onClick={() => setOpenForm("bbt")}>
          <Plus size={13} strokeWidth={2.4} />
          <span>Log today</span>
        </button>
        {openForm === "bbt" && (
          <BbtForm userId={userId} onSaved={handleSaved} onCancel={() => setOpenForm(null)} />
        )}
        <BbtChart userId={userId} refreshKey={chartKey} />
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
          style={{ ...logBtn, ...(openForm === "bbt" ? logBtnActive : {}) }}
          onClick={() => toggleForm("bbt")}
        >
          <Thermometer size={12} strokeWidth={2.0} />
          <span>+ Log BBT</span>
        </button>
        <button
          type="button"
          style={{ ...logBtn, ...(openForm === "opk" ? logBtnActive : {}) }}
          onClick={() => toggleForm("opk")}
        >
          <FlaskConical size={12} strokeWidth={2.0} />
          <span>+ Log OPK</span>
        </button>
      </div>

      {/* Inline slide-down forms */}
      {openForm === "bbt" && (
        <BbtForm userId={userId} onSaved={handleSaved} onCancel={() => setOpenForm(null)} />
      )}
      {openForm === "opk" && (
        <OpkForm userId={userId} onSaved={handleSaved} onCancel={() => setOpenForm(null)} />
      )}

      {/* 14-day BBT sparkline */}
      <BbtChart userId={userId} refreshKey={chartKey} />
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
const logBtnActive = {
  background: "rgba(58,44,26,0.10)",
  border: "1px solid rgba(58,44,26,0.35)",
};
const inlineForm = {
  marginTop: 10, padding: 12,
  background: "rgba(255,255,255,0.72)",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 10,
  display: "flex", flexDirection: "column", gap: 8,
};
const formHeader = {
  display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2,
};
const cancelIconBtn = {
  background: "none", border: "none", cursor: "pointer",
  color: "#6B5840", padding: 2, lineHeight: 1,
};
const fieldLabel = {
  display: "block",
  fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.06em", textTransform: "uppercase",
  color: "#6B5840", marginBottom: 0,
};
const input = {
  width: "100%", display: "block",
  padding: "7px 10px", borderRadius: 8,
  border: "1px solid rgba(58,44,26,0.18)",
  background: "#FBF6E6", color: "#3A2C1A",
  fontFamily: "'Inter', sans-serif", fontSize: 14, marginTop: 4,
  boxSizing: "border-box",
};
const formActions = { display: "flex", gap: 8, marginTop: 4 };
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
const errorLine = {
  fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#C0392B",
  margin: 0,
};
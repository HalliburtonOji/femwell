// HotFlashCard — Sprint 9
//
// Hot flash logger that renders on /Today → Track → Symptoms ONLY
// when profile.life_stage is perimenopause | menopause | post-menopause.
// Writes to SymptomLogs with symptom_type = "hot_flash" so the same
// row shape is consistent with how UniversalLogger and SymptomLogForm
// write the rest of the symptom catalogue.

import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Flame, Minus, Plus, Clock, Check } from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  sage:     "#8FAF8F",
  blush:    "#E8B4B8",
  border:   "#D4C9B4",
  flame:    "#D45E52",
};

const INTENSITIES = [
  { value: "none",        label: "None",        tint: "#9B8B7A" },
  { value: "mild",        label: "Mild",        tint: "#E0B07A" },
  { value: "moderate",    label: "Moderate",    tint: "#D49A4E" },
  { value: "severe",      label: "Severe",      tint: "#C66B3C" },
  { value: "very_severe", label: "Very Severe", tint: "#A03A2A" },
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HotFlashCard({ user }) {
  // QA fix — the state was previously named `intensity` and aliased
  // into the `severity:` property of the payload. Renaming the state
  // to `severity` removes any chance of mis-named field drift; the
  // payload key has always been `severity`, but this makes the code
  // unambiguous on inspection. `date: today` is also explicitly
  // present in BOTH the rich payload and the schema-drift fallback.
  const [severity, setSeverity] = useState("moderate");
  const [count, setCount] = useState(1);
  const [lastFlashTime, setLastFlashTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastLogged, setLastLogged] = useState(null);
  const today = todayISO();

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.SymptomLogs
          .filter({ user_id: user.id, symptom_type: "hot_flash" }, "-logged_at", 1)
          .catch(() => []);
        if (cancelled) return;
        setLastLogged(rows?.[0] || null);
      } catch { /* swallow */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  async function handleLog() {
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      // QA fix — SymptomLogs requires `date` in strict YYYY-MM-DD format
      // (server rejected with 422 when this slot was missing or relied on
      // the closure variable). Computing `dateStr` inline at call time
      // with `toISOString().slice(0, 10)` guarantees the right shape and
      // can't go stale across day boundaries.
      const dateStr = new Date().toISOString().slice(0, 10);
      const rich = {
        user_id: user.id,
        created_by: user.id,
        symptom_type: "hot_flash",
        symptom_name: "Hot flash",
        severity,
        count: count,
        notes: lastFlashTime ? `Last at ${lastFlashTime}` : "",
        date: dateStr,
        logged_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const created = await base44.entities.SymptomLogs.create(rich).catch(async () => {
        // Schema drift fallback — minimal payload (same dateStr).
        const minimal = {
          user_id: user.id,
          symptom_type: "hot_flash",
          severity,
          date: dateStr,
        };
        return await base44.entities.SymptomLogs.create(minimal);
      });
      if (created) setLastLogged(created);
    } catch { /* swallow */ }
    finally { setSaving(false); }
  }

  const severityLabel = INTENSITIES.find((i) => i.value === (lastLogged?.severity || ""))?.label || lastLogged?.severity;

  return (
    <article style={{
      background: C.paperHi,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.flame}`,
      borderRadius: 16,
      padding: "14px 14px 12px",
      display: "flex", flexDirection: "column", gap: 12,
      }}>
      <header style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: "rgba(212,94,82,0.12)",
          color: C.flame,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Flame size={16} /></span>
        <div>
          <p style={{
            margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: C.flame,
          }}>Track</p>
          <h3 style={{
            margin: "2px 0 0", fontSize: 16, fontWeight: 600,
            color: C.espresso, lineHeight: 1.2,
          }}>Hot Flashes Today</h3>
        </div>
      </header>

      {/* Intensity row */}
      <div>
        <p style={tileLabel}>Intensity</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {INTENSITIES.map((opt) => {
            const on = severity === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSeverity(opt.value)}
                style={{
                  ...chipBtn,
                  background: on ? opt.tint + "33" : "transparent",
                  borderColor: on ? opt.tint : C.border,
                  color: on ? opt.tint : C.espresso,
                  fontWeight: on ? 700 : 500,
                }}
              >{opt.label}</button>
            );
          })}
        </div>
      </div>

      {/* Count stepper + Last-flash time */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 140px" }}>
          <p style={tileLabel}>Today's count</p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: C.cream, border: `1px solid ${C.border}`,
            borderRadius: 999, padding: "4px 8px",
          }}>
            <button type="button" onClick={() => setCount(Math.max(0, count - 1))} style={stepBtn} aria-label="decrease">
              <Minus size={14} />
            </button>
            <span style={{ minWidth: 32, textAlign: "center", fontWeight: 700, color: C.espresso }}>{count}</span>
            <button type="button" onClick={() => setCount(Math.min(20, count + 1))} style={stepBtn} aria-label="increase">
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <p style={tileLabel}>Last flash at <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: C.muted }}>(optional)</span></p>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: C.cream, border: `1px solid ${C.border}`,
            borderRadius: 999, padding: "4px 10px",
          }}>
            <Clock size={14} style={{ color: C.muted }} />
            <input
              type="time"
              value={lastFlashTime}
              onChange={(e) => setLastFlashTime(e.target.value)}
              style={{
                border: "none", outline: "none", background: "transparent",
                fontFamily: "inherit", fontSize: 13, color: C.espresso, flex: 1, minWidth: 60,
              }}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLog}
        disabled={saving}
        style={{
          background: C.espresso, color: C.cream,
          border: "none", borderRadius: 12,
          padding: "10px 14px", fontWeight: 700, fontSize: 13,
          cursor: saving ? "default" : "pointer",
          opacity: saving ? 0.6 : 1,
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        <Check size={14} /> {saving ? "Logging…" : "Log"}
      </button>

      {lastLogged && (
        <p style={{
          margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.4,
        }}>
          Last logged: {lastLogged.count != null ? `${lastLogged.count} ` : ""}
          {(severityLabel || "moderate").toLowerCase()} flashes
          {lastLogged.notes ? ` · ${lastLogged.notes}` : ""}.
        </p>
      )}
    </article>
  );
}

const tileLabel = {
  margin: "0 0 6px",
  fontSize: 10, fontWeight: 700,
  letterSpacing: "0.16em", textTransform: "uppercase",
  color: C.muted,
};
const chipBtn = {
  padding: "8px 12px",
  borderRadius: 999,
  border: `1.5px solid ${C.border}`,
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12.5,
  transition: "all 0.15s ease",
};
const stepBtn = {
  width: 28, height: 28, borderRadius: 999,
  background: "transparent", border: "none", cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  color: "#3A2C1A",
};

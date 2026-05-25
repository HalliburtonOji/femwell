// BrainFogCard — Sprint 9
//
// Brain fog logger gated on profile.life_stage. Single-tap log: pick
// a severity from the 5-point scale and the button writes a SymptomLogs
// row. Sub-label spells out what "brain fog" covers so the user knows
// what they're tracking.

import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, Check } from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  border:   "#D4C9B4",
  fog:      "#8B7AAF",
};

const SEVERITIES = [
  { value: "none",        label: "None",        tint: "#9B8B7A" },
  { value: "mild",        label: "Mild",        tint: "#A8B0C2" },
  { value: "moderate",    label: "Moderate",    tint: "#8B7AAF" },
  { value: "significant", label: "Significant", tint: "#6B5A8F" },
  { value: "severe",      label: "Severe",      tint: "#4A3A6F" },
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BrainFogCard({ user }) {
  const [severity, setSeverity] = useState("moderate");
  const [saving, setSaving] = useState(false);
  const [lastLogged, setLastLogged] = useState(null);
  const today = todayISO();

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.SymptomLogs
          .filter({ user_id: user.id, symptom_type: "brain_fog" }, "-logged_at", 1)
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
      const rich = {
        user_id: user.id,
        created_by: user.id,
        symptom_type: "brain_fog",
        symptom_name: "Brain fog",
        severity,
        date: today,
        logged_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const created = await base44.entities.SymptomLogs.create(rich).catch(async () => {
        const minimal = { user_id: user.id, symptom_type: "brain_fog", severity, date: today };
        return await base44.entities.SymptomLogs.create(minimal);
      });
      if (created) setLastLogged(created);
    } catch { /* swallow */ }
    finally { setSaving(false); }
  }

  const lastLabel = SEVERITIES.find((s) => s.value === (lastLogged?.severity || ""))?.label;

  return (
    <article style={{
      background: C.paperHi,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.fog}`,
      borderRadius: 16,
      padding: "14px 14px 12px",
      display: "flex", flexDirection: "column", gap: 12,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <header style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: "rgba(139,122,175,0.18)",
          color: C.fog,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><Brain size={16} /></span>
        <div>
          <p style={{
            margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", color: C.fog,
          }}>Track</p>
          <h3 style={{
            margin: "2px 0 0", fontSize: 16, fontWeight: 600,
            fontFamily: "'Fraunces', Georgia, serif", color: C.espresso, lineHeight: 1.2,
          }}>Brain Fog</h3>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted, fontStyle: "italic" }}>
            Affects focus, memory, word recall
          </p>
        </div>
      </header>

      <div>
        <p style={tileLabel}>How clear is your head today?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SEVERITIES.map((opt) => {
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
        <Check size={14} /> {saving ? "Logging…" : "Log Today's Fog"}
      </button>

      {lastLogged && (
        <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
          Last logged: {(lastLabel || lastLogged.severity || "").toLowerCase()}.
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

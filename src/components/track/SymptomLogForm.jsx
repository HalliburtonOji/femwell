import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SYMPTOM_VOCAB, symptomLabel } from "@/utils/symptomLabels";
import { Loader2, Check } from "lucide-react";

// Single-day symptom/mood/energy log form with upsert-on-date semantics.
// Writes into DailyCheckins so it unifies with existing checkin data.

const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

function Slider({ label, value, onChange, ariaLabel }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{label}</span>
        <span style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{value || "—"}/5</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${ariaLabel} ${n} of 5`}
            aria-pressed={value === n}
            style={{
              flex: 1, minHeight: 44, borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 700, fontFamily: "'Inter', sans-serif",
              backgroundColor: value === n ? "var(--plum)" : "var(--ivory-dark)",
              color: value === n ? "white" : "var(--mauve)",
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SymptomLogForm({ userId, dateStr, existing, onSaved }) {
  const [symptoms, setSymptoms] = useState([]);
  const [severity, setSeverity] = useState(null);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [sleepHours, setSleepHours] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (existing) {
      setSymptoms(Array.isArray(existing.symptoms) ? existing.symptoms : []);
      setSeverity(existing.symptom_severity ?? null);
      setMood(existing.mood_score ?? existing.mood ?? null);
      setEnergy(existing.energy_level ?? existing.energy ?? null);
      setSleepHours(existing.sleep_hours != null ? String(existing.sleep_hours) : "");
      setNotes(existing.notes || "");
      setSavedAt(existing.updated_at || existing.updated_date || null);
    }
  }, [existing]);

  const toggleSymptom = (slug) => {
    setSymptoms(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const handleSave = async () => {
    if (!userId || !dateStr) return;
    setSaving(true);

    const payload = {
      user_id: userId,
      date: dateStr,
      symptoms,
      symptom_severity: severity,
      mood_score: mood,
      energy_level: energy,
      sleep_hours: sleepHours ? Number(sleepHours) : null,
      notes: (notes || "").slice(0, 500),
      // Keep legacy fields in sync so heatmap/insights keep working.
      mood: mood,
      energy: energy,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      await base44.entities.DailyCheckins.update(existing.id, payload).catch(() => {});
    } else {
      const created = await base44.entities.DailyCheckins.create(payload).catch(() => null);
      if (created && onSaved) onSaved(created);
    }
    setSavedAt(new Date().toISOString());
    setSaving(false);
    onSaved?.();
  };

  const notesRemaining = 500 - (notes?.length || 0);

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "18px 18px 20px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={sLabel}>Log today</p>
        {savedAt && (
          <span style={{ fontSize: 10, color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>
            Updated {new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* Symptom chip picker */}
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Symptoms</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {SYMPTOM_VOCAB.map(slug => {
          const active = symptoms.includes(slug);
          return (
            <button
              key={slug}
              type="button"
              onClick={() => toggleSymptom(slug)}
              aria-label={`Toggle ${symptomLabel(slug)}`}
              aria-pressed={active}
              style={{
                minHeight: 32, padding: "6px 12px", borderRadius: 9999,
                border: "1px solid", borderColor: active ? "var(--plum)" : "var(--border)",
                backgroundColor: active ? "var(--plum)" : "transparent",
                color: active ? "white" : "var(--mauve)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {symptomLabel(slug)}
            </button>
          );
        })}
      </div>

      <Slider label="Symptom severity" value={severity} onChange={setSeverity} ariaLabel="Severity" />
      <Slider label="Mood" value={mood} onChange={setMood} ariaLabel="Mood" />
      <Slider label="Energy" value={energy} onChange={setEnergy} ariaLabel="Energy" />

      <div style={{ marginBottom: 14 }}>
        <label
          htmlFor="sleep-hours-input"
          style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}
        >
          Sleep hours (optional)
        </label>
        <input
          id="sleep-hours-input"
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
          placeholder="e.g. 7.5"
          style={{
            width: "100%", minHeight: 44, padding: "10px 14px",
            borderRadius: 12, border: "1.5px solid var(--border)",
            backgroundColor: "var(--ivory)", color: "var(--plum)",
            fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none",
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="checkin-notes"
          style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}
        >
          Notes (optional)
        </label>
        <textarea
          id="checkin-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="Anything you want to remember…"
          style={{
            width: "100%", padding: "10px 14px", resize: "vertical",
            borderRadius: 12, border: "1.5px solid var(--border)",
            backgroundColor: "var(--ivory)", color: "var(--plum)",
            fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none",
          }}
        />
        <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 4, textAlign: "right" }}>
          {notesRemaining} characters left
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        aria-label="Save today's log"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          width: "100%", minHeight: 48, borderRadius: 9999,
          backgroundColor: "var(--plum)", color: "white", border: "none",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          fontFamily: "'Inter', sans-serif", opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save log</>}
      </button>
    </div>
  );
}
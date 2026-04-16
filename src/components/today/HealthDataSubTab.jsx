import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Check, Loader2, Trash2, AlertTriangle } from "lucide-react";

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};
const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 20, boxShadow: "var(--shadow-sm)",
};
const input = {
  width: "100%", padding: "8px 10px", borderRadius: 10,
  border: "1px solid var(--border)", backgroundColor: "var(--ivory)",
  fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)",
  outline: "none", boxSizing: "border-box",
};

const SOURCES = ["Apple Health", "Oura", "Garmin", "Fitbit", "Manual"];

const LAB_MARKERS = [
  { name: "FSH", category: "Hormones", unit: "IU/L" },
  { name: "LH", category: "Hormones", unit: "IU/L" },
  { name: "Estradiol", category: "Hormones", unit: "pmol/L" },
  { name: "Progesterone", category: "Hormones", unit: "nmol/L" },
  { name: "AMH", category: "Hormones", unit: "pmol/L" },
  { name: "Testosterone", category: "Hormones", unit: "nmol/L" },
  { name: "TSH", category: "Thyroid", unit: "mIU/L" },
  { name: "T3", category: "Thyroid", unit: "pmol/L" },
  { name: "T4", category: "Thyroid", unit: "pmol/L" },
  { name: "Ferritin", category: "Iron", unit: "µg/L" },
  { name: "Vitamin D", category: "Vitamins", unit: "nmol/L" },
  { name: "HbA1c", category: "Metabolic", unit: "%" },
  { name: "Fasting glucose", category: "Metabolic", unit: "mmol/L" },
  { name: "Iron", category: "Iron", unit: "µmol/L" },
];

const LAB_CATEGORIES = ["Hormones", "Thyroid", "Iron", "Vitamins", "Metabolic", "Other"];

// ── Wearable Metrics Form ─────────────────────────────────────────────────────
function WearableForm({ user, selectedDate }) {
  const empty = { resting_heart_rate: "", hrv_ms: "", body_temp_celsius: "", steps: "", active_calories: "", sleep_rem_hours: "", sleep_deep_hours: "", sleep_light_hours: "", readiness_score: 70, spo2_percent: "", source: "Manual" };
  const [form, setForm] = useState(empty);
  const [existingId, setExistingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.WearableSync.filter({ user_id: user.id, date: selectedDate })
      .then(records => {
        if (records[0]) {
          setExistingId(records[0].id);
          const r = records[0];
          setForm({
            resting_heart_rate: r.resting_heart_rate ?? "",
            hrv_ms: r.hrv_ms ?? "",
            body_temp_celsius: r.body_temp_celsius ?? "",
            steps: r.steps ?? "",
            active_calories: r.active_calories ?? "",
            sleep_rem_hours: r.sleep_rem_hours ?? "",
            sleep_deep_hours: r.sleep_deep_hours ?? "",
            sleep_light_hours: r.sleep_light_hours ?? "",
            readiness_score: r.readiness_score ?? 70,
            spo2_percent: r.spo2_percent ?? "",
            source: r.source || "Manual",
          });
        } else {
          setExistingId(null);
          setForm(empty);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, selectedDate]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const numericFields = (key) => (v) => set(key, v === "" ? "" : Number(v));

  const save = async () => {
    setSaving(true);
    const payload = {
      user_id: user.id, date: selectedDate, source: form.source,
      ...(form.resting_heart_rate !== "" && { resting_heart_rate: Number(form.resting_heart_rate) }),
      ...(form.hrv_ms !== "" && { hrv_ms: Number(form.hrv_ms) }),
      ...(form.body_temp_celsius !== "" && { body_temp_celsius: Number(form.body_temp_celsius) }),
      ...(form.steps !== "" && { steps: Number(form.steps) }),
      ...(form.active_calories !== "" && { active_calories: Number(form.active_calories) }),
      ...(form.sleep_rem_hours !== "" && { sleep_rem_hours: Number(form.sleep_rem_hours) }),
      ...(form.sleep_deep_hours !== "" && { sleep_deep_hours: Number(form.sleep_deep_hours) }),
      ...(form.sleep_light_hours !== "" && { sleep_light_hours: Number(form.sleep_light_hours) }),
      readiness_score: Number(form.readiness_score),
      ...(form.spo2_percent !== "" && { spo2_percent: Number(form.spo2_percent) }),
      updated_at: new Date().toISOString(),
    };
    if (existingId) {
      await base44.entities.WearableSync.update(existingId, payload);
    } else {
      const created = await base44.entities.WearableSync.create({ ...payload, created_at: new Date().toISOString() });
      setExistingId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--mauve)" }} /></div>;

  return (
    <div style={{ ...card, padding: 20 }}>
      <div className="flex items-center justify-between mb-4">
        <p style={sLabel}>Today's metrics — {selectedDate}</p>
        {existingId && <span style={{ fontSize: 10, color: "var(--sage)", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Edit mode</span>}
      </div>

      {/* Source */}
      <div className="mb-4">
        <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>Source</p>
        <div className="flex gap-2 flex-wrap">
          {SOURCES.map(s => (
            <button key={s} onClick={() => set("source", s)}
              style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: form.source === s ? "var(--plum)" : "var(--ivory-dark)", color: form.source === s ? "white" : "var(--mauve)" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { key: "resting_heart_rate", label: "Resting HR (bpm)", type: "number", step: 1 },
          { key: "hrv_ms", label: "HRV (ms)", type: "number", step: 1 },
          { key: "body_temp_celsius", label: "Body temp (°C)", type: "number", step: 0.1 },
          { key: "steps", label: "Steps", type: "number", step: 1 },
          { key: "active_calories", label: "Active calories", type: "number", step: 1 },
          { key: "spo2_percent", label: "SpO₂ (%)", type: "number", step: 1, min: 90, max: 100 },
          { key: "sleep_rem_hours", label: "REM sleep (hrs)", type: "number", step: 0.5 },
          { key: "sleep_deep_hours", label: "Deep sleep (hrs)", type: "number", step: 0.5 },
          { key: "sleep_light_hours", label: "Light sleep (hrs)", type: "number", step: 0.5 },
        ].map(f => (
          <div key={f.key}>
            <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{f.label}</p>
            <input
              type={f.type}
              step={f.step}
              min={f.min}
              max={f.max}
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              style={input}
              placeholder="—"
            />
          </div>
        ))}
      </div>

      {/* Readiness slider */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Readiness score</p>
          <strong style={{ fontSize: 12, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{form.readiness_score}/100</strong>
        </div>
        <input type="range" min={0} max={100} value={form.readiness_score} onChange={e => set("readiness_score", e.target.value)} style={{ width: "100%" }} />
      </div>

      <button onClick={save} disabled={saving}
        style={{ width: "100%", padding: "11px", borderRadius: 12, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: saved ? "var(--sage)" : "var(--plum)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {saving ? "Saving…" : saved ? "Saved!" : existingId ? "Update metrics" : "Save metrics"}
      </button>
    </div>
  );
}

// ── Lab Results Section ───────────────────────────────────────────────────────
function LabResultsSection({ user }) {
  const emptyForm = { marker_name: "", value: "", unit: "", test_date: new Date().toISOString().split("T")[0], lab_name: "", normal_range_min: "", normal_range_max: "", category: "Other", notes: "" };
  const [results, setResults] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [markerSuggestions, setMarkerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    base44.entities.LabResults.filter({ user_id: user.id }, "-test_date", 100)
      .then(setResults).catch(() => {});
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleMarkerInput = (v) => {
    set("marker_name", v);
    if (v.length >= 1) {
      const suggestions = LAB_MARKERS.filter(m => m.name.toLowerCase().includes(v.toLowerCase()));
      setMarkerSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectMarker = (m) => {
    setForm(f => ({ ...f, marker_name: m.name, category: m.category, unit: m.unit }));
    setShowSuggestions(false);
  };

  const save = async () => {
    if (!form.marker_name || !form.value || !form.test_date) return;
    setSaving(true);
    const created = await base44.entities.LabResults.create({
      user_id: user.id,
      marker_name: form.marker_name,
      value: Number(form.value),
      unit: form.unit,
      test_date: form.test_date,
      lab_name: form.lab_name || undefined,
      normal_range_min: form.normal_range_min !== "" ? Number(form.normal_range_min) : undefined,
      normal_range_max: form.normal_range_max !== "" ? Number(form.normal_range_max) : undefined,
      category: form.category,
      notes: form.notes || undefined,
      created_at: new Date().toISOString(),
    });
    setResults(prev => [created, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  };

  const remove = async (id) => {
    await base44.entities.LabResults.delete(id);
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const isOutOfRange = (r) => {
    if (r.normal_range_min == null && r.normal_range_max == null) return false;
    if (r.normal_range_min != null && r.value < r.normal_range_min) return true;
    if (r.normal_range_max != null && r.value > r.normal_range_max) return true;
    return false;
  };

  const grouped = LAB_CATEGORIES.reduce((acc, cat) => {
    const items = results.filter(r => r.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div style={{ ...card, padding: 20 }}>
      <div className="flex items-center justify-between mb-4">
        <p style={sLabel}>Lab Results</p>
        <button onClick={() => setShowForm(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: "var(--plum)", color: "white" }}>
          <Plus className="w-3 h-3" /> Add result
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Marker name *</p>
            <input value={form.marker_name} onChange={e => handleMarkerInput(e.target.value)} onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="e.g. FSH, Vitamin D" style={input} />
            {showSuggestions && (
              <div style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 10, backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
                {markerSuggestions.map(m => (
                  <button key={m.name} onClick={() => selectMarker(m)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", fontSize: 12, fontFamily: "'Inter', sans-serif", color: "var(--plum)", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid var(--border-subtle)" }}>
                    {m.name} <span style={{ color: "var(--mauve)", fontSize: 10 }}>· {m.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Value *</p>
              <input type="number" value={form.value} onChange={e => set("value", e.target.value)} placeholder="0" style={input} />
            </div>
            <div>
              <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Unit</p>
              <input value={form.unit} onChange={e => set("unit", e.target.value)} placeholder="e.g. nmol/L" style={input} />
            </div>
            <div>
              <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Test date *</p>
              <input type="date" value={form.test_date} onChange={e => set("test_date", e.target.value)} style={input} />
            </div>
            <div>
              <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Lab name</p>
              <input value={form.lab_name} onChange={e => set("lab_name", e.target.value)} placeholder="Optional" style={input} />
            </div>
            <div>
              <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Normal min</p>
              <input type="number" value={form.normal_range_min} onChange={e => set("normal_range_min", e.target.value)} placeholder="Optional" style={input} />
            </div>
            <div>
              <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Normal max</p>
              <input type="number" value={form.normal_range_max} onChange={e => set("normal_range_max", e.target.value)} placeholder="Optional" style={input} />
            </div>
          </div>
          <div className="mb-2">
            <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Category</p>
            <div className="flex gap-1.5 flex-wrap">
              {LAB_CATEGORIES.map(c => (
                <button key={c} onClick={() => set("category", c)}
                  style={{ padding: "4px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: form.category === c ? "var(--plum)" : "var(--ivory-dark)", color: form.category === c ? "white" : "var(--mauve)" }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Notes (optional)" style={{ ...input, marginBottom: 10 }} />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "transparent", fontSize: 12, fontWeight: 600, color: "var(--mauve)", cursor: "pointer" }}>Cancel</button>
            <button onClick={save} disabled={saving || !form.marker_name || !form.value}
              style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: (!form.marker_name || !form.value) ? 0.5 : 1 }}>
              {saving ? "Saving…" : "Save result"}
            </button>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No lab results yet. Add your blood test results to track your hormone and health markers over time.</p>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-4">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>{cat}</p>
            <div className="space-y-2">
              {items.map(r => {
                const flagged = isOutOfRange(r);
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 12, backgroundColor: flagged ? "var(--rose-dust-subtle)" : "var(--ivory)", border: `1px solid ${flagged ? "var(--rose-dust-light)" : "var(--border-subtle)"}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2">
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{r.marker_name}</p>
                        {flagged && <AlertTriangle style={{ width: 12, height: 12, color: "var(--rose-dust)", flexShrink: 0 }} />}
                      </div>
                      <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                        {r.value} {r.unit} · {r.test_date}
                        {r.lab_name ? ` · ${r.lab_name}` : ""}
                        {r.normal_range_min != null || r.normal_range_max != null ? ` (ref: ${r.normal_range_min ?? ""}–${r.normal_range_max ?? ""})` : ""}
                      </p>
                    </div>
                    <button onClick={() => remove(r.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
                      <Trash2 style={{ width: 13, height: 13, color: "var(--mauve)" }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HealthDataSubTab({ user, selectedDate }) {
  return (
    <div className="pt-4 space-y-4">
      <WearableForm user={user} selectedDate={selectedDate} />
      <LabResultsSection user={user} />
    </div>
  );
}
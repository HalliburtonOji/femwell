import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const SYMPTOMS = ["Hot flush", "Night sweats", "Sleep issues", "Mood changes", "Anxiety", "Brain fog", "Joint pain", "Low libido", "Vaginal dryness", "Bleeding changes"];
const TRIGGERS = ["Caffeine", "Alcohol", "Spicy food", "Stress", "Warm room", "Poor sleep", "Exercise", "Tight clothing"];
const todayStr = new Date().toISOString().split("T")[0];
const card = { backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, boxShadow: "var(--shadow-sm)" };
const inp = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" };

export default function SymptomDiarySection({ user }) {
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [severity, setSeverity] = useState(3);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [todayEntries, setTodayEntries] = useState([]);
  const [weekEntries, setWeekEntries] = useState([]);

  useEffect(() => {
    if (user?.id) loadEntries();
  }, [user]);

  const loadEntries = async () => {
    const ws = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const all = await base44.entities.MenopauseSymptomEntry.filter({ user_id: user.id }).catch(() => []);
    setTodayEntries(all.filter(e => e.day_key === todayStr));
    setWeekEntries(all.filter(e => e.day_key >= ws));
  };

  const toggleTrigger = (t) => setSelectedTriggers(c => c.includes(t) ? c.filter(x => x !== t) : [...c, t]);

  const save = async () => {
    if (!selectedSymptom || !user?.id) return;
    setSaving(true);
    await base44.entities.MenopauseSymptomEntry.create({
      user_id: user.id, day_key: todayStr,
      symptom_type: selectedSymptom, severity_1_5: severity,
      trigger_tags: selectedTriggers, notes: notes || undefined,
      created_at: new Date().toISOString(),
    }).catch(() => {});
    toast.success("Symptom logged");
    setSelectedSymptom(null); setSeverity(3); setSelectedTriggers([]); setNotes("");
    loadEntries(); // background refetch — don't gate the UI on the read
    setSaving(false);
  };

  const symptomCounts = weekEntries.reduce((acc, e) => { acc[e.symptom_type] = (acc[e.symptom_type] || 0) + 1; return acc; }, {});
  const top3 = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const triggerCounts = weekEntries.flatMap(e => e.trigger_tags || []).reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const topTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", marginBottom: 12 }}>Log a symptom</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {SYMPTOMS.map(s => (
            <button key={s} onClick={() => setSelectedSymptom(selectedSymptom === s ? null : s)}
              style={{ padding: "6px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", backgroundColor: selectedSymptom === s ? "var(--rose-dust)" : "var(--ivory-dark)",
                color: selectedSymptom === s ? "white" : "var(--mauve)" }}>
              {s}
            </button>
          ))}
        </div>

        {selectedSymptom && (
          <>
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "var(--mauve)", marginBottom: 5, }}>Severity: {severity}/5</p>
              <input type="range" min={1} max={5} value={severity} onChange={e => setSeverity(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
            <p style={{ fontSize: 11, color: "var(--mauve)", marginBottom: 6, }}>Possible triggers (optional)</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
              {TRIGGERS.map(t => (
                <button key={t} onClick={() => toggleTrigger(t)}
                  style={{ padding: "4px 10px", borderRadius: 9999, fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer", backgroundColor: selectedTriggers.includes(t) ? "var(--mauve)" : "var(--ivory-dark)",
                    color: selectedTriggers.includes(t) ? "white" : "var(--mauve)" }}>
                  {t}
                </button>
              ))}
            </div>
            <textarea rows={2} placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inp, marginBottom: 10 }} />
            <button onClick={save} disabled={saving}
              style={{ width: "100%", padding: 11, borderRadius: 9999, backgroundColor: "var(--rose-dust)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, }}>
              {saving ? "Saving..." : "Log symptom"}
            </button>
          </>
        )}
      </div>

      {todayEntries.length > 0 && (
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", marginBottom: 10 }}>Logged today</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {todayEntries.map((e, i) => (
              <span key={i} style={{ padding: "4px 12px", borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", }}>
                {e.symptom_type} · {e.severity_1_5}/5
              </span>
            ))}
          </div>
        </div>
      )}

      {weekEntries.length > 0 && (
        <div style={card}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", marginBottom: 12 }}>This week</p>
          {top3.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, }}>Top symptoms</p>
              {top3.map(([sym, count]) => (
                <div key={sym} style={{ display: "flex", justifyContent: "space-between", backgroundColor: "var(--ivory)", borderRadius: 8, padding: "6px 10px", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--plum)", }}>{sym}</span>
                  <span style={{ fontSize: 11, color: "var(--rose-dust)", fontWeight: 600 }}>{count}x</span>
                </div>
              ))}
            </div>
          )}
          {topTriggers.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, }}>Top triggers</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {topTriggers.map(([trig, count]) => (
                  <span key={trig} style={{ padding: "3px 10px", borderRadius: 9999, backgroundColor: "var(--ivory-dark)", fontSize: 11, color: "var(--mauve)", }}>
                    {trig} · {count}x
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
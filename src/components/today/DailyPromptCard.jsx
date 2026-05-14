import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const todayStr = new Date().toISOString().split("T")[0];

export default function DailyPromptCard({ user }) {
  const [existing, setExisting] = useState(null);
  const [form, setForm] = useState({ main_focus: "", mood: 3, energy: 3 });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("fw_prompt_dismissed") === todayStr; } catch { return false; }
  });

  useEffect(() => {
    if (!user?.id || dismissed) return;
    base44.entities.DailyPromptResponse.filter({ user_id: user.id, day_key: todayStr })
      .then(rows => {
        if (rows[0]) { setExisting(rows[0]); setDismissed(true); }
        setLoaded(true);
      }).catch(() => setLoaded(true));
  }, [user?.id]);

  if (dismissed || !loaded || existing) return null;

  const save = async () => {
    if (!form.main_focus.trim()) return;
    setSaving(true);
    await base44.entities.DailyPromptResponse.create({
      user_id: user.id,
      day_key: todayStr,
      main_focus: form.main_focus.trim(),
      mood: form.mood,
      energy: form.energy,
    }).catch(() => {});
    setSaving(false);
    localStorage.setItem("fw_prompt_dismissed", todayStr);
    toast.success("Saved. Your plan will reflect this.");
    setDismissed(true);
  };

  const dismiss = () => {
    localStorage.setItem("fw_prompt_dismissed", todayStr);
    setDismissed(true);
  };

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 18, marginBottom: 16, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 3 }}>Morning check-in</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif" }}>How are you starting today?</p>
        </div>
        <button onClick={dismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mauve)", padding: 2, flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>x</span>
        </button>
      </div>

      <input
        type="text"
        value={form.main_focus}
        onChange={e => setForm(f => ({ ...f, main_focus: e.target.value }))}
        placeholder="What is your main focus today?"
        style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", marginBottom: 12, boxSizing: "border-box" }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {[{ key: "mood", label: "Mood" }, { key: "energy", label: "Energy" }].map(({ key, label }) => (
          <div key={key}>
            <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>{label} {form[key]}/5</p>
            <div style={{ display: "flex", gap: 5 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setForm(f => ({ ...f, [key]: n }))}
                  style={{ flex: 1, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                    backgroundColor: form[key] >= n ? "var(--rose-dust)" : "var(--ivory-dark)",
                    opacity: form[key] >= n ? 1 : 0.5 }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={!form.main_focus.trim() || saving}
        style={{ width: "100%", height: 44, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: (!form.main_focus.trim() || saving) ? 0.5 : 1 }}>
        {saving ? "Saving..." : "Save and continue"}
      </button>
    </div>
  );
}
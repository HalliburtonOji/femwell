import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, BellOff, Trash2, Plus, Clock, Loader2 } from "lucide-react";

export default function MedReminderSection({ user }) {
  const [reminders, setReminders] = useState([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("08:00");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (user) loadReminders();
  }, [user]);

  const loadReminders = async () => {
    const rems = await base44.entities.MedicationReminders.filter({ user_id: user.id });
    setReminders(rems);
  };

  const addReminder = async () => {
    if (!name.trim() || !time) return;
    setSaving(true);
    setSaveError(false);
    try {
      await base44.entities.MedicationReminders.create({
        user_id: user.id,
        medication_name: name.trim(),
        dose: dose.trim() || undefined,
        reminder_time: time,
        is_active: true,
      });
      setName(""); setDose(""); setTime("08:00"); setAdding(false); setSaving(false);
      loadReminders(); // background refetch — don't gate the UI on the read
    } catch {
      setSaving(false);
      setSaveError(true);
    }
  };

  const toggleReminder = async (rem) => {
    await base44.entities.MedicationReminders.update(rem.id, { is_active: !rem.is_active });
    setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, is_active: !r.is_active } : r));
  };

  const deleteReminder = async (id) => {
    await base44.entities.MedicationReminders.delete(id);
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 12, outline: "none" };

  return (
    <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Bell style={{ width: 16, height: 16, color: "var(--mauve)" }} />
        <p className="text-sm font-semibold" style={{ color: "var(--plum)" }}>Email Reminders</p>
      </div>

      {reminders.length === 0 && !adding && (
        <p className="text-xs mb-3" style={{ color: "var(--mauve)" }}>No reminders set. Add one to receive email alerts.</p>
      )}

      <div className="space-y-2 mb-3">
        {reminders.map((rem) => (
          <div key={rem.id} className="rounded-xl px-3 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-2">
              <Clock style={{ width: 14, height: 14, color: "var(--mauve)", flexShrink: 0 }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--plum)" }}>{rem.medication_name}</p>
                <p style={{ fontSize: 10, color: "var(--mauve)" }}>{rem.reminder_time}{rem.dose ? ` · ${rem.dose}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => toggleReminder(rem)} title={rem.is_active ? "Disable" : "Enable"}>
                {rem.is_active
                  ? <Bell style={{ width: 16, height: 16, color: "var(--mauve)" }} />
                  : <BellOff style={{ width: 16, height: 16, color: "var(--border)" }} />}
              </button>
              <button onClick={() => deleteReminder(rem.id)}>
                <Trash2 style={{ width: 14, height: 14, color: "var(--rose-dust)" }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border)" }}>
          <input type="text" placeholder="Medication name *" value={name} onChange={e => setName(e.target.value)}
            style={inputStyle} autoFocus
            onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />
          <input type="text" placeholder="Dose (e.g. 500mg, optional)" value={dose} onChange={e => setDose(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />
          <div className="flex items-center gap-2">
            <label style={{ fontSize: 12, color: "var(--mauve)", flexShrink: 0 }}>Reminder time (UTC):</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={{ ...inputStyle, width: "auto", flex: 1 }}
              onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setName(""); setDose(""); }}
              className="flex-1 py-1.5 text-xs rounded-xl"
              style={{ border: "1px solid var(--border)", color: "var(--mauve)", backgroundColor: "transparent", cursor: "pointer" }}>Cancel</button>
            <button onClick={addReminder} disabled={!name.trim() || saving}
              className="flex-1 py-1.5 text-xs rounded-xl flex items-center justify-center gap-1"
              style={{ backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", opacity: (!name.trim() || saving) ? 0.5 : 1 }}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {saving ? "Saving..." : "Set Reminder"}
            </button>
          </div>
          {saveError && <p className="text-xs" style={{ color: "var(--rose-dust)" }}>Couldn't save reminder. Please try again.</p>}
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "var(--mauve)", background: "none", border: "none", cursor: "pointer" }}>
          <Plus className="w-3.5 h-3.5" />
          Add reminder
        </button>
      )}
    </div>
  );
}
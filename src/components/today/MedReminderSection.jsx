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
    await base44.entities.MedicationReminders.create({
      user_id: user.id,
      medication_name: name.trim(),
      dose: dose.trim() || undefined,
      reminder_time: time,
      is_active: true,
    });
    setName(""); setDose(""); setTime("08:00"); setAdding(false); setSaving(false);
    await loadReminders();
  };

  const toggleReminder = async (rem) => {
    await base44.entities.MedicationReminders.update(rem.id, { is_active: !rem.is_active });
    setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, is_active: !r.is_active } : r));
  };

  const deleteReminder = async (id) => {
    await base44.entities.MedicationReminders.delete(id);
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="mt-5 pt-4 border-t border-rose-50">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-purple-400" />
        <p className="text-sm font-semibold text-gray-700">Email Reminders</p>
      </div>

      {reminders.length === 0 && !adding && (
        <p className="text-xs text-gray-400 mb-3">No reminders set. Add one to receive email alerts!</p>
      )}

      <div className="space-y-2 mb-3">
        {reminders.map((rem) => (
          <div key={rem.id} className="bg-white/60 rounded-xl px-3 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-700">{rem.medication_name}</p>
                <p className="text-[10px] text-gray-400">{rem.reminder_time}{rem.dose ? ` · ${rem.dose}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => toggleReminder(rem)} title={rem.is_active ? "Disable" : "Enable"}>
                {rem.is_active
                  ? <Bell className="w-4 h-4 text-purple-400" />
                  : <BellOff className="w-4 h-4 text-gray-300" />}
              </button>
              <button onClick={() => deleteReminder(rem.id)}>
                <Trash2 className="w-3.5 h-3.5 text-red-300 hover:text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="bg-white/60 rounded-xl p-3 space-y-2">
          <input type="text" placeholder="Medication name *" value={name} onChange={e => setName(e.target.value)}
            className="w-full p-2 rounded-lg border border-purple-100 bg-white/80 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200" autoFocus />
          <input type="text" placeholder="Dose (e.g. 500mg, optional)" value={dose} onChange={e => setDose(e.target.value)}
            className="w-full p-2 rounded-lg border border-purple-100 bg-white/80 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 flex-shrink-0">Reminder time (UTC):</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="flex-1 p-2 rounded-lg border border-purple-100 bg-white/80 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setName(""); setDose(""); }} className="btn-secondary flex-1 py-1.5 text-xs">Cancel</button>
            <button onClick={addReminder} disabled={!name.trim() || saving}
              className="btn-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {saving ? "Saving…" : "Set Reminder"}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Add reminder
        </button>
      )}
    </div>
  );
}
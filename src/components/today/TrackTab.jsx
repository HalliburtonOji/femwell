import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import {
  Droplets, AlertCircle, CheckCircle2, Plus, Pill, Activity,
  CalendarDays, Trash2, ChevronRight, Check, Loader2
} from "lucide-react";
import MonthlyCalendarCard from "../planner/MonthlyCalendarCard";
import DayDetailSheet from "../planner/DayDetailSheet";
import MedReminderSection from "./MedReminderSection";

const todayStr = new Date().toISOString().split("T")[0];

const SUBTABS = [
  { key: "calendar",  label: "Calendar",  Icon: CalendarDays },
  { key: "cycle",     label: "Cycle",     Icon: Droplets },
  { key: "symptoms",  label: "Symptoms",  Icon: AlertCircle },
  { key: "habits",    label: "Habits",    Icon: CheckCircle2 },
  { key: "meds",      label: "Meds",      Icon: Pill },
];

const FLOW_OPTIONS = ["light", "medium", "heavy"];
const PERIOD_EVENT_TYPES = [
  { value: "PeriodStart", label: "Period Start" },
  { value: "PeriodEnd",   label: "Period End" },
  { value: "Spotting",    label: "Spotting" },
];
const COMMON_SYMPTOMS = [
  "cramps", "bloating", "headache", "fatigue", "mood swings",
  "breast tenderness", "back pain", "acne", "nausea", "insomnia",
  "anxiety", "brain fog", "hot flashes", "night sweats", "joint pain",
];
const SEVERITY_LABELS = ["", "Mild", "Moderate", "Significant", "Severe", "Extreme"];

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};
const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 20, boxShadow: "var(--shadow-sm)",
};

// ── Calendar sub-tab ─────────────────────────────────────────────────────────
function CalendarSubTab({ user, profile }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="pt-4">
      <p style={{ ...sLabel, marginBottom: 12 }}>Tap any day to log or view</p>
      <MonthlyCalendarCard
        userId={user?.id}
        profile={profile}
        refreshKey={refreshKey}
        onDayPress={(day, dayData) => setSelectedDay({ day, dayData })}
      />
      {selectedDay && (
        <DayDetailSheet
          date={selectedDay.day}
          dayData={selectedDay.dayData}
          userId={user?.id}
          onClose={() => setSelectedDay(null)}
          onDataChanged={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}

// ── Cycle sub-tab ─────────────────────────────────────────────────────────────
function CycleSubTab({ user, profile }) {
  const [events, setEvents] = useState([]);
  const [eventType, setEventType] = useState("PeriodStart");
  const [flow, setFlow] = useState("medium");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.CycleEvents.filter({ user_id: user.id }, "-date", 30)
      .then(setEvents).catch(() => {});
  }, [user]);

  const logEvent = async () => {
    setSaving(true);
    const created = await base44.entities.CycleEvents.create({
      user_id: user.id,
      date: todayStr,
      event_type: eventType,
      ...(eventType === "PeriodStart" ? { flow_level: flow } : {}),
      notes: notes.trim() || undefined,
    });
    setEvents(prev => [created, ...prev]);
    setNotes("");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteEvent = async (id) => {
    await base44.entities.CycleEvents.delete(id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const cycleInfo = (() => {
    if (!profile?.last_period_start_date) return null;
    const cycleLen = profile.cycle_avg_length || 28;
    const periodLen = profile.period_length || 5;
    const today = new Date();
    const last = new Date(profile.last_period_start_date);
    const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    const cycleDay = (diff % cycleLen) + 1;
    const phase = cycleDay <= periodLen ? "Menstrual"
      : cycleDay <= 13 ? "Follicular"
      : cycleDay <= 16 ? "Ovulatory"
      : "Luteal";
    const phaseColor = { Menstrual: "var(--rose-dust)", Follicular: "var(--sage)", Ovulatory: "#B89E6A", Luteal: "var(--mauve)" }[phase];
    const nextPeriod = cycleLen - cycleDay;
    return { cycleDay, phase, phaseColor, nextPeriod };
  })();

  return (
    <div className="pt-4 space-y-4">
      {/* Cycle status card */}
      {cycleInfo ? (
        <div style={{ ...card, padding: 20, background: "linear-gradient(135deg, var(--rose-dust-subtle) 0%, var(--mauve-subtle) 100%)" }}>
          <p style={sLabel}>Current cycle status</p>
          <div className="flex items-center gap-3 mt-3">
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>
                Day {cycleInfo.cycleDay}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: cycleInfo.phaseColor, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>
                {cycleInfo.phase} Phase
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Next period in</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>
                {cycleInfo.nextPeriod}d
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...card, padding: 16 }}>
          <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            Set your last period date in Cycle Settings to see your phase.
          </p>
          <a href="/CycleSettings" style={{ fontSize: 12, color: "var(--rose-dust)", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
            Go to settings →
          </a>
        </div>
      )}

      {/* Log today */}
      <div style={{ ...card, padding: 20 }}>
        <p style={{ ...sLabel, marginBottom: 14 }}>Log today</p>
        <div className="flex gap-2 flex-wrap mb-3">
          {PERIOD_EVENT_TYPES.map(opt => (
            <button key={opt.value} onClick={() => setEventType(opt.value)}
              style={{
                padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
                backgroundColor: eventType === opt.value ? "var(--plum)" : "var(--ivory-dark)",
                color: eventType === opt.value ? "white" : "var(--mauve)",
              }}>
              {opt.label}
            </button>
          ))}
        </div>
        {eventType === "PeriodStart" && (
          <div className="flex gap-2 mb-3">
            {FLOW_OPTIONS.map(f => (
              <button key={f} onClick={() => setFlow(f)}
                style={{
                  flex: 1, padding: "6px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600,
                  border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize",
                  backgroundColor: flow === f ? "var(--rose-dust)" : "var(--ivory-dark)",
                  color: flow === f ? "white" : "var(--mauve)",
                }}>
                {f}
              </button>
            ))}
          </div>
        )}
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", marginBottom: 12, boxSizing: "border-box" }}
        />
        <button onClick={logEvent} disabled={saving}
          style={{
            width: "100%", padding: "11px", borderRadius: 12, fontWeight: 600, fontSize: 13,
            border: "none", cursor: saving ? "default" : "pointer", fontFamily: "'Inter', sans-serif",
            backgroundColor: saved ? "var(--sage)" : "var(--plum)", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {saving ? "Saving…" : saved ? "Logged!" : "Log Event"}
        </button>
      </div>

      {/* Recent events */}
      {events.length > 0 && (
        <div style={{ ...card, padding: 20 }}>
          <p style={{ ...sLabel, marginBottom: 12 }}>Recent events</p>
          <div className="space-y-2">
            {events.slice(0, 10).map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 12, backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{e.event_type?.replace(/([A-Z])/g, " $1").trim()}</p>
                  <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                    {e.date}{e.flow_level ? ` · ${e.flow_level}` : ""}
                  </p>
                </div>
                <button onClick={() => deleteEvent(e.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <Trash2 style={{ width: 14, height: 14, color: "var(--mauve)" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Symptoms sub-tab ─────────────────────────────────────────────────────────
function SymptomsSubTab({ user }) {
  const [todaySymptoms, setTodaySymptoms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.SymptomLogs.filter({ user_id: user.id, date: todayStr })
      .then(setTodaySymptoms).catch(() => {});
  }, [user]);

  const log = async () => {
    if (!selected) return;
    setSaving(true);
    const created = await base44.entities.SymptomLogs.create({
      user_id: user.id,
      date: todayStr,
      symptom_type: selected,
      severity,
      notes: notes.trim() || undefined,
    });
    setTodaySymptoms(prev => [...prev, created]);
    setSelected(null);
    setNotes("");
    setSeverity(3);
    setSaving(false);
  };

  const remove = async (id) => {
    await base44.entities.SymptomLogs.delete(id);
    setTodaySymptoms(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="pt-4 space-y-4">
      {/* Today's logged */}
      {todaySymptoms.length > 0 && (
        <div style={{ ...card, padding: 20 }}>
          <p style={{ ...sLabel, marginBottom: 12 }}>Logged today</p>
          <div className="flex flex-wrap gap-2">
            {todaySymptoms.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 12px", borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{s.symptom_type}</span>
                {s.severity && <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>·{" "}{SEVERITY_LABELS[s.severity] || s.severity}</span>}
                <button onClick={() => remove(s.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>
                  <Trash2 style={{ width: 12, height: 12, color: "var(--mauve)" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symptom picker */}
      <div style={{ ...card, padding: 20 }}>
        <p style={{ ...sLabel, marginBottom: 12 }}>Log a symptom</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {COMMON_SYMPTOMS.map(s => (
            <button key={s} onClick={() => setSelected(selected === s ? null : s)}
              style={{
                padding: "6px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 500,
                border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize",
                backgroundColor: selected === s ? "var(--plum)" : "var(--ivory-dark)",
                color: selected === s ? "white" : "var(--mauve)",
              }}>
              {s}
            </button>
          ))}
        </div>
        {selected && (
          <div className="space-y-3">
            <div>
              <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>
                Severity: <strong style={{ color: "var(--plum)" }}>{SEVERITY_LABELS[severity]}</strong>
              </p>
              <input type="range" min={1} max={5} value={severity} onChange={e => setSeverity(+e.target.value)} style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                {SEVERITY_LABELS.slice(1).map(l => (
                  <span key={l} style={{ fontSize: 9, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{l}</span>
                ))}
              </div>
            </div>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }}
            />
            <button onClick={log} disabled={saving}
              style={{ width: "100%", padding: "11px", borderRadius: 12, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: "var(--plum)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Saving…" : `Log ${selected}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Habits sub-tab ────────────────────────────────────────────────────────────
function HabitsSubTab({ user }) {
  const [habits, setHabits] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [saving, setSaving] = useState(false);

  const CATEGORIES = ["hydration", "movement", "nutrition", "mindfulness", "sleep", "other"];

  useEffect(() => {
    base44.entities.HabitLogs.filter({ user_id: user.id, date: todayStr })
      .then(setHabits).catch(() => {});
  }, [user]);

  const toggle = async (habit) => {
    const updated = await base44.entities.HabitLogs.update(habit.id, { completed: !habit.completed });
    setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, completed: !h.completed } : h));
  };

  const addHabit = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const created = await base44.entities.HabitLogs.create({
      user_id: user.id,
      date: todayStr,
      habit_type: newName.trim(),
      habit_category: newCategory,
      completed: false,
    });
    setHabits(prev => [...prev, created]);
    setNewName("");
    setShowAdd(false);
    setSaving(false);
  };

  const remove = async (id) => {
    await base44.entities.HabitLogs.delete(id);
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const done = habits.filter(h => h.completed).length;
  const total = habits.length;

  return (
    <div className="pt-4 space-y-4">
      {/* Progress */}
      {total > 0 && (
        <div style={{ ...card, padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              {done}/{total} habits done today
            </p>
            <p style={{ fontSize: 12, color: "var(--sage)", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
              {total > 0 ? Math.round((done / total) * 100) : 0}%
            </p>
          </div>
          <div style={{ height: 6, backgroundColor: "var(--ivory-dark)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${total > 0 ? (done / total) * 100 : 0}%`, backgroundColor: done === total && total > 0 ? "var(--sage)" : "var(--rose-dust)", borderRadius: 3, transition: "width 0.4s" }} />
          </div>
        </div>
      )}

      {/* Habit list */}
      <div style={{ ...card, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p style={sLabel}>Today's habits</p>
          <button onClick={() => setShowAdd(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {showAdd && (
          <div className="rounded-2xl p-3 mb-4 space-y-2" style={{ backgroundColor: "var(--ivory)", border: "1px solid var(--border)" }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Habit name (e.g. 8 glasses water)"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--surface)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }}
            />
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setNewCategory(c)}
                  style={{ padding: "4px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 500, textTransform: "capitalize", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: newCategory === c ? "var(--plum)" : "var(--ivory-dark)", color: newCategory === c ? "white" : "var(--mauve)" }}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "7px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "transparent", fontSize: 12, color: "var(--mauve)", cursor: "pointer" }}>Cancel</button>
              <button onClick={addHabit} disabled={!newName.trim() || saving} style={{ flex: 1, padding: "7px", borderRadius: 10, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: !newName.trim() ? 0.5 : 1 }}>
                {saving ? "Adding…" : "Add"}
              </button>
            </div>
          </div>
        )}

        {habits.length === 0 && !showAdd && (
          <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            No habits logged today yet. Tap Add to start tracking.
          </p>
        )}

        <div className="space-y-2">
          {habits.map(h => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, backgroundColor: h.completed ? "var(--sage-subtle)" : "var(--ivory)", border: `1px solid ${h.completed ? "var(--sage-light)" : "var(--border-subtle)"}` }}>
              <button onClick={() => toggle(h)}
                style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${h.completed ? "var(--sage)" : "var(--border)"}`, backgroundColor: h.completed ? "var(--sage)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {h.completed && <Check style={{ width: 12, height: 12, color: "white" }} />}
              </button>
              <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: h.completed ? "var(--sage)" : "var(--plum)", fontFamily: "'Inter', sans-serif", textDecoration: h.completed ? "line-through" : "none", textDecorationColor: "var(--sage)" }}>
                {h.habit_type}
              </p>
              {h.habit_category && (
                <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{h.habit_category}</span>
              )}
              <button onClick={() => remove(h.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
                <Trash2 style={{ width: 13, height: 13, color: "var(--mauve)" }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Meds sub-tab ──────────────────────────────────────────────────────────────
function MedsSubTab({ user }) {
  const [todayLogs, setTodayLogs] = useState([]);
  const [medName, setMedName] = useState("");
  const [dose, setDose] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.MedicationLogs.filter({ user_id: user.id, date: todayStr })
      .then(setTodayLogs).catch(() => {});
  }, [user]);

  const logMed = async () => {
    if (!medName.trim()) return;
    setSaving(true);
    const created = await base44.entities.MedicationLogs.create({
      user_id: user.id,
      date: todayStr,
      medication_name: medName.trim(),
      dose: dose.trim() || undefined,
      taken_at: new Date().toISOString(),
      taken: true,
    });
    setTodayLogs(prev => [...prev, created]);
    setMedName("");
    setDose("");
    setSaving(false);
  };

  const remove = async (id) => {
    await base44.entities.MedicationLogs.delete(id);
    setTodayLogs(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="pt-4 space-y-4">
      {/* Log today */}
      <div style={{ ...card, padding: 20 }}>
        <p style={{ ...sLabel, marginBottom: 14 }}>Log medication taken today</p>
        <div className="space-y-2 mb-3">
          <input value={medName} onChange={e => setMedName(e.target.value)} placeholder="Medication name *"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }}
          />
          <input value={dose} onChange={e => setDose(e.target.value)} placeholder="Dose (e.g. 500mg)"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <button onClick={logMed} disabled={!medName.trim() || saving}
          style={{ width: "100%", padding: "11px", borderRadius: 12, fontWeight: 600, fontSize: 13, border: "none", cursor: medName.trim() ? "pointer" : "not-allowed", fontFamily: "'Inter', sans-serif", backgroundColor: "var(--plum)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: !medName.trim() ? 0.5 : 1 }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pill className="w-4 h-4" />}
          {saving ? "Saving…" : "Log Medication"}
        </button>

        {/* Today's logs */}
        {todayLogs.length > 0 && (
          <div className="mt-4 space-y-2">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Taken today</p>
            {todayLogs.map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 12, backgroundColor: "var(--sage-subtle)", border: "1px solid var(--sage-light)" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{l.medication_name}</p>
                  {l.dose && <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{l.dose}</p>}
                </div>
                <button onClick={() => remove(l.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <Trash2 style={{ width: 13, height: 13, color: "var(--mauve)" }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reminders */}
      <div style={{ ...card, padding: 20 }}>
        <p style={{ ...sLabel, marginBottom: 4 }}>Reminders</p>
        <MedReminderSection user={user} />
      </div>
    </div>
  );
}

// ── Main TrackTab ─────────────────────────────────────────────────────────────
export default function TrackTab({ user, profile }) {
  const [subTab, setSubTab] = useState("calendar");

  return (
    <div>
      {/* Sub-tab pills */}
      <div className="mt-4 mb-1">
        <style>{`.track-subtabs::-webkit-scrollbar{display:none}`}</style>
        <div className="track-subtabs flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {SUBTABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setSubTab(key)}
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
                padding: "7px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
                backgroundColor: subTab === key ? "var(--plum)" : "var(--surface)",
                color: subTab === key ? "white" : "var(--mauve)",
                boxShadow: subTab === key ? "none" : "var(--shadow-sm)",
                borderWidth: 1, borderStyle: "solid",
                borderColor: subTab === key ? "transparent" : "var(--border)",
              }}
            >
              <Icon style={{ width: 13, height: 13 }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {subTab === "calendar" && <CalendarSubTab user={user} profile={profile} />}
      {subTab === "cycle"    && <CycleSubTab user={user} profile={profile} />}
      {subTab === "symptoms" && <SymptomsSubTab user={user} />}
      {subTab === "habits"   && <HabitsSubTab user={user} />}
      {subTab === "meds"     && <MedsSubTab user={user} />}
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import {
  Droplets, AlertCircle, CheckCircle2, Plus, Pill,
  CalendarDays, Trash2, Check, Loader2, PlayCircle, ThumbsUp, ThumbsDown,
  MapPin, Heart, Activity
} from "lucide-react";
import MonthlyCalendarCard from "../planner/MonthlyCalendarCard";
import DayDetailSheet from "../planner/DayDetailSheet";
import MedReminderSection from "./MedReminderSection";
import PainMapSubTab from "../conditions/PainMapSubTab";
import FertilitySubTab from "../conditions/FertilitySubTab";
import HealthDataSubTab from "./HealthDataSubTab";
import SymptomLogForm from "../track/SymptomLogForm";
import SymptomHeatmap from "../track/SymptomHeatmap";
import SymptomPatternCard from "../track/SymptomPatternCard";

const todayStr = new Date().toISOString().split("T")[0];

// Title Case normaliser for symptom_type
const toTitleCase = (str) =>
  str.trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

// Auto-assign category from habit name
const habitCategory = (name) => {
  const n = name.toLowerCase();
  if (n.includes("water") || n.includes("hydrat")) return "hydration";
  if (n.includes("walk") || n.includes("stretch") || n.includes("exercise") || n.includes("workout")) return "movement";
  if (n.includes("meditat") || n.includes("journal")) return "mindfulness";
  if (n.includes("sleep")) return "sleep";
  if (n.includes("read")) return "other";
  return "other";
};

const PRESET_HABITS = [
  { name: "Drink water",     category: "hydration" },
  { name: "Morning walk",    category: "movement" },
  { name: "5 min reading",   category: "other" },
  { name: "Stretching",      category: "movement" },
  { name: "Meditation",      category: "mindfulness" },
  { name: "Sleep 8hrs",      category: "sleep" },
  { name: "No caffeine",     category: "other" },
  { name: "Journaling",      category: "mindfulness" },
];

const BASE_SUBTABS = [
  { key: "calendar",    label: "Calendar",    Icon: CalendarDays },
  { key: "cycle",       label: "Cycle",       Icon: Droplets },
  { key: "symptoms",    label: "Symptoms",    Icon: AlertCircle },
  { key: "habits",      label: "Habits",      Icon: CheckCircle2 },
  { key: "meds",        label: "Meds",        Icon: Pill },
  { key: "sessions",    label: "Sessions",    Icon: PlayCircle },
  { key: "health_data", label: "Health Data", Icon: Activity },
];

function getSubTabs(profile) {
  const flags = profile?.condition_flags || [];
  const tabs = [...BASE_SUBTABS];
  const symptomsIdx = tabs.findIndex(t => t.key === "symptoms");
  if (flags.includes("endometriosis")) {
    tabs.splice(symptomsIdx + 1, 0, { key: "pain_map", label: "Pain map", Icon: MapPin });
  }
  if (profile?.life_stage === "ttc") {
    tabs.splice(symptomsIdx + 1, 0, { key: "fertility", label: "Fertility", Icon: Heart });
  }
  return tabs;
}

const FLOW_OPTIONS = ["light", "medium", "heavy"];
const CYCLE_EVENT_TYPES = [
  { value: "PeriodStart", label: "Period Start" },
  { value: "PeriodEnd",   label: "Period End" },
  { value: "Spotting",    label: "Spotting" },
];
const COMMON_SYMPTOMS = [
  "Cramps", "Bloating", "Headache", "Fatigue", "Mood Swings",
  "Breast Tenderness", "Back Pain", "Acne", "Nausea", "Insomnia",
  "Anxiety", "Brain Fog", "Hot Flashes", "Night Sweats", "Joint Pain",
];

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};
const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 20, boxShadow: "var(--shadow-sm)",
};

// ── Calendar sub-tab ──────────────────────────────────────────────────────────
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
function CycleSubTab({ user, profile, selectedDate }) {
  const [events, setEvents] = useState([]);
  const [eventType, setEventType] = useState("PeriodStart");
  const [flow, setFlow] = useState("medium");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.CycleEvents.filter({ user_id: user.id, date: selectedDate })
      .then(setEvents).catch(() => {});
  }, [user, selectedDate]);

  const logEvent = async () => {
    setSaving(true);
    const created = await base44.entities.CycleEvents.create({
      user_id: user.id,
      date: selectedDate,
      type: eventType,
      flow_level: eventType === "PeriodStart" ? flow : undefined,
    });
    setEvents(prev => [created, ...prev]);
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
      {cycleInfo ? (
        <div style={{ ...card, padding: 20, background: "linear-gradient(135deg, var(--rose-dust-subtle) 0%, var(--mauve-subtle) 100%)" }}>
          <p style={sLabel}>Current cycle status</p>
          <div className="flex items-center gap-3 mt-3">
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>Day {cycleInfo.cycleDay}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: cycleInfo.phaseColor, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>{cycleInfo.phase} Phase</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Next period in</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{cycleInfo.nextPeriod}d</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...card, padding: 16 }}>
          <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Set your last period date in Cycle Settings to see your phase.</p>
          <a href="/CycleSettings" style={{ fontSize: 12, color: "var(--rose-dust)", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Go to settings →</a>
        </div>
      )}

      <div style={{ ...card, padding: 20 }}>
        <p style={{ ...sLabel, marginBottom: 4 }}>Logging for {selectedDate}</p>
        <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 14 }}>
          {selectedDate === todayStr ? "Today" : selectedDate}
        </p>
        <div className="flex gap-2 flex-wrap mb-3">
          {CYCLE_EVENT_TYPES.map(opt => (
            <button key={opt.value} onClick={() => setEventType(opt.value)}
              style={{ padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: eventType === opt.value ? "var(--plum)" : "var(--ivory-dark)", color: eventType === opt.value ? "white" : "var(--mauve)" }}>
              {opt.label}
            </button>
          ))}
        </div>
        {eventType === "PeriodStart" && (
          <div className="flex gap-2 mb-3">
            {FLOW_OPTIONS.map(f => (
              <button key={f} onClick={() => setFlow(f)}
                style={{ flex: 1, padding: "6px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize", backgroundColor: flow === f ? "var(--rose-dust)" : "var(--ivory-dark)", color: flow === f ? "white" : "var(--mauve)" }}>
                {f}
              </button>
            ))}
          </div>
        )}
        <button onClick={logEvent} disabled={saving}
          style={{ width: "100%", padding: "11px", borderRadius: 12, fontWeight: 600, fontSize: 13, border: "none", cursor: saving ? "default" : "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: saved ? "var(--sage)" : "var(--plum)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {saving ? "Saving…" : saved ? "Logged!" : "Log Event"}
        </button>
      </div>

      {events.length > 0 && (
        <div style={{ ...card, padding: 20 }}>
          <p style={{ ...sLabel, marginBottom: 12 }}>Events on {selectedDate}</p>
          <div className="space-y-2">
            {events.map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 12, backgroundColor: "var(--ivory)", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{e.type?.replace(/([A-Z])/g, " $1").trim()}</p>
                  {e.flow_level && <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{e.flow_level} flow</p>}
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

// ── PMDD severity logger (shown in luteal phase) ─────────────────────────────
function PMDDSeverityLogger({ user, profile, selectedDate }) {
  const [severity, setSeverity] = useState(5);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const cycleDay = (() => {
    if (!profile?.last_period_start_date) return null;
    const last = new Date(profile.last_period_start_date);
    const sel = new Date(selectedDate);
    const diff = Math.floor((sel - last) / (1000 * 60 * 60 * 24));
    return (diff % (profile.cycle_avg_length || 28)) + 1;
  })();

  if (!cycleDay || cycleDay < 14) return null;

  const log = async () => {
    setSaving(true);
    await base44.entities.SymptomLogs.create({
      user_id: user.id,
      date: selectedDate,
      symptom_type: "PMDD Severity",
      severity,
    });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ ...card, padding: 16, backgroundColor: "var(--mauve-subtle)", borderColor: "var(--mauve-light)" }}>
      <p style={{ ...sLabel, marginBottom: 8, color: "var(--mauve)" }}>PMDD severity — Luteal day {cycleDay - 13}</p>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Today's severity</p>
        <strong style={{ fontSize: 12, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{severity}/10</strong>
      </div>
      <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(+e.target.value)} style={{ width: "100%", marginBottom: 10 }} />
      <button onClick={log} disabled={saving || saved}
        style={{ padding: "8px 18px", borderRadius: 9999, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
          backgroundColor: saved ? "var(--sage)" : "var(--plum)", color: "white" }}>
        {saving ? "Saving..." : saved ? "Logged" : "Log severity"}
      </button>
    </div>
  );
}

// ── PCOS extra symptoms ───────────────────────────────────────────────────────
const PCOS_SYMPTOMS = [
  "Acne flare",
  "Excess hair growth",
  "Irregular cycle",
  "Fatigue after eating",
  "Sugar cravings",
];

// ── Symptoms sub-tab ──────────────────────────────────────────────────────────
function SymptomsSubTab({ user, profile, selectedDate }) {
  const [symptoms, setSymptoms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // New: daily check-in for the selected date + recent 14 days for heatmap/patterns.
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = () =>
    base44.entities.SymptomLogs.filter({ user_id: user.id, date: selectedDate })
      .then(setSymptoms).catch(() => {});

  useEffect(() => { load(); }, [user, selectedDate]);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.DailyCheckins.filter({ user_id: user.id, date: selectedDate })
      .then(rows => setTodayCheckin(rows[0] || null))
      .catch(() => setTodayCheckin(null));
    base44.entities.DailyCheckins.filter({ user_id: user.id }, "-date", 30)
      .then(setRecentCheckins)
      .catch(() => setRecentCheckins([]));
  }, [user, selectedDate, refreshKey]);

  const log = async () => {
    if (!selected) return;
    setSaving(true);
    await base44.entities.SymptomLogs.create({
      user_id: user.id,
      date: selectedDate,
      symptom_type: toTitleCase(selected),
      severity,            // 1-10
      notes: notes.trim() || undefined,
    });
    await load();          // refresh from DB
    setSelected(null);
    setNotes("");
    setSeverity(5);
    setSaving(false);
  };

  const remove = async (id) => {
    await base44.entities.SymptomLogs.delete(id);
    setSymptoms(prev => prev.filter(s => s.id !== id));
  };

  const severityLabel = (v) => {
    if (v <= 2) return "Mild";
    if (v <= 4) return "Moderate";
    if (v <= 6) return "Significant";
    if (v <= 8) return "Severe";
    return "Extreme";
  };

  const flags = profile?.condition_flags || [];
  const hasPMDD = flags.includes("pmdd");
  const hasPCOS = flags.includes("pcos");

  return (
    <div className="pt-4 space-y-4">
      {/* New: structured daily log, heatmap, pattern card */}
      <SymptomLogForm
        userId={user?.id}
        dateStr={selectedDate}
        existing={todayCheckin}
        onSaved={() => setRefreshKey(k => k + 1)}
      />
      <SymptomPatternCard checkins={recentCheckins} />
      <SymptomHeatmap checkins={recentCheckins} />

      <a
        href="/Insights"
        aria-label="View full insights dashboard"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderRadius: 16,
          backgroundColor: "var(--blush-surface, #FCE7F3)",
          border: "1px solid rgba(225,29,116,0.18)",
          textDecoration: "none", minHeight: 44,
        }}
      >
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--rose-deep, #E11D74)", fontFamily: "'Inter', sans-serif" }}>Explore</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>View full insights dashboard</p>
        </div>
        <span aria-hidden="true" style={{ fontSize: 18, color: "var(--rose-deep, #E11D74)" }}>→</span>
      </a>

      {hasPMDD && <PMDDSeverityLogger user={user} profile={profile} selectedDate={selectedDate} />}
      {symptoms.length > 0 && (
        <div style={{ ...card, padding: 20 }}>
          <p style={{ ...sLabel, marginBottom: 12 }}>Logged on {selectedDate}</p>
          <div className="flex flex-wrap gap-2">
            {symptoms.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 12px", borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{s.symptom_type}</span>
                {s.severity && <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>· {severityLabel(s.severity)}</span>}
                <button onClick={() => remove(s.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>
                  <Trash2 style={{ width: 12, height: 12, color: "var(--mauve)" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ ...card, padding: 20 }}>
        <p style={{ ...sLabel, marginBottom: 12 }}>Log a symptom</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {[...COMMON_SYMPTOMS, ...(hasPCOS ? PCOS_SYMPTOMS : [])].map(s => (
            <button key={s} onClick={() => setSelected(selected === s ? null : s)}
              style={{ padding: "6px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: selected === s ? "var(--plum)" : "var(--ivory-dark)", color: selected === s ? "white" : "var(--mauve)" }}>
              {s}
            </button>
          ))}
        </div>
        {selected && (
          <div className="space-y-3">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Severity</p>
                <strong style={{ fontSize: 11, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{severityLabel(severity)} ({severity}/10)</strong>
              </div>
              <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(+e.target.value)} style={{ width: "100%" }} />
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
function HabitsSubTab({ user, profile, selectedDate }) {
  const [habits, setHabits] = useState([]);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(null); // habit name or null

  // Hydration
  const hydrationTarget = profile?.hydration_target_ml || 2000;
  const [hydrationTotal, setHydrationTotal] = useState(null);

  const load = async () => {
    const [logs, hydLogs] = await Promise.all([
      base44.entities.HabitLogs.filter({ user_id: user.id, date: selectedDate }),
      base44.entities.HydrationLog.filter({ user_id: user.id, day_key: selectedDate }).catch(() => []),
    ]);
    setHabits(logs);
    const total = hydLogs.reduce((sum, l) => sum + (l.amount_ml || 0), 0);
    setHydrationTotal(total);
  };

  useEffect(() => { load(); }, [user, selectedDate]);

  const togglePreset = async (preset) => {
    const existing = habits.find(h => h.habit_type === preset.name);
    if (existing) {
      await base44.entities.HabitLogs.update(existing.id, { completed: !existing.completed });
      setHabits(prev => prev.map(h => h.id === existing.id ? { ...h, completed: !h.completed } : h));
    } else {
      setSaving(preset.name);
      const created = await base44.entities.HabitLogs.create({
        user_id: user.id,
        date: selectedDate,
        habit_type: preset.name,
        habit_category: preset.category,
        completed: true,
      });
      setHabits(prev => [...prev, created]);
      setSaving(null);
    }
  };

  const addCustom = async () => {
    if (!customName.trim()) return;
    setSaving("custom");
    const name = customName.trim();
    const created = await base44.entities.HabitLogs.create({
      user_id: user.id,
      date: selectedDate,
      habit_type: name,
      habit_category: habitCategory(name),
      completed: false,
    });
    setHabits(prev => [...prev, created]);
    setCustomName("");
    setShowCustom(false);
    setSaving(null);
  };

  const remove = async (id) => {
    await base44.entities.HabitLogs.delete(id);
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const done = habits.filter(h => h.completed).length;
  const total = habits.length;

  return (
    <div className="pt-4 space-y-4">
      {/* Hydration display */}
      {hydrationTotal !== null && (
        <div style={{ ...card, padding: "14px 20px" }}>
          <p style={sLabel}>Hydration</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginTop: 6 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--sage)", fontFamily: "'Playfair Display', serif" }}>{hydrationTotal} ml</p>
            <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>/ {hydrationTarget} ml goal</p>
          </div>
          <div style={{ height: 6, backgroundColor: "var(--ivory-dark)", borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
            <div style={{ height: "100%", width: `${Math.min(100, (hydrationTotal / hydrationTarget) * 100)}%`, backgroundColor: "var(--sage)", borderRadius: 3, transition: "width 0.4s" }} />
          </div>
        </div>
      )}

      {/* Progress */}
      {total > 0 && (
        <div style={{ ...card, padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{done}/{total} habits done</p>
            <p style={{ fontSize: 12, color: "var(--sage)", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{Math.round((done / total) * 100)}%</p>
          </div>
          <div style={{ height: 6, backgroundColor: "var(--ivory-dark)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(done / total) * 100}%`, backgroundColor: done === total ? "var(--sage)" : "var(--rose-dust)", borderRadius: 3, transition: "width 0.4s" }} />
          </div>
        </div>
      )}

      {/* Preset habits */}
      <div style={{ ...card, padding: 20 }}>
        <p style={{ ...sLabel, marginBottom: 14 }}>Habits</p>
        <div className="space-y-2">
          {PRESET_HABITS.map(preset => {
            const logged = habits.find(h => h.habit_type === preset.name);
            const isCompleted = logged?.completed;
            return (
              <div key={preset.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, backgroundColor: isCompleted ? "var(--sage-subtle)" : "var(--ivory)", border: `1px solid ${isCompleted ? "var(--sage-light)" : "var(--border-subtle)"}` }}>
                <button onClick={() => togglePreset(preset)}
                  style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isCompleted ? "var(--sage)" : "var(--border)"}`, backgroundColor: isCompleted ? "var(--sage)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {saving === preset.name ? <Loader2 style={{ width: 10, height: 10, color: "var(--mauve)" }} className="animate-spin" /> : isCompleted && <Check style={{ width: 12, height: 12, color: "white" }} />}
                </button>
                <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: isCompleted ? "var(--sage)" : "var(--plum)", fontFamily: "'Inter', sans-serif", textDecoration: isCompleted ? "line-through" : "none" }}>
                  {preset.name}
                </p>
                <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{preset.category}</span>
                {logged && (
                  <button onClick={() => remove(logged.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
                    <Trash2 style={{ width: 13, height: 13, color: "var(--mauve)" }} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Custom habits */}
          {habits.filter(h => !PRESET_HABITS.find(p => p.name === h.habit_type)).map(h => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, backgroundColor: h.completed ? "var(--sage-subtle)" : "var(--ivory)", border: `1px solid ${h.completed ? "var(--sage-light)" : "var(--border-subtle)"}` }}>
              <button onClick={() => base44.entities.HabitLogs.update(h.id, { completed: !h.completed }).then(() => setHabits(prev => prev.map(x => x.id === h.id ? { ...x, completed: !x.completed } : x)))}
                style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${h.completed ? "var(--sage)" : "var(--border)"}`, backgroundColor: h.completed ? "var(--sage)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {h.completed && <Check style={{ width: 12, height: 12, color: "white" }} />}
              </button>
              <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: h.completed ? "var(--sage)" : "var(--plum)", fontFamily: "'Inter', sans-serif", textDecoration: h.completed ? "line-through" : "none" }}>{h.habit_type}</p>
              <button onClick={() => remove(h.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                <Trash2 style={{ width: 13, height: 13, color: "var(--mauve)" }} />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom */}
        <div className="mt-4">
          {showCustom ? (
            <div className="flex gap-2">
              <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Custom habit name"
                style={{ flex: 1, padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none" }}
                onKeyDown={e => e.key === "Enter" && addCustom()}
              />
              <button onClick={addCustom} disabled={!customName.trim()} style={{ padding: "7px 14px", borderRadius: 10, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add</button>
              <button onClick={() => setShowCustom(false)} style={{ padding: "7px 10px", borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "transparent", fontSize: 12, color: "var(--mauve)", cursor: "pointer" }}>×</button>
            </div>
          ) : (
            <button onClick={() => setShowCustom(true)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--mauve)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              <Plus className="w-3.5 h-3.5" /> Add custom habit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Meds sub-tab ──────────────────────────────────────────────────────────────
function MedsSubTab({ user, selectedDate }) {
  const [todayLogs, setTodayLogs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [itemName, setItemName] = useState("");
  const [dose, setDose] = useState("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState(false);

  const load = async () => {
    const [logs, rems] = await Promise.all([
      base44.entities.MedicationLogs.filter({ user_id: user.id, date: selectedDate }),
      base44.entities.MedicationReminders.filter({ user_id: user.id, is_active: true }).catch(() => []),
    ]);
    setTodayLogs(logs);
    setReminders(rems);
  };

  useEffect(() => { load(); }, [user, selectedDate]);

  const logMed = async () => {
    if (!itemName.trim()) { setNameError(true); return; }
    setNameError(false);
    setSaving(true);
    const created = await base44.entities.MedicationLogs.create({
      user_id: user.id,
      date: selectedDate,
      item_name: itemName.trim(),
      dose: dose.trim() || undefined,
      taken: true,
    });
    setTodayLogs(prev => [...prev, created]);
    setItemName("");
    setDose("");
    setSaving(false);
  };

  const markReminderTaken = async (rem) => {
    const already = todayLogs.find(l => l.item_name === rem.medication_name);
    if (already) return;
    const created = await base44.entities.MedicationLogs.create({
      user_id: user.id,
      date: selectedDate,
      item_name: rem.medication_name,
      dose: rem.dose || undefined,
      taken: true,
    });
    setTodayLogs(prev => [...prev, created]);
  };

  const remove = async (id) => {
    await base44.entities.MedicationLogs.delete(id);
    setTodayLogs(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div className="pt-4 space-y-4">
      <div style={{ ...card, padding: 20 }}>
        <p style={{ ...sLabel, marginBottom: 14 }}>Log medication taken</p>
        <div className="space-y-2 mb-3">
          <input value={itemName} onChange={e => { setItemName(e.target.value); setNameError(false); }} placeholder="Medication name *"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: `1px solid ${nameError ? "var(--rose-dust)" : "var(--border)"}`, backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }}
          />
          {nameError && <p style={{ fontSize: 11, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>Name is required.</p>}
          <input value={dose} onChange={e => setDose(e.target.value)} placeholder="Dose (e.g. 500mg, optional)"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <button onClick={logMed} disabled={saving}
          style={{ width: "100%", padding: "11px", borderRadius: 12, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: "var(--plum)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pill className="w-4 h-4" />}
          {saving ? "Saving…" : "Log Medication"}
        </button>

        {todayLogs.length > 0 && (
          <div className="mt-4 space-y-2">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>Taken on {selectedDate}</p>
            {todayLogs.map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 12, backgroundColor: "var(--sage-subtle)", border: "1px solid var(--sage-light)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Pill style={{ width: 13, height: 13, color: "var(--sage)" }} />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{l.item_name}</p>
                    {l.dose && <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{l.dose}</p>}
                  </div>
                </div>
                <button onClick={() => remove(l.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <Trash2 style={{ width: 13, height: 13, color: "var(--mauve)" }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active reminders */}
      {reminders.length > 0 && (
        <div style={{ ...card, padding: 20 }}>
          <p style={{ ...sLabel, marginBottom: 12 }}>Active reminders</p>
          <div className="space-y-2">
            {reminders.map(rem => {
              const taken = todayLogs.some(l => l.item_name === rem.medication_name);
              return (
                <div key={rem.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 12, backgroundColor: taken ? "var(--sage-subtle)" : "var(--ivory)", border: `1px solid ${taken ? "var(--sage-light)" : "var(--border-subtle)"}` }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{rem.medication_name}</p>
                    <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{rem.reminder_time}{rem.dose ? ` · ${rem.dose}` : ""}</p>
                  </div>
                  {taken ? (
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>✓ Taken</span>
                  ) : (
                    <button onClick={() => markReminderTaken(rem)}
                      style={{ fontSize: 11, fontWeight: 600, color: "var(--plum)", backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)", borderRadius: 9999, padding: "4px 10px", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                      Mark taken
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ ...card, padding: 20 }}>
        <p style={{ ...sLabel, marginBottom: 4 }}>Email reminders</p>
        <MedReminderSection user={user} />
      </div>
    </div>
  );
}

// ── Sessions sub-tab ──────────────────────────────────────────────────────────
function SessionsSubTab({ user, selectedDate }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ContentHistory.filter({ user_id: user.id, session_date: selectedDate, is_deleted: false })
      .then(s => { setSessions(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, selectedDate]);

  if (loading) return <div className="pt-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--mauve)" }} /></div>;

  return (
    <div className="pt-4 space-y-3">
      <p style={{ ...sLabel }}>Sessions on {selectedDate}</p>
      {sessions.length === 0 ? (
        <div style={{ ...card, padding: 32, textAlign: "center" }}>
          <PlayCircle style={{ width: 28, height: 28, color: "var(--mauve)", margin: "0 auto 10px" }} />
          <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No sessions completed on this day.</p>
        </div>
      ) : (
        sessions.map(s => (
          <div key={s.id} style={{ ...card, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <PlayCircle style={{ width: 20, height: 20, color: "var(--rose-dust)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{s.content_key || s.content_id || "Session"}</p>
              {s.completed_at && (
                <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  {format(parseISO(s.completed_at), "HH:mm")}
                  {s.duration_seconds ? ` · ${Math.round(s.duration_seconds / 60)} min` : ""}
                </p>
              )}
            </div>
            {s.helped === true && <ThumbsUp style={{ width: 14, height: 14, color: "var(--sage)" }} />}
            {s.helped === false && <ThumbsDown style={{ width: 14, height: 14, color: "var(--rose-dust)" }} />}
          </div>
        ))
      )}
    </div>
  );
}

// ── Main TrackTab ─────────────────────────────────────────────────────────────
export default function TrackTab({ user, profile }) {
  const [subTab, setSubTab] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const SUBTABS = getSubTabs(profile);

  return (
    <div>
      {/* Sub-tab pills */}
      <div className="mt-4 mb-1">
        <style>{`.track-subtabs::-webkit-scrollbar{display:none}`}</style>
        <div className="track-subtabs flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {SUBTABS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setSubTab(key)}
              style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: subTab === key ? "var(--plum)" : "var(--surface)", color: subTab === key ? "white" : "var(--mauve)", boxShadow: subTab === key ? "none" : "var(--shadow-sm)", border: `1px solid ${subTab === key ? "transparent" : "var(--border)"}` }}>
              <Icon style={{ width: 13, height: 13 }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date selector (shown on all non-calendar tabs) */}
      {subTab !== "calendar" && (
        <div style={{ marginTop: 12, marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Date:</p>
          <input type="date" value={selectedDate} max={todayStr} onChange={e => setSelectedDate(e.target.value)}
            style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", border: "1px solid var(--border)", borderRadius: 10, padding: "4px 10px", backgroundColor: "var(--surface)", outline: "none" }}
          />
        </div>
      )}

      {subTab === "calendar"  && <CalendarSubTab user={user} profile={profile} />}
      {subTab === "cycle"     && <CycleSubTab user={user} profile={profile} selectedDate={selectedDate} />}
      {subTab === "symptoms"  && <SymptomsSubTab user={user} profile={profile} selectedDate={selectedDate} />}
      {subTab === "habits"    && <HabitsSubTab user={user} profile={profile} selectedDate={selectedDate} />}
      {subTab === "meds"      && <MedsSubTab user={user} selectedDate={selectedDate} />}
      {subTab === "sessions"  && <SessionsSubTab user={user} selectedDate={selectedDate} />}
      {subTab === "pain_map"   && <PainMapSubTab user={user} selectedDate={selectedDate} />}
      {subTab === "fertility"  && <FertilitySubTab user={user} profile={profile} selectedDate={selectedDate} units={profile?.units} />}
      {subTab === "health_data" && <HealthDataSubTab user={user} selectedDate={selectedDate} />}
    </div>
  );
}
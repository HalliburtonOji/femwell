import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { Plus, ChevronLeft, ChevronRight, Droplets, Activity, Heart, Pill, Play, Trash2, Circle, CheckCircle2 } from "lucide-react";
import HabitCard from "../components/habits/HabitCard";
import StreakMilestoneToast from "../components/habits/StreakMilestoneToast";

const TABS = ["Cycle", "Symptoms", "Habits", "Meds", "Sessions"];

const FLOW_OPTIONS = [
  { value: "light",  label: "Light",  desc: "minimal" },
  { value: "medium", label: "Medium", desc: "moderate" },
  { value: "heavy",  label: "Heavy",  desc: "significant" },
];

const PERIOD_TYPES = [
  { value: "PeriodStart", label: "Period Start" },
  { value: "PeriodEnd",   label: "Period End"   },
  { value: "Spotting",    label: "Spotting"     },
];

const CYCLE_TYPE_ACCENTS = {
  PeriodStart: "var(--rose-dust)",
  PeriodEnd:   "var(--sage)",
  Spotting:    "var(--mauve)",
};

const COMMON_SYMPTOMS = [
  "cramps", "bloating", "headache", "fatigue", "mood swings",
  "breast tenderness", "back pain", "acne", "nausea", "insomnia",
  "anxiety", "brain fog", "hot flashes", "night sweats", "joint pain",
];

const SEVERITY_LABELS = ["", "Mild", "Moderate", "Significant", "Severe", "Extreme"];

const SESSION_TYPE_LABEL = {
  MEDITATION: "Meditation",
  BREATHWORK: "Breathwork",
  WORKOUT:    "Workout",
  MOBILITY:   "Mobility",
  GUIDE:      "Guide",
};

// Shared styles
const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};
const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

function EmptyState({ icon: Icon, heading, sub }) {
  return (
    <div className="rounded-[20px] p-10 text-center" style={card}>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
        style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{heading}</p>
      {sub && <p className="text-xs" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{sub}</p>}
    </div>
  );
}

function AddButton({ label, onClick, icon: Icon = Plus }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 rounded-[20px] p-4 transition-all"
      style={card}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--ivory-dark)"}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--surface)"}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{label}</p>
    </button>
  );
}

export default function Track() {
  const [activeTab, setActiveTab] = useState("Cycle");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [cycleEvents, setCycleEvents] = useState([]);
  const [addingCycleEvent, setAddingCycleEvent] = useState(false);
  const [cycleEventType, setCycleEventType] = useState("PeriodStart");
  const [flowLevel, setFlowLevel] = useState("medium");

  const [symptomLogs, setSymptomLogs] = useState([]);
  const [addingSymptom, setAddingSymptom] = useState(false);
  const [symptomType, setSymptomType] = useState("");
  const [customSymptom, setCustomSymptom] = useState("");
  const [severity, setSeverity] = useState(3);
  const [symptomNotes, setSymptomNotes] = useState("");

  const [habitLogs, setHabitLogs] = useState([]);
  const [allHabitLogs, setAllHabitLogs] = useState([]);
  const [addingHabit, setAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [savingHabit, setSavingHabit] = useState(false);
  const [milestone, setMilestone] = useState(null);

  const [medLogs, setMedLogs] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionContent, setSessionContent] = useState({});

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      await loadData(u.id, selectedDate);
      const all = await base44.entities.HabitLogs.filter({ user_id: u.id });
      setAllHabitLogs(all);
      setLoading(false);
    })();
  }, []);

  const loadData = async (userId, date) => {
    const [events, symptoms, habits, meds, sessions] = await Promise.all([
      base44.entities.CycleEvents.filter({ user_id: userId, date }),
      base44.entities.SymptomLogs.filter({ user_id: userId, date }),
      base44.entities.HabitLogs.filter({ user_id: userId, date }),
      base44.entities.MedicationLogs.filter({ user_id: userId, date }),
      base44.entities.ContentHistory.filter({ user_id: userId, session_date: date }),
    ]);
    setCycleEvents(events);
    setSymptomLogs(symptoms);
    setHabitLogs(habits);
    setMedLogs(meds);
    const activeSessions = sessions.filter((s) => !s.is_deleted);
    setSessionHistory(activeSessions);
    const ids = [...new Set(activeSessions.map((s) => s.content_id).filter(Boolean))];
    if (ids.length > 0) {
      const items = await base44.entities.ContentItems.list("-created_date", 120);
      const map = {};
      items.forEach((it) => { map[it.id] = it; });
      setSessionContent(map);
    }
  };

  const changeDate = async (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    const newDate = d.toISOString().split("T")[0];
    setSelectedDate(newDate);
    if (user) await loadData(user.id, newDate);
  };

  const saveCycleEvent = async () => {
    await base44.entities.CycleEvents.create({
      user_id: user.id,
      date: selectedDate,
      type: cycleEventType,
      flow_level: cycleEventType === "PeriodStart" || cycleEventType === "Spotting" ? flowLevel : undefined,
    });
    setAddingCycleEvent(false);
    await loadData(user.id, selectedDate);
  };

  const deleteCycleEvent = async (id) => {
    await base44.entities.CycleEvents.delete(id);
    await loadData(user.id, selectedDate);
  };

  const saveSymptom = async () => {
    const type = customSymptom.trim() || symptomType;
    if (!type) return;
    await base44.entities.SymptomLogs.create({ user_id: user.id, date: selectedDate, symptom_type: type, severity, notes: symptomNotes || undefined });
    setAddingSymptom(false); setSymptomType(""); setCustomSymptom(""); setSeverity(3); setSymptomNotes("");
    await loadData(user.id, selectedDate);
  };

  const allHabitNames = [...new Set(allHabitLogs.map((l) => l.habit_type || l.habit_name).filter(Boolean))];

  const calcStreak = (habitName) => {
    const ts = new Date().toISOString().split("T")[0];
    let count = 0;
    const check = new Date();
    const todayDone = allHabitLogs.some((l) => (l.habit_type === habitName || l.habit_name === habitName) && l.completed && l.date === ts);
    if (!todayDone) check.setDate(check.getDate() - 1);
    while (true) {
      const ds = check.toISOString().split("T")[0];
      const found = allHabitLogs.find((l) => (l.habit_type === habitName || l.habit_name === habitName) && l.completed && l.date === ds);
      if (!found) break;
      count++;
      check.setDate(check.getDate() - 1);
    }
    return count;
  };

  const handleHabitComplete = async (habitName) => {
    const existing = habitLogs.find((l) => (l.habit_type === habitName || l.habit_name === habitName) && l.date === selectedDate);
    if (existing) {
      await base44.entities.HabitLogs.update(existing.id, { completed: true });
    } else {
      await base44.entities.HabitLogs.create({ user_id: user.id, date: selectedDate, habit_type: habitName, habit_name: habitName, completed: true });
    }
    const all = await base44.entities.HabitLogs.filter({ user_id: user.id });
    setAllHabitLogs(all);
    await loadData(user.id, selectedDate);
    const newStreak = calcStreak(habitName) + 1;
    if ([7, 14, 30, 60, 100].includes(newStreak)) setMilestone({ streak: newStreak, habitName });
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    setSavingHabit(true);
    await base44.entities.HabitLogs.create({ user_id: user.id, date: selectedDate, habit_type: newHabitName.trim(), habit_name: newHabitName.trim(), completed: false });
    const all = await base44.entities.HabitLogs.filter({ user_id: user.id });
    setAllHabitLogs(all);
    await loadData(user.id, selectedDate);
    setNewHabitName(""); setAddingHabit(false); setSavingHabit(false);
  };

  const handleDeleteHabit = async (habitName) => {
    const toDelete = allHabitLogs.filter((l) => l.habit_type === habitName || l.habit_name === habitName);
    await Promise.all(toDelete.map((l) => base44.entities.HabitLogs.delete(l.id)));
    const all = await base44.entities.HabitLogs.filter({ user_id: user.id });
    setAllHabitLogs(all);
    await loadData(user.id, selectedDate);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  const isToday = selectedDate === todayStr;
  const displayDate = isToday ? "Today" : format(parseISO(selectedDate), "EEE, d MMM");

  // Daily summary counts
  const dailySummary = [
    cycleEvents.length > 0 && `${cycleEvents.length} cycle ${cycleEvents.length === 1 ? "event" : "events"}`,
    symptomLogs.length > 0 && `${symptomLogs.length} ${symptomLogs.length === 1 ? "symptom" : "symptoms"}`,
    habitLogs.filter(h => h.completed).length > 0 && `${habitLogs.filter(h => h.completed).length} habit${habitLogs.filter(h => h.completed).length === 1 ? "" : "s"} done`,
    sessionHistory.length > 0 && `${sessionHistory.length} ${sessionHistory.length === 1 ? "session" : "sessions"}`,
  ].filter(Boolean);

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-lg mx-auto px-4">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="pt-10 pb-5">
          <p style={sLabel} className="mb-1.5">Daily Log</p>
          <h1 className="text-2xl font-bold leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>
            Track
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            Body signals, habits, and daily rhythm
          </p>
        </div>

        {/* ── Date navigator ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between rounded-[20px] px-4 py-3.5 mb-3" style={card}>
          <button onClick={() => changeDate(-1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "var(--mauve)" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--ivory-dark)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-sm" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{displayDate}</p>
            {!isToday && (
              <p className="text-xs mt-0.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                {format(parseISO(selectedDate), "MMMM d, yyyy")}
              </p>
            )}
          </div>
          <button onClick={() => changeDate(1)} disabled={isToday}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ color: "var(--mauve)" }}
            onMouseEnter={e => !isToday && (e.currentTarget.style.backgroundColor = "var(--ivory-dark)")}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Daily summary strip */}
        {dailySummary.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {dailySummary.map((item) => (
              <span key={item} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>
                {item}
              </span>
            ))}
          </div>
        )}

        {/* ── Tab bar ─────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-5 p-1 rounded-2xl" style={card}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: activeTab === tab ? "var(--plum)" : "transparent",
                color: activeTab === tab ? "white" : "var(--mauve)",
                fontFamily: "'Inter', sans-serif",
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── CYCLE TAB ───────────────────────────────────────────────── */}
        {activeTab === "Cycle" && (
          <div className="space-y-2.5">
            {cycleEvents.length > 0 ? cycleEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-[20px] overflow-hidden" style={card}>
                <div className="flex items-center gap-3.5 flex-1 p-4">
                  <div className="w-1.5 self-stretch rounded-full flex-shrink-0"
                    style={{ backgroundColor: CYCLE_TYPE_ACCENTS[e.type] || "var(--rose-dust)", minHeight: "40px" }} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                      {e.type === "PeriodStart" ? "Period Start" : e.type === "PeriodEnd" ? "Period End" : "Spotting"}
                    </p>
                    {e.flow_level && (
                      <p className="text-xs mt-0.5 capitalize" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                        {e.flow_level} flow
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteCycleEvent(e.id)}
                  className="px-4 text-xs font-medium h-full py-4 flex-shrink-0"
                  style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  Remove
                </button>
              </div>
            )) : (
              <EmptyState icon={Droplets} heading="Nothing logged yet" sub="Tap below to record a cycle event for this day." />
            )}

            {addingCycleEvent ? (
              <div className="rounded-[24px] p-5 space-y-4" style={card}>
                <p className="font-semibold text-sm" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>Log Cycle Event</p>

                <div>
                  <p style={sLabel} className="mb-2">Event type</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PERIOD_TYPES.map((t) => (
                      <button key={t.value} onClick={() => setCycleEventType(t.value)}
                        className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          backgroundColor: cycleEventType === t.value ? "var(--plum)" : "var(--ivory)",
                          color: cycleEventType === t.value ? "white" : "var(--mauve)",
                          border: `1px solid ${cycleEventType === t.value ? "var(--plum)" : "var(--border)"}`,
                          fontFamily: "'Inter', sans-serif",
                        }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(cycleEventType === "PeriodStart" || cycleEventType === "Spotting") && (
                  <div>
                    <p style={sLabel} className="mb-2">Flow</p>
                    <div className="flex gap-2">
                      {FLOW_OPTIONS.map((f) => (
                        <button key={f.value} onClick={() => setFlowLevel(f.value)}
                          className="flex-1 py-3 rounded-xl text-xs transition-all"
                          style={{
                            backgroundColor: flowLevel === f.value ? "var(--rose-dust-subtle)" : "var(--ivory)",
                            border: `1.5px solid ${flowLevel === f.value ? "var(--rose-dust)" : "var(--border)"}`,
                            color: flowLevel === f.value ? "var(--rose-dust)" : "var(--mauve)",
                            fontFamily: "'Inter', sans-serif",
                          }}>
                          <span className="block font-semibold">{f.label}</span>
                          <span className="block text-[10px] mt-0.5 opacity-70">{f.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setAddingCycleEvent(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                    Cancel
                  </button>
                  <button onClick={saveCycleEvent}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <AddButton label="Log cycle event" onClick={() => setAddingCycleEvent(true)} />
            )}
          </div>
        )}

        {/* ── SYMPTOMS TAB ────────────────────────────────────────────── */}
        {activeTab === "Symptoms" && (
          <div className="space-y-2.5">
            {symptomLogs.length > 0 ? symptomLogs.map((s) => (
              <div key={s.id} className="flex items-start justify-between rounded-[20px] p-4" style={card}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm capitalize" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{s.symptom_type}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                    {SEVERITY_LABELS[s.severity] || `Severity ${s.severity}`}
                  </p>
                  {s.notes && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--mauve)", fontStyle: "italic", fontFamily: "'Inter', sans-serif" }}>
                      {s.notes}
                    </p>
                  )}
                </div>
                <button onClick={async () => { await base44.entities.SymptomLogs.delete(s.id); await loadData(user.id, selectedDate); }}
                  className="text-xs font-medium ml-3 flex-shrink-0"
                  style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  Remove
                </button>
              </div>
            )) : (
              <EmptyState icon={Activity} heading="Nothing logged yet" sub="Note anything your body has been telling you today." />
            )}

            {addingSymptom ? (
              <div className="rounded-[24px] p-5 space-y-4" style={card}>
                <p className="font-semibold text-sm" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>Log a Symptom</p>

                <div>
                  <p style={sLabel} className="mb-2.5">Common symptoms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SYMPTOMS.map((s) => (
                      <button key={s} onClick={() => { setSymptomType(s); setCustomSymptom(""); }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
                        style={{
                          backgroundColor: symptomType === s ? "var(--plum)" : "var(--ivory)",
                          color: symptomType === s ? "white" : "var(--plum)",
                          border: `1px solid ${symptomType === s ? "var(--plum)" : "var(--border)"}`,
                          fontFamily: "'Inter', sans-serif",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <input type="text" placeholder="Or describe your own…" value={customSymptom}
                  onChange={(e) => { setCustomSymptom(e.target.value); setSymptomType(""); }}
                  className="w-full p-3.5 rounded-2xl text-sm focus:outline-none"
                  style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p style={sLabel}>Intensity</p>
                    <span className="text-xs font-semibold" style={{ color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>
                      {SEVERITY_LABELS[severity]}
                    </span>
                  </div>
                  <input type="range" min="1" max="5" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
                </div>

                <textarea placeholder="Notes (optional — how it felt, what you noticed)" value={symptomNotes}
                  onChange={(e) => setSymptomNotes(e.target.value)} rows={2}
                  className="w-full p-3.5 rounded-2xl text-sm resize-none focus:outline-none"
                  style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />

                <div className="flex gap-2">
                  <button onClick={() => setAddingSymptom(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                    Cancel
                  </button>
                  <button onClick={saveSymptom} disabled={!symptomType && !customSymptom.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif", opacity: (!symptomType && !customSymptom.trim()) ? 0.45 : 1 }}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <AddButton label="Log a symptom" onClick={() => setAddingSymptom(true)} />
            )}
          </div>
        )}

        {/* ── HABITS TAB ──────────────────────────────────────────────── */}
        {activeTab === "Habits" && (
          <div className="space-y-2.5">
            {milestone && (
              <StreakMilestoneToast streak={milestone.streak} habitName={milestone.habitName} onDismiss={() => setMilestone(null)} />
            )}

            {allHabitNames.length > 0 ? allHabitNames.map((habitName) => (
              <HabitCard key={habitName} habit={habitName}
                habitLogs={habitLogs} allHabitLogs={allHabitLogs}
                selectedDate={selectedDate} todayStr={todayStr}
                onComplete={handleHabitComplete} onDelete={handleDeleteHabit} />
            )) : (
              <EmptyState icon={Heart} heading="No habits yet" sub="Build gentle daily routines and track your consistency over time." />
            )}

            {addingHabit ? (
              <div className="rounded-[24px] p-5 space-y-3.5" style={card}>
                <p className="font-semibold text-sm" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>New Habit</p>
                <input type="text" placeholder="Name your habit…" value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
                  className="w-full p-3.5 rounded-2xl text-sm focus:outline-none"
                  style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}
                  autoFocus
                  onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"} />
                <div className="flex flex-wrap gap-1.5">
                  {["Drink water", "Morning walk", "Meditate", "Stretch", "Read", "Journal", "No screen before bed"].map((s) => (
                    <button key={s} onClick={() => setNewHabitName(s)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all"
                      style={{ backgroundColor: "var(--ivory)", color: "var(--plum)", border: "1px solid var(--border)", fontFamily: "'Inter', sans-serif" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--rose-dust-subtle)"; e.currentTarget.style.borderColor = "var(--rose-dust-light)"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--ivory)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setAddingHabit(false); setNewHabitName(""); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                    Cancel
                  </button>
                  <button onClick={handleAddHabit} disabled={!newHabitName.trim() || savingHabit}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif", opacity: (!newHabitName.trim() || savingHabit) ? 0.45 : 1 }}>
                    {savingHabit ? "Adding…" : "Add Habit"}
                  </button>
                </div>
              </div>
            ) : (
              <AddButton label="Add a habit" onClick={() => setAddingHabit(true)} />
            )}
          </div>
        )}

        {/* ── MEDS TAB ────────────────────────────────────────────────── */}
        {activeTab === "Meds" && (
          <div className="space-y-2.5">
            {medLogs.length > 0 ? medLogs.map((m) => (
              <div key={m.id} className="flex items-center gap-3.5 rounded-[20px] p-4" style={card}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)" }}>
                  <Pill className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                    {m.item_name || m.medication_name || "Medication"}
                  </p>
                  {(m.dose || m.dosage) && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{m.dose || m.dosage}</p>
                  )}
                </div>
              </div>
            )) : (
              <div className="rounded-[24px] p-8 text-center" style={card}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)" }}>
                  <Pill className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                  Medication log
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  Log medications and supplements from the Today page using the Meds section there, or view your reminders in your daily check-in.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── SESSIONS TAB ────────────────────────────────────────────── */}
        {activeTab === "Sessions" && (
          <div className="space-y-2.5">
            {sessionHistory.length > 0 ? sessionHistory.map((s) => {
              const content = sessionContent[s.content_id];
              const durationMin = s.duration_seconds ? Math.round(s.duration_seconds / 60) : s.duration_done;
              const typeLabel = content?.content_type ? (SESSION_TYPE_LABEL[content.content_type] || content.content_type) : null;
              const isManual = s.completion_method === "MANUAL";
              return (
                <div key={s.id} className="flex items-center gap-3.5 rounded-[20px] p-4" style={card}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
                    <Play className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                      {content?.title || s.content_key || "Session"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {typeLabel && (
                        <span className="text-[10px] font-medium" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{typeLabel}</span>
                      )}
                      {durationMin > 0 && (
                        <span className="text-[10px]" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{durationMin} min</span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: isManual ? "#FFF8EE" : "var(--sage-subtle)",
                          color: isManual ? "#A07830" : "var(--sage)",
                          fontFamily: "'Inter', sans-serif",
                        }}>
                        {isManual ? "Logged" : "Completed"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await base44.entities.ContentHistory.update(s.id, { is_deleted: true });
                      setSessionHistory((prev) => prev.filter((x) => x.id !== s.id));
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--rose-dust-subtle)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--ivory-dark)"}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }) : (
              <EmptyState icon={Play} heading="No sessions today" sub="Complete a session in Explore or mark one from Today to see it here." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
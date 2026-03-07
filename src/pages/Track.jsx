import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { Plus, ChevronLeft, ChevronRight, Droplets, Activity, Heart, Pill, Play, CheckCircle, Trash2 } from "lucide-react";
import ManualCompleteButton from "../components/sessions/ManualCompleteButton";

const TABS = ["Cycle", "Symptoms", "Habits", "Meds", "Sessions"];

const FLOW_OPTIONS = [
  { value: "light", label: "Light", emoji: "💧" },
  { value: "medium", label: "Medium", emoji: "💧💧" },
  { value: "heavy", label: "Heavy", emoji: "💧💧💧" },
];

const PERIOD_TYPES = [
  { value: "PeriodStart", label: "Period Start" },
  { value: "PeriodEnd", label: "Period End" },
  { value: "Spotting", label: "Spotting" },
];

const COMMON_SYMPTOMS = [
  "cramps", "bloating", "headache", "fatigue", "mood swings",
  "breast tenderness", "back pain", "acne", "nausea", "insomnia",
  "anxiety", "brain fog", "hot flashes", "night sweats", "joint pain",
];

const SEVERITY_LABELS = ["", "Mild", "Moderate", "Significant", "Severe", "Extreme"];

export default function Track() {
  const [activeTab, setActiveTab] = useState("Cycle");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Cycle
  const [cycleEvents, setCycleEvents] = useState([]);
  const [addingCycleEvent, setAddingCycleEvent] = useState(false);
  const [cycleEventType, setCycleEventType] = useState("PeriodStart");
  const [flowLevel, setFlowLevel] = useState("medium");

  // Symptoms
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [addingSymptom, setAddingSymptom] = useState(false);
  const [symptomType, setSymptomType] = useState("");
  const [customSymptom, setCustomSymptom] = useState("");
  const [severity, setSeverity] = useState(3);
  const [symptomNotes, setSymptomNotes] = useState("");

  // Habits
  const [habitLogs, setHabitLogs] = useState([]);

  // Meds
  const [medLogs, setMedLogs] = useState([]);

  // Sessions
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionContent, setSessionContent] = useState({});

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      await loadData(u.id, selectedDate);
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
    // Load content titles
    const ids = [...new Set(activeSessions.map((s) => s.content_id).filter(Boolean))];
    if (ids.length > 0) {
      const items = await base44.entities.ContentItems.filter({});
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
    await base44.entities.SymptomLogs.create({
      user_id: user.id,
      date: selectedDate,
      symptom_type: type,
      severity,
      notes: symptomNotes || undefined,
    });
    setAddingSymptom(false);
    setSymptomType("");
    setCustomSymptom("");
    setSeverity(3);
    setSymptomNotes("");
    await loadData(user.id, selectedDate);
  };

  const deleteSymptom = async (id) => {
    await base44.entities.SymptomLogs.delete(id);
    await loadData(user.id, selectedDate);
  };

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  const isToday = selectedDate === todayStr;
  const displayDate = selectedDate === todayStr
    ? "Today"
    : format(parseISO(selectedDate), "EEE, MMM d");

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-12 pb-4">
          <h1 className="text-2xl font-bold text-rose-900 mb-3">Track</h1>

          {/* Date navigator */}
          <div className="flex items-center justify-between card-glass rounded-2xl px-4 py-3">
            <button onClick={() => changeDate(-1)} className="p-1">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="text-center">
              <p className="font-semibold text-gray-800">{displayDate}</p>
              {!isToday && <p className="text-xs text-gray-400">{format(parseISO(selectedDate), "yyyy-MM-dd")}</p>}
            </div>
            <button onClick={() => changeDate(1)} disabled={isToday} className="p-1 disabled:opacity-30">
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white/60 rounded-2xl p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CYCLE TAB */}
        {activeTab === "Cycle" && (
          <div className="space-y-3">
            {cycleEvents.length > 0 ? cycleEvents.map((e) => (
              <div key={e.id} className="card-glass rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{e.type === "PeriodStart" ? "🩸" : e.type === "PeriodEnd" ? "🏁" : "🔴"}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{e.type.replace(/([A-Z])/g, " $1").trim()}</p>
                    {e.flow_level && <p className="text-xs text-gray-400 capitalize">{e.flow_level} flow</p>}
                  </div>
                </div>
                <button onClick={() => deleteCycleEvent(e.id)} className="text-xs text-red-400 hover:text-red-500">Remove</button>
              </div>
            )) : (
              <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
                <Droplets className="w-8 h-8 mx-auto mb-2 text-rose-200" />
                <p className="text-sm">No cycle events logged for this day.</p>
              </div>
            )}

            {addingCycleEvent ? (
              <div className="card-glass rounded-2xl p-4 space-y-4">
                <p className="font-semibold text-gray-700 text-sm">Log Cycle Event</p>
                <div className="grid grid-cols-3 gap-2">
                  {PERIOD_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setCycleEventType(t.value)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        cycleEventType === t.value ? "bg-rose-500 text-white" : "bg-white/70 text-gray-600"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {(cycleEventType === "PeriodStart" || cycleEventType === "Spotting") && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Flow level</p>
                    <div className="flex gap-2">
                      {FLOW_OPTIONS.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setFlowLevel(f.value)}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                            flowLevel === f.value ? "bg-rose-100 border-2 border-rose-400 text-rose-700" : "bg-white/70 text-gray-600 border border-transparent"
                          }`}
                        >
                          {f.emoji}<br />{f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setAddingCycleEvent(false)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                  <button onClick={saveCycleEvent} className="btn-primary flex-1 py-2 text-sm">Save</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCycleEvent(true)}
                className="w-full card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">Log cycle event</p>
              </button>
            )}
          </div>
        )}

        {/* SYMPTOMS TAB */}
        {activeTab === "Symptoms" && (
          <div className="space-y-3">
            {symptomLogs.length > 0 ? symptomLogs.map((s) => (
              <div key={s.id} className="card-glass rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm capitalize">{s.symptom_type}</p>
                  <p className="text-xs text-gray-400">{SEVERITY_LABELS[s.severity] || `Severity ${s.severity}`}</p>
                  {s.notes && <p className="text-xs text-gray-500 mt-0.5 italic">"{s.notes}"</p>}
                </div>
                <button onClick={() => deleteSymptom(s.id)} className="text-xs text-red-400 hover:text-red-500">Remove</button>
              </div>
            )) : (
              <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-2 text-rose-200" />
                <p className="text-sm">No symptoms logged for this day.</p>
              </div>
            )}

            {addingSymptom ? (
              <div className="card-glass rounded-2xl p-4 space-y-4">
                <p className="font-semibold text-gray-700 text-sm">Log a Symptom</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSymptomType(s); setCustomSymptom(""); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                        symptomType === s ? "bg-rose-500 text-white" : "bg-white/70 text-gray-600 border border-rose-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type a custom symptom..."
                  value={customSymptom}
                  onChange={(e) => { setCustomSymptom(e.target.value); setSymptomType(""); }}
                  className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <div>
                  <label className="text-xs text-gray-500 flex justify-between mb-1">
                    <span>Severity</span>
                    <span className="text-rose-600 font-semibold">{SEVERITY_LABELS[severity]}</span>
                  </label>
                  <input type="range" min="1" max="5" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
                </div>
                <textarea
                  placeholder="Notes (optional)"
                  value={symptomNotes}
                  onChange={(e) => setSymptomNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-rose-100 bg-rose-50/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <div className="flex gap-2">
                  <button onClick={() => setAddingSymptom(false)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                  <button onClick={saveSymptom} disabled={!symptomType && !customSymptom.trim()} className="btn-primary flex-1 py-2 text-sm">Save</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingSymptom(true)}
                className="w-full card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">Log a symptom</p>
              </button>
            )}
          </div>
        )}

        {/* HABITS TAB */}
        {activeTab === "Habits" && (
          <div className="space-y-3">
            {habitLogs.length > 0 ? habitLogs.map((h) => (
              <div key={h.id} className="card-glass rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <p className="text-sm font-semibold text-gray-800 capitalize">{h.habit_name || h.habit_type || "Habit"}</p>
                  {h.completed && <span className="ml-auto text-emerald-500 text-xs font-medium">✓ Done</span>}
                </div>
              </div>
            )) : (
              <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
                <Heart className="w-8 h-8 mx-auto mb-2 text-rose-200" />
                <p className="text-sm">No habits logged for this day.</p>
                <p className="text-xs mt-1">Habit tracking coming soon.</p>
              </div>
            )}
          </div>
        )}

        {/* MEDS TAB */}
        {activeTab === "Meds" && (
          <div className="space-y-3">
            {medLogs.length > 0 ? medLogs.map((m) => (
              <div key={m.id} className="card-glass rounded-2xl p-4 flex items-center gap-3">
                <Pill className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{m.medication_name || "Medication"}</p>
                  {m.dosage && <p className="text-xs text-gray-400">{m.dosage}</p>}
                </div>
              </div>
            )) : (
              <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
                <Pill className="w-8 h-8 mx-auto mb-2 text-purple-200" />
                <p className="text-sm">No medications logged for this day.</p>
                <p className="text-xs mt-1">Medication tracking coming soon.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
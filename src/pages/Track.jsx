import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Droplets, Activity, Pill, Heart, CheckSquare, ChevronDown } from "lucide-react";

const today = new Date().toISOString().split("T")[0];

const TABS = [
  { id: "cycle", label: "Cycle", emoji: "🩸" },
  { id: "symptoms", label: "Symptoms", emoji: "📝" },
  { id: "habits", label: "Habits", emoji: "✅" },
  { id: "meds", label: "Meds", emoji: "💊" },
];

const SYMPTOMS = [
  "Cramps", "Headache", "Bloating", "Fatigue", "Back Pain",
  "Breast Tenderness", "Mood Swings", "Nausea", "Acne", "Insomnia",
  "Hot Flashes", "Spotting", "Pelvic Pain", "Anxiety", "Brain Fog",
];

const HABITS = [
  { id: "water", label: "Water", emoji: "💧", unit: "glasses", default: 8 },
  { id: "steps", label: "Steps", emoji: "👟", unit: "steps", default: 8000 },
  { id: "meditation", label: "Meditation", emoji: "🧘", unit: "min", default: 10 },
  { id: "exercise", label: "Exercise", emoji: "🏃", unit: "min", default: 30 },
];

const FLOW_LEVELS = ["light", "medium", "heavy"];

export default function Track() {
  const [tab, setTab] = useState("cycle");
  const [user, setUser] = useState(null);
  const [cycleEvents, setCycleEvents] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [habits, setHabits] = useState([]);
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cycle form
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [cycleType, setCycleType] = useState("PeriodStart");
  const [flowLevel, setFlowLevel] = useState("medium");
  const [cycleDate, setCycleDate] = useState(today);

  // Symptom form
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [selSymptom, setSelSymptom] = useState("");
  const [severity, setSeverity] = useState(3);
  const [symptomNotes, setSymptomNotes] = useState("");

  // Med form
  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      await loadData(u.id);
      setLoading(false);
    })();
  }, []);

  const loadData = async (uid) => {
    const [ce, sl, hl, ml] = await Promise.all([
      base44.entities.CycleEvents.filter({ user_id: uid, date: today }, "-created_date"),
      base44.entities.SymptomLogs.filter({ user_id: uid, date: today }, "-created_date"),
      base44.entities.HabitLogs.filter({ user_id: uid, date: today }),
      base44.entities.MedicationLogs.filter({ user_id: uid, date: today }),
    ]);
    setCycleEvents(ce);
    setSymptoms(sl);
    setHabits(hl);
    setMeds(ml);
  };

  const logCycle = async () => {
    setSaving(true);
    await base44.entities.CycleEvents.create({
      user_id: user.id, date: cycleDate, type: cycleType, flow_level: flowLevel,
    });
    await loadData(user.id);
    setShowCycleForm(false);
    setSaving(false);
  };

  const logSymptom = async () => {
    if (!selSymptom) return;
    setSaving(true);
    await base44.entities.SymptomLogs.create({
      user_id: user.id, date: today, symptom_type: selSymptom, severity, notes: symptomNotes,
    });
    await loadData(user.id);
    setShowSymptomForm(false);
    setSelSymptom(""); setSeverity(3); setSymptomNotes("");
    setSaving(false);
  };

  const toggleHabit = async (habit) => {
    const existing = habits.find((h) => h.habit_type === habit.id);
    if (existing) {
      await base44.entities.HabitLogs.update(existing.id, { completed: !existing.completed });
    } else {
      await base44.entities.HabitLogs.create({
        user_id: user.id, date: today, habit_type: habit.id,
        completed: true, amount: habit.default, unit: habit.unit,
      });
    }
    await loadData(user.id);
  };

  const logMed = async () => {
    if (!medName) return;
    setSaving(true);
    await base44.entities.MedicationLogs.create({
      user_id: user.id, date: today, item_name: medName, dose: medDose, taken: true,
    });
    await loadData(user.id);
    setShowMedForm(false);
    setMedName(""); setMedDose("");
    setSaving(false);
  };

  const toggleMedTaken = async (med) => {
    await base44.entities.MedicationLogs.update(med.id, { taken: !med.taken });
    await loadData(user.id);
  };

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      <div className="max-w-md mx-auto px-4">
        <div className="pt-12 pb-4">
          <h1 className="text-2xl font-bold text-rose-900">Track</h1>
          <p className="text-sm text-gray-400">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id ? "bg-rose-500 text-white shadow-md" : "bg-white/70 text-gray-500 hover:bg-white"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* CYCLE TAB */}
        {tab === "cycle" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Today's Cycle Log</h2>
              <button onClick={() => setShowCycleForm(!showCycleForm)} className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <Plus className="w-4 h-4 text-rose-600" />
              </button>
            </div>

            {showCycleForm && (
              <div className="card-glass rounded-2xl p-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Event Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["PeriodStart", "PeriodEnd", "Spotting"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setCycleType(t)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border-2 transition-all ${
                          cycleType === t ? "border-rose-400 bg-rose-50 text-rose-600" : "border-transparent bg-white/60 text-gray-600"
                        }`}
                      >
                        {t === "PeriodStart" ? "🩸 Start" : t === "PeriodEnd" ? "✅ End" : "🔴 Spotting"}
                      </button>
                    ))}
                  </div>
                </div>
                {cycleType !== "PeriodEnd" && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-2">Flow Level</label>
                    <div className="flex gap-2">
                      {FLOW_LEVELS.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFlowLevel(f)}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize border-2 transition-all ${
                            flowLevel === f ? "border-rose-400 bg-rose-50 text-rose-600" : "border-transparent bg-white/60 text-gray-600"
                          }`}
                        >
                          {f === "light" ? "💧" : f === "medium" ? "🩸" : "🔴"} {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Date</label>
                  <input type="date" value={cycleDate} onChange={(e) => setCycleDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-rose-100 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <button onClick={logCycle} disabled={saving} className="btn-primary w-full">{saving ? "Saving..." : "Log Event"}</button>
              </div>
            )}

            {cycleEvents.length === 0 && !showCycleForm && (
              <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
                <Droplets className="w-8 h-8 mx-auto mb-2 text-rose-200" />
                <p className="text-sm">No cycle events logged today.</p>
              </div>
            )}

            {cycleEvents.map((e) => (
              <div key={e.id} className="card-glass rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">{e.type === "PeriodStart" ? "🩸" : e.type === "PeriodEnd" ? "✅" : "🔴"}</span>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{e.type.replace(/([A-Z])/g, " $1").trim()}</p>
                  {e.flow_level && <p className="text-xs text-gray-400 capitalize">Flow: {e.flow_level}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SYMPTOMS TAB */}
        {tab === "symptoms" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Symptoms Today</h2>
              <button onClick={() => setShowSymptomForm(!showSymptomForm)} className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <Plus className="w-4 h-4 text-rose-600" />
              </button>
            </div>

            {showSymptomForm && (
              <div className="card-glass rounded-2xl p-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Symptom</label>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelSymptom(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selSymptom === s ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 bg-white/60 text-gray-600"
                        }`}
                      >{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Severity: <span className="font-bold text-rose-600">{severity}/5</span></label>
                  <input type="range" min="1" max="5" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
                </div>
                <textarea placeholder="Notes (optional)" value={symptomNotes} onChange={(e) => setSymptomNotes(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-rose-100 bg-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" rows={2} />
                <button onClick={logSymptom} disabled={saving || !selSymptom} className="btn-primary w-full">{saving ? "Saving..." : "Log Symptom"}</button>
              </div>
            )}

            {symptoms.length === 0 && !showSymptomForm && (
              <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-2 text-rose-200" />
                <p className="text-sm">No symptoms logged today.</p>
              </div>
            )}

            {symptoms.map((s) => (
              <div key={s.id} className="card-glass rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{s.symptom_type}</p>
                  <p className="text-xs text-gray-400">Severity: {s.severity}/5{s.notes ? ` · ${s.notes}` : ""}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-2 h-4 rounded-full ${i < s.severity ? "bg-rose-400" : "bg-rose-100"}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HABITS TAB */}
        {tab === "habits" && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-700">Daily Habits</h2>
            {HABITS.map((habit) => {
              const log = habits.find((h) => h.habit_type === habit.id);
              return (
                <div key={habit.id} className="card-glass rounded-2xl p-4 flex items-center gap-4">
                  <div className="text-2xl">{habit.emoji}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{habit.label}</p>
                    <p className="text-xs text-gray-400">Goal: {habit.default} {habit.unit}</p>
                  </div>
                  <button
                    onClick={() => toggleHabit(habit)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      log?.completed ? "bg-emerald-100" : "bg-gray-100"
                    }`}
                  >
                    <CheckSquare className={`w-5 h-5 ${log?.completed ? "text-emerald-500" : "text-gray-300"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* MEDS TAB */}
        {tab === "meds" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Medications & Supplements</h2>
              <button onClick={() => setShowMedForm(!showMedForm)} className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <Plus className="w-4 h-4 text-rose-600" />
              </button>
            </div>

            {showMedForm && (
              <div className="card-glass rounded-2xl p-4 space-y-3">
                <input placeholder="Name (e.g. Iron, Vitamin D)" value={medName} onChange={(e) => setMedName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-rose-100 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                <input placeholder="Dose (e.g. 400mg)" value={medDose} onChange={(e) => setMedDose(e.target.value)}
                  className="w-full p-3 rounded-xl border border-rose-100 bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                <button onClick={logMed} disabled={saving || !medName} className="btn-primary w-full">{saving ? "Saving..." : "Add Medication"}</button>
              </div>
            )}

            {meds.length === 0 && !showMedForm && (
              <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
                <Pill className="w-8 h-8 mx-auto mb-2 text-rose-200" />
                <p className="text-sm">No medications logged today.</p>
              </div>
            )}

            {meds.map((m) => (
              <div key={m.id} className="card-glass rounded-2xl p-4 flex items-center gap-3">
                <div className="text-2xl">💊</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{m.item_name}</p>
                  {m.dose && <p className="text-xs text-gray-400">{m.dose}</p>}
                </div>
                <button
                  onClick={() => toggleMedTaken(m)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    m.taken ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {m.taken ? "Taken ✓" : "Mark taken"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
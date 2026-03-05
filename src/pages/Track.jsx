import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Droplets, Activity, Pill, Heart, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isSameMonth, isToday } from "date-fns";

const todayStr = new Date().toISOString().split("T")[0];

const MAIN_TABS = [
  { id: "quicklog", label: "Quick Log" },
  { id: "calendar", label: "Calendar" },
];

const LOG_TABS = [
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

function QuickLog({ user }) {
  const [tab, setTab] = useState("cycle");
  const [cycleEvents, setCycleEvents] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [habits, setHabits] = useState([]);
  const [meds, setMeds] = useState([]);
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [cycleType, setCycleType] = useState("PeriodStart");
  const [flowLevel, setFlowLevel] = useState("medium");
  const [cycleDate, setCycleDate] = useState(todayStr);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [selSymptom, setSelSymptom] = useState("");
  const [severity, setSeverity] = useState(3);
  const [symptomNotes, setSymptomNotes] = useState("");
  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [ce, sl, hl, ml] = await Promise.all([
      base44.entities.CycleEvents.filter({ user_id: user.id, date: todayStr }),
      base44.entities.SymptomLogs.filter({ user_id: user.id, date: todayStr }),
      base44.entities.HabitLogs.filter({ user_id: user.id, date: todayStr }),
      base44.entities.MedicationLogs.filter({ user_id: user.id, date: todayStr }),
    ]);
    setCycleEvents(ce); setSymptoms(sl); setHabits(hl); setMeds(ml);
  };

  useEffect(() => { loadData(); }, []);

  const logCycle = async () => {
    setSaving(true);
    await base44.entities.CycleEvents.create({ user_id: user.id, date: cycleDate, type: cycleType, flow_level: flowLevel });
    await loadData(); setShowCycleForm(false); setSaving(false);
  };

  const logSymptom = async () => {
    if (!selSymptom) return;
    setSaving(true);
    await base44.entities.SymptomLogs.create({ user_id: user.id, date: todayStr, symptom_type: selSymptom, severity, notes: symptomNotes });
    await loadData(); setShowSymptomForm(false); setSelSymptom(""); setSeverity(3); setSymptomNotes(""); setSaving(false);
  };

  const toggleHabit = async (habit) => {
    const existing = habits.find((h) => h.habit_type === habit.id);
    if (existing) {
      await base44.entities.HabitLogs.update(existing.id, { completed: !existing.completed });
    } else {
      await base44.entities.HabitLogs.create({ user_id: user.id, date: todayStr, habit_type: habit.id, completed: true, amount: habit.default, unit: habit.unit });
    }
    await loadData();
  };

  const logMed = async () => {
    if (!medName) return;
    setSaving(true);
    await base44.entities.MedicationLogs.create({ user_id: user.id, date: todayStr, item_name: medName, dose: medDose, taken: true });
    await loadData(); setShowMedForm(false); setMedName(""); setMedDose(""); setSaving(false);
  };

  const toggleMedTaken = async (med) => {
    await base44.entities.MedicationLogs.update(med.id, { taken: !med.taken });
    await loadData();
  };

  return (
    <div>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
        {LOG_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-rose-500 text-white shadow-md" : "bg-white/70 text-gray-500 hover:bg-white"}`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

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
                    <button key={t} onClick={() => setCycleType(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border-2 transition-all ${cycleType === t ? "border-rose-400 bg-rose-50 text-rose-600" : "border-transparent bg-white/60 text-gray-600"}`}>
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
                      <button key={f} onClick={() => setFlowLevel(f)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize border-2 transition-all ${flowLevel === f ? "border-rose-400 bg-rose-50 text-rose-600" : "border-transparent bg-white/60 text-gray-600"}`}>
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
                    <button key={s} onClick={() => setSelSymptom(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selSymptom === s ? "border-rose-400 bg-rose-50 text-rose-600" : "border-gray-200 bg-white/60 text-gray-600"}`}>
                      {s}
                    </button>
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
                <p className="text-xs text-gray-400">Severity: {s.severity}/5</p>
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
                <button onClick={() => toggleHabit(habit)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${log?.completed ? "bg-emerald-100" : "bg-gray-100"}`}>
                  <CheckSquare className={`w-5 h-5 ${log?.completed ? "text-emerald-500" : "text-gray-300"}`} />
                </button>
              </div>
            );
          })}
        </div>
      )}

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
              <button onClick={() => toggleMedTaken(m)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${m.taken ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                {m.taken ? "Taken ✓" : "Mark taken"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarView({ user }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [cycleEvents, setCycleEvents] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDetail, setDayDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    (async () => {
      const [ce, sl, ci] = await Promise.all([
        base44.entities.CycleEvents.filter({ user_id: user.id }, "-date", 100),
        base44.entities.SymptomLogs.filter({ user_id: user.id }, "-date", 200),
        base44.entities.DailyCheckins.filter({ user_id: user.id }, "-date", 90),
      ]);
      setCycleEvents(ce);
      setSymptomLogs(sl);
      setCheckins(ci);
    })();
  }, []);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfWeek = startOfMonth(currentMonth).getDay();

  const cycleByDate = {};
  cycleEvents.forEach((e) => { cycleByDate[e.date] = (cycleByDate[e.date] || []); cycleByDate[e.date].push(e); });
  const symptomDates = new Set(symptomLogs.map((s) => s.date));
  const checkinDates = new Set(checkins.map((c) => c.date));

  const openDay = async (dateStr) => {
    setSelectedDay(dateStr);
    setLoadingDetail(true);
    const [ce, sl, ml, hl, ci] = await Promise.all([
      base44.entities.CycleEvents.filter({ user_id: user.id, date: dateStr }),
      base44.entities.SymptomLogs.filter({ user_id: user.id, date: dateStr }),
      base44.entities.MedicationLogs.filter({ user_id: user.id, date: dateStr }),
      base44.entities.HabitLogs.filter({ user_id: user.id, date: dateStr }),
      base44.entities.DailyCheckins.filter({ user_id: user.id, date: dateStr }),
    ]);
    setDayDetail({ cycleEvents: ce, symptoms: sl, meds: ml, habits: hl, checkin: ci[0] });
    setLoadingDetail(false);
  };

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))} className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h2 className="font-semibold text-gray-700">{format(currentMonth, "MMMM yyyy")}</h2>
        <button onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))} className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const hasCycle = cycleByDate[dateStr]?.length > 0;
          const hasSymptom = symptomDates.has(dateStr);
          const hasCheckin = checkinDates.has(dateStr);
          const today = isToday(day);
          const selected = selectedDay === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => openDay(dateStr)}
              className={`relative h-10 rounded-xl flex flex-col items-center justify-center transition-all ${selected ? "bg-rose-500 text-white" : today ? "bg-rose-100 text-rose-700 font-bold" : "bg-white/50 text-gray-700 hover:bg-white/80"}`}
            >
              <span className="text-xs font-medium">{format(day, "d")}</span>
              <div className="flex gap-0.5 mt-0.5">
                {hasCycle && <div className="w-1 h-1 rounded-full bg-rose-400" />}
                {hasSymptom && <div className="w-1 h-1 rounded-full bg-amber-400" />}
                {hasCheckin && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mb-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Period</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Symptom</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Check-in</span>
      </div>

      {/* Day detail */}
      {selectedDay && (
        <div className="card-glass rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-700">{format(parseISO(selectedDay), "EEEE, MMMM d")}</h3>
          {loadingDetail ? (
            <div className="flex items-center justify-center py-4"><div className="w-6 h-6 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" /></div>
          ) : dayDetail ? (
            <>
              {dayDetail.checkin && (
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-emerald-600 mb-1">✓ Check-in</p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>😊 {dayDetail.checkin.mood}/5</span>
                    <span>⚡ {dayDetail.checkin.energy}/5</span>
                    <span>💤 {dayDetail.checkin.sleep_hours}h</span>
                  </div>
                </div>
              )}
              {dayDetail.cycleEvents.length > 0 && (
                <div className="bg-rose-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-rose-600 mb-1">🩸 Cycle</p>
                  {dayDetail.cycleEvents.map((e) => (
                    <p key={e.id} className="text-xs text-gray-600">{e.type.replace(/([A-Z])/g, " $1").trim()}{e.flow_level ? ` · ${e.flow_level}` : ""}</p>
                  ))}
                </div>
              )}
              {dayDetail.symptoms.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-amber-600 mb-1">📝 Symptoms</p>
                  {dayDetail.symptoms.map((s) => (
                    <p key={s.id} className="text-xs text-gray-600">{s.symptom_type} · {s.severity}/5</p>
                  ))}
                </div>
              )}
              {dayDetail.meds.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-purple-600 mb-1">💊 Medications</p>
                  {dayDetail.meds.map((m) => (
                    <p key={m.id} className="text-xs text-gray-600">{m.item_name}{m.dose ? ` · ${m.dose}` : ""} {m.taken ? "✓" : ""}</p>
                  ))}
                </div>
              )}
              {dayDetail.habits.filter(h => h.completed).length > 0 && (
                <div className="bg-teal-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-teal-600 mb-1">✅ Habits</p>
                  {dayDetail.habits.filter(h => h.completed).map((h) => (
                    <p key={h.id} className="text-xs text-gray-600 capitalize">{h.habit_type}</p>
                  ))}
                </div>
              )}
              {!dayDetail.checkin && dayDetail.cycleEvents.length === 0 && dayDetail.symptoms.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">Nothing logged this day.</p>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function Track() {
  const [mainTab, setMainTab] = useState("quicklog");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => { setUser(u); setLoading(false); });
  }, []);

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

        {/* Main tabs */}
        <div className="flex gap-2 mb-5">
          {MAIN_TABS.map((t) => (
            <button key={t.id} onClick={() => setMainTab(t.id)}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all ${mainTab === t.id ? "bg-rose-500 text-white shadow-md" : "bg-white/70 text-gray-500 hover:bg-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {mainTab === "quicklog" && <QuickLog user={user} />}
        {mainTab === "calendar" && <CalendarView user={user} />}
      </div>
    </div>
  );
}
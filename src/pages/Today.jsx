import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Sun, ChevronRight, Plus, Sparkles, ChevronLeft, Droplets, Activity, Heart, Pill, Play, CheckCircle, Trash2, Utensils, Loader2 } from "lucide-react";
import ManualCompleteButton from "../components/sessions/ManualCompleteButton";
import DailyInsightBanner from "../components/today/DailyInsightBanner";
import HabitCard from "../components/habits/HabitCard";
import StreakMilestoneToast from "../components/habits/StreakMilestoneToast";
import CheckinModal from "../components/today/CheckinModal";
import WeeklyInsightCard from "../components/today/WeeklyInsightCard";
import TrackCalendar from "../components/today/TrackCalendar";
import { format, differenceInDays, parseISO } from "date-fns";

// ── Cycle phase helper ──────────────────────────────────────────────────────
const PHASE_INFO = {
  menstrual: { label: "Menstrual Phase", emoji: "🩸", color: "from-rose-300 to-pink-400", tip: "Rest and restore. Your body is working hard." },
  follicular: { label: "Follicular Phase", emoji: "🌱", color: "from-emerald-300 to-teal-400", tip: "Energy rising — great time to start new things." },
  ovulatory: { label: "Ovulatory Phase", emoji: "☀️", color: "from-amber-300 to-yellow-400", tip: "Peak energy and confidence. Shine today!" },
  luteal: { label: "Luteal Phase", emoji: "🌙", color: "from-purple-300 to-indigo-400", tip: "Wind down, reflect, and nourish yourself." },
};

function getCyclePhase(lastPeriodDate, cycleLength, periodLength) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = parseISO(lastPeriodDate);
  const dayOfCycle = (differenceInDays(today, last) % cycleLength) + 1;
  if (dayOfCycle <= periodLength) return { phase: "menstrual", day: dayOfCycle };
  if (dayOfCycle <= Math.round(cycleLength * 0.4)) return { phase: "follicular", day: dayOfCycle };
  if (dayOfCycle <= Math.round(cycleLength * 0.55)) return { phase: "ovulatory", day: dayOfCycle };
  return { phase: "luteal", day: dayOfCycle };
}

// ── Track constants ─────────────────────────────────────────────────────────
const TRACK_TABS = ["Cycle", "Symptoms", "Habits", "Meds", "Sessions"];

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

// ── Main component ──────────────────────────────────────────────────────────
export default function Today() {
  const [mainTab, setMainTab] = useState("today"); // "today" | "track"
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Today tab state
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showCheckin, setShowCheckin] = useState(false);
  const [todayCompletions, setTodayCompletions] = useState([]);

  // Track tab state
  const [trackTab, setTrackTab] = useState("Cycle");
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
  const [addingMed, setAddingMed] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medNotes, setMedNotes] = useState("");
  const [savingMed, setSavingMed] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [sessionContent, setSessionContent] = useState({});

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, checkins, content, recs, completions] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }),
        base44.entities.DailyCheckins.filter({ user_id: u.id, date: todayStr }),
        base44.entities.ContentItems.filter({ is_featured: true }, "-created_date", 3),
        base44.entities.TodayRecommendations.filter({ user_id: u.id, date: todayStr }),
        base44.entities.ContentHistory.filter({ user_id: u.id, session_date: todayStr }),
      ]);
      if (profiles[0]) setProfile(profiles[0]);
      if (checkins[0]) setTodayCheckin(checkins[0]);
      setRecentContent(content);
      setRecommendations(recs);
      setTodayCompletions(completions.filter((c) => !c.is_deleted));

      // Track data
      const all = await base44.entities.HabitLogs.filter({ user_id: u.id });
      setAllHabitLogs(all);
      await loadTrackData(u.id, todayStr);
      setLoading(false);
    })();
  }, []);

  const loadTrackData = async (userId, date) => {
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
    if (user) await loadTrackData(user.id, newDate);
  };

  const handleSaveCheckin = async (data) => {
    const payload = { user_id: user.id, date: todayStr, ...data, updated_at: new Date().toISOString() };
    if (todayCheckin) {
      await base44.entities.DailyCheckins.update(todayCheckin.id, payload);
      setTodayCheckin({ ...todayCheckin, ...payload });
    } else {
      const created = await base44.entities.DailyCheckins.create(payload);
      setTodayCheckin(created);
    }
  };

  // Track actions
  const saveCycleEvent = async () => {
    await base44.entities.CycleEvents.create({
      user_id: user.id, date: selectedDate, type: cycleEventType,
      flow_level: cycleEventType !== "PeriodEnd" ? flowLevel : undefined,
    });
    setAddingCycleEvent(false);
    await loadTrackData(user.id, selectedDate);
  };

  const saveSymptom = async () => {
    const type = customSymptom.trim() || symptomType;
    if (!type) return;
    await base44.entities.SymptomLogs.create({ user_id: user.id, date: selectedDate, symptom_type: type, severity, notes: symptomNotes || undefined });
    setAddingSymptom(false); setSymptomType(""); setCustomSymptom(""); setSeverity(3); setSymptomNotes("");
    await loadTrackData(user.id, selectedDate);
  };

  const saveMed = async () => {
    if (!medName.trim()) return;
    setSavingMed(true);
    await base44.entities.MedicationLogs.create({ user_id: user.id, date: selectedDate, item_name: medName.trim(), dose: medDose || undefined, notes: medNotes || undefined, taken: true });
    setAddingMed(false); setMedName(""); setMedDose(""); setMedNotes("");
    setSavingMed(false);
    await loadTrackData(user.id, selectedDate);
  };

  const calcStreak = (habitName) => {
    let count = 0;
    const check = new Date();
    const todayDone = allHabitLogs.some((l) => (l.habit_type === habitName || l.habit_name === habitName) && l.completed && l.date === todayStr);
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
    await loadTrackData(user.id, selectedDate);
    const newStreak = calcStreak(habitName) + 1;
    if ([7, 14, 30, 60, 100].includes(newStreak)) setMilestone({ streak: newStreak, habitName });
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    setSavingHabit(true);
    await base44.entities.HabitLogs.create({ user_id: user.id, date: selectedDate, habit_type: newHabitName.trim(), habit_name: newHabitName.trim(), completed: false });
    const all = await base44.entities.HabitLogs.filter({ user_id: user.id });
    setAllHabitLogs(all);
    await loadTrackData(user.id, selectedDate);
    setNewHabitName(""); setAddingHabit(false); setSavingHabit(false);
  };

  const handleDeleteHabit = async (habitName) => {
    const toDelete = allHabitLogs.filter((l) => l.habit_type === habitName || l.habit_name === habitName);
    await Promise.all(toDelete.map((l) => base44.entities.HabitLogs.delete(l.id)));
    const all = await base44.entities.HabitLogs.filter({ user_id: user.id });
    setAllHabitLogs(all);
    await loadTrackData(user.id, selectedDate);
  };

  const cycleInfo = profile?.last_period_start_date
    ? getCyclePhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5)
    : null;
  const phaseData = cycleInfo ? PHASE_INFO[cycleInfo.phase] : null;
  const allHabitNames = [...new Set(allHabitLogs.map((l) => l.habit_type || l.habit_name).filter(Boolean))];
  const isToday = selectedDate === todayStr;
  const displayDate = isToday ? "Today" : format(parseISO(selectedDate), "EEE, MMM d");

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      {showCheckin && (
        <CheckinModal
          existing={todayCheckin}
          onClose={() => setShowCheckin(false)}
          onSave={handleSaveCheckin}
        />
      )}

      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-12 pb-3 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400">{format(new Date(), "EEEE, MMMM d")}</p>
            <h1 className="text-2xl font-bold text-rose-900">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
              {user?.full_name?.split(" ")[0] || ""}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center text-white font-bold shadow-md">
            {user?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-1 mb-5 bg-white/60 rounded-2xl p-1">
          <button
            onClick={() => setMainTab("today")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${mainTab === "today" ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"}`}
          >
            My Day
          </button>
          <button
            onClick={() => setMainTab("track")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${mainTab === "track" ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"}`}
          >
            My Track
          </button>
        </div>

        {/* ── MY DAY ─────────────────────────────────────────────────────── */}
        {mainTab === "today" && (
          <>
            {/* Cycle phase card */}
            {phaseData && (
              <div className={`card-glass rounded-2xl p-5 mb-4 bg-gradient-to-r ${phaseData.color} bg-opacity-10 relative overflow-hidden`}>
                <div className="relative z-10">
                  <p className="text-xs font-medium text-white/80 mb-0.5">Day {cycleInfo.day} of cycle</p>
                  <h2 className="text-lg font-bold text-white">{phaseData.emoji} {phaseData.label}</h2>
                  <p className="text-sm text-white/90 mt-1">{phaseData.tip}</p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-30">{phaseData.emoji}</div>
              </div>
            )}

            {/* Daily Insight Banner */}
            {user && <DailyInsightBanner user={user} />}

            {/* Weekly Insight */}
            {user && <WeeklyInsightCard user={user} />}

            {/* Daily check-in */}
            <div className="card-glass rounded-2xl p-4 mb-4">
              {todayCheckin ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-700 text-sm">Today's Check-in ✓</p>
                    <button onClick={() => setShowCheckin(true)} className="text-xs text-rose-400 font-medium">Edit</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Mood", emoji: "😊", value: todayCheckin.mood, unit: "/5" },
                      { label: "Energy", emoji: "⚡", value: todayCheckin.energy, unit: "/5" },
                      { label: "Stress", emoji: "🌊", value: todayCheckin.stress, unit: "/5" },
                      { label: "Sleep", emoji: "💤", value: todayCheckin.sleep_hours, unit: "h" },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <p className="text-lg">{m.emoji}</p>
                        <p className="text-sm font-bold text-gray-700">{m.value}{m.unit}</p>
                        <p className="text-xs text-gray-400">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  {todayCheckin.hydration_glasses != null && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {todayCheckin.hydration_glasses != null && <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">💧 {todayCheckin.hydration_glasses} glasses</span>}
                      {todayCheckin.exercise_done && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">🏃 {todayCheckin.exercise_type || "Exercise"} {todayCheckin.exercise_minutes ? `${todayCheckin.exercise_minutes}m` : ""}</span>}
                      {todayCheckin.focus != null && <span className="text-xs bg-purple-50 text-purple-500 px-2 py-0.5 rounded-full">🎯 Focus {todayCheckin.focus}/5</span>}
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setShowCheckin(true)} className="w-full flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <Sun className="w-6 h-6 text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">Daily Check-in</p>
                    <p className="text-xs text-gray-400">Tap to log your mood, energy & more</p>
                  </div>
                  <Plus className="w-5 h-5 text-rose-400" />
                </button>
              )}
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mb-4">
                <h2 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-400" /> For You Today
                </h2>
                <div className="space-y-2">
                  {recommendations.map((rec) => (
                    <a key={rec.id} href={rec.action_route || "#"} className="card-glass rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow block">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{rec.title}</p>
                        {rec.reason && <p className="text-xs text-gray-400 truncate">{rec.reason}</p>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Featured content */}
            {recentContent.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-700 text-sm">Recommended Practices</h2>
                  <a href={createPageUrl("Explore")} className="text-xs text-rose-400 font-medium">See all</a>
                </div>
                <div className="space-y-3">
                  {recentContent.map((item) => {
                    const isComplete = todayCompletions.some((c) => c.content_id === item.id || c.content_key === item.content_key);
                    return (
                      <div key={item.id} className="card-glass rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                        <a href={createPageUrl(`ContentPlayer?id=${item.id}`)} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center flex-shrink-0 text-xl relative">
                            {item.content_type === "MEDITATION" ? "🧘" : item.content_type === "BREATHWORK" ? "🌬️" : item.content_type === "WORKOUT" ? "💪" : "📖"}
                            {isComplete && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-[8px]">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{item.title}</p>
                            <p className="text-xs text-gray-400">{item.duration_minutes ? `${item.duration_minutes} min · ` : ""}{item.content_type}</p>
                          </div>
                        </a>
                        {!isComplete && user && (
                          <ManualCompleteButton item={item} user={user} source="TODAY" onDone={(r) => setTodayCompletions((p) => [...p, r])} />
                        )}
                        {isComplete && <span className="text-xs text-emerald-500 font-medium flex-shrink-0">Done ✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nutrition card */}
            <a href={createPageUrl("Nutrition")} className="card-glass rounded-2xl p-4 mb-4 flex items-center gap-3 hover:shadow-md transition-shadow block">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-300 flex items-center justify-center flex-shrink-0">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Nutrition</p>
                <p className="text-xs text-gray-400">Log meals · Water · Weekly plan</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </a>

            {/* Quick actions */}
            <div className="mb-4">
              <h2 className="font-semibold text-gray-700 text-sm mb-3">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Log Cycle", emoji: "🩸", action: () => { setMainTab("track"); setTrackTab("Cycle"); } },
                  { label: "Journal", emoji: "📓", href: createPageUrl("Journal") },
                  { label: "Explore", emoji: "✨", href: createPageUrl("Explore") },
                ].map((a) => (
                  a.href ? (
                    <a key={a.label} href={a.href} className="card-glass rounded-2xl p-3 text-center hover:shadow-md transition-shadow block">
                      <p className="text-2xl mb-1">{a.emoji}</p>
                      <p className="text-xs font-medium text-gray-600">{a.label}</p>
                    </a>
                  ) : (
                    <button key={a.label} onClick={a.action} className="card-glass rounded-2xl p-3 text-center hover:shadow-md transition-shadow">
                      <p className="text-2xl mb-1">{a.emoji}</p>
                      <p className="text-xs font-medium text-gray-600">{a.label}</p>
                    </button>
                  )
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── MY TRACK ───────────────────────────────────────────────────── */}
        {mainTab === "track" && (
          <div>
            {/* Calendar */}
            {user && (
              <TrackCalendar
                user={user}
                selectedDate={selectedDate}
                onSelectDate={async (date) => {
                  setSelectedDate(date);
                  await loadTrackData(user.id, date);
                }}
              />
            )}

            {/* Selected date label */}
            <div className="text-center mb-4">
              <p className="font-semibold text-gray-800">{displayDate}</p>
              {!isToday && <p className="text-xs text-gray-400">{selectedDate}</p>}
            </div>

            {/* Track sub-tabs */}
            <div className="flex gap-1 mb-5 bg-white/60 rounded-2xl p-1 overflow-x-auto">
              {TRACK_TABS.map((tab) => (
                <button key={tab} onClick={() => setTrackTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${trackTab === tab ? "bg-rose-500 text-white shadow-sm" : "text-gray-500"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CYCLE */}
            {trackTab === "Cycle" && (
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
                    <button onClick={async () => { await base44.entities.CycleEvents.delete(e.id); await loadTrackData(user.id, selectedDate); }} className="text-xs text-red-400">Remove</button>
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
                        <button key={t.value} onClick={() => setCycleEventType(t.value)}
                          className={`py-2 rounded-xl text-xs font-medium transition-all ${cycleEventType === t.value ? "bg-rose-500 text-white" : "bg-white/70 text-gray-600"}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {cycleEventType !== "PeriodEnd" && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Flow level</p>
                        <div className="flex gap-2">
                          {FLOW_OPTIONS.map((f) => (
                            <button key={f.value} onClick={() => setFlowLevel(f.value)}
                              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${flowLevel === f.value ? "bg-rose-100 border-2 border-rose-400 text-rose-700" : "bg-white/70 text-gray-600"}`}>
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
                  <button onClick={() => setAddingCycleEvent(true)} className="w-full card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center"><Plus className="w-4 h-4 text-rose-500" /></div>
                    <p className="text-sm font-medium text-gray-700">Log cycle event</p>
                  </button>
                )}
              </div>
            )}

            {/* SYMPTOMS */}
            {trackTab === "Symptoms" && (
              <div className="space-y-3">
                {symptomLogs.length > 0 ? symptomLogs.map((s) => (
                  <div key={s.id} className="card-glass rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm capitalize">{s.symptom_type}</p>
                      <p className="text-xs text-gray-400">{SEVERITY_LABELS[s.severity] || `Severity ${s.severity}`}</p>
                      {s.notes && <p className="text-xs text-gray-500 mt-0.5 italic">"{s.notes}"</p>}
                    </div>
                    <button onClick={async () => { await base44.entities.SymptomLogs.delete(s.id); await loadTrackData(user.id, selectedDate); }} className="text-xs text-red-400">Remove</button>
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
                        <button key={s} onClick={() => { setSymptomType(s); setCustomSymptom(""); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${symptomType === s ? "bg-rose-500 text-white" : "bg-white/70 text-gray-600 border border-rose-100"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <input type="text" placeholder="Or type a custom symptom..." value={customSymptom}
                      onChange={(e) => { setCustomSymptom(e.target.value); setSymptomType(""); }}
                      className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                    <div>
                      <label className="text-xs text-gray-500 flex justify-between mb-1">
                        <span>Severity</span><span className="text-rose-600 font-semibold">{SEVERITY_LABELS[severity]}</span>
                      </label>
                      <input type="range" min="1" max="5" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
                    </div>
                    <textarea placeholder="Notes (optional)" value={symptomNotes} onChange={(e) => setSymptomNotes(e.target.value)} rows={2}
                      className="w-full p-3 rounded-xl border border-rose-100 bg-rose-50/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />
                    <div className="flex gap-2">
                      <button onClick={() => setAddingSymptom(false)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                      <button onClick={saveSymptom} disabled={!symptomType && !customSymptom.trim()} className="btn-primary flex-1 py-2 text-sm">Save</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingSymptom(true)} className="w-full card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center"><Plus className="w-4 h-4 text-rose-500" /></div>
                    <p className="text-sm font-medium text-gray-700">Log a symptom</p>
                  </button>
                )}
              </div>
            )}

            {/* HABITS */}
            {trackTab === "Habits" && (
              <div className="space-y-3">
                {milestone && <StreakMilestoneToast streak={milestone.streak} habitName={milestone.habitName} onDismiss={() => setMilestone(null)} />}
                {allHabitNames.length > 0 ? allHabitNames.map((habitName) => (
                  <HabitCard key={habitName} habit={habitName} habitLogs={habitLogs} allHabitLogs={allHabitLogs}
                    selectedDate={selectedDate} todayStr={todayStr} onComplete={handleHabitComplete} onDelete={handleDeleteHabit} />
                )) : (
                  <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-rose-200" />
                    <p className="text-sm font-medium">No habits yet.</p>
                    <p className="text-xs mt-1">Add your first habit below!</p>
                  </div>
                )}
                {addingHabit ? (
                  <div className="card-glass rounded-2xl p-4 space-y-3">
                    <p className="font-semibold text-gray-700 text-sm">New Habit</p>
                    <input type="text" placeholder="e.g. Drink 8 glasses of water..." value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
                      className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" autoFocus />
                    <div className="flex gap-2 flex-wrap">
                      {["Drink water", "Morning walk", "Meditate", "Stretch", "Read", "Journal", "No screen before bed"].map((s) => (
                        <button key={s} onClick={() => setNewHabitName(s)} className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100">{s}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setAddingHabit(false); setNewHabitName(""); }} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                      <button onClick={handleAddHabit} disabled={!newHabitName.trim() || savingHabit} className="btn-primary flex-1 py-2 text-sm">
                        {savingHabit ? "Adding…" : "Add Habit"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingHabit(true)} className="w-full card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center"><Plus className="w-4 h-4 text-rose-500" /></div>
                    <p className="text-sm font-medium text-gray-700">Add a new habit</p>
                  </button>
                )}
              </div>
            )}

            {/* MEDS */}
            {trackTab === "Meds" && (
              <div className="space-y-3">
                {medLogs.length > 0 ? medLogs.map((m) => (
                  <div key={m.id} className="card-glass rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{m.item_name}</p>
                        {m.dose && <p className="text-xs text-gray-400">{m.dose}</p>}
                        {m.notes && <p className="text-xs text-gray-400 italic">{m.notes}</p>}
                      </div>
                    </div>
                    <button onClick={async () => { await base44.entities.MedicationLogs.delete(m.id); await loadTrackData(user.id, selectedDate); }} className="text-xs text-red-400">Remove</button>
                  </div>
                )) : (
                  <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
                    <Pill className="w-8 h-8 mx-auto mb-2 text-purple-200" />
                    <p className="text-sm">No medications logged for this day.</p>
                  </div>
                )}
                {addingMed ? (
                  <div className="card-glass rounded-2xl p-4 space-y-3">
                    <p className="font-semibold text-gray-700 text-sm">Log Medication</p>
                    <input type="text" placeholder="Medication name *" value={medName} onChange={(e) => setMedName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" autoFocus />
                    <input type="text" placeholder="Dose (e.g. 500mg, optional)" value={medDose} onChange={(e) => setMedDose(e.target.value)}
                      className="w-full p-3 rounded-xl border border-rose-100 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                    <textarea placeholder="Notes (optional)" value={medNotes} onChange={(e) => setMedNotes(e.target.value)} rows={2}
                      className="w-full p-3 rounded-xl border border-rose-100 bg-rose-50/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-200" />
                    <div className="flex gap-2">
                      <button onClick={() => { setAddingMed(false); setMedName(""); setMedDose(""); setMedNotes(""); }} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                      <button onClick={saveMed} disabled={!medName.trim() || savingMed} className="btn-primary flex-1 py-2 text-sm">
                        {savingMed ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingMed(true)} className="w-full card-glass rounded-2xl p-4 flex items-center gap-3 hover:bg-rose-50/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center"><Plus className="w-4 h-4 text-purple-500" /></div>
                    <p className="text-sm font-medium text-gray-700">Log a medication</p>
                  </button>
                )}
              </div>
            )}

            {/* SESSIONS */}
            {trackTab === "Sessions" && (
              <div className="space-y-3">
                {sessionHistory.length > 0 ? sessionHistory.map((s) => {
                  const content = sessionContent[s.content_id];
                  const durationMin = s.duration_seconds ? Math.round(s.duration_seconds / 60) : s.duration_done;
                  return (
                    <div key={s.id} className="card-glass rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-lg flex-shrink-0">
                        {content?.content_type === "MEDITATION" ? "🧘" : content?.content_type === "BREATHWORK" ? "🌬️" : content?.content_type === "WORKOUT" ? "💪" : "✨"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{content?.title || s.content_key || "Session"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {durationMin > 0 && <span className="text-xs text-gray-400">{durationMin} min</span>}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.completion_method === "MANUAL" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                            {s.completion_method === "MANUAL" ? "Manual" : "Auto"} ✓
                          </span>
                        </div>
                      </div>
                      <button onClick={async () => { await base44.entities.ContentHistory.update(s.id, { is_deleted: true }); setSessionHistory((prev) => prev.filter((x) => x.id !== s.id)); }}
                        className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  );
                }) : (
                  <div className="card-glass rounded-2xl p-6 text-center text-gray-400">
                    <Play className="w-8 h-8 mx-auto mb-2 text-rose-200" />
                    <p className="text-sm">No sessions logged for this day.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
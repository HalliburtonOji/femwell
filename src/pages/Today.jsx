import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TodayRecommendations } from '@/api/entities';
import { createPageUrl } from "@/utils";
import {
  Sun, ChevronRight, Plus, Sparkles, Droplets, Activity, Heart,
  Pill, Play, Trash2, Utensils, Loader2, Bell, Flame,
  BookOpen, Compass, Droplet, Zap, CheckCircle2, Feather, Map
} from "lucide-react";
import ManualCompleteButton from "../components/sessions/ManualCompleteButton";
import MonthlyCalendarCard from "../components/planner/MonthlyCalendarCard";
import DayDetailSheet from "../components/planner/DayDetailSheet";
import DailyInsightBanner from "../components/today/DailyInsightBanner";
import HabitCard from "../components/habits/HabitCard";
import StreakMilestoneToast from "../components/habits/StreakMilestoneToast";
import CheckinModal from "../components/today/CheckinModal";
import WeeklyInsightCard from "../components/today/WeeklyInsightCard";
import TrackCalendar from "../components/today/TrackCalendar";
import MedReminderSection from "../components/today/MedReminderSection";
import TodayHeroSection from "../components/today/TodayHeroSection";
import { format, differenceInDays, parseISO } from "date-fns";

// ── Cycle phase helper ──────────────────────────────────────────────────────
const PHASE_INFO = {
  menstrual:  { label: "Menstrual Phase",  color: "var(--rose-dust)",  tip: "Rest and restore. Your body is working hard." },
  follicular: { label: "Follicular Phase", color: "var(--sage)",       tip: "Energy rising — great time to start new things." },
  ovulatory:  { label: "Ovulatory Phase",  color: "#C4954A",           tip: "Peak energy and confidence. Shine today!" },
  luteal:     { label: "Luteal Phase",     color: "var(--mauve)",      tip: "Wind down, reflect, and nourish yourself." },
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

function isReminderDue(reminderTime) {
  if (!reminderTime) return false;
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return current >= reminderTime;
}

// ── Track constants ─────────────────────────────────────────────────────────
const TRACK_TABS = ["Planner", "Cycle", "Symptoms", "Habits", "Meds", "Sessions"];

const FLOW_OPTIONS = [
  { value: "light",  label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy",  label: "Heavy" },
];

const PERIOD_TYPES = [
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

// ── Shared card style ───────────────────────────────────────────────────────
const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};
const label = {
  fontSize: "0.65rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

const fallbackTodayRecommendations = [
  {
    id: "fallback-breathwork",
    type: "BREATHWORK",
    title: "3-Minute Breathing Space",
    reason: "A short, effective breathwork session to reset your nervous system.",
    action_route: "/ContentPlayer?id=69ac3d2217940aebdf578c19",
  },
  {
    id: "fallback-programme",
    type: "PROGRAMME",
    title: "PMS Relief Path",
    reason: "A gentle, structured programme to support you through hormonal shifts.",
    action_route: "/ProgramDetail?key=prog_pms_relief_path",
  },
  {
    id: "fallback-lifestyle",
    type: "LIFESTYLE",
    title: "Written for you",
    reason: "Stories and insights tailored to your cycle.",
    action_route: "/Lifestyle?tab=femwell",
  },
  {
    id: "fallback-book",
    type: "BOOK",
    title: "This week's book",
    reason: "Curated wellness reading for your phase.",
    action_route: "/Lifestyle?tab=books",
  },
];

const recommendationTypeStyles = {
  BREATHWORK: { backgroundColor: "#EEE6FF", color: "#9B7FCC", abbr: "BR" },
  MEDITATION: { backgroundColor: "#FFE6F2", color: "#C96B9E", abbr: "MD" },
  PROGRAMME: { backgroundColor: "#E6FFF8", color: "#4ABFA3", abbr: "PG" },
  NUTRITION: { backgroundColor: "#FFF8E6", color: "#E8B84B", abbr: "NT" },
  BOOK:      { backgroundColor: "#FFF0E8", color: "#C4804A", abbr: "BK" },
  LIFESTYLE: { backgroundColor: "#F5ECF0", color: "#C4849A", abbr: "LF" },
  EVENT:     { backgroundColor: "#E8F0FF", color: "#6B8AC4", abbr: "EV" },
  default: { backgroundColor: "#F0F0F8", color: "#8888A8", abbr: "RC" },
};

function getRecommendationTypeMeta(type) {
  return recommendationTypeStyles[type] || recommendationTypeStyles.default;
}


function RecommendationSkeletonCard() {
  return (
    <div
      style={{
        minWidth: "220px",
        maxWidth: "220px",
        height: "110px",
        flexShrink: 0,
        borderRadius: "16px",
        backgroundColor: "var(--ivory-dark)",
        border: "1px solid var(--border)",
      }}
    />
  );
}

function TodayRecommendationCard({ item, onTap }) {
  const typeMeta = getRecommendationTypeMeta(item.type);
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onTap(item); }}
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20, padding: 16,
        minWidth: 220, maxWidth: 220, flexShrink: 0,
        scrollSnapAlign: "start",
        display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-sm)", textDecoration: "none", cursor: "pointer",
      }}
    >
      <div
        style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                 backgroundColor: typeMeta.backgroundColor, color: typeMeta.color, flexShrink: 0 }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1, fontFamily: "'Inter', sans-serif" }}>{typeMeta.abbr}</span>
      </div>
      <p style={{ color: "var(--plum)", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  marginTop: 10 }}>
        {item.title}
      </p>
      <p style={{ color: "var(--mauve)", fontSize: 12, lineHeight: 1.4, fontFamily: "'Inter', sans-serif",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  marginTop: 4, flex: 1 }}>
        {item.reason}
      </p>
      <p style={{ color: "var(--rose-dust)", fontSize: 11, fontWeight: 600, fontFamily: "'Inter', sans-serif", marginTop: 10 }}>
        View
      </p>
    </a>
  );
}

function RecommendedForYouTodaySection({ loading, items, onTap }) {
  return (
    <div className="mt-6 mb-4">
      <style>{`.recommended-scroll::-webkit-scrollbar{display:none;}`}</style>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: "var(--plum)", fontSize: "16px", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
          For you today
        </p>
        <a href={createPageUrl("Lifestyle")} style={{ color: "var(--rose-dust)", fontSize: "12px", fontFamily: "'Inter', sans-serif", fontWeight: 600, textDecoration: "none" }}>
          See all
        </a>
      </div>

      <div
        className="recommended-scroll flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}
      >
        {loading
          ? [0, 1, 2].map((index) => <RecommendationSkeletonCard key={index} />)
          : items.map((item) => <TodayRecommendationCard key={item.id} item={item} onTap={onTap} />)}
      </div>
    </div>
  );
}

function DailyStoriesRow({ todayCheckin, todayCompletions }) {
  const stories = [
    { id: "cycle", label: "Cycle", gradient: "linear-gradient(135deg, #FFE4F0, #F5C6D8)", route: createPageUrl("CycleSettings"), ring: !todayCheckin?.period_flow },
    { id: "journal", label: "Journal", gradient: "linear-gradient(135deg, #E8F4FF, #C8DEFF)", route: createPageUrl("Journal"), ring: false },
    { id: "breathe", label: "Breathe", gradient: "linear-gradient(135deg, #E6FFF6, #B8F0DC)", route: createPageUrl("Explore") + "?type=Audio", ring: !(todayCompletions?.length > 0) },
    { id: "nutrition", label: "Nutrition", gradient: "linear-gradient(135deg, #FFFBE6, #FFE8A0)", route: createPageUrl("Nutrition"), ring: false },
    { id: "explore", label: "Explore", gradient: "linear-gradient(135deg, #F0EEFF, #D8CCFF)", route: createPageUrl("Explore"), ring: false },
    { id: "skin", label: "Skin & Hair", gradient: "linear-gradient(135deg, #F5ECF0, #E8C4D0)", route: createPageUrl("SkinHair"), ring: false },
  ];

  return (
    <div className="mx-[-16px] mt-3 mb-4">
      <style>{`.daily-stories-scroll::-webkit-scrollbar{display:none;}.daily-story-circle:active{transform:scale(0.92);}`}</style>
      <div className="daily-stories-scroll flex gap-4 overflow-x-auto px-4" style={{ scrollbarWidth: "none" }}>
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => { window.location.href = story.route; }}
            className="flex flex-col items-center text-center flex-shrink-0"
          >
            <div
              className="daily-story-circle flex items-center justify-center rounded-full transition-transform"
              style={{
                width: 58, height: 58,
                background: story.gradient,
                border: story.ring ? "2px solid var(--rose-dust)" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: 700, color: "rgba(42,32,53,0.7)", fontFamily: "'Inter', sans-serif" }}>
                {story.label.charAt(0).toUpperCase()}
              </span>
            </div>
            <span
              className="mt-1.5 max-w-[64px] truncate"
              style={{ fontSize: "11px", fontWeight: 500, color: "var(--plum)", fontFamily: "'Inter', sans-serif", textAlign: "center" }}
            >
              {story.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function Today() {
  const [mainTab, setMainTab] = useState("today");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [todayCheckin, setTodayCheckin] = useState(null);
  const [homeRecommendations, setHomeRecommendations] = useState([]);
  const [loadingHomeRecommendations, setLoadingHomeRecommendations] = useState(true);
  const [showCheckin, setShowCheckin] = useState(false);
  const [todayCompletions, setTodayCompletions] = useState([]);

  const [calendarSelectedDay, setCalendarSelectedDay] = useState(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [activePrograms, setActivePrograms] = useState([]);
  const [programLibrary, setProgramLibrary] = useState([]);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, checkins, recs, completions, userPrograms, allPrograms] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }),
        base44.entities.DailyCheckins.filter({ user_id: u.id, date: todayStr }),
        base44.entities.TodayRecommendations.filter({ user_id: u.id, date: todayStr }),
        base44.entities.ContentHistory.filter({ user_id: u.id, session_date: todayStr }),
        base44.entities.UserPrograms.filter({ user_id: u.id }),
        base44.entities.Programs.list("-created_date", 50),
      ]);
      if (profiles[0]) setProfile(profiles[0]);
      if (checkins[0]) setTodayCheckin(checkins[0]);
      setTodayCompletions(completions.filter((c) => !c.is_deleted));
      setActivePrograms(userPrograms.filter((e) => e.is_saved || e.status === "active"));
      setProgramLibrary(allPrograms);

      try {
        const lifestyleItems = await base44.entities.LifestyleItems.list("-pub_date", 20);
        const latestRead = lifestyleItems
          .filter((item) => item.status === "PUBLISHED" || item.status === "NEEDS_REVIEW")
          .sort((a, b) => new Date(b.pub_date || 0) - new Date(a.pub_date || 0))[0];
        const todayItems = recs.slice(0, 3);
        const fallbackItems = latestRead
          ? [{
              id: latestRead.id,
              type: "READ",
              title: latestRead.title,
              reason: latestRead.summary || "Open the latest read.",
              action_route: `/LifestyleDetail?id=${latestRead.id}`,
              source_name: latestRead.source_name,
            }, {
              ...fallbackTodayRecommendations[0],
            }, {
              ...fallbackTodayRecommendations[1],
              action_route: "/ProgramsHub?program_key=prog_pms_relief_path",
            }].slice(0, 3)
          : [{
              ...fallbackTodayRecommendations[0],
            }, {
              ...fallbackTodayRecommendations[1],
              action_route: "/ProgramsHub?program_key=prog_pms_relief_path",
            }];
        setHomeRecommendations(todayItems.length > 0 ? todayItems.slice(0, 3) : fallbackItems);
      } catch {
        setHomeRecommendations(fallbackTodayRecommendations);
      }
      setLoadingHomeRecommendations(false);

      const all = await base44.entities.HabitLogs.filter({ user_id: u.id });
      setAllHabitLogs(all);

      // Load personal tasks
      const tasks = await base44.entities.PersonalTasks.filter({ user_id: u.id }, "-date", 200);
      const taskMap = {};
      tasks.forEach(t => {
        if (!taskMap[t.date]) taskMap[t.date] = [];
        taskMap[t.date].push(t);
      });
      setPersonalTasks(taskMap);

      await loadTrackData(u.id, todayStr);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("open_log") === "1") {
      setShowCheckin(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
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
      const items = await base44.entities.ContentItems.list("-created_date", 100);
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
    let savedCheckin;
    if (todayCheckin) {
      await base44.entities.DailyCheckins.update(todayCheckin.id, payload);
      savedCheckin = { ...todayCheckin, ...payload };
      setTodayCheckin(savedCheckin);
    } else {
      savedCheckin = await base44.entities.DailyCheckins.create(payload);
      setTodayCheckin(savedCheckin);
    }

    if (profile?.last_period_start_date && (data.skin_condition || data.hair_shedding || data.scalp_condition || (data.breakout_location || []).length > 0)) {
      const today = new Date();
      const lastPeriod = new Date(profile.last_period_start_date);
      const daysSince = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
      const cycleDay = (daysSince % profile.cycle_avg_length) + 1;
      const periodLength = profile.period_length || 5;
      const phase = cycleDay <= periodLength ? 'menstrual'
        : cycleDay <= 13 ? 'follicular'
        : cycleDay <= 17 ? 'ovulatory'
        : 'luteal';

      const hasBreakout = data.skin_condition === 'Mild breakout' || data.skin_condition === 'Moderate breakout';
      const hasDry = data.skin_condition === 'Very dry';
      const skinTipMap = {
        'menstrual_breakout': 'Hormonal drops trigger inflammation — keep your routine minimal and gentle. Avoid harsh exfoliants this week.',
        'menstrual_dry': 'Low oestrogen reduces skin moisture. Layer a hydrating serum before your moisturiser.',
        'follicular_oily': 'Rising oestrogen can increase oil production. A light gel cleanser twice daily helps.',
        'ovulatory_breakout': 'The testosterone spike around ovulation drives chin and jaw breakouts. Salicylic acid spot treatment works well here.',
        'luteal_breakout': 'Progesterone increases sebum — hormonal breakouts peak in the luteal phase. Double-cleanse in the evenings.',
        'luteal_dry': 'Progesterone can cause dehydration. Drink more water and use a heavier moisturiser at night.',
        'default': 'Tracking your skin across your cycle reveals hormonal patterns. Keep logging to build your personal picture.',
      };

      const key = hasBreakout ? `${phase}_breakout` : hasDry ? `${phase}_dry` : data.skin_condition === 'Very oily' && phase === 'follicular' ? 'follicular_oily' : 'default';
      await base44.entities.InsightCards.create({
        user_id: user.id,
        source: 'skin_tracker',
        cycle_phase: phase,
        insight_date: todayStr,
        title: `Your skin this ${phase} phase`,
        insight_text: skinTipMap[key] || skinTipMap.default,
        recommended_action_route: null,
      });
    }
  };

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

  const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

  const quickLogMeal = async () => {
    if (!quickMealText.trim()) return;
    setQuickLogging(true);
    const log = await base44.entities.MealLog.create({
      user_id: user.id, day_key: todayStr,
      logged_at: new Date().toISOString(),
      meal_type: quickMealType, method: "text",
      raw_text: quickMealText.trim(), portion_size: "medium",
    });
    setQuickMealText("");
    base44.functions.invoke("analyzeMeal", { raw_text: log.raw_text, wellness_goal: "general wellness" })
      .then(res => { if (res?.data) base44.entities.MealLog.update(log.id, { ai_analysis: JSON.stringify(res.data) }).catch(() => {}); })
      .catch(() => {});
    setQuickLogging(false);
  };

  const cycleInfo = profile?.last_period_start_date
    ? getCyclePhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5)
    : null;
  const allHabitNames = [...new Set(allHabitLogs.map((l) => l.habit_type || l.habit_name).filter(Boolean))];
  const isToday = selectedDate === todayStr;
  const displayDate = isToday ? "Today" : format(parseISO(selectedDate), "EEE, MMM d");
  const hasSkinLog = !!(todayCheckin?.skin_condition || todayCheckin?.hair_shedding);

  const activeProgramEntry = [...activePrograms].sort((a, b) => {
    if ((b.last_activity_date || "") !== (a.last_activity_date || "")) {
      return (b.last_activity_date || "").localeCompare(a.last_activity_date || "");
    }
    return (b.current_day || 1) - (a.current_day || 1);
  })[0];
  const activeProgram = activeProgramEntry ? programLibrary.find((p) => p.id === activeProgramEntry.program_id) : null;
  const showProgramReminder = activeProgramEntry?.reminder_time && isReminderDue(activeProgramEntry.reminder_time);

  const handleRecommendationTap = (item) => {
    try {
      if (!item?.action_route && item?.type === "READ" && item?.id) {
        window.location.href = createPageUrl("Lifestyle");
        return;
      }
      if (!item?.action_route) return;
      if (item.action_route.includes('ProgramsHub') && item.action_route.includes('program_key=')) {
        const programKey = item.action_route.split('program_key=')[1];
        window.location.href = createPageUrl(`ProgramsHub?program_key=${programKey}`);
        return;
      }
      if (item.action_route.includes('ProgramDetail') && item.action_route.includes('key=')) {
        const programKey = item.action_route.split('key=')[1];
        window.location.href = createPageUrl(`ProgramsHub?program_key=${programKey}`);
        return;
      }
      if (item.action_route.startsWith('/ContentPlayer?id=')) {
        const id = item.action_route.split('/ContentPlayer?id=')[1];
        window.location.href = createPageUrl(`ContentPlayer?id=${id}`);
        return;
      }
      if (item.type === "READ" || item.action_route.startsWith('/LifestyleDetail?id=')) {
        window.location.href = createPageUrl("Lifestyle");
        return;
      }
      window.location.href = item.action_route.startsWith('/') ? item.action_route : createPageUrl(item.action_route);
    } catch {
      // do nothing
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      {showCheckin && (
        <CheckinModal existing={todayCheckin} onClose={() => setShowCheckin(false)} onSave={handleSaveCheckin} />
      )}

      <div className="max-w-3xl mx-auto px-4">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div className="pt-8">
          <TodayHeroSection
            user={user}
            cycleInfo={cycleInfo}
            todayCheckin={todayCheckin}
            onOpenCheckin={() => setShowCheckin(true)}
            onOpenCalendar={() => setMainTab("track")}
          />
        </div>

        <DailyStoriesRow todayCheckin={todayCheckin} todayCompletions={todayCompletions} />

        {/* ── TAB SWITCHER ─────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl" style={{ ...card }}>
          {["today", "track"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize"
              style={{
                backgroundColor: mainTab === tab ? "var(--plum)" : "transparent",
                color: mainTab === tab ? "white" : "var(--mauve)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {tab === "today" ? "My Day" : "My Track"}
            </button>
          ))}
        </div>

        {/* ── MY DAY ───────────────────────────────────────────────────────── */}
        {mainTab === "today" && (
          <>
            {user && <DailyInsightBanner user={user} />}
            {user && <WeeklyInsightCard user={user} />}

            {/* Program momentum */}
            {activeProgram && (
              <div className="rounded-[24px] p-5 mb-4" style={card}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="mb-1" style={label}>Active Program</p>
                    <h3 className="text-lg font-semibold leading-tight" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{activeProgram.title}</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Day {activeProgramEntry.current_day || 1} · pick up where you left off</p>
                  </div>
                  {activeProgramEntry.streak_count > 0 && (
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold flex-shrink-0" style={{ backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)" }}>
                      <Flame className="w-3 h-3" />{activeProgramEntry.streak_count} day streak
                    </div>
                  )}
                </div>
                {showProgramReminder && (
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium mb-4" style={{ backgroundColor: "#FFF8EE", color: "#A07830" }}>
                    <Bell className="w-3 h-3" /> Day {activeProgramEntry.current_day || 1} is ready
                  </div>
                )}
                <div className="flex gap-2.5">
                  <a href={createPageUrl(`ProgramDay?key=${activeProgram.program_key}&day=${activeProgramEntry.current_day || 1}`)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center"
                    style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif" }}>
                    Continue Program
                  </a>
                  <a href={createPageUrl(`ProgramDetail?key=${activeProgram.program_key}`)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center"
                    style={{ border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                    Day List
                  </a>
                </div>
              </div>
            )}


            <RecommendedForYouTodaySection
              loading={loadingHomeRecommendations}
              items={homeRecommendations}
              onTap={handleRecommendationTap}
            />


            {/* Quick meal log */}
            <div className="rounded-[24px] p-5 mb-4" style={card}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p style={label}>Quick Meal Log</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>What did you eat?</p>
                </div>
                <a href={createPageUrl("Nutrition")} className="text-xs font-medium" style={{ color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>Full tracker</a>
              </div>
              <textarea
                value={quickMealText}
                onChange={(e) => setQuickMealText(e.target.value)}
                placeholder="e.g. oats with banana and almond milk…"
                rows={2}
                className="w-full p-3.5 rounded-2xl text-sm resize-none focus:outline-none transition-all"
                style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              <div className="flex gap-1.5 mt-3 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {MEAL_TYPES.map((t) => (
                  <button key={t} onClick={() => setQuickMealType(t)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all"
                    style={{
                      backgroundColor: quickMealType === t ? "var(--plum)" : "var(--ivory)",
                      color: quickMealType === t ? "white" : "var(--mauve)",
                      border: `1px solid ${quickMealType === t ? "var(--plum)" : "var(--border)"}`,
                      fontFamily: "'Inter', sans-serif",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={quickLogMeal} disabled={!quickMealText.trim() || quickLogging}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif", opacity: (!quickMealText.trim() || quickLogging) ? 0.5 : 1 }}>
                {quickLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {quickLogging ? "Logging…" : "Log Meal"}
              </button>
            </div>

            {/* Nutrition shortcut */}
            <a href={createPageUrl("Nutrition")} className="flex items-center gap-3.5 rounded-[20px] p-4 mb-4 transition-all block" style={card}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }}>
                <Utensils className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Nutrition</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Log meals · Water · Weekly plan</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
            </a>

            {todayCheckin && !hasSkinLog && (
              <button
                onClick={() => setShowCheckin(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  width: "100%", textAlign: "left", cursor: "pointer",
                  backgroundColor: "var(--rose-dust-subtle)",
                  border: "1px solid var(--rose-dust-light)",
                  borderRadius: "20px", padding: "14px 16px",
                  marginBottom: "16px",
                }}
              >
                <div style={{
                  width: "36px", height: "36px", borderRadius: "12px",
                  backgroundColor: "var(--rose-dust)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}>
                  <Feather style={{ width: "16px", height: "16px", color: "white" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: "13px", fontWeight: 600, color: "var(--plum)",
                    fontFamily: "'Inter', sans-serif", marginBottom: "2px",
                  }}>
                    How's your skin today?
                  </p>
                  <p style={{
                    fontSize: "12px", color: "var(--rose-dust)",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    Tap to add skin & hair to today's check-in
                  </p>
                </div>
                <ChevronRight style={{
                  width: "16px", height: "16px",
                  color: "var(--rose-dust)", flexShrink: 0,
                }} />
              </button>
            )}

            {/* Quick actions */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{
                fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.1em", color: "var(--mauve)",
                fontFamily: "'Inter', sans-serif", marginBottom: "12px"
              }}>Quick access</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { lab: "Cycle",     Icon: Droplets, action: () => { setMainTab("track"); setTrackTab("Cycle"); }, bg: "var(--rose-dust-subtle)", fg: "var(--rose-dust)" },
                  { lab: "Journal",   Icon: BookOpen,  href: createPageUrl("Journal"),     bg: "#E8F4FF",               fg: "#5B9BD5" },
                  { lab: "Nutrition", Icon: Utensils,  href: createPageUrl("Nutrition"),   bg: "var(--sage-subtle)",    fg: "var(--sage)" },
                  { lab: "Programs",  Icon: Map,       href: createPageUrl("ProgramsHub"), bg: "var(--ivory-dark)",     fg: "var(--mauve)" },
                  { lab: "Explore",   Icon: Compass,   href: createPageUrl("Explore"),     bg: "var(--ivory-dark)",     fg: "var(--mauve)" },
                  { lab: "Pulse",     Icon: Activity,  href: createPageUrl("Pulse"),       bg: "var(--rose-dust-subtle)", fg: "var(--rose-dust)" },
                ].map((a) => {
                  const inner = (
                    <>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "12px",
                        backgroundColor: a.bg, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        margin: "0 auto 8px"
                      }}>
                        <a.Icon className="w-4 h-4" style={{ color: a.fg }} strokeWidth={1.5} />
                      </div>
                      <p style={{
                        fontSize: "11px", fontWeight: 600, color: "var(--plum)",
                        fontFamily: "'Inter', sans-serif", textAlign: "center"
                      }}>{a.lab}</p>
                    </>
                  );
                  return a.href ? (
                    <a key={a.lab} href={a.href}
                       className="flex flex-col items-center rounded-[20px] p-4 text-center block"
                       style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)",
                                boxShadow: "var(--shadow-sm)", textDecoration: "none" }}>
                      {inner}
                    </a>
                  ) : (
                    <button key={a.lab} onClick={a.action}
                            className="flex flex-col items-center rounded-[20px] p-4 text-center w-full"
                            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)",
                                     boxShadow: "var(--shadow-sm)" }}>
                      {inner}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── MY TRACK ─────────────────────────────────────────────────────────── */}
        {mainTab === "track" && (
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>Tap any day to log or view</p>
            <MonthlyCalendarCard
              userId={user?.id}
              profile={profile}
              refreshKey={calendarRefreshKey}
              onDayPress={(day, dayDataFromCard) => {
                setCalendarSelectedDay({ day, dayData: dayDataFromCard });
              }}
            />
            {calendarSelectedDay && (
              <DayDetailSheet
                date={calendarSelectedDay.day}
                dayData={calendarSelectedDay.dayData}
                userId={user?.id}
                onClose={() => setCalendarSelectedDay(null)}
                onDataChanged={() => setCalendarRefreshKey(k => k + 1)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
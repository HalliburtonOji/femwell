import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { PageLoader } from "../components/common/LoadingSpinner";
import { createPageUrl } from "@/utils";
import { AlertCircle, ChevronRight, Utensils, Feather } from "lucide-react";
import PanicModeModal from "../components/today/PanicModeModal";
import DailyPromptCard from "../components/today/DailyPromptCard";
import SmartContextBanner from "../components/common/SmartContextBanner";
import DailyInsightBanner from "../components/today/DailyInsightBanner";
import CheckinModal from "../components/today/CheckinModal";
import WeeklyInsightCard from "../components/today/WeeklyInsightCard";
import TodayHeroSection from "../components/today/TodayHeroSection";
import DailyPlanCard from "../components/today/DailyPlanCard";
import DailyStoriesStrip from "../components/today/DailyStoriesStrip";
import TrackTab from "../components/today/TrackTab";
import TodayFertilityBanner from "../components/conditions/TodayFertilityBanner";
import DailyPhaseBrief from "../components/today/DailyPhaseBrief";
import RecommendedForYouSection from "../components/today/RecommendedForYouSection";
import QuickMealLog from "../components/today/QuickMealLog";
import ActiveProgramCard from "../components/today/ActiveProgramCard";
import QuickAccessGrid from "../components/today/QuickAccessGrid";
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
  { id: "fallback-breathwork", type: "BREATHWORK", title: "3-Minute Breathing Space", reason: "A short, effective breathwork session to reset your nervous system.", action_route: "/ContentPlayer?id=69ac3d2217940aebdf578c19" },
  { id: "fallback-programme",  type: "PROGRAMME",  title: "PMS Relief Path",           reason: "A gentle, structured programme to support you through hormonal shifts.", action_route: "/ProgramDetail?key=prog_pms_relief_path" },
  { id: "fallback-lifestyle",  type: "LIFESTYLE",  title: "Written for you",            reason: "Stories and insights tailored to your cycle.", action_route: "/Lifestyle?tab=femwell" },
  { id: "fallback-book",       type: "BOOK",        title: "This week's book",           reason: "Curated wellness reading for your phase.", action_route: "/Lifestyle?tab=books" },
];

function extractDisplayName(profile, user) {
  if (profile?.display_name) return profile.display_name;
  if (user?.email) {
    const prefix = user.email.split("@")[0];
    const words = prefix.split(/[0-9_.\-]+/).filter(Boolean);
    if (words[0]) return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  }
  return null;
}

const todayStr = new Date().toISOString().split("T")[0];

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

  const location = useLocation();
  const [calendarSelectedDay, setCalendarSelectedDay] = useState(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [activePrograms, setActivePrograms] = useState([]);
  const [programLibrary, setProgramLibrary] = useState([]);
  const [quickMealText, setQuickMealText] = useState("");
  const [quickMealType, setQuickMealType] = useState("lunch");
  const [quickLogging, setQuickLogging] = useState(false);
  const [panicOpen, setPanicOpen] = useState(false);

  useEffect(() => {
    (async () => {
      // ── Batch 1: Critical (max 3 parallel) ──────────────────────────────────
      let u;
      try { u = await base44.auth.me(); setUser(u); } catch { setLoading(false); return; }

      let profiles = [], checkins = [], completions = [];
      try {
        [profiles, checkins, completions] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id, date: todayStr }).catch(() => []),
          base44.entities.ContentHistory.filter({ user_id: u.id, session_date: todayStr, is_deleted: false }).catch(() => []),
        ]);
      } catch {}

      if (profiles[0]) setProfile(profiles[0]);
      if (checkins[0]) setTodayCheckin(checkins[0]);
      setTodayCompletions(completions.filter((c) => !c.is_deleted));
      setLoading(false);

      // ── Batch 2: Secondary (max 3 parallel, after batch 1) ──────────────────
      await new Promise(r => setTimeout(r, 400));
      let userPrograms = [], allPrograms = [];
      try {
        [userPrograms, allPrograms] = await Promise.all([
          base44.entities.UserPrograms.filter({ user_id: u.id }).catch(() => []),
          base44.entities.Programs.list("-created_date", 50).catch(() => []),
        ]);
      } catch {}
      setActivePrograms(userPrograms.filter((e) => e.is_saved || e.status === "active"));
      setProgramLibrary(allPrograms);

      // ── Lazy batch: Non-critical, loaded 1.5s after first render ────────────
      setTimeout(async () => {
        // Chunk 1: TodayRecommendations + LifestyleItems
        try {
          const [recs, lifestyleItems] = await Promise.all([
            base44.entities.TodayRecommendations.filter({ user_id: u.id, date: todayStr }).catch(() => []),
            base44.entities.LifestyleItems.list("-pub_date", 20).catch(() => []),
          ]);
          const latestRead = lifestyleItems
            .filter((item) => item.status === "PUBLISHED" || item.status === "NEEDS_REVIEW")
            .sort((a, b) => new Date(b.pub_date || 0) - new Date(a.pub_date || 0))[0];
          const todayItems = recs.slice(0, 3);
          const fallbackItems = latestRead
            ? [{
                id: latestRead.id, type: "READ", title: latestRead.title,
                reason: latestRead.summary || "Open the latest read.",
                action_route: `/LifestyleDetail?id=${latestRead.id}`,
                source_name: latestRead.source_name,
              }, { ...fallbackTodayRecommendations[0] }, {
                ...fallbackTodayRecommendations[1],
                action_route: "/ProgramsHub?program_key=prog_pms_relief_path",
              }].slice(0, 3)
            : [{ ...fallbackTodayRecommendations[0] }, {
                ...fallbackTodayRecommendations[1],
                action_route: "/ProgramsHub?program_key=prog_pms_relief_path",
              }];
          setHomeRecommendations(todayItems.length > 0 ? todayItems.slice(0, 3) : fallbackItems);
        } catch {
          setHomeRecommendations(fallbackTodayRecommendations);
        }
        setLoadingHomeRecommendations(false);
      }, 1500);
    })();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("open_log") === "1") {
      setShowCheckin(true);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location.search, location.pathname]);



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

    // Trigger fresh program recommendations after check-in
    base44.functions.invoke("generateProgramRecommendations", {}).catch(() => {});

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

  const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

  const quickLogMeal = async () => {
    if (!quickMealText.trim()) return;
    setQuickLogging(true);
    // Resolve current cycle phase for meal log context
    let cyclePhaseAtLog = null;
    if (profile?.last_period_start_date) {
      const cycleInfo = getCyclePhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5);
      cyclePhaseAtLog = cycleInfo?.phase || null;
    }
    const log = await base44.entities.MealLog.create({
      user_id: user.id, day_key: todayStr,
      logged_at: new Date().toISOString(),
      meal_type: quickMealType, method: "text",
      raw_text: quickMealText.trim(), portion_size: "medium",
      ...(cyclePhaseAtLog ? { cycle_phase_at_log: cyclePhaseAtLog } : {}),
    });
    setQuickMealText("");
    base44.functions.invoke("analyzeMeal", { raw_text: log.raw_text, wellness_goal: "general wellness", cycle_phase: cyclePhaseAtLog })
      .then(res => { if (res?.data) base44.entities.MealLog.update(log.id, { ai_analysis: JSON.stringify(res.data) }).catch(() => {}); })
      .catch(() => {});
    setQuickLogging(false);
  };

  const cycleInfo = profile?.last_period_start_date
    ? getCyclePhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5)
    : null;
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

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      {panicOpen && <PanicModeModal userId={user?.id} onClose={() => setPanicOpen(false)} />}
      {showCheckin && (
        <CheckinModal existing={todayCheckin} onClose={() => setShowCheckin(false)} onSave={handleSaveCheckin} userId={user?.id} dateStr={todayStr} />
      )}

      {/* ── STICKY TAB HEADER ──────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-4 pt-10 pb-3"
        style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: "var(--ivory-dark)" }}>
            {[["today", "Today"], ["track", "Track"]].map(([key, display]) => (
              <button
                key={key}
                onClick={() => setMainTab(key)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: mainTab === key ? "var(--plum)" : "transparent",
                  color: mainTab === key ? "white" : "var(--mauve)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {display}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        {mainTab === "today" && (
          <div className="pt-6">
            {profile?.life_stage === "ttc" ? (
              <TodayFertilityBanner user={user} profile={profile} />
            ) : (
              <TodayHeroSection
                user={user}
                profile={profile}
                cycleInfo={cycleInfo}
                todayCheckin={todayCheckin}
                onOpenCheckin={() => setShowCheckin(true)}
                onOpenCalendar={() => setMainTab("track")}
                extractDisplayName={extractDisplayName}
              />
            )}
            {profile && <DailyPhaseBrief profile={profile} />}
          </div>
        )}

        {mainTab === "today" && (
          <>
            {/* Panic mode pill */}
            <div className="flex items-center justify-end pt-2 pb-1">
              <button
                onClick={() => setPanicOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 9999, border: "1px solid var(--rose-dust-light)", backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Panic mode
              </button>
            </div>
            <DailyStoriesStrip user={user} />
          </>
        )}

        {mainTab === "track" && <div className="pt-6" />}

        {/* ── MY DAY ───────────────────────────────────────────────────────── */}
        {mainTab === "today" && (
          <>
            {profile && <SmartContextBanner profile={profile} todayCheckin={todayCheckin} currentPage="Today" />}
            {user && <DailyPromptCard user={user} />}
            {user && <DailyInsightBanner user={user} />}
            {user && <DailyPlanCard user={user} />}
            {user && <WeeklyInsightCard user={user} />}

            <ActiveProgramCard activeProgramEntry={activeProgramEntry} activeProgram={activeProgram} />


            <RecommendedForYouSection
              loading={loadingHomeRecommendations}
              items={homeRecommendations}
              onTap={handleRecommendationTap}
            />

            <QuickMealLog user={user} profile={profile} getCyclePhase={getCyclePhase} />

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

            <QuickAccessGrid onCycleClick={() => setMainTab("track")} />
          </>
        )}

        {/* ── TRACK TAB ─────────────────────────────────────────────────────────── */}
        {mainTab === "track" && (
          <TrackTab user={user} profile={profile} />
        )}
      </div>
    </div>
  );
}
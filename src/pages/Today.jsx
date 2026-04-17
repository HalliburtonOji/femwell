import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { PageLoader } from "../components/common/LoadingSpinner";
import { createPageUrl } from "@/utils";
import {
  AlertCircle, ChevronRight, Utensils, Feather, Brain, Salad, Zap,
  Droplets, UtensilsCrossed, BookOpen, Activity, Lightbulb, TrendingUp, X, Bookmark
} from "lucide-react";
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
import { differenceInDays, parseISO } from "date-fns";

// ── Cycle phase helper ──────────────────────────────────────────────────────
const PHASE_INFO = {
  menstrual:  { label: "Menstrual Phase",  color: "var(--rose-dust)",  tip: "Rest and restore. Your body is working hard." },
  follicular: { label: "Follicular Phase", color: "var(--sage)",       tip: "Energy rising — great time to start new things." },
  ovulatory:  { label: "Ovulatory Phase",  color: "#C4954A",           tip: "Peak energy and confidence. Shine today!" },
  luteal:     { label: "Luteal Phase",     color: "var(--mauve)",      tip: "Wind down, reflect, and nourish yourself." },
};

const PHASE_GRADIENTS = {
  menstrual:  "linear-gradient(135deg, #FFF0F0 0%, #FFE4E4 100%)",
  follicular: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
  ovulatory:  "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
  luteal:     "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
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

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const fallbackTodayRecommendations = [
  { id: "fallback-breathwork", type: "BREATHWORK", title: "3-Minute Breathing Space", reason: "A short, effective breathwork session to reset your nervous system.", action_route: "/ContentPlayer?id=69ac3d2217940aebdf578c19" },
  { id: "fallback-programme",  type: "PROGRAMME",  title: "PMS Relief Path",           reason: "A gentle, structured programme to support you through hormonal shifts.", action_route: "/ProgramDetail?key=prog_pms_relief_path" },
  { id: "fallback-lifestyle",  type: "LIFESTYLE",  title: "Written for you",            reason: "Stories and insights tailored to your cycle.", action_route: "/Lifestyle?tab=femwell" },
];

function extractDisplayName(profile, user) {
  if (profile?.display_name) return profile.display_name;
  if (user?.full_name) return user.full_name.split(" ")[0];
  if (user?.email) {
    const prefix = user.email.split("@")[0];
    const words = prefix.split(/[0-9_.\-]+/).filter(Boolean);
    if (words[0]) return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  }
  return null;
}

const MOOD_EMOJIS = ["😔", "😕", "😐", "🙂", "😄"];
const ENERGY_EMOJIS = ["🪫", "😴", "⚡", "🔥", "✨"];

const todayStr = new Date().toISOString().split("T")[0];

// ── Hydration ring ──────────────────────────────────────────────────────────
function HydrationRing({ glasses, target, onAdd, onRemove }) {
  const pct = Math.min(glasses / target, 1);
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 18px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <Droplets className="w-3.5 h-3.5" style={{ color: "#60B4FA" }} />
        <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Hydration</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="40" cy="40" r={r} fill="none" stroke="#60B4FA" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.4s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>{glasses}</span>
            <span style={{ fontSize: 9, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>/ {target}</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>{glasses >= target ? "Daily goal reached!" : `${target - glasses} more glasses to go`}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onRemove} disabled={glasses <= 0} style={{ flex: 1, height: 34, borderRadius: 9999, border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 18, cursor: "pointer", fontWeight: 700, opacity: glasses <= 0 ? 0.3 : 1 }}>−</button>
            <button onClick={onAdd} style={{ flex: 1, height: 34, borderRadius: 9999, border: "none", backgroundColor: "#60B4FA", color: "white", fontSize: 18, cursor: "pointer", fontWeight: 700 }}>+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Quick Actions row ─────────────────────────────────────────────────────────
function QuickActionsRow({ onAddWater }) {
  const actions = [
    { icon: UtensilsCrossed, label: "Log meal",    bg: "var(--sage-subtle)",       color: "var(--sage)",       href: createPageUrl("Nutrition") },
    { icon: Droplets,        label: "Add water",   bg: "#EFF8FF",                  color: "#60B4FA",            onClick: onAddWater },
    { icon: BookOpen,        label: "Journal",     bg: "var(--rose-dust-subtle)",  color: "var(--rose-dust)",  href: createPageUrl("Journal") },
    { icon: Activity,        label: "Symptom",     bg: "var(--mauve-subtle)",      color: "var(--mauve)",       href: createPageUrl("Today?open_log=1") },
  ];
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
      <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>Quick actions</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {actions.map(({ icon: Icon, label, bg, color, href, onClick }) => {
          const inner = (
            <>
              <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
            </>
          );
          const btnStyle = { display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "none" };
          return href
            ? <a key={label} href={href} style={btnStyle}>{inner}</a>
            : <button key={label} onClick={onClick} style={btnStyle}>{inner}</button>;
        })}
      </div>
    </div>
  );
}

// ── Today's Insight card ──────────────────────────────────────────────────────
function TodayInsightCard({ userId }) {
  const [insight, setInsight] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!userId) return;
    base44.entities.InsightCards.filter({ user_id: userId, is_read: false }, "-created_date", 1)
      .then(res => setInsight(res[0] || null))
      .catch(() => {});
  }, [userId]);

  const handleDismiss = async () => {
    setDismissed(true);
    if (insight?.id) {
      await base44.entities.InsightCards.update(insight.id, { is_read: true }).catch(() => {});
    }
  };

  if (!insight || dismissed) return null;

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Lightbulb className="w-3.5 h-3.5" style={{ color: "#D97706" }} />
          </div>
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#D97706", fontFamily: "'Inter', sans-serif" }}>Today's Insight</p>
        </div>
        <button onClick={handleDismiss} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--mauve)", flexShrink: 0 }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {insight.title && <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>{insight.title}</p>}
      <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>{insight.insight_text}</p>
    </div>
  );
}

// ── This Week card ────────────────────────────────────────────────────────────
function ThisWeekCard({ userId }) {
  const [weekly, setWeekly] = useState(null);

  useEffect(() => {
    if (!userId) return;
    base44.entities.WeeklyInsights.filter({ user_id: userId }, "-week_start", 1)
      .then(res => setWeekly(res[0] || null))
      .catch(() => {});
  }, [userId]);

  if (!weekly) return null;

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--sage)" }} />
        <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>This Week</p>
      </div>
      {weekly.insight_text && (
        <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 12 }}>{weekly.insight_text}</p>
      )}
      {(weekly.avg_mood || weekly.avg_energy) && (
        <div style={{ display: "flex", gap: 8 }}>
          {weekly.avg_mood != null && (
            <div style={{ flex: 1, backgroundColor: "var(--rose-dust-subtle)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>{Number(weekly.avg_mood).toFixed(1)}</p>
              <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>Avg mood</p>
            </div>
          )}
          {weekly.avg_energy != null && (
            <div style={{ flex: 1, backgroundColor: "var(--sage-subtle)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--sage)", fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>{Number(weekly.avg_energy).toFixed(1)}</p>
              <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>Avg energy</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Recommendation card icons ────────────────────────────────────────────────
const REC_ICONS = {
  session_recommendation: { icon: Zap,   bg: "var(--sage-subtle)",  color: "var(--sage)"  },
  nutrition_nudge:        { icon: Salad, bg: "#FEF3C7",             color: "#D97706"       },
  mental_tool:            { icon: Brain, bg: "var(--mauve-subtle)", color: "var(--mauve)"  },
};

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
  const [activePrograms, setActivePrograms] = useState([]);
  const [programLibrary, setProgramLibrary] = useState([]);
  const [panicOpen, setPanicOpen] = useState(false);

  // Hydration
  const [hydrationLog, setHydrationLog] = useState(null);
  const [glasses, setGlasses] = useState(0);

  // Quick mood/energy
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [checkinSaved, setCheckinSaved] = useState(false);

  // Daily plan recs
  const [dailyPlan, setDailyPlan] = useState(null);

  const location = useLocation();

  useEffect(() => {
    (async () => {
      let u;
      try {
        u = await base44.auth.me();
        setUser(u);
      } catch {
        setLoading(false);
        setLoadingHomeRecommendations(false);
        return;
      }

      try {
        const [profiles, checkins, completions, hydrationLogs, dailyPlans] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id, date: todayStr }).catch(() => []),
          base44.entities.ContentHistory.filter({ user_id: u.id, session_date: todayStr, is_deleted: false }).catch(() => []),
          base44.entities.HydrationLog.filter({ user_id: u.id, day_key: todayStr }).catch(() => []),
          base44.entities.DailyPlan.filter({ user_id: u.id, day_key: todayStr }).catch(() => []),
        ]);

        if (profiles[0]) setProfile(profiles[0]);
        const ci = checkins[0] || null;
        if (ci) {
          setTodayCheckin(ci);
          if (ci.mood) setMood(ci.mood - 1);
          if (ci.energy) setEnergy(ci.energy - 1);
        }
        setTodayCompletions(completions.filter(c => !c.is_deleted));
        const hl = hydrationLogs[0] || null;
        setHydrationLog(hl);
        setGlasses(hl?.glasses_count || 0);
        if (dailyPlans[0]) setDailyPlan(dailyPlans[0]);
      } finally {
        setLoading(false);
      }

      // Secondary: programs (non-blocking)
      Promise.all([
        base44.entities.UserPrograms.filter({ user_id: u.id }).catch(() => []),
        base44.entities.Programs.list("-created_date", 50).catch(() => []),
      ]).then(([userPrograms, allPrograms]) => {
        setActivePrograms(userPrograms.filter(e => e.is_saved || e.status === "active"));
        setProgramLibrary(allPrograms);
      }).catch(() => {});

      // Lazy: recommendations
      setTimeout(async () => {
        try {
          const recs = await base44.entities.TodayRecommendations.filter({ user_id: u.id, date: todayStr }).catch(() => []);
          setHomeRecommendations(recs.length > 0 ? recs.slice(0, 3) : fallbackTodayRecommendations);
        } catch {
          setHomeRecommendations(fallbackTodayRecommendations);
        } finally {
          setLoadingHomeRecommendations(false);
        }
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

  const saveMoodEnergy = async (newMood, newEnergy) => {
    if (!user) return;
    const payload = { user_id: user.id, date: todayStr, mood: (newMood ?? mood ?? 0) + 1, energy: (newEnergy ?? energy ?? 0) + 1 };
    if (todayCheckin) {
      await base44.entities.DailyCheckins.update(todayCheckin.id, payload);
      setTodayCheckin(prev => ({ ...prev, ...payload }));
    } else {
      const created = await base44.entities.DailyCheckins.create(payload);
      setTodayCheckin(created);
    }
    setCheckinSaved(true);
    setTimeout(() => setCheckinSaved(false), 2000);
  };

  const handleMoodSelect = (i) => {
    setMood(i);
    if (energy !== null) saveMoodEnergy(i, energy);
  };

  const handleEnergySelect = (i) => {
    setEnergy(i);
    if (mood !== null) saveMoodEnergy(mood, i);
  };

  const handleHydrationAdd = async () => {
    const next = glasses + 1;
    setGlasses(next);
    if (hydrationLog) {
      await base44.entities.HydrationLog.update(hydrationLog.id, { glasses_count: next, amount_ml: next * 250 });
      setHydrationLog(prev => ({ ...prev, glasses_count: next, amount_ml: next * 250 }));
    } else {
      const created = await base44.entities.HydrationLog.create({ user_id: user.id, day_key: todayStr, glasses_count: next, amount_ml: next * 250 });
      setHydrationLog(created);
    }
  };

  const handleHydrationRemove = async () => {
    if (glasses <= 0) return;
    const next = glasses - 1;
    setGlasses(next);
    if (hydrationLog) {
      await base44.entities.HydrationLog.update(hydrationLog.id, { glasses_count: next });
      setHydrationLog(prev => ({ ...prev, glasses_count: next }));
    }
  };

  const handleSaveCheckin = async (data) => {
    const payload = { user_id: user.id, date: todayStr, ...data, updated_at: new Date().toISOString() };
    if (todayCheckin) {
      await base44.entities.DailyCheckins.update(todayCheckin.id, payload);
      setTodayCheckin(prev => ({ ...prev, ...payload }));
    } else {
      const saved = await base44.entities.DailyCheckins.create(payload);
      setTodayCheckin(saved);
    }
    base44.functions.invoke("generateProgramRecommendations", {}).catch(() => {});
  };

  const handleRecommendationTap = (item) => {
    if (!item?.action_route) return;
    if (item.action_route.includes("ProgramsHub") || item.action_route.includes("ProgramDetail")) {
      const key = item.action_route.split("program_key=")[1] || item.action_route.split("key=")[1];
      if (key) { window.location.href = createPageUrl(`ProgramsHub?program_key=${key}`); return; }
    }
    if (item.action_route.startsWith("/ContentPlayer?id=")) {
      window.location.href = createPageUrl(`ContentPlayer?id=${item.action_route.split("?id=")[1]}`);
      return;
    }
    window.location.href = item.action_route.startsWith("/") ? item.action_route : createPageUrl(item.action_route);
  };

  const cycleInfo = profile?.last_period_start_date
    ? getCyclePhase(profile.last_period_start_date, profile.cycle_avg_length || 28, profile.period_length || 5)
    : null;

  const hasSkinLog = !!(todayCheckin?.skin_condition || todayCheckin?.hair_shedding);

  const activeProgramEntry = [...activePrograms].sort((a, b) => (b.last_activity_date || "").localeCompare(a.last_activity_date || ""))[0];
  const activeProgram = activeProgramEntry ? programLibrary.find(p => p.id === activeProgramEntry.program_id) : null;

  const hydrationTarget = profile?.hydration_target_ml ? Math.round(profile.hydration_target_ml / 250) : 8;

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      {panicOpen && <PanicModeModal userId={user?.id} onClose={() => setPanicOpen(false)} />}
      {showCheckin && (
        <CheckinModal existing={todayCheckin} onClose={() => setShowCheckin(false)} onSave={handleSaveCheckin} userId={user?.id} dateStr={todayStr} />
      )}

      {/* ── STICKY TAB HEADER */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-3" style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: "var(--ivory-dark)" }}>
            {[["today", "Today"], ["track", "Track"]].map(([key, display]) => (
              <button key={key} onClick={() => setMainTab(key)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: mainTab === key ? "var(--plum)" : "transparent", color: mainTab === key ? "white" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                {display}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">

        {/* ── TODAY TAB */}
        {mainTab === "today" && (
          <div className="pt-4 space-y-3">
            {/* Hero */}
            {profile?.life_stage === "ttc" ? (
              <TodayFertilityBanner user={user} profile={profile} />
            ) : (
              <TodayHeroSection user={user} profile={profile} cycleInfo={cycleInfo} todayCheckin={todayCheckin}
                onOpenCheckin={() => setShowCheckin(true)} onOpenCalendar={() => setMainTab("track")} extractDisplayName={extractDisplayName} />
            )}
            {profile && <DailyPhaseBrief profile={profile} />}

            {/* Phase banner — gradient circle indicator, no emoji */}
            {cycleInfo && (
              <div style={{ background: PHASE_GRADIENTS[cycleInfo.phase], border: "1px solid var(--border)", borderRadius: 16, padding: "13px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: 9999,
                    background: `radial-gradient(circle at 35% 35%, white 0%, ${PHASE_INFO[cycleInfo.phase].color} 100%)`,
                    boxShadow: `0 0 6px ${PHASE_INFO[cycleInfo.phase].color}55`,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: PHASE_INFO[cycleInfo.phase].color, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>
                    {PHASE_INFO[cycleInfo.phase].label} · Day {cycleInfo.day}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.55 }}>{PHASE_INFO[cycleInfo.phase].tip}</p>
              </div>
            )}

            {/* Panic pill */}
            <div className="flex items-center justify-end">
              <button onClick={() => setPanicOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 9999, border: "1px solid var(--rose-dust-light)", backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>
                <AlertCircle className="w-3.5 h-3.5" />Panic mode
              </button>
            </div>

            <DailyStoriesStrip user={user} />

            {/* Quick mood + energy check-in */}
            <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>How are you feeling?</p>
                {checkinSaved && <span style={{ fontSize: 11, color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>Saved</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 5 }}>Mood</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {MOOD_EMOJIS.map((e, i) => (
                    <button key={i} onClick={() => handleMoodSelect(i)}
                      style={{ flex: 1, height: 38, borderRadius: 10, border: `2px solid ${mood === i ? "var(--plum)" : "var(--border)"}`, backgroundColor: mood === i ? "var(--plum)" : "transparent", fontSize: 17, cursor: "pointer", transition: "all 0.15s" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 5 }}>Energy</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {ENERGY_EMOJIS.map((e, i) => (
                    <button key={i} onClick={() => handleEnergySelect(i)}
                      style={{ flex: 1, height: 38, borderRadius: 10, border: `2px solid ${energy === i ? "var(--plum)" : "var(--border)"}`, backgroundColor: energy === i ? "var(--plum)" : "transparent", fontSize: 17, cursor: "pointer", transition: "all 0.15s" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <QuickActionsRow onAddWater={handleHydrationAdd} />

            {/* Daily plan recommendation cards */}
            {dailyPlan && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {["session_recommendation", "nutrition_nudge", "mental_tool"].filter(k => dailyPlan[k]).map(key => {
                  const meta = REC_ICONS[key];
                  const Icon = meta.icon;
                  return (
                    <div key={key} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", boxShadow: "var(--shadow-sm)" }}
                      onClick={() => key === "session_recommendation" && dailyPlan.session_route && (window.location.href = dailyPlan.session_route)}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      </div>
                      <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>{dailyPlan[key]}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {profile && <SmartContextBanner profile={profile} todayCheckin={todayCheckin} currentPage="Today" />}
            {user && <DailyPromptCard user={user} />}
            {user && <DailyInsightBanner user={user} />}
            {user && <DailyPlanCard user={user} />}
            {user && <WeeklyInsightCard user={user} />}

            <ActiveProgramCard activeProgramEntry={activeProgramEntry} activeProgram={activeProgram} />

            <RecommendedForYouSection loading={loadingHomeRecommendations} items={homeRecommendations} onTap={handleRecommendationTap} />

            {/* Today's Insight */}
            <TodayInsightCard userId={user?.id} />

            {/* This Week */}
            <ThisWeekCard userId={user?.id} />

            {/* Hydration ring */}
            <HydrationRing glasses={glasses} target={hydrationTarget} onAdd={handleHydrationAdd} onRemove={handleHydrationRemove} />

            <QuickMealLog user={user} profile={profile} getCyclePhase={getCyclePhase} />

            {/* Nutrition shortcut */}
            <a href={createPageUrl("Nutrition")} className="flex items-center gap-3 rounded-[16px] p-3.5 transition-all block" style={card}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)" }}>
                <Utensils className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Nutrition</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Log meals · Water · Weekly plan</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "var(--border)" }} />
            </a>

            {todayCheckin && !hasSkinLog && (
              <button onClick={() => setShowCheckin(true)} style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", textAlign: "left", cursor: "pointer", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: "16px", padding: "12px 14px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "10px", backgroundColor: "var(--rose-dust)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Feather style={{ width: "15px", height: "15px", color: "white" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: "2px" }}>How's your skin today?</p>
                  <p style={{ fontSize: "12px", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>Add skin & hair to today's check-in</p>
                </div>
                <ChevronRight style={{ width: "15px", height: "15px", color: "var(--rose-dust)", flexShrink: 0 }} />
              </button>
            )}

            {/* Lifestyle nudge — no emoji */}
            <a href={createPageUrl("Lifestyle")} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: "16px", padding: "14px 16px" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", marginBottom: 3 }}>Lifestyle</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Stories, videos & reads for you</p>
                <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>Curated for your cycle phase today</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "var(--rose-dust)", flexShrink: 0 }} />
            </a>

            <QuickAccessGrid onCycleClick={() => setMainTab("track")} />
          </div>
        )}

        {/* ── TRACK TAB */}
        {mainTab === "track" && (
          <div className="pt-6">
            <TrackTab user={user} profile={profile} />
          </div>
        )}
      </div>
    </div>
  );
}
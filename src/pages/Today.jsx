import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { PageLoader } from "../components/common/LoadingSpinner";
import { createPageUrl } from "@/utils";
import { isCycleLifeStage, filterProgramsByStage } from "@/utils/plannerAdapter";
import { computeCycleDay } from "@/hooks/useCycleDay";
import NurtureGarden from "@/components/nurture/NurtureGarden";
import { BloomprintLine } from "@/components/nurture/BloomprintCard";
import {
  AlertCircle, ChevronRight, Feather, Brain, Salad, Zap,
  Droplets, UtensilsCrossed, BookOpen, Activity, Lightbulb, TrendingUp, X
} from "lucide-react";
import PanicModeModal from "../components/today/PanicModeModal";
import CalmCards from "../components/today/CalmCards";
import DailyPromptCard from "../components/today/DailyPromptCard";
import SmartContextBanner from "../components/common/SmartContextBanner";
import DailyInsightBanner from "../components/today/DailyInsightBanner";
import CheckinModal from "../components/today/CheckinModal";
import WeeklyInsightCard from "../components/today/WeeklyInsightCard";
import TodayHeroSection from "../components/today/TodayHeroSection";
import CompleteProfileBanner from "../components/today/CompleteProfileBanner";
import DailyPlanCard from "../components/today/DailyPlanCard";
import DailyStoriesStrip from "../components/today/DailyStoriesStrip";
import TodayDailyChapterCard from "@/components/today/TodayDailyChapterCard";
import OnThisDayLastCycleCard from "@/components/today/OnThisDayLastCycleCard";
import CommunityTodayCard from "@/components/today/CommunityTodayCard";
import JessNudge from "@/components/jess/JessNudge";
import FriendFrom6MonthsAgoCard from "@/components/today/FriendFrom6MonthsAgoCard";
import UnsealedLetterCard from "@/components/today/UnsealedLetterCard";
import TrackTab from "../components/today/TrackTab";
import TodayFertilityBanner from "../components/conditions/TodayFertilityBanner";
import DailyPhaseBrief from "../components/today/DailyPhaseBrief";
import RecommendedForYouSection from "../components/today/RecommendedForYouSection";
import QuickMealLog from "../components/today/QuickMealLog";
import NutritionTodayCard from "../components/today/NutritionTodayCard";
import ActiveProgramCard from "../components/today/ActiveProgramCard";
import QuickAccessGrid from "../components/today/QuickAccessGrid";

// ── Cycle phase helper ──────────────────────────────────────────────────────
const PHASE_INFO = {
  menstrual:  { label: "Menstrual Phase",  color: "var(--rose-dust)",  tip: "Rest and restore. Your body is working hard." },
  follicular: { label: "Follicular Phase", color: "var(--sage)",       tip: "Energy rising — great time to start new things." },
  ovulatory:  { label: "Ovulatory Phase",  color: "#C4954A",           tip: "Peak energy and confidence. Shine today!" },
  luteal:     { label: "Luteal Phase",     color: "var(--mauve)",      tip: "Wind down, reflect, and nourish yourself." },
};

const PHASE_GRADIENTS = {
  menstrual:  "var(--surface)",
  follicular: "var(--surface)",
  ovulatory:  "var(--surface)",
  luteal:     "var(--surface)",
};

function getCyclePhase(lastPeriodDate, cycleLength, periodLength) {
  // Single source of truth: delegate to computeCycleDay so Today, Journal,
  // the Planner and the Morning gate all agree on the phase boundary
  // (ovulatory ends at floor(cycleLen*0.5); day after = luteal). Previously
  // this used its own *0.4 / *0.55 thresholds and disagreed with the rest
  // of the app (e.g. day 15 read "ovulatory" here, "luteal" in the gate).
  if (!lastPeriodDate) return null;
  const { phase, cycleDay } = computeCycleDay({
    last_period_start_date: lastPeriodDate,
    cycle_avg_length: cycleLength,
    period_length: periodLength,
  });
  return { phase, day: cycleDay };
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

const MOOD_EMOJIS = ["1", "2", "3", "4", "5"];
const ENERGY_EMOJIS = ["1", "2", "3", "4", "5"];

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
        <Droplets className="w-3.5 h-3.5" style={{ color: "var(--sage)" }} />
        <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>Hydration</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="40" cy="40" r={r} fill="none" stroke="var(--sage)" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.4s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "var(--plum)", lineHeight: 1 }}>{glasses}</span>
            <span style={{ fontSize: 9, color: "var(--mauve)", }}>/ {target}</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "var(--mauve)", marginBottom: 10 }}>{glasses >= target ? "Daily goal reached!" : `${target - glasses} more glasses to go`}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onRemove} disabled={glasses <= 0} style={{ flex: 1, height: 34, borderRadius: 9999, border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 18, cursor: "pointer", fontWeight: 700, opacity: glasses <= 0 ? 0.3 : 1 }}>−</button>
            <button onClick={onAdd} style={{ flex: 1, height: 34, borderRadius: 9999, border: "none", backgroundColor: "var(--sage)", color: "white", fontSize: 18, cursor: "pointer", fontWeight: 700 }}>+</button>
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
    { icon: Droplets,        label: "Add water",   bg: "var(--surface)",           color: "var(--sage)",        onClick: onAddWater },
    { icon: BookOpen,        label: "Journal",     bg: "var(--rose-dust-subtle)",  color: "var(--rose-dust)",  href: createPageUrl("Journal") },
    { icon: Activity,        label: "Symptom",     bg: "var(--mauve-subtle)",      color: "var(--mauve)",       href: createPageUrl("Today?open_log=1") },
  ];
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
      <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", marginBottom: 12 }}>Quick actions</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {actions.map(({ icon: Icon, label, bg, color, href, onClick }) => {
          const inner = (
            <>
              <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--plum)", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
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
          <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Lightbulb className="w-3.5 h-3.5" style={{ color: "var(--gold)" }} />
          </div>
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--gold)", }}>Today's Insight</p>
        </div>
        <button onClick={handleDismiss} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--mauve)", flexShrink: 0 }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {insight.title && <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", marginBottom: 4 }}>{insight.title}</p>}
      <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.6 }}>{insight.insight_text}</p>
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
        <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--sage)", }}>This Week</p>
      </div>
      {weekly.insight_text && (
        <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.6, marginBottom: 12 }}>{weekly.insight_text}</p>
      )}
      {(weekly.avg_mood || weekly.avg_energy) && (
        <div style={{ display: "flex", gap: 8 }}>
          {weekly.avg_mood != null && (
            <div style={{ flex: 1, backgroundColor: "var(--rose-dust-subtle)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--rose-dust)", lineHeight: 1 }}>{Number(weekly.avg_mood).toFixed(1)}</p>
              <p style={{ fontSize: 10, color: "var(--mauve)", marginTop: 2 }}>Avg mood</p>
            </div>
          )}
          {weekly.avg_energy != null && (
            <div style={{ flex: 1, backgroundColor: "var(--sage-subtle)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--sage)", lineHeight: 1 }}>{Number(weekly.avg_energy).toFixed(1)}</p>
              <p style={{ fontSize: 10, color: "var(--mauve)", marginTop: 2 }}>Avg energy</p>
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
  nutrition_nudge:        { icon: Salad, bg: "var(--surface)",      color: "var(--gold)"   },
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
  const [calmCardsOpen, setCalmCardsOpen] = useState(false);

  // Hydration
  const [hydrationLog, setHydrationLog] = useState(null);
  const [glasses, setGlasses] = useState(0);

  // Quick mood/energy
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [checkinSaved, setCheckinSaved] = useState(false);
  const [checkinError, setCheckinError] = useState(false);

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
        // Sprint A fix 8: hydration is one-row-per-log-action. Total amount
        // is the SUM of amount_ml across today's rows; glasses display as
        // round(totalMl / 250). The legacy single-row + glasses_count
        // pattern is gone; rely solely on amount_ml.
        const totalMl = (hydrationLogs || []).reduce(
          (a, h) => a + (Number(h?.amount_ml) || 0), 0,
        );
        setHydrationLog({ totalMl, rows: hydrationLogs || [] });
        setGlasses(Math.round(totalMl / 250));
        if (dailyPlans[0]) setDailyPlan(dailyPlans[0]);
      } finally {
        setLoading(false);
      }

      // Capture life stage now so the lazy setTimeout closure below can
      // soft-filter PROGRAMME recommendations without re-fetching profile.
      const stageForRecs = (() => {
        // Profile state is set inside the previous try block; read from the
        // same `profiles[0]` via a fresh fetch (cheap, cached) so the
        // closure stays self-contained.
        return null;
      })();

      // Secondary: programs (non-blocking)
      Promise.all([
        base44.entities.UserPrograms.filter({ user_id: u.id }).catch(() => []),
        base44.entities.Programs.list("-created_date", 50).catch(() => []),
        base44.entities.UserProfile.filter({ user_id: u.id }, null, 1).catch(() => []),
      ]).then(([userPrograms, allPrograms, profiles2]) => {
        const stage2 = profiles2?.[0]?.life_stage || "reproductive";
        // Phase 2 QA fix #3 — stage-filter active programmes so we never
        // surface "Perimenopause Foundations" on TTC/postpartum, "PMS
        // Relief" on pregnancy, etc.
        const stageFilteredUserPrograms = filterProgramsByStage(
          userPrograms.filter(e => e.is_saved || e.status === "active"),
          stage2,
        );
        setActivePrograms(stageFilteredUserPrograms);
        setProgramLibrary(filterProgramsByStage(allPrograms, stage2));
      }).catch(() => {});

      // Lazy: recommendations
      // Phase 2 QA fix #9 — filter fallback programmes by life stage so a
      // pregnant user never sees "PMS Relief Path". One small UserProfile
      // fetch inside the closure keeps this self-contained.
      setTimeout(async () => {
        try {
          const [recs, profiles2] = await Promise.all([
            base44.entities.TodayRecommendations.filter({ user_id: u.id, date: todayStr }).catch(() => []),
            base44.entities.UserProfile.filter({ user_id: u.id }, null, 1).catch(() => []),
          ]);
          const stage = profiles2?.[0]?.life_stage || stageForRecs || "reproductive";
          const list = recs.length > 0 ? recs.slice(0, 3) : fallbackTodayRecommendations;
          // Soft filter: drop fallback PROGRAMME rows whose copy contradicts
          // the user's stage. Cast through filterProgramsByStage using the
          // title field for the pattern match.
          const filtered = filterProgramsByStage(
            list.map((r) => ({ ...r, title: r.title || r.program_name || "" })),
            stage,
          );
          setHomeRecommendations(filtered.length > 0 ? filtered : list.filter(r => r.type !== "PROGRAMME"));
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
    setCheckinError(false);
    try {
      if (todayCheckin) {
        await base44.entities.DailyCheckins.update(todayCheckin.id, payload);
        setTodayCheckin(prev => ({ ...prev, ...payload }));
      } else {
        const created = await base44.entities.DailyCheckins.create(payload);
        setTodayCheckin(created);
      }
      setCheckinSaved(true);
      setTimeout(() => setCheckinSaved(false), 2000);
    } catch {
      setCheckinError(true);
    }
  };

  const handleMoodSelect = (i) => {
    setMood(i);
    if (energy !== null) saveMoodEnergy(i, energy);
  };

  const handleEnergySelect = (i) => {
    setEnergy(i);
    if (mood !== null) saveMoodEnergy(mood, i);
  };

  // Sprint A fix 8: hydration is now one row per add. amount_ml = 250 per
  // glass. Display glasses = round(totalMl / 250). Remove deletes the most
  // recently created row so undo behaves naturally.
  const handleHydrationAdd = async () => {
    if (!user?.id) return;
    const nowISO = new Date().toISOString();
    const created = await base44.entities.HydrationLog.create({
      user_id: user.id,
      day_key: todayStr,
      amount_ml: 250,
      logged_at: nowISO,
      created_at: nowISO,
      updated_at: nowISO,
    });
    setHydrationLog((prev) => {
      const rows = [ ...(prev?.rows || []), created ];
      const totalMl = rows.reduce((a, r) => a + (Number(r?.amount_ml) || 0), 0);
      setGlasses(Math.round(totalMl / 250));
      return { totalMl, rows };
    });
  };

  const handleHydrationRemove = async () => {
    if (glasses <= 0) return;
    const rows = hydrationLog?.rows || [];
    if (rows.length === 0) return;
    // Remove the most recent row.
    const sorted = [...rows].sort((a, b) => {
      const ta = new Date(a?.logged_at || a?.created_at || 0).getTime();
      const tb = new Date(b?.logged_at || b?.created_at || 0).getTime();
      return ta - tb;
    });
    const last = sorted[sorted.length - 1];
    if (!last?.id) return;
    try {
      await base44.entities.HydrationLog.delete(last.id);
    } catch { /* silent — keep UI optimistic */ }
    setHydrationLog((prev) => {
      const nextRows = (prev?.rows || []).filter((r) => r.id !== last.id);
      const totalMl = nextRows.reduce((a, r) => a + (Number(r?.amount_ml) || 0), 0);
      setGlasses(Math.round(totalMl / 250));
      return { totalMl, rows: nextRows };
    });
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
      {calmCardsOpen && <CalmCards userId={user?.id} onClose={() => setCalmCardsOpen(false)} />}
      {showCheckin && (
        <CheckinModal existing={todayCheckin} onClose={() => setShowCheckin(false)} onSave={handleSaveCheckin} userId={user?.id} dateStr={todayStr} />
      )}

      {/* ── STICKY TAB HEADER */}
      <div className="sticky top-0 z-30" style={{ background: "#3A2C1A" }}>
        {/* Row 1 — espresso bar with title */}
        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#F4EDDB" }}>Today</div>
            <div style={{ fontSize: 10, color: "rgba(244,237,219,0.5)", letterSpacing: 0.5, marginTop: 1 }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["today", "Today"], ["track", "Track"]].map(([key, display]) => (
              <button key={key} onClick={() => setMainTab(key)}
                style={{
                  padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  border: "none", cursor: "pointer",
                  backgroundColor: mainTab === key ? "#D4AF37" : "rgba(244,237,219,0.12)",
                  color: mainTab === key ? "#3A2C1A" : "rgba(244,237,219,0.8)",
                }}>
                {display}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl lg:max-w-5xl mx-auto px-4">

        {/* ── TODAY TAB */}
        {mainTab === "today" && (
          <div className="pt-4 space-y-3">
            {/* Hero — Life Stage gate.
                Pregnant / postpartum / post-menopause / menopause / PCOS users
                must NOT see "Log your last period" / fertile window banner. */}
            {(() => {
              const lifeStage = profile?.life_stage || "none";
              if (lifeStage === "ttc") return <TodayFertilityBanner user={user} profile={profile} />;
              return <TodayHeroSection user={user} profile={profile} cycleInfo={cycleInfo} todayCheckin={todayCheckin}
                onOpenCheckin={() => setShowCheckin(true)} onOpenCalendar={() => setMainTab("track")} extractDisplayName={extractDisplayName} />;
            })()}
            {profile && (() => {
              // Suppress DailyPhaseBrief ("Log your last period date in Track…")
              // for any non-cycle-anchored stage. Same set as above.
              const cycleStages = new Set(["none", "reproductive", "pre-ttc", "ttc", "teen", "perimenopause"]);
              const lifeStage = profile?.life_stage || "none";
              const conditions = profile?.conditions || profile?.condition_flags || [];
              const showBrief = cycleStages.has(lifeStage) && !conditions.includes("pcos") && !conditions.includes("ha");
              return showBrief ? <DailyPhaseBrief profile={profile} /> : null;
            })()}

            <CompleteProfileBanner
              shouldShow={!!profile && (!profile.last_period_start_date || profile.onboarding_complete !== true)}
            />

            {/* Nurture Companion — the app's heartbeat, grown from engagement everywhere.
                An inviting, tappable presence on the daily home; the whole card opens its
                full view (/Garden) where she can be tended, named, reshaped and shared. */}
            <a href={createPageUrl("Garden")} style={{ display: "block", textDecoration: "none", background: "linear-gradient(180deg, var(--surface, #FBF6E6), var(--bg, #F4EDDB))", border: "1px solid var(--border, #E3DAC9)", borderRadius: 18, padding: "13px 14px 15px", boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted, #9B8B7A)" }}>Your garden</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 1, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, color: "var(--text-muted, #9B8B7A)" }}>Tend<ChevronRight size={13} /></span>
              </div>
              <div style={{ marginBottom: 4 }}><BloomprintLine /></div>
              <NurtureGarden compact />
            </a>

            {/* Phase banner — gradient circle indicator, no emoji.
                Phase 2 QA fix #1 — gated on cycle-anchored stage so
                pregnant / postpartum / menopausal users never see "Luteal
                · Day 18" framing. */}
            {cycleInfo && (() => {
              const lifeStage = profile?.life_stage || "none";
              const conditions = profile?.conditions || profile?.condition_flags || [];
              const cycleAnchored = isCycleLifeStage(lifeStage, conditions);
              if (!cycleAnchored) return null;
              return (
                <div style={{ background: PHASE_GRADIENTS[cycleInfo.phase], border: "1px solid var(--border)", borderRadius: 16, padding: "13px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 9999,
                      background: PHASE_INFO[cycleInfo.phase].color,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: PHASE_INFO[cycleInfo.phase].color, textTransform: "uppercase", letterSpacing: "0.1em", }}>
                      {PHASE_INFO[cycleInfo.phase].label} · Day {cycleInfo.day}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.55 }}>{PHASE_INFO[cycleInfo.phase].tip}</p>
                </div>
              );
            })()}

            {/* Calm Cards + Panic pills */}
            <div className="flex items-center justify-between gap-2">
              <button onClick={() => setCalmCardsOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--mauve)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Calm Cards
              </button>
              <button onClick={() => setPanicOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 9999, border: "1px solid var(--rose-dust-light)", backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <AlertCircle className="w-3.5 h-3.5" />Panic mode
              </button>
            </div>
            

            <DailyStoriesStrip user={user} />
            <TodayDailyChapterCard />
            <OnThisDayLastCycleCard />
            <CommunityTodayCard profile={profile} />
            <JessNudge
              id="today-journal-v1"
              line="However today landed, a line or two in your journal can hold it. Want to?"
              to="Journal?compose=1"
              actionLabel="Write a line"
            />


            {/* Quick mood + energy check-in */}
            <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", }}>How are you feeling?</p>
                {checkinSaved && <span style={{ fontSize: 11, color: "var(--sage)", }}>Saved</span>}
                {checkinError && <span style={{ fontSize: 11, color: "var(--rose-dust)", }}>Couldn't save — tap to retry</span>}
              </div>
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", marginBottom: 6 }}>Mood</p>
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
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", marginBottom: 6 }}>Energy</p>
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
                      <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.5 }}>{dailyPlan[key]}</p>
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
            <FriendFrom6MonthsAgoCard />
            <UnsealedLetterCard />

            <ActiveProgramCard activeProgramEntry={activeProgramEntry} activeProgram={activeProgram} />

            <RecommendedForYouSection loading={loadingHomeRecommendations} items={homeRecommendations} onTap={handleRecommendationTap} />

            {/* Today's Insight */}
            <TodayInsightCard userId={user?.id} />

            {/* This Week */}
            <ThisWeekCard userId={user?.id} />

            {/* Hydration ring */}
            <HydrationRing glasses={glasses} target={hydrationTarget} onAdd={handleHydrationAdd} onRemove={handleHydrationRemove} />

            <QuickMealLog user={user} profile={profile} getCyclePhase={getCyclePhase} />

            {/* Nutrition shortcut — now reflects today's real, floor-aware nutrition */}
            <NutritionTodayCard user={user} profile={profile} hydrationTargetMl={hydrationTarget} />

            {todayCheckin && !hasSkinLog && (
              <button onClick={() => setShowCheckin(true)} style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", textAlign: "left", cursor: "pointer", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: "16px", padding: "12px 14px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "10px", backgroundColor: "var(--rose-dust)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Feather style={{ width: "15px", height: "15px", color: "white" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--plum)", marginBottom: "2px" }}>How's your skin today?</p>
                  <p style={{ fontSize: "12px", color: "var(--rose-dust)", }}>Add skin & hair to today's check-in</p>
                </div>
                <ChevronRight style={{ width: "15px", height: "15px", color: "var(--rose-dust)", flexShrink: 0 }} />
              </button>
            )}

            {/* Lifestyle nudge — no emoji */}
            <a href={createPageUrl("Lifestyle")} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: "16px", padding: "14px 16px" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", marginBottom: 3 }}>Lifestyle</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", }}>Stories, videos & reads for you</p>
                <p style={{ fontSize: 12, color: "var(--mauve)", marginTop: 2 }}>Curated for your cycle phase today</p>
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
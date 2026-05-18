import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Calendar, Plus, Clock, Trash2, Check, ChevronLeft, ChevronRight, X, Sparkles, ListTodo, Repeat, Pill, Sparkle, BookHeart } from "lucide-react";
import PlannerTabs, { readInitialView, writeStoredView, resolveViewId } from "@/components/planner/PlannerTabs";
import ConfidencePill from "@/components/planner/ConfidencePill";
import CapacityTaxBar, { deriveCapacity, derivePredictedLoad } from "@/components/planner/cycle/CapacityTaxBar";
import ConsistencyCard from "@/components/planner/cycle/ConsistencyCard";
import { habitNameOf, habitCompletedOf } from "@/components/planner/cycle/habitLogNormalise";
import CycleMirrorSundayTile from "@/components/planner/cycle/CycleMirrorSundayTile";
import DoctorReadyDiaryCard from "@/components/planner/cycle/DoctorReadyDiaryCard";
import MonthRibbon from "@/components/planner/cycle/MonthRibbon";
import SymptomRibbon from "@/components/planner/SymptomRibbon";
import HrtLogCard from "@/components/planner/cycle/HrtLogCard";
import ContraceptionCard from "@/components/planner/cycle/ContraceptionCard";
import { FolicAcidNudge, AmhAwarenessCard, SupplementStackCard } from "@/components/planner/cycle/PreTtcCards";
import SupplementTrackerCard from "@/components/planner/cycle/SupplementTrackerCard";
import KickCounterCard from "@/components/planner/today/KickCounterCard";
import EpdsScreenCard from "@/components/planner/today/EpdsScreenCard";
import HrtCorrelationCard from "@/components/planner/today/HrtCorrelationCard";
import FertileWindowCard from "@/components/planner/cycle/FertileWindowCard";
import FirstLaunchStagePicker, { shouldShowFirstLaunch } from "@/components/planner/FirstLaunchStagePicker";
import GpExportButton from "@/components/planner/cycle/GpExportButton";
import MergedExportSheet from "@/components/planner/cycle/MergedExportSheet";
import QuietModeBanner from "@/components/planner/cycle/QuietModeBanner";
import SavedRhythmsCarousel from "@/components/planner/cycle/SavedRhythmsCarousel";
import WhatsUnfinishedCard from "@/components/planner/cycle/WhatsUnfinishedCard";
import DailyStoryReel from "@/components/planner/today/DailyStoryReel";
import FreshStartBanner from "@/components/planner/today/FreshStartBanner";
import JessNarrativeHero from "@/components/planner/today/JessNarrativeHero";
import PillarsDeck from "@/components/planner/today/PillarsDeck";
import BodyStrip from "@/components/planner/today/BodyStrip";
import RitualReframeShimmer from "@/components/planner/today/RitualReframeShimmer";
import SmartViewCard from "@/components/planner/today/SmartViewCard";
import { TonightCard, ShutdownRitualCard } from "@/components/planner/today/WarmthBundleToday";
import RitualBundlesCarousel from "@/components/planner/today/RitualBundlesCarousel";
import { WeekAheadCard, AstraSidecar, PlanMyNextCycleCTA } from "@/components/planner/cycle/WarmthBundleCycle";
import { selectedCrumbToday, selectedCrumbCycle } from "@/components/planner/selectedCrumb";
import { getPlannerConfig, filterProgramsByStage } from "@/utils/plannerAdapter";
import DevStageSwitcher from "@/components/planner/DevStageSwitcher";
import MorningBrief from "@/components/MorningBrief";
import PlanADaySheet from "@/components/PlanADaySheet";
// Phase 2 (2026-05-18) — opt-in unified v2 layout. Renders the
// planner-v2 row components in place of the existing Planner body
// when localStorage.femwell_planner_v2 === "true". DevStageSwitcher
// surfaces the toggle. Zero change to the production layout when the
// flag is false.
import PlannerV2Shell from "@/components/planner-v2/PlannerV2Shell";

// Reads the v2 feature flag from localStorage. Safe SSR-style fallback.
function readV2Flag() {
  try { return localStorage.getItem("femwell_planner_v2") === "true"; }
  catch { return false; }
}
// Phase 2 QA-fix-bundle-8 — Planner subscribes to the module-level
// devStageStore directly. The CustomEvent bus is no longer used here.
import {
  DEV_STAGE_KEY,
  readDevStage,
  readDevConditions,
  subscribeDevStage,
  subscribeDevConditions,
} from "@/utils/devStageStore";

// ── Stage-specific ribbon placeholder cards ─────────────────────────────────
// Replace MonthRibbon (a cycle-phase grid + "Log your last period" CTA) for
// stages where the cycle frame is wrong: pregnancy ("Journey"), PCOS / HA
// ("Hormones"), post-menopause ("Health"). Each is a single quiet card —
// no period gradient, no fertile window, no phase legend.

// NHS antenatal milestones — Cowork-locked weeks. Week numbers match common
// NICE NG201 antenatal schedule landmarks; copy stays factual + non-clinical.
const PREGNANCY_MILESTONES = [
  { week: 8,  label: "First scan" },
  { week: 12, label: "Dating scan" },
  { week: 16, label: "Anomaly scan booking" },
  { week: 20, label: "20-week anomaly scan" },
  { week: 28, label: "Glucose tolerance test" },
  { week: 32, label: "32-week scan" },
  { week: 36, label: "Group B strep test" },
  { week: 40, label: "Due date" },
];

function PregnancyTimelineCard({ profile, plannerConfig, variant = "ribbon" }) {
  const due = profile?.pregnancy_due_date;
  const start = profile?.pregnancy_start_date;

  // Resolve current week. Prefer due_date math (40 - weeks_remaining) — this is
  // how most antenatal apps anchor the timeline (more reliable than a remembered
  // start_date). Fall back to start_date math, then to no-week.
  let currentWeek = null;
  let trimesterLabel = plannerConfig?.cycleTabName || "Journey";
  if (due) {
    try {
      const d = new Date(due);
      const now = new Date();
      const weeksRemaining = Math.max(0, Math.round((d - now) / (1000 * 60 * 60 * 24 * 7)));
      currentWeek = Math.max(0, Math.min(40, 40 - weeksRemaining));
    } catch { /* ignore */ }
  } else if (start) {
    try {
      const s = new Date(start);
      const now = new Date();
      currentWeek = Math.max(0, Math.floor((now - s) / (1000 * 60 * 60 * 24 * 7)));
    } catch { /* ignore */ }
  }
  if (Number.isFinite(currentWeek)) {
    trimesterLabel = currentWeek < 13 ? "Trimester I"
                   : currentWeek < 27 ? "Trimester II"
                   : "Trimester III";
  }

  const trimesterRoman = trimesterLabel.endsWith("III") ? "III" : trimesterLabel.endsWith("II") ? "II" : "I";

  // Next milestone (>= currentWeek). Falls back to first one if user has no week yet.
  let nextMilestone = null;
  let weeksToNext = null;
  if (Number.isFinite(currentWeek)) {
    nextMilestone = PREGNANCY_MILESTONES.find((m) => m.week >= currentWeek) || null;
    if (nextMilestone) weeksToNext = nextMilestone.week - currentWeek;
  }

  // Progress bar — 40 segments coloured to currentWeek. Cream baseline,
  // sage fill up to current week, with a gold marker on the current week itself.
  const progressBar = (
    <div style={progressOuter} role="progressbar"
         aria-valuenow={currentWeek || 0} aria-valuemin={0} aria-valuemax={40}
         aria-label={`Pregnancy progress: week ${currentWeek || 0} of 40`}>
      {Array.from({ length: 40 }).map((_, i) => {
        const week = i + 1;
        const filled = currentWeek != null && week <= currentWeek;
        const isCurrent = currentWeek === week;
        return (
          <span
            key={i}
            style={{
              ...progressSeg,
              background: isCurrent
                ? "#A6862B"
                : filled
                  ? "rgba(107,143,90,0.55)"
                  : "rgba(58,44,26,0.08)",
            }}
          />
        );
      })}
    </div>
  );

  if (variant === "today") {
    return (
      <section style={todayWrap} aria-label="Pregnancy timeline">
        <p style={todayEyebrow}>YOUR PREGNANCY · CHAPTER {trimesterRoman}</p>
        <p style={todayHero}>
          {currentWeek != null ? <>Week <strong>{currentWeek}</strong> of 40</> : "Add your due date to see the timeline"}
        </p>
        {progressBar}
        {nextMilestone && weeksToNext != null ? (
          <p style={todayMilestone}>
            <strong>Coming up:</strong> {nextMilestone.label}{" "}
            {weeksToNext === 0 ? "this week" : `in ${weeksToNext} ${weeksToNext === 1 ? "week" : "weeks"}`}
          </p>
        ) : (
          <a href="/Profile" style={todayCta}>
            Add your due date →
          </a>
        )}
        {due && (
          <p style={todayDue}>
            Due {new Date(due).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </section>
    );
  }

  // Default "ribbon" variant — used on the Cycle/Journey tab.
  return (
    <section style={stageRibbonCardStyle}>
      <div style={stageRibbonEyebrowStyle}>40-WEEK JOURNEY · CHAPTER {trimesterRoman}</div>
      <div style={stageRibbonTitleStyle}>
        {trimesterLabel}
        {currentWeek != null ? ` · Week ${currentWeek}` : ""}
      </div>
      {progressBar}
      <p style={stageRibbonBodyStyle}>
        {due
          ? `Due ${new Date(due).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`
          : "Set your due date in Profile to see the trimester timeline + NHS antenatal schedule."}
      </p>
      {nextMilestone && weeksToNext != null && (
        <p style={stageRibbonHintStyle}>
          <strong>Coming up:</strong> {nextMilestone.label}{" "}
          {weeksToNext === 0 ? "this week" : `in ${weeksToNext} ${weeksToNext === 1 ? "week" : "weeks"}`}.
        </p>
      )}
      <p style={stageRibbonHintStyle}>
        Cycle tracking is paused while you're pregnant. We're not predicting periods, fertile windows, or ovulation.
      </p>
    </section>
  );
}

// ─── PregnancyTimelineCard styles ───────────────────────────────────────────
const progressOuter = {
  display: "grid",
  gridTemplateColumns: "repeat(40, minmax(0, 1fr))",
  gap: 1,
  margin: "8px 0 10px",
  padding: "2px 0",
};
const progressSeg = {
  height: 8,
  borderRadius: 2,
  background: "rgba(58,44,26,0.08)",
};
const todayWrap = {
  background: "linear-gradient(180deg, rgba(107,143,90,0.10), rgba(244,237,219,0.6))",
  border: "1px solid rgba(58,44,26,0.12)",
  borderLeft: "3px solid #6B8F5A",
  borderRadius: 16,
  padding: "16px 16px 18px",
  marginBottom: 12,
};
const todayEyebrow = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 10, fontWeight: 700, letterSpacing: "0.20em",
  color: "#3F6228", textTransform: "uppercase",
  margin: 0,
};
const todayHero = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, lineHeight: 1.2,
  color: "#3A2C1A", margin: "4px 0 8px",
};
const todayMilestone = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 13, color: "#3A2C1A", lineHeight: 1.5,
  margin: "4px 0 0",
};
const todayCta = {
  display: "inline-block",
  marginTop: 4,
  padding: "6px 14px",
  borderRadius: 9999,
  background: "#3A2C1A",
  color: "#F4EDDB",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12, fontWeight: 700,
  textDecoration: "none",
};
const todayDue = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, color: "#6B5840",
  fontStyle: "italic",
  margin: "8px 0 0",
};

function BleedEventsCard({ profile: _profile, plannerConfig }) {
  return (
    <section style={stageRibbonCardStyle}>
      <div style={stageRibbonEyebrowStyle}>BLEED EVENTS</div>
      <div style={stageRibbonTitleStyle}>{plannerConfig?.cycleTabName || "Hormones"}</div>
      <p style={stageRibbonBodyStyle}>
        We log bleed events when they happen rather than predicting a 28-day rhythm. Use Track to log a bleed when it lands.
      </p>
      <p style={stageRibbonHintStyle}>
        NHS guidance: if you've gone 90+ days without a bleed, mention it to your GP — withdrawal bleeds every 3-4 months protect the endometrium.
      </p>
    </section>
  );
}

function AnnualHealthCard({ profile: _profile, plannerConfig }) {
  return (
    <section style={stageRibbonCardStyle}>
      <div style={stageRibbonEyebrowStyle}>ANNUAL HEALTH RHYTHM</div>
      <div style={stageRibbonTitleStyle}>{plannerConfig?.cycleTabName || "Health"}</div>
      <p style={stageRibbonBodyStyle}>
        The cycle is no longer the frame. The long-game pillars are bone density (DEXA), cardiovascular health (NHS Health Check 40-74), GSM, and sleep.
      </p>
      <p style={stageRibbonHintStyle}>
        Local oestrogen is OTC as Gina for 50+ post-menopausal women — speak to your pharmacist if anything's dry or tender.
      </p>
    </section>
  );
}

const stageRibbonCardStyle = {
  background: "#FBF6E6",
  border: "1px solid rgba(58,44,26,0.10)",
  borderRadius: 16,
  padding: "16px 16px",
  marginBottom: 14,
};
const stageRibbonEyebrowStyle = {
  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10,
  fontWeight: 700, letterSpacing: "0.18em", color: "#A6862B",
  textTransform: "uppercase",
};
const stageRibbonTitleStyle = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 20,
  fontWeight: 500, color: "#3A2C1A", fontStyle: "italic",
  margin: "4px 0 8px", letterSpacing: "-0.01em",
};
const stageRibbonBodyStyle = {
  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12.5,
  color: "#6B5840", lineHeight: 1.55, margin: "0 0 8px",
};
const stageRibbonHintStyle = {
  fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 12,
  color: "#4A2A3A", lineHeight: 1.5, margin: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Planner — Phase 2 C0 (tab shell + routing)
//
// Phase 1 surfaces (DailyPlan, active programme, morning stack, meals,
// commitments) all stay — they now live inside the "Today" tab. Phase 2 v2
// spec splits the page across two tabs accessed via a segmented control at
// the top: Today (next 24h) + Cycle (the wider arc). The Cycle tab is an
// empty shell for C0; C1+ commits will populate month ribbon, Capacity Tax
// bar, Week Ahead card, etc.
//
// URL state: `?view=today|cycle` (default `today`). Persisted to
// `localStorage.fw_planner_view` so a return visit lands on the same tab.
// Cross-tab anchor links: `?view=cycle&scrollTo=<id>` scrolls to the named
// section after switch; `?view=today&toast=<msg>` surfaces a transient
// banner. Both are no-ops on C0 (Cycle anchors exist only as empty stubs)
// but the plumbing is in place so C3 Capacity Tax + C4 Doctor link can wire
// in without a routing rewrite.
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C0.
// Phase 1 reference demo: workspace/femwell_planner_final.html.
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  health:    { bg: "#FEE2E2", color: "#DC2626" },
  personal:  { bg: "#FBE9E6", color: "#B84A41" },
  work:      { bg: "#E8E0EF", color: "#5E3E50" },
  social:    { bg: "#E6EDE3", color: "#5F8A6F" },
  wellbeing: { bg: "#FEF3C7", color: "#A6862B" },
  reminder:  { bg: "#F0E5D8", color: "#6B4559" },
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

// Le Menu × Phase Sun — saturated phase palette (applied 2026-05-16).
const PHASE_COLORS = {
  menstrual:  "#9A2845", // period
  follicular: "#D4745A",
  ovulatory:  "#C8A040",
  luteal:     "#7B5E9A",
};

function phaseLabelOf(p) {
  if (!p) return null;
  return p.charAt(0).toUpperCase() + p.slice(1);
}

// Like utils/cyclePhase.getCurrentCyclePhase but for any target date.
function phaseForDate(profile, targetDate) {
  if (!profile) return null;
  const lastPeriod = profile.last_period_start_date;
  if (!lastPeriod) return null;
  const cycleLength = profile.cycle_avg_length || 28;
  const periodLength = profile.period_length || 5;
  const start = new Date(lastPeriod);
  const diff = Math.floor((targetDate - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  const dayOfCycle = (diff % cycleLength) + 1;
  if (dayOfCycle <= periodLength) return "menstrual";
  if (dayOfCycle <= cycleLength * 0.5 - 2) return "follicular";
  if (dayOfCycle <= cycleLength * 0.5 + 2) return "ovulatory";
  return "luteal";
}

function dayOfCycle(profile, targetDate) {
  if (!profile?.last_period_start_date) return null;
  const cycleLength = profile.cycle_avg_length || 28;
  const start = new Date(profile.last_period_start_date);
  const diff = Math.floor((targetDate - start) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  return (diff % cycleLength) + 1;
}

// Energy bucket for the 7-day forecast summary line (Phase 2 BUILD 1).
// Maps cycle phase + cycle-day position into one of three buckets:
//   • high-energy  — ovulatory window, late follicular
//   • steady       — early luteal, mid-follicular
//   • restful      — menstrual, late luteal
// Returns null when no profile / cycle data is available so the summary
// line can suppress itself for non-cycle stages.
function energyBucketFor(profile, targetDate) {
  const phase = phaseForDate(profile, targetDate);
  if (!phase) return null;
  const cd = dayOfCycle(profile, targetDate);
  const cycleLength = profile?.cycle_avg_length || 28;
  if (phase === "ovulatory") return "high";
  if (phase === "menstrual") return "restful";
  if (phase === "follicular") {
    // Late follicular (within 3 days of ovulation) reads as high-energy.
    const midpoint = Math.round(cycleLength * 0.5);
    return cd != null && cd >= midpoint - 3 ? "high" : "steady";
  }
  if (phase === "luteal") {
    // Late luteal (last 3 days before next period) reads as restful;
    // earlier luteal stays steady.
    return cd != null && cd >= cycleLength - 3 ? "restful" : "steady";
  }
  return null;
}

function getWeekDays(mondayDate) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d) {
  return d.toISOString().split("T")[0];
}

function weekdayKey(d) {
  // Lowercase weekday name to match MealPlans.plan_days keys.
  return d.toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase();
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Planner() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const location = useLocation();
  const navigate = useNavigate();

  // ── Tab routing (Phase 2 C0) ───────────────────────────────────────────────
  // Initial view comes from `?view=` → localStorage → default `today`. Kept in
  // sync with the URL so back/forward buttons + deep-link entries behave.
  const [view, setView] = useState(() => readInitialView());
  const [toastMsg, setToastMsg] = useState(null);
  const cycleSectionRefs = useRef({});

  // URL → state sync (handles browser nav + deep link entry)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const rawView = params.get("view");
    const nextView = resolveViewId(rawView);
    setView((prev) => (prev === nextView ? prev : nextView));

    // Cross-tab toast: ?toast=deferred:N — surface a small banner for a few seconds.
    const toast = params.get("toast");
    if (toast) {
      setToastMsg(toast);
      // Strip toast param so a refresh doesn't re-fire it.
      params.delete("toast");
      const next = params.toString();
      navigate({ pathname: location.pathname, search: next ? `?${next}` : "" }, { replace: true });
      const timer = setTimeout(() => setToastMsg(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [location.search, location.pathname, navigate]);

  // Anchor scroll after a cross-tab nav lands on Cycle (?view=cycle&scrollTo=doctor)
  useEffect(() => {
    if (view !== "cycle") return;
    const params = new URLSearchParams(location.search);
    const target = params.get("scrollTo");
    if (!target) return;
    // Wait one frame so the section has mounted.
    const t = requestAnimationFrame(() => {
      const el = cycleSectionRefs.current[target];
      if (el?.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(t);
  }, [view, location.search]);

  const changeView = (next) => {
    const nextView = resolveViewId(next);
    setView(nextView);
    writeStoredView(nextView);
    const params = new URLSearchParams(location.search);
    if (nextView === "today") params.delete("view");
    else params.set("view", nextView);
    // Anchor params only apply to the destination tab — strip on manual switch.
    params.delete("scrollTo");
    const search = params.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : "" }, { replace: false });
  };

  // Cross-tab nudge from Tonight HRT row → Cycle tab, scroll to Doctor-Ready
  // Diary anchor. Same plumbing as C0 `?view=cycle&scrollTo=doctor`.
  const goToDoctorDiary = () => {
    setView("cycle");
    writeStoredView("cycle");
    const params = new URLSearchParams(location.search);
    params.set("view", "cycle");
    params.set("scrollTo", "doctor");
    navigate({ pathname: location.pathname, search: `?${params.toString()}` }, { replace: false });
  };

  // Cross-tab navigate from Cycle ribbon → Today tab + retarget selected day.
  // Used by MonthRibbon day-cell taps (A2-1). The actual day-retargeting is
  // handled by setting `selectedDay` locally + switching the view.
  const navigateToToday = (dateISO) => {
    if (!dateISO) return;
    try {
      const d = new Date(dateISO);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(0, 0, 0, 0);
        setSelectedDay(d);
        setMonday(getMondayOfWeek(d));
      }
    } catch { /* leave selection unchanged */ }
    setView("today");
    writeStoredView("today");
    const params = new URLSearchParams(location.search);
    params.delete("view");
    params.delete("scrollTo");
    const search = params.toString();
    navigate({ pathname: location.pathname, search: search ? `?${search}` : "" }, { replace: false });
  };

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [monday, setMonday] = useState(getMondayOfWeek(today));
  const [selectedDay, setSelectedDay] = useState(today);
  const [items, setItems] = useState([]);
  const [personalTasks, setPersonalTasks] = useState([]);
  const [dailyPlan, setDailyPlan] = useState(null);
  // Raw programmes (pre-stage-filter) kept so DEV stage flips re-filter
  // without a re-fetch. activeProgram below is the filtered selection.
  const [rawPrograms, setRawPrograms] = useState([]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [habitLogs, setHabitLogs] = useState([]);
  const [todayHabitLogs, setTodayHabitLogs] = useState({});
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  // Phase 2 feature flag — when true, render PlannerV2Shell in place of
  // the existing Planner body. Lives in localStorage; flipped from the
  // DevStageSwitcher panel. Refreshes the page on toggle so the new
  // shell mounts cleanly.
  const [useV2, setUseV2] = useState(() => readV2Flag());
  // Phase 2 BUILD 3 — controls which form the bottom sheet renders. Defaults
  // to "task" (the legacy single-form behaviour). BUILD 2's "+ add to evening
  // stack" pre-selects "habit"; BUILD 3 FAB satellites set this directly.
  const [addMode, setAddMode] = useState("task");
  const [fabOpen, setFabOpen] = useState(false);
  const [showMedAdd, setShowMedAdd] = useState(false);
  const [medications, setMedications] = useState([]);
  // Sprint 6B Feature 1 — explicit `date` field on the med form (defaults
  // to selectedStr at modal open).
  const [medForm, setMedForm] = useState({ name: "", time: "", dose: "", notes: "", date: "" });
  const [savingMed, setSavingMed] = useState(false);
  const [saving, setSaving] = useState(false);
  // Sprint 6B Feature 1 — explicit `date` field on the new-item form so the
  // user can target a date other than today. Defaults at modal open to the
  // currently-selected day in the strip. The handleAdd flow uses newItem.date
  // if set, otherwise falls back to selectedStr.
  const [newItem, setNewItem] = useState({ title: "", category: "reminder", time: "", repeat: "once", notes: "", date: "" });

  const weekDays = getWeekDays(monday);
  const selectedStr = toDateStr(selectedDay);

  // Phase 2 QA-fix-bundle-2 — live profile re-fetch.
  //
  // The mount-time UserProfile fetch was a snapshot. If the user changed
  // their life_stage from /Profile (or any other surface) and returned to
  // /Planner, the Planner kept rendering with stale stage data — none of
  // the adapter-flag mounts updated until a full page refresh.
  //
  // refetchProfile re-reads UserProfile and re-sets the slice, which
  // cascades through effectiveLifeStage → plannerConfig → every shows*
  // gate without a remount.
  const refetchProfile = async (uid) => {
    const targetUid = uid || user?.id;
    if (!targetUid) return;
    try {
      const rows = await base44.entities.UserProfile.filter({ user_id: targetUid }, null, 1);
      if (rows && rows[0]) {
        // Only update if the relevant fields actually changed. Spares us
        // a re-render storm on the focus / visibility / poll triggers.
        setProfile((prev) => {
          if (!prev) return rows[0];
          const same = prev.life_stage === rows[0].life_stage
            && JSON.stringify(prev.conditions || prev.condition_flags || []) === JSON.stringify(rows[0].conditions || rows[0].condition_flags || []);
          return same ? prev : rows[0];
        });
      }
    } catch { /* silent */ }
  };

  // One-time load — user, profile, recurring entities. Day-specific data is
  // re-fetched in the second effect below when selectedDay changes.
  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        if (!u) { setLoading(false); return; }
        setUser(u);

        const [profiles, allItems, allTasks, programs, habits] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }, null, 1).catch(() => []),
          base44.entities.PlannerItems.filter({ user_id: u.id }, "-created_date", 200).catch(() => []),
          base44.entities.PersonalTasks.filter({ user_id: u.id }, "-created_date", 200).catch(() => []),
          base44.entities.UserPrograms.filter({ user_id: u.id, is_completed: false }, "-created_date", 5).catch(() => []),
          base44.entities.HabitLogs.filter({ user_id: u.id }, "-created_date", 60).catch(() => []),
        ]);

        setProfile(profiles[0] || null);
        setItems(allItems);
        setPersonalTasks(allTasks);
        // Phase 2 QA fix #3 — stage-filter active programmes so we never
        // show "Perimenopause Foundations" to a TTC or postpartum user.
        // Store the raw list; a downstream effect re-applies the filter
        // whenever effectiveLifeStage changes (DEV stage flip, profile
        // re-fetch, etc).
        setRawPrograms(programs);
        setHabitLogs(habits);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Phase 2 QA-fix-bundle-2 — wire refetchProfile to the four moments where
  // life_stage could have changed under us:
  //   (a) window focus       — user came back from /Profile in another tab
  //   (b) visibilitychange   — same tab, returning from another route
  //   (c) custom event       — Profile.jsx + Settings dispatch this when
  //                            saving a stage change so we can update
  //                            without waiting for focus/visibility
  //   (d) 6-second interval  — belt-and-braces for edge cases where the
  //                            event listeners miss (e.g. focus suppressed
  //                            on PWA, mobile background → foreground).
  useEffect(() => {
    if (!user?.id) return;
    const handler = () => refetchProfile(user.id);
    const visHandler = () => { if (document.visibilityState === "visible") refetchProfile(user.id); };
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", visHandler);
    window.addEventListener("femwell:profile-updated", handler);
    const poll = window.setInterval(handler, 6000);
    return () => {
      window.removeEventListener("focus", handler);
      document.removeEventListener("visibilitychange", visHandler);
      window.removeEventListener("femwell:profile-updated", handler);
      window.clearInterval(poll);
    };
  }, [user?.id]);

  // Day-specific fetches — DailyPlan, MealPlans, today's HabitLog checkmarks,
  // and (BUILD 4) MedicationReminders scheduled for the selected day.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const day_key = selectedStr;
      const [plans, meals, todayHabits, meds] = await Promise.all([
        base44.entities.DailyPlan.filter({ user_id: user.id, day_key }, null, 1).catch(() => []),
        base44.entities.MealPlans.filter({ user_id: user.id }, "-created_date", 3).catch(() => []),
        base44.entities.HabitLogs.filter({ user_id: user.id, date: day_key }, null, 20).catch(() => []),
        // MedicationReminders may be scheduled (date=day_key) or recurring
        // (date null + days-of-week). Fetch the union: today-stamped + a
        // recent 60-row window so daily/PRN rows surface too. Graceful empty
        // fallback if the entity isn't migrated on this account yet.
        base44.entities.MedicationReminders.filter({ user_id: user.id }, "-created_date", 60).catch(() => []),
      ]);
      if (cancelled) return;
      setDailyPlan(plans[0] || null);
      setMealPlan(meals[0] || null);
      // ritual-name → completed boolean, used to check the ritual rows.
      // Accepts both writer shapes via habitLogNormalise (Planner.jsx writes
      // habit_name+is_completed; Track.jsx writes habit_type+completed).
      const map = {};
      for (const h of todayHabits) {
        const name = habitNameOf(h);
        if (name) map[name] = habitCompletedOf(h);
      }
      setTodayHabitLogs(map);
      // Today's medication rows: same date OR repeat-daily OR no-date repeat.
      const dayMeds = (meds || []).filter((m) => {
        if (!m) return false;
        if (m.date === day_key) return true;
        if (m.repeat === "daily") return true;
        if (m.frequency === "daily") return true;
        return false;
      });
      setMedications(dayMeds);
    })();
    return () => { cancelled = true; };
  }, [user?.id, selectedStr]);

  // BUILD 4 — toggle taken/skipped state for a medication row. Optimistic
  // update + persist; silent failure (re-fetch on next day flip will reconcile).
  const toggleMedTaken = async (med) => {
    if (!med?.id || !user?.id) return;
    const next = !med.is_taken;
    setMedications(prev => prev.map(m => m.id === med.id ? { ...m, is_taken: next } : m));
    try {
      await base44.entities.MedicationReminders.update(med.id, { is_taken: next });
    } catch { /* silent */ }
  };

  // Top 3 recurring habits — derived from the last 60 HabitLogs.
  // Use habitLogNormalise so Track.jsx writers (habit_type) AND Planner.jsx
  // writers (habit_name) both feed Morning/Evening stack rendering.
  //
  // Morning stack = habits whose recent rows are either tagged
  // time_of_day === "morning" OR carry no time_of_day at all (legacy rows).
  // Evening stack = habits whose recent rows are tagged "evening" or "night".
  // Inference fallback: if no time_of_day on any row but the habit name
  // contains a clear evening cue ("bedtime", "wind down", "sleep", "evening",
  // "night"), route to the evening stack.
  function inferIsEvening(name, rows) {
    const tagged = rows.some(r => {
      const t = (r?.time_of_day || "").toLowerCase();
      return t === "evening" || t === "night";
    });
    if (tagged) return true;
    const taggedMorning = rows.some(r => (r?.time_of_day || "").toLowerCase() === "morning");
    if (taggedMorning) return false;
    const lower = (name || "").toLowerCase();
    return /\b(bedtime|wind\s?down|sleep|evening|night|shutdown|moon)\b/.test(lower);
  }
  const { ritualHabits, eveningRitualHabits } = useMemo(() => {
    const counts = {};
    const rowsByName = {};
    for (const h of habitLogs) {
      const name = habitNameOf(h);
      if (!name) continue;
      counts[name] = (counts[name] || 0) + 1;
      (rowsByName[name] = rowsByName[name] || []).push(h);
    }
    const ranked = Object.entries(counts)
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
    const morning = [];
    const evening = [];
    for (const name of ranked) {
      const isPm = inferIsEvening(name, rowsByName[name] || []);
      if (isPm && evening.length < 3) evening.push(name);
      else if (!isPm && morning.length < 3) morning.push(name);
      if (morning.length === 3 && evening.length === 3) break;
    }
    return { ritualHabits: morning, eveningRitualHabits: evening };
  }, [habitLogs]);

  // Quiet Mode (Phase 2 C6) — server-set boolean derived from
  // UserProfile.quiet_mode_until. When active, non-anchor PersonalTasks are
  // hidden from the day list. Anchors (is_anchor === true) remain.
  const quietModeActive = useMemo(() => {
    const iso = profile?.quiet_mode_until;
    if (!iso) return false;
    try { return new Date(iso).getTime() > Date.now(); } catch { return false; }
  }, [profile?.quiet_mode_until]);

  // Unified day-item list (PlannerItems + PersonalTasks for this date).
  const dayItems = useMemo(() => {
    const planner = items
      .filter(item =>
        item.date === selectedStr ||
        item.repeat === "daily" ||
        // Sprint 6B Feature 1 — Mon-Fri recurrence.
        (item.repeat === "weekdays" && selectedDay.getDay() >= 1 && selectedDay.getDay() <= 5) ||
        (item.repeat === "weekly" && item.date && new Date(item.date).getDay() === selectedDay.getDay()) ||
        (item.repeat === "monthly" && item.date && new Date(item.date).getDate() === selectedDay.getDate())
      )
      .map(it => ({ ...it, _source: "planner" }));
    const tasks = personalTasks
      .filter(t => t.date === selectedStr)
      // Quiet Mode hides non-anchor tasks — anchors are commitments, not noise.
      .filter(t => !quietModeActive || t.is_anchor === true)
      .map(t => ({ ...t, _source: "task", is_completed: !!t.completed }));
    return [...planner, ...tasks].sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });
  }, [items, personalTasks, selectedDay, selectedStr, quietModeActive]);

  // Meals for selected weekday from MealPlans.plan_days[weekday]
  const dayMeals = useMemo(() => {
    if (!mealPlan?.plan_days) return null;
    const key = weekdayKey(selectedDay);
    const entry = mealPlan.plan_days[key];
    if (!entry || typeof entry !== "object") return null;
    return entry;
  }, [mealPlan, selectedDay]);

  const selectedPhase = phaseForDate(profile, selectedDay);
  const selectedCycleDay = dayOfCycle(profile, selectedDay);
  const isSelectedToday = toDateStr(selectedDay) === toDateStr(today);

  // Capacity composite — phase-aware capacity vs predicted load. Both the
  // Cycle-tab Capacity Tax bar AND the Today-tab Smart View good-for chips
  // read from this single source of truth (spec §C5: good-for chips drive
  // from capacity composite, not phase alone).
  const capacityPct = useMemo(() => {
    const cap = deriveCapacity(selectedPhase);
    const load = derivePredictedLoad({ personalTasks, activeProgram, ritualHabits });
    return cap > 0 ? Math.round((load / cap) * 100) : 0;
  }, [selectedPhase, personalTasks, activeProgram, ritualHabits]);

  // Stuck-days map — per ritual, how many consecutive days from today
  // backwards the user has NOT completed it. Used to gate the C7 reframe
  // shimmer (spec §C7 + cost gate in spec_v2.md §LLM cost estimates: only
  // fire on stuck items, not every not-done morning ritual). Threshold:
  // STUCK_DAYS_THRESHOLD = 3 days running without a completion.
  const STUCK_DAYS_THRESHOLD = 3;
  const stuckDaysByHabit = useMemo(() => {
    const out = {};
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    for (const name of ritualHabits || []) {
      // Build a date-keyed map of (this habit's) completions across loaded
      // logs. Accepts both writer shapes (Planner: habit_name+is_completed,
      // Track: habit_type+completed).
      const completedByDate = new Map();
      for (const h of habitLogs || []) {
        const hName = h?.habit_type || h?.habit_name;
        if (hName !== name) continue;
        if (!h?.date) continue;
        const prev = completedByDate.get(h.date) || false;
        const done = (typeof h.completed === "boolean") ? h.completed : (h.is_completed !== false);
        completedByDate.set(h.date, prev || done);
      }
      let stuck = 0;
      for (let i = 1; i <= 10; i += 1) {
        const d = new Date(today0);
        d.setDate(d.getDate() - i);
        const k = toDateStr(d);
        if (completedByDate.get(k) === true) break;
        stuck += 1;
      }
      out[name] = stuck;
    }
    return out;
  }, [ritualHabits, habitLogs]);

  // Life Stage adapter — single source of truth for "how the Planner reshapes
  // itself for this user". Wired through to JessNarrativeHero, PillarsDeck,
  // DailyStoryReel, PlannerTabs, MonthRibbon, SavedRhythmsCarousel,
  // DoctorReadyDiaryCard, and the WarmthBundleCycle trio.
  // See src/utils/plannerAdapter.js + /Ideas · Life Stages tab.
  //
  // Dev override (no schema needed): DevStageSwitcher writes to
  // localStorage.femwell_dev_life_stage; if present, it wins over
  // profile.life_stage so Halli can preview any stage with a plain Publish.
  //
  // Reactivity: localStorage writes do NOT trigger React re-renders on their
  // own. We listen to two events so the Planner re-renders the entire tree
  // whenever the override changes from any source:
  //   - DEV_STAGE_EVENT (custom) — same-tab updates (the pill click here,
  //     devtools console, any future surface that calls writeDevStageOverride).
  //   - "storage" (native) — cross-tab updates (Halli has the same account
  //     open in two tabs and flips the stage in one).
  // Phase 2 QA-fix-bundle-8 — subscribe to the module-level devStageStore
  // singleton. The store calls subscribers SYNCHRONOUSLY on writes,
  // bypassing the CustomEvent bus entirely. No stale closures, no
  // event-listener-missed-by-mount-timing edge case, no whitelist
  // validation in the read path.
  const [devStageOverride, setDevStageOverride] = useState(() => readDevStage() || null);
  const [devConditionsOverride, setDevConditionsOverride] = useState(() => readDevConditions());
  const [stageTick, setStageTick] = useState(0);

  // ── "Plan today" Morning Brief bottom-sheet ─────────────────────────────
  // briefOpen drives the overlay. briefCompleted is hydrated from localStorage
  // — when a user finishes the brief, we stamp `femwell_brief_completed_<YYYY-MM-DD>=1`
  // so the button switches to "Planned" for the rest of the calendar day.
  const briefKey = `femwell_brief_completed_${new Date().toISOString().split("T")[0]}`;
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefCompleted, setBriefCompleted] = useState(() => {
    try { return typeof window !== "undefined" && !!window.localStorage.getItem(briefKey); }
    catch { return false; }
  });
  const markBriefCompleted = () => {
    try { window.localStorage.setItem(briefKey, "1"); } catch {}
    setBriefCompleted(true);
    // Auto-dismiss after 1.5s so the confetti moment lands then closes
    setTimeout(() => setBriefOpen(false), 1500);
  };
  useEffect(() => {
    const unsubStage = subscribeDevStage((next) => {
      console.log("[Planner] devStageStore notify →", next);
      setDevStageOverride(next || null);
      setStageTick((t) => t + 1);
    });
    const unsubCond = subscribeDevConditions((next) => {
      console.log("[Planner] devStageStore conditions notify →", next);
      setDevConditionsOverride(next);
      setStageTick((t) => t + 1);
    });
    // Cross-tab "storage" event is still useful for the rare case where
    // Halli has the app open in two tabs and flips the switcher in one.
    const onStorage = (e) => {
      if (e.key === DEV_STAGE_KEY) {
        setDevStageOverride(e.newValue || null);
        setStageTick((t) => t + 1);
      }
    };
    window.addEventListener("storage", onStorage);
    // Phase 2 QA-fix-bundle-10 — 500ms poll on localStorage as a final
    // defensive layer. Catches the case where someone (QA, devtools
    // console, a future surface) writes femwell_dev_life_stage directly
    // via localStorage.setItem without going through writeDevStage. The
    // raw setItem doesn't fire store subscribers OR the native "storage"
    // event (which only fires in OTHER tabs), so without this poll the
    // override is invisible to React until something else triggers a
    // re-render. 500ms cadence is cheap (one localStorage.getItem) and
    // imperceptible for a preview-mode dev tool.
    const pollRef = window.setInterval(() => {
      const current = readDevStage();
      setDevStageOverride((prev) => {
        if (current !== (prev || "")) {
          setStageTick((t) => t + 1);
          return current || null;
        }
        return prev;
      });
    }, 500);
    console.log("[Planner] devStageStore listeners attached. Initial:", readDevStage(), readDevConditions());
    return () => {
      unsubStage();
      unsubCond();
      window.removeEventListener("storage", onStorage);
      window.clearInterval(pollRef);
    };
  }, []);
  const realLifeStage = profile?.life_stage ?? null;
  // Phase 2 QA-fix-bundle-7 — read localStorage DIRECTLY at render time
  // (with stageTick as a render dependency so React re-runs this on every
  // tick bump). Bypasses readDevStageOverride's STAGES whitelist so a
  // valid stage cannot be silently rejected. void-ref to stageTick keeps
  // the linter quiet about the unused expression while ensuring React
  // doesn't dead-code the dependency.
  void stageTick;
  const liveLocalOverride = (() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const v = window.localStorage.getItem(DEV_STAGE_KEY);
        return v && v.length > 0 ? v : null;
      }
    } catch { /* silent */ }
    return null;
  })();
  const effectiveLifeStage = liveLocalOverride || devStageOverride || realLifeStage || "reproductive";
  const realConditions = profile?.conditions ?? profile?.condition_flags ?? [];
  // DEV conditions override: explicit (even empty) wins over the real list.
  // readDevConditionsOverride() returns null when no override is set.
  const effectiveConditions = devConditionsOverride !== null ? devConditionsOverride : realConditions;
  const plannerConfig = useMemo(
    () => getPlannerConfig(effectiveLifeStage, effectiveConditions),
    // Note: effectiveConditions is computed inline each render — when its
    // array reference changes the memo recomputes, which is fine. The
    // critical dep is effectiveLifeStage, which flips on every event.
    [effectiveLifeStage, effectiveConditions]
  );

  // Phase 2 QA fix #2 — dev diagnostic so future QA walks can verify the
  // adapter resolution live. Logs once per stage/conditions change.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[Planner] effective stage →", effectiveLifeStage,
      "| conditions →", effectiveConditions,
      "| ribbon →", plannerConfig?.ribbonType,
      "| showsEpds:", plannerConfig?.showsEpds,
      "| showsKickCounter:", plannerConfig?.showsKickCounter,
      "| showsPregnancyTimeline:", plannerConfig?.showsPregnancyTimeline,
      "| showsHrtCorrelation:", plannerConfig?.showsHrtCorrelation);
  }, [effectiveLifeStage, effectiveConditions, plannerConfig?.ribbonType,
      plannerConfig?.showsEpds, plannerConfig?.showsKickCounter,
      plannerConfig?.showsPregnancyTimeline, plannerConfig?.showsHrtCorrelation]);

  // Phase 2 QA fix #3 — stage-filter active programmes. Re-runs whenever
  // effectiveLifeStage changes (DEV switcher flip, profile re-fetch, etc).
  useEffect(() => {
    const filtered = filterProgramsByStage(rawPrograms || [], effectiveLifeStage);
    setActiveProgram(filtered[0] || null);
  }, [rawPrograms, effectiveLifeStage]);

  // First-launch stage picker — show on /Planner mount when the user signed up
  // before the 11-stage picker existed (life_stage null/empty/"none"). Suppressed
  // by DEV stage override and by a one-shot localStorage opt-out.
  const [showStagePicker, setShowStagePicker] = useState(false);
  useEffect(() => {
    if (loading) return;
    setShowStagePicker(shouldShowFirstLaunch(profile));
  }, [loading, profile?.life_stage, profile?.id]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Defer N non-anchor, non-completed PersonalTasks from today to a steadier
  // window (+3 days, follicular-leaning proxy per spec_v2 §C3). Anchor tasks
  // never move. Updates are optimistic + persisted; on failure we revert the
  // single failing row and the rest stay deferred. Navigates the user back to
  // the Today tab with a transient toast (`?toast=deferred:N`).
  const handleDeferTasks = async () => {
    const deferrable = (personalTasks || []).filter(
      (t) => t && !t.completed && t.is_anchor !== true
    );
    if (deferrable.length === 0) return;

    const target = new Date(selectedDay);
    target.setDate(target.getDate() + 3);
    const newDateStr = toDateStr(target);

    const ids = new Set(deferrable.map((t) => t.id));
    setPersonalTasks((prev) =>
      prev.map((t) => (ids.has(t.id) ? { ...t, date: newDateStr } : t))
    );

    await Promise.allSettled(
      deferrable.map((t) =>
        base44.entities.PersonalTasks.update(t.id, { date: newDateStr }).catch((err) => {
          // Revert that row on failure; surface nothing — the cap-tax bar will
          // recompute on next phase tick and the user can retry from Cycle tab.
          setPersonalTasks((prev) =>
            prev.map((row) => (row.id === t.id ? { ...row, date: t.date } : row))
          );
          // eslint-disable-next-line no-console
          console.warn("[planner] defer failed for task", t.id, err);
        })
      )
    );

    // Route to Today with toast — same plumbing C0 wired for cross-tab nudges.
    const params = new URLSearchParams(location.search);
    params.delete("view");
    params.delete("scrollTo");
    params.set("toast", `deferred:${deferrable.length}`);
    setView("today");
    writeStoredView("today");
    navigate(
      { pathname: location.pathname, search: `?${params.toString()}` },
      { replace: false }
    );
  };

  const handleAdd = async () => {
    if (!newItem.title.trim()) return;
    setSaving(true);
    // Sprint 6B Feature 1 — use explicit newItem.date when set, else fall
    // back to the currently selected day in the strip.
    const targetDate = newItem.date || selectedStr;
    if (addMode === "habit") {
      try {
        await base44.entities.HabitLogs.create({
          user_id: user.id,
          habit_name: newItem.title.trim(),
          date: targetDate,
          is_completed: false,
          time_of_day: newItem.time && Number(newItem.time.split(":")[0] || 12) >= 17 ? "evening" : "morning",
          created_at: new Date().toISOString(),
        });
      } catch { /* surface silently — user can retry */ }
      setNewItem({ title: "", category: "reminder", time: "", repeat: "once", notes: "", date: "" });
      setAddMode("task");
      setShowAdd(false);
      setSaving(false);
      try {
        const habits = await base44.entities.HabitLogs.filter({ user_id: user.id }, "-created_date", 60);
        setHabitLogs(habits);
      } catch { /* silent */ }
      return;
    }
    const category = addMode === "ritual" ? "wellbeing" : newItem.category;
    const created = await base44.entities.PlannerItems.create({
      user_id: user.id,
      title: newItem.title.trim(),
      category,
      date: targetDate,
      time: newItem.time || null,
      repeat: addMode === "ritual" ? "daily" : newItem.repeat,
      notes: newItem.notes || null,
      is_completed: false,
      created_at: new Date().toISOString(),
    });
    setItems(prev => [{ ...created, _source: "planner" }, ...prev]);
    setNewItem({ title: "", category: "reminder", time: "", repeat: "once", notes: "", date: "" });
    setAddMode("task");
    setShowAdd(false);
    setSaving(false);
  };

  // Phase 2 BUILD 3 + BUILD 4 — Medication mini-form. Writes to
  // MedicationReminders entity; falls back silently if entity is missing.
  const handleSaveMed = async () => {
    if (!medForm.name.trim() || !user?.id) return;
    setSavingMed(true);
    // Sprint 6B Feature 1 — honour the date picker on the med form.
    const targetDate = medForm.date || selectedStr;
    try {
      await base44.entities.MedicationReminders.create({
        user_id: user.id,
        medication_name: medForm.name.trim(),
        dosage: medForm.dose || null,
        reminder_time: medForm.time || null,
        date: targetDate,
        notes: medForm.notes || null,
        is_taken: false,
        created_at: new Date().toISOString(),
      });
      try {
        const rows = await base44.entities.MedicationReminders.filter({ user_id: user.id, date: selectedStr }, "-created_date", 20);
        setMedications(rows || []);
      } catch { /* silent */ }
    } catch { /* MedicationReminders may not be migrated yet */ }
    setMedForm({ name: "", time: "", dose: "", notes: "", date: "" });
    setShowMedAdd(false);
    setSavingMed(false);
  };

  const toggleComplete = async (item) => {
    if (item._source === "task") {
      const next = !item.is_completed;
      setPersonalTasks(prev => prev.map(t => t.id === item.id ? { ...t, completed: next } : t));
      await base44.entities.PersonalTasks.update(item.id, { completed: next });
      return;
    }
    const updated = { ...item, is_completed: !item.is_completed };
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    await base44.entities.PlannerItems.update(item.id, { is_completed: updated.is_completed });
  };

  const deleteItem = async (item) => {
    if (item._source === "task") {
      setPersonalTasks(prev => prev.filter(t => t.id !== item.id));
      await base44.entities.PersonalTasks.delete(item.id);
      return;
    }
    setItems(prev => prev.filter(i => i.id !== item.id));
    await base44.entities.PlannerItems.delete(item.id);
  };

  const toggleHabit = async (habitName, timeOfDay) => {
    if (!user?.id) return;
    const wasOn = !!todayHabitLogs[habitName];
    setTodayHabitLogs(prev => ({ ...prev, [habitName]: !wasOn }));
    // Optimistic; persist a new HabitLog row if turning on, mark existing if off.
    if (!wasOn) {
      try {
        const payload = {
          user_id: user.id,
          habit_name: habitName,
          date: selectedStr,
          is_completed: true,
          created_at: new Date().toISOString(),
        };
        // Phase 2 BUILD 2 — stamp time_of_day when toggled from the evening
        // stack so future renders route correctly. The field is optional on
        // the entity; older rows without it still infer via name pattern.
        if (timeOfDay) payload.time_of_day = timeOfDay;
        await base44.entities.HabitLogs.create(payload);
      } catch { /* silent */ }
    } else {
      try {
        const rows = await base44.entities.HabitLogs.filter({ user_id: user.id, habit_name: habitName, date: selectedStr }, null, 1);
        if (rows?.[0]?.id) {
          await base44.entities.HabitLogs.update(rows[0].id, { is_completed: false });
        }
      } catch { /* silent */ }
    }
  };

  // Phase 2 QA-fix-bundle-11 — snap the week strip back to today's week
  // and select today. Wired to the "Today" pill that surfaces whenever
  // selectedDay drifts off today.
  const goToToday = () => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setSelectedDay(t);
    setMonday(getMondayOfWeek(t));
  };

  const prevWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() - 7);
    setMonday(d);
    const sel = new Date(selectedDay);
    sel.setDate(sel.getDate() - 7);
    setSelectedDay(sel);
  };
  const nextWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7);
    setMonday(d);
    const sel = new Date(selectedDay);
    sel.setDate(sel.getDate() + 7);
    setSelectedDay(sel);
  };
  const isTodayDate = (d) => toDateStr(d) === toDateStr(today);
  const isSelected = (d) => toDateStr(d) === selectedStr;

  // ── Phase 2 feature flag ── If the v2 flag is on, render PlannerV2Shell
  // in place of the existing layout. The DevStageSwitcher still mounts at
  // the top so the user can flip stages + flip the v2 flag back off.
  if (useV2) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F4EDDB", position: "relative" }}>
        <div style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "rgba(244,237,219,0.96)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(58,44,26,0.10)",
          padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}>
          <span style={{
            fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#9B8B7A", fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 700,
          }}>Planner · v2 (feature flag)</span>
          <DevStageSwitcher
            effectiveStage={effectiveLifeStage}
            realStage={realLifeStage}
            effectiveConditions={effectiveConditions}
            realConditions={realConditions}
            onChange={setDevStageOverride}
            onConditionsChange={setDevConditionsOverride}
            profileId={profile?.id}
            onProfileUpdated={(updates) => {
              setProfile((p) => p ? { ...p, ...updates } : p);
            }}
          />
        </div>
        <PlannerV2Shell
          user={user}
          profile={profile}
          plannerConfig={plannerConfig}
          effectiveLifeStage={effectiveLifeStage}
          selectedDay={selectedDay}
          selectedPhase={selectedPhase}
          selectedCycleDay={selectedCycleDay}
          personalTasks={personalTasks}
          dailyPlan={dailyPlan}
          habitLogs={habitLogs}
          medications={medications}
          mealPlan={mealPlan}
          activeProgram={activeProgram}
          onPlanADay={() => setShowAdd(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "#F4EDDB", /* Le Menu cream paper */ position: "relative" }}>
      {/* First-launch stage picker — modal overlay for users who never set
          a life_stage (signed up before the 11-stage picker existed). The
          picker writes to UserProfile.life_stage so plannerAdapter reshapes
          everything on close. */}
      {showStagePicker && (
        <FirstLaunchStagePicker
          profile={profile}
          onSaved={(stage) => {
            setProfile((p) => p ? { ...p, life_stage: stage } : p);
            setShowStagePicker(false);
            // Same cross-surface signal Profile fires — keeps any other
            // mounted listener in sync.
            try { window.dispatchEvent(new Event("femwell:profile-updated")); } catch { /* silent */ }
          }}
          onSkip={() => setShowStagePicker(false)}
        />
      )}
      {/* Le Menu paper grain — feTurbulence overlay at ~2.5% opacity (polish pass 2026-05-16) */}
      <svg aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: 0.025 }}>
        <filter id="lm-paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch"/>
          <feColorMatrix values="0 0 0 0 0.227   0 0 0 0 0.173   0 0 0 0 0.102   0 0 0 0.9 0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#lm-paper-grain)"/>
      </svg>
      <div style={{ position: "relative", zIndex: 1 }}>
      {/* ── Header: brand · tabs · (Today-only) week strip ──────────────────
          Founder feedback 2026-05-18: was sticky (sticky top-0 z-30), the
          pinned header made the page feel cramped. Now scrolls naturally
          with the page content. Background blur kept for the brand
          continuity but no longer pinned. */}
      <div className="px-4 pt-10 pb-3" style={{ backgroundColor: "rgba(244,237,219,0.97)", borderBottom: "1px solid rgba(58,44,26,0.16)" }}>
        <div className="max-w-xl mx-auto">
          {/* A2-4 (1+2+3): tab-specific page title + date-stamped Today eyebrow.
              Life Stage adapter: the cycle-view title is the per-stage label
              (Patterns / Journey / Clinical / Hormones / Recovery / Health),
              defaulting to "Cycle" when no override is set. */}
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif" }}>
            {view === "cycle"
              ? `Your ${(plannerConfig?.cycleTabName || "Cycle").toLowerCase()}`
              : `Today · ${today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}`}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", margin: "4px 0 4px" }}>
            <h1 style={{ fontSize: 28, fontWeight: 500, fontFamily: "'Fraunces', Georgia, serif", color: "var(--plum, #4A2A3A)", letterSpacing: "-0.015em", margin: 0 }}>
              {view === "cycle" ? (plannerConfig?.cycleTabName || "Cycle") : "Today"}
            </h1>
            {/* A2-4 (4): confidence pill lifted out of .ph-sub — always renders */}
            <ConfidencePill meta={profile?.cycle_prediction_meta} />
          </div>
          {/* Life Stage adapter: hide "Day N · Luteal" cycle chip when the
              stage is not cycle-anchored (peri, pregnancy, ttc, postpartum,
              post-meno, pcos / ha modifier). The cycle frame would mislead. */}
          {selectedPhase && selectedCycleDay && (plannerConfig?.ribbonType === "cycle") && (
            <p style={{ fontSize: 12, color: "var(--plum-2, #6B4559)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>
              Day {selectedCycleDay} · <span style={{ color: PHASE_COLORS[selectedPhase], fontWeight: 600 }}>{phaseLabelOf(selectedPhase)}</span>
            </p>
          )}
          {/* Stage banner — clearly tell the user which mode is active. */}
          {plannerConfig?.bannerText && (
            <p style={{
              fontSize: 11, fontWeight: 600, color: "var(--plum, #4A2A3A)",
              fontFamily: "Georgia, serif", fontStyle: "italic",
              marginBottom: 6, lineHeight: 1.4,
              padding: "6px 10px",
              background: "rgba(168,134,75,0.12)",
              borderLeft: "2px solid #A6862B",
              borderRadius: 4,
            }}>{plannerConfig.bannerText}</p>
          )}
          {/* A2-4 (5): selected-crumb subtitle — italic plum-mute */}
          <p style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif", marginBottom: 8, lineHeight: 1.45 }}>
            {view === "cycle"
              ? selectedCrumbCycle({ date: today })
              : selectedCrumbToday({ dailyPlan, phase: selectedPhase, date: today })}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <PlannerTabs view={view} onChange={changeView} plannerConfig={plannerConfig} />
            <DevStageSwitcher
              effectiveStage={effectiveLifeStage}
              realStage={realLifeStage}
              effectiveConditions={effectiveConditions}
              realConditions={realConditions}
              onChange={setDevStageOverride}
              onConditionsChange={setDevConditionsOverride}
              profileId={profile?.id}
              onProfileUpdated={(updates) => {
                // Phase 2 QA-fix-bundle-5 — DB write inside the switcher
                // confirmed; mirror the change into Planner state so
                // realLifeStage updates on the very next render (without
                // waiting for the 6-second poll or focus event).
                setProfile((p) => p ? { ...p, ...updates } : p);
              }}
            />
          </div>

          {view === "today" && (
            <div className="flex items-center gap-2" style={{ marginTop: 14 }}>
              <button onClick={prevWeek} aria-label="Previous week" style={navBtnStyle}>
                <ChevronLeft className="w-4 h-4" style={{ color: "var(--plum-mute, #8A7584)" }} />
              </button>
              <div className="flex gap-1 flex-1 justify-between">
                {weekDays.map((d, i) => {
                  const sel = isSelected(d);
                  const tod = isTodayDate(d);
                  const phase = phaseForDate(profile, d);
                  return (
                    <button key={i} onClick={() => setSelectedDay(d)} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      padding: "8px 4px", borderRadius: 12, flex: 1, border: "none", cursor: "pointer",
                      backgroundColor: sel ? "var(--plum, #4A2A3A)" : tod ? "rgba(212,94,82,0.10)" : "transparent",
                      transition: "background 120ms",
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: sel ? "var(--cream, #FFFAF5)" : "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{DAY_LABELS[i]}</span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: sel ? "var(--cream, #FFFAF5)" : tod ? "var(--rose-primary, #D45E52)" : "var(--plum, #4A2A3A)", fontFamily: "'Fraunces', Georgia, serif" }}>{d.getDate()}</span>
                      <span style={{
                        width: 5, height: 5, borderRadius: 9999,
                        background: phase ? PHASE_COLORS[phase] : "transparent",
                        opacity: sel ? 1 : 0.85,
                      }} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
              <button onClick={nextWeek} aria-label="Next week" style={navBtnStyle}>
                <ChevronRight className="w-4 h-4" style={{ color: "var(--plum-mute, #8A7584)" }} />
              </button>
            </div>
          )}
          {/* Phase 2 QA-fix-bundle-11 — "Today" pill. Surfaces only when
              the selected day isn't today (so the strip needs a snap-back).
              Tap returns to today's week + selects today. Centred under
              the chip strip in --femwell-blush so it reads as a soft
              affordance rather than a CTA shouting from the page. ───── */}
          {view === "today" && !isTodayDate(selectedDay) && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <button
                onClick={goToToday}
                aria-label="Snap back to today"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px",
                  borderRadius: 9999,
                  border: "1px solid var(--femwell-blush, #E8B4B8)",
                  background: "rgba(232,180,184,0.18)",
                  color: "var(--femwell-espresso, #3A2C1A)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                <span aria-hidden="true" style={{ fontSize: 11 }}>↩</span>
                Today
              </button>
            </div>
          )}
          {/* "Plan today" — soft optional nudge to open the Morning Brief
              bottom sheet. Once completed today, swaps to a muted "Planned"
              chip for the rest of the calendar day. Only shows on the
              TODAY tab when the selected date is actually today. ───────── */}
          {view === "today" && isTodayDate(selectedDay) && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              {briefCompleted ? (
                <span aria-label="You've planned today"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "5px 12px", borderRadius: 9999,
                        background: "rgba(143,175,143,0.18)",
                        border: "1px solid rgba(143,175,143,0.42)",
                        color: "var(--femwell-mauve, #9B8B7A)",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                      }}>
                  <span aria-hidden="true">✓</span> Planned
                </span>
              ) : (
                <button onClick={() => setBriefOpen(true)}
                        aria-label="Plan a day"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 14px", borderRadius: 9999,
                          background: "rgba(232,180,184,0.30)",
                          border: "1px solid var(--femwell-blush, #E8B4B8)",
                          color: "var(--femwell-espresso, #3A2C1A)",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                          cursor: "pointer",
                        }}>
                  <Sparkle className="w-3 h-3" style={{ color: "var(--femwell-rose, #D45E52)" }} />
                  Plan a day
                </button>
              )}
            </div>
          )}
          {/* Phase 2 BUILD 1 — energy summary for the next 7 days, derived
              from energyBucketFor() over each weekday. Suppressed for non-
              cycle stages (no phase → no buckets). Plain prose; no chips. */}
          {view === "today" && plannerConfig?.ribbonType === "cycle" && (() => {
            const buckets = weekDays.map((d) => energyBucketFor(profile, d));
            const counts = { high: 0, steady: 0, restful: 0 };
            for (const b of buckets) { if (b && counts[b] != null) counts[b] += 1; }
            const total = counts.high + counts.steady + counts.restful;
            if (total < 4) return null;
            return (
              <p style={energySummaryStyle} aria-label="Seven-day energy summary">
                {counts.high} high-energy
                <span style={energyDotSep}> · </span>
                {counts.steady} steady
                <span style={energyDotSep}> · </span>
                {counts.restful} restful days ahead
              </p>
            );
          })()}
        </div>
      </div>

      {/* ── Cross-tab toast (transient) ───────────────────────────────────── */}
      {toastMsg && (
        <div role="status" aria-live="polite" style={toastStyle}>
          {toastMsg.startsWith("deferred:") ? `Deferred ${toastMsg.split(":")[1]} to a steadier window.` : toastMsg}
        </div>
      )}

      {/* Phase 2 QA-fix-bundle-9 — DEBUG strip HOISTED above the view-tab
          conditional so it renders on every tab. QA fiber inspection
          found the previous nesting site was inside {view === "today" &&}
          which hid the strip (and every stage card) when on Cycle. ──── */}
      <div className="max-w-xl mx-auto px-4" style={{ marginTop: 8 }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10,
          color: "var(--plum-mute, #8A7584)",
          padding: "4px 8px",
          background: "rgba(58,44,26,0.04)",
          border: "1px dashed rgba(58,44,26,0.14)",
          borderRadius: 6,
          letterSpacing: "0.02em",
        }}>
          <strong style={{ fontWeight: 700, color: "#3A2C1A" }}>DEBUG</strong>{" "}
          tab=<strong style={{ color: "#3A2C1A" }}>{view}</strong>
          {" · "}stage=<strong style={{ color: "#3A2C1A" }}>{effectiveLifeStage}</strong>
          {" · "}local=<strong>{liveLocalOverride || "—"}</strong>
          {" · "}state=<strong>{devStageOverride || "—"}</strong>
          {" · "}real=<strong>{realLifeStage || "—"}</strong>
          {" · "}tick={stageTick}
        </div>
      </div>

      {/* Phase 2 QA-fix-bundle-9 — stage-specific cards HOISTED out of the
          {view === "today" && ...} wrapper so they render on every tab.
          They were previously buried 60+ lines below this point inside the
          Today panel; if QA happened to land on the Cycle tab (via
          ?view=cycle or a localStorage fw_planner_view = "cycle"), the
          entire Today panel was hidden and every stage-card gate evaluated
          inside a non-rendered subtree. Move them up here so they're tab-
          agnostic — they're stage-anchored, not time-of-day-anchored, so
          this is also more honest UX. ─────────────────────────────────── */}
      {!loading && (
        <div className="max-w-xl mx-auto px-4" style={{ paddingTop: 12 }}>
          {(() => {
            // eslint-disable-next-line no-console
            console.log("[Planner debug TOP-LEVEL] effectiveLifeStage=", effectiveLifeStage,
              "| view=", view,
              "| liveLocalOverride=", liveLocalOverride,
              "| devStageOverride state=", devStageOverride,
              "| realLifeStage=", realLifeStage,
              "| stageTick=", stageTick,
              "| profile.id=", profile?.id);
            return null;
          })()}
          {(["pregnant-t1", "pregnant-t2", "pregnant-t3", "pregnancy"].includes(effectiveLifeStage)) && (
            <PregnancyTimelineCard profile={profile} plannerConfig={plannerConfig} variant="today" />
          )}
          {(["pregnant-t2", "pregnant-t3"].includes(effectiveLifeStage)) && (
            <KickCounterCard userId={user?.id} />
          )}
          {effectiveLifeStage === "postpartum" && (
            <EpdsScreenCard profile={profile} />
          )}
          {(effectiveLifeStage === "perimenopause"
            || (Array.isArray(effectiveConditions) && effectiveConditions.includes("hrt"))
            || (Array.isArray(profile?.conditions) && profile.conditions.includes("hrt"))
            || (Array.isArray(profile?.condition_flags) && profile.condition_flags.includes("hrt"))) && (
            <HrtCorrelationCard profile={profile} />
          )}
        </div>
      )}

      {/* ── Cycle view (C0 stub — C1+ populates the surfaces) ─────────────── */}
      {view === "cycle" && (
        <div
          id="planner-panel-cycle"
          role="tabpanel"
          aria-labelledby="planner-tab-cycle"
          className="max-w-xl mx-auto px-4 pt-5"
        >
          <QuietModeBanner
            profile={profile}
            onCleared={() => setProfile(p => p ? { ...p, quiet_mode_until: null } : p)}
          />
          <div ref={(el) => { cycleSectionRefs.current.ribbon = el; }}>
            {plannerConfig?.ribbonType === "symptom" ? (
              <>
                <SymptomRibbon
                  profile={profile}
                  today={today}
                  onLogToday={() => navigate("/Track")}
                />
                {plannerConfig?.cycleTabMode === "heatmap" && (
                  <HrtLogCard profile={profile} />
                )}
              </>
            ) : plannerConfig?.ribbonType === "cycle" ? (
              <MonthRibbon
                profile={profile}
                habitLogs={habitLogs}
                today={today}
                onNavigateToToday={navigateToToday}
                plannerConfig={plannerConfig}
              />
            ) : plannerConfig?.ribbonType === "pregnancy" ? (
              <PregnancyTimelineCard profile={profile} plannerConfig={plannerConfig} />
            ) : plannerConfig?.ribbonType === "event" ? (
              <BleedEventsCard profile={profile} plannerConfig={plannerConfig} />
            ) : plannerConfig?.ribbonType === "health" ? (
              <AnnualHealthCard profile={profile} plannerConfig={plannerConfig} />
            ) : null}
          </div>
          <div ref={(el) => { cycleSectionRefs.current.captax = el; }}>
            <CapacityTaxBar
              phase={selectedPhase}
              personalTasks={personalTasks}
              activeProgram={activeProgram}
              ritualHabits={ritualHabits}
              onDefer={handleDeferTasks}
            />
          </div>
          <ConsistencyCard habitLogs={habitLogs} phase={selectedPhase} />
          {/* Life Stage adapter: SavedRhythms / WhatsUnfinished /
              CycleMirror / WeekAhead are all cycle-phase-anchored. Hide
              them entirely when the stage isn't cycle-anchored (peri,
              pregnancy, ttc, postpartum, post-meno, pcos / ha). Pregnant
              and perimenopausal users should NEVER see "your next period
              ETA" or "Sunday mirror your luteal". */}
          {plannerConfig?.ribbonType === "cycle" && (
            <>
              <SavedRhythmsCarousel
                profile={profile}
                currentPhase={selectedPhase}
                currentCycleDay={selectedCycleDay}
                plannerConfig={plannerConfig}
              />
              <WhatsUnfinishedCard
                stuckDaysByHabit={stuckDaysByHabit}
                phase={selectedPhase}
              />
              <CycleMirrorSundayTile
                profile={profile}
                habitLogs={habitLogs}
                phase={selectedPhase}
                cycleDay={selectedCycleDay}
              />
              <div ref={(el) => { cycleSectionRefs.current.weekAhead = el; }}>
                <WeekAheadCard
                  phase={selectedPhase}
                  nextPeriodEta={profile?.cycle_prediction_meta?.next_period_eta || null}
                  etaWindowDays={profile?.cycle_prediction_meta?.eta_window_days || null}
                  confidencePct={profile?.cycle_prediction_meta?.confidence_pct || null}
                  cyclesObserved={profile?.cycle_prediction_meta?.cycles_observed || 0}
                  profile={profile}
                  plannerConfig={plannerConfig}
                />
              </div>
            </>
          )}
          <div ref={(el) => { cycleSectionRefs.current.doctor = el; }}>
            <DoctorReadyDiaryCard user={user} profile={profile} plannerConfig={plannerConfig} />
          </div>
          {/* ── Contraception memory — reproductive + pre-TTC only ──────
              Hidden via plannerConfig.hiddenFeatures.includes("contraception")
              for teen/pregnant/postpartum/peri/meno (declared in
              plannerAdapter.js). Only renders on the Cycle view. ─────── */}
          {plannerConfig?.ribbonType === "cycle"
            && !plannerConfig?.hiddenFeatures?.includes("contraception") && (
            <ContraceptionCard profile={profile} />
          )}
          {/* ── Pre-TTC prep cards — folic acid · AMH · supplement stack ──
              Pre-TTC only. The cards are self-contained (no entity reads)
              so they ship without any base44 schema dependency. ──────── */}
          {effectiveLifeStage === "pre-ttc" && (
            <>
              <SupplementTrackerCard userId={user?.id} profile={profile} lifeStage={effectiveLifeStage} />
              <FolicAcidNudge />
              <AmhAwarenessCard />
              <SupplementStackCard />
            </>
          )}
          {/* ── TTC also gets the SupplementTrackerCard so PCOS users see
              the CoQ10 row for egg quality. Folic / AMH / SupplementStack
              are static pre-conception primers — TTC users have moved past
              those. ─────────────────────────────────────────────────── */}
          {effectiveLifeStage === "ttc" && (
            <SupplementTrackerCard userId={user?.id} profile={profile} lifeStage={effectiveLifeStage} />
          )}
          {/* ── TTC fertile-window strip — 7-day band centred on predicted
              peak day with BBT + OPK quick-log buttons. Renders only on
              the TTC stage (Clinical tab). ───────────────────────────── */}
          {effectiveLifeStage === "ttc" && (
            <FertileWindowCard profile={profile} cycleDay={selectedCycleDay} userId={user?.id} />
          )}
          <AstraSidecar profile={profile} />
          {/* Sprint 6B Feature 2 — merged Export sheet replaces the two
              prior CTAs (Export for GP + Build diary appointment). Single
              "Export" button opens a bottom sheet with checkboxes + a
              combined/separate toggle. Reuses the existing PDF builders
              from GpExportButton + DoctorReadyDiaryCard so the output is
              byte-identical to the prior surfaces. */}
          <MergedExportSheet
            profile={profile}
            plannerConfig={plannerConfig}
            user={user}
            effectiveLifeStage={effectiveLifeStage}
          />
          {/* Plan-my-next-cycle is cycle-anchored. Hide for non-cycle stages. */}
          {plannerConfig?.ribbonType === "cycle" && <PlanMyNextCycleCTA />}
        </div>
      )}

      {/* ── Today view (Phase 1 surfaces, unchanged) ──────────────────────── */}
      {view === "today" && (
      <div
        id="planner-panel-today"
        role="tabpanel"
        aria-labelledby="planner-tab-today"
        className="max-w-xl mx-auto px-4 pt-5"
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum, #4A2A3A)", fontFamily: "'Inter', sans-serif", marginBottom: 14 }}>
          {selectedDay.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(212,94,82,0.18)", borderTopColor: "var(--rose-primary, #D45E52)" }} />
          </div>
        ) : (
          <>
            {/* ── Jess narrative hero (Today-A T-A2) — weekly phase-aware
                top-of-Today hero, gpt_5_mini cached 7d in localStorage with
                a 32-line phase-keyed fallback bank. ──────────────────── */}
            <JessNarrativeHero
              profile={profile}
              cycleInfo={selectedPhase ? { phase: selectedPhase, day: selectedCycleDay } : null}
              plannerConfig={plannerConfig}
              effectiveLifeStage={effectiveLifeStage}
              effectiveConditions={effectiveConditions}
            />

            {/* Phase 2 QA-fix-bundle-9 — stage-specific cards were here.
                Hoisted to the page-level (above the view-tab conditional)
                so they render regardless of whether QA is on Today or
                Cycle tab. See the hoisted block earlier in this file. */}

            {/* ── Fresh-Start banner (Phase 2 B1) — soft reset on inflection.
                Life Stage adapter: FreshStart triggers on cycle-day-1 etc;
                hide entirely for non-cycle stages. ───────────────── */}
            {plannerConfig?.ribbonType === "cycle" && (
              <FreshStartBanner
                profile={profile}
                habitLogs={habitLogs}
                today={today}
                onAddAnchor={() => setShowAdd(true)}
                onPlanWithJess={() => navigate("/Planner?_smartView=streaky")}
              />
            )}

            {/* ── Quiet Mode banner (Phase 2 C6) — mode-agnostic, keep. ── */}
            <QuietModeBanner
              profile={profile}
              onCleared={() => setProfile(p => p ? { ...p, quiet_mode_until: null } : p)}
            />

            {/* ── Smart View (Phase 2 C5) — adaptive "right now" card. Phase
                chips IDLE/STREAKY/STUCK/DRIFTING/QUIET are cycle-phase aware,
                so hide for non-cycle stages. The pillar tiles below cover
                the "what to do right now" signal for those stages. ─── */}
            {plannerConfig?.ribbonType === "cycle" && (
              <SmartViewCard
                phase={selectedPhase}
                cycleDay={selectedCycleDay}
                capacityPct={capacityPct}
                dailyPlan={dailyPlan}
                activeProgram={activeProgram}
                ritualHabits={ritualHabits}
                todayHabitLogs={todayHabitLogs}
                quietModeActive={quietModeActive}
              />
            )}

            {/* ── Body strip (founder feedback 2026-05-18) ──────────────
                Was a fixed 2×3 grid (PillarsDeck). Now a single-line
                collapsible strip with chevron — full grid still available
                on expand. State persisted in localStorage. */}
            <BodyStrip profile={profile} today={today} plannerConfig={plannerConfig} />

            {/* ── Daily Story Reel (Today-A T-A3) — horizontal carousel
                of today's DailyStory segment + 3-5 phase-tagged unread
                LifestyleItems. ─────────────────────────────────────── */}
            <DailyStoryReel
              profile={profile}
              cycleInfo={selectedPhase ? { phase: selectedPhase, day: selectedCycleDay } : null}
              plannerConfig={plannerConfig}
            />

            {/* ── Smart card 1: Today's intention (DailyPlan) ──────────────
                Life Stage adapter: phase-signed copy ("Luteal · Boundary
                check-in") is cycle-frame thinking. Hide for non-cycle
                stages (pregnancy, postpartum, peri, meno, post-meno) and
                for any stage whose plannerConfig.hiddenFeatures explicitly
                opts out via "phaseSignedIntention". ─────────────────── */}
            {/* Phase 2 QA fix #8 — empty-state placeholder when stage is
                cycle-anchored but no DailyPlan row exists yet. Tells the
                user the surface exists rather than silently absent. */}
            {!dailyPlan
              && plannerConfig?.ribbonType === "cycle"
              && !plannerConfig?.hiddenFeatures?.includes("phaseSignedIntention") && (
              <div style={{ ...intentionCardStyle, background: "rgba(255,255,255,0.6)", borderStyle: "dashed" }}>
                <span style={smartLabelStyle}>YOUR DAILY INTENTION</span>
                <p style={{ ...intentionMainStyle, opacity: 0.6, marginTop: 6 }}>
                  Jess is drafting tonight…
                </p>
                <p style={{ ...intentionSubStyle, opacity: 0.7 }}>
                  Your intention will appear here once today's plan is generated.
                </p>
              </div>
            )}
            {dailyPlan
              && plannerConfig?.ribbonType === "cycle"
              && !plannerConfig?.hiddenFeatures?.includes("phaseSignedIntention") && (
              <div style={intentionCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={smartLabelStyle}>
                    <Sparkles size={11} style={{ marginRight: 4 }} />
                    {isSelectedToday ? "Today" : "Plan"} · signed by Jess
                  </span>
                  {selectedPhase && (
                    <span style={{ ...phaseChipStyle, background: `${PHASE_COLORS[selectedPhase]}22`, color: PHASE_COLORS[selectedPhase] }}>
                      {phaseLabelOf(selectedPhase)}
                    </span>
                  )}
                </div>
                {dailyPlan.focus_for_today && (
                  <p style={intentionMainStyle}>{dailyPlan.focus_for_today}</p>
                )}
                {dailyPlan.mental_tool && (
                  <p style={intentionSubStyle}>{dailyPlan.mental_tool}</p>
                )}
              </div>
            )}

            {/* ── Smart card 2: Active program ─────────────────────────── */}
            {activeProgram && (
              <div style={programCardStyle}>
                <p style={programEyebrowStyle}>Continuing your program</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={programNameStyle}>{activeProgram.program_name || activeProgram.program_id || "Your program"}</p>
                    <p style={programDayStyle}>
                      Day {activeProgram.current_day || 1}
                      {activeProgram.total_days ? ` of ${activeProgram.total_days}` : ""}
                    </p>
                  </div>
                  <a href="/Programs" style={programCtaStyle}>Open</a>
                </div>
                {activeProgram.total_days && activeProgram.current_day && (
                  <div style={programProgressOuterStyle}>
                    <div style={{ ...programProgressFillStyle, width: `${Math.min(100, Math.round((activeProgram.current_day / activeProgram.total_days) * 100))}%` }} />
                  </div>
                )}
              </div>
            )}

            {/* ── Smart card 3: Morning ritual stack (HabitLogs) ───────
                Phase 2 QA fix #8 — when no recurring habits yet (fresh
                account), render a one-line nudge so the surface tells the
                user where stacks come from. ─────────────────────────── */}
            {ritualHabits.length === 0 && (
              <div style={{ ...stackCardStyle, background: "rgba(255,255,255,0.6)", borderStyle: "dashed", padding: "12px 16px" }}>
                <div style={stackHeadStyle}>
                  <span style={stackTitleStyle}>Morning stack</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif", margin: "4px 0 0", fontStyle: "italic", lineHeight: 1.4 }}>
                  Log a few habits in Track and they'll surface here as a checkable stack.
                </p>
              </div>
            )}
            {ritualHabits.length > 0 && (
              <div style={stackCardStyle}>
                <div style={stackHeadStyle}>
                  <span style={stackTitleStyle}>Morning stack</span>
                  <span style={stackCountStyle}>{Object.values(todayHabitLogs).filter(Boolean).length}/{ritualHabits.length}</span>
                </div>
                {ritualHabits.map((name, i) => {
                  const done = !!todayHabitLogs[name];
                  return (
                    <div key={i} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(74,42,58,0.06)" }}>
                      <button onClick={() => toggleHabit(name)} style={{ ...ritualRowStyle, borderTop: "none" }}>
                        <div style={{ ...ritualCheckStyle, background: done ? "var(--rose-primary, #D45E52)" : "transparent", borderColor: done ? "var(--rose-primary, #D45E52)" : "rgba(74,42,58,0.20)" }}>
                          {done && <Check size={12} style={{ color: "white" }} />}
                        </div>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <p style={{ ...ritualNameStyle, textDecoration: done ? "line-through" : "none", color: done ? "var(--plum-2, #6B4559)" : "var(--plum, #4A2A3A)" }}>{name}</p>
                        </div>
                      </button>
                      {!done && !quietModeActive && (stuckDaysByHabit[name] || 0) >= STUCK_DAYS_THRESHOLD && (
                        <div style={{ padding: "0 8px 8px 34px" }}>
                          <RitualReframeShimmer ritualName={name} phase={selectedPhase} state="stuck" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Ritual bundles carousel (Phase 2 BUILD 5) ────────────────
                Phase-keyed bundles below the morning stack. Tapping a
                bundle adds its rituals to HabitLogs for the selected day,
                stamped with time_of_day so they route to morning/evening
                stacks on next render. Non-cycle stages get a single
                "Wellbeing" bundle instead of the 4-phase set. ───────── */}
            <RitualBundlesCarousel
              userId={user?.id}
              selectedDateStr={selectedStr}
              currentPhase={selectedPhase}
              plannerConfig={plannerConfig}
              onRitualsAdded={async () => {
                try {
                  const habits = await base44.entities.HabitLogs.filter({ user_id: user.id }, "-created_date", 60);
                  setHabitLogs(habits);
                  const today = await base44.entities.HabitLogs.filter({ user_id: user.id, date: selectedStr }, null, 20);
                  const map = {};
                  for (const h of today) {
                    const n = habitNameOf(h);
                    if (n) map[n] = habitCompletedOf(h);
                  }
                  setTodayHabitLogs(map);
                } catch { /* silent */ }
              }}
            />

            {/* ── Evening ritual stack (Phase 2 BUILD 2) ──────────────────
                Mirrors the morning stack but for habits whose recent logs
                are tagged time_of_day = "evening" / "night" (or inferred
                from habit name when no tag is present). Renders only when
                at least one evening habit exists; empty-state is silent
                so the page doesn't grow vertical clutter for users who
                only run a morning routine. ─────────────────────────────── */}
            {eveningRitualHabits.length > 0 && (
              <div style={stackCardStyle}>
                <div style={stackHeadStyle}>
                  <span style={stackTitleStyle}>Evening stack</span>
                  <span style={stackCountStyle}>{eveningRitualHabits.filter(n => todayHabitLogs[n]).length}/{eveningRitualHabits.length}</span>
                </div>
                {eveningRitualHabits.map((name, i) => {
                  const done = !!todayHabitLogs[name];
                  return (
                    <div key={i} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(74,42,58,0.06)" }}>
                      <button onClick={() => toggleHabit(name, "evening")} style={{ ...ritualRowStyle, borderTop: "none" }}>
                        <div style={{ ...ritualCheckStyle, background: done ? "var(--plum, #4A2A3A)" : "transparent", borderColor: done ? "var(--plum, #4A2A3A)" : "rgba(74,42,58,0.20)" }}>
                          {done && <Check size={12} style={{ color: "white" }} />}
                        </div>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <p style={{ ...ritualNameStyle, textDecoration: done ? "line-through" : "none", color: done ? "var(--plum-2, #6B4559)" : "var(--plum, #4A2A3A)" }}>{name}</p>
                        </div>
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={() => { setAddMode("habit"); setShowAdd(true); }}
                  style={addToStackBtnStyle}
                  aria-label="Add to evening stack"
                >
                  + add to evening stack
                </button>
              </div>
            )}

            {/* ── Smart card 4: Meals row ──────────────────────────────── */}
            {dayMeals && (dayMeals.breakfast || dayMeals.lunch || dayMeals.dinner) ? (
              <div style={{ marginBottom: 12 }}>
                <p style={dividerStyle}>Meals</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["breakfast", "lunch", "dinner"].map(slot =>
                    dayMeals[slot] ? (
                      <div key={slot} style={mealRowStyle}>
                        <span style={mealTimeStyle}>{slot}</span>
                        <p style={mealNameStyle}>{typeof dayMeals[slot] === "string" ? dayMeals[slot] : dayMeals[slot]?.name || ""}</p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ) : null}

            {/* ── Medications (Phase 2 BUILD 4) ───────────────────────────
                Sits in the commitments band — name + dose + time + tap to
                mark taken/skipped. Soft empty state nudges into the FAB
                Medication satellite. Reads/writes MedicationReminders;
                entity-missing accounts see the empty hint silently. */}
            <div style={{ marginBottom: 12 }}>
              <p style={dividerStyle}>Medications</p>
              {medications.length === 0 ? (
                <p style={{ fontSize: 11.5, color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif", fontStyle: "italic", margin: "0 0 4px", textAlign: "center", padding: "10px 8px", border: "1px dashed rgba(74,42,58,0.12)", borderRadius: 12 }}>
                  No medications logged — add one ↑
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {medications.map(med => {
                    const name = med.medication_name || med.name || "Medication";
                    const dose = med.dosage || med.dose || null;
                    const time = med.reminder_time || med.time || null;
                    const taken = !!med.is_taken;
                    return (
                      <div key={med.id} style={{ ...listItemStyle, opacity: taken ? 0.55 : 1, padding: "10px 12px" }}>
                        <button onClick={() => toggleMedTaken(med)} style={{ ...checkBtnStyle, borderColor: taken ? "var(--rose-primary, #D45E52)" : "var(--border, rgba(74,42,58,0.16))", backgroundColor: taken ? "var(--rose-primary, #D45E52)" : "transparent" }}>
                          {taken && <Check className="w-3 h-3" style={{ color: "white" }} />}
                        </button>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                          <Pill className="w-4 h-4" style={{ color: "var(--plum-mute, #8A7584)", flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--plum, #4A2A3A)", fontFamily: "'Inter', sans-serif", textDecoration: taken ? "line-through" : "none", margin: 0, lineHeight: 1.2 }}>
                              {name}{dose ? ` · ${dose}` : ""}
                            </p>
                            {time && (
                              <span style={{ fontSize: 10.5, color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif", display: "inline-flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                                <Clock className="w-3 h-3" />{time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Commitments — PlannerItems + PersonalTasks unified ───── */}
            {dayItems.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif", textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>
                Nothing more on the list. Tap + to add something.
              </p>
            ) : (
              <>
                <p style={dividerStyle}>On your list</p>
                <div className="space-y-3">
                  {dayItems.map(item => {
                    const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.reminder;
                    return (
                      <div key={`${item._source}-${item.id}`} style={{ ...listItemStyle, opacity: item.is_completed ? 0.55 : 1 }}>
                        <button onClick={() => toggleComplete(item)} style={{ ...checkBtnStyle, borderColor: item.is_completed ? "var(--rose-primary, #D45E52)" : "var(--border, rgba(74,42,58,0.16))", backgroundColor: item.is_completed ? "var(--rose-primary, #D45E52)" : "transparent" }}>
                          {item.is_completed && <Check className="w-3 h-3" style={{ color: "white" }} />}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum, #4A2A3A)", fontFamily: "'Inter', sans-serif", textDecoration: item.is_completed ? "line-through" : "none", marginBottom: 4 }}>{item.title}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, fontWeight: 600, backgroundColor: cat.bg, color: cat.color, borderRadius: 9999, padding: "2px 8px", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{item.category}</span>
                            {item.time && (
                              <span style={{ fontSize: 11, color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
                                <Clock className="w-3 h-3" />{item.time}
                              </span>
                            )}
                            {item.repeat && item.repeat !== "once" && (
                              <span style={{ fontSize: 10, color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif" }}>↻ {item.repeat}</span>
                            )}
                          </div>
                          {item.notes && <p style={{ fontSize: 12, color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif", marginTop: 4, lineHeight: 1.5 }}>{item.notes}</p>}
                        </div>
                        <button onClick={() => deleteItem(item)} aria-label="Delete" style={{ color: "var(--plum-mute, #8A7584)", background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Fallback empty hint when literally nothing on the day */}
            {!dailyPlan && !activeProgram && ritualHabits.length === 0 && eveningRitualHabits.length === 0 && !dayMeals && dayItems.length === 0 && medications.length === 0 && (
              <div style={{ textAlign: "center", padding: "44px 24px" }}>
                <Calendar className="w-9 h-9 mx-auto mb-3" style={{ color: "var(--rose-primary, #D45E52)", opacity: 0.5 }} />
                <p style={{ fontSize: 15, fontWeight: 500, color: "var(--plum, #4A2A3A)", fontFamily: "'Fraunces', Georgia, serif", marginBottom: 4 }}>A soft, open day</p>
                <p style={{ fontSize: 12, color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif" }}>Tap + to add anything you want to make space for.</p>
              </div>
            )}

            {/* ── Warmth bundle Today surfaces (Phase 2 C9) ──────────────── */}
            {/* PacingBankCard moved to Cycle tab SavedRhythmsCarousel in A2-3. */}
            <TonightCard profile={profile} onGoToDiary={goToDoctorDiary} />
            <ShutdownRitualCard />
          </>
        )}
      </div>
      )}

      {/* FAB — Today view only; Cycle view is read-only on C0.
          Phase 2 BUILD 3: tapping the FAB now expands a 5-way satellite
          menu — Task · Habit · Medication · Ritual · Journal. Each satellite
          sets the addMode and opens the appropriate form (Journal navigates
          out to /Journal). Tap outside the satellites or the FAB itself
          collapses the menu. */}
      {view === "today" && (
        <>
          {fabOpen && (
            <div
              onClick={() => setFabOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 28, background: "rgba(74,42,58,0.18)", backdropFilter: "blur(2px)" }}
              aria-hidden="true"
            />
          )}
          <div style={{ position: "fixed", bottom: 96, right: 20, zIndex: 30, display: "flex", flexDirection: "column-reverse", alignItems: "flex-end", gap: 10 }}>
            <button
              onClick={() => setFabOpen(o => !o)}
              aria-label={fabOpen ? "Close add menu" : "Add to planner"}
              aria-expanded={fabOpen}
              style={{ width: 52, height: 52, borderRadius: 9999, backgroundColor: "var(--rose-primary, #D45E52)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(212,94,82,0.36)", transition: "transform 180ms", transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)" }}
            >
              <Plus className="w-6 h-6" />
            </button>
            {fabOpen && (
              <>
                {[
                  { key: "task",       label: "Task",       Icon: ListTodo, onClick: () => { setAddMode("task");     setNewItem({ title: "", category: "personal", time: "", repeat: "once",  notes: "", date: selectedStr }); setFabOpen(false); setShowAdd(true); } },
                  { key: "habit",      label: "Habit",      Icon: Repeat,   onClick: () => { setAddMode("habit");    setNewItem({ title: "", category: "wellbeing", time: "", repeat: "daily", notes: "", date: selectedStr }); setFabOpen(false); setShowAdd(true); } },
                  { key: "medication", label: "Medication", Icon: Pill,     onClick: () => { setMedForm({ name: "", time: "", dose: "", notes: "", date: selectedStr }); setFabOpen(false); setShowMedAdd(true); } },
                  { key: "ritual",     label: "Ritual",     Icon: Sparkles, onClick: () => { setAddMode("ritual");   setNewItem({ title: "", category: "wellbeing", time: "", repeat: "daily", notes: "", date: selectedStr }); setFabOpen(false); setShowAdd(true); } },
                  { key: "journal",    label: "Journal",    Icon: BookHeart, onClick: () => { setFabOpen(false); navigate(`/Journal?date=${selectedStr}`); } },
                ].map(({ key, label, Icon, onClick }) => (
                  <button
                    key={key}
                    onClick={onClick}
                    aria-label={`Add ${label.toLowerCase()}`}
                    style={fabSatelliteStyle}
                  >
                    <span style={fabSatelliteLabelStyle}>{label}</span>
                    <span style={fabSatelliteIconStyle}>
                      <Icon className="w-4 h-4" />
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}

      {/* Add item bottom sheet (unchanged structure, restyled) */}
      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(74,42,58,0.4)", backdropFilter: "blur(4px)" }} />
          {/* Phase 2 QA-fix-bundle-11 — bottom padding must clear the
              bottom nav bar (≈64-72px) + iOS safe area, otherwise the
              "Add to planner" CTA at the bottom of the sheet is hidden
              behind the nav. calc(80px + env(safe-area-inset-bottom))
              gives ~12px breathing room above the nav on all devices. */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, backgroundColor: "var(--surface, #FFFFFF)", borderRadius: "24px 24px 0 0", padding: "20px 20px calc(80px + env(safe-area-inset-bottom, 0px))", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 500, color: "var(--plum, #4A2A3A)", margin: 0 }}>
                {addMode === "habit"  ? "Add a habit"
                 : addMode === "ritual" ? "Add a ritual"
                 : "Add to planner"}
              </h2>
              <button onClick={() => setShowAdd(false)} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 9999, backgroundColor: "var(--cream-2, #FFF5EC)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X className="w-4 h-4" style={{ color: "var(--plum-mute, #8A7584)" }} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                autoFocus
                placeholder="What do you want to make space for?"
                value={newItem.title}
                onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                style={inputStyle}
              />

              <div>
                <p style={fieldLabelStyle}>Category</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CATEGORIES.map(cat => {
                    const c = CATEGORY_COLORS[cat];
                    const active = newItem.category === cat;
                    return (
                      <button key={cat} onClick={() => setNewItem(p => ({ ...p, category: cat }))}
                        style={{ borderRadius: 9999, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize", border: "1.5px solid", backgroundColor: active ? c.bg : "transparent", borderColor: active ? c.color : "var(--border, rgba(74,42,58,0.16))", color: active ? c.color : "var(--plum-mute, #8A7584)" }}>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sprint 6B Feature 1 — Date row. Defaults to the strip's
                  selected day (set at modal open). Shows an inline warn
                  hint when a past date is picked. Native input keeps the
                  picker minimal + platform-native. */}
              <div>
                <p style={fieldLabelStyle}>Date</p>
                <input
                  type="date"
                  value={newItem.date || selectedStr}
                  onChange={e => setNewItem(p => ({ ...p, date: e.target.value }))}
                  style={inputStyle}
                />
                {(() => {
                  const chosen = newItem.date || selectedStr;
                  const todayStr = toDateStr(today);
                  if (chosen < todayStr) {
                    return (
                      <p style={{ fontSize: 11, color: "#A6862B", fontFamily: "'Inter', sans-serif", marginTop: 4, fontStyle: "italic" }}>
                        This date has passed — add anyway?
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p style={fieldLabelStyle}>Time (optional)</p>
                  <input type="time" value={newItem.time} onChange={e => setNewItem(p => ({ ...p, time: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <p style={fieldLabelStyle}>Repeat</p>
                  <select value={newItem.repeat} onChange={e => setNewItem(p => ({ ...p, repeat: e.target.value }))} style={inputStyle}>
                    {/* Sprint 6B Feature 1 — added "weekdays" alongside the
                        existing once/daily/weekly/monthly options. */}
                    <option value="once">None (one-off)</option>
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={newItem.notes}
                onChange={e => setNewItem(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                style={{ ...inputStyle, resize: "none" }}
              />

              <button
                onClick={handleAdd}
                disabled={!newItem.title.trim() || saving}
                style={{ width: "100%", height: 48, borderRadius: 9999, backgroundColor: "var(--rose-primary, #D45E52)", color: "white", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: (!newItem.title.trim() || saving) ? 0.5 : 1 }}>
                {saving ? "Saving..." : "Add to planner"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Phase 2 BUILD 3 — Medication bottom sheet. Smaller form: name +
          time + dose + notes. Writes to MedicationReminders entity; the
          entity may not be migrated yet on some accounts (Phase 4 work),
          in which case the save is a no-op and the sheet still closes. */}
      {showMedAdd && (
        <>
          <div onClick={() => setShowMedAdd(false)} style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(74,42,58,0.4)", backdropFilter: "blur(4px)" }} />
          {/* Phase 2 QA-fix-bundle-11 — same nav-clearance padding as the
              main add sheet, so "Save medication" isn't hidden behind the
              bottom nav (Today/Lifestyle/Jess/Profile/Menu) on mobile. */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, backgroundColor: "var(--surface, #FFFFFF)", borderRadius: "24px 24px 0 0", padding: "20px 20px calc(80px + env(safe-area-inset-bottom, 0px))", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 500, color: "var(--plum, #4A2A3A)", margin: 0 }}>Add medication</h2>
              <button onClick={() => setShowMedAdd(false)} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 9999, backgroundColor: "var(--cream-2, #FFF5EC)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X className="w-4 h-4" style={{ color: "var(--plum-mute, #8A7584)" }} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                autoFocus
                placeholder="Medication name"
                value={medForm.name}
                onChange={e => setMedForm(p => ({ ...p, name: e.target.value }))}
                style={inputStyle}
              />
              {/* Sprint 6B Feature 1 — date row on medication form. */}
              <div>
                <p style={fieldLabelStyle}>Date</p>
                <input
                  type="date"
                  value={medForm.date || selectedStr}
                  onChange={e => setMedForm(p => ({ ...p, date: e.target.value }))}
                  style={inputStyle}
                />
                {(() => {
                  const chosen = medForm.date || selectedStr;
                  const todayStr = toDateStr(today);
                  if (chosen < todayStr) {
                    return (
                      <p style={{ fontSize: 11, color: "#A6862B", fontFamily: "'Inter', sans-serif", marginTop: 4, fontStyle: "italic" }}>
                        This date has passed — add anyway?
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p style={fieldLabelStyle}>Time</p>
                  <input type="time" value={medForm.time} onChange={e => setMedForm(p => ({ ...p, time: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <p style={fieldLabelStyle}>Dose (optional)</p>
                  <input placeholder="e.g. 200mg" value={medForm.dose} onChange={e => setMedForm(p => ({ ...p, dose: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <textarea
                placeholder="Notes (optional)"
                value={medForm.notes}
                onChange={e => setMedForm(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                style={{ ...inputStyle, resize: "none" }}
              />
              <button
                onClick={handleSaveMed}
                disabled={!medForm.name.trim() || savingMed}
                style={{ width: "100%", height: 48, borderRadius: 9999, backgroundColor: "var(--rose-primary, #D45E52)", color: "white", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: (!medForm.name.trim() || savingMed) ? 0.5 : 1 }}>
                {savingMed ? "Saving..." : "Save medication"}
              </button>
            </div>
          </div>
        </>
      )}
      </div>{/* /Le Menu z-index wrapper */}

      {/* ── Morning Brief bottom-sheet overlay ────────────────────────────
          Triggered by the "Plan today" pill near the phase pill. Sits
          above the bottom nav at ~85vh. Tap backdrop or X to dismiss.
          When the brief reaches Step 6 (Summary), onComplete fires the
          markBriefCompleted helper which stamps localStorage and
          auto-dismisses the sheet after 1.5s so the confetti lands. */}
      {briefOpen && (
        <>
          <div
            onClick={() => setBriefOpen(false)}
            aria-hidden="true"
            style={{
              position: "fixed", inset: 0, zIndex: 90,
              background: "rgba(58,44,26,0.45)",
              backdropFilter: "blur(6px)",
              animation: "fwBriefBackdropIn 220ms ease-out",
            }}
          />
          <div
            role="dialog"
            aria-label="Morning Brief"
            style={{
              position: "fixed", left: 0, right: 0, bottom: 0,
              zIndex: 91,
              height: "85vh", maxHeight: "85vh",
              background: "var(--femwell-cream, #F4EDDB)",
              borderRadius: "24px 24px 0 0",
              boxShadow: "0 -16px 48px rgba(58,44,26,0.22)",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              animation: "fwBriefSheetIn 320ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          >
            <div style={{
              display: "flex", justifyContent: "center", padding: "10px 0 4px",
              flexShrink: 0,
            }}>
              <div style={{
                width: 38, height: 4, borderRadius: 9999,
                background: "rgba(58,44,26,0.18)",
              }} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 12px 24px" }}>
              <PlanADaySheet
                profile={profile}
                onClose={() => setBriefOpen(false)}
                onComplete={markBriefCompleted}
              />
            </div>
          </div>
          <style>{`
            @keyframes fwBriefBackdropIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes fwBriefSheetIn { from { transform: translateY(100%) } to { transform: translateY(0) } }
          `}</style>
        </>
      )}
    </div>
  );
}

// ─── Inline style tokens (kept here for surgical patches; would migrate to CSS module in Phase 2) ──
const navBtnStyle = { width: 28, height: 28, borderRadius: 9999, border: "1px solid var(--border, rgba(74,42,58,0.10))", backgroundColor: "var(--surface, #FFFFFF)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 };

const smartLabelStyle = { fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--plum-mute, #8A7584)", fontWeight: 700, fontFamily: "'Inter', sans-serif", display: "inline-flex", alignItems: "center" };
const phaseChipStyle = { fontSize: 9, padding: "3px 8px", borderRadius: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, fontFamily: "'Inter', sans-serif" };

const intentionCardStyle = { background: "#FFFFFF", border: "1px solid rgba(74,42,58,0.08)", borderRadius: 16, padding: "16px 16px 14px", marginBottom: 12, boxShadow: "0 2px 8px rgba(74,42,58,0.04)" };
const intentionMainStyle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontStyle: "italic", color: "var(--plum, #4A2A3A)", fontWeight: 500, lineHeight: 1.32, margin: "0 0 6px" };
const intentionSubStyle = { fontSize: 13, color: "var(--plum-2, #6B4559)", fontFamily: "'Inter', sans-serif", lineHeight: 1.5, margin: 0 };

const programCardStyle = { position: "relative", background: "linear-gradient(135deg, rgba(138,95,116,0.15), rgba(201,169,92,0.10))", border: "1px solid rgba(138,95,116,0.18)", borderRadius: 16, padding: "14px 16px", marginBottom: 12, overflow: "hidden" };
const programEyebrowStyle = { fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--plum-mute, #8A7584)", fontWeight: 700, marginBottom: 8, fontFamily: "'Inter', sans-serif" };
const programNameStyle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: "var(--plum, #4A2A3A)", lineHeight: 1.2, margin: 0 };
const programDayStyle = { fontSize: 12, color: "var(--plum-2, #6B4559)", fontFamily: "'Inter', sans-serif", marginTop: 4 };
const programCtaStyle = { fontSize: 12, color: "var(--plum, #4A2A3A)", fontWeight: 700, background: "var(--cream, #FFFAF5)", padding: "7px 14px", borderRadius: 9999, flexShrink: 0, textDecoration: "none", fontFamily: "'Inter', sans-serif" };
const programProgressOuterStyle = { height: 4, background: "rgba(255,250,245,0.6)", borderRadius: 4, marginTop: 10, overflow: "hidden" };
const programProgressFillStyle = { height: "100%", background: "var(--plum, #4A2A3A)", borderRadius: 4, transition: "width 240ms" };

const stackCardStyle = { background: "#FFFFFF", border: "1px solid rgba(74,42,58,0.08)", borderRadius: 16, padding: "14px 16px", marginBottom: 12 };
const stackHeadStyle = { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 };
const stackTitleStyle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500, color: "var(--plum, #4A2A3A)" };
const stackCountStyle = { fontSize: 10, color: "var(--plum-mute, #8A7584)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, fontFamily: "'Inter', sans-serif" };
const ritualRowStyle = { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", border: "none", background: "transparent", width: "100%", cursor: "pointer" };
const ritualCheckStyle = { width: 22, height: 22, borderRadius: 9999, border: "1.5px solid", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 120ms" };
const ritualNameStyle = { fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", lineHeight: 1.2, margin: 0 };
const addToStackBtnStyle = { marginTop: 8, padding: "8px 12px", background: "transparent", border: "1px dashed rgba(74,42,58,0.22)", borderRadius: 9999, fontSize: 11, fontWeight: 600, color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif", cursor: "pointer", letterSpacing: "0.04em" };

// Phase 2 BUILD 3 — FAB satellite buttons (Task / Habit / Medication / Ritual / Journal).
const fabSatelliteStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 0,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  animation: "fab-pop 200ms ease both",
};
const fabSatelliteLabelStyle = {
  background: "var(--surface, #FFFFFF)",
  color: "var(--plum, #4A2A3A)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 12px",
  borderRadius: 9999,
  border: "1px solid rgba(74,42,58,0.10)",
  boxShadow: "0 2px 8px rgba(74,42,58,0.10)",
};
const fabSatelliteIconStyle = {
  width: 42,
  height: 42,
  borderRadius: 9999,
  backgroundColor: "var(--plum, #4A2A3A)",
  color: "var(--cream, #FFFAF5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 14px rgba(74,42,58,0.28)",
  flexShrink: 0,
};

const dividerStyle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 13, color: "var(--plum, #4A2A3A)", fontWeight: 500, margin: "16px 0 8px" };

const mealRowStyle = { display: "flex", alignItems: "center", gap: 12, background: "#FFFFFF", border: "1px solid rgba(74,42,58,0.06)", borderRadius: 12, padding: "10px 12px" };
const mealTimeStyle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 10, color: "var(--plum-mute, #8A7584)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, minWidth: 70 };
const mealNameStyle = { fontSize: 13, color: "var(--plum, #4A2A3A)", fontWeight: 600, fontFamily: "'Inter', sans-serif", margin: 0, lineHeight: 1.2 };

const listItemStyle = { backgroundColor: "var(--surface, #FFFFFF)", border: "1px solid var(--border, rgba(74,42,58,0.08))", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12, transition: "opacity 0.2s" };
const checkBtnStyle = { width: 22, height: 22, borderRadius: 9999, border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", marginTop: 1, transition: "all 120ms" };

const inputStyle = { width: "100%", border: "1.5px solid var(--border, rgba(74,42,58,0.16))", borderRadius: 12, padding: "11px 14px", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum, #4A2A3A)", backgroundColor: "var(--cream, #FFFAF5)", outline: "none", boxSizing: "border-box" };
const fieldLabelStyle = { fontSize: 11, fontWeight: 600, color: "var(--plum-mute, #8A7584)", textTransform: "uppercase", letterSpacing: "0.10em", fontFamily: "'Inter', sans-serif", marginBottom: 8 };

// ── Cycle-view stubs (C0 placeholders; C1+ populates each section) ──────────
const cycleStubStyle = { background: "#FFFFFF", border: "1px solid rgba(74,42,58,0.08)", borderRadius: 16, padding: "16px 16px 14px", marginBottom: 12, boxShadow: "0 2px 8px rgba(74,42,58,0.04)" };
const cycleStubTitleStyle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500, color: "var(--plum, #4A2A3A)", margin: "0 0 4px" };
const cycleStubBodyStyle = { fontSize: 13, color: "var(--plum-2, #6B4559)", fontFamily: "'Inter', sans-serif", lineHeight: 1.5, margin: 0 };

// ── 7-day energy summary (Phase 2 BUILD 1) ─────────────────────────────────
const energySummaryStyle = {
  marginTop: 10,
  textAlign: "center",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--plum-mute, #8A7584)",
  letterSpacing: "0.02em",
};
const energyDotSep = {
  color: "rgba(74,42,58,0.30)",
  margin: "0 2px",
};

// ── Cross-tab toast banner ──────────────────────────────────────────────────
const toastStyle = {
  margin: "10px auto 0",
  maxWidth: 560,
  padding: "10px 14px",
  borderRadius: 12,
  background: "rgba(74,42,58,0.92)",
  color: "var(--cream, #FFFAF5)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.01em",
  textAlign: "center",
  boxShadow: "0 8px 24px rgba(74,42,58,0.18)",
};
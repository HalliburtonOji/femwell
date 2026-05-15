import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Calendar, Plus, Clock, Trash2, Check, ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import PlannerTabs, { readInitialView, writeStoredView, resolveViewId } from "@/components/planner/PlannerTabs";
import ConfidencePill from "@/components/planner/ConfidencePill";
import CapacityTaxBar, { deriveCapacity, derivePredictedLoad } from "@/components/planner/cycle/CapacityTaxBar";
import ConsistencyCard from "@/components/planner/cycle/ConsistencyCard";
import CycleMirrorSundayTile from "@/components/planner/cycle/CycleMirrorSundayTile";
import DoctorReadyDiaryCard from "@/components/planner/cycle/DoctorReadyDiaryCard";
import MonthRibbon from "@/components/planner/cycle/MonthRibbon";
import QuietModeBanner from "@/components/planner/cycle/QuietModeBanner";
import SavedRhythmsCarousel from "@/components/planner/cycle/SavedRhythmsCarousel";
import WhatsUnfinishedCard from "@/components/planner/cycle/WhatsUnfinishedCard";
import RitualReframeShimmer from "@/components/planner/today/RitualReframeShimmer";
import SmartViewCard from "@/components/planner/today/SmartViewCard";
import { TonightCard, ShutdownRitualCard } from "@/components/planner/today/WarmthBundleToday";
import { WeekAheadCard, AstraSidecar, PlanMyNextCycleCTA } from "@/components/planner/cycle/WarmthBundleCycle";
import { selectedCrumbToday, selectedCrumbCycle } from "@/components/planner/selectedCrumb";

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

// Phase → dot colour. Mirrors the demo palette (femwell_planner_final.html).
const PHASE_COLORS = {
  menstrual:  "#B84A41", // period
  follicular: "#E67F73",
  ovulatory:  "#F2A99A",
  luteal:     "#8A5F74",
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
  const [activeProgram, setActiveProgram] = useState(null);
  const [habitLogs, setHabitLogs] = useState([]);
  const [todayHabitLogs, setTodayHabitLogs] = useState({});
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", category: "reminder", time: "", repeat: "once", notes: "" });

  const weekDays = getWeekDays(monday);
  const selectedStr = toDateStr(selectedDay);

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
        setActiveProgram(programs[0] || null);
        setHabitLogs(habits);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Day-specific fetches — DailyPlan, MealPlans, today's HabitLog checkmarks.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const day_key = selectedStr;
      const [plans, meals, todayHabits] = await Promise.all([
        base44.entities.DailyPlan.filter({ user_id: user.id, day_key }, null, 1).catch(() => []),
        base44.entities.MealPlans.filter({ user_id: user.id }, "-created_date", 3).catch(() => []),
        base44.entities.HabitLogs.filter({ user_id: user.id, date: day_key }, null, 20).catch(() => []),
      ]);
      if (cancelled) return;
      setDailyPlan(plans[0] || null);
      setMealPlan(meals[0] || null);
      // habit_name → completed boolean, used to check the ritual rows
      const map = {};
      for (const h of todayHabits) {
        if (h?.habit_name) map[h.habit_name] = h.is_completed !== false;
      }
      setTodayHabitLogs(map);
    })();
    return () => { cancelled = true; };
  }, [user?.id, selectedStr]);

  // Top 3 recurring habits — derived from the last 60 HabitLogs.
  const ritualHabits = useMemo(() => {
    const counts = {};
    for (const h of habitLogs) {
      if (!h?.habit_name) continue;
      counts[h.habit_name] = (counts[h.habit_name] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
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
    const created = await base44.entities.PlannerItems.create({
      user_id: user.id,
      title: newItem.title.trim(),
      category: newItem.category,
      date: selectedStr,
      time: newItem.time || null,
      repeat: newItem.repeat,
      notes: newItem.notes || null,
      is_completed: false,
      created_at: new Date().toISOString(),
    });
    setItems(prev => [{ ...created, _source: "planner" }, ...prev]);
    setNewItem({ title: "", category: "reminder", time: "", repeat: "once", notes: "" });
    setShowAdd(false);
    setSaving(false);
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

  const toggleHabit = async (habitName) => {
    if (!user?.id) return;
    const wasOn = !!todayHabitLogs[habitName];
    setTodayHabitLogs(prev => ({ ...prev, [habitName]: !wasOn }));
    // Optimistic; persist a new HabitLog row if turning on, mark existing if off.
    if (!wasOn) {
      try {
        await base44.entities.HabitLogs.create({
          user_id: user.id,
          habit_name: habitName,
          date: selectedStr,
          is_completed: true,
          created_at: new Date().toISOString(),
        });
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

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory, #FFFAF5)" }}>
      {/* ── Sticky header: brand · tabs · (Today-only) week strip ──────────── */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-3" style={{ backgroundColor: "rgba(255,250,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border, rgba(74,42,58,0.08))" }}>
        <div className="max-w-xl mx-auto">
          {/* A2-4 (1+2+3): tab-specific page title + date-stamped Today eyebrow */}
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif" }}>
            {view === "cycle"
              ? "Your cycle"
              : `Today · ${today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}`}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", margin: "4px 0 4px" }}>
            <h1 style={{ fontSize: 28, fontWeight: 500, fontFamily: "'Fraunces', Georgia, serif", color: "var(--plum, #4A2A3A)", letterSpacing: "-0.015em", margin: 0 }}>
              {view === "cycle" ? "Cycle" : "Today"}
            </h1>
            {/* A2-4 (4): confidence pill lifted out of .ph-sub — always renders */}
            <ConfidencePill meta={profile?.cycle_prediction_meta} />
          </div>
          {selectedPhase && selectedCycleDay && (
            <p style={{ fontSize: 12, color: "var(--plum-2, #6B4559)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>
              Day {selectedCycleDay} · <span style={{ color: PHASE_COLORS[selectedPhase], fontWeight: 600 }}>{phaseLabelOf(selectedPhase)}</span>
            </p>
          )}
          {/* A2-4 (5): selected-crumb subtitle — italic plum-mute */}
          <p style={{ fontSize: 11.5, fontStyle: "italic", color: "var(--plum-mute, #8A7584)", fontFamily: "'Inter', sans-serif", marginBottom: 8, lineHeight: 1.45 }}>
            {view === "cycle"
              ? selectedCrumbCycle({ date: today })
              : selectedCrumbToday({ dailyPlan, phase: selectedPhase, date: today })}
          </p>

          <PlannerTabs view={view} onChange={changeView} />

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
        </div>
      </div>

      {/* ── Cross-tab toast (transient) ───────────────────────────────────── */}
      {toastMsg && (
        <div role="status" aria-live="polite" style={toastStyle}>
          {toastMsg.startsWith("deferred:") ? `Deferred ${toastMsg.split(":")[1]} to a steadier window.` : toastMsg}
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
            <MonthRibbon
              profile={profile}
              habitLogs={habitLogs}
              today={today}
              onNavigateToToday={navigateToToday}
            />
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
          <SavedRhythmsCarousel
            profile={profile}
            currentPhase={selectedPhase}
            currentCycleDay={selectedCycleDay}
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
            />
          </div>
          <div ref={(el) => { cycleSectionRefs.current.doctor = el; }}>
            <DoctorReadyDiaryCard user={user} />
          </div>
          <AstraSidecar profile={profile} />
          <PlanMyNextCycleCTA />
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
            {/* ── Quiet Mode banner (Phase 2 C6) — also surfaces on Today ── */}
            <QuietModeBanner
              profile={profile}
              onCleared={() => setProfile(p => p ? { ...p, quiet_mode_until: null } : p)}
            />

            {/* ── Smart View (Phase 2 C5) — adaptive "right now" card ──── */}
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

            {/* ── Smart card 1: Today's intention (DailyPlan) ──────────── */}
            {dailyPlan && (
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

            {/* ── Smart card 3: Morning ritual stack (HabitLogs) ─────── */}
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
            {!dailyPlan && !activeProgram && ritualHabits.length === 0 && !dayMeals && dayItems.length === 0 && (
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

      {/* FAB — Today view only; Cycle view is read-only on C0. */}
      {view === "today" && (
        <button
          onClick={() => setShowAdd(true)}
          aria-label="Add to planner"
          style={{ position: "fixed", bottom: 96, right: 20, width: 52, height: 52, borderRadius: 9999, backgroundColor: "var(--rose-primary, #D45E52)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(212,94,82,0.36)", zIndex: 30 }}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add item bottom sheet (unchanged structure, restyled) */}
      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(74,42,58,0.4)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, backgroundColor: "var(--surface, #FFFFFF)", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 500, color: "var(--plum, #4A2A3A)", margin: 0 }}>Add to planner</h2>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p style={fieldLabelStyle}>Time (optional)</p>
                  <input type="time" value={newItem.time} onChange={e => setNewItem(p => ({ ...p, time: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <p style={fieldLabelStyle}>Repeat</p>
                  <select value={newItem.repeat} onChange={e => setNewItem(p => ({ ...p, repeat: e.target.value }))} style={inputStyle}>
                    {["once", "daily", "weekly", "monthly"].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
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

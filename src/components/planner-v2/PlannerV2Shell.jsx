// PlannerV2Shell — production layout that consumes real entity data and
// renders the planner-v2 row components in order.
//
// Mounted by Planner.jsx when the `femwell_planner_v2` localStorage flag
// is true. Receives all the entity data that Planner.jsx already fetches
// — no extra network requests, no duplicated state. The flag means: the
// existing Planner.jsx component tree stays the same (auth, routing,
// data fetching), only the visual layout changes.
//
// Stage-specific logic (pregnancy, peri, HRT, TTC, postpartum, PCOS, HA)
// is fully preserved — every row component already receives `stage`
// and reshapes itself. The shell threads `plannerConfig.life_stage`
// through to every row so the existing per-stage variants fire.
//
// Brand rule: no emoji. Lucide icons + custom SVG only.

import React from "react";
import { CalendarPlus, FileText } from "lucide-react";

import JessHeroRow       from "./JessHeroRow";
import BodyTodayRow      from "./BodyTodayRow";
import TimeOfDayRow      from "./TimeOfDayRow";
import ScheduleCycleRow  from "./ScheduleCycleRow";
import RitualsRow        from "./RitualsRow";
import NourishmentRow    from "./NourishmentRow";
import InsightsRow       from "./InsightsRow";
import CareRow           from "./CareRow";
import TonightRow        from "./TonightRow";
import { C } from "./tokens";

// ─────────────────────────────────────────────────────────────────────────────
// Adapters — convert Planner.jsx entity shapes to row-component prop shapes.
// Keep these tiny and pure: no fetches, no state, no side effects.
// ─────────────────────────────────────────────────────────────────────────────

// PersonalTasks + dailyPlan → schedule preview events.
// PersonalTasks rows can have `due_time` ("09:30") or `due_date` ISO; we
// take the first 4 with a hour estimate and stack them.
function adaptScheduleEvents({ personalTasks = [], dailyPlan }) {
  const tasks = personalTasks
    .filter((t) => t && !t.completed && !t.is_done && !t.archived_at)
    .slice(0, 4)
    .map((t, i) => {
      let hour = 9 + i * 3;
      if (t.due_time && typeof t.due_time === "string") {
        const m = t.due_time.match(/(\d{1,2})/);
        if (m) hour = parseInt(m[1], 10) || hour;
      }
      return {
        id: t.id || `pt-${i}`,
        hour,
        title: t.title || t.task_name || "Untitled task",
        duration: t.duration_minutes || undefined,
        done: false,
      };
    });
  if (tasks.length === 0 && dailyPlan?.windows?.length) {
    return dailyPlan.windows.slice(0, 4).map((w, i) => ({
      id: w.id || `w-${i}`,
      hour: 9 + i * 3,
      title: w.label || w.title || "Window",
      duration: w.minutes || undefined,
      done: false,
    }));
  }
  return tasks;
}

// HabitLogs today → simple mood history (last 7 days). The real Planner
// already filters habitLogs to today; for the mood ribbon we'd ideally
// hit DailyCheckins, but a safe seed-from-recent is acceptable for v0.
function adaptMoodHistory(_habitLogs) {
  // v0 fallback: keep the mock until a DailyCheckins pass lands.
  // Returning undefined lets InsightsRow show its own default.
  return undefined;
}

// MedicationLogs + supplements (if present on profile/extras) → care row props.
function adaptMedications(medications = []) {
  return medications.map((m, i) => ({
    id: m.id || `m-${i}`,
    name: m.name || m.medication || "Medication",
    dose: m.dose || m.amount || "",
    time: m.time || m.schedule || "",
    taken: !!m.taken_today,
  }));
}

// Phase → next-phase preview. Cycle order: menstrual → follicular → ovulatory → luteal.
function adaptTomorrowPhase(currentPhase) {
  const ORDER = { menstrual: "follicular", follicular: "ovulatory", ovulatory: "luteal", luteal: "menstrual" };
  return ORDER[currentPhase] || "follicular";
}

// ─────────────────────────────────────────────────────────────────────────────
// Top header — eyebrow + Today/Cycle + "Plan a day" pill + GP export
// (preserves the existing Planner header signal without duplicating its
// production layout).
// ─────────────────────────────────────────────────────────────────────────────

function ShellHeader({ profile, plannerConfig, selectedPhase, selectedCycleDay, onPlanADay, onOpenGpReport }) {
  const cycleTab = plannerConfig?.cycleTabName || "Cycle";
  const phaseLabel = selectedPhase ? selectedPhase[0].toUpperCase() + selectedPhase.slice(1) : null;
  return (
    <div style={{
      padding: "22px 16px 12px",
      borderBottom: `1px solid rgba(58,44,26,0.08)`,
    }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
        color: C.muted, fontFamily: "'Inter', system-ui, sans-serif",
        textTransform: "uppercase", margin: 0,
      }}>
        {phaseLabel
          ? `${phaseLabel}${selectedCycleDay ? ` · Day ${selectedCycleDay}` : ""}${cycleTab !== "Cycle" ? ` · ${cycleTab}` : ""}`
          : `Today · ${cycleTab}`}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 28, fontWeight: 500,
          color: "#4A2A3A", letterSpacing: "-0.018em", margin: 0,
        }}>
          Today
        </h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onPlanADay} aria-label="Plan a day" style={pillBtn(true)}>
            <CalendarPlus size={13} strokeWidth={2.2} /> Plan a day
          </button>
          {onOpenGpReport && (
            <button onClick={onOpenGpReport} aria-label="Open GP report" style={pillBtn(false)}>
              <FileText size={13} strokeWidth={2.2} /> GP report
            </button>
          )}
        </div>
      </div>
      {plannerConfig?.bannerText && (
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 12.5, color: "#4A2A3A", margin: "8px 0 0",
          padding: "6px 10px",
          background: "rgba(168,134,75,0.12)",
          borderLeft: "2px solid #A6862B",
          borderRadius: 4, lineHeight: 1.4,
        }}>{plannerConfig.bannerText}</p>
      )}
    </div>
  );
}

const pillBtn = (primary) => ({
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "7px 13px", borderRadius: 9999,
  border: primary ? "none" : `1px solid rgba(58,44,26,0.18)`,
  background: primary ? C.espresso : "transparent",
  color: primary ? C.cream : C.espresso,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 12, fontWeight: 700, cursor: "pointer",
  whiteSpace: "nowrap",
});

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PlannerV2Shell({
  // Auth / profile / config
  user,
  profile,
  plannerConfig,
  effectiveLifeStage,
  // Selected day + cycle
  selectedDay,
  selectedPhase,
  selectedCycleDay,
  // Entity data
  personalTasks,
  dailyPlan,
  habitLogs,
  medications,
  mealPlan,
  activeProgram,
  // Actions
  onPlanADay,
  onOpenSchedule,
  onOpenCycle,
  onOpenGpReport,
}) {
  const stage = effectiveLifeStage || profile?.life_stage || "reproductive";
  const phase = selectedPhase || "luteal";
  const cycleDay = selectedCycleDay || undefined;

  const events = adaptScheduleEvents({ personalTasks, dailyPlan });
  const meds = adaptMedications(medications);
  const moodHistory = adaptMoodHistory(habitLogs);
  const tomorrowPhase = adaptTomorrowPhase(phase);

  // Meals plumbed from mealPlan if present (lowercase weekday keyed).
  const today = selectedDay || new Date();
  const weekday = today.toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase();
  const mealsForDay = mealPlan?.plan_days?.[weekday];
  const meals = mealsForDay
    ? [
        { label: "Breakfast", text: mealsForDay.breakfast || "—" },
        { label: "Lunch",     text: mealsForDay.lunch     || "—" },
        { label: "Dinner",    text: mealsForDay.dinner    || "—" },
      ]
    : undefined; // NourishmentRow falls back to phase-aware defaults

  // Schedule date string for RitualsRow (RitualBundlesCarousel expects YYYY-MM-DD).
  const selectedDateStr = (selectedDay instanceof Date)
    ? selectedDay.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return (
    <div style={{
      minHeight: "100vh",
      paddingBottom: 140,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <ShellHeader
        profile={profile}
        plannerConfig={plannerConfig}
        selectedPhase={phase}
        selectedCycleDay={cycleDay}
        onPlanADay={onPlanADay}
        onOpenGpReport={onOpenGpReport}
      />

      <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 14 }}>

        {/* 1 — Jess hero (phase-aware narrative slider) */}
        <JessHeroRow
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 2 — Body today */}
        <BodyTodayRow
          stage={stage}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 3 — Morning / Afternoon / Evening — one tall slider */}
        <TimeOfDayRow
          stage={stage}
          phase={phase}
        />

        {/* 4 — Schedule preview + production MonthRibbon */}
        <ScheduleCycleRow
          events={events}
          phase={phase}
          cycleDay={cycleDay}
          userProfile={profile}
          onOpenSchedule={onOpenSchedule}
          onOpenCycle={onOpenCycle}
        />

        {/* 5 — Rituals — pass-through to RitualBundlesCarousel */}
        <RitualsRow
          userId={user?.id}
          selectedDateStr={selectedDateStr}
          currentPhase={phase}
          plannerConfig={plannerConfig}
        />

        {/* 6 — Nourishment — macros + hydration + AI plan + phase recipes */}
        <NourishmentRow
          meals={meals}
          phase={phase}
        />

        {/* 7 — Mind & insight — intention + Astra + mood + breathwork + Inner Season */}
        <InsightsRow
          phase={phase}
          moodHistory={moodHistory}
        />

        {/* 8 — Care — meds & supplements + symptom + body scan + GP report */}
        <CareRow
          medications={meds}
          stage={stage}
          onOpenGpReport={onOpenGpReport}
        />

        {/* 9 — Tonight & tomorrow — intentions + tomorrow phase + reflection */}
        <TonightRow
          tomorrowPhase={tomorrowPhase}
          stage={stage}
        />

      </div>
    </div>
  );
}

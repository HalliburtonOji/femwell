// PlannerV2Shell — production renderer of UnifiedPlannerDemo's layout.
//
// Visual rule: this shell MUST render the same DOM tree and styles as
// UnifiedPlannerDemo. The only differences are:
//   1. Real entity data is fed to each row.
//   2. The demo's Stage / Phase dev pickers are replaced by the production
//      DevStageSwitcher (sits in the same bottom dev-controls slot the
//      demo uses).
//   3. The demo's "v2 row test harness" eyebrow + designer h1 are swapped
//      for production-appropriate phase + cycleDay eyebrow + "Today" h1.
//
// Life-stage and condition rows are ADDITIVE — they insert content
// between BodyTodayRow and TimeOfDayRow without changing the rest of
// the layout. Reproductive users with no conditions see exactly the
// demo's 9 rows in their original order.

import React from "react";
import { Sparkles } from "lucide-react";
import DevStageSwitcher from "@/components/planner/DevStageSwitcher";

import JessHeroRow       from "./JessHeroRow";
import BodyTodayRow      from "./BodyTodayRow";
import TimeOfDayRow      from "./TimeOfDayRow";
import ScheduleCycleRow  from "./ScheduleCycleRow";
import RitualsRow        from "./RitualsRow";
import NourishmentRow    from "./NourishmentRow";
import InsightsRow       from "./InsightsRow";
import CareRow           from "./CareRow";
import TonightRow        from "./TonightRow";
import StageRow          from "./StageRows";
import ConditionRow      from "./ConditionRows";
import { C } from "./tokens";

// ─── Adapters ───────────────────────────────────────────────────────────────

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

function adaptMedications(medications = []) {
  return medications.map((m, i) => ({
    id: m.id || `m-${i}`,
    name: m.name || m.medication || "Medication",
    dose: m.dose || m.amount || "",
    time: m.time || m.schedule || "",
    taken: !!m.taken_today,
  }));
}

function adaptTomorrowPhase(currentPhase) {
  const ORDER = { menstrual: "follicular", follicular: "ovulatory", ovulatory: "luteal", luteal: "menstrual" };
  return ORDER[currentPhase] || "follicular";
}

// ─── Shell hero ─────────────────────────────────────────────────────────────
//
// This component IS the demo's DemoHeader. Same gradient, same padding,
// same border, same eyebrow style, same h1 style, same paragraph style,
// same bottom dev-controls flex row. Only the content varies.

function ShellHero({
  phase, cycleDay,
  effectiveStage, realStage, effectiveConditions, realConditions,
  onStageChange, onConditionsChange, profileId, onProfileUpdated,
}) {
  const phaseLabel = phase ? phase[0].toUpperCase() + phase.slice(1) : null;
  const eyebrowText = phaseLabel
    ? `${phaseLabel}${cycleDay ? ` · DAY ${cycleDay}` : ""}`
    : "Today";

  return (
    <div style={{
      padding: "24px 16px 14px",
      background: `linear-gradient(180deg, ${C.cream} 0%, ${C.paper} 100%)`,
      borderBottom: `1px solid rgba(58,44,26,0.08)`,
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
          color: C.muted, fontWeight: 700,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <Sparkles size={11} style={{ color: C.gold }} /> {eyebrowText}
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 28, fontWeight: 500, color: C.espresso,
          letterSpacing: "-0.02em", margin: "6px 0 4px", lineHeight: 1.15,
        }}>
          Today
        </h1>
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13,
          color: C.muted, margin: 0, lineHeight: 1.5,
        }}>
          One day, in your shape.
        </p>

        {/* Bottom dev-controls slot — same flex row as demo's Stage/Phase
            pickers. justify-content: flex-end is the single deviation from
            the demo: the production switcher's panel popup anchors to its
            right edge (`right: 0`), so the pill must sit on the right side
            of the row for the panel to stay on-screen. */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16,
          justifyContent: "flex-end",
        }}>
          <DevStageSwitcher
            effectiveStage={effectiveStage}
            realStage={realStage}
            effectiveConditions={effectiveConditions}
            realConditions={realConditions}
            onChange={onStageChange}
            onConditionsChange={onConditionsChange}
            profileId={profileId}
            onProfileUpdated={onProfileUpdated}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PlannerV2Shell({
  user,
  profile,
  plannerConfig,
  effectiveLifeStage,
  realLifeStage,
  effectiveConditions,
  realConditions,
  selectedDay,
  selectedPhase,
  selectedCycleDay,
  personalTasks,
  dailyPlan,
  habitLogs,            // eslint-disable-line no-unused-vars
  medications,
  mealPlan,
  activeProgram,        // eslint-disable-line no-unused-vars
  onStageChange,
  onConditionsChange,
  onProfileUpdated,
}) {
  const stage = effectiveLifeStage || profile?.life_stage || "reproductive";
  const phase = selectedPhase || "luteal";
  const cycleDay = selectedCycleDay || undefined;

  const events = adaptScheduleEvents({ personalTasks, dailyPlan });
  const meds = adaptMedications(medications);
  const tomorrowPhase = adaptTomorrowPhase(phase);

  const today = selectedDay || new Date();
  const weekday = today.toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase();
  const mealsForDay = mealPlan?.plan_days?.[weekday];
  const meals = mealsForDay
    ? [
        { label: "Breakfast", text: mealsForDay.breakfast || "—" },
        { label: "Lunch",     text: mealsForDay.lunch     || "—" },
        { label: "Dinner",    text: mealsForDay.dinner    || "—" },
      ]
    : undefined;

  const selectedDateStr = (selectedDay instanceof Date)
    ? selectedDay.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.cream,
      paddingBottom: 100,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <ShellHero
        phase={phase}
        cycleDay={cycleDay}
        effectiveStage={effectiveLifeStage}
        realStage={realLifeStage}
        effectiveConditions={effectiveConditions}
        realConditions={realConditions}
        onStageChange={onStageChange}
        onConditionsChange={onConditionsChange}
        profileId={profile?.id}
        onProfileUpdated={onProfileUpdated}
      />

      <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 18 }}>

        {/* 1 — Jess hero */}
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

        {/* 2.5 — Stage-specific row · null for reproductive */}
        <StageRow
          stage={stage}
          profile={profile}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 2.6 — Condition-specific row · reads effectiveConditions (DEV
              switcher writes there; profile.conditions used as fallback) */}
        <ConditionRow
          conditions={effectiveConditions}
          profile={profile}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 3 — Morning / Afternoon / Evening */}
        <TimeOfDayRow
          stage={stage}
          phase={phase}
        />

        {/* 4 — Schedule preview + MonthRibbon */}
        <ScheduleCycleRow
          events={events}
          phase={phase}
          cycleDay={cycleDay}
          userProfile={profile}
        />

        {/* 5 — Rituals */}
        <RitualsRow
          userId={user?.id}
          selectedDateStr={selectedDateStr}
          currentPhase={phase}
          plannerConfig={plannerConfig}
        />

        {/* 6 — Nourishment */}
        <NourishmentRow
          meals={meals}
          phase={phase}
        />

        {/* 7 — Mind & insight */}
        <InsightsRow
          phase={phase}
        />

        {/* 8 — Care */}
        <CareRow
          medications={meds}
          stage={stage}
        />

        {/* 9 — Tonight & tomorrow */}
        <TonightRow
          tomorrowPhase={tomorrowPhase}
          stage={stage}
        />

      </div>
    </div>
  );
}

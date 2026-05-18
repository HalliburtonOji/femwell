// PlannerV2Shell — pixel-faithful production rendering of the
// signed-off UnifiedPlannerDemo layout.
//
// Halli signed off on UnifiedPlannerDemo's visual layout. This shell
// MUST match it exactly — same wrapper, same hero band, same row
// order, same card designs. The ONLY differences from the demo:
//   1. Real entity data is fed to each row instead of mock data.
//   2. The demo's Stage / Phase dev controls are replaced by the
//      DevStageSwitcher (so users can still preview a different
//      stage in production without leaving the page).
//   3. The demo's "v2 row test harness" eyebrow + designer h1 copy
//      become production copy ("Today" + phase-aware eyebrow).
//
// Life-stage logic is purely ADDITIVE — it personalises CONTENT inside
// existing rows (pregnancy kick-counter in CareRow, perimenopause hot
// flush chip in Symptom Log, teen gentler prompts, etc.). It NEVER
// changes the row order, the card design, the colour scheme, or the
// page chrome. The row components already accept `stage` as a prop
// and reshape themselves accordingly — the shell just threads it
// through.
//
// Brand rule: no emoji. Lucide icons + custom SVG only.

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
import { C } from "./tokens";

// ─────────────────────────────────────────────────────────────────────────────
// Adapters — convert Planner.jsx entity shapes to row-component prop
// shapes. Tiny pure functions: no fetches, no state, no side effects.
// ─────────────────────────────────────────────────────────────────────────────

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

// Permissive phase-aware subtitle for the hero band. Matches the
// signed-off demo's descriptive paragraph slot.
const PHASE_SUBTITLE = {
  menstrual:  "Soft pace today. The body is doing the work.",
  follicular: "Something new wants to begin.",
  ovulatory:  "Your voice carries today.",
  luteal:     "Boundaries feel natural now.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Hero band — matches UnifiedPlannerDemo's DemoHeader visual chrome
// exactly: same gradient, same padding, same eyebrow style, same h1
// style, same descriptor paragraph style. Only the content differs
// (real phase / cycleDay instead of "v2 row test harness"; "Today"
// instead of "One day. Every row, every stage.").
//
// DevStageSwitcher occupies the slot where the demo's Stage / Phase
// dev controls live, so users can still preview stages without
// leaving the page.
// ─────────────────────────────────────────────────────────────────────────────

function ShellHero({
  phase, cycleDay, plannerConfig,
  effectiveStage, realStage, effectiveConditions, realConditions,
  onStageChange, onConditionsChange, profileId, onProfileUpdated,
}) {
  const phaseLabel = phase ? phase[0].toUpperCase() + phase.slice(1) : null;
  const eyebrowText = phaseLabel
    ? `${phaseLabel}${cycleDay ? ` · DAY ${cycleDay}` : ""}${plannerConfig?.cycleTabName && plannerConfig.cycleTabName !== "Cycle" ? ` · ${plannerConfig.cycleTabName.toUpperCase()}` : ""}`
    : "Today";
  const subtitle = (phase && PHASE_SUBTITLE[phase]) || "One day, in your shape.";

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
          {subtitle}
        </p>

        {plannerConfig?.bannerText ? (
          <p style={{
            fontFamily: "Georgia, serif", fontStyle: "italic",
            fontSize: 12.5, color: C.plum, margin: "10px 0 0",
            padding: "6px 10px",
            background: "rgba(168,134,75,0.12)",
            borderLeft: `2px solid ${C.gold}`,
            borderRadius: 4, lineHeight: 1.4,
          }}>{plannerConfig.bannerText}</p>
        ) : null}

        {/* Dev affordance — sits where the demo had Stage / Phase pickers.
            Lets the user preview a different stage without leaving the page. */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16, alignItems: "center" }}>
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

// ─────────────────────────────────────────────────────────────────────────────
// Component — exact 1:1 mirror of UnifiedPlannerDemo's render tree.
// ─────────────────────────────────────────────────────────────────────────────

export default function PlannerV2Shell({
  // Auth / profile / config
  user,
  profile,
  plannerConfig,
  effectiveLifeStage,
  realLifeStage,
  effectiveConditions,
  realConditions,
  // Selected day + cycle
  selectedDay,
  selectedPhase,
  selectedCycleDay,
  // Entity data
  personalTasks,
  dailyPlan,
  habitLogs,            // eslint-disable-line no-unused-vars
  medications,
  mealPlan,
  activeProgram,        // eslint-disable-line no-unused-vars
  // DevStageSwitcher actions (lift from Planner.jsx so override flips
  // continue to work inside the v2 shell)
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

  // Meals plumbed from mealPlan if present.
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

  // YYYY-MM-DD for RitualBundlesCarousel.
  const selectedDateStr = (selectedDay instanceof Date)
    ? selectedDay.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  // Wrapper matches UnifiedPlannerDemo exactly — cream bg, 100px bottom
  // pad, Inter font. The 640px max-width on the row container matches the
  // demo to the pixel.
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
        plannerConfig={plannerConfig}
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

        {/* 1 — Jess hero · phase-aware narrative slider */}
        <JessHeroRow
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 2 — Body today · capacity ring · smart view · cycle zone
              (pregnancy variant fires automatically when stage starts with "pregnant") */}
        <BodyTodayRow
          stage={stage}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 2.5 — Stage-specific row · only renders for stages that need
              dedicated cards. Standard reproductive users see nothing here
              (StageRow returns null), so the layout stays unchanged. */}
        <StageRow
          stage={stage}
          profile={profile}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 3 — Morning / Afternoon / Evening — one tall slider
              (pregnancy stage swaps prompts to folic acid, kick count, etc.) */}
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
        />

        {/* 5 — Rituals — pass-through to production RitualBundlesCarousel */}
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
        />

        {/* 8 — Care — meds & supplements + symptom + body scan + GP report
              (pregnancy: kick counter + folic acid surface inside;
               perimenopause: HRT tracker + hot flush in symptom log;
               teen: empty medications section hides) */}
        <CareRow
          medications={meds}
          stage={stage}
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

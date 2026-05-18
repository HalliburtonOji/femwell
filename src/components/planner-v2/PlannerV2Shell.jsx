// ─────────────────────────────────────────────────────────────────────────────
// PlannerV2Shell — production renderer of the signed-off UnifiedPlannerDemo.
//
// This file is a direct copy of src/components/UnifiedPlannerDemo.jsx with
// three minimal changes:
//   1. Function renamed from UnifiedPlannerDemo to PlannerV2Shell.
//   2. Mock data constants are overridden by real props passed from
//      Planner.jsx; variable names are preserved so the render tree is
//      visually unchanged.
//   3. <StageRow ... /> and <ConditionRow ... /> are inserted directly
//      after the BodyTodayRow section so users with a life stage or
//      condition see the matching extra row in place. Reproductive users
//      with no conditions see exactly the demo's 9 rows in order.
//
// Brand rule: NO emoji. Lucide icons + custom SVG only.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Sparkles } from "lucide-react";

// The real, shared planner-v2 row components.
import JessHeroRow       from "@/components/planner-v2/JessHeroRow";
import BodyTodayRow      from "@/components/planner-v2/BodyTodayRow";
import TimeOfDayRow      from "@/components/planner-v2/TimeOfDayRow";
import ScheduleCycleRow  from "@/components/planner-v2/ScheduleCycleRow";
import RitualsRow        from "@/components/planner-v2/RitualsRow";
import NourishmentRow    from "@/components/planner-v2/NourishmentRow";
import InsightsRow       from "@/components/planner-v2/InsightsRow";
import CareRow           from "@/components/planner-v2/CareRow";
import TonightRow        from "@/components/planner-v2/TonightRow";
import StageRow          from "@/components/planner-v2/StageRows";
import ConditionRow      from "@/components/planner-v2/ConditionRows";

import { C } from "@/components/planner-v2/tokens";

// ─────────────────────────────────────────────────────────────────────────────
// Mock data — used as a fallback when real props aren't passed (e.g.
// before the user/profile load). Shaped exactly like the production
// payloads PlannerV2Shell receives from Planner.jsx.
// ─────────────────────────────────────────────────────────────────────────────

const MOCK = {
  phase:     "luteal",
  cycleDay:  25,
  stage:     "reproductive",

  // Profile shim for ScheduleCycleRow → MonthRibbon mount.
  userProfile: {
    last_period_start_date: "2026-04-24",
    cycle_avg_length: 28,
    period_length: 5,
  },

  // JessHeroRow
  jessMessage: "Late luteal asks for softness. The week before a bleed is when you over-give. Save edges for tomorrow.",
  astraReading: {
    title: "Your luteal reading",
    short: "Boundaries feel natural this week — keep your evenings spacious. The body is closing a chapter.",
  },
  weeklyInsight: "Three of your last four luteal weeks ended with a low-mood day on cycle day 26. This is biological, not personal.",

  // ScheduleCycleRow — schedule preview events
  events: [
    { id: "e1", hour: 10, title: "Yoga · gentle flow",            duration: 45, done: false },
    { id: "e2", hour: 13, title: "Lunch with Anna",               duration: 60, done: false },
    { id: "e3", hour: 16, title: "Strategy review · pitch deck",  duration: 90, done: false },
    { id: "e4", hour: 19, title: "Magnesium + wind-down",         duration: 15, done: false },
  ],

  // NourishmentRow
  macros:    { protein: 48, carbs: 142, fat: 38, proteinTarget: 80, carbsTarget: 200, fatTarget: 65 },
  hydration: { glasses: 5, target: 8 },
  meals: [
    { label: "Breakfast", text: "Porridge with banana + chia + walnut" },
    { label: "Lunch",     text: "Lentil & roast veg bowl + tahini drizzle" },
    { label: "Dinner",    text: "Roasted salmon + sweet potato + greens" },
  ],
  recipes: [
    { name: "Magnesium magic dahl",      time: "25 min", tone: C.sage  },
    { name: "Turmeric salmon traybake",  time: "30 min", tone: C.blush },
    { name: "Cacao + tahini bites",      time: "10 min", tone: C.gold  },
  ],

  // InsightsRow
  intention:  "Edges. Slow over fast.",
  moodHistory: [4, 3, 3, 2, 2, 3, 3],

  // CareRow
  medications: [
    { id: "m1", name: "Iron bisglycinate", dose: "25mg",  time: "with breakfast", taken: true  },
    { id: "m2", name: "Vitamin D3",        dose: "1000IU", time: "morning",        taken: false },
  ],
  supplements: [
    { id: "s1", name: "Magnesium glycinate", dose: "300mg", time: "evening",   taken: false },
    { id: "s2", name: "Omega-3",             dose: "1g",    time: "with meal", taken: true  },
  ],
  symptoms: [
    { id: "y1", label: "Cramps",       severity: 2 },
    { id: "y2", label: "Tender chest", severity: 1 },
    { id: "y3", label: "Bloating",     severity: 2 },
  ],

  // TonightRow
  tomorrowPhase: "luteal",
  tomorrowEvents: [
    { id: "tm1", hour: 9,  title: "Quiet morning · journal" },
    { id: "tm2", hour: 11, title: "Walk · 20 minutes" },
    { id: "tm3", hour: 15, title: "Pitch deck revisions" },
  ],
};

// Stage selector — lets you flip to pregnancy / peri etc. to verify the
// stage-aware variants in the row components.
const STAGES = [
  { id: "reproductive",  label: "Reproductive" },
  { id: "pregnant-t1",   label: "Pregnant · T1" },
  { id: "pregnant-t2",   label: "Pregnant · T2" },
  { id: "pregnant-t3",   label: "Pregnant · T3" },
  { id: "perimenopause", label: "Perimenopause" },
  { id: "postpartum",    label: "Postpartum" },
];

const PHASES = ["menstrual", "follicular", "ovulatory", "luteal"];

// ─────────────────────────────────────────────────────────────────────────────
// Demo header — eyebrow + dev controls. Lets a tester flip stage / phase
// and watch every row reshape itself.
// ─────────────────────────────────────────────────────────────────────────────

function DemoHeader({ stage, setStage, phase, setPhase }) {
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
          <Sparkles size={11} style={{ color: C.gold }} /> Unified Planner · v2 row test harness
        </div>
        <h1 style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 28, fontWeight: 500, color: C.espresso,
          letterSpacing: "-0.02em", margin: "6px 0 4px", lineHeight: 1.15,
        }}>
          One day. Every row, every stage.
        </h1>
        <p style={{
          fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13,
          color: C.muted, margin: 0, lineHeight: 1.5,
        }}>
          This demo mounts the real <code>src/components/planner-v2/</code> row
          components. Change anything in those components and the demo reflects
          it on the next render. The production Planner consumes the same rows
          behind a feature flag (<code>femwell_planner_v2</code>) — see
          PlannerV2Shell.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
          <DevControl label="Stage" value={stage} setValue={setStage} options={STAGES} />
          <DevControl label="Phase" value={phase} setValue={setPhase}
                      options={PHASES.map((p) => ({ id: p, label: p[0].toUpperCase() + p.slice(1) }))} />
        </div>
      </div>
    </div>
  );
}

function DevControl({ label, value, setValue, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{
        fontSize: 9, letterSpacing: "0.20em", textTransform: "uppercase",
        color: C.goldDeep, fontWeight: 700,
      }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {options.map((opt) => (
          <button key={opt.id} onClick={() => setValue(opt.id)} style={{
            padding: "5px 11px", borderRadius: 9999,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            border: value === opt.id ? `1px solid ${C.espresso}` : `1px solid rgba(58,44,26,0.16)`,
            background: value === opt.id ? C.espresso : "transparent",
            color: value === opt.id ? C.cream : C.espresso,
          }}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PlannerV2Shell({
  profile,
  user,                                  // eslint-disable-line no-unused-vars
  plannerConfig,                         // eslint-disable-line no-unused-vars
  effectiveLifeStage,
  effectiveConditions: effectiveConditionsProp,
  selectedDay,
  selectedPhase,
  selectedCycleDay,
  personalTasks,
  dailyPlan,                             // eslint-disable-line no-unused-vars
  medications,
  mealPlan,
} = {}) {

  // Initial stage/phase prefer real props over MOCK. The Stage / Phase
  // dev pickers in DemoHeader still flip the local state so a tester
  // can preview every variant without leaving the page.
  const [stage, setStage] = useState(effectiveLifeStage || profile?.life_stage || MOCK.stage);
  const [phase, setPhase] = useState(selectedPhase || MOCK.phase);

  // Real-data fallbacks. Variable names match the demo so the render
  // tree below is byte-identical to UnifiedPlannerDemo.jsx — only the
  // values change when real data is present.
  const cycleDay = selectedCycleDay || MOCK.cycleDay;
  const userProfile = profile || MOCK.userProfile;

  // Schedule events: derive from real personalTasks/dailyPlan when present.
  let events = MOCK.events;
  if (Array.isArray(personalTasks) && personalTasks.length > 0) {
    events = personalTasks
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
  }

  // Meals: derive from real mealPlan when present (lowercase weekday key).
  let meals = MOCK.meals;
  const today = selectedDay || new Date();
  const weekday = today.toLocaleDateString("en-GB", { weekday: "long" }).toLowerCase();
  const mealsForDay = mealPlan?.plan_days?.[weekday];
  if (mealsForDay) {
    meals = [
      { label: "Breakfast", text: mealsForDay.breakfast || "—" },
      { label: "Lunch",     text: mealsForDay.lunch     || "—" },
      { label: "Dinner",    text: mealsForDay.dinner    || "—" },
    ];
  }

  // Medications: real medication entities if present.
  let realMeds = MOCK.medications;
  if (Array.isArray(medications) && medications.length > 0) {
    realMeds = medications.map((m, i) => ({
      id: m.id || `m-${i}`,
      name: m.name || m.medication || "Medication",
      dose: m.dose || m.amount || "",
      time: m.time || m.schedule || "",
      taken: !!m.taken_today,
    }));
  }

  // Tomorrow's phase — cycle order.
  const PHASE_NEXT = { menstrual: "follicular", follicular: "ovulatory", ovulatory: "luteal", luteal: "menstrual" };
  const tomorrowPhase = PHASE_NEXT[phase] || MOCK.tomorrowPhase;

  // Effective conditions: DEV switcher writes to localStorage; falls back
  // to the prop (which Planner.jsx populates) and then to profile.conditions.
  const devConditionsRaw = (() => {
    try { return localStorage.getItem("femwell_dev_conditions"); } catch { return null; }
  })();
  let devConditions = [];
  if (devConditionsRaw) {
    try {
      const parsed = JSON.parse(devConditionsRaw);
      if (Array.isArray(parsed)) devConditions = parsed;
    } catch { /* silent */ }
  }
  const effectiveConditions = devConditions.length > 0
    ? devConditions
    : (Array.isArray(effectiveConditionsProp) && effectiveConditionsProp.length > 0
        ? effectiveConditionsProp
        : (Array.isArray(profile?.conditions) ? profile.conditions : []));

  return (
    <div style={{
      minHeight: "100vh",
      background: C.cream,
      paddingBottom: 100,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <DemoHeader
        stage={stage} setStage={setStage}
        phase={phase} setPhase={setPhase}
      />

      <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 18 }}>

        {/* 1 — Jess hero · phase-aware narrative slider */}
        <JessHeroRow
          phase={phase}
          cycleDay={cycleDay}
          jessMessage={MOCK.jessMessage}
          astraReading={MOCK.astraReading}
          weeklyInsight={MOCK.weeklyInsight}
        />

        {/* 2 — Body today · capacity ring · smart view · cycle zone */}
        <BodyTodayRow
          stage={stage}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 2.5 — Stage-specific row · only renders for stages that need
              dedicated cards. Reproductive users see nothing here. */}
        <StageRow
          stage={stage}
          profile={profile}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 2.6 — Condition-specific row · renders the FIRST matching
              condition (PMDD · PCOS · Endo · Fibroids · Thyroid ·
              Adenomyosis · Anxiety/Depression · ME-CFS). DEV switcher
              writes to femwell_dev_conditions; falls back to profile. */}
        <ConditionRow
          conditions={effectiveConditions}
          profile={profile}
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
          userProfile={userProfile}
        />

        {/* 5 — Rituals — pass-through to RitualBundlesCarousel */}
        <RitualsRow
          currentPhase={phase}
          selectedDateStr={new Date().toISOString().slice(0, 10)}
        />

        {/* 6 — Nourishment — macros + hydration + meal plan + phase recipes */}
        <NourishmentRow
          macros={MOCK.macros}
          hydration={MOCK.hydration}
          meals={meals}
          recipes={MOCK.recipes}
          phase={phase}
        />

        {/* 7 — Mind & insight — intention + Astra + mood + breathwork + Inner Season */}
        <InsightsRow
          intention={MOCK.intention}
          phase={phase}
          moodHistory={MOCK.moodHistory}
        />

        {/* 8 — Care — meds & supplements + symptom + body scan + GP report */}
        <CareRow
          medications={realMeds}
          supplements={MOCK.supplements}
          symptoms={MOCK.symptoms}
          stage={stage}
        />

        {/* 9 — Tonight & tomorrow — intentions + tomorrow phase + reflection */}
        <TonightRow
          tomorrowPhase={tomorrowPhase}
          tomorrowEvents={MOCK.tomorrowEvents}
          stage={stage}
        />

      </div>
    </div>
  );
}

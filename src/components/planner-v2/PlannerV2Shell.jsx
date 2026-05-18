// ─────────────────────────────────────────────────────────────────────────────
// PlannerV2Shell — production renderer of the signed-off UnifiedPlannerDemo.
//
// Direct copy of UnifiedPlannerDemo.jsx with:
//   1. Function renamed UnifiedPlannerDemo → PlannerV2Shell.
//   2. MOCK constants used as fallback; real props from Planner.jsx
//      override them.
//   3. <StageRow ... /> and <ConditionRow ... /> inserted after the
//      BodyTodayRow section.
//   4. The demo's inline Stage / Phase chip pickers replaced by a
//      single discreet "DEV" pill in the top-right corner of the
//      hero. The pill is gated by `import.meta.env.DEV` OR `?dev=1`
//      so real users never see it; the panel inside contains stage
//      chips + condition checkboxes that write to
//      `localStorage.femwell_dev_stage` and
//      `localStorage.femwell_dev_conditions`.
//
// Brand rule: NO emoji. Lucide icons + custom SVG only.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Layers, X, Check } from "lucide-react";

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

// ─── Dev visibility gate ────────────────────────────────────────────────────
// Show the DEV drawer only when:
//   - we're in a Vite dev build (import.meta.env.DEV === true), OR
//   - the URL contains ?dev=1
// In production builds without ?dev=1, the pill never renders.

function shouldShowDev() {
  try {
    if (import.meta.env && import.meta.env.DEV) return true;
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("dev") === "1";
  } catch { return false; }
}

// ─── Dev localStorage helpers ───────────────────────────────────────────────

function readDevStage() {
  try { return localStorage.getItem("femwell_dev_stage") || ""; }
  catch { return ""; }
}
function writeDevStage(v) {
  try {
    if (v) localStorage.setItem("femwell_dev_stage", v);
    else   localStorage.removeItem("femwell_dev_stage");
  } catch { /* silent */ }
}
function readDevConditions() {
  try {
    const raw = localStorage.getItem("femwell_dev_conditions");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function writeDevConditions(arr) {
  try {
    if (arr && arr.length > 0) localStorage.setItem("femwell_dev_conditions", JSON.stringify(arr));
    else                       localStorage.removeItem("femwell_dev_conditions");
  } catch { /* silent */ }
}

// ─── Stage + condition catalogues ──────────────────────────────────────────

const STAGES_DEV = [
  { id: "",                label: "Use real" },
  { id: "reproductive",    label: "Reproductive" },
  { id: "teen",            label: "Teen" },
  { id: "pre-ttc",         label: "Pre-TTC" },
  { id: "ttc",             label: "TTC" },
  { id: "pregnant-t1",     label: "Pregnant · T1" },
  { id: "pregnant-t2",     label: "Pregnant · T2" },
  { id: "pregnant-t3",     label: "Pregnant · T3" },
  { id: "postpartum",      label: "Postpartum" },
  { id: "perimenopause",   label: "Perimenopause" },
  { id: "menopause",       label: "Menopause" },
  { id: "post-menopause",  label: "Post-menopause" },
];

const CONDITIONS_DEV = [
  { key: "pmdd",                label: "PMDD" },
  { key: "pcos",                label: "PCOS" },
  { key: "endo",                label: "Endometriosis" },
  { key: "fibroids",            label: "Fibroids" },
  { key: "thyroid",             label: "Thyroid" },
  { key: "adenomyosis",         label: "Adenomyosis" },
  { key: "anxiety-depression",  label: "Anxiety / Depression" },
  { key: "me-cfs",              label: "ME / CFS" },
];

// ─── DEV drawer ─────────────────────────────────────────────────────────────
// Small pill in the top-right of the hero band that opens a panel of
// stage chips + condition checkboxes. Writes are persisted to
// localStorage and the parent state updates so the shell re-renders.

function DevDrawer({ devStage, devConditions, onChangeStage, onChangeConditions }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function pickStage(id) {
    writeDevStage(id);
    onChangeStage(id);
  }
  function toggleCondition(key) {
    const next = devConditions.includes(key)
      ? devConditions.filter((c) => c !== key)
      : [...devConditions, key];
    writeDevConditions(next);
    onChangeConditions(next);
  }

  const stageOverrideActive = !!devStage;
  const condCount = devConditions.length;
  const shortStage = stageOverrideActive
    ? (STAGES_DEV.find((s) => s.id === devStage)?.label || devStage)
    : "Real";

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open dev controls"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 11px",
          borderRadius: 9999,
          border: "1px solid rgba(58,44,26,0.18)",
          background: stageOverrideActive || condCount > 0 ? "#3A2C1A" : "rgba(58,44,26,0.10)",
          color: stageOverrideActive || condCount > 0 ? "#F4EDDB" : "#3A2C1A",
          cursor: "pointer",
          fontFamily: "'Inter', system-ui, sans-serif",
          minHeight: 28,
        }}
      >
        <Layers size={11} strokeWidth={2.2} />
        <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.16em", opacity: 0.7 }}>DEV</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em" }}>
          {shortStage}{condCount > 0 ? ` · ${condCount}c` : ""}
        </span>
      </button>

      {open && (
        <div role="dialog" aria-label="Dev controls" style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          zIndex: 50,
          background: "#FBF6E6",
          border: "1px solid rgba(58,44,26,0.12)",
          borderRadius: 14,
          boxShadow: "0 8px 24px rgba(58,44,26,0.16)",
          padding: 14,
          minWidth: 280,
          maxWidth: "calc(100vw - 32px)",
        }}>
          <header style={{
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            gap: 10, marginBottom: 10,
          }}>
            <div>
              <div style={{
                fontSize: 9, letterSpacing: "0.20em", textTransform: "uppercase",
                color: C.goldDeep, fontWeight: 700,
              }}>DEV ONLY</div>
              <div style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 16, fontWeight: 500, color: C.espresso,
              }}>Preview stage + conditions</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close dev controls"
              style={{
                width: 26, height: 26, borderRadius: 9999,
                background: "rgba(58,44,26,0.08)", border: "none",
                color: C.espresso, cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
              }}
            >
              <X size={13} strokeWidth={2.2} />
            </button>
          </header>

          {/* Stage chips */}
          <div style={{
            fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.muted, fontWeight: 700, marginBottom: 6,
          }}>STAGE</div>
          <div role="list" style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
            {STAGES_DEV.map((s) => {
              const active = s.id === devStage || (!devStage && s.id === "");
              return (
                <button
                  key={s.id || "__real__"}
                  role="listitem"
                  type="button"
                  onClick={() => pickStage(s.id)}
                  style={{
                    padding: "5px 11px", borderRadius: 9999,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    border: active ? `1px solid ${C.espresso}` : `1px solid rgba(58,44,26,0.16)`,
                    background: active ? C.espresso : "transparent",
                    color: active ? C.cream : C.espresso,
                  }}
                >{s.label}</button>
              );
            })}
          </div>

          {/* Condition checkboxes */}
          <div style={{
            fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.muted, fontWeight: 700, marginBottom: 6,
            paddingTop: 6, borderTop: "1px dashed rgba(58,44,26,0.10)",
          }}>CONDITIONS</div>
          <div role="list" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {CONDITIONS_DEV.map((c) => {
              const on = devConditions.includes(c.key);
              return (
                <button
                  key={c.key}
                  role="listitem"
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCondition(c.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 10px", borderRadius: 10,
                    border: `1px solid ${on ? "#A6862B" : "rgba(58,44,26,0.10)"}`,
                    background: on ? "rgba(166,134,43,0.16)" : "transparent",
                    color: C.espresso,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 4,
                    background: on ? "#A6862B" : "transparent",
                    border: `1.5px solid ${on ? "#A6862B" : "rgba(58,44,26,0.22)"}`,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {on && <Check size={11} style={{ color: "#fff" }} />}
                  </span>
                  <span style={{ flex: 1 }}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mock data fallback ─────────────────────────────────────────────────────

const MOCK = {
  phase:     "luteal",
  cycleDay:  25,
  stage:     "reproductive",

  userProfile: {
    last_period_start_date: "2026-04-24",
    cycle_avg_length: 28,
    period_length: 5,
  },

  jessMessage: "Late luteal asks for softness. The week before a bleed is when you over-give. Save edges for tomorrow.",
  astraReading: {
    title: "Your luteal reading",
    short: "Boundaries feel natural this week — keep your evenings spacious. The body is closing a chapter.",
  },
  weeklyInsight: "Three of your last four luteal weeks ended with a low-mood day on cycle day 26. This is biological, not personal.",

  events: [
    { id: "e1", hour: 10, title: "Yoga · gentle flow",            duration: 45, done: false },
    { id: "e2", hour: 13, title: "Lunch with Anna",               duration: 60, done: false },
    { id: "e3", hour: 16, title: "Strategy review · pitch deck",  duration: 90, done: false },
    { id: "e4", hour: 19, title: "Magnesium + wind-down",         duration: 15, done: false },
  ],

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

  intention:  "Edges. Slow over fast.",
  moodHistory: [4, 3, 3, 2, 2, 3, 3],

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

  tomorrowPhase: "luteal",
  tomorrowEvents: [
    { id: "tm1", hour: 9,  title: "Quiet morning · journal" },
    { id: "tm2", hour: 11, title: "Walk · 20 minutes" },
    { id: "tm3", hour: 15, title: "Pitch deck revisions" },
  ],
};

// ─── Demo header (visual chrome) ────────────────────────────────────────────
// Matches UnifiedPlannerDemo's hero band exactly. The bottom Stage/Phase
// chip row from the demo is removed — its function moves into the DEV
// drawer pill which only renders when ?dev=1 (or in dev builds).

function DemoHeader({ devStage, devConditions, onChangeStage, onChangeConditions }) {
  const showDev = shouldShowDev();
  return (
    <div style={{
      padding: "24px 16px 14px",
      background: `linear-gradient(180deg, ${C.cream} 0%, ${C.paper} 100%)`,
      borderBottom: `1px solid rgba(58,44,26,0.08)`,
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.muted, fontWeight: 700,
            fontFamily: "'Inter', system-ui, sans-serif",
            flex: 1, minWidth: 0,
          }}>
            <Sparkles size={11} style={{ color: C.gold }} /> Unified Planner · v2 row test harness
          </div>
          {showDev && (
            <DevDrawer
              devStage={devStage}
              devConditions={devConditions}
              onChangeStage={onChangeStage}
              onChangeConditions={onChangeConditions}
            />
          )}
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
      </div>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

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

  // Dev state — sourced from localStorage. Updates re-render the shell
  // so the matching stage row + condition row appears immediately.
  const [devStage, setDevStage] = useState(() => readDevStage());
  const [devConditions, setDevConditions] = useState(() => readDevConditions());

  // Effective stage and phase. Dev override wins, then real props,
  // then profile, then MOCK fallback.
  const stage = devStage || effectiveLifeStage || profile?.life_stage || MOCK.stage;
  const phase = selectedPhase || MOCK.phase;
  const cycleDay = selectedCycleDay || MOCK.cycleDay;
  const userProfile = profile || MOCK.userProfile;

  // Schedule events from real personalTasks if present, else MOCK.
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

  // Meals from real mealPlan if present.
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

  // Medications from real entities if present.
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

  // Effective conditions: dev override > prop > profile > [].
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
        devStage={devStage}
        devConditions={devConditions}
        onChangeStage={setDevStage}
        onChangeConditions={setDevConditions}
      />

      <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 18 }}>

        {/* 1 — Jess hero */}
        <JessHeroRow
          phase={phase}
          cycleDay={cycleDay}
          jessMessage={MOCK.jessMessage}
          astraReading={MOCK.astraReading}
          weeklyInsight={MOCK.weeklyInsight}
        />

        {/* 2 — Body today */}
        <BodyTodayRow
          stage={stage}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 2.5 — Stage-specific row */}
        <StageRow
          stage={stage}
          profile={profile}
          phase={phase}
          cycleDay={cycleDay}
        />

        {/* 2.6 — Condition-specific row */}
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

        {/* 4 — Schedule preview + production MonthRibbon */}
        <ScheduleCycleRow
          events={events}
          phase={phase}
          cycleDay={cycleDay}
          userProfile={userProfile}
        />

        {/* 5 — Rituals */}
        <RitualsRow
          currentPhase={phase}
          selectedDateStr={new Date().toISOString().slice(0, 10)}
        />

        {/* 6 — Nourishment */}
        <NourishmentRow
          macros={MOCK.macros}
          hydration={MOCK.hydration}
          meals={meals}
          recipes={MOCK.recipes}
          phase={phase}
        />

        {/* 7 — Mind & insight */}
        <InsightsRow
          intention={MOCK.intention}
          phase={phase}
          moodHistory={MOCK.moodHistory}
        />

        {/* 8 — Care */}
        <CareRow
          medications={realMeds}
          supplements={MOCK.supplements}
          symptoms={MOCK.symptoms}
          stage={stage}
        />

        {/* 9 — Tonight & tomorrow */}
        <TonightRow
          tomorrowPhase={tomorrowPhase}
          tomorrowEvents={MOCK.tomorrowEvents}
          stage={stage}
        />

      </div>
    </div>
  );
}

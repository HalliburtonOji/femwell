// ─────────────────────────────────────────────────────────────────────────────
// UnifiedPlannerDemo — v3 (revert to single-page slider layout per Halli).
//
// DEMO ONLY. Lives at /Ideas → "Unified" tab. Does NOT touch Planner.jsx,
// Today.jsx, or any production file.
//
// v3 STRUCTURE (one long scrollable page, horizontal swipe rows):
//   · Header (greeting only — no icon buttons)
//   · My Lists chip row
//   · SCHEDULE & CYCLE row — 2 cards. Each is a compact preview that
//     expands to a full overlay (editable schedule + gradient calendar
//     with day-tap detail).
//   · YOUR DAY row — 3 cards (Morning · Afternoon · Evening) the user
//     swipes between. Each shows what's relevant for that time of day.
//   · YOUR BODY TODAY row — Body Today / Smart View / Cycle Zone
//   · MORNING STACK row — Stack / Consistency
//   · RITUALS row — Create-your-own + 3 prebuilt
//   · PLANNING row — Plan a day / Week strip
//   · MIND & INSIGHT row — Intention / Astra
//   · NOURISHMENT row — Meals / Eat for phase
//   · CARE row — Medications / Supplements
//   · TONIGHT row — Reflection / Sleep target
//   · RECORDS row — GP Report
//   · Floating gold + FAB (voice scheduling + 10 manual-add cards)
//
// Brand rule: NO emoji codepoints — all glyphs are Lucide icons.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState, Children } from "react";
import {
  Sun, Moon, Zap, Calendar, Activity, X, Plus, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, Sparkles, CalendarCheck, Check, Edit3, Trash2,
  Heart, Droplets, Footprints, CircleDot, Pill, BedDouble, FileText,
  GripVertical, ArrowUpRight, Smile, Mic, Utensils, CalendarClock,
  StickyNote, Stethoscope, ListChecks, ArrowLeft, ArrowRight,
  Maximize2,
} from "lucide-react";
// Real production cycle calendar — same component Planner.jsx mounts on the
// Cycle tab. Imported so the demo doesn't drift from production visuals.
import MonthRibbon from "@/components/planner/cycle/MonthRibbon";
// Universal logger — replaces the demo's inline FAB + Quick Add. The FAB
// is now mounted at the app root, so the demo just calls openLogger() from
// every "+ Add" affordance instead of rendering its own.
import { openLogger } from "@/components/UniversalLogger";
import { base44 } from "@/api/base44Client";
import StageRow from "@/components/planner-v2/StageRows";
import ConditionRow from "@/components/planner-v2/ConditionRows";

// Layers + X imported separately so the DEV pill below can use them
// without colliding with the demo's existing import list above.
import { Layers as DevLayersIcon, X as DevXIcon } from "lucide-react";

// ── Tokens ─────────────────────────────────────────────────────────────────
const C = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#FFFFFF",
  espresso: "#3A2C1A",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  rose:     "#D45E52",
  // Updated to match the reference cycle calendar image
  pMenstrual:  "#8B2635",
  pFollicular: "#C17B4E",
  pOvulatory:  "#C4933F",
  pLuteal:     "#5B4A8A",
  // Soft pastel tints for hero gradient backgrounds
  softMenstrual:  "#F0D4D8",
  softFollicular: "#EBC9B5",
  softOvulatory:  "#F0E0B0",
  softLuteal:     "#C4B5D4",
  faint:    "rgba(58,44,26,0.10)",
};
const PHASE_LIGHT = {
  menstrual:  C.blush,
  follicular: C.sage,
  ovulatory:  C.gold,
  luteal:     C.muted,
};
const PHASE_DEEP = {
  menstrual:  C.pMenstrual,
  follicular: C.pFollicular,
  ovulatory:  C.pOvulatory,
  luteal:     C.pLuteal,
};

// ── Mock ──────────────────────────────────────────────────────────────────
const profile = { name: "Halli", phase: "luteal", cycleDay: 25, cycleLen: 28 };
// MonthRibbon expects the production UserProfile shape. Today is May 18 cycle
// day 25 → last_period_start_date = April 24. Period length 5, cycle 28.
const mockMonthRibbonProfile = {
  last_period_start_date: "2026-04-24",
  cycle_avg_length: 28,
  period_length: 5,
};
const PHASE_SOFT = {
  menstrual:  C.softMenstrual,
  follicular: C.softFollicular,
  ovulatory:  C.softOvulatory,
  luteal:     C.softLuteal,
};
const phaseChapter = { menstrual: "I", follicular: "II", ovulatory: "III", luteal: "IV" };
const phaseInsights = {
  menstrual:  { title: "A week to soften", body: "Your body is doing important work. Lower the bar, lower the lights, and let this week be small." },
  follicular: { title: "Your spring has arrived", body: "Energy is rising. New things will catch your eye — let yourself follow one or two of them." },
  ovulatory:  { title: "Your peak window opened", body: "Visibility, bold asks, and creative output land easily this week. Spend the energy you have." },
  luteal:     { title: "Your habits eased back this week", body: "This luteal week might invite gentler rhythms and smaller wins; you might find rest and lower activity feel more nourishing, with options left to follow your own pace." },
};
// Module-level `today` / `todayISO` are mutable so PlannerV2Shell can refresh
// them on every render. The demo's many consumers read these as if they were
// constants; this lets us keep that pattern while still reflecting the real
// wall-clock date after midnight rolls over.
let today = new Date();
let todayISO = today.toISOString().split("T")[0];

const initialLists = [
  { id: "work",     name: "Work",     colour: "#3A2C1A", tasks: [
    { id: "t1", text: "Team standup",          done: false, due: todayISO },
    { id: "t2", text: "Draft investor update", done: false, due: todayISO },
    { id: "t3", text: "Review press list",     done: false, due: null },
  ]},
  { id: "personal", name: "Personal", colour: "#D4AF37", tasks: [
    { id: "p1", text: "Call pharmacy",         done: true,  due: todayISO },
    { id: "p2", text: "Pick up dry cleaning",  done: false, due: null },
  ]},
  { id: "health",   name: "Health",   colour: "#8FAF8F", tasks: [
    { id: "h1", text: "Book GP follow-up",     done: false, due: null },
  ]},
];

const initialStack = {
  habits: [
    { id: "h1", text: "Morning movement",  done: true,  streak: 28 },
    { id: "h2", text: "Hydration check",   done: false, streak: 6  },
    { id: "h3", text: "Supplements",       done: false, streak: 12 },
    { id: "h4", text: "Evening wind-down", done: false, streak: 4  },
    { id: "h5", text: "Gratitude journal", done: true,  streak: 35 },
  ],
  meals: [
    { id: "m1", text: "Breakfast — Avocado toast + eggs", done: true,  note: "380 cal · P:18g C:32g F:22g" },
    { id: "m2", text: "Lunch — Salmon + greens",          done: false, note: "planned" },
    { id: "m3", text: "Dinner — Not planned",             done: false, note: null },
  ],
  meds: [
    { id: "rx1", text: "Progesterone 200mg", time: "9:00am", done: true  },
    { id: "rx2", text: "Vitamin D 2000IU",   time: "9:00am", done: false },
  ],
};

const ritualBundles = [
  { id: "ovu",  title: "Ovulatory Power Hour", count: 5, time: "Morning", duration: "20 min", phase: "ovulatory", accent: C.gold,  rituals: ["Sunlight + walk", "Strength · 25m", "Cold water", "High-protein breakfast", "Speak one bold thing"] },
  { id: "rest", title: "Rest & Restore",       count: 4, time: "Evening", duration: "15 min", phase: "luteal",    accent: C.muted, rituals: ["Yin yoga · 10m", "Magnesium", "Warm bath", "Read 10 pages"] },
  { id: "sync", title: "Cycle Sync Stretch",   count: 3, time: "Any",     duration: "10 min", phase: "any",       accent: C.sage,  rituals: ["Hip openers", "Spinal twist", "Legs up the wall"] },
];

const weekStrip = [
  { d: "M", date: 18, phase: "luteal",    energy: "medium", today: true },
  { d: "T", date: 19, phase: "luteal",    energy: "medium" },
  { d: "W", date: 20, phase: "luteal",    energy: "low"    },
  { d: "T", date: 21, phase: "luteal",    energy: "low"    },
  { d: "F", date: 22, phase: "menstrual", energy: "low"    },
  { d: "S", date: 23, phase: "menstrual", energy: "low"    },
  { d: "S", date: 24, phase: "menstrual", energy: "low"    },
];
const ENERGY_TONE = { high: C.gold, medium: C.sage, low: C.blush };

const intentionPrompts = {
  ovulatory:  "What does your body need you to honour today?",
  follicular: "What's calling you to start?",
  luteal:     "What can you let go of this week?",
  menstrual:  "How can you slow down today?",
};
const astraReading = {
  title: "Your Luteal Reading",
  short: "Your peak window is closing — the bold output of the last fortnight has done its work. This week wants softness, not push.",
  full:
    "Day 25. Progesterone is doing the heavy lifting. Your body is winding the cycle down — and the work you did at ovulation is now consolidating. This is a finishing week, not a starting week. Close loops you've left open. Say no to one thing that doesn't need you. The rooms you walk into this week want you softer, not louder.",
};

// Phase B3 — adapter: PlannerItems entity row → schedule block shape used
// throughout the demo (id, hour, duration, title, type, anchor, done).
function plannerItemToBlock(row) {
  if (!row || typeof row !== "object") return null;
  // Parse "HH:MM" or "HH" out of PlannerItems.time. Default to 9 if missing.
  let hour = 9;
  if (row.time) {
    const m = /^(\d{1,2})/.exec(String(row.time));
    if (m) {
      const h = Number(m[1]);
      if (Number.isFinite(h) && h >= 0 && h <= 23) hour = h;
    }
  }
  const cat = String(row.category || "").toLowerCase();
  let type = "task";
  if (cat === "habit" || cat === "wellbeing") type = "habit";
  else if (cat === "reminder" || cat === "medication" || cat === "med") type = "med";
  else if (cat === "appointment" || cat === "event") type = "event";
  return {
    id: row.id,
    hour,
    duration: Number(row.duration_minutes) || 30,
    title: row.title || "Untitled",
    type,
    anchor: !!(row.is_anchor || row.anchor),
    done: !!row.is_completed,
    // Keep the raw row so save/delete handlers can round-trip cleanly.
    _raw: row,
  };
}

const initialBlocks = [
  { id: "b1", hour: 7,  duration: 15, title: "Morning stretch",    type: "habit", anchor: true,  done: true },
  { id: "b2", hour: 8,  duration: 5,  title: "Folic acid",         type: "med",   anchor: true,  done: true },
  { id: "b3", hour: 9,  duration: 90, title: "Investor update — deep work", type: "task", anchor: false, done: false },
  { id: "b4", hour: 11, duration: 25, title: "Strength · 25m",     type: "habit", anchor: false, done: false },
  { id: "b5", hour: 13, duration: 30, title: "Lunch + walk",       type: "habit", anchor: false, done: false },
  { id: "b6", hour: 14, duration: 60, title: "Antenatal class",    type: "event", anchor: true,  done: false },
  { id: "b7", hour: 16, duration: 30, title: "Pharmacy call",      type: "task",  anchor: false, done: false },
  { id: "b8", hour: 19, duration: 30, title: "Wind-down · journal", type: "habit", anchor: false, done: false },
];
const TYPE_TONES = {
  habit: { bg: `${C.sage}1F`,  bar: C.sage  },
  task:  { bg: "rgba(58,44,26,0.07)", bar: C.espresso },
  med:   { bg: `${C.blush}1F`, bar: C.blush },
  event: { bg: `${C.gold}1F`,  bar: C.gold  },
};
function bandFor(h) {
  if (h >= 9 && h <= 11) return C.gold;
  if (h >= 12 && h <= 15) return C.sage;
  if (h >= 16 && h <= 18) return C.blush;
  return C.muted;
}

function buildMonth(year, month) {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = [];
  for (let i = 0; i < startDow; i++) week.push({ blank: true });
  for (let d = 1; d <= lastDay; d++) {
    week.push({ day: d, date: new Date(year, month, d), phase: phaseForCalDay(d) });
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) {
    while (week.length < 7) week.push({ blank: true });
    weeks.push(week);
  }
  return weeks;
}
function phaseForCalDay(d) {
  const todayDom = today.getDate();
  const cycleDayForCal = ((d - todayDom + profile.cycleDay - 1 + profile.cycleLen * 3) % profile.cycleLen) + 1;
  if (cycleDayForCal <= 5) return "menstrual";
  if (cycleDayForCal <= 13) return "follicular";
  if (cycleDayForCal <= 16) return "ovulatory";
  return "luteal";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
// ── DEV pill ──────────────────────────────────────────────────────────────
// Lightweight stage + conditions override (writes to localStorage). The StageRow
// and ConditionRow mounted below read these to switch their per-stage / per-
// condition card sets. Visible when ?dev=1 is set or Vite is in dev mode.
const DEV_STAGES = [
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
const DEV_CONDITIONS = [
  { key: "pmdd",                label: "PMDD" },
  { key: "pcos",                label: "PCOS" },
  { key: "endo",                label: "Endometriosis" },
  { key: "fibroids",            label: "Fibroids" },
  { key: "thyroid",             label: "Thyroid" },
  { key: "adenomyosis",         label: "Adenomyosis" },
  { key: "anxiety-depression",  label: "Anxiety / Depression" },
  { key: "me-cfs",              label: "ME / CFS" },
];
function shouldShowDev() {
  try {
    if (import.meta.env && import.meta.env.DEV) return true;
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("dev") === "1";
  } catch { return false; }
}
function readDevStage() {
  try { return localStorage.getItem("femwell_dev_stage") || ""; } catch { return ""; }
}
function readDevConditions() {
  try {
    const raw = localStorage.getItem("femwell_dev_conditions");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function DevPill({ devStage, devConditions, onChangeStage, onChangeConditions }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);
  const overrideActive = !!devStage;
  const condCount = devConditions.length;
  const shortStage = overrideActive
    ? (DEV_STAGES.find((s) => s.id === devStage)?.label || devStage)
    : "Real";
  function pickStage(id) {
    try { id ? localStorage.setItem("femwell_dev_stage", id) : localStorage.removeItem("femwell_dev_stage"); } catch {}
    onChangeStage(id);
  }
  function toggleCondition(key) {
    const next = devConditions.includes(key)
      ? devConditions.filter((c) => c !== key)
      : [...devConditions, key];
    try {
      next.length > 0
        ? localStorage.setItem("femwell_dev_conditions", JSON.stringify(next))
        : localStorage.removeItem("femwell_dev_conditions");
    } catch {}
    onChangeConditions(next);
  }
  return (
    <div ref={wrapRef} style={{ position: "fixed", top: 12, right: 12, zIndex: 1000 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open dev controls"
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 11px", borderRadius: 9999,
          border: "1px solid rgba(58,44,26,0.18)",
          background: overrideActive || condCount > 0 ? C.espresso : "rgba(251,246,230,0.95)",
          color: overrideActive || condCount > 0 ? C.cream : C.espresso,
          cursor: "pointer", minHeight: 28,
          fontFamily: "'Inter', system-ui, sans-serif",
          boxShadow: "0 2px 8px rgba(58,44,26,0.16)",
        }}
      >
        <DevLayersIcon size={11} strokeWidth={2.2} />
        <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.16em", opacity: 0.7 }}>DEV</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em" }}>
          {shortStage}{condCount > 0 ? ` · ${condCount}c` : ""}
        </span>
      </button>
      {open && (
        <div role="dialog" aria-label="Dev controls" style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: C.paper, border: "1px solid rgba(58,44,26,0.12)",
          borderRadius: 14, boxShadow: "0 8px 24px rgba(58,44,26,0.16)",
          padding: 14, minWidth: 280, maxWidth: "calc(100vw - 32px)",
        }}>
          <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.20em", textTransform: "uppercase", color: C.goldDeep, fontWeight: 700 }}>DEV ONLY</div>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500, color: C.espresso }}>Preview stage + conditions</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{
              width: 26, height: 26, borderRadius: 9999, background: "rgba(58,44,26,0.08)", border: "none",
              color: C.espresso, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
            }}>
              <DevXIcon size={13} strokeWidth={2.2} />
            </button>
          </header>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, fontWeight: 700, marginBottom: 6 }}>STAGE</div>
          <div role="list" style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
            {DEV_STAGES.map((s) => {
              const active = s.id === devStage || (!devStage && s.id === "");
              return (
                <button key={s.id || "__real__"} role="listitem" type="button" onClick={() => pickStage(s.id)} style={{
                  padding: "5px 11px", borderRadius: 9999,
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  border: active ? `1px solid ${C.espresso}` : "1px solid rgba(58,44,26,0.16)",
                  background: active ? C.espresso : "transparent",
                  color: active ? C.cream : C.espresso,
                }}>{s.label}</button>
              );
            })}
          </div>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, fontWeight: 700, marginBottom: 6, paddingTop: 6, borderTop: "1px dashed rgba(58,44,26,0.10)" }}>CONDITIONS</div>
          <div role="list" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {DEV_CONDITIONS.map((c) => {
              const on = devConditions.includes(c.key);
              return (
                <button key={c.key} role="listitem" type="button" aria-pressed={on} onClick={() => toggleCondition(c.key)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", borderRadius: 10,
                  border: `1px solid ${on ? C.goldDeep : "rgba(58,44,26,0.10)"}`,
                  background: on ? "rgba(166,134,43,0.16)" : "transparent",
                  color: C.espresso, fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 4,
                    background: on ? C.goldDeep : "transparent",
                    border: `1.5px solid ${on ? C.goldDeep : "rgba(58,44,26,0.22)"}`,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{on && <Check size={11} style={{ color: "#fff" }} />}</span>
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

// ── Main shell ─────────────────────────────────────────────────────────────
// Wrapped so Planner.jsx can mount this with its real (user, profile, ...)
// props. The legacy demo composition is preserved exactly as it was; this
// wrapper just plumbs in StageRow, ConditionRow, and the DEV pill.
//
// Mock → real entity wiring is a follow-up commit. The visual must match the
// approved 3,651-line UnifiedPlannerDemo reference byte-for-byte until that
// follow-up lands.
export default function PlannerV2Shell({
  user,
  profile: profileProp,
  effectiveLifeStage: effectiveLifeStageProp,
  effectiveConditions: effectiveConditionsProp,
  selectedPhase,
  selectedCycleDay,
} = {}) {
  // DEV state — mirrors localStorage so re-renders stay in sync with the pill.
  const [devStage, setDevStage]           = useState(() => readDevStage());
  const [devConditions, setDevConditions] = useState(() => readDevConditions());

  // Effective stage + conditions for StageRow / ConditionRow mounts.
  const effectiveLifeStage = useMemo(
    () => devStage || effectiveLifeStageProp || profileProp?.life_stage || "reproductive",
    [devStage, effectiveLifeStageProp, profileProp?.life_stage],
  );
  const effectiveConditions = useMemo(
    () => devConditions.length > 0
      ? devConditions
      : (Array.isArray(effectiveConditionsProp) && effectiveConditionsProp.length > 0
          ? effectiveConditionsProp
          : (Array.isArray(profileProp?.conditions) ? profileProp.conditions : [])),
    [devConditions, effectiveConditionsProp, profileProp?.conditions],
  );

  // Phase + cycle day used by StageRow / ConditionRow.
  const phase    = selectedPhase     || profileProp?.current_phase || profile.phase;
  const cycleDay = selectedCycleDay  || profileProp?.cycle_day     || profile.cycleDay;

  // ── Phase B1: real profile + greeting wiring ──────────────────────────────
  // The demo's many child components read from the module-level `profile`
  // const. We don't refactor 30+ call sites; instead we sync that const's
  // fields with real values once per render. The const's binding stays
  // immutable; only its properties are mutated (legal JS, and React doesn't
  // observe these so there's no concurrent-mode hazard).
  const realDisplayName = useMemo(() => {
    // display_name is used WHOLE (no split), even if it contains a space.
    if (profileProp?.display_name) return profileProp.display_name;
    // full_name is also kept whole — splitting on space and taking [0] was
    // wrong for names like "Test Halli" where the chosen given name is
    // already the second token.
    if (user?.full_name) return user.full_name;
    if (user?.email) {
      const prefix = String(user.email).split("@")[0];
      const words = prefix.split(/[0-9_.\-]+/).filter(Boolean);
      if (words[0]) return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    }
    return profile.name; // mock fallback so visual stays intact
  }, [profileProp?.display_name, user?.full_name, user?.email]);
  const realCycleLen = profileProp?.cycle_avg_length || profile.cycleLen;
  const realLifeStage = effectiveLifeStage; // already merged with DEV pill + props

  // Side-effect on every render: keep the module-level mocks in sync with
  // real values so downstream cards (Header, JessHero, MonthRibbon, etc.)
  // pick them up without any change.
  profile.name     = realDisplayName;
  profile.phase    = phase;
  profile.cycleDay = cycleDay;
  profile.cycleLen = realCycleLen;
  // Refresh today/todayISO so any consumer that reads them after midnight
  // sees the new date instead of the value frozen at app-load time.
  today    = new Date();
  todayISO = today.toISOString().split("T")[0];

  // ── Original demo state (unchanged from the approved 3,651-line reference) ──
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [cycleOpen, setCycleOpen] = useState(false);
  const [dayDetail, setDayDetail] = useState(null);
  const [blockEdit, setBlockEdit] = useState(null);
  const [planOpen, setPlanOpen] = useState(false);
  // Phase B3 — `blocks` (schedule timeline items) is now backed by
  // PlannerItems for today. Each PlannerItem maps to a block:
  //   id        ← PlannerItems.id
  //   title     ← PlannerItems.title
  //   hour      ← parsed from PlannerItems.time ("HH:MM"); falls back to 9
  //   duration  ← PlannerItems.duration_minutes (legacy field); falls back to 30
  //   type      ← "med" if category=="reminder" or "medication", "habit" if
  //                category=="habit" or "wellbeing", "event" if "appointment",
  //                otherwise "task"
  //   anchor    ← PlannerItems.is_anchor or PlannerItems.anchor
  //   done      ← PlannerItems.is_completed
  // The local edit handlers below stay — they now persist to base44.
  const [blocks, setBlocks] = useState([]);
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.PlannerItems.filter(
          { user_id: user.id, date: todayISO },
          "-created_date",
          200,
        );
        if (cancelled) return;
        const next = (rows || []).map(plannerItemToBlock);
        setBlocks(next);
      } catch {
        if (!cancelled) setBlocks([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Greeting reads the real wall-clock hour each render (the module-level
  // `today` is evaluated once at app load and would otherwise stay stuck).
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5)  return "Resting well";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Resting well";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={shell}>
      {shouldShowDev() && (
        <DevPill
          devStage={devStage}
          devConditions={devConditions}
          onChangeStage={setDevStage}
          onChangeConditions={setDevConditions}
        />
      )}

      <Header greeting={greeting} onOpenPlan={() => setPlanOpen(true)} lifeStage={profileProp?.life_stage || realLifeStage} />

      {/* INSIGHTS hero — first horizontal slider on the page */}
      <InsightsHeroRow />

      <ListsSection user={user} />

      <Row label="Schedule & cycle">
        <SchedulePreviewCard blocks={blocks} onExpand={() => setScheduleOpen(true)} />
        <CyclePreviewCard onExpand={() => setCycleOpen(true)} />
      </Row>

      <YourDayRow />

      <Row label="Your body today">
        <BodyTodayCard user={user} />
        <SmartViewCard />
        <CycleZoneCard onOpen={() => setCycleOpen(true)} />
      </Row>

      {/* Stage + condition rows — only render when relevant; StageRow + ConditionRow
          internally short-circuit when stage = "reproductive" / no conditions. */}
      <StageRow
        stage={effectiveLifeStage}
        profile={profileProp}
        phase={phase}
        cycleDay={cycleDay}
      />
      <ConditionRow
        conditions={effectiveConditions}
        profile={profileProp}
        phase={phase}
        cycleDay={cycleDay}
      />

      <Row label="Rituals">
        <MorningStackCard user={user} />
        <CreateRitualCard />
        {ritualBundles.map((b) => <RitualBundleCard key={b.id} bundle={b} user={user} />)}
      </Row>

      <Row label="Mind & insight">
        <IntentionCard user={user} />
        <AstraCard />
        <MoodMentalHealthCard user={user} />
        <BreathworkCard />
        <CyclePsychologyCard />
      </Row>

      <Row label="Nourishment">
        <MacroTrackerCard />
        <HydrationCard user={user} />
        <AIMealPlanCard />
        <PhaseRecipesCard />
      </Row>

      <Row label="Care">
        <MedsAndSuppsCard user={user} />
        <SymptomLogCard />
        <BodyScanCard />
        <GPReportCardSmall />
      </Row>

      <Row label="Tonight">
        <TonightReflectionCard user={user} />
        <TomorrowPreviewCard user={user} />
        <CycleReflectionCard />
      </Row>

      <DemoFooter />

      <PlanADaySheet open={planOpen} onClose={() => setPlanOpen(false)} />

      <FullScheduleOverlay
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        blocks={blocks}
        onBlockTap={(id) => setBlockEdit(id)}
      />
      <FullCycleOverlay
        open={cycleOpen}
        onClose={() => setCycleOpen(false)}
        onDayTap={(iso) => setDayDetail(iso)}
      />
      <DayDetailSheet iso={dayDetail} onClose={() => setDayDetail(null)} />
      <BlockEditSheet
        block={blockEdit ? blocks.find((b) => b.id === blockEdit) : null}
        onClose={() => setBlockEdit(null)}
        onSave={async (next) => {
          setBlocks((bs) => bs.map((b) => b.id === next.id ? next : b));
          setBlockEdit(null);
          // Phase B3 — persist edits to PlannerItems. We only push the
          // fields the demo's BlockEditSheet exposes (title, hour, duration,
          // done). Everything else stays as the server has it.
          try {
            const hh = Number.isFinite(next.hour) ? String(next.hour).padStart(2, "0") : "09";
            await base44.entities.PlannerItems.update(next.id, {
              title: next.title,
              time: `${hh}:00`,
              duration_minutes: next.duration,
              is_completed: !!next.done,
            });
          } catch { /* silent */ }
        }}
        onDelete={async (id) => {
          setBlocks((bs) => bs.filter((b) => b.id !== id));
          setBlockEdit(null);
          try { await base44.entities.PlannerItems.delete(id); } catch { /* silent */ }
        }}
      />
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────────────────────
// Phase B1 fix: date + stage-aware subline.
//   • Date is computed from a fresh new Date() each render — the demo's
//     module-level `today` const was evaluated once at app load and
//     could drift past midnight.
//   • For pregnancy stages (pregnant-t1 / t2 / t3) we render
//     "Pregnant · Trimester N" instead of "Luteal Day 25".
//   • Other stages keep the original cycle-day format.
function Header({ greeting, onOpenPlan, lifeStage }) {
  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long",
  });
  const stageLower = String(lifeStage || "").toLowerCase();
  const isPregnant = stageLower.startsWith("pregnant-t");
  // Per Halli's exact spec: strip the prefix and parse the trailing digit.
  // "pregnant-t1" → 1, "pregnant-t2" → 2, "pregnant-t3" → 3.
  const trimNum    = isPregnant ? parseInt(stageLower.replace("pregnant-t", ""), 10) : null;
  const stageLine  = isPregnant
    ? `Pregnant · Trimester ${Number.isFinite(trimNum) ? trimNum : "—"}`
    : `${profile.phase[0].toUpperCase() + profile.phase.slice(1)} Day ${profile.cycleDay}`;
  return (
    <div style={headerStyle}>
      <div style={greetingRow}>
        <h1 style={greetingText}>{greeting}, {profile.name}</h1>
        <Sun size={18} style={{ color: C.gold, flexShrink: 0 }} />
      </div>
      <div style={headerSubRow}>
        <span style={greetingSub}>
          {dateLabel} · {stageLine}
        </span>
        <button onClick={onOpenPlan} style={planPillBtn}>
          <CalendarCheck size={11} /> Plan a day <ChevronDown size={11} />
        </button>
      </div>
    </div>
  );
}

// ── Plan a day — compact bottom sheet ─────────────────────────────────────
function PlanADaySheet({ open, onClose }) {
  const [mode, setMode] = useState("none");
  const dateRef = useRef(null);
  const [bpStep, setBpStep] = useState(0);
  const [bpDate, setBpDate] = useState(null);
  const [todayPlan, setTodayPlan] = useState([
    "Deep work · investor update", "Lunch with Sam", "Wind-down · journal",
  ]);
  useEffect(() => {
    if (!open) { setMode("none"); setBpStep(0); setBpDate(null); }
  }, [open]);

  function openDatePicker() {
    const el = dateRef.current; if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else { el.focus(); el.click(); }
  }
  function handleDateChange(e) {
    const v = e.target.value;
    if (v) { setBpDate(v); setMode("future"); setBpStep(0); }
    e.target.value = "";
  }

  if (!open) return null;
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={{ ...modalCard, maxHeight: "60vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>PLAN A DAY</span>
          <button onClick={onClose} style={drawerCloseBtn}><X size={14} /></button>
        </div>

        {mode === "none" && (
          <>
            <div style={planBtnRow}>
              <button onClick={() => setMode("today")} style={planBtn}>
                <CalendarCheck size={20} style={{ color: C.espresso }} />
                <span style={planBtnLabel}>Today</span>
              </button>
              <button onClick={openDatePicker} style={planBtn}>
                <Calendar size={20} style={{ color: C.espresso }} />
                <span style={planBtnLabel}>Pick a date</span>
              </button>
            </div>
            <input ref={dateRef} type="date" min={todayISO} onChange={handleDateChange} style={hiddenDateInput} tabIndex={-1} />
          </>
        )}

        {mode === "today" && (
          <>
            <h3 style={modalTitle}>Today's plan</h3>
            <ul style={todayPlanList}>
              {todayPlan.map((p, i) => (
                <li key={i} style={todayPlanLine}>
                  <span style={todayPlanDot} />
                  <span style={todayPlanText}>{p}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => setTodayPlan((arr) => [...arr, "New plan item"])} style={addPlanLineBtn}>
              <Plus size={11} /> Add item
            </button>
          </>
        )}

        {mode === "future" && bpDate && (
          <FutureBlueprintInline date={bpDate} step={bpStep} setStep={setBpStep} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function FutureBlueprintInline({ date, step, setStep, onClose }) {
  const d = new Date(date);
  const todayDom = today.getDate();
  const cycleDay = ((d.getDate() - todayDom + profile.cycleDay - 1 + profile.cycleLen * 3) % profile.cycleLen) + 1;
  const phase = (cycleDay <= 5) ? "menstrual"
    : (cycleDay <= 13) ? "follicular"
    : (cycleDay <= 16) ? "ovulatory" : "luteal";
  const [intention, setIntention] = useState("");
  const [capacity, setCapacity] = useState("moderate");
  return (
    <>
      <div style={blueprintDotsRow}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{
            ...blueprintDot,
            background: i === step ? C.espresso : "rgba(58,44,26,0.20)",
            transform: i === step ? "scale(1.4)" : "scale(1)",
          }} />
        ))}
      </div>

      {step === 0 && (
        <>
          <h3 style={modalTitle}>Predicted phase</h3>
          <div style={{ padding: "10px 14px", borderRadius: 12, background: `${PHASE_LIGHT[phase]}1F`, border: `1px solid ${PHASE_LIGHT[phase]}55`, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 14, height: 14, borderRadius: 9999, background: PHASE_LIGHT[phase] }} />
            <div>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: C.espresso }}>
                {phase[0].toUpperCase() + phase.slice(1)} · Day {cycleDay}
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>
                {d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              </div>
            </div>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <h3 style={modalTitle}>Set an intention</h3>
          <textarea value={intention} onChange={(e) => setIntention(e.target.value)}
            placeholder="What do you want from this day?" style={intentionTextarea} rows={4} autoFocus />
        </>
      )}
      {step === 2 && (
        <>
          <h3 style={modalTitle}>Protect your energy</h3>
          <div style={chipRowSpacing}>
            {["light", "moderate", "full capacity"].map((c) => (
              <button key={c} onClick={() => setCapacity(c)} style={{
                ...modalChip,
                background: capacity === c ? C.espresso : C.paperHi,
                color: capacity === c ? C.cream : C.muted,
                borderColor: capacity === c ? C.espresso : "rgba(58,44,26,0.18)",
              }}>{c[0].toUpperCase() + c.slice(1)}</button>
            ))}
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <h3 style={modalTitle}>Ready</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={confirmLineStyle}>
              <span style={miniLabel}>DATE</span>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500, color: C.espresso }}>
                {d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
            <div style={confirmLineStyle}>
              <span style={miniLabel}>PHASE</span>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500, color: C.espresso }}>
                {phase[0].toUpperCase() + phase.slice(1)}
              </span>
            </div>
            <div style={confirmLineStyle}>
              <span style={miniLabel}>INTENTION</span>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500, color: C.espresso }}>
                {intention || "(none)"}
              </span>
            </div>
            <div style={confirmLineStyle}>
              <span style={miniLabel}>CAPACITY</span>
              <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500, color: C.espresso }}>
                {capacity[0].toUpperCase() + capacity.slice(1)}
              </span>
            </div>
          </div>
        </>
      )}

      <div style={modalFoot}>
        {step > 0 && <button onClick={() => setStep(step - 1)} style={modalCancelBtn}>Back</button>}
        {step < 3 && <button onClick={() => setStep(step + 1)} style={modalSaveBtn}>Next</button>}
        {step === 3 && <button onClick={onClose} style={modalSaveBtn}>Save blueprint</button>}
      </div>
    </>
  );
}

// ── Sun illustration SVG ──────────────────────────────────────────────────
function SunIllustration({ tone = C.gold, size = 70 }) {
  const cx = size / 2, cy = size / 2;
  const ray = (angle, r1, r2) => {
    const a = (angle * Math.PI) / 180;
    return {
      x1: cx + Math.cos(a) * r1,
      y1: cy + Math.sin(a) * r1,
      x2: cx + Math.cos(a) * r2,
      y2: cy + Math.sin(a) * r2,
    };
  };
  const rays = Array.from({ length: 12 }, (_, i) => ray(i * 30, size * 0.30, size * 0.45));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={size * 0.18} fill="none" stroke={tone} strokeWidth={1.4} />
      {rays.map((r, i) => (
        <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={tone} strokeWidth={1.2} strokeLinecap="round" />
      ))}
    </svg>
  );
}

// ── Insights hero slider row (NEW) ────────────────────────────────────────
function InsightsHeroRow() {
  const phase = profile.phase;
  const accent = PHASE_DEEP[phase];
  const soft = PHASE_SOFT[phase];
  const insight = phaseInsights[phase];
  const chapter = phaseChapter[phase];
  return (
    <Row label="">
      <HeroInsightCard
        eyebrow={`CHAPTER ${chapter} · ${phase.toUpperCase()} · DAY ${profile.cycleDay}`}
        title={insight.title}
        body={insight.body}
        footer="From Jess · this week"
        accent={accent}
        soft={soft}
      />
      <HeroInsightCard
        eyebrow={`ASTRA · OVULATORY READING`}
        title="Your peak window is closing"
        body="You're at day 25 — luteal is in motion. The bold output of the last fortnight has done its work; this week the rooms you walk into want softness, not push. Listen for what's narrowing."
        footer="From Astra · today"
        accent={C.gold}
        soft="#F0E0B0"
      />
      <HeroInsightCard
        eyebrow={`PHASE · GENTLE NOTE`}
        title="Sleep is the work this week"
        body="In luteal, progesterone is doing the heavy lifting. Bed by 10:30. The rest of your day will thank you tomorrow."
        footer="From your body · always"
        accent={C.sage}
        soft="#D8E5D3"
      />
    </Row>
  );
}

function HeroInsightCard({ eyebrow, title, body, footer, accent, soft }) {
  return (
    <article style={{
      ...heroCard,
      background: `linear-gradient(135deg, ${soft} 0%, ${C.cream} 100%)`,
      borderLeft: `4px solid ${accent}`,
    }}>
      <div style={heroCardRow}>
        <p style={{ ...heroEyebrow, color: accent }}>{eyebrow}</p>
        <div style={heroSunWrap}>
          <SunIllustration tone={accent} size={70} />
        </div>
      </div>
      <h2 style={heroTitle}>{title}</h2>
      <p style={heroBody}>{body}</p>
      <div style={heroFootRow}>
        <Sparkles size={11} style={{ color: accent }} />
        <span style={heroFootText}>{footer}</span>
      </div>
    </article>
  );
}

// ── Your Day row — 3 tall cards (Morning · Afternoon · Evening) ──────────
const YOUR_DAY_VARIANTS = [
  {
    id: "morning",
    label: "MORNING",
    Icon: Sun,
    accent: C.gold,
    sections: [
      { name: "HABITS", items: [
        { id: "h1", text: "Morning movement",   meta: "28d streak", done: false },
        { id: "h2", text: "Hydration check",    meta: "8d streak",  done: false },
        { id: "h3", text: "Supplements",        meta: "12d streak", done: false },
        { id: "h4", text: "Gratitude journal",  meta: "35d streak", done: true  },
      ]},
      { name: "NOURISHMENT", items: [
        { id: "n1", text: "Breakfast — Avocado toast + eggs", meta: "380 cal · P:18g C:32g F:22g", done: true },
      ]},
      { name: "CARE", items: [
        { id: "c1", text: "Progesterone 200mg", meta: "9:00am", done: true },
        { id: "c2", text: "Vitamin D 2000IU",   meta: "9:00am", done: false },
      ]},
      { name: "TASKS", items: [
        { id: "t1", text: "Team standup",          meta: "Work", done: false },
        { id: "t2", text: "Draft investor update", meta: "Work", done: false },
      ]},
    ],
  },
  {
    id: "afternoon",
    label: "AFTERNOON",
    Icon: Activity,
    accent: C.sage,
    sections: [
      { name: "HABITS", items: [
        { id: "ah1", text: "Hydration check (midday)", meta: "", done: false },
        { id: "ah2", text: "Walk after lunch",         meta: "", done: false },
      ]},
      { name: "NOURISHMENT", items: [
        { id: "an1", text: "Lunch — Salmon + greens", meta: "planned",  done: false },
        { id: "an2", text: "Snack — Not planned",     meta: "[+ Add]",  done: false, empty: true },
      ]},
      { name: "TASKS", items: [
        { id: "at1", text: "Draft investor update (carry over)", meta: "Work", done: false },
        { id: "at2", text: "Check emails",                       meta: "",     done: false },
      ]},
    ],
  },
  {
    id: "evening",
    label: "EVENING",
    Icon: Moon,
    accent: C.blush,
    sections: [
      { name: "TONIGHT'S REFLECTION", items: [
        { id: "tr1", text: "One win today",        meta: "_______________", done: false, reflection: true },
        { id: "tr2", text: "Energy rating (1–10)", meta: "_______________", done: false, reflection: true },
        { id: "tr3", text: "Intention for tomorrow", meta: "_______________", done: false, reflection: true },
      ]},
      { name: "CARE", items: [
        { id: "ec1", text: "Magnesium glycinate",   meta: "evening", done: false },
        { id: "ec2", text: "Evening wind-down habit", meta: "",      done: false },
      ]},
      { name: "NOURISHMENT", items: [
        { id: "en1", text: "Dinner — Not planned", meta: "[+ Add]", done: false, empty: true },
      ]},
      { name: "SLEEP TARGET", items: [
        { id: "es1", text: "Aim for bed by 10:30pm",          meta: "",                             done: false, info: true },
        { id: "es2", text: "Last night: 7h 20min · Good",     meta: "",                             done: false, info: true },
      ]},
    ],
  },
];

function YourDayRow() {
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);

  function jumpTo(i) {
    const clamped = Math.max(0, Math.min(YOUR_DAY_VARIANTS.length - 1, i));
    setActive(clamped);
    const track = trackRef.current; if (!track) return;
    const child = track.children[clamped];
    if (child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }
  function onScroll() {
    const track = trackRef.current; if (!track) return;
    let best = 0, bestDist = Infinity;
    Array.from(track.children).forEach((el, i) => {
      const left = el.offsetLeft - track.offsetLeft;
      const dist = Math.abs(left - track.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setActive(best);
  }

  const activeAccent = YOUR_DAY_VARIANTS[active].accent;

  return (
    <section style={rowShell} aria-label="Your day">
      <div style={rowHead}>
        <span style={kicker}>YOUR DAY</span>
        <div style={rowNav}>
          <button onClick={() => jumpTo(active - 1)} style={rowArrow}><ChevronLeft size={14} /></button>
          {YOUR_DAY_VARIANTS.map((v, i) => (
            <span key={i} style={{
              ...rowDot,
              background: i === active ? v.accent : "rgba(58,44,26,0.20)",
              transform: i === active ? "scale(1.4)" : "scale(1)",
            }} />
          ))}
          <button onClick={() => jumpTo(active + 1)} style={rowArrow}><ChevronRight size={14} /></button>
        </div>
      </div>
      <div ref={trackRef} onScroll={onScroll} style={rowTrack}>
        {YOUR_DAY_VARIANTS.map((v) => (
          <div key={v.id} style={rowSlot}>
            <YourDayCard variant={v} />
          </div>
        ))}
      </div>
    </section>
  );
}

function YourDayCard({ variant }) {
  const [sections, setSections] = useState(variant.sections);
  function toggle(secName, id) {
    setSections((sx) => sx.map((s) => s.name === secName
      ? { ...s, items: s.items.map((it) => it.id === id ? { ...it, done: !it.done } : it) }
      : s));
  }
  return (
    <article style={{
      ...yourDayCard,
      borderLeft: `4px solid ${variant.accent}`,
    }}>
      <div style={yourDayHead}>
        <span style={{ ...yourDayIconChip, background: `${variant.accent}1F`, color: variant.accent }}>
          <variant.Icon size={14} />
        </span>
        <span style={{ ...yourDayLabel, color: variant.accent }}>{variant.label}</span>
      </div>
      {sections.map((sec) => (
        <div key={sec.name} style={{ marginTop: 10 }}>
          <div style={yourDaySectionLine}>
            <span style={yourDaySectionRule} />
            <span style={yourDaySectionName}>{sec.name}</span>
            <span style={yourDaySectionRule} />
          </div>
          <ul style={{ ...bulletList, gap: 4, marginTop: 4 }}>
            {sec.items.map((it) => (
              <li key={it.id} style={yourDayItemRow}>
                {!it.reflection && !it.info ? (
                  <input type="checkbox" checked={it.done} onChange={() => toggle(sec.name, it.id)}
                    style={{ accentColor: variant.accent, flexShrink: 0 }} />
                ) : it.reflection ? (
                  <span style={{ width: 16, height: 16, flexShrink: 0 }} />
                ) : (
                  <Moon size={14} style={{ color: C.muted, flexShrink: 0 }} />
                )}
                <span style={{
                  fontSize: 12.5, flex: 1, color: C.espresso,
                  textDecoration: it.done ? "line-through" : "none",
                  opacity: it.done ? 0.5 : 1,
                }}>{it.text}</span>
                {it.meta && (
                  <span style={{
                    ...yourDayItemMeta,
                    color: it.empty ? variant.accent : C.muted,
                    fontStyle: it.empty ? "normal" : "normal",
                    fontWeight: it.empty ? 700 : 600,
                  }}>{it.meta}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button
        onClick={() => openLogger()}
        style={{ ...yourDayAddBtn, color: variant.accent, borderColor: `${variant.accent}55` }}
      >
        <Plus size={12} /> Add
      </button>
    </article>
  );
}

// ── My Lists ───────────────────────────────────────────────────────────────
// Phase B2 — PersonalTasks wiring.
// The demo's three lists (Work / Personal / Health) used static seed data
// in `initialLists`. The visual is identical here; only the data source
// changes — three chips now group today's PersonalTasks by `time_of_day`
// (morning / afternoon / evening). Tasks without a time_of_day fall into
// the morning bucket. Sort inside each chip: incomplete first, then
// completed (which already gets the demo's strikethrough + 0.5 opacity).
function ListsSection({ user }) {
  // Bucket definitions match the original 3-chip layout. Colours are pulled
  // from the demo's existing palette so the chip styling renders identically.
  const BUCKETS = useMemo(() => ([
    { id: "morning",   name: "Morning",   colour: "#D4AF37" }, // gold
    { id: "afternoon", name: "Afternoon", colour: "#8FAF8F" }, // sage
    { id: "evening",   name: "Evening",   colour: "#3A2C1A" }, // espresso
  ]), []);

  const [rawTasks, setRawTasks] = useState([]);
  const [expanded, setExpanded] = useState(null);

  // Fetch the user's PersonalTasks. No date filter — Bug 2 (B2): when the
  // filter was scoped to `date: todayISO`, rows created on a previous day
  // (or without a `date` field set) never reached the chip panel, so the
  // accordion always rendered empty. The chips show "today's stack" by
  // intent, but tasks that lack a date or were dated earlier should still
  // appear so the user can complete them.
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.PersonalTasks.filter(
          { user_id: user.id },
          "-created_date",
          200,
        );
        if (!cancelled) setRawTasks(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setRawTasks([]);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Bucket + sort: incomplete first, completed last; within each, preserve
  // server-newest-first order from the filter.
  const lists = useMemo(() => {
    const byBucket = { morning: [], afternoon: [], evening: [] };
    for (const t of rawTasks) {
      const slot = (t?.time_of_day || "").toLowerCase();
      const bucket = byBucket[slot] ? slot : "morning";
      byBucket[bucket].push({
        id: t.id,
        text: t.title || "Untitled",
        done: !!t.completed,
        due: t.date,
      });
    }
    for (const k of Object.keys(byBucket)) {
      byBucket[k].sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0));
    }
    return BUCKETS.map((b) => ({ ...b, tasks: byBucket[b.id] }));
  }, [rawTasks, BUCKETS]);

  async function toggleTask(_listId, taskId) {
    // Optimistic flip locally, then persist.
    let nextCompleted = false;
    setRawTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t;
      nextCompleted = !t.completed;
      return { ...t, completed: nextCompleted };
    }));
    try {
      await base44.entities.PersonalTasks.update(taskId, { completed: nextCompleted });
    } catch {
      // Revert on failure.
      setRawTasks((prev) => prev.map((t) =>
        t.id === taskId ? { ...t, completed: !nextCompleted } : t,
      ));
    }
  }

  return (
    <section style={listsShell} aria-label="My lists">
      <div style={listsHead}>
        <span style={kicker}>MY LISTS</span>
        <button onClick={() => openLogger("task")} style={listsAddBtn}><Plus size={11} /> New list</button>
      </div>
      <div style={listsChipRow}>
        {lists.map((l) => {
          const open = expanded === l.id;
          return (
            <button key={l.id} onClick={() => setExpanded(open ? null : l.id)} style={{
              ...listsChip,
              borderColor: open ? l.colour : "rgba(58,44,26,0.18)",
              background: open ? `${l.colour}1A` : C.paperHi,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 9999, background: l.colour }} />
              {l.name}
              {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          );
        })}
      </div>
      {expanded && (
        <div style={listsAccordion}>
          {(lists.find((l) => l.id === expanded)?.tasks || []).map((t) => (
            <label key={t.id} style={listsTaskRow}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(expanded, t.id)} style={{ accentColor: C.sage }} />
              <span style={{ fontSize: 13, color: C.espresso,
                textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.5 : 1 }}>{t.text}</span>
              {t.due && <span style={listsDueChip}>today</span>}
            </label>
          ))}
          <button
            onClick={() => openLogger("task")}
            style={{
              alignSelf: "flex-start", marginTop: 6,
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "5px 10px", borderRadius: 9999,
              background: "transparent", border: "1px dashed rgba(58,44,26,0.20)",
              color: C.muted, cursor: "pointer", fontStyle: "italic", fontWeight: 600,
              fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11,
            }}
          >
            <Plus size={11} /> Add task
          </button>
        </div>
      )}
    </section>
  );
}

// ── Schedule preview card ─────────────────────────────────────────────────
function SchedulePreviewCard({ blocks, onExpand }) {
  const upcoming = blocks.filter((b) => !b.done).slice(0, 3);
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <span style={{ ...iconChip, background: `${C.gold}1F`, color: C.gold }}><Activity size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SCHEDULE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>Today, hour by hour</h3>
        </div>
        <button onClick={onExpand} style={expandIconBtn} aria-label="Expand schedule">
          <Maximize2 size={13} />
        </button>
      </div>
      <ul style={{ ...bulletList, gap: 6, marginTop: 6 }}>
        {upcoming.map((b) => {
          const tones = TYPE_TONES[b.type] || TYPE_TONES.task;
          return (
            <li key={b.id} style={{ ...miniRow, background: tones.bg, borderLeft: `3px solid ${tones.bar}` }}>
              <span style={miniRowTime}>{(b.hour <= 12 ? b.hour : b.hour - 12) + (b.hour < 12 ? "am" : "pm")}</span>
              <span style={miniRowTitle}>{b.title}</span>
              <span style={miniRowDur}>{b.duration}m</span>
            </li>
          );
        })}
      </ul>
      <button onClick={onExpand} style={openFullBtn}>
        View full schedule <ChevronRight size={12} />
      </button>
    </article>
  );
}

// ── Cycle preview card ────────────────────────────────────────────────────
function CyclePreviewCard({ onExpand }) {
  const tone = PHASE_DEEP[profile.phase];
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <span style={{ ...iconChip, background: `${tone}1F`, color: tone }}><Calendar size={13} /></span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>CYCLE</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>May 2026 · Luteal week</h3>
        </div>
        <button onClick={onExpand} style={expandIconBtn} aria-label="Expand calendar">
          <Maximize2 size={13} />
        </button>
      </div>
      <div style={miniWeekRow}>
        {weekStrip.map((d, i) => {
          const phaseDeep = PHASE_DEEP[d.phase];
          return (
            <div key={i} style={{
              ...miniWeekCell,
              background: d.today ? "#FFFFFF" : phaseDeep,
              boxShadow: d.today ? "0 2px 8px rgba(58,44,26,0.15)" : "none",
              border: d.today ? `1px solid rgba(58,44,26,0.12)` : `1px solid transparent`,
            }}>
              <span style={{ ...miniWeekLetter, color: d.today ? C.muted : "rgba(255,255,255,0.85)" }}>{d.d}</span>
              <span style={{ ...miniWeekNum, color: d.today ? C.espresso : "rgba(255,255,255,0.95)" }}>{d.date}</span>
            </div>
          );
        })}
      </div>
      <p style={cardSub}>Period predicted in <b>3 days</b> · 84% confidence</p>
      <button onClick={onExpand} style={openFullBtn}>
        Open month view <ChevronRight size={12} />
      </button>
    </article>
  );
}

// ── Your Day part card ────────────────────────────────────────────────────
function DayPartCard({ part }) {
  const variants = {
    morning: {
      Icon: Sun, accent: C.gold, label: "Morning",
      sub: "Until noon · peak energy window",
      tasks: ["Drink water", "Morning walk", "Folic acid", "Investor update — deep work"],
      tip: "Ovulatory phase — front-load your day with what matters most.",
    },
    afternoon: {
      Icon: Activity, accent: C.sage, label: "Afternoon",
      sub: "Noon — 6pm · steady momentum",
      tasks: ["Lunch + 10-min walk", "Strength · 25m", "Antenatal class", "Pharmacy call"],
      tip: "Confidence is your tailwind — send the bold email.",
    },
    evening: {
      Icon: Moon, accent: C.muted, label: "Evening",
      sub: "After 6pm · wind-down",
      tasks: ["Wind-down · journal", "Magnesium", "Screens off by 9pm", "Bed by 10:30pm"],
      tip: "Protect tonight's sleep — tomorrow is still ovulatory.",
    },
  };
  const v = variants[part];
  return (
    <article style={{ ...cardStyle, borderTop: `3px solid ${v.accent}` }}>
      <div style={cardHeadRow}>
        <span style={{ ...iconChip, background: `${v.accent}1F`, color: v.accent }}>
          <v.Icon size={13} />
        </span>
        <div style={{ flex: 1 }}>
          <span style={kicker}>{part.toUpperCase()}</span>
          <h3 style={{ ...cardTitle, margin: "2px 0 0" }}>{v.label}</h3>
        </div>
      </div>
      <p style={cardSub}>{v.sub}</p>
      <ul style={{ ...bulletList, gap: 5, marginTop: 6 }}>
        {v.tasks.map((t) => (
          <li key={t} style={bulletLine}>
            <span style={{ ...bulletDot, background: v.accent }} />
            {t}
          </li>
        ))}
      </ul>
      <p style={tipText}>{v.tip}</p>
    </article>
  );
}

// ── Body / Smart View / Cycle zone ────────────────────────────────────────
// Phase B4 — DailyCheckins + SymptomLogs wiring.
// Maps the 1-5 mood/energy scale to the demo's text labels so the
// existing visual (chip pills + ring + expanded tile grid) is untouched.
const MOOD_LABEL   = { 1: "Heavy", 2: "Tender", 3: "Settled", 4: "Bright", 5: "Buoyant" };
const ENERGY_LABEL = { 1: "Low",   2: "Easy",   3: "Steady",  4: "High",   5: "Soaring" };
function sleepLabel(hours) {
  if (hours == null || !Number.isFinite(Number(hours))) return "—";
  const h = Number(hours);
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return mins > 0 ? `${whole}h ${String(mins).padStart(2, "0")}m` : `${whole}h`;
}
function BodyTodayCard({ user }) {
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem("femwell_body_strip_expanded") === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem("femwell_body_strip_expanded", expanded ? "1" : "0"); } catch {}
  }, [expanded]);

  // Real data: today's DailyCheckins (mood/energy/sleep) + SymptomLogs.
  const [checkin, setCheckin] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const [checkins, syms] = await Promise.all([
          base44.entities.DailyCheckins.filter({ user_id: user.id, date: todayISO }, "-updated_at", 1).catch(() => []),
          base44.entities.SymptomLogs.filter({ user_id: user.id, date: todayISO }, "-created_date", 10).catch(() => []),
        ]);
        if (cancelled) return;
        setCheckin(Array.isArray(checkins) && checkins[0] ? checkins[0] : null);
        setSymptoms(Array.isArray(syms) ? syms : []);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const moodNum     = checkin?.mood ?? checkin?.mood_score ?? null;
  const energyNum   = checkin?.energy ?? checkin?.energy_level ?? null;
  const sleepHrs    = checkin?.sleep_hours ?? null;
  const moodLabel   = moodNum   != null ? MOOD_LABEL[moodNum]   || "—" : "—";
  const energyLabel = energyNum != null ? ENERGY_LABEL[energyNum] || "—" : "—";
  const sleepText   = sleepLabel(sleepHrs);
  const firstSymptom = symptoms[0]?.symptom_type || "—";

  // Capacity ring: rough composite of mood + energy → 0-100. Falls back to
  // the demo's 55 baseline when no checkin exists, so the ring never reads
  // visually broken.
  const composite = (moodNum != null && energyNum != null)
    ? Math.round(((moodNum + energyNum) / 10) * 100)
    : 55;
  const pct = composite;
  const R = 30, CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - pct / 100);
  const phaseTone = PHASE_LIGHT[profile.phase];
  const phaseToneDeep = PHASE_DEEP[profile.phase];
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <span style={{ ...phaseChip, background: `${phaseTone}1F`, color: phaseToneDeep, border: `1px solid ${phaseTone}55` }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: phaseTone, marginRight: 5 }} />
          {profile.phase[0].toUpperCase() + profile.phase.slice(1)} Day {profile.cycleDay}
        </span>
        <button onClick={() => setExpanded((v) => !v)} style={expandBtn}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      <div style={ringRow}>
        <svg width={76} height={76} viewBox="0 0 76 76">
          <circle cx={38} cy={38} r={R} fill="none" stroke={C.faint} strokeWidth={6} />
          <circle cx={38} cy={38} r={R} fill="none" stroke={phaseToneDeep} strokeWidth={6} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={offset} transform="rotate(-90 38 38)" />
          <text x={38} y={42} textAnchor="middle" fontFamily="'Fraunces', Georgia, serif" fontSize={22} fontWeight="500" fill={C.espresso}>{pct}</text>
        </svg>
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={ringTitle}>Capacity</div>
          <div style={ringSub}>Settling rhythm</div>
        </div>
      </div>
      <div style={miniChipRow}>
        <button onClick={() => openLogger("checkin")} style={miniChip}><Smile size={12} style={{ color: C.rose }} /> Mood {moodNum ?? ""}</button>
        <button onClick={() => openLogger("checkin")} style={miniChip}><Zap size={12} style={{ color: C.goldDeep }} /> Energy {energyNum ?? ""}</button>
        <button onClick={() => openLogger("checkin")} style={miniChip}><Moon size={12} style={{ color: C.muted }} /> Sleep {sleepHrs != null ? `${sleepHrs}h` : "—"}</button>
      </div>
      {expanded && (
        <div style={bodyGridStyle}>
          {[
            { label: "Mood",       value: moodLabel,                              Icon: Smile,    tone: C.rose },
            { label: "Energy",     value: energyLabel,                            Icon: Zap,      tone: C.goldDeep },
            { label: "Sleep",      value: sleepText,                              Icon: Moon,     tone: C.muted },
            { label: "Symptom",    value: firstSymptom,                           Icon: Droplets, tone: "#60B4FA" },
            { label: "Cycle day",  value: `${profile.cycleDay}/${profile.cycleLen}`, Icon: CircleDot, tone: C.gold },
            { label: "Symptoms",   value: symptoms.length === 0 ? "None" : `${symptoms.length} today`, Icon: Calendar, tone: C.sage },
          ].map((it) => (
            <div key={it.label} style={bodyTile}>
              <span style={{ ...bodyIcon, background: `${it.tone}1F`, color: it.tone }}><it.Icon size={11} /></span>
              <div>
                <div style={bodyValue}>{it.value}</div>
                <div style={bodyLabel}>{it.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function SmartViewCard() {
  const bullets = [
    "Lower the activity bar — your body is finishing the cycle",
    "Magnesium + warm cooked food make luteal kinder",
    "Bed by 10:30 protects tomorrow's mood",
  ];
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <span style={kicker}>SMART VIEW</span>
        <span style={astraTag}>Powered by Astra</span>
      </div>
      <h3 style={cardTitle}>What your body needs today</h3>
      <ul style={bulletList}>
        {bullets.map((b) => (
          <li key={b} style={bulletLine}><span style={bulletDot} />{b}</li>
        ))}
      </ul>
    </article>
  );
}

function CycleZoneCard({ onOpen }) {
  const tone = PHASE_DEEP[profile.phase];
  return (
    <article style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
      <div style={{ ...cycleBanner, background: `linear-gradient(135deg, ${tone}22 0%, ${tone}08 100%)`, borderBottom: `1px solid ${tone}33` }}>
        <span style={cycleBannerLabel}>{profile.phase.toUpperCase()}</span>
        <p style={cycleBannerSub}>Day {profile.cycleDay} of {profile.cycleLen} · period in 3 days</p>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <span style={kicker}>PREDICTED TODAY</span>
        <div style={chipBowl}>
          <span style={softChip}><span style={{ ...softChipDot, background: C.muted }} /> Energy easing</span>
          <span style={softChip}><span style={{ ...softChipDot, background: C.blush }} /> PMS rising</span>
          <span style={softChip}><span style={{ ...softChipDot, background: tone }} /> Inner autumn</span>
        </div>
        <button onClick={onOpen} style={openCycleBtn}>
          Open cycle calendar <ChevronRight size={12} />
        </button>
      </div>
    </article>
  );
}

// ── Morning stack + Consistency ────────────────────────────────────────────
function MorningStackCard({ user }) {
  // Live habit data from HabitLogs, grouped by time_of_day.
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let uid = user?.id;
        if (!uid) {
          const me = await base44.entities.User.me().catch(() => null);
          uid = me?.id;
        }
        if (!uid || cancelled) return;
        // Drop the date filter and trim client-side. Some HabitLogs rows
        // (especially those backfilled or written by older code paths) have
        // an inconsistent `date` field — sometimes ISO datetime, sometimes
        // null, sometimes a mismatched format — so a strict server-side
        // `date` equality filter misses real rows. Track.jsx fetches all
        // rows for the user then filters by date in JS for this same reason.
        const allRows = await base44.entities.HabitLogs
          .filter({ user_id: uid }, "-updated_date", 400).catch(() => []);
        if (cancelled) return;
        const todayRows = (allRows || []).filter(
          (r) => r && (r.date === todayISO || (r.date || "").startsWith(todayISO)),
        );
        setHabits(todayRows);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Group: morning / evening / anytime (no time_of_day = anytime).
  const morning  = habits.filter(h => (h.time_of_day || "").toLowerCase() === "morning");
  const evening  = habits.filter(h => (h.time_of_day || "").toLowerCase() === "evening");
  const anytime  = habits.filter(h => !h.time_of_day || !["morning", "evening", "afternoon"].includes((h.time_of_day || "").toLowerCase()));

  const toggleRow = async (row) => {
    const isDone = !!(row.completed || row.is_completed);
    const next = !isDone;
    // Optimistic flip.
    setHabits(prev => prev.map(h => h.id === row.id
      ? { ...h, completed: next, is_completed: next }
      : h));
    try {
      await base44.entities.HabitLogs.update(row.id, {
        completed: next, is_completed: next,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Revert on failure.
      setHabits(prev => prev.map(h => h.id === row.id
        ? { ...h, completed: isDone, is_completed: isDone }
        : h));
    }
  };

  const rowText = (h) => h.habit_name || h.habit_type || "Habit";

  const renderRow = (h) => (
    <CheckboxRow
      key={h.id}
      checked={!!(h.completed || h.is_completed)}
      onChange={() => toggleRow(h)}
      text={rowText(h)}
    />
  );

  const empty = morning.length === 0 && evening.length === 0 && anytime.length === 0;

  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Morning stack</h3>
      {empty && (
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.muted,
          padding: "12px 0",
        }}>
          No rituals for today — add some from the logger or the Rituals carousel below.
        </p>
      )}
      {morning.length > 0 && (
        <Section name="MORNING">
          {morning.map(renderRow)}
        </Section>
      )}
      {anytime.length > 0 && (
        <Section name="ANYTIME">
          {anytime.map(renderRow)}
        </Section>
      )}
      {evening.length > 0 && (
        <Section name="EVENING">
          {evening.map(renderRow)}
        </Section>
      )}
    </article>
  );
}

function ConsistencyCard() {
  const W = 140, R = 56;
  const data = Array.from({ length: 28 }, (_, i) => ({ hit: i < 14 ? (i + 1) % 4 !== 0 : (i < 21) }));
  const segments = data.map((d, i) => {
    const startA = (i / 28) * Math.PI * 2 - Math.PI / 2;
    const endA = ((i + 1) / 28) * Math.PI * 2 - Math.PI / 2 - 0.04;
    const x1 = W/2 + R * Math.cos(startA);
    const y1 = W/2 + R * Math.sin(startA);
    const x2 = W/2 + R * Math.cos(endA);
    const y2 = W/2 + R * Math.sin(endA);
    return { path: `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`, hit: d.hit };
  });
  const hits = data.filter((d) => d.hit).length;
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Consistency</h3>
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
        <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`}>
          {segments.map((s, i) => (
            <path key={i} d={s.path} fill="none" stroke={s.hit ? C.sage : "rgba(58,44,26,0.10)"} strokeWidth={8} strokeLinecap="round" />
          ))}
          <text x={W/2} y={W/2 - 4} textAnchor="middle" fontFamily="'Fraunces', Georgia, serif" fontSize={26} fontWeight={500} fill={C.espresso}>{hits}</text>
          <text x={W/2} y={W/2 + 16} textAnchor="middle" fontFamily="'Inter', sans-serif" fontSize={10} fill={C.muted} letterSpacing={1.2}>/ 28 DAYS</text>
        </svg>
      </div>
      <div style={{ textAlign: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, color: C.espresso, marginTop: 4 }}>
        {hits} of 28 days this cycle
      </div>
      <div style={streakLeadersRow}>
        <span style={leaderChip}>Morning movement <b>28d</b></span>
        <span style={leaderChip}>Gratitude <b>35d</b></span>
      </div>
    </article>
  );
}

// ── Rituals ───────────────────────────────────────────────────────────────
function CreateRitualCard() {
  return (
    <button onClick={() => openLogger("ritual")} style={createRitualCard}>
      <span style={createRitualIcon}><Sparkles size={24} style={{ color: C.gold }} /></span>
      <span style={createRitualTitle}>Build a ritual</span>
      <span style={createRitualSub}>Your own bundle, your phase, your time</span>
    </button>
  );
}
function RitualBundleCard({ bundle, user }) {
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  // Comprehensive audit: on mount, check whether all of this bundle's
  // rituals already exist in today's HabitLogs. If so, mark Added so the
  // CTA reflects reality after reload / across sessions. This is the
  // "slider state lift" — the card derives its Added flag from the
  // HabitLogs slice rather than purely local optimistic state.
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const existing = await base44.entities.HabitLogs.filter(
          { user_id: user.id, date: todayISO }, null, 200,
        ).catch(() => []);
        if (cancelled) return;
        const have = new Set((existing || [])
          .map((r) => (r?.habit_name || r?.habit_type || "").toLowerCase())
          .filter(Boolean));
        const allPresent = bundle.rituals.every((name) => have.has(String(name).toLowerCase()));
        if (allPresent) setAdded(true);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id, bundle.id]);

  // Phase B6 follow-up: tap "Add to stack" creates one HabitLogs row per
  // ritual in the bundle for today (skipping duplicates by name).
  async function handleAddToStack() {
    if (added || adding) return;
    setAdding(true);
    setAdded(true); // optimistic
    try {
      if (user?.id) {
        const existing = await base44.entities.HabitLogs.filter(
          { user_id: user.id, date: todayISO }, null, 80,
        ).catch(() => []);
        const have = new Set((existing || []).map((r) => (r?.habit_name || r?.habit_type || "").toLowerCase()).filter(Boolean));
        for (const name of bundle.rituals) {
          if (have.has(String(name).toLowerCase())) continue;
          try {
            const nowISO = new Date().toISOString();
            await base44.entities.HabitLogs.create({
              user_id: user.id,
              habit_type: name, habit_name: name,
              habit_category: "mindfulness",
              date: todayISO,
              completed: false, is_completed: false,
              time_of_day: (bundle.time || "morning").toLowerCase(),
              created_at: nowISO, updated_at: nowISO,
            });
          } catch { /* silent */ }
        }
      }
    } finally {
      setAdding(false);
    }
  }
  return (
    <article style={{ ...cardStyle, borderTop: `3px solid ${bundle.accent}` }}>
      <div style={cardHeadRow}>
        <h3 style={{ ...cardTitle, margin: 0 }}>{bundle.title}</h3>
        <span style={{ ...countChip, color: bundle.accent, border: `1px solid ${bundle.accent}55`, background: `${bundle.accent}1F` }}>
          {bundle.count} items
        </span>
      </div>
      <div style={metaRow}>
        <span style={timeChip}><Sun size={10} /> {bundle.time}</span>
        <span style={timeChip}><Activity size={10} /> {bundle.duration}</span>
      </div>
      <ul style={ritualList}>
        {bundle.rituals.slice(0, 3).map((r) => (
          <li key={r} style={ritualLine}><Sparkles size={9} style={{ color: bundle.accent, flexShrink: 0 }} /> {r}</li>
        ))}
        {bundle.rituals.length > 3 && <li style={{ ...ritualLine, color: C.muted, fontStyle: "italic" }}>+{bundle.rituals.length - 3} more</li>}
      </ul>
      <button onClick={handleAddToStack} disabled={added || adding} style={{
        ...addToStackBtn,
        background: added ? "transparent" : C.espresso,
        color: added ? C.espresso : C.cream,
        borderColor: added ? C.espresso : "transparent",
      }}>
        {added ? (<><Check size={12} /> Added</>) : "Add to stack"}
      </button>
    </article>
  );
}

// ── Planning ──────────────────────────────────────────────────────────────
function PlanADayCard() {
  const [mode, setMode] = useState("none");
  const dateRef = useRef(null);
  const [todayPlan, setTodayPlan] = useState([
    "Deep work · investor update", "Lunch with Sam", "Strength · 25m", "Wind-down by 9pm",
  ]);
  const [editing, setEditing] = useState(false);
  function openDatePicker() {
    const el = dateRef.current; if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else { el.focus(); el.click(); }
  }
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Plan a day</h3>
      {mode === "none" && (
        <div style={planBtnRow}>
          <button onClick={() => setMode("today")} style={planBtn}>
            <CalendarCheck size={20} style={{ color: C.espresso }} />
            <span style={planBtnLabel}>Today</span>
          </button>
          <button onClick={openDatePicker} style={planBtn}>
            <Calendar size={20} style={{ color: C.espresso }} />
            <span style={planBtnLabel}>Pick a date</span>
          </button>
          <input ref={dateRef} type="date" min={todayISO}
            onChange={(e) => { setMode("none"); e.target.value = ""; }}
            style={hiddenDateInput} tabIndex={-1} />
        </div>
      )}
      {mode === "today" && (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={kicker}>TODAY'S PLAN</span>
            <button onClick={() => setEditing((v) => !v)} style={editPlanBtn}>
              <Edit3 size={12} /> {editing ? "Done" : "Edit"}
            </button>
          </div>
          <ul style={todayPlanList}>
            {todayPlan.map((p, i) => (
              <li key={i} style={todayPlanLine}>
                <span style={todayPlanDot} />
                {editing ? (
                  <input type="text" value={p}
                    onChange={(e) => setTodayPlan((arr) => arr.map((x, j) => j === i ? e.target.value : x))}
                    style={editPlanInput} />
                ) : (
                  <span style={todayPlanText}>{p}</span>
                )}
              </li>
            ))}
          </ul>
          <button onClick={() => setMode("none")} style={planBackBtn}>Back</button>
        </div>
      )}
    </article>
  );
}

function WeekStripCard() {
  const [popover, setPopover] = useState(null);
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>This week</h3>
      <div style={weekStripGrid}>
        {weekStrip.map((d, i) => {
          const tone = ENERGY_TONE[d.energy];
          return (
            <button key={i} onClick={() => setPopover(popover === i ? null : i)} style={{
              ...weekChip,
              background: d.today ? C.espresso : C.paperHi,
              color: d.today ? C.cream : C.espresso,
              borderColor: d.today ? C.espresso : "rgba(58,44,26,0.10)",
            }}>
              <span style={weekChipLetter}>{d.d}</span>
              <span style={weekChipDate}>{d.date}</span>
              <span style={{ ...weekChipDot, background: tone }} />
            </button>
          );
        })}
      </div>
      {popover != null && (
        <div style={weekPopover}>
          {(() => {
            const d = weekStrip[popover];
            const dayName = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][popover];
            return (
              <>
                <span style={kicker}>{dayName.toUpperCase()}</span>
                <p style={weekPopText}>{d.phase[0].toUpperCase() + d.phase.slice(1)} · {d.energy[0].toUpperCase() + d.energy.slice(1)} energy</p>
              </>
            );
          })()}
        </div>
      )}
    </article>
  );
}

// ── Intention + Astra ─────────────────────────────────────────────────────
function IntentionCard({ user }) {
  const key = `femwell_intention_${todayISO}`;
  const [val, setVal] = useState(() => { try { return localStorage.getItem(key) || ""; } catch { return ""; } });
  const [saved, setSaved] = useState(false);
  // DailyCheckins has no `daily_intention` field (verified against schema).
  // Persist to JournalEntries keyed by tag="daily_intention" instead.
  const [entryId, setEntryId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.JournalEntries.filter(
          { user_id: user.id, session_date: todayISO }, "-updated_date", 40,
        );
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        const row = list.find((r) => Array.isArray(r?.tags) && r.tags.includes("daily_intention"));
        if (row?.id) setEntryId(row.id);
        if (row?.text) setVal((cur) => cur || row.text);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  async function handleBlur() {
    try { localStorage.setItem(key, val); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    const trimmed = (val || "").trim();
    if (!trimmed || !user?.id) return;
    try {
      if (entryId) {
        await base44.entities.JournalEntries.update(entryId, { text: trimmed });
      } else {
        const created = await base44.entities.JournalEntries.create({
          user_id: user.id, session_date: todayISO,
          text: trimmed, tags: ["daily_intention"],
          prompt: intentionPrompts[profile.phase],
        });
        if (created?.id) setEntryId(created.id);
      }
    } catch { /* silent */ }
  }
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Daily intention</h3>
      <p style={intentionPromptStyle}>{intentionPrompts[profile.phase]}</p>
      <textarea value={val} onChange={(e) => setVal(e.target.value)} onBlur={handleBlur}
        placeholder="Write here…" style={intentionTextarea} rows={4} />
      {saved && <span style={savedChip}><Check size={11} style={{ color: C.sage }} /> Saved</span>}
    </article>
  );
}

function AstraCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <article
        style={{ ...cardStyle, position: "relative", cursor: "pointer" }}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } }}
      >
        <div style={astraAvatar}><Sparkles size={14} style={{ color: C.gold }} /></div>
        <span style={kicker}>ASTRA · READING</span>
        <h3 style={cardTitle}>{astraReading.title}</h3>
        <p style={astraShort}>{astraReading.short}</p>
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          style={astraOpenBtn}
        >Full reading <ChevronRight size={12} /></button>
      </article>
      {open && (
        <div
          style={{ ...modalBackdrop, zIndex: 9999, alignItems: "flex-start", padding: 0 }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              ...modalCard,
              width: "100%", maxWidth: "100%",
              minHeight: "100vh", maxHeight: "100vh",
              borderRadius: 0, overflowY: "auto",
              padding: "max(20px, env(safe-area-inset-top)) 20px max(20px, env(safe-area-inset-bottom))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHead}>
              <span style={kicker}>ASTRA · FULL READING</span>
              <button onClick={() => setOpen(false)} style={drawerCloseBtn}><X size={14} /></button>
            </div>
            <h3 style={modalTitle}>{astraReading.title}</h3>
            <p style={astraSheetText}>{astraReading.full}</p>
          </div>
        </div>
      )}
    </>
  );
}

// ── Mind & Insight extras (Mood / Breathwork / Cycle psych) ──────────────
function MoodMentalHealthCard({ user }) {
  // Phase B5 — 7-day mood dots now come from the last 30 DailyCheckins,
  // indexed by date, capped to the 7-day window ending today. Missing days
  // fall back to value 2 so the bar still renders (visual is unchanged).
  const [moodDots, setMoodDots] = useState(() => [
    { v: 3, label: "T" }, { v: 4, label: "W" }, { v: 3, label: "T" },
    { v: 2, label: "F" }, { v: 2, label: "S" }, { v: 3, label: "S" }, { v: 3, label: "M" },
  ]);
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.DailyCheckins.filter(
          { user_id: user.id }, "-date", 30,
        );
        if (cancelled) return;
        const byDate = new Map();
        for (const r of rows || []) {
          if (!r?.date) continue;
          const v = r?.mood ?? r?.mood_score ?? null;
          if (!byDate.has(r.date) && v != null) byDate.set(r.date, Number(v));
        }
        const out = [];
        const dayInits = ["S", "M", "T", "W", "T", "F", "S"];
        const todayD = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(todayD);
          d.setDate(todayD.getDate() - i);
          const key = d.toISOString().split("T")[0];
          out.push({ v: byDate.get(key) ?? 2, label: dayInits[d.getDay()] });
        }
        setMoodDots(out);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);
  const colorFor = (v) => v >= 4 ? C.sage : v >= 3 ? C.gold : C.blush;
  const [carrying, setCarrying] = useState("");
  const [relief, setRelief] = useState("");
  // Track existing JournalEntries rows by tag so blur updates instead of
  // spawning a new row each keystroke.
  const [carryingEntryId, setCarryingEntryId] = useState(null);
  const [reliefEntryId, setReliefEntryId] = useState(null);

  // DailyCheckins has no `reflection_carrying` / `reflection_relief` fields
  // (schema verified — the only string field is `notes`). Use JournalEntries
  // with a tag scope instead, keyed by user_id + session_date + tag.
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.JournalEntries.filter(
          { user_id: user.id, session_date: todayISO }, "-updated_date", 40,
        );
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        const carryRow  = list.find((r) => Array.isArray(r?.tags) && r.tags.includes("reflection_carrying"));
        const reliefRow = list.find((r) => Array.isArray(r?.tags) && r.tags.includes("reflection_relief"));
        if (carryRow?.id)   setCarryingEntryId(carryRow.id);
        if (reliefRow?.id)  setReliefEntryId(reliefRow.id);
        if (carryRow?.text)  setCarrying((c) => c || carryRow.text);
        if (reliefRow?.text) setRelief((r) => r || reliefRow.text);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Persist a single reflection field to JournalEntries (upsert by tag).
  async function saveReflection(tag, value, entryId, setEntryId) {
    if (!user?.id) return;
    const trimmed = (value || "").trim();
    if (!trimmed) return;
    try {
      if (entryId) {
        await base44.entities.JournalEntries.update(entryId, { text: trimmed });
      } else {
        const created = await base44.entities.JournalEntries.create({
          user_id: user.id, session_date: todayISO,
          text: trimmed, tags: ["reflection", tag],
          prompt: tag === "reflection_carrying"
            ? "What are you carrying today?"
            : "What would feel like relief?",
        });
        if (created?.id) setEntryId(created.id);
      }
    } catch { /* silent */ }
  }

  return (
    <article style={cardStyle}>
      <span style={kicker}>MOOD & MENTAL HEALTH</span>
      <h3 style={cardTitle}>How are you really feeling?</h3>
      <div style={moodWeekRow}>
        {moodDots.map((d, i) => (
          <span key={i} style={moodDotCol}>
            <span style={{ ...moodDot, background: colorFor(d.v) }} />
            <span style={moodDotLabel}>{d.label}</span>
          </span>
        ))}
      </div>
      <p style={tipText}>Luteal can bring emotional intensity — this is biological, not personal.</p>
      <label style={miniInputLabel}>
        <span style={miniLabel}>WHAT ARE YOU CARRYING TODAY?</span>
        <textarea
          value={carrying}
          onChange={(e) => setCarrying(e.target.value)}
          onBlur={() => saveReflection("reflection_carrying", carrying, carryingEntryId, setCarryingEntryId)}
          placeholder="…"
          rows={2}
          style={{ ...miniInput, minHeight: 44, resize: "vertical", fontFamily: "'Inter', sans-serif" }}
        />
      </label>
      <label style={miniInputLabel}>
        <span style={miniLabel}>WHAT WOULD FEEL LIKE RELIEF?</span>
        <textarea
          value={relief}
          onChange={(e) => setRelief(e.target.value)}
          onBlur={() => saveReflection("reflection_relief", relief, reliefEntryId, setReliefEntryId)}
          placeholder="…"
          rows={2}
          style={{ ...miniInput, minHeight: 44, resize: "vertical", fontFamily: "'Inter', sans-serif" }}
        />
      </label>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); try { window.location.href = "/Jess"; } catch {} }}
        style={{ ...talkJessBtn, pointerEvents: "auto", position: "relative", zIndex: 1 }}
      >
        <Sparkles size={11} style={{ color: C.gold }} /> Talk to Jess <ChevronRight size={11} />
      </button>
    </article>
  );
}

function BreathworkCard() {
  const patterns = [
    { id: "box",    name: "Box breathing",   pattern: "4-4-4-4", duration: "4 min", purpose: "Calm" },
    { id: "478",    name: "4-7-8 breathing", pattern: "4-7-8",   duration: "5 min", purpose: "Sleep" },
    { id: "sigh",   name: "Cyclic sighing",  pattern: "2-1",     duration: "3 min", purpose: "Stress relief" },
  ];
  const [active, setActive] = useState(null);
  return (
    <article style={cardStyle}>
      <span style={kicker}>BREATHWORK</span>
      <h3 style={cardTitle}>Centre yourself</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
        {patterns.map((p) => (
          <button key={p.id} onClick={() => setActive(active === p.id ? null : p.id)} style={{
            ...breathwork,
            background: active === p.id ? `${C.gold}1F` : C.cream,
            borderColor: active === p.id ? C.gold : "rgba(58,44,26,0.08)",
          }}>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <div style={breathName}>{p.name}</div>
              <div style={breathMeta}>{p.pattern} · {p.duration} · {p.purpose}</div>
            </div>
            {active === p.id ? <BreathOrb /> : <ChevronRight size={12} style={{ color: C.muted }} />}
          </button>
        ))}
      </div>
      <p style={tipText}>Luteal — try 4-7-8 tonight for sleep.</p>
      <button
        type="button"
        onClick={() => { try { window.location.href = "/Lifestyle"; } catch {} }}
        style={astraOpenBtn}
      >
        Guided sessions in Lifestyle <ChevronRight size={11} />
      </button>
    </article>
  );
}

function BreathOrb() {
  return (
    <>
      <style>{`@keyframes fwBreathe { 0%,100% { transform: scale(0.7); } 50% { transform: scale(1.0); } }`}</style>
      <span style={{
        width: 24, height: 24, borderRadius: 9999,
        background: C.gold, opacity: 0.7,
        animation: "fwBreathe 4000ms ease-in-out infinite",
        display: "inline-block",
      }} />
    </>
  );
}

function CyclePsychologyCard() {
  const seasonNames = {
    menstrual: "Inner Winter", follicular: "Inner Spring",
    ovulatory: "Inner Summer", luteal: "Inner Autumn",
  };
  const seasonChars = {
    menstrual:  ["Energy turns inward", "Boundaries feel natural", "Rest is the work"],
    follicular: ["Curiosity rises", "New ideas land easily", "Energy feels lighter"],
    ovulatory:  ["Verbal sharpness peaks", "Confidence is high", "Visibility lands well"],
    luteal:     ["Reflection sharpens", "Boundaries feel natural", "Inner critic may get loud"],
  };
  return (
    <article style={cardStyle}>
      <span style={kicker}>CYCLE PSYCHOLOGY</span>
      <h3 style={cardTitle}>Your inner season</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: `${PHASE_DEEP[profile.phase]}1F`, border: `1px solid ${PHASE_DEEP[profile.phase]}33` }}>
        <span style={{ width: 12, height: 12, borderRadius: 9999, background: PHASE_DEEP[profile.phase] }} />
        <div>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500, color: C.espresso }}>
            {profile.phase[0].toUpperCase() + profile.phase.slice(1)} · {seasonNames[profile.phase]}
          </div>
        </div>
      </div>
      <ul style={{ ...bulletList, gap: 5, marginTop: 8 }}>
        {seasonChars[profile.phase].map((c) => (
          <li key={c} style={bulletLine}><span style={bulletDot} />{c}</li>
        ))}
      </ul>
      <p style={{ ...tipText, fontStyle: "italic" }}>This is normal. You are not broken.</p>
      <button
        onClick={() => { try { window.location.href = "/Lifestyle"; } catch {} }}
        style={astraOpenBtn}
      >Learn more about your phase <ChevronRight size={12} /></button>
    </article>
  );
}

// ── Nourishment (4 new cards) ─────────────────────────────────────────────
function MacroTrackerCard() {
  const macros = [
    { label: "Protein", value: 62, target: 80, tone: C.sage,  unit: "g" },
    { label: "Carbs",   value: 145, target: 200, tone: C.gold,  unit: "g" },
    { label: "Fat",     value: 48, target: 65, tone: C.blush, unit: "g" },
  ];
  return (
    <article style={cardStyle}>
      <span style={kicker}>MACRO TRACKER</span>
      <h3 style={cardTitle}>Today's plate</h3>
      <div style={macroRingRow}>
        {macros.map((m) => {
          const R = 24, CIRC = 2 * Math.PI * R;
          const pct = Math.min(1, m.value / m.target);
          const offset = CIRC * (1 - pct);
          return (
            <div key={m.label} style={macroCol}>
              <svg width={64} height={64} viewBox="0 0 64 64">
                <circle cx={32} cy={32} r={R} fill="none" stroke={C.faint} strokeWidth={5} />
                <circle cx={32} cy={32} r={R} fill="none" stroke={m.tone} strokeWidth={5}
                  strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
                  transform="rotate(-90 32 32)" />
                <text x={32} y={36} textAnchor="middle" fontFamily="'Fraunces', Georgia, serif" fontSize={15} fontWeight="500" fill={C.espresso}>{m.value}</text>
              </svg>
              <div style={macroLabel}>{m.value}/{m.target}{m.unit}</div>
              <div style={macroSub}>{m.label}</div>
            </div>
          );
        })}
      </div>
      <button onClick={() => openLogger("meal")} style={astraOpenBtn}>Log a meal <ChevronRight size={12} /></button>
    </article>
  );
}

// Phase B5 — HydrationLog wiring. Each tap of + creates a 250ml row;
// minus subtracts locally only (deletion of the most-recent row would be
// noisy and out of scope). Initial glasses derived from sum(amount_ml)/250
// of today's HydrationLog rows.
function HydrationCard({ user }) {
  const [glasses, setGlasses] = useState(0);
  const target = 8;
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.HydrationLog.filter(
          { user_id: user.id, day_key: todayISO },
          "-logged_at",
          80,
        );
        if (cancelled) return;
        const sumMl = (rows || []).reduce((acc, r) => {
          if (typeof r?.amount_ml === "number") return acc + r.amount_ml;
          if (typeof r?.glasses_count === "number") return acc + r.glasses_count * 250;
          return acc;
        }, 0);
        setGlasses(Math.min(target, Math.round(sumMl / 250)));
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  async function bump(delta) {
    setGlasses((g) => Math.max(0, Math.min(target, g + delta)));
    if (delta > 0 && user?.id) {
      try {
        await base44.entities.HydrationLog.create({
          user_id: user.id,
          day_key: todayISO,
          amount_ml: 250,
          logged_at: new Date().toISOString(),
        });
      } catch { /* silent */ }
    }
  }

  return (
    <article style={cardStyle}>
      <span style={kicker}>HYDRATION</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
        <Droplets size={32} style={{ color: C.espresso, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={hydrationCount}>{glasses} <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>of {target} glasses</span></div>
        </div>
      </div>
      <div style={hydroGlassRow}>
        {Array.from({ length: target }).map((_, i) => (
          <span key={i} style={{
            ...hydroGlassDot,
            background: i < glasses ? "#60B4FA" : "rgba(58,44,26,0.08)",
            borderColor: i < glasses ? "#60B4FA" : "rgba(58,44,26,0.18)",
          }} />
        ))}
      </div>
      <div style={hydroBtnRow}>
        <button onClick={() => bump(-1)} style={hydroAdjustBtn}>−</button>
        <button onClick={() => bump(+1)} style={{ ...hydroAdjustBtn, background: C.espresso, color: C.cream }}>+</button>
      </div>
      <p style={tipText}>Luteal phase — aim for 2.5L, bloating can mask thirst.</p>
    </article>
  );
}

function AIMealPlanCard() {
  const meals = [
    { label: "Breakfast", text: "Eggs + spinach + sourdough · iron + B12 for luteal energy" },
    { label: "Lunch",     text: "Roast salmon, sweet potato, kale · anti-inflammatory + Mg" },
    { label: "Dinner",    text: "Turmeric chicken stew + brown rice · warming + magnesium-rich" },
  ];
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <span style={kicker}>AI MEAL PLAN</span>
        <span style={astraTag}>Powered by Jess</span>
      </div>
      <h3 style={cardTitle}>Today's plan <Sparkles size={14} style={{ color: C.gold, verticalAlign: -1 }} /></h3>
      <ul style={{ ...bulletList, gap: 8, marginTop: 4 }}>
        {meals.map((m) => (
          <li key={m.label} style={aiMealRow}>
            <div style={aiMealLabel}>{m.label}</div>
            <div style={aiMealText}>{m.text}</div>
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          try { alert("Meal suggestions coming soon — Jess AI is brewing."); } catch {}
        }}
        style={{ ...astraOpenBtn, color: C.goldDeep }}
      >
        <Sparkles size={11} /> Regenerate <ChevronRight size={11} />
      </button>
    </article>
  );
}

function PhaseRecipesCard() {
  const recipes = [
    { name: "Turmeric salmon",       time: "20 min", tone: C.blush },
    { name: "Roasted root + lentil bowl", time: "30 min", tone: C.gold  },
    { name: "Magnesium magic dahl",  time: "25 min", tone: C.sage  },
  ];
  return (
    <article style={cardStyle}>
      <span style={kicker}>PHASE RECIPES · LUTEAL</span>
      <h3 style={cardTitle}>For your phase</h3>
      <p style={cardSub}>Anti-inflammatory, warming, magnesium-rich.</p>
      <ul style={{ ...bulletList, gap: 6, marginTop: 4 }}>
        {recipes.map((r) => (
          <li key={r.name} style={recipeRow}>
            <span style={{ ...recipeImg, background: `${r.tone}33` }}>
              <Utensils size={12} style={{ color: r.tone }} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={recipeName}>{r.name}</div>
              <div style={recipeTime}>{r.time}</div>
            </div>
            <ChevronRight size={12} style={{ color: C.muted }} />
          </li>
        ))}
      </ul>
      <button
        onClick={() => { try { window.location.href = "/Nutrition"; } catch {} }}
        style={astraOpenBtn}
      >View all recipes <ChevronRight size={12} /></button>
    </article>
  );
}

// ── Care: merged Meds+Supps · Symptom log · Body scan · small GP card ────
// Phase B6 — MedicationLogs + SupplementLog wiring.
const SUPPLEMENT_FIELDS_B6 = [
  { key: "folic_acid", text: "Folic acid",  when: "morning" },
  { key: "vitamin_d",  text: "Vitamin D",   when: "morning" },
  { key: "omega3",     text: "Omega-3",     when: "with breakfast" },
  { key: "iron",       text: "Iron",        when: "evening" },
];
function MedsAndSuppsCard({ user }) {
  const [meds, setMeds] = useState(initialStack.meds);
  const [supps, setSupps] = useState(
    SUPPLEMENT_FIELDS_B6.map((s) => ({ id: s.key, text: s.text, when: s.when, done: false }))
  );
  const [suppRowId, setSuppRowId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const [medRows, suppRows] = await Promise.all([
          base44.entities.MedicationLogs.filter({ user_id: user.id, date: todayISO }, "-created_date", 40).catch(() => []),
          base44.entities.SupplementLog.filter({ user_id: user.id, date: todayISO }, "-date", 1).catch(() => []),
        ]);
        if (cancelled) return;
        const mappedMeds = (medRows || []).map((m) => ({
          id: m.id,
          text: m.item_name || "Medication",
          time: m.dose || "",
          done: !!m.taken,
        }));
        if (mappedMeds.length > 0) setMeds(mappedMeds);
        const suppRow = (suppRows || [])[0] || null;
        setSuppRowId(suppRow?.id || null);
        setSupps(SUPPLEMENT_FIELDS_B6.map((s) => ({
          id: s.key, text: s.text, when: s.when,
          done: !!(suppRow && suppRow[s.key]),
        })));
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  async function toggleMed(id) {
    let next = false;
    setMeds((ms) => ms.map((m) => {
      if (m.id !== id) return m;
      next = !m.done;
      return { ...m, done: next };
    }));
    try { await base44.entities.MedicationLogs.update(id, { taken: next }); } catch { /* silent */ }
  }
  async function toggleSupp(id) {
    let next = false;
    setSupps((ss) => ss.map((s) => {
      if (s.id !== id) return s;
      next = !s.done;
      return { ...s, done: next };
    }));
    if (!user?.id) return;
    try {
      if (suppRowId) {
        await base44.entities.SupplementLog.update(suppRowId, { [id]: next });
      } else {
        const payload = { user_id: user.id, date: todayISO };
        for (const f of SUPPLEMENT_FIELDS_B6) payload[f.key] = (f.key === id ? next : false);
        const created = await base44.entities.SupplementLog.create(payload);
        if (created?.id) setSuppRowId(created.id);
      }
    } catch { /* silent */ }
  }
  const allMedsDone = meds.length > 0 && meds.every((m) => m.done);
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <h3 style={{ ...cardTitle, margin: 0 }}>Medications &amp; Supplements</h3>
        {allMedsDone && <span style={allDoneChip}><Check size={11} /> Meds done</span>}
      </div>
      <Section name="MEDICATIONS">
        {meds.map((m) => (
          <CheckboxRow key={m.id} checked={m.done} onChange={() => toggleMed(m.id)} text={m.text}>
            <span style={medTimeChip}>{m.time}</span>
          </CheckboxRow>
        ))}
      </Section>
      <Section name="SUPPLEMENTS">
        {supps.map((s) => (
          <CheckboxRow key={s.id} checked={s.done} onChange={() => toggleSupp(s.id)} text={s.text}>
            <span style={medTimeChip}>{s.when}</span>
          </CheckboxRow>
        ))}
      </Section>
      <button onClick={() => openLogger("med")} style={addMedBtn}><Plus size={11} /> Add</button>
    </article>
  );
}

const SYMPTOMS = [
  "Cramps", "Bloating", "Headache", "Fatigue", "Mood dip",
  "Breast tenderness", "Spotting", "Brain fog", "Insomnia",
  "Skin changes", "Other",
];

function SymptomLogCard() {
  const [selected, setSelected] = useState(new Set());
  const [saved, setSaved] = useState(false);
  function toggle(s) {
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(s)) n.delete(s); else n.add(s);
      return n;
    });
  }
  function save() {
    if (selected.size === 0) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  return (
    <article style={cardStyle}>
      <span style={kicker}>SYMPTOM LOG</span>
      <h3 style={cardTitle}>Log a symptom</h3>
      <div style={chipBowl}>
        {SYMPTOMS.map((s) => {
          const on = selected.has(s);
          return (
            <button key={s} onClick={() => toggle(s)} style={{
              ...softChip,
              background: on ? `${C.gold}1F` : C.cream,
              border: on ? `1px solid ${C.gold}` : "1px solid rgba(58,44,26,0.10)",
              color: on ? C.goldDeep : C.espresso,
              cursor: "pointer",
            }}>
              {s}
            </button>
          );
        })}
      </div>
      {saved && <span style={savedChip}><Check size={11} style={{ color: C.sage }} /> {selected.size} symptom{selected.size === 1 ? "" : "s"} logged</span>}
      <button onClick={save} disabled={selected.size === 0} style={{
        ...modalSaveBtn, alignSelf: "flex-start", marginTop: 6,
        opacity: selected.size === 0 ? 0.4 : 1,
        cursor: selected.size === 0 ? "not-allowed" : "pointer",
      }}>Save {selected.size > 0 ? `(${selected.size})` : ""}</button>
    </article>
  );
}

function BodyScanCard() {
  const [pain, setPain] = useState(2);
  const [crash, setCrash] = useState(3);
  const [emo, setEmo] = useState(3);
  const Slider = ({ value, set, lo, hi }) => (
    <div style={scanRow}>
      <span style={scanLabel}>{lo}</span>
      <div style={scanDots}>
        {[1,2,3,4,5].map((v) => (
          <button key={v} onClick={() => set(v)} style={{
            ...scanDot,
            background: v === value ? C.espresso : "transparent",
            borderColor: v === value ? C.espresso : "rgba(58,44,26,0.22)",
          }} />
        ))}
      </div>
      <span style={scanLabel}>{hi}</span>
    </div>
  );
  return (
    <article style={cardStyle}>
      <span style={kicker}>BODY SCAN</span>
      <h3 style={cardTitle}>Quick body check</h3>
      <p style={miniLabel}>PAIN / DISCOMFORT</p>
      <Slider value={pain} set={setPain} lo="None" hi="Severe" />
      <p style={miniLabel}>ENERGY CRASH</p>
      <Slider value={crash} set={setCrash} lo="None" hi="Total" />
      <p style={miniLabel}>EMOTIONAL LOAD</p>
      <Slider value={emo} set={setEmo} lo="Light" hi="Heavy" />
      <p style={tipText}>This data helps Jess understand your patterns.</p>
      <button
        style={modalSaveBtn}
        onClick={() => { try { openLogger("symptom"); } catch {} }}
      >Save</button>
    </article>
  );
}

function GPReportCardSmall() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <article style={{ ...cardStyle, minHeight: 160 }}>
        <div style={cardHeadRow}>
          <span style={{ ...iconCircle, background: C.cream, width: 30, height: 30, borderRadius: 9 }}>
            <FileText size={13} style={{ color: C.espresso }} />
          </span>
          <div style={{ flex: 1 }}>
            <h3 style={{ ...cardTitle, margin: 0, fontSize: 15 }}>GP Report & Diary</h3>
            <p style={{ ...cardSub, margin: "2px 0 0" }}>Build your health report</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} style={{ ...modalSaveBtn, alignSelf: "flex-start", marginTop: 8 }}>
          Open <ChevronRight size={11} />
        </button>
        <p style={reportLastExport}>Last exported: Never</p>
      </article>
      {open && (
        <div style={modalBackdrop} onClick={() => setOpen(false)}>
          <div style={{ ...modalCard, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHead}>
              <span style={kicker}>GP REPORT & DIARY</span>
              <button onClick={() => setOpen(false)} style={drawerCloseBtn}><X size={14} /></button>
            </div>
            <h3 style={modalTitle}>Build your report</h3>
            <p style={cardSub}>Diary entries are off by default.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {["Cycle data", "Symptoms", "Diary entries", "Medications", "Sleep + mood"].map((label, i) => (
                <label key={label} style={reportSectionRow}>
                  <input type="checkbox" defaultChecked={i !== 2} style={{ accentColor: C.sage }} />
                  <span style={{ fontSize: 13, color: C.espresso }}>{label}</span>
                </label>
              ))}
            </div>
            <div style={modalFoot}>
              <button onClick={() => setOpen(false)} style={modalCancelBtn}>Cancel</button>
              <button onClick={() => setOpen(false)} style={modalSaveBtn}>Export PDF</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tonight extras (Tomorrow preview · Cycle reflection) ─────────────────
function TomorrowPreviewCard({ user }) {
  const tomorrowDate = new Date(today); tomorrowDate.setDate(today.getDate() + 1);
  const tomorrowStr  = tomorrowDate.toISOString().split("T")[0];
  const tmCycleDay = profile.cycleDay + 1;
  const tmPhase = tmCycleDay <= 28 ? "luteal" : "menstrual";
  const key = `femwell_tomorrow_priority_${tomorrowStr}`;
  const [pri, setPri] = useState(() => { try { return localStorage.getItem(key) || ""; } catch { return ""; } });
  function save(v) { setPri(v); try { localStorage.setItem(key, v); } catch {} }
  // Phase B6 — tomorrow's bullets pulled from PlannerItems + PersonalTasks
  // for the next day. Falls back to a single italic prompt when nothing
  // is scheduled yet.
  const [tomorrowBullets, setTomorrowBullets] = useState([]);
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const [evts, tks] = await Promise.all([
          base44.entities.PlannerItems.filter({ user_id: user.id, date: tomorrowStr }, "-created_date", 30).catch(() => []),
          base44.entities.PersonalTasks.filter({ user_id: user.id, date: tomorrowStr }, "-created_date", 30).catch(() => []),
        ]);
        if (cancelled) return;
        const evList = (evts || []).slice().sort((a, b) => String(a?.time || "99:99").localeCompare(String(b?.time || "99:99")));
        const out = [];
        for (const e of evList) {
          const h = e.time ? String(e.time).slice(0, 5) : "";
          out.push(h ? `${h} — ${e.title || "Event"}` : (e.title || "Event"));
          if (out.length >= 2) break;
        }
        if (out.length < 2) {
          for (const t of tks || []) {
            out.push(t.title || "Task");
            if (out.length >= 2) break;
          }
        }
        setTomorrowBullets(out);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id, tomorrowStr]);
  return (
    <article style={cardStyle}>
      <span style={kicker}>TOMORROW</span>
      <h3 style={cardTitle}>{tomorrowDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: `${PHASE_LIGHT[tmPhase]}22`, border: `1px solid ${PHASE_LIGHT[tmPhase]}55` }}>
        <span style={{ width: 10, height: 10, borderRadius: 9999, background: PHASE_LIGHT[tmPhase] }} />
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500, color: C.espresso }}>
          Late {tmPhase[0].toUpperCase() + tmPhase.slice(1)} · Day {tmCycleDay}
        </span>
      </div>
      <div style={energyForecastRow}>
        <span style={miniLabel}>ENERGY FORECAST</span>
        <div style={energyBars}>
          <span style={{ ...energyBar, height: 6,  background: C.muted }} />
          <span style={{ ...energyBar, height: 12, background: C.blush }} />
          <span style={{ ...energyBar, height: 6,  background: "rgba(58,44,26,0.12)" }} />
        </div>
        <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>Easing</span>
      </div>
      <label style={miniInputLabel}>
        <span style={miniLabel}>TOP PRIORITY TOMORROW</span>
        <input type="text" value={pri} onChange={(e) => save(e.target.value)} placeholder="The one thing" style={miniInput} />
      </label>
      <ul style={{ ...bulletList, gap: 4, marginTop: 4 }}>
        {tomorrowBullets.length === 0 ? (
          <li style={bulletLine}><span style={bulletDot} /> <span style={{ fontStyle: "italic", color: C.muted }}>Nothing planned yet</span></li>
        ) : tomorrowBullets.map((b, i) => (
          <li key={i} style={bulletLine}><span style={bulletDot} /> {b}</li>
        ))}
      </ul>
      <p style={tipText}>Luteal tomorrow — front-load your morning.</p>
      <button
        type="button"
        onClick={() => { try { openLogger("event"); } catch {} }}
        style={{ ...modalSaveBtn, alignSelf: "flex-start", marginTop: 6 }}
      >
        <Plus size={11} /> Plan tomorrow
      </button>
    </article>
  );
}

function CycleReflectionCard() {
  const [energy, setEnergy] = useState("high");
  const [mood, setMood] = useState("good");
  const [body, setBody] = useState("good");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const opts = {
    energy: ["Low", "Medium", "High"],
    mood: ["Difficult", "Neutral", "Good"],
    body: ["Uncomfortable", "Okay", "Good"],
  };
  function Row3({ label, value, set, list }) {
    return (
      <div style={reflectionLine}>
        <span style={reflectionLineLabel}>{label}</span>
        <div style={reflectionPicks}>
          {list.map((opt) => {
            const key = opt.toLowerCase();
            const on = value === key;
            return (
              <button key={opt} onClick={() => set(key)} style={{
                ...reflectionPick,
                background: on ? C.espresso : C.cream,
                color: on ? C.cream : C.plumSoft || C.muted,
                borderColor: on ? C.espresso : "rgba(58,44,26,0.12)",
              }}>{opt}</button>
            );
          })}
        </div>
      </div>
    );
  }
  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  return (
    <article style={cardStyle}>
      <span style={kicker}>CYCLE REFLECTION</span>
      <h3 style={cardTitle}>How did your body feel today?</h3>
      <Row3 label="Energy" value={energy} set={setEnergy} list={opts.energy} />
      <Row3 label="Mood" value={mood} set={setMood} list={opts.mood} />
      <Row3 label="Body" value={body} set={setBody} list={opts.body} />
      <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (optional)…" style={miniInput} />
      {saved && <span style={savedChip}><Check size={11} style={{ color: C.sage }} /> Reflection saved</span>}
      <button onClick={handleSave} style={{ ...modalSaveBtn, alignSelf: "flex-start", marginTop: 4 }}>
        Save reflection <ChevronRight size={11} />
      </button>
    </article>
  );
}

// ── Meals ─────────────────────────────────────────────────────────────────
function MealPlannerCard() {
  const [meals, setMeals] = useState([
    { id: "b", label: "Breakfast", value: "Avocado toast + eggs · 380 cal · P:18g C:32g F:22g", done: true },
    { id: "l", label: "Lunch",     value: "Salmon + greens · planned", done: false },
    { id: "d", label: "Dinner",    value: "Not planned", done: false, empty: true },
  ]);
  const [water, setWater] = useState(5);
  function toggle(id) { setMeals((ms) => ms.map((m) => m.id === id ? { ...m, done: !m.done } : m)); }
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Meals today</h3>
      <ul style={{ ...bulletList, gap: 8, marginTop: 6 }}>
        {meals.map((m) => (
          <li key={m.id} style={mealRow}>
            <input type="checkbox" checked={m.done} onChange={() => toggle(m.id)} style={{ accentColor: C.sage, marginTop: 3, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={mealLabel}>{m.label}</div>
              <div style={mealValue}>{m.value}</div>
            </div>
            {m.empty && (
              <button
                onClick={() => { try { openLogger("meal"); } catch {} }}
                style={addMealBtn}
              ><Plus size={10} /> Add</button>
            )}
          </li>
        ))}
      </ul>
      <div style={hydrationRow}>
        <Droplets size={14} style={{ color: "#60B4FA", flexShrink: 0 }} />
        <span style={hydrationLabel}>Hydration · {water} / 8</span>
        <button onClick={() => setWater((w) => Math.max(0, w - 1))} style={hydroBtn}><X size={12} /></button>
        <button onClick={() => setWater((w) => Math.min(8, w + 1))} style={hydroBtn}><Plus size={12} /></button>
      </div>
    </article>
  );
}

function EatForPhaseCard() {
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Eat for your phase</h3>
      <span style={kicker}>OVULATORY · FOCUS ON</span>
      <div style={chipBowl}>
        {["Leafy greens", "Zinc", "Antioxidants"].map((n) => (
          <span key={n} style={softChip}>
            <span style={{ ...softChipDot, background: C.gold }} />
            {n}
          </span>
        ))}
      </div>
      <p style={tipText}>Your liver is working hard — cruciferous veg help oestrogen clearance.</p>
    </article>
  );
}

// ── Care ──────────────────────────────────────────────────────────────────
function MedicationsCard() {
  const [meds, setMeds] = useState(initialStack.meds);
  const allDone = meds.every((m) => m.done);
  function toggle(id) { setMeds((ms) => ms.map((m) => m.id === id ? { ...m, done: !m.done } : m)); }
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <h3 style={{ ...cardTitle, margin: 0 }}>Medications today</h3>
        {allDone && <span style={allDoneChip}><Check size={11} /> All taken</span>}
      </div>
      <ul style={{ ...bulletList, gap: 6, marginTop: 6 }}>
        {meds.map((m) => (
          <CheckboxRow key={m.id} checked={m.done} onChange={() => toggle(m.id)} text={m.text}>
            <span style={medTimeChip}>{m.time}</span>
          </CheckboxRow>
        ))}
      </ul>
      <button onClick={() => openLogger("med")} style={addMedBtn}><Plus size={11} /> Add medication</button>
    </article>
  );
}

function SupplementsCard() {
  const [supps, setSupps] = useState([
    { id: "om3", text: "Omega-3", done: false, when: "morning" },
    { id: "mg", text: "Magnesium glycinate", done: false, when: "evening" },
  ]);
  function toggle(id) { setSupps((ss) => ss.map((s) => s.id === id ? { ...s, done: !s.done } : s)); }
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Supplements</h3>
      <ul style={{ ...bulletList, gap: 6, marginTop: 6 }}>
        {supps.map((s) => (
          <CheckboxRow key={s.id} checked={s.done} onChange={() => toggle(s.id)} text={s.text}>
            <span style={medTimeChip}>{s.when}</span>
          </CheckboxRow>
        ))}
      </ul>
      <p style={tipText}>Magnesium supports progesterone in luteal phase — beneficial now too.</p>
    </article>
  );
}

// ── Tonight ───────────────────────────────────────────────────────────────
function TonightReflectionCard({ user }) {
  const key = `femwell_tonight_${todayISO}`;
  const prompts = ["One win today", "Energy rating (1–10)", "Intention for tomorrow"];
  const [data, setData] = useState(() => {
    try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch {}
    return { win: "", energy: "", tomorrow: "" };
  });
  // DailyCheckins has no `sleep_intention` field (verified against schema).
  // Persist the "Intention for tomorrow" prompt to JournalEntries keyed by
  // tag="sleep_intention" instead.
  const [entryId, setEntryId] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return;
    (async () => {
      try {
        const rows = await base44.entities.JournalEntries.filter(
          { user_id: user.id, session_date: todayISO }, "-updated_date", 40,
        );
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        const row = list.find((r) => Array.isArray(r?.tags) && r.tags.includes("sleep_intention"));
        if (row?.id) setEntryId(row.id);
        if (row?.text) setData((d) => ({ ...d, tomorrow: d.tomorrow || row.text }));
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  async function save(field, v) {
    const next = { ...data, [field]: v };
    setData(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
    if (field !== "tomorrow" || !user?.id) return;
    const trimmed = (v || "").trim();
    if (!trimmed) return;
    try {
      if (entryId) {
        await base44.entities.JournalEntries.update(entryId, { text: trimmed });
      } else {
        const created = await base44.entities.JournalEntries.create({
          user_id: user.id, session_date: todayISO,
          text: trimmed, tags: ["sleep_intention"],
          prompt: "Intention for tomorrow",
        });
        if (created?.id) setEntryId(created.id);
      }
    } catch { /* silent */ }
  }
  return (
    <article style={cardStyle}>
      <h3 style={cardTitle}>Tonight's reflections</h3>
      {prompts.map((p) => {
        const field = p === prompts[0] ? "win" : (p === prompts[1] ? "energy" : "tomorrow");
        return (
          <label key={p} style={reflectionRow}>
            <span style={reflectionLabel}>{p}</span>
            <input type="text" value={data[field]} onChange={(e) => save(field, e.target.value)}
              style={reflectionInput} placeholder="…" />
          </label>
        );
      })}
    </article>
  );
}

function SleepTargetCard() {
  return (
    <article style={cardStyle}>
      <div style={cardHeadRow}>
        <h3 style={{ ...cardTitle, margin: 0 }}>Sleep target</h3>
        <BedDouble size={14} style={{ color: C.muted }} />
      </div>
      <p style={sleepTargetTime}>Aim for bed by <b>10:30pm</b></p>
      <div style={sleepLastNight}>
        <span style={kicker}>LAST NIGHT</span>
        <p style={sleepLastNightText}>7h 20min · Good quality</p>
      </div>
      <p style={tipText}>Ovulatory phase — you may need slightly less sleep than usual.</p>
    </article>
  );
}

// ── GP Report ────────────────────────────────────────────────────────────
function GPReportCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <article style={cardStyle}>
        <div style={cardHeadRow}>
          <span style={{ ...iconCircle, background: C.cream }}><FileText size={16} style={{ color: C.espresso }} /></span>
          <div style={{ flex: 1 }}>
            <h3 style={{ ...cardTitle, margin: 0 }}>GP Report & Diary</h3>
            <p style={cardSub}>Export your cycle data, symptoms, and diary entries for your doctor.</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} style={reportBtn}>Build report <ChevronRight size={13} /></button>
        <p style={reportLastExport}>Last exported: Never</p>
      </article>
      {open && (
        <div style={modalBackdrop} onClick={() => setOpen(false)}>
          <div style={{ ...modalCard, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHead}>
              <span style={kicker}>GP REPORT & DIARY</span>
              <button onClick={() => setOpen(false)} style={drawerCloseBtn}><X size={14} /></button>
            </div>
            <h3 style={modalTitle}>Build your report</h3>
            <p style={cardSub}>Choose what to include. Diary entries are off by default — flip on only if you want to share.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {[
                { label: "Cycle data", desc: "Last 3 cycles · day-by-day phase log", on: true },
                { label: "Symptoms", desc: "All logged symptoms with phase tags", on: true },
                { label: "Diary entries", desc: "Your journal — off by default", on: false },
                { label: "Medications", desc: "Prescriptions + adherence", on: true },
                { label: "Sleep + mood", desc: "Daily aggregates across the cycle", on: true },
              ].map((s) => (
                <label key={s.label} style={reportSectionRow}>
                  <input type="checkbox" defaultChecked={s.on} style={{ accentColor: C.sage }} />
                  <div style={{ flex: 1 }}>
                    <div style={reportSectionLabel}>{s.label}</div>
                    <div style={reportSectionDesc}>{s.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <div style={modalFoot}>
              <button onClick={() => setOpen(false)} style={modalCancelBtn}>Cancel</button>
              <button onClick={() => setOpen(false)} style={modalSaveBtn}>Export PDF</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full overlays — Schedule, Cycle, DayDetail, BlockEdit
// ─────────────────────────────────────────────────────────────────────────────
function FullScheduleOverlay({ open, onClose, blocks, onBlockTap }) {
  if (!open) return null;
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);
  return (
    <div style={overlayShell} role="dialog" aria-modal="true">
      <div style={overlayHead}>
        <button onClick={onClose} style={overlayClose}><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <span style={kicker}>SCHEDULE · {today.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}</span>
          <h2 style={overlayTitle}>Today, hour by hour</h2>
        </div>
        <button onClick={() => openLogger("event")} style={overlayClose} aria-label="Add event">
          <Plus size={16} />
        </button>
      </div>
      <p style={overlayHint}>Tap a block to edit. Long press to drag.</p>
      <div style={{ padding: "0 16px 30px" }}>
        {hours.map((h) => (
          <ScheduleHour key={h} hour={h} blocks={blocks.filter((b) => b.hour === h)}
            isCurrent={h === today.getHours()} currentMinute={today.getMinutes()} onBlockTap={onBlockTap} />
        ))}
      </div>
    </div>
  );
}

function ScheduleHour({ hour, blocks, isCurrent, currentMinute, onBlockTap }) {
  const label = (hour <= 12 ? hour : hour - 12) + (hour < 12 ? " AM" : " PM");
  const rail = bandFor(hour);
  return (
    <div style={schedHourRow}>
      <span style={schedHourLabel}>{label}</span>
      <div style={schedRailCol}>
        <span style={{ ...schedRail, background: rail }} />
        {isCurrent && (
          <>
            <span style={{ ...schedRailDot, top: `${(currentMinute / 60) * 100}%` }} />
            <span style={{ ...schedNowLine, top: `${(currentMinute / 60) * 100}%` }} />
          </>
        )}
      </div>
      <div style={schedBlockCol}>
        {blocks.length === 0 && (
          <button onClick={() => openLogger("event")} style={schedEmptySlot}>
            <Plus size={12} /> Add
          </button>
        )}
        {blocks.map((b) => <ScheduleBlock key={b.id} block={b} onTap={() => onBlockTap(b.id)} />)}
      </div>
    </div>
  );
}

function ScheduleBlock({ block, onTap }) {
  const tones = TYPE_TONES[block.type] || TYPE_TONES.task;
  const IconForType = block.type === "habit" ? Footprints
    : block.type === "med" ? Pill : block.type === "event" ? CalendarClock : ListChecks;
  return (
    <button onClick={onTap} style={{
      ...schedBlock,
      background: tones.bg,
      borderLeft: `3px solid ${tones.bar}`,
      minHeight: 28 + Math.min(60, block.duration) * 0.5,
    }}>
      <span style={{ ...schedBlockIcon, background: tones.bar }}>
        <IconForType size={11} style={{ color: C.cream }} />
      </span>
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <div style={schedBlockTitle}>{block.title}{block.done && <Check size={11} style={{ color: C.sage, marginLeft: 6 }} />}</div>
        <div style={schedBlockMeta}>{block.duration} MIN · {block.type.toUpperCase()}</div>
      </div>
      {block.anchor && <span style={anchorPill}>ANCHOR</span>}
    </button>
  );
}

function FullCycleOverlay({ open, onClose, onDayTap }) {
  if (!open) return null;
  return (
    <div style={overlayShell} role="dialog" aria-modal="true">
      <div style={overlayHead}>
        <button onClick={onClose} style={overlayClose}><ArrowLeft size={16} /></button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <h2 style={overlayTitleWithRoman}>Cycle</h2>
          <p style={calSub}>{profile.phase.toUpperCase()} · DAY {profile.cycleDay}</p>
        </div>
        <span style={{ width: 32, height: 32 }} />
      </div>
      <div style={{ padding: "0 16px 30px" }}>
        {/* Real production MonthRibbon — same component Planner.jsx mounts on
            the Cycle tab. Phase gradient ribbons, activity bars per day, plum
            today marker, all sourced from the production palette. */}
        <MonthRibbon
          profile={mockMonthRibbonProfile}
          habitLogs={[]}
          onNavigateToToday={(iso) => onDayTap(iso)}
        />
      </div>
    </div>
  );
}

function WeekPill({ week, onDayTap }) {
  const phases = week.filter((d) => !d.blank).map((d) => d.phase);
  let bg;
  if (phases.length === 0) bg = C.paper;
  else if (phases.every((p) => p === phases[0])) bg = PHASE_DEEP[phases[0]];
  else {
    const unique = [...new Set(phases)];
    const stops = unique.map((p, i) => `${PHASE_DEEP[p]} ${Math.round(100 * i / Math.max(1, unique.length - 1))}%`);
    bg = `linear-gradient(90deg, ${stops.join(", ")})`;
  }
  return (
    <div style={{ ...weekPillStyle, background: bg }}>
      {week.map((d, i) => {
        if (d.blank) return <span key={i} style={dayBlank} />;
        const iso = d.date.toISOString().split("T")[0];
        const isToday = (d.date.getDate() === today.getDate() && d.date.getMonth() === today.getMonth() && d.date.getFullYear() === today.getFullYear());
        return (
          <button key={i} onClick={() => onDayTap(iso)} style={isToday ? dayTileToday : dayTile}>
            <span style={{ ...dayNum, color: isToday ? C.espresso : "rgba(255,255,255,0.95)" }}>{d.day}</span>
            <span style={{ ...daySymptomDash, background: isToday ? "rgba(58,44,26,0.30)" : "rgba(255,255,255,0.45)" }} />
          </button>
        );
      })}
    </div>
  );
}

function DayDetailSheet({ iso, onClose }) {
  if (!iso) return null;
  const date = new Date(iso);
  const isFuture = date > new Date(todayISO);
  const phase = phaseForCalDay(date.getDate());
  const cycleDay = (() => {
    const todayDom = today.getDate();
    return ((date.getDate() - todayDom + profile.cycleDay - 1 + profile.cycleLen * 3) % profile.cycleLen) + 1;
  })();
  const phaseHint = {
    menstrual: "Inner winter. Slow, soft, restorative.",
    follicular: "Inner spring. Curious, building, fresh.",
    ovulatory: "Peak energy window. Visibility, bold asks, creative output.",
    luteal: "Inner autumn. Reflective, narrowing, finishing.",
  }[phase];
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={{ ...modalCard, maxHeight: "85vh", overflowY: "auto", maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <button onClick={onClose} style={drawerCloseBtn}><ArrowLeft size={14} /></button>
          <span style={{ flex: 1, textAlign: "center", fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500, color: C.espresso }}>
            {date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <button
            onClick={() => { try { openLogger("event"); } catch {} }}
            style={dayEditBtn}
          >Edit</button>
        </div>
        <h3 style={modalTitle}>{phase[0].toUpperCase() + phase.slice(1)} · Day {cycleDay}</h3>
        <Section name="PHASE SUMMARY">
          <div style={{ padding: "12px 14px", borderRadius: 12, background: `${PHASE_LIGHT[phase]}22`, border: `1px solid ${PHASE_LIGHT[phase]}55` }}>
            <span style={{ ...phaseChip, background: `${PHASE_LIGHT[phase]}33`, color: C.espresso }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: PHASE_LIGHT[phase], marginRight: 5 }} />
              {phase[0].toUpperCase() + phase.slice(1)}
            </span>
            <p style={{ ...astraShort, marginTop: 6 }}>{phaseHint}</p>
          </div>
        </Section>
        {!isFuture && (
          <Section name="WHAT HAPPENED">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              <span style={dayInfoChip}><Smile size={11} style={{ color: C.rose }} /> Mood · Good</span>
              <span style={dayInfoChip}><Zap size={11} style={{ color: C.goldDeep }} /> Energy · High</span>
              <span style={dayInfoChip}><Moon size={11} style={{ color: C.muted }} /> Sleep · 7h</span>
            </div>
          </Section>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={() => openLogger("event")} style={dayPrimaryBtn}>Plan this day</button>
          {!isFuture && <button onClick={() => openLogger("symptom")} style={daySecondaryBtn}>Log symptoms</button>}
        </div>
      </div>
    </div>
  );
}

function BlockEditSheet({ block, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(block);
  useEffect(() => { setDraft(block); }, [block]);
  if (!block || !draft) return null;
  function set(k, v) { setDraft((d) => ({ ...d, [k]: v })); }
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>EDIT BLOCK</span>
          <button onClick={onClose} style={drawerCloseBtn}><X size={14} /></button>
        </div>
        <h3 style={modalTitle}>{draft.title}</h3>
        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={miniLabel}>TITLE</span>
          <input type="text" value={draft.title} onChange={(e) => set("title", e.target.value)} style={modalInput} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <label>
            <span style={miniLabel}>HOUR</span>
            <select value={draft.hour} onChange={(e) => set("hour", Number(e.target.value))} style={modalInput}>
              {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                <option key={h} value={h}>{h <= 12 ? h : h - 12}:00 {h < 12 ? "AM" : "PM"}</option>
              ))}
            </select>
          </label>
          <label>
            <span style={miniLabel}>DURATION (MIN)</span>
            <select value={draft.duration} onChange={(e) => set("duration", Number(e.target.value))} style={modalInput}>
              {[5, 15, 30, 45, 60, 90, 120].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>
        <span style={miniLabel}>TYPE</span>
        <div style={chipRowSpacing}>
          {["habit","task","med","event"].map((t) => (
            <button key={t} onClick={() => set("type", t)} style={{
              ...modalChip,
              background: draft.type === t ? C.espresso : C.paperHi,
              color: draft.type === t ? C.cream : C.muted,
              borderColor: draft.type === t ? C.espresso : "rgba(58,44,26,0.18)",
            }}>{t[0].toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <input type="checkbox" checked={!!draft.anchor} onChange={(e) => set("anchor", e.target.checked)} style={{ accentColor: C.gold }} />
          <span style={{ fontSize: 12, color: C.espresso }}>Mark as anchor (non-moveable)</span>
        </label>
        <div style={modalFoot}>
          <button onClick={() => onDelete(draft.id)} style={{ ...modalCancelBtn, color: C.rose, borderColor: `${C.rose}55` }}>
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={onClose} style={modalCancelBtn}>Cancel</button>
          <button onClick={() => onSave(draft)} style={modalSaveBtn}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAB + popup (kept from v2)
// ─────────────────────────────────────────────────────────────────────────────
function AddFAB({ onClick }) {
  return (
    <button onClick={onClick} style={fabStyle} aria-label="Quick add">
      <Plus size={26} style={{ color: C.cream }} />
    </button>
  );
}

const ADD_TYPES = [
  { id: "habit", label: "Habit", sub: "Movement or recurring action", Icon: Footprints, tone: C.sage },
  { id: "task", label: "Task", sub: "Work or personal to-do", Icon: ListChecks, tone: C.espresso },
  { id: "med", label: "Medication", sub: "Med or supplement", Icon: Pill, tone: C.blush },
  { id: "meal", label: "Meal", sub: "Plan or log a meal", Icon: Utensils, tone: C.gold },
  { id: "event", label: "Event", sub: "Appointment or calendar", Icon: CalendarClock, tone: C.goldDeep },
  { id: "ritual", label: "Ritual", sub: "Bundle for this phase", Icon: Sparkles, tone: C.muted },
  { id: "hydration", label: "Hydration", sub: "Log a glass of water", Icon: Droplets, tone: "#60B4FA" },
  { id: "note", label: "Note", sub: "Quick journal entry", Icon: StickyNote, tone: C.espresso },
  { id: "checkin", label: "Check-in", sub: "Mood, energy, sleep", Icon: Smile, tone: C.rose },
  { id: "symptom", label: "Symptom", sub: "Log a body signal", Icon: Stethoscope, tone: C.pMenstrual },
];

function AddPopup({ open, onClose }) {
  const [voiceState, setVoiceState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState(null);
  const [picked, setPicked] = useState(null);
  const recRef = useRef(null);
  useEffect(() => {
    if (!open) {
      setVoiceState("idle"); setTranscript(""); setParsed(null); setPicked(null);
      try { recRef.current && recRef.current.abort(); } catch {}
    }
  }, [open]);

  function startListening() {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceState("error");
      setTranscript("Speech recognition isn't available in this browser. Try Chrome on desktop or your phone.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-GB"; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setTranscript(t); setParsed(parseVoice(t)); setVoiceState("parsed");
    };
    rec.onerror = (e) => { setVoiceState("error"); setTranscript("Couldn't hear that — try again. (" + e.error + ")"); };
    recRef.current = rec;
    setVoiceState("listening"); setTranscript("");
    rec.start();
  }
  function confirm() {
    setVoiceState("idle");
    setTranscript("Added to your schedule.");
    setParsed(null);
    setTimeout(() => { onClose(); setTranscript(""); }, 900);
  }

  if (!open) return null;
  return (
    <div style={addBackdrop} onClick={onClose}>
      <div style={addPopup} onClick={(e) => e.stopPropagation()}>
        <div style={addHead}>
          <span style={kicker}>QUICK ADD</span>
          <button onClick={onClose} style={drawerCloseBtn}><X size={14} /></button>
        </div>
        <div style={addGrid}>
          <div style={voicePane}>
            <button
              onClick={voiceState === "listening" ? () => { try { recRef.current && recRef.current.stop(); } catch {} } : startListening}
              style={{
                ...voiceMicWrap,
                background: voiceState === "listening" ? `${C.gold}33` : `${C.gold}1F`,
                border: `1.5px solid ${C.gold}`,
                animation: voiceState === "listening" ? "fwPulse 1.4s ease-in-out infinite" : "none",
              }}
            >
              <Mic size={32} style={{ color: C.goldDeep }} />
            </button>
            <style>{`@keyframes fwPulse { 0%,100% { box-shadow: 0 0 0 0 ${C.gold}66; } 50% { box-shadow: 0 0 0 14px ${C.gold}00; } }`}</style>
            <h3 style={voiceTitle}>Voice schedule</h3>
            <p style={voiceSub}>
              {voiceState === "idle" && "Tap and tell me what to add"}
              {voiceState === "listening" && <Waveform />}
              {voiceState === "parsed" && (transcript ? `"${transcript}"` : "")}
              {voiceState === "error" && transcript}
            </p>
            {voiceState === "parsed" && parsed && (
              <div style={parsedCard}>
                <span style={kicker}>I HEARD</span>
                <div style={parsedLine}>
                  <span style={parsedChip}>{parsed.title}</span>
                  {parsed.duration && <span style={parsedChip}>{parsed.duration} min</span>}
                  {parsed.when && <span style={parsedChip}>{parsed.when}</span>}
                  {parsed.type && <span style={parsedChip}>{parsed.type}</span>}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button onClick={() => { setVoiceState("idle"); setTranscript(""); }} style={modalCancelBtn}>Redo</button>
                  <button onClick={confirm} style={modalSaveBtn}>Add this</button>
                </div>
              </div>
            )}
          </div>
          <div style={manualPane}>
            <span style={kicker}>OR PICK A TYPE</span>
            <div style={manualGrid}>
              {ADD_TYPES.map((t) => (
                <button key={t.id} onClick={() => setPicked(t)} style={manualCard}>
                  <span style={{ ...manualIcon, background: `${t.tone}1F`, color: t.tone }}><t.Icon size={14} /></span>
                  <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                    <div style={manualLabel}>{t.label}</div>
                    <div style={manualSub}>{t.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        {picked && (
          <GenericAddSheet type={picked} onClose={() => setPicked(null)} onSaved={() => { setPicked(null); onClose(); }} />
        )}
      </div>
    </div>
  );
}

function Waveform() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      <style>{`@keyframes fwBar { 0%,100% { height: 4px; } 50% { height: 14px; } }`}</style>
      {[0, 80, 160, 240, 320].map((d) => (
        <span key={d} style={{
          width: 3, height: 4, background: C.goldDeep, borderRadius: 9999,
          animation: `fwBar 800ms ease-in-out ${d}ms infinite`,
        }} />
      ))}
      <span style={{ marginLeft: 8, fontSize: 12, color: C.goldDeep, fontWeight: 700 }}>Listening…</span>
    </span>
  );
}
function parseVoice(text) {
  const t = text.toLowerCase();
  let duration = null;
  const dm = t.match(/(\d+)\s*(min|mins|minute|minutes|m\b)/);
  if (dm) duration = parseInt(dm[1], 10);
  let when = null;
  if (t.includes("tomorrow")) when = "tomorrow";
  else if (t.includes("tonight")) when = "tonight";
  else if (t.includes("today")) when = "today";
  const tm = t.match(/at\s+(\d{1,2})(:\d{2})?\s*(am|pm)?/);
  if (tm) when = (when ? when + " " : "") + tm[0].trim();
  let type = "task";
  if (/walk|run|stretch|yoga|gym|workout|movement/.test(t)) type = "habit";
  else if (/take\s|pill|capsule|supplement|magnesium|vitamin/.test(t)) type = "med";
  else if (/lunch|dinner|breakfast|meal|snack/.test(t)) type = "meal";
  else if (/call|meeting|appointment|class/.test(t)) type = "event";
  const title = text.replace(/^add\s+a?\s*/i, "").replace(/\s+at\s+\d.*$/i, "").trim();
  return { title: title || text, duration, when, type };
}

function GenericAddSheet({ type, onClose, onSaved }) {
  const [name, setName] = useState("");
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={modalHead}>
          <span style={kicker}>ADD · {type.label.toUpperCase()}</span>
          <button onClick={onClose} style={drawerCloseBtn}><X size={14} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ ...manualIcon, background: `${type.tone}1F`, color: type.tone, width: 40, height: 40 }}>
            <type.Icon size={18} />
          </span>
          <div>
            <h3 style={{ ...modalTitle, margin: 0 }}>{type.label}</h3>
            <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>{type.sub}</p>
          </div>
        </div>
        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={miniLabel}>NAME</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="…" style={modalInput} autoFocus />
        </label>
        <div style={modalFoot}>
          <button onClick={onClose} style={modalCancelBtn}>Cancel</button>
          <button onClick={onSaved} disabled={!name.trim()} style={{
            ...modalSaveBtn, opacity: name.trim() ? 1 : 0.4, cursor: name.trim() ? "pointer" : "not-allowed",
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic primitives
// ─────────────────────────────────────────────────────────────────────────────
function Row({ label, children }) {
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const count = Children.count(children);
  function jumpTo(i) {
    const clamped = Math.max(0, Math.min(count - 1, i));
    setIdx(clamped);
    const track = trackRef.current; if (!track) return;
    const child = track.children[clamped];
    if (child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }
  function onScroll() {
    const track = trackRef.current; if (!track) return;
    let best = 0, bestDist = Infinity;
    Array.from(track.children).forEach((el, i) => {
      const left = el.offsetLeft - track.offsetLeft;
      const dist = Math.abs(left - track.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setIdx(best);
  }
  return (
    <section style={rowShell} aria-label={label || "row"}>
      {(label || count > 1) && (
        <div style={rowHead}>
          <span style={kicker}>{label ? label.toUpperCase() : ""}</span>
          {count > 1 && (
            <div style={rowNav}>
              <button onClick={() => jumpTo(idx - 1)} style={rowArrow}><ChevronLeft size={14} /></button>
              {Array.from({ length: count }).map((_, i) => (
                <span key={i} style={{ ...rowDot, background: i === idx ? C.espresso : "rgba(58,44,26,0.20)" }} />
              ))}
              <button onClick={() => jumpTo(idx + 1)} style={rowArrow}><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      )}
      <div ref={trackRef} onScroll={onScroll} style={rowTrack}>
        {Children.map(children, (child, i) => <div key={i} style={rowSlot}>{child}</div>)}
      </div>
    </section>
  );
}

function Section({ name, children }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={sectionLine}>
        <span style={sectionLineRule} />
        <span style={sectionLabel}>{name}</span>
        <span style={sectionLineRule} />
      </div>
      {children}
    </div>
  );
}

function CheckboxRow({ checked, onChange, text, children }) {
  return (
    <label style={checkboxRow}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: C.sage }} />
      <span style={{
        flex: 1, fontSize: 13, color: C.espresso,
        textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.5 : 1,
      }}>{text}</span>
      {children}
    </label>
  );
}

function DemoFooter() {
  return (
    <div style={demoFooter}>
      <span style={kicker}>DEMO · UNIFIED PLANNER v3</span>
      <p style={demoFooterText}>
        One-page slider layout. Schedule & Cycle live in the top row — tap
        to open a full overlay. Floating + at bottom-right for voice and
        quick-add. Not wired to production.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const shell = {
  background: C.cream, minHeight: "100vh", paddingBottom: 120,
  fontFamily: "'Inter', system-ui, sans-serif",
  position: "relative",
};
const headerStyle = { padding: "20px 16px 8px", background: C.cream };
const greetingRow = { display: "flex", alignItems: "center", gap: 8 };
const greetingText = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 700, color: C.espresso, margin: 0, letterSpacing: "-0.01em",
};
const greetingSub = { fontSize: 13, color: C.muted, marginTop: 4 };

// Lists
const listsShell = { padding: "10px 16px 14px" };
const listsHead = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 };
const kicker = {
  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, fontWeight: 700,
};
const listsAddBtn = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 10px", borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.15)",
  color: C.espresso, fontSize: 11, fontWeight: 700, cursor: "pointer",
};
const listsChipRow = { display: "flex", gap: 6, flexWrap: "wrap" };
const listsChip = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 11px", borderRadius: 9999,
  border: "1px solid",
  fontSize: 12, fontWeight: 600, color: C.espresso, cursor: "pointer",
};
const listsAccordion = {
  marginTop: 8, padding: "8px 12px",
  background: C.paperHi, borderRadius: 12,
  border: "1px solid rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 6,
};
const listsTaskRow = { display: "flex", alignItems: "center", gap: 8 };
const listsDueChip = {
  marginLeft: "auto", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "2px 6px", borderRadius: 9999,
  background: `${C.gold}1F`, color: C.goldDeep,
};

// Slider row
const rowShell = { marginBottom: 18 };
const rowHead = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 16px", marginBottom: 8,
};
const rowNav = { display: "flex", alignItems: "center", gap: 5 };
const rowArrow = {
  width: 22, height: 22, borderRadius: 9999,
  background: "transparent", border: "none", color: C.muted, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};
const rowDot = { width: 6, height: 6, borderRadius: 9999 };
const rowTrack = {
  display: "flex", overflowX: "auto",
  scrollSnapType: "x mandatory", gap: 12,
  padding: "4px 16px",
  scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
};
const rowSlot = {
  flex: "0 0 calc(100% - 32px)", maxWidth: 520,
  scrollSnapAlign: "start",
};

// Card primitive
const cardStyle = {
  background: C.paperHi,
  borderRadius: 16, padding: 16,
  boxShadow: "0 2px 8px rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 8,
  boxSizing: "border-box",
  height: "100%",
  minHeight: 200,
};
const cardHeadRow = { display: "flex", alignItems: "center", gap: 8 };
const cardTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17, fontWeight: 500, color: C.espresso,
  margin: "2px 0", lineHeight: 1.25, letterSpacing: "-0.005em", flex: 1,
};
const cardSub = { fontSize: 12, color: C.muted, margin: "4px 0 0", lineHeight: 1.5 };
const iconChip = {
  width: 28, height: 28, borderRadius: 9,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const expandIconBtn = {
  width: 26, height: 26, borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  color: C.espresso, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};
const openFullBtn = {
  alignSelf: "flex-start", marginTop: 6,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 9999,
  background: "transparent", color: C.espresso,
  border: "1px solid rgba(58,44,26,0.18)",
  fontSize: 11, fontWeight: 700, cursor: "pointer",
};
const astraTag = { marginLeft: "auto", fontSize: 9, color: C.muted, fontStyle: "italic" };

// Schedule mini rows
const miniRow = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "6px 10px", borderRadius: 10,
};
const miniRowTime = { fontSize: 11, fontWeight: 700, color: C.muted, minWidth: 38 };
const miniRowTitle = { flex: 1, minWidth: 0, fontSize: 12.5, color: C.espresso, fontWeight: 600 };
const miniRowDur = { fontSize: 10, color: C.muted, fontWeight: 600 };

// Cycle mini week strip
const miniWeekRow = {
  display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 6,
};
const miniWeekCell = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
  padding: "8px 0", borderRadius: 10,
};
const miniWeekLetter = {
  fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.10em",
};
const miniWeekNum = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500,
};

// Body card
const phaseChip = {
  display: "inline-flex", alignItems: "center",
  padding: "3px 9px", borderRadius: 9999,
  fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
};
const expandBtn = {
  marginLeft: "auto", width: 24, height: 24, borderRadius: 9999,
  background: "transparent", border: "none", color: C.muted,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0,
};
const ringRow = { display: "flex", alignItems: "center", marginTop: 4 };
const ringTitle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500, color: C.espresso };
const ringSub = { fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" };
const miniChipRow = { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 };
const miniChip = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "4px 10px", borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  color: C.espresso, fontSize: 11, fontWeight: 600, cursor: "pointer",
};
const bodyGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginTop: 8,
};
const bodyTile = {
  display: "flex", alignItems: "center", gap: 5,
  padding: "6px 8px", borderRadius: 8,
  background: C.cream, border: "1px solid rgba(58,44,26,0.05)",
};
const bodyIcon = {
  width: 20, height: 20, borderRadius: 6,
  display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const bodyValue = { fontSize: 11, fontWeight: 700, color: C.espresso, lineHeight: 1.1 };
const bodyLabel = {
  fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase",
  color: C.muted, fontWeight: 600, marginTop: 1,
};

// Smart View bullets
const bulletList = {
  listStyle: "none", padding: 0, margin: "4px 0 0",
  display: "flex", flexDirection: "column", gap: 6,
};
const bulletLine = {
  display: "flex", alignItems: "flex-start", gap: 8,
  fontSize: 13, color: C.espresso, lineHeight: 1.45,
};
const bulletDot = { width: 5, height: 5, borderRadius: 9999, background: C.gold, marginTop: 7, flexShrink: 0 };

// Cycle zone banner
const cycleBanner = {
  background: `linear-gradient(135deg, ${C.gold}33 0%, ${C.gold}11 100%)`,
  padding: "16px 14px 12px",
  borderBottom: `1px solid ${C.gold}33`,
};
const cycleBannerLabel = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 24, fontWeight: 500, color: C.espresso,
  letterSpacing: "-0.01em", lineHeight: 1.1,
};
const cycleBannerSub = { fontSize: 12, color: C.espresso, opacity: 0.7, margin: "4px 0 0" };
const chipBowl = { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 };
const softChip = {
  display: "inline-flex", alignItems: "center",
  padding: "3px 9px", borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  fontSize: 11, color: C.espresso, fontWeight: 600,
};
const softChipDot = { width: 6, height: 6, borderRadius: 9999, marginRight: 5 };
const openCycleBtn = {
  marginTop: 10,
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", color: C.espresso,
  border: "1px solid rgba(58,44,26,0.18)", borderRadius: 9999,
  padding: "6px 12px", fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700, cursor: "pointer",
};

// Sections / streak
const sectionLine = { display: "flex", alignItems: "center", gap: 6, padding: "6px 0" };
const sectionLineRule = { flex: 1, height: 1, background: "rgba(58,44,26,0.10)" };
const sectionLabel = { fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: C.muted };
const checkboxRow = { display: "flex", alignItems: "center", gap: 8, padding: "5px 0" };
const streakRow = { display: "inline-flex", alignItems: "center", gap: 3, marginLeft: "auto" };
const streakDot = { width: 4, height: 4, borderRadius: 9999, background: C.gold };
const streakLabel = { fontSize: 9.5, color: C.muted, fontWeight: 600, marginLeft: 4 };
const sourceChip = {
  marginLeft: "auto", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "2px 6px", borderRadius: 9999, background: C.cream, color: C.muted,
};
const medTimeChip = { marginLeft: "auto", fontSize: 10, color: C.muted, fontWeight: 600 };
const addTaskInput = {
  width: "100%", padding: "7px 10px", marginTop: 6,
  borderRadius: 9999, background: C.cream,
  border: "1px dashed rgba(58,44,26,0.20)",
  fontSize: 12, color: C.espresso, outline: "none",
  boxSizing: "border-box",
};

// Consistency
const streakLeadersRow = { display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 8 };
const leaderChip = {
  display: "inline-flex", alignItems: "center",
  padding: "4px 10px", borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.08)",
  fontSize: 10.5, color: C.espresso,
};

// Rituals
const createRitualCard = {
  background: C.paper,
  border: `2px dashed ${C.gold}`,
  borderRadius: 16, padding: 16,
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  gap: 6, cursor: "pointer", fontFamily: "inherit",
  minHeight: 200, height: "100%", boxSizing: "border-box",
};
const createRitualIcon = {
  width: 48, height: 48, borderRadius: 9999,
  background: `${C.gold}1F`, display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const createRitualTitle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: C.espresso };
const createRitualSub = { fontSize: 11, color: C.muted, fontStyle: "italic", textAlign: "center" };
const countChip = {
  marginLeft: "auto", fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
  padding: "3px 8px", borderRadius: 9999,
};
const metaRow = { display: "flex", gap: 5, flexWrap: "wrap" };
const timeChip = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "3px 8px", borderRadius: 9999,
  background: C.cream, fontSize: 10, color: C.espresso, fontWeight: 600,
};
const ritualList = {
  listStyle: "none", padding: 0, margin: "4px 0 0",
  display: "flex", flexDirection: "column", gap: 4,
};
const ritualLine = { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.espresso };
const addToStackBtn = {
  marginTop: 6, padding: "8px 14px", borderRadius: 9999,
  border: "1px solid",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  cursor: "pointer",
};

// Plan a day
const planBtnRow = { display: "flex", gap: 12, marginTop: 6 };
const planBtn = {
  flex: 1, display: "flex", flexDirection: "column",
  alignItems: "center", gap: 6,
  padding: "16px 8px", borderRadius: 14,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  cursor: "pointer", fontFamily: "inherit", color: C.espresso,
};
const planBtnLabel = { fontSize: 13, fontWeight: 700, color: C.espresso };
const hiddenDateInput = { position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 };
const editPlanBtn = {
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "1px solid rgba(58,44,26,0.18)",
  borderRadius: 9999, padding: "4px 10px",
  fontSize: 11, fontWeight: 700, color: C.espresso, cursor: "pointer",
};
const todayPlanList = { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 };
const todayPlanLine = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "6px 8px", borderRadius: 8, background: C.cream,
};
const todayPlanDot = { width: 5, height: 5, borderRadius: 9999, background: C.espresso };
const todayPlanText = { flex: 1, fontSize: 13, color: C.espresso };
const editPlanInput = {
  flex: 1, padding: "5px 8px",
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.12)",
  borderRadius: 6, fontSize: 12, color: C.espresso, outline: "none",
};
const planBackBtn = {
  marginTop: 10,
  background: "transparent", border: "none",
  color: C.muted, fontSize: 11, fontWeight: 700,
  letterSpacing: "0.04em", cursor: "pointer", padding: 0,
  alignSelf: "flex-start",
};

// Week strip
const weekStripGrid = {
  display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginTop: 6,
};
const weekChip = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
  padding: "8px 0", borderRadius: 10,
  border: "1px solid",
  cursor: "pointer", fontFamily: "inherit",
};
const weekChipLetter = { fontSize: 9, letterSpacing: "0.10em", fontWeight: 700 };
const weekChipDate = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 14, fontWeight: 500 };
const weekChipDot = { width: 6, height: 6, borderRadius: 9999 };
const weekPopover = {
  marginTop: 8, padding: "8px 12px", borderRadius: 10,
  background: C.cream, border: "1px solid rgba(58,44,26,0.08)",
};
const weekPopText = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 13, color: C.espresso, margin: "4px 0 0",
};

// Intention
const intentionPromptStyle = {
  fontFamily: "Georgia, serif", fontStyle: "italic",
  fontSize: 13, color: C.muted, margin: "4px 0",
};
const intentionTextarea = {
  width: "100%", padding: "10px 12px",
  borderRadius: 10, background: C.cream,
  border: "1px solid rgba(58,44,26,0.10)",
  fontFamily: "Georgia, serif", fontSize: 13, color: C.espresso,
  lineHeight: 1.55, outline: "none", resize: "vertical",
  boxSizing: "border-box",
};
const savedChip = {
  marginTop: 4,
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 10, color: C.sage, fontWeight: 700, alignSelf: "flex-start",
};

// Astra
const astraAvatar = {
  position: "absolute", top: 12, right: 12,
  width: 30, height: 30, borderRadius: 9999,
  background: `${C.gold}22`, border: `1px solid ${C.gold}55`,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const astraShort = {
  fontFamily: "Georgia, serif",
  fontSize: 13, color: C.espresso, lineHeight: 1.55, margin: 0,
};
const astraOpenBtn = {
  alignSelf: "flex-start", marginTop: 4,
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent", border: "none",
  color: C.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0,
};
const astraSheetText = {
  fontFamily: "Georgia, serif", fontSize: 14, color: C.espresso,
  lineHeight: 1.65, margin: 0,
};

// Meals
const mealRow = { display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0" };
const mealLabel = { fontSize: 12, fontWeight: 700, color: C.espresso, letterSpacing: "0.04em" };
const mealValue = { fontSize: 11.5, color: C.muted, marginTop: 1, lineHeight: 1.4 };
const addMealBtn = {
  display: "inline-flex", alignItems: "center", gap: 3,
  padding: "3px 8px", borderRadius: 9999,
  background: C.cream, border: "1px dashed rgba(58,44,26,0.20)",
  fontSize: 10, fontWeight: 700, color: C.espresso, cursor: "pointer",
};
const hydrationRow = {
  marginTop: 10,
  display: "flex", alignItems: "center", gap: 8,
  padding: "8px 10px", borderRadius: 9999,
  background: C.cream,
};
const hydrationLabel = { flex: 1, fontSize: 12, color: C.espresso, fontWeight: 600 };
const hydroBtn = {
  width: 22, height: 22, borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.15)",
  color: C.espresso,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0,
};
const tipText = {
  fontFamily: "Georgia, serif", fontStyle: "italic",
  fontSize: 12, color: C.muted, margin: "8px 0 0", lineHeight: 1.55,
};

// Care
const allDoneChip = {
  marginLeft: "auto",
  display: "inline-flex", alignItems: "center", gap: 3,
  padding: "3px 9px", borderRadius: 9999,
  background: `${C.sage}22`, color: C.sage,
  fontSize: 10, fontWeight: 700,
};
const addMedBtn = {
  alignSelf: "flex-start", marginTop: 8,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 10px", borderRadius: 9999,
  background: C.cream, border: "1px dashed rgba(58,44,26,0.20)",
  fontSize: 11, fontWeight: 700, color: C.espresso, cursor: "pointer",
};

// Tonight + sleep
const reflectionRow = { display: "flex", flexDirection: "column", gap: 3, margin: "8px 0" };
const reflectionLabel = { fontSize: 11, color: C.muted, fontWeight: 600 };
const reflectionInput = {
  display: "block", width: "100%", boxSizing: "border-box",
  padding: "7px 10px", borderRadius: 8,
  background: C.cream, border: "1px solid rgba(58,44,26,0.10)",
  fontSize: 12, color: C.espresso, outline: "none",
  fontFamily: "'Inter', sans-serif",
};
const sleepTargetTime = {
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 500,
  color: C.espresso, margin: "4px 0",
};
const sleepLastNight = { padding: "8px 10px", borderRadius: 10, background: C.cream, marginTop: 4 };
const sleepLastNightText = { fontSize: 12, color: C.espresso, margin: "2px 0 0" };

// GP report
const iconCircle = {
  width: 38, height: 38, borderRadius: 12,
  display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const reportBtn = {
  alignSelf: "flex-start", marginTop: 8,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "9px 16px", borderRadius: 9999,
  background: C.espresso, color: C.cream, border: "none",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  cursor: "pointer",
};
const reportLastExport = { fontSize: 10, color: C.muted, fontStyle: "italic", marginTop: 8 };
const reportSectionRow = {
  display: "flex", alignItems: "flex-start", gap: 10,
  padding: "10px 12px", borderRadius: 10,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.08)",
};
const reportSectionLabel = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: C.espresso,
};
const reportSectionDesc = { fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 };

// Full overlay (Schedule / Cycle)
const overlayShell = {
  position: "fixed", inset: 0,
  background: C.cream, zIndex: 90,
  overflowY: "auto",
  fontFamily: "'Inter', system-ui, sans-serif",
};
const overlayHead = {
  position: "sticky", top: 0, zIndex: 1,
  display: "flex", alignItems: "center", gap: 8,
  padding: "14px 16px",
  background: C.cream,
  borderBottom: "1px solid rgba(58,44,26,0.08)",
};
const overlayClose = {
  width: 32, height: 32, borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.12)",
  color: C.espresso,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0,
};
const overlayTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: C.espresso,
  margin: "2px 0 0", letterSpacing: "-0.01em",
};
const overlayHint = {
  padding: "8px 16px 0",
  fontSize: 12, color: C.muted, fontStyle: "italic",
};

// Schedule
const schedHourRow = {
  display: "grid", gridTemplateColumns: "48px 14px 1fr",
  gap: 6, alignItems: "stretch",
  minHeight: 38, padding: "2px 0",
};
const schedHourLabel = {
  fontSize: 10, color: C.muted, fontWeight: 600, textAlign: "right", letterSpacing: "0.04em",
  alignSelf: "flex-start", paddingTop: 4,
};
const schedRailCol = { position: "relative", display: "flex", justifyContent: "center" };
const schedRail = { width: 4, height: "100%", borderRadius: 9999, minHeight: 36 };
const schedRailDot = {
  position: "absolute", left: "50%", transform: "translate(-50%, -50%)",
  width: 10, height: 10, borderRadius: 9999, background: C.espresso,
  boxShadow: `0 0 0 2px ${C.cream}`,
};
const schedNowLine = {
  position: "absolute", left: 12, right: -200, height: 1,
  background: C.espresso, opacity: 0.30,
};
const schedBlockCol = { display: "flex", flexDirection: "column", gap: 4 };
const schedBlock = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "6px 10px 6px 8px", borderRadius: 10,
  background: "transparent", border: "none", cursor: "pointer",
  fontFamily: "inherit", textAlign: "left",
  width: "100%",
};
const schedBlockIcon = {
  width: 22, height: 22, borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const schedBlockTitle = {
  fontSize: 12.5, fontWeight: 700, color: C.espresso,
  display: "flex", alignItems: "center", lineHeight: 1.2,
};
const schedBlockMeta = {
  fontSize: 9, letterSpacing: "0.10em", color: C.muted, fontWeight: 600, marginTop: 2,
};
const anchorPill = {
  fontSize: 8.5, fontWeight: 700, letterSpacing: "0.14em",
  padding: "2px 6px", borderRadius: 9999,
  background: `${C.gold}33`, color: C.goldDeep,
  marginLeft: 4,
};
const schedEmptySlot = {
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "transparent",
  color: "rgba(58,44,26,0.30)",
  border: "1px dashed rgba(58,44,26,0.18)",
  borderRadius: 9999, padding: "4px 10px",
  fontSize: 10, fontWeight: 700, cursor: "pointer",
  alignSelf: "flex-start", margin: "2px 0",
};

// Cycle overlay
const calSub = { fontSize: 11, color: C.muted, marginTop: 4, letterSpacing: "0.10em", fontWeight: 700 };
const dowRow = {
  display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4,
  padding: "12px 6px 4px",
};
const dowLabel = {
  fontSize: 10, color: C.muted, fontWeight: 700, letterSpacing: "0.10em", textAlign: "center",
};
const weekStack = { display: "flex", flexDirection: "column", gap: 8, marginTop: 4 };
const weekPillStyle = {
  display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4,
  padding: 8, borderRadius: 16,
  boxShadow: "0 2px 8px rgba(58,44,26,0.10)",
};
const dayBlank = { display: "block", height: 36 };
const dayTile = {
  background: "transparent", border: "none", padding: "8px 0",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
  cursor: "pointer", fontFamily: "inherit",
};
const dayTileToday = {
  background: "#FFFFFF", border: "none", padding: "8px 0",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
  cursor: "pointer", fontFamily: "inherit",
  borderRadius: 10,
  boxShadow: "0 2px 8px rgba(58,44,26,0.15)",
};
const dayNum = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 16, fontWeight: 500 };
const daySymptomDash = { width: 14, height: 2, borderRadius: 9999 };
const cycleLegendRow = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, padding: "0 4px" };
const cycleLegendChip = {
  display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: 11, color: C.espresso, fontWeight: 600, textTransform: "capitalize",
};

// Day detail
const dayEditBtn = {
  padding: "5px 12px", borderRadius: 9999,
  background: "transparent", border: "1px solid rgba(58,44,26,0.18)",
  color: C.espresso, fontSize: 11, fontWeight: 700, cursor: "pointer",
};
const dayInfoChip = {
  display: "inline-flex", alignItems: "center", gap: 4,
  fontSize: 11, color: C.espresso, fontWeight: 600,
  padding: "3px 9px", borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.08)",
};
const dayPrimaryBtn = {
  flex: 1, padding: "11px 14px", borderRadius: 9999,
  background: C.espresso, color: C.cream, border: "1px solid " + C.espresso,
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
};
const daySecondaryBtn = {
  flex: 1, padding: "11px 14px", borderRadius: 9999,
  background: "transparent", color: C.espresso, border: "1px solid rgba(58,44,26,0.18)",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
};

// FAB
const fabStyle = {
  position: "fixed", right: 20,
  bottom: "calc(90px + env(safe-area-inset-bottom, 0px))",
  width: 56, height: 56, borderRadius: 9999,
  background: C.gold, color: C.cream,
  border: "none", cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 4px 16px rgba(212,175,55,0.40)",
  zIndex: 60,
};
const addBackdrop = {
  position: "fixed", inset: 0,
  background: "rgba(58,44,26,0.45)", zIndex: 92,
  display: "flex", alignItems: "flex-end", justifyContent: "center",
  padding: "0 0 max(16px, env(safe-area-inset-bottom))",
};
const addPopup = {
  width: "100%", maxWidth: 760,
  background: C.cream,
  borderRadius: "22px 22px 0 0",
  padding: "16px 18px 22px",
  boxShadow: "0 -10px 32px rgba(58,44,26,0.20)",
  maxHeight: "85vh", overflowY: "auto",
};
const addHead = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 };
const addGrid = { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14, alignItems: "start" };
const voicePane = {
  display: "flex", flexDirection: "column", alignItems: "center",
  padding: 16, borderRadius: 14,
  background: C.paperHi, border: `1px solid ${C.gold}33`,
  textAlign: "center", gap: 6,
};
const voiceMicWrap = {
  width: 84, height: 84, borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};
const voiceTitle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 500, color: C.espresso, margin: "8px 0 0" };
const voiceSub = { fontSize: 12, color: C.muted, margin: "4px 0 0" };
const parsedCard = {
  marginTop: 10, padding: "10px 12px", borderRadius: 12,
  background: C.cream, border: `1px solid ${C.gold}55`,
  width: "100%", boxSizing: "border-box",
};
const parsedLine = { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 };
const parsedChip = {
  display: "inline-flex", alignItems: "center",
  padding: "3px 9px", borderRadius: 9999,
  background: C.paperHi, fontSize: 11, color: C.espresso, fontWeight: 700,
  border: "1px solid rgba(58,44,26,0.10)",
};
const manualPane = { display: "flex", flexDirection: "column", gap: 8 };
const manualGrid = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginTop: 4 };
const manualCard = {
  display: "flex", alignItems: "center", gap: 8,
  padding: 10, borderRadius: 12,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.10)",
  cursor: "pointer", fontFamily: "inherit",
};
const manualIcon = {
  width: 28, height: 28, borderRadius: 9,
  display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const manualLabel = { fontSize: 12.5, fontWeight: 700, color: C.espresso, lineHeight: 1.1 };
const manualSub = { fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.3 };

// Modal
const modalBackdrop = {
  position: "fixed", inset: 0,
  background: "rgba(58,44,26,0.40)", zIndex: 9999,
  display: "flex", alignItems: "flex-end", justifyContent: "center",
  padding: "0 0 max(16px, env(safe-area-inset-bottom))",
};
const modalCard = {
  width: "100%", maxWidth: 520,
  background: C.cream,
  borderRadius: "22px 22px 0 0",
  padding: "16px 18px 22px",
  boxShadow: "0 -8px 32px rgba(58,44,26,0.18)",
};
const modalHead = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  gap: 8, marginBottom: 4,
};
const drawerCloseBtn = {
  width: 28, height: 28, borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.12)",
  color: C.muted,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", flexShrink: 0,
};
const modalTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: C.espresso,
  letterSpacing: "-0.01em", margin: "4px 0 14px", lineHeight: 1.25,
};
const miniLabel = {
  fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
  color: C.muted, fontWeight: 700,
  display: "block", marginBottom: 6,
};
const modalInput = {
  width: "100%", padding: "10px 12px",
  borderRadius: 10, background: C.paperHi,
  border: "1px solid rgba(58,44,26,0.15)",
  fontSize: 14, color: C.espresso, outline: "none",
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
};
const chipRowSpacing = { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 };
const modalChip = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "6px 12px", borderRadius: 9999,
  border: "1px solid",
  fontSize: 11.5, fontWeight: 600, cursor: "pointer",
};
const modalFoot = { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 };
const modalCancelBtn = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "9px 14px", borderRadius: 9999,
  background: "transparent", color: C.muted,
  border: "1px solid rgba(58,44,26,0.18)",
  fontSize: 12, fontWeight: 700, cursor: "pointer",
};
const modalSaveBtn = {
  padding: "9px 18px", borderRadius: 9999,
  background: C.espresso, color: C.cream, border: "1px solid " + C.espresso,
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
};

// Footer
const demoFooter = {
  margin: "20px 16px 0",
  padding: "12px 14px", borderRadius: 12,
  background: "rgba(58,44,26,0.06)",
  textAlign: "center",
};
const demoFooterText = { fontSize: 11, color: C.muted, margin: "6px 0 0", lineHeight: 1.55 };

// ── Header sub-row (greeting + Plan a day pill) ──────────────────────────
const headerSubRow = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  marginTop: 4, gap: 8, flexWrap: "wrap",
};
const planPillBtn = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 12px", borderRadius: 9999,
  background: C.paperHi, color: C.espresso,
  border: "1px solid rgba(58,44,26,0.15)",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
  cursor: "pointer",
};

// ── Hero insight card ─────────────────────────────────────────────────────
const heroCard = {
  borderRadius: 20,
  padding: "20px 22px 18px",
  display: "flex", flexDirection: "column", gap: 8,
  minHeight: 220,
  position: "relative",
  boxSizing: "border-box",
  boxShadow: "0 2px 12px rgba(58,44,26,0.08)",
};
const heroCardRow = {
  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
};
const heroEyebrow = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
  textTransform: "uppercase", margin: 0,
};
const heroSunWrap = {
  flexShrink: 0,
  opacity: 0.85,
};
const heroTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 26, fontWeight: 500, color: C.espresso,
  margin: "4px 0 0", lineHeight: 1.2, letterSpacing: "-0.015em",
};
const heroBody = {
  fontSize: 15, color: "rgba(58,44,26,0.78)",
  margin: "4px 0 0", lineHeight: 1.6,
};
const heroFootRow = {
  display: "flex", alignItems: "center", gap: 5,
  marginTop: 8,
};
const heroFootText = {
  fontSize: 11, color: C.muted, fontWeight: 600,
};

// ── Your Day card (tall) ──────────────────────────────────────────────────
const yourDayCard = {
  background: C.cream,
  borderRadius: 18,
  padding: "16px 18px 16px 14px",
  boxShadow: "0 2px 12px rgba(58,44,26,0.08)",
  minHeight: 380,
  height: "100%",
  display: "flex", flexDirection: "column", gap: 4,
  boxSizing: "border-box",
};
const yourDayHead = {
  display: "flex", alignItems: "center", gap: 8,
};
const yourDayIconChip = {
  width: 28, height: 28, borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const yourDayLabel = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
};
const yourDaySectionLine = {
  display: "flex", alignItems: "center", gap: 6,
  padding: "4px 0",
};
const yourDaySectionRule = {
  flex: 1, height: 1, background: "rgba(58,44,26,0.10)",
};
const yourDaySectionName = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
  color: C.muted,
};
const yourDayItemRow = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "4px 0",
};
const yourDayItemMeta = {
  fontSize: 9.5, letterSpacing: "0.08em",
};
const yourDayAddBtn = {
  alignSelf: "flex-start", marginTop: 10,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 12px", borderRadius: 9999,
  background: "transparent",
  border: "1px dashed",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
  cursor: "pointer",
};

// ── Plan a day sheet ──────────────────────────────────────────────────────
const blueprintDotsRow = {
  display: "flex", justifyContent: "center", gap: 5, margin: "8px 0 12px",
};
const blueprintDot = {
  width: 7, height: 7, borderRadius: 9999,
  transition: "all 200ms ease",
};
const confirmLineStyle = {
  padding: "8px 12px", borderRadius: 10,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.08)",
  display: "flex", flexDirection: "column", gap: 2,
};
const addPlanLineBtn = {
  marginTop: 8,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 9999,
  background: C.cream, border: "1px dashed rgba(58,44,26,0.25)",
  color: C.espresso, fontSize: 11, fontWeight: 700, cursor: "pointer",
};

// ── Cycle overlay roman numeral badge ─────────────────────────────────────
const overlayTitleWithRoman = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 22, fontWeight: 500, color: C.espresso,
  margin: "2px 0 0", letterSpacing: "-0.01em",
  display: "inline-flex", alignItems: "baseline", gap: 8,
};
const cycleRomanBadge = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 600, fontStyle: "italic",
  color: C.gold, letterSpacing: "0.04em",
};

// ── Mind & Insight extras ────────────────────────────────────────────────
const moodWeekRow = {
  display: "flex", gap: 8, padding: "8px 0", marginTop: 4,
};
const moodDotCol = {
  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
};
const moodDot = {
  width: 18, height: 18, borderRadius: 9999, display: "inline-block",
};
const moodDotLabel = {
  fontSize: 9, letterSpacing: "0.1em", color: C.muted, fontWeight: 700,
};
const miniInputLabel = {
  display: "flex", flexDirection: "column", gap: 4, marginTop: 4,
};
// Phase B follow-up: explicit width so empty inputs stay clickable on mobile.
const miniInput = {
  display: "block", width: "100%", boxSizing: "border-box",
  padding: "7px 10px",
  borderRadius: 8, background: C.cream,
  border: "1px solid rgba(58,44,26,0.10)",
  fontFamily: "'Inter', sans-serif", fontSize: 12,
  color: C.espresso, outline: "none",
  boxSizing: "border-box",
};
const talkJessBtn = {
  alignSelf: "flex-start", marginTop: 6,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 9999,
  background: `${C.gold}1F`, border: `1px solid ${C.gold}55`,
  color: C.espresso, fontSize: 11, fontWeight: 700, cursor: "pointer",
};

// Breathwork
const breathwork = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "10px 12px", borderRadius: 12,
  border: "1px solid", cursor: "pointer",
  fontFamily: "inherit",
  width: "100%",
};
const breathName = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 14, fontWeight: 500, color: C.espresso, lineHeight: 1.2,
};
const breathMeta = {
  fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: "0.04em",
};

// Macro tracker
const macroRingRow = {
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 6,
};
const macroCol = {
  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
};
const macroLabel = {
  fontSize: 11, fontWeight: 700, color: C.espresso,
};
const macroSub = {
  fontSize: 9, letterSpacing: "0.10em", color: C.muted, fontWeight: 600, textTransform: "uppercase",
};

// Hydration
const hydrationCount = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 28, fontWeight: 500, color: C.espresso, lineHeight: 1,
};
const hydroGlassRow = {
  display: "flex", gap: 5, marginTop: 4,
};
const hydroGlassDot = {
  flex: 1, height: 22, borderRadius: 6,
  border: "1px solid",
  display: "inline-block",
};
const hydroBtnRow = {
  display: "flex", gap: 8, marginTop: 6,
};
const hydroAdjustBtn = {
  flex: 1, padding: "8px 0", borderRadius: 9999,
  background: C.paperHi, color: C.espresso,
  border: "1px solid rgba(58,44,26,0.15)",
  fontSize: 16, fontWeight: 700, cursor: "pointer",
};

// AI meal
const aiMealRow = {
  padding: "6px 10px", borderRadius: 10,
  background: C.cream, border: "1px solid rgba(58,44,26,0.05)",
  display: "flex", flexDirection: "column", gap: 2,
};
const aiMealLabel = {
  fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
  color: C.goldDeep, fontWeight: 700,
};
const aiMealText = {
  fontSize: 12, color: C.espresso, lineHeight: 1.4,
};

// Phase recipes
const recipeRow = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "6px 0",
};
const recipeImg = {
  width: 30, height: 30, borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const recipeName = {
  fontSize: 13, fontWeight: 600, color: C.espresso, lineHeight: 1.2,
};
const recipeTime = {
  fontSize: 10, color: C.muted, marginTop: 1,
};

// Body scan
const scanRow = {
  display: "flex", alignItems: "center", gap: 8, padding: "4px 0",
};
const scanLabel = {
  fontSize: 10, color: C.muted, fontWeight: 600, minWidth: 50,
};
const scanDots = {
  display: "flex", flex: 1, gap: 6, justifyContent: "center",
};
const scanDot = {
  width: 14, height: 14, borderRadius: 9999,
  border: "1.5px solid", cursor: "pointer",
  background: "transparent", padding: 0,
};

// Tomorrow
const energyForecastRow = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "8px 12px", borderRadius: 10,
  background: C.cream, marginTop: 4,
};
const energyBars = {
  display: "flex", alignItems: "flex-end", gap: 3, height: 14,
};
const energyBar = {
  width: 6, borderRadius: 2, display: "inline-block",
};

// Cycle reflection
const reflectionLine = {
  display: "flex", alignItems: "center", gap: 8, marginTop: 6,
};
const reflectionLineLabel = {
  fontSize: 11, fontWeight: 700, color: C.muted, minWidth: 50, letterSpacing: "0.04em",
};
const reflectionPicks = {
  display: "flex", flex: 1, gap: 4, flexWrap: "wrap",
};
const reflectionPick = {
  padding: "4px 10px", borderRadius: 9999,
  border: "1px solid", cursor: "pointer",
  fontSize: 10.5, fontWeight: 600,
};

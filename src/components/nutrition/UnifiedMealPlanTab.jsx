// UnifiedMealPlanTab — ONE planner. Manual edits and AI generation are edits to
// the SAME plan object (the master plan's "unified planner"). A week grid
// (Mon–Sun × breakfast/lunch/dinner/snack); each cell is a tappable meal card you
// can edit, swap (regenerate just that cell), or LOCK. A single Regenerate fills
// only UNLOCKED cells — locked cells survive, never clobbered (the key fix vs the
// old AI tab whose Save overwrote the whole week). Allergies/dietary are HARD
// constraints; wellness goal + life stage are SOFT weights. A live week macro
// preview frames the week gently (never a pass/fail score). Stage-aware soft nudge.
//
// PRODUCTION code, real Base44 only — no mock data. Every read/write is guarded
// (.catch / withTimeout) so a stalled call rejects instead of hanging; cell edits
// are optimistic with rollback. Brand: Editorial cream/plum tokens, Lucide icons,
// NO EMOJI, no scoreboards/streaks. Phone-first.
//
// ── Data model (additive, backward-compatible) ───────────────────────────────
// We keep MealPlans.plan_days EXACTLY as the legacy shape:
//   plan_days: [{ day, breakfast:[str], lunch:[str], dinner:[str], snack:[str] }]
// (index 0 of each slot array is the cell's meal name). The legacy NutritionPlanTab
// and the hub's MealgenCard keep reading this without change. We add two SIBLING
// fields the legacy code simply ignores:
//   locked_cells: ["<day>_<slot>", …]                       — which cells are pinned
//   cell_macros:  { "<day>_<slot>": {calories,protein_g,carbs_g,fat_g} }  — hints
// Nothing here breaks an old row: missing fields default to empty.

import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format, startOfWeek, addDays } from "date-fns";
import {
  Lock, Unlock, RefreshCw, Sparkles, Check, X, Pencil, Leaf,
} from "lucide-react";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { withTimeout } from "@/utils/safeEntity";
import { slotSuggestions } from "@/utils/personalisation";

const SLOTS = ["breakfast", "lunch", "dinner", "snack"];
const SLOT_LABEL = { breakfast: "Morning", lunch: "Midday", dinner: "Evening", snack: "Snack" };
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WELLNESS_GOALS = [
  { id: "energy", label: "Energy" },
  { id: "digestion", label: "Digestion" },
  { id: "sleep", label: "Sleep" },
  { id: "mood", label: "Mood" },
  { id: "hydration", label: "Hydration" },
  { id: "hormone", label: "Hormone Balance" },
];

// Common dietary HARD constraints (allergies/exclusions) passed straight to the
// generator's dietary_preferences. Free-text additions also allowed below.
const DIETARY = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Egg-Free", "Shellfish-Free"];

const cellKey = (day, slot) => `${day}_${slot}`;

// Gentle, qualitative stage nudge — never prescriptive, never a number target.
function stageNudge(profile) {
  const stage = profile?.life_stage || profile?.stage;
  const byStage = {
    teen: "Steady iron and calcium quietly support these growing years — no rules, just a gentle lean.",
    reproductive: "Iron-rich plates around your cycle can soften the dips. A soft lean, not a rule.",
    "pre-ttc": "Folate-rich greens and good fats are quietly doing a lot as you prepare.",
    ttc: "Colour on the plate and good fats are gently weighted for you this season.",
    pregnant: "Little and often, with iron and calcium leaning in — whatever sits well is enough.",
    "pregnant-t1": "Whatever stays down counts. Iron leans in gently when you fancy it.",
    "pregnant-t2": "Iron and calcium lean in now — small, steady plates over big ones.",
    "pregnant-t3": "Iron and calcium still lean in; little and often tends to sit best.",
    postpartum: "Easy-to-reach, iron-rich food first — feeding yourself counts as much as anything.",
    perimenopause: "We lean gently toward iron and steady protein to soften the swings.",
    menopause: "Calcium and a little extra protein are gently weighted for you right now.",
    "post-menopause": "Calcium, protein and fibre lean in quietly — kind to bones and heart.",
  };
  return (stage && byStage[stage]) || "We lean the week gently toward protein and fibre to keep energy steady.";
}

// Which nutrient the stage softly favours — used to phrase the macro preview line
// ("leans iron-rich / protein-steady for your stage"), never a verdict.
function stageLean(profile) {
  const stage = profile?.life_stage || profile?.stage;
  if (!stage) return "balanced";
  if (["perimenopause", "menopause", "post-menopause"].includes(stage)) return "calcium-and-protein";
  if (["pregnant", "pregnant-t1", "pregnant-t2", "pregnant-t3", "postpartum", "ttc", "reproductive", "teen"].includes(stage)) return "iron-rich";
  return "protein-steady";
}

const card = {
  background: T.paperHi,
  border: `1px solid ${T.paperDeep}`,
  borderRadius: 18,
};

const sLabel = {
  fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4,
  textTransform: "uppercase", color: T.muted,
};

export default function UnifiedMealPlanTab({ user, profile, nutritionProfile, targets }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [recents, setRecents] = useState([]);
  const [mealRows, setMealRows] = useState([]); // raw MealLog rows — for per-slot memory

  const [activeDay, setActiveDay] = useState(0);     // 0..6 (Mon..Sun)
  const [editing, setEditing] = useState(null);      // { day, slot } | null
  const [draft, setDraft] = useState("");
  const [regenScope, setRegenScope] = useState(null); // null | "week" | `${day}` | `${day}_${slot}`
  const [goal, setGoal] = useState(null);
  const [dietary, setDietary] = useState([]);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekKey = format(weekStart, "yyyy-MM-dd");
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekKey, weekStart]);

  const todayIndex = (() => {
    const dow = new Date().getDay(); // 0 Sun..6 Sat
    return dow === 0 ? 6 : dow - 1;  // Mon=0
  })();

  // ── load / create the real MealPlans row for this week (guarded) ─────────────
  const loadPlan = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [plans, tmpl, recentRows] = await Promise.all([
        base44.entities.MealPlans.filter({ user_id: user.id, week_start: weekKey }).catch(() => []),
        base44.entities.MealTemplates.filter({ user_id: user.id }).catch(() => []),
        // wider window so per-slot MEMORY (slotSuggestions) has real history to learn from
        base44.entities.MealLog.filter({ user_id: user.id }, "-created_date", 60).catch(() => []),
      ]);
      setTemplates((tmpl || []).filter(Boolean));
      const mealLogRows = (recentRows || []).filter(Boolean);
      setMealRows(mealLogRows); // keep raw rows (meal_type intact) for slotSuggestions
      // distinct recent meal texts (real) for the editor's one-tap chips
      const seen = new Set();
      const distinct = [];
      for (const m of mealLogRows) {
        const text = (m.raw_text || "").trim();
        const k = text.toLowerCase();
        if (!text || seen.has(k)) continue;
        seen.add(k);
        distinct.push(text);
        if (distinct.length >= 8) break;
      }
      setRecents(distinct);

      let row = (plans || []).filter(Boolean)[0] || null;
      if (!row) {
        row = await withTimeout(base44.entities.MealPlans.create({
          user_id: user.id, week_start: weekKey,
          plan_days: [], locked_cells: [], cell_macros: {}, is_active: true,
          created_at: new Date().toISOString(),
        }), 6000, "save").catch((e) => { console.error(e); return null; });
        if (!row) { setLoadError("Couldn't open your plan — pull to retry."); setLoading(false); return; }
      }
      setPlan(row);
      if (row.wellness_goal) setGoal(row.wellness_goal);
      if (Array.isArray(row.dietary_preferences)) setDietary(row.dietary_preferences);
    } catch (e) {
      console.error(e);
      setLoadError("Couldn't open your plan — please try again.");
    }
    setLoading(false);
  }, [user, weekKey]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  // ── derive a flat view of the plan: cells[day_slot] = { name, locked, macros } ──
  const cells = useMemo(() => {
    const map = {};
    const planDays = plan?.plan_days || [];
    const locked = new Set(plan?.locked_cells || []);
    const macros = plan?.cell_macros || {};
    for (let d = 0; d < 7; d++) {
      for (const slot of SLOTS) {
        const k = cellKey(d, slot);
        map[k] = { name: "", locked: locked.has(k), macros: macros[k] || null };
      }
    }
    for (const pd of planDays) {
      if (pd == null || typeof pd.day !== "number") continue;
      for (const slot of SLOTS) {
        const arr = pd[slot];
        const name = Array.isArray(arr) ? (arr[0] || "") : (typeof arr === "string" ? arr : "");
        const k = cellKey(pd.day, slot);
        if (map[k]) map[k].name = name;
      }
    }
    return map;
  }, [plan]);

  // ── rebuild plan_days (legacy string-array shape) from a cells map ───────────
  const buildPlanDays = (cellMap) => {
    const out = [];
    for (let d = 0; d < 7; d++) {
      const day = { day: d, breakfast: [], lunch: [], dinner: [], snack: [] };
      let any = false;
      for (const slot of SLOTS) {
        const name = cellMap[cellKey(d, slot)]?.name?.trim();
        if (name) { day[slot] = [name]; any = true; }
      }
      if (any) out.push(day);
    }
    return out;
  };
  const buildLocked = (cellMap) =>
    Object.entries(cellMap).filter(([, c]) => c.locked).map(([k]) => k);
  const buildMacros = (cellMap) => {
    const m = {};
    for (const [k, c] of Object.entries(cellMap)) if (c.macros) m[k] = c.macros;
    return m;
  };

  // ── persist a whole cells map (optimistic, with rollback) ────────────────────
  const persistCells = async (nextCells, { successToast } = {}) => {
    if (!plan) return;
    const prev = plan;
    const optimistic = {
      ...plan,
      plan_days: buildPlanDays(nextCells),
      locked_cells: buildLocked(nextCells),
      cell_macros: buildMacros(nextCells),
    };
    setPlan(optimistic); // optimistic
    try {
      const updated = await withTimeout(base44.entities.MealPlans.update(plan.id, {
        plan_days: optimistic.plan_days,
        locked_cells: optimistic.locked_cells,
        cell_macros: optimistic.cell_macros,
        updated_at: new Date().toISOString(),
      }), 6000, "save");
      setPlan(updated || optimistic);
      if (successToast) toast.success(successToast);
    } catch (e) {
      console.error(e);
      setPlan(prev); // rollback
      toast.error("Couldn't save — try again");
    }
  };

  // ── cell edit: write a typed/picked meal name into a single cell ─────────────
  const saveCellName = async (day, slot, name) => {
    const clean = (name || "").trim();
    const next = { ...cells, [cellKey(day, slot)]: { ...cells[cellKey(day, slot)], name: clean } };
    setEditing(null); setDraft("");
    await persistCells(next);
  };

  const clearCell = async (day, slot) => {
    const k = cellKey(day, slot);
    const next = { ...cells, [k]: { ...cells[k], name: "", macros: null } };
    await persistCells(next);
  };

  // ── lock toggle: pinned cells survive Regenerate ─────────────────────────────
  const toggleLock = async (day, slot) => {
    const k = cellKey(day, slot);
    const next = { ...cells, [k]: { ...cells[k], locked: !cells[k].locked } };
    await persistCells(next);
  };

  // ── shared generator call → maps the function output into a cells map, filling
  //    ONLY the unlocked cells in `targetKeys`. Locked cells are never touched. ──
  const runGenerate = async (scope, targetKeys) => {
    if (!plan || regenScope) return;
    setRegenScope(scope);
    // persist the chosen goal/dietary onto the plan first (best-effort, non-blocking)
    try {
      await withTimeout(base44.entities.MealPlans.update(plan.id, {
        wellness_goal: goal || undefined,
        dietary_preferences: dietary,
        updated_at: new Date().toISOString(),
      }), 6000, "save");
    } catch (e) { console.error(e); /* soft — generation can still proceed */ }

    // MEMORY: the user's own frequent meals per slot, from their logged history — a
    // SOFT hint so the generator leans toward what they actually reach for. Only
    // included when history supports it; guarded so a thin history just omits it.
    const usualMeals = {};
    for (const slot of SLOTS) {
      const picks = slotSuggestions(mealRows, slot, { limit: 4 });
      if (picks.length) usualMeals[slot] = picks;
    }
    const hasUsual = Object.keys(usualMeals).length > 0;

    try {
      const res = await withTimeout(base44.functions.invoke("generateMealPlan", {
        mode: "meal_plan",
        wellness_goal: goal || undefined,        // soft weight
        dietary_preferences: dietary,            // HARD constraints (allergies/exclusions)
        duration_days: 7,
        included_meal_types: SLOTS,
        cuisine_preference: undefined,
        // gentle personalisation: foods this user often logs per slot (soft lean only)
        usual_meals: hasUsual ? usualMeals : undefined,
        // gentle SOFT targets — explicit user value wins, else the derived guide
        calorie_target: nutritionProfile?.calories_target || targets?.energy_kcal,
        protein_target: nutritionProfile?.protein_target_g || targets?.protein_g,
      }), 20000, "meal plan");

      const data = res?.data?.data || res?.data; // function returns { mode, data }
      if (!data || res?.data?.error) {
        toast.error(res?.data?.error || "Couldn't generate just now — try again");
        setRegenScope(null);
        return;
      }
      const genDays = Array.isArray(data.days) ? data.days : [];

      // Build a lookup: dayIdx -> slot -> { name, macros } from the generated plan.
      const proposed = {}; // `${dayIdx}_${slot}` -> { name, macros }
      genDays.forEach((gd, i) => {
        const dayIdx = (typeof gd.day_number === "number" ? (gd.day_number - 1) : i) % 7;
        const dailyMacro = gd.nutritional_summary || null; // per-day macros if present
        for (const slot of SLOTS) {
          const meal = gd.meals?.[slot];
          if (!meal?.name) continue;
          // per-meal macros if the model supplied them, else fall back to nothing
          const mealMacro = meal.nutritional_summary || meal.macros || null;
          proposed[cellKey(dayIdx, slot)] = {
            name: meal.name,
            macros: normalizeMacro(mealMacro) || perSlotShare(dailyMacro),
          };
        }
      });

      // Fill ONLY the target keys that are NOT locked. Locked cells untouched.
      const next = { ...cells };
      let filled = 0;
      for (const k of targetKeys) {
        if (cells[k]?.locked) continue;           // never clobber a locked cell
        const p = proposed[k];
        if (!p) continue;                          // model didn't supply this slot
        next[k] = { ...cells[k], name: p.name, macros: p.macros || null };
        filled++;
      }
      if (filled === 0) {
        toast("Nothing to fill — those cells are locked or no suggestion came back.");
        setRegenScope(null);
        return;
      }
      await persistCells(next, {
        successToast:
          scope === "week" ? "Week refreshed — locked meals kept" :
          scope.includes("_") ? "Meal swapped" : "Day refreshed — locked meals kept",
      });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't generate just now — try again");
    }
    setRegenScope(null);
  };

  // Regenerate the whole week (only unlocked cells across all days/slots).
  const regenerateWeek = () =>
    runGenerate("week", SLOTS.flatMap((slot) => days.map((_, d) => cellKey(d, slot))));

  // Regenerate a single day (only its unlocked cells).
  const regenerateDay = (day) =>
    runGenerate(String(day), SLOTS.map((slot) => cellKey(day, slot)));

  // Swap a single cell (regenerate just that cell, if unlocked).
  const swapCell = (day, slot) => runGenerate(cellKey(day, slot), [cellKey(day, slot)]);

  // ── live week macro preview (sum of KNOWN per-cell macros) ───────────────────
  const macroPreview = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0, known = 0, planned = 0;
    for (const c of Object.values(cells)) {
      if (c.name) planned++;
      if (c.macros) {
        known++;
        calories += Number(c.macros.calories) || 0;
        protein += Number(c.macros.protein_g) || 0;
        carbs += Number(c.macros.carbs_g) || 0;
        fat += Number(c.macros.fat_g) || 0;
      }
    }
    return {
      calories: Math.round(calories), protein: Math.round(protein),
      carbs: Math.round(carbs), fat: Math.round(fat), known, planned,
    };
  }, [cells]);

  const lean = stageLean(profile);
  // a gentle daily protein guide from the DERIVED targets, woven in lightly (never a cap)
  const proteinGuide = targets?.protein_g ? Math.round(targets.protein_g) : null;
  // Gentle macro-preview sentence — qualitative, never a pass/fail score.
  const macroLine = (() => {
    if (macroPreview.planned === 0) return "Add or generate meals and a gentle picture of the week will gather here.";
    const leanPhrase =
      lean === "iron-rich" ? "leans iron-rich for your stage" :
      lean === "calcium-and-protein" ? "leans toward calcium and steady protein for your stage" :
      "stays protein-steady for your stage";
    const guideTail = proteinGuide ? ` It leans toward your ~${proteinGuide}g protein guide — a guide, never a cap.` : "";
    if (macroPreview.known === 0) {
      return `${macroPreview.planned} meals planned — the week ${leanPhrase}.${guideTail} Generate to see its gentle macro shape.`;
    }
    return `Across the meals we can read, the week ${leanPhrase} — roughly ${macroPreview.protein}g protein and ${macroPreview.carbs}g carbs over the week.${guideTail} A picture, not a target.`;
  })();

  // ── editor chips (real): MEMORY-led — the user's own frequent meals for THIS slot
  //    (from their logged history) lead, then templates for the slot, then recents. ──
  const editorSuggestions = (slot) => {
    const learned = slotSuggestions(mealRows, slot, { limit: 6 }); // their go-tos for this slot
    const tmpl = templates.filter((t) => t.default_meal_type === slot).map((t) => t.title).filter(Boolean);
    const all = [...learned, ...tmpl, ...recents];
    const seen = new Set();
    return all.filter((s) => { const k = (s || "").toLowerCase(); if (!k || seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8);
  };

  // a gentle "you often have …" hint for the slot being edited — only when memory has
  // a real top pick for that slot; never shown otherwise. Memory as warm observation.
  const slotHint = (slot) => {
    const top = slotSuggestions(mealRows, slot, { limit: 1 })[0];
    return top ? `You often have ${top} for ${SLOT_LABEL[slot].toLowerCase()}.` : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: "56px 0" }}>
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ ...card, padding: 18, textAlign: "center" }}>
        <p style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, marginBottom: 12 }}>{loadError}</p>
        <button onClick={loadPlan} style={primaryBtn}>Try again</button>
      </div>
    );
  }

  const busyWeek = regenScope === "week";
  const busyDay = regenScope === String(activeDay);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── preference rail: goal (soft) + dietary (hard) ─────────────────────── */}
      <div style={{ ...card, padding: 16 }}>
        <p style={sLabel}>This week leans toward</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {WELLNESS_GOALS.map((g) => {
            const on = goal === g.id;
            return (
              <button key={g.id} onClick={() => setGoal(on ? null : g.id)}
                style={chip(on)}>{g.label}</button>
            );
          })}
        </div>
        <p style={{ ...sLabel, marginTop: 16 }}>Avoid / dietary (kept strictly)</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {DIETARY.map((d) => {
            const on = dietary.includes(d);
            return (
              <button key={d}
                onClick={() => setDietary((p) => on ? p.filter((x) => x !== d) : [...p, d])}
                style={chip(on, T.crimson)}>{d}</button>
            );
          })}
        </div>
      </div>

      {/* ── live week macro / nutrient preview (gentle, never a score) ────────── */}
      <div style={{ ...card, padding: 16, background: T.wax }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Leaf size={14} color={T.sage} />
          <p style={{ ...sLabel, color: T.sage }}>The week at a glance</p>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.45 }}>{macroLine}</p>
        {macroPreview.known > 0 && (
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            {[["Protein", macroPreview.protein], ["Carbs", macroPreview.carbs], ["Fats", macroPreview.fat]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>{v}g</div>
                <div style={{ fontFamily: UI, fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{l} · week</div>
              </div>
            ))}
          </div>
        )}
        {/* stage-aware soft nudge */}
        <p style={{ fontFamily: SERIF, fontSize: 12.5, fontStyle: "italic", color: T.muted, marginTop: 12, lineHeight: 1.45 }}>
          {stageNudge(profile)}
        </p>
      </div>

      {/* ── one Regenerate (fills only UNLOCKED cells) ────────────────────────── */}
      <button onClick={regenerateWeek} disabled={!!regenScope}
        style={{ ...primaryBtn, opacity: regenScope ? 0.7 : 1 }}>
        {busyWeek
          ? <><RefreshCw size={15} className="animate-spin" /> Refreshing the week…</>
          : <><Sparkles size={15} /> Generate / Regenerate week</>}
      </button>
      <p style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, textAlign: "center", marginTop: -6 }}>
        Locked meals are always kept — only open cells are refreshed.
      </p>

      {/* ── day rail ──────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
        {days.map((day, i) => {
          const on = activeDay === i;
          const isToday = i === todayIndex;
          return (
            <button key={i} onClick={() => setActiveDay(i)}
              style={{
                flex: "none", display: "flex", flexDirection: "column", alignItems: "center",
                padding: "8px 12px", borderRadius: 14, cursor: "pointer",
                background: on ? T.ink : T.paperHi,
                color: on ? T.paper : T.muted,
                border: `1px solid ${isToday && !on ? T.gold : on ? T.ink : T.paperDeep}`,
              }}>
              <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>{DAY_NAMES[i]}</span>
              <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, marginTop: 1, color: on ? T.paper : T.ink }}>
                {format(day, "d")}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── per-day regenerate ────────────────────────────────────────────────── */}
      <button onClick={() => regenerateDay(activeDay)} disabled={!!regenScope}
        style={{ ...ghostBtn, alignSelf: "flex-start", opacity: regenScope ? 0.6 : 1 }}>
        {busyDay
          ? <><RefreshCw size={13} className="animate-spin" /> Refreshing {DAY_NAMES[activeDay]}…</>
          : <><RefreshCw size={13} /> Regenerate {DAY_NAMES[activeDay]} (keeps locks)</>}
      </button>

      {/* ── the day's meal cells ──────────────────────────────────────────────── */}
      <div style={{ display: "grid", gap: 10 }}>
        {SLOTS.map((slot) => {
          const k = cellKey(activeDay, slot);
          const c = cells[k];
          const isEditing = editing?.day === activeDay && editing?.slot === slot;
          const busyCell = regenScope === k;
          return (
            <div key={slot} style={{
              ...card, padding: 14,
              borderColor: c.locked ? T.gold : T.paperDeep,
              background: c.locked ? T.wax : T.paperHi,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={sLabel}>{SLOT_LABEL[slot]}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {/* LOCK toggle — pinned cells survive regenerate */}
                  <button onClick={() => toggleLock(activeDay, slot)} disabled={!!regenScope}
                    aria-label={c.locked ? "Unlock meal" : "Lock meal"} title={c.locked ? "Locked — kept on regenerate" : "Lock to keep on regenerate"}
                    style={{ ...iconBtn, color: c.locked ? T.gold : T.muted, background: c.locked ? "rgba(168,137,63,0.12)" : "transparent" }}>
                    {c.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  {/* SWAP — regenerate just this cell */}
                  <button onClick={() => swapCell(activeDay, slot)} disabled={!!regenScope || c.locked}
                    aria-label="Swap meal" title={c.locked ? "Unlock to swap" : "Swap this meal"}
                    style={{ ...iconBtn, opacity: c.locked ? 0.35 : 1 }}>
                    <RefreshCw size={14} className={busyCell ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") saveCellName(activeDay, slot, draft); }}
                    placeholder={`Type a ${SLOT_LABEL[slot].toLowerCase()} meal…`}
                    style={{
                      width: "100%", padding: "11px 13px", borderRadius: 12,
                      border: `1.5px solid ${T.paperDeep}`, background: T.paper,
                      fontFamily: SERIF, fontSize: 14, color: T.ink, outline: "none",
                    }} />
                  {slotHint(slot) && (
                    <p style={{ fontFamily: SERIF, fontSize: 12, fontStyle: "italic", color: T.muted, margin: 0, lineHeight: 1.4 }}>
                      {slotHint(slot)}
                    </p>
                  )}
                  {editorSuggestions(slot).length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {editorSuggestions(slot).map((s) => (
                        <button key={s} onClick={() => setDraft(s)} style={chip(false)}>{s}</button>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setEditing(null); setDraft(""); }} style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}>
                      <X size={13} /> Cancel
                    </button>
                    <button onClick={() => saveCellName(activeDay, slot, draft)} disabled={!draft.trim()}
                      style={{ ...primaryBtn, flex: 1, opacity: draft.trim() ? 1 : 0.5, padding: "10px 14px" }}>
                      <Check size={13} /> Save
                    </button>
                  </div>
                </div>
              ) : c.name ? (
                <button onClick={() => { setEditing({ day: activeDay, slot }); setDraft(c.name); }}
                  style={{
                    width: "100%", textAlign: "left", background: "transparent", border: "none",
                    cursor: "pointer", padding: 0,
                  }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.3 }}>{c.name}</span>
                    <Pencil size={13} color={T.muted} style={{ flexShrink: 0, marginTop: 3 }} />
                  </div>
                  {c.macros && (
                    <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 5 }}>
                      {c.macros.calories ? `${Math.round(c.macros.calories)} kcal` : ""}
                      {c.macros.calories && c.macros.protein_g ? " · " : ""}
                      {c.macros.protein_g ? `${Math.round(c.macros.protein_g)}g protein` : ""}
                    </div>
                  )}
                </button>
              ) : (
                <button onClick={() => { setEditing({ day: activeDay, slot }); setDraft(""); }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6, background: "transparent",
                    border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.muted, padding: 0,
                  }}>
                  <Pencil size={13} /> Add a meal
                </button>
              )}

              {c.name && !isEditing && (
                <button onClick={() => clearCell(activeDay, slot)} disabled={!!regenScope}
                  style={{ marginTop: 8, background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 10, color: T.muted }}>
                  Clear
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: SERIF, fontSize: 11.5, fontStyle: "italic", color: T.muted, textAlign: "center", marginTop: 4 }}>
        One plan — tap to edit, lock to keep, regenerate the rest. A guide, never a cap.
      </p>
    </div>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

// Coerce any macro-ish object to our canonical shape, or null if it has no numbers.
function normalizeMacro(m) {
  if (!m || typeof m !== "object") return null;
  const out = {
    calories: Number(m.calories ?? m.kcal) || 0,
    protein_g: Number(m.protein_g ?? m.protein) || 0,
    carbs_g: Number(m.carbs_g ?? m.carbs) || 0,
    fat_g: Number(m.fat_g ?? m.fat) || 0,
  };
  if (!out.calories && !out.protein_g && !out.carbs_g && !out.fat_g) return null;
  return out;
}

// If only a per-DAY macro total is supplied, give each of the 4 slots a soft share
// so the week preview has something honest to sum. Returns null when absent.
function perSlotShare(dayMacro) {
  const m = normalizeMacro(dayMacro);
  if (!m) return null;
  // breakfast/lunch/dinner/snack ≈ 0.25/0.3/0.35/0.1 — but we don't know the slot
  // here, so use an even quarter; it's a gentle estimate, never a target.
  const f = 0.25;
  return {
    calories: Math.round(m.calories * f),
    protein_g: Math.round(m.protein_g * f),
    carbs_g: Math.round(m.carbs_g * f),
    fat_g: Math.round(m.fat_g * f),
  };
}

const chip = (on, onColor = T.ink) => ({
  padding: "6px 11px", borderRadius: 999, cursor: "pointer",
  fontFamily: UI, fontSize: 11, fontWeight: 700,
  background: on ? onColor : "transparent",
  color: on ? T.paper : T.muted,
  border: `1px solid ${on ? onColor : T.paperDeep}`,
});

const primaryBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: T.ink, color: T.paper, border: "none", borderRadius: 12,
  padding: "13px 16px", cursor: "pointer",
  fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
};

const ghostBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 10,
  padding: "8px 12px", cursor: "pointer",
  fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: T.ink,
};

const iconBtn = {
  width: 30, height: 30, borderRadius: 9, border: "none", cursor: "pointer",
  display: "grid", placeItems: "center", color: T.muted, background: "transparent",
};

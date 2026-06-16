// NutritionHub — the REAL Nutrition page: a calm Daily Hub home + a Hero Card
// Slider of surface cards, each opening the FULL existing (data-wired) surface in
// a bottom sheet. Hybrid of two approved demos:
//   · NutritionDemo2 "Daily Hub" — one calm screen, ONE primary action, dusk-header
//     bottom-sheet spokes  (the organizing model)
//   · NutritionDemo1 "Hero Card Slider" — scroll-snap card slider, next card peeks
//     (the spine for moving between surfaces)
//
// This is PRODUCTION code wired to real Base44 entities. The home summary reads
// REAL MealLog + HydrationLog for today; the slider cards open the REAL surface
// components (NutritionTodayTab, NutritionPlanTab, …) — never mock data.
//
// Orchestration preserved from src/pages/Nutrition.jsx:
//   · auth.me() → Promise.all(UserProfile / NutritionProfile / DailyCheckins today)
//   · ?tab=… deep-link → opens the matching surface sheet
//   · onProfileUpdated → loadNutritionProfile() refreshes the shell
//   · selectedDate / dayKey for the Today surface (date-fns)
//   · HydrationLog / MealLog .subscribe() → refresh the home summary
//
// Brand: Editorial cream/plum (Ephesis + Cormorant), Lucide/SVG, NO EMOJI, gentle
// glances not scoreboards, Jess present, phone-first.
import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek } from "date-fns";
import { toast } from "sonner";
import {
  UtensilsCrossed, Target, BookOpen, CalendarDays,
  ShoppingBasket, TrendingUp, Sparkles, ChevronLeft, ChevronRight, Leaf, Plus, Star,
  Search, Clock, Camera, Mic, ScanLine, Check, X,
} from "lucide-react";
import {
  T, UI, SERIF, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import { getMealSummary, inferMealTypeFromTime } from "@/utils/nutritionAiAnalysis";
import { dayNutrition } from "@/utils/foodModel";
import { mealEstimate } from "@/utils/cofid";
import { deriveTargets } from "@/utils/nutritionTargets";
import { nutritionCycleMemory } from "@/utils/nutritionSummary";
import { getCurrentCyclePhase, phaseLabel } from "@/utils/cyclePhase";
import { withTimeout } from "@/utils/safeEntity";
import { HubSheet, SoftBar, SurfaceCard, Ring } from "@/components/nutrition/hub/HubShell";
import NutritionHubSheet from "@/components/nutrition/NutritionHubSheet";
import JumpToButton from "@/components/layout/JumpToButton";

import NutritionTodayTab from "../components/nutrition/NutritionTodayTab";
import NutritionPlanTab from "../components/nutrition/NutritionPlanTab";
import UnifiedProgressTab from "../components/nutrition/UnifiedProgressTab";
import UnifiedInsightsTab from "../components/nutrition/UnifiedInsightsTab";
import UnifiedRecipesTab from "../components/nutrition/UnifiedRecipesTab";
// RecipeGeneratorTab + AIRecipeGenerator remain in the repo as unrouted fallbacks;
// the live "recipes" surface is now the UnifiedRecipesTab (rebuilt per Master Plan §7).
// MealPlanGeneratorTab + NutritionPlanTab remain in the repo as unrouted fallbacks;
// the live "mealgen" surface is now the UnifiedMealPlanTab (manual + AI = one plan).
import UnifiedMealPlanTab from "../components/nutrition/UnifiedMealPlanTab";
// ShoppingListTab + NutritionProgressTab + NutritionInsightsTab remain in the repo as
// unrouted fallbacks; the live shopping/progress/insights surfaces are now the Unified* tabs.
import UnifiedShoppingTab from "../components/nutrition/UnifiedShoppingTab";
import UnifiedLogger from "../components/nutrition/UnifiedLogger";

const COL = 430;     // phone column (matches NutritionDemo1 — bigger cards)
const CARD_W = 365;  // ~85vw — Demo-1-large; next card still peeks at the right edge
const GAP = 14;

// Surface registry — id + meta drives the slider cards AND the sheets. The id
// matches the ?tab= deep-link target so links land on the right surface.
const SURFACES = [
  { id: "log",      label: "Log",      eyebrow: "Add a meal in seconds",   sheetTitle: "log a meal",   accent: T.crimson, Icon: UtensilsCrossed },
  { id: "today",    label: "Today",    eyebrow: "Your plate so far",       sheetTitle: "today",        accent: T.gold, Icon: UtensilsCrossed },
  { id: "plan",     label: "My Plan",  eyebrow: "A guide, never a cap",     sheetTitle: "my plan",      accent: T.gold, Icon: Target },
  { id: "recipes",  label: "Recipes",  eyebrow: "Cook what you have in",    sheetTitle: "recipes",      accent: T.sage, Icon: BookOpen },
  { id: "mealgen",  label: "AI Plan",  eyebrow: "A gentle week",            sheetTitle: "the week",     accent: T.sage, Icon: CalendarDays },
  { id: "shopping", label: "Shop",     eyebrow: "Sorted by aisle",          sheetTitle: "the list",     accent: T.sage, Icon: ShoppingBasket },
  { id: "progress", label: "Progress", eyebrow: "Patterns, not scores",     sheetTitle: "progress",     accent: T.gold, Icon: TrendingUp },
  { id: "insights", label: "Insights", eyebrow: "Nourishment for your stage", sheetTitle: "insights",   accent: T.sage, Icon: Sparkles },
];

// ?tab= → surface id (same map as Nutrition.jsx; hydration folds into today)
const TAB_MAP = {
  hydration: "today", today: "today", plan: "plan", recipes: "recipes",
  mealgen: "mealgen", shopping: "shopping", progress: "progress", insights: "insights",
};

// Gentle stage-aware line from Jess — never clinical, never a target.
function jessLine(profile) {
  const stage = profile?.life_stage || profile?.stage;
  const byStage = {
    perimenopause: "Steady protein and iron this week can soften the dips — no rules, just a gentle anchor.",
    menopause: "Calcium and a little extra protein go a long way right now. Small, warm meals over big ones.",
    pregnant: "Little and often tends to sit best. Whatever stays down today is enough.",
    postpartum: "Hydration and easy-to-reach food first — feeding yourself counts as much as anything.",
    ttc: "Colour on the plate and good fats are quietly doing a lot for you this season.",
  };
  if (stage && byStage[stage]) return byStage[stage];
  return "However today went, the next plate is a fresh start. One nourishing thing is plenty.";
}

// Stage-aware micronutrient NUDGES (qualitative, never targets/numbers). These are
// the foods-and-why the stage quietly benefits from — drawn from the real life_stage.
function stageNudges(profile) {
  const stage = profile?.life_stage || profile?.stage;
  const byStage = {
    perimenopause: [
      { key: "iron",    label: "Iron",    foods: "lentils · leafy greens · red meat", why: "heavier cycles can dip your stores" },
      { key: "protein", label: "Protein", foods: "eggs · fish · beans",                why: "steadies energy through the swings" },
      { key: "calcium", label: "Calcium", foods: "yoghurt · tinned sardines · tofu",   why: "bones need a little more from here" },
    ],
    menopause: [
      { key: "calcium", label: "Calcium", foods: "dairy · fortified plant milk · greens", why: "protective as oestrogen settles" },
      { key: "protein", label: "Protein", foods: "fish · eggs · pulses",                  why: "helps hold onto muscle" },
      { key: "fibre",   label: "Fibre",   foods: "oats · beans · wholegrains",            why: "kind to digestion and heart" },
    ],
    pregnant: [
      { key: "iron",   label: "Iron",   foods: "red meat · lentils · spinach", why: "your blood volume is rising" },
      { key: "calcium",label: "Calcium",foods: "milk · yoghurt · cheese",      why: "building baby's bones" },
      { key: "fibre",  label: "Fibre",  foods: "fruit · veg · wholegrains",    why: "eases the slower digestion" },
    ],
    postpartum: [
      { key: "iron",    label: "Iron",    foods: "red meat · lentils · greens",  why: "replenishing after birth" },
      { key: "protein", label: "Protein", foods: "eggs · chicken · beans",       why: "for recovery and feeding" },
      { key: "fibre",   label: "Fibre",   foods: "oats · fruit · wholegrains",   why: "gentle on a healing gut" },
    ],
    ttc: [
      { key: "iron",   label: "Iron",        foods: "lentils · greens · red meat", why: "supports a regular cycle" },
      { key: "fats",   label: "Healthy fats",foods: "avocado · olive oil · oily fish", why: "quietly doing a lot this season" },
      { key: "fibre",  label: "Fibre",       foods: "wholegrains · beans · fruit",  why: "helps hormones clear well" },
    ],
  };
  return byStage[stage] || [
    { key: "protein", label: "Protein", foods: "eggs · fish · beans",        why: "keeps energy steady" },
    { key: "fibre",   label: "Fibre",   foods: "oats · veg · wholegrains",   why: "kind to digestion" },
    { key: "iron",    label: "Iron",    foods: "leafy greens · lentils",     why: "supports energy" },
  ];
}

// Human label for a life stage (for the Plan / Insights framing line).
function stageLabel(profile) {
  const stage = profile?.life_stage || profile?.stage;
  const map = {
    teen: "Teen", reproductive: "Reproductive years", "pre-ttc": "Preparing to conceive",
    ttc: "Trying to conceive", pregnant: "Pregnancy", "pregnant-t1": "Pregnancy · first trimester",
    "pregnant-t2": "Pregnancy · second trimester", "pregnant-t3": "Pregnancy · third trimester",
    postpartum: "Postpartum", perimenopause: "Perimenopause", menopause: "Menopause",
    "post-menopause": "Post-menopause",
  };
  return (stage && map[stage]) || "Your stage";
}

// Time-of-day greeting (gentle, no emoji).
function greetingForNow(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// The user's REAL first name, or null when we only have an account handle. We never
// render a raw username like "ojihalliburton57": a candidate is rejected if it has
// digits, is an overly-long single token, or just echoes the email local-part. null →
// the greeting shows with no name ("Good afternoon · Reproductive years").
function firstNameOf(user) {
  const full = (user?.full_name || "").trim();
  if (!full) return null;
  const first = full.split(/\s+/)[0];
  const singleToken = full.split(/\s+/).length === 1;
  const emailLocal = ((user?.email || "").split("@")[0] || "").toLowerCase().replace(/[._-]+/g, "");
  const looksHandle =
    /\d/.test(first) ||                                   // contains digits
    first.length > 14 ||                                  // implausibly long for a first name
    (singleToken && first.toLowerCase().replace(/[._-]+/g, "") === emailLocal); // == the email handle
  if (looksHandle) return null;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

// Day-of-cycle (1-based) from the profile, matching NutritionTodayTab's logic.
// Returns null when there's no last-period date to honour "missing → no cycle".
function dayOfCycleOf(profile) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const daysSince = Math.floor((Date.now() - new Date(profile.last_period_start_date).getTime()) / 86400000);
  if (!Number.isFinite(daysSince) || daysSince < 0) return null;
  return (daysSince % cycleLen) + 1;
}

// Today's macro row (protein / fibre / iron) now reads through the ONE source of
// truth — dayNutrition(rawDayMeals) from the nutrition spine — so the header compounds
// the same real numbers logging persists (macros AND micros). Missing → 0, never invented.
// floor:true so the macro row MOVES when you log — a plainly-logged meal still gets a
// CoFID estimate (calories/macros are fine to estimate; the women's-layer micro note
// keeps the honesty where it matters).
function macroSums(rawDayMeals) {
  const n = dayNutrition(rawDayMeals, { floor: true });
  return { protein: n.protein_g, fibre: n.fiber_g, iron: n.iron_mg };
}

// Tonight's suggested dinner — from this week's plan (today's row), else a saved
// recipe, else a gentle stage-appropriate idea. Always returns { name, why } or null.
const DINNER_BY_STAGE = {
  perimenopause: { name: "Salmon with greens and lentils", why: "iron and omega-3 for where you are in your cycle" },
  menopause: { name: "Tofu and broccoli stir-fry", why: "calcium and protein, gentle on the evening" },
  pregnant: { name: "Lentil and spinach dahl", why: "iron and folate, easy to keep down" },
  postpartum: { name: "Chicken and vegetable soup", why: "warm, iron-rich and one-handed" },
  ttc: { name: "Salmon traybake with roast veg", why: "good fats and colour for the season" },
};
function suggestedDinner(mealPlan, savedRecipes, profile) {
  // 1) this week's plan — today's dinner cell (plan_days uses 0=Mon … 6=Sun)
  const planDays = (mealPlan?.plan_days || []).filter(Boolean);
  if (planDays.length > 0) {
    const todayIdx = (new Date().getDay() + 6) % 7; // JS Sun=0 → Mon=0 index
    const row = planDays.find((d) => d?.day === todayIdx);
    const cell = row?.dinner;
    const name = Array.isArray(cell) ? cell[0] : (typeof cell === "string" ? cell : cell?.name);
    if (name) return { name, why: "from your plan for tonight" };
  }
  // legacy plan shape
  if (Array.isArray(mealPlan?.days) && mealPlan.days.length > 0) {
    const todayIdx = (new Date().getDay() + 6) % 7;
    const d = mealPlan.days[todayIdx] || mealPlan.days[0];
    const cell = d?.meals?.dinner;
    const name = Array.isArray(cell) ? cell[0] : (typeof cell === "string" ? cell : cell?.name);
    if (name) return { name, why: "from your plan for tonight" };
  }
  // 2) a saved recipe (highest-rated first — already sorted)
  const saved = (savedRecipes || []).filter(Boolean);
  if (saved.length > 0 && (saved[0].title || saved[0].name)) {
    return { name: saved[0].title || saved[0].name, why: "one of your saved recipes" };
  }
  // 3) a gentle stage idea — honest fallback, never a mock figure
  const stage = profile?.life_stage || profile?.stage;
  return DINNER_BY_STAGE[stage] || { name: "Something warm with greens and protein", why: "a gentle, balanced plate for tonight" };
}

export default function NutritionHub() {
  useEditorialFonts();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openSheet, setOpenSheet] = useState(null);   // surface id or null
  const [openLogger, setOpenLogger] = useState(false); // the UnifiedLogger sheet
  const [hubMenuOpen, setHubMenuOpen] = useState(false); // the "Jump to" switcher
  const [active, setActive] = useState(0);            // slider index

  // Home summary (real MealLog + HydrationLog for the selected day)
  const [summary, setSummary] = useState({ kcal: 0, meals: 0, hydrationMl: 0, lastMeal: null });
  // the selected day's logged meals (real, for the Today card's inline list)
  const [dayMeals, setDayMeals] = useState([]);
  // the selected day's RAW MealLog rows (with ai_analysis) — fed to the nutrition
  // spine (dayNutrition) so the header macro row reads the one source of truth.
  const [dayMealRows, setDayMealRows] = useState([]);
  // distinct recent meals across history (real, for the "one tap to re-add" chips)
  const [recents, setRecents] = useState([]);
  const [weekKcal, setWeekKcal] = useState([]);   // last 7 days' energy (real) for the Progress trend
  // a saved meal plan + shopping list + saved recipes for the richer cards (real)
  const [mealPlan, setMealPlan] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  // latest BodyMetrics row (real, guarded) — feeds the DERIVED nutrition targets
  const [bodyMetrics, setBodyMetrics] = useState(null);

  const dayKey = format(selectedDate, "yyyy-MM-dd");
  const isToday = dayKey === format(new Date(), "yyyy-MM-dd");
  const trackRef = useRef(null);
  const last = SURFACES.length - 1;

  // ── deep-link: parse ?tab= on mount and open the matching surface ──────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && TAB_MAP[tabParam]) {
      const id = TAB_MAP[tabParam];
      setOpenSheet(id);
      const idx = SURFACES.findIndex((s) => s.id === id);
      if (idx >= 0) setActive(idx);
    }
  }, []);

  // ── load the home summary for the selected day (real entities, guarded) ────
  const loadSummary = useCallback(async (u, key) => {
    if (!u) return;
    const [meals, hydration] = await Promise.all([
      base44.entities.MealLog.filter({ user_id: u.id, day_key: key }).catch(() => []),
      base44.entities.HydrationLog.filter({ user_id: u.id, day_key: key }).catch(() => []),
    ]);
    const safeMeals = (meals || []).filter(Boolean);
    // ENERGY via the spine WITH the CoFID floor, so the ring moves the moment you log —
    // a recents/text meal with no macros still gets a sensible estimated kcal.
    const kcal = dayNutrition(safeMeals, { floor: true }).kcal;
    const hydrationMl = (hydration || []).filter(Boolean).reduce((s, l) => s + (l.amount_ml || 0), 0);
    const ordered = [...safeMeals].sort((a, b) => (a.logged_at || "").localeCompare(b.logged_at || ""));
    const lastMeal = [...ordered].reverse().find((m) => m.raw_text)?.raw_text || null;
    setSummary({ kcal: Math.round(kcal), meals: safeMeals.length, hydrationMl, lastMeal });
    // keep the raw rows (with ai_analysis) for the nutrition spine's macro/micro sums
    setDayMealRows(ordered);
    // the day's logged meals as a calm inline list (slot · title · kcal) — per-meal kcal
    // uses the real value, else the CoFID estimate so each line shows a number too.
    setDayMeals(
      ordered
        .filter((m) => m.raw_text)
        .map((m) => ({
          id: m.id,
          slot: m.meal_type || "meal",
          title: m.raw_text,
          kcal: dayNutrition([m], { floor: true }).kcal,
        }))
    );
  }, []);

  // recent distinct meals (real) — deduped by raw_text, newest first, ~6 for chips
  const loadRecents = useCallback(async (u) => {
    if (!u) return;
    const rows = await base44.entities.MealLog
      .filter({ user_id: u.id }, "-created_date", 12)
      .catch(() => []);
    const seen = new Set();
    const distinct = [];
    for (const m of (rows || []).filter(Boolean)) {
      const text = (m.raw_text || "").trim();
      const key = text.toLowerCase();
      if (!text || seen.has(key)) continue;
      seen.add(key);
      distinct.push({ id: m.id, name: text, kcal: getMealSummary(m).summary?.calories || 0 });
      if (distinct.length >= 6) break;
    }
    setRecents(distinct);
  }, []);

  // last 7 days' energy (real, guarded) — feeds the Progress card's weekly trend so it
  // shows a week of rhythm, not just today. Uses the same energy spine (CoFID floor).
  const loadWeek = useCallback(async (u) => {
    if (!u) return;
    const rows = await base44.entities.MealLog.filter({ user_id: u.id }, "-day_key", 250).catch(() => []);
    const safe = (rows || []).filter(Boolean);
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      const key = format(dt, "yyyy-MM-dd");
      const meals = safe.filter((m) => m.day_key === key);
      const kcal = meals.length ? Math.round(dayNutrition(meals, { floor: true }).kcal) : 0;
      out.push({ label: DOW_SHORT[(dt.getDay() + 6) % 7], key, kcal });
    }
    setWeekKcal(out);
  }, []);

  // re-log a recent meal for real (guarded write + refresh), one tap from the Log card.
  // The hub's `recents` chips carry only { id, name } — so we re-create a MealLog with
  // the same raw_text, day_key = today, an inferred meal_type, then refresh the summary.
  const reLogRecent = useCallback(async (name, mealType) => {
    const text = (name || "").trim();
    if (!user || !text) return;
    const todayKey = format(new Date(), "yyyy-MM-dd");
    // estimate energy + macros from the food name (CoFID match, else a per-slot default)
    // so the meal ALWAYS carries numbers — the totals move immediately and persist, never
    // a zero-kcal row even for a food not in the CoFID table.
    const est = mealEstimate(text, mealType || inferMealTypeFromTime());
    const ai_analysis = est ? {
      summary: { calories: est.kcal, protein_g: est.protein_g, carbs_g: est.carbs_g, fat_g: est.fat_g, fiber_g: est.fiber_g, iron_mg: est.iron_mg, folate_ug: est.folate_ug, calcium_mg: est.calcium_mg },
      estimated: true,
    } : undefined;
    // optimistic: move the header now, reconcile after the write
    if (est) setSummary((s) => ({ ...s, kcal: Math.round((s.kcal || 0) + est.kcal), meals: (s.meals || 0) + 1 }));
    try {
      await withTimeout(
        base44.entities.MealLog.create({
          user_id: user.id,
          day_key: todayKey,
          logged_at: new Date().toISOString(),
          meal_type: mealType || inferMealTypeFromTime(),
          method: "text",
          raw_text: text,
          ai_analysis,
        }),
        6000, "save"
      );
      toast.success(est ? `Added — about ${est.kcal} kcal` : "Added to today");
      loadSummary(user, todayKey);
      loadRecents(user);
    } catch (err) {
      console.error("re-log recent failed:", err);
      toast.error("Couldn’t add that just now — try again.");
      loadSummary(user, todayKey); // roll back the optimistic bump to the true total
    }
  }, [user, loadSummary, loadRecents]);

  // inline water quick-add — one direct tap on the card logs it (no sheet). Optimistic.
  const addWater = useCallback(async (ml) => {
    if (!user || !ml) return;
    const todayKey = format(new Date(), "yyyy-MM-dd");
    setSummary((s) => ({ ...s, hydrationMl: (s.hydrationMl || 0) + ml })); // optimistic — moves now
    try {
      await withTimeout(base44.entities.HydrationLog.create({
        user_id: user.id, day_key: todayKey, amount_ml: ml, logged_at: new Date().toISOString(), source: "quick",
      }), 6000, "save");
      toast.success(`+${ml} ml water`);
      loadSummary(user, todayKey);
    } catch (e) {
      console.error("add water failed:", e);
      toast.error("Couldn’t add water — try again.");
      loadSummary(user, todayKey);
    }
  }, [user, loadSummary]);

  // remove a logged meal INLINE from the Today card — optimistic energy/meals drop +
  // guarded MealLog.delete, then reconcile from the server. Lets you undo a mislog in
  // one tap, right on the card, with the totals (ring + energy) easing down immediately.
  const removeMeal = useCallback(async (meal) => {
    if (!user || !meal?.id) return;
    const key = dayKey;
    // optimistic: drop the row + ease the totals down NOW (the ring/energy move on tap)
    setDayMeals((list) => list.filter((m) => m.id !== meal.id));
    setDayMealRows((rows) => rows.filter((r) => r.id !== meal.id));
    setSummary((s) => ({
      ...s,
      kcal: Math.max(0, Math.round((s.kcal || 0) - (meal.kcal || 0))),
      meals: Math.max(0, (s.meals || 0) - 1),
    }));
    try {
      await withTimeout(base44.entities.MealLog.delete(meal.id), 6000, "remove");
      toast.success("Removed from today");
      loadSummary(user, key);   // reconcile to the true totals (also re-derives macros)
      loadRecents(user);
    } catch (e) {
      console.error("remove meal failed:", e);
      toast.error("Couldn’t remove that — try again.");
      loadSummary(user, key);   // restore the real row + totals on failure
    }
  }, [user, dayKey, loadSummary, loadRecents]);

  // tick / untick a shopping item INLINE on the card (direct, no sheet). Optimistic +
  // guarded; reconciles from the server on success/failure.
  const toggleShopItem = useCallback(async (item) => {
    if (!user || !item?.id) return;
    const next = !item.is_checked;
    setShopItems((list) => list.map((r) => (r.id === item.id ? { ...r, is_checked: next } : r)));
    try {
      await withTimeout(base44.entities.ShoppingList.update(item.id, { is_checked: next }), 6000, "save");
    } catch (e) {
      console.error("toggle shop item failed:", e);
      setShopItems((list) => list.map((r) => (r.id === item.id ? { ...r, is_checked: !next } : r))); // rollback
      toast.error("Couldn’t update that — try again.");
    }
  }, [user]);

  // a saved meal plan + its shopping list + saved recipes for the richer cards (real)
  const loadKitchen = useCallback(async (u) => {
    if (!u) return;
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const [plans, shopping, recipes] = await Promise.all([
      base44.entities.MealPlans.filter({ user_id: u.id, week_start: weekStart }).catch(() => []),
      base44.entities.ShoppingList.filter({ user_id: u.id, week_start: weekStart }).catch(() => []),
      base44.entities.MealTemplates.filter({ user_id: u.id }, "-created_date", 50).catch(() => []),
    ]);
    setMealPlan((plans || []).filter(Boolean)[0] || null);
    setShopItems((shopping || []).filter(Boolean));
    // SAVED RECIPES (real): only MealTemplates rows the UnifiedRecipesTab persists
    // (category "recipe" + recipe_json). Title comes from the parsed recipe, rated
    // ones first. Falls back to the row title so it never shows blank.
    const savedRecipeRows = (recipes || [])
      .filter((r) => r && r.category === "recipe" && r.recipe_json)
      .map((r) => {
        let title = r.title;
        try { title = JSON.parse(r.recipe_json)?.recipe_name || r.title; } catch { /* keep row title */ }
        return { id: r.id, title, rating: r.rating || 0 };
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setSavedRecipes(savedRecipeRows);
  }, []);

  const loadNutritionProfile = useCallback(async () => {
    if (!user) return;
    const profiles = await base44.entities.NutritionProfile.filter({ user_id: user.id }).catch(() => []);
    setNutritionProfile(profiles[0] || null);
  }, [user]);

  // ── init: auth + profiles + today's check-in + subscriptions ───────────────
  useEffect(() => {
    let unsubHydration;
    let unsubMeals;
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [profiles, nutProfiles, checkins, metrics] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.NutritionProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id, date: format(new Date(), "yyyy-MM-dd") }).catch(() => []),
          // latest BodyMetrics row (real, guarded) — for the derived energy/protein guide
          base44.entities.BodyMetrics.filter({ user_id: u.id }, "-day_key", 1).catch(() => []),
        ]);
        if (profiles[0]) setProfile(profiles[0]);
        if (nutProfiles[0]) setNutritionProfile(nutProfiles[0]);
        if (checkins[0]) setCheckin(checkins[0]);
        if ((metrics || []).filter(Boolean)[0]) setBodyMetrics((metrics || []).filter(Boolean)[0]);
        // richer-card data (real, guarded — never blocks the page)
        loadRecents(u);
        loadWeek(u);
        loadKitchen(u);
        // a new log anywhere → nudge selectedDate so the summary effect re-runs
        try { unsubHydration = base44.entities.HydrationLog.subscribe(() => setSelectedDate((d) => new Date(d))); } catch { /* no-op */ }
        try { unsubMeals = base44.entities.MealLog.subscribe(() => { setSelectedDate((d) => new Date(d)); loadRecents(u); }); } catch { /* no-op */ }
      } catch (err) {
        console.error("NutritionHub init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      unsubHydration?.();
      unsubMeals?.();
    };
  }, []);

  // refresh the home summary whenever the user or the day changes (subscriptions
  // bump selectedDate, so this also catches a new meal/hydration log)
  useEffect(() => {
    if (user) { loadSummary(user, dayKey); loadWeek(user); }
  }, [user, dayKey, loadSummary, loadWeek]);

  const changeDay = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d);
  };

  // ── slider: keep active index in sync with scroll-snap swipes ──────────────
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let t;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const i = Math.round(el.scrollLeft / (CARD_W + GAP));
        setActive(Math.max(0, Math.min(last, i)));
      }, 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [last, loading]);

  const goTo = (i) => {
    const idx = Math.max(0, Math.min(last, i));
    setActive(idx);
    trackRef.current?.scrollTo({ left: idx * (CARD_W + GAP), behavior: "smooth" });
  };

  // ── DERIVED nutrition targets (real body + stage + goal), replacing the flat /2000.
  // deriveTargets is pure + defensive: missing body data → a stage-based default band,
  // and any explicit user-set value always wins. Gentle ranges/guides, never a cap.
  const targets = deriveTargets({ profile, nutritionProfile, bodyMetrics });
  const calorieTarget = targets.energy_kcal;
  const hydrationTarget = nutritionProfile?.hydration_target_ml || 2000;
  const kcalLeft = Math.max(0, calorieTarget - summary.kcal);

  // ── header values (real, guarded) ───────────────────────────────────────────
  const greeting = greetingForNow();
  const firstName = firstNameOf(user);
  const cyclePhase = getCurrentCyclePhase(profile);          // null when no cycle data
  const cyclePhaseLabel = phaseLabel(cyclePhase);             // null when no phase
  const cycleDay = dayOfCycleOf(profile);                     // null when no cycle data
  const sums = macroSums(dayMealRows);                        // { protein, fibre, iron } via dayNutrition
  // gentle macro-row guides now come from the DERIVED target set (stage + body + override)
  const proteinTarget = targets.protein_g;
  const fibreTarget = targets.fibre_g;
  const ironTarget = Math.round(targets.iron_mg);             // gentle, not a hard cap
  const dinner = suggestedDinner(mealPlan, savedRecipes, profile);

  // ── the real surface for the open sheet ────────────────────────────────────
  const renderSurface = (id) => {
    if (!user) return null;
    switch (id) {
      case "today":    return <NutritionTodayTab user={user} profile={profile} nutritionProfile={nutritionProfile} dayKey={dayKey} checkin={checkin} />;
      case "plan":     return <NutritionPlanTab user={user} nutritionProfile={nutritionProfile} />;
      case "recipes":  return <UnifiedRecipesTab user={user} profile={profile} nutritionProfile={nutritionProfile} />;
      case "mealgen":  return <UnifiedMealPlanTab user={user} profile={profile} nutritionProfile={nutritionProfile} targets={targets} />;
      case "shopping": return <UnifiedShoppingTab user={user} profile={profile} />;
      case "progress": return <UnifiedProgressTab user={user} profile={profile} nutritionProfile={nutritionProfile} onProfileUpdated={loadNutritionProfile} />;
      case "insights": return <UnifiedInsightsTab user={user} profile={profile} nutritionProfile={nutritionProfile} targets={targets} />;
      default:         return null;
    }
  };

  // open a surface by id — the "log" surface has no entity sheet; it opens the real
  // UnifiedLogger instead. Everything else opens its full surface in the HubSheet.
  const openSurface = (id) => {
    if (id === "log") { setOpenLogger(true); return; }
    setOpenSheet(id);
  };

  // openSheet never holds "log" (it routes to the logger), so this only ever
  // resolves to a real entity surface.
  const openMeta = openSheet ? SURFACES.find((s) => s.id === openSheet) : null;

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <InkFilter />
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} />
      </div>
    );
  }

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 120 }}>
      <InkFilter />
      <div style={{ maxWidth: COL, margin: "0 auto", position: "relative" }}>

        {/* ── DAILY HUB header — Demo2's full summary, wired to real data ───── */}
        <header style={{ padding: "20px 18px 4px" }}>
          {/* controls row — its OWN full-width row so nothing steals the greeting's width:
              Jump-to pill left, day stepper right, room to breathe. */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
            <JumpToButton onClick={() => setHubMenuOpen(true)} />
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "5px 6px",
            }}>
              <button onClick={() => changeDay(-1)} aria-label="Previous day"
                style={{ width: 26, height: 26, borderRadius: 9, border: "none", background: "transparent", color: T.muted, cursor: "pointer", display: "grid", placeItems: "center" }}>
                <ChevronLeft size={16} />
              </button>
              <div style={{ textAlign: "center", minWidth: 74 }}>
                <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.ink }}>{isToday ? "Today" : format(selectedDate, "EEE")}</div>
                <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted }}>{format(selectedDate, "d MMM")}</div>
              </div>
              <button onClick={() => changeDay(1)} disabled={isToday} aria-label="Next day"
                style={{ width: 26, height: 26, borderRadius: 9, border: "none", background: "transparent", color: T.muted, cursor: isToday ? "default" : "pointer", opacity: isToday ? 0.3 : 1, display: "grid", placeItems: "center" }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* greeting — its OWN full-width line; reads cleanly, no cramped column.
              No raw username is ever shown (firstName is null for handle-like names). */}
          <Eyebrow mb={4}>
            {firstName ? `${greeting}, ${firstName}` : greeting}
            {` · ${stageLabel(profile)}`}
            {cyclePhaseLabel ? ` · ${cyclePhaseLabel}` : ""}
            {cyclePhaseLabel && cycleDay ? ` · Day ${cycleDay}` : ""}
          </Eyebrow>

          {/* 2 · the Ephesis script heading */}
          <Script size={40} carve>your plate today</Script>

          {/* 3 · big energy ring — real summary.kcal of calorieTarget, room for more */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 12 }}>
            <div style={{ position: "relative", width: 184, height: 184 }}>
              <Ring value={summary.kcal} guide={calorieTarget} size={184} label="" />
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
                <div>
                  <Script size={44} carve>today</Script>
                  <div style={{ fontFamily: UI, fontSize: 10, letterSpacing: 0.8, color: T.muted, marginTop: -4 }}>
                    {summary.kcal} of {calorieTarget} kcal
                  </div>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.gold, marginTop: 1 }}>
                    room for {kcalLeft} more
                  </div>
                </div>
              </div>
            </div>

            {/* gentle basis line — only when the energy guide is DERIVED from real body data */}
            {targets.derived && (
              <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.4, color: T.muted, textAlign: "center", marginTop: 8, maxWidth: 280 }}>
                {targets.basis} — a guide, never a cap
              </div>
            )}

            {/* 4 · macro row — protein / fibre / iron, real sums, SoftBar beneath */}
            <div style={{ display: "flex", gap: 18, marginTop: 14, width: "100%", justifyContent: "center" }}>
              {[
                { label: "Protein", had: Math.round(sums.protein), guide: proteinTarget, unit: "g" },
                { label: "Fibre", had: Math.round(sums.fibre), guide: fibreTarget, unit: "g" },
                { label: "Iron", had: Math.round(sums.iron), guide: ironTarget, unit: "mg" },
              ].map((m) => (
                <div key={m.label} style={{ textAlign: "center", minWidth: 78 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, lineHeight: 1 }}>
                    {m.had}<span style={{ fontSize: 11, color: T.muted }}>/{m.guide}{m.unit}</span>
                  </div>
                  <div style={{ fontFamily: UI, fontSize: 9, letterSpacing: 0.8, color: T.muted, textTransform: "uppercase", margin: "3px 0 5px" }}>{m.label}</div>
                  <SoftBar value={m.had} guide={m.guide} color={T.sage} />
                </div>
              ))}
            </div>
          </div>

          {/* 5 · Jess card — warm, cycle-aware (dusk surface, leaf chip + JESS) */}
          <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "15px 16px", marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}>
                <Leaf size={13} color={T.dusk} />
              </span>
              <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess</span>
            </div>
            <Hand size={18} color={T.paper}>{jessLine(profile)}</Hand>
          </div>

          {/* 6 · red LOG A MEAL button — the prominent logger entry */}
          <button onClick={() => setOpenLogger(true)} style={{
            width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: T.crimson, color: T.paper, border: "none", borderRadius: 16, padding: "17px 18px",
            fontFamily: UI, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
            marginTop: 14, boxShadow: "0 6px 18px rgba(188,46,39,0.25)",
          }}>
            <UtensilsCrossed size={19} /> Log a meal
          </button>

          {/* 7 · suggested · dinner — DIRECT-ON-CARD: the primary tap (the whole row) LOGS
              it for tonight, no sheet. A small "see plan" link is the secondary path. */}
          {dinner ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%",
              background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14,
              padding: "13px 15px", marginTop: 10,
            }}>
              <button onClick={() => reLogRecent(dinner.name, "dinner")} aria-label="Log tonight's dinner"
                style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: T.ink, color: T.paper, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Check size={18} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontFamily: UI, fontSize: 9, letterSpacing: 1, color: T.muted, textTransform: "uppercase", display: "block" }}>Suggested · dinner · tap to log</span>
                  <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, display: "block", lineHeight: 1.15 }}>{dinner.name}</span>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{dinner.why}</span>
                </span>
              </button>
              <button onClick={() => openSurface(mealPlan?.plan_days?.length || mealPlan?.days?.length ? "mealgen" : "recipes")} aria-label="See in plan"
                style={{ flexShrink: 0, fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.muted, background: "transparent", border: "none", cursor: "pointer", padding: "4px 2px" }}>
                see plan
              </button>
            </div>
          ) : null}
        </header>

        {/* ── THE SPINE — Hero Card Slider of surfaces ───────────────────── */}
        <div style={{ marginTop: 10 }}>
          <div style={{ padding: "0 18px 10px" }}>
            <Hand size={15} color={T.muted}>Swipe through your kitchen — each card opens the full thing.</Hand>
          </div>

          {/* segmented label rail */}
          <div style={{ display: "flex", gap: 7, overflowX: "auto", padding: "0 18px 12px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {SURFACES.map((s, i) => (
              <button key={s.id} onClick={() => goTo(i)} style={{
                flex: "none", background: i === active ? T.ink : "transparent", color: i === active ? T.paper : T.muted,
                border: `1px solid ${i === active ? T.ink : T.paperDeep}`, borderRadius: 999, padding: "5px 12px",
                fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
              }}>{s.label}</button>
            ))}
          </div>

          {/* the swipeable track — scroll-snap, next card peeks */}
          <div ref={trackRef} className="nutrihub-track" style={{
            display: "flex", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory",
            padding: "0 18px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
          }}>
            <style>{`.nutrihub-track::-webkit-scrollbar{display:none}`}</style>

            {SURFACES.map((s) => (
              <SurfaceCard
                key={s.id}
                cardW={CARD_W}
                label={s.label}
                blurb={s.id === "today" && !isToday ? format(selectedDate, "d MMM") : null}
                accent={s.accent}
                onOpen={() => openSurface(s.id)}
                primaryLabel={s.id === "log" ? "Open logger" : `Open ${s.label}`}
                primaryIcon={s.Icon}
              >
                <CardSummary
                  surface={s}
                  user={user}
                  summary={summary}
                  dayMeals={dayMeals}
                  recents={recents}
                  weekKcal={weekKcal}
                  mealPlan={mealPlan}
                  shopItems={shopItems}
                  savedRecipes={savedRecipes}
                  nutritionProfile={nutritionProfile}
                  profile={profile}
                  targets={targets}
                  calorieTarget={calorieTarget}
                  hydrationTarget={hydrationTarget}
                  kcalLeft={kcalLeft}
                  jess={jessLine(profile)}
                  onOpen={setOpenSheet}
                  onLog={() => setOpenLogger(true)}
                  onReLog={reLogRecent}
                  onWater={addWater}
                  onRemove={removeMeal}
                  onToggleShop={toggleShopItem}
                  isToday={isToday}
                />
              </SurfaceCard>
            ))}

            {/* trailing spacer so the last card can center-snap */}
            <div style={{ flex: `0 0 ${Math.max(0, COL - CARD_W - 36)}px` }} aria-hidden />
          </div>

          {/* prev / dots / next */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "14px 18px 0" }}>
            <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous surface" style={navBtn(active === 0)}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: "flex", gap: 7 }}>
              {SURFACES.map((s, i) => (
                <button key={s.id} onClick={() => goTo(i)} aria-label={s.label} style={{
                  width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0,
                  background: i === active ? T.crimson : T.paperDeep, cursor: "pointer", transition: "width .2s",
                }} />
              ))}
            </div>
            <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next surface" style={navBtn(active === last)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* footer voice */}
        <footer style={{ textAlign: "center", padding: "30px 24px 0" }}>
          <Rule w={40} c={T.paperDeep} mb={12} />
          <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
            Nourishment is a relationship, not a target.
          </div>
          <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 8, letterSpacing: 0.3 }}>
            Gentle guidance for your stage — not medical advice.
          </div>
        </footer>

        {/* ── the universal "Jump to" switcher ───────────────────────────── */}
        <NutritionHubSheet
          open={hubMenuOpen}
          onClose={() => setHubMenuOpen(false)}
          onSelect={(id) => openSurface(id)}
        />

        {/* ── the bottom sheet — the FULL real surface ───────────────────── */}
        {openMeta && (
          <HubSheet title={openMeta.sheetTitle} eyebrow={openMeta.eyebrow} onClose={() => setOpenSheet(null)}>
            {renderSurface(openMeta.id)}
          </HubSheet>
        )}

        {/* ── the UnifiedLogger sheet — the new heart of logging ─────────── */}
        {openLogger && user && (
          <HubSheet title="log a meal" eyebrow="Snap · Say · Scan · Search · Recents" onClose={() => setOpenLogger(false)}>
            <UnifiedLogger
              user={user}
              profile={profile}
              onLogged={() => { loadSummary(user, dayKey); loadRecents(user); }}
            />
          </HubSheet>
        )}
      </div>
    </div>
  );
}

function navBtn(disabled) {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38,
    borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi,
    color: disabled ? T.paperDeep : T.ink, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
  };
}

// ── per-card rich summary — each card holds a FULL inline preview of its feature,
// built ONLY from real data the hub loaded. Missing data → a calm honest empty
// state, never a mock figure. The bottom sheet stays the "go deeper / edit" layer.
function CardSummary({
  surface, user, summary, dayMeals, recents, weekKcal, mealPlan, shopItems, savedRecipes,
  nutritionProfile, profile, targets, calorieTarget, hydrationTarget, kcalLeft, jess, onOpen, onLog, onReLog, onWater, onRemove, onToggleShop, isToday,
}) {
  switch (surface.id) {
    case "log":      return <LogCard {...{ surface, recents, onLog, onReLog }} />;
    case "today":    return <TodayCard {...{ summary, dayMeals, recents, calorieTarget, hydrationTarget, kcalLeft, onReLog, onWater, onRemove, isToday }} />;
    case "plan":     return <PlanCard {...{ nutritionProfile, profile, targets, calorieTarget }} />;
    case "recipes":  return <RecipesCard {...{ savedRecipes, onReLog }} />;
    case "mealgen":  return <MealgenCard {...{ mealPlan, onReLog }} />;
    case "shopping": return <ShoppingCard {...{ shopItems, onToggleShop }} />;
    case "progress": return <ProgressCard {...{ recents, dayMeals, summary, weekKcal }} />;
    case "insights": return <InsightsCard {...{ jess, profile, user }} />;
    default:         return null;
  }
}

// ── LOG · Demo-1's CardLog look, wired to the REAL logger + REAL recents ─────
// The 6 method tiles all open the UnifiedLogger (with an optional initial-method
// hint). Recents chips re-log for real via onReLog; "+ Add a recent" opens the logger.
const LOG_METHODS = [
  { id: "search",  label: "Search foods", Icon: Search },
  { id: "recent",  label: "Recents",      Icon: Clock },
  { id: "fave",    label: "Favourites",   Icon: Star },
  { id: "photo",   label: "Snap a photo", Icon: Camera },
  { id: "voice",   label: "Say it",       Icon: Mic },
  { id: "barcode", label: "Scan barcode", Icon: ScanLine },
];
function LogCard({ surface, recents, onLog, onReLog }) {
  const list = (recents || []).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Eyebrow mb={6} color={surface.accent}>{surface.eyebrow}</Eyebrow>
      <Script size={30} style={{ marginBottom: 2 }}>Add a meal</Script>
      <Hand size={15} color={T.muted} style={{ marginBottom: 14 }}>In seconds — tap how you’d like to log.</Hand>

      {/* the 6 method tiles — each opens the real UnifiedLogger */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
        {LOG_METHODS.map((mth) => {
          const Icon = mth.Icon;
          return (
            <button key={mth.id} onClick={() => onLog(mth.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "11px 4px",
              background: "transparent", color: T.ink,
              border: `1px solid ${T.paperDeep}`, borderRadius: 12, cursor: "pointer",
            }}>
              <Icon size={16} />
              <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.3, textAlign: "center" }}>{mth.label}</span>
            </button>
          );
        })}
      </div>

      {/* recents — one tap re-adds for real */}
      <div style={{ flex: 1 }}>
        {list.length > 0 ? (
          <>
            <Eyebrow mb={9}>Recents — one tap to re-add</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {list.slice(0, 6).map((r) => (
                <button key={r.id} onClick={() => onReLog(r.name)} style={{
                  display: "inline-flex", alignItems: "center", gap: 7, background: T.wax,
                  border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 12px 7px 10px", cursor: "pointer",
                }}>
                  <Plus size={12} color={T.crimson} />
                  <span style={{ fontFamily: SERIF, fontSize: 13, color: T.ink }}>{r.name}</span>
                  {r.kcal ? <span style={{ fontFamily: UI, fontSize: 9.5, color: T.muted }}>{r.kcal} kcal</span> : null}
                </button>
              ))}
            </div>
          </>
        ) : (
          <Hand size={14} color={T.muted}>Log a meal and your recents will gather here for one-tap re-adding.</Hand>
        )}
      </div>

      {/* + Add a recent — opens the real logger */}
      <div style={{ marginTop: 14 }}>
        <button onClick={() => onLog("recent")} style={{
          width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: T.crimson, color: T.paper, border: "none", borderRadius: 12, padding: "12px 16px",
          fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer",
        }}>
          <Plus size={15} /> Add a recent
        </button>
      </div>
    </div>
  );
}

// ── TODAY · the plate + logged meals + recents to re-add (all real) ──────────
function TodayCard({ summary, dayMeals, recents, calorieTarget, hydrationTarget, kcalLeft, onReLog, onWater, onRemove, isToday }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={26} style={{ marginBottom: 2 }}>Today’s plate</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>
        {summary.meals === 0
          ? "Nothing logged yet — whenever you’re ready."
          : `${summary.meals} logged · ${kcalLeft} kcal of gentle room left.`}
      </Hand>

      <div style={{ display: "grid", gap: 11, marginBottom: 10 }}>
        <Glance label="Energy" value={`${summary.kcal} of ${calorieTarget} kcal`} v={summary.kcal} guide={calorieTarget} color={T.gold} />
        <Glance label="Hydration" value={`${summary.hydrationMl} of ${hydrationTarget} ml`} v={summary.hydrationMl} guide={hydrationTarget} color={T.sage} />
      </div>

      {/* inline water quick-add — one direct tap logs it, no sheet (moves the bar now) */}
      {isToday && onWater && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[250, 500].map((ml) => (
            <button key={ml} onClick={() => onWater(ml)} style={{
              flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: T.wax, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "9px 10px",
              fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color: T.ink, cursor: "pointer",
            }}>
              <Plus size={13} color={T.sage} /> {ml} ml water
            </button>
          ))}
        </div>
      )}

      <Eyebrow mb={8}>Logged today</Eyebrow>
      <div style={{ display: "grid", gap: 7, marginBottom: 14 }}>
        {dayMeals.length === 0 ? (
          <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
            A fresh plate — nothing logged yet.
          </div>
        ) : (
          dayMeals.slice(0, 4).map((m) => (
            <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <span style={{ fontFamily: UI, fontSize: 9, color: T.muted, fontWeight: 700, width: 52, textTransform: "uppercase", flexShrink: 0 }}>{m.slot}</span>
              <span style={{ flex: 1, fontFamily: SERIF, fontSize: 13.5, color: T.ink, lineHeight: 1.25, minWidth: 0 }}>{m.title}</span>
              {m.kcal ? <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, flexShrink: 0 }}>{m.kcal} kcal</span> : null}
              {onRemove && isToday ? (
                <button
                  onClick={() => onRemove(m)}
                  aria-label={`Remove ${m.title}`}
                  title="Remove"
                  style={{
                    flexShrink: 0, width: 22, height: 22, borderRadius: 999, border: "none",
                    background: "transparent", color: T.muted, display: "grid", placeItems: "center",
                    cursor: "pointer", alignSelf: "center",
                  }}
                >
                  <X size={13} />
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "auto" }}>
        {recents.length > 0 ? (
          <>
            <Eyebrow mb={8}>Recents — one tap logs it</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {recents.slice(0, 5).map((r) => (
                <button key={r.id} onClick={() => onReLog(r.name)} style={chipBtn}>
                  <Plus size={11} color={T.crimson} />
                  <span style={{ fontFamily: SERIF, fontSize: 12.5, color: T.ink }}>{r.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>
            Log a meal and your recents will appear here for one-tap re-adding.
          </div>
        )}
      </div>
    </div>
  );
}

// ── PLAN · the real targets + stage framing (guides, never caps) ─────────────
function PlanCard({ nutritionProfile, profile, targets, calorieTarget }) {
  const np = nutritionProfile || {};
  const d = targets || {};
  // Prefer explicit user-set rows; otherwise show the gentle DERIVED guides (protein /
  // fibre / iron) so the card reflects the real stage+body picture, never blank.
  const planRows = [
    (np.protein_target_g || d.protein_g) ? { label: "Protein", guide: `${np.protein_target_g || d.protein_g}g`, why: "steadies energy and holds muscle" } : null,
    np.carbs_target_g ? { label: "Carbs", guide: `${np.carbs_target_g}g`, why: "your gentle daily fuel" } : null,
    np.fat_target_g ? { label: "Healthy fats", guide: `${np.fat_target_g}g`, why: "for hormones and absorption" } : null,
    d.fibre_g ? { label: "Fibre", guide: `${d.fibre_g}g`, why: "kind to digestion and energy" } : null,
    d.iron_mg ? { label: "Iron", guide: `${Math.round(d.iron_mg)}mg`, why: "supports steady energy" } : null,
    np.hydration_target_ml ? { label: "Water", guide: `${np.hydration_target_ml}ml`, why: "small and often beats one big glass" } : null,
  ].filter(Boolean).slice(0, 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={24} style={{ marginBottom: 2 }}>What your body’s asking for</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>
        {stageLabel(profile)} — {d.basis || "a guide"} for the week, never a cap.
      </Hand>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: SERIF, fontSize: 30, color: T.ink, fontWeight: 600 }}>
          {d.energy_min && d.energy_max ? `${d.energy_min}–${d.energy_max}` : calorieTarget}
        </span>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 0.5 }}>kcal · gentle energy guide</span>
      </div>

      {planRows.length > 0 ? (
        <div style={{ display: "grid", gap: 12 }}>
          {planRows.map((t) => (
            <div key={t.label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, fontWeight: 600 }}>{t.label}</span>
                <span style={{ fontFamily: UI, fontSize: 11, color: T.gold, fontWeight: 700 }}>{t.guide}</span>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginTop: 2 }}>{t.why}</div>
            </div>
          ))}
        </div>
      ) : (
        <Empty>Set your gentle targets in the full plan and they’ll show here — protein, carbs, fats and water for your stage.</Empty>
      )}
    </div>
  );
}

// ── RECIPES · saved recipe titles if any, else an honest invitation ──────────
function RecipesCard({ savedRecipes, onReLog }) {
  const recipes = (savedRecipes || []).filter(Boolean);
  const n = recipes.length;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={26} style={{ marginBottom: 2 }}>Cook what you have</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>
        {n > 0
          ? `${n} saved recipe${n === 1 ? "" : "s"} — and new ones from what’s already in.`
          : "Your saved recipes — and new ones from what’s already in."}
      </Hand>

      {n > 0 ? (
        <div style={{ display: "grid", gap: 9 }}>
          {recipes.slice(0, 5).map((r) => {
            const title = r.title || r.name || "Saved recipe";
            return (
              <div key={r.id} style={{ borderLeft: `2px solid ${T.sage}`, paddingLeft: 11, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
                  {r.rating > 0 ? (
                    <div style={{ display: "inline-flex", gap: 1, marginTop: 2 }}>
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={10} style={{ color: T.gold, fill: T.gold }} />
                      ))}
                    </div>
                  ) : null}
                </div>
                {/* direct-on-card: log this recipe as today's meal in one tap (no sheet) */}
                {onReLog ? (
                  <button onClick={() => onReLog(title)} aria-label={`Log ${title}`}
                    style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, background: T.wax, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 10px", cursor: "pointer", fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.3, color: T.ink, textTransform: "uppercase" }}>
                    <Plus size={11} color={T.crimson} /> Log
                  </button>
                ) : null}
              </div>
            );
          })}
          {n > 5 ? (
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 2 }}>
              + {n - 5} more in Recipes
            </div>
          ) : null}
        </div>
      ) : (
        <Empty>No saved recipes yet. Open Recipes to generate one from what’s in your kitchen, or save a favourite — they’ll gather here.</Empty>
      )}
    </div>
  );
}

// ── AI PLAN · the REAL week scaffold from the unified plan (plan_days), a few
// days' B/L/D inline. Reads the live MealPlans.plan_days shape the UnifiedMealPlanTab
// writes ({day, breakfast:[str], lunch:[str], dinner:[str], snack:[str]}), with a
// fallback to the legacy generator shape (days[].meals[].name) so old rows still show.
const DOW_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function MealgenCard({ mealPlan, onReLog }) {
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
  // normalise either shape → [{ label, dayIdx, breakfast, lunch, dinner }]
  const cellName = (v) => (Array.isArray(v) ? (v[0] || "") : (typeof v === "string" ? v : (v?.name || "")));
  let rows = [];
  const planDays = (mealPlan?.plan_days || []).filter(Boolean);
  if (planDays.length > 0) {
    rows = planDays
      .filter((d) => typeof d?.day === "number" && (d.breakfast?.length || d.lunch?.length || d.dinner?.length || d.snack?.length))
      .sort((a, b) => a.day - b.day)
      .map((d) => ({
        label: DOW_SHORT[d.day] || `D${d.day + 1}`, dayIdx: d.day,
        breakfast: cellName(d.breakfast), lunch: cellName(d.lunch), dinner: cellName(d.dinner),
      }));
  } else if (Array.isArray(mealPlan?.days)) {
    rows = mealPlan.days.filter(Boolean).map((d, i) => ({
      label: (d.day_label || `D${d.day_number || i + 1}`).slice(0, 3), dayIdx: (d.day_number ? d.day_number - 1 : i),
      breakfast: cellName(d.meals?.breakfast), lunch: cellName(d.meals?.lunch), dinner: cellName(d.meals?.dinner),
    }));
  }
  // surface TODAY's row first (most relevant + where the inline "Log" lives), then the rest
  if (rows.length) {
    const todayRow = rows.find((r) => r.dayIdx === todayIdx);
    if (todayRow) rows = [todayRow, ...rows.filter((r) => r.dayIdx !== todayIdx)];
  }
  const lockedSet = new Set(mealPlan?.locked_cells || []);   // "<dayIdx>_<slot>"
  const lockedCount = lockedSet.size;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={26} style={{ marginBottom: 2 }}>A gentle week</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>
        {mealPlan?.plan_name
          ? mealPlan.plan_name
          : lockedCount > 0
            ? `${lockedCount} meal${lockedCount === 1 ? "" : "s"} pinned — the rest stays open.`
            : "One plan — edit, lock, and regenerate the rest."}
      </Hand>

      {rows.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "30px 1fr", gap: "0 8px" }}>
          {rows.slice(0, 7).map((d, i) => (
            <div key={i} style={{ display: "contents" }}>
              <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, color: T.gold, letterSpacing: 0.5, textTransform: "uppercase", paddingTop: 9, borderTop: `1px solid ${T.paperDeep}` }}>
                {d.label}
              </div>
              <div style={{ paddingTop: 9, paddingBottom: 9, borderTop: `1px solid ${T.paperDeep}` }}>
                {[["B", d.breakfast, "breakfast"], ["L", d.lunch, "lunch"], ["D", d.dinner, "dinner"]].map(([slot, name, slotKey]) => {
                  const isLocked = name && lockedSet.has(`${d.dayIdx}_${slotKey}`);
                  return (
                  <div key={slot} style={{ display: "flex", gap: 7, alignItems: "baseline", marginBottom: 3 }}>
                    <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, color: T.muted, width: 12, flexShrink: 0 }}>{slot}</span>
                    <span style={{ flex: 1, fontFamily: SERIF, fontSize: 12.5, color: name ? T.ink : T.muted, lineHeight: 1.2, minWidth: 0, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {isLocked ? <Lock size={9} color={T.gold} style={{ flexShrink: 0 }} /> : null}
                      {name || "—"}
                    </span>
                    {/* direct-on-card: log today's planned meal in one tap (no sheet) */}
                    {name && d.dayIdx === todayIdx && onReLog ? (
                      <button onClick={() => onReLog(name, slotKey)} aria-label={`Log ${name}`}
                        style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: 0.3, color: T.crimson, textTransform: "uppercase", padding: 0 }}>
                        <Plus size={11} /> Log
                      </button>
                    ) : null}
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty>No plan this week yet. Open AI Plan to build a gentle week — edit cells by hand, lock the ones you love, and regenerate the rest around your stage.</Empty>
      )}
    </div>
  );
}

// ── SHOP · tick items INLINE (direct, no sheet) — real ShoppingList rows ──────
function ShoppingCard({ shopItems, onToggleShop }) {
  const items = (shopItems || []).filter(Boolean);
  const open = items.filter((i) => !i.is_checked);
  // show open items first (to get), then a few ticked — tappable to toggle right here
  const ordered = [...open, ...items.filter((i) => i.is_checked)].slice(0, 9);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={26} style={{ marginBottom: 2 }}>The list</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>
        {items.length > 0 ? `${open.length} to get · tap to tick off as you shop.` : "Sorted by aisle, straight from your plan."}
      </Hand>

      {items.length > 0 ? (
        <div style={{ display: "grid", gap: 6 }}>
          {ordered.map((it) => (
            <button key={it.id} onClick={() => onToggleShop && onToggleShop(it)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
              background: "transparent", border: "none", cursor: "pointer", padding: "5px 0",
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: "grid", placeItems: "center",
                background: it.is_checked ? T.sage : "transparent", border: `1.5px solid ${it.is_checked ? T.sage : T.paperDeep}`,
              }}>
                {it.is_checked ? <Check size={13} color={T.paper} /> : null}
              </span>
              <span style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 14, lineHeight: 1.2,
                color: it.is_checked ? T.muted : T.ink, textDecoration: it.is_checked ? "line-through" : "none" }}>
                {it.ingredient_name}
              </span>
              {it.category ? <span style={{ fontFamily: UI, fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 0.4, flexShrink: 0 }}>{it.category}</span> : null}
            </button>
          ))}
          {items.length > 9 ? (
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 4 }}>+ {items.length - 9} more in the full list</div>
          ) : null}
        </div>
      ) : (
        <Empty>Your list is empty. Generate a meal plan and sync it, or add items in the full list — they’ll gather here sorted by aisle.</Empty>
      )}
    </div>
  );
}

// ── PROGRESS · a gentle real sparkline + soft patterns from logged meals ─────
function ProgressCard({ recents, dayMeals, summary, weekKcal }) {
  // a soft real signal: kcal across the meals logged today (patterns, not scores)
  const series = dayMeals.map((m) => m.kcal).filter((n) => n > 0);
  const haveSignal = series.length >= 2;
  // last-7-days energy (real) — a week of rhythm, not just today
  const week = (weekKcal || []).filter(Boolean);
  const daysWithData = week.filter((d) => d.kcal > 0).length;
  const weekMax = Math.max(1, ...week.map((d) => d.kcal));
  const todayKey = format(new Date(), "yyyy-MM-dd");
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={26} style={{ marginBottom: 2 }}>Patterns, not scores</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>A soft line across your week — never a grade.</Hand>

      {/* weekly energy trend — one soft bar per day, today marked */}
      {daysWithData >= 2 ? (
        <div style={{ marginBottom: 16 }}>
          <Eyebrow mb={8}>Energy across your week</Eyebrow>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 6, height: 56 }}>
            {week.map((d) => {
              const isToday = d.key === todayKey;
              const h = d.kcal > 0 ? Math.max(6, Math.round((d.kcal / weekMax) * 46)) : 3;
              return (
                <div key={d.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                  <div style={{ width: "100%", maxWidth: 16, height: h, borderRadius: 5, background: d.kcal > 0 ? (isToday ? T.crimson : T.gold) : T.paperDeep }} title={d.kcal > 0 ? `${d.kcal} kcal` : "—"} />
                  <span style={{ fontFamily: UI, fontSize: 8.5, fontWeight: 700, letterSpacing: 0.2, color: isToday ? T.ink : T.muted }}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {haveSignal ? (
        <>
          <Eyebrow mb={8}>Today’s meals, by energy</Eyebrow>
          <Sparkline data={series} />
        </>
      ) : daysWithData >= 2 ? null : (
        <div style={{ marginBottom: 12 }}>
          <Empty>Once you’ve logged a few meals, a gentle shape of your days appears here — energy, hydration and rhythm, framed as patterns.</Empty>
        </div>
      )}

      <div style={{ display: "grid", gap: 10, marginTop: haveSignal ? 16 : 4 }}>
        <Pattern tone={summary.meals > 0 ? "good" : "soft"} title={summary.meals > 0 ? `${summary.meals} meal${summary.meals === 1 ? "" : "s"} logged today` : "No meals logged today yet"} detail={summary.meals > 0 ? "Showing up is the pattern that matters." : "Whenever you’re ready — one is plenty."} />
        <Pattern tone={summary.hydrationMl > 0 ? "good" : "soft"} title={summary.hydrationMl > 0 ? `${summary.hydrationMl}ml of water so far` : "No water logged today"} detail={summary.hydrationMl > 0 ? "Little sips through the day add up." : "A glass now is a kind start."} />
        {recents.length > 0 ? (
          <Pattern tone="good" title={`${recents.length} go-to meals you return to`} detail="Familiar food is a quiet strength, not a rut." />
        ) : null}
      </div>
    </div>
  );
}
function Pattern({ tone, title, detail }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <span style={{ width: 6, borderRadius: 999, background: tone === "good" ? T.sage : T.gold, flex: "none" }} />
      <div>
        <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginTop: 1 }}>{detail}</div>
      </div>
    </div>
  );
}
function Sparkline({ data }) {
  const w = 320, h = 52, max = Math.max(...data), min = Math.min(...data);
  const x = (i) => (i / (data.length - 1)) * w;
  const y = (v) => h - 6 - ((v - min) / (max - min || 1)) * (h - 12);
  const d = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }} aria-hidden>
      <path d={d} fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={2.4} fill={T.gold} />)}
    </svg>
  );
}

// ── INSIGHTS · Jess's stage line + stage-aware micronutrient nudges (real) ───
function InsightsCard({ jess, profile, user }) {
  const nudges = stageNudges(profile);
  // CROSS-CYCLE MEMORY (fail-open): a gentle, phase-aware pattern from PAST cycles, computed
  // from real phase-tagged MealLog rows. No-guilt framing, never a target. Read is guarded
  // inside nutritionCycleMemory; this never blocks the card or throws.
  const [memory, setMemory] = useState(null);
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    nutritionCycleMemory(user.id, profile)
      .then((m) => { if (!cancelled) setMemory(m); })
      .catch(() => { if (!cancelled) setMemory(null); });
    return () => { cancelled = true; };
  }, [user?.id, profile]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Leaf size={15} color={T.sage} />
        <Eyebrow color={T.sage}>Jess · {stageLabel(profile)}</Eyebrow>
      </div>
      <Hand size={15} color={T.ink} style={{ marginBottom: 14 }}>{jess}</Hand>

      {memory?.hasData && memory.lines.length > 0 && (
        <div style={{ background: T.wax, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "12px 13px", marginBottom: 14 }}>
          <Eyebrow color={T.sage} mb={6}>Across your {memory.phase} phases</Eyebrow>
          {memory.lines.map((line, i) => (
            <div key={i} style={{ fontFamily: SERIF, fontSize: 13, color: T.ink, lineHeight: 1.45, marginTop: i ? 6 : 0 }}>{line}</div>
          ))}
        </div>
      )}

      <Eyebrow mb={8}>Gentle nudges for your stage</Eyebrow>
      <div style={{ display: "grid", gap: 11 }}>
        {nudges.map((m) => (
          <div key={m.key} style={{ borderLeft: `2px solid ${T.paperDeep}`, paddingLeft: 11 }}>
            <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 2 }}>{m.foods}</div>
            <div style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic", marginTop: 1 }}>{m.why}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── small shared bits ────────────────────────────────────────────────────────
function Glance({ label, value, v, guide, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontFamily: UI, fontSize: 11, color: T.muted }}>
        <span style={{ fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", fontSize: 9.5 }}>{label}</span>
        <span>{value}</span>
      </div>
      <SoftBar value={v} guide={guide} color={color} />
    </div>
  );
}
function Empty({ children }) {
  return (
    <div style={{ border: `1px dashed ${T.paperDeep}`, borderRadius: 12, padding: "14px 13px" }}>
      <div style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}
const chipBtn = {
  display: "inline-flex", alignItems: "center", gap: 6, background: T.wax,
  border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 11px 6px 9px", cursor: "pointer",
};

// NutritionEliteShell — the ELEVATED, FULLY-WIRED Nutrition page. The exact Nutrition analogue of
// PlannerEliteShell: self-loading against real base44 entities; every control persists (optimistic
// write + try/catch rollback + a flash() toast). Rendered by /NutritionElite (parallel test route)
// while the live "Nutrition" mapping stays untouched.
//
// Craft elevated ~3 levels over the demo: lush flora hero (phase bloom + bouquet + resting creature),
// dimensional Clipboard cards, oxblood script headings, the full card language (two stacked horizontal
// sub-sliders per board + gold hairline divider + board ‹ › arrows + colour pills + accent-rim
// sub-cards), tasteful reduced-motion-safe motion. ALL 8 surfaces, STRIP NOTHING.
//
// REAL DATA (no new base44 function — entities + existing dispatchers only, copied from NutritionHub):
//   • MealLog (create/delete; today + history; ai_analysis.summary macros via the nutrition spine).
//   • HydrationLog (create today; +250/+500 quick water).
//   • MealPlans (this week's plan; today's dinner cell).  • ShoppingList (read + toggle is_checked).
//   • MealTemplates (recipes/recents).  • NutritionProfile (hydration_target_ml, goal_mode).
//   • BodyMetrics + UserProfile → deriveTargets (energy/protein/fibre/iron) + cycle phase.
//   • WeeklyInsights/NutritionInsight → graceful insights text (falls back to a stage line).
//   • Logger → the existing UnifiedLogger mounted in a SheetShell with onLogged → refresh.
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Plus, X, Check, Droplet, UtensilsCrossed, Target, BookOpen,
  CalendarDays, ShoppingBasket, TrendingUp, Sparkles, Leaf, Mic, Loader, Repeat, Beef, Wheat,
  Apple, Flame, ListChecks, Salad, Search, Star, Camera, ScanLine, Fish, Carrot,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek } from "date-fns";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet, Pollinator } from "@/components/brand/flora";
import MonthlyCalendarCard from "@/components/planner/MonthlyCalendarCard";
import DayDetailSheet from "@/components/planner/DayDetailSheet";
import UnifiedLogger from "@/components/nutrition/UnifiedLogger";
import { getCurrentCyclePhase, phaseLabel } from "@/utils/cyclePhase";
import { deriveTargets } from "@/utils/nutritionTargets";
import { dayNutrition } from "@/utils/foodModel";
import { mealEstimate } from "@/utils/cofid";
import { getMealSummary, inferMealTypeFromTime } from "@/utils/nutritionAiAnalysis";
import { withTimeout } from "@/utils/safeEntity";
import {
  OXBLOOD, lbl, subCard, focusPill, Pill, Panel, StackedCard, BoardBody, TopChrome, SheetShell,
  JumpSheet, SliderArrows, makeCalendarOverlay,
} from "@/components/brand/SliderKit";

const CalendarOverlay = makeCalendarOverlay(MonthlyCalendarCard, DayDetailSheet);

// ── tasteful, reduced-motion-safe motion ─────────────────────────────────────
const ELITE_MOTION = `
@keyframes fwEliteIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:none; } }
.fw-elite-in { animation: fwEliteIn .5s cubic-bezier(.4,0,.2,1) both; }
.fw-elite-press { transition: transform .12s ease; }
.fw-elite-press:active { transform: scale(.97); }
@media (prefers-reduced-motion: reduce){ .fw-elite-in{ animation:none } .fw-elite-press{ transition:none } }
`;

// phase → bloom/colourway for the hero (same semantic phase set as Planner)
const PHASE_BLOOM = {
  menstrual: { bloom: "poppy", cw: "crimson", hue: "#BC2E27", note: "Iron-rich, warming foods settle well now." },
  follicular: { bloom: "snowdrop", cw: "sage", hue: "#8FAF8F", note: "Fresh, bright food matches your rising energy." },
  ovulatory: { bloom: "sunflower", cw: "gold", hue: "#D4AF37", note: "Your peak — colour and protein carry it well." },
  luteal: { bloom: "dahlia", cw: "plum", hue: "#8E6E8E", note: "Steady carbs and magnesium soften the dip." },
};
const phaseMeta = (key) => PHASE_BLOOM[key] || PHASE_BLOOM.follicular;

const WATER_GLASS_ML = 250;
const todayKey = () => format(new Date(), "yyyy-MM-dd");
const nowISO = () => new Date().toISOString();

// stage label (for the My-plan framing line)
const STAGE_LABEL = {
  teen: "Teen", reproductive: "Reproductive years", "pre-ttc": "Preparing to conceive",
  ttc: "Trying to conceive", pregnant: "Pregnancy", "pregnant-t1": "Pregnancy · first trimester",
  "pregnant-t2": "Pregnancy · second trimester", "pregnant-t3": "Pregnancy · third trimester",
  postpartum: "Postpartum", perimenopause: "Perimenopause", menopause: "Menopause",
  "post-menopause": "Post-menopause",
};
const stageLabel = (profile) => { const s = profile?.life_stage || profile?.stage; return (s && STAGE_LABEL[s]) || "Your stage"; };

// gentle Jess line by stage (NutritionHub parity)
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

// stage-aware nutrient nudges for the Insights lens (NutritionHub parity, trimmed)
function stageNudges(profile) {
  const stage = profile?.life_stage || profile?.stage;
  const byStage = {
    perimenopause: [
      { label: "Iron", Icon: Beef, cw: "crimson", foods: "lentils · greens · red meat", why: "heavier cycles dip your stores" },
      { label: "Protein", Icon: Fish, cw: "gold", foods: "eggs · fish · beans", why: "steadies energy through the swings" },
      { label: "Calcium", Icon: Leaf, cw: "sage", foods: "yoghurt · sardines · tofu", why: "bones need a little more from here" },
    ],
    menopause: [
      { label: "Calcium", Icon: Leaf, cw: "sage", foods: "dairy · fortified milk · greens", why: "protective as oestrogen settles" },
      { label: "Protein", Icon: Fish, cw: "gold", foods: "fish · eggs · pulses", why: "helps hold onto muscle" },
      { label: "Fibre", Icon: Wheat, cw: "sage", foods: "oats · beans · wholegrains", why: "kind to digestion and heart" },
    ],
    pregnant: [
      { label: "Iron", Icon: Beef, cw: "crimson", foods: "red meat · lentils · spinach", why: "your blood volume is rising" },
      { label: "Calcium", Icon: Leaf, cw: "sage", foods: "milk · yoghurt · cheese", why: "building baby's bones" },
      { label: "Folate", Icon: Sparkles, cw: "gold", foods: "leafy greens · beans", why: "supports early development" },
    ],
    ttc: [
      { label: "Iron", Icon: Beef, cw: "crimson", foods: "lentils · greens · red meat", why: "supports a regular cycle" },
      { label: "Healthy fats", Icon: Apple, cw: "sage", foods: "avocado · olive oil · oily fish", why: "quietly doing a lot this season" },
      { label: "Folate", Icon: Sparkles, cw: "gold", foods: "leafy greens · beans", why: "key before conception" },
    ],
  };
  return byStage[stage] || [
    { label: "Protein", Icon: Fish, cw: "gold", foods: "eggs · fish · beans", why: "keeps energy steady" },
    { label: "Fibre", Icon: Wheat, cw: "sage", foods: "oats · veg · wholegrains", why: "kind to digestion" },
    { label: "Iron", Icon: Beef, cw: "crimson", foods: "leafy greens · lentils", why: "supports energy" },
  ];
}

// tonight's suggested dinner — from this week's plan, else a saved recipe, else a gentle stage idea
const DINNER_BY_STAGE = {
  perimenopause: { name: "Salmon with greens and lentils", why: "iron and omega-3 for where you are" },
  menopause: { name: "Tofu and broccoli stir-fry", why: "calcium and protein, gentle on the evening" },
  pregnant: { name: "Lentil and spinach dahl", why: "iron and folate, easy to keep down" },
  postpartum: { name: "Chicken and vegetable soup", why: "warm, iron-rich and one-handed" },
  ttc: { name: "Salmon traybake with roast veg", why: "good fats and colour for the season" },
};
function suggestedDinner(mealPlan, savedRecipes, profile) {
  const planDays = (mealPlan?.plan_days || []).filter(Boolean);
  if (planDays.length > 0) {
    const todayIdx = (new Date().getDay() + 6) % 7;
    const cell = planDays.find((d) => d?.day === todayIdx)?.dinner;
    const name = Array.isArray(cell) ? cell[0] : (typeof cell === "string" ? cell : cell?.name);
    if (name) return { name, why: "from your plan for tonight" };
  }
  const saved = (savedRecipes || []).filter(Boolean);
  if (saved.length > 0 && (saved[0].title || saved[0].name)) return { name: saved[0].title || saved[0].name, why: "one of your saved recipes" };
  const stage = profile?.life_stage || profile?.stage;
  return DINNER_BY_STAGE[stage] || { name: "Something warm with greens and protein", why: "a gentle, balanced plate for tonight" };
}

// gentle carbs/fat references derived from the energy target (deriveTargets gives protein/fibre/iron only)
const carbsFromEnergy = (kcal) => Math.round((kcal * 0.45) / 4 / 5) * 5;   // ~45% energy, /4 kcal·g, to 5g
const fatFromEnergy = (kcal) => Math.round((kcal * 0.30) / 9 / 5) * 5;     // ~30% energy, /9 kcal·g, to 5g

// ════════════════════════════════════════════════════════════════════════════
export default function NutritionEliteShell() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [bodyMetrics, setBodyMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // today's plate (real)
  const [summary, setSummary] = useState({ kcal: 0, meals: 0, hydrationMl: 0 });
  const [dayMeals, setDayMeals] = useState([]);          // {id, slot, title, kcal}
  const [dayMealRows, setDayMealRows] = useState([]);    // raw rows (ai_analysis) for the spine
  const [recents, setRecents] = useState([]);            // {id, name}
  // kitchen (real)
  const [mealPlan, setMealPlan] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [weekKcal, setWeekKcal] = useState([]);          // 7-day energy sparkbars
  const [insightText, setInsightText] = useState(null);  // WeeklyInsights/NutritionInsight body

  // overlays
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const sliderRef = useRef(null);

  const flash = (m) => { setToast(m); window.clearTimeout(flash._t); flash._t = window.setTimeout(() => setToast(null), 2300); };

  // ── cycle phase + derived targets ──────────────────────────────────────────
  const phaseKey = useMemo(() => getCurrentCyclePhase(profile), [profile]);
  const ph = phaseMeta(phaseKey || "follicular");
  const cycleDay = useMemo(() => {
    if (!profile?.last_period_start_date) return null;
    const len = profile.cycle_avg_length || 28;
    const diff = Math.floor((Date.now() - new Date(profile.last_period_start_date).getTime()) / 86400000);
    if (!Number.isFinite(diff) || diff < 0) return null;
    return (diff % len) + 1;
  }, [profile]);

  const targets = useMemo(() => deriveTargets({ profile, nutritionProfile, bodyMetrics }), [profile, nutritionProfile, bodyMetrics]);
  const calorieTarget = targets.energy_kcal;
  const proteinTarget = targets.protein_g;
  const fibreTarget = targets.fibre_g;
  const ironTarget = Math.round(targets.iron_mg);
  const carbsTarget = carbsFromEnergy(calorieTarget);
  const fatTarget = fatFromEnergy(calorieTarget);
  const hydrationTarget = nutritionProfile?.hydration_target_ml || 2000;
  const glassesTarget = Math.round(hydrationTarget / WATER_GLASS_ML);
  const glasses = Math.round((summary.hydrationMl || 0) / WATER_GLASS_ML);
  const kcalLeft = Math.max(0, calorieTarget - summary.kcal);

  const macroSums = useMemo(() => {
    const n = dayNutrition(dayMealRows, { floor: true });
    return { protein: Math.round(n.protein_g), fibre: Math.round(n.fiber_g), iron: Math.round(n.iron_mg) };
  }, [dayMealRows]);

  // ── loaders (real, guarded) ────────────────────────────────────────────────
  const loadSummary = useCallback(async (u, key) => {
    if (!u) return;
    const [meals, hydration] = await Promise.all([
      base44.entities.MealLog.filter({ user_id: u.id, day_key: key }).catch(() => []),
      base44.entities.HydrationLog.filter({ user_id: u.id, day_key: key }).catch(() => []),
    ]);
    const safe = (meals || []).filter(Boolean);
    const kcal = dayNutrition(safe, { floor: true }).kcal;
    const hydrationMl = (hydration || []).filter(Boolean).reduce((s, l) => s + (l.amount_ml || 0), 0);
    const ordered = [...safe].sort((a, b) => (a.logged_at || "").localeCompare(b.logged_at || ""));
    setSummary({ kcal: Math.round(kcal), meals: safe.length, hydrationMl });
    setDayMealRows(ordered);
    setDayMeals(ordered.filter((m) => m.raw_text).map((m) => ({
      id: m.id, slot: m.meal_type || "meal", title: m.raw_text, kcal: Math.round(dayNutrition([m], { floor: true }).kcal),
    })));
  }, []);

  const loadRecents = useCallback(async (u) => {
    if (!u) return;
    const rows = await base44.entities.MealLog.filter({ user_id: u.id }, "-created_date", 12).catch(() => []);
    const seen = new Set(); const out = [];
    for (const m of (rows || []).filter(Boolean)) {
      const text = (m.raw_text || "").trim(); const k = text.toLowerCase();
      if (!text || seen.has(k)) continue; seen.add(k);
      out.push({ id: m.id, name: text, kcal: getMealSummary(m).summary?.calories || 0 });
      if (out.length >= 6) break;
    }
    setRecents(out);
  }, []);

  const loadWeek = useCallback(async (u) => {
    if (!u) return;
    const rows = await base44.entities.MealLog.filter({ user_id: u.id }, "-day_key", 250).catch(() => []);
    const safe = (rows || []).filter(Boolean); const out = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      const key = format(dt, "yyyy-MM-dd");
      const meals = safe.filter((m) => m.day_key === key);
      out.push({ key, kcal: meals.length ? Math.round(dayNutrition(meals, { floor: true }).kcal) : 0, days: meals.length > 0 });
    }
    setWeekKcal(out);
  }, []);

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
    const saved = (recipes || []).filter((r) => r && r.category === "recipe" && r.recipe_json).map((r) => {
      let title = r.title; try { title = JSON.parse(r.recipe_json)?.recipe_name || r.title; } catch { /* keep */ }
      return { id: r.id, title, rating: r.rating || 0 };
    }).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    setSavedRecipes(saved);
  }, []);

  const loadInsights = useCallback(async (u) => {
    if (!u) return;
    try {
      const wi = await base44.entities.WeeklyInsights.filter({ user_id: u.id }, "-created_date", 1).catch(() => []);
      const row = (wi || []).filter(Boolean)[0];
      const body = row?.summary || row?.body || row?.text || row?.nutrition_summary;
      if (body) { setInsightText(body); return; }
    } catch { /* ignore */ }
    try {
      const ni = await base44.entities.NutritionInsight.filter({ user_id: u.id }, "-created_date", 1).catch(() => []);
      const row = (ni || []).filter(Boolean)[0];
      const body = row?.summary || row?.body || row?.text;
      if (body) setInsightText(body);
    } catch { /* ignore */ }
  }, []);

  // ── init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true; let unsubHydration; let unsubMeals;
    (async () => {
      try {
        const u = await base44.auth.me(); if (!alive) return; setUser(u);
        const [profiles, nutProfiles, metrics] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.NutritionProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.BodyMetrics.filter({ user_id: u.id }, "-day_key", 1).catch(() => []),
        ]);
        if (!alive) return;
        setProfile((profiles || []).filter(Boolean)[0] || null);
        setNutritionProfile((nutProfiles || []).filter(Boolean)[0] || null);
        setBodyMetrics((metrics || []).filter(Boolean)[0] || null);
        await Promise.all([loadSummary(u, todayKey()), loadRecents(u), loadWeek(u), loadKitchen(u), loadInsights(u)]);
        try { unsubHydration = base44.entities.HydrationLog.subscribe(() => loadSummary(u, todayKey())); } catch { /* no-op */ }
        try { unsubMeals = base44.entities.MealLog.subscribe(() => { loadSummary(u, todayKey()); loadRecents(u); }); } catch { /* no-op */ }
      } catch { /* unauth / offline — render gracefully */ }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; unsubHydration?.(); unsubMeals?.(); };
  }, [loadSummary, loadRecents, loadWeek, loadKitchen, loadInsights]);

  // ── writers (all persist, optimistic + rollback) ───────────────────────────
  const reLog = useCallback(async (name, mealType) => {
    const text = (name || "").trim(); if (!user || !text) return;
    const slot = mealType || inferMealTypeFromTime();
    const est = mealEstimate(text, slot);
    const ai_analysis = est ? { summary: { calories: est.kcal, protein_g: est.protein_g, carbs_g: est.carbs_g, fat_g: est.fat_g, fiber_g: est.fiber_g, iron_mg: est.iron_mg, folate_ug: est.folate_ug, calcium_mg: est.calcium_mg }, estimated: true } : undefined;
    const temp = { id: "tmp" + Date.now(), slot, title: text, kcal: est ? est.kcal : 0 };
    setDayMeals((l) => [...l, temp]);
    if (est) setSummary((s) => ({ ...s, kcal: Math.round((s.kcal || 0) + est.kcal), meals: (s.meals || 0) + 1 }));
    flash(est ? `Added — about ${est.kcal} kcal` : "Added to today");
    try {
      await withTimeout(base44.entities.MealLog.create({ user_id: user.id, day_key: todayKey(), logged_at: nowISO(), meal_type: slot, method: "text", raw_text: text, ai_analysis }), 6000, "save");
      loadSummary(user, todayKey()); loadRecents(user);
    } catch { setDayMeals((l) => l.filter((m) => m.id !== temp.id)); loadSummary(user, todayKey()); flash("Couldn't add — try again"); }
  }, [user, loadSummary, loadRecents]);

  const removeMeal = useCallback(async (meal) => {
    if (!user || !meal?.id) return;
    setDayMeals((l) => l.filter((m) => m.id !== meal.id));
    setDayMealRows((r) => r.filter((x) => x.id !== meal.id));
    setSummary((s) => ({ ...s, kcal: Math.max(0, Math.round((s.kcal || 0) - (meal.kcal || 0))), meals: Math.max(0, (s.meals || 0) - 1) }));
    flash("Removed from today");
    try { await withTimeout(base44.entities.MealLog.delete(meal.id), 6000, "remove"); loadSummary(user, todayKey()); loadRecents(user); }
    catch { loadSummary(user, todayKey()); flash("Couldn't remove — try again"); }
  }, [user, loadSummary, loadRecents]);

  const addWater = useCallback(async (ml) => {
    if (!user || !ml) return;
    setSummary((s) => ({ ...s, hydrationMl: (s.hydrationMl || 0) + ml }));
    flash(`+${ml} ml water`);
    try { await withTimeout(base44.entities.HydrationLog.create({ user_id: user.id, day_key: todayKey(), amount_ml: ml, logged_at: nowISO(), source: "quick" }), 6000, "save"); loadSummary(user, todayKey()); }
    catch { loadSummary(user, todayKey()); flash("Couldn't add water — try again"); }
  }, [user, loadSummary]);

  const toggleShop = useCallback(async (item) => {
    if (!user || !item?.id) return;
    const next = !item.is_checked;
    setShopItems((l) => l.map((r) => r.id === item.id ? { ...r, is_checked: next } : r));
    try { await withTimeout(base44.entities.ShoppingList.update(item.id, { is_checked: next }), 6000, "save"); }
    catch { setShopItems((l) => l.map((r) => r.id === item.id ? { ...r, is_checked: !next } : r)); flash("Couldn't update — try again"); }
  }, [user]);

  const jumpTo = (idx) => {
    setJumpOpen(false);
    sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const track = sliderRef.current?.querySelector(".fw-clipboard-track"); if (!track) return;
    const boards = [...track.children].filter((c) => c.offsetWidth > 40);
    const child = boards[idx]; if (child) track.scrollLeft = child.offsetLeft - track.offsetLeft;
  };

  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, sky = cwOf("sky").petal;
  const dinner = suggestedDinner(mealPlan, savedRecipes, profile);
  const BOARDS = [{ t: "Eat today", sub: "Plate · log · water · plan" }, { t: "Plan & explore", sub: "Recipes · week · shop · progress · insights" }];

  // First name for the hero — fall back to "Your plate" if it looks like a handle/username.
  const rawFirst = (user?.full_name || "").split(" ")[0] || "";
  const firstName = (/\d/.test(rawFirst) || rawFirst.length > 16) ? "" : (rawFirst ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1) : "");

  if (loading) {
    return (
      <div style={{ ...PAPER_BG, minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ display: "grid", placeItems: "center", gap: 12, color: T.muted }}>
          <Loader size={26} color={cwOf("sage").petal} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16 }}>Tending your day…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      <TopChrome onJump={() => setJumpOpen(true)} onCalendar={() => setCalOpen(true)} />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }} className="fw-elite-in">
        {/* lush flora hero — phase bloom + bouquet + resting creature */}
        <FwFloraHero title={firstName ? `${firstName}'s plate` : "Your plate"} colorway={ph.cw} bloom={ph.bloom} flankL="chamomile" flankR="sunflower" titleColor={OXBLOOD} creature="bee"
          line="Nourishment is a relationship, not a test. Log in seconds; everything else is one tap from a titled board." />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -6, marginBottom: 2 }}>
          <Bouquet items={[{ form: ph.bloom, colorway: ph.cw }, { form: "fern", colorway: "sage" }, { form: "marigold", colorway: "gold" }]} size={150} animate idx="elite-bq" />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "2px 0 16px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>
            {phaseKey ? `${phaseLabel(phaseKey)}${cycleDay ? ` · Day ${cycleDay}` : ""}` : stageLabel(profile)}
          </span>
        </div>

        <SummaryCard eyebrow="Today, at a glance" accent={gold} rows={[
          { Icon: Flame, label: "Energy", text: `${summary.kcal} of ${calorieTarget} kcal · room for ${kcalLeft} more`, onClick: () => jumpTo(0) },
          { Icon: ListChecks, label: "Macros", text: `Protein ${macroSums.protein}/${proteinTarget}g · fibre ${macroSums.fibre}/${fibreTarget}g · iron ${macroSums.iron}/${ironTarget}mg`, onClick: () => jumpTo(0) },
          { Icon: Droplet, label: "Water", text: `${glasses} of ${glassesTarget} glasses today`, onClick: () => jumpTo(0) },
        ]} />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setLoggerOpen(true)} className="fw-elite-press" style={focusPill(T.crimson)}><UtensilsCrossed size={16} /> Log a meal</button>
          <button onClick={() => addWater(WATER_GLASS_ML)} className="fw-elite-press" style={focusPill(sky)}><Droplet size={16} /> Log water</button>
        </div>

        <div ref={sliderRef} style={{ marginTop: 16, position: "relative" }}>
          <SliderArrows sliderRef={sliderRef} />
          <ClipboardSlider hint="Slide your kitchen →" accent={gold}>

            {/* ── BOARD 1 — EAT TODAY ─────────────────────────────────────── */}
            <Clipboard title="Eat today" sub="YOUR PLATE · LOG · WATER · PLAN" accent={gold} flower="marigold" idx="cb-eat" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={gold} bottomAccent={sage}
                  top={[
                    <Panel key="plate" label="Your plate" Icon={Salad} accent={gold}><PlateLens kcal={summary.kcal} target={calorieTarget} kcalLeft={kcalLeft} macros={macroSums} proteinTarget={proteinTarget} fibreTarget={fibreTarget} ironTarget={ironTarget} basis={targets.derived ? targets.basis : null} /></Panel>,
                    <Panel key="logged" label="Logged today" Icon={ListChecks} accent={gold}><LoggedLens meals={dayMeals} onRemove={removeMeal} onLog={() => setLoggerOpen(true)} /></Panel>,
                    <Panel key="methods" label="Quick log" Icon={UtensilsCrossed} accent={gold}><MethodsLens onLog={() => setLoggerOpen(true)} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="water" label="Water" Icon={Droplet} accent={sky}><WaterLens glasses={glasses} target={glassesTarget} onAdd={addWater} /></Panel>,
                    <Panel key="recents" label="Recents" Icon={Repeat} accent={sage}><RecentsLens recents={recents} onReLog={reLog} onLog={() => setLoggerOpen(true)} /></Panel>,
                    <Panel key="plan" label="My plan" Icon={Target} accent={sage}><MyPlanLens proteinTarget={proteinTarget} carbsTarget={carbsTarget} fatTarget={fatTarget} fibreTarget={fibreTarget} ironTarget={ironTarget} glassesTarget={glassesTarget} profile={profile} basis={targets.basis} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 2 — PLAN & EXPLORE ────────────────────────────────── */}
            <Clipboard title="Plan & explore" sub="RECIPES · WEEK · SHOP · PROGRESS · INSIGHTS" accent={sage} flower="iris" idx="cb-plan" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={cwOf("plum").petal}
                  top={[
                    <Panel key="plan" label="Meal plan" Icon={CalendarDays} accent={sage}><MealPlanLens mealPlan={mealPlan} dinner={dinner} onLog={() => reLog(dinner.name, "dinner")} onOpen={() => setCalOpen(true)} /></Panel>,
                    <Panel key="recipes" label="Recipes" Icon={BookOpen} accent={sage}><RecipesLens recipes={savedRecipes} onReLog={reLog} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="shop" label="Shopping list" Icon={ShoppingBasket} accent={cwOf("plum").petal}><ShoppingLens items={shopItems} onToggle={toggleShop} /></Panel>,
                    <Panel key="progress" label="Progress" Icon={TrendingUp} accent={cwOf("plum").petal}><ProgressLens weekKcal={weekKcal} phaseKey={phaseKey} phase={ph} /></Panel>,
                    <Panel key="insights" label="Insights" Icon={Sparkles} accent={cwOf("plum").petal}><InsightsLens jess={insightText || jessLine(profile)} nudges={stageNudges(profile)} stage={stageLabel(profile)} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "18px 0 0" }}><Pollinator kind="bee" size={32} color={T.gold} color2={cwOf(ph.cw).tip} pattern="bands" animate idx="elite-close" /></div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 300, lineHeight: 1.55 }}>One nourishing thing is plenty. A guide for your day, never a cap.</p>
      </div>

      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {calOpen && <CalendarOverlay user={user} profile={profile} onClose={() => setCalOpen(false)} />}
      {loggerOpen && user && (
        <SheetShell title="Log a meal" eyebrowText="Snap · Say · Scan · Search · Recents" accent={T.crimson} onClose={() => setLoggerOpen(false)}>
          <UnifiedLogger user={user} profile={profile} onLogged={() => { loadSummary(user, todayKey()); loadRecents(user); setLoggerOpen(false); flash("Added to today"); }} />
        </SheetShell>
      )}
      {toast && <div className="fw-elite-in" style={{ position: "fixed", left: "50%", bottom: "calc(110px + env(safe-area-inset-bottom))", transform: "translateX(-50%)", zIndex: 9999, background: T.ink, color: T.paperHi, fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "10px 16px", borderRadius: 999, boxShadow: "0 4px 16px rgba(11,8,5,0.3)" }}>{toast}</div>}
    </div>
  );
}

// ── lens components (real-data-driven) ───────────────────────────────────────
function Ring({ value, guide, size = 116, color }) {
  const pct = guide > 0 ? Math.min(100, Math.round((value / guide) * 100)) : 0;
  const R = (size - 18) / 2, C = 2 * Math.PI * R, off = C * (1 - pct / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={T.paperDeep} strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div><div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: T.ink, lineHeight: 1 }}>{value}</div><div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>kcal</div></div>
      </div>
    </div>
  );
}
function MacroBar({ label, had, guide, unit, cw }) {
  const c = cwOf(cw).petal, p = guide > 0 ? Math.min(100, Math.round((had / guide) * 100)) : 0;
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 11.5, marginBottom: 3 }}>
        <span style={{ color: T.ink, fontWeight: 600 }}>{label}</span><span style={{ color: T.muted }}>{had}<span style={{ opacity: 0.6 }}> / {guide}{unit}</span></span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: T.paperDeep, overflow: "hidden" }}><div style={{ width: `${p}%`, height: "100%", background: c, borderRadius: 99 }} /></div>
    </div>
  );
}
function PlateLens({ kcal, target, kcalLeft, macros, proteinTarget, fibreTarget, ironTarget, basis }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        <Ring value={kcal} guide={target} color={cwOf("gold").petal} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <MacroBar label="Protein" had={macros.protein} guide={proteinTarget} unit="g" cw="crimson" />
          <MacroBar label="Fibre" had={macros.fibre} guide={fibreTarget} unit="g" cw="sage" />
          <MacroBar label="Iron" had={macros.iron} guide={ironTarget} unit="mg" cw="gold" />
        </div>
      </div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, margin: "4px 2px 0", lineHeight: 1.45 }}>
        {basis ? `${basis} — ` : ""}a guide for the day, never a cap. Room for {kcalLeft} more if you'd like it.
      </p>
    </div>
  );
}
function LoggedLens({ meals, onRemove, onLog }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {meals.length === 0 && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "2px 0 10px", lineHeight: 1.45 }}>Nothing logged yet — tap below to add your first.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{meals.map((m) => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 9, ...subCard(cwOf("gold").petal), padding: "9px 11px" }}>
          {m.slot && <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: cwOf("gold").petal, width: 62, flexShrink: 0 }}>{m.slot}</span>}
          <span style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.25 }}>{m.title}</span>
          {m.kcal > 0 && <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, flexShrink: 0 }}>{m.kcal} kcal</span>}
          <button onClick={() => onRemove(m)} aria-label="Remove" className="fw-elite-press" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, flexShrink: 0 }}><X size={15} /></button>
        </div>
      ))}</div>
      <div style={{ marginTop: "auto", paddingTop: 10 }}><Pill Icon={Plus} cw="crimson" filled onClick={onLog}>Log another meal</Pill></div>
    </div>
  );
}
const METHODS = [
  { id: "search", label: "Search", Icon: Search, cw: "gold", sub: "food database" },
  { id: "recents", label: "Recents", Icon: Repeat, cw: "sage", sub: "your go-tos" },
  { id: "favourites", label: "Favourites", Icon: Star, cw: "gold", sub: "saved meals" },
  { id: "snap", label: "Snap a photo", Icon: Camera, cw: "plum", sub: "vision estimate" },
  { id: "say", label: "Say it", Icon: Mic, cw: "sage", sub: "speak your meal" },
  { id: "scan", label: "Scan barcode", Icon: ScanLine, cw: "crimson", sub: "packaged food" },
];
function MethodsLens({ onLog }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 10px", lineHeight: 1.45 }}>In seconds — tap how you'd like to log.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>{METHODS.map((m) => {
        const c = cwOf(m.cw).petal;
        return (
          <button key={m.id} onClick={onLog} className="fw-elite-press" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "11px 4px", borderRadius: 12, background: `${c}10`, border: `1px solid ${c}44`, cursor: "pointer" }}>
            <m.Icon size={17} color={c} /><span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.ink, textAlign: "center", lineHeight: 1.1 }}>{m.label}</span>
          </button>
        );
      })}</div>
      <div style={{ marginTop: "auto", paddingTop: 10 }}><Pill Icon={UtensilsCrossed} cw="crimson" filled onClick={onLog}>Open the logger</Pill></div>
    </div>
  );
}
function WaterLens({ glasses, target, onAdd }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>Hydration</span>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: cwOf("sky").petal }}>{glasses} / {target} glasses</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>{Array.from({ length: target }, (_, i) => (
        <span key={i} style={{ width: 18, height: 24, borderRadius: "3px 3px 7px 7px", border: `1px solid ${cwOf("sky").petal}`, background: i < glasses ? cwOf("sky").petal : "transparent" }} />
      ))}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onAdd(250)} className="fw-elite-press" style={waterPill}><Droplet size={14} /> +250 ml</button>
        <button onClick={() => onAdd(500)} className="fw-elite-press" style={waterPill}><Droplet size={14} /> +500 ml</button>
      </div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Every sip counts — half a glass is still a glass.</p>
    </div>
  );
}
function RecentsLens({ recents, onReLog, onLog }) {
  const list = (recents || []).filter(Boolean);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ ...lbl, marginBottom: 8 }}>Your go-tos — tap to log</div>
      {list.length === 0 && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 8px" }}>No recents yet — log a meal and it'll appear here for one-tap re-logging.</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{list.map((r) => (
        <button key={r.id} onClick={() => onReLog(r.name)} className="fw-elite-press" style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.ink }}>{r.name}</button>
      ))}</div>
      <div style={{ marginTop: "auto", paddingTop: 10 }}><Pill Icon={Plus} cw="sage" onClick={onLog}>Add a recent</Pill></div>
    </div>
  );
}
const PLAN_ROWS = (p) => [
  { label: "Protein", v: `${p.proteinTarget} g`, cw: "crimson", Icon: Beef },
  { label: "Carbs", v: `${p.carbsTarget} g`, cw: "gold", Icon: Wheat },
  { label: "Fat", v: `${p.fatTarget} g`, cw: "sage", Icon: Apple },
  { label: "Fibre", v: `${p.fibreTarget} g`, cw: "sage", Icon: Leaf },
  { label: "Iron", v: `${p.ironTarget} mg`, cw: "gold", Icon: Flame },
  { label: "Water", v: `${p.glassesTarget} glasses`, cw: "sky", Icon: Droplet },
];
function MyPlanLens(p) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>{PLAN_ROWS(p).map((t) => (
        <div key={t.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 70, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "9px 5px" }}>
          <t.Icon size={15} color={cwOf(t.cw).petal} /><span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: T.ink, marginTop: 4 }}>{t.v}</span><span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>{t.label}</span>
        </div>
      ))}</div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, textAlign: "center", lineHeight: 1.45 }}>{stageLabel(p.profile)} — gentle targets {p.basis ? `(${p.basis})` : ""}. Nothing here is pass/fail.</p>
    </div>
  );
}
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function MealPlanLens({ mealPlan, dinner, onLog, onOpen }) {
  const planDays = (mealPlan?.plan_days || []).filter(Boolean);
  const todayIdx = (new Date().getDay() + 6) % 7;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, margin: "0 0 10px", lineHeight: 1.45 }}>A gentle week for your stage — edit and regenerate in the calendar.</p>
      {planDays.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>{planDays.slice(0, 4).map((d) => {
          const cell = d?.dinner; const name = Array.isArray(cell) ? cell[0] : (typeof cell === "string" ? cell : cell?.name);
          return (
            <div key={d.day} style={{ display: "flex", alignItems: "center", gap: 9, ...subCard(d.day === todayIdx ? cwOf("sage").petal : T.paperDeep), padding: "7px 10px" }}>
              <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: cwOf("sage").petal, width: 34 }}>{DOW[d.day] || "—"}</span>
              <span style={{ flex: 1, fontFamily: SERIF, fontSize: 14, color: T.ink }}>{name || "—"}</span>
            </div>
          );
        })}</div>
      ) : (
        <div style={{ ...subCard(cwOf("sage").petal), background: `${cwOf("sage").petal}10`, marginBottom: 10 }}>
          <div style={{ ...lbl, color: cwOf("sage").petal, marginBottom: 3 }}>Suggested · dinner</div>
          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{dinner.name}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{dinner.why}</div>
        </div>
      )}
      <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
        <Pill Icon={Check} cw="sage" filled onClick={onLog}>Log tonight's dinner</Pill>
        <Pill Icon={CalendarDays} cw="sage" onClick={onOpen}>Open week</Pill>
      </div>
    </div>
  );
}
function RecipesLens({ recipes, onReLog }) {
  const list = (recipes || []).filter(Boolean);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, margin: "0 0 10px", lineHeight: 1.45 }}>Cook from what you have in, or your saved recipes — tap one to log it for tonight.</p>
      {list.length === 0 && <div style={{ ...subCard(cwOf("sage").petal), background: `${cwOf("sage").petal}10`, marginBottom: 10 }}><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.ink, margin: 0, lineHeight: 1.45 }}>No saved recipes yet. Generate one for your stage, or cook from what's in.</p></div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>{list.slice(0, 4).map((r) => (
        <button key={r.id} onClick={() => onReLog(r.title, "dinner")} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", ...subCard(cwOf("sage").petal), padding: "9px 11px", cursor: "pointer" }}>
          <BookOpen size={14} color={cwOf("sage").petal} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 14.5, color: T.ink }}>{r.title}</span>
          {r.rating > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontFamily: UI, fontSize: 12, color: cwOf("gold").petal, flexShrink: 0 }}><Star size={11} /> {r.rating}</span>}
        </button>
      ))}</div>
      <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
        <Pill Icon={Carrot} cw="sage">Cook what's in</Pill>
        <Pill Icon={Sparkles} cw="gold">Generate</Pill>
      </div>
    </div>
  );
}
const AISLE_ORDER = ["Produce", "Protein", "Dairy", "Bakery", "Cupboard", "Frozen", "Other"];
function ShoppingLens({ items, onToggle }) {
  const list = (items || []).filter(Boolean);
  const groups = {};
  list.forEach((it) => { const a = it.aisle || it.category || "Other"; (groups[a] = groups[a] || []).push(it); });
  const aisles = Object.keys(groups).sort((a, b) => AISLE_ORDER.indexOf(a) - AISLE_ORDER.indexOf(b));
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {list.length === 0 && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, margin: "2px 0 10px", lineHeight: 1.45 }}>Your list is empty — build one from your plan, and tick it off as you shop.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{aisles.map((a) => (
        <div key={a}>
          <div style={{ ...lbl, color: cwOf("plum").petal, marginBottom: 6 }}>{a}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>{groups[a].map((it) => (
            <button key={it.id} onClick={() => onToggle(it)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", ...subCard(it.is_checked ? cwOf("sage").petal : T.paperDeep), padding: "7px 10px", cursor: "pointer", opacity: it.is_checked ? 0.65 : 1 }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${it.is_checked ? cwOf("sage").petal : T.paperDeep}`, background: it.is_checked ? cwOf("sage").petal : "transparent", display: "grid", placeItems: "center" }}>{it.is_checked && <Check size={12} color="#fff" />}</span>
              <span style={{ flex: 1, fontFamily: SERIF, fontSize: 14.5, color: T.ink, textDecoration: it.is_checked ? "line-through" : "none" }}>{it.name || it.item || it.title}</span>
            </button>
          ))}</div>
        </div>
      ))}</div>
    </div>
  );
}
function Sparkbars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.kcal));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 52, marginTop: 8 }}>
      {data.map((d, i) => <div key={d.key} style={{ flex: 1, height: `${Math.max(4, Math.round((d.kcal / max) * 100))}%`, background: i === data.length - 1 ? T.crimson : cwOf("gold").petal, borderRadius: "4px 4px 0 0", opacity: d.days ? 0.9 : 0.3 }} />)}
    </div>
  );
}
function ProgressLens({ weekKcal, phaseKey, phase }) {
  const logged = (weekKcal || []).filter((d) => d.days).length;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ ...lbl, color: cwOf("gold").petal, marginBottom: 4 }}>This week</div>
      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, margin: "0 0 4px", lineHeight: 1.4 }}>You logged on {logged} of 7 days — no scores here, just the pattern.</p>
      <Sparkbars data={weekKcal || []} />
      <div style={{ ...subCard(cwOf("plum").petal), marginTop: 12 }}>
        <div style={{ ...lbl, color: cwOf("plum").petal, marginBottom: 3 }}>Cycle lens</div>
        <p style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, margin: 0, lineHeight: 1.45 }}>{phaseKey ? `Across your ${phaseLabel(phaseKey).toLowerCase()} days — ${phase.note}` : "Add your cycle dates to see how your plate shifts across phases."}</p>
      </div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Patterns, not pass/fail — track what helps you.</p>
    </div>
  );
}
function InsightsLens({ jess, nudges, stage }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ ...subCard(cwOf("sage").petal), background: `${cwOf("sage").petal}10`, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}><span style={{ width: 22, height: 22, borderRadius: 999, background: cwOf("sage").petal, display: "grid", placeItems: "center" }}><Leaf size={12} color="#fff" /></span><span style={{ ...lbl, color: cwOf("sage").petal }}>Jess · your week</span></div>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, margin: 0, lineHeight: 1.5 }}>{jess}</p>
      </div>
      <div style={{ ...lbl, marginBottom: 7 }}>For your stage · {stage}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{nudges.map((n) => (
        <div key={n.label} style={{ display: "flex", alignItems: "flex-start", gap: 9, ...subCard(cwOf(n.cw).petal), padding: "8px 11px" }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: `${cwOf(n.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><n.Icon size={13} color={cwOf(n.cw).petal} /></span>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{n.label}</div><div style={{ fontFamily: UI, fontSize: 12, color: T.muted, lineHeight: 1.3 }}>{n.foods} — {n.why}</div></div>
        </div>
      ))}</div>
    </div>
  );
}

const waterPill = { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, background: `${cwOf("sky").petal}1f`, border: `1px solid ${cwOf("sky").petal}`, borderRadius: 999, padding: "9px 0", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: cwOf("sky").petal };

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
import {
  UtensilsCrossed, Droplet, Target, BookOpen, CalendarDays,
  ShoppingBasket, TrendingUp, Sparkles, ChevronLeft, ChevronRight, Leaf, Plus,
} from "lucide-react";
import {
  T, UI, SERIF, Eyebrow, Rule, Script, Hand, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";
import { getMealSummary } from "@/utils/nutritionAiAnalysis";
import { HubSheet, SoftBar, Ring, SurfaceCard } from "@/components/nutrition/hub/HubShell";

import NutritionTodayTab from "../components/nutrition/NutritionTodayTab";
import NutritionPlanTab from "../components/nutrition/NutritionPlanTab";
import NutritionProgressTab from "../components/nutrition/NutritionProgressTab";
import NutritionInsightsTab from "../components/nutrition/NutritionInsightsTab";
import RecipeGeneratorTab from "../components/nutrition/RecipeGeneratorTab";
import MealPlanGeneratorTab from "../components/nutrition/MealPlanGeneratorTab";
import ShoppingListTab from "../components/nutrition/ShoppingListTab";

const COL = 430;     // phone column (matches NutritionDemo1 — bigger cards)
const CARD_W = 365;  // ~85vw — Demo-1-large; next card still peeks at the right edge
const GAP = 14;

// Surface registry — id + meta drives the slider cards AND the sheets. The id
// matches the ?tab= deep-link target so links land on the right surface.
const SURFACES = [
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

export default function NutritionHub() {
  useEditorialFonts();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openSheet, setOpenSheet] = useState(null);   // surface id or null
  const [active, setActive] = useState(0);            // slider index

  // Home summary (real MealLog + HydrationLog for the selected day)
  const [summary, setSummary] = useState({ kcal: 0, meals: 0, hydrationMl: 0, lastMeal: null });
  // the selected day's logged meals (real, for the Today card's inline list)
  const [dayMeals, setDayMeals] = useState([]);
  // distinct recent meals across history (real, for the "one tap to re-add" chips)
  const [recents, setRecents] = useState([]);
  // a saved meal plan + shopping list + saved recipes for the richer cards (real)
  const [mealPlan, setMealPlan] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);

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
    const kcal = safeMeals.reduce((sum, m) => sum + (getMealSummary(m).summary?.calories || 0), 0);
    const hydrationMl = (hydration || []).filter(Boolean).reduce((s, l) => s + (l.amount_ml || 0), 0);
    const ordered = [...safeMeals].sort((a, b) => (a.logged_at || "").localeCompare(b.logged_at || ""));
    const lastMeal = [...ordered].reverse().find((m) => m.raw_text)?.raw_text || null;
    setSummary({ kcal: Math.round(kcal), meals: safeMeals.length, hydrationMl, lastMeal });
    // the day's logged meals as a calm inline list (slot · title · kcal) — all real
    setDayMeals(
      ordered
        .filter((m) => m.raw_text)
        .map((m) => ({
          id: m.id,
          slot: m.meal_type || "meal",
          title: m.raw_text,
          kcal: getMealSummary(m).summary?.calories || 0,
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

  // a saved meal plan + its shopping list + saved recipes for the richer cards (real)
  const loadKitchen = useCallback(async (u) => {
    if (!u) return;
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const [plans, shopping, recipes] = await Promise.all([
      base44.entities.MealPlans.filter({ user_id: u.id, week_start: weekStart }).catch(() => []),
      base44.entities.ShoppingList.filter({ user_id: u.id, week_start: weekStart }).catch(() => []),
      base44.entities.MealTemplates.filter({ user_id: u.id }, "-created_date", 6).catch(() => []),
    ]);
    setMealPlan((plans || []).filter(Boolean)[0] || null);
    setShopItems((shopping || []).filter(Boolean));
    setSavedRecipes((recipes || []).filter(Boolean));
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
        const [profiles, nutProfiles, checkins] = await Promise.all([
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.NutritionProfile.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id, date: format(new Date(), "yyyy-MM-dd") }).catch(() => []),
        ]);
        if (profiles[0]) setProfile(profiles[0]);
        if (nutProfiles[0]) setNutritionProfile(nutProfiles[0]);
        if (checkins[0]) setCheckin(checkins[0]);
        // richer-card data (real, guarded — never blocks the page)
        loadRecents(u);
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
    if (user) loadSummary(user, dayKey);
  }, [user, dayKey, loadSummary]);

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

  const calorieTarget = nutritionProfile?.calories_target || nutritionProfile?.calorie_target || 2000;
  const hydrationTarget = nutritionProfile?.hydration_target_ml || 2000;
  const kcalLeft = Math.max(0, calorieTarget - summary.kcal);

  // ── the real surface for the open sheet ────────────────────────────────────
  const renderSurface = (id) => {
    if (!user) return null;
    switch (id) {
      case "today":    return <NutritionTodayTab user={user} profile={profile} nutritionProfile={nutritionProfile} dayKey={dayKey} checkin={checkin} />;
      case "plan":     return <NutritionPlanTab user={user} nutritionProfile={nutritionProfile} />;
      case "recipes":  return <RecipeGeneratorTab user={user} />;
      case "mealgen":  return <MealPlanGeneratorTab user={user} nutritionProfile={nutritionProfile} />;
      case "shopping": return <ShoppingListTab user={user} />;
      case "progress": return <NutritionProgressTab user={user} nutritionProfile={nutritionProfile} onProfileUpdated={loadNutritionProfile} />;
      case "insights": return <NutritionInsightsTab user={user} profile={profile} />;
      default:         return null;
    }
  };

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

        {/* ── greeting + day stepper ─────────────────────────────────────── */}
        <header style={{ padding: "22px 18px 12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <Eyebrow mb={4}>Wellness Studio · Nutrition</Eyebrow>
              <Script size={40} carve>your plate today</Script>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
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
        </header>

        {/* ── gentle today glance (REAL data) ────────────────────────────── */}
        <div style={{ padding: "0 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Ring value={summary.kcal} guide={calorieTarget} size={92} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, fontWeight: 600, lineHeight: 1.2 }}>
                {summary.meals === 0 ? "A fresh plate" : "Still room to nourish"}
              </div>
              <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginTop: 3 }}>
                {summary.kcal > 0
                  ? `${kcalLeft} kcal left in today’s gentle guide`
                  : `Today’s gentle guide is about ${calorieTarget} kcal`}
              </div>
              {/* hydration glance */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <Droplet size={13} color={T.sage} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: UI, fontSize: 10, color: T.muted }}>
                    <span>Hydration</span>
                    <span>{summary.hydrationMl}ml of {hydrationTarget}ml</span>
                  </div>
                  <SoftBar value={summary.hydrationMl} guide={hydrationTarget} color={T.sage} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Jess's one line ────────────────────────────────────────────── */}
        <div style={{ padding: "16px 18px 0" }}>
          <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "15px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}>
                <Leaf size={13} color={T.dusk} />
              </span>
              <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess</span>
            </div>
            <Hand size={17} color={T.paper} carve={false}>{jessLine(profile)}</Hand>
          </div>
        </div>

        {/* ── ONE primary action + ONE suggested next ────────────────────── */}
        <div style={{ padding: "14px 18px 0" }}>
          <button
            onClick={() => setOpenSheet("today")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%",
              background: T.crimson, color: T.paper, border: "none", borderRadius: 16, padding: "16px",
              cursor: "pointer", boxShadow: "0 6px 18px rgba(188,46,39,0.22)",
            }}
          >
            <UtensilsCrossed size={18} />
            <span style={{ fontFamily: UI, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Log a meal</span>
          </button>

          <button
            onClick={() => setOpenSheet("recipes")}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
              background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14,
              padding: "13px 15px", cursor: "pointer", marginTop: 10,
            }}
          >
            <span style={{ width: 38, height: 38, borderRadius: 11, background: T.ink, color: T.paper, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <BookOpen size={17} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: UI, fontSize: 9, letterSpacing: 1, color: T.muted, textTransform: "uppercase", display: "block" }}>Suggested next</span>
              <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, display: "block", lineHeight: 1.15 }}>
                {summary.lastMeal ? "Cook something that fits today" : "Find a recipe for tonight"}
              </span>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>
                Phase-friendly, from what you have in
              </span>
            </span>
          </button>
        </div>

        {/* ── THE SPINE — Hero Card Slider of surfaces ───────────────────── */}
        <div style={{ marginTop: 22 }}>
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
                onOpen={() => setOpenSheet(s.id)}
                primaryLabel={`Open ${s.label}`}
                primaryIcon={s.Icon}
              >
                <CardSummary
                  surface={s}
                  summary={summary}
                  dayMeals={dayMeals}
                  recents={recents}
                  mealPlan={mealPlan}
                  shopItems={shopItems}
                  savedRecipes={savedRecipes}
                  nutritionProfile={nutritionProfile}
                  profile={profile}
                  calorieTarget={calorieTarget}
                  hydrationTarget={hydrationTarget}
                  kcalLeft={kcalLeft}
                  jess={jessLine(profile)}
                  onOpen={setOpenSheet}
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

        {/* ── the bottom sheet — the FULL real surface ───────────────────── */}
        {openMeta && (
          <HubSheet title={openMeta.sheetTitle} eyebrow={openMeta.eyebrow} onClose={() => setOpenSheet(null)}>
            {renderSurface(openMeta.id)}
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
  surface, summary, dayMeals, recents, mealPlan, shopItems, savedRecipes,
  nutritionProfile, profile, calorieTarget, hydrationTarget, kcalLeft, jess, onOpen,
}) {
  switch (surface.id) {
    case "today":    return <TodayCard {...{ summary, dayMeals, recents, calorieTarget, hydrationTarget, kcalLeft, onOpen }} />;
    case "plan":     return <PlanCard {...{ nutritionProfile, profile, calorieTarget }} />;
    case "recipes":  return <RecipesCard {...{ savedRecipes }} />;
    case "mealgen":  return <MealgenCard {...{ mealPlan }} />;
    case "shopping": return <ShoppingCard {...{ shopItems }} />;
    case "progress": return <ProgressCard {...{ recents, dayMeals, summary }} />;
    case "insights": return <InsightsCard {...{ jess, profile }} />;
    default:         return null;
  }
}

// ── TODAY · the plate + logged meals + recents to re-add (all real) ──────────
function TodayCard({ summary, dayMeals, recents, calorieTarget, hydrationTarget, kcalLeft, onOpen }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={26} style={{ marginBottom: 2 }}>Today’s plate</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>
        {summary.meals === 0
          ? "Nothing logged yet — whenever you’re ready."
          : `${summary.meals} logged · ${kcalLeft} kcal of gentle room left.`}
      </Hand>

      <div style={{ display: "grid", gap: 11, marginBottom: 14 }}>
        <Glance label="Energy" value={`${summary.kcal} of ${calorieTarget} kcal`} v={summary.kcal} guide={calorieTarget} color={T.gold} />
        <Glance label="Hydration" value={`${summary.hydrationMl} of ${hydrationTarget} ml`} v={summary.hydrationMl} guide={hydrationTarget} color={T.sage} />
      </div>

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
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "auto" }}>
        {recents.length > 0 ? (
          <>
            <Eyebrow mb={8}>Recents — one tap to re-add</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {recents.slice(0, 5).map((r) => (
                <button key={r.id} onClick={() => onOpen("today")} style={chipBtn}>
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
function PlanCard({ nutritionProfile, profile, calorieTarget }) {
  const np = nutritionProfile || {};
  const targets = [
    np.protein_target_g ? { label: "Protein", guide: `${np.protein_target_g}g`, why: "steadies energy and holds muscle" } : null,
    np.carbs_target_g   ? { label: "Carbs",   guide: `${np.carbs_target_g}g`,   why: "your gentle daily fuel" } : null,
    np.fat_target_g     ? { label: "Healthy fats", guide: `${np.fat_target_g}g`, why: "for hormones and absorption" } : null,
    np.hydration_target_ml ? { label: "Water", guide: `${np.hydration_target_ml}ml`, why: "small and often beats one big glass" } : null,
  ].filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={24} style={{ marginBottom: 2 }}>What your body’s asking for</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>
        {stageLabel(profile)} — a guide for the week, never a cap.
      </Hand>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
        <span style={{ fontFamily: SERIF, fontSize: 30, color: T.ink, fontWeight: 600 }}>{calorieTarget}</span>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, letterSpacing: 0.5 }}>kcal · gentle energy guide</span>
      </div>

      {targets.length > 0 ? (
        <div style={{ display: "grid", gap: 12 }}>
          {targets.map((t) => (
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
function RecipesCard({ savedRecipes }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={26} style={{ marginBottom: 2 }}>Cook what you have</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>Your saved recipes — and new ones from what’s already in.</Hand>

      {savedRecipes.length > 0 ? (
        <div style={{ display: "grid", gap: 9 }}>
          {savedRecipes.slice(0, 5).map((r) => (
            <div key={r.id} style={{ borderLeft: `2px solid ${T.sage}`, paddingLeft: 11 }}>
              <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, fontWeight: 600, lineHeight: 1.2 }}>
                {r.title || r.name || "Saved recipe"}
              </div>
              {r.default_meal_type ? (
                <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>
                  {r.default_meal_type}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <Empty>No saved recipes yet. Open Recipes to generate one from what’s in your kitchen, or save a favourite — they’ll gather here.</Empty>
      )}
    </div>
  );
}

// ── AI PLAN · the real week scaffold if a MealPlan exists, else honest empty ──
function MealgenCard({ mealPlan }) {
  const days = (mealPlan?.days || []).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={26} style={{ marginBottom: 2 }}>A gentle week</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>
        {mealPlan?.plan_name ? mealPlan.plan_name : "A soft week of meals, built around your stage."}
      </Hand>

      {days.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "30px 1fr", gap: "0 8px" }}>
          {days.slice(0, 5).map((d, i) => (
            <div key={i} style={{ display: "contents" }}>
              <div style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, color: T.gold, letterSpacing: 0.5, textTransform: "uppercase", paddingTop: 9, borderTop: `1px solid ${T.paperDeep}` }}>
                {(d.day_label || `D${d.day_number || i + 1}`).slice(0, 3)}
              </div>
              <div style={{ paddingTop: 9, paddingBottom: 9, borderTop: `1px solid ${T.paperDeep}` }}>
                {[["B", d.meals?.breakfast], ["L", d.meals?.lunch], ["D", d.meals?.dinner]].map(([slot, meal]) => (
                  <div key={slot} style={{ display: "flex", gap: 7, alignItems: "baseline", marginBottom: 3 }}>
                    <span style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, color: T.muted, width: 12 }}>{slot}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 12.5, color: meal?.name ? T.ink : T.muted, lineHeight: 1.2 }}>
                      {meal?.name || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty>No plan generated this week yet. Open AI Plan to create a gentle few days around your stage and what you fancy — it lands here and feeds your shopping list.</Empty>
      )}
    </div>
  );
}

// ── SHOP · real item counts by aisle if present, else honest empty ───────────
function ShoppingCard({ shopItems }) {
  const items = (shopItems || []).filter(Boolean);
  const open = items.filter((i) => !i.is_checked);
  const byAisle = {};
  for (const it of open) {
    const aisle = it.category || "Other";
    byAisle[aisle] = (byAisle[aisle] || 0) + 1;
  }
  const aisles = Object.entries(byAisle).sort((a, b) => b[1] - a[1]);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={26} style={{ marginBottom: 2 }}>The list</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>Sorted by aisle, straight from your plan.</Hand>

      {items.length > 0 ? (
        <>
          <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: T.ink, fontWeight: 600 }}>{open.length}</div>
              <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>to get</div>
            </div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: T.ink, fontWeight: 600 }}>{items.length - open.length}</div>
              <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>ticked</div>
            </div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: T.ink, fontWeight: 600 }}>{aisles.length}</div>
              <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>aisles</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {aisles.slice(0, 6).map(([aisle, n]) => (
              <div key={aisle} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1px solid ${T.paperDeep}`, paddingTop: 7 }}>
                <span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink }}>{aisle}</span>
                <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{n} item{n === 1 ? "" : "s"}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Empty>Your list is empty. Generate a meal plan and sync it, or add items in the full list — they’ll gather here sorted by aisle.</Empty>
      )}
    </div>
  );
}

// ── PROGRESS · a gentle real sparkline + soft patterns from logged meals ─────
function ProgressCard({ recents, dayMeals, summary }) {
  // a soft real signal: kcal across the meals logged today (patterns, not scores)
  const series = dayMeals.map((m) => m.kcal).filter((n) => n > 0);
  const haveSignal = series.length >= 2;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Script size={26} style={{ marginBottom: 2 }}>Patterns, not scores</Script>
      <Hand size={14} color={T.muted} style={{ marginBottom: 12 }}>A soft line across your day — never a grade.</Hand>

      {haveSignal ? (
        <>
          <Eyebrow mb={8}>Today’s meals, by energy</Eyebrow>
          <Sparkline data={series} />
        </>
      ) : (
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
function InsightsCard({ jess, profile }) {
  const nudges = stageNudges(profile);
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Leaf size={15} color={T.sage} />
        <Eyebrow color={T.sage}>Jess · {stageLabel(profile)}</Eyebrow>
      </div>
      <Hand size={15} color={T.ink} style={{ marginBottom: 14 }}>{jess}</Hand>

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

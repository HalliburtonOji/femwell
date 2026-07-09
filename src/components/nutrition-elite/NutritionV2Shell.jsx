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
  Clock, RefreshCw, ShieldCheck, HeartHandshake, Sprout, ChefHat, ArrowRight,
  Eye, EyeOff, Dumbbell, Baby, HeartPulse, ChevronRight, PlayCircle, ChevronUp, ChevronDown, Copy, Share2, Trash2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek } from "date-fns";
import { T, SERIF, UI, PAPER_BG, SHEET_BG } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard, HeroPromoteRail, ExpandableCard, FwCard, FwCardCTA, FW_OXBLOOD } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet, Pollinator, FlowerGlyph, SprigDivider } from "@/components/brand/flora";
import MonthlyCalendarCard from "@/components/planner/MonthlyCalendarCard";
import DayDetailSheet from "@/components/planner/DayDetailSheet";
import UnifiedLogger from "@/components/nutrition/UnifiedLogger";
import CookVideo from "@/components/nutrition-elite/CookVideo";
import { getCurrentCyclePhase, phaseLabel } from "@/utils/cyclePhase";
import { deriveTargets } from "@/utils/nutritionTargets";
import { dayNutrition } from "@/utils/foodModel";
import { mealEstimate } from "@/utils/cofid";
import { getMealSummary, inferMealTypeFromTime } from "@/utils/nutritionAiAnalysis";
import { withTimeout } from "@/utils/safeEntity";
import {
  RECIPE_LIBRARY, RECIPE_FILTERS, filterRecipes, shoppingCategoryFor, pantryCategoryFor,
  recipeMatchesPantry, generateRecipe, generatePlanDays, recipeByTitle,
} from "@/data/recipeLibrary";
import { NUTRITION_MYTHS } from "@/data/nutritionMyths";
import {
  OXBLOOD, lbl, subCard, focusPill, Pill, Panel, StackedCard, BoardBody, TopChrome, SheetShell,
  JumpSheet, SliderArrows, makeCalendarOverlay, Deck,
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

// Find a cook-library recipe for any meal name — exact first, then keyword overlap (so an LLM-named
// "Lemon lentil soup" still surfaces the real "Red Lentil Soup" cook video + ingredients where it can).
const STOP_WORDS = new Set(["with", "and", "the", "your", "some", "made", "over", "into", "from", "warm", "fresh", "easy", "quick", "gentle", "little"]);
function findRecipeFor(name) {
  if (!name) return null;
  const exact = recipeByTitle(name);
  if (exact) return exact;
  const words = String(name).toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w));
  if (!words.length) return null;
  let best = null, bestScore = 0;
  for (const r of RECIPE_LIBRARY) {
    const hay = `${r.title} ${(r.ingredients || []).map((i) => i.name).join(" ")}`.toLowerCase();
    let score = 0; words.forEach((w) => { if (hay.includes(w)) score += 1; });
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return bestScore >= 1 ? best : null;
}

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

// "30 plants a week" gentle tally — count distinct plant foods named in today's MealLog raw_text.
// A soft delight, never a scoreboard. Word-list is intentionally small + forgiving.
const PLANT_WORDS = [
  "spinach", "kale", "broccoli", "carrot", "tomato", "onion", "garlic", "pepper", "celery", "potato",
  "sweet potato", "lentil", "chickpea", "bean", "pea", "mushroom", "courgette", "aubergine", "cauliflower",
  "cabbage", "leek", "beetroot", "squash", "pumpkin", "avocado", "cucumber", "rocket", "lettuce", "corn",
  "apple", "banana", "berry", "strawberr", "blueberr", "raspberr", "orange", "lemon", "lime", "mango",
  "rice", "oat", "quinoa", "barley", "wholemeal", "wholewheat", "almond", "walnut", "cashew", "seed",
  "lentils", "hummus", "ginger", "coriander", "parsley", "mint", "basil", "herb", "kimchi", "olive",
];
function countPlants(rows) {
  const text = (rows || []).map((r) => (r?.raw_text || "")).join(" ").toLowerCase();
  if (!text.trim()) return 0;
  const found = new Set();
  for (const w of PLANT_WORDS) { if (text.includes(w)) found.add(w.replace(/s$/, "")); }
  return found.size;
}

// rotating "what's for dinner tonight?" prompts — joyful, whole-life, never clinical
const TABLE_PROMPTS = [
  "What's the most comforting thing you could make tonight?",
  "Is there a dish from home you've been craving lately?",
  "What's wilting in the fridge that wants using up?",
  "Could tonight be a no-cook, assemble-on-the-sofa kind of evening?",
  "What did your nan make that you've never quite recreated?",
  "Fancy cooking something just because it's pretty?",
  "What's a 15-minute dinner that always rescues you?",
];
const TABLE_IDEAS = [
  { title: "A Sunday-roast kind of plate", note: "even on a Tuesday — roast a tray of veg and call it a feast." },
  { title: "Comfort food, fully enjoyed", note: "mac and cheese, no guilt attached. Pleasure is part of nourishment." },
  { title: "Cook something cultural", note: "a dish that tastes like belonging — Eid, Diwali, Lunar New Year, or just home." },
  { title: "Eat with someone", note: "share tonight's plate, even over a video call. Eating together is good for you." },
];

// ── +2 LEVEL-UP DATA — condition watch-lists (evidence-graded, anti-myth) + GLP-1 + feeding ──────
const CONDITIONS = [
  { id: "pcos", label: "PCOS", Icon: Sparkles, cw: "gold",
    body: "There’s no single “PCOS diet”. Gentle, regular meals with some protein and slow carbs help most — and so does inositol, found in citrus and beans. Being kind to yourself works better than any strict plan.",
    watch: ["Some protein at each meal", "Slow carbs, not no carbs", "Citrus and beans (inositol)"] },
  { id: "endo", label: "Endometriosis", Icon: Leaf, cw: "crimson",
    body: "No diet is proven to fix it. Mediterranean-style food may ease pain for some. Be wary of strict cut-out-everything diets from social media — they can do more harm than good.",
    watch: ["Oily fish and walnuts", "Fibre for gut comfort", "Easy on the gut, not strict"] },
  { id: "thyroid", label: "Thyroid", Icon: Fish, cw: "sage",
    body: "For most, Mediterranean-style food beats going fully gluten-free. Get enough selenium and iodine from food, and don’t cut things out on a whim — check with your doctor first.",
    watch: ["Brazil nuts and fish (selenium)", "Dairy and white fish (iodine)", "Eat enough — don’t under-eat"] },
  { id: "peri", label: "Perimenopause", Icon: Beef, cw: "plum",
    body: "Many women fall short on fibre, vitamin D, calcium and iron — and this is the time it matters most. Lean a little more on protein and bone-friendly food. The Nourishment letter goes deeper.",
    watch: ["Protein to keep muscle", "Calcium + vitamin D for bones", "Iron — heavier periods drain it"] },
];
const GLP1_POINTS = [
  { Icon: Beef, label: "Protein first", note: "at every meal — it keeps the muscle you’d otherwise lose" },
  { Icon: Dumbbell, label: "Add some strength training", note: "2–3× a week keeps muscle while you eat less" },
  { Icon: Droplet, label: "Keep drinking water", note: "thirst is easy to miss when you’re less hungry" },
  { Icon: Leaf, label: "Make small meals count", note: "fewer bites, so add colour and variety" },
];
// localStorage preference helpers (real, reload-surviving — no schema change, no new function)
const lsGet = (k, fb) => { try { const v = window.localStorage.getItem(k); return v == null ? fb : v; } catch { return fb; } };
const lsSet = (k, v) => { try { window.localStorage.setItem(k, v); } catch { /* private mode */ } };
const lsGetArr = (k) => { try { return JSON.parse(window.localStorage.getItem(k) || "[]"); } catch { return []; } };

// ── RECOVERED capability — the real meal-plan generator inputs (rides the EXISTING generateMealPlan fn) ──
// Body goals (NutritionProfile.goal_mode enum), cuisine, dietary/allergy hard-constraints, quick ingredients.
const GOAL_MODES = [
  { id: "energy", label: "Energy" }, { id: "tone", label: "Tone & strength" }, { id: "fat_loss", label: "Gentle fat loss" },
  { id: "hormone_support", label: "Hormone support" }, { id: "postpartum", label: "Postpartum" }, { id: "menopause", label: "Menopause" },
];
const GOAL_TO_WELLNESS = { energy: "steady energy", tone: "tone & strength", fat_loss: "gentle, sustainable fat loss", hormone_support: "hormone balance", postpartum: "postpartum recovery", menopause: "menopause support" };
const PLAN_CUISINES = ["Any", "Italian", "Indian", "Mediterranean", "Mexican", "Asian", "Middle Eastern", "British", "Caribbean", "West African"];
const PLAN_DIETARY = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Egg-Free", "Shellfish-Free", "High-Protein"];
const QUICK_PLAN_INGREDIENTS = ["chicken", "eggs", "oats", "spinach", "sweet potato", "salmon", "lentils", "chickpeas", "tofu", "avocado", "Greek yoghurt", "brown rice", "broccoli", "banana"];
// Local breakfast/snack idea pools — so the deterministic FALLBACK plan is still a full, varied
// 4-meal week (breakfast/lunch/dinner/snack) when the live generateMealPlan fn isn't reachable.
const FALLBACK_BREAKFASTS = ["Overnight oats with berries & seeds", "Greek yoghurt, banana & walnuts", "Scrambled eggs on wholegrain toast", "Spinach & mushroom omelette", "Porridge with apple & cinnamon", "Smoothie — spinach, banana, oats", "Avocado & poached egg on rye"];
const FALLBACK_SNACKS = ["Apple & a handful of almonds", "Hummus with carrot & pepper sticks", "Greek yoghurt & berries", "Oatcakes with nut butter", "A square of dark chocolate & a satsuma", "Edamame with sea salt", "Cheese & a pear"];

// ── V2 · a WRITTEN Jess summary for the Nutrition page — signal-driven + rotates every load ─────
const V2_GREETINGS = ["Hi", "Hello there", "Right then", "Okay", "Hey", "Morning"];
const V2_FUNNIES = [
  "Reminder: you don't have to earn your dinner. It's just dinner — have the nice one.",
  "Today's forecast: 100% chance you're allowed a snack.",
  "The fridge is not a report card. You're doing better than you think.",
  "Protein, a bit of colour, and something you actually like — that's the whole trick.",
  "If you do just one thing here, snap a photo of a meal. That's it, that's the task.",
  "Hydration counts even when it's tea. I don't make the rules… actually, I do.",
  "Vegetables are just edible confetti. Throw a handful at whatever you're making.",
  "You're allowed to eat the same lunch five days running. It's called having a signature dish.",
];
const pickAt = (arr, s) => (arr.length ? arr[((s % arr.length) + arr.length) % arr.length] : "");
// Module-level so they SURVIVE a remount (the platform re-mounts this route periodically); they reset
// on a real page reload — which is exactly "varies each load" for the seed, and a reliable sheet toggle.
let _v2Seed = null;
let _v2SheetOpen = false;
let _v2HeroCard = 1; // which controller card drives the hero bloom (1 = Snap → "Your plate" identity)
const v2Seed = () => { if (_v2Seed === null) _v2Seed = Math.floor(Math.random() * 100000); return _v2Seed; };
function nutritionJessSummary(seed, ctx) {
  const { firstName, kcalLeft, glasses, glassesTarget, phaseKey, hasPlan, numbersOff, plants, loggedCount } = ctx;
  const signal = [];
  if (!hasPlan) signal.push("You've no meal plan yet — want me to sort the week so 6pm stops being a crisis?");
  if (glasses < Math.ceil((glassesTarget || 8) / 2)) signal.push("Water's being a bit shy today; a glass now is a kindness to tomorrow-you.");
  if (!numbersOff && kcalLeft > 400) signal.push(`There's room for roughly ${kcalLeft} kcal more — not a target, just a friendly heads-up.`);
  if (plants >= 5) signal.push(`${plants} different plants already today — your gut is basically throwing a little party.`);
  if (phaseKey === "luteal") signal.push("Luteal week: cravings are real and allowed. The dark-chocolate square is a sound decision.");
  if (phaseKey === "menstrual") signal.push("Bleed week — lean into iron and warm things, and feed yourself gently.");
  if (loggedCount === 0) signal.push("Nothing logged yet — a photo of your next plate is the whole job.");
  const g = pickAt(V2_GREETINGS, seed);
  const s = signal.length ? pickAt(signal, seed) : pickAt(V2_FUNNIES, seed + 3);
  const f = pickAt(V2_FUNNIES, seed + (signal.length ? 1 : 4));
  const lead = firstName ? `${g} ${firstName} — ` : `${g} — `;
  return { eyebrow: "Jess · your plate today", body: `${lead}${s} ${f}` };
}

// ── V2 · the top sliding row — UNIFORM-HEIGHT panels (no dead space). Slide 1 = Today-at-a-glance +
// Add-to-today · Slide 2 = the detailed Jess card (with an upward-sliding inner sheet for the deep read).
const SWIPE_H = 380;
function JessCard({ eyebrow, digest, chips, sheetSections, accent, open, onOpen, onClose }) {
  // open-state is LIFTED to the parent (stable across the page's frequent re-renders) so the sheet is reliable
  return (
    <FwCard snap={false} minHeight={SWIPE_H} accent={accent} Icon={Leaf} eyebrow={eyebrow} flower="camellia" idx="v2-jess">
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{digest}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{chips.map((c) => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: `${cwOf(c.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><c.Icon size={13} color={cwOf(c.cw).petal} /></span>
            <span style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 13.5, color: T.ink, lineHeight: 1.3 }}><b style={{ color: cwOf(c.cw).petal, fontFamily: UI, fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", marginRight: 6 }}>{c.label}</b>{c.text}</span>
          </div>
        ))}</div>
        <div style={{ marginTop: "auto", paddingTop: 12 }}>
          <button onClick={onOpen} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontFamily: UI, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Open Jess's full read <ChevronUp size={16} /></button>
        </div>
      </div>
      {/* upward-sliding inner sheet — slides up WITHIN the card so it holds much more without growing it */}
      <div style={{ position: "absolute", top: -20, left: -20, right: -20, bottom: -20, background: T.paperHi, transform: open ? "translateY(0)" : "translateY(101%)", transition: "transform .34s cubic-bezier(.32,.72,.24,1)", zIndex: 6, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 20px 10px", borderBottom: `1px solid ${T.paperDeep}` }}>
          <Leaf size={15} color={accent} />
          <span style={{ flex: 1, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: FW_OXBLOOD }}>Jess's full read</span>
          <button onClick={onClose} aria-label="Close" className="fw-elite-press" style={{ width: 30, height: 30, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.muted, cursor: "pointer", display: "grid", placeItems: "center" }}><ChevronDown size={17} /></button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "13px 20px 18px", display: "flex", flexDirection: "column", gap: 15 }}>{sheetSections.map((s) => (
          <div key={s.title}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}><span style={{ width: 24, height: 24, borderRadius: 7, background: `${cwOf(s.cw).petal}1F`, display: "grid", placeItems: "center" }}><s.Icon size={12} color={cwOf(s.cw).petal} /></span><span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: cwOf(s.cw).petal }}>{s.title}</span></div>
            <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5, margin: 0 }}>{s.body}</p>
            {s.action && <div style={{ marginTop: 8 }}>{s.action}</div>}
          </div>
        ))}</div>
      </div>
    </FwCard>
  );
}
function JessGlanceSwipe({ accent, glancePanel, jessPanel }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);
  const onScroll = () => { const el = ref.current; if (!el) return; setIdx(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))); };
  const go = (i) => { const el = ref.current; if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" }); };
  return (
    <div>
      <div ref={ref} onScroll={onScroll} className="fw-v2-swipe" style={{ display: "flex", alignItems: "stretch", overflowX: "auto", scrollSnapType: "x mandatory", gap: 12, WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}>
        <style>{`.fw-v2-swipe{scrollbar-width:none}.fw-v2-swipe::-webkit-scrollbar{display:none}`}</style>
        <div style={{ flex: "0 0 100%", scrollSnapAlign: "center", minWidth: 0 }}>{glancePanel}</div>
        <div style={{ flex: "0 0 100%", scrollSnapAlign: "center", minWidth: 0 }}>{jessPanel}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
        {[0, 1].map((i) => <button key={i} onClick={() => go(i)} aria-label={i === 0 ? "Today at a glance" : "Jess's read"} style={{ width: idx === i ? 16 : 6, height: 6, borderRadius: 999, background: idx === i ? accent : T.paperDeep, border: "none", cursor: "pointer", transition: "width .2s" }} />)}
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted, marginLeft: 4 }}>{idx === 0 ? "swipe for Jess's read →" : "← today's glance"}</span>
      </div>
    </div>
  );
}

// ── V2 · below-main = a horizontal row of COMPACT one-line cards. Every one is a real jump/action. ──
function V2QuickRow({ items }) {
  return (
    <div className="fw-v2-quick" style={{ display: "flex", gap: 9, overflowX: "auto", padding: "2px 2px 8px", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}>
      <style>{`.fw-v2-quick{scrollbar-width:none}.fw-v2-quick::-webkit-scrollbar{display:none}`}</style>
      {items.map((it) => {
        const c = cwOf(it.cw).petal;
        return (
          <button key={it.label} onClick={it.onClick} className="fw-elite-press" style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 9, background: `linear-gradient(160deg, ${T.paperHi} 0%, ${c}12 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c}`, borderRadius: 13, padding: "10px 13px", cursor: "pointer", whiteSpace: "nowrap" }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: `${c}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><it.Icon size={13} color={c} /></span>
            <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.ink }}>{it.label}</span>
            <ChevronRight size={15} color={T.muted} />
          </button>
        );
      })}
      <span style={{ flex: "0 0 2px" }} aria-hidden />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function NutritionV2Shell() {
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
  const [pantry, setPantry] = useState([]);              // PantryItem rows (powers "cook what's in")
  const [weekKcal, setWeekKcal] = useState([]);          // 7-day energy sparkbars
  const [insightText, setInsightText] = useState(null);  // WeeklyInsights/NutritionInsight body

  // recipes lens local state
  const [recipeFilter, setRecipeFilter] = useState("all"); // All · Quick · Iron · Protein · Veg · Vegan · Comfort
  const [cookInOnly, setCookInOnly] = useState(false);     // "Cook what's in" toggle
  const [genRecipe, setGenRecipe] = useState(null);        // last "Generate"-d recipe (pinned to front)
  const [genSeed, setGenSeed] = useState(0);
  const [pantryInput, setPantryInput] = useState("");
  const [busy, setBusy] = useState(false);                 // guards generate/build actions

  // overlays
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [loggerView, setLoggerView] = useState(null); // null=home · "photo"=open straight to Snap
  const openLogger = (view) => { setLoggerView(view || null); setLoggerOpen(true); };
  const [calOpen, setCalOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false); // full-screen meal-generator overlay
  const openPlanner = () => setPlannerOpen(true);
  // V2 · seed + Jess-sheet open-state are backed by module vars so they survive the route's periodic re-mounts
  const [loadSeed] = useState(v2Seed);
  const [jessSheetOpen, setJessSheetRaw] = useState(() => _v2SheetOpen);
  const setJessSheetOpen = (v) => { _v2SheetOpen = v; setJessSheetRaw(v); };
  const [heroCard, setHeroCardRaw] = useState(() => _v2HeroCard); // tap-to-bloom hero controller
  const setHeroCard = (i) => { _v2HeroCard = i; setHeroCardRaw(i); };
  const [jumpOpen, setJumpOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const sliderRef = useRef(null);

  // ── +2 LEVEL-UP state (preferences persist to localStorage; reload-surviving) ──
  const [numbersOff, setNumbersOff] = useState(() => lsGet("fw_nutri_numbers_off", "0") === "1");
  const [condition, setCondition] = useState(() => lsGet("fw_nutri_condition", "pcos"));
  const [glp1, setGlp1] = useState(() => lsGet("fw_nutri_glp1", "0") === "1");
  const [fullness, setFullness] = useState(() => lsGet(`fw_nutri_fullness_${todayKey()}`, ""));
  const [sharedCount, setSharedCount] = useState(() => Number(lsGet("fw_nutri_shared_count", "0")) || 0);
  const setNumbersOffP = (v) => { setNumbersOff(v); lsSet("fw_nutri_numbers_off", v ? "1" : "0"); };
  const setConditionP = (v) => { setCondition(v); lsSet("fw_nutri_condition", v); };
  const setGlp1P = (v) => { setGlp1(v); lsSet("fw_nutri_glp1", v ? "1" : "0"); };
  const setFullnessP = (v) => { setFullness(v); lsSet(`fw_nutri_fullness_${todayKey()}`, v); flash("Noticed — thank you for checking in"); };

  // ── RECOVERED: meal-plan preferences (body goal · cuisine · dietary/allergy · ingredients) ──
  // Persist to localStorage (instant, reload-surviving) AND to NutritionProfile (real entity fields:
  // goal_mode, diet_preferences, allergens_avoid). Fed into the real generateMealPlan fn.
  const [planGoal, setPlanGoal] = useState(() => lsGet("fw_nutri_goalmode", ""));
  const [planCuisine, setPlanCuisine] = useState(() => lsGet("fw_nutri_cuisine", "Any"));
  const [planDietary, setPlanDietary] = useState(() => lsGetArr("fw_nutri_dietary"));
  const [planAllergens, setPlanAllergens] = useState(() => lsGetArr("fw_nutri_allergens"));
  const [planIngredients, setPlanIngredients] = useState([]); // picks + free-typed "cook from what I have"
  const [ingredientInput, setIngredientInput] = useState(""); // free-text ingredient the user types in
  const [allergyInput, setAllergyInput] = useState("");
  const [planResult, setPlanResult] = useState(null); // last generateMealPlan result (focus + tip)
  const [planHistory, setPlanHistory] = useState([]); // every saved MealPlans row (look-back history)
  const prefHydrated = useRef(false);

  // hydrate preferences from the real NutritionProfile once it loads (if the user hasn't set them locally)
  useEffect(() => {
    if (!nutritionProfile || prefHydrated.current) return;
    prefHydrated.current = true;
    if (!lsGet("fw_nutri_goalmode", "") && nutritionProfile.goal_mode) setPlanGoal(nutritionProfile.goal_mode);
    if (lsGetArr("fw_nutri_dietary").length === 0 && nutritionProfile.diet_preferences) setPlanDietary(String(nutritionProfile.diet_preferences).split(",").map((s) => s.trim()).filter(Boolean));
    if (lsGetArr("fw_nutri_allergens").length === 0 && nutritionProfile.allergens_avoid) setPlanAllergens(String(nutritionProfile.allergens_avoid).split(",").map((s) => s.trim()).filter(Boolean));
  }, [nutritionProfile]);

  // saver — best-effort write of preferences to the real NutritionProfile (create if none)
  const saveNutPref = useCallback(async (patch) => {
    if (!user) return;
    try {
      if (nutritionProfile?.id) await withTimeout(base44.entities.NutritionProfile.update(nutritionProfile.id, { ...patch, updated_at: nowISO() }), 6000, "pref");
      else { const created = await withTimeout(base44.entities.NutritionProfile.create({ user_id: user.id, ...patch, created_at: nowISO(), updated_at: nowISO() }), 6000, "pref"); setNutritionProfile(created); }
    } catch { /* localStorage already holds it */ }
  }, [user, nutritionProfile]);

  const setPlanGoalP = (v) => { const nv = v === planGoal ? "" : v; setPlanGoal(nv); lsSet("fw_nutri_goalmode", nv); saveNutPref({ goal_mode: nv || undefined }); };
  const setPlanCuisineP = (v) => { setPlanCuisine(v); lsSet("fw_nutri_cuisine", v); };
  const togglePlanDietary = (d) => { setPlanDietary((p) => { const next = p.includes(d) ? p.filter((x) => x !== d) : [...p, d]; lsSet("fw_nutri_dietary", JSON.stringify(next)); saveNutPref({ diet_preferences: next.join(", ") }); return next; }); };
  const addAllergen = (raw) => { const a = (raw || "").trim(); if (!a) return; setPlanAllergens((p) => { if (p.some((x) => x.toLowerCase() === a.toLowerCase())) return p; const next = [...p, a]; lsSet("fw_nutri_allergens", JSON.stringify(next)); saveNutPref({ allergens_avoid: next.join(", ") }); return next; }); setAllergyInput(""); };
  const removeAllergen = (a) => { setPlanAllergens((p) => { const next = p.filter((x) => x !== a); lsSet("fw_nutri_allergens", JSON.stringify(next)); saveNutPref({ allergens_avoid: next.join(", ") }); return next; }); };
  const togglePlanIngredient = (g) => setPlanIngredients((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);
  // free-text ingredient add (type your own — not just the preset chips). Accepts comma-separated too.
  const addIngredient = (raw) => {
    const parts = String(raw || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    setPlanIngredients((p) => {
      const next = [...p];
      parts.forEach((a) => { if (!next.some((x) => x.toLowerCase() === a.toLowerCase())) next.push(a); });
      return next;
    });
    setIngredientInput("");
  };
  const removeIngredient = (g) => setPlanIngredients((p) => p.filter((x) => x !== g));

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
      // newest-first across ALL weeks → powers both the active plan and the look-back history
      base44.entities.MealPlans.filter({ user_id: u.id }, "-created_date", 24).catch(() => []),
      base44.entities.ShoppingList.filter({ user_id: u.id, week_start: weekStart }).catch(() => []),
      base44.entities.MealTemplates.filter({ user_id: u.id }, "-created_date", 50).catch(() => []),
    ]);
    const allPlans = (plans || []).filter(Boolean);
    setPlanHistory(allPlans);
    // active plan = newest for THIS week (keep week semantics), else newest overall as a gentle fallback
    setMealPlan(allPlans.find((p) => p.week_start === weekStart) || allPlans[0] || null);
    setShopItems((shopping || []).filter(Boolean));
    // MealTemplates schema = { title, items:[{name, quantity_text, ...}], default_meal_type } —
    // there is NO recipe_json/category/rating. A "saved recipe" = a MealTemplates row with a title.
    const saved = (recipes || []).filter((r) => r && r.title).map((r) => ({
      id: r.id, title: r.title, items: Array.isArray(r.items) ? r.items : [],
    }));
    setSavedRecipes(saved);
  }, []);

  const loadPantry = useCallback(async (u) => {
    if (!u) return;
    const rows = await base44.entities.PantryItem.filter({ user_id: u.id }, "-created_date", 60).catch(() => []);
    setPantry((rows || []).filter(Boolean));
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
        await Promise.all([loadSummary(u, todayKey()), loadRecents(u), loadWeek(u), loadKitchen(u), loadInsights(u), loadPantry(u)]);
        try { unsubHydration = base44.entities.HydrationLog.subscribe(() => loadSummary(u, todayKey())); } catch { /* no-op */ }
        try { unsubMeals = base44.entities.MealLog.subscribe(() => { loadSummary(u, todayKey()); loadRecents(u); }); } catch { /* no-op */ }
      } catch { /* unauth / offline — render gracefully */ }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; unsubHydration?.(); unsubMeals?.(); };
  }, [loadSummary, loadRecents, loadWeek, loadKitchen, loadInsights, loadPantry]);

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

  const thisMonday = useCallback(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"), []);

  // ── Pantry (PantryItem) — add / remove, optimistic + rollback ───────────────
  const addPantry = useCallback(async (rawName) => {
    const name = (rawName || "").trim(); if (!user || !name) return;
    const category = pantryCategoryFor(name);
    const temp = { id: "tmp" + Date.now(), name, category };
    setPantry((l) => [temp, ...l]); setPantryInput(""); flash(`Added ${name} to your pantry`);
    try {
      await withTimeout(base44.entities.PantryItem.create({ user_id: user.id, name, category }), 6000, "save");
      loadPantry(user);
    } catch { setPantry((l) => l.filter((r) => r.id !== temp.id)); flash("Couldn't add — try again"); }
  }, [user, loadPantry]);

  const removePantry = useCallback(async (item) => {
    if (!user || !item?.id) return;
    const prev = pantry; setPantry((l) => l.filter((r) => r.id !== item.id));
    try { await withTimeout(base44.entities.PantryItem.delete(item.id), 6000, "remove"); }
    catch { setPantry(prev); flash("Couldn't remove — try again"); }
  }, [user, pantry]);

  // ── Shopping list: add your own item / remove an item (real ShoppingList writes, optimistic + rollback) ──
  const addShopItem = useCallback(async (rawName) => {
    const name = (rawName || "").trim(); if (!user || !name) return;
    const week_start = thisMonday();
    const category = shoppingCategoryFor(name);
    const temp = { id: "tmp" + Date.now(), user_id: user.id, week_start, ingredient_name: name, quantity_text: "", category, is_checked: false, source: "manual" };
    setShopItems((l) => [temp, ...(l || [])]);
    flash(`Added ${name}`);
    try {
      const created = await withTimeout(base44.entities.ShoppingList.create({ user_id: user.id, week_start, ingredient_name: name, quantity_text: "", category, is_checked: false, source: "manual" }), 6000, "save");
      if (created?.id) setShopItems((l) => l.map((r) => r.id === temp.id ? created : r));
    } catch { setShopItems((l) => l.filter((r) => r.id !== temp.id)); flash("Couldn't add — try again"); }
  }, [user, thisMonday]);

  const removeShop = useCallback(async (item) => {
    if (!user || !item?.id) return;
    const prev = shopItems;
    setShopItems((l) => l.filter((r) => r.id !== item.id));
    if (String(item.id).startsWith("tmp")) return; // never persisted — nothing to delete
    try { await withTimeout(base44.entities.ShoppingList.delete(item.id), 6000, "remove"); }
    catch { setShopItems(prev); flash("Couldn't remove — try again"); }
  }, [user, shopItems]);

  // ── Recipe → shopping (ShoppingList.create per ingredient) ──────────────────
  const addRecipeToShopping = useCallback(async (recipe) => {
    if (!user || !recipe) return;
    const week_start = thisMonday();
    const ings = recipe.ingredients || [];
    flash(`Adding ${ings.length} items to your shopping list…`);
    try {
      await Promise.all(ings.map((ing) => withTimeout(base44.entities.ShoppingList.create({
        user_id: user.id, week_start, ingredient_name: ing.name, quantity_text: ing.quantity_text || "",
        category: shoppingCategoryFor(ing.name), is_checked: false, source: "manual",
      }), 6000, "save").catch(() => null)));
      loadKitchen(user); flash(`Added to your shopping list`);
    } catch { flash("Couldn't add all — try again"); loadKitchen(user); }
  }, [user, loadKitchen, thisMonday]);

  // ── Recipe → log for dinner (MealLog.create, method "template") ─────────────
  const logRecipe = useCallback(async (recipe) => {
    if (!user || !recipe) return;
    flash(`Logged ${recipe.title} for dinner`);
    try {
      await withTimeout(base44.entities.MealLog.create({
        user_id: user.id, day_key: todayKey(), logged_at: nowISO(), meal_type: "dinner", method: "template",
        raw_text: recipe.title,
        ai_analysis: { summary: { calories: recipe.rough_kcal, protein_g: recipe.rough_protein_g }, estimated: true },
      }), 6000, "save");
      loadSummary(user, todayKey()); loadRecents(user);
    } catch { flash("Couldn't log — try again"); }
  }, [user, loadSummary, loadRecents]);

  // ── Save recipe (MealTemplates.create — title + items[]) ────────────────────
  const saveRecipe = useCallback(async (recipe) => {
    if (!user || !recipe) return;
    const already = (savedRecipes || []).some((r) => r.title === recipe.title);
    if (already) { flash("Already in your saved recipes"); return; }
    flash(`Saved ${recipe.title}`);
    try {
      await withTimeout(base44.entities.MealTemplates.create({
        user_id: user.id, title: recipe.title,
        items: (recipe.ingredients || []).map((ing) => ({ name: ing.name, quantity_text: ing.quantity_text || "" })),
        default_meal_type: "dinner",
      }), 6000, "save");
      loadKitchen(user);
    } catch { flash("Couldn't save — try again"); }
  }, [user, savedRecipes, loadKitchen]);

  // ── "Generate" a recipe (deterministic, stage/phase aware, no AI) ───────────
  const generateRecipeNow = useCallback(() => {
    const stage = profile?.life_stage || profile?.stage;
    const diet = recipeFilter === "veg" || recipeFilter === "vegan" ? recipeFilter : "all";
    const r = generateRecipe({ stage, phaseKey, diet, seed: genSeed });
    setGenRecipe(r); setGenSeed((s) => s + 1); setCookInOnly(false);
    flash(`Here's an idea — ${r.title}`);
  }, [profile, phaseKey, recipeFilter, genSeed]);

  // ── Meal-plan generator (MealPlans.create — plan_days) ──────────────────────
  // RECOVERED: the REAL varied meal-plan generator — rides the existing generateMealPlan fn (NO new fn),
  // 7 days × 4 meal types, honouring body goal · cuisine · dietary/allergy hard-constraints · ingredients ·
  // calorie/protein targets. Falls back to the deterministic library plan so it can never break.
  const generatePlan = useCallback(async () => {
    if (!user || busy) return;
    setBusy(true);
    flash("Building your varied week…");
    const week_start = thisMonday();
    const wellness = GOAL_TO_WELLNESS[planGoal] || (profile?.life_stage ? `${stageLabel(profile).toLowerCase()} support` : "a gentle, varied week");
    // dietary_preferences = HARD constraints: dietary tags + allergies phrased as exclusions
    const dietary = [...planDietary, ...planAllergens.map((a) => /(-|\s)free$/i.test(a) ? a : `No ${a}`)];
    const pantryNamesNow = (pantry || []).map((p) => p?.name).filter(Boolean);
    const ingredients = [...new Set([...(planIngredients || []), ...pantryNamesNow])].slice(0, 16);
    try {
      const res = await withTimeout(base44.functions.invoke("generateMealPlan", {
        mode: "meal_plan",
        wellness_goal: wellness,
        ingredients,
        duration_days: 7,
        dietary_preferences: dietary,
        included_meal_types: ["breakfast", "lunch", "dinner", "snack"],
        cuisine_preference: planCuisine && planCuisine !== "Any" ? planCuisine : undefined,
        calorie_target: nutritionProfile?.calories_target || calorieTarget,
        protein_target: nutritionProfile?.protein_target_g || proteinTarget,
      }), 45000, "meal plan");
      const data = res?.data;
      if (data?.error) throw new Error(data.error);
      const days = data?.days || [];
      if (!days.length) throw new Error("empty plan");
      const plan_days = days.map((d, i) => ({
        day: (d.day_number ? d.day_number - 1 : i) % 7,
        breakfast: d.meals?.breakfast?.name ? [d.meals.breakfast.name] : [],
        lunch: d.meals?.lunch?.name ? [d.meals.lunch.name] : [],
        dinner: d.meals?.dinner?.name ? [d.meals.dinner.name] : [],
        snack: d.meals?.snack?.name ? [d.meals.snack.name] : [],
      }));
      // Always CREATE a new row → every generated week is kept and revisitable in the history list.
      await withTimeout(base44.entities.MealPlans.create({ user_id: user.id, week_start, plan_days, wellness_goal: wellness, dietary_preferences: dietary, is_active: true, created_at: nowISO() }), 8000, "save");
      setPlanResult(data);
      // build the shopping list from the plan's real shopping_list (best-effort, capped)
      const sl = (data.shopping_list || []).filter(Boolean);
      if (sl.length) {
        try {
          const old = await base44.entities.ShoppingList.filter({ user_id: user.id, week_start, source: "meal_plan" }).catch(() => []);
          await Promise.all((old || []).map((o) => base44.entities.ShoppingList.delete(o.id).catch(() => null)));
        } catch { /* ignore */ }
        await Promise.all(sl.slice(0, 40).map((name) => withTimeout(base44.entities.ShoppingList.create({
          user_id: user.id, week_start, ingredient_name: name, quantity_text: "", category: shoppingCategoryFor(name), is_checked: false, source: "meal_plan", meal_plan_id: mealPlan?.id || "",
        }), 6000, "save").catch(() => null)));
      }
      await loadKitchen(user);
      flash("Your varied week is ready — 4 meals a day, made for you");
    } catch {
      // FALLBACK — deterministic but FULL & VARIED 4-meal week (never break the page, never "same 4 meals")
      try {
        const stage = profile?.life_stage || profile?.stage;
        const diet = planDietary.includes("Vegan") ? "vegan" : (planDietary.includes("Vegetarian") ? "veg" : "all");
        const base = generatePlanDays({ stage, phaseKey, diet });
        // rotate breakfast + snack pools per day (offset by a daily seed) so all 4 meals vary across the week
        const seed = Math.floor(Date.now() / 86400000);
        const plan_days = base.map((d, i) => ({
          ...d,
          breakfast: [FALLBACK_BREAKFASTS[(i + seed) % FALLBACK_BREAKFASTS.length]],
          snack: [FALLBACK_SNACKS[(i + seed + 2) % FALLBACK_SNACKS.length]],
        }));
        await base44.entities.MealPlans.create({ user_id: user.id, week_start, plan_days, wellness_goal: wellness, is_active: true, created_at: nowISO() }).catch(() => {});
        await loadKitchen(user);
        flash("Your week is ready");
      } catch { flash("Couldn't build the plan — try again"); }
    } finally { setBusy(false); }
  }, [user, busy, planGoal, planCuisine, planDietary, planAllergens, planIngredients, pantry, profile, phaseKey, nutritionProfile, calorieTarget, proteinTarget, mealPlan, loadKitchen, thisMonday]);

  // ── Build shopping list from this week's plan (ShoppingList.create, source meal_plan) ──
  const buildShoppingFromPlan = useCallback(async () => {
    if (!user || busy) return;
    const planDays = (mealPlan?.plan_days || []).filter(Boolean);
    if (planDays.length === 0) { flash("Generate a plan first, then build the list"); return; }
    setBusy(true);
    const week_start = thisMonday();
    // collect dinner + lunch recipe titles → their library ingredients (de-duped by name)
    const titles = new Set();
    planDays.forEach((d) => { [...(d.dinner || []), ...(d.lunch || [])].forEach((t) => { if (t) titles.add(t); }); });
    const byName = new Map();
    titles.forEach((t) => { const r = recipeByTitle(t); (r?.ingredients || []).forEach((ing) => { if (!byName.has(ing.name)) byName.set(ing.name, ing); }); });
    const ings = [...byName.values()];
    if (ings.length === 0) { setBusy(false); flash("Nothing to add from this plan"); return; }
    flash(`Building a list from your plan (${ings.length} items)…`);
    try {
      await Promise.all(ings.map((ing) => withTimeout(base44.entities.ShoppingList.create({
        user_id: user.id, week_start, ingredient_name: ing.name, quantity_text: ing.quantity_text || "",
        category: shoppingCategoryFor(ing.name), is_checked: false, source: "meal_plan", meal_plan_id: mealPlan?.id || "",
      }), 6000, "save").catch(() => null)));
      await loadKitchen(user); flash("Shopping list built from your plan");
    } catch { flash("Couldn't build the list — try again"); loadKitchen(user); }
    finally { setBusy(false); }
  }, [user, busy, mealPlan, loadKitchen, thisMonday]);

  // ── Bring a saved week back — show a past MealPlans row as the current plan (history → active view) ──
  const usePlan = useCallback((plan) => {
    if (!plan) return;
    setMealPlan(plan);
    setPlanResult(null); // the focus/tip belongs to a fresh generate, not a recalled week
    flash("Brought that week back");
  }, []);

  // ── SWAP a single meal in the active plan — updates INSTANTLY, persists to MealPlans in the background ──
  const swapMeal = useCallback((dayIdx, slot) => {
    if (!user || !mealPlan?.id) { flash("Generate a week first"); return null; }
    const days = (mealPlan.plan_days || []).filter(Boolean);
    const day = days.find((d) => d.day === dayIdx) || days[dayIdx];
    if (!day) return null;
    const current = cellName(day[slot]);
    let next = null;
    if (slot === "breakfast" || slot === "snack") {
      const pool = slot === "breakfast" ? FALLBACK_BREAKFASTS : FALLBACK_SNACKS;
      const opts = pool.filter((x) => x !== current);
      next = opts[Math.floor(Math.random() * opts.length)] || pool[0];
    } else {
      const diet = planDietary.includes("Vegan") ? "vegan" : (planDietary.includes("Vegetarian") ? "veg" : "all");
      let pool = RECIPE_LIBRARY.filter((r) => diet === "all" || (r.diet || []).includes(diet));
      if (pool.length < 2) pool = RECIPE_LIBRARY;
      const titles = pool.map((r) => r.title).filter((t) => t !== current);
      next = titles[Math.floor(Math.random() * titles.length)] || (pool[0] && pool[0].title);
    }
    if (!next || next === current) return null;
    const newDays = days.map((d) => (d.day === day.day ? { ...d, [slot]: [next] } : d));
    setMealPlan((p) => ({ ...p, plan_days: newDays })); // instant, optimistic
    flash("Swapped — a new idea");
    // persist in the background so the card/sheet never wait on the network
    withTimeout(base44.entities.MealPlans.update(mealPlan.id, { plan_days: newDays, updated_at: nowISO() }), 8000, "swap").catch(() => flash("Swapped here, but couldn't save — try again"));
    return next;
  }, [user, mealPlan, planDietary]);

  // ── Add one meal's ingredients (or the meal itself) to the shopping list — real ShoppingList write ──
  const shopMeal = useCallback(async (name) => {
    if (!user || !name) return;
    const recipe = findRecipeFor(name);
    if (recipe && (recipe.ingredients || []).length) { await addRecipeToShopping(recipe); return; }
    const week_start = thisMonday();
    flash("Adding to your shopping list…");
    try {
      await withTimeout(base44.entities.ShoppingList.create({ user_id: user.id, week_start, ingredient_name: name, quantity_text: "", category: shoppingCategoryFor(name), is_checked: false, source: "manual" }), 6000, "save");
      loadKitchen(user); flash("Added to your shopping list");
    } catch { flash("Couldn't add — try again"); }
  }, [user, addRecipeToShopping, loadKitchen, thisMonday]);

  // ── Log a whole day's plan for today — writes 4 MealLog rows (real; persists) ──
  const logPlanDay = useCallback(async (dayIdx) => {
    if (!user || !mealPlan) return;
    const days = (mealPlan.plan_days || []).filter(Boolean);
    const day = days.find((d) => d.day === dayIdx) || days[dayIdx];
    if (!day) return;
    const meals = SLOT_META.map(([slot]) => ({ slot, name: cellName(day[slot]) })).filter((m) => m.name);
    if (!meals.length) { flash("Nothing to log for this day"); return; }
    flash(`Logging ${meals.length} meals for today…`);
    try {
      await Promise.all(meals.map((m) => { const est = mealEstimate(m.name, m.slot); return withTimeout(base44.entities.MealLog.create({
        user_id: user.id, day_key: todayKey(), logged_at: nowISO(), meal_type: m.slot, method: "template", raw_text: m.name,
        ai_analysis: { summary: { calories: est.kcal, protein_g: est.protein_g, carbs_g: est.carbs_g, fat_g: est.fat_g, fiber_g: est.fiber_g, iron_mg: est.iron_mg }, estimated: true },
      }), 6000, "log").catch(() => null); }));
      loadSummary(user, todayKey()); loadRecents(user); flash("Today's plan, logged");
    } catch { flash("Couldn't log all — try again"); }
  }, [user, mealPlan, loadSummary, loadRecents]);

  // ── +2: "Same as yesterday" — re-log yesterday's real MealLog rows (creates real rows; persists) ──
  const logYesterday = useCallback(async () => {
    if (!user || busy) return;
    setBusy(true);
    const y = new Date(); y.setDate(y.getDate() - 1);
    const key = format(y, "yyyy-MM-dd");
    try {
      const rows = await base44.entities.MealLog.filter({ user_id: user.id, day_key: key }).catch(() => []);
      const meals = (rows || []).filter((r) => r && r.raw_text);
      if (meals.length === 0) { flash("Nothing logged yesterday to copy"); setBusy(false); return; }
      flash(`Copying ${meals.length} meal${meals.length === 1 ? "" : "s"} from yesterday…`);
      await Promise.all(meals.map((m) => withTimeout(base44.entities.MealLog.create({
        user_id: user.id, day_key: todayKey(), logged_at: nowISO(), meal_type: m.meal_type || "meal",
        method: "text", raw_text: m.raw_text, ai_analysis: m.ai_analysis,
      }), 6000, "save").catch(() => null)));
      await loadSummary(user, todayKey()); loadRecents(user);
      flash("Yesterday, brought forward");
    } catch { flash("Couldn't copy — try again"); }
    finally { setBusy(false); }
  }, [user, busy, loadSummary, loadRecents]);

  // ── +2: "Share to the table" — a real persisting write to JournalEntries (tagged), reload-surviving ──
  const shareToTable = useCallback(async (text) => {
    if (!user) return;
    const body = (text || dinner?.name || "Tonight's plate").toString().slice(0, 280);
    setSharedCount((n) => { const v = n + 1; lsSet("fw_nutri_shared_count", String(v)); return v; });
    flash("Shared to the table 💛");
    try {
      await withTimeout(base44.entities.JournalEntries.create({
        user_id: user.id, session_date: todayKey(), text: body,
        tags: ["kitchen-table", "shared-plate"], prompt: "Shared to the kitchen table", card_type: "free", card_color: "cream",
      }), 6000, "save");
    } catch { /* optimistic count stays; the warmth landed */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // recipes for the lens: filter pills, then "cook what's in" (pantry overlap), then pin a generated one
  const pantryNames = useMemo(() => (pantry || []).map((p) => p?.name).filter(Boolean), [pantry]);
  const recipeList = useMemo(() => {
    let list = filterRecipes(RECIPE_LIBRARY, recipeFilter);
    if (cookInOnly) list = list.filter((r) => recipeMatchesPantry(r, pantryNames));
    if (genRecipe) list = [genRecipe, ...list.filter((r) => r.youtube_id !== genRecipe.youtube_id)];
    return list;
  }, [recipeFilter, cookInOnly, pantryNames, genRecipe]);

  // distinct plant foods logged today — for the "30 plants this week" gentle tally
  const plantsToday = useMemo(() => countPlants(dayMealRows), [dayMealRows]);

  const jumpTo = (idx) => {
    setJumpOpen(false);
    sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const track = sliderRef.current?.querySelector(".fw-clipboard-track"); if (!track) return;
    const boards = [...track.children].filter((c) => c.offsetWidth > 40);
    const child = boards[idx]; if (child) track.scrollLeft = child.offsetLeft - track.offsetLeft;
  };

  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, sky = cwOf("sky").petal;
  const dinner = suggestedDinner(mealPlan, savedRecipes, profile);
  const BOARDS = [
    { t: "Eat today", sub: "Plate · log · water · plan" },
    { t: "Cook tonight", sub: "Recipes · cook videos · pantry" },
    { t: "Plan & explore", sub: "Week · shop · progress · insights" },
    { t: "For your body", sub: "Watch-list · GLP-1 · feeding · intuitive" },
    { t: "The kitchen table", sub: "Dinner tonight · 30 plants · joy" },
  ];

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
        {/* FLORAL HERO with TAP-TO-BLOOM — the small cards below it ARE the controller (same flower, different bloom stage) */}
        {(() => {
          const HERO_CARDS = [
            { id: "plan", Icon: CalendarDays, label: "Plan", title: "Your week", line: "Set it once, and 6pm sorts itself.", openness: 0.5, cw: "sage", creature: "ladybird", action: { label: "Open the planner", on: openPlanner } },
            { id: "snap", Icon: Camera, label: "Snap", title: firstName ? `${firstName}'s plate` : "Your plate", line: "A photo now, and I'll do the maths — you just eat.", openness: 0.8, cw: "gold", creature: "bee", action: { label: "Snap a photo", on: () => openLogger("photo") } },
            { id: "tonight", Icon: ChefHat, label: "Tonight", title: "Tonight", line: dinner.why || "Something warm to come home to.", openness: 1, cw: "crimson", creature: "butterfly", action: { label: "Log tonight's dinner", on: () => reLog(dinner.name, "dinner") } },
            { id: "cook", Icon: PlayCircle, label: "Cook", title: "In the kitchen", line: "Short clips you can actually cook from.", openness: 0.92, cw: "sage", creature: "dragonfly", action: { label: "Browse cook videos", on: () => jumpTo(1) } },
            { id: "body", Icon: HeartPulse, label: "Body", title: "For your body", line: "Gentle, sensible steers — never clinical.", openness: 0.66, cw: "plum", creature: "bee", action: { label: "Open for your body", on: () => jumpTo(3) } },
          ];
          const active = HERO_CARDS[heroCard] || HERO_CARDS[1];
          const aCol = cwOf(active.cw).petal;
          return (
            <>
              <FwFloraHero title={active.title} colorway={active.cw} bloom={ph.bloom} openness={active.openness} creature={active.creature} flankL="chamomile" flankR="sunflower" titleColor={OXBLOOD} line={active.line} />
              {/* controller cards — UNIFORM size — sit where the little bloom used to be; tap to re-bloom + re-title the hero */}
              <div className="fw-hero-ctl" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 2px 2px", justifyContent: "center" }}>
                <style>{`.fw-hero-ctl{scrollbar-width:none}.fw-hero-ctl::-webkit-scrollbar{display:none}`}</style>
                {HERO_CARDS.map((c, i) => { const on = i === heroCard; const col = cwOf(c.cw).petal; return (
                  <button key={c.id} onClick={() => setHeroCard(i)} aria-pressed={on} className="fw-elite-press" style={{ flex: "0 0 72px", height: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 14, cursor: "pointer", background: on ? `linear-gradient(160deg, ${T.paperHi} 0%, ${col}20 100%)` : T.paperHi, border: `1px solid ${on ? col : T.paperDeep}`, boxShadow: on ? `0 0 0 1px ${col}, 0 2px 8px ${col}30` : "0 1px 3px rgba(58,44,26,0.08)", transform: on ? "translateY(-1px)" : "none", transition: "border-color .15s, box-shadow .15s, transform .15s" }}>
                    <span style={{ width: 27, height: 27, borderRadius: 8, background: `${col}1F`, display: "grid", placeItems: "center" }}><c.Icon size={15} color={col} /></span>
                    <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: on ? col : T.muted }}>{c.label}</span>
                  </button>
                ); })}
              </div>
              {/* phase pill + the SELECTED card's primary action (log-tonight etc. stays reachable) */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "11px 0 10px" }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
                <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{phaseKey ? `${phaseLabel(phaseKey)}${cycleDay ? ` · Day ${cycleDay}` : ""}` : stageLabel(profile)}</span>
              </div>
              <button onClick={active.action.on} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: aCol, color: "#fff", border: "none", borderRadius: 14, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background .35s ease" }}>
                <active.Icon size={16} /> {active.action.label}
              </button>
            </>
          );
        })()}

        {/* 3 + 4 · TOP SLIDING ROW — uniform panels. Slide 1 = today-at-a-glance + add-to-today; Slide 2 = the detailed Jess card */}
        {(() => {
          const jess = nutritionJessSummary(loadSeed, { firstName, kcalLeft, glasses, glassesTarget, phaseKey, hasPlan: (mealPlan?.plan_days || []).filter(Boolean).length > 0, numbersOff, plants: plantsToday, loggedCount: dayMeals.length });
          const planDays = (mealPlan?.plan_days || []).filter(Boolean);
          const hasPlan = planDays.length > 0;
          const distinctDinners = new Set(planDays.map((d) => cellName(d?.dinner)).filter(Boolean)).size;
          const glanceRows = numbersOff ? [
            { Icon: Flame, cw: "gold", label: "Energy", text: "Nourished — numbers are off. You're doing lovely.", onClick: () => jumpTo(0) },
            { Icon: ListChecks, cw: "sage", label: "Balance", text: `Protein, fibre & iron tracked gently${macroSums.iron >= ironTarget ? " — iron's there" : " — a nudge for iron"}.`, onClick: () => jumpTo(0) },
            { Icon: Droplet, cw: "sky", label: "Water", text: glasses >= glassesTarget ? "Well watered today" : "A few more sips would be kind", onClick: () => jumpTo(0) },
          ] : [
            { Icon: Flame, cw: "gold", label: "Energy", text: `${summary.kcal} of ${calorieTarget} kcal · room for ${kcalLeft} more`, onClick: () => jumpTo(0) },
            { Icon: ListChecks, cw: "sage", label: "Macros", text: `Protein ${macroSums.protein}/${proteinTarget}g · fibre ${macroSums.fibre}/${fibreTarget}g · iron ${macroSums.iron}/${ironTarget}mg`, onClick: () => jumpTo(0) },
            { Icon: Droplet, cw: "sky", label: "Water", text: `${glasses} of ${glassesTarget} glasses today`, onClick: () => jumpTo(0) },
          ];
          const cravingLine = phaseKey === "menstrual" ? "Chocolate around your period is your body chasing magnesium — a couple of squares is a perfectly sensible answer." : "Sweet cravings are usually tiredness; fruit with yoghurt holds you longer than sweets alone.";
          return (
            <div style={{ marginTop: 18 }}>
              <JessGlanceSwipe accent={gold}
                glancePanel={
                  <FwCard snap={false} minHeight={SWIPE_H} accent={gold} Icon={Flame} eyebrow="Today, at a glance" flower="marigold" idx="v2-glance"
                    action={<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
                      <button onClick={() => openLogger("say")} className="fw-elite-press" style={focusPill(cwOf("plum").petal)}><Mic size={16} /> Say a meal</button>
                      <button onClick={() => openLogger()} className="fw-elite-press" style={focusPill(T.crimson)}><UtensilsCrossed size={16} /> Add a meal</button>
                      <button onClick={() => addWater(WATER_GLASS_ML)} className="fw-elite-press" style={focusPill(sky)}><Droplet size={16} /> Add water</button>
                      <button onClick={busy ? undefined : logYesterday} className="fw-elite-press" style={focusPill(sage)}><Repeat size={16} /> Same as yesterday</button>
                    </div>}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 2 }}>{glanceRows.map((r) => (
                      <button key={r.label} onClick={r.onClick} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 12, padding: "9px 11px", cursor: "pointer" }}>
                        <span style={{ width: 28, height: 28, borderRadius: 8, background: `${cwOf(r.cw).petal}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={14} color={cwOf(r.cw).petal} /></span>
                        <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontFamily: UI, fontSize: 11, fontWeight: 700, color: cwOf(r.cw).petal }}>{r.label}</span><span style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.3 }}>{r.text}</span></span>
                      </button>
                    ))}</div>
                  </FwCard>
                }
                jessPanel={
                  <JessCard accent={sage} eyebrow={jess.eyebrow} digest={jess.body}
                    open={jessSheetOpen} onOpen={() => setJessSheetOpen(true)} onClose={() => setJessSheetOpen(false)}
                    chips={[
                      { Icon: CalendarDays, cw: "sage", label: "Plan", text: hasPlan ? `${distinctDinners > 1 ? `${distinctDinners} different dinners` : "a plan"} this week — tap below to open it` : "No plan yet — I can sort the week for you" },
                      { Icon: Flame, cw: "gold", label: "Today", text: numbersOff ? "Balance over numbers — you're doing lovely" : `${summary.kcal}/${calorieTarget} kcal · ${glasses}/${glassesTarget} glasses water` },
                      { Icon: Sprout, cw: "plum", label: phaseKey ? phaseLabel(phaseKey) : stageLabel(profile), text: ph.note },
                      { Icon: ChefHat, cw: "crimson", label: "Tonight", text: dinner.name },
                    ]}
                    sheetSections={[
                      { Icon: Sprout, cw: "plum", title: `Your ${phaseLabel(phaseKey || "follicular").toLowerCase()} phase`, body: <>Your appetite, energy and cravings shift across the month — that's biology, not a lack of willpower. {phaseKey === "luteal" ? "Right now, steady carbs and a little magnesium (dark chocolate counts) soften the dip, and slightly bigger portions are completely normal." : phaseKey === "menstrual" ? "Right now, iron-rich and warming foods tend to settle best — lentils, red meat if you eat it, and a warm bowl over a cold salad." : "Right now, fresh and bright food tends to match your rising energy — lean into colour and protein."} Nothing here is a rule; it's just what tends to feel good.</> },
                      { Icon: HeartHandshake, cw: "sage", title: "Cravings, and how to ride them", body: <>A craving is your body asking for a top-up, not a failing. <b>Salty</b> often means you need a drink first. {cravingLine} And sometimes a craving is just wanting something nice — also allowed. The trick isn't willpower, it's not arriving ravenous.</> },
                      { Icon: ChefHat, cw: "crimson", title: "What to cook", body: <>Tonight I'd reach for <b>{dinner.name}</b>. {dinner.why || "A warm, balanced plate that fits where you are this week."}</>, action: <button onClick={() => jumpTo(1)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: "#fff", background: cwOf("crimson").petal, border: "none", borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}><ChefHat size={13} /> Browse cook videos</button> },
                    ]}
                  />
                }
              />
            </div>
          );
        })()}

        {/* ED-safe "numbers off" toggle — hides every calorie & number on the page, persists */}
        <button onClick={() => setNumbersOffP(!numbersOff)} className="fw-elite-press" aria-pressed={numbersOff} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", marginTop: 12, background: numbersOff ? `${sage}1A` : T.paperHi, border: `1px solid ${numbersOff ? sage : T.paperDeep}`, borderRadius: 16, padding: "10px 13px", cursor: "pointer", textAlign: "left" }}>
          {numbersOff ? <EyeOff size={17} color={sage} /> : <Eye size={17} color={T.muted} />}
          <span style={{ flex: 1 }}>
            <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, display: "block" }}>Numbers are {numbersOff ? "off" : "on"}</span>
            <span style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>{numbersOff ? "Calories and grams are hidden. Just balance, no counting." : "Tap to hide all calories and grams — log without numbers."}</span>
          </span>
        </button>

        <div ref={sliderRef} style={{ marginTop: 16, position: "relative" }}>
          <SliderArrows sliderRef={sliderRef} />
          <ClipboardSlider hint="Slide your kitchen →" accent={gold}>

            {/* ── BOARD 1 — EAT TODAY ─────────────────────────────────────── */}
            <Clipboard title="Eat today" sub="YOUR PLATE · LOG · WATER · PLAN" accent={gold} flower="marigold" idx="cb-eat" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={gold} bottomAccent={sage}
                  top={[
                    <Panel key="plate" label="Your plate" Icon={Salad} accent={gold}><PlateLens kcal={summary.kcal} target={calorieTarget} kcalLeft={kcalLeft} macros={macroSums} proteinTarget={proteinTarget} fibreTarget={fibreTarget} ironTarget={ironTarget} basis={targets.derived ? targets.basis : null} numbersOff={numbersOff} /></Panel>,
                    <Panel key="logged" label="Logged today" Icon={ListChecks} accent={gold}><LoggedLens meals={dayMeals} onRemove={removeMeal} onLog={() => openLogger()} /></Panel>,
                    <Panel key="methods" label="Quick log" Icon={UtensilsCrossed} accent={gold}><MethodsLens onLog={() => openLogger()} onSnap={() => openLogger("photo")} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="water" label="Water" Icon={Droplet} accent={sky}><WaterLens glasses={glasses} target={glassesTarget} onAdd={addWater} /></Panel>,
                    <Panel key="recents" label="Recents" Icon={Repeat} accent={sage}><RecentsLens recents={recents} onReLog={reLog} onLog={() => openLogger()} onSameYesterday={logYesterday} busy={busy} /></Panel>,
                    <Panel key="plan" label="My plan" Icon={Target} accent={sage}><MyPlanLens proteinTarget={proteinTarget} carbsTarget={carbsTarget} fatTarget={fatTarget} fibreTarget={fibreTarget} ironTarget={ironTarget} glassesTarget={glassesTarget} profile={profile} basis={targets.basis} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 2 — COOK TONIGHT (recipes + cook videos + pantry) ──── */}
            <Clipboard title="Cook tonight" sub="RECIPES · COOK VIDEOS · PANTRY" accent={sage} flower="iris" idx="cb-cook" titleColor={OXBLOOD}>
              <BoardBody>
                <RecipesBoard
                  recipes={recipeList} filter={recipeFilter} onFilter={setRecipeFilter}
                  cookInOnly={cookInOnly} onCookIn={() => setCookInOnly((v) => !v)} hasPantry={pantryNames.length > 0}
                  onGenerate={generateRecipeNow} numbersOff={numbersOff}
                  onAddShopping={addRecipeToShopping} onLog={logRecipe} onSave={saveRecipe} savedTitles={(savedRecipes || []).map((r) => r.title)}
                  pantry={pantry} pantryInput={pantryInput} setPantryInput={setPantryInput} onAddPantry={addPantry} onRemovePantry={removePantry}
                />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 3 — PLAN & EXPLORE ────────────────────────────────── */}
            <Clipboard title="Plan & explore" sub="WEEK · SHOP · PROGRESS · INSIGHTS" accent={sage} flower="rose" idx="cb-plan" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={sage} bottomAccent={cwOf("plum").petal}
                  top={[
                    <Panel key="setup" label="Plan your week" Icon={Sparkles} accent={gold}><PlanOpenerLens
                      goal={planGoal} cuisine={planCuisine} allergens={planAllergens}
                      hasPlan={(mealPlan?.plan_days || []).filter(Boolean).length > 0}
                      distinctDinners={new Set((mealPlan?.plan_days || []).map((d) => cellName(d?.dinner)).filter(Boolean)).size}
                      onOpen={openPlanner} /></Panel>,
                    <Panel key="plan" label="Meal plan" Icon={CalendarDays} accent={sage}><MealPlanLens mealPlan={mealPlan} dinner={dinner} planResult={planResult} onLog={() => reLog(dinner.name, "dinner")} onOpen={() => setCalOpen(true)} onGenerate={openPlanner} busy={busy} /></Panel>,
                    <Panel key="saved" label="Saved recipes" Icon={BookOpen} accent={sage}><SavedRecipesLens recipes={savedRecipes} onReLog={reLog} onExplore={() => jumpTo(1)} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="shop" label="Shopping list" Icon={ShoppingBasket} accent={cwOf("plum").petal}><ShoppingLens items={shopItems} onToggle={toggleShop} onAdd={addShopItem} onRemove={removeShop} onBuildFromPlan={buildShoppingFromPlan} hasPlan={(mealPlan?.plan_days || []).filter(Boolean).length > 0} busy={busy} /></Panel>,
                    <Panel key="progress" label="Progress" Icon={TrendingUp} accent={cwOf("plum").petal}><ProgressLens weekKcal={weekKcal} phaseKey={phaseKey} phase={ph} /></Panel>,
                    <Panel key="insights" label="Insights" Icon={Sparkles} accent={cwOf("plum").petal}><InsightsLens jess={insightText || jessLine(profile)} nudges={stageNudges(profile)} stage={stageLabel(profile)} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 4 — FOR YOUR BODY (+2 · condition watch-lists · GLP-1 · feeding · intuitive) ── */}
            <Clipboard title="For your body" sub="WATCH-LIST · GLP-1 · FEEDING · INTUITIVE" accent={cwOf("plum").petal} flower="foxglove" idx="cb-body" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={cwOf("plum").petal} bottomAccent={sage}
                  top={[
                    <Panel key="cond" label="Your nutrient watch-list" Icon={ShieldCheck} accent={cwOf("plum").petal}><ConditionLens condition={condition} onSelect={setConditionP} onPlan={() => jumpTo(2)} /></Panel>,
                    <Panel key="glp1" label="On GLP-1 meds" Icon={Dumbbell} accent={T.crimson}><Glp1Lens on={glp1} onToggle={() => setGlp1P(!glp1)} /></Panel>,
                    <Panel key="feeding" label="Pregnancy & feeding" Icon={Baby} accent={sage}><FeedingLens /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="intuitive" label="How hungry, how full?" Icon={HeartPulse} accent={cwOf("blush").petal}><IntuitiveLens value={fullness} onSet={setFullnessP} /></Panel>,
                    <Panel key="nevergrade" label="We never grade food" Icon={ShieldCheck} accent={sage}><NeverGradeLens /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 5 — THE KITCHEN TABLE (joyful, whole-life) ─────────── */}
            <Clipboard title="The kitchen table" sub="DINNER TONIGHT · 30 PLANTS · JOY" accent={cwOf("blush").petal} flower="dahlia" idx="cb-table" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={cwOf("blush").petal} bottomAccent={sage}
                  top={[
                    <Panel key="dinner" label="What's for dinner tonight?" Icon={ChefHat} accent={cwOf("blush").petal}><DinnerPromptLens onLog={() => openLogger()} onShare={shareToTable} sharedCount={sharedCount} /></Panel>,
                    <Panel key="plants" label="30 plants this week" Icon={Sprout} accent={sage}><PlantsLens plants={plantsToday} onLog={() => openLogger()} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="myths" label="Myth vs fact" Icon={ShieldCheck} accent={cwOf("plum").petal}><MythsLens /></Panel>,
                    <Panel key="comfort" label="Joy & comfort" Icon={HeartHandshake} accent={cwOf("blush").petal}><ComfortLens /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        {/* 6 · QUICK JUMPS — a horizontal row of COMPACT one-line cards; every one is a real action/jump */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: OXBLOOD, margin: "0 2px 9px" }}>Handy right now</div>
          <V2QuickRow items={[
            { Icon: Check, cw: "crimson", label: "Log tonight's dinner", onClick: () => reLog(dinner.name, "dinner") },
            { Icon: ShoppingBasket, cw: "plum", label: "This week's shopping", onClick: openPlanner },
            { Icon: ChefHat, cw: "sage", label: "Cook videos", onClick: () => jumpTo(1) },
            { Icon: CalendarDays, cw: "gold", label: "Saved weeks", onClick: openPlanner },
            { Icon: Sprout, cw: "sage", label: `${plantsToday} of 30 plants`, onClick: () => jumpTo(4) },
            { Icon: HeartPulse, cw: "plum", label: "For your body", onClick: () => jumpTo(3) },
          ]} />
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "22px 0 0" }}><Pollinator kind="bee" size={32} color={T.gold} color2={cwOf(ph.cw).tip} pattern="bands" animate idx="elite-close" /></div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 300, lineHeight: 1.55 }}>One nourishing thing is plenty. A guide for your day, never a cap.</p>
      </div>

      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {calOpen && <CalendarOverlay user={user} profile={profile} onClose={() => setCalOpen(false)} />}
      {plannerOpen && (
        <GeneratorOverlay
          onClose={() => setPlannerOpen(false)}
          setup={{
            goal: planGoal, onGoal: setPlanGoalP, cuisine: planCuisine, onCuisine: setPlanCuisineP,
            dietary: planDietary, onToggleDietary: togglePlanDietary, allergens: planAllergens, onAddAllergen: addAllergen, onRemoveAllergen: removeAllergen,
            allergyInput, setAllergyInput,
            ingredients: planIngredients, onToggleIngredient: togglePlanIngredient, onAddIngredient: addIngredient, onRemoveIngredient: removeIngredient,
            ingredientInput, setIngredientInput, pantryCount: pantryNames.length, onGenerate: generatePlan,
          }}
          mealPlan={mealPlan} planResult={planResult} history={planHistory} activeId={mealPlan?.id} numbersOff={numbersOff}
          onUsePlan={usePlan} onOpenWeek={() => { setPlannerOpen(false); setCalOpen(true); }}
          onBuildShopping={buildShoppingFromPlan} onLogMeal={reLog} onSwapMeal={swapMeal} onShopMeal={shopMeal} onLogDay={logPlanDay} busy={busy}
        />
      )}
      {loggerOpen && user && (
        <SheetShell title={loggerView === "photo" ? "Snap your meal" : loggerView === "say" ? "Say your meal" : "Add a meal"} eyebrowText={loggerView === "photo" ? "Photo → we'll estimate it" : loggerView === "say" ? "Speak it → we'll log it" : "Snap · say · scan · search · recent"} accent={T.crimson} onClose={() => { setLoggerOpen(false); setLoggerView(null); }}>
          <UnifiedLogger user={user} profile={profile} initialView={loggerView} onLogged={() => { loadSummary(user, todayKey()); loadRecents(user); setLoggerOpen(false); setLoggerView(null); flash("Added to today"); }} />
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
function PlateLens({ kcal, target, kcalLeft, macros, proteinTarget, fibreTarget, ironTarget, basis, numbersOff }) {
  const sage = cwOf("sage").petal;
  if (numbersOff) {
    // ED-safe: no figures — gentle "enough / a nudge" chips instead of bars + ring.
    const chips = [
      { label: "Protein", ok: macros.protein >= proteinTarget * 0.7, cw: "crimson" },
      { label: "Fibre", ok: macros.fibre >= fibreTarget * 0.7, cw: "sage" },
      { label: "Iron", ok: macros.iron >= ironTarget * 0.7, cw: "gold" },
    ];
    return (
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ width: 60, height: 60, borderRadius: 999, background: `${sage}1A`, border: `2px solid ${sage}`, display: "grid", placeItems: "center", flexShrink: 0 }}><Salad size={26} color={sage} /></span>
          <div><div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: T.ink }}>Nourished today</div><div style={{ fontFamily: UI, fontSize: 12, color: T.muted }}>Numbers are off — just balance.</div></div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{chips.map((c) => (
          <span key={c.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: cwOf(c.cw).petal, background: `${cwOf(c.cw).petal}14`, border: `1px solid ${cwOf(c.cw).petal}`, borderRadius: 999, padding: "6px 11px" }}>{c.label} {c.ok ? "✓" : "· a little more"}</span>
        ))}</div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, margin: "10px 2px 0", lineHeight: 1.45 }}>Food is care, not a sum. Balance, gently — no cap, no count.</p>
      </div>
    );
  }
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
        {basis ? `${basis} — ` : ""}a guide for the day, never a cap. Room for <b style={{ color: T.inkSoft }}>{kcalLeft}</b> more if you'd like it.
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
  { id: "snap", label: "Snap a photo", Icon: Camera, cw: "plum", sub: "we read the plate" },
  { id: "say", label: "Say it", Icon: Mic, cw: "sage", sub: "speak your meal" },
  { id: "search", label: "Search", Icon: Search, cw: "gold", sub: "food list" },
  { id: "scan", label: "Scan barcode", Icon: ScanLine, cw: "crimson", sub: "packaged food" },
  { id: "recents", label: "Recent", Icon: Repeat, cw: "sage", sub: "your go-tos" },
  { id: "favourites", label: "Favourites", Icon: Star, cw: "gold", sub: "saved meals" },
];
function MethodsLens({ onLog, onSnap }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 10px", lineHeight: 1.45 }}>Pick the easiest way right now — a photo is quickest.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>{METHODS.map((m) => {
        const c = cwOf(m.cw).petal;
        const handle = m.id === "snap" ? onSnap : onLog;
        return (
          <button key={m.id} onClick={handle} className="fw-elite-press" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "11px 4px", borderRadius: 12, background: `${c}10`, border: `1px solid ${c}44`, cursor: "pointer" }}>
            <m.Icon size={17} color={c} /><span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.ink, textAlign: "center", lineHeight: 1.1 }}>{m.label}</span><span style={{ fontFamily: UI, fontSize: 9, color: T.muted, textAlign: "center", lineHeight: 1 }}>{m.sub}</span>
          </button>
        );
      })}</div>
      <div style={{ marginTop: "auto", paddingTop: 10 }}><Pill Icon={Camera} cw="plum" filled onClick={onSnap}>Snap a photo of my plate</Pill></div>
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
function RecentsLens({ recents, onReLog, onLog, onSameYesterday, busy }) {
  const list = (recents || []).filter(Boolean);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ ...lbl, marginBottom: 8 }}>Your go-tos — tap to log</div>
      {list.length === 0 && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 8px" }}>No recents yet — log a meal and it'll appear here for one-tap re-logging.</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{list.map((r) => (
        <button key={r.id} onClick={() => onReLog(r.name)} className="fw-elite-press" style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.ink }}>{r.name}</button>
      ))}</div>
      {/* +2 · one-tap "same as yesterday" — copies yesterday's real meals forward */}
      <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Pill Icon={Repeat} cw="gold" filled onClick={busy ? undefined : onSameYesterday}>Same as yesterday</Pill>
        <Pill Icon={Plus} cw="sage" onClick={onLog}>Add a recent</Pill>
      </div>
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
// Compact inline opener — keeps the board short; the full editor + result + history live in the overlay.
function PlanOpenerLens({ goal, cuisine, allergens, hasPlan, distinctDinners, onOpen }) {
  const gold = cwOf("gold").petal, sage = cwOf("sage").petal, crim = cwOf("crimson").petal;
  const goalLabel = (GOAL_MODES.find((g) => g.id === goal) || {}).label;
  const chip = (c, txt) => <span key={txt} style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: "#fff", background: c, border: `1px solid ${c}`, borderRadius: 999, padding: "5px 10px" }}>{txt}</span>;
  const hasPrefs = goalLabel || (cuisine && cuisine !== "Any") || allergens.length > 0;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, margin: "0 0 10px", lineHeight: 1.5 }}>Tell me your goal, the food you love and what's in your kitchen — I'll plan a varied week and keep every one you make.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {goalLabel && chip(gold, goalLabel)}
        {cuisine && cuisine !== "Any" && chip(sage, cuisine)}
        {allergens.slice(0, 2).map((a) => chip(crim, `No ${a}`))}
        {!hasPrefs && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted }}>No preferences set yet — tap to choose.</span>}
      </div>
      {hasPlan && <div style={{ ...subCard(sage), background: `${sage}10`, marginBottom: 10 }}><p style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink, margin: 0, lineHeight: 1.4 }}>You've a week ready{distinctDinners > 1 ? <> · <b>{distinctDinners} different dinners</b></> : ""}. Open it to view, tweak or regenerate.</p></div>}
      <div style={{ marginTop: "auto", paddingTop: 6 }}>
        <Pill Icon={Sparkles} cw="gold" filled onClick={onOpen}>{hasPlan ? "Open the planner" : "Plan my week"}</Pill>
      </div>
    </div>
  );
}
// RECOVERED: the meal-plan preferences editor — body goal · cuisine · dietary/allergy · ingredients.
// Every choice persists (localStorage + NutritionProfile) and feeds the real generateMealPlan fn.
function PlanSetupLens({ goal, onGoal, cuisine, onCuisine, dietary, onToggleDietary, allergens, onAddAllergen, onRemoveAllergen, allergyInput, setAllergyInput, ingredients, onToggleIngredient, onAddIngredient, onRemoveIngredient, ingredientInput, setIngredientInput, pantryCount, onGenerate, busy }) {
  const sage = cwOf("sage").petal, gold = cwOf("gold").petal, crim = cwOf("crimson").petal, plum = cwOf("plum").petal;
  const chip = (on, c) => ({ fontFamily: UI, fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? c : T.paperDeep}`, background: on ? c : `${c}10`, color: on ? "#fff" : T.inkSoft });
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
      <div>
        <div style={{ ...lbl, color: sage, marginBottom: 5 }}>Body goal</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{GOAL_MODES.map((g) => <button key={g.id} onClick={() => onGoal(g.id)} className="fw-elite-press" style={chip(goal === g.id, sage)}>{g.label}</button>)}</div>
      </div>
      <div>
        <div style={{ ...lbl, color: gold, marginBottom: 5 }}>Cuisine</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{PLAN_CUISINES.map((c) => <button key={c} onClick={() => onCuisine(c)} className="fw-elite-press" style={chip(cuisine === c, gold)}>{c}</button>)}</div>
      </div>
      <div>
        <div style={{ ...lbl, color: plum, marginBottom: 5 }}>Dietary</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{PLAN_DIETARY.map((d) => <button key={d} onClick={() => onToggleDietary(d)} className="fw-elite-press" style={chip(dietary.includes(d), plum)}>{d}</button>)}</div>
      </div>
      <div>
        <div style={{ ...lbl, color: crim, marginBottom: 5 }}>Allergies — never on your plate</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>{allergens.map((a) => (
          <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 600, color: crim, background: `${crim}14`, border: `1px solid ${crim}`, borderRadius: 999, padding: "5px 7px 5px 11px" }}>{a}<button onClick={() => onRemoveAllergen(a)} aria-label={`Remove ${a}`} className="fw-elite-press" style={{ background: "transparent", border: "none", cursor: "pointer", color: crim, display: "grid", placeItems: "center", padding: 0 }}><X size={12} /></button></span>
        ))}</div>
        <form onSubmit={(e) => { e.preventDefault(); onAddAllergen(allergyInput); }} style={{ display: "flex", gap: 7 }}>
          <input value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} placeholder="e.g. peanuts, shellfish, gluten" style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "8px 11px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 13.5, color: T.ink, outline: "none" }} />
          <button type="submit" aria-label="Add allergy" className="fw-elite-press" style={{ flexShrink: 0, width: 38, borderRadius: 11, border: `1px solid ${crim}`, background: crim, color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={15} /></button>
        </form>
      </div>
      <div>
        <div style={{ ...lbl, color: sage, marginBottom: 5 }}>Cook from what I have{pantryCount > 0 ? ` · +${pantryCount} from your pantry` : ""}</div>
        {/* anything you've added — typed or tapped — shown as removable chips */}
        {ingredients.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 7 }}>{ingredients.map((g) => (
            <span key={g} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 600, color: "#fff", background: sage, border: `1px solid ${sage}`, borderRadius: 999, padding: "5px 7px 5px 11px" }}>{g}<button onClick={() => onRemoveIngredient(g)} aria-label={`Remove ${g}`} className="fw-elite-press" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#fff", display: "grid", placeItems: "center", padding: 0 }}><X size={12} /></button></span>
          ))}</div>
        )}
        {/* TYPE YOUR OWN — free text, not just the presets (comma-separate to add several) */}
        <form onSubmit={(e) => { e.preventDefault(); onAddIngredient(ingredientInput); }} style={{ display: "flex", gap: 7, marginBottom: 7 }}>
          <input value={ingredientInput} onChange={(e) => setIngredientInput(e.target.value)} placeholder="Type any ingredient — courgette, feta, leftover rice…" style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "8px 11px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 13.5, color: T.ink, outline: "none" }} />
          <button type="submit" aria-label="Add ingredient" className="fw-elite-press" style={{ flexShrink: 0, width: 38, borderRadius: 11, border: `1px solid ${sage}`, background: sage, color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={15} /></button>
        </form>
        <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginBottom: 5 }}>Or tap a quick pick:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{QUICK_PLAN_INGREDIENTS.filter((g) => !ingredients.some((x) => x.toLowerCase() === g.toLowerCase())).map((g) => <button key={g} onClick={() => onToggleIngredient(g)} className="fw-elite-press" style={chip(false, sage)}>{g}</button>)}</div>
      </div>
      <div style={{ marginTop: "auto", paddingTop: 6 }}>
        <Pill Icon={Sparkles} cw="gold" filled onClick={busy ? undefined : onGenerate}>{busy ? "Building your week…" : "Generate my varied week"}</Pill>
      </div>
    </div>
  );
}

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOT_META = [["breakfast", "B", "gold"], ["lunch", "L", "sage"], ["dinner", "D", "crimson"], ["snack", "S", "plum"]];
const cellName = (cell) => Array.isArray(cell) ? cell[0] : (typeof cell === "string" ? cell : cell?.name);
function MealPlanLens({ mealPlan, dinner, planResult, onLog, onOpen, onGenerate, busy }) {
  const planDays = (mealPlan?.plan_days || []).filter(Boolean);
  const todayIdx = (new Date().getDay() + 6) % 7;
  // count distinct dinners → proof of variety (no "same 4 meals")
  const distinctDinners = new Set(planDays.map((d) => cellName(d?.dinner)).filter(Boolean)).size;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {planResult?.wellness_focus && (
        <div style={{ ...subCard(cwOf("gold").petal), background: `${cwOf("gold").petal}10`, marginBottom: 8 }}>
          <div style={{ ...lbl, color: cwOf("gold").petal, marginBottom: 2 }}>Focus · {planResult.wellness_focus}</div>
          {planResult.weekly_tip && <p style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink, margin: 0, lineHeight: 1.45 }}>{planResult.weekly_tip}</p>}
        </div>
      )}
      {planDays.length > 0 ? (<>
        <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginBottom: 6 }}>{distinctDinners > 1 ? <><b style={{ color: cwOf("sage").petal }}>{distinctDinners} different dinners</b> this week · breakfast · lunch · dinner · snack</> : "Breakfast · lunch · dinner · snack each day"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>{planDays.slice(0, 4).map((d) => (
          <div key={d.day} style={{ ...subCard(d.day === todayIdx ? cwOf("sage").petal : T.paperDeep), padding: "8px 10px" }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: cwOf("sage").petal, marginBottom: 4 }}>{DOW[d.day] || "—"}{d.day === todayIdx ? " · today" : ""}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{SLOT_META.map(([slot, letter, cw]) => { const nm = cellName(d?.[slot]); if (!nm) return null; return (
              <div key={slot} style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, color: cwOf(cw).petal, width: 12, flexShrink: 0 }}>{letter}</span>
                <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink, lineHeight: 1.3 }}>{nm}</span>
              </div>
            ); })}</div>
          </div>
        ))}</div>
      </>) : (
        <div style={{ ...subCard(cwOf("sage").petal), background: `${cwOf("sage").petal}10`, marginBottom: 10 }}>
          <div style={{ ...lbl, color: cwOf("sage").petal, marginBottom: 3 }}>Suggested · dinner</div>
          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{dinner.name}</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>{dinner.why}</div>
          <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "8px 0 0", lineHeight: 1.45 }}>Set your goal, cuisine &amp; allergies in <b>Plan setup</b> (slide ←), then generate a real varied week.</p>
        </div>
      )}
      <div style={{ marginTop: "auto", display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Pill Icon={Sparkles} cw="gold" filled onClick={busy ? undefined : onGenerate}>{busy ? "Building…" : (planDays.length > 0 ? "Regenerate week" : "Generate this week")}</Pill>
        <Pill Icon={Check} cw="sage" onClick={onLog}>Log tonight's dinner</Pill>
        <Pill Icon={CalendarDays} cw="sage" onClick={onOpen}>Open week</Pill>
      </div>
    </div>
  );
}
// Saved recipes (MealTemplates: title + items) — tap to log for tonight, or jump to the cook board.
function SavedRecipesLens({ recipes, onReLog, onExplore }) {
  const list = (recipes || []).filter(Boolean);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, margin: "0 0 10px", lineHeight: 1.45 }}>Your saved recipes — tap one to log it for tonight.</p>
      {list.length === 0 && <div style={{ ...subCard(cwOf("sage").petal), background: `${cwOf("sage").petal}10`, marginBottom: 10 }}><p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.ink, margin: 0, lineHeight: 1.45 }}>No saved recipes yet. Browse the cook board, watch a clip, and tap “Save recipe”.</p></div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>{list.slice(0, 5).map((r) => (
        <button key={r.id} onClick={() => onReLog(r.title, "dinner")} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", ...subCard(cwOf("sage").petal), padding: "9px 11px", cursor: "pointer" }}>
          <BookOpen size={14} color={cwOf("sage").petal} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 14.5, color: T.ink }}>{r.title}</span>
          {(r.items?.length > 0) && <span style={{ fontFamily: UI, fontSize: 11, color: T.muted, flexShrink: 0 }}>{r.items.length} items</span>}
        </button>
      ))}</div>
      <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
        <Pill Icon={ChefHat} cw="sage" filled onClick={onExplore}>Browse cook videos</Pill>
      </div>
    </div>
  );
}
// ShoppingList real schema: ingredient_name + quantity_text + category (capitalised enum) + is_checked.
const AISLE_ORDER = ["Produce", "Dairy & Eggs", "Meat & Seafood", "Bakery", "Pantry", "Frozen", "Beverages", "Snacks", "Other"];
function ShoppingLens({ items, onToggle, onAdd, onRemove, onBuildFromPlan, hasPlan, busy }) {
  const list = (items || []).filter(Boolean);
  const groups = {};
  list.forEach((it) => { const a = it.category || "Other"; (groups[a] = groups[a] || []).push(it); });
  const aisles = Object.keys(groups).sort((a, b) => AISLE_ORDER.indexOf(a) - AISLE_ORDER.indexOf(b));
  const plum = cwOf("plum").petal, sage = cwOf("sage").petal;
  const inputRef = useRef(null);
  const [collapsed, setCollapsed] = useState({});
  const [note, setNote] = useState("");
  const checked = list.filter((i) => i.is_checked).length;
  const flashNote = (m) => { setNote(m); clearTimeout(flashNote._t); flashNote._t = setTimeout(() => setNote(""), 1900); };
  const buildText = () => {
    const out = ["Shopping list", ""];
    aisles.forEach((a) => { out.push(a.toUpperCase()); groups[a].forEach((it) => out.push(`${it.is_checked ? "✓ " : "• "}${it.ingredient_name}${it.quantity_text ? ` (${it.quantity_text})` : ""}`)); out.push(""); });
    return out.join("\n").trim();
  };
  const doCopy = async () => { try { await navigator.clipboard.writeText(buildText()); flashNote("Copied to clipboard"); } catch { flashNote("Couldn't copy — try again"); } };
  const doShare = async () => { const text = buildText(); try { if (navigator.share) { await navigator.share({ title: "My shopping list", text }); } else { await navigator.clipboard.writeText(text); flashNote("Copied (sharing not supported here)"); } } catch { /* user cancelled the share sheet */ } };
  const submitAdd = (e) => { e.preventDefault(); const v = (inputRef.current?.value || "").trim(); if (!v) return; onAdd(v); if (inputRef.current) inputRef.current.value = ""; };
  const ghost = { display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 700, color: plum, background: `${plum}12`, border: `1px solid ${plum}44`, borderRadius: 999, padding: "6px 11px", cursor: "pointer" };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* ADD YOUR OWN ITEM — writes to ShoppingList (persists) */}
      <form onSubmit={submitAdd} style={{ display: "flex", gap: 7, marginBottom: 9 }}>
        <input ref={inputRef} placeholder="Add an item — e.g. oat milk, bananas" aria-label="Add a shopping item" style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "9px 12px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 14, color: T.ink, outline: "none" }} />
        <button type="submit" aria-label="Add item" className="fw-elite-press" style={{ flexShrink: 0, width: 40, borderRadius: 11, border: `1px solid ${plum}`, background: plum, color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={16} /></button>
      </form>

      {/* count + EXPORT (copy / share) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}>{list.length ? `${list.length} item${list.length === 1 ? "" : "s"}${checked ? ` · ${checked} ticked` : ""}` : "Empty"}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={doCopy} disabled={!list.length} className="fw-elite-press" style={{ ...ghost, opacity: list.length ? 1 : 0.45 }}><Copy size={13} /> Copy</button>
          <button onClick={doShare} disabled={!list.length} className="fw-elite-press" style={{ ...ghost, opacity: list.length ? 1 : 0.45 }}><Share2 size={13} /> Share</button>
        </div>
      </div>
      {note && <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: sage, background: `${sage}18`, border: `1px solid ${sage}`, borderRadius: 10, padding: "6px 10px", marginBottom: 8 }}>{note}</div>}

      {list.length === 0 && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, margin: "2px 0 10px", lineHeight: 1.45 }}>Nothing here yet — type an item above, add ingredients from a recipe, or build a list from this week's plan, then tick things off as you shop.</p>}

      {/* COLLAPSIBLE aisle sections in a capped scroll — never one giant wall */}
      <div style={{ flex: 1, minHeight: 0, maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 2 }}>{aisles.map((a) => {
        const grp = groups[a]; const open = !collapsed[a]; const done = grp.filter((i) => i.is_checked).length;
        return (
          <div key={a}>
            <button onClick={() => setCollapsed((c) => ({ ...c, [a]: !c[a] }))} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", background: `${plum}10`, border: `1px solid ${plum}33`, borderRadius: 10, padding: "7px 10px", cursor: "pointer" }}>
              <ChevronDown size={15} color={plum} style={{ transition: "transform .2s", transform: open ? "none" : "rotate(-90deg)", flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: UI, fontSize: 11.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: plum }}>{a}</span>
              <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted }}>{done}/{grp.length}</span>
            </button>
            {open && <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 5 }}>{grp.map((it) => (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => onToggle(it)} className="fw-elite-press" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, textAlign: "left", ...subCard(it.is_checked ? sage : T.paperDeep), padding: "7px 10px", cursor: "pointer", opacity: it.is_checked ? 0.6 : 1 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${it.is_checked ? sage : T.paperDeep}`, background: it.is_checked ? sage : "transparent", display: "grid", placeItems: "center" }}>{it.is_checked && <Check size={12} color="#fff" />}</span>
                  <span style={{ flex: 1, minWidth: 0, fontFamily: SERIF, fontSize: 14.5, color: T.ink, textDecoration: it.is_checked ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.ingredient_name}{it.quantity_text ? <span style={{ color: T.muted, fontSize: 13 }}> · {it.quantity_text}</span> : null}</span>
                </button>
                <button onClick={() => onRemove(it)} aria-label={`Remove ${it.ingredient_name}`} className="fw-elite-press" style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.muted, display: "grid", placeItems: "center", cursor: "pointer" }}><Trash2 size={13} /></button>
              </div>
            ))}</div>}
          </div>
        );
      })}</div>

      <div style={{ marginTop: 10 }}>
        <Pill Icon={ShoppingBasket} cw="plum" filled onClick={busy ? undefined : onBuildFromPlan}>{hasPlan ? "Build from this week's plan" : "Build from a plan (generate one first)"}</Pill>
      </div>
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

// ── COOK board — filter pills + a Deck of cook-cards (embedded video + ingredients + actions) ──
function CookCard({ recipe, onAddShopping, onLog, onSave, saved, numbersOff }) {
  const sage = cwOf("sage").petal, gold = cwOf("gold").petal;
  const kcalLo = recipe.rough_kcal ? recipe.rough_kcal - 40 : null;
  const kcalHi = recipe.rough_kcal ? recipe.rough_kcal + 60 : null;
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", paddingRight: 2 }}>
      {/* title + meta ABOVE the player (never overlaid) */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{recipe.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 3 }}>
          <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>{recipe.channel}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: UI, fontSize: 11.5, color: T.muted }}><Clock size={11} /> {recipe.minutes} min</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: gold }}><Leaf size={11} /> {recipe.nutrient_story}</span>
        </div>
      </div>
      <CookVideo youtubeId={recipe.youtube_id} title={recipe.title} accent={gold} />
      {/* blurb + ingredients BELOW the player */}
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted, margin: "8px 0 6px", lineHeight: 1.4 }}>{recipe.blurb}</p>
      <div style={{ ...lbl, color: sage, marginBottom: 5 }}>Ingredients</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>{(recipe.ingredients || []).map((ing, i) => (
        <span key={i} style={{ fontFamily: UI, fontSize: 11.5, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "4px 9px" }}>{ing.name}{ing.quantity_text ? <span style={{ color: T.muted }}> · {ing.quantity_text}</span> : null}</span>
      ))}</div>
      {/* +2 · composite accuracy — a macro RANGE from the dish's ingredients, not a single false figure */}
      {kcalLo != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, ...subCard(gold), background: `${gold}0D`, padding: "7px 11px", marginBottom: 9 }}>
          <Flame size={14} color={gold} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: UI, fontSize: 12, color: T.inkSoft, lineHeight: 1.4 }}>
            {numbersOff ? <>Logs as a <b>balanced, protein-rich</b> plate · built from its ingredients</> : <>Logs ≈ <b>{kcalLo}–{kcalHi} kcal</b> · protein <b>~{recipe.rough_protein_g}g</b> — a range from the real ingredients, not a guess</>}
          </span>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto" }}>
        <Pill Icon={ShoppingBasket} cw="plum" onClick={() => onAddShopping(recipe)}>Add ingredients to shopping</Pill>
        <Pill Icon={Check} cw="sage" filled onClick={() => onLog(recipe)}>Watched it → log it</Pill>
        <Pill Icon={saved ? Check : Star} cw="gold" onClick={() => onSave(recipe)}>{saved ? "Saved" : "Save recipe"}</Pill>
      </div>
    </div>
  );
}
function RecipesBoard({ recipes, filter, onFilter, cookInOnly, onCookIn, hasPantry, onGenerate, numbersOff, onAddShopping, onLog, onSave, savedTitles, pantry, pantryInput, setPantryInput, onAddPantry, onRemovePantry }) {
  const sage = cwOf("sage").petal, gold = cwOf("gold").petal, carrotCw = cwOf("sage").petal;
  const list = (recipes || []);
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* filter pills + cook-what's-in + generate */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, flexShrink: 0 }}>
        {RECIPE_FILTERS.map((f) => (
          <button key={f.id} onClick={() => onFilter(f.id)} className="fw-elite-press" style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, padding: "5px 11px", borderRadius: 999, cursor: "pointer", border: `1px solid ${filter === f.id ? gold : T.paperDeep}`, background: filter === f.id ? gold : `${gold}10`, color: filter === f.id ? "#fff" : T.inkSoft }}>{f.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8, flexShrink: 0 }}>
        <button onClick={onCookIn} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "6px 12px", borderRadius: 999, cursor: "pointer", border: `1px solid ${cookInOnly ? carrotCw : T.paperDeep}`, background: cookInOnly ? carrotCw : `${carrotCw}12`, color: cookInOnly ? "#fff" : T.inkSoft }}><Carrot size={13} color={cookInOnly ? "#fff" : carrotCw} /> Cook what's in{hasPantry ? "" : " (add pantry below)"}</button>
        <button onClick={onGenerate} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "6px 12px", borderRadius: 999, cursor: "pointer", border: `1px solid ${gold}`, background: `${gold}14`, color: T.inkSoft }}><Sparkles size={13} color={gold} /> Generate</button>
      </div>
      {/* the cook-card deck (its own horizontal slider) */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {list.length === 0 ? (
          <div style={{ ...subCard(sage), background: `${sage}10`, margin: "4px 0" }}>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.ink, margin: 0, lineHeight: 1.45 }}>{cookInOnly ? "Nothing matches your pantry yet — add a few items below, or turn off “Cook what's in”." : "No recipes match that filter — try “All”."}</p>
          </div>
        ) : (
          <Deck accent={gold}>{list.map((r) => (
            <CookCard key={r.youtube_id} recipe={r} onAddShopping={onAddShopping} onLog={onLog} onSave={onSave} saved={(savedTitles || []).includes(r.title)} numbersOff={numbersOff} />
          ))}</Deck>
        )}
      </div>
      {/* gold hairline + the light pantry editor (powers "cook what's in") */}
      <div aria-hidden style={{ flexShrink: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, opacity: 0.5, margin: "9px 0" }} />
      <PantryStrip pantry={pantry} pantryInput={pantryInput} setPantryInput={setPantryInput} onAdd={onAddPantry} onRemove={onRemovePantry} />
    </div>
  );
}
// PantryStrip — the light "what's in" editor inside the cook board (PantryItem CRUD)
function PantryStrip({ pantry, pantryInput, setPantryInput, onAdd, onRemove }) {
  const sage = cwOf("sage").petal;
  const list = (pantry || []).filter(Boolean);
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ ...lbl, color: sage, marginBottom: 6 }}>Your pantry — powers “cook what's in”</div>
      <form onSubmit={(e) => { e.preventDefault(); onAdd(pantryInput); }} style={{ display: "flex", gap: 7, marginBottom: 8 }}>
        <input value={pantryInput} onChange={(e) => setPantryInput(e.target.value)} placeholder="Add what you have in — e.g. spinach, tinned chickpeas"
          style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "9px 12px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 14, color: T.ink, outline: "none" }} />
        <button type="submit" aria-label="Add to pantry" className="fw-elite-press" style={{ flexShrink: 0, width: 40, borderRadius: 11, border: `1px solid ${sage}`, background: sage, color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={16} /></button>
      </form>
      {list.length === 0 ? (
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, margin: 0 }}>Add a few staples and we'll surface recipes you can make right now.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{list.map((p) => (
          <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: T.ink, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 6px 5px 11px" }}>
            {p.name}
            <button onClick={() => onRemove(p)} aria-label={`Remove ${p.name}`} className="fw-elite-press" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, display: "grid", placeItems: "center", padding: 0 }}><X size={13} /></button>
          </span>
        ))}</div>
      )}
    </div>
  );
}

// ── KITCHEN TABLE lenses (joyful, whole-life) ──────────────────────────────────
function todayIndex(len) { return Math.floor(Date.now() / 86400000) % len; }
function DinnerPromptLens({ onLog, onShare, sharedCount }) {
  const blush = cwOf("blush").petal;
  const [text, setText] = useState("");
  const prompt = TABLE_PROMPTS[todayIndex(TABLE_PROMPTS.length)];
  const share = () => { onShare(text); setText(""); };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ ...subCard(blush), background: `${blush}12`, marginBottom: 10 }}>
        <div style={{ ...lbl, color: blush, marginBottom: 4 }}>Tonight</div>
        <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, margin: 0, lineHeight: 1.35 }}>{prompt}</p>
      </div>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 8px", lineHeight: 1.5 }}>No right answer — food is pleasure and belonging here, not a test.</p>
      {/* +2 · share to the table — a real, anonymous-safe note (persists to your journal, tagged) */}
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What's on your plate? (optional)"
        style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 14, color: T.ink, outline: "none", marginBottom: 8 }} />
      {sharedCount > 0 && <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginBottom: 6 }}>You've shared <b style={{ color: blush }}>{sharedCount}</b> plate{sharedCount === 1 ? "" : "s"} to the table.</div>}
      <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
        <Pill Icon={UtensilsCrossed} cw="crimson" filled onClick={onLog}>Log what I'm making</Pill>
        <Pill Icon={HeartHandshake} cw="blush" onClick={share}>Share to the table</Pill>
      </div>
    </div>
  );
}
function PlantsLens({ plants, onLog }) {
  const sage = cwOf("sage").petal;
  const goal = 30; const pct = Math.min(100, Math.round((plants / goal) * 100));
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink }}>Eat the rainbow</span>
        <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: sage }}>{plants} plant{plants === 1 ? "" : "s"} today</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: T.paperDeep, overflow: "hidden", marginBottom: 8 }}><div style={{ width: `${pct}%`, height: "100%", background: sage, borderRadius: 99 }} /></div>
      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, margin: "0 0 6px", lineHeight: 1.45 }}>Aiming for around 30 different plants across a week is lovely for your gut — herbs, seeds and grains all count.</p>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.45 }}>A gentle game, never a scoreboard. We count the plants in what you log — no need to tally anything yourself.</p>
      <div style={{ marginTop: "auto", paddingTop: 10 }}><Pill Icon={Sprout} cw="sage" filled onClick={onLog}>Log something with veg in it</Pill></div>
    </div>
  );
}
function MythsLens() {
  const [i, setI] = useState(todayIndex(NUTRITION_MYTHS.length));
  const [open, setOpen] = useState(false);
  const m = NUTRITION_MYTHS[i];
  const crimson = cwOf("crimson").petal, sage = cwOf("sage").petal;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted, margin: "0 0 8px", lineHeight: 1.45 }}>The wellness internet sells a lot of nonsense. Tap to flip myth → fact.</p>
      <button onClick={() => setOpen((v) => !v)} className="fw-elite-press" style={{ textAlign: "left", width: "100%", cursor: "pointer", ...subCard(open ? sage : crimson), background: open ? `${sage}10` : `${crimson}0D`, padding: "12px 13px", border: `1px solid ${T.paperDeep}` }}>
        <div style={{ ...lbl, color: open ? sage : crimson, marginBottom: 4 }}>{open ? "The truth" : "The myth"}</div>
        <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, margin: 0, lineHeight: 1.45 }}>{open ? m.fact : m.myth}</p>
        {open && <a href={m.source_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 7, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted, textDecoration: "none" }}><ArrowRight size={11} /> Source</a>}
      </button>
      <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", gap: 8 }}>
        <Pill Icon={RefreshCw} cw="crimson" onClick={() => { setI((x) => (x + 1) % NUTRITION_MYTHS.length); setOpen(false); }}>Another myth</Pill>
        {!open && <Pill Icon={ShieldCheck} cw="sage" filled onClick={() => setOpen(true)}>Reveal the fact</Pill>}
      </div>
    </div>
  );
}
function ComfortLens() {
  const blush = cwOf("blush").petal;
  const idea = TABLE_IDEAS[todayIndex(TABLE_IDEAS.length)];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ ...subCard(blush), background: `${blush}12`, marginBottom: 10 }}>
        <div style={{ ...lbl, color: blush, marginBottom: 4 }}>An idea for tonight</div>
        <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, lineHeight: 1.25 }}>{idea.title}</div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "4px 0 0", lineHeight: 1.45 }}>{idea.note}</p>
      </div>
      <p style={{ marginTop: "auto", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, lineHeight: 1.5 }}>Eating together — even over a video call — triggers a little burst of belonging. Food is one of the kindest ways we look after each other.</p>
    </div>
  );
}

// ── +2 · FOR-YOUR-BODY lenses (condition watch-lists · GLP-1 · feeding · intuitive · never-grade) ──
function ConditionLens({ condition, onSelect, onPlan }) {
  const c = CONDITIONS.find((x) => x.id === condition) || CONDITIONS[0];
  const accent = cwOf(c.cw).petal;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 9 }}>{CONDITIONS.map((x) => {
        const on = x.id === condition, xc = cwOf(x.cw).petal;
        return <button key={x.id} onClick={() => onSelect(x.id)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12, fontWeight: 700, padding: "6px 11px", borderRadius: 999, cursor: "pointer", border: `1px solid ${on ? xc : T.paperDeep}`, background: on ? xc : `${xc}12`, color: on ? "#fff" : T.inkSoft }}><x.Icon size={12} color={on ? "#fff" : xc} /> {x.label}</button>;
      })}</div>
      <div style={{ ...subCard(accent), background: `${accent}0D` }}>
        <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: cwOf("sage").petal }}>● Kind, sensible guidance</span>
        <p style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.5, margin: "5px 0 9px" }}>{c.body}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{c.watch.map((w) => (
          <span key={w} style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: accent, background: T.paper, border: `1px solid ${accent}`, borderRadius: 999, padding: "5px 10px" }}>{w}</span>
        ))}</div>
      </div>
      <div style={{ marginTop: "auto", paddingTop: 10 }}><Pill Icon={CalendarDays} cw={c.cw} filled onClick={onPlan}>Build a gentle plan for this →</Pill></div>
    </div>
  );
}
function Glp1Lens({ on, onToggle }) {
  const crim = cwOf("crimson").petal;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.55, margin: "0 0 10px" }}>On a GLP-1 med, around <b>25–40%</b> of the weight you lose can be <b>muscle</b>. Turn these tips on to help keep it — this is about protecting your body, not losing more.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>{GLP1_POINTS.map((p) => (
        <div key={p.label} style={{ display: "flex", alignItems: "flex-start", gap: 9, ...subCard(crim), padding: "8px 11px" }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: `${crim}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><p.Icon size={13} color={crim} /></span>
          <div><div style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{p.label}</div><div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.35 }}>{p.note}</div></div>
        </div>
      ))}</div>
      <div style={{ marginTop: "auto" }}><Pill Icon={Dumbbell} cw="crimson" filled={on} onClick={onToggle}>{on ? "Tips are on" : "Show me these tips"}</Pill></div>
    </div>
  );
}
function FeedingLens() {
  const sage = cwOf("sage").petal, gold = cwOf("gold").petal, crim = cwOf("crimson").petal;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ ...subCard(gold) }}>
        <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>Cravings — and how to ride them</div>
        <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "3px 0 0", lineHeight: 1.5 }}>A craving is your body asking for a top-up, not a failing. <b>Salty</b> often means you need a drink first — have water, then the snack. <b>Sweet</b> is usually tiredness; fruit with yoghurt holds you longer than sweets. Craving <b>ice or non-food</b> things is worth a quick word with your midwife.</p>
      </div>
      <div style={{ ...subCard(sage) }}>
        <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>When your tummy's tender</div>
        <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "3px 0 0", lineHeight: 1.5 }}>A <b>dry cracker or some ginger</b> before you get up settles early queasiness. <b>Small, frequent</b> plates sit better than three big ones, and cold food smells less — so it's often kinder on a rough morning.</p>
      </div>
      <div style={{ ...subCard(crim) }}>
        <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink }}>Feeding a baby is hungry work</div>
        <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "3px 0 0", lineHeight: 1.5 }}>You'll naturally want a bit more while breastfeeding — that's right, not greedy. Keep <b>easy one-handed snacks</b> (oatcakes, nuts, fruit) and a water bottle wherever you feed. Look after you, and the rest follows.</p>
      </div>
      <p style={{ marginTop: "auto", paddingTop: 6, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, lineHeight: 1.45 }}>Feeding yourself counts as much as anything. If something worries you, your midwife is the one to ask.</p>
    </div>
  );
}
const FULLNESS = [["hungry", "Still hungry"], ["satisfied", "Satisfied"], ["full", "A bit full"], ["comfort", "Ate for comfort — that's ok"]];
function IntuitiveLens({ value, onSet }) {
  const blush = cwOf("blush").petal;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.55, margin: "0 0 10px" }}>A gentle check-in after eating — <b>just noticing, not marking yourself</b>. No streak to break, no number to chase.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{FULLNESS.map(([id, label]) => {
        const on = value === id;
        return <button key={id} onClick={() => onSet(id)} className="fw-elite-press" style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 9, background: on ? `${blush}1A` : T.paper, border: `1px solid ${on ? blush : T.paperDeep}`, borderRadius: 12, padding: "10px 12px", cursor: "pointer" }}>
          <span style={{ width: 18, height: 18, borderRadius: 999, flexShrink: 0, border: `1.5px solid ${on ? blush : T.paperDeep}`, background: on ? blush : "transparent", display: "grid", placeItems: "center" }}>{on && <Check size={11} color="#fff" />}</span>
          <span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink }}>{label}</span>
        </button>;
      })}</div>
      <p style={{ marginTop: "auto", paddingTop: 10, fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: T.muted }}>{value ? "Saved for today — thank you for listening to your body." : "However you feel is information, never a verdict."}</p>
    </div>
  );
}
function NeverGradeLens() {
  const sage = cwOf("sage").petal;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", placeItems: "center", padding: "8px 0 12px" }}><span style={{ width: 56, height: 56, borderRadius: 999, background: `${sage}1A`, border: `2px solid ${sage}`, display: "grid", placeItems: "center" }}><ShieldCheck size={26} color={sage} /></span></div>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.55, textAlign: "center", margin: 0 }}>No scores. No <b>“good”</b> or <b>“bad”</b> foods. If something's worth a note, we keep it plain (“higher in salt”) — never a telling-off.</p>
      <p style={{ marginTop: "auto", paddingTop: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, textAlign: "center", lineHeight: 1.5 }}>You never have to earn your dinner. That trust is the heart of this room.</p>
    </div>
  );
}

// ── Saved plans · history (every generated week, newest first — tap to bring one back) ──────────
function SavedPlansLens({ history, activeId, onUse }) {
  const sage = cwOf("sage").petal, gold = cwOf("gold").petal;
  const list = (history || []).filter(Boolean);
  const whenOf = (p) => { try { const d = new Date(p.created_at || p.created_date || p.week_start); return Number.isNaN(d.getTime()) ? "" : format(d, "d MMM"); } catch { return ""; } };
  if (list.length === 0) return (
    <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "2px 0 0", lineHeight: 1.5 }}>No saved weeks yet — generate one above and it'll be kept here for you to look back on any time.</p>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{list.map((p) => {
      const dinners = (p.plan_days || []).map((d) => cellName(d?.dinner)).filter(Boolean);
      const distinct = new Set(dinners).size;
      const active = p.id === activeId;
      return (
        <button key={p.id} onClick={() => onUse(p)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", ...subCard(active ? sage : T.paperDeep), background: active ? `${sage}12` : T.paper, padding: "10px 12px", cursor: "pointer" }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: `${gold}1A`, display: "grid", placeItems: "center" }}><CalendarDays size={15} color={gold} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, fontWeight: 600, color: T.ink, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.wellness_goal ? p.wellness_goal.charAt(0).toUpperCase() + p.wellness_goal.slice(1) : "A varied week"}</span>
            <span style={{ fontFamily: UI, fontSize: 11.5, color: T.muted }}>{whenOf(p)}{whenOf(p) ? " · " : ""}{distinct > 1 ? `${distinct} different dinners` : `${dinners.length} day${dinners.length === 1 ? "" : "s"}`}</span>
          </span>
          {active ? <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: sage, flexShrink: 0 }}>Showing</span> : <ArrowRight size={15} color={T.muted} style={{ flexShrink: 0 }} />}
        </button>
      );
    })}</div>
  );
}

// ── elite meal cards — each meal is a proper brand card (flora rail · name · warm macros · tappable) ──
const DOW_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOT_ORDER = ["breakfast", "lunch", "dinner", "snack"];
const SLOT_FULL = {
  breakfast: { label: "Breakfast", cw: "gold", flora: "sunflower", line: "A kind way to start the day." },
  lunch: { label: "Lunch", cw: "sage", flora: "dahlia", line: "Enough to carry the afternoon." },
  dinner: { label: "Dinner", cw: "crimson", flora: "poppy", line: "Something warm to come home to." },
  snack: { label: "Snack", cw: "plum", flora: "chrysanthemum", line: "A little something between meals." },
};
const planMacros = (name, slot) => { const e = mealEstimate(name, slot) || {}; return { kcal: Math.round(e.kcal || 0), protein: Math.round(e.protein_g || 0), fibre: Math.round(e.fiber_g || 0), iron: Math.round(e.iron_mg || 0) }; };

function PlanMealCard({ dayIdx, slot, name, numbersOff, onOpen }) {
  const meta = SLOT_FULL[slot]; const c = cwOf(meta.cw).petal;
  const m = planMacros(name, slot);
  const hasVid = !!findRecipeFor(name);
  return (
    <button onClick={() => onOpen({ dayIdx, slot, name })} className="fw-elite-press" style={{ display: "flex", alignItems: "stretch", width: "100%", textAlign: "left", background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 15, overflow: "hidden", cursor: "pointer", padding: 0 }}>
      <span style={{ width: 46, flexShrink: 0, background: `${c}14`, display: "grid", placeItems: "center", borderRight: `1px solid ${c}26` }}><FlowerGlyph variant={meta.flora} size={30} color={c} idx={`pm-${dayIdx}-${slot}`} /></span>
      <span style={{ flex: 1, minWidth: 0, padding: "9px 11px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 1 }}>
          <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".07em", textTransform: "uppercase", color: c }}>{meta.label}</span>
          {hasVid && <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontFamily: UI, fontSize: 9, fontWeight: 700, color: cwOf("crimson").petal }}><PlayCircle size={9} /> cook video</span>}
        </span>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        <span style={{ fontFamily: UI, fontSize: 11, color: T.muted }}>{numbersOff ? "a balanced plate" : <>~<b style={{ color: T.ink }}>{m.kcal}</b> kcal · protein <b style={{ color: T.ink }}>{m.protein}g</b>{m.iron >= 2 ? <> · iron <b style={{ color: T.ink }}>{m.iron}mg</b></> : ""}</>}</span>
      </span>
      <span style={{ display: "grid", placeItems: "center", paddingRight: 7, color: T.muted, flexShrink: 0 }}><ChevronRight size={16} /></span>
    </button>
  );
}
function PlanDayBlock({ day, isToday, numbersOff, onOpenMeal, onLogDay, busy }) {
  const sage = cwOf("sage").petal;
  const slots = SLOT_ORDER.map((slot) => ({ slot, name: cellName(day[slot]) })).filter((s) => s.name);
  if (!slots.length) return null;
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 8px" }}>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, fontWeight: 600, color: OXBLOOD }}>{DOW_FULL[day.day] || "Day"}</span>
        {isToday && <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "#fff", background: sage, borderRadius: 999, padding: "2px 8px" }}>Today</span>}
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${T.paperDeep}, transparent)` }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{slots.map((s) => <PlanMealCard key={s.slot} dayIdx={day.day} slot={s.slot} name={s.name} numbersOff={numbersOff} onOpen={onOpenMeal} />)}</div>
      <div style={{ marginTop: 8 }}>
        <button onClick={() => onLogDay(day.day)} disabled={busy} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: sage, background: `${sage}12`, border: `1px solid ${sage}55`, borderRadius: 999, padding: "6px 12px", cursor: "pointer" }}><Check size={13} /> Log this day for today</button>
      </div>
    </div>
  );
}
// meal detail sheet — opens over the planner (recipe · embedded cook video · ingredients · real actions)
function MealSheet({ meal, numbersOff, onClose, onLog, onSwap, onShop, busy }) {
  const meta = SLOT_FULL[meal.slot]; const c = cwOf(meta.cw).petal;
  const recipe = findRecipeFor(meal.name);
  const m = planMacros(meal.name, meal.slot);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9995, background: "rgba(11,8,5,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} className="fw-elite-in">
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", background: T.paperHi, borderRadius: "22px 22px 0 0", borderTop: `3px solid ${c}`, padding: "16px 18px calc(26px + env(safe-area-inset-bottom))" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <span style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: `${c}16`, display: "grid", placeItems: "center" }}><FlowerGlyph variant={meta.flora} size={34} color={c} idx="ms" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: c }}>{meta.label}</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 21, fontWeight: 600, color: OXBLOOD, lineHeight: 1.15 }}>{meal.name}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="fw-elite-press" style={{ width: 32, height: 32, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.muted, cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}><X size={16} /></button>
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 0 12px", lineHeight: 1.5 }}>{meta.line}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${cwOf("gold").petal}0D`, border: `1px solid ${cwOf("gold").petal}`, borderRadius: 12, padding: "9px 12px", marginBottom: 12 }}>
          <Flame size={15} color={cwOf("gold").petal} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: UI, fontSize: 12.5, color: T.inkSoft, lineHeight: 1.4 }}>{numbersOff ? <>Logs as a <b>balanced, protein-rich</b> plate — no numbers.</> : <>Roughly <b style={{ color: T.ink }}>{m.kcal} kcal</b> · protein <b style={{ color: T.ink }}>{m.protein}g</b>{m.fibre >= 2 ? <> · fibre <b style={{ color: T.ink }}>{m.fibre}g</b></> : ""}{m.iron >= 2 ? <> · iron <b style={{ color: T.ink }}>{m.iron}mg</b></> : ""} — an estimate from the dish.</>}</span>
        </div>
        {recipe ? (<>
          <div style={{ ...lbl, color: c, marginBottom: 6 }}>How to make it</div>
          <CookVideo youtubeId={recipe.youtube_id} title={recipe.title} accent={c} />
          {recipe.blurb && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13.5, color: T.muted, margin: "8px 0", lineHeight: 1.45 }}>{recipe.blurb}</p>}
          <div style={{ ...lbl, color: cwOf("sage").petal, margin: "4px 0 5px" }}>What's in it</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>{(recipe.ingredients || []).map((ing, i) => (
            <span key={i} style={{ fontFamily: UI, fontSize: 11.5, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "4px 9px" }}>{ing.name}{ing.quantity_text ? <span style={{ color: T.muted }}> · {ing.quantity_text}</span> : null}</span>
          ))}</div>
        </>) : (
          <div style={{ ...subCard(cwOf("sage").petal), background: `${cwOf("sage").petal}0D`, marginBottom: 14 }}>
            <p style={{ fontFamily: SERIF, fontSize: 13.5, color: T.ink, margin: 0, lineHeight: 1.5 }}>A simple, wholesome plate. Add it to your shopping list below, or tap <b>Swap</b> for a different idea. For a step-by-step, the Cook board is full of short recipe videos.</p>
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Pill Icon={Check} cw="crimson" filled onClick={() => onLog(meal)}>Log it</Pill>
          <Pill Icon={RefreshCw} cw="gold" onClick={busy ? undefined : () => onSwap(meal)}>Swap</Pill>
          <Pill Icon={ShoppingBasket} cw="plum" onClick={() => onShop(meal)}>Add to shopping</Pill>
        </div>
      </div>
    </div>
  );
}

// ── FULL-SCREEN meal-generator overlay — elite cards: a day at a time, each meal its own tappable card ──
function GeneratorOverlay({ onClose, setup, mealPlan, planResult, history, activeId, numbersOff, onUsePlan, onOpenWeek, onBuildShopping, onLogMeal, onSwapMeal, onShopMeal, onLogDay, busy }) {
  const gold = cwOf("gold").petal, sage = cwOf("sage").petal;
  const planDays = [...((mealPlan?.plan_days || []).filter(Boolean))].sort((a, b) => (a.day ?? 0) - (b.day ?? 0));
  const todayIdx = (new Date().getDay() + 6) % 7;
  const distinctDinners = new Set(planDays.map((d) => cellName(d?.dinner)).filter(Boolean)).size;
  const [openMeal, setOpenMeal] = useState(null);
  const Section = ({ children }) => <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, fontWeight: 600, color: OXBLOOD, margin: "20px 2px 9px" }}>{children}</div>;
  const card = { background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 18, padding: "13px 14px" };
  const doLog = (meal) => { onLogMeal(meal.name, meal.slot); setOpenMeal(null); };
  // synchronous — swapMeal returns the new name immediately; batches with its own setMealPlan into one render
  const doSwap = (meal) => { const nn = onSwapMeal(meal.dayIdx, meal.slot); if (nn) setOpenMeal((mm) => (mm ? { ...mm, name: nn } : mm)); };
  const doShop = (meal) => { onShopMeal(meal.name); };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9992, backgroundColor: T.paper, ...SHEET_BG, overflowY: "auto" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px calc(40px + env(safe-area-inset-bottom))" }} className="fw-elite-in">
        <div style={{ position: "sticky", top: 0, zIndex: 2, backgroundColor: T.paper, display: "flex", alignItems: "center", gap: 10, padding: "16px 0 12px", borderBottom: `1px solid ${T.paperDeep}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold }}>Plan &amp; cook</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 23, fontWeight: 600, color: OXBLOOD }}>Plan your week</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="fw-elite-press" style={{ width: 34, height: 34, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.muted, cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}><X size={17} /></button>
        </div>

        <Section>Tell me what would help</Section>
        <div style={card}><div style={{ display: "flex", flexDirection: "column", minHeight: 10 }}><PlanSetupLens {...setup} busy={busy} /></div></div>

        {planDays.length > 0 && (<>
          <Section>Your week</Section>
          {planResult?.wellness_focus && (
            <div style={{ ...card, background: `${gold}10`, marginBottom: 10 }}>
              <div style={{ ...lbl, color: gold, marginBottom: 2 }}>Focus · {planResult.wellness_focus}</div>
              {planResult.weekly_tip && <p style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, margin: 0, lineHeight: 1.5 }}>{planResult.weekly_tip}</p>}
            </div>
          )}
          <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, margin: "0 2px 9px", lineHeight: 1.45 }}>{distinctDinners > 1 ? <><b style={{ color: sage }}>{distinctDinners} different dinners</b> this week. Tap any meal to see the recipe, swap it, or log it.</> : "Tap any meal to see the recipe, swap it, or log it."}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <Pill Icon={ShoppingBasket} cw="plum" filled onClick={busy ? undefined : onBuildShopping}>Shopping list for the week</Pill>
            <Pill Icon={CalendarDays} cw="gold" onClick={onOpenWeek}>Open in calendar</Pill>
          </div>
          <SprigDivider color={T.gold} my={4} />
          <div style={{ marginTop: 14 }}>{planDays.map((d) => (
            <PlanDayBlock key={d.day} day={d} isToday={d.day === todayIdx} numbersOff={numbersOff} onOpenMeal={setOpenMeal} onLogDay={onLogDay} busy={busy} />
          ))}</div>
        </>)}

        <Section>Saved weeks</Section>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, margin: "0 2px 9px", lineHeight: 1.45 }}>Every week you generate is kept here — tap one to bring it back.</p>
        <SavedPlansLens history={history} activeId={activeId} onUse={onUsePlan} />
      </div>
      {openMeal && <MealSheet meal={openMeal} numbersOff={numbersOff} onClose={() => setOpenMeal(null)} onLog={doLog} onSwap={doSwap} onShop={doShop} busy={busy} />}
    </div>
  );
}

const waterPill = { flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, background: `${cwOf("sky").petal}1f`, border: `1px solid ${cwOf("sky").petal}`, borderRadius: 999, padding: "9px 0", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: cwOf("sky").petal };

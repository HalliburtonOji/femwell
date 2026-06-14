// foodModel — the NUTRITION SPINE.
//
// ONE shared, normalized food/item model so nutrition data COMPOUNDS across the app:
// logging → progress → insights → the women's micronutrient layer all read the SAME
// real numbers, through the SAME helpers. This is the single source of truth for
// "what did a day / week of real MealLog rows add up to" (macros AND micros).
//
// Pure + dependency-light: this file imports ONLY the existing ai_analysis readers
// (readAiAnalysis / getMealSummary) from nutritionAiAnalysis.js. No entity calls, no
// network, no React. Everything is defensive — missing fields become 0/undefined,
// nothing here ever throws. NO EMOJI.
//
// Canonical shapes:
//   FoodItem  — one normalized food line (see FOOD_KEYS / normalizeFood).
//   DayTotals — { kcal, protein_g, carbs_g, fat_g, fiber_g, iron_mg, folate_ug,
//                 calcium_mg, known:{...flags} } from dayNutrition / rangeNutrition.
//
// Honesty guardrails (women's layer): STAGE_MICRO_TARGETS are SOFT reference points
// drawn from UK guidance (NHS / SACN), used only to detect "this nutrient is leaning
// light this week" — never shoved at the user as a numeric target, never a pass/fail,
// never deficiency-shaming. microNudgeForStage turns a lean into warm "foods + why"
// copy. We use only the strong-evidence nutrients (iron for menstruation, folate
// pre-conception/pregnancy, calcium+protein for peri/menopause/postpartum, fibre all
// stages). No cycle-syncing macros, no microbiome overclaim.

import { readAiAnalysis, getMealSummary } from "@/utils/nutritionAiAnalysis";
import { cofidFloorMicros } from "@/utils/cofid";

// ── canonical FoodItem keys (doc) ──────────────────────────────────────────────
// A FoodItem is the normalized shape every source (a logged meal item, an Open Food
// Facts product's nutriments, an analyzeMeal item, a recipe ingredient) collapses to.
//   name        human label, e.g. "Greek yoghurt"
//   key         lowercased canonical name (for dedupe / matching), e.g. "greek yoghurt"
//   qty         numeric quantity (portion count), defaults 1
//   unit        portion unit string, e.g. "g", "bowl", "" (unknown)
//   kcal        energy in kilocalories
//   protein_g   protein, grams
//   carbs_g     carbohydrate, grams
//   fat_g       fat, grams
//   fiber_g     fibre, grams
//   iron_mg     iron, milligrams
//   folate_ug   folate, micrograms
//   calcium_mg  calcium, milligrams
//   aisle       supermarket aisle (for shopping), e.g. "Produce" (optional)
//   source      provenance: "log" | "openfoodfacts" | "analyzeMeal" | "recipe" | "manual"
export const FOOD_KEYS = [
  "name", "key", "qty", "unit",
  "kcal", "protein_g", "carbs_g", "fat_g", "fiber_g",
  "iron_mg", "folate_ug", "calcium_mg",
  "aisle", "source",
];

// The macro/micro numeric nutrient keys the spine sums.
export const MACRO_KEYS = ["kcal", "protein_g", "carbs_g", "fat_g", "fiber_g"];
export const MICRO_KEYS = ["iron_mg", "folate_ug", "calcium_mg"];
export const NUTRIENT_KEYS = [...MACRO_KEYS, ...MICRO_KEYS];

// ── tiny pure helpers ───────────────────────────────────────────────────────────
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function lc(s) {
  return String(s || "").trim().toLowerCase();
}
// pick the first finite, defined number from a list of candidate fields
function firstNum(...vals) {
  for (const v of vals) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

// ── normalizeFood(input) ────────────────────────────────────────────────────────
// Accepts any of:
//   • a logged meal item / analyzeMeal item   { name, calories|kcal, protein_g, ... }
//   • an OFF product's nutriments map          { "energy-kcal_100g", proteins_100g, ... }
//     (pass { nutriments, product_name } or the nutriments object itself)
//   • a recipe ingredient                      { name | ingredient, quantity_text, ... }
// Returns the canonical FoodItem shape. Defensive: never throws; missing → 0/"".
export function normalizeFood(input, opts = {}) {
  const o = input || {};
  // OFF product passed whole → unwrap nutriments; otherwise treat o as the item.
  const isOffProduct = o.nutriments && typeof o.nutriments === "object";
  const n = isOffProduct ? o.nutriments : o;

  const name =
    o.name || o.product_name || o.ingredient || o.ingredient_name || o.title || "";
  const qty = firstNum(o.qty, o.quantity, opts.qty) || 1;
  const unit = o.unit || o.quantity_unit || "";

  // macros — accept many field spellings across the app's data sources
  const kcal = firstNum(o.kcal, o.calories, n["energy-kcal_100g"], n.energy_kcal_100g);
  const protein_g = firstNum(o.protein_g, o.protein, n.proteins_100g, n.proteins);
  const carbs_g = firstNum(o.carbs_g, o.carbs, n.carbohydrates_100g, n.carbohydrates);
  const fat_g = firstNum(o.fat_g, o.fat, n.fat_100g, n.fat);
  const fiber_g = firstNum(o.fiber_g, o.fibre_g, o.fiber, n.fiber_100g, n.fibre_100g, n.fiber);

  // micros — read canonical fields first, then OFF nutriment fields (scaled below)
  const iron_mg = firstNum(o.iron_mg, n.iron_mg);
  const folate_ug = firstNum(o.folate_ug, o.folate_mcg, n.folate_ug, n.folates_ug);
  const calcium_mg = firstNum(o.calcium_mg, n.calcium_mg);

  return {
    name: String(name || "").trim(),
    key: lc(name),
    qty,
    unit: String(unit || ""),
    kcal,
    protein_g,
    carbs_g,
    fat_g,
    fiber_g,
    iron_mg,
    folate_ug,
    calcium_mg,
    aisle: o.aisle || o.category || undefined,
    source: o.source || (isOffProduct ? "openfoodfacts" : undefined),
  };
}

// ── OFF nutriment → canonical micros (UNIT-AWARE, portion-scaled) ────────────────
// Open Food Facts gives nutriments per 100g (e.g. iron_100g). The base unit varies:
//   iron_100g / iron_value      grams      (so 0.0148 g = 14.8 mg)  → ×1000 to mg
//   calcium_100g                grams                               → ×1000 to mg
//   folates_100g / folate_100g  grams      (so 0.0004 g = 400 µg)   → ×1e6  to µg
// Some products store *_serving in the already-display unit; we prefer the _100g
// canonical fields and scale by portion (grams / 100). Defensive: missing → undefined.
// Returns { iron_mg?, calcium_mg?, folate_ug? } — only keys we actually found.
export function offMicrosFromNutriments(nutriments, portionGrams = 100) {
  const n = nutriments || {};
  const scale = (Number(portionGrams) > 0 ? Number(portionGrams) : 100) / 100;
  const out = {};

  // iron: OFF base unit is grams → mg = g * 1000
  const ironG = firstNum(n.iron_100g, n.iron_value, n.iron);
  if (ironG > 0) out.iron_mg = round1(ironG * 1000 * scale);

  // calcium: OFF base unit is grams → mg = g * 1000
  const calciumG = firstNum(n.calcium_100g, n.calcium_value, n.calcium);
  if (calciumG > 0) out.calcium_mg = Math.round(calciumG * 1000 * scale);

  // folate: OFF base unit is grams → µg = g * 1,000,000
  const folateG = firstNum(n.folates_100g, n.folate_100g, n.folates, n.folate);
  if (folateG > 0) out.folate_ug = Math.round(folateG * 1e6 * scale);

  return out;
}

function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

// ── micros for ONE meal (reads ai_analysis like the rest of the app) ─────────────
// Summary-first, items-fallback. Never invents a number (missing → 0). Returns the
// raw micro grams/mg/µg plus a `known` flag per nutrient (was any real value present).
// When `floor` is true, micros NOT backed by a real logged value are backfilled from
// the UK CoFID table (src/utils/cofid.js) using the meal's food names — so a plainly
// logged meal ("lentil & spinach soup") still yields a sensible iron/folate/calcium
// ESTIMATE for the women's layer. Backfilled values are flagged `estimated` (never
// counted as `known`), and `fiber_g_est` carries a fibre estimate for the same purpose.
function mealMicros(meal, floor = false) {
  const a = readAiAnalysis(meal);
  const s = (a && a.summary) || {};
  const items = (a && Array.isArray(a.items)) ? a.items : [];

  const fromItems = (k) => items.reduce((acc, it) => acc + num(it?.[k]), 0);
  const pick = (k) => (num(s[k]) > 0 ? num(s[k]) : fromItems(k));
  const present = (k) => num(s[k]) > 0 || items.some((it) => num(it?.[k]) > 0);

  let iron = pick("iron_mg"), folate = pick("folate_ug"), calcium = pick("calcium_mg");
  const known = { iron_mg: present("iron_mg"), folate_ug: present("folate_ug"), calcium_mg: present("calcium_mg") };
  const estimated = { iron_mg: false, folate_ug: false, calcium_mg: false };
  let fiber_g_est = 0;

  if (floor && (!known.iron_mg || !known.folate_ug || !known.calcium_mg)) {
    const text = [meal?.raw_text, ...items.map((it) => it?.name)].filter(Boolean).join(" ");
    const f = cofidFloorMicros(text);
    if (f) {
      if (!known.iron_mg && f.iron_mg > 0) { iron = f.iron_mg; estimated.iron_mg = true; }
      if (!known.folate_ug && f.folate_ug > 0) { folate = f.folate_ug; estimated.folate_ug = true; }
      if (!known.calcium_mg && f.calcium_mg > 0) { calcium = f.calcium_mg; estimated.calcium_mg = true; }
      fiber_g_est = f.fiber_g || 0;
    }
  }

  return { iron_mg: iron, folate_ug: folate, calcium_mg: calcium, fiber_g_est, known, estimated };
}

// ── dayNutrition(meals) — THE one source of truth for a day's totals ─────────────
// Sums macros AND micros across a day's real MealLog rows. Macros come through
// getMealSummary (so BOTH the new `summary` and legacy `nutritional_summary` shapes
// count, and items[] fall back when summary macros are zero). Micros come through
// mealMicros (summary-first, items-fallback). `known` flags say whether ANY real
// value backed each nutrient this day (so the UI can stay honest about gaps).
export function dayNutrition(meals, opts = {}) {
  const floor = !!opts.floor;   // backfill missing micros + fibre from the UK CoFID table
  const rows = (meals || []).filter(Boolean);
  const totals = {
    kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0,
    iron_mg: 0, folate_ug: 0, calcium_mg: 0,
    known: {
      kcal: false, protein_g: false, fiber_g: false,
      iron_mg: false, folate_ug: false, calcium_mg: false,
    },
    // which nutrients were partly filled from CoFID estimates (never counted as `known`)
    estimated: { iron_mg: false, folate_ug: false, calcium_mg: false, fiber_g: false },
  };
  if (rows.length === 0) return totals;

  for (const m of rows) {
    const s = getMealSummary(m).summary || {};
    const kcal = num(s.calories);
    const protein = num(s.protein_g);
    const carbs = num(s.carbs_g);
    const fat = num(s.fat_g);
    const fiber = num(s.fiber_g);
    totals.kcal += kcal;
    totals.protein_g += protein;
    totals.carbs_g += carbs;
    totals.fat_g += fat;
    totals.fiber_g += fiber;
    if (kcal > 0) totals.known.kcal = true;
    if (protein > 0) totals.known.protein_g = true;
    if (fiber > 0) totals.known.fiber_g = true;

    const micros = mealMicros(m, floor);
    totals.iron_mg += micros.iron_mg;
    totals.folate_ug += micros.folate_ug;
    totals.calcium_mg += micros.calcium_mg;
    if (micros.known.iron_mg) totals.known.iron_mg = true;
    if (micros.known.folate_ug) totals.known.folate_ug = true;
    if (micros.known.calcium_mg) totals.known.calcium_mg = true;
    if (micros.estimated.iron_mg) totals.estimated.iron_mg = true;
    if (micros.estimated.folate_ug) totals.estimated.folate_ug = true;
    if (micros.estimated.calcium_mg) totals.estimated.calcium_mg = true;
    // fibre floor: only add a CoFID fibre estimate for meals that logged no fibre
    if (floor && fiber === 0 && micros.fiber_g_est > 0) {
      totals.fiber_g += micros.fiber_g_est;
      totals.estimated.fiber_g = true;
    }
  }

  // round for display-friendliness while keeping iron at 1dp
  totals.kcal = Math.round(totals.kcal);
  totals.protein_g = Math.round(totals.protein_g);
  totals.carbs_g = Math.round(totals.carbs_g);
  totals.fat_g = Math.round(totals.fat_g);
  totals.fiber_g = Math.round(totals.fiber_g);
  totals.iron_mg = round1(totals.iron_mg);
  totals.folate_ug = Math.round(totals.folate_ug);
  totals.calcium_mg = Math.round(totals.calcium_mg);
  return totals;
}

// ── rangeNutrition(meals, days) — same totals over a recent window ───────────────
// Sums every meal whose day_key falls in the last `days` days (inclusive of today),
// plus per-day means + the count of distinct days with real micro data (so weekly
// insights can lean on "this week" honestly). `meals` may be the full history; we
// filter by day_key here. Returns dayNutrition's totals PLUS { days, loggedDays,
// perDay:{...means}, microDays:{...} }.
export function rangeNutrition(meals, days = 7, opts = {}) {
  const floor = !!opts.floor;
  const rows = (meals || []).filter(Boolean);
  const span = Math.max(1, Number(days) || 7);
  const since = dayKeyNDaysAgo(span - 1);

  const inRange = rows.filter((m) => {
    const k = m.day_key;
    return typeof k === "string" && k >= since;
  });

  const totals = dayNutrition(inRange, { floor });
  const loggedDays = new Set(inRange.map((m) => m.day_key).filter(Boolean)).size;

  // per-day means over the days she actually logged (no fake /7 division)
  const denom = loggedDays || 1;
  const perDay = {};
  for (const k of NUTRIENT_KEYS) perDay[k] = round1((totals[k] || 0) / denom);

  // how many distinct logged days carried each micro (honesty signal)
  const microDays = { iron_mg: new Set(), folate_ug: new Set(), calcium_mg: new Set() };
  for (const m of inRange) {
    const micros = mealMicros(m);
    if (micros.known.iron_mg) microDays.iron_mg.add(m.day_key);
    if (micros.known.folate_ug) microDays.folate_ug.add(m.day_key);
    if (micros.known.calcium_mg) microDays.calcium_mg.add(m.day_key);
  }

  return {
    ...totals,
    days: span,
    loggedDays,
    perDay,
    microDays: {
      iron_mg: microDays.iron_mg.size,
      folate_ug: microDays.folate_ug.size,
      calcium_mg: microDays.calcium_mg.size,
    },
  };
}

// local YYYY-MM-DD for N days ago (no date-fns dependency; pure)
function dayKeyNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - (Number(n) || 0));
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

// ── extractIngredients(planDays) — the SHARED plan→ingredient extractor ──────────
// Turns a MealPlans plan_days array (meal NAME strings) into a normalized, aisle-
// tagged ingredient list. Deterministic dictionary scan (NOT a naive whitespace
// split): each meal name is searched for known food words and THOSE are pulled out.
// This replaces the per-component keyword dict that used to live in UnifiedShoppingTab,
// so logging/shopping share one extractor. Returns [{ name, key, aisle }] (deduped).
//
// Handles both plan shapes:
//   new:    [{ day, breakfast:[str], lunch:[str], dinner:[str], snack:[str] }]
//   legacy: [{ meals:{ breakfast:str|[str], ... } }]
const INGREDIENT_DB = [
  // Produce
  ["spinach", "Spinach", "Produce"], ["kale", "Kale", "Produce"], ["rocket", "Rocket", "Produce"],
  ["red onion", "Red onion", "Produce"], ["spring onion", "Spring onions", "Produce"], ["onion", "Onion", "Produce"],
  ["garlic", "Garlic", "Produce"], ["cherry tomato", "Cherry tomatoes", "Produce"], ["tomato", "Tomatoes", "Produce"],
  ["pepper", "Pepper", "Produce"], ["courgette", "Courgette", "Produce"], ["aubergine", "Aubergine", "Produce"],
  ["mushroom", "Mushrooms", "Produce"], ["carrot", "Carrots", "Produce"], ["broccoli", "Broccoli", "Produce"],
  ["cauliflower", "Cauliflower", "Produce"], ["sweet potato", "Sweet potato", "Produce"], ["potato", "Potatoes", "Produce"],
  ["cucumber", "Cucumber", "Produce"], ["lettuce", "Lettuce", "Produce"], ["avocado", "Avocado", "Produce"],
  ["lemon", "Lemon", "Produce"], ["lime", "Lime", "Produce"], ["ginger", "Ginger", "Produce"],
  ["banana", "Banana", "Produce"], ["apple", "Apple", "Produce"],
  ["blueberr", "Blueberries", "Produce"], ["strawberr", "Strawberries", "Produce"], ["berries", "Berries", "Produce"],
  ["peas", "Peas", "Produce"], ["leek", "Leek", "Produce"], ["celery", "Celery", "Produce"], ["beetroot", "Beetroot", "Produce"],
  // Protein
  ["chicken", "Chicken", "Protein"], ["beef", "Beef", "Protein"], ["mince", "Mince", "Protein"],
  ["pork", "Pork", "Protein"], ["lamb", "Lamb", "Protein"], ["turkey", "Turkey", "Protein"],
  ["salmon", "Salmon", "Protein"], ["tuna", "Tuna", "Protein"], ["cod", "Cod", "Protein"],
  ["prawn", "Prawns", "Protein"], ["sardine", "Sardines", "Protein"], ["fish", "Fish", "Protein"],
  ["sausage", "Sausages", "Protein"], ["bacon", "Bacon", "Protein"], ["tofu", "Tofu", "Protein"],
  ["chickpea", "Chickpeas", "Cupboard"], ["lentil", "Lentils", "Cupboard"], ["bean", "Beans", "Cupboard"], ["egg", "Eggs", "Dairy"],
  // Dairy
  ["milk", "Milk", "Dairy"], ["cheese", "Cheese", "Dairy"], ["feta", "Feta", "Dairy"],
  ["yoghurt", "Yoghurt", "Dairy"], ["yogurt", "Yoghurt", "Dairy"], ["butter", "Butter", "Dairy"],
  ["cream", "Cream", "Dairy"], ["halloumi", "Halloumi", "Dairy"], ["mozzarella", "Mozzarella", "Dairy"],
  // Bakery
  ["bread", "Bread", "Bakery"], ["toast", "Bread", "Bakery"], ["bagel", "Bagels", "Bakery"],
  ["wrap", "Wraps", "Bakery"], ["tortilla", "Tortillas", "Bakery"], ["pitta", "Pitta", "Bakery"],
  ["roll", "Rolls", "Bakery"], ["muffin", "Muffins", "Bakery"],
  // Cupboard
  ["rice", "Rice", "Cupboard"], ["pasta", "Pasta", "Cupboard"], ["noodle", "Noodles", "Cupboard"],
  ["oats", "Oats", "Cupboard"], ["porridge", "Oats", "Cupboard"], ["quinoa", "Quinoa", "Cupboard"],
  ["couscous", "Couscous", "Cupboard"], ["flour", "Flour", "Cupboard"], ["sugar", "Sugar", "Cupboard"],
  ["olive oil", "Olive oil", "Cupboard"], ["oil", "Olive oil", "Cupboard"], ["honey", "Honey", "Cupboard"],
  ["stock", "Stock", "Cupboard"], ["curry", "Curry paste", "Cupboard"], ["coconut milk", "Coconut milk", "Cupboard"],
  ["soy sauce", "Soy sauce", "Cupboard"], ["peanut butter", "Peanut butter", "Cupboard"], ["nuts", "Nuts", "Cupboard"],
  ["almond", "Almonds", "Cupboard"], ["seeds", "Seeds", "Cupboard"], ["granola", "Granola", "Cupboard"],
  ["passata", "Passata", "Cupboard"], ["tinned tomato", "Tinned tomatoes", "Cupboard"],
  // Frozen
  ["frozen pea", "Frozen peas", "Frozen"], ["ice cream", "Ice cream", "Frozen"],
];

// Extract canonical ingredients from one meal NAME (deterministic dictionary scan).
export function extractFromName(name) {
  const text = lc(name);
  if (!text) return [];
  const hits = [];
  const seen = new Set();
  for (const [kw, canon, aisle] of INGREDIENT_DB) {
    if (text.includes(kw) && !seen.has(canon)) {
      seen.add(canon);
      hits.push({ name: canon, key: lc(canon), aisle });
    }
  }
  return hits;
}

// Collect every meal NAME from a plan_days array (both shapes), then extract.
export function extractIngredients(planDays) {
  const names = [];
  for (const pd of (planDays || []).filter(Boolean)) {
    // new shape: slot arrays/strings on the day row
    for (const slot of ["breakfast", "lunch", "dinner", "snack"]) {
      const cell = pd[slot];
      if (Array.isArray(cell)) cell.forEach((n) => n && names.push(n));
      else if (typeof cell === "string" && cell) names.push(cell);
    }
    // legacy shape: pd.meals.{slot}
    if (pd.meals && typeof pd.meals === "object") {
      for (const slot of ["breakfast", "lunch", "dinner", "snack"]) {
        const cell = pd.meals[slot];
        if (Array.isArray(cell)) cell.forEach((n) => n && names.push(n));
        else if (typeof cell === "string" && cell) names.push(cell);
        else if (cell?.name) names.push(cell.name);
      }
    }
  }

  // dedupe by canonical key, keep first aisle seen
  const byKey = new Map();
  const unread = [];
  for (const n of names) {
    const hits = extractFromName(n);
    if (hits.length === 0) { unread.push(n); continue; }
    for (const h of hits) if (!byKey.has(h.key)) byKey.set(h.key, h);
  }
  return { items: [...byKey.values()], unreadNames: unread, names };
}

// ── STAGE_MICRO_TARGETS — soft UK reference points (NOT hard targets) ────────────
// Per-life-stage gentle reference values, used ONLY to detect a lean (this nutrient
// is running light this week). Values are UK guidance (NHS / SACN RNIs), e.g. iron
// 14.8mg/day for menstruating women, folate 400µg in pre-conception/early pregnancy,
// calcium 700mg/day adults, fibre 30g/day adults. These are intentionally framed as
// soft guides; the UI never shows them as numbers to hit.
export const STAGE_MICRO_TARGETS = {
  teen:            { iron_mg: 14.8, calcium_mg: 800, fiber_g: 25 },
  reproductive:    { iron_mg: 14.8, calcium_mg: 700, fiber_g: 30 },
  "pre-ttc":       { folate_ug: 400, iron_mg: 14.8, fiber_g: 30 },
  ttc:             { folate_ug: 400, iron_mg: 14.8, fiber_g: 30 },
  pregnant:        { folate_ug: 400, iron_mg: 14.8, calcium_mg: 700, fiber_g: 30 },
  "pregnant-t1":   { folate_ug: 400, iron_mg: 14.8, fiber_g: 30 },
  "pregnant-t2":   { iron_mg: 14.8, calcium_mg: 700, fiber_g: 30 },
  "pregnant-t3":   { iron_mg: 14.8, calcium_mg: 700, fiber_g: 30 },
  postpartum:      { iron_mg: 14.8, protein_g: 60, fiber_g: 30 },
  perimenopause:   { iron_mg: 14.8, calcium_mg: 700, protein_g: 60, fiber_g: 30 },
  menopause:       { calcium_mg: 700, protein_g: 60, fiber_g: 30 },
  "post-menopause":{ calcium_mg: 700, protein_g: 60, fiber_g: 30 },
};

// gentle "foods + why" copy per nutrient (mirrors the stageNudges voice).
const NUTRIENT_FOODS = {
  iron_mg:    { label: "Iron",    foods: "lentils · leafy greens · red meat", why: "supports steady energy" },
  folate_ug:  { label: "Folate",  foods: "leafy greens · beans · fortified grains", why: "the gentle pre-conception foundation" },
  calcium_mg: { label: "Calcium", foods: "yoghurt · tinned sardines · fortified plant milk", why: "kind to bones (with vitamin D)" },
  protein_g:  { label: "Protein", foods: "eggs · fish · beans", why: "helps hold onto muscle and energy" },
  fiber_g:    { label: "Fibre",   foods: "oats · beans · wholegrains", why: "kind to digestion" },
};

// ── microNudgeForStage(profile, dayOrWeekNutrition) ──────────────────────────────
// DATA-DRIVEN: given the real week (or day) totals from rangeNutrition/dayNutrition,
// returns which of this stage's reference nutrients are leaning light, with the
// foods + why for each. A "picture, not a target":
//   • Only considers nutrients in this stage's STAGE_MICRO_TARGETS.
//   • A nutrient leans LOW only when we actually have some real data for it AND the
//     week's per-day mean sits below ~70% of the soft reference (so we never shame a
//     gap that's really just un-logged micros — missing data → not a lean).
//   • Returns { hasData, leaning:[{ key, label, foods, why }], all:[...refs] } so the
//     women's layer can drive cards from real numbers, with a gentle generic fallback
//     when there's nothing logged yet. Never returns a numeric target to display.
export function microNudgeForStage(profile, nutrition) {
  const stage = profile?.life_stage || profile?.stage;
  const refs = STAGE_MICRO_TARGETS[stage] || STAGE_MICRO_TARGETS.reproductive;
  const n = nutrition || {};
  // per-day means if a range was passed; else treat the totals as a single day
  const perDay = n.perDay || {
    iron_mg: n.iron_mg, folate_ug: n.folate_ug, calcium_mg: n.calcium_mg,
    protein_g: n.protein_g, fiber_g: n.fiber_g,
  };
  const known = n.known || {};
  const loggedDays = n.loggedDays != null ? n.loggedDays : (n.kcal > 0 ? 1 : 0);

  const all = Object.keys(refs).map((key) => ({
    key,
    ...(NUTRIENT_FOODS[key] || { label: key, foods: "", why: "" }),
  }));

  // No real data yet → no lean (caller shows the gentle generic copy).
  if (!loggedDays) return { hasData: false, leaning: [], all };

  const leaning = [];
  for (const key of Object.keys(refs)) {
    const target = num(refs[key]);
    if (!target) continue;
    // honesty: macros are reliably logged; micros only "count" if some real value
    // backed them this week. Otherwise a missing micro is a data gap, not a lean.
    const isMicro = MICRO_KEYS.includes(key);
    if (isMicro && !known[key]) continue;
    const had = num(perDay[key]);
    // only flag a genuine lean, with a real value present, below ~70% of the soft ref
    if (had > 0 && had < target * 0.7) {
      leaning.push({ key, ...(NUTRIENT_FOODS[key] || { label: key }) });
    }
  }

  return { hasData: true, leaning, all };
}

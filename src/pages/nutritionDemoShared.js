// ─────────────────────────────────────────────────────────────────────────────
// nutritionDemoShared — ONE mock dataset for all 5 Nutrition UX demos.
//
// Every NutritionDemo1..5 page imports from here so Halli compares the UX
// METAPHOR, not the numbers. Pure data + tiny pure helpers — NO JSX, NO
// entities, NO network. UK context (£, NHS framing, metric). Whole-life,
// non-scoreboard, women-aware. No emoji anywhere.
//
// FEATURE SUPERSET every demo must surface (the 7 current tabs + the planned
// P0/P1 layer), just organised differently per demo:
//   1. TODAY        — today's plate, gentle energy/macro picture, hydration
//   2. LOG          — frictionless logging: recents, favourites, photo, voice
//   3. MY PLAN      — personal targets (energy + the 5 women's micronutrients)
//   4. RECIPES      — saved + AI recipe generator (uses what's in)
//   5. AI MEAL PLAN — generate a stage-aware day/week
//   6. SHOP         — shopping list grouped by aisle, from the plan
//   7. PROGRESS     — gentle patterns over time (NO streaks / vanity counts)
//   8. INSIGHTS     — women's stage-aware micronutrient nudges + Jess notes
// ─────────────────────────────────────────────────────────────────────────────

// The user we're mocking — a real-feeling FemWell member.
export const ME = {
  name: "Halli",
  stage: "perimenopause",          // one of the 11 life stages
  stageLabel: "Perimenopause",
  cyclePhase: "Follicular · Day 6",
  greetingTime: "Good evening",
};

// ── The 7 feature surfaces (id + label + one-line purpose) ──────────────────
export const SURFACES = [
  { id: "today",    label: "Today",      blurb: "Your plate so far today" },
  { id: "log",      label: "Log",        blurb: "Add a meal in seconds" },
  { id: "plan",     label: "My Plan",    blurb: "What your body's asking for" },
  { id: "recipes",  label: "Recipes",    blurb: "Cook what you have in" },
  { id: "mealplan", label: "Meal Plan",  blurb: "A gentle plan for the week" },
  { id: "shop",     label: "Shop",       blurb: "The list, sorted by aisle" },
  { id: "progress", label: "Progress",   blurb: "Patterns, not scores" },
  { id: "insights", label: "Insights",   blurb: "Nourishment for your stage" },
];

// ── TODAY: the gentle energy + macro picture ────────────────────────────────
// Framed as "nourishment so far", never a calorie scoreboard. Targets are a
// soft guide, shown as "room for more" not "you've failed".
export const TODAY = {
  energy:   { had: 1180, guide: 1850, unit: "kcal" },   // ~64% — "still room to nourish"
  protein:  { had: 52,   guide: 80,  unit: "g" },
  fibre:    { had: 18,   guide: 30,  unit: "g" },
  iron:     { had: 9,    guide: 14,  unit: "mg" },
  calcium:  { had: 620,  guide: 1000, unit: "mg" },
  warmline: "You're well nourished so far — a little more iron and fibre would round the day out kindly.",
};

// Hydration — cups, gentle, no guilt.
export const HYDRATION = { cups: 5, guide: 8, lastAt: "16:40" };

// Today's logged meals.
export const MEALS = [
  { id: "m1", slot: "Breakfast", time: "07:50", title: "Greek yoghurt, berries & oats",
    items: ["Greek yoghurt 150g", "Blueberries 80g", "Porridge oats 40g", "Pumpkin seeds 10g"],
    kcal: 360, protein: 22, fibre: 6, iron: 2, note: "iron + calcium" },
  { id: "m2", slot: "Lunch", time: "12:45", title: "Lentil & spinach soup, wholemeal roll",
    items: ["Lentil soup 1 bowl", "Spinach handful", "Wholemeal roll"],
    kcal: 430, protein: 18, fibre: 9, iron: 5, note: "iron + fibre" },
  { id: "m3", slot: "Snack", time: "15:30", title: "Apple & a few walnuts",
    items: ["Apple", "Walnuts 20g"], kcal: 190, protein: 4, fibre: 3, iron: 1, note: "omega-3" },
  { id: "m4", slot: "Dinner", time: null, title: null, items: [], kcal: 0, planned: "Salmon, new potatoes & greens" },
];

// ── LOG: frictionless logging surfaces ──────────────────────────────────────
// Recents + favourites make logging a one-tap act; photo + voice are the
// planned P1 capture modes (mocked as available).
export const RECENTS = [
  { id: "r1", name: "Greek yoghurt 150g",   kcal: 130, tag: "calcium" },
  { id: "r2", name: "Porridge oats 40g",    kcal: 150, tag: "fibre" },
  { id: "r3", name: "Lentil soup, 1 bowl",  kcal: 220, tag: "iron" },
  { id: "r4", name: "Banana",               kcal: 95,  tag: "potassium" },
  { id: "r5", name: "Oat flat white",       kcal: 120, tag: "" },
  { id: "r6", name: "Hummus & carrots",     kcal: 160, tag: "fibre" },
];
export const FAVOURITES = [
  { id: "f1", name: "Salmon fillet 120g",  kcal: 250, tag: "omega-3 · vit D" },
  { id: "f2", name: "Two boiled eggs",      kcal: 140, tag: "protein" },
  { id: "f3", name: "Spinach handful",      kcal: 25,  tag: "iron · folate" },
  { id: "f4", name: "Greek yoghurt 150g",   kcal: 130, tag: "calcium" },
];
export const LOG_METHODS = [
  { id: "search", label: "Search foods", hint: "UK food database" },
  { id: "recent", label: "Recents",      hint: "one tap to re-add" },
  { id: "fave",   label: "Favourites",   hint: "your go-tos" },
  { id: "photo",  label: "Snap a photo", hint: "we'll estimate it" },
  { id: "voice",  label: "Say it",       hint: '“a bowl of porridge”' },
  { id: "barcode",label: "Scan barcode", hint: "off the packet" },
];
// Search results sample (typed: "spin")
export const FOOD_SEARCH_SAMPLE = [
  { id: "s1", name: "Spinach, raw",   per: "per 100g", kcal: 23,  tag: "iron · folate" },
  { id: "s2", name: "Spinach, cooked",per: "per 100g", kcal: 23,  tag: "iron · folate" },
  { id: "s3", name: "Spinach & ricotta tortelloni", per: "per 250g", kcal: 340, tag: "" },
];

// ── MY PLAN: the soft targets, framed as what the body's asking for ─────────
export const PLAN = {
  energyGuide: 1850,
  why: "Tuned to your perimenopause stage and an active week — a guide, never a cap.",
  targets: [
    { key: "protein", label: "Protein", guide: "80 g", why: "holds muscle & steadies energy through the shift" },
    { key: "fibre",   label: "Fibre",   guide: "30 g", why: "eases digestion and supports hormone clearance" },
    { key: "iron",    label: "Iron",    guide: "14 mg", why: "periods can still be heavy in perimenopause" },
    { key: "calcium", label: "Calcium", guide: "1000 mg", why: "protects bone as oestrogen dips" },
    { key: "omega3",  label: "Omega-3", guide: "1.5 g", why: "mood and joints through the transition" },
  ],
};

// ── MICRONUTRIENT FOCUS (women's, stage-aware, evidence-based, gentle) ──────
// These are the "Insights" nudges. Strong-evidence nutrients only — framed as
// warm encouragement, never clinical prescriptions.
export const MICROS = [
  { key: "iron",    label: "Iron",    had: 9,   guide: 14,  unit: "mg",
    foods: ["lentils", "spinach", "red meat", "fortified cereal"],
    note: "Pair with vitamin C (a squeeze of lemon, peppers) to absorb more." },
  { key: "fibre",   label: "Fibre",   had: 18,  guide: 30,  unit: "g",
    foods: ["oats", "beans", "wholegrains", "berries"],
    note: "Most UK women get ~19g; 30g is the gentle goal." },
  { key: "calcium", label: "Calcium", had: 620, guide: 1000, unit: "mg",
    foods: ["yoghurt", "tinned sardines", "fortified plant milk", "kale"],
    note: "Bone matters more as oestrogen falls in perimenopause." },
  { key: "protein", label: "Protein", had: 52,  guide: 80,  unit: "g",
    foods: ["eggs", "fish", "tofu", "Greek yoghurt"],
    note: "Spread it across the day — it holds energy and muscle." },
  { key: "folate",  label: "Folate",  had: 240, guide: 400, unit: "µg",
    foods: ["leafy greens", "chickpeas", "asparagus"],
    note: "Always worth keeping up across the reproductive years." },
];

// ── RECIPES: saved + an AI generator that cooks from what's in ──────────────
export const RECIPES = [
  { id: "rc1", title: "Lemony lentil & spinach soup", mins: 30, serves: 4,
    tags: ["iron", "fibre", "batch-friendly"], why: "Iron-rich and freezes beautifully.",
    have: ["lentils", "spinach", "onion", "stock"], need: ["lemon"] },
  { id: "rc2", title: "Salmon traybake with greens & new potatoes", mins: 35, serves: 2,
    tags: ["omega-3", "vit D", "one-tray"], why: "Omega-3 and vitamin D in one tin.",
    have: ["salmon", "new potatoes", "broccoli"], need: ["lemon", "dill"] },
  { id: "rc3", title: "Overnight oats, three ways", mins: 5, serves: 1,
    tags: ["fibre", "calcium", "make-ahead"], why: "Tomorrow's breakfast, sorted tonight.",
    have: ["oats", "yoghurt", "berries"], need: [] },
];
// What the AI generator "produced" from the user's in-stock + stage.
export const AI_RECIPE = {
  title: "Chickpea, spinach & lemon one-pan",
  mins: 25, serves: 2,
  why: "Built from what you have in, leaning into iron and fibre for your stage.",
  ingredients: ["Chickpeas 1 tin", "Spinach 2 handfuls", "Garlic 2 cloves",
    "Lemon 1", "Cumin 1 tsp", "Olive oil", "Wholemeal flatbread to serve"],
  steps: [
    "Soften garlic and cumin in oil.",
    "Add chickpeas, crisp slightly, then wilt the spinach through.",
    "Finish with lemon; serve on warm flatbread.",
  ],
  nutrition: "≈ 410 kcal · 18g protein · 11g fibre · 5mg iron per serve",
};

// ── AI MEAL PLAN: a gentle, stage-aware week ────────────────────────────────
export const MEAL_PLAN = {
  intro: "A balanced week leaning gently into iron, calcium and protein for perimenopause. Swap anything — it bends to you.",
  days: [
    { day: "Mon", b: "Overnight oats & berries", l: "Lentil & spinach soup", d: "Salmon traybake" },
    { day: "Tue", b: "Greek yoghurt & seeds",    l: "Chickpea & feta salad",  d: "Tofu stir-fry" },
    { day: "Wed", b: "Eggs on wholemeal toast",  l: "Leftover traybake",      d: "Sardine pasta" },
    { day: "Thu", b: "Porridge & banana",        l: "Hummus & rye wrap",      d: "Chicken & greens" },
    { day: "Fri", b: "Smoothie & oats",          l: "Jacket potato & beans",  d: "Veg & bean chilli" },
  ],
  note: "Weekends left open on purpose — room for joy, eating out, and rest.",
};

// ── SHOP: the list, grouped by aisle, generated from the plan ───────────────
export const SHOPPING = [
  { aisle: "Fresh", items: ["Spinach 2 bags", "Lemons x4", "Broccoli", "New potatoes 1kg", "Banana bunch"] },
  { aisle: "Protein", items: ["Salmon fillets x2", "Free-range eggs x6", "Firm tofu", "Tinned sardines x2"] },
  { aisle: "Cupboard", items: ["Lentils 2 tins", "Chickpeas 2 tins", "Porridge oats", "Wholemeal flatbread"] },
  { aisle: "Chilled", items: ["Greek yoghurt 500g", "Feta", "Fortified oat milk"] },
];
export const SHOP_META = { items: 17, est: "£24–28", forDays: 5 };

// ── PROGRESS: gentle patterns, explicitly NOT a scoreboard ──────────────────
// No streaks, no "you hit your goal X days". Just kind, useful observations.
export const PROGRESS = {
  framing: "No streaks, no scores. Just what your body's been telling you.",
  patterns: [
    { title: "Iron is trending up", detail: "More lentils and greens this fortnight than last — nice.", tone: "good" },
    { title: "Afternoons run light", detail: "Most days dip around 3pm. A protein snack might steady it.", tone: "note" },
    { title: "You eat brightest on calm days", detail: "Your most nourishing days line up with lower-stress days in your journal.", tone: "good" },
  ],
  // sparkline-style weekly nourishment (0-100, gentle, unlabelled axis)
  spark: [62, 70, 58, 74, 66, 80, 72],
  hydrationWeek: [6, 7, 5, 8, 6, 7, 5],
};

// ── INSIGHTS / JESS: the women-aware, whole-life voice ──────────────────────
export const JESS = {
  avatar: "botanical",
  todayLine: "You've nourished yourself kindly today. A little iron at dinner — salmon or lentils — would round it out for where you are in your cycle.",
  insights: [
    { title: "Your stage: perimenopause", body: "Bone and muscle want a little extra care now. Calcium, protein and gentle strength go a long way — food first." },
    { title: "Not a numbers game", body: "We'll never reduce you to a calorie count. The picture matters more than any single day." },
    { title: "Eat with the day", body: "Lighter mornings, a steadying protein snack mid-afternoon, an iron-leaning dinner. Rhythm over rules." },
  ],
};

// Crisis / safety line reused from the app's framing — never medical advice.
export const NOT_MEDICAL = "Not medical advice — Jess is a wellness companion.";
export const FOOTER_LINE = "FemWell · nourishment for your whole life, not a scoreboard.";

// ── tiny pure helpers (no JSX) ──────────────────────────────────────────────
export const pct = (had, guide) => Math.max(0, Math.min(100, Math.round((had / guide) * 100)));
export const kcalLeft = () => Math.max(0, TODAY.energy.guide - TODAY.energy.had);

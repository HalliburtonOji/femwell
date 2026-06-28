// recipeLibrary — the curated, client-side recipe library powering the Nutrition Recipes lens,
// "Cook what's in", "Generate", and the meal-plan generator. NO AI, NO base44 function — a static,
// stage/diet/nutrient-tagged set built from VERIFIED-EMBEDDABLE YouTube cook videos (a prior agent
// confirmed each youtube_id is live + embeddable via oEmbed + the nocookie embed page — DO NOT change
// the youtube_id values). Each row carries a concise editorial `ingredients` array (for shopping/pantry)
// and a one-line `blurb`. `rough_kcal`/`rough_protein_g`/`minutes` are DISPLAY-ONLY rough guides.
//
// diet tags: meat · veg (vegetarian) · vegan · gf (gluten-free)
// nutrient_story: protein · iron · folate · fibre · calcium · comfort

export const RECIPE_LIBRARY = [
  {
    youtube_id: "-h4KJXsFstc",
    title: "Easy Harissa Chicken (5 Ingredients)",
    channel: "Jamie Oliver",
    minutes: 20,
    diet: ["meat", "gf"],
    nutrient_story: "protein",
    stage_relevance: "fast high-protein dinner for busy weeks",
    rough_kcal: 480,
    rough_protein_g: 38,
    blurb: "Five ingredients, twenty minutes — a warm, gently spiced traybake for a busy weeknight.",
    ingredients: [
      { name: "Chicken thighs", quantity_text: "4 fillets" },
      { name: "Harissa paste", quantity_text: "2 tbsp" },
      { name: "Cherry tomatoes", quantity_text: "1 punnet" },
      { name: "Red onion", quantity_text: "1, sliced" },
      { name: "Olive oil", quantity_text: "1 tbsp" },
      { name: "Fresh coriander", quantity_text: "small bunch" },
    ],
  },
  {
    youtube_id: "DeYvfSLYWOE",
    title: "Red Lentil Soup with Lemon Mint Yogurt",
    channel: "Food Wishes",
    minutes: 35,
    diet: ["veg", "gf"],
    nutrient_story: "iron",
    stage_relevance: "plant iron + folate around your period",
    rough_kcal: 320,
    rough_protein_g: 16,
    blurb: "Velvety, warming and quietly iron-rich — a kind bowl for the days around your period.",
    ingredients: [
      { name: "Red lentils", quantity_text: "250g" },
      { name: "Onion", quantity_text: "1, chopped" },
      { name: "Carrot", quantity_text: "2, chopped" },
      { name: "Cumin", quantity_text: "1 tsp" },
      { name: "Vegetable stock", quantity_text: "1 litre" },
      { name: "Natural yoghurt", quantity_text: "150g" },
      { name: "Lemon", quantity_text: "1" },
      { name: "Fresh mint", quantity_text: "small bunch" },
    ],
  },
  {
    youtube_id: "SchFUWo4ivU",
    title: 'Green Lentil "Gumbo" Soup',
    channel: "Food Wishes",
    minutes: 45,
    diet: ["veg"],
    nutrient_story: "iron",
    stage_relevance: "iron-rich batch soup to restock after a heavy period",
    rough_kcal: 360,
    rough_protein_g: 18,
    blurb: "A deep, smoky batch soup — make a big pot to restock your stores after a heavy week.",
    ingredients: [
      { name: "Green lentils", quantity_text: "300g" },
      { name: "Celery", quantity_text: "3 sticks" },
      { name: "Green pepper", quantity_text: "1, diced" },
      { name: "Onion", quantity_text: "1, chopped" },
      { name: "Smoked paprika", quantity_text: "1 tsp" },
      { name: "Plum tomatoes", quantity_text: "1 tin" },
      { name: "Vegetable stock", quantity_text: "1.2 litres" },
    ],
  },
  {
    youtube_id: "YD_04AAH7q4",
    title: "Spinach, Sweet Potato & Lentil Dhal",
    channel: "BBC Good Food",
    minutes: 30,
    diet: ["vegan", "gf"],
    nutrient_story: "folate",
    stage_relevance: "folate + iron for pre-conception and pregnancy",
    rough_kcal: 410,
    rough_protein_g: 17,
    blurb: "Folate and plant iron in a comforting one-pot — gentle and easy to keep down.",
    ingredients: [
      { name: "Red lentils", quantity_text: "250g" },
      { name: "Sweet potato", quantity_text: "1 large, cubed" },
      { name: "Spinach", quantity_text: "200g" },
      { name: "Coconut milk", quantity_text: "1 tin" },
      { name: "Curry powder", quantity_text: "2 tbsp" },
      { name: "Garlic", quantity_text: "3 cloves" },
      { name: "Fresh ginger", quantity_text: "thumb-sized piece" },
    ],
  },
  {
    youtube_id: "5bsvxIDkm4g",
    title: "Chickpea Curry (One-Pot)",
    channel: "Rainbow Plant Life",
    minutes: 45,
    diet: ["vegan", "gf"],
    nutrient_story: "fibre",
    stage_relevance: "gut-friendly fibre + plant iron",
    rough_kcal: 430,
    rough_protein_g: 15,
    blurb: "A rich, fragrant one-pot — gut-friendly fibre and plant iron with almost no washing up.",
    ingredients: [
      { name: "Chickpeas", quantity_text: "2 tins" },
      { name: "Chopped tomatoes", quantity_text: "1 tin" },
      { name: "Coconut milk", quantity_text: "1 tin" },
      { name: "Onion", quantity_text: "1, chopped" },
      { name: "Garam masala", quantity_text: "2 tsp" },
      { name: "Garlic", quantity_text: "4 cloves" },
      { name: "Basmati rice", quantity_text: "to serve" },
    ],
  },
  {
    youtube_id: "8_ZBOIIftvM",
    title: "The Best Crispy Tofu",
    channel: "Rainbow Plant Life",
    minutes: 30,
    diet: ["vegan", "gf"],
    nutrient_story: "protein",
    stage_relevance: "soy protein + calcium for perimenopause",
    rough_kcal: 300,
    rough_protein_g: 22,
    blurb: "Properly crisp tofu — soy protein and calcium that hold their own on any plate.",
    ingredients: [
      { name: "Firm tofu", quantity_text: "2 blocks" },
      { name: "Cornflour", quantity_text: "3 tbsp" },
      { name: "Soy sauce", quantity_text: "2 tbsp" },
      { name: "Sesame oil", quantity_text: "1 tbsp" },
      { name: "Spring onion", quantity_text: "3, sliced" },
      { name: "Rice", quantity_text: "to serve" },
    ],
  },
  {
    youtube_id: "8KEtFdVpFZQ",
    title: "Speedy 20-Minute Vegan Meals",
    channel: "Pick Up Limes",
    minutes: 20,
    diet: ["vegan"],
    nutrient_story: "fibre",
    stage_relevance: "quick wholesome weeknight plant meals",
    rough_kcal: 450,
    rough_protein_g: 18,
    blurb: "Three quick, wholesome plates for the nights you want dinner done in twenty.",
    ingredients: [
      { name: "Wholewheat pasta", quantity_text: "300g" },
      { name: "Tinned beans", quantity_text: "2 tins" },
      { name: "Frozen peas", quantity_text: "200g" },
      { name: "Cherry tomatoes", quantity_text: "1 punnet" },
      { name: "Garlic", quantity_text: "3 cloves" },
      { name: "Olive oil", quantity_text: "2 tbsp" },
      { name: "Lemon", quantity_text: "1" },
    ],
  },
  {
    youtube_id: "Jjub18AHC9M",
    title: "Epic Tofu + Dipping Sauces",
    channel: "Pick Up Limes",
    minutes: 30,
    diet: ["vegan"],
    nutrient_story: "protein",
    stage_relevance: "plant protein + calcium for menopause",
    rough_kcal: 380,
    rough_protein_g: 24,
    blurb: "Crisp tofu with three moreish sauces — plant protein and calcium made genuinely fun.",
    ingredients: [
      { name: "Firm tofu", quantity_text: "2 blocks" },
      { name: "Peanut butter", quantity_text: "3 tbsp" },
      { name: "Soy sauce", quantity_text: "3 tbsp" },
      { name: "Maple syrup", quantity_text: "1 tbsp" },
      { name: "Lime", quantity_text: "2" },
      { name: "Sriracha", quantity_text: "1 tbsp" },
      { name: "Rice", quantity_text: "to serve" },
    ],
  },
  {
    youtube_id: "6KCWzRfFyr4",
    title: "Bibimbap (Korean Mixed Rice Bowl)",
    channel: "Maangchi",
    minutes: 40,
    diet: ["meat"],
    nutrient_story: "iron",
    stage_relevance: "celebratory iron-rich bowl around your period",
    rough_kcal: 560,
    rough_protein_g: 26,
    blurb: "A colourful, celebratory bowl — iron-rich beef and greens over rice with a runny egg.",
    ingredients: [
      { name: "Beef mince", quantity_text: "250g" },
      { name: "Spinach", quantity_text: "200g" },
      { name: "Carrot", quantity_text: "2, julienned" },
      { name: "Beansprouts", quantity_text: "150g" },
      { name: "Eggs", quantity_text: "2" },
      { name: "Rice", quantity_text: "300g" },
      { name: "Gochujang", quantity_text: "2 tbsp" },
      { name: "Sesame oil", quantity_text: "1 tbsp" },
    ],
  },
  {
    youtube_id: "i1djfV9uigc",
    title: "Japchae (Glass Noodle Stir-Fry)",
    channel: "Maangchi",
    minutes: 50,
    diet: ["veg"],
    nutrient_story: "comfort",
    stage_relevance: "celebratory veg-forward party dish",
    rough_kcal: 480,
    rough_protein_g: 12,
    blurb: "Silky sweet-potato noodles tangled with vegetables — a glossy, generous party dish.",
    ingredients: [
      { name: "Sweet potato glass noodles", quantity_text: "200g" },
      { name: "Spinach", quantity_text: "150g" },
      { name: "Carrot", quantity_text: "1, julienned" },
      { name: "Shiitake mushrooms", quantity_text: "100g" },
      { name: "Onion", quantity_text: "1, sliced" },
      { name: "Soy sauce", quantity_text: "3 tbsp" },
      { name: "Sesame oil", quantity_text: "1 tbsp" },
    ],
  },
  {
    youtube_id: "sbmZjvjavaU",
    title: "Kimchi Stew (Kimchi-Jjigae)",
    channel: "Maangchi",
    minutes: 35,
    diet: ["meat"],
    nutrient_story: "comfort",
    stage_relevance: "warming, gut-friendly fermented comfort food",
    rough_kcal: 420,
    rough_protein_g: 22,
    blurb: "Bubbling, fermented and deeply warming — gut-friendly comfort in a single pot.",
    ingredients: [
      { name: "Ripe kimchi", quantity_text: "300g" },
      { name: "Pork belly", quantity_text: "200g" },
      { name: "Firm tofu", quantity_text: "1 block" },
      { name: "Spring onion", quantity_text: "3, sliced" },
      { name: "Gochugaru", quantity_text: "1 tbsp" },
      { name: "Rice", quantity_text: "to serve" },
    ],
  },
  {
    youtube_id: "6OBoHKRQdHI",
    title: "7-Minute Salmon Piccata",
    channel: "Food Wishes",
    minutes: 15,
    diet: ["gf"],
    nutrient_story: "protein",
    stage_relevance: "fast high-protein + omega-3 for perimenopause",
    rough_kcal: 420,
    rough_protein_g: 34,
    blurb: "Buttery, lemony salmon in minutes — high protein and omega-3 with barely any effort.",
    ingredients: [
      { name: "Salmon fillets", quantity_text: "2" },
      { name: "Lemon", quantity_text: "1" },
      { name: "Capers", quantity_text: "1 tbsp" },
      { name: "Butter", quantity_text: "30g" },
      { name: "Garlic", quantity_text: "1 clove" },
      { name: "Fresh parsley", quantity_text: "small bunch" },
    ],
  },
  {
    youtube_id: "CkwflddQShk",
    title: "Veggie Spaghetti Bolognese (Lentil Ragu)",
    channel: "Jamie Oliver",
    minutes: 40,
    diet: ["veg"],
    nutrient_story: "iron",
    stage_relevance: "lentil iron in a comforting classic, batch-friendly",
    rough_kcal: 520,
    rough_protein_g: 20,
    blurb: "A proper, rib-sticking lentil ragu — iron-rich comfort that freezes beautifully.",
    ingredients: [
      { name: "Green or puy lentils", quantity_text: "300g" },
      { name: "Chopped tomatoes", quantity_text: "2 tins" },
      { name: "Onion", quantity_text: "1, chopped" },
      { name: "Carrot", quantity_text: "2, diced" },
      { name: "Celery", quantity_text: "2 sticks" },
      { name: "Spaghetti", quantity_text: "400g" },
      { name: "Garlic", quantity_text: "3 cloves" },
    ],
  },
  {
    youtube_id: "Mlos6kuwRUQ",
    title: "Oven-Baked Sausage Ragu",
    channel: "Jamie Oliver",
    minutes: 60,
    diet: ["meat"],
    nutrient_story: "comfort",
    stage_relevance: "hands-off batch-cook comfort, freezes well",
    rough_kcal: 610,
    rough_protein_g: 28,
    blurb: "Hands-off oven ragu — let it bubble away while you do nothing, then freeze the rest.",
    ingredients: [
      { name: "Sausages", quantity_text: "8 good ones" },
      { name: "Chopped tomatoes", quantity_text: "2 tins" },
      { name: "Onion", quantity_text: "2, sliced" },
      { name: "Garlic", quantity_text: "4 cloves" },
      { name: "Pasta", quantity_text: "400g" },
      { name: "Fresh basil", quantity_text: "small bunch" },
    ],
  },
  {
    youtube_id: "coYqrXsDPdU",
    title: "Classic Macaroni and Cheese",
    channel: "Food Wishes",
    minutes: 45,
    diet: ["veg"],
    nutrient_story: "calcium",
    stage_relevance: "calcium-rich joyful comfort food for bone health",
    rough_kcal: 640,
    rough_protein_g: 24,
    blurb: "Bubbling, golden and unapologetically comforting — calcium-rich joy for your bones.",
    ingredients: [
      { name: "Macaroni", quantity_text: "400g" },
      { name: "Mature cheddar", quantity_text: "250g" },
      { name: "Whole milk", quantity_text: "600ml" },
      { name: "Butter", quantity_text: "50g" },
      { name: "Plain flour", quantity_text: "50g" },
      { name: "Dijon mustard", quantity_text: "1 tsp" },
    ],
  },
];

// ── tag helpers ──────────────────────────────────────────────────────────────
// Filter pills: All · Quick · Iron · Protein · Veg · Vegan · Comfort
export const RECIPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "quick", label: "Quick" },
  { id: "iron", label: "Iron" },
  { id: "protein", label: "Protein" },
  { id: "veg", label: "Veg" },
  { id: "vegan", label: "Vegan" },
  { id: "comfort", label: "Comfort" },
];

export function filterRecipes(recipes, filterId) {
  const list = recipes || RECIPE_LIBRARY;
  switch (filterId) {
    case "quick": return list.filter((r) => r.minutes <= 20);
    case "iron": return list.filter((r) => r.nutrient_story === "iron");
    case "protein": return list.filter((r) => r.nutrient_story === "protein");
    case "veg": return list.filter((r) => r.diet.includes("veg") || r.diet.includes("vegan"));
    case "vegan": return list.filter((r) => r.diet.includes("vegan"));
    case "comfort": return list.filter((r) => r.nutrient_story === "comfort");
    case "all":
    default: return list;
  }
}

// Map a free-text ingredient name → the capitalised ShoppingList.category enum.
// enum: Produce · Dairy & Eggs · Meat & Seafood · Pantry · Frozen · Bakery · Beverages · Snacks · Other
export function shoppingCategoryFor(name) {
  const n = (name || "").toLowerCase();
  if (/(spinach|tomato|onion|carrot|pepper|celery|potato|garlic|ginger|lemon|lime|coriander|parsley|mint|basil|spring onion|beansprout|mushroom|peas|punnet|herb)/.test(n)) return "Produce";
  if (/(cheese|milk|yoghurt|yogurt|butter|egg|cream)/.test(n)) return "Dairy & Eggs";
  if (/(chicken|beef|pork|salmon|sausage|fish|mince|tofu|tempeh)/.test(n)) return "Meat & Seafood";
  if (/(frozen)/.test(n)) return "Frozen";
  if (/(pasta|spaghetti|macaroni|noodle|bread|flour|rice|baguette)/.test(n)) return "Bakery";
  if (/(lentil|chickpea|bean|tin|tinned|stock|coconut milk|paste|spice|paprika|cumin|masala|curry|soy|sesame|oil|sauce|cornflour|maple|syrup|capers|mustard|gochu|sriracha|peanut)/.test(n)) return "Pantry";
  return "Other";
}

// Map a free-text ingredient name → the lower-case PantryItem.category enum.
// enum: produce · protein · dairy · grain · cupboard · frozen · herbs · other
export function pantryCategoryFor(name) {
  const n = (name || "").toLowerCase();
  if (/(coriander|parsley|mint|basil|herb|ginger|garlic)/.test(n)) return "herbs";
  if (/(spinach|tomato|onion|carrot|pepper|celery|potato|lemon|lime|spring onion|beansprout|mushroom|peas|punnet)/.test(n)) return "produce";
  if (/(cheese|milk|yoghurt|yogurt|butter|egg|cream)/.test(n)) return "dairy";
  if (/(chicken|beef|pork|salmon|sausage|fish|mince|tofu|tempeh|lentil|chickpea|bean)/.test(n)) return "protein";
  if (/(frozen)/.test(n)) return "frozen";
  if (/(pasta|spaghetti|macaroni|noodle|bread|flour|rice|baguette)/.test(n)) return "grain";
  if (/(stock|coconut|paste|spice|paprika|cumin|masala|curry|soy|sesame|oil|sauce|cornflour|maple|syrup|capers|mustard|gochu|sriracha|peanut)/.test(n)) return "cupboard";
  return "other";
}

// Does this recipe overlap the user's pantry? (token overlap on ingredient names)
export function recipeMatchesPantry(recipe, pantryNames) {
  if (!pantryNames || pantryNames.length === 0) return false;
  const have = pantryNames.map((p) => (p || "").toLowerCase().trim()).filter(Boolean);
  return (recipe.ingredients || []).some((ing) => {
    const name = (ing.name || "").toLowerCase();
    return have.some((h) => h && (name.includes(h) || h.includes(name.split(" ")[0])));
  });
}

// Deterministic stage/phase-appropriate pick from the library (no AI, no randomness beyond a rotating seed).
// Prefers recipes whose nutrient_story matches the stage's flagship nutrient, honours a diet filter,
// and rotates by `seed` so repeated "Generate" taps cycle variety.
const STAGE_NUTRIENT = {
  teen: "iron", reproductive: "fibre", "pre-ttc": "folate", ttc: "folate",
  pregnant: "folate", "pregnant-t1": "folate", "pregnant-t2": "iron", "pregnant-t3": "iron",
  postpartum: "iron", perimenopause: "protein", menopause: "calcium", "post-menopause": "calcium",
};
const PHASE_NUTRIENT = { menstrual: "iron", follicular: "fibre", ovulatory: "protein", luteal: "comfort" };

export function generateRecipe({ stage, phaseKey, diet, seed = 0 } = {}) {
  let pool = RECIPE_LIBRARY;
  if (diet && diet !== "all") pool = pool.filter((r) => r.diet.includes(diet)) || pool;
  if (!pool.length) pool = RECIPE_LIBRARY;
  const want = STAGE_NUTRIENT[stage] || PHASE_NUTRIENT[phaseKey] || "fibre";
  const matched = pool.filter((r) => r.nutrient_story === want);
  const ranked = matched.length ? matched : pool;
  return ranked[((seed % ranked.length) + ranked.length) % ranked.length];
}

// Build a 7-day plan_days array (dinner = a library recipe title; lunch on alternate days) for the
// generator. Deterministic: rotates the diet-/stage-filtered pool so the week has variety + no AI.
export function generatePlanDays({ stage, phaseKey, diet } = {}) {
  let pool = RECIPE_LIBRARY;
  if (diet && diet !== "all") { const f = pool.filter((r) => r.diet.includes(diet)); if (f.length >= 3) pool = f; }
  // Lead with the stage's flagship-nutrient recipes, then the rest, for a coherent-but-varied week.
  const want = STAGE_NUTRIENT[stage] || PHASE_NUTRIENT[phaseKey] || "fibre";
  const lead = pool.filter((r) => r.nutrient_story === want);
  const rest = pool.filter((r) => r.nutrient_story !== want);
  const ordered = [...lead, ...rest];
  const days = [];
  for (let i = 0; i < 7; i++) {
    const dinner = ordered[i % ordered.length];
    const lunch = i % 2 === 0 ? ordered[(i + 3) % ordered.length] : null;
    days.push({
      day: i,
      breakfast: [],
      lunch: lunch ? [lunch.title] : [],
      dinner: dinner ? [dinner.title] : [],
      snack: [],
    });
  }
  return days;
}

// Find a recipe by exact title (for plan → shopping ingredient lookups).
export function recipeByTitle(title) {
  if (!title) return null;
  return RECIPE_LIBRARY.find((r) => r.title === title) || null;
}

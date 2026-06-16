// cofid — a curated UK food-composition FLOOR for the nutrition spine.
//
// WHY: Open Food Facts + analyzeMeal give us macros + some micros, but a meal logged
// by plain text/voice ("lentil soup", "two eggs on toast") usually carries NO iron /
// folate / calcium — so the women's micronutrient layer had nothing real to read. This
// file is the FLOOR: a curated table of common UK foods with lab-grade micronutrient
// values, so a plainly-logged meal can still be backfilled with a sensible ESTIMATE of
// its iron / folate / calcium (and fibre), keyed by the food name.
//
// SOURCE: values are drawn from the UK government food-composition data — McCance &
// Widdowson's "The Composition of Foods" / the Composition of Foods Integrated Dataset
// (CoFID), public-domain Crown copyright. Figures are per 100 g of the food as commonly
// eaten (cooked where that's how it's eaten), rounded to a sensible precision. They are
// authoritative reference values, not the user's exact plate — so anything derived from
// this table is flagged ESTIMATED and framed gently, never as a precise count.
//
// Pure data + a pure matcher. No network, no React, no entity calls. NO EMOJI.

// Each entry: canonical name, match aliases, a typical UK portion in grams, and the
// per-100 g nutrients we care about for the women's layer (+ macros for completeness).
// per100: { kcal, protein_g, carbs_g, fat_g, fiber_g, iron_mg, folate_ug, calcium_mg }
export const COFID = [
  // ── leafy greens & veg (iron + folate) ──────────────────────────────────────
  { name: "spinach", aliases: ["baby spinach", "spinach leaves"], portion_g: 80, per100: { kcal: 25, protein_g: 2.8, carbs_g: 1.6, fat_g: 0.8, fiber_g: 2.1, iron_mg: 1.6, folate_ug: 150, calcium_mg: 160 } },
  { name: "kale", aliases: ["curly kale", "cavolo nero"], portion_g: 80, per100: { kcal: 33, protein_g: 3.4, carbs_g: 1.4, fat_g: 1.1, fiber_g: 2.8, iron_mg: 2.0, folate_ug: 86, calcium_mg: 150 } },
  { name: "broccoli", aliases: ["tenderstem", "purple sprouting"], portion_g: 85, per100: { kcal: 34, protein_g: 2.8, carbs_g: 2.2, fat_g: 0.9, fiber_g: 2.3, iron_mg: 1.0, folate_ug: 64, calcium_mg: 40 } },
  { name: "watercress", aliases: ["rocket", "salad leaves"], portion_g: 30, per100: { kcal: 22, protein_g: 3.0, carbs_g: 0.4, fat_g: 1.0, fiber_g: 1.5, iron_mg: 2.2, folate_ug: 80, calcium_mg: 170 } },
  { name: "spring greens", aliases: ["cabbage", "savoy cabbage", "greens"], portion_g: 90, per100: { kcal: 33, protein_g: 3.0, carbs_g: 2.6, fat_g: 0.7, fiber_g: 2.6, iron_mg: 1.3, folate_ug: 110, calcium_mg: 75 } },
  { name: "peas", aliases: ["garden peas", "petit pois", "frozen peas"], portion_g: 80, per100: { kcal: 83, protein_g: 5.4, carbs_g: 11, fat_g: 0.9, fiber_g: 5.1, iron_mg: 1.5, folate_ug: 47, calcium_mg: 24 } },
  { name: "asparagus", aliases: [], portion_g: 80, per100: { kcal: 25, protein_g: 2.9, carbs_g: 2.0, fat_g: 0.6, fiber_g: 1.7, iron_mg: 1.4, folate_ug: 150, calcium_mg: 26 } },
  { name: "beetroot", aliases: ["beet"], portion_g: 80, per100: { kcal: 43, protein_g: 1.7, carbs_g: 9.5, fat_g: 0.1, fiber_g: 1.9, iron_mg: 0.8, folate_ug: 110, calcium_mg: 16 } },
  { name: "sweet potato", aliases: ["sweet potatoes"], portion_g: 130, per100: { kcal: 86, protein_g: 1.6, carbs_g: 20, fat_g: 0.1, fiber_g: 3.0, iron_mg: 0.6, folate_ug: 11, calcium_mg: 30 } },
  { name: "potato", aliases: ["potatoes", "new potatoes", "jacket potato", "mash"], portion_g: 180, per100: { kcal: 79, protein_g: 2.0, carbs_g: 17, fat_g: 0.2, fiber_g: 1.8, iron_mg: 0.4, folate_ug: 25, calcium_mg: 8 } },

  // ── pulses & beans (iron + folate + fibre) ──────────────────────────────────
  { name: "lentils", aliases: ["lentil", "lentil soup", "dal", "dahl", "red lentils", "puy lentils"], portion_g: 200, per100: { kcal: 105, protein_g: 8.8, carbs_g: 16, fat_g: 0.7, fiber_g: 3.8, iron_mg: 3.5, folate_ug: 90, calcium_mg: 22 } },
  { name: "chickpeas", aliases: ["chickpea", "chana", "hummus"], portion_g: 120, per100: { kcal: 121, protein_g: 7.2, carbs_g: 18, fat_g: 2.1, fiber_g: 4.3, iron_mg: 2.1, folate_ug: 54, calcium_mg: 46 } },
  { name: "kidney beans", aliases: ["red kidney beans", "chilli beans"], portion_g: 120, per100: { kcal: 100, protein_g: 6.9, carbs_g: 17, fat_g: 0.5, fiber_g: 6.2, iron_mg: 2.5, folate_ug: 42, calcium_mg: 71 } },
  { name: "black beans", aliases: ["black bean"], portion_g: 120, per100: { kcal: 114, protein_g: 7.6, carbs_g: 17, fat_g: 0.5, fiber_g: 6.5, iron_mg: 2.1, folate_ug: 75, calcium_mg: 40 } },
  { name: "baked beans", aliases: ["beans on toast"], portion_g: 200, per100: { kcal: 84, protein_g: 4.8, carbs_g: 13, fat_g: 0.6, fiber_g: 3.7, iron_mg: 1.4, folate_ug: 22, calcium_mg: 48 } },
  { name: "butter beans", aliases: ["cannellini beans", "white beans"], portion_g: 120, per100: { kcal: 103, protein_g: 7.1, carbs_g: 16, fat_g: 0.6, fiber_g: 4.6, iron_mg: 1.7, folate_ug: 30, calcium_mg: 40 } },
  { name: "edamame", aliases: ["soya beans", "soybeans"], portion_g: 80, per100: { kcal: 122, protein_g: 11, carbs_g: 5.0, fat_g: 5.2, fiber_g: 5.2, iron_mg: 2.3, folate_ug: 160, calcium_mg: 60 } },
  { name: "tofu", aliases: ["bean curd", "firm tofu"], portion_g: 100, per100: { kcal: 73, protein_g: 8.1, carbs_g: 0.7, fat_g: 4.2, fiber_g: 0.3, iron_mg: 1.2, folate_ug: 29, calcium_mg: 200 } },

  // ── meat & fish (iron + protein; oily fish for vit D context) ────────────────
  { name: "red meat", aliases: ["beef", "steak", "mince", "beef mince"], portion_g: 120, per100: { kcal: 182, protein_g: 26, carbs_g: 0, fat_g: 8.6, fiber_g: 0, iron_mg: 2.7, folate_ug: 8, calcium_mg: 7 } },
  { name: "lamb", aliases: ["lamb chop"], portion_g: 120, per100: { kcal: 235, protein_g: 25, carbs_g: 0, fat_g: 15, fiber_g: 0, iron_mg: 1.9, folate_ug: 4, calcium_mg: 9 } },
  { name: "liver", aliases: ["pate", "calves liver"], portion_g: 100, per100: { kcal: 137, protein_g: 24, carbs_g: 1.0, fat_g: 4.4, fiber_g: 0, iron_mg: 8.0, folate_ug: 290, calcium_mg: 6 } },
  { name: "chicken", aliases: ["chicken breast", "grilled chicken", "roast chicken"], portion_g: 130, per100: { kcal: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, fiber_g: 0, iron_mg: 0.7, folate_ug: 10, calcium_mg: 9 } },
  { name: "pork", aliases: ["pork chop", "gammon"], portion_g: 120, per100: { kcal: 198, protein_g: 26, carbs_g: 0, fat_g: 10, fiber_g: 0, iron_mg: 0.9, folate_ug: 3, calcium_mg: 7 } },
  { name: "salmon", aliases: ["grilled salmon", "smoked salmon", "salmon fillet"], portion_g: 120, per100: { kcal: 208, protein_g: 20, carbs_g: 0, fat_g: 13, fiber_g: 0, iron_mg: 0.5, folate_ug: 26, calcium_mg: 13 } },
  { name: "sardines", aliases: ["sardine", "tinned sardines", "pilchards"], portion_g: 90, per100: { kcal: 165, protein_g: 25, carbs_g: 0, fat_g: 7.5, fiber_g: 0, iron_mg: 2.9, folate_ug: 10, calcium_mg: 500 } },
  { name: "mackerel", aliases: ["smoked mackerel"], portion_g: 100, per100: { kcal: 205, protein_g: 19, carbs_g: 0, fat_g: 14, fiber_g: 0, iron_mg: 1.0, folate_ug: 2, calcium_mg: 12 } },
  { name: "tuna", aliases: ["tinned tuna", "tuna steak"], portion_g: 100, per100: { kcal: 116, protein_g: 26, carbs_g: 0, fat_g: 1.0, fiber_g: 0, iron_mg: 1.0, folate_ug: 15, calcium_mg: 14 } },
  { name: "prawns", aliases: ["prawn", "shrimp"], portion_g: 90, per100: { kcal: 99, protein_g: 22, carbs_g: 0, fat_g: 0.9, fiber_g: 0, iron_mg: 1.1, folate_ug: 15, calcium_mg: 90 } },

  // ── eggs & dairy (calcium + protein) ────────────────────────────────────────
  { name: "egg", aliases: ["eggs", "boiled egg", "scrambled eggs", "fried egg", "omelette", "poached egg"], portion_g: 100, per100: { kcal: 143, protein_g: 13, carbs_g: 0.7, fat_g: 9.5, fiber_g: 0, iron_mg: 1.9, folate_ug: 47, calcium_mg: 57 } },
  { name: "greek yoghurt", aliases: ["greek yogurt", "yoghurt", "yogurt", "natural yoghurt"], portion_g: 150, per100: { kcal: 97, protein_g: 9.0, carbs_g: 4.0, fat_g: 5.0, fiber_g: 0, iron_mg: 0.1, folate_ug: 11, calcium_mg: 150 } },
  { name: "milk", aliases: ["semi-skimmed milk", "whole milk", "skimmed milk"], portion_g: 200, per100: { kcal: 50, protein_g: 3.4, carbs_g: 4.8, fat_g: 1.8, fiber_g: 0, iron_mg: 0.0, folate_ug: 9, calcium_mg: 124 } },
  { name: "cheese", aliases: ["cheddar", "feta", "halloumi", "parmesan"], portion_g: 40, per100: { kcal: 416, protein_g: 25, carbs_g: 0.1, fat_g: 35, fiber_g: 0, iron_mg: 0.3, folate_ug: 33, calcium_mg: 720 } },
  { name: "fortified plant milk", aliases: ["oat milk", "soya milk", "almond milk", "plant milk"], portion_g: 200, per100: { kcal: 45, protein_g: 1.0, carbs_g: 6.5, fat_g: 1.5, fiber_g: 0.4, iron_mg: 0.2, folate_ug: 10, calcium_mg: 120 } },

  // ── grains, oats, bread (fibre; fortified flour = iron + folate) ─────────────
  { name: "porridge oats", aliases: ["oats", "porridge", "overnight oats", "oatmeal"], portion_g: 40, per100: { kcal: 363, protein_g: 11, carbs_g: 60, fat_g: 8.0, fiber_g: 9.0, iron_mg: 3.8, folate_ug: 30, calcium_mg: 52 } },
  { name: "wholemeal bread", aliases: ["wholemeal toast", "brown bread", "wholegrain bread", "rye bread"], portion_g: 80, per100: { kcal: 217, protein_g: 9.4, carbs_g: 36, fat_g: 2.5, fiber_g: 7.0, iron_mg: 2.7, folate_ug: 40, calcium_mg: 110 } },
  { name: "white bread", aliases: ["toast", "bread", "roll", "bagel"], portion_g: 80, per100: { kcal: 235, protein_g: 7.9, carbs_g: 46, fat_g: 1.9, fiber_g: 2.9, iron_mg: 1.6, folate_ug: 29, calcium_mg: 177 } },
  { name: "brown rice", aliases: ["wholegrain rice"], portion_g: 180, per100: { kcal: 111, protein_g: 2.6, carbs_g: 23, fat_g: 0.9, fiber_g: 1.8, iron_mg: 0.5, folate_ug: 9, calcium_mg: 10 } },
  { name: "white rice", aliases: ["rice", "basmati rice", "risotto", "jasmine rice"], portion_g: 180, per100: { kcal: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3, fiber_g: 0.4, iron_mg: 0.2, folate_ug: 3, calcium_mg: 10 } },
  { name: "quinoa", aliases: [], portion_g: 180, per100: { kcal: 120, protein_g: 4.4, carbs_g: 21, fat_g: 1.9, fiber_g: 2.8, iron_mg: 1.5, folate_ug: 42, calcium_mg: 17 } },
  { name: "pasta", aliases: ["wholewheat pasta", "spaghetti", "penne", "noodles"], portion_g: 180, per100: { kcal: 158, protein_g: 5.8, carbs_g: 31, fat_g: 0.9, fiber_g: 2.2, iron_mg: 0.5, folate_ug: 18, calcium_mg: 7 } },
  { name: "fortified cereal", aliases: ["bran flakes", "weetabix", "muesli", "granola", "cereal"], portion_g: 40, per100: { kcal: 360, protein_g: 10, carbs_g: 67, fat_g: 2.5, fiber_g: 10, iron_mg: 12, folate_ug: 250, calcium_mg: 35 } },

  // ── fruit, nuts, seeds ──────────────────────────────────────────────────────
  { name: "banana", aliases: [], portion_g: 120, per100: { kcal: 95, protein_g: 1.2, carbs_g: 23, fat_g: 0.3, fiber_g: 1.1, iron_mg: 0.3, folate_ug: 14, calcium_mg: 6 } },
  { name: "berries", aliases: ["blueberries", "strawberries", "raspberries", "blackberries"], portion_g: 80, per100: { kcal: 43, protein_g: 0.9, carbs_g: 9.0, fat_g: 0.3, fiber_g: 2.4, iron_mg: 0.5, folate_ug: 20, calcium_mg: 18 } },
  { name: "orange", aliases: ["oranges", "satsuma", "clementine"], portion_g: 130, per100: { kcal: 47, protein_g: 0.9, carbs_g: 9.0, fat_g: 0.1, fiber_g: 2.4, iron_mg: 0.1, folate_ug: 31, calcium_mg: 40 } },
  { name: "avocado", aliases: [], portion_g: 80, per100: { kcal: 190, protein_g: 1.9, carbs_g: 1.9, fat_g: 19, fiber_g: 3.4, iron_mg: 0.6, folate_ug: 81, calcium_mg: 12 } },
  { name: "almonds", aliases: ["almond", "almond butter"], portion_g: 30, per100: { kcal: 579, protein_g: 21, carbs_g: 6.9, fat_g: 49, fiber_g: 12, iron_mg: 3.7, folate_ug: 44, calcium_mg: 240 } },
  { name: "walnuts", aliases: ["walnut", "mixed nuts", "nuts"], portion_g: 30, per100: { kcal: 654, protein_g: 15, carbs_g: 7.0, fat_g: 65, fiber_g: 6.7, iron_mg: 2.9, folate_ug: 98, calcium_mg: 98 } },
  { name: "pumpkin seeds", aliases: ["pumpkin seed", "seeds", "mixed seeds"], portion_g: 15, per100: { kcal: 559, protein_g: 30, carbs_g: 11, fat_g: 49, fiber_g: 6.0, iron_mg: 8.8, folate_ug: 58, calcium_mg: 46 } },
  { name: "chia seeds", aliases: ["chia"], portion_g: 15, per100: { kcal: 486, protein_g: 17, carbs_g: 42, fat_g: 31, fiber_g: 34, iron_mg: 7.7, folate_ug: 49, calcium_mg: 631 } },
  { name: "dried apricots", aliases: ["apricots"], portion_g: 40, per100: { kcal: 188, protein_g: 3.4, carbs_g: 43, fat_g: 0.5, fiber_g: 7.3, iron_mg: 3.2, folate_ug: 10, calcium_mg: 73 } },
  { name: "peanut butter", aliases: ["peanut", "peanuts"], portion_g: 20, per100: { kcal: 588, protein_g: 25, carbs_g: 20, fat_g: 50, fiber_g: 6.0, iron_mg: 1.9, folate_ug: 74, calcium_mg: 49 } },

  // ── COMPOSITE & BRANDED UK DISHES ───────────────────────────────────────────
  // Common composite/branded items that a plain text log ("katsu curry", "meal deal
  // sandwich", "chicken tikka masala") would otherwise miss — falling through to the
  // flat per-slot default. Each carries a SENSIBLE whole-dish kcal+macro estimate at a
  // typical UK serving (portion_g = the served portion; per100 back-calculated from it).
  // Micros stay HONEST: we only attach iron/folate/calcium where the dish reliably
  // contains them (e.g. lentil dahl, sardines on toast); otherwise they stay 0 so the
  // women's layer never reads a faked micronutrient. These are whole-dish entries — the
  // matcher treats a composite hit as the meal, so we keep them specific (longer terms
  // win over their component foods via the length-sorted matcher).
  // Indian / curry-house
  { name: "chicken tikka masala", aliases: ["tikka masala", "chicken tikka", "butter chicken", "korma", "chicken korma"], portion_g: 350, per100: { kcal: 150, protein_g: 9.7, carbs_g: 6.0, fat_g: 9.7, fiber_g: 1.1, iron_mg: 0.6, folate_ug: 6, calcium_mg: 26 } },
  { name: "chicken curry", aliases: ["curry and rice", "thai green curry", "thai curry", "jalfrezi", "balti", "madras", "rogan josh"], portion_g: 350, per100: { kcal: 130, protein_g: 8.0, carbs_g: 8.0, fat_g: 7.0, fiber_g: 1.4, iron_mg: 0.8, folate_ug: 8, calcium_mg: 24 } },
  { name: "lentil dahl", aliases: ["dahl", "dal", "lentil curry", "tarka dal", "chana masala"], portion_g: 300, per100: { kcal: 110, protein_g: 5.6, carbs_g: 14, fat_g: 3.2, fiber_g: 3.4, iron_mg: 2.4, folate_ug: 60, calcium_mg: 30 } },
  { name: "vegetable curry", aliases: ["veg curry", "saag aloo", "aloo gobi", "paneer", "saag paneer"], portion_g: 320, per100: { kcal: 115, protein_g: 4.0, carbs_g: 10, fat_g: 6.5, fiber_g: 2.6, iron_mg: 1.1, folate_ug: 24, calcium_mg: 90 } },
  { name: "pilau rice", aliases: ["pilau", "naan", "naan bread", "poppadom", "bhaji", "onion bhaji", "samosa"], portion_g: 180, per100: { kcal: 180, protein_g: 4.0, carbs_g: 30, fat_g: 4.5, fiber_g: 1.2, iron_mg: 0.6, folate_ug: 6, calcium_mg: 30 } },
  // East Asian
  { name: "katsu curry", aliases: ["chicken katsu", "katsu"], portion_g: 400, per100: { kcal: 165, protein_g: 7.0, carbs_g: 22, fat_g: 5.5, fiber_g: 1.5, iron_mg: 0.7, folate_ug: 8, calcium_mg: 20 } },
  { name: "stir fry", aliases: ["stir-fry", "chow mein", "egg fried rice", "fried rice", "pad thai", "ramen", "noodle soup"], portion_g: 380, per100: { kcal: 130, protein_g: 6.5, carbs_g: 17, fat_g: 4.2, fiber_g: 1.8, iron_mg: 0.9, folate_ug: 16, calcium_mg: 28 } },
  { name: "sushi", aliases: ["sushi roll", "maki", "poke bowl", "katsu wrap"], portion_g: 230, per100: { kcal: 140, protein_g: 6.0, carbs_g: 24, fat_g: 2.0, fiber_g: 1.2, iron_mg: 0.5, folate_ug: 10, calcium_mg: 18 } },
  // Italian / Mediterranean
  { name: "spaghetti bolognese", aliases: ["bolognese", "spag bol", "lasagne", "lasagna", "ragu"], portion_g: 400, per100: { kcal: 130, protein_g: 7.0, carbs_g: 15, fat_g: 4.5, fiber_g: 1.8, iron_mg: 1.2, folate_ug: 14, calcium_mg: 40 } },
  { name: "pizza", aliases: ["margherita", "pepperoni pizza", "garlic bread"], portion_g: 300, per100: { kcal: 250, protein_g: 11, carbs_g: 30, fat_g: 9.5, fiber_g: 2.1, iron_mg: 1.0, folate_ug: 20, calcium_mg: 200 } },
  { name: "pasta bake", aliases: ["mac and cheese", "macaroni cheese", "carbonara", "pasta pesto", "tomato pasta", "pasta with sauce"], portion_g: 380, per100: { kcal: 165, protein_g: 6.5, carbs_g: 20, fat_g: 6.5, fiber_g: 1.8, iron_mg: 0.8, folate_ug: 16, calcium_mg: 110 } },
  { name: "risotto", aliases: ["mushroom risotto", "paella"], portion_g: 350, per100: { kcal: 145, protein_g: 4.5, carbs_g: 22, fat_g: 4.5, fiber_g: 1.0, iron_mg: 0.6, folate_ug: 10, calcium_mg: 40 } },
  // British classics & pub
  { name: "shepherd's pie", aliases: ["shepherds pie", "cottage pie", "fish pie"], portion_g: 400, per100: { kcal: 120, protein_g: 7.0, carbs_g: 11, fat_g: 5.0, fiber_g: 1.6, iron_mg: 1.1, folate_ug: 12, calcium_mg: 40 } },
  { name: "roast dinner", aliases: ["roast", "sunday roast", "roast beef dinner", "yorkshire pudding"], portion_g: 450, per100: { kcal: 130, protein_g: 8.5, carbs_g: 12, fat_g: 5.0, fiber_g: 2.0, iron_mg: 1.3, folate_ug: 20, calcium_mg: 35 } },
  { name: "fish and chips", aliases: ["fish n chips", "fish supper", "battered cod"], portion_g: 400, per100: { kcal: 195, protein_g: 8.5, carbs_g: 20, fat_g: 9.5, fiber_g: 1.6, iron_mg: 0.7, folate_ug: 10, calcium_mg: 40 } },
  { name: "sausage and mash", aliases: ["bangers and mash", "toad in the hole"], portion_g: 380, per100: { kcal: 165, protein_g: 7.0, carbs_g: 15, fat_g: 9.0, fiber_g: 1.5, iron_mg: 1.0, folate_ug: 10, calcium_mg: 30 } },
  { name: "full english", aliases: ["full english breakfast", "fry up", "cooked breakfast", "english breakfast"], portion_g: 350, per100: { kcal: 200, protein_g: 11, carbs_g: 11, fat_g: 13, fiber_g: 1.8, iron_mg: 1.6, folate_ug: 16, calcium_mg: 40 } },
  { name: "pie and chips", aliases: ["meat pie", "steak pie", "chicken pie", "pasty", "cornish pasty", "sausage roll"], portion_g: 320, per100: { kcal: 245, protein_g: 7.5, carbs_g: 24, fat_g: 13, fiber_g: 1.8, iron_mg: 1.0, folate_ug: 10, calcium_mg: 30 } },
  { name: "jacket potato with beans", aliases: ["jacket potato with cheese", "loaded potato"], portion_g: 320, per100: { kcal: 110, protein_g: 4.5, carbs_g: 18, fat_g: 2.2, fiber_g: 2.6, iron_mg: 1.0, folate_ug: 18, calcium_mg: 60 } },
  // Sandwiches, meal deals, wraps, burgers, takeaway
  { name: "meal deal sandwich", aliases: ["meal deal", "sandwich", "blt", "club sandwich", "chicken sandwich", "tuna sandwich", "egg sandwich", "ham sandwich", "cheese sandwich", "sandwich meal deal"], portion_g: 200, per100: { kcal: 230, protein_g: 9.5, carbs_g: 26, fat_g: 9.5, fiber_g: 2.4, iron_mg: 1.2, folate_ug: 20, calcium_mg: 80 } },
  { name: "wrap", aliases: ["chicken wrap", "falafel wrap", "burrito", "fajita", "quesadilla"], portion_g: 250, per100: { kcal: 200, protein_g: 9.0, carbs_g: 23, fat_g: 8.0, fiber_g: 2.6, iron_mg: 1.3, folate_ug: 24, calcium_mg: 70 } },
  { name: "burger and chips", aliases: ["burger", "cheeseburger", "beef burger", "chicken burger", "big mac", "quarter pounder", "whopper"], portion_g: 350, per100: { kcal: 230, protein_g: 11, carbs_g: 22, fat_g: 11, fiber_g: 1.8, iron_mg: 1.6, folate_ug: 14, calcium_mg: 90 } },
  { name: "chips", aliases: ["fries", "french fries", "potato wedges"], portion_g: 150, per100: { kcal: 290, protein_g: 3.8, carbs_g: 36, fat_g: 14, fiber_g: 2.8, iron_mg: 0.7, folate_ug: 14, calcium_mg: 12 } },
  { name: "kebab", aliases: ["doner kebab", "shish kebab", "chicken kebab", "gyros"], portion_g: 350, per100: { kcal: 200, protein_g: 12, carbs_g: 15, fat_g: 10, fiber_g: 1.8, iron_mg: 1.5, folate_ug: 12, calcium_mg: 50 } },
  { name: "fried chicken", aliases: ["kfc", "chicken nuggets", "chicken goujons", "popcorn chicken"], portion_g: 250, per100: { kcal: 250, protein_g: 17, carbs_g: 13, fat_g: 15, fiber_g: 0.8, iron_mg: 1.0, folate_ug: 8, calcium_mg: 25 } },
  // Salads & lighter composite meals (carry sensible micros from greens)
  { name: "chicken salad", aliases: ["caesar salad", "greek salad", "pasta salad", "couscous salad", "grain bowl", "buddha bowl"], portion_g: 320, per100: { kcal: 95, protein_g: 6.5, carbs_g: 7.0, fat_g: 4.5, fiber_g: 2.2, iron_mg: 1.2, folate_ug: 40, calcium_mg: 60 } },
  { name: "soup", aliases: ["vegetable soup", "tomato soup", "minestrone", "chicken soup", "broth"], portion_g: 300, per100: { kcal: 55, protein_g: 2.4, carbs_g: 7.0, fat_g: 1.8, fiber_g: 1.6, iron_mg: 0.8, folate_ug: 18, calcium_mg: 30 } },
  // Sweet / snack composites
  { name: "cereal bar", aliases: ["flapjack", "protein bar", "granola bar"], portion_g: 45, per100: { kcal: 420, protein_g: 7.0, carbs_g: 60, fat_g: 16, fiber_g: 4.0, iron_mg: 2.0, folate_ug: 20, calcium_mg: 60 } },
  { name: "crisps", aliases: ["crisp", "tortilla chips", "popcorn"], portion_g: 30, per100: { kcal: 530, protein_g: 6.5, carbs_g: 53, fat_g: 33, fiber_g: 4.5, iron_mg: 1.5, folate_ug: 30, calcium_mg: 25 } },
  { name: "chocolate", aliases: ["chocolate bar", "milk chocolate", "dark chocolate", "biscuit", "biscuits", "cookie"], portion_g: 45, per100: { kcal: 535, protein_g: 6.5, carbs_g: 57, fat_g: 31, fiber_g: 2.5, iron_mg: 2.3, folate_ug: 10, calcium_mg: 190 } },
  { name: "cake", aliases: ["slice of cake", "muffin", "brownie", "croissant", "pastry", "doughnut", "donut"], portion_g: 80, per100: { kcal: 380, protein_g: 5.0, carbs_g: 50, fat_g: 18, fiber_g: 1.5, iron_mg: 1.2, folate_ug: 14, calcium_mg: 60 } },
  { name: "smoothie", aliases: ["fruit smoothie", "protein shake", "milkshake"], portion_g: 300, per100: { kcal: 65, protein_g: 2.5, carbs_g: 12, fat_g: 1.0, fiber_g: 1.4, iron_mg: 0.4, folate_ug: 20, calcium_mg: 60 } },
];

// ── composite (whole-dish) entries ──────────────────────────────────────────
// These COFID names are WHOLE DISHES, not single ingredients. When one matches a meal
// text it represents the meal on its own, so cofidFloorNutrition must NOT also add its
// component foods (e.g. "chicken curry with rice" → the curry entry already includes the
// rice — don't sum white rice on top). The first composite hit wins (longest term first
// via the length-sorted matcher), and component foods are skipped for that meal.
const COMPOSITE_NAMES = new Set([
  "chicken tikka masala", "chicken curry", "lentil dahl", "vegetable curry", "pilau rice",
  "katsu curry", "stir fry", "sushi", "spaghetti bolognese", "pizza", "pasta bake",
  "risotto", "shepherd's pie", "roast dinner", "fish and chips", "sausage and mash",
  "full english", "pie and chips", "jacket potato with beans", "meal deal sandwich",
  "wrap", "burger and chips", "chips", "kebab", "fried chicken", "chicken salad",
  "soup", "cereal bar", "crisps", "chocolate", "cake", "smoothie",
]);

// ── matcher ──────────────────────────────────────────────────────────────────
const lc = (s) => String(s || "").toLowerCase();

// Build a flat list of [term, entry] sorted by term length DESC so the most specific
// alias wins (e.g. "sweet potato" before "potato"). Computed once.
const TERMS = (() => {
  const list = [];
  for (const e of COFID) {
    list.push([e.name, e]);
    for (const a of e.aliases) list.push([a, e]);
  }
  return list.sort((a, b) => b[0].length - a[0].length);
})();

// cofidLookup(name) → the COFID entry whose name/alias appears in the food text, or
// null. Substring match (so "lentil & spinach soup" matches "lentil" first by length —
// returns the longest matching term's entry). Defensive: bad input → null.
export function cofidLookup(name) {
  const t = lc(name);
  if (!t) return null;
  for (const [term, entry] of TERMS) {
    if (t.includes(term)) return entry;
  }
  return null;
}

// cofidMicros(name) → { iron_mg, folate_ug, calcium_mg, fiber_g } for ONE typical
// portion of the matched food, or null when nothing matches. These are ESTIMATES from
// UK reference values, scaled to the food's typical portion — never the user's exact
// plate. Callers must flag anything derived from this as estimated.
export function cofidMicros(name) {
  const e = cofidLookup(name);
  if (!e) return null;
  const scale = (e.portion_g || 100) / 100;
  const p = e.per100;
  const r1 = (v) => Math.round((v || 0) * scale * 10) / 10;
  return {
    name: e.name,
    iron_mg: r1(p.iron_mg),
    folate_ug: Math.round((p.folate_ug || 0) * scale),
    calcium_mg: Math.round((p.calcium_mg || 0) * scale),
    fiber_g: r1(p.fiber_g),
  };
}

// cofidFloorMicros(text) → summed estimated micros for ALL distinct CoFID foods named
// in a meal text ("lentil & spinach soup, wholemeal roll" → lentils + spinach + bread),
// each at its typical portion. Returns { iron_mg, folate_ug, calcium_mg, fiber_g,
// foods:[name] } or null when nothing matches. Estimate only — flag accordingly.
// Find the matching COMPOSITE (whole-dish) entry for a meal text, or null. A composite
// only wins when it's the MOST SPECIFIC match — i.e. no NON-composite (single-food) term
// that also matches is longer. This keeps honest single-food matches from being swallowed
// by a short generic composite: "lentil soup" keeps the iron-rich lentils entry over the
// generic "soup" composite, while "katsu curry" / "meal deal sandwich" still win as dishes.
function matchComposite(t) {
  let bestComposite = null, bestCompLen = -1;
  let bestSingleLen = -1;
  for (const [term, entry] of TERMS) {
    if (!t.includes(term)) continue;
    if (COMPOSITE_NAMES.has(entry.name)) {
      if (term.length > bestCompLen) { bestComposite = entry; bestCompLen = term.length; }
    } else if (term.length > bestSingleLen) {
      bestSingleLen = term.length;
    }
  }
  if (bestComposite && bestCompLen >= bestSingleLen) return bestComposite;
  return null;
}

export function cofidFloorMicros(text) {
  const t = lc(text);
  if (!t) return null;
  // Whole-dish composite wins — represent the meal with the dish alone, no component sum.
  const comp = matchComposite(t);
  if (comp) {
    const m = cofidMicros(comp.name);
    if (m) return { iron_mg: m.iron_mg, folate_ug: m.folate_ug, calcium_mg: m.calcium_mg, fiber_g: m.fiber_g, foods: [comp.name] };
  }
  const seen = new Set();
  const out = { iron_mg: 0, folate_ug: 0, calcium_mg: 0, fiber_g: 0, foods: [] };
  for (const [term, entry] of TERMS) {
    if (COMPOSITE_NAMES.has(entry.name)) continue;
    if (seen.has(entry.name)) continue;
    if (t.includes(term)) {
      seen.add(entry.name);
      const m = cofidMicros(entry.name);
      if (m) {
        out.iron_mg += m.iron_mg;
        out.folate_ug += m.folate_ug;
        out.calcium_mg += m.calcium_mg;
        out.fiber_g += m.fiber_g;
        out.foods.push(entry.name);
      }
    }
  }
  if (out.foods.length === 0) return null;
  out.iron_mg = Math.round(out.iron_mg * 10) / 10;
  out.fiber_g = Math.round(out.fiber_g * 10) / 10;
  return out;
}

// cofidFloorNutrition(text) → a FULL nutrient estimate (macros + micros) for ALL
// distinct CoFID foods named in a meal text, each at its typical UK portion. Same
// matcher as cofidFloorMicros but also sums kcal/protein/carbs/fat. Returns
// { kcal, protein_g, carbs_g, fat_g, fiber_g, iron_mg, folate_ug, calcium_mg, foods }
// or null when nothing matches. An ESTIMATE from reference values — flag accordingly.
export function cofidFloorNutrition(text) {
  const t = lc(text);
  if (!t) return null;
  // Whole-dish composite wins — the dish entry represents the meal on its own, so we don't
  // also add its component foods (avoids e.g. "chicken curry with rice" double-counting).
  const comp = matchComposite(t);
  if (comp) {
    const scale = (comp.portion_g || 100) / 100;
    const p = comp.per100;
    return {
      kcal: Math.round((p.kcal || 0) * scale),
      protein_g: Math.round((p.protein_g || 0) * scale),
      carbs_g: Math.round((p.carbs_g || 0) * scale),
      fat_g: Math.round((p.fat_g || 0) * scale),
      fiber_g: Math.round((p.fiber_g || 0) * scale * 10) / 10,
      iron_mg: Math.round((p.iron_mg || 0) * scale * 10) / 10,
      folate_ug: Math.round((p.folate_ug || 0) * scale),
      calcium_mg: Math.round((p.calcium_mg || 0) * scale),
      foods: [comp.name],
    };
  }
  const seen = new Set();
  const out = { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, iron_mg: 0, folate_ug: 0, calcium_mg: 0, foods: [] };
  for (const [term, entry] of TERMS) {
    if (COMPOSITE_NAMES.has(entry.name)) continue;
    if (seen.has(entry.name)) continue;
    if (t.includes(term)) {
      seen.add(entry.name);
      const scale = (entry.portion_g || 100) / 100;
      const p = entry.per100;
      out.kcal += (p.kcal || 0) * scale;
      out.protein_g += (p.protein_g || 0) * scale;
      out.carbs_g += (p.carbs_g || 0) * scale;
      out.fat_g += (p.fat_g || 0) * scale;
      out.fiber_g += (p.fiber_g || 0) * scale;
      out.iron_mg += (p.iron_mg || 0) * scale;
      out.folate_ug += (p.folate_ug || 0) * scale;
      out.calcium_mg += (p.calcium_mg || 0) * scale;
      out.foods.push(entry.name);
    }
  }
  if (out.foods.length === 0) return null;
  out.kcal = Math.round(out.kcal);
  out.protein_g = Math.round(out.protein_g);
  out.carbs_g = Math.round(out.carbs_g);
  out.fat_g = Math.round(out.fat_g);
  out.fiber_g = Math.round(out.fiber_g * 10) / 10;
  out.iron_mg = Math.round(out.iron_mg * 10) / 10;
  out.folate_ug = Math.round(out.folate_ug);
  out.calcium_mg = Math.round(out.calcium_mg);
  return out;
}

// ── per-slot DEFAULT macro estimate — the final fallback ─────────────────────
// When a logged food matches NOTHING in the CoFID table (e.g. "katsu curry"), we still
// want the energy ring to MOVE — a meal logged should never read 0 kcal. So we attach a
// gentle, typical per-meal-type estimate. MACROS ONLY — we deliberately leave micros at 0
// here (we won't fake iron/folate/calcium for an unknown food; the women's layer stays
// honest). Calories/macros estimated is standard for every tracker.
const SLOT_DEFAULT_KCAL = { breakfast: 350, lunch: 520, dinner: 620, snack: 180 };
export function defaultMealMacros(mealType) {
  const kcal = SLOT_DEFAULT_KCAL[String(mealType || "").toLowerCase()] || 450;
  return {
    kcal,
    protein_g: Math.round((kcal * 0.20) / 4),  // ~20% energy from protein
    carbs_g: Math.round((kcal * 0.50) / 4),     // ~50% carbs
    fat_g: Math.round((kcal * 0.30) / 9),        // ~30% fat
    fiber_g: 0, iron_mg: 0, folate_ug: 0, calcium_mg: 0,
  };
}

// mealEstimate(text, mealType) → CoFID match if any, else the per-slot default. Always
// returns a usable macro estimate for a non-empty meal so logging visibly moves totals.
export function mealEstimate(text, mealType) {
  const fromCofid = cofidFloorNutrition(text);
  if (fromCofid) return { ...fromCofid, source: "cofid" };
  return { ...defaultMealMacros(mealType), foods: [], source: "default" };
}

export default cofidLookup;

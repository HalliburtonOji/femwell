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
];

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
export function cofidFloorMicros(text) {
  const t = lc(text);
  if (!t) return null;
  const seen = new Set();
  const out = { iron_mg: 0, folate_ug: 0, calcium_mg: 0, fiber_g: 0, foods: [] };
  for (const [term, entry] of TERMS) {
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

export default cofidLookup;

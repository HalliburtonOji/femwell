// jessActions — Jess Sprint 5 (Action Layer)
//
// Every Jess agent call now returns a JSON envelope:
//   {
//     "message": "her conversational reply",
//     "actions": [
//       { "type": ACTION_TYPE, "confidence": 0.0-1.0, "data": {...} }
//     ]
//   }
//
// This service:
//   1. parseJessResponse(raw)       — safely extracts message + actions
//                                     with a fallback if the LLM returns
//                                     plain text or malformed JSON.
//   2. executeJessActions(actions,  — dispatches each action to its
//        userId)                       Base44 entity create call, with a
//                                     confidence floor (skip < 0.75).
//                                     Returns per-action results.
//   3. updateJessMemory(memory,     — appends a rolling-20 conversation
//        actions, userMsg, jReply)    breadcrumb.
//   4. loadJessMemory(userId) /     — localStorage persistence keyed by
//      saveJessMemory(userId, m)      jess_memory_<userId>.
//
// Every entity write is wrapped in try/catch — Jess never crashes the
// chat shell because the schema doesn't have a particular entity.

import { base44 } from "@/api/base44Client";

export const ACTION_TYPES = {
  LOG_MOOD:            "LOG_MOOD",
  LOG_ENERGY:          "LOG_ENERGY",
  LOG_SLEEP:           "LOG_SLEEP",
  LOG_DAILY_CHECKIN:   "LOG_DAILY_CHECKIN",
  LOG_SYMPTOM:         "LOG_SYMPTOM",
  LOG_MEAL:            "LOG_MEAL",
  CREATE_MEAL_PLAN:    "CREATE_MEAL_PLAN",
  LOG_HYDRATION:       "LOG_HYDRATION",
  LOG_MEDICATION:      "LOG_MEDICATION",
  LOG_SUPPLEMENT:      "LOG_SUPPLEMENT",
  LOG_HABIT:           "LOG_HABIT",
  CREATE_TASK:         "CREATE_TASK",
  COMPLETE_TASK:       "COMPLETE_TASK",
  WRITE_JOURNAL:       "WRITE_JOURNAL",
  CREATE_PLANNER_ITEM: "CREATE_PLANNER_ITEM", // Sprint 7 — Voice to Schedule
  QUERY_DATA:          "QUERY_DATA",
  CLARIFICATION_NEEDED:"CLARIFICATION_NEEDED",
};

const CONFIDENCE_FLOOR = 0.75;
const MEM_LIMIT = 20;
function memKey(uid) { return `jess_memory_${uid || "anon"}`; }
function today() { return new Date().toISOString().split("T")[0]; }
function nowISO() { return new Date().toISOString(); }

// QA round 5 — meal-plan intent detection. When Jess refuses a
// meal-plan request in prose ('I can't create a custom plan...')
// the parser comes back with fallback: true and no actions. This
// regex detects the user's intent client-side so we can inject a
// CREATE_MEAL_PLAN action and force the scaffold to run anyway.
export const MEAL_PLAN_REGEX =
  /\b(?:meal\s*plan|weekly\s*meals?|7[-\s]?day(?:\s+plan)?|nutrition\s*plan|diet\s*plan|food\s*plan|plan\s*(?:my\s*)?(?:meals?|eating|diet)|create\s+(?:a\s+|me\s+a\s+)?\w*\s*meal\s*plan|make\s+(?:me\s+)?(?:a\s+)?meal\s*plan|build\s+(?:me\s+)?(?:a\s+)?meal\s*plan|generate\s+(?:a\s+)?meal\s*plan|set\s+up\s+(?:my\s+)?meals?)\b/i;

const DIETARY_PREFS = [
  { re: /\b(vegan|plant[-\s]?based)\b/i,             pref: "vegan" },
  { re: /\b(vegetarian|veggie)\b/i,                   pref: "vegetarian" },
  { re: /\b(pescatarian|fish)\b/i,                    pref: "pescatarian" },
  { re: /\b(pcos)\b/i,                                pref: "pcos" },
  { re: /\b(low[\s-]?carb|keto)\b/i,                  pref: "low-carb" },
  { re: /\b(gluten[\s-]?free)\b/i,                    pref: "gluten-free" },
  { re: /\b(dairy[\s-]?free)\b/i,                     pref: "dairy-free" },
];

// Pull a friendly preference string out of an arbitrary message
// (e.g. "make me a vegetarian week plan" → "vegetarian"). Used as
// the data.preferences value when we synthesise a CREATE_MEAL_PLAN.
export function detectDietaryPref(text) {
  const s = String(text || "");
  for (const p of DIETARY_PREFS) {
    if (p.re.test(s)) return p.pref;
  }
  return "balanced";
}

// QA round 5/6 — synthesise a CREATE_MEAL_PLAN action when Jess's
// envelope came back empty (or a CLARIFICATION_NEEDED stall) AND
// the user explicitly asked for a meal plan. The action goes
// through the same scaffoldMealPlan executor as a real
// CREATE_MEAL_PLAN, so the user gets 21 MealLog rows on /Nutrition
// even when the LLM tried to deflect.
//
// Trigger conditions (any one is enough):
//   1. parsed._fallback === true            (envelope unparseable)
//   2. parsed.actions is empty / missing    (LLM returned message-only)
//   3. every action is CLARIFICATION_NEEDED (LLM hedged on confidence)
// PLUS: the user's message must match MEAL_PLAN_REGEX.
function _shouldInjectMealPlan(parsed, userMessage) {
  if (!userMessage || !MEAL_PLAN_REGEX.test(String(userMessage))) return false;
  if (!parsed) return true;
  if (parsed._fallback === true || parsed.fallback === true) return true;
  const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
  if (actions.length === 0) return true;
  const allClarify = actions.every((a) => a?.type === "CLARIFICATION_NEEDED");
  if (allClarify) return true;
  return false;
}

export function injectMealPlanIfNeeded(parsed, userMessage) {
  if (!_shouldInjectMealPlan(parsed, userMessage)) return parsed;
  const pref = detectDietaryPref(userMessage);
  const injected = {
    type: "CREATE_MEAL_PLAN",
    confidence: 0.95,
    data: {
      days: 7,
      preferences: [pref],
      user_message: userMessage.slice(0, 200),
    },
  };
  // Replace the (refusal) message with a confirmation so the
  // bubble doesn't say "I can't" while we silently write data.
  const friendly = pref === "balanced"
    ? "Got it — I've planned a 7-day balanced meal plan for you. Open Nutrition to see the week."
    : `Got it — I've planned a 7-day ${pref} meal plan for you. Open Nutrition to see the week.`;
  return {
    message: friendly,
    actions: [injected],
    _fallback: false,
    _injectedMealPlan: true,
  };
}

// ─── Meal-plan scaffold ─────────────────────────────────────────────
// When Jess emits a CREATE_MEAL_PLAN with `{ days, preferences }` but
// no explicit `plan` array, build placeholder breakfast/lunch/dinner
// rows for each upcoming day. The placeholders are intentionally
// simple — they go into MealLog so the user can open Nutrition and
// see "something is here" rather than an empty week. The user (or
// Jess via follow-up) can refine each entry later.
//
// Preference matching is loose by design — substring match across the
// pref list. Unknown prefs fall through to OMNIVORE.
const MEAL_TEMPLATES = {
  vegetarian: {
    breakfast: ["Overnight oats with berries", "Spinach + feta scramble", "Greek yoghurt + granola + honey", "Avocado on sourdough", "Smoothie bowl (banana, oat milk, spinach)", "Mushroom + tomato on toast", "Porridge with almond butter + apple"],
    lunch:     ["Lentil + spinach soup with bread", "Halloumi + roasted veg salad", "Hummus + grilled veg wrap", "Quinoa bowl with chickpeas + tahini", "Pasta with pesto + cherry tomatoes", "Baked sweet potato + black bean chilli", "Frittata with side salad"],
    dinner:    ["Vegetable curry with brown rice", "Mushroom risotto + green salad", "Stuffed peppers with quinoa + feta", "Aubergine parmigiana + crusty bread", "Cauliflower steak with herb sauce + couscous", "Mushroom + spinach stroganoff with pasta", "Black bean tacos with slaw"],
  },
  vegan: {
    breakfast: ["Overnight oats with chia + berries", "Tofu scramble with greens", "Granola with oat milk + banana", "Avocado + tomato on toast", "Smoothie bowl (banana, almond milk, kale)", "Chickpea pancakes with mushrooms", "Porridge with peanut butter + apple"],
    lunch:     ["Lentil + spinach soup + sourdough", "Falafel + tabbouleh wrap", "Hummus + roasted veg wrap", "Quinoa bowl with chickpeas + tahini", "Pasta with vegan pesto + cherry tomatoes", "Baked sweet potato + black bean chilli", "Buddha bowl: rice, edamame, slaw, tahini"],
    dinner:    ["Vegetable curry with brown rice", "Mushroom + lentil bolognese", "Stuffed peppers with quinoa + walnuts", "Tofu stir-fry with brown rice", "Cauliflower steak with herb sauce + couscous", "Coconut chickpea curry with rice", "Black bean tacos with slaw + guac"],
  },
  pescatarian: {
    breakfast: ["Smoked salmon + scrambled egg", "Avocado on sourdough + poached egg", "Greek yoghurt + granola + honey", "Porridge with almond butter + berries", "Mushroom omelette", "Overnight oats with chia", "Toast with peanut butter + banana"],
    lunch:     ["Tuna + white bean salad", "Salmon poke bowl with brown rice", "Prawn + avocado wrap", "Smoked mackerel + new potato salad", "Pasta with pesto + cherry tomatoes", "Egg + watercress sandwich", "Sushi platter with miso soup"],
    dinner:    ["Baked salmon with greens + sweet potato", "Cod traybake with vegetables", "Prawn linguine with chilli + garlic", "Thai red curry with prawns + rice", "Salmon fishcakes + slaw", "Grilled trout with quinoa + asparagus", "Tuna nicoise"],
  },
  pcos: {
    breakfast: ["Overnight oats with berries + chia (low-GI)", "Spinach + feta scramble + tomato", "Greek yoghurt + nuts + cinnamon", "Avocado on rye + boiled egg", "Smoothie bowl (berries, oat milk, flax)", "Cottage cheese + berries + walnut", "Porridge with almond butter + cinnamon"],
    lunch:     ["Lentil + spinach soup + rye", "Chicken + roasted veg + quinoa", "Salmon poke bowl with brown rice", "Halloumi + roasted veg salad", "Tuna + white bean salad", "Sweet potato + chickpea + spinach bowl", "Frittata with mixed leaves"],
    dinner:    ["Salmon with greens + sweet potato", "Chicken + cauliflower rice + vegetables", "Mushroom + lentil bolognese", "Stuffed peppers with quinoa", "Thai curry with prawns + brown rice", "Cod traybake with vegetables", "Beef + broccoli stir-fry with rice"],
  },
  omnivore: {
    breakfast: ["Eggs on sourdough + tomato", "Greek yoghurt + granola + berries", "Bacon + mushroom + scrambled egg", "Avocado on toast + poached egg", "Porridge with banana + honey", "Smoothie bowl with oat milk", "Toast with peanut butter + apple"],
    lunch:     ["Chicken + roasted veg salad", "Tuna + white bean salad", "Falafel + hummus wrap", "Pasta with pesto + cherry tomatoes", "Steak + watercress sandwich", "Quinoa bowl with chickpeas", "Soup + crusty bread"],
    dinner:    ["Roast chicken + greens + sweet potato", "Salmon with vegetables + new potatoes", "Beef stir-fry with brown rice", "Pasta bolognese with side salad", "Thai curry with chicken + rice", "Mushroom risotto", "Pork chop with apple slaw + potatoes"],
  },
};

function pickTemplateBucket(prefs) {
  const blob = String(prefs.join(" ")).toLowerCase();
  if (/(vegan)/.test(blob))         return MEAL_TEMPLATES.vegan;
  if (/(pescatar|fish)/.test(blob)) return MEAL_TEMPLATES.pescatarian;
  if (/(pcos)/.test(blob))          return MEAL_TEMPLATES.pcos;
  if (/(vegetarian)/.test(blob))    return MEAL_TEMPLATES.vegetarian;
  return MEAL_TEMPLATES.omnivore;
}

function dateOffset(start, days) {
  const d = new Date(start);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function parseDateOrToday(s) {
  if (!s) return new Date();
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

// Returns an array of MealLog payloads (date + meal_type + food_items
// for breakfast/lunch/dinner × N days).
function scaffoldMealPlan(days, prefs, start) {
  const bucket = pickTemplateBucket(prefs || []);
  const out = [];
  for (let i = 0; i < days; i++) {
    const date = dateOffset(start, i);
    out.push({ date, meal_type: "breakfast", food_items: bucket.breakfast[i % bucket.breakfast.length] });
    out.push({ date, meal_type: "lunch",     food_items: bucket.lunch[i % bucket.lunch.length] });
    out.push({ date, meal_type: "dinner",    food_items: bucket.dinner[i % bucket.dinner.length] });
  }
  return out;
}

// ─── Parse — safe extraction with fallback ───────────────────────────
// Tries JSON.parse on the raw agent reply. If that fails, tries to
// locate the first balanced {...} envelope embedded inside prose or
// fences. If THAT still fails, returns the raw text with any trailing
// JSON-looking debris stripped so a partial stream chunk never leaks
// `["*Find PCOS nutrition tips", "*Find fe...` into the visible bubble.
// Also handles the common ```json ... ``` code-fence wrapper.
export function parseJessResponse(raw) {
  const text = String(raw || "").trim();
  if (!text) return { message: "", actions: [], _fallback: true };

  // Strip ```json fences if present at start/end of the WHOLE message.
  const fenced = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/g, "")
    .trim();

  // Pass 1 — full JSON parse on the de-fenced string.
  const direct = _tryEnvelope(fenced);
  if (direct) return { ...direct, _fallback: false };

  // Pass 1.5 — QA FIX A. If the text has a ```json … ``` (or just
  // ``` … ```) block ANYWHERE inside it (not just at start/end), pull
  // the content between the first balanced pair of triple-backticks
  // and try parsing that. Catches "Some preamble.\n```json\n{...}\n```"
  // and the common Anthropic-style code-fence wrapping where the
  // fence is preceded by prose like "Here's the response:".
  const fenceContent = _extractFromCodeFence(text);
  if (fenceContent) {
    const fromFence = _tryEnvelope(fenceContent);
    if (fromFence) return { ...fromFence, _fallback: false };
  }

  // Pass 2 — find the FIRST balanced {...} block anywhere in the text
  // and try to parse that. Catches "prose blah\n{...envelope...}\nmore"
  // and partial fenceless streams where the LLM dumps prose AND a
  // tail envelope.
  const extracted = _extractFirstJsonObject(fenced);
  if (extracted) {
    const envelope = _tryEnvelope(extracted);
    if (envelope) return { ...envelope, _fallback: false };
  }

  // Pass 3 — degraded fallback. Strip ANY trailing JSON-ish debris so
  // the user never sees raw `[`, `{`, `"actions":` fragments in the
  // bubble. Returns _fallback: true so the subscribe handler knows
  // actions weren't extracted.
  const sanitized = _stripTrailingJsonDebris(text);
  return { message: sanitized, actions: [], _fallback: true };
}

// Internal — try to interpret a string as { message, actions } envelope.
function _tryEnvelope(s) {
  try {
    const j = JSON.parse(s);
    if (!j || typeof j !== "object" || Array.isArray(j)) return null;
    const msg = typeof j.message === "string" ? j.message : "";
    const actions = Array.isArray(j.actions) ? j.actions : [];
    if (!msg && actions.length === 0) return null;
    return { message: msg, actions };
  } catch {
    return null;
  }
}

// QA FIX A — Pull the content between the first pair of triple-backticks
// (with optional `json` language tag) anywhere in the text. Handles all
// of: ```json\n{...}\n```, ```\n{...}\n```, ``` json {...} ```,
// "Some preamble\n```json\n{...}\n```\nMore text." Returns null when
// no balanced fence pair is present. The opening fence-match is
// case-insensitive on the `json` tag.
function _extractFromCodeFence(text) {
  if (!text || text.indexOf("```") < 0) return null;
  // Strip optional `json` tag + whitespace after the opening fence.
  const openMatch = text.match(/```(?:json)?\s*/i);
  if (!openMatch) return null;
  const start = openMatch.index + openMatch[0].length;
  const closeIdx = text.indexOf("```", start);
  if (closeIdx < 0) return null;
  return text.slice(start, closeIdx).trim();
}

// Internal — walk the string, ignoring braces inside string literals,
// and return the FIRST balanced {...} substring. Returns null if no
// balanced block exists (e.g. mid-stream truncated envelope).
function _extractFirstJsonObject(text) {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escaped) { escaped = false; continue; }
    if (inString) {
      if (ch === "\\") { escaped = true; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// Internal — last-resort guard. Removes anything from the LAST suspicious
// JSON-ish opener (e.g. `, "actions": [`, a trailing standalone `[`, or a
// trailing standalone `{`) to end-of-string. Conservative: only acts when
// the text contains a clear JSON-envelope marker so prose paragraphs
// that happen to mention brackets aren't mangled.
function _stripTrailingJsonDebris(text) {
  if (!text) return text;
  let out = text;
  // Drop a trailing partial `"actions": [...]` fragment (the most common
  // leakage when the LLM half-streams an envelope into prose).
  out = out.replace(/[,\s]*["']?actions["']?\s*:\s*\[[\s\S]*$/i, "").trim();
  // Drop a trailing `"message": "..."` fragment.
  out = out.replace(/[,\s]*["']?message["']?\s*:\s*"[\s\S]*$/i, "").trim();
  // QA Fix 3 — strip ANY trailing JSON array of quoted strings, balanced
  // or unbalanced. Used to only strip unbalanced (relying on
  // splitChipsFromText to lift the balanced ones) but historical messages
  // come through loadConversation which doesn't run splitChipsFromText.
  // Result: balanced arrays bled into the bubble text on resumed
  // threads. The pattern matches `["A","B"]`, `["A","B"`, `["A","B...`
  // — anything that opens with `[ "..."` and chains string entries.
  out = out.replace(/[\s,.]*\[\s*"[^"]{0,200}"(?:\s*,\s*"[^"]{0,200}"){0,11}\s*,?\s*[^\]]*\]?[\s.]*$/, "").trim();
  // Drop a trailing standalone unbalanced `{...` envelope opener.
  out = out.replace(/[\s,]*\{[\s\S]*$/, (match) => {
    const opens = (match.match(/\{/g) || []).length;
    const closes = (match.match(/\}/g) || []).length;
    return opens > closes ? "" : match;
  }).trim();
  // Trim any dangling separator characters left after the strip.
  out = out.replace(/[,\s]+$/, "").trim();
  return out;
}

// ─── Dispatch a single action to its Base44 entity ──────────────────
async function executeAction(action, userId) {
  if (!action || typeof action !== "object") {
    throw new Error("invalid action");
  }
  const type = action.type;
  const data = action.data || {};
  const Ent = base44?.entities || {};
  const meta = { user_id: userId, created_by: userId };

  switch (type) {
    // ── Daily check-in (mood / energy / sleep / combined) ──
    case ACTION_TYPES.LOG_MOOD:
    case ACTION_TYPES.LOG_ENERGY:
    case ACTION_TYPES.LOG_SLEEP:
    case ACTION_TYPES.LOG_DAILY_CHECKIN: {
      if (!Ent.DailyCheckins) throw new Error("DailyCheckins entity not available");
      const payload = { ...meta, date: data.date || today() };
      if (data.mood != null)         payload.mood = Number(data.mood);
      if (data.energy != null)       payload.energy = Number(data.energy);
      if (data.sleep_hours != null)  payload.sleep_hours = Number(data.sleep_hours);
      // Allow flexible synonyms from the LLM.
      if (data.sleep != null && payload.sleep_hours == null) payload.sleep_hours = Number(data.sleep);
      return await Ent.DailyCheckins.create(payload);
    }

    // ── Symptom ──
    case ACTION_TYPES.LOG_SYMPTOM: {
      if (!Ent.SymptomLogs) throw new Error("SymptomLogs entity not available");
      const payload = {
        ...meta,
        date: data.date || today(),
        symptom: data.symptom || data.name || "unspecified",
        severity: data.severity != null ? Number(data.severity) : null,
        notes: data.notes || "",
      };
      return await Ent.SymptomLogs.create(payload);
    }

    // ── Meal ──
    case ACTION_TYPES.LOG_MEAL: {
      if (!Ent.MealLog) throw new Error("MealLog entity not available");
      const payload = {
        ...meta,
        date: data.date || today(),
        meal_type: data.meal_type || data.mealType || "snack",
        food_items: data.food_items || data.items || data.food || "",
        notes: data.notes || "",
      };
      return await Ent.MealLog.create(payload);
    }

    // ── Meal plan (batch over N upcoming days) ──
    // Accepts EITHER:
    //   { plan: [{date, meal_type, food_items, notes}, ...] }  — explicit
    //   { meals: [...] }                                        — alias
    //   { days: 7, preferences: ["vegetarian"], start_date? }   — scaffolded
    //
    // When `days` is provided without an explicit plan, we generate
    // breakfast/lunch/dinner placeholders for each upcoming day, tuned
    // to the user's stated dietary preferences. This lets Jess return
    // a SHORT envelope (`{ days: 7, preferences: [...] }`) instead of
    // having to serialise 21 meal rows in its JSON response — which it
    // routinely refused to do because of token budget anxiety.
    case ACTION_TYPES.CREATE_MEAL_PLAN: {
      if (!Ent.MealLog) throw new Error("MealLog entity not available");

      let plan = Array.isArray(data.plan) ? data.plan
              : Array.isArray(data.meals) ? data.meals
              : [];

      // Scaffold from days + preferences if no explicit plan came down.
      if (plan.length === 0) {
        const days = Number(data.days) > 0 ? Math.min(Math.floor(Number(data.days)), 14) : 7;
        const prefs = Array.isArray(data.preferences) ? data.preferences.map(String) : [];
        const start = parseDateOrToday(data.start_date);
        plan = scaffoldMealPlan(days, prefs, start);
      }

      if (plan.length === 0) throw new Error("empty meal plan");

      const out = [];
      for (const item of plan) {
        try {
          const payload = {
            ...meta,
            date: item.date || today(),
            meal_type: item.meal_type || item.mealType || "snack",
            food_items: item.food_items || item.items || item.food || "",
            notes: item.notes || (Array.isArray(data.preferences) ? `Plan: ${data.preferences.join(", ")}` : ""),
          };
          const r = await Ent.MealLog.create(payload);
          out.push(r);
        } catch (e) { out.push({ error: String(e?.message || e) }); }
      }
      return out;
    }

    // ── Hydration ──
    case ACTION_TYPES.LOG_HYDRATION: {
      if (!Ent.HydrationLog) throw new Error("HydrationLog entity not available");
      const payload = {
        ...meta,
        date: data.date || today(),
        cups: data.cups != null ? Number(data.cups) : (data.glasses != null ? Number(data.glasses) : 1),
        notes: data.notes || "",
      };
      return await Ent.HydrationLog.create(payload);
    }

    // ── Medication ──
    case ACTION_TYPES.LOG_MEDICATION: {
      if (!Ent.MedicationLogs) throw new Error("MedicationLogs entity not available");
      const payload = {
        ...meta,
        medication_name: data.medication_name || data.name || "medication",
        dose: data.dose || "",
        taken_at: data.taken_at || nowISO(),
        notes: data.notes || "",
      };
      return await Ent.MedicationLogs.create(payload);
    }

    // ── Supplement ──
    case ACTION_TYPES.LOG_SUPPLEMENT: {
      if (!Ent.SupplementLog) throw new Error("SupplementLog entity not available");
      const payload = {
        ...meta,
        supplement_name: data.supplement_name || data.name || "supplement",
        dose: data.dose || "",
        taken_at: data.taken_at || nowISO(),
        notes: data.notes || "",
      };
      return await Ent.SupplementLog.create(payload);
    }

    // ── Habit ──
    case ACTION_TYPES.LOG_HABIT: {
      if (!Ent.HabitLogs) throw new Error("HabitLogs entity not available");
      const payload = {
        ...meta,
        date: data.date || today(),
        habit_name: data.habit_name || data.name || "habit",
        completed: data.completed !== false,
        notes: data.notes || "",
      };
      return await Ent.HabitLogs.create(payload);
    }

    // ── Task ──
    case ACTION_TYPES.CREATE_TASK: {
      if (!Ent.PersonalTasks) throw new Error("PersonalTasks entity not available");
      // QA round 6 — title was being defaulted to "New task" because
      // we only looked at `title`/`task_title`/`text`/`name`. The LLM
      // emits `task_name` in some replies (and `title` in others).
      // Pull from every known synonym before defaulting.
      const taskTitle =
        data.task_name || data.title || data.taskTitle ||
        data.task_title || data.text || data.name ||
        "New task";
      // QA round 6 — PersonalTasks schema requires `date`, not
      // `due_date`. The rich-payload attempt previously failed with
      //   Error in field date: Field required
      // so we now send `date` (mapping due_date → date if Jess used
      // the alias). Optional fields are appended only when truthy
      // so the rich payload doesn't include empty strings the
      // schema might reject.
      const taskDate = data.due_date || data.date || today();
      const richPayload = {
        ...meta,
        title: taskTitle,
        date: taskDate,
        completed: false,
        status: "pending",
      };
      if (data.time_of_day || data.timeOfDay) richPayload.time_of_day = data.time_of_day || data.timeOfDay;
      if (data.notes) richPayload.notes = data.notes;
      try {
        const r = await Ent.PersonalTasks.create(richPayload);
        try { console.log("[jess-execute] ✓ CREATE_TASK wrote (rich)", r?.id || r); } catch {}
        return r;
      } catch (e1) {
        const err1 = String(e1?.message || e1);
        try { console.warn("[jess-execute] CREATE_TASK rich payload failed", { err: err1, payload: richPayload }); } catch {}
        // Minimal fallback — every PersonalTasks schema we know of
        // accepts at least user_id + title + date.
        try {
          const minimal = {
            user_id: userId,
            created_by: userId,
            title: taskTitle,
            date: taskDate,
          };
          const r2 = await Ent.PersonalTasks.create(minimal);
          try { console.log("[jess-execute] ✓ CREATE_TASK wrote (minimal)", r2?.id || r2); } catch {}
          return r2;
        } catch (e2) {
          const err2 = String(e2?.message || e2);
          try { console.error("[jess-execute] ✗ CREATE_TASK minimal also failed", { err: err2, payload: { user_id: userId, title: taskTitle, date: taskDate } }); } catch {}
          throw e2;
        }
      }
    }

    case ACTION_TYPES.COMPLETE_TASK: {
      if (!Ent.PersonalTasks) throw new Error("PersonalTasks entity not available");
      const id = data.id || data.taskId;
      if (!id) throw new Error("missing task id");
      return await Ent.PersonalTasks.update(id, { completed: true, completed_at: nowISO() });
    }

    // ── Journal ──
    case ACTION_TYPES.WRITE_JOURNAL: {
      if (!Ent.JournalEntries) throw new Error("JournalEntries entity not available");
      const payload = {
        ...meta,
        date: data.date || today(),
        content: data.content || data.text || data.body || "",
        mood: data.mood != null ? Number(data.mood) : null,
        session_date: data.session_date || today(),
      };
      if (!payload.content) throw new Error("empty journal content");
      return await Ent.JournalEntries.create(payload);
    }

    // ── Planner item (Sprint 7 — Voice to Schedule) ──
    // Writes a PlannerItem the user spoke into the mic. Supports a
    // `recurring` flag — when set, fans the row out across N upcoming
    // days (default 14) so the recurrence shows up on the cycle calendar
    // without needing a separate recurring-rule engine yet.
    case ACTION_TYPES.CREATE_PLANNER_ITEM: {
      if (!Ent.PlannerItems) throw new Error("PlannerItems entity not available");
      const baseDate = data.date || today();
      const recurring = (data.recurring && data.recurring !== "false")
        ? String(data.recurring)
        : null;
      const baseRow = {
        ...meta,
        date_str: baseDate,
        title: data.title || "Untitled",
        time: data.time || null,
        item_type: data.item_type || data.category || "event",
        category: data.category || data.item_type || "task",
        source: data.source || "voice",
        notes: data.notes || "",
        created_at: nowISO(),
        updated_at: nowISO(),
      };

      // Single-shot when not recurring.
      if (!recurring) {
        try { return await Ent.PlannerItems.create(baseRow); }
        catch {
          // Fallback for schemas without category/source fields.
          const fallback = { ...meta, date_str: baseDate, title: baseRow.title, time: baseRow.time, item_type: "event", created_at: baseRow.created_at, updated_at: baseRow.updated_at };
          return await Ent.PlannerItems.create(fallback);
        }
      }

      // Recurring — fan out over a window. daily=14 days, weekly=6 weeks.
      const window = recurring === "weekly" ? 6 : 14;
      const stepDays = recurring === "weekly" ? 7 : 1;
      const start = parseDateOrToday(baseDate);
      const out = [];
      for (let i = 0; i < window; i++) {
        try {
          const row = { ...baseRow, date_str: dateOffset(start, i * stepDays), recurrence_key: `${baseRow.title}|${recurring}|${baseDate}` };
          const r = await Ent.PlannerItems.create(row);
          out.push(r);
        } catch (e) { out.push({ error: String(e?.message || e) }); }
      }
      return out;
    }

    // ── Pure read intent — no write to perform ──
    case ACTION_TYPES.QUERY_DATA:
      return { ok: true, noOp: true, reason: "query intent, no write" };

    case ACTION_TYPES.CLARIFICATION_NEEDED:
      return { ok: true, noOp: true, reason: "agent asked for clarification" };

    default:
      throw new Error(`unknown action type: ${type}`);
  }
}

// ─── Execute a batch of actions (confidence-gated) ──────────────────
// Returns one result per action: { action, success, result?, error? }.
// Confidence < 0.75 actions are skipped (and tagged as such) so the
// LLM can't accidentally write garbage.
export async function executeJessActions(actions = [], userId) {
  if (!Array.isArray(actions) || actions.length === 0) {
    // QA FIX 2 — surface why nothing fired. Logged once per call so
    // empty-action invocations are visible in production console.
    try { console.log("[jess-execute] no actions to fire", { hasUser: !!userId }); } catch {}
    return [];
  }
  if (!userId) {
    try { console.warn("[jess-execute] skipped — no userId", { count: actions.length }); } catch {}
  }
  const results = [];
  for (const action of actions) {
    const conf = Number(action?.confidence);
    if (!Number.isFinite(conf) || conf < CONFIDENCE_FLOOR) {
      results.push({
        action,
        success: false,
        skipped: true,
        reason: `confidence ${Number.isFinite(conf) ? conf : "n/a"} below ${CONFIDENCE_FLOOR}`,
      });
      try { console.log("[jess-execute] skipped (low confidence)", { type: action?.type, conf }); } catch {}
      continue;
    }
    if (!userId) {
      results.push({ action, success: false, error: "no userId" });
      continue;
    }
    try {
      const result = await executeAction(action, userId);
      results.push({ action, result, success: true });
      try { console.log("[jess-execute] ✓ wrote", { type: action.type, data: action.data, result }); } catch {}
    } catch (e) {
      const err = String(e?.message || e);
      results.push({ action, error: err, success: false });
      // QA round 5 — log the action data alongside the error so we
      // can see which field the entity rejected without needing
      // server-side log access.
      try {
        console.warn("[jess-execute] ✗ failed", {
          type: action.type,
          error: err,
          data: action.data,
          userId,
        });
      } catch { /* swallow */ }
    }
  }
  return results;
}

// ─── Memory ─────────────────────────────────────────────────────────
// One breadcrumb per user turn: what they said, what Jess replied, and
// which action types were successfully executed. Rolling 20 entries.
export function updateJessMemory(memory = [], results = [], userMessage = "", jessReply = "") {
  const successful = (results || [])
    .filter((r) => r && r.success)
    .map((r) => r?.action?.type)
    .filter(Boolean);
  const entry = {
    ts: Date.now(),
    userMessage: String(userMessage || "").slice(0, 120),
    jessReply:   String(jessReply || "").slice(0, 120),
    actionsExecuted: successful,
  };
  const prev = Array.isArray(memory) ? memory : [];
  return [entry, ...prev].slice(0, MEM_LIMIT);
}

export function loadJessMemory(userId) {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(memKey(userId));
    if (!raw) return [];
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j.slice(0, MEM_LIMIT) : [];
  } catch { return []; }
}

export function saveJessMemory(userId, memory) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(memKey(userId), JSON.stringify(memory || []));
  } catch { /* swallow quota */ }
}

// Compact memory context string for the system prompt. Returns "" when
// there's nothing memorable.
export function buildMemoryContextLine(memory = []) {
  if (!Array.isArray(memory) || memory.length === 0) return "";
  const lines = memory.slice(0, 8).map((m) => {
    const acts = (m.actionsExecuted || []).join(", ") || "no actions";
    return `- "${m.userMessage}" → [${acts}]`;
  });
  return `Recent turns (newest first, last 8 of ${memory.length}):\n${lines.join("\n")}`;
}

// ─── Confirmation chip copy ─────────────────────────────────────────
// Short one-line label per action type for the inline confirmation
// chip the chat shell shows below Jess's message after a successful
// write. Used by both text chat and voice mode.
export function chipLabelForAction(type, data) {
  switch (type) {
    case ACTION_TYPES.LOG_MOOD:           return "✓ Logged your mood";
    case ACTION_TYPES.LOG_ENERGY:         return "✓ Logged your energy";
    case ACTION_TYPES.LOG_SLEEP:          return "✓ Logged your sleep";
    case ACTION_TYPES.LOG_DAILY_CHECKIN:  return "✓ Logged your check-in";
    case ACTION_TYPES.LOG_SYMPTOM:        return `✓ Logged ${data?.symptom || "symptom"}`;
    case ACTION_TYPES.LOG_MEAL:           return "✓ Logged your meal";
    case ACTION_TYPES.CREATE_MEAL_PLAN:   return "✓ Saved your meal plan";
    case ACTION_TYPES.LOG_HYDRATION:      return "✓ Logged hydration";
    case ACTION_TYPES.LOG_MEDICATION:     return `✓ Logged ${data?.medication_name || "medication"}`;
    case ACTION_TYPES.LOG_SUPPLEMENT:     return `✓ Logged ${data?.supplement_name || "supplement"}`;
    case ACTION_TYPES.LOG_HABIT:          return `✓ Logged ${data?.habit_name || "habit"}`;
    case ACTION_TYPES.CREATE_TASK:        return `✓ Added task`;
    case ACTION_TYPES.COMPLETE_TASK:      return `✓ Marked task done`;
    case ACTION_TYPES.WRITE_JOURNAL:      return `✓ Saved to journal`;
    case ACTION_TYPES.CREATE_PLANNER_ITEM: {
      const t = data?.title ? `"${String(data.title).slice(0, 30)}"` : "item";
      const r = data?.recurring ? ` (${data.recurring})` : "";
      return `✓ Added ${t} to planner${r}`;
    }
    default:                              return null;
  }
}

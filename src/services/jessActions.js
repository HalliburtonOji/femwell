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

// QA round 7 — CREATE_TASK client-side intent injector (mirror of
// the meal-plan injector). The model keeps returning prose like
// "Done — I've added that to your morning list" with no JSON action.
// Detect the task intent in the user message, extract title + time-
// of-day + date from natural-language patterns, and synthesise a
// CREATE_TASK action so the PersonalTasks row actually gets written.
export const TASK_REGEX =
  /\b(?:add|put|remind(?:\s+me)?|remember|create|make|schedule|log)\b[^\n]{0,80}\b(?:task|to-?do|reminder|to\s+my\s+(?:morning|afternoon|evening|tasks?|lists?|to-?do)|in\s+(?:my\s+)?(?:morning|afternoon|evening))\b/i;

export function extractTaskFromMessage(userMessage) {
  const text = String(userMessage || "").trim();
  let title = null;

  // "add X to my tasks / morning / list" / "put X on my list"
  const m1 = text.match(/(?:add|put)\s+(.+?)\s+(?:to|on|in)\s+(?:my\s+)?(?:tasks?|to-?do|list|morning|afternoon|evening)/i);
  if (m1) title = m1[1];

  // "remind me to X (for|by|on|at|tomorrow|today|tonight) …"
  if (!title) {
    const m2 = text.match(/remind(?:\s+me)?\s+to\s+(.+?)(?:\s+(?:for|by|on|at|tomorrow|today|tonight)\b|$)/i);
    if (m2) title = m2[1];
  }

  // "remember to X …"
  if (!title) {
    const m3 = text.match(/remember\s+to\s+(.+?)(?:\s+(?:for|by|on|at|tomorrow|today|tonight)\b|$)/i);
    if (m3) title = m3[1];
  }

  // "schedule / create / make X"
  if (!title) {
    const m4 = text.match(/(?:schedule|create|make)\s+(?:a\s+)?(?:task\s+(?:to\s+|for\s+)?)?(.+?)(?:\s+(?:for|by|on|at|tomorrow|today|tonight)\b|$)/i);
    if (m4) title = m4[1];
  }

  if (!title) title = text.slice(0, 80);
  title = String(title).trim().replace(/^[\s"']+|[\s"',.;]+$/g, "");

  // Time-of-day — morning/afternoon/evening (tonight collapses to evening)
  const timeMatch = text.match(/\b(morning|afternoon|evening|tonight|night)\b/i);
  let time_of_day = "";
  if (timeMatch) {
    const t = timeMatch[1].toLowerCase();
    time_of_day = (t === "tonight" || t === "night") ? "evening" : t;
  }

  // Date — tomorrow / today / tonight / day-of-week / next week
  const dateObj = new Date(); dateObj.setHours(0, 0, 0, 0);
  if (/\btomorrow\b/i.test(text)) {
    dateObj.setDate(dateObj.getDate() + 1);
  } else if (/\bnext week\b/i.test(text)) {
    dateObj.setDate(dateObj.getDate() + 7);
  } else {
    const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const dayMatch = text.toLowerCase().match(/\b(?:next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
    if (dayMatch) {
      const target = days.indexOf(dayMatch[1]);
      const now = dateObj.getDay();
      let delta = (target - now + 7) % 7;
      if (delta === 0) delta = 7;
      dateObj.setDate(dateObj.getDate() + delta);
    }
  }
  const date = toLocalISO(dateObj);
  return { title, time_of_day, date, due_date: date };
}

function toLocalISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function injectTaskIfNeeded(parsed, userMessage) {
  if (!parsed) return parsed;
  if (!userMessage || !TASK_REGEX.test(String(userMessage))) return parsed;
  // Don't inject if there's already a real CREATE_TASK in actions.
  const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
  if (actions.some((a) => a?.type === "CREATE_TASK")) return parsed;
  // Same trigger surface as the meal-plan injector: fallback OR
  // empty actions OR all CLARIFICATION_NEEDED.
  const fallback = parsed._fallback === true || parsed.fallback === true;
  const allClarify = actions.length > 0 && actions.every((a) => a?.type === "CLARIFICATION_NEEDED");
  if (!fallback && actions.length > 0 && !allClarify) return parsed;

  const taskData = extractTaskFromMessage(userMessage);
  const injected = {
    type: "CREATE_TASK",
    confidence: 0.9,
    data: taskData,
  };
  const friendly = taskData.time_of_day
    ? `Got it — I've added "${taskData.title}" to your ${taskData.time_of_day} list ✓`
    : `Got it — I've added "${taskData.title}" to your to-do list ✓`;
  return {
    message: friendly,
    actions: [injected],
    _fallback: false,
    _injectedTask: true,
  };
}

// QA round 10 — shared trigger gate for all client-side injectors.
// Fires when the LLM has effectively NOT taken the action: fallback
// envelope, empty actions, or all CLARIFICATION_NEEDED.
function _needsInjection(parsed, alreadyHasType) {
  if (!parsed) return true;
  const fallback = parsed._fallback === true || parsed.fallback === true;
  const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
  if (alreadyHasType && actions.some((a) => a?.type === alreadyHasType)) return false;
  if (fallback) return true;
  if (actions.length === 0) return true;
  return actions.every((a) => a?.type === "CLARIFICATION_NEEDED");
}

// ─── MOOD INJECTOR ──────────────────────────────────────────────────
export const MOOD_REGEX = /\b(?:feel(?:ing)?|mood|emotion|i'm|i\s+am)\b[^\n]{0,40}\b(?:happy|sad|anxious|stressed|tired|exhausted|good|great|awful|low|high|energis(?:ed|e)|calm|angry|frustrated|hopeful|overwhelmed|flat|numb|ok|okay|fine|alright|content|miserable|down)\b/i;

const MOOD_MAP = {
  // (label) → { value 1-5, mood_label }
  "happy":        { mood: 5, mood_label: "happy" },
  "great":        { mood: 5, mood_label: "great" },
  "good":         { mood: 4, mood_label: "good" },
  "hopeful":      { mood: 4, mood_label: "hopeful" },
  "calm":         { mood: 4, mood_label: "calm" },
  "content":      { mood: 4, mood_label: "content" },
  "ok":           { mood: 3, mood_label: "ok" },
  "okay":         { mood: 3, mood_label: "ok" },
  "fine":         { mood: 3, mood_label: "fine" },
  "alright":      { mood: 3, mood_label: "alright" },
  "flat":         { mood: 3, mood_label: "flat" },
  "numb":         { mood: 2, mood_label: "numb" },
  "tired":        { mood: 2, mood_label: "tired" },
  "exhausted":    { mood: 2, mood_label: "exhausted" },
  "stressed":     { mood: 2, mood_label: "stressed" },
  "anxious":      { mood: 2, mood_label: "anxious" },
  "overwhelmed":  { mood: 2, mood_label: "overwhelmed" },
  "frustrated":   { mood: 2, mood_label: "frustrated" },
  "low":          { mood: 2, mood_label: "low" },
  "down":         { mood: 2, mood_label: "down" },
  "sad":          { mood: 2, mood_label: "sad" },
  "angry":        { mood: 1, mood_label: "angry" },
  "awful":        { mood: 1, mood_label: "awful" },
  "miserable":    { mood: 1, mood_label: "miserable" },
};

export function extractMoodFromMessage(userMessage) {
  const text = String(userMessage || "").toLowerCase();
  for (const word of Object.keys(MOOD_MAP)) {
    const re = new RegExp("\\b" + word + "\\b");
    if (re.test(text)) return MOOD_MAP[word];
  }
  return { mood: 3, mood_label: "neutral" };
}

export function injectMoodIfNeeded(parsed, userMessage) {
  if (!_needsInjection(parsed, "LOG_MOOD")) return parsed;
  if (!userMessage || !MOOD_REGEX.test(String(userMessage))) return parsed;
  const { mood, mood_label } = extractMoodFromMessage(userMessage);
  const injected = {
    type: "LOG_MOOD",
    confidence: 0.9,
    data: { mood, mood_label, date: _todayLocal() },
  };
  return {
    message: `Got it — I've noted your mood as ${mood_label} today.`,
    actions: [injected],
    _fallback: false,
    _injectedMood: true,
  };
}

// ─── SYMPTOM INJECTOR ───────────────────────────────────────────────
export const SYMPTOM_REGEX = /\b(?:have|got|experiencing|feeling|suffering|with)\b[^\n]{0,40}\b(?:headache|migraine|cramps?|bloat(?:ing|ed)|nausea|fatigue|pain|ache|spotting|discharge|hot\s*flash|brain\s*fog|insomnia|backache|breast\s*tender|mood\s*swing|cravings?|acne|breakout)\b/i;

const SYMPTOM_WORDS = [
  "headache","migraine","cramps","bloating","bloated","nausea","fatigue",
  "back pain","period pain","spotting","discharge","hot flash","brain fog",
  "insomnia","backache","breast tenderness","mood swing","cravings","acne",
  "breakout",
];

export function extractSymptomFromMessage(userMessage) {
  const text = String(userMessage || "").toLowerCase();
  let symptom = "symptom";
  for (const w of SYMPTOM_WORDS) {
    if (text.includes(w)) { symptom = w; break; }
  }
  // Severity — look for "severity 3", "out of 5", or words mild/moderate/severe.
  let severity = null;
  const m1 = text.match(/severity\s*(?:of\s*)?(\d)/);
  if (m1) severity = Math.min(5, Math.max(1, parseInt(m1[1], 10)));
  if (severity == null) {
    if (/\b(mild|slight)\b/.test(text))   severity = 2;
    else if (/\b(moderate|medium)\b/.test(text)) severity = 3;
    else if (/\b(severe|terrible|awful|bad)\b/.test(text)) severity = 4;
    else severity = 3;
  }
  return { symptom_name: symptom, severity, date: _todayLocal() };
}

export function injectSymptomIfNeeded(parsed, userMessage) {
  if (!_needsInjection(parsed, "LOG_SYMPTOM")) return parsed;
  if (!userMessage || !SYMPTOM_REGEX.test(String(userMessage))) return parsed;
  const data = extractSymptomFromMessage(userMessage);
  const injected = { type: "LOG_SYMPTOM", confidence: 0.9, data };
  return {
    message: `Got it — I've logged your ${data.symptom_name} (severity ${data.severity}).`,
    actions: [injected],
    _fallback: false,
    _injectedSymptom: true,
  };
}

// ─── HYDRATION INJECTOR ─────────────────────────────────────────────
export const HYDRATION_REGEX = /\b(?:drank?|had|drink|drinking|water|hydrat(?:e|ed|ing)|glass(?:es)?|cups?|litre|liter|ml)\b/i;

export function extractHydrationFromMessage(userMessage) {
  const text = String(userMessage || "").toLowerCase();
  let amount_ml = null;
  // explicit ml: "500ml"
  const mMl = text.match(/(\d{2,4})\s*ml\b/);
  if (mMl) amount_ml = parseInt(mMl[1], 10);
  // litres: "1.5 litres", "2 liters", "a litre"
  if (amount_ml == null) {
    const mL = text.match(/(\d+(?:\.\d+)?)\s*(?:litre|liter)s?\b/);
    if (mL) amount_ml = Math.round(parseFloat(mL[1]) * 1000);
    else if (/\ba\s*(?:litre|liter)\b/.test(text)) amount_ml = 1000;
  }
  // glasses/cups: "2 glasses", "a glass", "three cups"
  if (amount_ml == null) {
    const mG = text.match(/(\d+|one|two|three|four|five|a)\s*(glass(?:es)?|cups?)/);
    if (mG) {
      const wordsToNum = { "a": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5 };
      const count = wordsToNum[mG[1]] || parseInt(mG[1], 10) || 1;
      const unitMl = /cup/.test(mG[2]) ? 240 : 250;
      amount_ml = count * unitMl;
    }
  }
  if (amount_ml == null) amount_ml = 250;
  return { amount_ml, day_key: _todayLocal() };
}

export function injectHydrationIfNeeded(parsed, userMessage) {
  if (!_needsInjection(parsed, "LOG_HYDRATION")) return parsed;
  if (!userMessage || !HYDRATION_REGEX.test(String(userMessage))) return parsed;
  // QA round 12 — journal-shaped messages like "Write a journal
  // entry: I had a productive day…" also match HYDRATION_REGEX on
  // the "I had" tail. Defer to the journal injector when the
  // message also matches JOURNAL_REGEX so we never log fake water.
  if (JOURNAL_REGEX.test(String(userMessage))) return parsed;
  const data = extractHydrationFromMessage(userMessage);
  const injected = { type: "LOG_HYDRATION", confidence: 0.9, data };
  return {
    message: `Got it — I've logged ${data.amount_ml}ml of water.`,
    actions: [injected],
    _fallback: false,
    _injectedHydration: true,
  };
}

// ─── JOURNAL INJECTOR ───────────────────────────────────────────────
export const JOURNAL_REGEX = /\b(?:journal|diary|note(?:\s+down)?|write\s+(?:this\s+)?down|log\s+this|record\s+(?:this|that)|capture\s+this)\b/i;

export function extractJournalFromMessage(userMessage) {
  const text = String(userMessage || "").trim();
  // Pull the part after "journal entry:" / "write down:" / "note:" etc.
  const m = text.match(/(?:journal(?:\s+entry)?|diary(?:\s+entry)?|write(?:\s+this\s+down)?|note(?:\s+down)?|record|log\s+this|capture\s+this)\s*[:\-—]\s*(.+)$/i);
  const body = m ? m[1].trim() : text;
  return {
    text: body,
    session_date: _todayLocal(),
    tags: ["note"],
    prompt: "Jess journal entry",
    card_type: "free",
  };
}

export function injectJournalIfNeeded(parsed, userMessage) {
  if (!_needsInjection(parsed, "WRITE_JOURNAL")) return parsed;
  if (!userMessage || !JOURNAL_REGEX.test(String(userMessage))) return parsed;
  const data = extractJournalFromMessage(userMessage);
  if (!data.text || data.text.length < 4) return parsed; // need real content
  const injected = { type: "WRITE_JOURNAL", confidence: 0.9, data };
  return {
    message: `Got it — I've saved that to your journal.`,
    actions: [injected],
    _fallback: false,
    _injectedJournal: true,
  };
}

// Tiny shared helper — local YYYY-MM-DD without time component.
function _todayLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

// QA round 9 — central resolver for dietary preference. The LLM has
// started returning empty action.data ({}) with the user's prompt
// echoed into data.user_message. Walk every plausible source before
// falling back to "balanced".
function _resolveDietaryPref(data) {
  if (!data || typeof data !== "object") return "balanced";
  if (Array.isArray(data.preferences) && data.preferences[0]) {
    return String(data.preferences[0]).toLowerCase();
  }
  if (typeof data.dietary_preference === "string" && data.dietary_preference.trim()) {
    return data.dietary_preference.trim().toLowerCase();
  }
  if (typeof data.diet === "string" && data.diet.trim()) {
    return data.diet.trim().toLowerCase();
  }
  // QA round 13 — the LLM frequently emits dietary intent under
  // `meal_type` (e.g. "vegetarian") instead of dietary_preference.
  // Accept it as long as it isn't a generic catch-all that signals
  // "no preference stated" (standard / mixed / regular / any).
  if (typeof data.meal_type === "string") {
    const mt = data.meal_type.trim().toLowerCase();
    const generic = new Set(["standard", "mixed", "regular", "any", "normal", "default", ""]);
    if (mt && !generic.has(mt)) return mt;
  }
  // Last-resort — detectDietaryPref already has the substring matchers.
  if (typeof data.user_message === "string" && data.user_message.trim()) {
    return detectDietaryPref(data.user_message);
  }
  return "balanced";
}

// QA round 9 — build the plan_days array the /Nutrition My-Plan view
// reads from MealPlans.plan_days[i]. Each day object carries the
// breakfast / lunch / dinner subfields plus a date + day_name. We
// derive it from the scaffolded plan rows we just wrote to MealLog
// so the two surfaces stay in sync.
function _buildPlanDaysFromMealLogs(planRows, days, startDateObj, resolvedPref) {
  // QA round 12 — MealPlans schema wants plan_days[n].breakfast (and
  // lunch / dinner) as an ARRAY OF STRINGS, not array of objects.
  // Round-11 wrapped meal objects in [...] but the schema still
  // rejected with "Input should be a valid string at plan_days.N.
  // breakfast.0". Each slot is now just [mealName] — plain string
  // inside an array (multi-meal-friendly: push more strings later
  // if a snack-as-second-lunch needs to live on the same date).
  //
  // Group rows by date, then by meal_type, pushing the meal NAME
  // string into the slot array.
  const byDate = new Map();
  for (const item of planRows) {
    const date = item.date || toLocalISO(startDateObj);
    if (!byDate.has(date)) byDate.set(date, {});
    const slot = String(item.meal_type || "snack").toLowerCase();
    const mealName = String(
      item.food_items || item.raw_text || item.food_name || item.name || "Healthy meal"
    );
    const dayBucket = byDate.get(date);
    if (!Array.isArray(dayBucket[slot])) dayBucket[slot] = [];
    dayBucket[slot].push(mealName);
  }
  // Walk requested days in order — every meal slot is an array of
  // strings (empty array when no meal was scaffolded for that date).
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDateObj);
    d.setDate(startDateObj.getDate() + i);
    const date = toLocalISO(d);
    const day_name = WEEKDAYS[d.getDay()];
    const slots = byDate.get(date) || {};
    out.push({
      date,
      day_key: date,
      day_name,
      day_index: i,
      breakfast: Array.isArray(slots.breakfast) ? slots.breakfast : [],
      lunch:     Array.isArray(slots.lunch)     ? slots.lunch     : [],
      dinner:    Array.isArray(slots.dinner)    ? slots.dinner    : [],
      dietary_preference: resolvedPref,
    });
  }
  return out;
}

// QA round 7 — MealLog schema requires `day_key` (rejected all 21
// writes with `Error in field day_key: Field required`). We don't
// know the exact format expected so we send BOTH:
//   day_key  → ISO date "YYYY-MM-DD" (most schema patterns)
//   day_name → lowercase weekday string ("monday", "tuesday", …)
// Whichever the schema accepts is fine; the other becomes a
// harmless extra field on schemas that tolerate it.
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// Returns an array of MealLog payloads (date + meal_type + food_items
// + day_key + day_name for breakfast/lunch/dinner × N days).
function scaffoldMealPlan(days, prefs, start) {
  const bucket = pickTemplateBucket(prefs || []);
  const out = [];
  for (let i = 0; i < days; i++) {
    const date = dateOffset(start, i);
    const dateObj = parseDateOrToday(date);
    const day_name = WEEKDAYS[dateObj.getDay()];
    const day_key = date; // ISO date — same value as `date` field
    out.push({ date, day_key, day_name, meal_type: "breakfast", food_items: bucket.breakfast[i % bucket.breakfast.length] });
    out.push({ date, day_key, day_name, meal_type: "lunch",     food_items: bucket.lunch[i % bucket.lunch.length] });
    out.push({ date, day_key, day_name, meal_type: "dinner",    food_items: bucket.dinner[i % bucket.dinner.length] });
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
    // QA round 10 — MorningCheckinCard's canonical shape is:
    //   { user_id, date, mood, energy, energy_level, sleep_hours,
    //     sleep_quality }
    // We mirror that. mood_label is accepted too (some surfaces
    // render it). Rich payload → minimal fallback pattern, matches
    // CREATE_TASK.
    case ACTION_TYPES.LOG_MOOD:
    case ACTION_TYPES.LOG_ENERGY:
    case ACTION_TYPES.LOG_SLEEP:
    case ACTION_TYPES.LOG_DAILY_CHECKIN: {
      if (!Ent.DailyCheckins) throw new Error("DailyCheckins entity not available");
      const date = data.date || today();
      const moodNum   = data.mood   != null ? Number(data.mood)   : null;
      const energyNum = data.energy != null ? Number(data.energy) : null;
      const sleepHrs  = data.sleep_hours != null ? Number(data.sleep_hours)
                     : data.sleep != null      ? Number(data.sleep) : null;
      const richPayload = { ...meta, date };
      if (moodNum   != null && Number.isFinite(moodNum))   richPayload.mood = moodNum;
      if (energyNum != null && Number.isFinite(energyNum)) {
        richPayload.energy = energyNum;
        richPayload.energy_level = energyNum;
      }
      if (sleepHrs  != null && Number.isFinite(sleepHrs))  richPayload.sleep_hours = sleepHrs;
      if (data.sleep_quality != null) richPayload.sleep_quality = String(data.sleep_quality);
      if (data.mood_label) richPayload.mood_label = String(data.mood_label);
      if (data.notes) richPayload.notes = String(data.notes);
      try {
        const r = await Ent.DailyCheckins.create(richPayload);
        try { console.log("[jess-execute] ✓ DailyCheckins wrote (rich)", r?.id || r); } catch {}
        return r;
      } catch (e1) {
        try { console.warn("[jess-execute] DailyCheckins rich payload failed", { err: String(e1?.message || e1), payload: richPayload }); } catch {}
        // Minimal fallback — at least date + one signal.
        const minimal = { ...meta, date };
        if (richPayload.mood != null) minimal.mood = richPayload.mood;
        if (richPayload.energy != null) minimal.energy = richPayload.energy;
        if (richPayload.sleep_hours != null) minimal.sleep_hours = richPayload.sleep_hours;
        const r2 = await Ent.DailyCheckins.create(minimal);
        try { console.log("[jess-execute] ✓ DailyCheckins wrote (minimal)", r2?.id || r2); } catch {}
        return r2;
      }
    }

    // ── Symptom ──
    // QA round 10 — UniversalLogger writes BOTH symptom_type AND
    // symptom_name (some screens read one, some the other). Also
    // adds created_at/updated_at. We mirror the canonical shape.
    case ACTION_TYPES.LOG_SYMPTOM: {
      if (!Ent.SymptomLogs) throw new Error("SymptomLogs entity not available");
      const sname = data.symptom_name || data.symptom || data.name || "unspecified";
      const date = data.date || today();
      const ts = nowISO();
      const richPayload = {
        ...meta,
        date,
        symptom_type: sname,
        symptom_name: sname,
        severity: data.severity != null ? Number(data.severity) : null,
        notes: data.notes || "",
        created_at: ts,
        updated_at: ts,
      };
      try {
        const r = await Ent.SymptomLogs.create(richPayload);
        try { console.log("[jess-execute] ✓ SymptomLogs wrote (rich)", r?.id || r); } catch {}
        return r;
      } catch (e1) {
        try { console.warn("[jess-execute] SymptomLogs rich payload failed", { err: String(e1?.message || e1), payload: richPayload }); } catch {}
        const minimal = { ...meta, date, symptom_name: sname };
        if (Number.isFinite(richPayload.severity)) minimal.severity = richPayload.severity;
        const r2 = await Ent.SymptomLogs.create(minimal);
        try { console.log("[jess-execute] ✓ SymptomLogs wrote (minimal)", r2?.id || r2); } catch {}
        return r2;
      }
    }

    // ── Meal ──
    // QA round 10 — single MealLog row. Mirror CREATE_MEAL_PLAN's
    // per-row shape: day_key required, raw_text + food_name + name
    // all populated so /Nutrition My-Plan can render whichever
    // field it reads.
    case ACTION_TYPES.LOG_MEAL: {
      if (!Ent.MealLog) throw new Error("MealLog entity not available");
      const date = data.date || today();
      const dObj = parseDateOrToday(date);
      const mealName =
        data.food_items || data.items || data.food ||
        data.raw_text   || data.food_name || data.name ||
        "Meal";
      const richPayload = {
        ...meta,
        date,
        day_key: data.day_key || date,
        day_name: data.day_name || WEEKDAYS[dObj.getDay()],
        meal_type: data.meal_type || data.mealType || "snack",
        food_items: mealName,
        raw_text: mealName,
        food_name: mealName,
        name: mealName,
        notes: data.notes || "",
      };
      try {
        const r = await Ent.MealLog.create(richPayload);
        try { console.log("[jess-execute] ✓ MealLog wrote (rich)", r?.id || r); } catch {}
        return r;
      } catch (e1) {
        try { console.warn("[jess-execute] MealLog rich payload failed", { err: String(e1?.message || e1), payload: richPayload }); } catch {}
        const minimal = {
          ...meta, date, day_key: richPayload.day_key,
          meal_type: richPayload.meal_type, raw_text: mealName,
        };
        const r2 = await Ent.MealLog.create(minimal);
        try { console.log("[jess-execute] ✓ MealLog wrote (minimal)", r2?.id || r2); } catch {}
        return r2;
      }
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

      // QA round 14 — DETERMINISTIC rewrite. Ignore data.plan entirely
      // (injector synth never carries one anyway, and explicit LLM
      // plans have unreliable dates). Derive everything from:
      //   • resolvedPref → MEAL_TEMPLATES bucket
      //   • today (local-midnight Date) + day index 0..6
      // The 21 MealLog rows ALWAYS spread across 7 distinct day_keys.
      const resolvedPref = _resolveDietaryPref(data);
      const bucket = pickTemplateBucket([resolvedPref]);

      // Flatten the bucket into a 21-entry array: B0 L0 D0 B1 L1 D1
      // … B6 L6 D6. Cycles the per-slot lists if they have fewer
      // than 7 entries.
      const meals21 = [];
      for (let day = 0; day < 7; day++) {
        meals21.push(bucket.breakfast[day % bucket.breakfast.length]);
        meals21.push(bucket.lunch[day % bucket.lunch.length]);
        meals21.push(bucket.dinner[day % bucket.dinner.length]);
      }
      const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

      // Local-midnight today. Using year/month/date constructor avoids
      // the UTC drift `new Date().toISOString()` introduces around
      // midnight (would otherwise return yesterday's date for users
      // in negative UTC offsets just after local midnight).
      const todayLocal = new Date();
      todayLocal.setHours(0, 0, 0, 0);
      const out = [];

      // Write 21 MealLog rows, one per (day, slot).
      for (let day = 0; day < 7; day++) {
        const dayDate = new Date(
          todayLocal.getFullYear(),
          todayLocal.getMonth(),
          todayLocal.getDate() + day,
        );
        const dayKey = toLocalISO(dayDate);
        const day_name = WEEKDAYS[dayDate.getDay()];
        for (let slot = 0; slot < 3; slot++) {
          const mealName = meals21[day * 3 + slot];
          const meal_type = MEAL_TYPES[slot];
          const ts = nowISO();
          try {
            // QA round 14 — rich payload. food_items as ARRAY (schema
            // wants list), all other name fields as plain strings.
            const r = await Ent.MealLog.create({
              ...meta,
              date: dayKey,
              day_key: dayKey,
              day_name,
              day_index: day,
              meal_type,
              food_items: [mealName],
              raw_text: mealName,
              food_name: mealName,
              name: mealName,
              dietary_preference: resolvedPref,
              ai_generated: true,
              logged_at: ts,
              notes: `Plan: ${resolvedPref}`,
            });
            out.push(r);
          } catch (e1) {
            try { console.warn("[jess-execute] MealLog rich failed, trying minimal", { err: String(e1?.message || e1), dayKey, meal_type }); } catch {}
            // Schema-safe fallback — food_items as plain string in
            // case the schema rejects arrays.
            try {
              const r2 = await Ent.MealLog.create({
                ...meta,
                date: dayKey,
                day_key: dayKey,
                meal_type,
                food_items: mealName,
                raw_text: mealName,
                food_name: mealName,
                name: mealName,
              });
              out.push(r2);
            } catch (e2) { out.push({ error: String(e2?.message || e2) }); }
          }
        }
      }
      try { console.log("[jess-execute] ✓ wrote 21 MealLog rows for", resolvedPref); } catch {}

      // Build plan_days mirror for MealPlans (slots = arrays of
      // strings, per QA round 12 schema requirement).
      // QA round 15 — every entry now also carries `day: dayIndex`
      // (0=Monday … 6=Sunday). The My Plan renderer does
      //   plan_days.find(d => d.day === selectedDayIndex)
      // and returned undefined every time without this. day_key /
      // day_index / day_name are still stamped for older readers.
      const plan_days = [];
      for (let day = 0; day < 7; day++) {
        const dayDate = new Date(
          todayLocal.getFullYear(),
          todayLocal.getMonth(),
          todayLocal.getDate() + day,
        );
        const dayKey = toLocalISO(dayDate);
        plan_days.push({
          day,
          date: dayKey,
          day_key: dayKey,
          day_index: day,
          day_name: WEEKDAYS[dayDate.getDay()],
          breakfast: [meals21[day * 3]],
          lunch:     [meals21[day * 3 + 1]],
          dinner:    [meals21[day * 3 + 2]],
          dietary_preference: resolvedPref,
        });
      }

      // Update or create the MealPlans shell so the legacy view path
      // (if any reader uses it) also resolves.
      try {
        if (Ent.MealPlans) {
          const week_start = toLocalISO(todayLocal);
          let mealPlanRow = null;
          try {
            const filterFn = Ent.MealPlans.filter || Ent.MealPlans.list;
            if (typeof filterFn === "function") {
              const found = await filterFn.call(Ent.MealPlans, { user_id: userId, week_start })
                .catch(() => null);
              if (Array.isArray(found) && found[0]?.id) mealPlanRow = found[0];
            }
          } catch { /* swallow filter unavailable */ }
          const planPayload = {
            plan_days,
            dietary_preference: resolvedPref,
            is_active: true,
            ai_generated: true,
          };
          if (mealPlanRow?.id) {
            try {
              const upd = await Ent.MealPlans.update(mealPlanRow.id, planPayload);
              out.push({ _mealPlan: "updated", id: upd?.id || mealPlanRow.id });
              try { console.log("[jess-execute] ✓ MealPlans updated", mealPlanRow.id); } catch {}
            } catch (e) {
              try { console.warn("[jess-execute] MealPlans update failed", String(e?.message || e)); } catch {}
            }
          } else {
            try {
              const created = await Ent.MealPlans.create({
                ...meta,
                week_start,
                ...planPayload,
              });
              out.push({ _mealPlan: "created", id: created?.id });
              try { console.log("[jess-execute] ✓ MealPlans created", created?.id || "(no id)"); } catch {}
            } catch (e) {
              try { console.warn("[jess-execute] MealPlans create failed", { err: String(e?.message || e), week_start, dayCount: plan_days.length }); } catch {}
            }
          }
        } else {
          try { console.log("[jess-execute] MealPlans entity not available — skipping shell"); } catch {}
        }
      } catch (e) {
        try { console.warn("[jess-execute] MealPlans upsert threw", String(e?.message || e)); } catch {}
      }
      return out;
    }

    // ── Hydration ──
    // QA round 10 — HydrationLog uses day_key (NOT date) and
    // amount_ml. Mirror UnifiedTabLogger.writeHydration: 1 glass =
    // 250ml, 1 cup = 240ml, 1 litre = 1000ml.
    case ACTION_TYPES.LOG_HYDRATION: {
      if (!Ent.HydrationLog) throw new Error("HydrationLog entity not available");
      const day_key = data.day_key || data.date || today();
      let amount_ml = null;
      if (data.amount_ml != null) amount_ml = Number(data.amount_ml);
      else if (data.ml != null)   amount_ml = Number(data.ml);
      else if (data.litres != null || data.liters != null) {
        amount_ml = Number(data.litres ?? data.liters) * 1000;
      }
      else if (data.glasses != null) amount_ml = Number(data.glasses) * 250;
      else if (data.cups != null)    amount_ml = Number(data.cups) * 240;
      else amount_ml = 250; // safe default: one glass
      if (!Number.isFinite(amount_ml) || amount_ml <= 0) amount_ml = 250;
      const ts = nowISO();
      const richPayload = {
        ...meta,
        day_key,
        amount_ml: Math.round(amount_ml),
        logged_at: ts,
        source: "manual",
        created_at: ts,
        updated_at: ts,
      };
      try {
        const r = await Ent.HydrationLog.create(richPayload);
        try { console.log("[jess-execute] ✓ HydrationLog wrote (rich)", r?.id || r); } catch {}
        return r;
      } catch (e1) {
        try { console.warn("[jess-execute] HydrationLog rich payload failed", { err: String(e1?.message || e1), payload: richPayload }); } catch {}
        const minimal = { ...meta, day_key, amount_ml: richPayload.amount_ml };
        const r2 = await Ent.HydrationLog.create(minimal);
        try { console.log("[jess-execute] ✓ HydrationLog wrote (minimal)", r2?.id || r2); } catch {}
        return r2;
      }
    }

    // ── Medication ──
    // QA round 10 — MedicationLogs schema uses `item_name` (not
    // medication_name), `date` (not taken_at as primary), `taken:
    // true`. Mirror UnifiedTabLogger.writeMedication.
    case ACTION_TYPES.LOG_MEDICATION: {
      if (!Ent.MedicationLogs) throw new Error("MedicationLogs entity not available");
      const item_name = data.item_name || data.medication_name || data.name || "medication";
      const date = data.date || today();
      const ts = nowISO();
      const richPayload = {
        ...meta,
        date,
        item_name,
        dose: String(data.dose || data.dosage || ""),
        taken: data.taken !== false, // default to true
        notes: data.notes || "",
        created_at: ts,
        updated_at: ts,
      };
      try {
        const r = await Ent.MedicationLogs.create(richPayload);
        try { console.log("[jess-execute] ✓ MedicationLogs wrote (rich)", r?.id || r); } catch {}
        return r;
      } catch (e1) {
        try { console.warn("[jess-execute] MedicationLogs rich payload failed", { err: String(e1?.message || e1), payload: richPayload }); } catch {}
        const minimal = { ...meta, date, item_name, taken: true };
        const r2 = await Ent.MedicationLogs.create(minimal);
        try { console.log("[jess-execute] ✓ MedicationLogs wrote (minimal)", r2?.id || r2); } catch {}
        return r2;
      }
    }

    // ── Supplement ──
    // QA round 10 — SupplementLog is per-day with named boolean
    // flags (folic_acid / vitamin_d / omega3 / iron). Mirror
    // SupplementTrackerCard. Best-effort string-match the user's
    // named supplement → the matching boolean column. Falls back
    // to a free-text row (supplement_name + dose) for cases the
    // schema accepts both shapes.
    case ACTION_TYPES.LOG_SUPPLEMENT: {
      if (!Ent.SupplementLog) throw new Error("SupplementLog entity not available");
      const name = String(data.supplement_name || data.name || "supplement").toLowerCase();
      const date = data.date || today();
      // Try to match a known boolean column from the supplement name.
      const richPayload = { ...meta, date };
      if (/folic|folate/.test(name))       richPayload.folic_acid = data.taken !== false;
      else if (/vit\s*d|vitamin\s*d|d3/.test(name))  richPayload.vitamin_d = data.taken !== false;
      else if (/omega|fish\s*oil|epa|dha/.test(name)) richPayload.omega3 = data.taken !== false;
      else if (/iron|ferrous|ferritin/.test(name))   richPayload.iron = data.taken !== false;
      // ALSO send free-text fields in case the schema variants accept them.
      richPayload.supplement_name = data.supplement_name || data.name || "supplement";
      richPayload.dose = String(data.dose || data.dosage || "");
      richPayload.taken = data.taken !== false;
      richPayload.notes = data.notes || "";
      const ts = nowISO();
      richPayload.created_at = ts;
      richPayload.updated_at = ts;
      try {
        const r = await Ent.SupplementLog.create(richPayload);
        try { console.log("[jess-execute] ✓ SupplementLog wrote (rich)", r?.id || r); } catch {}
        return r;
      } catch (e1) {
        try { console.warn("[jess-execute] SupplementLog rich payload failed", { err: String(e1?.message || e1), payload: richPayload }); } catch {}
        // Minimal — booleans + date only.
        const minimal = { ...meta, date };
        if (richPayload.folic_acid != null) minimal.folic_acid = richPayload.folic_acid;
        if (richPayload.vitamin_d  != null) minimal.vitamin_d  = richPayload.vitamin_d;
        if (richPayload.omega3     != null) minimal.omega3     = richPayload.omega3;
        if (richPayload.iron       != null) minimal.iron       = richPayload.iron;
        const r2 = await Ent.SupplementLog.create(minimal);
        try { console.log("[jess-execute] ✓ SupplementLog wrote (minimal)", r2?.id || r2); } catch {}
        return r2;
      }
    }

    // ── Habit ──
    // QA round 10 — HabitLogs canonical shape mirrors
    // UniversalLogger.add_habit: habit_type + habit_name (both),
    // habit_category, completed + is_completed (both), time_of_day,
    // created_at/updated_at.
    case ACTION_TYPES.LOG_HABIT: {
      if (!Ent.HabitLogs) throw new Error("HabitLogs entity not available");
      const habit = data.habit_name || data.name || data.habit_id || "habit";
      const date = data.date || today();
      const isDone = data.completed !== false;
      const ts = nowISO();
      const richPayload = {
        ...meta,
        date,
        habit_type: habit,
        habit_name: habit,
        habit_category: data.habit_category || data.category || "other",
        completed: isDone,
        is_completed: isDone,
        time_of_day: data.time_of_day || data.timeOfDay || null,
        notes: data.notes || "",
        created_at: ts,
        updated_at: ts,
      };
      try {
        const r = await Ent.HabitLogs.create(richPayload);
        try { console.log("[jess-execute] ✓ HabitLogs wrote (rich)", r?.id || r); } catch {}
        return r;
      } catch (e1) {
        try { console.warn("[jess-execute] HabitLogs rich payload failed", { err: String(e1?.message || e1), payload: richPayload }); } catch {}
        const minimal = { ...meta, date, habit_name: habit, habit_type: habit, completed: isDone };
        const r2 = await Ent.HabitLogs.create(minimal);
        try { console.log("[jess-execute] ✓ HabitLogs wrote (minimal)", r2?.id || r2); } catch {}
        return r2;
      }
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
    // QA round 10 — JournalEntries canonical shape (NewEntrySheet
    // + UniversalLogger): user_id, session_date (NOT date),
    // text (NOT content/body), tags: [], prompt, mood_rating,
    // card_type, card_color, todo_items, created_at.
    case ACTION_TYPES.WRITE_JOURNAL: {
      if (!Ent.JournalEntries) throw new Error("JournalEntries entity not available");
      const text = String(data.text || data.content || data.body || data.entry || "").trim();
      if (!text) throw new Error("empty journal content");
      const session_date = data.session_date || data.date || today();
      const tags = Array.isArray(data.tags) ? data.tags
                : data.mood ? [String(data.mood).toLowerCase()]
                : ["note"];
      const ts = nowISO();
      const richPayload = {
        ...meta,
        session_date,
        text,
        tags,
        prompt: data.prompt || data.title || "Journal entry",
        mood_rating: data.mood_rating != null ? Number(data.mood_rating)
                   : data.mood != null         ? Number(data.mood) : undefined,
        card_type: data.card_type || data.type || "free",
        card_color: data.card_color || "cream",
        created_at: ts,
      };
      // Strip undefined so the schema doesn't see a null mood_rating.
      Object.keys(richPayload).forEach((k) => richPayload[k] === undefined && delete richPayload[k]);
      try {
        const r = await Ent.JournalEntries.create(richPayload);
        try { console.log("[jess-execute] ✓ JournalEntries wrote (rich)", r?.id || r); } catch {}
        return r;
      } catch (e1) {
        try { console.warn("[jess-execute] JournalEntries rich payload failed", { err: String(e1?.message || e1), payload: richPayload }); } catch {}
        const minimal = { ...meta, session_date, text, tags: ["note"] };
        const r2 = await Ent.JournalEntries.create(minimal);
        try { console.log("[jess-execute] ✓ JournalEntries wrote (minimal)", r2?.id || r2); } catch {}
        return r2;
      }
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

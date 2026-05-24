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

  // Strip ```json fences if present.
  const fenced = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/g, "")
    .trim();

  // Pass 1 — full JSON parse on the de-fenced string.
  const direct = _tryEnvelope(fenced);
  if (direct) return { ...direct, _fallback: false };

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
  // Drop a trailing standalone JSON-array fragment whose first element
  // is a quoted string (suggestion-chip leakage; splitChipsFromText
  // handles fully-balanced arrays, this catches mid-stream truncations
  // like `["A","B","C...`).
  out = out.replace(/[\s,]*\[\s*"[^"\]]*(?:"[^"]*)?(?:\s*,\s*"[^"\]]*(?:"[^"]*)?)*[\s\S]*$/, (match) => {
    // Only strip if the bracket is unbalanced (i.e. no matching `]` after
    // it). If it IS balanced, splitChipsFromText will lift it later.
    const opens = (match.match(/\[/g) || []).length;
    const closes = (match.match(/\]/g) || []).length;
    return opens > closes ? "" : match;
  }).trim();
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
      const payload = {
        ...meta,
        title: data.title || data.text || "Untitled task",
        due_date: data.due_date || data.date || today(),
        time_of_day: data.time_of_day || data.timeOfDay || "",
        notes: data.notes || "",
        completed: false,
      };
      return await Ent.PersonalTasks.create(payload);
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
  if (!Array.isArray(actions) || actions.length === 0) return [];
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
      continue;
    }
    if (!userId) {
      results.push({ action, success: false, error: "no userId" });
      continue;
    }
    try {
      const result = await executeAction(action, userId);
      results.push({ action, result, success: true });
    } catch (e) {
      results.push({ action, error: String(e?.message || e), success: false });
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

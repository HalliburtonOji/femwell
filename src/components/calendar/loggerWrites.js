// loggerWrites — REAL base44 entity writes for the calendar-driven logger, targeting an
// explicit date (the day the user tapped). Field shapes mirror the PROVEN writers in
// UnifiedTabLogger.jsx exactly, so a calendar log is identical to a "+"-FAB log — just
// dated to the chosen day instead of always today. UnifiedTabLogger itself is untouched.
//
// A write must return a row receipt. The caller keeps the draft if acknowledgement is
// missing; swallowing a rejection would turn an unsaved health entry into a false success.
import { base44 } from "@/api/base44Client";
import { pickProfile } from "@/utils/userProfile";

const nowISO = () => new Date().toISOString();
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

async function receipt(row, label, entityName, owner, dateField, date) {
  if (!row?.id) throw new Error(`${label} was not confirmed`);
  // Base44 normally returns the full row. If this SDK response is sparse, read
  // the exact ID once; never infer ownership/date from the request we sent.
  const full = row.user_id == null || (dateField && row[dateField] == null)
    ? await base44.entities[entityName].get(row.id)
    : row;
  if (full?.id !== row.id || full?.user_id !== owner || (dateField && String(full?.[dateField]).slice(0, 10) !== date)) {
    throw new Error(`${label} could not be read back for this account and day`);
  }
  return full;
}

// ── per-type writers (date = YYYY-MM-DD chosen day) ─────────────────────────────
export async function writeMealLog(user_id, date, { raw_text, meal_type = "snack", portion_size = "medium", notes = "", time }, sameOwner = () => true) {
  const logged_at = time ? new Date(`${date}T${time}:00`).toISOString() : (date === todayISO() ? nowISO() : `${date}T12:00:00.000Z`);
  const log = await receipt(await base44.entities.MealLog.create({
    user_id, day_key: date, logged_at,
    meal_type: String(meal_type).toLowerCase(), method: "text",
    raw_text: raw_text || "Meal", portion_size, notes,
  }), "Meal", "MealLog", user_id, "day_key", date);
  // fire-and-forget analysis (same pattern as the live meal loggers) — never blocks.
  if (sameOwner()) try { base44.functions.invoke("analyzeMeal", { raw_text: raw_text || "Meal", meal_log_id: log?.id }).catch(() => {}); } catch { /* ignore */ }
  return log;
}

export async function writeHydration(user_id, date, glasses = 1) {
  const logged_at = date === todayISO() ? nowISO() : `${date}T12:00:00.000Z`;
  const rows = [];
  for (let i = 0; i < glasses; i++) {
    rows.push(await receipt(await base44.entities.HydrationLog.create({ user_id, day_key: date, amount_ml: 250, logged_at, source: "manual" }), "Water", "HydrationLog", user_id, "day_key", date));
  }
  return rows;
}

export async function writeMood(user_id, date, { mood, energy, notes }, sameOwner = () => true) {
  // upsert the day's DailyCheckins row (mirrors UnifiedTabLogger.writeCheckin)
  const existing = await base44.entities.DailyCheckins.filter({ user_id, date }, "-updated_at", 1);
  if (!sameOwner()) throw new Error("Account changed during save");
  const row = (existing || [])[0];
  const body = { updated_at: nowISO() };
  if (mood != null) body.mood = Number(mood);
  if (energy != null) body.energy = Number(energy);
  if (notes) body.notes = notes;
  return row?.id
    ? receipt(await base44.entities.DailyCheckins.update(row.id, body), "Mood", "DailyCheckins", user_id, "date", date)
    : receipt(await base44.entities.DailyCheckins.create({ user_id, date, ...body }), "Mood", "DailyCheckins", user_id, "date", date);
}

export async function writeSymptom(user_id, date, { symptoms = [], severity = 3, notes = "" }) {
  const list = Array.isArray(symptoms) ? symptoms : [symptoms];
  const rows = [];
  for (const s of list.filter(Boolean)) {
    rows.push(await receipt(await base44.entities.SymptomLogs.create({
      user_id, date, symptom_type: String(s), severity: Number(severity) || 3,
      notes, created_at: nowISO(), updated_at: nowISO(),
    }), "Symptom", "SymptomLogs", user_id, "date", date));
  }
  return rows;
}

export async function writeNote(user_id, date, { text, mood }) {
  return receipt(await base44.entities.JournalEntries.create({
    user_id, session_date: date, text: text || "",
    tags: mood ? [String(mood).toLowerCase()] : ["note"], prompt: "Calendar note",
  }), "Note", "JournalEntries", user_id, "session_date", date);
}

export async function writeHabit(user_id, date, { name }) {
  const n = name || "Habit";
  return receipt(await base44.entities.HabitLogs.create({
    user_id, date, habit_type: n, habit_name: n, habit_category: "other",
    completed: false, is_completed: false, created_at: nowISO(), updated_at: nowISO(),
  }), "Habit", "HabitLogs", user_id, "date", date);
}

export async function writeMed(user_id, date, { name, dose = "" }) {
  return receipt(await base44.entities.MedicationLogs.create({
    user_id, date, item_name: name || "Medication", dose: String(dose),
    taken: true, created_at: nowISO(), updated_at: nowISO(),
  }), "Medication", "MedicationLogs", user_id, "date", date);
}

export async function writeEvent(user_id, date, { title, time, notes = "" }) {
  return receipt(await base44.entities.PlannerItems.create({
    user_id, date, time: time || "09:00", title: title || "Event",
    category: "personal", repeat: "once", notes, is_completed: false,
    created_at: nowISO(), updated_at: nowISO(),
  }), "Event", "PlannerItems", user_id, "date", date);
}

// A future intention is a plan, never a completed health log or a meal analysis.
export async function writePlan(user_id, date, entry) {
  const names = { meal: "Meal", water: "Water", habit: "Habit", med: "Medication", event: "Event", reminder: "Reminder", task: "Task" };
  const kind = entry.type === "reminder" ? "reminder" : entry.type;
  if (!names[kind]) throw new Error("This item cannot be planned ahead");
  const detail = String(entry.title || entry.raw_text || (kind === "water" ? "one glass" : names[kind])).trim();
  return receipt(await base44.entities.PlannerItems.create({
    user_id, date, time: entry.time || "09:00", title: kind === "event" || kind === "reminder" ? detail : `${names[kind]}: ${detail}`,
    category: kind === "med" || kind === "meal" || kind === "water" ? "health" : kind === "habit" ? "wellbeing" : kind === "reminder" ? "reminder" : "personal",
    source: "calendar", repeat: "once", notes: entry.notes || "", is_completed: false,
    created_at: nowISO(), updated_at: nowISO(),
  }), "Plan", "PlannerItems", user_id, "date", date);
}

// ── PERIOD / CYCLE (drives the calendar gradient + phase app-wide) ──────────────
// Writes a CycleEvents row (the app's period model) AND, for a period START, bumps
// UserProfile.last_period_start_date — the single anchor every phase calc reads. So a
// logged period immediately re-tints the calendar and updates phase everywhere.
export async function writePeriod(user_id, date, { type = "PeriodStart", flow = "medium" }, sameOwner = () => true) {
  const stampISO = nowISO();
  const payload = { user_id, date, type, created_at: stampISO, updated_at: stampISO };
  if (type !== "Spotting" && flow) payload.flow_level = flow;
  const event = await receipt(await base44.entities.CycleEvents.create(payload), "Period", "CycleEvents", user_id, "date", date);
  if (type === "PeriodStart") {
      if (!sameOwner()) throw new Error("Account changed after period event");
      // MUST be pickProfile, not [0]: logging a period start is what SETS the anchor every
      // phase calc reads. Writing it to whichever row happened to be newest is how her data
      // ended up split across rows in the first place — this keeps it on her real profile.
      const profs = await base44.entities.UserProfile.filter({ user_id });
      const p = pickProfile(profs);
      if (!p?.id) throw new Error("Period saved, but cycle anchor could not be found");
      if (!sameOwner()) throw new Error("Account changed before cycle anchor");
      const updated = await receipt(await base44.entities.UserProfile.update(p.id, { last_period_start_date: date }), "Cycle anchor", "UserProfile", user_id);
      if (String(updated.last_period_start_date).slice(0, 10) !== date) throw new Error("Cycle anchor was not confirmed");
  }
  return event;
}

export async function loadProfile(user_id) {
  try { const profs = await base44.entities.UserProfile.filter({ user_id }).catch(() => []); return pickProfile(profs); } catch { return null; }
}

export async function writeTask(user_id, date, { title, time_of_day = null }) {
  return receipt(await base44.entities.PersonalTasks.create({
    user_id, date, title: title || "Task", category: "personal",
    completed: false, time_of_day, notes: "", created_at: nowISO(), updated_at: nowISO(),
  }), "Task", "PersonalTasks", user_id, "date", date);
}

// ── batch commit for the calendar sheets ───────────────────────────────────────
// Accepts the demo sheets' list shape [{ date, type, plan, title?, time?, ...rich }]
// plus optional rich meal payload. Stops on the first unconfirmed attempt: the
// attempted row may have reached the server, so never blindly replay it.
export async function commitEntries(user_id, list, sameOwner = () => true) {
  if (!user_id || !Array.isArray(list) || !list.length) return { saved: 0, attempted: 0, error: "Sign in before saving" };
  let saved = 0;
  for (const e of list) {
    if (!sameOwner()) return { saved, attempted: saved, error: "Account changed during save" };
    if (!e?.date || !e?.type) return { saved, attempted: saved + 1, error: "An entry is missing its date or type" };
    const t = e.type;
    try {
      if (e.plan || e.date > todayISO()) await writePlan(user_id, e.date, e);
      else if (t === "meal") await writeMealLog(user_id, e.date, { raw_text: e.raw_text || e.title, meal_type: e.meal_type, portion_size: e.portion_size, notes: e.notes, time: e.time }, sameOwner);
      else if (t === "water") await writeHydration(user_id, e.date, 1);
      else if (t === "mood") await writeMood(user_id, e.date, { mood: e.mood ?? 3 }, sameOwner);
      else if (t === "symptom") await writeSymptom(user_id, e.date, { symptoms: e.symptoms || [e.title || "Symptom"], severity: e.severity, notes: e.notes });
      else if (t === "note") await writeNote(user_id, e.date, { text: e.text || e.title || "" });
      else if (t === "habit") await writeHabit(user_id, e.date, { name: e.title });
      else if (t === "med") await writeMed(user_id, e.date, { name: e.title });
      else if (t === "event" || t === "reminder") await writeEvent(user_id, e.date, { title: e.title, time: e.time, notes: e.notes });
      else if (t === "task") await writeTask(user_id, e.date, { title: e.title });
      else throw new Error("Unsupported entry type");
      saved += 1;
      if (!sameOwner()) return { saved, attempted: saved, error: "Account changed during save" };
    } catch (error) { return { saved, attempted: saved + 1, error: error?.message || "Save could not be confirmed" }; }
  }
  return { saved, attempted: saved };
}

// ── month loader for the calendar dots ──────────────────────────────────────────
// Returns { "YYYY-MM-DD": [{ type, plan }] } across the recent window. Guarded; any
// entity that errors just contributes nothing (calm empty → no dots, never a crash).
export async function loadMonthEntries(user_id) {
  if (!user_id) return {};
  const map = {};
  const add = (date, type, plan = false) => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date).slice(0, 10))) return;
    const k = String(date).slice(0, 10);
    (map[k] ||= []).push({ type, plan });
  };
  const todayS = todayISO();
  const [meals, hydra, moods, symptoms, habits, meds, planner, cycles, notes, tasks] = await Promise.all([
    base44.entities.MealLog.filter({ user_id }, "-day_key", 300).catch(() => []),
    base44.entities.HydrationLog.filter({ user_id }, "-day_key", 300).catch(() => []),
    base44.entities.DailyCheckins.filter({ user_id }, "-date", 300).catch(() => []),
    base44.entities.SymptomLogs.filter({ user_id }, "-date", 300).catch(() => []),
    base44.entities.HabitLogs.filter({ user_id }, "-date", 300).catch(() => []),
    base44.entities.MedicationLogs.filter({ user_id }, "-date", 300).catch(() => []),
    base44.entities.PlannerItems.filter({ user_id }, "-date", 300).catch(() => []),
    base44.entities.CycleEvents.filter({ user_id }, "-date", 300).catch(() => []),
    base44.entities.JournalEntries.filter({ user_id }, "-session_date", 300).catch(() => []),
    base44.entities.PersonalTasks.filter({ user_id }, "-date", 300).catch(() => []),
  ]);
  (meals || []).forEach((m) => add(m.day_key, "meal"));
  (hydra || []).forEach((h) => add(h.day_key, "water"));
  (moods || []).forEach((c) => { if (c.mood != null) add(c.date, "mood"); });
  (symptoms || []).forEach((s) => add(s.date, "symptom"));
  (habits || []).forEach((h) => add(h.date, "habit"));
  (meds || []).forEach((m) => add(m.date, "med"));
  (planner || []).forEach((p) => {
    const kind = p.source === "calendar" ? ({ Meal: "meal", Water: "water", Medication: "med", Habit: "habit", Task: "task" })[String(p.title || "").split(":")[0]] : null;
    add(p.date, kind || "event", String(p.date).slice(0, 10) > todayS);
  });
  (cycles || []).forEach((c) => { if (c.type === "PeriodStart" || c.type === "Spotting") add(c.date, "period"); });
  (notes || []).forEach((n) => add(n.session_date, "note"));
  (tasks || []).forEach((t) => add(t.date, "task", String(t.date).slice(0, 10) > todayS));
  return map;
}

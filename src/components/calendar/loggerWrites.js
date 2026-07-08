// loggerWrites — REAL base44 entity writes for the calendar-driven logger, targeting an
// explicit date (the day the user tapped). Field shapes mirror the PROVEN writers in
// UnifiedTabLogger.jsx exactly, so a calendar log is identical to a "+"-FAB log — just
// dated to the chosen day instead of always today. UnifiedTabLogger itself is untouched.
//
// Every write is guarded (.catch) so a failure never crashes the sheet; callers reload
// the month afterward to refresh the dots.
import { base44 } from "@/api/base44Client";

const nowISO = () => new Date().toISOString();
const todayISO = () => new Date().toISOString().split("T")[0];

async function uid() {
  try { const me = await base44.entities.User.me(); return me?.id || null; } catch { return null; }
}

// ── per-type writers (date = YYYY-MM-DD chosen day) ─────────────────────────────
export async function writeMealLog(user_id, date, { raw_text, meal_type = "snack", portion_size = "medium", notes = "", time }) {
  const logged_at = time ? new Date(`${date}T${time}:00`).toISOString() : (date === todayISO() ? nowISO() : `${date}T12:00:00.000Z`);
  const log = await base44.entities.MealLog.create({
    user_id, day_key: date, logged_at,
    meal_type: String(meal_type).toLowerCase(), method: "text",
    raw_text: raw_text || "Meal", portion_size, notes,
  });
  // fire-and-forget analysis (same pattern as the live meal loggers) — never blocks.
  try { base44.functions.invoke("analyzeMeal", { raw_text: raw_text || "Meal", meal_log_id: log?.id }).catch(() => {}); } catch { /* ignore */ }
  return log;
}

export async function writeHydration(user_id, date, glasses = 1) {
  const logged_at = date === todayISO() ? nowISO() : `${date}T12:00:00.000Z`;
  for (let i = 0; i < glasses; i++) {
    await base44.entities.HydrationLog.create({ user_id, day_key: date, amount_ml: 250, logged_at, source: "manual" }).catch(() => {});
  }
}

export async function writeMood(user_id, date, { mood, energy, notes }) {
  // upsert the day's DailyCheckins row (mirrors UnifiedTabLogger.writeCheckin)
  const existing = await base44.entities.DailyCheckins.filter({ user_id, date }, "-updated_at", 1).catch(() => []);
  const row = (existing || [])[0];
  const body = { updated_at: nowISO() };
  if (mood != null) body.mood = Number(mood);
  if (energy != null) body.energy = Number(energy);
  if (notes) body.notes = notes;
  if (row?.id) await base44.entities.DailyCheckins.update(row.id, body).catch(() => {});
  else await base44.entities.DailyCheckins.create({ user_id, date, ...body }).catch(() => {});
}

export async function writeSymptom(user_id, date, { symptoms = [], severity = 3, notes = "" }) {
  const list = Array.isArray(symptoms) ? symptoms : [symptoms];
  for (const s of list.filter(Boolean)) {
    await base44.entities.SymptomLogs.create({
      user_id, date, symptom_type: String(s), severity: Number(severity) || 3,
      notes, created_at: nowISO(), updated_at: nowISO(),
    }).catch(() => {});
  }
}

export async function writeNote(user_id, date, { text, mood }) {
  await base44.entities.JournalEntries.create({
    user_id, session_date: date, text: text || "",
    tags: mood ? [String(mood).toLowerCase()] : ["note"], prompt: "Calendar note",
  }).catch(() => {});
}

export async function writeHabit(user_id, date, { name }) {
  const n = name || "Habit";
  await base44.entities.HabitLogs.create({
    user_id, date, habit_type: n, habit_name: n, habit_category: "other",
    completed: false, is_completed: false, created_at: nowISO(), updated_at: nowISO(),
  }).catch(() => {});
}

export async function writeMed(user_id, date, { name, dose = "" }) {
  await base44.entities.MedicationLogs.create({
    user_id, date, item_name: name || "Medication", dose: String(dose),
    taken: true, created_at: nowISO(), updated_at: nowISO(),
  }).catch(() => {});
}

export async function writeEvent(user_id, date, { title, time, notes = "" }) {
  await base44.entities.PlannerItems.create({
    user_id, date, time: time || "09:00", title: title || "Event",
    category: "personal", repeat: "once", notes, is_completed: false,
    created_at: nowISO(), updated_at: nowISO(),
  }).catch(() => {});
}

export async function writeTask(user_id, date, { title, time_of_day = null }) {
  await base44.entities.PersonalTasks.create({
    user_id, date, title: title || "Task", category: "personal",
    completed: false, time_of_day, notes: "", created_at: nowISO(), updated_at: nowISO(),
  }).catch(() => {});
}

// ── batch commit for the calendar sheets ───────────────────────────────────────
// Accepts the demo sheets' list shape [{ date, type, plan, title?, time?, ...rich }]
// plus optional rich meal payload. Returns nothing; caller reloads the month.
export async function commitEntries(user_id, list) {
  if (!user_id || !Array.isArray(list)) return;
  for (const e of list) {
    if (!e?.date) continue;
    const t = e.type;
    try {
      if (t === "meal") await writeMealLog(user_id, e.date, { raw_text: e.raw_text || e.title, meal_type: e.meal_type, portion_size: e.portion_size, notes: e.notes, time: e.time });
      else if (t === "water") await writeHydration(user_id, e.date, 1);
      else if (t === "mood") await writeMood(user_id, e.date, { mood: e.mood ?? 3 });
      else if (t === "symptom") await writeSymptom(user_id, e.date, { symptoms: e.symptoms || [e.title || "Symptom"], severity: e.severity });
      else if (t === "note") await writeNote(user_id, e.date, { text: e.text || e.title || "" });
      else if (t === "habit") await writeHabit(user_id, e.date, { name: e.title });
      else if (t === "med") await writeMed(user_id, e.date, { name: e.title });
      else if (t === "event" || t === "reminder") await writeEvent(user_id, e.date, { title: e.title, time: e.time, notes: e.notes });
      else if (t === "task") await writeTask(user_id, e.date, { title: e.title });
    } catch { /* per-item guard */ }
  }
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
  const [meals, hydra, moods, symptoms, habits, meds, planner] = await Promise.all([
    base44.entities.MealLog.filter({ user_id }, "-day_key", 300).catch(() => []),
    base44.entities.HydrationLog.filter({ user_id }, "-day_key", 300).catch(() => []),
    base44.entities.DailyCheckins.filter({ user_id }, "-date", 300).catch(() => []),
    base44.entities.SymptomLogs.filter({ user_id }, "-date", 300).catch(() => []),
    base44.entities.HabitLogs.filter({ user_id }, "-date", 300).catch(() => []),
    base44.entities.MedicationLogs.filter({ user_id }, "-date", 300).catch(() => []),
    base44.entities.PlannerItems.filter({ user_id }, "-date", 300).catch(() => []),
  ]);
  (meals || []).forEach((m) => add(m.day_key, "meal"));
  (hydra || []).forEach((h) => add(h.day_key, "water"));
  (moods || []).forEach((c) => { if (c.mood != null) add(c.date, "mood"); });
  (symptoms || []).forEach((s) => add(s.date, "symptom"));
  (habits || []).forEach((h) => add(h.date, "habit"));
  (meds || []).forEach((m) => add(m.date, "med"));
  (planner || []).forEach((p) => add(p.date, "event", String(p.date).slice(0, 10) > todayS));
  return map;
}

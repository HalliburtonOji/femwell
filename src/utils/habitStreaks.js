// V3 sprint Tasks 1b + 3 — compute consecutive-day streaks ending today,
// grouped by habit_name, from a list of HabitLogs rows.
//
//   const rows = await base44.entities.HabitLogs.filter({ user_id }, "-date", 60);
//   const streaks = computeStreaks(rows);
//   streaks["Sunlight + walk"] // → 5
//
// A streak counts back from today: today must be present (any habit row
// for that habit_name with completed=true OR is_completed=true), then
// each previous day continues the streak until the chain breaks.

function toDateKey(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    // Already a YYYY-MM-DD-ish string?
    return typeof value === "string" ? value.split("T")[0] : null;
  }
  return d.toISOString().split("T")[0];
}

function isCompleted(row) {
  return row?.completed === true || row?.is_completed === true;
}

export function computeStreaks(rows) {
  const byHabitDates = new Map(); // habit_name → Set<dateKey>
  for (const r of rows || []) {
    if (!isCompleted(r)) continue;
    const name = r?.habit_name || r?.habit_type;
    if (!name) continue;
    const day = toDateKey(r?.date || r?.logged_at || r?.created_at);
    if (!day) continue;
    if (!byHabitDates.has(name)) byHabitDates.set(name, new Set());
    byHabitDates.get(name).add(day);
  }
  const out = {};
  const todayKey = new Date().toISOString().split("T")[0];
  for (const [name, set] of byHabitDates.entries()) {
    let streak = 0;
    const cursor = new Date(todayKey);
    while (true) {
      const key = cursor.toISOString().split("T")[0];
      if (set.has(key)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    if (streak > 0) out[name] = streak;
  }
  return out;
}

// Convenience: returns true if `name` has a completed row today.
export function isCompletedToday(rows, name) {
  const today = new Date().toISOString().split("T")[0];
  return (rows || []).some(
    (r) => isCompleted(r) && (r?.habit_name === name || r?.habit_type === name)
       && toDateKey(r?.date || r?.logged_at || r?.created_at) === today,
  );
}

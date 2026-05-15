// Tiny shared helper so every new Planner Phase 2 card reads HabitLogs the
// same way. The codebase has two writers for HabitLogs:
//   - Planner.jsx writes `habit_name` + `is_completed`
//   - Track.jsx writes `habit_type` + `completed`
// Both shapes coexist on every user's row set. New surfaces must accept both
// so morning-stack-only loggers aren't invisible to Cycle-tab analytics.
//
// Mirrors the defensive read in `src/pages/Track.jsx` (which checks both
// fields). Centralised here so the contract is single-sourced.

export function habitNameOf(row) {
  if (!row) return null;
  return row.habit_type || row.habit_name || null;
}

export function habitCompletedOf(row) {
  if (!row) return false;
  if (typeof row.completed === "boolean") return row.completed;
  if (typeof row.is_completed === "boolean") return row.is_completed;
  return false;
}

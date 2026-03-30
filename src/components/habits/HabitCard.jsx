import { useState } from "react";
import { ChevronDown, ChevronUp, Circle, CheckCircle2 } from "lucide-react";
import HabitStreakCalendar from "./HabitStreakCalendar";

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const MILESTONE_LABELS = {
  7:   "7 days",
  14:  "2 weeks",
  30:  "30 days",
  60:  "60 days",
  100: "100 days",
};

export default function HabitCard({ habit, habitLogs, allHabitLogs, selectedDate, todayStr, onComplete, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const isToday = selectedDate === todayStr;
  const isCompleted = habitLogs.some(
    (l) => (l.habit_type === habit || l.habit_name === habit) && l.completed && l.date === selectedDate
  );

  const streak = (() => {
    let count = 0;
    const check = new Date();
    const todayCompleted = allHabitLogs.some(
      (l) => (l.habit_type === habit || l.habit_name === habit) && l.completed && l.date === todayStr
    );
    if (!todayCompleted) check.setDate(check.getDate() - 1);
    while (true) {
      const ds = check.toISOString().split("T")[0];
      const found = allHabitLogs.find(
        (l) => (l.habit_type === habit || l.habit_name === habit) && l.completed && l.date === ds
      );
      if (!found) break;
      count++;
      check.setDate(check.getDate() - 1);
    }
    return count;
  })();

  const isMilestone = MILESTONE_LABELS[streak];

  return (
    <div className="rounded-[20px] overflow-hidden transition-all"
      style={{
        ...card,
        border: isCompleted ? "1px solid var(--sage-light)" : "1px solid var(--border)",
      }}>
      <div className="p-4">
        <div className="flex items-center gap-3.5">
          {/* Complete toggle */}
          <button
            onClick={() => !isCompleted && isToday && onComplete(habit)}
            disabled={isCompleted || !isToday}
            className="flex-shrink-0 transition-all"
            style={{ opacity: !isToday && !isCompleted ? 0.35 : 1 }}
          >
            {isCompleted
              ? <CheckCircle2 className="w-6 h-6" style={{ color: "var(--sage)" }} />
              : <Circle className="w-6 h-6" style={{ color: "var(--border)" }} />
            }
          </button>

          {/* Habit info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate"
              style={{
                color: isCompleted ? "var(--sage)" : "var(--plum)",
                fontFamily: "'Inter', sans-serif",
                textDecoration: isCompleted ? "line-through" : "none",
                textDecorationColor: "var(--sage-light)",
              }}>
              {habit}
            </p>
            {streak > 0 && (
              <p className="text-xs mt-0.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                {streak} day{streak !== 1 ? "s" : ""} in a row
              </p>
            )}
          </div>

          {/* Streak badge */}
          {streak >= 7 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>
              {streak}d
            </span>
          )}

          {/* Expand toggle */}
          <button onClick={() => setExpanded((v) => !v)}
            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Milestone acknowledgement */}
        {isMilestone && isCompleted && (
          <div className="mt-3 rounded-[14px] px-3.5 py-2.5"
            style={{ backgroundColor: "var(--sage-subtle)", border: "1px solid var(--sage-light)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>
              {MILESTONE_LABELS[streak]} consistent
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--sage)", fontFamily: "'Inter', sans-serif", opacity: 0.75 }}>
              That's a meaningful rhythm you've built.
            </p>
          </div>
        )}
      </div>

      {/* Expanded calendar */}
      {expanded && (
        <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="pt-3">
            <HabitStreakCalendar habitLogs={allHabitLogs} habitName={habit} />
          </div>
          <button onClick={() => onDelete(habit)}
            className="mt-3 text-xs font-medium"
            style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            Remove habit
          </button>
        </div>
      )}
    </div>
  );
}
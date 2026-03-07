import { useState } from "react";
import { Flame, ChevronDown, ChevronUp, CheckCircle, Circle } from "lucide-react";
import HabitStreakCalendar from "./HabitStreakCalendar";

const MILESTONE_MESSAGES = {
  7: "🎉 7-day streak! You're on fire!",
  14: "🌟 2 weeks strong! Keep going!",
  30: "🏆 30 days! Incredible dedication!",
  60: "💎 60-day legend! Unstoppable!",
  100: "🚀 100 days! You're a habit master!",
};

export default function HabitCard({ habit, habitLogs, allHabitLogs, selectedDate, todayStr, onComplete, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const isToday = selectedDate === todayStr;
  const isCompleted = habitLogs.some(
    (l) => (l.habit_type === habit || l.habit_name === habit) && l.completed && l.date === selectedDate
  );

  // Calculate streak
  const streak = (() => {
    let count = 0;
    const check = new Date();
    // If today not completed, start from yesterday
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

  const milestoneMsg = MILESTONE_MESSAGES[streak];

  return (
    <div className={`card-glass rounded-2xl overflow-hidden transition-all ${isCompleted ? "border border-emerald-200" : ""}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Complete button */}
            <button
              onClick={() => !isCompleted && isToday && onComplete(habit)}
              disabled={isCompleted || !isToday}
              className={`flex-shrink-0 transition-all ${isCompleted ? "cursor-default" : isToday ? "hover:scale-110 active:scale-95" : "opacity-40 cursor-not-allowed"}`}
            >
              {isCompleted
                ? <CheckCircle className="w-6 h-6 text-emerald-500" />
                : <Circle className="w-6 h-6 text-gray-300" />
              }
            </button>

            <div className="min-w-0">
              <p className={`text-sm font-semibold capitalize truncate ${isCompleted ? "text-emerald-700 line-through" : "text-gray-800"}`}>
                {habit}
              </p>
              {streak > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-orange-500 font-medium">{streak} day streak</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {streak >= 7 && (
              <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full font-semibold">
                🔥 {streak}
              </span>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-rose-50 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
            </button>
          </div>
        </div>

        {/* Milestone message */}
        {milestoneMsg && (
          <div className="mt-2 bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl px-3 py-2">
            <p className="text-xs text-rose-600 font-medium">{milestoneMsg}</p>
          </div>
        )}
      </div>

      {/* Expanded streak calendar */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <HabitStreakCalendar habitLogs={allHabitLogs} habitName={habit} />
          <button
            onClick={() => onDelete(habit)}
            className="mt-3 text-[11px] text-red-300 hover:text-red-500 transition-colors"
          >
            Remove habit
          </button>
        </div>
      )}
    </div>
  );
}
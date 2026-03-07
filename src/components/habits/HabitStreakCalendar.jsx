import { useMemo } from "react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";

export default function HabitStreakCalendar({ habitLogs, habitName }) {
  const today = new Date();

  // Build a set of completed dates for this habit
  const completedDates = useMemo(() => {
    const set = new Set();
    habitLogs
      .filter((l) => (l.habit_type === habitName || l.habit_name === habitName) && l.completed)
      .forEach((l) => set.add(l.date));
    return set;
  }, [habitLogs, habitName]);

  // Last 5 weeks (35 days) as a grid
  const days = useMemo(() => {
    return Array.from({ length: 35 }, (_, i) => subDays(today, 34 - i));
  }, []);

  // Group into weeks of 7
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  const isCompleted = (d) => completedDates.has(format(d, "yyyy-MM-dd"));
  const isFuture = (d) => d > today;
  const isToday = (d) => format(d, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

  return (
    <div className="mt-3">
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((l, i) => (
          <div key={i} className="text-center text-[9px] text-gray-400 font-medium">{l}</div>
        ))}
      </div>
      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((d, di) => {
            const done = isCompleted(d);
            const future = isFuture(d);
            const todayFlag = isToday(d);
            return (
              <div
                key={di}
                title={format(d, "MMM d")}
                className={`w-full aspect-square rounded-md flex items-center justify-center text-[9px] font-medium transition-all
                  ${future ? "bg-gray-50 text-gray-200" :
                    done ? "bg-rose-400 text-white shadow-sm" :
                    todayFlag ? "bg-rose-100 text-rose-400 border-2 border-rose-300" :
                    "bg-gray-100 text-gray-300"
                  }`}
              >
                {todayFlag && !done ? <span className="w-1 h-1 rounded-full bg-rose-400 block" /> : null}
              </div>
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-rose-400" />
          <span className="text-[10px] text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-100" />
          <span className="text-[10px] text-gray-400">Missed</span>
        </div>
      </div>
    </div>
  );
}
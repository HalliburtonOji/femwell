import { useMemo } from "react";
import { format, subDays } from "date-fns";

export default function HabitStreakCalendar({ habitLogs, habitName }) {
  const today = new Date();

  const completedDates = useMemo(() => {
    const set = new Set();
    habitLogs
      .filter((l) => (l.habit_type === habitName || l.habit_name === habitName) && l.completed)
      .forEach((l) => set.add(l.date));
    return set;
  }, [habitLogs, habitName]);

  const days = useMemo(() => Array.from({ length: 35 }, (_, i) => subDays(today, 34 - i)), []);

  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7));
    return result;
  }, [days]);

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const isCompleted = (d) => completedDates.has(format(d, "yyyy-MM-dd"));
  const isFuture = (d) => d > today;
  const isToday = (d) => format(d, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

  return (
    <div className="mt-3">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((l, i) => (
          <div key={i} className="text-center text-[9px] font-medium" style={{ color: "var(--mauve)" }}>{l}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((d, di) => {
            const done = isCompleted(d);
            const future = isFuture(d);
            const todayFlag = isToday(d);
            return (
              <div key={di} title={format(d, "MMM d")}
                className="w-full aspect-square rounded-md flex items-center justify-center text-[9px] font-medium transition-all"
                style={{
                  backgroundColor: future ? "var(--ivory)" : done ? "var(--rose-dust)" : todayFlag ? "var(--rose-dust-subtle)" : "var(--ivory-dark)",
                  color: future ? "var(--border)" : done ? "white" : todayFlag ? "var(--rose-dust)" : "var(--mauve)",
                  border: todayFlag && !done ? "2px solid var(--rose-dust-light)" : "none",
                }}>
                {todayFlag && !done ? <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "var(--rose-dust)", display: "block" }} /> : null}
              </div>
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--rose-dust)" }} />
          <span className="text-[10px]" style={{ color: "var(--mauve)" }}>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--ivory-dark)" }} />
          <span className="text-[10px]" style={{ color: "var(--mauve)" }}>Missed</span>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DOT_COLORS = {
  cycle: "bg-rose-400",
  symptom: "bg-amber-400",
  habit: "bg-emerald-400",
  med: "bg-purple-400",
  session: "bg-blue-400",
};

export default function TrackCalendar({ user, onSelectDate, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dotMap, setDotMap] = useState({});

  useEffect(() => {
    loadMonthData();
  }, [currentMonth, user]);

  const loadMonthData = async () => {
    const start = startOfMonth(currentMonth).toISOString().split("T")[0];
    const end = endOfMonth(currentMonth).toISOString().split("T")[0];

    let cycles = [], symptoms = [], habits = [], meds = [], sessions = [];
    try {
      [cycles, symptoms, habits, meds, sessions] = await Promise.all([
        base44.entities.CycleEvents.filter({ user_id: user.id }, "-date", 200),
        base44.entities.SymptomLogs.filter({ user_id: user.id }, "-date", 200),
        base44.entities.HabitLogs.filter({ user_id: user.id }, "-date", 200),
        base44.entities.MedicationLogs.filter({ user_id: user.id }, "-date", 200),
        base44.entities.ContentHistory.filter({ user_id: user.id }, "-session_date", 200),
      ]);
    } catch (e) {
      console.warn("TrackCalendar: failed to load month data", e);
      return;
    }

    const map = {};
    const addDot = (date, type) => {
      if (date >= start && date <= end) {
        if (!map[date]) map[date] = new Set();
        map[date].add(type);
      }
    };

    cycles.forEach(e => addDot(e.date, "cycle"));
    symptoms.forEach(e => addDot(e.date, "symptom"));
    habits.filter(h => h.completed).forEach(e => addDot(e.date, "habit"));
    meds.forEach(e => addDot(e.date, "med"));
    sessions.filter(s => !s.is_deleted && s.session_date).forEach(e => addDot(e.session_date, "session"));

    setDotMap(Object.fromEntries(Object.entries(map).map(([k, v]) => [k, [...v]])));
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startPad = (startOfMonth(currentMonth).getDay() + 6) % 7; // Monday-first

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="card-glass rounded-2xl p-4 mb-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="p-1.5 rounded-full hover:bg-rose-50">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <p className="text-sm font-bold text-gray-800">{format(currentMonth, "MMMM yyyy")}</p>
        <button
          onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          disabled={isSameMonth(currentMonth, new Date())}
          className="p-1.5 rounded-full hover:bg-rose-50 disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dots = dotMap[dateStr] || [];
          const isSelected = selectedDate === dateStr;
          const isTodayDay = isToday(day);
          const isFuture = dateStr > todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && onSelectDate(dateStr)}
              disabled={isFuture}
              className={`relative flex flex-col items-center py-1.5 rounded-xl transition-all ${
                isSelected ? "bg-rose-500" : isTodayDay ? "bg-rose-50 border border-rose-200" : "hover:bg-white/60"
              } ${isFuture ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className={`text-xs font-semibold ${isSelected ? "text-white" : isTodayDay ? "text-rose-600" : "text-gray-700"}`}>
                {format(day, "d")}
              </span>
              {dots.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[24px]">
                  {dots.slice(0, 3).map(type => (
                    <div key={type} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : DOT_COLORS[type]}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-rose-50">
        {Object.entries(DOT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] text-gray-400 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DOT_TYPE_COLORS = {
  cycle:   "var(--rose-dust)",
  symptom: "#E8B84B",
  habit:   "var(--sage)",
  med:     "#9B7FCC",
  session: "#6B8AC4",
};

function getPhaseForDate(dateStr, profile) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const d = new Date(dateStr + "T12:00:00");
  const last = new Date(profile.last_period_start_date);
  const diff = Math.floor((d - last) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  const cycleDay = (diff % cycleLen) + 1;
  if (cycleDay <= periodLen) return "menstrual";
  if (cycleDay <= 13) return "follicular";
  if (cycleDay <= 16) return "ovulatory";
  return "luteal";
}

export default function TrackCalendar({ user, profile, onSelectDate, selectedDate }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [dotMap, setDotMap] = useState({});
  const [checkinDates, setCheckinDates] = useState(new Set());

  const currentMonthDate = new Date(viewYear, viewMonth, 1);

  useEffect(() => {
    loadMonthData();
  }, [viewMonth, viewYear, user]);

  const loadMonthData = async () => {
    const start = format(startOfMonth(currentMonthDate), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonthDate), "yyyy-MM-dd");

    let cycles = [], symptoms = [], habits = [], meds = [], sessions = [], checkins = [];
    try {
      [cycles, symptoms, habits, meds, sessions, checkins] = await Promise.all([
        base44.entities.CycleEvents.filter({ user_id: user.id }, "-date", 200),
        base44.entities.SymptomLogs.filter({ user_id: user.id }, "-date", 200),
        base44.entities.HabitLogs.filter({ user_id: user.id }, "-date", 200),
        base44.entities.MedicationLogs.filter({ user_id: user.id }, "-date", 200),
        base44.entities.ContentHistory.filter({ user_id: user.id }, "-session_date", 200),
        base44.entities.DailyCheckins.filter({ user_id: user.id }, "-date", 200),
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
    setCheckinDates(new Set(checkins.map(c => c.date)));
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    const nowM = now.getMonth(); const nowY = now.getFullYear();
    if (viewYear > nowY || (viewYear === nowY && viewMonth >= nowM)) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonthDate), end: endOfMonth(currentMonthDate) });
  const startPad = (startOfMonth(currentMonthDate).getDay() + 6) % 7;
  const todayStr = now.toISOString().split("T")[0];
  const isAtCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  return (
    <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 16, marginBottom: 16, boxShadow: "var(--shadow-sm)" }}>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button
          onClick={prevMonth}
          style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft style={{ width: 16, height: 16, color: "var(--plum)" }} />
        </button>
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>
          {format(currentMonthDate, "MMMM yyyy")}
        </p>
        <button
          onClick={nextMonth}
          disabled={isAtCurrentMonth}
          style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: isAtCurrentMonth ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: isAtCurrentMonth ? 0.3 : 1 }}
        >
          <ChevronRight style={{ width: 16, height: 16, color: "var(--plum)" }} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: "var(--mauve)", padding: "4px 0", fontFamily: "'Inter', sans-serif" }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} style={{ minHeight: 44 }} />)}
        {days.map(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dots = dotMap[dateStr] || [];
          const isSelected = selectedDate === dateStr;
          const isTodayDay = isToday(day);
          const isFuture = dateStr > todayStr;
          const phase = getPhaseForDate(dateStr, profile);
          const hasCycle = phase === "menstrual";
          const hasCheckin = checkinDates.has(dateStr);

          let bgColor = "transparent";
          let textColor = "var(--plum)";
          let borderStyle = "none";
          let fontWeight = 400;

          if (isSelected) {
            bgColor = "var(--plum)";
            textColor = "white";
            fontWeight = 700;
          } else if (isTodayDay) {
            bgColor = "transparent";
            textColor = "var(--plum)";
            borderStyle = "2px solid var(--plum)";
            fontWeight = 700;
          } else if (hasCycle) {
            bgColor = "var(--rose-dust-subtle)";
            textColor = "var(--rose-dust)";
            fontWeight = 600;
          } else if (phase === "ovulatory") {
            bgColor = "var(--sage-subtle)";
            textColor = "var(--sage)";
          }

          if (isFuture) textColor = "var(--mauve)";

          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && onSelectDate(dateStr)}
              disabled={isFuture}
              style={{
                minHeight: 44, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                borderRadius: 10, border: borderStyle,
                backgroundColor: bgColor, cursor: isFuture ? "not-allowed" : "pointer",
                opacity: isFuture ? 0.35 : 1, transition: "background 0.15s",
                padding: "4px 2px",
              }}
            >
              <span style={{ fontSize: 12, fontWeight, color: textColor, fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>
                {format(day, "d")}
              </span>
              {(hasCheckin || dots.length > 0) && (
                <div style={{ display: "flex", gap: 2, marginTop: 3, justifyContent: "center" }}>
                  {hasCheckin && (
                    <div style={{ width: 4, height: 4, borderRadius: 9999, backgroundColor: isSelected ? "rgba(255,255,255,0.7)" : "var(--rose-dust)" }} />
                  )}
                  {dots.filter(t => t !== "cycle").slice(0, 2).map(type => (
                    <div key={type} style={{ width: 4, height: 4, borderRadius: 9999, backgroundColor: isSelected ? "rgba(255,255,255,0.5)" : DOT_TYPE_COLORS[type] }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap" }}>
        {[
          { color: "var(--rose-dust)", label: "Period" },
          { color: "var(--sage)", label: "Fertile window" },
          { color: "var(--plum)", label: "Today" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: color }} />
            <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
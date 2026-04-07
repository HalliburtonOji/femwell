import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  addDays, format, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay,
  parseISO, differenceInDays, addMonths, subMonths
} from "date-fns";

const PHASE_COLORS = {
  menstrual:  { color: "#C4849A", label: "Menstrual" },
  follicular: { color: "#7A9E8E", label: "Follicular" },
  ovulatory:  { color: "#B89E6A", label: "Ovulatory" },
  luteal:     { color: "#8A7E88", label: "Luteal" },
};

const MOON_PHASES = ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"];

const MONTH_BACKGROUNDS = {
  0:  "https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=900&q=80",
  1:  "https://images.unsplash.com/photo-1457530378978-8bac673b8062?w=900&q=80",
  2:  "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=900&q=80",
  3:  "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=900&q=80",
  4:  "https://images.unsplash.com/photo-1490750967868-88df5691cc2b?w=900&q=80",
  5:  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
  6:  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
  7:  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900&q=80",
  8:  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
  9:  "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=900&q=80",
  10: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80",
  11: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80",
};

function getMoonPhase(date) {
  const known = new Date("2000-01-06");
  const diff = differenceInDays(date, known);
  const idx = Math.round(((diff % 29.53) / 29.53) * 8) % 8;
  return MOON_PHASES[Math.abs(idx)];
}

function getCyclePhase(date, lastPeriodDate, cycleLen = 28, periodLen = 5) {
  if (!lastPeriodDate) return null;
  const last = parseISO(lastPeriodDate);
  const diff = differenceInDays(date, last);
  if (diff < 0) return null;
  const cycleDay = (diff % cycleLen) + 1;
  if (cycleDay <= periodLen) return "menstrual";
  if (cycleDay <= 13) return "follicular";
  if (cycleDay <= 16) return "ovulatory";
  return "luteal";
}

export default function MonthlyCalendarCard({ userId, profile, onDayPress, refreshKey }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkins, setCheckins] = useState({});
  const [symptoms, setSymptoms] = useState({});
  const [habitLogs, setHabitLogs] = useState({});
  const [personalTasks, setPersonalTasks] = useState({});
  const [periodDates, setPeriodDates] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [allCheckins, allSymptoms, allCycleEvents, allHabits, allTasks] = await Promise.all([
        base44.entities.DailyCheckins.filter({ user_id: userId }, "-date", 300),
        base44.entities.SymptomLogs.filter({ user_id: userId }, "-date", 300),
        base44.entities.CycleEvents.filter({ user_id: userId }, "-date", 200),
        base44.entities.HabitLogs.filter({ user_id: userId }, "-date", 300),
        base44.entities.PersonalTasks.filter({ user_id: userId }, "-date", 300),
      ]);

      const checkinMap = {};
      allCheckins.forEach(c => { checkinMap[c.date] = c; });
      setCheckins(checkinMap);

      const symptomMap = {};
      allSymptoms.forEach(s => {
        if (!symptomMap[s.date]) symptomMap[s.date] = [];
        symptomMap[s.date].push(s);
      });
      setSymptoms(symptomMap);

      const habitMap = {};
      allHabits.forEach(h => {
        if (!habitMap[h.date]) habitMap[h.date] = [];
        habitMap[h.date].push(h);
      });
      setHabitLogs(habitMap);

      const taskMap = {};
      allTasks.forEach(t => {
        if (!taskMap[t.date]) taskMap[t.date] = [];
        taskMap[t.date].push(t);
      });
      setPersonalTasks(taskMap);

      const periodSet = new Set();
      allCycleEvents.filter(e => e.type === "PeriodStart").forEach(e => periodSet.add(e.date));
      setPeriodDates(periodSet);
      setLoaded(true);
    })();
  }, [userId, refreshKey]);

  const daysInView = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days = [];
    let d = start;
    while (d <= end) { days.push(d); d = addDays(d, 1); }
    return days;
  };

  const predictedNextPeriod = (() => {
    if (!profile?.last_period_start_date || !profile?.cycle_avg_length) return null;
    const last = parseISO(profile.last_period_start_date);
    return addDays(last, profile.cycle_avg_length);
  })();

  const today = new Date();
  const days = daysInView();
  const bgImage = MONTH_BACKGROUNDS[currentMonth.getMonth()];

  const getFullDayData = (day) => {
    const ds = format(day, "yyyy-MM-dd");
    return {
      checkin: checkins[ds] || null,
      symptoms: symptoms[ds] || [],
      habits: habitLogs[ds] || [],
      tasks: personalTasks[ds] || [],
    };
  };

  return (
    <div>
      <style>{`
        @keyframes cal-in { from { opacity:0; transform:translateY(12px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .cal-card { animation: cal-in 0.35s ease forwards; }
        .cal-day:hover { background: rgba(255,255,255,0.18) !important; }
      `}</style>

      {/* Artsy Month Card */}
      <div
        className="cal-card"
        style={{
          position: "relative",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(42,32,53,0.22), 0 4px 16px rgba(42,32,53,0.1)",
          marginBottom: 20,
        }}
      >
        <img
          src={bgImage}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          onError={e => { e.target.style.display = "none"; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(18,10,30,0.5) 0%, rgba(18,10,30,0.72) 45%, rgba(18,10,30,0.92) 100%)", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2, padding: "22px 16px 22px" }}>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              style={{ width: 38, height: 38, borderRadius: 14, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </button>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: "white", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em", lineHeight: 1 }}>
                {format(currentMonth, "MMMM")}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", marginTop: 3 }}>
                {format(currentMonth, "yyyy")}
              </p>
            </div>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              style={{ width: 38, height: 38, borderRadius: 14, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
            >
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Day of week headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 6 }}>
            {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em" }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
            {days.map((day, i) => {
              const ds = format(day, "yyyy-MM-dd");
              const inMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const phase = getCyclePhase(day, profile?.last_period_start_date, profile?.cycle_avg_length || 28, profile?.period_length || 5);
              const phaseColor = phase ? PHASE_COLORS[phase].color : null;
              const hasPeriod = periodDates.has(ds);
              const isPredicted = predictedNextPeriod && isSameDay(day, predictedNextPeriod);
              const hasSymptom = !!(symptoms[ds]?.length);
              const hasTask = !!(personalTasks[ds]?.length);
              const hasHabit = habitLogs[ds]?.some(h => h.completed);
              const moon = getMoonPhase(day);

              return (
                <button
                  key={i}
                  className="cal-day"
                  onClick={() => inMonth && onDayPress(day, getFullDayData(day))}
                  style={{
                    minHeight: 48,
                    padding: "5px 2px 4px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: inMonth ? "pointer" : "default",
                    borderRadius: 11,
                    background: isToday
                      ? "rgba(255,255,255,0.28)"
                      : phaseColor && inMonth
                        ? `${phaseColor}28`
                        : "rgba(255,255,255,0.05)",
                    border: isToday ? "1.5px solid rgba(255,255,255,0.65)" : "1px solid rgba(255,255,255,0.07)",
                    opacity: inMonth ? 1 : 0.18,
                    backdropFilter: inMonth ? "blur(6px)" : "none",
                    outline: "none",
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{
                    fontSize: 11, fontWeight: isToday ? 700 : 400,
                    color: isToday ? "white" : "rgba(255,255,255,0.82)",
                    fontFamily: "'Inter', sans-serif", lineHeight: 1,
                  }}>{format(day, "d")}</span>
                  <span style={{ fontSize: 6, lineHeight: 1, marginTop: 1, opacity: 0.35 }}>{moon}</span>
                  <div style={{ display: "flex", gap: 2, marginTop: "auto", alignItems: "center", minHeight: 7 }}>
                    {hasPeriod && <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#ff8fab" }} />}
                    {isPredicted && <div style={{ width: 4, height: 4, borderRadius: "50%", border: "1px dashed #ff8fab" }} />}
                    {hasSymptom && <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.55)" }} />}
                    {hasHabit && <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#81C784" }} />}
                    {hasTask && <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#FFD700" }} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend row */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { color: "#ff8fab", label: "Period" },
              { color: "rgba(255,255,255,0.55)", label: "Symptom" },
              { color: "#81C784", label: "Habit" },
              { color: "#FFD700", label: "Task" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: l.color }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif" }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Phase key */}
          {profile?.last_period_start_date && (
            <div style={{ display: "flex", gap: 10, marginTop: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {Object.entries(PHASE_COLORS).map(([phase, { color, label }]) => (
                <div key={phase} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: color + "55", border: `1px solid ${color}90` }} />
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", fontFamily: "'Inter', sans-serif" }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Predicted next period */}
      {predictedNextPeriod && (
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--rose-dust-light)", borderRadius: 16, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>Predicted next period</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
              {format(predictedNextPeriod, "EEEE, MMMM d")}
            </p>
          </div>
          <span style={{ fontSize: 22 }}>🌸</span>
        </div>
      )}

      {!loaded && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ width: 20, height: 20, border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
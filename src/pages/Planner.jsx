import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { createPageUrl } from "@/utils";
import { addDays, subDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO, differenceInDays, addMonths, subMonths } from "date-fns";

const PHASE_COLORS = {
  menstrual:  "#C4849A",
  follicular: "#7A9E8E",
  ovulatory:  "#B89E6A",
  luteal:     "#8A7E88",
};

const MOON_PHASES = ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"];

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

function getMoodColor(mood) {
  if (!mood) return null;
  if (mood <= 2) return "#E57373";
  if (mood <= 3) return "#FFB74D";
  return "#81C784";
}

function DayDetailSheet({ date, checkin, symptoms, events, habits, onClose }) {
  if (!date) return null;
  const dateStr = format(date, "EEEE, MMMM d");
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(42,32,53,0.45)", backdropFilter: "blur(6px)", zIndex: 50 }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51, backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", maxHeight: "75vh", overflowY: "auto", boxShadow: "var(--shadow-lg)", paddingBottom: "env(safe-area-inset-bottom, 20px)" }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 14, paddingBottom: 8 }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>
        <div style={{ padding: "0 20px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Day Log</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", marginTop: 2 }}>{dateStr}</h3>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mauve)", fontWeight: 700, fontSize: 16 }}>×</button>
          </div>

          {checkin ? (
            <div style={{ backgroundColor: "var(--ivory)", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>Check-in</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[["Mood", checkin.mood, "/5"], ["Energy", checkin.energy, "/5"], ["Stress", checkin.stress, "/5"], ["Sleep", checkin.sleep_hours, "h"]].map(([label, val, unit]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{val ?? "—"}<span style={{ fontSize: 10, color: "var(--mauve)" }}>{unit}</span></p>
                    <p style={{ fontSize: 10, color: "var(--mauve)", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: "var(--ivory)", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No check-in logged for this day.</p>
            </div>
          )}

          {symptoms.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Symptoms</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {symptoms.map(s => (
                  <span key={s.id} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{s.symptom_type}</span>
                ))}
              </div>
            </div>
          )}

          {events.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Events</p>
              {events.map(ev => (
                <div key={ev.id} style={{ backgroundColor: "var(--ivory)", borderRadius: 12, padding: "10px 14px", marginBottom: 6 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{ev.title}</p>
                  {ev.location && <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>{ev.location}</p>}
                </div>
              ))}
            </div>
          )}

          {habits.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Habits</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {habits.filter(h => h.completed).map(h => (
                  <span key={h.id} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, backgroundColor: "var(--sage-subtle)", color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>{h.habit_name || h.habit_type}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Planner() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkins, setCheckins] = useState({});
  const [symptoms, setSymptoms] = useState({});
  const [periodDates, setPeriodDates] = useState(new Set());
  const [habitLogs, setHabitLogs] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const today = new Date();
      const from = format(subDays(today, 120), "yyyy-MM-dd");
      const [profiles, allCheckins, allSymptoms, allCycleEvents, allHabits, events] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }),
        base44.entities.DailyCheckins.filter({ user_id: u.id }, "-date", 200),
        base44.entities.SymptomLogs.filter({ user_id: u.id }, "-date", 300),
        base44.entities.CycleEvents.filter({ user_id: u.id }, "-date", 200),
        base44.entities.HabitLogs.filter({ user_id: u.id }, "-date", 200),
        base44.entities.EventsItems.list("-date", 30),
      ]);

      setProfile(profiles[0] || null);

      const checkinMap = {};
      allCheckins.forEach(c => { checkinMap[c.date] = c; });
      setCheckins(checkinMap);

      const symptomMap = {};
      allSymptoms.forEach(s => {
        if (!symptomMap[s.date]) symptomMap[s.date] = [];
        symptomMap[s.date].push(s);
      });
      setSymptoms(symptomMap);

      const periodSet = new Set();
      allCycleEvents.filter(e => e.type === "PeriodStart").forEach(e => {
        periodSet.add(e.date);
      });
      setPeriodDates(periodSet);

      const habitMap = {};
      allHabits.forEach(h => {
        if (!habitMap[h.date]) habitMap[h.date] = [];
        habitMap[h.date].push(h);
      });
      setHabitLogs(habitMap);

      const todayStr = format(today, "yyyy-MM-dd");
      setUpcomingEvents(events.filter(e => e.date >= todayStr).slice(0, 3));
      setLoading(false);
    })();
  }, []);

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
  const todayStr = format(today, "yyyy-MM-dd");
  const days = daysInView();

  const getSelectedDayData = () => {
    if (!selectedDate) return { checkin: null, symptoms: [], events: [], habits: [] };
    const ds = format(selectedDate, "yyyy-MM-dd");
    return {
      checkin: checkins[ds] || null,
      symptoms: symptoms[ds] || [],
      events: upcomingEvents.filter(e => e.date === ds),
      habits: habitLogs[ds] || [],
    };
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--ivory)" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const { checkin: selCheckin, symptoms: selSymptoms, events: selEvents, habits: selHabits } = getSelectedDayData();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ivory)", paddingBottom: 80 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ padding: "48px 20px 0", maxWidth: 480, margin: "0 auto" }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Wellness Planner</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>Planner</h1>
          <a href={createPageUrl("Today")} style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>Today</a>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 20px 0" }}>

        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--plum)" }}>
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={() => setCurrentMonth(new Date())}
            style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", background: "none", border: "none", cursor: "pointer" }}>
            {format(currentMonth, "MMMM yyyy")}
          </button>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            style={{ width: 36, height: 36, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--plum)" }}>
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
          {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, backgroundColor: "var(--surface)", borderRadius: 20, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          {days.map((day, i) => {
            const ds = format(day, "yyyy-MM-dd");
            const inMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const phase = getCyclePhase(day, profile?.last_period_start_date, profile?.cycle_avg_length || 28, profile?.period_length || 5);
            const phaseColor = phase ? PHASE_COLORS[phase] : null;
            const checkin = checkins[ds];
            const moodColor = getMoodColor(checkin?.mood);
            const hasPeriod = periodDates.has(ds);
            const hasSymptom = !!(symptoms[ds]?.length);
            const isPredictedPeriod = predictedNextPeriod && isSameDay(day, predictedNextPeriod);
            const moon = getMoonPhase(day);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                style={{
                  position: "relative",
                  minHeight: 52,
                  padding: "4px 2px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  cursor: "pointer",
                  border: isSelected ? `1.5px solid var(--rose-dust)` : isToday ? "1.5px solid var(--rose-dust-light)" : "none",
                  borderRadius: 8,
                  backgroundColor: phaseColor && inMonth ? `${phaseColor}13` : "transparent",
                  opacity: inMonth ? 1 : 0.3,
                  outline: "none",
                }}
              >
                {/* Day number */}
                <span style={{
                  fontSize: 11, fontWeight: isToday ? 700 : 500,
                  color: isToday ? "var(--rose-dust)" : "var(--plum)",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1,
                  marginTop: 4,
                }}>{format(day, "d")}</span>

                {/* Moon phase tiny */}
                <span style={{ fontSize: 7, lineHeight: 1, marginTop: 1, opacity: 0.5 }}>{moon}</span>

                {/* Indicator dots row */}
                <div style={{ display: "flex", gap: 2, marginTop: "auto", marginBottom: 3, alignItems: "center" }}>
                  {hasPeriod && <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#E57373", flexShrink: 0 }} />}
                  {isPredictedPeriod && <div style={{ width: 4, height: 4, borderRadius: "50%", border: "1px dashed #E57373", flexShrink: 0 }} />}
                  {hasSymptom && <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "var(--mauve-light)", flexShrink: 0 }} />}
                  {moodColor && <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: moodColor, flexShrink: 0 }} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
          {[
            { color: "#E57373", label: "Period" },
            { color: "var(--mauve-light)", label: "Symptom" },
            { color: "#81C784", label: "Mood" },
            { color: "#C4849A", label: "Phase tint", opacity: 0.3 },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: l.color, opacity: l.opacity || 1 }} />
              <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Phase key */}
        {profile?.last_period_start_date && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {Object.entries(PHASE_COLORS).map(([phase, color]) => (
              <div key={phase} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color + "40", border: `1px solid ${color}` }} />
                <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{phase}</span>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming section */}
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>Upcoming</p>

          {predictedNextPeriod && (
            <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 14, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Predicted next period</p>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>
                {format(predictedNextPeriod, "MMM d")}
              </span>
            </div>
          )}

          {upcomingEvents.length > 0 ? upcomingEvents.map(ev => (
            <div key={ev.id} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</p>
                {ev.location && <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 1 }}>{ev.location}</p>}
              </div>
              <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", flexShrink: 0, marginLeft: 8 }}>{ev.date}</span>
            </div>
          )) : (
            <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No upcoming events.</p>
              <a href={createPageUrl("Events")} style={{ fontSize: 12, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textDecoration: "none", display: "inline-block", marginTop: 6 }}>Browse events</a>
            </div>
          )}
        </div>
      </div>

      {/* Day detail sheet */}
      {selectedDate && (
        <DayDetailSheet
          date={selectedDate}
          checkin={selCheckin}
          symptoms={selSymptoms}
          events={selEvents}
          habits={selHabits}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
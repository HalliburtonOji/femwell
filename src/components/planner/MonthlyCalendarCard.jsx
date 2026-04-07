import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  addDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  isSameMonth, isSameDay, parseISO, differenceInDays, addMonths, subMonths
} from "date-fns";

// Unique seasonal photo per month — changes automatically
const MONTH_PHOTOS = {
  0:  "https://images.unsplash.com/photo-1478719059408-592965723cbc?w=900&q=80",  // Jan - snowy winter light
  1:  "https://images.unsplash.com/photo-1506816561089-6c5e24ae8a73?w=900&q=80",  // Feb - soft pink petals
  2:  "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=900&q=80",  // Mar - spring rain
  3:  "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=900&q=80",  // Apr - cherry blossom
  4:  "https://images.unsplash.com/photo-1490750967868-88df5691cc2b?w=900&q=80",  // May - wildflowers
  5:  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80",  // Jun - lush green forest
  6:  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",  // Jul - beach horizon
  7:  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&q=80",  // Aug - golden sunflowers
  8:  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",  // Sep - warm amber tones
  9:  "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=900&q=80",  // Oct - autumn leaves
  10: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80",  // Nov - misty moody
  11: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80",  // Dec - winter cozy
};

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
  const day = (diff % cycleLen) + 1;
  if (day <= periodLen) return "menstrual";
  if (day <= 13) return "follicular";
  if (day <= 16) return "ovulatory";
  return "luteal";
}

function MonthCard({ month, today, data, profile, onDayPress, isCurrentMonth, monthRef }) {
  const photo = MONTH_PHOTOS[month.getMonth()];
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let d = gridStart;
  while (d <= gridEnd) { days.push(new Date(d)); d = addDays(d, 1); }

  const predictedNextPeriod = (() => {
    if (!profile?.last_period_start_date || !profile?.cycle_avg_length) return null;
    const last = parseISO(profile.last_period_start_date);
    return addDays(last, profile.cycle_avg_length);
  })();

  return (
    <div
      ref={monthRef}
      style={{
        position: "relative",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: isCurrentMonth
          ? "0 24px 60px rgba(42,32,53,0.28), 0 4px 20px rgba(42,32,53,0.15)"
          : "0 12px 40px rgba(42,32,53,0.16), 0 2px 10px rgba(42,32,53,0.08)",
        marginBottom: 16,
        transform: isCurrentMonth ? "scale(1)" : "scale(0.97)",
        transition: "transform 0.2s ease",
      }}
    >
      {/* Background photo */}
      <img
        src={photo}
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        onError={e => { e.target.style.display = "none"; }}
      />
      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(18,10,30,0.45) 0%, rgba(18,10,30,0.70) 40%, rgba(18,10,30,0.93) 100%)"
      }} />

      <div style={{ position: "relative", zIndex: 2, padding: "22px 14px 20px" }}>
        {/* Month header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <p style={{
            fontSize: 28, fontWeight: 700, color: "white",
            fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em", lineHeight: 1
          }}>
            {format(month, "MMMM")}
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", marginTop: 3 }}>
            {format(month, "yyyy")}
          </p>
          {isCurrentMonth && (
            <div style={{ display: "inline-block", marginTop: 6, backgroundColor: "rgba(196,132,154,0.35)", border: "1px solid rgba(196,132,154,0.6)", borderRadius: 9999, padding: "2px 12px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#ffc8d8", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Current Month</span>
            </div>
          )}
        </div>

        {/* Weekday headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 5 }}>
          {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.06em" }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {days.map((day, i) => {
            const ds = format(day, "yyyy-MM-dd");
            const inMonth = isSameMonth(day, month);
            const isToday = isSameDay(day, today);
            const phase = getCyclePhase(day, profile?.last_period_start_date, profile?.cycle_avg_length || 28, profile?.period_length || 5);
            const phaseColor = phase ? PHASE_COLORS[phase] : null;

            // Indicators
            const hasPeriod = data.cycleEvents[ds]?.some(e => e.type === "PeriodStart");
            const hasSpotting = data.cycleEvents[ds]?.some(e => e.type === "Spotting");
            const hasCheckin = !!data.checkins[ds];
            const checkinMood = data.checkins[ds]?.mood;
            const hasSymptoms = (data.symptoms[ds]?.length || 0) > 0;
            const hasHabits = data.habitLogs[ds]?.some(h => h.completed);
            const hasTasks = (data.tasks[ds]?.length || 0) > 0;
            const hasMeds = (data.meds[ds]?.length || 0) > 0;
            const isPredicted = predictedNextPeriod && isSameDay(day, predictedNextPeriod);

            const moodColor = checkinMood
              ? checkinMood >= 4 ? "#81C784" : checkinMood >= 3 ? "#FFD54F" : "#E57373"
              : "rgba(255,255,255,0.5)";

            return (
              <button
                key={i}
                onClick={() => inMonth && onDayPress(day, { ds, checkin: data.checkins[ds] || null, symptoms: data.symptoms[ds] || [], habitLogs: data.habitLogs[ds] || [], tasks: data.tasks[ds] || [], meds: data.meds[ds] || [], cycleEvents: data.cycleEvents[ds] || [] })}
                style={{
                  minHeight: 50, padding: "4px 2px 3px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  cursor: inMonth ? "pointer" : "default",
                  borderRadius: 10,
                  background: isToday
                    ? "rgba(255,255,255,0.25)"
                    : phaseColor && inMonth ? `${phaseColor}22` : "rgba(255,255,255,0.04)",
                  border: isToday ? "1.5px solid rgba(255,255,255,0.7)" : "1px solid rgba(255,255,255,0.06)",
                  opacity: inMonth ? 1 : 0.15,
                  outline: "none",
                  transition: "background 0.15s",
                }}
              >
                <span style={{
                  fontSize: 12, fontWeight: isToday ? 800 : 400,
                  color: isToday ? "white" : "rgba(255,255,255,0.85)",
                  fontFamily: "'Inter', sans-serif", lineHeight: 1,
                }}>{format(day, "d")}</span>
                <span style={{ fontSize: 7, lineHeight: 1, marginTop: 1, opacity: 0.3 }}>{getMoonPhase(day)}</span>

                {/* Indicator dots row */}
                <div style={{ display: "flex", gap: 1.5, marginTop: 2, flexWrap: "wrap", justifyContent: "center", minHeight: 8 }}>
                  {hasPeriod && <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#ff8fab", flexShrink: 0 }} />}
                  {hasSpotting && <div style={{ width: 3, height: 3, borderRadius: "50%", border: "1px solid #ff8fab", flexShrink: 0 }} />}
                  {isPredicted && !hasPeriod && <div style={{ width: 4, height: 4, borderRadius: "50%", border: "1.5px dashed #ff8fab", flexShrink: 0 }} />}
                  {hasCheckin && <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: moodColor, flexShrink: 0 }} />}
                  {hasSymptoms && <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#FFB347", flexShrink: 0 }} />}
                  {hasHabits && <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#81C784", flexShrink: 0 }} />}
                  {hasTasks && <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#FFD700", flexShrink: 0 }} />}
                  {hasMeds && <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#CE93D8", flexShrink: 0 }} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { color: "#ff8fab", label: "Period" },
            { color: "#81C784", label: "Mood/Check-in" },
            { color: "#FFB347", label: "Symptoms" },
            { color: "#81C784", label: "Habits", border: false },
            { color: "#FFD700", label: "Tasks" },
            { color: "#CE93D8", label: "Meds" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Phase key */}
        {profile?.last_period_start_date && (
          <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {Object.entries(PHASE_COLORS).map(([phase, color]) => (
              <div key={phase} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: color + "44", border: `1px solid ${color}70` }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{phase}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MonthlyCalendarCard({ userId, profile, onDayPress, refreshKey }) {
  const today = new Date();
  // Show 3 months back, current, 4 months forward = 8 months total
  const months = Array.from({ length: 8 }, (_, i) => addMonths(startOfMonth(today), i - 3));

  const [data, setData] = useState({
    checkins: {}, symptoms: {}, habitLogs: {}, tasks: {}, cycleEvents: {}, meds: {}
  });
  const [loaded, setLoaded] = useState(false);
  const currentMonthRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    setLoaded(false);
    (async () => {
      const [checkins, symptoms, cycleEvents, habits, tasks, meds] = await Promise.all([
        base44.entities.DailyCheckins.filter({ user_id: userId }, "-date", 600),
        base44.entities.SymptomLogs.filter({ user_id: userId }, "-date", 600),
        base44.entities.CycleEvents.filter({ user_id: userId }, "-date", 400),
        base44.entities.HabitLogs.filter({ user_id: userId }, "-date", 600),
        base44.entities.PersonalTasks.filter({ user_id: userId }, "-date", 400),
        base44.entities.MedicationLogs.filter({ user_id: userId }, "-date", 400),
      ]);

      const toMap = (arr, dateKey = "date") => {
        const map = {};
        arr.forEach(item => {
          const d = item[dateKey];
          if (!map[d]) map[d] = [];
          map[d].push(item);
        });
        return map;
      };

      setData({
        checkins: Object.fromEntries(checkins.map(c => [c.date, c])),
        symptoms: toMap(symptoms),
        habitLogs: toMap(habits),
        tasks: toMap(tasks),
        cycleEvents: toMap(cycleEvents),
        meds: toMap(meds),
      });
      setLoaded(true);
    })();
  }, [userId, refreshKey]);

  useEffect(() => {
    if (loaded && currentMonthRef.current) {
      setTimeout(() => {
        currentMonthRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div style={{ width: 24, height: 24, border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {months.map((month, i) => {
        const isCurrentMonth = isSameMonth(month, today);
        return (
          <MonthCard
            key={i}
            month={month}
            today={today}
            data={data}
            profile={profile}
            onDayPress={onDayPress}
            isCurrentMonth={isCurrentMonth}
            monthRef={isCurrentMonth ? currentMonthRef : null}
          />
        );
      })}
    </div>
  );
}
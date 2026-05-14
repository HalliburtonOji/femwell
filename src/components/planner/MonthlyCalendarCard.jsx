import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  addDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  isSameMonth, isSameDay, parseISO, differenceInDays, addMonths, subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PHASE_COLORS = {
  menstrual: "#C4849A", follicular: "#7A9E8E", ovulatory: "#B89E6A", luteal: "#8A7E88",
};

const MONTH_PHOTOS = {
  0: "https://images.unsplash.com/photo-1478719059408-592965723cbc?w=900&q=80",
  1: "https://images.unsplash.com/photo-1506816561089-6c5e24ae8a73?w=900&q=80",
  2: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=900&q=80",
  3: "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=900&q=80",
  4: "https://images.unsplash.com/photo-1490750967868-88df5691cc2b?w=900&q=80",
  5: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80",
  6: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80",
  7: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&q=80",
  8: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
  9: "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=900&q=80",
  10: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80",
  11: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80",
};

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

function MonthView({ month, today, data, profile, onDayPress }) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const photo = MONTH_PHOTOS[month.getMonth()];
  const isCurrentMonth = isSameMonth(month, today);

  const predictedNextPeriod = (() => {
    if (!profile?.last_period_start_date || !profile?.cycle_avg_length) return null;
    return addDays(parseISO(profile.last_period_start_date), profile.cycle_avg_length);
  })();

  const days = [];
  let d = gridStart;
  while (d <= gridEnd) { days.push(new Date(d)); d = addDays(d, 1); }

  return (
    <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(42,32,53,0.28)" }}>
      <img src={photo} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} onError={e => { e.target.style.display = "none"; }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(18,10,30,0.45) 0%, rgba(18,10,30,0.70) 40%, rgba(18,10,30,0.93) 100%)" }} />

      <div style={{ position: "relative", zIndex: 2, padding: "22px 14px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: "white", fontFamily: "'Fraunces', serif", letterSpacing: "-0.02em", lineHeight: 1 }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 5 }}>
          {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.06em" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {days.map((day, i) => {
            const ds = format(day, "yyyy-MM-dd");
            const inMonth = isSameMonth(day, month);
            const isToday = isSameDay(day, today);
            const phase = getCyclePhase(day, profile?.last_period_start_date, profile?.cycle_avg_length || 28, profile?.period_length || 5);
            const phaseColor = phase ? PHASE_COLORS[phase] : null;
            const hasPeriod = data.cycleEvents[ds]?.some(e => e.type === "PeriodStart");
            const hasCheckin = !!data.checkins[ds];
            const checkinMood = data.checkins[ds]?.mood;
            const hasSymptoms = (data.symptoms[ds]?.length || 0) > 0;
            const isPredicted = predictedNextPeriod && isSameDay(day, predictedNextPeriod);
            const moodColor = checkinMood ? (checkinMood >= 4 ? "#81C784" : checkinMood >= 3 ? "#FFD54F" : "#E57373") : "rgba(255,255,255,0.5)";

            return (
              <button key={i} onClick={() => inMonth && onDayPress(day, { ds, checkin: data.checkins[ds] || null, symptoms: data.symptoms[ds] || [], habitLogs: data.habitLogs[ds] || [], tasks: data.tasks[ds] || [], meds: data.meds[ds] || [], cycleEvents: data.cycleEvents[ds] || [] })}
                style={{ minHeight: 50, padding: "4px 2px 3px", display: "flex", flexDirection: "column", alignItems: "center", cursor: inMonth ? "pointer" : "default", borderRadius: 10,
                  background: isToday ? "rgba(255,255,255,0.25)" : phaseColor && inMonth ? `${phaseColor}22` : "rgba(255,255,255,0.04)",
                  border: isToday ? "1.5px solid rgba(255,255,255,0.7)" : "1px solid rgba(255,255,255,0.06)",
                  opacity: inMonth ? 1 : 0.15, outline: "none" }}>
                <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 400, color: isToday ? "white" : "rgba(255,255,255,0.85)", fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>{format(day, "d")}</span>
                <div style={{ display: "flex", gap: 1.5, marginTop: 3, flexWrap: "wrap", justifyContent: "center", minHeight: 8 }}>
                  {hasPeriod && <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#ff8fab" }} />}
                  {isPredicted && !hasPeriod && <div style={{ width: 4, height: 4, borderRadius: "50%", border: "1.5px dashed #ff8fab" }} />}
                  {hasCheckin && <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: moodColor }} />}
                  {hasSymptoms && <div style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#FFB347" }} />}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
          {[{ color: "#ff8fab", label: "Period" }, { color: "#81C784", label: "Mood" }, { color: "#FFB347", label: "Symptoms" }].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: l.color }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MonthlyCalendarCard({ userId, profile, onDayPress, refreshKey }) {
  const today = new Date();
  const [currentOffset, setCurrentOffset] = useState(0); // 0 = current month
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [data, setData] = useState({ checkins: {}, symptoms: {}, habitLogs: {}, tasks: {}, cycleEvents: {}, meds: {} });
  const [loaded, setLoaded] = useState(false);

  const currentMonth = addMonths(startOfMonth(today), currentOffset);
  const prevMonth = addMonths(currentMonth, -1);
  const nextMonth = addMonths(currentMonth, 1);

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
        arr.forEach(item => { const d = item[dateKey]; if (!map[d]) map[d] = []; map[d].push(item); });
        return map;
      };
      setData({
        checkins: Object.fromEntries(checkins.map(c => [c.date, c])),
        symptoms: toMap(symptoms), habitLogs: toMap(habits), tasks: toMap(tasks), cycleEvents: toMap(cycleEvents), meds: toMap(meds),
      });
      setLoaded(true);
    })();
  }, [userId, refreshKey]);

  const goNext = () => { setDirection(1); setCurrentOffset(o => o + 1); };
  const goPrev = () => { setDirection(-1); setCurrentOffset(o => o - 1); };
  const goToday = () => { setDirection(currentOffset < 0 ? 1 : -1); setCurrentOffset(0); };

  if (!loaded) return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ width: 24, height: 24, border: "2px solid var(--rose-dust-light)", borderTopColor: "var(--rose-dust)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div>
      {/* Navigation controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "0 4px" }}>
        <button onClick={goPrev} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronLeft style={{ width: 16, height: 16, color: "var(--plum)" }} />
        </button>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {/* Deck indicator dots */}
          {[-1, 0, 1].map(offset => (
            <div key={offset} style={{ width: offset === 0 ? 20 : 6, height: 6, borderRadius: 9999, backgroundColor: offset === 0 ? "var(--rose-dust)" : "var(--border)", transition: "all 0.3s" }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {currentOffset !== 0 && (
            <button onClick={goToday} style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 9999, padding: "4px 10px", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              Today
            </button>
          )}
          <button onClick={goNext} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronRight style={{ width: 16, height: 16, color: "var(--plum)" }} />
          </button>
        </div>
      </div>

      {/* Deck — stacked shadow cards behind + animated front card */}
      <div style={{ position: "relative" }}>
        {/* Shadow cards */}
        <div style={{ position: "absolute", top: 10, left: 10, right: -10, bottom: -10, borderRadius: 28, backgroundColor: "rgba(42,32,53,0.12)", zIndex: 0 }} />
        <div style={{ position: "absolute", top: 5, left: 5, right: -5, bottom: -5, borderRadius: 28, backgroundColor: "rgba(42,32,53,0.18)", zIndex: 1 }} />

        {/* Animated front card */}
        <div style={{ position: "relative", zIndex: 2, overflow: "hidden", borderRadius: 28 }}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentOffset}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <MonthView
                month={currentMonth}
                today={today}
                data={data}
                profile={profile}
                onDayPress={onDayPress}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Month preview strip */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, padding: "0 4px" }}>
        <button onClick={goPrev} style={{ fontSize: 12, color: "var(--mauve)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
          ← {format(prevMonth, "MMMM")}
        </button>
        <button onClick={goNext} style={{ fontSize: 12, color: "var(--mauve)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
          {format(nextMonth, "MMMM")} →
        </button>
      </div>
    </div>
  );
}
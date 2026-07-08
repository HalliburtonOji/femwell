import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  addDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  isSameMonth, isSameDay, parseISO, differenceInDays, addMonths, subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { T, SERIF, UI, SCRIPT } from "@/components/journal/Editorial";

const OX = "#7A1A12"; // oxblood — the app-wide heading colour
// on-brand phase washes (crimson period · sage follicular/fertile · gold ovulatory · plum luteal)
const PHASE_COLORS = {
  menstrual: "#BC2E27", follicular: "#8FAF8F", ovulatory: "#A8893F", luteal: "#8E6E8E",
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
  const isCurrentMonth = isSameMonth(month, today);

  const predictedNextPeriod = (() => {
    if (!profile?.last_period_start_date || !profile?.cycle_avg_length) return null;
    return addDays(parseISO(profile.last_period_start_date), profile.cycle_avg_length);
  })();

  const days = [];
  let d = gridStart;
  while (d <= gridEnd) { days.push(new Date(d)); d = addDays(d, 1); }

  // GO-LIVE 2026-07: on-brand cream card chrome (was a per-month Unsplash photo + dark
  // overlay + white text). Same data + onDayPress contract — every caller unchanged.
  return (
    <div style={{
      position: "relative", overflow: "hidden", borderRadius: 20,
      background: `linear-gradient(165deg, ${T.paperHi} 0%, ${OX}10 100%)`,
      border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${OX}`,
      boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
    }}>
      <div style={{ position: "relative", zIndex: 2, padding: "18px 15px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <p style={{ fontFamily: SCRIPT, fontSize: 40, fontWeight: 400, color: OX, lineHeight: 0.95, margin: 0 }}>
            {format(month, "MMMM")}
          </p>
          <p style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gold, marginTop: 3 }}>
            {format(month, "yyyy")}{isCurrentMonth ? " · your month" : ""}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 5 }}>
          {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 9.5, fontWeight: 800, color: T.gold, letterSpacing: "0.04em" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
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
            const moodColor = checkinMood ? (checkinMood >= 4 ? "#8FAF8F" : checkinMood >= 3 ? "#A8893F" : "#BC2E27") : T.sage;

            return (
              <button key={i} onClick={() => inMonth && onDayPress(day, { ds, checkin: data.checkins[ds] || null, symptoms: data.symptoms[ds] || [], habitLogs: data.habitLogs[ds] || [], tasks: data.tasks[ds] || [], meds: data.meds[ds] || [], cycleEvents: data.cycleEvents[ds] || [] })}
                style={{ minHeight: 48, padding: "4px 2px 3px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: inMonth ? "pointer" : "default", borderRadius: 11,
                  background: isToday ? "rgba(122,26,18,0.06)" : phaseColor && inMonth ? `${phaseColor}20` : "transparent",
                  border: isToday ? `1.8px solid ${OX}` : "1px solid transparent",
                  boxShadow: isToday ? "0 1px 5px rgba(122,26,18,0.14)" : "none",
                  opacity: inMonth ? 1 : 0.14, outline: "none" }}>
                <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: isToday ? 700 : 500, color: isToday ? OX : T.ink, lineHeight: 1 }}>{format(day, "d")}</span>
                <div style={{ display: "flex", gap: 2, marginTop: 3, flexWrap: "wrap", justifyContent: "center", minHeight: 7 }}>
                  {hasPeriod && <div style={{ width: 4.5, height: 4.5, borderRadius: "50%", backgroundColor: "#BC2E27" }} />}
                  {isPredicted && !hasPeriod && <div style={{ width: 4.5, height: 4.5, borderRadius: "50%", border: "1.5px dashed #BC2E27" }} />}
                  {hasCheckin && <div style={{ width: 4.5, height: 4.5, borderRadius: "50%", backgroundColor: moodColor }} />}
                  {hasSymptoms && <div style={{ width: 3.5, height: 3.5, borderRadius: "50%", backgroundColor: "#A8893F" }} />}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 13, paddingTop: 11, borderTop: `1px solid ${T.gold}44`, justifyContent: "center", flexWrap: "wrap" }}>
          {[{ color: "#BC2E27", label: "Period" }, { color: "#8FAF8F", label: "Mood" }, { color: "#A8893F", label: "Symptoms" }].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: l.color }} />
              <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 600, color: T.muted }}>{l.label}</span>
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
            <button onClick={goToday} style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 9999, padding: "4px 10px", cursor: "pointer", }}>
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
        <button onClick={goPrev} style={{ fontSize: 12, color: "var(--mauve)", background: "none", border: "none", cursor: "pointer", }}>
          ← {format(prevMonth, "MMMM")}
        </button>
        <button onClick={goNext} style={{ fontSize: 12, color: "var(--mauve)", background: "none", border: "none", cursor: "pointer", }}>
          {format(nextMonth, "MMMM")} →
        </button>
      </div>
    </div>
  );
}
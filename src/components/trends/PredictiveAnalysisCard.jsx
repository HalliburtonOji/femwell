import { useMemo } from "react";
import { addDays, format, parseISO, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const PHASE_COLORS = {
  menstrual:  "#C4849A",
  follicular: "#7A9E8E",
  ovulatory:  "#B89E6A",
  luteal:     "#8A7E88",
};

const PHASE_LABELS = {
  menstrual:  "Menstrual",
  follicular: "Follicular",
  ovulatory:  "Ovulatory",
  luteal:     "Luteal",
};

// Known symptom burden per phase (based on population data)
const PHASE_SYMPTOM_BURDEN = {
  menstrual:  0.85,
  luteal:     0.75,
  ovulatory:  0.4,
  follicular: 0.25,
};

const PHASE_TRANSITIONS = {
  follicular_to_ovulatory: {
    label: "Ovulation approaching",
    risk: "medium",
    symptoms: ["Energy surge then crash", "Heightened sensitivity", "Possible chin breakout"],
  },
  ovulatory_to_luteal: {
    label: "Luteal phase starting",
    risk: "high",
    symptoms: ["Bloating", "Mood shifts", "Increased appetite", "Skin oiliness"],
  },
  luteal_to_menstrual: {
    label: "Period approaching",
    risk: "high",
    symptoms: ["Cramps", "Lower back pain", "Fatigue", "Breast tenderness"],
  },
  menstrual_to_follicular: {
    label: "Recovery window opening",
    risk: "low",
    symptoms: ["Energy returning", "Mood lifting", "Skin clearing"],
  },
};

const SELF_CARE_BY_PHASE = {
  menstrual: {
    sessions: [{ title: "Gentle Yin Flow", type: "WORKOUT", route: "/Explore?type=WORKOUT" }, { title: "Body Scan Meditation", type: "MEDITATION", route: "/Explore?type=MEDITATION" }],
    nutrition: ["Iron-rich foods: lentils, leafy greens, dark chocolate", "Anti-inflammatory: turmeric, ginger, omega-3s", "Warm, easy-to-digest meals"],
    content: [{ label: "Menstrual phase guide", route: "/Lifestyle?tab=femwell" }],
  },
  follicular: {
    sessions: [{ title: "Energising HIIT", type: "WORKOUT", route: "/Explore?type=WORKOUT" }, { title: "Breathwork Focus", type: "BREATHWORK", route: "/Explore?type=BREATHWORK" }],
    nutrition: ["Fermented foods for oestrogen metabolism", "Cruciferous vegetables: broccoli, cabbage", "High-protein breakfasts"],
    content: [{ label: "This week's books", route: "/Lifestyle?tab=read&filter=books" }],
  },
  ovulatory: {
    sessions: [{ title: "Peak Performance Workout", type: "WORKOUT", route: "/Explore?type=WORKOUT" }, { title: "5-Minute Grounding", type: "BREATHWORK", route: "/Explore?type=BREATHWORK" }],
    nutrition: ["Antioxidant-rich: berries, colourful veg", "Zinc-rich foods: pumpkin seeds, chickpeas", "Stay well-hydrated"],
    content: [{ label: "Explore trending reads", route: "/Lifestyle?tab=read" }],
  },
  luteal: {
    sessions: [{ title: "Restorative Yoga", type: "WORKOUT", route: "/Explore?type=WORKOUT" }, { title: "Evening Wind-Down", type: "MEDITATION", route: "/Explore?type=MEDITATION" }],
    nutrition: ["Magnesium: nuts, seeds, dark chocolate", "Complex carbs for serotonin: oats, sweet potato", "Reduce caffeine and alcohol"],
    content: [{ label: "Mindfulness & self care", route: "/Lifestyle?tab=for_you" }],
  },
};

function getPhaseFromDay(cycleDay, cycleLen) {
  if (cycleDay <= 5) return "menstrual";
  if (cycleDay <= Math.round(cycleLen * 0.46)) return "follicular";
  if (cycleDay <= Math.round(cycleLen * 0.57)) return "ovulatory";
  return "luteal";
}

function getDaysUntilTransition(currentDay, cycleLen) {
  const transitions = [
    { day: 5, from: "menstrual", to: "follicular" },
    { day: Math.round(cycleLen * 0.46), from: "follicular", to: "ovulatory" },
    { day: Math.round(cycleLen * 0.57), from: "ovulatory", to: "luteal" },
    { day: cycleLen, from: "luteal", to: "menstrual" },
  ];
  for (const t of transitions) {
    if (currentDay <= t.day) {
      return { daysUntil: t.day - currentDay + 1, from: t.from, to: t.to };
    }
  }
  return { daysUntil: cycleLen - currentDay + transitions[0].day + 1, from: "luteal", to: "menstrual" };
}

// Build 14-day forecast
function buildForecast(lastPeriodDate, cycleLen) {
  const today = new Date();
  const last = parseISO(lastPeriodDate);
  const daysSince = differenceInDays(today, last);
  const currentDay = (daysSince % cycleLen) + 1;

  return Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, i);
    const dayOfCycle = ((currentDay + i - 1) % cycleLen) + 1;
    const phase = getPhaseFromDay(dayOfCycle, cycleLen);
    const burden = PHASE_SYMPTOM_BURDEN[phase];
    return { date, dayOfCycle, phase, burden, daysFromNow: i };
  });
}

// Compute phase-specific average scores from historical checkins
function computePhaseAverages(checkins, lastPeriodDate, cycleLen) {
  const byPhase = { menstrual: [], follicular: [], ovulatory: [], luteal: [] };
  checkins.forEach(c => {
    if (!c.date) return;
    const diff = differenceInDays(parseISO(c.date), parseISO(lastPeriodDate));
    if (diff < 0) return;
    const day = (diff % cycleLen) + 1;
    const phase = getPhaseFromDay(day, cycleLen);
    const score = ((c.stress || 0) + (c.cramps || 0) + (c.bloating || 0) + (c.headache || 0)) / 4;
    if (score > 0) byPhase[phase].push(score);
  });
  const result = {};
  for (const [phase, vals] of Object.entries(byPhase)) {
    result[phase] = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
  }
  return result;
}

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", };

const card = {
  backgroundColor: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "20px", boxShadow: "var(--shadow-sm)",
};

export default function PredictiveAnalysisCard({ profile, checkins }) {
  const cycleLen = profile?.cycle_avg_length || 28;
  const lastPeriod = profile?.last_period_start_date;

  const { forecast, nextTransition, currentPhase, currentDay, phaseAvgs, upcomingHighDays } = useMemo(() => {
    if (!lastPeriod) return {};
    const today = new Date();
    const last = parseISO(lastPeriod);
    const daysSince = differenceInDays(today, last);
    const currentDay = (daysSince % cycleLen) + 1;
    const currentPhase = getPhaseFromDay(currentDay, cycleLen);
    const forecast = buildForecast(lastPeriod, cycleLen);
    const nextTransition = getDaysUntilTransition(currentDay, cycleLen);
    const phaseAvgs = computePhaseAverages(checkins, lastPeriod, cycleLen);
    const upcomingHighDays = forecast.filter(d => d.burden >= 0.7 && d.daysFromNow > 0 && d.daysFromNow <= 10);
    return { forecast, nextTransition, currentPhase, currentDay, phaseAvgs, upcomingHighDays };
  }, [profile, checkins]);

  if (!lastPeriod) {
    return (
      <div style={{ ...card, padding: "20px", marginBottom: "24px" }}>
        <p style={{ ...sLabel, marginBottom: "8px" }}>Predictive analysis</p>
        <p style={{ fontSize: "14px", color: "var(--plum)", marginBottom: "6px", fontWeight: 600 }}>
          No cycle data yet
        </p>
        <p style={{ fontSize: "13px", color: "var(--mauve)", lineHeight: 1.6 }}>
          Log your period start date in the Track tab to unlock cycle-based predictions.
        </p>
        <Link to={createPageUrl("Today")} style={{ display: "inline-block", marginTop: "12px", backgroundColor: "var(--plum)", color: "white", borderRadius: "9999px", padding: "8px 18px", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
          Log cycle data
        </Link>
      </div>
    );
  }

  const selfCare = SELF_CARE_BY_PHASE[currentPhase] || SELF_CARE_BY_PHASE.follicular;
  const nextKey = nextTransition ? `${nextTransition.from}_to_${nextTransition.to}` : null;
  const transitionInfo = nextKey ? PHASE_TRANSITIONS[nextKey] : null;

  return (
    <div style={{ marginBottom: "24px" }}>

      {/* Section label */}
      <div style={{ marginBottom: "16px" }}>
        <p style={{ ...sLabel, color: "var(--rose-dust)" }}>Predictive analysis</p>
        <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--plum)", marginTop: "3px" }}>
          Your next 14 days
        </p>
      </div>

      {/* 14-day forecast strip */}
      <div style={{ ...card, padding: "16px 20px", marginBottom: "12px", overflowX: "auto" }}>
        <style>{`.pred-scroll::-webkit-scrollbar{display:none}`}</style>
        <p style={{ ...sLabel, marginBottom: "12px" }}>Symptom forecast</p>
        <div className="pred-scroll" style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "none" }}>
          {forecast?.map((day, i) => {
            const isToday = i === 0;
            const isHigh = day.burden >= 0.7;
            const isMed = day.burden >= 0.4 && day.burden < 0.7;
            const barHeight = Math.round(day.burden * 44);
            return (
              <div key={i} style={{ flexShrink: 0, width: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ fontSize: "9px", color: isToday ? "var(--plum)" : "var(--mauve)", fontWeight: isToday ? 700 : 400 }}>
                  {isToday ? "Today" : format(day.date, "d")}
                </div>
                <div style={{ width: 28, height: 48, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <div style={{
                    width: "100%", height: `${barHeight}px`, borderRadius: "4px 4px 0 0",
                    backgroundColor: isHigh ? "var(--rose-dust)" : isMed ? "#B89E6A" : "var(--sage)",
                    opacity: isToday ? 1 : 0.75,
                    transition: "height 0.3s",
                  }} />
                </div>
                <div style={{ fontSize: "8px", color: PHASE_COLORS[day.phase], fontWeight: 600 }}>
                  {day.phase.slice(0, 3).toUpperCase()}
                </div>
                {isHigh && (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--rose-dust)" }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "16px", marginTop: "10px", flexWrap: "wrap" }}>
          {[{ color: "var(--rose-dust)", label: "High load" }, { color: "#B89E6A", label: "Moderate" }, { color: "var(--sage)", label: "Low load" }].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: l.color }} />
              <span style={{ fontSize: "10px", color: "var(--mauve)", }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming high-symptom alert */}
      {upcomingHighDays && upcomingHighDays.length > 0 && (
        <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: "20px", padding: "16px 20px", marginBottom: "12px" }}>
          <p style={{ ...sLabel, color: "var(--rose-dust)", marginBottom: "8px" }}>High-symptom days ahead</p>
          <p style={{ fontSize: "14px", color: "var(--plum)", lineHeight: 1.6 }}>
            Your {PHASE_LABELS[upcomingHighDays[0].phase].toLowerCase()} phase begins in{" "}
            <strong>{upcomingHighDays[0].daysFromNow} day{upcomingHighDays[0].daysFromNow !== 1 ? "s" : ""}</strong>.
            Based on your history, this is typically a higher-load window. Preparing now can make a real difference.
          </p>
          {upcomingHighDays.length > 1 && (
            <p style={{ fontSize: "12px", color: "var(--mauve)", marginTop: "6px" }}>
              {upcomingHighDays.length} high-load days in the next 10 days.
            </p>
          )}
        </div>
      )}

      {/* Next phase transition */}
      {transitionInfo && nextTransition && (
        <div style={{ ...card, padding: "16px 20px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: transitionInfo.risk === "high" ? "var(--rose-dust)" : transitionInfo.risk === "medium" ? "#B89E6A" : "var(--sage)", flexShrink: 0 }} />
            <p style={{ ...sLabel, color: transitionInfo.risk === "high" ? "var(--rose-dust)" : transitionInfo.risk === "medium" ? "#B89E6A" : "var(--sage)" }}>
              In {nextTransition.daysUntil} day{nextTransition.daysUntil !== 1 ? "s" : ""} — {transitionInfo.label}
            </p>
          </div>
          <p style={{ fontSize: "13px", color: "var(--plum)", fontWeight: 600, marginBottom: "8px" }}>
            Watch for: {transitionInfo.symptoms.slice(0, 2).join(" · ")}
          </p>
          {transitionInfo.symptoms.length > 2 && (
            <p style={{ fontSize: "12px", color: "var(--mauve)", }}>
              Also possible: {transitionInfo.symptoms.slice(2).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Personal history insight */}
      {phaseAvgs && Object.values(phaseAvgs).some(v => v !== null) && (
        <div style={{ ...card, padding: "16px 20px", marginBottom: "12px" }}>
          <p style={{ ...sLabel, marginBottom: "12px" }}>Your personal pattern</p>
          <div style={{ display: "flex", gap: "8px" }}>
            {["menstrual", "follicular", "ovulatory", "luteal"].map(phase => {
              const val = phaseAvgs[phase];
              return (
                <div key={phase} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ height: 40, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "4px" }}>
                    <div style={{
                      width: "100%", height: val != null ? `${Math.round((val / 10) * 40)}px` : "4px",
                      borderRadius: "4px 4px 0 0",
                      backgroundColor: phase === currentPhase ? PHASE_COLORS[phase] : PHASE_COLORS[phase] + "70",
                    }} />
                  </div>
                  <p style={{ fontSize: "8px", fontWeight: 700, color: PHASE_COLORS[phase], textTransform: "uppercase" }}>
                    {phase.slice(0, 3)}
                  </p>
                  <p style={{ fontSize: "10px", color: "var(--mauve)", }}>
                    {val != null ? `${val}/10` : "—"}
                  </p>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: "11px", color: "var(--mauve)", marginTop: "8px" }}>
            Average symptom load from your check-in history
          </p>
        </div>
      )}

      {/* Proactive self-care suggestions */}
      <div style={{ ...card, padding: "16px 20px", marginBottom: "12px" }}>
        <p style={{ ...sLabel, marginBottom: "12px" }}>Prepare now — {PHASE_LABELS[currentPhase]} phase</p>

        {/* Recommended sessions */}
        <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--plum)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sessions</p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          {selfCare.sessions.map((s, i) => (
            <Link key={i} to={s.route} style={{ display: "inline-block", backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)", borderRadius: "12px", padding: "8px 12px", textDecoration: "none" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--plum)", margin: 0 }}>{s.title}</p>
              <p style={{ fontSize: "10px", color: "var(--mauve)", marginTop: "2px" }}>{s.type}</p>
            </Link>
          ))}
        </div>

        {/* Nutrition */}
        <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--sage)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nutrition adjustments</p>
        <div style={{ marginBottom: "14px" }}>
          {selfCare.nutrition.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--sage)", flexShrink: 0, marginTop: 5 }} />
              <p style={{ fontSize: "12px", color: "var(--plum)", lineHeight: 1.5, margin: 0 }}>{tip}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--rose-dust)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recommended reading</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {selfCare.content.map((c, i) => (
            <Link key={i} to={c.route} style={{ display: "inline-block", backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: "9999px", padding: "6px 14px", textDecoration: "none" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--rose-dust)", margin: 0 }}>{c.label}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
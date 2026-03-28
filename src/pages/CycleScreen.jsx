// Prompt 04 — Cycle Screen
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getCurrentPhase } from "../components/today/TodayHeader";
import { format, parseISO } from "date-fns";

const FLOW_CHIPS = ["Light", "Medium", "Heavy"];
const SYMPTOMS = ["Cramps", "Bloating", "Headache", "Fatigue", "Tender", "Nausea", "Other"];

const PHASE_DESCRIPTIONS = {
  menstrual: "Your body is shedding the uterine lining. Rest and gentle warmth support you most now. Iron-rich foods can help replenish energy.",
  follicular: "Oestrogen is rising and energy with it. This phase is ideal for starting new projects and pushing a little further physically.",
  ovulation: "You are at your peak. Energy, confidence, and communication are strongest now — lean into connection and activity.",
  luteal: "Progesterone dominates. Your body is winding down and preparing. Prioritise rest, nourishing food, and early sleep.",
};

const PHASE_TIPS = {
  menstrual: ["Rest often", "Warmth helps", "Iron-rich foods"],
  follicular: ["Start something new", "Push harder in workouts", "Creative work"],
  ovulation: ["Connect with others", "High-intensity training", "Important conversations"],
  luteal: ["Wind down early", "Nourishing meals", "Gentle movement"],
};

export default function CycleScreen() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cycleEvents, setCycleEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flowLevel, setFlowLevel] = useState("Medium");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, events] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }),
        base44.entities.CycleEvents.filter({ user_id: u.id }),
      ]);
      if (profiles[0]) setProfile(profiles[0]);
      setCycleEvents(events);
      setLoading(false);
    })();
  }, []);

  const phaseInfo = profile?.last_period_start_date
    ? getCurrentPhase(profile.last_period_start_date, profile.cycle_avg_length || 28)
    : null;

  const cycleAvg = profile?.cycle_avg_length || 28;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const getPhaseForDate = (dateStr) => {
    if (!profile?.last_period_start_date) return null;
    const phase = getCurrentPhase(profile.last_period_start_date, cycleAvg);
    return phase;
  };

  const PHASE_COLOURS = {
    menstrual: "#E05C7A",
    follicular: "#7ECBA1",
    ovulation: "#F5C842",
    luteal: "#9B8AE0",
  };

  // Phase arc positions (%)
  const PHASE_SEGMENTS = [
    { phase: "menstrual", label: "M", width: 18, colour: "#E05C7A" },
    { phase: "follicular", label: "F", width: 28, colour: "#7ECBA1" },
    { phase: "ovulation", label: "O", width: 10, colour: "#F5C842" },
    { phase: "luteal", label: "L", width: 44, colour: "#9B8AE0" },
  ];

  const currentDayPosition = phaseInfo
    ? ((phaseInfo.cycleDay - 1) / cycleAvg) * 100
    : 0;

  // Prediction chips
  const nextPeriodDays = phaseInfo
    ? cycleAvg - phaseInfo.cycleDay + 1
    : null;

  // Calendar helpers
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  const monthStr = format(currentMonth, "MMMM yyyy");

  const loggedDates = new Set(cycleEvents.map((e) => e.date));

  const getDotColour = (dayNum) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
    const ds = d.toISOString().split("T")[0];
    if (loggedDates.has(ds)) return "#E05C7A";
    if (!phaseInfo || !profile?.last_period_start_date) return null;
    const p = getCurrentPhase(profile.last_period_start_date, cycleAvg);
    return PHASE_COLOURS[p?.phase] || null;
  };

  const handleSaveLog = async () => {
    if (!user) return;
    setSaving(true);
    await base44.entities.CycleEvents.create({
      user_id: user.id,
      date: todayStr,
      type: "PeriodStart",
      flow_level: flowLevel.toLowerCase(),
      notes,
    });
    for (const s of selectedSymptoms) {
      await base44.entities.SymptomLogs.create({
        user_id: user.id,
        date: todayStr,
        symptom_type: s.toLowerCase(),
        severity: 3,
      });
    }
    const events = await base44.entities.CycleEvents.filter({ user_id: user.id });
    setCycleEvents(events);
    setSheetOpen(false);
    setFlowLevel("Medium");
    setSelectedSymptoms([]);
    setNotes("");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0C0C1A" }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "#242436", borderTopColor: "#C96B9E" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#0C0C1A", color: "#F2F2FF" }}>
      <div className="max-w-md mx-auto px-5 pt-12">
        {/* Phase Arc Strip */}
        <div className="mb-6">
          <div className="relative h-10 flex rounded-full overflow-hidden mb-3">
            {PHASE_SEGMENTS.map((seg) => (
              <div
                key={seg.phase}
                style={{ width: `${seg.width}%`, background: seg.colour, opacity: 0.7 }}
              />
            ))}
            {/* Position indicator */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${currentDayPosition}%`,
                transform: "translate(-50%, -50%)",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "white",
                boxShadow: "0 0 0 2px #0C0C1A",
                transition: "left 0.8s ease-out",
              }}
            />
          </div>
          <p className="text-center font-bold" style={{ fontSize: 24, letterSpacing: "-0.02em" }}>
            {phaseInfo ? `Day ${phaseInfo.cycleDay} of ${cycleAvg}` : "Set your cycle below"}
          </p>
        </div>

        {/* Prediction Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
          {nextPeriodDays && (
            <div
              style={{
                borderRadius: 999,
                padding: "10px 14px",
                fontSize: 12,
                background: "rgba(224,92,122,0.15)",
                border: "1px solid #E05C7A",
                color: "#E05C7A",
                whiteSpace: "nowrap",
              }}
            >
              Period in {nextPeriodDays} days
            </div>
          )}
          {phaseInfo && (
            <>
              <div
                style={{
                  borderRadius: 999,
                  padding: "10px 14px",
                  fontSize: 12,
                  background: "rgba(245,200,66,0.15)",
                  border: "1px solid #F5C842",
                  color: "#F5C842",
                  whiteSpace: "nowrap",
                }}
              >
                Cycle: {cycleAvg} days avg
              </div>
              <div
                style={{
                  borderRadius: 999,
                  padding: "10px 14px",
                  fontSize: 12,
                  background: "rgba(126,203,161,0.15)",
                  border: "1px solid #7ECBA1",
                  color: "#7ECBA1",
                  whiteSpace: "nowrap",
                }}
              >
                {phaseInfo.label} Phase
              </div>
            </>
          )}
        </div>

        {/* Calendar */}
        <div className="mb-6 p-4 rounded-2xl" style={{ background: "#13131F", border: "1px solid #2E2E45" }}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              style={{ color: "#8A8AAA", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
            >
              ‹
            </button>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#F2F2FF" }}>{monthStr}</p>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              style={{ color: "#8A8AAA", background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <p key={d} style={{ fontSize: 10, color: "#4A4A65", paddingBottom: 4 }}>{d}</p>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const ds = d.toISOString().split("T")[0];
              const isToday = ds === todayStr;
              const dotColor = getDotColour(day);
              const isLogged = loggedDates.has(ds);
              return (
                <div key={day} className="flex flex-col items-center gap-0.5 py-1">
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: isToday ? "2px solid #C96B9E" : "none",
                      fontSize: 12,
                      color: isToday ? "#C96B9E" : "#8A8AAA",
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    {day}
                  </div>
                  {dotColor && (
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: isLogged ? dotColor : "transparent",
                        border: isLogged ? "none" : `1px solid ${dotColor}`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Info Card */}
        {phaseInfo && (
          <div className="mb-6 p-4 rounded-2xl" style={{ background: "#13131F", border: "1px solid #2E2E45" }}>
            <p className="font-bold mb-2" style={{ fontSize: 20, color: "#F2F2FF" }}>
              You are in {phaseInfo.label} phase
            </p>
            <p style={{ fontSize: 14, color: "#8A8AAA", lineHeight: 1.6, marginBottom: 16 }}>
              {PHASE_DESCRIPTIONS[phaseInfo.phase]}
            </p>
            <div className="flex flex-wrap gap-2">
              {PHASE_TIPS[phaseInfo.phase]?.map((tip) => (
                <span
                  key={tip}
                  style={{
                    borderRadius: 999,
                    padding: "8px 12px",
                    fontSize: 12,
                    background: "#1C1C2E",
                    border: "1px solid #242436",
                    color: "#8A8AAA",
                  }}
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-40"
        style={{ background: "#C96B9E" }}
      >
        <span style={{ color: "white", fontSize: 28, lineHeight: 1, fontWeight: 300 }}>+</span>
      </button>

      {/* Bottom Sheet */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={(e) => e.target === e.currentTarget && setSheetOpen(false)}
        >
          <div
            className="w-full p-5 space-y-5"
            style={{ background: "#1C1C2E", borderRadius: "20px 20px 0 0" }}
          >
            <div
              style={{ width: 40, height: 4, borderRadius: 999, background: "#2E2E45", margin: "0 auto" }}
            />
            <p style={{ fontSize: 18, fontWeight: 700, color: "#F2F2FF" }}>Log today</p>

            <div>
              <p style={{ fontSize: 12, color: "#8A8AAA", marginBottom: 10 }}>Flow</p>
              <div className="flex gap-2">
                {FLOW_CHIPS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFlowLevel(f)}
                    style={{
                      flex: 1,
                      borderRadius: 999,
                      padding: "10px 0",
                      fontSize: 13,
                      border: flowLevel === f ? "2px solid #C96B9E" : "1px solid #242436",
                      background: flowLevel === f ? "rgba(201,107,158,0.15)" : "#13131F",
                      color: flowLevel === f ? "#F2F2FF" : "#8A8AAA",
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 12, color: "#8A8AAA", marginBottom: 10 }}>Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map((s) => {
                  const sel = selectedSymptoms.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() =>
                        setSelectedSymptoms((prev) =>
                          sel ? prev.filter((x) => x !== s) : [...prev, s]
                        )
                      }
                      style={{
                        borderRadius: 999,
                        padding: "8px 14px",
                        fontSize: 12,
                        border: sel ? "2px solid #C96B9E" : "1px solid #242436",
                        background: sel ? "rgba(201,107,158,0.15)" : "#13131F",
                        color: sel ? "#F2F2FF" : "#8A8AAA",
                        cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full resize-none"
              style={{
                background: "#13131F",
                border: "1px solid #2E2E45",
                borderRadius: 12,
                padding: 12,
                fontSize: 14,
                color: "#F2F2FF",
                outline: "none",
              }}
            />

            <button
              className="w-full btn-primary"
              style={{ height: 52 }}
              onClick={handleSaveLog}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save log"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
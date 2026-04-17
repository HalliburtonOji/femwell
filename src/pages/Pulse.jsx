import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";

import { subMonths, subDays, parseISO, differenceInDays, format } from "date-fns";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import HealthOverviewSection from "../components/trends/HealthOverviewSection";
import AIHealthSummaryCard from "../components/trends/AIHealthSummaryCard";
import PredictiveAnalysisCard from "../components/trends/PredictiveAnalysisCard";
import PeriodCountdownCard from "../components/pulse/PeriodCountdownCard";
import PatternInsightCards from "../components/pulse/PatternInsightCards";
import ConditionPulseCards from "../components/conditions/ConditionPulseCards";
import WearableWeekCard from "../components/pulse/WearableWeekCard";

const PHASES = [
  { key: "Menstrual",  label: "Menstrual",  color: "#f43f5e", days: "Days 1–5"  },
  { key: "Follicular", label: "Follicular", color: "#fb923c", days: "Days 6–13" },
  { key: "Ovulatory",  label: "Ovulatory",  color: "#a78bfa", days: "Days 14–16"},
  { key: "Luteal",     label: "Luteal",     color: "#34d399", days: "Days 17+"  },
];

const CHECKIN_METRICS = [
  { id: "cramps",            label: "Cramps",             color: "#f43f5e" },
  { id: "mood",              label: "Mood",               color: "#f472b6" },
  { id: "energy",            label: "Energy",             color: "#fb923c" },
  { id: "stress",            label: "Stress",             color: "#a78bfa" },
  { id: "bloating",          label: "Bloating",           color: "#6ee7b7" },
  { id: "headache",          label: "Headache",           color: "#93c5fd" },
  { id: "breast_tenderness", label: "Breast Tenderness",  color: "#c084fc" },
  { id: "sleep_quality",     label: "Sleep Quality",      color: "#34d399" },
  { id: "pain",              label: "Pain",               color: "#ef4444" },
];

function getPhase(dayOfCycle) {
  if (!dayOfCycle || dayOfCycle <= 0) return null;
  if (dayOfCycle <= 5)  return "Menstrual";
  if (dayOfCycle <= 13) return "Follicular";
  if (dayOfCycle <= 16) return "Ovulatory";
  return "Luteal";
}

function getDayOfCycle(dateStr, periodStartDates) {
  const date = parseISO(dateStr);
  const pastStarts = periodStartDates
    .map((d) => parseISO(d))
    .filter((d) => d <= date)
    .sort((a, b) => b - a);
  if (!pastStarts.length) return null;
  return differenceInDays(date, pastStarts[0]) + 1;
}

function renderInlineMarkdown(line) {
  const parts = line.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function MarkdownBlock({ text }) {
  const lines = String(text || "").split("\n").filter(Boolean);
  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        if (line.startsWith("## ")) {
          return <p key={index} className="text-base font-bold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{line.replace(/^##\s*/, "")}</p>;
        }
        if (line.startsWith("# ")) {
          return <p key={index} className="text-sm font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{line.replace(/^#\s*/, "")}</p>;
        }
        return <p key={index} className="text-sm leading-relaxed" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

export default function Pulse() {
  // shared
  const [user, setUser]                 = useState(null);
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);

  // weekly insight state
  const [weeklyItems, setWeeklyItems]   = useState([]);
  const [weeklyIndex, setWeeklyIndex]   = useState(0);
  const [weekCheckins, setWeekCheckins] = useState([]);
  const [weekStats, setWeekStats]       = useState({ journalCount: 0, habitCount: 0, mealCount: 0 });

  // trends state
  const [timeRange, setTimeRange]           = useState(3);
  const [dataSource, setDataSource]         = useState("checkins");
  const [selectedMetric, setSelectedMetric] = useState("cramps");
  const [cycleEvents, setCycleEvents]       = useState([]);
  const [checkins, setCheckins]             = useState([]);
  const [symptomLogs, setSymptomLogs]       = useState([]);
  const [symptomTypes, setSymptomTypes]     = useState([]);
  const [habitLogs, setHabitLogs]           = useState([]);
  const [habitNames, setHabitNames]         = useState([]);

  useEffect(() => {
    (async () => {
      try {
      const u = await base44.auth.me();
      setUser(u);
      const userProfiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
      setProfile(userProfiles[0] || null);

      const [events, ckins, slogs, hlogs, journalEntries, mealLogs, wiRecords] = await Promise.all([
        base44.entities.CycleEvents.filter({ user_id: u.id }).catch(() => []),
        base44.entities.DailyCheckins.filter({ user_id: u.id }).catch(() => []),
        base44.entities.SymptomLogs.filter({ user_id: u.id }).catch(() => []),
        base44.entities.HabitLogs.filter({ user_id: u.id }, "-date", 250).catch(() => []),
        base44.entities.JournalEntries.filter({ user_id: u.id }, "-created_date", 30).catch(() => []),
        base44.entities.MealLog.filter({ user_id: u.id }, "-logged_at", 100).catch(() => []),
        base44.entities.WeeklyInsights.filter({ user_id: u.id }, "-week_start", 12).catch(() => []),
      ]);

      const wCutoffDate = format(subDays(new Date(), 7), "yyyy-MM-dd");
      const weekJournalCount = journalEntries.filter(e => (e.session_date || e.created_date?.split('T')[0] || '') >= wCutoffDate).length;
      const weekHabitCount = hlogs.filter(h => h.date >= wCutoffDate && h.completed === true).length;
      const weekMealCount = mealLogs.filter(m => (m.logged_at || m.created_date || '') >= wCutoffDate + 'T00:00:00').length;
      setWeekStats({ journalCount: weekJournalCount, habitCount: weekHabitCount, mealCount: weekMealCount });

      setWeeklyItems(wiRecords);
      const wCutoff = format(subDays(new Date(), 7), "yyyy-MM-dd");
      setWeekCheckins(ckins.filter(c => c.date >= wCutoff));

      setCycleEvents(events);
      setCheckins(ckins);
      setSymptomLogs(slogs);
      setSymptomTypes([...new Set(slogs.map(s => s.symptom_type).filter(Boolean))]);
      setHabitLogs(hlogs);
      setHabitNames([...new Set(hlogs.map(h => h.habit_type || h.habit_name).filter(Boolean))]);
      } catch (err) {
        console.error("Pulse page init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const periodStarts = cycleEvents
    .filter((e) => e.event_type === "period_start")
    .map((e) => e.date)
    .sort();

  const cutoffDate = subMonths(new Date(), timeRange).toISOString().split("T")[0];

  const phaseData = PHASES.map((phase) => {
    let values = [];
    if (dataSource === "checkins") {
      checkins
        .filter((c) => c.date >= cutoffDate && c[selectedMetric] != null)
        .forEach((c) => {
          const day = getDayOfCycle(c.date, periodStarts);
          if (day && getPhase(day) === phase.key) values.push(c[selectedMetric]);
        });
    } else {
      symptomLogs
        .filter((s) => s.date >= cutoffDate && s.symptom_type === selectedMetric && s.severity != null)
        .forEach((s) => {
          const day = getDayOfCycle(s.date, periodStarts);
          if (day && getPhase(day) === phase.key) values.push(s.severity);
        });
    }
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { phase: phase.label, avg: parseFloat(avg.toFixed(1)), count: values.length, color: phase.color };
  });

  const timeSeriesData = (() => {
    const byDate = {};
    const source = dataSource === "checkins"
      ? checkins.filter((c) => c.date >= cutoffDate && c[selectedMetric] != null).map((c) => ({ date: c.date, val: c[selectedMetric] }))
      : symptomLogs.filter((s) => s.date >= cutoffDate && s.symptom_type === selectedMetric && s.severity != null).map((s) => ({ date: s.date, val: s.severity }));

    source.forEach(({ date, val }) => {
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(val);
    });

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        label: format(parseISO(date), "MMM d"),
        value: parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)),
        phase: getPhase(getDayOfCycle(date, periodStarts)),
      }));
  })();

  const hasCycleData = periodStarts.length > 0;
  const hasPhaseData = phaseData.some((d) => d.count > 0);

  const currentMetricMeta = CHECKIN_METRICS.find((m) => m.id === selectedMetric);
  const currentLabel = dataSource === "checkins"
    ? (currentMetricMeta?.label || selectedMetric)
    : (selectedMetric?.replace(/_/g, " ") || "");
  const currentColor = dataSource === "checkins" ? (currentMetricMeta?.color || "#f472b6") : "#f472b6";

  const patternInsight = (() => {
    if (!hasPhaseData) return null;
    const withData = phaseData.filter((d) => d.count > 0);
    if (withData.length < 2) return null;
    const highest = [...withData].sort((a, b) => b.avg - a.avg)[0];
    const lowest  = [...withData].sort((a, b) => a.avg - b.avg)[0];
    if (highest === lowest) return null;
    return { highest, lowest };
  })();

  const currentWeeklyItem = weeklyItems[weeklyIndex] || null;

  const weeklyPeriodLabel = useMemo(() => {
    if (!currentWeeklyItem?.week_start) return "";
    if (currentWeeklyItem.summary_type === 'monthly') {
      return format(parseISO(currentWeeklyItem.week_start), 'MMMM yyyy');
    }
    const start = parseISO(currentWeeklyItem.week_start);
    const end = currentWeeklyItem.week_end ? parseISO(currentWeeklyItem.week_end) : null;
    return end
      ? `Week of ${format(start, "MMM dd")} \u2013 ${format(end, "MMM dd")}`
      : `Week of ${format(start, "MMM dd")}`;
  }, [currentWeeklyItem]);

  const skinMode = useMemo(() => {
    const logs = weekCheckins.filter(c => c.skin_condition);
    if (!logs.length) return null;
    return Object.entries(
      logs.reduce((acc, c) => {
        acc[c.skin_condition] = (acc[c.skin_condition] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0][0];
  }, [weekCheckins]);

  const hairMode = useMemo(() => {
    const logs = weekCheckins.filter(c => c.hair_shedding);
    if (!logs.length) return null;
    return Object.entries(
      logs.reduce((acc, c) => {
        acc[c.hair_shedding] = (acc[c.hair_shedding] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0][0];
  }, [weekCheckins]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
           style={{ borderColor: "var(--rose-dust-light)",
                    borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-3xl mx-auto px-4">

        <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

        {/* Page header */}
        <div style={{ paddingTop: "32px", paddingBottom: "8px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{
              fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.14em", color: "var(--mauve)",
              fontFamily: "'Inter', sans-serif"
            }}>
              Your health intelligence
            </p>
            <h1 style={{
              fontSize: "28px", fontWeight: 700, lineHeight: 1.1,
              fontFamily: "'Playfair Display', serif",
              color: "var(--plum)", letterSpacing: "-0.02em", marginTop: "4px"
            }}>
              Pulse
            </h1>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print"
            style={{
              border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--plum)", borderRadius: "9999px", padding: "7px 14px",
              fontSize: "12px", fontWeight: 500, fontFamily: "'Inter', sans-serif",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            Export PDF
          </button>
        </div>

        {/* ── EMPTY STATE (< 3 checkins) ── */}
        {checkins.length < 3 && (
          <div style={{ marginTop: 32, backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, padding: "36px 24px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "var(--rose-dust-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Activity style={{ width: 22, height: 22, color: "var(--rose-dust)" }} /></div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "var(--plum)", marginBottom: 8 }}>Check in daily to unlock insights</h3>
            <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6, marginBottom: 20 }}>After a few check-ins, you'll see patterns in your mood, energy and sleep</p>
            <a href="/Today?open_log=1" style={{ backgroundColor: "var(--plum)", color: "white", borderRadius: 9999, padding: "12px 28px", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", textDecoration: "none", display: "inline-block" }}>
              Do today's check-in
            </a>
          </div>
        )}

        {/* ── PERIOD COUNTDOWN ── */}
        {profile && (
          <div style={{ marginTop: "24px" }}>
            <PeriodCountdownCard profile={profile} />
          </div>
        )}

        {/* ── PREDICTIVE ANALYSIS ── */}
        <div style={{ marginTop: "16px" }}>
          <PredictiveAnalysisCard profile={profile} checkins={checkins} />
        </div>

        {/* ── AI PATTERN CARDS ── */}
        {user && (
          <div style={{ marginTop: "24px" }}>
            <PatternInsightCards userId={user.id} />
          </div>
        )}

        {/* ── CONDITION-SPECIFIC INSIGHTS ── */}
        {user && profile && (
          <div style={{ marginTop: "16px" }}>
            <ConditionPulseCards
              userId={user.id}
              profile={profile}
              checkins={checkins}
              cycleEvents={cycleEvents}
            />
          </div>
        )}

        {/* ── WEARABLE METRICS ── */}
        {user && (
          <div style={{ marginTop: "16px" }}>
            <WearableWeekCard userId={user.id} />
          </div>
        )}

        {/* ── THIS WEEK ── */}
        <div style={{ marginTop: "32px", marginBottom: "14px" }}>
          <p style={{
            fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.14em", color: "var(--rose-dust)",
            fontFamily: "'Inter', sans-serif"
          }}>This week</p>
          <p style={{
            fontSize: "18px", fontWeight: 700, color: "var(--plum)",
            fontFamily: "'Inter', sans-serif", marginTop: "3px"
          }}>Weekly summary</p>
        </div>

        {weeklyItems.length === 0 ? (
          <div style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "20px", padding: "20px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <p style={{ fontSize: "13px", lineHeight: 1.6,
                        color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
              Your first weekly summary will appear here automatically every Sunday.
              Keep logging check-ins to build your personal health picture.
            </p>
          </div>
        ) : (
          <div style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "24px", padding: "20px",
            boxShadow: "var(--shadow-sm)"
          }}>
            {/* Navigator */}
            <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
              <button
                onClick={() => setWeeklyIndex(i => Math.max(0, i - 1))}
                disabled={weeklyIndex === 0}
                style={{
                  width: "34px", height: "34px", borderRadius: "9999px",
                  backgroundColor: "var(--ivory-dark)", color: "var(--plum)",
                  border: "none", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  opacity: weeklyIndex === 0 ? 0.3 : 1,
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div style={{ textAlign: "center" }}>
                {currentWeeklyItem?.summary_type === 'monthly' && (
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ backgroundColor: "var(--sage-subtle)", color: "var(--sage)", borderRadius: 9999, padding: "3px 10px", fontSize: 10, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Monthly summary</span>
                  </div>
                )}
                <p style={{
                  fontSize: currentWeeklyItem?.summary_type === 'monthly' ? "18px" : "13px",
                  fontWeight: 600,
                  color: "var(--plum)",
                  fontFamily: currentWeeklyItem?.summary_type === 'monthly' ? "'Playfair Display', serif" : "'Inter', sans-serif",
                }}>{weeklyPeriodLabel}</p>
              </div>
              <button
                onClick={() => setWeeklyIndex(i => Math.min(weeklyItems.length - 1, i + 1))}
                disabled={weeklyIndex >= weeklyItems.length - 1}
                style={{
                  width: "34px", height: "34px", borderRadius: "9999px",
                  backgroundColor: "var(--ivory-dark)", color: "var(--plum)",
                  border: "none", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  opacity: weeklyIndex >= weeklyItems.length - 1 ? 0.3 : 1,
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* AI text */}
            <div style={{
              maxHeight: "52vh", overflowY: "auto",
              borderRadius: "18px", padding: "16px",
              backgroundColor: "var(--ivory)",
              border: "1px solid var(--border-subtle)"
            }}>
              <MarkdownBlock text={currentWeeklyItem.insight_text} />
            </div>

            {/* This week at a glance */}
            {(skinMode || hairMode || weekStats.journalCount > 0 || weekStats.habitCount > 0 || weekStats.mealCount > 0) && (
              <div style={{
                borderTop: "1px solid var(--border)",
                marginTop: "16px", paddingTop: "16px"
              }}>
                <p style={{
                  fontSize: "0.55rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.14em",
                  color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
                  marginBottom: "10px"
                }}>This week at a glance</p>
                <div className="flex gap-3 flex-wrap">
                  {skinMode && (
                    <div style={{ backgroundColor: "var(--rose-dust-subtle)", borderRadius: "12px", padding: "10px 14px" }}>
                      <p style={{ fontSize: "10px", color: "var(--rose-dust)", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>SKIN</p>
                      <p style={{ fontSize: "14px", color: "var(--plum)", fontWeight: 700, fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>{skinMode}</p>
                      <p style={{ fontSize: "10px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>most logged</p>
                    </div>
                  )}
                  {hairMode && (
                    <div style={{ backgroundColor: "var(--sage-subtle)", borderRadius: "12px", padding: "10px 14px" }}>
                      <p style={{ fontSize: "10px", color: "var(--sage)", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>HAIR SHEDDING</p>
                      <p style={{ fontSize: "14px", color: "var(--plum)", fontWeight: 700, fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>{hairMode}</p>
                      <p style={{ fontSize: "10px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>most logged</p>
                    </div>
                  )}
                  {weekStats.journalCount > 0 && (
                    <div style={{ backgroundColor: "var(--ivory-dark)", borderRadius: "12px", padding: "10px 14px" }}>
                      <p style={{ fontSize: "10px", color: "var(--mauve)", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>JOURNAL</p>
                      <p style={{ fontSize: "20px", color: "var(--plum)", fontWeight: 700, fontFamily: "'Playfair Display', serif", marginTop: "2px" }}>{weekStats.journalCount}</p>
                      <p style={{ fontSize: "10px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>entries</p>
                    </div>
                  )}
                  {weekStats.habitCount > 0 && (
                    <div style={{ backgroundColor: "var(--ivory-dark)", borderRadius: "12px", padding: "10px 14px" }}>
                      <p style={{ fontSize: "10px", color: "var(--mauve)", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>HABITS</p>
                      <p style={{ fontSize: "20px", color: "var(--plum)", fontWeight: 700, fontFamily: "'Playfair Display', serif", marginTop: "2px" }}>{weekStats.habitCount}</p>
                      <p style={{ fontSize: "10px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>completed</p>
                    </div>
                  )}
                  {weekStats.mealCount > 0 && (
                    <div style={{ backgroundColor: "var(--ivory-dark)", borderRadius: "12px", padding: "10px 14px" }}>
                      <p style={{ fontSize: "10px", color: "var(--mauve)", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>MEALS</p>
                      <p style={{ fontSize: "20px", color: "var(--plum)", fontWeight: 700, fontFamily: "'Playfair Display', serif", marginTop: "2px" }}>{weekStats.mealCount}</p>
                      <p style={{ fontSize: "10px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>logged</p>
                    </div>
                  )}
                  <Link
                    to={createPageUrl("SkinHair")}
                    style={{ backgroundColor: "var(--ivory-dark)", borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", textDecoration: "none" }}
                  >
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Full skin & hair trends</p>
                  </Link>
                </div>
              </div>
            )}

            <p style={{ fontSize: "11px", color: "var(--mauve)", marginTop: "14px", fontFamily: "'Inter', sans-serif" }}>
              Generated automatically every Sunday
            </p>
          </div>
        )}

        {/* Smart suggestions */}
        {currentWeeklyItem?.ai_suggestion && (
          <div style={{
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "20px", padding: "20px", marginBottom: "20px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600, color: "var(--plum)", marginBottom: "10px" }}>This week, try</p>
            <p style={{ fontSize: "14px", color: "var(--plum)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif", marginBottom: "14px" }}>{currentWeeklyItem.ai_suggestion}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Find a book",      href: createPageUrl("Lifestyle") + "?tab=books" },
                { label: "Browse lifestyle", href: createPageUrl("Lifestyle") },
                { label: "Log today",        href: createPageUrl("Today") },
              ].map(chip => (
                <a key={chip.label} href={chip.href} style={{
                  backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)",
                  borderRadius: "9999px", padding: "6px 14px", fontSize: "11px", fontWeight: 600,
                  fontFamily: "'Inter', sans-serif", textDecoration: "none",
                }}>{chip.label}</a>
              ))}
            </div>
          </div>
        )}

        {/* Section divider */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", margin: "36px 0 32px" }} />

        {/* ── OVER TIME ── */}
        <div style={{ marginBottom: "18px" }}>
          <p style={{
            fontSize: "0.55rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.14em", color: "var(--rose-dust)",
            fontFamily: "'Inter', sans-serif"
          }}>Over time</p>
          <p style={{
            fontSize: "18px", fontWeight: 700, color: "var(--plum)",
            fontFamily: "'Inter', sans-serif", marginTop: "3px"
          }}>Your patterns</p>
        </div>

        {/* Time range pills */}
        <div className="flex gap-2" style={{ marginBottom: "16px" }}>
          {[3, 6].map((m) => (
            <button
              key={m}
              onClick={() => setTimeRange(m)}
              style={{
                backgroundColor: timeRange === m ? "var(--plum)" : "var(--surface)",
                color: timeRange === m ? "white" : "var(--mauve)",
                border: timeRange === m ? "none" : "1px solid var(--border)",
                borderRadius: "9999px", padding: "7px 16px",
                fontSize: "12px", fontWeight: 600,
                fontFamily: "'Inter', sans-serif", cursor: "pointer",
              }}
            >
              {m} months
            </button>
          ))}
        </div>

        <HealthOverviewSection
          checkins={checkins}
          symptomLogs={symptomLogs}
          habitLogs={habitLogs}
          cutoffDate={cutoffDate}
          timeRange={timeRange}
        />

        <AIHealthSummaryCard
          timeRange={timeRange}
          checkins={checkins}
          symptomLogs={symptomLogs}
          habitLogs={habitLogs}
          cutoffDate={cutoffDate}
        />

        {/* Data source toggle */}
        <div className="flex gap-1 mb-4" style={{
          borderRadius: "16px", padding: "4px",
          backgroundColor: "var(--surface)", border: "1px solid var(--border)"
        }}>
          <button
            onClick={() => { setDataSource("checkins"); setSelectedMetric("cramps"); }}
            style={{
              flex: 1, padding: "8px", borderRadius: "12px",
              fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer",
              backgroundColor: dataSource === "checkins" ? "var(--plum)" : "transparent",
              color: dataSource === "checkins" ? "white" : "var(--mauve)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Daily Check-ins
          </button>
          <button
            onClick={() => { setDataSource("symptoms"); setSelectedMetric(symptomTypes[0] || ""); }}
            disabled={symptomTypes.length === 0}
            style={{
              flex: 1, padding: "8px", borderRadius: "12px",
              fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer",
              backgroundColor: dataSource === "symptoms" ? "var(--plum)" : "transparent",
              color: dataSource === "symptoms" ? "white" : "var(--mauve)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Symptom Logs
          </button>
        </div>

        {/* Metric chips */}
        <div className="mb-5">
          <p style={{ fontSize: "12px", color: "var(--mauve)", marginBottom: "8px", fontFamily: "'Inter', sans-serif" }}>Select metric</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(dataSource === "checkins" ? CHECKIN_METRICS : symptomTypes.map((t) => ({ id: t, label: t.replace(/_/g, " "), color: "#f472b6" }))).map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                style={{
                  flexShrink: 0, borderRadius: "9999px", padding: "6px 12px",
                  fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
                  border: "none", cursor: "pointer", textTransform: "capitalize",
                  backgroundColor: selectedMetric === m.id ? m.color : "var(--ivory-dark)",
                  color: selectedMetric === m.id ? "white" : "var(--mauve)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* No cycle data */}
        {!hasCycleData && (
          <div style={{
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "20px", padding: "20px", marginBottom: "16px",
            boxShadow: "var(--shadow-sm)", textAlign: "center"
          }}>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--plum)", marginBottom: "4px", fontFamily: "'Inter', sans-serif" }}>No cycle data yet</p>
            <p style={{ fontSize: "12px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Log your period in Today — Track to see phase correlations.</p>
          </div>
        )}

        {/* Phase bar chart */}
        {hasCycleData && (
          <div style={{
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "20px", padding: "16px", marginBottom: "16px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--plum)", marginBottom: "2px", textTransform: "capitalize", fontFamily: "'Inter', sans-serif" }}>{currentLabel} by Cycle Phase</h3>
            <p style={{ fontSize: "12px", color: "var(--mauve)", marginBottom: "16px", fontFamily: "'Inter', sans-serif" }}>Average score — last {timeRange} months</p>
            {hasPhaseData ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={phaseData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e8" />
                  <XAxis dataKey="phase" tick={{ fontSize: 11, fill: "#999" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#999" }} domain={[0, 10]} />
                  <Tooltip
                    formatter={(val) => [val, currentLabel]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #fce7ec", fontSize: 12 }}
                  />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                    {phaseData.map((entry, i) => (
                      <Cell key={i} fill={PHASES[i].color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40" style={{ color: "var(--mauve)" }}>
                <p style={{ fontSize: "14px", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>Not enough data yet —<br />keep logging daily!</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1 mt-3">
              {PHASES.map((p) => (
                <div key={p.key} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span style={{ fontSize: "10px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{p.label} <span style={{ color: "var(--border)" }}>({p.days})</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pattern insight */}
        {patternInsight && (
          <div style={{
            backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)",
            borderRadius: "20px", padding: "16px", marginBottom: "16px",
            borderLeft: `4px solid ${PHASES.find((p) => p.key === patternInsight.highest.phase)?.color}`
          }}>
            <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", marginBottom: "6px", fontFamily: "'Inter', sans-serif" }}>Pattern Insight</p>
            <p style={{ fontSize: "14px", color: "var(--plum)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
              Your <strong style={{ textTransform: "capitalize" }}>{currentLabel}</strong> tends to peak during the{" "}
              <strong style={{ color: PHASES.find((p) => p.key === patternInsight.highest.phase)?.color }}>
                {patternInsight.highest.phase}
              </strong>{" "}
              phase (avg {patternInsight.highest.avg}) and is lowest in the{" "}
              <strong style={{ color: PHASES.find((p) => p.key === patternInsight.lowest.phase)?.color }}>
                {patternInsight.lowest.phase}
              </strong>{" "}
              phase (avg {patternInsight.lowest.avg}).
            </p>
          </div>
        )}

        {/* Time series line chart */}
        {timeSeriesData.length > 1 && (
          <div style={{
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "20px", padding: "16px", marginBottom: "16px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--plum)", marginBottom: "2px", textTransform: "capitalize", fontFamily: "'Inter', sans-serif" }}>{currentLabel} over time</h3>
            <p style={{ fontSize: "12px", color: "var(--mauve)", marginBottom: "16px", fontFamily: "'Inter', sans-serif" }}>Daily readings — {timeRange} months</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e8" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: "#999" }} domain={[0, 10]} />
                <Tooltip
                  formatter={(val) => [val, currentLabel]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #fce7ec", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={currentColor}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: currentColor, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {timeSeriesData.length === 0 && (
          <div style={{
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "20px", padding: "20px", marginBottom: "16px",
            boxShadow: "var(--shadow-sm)", textAlign: "center"
          }}>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--plum)", marginBottom: "4px", fontFamily: "'Inter', sans-serif" }}>No data for this metric yet</p>
            <p style={{ fontSize: "12px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Keep logging daily check-ins to see trends here.</p>
          </div>
        )}

        {/* Habit Completion Rates */}
        {habitNames.length > 0 && (() => {
          const habitData = habitNames.map((name) => {
            const logsInRange = habitLogs.filter((h) => (h.habit_type === name || h.habit_name === name) && h.date >= cutoffDate);
            const completedDays = logsInRange.filter((h) => h.completed).length;
            const uniqueDates = [...new Set(logsInRange.map(h => h.date))].length;
            const pct = uniqueDates > 0 ? Math.round((completedDays / uniqueDates) * 100) : 0;
            return { name: name.length > 16 ? name.slice(0, 16) + "…" : name, pct, full: name };
          });
          return (
            <div style={{
              backgroundColor: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "20px", padding: "16px", marginBottom: "16px",
              boxShadow: "var(--shadow-sm)"
            }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--plum)", marginBottom: "2px", fontFamily: "'Inter', sans-serif" }}>Habit Completion Rates</h3>
              <p style={{ fontSize: "12px", color: "var(--mauve)", marginBottom: "16px", fontFamily: "'Inter', sans-serif" }}>Last {timeRange} months</p>
              <div className="space-y-3">
                {habitData.map((h) => (
                  <div key={h.full}>
                    <div className="flex justify-between items-center mb-1">
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--plum)", textTransform: "capitalize", fontFamily: "'Inter', sans-serif" }}>{h.name}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>{h.pct}%</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "var(--rose-dust-subtle)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", backgroundColor: "var(--rose-dust)", borderRadius: "4px", width: `${h.pct}%`, transition: "width 0.5s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Sleep vs Mood Correlation */}
        {checkins.filter(c => c.date >= cutoffDate && c.sleep_quality != null && c.mood != null).length > 3 && (() => {
          const data = checkins
            .filter(c => c.date >= cutoffDate && c.sleep_quality != null && c.mood != null)
            .map(c => ({ label: format(parseISO(c.date), "MMM d"), sleep: c.sleep_quality, mood: c.mood, energy: c.energy }))
            .slice(-30);
          return (
            <div style={{
              backgroundColor: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "20px", padding: "16px", marginBottom: "16px",
              boxShadow: "var(--shadow-sm)"
            }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--plum)", marginBottom: "2px", fontFamily: "'Inter', sans-serif" }}>Sleep Quality vs Mood & Energy</h3>
              <p style={{ fontSize: "12px", color: "var(--mauve)", marginBottom: "16px", fontFamily: "'Inter', sans-serif" }}>Last 30 data points</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e4e8" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#999" }} domain={[0, 10]} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #fce7ec", fontSize: 12 }} />
                  <Line type="monotone" dataKey="sleep" stroke="#34d399" strokeWidth={2} dot={false} name="Sleep" />
                  <Line type="monotone" dataKey="mood" stroke="#f472b6" strokeWidth={2} dot={false} name="Mood" />
                  <Line type="monotone" dataKey="energy" stroke="#fb923c" strokeWidth={2} dot={false} name="Energy" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                {[{c:"#34d399",l:"Sleep"},{c:"#f472b6",l:"Mood"},{c:"#fb923c",l:"Energy"}].map(x => (
                  <div key={x.l} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: x.c }} />
                    <span style={{ fontSize: "10px", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Skin & Hair tracker card */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "22px",
            padding: "20px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: "0.12em", color: "var(--mauve)",
                        fontFamily: "'Inter', sans-serif" }}>
              Dedicated tracker
            </p>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--plum)",
                        fontFamily: "'Inter', sans-serif", marginTop: "2px" }}>
              Skin &amp; Hair Trends
            </p>
            <p style={{ fontSize: "12px", color: "var(--mauve)",
                        fontFamily: "'Inter', sans-serif", marginTop: "4px" }}>
              Phase-by-phase breakout patterns, shedding data and more
            </p>
          </div>
          <Link
            to={createPageUrl("SkinHair")}
            style={{ backgroundColor: "var(--plum)", color: "white",
                     borderRadius: "9999px", padding: "8px 18px",
                     fontSize: "12px", fontWeight: 600,
                     fontFamily: "'Inter', sans-serif",
                     textDecoration: "none", flexShrink: 0 }}
          >
            View
          </Link>
        </div>

      </div>
    </div>
  );
}
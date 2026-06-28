// PulseEliteShell — the ELEVATED, FULLY-WIRED Pulse page (your health intelligence / trends). The Pulse
// analogue of PlannerEliteShell / NutritionEliteShell: self-loads real base44 entities on mount, mounts the
// REAL Pulse feature components (nothing stripped), and ports the over-time charts into elite lenses.
//
// Craft elevated ~3 levels: lush flora hero (phase bloom + bouquet + resting creature), oxblood script
// headings, the full card language (two stacked horizontal sub-sliders per board + gold hairline divider +
// board ‹ › arrows + colour pills + accent-rim sub-cards), TopChrome (jump-to + calendar), reduced-motion-safe.
//
// REAL DATA (no new base44 function — reads only, same entities as live Pulse):
//   CycleEvents · DailyCheckins · SymptomLogs · HabitLogs · JournalEntries · MealLog · WeeklyInsights ·
//   UserProfile. Real feature components kept: PeriodCountdownCard · PredictiveAnalysisCard ·
//   PatternInsightCards · ConditionPulseCards · WearableWeekCard · HealthOverviewSection · AIHealthSummaryCard ·
//   ContentActionBar. Over-time charts (metric-by-phase · time-series · habit completion · sleep/mood) ported.
import { useState, useEffect, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { subMonths, subDays, parseISO, differenceInDays, format } from "date-fns";
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line,
} from "recharts";
import {
  CalendarDays, Sparkles, TrendingUp, Brain, Heart, Moon, Activity, Watch, ScanLine, Stethoscope,
  ChevronRight, Gauge, FileDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { T, SERIF, UI, PAPER_BG } from "@/components/journal/Editorial";
import { FwFloraHero } from "@/components/brand/PageTop";
import { SummaryCard } from "@/components/brand/Card";
import { ClipboardSlider, Clipboard } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes, Bouquet, Pollinator } from "@/components/brand/flora";
import { getCurrentCyclePhase, phaseLabel } from "@/utils/cyclePhase";
import MonthlyCalendarCard from "@/components/planner/MonthlyCalendarCard";
import DayDetailSheet from "@/components/planner/DayDetailSheet";
import {
  OXBLOOD, lbl, subCard, focusPill, Panel, StackedCard, BoardBody, TopChrome,
  JumpSheet, SliderArrows, makeCalendarOverlay,
} from "@/components/brand/SliderKit";
// REAL Pulse feature components — mounted as-is, fed real data (nothing stripped)
import HealthOverviewSection from "@/components/trends/HealthOverviewSection";
import AIHealthSummaryCard from "@/components/trends/AIHealthSummaryCard";
import PredictiveAnalysisCard from "@/components/trends/PredictiveAnalysisCard";
import PeriodCountdownCard from "@/components/pulse/PeriodCountdownCard";
import PatternInsightCards from "@/components/pulse/PatternInsightCards";
import ConditionPulseCards from "@/components/conditions/ConditionPulseCards";
import WearableWeekCard from "@/components/pulse/WearableWeekCard";
import ContentActionBar from "@/components/common/ContentActionBar";

const CalendarOverlay = makeCalendarOverlay(MonthlyCalendarCard, DayDetailSheet);

const ELITE_MOTION = `
@keyframes fwEliteIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:none; } }
.fw-elite-in { animation: fwEliteIn .5s cubic-bezier(.4,0,.2,1) both; }
.fw-elite-press { transition: transform .12s ease; }
.fw-elite-press:active { transform: scale(.97); }
@media (prefers-reduced-motion: reduce){ .fw-elite-in{ animation:none } .fw-elite-press{ transition:none } }
`;

const PHASE_BLOOM = {
  menstrual: { bloom: "poppy", cw: "crimson", hue: "#BC2E27" },
  follicular: { bloom: "snowdrop", cw: "sage", hue: "#8FAF8F" },
  ovulatory: { bloom: "sunflower", cw: "gold", hue: "#D4AF37" },
  luteal: { bloom: "dahlia", cw: "plum", hue: "#8E6E8E" },
};
const phaseMeta = (key) => PHASE_BLOOM[key] || PHASE_BLOOM.follicular;

// cycle-phase analytics (ported verbatim from live Pulse — keeps the over-time charts identical)
const PHASES = [
  { key: "Menstrual", label: "Menstrual", color: "#BC2E27" },
  { key: "Follicular", label: "Follicular", color: "#8FAF8F" },
  { key: "Ovulatory", label: "Ovulatory", color: "#D4AF37" },
  { key: "Luteal", label: "Luteal", color: "#8E6E8E" },
];
const CHECKIN_METRICS = [
  { id: "cramps", label: "Cramps" }, { id: "mood", label: "Mood" }, { id: "energy", label: "Energy" },
  { id: "stress", label: "Stress" }, { id: "bloating", label: "Bloating" }, { id: "headache", label: "Headache" },
  { id: "breast_tenderness", label: "Breast tenderness" }, { id: "sleep_quality", label: "Sleep quality" }, { id: "pain", label: "Pain" },
];
function getPhase(day) { if (!day || day <= 0) return null; if (day <= 5) return "Menstrual"; if (day <= 13) return "Follicular"; if (day <= 16) return "Ovulatory"; return "Luteal"; }
function getDayOfCycle(dateStr, starts) {
  const date = parseISO(dateStr);
  const past = starts.map((d) => parseISO(d)).filter((d) => d <= date).sort((a, b) => b - a);
  if (!past.length) return null;
  return differenceInDays(date, past[0]) + 1;
}
const BOARDS = [
  { t: "This week", sub: "Read back gently" },
  { t: "Patterns", sub: "What your body repeats" },
  { t: "Over time", sub: "3–6 month trends" },
];

export default function PulseEliteShell() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cycleEvents, setCycleEvents] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [symptomTypes, setSymptomTypes] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [habitNames, setHabitNames] = useState([]);
  const [weeklyItems, setWeeklyItems] = useState([]);
  const [weekStats, setWeekStats] = useState({ journalCount: 0, habitCount: 0, mealCount: 0 });
  const [weekCheckins, setWeekCheckins] = useState([]);
  // over-time controls
  const [timeRange, setTimeRange] = useState(3);
  const [dataSource, setDataSource] = useState("checkins");
  const [selectedMetric, setSelectedMetric] = useState("cramps");
  // chrome
  const [jumpOpen, setJumpOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await base44.auth.me(); if (!alive) return; setUser(u);
        const profs = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
        if (alive) setProfile(profs?.[0] || null);
        const [events, ckins, slogs, hlogs, journalEntries, mealLogs, wiRecords] = await Promise.all([
          base44.entities.CycleEvents.filter({ user_id: u.id }).catch(() => []),
          base44.entities.DailyCheckins.filter({ user_id: u.id }).catch(() => []),
          base44.entities.SymptomLogs.filter({ user_id: u.id }).catch(() => []),
          base44.entities.HabitLogs.filter({ user_id: u.id }, "-date", 250).catch(() => []),
          base44.entities.JournalEntries.filter({ user_id: u.id }, "-created_date", 30).catch(() => []),
          base44.entities.MealLog.filter({ user_id: u.id }, "-logged_at", 100).catch(() => []),
          base44.entities.WeeklyInsights.filter({ user_id: u.id }, "-week_start", 12).catch(() => []),
        ]);
        if (!alive) return;
        const wCutoff = format(subDays(new Date(), 7), "yyyy-MM-dd");
        setWeekStats({
          journalCount: journalEntries.filter((e) => (e.session_date || e.created_date?.split("T")[0] || "") >= wCutoff).length,
          habitCount: hlogs.filter((h) => h.date >= wCutoff && h.completed === true).length,
          mealCount: mealLogs.filter((m) => (m.logged_at || m.created_date || "") >= wCutoff + "T00:00:00").length,
        });
        setWeeklyItems(wiRecords || []);
        setWeekCheckins(ckins.filter((c) => c.date >= wCutoff));
        setCycleEvents(events);
        setCheckins(ckins);
        setSymptomLogs(slogs);
        setSymptomTypes([...new Set(slogs.map((s) => s.symptom_type).filter(Boolean))]);
        setHabitLogs(hlogs);
        setHabitNames([...new Set(hlogs.map((h) => h.habit_type || h.habit_name).filter(Boolean))]);
      } catch (err) {
        console.error("Pulse elite init failed:", err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const firstName = useMemo(() => {
    const n = profile?.display_name || user?.full_name || "";
    return n ? String(n).trim().split(/\s+/)[0] : "";
  }, [profile, user]);
  const phaseKey = useMemo(() => { try { return getCurrentCyclePhase(profile); } catch { return null; } }, [profile]);
  const ph = phaseMeta(phaseKey);

  const periodStarts = useMemo(() => cycleEvents.filter((e) => e.event_type === "period_start").map((e) => e.date).sort(), [cycleEvents]);
  const cutoffDate = useMemo(() => subMonths(new Date(), timeRange).toISOString().split("T")[0], [timeRange]);
  const hasCycleData = periodStarts.length > 0;

  const phaseData = useMemo(() => PHASES.map((phase) => {
    const values = [];
    if (dataSource === "checkins") {
      checkins.filter((c) => c.date >= cutoffDate && c[selectedMetric] != null).forEach((c) => {
        const day = getDayOfCycle(c.date, periodStarts); if (day && getPhase(day) === phase.key) values.push(c[selectedMetric]);
      });
    } else {
      symptomLogs.filter((s) => s.date >= cutoffDate && s.symptom_type === selectedMetric && s.severity != null).forEach((s) => {
        const day = getDayOfCycle(s.date, periodStarts); if (day && getPhase(day) === phase.key) values.push(s.severity);
      });
    }
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { phase: phase.label, avg: parseFloat(avg.toFixed(1)), count: values.length, color: phase.color };
  }), [checkins, symptomLogs, dataSource, selectedMetric, cutoffDate, periodStarts]);
  const hasPhaseData = phaseData.some((d) => d.count > 0);

  const timeSeriesData = useMemo(() => {
    const byDate = {};
    const source = dataSource === "checkins"
      ? checkins.filter((c) => c.date >= cutoffDate && c[selectedMetric] != null).map((c) => ({ date: c.date, val: c[selectedMetric] }))
      : symptomLogs.filter((s) => s.date >= cutoffDate && s.symptom_type === selectedMetric && s.severity != null).map((s) => ({ date: s.date, val: s.severity }));
    source.forEach(({ date, val }) => { (byDate[date] = byDate[date] || []).push(val); });
    return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, vals]) => ({
      label: format(parseISO(date), "MMM d"), value: parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)),
    }));
  }, [checkins, symptomLogs, dataSource, selectedMetric, cutoffDate]);

  const patternInsight = useMemo(() => {
    const withData = phaseData.filter((d) => d.count > 0);
    if (withData.length < 2) return null;
    const highest = [...withData].sort((a, b) => b.avg - a.avg)[0];
    const lowest = [...withData].sort((a, b) => a.avg - b.avg)[0];
    return highest === lowest ? null : { highest, lowest };
  }, [phaseData]);

  const habitData = useMemo(() => habitNames.map((name) => {
    const logsInRange = habitLogs.filter((h) => (h.habit_type === name || h.habit_name === name) && h.date >= cutoffDate);
    const completedDays = logsInRange.filter((h) => h.completed).length;
    const uniqueDates = [...new Set(logsInRange.map((h) => h.date))].length;
    return { name: name.length > 18 ? name.slice(0, 18) + "…" : name, pct: uniqueDates > 0 ? Math.round((completedDays / uniqueDates) * 100) : 0 };
  }), [habitNames, habitLogs, cutoffDate]);

  const sleepMood = useMemo(() => checkins
    .filter((c) => c.date >= cutoffDate && c.sleep_quality != null && c.mood != null)
    .map((c) => ({ label: format(parseISO(c.date), "MMM d"), sleep: c.sleep_quality, mood: c.mood, energy: c.energy }))
    .slice(-30), [checkins, cutoffDate]);

  const currentLabel = dataSource === "checkins"
    ? (CHECKIN_METRICS.find((m) => m.id === selectedMetric)?.label || selectedMetric)
    : (selectedMetric?.replace(/_/g, " ") || "");
  const currentColor = ph.hue;
  const weekly = weeklyItems[0] || null;

  const gold = T.gold, sage = cwOf("sage").petal, plum = cwOf("plum").petal, crim = T.crimson;
  const metricList = dataSource === "checkins" ? CHECKIN_METRICS : symptomTypes.map((t) => ({ id: t, label: t.replace(/_/g, " ") }));

  function jumpTo(i) {
    sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const track = sliderRef.current?.querySelector(".fw-clipboard-track"); if (!track) return;
    const card = track.children[i]; if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setJumpOpen(false);
  }

  if (loading) return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 30, height: 30, borderRadius: 99, border: `2px solid ${T.paperDeep}`, borderTopColor: T.gold, animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip", paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}>
      <style>{floraKeyframes}{ELITE_MOTION}</style>
      <TopChrome onJump={() => setJumpOpen(true)} onCalendar={() => setCalOpen(true)} />

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 0" }} className="fw-elite-in">
        <FwFloraHero title={firstName ? `${firstName}'s pulse` : "Your pulse"} colorway={ph.cw} bloom={ph.bloom} flankL="chamomile" flankR="sunflower" titleColor={OXBLOOD} creature="butterfly"
          line="Your week, read back gently — patterns, not scores. Slide sideways for the deeper trends." />
        <div style={{ display: "flex", justifyContent: "center", marginTop: -6, marginBottom: 2 }}>
          <Bouquet items={[{ form: ph.bloom, colorway: ph.cw }, { form: "fern", colorway: "sage" }, { form: "cosmos", colorway: "plum" }]} size={150} animate idx="pulse-bq" />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "2px 0 16px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: ph.hue }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{phaseKey ? phaseLabel(phaseKey) : "Your health intelligence"}</span>
        </div>

        <SummaryCard eyebrow="This week, at a glance" accent={gold} rows={[
          { Icon: Heart, label: "Mood", text: `${weekStats.journalCount} reflections · ${weekCheckins.length} check-ins this week`, onClick: () => jumpTo(0) },
          { Icon: Moon, label: "Rest", text: weekly?.ai_suggestion ? "A gentle suggestion is ready from Jess" : "Sleep & mood tracked — see the trend", onClick: () => jumpTo(0) },
          { Icon: CalendarDays, label: "Ahead", text: hasCycleData ? "Your period prediction is in This week" : "Log your period to unlock predictions", onClick: () => jumpTo(0) },
        ]} />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => jumpTo(0)} className="fw-elite-press" style={focusPill(plum)}><Sparkles size={16} /> Reflect</button>
          <button onClick={() => window.print()} className="fw-elite-press" style={focusPill(gold)}><FileDown size={16} /> Export PDF</button>
        </div>

        {/* time range governs all over-time charts */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", justifyContent: "center" }}>
          <span style={{ ...lbl, marginRight: 2 }}>Over</span>
          {[3, 6].map((m) => (
            <button key={m} onClick={() => setTimeRange(m)} className="fw-elite-press" style={{ cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, padding: "7px 16px", borderRadius: 999, border: `1px solid ${timeRange === m ? T.ink : T.paperDeep}`, background: timeRange === m ? T.ink : "transparent", color: timeRange === m ? T.paperHi : T.muted }}>{m} months</button>
          ))}
        </div>

        <div ref={sliderRef} style={{ marginTop: 16, position: "relative" }}>
          <SliderArrows sliderRef={sliderRef} />
          <ClipboardSlider hint="Slide your pulse →" accent={gold}>

            {/* ── BOARD 1 — THIS WEEK ─────────────────────────────────────── */}
            <Clipboard title="This week" sub="PREDICTIONS · SUMMARY · REFLECT" accent={plum} flower="cosmos" idx="cb-week" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={crim} bottomAccent={gold}
                  top={[
                    <Panel key="period" label="Period countdown" Icon={CalendarDays} accent={crim}><PeriodCountdownCard profile={profile} /></Panel>,
                    <Panel key="predict" label="Predictive · Jess" Icon={Brain} accent={plum}><PredictiveAnalysisCard profile={profile} checkins={checkins} /></Panel>,
                    <Panel key="aisum" label="Health summary" Icon={Sparkles} accent={gold}><AIHealthSummaryCard timeRange={timeRange} checkins={checkins} symptomLogs={symptomLogs} habitLogs={habitLogs} cutoffDate={cutoffDate} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="weekly" label="Your week, read back" Icon={Sparkles} accent={gold}><WeeklyLens weekly={weekly} navigate={navigate} /></Panel>,
                    <Panel key="glance" label="This week at a glance" Icon={TrendingUp} accent={sage}><GlanceLens weekStats={weekStats} weekCheckins={weekCheckins} navigate={navigate} /></Panel>,
                    <Panel key="reflect" label="What now" Icon={Heart} accent={plum}>
                      <ContentActionBar label="What now" reflect={{ seed: "A pattern I noticed in myself lately — ", type: "reflection" }} belong="Others in your season" jess="my health patterns lately" />
                    </Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 2 — PATTERNS ──────────────────────────────────────── */}
            <Clipboard title="Patterns" sub="WHAT YOUR BODY REPEATS" accent={sage} flower="clover" idx="cb-pat" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={plum} bottomAccent={sage}
                  top={[
                    <Panel key="patterns" label="Pattern insights" Icon={TrendingUp} accent={plum}><PatternInsightCards userId={user?.id} /></Panel>,
                    <Panel key="conditions" label="Condition pulse" Icon={Heart} accent={crim}><ConditionPulseCards conditions={profile?.conditions || []} profile={profile} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="wearable" label="Wearable week" Icon={Watch} accent={sage}><WearableWeekCard userId={user?.id} /></Panel>,
                    <Panel key="overview" label="Health overview" Icon={Activity} accent={gold}><HealthOverviewSection checkins={checkins} symptomLogs={symptomLogs} habitLogs={habitLogs} cutoffDate={cutoffDate} timeRange={timeRange} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

            {/* ── BOARD 3 — OVER TIME ─────────────────────────────────────── */}
            <Clipboard title="Over time" sub="A METRIC ACROSS YOUR CYCLE" accent={gold} flower="sunflower" idx="cb-time" titleColor={OXBLOOD}>
              <BoardBody>
                <StackedCard topAccent={gold} bottomAccent={sage}
                  top={[
                    <Panel key="phase" label={`${currentLabel} by phase`} Icon={Gauge} accent={gold}>
                      <MetricControls dataSource={dataSource} setDataSource={setDataSource} setSelectedMetric={setSelectedMetric} metricList={metricList} selectedMetric={selectedMetric} symptomTypes={symptomTypes} />
                      <PhaseChart phaseData={phaseData} hasPhaseData={hasPhaseData} hasCycleData={hasCycleData} timeRange={timeRange} patternInsight={patternInsight} currentLabel={currentLabel} />
                    </Panel>,
                    <Panel key="series" label={`${currentLabel} over time`} Icon={TrendingUp} accent={plum}><SeriesChart data={timeSeriesData} color={currentColor} timeRange={timeRange} /></Panel>,
                  ]}
                  bottom={[
                    <Panel key="habits" label="Habit completion" Icon={Activity} accent={sage}><HabitLens habitData={habitData} timeRange={timeRange} /></Panel>,
                    <Panel key="sleepmood" label="Sleep · mood · energy" Icon={Moon} accent={plum}><SleepMoodChart data={sleepMood} /></Panel>,
                    <Panel key="skin" label="Skin & hair" Icon={ScanLine} accent={cwOf("blush").petal}><SkinHairLens navigate={navigate} /></Panel>,
                  ]} />
              </BoardBody>
            </Clipboard>

          </ClipboardSlider>
        </div>

        <div style={{ display: "grid", placeItems: "center", margin: "18px 0 0" }}><Pollinator kind="butterfly" size={32} color={T.gold} color2={cwOf(ph.cw).tip} pattern="bands" animate idx="pulse-close" /></div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "6px auto 0", maxWidth: 300, lineHeight: 1.55 }}>Patterns, not scores. Your body is always speaking — this is just listening back.</p>
      </div>

      {jumpOpen && <JumpSheet boards={BOARDS} onClose={() => setJumpOpen(false)} onJump={jumpTo} />}
      {calOpen && <CalendarOverlay user={user} profile={profile} onClose={() => setCalOpen(false)} />}
    </div>
  );
}

// ── lens components ──────────────────────────────────────────────────────────
function WeeklyLens({ weekly, navigate }) {
  if (!weekly) return <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14.5, color: T.muted, lineHeight: 1.55 }}>Your first weekly read appears once you've logged a few days. Generated automatically every Sunday.</p>;
  return (
    <div>
      {weekly.ai_summary && <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.55, margin: "0 0 10px", whiteSpace: "pre-line" }}>{String(weekly.ai_summary).replace(/[#*]/g, "").slice(0, 320)}</p>}
      {weekly.ai_suggestion && (
        <div style={{ ...subCard(T.gold), marginBottom: 10 }}>
          <span style={{ ...lbl, color: T.gold }}>This week, try</span>
          <p style={{ fontFamily: SERIF, fontSize: 14, color: T.ink, lineHeight: 1.5, margin: "4px 0 0" }}>{weekly.ai_suggestion}</p>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {[["Find a book", "Lifestyle"], ["Browse lifestyle", "Lifestyle"], ["Log today", "Today"]].map(([l, p]) => (
          <button key={l} onClick={() => navigate(createPageUrl(p))} className="fw-elite-press" style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 600, color: T.ink }}>{l}</button>
        ))}
      </div>
    </div>
  );
}
function GlanceLens({ weekStats, weekCheckins, navigate }) {
  const skinMode = mode(weekCheckins.map((c) => c.skin_condition));
  const hairMode = mode(weekCheckins.map((c) => c.hair_shedding));
  const cells = [
    ["Reflections", weekStats.journalCount, "plum"], ["Habits", weekStats.habitCount, "sage"],
    ["Meals", weekStats.mealCount, "gold"], ["Check-ins", weekCheckins.length, "crimson"],
  ];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {cells.map(([l, v, cw]) => { const c = cwOf(cw); return (
          <div key={l} style={{ ...subCard(c.petal), display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: T.ink }}>{v}</span>
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: c.petal }}>{l}</span>
          </div>
        ); })}
      </div>
      {(skinMode || hairMode) && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {skinMode && <span style={{ ...subCard(cwOf("blush").petal), flex: 1, fontFamily: UI, fontSize: 11, color: T.muted }}>Skin · <b style={{ color: T.ink }}>{skinMode}</b></span>}
          {hairMode && <span style={{ ...subCard(cwOf("sage").petal), flex: 1, fontFamily: UI, fontSize: 11, color: T.muted }}>Hair · <b style={{ color: T.ink }}>{hairMode}</b></span>}
        </div>
      )}
      <button onClick={() => navigate(createPageUrl("SkinHair"))} className="fw-elite-press" style={{ marginTop: 9, display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.gold }}>Full skin & hair trends <ChevronRight size={13} /></button>
    </div>
  );
}
function mode(arr) {
  const f = arr.filter(Boolean); if (!f.length) return null;
  return Object.entries(f.reduce((a, x) => { a[x] = (a[x] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1])[0][0];
}
function MetricControls({ dataSource, setDataSource, setSelectedMetric, metricList, selectedMetric, symptomTypes }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <button onClick={() => { setDataSource("checkins"); setSelectedMetric("cramps"); }} style={toggleBtn(dataSource === "checkins")}>Check-ins</button>
        <button onClick={() => { if (symptomTypes.length) { setDataSource("symptoms"); setSelectedMetric(symptomTypes[0]); } }} disabled={!symptomTypes.length} style={{ ...toggleBtn(dataSource === "symptoms"), opacity: symptomTypes.length ? 1 : 0.5 }}>Symptoms</button>
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 3 }}>
        {metricList.map((m) => <button key={m.id} onClick={() => setSelectedMetric(m.id)} style={{ flexShrink: 0, cursor: "pointer", fontFamily: UI, fontSize: 11, fontWeight: 600, textTransform: "capitalize", padding: "6px 11px", borderRadius: 999, border: "none", background: selectedMetric === m.id ? cwOf("plum").petal : T.paperDeep, color: selectedMetric === m.id ? "#fff" : T.muted }}>{m.label}</button>)}
      </div>
    </div>
  );
}
const toggleBtn = (on) => ({ flex: 1, cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, padding: "8px 0", borderRadius: 10, border: `1px solid ${on ? T.ink : T.paperDeep}`, background: on ? T.ink : "transparent", color: on ? T.paperHi : T.muted });

function PhaseChart({ phaseData, hasPhaseData, hasCycleData, timeRange, patternInsight, currentLabel }) {
  if (!hasCycleData) return <Empty title="No cycle data yet" line="Log your period in Today → Track to see phase correlations." />;
  if (!hasPhaseData) return <Empty title="Not enough data yet" line="Keep logging daily check-ins and the phases fill in." />;
  return (
    <div>
      <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginBottom: 4 }}>Average — last {timeRange} months</div>
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={phaseData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7DCC8" />
          <XAxis dataKey="phase" tick={{ fontSize: 10, fill: "#8C7B66" }} />
          <YAxis tick={{ fontSize: 10, fill: "#8C7B66" }} domain={[0, 10]} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #D8CFBC", fontSize: 12 }} />
          <Bar dataKey="avg" radius={[6, 6, 0, 0]}>{phaseData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
        </BarChart>
      </ResponsiveContainer>
      {patternInsight && (
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted, margin: "8px 2px 0", lineHeight: 1.5 }}>
          Your {currentLabel.toLowerCase()} tends to peak in the <b style={{ color: T.ink }}>{patternInsight.highest.phase}</b> phase and settle in the <b style={{ color: T.ink }}>{patternInsight.lowest.phase}</b>.
        </p>
      )}
    </div>
  );
}
function SeriesChart({ data, color, timeRange }) {
  if (data.length < 2) return <Empty title="No data for this metric yet" line="Keep logging to see the daily trend here." />;
  return (
    <div>
      <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginBottom: 4 }}>Daily readings — {timeRange} months</div>
      <ResponsiveContainer width="100%" height={170}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7DCC8" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#8C7B66" }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: "#8C7B66" }} domain={[0, 10]} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #D8CFBC", fontSize: 12 }} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 2.5, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
function HabitLens({ habitData, timeRange }) {
  if (!habitData.length) return <Empty title="No habits tracked yet" line="Tick habits in Today and your streaks appear here." />;
  return (
    <div>
      <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginBottom: 8 }}>Completion — last {timeRange} months</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {habitData.map((h) => (
          <div key={h.name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 12, marginBottom: 3 }}><span style={{ color: T.ink, fontWeight: 600, textTransform: "capitalize" }}>{h.name}</span><span style={{ color: cwOf("sage").petal, fontWeight: 700 }}>{h.pct}%</span></div>
            <div style={{ height: 7, borderRadius: 99, background: T.paperDeep, overflow: "hidden" }}><div style={{ width: `${h.pct}%`, height: "100%", background: cwOf("sage").petal }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
function SleepMoodChart({ data }) {
  if (data.length < 3) return <Empty title="Not enough sleep & mood data" line="A few more check-ins and the correlation appears." />;
  return (
    <div>
      <div style={{ fontFamily: UI, fontSize: 11, color: T.muted, marginBottom: 4 }}>Last {data.length} data points</div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7DCC8" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#8C7B66" }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: "#8C7B66" }} domain={[0, 10]} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #D8CFBC", fontSize: 12 }} />
          <Line type="monotone" dataKey="sleep" stroke={cwOf("plum").petal} strokeWidth={2} dot={false} name="Sleep" />
          <Line type="monotone" dataKey="mood" stroke={T.ink} strokeWidth={2} dot={false} name="Mood" />
          <Line type="monotone" dataKey="energy" stroke={T.gold} strokeWidth={2} dot={false} name="Energy" />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 4 }}>
        {[["Sleep", cwOf("plum").petal], ["Mood", T.ink], ["Energy", T.gold]].map(([l, c]) => <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: UI, fontSize: 10, color: T.muted }}><span style={{ width: 8, height: 8, borderRadius: 99, background: c }} />{l}</span>)}
      </div>
    </div>
  );
}
function SkinHairLens({ navigate }) {
  return (
    <div>
      <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, lineHeight: 1.55, margin: "0 0 12px" }}>A dedicated tracker for phase-by-phase breakouts, shedding patterns and more.</p>
      <button onClick={() => navigate(createPageUrl("SkinHair"))} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.crimson, color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}><ScanLine size={16} /> Open Skin & Hair</button>
    </div>
  );
}
function Empty({ title, line }) {
  return (
    <div style={{ ...subCard(T.paperDeep), textAlign: "center", padding: "22px 16px" }}>
      <Stethoscope size={20} color={T.muted} style={{ margin: "0 auto 8px", display: "block" }} />
      <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, margin: "0 0 3px" }}>{title}</p>
      <p style={{ fontFamily: SERIF, fontSize: 13.5, color: T.muted, margin: 0, lineHeight: 1.5 }}>{line}</p>
    </div>
  );
}

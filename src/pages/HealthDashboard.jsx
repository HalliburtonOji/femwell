// HealthDashboard — Sprint 11
//
// Single scrollable "command-centre" view that aggregates all the
// user's tracked health data into one page. Eight sections, top to
// bottom:
//
//   1. Cycle & Phase strip          — reproductive / pre-ttc / ttc /
//                                      pregnant users only
//   2. Mood + Energy 30-day sparks  — from DailyCheckins
//   3. Symptom frequency top-5      — from SymptomLogs
//   4. Nutrition 7-day grid         — from MealLog + HydrationLog avg
//   5. Medication adherence dots    — from MedicationLogs
//   6. Sleep 14-day bars            — from DailyCheckins.sleep_hours
//   7. Habit completion dots        — from HabitLogs
//   8. Jess Insight card            — computed from the data above
//
// SVG sparklines are inline (no charting library). Each section
// renders a friendly empty state with a Lucide icon when there's
// no data.
//
// Sprint 9 / 10 alignment — peri / meno / post-meno users skip the
// cycle strip entirely; the rest still apply.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCycleDay } from "@/hooks/useCycleDay";
import { PHASE_RECS } from "@/data/phaseRecs";
import {
  Activity, Heart, Zap, Moon, Utensils, Pill, ListChecks,
  Droplets, Brain, ChevronLeft, Sparkles,
} from "lucide-react";

const C = {
  cream:      "#F4EDDB",
  paper:      "#FBF6E6",
  paperHi:    "#EDE6D5",
  espresso:   "#3A2C1A",
  espressoDk: "#2A1E0E",
  muted:      "#9B8B7A",
  gold:       "#D4AF37",
  sage:       "#8FAF8F",
  blush:      "#E8B4B8",
  border:     "#D4C9B4",
  rose:       "#C4849A",
};

const CYCLE_STAGES = new Set(["reproductive", "pre-ttc", "ttc", "pregnant"]);
const MENO_STAGES  = new Set(["perimenopause", "menopause", "post-menopause"]);

const PHASE_LABEL = {
  menstrual: "Menstrual", follicular: "Follicular",
  ovulatory: "Ovulatory", luteal: "Luteal", unknown: "Today",
};

const PHASE_COLOR = {
  menstrual:  "#C96B9E", follicular: "#9B7FCC",
  ovulatory:  "#E8B84B", luteal:     "#4ABFA3",
  unknown:    "#9B8B7A",
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function lastNDayKeys(n) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return out;
}

// Title-Case a snake / kebab / lowercase symptom_type for display.
function prettyName(s) {
  return String(s || "")
    .replace(/[_-]+/g, " ")
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

// Pull `mood` / `mood_score` (Sprint 8 dual-key) safely as a number.
function readMood(row) {
  if (!row) return null;
  const v = row.mood_score != null ? row.mood_score : row.mood;
  return v != null ? Number(v) : null;
}
function readEnergy(row) {
  if (!row) return null;
  const v = row.energy != null ? row.energy : row.energy_level;
  return v != null ? Number(v) : null;
}

// 7-day rolling avg over an aligned-by-date array of N numbers.
function rollingAvg7(daily) {
  const out = new Array(daily.length).fill(null);
  for (let i = 0; i < daily.length; i++) {
    let sum = 0, count = 0;
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      if (daily[j] != null) { sum += daily[j]; count++; }
    }
    out[i] = count > 0 ? sum / count : null;
  }
  return out;
}

export default function HealthDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Raw data buckets.
  const [checkins30, setCheckins30] = useState([]); // last 30 days, oldest first
  const [symptoms30, setSymptoms30] = useState([]);
  const [meals7, setMeals7]         = useState([]);
  const [hydration7, setHydration7] = useState([]);
  const [meds7, setMeds7]           = useState([]);
  const [habits7, setHabits7]       = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        if (!u?.id) { setLoading(false); return; }
        if (cancelled) return;
        setUser(u);

        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }, null, 1).catch(() => []);
        if (cancelled) return;
        setProfile(profiles?.[0] || null);

        const from30 = daysAgoISO(29);
        const from14 = daysAgoISO(13);
        const from7  = daysAgoISO(6);

        const [ci, sx, ml, hy, md, hb] = await Promise.all([
          base44.entities.DailyCheckins.filter({ user_id: u.id }, "-date", 90).catch(() => []),
          base44.entities.SymptomLogs.filter({ user_id: u.id }, "-date", 200).catch(() => []),
          base44.entities.MealLog.filter({ user_id: u.id }, "-day_key", 100).catch(() => []),
          base44.entities.HydrationLog.filter({ user_id: u.id }, "-day_key", 100).catch(() => []),
          base44.entities.MedicationLogs.filter({ user_id: u.id }, "-date", 100).catch(() => []),
          base44.entities.HabitLogs.filter({ user_id: u.id }, "-date", 100).catch(() => []),
        ]);
        if (cancelled) return;

        // Filter to the windows we need + sort oldest-first for charts.
        const sortByDate = (a, b) => String(a.date || a.day_key || "").localeCompare(String(b.date || b.day_key || ""));
        const keepInRange = (rows, fromIso) => (Array.isArray(rows) ? rows.filter((r) => {
          const key = r?.date || r?.day_key || (r?.logged_at ? String(r.logged_at).slice(0, 10) : "");
          return key && key >= fromIso;
        }).sort(sortByDate) : []);

        setCheckins30(keepInRange(ci, from30));
        setSymptoms30(keepInRange(sx, from30));
        setMeals7(keepInRange(ml, from7));
        setHydration7(keepInRange(hy, from7));
        setMeds7(keepInRange(md, from7));
        setHabits7(keepInRange(hb, from7));
      } catch { /* swallow */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const lifeStage = profile?.life_stage || "reproductive";
  const showCycleStrip = CYCLE_STAGES.has(lifeStage);
  const cycle = useCycleDay(profile);

  // Aligned 30-day mood + energy daily values (null where no check-in).
  const days30 = useMemo(() => lastNDayKeys(30), []);
  const days14 = useMemo(() => lastNDayKeys(14), []);
  const moodDaily   = useMemo(() => alignByDate(checkins30, days30, readMood), [checkins30, days30]);
  const energyDaily = useMemo(() => alignByDate(checkins30, days30, readEnergy), [checkins30, days30]);
  const sleepDaily  = useMemo(() => alignByDate(checkins30.slice(-14), days14, (r) => (r?.sleep_hours != null ? Number(r.sleep_hours) : null)), [checkins30, days14]);
  const moodAvg7    = useMemo(() => avgIgnoreNull(rollingAvg7(moodDaily).slice(-7)),   [moodDaily]);
  const energyAvg7  = useMemo(() => avgIgnoreNull(rollingAvg7(energyDaily).slice(-7)), [energyDaily]);
  const sleepAvg    = useMemo(() => avgIgnoreNull(sleepDaily), [sleepDaily]);

  // Top-5 most-frequent symptoms in last 30 days.
  const topSymptoms = useMemo(() => {
    const counts = new Map();
    for (const r of symptoms30) {
      const k = r?.symptom_type || r?.symptom_name || "";
      if (!k) continue;
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const arr = Array.from(counts.entries()).map(([k, v]) => ({ key: k, count: v }));
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 5);
  }, [symptoms30]);

  // 7-day meal grid: count per day_key.
  const days7 = useMemo(() => lastNDayKeys(7), []);
  const mealsPerDay = useMemo(() => {
    const map = new Map(days7.map((k) => [k, 0]));
    for (const r of meals7) {
      const k = r?.day_key || r?.date;
      if (map.has(k)) map.set(k, map.get(k) + 1);
    }
    return days7.map((k) => map.get(k) || 0);
  }, [meals7, days7]);

  // 7-day hydration daily avg in glasses (250 ml each).
  const hydrationAvgGlasses = useMemo(() => {
    if (!hydration7.length) return null;
    const map = new Map(days7.map((k) => [k, 0]));
    for (const r of hydration7) {
      const k = r?.day_key || r?.date;
      const ml = Number(r?.amount_ml) || 0;
      if (map.has(k)) map.set(k, map.get(k) + ml);
    }
    const dayTotalsMl = days7.map((k) => map.get(k) || 0);
    const avgMl = dayTotalsMl.reduce((a, b) => a + b, 0) / 7;
    return avgMl > 0 ? Math.round(avgMl / 250) : null;
  }, [hydration7, days7]);

  // Medication adherence — per medication, last-7-day taken dots.
  const medAdherence = useMemo(() => {
    const byMed = new Map();
    for (const r of meds7) {
      const name = r?.item_name || r?.medication_name || "Medication";
      if (!byMed.has(name)) byMed.set(name, new Set());
      const k = r?.date || r?.day_key;
      const taken = r?.taken === true || r?.taken === "true";
      if (k && taken) byMed.get(name).add(k);
    }
    return Array.from(byMed.entries()).map(([name, takenSet]) => ({
      name,
      dots: days7.map((k) => takenSet.has(k)),
    }));
  }, [meds7, days7]);

  // Habit completion — per habit, last 7-day dots.
  const habitAdherence = useMemo(() => {
    const byHabit = new Map();
    for (const r of habits7) {
      const name = r?.habit_name || r?.habit_type || "Habit";
      if (!byHabit.has(name)) byHabit.set(name, new Set());
      const k = r?.date || r?.day_key;
      const done = r?.completed === true || r?.is_completed === true;
      if (k && done) byHabit.get(name).add(k);
    }
    return Array.from(byHabit.entries()).map(([name, doneSet]) => ({
      name,
      dots: days7.map((k) => doneSet.has(k)),
    }));
  }, [habits7, days7]);

  // Pick the most relevant Jess insight from the data above.
  const insight = useMemo(() => {
    // Trend check — last 3 days vs prior 3 days mood.
    const recent3 = moodDaily.slice(-3).filter((v) => v != null);
    const prior3  = moodDaily.slice(-6, -3).filter((v) => v != null);
    if (recent3.length >= 2 && prior3.length >= 2) {
      const r = recent3.reduce((a, b) => a + b, 0) / recent3.length;
      const p = prior3.reduce((a, b) => a + b, 0) / prior3.length;
      if (r < p - 0.5) {
        return "Your mood has been dipping the past few days. Jess suggests gentle company — a warm drink, a slow walk, or a quiet evening. Reach out to someone you trust if it lingers.";
      }
    }
    if (sleepAvg != null && sleepAvg < 6) {
      return "You've averaged under 6 hours of sleep recently. Rest is recovery — protect a wind-down window tonight and let tomorrow be quieter.";
    }
    if (symptoms30.length === 0 && checkins30.length > 0) {
      return "You've had a clear stretch with no symptoms logged. Keep tracking — patterns only show up across weeks, not days.";
    }
    if (showCycleStrip && cycle?.phase) {
      const block = PHASE_RECS?.[cycle.phase];
      if (block?.movement?.tip) return block.movement.tip;
      if (block?.nutrition?.tip) return block.nutrition.tip;
    }
    return "Tracking is its own kind of self-respect. Keep noticing — Jess is here when you want to talk it through.";
  }, [moodDaily, sleepAvg, symptoms30.length, checkins30.length, cycle?.phase, showCycleStrip]);

  if (loading) {
    return (
      <div style={shell}>
        <p style={{ color: C.muted, fontFamily: "'Inter', system-ui, sans-serif" }}>Loading your health…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.cream, color: C.espresso, fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: 100 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "18px 18px 32px" }}>
        <Link to="/Today" style={backLink}>
          <ChevronLeft size={16} /> Back
        </Link>

        <header style={{ margin: "12px 0 20px" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.rose }}>
            Command centre
          </p>
          <h1 style={{ margin: "6px 0 4px", fontSize: 30, fontWeight: 600, fontFamily: "'Fraunces', Georgia, serif", color: C.espressoDk, lineHeight: 1.1, letterSpacing: -0.4 }}>
            Your Health
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: C.muted, lineHeight: 1.5 }}>
            Everything in one place.
          </p>
        </header>

        {/* 1. Cycle strip — gated */}
        {showCycleStrip && cycle?.phase && (
          <CycleStrip phase={cycle.phase} day={cycle.cycleDay || cycle.dayInCycle || 1} cycleLen={cycle.cycleLen || 28} />
        )}

        {/* 2. Mood + Energy sparks */}
        <Section title="Mood & Energy" subtitle="Last 30 days" icon={<Heart size={16} />} accent={C.blush}>
          {moodDaily.some((v) => v != null) ? (
            <>
              <SparkRow label="Mood"   values={rollingAvg7(moodDaily)}   color={C.blush} avg7={moodAvg7} />
              <SparkRow label="Energy" values={rollingAvg7(energyDaily)} color={C.sage}  avg7={energyAvg7} />
            </>
          ) : (
            <Empty icon={<Heart size={20} />} text="Start tracking your check-ins to see trends here." />
          )}
        </Section>

        {/* 3. Symptom frequency */}
        <Section title="Symptoms" subtitle="Last 30 days" icon={<Activity size={16} />} accent={C.gold}>
          {topSymptoms.length > 0 ? (
            <FrequencyBars items={topSymptoms} />
          ) : (
            <Empty icon={<Activity size={20} />} text="No symptoms logged. Tap a symptom on the Track tab to start." />
          )}
        </Section>

        {/* 4. Nutrition */}
        <Section title="Nutrition" subtitle="Last 7 days" icon={<Utensils size={16} />} accent={C.gold}>
          {meals7.length > 0 || hydrationAvgGlasses != null ? (
            <NutritionGrid mealsPerDay={mealsPerDay} hydrationAvgGlasses={hydrationAvgGlasses} />
          ) : (
            <Empty icon={<Utensils size={20} />} text="No meals or hydration logged this week." />
          )}
        </Section>

        {/* 5. Medication adherence */}
        <Section title="Medications & Supplements" subtitle="Last 7 days" icon={<Pill size={16} />} accent={C.gold}>
          {medAdherence.length > 0 ? (
            <AdherenceList items={medAdherence} />
          ) : (
            <Empty icon={<Pill size={20} />} text="No medications tracked. Add one on the Track tab to see adherence." />
          )}
        </Section>

        {/* 6. Sleep */}
        <Section title="Sleep" subtitle="Last 14 days" icon={<Moon size={16} />} accent={C.sage}>
          {sleepDaily.some((v) => v != null) ? (
            <SleepBars values={sleepDaily} avg={sleepAvg} />
          ) : (
            <Empty icon={<Moon size={20} />} text="Log sleep hours on your morning check-in to see this." />
          )}
        </Section>

        {/* 7. Habits */}
        <Section title="Habits" subtitle="Last 7 days" icon={<ListChecks size={16} />} accent={C.sage}>
          {habitAdherence.length > 0 ? (
            <AdherenceList items={habitAdherence} />
          ) : (
            <Empty icon={<ListChecks size={20} />} text="No habits tracked. Build a ritual on the Track tab." />
          )}
        </Section>

        {/* 8. Jess insight */}
        <article style={{
          background: C.paperHi, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.rose}`, borderRadius: 18,
          padding: "16px 16px 14px", margin: "8px 0 0",
        }}>
          <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 30, height: 30, borderRadius: 10, background: "rgba(196,132,154,0.18)", color: C.rose, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={16} />
            </span>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.rose }}>Jess insight</p>
              <h3 style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 600, fontFamily: "'Fraunces', Georgia, serif", color: C.espressoDk }}>
                Where you're at this week
              </h3>
            </div>
          </header>
          <p style={{ margin: 0, fontSize: 14, color: C.espresso, lineHeight: 1.55 }}>
            {insight}
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 10.5, color: C.muted, fontStyle: "italic" }}>
            Not medical advice — for your own self-tracking.
          </p>
        </article>
      </div>
    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────

function Section({ title, subtitle, icon, accent, children }) {
  return (
    <section style={{
      background: C.paperHi, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${accent}`, borderRadius: 18,
      padding: "14px 16px 14px", margin: "0 0 14px",
    }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: accent + "22", color: accent, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted }}>{subtitle}</p>
          <h2 style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 600, fontFamily: "'Fraunces', Georgia, serif", color: C.espressoDk, lineHeight: 1.2 }}>{title}</h2>
        </div>
      </header>
      {children}
    </section>
  );
}

function Empty({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", color: C.muted }}>
      <span style={{ flexShrink: 0, opacity: 0.6 }}>{icon}</span>
      <p style={{ margin: 0, fontSize: 13, fontStyle: "italic", lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function CycleStrip({ phase, day, cycleLen }) {
  const color = PHASE_COLOR[phase] || PHASE_COLOR.unknown;
  const label = PHASE_LABEL[phase] || "Today";
  const pct = Math.min(100, Math.max(0, ((Number(day) || 1) / Math.max(1, cycleLen)) * 100));
  return (
    <section style={{
      background: C.paperHi, border: `1px solid ${C.border}`, borderLeft: `3px solid ${color}`,
      borderRadius: 18, padding: "14px 16px", margin: "0 0 14px",
    }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: color + "22", color, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Activity size={16} />
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted }}>Cycle</p>
          <h2 style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 600, fontFamily: "'Fraunces', Georgia, serif", color: C.espressoDk }}>
            {label} · Day {day}
          </h2>
        </div>
        <span style={{
          padding: "4px 10px", borderRadius: 999, background: color + "22", color,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>Day {day}/{cycleLen}</span>
      </header>
      <div style={{ height: 8, borderRadius: 999, background: C.cream, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width 240ms ease" }} />
      </div>
    </section>
  );
}

// Mood + Energy sparkline row. Renders an SVG sparkline filled to a
// 1–5 scale on a cream background.
function SparkLine({ values, color }) {
  const W = 320, H = 56, PAD = 4;
  const xs = values;
  const min = 1, max = 5;
  const points = xs.map((v, i) => {
    const x = PAD + (i * (W - 2 * PAD)) / Math.max(1, xs.length - 1);
    const y = v == null
      ? null
      : PAD + (H - 2 * PAD) * (1 - (Math.min(max, Math.max(min, v)) - min) / (max - min));
    return { x, y };
  });
  let d = "";
  let started = false;
  for (const p of points) {
    if (p.y == null) continue;
    d += started ? ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    started = true;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: H, display: "block" }}>
      <rect x="0" y="0" width={W} height={H} fill={C.cream} />
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={C.border} strokeWidth="0.5" />
      <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.filter((p) => p.y != null).slice(-1).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
    </svg>
  );
}

function SparkRow({ label, values, color, avg7 }) {
  return (
    <div style={{ margin: "0 0 12px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.espresso }}>{label}</p>
        <p style={{ margin: 0, fontSize: 11, color: C.muted }}>
          {avg7 != null ? `7-day avg: ${avg7.toFixed(1)}` : "7-day avg: —"}
        </p>
      </div>
      <SparkLine values={values} color={color} />
    </div>
  );
}

function FrequencyBars({ items }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((s) => (
        <div key={s.key} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 2fr 48px", gap: 10, alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: 13, color: C.espresso, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {prettyName(s.key)}
          </p>
          <div style={{ height: 10, borderRadius: 999, background: C.cream, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(s.count / max) * 100}%`, background: C.gold }} />
          </div>
          <p style={{ margin: 0, fontSize: 12, color: C.muted, textAlign: "right" }}>{s.count} times</p>
        </div>
      ))}
    </div>
  );
}

function NutritionGrid({ mealsPerDay, hydrationAvgGlasses }) {
  const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
  const MAX_SEGMENTS = 4; // up to 4 meals/day before clamping the column.
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, alignItems: "end", padding: "6px 0 4px" }}>
        {mealsPerDay.map((count, idx) => {
          const filled = Math.min(MAX_SEGMENTS, count);
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ display: "flex", flexDirection: "column-reverse", gap: 2, height: 64, width: 18 }}>
                {Array.from({ length: MAX_SEGMENTS }).map((_, i) => (
                  <span key={i} style={{
                    flex: 1, borderRadius: 3,
                    background: i < filled ? C.gold : C.cream,
                    border: `1px solid ${C.border}`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 10, color: C.muted, letterSpacing: "0.04em" }}>{DAY_LETTERS[idx % 7]}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "8px 10px", background: C.cream, border: `1px solid ${C.border}`, borderRadius: 10 }}>
        <Droplets size={14} style={{ color: C.sage }} />
        <p style={{ margin: 0, fontSize: 13, color: C.espresso }}>
          Avg hydration: <strong>{hydrationAvgGlasses != null ? `${hydrationAvgGlasses} glasses/day` : "—"}</strong>
        </p>
      </div>
    </div>
  );
}

function AdherenceList({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((it) => (
        <div key={it.name} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: 13, color: C.espresso, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {it.name}
          </p>
          <div style={{ display: "flex", gap: 5 }}>
            {it.dots.map((on, i) => (
              <span key={i} style={{
                width: 14, height: 14, borderRadius: 999,
                background: on ? C.sage : C.cream,
                border: `1.5px solid ${on ? C.sage : C.border}`,
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SleepBars({ values, avg }) {
  const MAX = 9;
  return (
    <div>
      <div style={{ display: "flex", gap: 4, alignItems: "end", height: 70 }}>
        {values.map((v, i) => {
          const h = v == null ? 0 : Math.min(MAX, Math.max(0, Number(v)));
          const pct = (h / MAX) * 100;
          return (
            <span key={i} title={v == null ? "no log" : `${v}h`}
              style={{
                flex: 1,
                height: `${Math.max(4, pct)}%`,
                background: v == null ? C.cream : C.sage,
                border: `1px solid ${v == null ? C.border : C.sage}`,
                borderRadius: 4,
              }}
            />
          );
        })}
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 12, color: C.muted }}>
        Avg: {avg != null ? `${avg.toFixed(1)}h / night` : "—"}
      </p>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────

function alignByDate(rows, days, extract) {
  const map = new Map();
  for (const r of rows) {
    const key = r?.date || r?.day_key || (r?.logged_at ? String(r.logged_at).slice(0, 10) : "");
    if (!key) continue;
    const v = extract(r);
    if (v != null) map.set(key, v);
  }
  return days.map((k) => (map.has(k) ? map.get(k) : null));
}

function avgIgnoreNull(arr) {
  const vals = (arr || []).filter((v) => v != null && Number.isFinite(Number(v))).map(Number);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

const shell = {
  minHeight: "100vh",
  background: C.cream,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const backLink = {
  display: "inline-flex", alignItems: "center", gap: 4,
  color: C.muted, textDecoration: "none",
  fontSize: 13, padding: "6px 0",
};

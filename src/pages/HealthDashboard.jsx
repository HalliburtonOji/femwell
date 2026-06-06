// HealthDashboard — Sprint 11 (rewritten per new spec)
//
// /HealthDashboard — a single scrollable, mobile-first page that
// aggregates every health entity the user logs into ONE picture.
// All charts rendered inline as SVG; no external charting library.
//
// Eight sections, top to bottom:
//   1. Cycle / Life Stage strip  — gentle banner for meno stages,
//                                  cycle day + 5-week mini calendar otherwise.
//   2. Mood & Energy 30-day      — two side-by-side SVG sparklines,
//                                  blush for mood, sage for energy.
//   3. Symptom frequency top-5   — horizontal espresso bars.
//   4. Nutrition summary         — SVG donut for days with ≥3 meals + latest plan_name.
//   5. Adherence (HRT/med/supp)  — 14-day dot rows.
//   6. Sleep 14-day              — vertical bars colour-coded by hours.
//   7. Habit 30-day grid         — 5×6 GitHub-style contribution grid.
//   8. Jess insight              — warm card + CTA + 7-day-streak flair.
//
// All queries fire once at mount, in parallel. Each section gates
// independently on its own data so empty states don't cascade.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCycleDay } from "@/hooks/useCycleDay";
import {
  BarChart2, Heart, Zap, Activity, Utensils, Pill, Moon, ListChecks,
  Sparkles, ChevronLeft, ArrowRight,
} from "lucide-react";

const C = {
  cream:      "#F4EDDB",
  paper:      "#FBF6E6",
  paperHi:    "#EDE6D5",
  espresso:   "#3A2C1A",
  espressoDk: "#2A1E0E",
  muted:      "#9B8B7A",
  mutedLight: "#D4C9B4",
  gold:       "#D4AF37",
  goldLight:  "#F0DFA8",
  sage:       "#8FAF8F",
  sageLight:  "#C8DDC8",
  blush:      "#E8B4B8",
  blushLight: "#F2D4D6",
  border:     "#D4C9B4",
  rose:       "#C4849A",
};

const MENO_STAGES = new Set(["perimenopause", "menopause", "post-menopause"]);

const PHASE_COLOR = {
  menstrual:   C.muted,
  follicular:  C.sage,
  ovulatory:   C.gold,
  luteal:      C.blush,
  unknown:     C.muted,
};
const PHASE_LABEL = {
  menstrual: "Menstrual", follicular: "Follicular",
  ovulatory: "Ovulatory", luteal: "Luteal", unknown: "Today",
};

function todayLocal() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function isoOf(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function lastNDays(n) {
  const out = []; const today = todayLocal();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    out.push(isoOf(d));
  }
  return out;
}
function prettyName(s) {
  return String(s || "").replace(/[_-]+/g, " ").replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function readMood(r)   { const v = r?.mood_score ?? r?.mood;          return v != null ? Number(v) : null; }
function readEnergy(r) { const v = r?.energy_level ?? r?.energy;      return v != null ? Number(v) : null; }
function dateKeyOf(r)  { return r?.date || r?.day_key || (r?.logged_at ? String(r.logged_at).slice(0,10) : "") || (r?.created_date ? String(r.created_date).slice(0,10) : ""); }

// 5-week mini calendar phase derivation. Given a profile with
// last_period_start_date + cycle_avg_length + period_length, return
// the phase for any given date inside the visible 5×7 grid.
function phaseForDate(profile, date) {
  if (!profile?.last_period_start_date) return "unknown";
  const cycleLen  = Number(profile.cycle_avg_length) || 28;
  const periodLen = Number(profile.period_length)    || 5;
  const start = new Date(profile.last_period_start_date); start.setHours(0,0,0,0);
  const days = Math.floor((date - start) / 86400000);
  if (days < 0) return "unknown";
  const norm = ((days % cycleLen) + cycleLen) % cycleLen + 1;
  if (norm <= periodLen) return "menstrual";
  if (norm <= Math.floor(cycleLen * 0.43)) return "follicular";
  if (norm <= Math.floor(cycleLen * 0.5))  return "ovulatory";
  return "luteal";
}

export default function HealthDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Raw buckets — filtered to the right windows once.
  const [checkins, setCheckins]   = useState([]); // last 30 days
  const [symptoms, setSymptoms]   = useState([]); // last 30 days
  const [meals7,   setMeals7]     = useState([]);
  const [meds14,   setMeds14]     = useState([]);
  const [supps14,  setSupps14]    = useState([]);
  const [habits30, setHabits30]   = useState([]);

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

        // Spec says { created_by: user.id }. The FemWell convention is
        // `user_id`, and `created_by` in base44 stores the email. We
        // run both queries per entity in parallel and merge the result
        // by id — whichever shape the schema actually keys on, the
        // row comes through.
        const both = async (entName) => {
          const ent = base44.entities?.[entName];
          if (!ent?.filter) return [];
          const [a, b] = await Promise.all([
            ent.filter({ user_id: u.id }).catch(() => []),
            u.email ? ent.filter({ created_by: u.email }).catch(() => []) : Promise.resolve([]),
          ]);
          const seen = new Set();
          const out = [];
          for (const r of [...(a || []), ...(b || [])]) {
            if (!r || seen.has(r.id)) continue;
            seen.add(r.id);
            out.push(r);
          }
          return out;
        };
        const [allChk, allSym, allMeal, allMed, allSupp, allHab] = await Promise.all([
          both("DailyCheckins"),
          both("SymptomLogs"),
          both("MealLog"),
          both("MedicationLogs"),
          both("SupplementLog"),
          both("HabitLogs"),
        ]);
        if (cancelled) return;

        const today = todayLocal();
        const cutoff30 = new Date(today); cutoff30.setDate(today.getDate() - 29);
        const cutoff14 = new Date(today); cutoff14.setDate(today.getDate() - 13);
        const cutoff7  = new Date(today); cutoff7.setDate(today.getDate()  - 6);
        const since = (rows, cutoff) => rows
          .filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= cutoff; })
          .sort((a, b) => String(dateKeyOf(a)).localeCompare(String(dateKeyOf(b))));

        setCheckins(since(allChk, cutoff30));
        setSymptoms(since(allSym, cutoff30));
        setMeals7(  since(allMeal, cutoff7));
        setMeds14(  since(allMed,  cutoff14));
        setSupps14( since(allSupp, cutoff14));
        setHabits30(since(allHab,  cutoff30));
      } catch { /* swallow */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const lifeStage   = profile?.life_stage || "reproductive";
  const isMenoStage = MENO_STAGES.has(lifeStage);
  const cycle       = useCycleDay(profile);

  // ── Aligned daily series for charts ────────────────────────────
  const days30 = useMemo(() => lastNDays(30), []);
  const days14 = useMemo(() => lastNDays(14), []);
  const days7  = useMemo(() => lastNDays(7),  []);
  const moodDaily   = useMemo(() => align(checkins, days30, readMood),   [checkins, days30]);
  const energyDaily = useMemo(() => align(checkins, days30, readEnergy), [checkins, days30]);
  const sleepDaily  = useMemo(() => align(checkins, days14, (r) => (r?.sleep_hours != null ? Number(r.sleep_hours) : null)), [checkins, days14]);

  // Symptom top-5
  const topSymptoms = useMemo(() => {
    const counts = new Map();
    for (const r of symptoms) {
      const k = r?.symptom_type || r?.symptom_name || "";
      if (!k) continue;
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [symptoms]);

  // Nutrition donut + latest plan_name
  const mealsPerDay = useMemo(() => {
    const m = new Map(days7.map((k) => [k, 0]));
    for (const r of meals7) { const k = dateKeyOf(r); if (m.has(k)) m.set(k, m.get(k) + 1); }
    return days7.map((k) => m.get(k) || 0);
  }, [meals7, days7]);
  const onTrackDays = mealsPerDay.filter((c) => c >= 3).length;
  const latestPlanName = useMemo(() => {
    const named = meals7.filter((r) => r?.plan_name).sort((a, b) => String(dateKeyOf(b)).localeCompare(String(dateKeyOf(a))));
    return named[0]?.plan_name || null;
  }, [meals7]);

  // Adherence — group by item name, 14-day dots.
  const hrtName = (profile?.hrt_medication || "HRT").trim() || "HRT";
  const medAdherence = useMemo(() => {
    const groups = new Map();
    for (const r of meds14) {
      const name = (r?.item_name || r?.medication_name || "Medication").trim();
      if (!groups.has(name)) groups.set(name, new Set());
      const k = dateKeyOf(r);
      const taken = r?.taken === true || r?.taken === "true";
      if (k && taken) groups.get(name).add(k);
    }
    const arr = Array.from(groups.entries()).map(([name, set]) => ({
      name,
      isHrt: /hrt|estradiol|oestradiol|progesterone|tibolone/i.test(name) || (r => r === name)(hrtName),
      dots: days14.map((k) => set.has(k)),
    }));
    // Meno-stage users → HRT row first.
    if (isMenoStage) {
      arr.sort((a, b) => (b.isHrt ? 1 : 0) - (a.isHrt ? 1 : 0));
    }
    return arr;
  }, [meds14, days14, hrtName, isMenoStage]);

  const suppAdherence = useMemo(() => {
    const groups = new Map();
    for (const r of supps14) {
      const name = (r?.supplement_name || r?.item_name || "Supplement").trim();
      if (!groups.has(name)) groups.set(name, new Set());
      const k = dateKeyOf(r);
      if (k) groups.get(name).add(k);
    }
    return Array.from(groups.entries()).map(([name, set]) => ({ name, dots: days14.map((k) => set.has(k)) }));
  }, [supps14, days14]);

  // Sleep avg
  const sleepAvg = useMemo(() => {
    const vals = sleepDaily.filter((v) => v != null && Number.isFinite(Number(v))).map(Number);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [sleepDaily]);

  // Habit grid 30-day completion count per day
  const habitPerDay = useMemo(() => {
    const m = new Map(days30.map((k) => [k, 0]));
    for (const r of habits30) {
      const k = dateKeyOf(r);
      const done = r?.completed === true || r?.is_completed === true;
      if (k && done && m.has(k)) m.set(k, m.get(k) + 1);
    }
    return days30.map((k) => m.get(k) || 0);
  }, [habits30, days30]);
  const habitsCompletedTotal = habitPerDay.reduce((a, b) => a + b, 0);

  // Mood streak — consecutive trailing days with a mood entry.
  const moodStreak = useMemo(() => {
    let s = 0;
    for (let i = moodDaily.length - 1; i >= 0; i--) {
      if (moodDaily[i] != null) s++;
      else break;
    }
    return s;
  }, [moodDaily]);

  if (loading) {
    return (
      <div style={shell}>
        <p style={{ color: C.muted, }}>Loading your health story…</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.cream, color: C.espresso,
      paddingBottom: 120,
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "18px 18px 32px" }}>
        <Link to="/Today" style={backLink}>
          <ChevronLeft size={16} /> Back
        </Link>

        <header style={{ margin: "12px 0 18px" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.rose }}>
            Your story so far
          </p>
          <h1 className="fw-display" style={{ margin: "6px 0 4px" }}>Health</h1>
          <h2 className="fw-heading" style={{ margin: "0 0 6px" }}>
            Your Health Story
          </h2>
          <p style={{ margin: 0, fontSize: 14.5, color: C.muted, lineHeight: 1.55 }}>
            Here's your health picture at a glance — patterns only you can see.
          </p>
        </header>

        {/* 1. Cycle / Life Stage strip */}
        {isMenoStage
          ? <LifeStageStrip stage={lifeStage} />
          : <CycleStrip cycle={cycle} profile={profile} />
        }

        {/* 2. Mood & Energy sparklines */}
        <Section title="Mood & Energy" subtitle="Last 30 days" icon={<Heart size={16} />} accent={C.blush}>
          {moodDaily.filter((v) => v != null).length >= 3 ? (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <SparkBlock label="Mood"   color={C.blush} values={moodDaily}   IconCmp={Heart} />
              <SparkBlock label="Energy" color={C.sage}  values={energyDaily} IconCmp={Zap} />
            </div>
          ) : <Empty icon={<Heart size={20} />} text="Log your mood daily to see your pattern." />}
        </Section>

        {/* 3. Symptom frequency */}
        <Section title="Symptoms" subtitle="Last 30 days" icon={<Activity size={16} />} accent={C.gold}>
          {topSymptoms.length > 0
            ? <FreqBars items={topSymptoms} />
            : <Empty icon={<Activity size={20} />} text="No symptoms logged in the last 30 days." />}
        </Section>

        {/* 4. Nutrition summary */}
        <Section title="Nutrition" subtitle="Last 7 days" icon={<Utensils size={16} />} accent={C.gold}>
          {meals7.length > 0
            ? <NutritionBlock onTrackDays={onTrackDays} totalMeals={meals7.length} planName={latestPlanName} />
            : <Empty icon={<Utensils size={20} />} text="Start logging meals to see your nutrition picture." />}
        </Section>

        {/* 5. Adherence */}
        <Section title="Medications & Supplements" subtitle="Last 14 days" icon={<Pill size={16} />} accent={C.sage}>
          {(medAdherence.length + suppAdherence.length) > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {medAdherence.map((m) => <AdherenceRow key={"med-" + m.name} name={m.name} dots={m.dots} accent={m.isHrt ? C.gold : C.sage} />)}
              {suppAdherence.map((s) => <AdherenceRow key={"supp-" + s.name} name={s.name} dots={s.dots} accent={C.sage} />)}
              {medAdherence.length === 0 && <p style={{ margin: 0, fontSize: 12, color: C.muted, fontStyle: "italic" }}>No medications logged yet.</p>}
              {suppAdherence.length === 0 && <p style={{ margin: 0, fontSize: 12, color: C.muted, fontStyle: "italic" }}>No supplements logged yet.</p>}
            </div>
          ) : <Empty icon={<Pill size={20} />} text="No medications or supplements logged yet." />}
        </Section>

        {/* 6. Sleep */}
        <Section title="Sleep" subtitle="Last 14 days" icon={<Moon size={16} />} accent={C.sage}>
          {sleepDaily.some((v) => v != null)
            ? <SleepBars values={sleepDaily} avg={sleepAvg} />
            : <Empty icon={<Moon size={20} />} text="Log sleep in your Morning Brief to see trends." />}
        </Section>

        {/* 7. Habit completion grid */}
        <Section title="Habits" subtitle="Last 30 days" icon={<ListChecks size={16} />} accent={C.sage}>
          {habits30.length > 0
            ? <HabitGrid values={habitPerDay} totalCompletions={habitsCompletedTotal} />
            : <Empty icon={<ListChecks size={20} />} text="Track habits daily to see your consistency." />}
        </Section>

        {/* 8. Jess insight */}
        <article style={{
          background: C.paperHi, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.gold}`,
          borderRadius: 18, padding: "16px 16px 14px", margin: "8px 0 14px",
        }}>
          <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(212,175,55,0.18)", color: C.gold, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} />
            </span>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold }}>From Jess</p>
              <h3 style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 600, color: C.espressoDk }}>
                A quiet observation
              </h3>
            </div>
          </header>
          {moodStreak >= 7 && (
            <p style={{
              margin: "0 0 10px",
              padding: "8px 10px", borderRadius: 10,
              background: "rgba(212,175,55,0.16)", color: C.espressoDk,
              fontSize: 13, fontWeight: 600,
            }}>
              🌟 {moodStreak}-day logging streak — Jess has noticed.
            </p>
          )}
          <p style={{ margin: 0, fontSize: 14, color: C.espresso, lineHeight: 1.55 }}>
            Jess is watching your patterns. The more you log, the smarter her insights become.
          </p>
          <Link to="/Assistant" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 12,
            padding: "10px 14px", borderRadius: 12,
            background: C.espresso, color: C.cream,
            textDecoration: "none", fontWeight: 700, fontSize: 13,
          }}>
            Chat with Jess <ArrowRight size={14} />
          </Link>
        </article>

        <p style={{
          margin: "16px 4px 0", fontSize: 11, color: C.muted,
          fontStyle: "italic", lineHeight: 1.5, textAlign: "center",
        }}>
          FemWell Health Story is for personal insight only — not medical advice. Jess is a wellness companion.
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function Section({ title, subtitle, icon, accent, children }) {
  return (
    <section style={{
      background: C.paperHi, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${accent}`, borderRadius: 18,
      padding: "14px 16px 14px", margin: "0 0 14px",
    }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: accent + "22", color: accent, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted }}>{subtitle}</p>
          <h2 style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 600, color: C.espressoDk, lineHeight: 1.2 }}>{title}</h2>
        </div>
      </header>
      {children}
    </section>
  );
}

function Empty({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", color: C.muted }}>
      <span style={{ flexShrink: 0, opacity: 0.6 }}>{icon}</span>
      <p style={{ margin: 0, fontSize: 13, fontStyle: "italic", lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function LifeStageStrip({ stage }) {
  const map = {
    perimenopause:    { label: "Perimenopause", line: "Hormones are shifting. Tracking is your map." },
    menopause:        { label: "Menopause",     line: "A transition, not a problem to fix." },
    "post-menopause": { label: "Post-menopause", line: "Steady support — bones, sleep, mood, energy." },
  };
  const info = map[stage] || map.perimenopause;
  return (
    <section style={{
      background: C.paperHi, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${C.rose}`, borderRadius: 18,
      padding: "14px 16px", margin: "0 0 14px",
    }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.rose }}>Life stage</p>
      <h2 style={{ margin: "4px 0 4px", fontSize: 18, fontWeight: 600, color: C.espressoDk }}>
        Life stage: {info.label}
      </h2>
      <p style={{ margin: 0, fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>{info.line}</p>
    </section>
  );
}

function CycleStrip({ cycle, profile }) {
  const phase = cycle?.phase || "unknown";
  const day   = cycle?.cycleDay || cycle?.dayInCycle || 1;
  const cycleLen = cycle?.cycleLen || cycle?.cycleLength || 28;
  const tint  = PHASE_COLOR[phase] || C.muted;

  // 5×7 grid spanning a centred window around today.
  const today = todayLocal();
  const start = new Date(today); start.setDate(today.getDate() - 17); // 17 days back so today lands in the middle
  const cells = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const p = phaseForDate(profile, d);
    const isToday = d.getTime() === today.getTime();
    cells.push({ p, isToday });
  }

  return (
    <section style={{
      background: C.paperHi, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${tint}`, borderRadius: 18,
      padding: "14px 16px", margin: "0 0 14px",
    }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: tint + "22", color: tint, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Activity size={16} />
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted }}>Cycle</p>
          <h2 style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 600, color: C.espressoDk }}>
            {PHASE_LABEL[phase]} · Day {day}
          </h2>
        </div>
        <span style={{
          padding: "4px 10px", borderRadius: 999, background: tint + "22", color: tint,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>{day}/{cycleLen}</span>
      </header>

      {/* 5×7 mini calendar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 6,
        padding: "4px 0",
      }}>
        {cells.map((c, i) => (
          <span key={i} style={{
            aspectRatio: "1",
            borderRadius: 999,
            background: PHASE_COLOR[c.p] || C.cream,
            opacity: c.isToday ? 1 : 0.6,
            outline: c.isToday ? `2px solid ${C.espressoDk}` : "none",
            outlineOffset: 1,
            border: c.p === "unknown" ? `1px solid ${C.border}` : "none",
          }} />
        ))}
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 11, color: C.muted, textAlign: "center" }}>
        Today is centred. Phase colours: sage=follicular · gold=ovulatory · blush=luteal · muted=menstrual.
      </p>
    </section>
  );
}

function SparkBlock({ label, color, values, IconCmp }) {
  // Mini SVG sparkline. 1-5 axis, last point highlighted in gold.
  const W = 280, H = 84, PAD = 6;
  const pts = values.map((v, i) => {
    const x = PAD + (i * (W - 2 * PAD)) / Math.max(1, values.length - 1);
    if (v == null) return { x, y: null };
    const clamped = Math.min(5, Math.max(1, v));
    const y = PAD + (H - 2 * PAD) * (1 - (clamped - 1) / 4);
    return { x, y };
  });
  let d = ""; let started = false;
  for (const p of pts) {
    if (p.y == null) continue;
    d += started ? ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    started = true;
  }
  // Find the last non-null point for the "today" highlight.
  let lastReal = null;
  for (let i = pts.length - 1; i >= 0; i--) {
    if (pts[i].y != null) { lastReal = pts[i]; break; }
  }
  const definedCount = values.filter((v) => v != null).length;
  const avg7 = (() => {
    const tail = values.slice(-7).filter((v) => v != null);
    if (!tail.length) return null;
    return tail.reduce((a, b) => a + b, 0) / tail.length;
  })();

  return (
    <div style={{
      flex: "1 1 200px", minWidth: 240,
      background: C.cream, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "10px 12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <IconCmp size={14} style={{ color }} />
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: C.espresso }}>{label}</p>
        <span style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>
          {avg7 != null ? `Avg ${avg7.toFixed(1)}/5` : `${definedCount} logs`}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 64, display: "block" }}>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={C.border} strokeWidth="0.6" />
        {/* 30 dots for each daily slot */}
        {pts.map((p, i) => p.y != null ? (
          <circle key={i} cx={p.x} cy={p.y} r="1.6" fill={color} opacity="0.7" />
        ) : null)}
        <path d={d} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {lastReal && <circle cx={lastReal.x} cy={lastReal.y} r="3.5" fill={C.gold} stroke={C.espressoDk} strokeWidth="0.8" />}
      </svg>
    </div>
  );
}

function FreqBars({ items }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((s) => (
        <div key={s.key} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 2fr 56px", gap: 10, alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: 13, color: C.espresso, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {prettyName(s.key)}
          </p>
          <div style={{ height: 12, borderRadius: 999, background: C.cream, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(s.count / max) * 100}%`, background: C.espresso }} />
          </div>
          <p style={{ margin: 0, fontSize: 12, color: C.muted, textAlign: "right" }}>{s.count}×</p>
        </div>
      ))}
    </div>
  );
}

function NutritionBlock({ onTrackDays, totalMeals, planName }) {
  // SVG donut — gold ring for `onTrackDays/7`.
  const RADIUS = 28, STROKE = 8, SIZE = 80, CENTER = SIZE / 2;
  const circ = 2 * Math.PI * RADIUS;
  const pct = Math.max(0, Math.min(1, onTrackDays / 7));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: 88, height: 88, flexShrink: 0 }}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke={C.mutedLight} strokeWidth={STROKE} />
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none"
          stroke={C.gold} strokeWidth={STROKE} strokeLinecap="round"
          strokeDasharray={`${(circ * pct).toFixed(2)} ${circ.toFixed(2)}`}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
        <text x={CENTER} y={CENTER + 5} textAnchor="middle" fontSize="20" fontWeight="600" fill={C.espressoDk}>{onTrackDays}/7</text>
      </svg>
      <div style={{ flex: 1, minWidth: 160 }}>
        <p style={{ margin: 0, fontSize: 14.5, color: C.espresso, lineHeight: 1.5 }}>
          <strong>{totalMeals} meals</strong> logged this week.
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
          {onTrackDays >= 5
            ? "On track most days."
            : onTrackDays >= 3
            ? "A steady middle."
            : "A sparse week — gentle next steps."}
        </p>
        {planName && (
          <p style={{
            margin: "8px 0 0", display: "inline-block",
            padding: "4px 10px", borderRadius: 999,
            background: C.cream, border: `1px solid ${C.border}`,
            fontSize: 11.5, color: C.espresso, fontWeight: 600,
          }}>{planName}</p>
        )}
      </div>
    </div>
  );
}

function AdherenceRow({ name, dots, accent }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "center" }}>
      <p style={{ margin: 0, fontSize: 13, color: C.espresso, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
      <div style={{ display: "flex", gap: 4 }}>
        {dots.map((on, i) => (
          <span key={i} style={{
            width: 12, height: 12, borderRadius: 999,
            background: on ? accent : C.cream,
            border: `1px solid ${on ? accent : C.border}`,
          }} />
        ))}
      </div>
    </div>
  );
}

function SleepBars({ values, avg }) {
  const MAX = 10;
  return (
    <div>
      <div style={{ display: "flex", gap: 4, alignItems: "end", height: 80 }}>
        {values.map((v, i) => {
          const h = v == null ? 0 : Math.min(MAX, Math.max(0, Number(v)));
          const pct = (h / MAX) * 100;
          const color = v == null ? C.cream
            : h >= 7 ? C.sage
            : h >= 5 ? C.gold
            : C.blushLight;
          const border = v == null ? C.border
            : h >= 7 ? C.sage
            : h >= 5 ? C.gold
            : C.blush;
          return (
            <span key={i} title={v == null ? "no log" : `${v}h`}
              style={{
                flex: 1,
                height: `${Math.max(6, pct)}%`,
                background: color,
                border: `1px solid ${border}`,
                borderRadius: 4,
              }}
            />
          );
        })}
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 12, color: C.muted, textAlign: "center" }}>
        Avg {avg != null ? `${avg.toFixed(1)}h / night` : "—"}
      </p>
    </div>
  );
}

function HabitGrid({ values, totalCompletions }) {
  // 5 rows × 6 cols = 30 cells (last 30 days, oldest at top-left).
  const ROWS = 5, COLS = 6;
  const cellColor = (n) => {
    if (n === 0) return C.cream;
    if (n === 1) return C.sageLight;
    return C.sage;
  };
  // Fill into a 5×6 grid row-major (oldest first).
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      cells.push(values[idx] || 0);
    }
  }
  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gap: 6, padding: "2px 0",
      }}>
        {cells.map((n, i) => (
          <span key={i} title={`${n} habits`} style={{
            aspectRatio: "1",
            borderRadius: 4,
            background: cellColor(n),
            border: `1px solid ${C.border}`,
          }} />
        ))}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 13, color: C.espresso }}>
        <strong>{totalCompletions}</strong> habit{totalCompletions === 1 ? "" : "s"} completed this month.
      </p>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────

function align(rows, dayKeys, extract) {
  const map = new Map();
  for (const r of rows) {
    const k = dateKeyOf(r);
    if (!k) continue;
    const v = extract(r);
    if (v != null) map.set(k, v);
  }
  return dayKeys.map((k) => (map.has(k) ? map.get(k) : null));
}

const shell = {
  minHeight: "100vh", background: C.cream,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const backLink = {
  display: "inline-flex", alignItems: "center", gap: 4,
  color: C.muted, textDecoration: "none",
  fontSize: 13, padding: "6px 0",
};

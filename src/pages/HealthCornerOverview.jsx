// ─────────────────────────────────────────────────────────────────────────────
// HealthCornerOverview — "🏥 HC: Overview" tab on /Ideas (FoundersOS).
//
// The Health Corner entry point. Five sections:
//   A. Jess Today (gold border) — 2-3 computed observations
//   B. Today's Snapshot (4 tiles) — sleep / mood / energy / hydration
//   C. This Month At a Glance (3 rows) — symptoms / habits / meds
//   D. Phase Health Briefing (4 sub-sections) — phase-specific education
//   E. Quick Log Shortcuts (4 pills)
//
// Data is fetched once at the FoundersOS level and passed in as props.
// Spec source: 2026-05-26 Halli — Health Corner 3-tab brief.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCycleDay } from "@/hooks/useCycleDay";
import { Sparkles, Plus, ChevronRight } from "lucide-react";

const T = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  jessBg:   "#EDE5CC",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  border:   "#D4C9B4",
  gold:     "#D4AF37",
  goldSoft: "rgba(212,175,55,0.16)",
  sage:     "#8FAF8F",
  sageBg:   "rgba(143,175,143,0.18)",
  blush:    "#E8B4B8",
  blushBg:  "rgba(232,180,184,0.22)",
};

const MENO_STAGES = new Set(["perimenopause", "menopause", "post-menopause"]);
const MOOD_EMOJI = ["😔", "😐", "🙂", "😊", "✨"];

const PHASE_LABEL = {
  follicular: "Follicular", ovulatory: "Ovulatory",
  luteal: "Luteal", menstrual: "Menstrual",
};

const PHASE_CONTENT = {
  follicular: {
    hormonal: "Estrogen is rising steadily from its period low. This drives the growth of follicles in your ovaries and thickens the uterine lining. You may notice clearer skin, better focus, and more social energy.",
    food:     "Your body is rebuilding. Prioritise iron-rich foods like lentils, spinach, and lean meat to replenish what was lost during menstruation. Fermented foods support gut health and estrogen metabolism — think kefir, sauerkraut, kimchi. Light proteins and complex carbs give sustained energy.",
    movement: "Rising energy makes this a great time for strength training, new fitness challenges, and HIIT. Your body recovers faster and tolerates higher intensity well.",
    sleep:    "Sleep quality often improves in the follicular phase as progesterone is low. Estrogen promotes REM sleep. Most women find it easier to fall asleep and wake more refreshed.",
  },
  ovulatory: {
    hormonal: "Estrogen peaks and triggers an LH surge, releasing a mature egg. Testosterone also spikes briefly, which can increase confidence and libido. This window lasts 24-48 hours.",
    food:     "Raw or lightly cooked vegetables support liver function, which helps process the estrogen surge. Zinc-rich foods (pumpkin seeds, chickpeas) support egg quality. Stay hydrated — your body temperature is slightly elevated.",
    movement: "Peak performance window. Competitive sports, high-intensity cardio, and team activities feel natural. Your pain tolerance is also higher.",
    sleep:    "Sleep may feel lighter around ovulation due to the hormonal surge. Maintaining a consistent bedtime matters more than total hours right now.",
  },
  luteal: {
    hormonal: "Progesterone dominates now, created by the corpus luteum after ovulation. It raises your body temperature, can cause bloating and breast tenderness, and tends to dampen mood toward the end of this phase.",
    food:     "Magnesium (dark chocolate, avocado, almonds) helps reduce PMS symptoms and improves sleep quality. Complex carbohydrates stabilise blood sugar and reduce cravings. Reduce caffeine and alcohol — they exacerbate progesterone-driven anxiety.",
    movement: "Shift toward moderate-intensity — yoga, pilates, swimming, walking. Avoid overtraining; your body is working hard internally. Rest is productive.",
    sleep:    "Progesterone initially promotes sleep, then disrupts it in the late luteal phase. Core body temperature rises 0.3-0.5°C. A cooler room (16-18°C) can meaningfully improve sleep quality.",
  },
  menstrual: {
    hormonal: "Estrogen and progesterone have both dropped, triggering the uterine lining to shed. Prostaglandins cause cramping. Iron levels dip — gentle movement and iron-rich foods help more than rest alone.",
    food:     "Prioritise iron (red meat, tofu, dark leafy greens) and vitamin C to aid iron absorption. Omega-3s (oily fish, flaxseed) reduce prostaglandin production and ease cramping. Warm soups and broths support comfort and hydration.",
    movement: "Gentle movement is best — restorative yoga, slow walks, light stretching. Let your body lead. High intensity can increase cramping.",
    sleep:    "The hormonal dip around menstruation can disrupt sleep and increase fatigue. Magnesium glycinate at bedtime, blackout curtains, and limiting screens 60 minutes before sleep are the highest-impact changes.",
  },
};

const MENO_CONTENT = {
  hormonal: "In perimenopause, estrogen and progesterone fluctuate unpredictably rather than following a monthly cycle. This variability drives the range of symptoms you may experience — hot flashes, sleep disruption, mood shifts, brain fog, and changes to skin and hair.",
  food:     "Prioritise phytoestrogens (flaxseed, soy, chickpeas) which may help moderate estrogen fluctuations. Calcium and vitamin D are critical as bone density decreases. Reduce sugar and refined carbs which amplify hot flashes.",
  movement: "Weight-bearing exercise (walking, strength training) is the single most important thing you can do for bone density and cardiovascular health in this stage. Aim for 3× weekly.",
  sleep:    "Hot flashes disrupt sleep architecture. A cool room, moisture-wicking bedding, and avoiding alcohol (which triggers flashes) are first-line interventions. Discuss sleep hygiene with your GP if quality is severely impacted.",
};

function todayIso() {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function isoOf(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function dateKeyOf(r)  { return r?.date || r?.day_key || (r?.logged_at ? String(r.logged_at).slice(0,10) : "") || (r?.created_date ? String(r.created_date).slice(0,10) : ""); }
function readMood(r)   { const v = r?.mood_score ?? r?.mood;     return v != null ? Number(v) : null; }
function readEnergy(r) { const v = r?.energy_level ?? r?.energy; return v != null ? Number(v) : null; }
function avg(arr) { const v = arr.filter((x) => x != null); return v.length ? v.reduce((s, x) => s + Number(x), 0) / v.length : null; }
function prettyName(s) { return String(s || "").replace(/[_-]+/g, " ").replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()); }
function firstName(profile) {
  const dn = profile?.display_name || ""; return String(dn).split(/\s+/)[0] || "friend";
}

export default function HealthCornerOverview({ profile, checkins = [], symptoms = [], meals = [], meds = [], supps = [], habits = [] }) {
  const cycle = useCycleDay(profile);
  const phase = cycle?.phase || "follicular";
  const lifeStage = profile?.life_stage || "reproductive";
  const isMeno = MENO_STAGES.has(lifeStage);

  const todayKey = todayIso();
  const todayChk = checkins.find((r) => dateKeyOf(r) === todayKey);

  // ── Last 7 / 14 / 30 day buckets ────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cut7  = new Date(today); cut7.setDate(today.getDate() - 6);
  const cut14 = new Date(today); cut14.setDate(today.getDate() - 13);
  const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
  const since = (rows, cutoff) => rows.filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= cutoff; });

  const checkins7  = useMemo(() => since(checkins, cut7),  [checkins]);
  const symptoms7  = useMemo(() => since(symptoms, cut7),  [symptoms]);
  const symptoms30 = useMemo(() => since(symptoms, cut30), [symptoms]);
  const habits30   = useMemo(() => since(habits,   cut30), [habits]);
  const meds14     = useMemo(() => since(meds,     cut14), [meds]);

  // ── Section A — Jess Today ─────────────────────────────────────
  const jessLine = useMemo(
    () => buildJessOverview(checkins7, symptoms7, habits30, cycle, profile, lifeStage),
    [checkins7, symptoms7, habits30, cycle, profile, lifeStage]
  );

  // ── Section B — Today's snapshot ───────────────────────────────
  const sleepToday    = todayChk?.sleep_hours != null ? Number(todayChk.sleep_hours) : null;
  const moodToday     = readMood(todayChk);
  const energyToday   = readEnergy(todayChk);
  const hydToday      = (() => {
    const hCheck = todayChk?.hydration ?? todayChk?.water_glasses ?? todayChk?.water;
    if (hCheck != null) return Number(hCheck);
    const todayMeals = meals.filter((m) => dateKeyOf(m) === todayKey);
    const hMeal = todayMeals.reduce((s, m) => s + (Number(m.water_ml) || 0), 0);
    return hMeal ? `${(hMeal / 250).toFixed(1)} glasses` : null;
  })();

  // ── Section C — month at a glance ──────────────────────────────
  const topSymptomsMonth = useMemo(() => {
    const counts = new Map();
    for (const r of symptoms30) {
      const k = r?.symptom_type || r?.symptom_name; if (!k) continue;
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [symptoms30]);

  const habits7Series = useMemo(() => {
    const days = lastNDayKeys(7);
    const set = new Set(habits30.map(dateKeyOf));
    return days.map((d) => set.has(d));
  }, [habits30]);
  const habitsThisMonth = habits30.length;

  const medsByName = useMemo(() => {
    const m = new Map();
    for (const r of meds14) {
      const name = r?.medication_name || r?.med_name || r?.name; if (!name) continue;
      if (!m.has(name)) m.set(name, new Set());
      const k = dateKeyOf(r); if (k) m.get(name).add(k);
    }
    return Array.from(m.entries()).map(([n, s]) => ({ name: n, adherence: Math.round((s.size / 14) * 100) }));
  }, [meds14]);

  // ── Section D — phase briefing ────────────────────────────────
  const phaseContent = isMeno ? MENO_CONTENT : (PHASE_CONTENT[phase] || PHASE_CONTENT.follicular);
  const phaseTitle = isMeno
    ? `Your ${prettyName(lifeStage)} stage`
    : `Your ${PHASE_LABEL[phase] || prettyName(phase)} phase`;

  return (
    <div>
      <DemoPill />

      <article style={canvasStyle()}>
        {/* SECTION A — Jess Today */}
        <section style={{ ...sectionStyle(), background: T.jessBg, borderLeft: `4px solid ${T.gold}` }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{
              padding: "3px 9px", borderRadius: 999, background: T.gold, color: "#1C1410",
              fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
            }}>From Jess</span>
            <span style={{ marginLeft: 8, fontSize: 11.5, color: T.muted }}>Health corner · {new Date().toLocaleDateString("en-GB", { weekday: "long" })}</span>
          </div>
          <p style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 17, lineHeight: 1.7, color: T.espresso, margin: 0, maxWidth: 680,
          }}>{jessLine}</p>
        </section>

        {/* SECTION B — Today's Snapshot */}
        <SectionHeader>Today's snapshot</SectionHeader>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10,
          padding: "0 18px 18px",
        }}>
          <Tile icon="😴" label="Sleep"     value={sleepToday != null ? `${sleepToday}h` : "Not logged"} />
          <Tile icon="💭" label="Mood"      value={moodToday != null ? MOOD_EMOJI[Math.max(0, Math.min(4, Math.round(moodToday) - 1))] : "Not logged"} large />
          <Tile icon="⚡" label="Energy"   value={energyToday != null ? `${energyToday}/5` : "Not logged"} />
          <Tile icon="💧" label="Hydration" value={hydToday != null ? String(hydToday) : "Not logged"} />
        </div>

        {/* SECTION C — This month at a glance */}
        <SectionHeader>This month at a glance</SectionHeader>
        <div style={{ padding: "0 18px 4px" }}>
          {/* Symptoms */}
          <GlanceRow
            title="Symptoms"
            right={<span style={{ color: T.muted, fontSize: 13 }}>{symptoms30.length} logged · <Link to="/SymptomInsights" style={{ color: T.espresso }}>See all →</Link></span>}
          >
            {topSymptomsMonth.length === 0
              ? <span style={{ fontSize: 13, color: T.muted }}>No symptoms logged this month. Log on /Today to track patterns.</span>
              : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {topSymptomsMonth.map(([sym, n]) => (
                    <span key={sym} style={{
                      padding: "4px 10px", borderRadius: 999, background: T.blushBg, color: T.espresso,
                      fontSize: 12, fontWeight: 500,
                    }}>{prettyName(sym)} · {n}</span>
                  ))}
                </div>
              )}
          </GlanceRow>

          {/* Habits */}
          <GlanceRow
            title="Habits"
            right={<span style={{ color: T.muted, fontSize: 13 }}>{habitsThisMonth} completed</span>}
          >
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {habits7Series.map((done, i) => (
                <div key={i} title={done ? "Logged" : "No log"} style={{
                  width: 14, height: 14, borderRadius: 999,
                  background: done ? T.sage : "transparent",
                  border: done ? "none" : `1px solid ${T.border}`,
                }} />
              ))}
              <span style={{ marginLeft: 8, fontSize: 12, color: T.muted }}>last 7 days</span>
            </div>
          </GlanceRow>

          {/* Medications */}
          <GlanceRow
            title="Medications"
            right={<span style={{ color: T.muted, fontSize: 13 }}>last 14 days</span>}
            last
          >
            {medsByName.length === 0
              ? <span style={{ fontSize: 13, color: T.muted }}>No medication logs in the last 14 days.</span>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {medsByName.map((m) => (
                    <div key={m.name} style={{ fontSize: 13.5, color: T.espresso }}>
                      <strong>{prettyName(m.name)}</strong> — <span style={{ color: m.adherence >= 80 ? T.sage : m.adherence >= 50 ? T.gold : T.muted }}>{m.adherence}% adherence</span>
                    </div>
                  ))}
                </div>
              )}
          </GlanceRow>
        </div>

        {/* SECTION D — Phase Health Briefing */}
        <SectionHeader>{phaseTitle.toUpperCase()}</SectionHeader>
        <div style={{ padding: "0 18px 20px", display: "grid", gap: 12 }}>
          <BriefCard icon="🧬" title="What's happening hormonally" body={phaseContent.hormonal} />
          <BriefCard icon="🍽️" title="What to eat"               body={phaseContent.food} />
          <BriefCard icon="🏃‍♀️" title="How to move"               body={phaseContent.movement} />
          <BriefCard icon="💤" title="Sleep & recovery"          body={phaseContent.sleep} />
        </div>

        {/* SECTION E — Quick Log Shortcuts */}
        <SectionHeader>Log something</SectionHeader>
        <div style={{ padding: "0 18px 24px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          <PillLink to="/Today?log=symptom">+ Symptom</PillLink>
          <PillLink to="/Today?log=mood">+ Mood</PillLink>
          <PillLink to="/Today?log=sleep">+ Sleep</PillLink>
          <PillLink to="/Today?log=medication">+ Medication</PillLink>
        </div>
      </article>

      <ReviewerNote>
        Five sections, all data-driven: Jess paragraph from your last 7 days, today's snapshot from DailyCheckins,
        month at a glance from SymptomLogs/HabitLogs/MedicationLogs, phase briefing keyed to {phase} or {lifeStage},
        log shortcuts to /Today.
      </ReviewerNote>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────
function DemoPill() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 11px", borderRadius: 999,
        background: T.goldSoft, color: T.gold,
        fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
        border: `1px solid ${T.gold}`,
      }}>
        <Sparkles className="w-3 h-3" /> Design Preview — Health Corner
      </span>
      <span style={{ color: "#9B8B7A", fontSize: 12 }}>Overview · entry point</span>
    </div>
  );
}
function canvasStyle() {
  return {
    backgroundColor: T.paper, color: T.espresso, borderRadius: 18,
    overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
    border: `1px solid rgba(212,175,55,0.22)`,
    fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
  };
}
function sectionStyle() {
  return { padding: "20px 22px", margin: "18px 18px 0", borderRadius: 14 };
}
function SectionHeader({ children }) {
  return (
    <div style={{
      padding: "22px 22px 8px",
      fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
      color: T.muted, fontWeight: 700,
    }}>{children}</div>
  );
}
function Tile({ icon, label, value, large }) {
  return (
    <div style={{
      background: "#FFFFFF",
      boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
      borderRadius: 12, padding: 16,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    }}>
      <div style={{ fontSize: 24 }} aria-hidden="true">{icon}</div>
      <div style={{
        fontSize: large ? 24 : 18, fontWeight: 700, color: T.espresso,
        fontFamily: '"Fraunces", Georgia, serif', lineHeight: 1.1,
      }}>{value}</div>
      <div style={{ fontSize: 11, letterSpacing: 0.6, color: T.muted, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}
function GlanceRow({ title, right, children, last }) {
  return (
    <div style={{
      borderBottom: last ? "none" : `1px solid ${T.border}`,
      padding: "14px 0",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso }}>{title}</div>
        <div>{right}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}
function BriefCard({ icon, title, body }) {
  return (
    <div style={{
      background: "#FFFFFF",
      boxShadow: "0 1px 4px rgba(58,44,26,0.08)",
      borderRadius: 12, padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 20 }} aria-hidden="true">{icon}</span>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.espresso }}>{title}</div>
      </div>
      <p style={{
        margin: 0, fontSize: 14.5, lineHeight: 1.65,
        color: T.espresso,
        fontFamily: '"Fraunces", Georgia, serif',
      }}>{body}</p>
    </div>
  );
}
function PillLink({ to, children }) {
  return (
    <Link to={to} style={{
      display: "inline-flex", alignItems: "center",
      padding: "8px 14px", borderRadius: 999,
      background: "transparent",
      color: T.espresso, fontSize: 13, fontWeight: 600,
      textDecoration: "none",
      border: `1.5px solid ${T.espresso}`,
    }}>{children}</Link>
  );
}
function ReviewerNote({ children }) {
  return (
    <div style={{
      marginTop: 14, padding: "12px 14px",
      background: "rgba(212,175,55,0.08)",
      border: `1px dashed rgba(212,175,55,0.45)`,
      borderRadius: 10, fontSize: 12.5, lineHeight: 1.6, color: "#C4B69E",
    }}>
      <strong style={{ color: T.gold }}>Notes for review:</strong> {children}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function lastNDayKeys(n) {
  const out = []; const today = new Date(); today.setHours(0,0,0,0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    out.push(isoOf(d));
  }
  return out;
}

function buildJessOverview(checkins7, symptoms7, habits30, cycle, profile, lifeStage) {
  const fname = firstName(profile);
  const mood7 = avg(checkins7.map(readMood));
  const sleep7 = avg(checkins7.map((r) => r?.sleep_hours != null ? Number(r.sleep_hours) : null));

  // Top symptom this week
  const counts = new Map();
  for (const r of symptoms7) {
    const k = r?.symptom_type || r?.symptom_name; if (!k) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];

  const parts = [];
  // Lead with the most notable signal
  if (top && top[1] >= 3) {
    parts.push(`Your ${prettyName(top[0]).toLowerCase()} has been more frequent this week — I've logged ${top[1]} in the last 7 days.`);
  } else if (mood7 != null && mood7 <= 2) {
    parts.push(`Your mood has been low this week — I've noticed.`);
  } else if (mood7 != null && mood7 >= 4) {
    parts.push(`Your mood has been bright this week. I want to name that.`);
  } else {
    parts.push(`Your week has been steady — no alarms on my watch.`);
  }
  // Positive note
  if (sleep7 != null && sleep7 >= 7) {
    parts.push(`On the upside, your sleep has averaged ${sleep7.toFixed(1)} hours which is restorative.`);
  } else if (habits30.length >= 10) {
    parts.push(`On the upside, you've logged ${habits30.length} habit completions this month — quiet consistency.`);
  } else if (checkins7.length >= 4) {
    parts.push(`You've checked in ${checkins7.length} days this week — that's the foundation of everything I can see.`);
  }
  // Forward-looking
  if (MENO_STAGES.has(lifeStage)) {
    parts.push(`Your symptoms may not follow a predictable rhythm right now — that's the nature of this stage. I'll keep watching.`);
  } else if (cycle?.phase === "follicular") {
    parts.push(`You're in your follicular phase right now, so your energy should start climbing over the next few days. A good time to do the things that require a bit more of you.`);
  } else if (cycle?.phase === "ovulatory") {
    parts.push(`You're approaching your strongest window. Don't push past it, but ride it where you can.`);
  } else if (cycle?.phase === "luteal") {
    parts.push(`You're in your luteal phase — slowing down isn't laziness, it's what your body is asking for.`);
  } else if (cycle?.phase === "menstrual") {
    parts.push(`You're on your period — bleeding is labour. Be gentle with yourself this week.`);
  }
  return parts.join(" ");
}

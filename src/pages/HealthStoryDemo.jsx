// ─────────────────────────────────────────────────────────────────────────────
// HealthStoryDemo — design demo for /Ideas (FoundersOS → "Health Story ✨" tab).
//
// Narrative-first reimagining of /HealthDashboard. Instead of charts +
// pillars, the page reads like a letter from Jess: 6 zones of warm prose
// + soft signal strips backed by REAL user entity data.
//
// Lives inside the FoundersOS dark espresso chrome, but the demo card
// itself is rendered on cream surface so reviewers see what the page
// would look like in the actual FemWell brand world.
//
// Zones:
//   1. Jess's Opening      — gold left accent bar + FROM JESS pill
//   2. Right Now           — plain-language life stage + cycle phase
//   3. What Jess Has Noticed — 2-3 computed insights (sage left border)
//   4. How You've Been     — 30-square colour wash row, mood + energy
//   5. Your Body This Month — flowing paragraph: sleep + symptoms + meds
//   6. Something Worth Celebrating — gold background, computed achievement
//   Bottom CTA "Go to Jess →"
//
// All entity queries use the same `both()` pattern as HealthDashboard
// (filters by both user_id and created_by-email so any schema variant
// returns the row). All copy is computed live — no placeholder text.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCycleDay } from "@/hooks/useCycleDay";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

const C = {
  cream:      "#F4EDDB",
  paper:      "#FBF6E6",
  paperHi:    "#F8F1DE",
  espresso:   "#3A2C1A",
  espressoDk: "#2A1E0E",
  muted:      "#9B8B7A",
  mutedLight: "#D4C9B4",
  gold:       "#D4AF37",
  goldLight:  "#F0DFA8",
  goldSoft:   "rgba(212,175,55,0.16)",
  sage:       "#8FAF8F",
  sageLight:  "#C8DDC8",
  sageSoft:   "rgba(143,175,143,0.18)",
  blush:      "#E8B4B8",
  blushLight: "#F2D4D6",
  border:     "#D4C9B4",
  rose:       "#C4849A",
};

const MENO_STAGES = new Set(["perimenopause", "menopause", "post-menopause"]);
const PHASE_LABEL = {
  menstrual: "menstrual", follicular: "follicular",
  ovulatory: "ovulatory", luteal: "luteal", unknown: "this part of",
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
function dateKeyOf(r) { return r?.date || r?.day_key || (r?.logged_at ? String(r.logged_at).slice(0,10) : "") || (r?.created_date ? String(r.created_date).slice(0,10) : ""); }
function readMood(r)   { const v = r?.mood_score ?? r?.mood;     return v != null ? Number(v) : null; }
function readEnergy(r) { const v = r?.energy_level ?? r?.energy; return v != null ? Number(v) : null; }
function prettyName(s) {
  return String(s || "").replace(/[_-]+/g, " ").replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function firstName(user, profile) {
  const dn = profile?.display_name || user?.display_name || user?.full_name || user?.email || "";
  return String(dn).split(/[\s@]/)[0] || "friend";
}
function greetingByHour() {
  const h = new Date().getHours();
  if (h < 5) return "It's late";
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}
function timeOfDayPhrase() {
  const h = new Date().getHours();
  if (h < 5)  return "in the small hours";
  if (h < 12) return "this morning";
  if (h < 18) return "this afternoon";
  return "tonight";
}

// Colour-wash square — opacity scales 1-5 → 0.18 → 0.92
function washColor(base, val) {
  if (val == null) return "transparent";
  const v = Math.max(1, Math.min(5, Math.round(val)));
  const alpha = 0.16 + (v - 1) * 0.19; // 0.16, 0.35, 0.54, 0.73, 0.92
  // base is hex; convert to rgba via simple parse
  const n = base.replace("#", "");
  const r = parseInt(n.slice(0,2), 16);
  const g = parseInt(n.slice(2,4), 16);
  const b = parseInt(n.slice(4,6), 16);
  return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
}

export default function HealthStoryDemo({ user: parentUser }) {
  const [user, setUser]       = useState(parentUser || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [checkins, setCheckins] = useState([]); // last 30d
  const [symptoms, setSymptoms] = useState([]); // last 30d
  const [habits,   setHabits]   = useState([]); // last 30d
  const [meds,     setMeds]     = useState([]); // last 14d
  const [meals,    setMeals]    = useState([]); // last 7d

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = parentUser || await base44.auth.me().catch(() => null);
        if (!u?.id) { setLoading(false); return; }
        if (cancelled) return;
        setUser(u);
        const profiles = await base44.entities.UserProfile
          .filter({ user_id: u.id }, null, 1).catch(() => []);
        if (cancelled) return;
        setProfile(profiles?.[0] || null);

        const both = async (entName) => {
          const ent = base44.entities?.[entName];
          if (!ent?.filter) return [];
          const [a, b] = await Promise.all([
            ent.filter({ user_id: u.id }).catch(() => []),
            u.email ? ent.filter({ created_by: u.email }).catch(() => []) : Promise.resolve([]),
          ]);
          const seen = new Set(); const out = [];
          for (const r of [...(a || []), ...(b || [])]) {
            if (!r || seen.has(r.id)) continue;
            seen.add(r.id); out.push(r);
          }
          return out;
        };
        const [chk, sym, hab, med, meal] = await Promise.all([
          both("DailyCheckins"), both("SymptomLogs"),
          both("HabitLogs"),     both("MedicationLogs"),
          both("MealLog"),
        ]);
        if (cancelled) return;

        const today = todayLocal();
        const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
        const cut14 = new Date(today); cut14.setDate(today.getDate() - 13);
        const cut7  = new Date(today); cut7.setDate(today.getDate()  - 6);
        const since = (rows, cutoff) => rows
          .filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= cutoff; })
          .sort((a, b) => String(dateKeyOf(a)).localeCompare(String(dateKeyOf(b))));

        setCheckins(since(chk, cut30));
        setSymptoms(since(sym, cut30));
        setHabits(  since(hab, cut30));
        setMeds(    since(med, cut14));
        setMeals(   since(meal, cut7));
      } catch { /* swallow */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [parentUser]);

  const lifeStage   = profile?.life_stage || "reproductive";
  const isMenoStage = MENO_STAGES.has(lifeStage);
  const isPregnancy = lifeStage === "pregnancy";
  const cycle       = useCycleDay(profile);

  // ── Derived signal: mood + energy 30-day series, sleep avg, top symptom, habit count ─
  const days30 = useMemo(() => lastNDays(30), []);
  const moodByDay = useMemo(() => {
    const m = new Map(days30.map((k) => [k, null]));
    for (const r of checkins) { const k = dateKeyOf(r); const v = readMood(r); if (m.has(k) && v != null) m.set(k, v); }
    return days30.map((k) => m.get(k));
  }, [checkins, days30]);
  const energyByDay = useMemo(() => {
    const m = new Map(days30.map((k) => [k, null]));
    for (const r of checkins) { const k = dateKeyOf(r); const v = readEnergy(r); if (m.has(k) && v != null) m.set(k, v); }
    return days30.map((k) => m.get(k));
  }, [checkins, days30]);

  const moodAvg   = useMemo(() => avg(moodByDay), [moodByDay]);
  const energyAvg = useMemo(() => avg(energyByDay), [energyByDay]);
  const moodLogged = moodByDay.filter((v) => v != null).length;

  const sleepAvg = useMemo(() => {
    const vs = checkins.map((r) => r?.sleep_hours != null ? Number(r.sleep_hours) : null).filter((n) => n != null);
    return vs.length ? vs.reduce((s, v) => s + v, 0) / vs.length : null;
  }, [checkins]);

  const topSymptom = useMemo(() => {
    const counts = new Map();
    for (const r of symptoms) {
      const k = r?.symptom_type || r?.symptom_name; if (!k) continue;
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    return entries[0] ? { name: prettyName(entries[0][0]), count: entries[0][1] } : null;
  }, [symptoms]);

  const habitsByDay = useMemo(() => {
    const m = new Map(days30.map((k) => [k, 0]));
    for (const r of habits) { const k = dateKeyOf(r); if (m.has(k)) m.set(k, m.get(k) + 1); }
    return days30.map((k) => m.get(k));
  }, [habits, days30]);
  const habitDays    = habitsByDay.filter((v) => v > 0).length;
  const habitsTotal  = habitsByDay.reduce((s, v) => s + v, 0);
  const medsCount    = meds.length;
  const mealsLogged  = meals.length;

  // ── Zone 1 — Jess opening ──────────────────────────────────────
  const fname = firstName(user, profile);
  const phase = cycle?.phase || "unknown";
  const dayInCycle = cycle?.cycleDay || cycle?.dayInCycle || null;

  let opening;
  if (loading) {
    opening = `Hi ${fname}. Let me pull up what I've been seeing in your data…`;
  } else if (isPregnancy) {
    const week = Number(profile?.pregnancy_week) || null;
    opening = week
      ? `Hi ${fname}. ${greetingByHour()} of week ${week}. I want to walk you through what your body has been telling me — gently, no charts, just what I've noticed.`
      : `Hi ${fname}. ${greetingByHour()}. I want to walk you through what I've been noticing about your pregnancy — gently, no charts, just observations.`;
  } else if (isMenoStage) {
    opening = `Hi ${fname}. ${greetingByHour()}. Your body is in transition right now, and that means the patterns I see look different than they used to. Let me walk you through what's been showing up — gently.`;
  } else if (phase === "menstrual") {
    opening = `Hi ${fname}. ${greetingByHour()}. You're bleeding, you're tired, and I want to keep this quiet — so I'll just share what I've noticed about how you've been, and we can pick this up properly later in the week.`;
  } else if (phase === "ovulatory") {
    opening = `Hi ${fname}. ${greetingByHour()} — ovulation week, your strong window. I have a few things I've been noticing that you'll want to hear while your energy is up.`;
  } else {
    opening = `Hi ${fname}. ${greetingByHour()}. I've been keeping an eye on how things have been going — let me share what I've noticed about your body this month.`;
  }

  // ── Zone 2 — Right now (life-stage aware) ─────────────────────
  let rightNowL1, rightNowL2;
  if (isPregnancy) {
    rightNowL1 = `You're pregnant${profile?.pregnancy_week ? ` · week ${profile.pregnancy_week}` : ""}`;
    rightNowL2 = `That changes everything I look at — appetite, sleep, mood, the lot. I won't talk about cycle phases right now.`;
  } else if (lifeStage === "perimenopause") {
    rightNowL1 = `You're in perimenopause`;
    rightNowL2 = `Cycles can be unpredictable here, and that's expected. I'm watching for symptoms more than dates.`;
  } else if (lifeStage === "menopause") {
    rightNowL1 = `You're in menopause`;
    rightNowL2 = `Cycle tracking sits in the background now. I'm focused on symptoms, sleep, and how you're feeling day to day.`;
  } else if (lifeStage === "post-menopause") {
    rightNowL1 = `You're post-menopause`;
    rightNowL2 = `Long-term wellbeing, bone health, and how you're feeling — those are what I'm watching for.`;
  } else if (phase === "unknown" || !dayInCycle) {
    rightNowL1 = `Your cycle isn't set up yet`;
    rightNowL2 = `If you tell me when your last period started, I can be a lot more specific about what your body is doing.`;
  } else {
    rightNowL1 = `Day ${dayInCycle} of your cycle · ${PHASE_LABEL[phase]} phase`;
    const daysUntil = cycle?.daysUntilPeriod;
    rightNowL2 = phase === "menstrual"
      ? `Your period is here. Your body is in its quiet, restoring stretch.`
      : phase === "follicular"
        ? `Estrogen is climbing back up. Mornings should feel a little brighter than last week.`
        : phase === "ovulatory"
          ? `Your strongest, brightest window. This is when your body works hardest and your mood usually lifts.`
          : daysUntil ? `Premenstrual week. Your period is roughly ${daysUntil} day${daysUntil === 1 ? "" : "s"} away.`
                      : `Your luteal phase — the wind-down before your next period.`;
  }

  // ── Zone 3 — What Jess has noticed (computed insights) ────────
  const noticed = [];
  if (moodLogged >= 5 && moodAvg != null) {
    const mood01 = moodAvg < 2.5 ? "low" : moodAvg > 3.5 ? "lifted" : "steady";
    const adjective = mood01 === "low" ? "softer" : mood01 === "lifted" ? "brighter" : "steady";
    noticed.push({
      title: `Your mood has been ${adjective} this month`,
      body: `Across ${moodLogged} days you logged it, the average sits at ${moodAvg.toFixed(1)} out of 5. ${mood01 === "low" ? "I'm not pushing you anywhere — just noting it." : mood01 === "lifted" ? "Something is working. Let's protect whatever that is." : "Not flat — just consistent. That's a kind of strength."}`,
    });
  }
  if (topSymptom) {
    noticed.push({
      title: `${topSymptom.name} keeps showing up`,
      body: `You've logged it ${topSymptom.count} time${topSymptom.count === 1 ? "" : "s"} in the last 30 days. ${topSymptom.count >= 4 ? "That's a pattern, not noise. We should talk about it." : "Worth watching — let me know if it gets worse."}`,
    });
  }
  if (habitDays >= 3) {
    noticed.push({
      title: `You've kept up your habits ${habitDays} day${habitDays === 1 ? "" : "s"} this month`,
      body: `${habitsTotal} logs total. ${habitDays >= 20 ? "That's astonishing consistency — please notice it." : habitDays >= 10 ? "That's solid — over a third of the month." : "Quiet rhythm. The number on its own isn't the point — the showing up is."}`,
    });
  }
  if (sleepAvg != null) {
    const sleepLine = sleepAvg < 6 ? "below where your body wants to be — and it's probably colouring everything else" :
                       sleepAvg < 7 ? "okay, but a notch under what would let you feel your best" :
                                       "in the healthy band — keep doing whatever you're doing";
    noticed.push({
      title: `Your sleep is averaging ${sleepAvg.toFixed(1)}h`,
      body: `That's ${sleepLine}.`,
    });
  }
  if (noticed.length === 0) {
    noticed.push({
      title: `I don't have enough yet to see patterns`,
      body: `Log a check-in or two over the next week and I'll start to see your shape. The more you log, the more I can see.`,
    });
  }

  // ── Zone 5 — Your body this month paragraph ───────────────────
  const bodyParagraph = (() => {
    const parts = [];
    if (sleepAvg != null) parts.push(`You've been averaging ${sleepAvg.toFixed(1)} hours of sleep`);
    if (topSymptom) parts.push(`${topSymptom.name.toLowerCase()} has come up ${topSymptom.count} time${topSymptom.count === 1 ? "" : "s"}`);
    if (medsCount > 0) parts.push(`you've stayed on top of ${medsCount} medication log${medsCount === 1 ? "" : "s"}`);
    if (mealsLogged > 0) parts.push(`there are ${mealsLogged} meal log${mealsLogged === 1 ? "" : "s"} in the last week`);
    if (parts.length === 0) {
      return `Once you've logged a bit more, I'll be able to weave it all together here — sleep, symptoms, meds, meals — into one paragraph that makes the month make sense.`;
    }
    const tail = isMenoStage
      ? `That's a lot of moving pieces. I see them, and they all matter.`
      : phase === "luteal" || phase === "menstrual"
        ? `In your current phase, that's the kind of mix I'd expect — rest where you can.`
        : `Taken together, it's a picture of a body being looked after.`;
    return `${parts.join(", ")}. ${tail}`;
  })();

  // ── Zone 6 — Something worth celebrating ─────────────────────
  const celebration = (() => {
    if (habitDays >= 15) return { title: `You showed up for yourself ${habitDays} days this month.`, body: `That's not a streak chart fact — it's a quiet, real thing.` };
    if (medsCount >= 10) return { title: `You logged your meds ${medsCount} times.`, body: `That's care. That's discipline. It counts.` };
    if (moodLogged >= 10) return { title: `You checked in with yourself ${moodLogged} times.`, body: `Some days it would have been easier not to. You did anyway.` };
    if (topSymptom && topSymptom.count >= 3) return { title: `You named your symptoms instead of brushing past them.`, body: `That's the start of every conversation worth having with a doctor.` };
    if (mealsLogged > 0) return { title: `You logged a meal this week.`, body: `Small thing, but the body keeps score — and so do I.` };
    return { title: `You opened the app today.`, body: `That's where this all starts. The rest will come.` };
  })();

  return (
    <div>
      {/* Demo pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 11px", borderRadius: 999,
          background: C.goldSoft, color: C.gold,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
          border: `1px solid ${C.gold}`,
        }}>
          <Sparkles className="w-3 h-3" /> Design preview — not yet live
        </span>
        <span style={{ color: "#9B8B7A", fontSize: 12 }}>
          Narrative-first reimagining of /HealthDashboard. Real data, Jess's voice.
        </span>
      </div>

      {/* Demo canvas — cream surface inside the dark FoundersOS chrome */}
      <article style={{
        backgroundColor: C.paper,
        color: C.espresso,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
        border: `1px solid rgba(212,175,55,0.22)`,
        fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
      }}>
        {/* Page header (in-app chrome simulation) */}
        <header style={{
          padding: "20px 24px 14px",
          borderBottom: `1px solid ${C.border}`,
          background: C.cream,
        }}>
          <div style={{
            fontFamily: '"Fraunces", "Cormorant Garamond", Georgia, serif',
            fontSize: 26, fontWeight: 600, color: C.espresso,
            letterSpacing: -0.4,
          }}>Your Health</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>
            A letter from Jess · {greetingByHour().toLowerCase()} on {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </header>

        {/* ZONE 1 — Jess opening */}
        <section style={{
          padding: "26px 24px 22px",
          borderLeft: `4px solid ${C.gold}`,
          margin: "18px 18px 0",
          background: C.paperHi,
          borderRadius: "0 14px 14px 0",
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <span style={{
              padding: "3px 9px", borderRadius: 999,
              background: C.gold, color: C.espressoDk,
              fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
            }}>From Jess</span>
            <span style={{ fontSize: 11, color: C.muted }}>your wellness companion</span>
          </div>
          <p style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 21, lineHeight: 1.55, fontWeight: 400,
            color: C.espresso, margin: 0,
          }}>{opening}</p>
        </section>

        {/* ZONE 2 — Right now */}
        <section style={{ padding: "22px 24px 6px", margin: "0 18px" }}>
          <h3 style={zoneTitleStyle()}>Right now</h3>
          <div style={{
            padding: "14px 16px", borderRadius: 12,
            background: "#FFFFFF", border: `1px solid ${C.border}`,
          }}>
            <div style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: 18, color: C.espresso, fontWeight: 500, marginBottom: 4,
            }}>{rightNowL1}</div>
            <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55 }}>{rightNowL2}</div>
          </div>
        </section>

        {/* ZONE 3 — What Jess has noticed */}
        <section style={{ padding: "22px 24px 6px", margin: "0 18px" }}>
          <h3 style={zoneTitleStyle()}>What I've noticed</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {noticed.slice(0, 3).map((n, i) => (
              <div key={i} style={{
                background: "#FFFFFF",
                borderLeft: `3px solid ${C.sage}`,
                padding: "12px 14px 13px 16px",
                borderRadius: "0 12px 12px 0",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}>
                <div style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 15.5, fontWeight: 500, color: C.espresso, marginBottom: 4,
                }}>{n.title}</div>
                <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>{n.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ZONE 4 — How you've been (30-square colour wash, two rows) */}
        <section style={{ padding: "22px 24px 6px", margin: "0 18px" }}>
          <h3 style={zoneTitleStyle()}>How you've been · last 30 days</h3>
          <div style={{
            background: "#FFFFFF", borderRadius: 12, padding: "16px 14px",
            border: `1px solid ${C.border}`,
          }}>
            <WashRow label="Mood"   values={moodByDay}   base={C.rose} />
            <WashRow label="Energy" values={energyByDay} base={C.gold} />
            <div style={{
              fontSize: 11, color: C.muted, marginTop: 10, display: "flex",
              gap: 14, flexWrap: "wrap", alignItems: "center",
            }}>
              <Legend base={C.rose} label="Mood" />
              <Legend base={C.gold} label="Energy" />
              <span>blank = no log</span>
            </div>
          </div>
        </section>

        {/* ZONE 5 — Your body this month */}
        <section style={{ padding: "22px 24px 6px", margin: "0 18px" }}>
          <h3 style={zoneTitleStyle()}>Your body this month</h3>
          <p style={{
            background: "#FFFFFF",
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "16px 18px",
            margin: 0,
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 16, lineHeight: 1.75, color: C.espresso, fontWeight: 400,
          }}>{bodyParagraph}</p>
        </section>

        {/* ZONE 6 — Something worth celebrating */}
        <section style={{ padding: "22px 24px 26px", margin: "0 18px" }}>
          <h3 style={zoneTitleStyle()}>Something worth celebrating</h3>
          <div style={{
            background: `linear-gradient(135deg, ${C.goldLight} 0%, ${C.gold} 100%)`,
            color: C.espressoDk,
            padding: "20px 22px",
            borderRadius: 14,
            boxShadow: "0 8px 22px rgba(212,175,55,0.28)",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <Heart className="w-5 h-5" style={{ marginTop: 2, color: C.espressoDk, fill: "rgba(255,255,255,0.55)" }} aria-hidden="true" />
            <div>
              <div style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: 18, fontWeight: 600, marginBottom: 4, lineHeight: 1.4,
              }}>{celebration.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, opacity: 0.86 }}>{celebration.body}</div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <footer style={{
          padding: "16px 24px 24px",
          margin: "0 18px 18px",
          borderTop: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
          flexWrap: "wrap",
        }}>
          <div style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontStyle: "italic", fontSize: 14, color: C.muted,
          }}>"The more you log, the more I can see." — Jess</div>
          <Link to="/Assistant" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 999,
            background: C.espresso, color: C.cream,
            textDecoration: "none", fontWeight: 600, fontSize: 13.5, letterSpacing: 0.2,
          }}>
            Go to Jess <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </footer>
      </article>

      {/* Reviewer note */}
      <div style={{
        marginTop: 14,
        padding: "12px 14px",
        background: "rgba(212,175,55,0.08)",
        border: `1px dashed rgba(212,175,55,0.45)`,
        borderRadius: 10,
        fontSize: 12.5, lineHeight: 1.6,
        color: "#C4B69E",
      }}>
        <strong style={{ color: C.gold }}>Notes for review:</strong> &nbsp;
        Six zones, all populated from real entity data (DailyCheckins, SymptomLogs, HabitLogs, MedicationLogs, MealLog).
        Life-stage aware — pregnancy / perimenopause / menopause / post-menopause / reproductive each get their own opening + Right Now copy.
        No charts, no pillar grids — the whole page is a letter.
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function avg(arr) {
  const v = (arr || []).filter((x) => x != null);
  return v.length ? v.reduce((s, x) => s + Number(x), 0) / v.length : null;
}
function zoneTitleStyle() {
  return {
    fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
    color: "#9B8B7A", fontWeight: 700, margin: "0 0 10px 2px",
    fontFamily: '"Inter", system-ui, sans-serif',
  };
}

function WashRow({ label, values, base }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
      <div style={{ width: 54, fontSize: 12, color: "#9B8B7A", fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(30, 1fr)", gap: 3, flex: 1 }}>
        {values.map((v, i) => (
          <div key={i} style={{
            aspectRatio: "1",
            background: washColor(base, v),
            borderRadius: 3,
            border: v == null ? "1px dashed rgba(155,139,122,0.28)" : "none",
            minHeight: 14,
          }} title={v == null ? "No log" : `${label}: ${v}`} />
        ))}
      </div>
    </div>
  );
}

function Legend({ base, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        width: 10, height: 10, borderRadius: 2,
        background: washColor(base, 4),
        display: "inline-block",
      }} /> {label}
    </span>
  );
}

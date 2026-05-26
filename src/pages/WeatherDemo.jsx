// ─────────────────────────────────────────────────────────────────────────────
// WeatherDemo — atmospheric health "weather" concept tab for /Ideas
// (Founders OS → "🌤 The Weather" tab).
//
// Lives inside the FoundersOS dark espresso chrome. The demo itself
// renders on a cream surface so reviewers see how it would feel inside
// the actual app — a full-width "sky" gradient that changes with the
// user's recent mood + energy, a poetic one-line weather report from
// Jess, and three quiet sections below: a 7-day colour-dot strip,
// Jess's pattern note, and a "body season" line keyed to life stage
// + cycle phase + calendar season.
//
// Spec source: 2026-05-26 Halli — "Health Corner Demo — Two new tabs
// on /Ideas (Founders OS)". This file builds Tab 1.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCycleDay } from "@/hooks/useCycleDay";
import { Sparkles, ArrowRight } from "lucide-react";

const T = {
  cream:     "#F4EDDB",
  paper:     "#FBF6E6",
  espresso:  "#3A2C1A",
  muted:     "#9B8B7A",
  gold:      "#D4AF37",
  goldSoft:  "rgba(212,175,55,0.16)",
  sage:      "#8FAF8F",
  blush:     "#E8B4B8",
  border:    "#D4C9B4",
};

const MENO_STAGES = new Set(["perimenopause", "menopause", "post-menopause"]);

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
function dateKeyOf(r)  { return r?.date || r?.day_key || (r?.logged_at ? String(r.logged_at).slice(0,10) : "") || (r?.created_date ? String(r.created_date).slice(0,10) : ""); }
function readMood(r)   { const v = r?.mood_score ?? r?.mood;     return v != null ? Number(v) : null; }
function readEnergy(r) { const v = r?.energy_level ?? r?.energy; return v != null ? Number(v) : null; }
function avg(arr) {
  const v = (arr || []).filter((x) => x != null);
  return v.length ? v.reduce((s, x) => s + Number(x), 0) / v.length : null;
}
function prettyName(s) {
  return String(s || "").replace(/[_-]+/g, " ").replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
function calendarSeason(date) {
  const m = date.getMonth(); // 0-11
  if (m >= 2 && m <= 4)  return "spring";
  if (m >= 5 && m <= 7)  return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}
const LIFE_STAGE_LABEL = {
  teen: "Teen", reproductive: "Reproductive", ttc: "Trying to conceive",
  pregnancy: "Pregnant", postpartum: "Postpartum",
  perimenopause: "Perimenopause", menopause: "Menopause", "post-menopause": "Post-menopause",
};

// Mood (blush) and Energy (sage) tinting. Value 1-5 → tint colour.
function moodTint(v) {
  if (v == null) return "transparent";
  const stops = ["#F7E0E1", "#F2C5C9", "#EBA9AF", "#E08993", "#C4636F"];
  return stops[Math.max(0, Math.min(4, Math.round(v) - 1))];
}
function energyTint(v) {
  if (v == null) return "transparent";
  const stops = ["#E6EEE6", "#C8DDC8", "#A8C9A8", "#8FAF8F", "#6F9070"];
  return stops[Math.max(0, Math.min(4, Math.round(v) - 1))];
}

// ── Weather state derivation ──────────────────────────────────────
function weatherState(moodAvg, energyAvg) {
  if (moodAvg == null && energyAvg == null) return "mist";
  const m = moodAvg ?? 3, e = energyAvg ?? 3;
  if (m >= 4 && e >= 4) return "bright";
  if (m < 3 && e < 3)   return "heavy";
  if (moodAvg == null && energyAvg == null) return "mist";
  return "mild";
}
const WEATHER_GRADIENT = {
  bright: "linear-gradient(160deg, #F4E4B8 0%, #F4EDDB 60%, #E8D5A0 100%)",
  mild:   "linear-gradient(160deg, #E8EDE8 0%, #F4EDDB 50%, #D4E8D4 100%)",
  heavy:  "linear-gradient(160deg, #D4CEC8 0%, #E8E0D8 50%, #C8C4BE 100%)",
  mist:   "linear-gradient(160deg, #EDE8E0 0%, #F4EDDB 100%)",
};
const WEATHER_LINE = {
  bright: "A warm week. Your energy has been with you.",
  mild:   "Steady, with moments of brightness. Your body is finding its rhythm.",
  heavy:  "A heavy few days. I've noticed. You don't have to explain it.",
  mist:   "I'm still getting to know your weather. Log how you feel and I'll learn.",
};

// ── Body-season mapping ───────────────────────────────────────────
function bodySeason(lifeStage, cyclePhase, calSeason) {
  if (lifeStage === "pregnancy")     return { label: "Deep winter", body: "Your body is doing the most important work." };
  if (lifeStage === "postpartum")    return { label: "The thaw", body: "Tender and powerful at once." };
  if (lifeStage === "perimenopause") return { label: "The turning", body: "A season of change that has its own beauty." };
  if (lifeStage === "menopause")     return { label: "The still point", body: "More known, more yours." };
  if (lifeStage === "post-menopause")return { label: "Open country", body: "The weather is yours to make." };
  if (lifeStage === "teen" && (calSeason === "spring" || calSeason === "summer")) {
    return { label: "Growing season", body: "Energy tends to run high — sleep matters more than it seems." };
  }
  if (lifeStage === "ttc") return { label: "Watchful spring", body: "Your body is paying attention. So am I." };
  // Reproductive — use cycle phase
  if (cyclePhase === "follicular") return { label: "Early bloom",     body: "Estrogen is rising — small new things have a better chance now." };
  if (cyclePhase === "ovulatory")  return { label: "Full sun",        body: "Your strongest week. Don't push past it, ride it." };
  if (cyclePhase === "luteal")     return { label: "Gathering in",    body: "Energy is drawing inward — that's the work of this phase." };
  if (cyclePhase === "menstrual")  return { label: "Rest season",     body: "Bleeding is labour. Treat it that way." };
  return { label: "Calm weather", body: "Nothing alarming on the horizon." };
}

export default function WeatherDemo({ user: parentUser }) {
  const [user, setUser]       = useState(parentUser || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState([]); // last 30d
  const [symptoms, setSymptoms] = useState([]); // last 30d
  const [habits,   setHabits]   = useState([]); // last 30d

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = parentUser || await base44.auth.me().catch(() => null);
        if (!u?.id) { setLoading(false); return; }
        if (cancelled) return;
        setUser(u);
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }, null, 1).catch(() => []);
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
        const [chk, sym, hab] = await Promise.all([
          both("DailyCheckins"), both("SymptomLogs"), both("HabitLogs"),
        ]);
        if (cancelled) return;

        const today = todayLocal();
        const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
        const since = (rows) => rows
          .filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= cut30; })
          .sort((a, b) => String(dateKeyOf(a)).localeCompare(String(dateKeyOf(b))));
        setCheckins(since(chk));
        setSymptoms(since(sym));
        setHabits(since(hab));
      } catch { /* swallow */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [parentUser]);

  const lifeStage = profile?.life_stage || "reproductive";
  const cycle     = useCycleDay(profile);

  // last 7 days mood + energy series
  const days7 = useMemo(() => lastNDays(7), []);
  const mood7   = useMemo(() => alignDays(checkins, days7, readMood),   [checkins, days7]);
  const energy7 = useMemo(() => alignDays(checkins, days7, readEnergy), [checkins, days7]);
  const moodAvg7   = avg(mood7);
  const energyAvg7 = avg(energy7);

  const weather  = weatherState(moodAvg7, energyAvg7);
  const gradient = WEATHER_GRADIENT[weather];
  const line     = WEATHER_LINE[weather];

  // Pattern insight for "What Jess is watching"
  const insight = useMemo(() => buildInsight(checkins, symptoms, habits), [checkins, symptoms, habits]);

  const calSeason = calendarSeason(new Date());
  const season    = bodySeason(lifeStage, cycle?.phase, calSeason);

  const dateStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const stageLbl = LIFE_STAGE_LABEL[lifeStage] || prettyName(lifeStage);

  return (
    <div>
      {/* Inline keyframe for the sky shimmer — kept local to avoid global style bleed. */}
      <style>{`
        @keyframes weatherShimmer { 0% { opacity: 0.95 } 50% { opacity: 1 } 100% { opacity: 0.95 } }
        .weather-sky { animation: weatherShimmer 4s ease-in-out infinite; }
      `}</style>

      {/* Demo pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 11px", borderRadius: 999,
          background: T.goldSoft, color: T.gold,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
          border: `1px solid ${T.gold}`,
        }}>
          <Sparkles className="w-3 h-3" /> 🌤 Design Preview
        </span>
        <span style={{ color: "#9B8B7A", fontSize: 12 }}>
          Atmospheric health — feel before you read.
        </span>
      </div>

      {/* Demo canvas — cream surround so reviewers see app feel */}
      <article style={{
        backgroundColor: T.paper,
        color: T.espresso,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
        border: `1px solid rgba(212,175,55,0.22)`,
        fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
      }}>
        {/* SKY ZONE — gradient + animated shimmer + Jess weather line */}
        <section className="weather-sky" style={{
          minHeight: 280,
          background: gradient,
          padding: "44px 28px 36px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          position: "relative",
        }}>
          <p style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 26, lineHeight: 1.45, fontWeight: 500,
            color: T.espresso, margin: 0, maxWidth: 720, letterSpacing: -0.2,
          }}>{line}</p>
          <div style={{
            marginTop: 18, fontSize: 12.5, color: "#6F5F4F",
            letterSpacing: 0.4,
          }}>
            {dateStr} · {stageLbl}
            {!loading && profile?.last_period_start_date && cycle?.cycleDay
              ? ` · day ${cycle.cycleDay}` : ""}
          </div>
        </section>

        {/* Section 1 — Your week in colour (7 split dots) */}
        <section style={{ padding: "32px 28px 8px" }}>
          <h3 style={zoneTitleStyle()}>Your week in colour</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {days7.map((d, i) => (
              <SplitDot
                key={d}
                mood={mood7[i]}
                energy={energy7[i]}
                label={new Date(d).toLocaleDateString("en-GB", { weekday: "short" })}
              />
            ))}
          </div>
          <div style={{
            marginTop: 12, fontSize: 13, color: T.muted, fontStyle: "italic",
            fontFamily: '"Fraunces", Georgia, serif',
          }}>
            Each dot is a day. Top half is how you felt — bottom half is how much energy you had.
          </div>
        </section>

        {/* Section 2 — What Jess is watching */}
        <section style={{ padding: "28px 28px 8px" }}>
          <div style={{
            borderLeft: `3px solid ${T.sage}`,
            padding: "8px 0 8px 18px",
          }}>
            <p style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: 17, lineHeight: 1.7, color: T.espresso, margin: 0,
              maxWidth: 640,
            }}>{insight}</p>
          </div>
        </section>

        {/* Section 3 — Your body's season */}
        <section style={{ padding: "28px 28px 30px" }}>
          <div style={{
            fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
            color: T.muted, fontWeight: 700, marginBottom: 10,
          }}>Your body's season</div>
          <div style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 30, lineHeight: 1.15, fontWeight: 500,
            color: T.gold, letterSpacing: -0.3, marginBottom: 6,
          }}>{season.label}</div>
          <div style={{
            fontSize: 16, lineHeight: 1.6, color: T.espresso, maxWidth: 600,
            fontFamily: '"Fraunces", Georgia, serif',
          }}>{season.body}</div>
        </section>

        {/* Bottom link */}
        <footer style={{
          padding: "16px 28px 24px",
          borderTop: `1px solid ${T.border}`,
          textAlign: "right",
        }}>
          <Link to="/Assistant" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: T.muted, fontSize: 13.5, textDecoration: "none",
            fontStyle: "italic",
            fontFamily: '"Fraunces", Georgia, serif',
          }}>
            Chat with Jess about your weather <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </footer>
      </article>

      {/* Reviewer note */}
      <div style={{
        marginTop: 14, padding: "12px 14px",
        background: "rgba(212,175,55,0.08)",
        border: `1px dashed rgba(212,175,55,0.45)`,
        borderRadius: 10, fontSize: 12.5, lineHeight: 1.6, color: "#C4B69E",
      }}>
        <strong style={{ color: T.gold }}>Notes for review:</strong> &nbsp;
        Weather state is computed from last 7 days of DailyCheckins (mood + energy avgs).
        Body's season blends life stage, cycle phase, and calendar season.
        Sky gradient + shimmer change with the data — no chrome, no charts.
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function alignDays(checkins, days, read) {
  const m = new Map(days.map((k) => [k, null]));
  for (const r of checkins) {
    const k = dateKeyOf(r); const v = read(r);
    if (m.has(k) && v != null) m.set(k, v);
  }
  return days.map((k) => m.get(k));
}

function buildInsight(checkins, symptoms, habits) {
  // Try mood streak first
  const moods = checkins.map(readMood).filter((v) => v != null);
  const a = avg(moods);
  if (moods.length >= 7 && a != null) {
    if (a >= 4) return `Your mood has been steady-bright for a while now. I'm not just saying that — it shows up in the numbers. Don't pass through this without noticing it.`;
    if (a <= 2) return `Your mood is sitting low. I see it. It's not a one-off. Could be worth talking to someone — or, if not yet, just naming it.`;
  }
  // Then top symptom
  const counts = new Map();
  for (const r of symptoms) {
    const k = r?.symptom_type || r?.symptom_name; if (!k) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 3) {
    return `${prettyName(top[0])} has come up ${top[1]} times in the last month. That's a pattern, not background noise.`;
  }
  // Then habit consistency
  const habitDays = new Set(habits.map(dateKeyOf).filter(Boolean)).size;
  if (habitDays >= 10) {
    return `You've shown up for your habits on ${habitDays} different days this month. That's quiet consistency — the kind that doesn't get a trophy but does the work.`;
  }
  if (checkins.length < 5) {
    return `I haven't seen much from you this month. No pressure — log when you want to, and I'll start to learn your weather.`;
  }
  return `Nothing dramatic is jumping out. Sometimes that itself is the weather report — a steady run.`;
}

function zoneTitleStyle() {
  return {
    fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
    color: "#9B8B7A", fontWeight: 700, margin: "0 0 12px 0",
    fontFamily: '"Inter", system-ui, sans-serif',
  };
}

function SplitDot({ mood, energy, label }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    }}>
      <div
        title={`${label} · mood ${mood ?? "—"} · energy ${energy ?? "—"}`}
        style={{
          width: 28, height: 28, borderRadius: 999,
          overflow: "hidden", display: "flex", flexDirection: "column",
          border: mood == null && energy == null ? "1px dashed rgba(155,139,122,0.45)" : "none",
        }}>
        <div style={{ flex: 1, background: moodTint(mood) }} />
        <div style={{ flex: 1, background: energyTint(energy) }} />
      </div>
      <div style={{ fontSize: 10.5, color: "#9B8B7A", letterSpacing: 0.4 }}>{label}</div>
    </div>
  );
}

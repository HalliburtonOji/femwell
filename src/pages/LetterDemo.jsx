// ─────────────────────────────────────────────────────────────────────────────
// LetterDemo — "The Letter" concept tab for /Ideas
// (Founders OS → "💌 The Letter" tab).
//
// A weekly letter from Jess, written by a client-side template engine
// against the user's real entity data. Not a summary. A letter.
//
// Layout: cream background, centred column max-width 540px, opens like
// a folded note. Header → 4 paragraphs (opening / what I noticed /
// something specific / looking forward) → close → footnote keeping-
// track-of list → footer note.
//
// Spec source: 2026-05-26 Halli — "Health Corner Demo — Two new tabs
// on /Ideas (Founders OS)". This file builds Tab 2.
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
  mutedSoft: "#B5A998",
  gold:      "#D4AF37",
  goldSoft:  "rgba(212,175,55,0.16)",
  border:    "#D4C9B4",
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
function firstName(user, profile) {
  const dn = profile?.display_name || user?.display_name || user?.full_name || user?.email || "";
  return String(dn).split(/[\s@]/)[0] || "";
}
// ISO 8601 week number — letters are numbered "Letter № N".
function isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export default function LetterDemo({ user: parentUser }) {
  const [user, setUser]       = useState(parentUser || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState([]); // last 7d
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
        const cut7  = new Date(today); cut7.setDate(today.getDate()  - 6);
        const cut30 = new Date(today); cut30.setDate(today.getDate() - 29);
        const since = (rows, cutoff) => rows
          .filter((r) => { const k = dateKeyOf(r); return k && new Date(k) >= cutoff; })
          .sort((a, b) => String(dateKeyOf(a)).localeCompare(String(dateKeyOf(b))));
        setCheckins(since(chk, cut7));
        setSymptoms(since(sym, cut30));
        setHabits(  since(hab, cut30));
      } catch { /* swallow */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [parentUser]);

  const lifeStage = profile?.life_stage || "reproductive";
  const cycle     = useCycleDay(profile);
  const fname     = firstName(user, profile);
  const now       = new Date();
  const letterNo  = isoWeekNumber(now);
  const longDate  = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // ── Paragraph 1: opening + what I noticed (mood) ──────────────
  const opening = fname ? `Hello ${fname},` : "Hello lovely,";
  const moods7   = checkins.map(readMood).filter((v) => v != null);
  const moodAvg7 = avg(moods7);
  const p1 = (() => {
    if (moods7.length === 0) {
      return `I didn't get to see much of your week — you didn't log often. That's okay. I'm still here.`;
    }
    if (moodAvg7 >= 4) {
      return `This was a good week for your mood. I want to name that, because good weeks can pass without being acknowledged.`;
    }
    if (moodAvg7 <= 2) {
      return `This week felt heavy, didn't it. I noticed. I'm not going to gloss over it.`;
    }
    return `Your mood has been mixed this week — some days lighter, some heavier. That's not failure. That's being human.`;
  })();

  // ── Paragraph 2: something specific (skipped if nothing logged) ─
  const p2 = useMemo(() => buildSpecific(checkins, symptoms, habits), [checkins, symptoms, habits]);

  // ── Paragraph 3: looking forward (life stage + cycle aware) ───
  const p3 = (() => {
    if (lifeStage === "pregnancy") {
      const week = Number(profile?.pregnancy_week) || null;
      return week ? `One more week — week ${week + 1}, give or take. Your body knows what it's doing, even when it doesn't feel like it.`
                  : `One more week. Your body knows what it's doing, even when it doesn't feel like it.`;
    }
    if (lifeStage === "postpartum")     return `Next week, be slow on purpose. The thaw doesn't need to be fast.`;
    if (lifeStage === "perimenopause")  return `Next week won't be predictable — that's the nature of this season. I'll be watching.`;
    if (lifeStage === "menopause")      return `Next week, focus on what feels steady. Build from there.`;
    if (lifeStage === "post-menopause") return `Next week, keep the rhythm that's working. That is the whole programme.`;
    if (lifeStage === "ttc")            return `Next week, your fertile window is something I'm watching. I'll flag the days that matter.`;
    if (cycle?.phase === "follicular")  return `Next week your energy may climb. Good time for the things that need a little courage.`;
    if (cycle?.phase === "ovulatory")   return `Next week your strong window peaks. Don't overspend it — but don't waste it either.`;
    if (cycle?.phase === "luteal")      return `Next week may feel slower, heavier. That's your body asking for something.`;
    if (cycle?.phase === "menstrual")   return `Next week, the bleed should ease. Restoration starts before you feel it.`;
    return `Next week, just keep checking in. Patterns show themselves over weeks, not days.`;
  })();

  // ── Keeping track of — footnotes ──────────────────────────────
  const counts = new Map();
  for (const r of symptoms) {
    const k = r?.symptom_type || r?.symptom_name; if (!k) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const topSym = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];

  const sleeps = checkins.map((r) => r?.sleep_hours != null ? Number(r.sleep_hours) : null).filter((n) => n != null);
  const sleepAvg = avg(sleeps);

  const habitCounts = new Map();
  for (const r of habits) {
    const k = r?.habit_name || r?.habit_id || r?.habit; if (!k) continue;
    habitCounts.set(k, (habitCounts.get(k) || 0) + 1);
  }
  const topHabit = Array.from(habitCounts.entries()).sort((a, b) => b[1] - a[1])[0];

  const footnotes = [];
  if (topSym)     footnotes.push(`${prettyName(topSym[0])} is showing up regularly`);
  if (sleepAvg != null) footnotes.push(`You average ${sleepAvg.toFixed(1)}h sleep`);
  if (topHabit)   footnotes.push(`${prettyName(topHabit[0])} is your most consistent habit`);
  if (footnotes.length === 0) footnotes.push(`I'll start keeping notes here once you log a bit more`);

  return (
    <div>
      {/* Demo pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 11px", borderRadius: 999,
          background: T.goldSoft, color: T.gold,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase",
          border: `1px solid ${T.gold}`,
        }}>
          <Sparkles className="w-3 h-3" /> 💌 Design Preview
        </span>
        <span style={{ color: "#9B8B7A", fontSize: 12 }}>
          A weekly letter from Jess. Not a summary — a letter.
        </span>
      </div>

      {/* Letter canvas */}
      <article style={{
        backgroundColor: T.paper,
        color: T.espresso,
        borderRadius: 18,
        boxShadow: "0 20px 60px rgba(0,0,0,0.32)",
        border: `1px solid rgba(212,175,55,0.22)`,
        fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
        overflow: "hidden",
      }}>
        {/* Letter content — centred column, max 540px */}
        <div style={{
          maxWidth: 540, margin: "0 auto",
          padding: "48px 28px 40px",
        }}>
          {/* Letter header */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
              color: T.muted, fontWeight: 600,
            }}>Letter № {letterNo} · {longDate}</div>
            <div style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontStyle: "italic", fontSize: 30, color: T.espresso,
              marginTop: 14, letterSpacing: -0.3, fontWeight: 500,
            }}>For you, this week</div>
            <div style={{
              width: "40%", margin: "22px auto 30px",
              height: 1, background: T.gold, opacity: 0.55,
            }} />
          </div>

          {/* Letter body */}
          <div style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontSize: 17, lineHeight: 1.85, color: T.espresso,
          }}>
            <p style={{ margin: "0 0 18px" }}>{opening}</p>
            <p style={{ margin: "0 0 18px" }}>{p1}</p>
            {p2 && <p style={{ margin: "0 0 18px" }}>{p2}</p>}
            <p style={{ margin: "0 0 26px" }}>{p3}</p>
            <p style={{ margin: 0 }}>
              I'm here.
              <br />
              <span style={{ fontStyle: "italic" }}>— Jess</span>
            </p>
          </div>

          {/* Thin rule + footnotes */}
          <div style={{
            margin: "36px 0 18px",
            height: 1, background: T.border,
          }} />

          <div>
            <div style={{
              fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase",
              color: T.muted, fontWeight: 600, marginBottom: 10,
            }}>What I'm keeping track of for you</div>
            <div style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontSize: 14.5, lineHeight: 1.85,
              color: T.mutedSoft, fontStyle: "italic",
            }}>
              {footnotes.map((f, i) => (
                <div key={i}>{f}</div>
              ))}
            </div>
          </div>

          {/* Letter footer note */}
          <div style={{
            marginTop: 32, paddingTop: 18, borderTop: `1px dashed ${T.border}`,
            fontSize: 12, color: T.muted, textAlign: "center",
            lineHeight: 1.6,
          }}>
            Jess writes every Sunday. Your letter updates at the start of each week.
          </div>
        </div>

        {/* Bottom CTA — outside the centred column */}
        <footer style={{
          padding: "16px 28px 24px",
          borderTop: `1px solid ${T.border}`,
          textAlign: "right",
          background: "rgba(212,175,55,0.04)",
        }}>
          <Link to="/Assistant" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: T.espresso, fontSize: 13.5, textDecoration: "none",
            fontStyle: "italic",
            fontFamily: '"Fraunces", Georgia, serif',
          }}>
            Write back to Jess <ArrowRight className="w-4 h-4" aria-hidden="true" />
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
        Four paragraphs, all data-driven: opening, what I noticed (mood avg this week),
        something specific (top symptom / best sleep / habit milestone), looking forward
        (life stage + cycle aware). Footnotes pull top symptom + sleep avg + most-logged
        habit from the last 30 days.
      </div>
    </div>
  );
}

// ─── Helper: Paragraph 2 picks the most specific data point ──────
function buildSpecific(checkins, symptoms, habits) {
  // Top symptom this week
  const counts = new Map();
  for (const r of symptoms) {
    const k = r?.symptom_type || r?.symptom_name; if (!k) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 2) {
    return `${prettyName(top[0])} showed up ${top[1]} time${top[1] === 1 ? "" : "s"}. That's real, and I'm keeping track so you don't have to hold it alone.`;
  }

  // Best sleep night this week
  const sleepNights = checkins
    .map((r) => ({ day: dateKeyOf(r), hours: r?.sleep_hours != null ? Number(r.sleep_hours) : null }))
    .filter((x) => x.hours != null);
  if (sleepNights.length) {
    const best = sleepNights.sort((a, b) => b.hours - a.hours)[0];
    if (best.hours >= 7) {
      const dayLabel = new Date(best.day).toLocaleDateString("en-GB", { weekday: "long" });
      return `Your best night of sleep was ${best.hours.toFixed(1)} hours on ${dayLabel}. Something to notice.`;
    }
  }

  // Habit count this week
  const habitDays = new Set(habits.map(dateKeyOf).filter(Boolean));
  if (habitDays.size >= 3) {
    return `You completed habits on ${habitDays.size} different days. Quietly consistent.`;
  }

  // Nothing notable — skip this paragraph
  return null;
}

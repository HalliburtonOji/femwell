// MorningBriefSheet — Sprint 8 (auto-launch first open per day)
//
// Single full-screen sheet that fires once per local calendar day.
// Cream surface, espresso text, gold accents. Four blocks stacked:
//
//   1. Jess greeting — time-aware ("Good morning / afternoon /
//      evening, <name>."), phase + cycle day subtitle, one warm
//      phase-aware sentence from PHASE_BRIEF.
//   2. Morning check-in strip — three compact tiles (mood 1–5,
//      energy 1–5, sleep hours 6/7/8/9). Each tap writes to
//      DailyCheckins for today (or updates the existing row).
//   3. Today at a glance — up to 3 PlannerItems for today + the
//      first MealLog if one exists. Empty-state copy otherwise.
//   4. "Start my day →" full-width espresso button (only dismiss).
//
// The first-open-of-day gate + localStorage key live in App.jsx,
// same place MorningBriefOverlay was wired. This component just
// renders whatever the parent hands it and calls onDismiss when
// the user taps the start button.

import { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCycleDay } from "@/hooks/useCycleDay";
import { Frown, Meh, Smile, Zap, Moon, Check, ArrowRight, ListChecks, Utensils } from "lucide-react";

const C = {
  cream:       "#F4EDDB",
  paperHi:     "#EDE6D5",
  paperSoft:   "#FBF6E6",
  espresso:    "#3A2C1A",
  espressoDk:  "#2A1E0E",
  muted:       "#9B8B7A",
  gold:        "#D4AF37",
  sage:        "#8FAF8F",
  blush:       "#E8B4B8",
  border:      "#D4C9B4",
};

function todayLocalISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function timeOfDayGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// One warm phase-aware sentence. Same tone as PHASE_RECS but
// distilled to a single line that opens the day.
const PHASE_BRIEF = {
  menstrual:   "Rest is productive. You don't have to earn your ease today.",
  follicular:  "Your energy is building. A good day to start something new.",
  ovulatory:   "You're at your peak. Lead, connect, and show up fully.",
  luteal:      "Steady over bright. Nourish yourself and complete what matters.",
  unknown:     "However your day starts, you're allowed to take it gently.",
};

const PHASE_LABEL = {
  menstrual: "Menstrual", follicular: "Follicular",
  ovulatory: "Ovulatory", luteal: "Luteal",
  unknown: "Today",
};

// Mood + energy tile scales — Lucide only, per brand rule.
const MOOD_OPTIONS = [
  { value: 1, Icon: Frown, tint: "#D45E52" },
  { value: 2, Icon: Frown, tint: "#C17B4E" },
  { value: 3, Icon: Meh,   tint: "#9B8B7A" },
  { value: 4, Icon: Smile, tint: "#6B8F5A" },
  { value: 5, Icon: Smile, tint: "#3A2C1A" },
];
const ENERGY_OPTIONS = [1, 2, 3, 4, 5];
const SLEEP_OPTIONS = [6, 7, 8, 9];

export default function MorningBriefSheet({ user, profile, onDismiss }) {
  const today = todayLocalISO();
  const cycle = useCycleDay(profile);
  const phase = cycle?.phase || "unknown";
  // QA fix — the useCycleDay hook returns `cycleDay`, not `day`. The
  // previous `cycle?.day` read returned undefined on every render so
  // the subtitle showed only the phase label. Aliases supported in
  // case the hook ever ships the alternate name.
  const cycleDay = cycle?.cycleDay || cycle?.dayInCycle || cycle?.day || null;

  const greeting = useMemo(timeOfDayGreeting, []);
  const displayName = (profile?.display_name || profile?.first_name || user?.full_name?.split(" ")[0] || "there").trim();

  // ── Check-in strip — load today's row (if any) so the tiles
  // come up pre-selected when re-opening within the same day.
  //
  // QA fix — partial writes (mood → energy → sleep) used to race
  // because each pick wrote via React state that hadn't committed
  // yet. Result: rapid taps created multiple rows AND lost fields.
  // The ref below holds the live truth (checkinId + the latest
  // values we've persisted) so persistCheckin always updates the
  // ONE row regardless of React render timing.
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [sleepHours, setSleepHours] = useState(null);
  const [saving, setSaving] = useState(null); // "mood" | "energy" | "sleep" | null
  const checkinRef = useRef({ id: null, mood: null, energy: null, sleep_hours: null });
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.DailyCheckins.filter({ user_id: user.id, date: today }, "-updated_date", 1).catch(() => []);
        if (cancelled) return;
        const row = rows?.[0];
        if (row?.id) {
          checkinRef.current.id = row.id;
          // QA round 2 — prefer either mood key when re-opening the
          // sheet within the same day so the tile lights up regardless
          // of which write path created the row.
          const moodRaw = row.mood != null ? row.mood : row.mood_score;
          if (moodRaw != null) {
            const v = Number(moodRaw);
            checkinRef.current.mood = v;
            setMood(v);
          }
          const energyRaw = row.energy != null ? row.energy : row.energy_level;
          if (energyRaw != null) {
            const v = Number(energyRaw);
            checkinRef.current.energy = v;
            setEnergy(v);
          }
          if (row.sleep_hours != null) {
            const v = Number(row.sleep_hours);
            checkinRef.current.sleep_hours = v;
            setSleepHours(v);
          }
        }
      } catch { /* swallow */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id, today]);

  async function persistCheckin(patch) {
    if (!user?.id) return;
    // Apply patch to the ref synchronously so the build-up of mood +
    // energy + sleep all land on the same row, even if React state
    // hasn't committed yet between rapid taps.
    const next = { ...checkinRef.current, ...patch };
    checkinRef.current = next;

    // Build the canonical payload matching MorningCheckinCard's shape
    // (the one TodayHeroSection reads): mood, energy + energy_level
    // mirror, sleep_hours. QA round 2 fix — Today's mood widget actually
    // reads `mood_score`, not `mood`. Writing BOTH keys covers both
    // surfaces that exist today and any future ones that pick either.
    // `day_key` is added alongside `date` for the same dual-read reason
    // (hydration + meal entities key on day_key). Empty values are
    // omitted so a partial patch doesn't accidentally null out an
    // existing column.
    const payload = {
      user_id: user.id,
      created_by: user.id,
      date: today,
      day_key: today,
      logged_at: new Date().toISOString(),
    };
    if (next.mood         != null) { payload.mood = next.mood; payload.mood_score = next.mood; }
    if (next.energy       != null) { payload.energy = next.energy; payload.energy_level = next.energy; }
    if (next.sleep_hours  != null) payload.sleep_hours  = next.sleep_hours;

    try {
      if (next.id) {
        await base44.entities.DailyCheckins.update(next.id, payload).catch(async () => {
          // Schema drift fallback — minimal payload, only the field
          // that just changed, plus the dual aliases so neither read
          // surface gets stale data.
          const minimal = { date: today };
          if (patch.mood        != null) { minimal.mood = patch.mood; minimal.mood_score = patch.mood; }
          if (patch.energy      != null) { minimal.energy = patch.energy; minimal.energy_level = patch.energy; }
          if (patch.sleep_hours != null) minimal.sleep_hours = patch.sleep_hours;
          await base44.entities.DailyCheckins.update(next.id, minimal);
        });
      } else {
        const created = await base44.entities.DailyCheckins.create(payload).catch(async () => {
          const minimal = { user_id: user.id, created_by: user.id, date: today };
          if (patch.mood        != null) { minimal.mood = patch.mood; minimal.mood_score = patch.mood; }
          if (patch.energy      != null) { minimal.energy = patch.energy; minimal.energy_level = patch.energy; }
          if (patch.sleep_hours != null) minimal.sleep_hours = patch.sleep_hours;
          return await base44.entities.DailyCheckins.create(minimal);
        });
        if (created?.id) checkinRef.current.id = created.id;
      }
    } catch { /* swallow */ }
  }

  async function pickMood(v)   { setMood(v);       setSaving("mood");   await persistCheckin({ mood: v });                              setSaving(null); }
  async function pickEnergy(v) { setEnergy(v);     setSaving("energy"); await persistCheckin({ energy: v });                            setSaving(null); }
  async function pickSleep(h)  { setSleepHours(h); setSaving("sleep");  await persistCheckin({ sleep_hours: h });                       setSaving(null); }

  // ── Today at a glance — PlannerItems + first MealLog.
  const [plannerItems, setPlannerItems] = useState([]);
  const [firstMeal, setFirstMeal]       = useState(null);
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [items, meals] = await Promise.all([
          base44.entities.PlannerItems.filter({ user_id: user.id, date_str: today }).catch(() => []),
          base44.entities.MealLog.filter({ user_id: user.id, day_key: today }).catch(() => []),
        ]);
        if (cancelled) return;
        setPlannerItems(Array.isArray(items) ? items.slice(0, 3) : []);
        // Pick the first meal of the day if any rows exist.
        const sortedMeals = Array.isArray(meals)
          ? meals.slice().sort((a, b) => {
            const order = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
            return (order[a?.meal_type] ?? 4) - (order[b?.meal_type] ?? 4);
          })
          : [];
        setFirstMeal(sortedMeals[0] || null);
      } catch { /* swallow */ }
    })();
    return () => { cancelled = true; };
  }, [user?.id, today]);

  const brief = PHASE_BRIEF[phase] || PHASE_BRIEF.unknown;
  const phaseLabel = PHASE_LABEL[phase] || PHASE_LABEL.unknown;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: C.cream,
        color: C.espresso,
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Scrollable body */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "32px 22px 24px",
        display: "flex", flexDirection: "column", gap: 24,
        maxWidth: 520, margin: "0 auto", width: "100%",
        boxSizing: "border-box",
      }}>
        {/* 1 — Jess greeting */}
        <section>
          <p style={{
            margin: 0, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.muted,
          }}>{phaseLabel}{cycleDay ? ` · Day ${cycleDay}` : ""}</p>
          {/* Greeting → tier-1 carved Ephesis script (the editorial standard) —
              was an old upright 28px Fraunces line, the duplicate Halli flagged. */}
          <h1 className="fw-display" style={{ margin: "6px 0 14px" }}>{greeting}, {displayName}.</h1>
          <p style={{
            margin: 0, fontSize: 16, lineHeight: 1.55,
            fontFamily: "'Fraunces', Georgia, serif",
            color: C.espresso, fontStyle: "italic",
          }}>{brief}</p>
          <p style={{
            margin: "10px 0 0", fontSize: 10, color: C.muted,
            letterSpacing: 0.2,
          }}>Not medical advice — Jess is a wellness companion.</p>
        </section>

        {/* 2 — Morning check-in strip */}
        <section>
          <p style={sectionLabel}>This morning</p>
          <div style={{
            background: C.paperSoft, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "14px 14px 12px",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {/* Mood — QA fix: derive the saved value from the loop
                index (index + 1) so the 1-indexed scale is locked in
                and a future reorder of MOOD_OPTIONS can't drift the
                numbers. */}
            <div>
              <p style={tileLabel}>Mood</p>
              <div style={tileRow}>
                {MOOD_OPTIONS.map((opt, index) => {
                  const Icon = opt.Icon;
                  const value = index + 1;
                  const on = mood === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => pickMood(value)}
                      disabled={saving === "mood"}
                      style={{
                        ...tileBtn,
                        background: on ? opt.tint + "33" : "transparent",
                        borderColor: on ? opt.tint : C.border,
                        color: on ? opt.tint : C.muted,
                      }}
                    >
                      <Icon size={20} />
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Energy */}
            <div>
              <p style={tileLabel}>Energy</p>
              <div style={tileRow}>
                {ENERGY_OPTIONS.map((v) => {
                  const on = energy === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => pickEnergy(v)}
                      disabled={saving === "energy"}
                      style={{
                        ...tileBtn,
                        background: on ? C.gold + "33" : "transparent",
                        borderColor: on ? C.gold : C.border,
                        color: on ? C.gold : C.muted,
                      }}
                    >
                      <Zap size={18} fill={on ? C.gold : "transparent"} />
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Sleep */}
            <div>
              <p style={tileLabel}>Sleep hours</p>
              <div style={tileRow}>
                {SLEEP_OPTIONS.map((h) => {
                  const on = sleepHours === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => pickSleep(h)}
                      disabled={saving === "sleep"}
                      style={{
                        ...tileBtn,
                        background: on ? C.sage + "33" : "transparent",
                        borderColor: on ? C.sage : C.border,
                        color: on ? C.sage : C.muted,
                        fontSize: 14, fontWeight: 600,
                      }}
                    >
                      {on ? <Check size={16} style={{ marginRight: 4 }} /> : <Moon size={14} style={{ marginRight: 4 }} />}
                      {h}h
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 3 — Today at a glance */}
        <section>
          <p style={sectionLabel}>Today at a glance</p>
          <div style={{
            background: C.paperSoft, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "12px 14px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            {plannerItems.length === 0 && !firstMeal && (
              <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                Nothing planned yet — add to your day in the Planner.
              </p>
            )}
            {plannerItems.map((it) => (
              <div key={it.id} style={glanceRow}>
                <span style={glanceIcon}><ListChecks size={14} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={glanceTitle}>{it.title || "Planner item"}</p>
                  {it.time ? <p style={glanceSub}>{it.time}</p> : null}
                </div>
              </div>
            ))}
            {firstMeal && (
              <div style={glanceRow}>
                <span style={glanceIcon}><Utensils size={14} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={glanceTitle}>
                    {(firstMeal.meal_type || "Meal").replace(/^\w/, (c) => c.toUpperCase())} planned: {firstMeal.raw_text || firstMeal.food_name || firstMeal.name || (Array.isArray(firstMeal.food_items) ? firstMeal.food_items[0] : firstMeal.food_items) || "a meal"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 4 — Dismiss button — fixed bottom, full-width */}
      <div style={{
        padding: "14px 22px max(14px, env(safe-area-inset-bottom))",
        background: C.cream, borderTop: `1px solid ${C.border}`,
      }}>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 14,
            background: C.espresso,
            color: C.cream,
            border: "none",
            fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
            cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            maxWidth: 520, margin: "0 auto",
          }}
        >
          Start my day <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

const sectionLabel = {
  margin: "0 0 8px",
  fontSize: 11, fontWeight: 700,
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted,
};
const tileLabel = {
  margin: "0 0 6px",
  fontSize: 11, fontWeight: 600,
  color: C.muted, letterSpacing: 0.4,
  textTransform: "uppercase",
};
const tileRow = {
  display: "flex", gap: 8, flexWrap: "wrap",
};
const tileBtn = {
  flex: "1 1 auto",
  minHeight: 44,
  padding: "8px 10px",
  borderRadius: 12,
  border: "1.5px solid transparent",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "inherit",
};
const glanceRow = {
  display: "flex", alignItems: "center", gap: 10,
};
const glanceIcon = {
  width: 28, height: 28, borderRadius: 8,
  background: "rgba(212,175,55,0.16)",
  color: C.gold,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const glanceTitle = {
  margin: 0, fontSize: 14, color: C.espresso, lineHeight: 1.35,
};
const glanceSub = {
  margin: "2px 0 0", fontSize: 11, color: C.muted,
};

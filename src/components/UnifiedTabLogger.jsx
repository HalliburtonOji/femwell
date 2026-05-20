// ─────────────────────────────────────────────────────────────────────────────
// UnifiedTabLogger — single gold + FAB on every page that opens a bottom sheet
// with two tabs: Log (4 swipeable cards) and Add (Quick Add type grid).
//
// Replaces SmartLoggerV4 as the global logger UI; subscribes to the existing
// openLogger() singleton from UniversalLogger so the 50+ call sites that
// already use it keep working. When openLogger(type) is called with a type id,
// the sheet opens on the Add tab and jumps straight into the DetailForm for
// that type.
//
// Default tab on /Planner: Add. On all other pages: Log.
// Hidden on /Ideas (page-level demo owns the surface there).
//
// Brand: no emojis; Lucide icons only. Cards use the flat translateX/scale
// 3D deck pattern proven in SmartLoggerV4 (rotateY caused label clipping).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus, Minus, X as XIcon, Check,
  Heart, Utensils, Pill, Pen, Activity,
  Droplets, Coffee, Wine, ChevronDown, ChevronUp,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  openLogger,
  closeLogger,
  subscribeLoggerState,
  getLoggerState,
  TYPES,
  TypeGrid,
  DetailForm,
} from "@/components/UniversalLogger";

// Re-export so consumers that prefer the new module path still work.
export { openLogger, closeLogger };

// ── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  cream:    "#F4EDDB",
  paperHi:  "#FFFFFF",
  espresso: "#3A2C1A",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  rose:     "#D45E52",
  plum:     "#4A2A3A",
  cardBg:   "#FAF6EE",
  border:   "rgba(58,44,26,0.12)",
};

// ── Time helpers ────────────────────────────────────────────────────────────
const todayISO = () => new Date().toISOString().split("T")[0];
const nowISO   = () => new Date().toISOString();

async function getUserId() {
  try {
    const me = await base44.entities.User.me();
    return me?.id || null;
  } catch { return null; }
}

// ── Entity writers ──────────────────────────────────────────────────────────
async function writeCheckin(patch) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    const date = todayISO();
    const existing = await base44.entities.DailyCheckins
      .filter({ user_id, date }, "-updated_at", 1).catch(() => []);
    const row = (existing || [])[0];
    const body = { ...patch, updated_at: nowISO() };
    if (row?.id) await base44.entities.DailyCheckins.update(row.id, body);
    else         await base44.entities.DailyCheckins.create({ user_id, date, ...body });
  } catch { /* silent */ }
}

async function writeSymptom(symptom_type) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.SymptomLogs.create({
      user_id, date: todayISO(), symptom_type, severity: 3,
      created_at: nowISO(), updated_at: nowISO(),
    });
  } catch { /* silent */ }
}

async function writeCycleEvent(flow) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    const eventMap = {
      "Spotting":  "spotting",
      "Light":     "period_start",
      "Medium":    "period_ongoing",
      "Heavy":     "period_ongoing",
      "No period": "no_period",
    };
    await base44.entities.CycleEvents.create({
      user_id, date: todayISO(), event_type: eventMap[flow] || "period_ongoing",
      created_at: nowISO(), updated_at: nowISO(),
    });
    if (flow !== "No period" && flow !== "Spotting") {
      await writeCheckin({ period_flow: flow.toLowerCase() });
    }
  } catch { /* silent */ }
}

async function writeHydration(amount_ml) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.HydrationLog.create({
      user_id, day_key: todayISO(), amount_ml,
      logged_at: nowISO(), source: "manual",
    });
  } catch { /* silent */ }
}

async function writeDrink(drink_type, amount_ml = 250) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    if (drink_type === "Water") {
      return writeHydration(amount_ml);
    }
    await base44.entities.DrinkLog.create({
      user_id, day_key: todayISO(), drink_type: drink_type.toLowerCase(),
      amount_ml, logged_at: nowISO(),
    });
  } catch { /* silent */ }
}

async function writeMeal({ meal_type, description, portion_size, estimated_calories }) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.MealLog.create({
      user_id, logged_at: nowISO(), day_key: todayISO(),
      meal_type: meal_type.toLowerCase(), method: "text",
      raw_text: description,
      notes: [
        portion_size ? `portion:${portion_size}` : null,
        estimated_calories ? `kcal:${estimated_calories}` : null,
      ].filter(Boolean).join(" · "),
    });
  } catch { /* silent */ }
}

async function writeMedLog(item_name, dose = "") {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.MedicationLogs.create({
      user_id, date: todayISO(), item_name, dose: String(dose),
      taken: true, created_at: nowISO(), updated_at: nowISO(),
    });
  } catch { /* silent */ }
}

async function writeJournal(text, entry_type) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.JournalEntries.create({
      user_id, session_date: todayISO(), text,
      tags: [entry_type.toLowerCase()],
      prompt: `UnifiedLogger ${entry_type}`,
    });
  } catch { /* silent */ }
}

async function upsertPregLog(patch) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    const date = todayISO();
    const existing = await base44.entities.PregnancyDailyLog
      .filter({ user_id, date }, "-date", 1).catch(() => []);
    const row = (existing || [])[0];
    if (row?.id) await base44.entities.PregnancyDailyLog.update(row.id, patch);
    else         await base44.entities.PregnancyDailyLog.create({ user_id, date, ...patch });
  } catch { /* silent */ }
}

async function upsertMenoLog(patch) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    const date = todayISO();
    const existing = await base44.entities.MenopauseDailyLog
      .filter({ user_id, date }, "-date", 1).catch(() => []);
    const row = (existing || [])[0];
    if (row?.id) await base44.entities.MenopauseDailyLog.update(row.id, patch);
    else         await base44.entities.MenopauseDailyLog.create({ user_id, date, ...patch });
  } catch { /* silent */ }
}

async function writeTask(title, time_of_day) {
  try {
    const user_id = await getUserId();
    if (!user_id) return;
    await base44.entities.PersonalTasks.create({
      user_id, date: todayISO(), title,
      category: "personal", completed: false,
      notes: time_of_day ? `time:${time_of_day.toLowerCase()}` : "",
      created_at: nowISO(), updated_at: nowISO(),
    });
  } catch { /* silent */ }
}

// ── Tiny shared UI atoms ────────────────────────────────────────────────────
function SectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase",
      letterSpacing: "0.12em", marginBottom: 8, marginTop: 4, ...style,
    }}>{children}</div>
  );
}

function Chip({ active, onClick, children, color = T.gold }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 12px", borderRadius: 14, minHeight: 32,
      border: `1.5px solid ${active ? color : T.border}`,
      background: active ? `${color}22` : "transparent",
      color: T.espresso, fontSize: 12, fontWeight: 600, cursor: "pointer",
      transition: "all 0.18s ease",
    }}>{children}</button>
  );
}

function Dots({ value, onChange, color = T.gold, max = 5 }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: max }, (_, i) => (
        <button key={i} onClick={() => onChange(i + 1)} style={{
          width: 30, height: 30, borderRadius: "50%",
          border: `2px solid ${i < value ? color : T.border}`,
          background: i < value ? color : "transparent",
          color: i < value ? T.espresso : T.muted,
          fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0,
        }}>{i + 1}</button>
      ))}
    </div>
  );
}

function Stepper({ value, onChange, step = 1, min = 0, max = 99, suffix = "" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))} style={{
        width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`,
        background: T.paperHi, color: T.espresso, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}><Minus size={14} /></button>
      <span style={{ minWidth: 48, textAlign: "center", fontWeight: 700, fontSize: 14, color: T.espresso }}>
        {value}{suffix}
      </span>
      <button onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))} style={{
        width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${T.border}`,
        background: T.paperHi, color: T.espresso, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}><Plus size={14} /></button>
    </div>
  );
}

// ─── ArcDial — semicircular 5-segment selector (Energy/Stress/Focus) ────────
// 90×52 SVG, 5 arcs each 33° + 4 gaps × 3.75° = 180°. Tappable segments fill
// in left-to-right as value increases. Tapping active value clears it back
// to 0 so the user can un-set.
function ArcDial({ label, value, onChange, colors }) {
  const cx = 45, cy = 45, R = 36;
  const segDeg = 33, gapDeg = 3.75;
  const startAt = 180;
  const segments = Array.from({ length: 5 }, (_, i) => {
    const a0 = startAt - i * (segDeg + gapDeg);
    const a1 = a0 - segDeg;
    const r0 = a0 * Math.PI / 180;
    const r1 = a1 * Math.PI / 180;
    const x0 = cx + R * Math.cos(r0), y0 = cy - R * Math.sin(r0);
    const x1 = cx + R * Math.cos(r1), y1 = cy - R * Math.sin(r1);
    // sweep-flag=1 → arc curves over the top of the dial (clockwise in SVG)
    return { i, d: `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}` };
  });
  return (
    <div style={{ width: 92, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <div style={{
        fontSize: 9, fontWeight: 700, color: T.muted,
        textTransform: "uppercase", letterSpacing: "0.12em",
      }}>{label}</div>
      <svg width="90" height="48" viewBox="0 0 90 52" style={{ overflow: "visible" }}>
        {segments.map(seg => {
          const active = value > seg.i;
          return (
            <path
              key={seg.i}
              d={seg.d}
              fill="none"
              stroke={active ? colors[seg.i] : "rgba(58,44,26,0.12)"}
              strokeWidth="8"
              strokeLinecap="round"
              onClick={() => onChange(value === seg.i + 1 ? 0 : seg.i + 1)}
              style={{ cursor: "pointer" }}
            />
          );
        })}
      </svg>
      <div style={{
        fontSize: 13, fontWeight: 800, color: T.espresso,
        marginTop: -10, fontFamily: "'Inter', system-ui, sans-serif",
      }}>{value || 0}/5</div>
    </div>
  );
}

const ARC_COLORS = {
  energy: ["#C8E6C9", "#81C784", "#4CAF50", "#8FAF8F", "#D4AF37"],
  stress: ["#FFF9C4", "#FFE082", "#FFB74D", "#FF8A65", "#E57373"],
  focus:  ["#E3F2FD", "#90CAF9", "#64B5F6", "#42A5F5", "#3A2C1A"],
};

// ─── SliderRow — labeled 1–5 range with espresso thumb + sage fill ──────────
function SliderRow({ label, value, onChange, min = 1, max = 5 }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 4,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: T.muted,
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.espresso }}>{value}/{max}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: T.sage, cursor: "pointer" }}
      />
    </div>
  );
}

// ─── Collapsible block ──────────────────────────────────────────────────────
function Collapsible({ title, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 10 }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: "100%", padding: "8px 12px", borderRadius: 10,
        background: open ? `${T.gold}14` : "rgba(58,44,26,0.04)",
        border: `1px solid ${open ? T.gold : T.border}`,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 11, fontWeight: 700, color: T.espresso,
        textTransform: "uppercase", letterSpacing: "0.10em",
      }}>
        <span>{title}{count > 0 ? ` · ${count}` : ""}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div style={{ paddingTop: 8 }}>{children}</div>}
    </div>
  );
}

function Toast({ message, visible }) {
  return (
    <div style={{
      position: "absolute", bottom: 12, left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 12}px)`,
      background: T.espresso, color: T.cream, padding: "8px 16px", borderRadius: 20,
      fontSize: 12.5, fontWeight: 700, opacity: visible ? 1 : 0,
      transition: "opacity 0.22s ease, transform 0.22s ease",
      pointerEvents: "none", zIndex: 9999, whiteSpace: "nowrap",
      display: "inline-flex", alignItems: "center", gap: 6,
      boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    }}>
      <Check size={13} strokeWidth={3} /> {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD 1 — Check-in (mood tags + arc dials + sleep + water + period + influences)
// ─────────────────────────────────────────────────────────────────────────────
const MOOD_TAG_OPTIONS = [
  "Calm", "Happy", "Energetic", "Frisky", "Mood swings",
  "Irritated", "Sad", "Anxious", "Depressed", "Feeling guilty",
  "Obsessive thoughts", "Low energy", "Apathetic", "Confused", "Very self-critical",
];
const SLEEP_QUALITY_OPTIONS = ["Great sleep", "Good sleep", "Restless sleep", "Couldn't sleep"];
const PERIOD_FLOW_OPTIONS = ["No period", "Spotting", "Light", "Medium", "Heavy", "Very heavy"];
const PERIOD_EVENT_OPTIONS = ["Period started today", "Period ended today"];
const DISCHARGE_OPTIONS = ["No discharge", "Creamy", "Watery", "Sticky", "Egg white", "Spotting", "Unusual"];
// Influences map to DailyCheckins.other_tags[] (matches Today's "Other" chips)
const INFLUENCE_OPTIONS = [
  "Stress", "Meditation", "Journaling", "Breathing exercises",
  "Kegel exercises", "Travel", "Alcohol", "Disease or injury",
];

function CheckinCard({ showToast }) {
  const [moodTags, setMoodTags]           = useState(new Set());
  const [energy, setEnergy]               = useState(0);
  const [stress, setStress]               = useState(0);
  const [focus, setFocus]                 = useState(0);
  const [sleep, setSleep]                 = useState(7.0);
  const [sleepQualityTag, setSleepQTag]   = useState("");
  const [glasses, setGlasses]             = useState(0);
  const [periodFlow, setPeriodFlow]       = useState("");
  const [periodEvents, setPeriodEvents]   = useState(new Set());
  const [discharge, setDischarge]         = useState("");
  const [influences, setInfluences]       = useState(new Set());

  // ── Auto-save handlers (every interaction → DailyCheckins upsert) ─────────
  const tapMoodTag = (m) => setMoodTags(prev => {
    const next = new Set(prev);
    if (next.has(m)) next.delete(m); else next.add(m);
    writeCheckin({ mood_tags: Array.from(next) });
    return next;
  });
  const tapEnergy = (v) => { setEnergy(v); writeCheckin({ energy: v }); };
  const tapStress = (v) => { setStress(v); writeCheckin({ stress: v }); };
  const tapFocus  = (v) => { setFocus(v);  writeCheckin({ focus: v }); };
  const tapSleep  = (v) => { setSleep(v);  writeCheckin({ sleep_hours: v }); };
  const tapSleepQ = (v) => {
    setSleepQTag(prev => prev === v ? "" : v);
    writeCheckin({ sleep_quality_tag: sleepQualityTag === v ? null : v });
  };
  const tapGlasses = (v) => {
    if (v > glasses) writeHydration(250);
    setGlasses(v);
  };
  const tapFlow = (opt) => {
    const next = periodFlow === opt ? "" : opt;
    setPeriodFlow(next);
    writeCheckin({ period_flow: next || null });
    if (next) {
      writeCycleEvent(next);
      showToast(`${opt} logged`);
    }
  };
  const tapEvent = (opt) => setPeriodEvents(prev => {
    const next = new Set(prev);
    if (next.has(opt)) next.delete(opt); else next.add(opt);
    writeCheckin({ period_events: Array.from(next) });
    return next;
  });
  const tapDischarge = (opt) => {
    const next = discharge === opt ? "" : opt;
    setDischarge(next);
    writeCheckin({ discharge: next || null, cervical_mucus: next || null });
  };
  const tapInfluence = (s) => setInfluences(prev => {
    const next = new Set(prev);
    if (next.has(s)) next.delete(s); else next.add(s);
    writeCheckin({ other_tags: Array.from(next) });
    return next;
  });

  return (
    <div>
      <SectionLabel>How are you feeling?</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {MOOD_TAG_OPTIONS.map(m => (
          <Chip key={m} active={moodTags.has(m)} onClick={() => tapMoodTag(m)}>{m}</Chip>
        ))}
      </div>

      {/* 3-dial row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4,
        marginBottom: 12, padding: "6px 0",
        background: "rgba(58,44,26,0.04)", borderRadius: 12,
        justifyItems: "center",
      }}>
        <ArcDial label="Energy" value={energy} onChange={tapEnergy} colors={ARC_COLORS.energy} />
        <ArcDial label="Stress" value={stress} onChange={tapStress} colors={ARC_COLORS.stress} />
        <ArcDial label="Focus"  value={focus}  onChange={tapFocus}  colors={ARC_COLORS.focus} />
      </div>

      {/* Sleep */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 6, padding: "4px 2px",
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: T.muted,
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>Sleep last night</span>
        <Stepper value={sleep} onChange={tapSleep} step={0.5} min={0} max={16} suffix="h" />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {SLEEP_QUALITY_OPTIONS.map(s => (
          <Chip key={s} active={sleepQualityTag === s} onClick={() => tapSleepQ(s)}>{s}</Chip>
        ))}
      </div>

      {/* Water */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: T.muted,
            textTransform: "uppercase", letterSpacing: "0.12em",
          }}>Water — {glasses} of 8 glasses</span>
          <Stepper value={glasses} onChange={tapGlasses} step={1} min={0} max={20} suffix="" />
        </div>
        <div style={{ height: 4, borderRadius: 3, background: "rgba(58,44,26,0.10)", overflow: "hidden" }}>
          <div style={{
            width: `${Math.min(100, (glasses / 8) * 100)}%`, height: "100%",
            background: "#60B4FA", transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* Period */}
      <SectionLabel>Period — flow</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
        {PERIOD_FLOW_OPTIONS.map(opt => (
          <Chip key={opt} active={periodFlow === opt} onClick={() => tapFlow(opt)}>{opt}</Chip>
        ))}
      </div>
      <SectionLabel>Period — start / end</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
        {PERIOD_EVENT_OPTIONS.map(opt => (
          <Chip key={opt} active={periodEvents.has(opt)} onClick={() => tapEvent(opt)}>{opt}</Chip>
        ))}
      </div>
      <Collapsible title="Discharge" count={discharge ? 1 : 0}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {DISCHARGE_OPTIONS.map(opt => (
            <Chip key={opt} active={discharge === opt} onClick={() => tapDischarge(opt)}>{opt}</Chip>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="What's influencing you?" count={influences.size}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {INFLUENCE_OPTIONS.map(opt => (
            <Chip key={opt} active={influences.has(opt)} onClick={() => tapInfluence(opt)}>{opt}</Chip>
          ))}
        </div>
      </Collapsible>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD 2 — Body (symptoms + activity + pain sliders + digestion + skin + sex)
// ─────────────────────────────────────────────────────────────────────────────
const SYMPTOM_OPTIONS = [
  "Everything is fine", "Cramps", "Tender breasts", "Headache", "Acne",
  "Backache", "Fatigue", "Cravings", "Insomnia", "Abdominal pain",
  "Bloating", "Nausea", "Vaginal dryness", "Constipation", "Diarrhea",
];
const ACTIVITY_OPTIONS = [
  "Didn't exercise", "Yoga", "Gym", "Pilates", "Running",
  "Swimming", "Cycling", "Walking", "Aerobics", "Team sports",
];
const DIGESTION_OPTIONS = ["Normal digestion", "Bloated", "Nausea", "Constipation", "Diarrhea"];
const SKIN_OPTIONS = ["Clear", "Mild breakout", "Moderate breakout", "Very oily", "Very dry"];
const HAIR_OPTIONS = ["Normal shedding", "More than usual", "A lot of shedding"];
const SEX_OPTIONS = [
  "Didn't have sex", "Protected sex", "Unprotected sex", "Oral sex",
  "High sex drive", "Neutral sex drive", "Low sex drive", "Sensual touch",
];

function BodyCard() {
  const [symptoms, setSymptoms]         = useState(new Set());
  const [activity, setActivity]         = useState(new Set());
  const [cramps, setCramps]             = useState(1);
  const [pain, setPain]                 = useState(1);
  const [digestion, setDigestion]       = useState(new Set());
  const [skin, setSkin]                 = useState("");
  const [hair, setHair]                 = useState("");
  const [sex, setSex]                   = useState(new Set());

  // Symptoms multi → also derive bloating/headache/breast_tenderness numerics.
  const tapSymptom = (s) => setSymptoms(prev => {
    const next = new Set(prev);
    if (next.has(s)) next.delete(s); else next.add(s);
    const patch = { symptoms: Array.from(next) };
    if (next.has("Bloating"))      patch.bloating = 3;
    if (next.has("Headache"))      patch.headache = 3;
    if (next.has("Tender breasts")) patch.breast_tenderness = 3;
    writeCheckin(patch);
    return next;
  });

  // Activity multi → derive exercise_done + exercise_type.
  const tapActivity = (a) => setActivity(prev => {
    const next = new Set(prev);
    if (next.has(a)) next.delete(a); else next.add(a);
    const arr = Array.from(next);
    const nonRest = arr.filter(x => x !== "Didn't exercise");
    writeCheckin({
      activity_tags: arr,
      exercise_done: nonRest.length > 0,
      exercise_type: nonRest.length > 0 ? nonRest.join(", ") : null,
    });
    return next;
  });

  const tapCramps = (v) => { setCramps(v); writeCheckin({ cramps: v }); };
  const tapPain   = (v) => { setPain(v);   writeCheckin({ pain: v }); };

  const tapDigestion = (d) => setDigestion(prev => {
    const next = new Set(prev);
    if (next.has(d)) next.delete(d); else next.add(d);
    writeCheckin({ digestion_tags: Array.from(next) });
    return next;
  });

  const tapSkin = (opt) => {
    const next = skin === opt ? "" : opt;
    setSkin(next);
    writeCheckin({ skin_condition: next || null });
  };
  const tapHair = (opt) => {
    const next = hair === opt ? "" : opt;
    setHair(next);
    const HAIR_MAP = { "Normal shedding": "Normal", "More than usual": "More than usual", "A lot of shedding": "A lot" };
    writeCheckin({ hair_shedding: next ? (HAIR_MAP[next] || next) : null });
  };

  // Sex tags multi → derive libido.
  const tapSex = (s) => setSex(prev => {
    const next = new Set(prev);
    if (next.has(s)) next.delete(s); else next.add(s);
    const arr = Array.from(next);
    const patch = { sex_tags: arr };
    if (arr.includes("High sex drive"))      patch.libido = 5;
    else if (arr.includes("Low sex drive"))  patch.libido = 1;
    writeCheckin(patch);
    return next;
  });

  return (
    <div>
      <SectionLabel>Symptoms</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {SYMPTOM_OPTIONS.map(s => (
          <Chip key={s} active={symptoms.has(s)} onClick={() => tapSymptom(s)}>{s}</Chip>
        ))}
      </div>

      <SectionLabel>Activity</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {ACTIVITY_OPTIONS.map(a => (
          <Chip key={a} active={activity.has(a)} onClick={() => tapActivity(a)}>{a}</Chip>
        ))}
      </div>

      <SliderRow label="Cramps" value={cramps} onChange={tapCramps} />
      <SliderRow label="Pain level" value={pain} onChange={tapPain} />

      <SectionLabel>Digestion</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {DIGESTION_OPTIONS.map(d => (
          <Chip key={d} active={digestion.has(d)} onClick={() => tapDigestion(d)}>{d}</Chip>
        ))}
      </div>

      <Collapsible title="Skin & Hair" count={(skin ? 1 : 0) + (hair ? 1 : 0)}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: T.muted,
          textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6,
        }}>Skin</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {SKIN_OPTIONS.map(opt => (
            <Chip key={opt} active={skin === opt} onClick={() => tapSkin(opt)}>{opt}</Chip>
          ))}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: T.muted,
          textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6,
        }}>Hair shedding</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {HAIR_OPTIONS.map(opt => (
            <Chip key={opt} active={hair === opt} onClick={() => tapHair(opt)}>{opt}</Chip>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Intimacy" count={sex.size}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {SEX_OPTIONS.map(opt => (
            <Chip key={opt} active={sex.has(opt)} onClick={() => tapSex(opt)}>{opt}</Chip>
          ))}
        </div>
      </Collapsible>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD 2 — Nourish (meals + drinks)
// ─────────────────────────────────────────────────────────────────────────────
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const PORTION_SIZES = ["Small", "Medium", "Large"];
const DRINK_TYPES = [
  { label: "Water",    Icon: Droplets, tone: "#60B4FA" },
  { label: "Coffee",   Icon: Coffee,   tone: T.espresso },
  { label: "Tea",      Icon: Coffee,   tone: T.muted },
  { label: "Juice",    Icon: Droplets, tone: T.blush },
  { label: "Smoothie", Icon: Droplets, tone: T.sage },
  { label: "Soda",     Icon: Droplets, tone: T.gold },
  { label: "Alcohol",  Icon: Wine,     tone: T.plum },
  { label: "Other",    Icon: Droplets, tone: T.muted },
];

function NourishCard({ showToast }) {
  const [mealType, setMealType] = useState("");
  const [description, setDescription] = useState("");
  const [portion, setPortion] = useState("Medium");
  const [kcal, setKcal] = useState("");
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [waterCount, setWaterCount] = useState(0);

  const logMeal = () => {
    if (!description.trim() || !mealType) return;
    const meal = { meal_type: mealType, description: description.trim(), portion_size: portion, estimated_calories: kcal };
    writeMeal(meal);
    setLoggedMeals(prev => [...prev, meal]);
    showToast(`${mealType} logged`);
    setDescription(""); setKcal(""); setMealType("");
  };

  const addWater = () => {
    setWaterCount(c => c + 1);
    writeHydration(250);
    showToast("+250 ml water");
  };

  const tapDrink = (d) => {
    writeDrink(d.label, 250);
    showToast(`${d.label} logged`);
  };

  return (
    <div>
      <SectionLabel>Meal</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
        {MEAL_TYPES.map(m => (
          <Chip key={m} active={mealType === m} onClick={() => setMealType(mealType === m ? "" : m)}>{m}</Chip>
        ))}
      </div>

      {mealType && (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder={`What did you eat for ${mealType.toLowerCase()}?`}
            rows={2}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "8px 12px", borderRadius: 10, minHeight: 60, height: 60,
              border: `1.5px solid ${T.border}`, background: T.paperHi,
              fontSize: 13, color: T.espresso, outline: "none", marginBottom: 8,
              resize: "none", fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {PORTION_SIZES.map(p => (
              <button key={p} onClick={() => setPortion(p)} style={{
                flex: 1, padding: "6px 10px", borderRadius: 14, minHeight: 34,
                border: `1.5px solid ${portion === p ? T.gold : T.border}`,
                background: portion === p ? `${T.gold}22` : T.paperHi,
                color: T.espresso, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>{p}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <input
              value={kcal} onChange={e => setKcal(e.target.value)}
              placeholder="Calories (optional)" type="number"
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 10,
                border: `1px solid ${T.border}`, background: T.paperHi,
                fontSize: 12, color: T.espresso, outline: "none",
              }}
            />
            <button onClick={logMeal} disabled={!description.trim()} style={{
              padding: "8px 20px", borderRadius: 9999, border: "none",
              background: description.trim() ? T.espresso : "rgba(58,44,26,0.20)",
              color: T.cream, fontWeight: 600, fontSize: 13,
              cursor: description.trim() ? "pointer" : "not-allowed",
              minHeight: 36,
            }}>Log meal</button>
          </div>
        </div>
      )}

      {loggedMeals.length > 0 && (
        <div style={{ marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {loggedMeals.slice(0, 4).map((m, i) => (
            <span key={i} style={{
              padding: "4px 10px", borderRadius: 14, background: T.sage,
              color: "#fff", fontSize: 11.5, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <Check size={11} strokeWidth={3} />
              {m.meal_type[0] + m.meal_type.slice(1).toLowerCase()} · {m.description.slice(0, 18)}{m.description.length > 18 ? "…" : ""}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: T.muted,
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>Water · {waterCount} glasses</span>
        <button onClick={addWater} style={{
          padding: "6px 14px", borderRadius: 14,
          border: `1.5px solid #60B4FA55`, background: "#60B4FA1F",
          color: T.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <Droplets size={14} color="#60B4FA" /> +1 glass
        </button>
      </div>

      <SectionLabel>Drinks</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {DRINK_TYPES.map(d => (
          <button key={d.label} onClick={() => tapDrink(d)} style={{
            padding: "6px 12px", borderRadius: 14, minHeight: 36,
            background: `${d.tone}1F`, border: `1.5px solid ${d.tone}55`,
            color: T.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <d.Icon size={12} color={d.tone} />
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD 3 — Health (medications + supplements)
// ─────────────────────────────────────────────────────────────────────────────
function HealthCard({ showToast }) {
  const PRESET_MEDS = ["Iron supplement", "Vitamin D", "Magnesium"];
  const [recent, setRecent] = useState([]);
  const [custom, setCustom] = useState([]);
  const [taken, setTaken] = useState(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDose, setNewDose] = useState("");

  // Load recent unique medications from MedicationLogs.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user_id = await getUserId();
        if (!user_id || cancelled) return;
        const rows = await base44.entities.MedicationLogs.filter({ user_id }, "-created_date", 60).catch(() => []);
        if (cancelled) return;
        const seen = new Set();
        const uniques = [];
        for (const r of rows || []) {
          if (r?.item_name && !seen.has(r.item_name) && !PRESET_MEDS.includes(r.item_name)) {
            seen.add(r.item_name); uniques.push(r.item_name);
          }
          if (uniques.length >= 5) break;
        }
        setRecent(uniques);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const allMeds = [...PRESET_MEDS, ...recent, ...custom];

  const toggleTaken = (med) => {
    setTaken(prev => {
      const next = new Set(prev);
      if (next.has(med)) next.delete(med);
      else { next.add(med); writeMedLog(med); showToast(`${med} logged`); }
      return next;
    });
  };

  const addMed = () => {
    const name = newName.trim();
    if (!name) return;
    const label = newDose.trim() ? `${name} ${newDose.trim()}` : name;
    setCustom(prev => [...prev, label]);
    writeMedLog(name, newDose.trim());
    showToast(`${label} added`);
    setNewName(""); setNewDose("");
    setShowAdd(false);
  };

  return (
    <div>
      <SectionLabel>Active medications &amp; supplements</SectionLabel>
      {allMeds.length === 0 && (
        <div style={{ fontSize: 11.5, color: T.muted, fontStyle: "italic", marginBottom: 10 }}>
          No medications yet — add one below.
        </div>
      )}
      <div style={{ marginBottom: 10 }}>
        {allMeds.map(med => (
          <div key={med} onClick={() => toggleTaken(med)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "6px 0",
            borderBottom: `1px solid ${T.border}`, cursor: "pointer",
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              border: `2px solid ${taken.has(med) ? T.gold : T.border}`,
              background: taken.has(med) ? T.gold : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {taken.has(med) && <Check size={10} strokeWidth={3} style={{ color: T.espresso }} />}
            </div>
            <span style={{ flex: 1, fontSize: 12.5, color: T.espresso, fontWeight: 500 }}>{med}</span>
            <span style={{ fontSize: 10, color: taken.has(med) ? T.sage : T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {taken.has(med) ? "Taken" : "Tap"}
            </span>
          </div>
        ))}
      </div>

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} style={{
          width: "100%", padding: "8px 12px", borderRadius: 10,
          border: `1px dashed ${T.gold}55`,
          background: `${T.gold}10`,
          color: T.espresso, fontSize: 12, fontWeight: 700, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Plus size={12} /> Add medication
        </button>
      ) : (
        <div style={{
          background: "rgba(212,175,55,0.08)", border: `1px dashed ${T.gold}55`,
          borderRadius: 10, padding: "8px 10px",
        }}>
          <SectionLabel>Add medication</SectionLabel>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <input
              value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Med name"
              style={{
                flex: 2, minWidth: 0, padding: "6px 9px", borderRadius: 8,
                border: `1px solid ${T.border}`, background: T.paperHi,
                fontSize: 11.5, color: T.espresso, outline: "none",
              }}
            />
            <input
              value={newDose} onChange={e => setNewDose(e.target.value)}
              placeholder="Dose"
              style={{
                flex: 1, minWidth: 0, padding: "6px 9px", borderRadius: 8,
                border: `1px solid ${T.border}`, background: T.paperHi,
                fontSize: 11.5, color: T.espresso, outline: "none",
              }}
            />
            <button onClick={addMed} disabled={!newName.trim()} style={{
              padding: "6px 11px", borderRadius: 8, border: "none",
              background: newName.trim() ? T.espresso : "rgba(58,44,26,0.18)",
              color: T.cream, fontSize: 11.5, fontWeight: 700,
              cursor: newName.trim() ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
            }}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD 4 — Mind & Life (journal + quick task)
// ─────────────────────────────────────────────────────────────────────────────
const JOURNAL_TYPES = ["Reflection", "Gratitude", "Affirmation", "Dream", "Mood"];
const TIME_OF_DAY = ["Morning", "Afternoon", "Evening", "No preference"];

function MindLifeCard({ showToast }) {
  const [text, setText] = useState("");
  const [entryType, setEntryType] = useState("Reflection");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTime, setTaskTime] = useState("No preference");
  const saveTimer = useRef(null);

  const handleJournal = (e) => {
    const v = e.target.value;
    setText(v);
    if (v.length >= 3) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        writeJournal(v, entryType);
        showToast("Journal saved");
      }, 800);
    }
  };

  const tapEntryType = (t) => {
    setEntryType(t);
    if (text.length >= 3) writeJournal(text, t);
  };

  const addTask = () => {
    if (!taskTitle.trim()) return;
    writeTask(taskTitle.trim(), taskTime);
    showToast("Task added");
    setTaskTitle("");
  };

  return (
    <div>
      <SectionLabel>Journal</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
        {JOURNAL_TYPES.map(t => (
          <Chip key={t} active={entryType === t} onClick={() => tapEntryType(t)}>{t}</Chip>
        ))}
      </div>
      <textarea
        value={text} onChange={handleJournal} placeholder="Write freely…"
        rows={3}
        style={{
          width: "100%", boxSizing: "border-box",
          height: 72, minHeight: 72, borderRadius: 10,
          border: `1.5px solid ${T.border}`,
          background: "rgba(244,237,219,0.5)", padding: "8px 10px",
          fontSize: 12, color: T.espresso, resize: "none", outline: "none",
          fontFamily: "inherit", marginBottom: 12,
        }}
      />

      <SectionLabel>Quick task</SectionLabel>
      <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
        <input
          value={taskTitle} onChange={e => setTaskTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTask()}
          placeholder="What needs doing?"
          style={{
            flex: 1, minWidth: 0, padding: "8px 12px", borderRadius: 10,
            border: `1px solid ${T.border}`, background: T.paperHi,
            fontSize: 12, color: T.espresso, outline: "none",
          }}
        />
        <button onClick={addTask} disabled={!taskTitle.trim()} style={{
          padding: "6px 14px", borderRadius: 10, border: "none",
          background: taskTitle.trim() ? T.gold : "rgba(58,44,26,0.18)",
          color: T.espresso, fontSize: 12, fontWeight: 700,
          cursor: taskTitle.trim() ? "pointer" : "not-allowed",
        }}>Add</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {TIME_OF_DAY.map(t => (
          <Chip key={t} active={taskTime === t} onClick={() => setTaskTime(t)}>{t}</Chip>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIFE STAGE — Pregnancy / Menopause daily-log card (gated by profile.life_stage)
// ─────────────────────────────────────────────────────────────────────────────
function PregnancyCard() {
  const [hasProfile, setHasProfile] = useState(null); // null = loading
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [sleepQ, setSleepQ] = useState(3);
  const [nausea, setNausea] = useState(1);
  const [pelvic, setPelvic] = useState(1);
  const [swelling, setSwelling] = useState(1);
  const [notes, setNotes] = useState("");
  const notesTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user_id = await getUserId();
        if (!user_id || cancelled) return;
        const profiles = await base44.entities.PregnancyProfile
          .filter({ user_id }, null, 1).catch(() => []);
        if (cancelled) return;
        setHasProfile(!!profiles?.[0]);
        // Load today's log if it exists.
        const date = todayISO();
        const logs = await base44.entities.PregnancyDailyLog
          .filter({ user_id, date }, "-date", 1).catch(() => []);
        const row = logs?.[0];
        if (row) {
          if (row.energy)        setEnergy(row.energy);
          if (row.mood)          setMood(row.mood);
          if (row.sleep_quality) setSleepQ(row.sleep_quality);
          if (row.nausea)        setNausea(row.nausea);
          if (row.pelvic_pain)   setPelvic(row.pelvic_pain);
          if (row.swelling)      setSwelling(row.swelling);
          if (row.notes)         setNotes(row.notes);
        }
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const wrap = (key, setter) => (v) => { setter(v); upsertPregLog({ [key]: v }); };
  const handleNotes = (e) => {
    const v = e.target.value;
    setNotes(v);
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => upsertPregLog({ notes: v }), 600);
  };

  if (hasProfile === null) {
    return <div style={{ padding: 20, color: T.muted, fontSize: 12 }}>Loading…</div>;
  }
  if (!hasProfile) {
    return (
      <div style={{ padding: "16px 8px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>
          Set up pregnancy support to log here.
        </p>
        <a href="/LifeStageCare" style={{
          display: "inline-block", padding: "10px 20px", borderRadius: 9999,
          background: T.espresso, color: T.cream, textDecoration: "none",
          fontSize: 13, fontWeight: 700,
        }}>Set up pregnancy support</a>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel>Pregnancy daily log</SectionLabel>
      <SliderRow label="Energy"        value={energy}   onChange={wrap("energy", setEnergy)} />
      <SliderRow label="Mood"          value={mood}     onChange={wrap("mood", setMood)} />
      <SliderRow label="Sleep quality" value={sleepQ}   onChange={wrap("sleep_quality", setSleepQ)} />
      <SliderRow label="Nausea (1=none, 5=severe)" value={nausea}   onChange={wrap("nausea", setNausea)} />
      <SliderRow label="Pelvic discomfort"          value={pelvic}   onChange={wrap("pelvic_pain", setPelvic)} />
      <SliderRow label="Swelling"      value={swelling} onChange={wrap("swelling", setSwelling)} />
      <textarea
        value={notes} onChange={handleNotes} placeholder="Notes (optional)"
        rows={3}
        style={{
          width: "100%", boxSizing: "border-box",
          height: 72, minHeight: 72, borderRadius: 10,
          border: `1.5px solid ${T.border}`,
          background: "rgba(244,237,219,0.5)", padding: "8px 10px",
          fontSize: 12, color: T.espresso, resize: "none", outline: "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function MenopauseCard() {
  const [hasProfile, setHasProfile] = useState(null);
  const [hot, setHot] = useState(1);
  const [sweats, setSweats] = useState(1);
  const [sleepQ, setSleepQ] = useState(3);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState("");
  const notesTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user_id = await getUserId();
        if (!user_id || cancelled) return;
        const profiles = await base44.entities.MenopauseProfile
          .filter({ user_id }, null, 1).catch(() => []);
        if (cancelled) return;
        setHasProfile(!!profiles?.[0]);
        const date = todayISO();
        const logs = await base44.entities.MenopauseDailyLog
          .filter({ user_id, date }, "-date", 1).catch(() => []);
        const row = logs?.[0];
        if (row) {
          if (row.hot_flashes)   setHot(row.hot_flashes);
          if (row.night_sweats)  setSweats(row.night_sweats);
          if (row.sleep_quality) setSleepQ(row.sleep_quality);
          if (row.mood)          setMood(row.mood);
          if (row.energy)        setEnergy(row.energy);
          if (row.notes)         setNotes(row.notes);
        }
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const wrap = (key, setter) => (v) => { setter(v); upsertMenoLog({ [key]: v }); };
  const handleNotes = (e) => {
    const v = e.target.value;
    setNotes(v);
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => upsertMenoLog({ notes: v }), 600);
  };

  if (hasProfile === null) {
    return <div style={{ padding: 20, color: T.muted, fontSize: 12 }}>Loading…</div>;
  }
  if (!hasProfile) {
    return (
      <div style={{ padding: "16px 8px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>
          Set up menopause support to log here.
        </p>
        <a href="/LifeStageCare" style={{
          display: "inline-block", padding: "10px 20px", borderRadius: 9999,
          background: T.espresso, color: T.cream, textDecoration: "none",
          fontSize: 13, fontWeight: 700,
        }}>Set up menopause support</a>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel>Menopause daily log</SectionLabel>
      <SliderRow label="Hot flashes (1=none, 5=severe)" value={hot}    onChange={wrap("hot_flashes", setHot)} />
      <SliderRow label="Night sweats"                   value={sweats} onChange={wrap("night_sweats", setSweats)} />
      <SliderRow label="Sleep quality"                  value={sleepQ} onChange={wrap("sleep_quality", setSleepQ)} />
      <SliderRow label="Mood"                           value={mood}   onChange={wrap("mood", setMood)} />
      <SliderRow label="Energy"                         value={energy} onChange={wrap("energy", setEnergy)} />
      <textarea
        value={notes} onChange={handleNotes} placeholder="Notes (optional)"
        rows={3}
        style={{
          width: "100%", boxSizing: "border-box",
          height: 72, minHeight: 72, borderRadius: 10,
          border: `1.5px solid ${T.border}`,
          background: "rgba(244,237,219,0.5)", padding: "8px 10px",
          fontSize: 12, color: T.espresso, resize: "none", outline: "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG TAB — 3D card deck (flat translateX/scale, no rotateY — labels clip)
// ─────────────────────────────────────────────────────────────────────────────
const BASE_CARDS = [
  { id: "checkin",  label: "Check-in",     Icon: Heart,    Component: CheckinCard },
  { id: "body",     label: "Body",         Icon: Activity, Component: BodyCard,
    pillBg: T.blush, pillActiveBg: T.blush, pillActiveColor: T.espresso },
  { id: "nourish",  label: "Nourish",      Icon: Utensils, Component: NourishCard },
  { id: "health",   label: "Health",       Icon: Pill,     Component: HealthCard },
  { id: "mindlife", label: "Mind & Life",  Icon: Pen,      Component: MindLifeCard },
];
const PREG_STAGES = new Set(["pregnant-t1", "pregnant-t2", "pregnant-t3"]);
const MENO_STAGES = new Set(["perimenopause", "menopause", "post-menopause"]);
function buildCards(lifeStage) {
  if (PREG_STAGES.has(lifeStage)) {
    return [...BASE_CARDS, { id: "pregnancy", label: "Pregnancy", Icon: Heart, Component: PregnancyCard,
      pillBg: T.sage, pillActiveBg: T.sage, pillActiveColor: "#FFFFFF" }];
  }
  if (MENO_STAGES.has(lifeStage)) {
    return [...BASE_CARDS, { id: "menopause", label: "Menopause", Icon: Heart, Component: MenopauseCard,
      pillBg: T.plum, pillActiveBg: T.plum, pillActiveColor: "#FFFFFF" }];
  }
  return BASE_CARDS;
}

function PillNav({ cards, current, onSelect }) {
  return (
    <div style={{
      display: "flex", gap: 6, overflowX: "auto",
      padding: "8px 16px 6px", scrollbarWidth: "none",
    }}>
      {cards.map((c, i) => {
        const active = i === current;
        const bg = active
          ? (c.pillActiveBg || T.gold)
          : (c.pillBg ? `${c.pillBg}40` : "rgba(58,44,26,0.10)");
        const color = active ? (c.pillActiveColor || T.espresso) : T.muted;
        return (
          <button key={c.id} onClick={() => onSelect(i)} style={{
            flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none",
            cursor: "pointer", fontSize: 11.5, fontWeight: 700,
            transition: "all 0.2s ease",
            background: bg, color,
          }}>{c.label}</button>
        );
      })}
    </div>
  );
}

function LogTab({ cards, showToast }) {
  const [current, setCurrent] = useState(0);
  const dragStart = useRef(null);
  const totalCards = cards.length;

  const handleDragStart = (clientX) => { dragStart.current = clientX; };
  const handleDragEnd = (clientX) => {
    if (dragStart.current === null) return;
    const delta = dragStart.current - clientX;
    dragStart.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0 && current < totalCards - 1) setCurrent(c => c + 1);
    if (delta < 0 && current > 0)                setCurrent(c => c - 1);
  };

  // Flat translateX + scale only — no rotateY (label clipping).
  const cardTransform = (i) => {
    const diff = i - current;
    if (diff === 0)  return { x: "0%",    scale: 1,    opacity: 1,    zIndex: 10 };
    if (diff === 1)  return { x: "75%",   scale: 0.92, opacity: 0.65, zIndex: 9 };
    if (diff >= 2)   return { x: "150%",  scale: 0.86, opacity: 0,    zIndex: 8 };
    if (diff === -1) return { x: "-105%", scale: 0.92, opacity: 0,    zIndex: 7 };
    return            { x: "-200%", scale: 0.86, opacity: 0,    zIndex: 6 };
  };

  return (
    <>
      <PillNav cards={cards} current={current} onSelect={setCurrent} />
      <div
        style={{
          position: "relative", flex: 1, minHeight: 0,
          margin: "8px 12px 12px",
          overflow: "hidden",
        }}
        onMouseDown={e => handleDragStart(e.clientX)}
        onMouseUp={e   => handleDragEnd(e.clientX)}
        onTouchStart={e => handleDragStart(e.touches[0].clientX)}
        onTouchEnd={e   => handleDragEnd(e.changedTouches[0].clientX)}
      >
        {cards.map((c, i) => {
          const { x, scale, opacity, zIndex } = cardTransform(i);
          const isActive = i === current;
          const CardCmp = c.Component;
          return (
            <div key={c.id} style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              transform: `translateX(${x}) scale(${scale})`,
              transformOrigin: "50% 50%",
              opacity, zIndex,
              transition: "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.35s ease",
              background: T.cardBg, borderRadius: 18,
              boxShadow: isActive
                ? "0 20px 60px rgba(58,44,26,0.18), 0 4px 16px rgba(58,44,26,0.12)"
                : "0 6px 18px rgba(58,44,26,0.08)",
              border: `1px solid ${T.border}`,
              pointerEvents: isActive ? "auto" : "none",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}>
              <div style={{ padding: "20px 20px 12px", flexShrink: 0,
                display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: `${T.gold}22`, color: T.goldDeep,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}><c.Icon size={14} /></span>
                <span style={{ fontSize: 15, fontWeight: 800, color: T.espresso }}>{c.label}</span>
                <div style={{ flex: 1 }} />
                {i < totalCards - 1 && (
                  <button onClick={() => setCurrent(i + 1)} style={{
                    fontSize: 11, color: T.muted, background: "none", border: "none",
                    cursor: "pointer", fontWeight: 600, padding: 0,
                  }}>Next →</button>
                )}
              </div>
              <div style={{
                padding: "0 20px 20px", flex: 1, overflow: "auto",
              }}>
                <CardCmp showToast={showToast} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD TAB — reuses TypeGrid + DetailForm from UniversalLogger
// ─────────────────────────────────────────────────────────────────────────────
function AddTab({ initialTypeId, onClose }) {
  const [pickedId, setPickedId] = useState(initialTypeId || null);
  const picked = pickedId ? TYPES.find(t => t.id === pickedId) : null;
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px 16px" }}>
      {picked ? (
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
            fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
            color: T.muted, fontWeight: 700,
          }}>
            <button onClick={() => setPickedId(null)} style={{
              padding: 0, background: "none", border: "none", cursor: "pointer",
              color: T.muted, fontSize: 12, fontWeight: 700,
            }}>← Back</button>
            <span>· {picked.label}</span>
          </div>
          <DetailForm type={picked} onCancel={onClose} onSaved={onClose} />
        </>
      ) : (
        <TypeGrid onPick={id => setPickedId(id)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — FAB + bottom sheet with tab bar
// ─────────────────────────────────────────────────────────────────────────────
export default function UnifiedTabLogger() {
  const [, setTick] = useState(0);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("log"); // "log" | "add"
  const [initialAddType, setInitialAddType] = useState(null);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [lifeStage, setLifeStage] = useState(null);
  const toastTimer = useRef(null);

  // Load UserProfile.life_stage once so we can show the Pregnancy / Menopause
  // card when appropriate. Failure is silent — falls back to base 5 cards.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user_id = await getUserId();
        if (!user_id || cancelled) return;
        const rows = await base44.entities.UserProfile
          .filter({ user_id }, null, 1).catch(() => []);
        if (cancelled) return;
        setLifeStage(rows?.[0]?.life_stage || null);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const cards = buildCards(lifeStage);

  // Subscribe to the openLogger() singleton in UniversalLogger so every
  // existing call site (50+ across PlannerV2Shell, Today checkin tiles, etc.)
  // keeps working unchanged.
  useEffect(() => {
    const handler = () => {
      setTick(t => t + 1);
      const { open: nextOpen, type } = getLoggerState();
      if (nextOpen) {
        setOpen(true);
        if (type) {
          setActiveTab("add");
          setInitialAddType(type);
        }
      } else {
        setOpen(false);
        setInitialAddType(null);
      }
    };
    return subscribeLoggerState(handler);
  }, []);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast({ message: msg, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 1500);
  }, []);

  // Path detection.
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const onIdeas   = path.startsWith("/Ideas");
  const onPlanner = path.startsWith("/Planner");

  // Set the default tab based on current path whenever the sheet opens.
  useEffect(() => {
    if (open && !initialAddType) {
      setActiveTab(onPlanner ? "add" : "log");
    }
  }, [open, onPlanner, initialAddType]);

  // Scroll lock while sheet is open.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (open) {
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.width = "100%";
      html.style.overflow = "hidden";
    } else {
      body.style.overflow = "";
      body.style.position = "";
      body.style.width = "";
      html.style.overflow = "";
    }
    return () => {
      body.style.overflow = "";
      body.style.position = "";
      body.style.width = "";
      html.style.overflow = "";
    };
  }, [open]);

  if (onIdeas) return null;

  const closeSheet = () => {
    setOpen(false);
    setInitialAddType(null);
    closeLogger();
  };

  return (
    <>
      {/* Single gold + FAB (always visible when sheet closed) */}
      {!open && (
        <button onClick={() => openLogger()} aria-label="Open logger" style={{
          position: "fixed",
          bottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
          right: 18, zIndex: 998,
          width: 56, height: 56, borderRadius: "50%",
          background: `linear-gradient(145deg, ${T.gold}, ${T.goldDeep})`,
          border: "none", cursor: "pointer",
          boxShadow: "0 12px 28px rgba(212,175,55,0.55), 0 0 0 4px rgba(244,237,219,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Plus size={26} style={{ color: T.cream }} strokeWidth={2.6} />
        </button>
      )}

      {/* Sheet */}
      {open && (
        <>
          <div
            onClick={closeSheet}
            onTouchMove={(e) => e.preventDefault()}
            style={{
              position: "fixed", inset: 0, background: "rgba(26,20,16,0.45)",
              zIndex: 998, touchAction: "none",
            }}
          />
          <div style={{
            position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 999,
            display: "flex", justifyContent: "center",
            padding: "0 8px max(8px, env(safe-area-inset-bottom))",
            animation: "fwUnifiedSheetUp .25s ease",
          }}>
            <style>{`@keyframes fwUnifiedSheetUp { from { transform: translateY(20%); opacity: 0.7; } to { transform: translateY(0); opacity: 1; } }`}</style>
            <div style={{ width: "100%", maxWidth: 480 }}>
              <div style={{
                background: T.cream, borderRadius: 20,
                boxShadow: "0 8px 30px rgba(58,44,26,0.12)",
                border: `1px solid ${T.border}`,
                display: "flex", flexDirection: "column",
                overflow: "hidden",
                maxHeight: "88vh", height: "88vh",
                position: "relative",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 16px 6px",
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.espresso }}>Logger</span>
                  <button onClick={closeSheet} aria-label="Close sheet" style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: "rgba(58,44,26,0.06)", border: "none", cursor: "pointer",
                    color: T.muted,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}><XIcon size={13} /></button>
                </div>

                {/* Tab bar */}
                <div style={{
                  display: "flex", gap: 0,
                  borderBottom: `1px solid ${T.border}`,
                  background: T.cream,
                }}>
                  {[
                    { id: "log", label: "Log" },
                    { id: "add", label: "Add" },
                  ].map(t => {
                    const active = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { setActiveTab(t.id); setInitialAddType(null); }}
                        style={{
                          flex: 1, padding: "12px 0", borderRadius: 0,
                          background: "transparent", border: "none", cursor: "pointer",
                          fontSize: 13, fontWeight: 700,
                          color: active ? T.espresso : T.muted,
                          borderBottom: active ? `2px solid ${T.gold}` : "2px solid transparent",
                          letterSpacing: "0.04em",
                          transition: "all 0.18s ease",
                        }}
                        aria-label={`${t.label} tab`}
                      >{t.label}</button>
                    );
                  })}
                </div>

                {/* Content */}
                {activeTab === "log" ? (
                  <LogTab cards={cards} showToast={showToast} />
                ) : (
                  <AddTab initialTypeId={initialAddType} onClose={closeSheet} />
                )}

                <Toast message={toast.message} visible={toast.visible} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

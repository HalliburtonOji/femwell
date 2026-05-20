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
  Heart, Utensils, Pill, Pen,
  Droplets, Coffee, Wine,
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
// CARD 1 — Check-in (mood + vitals + water + period + symptoms + influences)
// ─────────────────────────────────────────────────────────────────────────────
const MOOD_LABELS = ["Awful", "Low", "Okay", "Good", "Great"];
const SYMPTOM_OPTIONS = ["Cramps", "Bloating", "Headache", "Fatigue", "Tender", "Mood swings", "Acne", "Backache"];
const INFLUENCE_OPTIONS = ["Sleep", "Stress", "Diet", "Exercise", "Social", "Work"];
const PERIOD_OPTIONS = ["No period", "Spotting", "Light", "Medium", "Heavy"];

function CheckinCard({ showToast }) {
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [stress, setStress] = useState(0);
  const [sleep, setSleep] = useState(7.0);
  const [glasses, setGlasses] = useState(0);
  const [period, setPeriod] = useState("");
  const [symptoms, setSymptoms] = useState(new Set());
  const [influencesOpen, setInfluencesOpen] = useState(false);
  const [influences, setInfluences] = useState(new Set());

  const tapMood = (v) => { setMood(v); writeCheckin({ mood: v }); showToast(`Mood: ${MOOD_LABELS[v-1]}`); };
  const tapEnergy = (v) => { setEnergy(v); writeCheckin({ energy_level: v, energy: v }); showToast(`Energy ${v}/5`); };
  const tapStress = (v) => { setStress(v); writeCheckin({ stress_level: v, stress: v }); showToast(`Stress ${v}/5`); };
  const tapSleep = (v) => { setSleep(v); writeCheckin({ sleep_hours: v }); };
  const tapGlasses = (v) => {
    if (v > glasses) writeHydration(250);
    setGlasses(v);
  };
  const tapPeriod = (opt) => {
    setPeriod(opt);
    writeCycleEvent(opt);
    showToast(`${opt} logged`);
  };
  const tapSymptom = (s) => {
    setSymptoms(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else { next.add(s); writeSymptom(s); showToast(`${s} logged`); }
      return next;
    });
  };
  const tapInfluence = (s) => {
    setInfluences(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      writeCheckin({ influences: Array.from(next) });
      return next;
    });
  };

  return (
    <div>
      <SectionLabel>How are you?</SectionLabel>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {MOOD_LABELS.map((m, i) => {
          const active = mood === i + 1;
          return (
            <button key={m} onClick={() => tapMood(i + 1)} style={{
              flex: 1, padding: "8px 4px", borderRadius: 14, minHeight: 36,
              border: `1.5px solid ${active ? T.gold : T.border}`,
              background: active ? T.gold : T.paperHi,
              color: active ? T.espresso : T.muted,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>{m}</button>
          );
        })}
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        marginBottom: 10, padding: "8px 6px",
        background: "rgba(58,44,26,0.04)", borderRadius: 12,
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <SectionLabel style={{ marginBottom: 0 }}>Energy</SectionLabel>
          <Dots value={energy} onChange={tapEnergy} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
          <SectionLabel style={{ marginBottom: 0 }}>Stress</SectionLabel>
          <Dots value={stress} onChange={tapStress} color={T.blush} />
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 10, padding: "4px 2px",
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: T.muted,
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>Sleep last night</span>
        <Stepper value={sleep} onChange={tapSleep} step={0.5} min={0} max={16} suffix="h" />
      </div>

      <div style={{ marginBottom: 10 }}>
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

      <SectionLabel>Period</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
        {PERIOD_OPTIONS.map(opt => (
          <Chip key={opt} active={period === opt} onClick={() => tapPeriod(opt)}>{opt}</Chip>
        ))}
      </div>

      <SectionLabel>Symptoms</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
        {SYMPTOM_OPTIONS.map(s => (
          <Chip key={s} active={symptoms.has(s)} onClick={() => tapSymptom(s)}>{s}</Chip>
        ))}
      </div>

      <button onClick={() => setInfluencesOpen(v => !v)} style={{
        width: "100%", padding: "10px 14px", borderRadius: 12,
        background: influencesOpen ? `${T.gold}14` : "rgba(58,44,26,0.04)",
        border: `1px solid ${influencesOpen ? T.gold : T.border}`,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 12, fontWeight: 700, color: T.espresso,
      }}>
        What's influencing you?
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          {influences.size > 0 && (
            <span style={{ fontSize: 11, color: T.goldDeep, fontWeight: 700 }}>
              {influences.size} selected
            </span>
          )}
          <span style={{ fontSize: 14, color: T.muted }}>{influencesOpen ? "−" : "+"}</span>
        </span>
      </button>
      {influencesOpen && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {INFLUENCE_OPTIONS.map(opt => (
            <Chip key={opt} active={influences.has(opt)} onClick={() => tapInfluence(opt)}>{opt}</Chip>
          ))}
        </div>
      )}
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
// LOG TAB — 4-card 3D deck (flat translateX/scale, no rotateY — labels clip)
// ─────────────────────────────────────────────────────────────────────────────
const CARDS = [
  { id: "checkin",  label: "Check-in",     Icon: Heart,   Component: CheckinCard },
  { id: "nourish",  label: "Nourish",      Icon: Utensils, Component: NourishCard },
  { id: "health",   label: "Health",       Icon: Pill,    Component: HealthCard },
  { id: "mindlife", label: "Mind & Life",  Icon: Pen,     Component: MindLifeCard },
];
const TOTAL_CARDS = CARDS.length;

function PillNav({ current, onSelect }) {
  return (
    <div style={{
      display: "flex", gap: 6, overflowX: "auto",
      padding: "8px 16px 6px", scrollbarWidth: "none",
    }}>
      {CARDS.map((c, i) => {
        const active = i === current;
        return (
          <button key={c.id} onClick={() => onSelect(i)} style={{
            flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none",
            cursor: "pointer", fontSize: 11.5, fontWeight: 700,
            transition: "all 0.2s ease",
            background: active ? T.gold : "rgba(58,44,26,0.10)",
            color: active ? T.espresso : T.muted,
          }}>{c.label}</button>
        );
      })}
    </div>
  );
}

function LogTab({ showToast }) {
  const [current, setCurrent] = useState(0);
  const dragStart = useRef(null);

  const handleDragStart = (clientX) => { dragStart.current = clientX; };
  const handleDragEnd = (clientX) => {
    if (dragStart.current === null) return;
    const delta = dragStart.current - clientX;
    dragStart.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0 && current < TOTAL_CARDS - 1) setCurrent(c => c + 1);
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
      <PillNav current={current} onSelect={setCurrent} />
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
        {CARDS.map((c, i) => {
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
                {i < TOTAL_CARDS - 1 && (
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
  const toastTimer = useRef(null);

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
                  <LogTab showToast={showToast} />
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

// ─────────────────────────────────────────────────────────────────────────────
// UniversalLogger — global add sheet (replaces the thin Quick Add forms).
//
// Mounted ONCE at the root of App.jsx so the floating gold "+" FAB is
// available on every page. Any component can trigger it programmatically:
//
//   import { openLogger } from "@/components/UniversalLogger";
//   openLogger();           // → opens the type grid
//   openLogger("symptom");  // → opens the Symptom form directly
//
// The "+" FAB renders here by default. Pass `hideFAB` to suppress it on a
// specific page (use the React component, not the function).
//
// Form fields per type are config-driven — adding a new type means adding
// to TYPE_CONFIG. Field renderers live in this file (text · chips · date
// · time · date-time · number+unit · textarea · toggle · toggle+time ·
// stepper · face-scale · bar-scale · slider · list-builder).
//
// Save handler currently closes the sheet and emits a toast. Wiring to
// real entities will follow as each row migrates (Phase 1 row components
// will pass through `onSave` props to this logger).
//
// Brand rule: no emoji codepoints — Lucide icons throughout.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, X, ArrowLeft, Mic, Sparkles, Pen, ChevronRight,
  Footprints, ListChecks, Pill, Utensils, CalendarClock, Droplets,
  StickyNote, Smile, Stethoscope, Check, Frown, Meh, Heart, Zap,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  inferMealTypeFromTime,
  readAiAnalysis,
} from "@/utils/nutritionAiAnalysis";

// ── Tokens ─────────────────────────────────────────────────────────────────
const C = {
  cream:    "#F4EDDB",
  paper:    "#FBF6E6",
  paperHi:  "#FFFFFF",
  espresso: "#3A2C1A",
  blush:    "#E8B4B8",
  sage:     "#8FAF8F",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  rose:     "#D45E52",
  plum:     "#4A2A3A",
  pMenstrual:  "#8B2635",
};

// ─────────────────────────────────────────────────────────────────────────────
// Module-level singleton — survives any component unmount, so the global
// openLogger() function can trigger the UI from anywhere.
// ─────────────────────────────────────────────────────────────────────────────
let _state = { open: false, type: null };
const _subs = new Set();
function _notify() { for (const fn of _subs) fn(); }

/**
 * Programmatically open the Universal Logger. Pass a type id to skip the
 * type grid and go straight to that form. Valid types:
 *   habit · task · med · meal · event · ritual · hydration · note
 *   · checkin · symptom
 */
export function openLogger(type) {
  _state = { open: true, type: type || null };
  _notify();
}
export function closeLogger() {
  _state = { open: false, type: null };
  _notify();
}
/** External subscription to the logger singleton. Returns an unsubscribe fn. */
export function subscribeLoggerState(fn) {
  _subs.add(fn);
  return () => _subs.delete(fn);
}
/** Read the current logger singleton state. */
export function getLoggerState() {
  return _state;
}

// ─────────────────────────────────────────────────────────────────────────────
// Type catalogue + field configs
// ─────────────────────────────────────────────────────────────────────────────
export const TYPES = [
  { id: "habit",     label: "Habit",      sub: "Movement or recurring action", Icon: Footprints,    tone: C.sage },
  { id: "task",      label: "Task",       sub: "Work or personal to-do",       Icon: ListChecks,    tone: C.espresso },
  { id: "med",       label: "Medication", sub: "Med or supplement",            Icon: Pill,          tone: C.blush },
  { id: "meal",      label: "Meal",       sub: "Plan or log a meal",           Icon: Utensils,      tone: C.gold },
  { id: "event",     label: "Event",      sub: "Appointment or calendar",      Icon: CalendarClock, tone: C.goldDeep },
  { id: "ritual",    label: "Ritual",     sub: "Bundle for this phase",        Icon: Sparkles,      tone: C.muted },
  { id: "hydration", label: "Hydration",  sub: "Log a glass of water",         Icon: Droplets,      tone: "#60B4FA" },
  { id: "note",      label: "Note",       sub: "Quick journal entry",          Icon: StickyNote,    tone: C.espresso },
  { id: "checkin",   label: "Check-in",   sub: "Mood, energy, sleep",          Icon: Smile,         tone: C.rose },
  { id: "symptom",   label: "Symptom",    sub: "Log a body signal",            Icon: Stethoscope,   tone: C.pMenstrual },
];

const TYPE_CONFIG = {
  habit: {
    title: "New habit",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Morning walk" },
      { key: "time", label: "Time of day", type: "chips", options: ["Morning","Afternoon","Evening","Any"] },
      { key: "freq", label: "Frequency", type: "chips", options: ["Daily","Weekdays","Weekly","Phase-based"] },
      { key: "phases", label: "Phase affinity", type: "chips", multi: true,
        options: ["All phases","Menstrual","Follicular","Ovulatory","Luteal"] },
      { key: "reminder", label: "Reminder", type: "toggle+time" },
    ],
  },
  task: {
    title: "New task",
    fields: [
      { key: "name", label: "Task name", type: "text", required: true, placeholder: "What needs doing?" },
      { key: "list", label: "List", type: "chips",
        options: ["Work","Personal","Health","+ New list"] },
      { key: "due",  label: "Due", type: "datetime" },
      { key: "priority", label: "Priority", type: "chips", options: ["Low","Medium","High"] },
      { key: "notes", label: "Notes", type: "textarea", optional: true, placeholder: "Anything else…" },
    ],
  },
  med: {
    title: "New medication",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Vitamin D" },
      { key: "dose", label: "Dose", type: "text-unit", units: ["mg","mcg","ml","IU","drops"] },
      { key: "time", label: "Time", type: "time" },
      { key: "freq", label: "Frequency", type: "chips",
        options: ["Daily","Twice daily","Weekly","As needed","Phase-based"] },
      { key: "reminder", label: "Reminder", type: "toggle" },
      { key: "phaseSpec", label: "Phase-specific", type: "toggle", sub: "Only in certain phases" },
    ],
  },
  meal: {
    title: "Log a meal",
    fields: [
      { key: "raw_text", label: "What did you eat?", type: "textarea", required: true,
        placeholder: "Describe naturally…" },
      { key: "kind", label: "Meal", type: "chips",
        options: ["Morning", "Midday", "Evening", "Snack"] },
      { key: "portion_size", label: "Portion", type: "chips",
        options: ["Small", "Medium", "Large"] },
    ],
  },
  event: {
    title: "New event",
    fields: [
      { key: "name", label: "Event name", type: "text", required: true, placeholder: "What's the event?" },
      { key: "kind", label: "Type", type: "chips",
        options: ["Appointment","Social","Work","Self-care","Other"] },
      { key: "date", label: "Date", type: "date" },
      { key: "start",label: "Start time", type: "time" },
      { key: "dur",  label: "Duration", type: "chips",
        options: ["15m","30m","1h","90m","2h","All day"] },
      { key: "loc",  label: "Location", type: "text", optional: true, placeholder: "Where?" },
      { key: "notes",label: "Notes",    type: "textarea", optional: true },
    ],
  },
  ritual: {
    title: "New ritual",
    fields: [
      { key: "name", label: "Ritual name", type: "text", required: true, placeholder: "e.g. Sunday slow-down" },
      { key: "phases", label: "Phase", type: "chips", multi: true,
        options: ["All phases","Menstrual","Follicular","Ovulatory","Luteal"] },
      { key: "time", label: "Time of day", type: "chips",
        options: ["Morning","Afternoon","Evening","Any"] },
      { key: "dur",  label: "Duration", type: "chips",
        options: ["5m","10m","15m","20m","30m","45m"] },
      { key: "items", label: "Items", type: "list", placeholder: "Add a step or item…", max: 8 },
    ],
  },
  hydration: {
    title: "Log hydration",
    fields: [
      { key: "amount", label: "Amount", type: "stepper",
        options: ["1 glass (250ml)","2 glasses","500ml","1L"], default: "1 glass (250ml)" },
    ],
  },
  note: {
    title: "New note",
    fields: [
      { key: "text",  label: "Note", type: "textarea", required: true,
        placeholder: "What's on your mind?" },
      { key: "mood",  label: "Mood tag", type: "chips", optional: true,
        options: ["Reflective","Grateful","Anxious","Hopeful","Frustrated","Calm"] },
      { key: "priv",  label: "Privacy", type: "toggle",
        sub: "Keep this private from exports" },
    ],
  },
  checkin: {
    title: "Daily check-in",
    fields: [
      { key: "mood",   label: "Mood",   type: "face-scale" },
      { key: "energy", label: "Energy", type: "bar-scale", min: 1, max: 5 },
      { key: "sleep",  label: "Sleep last night", type: "number", unit: "hours", step: 0.5 },
      { key: "notes",  label: "Notes",  type: "textarea", optional: true },
    ],
  },
  symptom: {
    title: "Log a symptom",
    fields: [
      { key: "list", label: "Symptoms", type: "chip-grid", required: true, multi: true,
        options: ["Cramps","Bloating","Headache","Fatigue","Mood dip","Breast tenderness",
                  "Spotting","Brain fog","Insomnia","Skin changes","Hot flush","Night sweats",
                  "Joint pain","Nausea","Back pain","Other"] },
      { key: "sev",  label: "Severity", type: "slider", min: 1, max: 5,
        labels: ["Mild","","","","Severe"] },
      { key: "time", label: "Time", type: "time", defaultNow: true },
      { key: "notes",label: "Notes", type: "textarea", optional: true },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
// Render delegates to SmartLoggerV4 in production mode. The global
// openLogger()/closeLogger() singletons stay intact so the 50+ call sites
// across the codebase keep working — they now open the unified Smart Logger
// sheet instead of the old TYPE_GRID/DetailForm pair. Pass `hideFAB` on /Ideas
// since that page hosts its own dedicated demo of SmartLoggerV4 v4.
// ─────────────────────────────────────────────────────────────────────────────
import SmartLoggerV4 from "@/components/SmartLoggerV4";

export default function UniversalLogger({ hideFAB = false } = {}) {
  const [tick, setTick] = useState(0);
  const [plannerAddOpen, setPlannerAddOpen] = useState(false);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    _subs.add(fn);
    return () => _subs.delete(fn);
  }, []);
  const { open } = _state;

  if (hideFAB) return null;

  // /Ideas hosts its own demo of SmartLoggerV4 — render nothing globally.
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  if (path.startsWith("/Ideas")) return null;

  // /Planner needs BOTH the Smart Logger entry AND its own + for adding
  // PlannerItems (tasks/events). Render a dual FAB stack: smaller gold pen
  // button for the Smart Logger, larger espresso + for the legacy add sheet.
  const isPlanner = path.startsWith("/Planner");

  if (isPlanner) {
    return (
      <>
        {/* SmartLoggerV4 — sheet only (FAB hidden, dual-stack owns the entry) */}
        <SmartLoggerV4
          key={tick}
          mode="production"
          externalOpen={open}
          onCloseExternal={closeLogger}
          hideFAB
        />

        {/* Dual FAB stack — hide while either sheet is open so the user
            isn't fighting two layers. */}
        {!open && !plannerAddOpen && (
          <div style={dualFabStack}>
            <button
              onClick={() => openLogger()}
              aria-label="Open Smart Logger"
              title="Log today"
              style={dualFabSmartLogger}
            >
              <Pen size={20} strokeWidth={2.4} />
            </button>
            <button
              onClick={() => setPlannerAddOpen(true)}
              aria-label="Add to Planner"
              title="Add to Planner"
              style={dualFabPlannerAdd}
            >
              <Plus size={24} strokeWidth={2.6} />
            </button>
          </div>
        )}

        {/* Planner-native add flow — legacy LoggerSheet (TYPE_GRID +
            DetailForm) that writes through to PlannerItems/PersonalTasks
            via the existing entity-aware handleSave. */}
        {plannerAddOpen && (
          <LoggerSheet
            initialType={null}
            onClose={() => setPlannerAddOpen(false)}
          />
        )}
      </>
    );
  }

  // All other pages: single SmartLoggerV4 FAB.
  return (
    <SmartLoggerV4
      key={tick}
      mode="production"
      externalOpen={open}
      onCloseExternal={closeLogger}
    />
  );
}

// ─── Planner dual-FAB styles ───────────────────────────────────────────────
const dualFabStack = {
  position: "fixed",
  right: 18,
  bottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
  display: "flex", flexDirection: "column",
  gap: 12, alignItems: "center",
  zIndex: 998,
};
const dualFabSmartLogger = {
  width: 48, height: 48, borderRadius: "50%",
  background: `linear-gradient(145deg, ${C.gold}, ${C.goldDeep})`,
  color: C.cream,
  border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 6px 16px rgba(212,175,55,0.45), 0 0 0 3px rgba(244,237,219,0.85)",
  padding: 0,
};
const dualFabPlannerAdd = {
  width: 56, height: 56, borderRadius: "50%",
  background: C.espresso,
  color: "#fff",
  border: "none", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 8px 22px rgba(58,44,26,0.40), 0 0 0 3px rgba(244,237,219,0.85)",
  padding: 0,
};

function LoggerSheet({ initialType, onClose = closeLogger }) {
  const [pickedId, setPickedId] = useState(initialType);
  const picked = pickedId ? TYPES.find((t) => t.id === pickedId) : null;

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={sheet} onClick={(e) => e.stopPropagation()}>
        <div style={head}>
          {picked ? (
            <>
              <button onClick={() => setPickedId(null)} style={iconBtn} aria-label="Back">
                <ArrowLeft size={14} />
              </button>
              <span style={kicker}>ADD · {picked.label.toUpperCase()}</span>
            </>
          ) : (
            <>
              <span style={kicker}>QUICK ADD</span>
              <span />
            </>
          )}
          <button onClick={onClose} style={iconBtn} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {!picked && <TypeGrid onPick={(id) => setPickedId(id)} />}
        {picked  && <DetailForm type={picked} onCancel={onClose} onSaved={onClose} />}
      </div>
    </div>
  );
}

// ─── Voice → intent parse via base44 LLM integration ───────────────────────
// Same invocation pattern used by WeeklyInsightCard (Core.InvokeLLM). The
// model returns JSON-only; we parse it, show a confirmation card, and let the
// user Save or Edit. Save dispatches to the correct entity create; Edit
// resets the voice state so the user can fall through to the manual TypeGrid
// and use the standard DetailForm.
const VOICE_SYSTEM_PROMPT = `You are a health and wellness scheduler assistant. The user has spoken a natural language instruction. Extract structured intent from it.

Respond with JSON only — no markdown fences, no prose. Use this exact shape:
{
  "intent": "add_task" | "add_event" | "add_meal" | "log_water" | "log_symptom" | "add_habit" | "log_medication" | "unknown",
  "title": "string — the main item name or description",
  "time": "HH:MM or null — 24hr format if mentioned",
  "date": "today | tomorrow | YYYY-MM-DD or null",
  "meal_type": "breakfast | lunch | dinner | snack | null",
  "time_of_day": "morning | afternoon | evening | null",
  "amount": "number or null",
  "unit": "string or null",
  "notes": "string or null",
  "confidence": 0.0
}`;

const INTENT_LABELS = {
  add_task:       "Add task",
  add_event:      "Add event",
  add_meal:       "Log meal",
  log_water:      "Log water",
  log_symptom:    "Log symptom",
  add_habit:      "Add habit",
  log_medication: "Log medication",
  unknown:        "Not sure",
};

function _resolveDate(s) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  if (!s || s === "today") return todayStr;
  if (s === "tomorrow") {
    const t = new Date(today); t.setDate(t.getDate() + 1);
    return t.toISOString().split("T")[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return todayStr;
}

async function saveVoiceIntent(intent) {
  const todayISO = new Date().toISOString().split("T")[0];
  const nowISO   = new Date().toISOString();
  const me = await base44.entities.User.me().catch(() => null);
  const user_id = me?.id;
  if (!user_id) return { ok: false, reason: "auth" };
  const date = _resolveDate(intent.date);
  const title = (intent.title || "").trim();
  if (!title && intent.intent !== "log_water") return { ok: false, reason: "empty" };

  try {
    switch (intent.intent) {
      case "add_task":
        await base44.entities.PersonalTasks.create({
          user_id, date, title, category: "personal",
          time_of_day: intent.time_of_day || null,
          completed: false, notes: intent.notes || "",
          created_at: nowISO, updated_at: nowISO,
        });
        break;
      case "add_event":
        await base44.entities.PlannerItems.create({
          user_id, date_str: date, title,
          time: intent.time || null,
          item_type: "event",
          created_at: nowISO, updated_at: nowISO,
        }).catch(async () => {
          // Fallback: PersonalTasks if PlannerItems schema rejects.
          await base44.entities.PersonalTasks.create({
            user_id, date, title, category: "personal",
            completed: false, notes: intent.notes || "",
            created_at: nowISO, updated_at: nowISO,
          });
        });
        break;
      case "add_meal": {
        const mealTypeMap = { breakfast: "breakfast", lunch: "lunch", dinner: "dinner", snack: "snack" };
        const meal_type = mealTypeMap[intent.meal_type] || inferMealTypeFromTime();
        const log = await base44.entities.MealLog.create({
          user_id, day_key: date, raw_text: title,
          meal_type, portion_size: "medium",
          created_at: nowISO, updated_at: nowISO,
        });
        // Fire-and-forget analyzeMeal (same pattern as Nourish card).
        base44.functions.invoke("analyzeMeal", { raw_text: title, meal_log_id: log?.id }).catch(() => {});
        break;
      }
      case "log_water": {
        const amount_ml = intent.amount ? Math.round(Number(intent.amount)) : 250;
        await base44.entities.HydrationLog.create({
          user_id, day_key: date, amount_ml,
          logged_at: nowISO, created_at: nowISO, updated_at: nowISO,
        });
        break;
      }
      case "log_symptom":
        await base44.entities.SymptomLogs.create({
          user_id, date, symptom_name: title,
          severity: "mild", notes: intent.notes || "",
          created_at: nowISO, updated_at: nowISO,
        });
        break;
      case "add_habit":
        await base44.entities.HabitLogs.create({
          user_id, date,
          habit_type: title, habit_name: title,
          habit_category: "other",
          completed: false, is_completed: false,
          time_of_day: intent.time_of_day || null,
          created_at: nowISO, updated_at: nowISO,
        });
        break;
      case "log_medication":
        await base44.entities.MedicationLogs.create({
          user_id, date, item_name: title,
          taken: true, notes: intent.notes || "",
          created_at: nowISO, updated_at: nowISO,
        });
        break;
      default:
        return { ok: false, reason: "unknown" };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "create_failed" };
  }
}

async function parseVoiceIntent(transcript) {
  const prompt = `${VOICE_SYSTEM_PROMPT}\n\nUser said: """${transcript}"""\n\nRespond with JSON only.`;
  const result = await base44.integrations.Core
    .InvokeLLM({ prompt, model: "claude_sonnet_4_6" })
    .catch(() => null);
  const text = typeof result === "string"
    ? result
    : (result?.text || result?.content || (typeof result === "object" ? JSON.stringify(result) : String(result || "")));
  if (!text) return null;
  // Tolerate fenced code blocks.
  const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  // Find the first JSON object.
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

// ─── Type grid (initial state) ──────────────────────────────────────────────
export function TypeGrid({ onPick }) {
  // States: idle → listening → processing → confirm → saving → saved → idle
  // Or: idle → listening → error.
  const [voiceState, setVoiceState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim]       = useState("");
  const [intent, setIntent]         = useState(null);
  const recRef = useRef(null);

  function startVoice() {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setVoiceState("error"); setTranscript("Voice isn't available in this browser."); return; }
    const rec = new SR();
    rec.lang = "en-GB";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      if (interimText) setInterim(interimText);
      if (finalText) setTranscript(finalText);
    };
    rec.onerror = () => {
      setVoiceState("error");
      setTranscript("Couldn't hear that — try again.");
    };
    rec.onend = async () => {
      const text = (finalText || "").trim();
      if (!text) {
        setVoiceState("error");
        setTranscript("Didn't catch anything — try again.");
        return;
      }
      setVoiceState("processing");
      setInterim("");
      const parsed = await parseVoiceIntent(text);
      if (!parsed || parsed.intent === "unknown") {
        setIntent(parsed || null);
        setVoiceState("error");
        setTranscript("I didn't catch that — try again or pick a type below.");
        return;
      }
      setIntent(parsed);
      setVoiceState("confirm");
    };
    recRef.current = rec;
    setVoiceState("listening");
    setTranscript("");
    setInterim("");
    setIntent(null);
    try { rec.start(); } catch { /* already running */ }
  }

  function stopVoice() {
    try { recRef.current?.stop(); } catch { /* noop */ }
  }

  async function confirmSave() {
    if (!intent) return;
    setVoiceState("saving");
    const res = await saveVoiceIntent(intent);
    if (res.ok) {
      setVoiceState("saved");
      // Auto-reset after a short success flash.
      setTimeout(() => {
        setVoiceState("idle"); setTranscript(""); setIntent(null);
      }, 1400);
    } else {
      setVoiceState("error");
      setTranscript(res.reason === "auth" ? "Sign in to save." : "Couldn't save — try again or use the form below.");
    }
  }

  function editIntent() {
    // Drop to manual flow with the best-guess type id pre-selected so the user
    // lands in DetailForm immediately rather than the picker.
    const TYPE_FROM_INTENT = {
      add_task:       "task",
      add_event:      "event",
      add_meal:       "meal",
      log_water:      "hydration",
      log_symptom:    "symptom",
      add_habit:      "habit",
      log_medication: "med",
    };
    const id = TYPE_FROM_INTENT[intent?.intent];
    setVoiceState("idle"); setTranscript(""); setIntent(null);
    if (id) onPick(id);
  }

  const summary = intent ? (() => {
    const parts = [INTENT_LABELS[intent.intent] || "Item", intent.title].filter(Boolean);
    let s = parts.join(": ");
    if (intent.time)     s += ` at ${intent.time}`;
    if (intent.amount && intent.unit) s += ` (${intent.amount} ${intent.unit})`;
    if (intent.date && intent.date !== "today") s += ` · ${intent.date}`;
    return s;
  })() : "";

  return (
    <div style={addGrid}>
      <div style={voicePane}>
        <button
          onClick={voiceState === "listening" ? stopVoice : startVoice}
          disabled={voiceState === "processing" || voiceState === "saving"}
          style={{
            ...voiceMicWrap,
            background: voiceState === "listening" ? `${C.rose}33`
                      : voiceState === "saved"     ? `${C.sage}33`
                      : `${C.gold}1F`,
            border: `1.5px solid ${voiceState === "listening" ? C.rose : voiceState === "saved" ? C.sage : C.gold}`,
            animation: voiceState === "listening" ? "femwellPulse 1.4s ease-in-out infinite" : "none",
            cursor: (voiceState === "processing" || voiceState === "saving") ? "wait" : "pointer",
          }}>
          {voiceState === "saved" ? (
            <Check size={32} style={{ color: C.sage }} />
          ) : (
            <Mic size={32} style={{
              color: voiceState === "listening" ? C.rose : C.goldDeep,
            }} />
          )}
        </button>
        <style>{`@keyframes femwellPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(212,94,82,0.50); } 50% { box-shadow: 0 0 0 16px rgba(212,94,82,0); } }`}</style>
        <h3 style={voiceTitle}>
          {voiceState === "saving" ? "Saving…"
            : voiceState === "saved" ? "Saved"
            : voiceState === "confirm" ? "Did you mean…"
            : "Voice schedule"}
        </h3>
        <p style={voiceSub}>
          {voiceState === "idle"       && "Tap and tell me what to add"}
          {voiceState === "listening"  && (interim ? `"${interim}…"` : "Listening…")}
          {voiceState === "processing" && (transcript ? `Understanding "${transcript}"…` : "Understanding…")}
          {voiceState === "saving"     && ""}
          {voiceState === "saved"      && ""}
          {voiceState === "error"      && transcript}
        </p>

        {voiceState === "confirm" && intent && (
          <div style={{
            width: "100%", marginTop: 8,
            background: C.paperHi, border: `1px solid ${C.gold}55`,
            borderRadius: 12, padding: "10px 12px", textAlign: "left",
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: C.goldDeep, marginBottom: 4,
            }}>{INTENT_LABELS[intent.intent] || "Item"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.espresso, lineHeight: 1.3 }}>
              {summary}
            </div>
            {transcript && (
              <div style={{ fontSize: 10, color: C.muted, marginTop: 6, fontStyle: "italic" }}>
                "{transcript}"
              </div>
            )}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button onClick={editIntent} style={{
                flex: 1, padding: "8px 10px", borderRadius: 9999,
                background: "transparent", color: C.espresso,
                border: `1px solid rgba(58,44,26,0.18)`,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                cursor: "pointer",
              }}>Edit</button>
              <button onClick={confirmSave} style={{
                flex: 1, padding: "8px 10px", borderRadius: 9999,
                background: C.espresso, color: C.cream,
                border: `1px solid ${C.espresso}`,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                cursor: "pointer",
              }}>Save</button>
            </div>
          </div>
        )}
      </div>
      <div style={manualPane}>
        <span style={kicker}>OR PICK A TYPE</span>
        <div style={manualGrid}>
          {TYPES.map((t) => (
            <button key={t.id} onClick={() => onPick(t.id)} style={manualCard}>
              <span style={{ ...iconChip, background: `${t.tone}1F`, color: t.tone }}>
                <t.Icon size={14} />
              </span>
              <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                <div style={manualLabel}>{t.label}</div>
                <div style={manualSub}>{t.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Detail form (per-type fields) ──────────────────────────────────────────
export function DetailForm({ type, onCancel, onSaved }) {
  const config = TYPE_CONFIG[type.id];
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  function set(k, v) { setValues((p) => ({ ...p, [k]: v })); }

  // ── Real entity wiring ────────────────────────────────────────────────────
  // Maps each TYPE_CONFIG id to a base44 entity create call with the correct
  // schema fields (verified against /base44/entities/*.jsonc). Unknown fields
  // are silently dropped by base44 so we keep payloads tight.
  async function handleSave() {
    if (saving) return;
    setSaving(true);
    const todayISO = new Date().toISOString().split("T")[0];
    const nowISO   = new Date().toISOString();
    try {
      const me = await base44.entities.User.me().catch(() => null);
      const user_id = me?.id;
      if (!user_id) { onSaved(); return; }

      switch (type.id) {
        case "task": {
          const cat = (values.list || "Personal").toLowerCase();
          const category = ["work", "personal", "wellness", "social"].includes(cat) ? cat
            : (cat === "health" ? "wellness" : "personal");
          await base44.entities.PersonalTasks.create({
            user_id, date: todayISO, title: values.name || "Task",
            category, completed: false, notes: values.notes || "",
            created_at: nowISO, updated_at: nowISO,
          });
          break;
        }
        case "habit": {
          const name = values.name || "Habit";
          await base44.entities.HabitLogs.create({
            user_id, date: todayISO,
            habit_type: name, habit_name: name,
            habit_category: "other",
            completed: false, is_completed: false,
            created_at: nowISO, updated_at: nowISO,
          });
          break;
        }
        case "med": {
          await base44.entities.MedicationLogs.create({
            user_id, date: todayISO, item_name: values.name || "Medication",
            dose: values.dose ? String(values.dose) : "", taken: false,
            notes: "", created_at: nowISO, updated_at: nowISO,
          });
          break;
        }
        case "meal": {
          // Match the Nourish card pipeline: immediate write + background
          // analyzeMeal + ai_analysis update + NutritionInsight side row.
          const LABEL_TO_ID = { Morning: "breakfast", Midday: "lunch", Evening: "dinner", Snack: "snack" };
          const meal_type = LABEL_TO_ID[values.kind] || inferMealTypeFromTime();
          const portion_size = (values.portion_size || "Medium").toLowerCase();
          const raw_text = (values.raw_text || "").trim();
          if (!raw_text) break;

          // Resolve cycle phase from UserProfile (same inline derivation).
          let cyclePhase = null;
          try {
            const profiles = await base44.entities.UserProfile
              .filter({ user_id }).catch(() => []);
            const p = profiles?.[0];
            if (p?.last_period_start_date) {
              const cycleLen = p.cycle_avg_length || 28;
              const periodLen = p.period_length || 5;
              const daysSince = Math.floor((Date.now() - new Date(p.last_period_start_date).getTime()) / 86_400_000);
              const dayOfCycle = (daysSince % cycleLen) + 1;
              cyclePhase = dayOfCycle <= periodLen ? "menstrual"
                : dayOfCycle <= Math.round(cycleLen * 0.4)  ? "follicular"
                : dayOfCycle <= Math.round(cycleLen * 0.55) ? "ovulatory"
                : "luteal";
            }
          } catch { /* silent */ }

          // 1. Immediate write.
          const log = await base44.entities.MealLog.create({
            user_id, logged_at: nowISO, day_key: todayISO,
            meal_type, method: "text",
            raw_text, portion_size,
            cycle_phase_at_log: cyclePhase,
          });

          // 2. Background analyzeMeal — never blocks close.
          (async () => {
            try {
              let excluded = [];
              try {
                const recent = await base44.entities.MealLog
                  .filter({ user_id }, "-created_date", 7);
                excluded = (recent || [])
                  .flatMap(m => {
                    const a = readAiAnalysis(m);
                    const list = [...(a?.smart_swaps || [])];
                    if (a?.insight?.smart_swap) list.push(a.insight.smart_swap);
                    return list;
                  })
                  .filter(Boolean).map(s => String(s).trim().toLowerCase());
              } catch { /* ignore */ }

              const phasePromptAppend = cyclePhase
                ? ` The user is currently in their ${cyclePhase} phase.` : "";
              const shortInput = raw_text.length <= 8;
              const response = await base44.functions.invoke("analyzeMeal", {
                raw_text,
                wellness_goal: "general wellness",
                prompt_append: phasePromptAppend,
                short_input: shortInput,
                meal_log_id: log.id,
                cycle_phase: cyclePhase,
                excluded_swaps: excluded,
              });
              const res = response?.data || response;
              if (!res || typeof res !== "object") return;
              if (!(res.summary || res.nutritional_summary || res.items)) return;

              const structured = { ...res, summary: res.summary || res.nutritional_summary };
              delete structured.nutritional_summary;

              // Zero-fallback macro recompute.
              const s = structured.summary || {};
              const zeroish = !(s.calories || s.protein_g || s.carbs_g || s.fat_g);
              if (zeroish && (structured.items || []).length > 0) {
                const summed = structured.items.reduce((acc, it) => ({
                  calories:  acc.calories  + (Number(it.calories)  || 0),
                  protein_g: acc.protein_g + (Number(it.protein_g) || 0),
                  carbs_g:   acc.carbs_g   + (Number(it.carbs_g)   || 0),
                  fat_g:     acc.fat_g     + (Number(it.fat_g)     || 0),
                  fiber_g:   acc.fiber_g   + (Number(it.fiber_g)   || 0),
                }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });
                structured.summary = {
                  calories:  Math.round(summed.calories),
                  protein_g: Math.round(summed.protein_g),
                  carbs_g:   Math.round(summed.carbs_g),
                  fat_g:     Math.round(summed.fat_g),
                  fiber_g:   Math.round(summed.fiber_g),
                };
              }

              if (Array.isArray(structured.smart_swaps)) {
                structured.smart_swaps = structured.smart_swaps.filter(
                  sw => sw && !excluded.includes(String(sw).trim().toLowerCase())
                );
              }
              if (structured.insight?.smart_swap
                  && excluded.includes(String(structured.insight.smart_swap).trim().toLowerCase())) {
                structured.insight = { ...structured.insight, smart_swap: null };
              }

              let overall = null;
              if (typeof structured.meal_score === "number") {
                overall = structured.meal_score <= 5
                  ? Math.min(10, Math.round(structured.meal_score * 2))
                  : Math.round(structured.meal_score);
              } else if (structured.meal_score && typeof structured.meal_score === "object") {
                const vals = ["protein", "veg_fiber", "balance"]
                  .map(k => Number(structured.meal_score[k]))
                  .filter(Number.isFinite);
                if (vals.length) {
                  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                  overall = Math.min(10, Math.max(1, Math.round(avg * 2)));
                }
              }

              const updatePayload = { ai_analysis: structured };
              if (overall != null) updatePayload.meal_score = overall;
              await base44.entities.MealLog.update(log.id, updatePayload).catch(() => {});

              if (structured.insight) {
                const { headline, wellness_impact, action_items, smart_swap, confidence, tone_safety_note } = structured.insight;
                await base44.entities.NutritionInsight.create({
                  user_id, meal_log_id: log.id, day_key: todayISO,
                  meal_description: raw_text, wellness_goal: "general wellness",
                  headline, wellness_impact, action_items, smart_swap,
                  confidence: confidence || "medium", tone_safety_note, user_feedback: "none",
                }).catch(() => {});
              }
            } catch { /* silent */ }
          })();
          break;
        }
        case "event": {
          const time = values.start || "09:00";
          await base44.entities.PlannerItems.create({
            user_id, date: values.date || todayISO,
            time, title: values.name || "Event",
            category: "personal", repeat: "once",
            notes: [values.loc, values.notes].filter(Boolean).join(" · "),
            is_completed: false, created_at: nowISO, updated_at: nowISO,
          });
          break;
        }
        case "hydration": {
          const opt = values.amount || "1 glass (250ml)";
          const m = String(opt).match(/(\d+)\s*ml/i) || String(opt).match(/(\d+)\s*L/i);
          let amount_ml = 250;
          if (m) amount_ml = /L/i.test(opt) ? Number(m[1]) * 1000 : Number(m[1]);
          else if (/^2\b/.test(opt)) amount_ml = 500;
          await base44.entities.HydrationLog.create({
            user_id, day_key: todayISO, amount_ml,
            logged_at: nowISO, source: "manual",
          });
          break;
        }
        case "note": {
          await base44.entities.JournalEntries.create({
            user_id, session_date: todayISO,
            text: values.text || "",
            tags: values.mood ? [String(values.mood).toLowerCase()] : ["note"],
            prompt: "Quick note",
          });
          break;
        }
        case "checkin": {
          // Upsert today's DailyCheckins row.
          const existing = await base44.entities.DailyCheckins.filter(
            { user_id, date: todayISO }, "-updated_at", 1,
          ).catch(() => []);
          const row = (existing || [])[0];
          const patch = { updated_at: nowISO };
          if (values.mood   != null) patch.mood   = Number(values.mood);
          if (values.energy != null) patch.energy = Number(values.energy);
          if (values.sleep  != null) patch.sleep_hours = Number(values.sleep);
          if (values.notes) patch.notes = values.notes;
          if (row?.id) {
            await base44.entities.DailyCheckins.update(row.id, patch);
          } else {
            await base44.entities.DailyCheckins.create({
              user_id, date: todayISO, ...patch,
            });
          }
          break;
        }
        case "symptom": {
          const list = Array.isArray(values.list) ? values.list : (values.list ? [values.list] : []);
          const sev = Number(values.sev || 3);
          // Create one SymptomLogs row per selected symptom (the schema is
          // single-symptom per row).
          for (const sym of list) {
            try {
              await base44.entities.SymptomLogs.create({
                user_id, date: todayISO,
                symptom_type: String(sym),
                severity: sev,
                notes: values.notes || "",
                created_at: nowISO, updated_at: nowISO,
              });
            } catch { /* silent per row */ }
          }
          break;
        }
        case "ritual": {
          // Build a HabitLogs row per item in the ritual list, tagged by
          // the ritual's chosen time of day. Uses the canonical shape:
          // habit_type + habit_name mirror, completed + is_completed mirror.
          const items = Array.isArray(values.items) ? values.items : [];
          const time = (values.time || "").toLowerCase();
          const time_of_day = time === "morning" || time === "evening" || time === "afternoon" ? time : undefined;
          for (const step of items) {
            try {
              const name = String(step);
              const payload = {
                user_id, date: todayISO,
                habit_type: name, habit_name: name,
                habit_category: "mindfulness",
                completed: false, is_completed: false,
                created_at: nowISO, updated_at: nowISO,
              };
              if (time_of_day) payload.time_of_day = time_of_day;
              await base44.entities.HabitLogs.create(payload);
            } catch { /* silent */ }
          }
          break;
        }
        default:
          // Unknown type — close silently rather than crash.
          break;
      }
    } catch {
      // Network / auth error — swallow so the UX still closes.
    } finally {
      setSaving(false);
      onSaved();
    }
  }

  const valid = useMemo(() => {
    return (config.fields || []).every((f) => {
      if (!f.required) return true;
      const v = values[f.key];
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v.trim().length > 0;
      return v != null && v !== "";
    });
  }, [config, values]);

  // Meal type gets a special render path that mirrors the NourishCard meal
  // logger pixel-for-pixel: textarea + meal-type pill row + portion pill row +
  // full-width espresso "Log meal" button. The generic Field renderer can't
  // match Nourish's exact chip styling (gold-tint active state for portion,
  // espresso-fill for meal type, button-style instead of cancel/save row).
  if (type.id === "meal") {
    const KINDS = ["Morning", "Midday", "Evening", "Snack"];
    const PORTIONS = ["Small", "Medium", "Large"];
    const rawText = (values.raw_text || "").trim();
    const canSave = rawText.length > 0 && !saving;
    return (
      <div style={formShell}>
        <div style={formTypeRow}>
          <span style={{ ...iconChip, background: `${type.tone}1F`, color: type.tone, width: 36, height: 36 }}>
            <type.Icon size={16} />
          </span>
          <h2 style={formTitle}>Log a meal</h2>
        </div>

        <textarea
          value={values.raw_text || ""}
          onChange={(e) => set("raw_text", e.target.value)}
          placeholder="What did you eat? Describe naturally…"
          rows={2}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "8px 12px", borderRadius: 10, minHeight: 56,
            border: `1.5px solid rgba(58,44,26,0.15)`, background: C.paperHi,
            fontSize: 13, color: C.espresso, outline: "none",
            resize: "vertical", fontFamily: "inherit",
          }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {KINDS.map((k) => {
            const on = (values.kind || "") === k;
            return (
              <button key={k} onClick={() => set("kind", k)} style={{
                display: "inline-flex", alignItems: "center",
                padding: "6px 12px", borderRadius: 9999,
                border: `1px solid ${on ? C.espresso : "rgba(58,44,26,0.15)"}`,
                background: on ? C.espresso : C.paperHi,
                color: on ? C.cream : C.muted,
                fontFamily: "'Inter', sans-serif",
                fontSize: 11.5, fontWeight: 600, cursor: "pointer",
              }}>{k}</button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {PORTIONS.map((p) => {
            const on = (values.portion_size || "Medium") === p;
            return (
              <button key={p} onClick={() => set("portion_size", p)} style={{
                flex: 1, padding: "6px 10px", borderRadius: 14, minHeight: 32,
                border: `1.5px solid ${on ? C.gold : "rgba(58,44,26,0.15)"}`,
                background: on ? `${C.gold}22` : C.paperHi,
                color: C.espresso, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>{p}</button>
            );
          })}
        </div>

        <button onClick={handleSave} disabled={!canSave} style={{
          width: "100%", padding: "10px 18px", borderRadius: 10, border: "none",
          background: canSave ? C.espresso : "rgba(58,44,26,0.20)",
          color: C.cream, fontWeight: 700, fontSize: 13,
          cursor: canSave ? "pointer" : "not-allowed",
          minHeight: 40,
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {saving ? "Analysing…" : "Log meal"}
        </button>
      </div>
    );
  }

  return (
    <div style={formShell}>
      <div style={formTypeRow}>
        <span style={{ ...iconChip, background: `${type.tone}1F`, color: type.tone, width: 36, height: 36 }}>
          <type.Icon size={16} />
        </span>
        <h2 style={formTitle}>{config.title}</h2>
      </div>
      <div style={fieldList}>
        {config.fields.map((f) => (
          <Field key={f.key} field={f} value={values[f.key]} onChange={(v) => set(f.key, v)} />
        ))}
      </div>
      <div style={formFootRow}>
        <button onClick={onCancel} style={cancelBtn}>Cancel</button>
        <button onClick={handleSave} disabled={!valid} style={{
          ...saveBtn,
          opacity: valid ? 1 : 0.4,
          cursor: valid ? "pointer" : "not-allowed",
        }}>Save</button>
      </div>
    </div>
  );
}

// ─── Field renderers ────────────────────────────────────────────────────────
function Field({ field, value, onChange }) {
  return (
    <div style={fieldWrap}>
      <span style={fieldLabel}>
        {field.label}
        {field.optional && <span style={fieldOptional}> · optional</span>}
        {field.required && <span style={fieldRequired}> *</span>}
      </span>
      {field.sub && <span style={fieldSub}>{field.sub}</span>}
      {renderField(field, value, onChange)}
    </div>
  );
}

function renderField(field, value, onChange) {
  switch (field.type) {
    case "text":
      return (
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""} style={inputStyle} />
      );
    case "textarea":
      return (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      );
    case "number":
      return (
        <div style={inputUnitRow}>
          <input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value)}
            placeholder="0" step={field.step || 1} style={inputStyle} />
          {field.unit && <span style={inputUnit}>{field.unit}</span>}
        </div>
      );
    case "text-unit": {
      const v = value || { val: "", unit: field.units?.[0] || "" };
      return (
        <div style={inputUnitRow}>
          <input type="text" value={v.val} onChange={(e) => onChange({ ...v, val: e.target.value })}
            placeholder="Dose" style={{ ...inputStyle, flex: 2 }} />
          <select value={v.unit} onChange={(e) => onChange({ ...v, unit: e.target.value })}
            style={{ ...inputStyle, flex: 1 }}>
            {(field.units || []).map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      );
    }
    case "chips": {
      const multi = !!field.multi;
      const current = multi ? (value || []) : value;
      function toggle(opt) {
        if (multi) {
          const set = new Set(current);
          if (set.has(opt)) set.delete(opt); else set.add(opt);
          onChange(Array.from(set));
        } else {
          onChange(current === opt ? null : opt);
        }
      }
      return (
        <div style={chipRow}>
          {field.options.map((opt) => {
            const on = multi ? current.includes(opt) : current === opt;
            return (
              <button key={opt} onClick={() => toggle(opt)} style={{
                ...chip,
                background: on ? C.espresso : C.paperHi,
                color: on ? C.cream : C.muted,
                borderColor: on ? C.espresso : "rgba(58,44,26,0.15)",
              }}>{opt}</button>
            );
          })}
        </div>
      );
    }
    case "chip-grid":
      // Same logic as chips but laid out in a denser wrap.
      return renderField({ ...field, type: "chips", multi: true }, value, onChange);
    case "date":
      return <input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} style={inputStyle} />;
    case "time":
      return <input type="time" value={value || ""} onChange={(e) => onChange(e.target.value)} style={inputStyle} />;
    case "datetime":
      return <input type="datetime-local" value={value || ""} onChange={(e) => onChange(e.target.value)} style={inputStyle} />;
    case "toggle":
      return (
        <label style={toggleRow}>
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)}
            style={{ accentColor: C.sage }} />
          <span style={toggleText}>{value ? "On" : "Off"}</span>
        </label>
      );
    case "toggle+time": {
      const v = value || { on: false, time: "" };
      return (
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ ...toggleRow, flex: 1 }}>
            <input type="checkbox" checked={!!v.on} onChange={(e) => onChange({ ...v, on: e.target.checked })}
              style={{ accentColor: C.sage }} />
            <span style={toggleText}>{v.on ? "On" : "Off"}</span>
          </label>
          {v.on && (
            <input type="time" value={v.time} onChange={(e) => onChange({ ...v, time: e.target.value })}
              style={{ ...inputStyle, flex: 1 }} />
          )}
        </div>
      );
    }
    case "stepper": {
      const opts = field.options || [];
      const idx = opts.indexOf(value || field.default || opts[0]);
      return (
        <div style={stepperRow}>
          <button onClick={() => onChange(opts[Math.max(0, idx - 1)])} style={stepBtn}>−</button>
          <span style={stepValue}>{opts[Math.max(0, idx)] || opts[0]}</span>
          <button onClick={() => onChange(opts[Math.min(opts.length - 1, idx + 1)])} style={stepBtn}>+</button>
        </div>
      );
    }
    case "face-scale": {
      const faces = [
        { Icon: Frown,  tone: C.rose,   label: "Low" },
        { Icon: Frown,  tone: C.blush,  label: "Off" },
        { Icon: Meh,    tone: C.muted,  label: "OK" },
        { Icon: Smile,  tone: C.sage,   label: "Good" },
        { Icon: Smile,  tone: C.gold,   label: "Buoyant" },
      ];
      return (
        <div style={faceRow}>
          {faces.map((f, i) => (
            <button key={i} onClick={() => onChange(i + 1)} style={{
              ...faceBtn,
              background: value === (i + 1) ? `${f.tone}33` : "transparent",
              borderColor: value === (i + 1) ? f.tone : "rgba(58,44,26,0.10)",
            }}>
              <f.Icon size={22} style={{ color: f.tone }} fill={value === (i + 1) ? `${f.tone}40` : "none"} />
              <span style={faceLabel}>{f.label}</span>
            </button>
          ))}
        </div>
      );
    }
    case "bar-scale": {
      const min = field.min || 1, max = field.max || 5;
      return (
        <div style={barRow}>
          {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
            <button key={n} onClick={() => onChange(n)} style={{
              ...barBtn,
              background: n <= (value || 0) ? C.gold : "rgba(58,44,26,0.10)",
              height: 10 + n * 4,
            }} aria-label={`${n} of ${max}`} />
          ))}
          {value && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: C.espresso }}>{value}/{max}</span>}
        </div>
      );
    }
    case "slider": {
      const min = field.min || 1, max = field.max || 5;
      const labels = field.labels || [];
      return (
        <div>
          <input type="range" min={min} max={max} value={value || min}
            onChange={(e) => onChange(Number(e.target.value))} style={sliderStyle} />
          <div style={sliderLabels}>
            {Array.from({ length: max - min + 1 }, (_, i) => (
              <span key={i} style={{
                fontSize: 9, color: C.muted, fontWeight: (i + min) === value ? 700 : 500,
              }}>{labels[i] || (i + min)}</span>
            ))}
          </div>
        </div>
      );
    }
    case "list": {
      const items = value || [""];
      function setItem(i, v) {
        const next = items.slice();
        next[i] = v;
        onChange(next);
      }
      function addItem() {
        if (items.length >= (field.max || 8)) return;
        onChange([...items, ""]);
      }
      function removeItem(i) {
        if (items.length <= 1) return;
        onChange(items.filter((_, j) => j !== i));
      }
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((it, i) => (
            <div key={i} style={listRow}>
              <input type="text" value={it} onChange={(e) => setItem(i, e.target.value)}
                placeholder={field.placeholder || ""} style={{ ...inputStyle, flex: 1 }} />
              {items.length > 1 && (
                <button onClick={() => removeItem(i)} style={iconBtnSmall} aria-label="Remove"><X size={12} /></button>
              )}
            </div>
          ))}
          {items.length < (field.max || 8) && (
            <button onClick={addItem} style={addListBtn}>
              <Plus size={11} /> Add item
            </button>
          )}
        </div>
      );
    }
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const fabStyle = {
  position: "fixed", right: 20,
  bottom: "calc(90px + env(safe-area-inset-bottom, 0px))",
  width: 56, height: 56, borderRadius: 9999,
  background: C.gold, color: C.cream,
  border: "none", cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxShadow: "0 4px 16px rgba(212,175,55,0.40)",
  zIndex: 9000,
  fontFamily: "'Inter', sans-serif",
};
const backdrop = {
  position: "fixed", inset: 0, zIndex: 9500,
  background: "rgba(58,44,26,0.50)",
  display: "flex", alignItems: "flex-end", justifyContent: "center",
};
const sheet = {
  width: "100%", maxWidth: 760,
  background: C.cream,
  borderRadius: "22px 22px 0 0",
  padding: "16px 18px max(22px, env(safe-area-inset-bottom))",
  maxHeight: "90vh",
  overflowY: "auto",
  fontFamily: "'Inter', system-ui, sans-serif",
  boxShadow: "0 -8px 32px rgba(58,44,26,0.20)",
};
const head = {
  display: "grid", gridTemplateColumns: "auto 1fr auto",
  alignItems: "center", gap: 8, marginBottom: 12,
};
const iconBtn = {
  width: 28, height: 28, borderRadius: 9999,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.12)",
  color: C.muted,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0,
};
const iconBtnSmall = {
  width: 26, height: 26, borderRadius: 9999,
  background: "transparent", border: "1px solid rgba(58,44,26,0.15)",
  color: C.muted,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", padding: 0, flexShrink: 0,
};
const kicker = {
  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, fontWeight: 700,
};

// Type grid
const addGrid = {
  display: "grid", gridTemplateColumns: "1fr 1.2fr",
  gap: 14, alignItems: "start",
};
const voicePane = {
  display: "flex", flexDirection: "column", alignItems: "center",
  padding: 16, borderRadius: 14,
  background: C.paperHi, border: `1px solid ${C.gold}33`,
  textAlign: "center", gap: 6,
};
const voiceMicWrap = {
  width: 84, height: 84, borderRadius: 9999,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};
const voiceTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 17, fontWeight: 500, color: C.espresso, margin: "8px 0 0",
};
const voiceSub = { fontSize: 12, color: C.muted, margin: "4px 0 0" };
const manualPane = { display: "flex", flexDirection: "column", gap: 8 };
const manualGrid = {
  display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
  gap: 6, marginTop: 4,
};
const manualCard = {
  display: "flex", alignItems: "center", gap: 8,
  padding: 10, borderRadius: 12,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.10)",
  cursor: "pointer", fontFamily: "inherit",
};
const iconChip = {
  width: 28, height: 28, borderRadius: 9,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};
const manualLabel = { fontSize: 12.5, fontWeight: 700, color: C.espresso, lineHeight: 1.1 };
const manualSub = { fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.3 };

// Detail form
const formShell = { display: "flex", flexDirection: "column", gap: 14 };
const formTypeRow = { display: "flex", alignItems: "center", gap: 10 };
const formTitle = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: 24, fontWeight: 500, color: C.espresso,
  margin: 0, letterSpacing: "-0.01em", lineHeight: 1.15,
};
const fieldList = { display: "flex", flexDirection: "column", gap: 12 };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5 };
const fieldLabel = {
  fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
  color: C.muted, fontWeight: 700,
};
const fieldOptional = { fontStyle: "italic", textTransform: "none", letterSpacing: "0.02em", color: C.muted };
const fieldRequired = { color: C.rose };
const fieldSub = { fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: -2 };
const inputStyle = {
  width: "100%", padding: "10px 12px",
  borderRadius: 10, background: C.paperHi,
  border: "1px solid rgba(58,44,26,0.15)",
  fontSize: 14, color: C.espresso, outline: "none",
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
};
const inputUnitRow = { display: "flex", gap: 8, alignItems: "center" };
const inputUnit = {
  fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.04em",
};
const chipRow = { display: "flex", flexWrap: "wrap", gap: 5 };
const chip = {
  display: "inline-flex", alignItems: "center",
  padding: "6px 12px", borderRadius: 9999,
  border: "1px solid",
  fontFamily: "'Inter', sans-serif",
  fontSize: 11.5, fontWeight: 600, cursor: "pointer",
};
const toggleRow = {
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "10px 12px", borderRadius: 10,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.15)",
  cursor: "pointer", width: "fit-content",
};
const toggleText = { fontSize: 12, fontWeight: 700, color: C.espresso };
const stepperRow = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "8px 12px", borderRadius: 10,
  background: C.paperHi, border: "1px solid rgba(58,44,26,0.15)",
};
const stepBtn = {
  width: 32, height: 32, borderRadius: 9999,
  background: C.cream, border: "1px solid rgba(58,44,26,0.15)",
  color: C.espresso, fontSize: 18, fontWeight: 700, cursor: "pointer",
  flexShrink: 0,
};
const stepValue = {
  flex: 1, textAlign: "center",
  fontFamily: "'Fraunces', Georgia, serif", fontSize: 15, fontWeight: 500, color: C.espresso,
};
const faceRow = { display: "flex", gap: 6 };
const faceBtn = {
  flex: 1, display: "flex", flexDirection: "column",
  alignItems: "center", gap: 3,
  padding: "8px 4px", borderRadius: 12,
  border: "1px solid", background: "transparent",
  cursor: "pointer", fontFamily: "inherit",
};
const faceLabel = {
  fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: C.muted,
};
const barRow = { display: "flex", alignItems: "flex-end", gap: 4 };
const barBtn = {
  flex: 1, borderRadius: 4, border: "none", padding: 0, cursor: "pointer",
};
const sliderStyle = {
  width: "100%", accentColor: C.gold,
};
const sliderLabels = {
  display: "flex", justifyContent: "space-between", marginTop: 4,
};
const listRow = { display: "flex", gap: 6, alignItems: "center" };
const addListBtn = {
  alignSelf: "flex-start", marginTop: 2,
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "6px 12px", borderRadius: 9999,
  background: C.paperHi, border: "1px dashed rgba(58,44,26,0.25)",
  color: C.espresso, fontSize: 11, fontWeight: 700, cursor: "pointer",
};

const formFootRow = {
  display: "flex", gap: 8, marginTop: 8, paddingTop: 12,
  borderTop: "1px solid rgba(58,44,26,0.10)",
};
const cancelBtn = {
  padding: "10px 16px", borderRadius: 9999,
  background: "transparent", color: C.muted,
  border: "1px solid rgba(58,44,26,0.18)",
  fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  cursor: "pointer",
};
const saveBtn = {
  flex: 1, padding: "12px 18px", borderRadius: 9999,
  background: C.espresso, color: C.cream, border: "1px solid " + C.espresso,
  fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
};

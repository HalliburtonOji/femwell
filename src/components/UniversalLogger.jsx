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

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus, X, ArrowLeft, Mic, Sparkles, Pen, ChevronRight,
  Footprints, ListChecks, Pill, Utensils, CalendarClock, Droplets,
  StickyNote, Smile, Stethoscope, Check, Frown, Meh, Heart, Zap,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

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

// ─────────────────────────────────────────────────────────────────────────────
// Type catalogue + field configs
// ─────────────────────────────────────────────────────────────────────────────
const TYPES = [
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
      { key: "name", label: "Meal name", type: "text", required: true, placeholder: "e.g. Salmon + greens" },
      { key: "kind", label: "Type", type: "chips", options: ["Breakfast","Lunch","Dinner","Snack"] },
      { key: "time", label: "Time", type: "time" },
      { key: "cal",  label: "Calories", type: "number", unit: "kcal", optional: true },
      { key: "p",    label: "Protein",  type: "number", unit: "g",    optional: true },
      { key: "carbs",label: "Carbs",    type: "number", unit: "g",    optional: true },
      { key: "fat",  label: "Fat",      type: "number", unit: "g",    optional: true },
      { key: "notes",label: "Notes",    type: "textarea", optional: true },
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
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    _subs.add(fn);
    return () => _subs.delete(fn);
  }, []);
  const { open } = _state;

  // Hide everything (including the FAB) on /Ideas so the page-level demo
  // owns the surface there.
  if (hideFAB) return null;
  if (typeof window !== "undefined" && /\/Ideas\b/.test(window.location.pathname)) return null;

  return (
    <SmartLoggerV4
      key={tick}
      mode="production"
      externalOpen={open}
      onCloseExternal={closeLogger}
    />
  );
}

function LoggerSheet({ initialType }) {
  const [pickedId, setPickedId] = useState(initialType);
  const picked = pickedId ? TYPES.find((t) => t.id === pickedId) : null;

  return (
    <div style={backdrop} onClick={closeLogger}>
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
          <button onClick={closeLogger} style={iconBtn} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {!picked && <TypeGrid onPick={(id) => setPickedId(id)} />}
        {picked  && <DetailForm type={picked} onCancel={closeLogger} onSaved={closeLogger} />}
      </div>
    </div>
  );
}

// ─── Type grid (initial state) ──────────────────────────────────────────────
function TypeGrid({ onPick }) {
  const [voiceState, setVoiceState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  function startVoice() {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setVoiceState("error"); setTranscript("Voice isn't available in this browser."); return; }
    const rec = new SR();
    rec.lang = "en-GB"; rec.interimResults = false;
    rec.onresult = (e) => { setTranscript(e.results[0][0].transcript); setVoiceState("parsed"); };
    rec.onerror = () => { setVoiceState("error"); setTranscript("Couldn't hear that — try again."); };
    setVoiceState("listening"); setTranscript("");
    rec.start();
  }
  return (
    <div style={addGrid}>
      <div style={voicePane}>
        <button onClick={startVoice} style={{
          ...voiceMicWrap,
          background: voiceState === "listening" ? `${C.gold}33` : `${C.gold}1F`,
          border: `1.5px solid ${C.gold}`,
        }}>
          <Mic size={32} style={{ color: C.goldDeep }} />
        </button>
        <h3 style={voiceTitle}>Voice schedule</h3>
        <p style={voiceSub}>
          {voiceState === "idle"      && "Tap and tell me what to add"}
          {voiceState === "listening" && "Listening…"}
          {voiceState === "parsed"    && (transcript ? `"${transcript}"` : "")}
          {voiceState === "error"     && transcript}
        </p>
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
function DetailForm({ type, onCancel, onSaved }) {
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
          await base44.entities.HabitLogs.create({
            user_id, date: todayISO, habit_type: values.name || "Habit",
            habit_category: "other", completed: false,
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
          const kind = (values.kind || "Lunch").toLowerCase();
          const meal_type = ["breakfast", "lunch", "dinner", "snack"].includes(kind) ? kind : "lunch";
          await base44.entities.MealLog.create({
            user_id, logged_at: nowISO, day_key: todayISO,
            meal_type, method: "text",
            raw_text: values.name || "",
            notes: values.notes || "",
          });
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
          // the ritual's chosen time of day.
          const items = Array.isArray(values.items) ? values.items : [];
          for (const step of items) {
            try {
              await base44.entities.HabitLogs.create({
                user_id, date: todayISO,
                habit_type: String(step),
                habit_category: "other",
                completed: false,
                created_at: nowISO, updated_at: nowISO,
              });
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

// RitualBuilder — Phase 3 P3-4
//
// 4-step wizard for creating a custom ritual:
//   1. Name & icon (Lucide icon picker — brand rule: no emoji)
//   2. Schedule (days of week + time of day)
//   3. Phase / life-stage filter (optional)
//   4. Review & save
//
// No `Habit` / `Ritual` entity exists in the base44 schema (verified by
// grep). Until a schema migration ships, custom rituals persist to
// localStorage `femwell_custom_rituals_<userId>` as a JSON array.
// `listCustomRituals(userId, phase, lifeStage)` filters them down for
// the Planner Rituals row.
//
// Fields persisted per ritual:
//   { id, name, icon, days_of_week, time_of_day, phase_filter,
//     stage_filter, created_by_user, is_active, created_at }

import { useState } from "react";
import {
  X, Check, ChevronLeft, ChevronRight, Plus,
  Sparkles, Sun, Moon, Heart, Coffee, BookOpen, Droplets,
  Leaf, Star, Activity, Wind, Flame, Headphones, Smile,
  Footprints, PenLine, Snowflake, Salad, Music, HeartHandshake,
} from "lucide-react";

const C = {
  cream:    "#F4EDDB",
  paperHi:  "#EDE6D5",
  paper:    "#FBF6E6",
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  goldDeep: "#A6862B",
  sage:     "#8FAF8F",
  blush:    "#E8B4B8",
  border:   "#D4C9B4",
};

const ICONS = [
  { key: "sparkles",       Icon: Sparkles,      label: "Sparkle" },
  { key: "sun",            Icon: Sun,           label: "Sun" },
  { key: "moon",           Icon: Moon,          label: "Moon" },
  { key: "heart",          Icon: Heart,         label: "Heart" },
  { key: "coffee",         Icon: Coffee,        label: "Coffee" },
  { key: "book",           Icon: BookOpen,      label: "Book" },
  { key: "water",          Icon: Droplets,      label: "Water" },
  { key: "leaf",           Icon: Leaf,          label: "Leaf" },
  { key: "star",           Icon: Star,          label: "Star" },
  { key: "activity",       Icon: Activity,      label: "Movement" },
  { key: "wind",           Icon: Wind,          label: "Breath" },
  { key: "flame",          Icon: Flame,         label: "Warmth" },
  { key: "headphones",     Icon: Headphones,    label: "Sound" },
  { key: "smile",          Icon: Smile,         label: "Smile" },
  { key: "footprints",     Icon: Footprints,    label: "Walk" },
  { key: "pen",            Icon: PenLine,       label: "Write" },
  { key: "snow",           Icon: Snowflake,     label: "Cold" },
  { key: "salad",          Icon: Salad,         label: "Nourish" },
  { key: "music",          Icon: Music,         label: "Music" },
  { key: "handshake",      Icon: HeartHandshake, label: "Care" },
];

export function iconFor(key) {
  const found = ICONS.find((i) => i.key === key);
  return found ? found.Icon : Sparkles;
}

const DAYS = [
  { id: "mon", short: "M", label: "Mon" },
  { id: "tue", short: "T", label: "Tue" },
  { id: "wed", short: "W", label: "Wed" },
  { id: "thu", short: "T", label: "Thu" },
  { id: "fri", short: "F", label: "Fri" },
  { id: "sat", short: "S", label: "Sat" },
  { id: "sun", short: "S", label: "Sun" },
];

const TIMES = [
  { id: "morning",   label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening",   label: "Evening" },
];

const PHASES = [
  { id: "menstrual",  label: "Menstrual",  tint: "#9A2845" },
  { id: "follicular", label: "Follicular", tint: "#C17B4E" },
  { id: "ovulatory",  label: "Ovulatory",  tint: "#C8A040" },
  { id: "luteal",     label: "Luteal",     tint: "#7B5E9A" },
];

const LIFE_STAGES = [
  { id: "reproductive",     label: "Reproductive" },
  { id: "ttc",              label: "TTC" },
  { id: "pregnant-t1",      label: "Pregnant T1" },
  { id: "pregnant-t2",      label: "Pregnant T2" },
  { id: "pregnant-t3",      label: "Pregnant T3" },
  { id: "postpartum",       label: "Postpartum" },
  { id: "perimenopause",    label: "Perimenopause" },
  { id: "menopause",        label: "Menopause" },
];

// ─── Persistence helpers ─────────────────────────────────────────────────
function lsKey(userId) {
  return `femwell_custom_rituals_${userId || "anon"}`;
}

export function listCustomRituals(userId) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(lsKey(userId));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((r) => r?.is_active !== false) : [];
  } catch { return []; }
}

// Returns only the rituals that match the current phase / stage filter
// (or have no filter set). Used by the Planner Rituals row.
export function listRitualsForContext(userId, { phase, lifeStage }) {
  return listCustomRituals(userId).filter((r) => {
    if (Array.isArray(r.phase_filter) && r.phase_filter.length > 0) {
      if (!r.phase_filter.includes(phase)) return false;
    }
    if (Array.isArray(r.stage_filter) && r.stage_filter.length > 0) {
      if (!r.stage_filter.includes(lifeStage)) return false;
    }
    return true;
  });
}

function saveRitual(userId, ritual) {
  const existing = listCustomRituals(userId);
  const next = [...existing, ritual];
  try {
    window.localStorage.setItem(lsKey(userId), JSON.stringify(next));
  } catch { /* swallow quota */ }
  return next;
}

// ─── Wizard ──────────────────────────────────────────────────────────────
export default function RitualBuilder({ open, onClose, userId, onSaved }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("sparkles");
  const [days, setDays] = useState(["mon", "tue", "wed", "thu", "fri"]);
  const [time, setTime] = useState("morning");
  const [phaseFilter, setPhaseFilter] = useState([]);
  const [stageFilter, setStageFilter] = useState([]);
  const [saved, setSaved] = useState(false);

  function reset() {
    setStep(1); setName(""); setIcon("sparkles");
    setDays(["mon", "tue", "wed", "thu", "fri"]);
    setTime("morning");
    setPhaseFilter([]); setStageFilter([]);
    setSaved(false);
  }

  function handleClose() {
    onClose && onClose();
    setTimeout(reset, 200);
  }

  function toggleArr(arr, setter, id) {
    setter(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function canAdvance() {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return days.length > 0 && !!time;
    return true;
  }

  function handleSave() {
    const ritual = {
      id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      icon,
      days_of_week: days,
      time_of_day: time,
      phase_filter: phaseFilter,
      stage_filter: stageFilter,
      created_by_user: true,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    saveRitual(userId, ritual);
    setSaved(true);
    try { onSaved && onSaved(ritual); } catch { /* swallow */ }
    setTimeout(() => { handleClose(); }, 900);
  }

  if (!open) return null;

  const SelectedIcon = iconFor(icon);

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(58,44,26,0.46)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 115,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          maxHeight: "90vh",
          background: C.cream,
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -12px 36px rgba(58,44,26,0.30)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 16px 10px",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 8,
          }}>
            <p style={kicker}>RITUAL BUILDER · STEP {step}/4</p>
            <button onClick={handleClose} aria-label="Close" style={iconBtn}>
              <X size={14} />
            </button>
          </div>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{
                flex: 1, height: 3, borderRadius: 9999,
                background: n <= step ? C.gold : "rgba(58,44,26,0.10)",
                transition: "background 200ms ease",
              }} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          {saved ? (
            <div style={{ textAlign: "center", padding: "30px 12px" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 9999,
                background: `${C.sage}22`, color: C.sage,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                marginBottom: 12,
              }}><Check size={26} /></div>
              <h3 style={{
                margin: 0, fontSize: 20, fontWeight: 500, color: C.espresso,
              }}>"{name}" saved</h3>
              <p style={{
                margin: "6px 0 0", fontSize: 13, color: C.muted,
                }}>You'll see it in the Rituals row when it's relevant.</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <Step1
                  name={name} setName={setName}
                  icon={icon} setIcon={setIcon}
                />
              )}
              {step === 2 && (
                <Step2
                  days={days}
                  toggleDay={(id) => toggleArr(days, setDays, id)}
                  time={time} setTime={setTime}
                />
              )}
              {step === 3 && (
                <Step3
                  phaseFilter={phaseFilter}
                  togglePhase={(id) => toggleArr(phaseFilter, setPhaseFilter, id)}
                  stageFilter={stageFilter}
                  toggleStage={(id) => toggleArr(stageFilter, setStageFilter, id)}
                />
              )}
              {step === 4 && (
                <Step4
                  name={name}
                  SelectedIcon={SelectedIcon}
                  days={days}
                  time={time}
                  phaseFilter={phaseFilter}
                  stageFilter={stageFilter}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!saved && (
          <div style={{
            padding: "10px 16px max(16px, env(safe-area-inset-bottom))",
            borderTop: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              style={{
                ...secondaryBtn,
                opacity: step === 1 ? 0.4 : 1,
                cursor: step === 1 ? "default" : "pointer",
              }}
            ><ChevronLeft size={13} /> Back</button>
            <div style={{ flex: 1 }} />
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                disabled={!canAdvance()}
                style={{
                  ...primaryBtn,
                  opacity: canAdvance() ? 1 : 0.5,
                  cursor: canAdvance() ? "pointer" : "default",
                }}
              >Next <ChevronRight size={13} /></button>
            ) : (
              <button type="button" onClick={handleSave} style={primaryBtn}>
                <Check size={13} /> Create ritual
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step components ─────────────────────────────────────────────────────
function Step1({ name, setName, icon, setIcon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <p style={fieldLabel}>Name</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning stretch"
          maxLength={40}
          style={{
            width: "100%", padding: "11px 14px",
            background: C.paper,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            fontSize: 14, color: C.espresso,
            outline: "none",
          }}
        />
      </div>
      <div>
        <p style={fieldLabel}>Icon</p>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6,
        }}>
          {ICONS.map((i) => {
            const Icon = i.Icon;
            const on = icon === i.key;
            return (
              <button
                key={i.key}
                type="button"
                onClick={() => setIcon(i.key)}
                aria-pressed={on}
                aria-label={i.label}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  padding: 10, borderRadius: 10,
                  background: on ? C.espresso : C.paperHi,
                  color: on ? C.cream : C.espresso,
                  border: `1px solid ${on ? C.espresso : C.border}`,
                  cursor: "pointer", minHeight: 38,
                  transition: "background 180ms ease",
                }}
              ><Icon size={16} /></button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step2({ days, toggleDay, time, setTime }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p style={fieldLabel}>Days of the week</p>
        <div style={{ display: "flex", gap: 5 }}>
          {DAYS.map((d) => {
            const on = days.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDay(d.id)}
                aria-pressed={on}
                aria-label={d.label}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 9999,
                  background: on ? C.gold : C.paperHi,
                  color: on ? C.espresso : C.muted,
                  border: `1px solid ${on ? C.goldDeep : C.border}`,
                  fontSize: 12.5, fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 180ms ease",
                }}
              >{d.short}</button>
            );
          })}
        </div>
      </div>
      <div>
        <p style={fieldLabel}>Time of day</p>
        <div style={{ display: "flex", gap: 8 }}>
          {TIMES.map((t) => {
            const on = time === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTime(t.id)}
                aria-pressed={on}
                style={{
                  flex: 1, padding: "12px 8px", borderRadius: 12,
                  background: on ? C.espresso : C.paperHi,
                  color: on ? C.cream : C.espresso,
                  border: `1px solid ${on ? C.espresso : C.border}`,
                  fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 180ms ease",
                }}
              >{t.label}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step3({ phaseFilter, togglePhase, stageFilter, toggleStage }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{
        margin: 0, fontSize: 13, color: C.muted, fontStyle: "italic",
        lineHeight: 1.5,
      }}>
        Leave both blank to show this ritual every day. Pick phases or stages to make it conditional.
      </p>
      <div>
        <p style={fieldLabel}>Show only during</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PHASES.map((p) => {
            const on = phaseFilter.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePhase(p.id)}
                aria-pressed={on}
                style={{
                  padding: "8px 12px", borderRadius: 9999,
                  background: on ? p.tint : C.paperHi,
                  color: on ? C.cream : C.espresso,
                  border: `1px solid ${on ? p.tint : C.border}`,
                  fontSize: 12.5, fontWeight: 600,
                  cursor: "pointer",
                }}
              >{p.label}</button>
            );
          })}
        </div>
      </div>
      <div>
        <p style={fieldLabel}>Life stages</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {LIFE_STAGES.map((s) => {
            const on = stageFilter.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleStage(s.id)}
                aria-pressed={on}
                style={{
                  padding: "8px 12px", borderRadius: 9999,
                  background: on ? C.sage : C.paperHi,
                  color: on ? C.cream : C.espresso,
                  border: `1px solid ${on ? C.sage : C.border}`,
                  fontSize: 12.5, fontWeight: 600,
                  cursor: "pointer",
                }}
              >{s.label}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step4({ name, SelectedIcon, days, time, phaseFilter, stageFilter }) {
  const daysLabel = days.length === 7
    ? "Every day"
    : DAYS.filter((d) => days.includes(d.id)).map((d) => d.label).join(", ");
  const phaseLabel = phaseFilter.length === 0
    ? "Every phase"
    : phaseFilter.map((id) => PHASES.find((p) => p.id === id)?.label).filter(Boolean).join(", ");
  const stageLabel = stageFilter.length === 0
    ? "Every life stage"
    : stageFilter.map((id) => LIFE_STAGES.find((s) => s.id === id)?.label).filter(Boolean).join(", ");
  const timeLabel = TIMES.find((t) => t.id === time)?.label || time;

  return (
    <div style={{
      background: C.paperHi,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 16,
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          width: 44, height: 44, borderRadius: 12,
          background: C.gold, color: C.espresso,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}><SelectedIcon size={20} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: 0, fontSize: 18, fontWeight: 500, color: C.espresso,
          }}>{name || "Untitled ritual"}</h3>
          <p style={{
            margin: "2px 0 0", fontSize: 12, color: C.muted,
            }}>{timeLabel}</p>
        </div>
      </div>
      <SummaryRow label="Days" value={daysLabel} />
      <SummaryRow label="Phases" value={phaseLabel} />
      <SummaryRow label="Life stages" value={stageLabel} />
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", gap: 10,
      paddingTop: 8, borderTop: `1px solid ${C.border}`,
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: C.muted,
        flexShrink: 0,
      }}>{label}</span>
      <span style={{
        fontSize: 13, color: C.espresso, textAlign: "right",
        }}>{value}</span>
    </div>
  );
}

// ─── shared style atoms ──────────────────────────────────────────────────
const kicker = {
  margin: 0, fontSize: 10, fontWeight: 700,
  letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, };
const fieldLabel = {
  margin: "0 0 8px", fontSize: 11, fontWeight: 700,
  letterSpacing: "0.12em", textTransform: "uppercase",
  color: C.muted, };
const iconBtn = {
  width: 30, height: 30, borderRadius: 9999,
  background: "rgba(58,44,26,0.06)", border: "none",
  color: C.espresso, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};
const primaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "10px 18px", borderRadius: 9999,
  background: C.espresso, color: C.cream, border: "none",
  fontSize: 13, fontWeight: 700,
  cursor: "pointer",
};
const secondaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "8px 14px", borderRadius: 9999,
  background: "transparent", border: `1px solid ${C.muted}55`,
  color: C.muted,
  fontSize: 13, fontWeight: 600,
};

// Small "+ Create ritual" CTA button — exported for re-use in CreateRitualCard.
export function CreateRitualEntryButton({ onTap }) {
  return (
    <button
      type="button"
      onClick={onTap}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 9999,
        background: C.espresso, color: C.cream, border: "none",
        cursor: "pointer",
        fontSize: 12.5, fontWeight: 700,
      }}
    ><Plus size={12} /> Create ritual</button>
  );
}

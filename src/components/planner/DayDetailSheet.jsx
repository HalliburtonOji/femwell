import { useState } from "react";
import { toast } from "sonner";
import { X, Plus, Check, Clock, Droplets, Activity, Heart, Pill, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

const TABS = [
  { id: "summary",  label: "Summary",  Icon: ClipboardList },
  { id: "checkin",  label: "Check-in", Icon: Heart },
  { id: "cycle",    label: "Cycle",    Icon: Droplets },
  { id: "symptoms", label: "Symptoms", Icon: Activity },
  { id: "tasks",    label: "Tasks",    Icon: Check },
  { id: "meds",     label: "Meds",     Icon: Pill },
];

const CATEGORY_STYLES = {
  work:     { bg: "#E8F0FF", color: "#5B7FC4", label: "Work" },
  personal: { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)", label: "Personal" },
  wellness: { bg: "var(--sage-subtle)", color: "var(--sage)", label: "Wellness" },
  social:   { bg: "var(--mauve-subtle)", color: "var(--mauve)", label: "Social" },
};

const FLOW_OPTIONS   = ["light", "medium", "heavy"];
const PERIOD_TYPES   = [{ v: "PeriodStart", l: "Period Start" }, { v: "PeriodEnd", l: "Period End" }, { v: "Spotting", l: "Spotting" }];
const SEVERITY_LABELS = ["", "Mild", "Moderate", "Significant", "Severe", "Extreme"];
const COMMON_SYMPTOMS = ["cramps", "bloating", "headache", "fatigue", "mood swings", "breast tenderness", "back pain", "acne", "nausea", "insomnia", "anxiety", "brain fog", "hot flashes", "night sweats"];

const sLabel = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 8 };
const inp = { border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", width: "100%", boxSizing: "border-box" };

// ── Summary Tab ──────────────────────────────────────────────────────────────
function SummaryTab({ dayData }) {
  const { checkin, symptoms, habitLogs, tasks, meds, cycleEvents } = dayData;
  const hasAnything = checkin || symptoms?.length || habitLogs?.some(h => h.completed) || tasks?.length || meds?.length || cycleEvents?.length;

  if (!hasAnything) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Nothing logged for this day yet. Use the tabs above to add data.</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Check-in summary */}
      {checkin && (
        <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: "12px 14px" }}>
          <p style={sLabel}>Check-in</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {[["Mood", checkin.mood, "/5"], ["Energy", checkin.energy, "/5"], ["Stress", checkin.stress, "/5"], ["Sleep", checkin.sleep_hours, "h"]].map(([l, v, u]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif", lineHeight: 1 }}>{v ?? "—"}<span style={{ fontSize: 10, color: "var(--mauve)" }}>{u}</span></p>
                <p style={{ fontSize: 10, color: "var(--mauve)", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cycle events */}
      {cycleEvents?.length > 0 && (
        <div style={{ backgroundColor: "var(--rose-dust-subtle)", borderRadius: 14, padding: "12px 14px" }}>
          <p style={{ ...sLabel, color: "var(--rose-dust)" }}>Cycle</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cycleEvents.map(e => (
              <span key={e.id} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, backgroundColor: "white", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>
                {e.type.replace(/([A-Z])/g, ' $1').trim()}{e.flow_level ? ` · ${e.flow_level}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms */}
      {symptoms?.length > 0 && (
        <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: "12px 14px" }}>
          <p style={sLabel}>Symptoms</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {symptoms.map(s => (
              <span key={s.id} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>
                {s.symptom_type}{s.severity ? ` · ${SEVERITY_LABELS[s.severity] || s.severity}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Habits */}
      {habitLogs?.some(h => h.completed) && (
        <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: "12px 14px" }}>
          <p style={sLabel}>Habits completed</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {habitLogs.filter(h => h.completed).map(h => (
              <span key={h.id} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, backgroundColor: "var(--sage-subtle)", color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>
                {h.habit_name || h.habit_type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      {tasks?.length > 0 && (
        <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: "12px 14px" }}>
          <p style={sLabel}>Tasks — {tasks.filter(t => t.completed).length}/{tasks.length} done</p>
          {tasks.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: 5, backgroundColor: t.completed ? "var(--sage)" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {t.completed && <Check style={{ width: 9, height: 9, color: "white" }} />}
              </div>
              <span style={{ fontSize: 13, color: t.completed ? "var(--mauve)" : "var(--plum)", fontFamily: "'Inter', sans-serif", textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Meds */}
      {meds?.length > 0 && (
        <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: "12px 14px" }}>
          <p style={sLabel}>Medications</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {meds.map(m => (
              <span key={m.id} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, backgroundColor: "var(--mauve-subtle)", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                {m.item_name}{m.dose ? ` · ${m.dose}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Check-in Tab ─────────────────────────────────────────────────────────────
function CheckinTab({ dayData, dateStr, userId, onRefresh }) {
  const existing = dayData.checkin;
  const [values, setValues] = useState({
    mood: existing?.mood || "", energy: existing?.energy || "",
    stress: existing?.stress || "", sleep_hours: existing?.sleep_hours || "",
    notes: existing?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const sliders = [
    { key: "mood", label: "Mood" },
    { key: "energy", label: "Energy" },
    { key: "stress", label: "Stress" },
  ];

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      user_id: userId, date: dateStr, ...values,
      mood: values.mood !== "" ? Number(values.mood) : undefined,
      energy: values.energy !== "" ? Number(values.energy) : undefined,
      stress: values.stress !== "" ? Number(values.stress) : undefined,
      sleep_hours: values.sleep_hours !== "" ? Number(values.sleep_hours) : undefined,
      updated_at: new Date().toISOString()
    };
    if (existing) await base44.entities.DailyCheckins.update(existing.id, payload);
    else await base44.entities.DailyCheckins.create(payload);
    toast.success("Check-in saved");
    onRefresh();
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {sliders.map(({ key, label }) => (
        <div key={key}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>{values[key] || "—"}/5</span>
          </div>
          <input type="range" min="1" max="5" value={values[key] || 3}
            onChange={e => setValues(v => ({ ...v, [key]: Number(e.target.value) }))} />
        </div>
      ))}
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 4 }}>Sleep (hours)</span>
        <input type="number" min="0" max="24" step="0.5" placeholder="e.g. 7.5"
          value={values.sleep_hours}
          onChange={e => setValues(v => ({ ...v, sleep_hours: e.target.value }))}
          style={{ ...inp, width: "auto" }} />
      </div>
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 4 }}>Notes</span>
        <textarea placeholder="How are you feeling today?" rows={3}
          value={values.notes}
          onChange={e => setValues(v => ({ ...v, notes: e.target.value }))}
          style={{ ...inp, resize: "none" }} />
      </div>
      <button onClick={handleSave} disabled={saving}
        style={{ backgroundColor: "var(--plum)", color: "white", border: "none", borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: saving ? 0.5 : 1 }}>
        {saving ? "Saving..." : existing ? "Update Check-in" : "Save Check-in"}
      </button>
    </div>
  );
}

// ── Cycle Tab ────────────────────────────────────────────────────────────────
function CycleTab({ dayData, dateStr, userId, onRefresh }) {
  const events = dayData.cycleEvents || [];
  const [type, setType] = useState("PeriodStart");
  const [flow, setFlow] = useState("medium");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.CycleEvents.create({
      user_id: userId, date: dateStr, type,
      flow_level: type !== "PeriodEnd" ? flow : undefined,
    });
    toast.success("Cycle event logged");
    setAdding(false);
    onRefresh();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.CycleEvents.delete(id);
    onRefresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {events.length === 0 && !adding && (
        <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No cycle events logged.</p>
      )}
      {events.map(e => (
        <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "var(--rose-dust-subtle)", borderRadius: 12, padding: "10px 14px" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{e.type.replace(/([A-Z])/g, ' $1').trim()}</span>
            {e.flow_level && <span style={{ fontSize: 12, color: "var(--mauve)", marginLeft: 6, textTransform: "capitalize" }}>{e.flow_level}</span>}
          </div>
          <button onClick={() => handleDelete(e.id)} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <X style={{ width: 13, height: 13, color: "var(--mauve)" }} />
          </button>
        </div>
      ))}

      {adding && (
        <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: 14, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {PERIOD_TYPES.map(t => (
              <button key={t.v} onClick={() => setType(t.v)}
                style={{ padding: "6px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", backgroundColor: type === t.v ? "var(--plum)" : "var(--border)", color: type === t.v ? "white" : "var(--mauve)" }}>
                {t.l}
              </button>
            ))}
          </div>
          {type !== "PeriodEnd" && (
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {FLOW_OPTIONS.map(f => (
                <button key={f} onClick={() => setFlow(f)}
                  style={{ flex: 1, padding: "6px", borderRadius: 9999, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize", backgroundColor: flow === f ? "var(--rose-dust-subtle)" : "var(--ivory-dark)", color: flow === f ? "var(--rose-dust)" : "var(--mauve)" }}>
                  {f}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "transparent", color: "var(--mauve)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "9px", borderRadius: 12, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {!adding && (
        <button onClick={() => setAdding(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "var(--rose-dust-subtle)", border: "1px dashed var(--rose-dust-light)", borderRadius: 12, padding: "11px 14px", cursor: "pointer", width: "100%" }}>
          <Plus style={{ width: 14, height: 14, color: "var(--rose-dust)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>Log cycle event</span>
        </button>
      )}
    </div>
  );
}

// ── Symptoms Tab ─────────────────────────────────────────────────────────────
function SymptomsTab({ dayData, dateStr, userId, onRefresh }) {
  const symptoms = dayData.symptoms || [];
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState("");
  const [custom, setCustom] = useState("");
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const t = custom.trim() || type;
    if (!t) return;
    setSaving(true);
    await base44.entities.SymptomLogs.create({ user_id: userId, date: dateStr, symptom_type: t, severity, notes: notes || undefined });
    toast.success("Symptom logged");
    setAdding(false); setType(""); setCustom(""); setSeverity(3); setNotes("");
    onRefresh();
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {symptoms.length === 0 && !adding && (
        <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No symptoms logged.</p>
      )}
      {symptoms.map(s => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "var(--ivory)", borderRadius: 12, padding: "10px 14px" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{s.symptom_type}</span>
            <span style={{ fontSize: 11, color: "var(--mauve)", marginLeft: 6 }}>{SEVERITY_LABELS[s.severity] || ""}</span>
          </div>
          <button onClick={async () => { await base44.entities.SymptomLogs.delete(s.id); onRefresh(); }} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <X style={{ width: 13, height: 13, color: "var(--mauve)" }} />
          </button>
        </div>
      ))}

      {adding && (
        <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: 14, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {COMMON_SYMPTOMS.map(s => (
              <button key={s} onClick={() => { setType(s); setCustom(""); }}
                style={{ padding: "5px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize", backgroundColor: type === s ? "var(--plum)" : "var(--ivory-dark)", color: type === s ? "white" : "var(--plum)" }}>
                {s}
              </button>
            ))}
          </div>
          <input placeholder="Or custom symptom..." value={custom}
            onChange={e => { setCustom(e.target.value); setType(""); }}
            style={{ ...inp, marginBottom: 10 }} />
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Severity</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--rose-dust)" }}>{SEVERITY_LABELS[severity]}</span>
            </div>
            <input type="range" min="1" max="5" value={severity} onChange={e => setSeverity(Number(e.target.value))} />
          </div>
          <textarea placeholder="Notes (optional)" rows={2} value={notes} onChange={e => setNotes(e.target.value)} style={{ ...inp, resize: "none", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "transparent", color: "var(--mauve)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={(!type && !custom.trim()) || saving} style={{ flex: 2, padding: "9px", borderRadius: 12, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: ((!type && !custom.trim()) || saving) ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {!adding && (
        <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "var(--ivory)", border: "1px dashed var(--border)", borderRadius: 12, padding: "11px 14px", cursor: "pointer", width: "100%" }}>
          <Plus style={{ width: 14, height: 14, color: "var(--rose-dust)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>Log a symptom</span>
        </button>
      )}
    </div>
  );
}

// ── Tasks Tab ────────────────────────────────────────────────────────────────
function TasksTab({ dayData, dateStr, userId, onRefresh }) {
  const tasks = dayData.tasks || [];
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("personal");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await base44.entities.PersonalTasks.create({ user_id: userId, date: dateStr, title: title.trim(), time: time || undefined, category, completed: false });
    toast.success("Task added");
    setTitle(""); setTime(""); setCategory("personal"); setAdding(false);
    onRefresh();
    setSaving(false);
  };

  const handleToggle = async (task) => {
    await base44.entities.PersonalTasks.update(task.id, { completed: !task.completed });
    onRefresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.PersonalTasks.delete(id);
    onRefresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {tasks.length === 0 && !adding && (
        <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No tasks for this day.</p>
      )}

      {tasks.map(task => {
        const cat = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.personal;
        return (
          <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "var(--ivory)", borderRadius: 12, padding: "10px 12px" }}>
            <button onClick={() => handleToggle(task)} style={{ width: 22, height: 22, borderRadius: 7, border: task.completed ? "none" : "1.5px solid var(--border)", backgroundColor: task.completed ? "var(--sage)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              {task.completed && <Check style={{ width: 11, height: 11, color: "white" }} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: task.completed ? "var(--mauve)" : "var(--plum)", fontFamily: "'Inter', sans-serif", textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                {task.time && <span style={{ fontSize: 10, color: "var(--mauve)" }}>{task.time}</span>}
                <span style={{ fontSize: 10, fontWeight: 600, color: cat.color, backgroundColor: cat.bg, padding: "1px 7px", borderRadius: 9999, fontFamily: "'Inter', sans-serif" }}>{cat.label}</span>
              </div>
            </div>
            <button onClick={() => handleDelete(task.id)} style={{ border: "none", background: "none", cursor: "pointer" }}>
              <X style={{ width: 12, height: 12, color: "var(--mauve)" }} />
            </button>
          </div>
        );
      })}

      {adding && (
        <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: 14, border: "1px solid var(--border)" }}>
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()} placeholder="Task title..." style={{ ...inp, marginBottom: 8 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Clock style={{ width: 13, height: 13, color: "var(--mauve)", flexShrink: 0 }} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...inp, width: "auto" }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {Object.entries(CATEGORY_STYLES).map(([cat, { bg, color, label }]) => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", border: category === cat ? `1.5px solid ${color}` : "1.5px solid var(--border)", backgroundColor: category === cat ? bg : "transparent", color: category === cat ? color : "var(--mauve)" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setAdding(false); setTitle(""); }} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "transparent", color: "var(--mauve)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={!title.trim() || saving} style={{ flex: 2, padding: "9px", borderRadius: 12, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: (!title.trim() || saving) ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save task"}
            </button>
          </div>
        </div>
      )}

      {!adding && (
        <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "var(--ivory)", border: "1px dashed var(--border)", borderRadius: 12, padding: "11px 14px", cursor: "pointer", width: "100%" }}>
          <Plus style={{ width: 14, height: 14, color: "var(--rose-dust)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>Add task</span>
        </button>
      )}
    </div>
  );
}

// ── Meds Tab ─────────────────────────────────────────────────────────────────
function MedsTab({ dayData, dateStr, userId, onRefresh }) {
  const meds = dayData.meds || [];
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await base44.entities.MedicationLogs.create({ user_id: userId, date: dateStr, item_name: name.trim(), dose: dose || undefined, notes: notes || undefined, taken: true });
    toast.success("Medication logged");
    setName(""); setDose(""); setNotes(""); setAdding(false);
    onRefresh();
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {meds.length === 0 && !adding && (
        <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No medications logged.</p>
      )}
      {meds.map(m => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "var(--ivory)", borderRadius: 12, padding: "10px 14px" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{m.item_name}</span>
            {m.dose && <span style={{ fontSize: 11, color: "var(--mauve)", marginLeft: 6 }}>{m.dose}</span>}
          </div>
          <button onClick={async () => { await base44.entities.MedicationLogs.delete(m.id); onRefresh(); }} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <X style={{ width: 13, height: 13, color: "var(--mauve)" }} />
          </button>
        </div>
      ))}

      {adding && (
        <div style={{ backgroundColor: "var(--ivory)", borderRadius: 14, padding: 14, border: "1px solid var(--border)" }}>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Medication name *" style={{ ...inp, marginBottom: 8 }} />
          <input value={dose} onChange={e => setDose(e.target.value)} placeholder="Dose (e.g. 500mg) — optional" style={{ ...inp, marginBottom: 8 }} />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes — optional" rows={2} style={{ ...inp, resize: "none", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "transparent", color: "var(--mauve)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={!name.trim() || saving} style={{ flex: 2, padding: "9px", borderRadius: 12, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: (!name.trim() || saving) ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {!adding && (
        <button onClick={() => setAdding(true)} style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "var(--mauve-subtle)", border: "1px dashed var(--mauve-light)", borderRadius: 12, padding: "11px 14px", cursor: "pointer", width: "100%" }}>
          <Plus style={{ width: 14, height: 14, color: "var(--mauve)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Log medication</span>
        </button>
      )}
    </div>
  );
}

// ── Main DayDetailSheet ───────────────────────────────────────────────────────
export default function DayDetailSheet({ date, dayData: initialDayData, userId, onClose, onDataChanged }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [dayData, setDayData] = useState(initialDayData || { checkin: null, symptoms: [], habitLogs: [], tasks: [], meds: [], cycleEvents: [] });

  if (!date) return null;
  const dateStr = format(date, "yyyy-MM-dd");
  const dateDisplay = format(date, "EEEE, MMMM d");

  const handleRefresh = async () => {
    // Re-fetch all data for this specific date
    const [checkins, symptoms, habits, tasks, meds, cycleEvents] = await Promise.all([
      base44.entities.DailyCheckins.filter({ user_id: userId, date: dateStr }),
      base44.entities.SymptomLogs.filter({ user_id: userId, date: dateStr }),
      base44.entities.HabitLogs.filter({ user_id: userId, date: dateStr }),
      base44.entities.PersonalTasks.filter({ user_id: userId, date: dateStr }),
      base44.entities.MedicationLogs.filter({ user_id: userId, date: dateStr }),
      base44.entities.CycleEvents.filter({ user_id: userId, date: dateStr }),
    ]);
    const updated = {
      checkin: checkins[0] || null,
      symptoms,
      habitLogs: habits,
      tasks,
      meds,
      cycleEvents,
    };
    setDayData(updated);
    onDataChanged?.();
  };

  const tabProps = { dayData, dateStr, userId, onRefresh: handleRefresh };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(42,32,53,0.55)", backdropFilter: "blur(8px)", zIndex: 60 }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 61,
        backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0",
        maxHeight: "86vh", display: "flex", flexDirection: "column",
        boxShadow: "0 -20px 60px rgba(42,32,53,0.22)",
        paddingBottom: "env(safe-area-inset-bottom, 20px)",
      }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 14, paddingBottom: 6, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 14px", flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Day Log</p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--plum)", fontFamily: "'Fraunces', serif", marginTop: 2 }}>{dateDisplay}</h3>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ width: 14, height: 14, color: "var(--mauve)" }} />
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 2, overflowX: "auto", padding: "0 16px 12px", flexShrink: 0, scrollbarWidth: "none" }}>
          <style>{`.dds-tabs::-webkit-scrollbar{display:none}`}</style>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "7px 12px", borderRadius: 9999, border: "none",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
                flexShrink: 0,
                backgroundColor: activeTab === id ? "var(--plum)" : "var(--ivory-dark)",
                color: activeTab === id ? "white" : "var(--mauve)",
                transition: "all 0.15s",
              }}
            >
              <Icon style={{ width: 11, height: 11 }} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
          {activeTab === "summary"  && <SummaryTab  {...tabProps} />}
          {activeTab === "checkin"  && <CheckinTab  {...tabProps} />}
          {activeTab === "cycle"    && <CycleTab    {...tabProps} />}
          {activeTab === "symptoms" && <SymptomsTab {...tabProps} />}
          {activeTab === "tasks"    && <TasksTab    {...tabProps} />}
          {activeTab === "meds"     && <MedsTab     {...tabProps} />}
        </div>
      </div>
    </>
  );
}
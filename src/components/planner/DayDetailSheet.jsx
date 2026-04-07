import { useState } from "react";
import { Plus, X, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

const CATEGORY_STYLES = {
  work:     { bg: "#E8F0FF", color: "#5B7FC4", label: "Work" },
  personal: { bg: "var(--rose-dust-subtle)", color: "var(--rose-dust)", label: "Personal" },
  wellness: { bg: "var(--sage-subtle)", color: "var(--sage)", label: "Wellness" },
  social:   { bg: "var(--mauve-subtle)", color: "var(--mauve)", label: "Social" },
};

export default function DayDetailSheet({ date, checkin, symptoms, habits, tasks, userId, onClose, onTaskAdded, onTaskToggled }) {
  const [addingTask, setAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newCategory, setNewCategory] = useState("personal");
  const [saving, setSaving] = useState(false);

  if (!date) return null;
  const dateStr = format(date, "EEEE, MMMM d");

  const handleSaveTask = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    const created = await base44.entities.PersonalTasks.create({
      user_id: userId,
      date: format(date, "yyyy-MM-dd"),
      title: newTitle.trim(),
      time: newTime || undefined,
      category: newCategory,
      completed: false,
    });
    onTaskAdded?.(created);
    setNewTitle(""); setNewTime(""); setNewCategory("personal");
    setAddingTask(false);
    setSaving(false);
  };

  const handleToggleTask = async (task) => {
    const updated = await base44.entities.PersonalTasks.update(task.id, { completed: !task.completed });
    onTaskToggled?.(updated);
  };

  const handleDeleteTask = async (taskId) => {
    await base44.entities.PersonalTasks.delete(taskId);
    onTaskToggled?.({ id: taskId, _deleted: true });
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(42,32,53,0.5)", backdropFilter: "blur(8px)", zIndex: 60 }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 61,
        backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0",
        maxHeight: "82vh", overflowY: "auto",
        boxShadow: "0 -20px 60px rgba(42,32,53,0.18)",
        paddingBottom: "env(safe-area-inset-bottom, 24px)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 14, paddingBottom: 8 }}>
          <div style={{ width: 36, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>
        <div style={{ padding: "0 20px 28px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Day Log</p>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", marginTop: 2 }}>{dateStr}</h3>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X style={{ width: 14, height: 14, color: "var(--mauve)" }} />
            </button>
          </div>

          {/* Tasks section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Tasks & Notes</p>
              {!addingTask && (
                <button onClick={() => setAddingTask(true)} style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "var(--plum)", color: "white", border: "none", borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  <Plus style={{ width: 11, height: 11 }} /> Add
                </button>
              )}
            </div>

            {/* Add task form */}
            {addingTask && (
              <div style={{ backgroundColor: "var(--ivory)", borderRadius: 16, padding: 14, marginBottom: 10, border: "1px solid var(--border)" }}>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSaveTask()}
                  placeholder="Task or note title..."
                  style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--surface)", outline: "none", boxSizing: "border-box", marginBottom: 8 }}
                />
                <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <Clock style={{ position: "absolute", left: 9, width: 12, height: 12, color: "var(--mauve)", pointerEvents: "none" }} />
                    <input
                      type="time"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      style={{ border: "1.5px solid var(--border)", borderRadius: 12, padding: "7px 10px 7px 28px", fontSize: 12, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--surface)", outline: "none" }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                  {Object.entries(CATEGORY_STYLES).map(([cat, { bg, color, label }]) => (
                    <button key={cat} onClick={() => setNewCategory(cat)}
                      style={{ padding: "5px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 600, border: newCategory === cat ? `1.5px solid ${color}` : "1.5px solid var(--border)", backgroundColor: newCategory === cat ? bg : "transparent", color: newCategory === cat ? color : "var(--mauve)", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setAddingTask(false); setNewTitle(""); }} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "transparent", color: "var(--mauve)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleSaveTask} disabled={!newTitle.trim() || saving} style={{ flex: 2, padding: "9px", borderRadius: 12, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: (!newTitle.trim() || saving) ? 0.5 : 1 }}>
                    {saving ? "Saving..." : "Save task"}
                  </button>
                </div>
              </div>
            )}

            {/* Task list */}
            {tasks?.length > 0 ? tasks.map(task => {
              const cat = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.personal;
              return (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "var(--ivory)", borderRadius: 14, padding: "10px 12px", marginBottom: 8 }}>
                  <button onClick={() => handleToggleTask(task)} style={{ width: 22, height: 22, borderRadius: 7, border: task.completed ? "none" : "1.5px solid var(--border)", backgroundColor: task.completed ? "var(--sage)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    {task.completed && <Check style={{ width: 12, height: 12, color: "white" }} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: task.completed ? "var(--mauve)" : "var(--plum)", fontFamily: "'Inter', sans-serif", textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      {task.time && <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{task.time}</span>}
                      <span style={{ fontSize: 10, fontWeight: 600, color: cat.color, backgroundColor: cat.bg, padding: "1px 7px", borderRadius: 9999, fontFamily: "'Inter', sans-serif" }}>{cat.label}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteTask(task.id)} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}>
                    <X style={{ width: 12, height: 12, color: "var(--mauve)" }} />
                  </button>
                </div>
              );
            }) : (
              !addingTask && <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No tasks for this day. Tap "Add" to create one.</p>
            )}
          </div>

          {/* Check-in */}
          {checkin && (
            <div style={{ backgroundColor: "var(--ivory)", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>Check-in</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[["Mood", checkin.mood, "/5"], ["Energy", checkin.energy, "/5"], ["Stress", checkin.stress, "/5"], ["Sleep", checkin.sleep_hours, "h"]].map(([label, val, unit]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{val ?? "—"}<span style={{ fontSize: 10, color: "var(--mauve)" }}>{unit}</span></p>
                    <p style={{ fontSize: 10, color: "var(--mauve)", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Symptoms */}
          {symptoms?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Symptoms</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {symptoms.map(s => (
                  <span key={s.id} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, backgroundColor: "var(--rose-dust-subtle)", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{s.symptom_type}</span>
                ))}
              </div>
            </div>
          )}

          {/* Habits */}
          {habits?.filter(h => h.completed).length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Habits completed</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {habits.filter(h => h.completed).map(h => (
                  <span key={h.id} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, backgroundColor: "var(--sage-subtle)", color: "var(--sage)", fontFamily: "'Inter', sans-serif" }}>{h.habit_name || h.habit_type}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
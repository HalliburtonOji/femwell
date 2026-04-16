import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, Plus, Clock, Trash2, Check, ChevronLeft, ChevronRight, X } from "lucide-react";

const CATEGORY_COLORS = {
  health:    { bg: "#FEE2E2", color: "#DC2626" },
  personal:  { bg: "#EDE9FE", color: "#7C3AED" },
  work:      { bg: "#DBEAFE", color: "#2563EB" },
  social:    { bg: "#D1FAE5", color: "#059669" },
  wellbeing: { bg: "#FEF3C7", color: "#D97706" },
  reminder:  { bg: "#F3F4F6", color: "#6B7280" },
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

function getWeekDays(mondayDate) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateStr(d) {
  return d.toISOString().split("T")[0];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Planner() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [user, setUser] = useState(null);
  const [monday, setMonday] = useState(getMondayOfWeek(today));
  const [selectedDay, setSelectedDay] = useState(today);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", category: "reminder", time: "", repeat: "once", notes: "" });

  const weekDays = getWeekDays(monday);
  const selectedStr = toDateStr(selectedDay);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const allItems = await base44.entities.PlannerItems.filter({ user_id: u.id }, "-created_date", 200).catch(() => []);
      setItems(allItems);
      setLoading(false);
    })();
  }, []);

  const dayItems = items
    .filter(item => item.date === selectedStr || (item.repeat === "daily") || (item.repeat === "weekly" && new Date(item.date).getDay() === selectedDay.getDay()) || (item.repeat === "monthly" && new Date(item.date).getDate() === selectedDay.getDate()))
    .sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });

  const handleAdd = async () => {
    if (!newItem.title.trim()) return;
    setSaving(true);
    const created = await base44.entities.PlannerItems.create({
      user_id: user.id,
      title: newItem.title.trim(),
      category: newItem.category,
      date: selectedStr,
      time: newItem.time || null,
      repeat: newItem.repeat,
      notes: newItem.notes || null,
      is_completed: false,
      created_at: new Date().toISOString(),
    });
    setItems(prev => [created, ...prev]);
    setNewItem({ title: "", category: "reminder", time: "", repeat: "once", notes: "" });
    setShowAdd(false);
    setSaving(false);
  };

  const toggleComplete = async (item) => {
    const updated = { ...item, is_completed: !item.is_completed };
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    await base44.entities.PlannerItems.update(item.id, { is_completed: updated.is_completed });
  };

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await base44.entities.PlannerItems.delete(id);
  };

  const prevWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() - 7);
    setMonday(d);
    const sel = new Date(selectedDay);
    sel.setDate(sel.getDate() - 7);
    setSelectedDay(sel);
  };

  const nextWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7);
    setMonday(d);
    const sel = new Date(selectedDay);
    sel.setDate(sel.getDate() + 7);
    setSelectedDay(sel);
  };

  const isToday = (d) => toDateStr(d) === toDateStr(today);
  const isSelected = (d) => toDateStr(d) === selectedStr;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-3" style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-xl mx-auto">
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Your week</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em", marginBottom: 12 }}>Planner</h1>

          {/* Week strip */}
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} style={{ width: 28, height: 28, borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <ChevronLeft className="w-4 h-4" style={{ color: "var(--mauve)" }} />
            </button>
            <div className="flex gap-1 flex-1 justify-between">
              {weekDays.map((d, i) => {
                const sel = isSelected(d);
                const tod = isToday(d);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(d)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      padding: "6px 4px", borderRadius: 12, flex: 1, border: "none", cursor: "pointer",
                      backgroundColor: sel ? "#C084FC" : tod ? "var(--rose-dust-subtle)" : "transparent",
                    }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 600, color: sel ? "white" : "var(--mauve)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase" }}>{DAY_LABELS[i]}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: sel ? "white" : tod ? "var(--rose-dust)" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <button onClick={nextWeek} style={{ width: 28, height: 28, borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <ChevronRight className="w-4 h-4" style={{ color: "var(--mauve)" }} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5">
        {/* Day label */}
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>
          {selectedDay.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#EDE9FE", borderTopColor: "#C084FC" }} />
          </div>
        ) : dayItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <Calendar className="w-10 h-10 mx-auto mb-4" style={{ color: "#C084FC", opacity: 0.5 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--plum)", fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>Nothing planned</p>
            <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Tap + to add something for this day.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayItems.map(item => {
              const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.reminder;
              return (
                <div key={item.id} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12, opacity: item.is_completed ? 0.55 : 1, transition: "opacity 0.2s" }}>
                  <button onClick={() => toggleComplete(item)} style={{ width: 22, height: 22, borderRadius: 9999, border: `2px solid ${item.is_completed ? "#C084FC" : "var(--border)"}`, backgroundColor: item.is_completed ? "#C084FC" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", marginTop: 1 }}>
                    {item.is_completed && <Check className="w-3 h-3" style={{ color: "white" }} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", textDecoration: item.is_completed ? "line-through" : "none", marginBottom: 4 }}>{item.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, backgroundColor: cat.bg, color: cat.color, borderRadius: 9999, padding: "2px 8px", fontFamily: "'Inter', sans-serif", textTransform: "capitalize" }}>{item.category}</span>
                      {item.time && (
                        <span style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock className="w-3 h-3" />{item.time}
                        </span>
                      )}
                      {item.repeat !== "once" && (
                        <span style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>↻ {item.repeat}</span>
                      )}
                    </div>
                    {item.notes && <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 4, lineHeight: 1.5 }}>{item.notes}</p>}
                  </div>
                  <button onClick={() => deleteItem(item.id)} style={{ color: "var(--mauve)", background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        style={{ position: "fixed", bottom: 96, right: 20, width: 52, height: 52, borderRadius: 9999, backgroundColor: "#C084FC", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(192,132,252,0.4)", zIndex: 30 }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add item bottom sheet */}
      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(42,32,53,0.4)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, backgroundColor: "var(--surface)", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--plum)", margin: 0 }}>Add to planner</h2>
              <button onClick={() => setShowAdd(false)} style={{ width: 30, height: 30, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X className="w-4 h-4" style={{ color: "var(--mauve)" }} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                autoFocus
                placeholder="What do you want to plan?"
                value={newItem.title}
                onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 12, padding: "11px 14px", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", boxSizing: "border-box" }}
              />

              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>Category</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CATEGORIES.map(cat => {
                    const c = CATEGORY_COLORS[cat];
                    const active = newItem.category === cat;
                    return (
                      <button key={cat} onClick={() => setNewItem(p => ({ ...p, category: cat }))}
                        style={{ borderRadius: 9999, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize", border: "1.5px solid", backgroundColor: active ? c.bg : "transparent", borderColor: active ? c.color : "var(--border)", color: active ? c.color : "var(--mauve)" }}>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>Time (optional)</p>
                  <input type="time" value={newItem.time} onChange={e => setNewItem(p => ({ ...p, time: e.target.value }))}
                    style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>Repeat</p>
                  <select value={newItem.repeat} onChange={e => setNewItem(p => ({ ...p, repeat: e.target.value }))}
                    style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", boxSizing: "border-box" }}>
                    {["once", "daily", "weekly", "monthly"].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={newItem.notes}
                onChange={e => setNewItem(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: 12, padding: "11px 14px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", backgroundColor: "var(--ivory)", outline: "none", resize: "none", boxSizing: "border-box" }}
              />

              <button
                onClick={handleAdd}
                disabled={!newItem.title.trim() || saving}
                style={{ width: "100%", height: 48, borderRadius: 9999, backgroundColor: "#C084FC", color: "white", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: (!newItem.title.trim() || saving) ? 0.5 : 1 }}>
                {saving ? "Saving..." : "Add to planner"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
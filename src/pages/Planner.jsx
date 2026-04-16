import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Check, X } from "lucide-react";
import { format, parseISO, addDays, startOfWeek } from "date-fns";
import { differenceInDays } from "date-fns";

const CATEGORIES = ["health", "personal", "work", "social", "wellbeing", "reminder"];
const CATEGORY_STYLES = {
  health:    { bg: "var(--sage-subtle)",       color: "var(--sage)" },
  personal:  { bg: "var(--rose-dust-subtle)",  color: "var(--rose-dust)" },
  work:      { bg: "#FFF8E6",                   color: "#C4954A" },
  social:    { bg: "#E8F4FF",                   color: "#5B9BD5" },
  wellbeing: { bg: "var(--mauve-subtle)",       color: "var(--mauve)" },
  reminder:  { bg: "var(--ivory-dark)",         color: "var(--mauve)" },
};
const REPEAT_OPTIONS = ["once", "daily", "weekly", "monthly"];

const PHASE_TIPS = {
  menstrual:  "Schedule gentler tasks today — your body needs more rest.",
  follicular: "Great day for new projects and important decisions.",
  ovulatory:  "High energy — ideal for social plans and ambitious goals.",
  luteal:     "Build in buffer time and avoid overcommitting this week.",
};

function getPhase(profile) {
  if (!profile?.last_period_start_date) return null;
  const cycleLen = profile.cycle_avg_length || 28;
  const periodLen = profile.period_length || 5;
  const diff = differenceInDays(new Date(), parseISO(profile.last_period_start_date));
  if (diff < 0) return null;
  const day = (diff % cycleLen) + 1;
  if (day <= periodLen) return "menstrual";
  if (day <= 13) return "follicular";
  if (day <= 16) return "ovulatory";
  return "luteal";
}

const PHASE_COLORS = {
  menstrual: "var(--rose-dust)",
  follicular: "var(--sage)",
  ovulatory: "#B89E6A",
  luteal: "var(--mauve)",
};

const todayStr = new Date().toISOString().split("T")[0];

const sLabel = { fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" };

export default function Planner() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("today");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedWeekDay, setSelectedWeekDay] = useState(null);
  const [form, setForm] = useState({ title: "", category: "reminder", date: todayStr, time: "", repeat: "once", notes: "" });

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, plannerItems] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
        base44.entities.PlannerItems.filter({ user_id: u.id }, "date", 200).catch(() => []),
      ]);
      setProfile(profiles[0] || null);
      setItems(plannerItems);
      setLoading(false);
    })();
  }, []);

  const phase = getPhase(profile);
  const phaseTip = phase ? PHASE_TIPS[phase] : null;
  const phaseColor = phase ? PHASE_COLORS[phase] : "var(--mauve)";

  const viewDate = selectedWeekDay || todayStr;
  const todayItems = items.filter(i => i.date === viewDate).sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    return { str: d.toISOString().split("T")[0], d };
  });

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const created = await base44.entities.PlannerItems.create({
      user_id: user.id,
      ...form,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setItems(prev => [...prev, created]);
    setForm({ title: "", category: "reminder", date: todayStr, time: "", repeat: "once", notes: "" });
    setShowAdd(false);
  };

  const handleToggle = async (item) => {
    const updated = await base44.entities.PlannerItems.update(item.id, { is_completed: !item.is_completed });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_completed: !i.is_completed } : i));
  };

  const handleDelete = async (id) => {
    await base44.entities.PlannerItems.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-10 pb-4" style={{ backgroundColor: "rgba(250,248,245,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto">
          <p style={sLabel}>My Planner</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "var(--plum)", letterSpacing: "-0.02em", marginTop: 2, marginBottom: 12 }}>
            Stay on top of your day
          </h1>
          <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: "var(--ivory-dark)" }}>
            {[["today", "Today"], ["week", "This Week"]].map(([key, label]) => (
              <button key={key} onClick={() => { setTab(key); setSelectedWeekDay(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor: tab === key ? "var(--plum)" : "transparent", color: tab === key ? "white" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">
        {/* Phase tip */}
        {phaseTip && (
          <div style={{ backgroundColor: "var(--surface)", border: `1px solid var(--border)`, borderRadius: 16, padding: "12px 16px", marginBottom: 16, borderLeft: `3px solid ${phaseColor}` }}>
            <p style={{ fontSize: 12, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>{phaseTip}</p>
          </div>
        )}

        {/* TODAY VIEW */}
        {(tab === "today" || selectedWeekDay) && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                {selectedWeekDay && (
                  <button onClick={() => setSelectedWeekDay(null)} style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", background: "none", border: "none", cursor: "pointer", marginBottom: 4, padding: 0 }}>
                    Back to week
                  </button>
                )}
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>
                  {format(parseISO(viewDate), "EEEE, MMMM d")}
                  {viewDate === todayStr && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--rose-dust)", marginLeft: 8, backgroundColor: "var(--rose-dust-subtle)", borderRadius: 9999, padding: "2px 8px" }}>Today</span>}
                </p>
              </div>
              <button onClick={() => { setForm(f => ({ ...f, date: viewDate })); setShowAdd(true); }}
                style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {todayItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", backgroundColor: "var(--surface)", borderRadius: 20, border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--plum)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Nothing scheduled</p>
                <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Tap + to add something to this day.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayItems.map(item => {
                  const cat = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.reminder;
                  return (
                    <div key={item.id} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                      <button onClick={() => handleToggle(item)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${item.is_completed ? "var(--sage)" : "var(--border)"}`, backgroundColor: item.is_completed ? "var(--sage)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                        {item.is_completed && <Check style={{ width: 12, height: 12, color: "white" }} strokeWidth={3} />}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.time && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{item.time}</span>}
                          <span style={{ fontSize: 10, fontWeight: 600, color: cat.color, backgroundColor: cat.bg, borderRadius: 9999, padding: "1px 8px", textTransform: "capitalize", fontFamily: "'Inter', sans-serif" }}>{item.category}</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: item.is_completed ? "var(--mauve)" : "var(--plum)", fontFamily: "'Inter', sans-serif", textDecoration: item.is_completed ? "line-through" : "none", marginTop: 2 }}>{item.title}</p>
                        {item.notes && <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 2 }}>{item.notes}</p>}
                      </div>
                      <button onClick={() => handleDelete(item.id)} style={{ color: "var(--mauve)", background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* WEEK VIEW */}
        {tab === "week" && !selectedWeekDay && (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(({ str, d }) => {
              const dayItems = items.filter(i => i.date === str);
              const isToday = str === todayStr;
              return (
                <button key={str} onClick={() => { setSelectedWeekDay(str); setTab("today"); }}
                  style={{ border: `1px solid ${isToday ? "var(--rose-dust)" : "var(--border)"}`, borderRadius: 14, padding: "10px 6px", backgroundColor: isToday ? "var(--rose-dust-subtle)" : "var(--surface)", cursor: "pointer", textAlign: "center", minHeight: 90 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: isToday ? "var(--rose-dust)" : "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>{format(d, "EEE")}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: isToday ? "var(--rose-dust)" : "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{format(d, "d")}</p>
                  <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                    {dayItems.slice(0, 3).map(item => {
                      const cat = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.reminder;
                      return (
                        <div key={item.id} style={{ backgroundColor: cat.bg, borderRadius: 4, padding: "2px 4px" }}>
                          <p style={{ fontSize: 8, fontWeight: 600, color: cat.color, fontFamily: "'Inter', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                        </div>
                      );
                    })}
                    {dayItems.length > 3 && <p style={{ fontSize: 8, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>+{dayItems.length - 3} more</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating + button */}
      {tab !== "week" && !selectedWeekDay && (
        <button onClick={() => { setForm(f => ({ ...f, date: todayStr })); setShowAdd(true); }}
          style={{ position: "fixed", bottom: 100, right: 20, width: 52, height: 52, borderRadius: 9999, backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(42,32,53,0.28)", zIndex: 20 }}>
          <Plus style={{ width: 22, height: 22 }} />
        </button>
      )}

      {/* Add modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
          <div onClick={() => setShowAdd(false)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.45)", backdropFilter: "blur(6px)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", padding: "24px 20px 40px", maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)", margin: "0 auto 20px" }} />
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--plum)" }}>Add item</h3>
              <button onClick={() => setShowAdd(false)} style={{ width: 28, height: 28, borderRadius: 9999, backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Title *"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => {
                  const s = CATEGORY_STYLES[c];
                  return (
                    <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))}
                      style={{ borderRadius: 9999, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", textTransform: "capitalize", fontFamily: "'Inter', sans-serif", backgroundColor: form.category === c ? "var(--plum)" : s.bg, color: form.category === c ? "white" : s.color }}>
                      {c}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Date</p>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Time</p>
                  <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div>
                <p style={{ fontSize: 10, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Repeat</p>
                <div className="flex gap-2 flex-wrap">
                  {REPEAT_OPTIONS.map(r => (
                    <button key={r} onClick={() => setForm(f => ({ ...f, repeat: r }))}
                      style={{ borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", textTransform: "capitalize", fontFamily: "'Inter', sans-serif", backgroundColor: form.repeat === r ? "var(--plum)" : "var(--ivory-dark)", color: form.repeat === r ? "white" : "var(--mauve)" }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <input
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid var(--border)", backgroundColor: "var(--ivory)", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              <button onClick={handleSave} disabled={!form.title.trim()}
                style={{ width: "100%", padding: "13px", borderRadius: 12, backgroundColor: "var(--plum)", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: !form.title.trim() ? 0.5 : 1 }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
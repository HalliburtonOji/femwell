import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, X } from "lucide-react";
import { format, startOfWeek, addDays, parseISO } from "date-fns";

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  health:    { bg: "#DCFCE7", color: "#16A34A" },
  personal:  { bg: "#DBEAFE", color: "#2563EB" },
  work:      { bg: "#EDE9FE", color: "#7C3AED" },
  social:    { bg: "#FFEDD5", color: "#EA580C" },
  wellbeing: { bg: "#FCE7F3", color: "#DB2777" },
  reminder:  { bg: "#F3F4F6", color: "#6B7280" },
};

const CATEGORIES = ["health", "personal", "work", "social", "wellbeing", "reminder"];
const REPEATS = ["once", "daily", "weekly", "monthly"];

function getPhaseTip(lastPeriodDate, cycleLen = 28) {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = parseISO(lastPeriodDate);
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  const day = (diff % cycleLen) + 1;
  if (day <= 5)  return "Schedule gentler tasks today.";
  if (day <= 13) return "Good day for big decisions.";
  if (day <= 16) return "High energy — use it well.";
  return "Build in buffer time.";
}

const todayStr = () => format(new Date(), "yyyy-MM-dd");

// ── AddItemModal ─────────────────────────────────────────────────────────────

function AddItemModal({ onClose, onSave, defaultDate }) {
  const [form, setForm] = useState({
    title: "", category: "reminder", date: defaultDate || todayStr(),
    time: "", repeat: "once", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(42,32,53,0.45)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "relative", width: "100%", backgroundColor: "var(--surface)", borderRadius: "28px 28px 0 0", padding: "24px 20px 36px", zIndex: 1, maxHeight: "90vh", overflowY: "auto" }}>
        {/* Handle + header */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: "var(--border)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "var(--plum)" }}>Add item</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mauve)" }}><X className="w-5 h-5" /></button>
        </div>

        {/* Title */}
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>Title *</label>
        <input
          value={form.title}
          onChange={e => set("title", e.target.value)}
          placeholder="What do you need to do?"
          style={{ display: "block", width: "100%", marginTop: 6, marginBottom: 16, border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "var(--plum)", background: "var(--ivory)", outline: "none", boxSizing: "border-box" }}
        />

        {/* Category */}
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>Category</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 16 }}>
          {CATEGORIES.map(c => {
            const col = CATEGORY_COLORS[c];
            const active = form.category === c;
            return (
              <button key={c} onClick={() => set("category", c)}
                style={{ borderRadius: 9999, padding: "5px 13px", fontSize: 12, fontWeight: 600, border: "1.5px solid", cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize",
                  backgroundColor: active ? col.color : "transparent",
                  borderColor: active ? col.color : "var(--border)",
                  color: active ? "white" : "var(--mauve)" }}>
                {c}
              </button>
            );
          })}
        </div>

        {/* Date + Time */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>Date</label>
            <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 6, border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", background: "var(--ivory)", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>Time</label>
            <input type="time" value={form.time} onChange={e => set("time", e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 6, border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", background: "var(--ivory)", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Repeat */}
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>Repeat</label>
        <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 16 }}>
          {REPEATS.map(r => (
            <button key={r} onClick={() => set("repeat", r)}
              style={{ borderRadius: 9999, padding: "5px 13px", fontSize: 12, fontWeight: 600, border: "1.5px solid", cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize",
                backgroundColor: form.repeat === r ? "var(--plum)" : "transparent",
                borderColor: form.repeat === r ? "var(--plum)" : "var(--border)",
                color: form.repeat === r ? "white" : "var(--mauve)" }}>
              {r}
            </button>
          ))}
        </div>

        {/* Notes */}
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>Notes</label>
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes…" rows={2}
          style={{ display: "block", width: "100%", marginTop: 6, marginBottom: 20, border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif", color: "var(--plum)", background: "var(--ivory)", outline: "none", resize: "none", boxSizing: "border-box" }} />

        <button onClick={handleSave} disabled={!form.title.trim() || saving}
          style={{ width: "100%", padding: "14px", borderRadius: 14, backgroundColor: "var(--plum)", color: "white", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: (!form.title.trim() || saving) ? 0.5 : 1 }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ── PlannerItem row ──────────────────────────────────────────────────────────

function ItemRow({ item, onToggle, onDelete }) {
  const col = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.reminder;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      {/* Checkbox */}
      <button onClick={() => onToggle(item)}
        style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${item.is_completed ? "var(--plum)" : "var(--border)"}`, backgroundColor: item.is_completed ? "var(--plum)" : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {item.is_completed && <span style={{ color: "white", fontSize: 13, lineHeight: 1 }}>✓</span>}
      </button>

      {/* Time */}
      {item.time && (
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", flexShrink: 0, minWidth: 38 }}>{item.time}</span>
      )}

      {/* Category chip */}
      <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 9999, padding: "2px 8px", backgroundColor: col.bg, color: col.color, fontFamily: "'Inter', sans-serif", textTransform: "capitalize", flexShrink: 0 }}>
        {item.category}
      </span>

      {/* Title */}
      <span style={{ flex: 1, fontSize: 14, fontFamily: "'Inter', sans-serif", color: item.is_completed ? "var(--mauve)" : "var(--plum)", fontWeight: item.is_completed ? 400 : 500, textDecoration: item.is_completed ? "line-through" : "none" }}>
        {item.title}
      </span>

      {/* Delete */}
      <button onClick={() => onDelete(item)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mauve)", padding: 4, flexShrink: 0 }}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Planner() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("today");
  const [viewDate, setViewDate] = useState(todayStr());
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [profiles, allItems] = await Promise.all([
        base44.entities.UserProfile.filter({ user_id: u.id }),
        base44.entities.PlannerItems.filter({ user_id: u.id }, "date", 200),
      ]);
      setProfile(profiles[0] || null);
      setItems(allItems);
      setLoading(false);
    })();
  }, []);

  const handleSave = async (form) => {
    const created = await base44.entities.PlannerItems.create({ user_id: user.id, ...form });
    setItems(prev => [...prev, created]);
  };

  const handleToggle = async (item) => {
    const updated = await base44.entities.PlannerItems.update(item.id, { is_completed: !item.is_completed });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_completed: !i.is_completed } : i));
  };

  const handleDelete = async (item) => {
    await base44.entities.PlannerItems.delete(item.id);
    setItems(prev => prev.filter(i => i.id !== item.id));
  };

  // Week days
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    return { date: format(d, "yyyy-MM-dd"), dayName: format(d, "EEE"), dayNum: format(d, "d") };
  });

  // Today tab items
  const todayItems = items
    .filter(it => it.date === viewDate)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const phaseTip = profile?.last_period_start_date
    ? getPhaseTip(profile.last_period_start_date, profile.cycle_avg_length || 28)
    : null;

  const displayDate = viewDate === todayStr()
    ? format(new Date(), "EEEE, d MMMM")
    : format(parseISO(viewDate), "EEEE, d MMMM");

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
           style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div style={{ paddingTop: 40, paddingBottom: 16 }}>
          <p style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            Organisation
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "var(--plum)", letterSpacing: "-0.02em", marginTop: 4 }}>
            My Planner
          </h1>
          <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>
            Stay on top of your day
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, backgroundColor: "var(--ivory-dark)", borderRadius: 14, padding: 4, marginBottom: 20 }}>
          {["today", "week"].map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === "today") setViewDate(todayStr()); }}
              style={{ flex: 1, padding: "9px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "capitalize",
                backgroundColor: tab === t ? "var(--plum)" : "transparent",
                color: tab === t ? "white" : "var(--mauve)" }}>
              {t === "today" ? "Today" : "This Week"}
            </button>
          ))}
        </div>

        {/* ── TODAY TAB ── */}
        {tab === "today" && (
          <>
            {/* Date header */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "var(--plum)" }}>{displayDate}</p>
            </div>

            {/* Phase tip */}
            {phaseTip && (
              <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 14, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                  💜 {phaseTip}
                </p>
              </div>
            )}

            {/* Items list */}
            <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 16px", boxShadow: "var(--shadow-sm)" }}>
              {todayItems.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>No items for this day.</p>
                  <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>Tap + to add one.</p>
                </div>
              ) : (
                todayItems.map(item => (
                  <ItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />
                ))
              )}
            </div>
          </>
        )}

        {/* ── WEEK TAB ── */}
        {tab === "week" && (
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, minWidth: 560 }}>
              {weekDays.map(({ date, dayName, dayNum }) => {
                const dayItems = items.filter(it => it.date === date);
                const isToday = date === todayStr();
                return (
                  <div key={date}
                    onClick={() => { setViewDate(date); setTab("today"); }}
                    style={{ cursor: "pointer", borderRadius: 14, overflow: "hidden", border: `1.5px solid ${isToday ? "var(--rose-dust)" : "var(--border)"}`, backgroundColor: "var(--surface)" }}>
                    {/* Day header */}
                    <div style={{ padding: "8px 6px", textAlign: "center", backgroundColor: isToday ? "var(--rose-dust-subtle)" : "var(--ivory-dark)", borderBottom: "1px solid var(--border-subtle)" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: isToday ? "var(--rose-dust)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{dayName}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: isToday ? "var(--rose-dust)" : "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{dayNum}</p>
                    </div>
                    {/* Chips */}
                    <div style={{ padding: "6px 4px", minHeight: 60, display: "flex", flexDirection: "column", gap: 4 }}>
                      {dayItems.slice(0, 4).map(item => {
                        const col = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.reminder;
                        return (
                          <div key={item.id} style={{ borderRadius: 6, padding: "2px 6px", backgroundColor: col.bg }}>
                            <p style={{ fontSize: 9, fontWeight: 600, color: col.color, fontFamily: "'Inter', sans-serif", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "100%" }}>
                              {item.title.length > 15 ? item.title.slice(0, 15) + "…" : item.title}
                            </p>
                          </div>
                        );
                      })}
                      {dayItems.length > 4 && (
                        <p style={{ fontSize: 9, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", paddingLeft: 4 }}>+{dayItems.length - 4} more</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating + button */}
      <button
        onClick={() => setShowModal(true)}
        style={{ position: "fixed", bottom: 88, right: 20, width: 54, height: 54, borderRadius: "50%", backgroundColor: "var(--plum)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-lg)", zIndex: 40 }}>
        <Plus className="w-6 h-6" />
      </button>

      {/* Add modal */}
      {showModal && (
        <AddItemModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          defaultDate={viewDate}
        />
      )}
    </div>
  );
}
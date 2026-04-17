import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, differenceInDays } from "date-fns";
import { PenLine } from "lucide-react";
import JotterCard from "../components/journal/JotterCard";
import NewEntrySheet from "../components/journal/NewEntrySheet";
import JournalInsightsTab from "../components/journal/JournalInsightsTab";

const FILTER_TYPES = [
  { id: "all",         label: "All" },
  { id: "free",        label: "Free" },
  { id: "gratitude",   label: "Gratitude" },
  { id: "todo",        label: "Todo" },
  { id: "mood",        label: "Mood" },
  { id: "reflection",  label: "Reflection" },
  { id: "dream",       label: "Dream" },
];

function calcStreak(entries) {
  if (!entries.length) return 0;
  const dates = [...new Set(entries.map(e => e.session_date || e.created_date?.split("T")[0]).filter(Boolean))].sort((a,b) => b.localeCompare(a));
  const today = new Date().toISOString().split("T")[0];
  if (dates[0] !== today) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = parseISO(dates[i - 1]);
    const curr = parseISO(dates[i]);
    if (differenceInDays(prev, curr) === 1) streak++;
    else break;
  }
  return streak;
}

function getCurrentPhase(profile) {
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

export default function Journal() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("journal");
  const [filterType, setFilterType] = useState("all");
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [data, profiles] = await Promise.all([
          base44.entities.JournalEntries.filter({ user_id: u.id }, "-created_date", 200).catch(() => []),
          base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []),
        ]);
        setEntries(data);
        setProfile(profiles[0] || null);
      } catch (err) {
        console.error("Journal page init failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const phase = getCurrentPhase(profile);
  const streak = calcStreak(entries);

  const pinnedEntries = entries.filter(e => e.is_pinned);
  const unpinnedEntries = entries.filter(e => !e.is_pinned);

  const filtered = (filterType === "all" ? unpinnedEntries : unpinnedEntries.filter(e => e.card_type === filterType));

  // Split into 2 masonry columns
  const col1 = filtered.filter((_, i) => i % 2 === 0);
  const col2 = filtered.filter((_, i) => i % 2 === 1);

  const handleSaved = (entry) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [entry, ...prev];
    });
  };

  const handleDelete = async (entry) => {
    await base44.entities.JournalEntries.delete(entry.id);
    setEntries(prev => prev.filter(e => e.id !== entry.id));
  };

  const handlePin = async (entry) => {
    const updated = await base44.entities.JournalEntries.update(entry.id, { is_pinned: !entry.is_pinned });
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, is_pinned: !e.is_pinned } : e));
  };

  const handleColorChange = async (entry, color) => {
    await base44.entities.JournalEntries.update(entry.id, { card_color: color });
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, card_color: color } : e));
  };

  const handleTodoToggle = (id, todo_items) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, todo_items } : e));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>

      {/* New / Edit entry sheet */}
      {(showNewEntry || editEntry) && user && (
        <NewEntrySheet
          user={user}
          phase={phase}
          editEntry={editEntry}
          onClose={() => { setShowNewEntry(false); setEditEntry(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="max-w-2xl mx-auto px-4">

        {/* ── Header ── */}
        <div className="pt-10 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--plum)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
                  Journal
                </h1>
              </div>
              {streak > 0 ? (
                <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  {streak} day journaling streak
                </p>
              ) : (
                <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  {format(new Date(), "EEEE, MMMM d")}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowNewEntry(true)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                backgroundColor: "var(--plum)", color: "white",
                borderRadius: 9999, padding: "10px 18px",
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                boxShadow: "0 4px 14px rgba(42,32,53,0.22)",
              }}
            >
              <PenLine style={{ width: 14, height: 14 }} />
              New entry
            </button>
          </div>
        </div>

        {/* ── Top-level tabs: Journal / Insights ── */}
        <div className="flex gap-1 mb-5 p-1 rounded-2xl" style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}>
          {[{ id: "journal", label: "Journal" }, { id: "insights", label: "Insights" }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? "var(--plum)" : "transparent",
                color: activeTab === tab.id ? "white" : "var(--mauve)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── INSIGHTS TAB ── */}
        {activeTab === "insights" && user && (
          <JournalInsightsTab user={user} entries={entries} />
        )}

        {/* ── JOURNAL TAB ── */}
        {activeTab === "journal" && (
          <>
            {/* Filter pills */}
            <style>{`.jfilter-scroll::-webkit-scrollbar{display:none}`}</style>
            <div className="jfilter-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
              {FILTER_TYPES.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  style={{
                    flexShrink: 0, borderRadius: 9999, padding: "6px 14px",
                    fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                    border: "none", cursor: "pointer",
                    backgroundColor: filterType === f.id ? "var(--plum)" : "var(--surface)",
                    color: filterType === f.id ? "white" : "var(--mauve)",
                    boxShadow: filterType === f.id ? "0 2px 8px rgba(42,32,53,0.15)" : "0 1px 3px rgba(42,32,53,0.06)",
                    transition: "all 0.15s",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Empty state */}
            {entries.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: 60, paddingBottom: 40 }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: "var(--rose-dust-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <PenLine style={{ width: 24, height: 24, color: "var(--rose-dust)" }} />
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "var(--plum)", marginBottom: 8 }}>
                  Your journal is waiting
                </h2>
                <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 28 }}>
                  Tap new entry to write your first
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {[{ label: "Free write" }, { label: "Gratitude" }, { label: "Dream log" }].map(t => (
                    <button
                      key={t.label}
                      onClick={() => setShowNewEntry(true)}
                      style={{
                        borderRadius: 14, padding: "12px 18px",
                        backgroundColor: "var(--surface)", border: "1px solid var(--border)",
                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                        color: "var(--plum)", fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pinned strip */}
            {pinnedEntries.length > 0 && filterType === "all" && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>
                  Pinned
                </p>
                <style>{`.pinned-scroll::-webkit-scrollbar{display:none}`}</style>
                <div className="pinned-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
                  {pinnedEntries.map(entry => (
                    <div key={entry.id} style={{ flexShrink: 0, width: 200 }}>
                      <JotterCard
                        entry={entry}
                        onEdit={e => setEditEntry(e)}
                        onDelete={handleDelete}
                        onPin={handlePin}
                        onColorChange={handleColorChange}
                        onTodoToggle={handleTodoToggle}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Masonry grid */}
            {filtered.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {col1.map(entry => (
                    <JotterCard
                      key={entry.id}
                      entry={entry}
                      onEdit={e => setEditEntry(e)}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onColorChange={handleColorChange}
                      onTodoToggle={handleTodoToggle}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {col2.map(entry => (
                    <JotterCard
                      key={entry.id}
                      entry={entry}
                      onEdit={e => setEditEntry(e)}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onColorChange={handleColorChange}
                      onTodoToggle={handleTodoToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && entries.length > 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  No {filterType} entries yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
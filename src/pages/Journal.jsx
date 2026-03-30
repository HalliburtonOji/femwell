import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, subDays } from "date-fns";
import { Lock } from "lucide-react";
import JournalComposer from "../components/journal/JournalComposer";
import JournalEntryCard from "../components/journal/JournalEntryCard";
import JournalEntrySheet from "../components/journal/JournalEntrySheet";
import JournalInsightsTab from "../components/journal/JournalInsightsTab";

const MOOD_MAP = {
  1: { label: "Calm",      accent: "var(--sage)" },
  2: { label: "Stressed",  accent: "#C4884A" },
  3: { label: "Low",       accent: "#8A96B8" },
  4: { label: "Energized", accent: "#B8A040" },
  5: { label: "Angry",     accent: "#B85050" },
  6: { label: "Anxious",   accent: "#9A7AB8" },
};

function groupByDate(entries) {
  const groups = {};
  entries.forEach((e) => {
    const key = e.session_date || e.created_date?.split("T")[0] || "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function formatGroupLabel(dateStr) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = subDays(new Date(), 1).toISOString().split("T")[0];
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  try { return format(parseISO(dateStr), "EEEE, MMMM d"); } catch { return dateStr; }
}

const card = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-sm)",
};

const sLabel = {
  fontSize: "0.6rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--mauve)",
  fontFamily: "'Inter', sans-serif",
};

export default function Journal() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("write");
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Library state
  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState(null);
  const [filterTag, setFilterTag] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const data = await base44.entities.JournalEntries.filter({ user_id: u.id }, "-created_date", 100);
      setEntries(data);
      setLoading(false);
    })();
  }, []);

  const handleSaved = (entry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  // Derived
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const entriesThisWeek = entries.filter((e) => {
    try {
      const d = e.session_date ? parseISO(e.session_date) : new Date(e.created_date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    } catch { return false; }
  });

  const filteredEntries = entries.filter((e) => {
    const text = (e.text || "").toLowerCase();
    const tags = e.tags ? e.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    if (search && !text.includes(search.toLowerCase()) && !tags.some(t => t.includes(search.toLowerCase()))) return false;
    if (filterMood && e.mood_rating !== filterMood) return false;
    if (filterTag && !tags.includes(filterTag)) return false;
    return true;
  });

  const grouped = groupByDate(filteredEntries);

  // On This Day
  const today = new Date();
  const onThisDayLastMonth = entries.find((e) => {
    try {
      const d = e.session_date ? parseISO(e.session_date) : new Date(e.created_date);
      const lastMonth = new Date(today); lastMonth.setMonth(lastMonth.getMonth() - 1);
      return d.getDate() === lastMonth.getDate() && d.getMonth() === lastMonth.getMonth();
    } catch { return false; }
  });

  // All unique tags
  const allTags = [...new Set(entries.flatMap(e => e.tags ? e.tags.split(",").map(t => t.trim()).filter(Boolean) : []))];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--rose-dust-light)", borderTopColor: "var(--rose-dust)" }} />
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "var(--ivory)" }}>
      {selectedEntry && (
        <JournalEntrySheet entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}

      <div className="max-w-2xl mx-auto px-4">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="pt-10 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <p style={sLabel} className="mb-1.5">Private Studio</p>
              <h1 className="text-2xl font-bold leading-tight"
                style={{ fontFamily: "'Playfair Display', serif", color: "var(--plum)", letterSpacing: "-0.02em" }}>
                Journal
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                {format(new Date(), "EEEE, MMMM d")}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 mt-1"
              style={{ backgroundColor: "var(--ivory-dark)", border: "1px solid var(--border)" }}>
              <Lock className="w-3 h-3" style={{ color: "var(--mauve)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>Private</span>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex gap-4 mt-5">
            {[
              { label: "this week", value: entriesThisWeek.length },
              { label: "total entries", value: entries.length },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xl font-bold" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>{value}</p>
                <p style={sLabel}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab Nav ─────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl" style={card}>
          {[
            { id: "write",    label: "Write"    },
            { id: "library",  label: "Library"  },
            { id: "insights", label: "Insights" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? "var(--plum)" : "transparent",
                color: activeTab === tab.id ? "white" : "var(--mauve)",
                fontFamily: "'Inter', sans-serif",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── WRITE TAB ───────────────────────────────────────────────── */}
        {activeTab === "write" && user && (
          <JournalComposer user={user} onSaved={handleSaved} />
        )}

        {/* ── LIBRARY TAB ─────────────────────────────────────────────── */}
        {activeTab === "library" && (
          <div className="space-y-5">

            {/* On This Day */}
            {onThisDayLastMonth && (
              <div className="rounded-[20px] p-4" style={{ ...card, backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)" }}>
                <p style={{ ...sLabel, color: "var(--rose-dust)" }} className="mb-1">On This Day Last Month</p>
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                  {onThisDayLastMonth.text?.slice(0, 120)}{onThisDayLastMonth.text?.length > 120 ? "…" : ""}
                </p>
                <button onClick={() => setSelectedEntry(onThisDayLastMonth)}
                  className="text-xs font-semibold mt-2 underline-offset-2"
                  style={{ color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif" }}>
                  Read entry
                </button>
              </div>
            )}

            {/* Search */}
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries…"
                className="flex-1 px-4 py-2.5 rounded-2xl text-sm focus:outline-none"
                style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="px-3 rounded-2xl text-xs font-medium"
                  style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", border: "1px solid var(--border)" }}>
                  Clear
                </button>
              )}
            </div>

            {/* Mood filter */}
            <div>
              <p style={sLabel} className="mb-2">Filter by mood</p>
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(MOOD_MAP).map(([key, m]) => (
                  <button key={key} onClick={() => setFilterMood(filterMood === Number(key) ? null : Number(key))}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: filterMood === Number(key) ? m.accent : "var(--surface)",
                      color: filterMood === Number(key) ? "white" : "var(--mauve)",
                      border: `1px solid ${filterMood === Number(key) ? m.accent : "var(--border)"}`,
                      fontFamily: "'Inter', sans-serif",
                    }}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <div>
                <p style={sLabel} className="mb-2">Filter by tag</p>
                <div className="flex gap-1.5 flex-wrap">
                  {allTags.map((tag) => (
                    <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                      style={{
                        backgroundColor: filterTag === tag ? "var(--plum)" : "var(--surface)",
                        color: filterTag === tag ? "white" : "var(--mauve)",
                        border: `1px solid ${filterTag === tag ? "var(--plum)" : "var(--border)"}`,
                        fontFamily: "'Inter', sans-serif",
                      }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Entries */}
            {grouped.length === 0 ? (
              <div className="rounded-[20px] p-10 text-center" style={card}>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                  {entries.length === 0 ? "No entries yet" : "Nothing matches your filters"}
                </p>
                <p className="text-xs" style={{ color: "var(--mauve)" }}>
                  {entries.length === 0 ? "Your first entry is waiting in Write." : "Try clearing a filter."}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {grouped.map(([date, dayEntries]) => (
                  <div key={date}>
                    <p className="text-xs font-semibold mb-2.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em" }}>
                      {formatGroupLabel(date)}
                    </p>
                    <div className="space-y-2">
                      {dayEntries.map((entry) => (
                        <JournalEntryCard key={entry.id} entry={entry} onClick={setSelectedEntry} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INSIGHTS TAB ────────────────────────────────────────────── */}
        {activeTab === "insights" && user && (
          <JournalInsightsTab user={user} entries={entries} />
        )}
      </div>
    </div>
  );
}
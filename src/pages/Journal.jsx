import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, BookOpen, Sparkles, PenLine } from "lucide-react";
import { format, parseISO } from "date-fns";
import JournalComposer from "../components/journal/JournalComposer";
import JournalEntryCard from "../components/journal/JournalEntryCard";
import JournalEntrySheet from "../components/journal/JournalEntrySheet";
import AICoachTab from "../components/journal/AICoachTab";

const TABS = [
  { id: "journal", label: "Journal", icon: PenLine },
  { id: "coach", label: "My Coach", icon: Sparkles },
];

function groupByDate(entries) {
  const groups = {};
  entries.forEach((e) => {
    const key = e.session_date || e.created_date?.split("T")[0] || "unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

export default function Journal() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("journal");
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      const data = await base44.entities.JournalEntries.filter({ user_id: u.id }, "-created_date", 50);
      setEntries(data);
      setLoading(false);
    })();
  }, []);

  const handleSaved = (entry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const grouped = groupByDate(entries);

  const formatGroupDate = (dateStr) => {
    if (dateStr === new Date().toISOString().split("T")[0]) return "Today";
    try { return format(parseISO(dateStr), "EEEE, MMMM d"); } catch { return dateStr; }
  };

  if (loading) return (
    <div className="min-h-screen femwell-gradient flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen femwell-gradient pb-28">
      {selectedEntry && (
        <JournalEntrySheet entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}

      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-12 pb-4 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-rose-900">Journal</h1>
            <p className="text-xs text-gray-400">{entries.length} {entries.length === 1 ? "entry" : "entries"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white/60 rounded-2xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id ? "bg-rose-500 text-white shadow-sm" : "text-gray-500 hover:bg-rose-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* JOURNAL TAB */}
        {activeTab === "journal" && (
          <div className="space-y-6">
            <JournalComposer user={user} onSaved={handleSaved} />

            {entries.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-10 h-10 text-rose-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Your journal is empty.</p>
                <p className="text-gray-300 text-xs mt-1">Write your first entry above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {grouped.map(([date, dayEntries]) => (
                  <div key={date}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      {formatGroupDate(date)}
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

        {/* AI COACH TAB */}
        {activeTab === "coach" && user && (
          <AICoachTab user={user} />
        )}
      </div>
    </div>
  );
}
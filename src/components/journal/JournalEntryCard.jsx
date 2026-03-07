import { format, parseISO } from "date-fns";

const MOOD_MAP = {
  1: { label: "Calm", emoji: "😌", color: "bg-sky-100 text-sky-600", bar: "bg-sky-400" },
  2: { label: "Stressed", emoji: "😰", color: "bg-orange-100 text-orange-600", bar: "bg-orange-400" },
  3: { label: "Low", emoji: "😔", color: "bg-blue-100 text-blue-600", bar: "bg-blue-400" },
  4: { label: "Energized", emoji: "✨", color: "bg-yellow-100 text-yellow-600", bar: "bg-yellow-400" },
  5: { label: "Angry", emoji: "😤", color: "bg-red-100 text-red-600", bar: "bg-red-400" },
  6: { label: "Anxious", emoji: "😟", color: "bg-purple-100 text-purple-600", bar: "bg-purple-400" },
};

export default function JournalEntryCard({ entry, onClick }) {
  const mood = entry.mood_rating ? MOOD_MAP[entry.mood_rating] : null;
  const tags = entry.tags ? entry.tags.split(",").filter(Boolean) : [];
  const snippet = entry.text?.length > 100 ? entry.text.slice(0, 100) + "…" : entry.text;
  const dateStr = entry.session_date
    ? format(parseISO(entry.session_date), "EEE, MMM d")
    : entry.created_date
    ? format(new Date(entry.created_date), "EEE, MMM d")
    : "";

  return (
    <button
      onClick={() => onClick(entry)}
      className="w-full text-left card-glass rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Left accent bar by mood */}
      <div className="flex">
        <div className={`w-1 flex-shrink-0 ${mood?.bar || "bg-rose-200"}`} />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-xs text-gray-400">{dateStr}</p>
            {mood && (
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${mood.color}`}>
                {mood.emoji} {mood.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{snippet}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 3).map((t) => (
                <span key={t} className="text-xs bg-rose-50 text-rose-400 px-2 py-0.5 rounded-full capitalize">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
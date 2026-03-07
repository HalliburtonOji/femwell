import { format, parseISO } from "date-fns";
import { X } from "lucide-react";

const MOOD_MAP = {
  1: { label: "Calm", emoji: "😌", color: "bg-sky-100 text-sky-600" },
  2: { label: "Stressed", emoji: "😰", color: "bg-orange-100 text-orange-600" },
  3: { label: "Low", emoji: "😔", color: "bg-blue-100 text-blue-600" },
  4: { label: "Energized", emoji: "✨", color: "bg-yellow-100 text-yellow-600" },
  5: { label: "Angry", emoji: "😤", color: "bg-red-100 text-red-600" },
  6: { label: "Anxious", emoji: "😟", color: "bg-purple-100 text-purple-600" },
};

export default function JournalEntrySheet({ entry, onClose }) {
  if (!entry) return null;
  const mood = entry.mood_rating ? MOOD_MAP[entry.mood_rating] : null;
  const tags = entry.tags ? entry.tags.split(",").filter(Boolean) : [];
  const dateStr = entry.session_date
    ? format(parseISO(entry.session_date), "EEEE, MMMM d, yyyy")
    : entry.created_date
    ? format(new Date(entry.created_date), "EEEE, MMMM d, yyyy")
    : "";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">{dateStr}</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {mood && (
          <span className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-medium ${mood.color}`}>
            {mood.emoji} {mood.label}
          </span>
        )}

        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{entry.text}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {tags.map((t) => (
              <span key={t} className="text-xs bg-rose-50 text-rose-400 px-2 py-1 rounded-full capitalize">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
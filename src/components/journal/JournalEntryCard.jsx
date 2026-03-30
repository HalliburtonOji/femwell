import { format, parseISO } from "date-fns";

const MOOD_MAP = {
  1: { label: "Calm",      accent: "var(--sage)",      subtle: "var(--sage-subtle)"     },
  2: { label: "Stressed",  accent: "#C4884A",           subtle: "#FFF4EC"                },
  3: { label: "Low",       accent: "#8A96B8",           subtle: "#EEF0F8"                },
  4: { label: "Energized", accent: "#B8A040",           subtle: "#F8F4E0"                },
  5: { label: "Angry",     accent: "#B85050",           subtle: "#F8EDED"                },
  6: { label: "Anxious",   accent: "var(--rose-dust)", subtle: "var(--rose-dust-subtle)" },
};

export default function JournalEntryCard({ entry, onClick }) {
  const mood = entry.mood_rating ? MOOD_MAP[entry.mood_rating] : null;
  const tags = entry.tags ? entry.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  const snippet = entry.text?.length > 120 ? entry.text.slice(0, 120) + "…" : entry.text;
  const dateStr = entry.session_date
    ? format(parseISO(entry.session_date), "EEE, MMM d")
    : entry.created_date
    ? format(new Date(entry.created_date), "EEE, MMM d")
    : "";

  return (
    <button
      onClick={() => onClick(entry)}
      className="w-full text-left rounded-[20px] overflow-hidden transition-all"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
    >
      <div className="flex">
        {/* Mood accent bar */}
        <div className="w-0.5 flex-shrink-0" style={{ backgroundColor: mood?.accent || "var(--border)" }} />
        <div className="flex-1 p-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <p className="text-xs" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{dateStr}</p>
            {mood && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{
                  backgroundColor: mood.subtle,
                  color: mood.accent,
                  fontFamily: "'Inter', sans-serif",
                }}>
                {mood.label}
              </span>
            )}
          </div>

          {/* Snippet */}
          <p className="text-sm leading-relaxed"
            style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif", lineHeight: "1.6" }}>
            {snippet}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {tags.slice(0, 4).map((t) => (
                <span key={t}
                  className="text-xs px-2.5 py-0.5 rounded-full capitalize"
                  style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
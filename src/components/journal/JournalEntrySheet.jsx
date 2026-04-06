import { useState } from "react";
import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MOOD_MAP = {
  1: { label: "Calm",      accent: "var(--sage)",      subtle: "var(--sage-subtle)"      },
  2: { label: "Stressed",  accent: "#C4884A",           subtle: "#FFF4EC"                 },
  3: { label: "Low",       accent: "#8A96B8",           subtle: "#EEF0F8"                 },
  4: { label: "Energized", accent: "#B8A040",           subtle: "#F8F4E0"                 },
  5: { label: "Angry",     accent: "#B85050",           subtle: "#F8EDED"                 },
  6: { label: "Anxious",   accent: "var(--rose-dust)",  subtle: "var(--rose-dust-subtle)" },
};

export default function JournalEntrySheet({ entry, onClose }) {
  const [appendMode, setAppendMode] = useState(false);
  const [appendText, setAppendText] = useState("");
  const [saving, setSaving] = useState(false);

  if (!entry) return null;

  const mood = entry.mood_rating ? MOOD_MAP[entry.mood_rating] : null;
  const tags = entry.tags ? entry.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  const dateStr = entry.session_date
    ? format(parseISO(entry.session_date), "EEEE, MMMM d, yyyy")
    : entry.created_date
    ? format(new Date(entry.created_date), "EEEE, MMMM d, yyyy")
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(42,32,53,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-[32px] max-h-[88vh] flex flex-col"
        style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow-lg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: "var(--border)" }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-3 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em" }}>
              {dateStr}
            </p>
            {mood && (
              <span className="inline-flex text-xs px-2.5 py-1 rounded-full font-semibold mt-1"
                style={{ backgroundColor: mood.subtle, color: mood.accent, fontFamily: "'Inter', sans-serif" }}>
                {mood.label}
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <p className="leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", lineHeight: "1.8" }}>
            {entry.text}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              {tags.map((t) => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full capitalize"
                  style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer — continue writing */}
        <div style={{ flexShrink: 0, padding: "12px 20px 28px", borderTop: "1px solid var(--border-subtle)" }}>
          {!appendMode ? (
            <button
              onClick={() => setAppendMode(true)}
              style={{ width: "100%", height: 44, borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--plum)", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>
              Continue writing
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <textarea
                rows={4}
                value={appendText}
                onChange={e => setAppendText(e.target.value)}
                placeholder="Add more to this entry..."
                autoFocus
                style={{ width: "100%", borderRadius: 14, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", color: "var(--plum)", fontSize: 14, fontFamily: "'Inter', sans-serif", padding: "12px", resize: "none", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setAppendMode(false); setAppendText(""); }}
                  style={{ flex: 1, height: 44, borderRadius: 9999, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--plum)", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>
                  Cancel
                </button>
                <button
                  disabled={!appendText.trim() || saving}
                  onClick={async () => {
                    if (!appendText.trim()) return;
                    setSaving(true);
                    const newText = entry.text ? `${entry.text}\n\n---\n\n${appendText.trim()}` : appendText.trim();
                    await base44.entities.JournalEntries.update(entry.id, { text: newText });
                    entry.text = newText;
                    setAppendMode(false);
                    setAppendText("");
                    setSaving(false);
                  }}
                  style={{ flex: 1, height: 44, borderRadius: 9999, border: "none", backgroundColor: "var(--plum)", color: "white", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: "pointer", opacity: (!appendText.trim() || saving) ? 0.5 : 1 }}>
                  {saving ? "Saving..." : "Add to entry"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { base44 } from "@/api/base44Client";

// Mood data — numbers must stay compatible with existing entries
const MOODS = [
  { value: "calm",      rating: 1, label: "Calm",      accent: "var(--sage)",           subtle: "var(--sage-subtle)"          },
  { value: "stressed",  rating: 2, label: "Stressed",  accent: "#C4884A",               subtle: "#FFF4EC"                     },
  { value: "low",       rating: 3, label: "Low",       accent: "#8A96B8",               subtle: "#EEF0F8"                     },
  { value: "energized", rating: 4, label: "Energized", accent: "#B8A040",               subtle: "#F8F4E0"                     },
  { value: "angry",     rating: 5, label: "Angry",     accent: "#B85050",               subtle: "#F8EDED"                     },
  { value: "anxious",   rating: 6, label: "Anxious",   accent: "var(--rose-dust)",      subtle: "var(--rose-dust-subtle)"     },
];

const TAGS = ["gratitude", "self-care", "cycle", "sleep", "relationships", "work", "body", "emotions", "growth"];

const MODES = [
  { id: "free",    label: "Free Write",       hint: "Write freely, without direction." },
  { id: "dump",    label: "Brain Dump",        hint: "Get everything out of your head."  },
  { id: "gratitude", label: "Gratitude",      hint: "What are you grateful for today?"   },
  { id: "body",    label: "Body Check-In",    hint: "How does your body feel right now?" },
  { id: "cycle",   label: "Cycle Reflection", hint: "Notice what your body is telling you." },
  { id: "wins",    label: "Small Wins",       hint: "Acknowledge what went right, however small." },
];

const PROMPTS = [
  "What feels heavier than it needs to today?",
  "What helped me feel like myself today?",
  "What does my body seem to be asking for?",
  "What am I proud of, even if it was small?",
  "What has felt easier this week?",
  "What pattern do I want to notice without judging it?",
];

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

export default function JournalComposer({ user, onSaved }) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState(null);
  const [tags, setTags] = useState([]);
  const [mode, setMode] = useState("free");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeMode = MODES.find(m => m.id === mode);
  const toggleTag = (tag) => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const moodObj = MOODS.find(m => m.value === mood);
    const entry = await base44.entities.JournalEntries.create({
      user_id: user.id,
      content_id: "free_entry",
      text: text.trim(),
      mood_rating: moodObj ? moodObj.rating : undefined,
      tags: tags.join(","),
      session_date: new Date().toISOString().split("T")[0],
    });
    setSaving(false);
    setSaved(true);
    setText("");
    setMood(null);
    setTags([]);
    setTimeout(() => setSaved(false), 2500);
    if (onSaved) onSaved(entry);
  };

  return (
    <div className="space-y-4">

      {/* Journaling modes */}
      <div>
        <p style={sLabel} className="mb-2.5">Writing mode</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="rounded-[16px] p-3.5 text-left transition-all"
              style={{
                backgroundColor: mode === m.id ? "var(--plum)" : "var(--surface)",
                border: `1.5px solid ${mode === m.id ? "var(--plum)" : "var(--border)"}`,
                boxShadow: mode === m.id ? "var(--shadow-md)" : "var(--shadow-sm)",
              }}>
              <p className="text-xs font-semibold leading-tight"
                style={{ color: mode === m.id ? "white" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                {m.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt suggestions */}
      <div>
        <p style={sLabel} className="mb-2.5">Prompts</p>
        <div className="space-y-1.5">
          {PROMPTS.slice(0, 3).map((p) => (
            <button key={p} onClick={() => setText((t) => t ? t : p + " ")}
              className="w-full text-left px-4 py-3 rounded-[14px] text-sm leading-relaxed transition-all"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--plum)",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--rose-dust-light)"; e.currentTarget.style.backgroundColor = "var(--rose-dust-subtle)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.backgroundColor = "var(--surface)"; }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Writing composer */}
      <div className="rounded-[24px] overflow-hidden" style={card}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-xs" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
            {activeMode?.hint}
          </p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Begin writing…"
          rows={7}
          className="w-full p-5 bg-transparent resize-none focus:outline-none"
          style={{
            color: "var(--plum)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.9375rem",
            lineHeight: "1.75",
            letterSpacing: "0.005em",
          }}
        />
      </div>

      {/* Mood */}
      <div>
        <p style={sLabel} className="mb-2.5">How are you feeling?</p>
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map((m) => (
            <button key={m.value} onClick={() => setMood(mood === m.value ? null : m.value)}
              className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: mood === m.value ? m.accent : "var(--surface)",
                color: mood === m.value ? "white" : "var(--mauve)",
                border: `1.5px solid ${mood === m.value ? m.accent : "var(--border)"}`,
                fontFamily: "'Inter', sans-serif",
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <p style={sLabel} className="mb-2.5">Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
              style={{
                backgroundColor: tags.includes(tag) ? "var(--plum)" : "var(--surface)",
                color: tags.includes(tag) ? "white" : "var(--mauve)",
                border: `1px solid ${tags.includes(tag) ? "var(--plum)" : "var(--border)"}`,
                fontFamily: "'Inter', sans-serif",
              }}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!text.trim() || saving}
        className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all"
        style={{
          backgroundColor: saved ? "var(--sage)" : "var(--plum)",
          color: "white",
          fontFamily: "'Inter', sans-serif",
          opacity: (!text.trim() || saving) ? 0.45 : 1,
          boxShadow: "0 4px 14px rgba(42,32,53,0.18)",
        }}>
        {saving ? "Saving…" : saved ? "Saved" : "Save Entry"}
      </button>
    </div>
  );
}
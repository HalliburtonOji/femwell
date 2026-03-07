import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, X } from "lucide-react";

const MOODS = [
  { value: "calm", label: "Calm", emoji: "😌", color: "bg-sky-100 text-sky-600" },
  { value: "stressed", label: "Stressed", emoji: "😰", color: "bg-orange-100 text-orange-600" },
  { value: "low", label: "Low", emoji: "😔", color: "bg-blue-100 text-blue-600" },
  { value: "energized", label: "Energized", emoji: "✨", color: "bg-yellow-100 text-yellow-600" },
  { value: "angry", label: "Angry", emoji: "😤", color: "bg-red-100 text-red-600" },
  { value: "anxious", label: "Anxious", emoji: "😟", color: "bg-purple-100 text-purple-600" },
];

const TAGS = ["gratitude", "self-care", "cycle", "sleep", "relationships", "work", "body", "emotions", "growth"];

const PROMPTS = [
  "What happened today?",
  "What do I need right now?",
  "What's one small win?",
  "How does my body feel?",
];

export default function JournalComposer({ user, onSaved }) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState(null);
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag) => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const entry = await base44.entities.JournalEntries.create({
      user_id: user.id,
      text: text.trim(),
      mood_rating: mood ? MOODS.findIndex((m) => m.value === mood) + 1 : undefined,
      tags: tags.join(","),
      session_date: new Date().toISOString().split("T")[0],
    });
    setSaving(false);
    setText("");
    setMood(null);
    setTags([]);
    if (onSaved) onSaved(entry);
  };

  return (
    <div className="card-glass rounded-3xl p-5 space-y-4 shadow-sm">
      {/* Prompt pills */}
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => setText((t) => t ? t : p + " ")}
            className="text-xs px-3 py-1.5 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 transition-colors font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write it out…"
        rows={4}
        className="w-full bg-transparent text-gray-700 text-sm leading-relaxed resize-none focus:outline-none placeholder:text-gray-300"
      />

      {/* Mood */}
      <div>
        <p className="text-xs text-gray-400 mb-2 font-medium">How are you feeling?</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(mood === m.value ? null : m.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                mood === m.value ? m.color + " ring-2 ring-offset-1 ring-rose-300" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className="text-xs text-gray-400 mb-2 font-medium">Tags</p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                tags.includes(tag) ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-500"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!text.trim() || saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-semibold disabled:opacity-40 shadow-md hover:shadow-lg transition-shadow"
      >
        <Send className="w-4 h-4" />
        {saving ? "Saving..." : "Save Entry"}
      </button>
    </div>
  );
}
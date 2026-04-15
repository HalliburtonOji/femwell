import { useState, useEffect } from "react";
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
  const [dailyPrompt, setDailyPrompt] = useState(null);
  const [loadingPrompt, setLoadingPrompt] = useState(true);
  const [savedEntryText, setSavedEntryText] = useState(null);
  const [aiReflection, setAiReflection] = useState(null);
  const [loadingReflection, setLoadingReflection] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let phase = '';
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
        const p = profiles[0];
        if (p?.last_period_start_date) {
          const cycleLen = p.cycle_avg_length || 28;
          const diff = Math.floor((Date.now() - new Date(p.last_period_start_date).getTime()) / 86400000);
          const day = (diff % cycleLen) + 1;
          phase = day <= (p.period_length || 5) ? 'menstrual' : day <= 13 ? 'follicular' : day <= 16 ? 'ovulatory' : 'luteal';
        }
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate one thoughtful, open-ended journaling prompt for a woman. It should invite reflection on emotions, relationships, or personal growth. It should be specific and evocative, not generic.${phase ? ` Current cycle phase: ${phase}.` : ''} Return JSON: { prompt: string } — max 25 words.`,
          response_json_schema: { type: 'object', properties: { prompt: { type: 'string' } } },
        });
        if (res?.prompt) setDailyPrompt(res.prompt);
      } catch {}
      setLoadingPrompt(false);
    })();
  }, []);

  const activeMode = MODES.find(m => m.id === mode);
  const toggleTag = (tag) => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const moodObj = MOODS.find(m => m.value === mood);
    const entryText = text.trim();
    const entry = await base44.entities.JournalEntries.create({
      user_id: user.id,
      content_id: "free_entry",
      card_type: "free",
      card_color: "lavender",
      text: entryText,
      mood_rating: moodObj ? moodObj.rating : undefined,
      tags: tags,
      session_date: new Date().toISOString().split("T")[0],
    });
    setSaving(false);
    setSaved(true);
    setSavedEntryText(entryText);
    setAiReflection(null);
    setText("");
    setMood(null);
    setTags([]);
    setTimeout(() => setSaved(false), 2500);
    if (onSaved) onSaved(entry);
  };

  const handleGetReflection = async () => {
    if (!savedEntryText) return;
    setLoadingReflection(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `A woman wrote this journal entry: "${savedEntryText.slice(0, 600)}". Give a warm, 2-sentence reflection that acknowledges what she wrote and offers one gentle, empowering insight. Do not be prescriptive. Tone: like a wise friend.`,
      });
      setAiReflection(res);
    } catch {}
    setLoadingReflection(false);
  };

  return (
    <div className="space-y-4">

      {/* Daily prompt */}
      {!loadingPrompt && dailyPrompt && (
        <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 16, padding: "14px 16px" }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--rose-dust)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>Today's prompt</p>
          <p style={{ fontSize: 14, fontFamily: "'Playfair Display', serif", color: "var(--plum)", fontStyle: "italic", lineHeight: 1.5, marginBottom: 8 }}>{dailyPrompt}</p>
          <button
            onClick={() => setText(t => t ? t : dailyPrompt + ' ')}
            style={{ background: "transparent", border: "none", color: "var(--rose-dust)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", padding: 0 }}>
            Use this
          </button>
        </div>
      )}

      {/* AI reflection after save */}
      {savedEntryText && (
        <div style={{ backgroundColor: "var(--mauve-subtle)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
          <button
            onClick={handleGetReflection}
            disabled={loadingReflection}
            style={{ backgroundColor: "var(--plum)", color: "white", borderRadius: 9999, padding: "8px 16px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", opacity: loadingReflection ? 0.6 : 1 }}>
            {loadingReflection ? "Reflecting..." : "Get a reflection on this entry"}
          </button>
          {aiReflection && (
            <p style={{ fontSize: 14, color: "var(--plum)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif", fontStyle: "italic", marginTop: 12 }}>{aiReflection}</p>
          )}
        </div>
      )}

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
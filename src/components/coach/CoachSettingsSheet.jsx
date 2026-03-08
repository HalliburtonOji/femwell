import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Check, Sparkles } from "lucide-react";

const ARCHETYPES = [
  {
    id: "empathetic",
    label: "Empathetic Listener",
    emoji: "💛",
    description: "Warm, validating, and supportive. Focuses on how you feel.",
  },
  {
    id: "motivator",
    label: "Direct Motivator",
    emoji: "🔥",
    description: "Energetic, challenging, and action-focused. Pushes you forward.",
  },
  {
    id: "analyst",
    label: "Data-Driven Analyst",
    emoji: "📊",
    description: "Logical, evidence-based, uses your tracked data to guide advice.",
  },
  {
    id: "nurturing",
    label: "Gentle Nurturer",
    emoji: "🌸",
    description: "Soft, patient, and holistic. Takes a self-compassion approach.",
  },
  {
    id: "bestie",
    label: "My Twin / Bestie",
    emoji: "👯",
    description: "Mirrors your vibe and language. Funny, real, like texting your bestie who knows health stuff.",
  },
];

const TONES = ["Warm", "Neutral", "Direct", "Encouraging", "Calm"];

export default function CoachSettingsSheet({ user, onClose, onSaved }) {
  const [coachName, setCoachName] = useState(user.coach_name || "Luna");
  const [archetype, setArchetype] = useState(user.coach_archetype || "empathetic");
  const [tone, setTone] = useState(user.coach_tone || "Warm");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      coach_name: coachName.trim() || "Luna",
      coach_archetype: archetype,
      coach_tone: tone,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      onSaved({ coach_name: coachName.trim() || "Luna", coach_archetype: archetype, coach_tone: tone });
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-3xl px-5 py-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-gray-800">Coach Settings</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Coach name */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Coach Name</label>
          <input
            type="text"
            value={coachName}
            onChange={(e) => setCoachName(e.target.value)}
            placeholder="e.g. Luna, Sage, Alex..."
            maxLength={20}
            className="w-full p-3 rounded-2xl border border-rose-100 bg-rose-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 text-gray-700"
          />
          <p className="text-[11px] text-gray-400 mt-1">Give your coach a name you love.</p>
        </div>

        {/* Archetype */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Coaching Style</label>
          <div className="space-y-2">
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                onClick={() => setArchetype(a.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                  archetype === a.id
                    ? "border-rose-400 bg-rose-50"
                    : "border-transparent bg-gray-50 hover:bg-rose-50/50"
                }`}
              >
                <span className="text-2xl flex-shrink-0">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.description}</p>
                </div>
                {archetype === a.id && <Check className="w-4 h-4 text-rose-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Preferred Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  tone === t ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-rose-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2"
        >
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? "Saving…" : "Save Coach Settings"}
        </button>
      </div>
    </div>
  );
}
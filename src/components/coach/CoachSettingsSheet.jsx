import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Check } from "lucide-react";

const STYLES = [
  { id: "empathetic", label: "Warm & supportive",    desc: "Listens deeply and validates how you feel."           },
  { id: "motivator",  label: "Direct & action-focused", desc: "Challenges you, pushes you toward the next step."  },
  { id: "analyst",    label: "Data-driven",           desc: "Evidence-based. Leans into your tracked data."        },
  { id: "nurturing",  label: "Gentle & holistic",     desc: "Patient, self-compassionate, and whole-person."       },
  { id: "bestie",     label: "Real & casual",         desc: "Conversational, honest, like a knowledgeable friend." },
];

const TONES = ["Warm", "Neutral", "Direct", "Encouraging", "Calm"];

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function GuideSettingsSheet({ user, onClose, onSaved }) {
  const [guideName, setGuideName] = useState(user.coach_name || "Guide");
  const [archetype, setArchetype]  = useState(user.coach_archetype || "empathetic");
  const [tone, setTone]            = useState(user.coach_tone || "Warm");
  const [saving, setSaving]        = useState(false);
  const [saved, setSaved]          = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      coach_name: guideName.trim() || "Guide",
      coach_archetype: archetype,
      coach_tone: tone,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      onSaved({ coach_name: guideName.trim() || "Guide", coach_archetype: archetype, coach_tone: tone });
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(42,32,53,0.4)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-t-[28px] px-5 py-6 max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow-lg)" }}
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="w-8 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: "var(--border)" }} />

        <div className="flex items-center justify-between mb-6">
          <p className="font-semibold" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>Personalise your Guide</p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Name */}
        <div className="mb-5">
          <p style={sLabel} className="mb-2">Guide name</p>
          <input type="text" value={guideName}
            onChange={e => setGuideName(e.target.value)}
            placeholder="e.g. Guide, Sage, Luna…"
            maxLength={20}
            className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none"
            style={{
              backgroundColor: "var(--ivory)",
              border: "1.5px solid var(--border)",
              color: "var(--plum)",
              fontFamily: "'Inter', sans-serif",
            }}
            onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />
          <p className="text-[11px] mt-1.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>What you'd like to call your guide.</p>
        </div>

        {/* Style */}
        <div className="mb-5">
          <p style={sLabel} className="mb-2.5">Response style</p>
          <div className="space-y-1.5">
            {STYLES.map(s => (
              <button key={s.id} onClick={() => setArchetype(s.id)}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all"
                style={{
                  backgroundColor: archetype === s.id ? "var(--plum)" : "var(--ivory)",
                  border: `1.5px solid ${archetype === s.id ? "var(--plum)" : "var(--border)"}`,
                }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: archetype === s.id ? "white" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>
                    {s.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: archetype === s.id ? "rgba(255,255,255,0.65)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                    {s.desc}
                  </p>
                </div>
                {archetype === s.id && <Check className="w-4 h-4 flex-shrink-0 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-6">
          <p style={sLabel} className="mb-2.5">Tone</p>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: tone === t ? "var(--plum)" : "var(--ivory)",
                  color: tone === t ? "white" : "var(--mauve)",
                  border: `1px solid ${tone === t ? "var(--plum)" : "var(--border)"}`,
                  fontFamily: "'Inter', sans-serif",
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif", opacity: saving ? 0.7 : 1 }}>
          {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
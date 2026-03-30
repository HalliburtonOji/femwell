import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Check } from "lucide-react";

const STYLES = [
  { id: "empathetic", label: "Warm & supportive",       desc: "Listens deeply, validates, and offers gentle guidance."        },
  { id: "motivator",  label: "Direct & action-focused", desc: "Gets to the point. Challenges you toward the next step."       },
  { id: "analyst",    label: "Data-driven",             desc: "Evidence-based, references your tracked data clearly."         },
  { id: "nurturing",  label: "Gentle & holistic",       desc: "Patient, self-compassionate, whole-person focused."            },
  { id: "bestie",     label: "Real & casual",           desc: "Conversational and honest, like a knowledgeable close friend." },
];

const TONES = ["Warm", "Neutral", "Direct", "Encouraging", "Calm"];

const VOICES = [
  { id: "shimmer", label: "Shimmer",  desc: "Warm, clear, and calm — recommended"   },
  { id: "alloy",   label: "Alloy",    desc: "Neutral and natural"                    },
  { id: "nova",    label: "Nova",     desc: "Expressive and friendly"                },
  { id: "echo",    label: "Echo",     desc: "Smooth and measured"                    },
];

const PACES = [
  { id: "slow",   label: "Slower"   },
  { id: "normal", label: "Normal"   },
  { id: "fast",   label: "Faster"   },
];

const MODES = [
  { id: "text",  label: "Text first", desc: "Start in text chat by default"         },
  { id: "voice", label: "Voice first", desc: "Open live voice mode by default"      },
];

const sLabel = {
  fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase",
  letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif",
};

export default function GuideSettingsSheet({ user, onClose, onSaved }) {
  const [guideName, setGuideName] = useState(user.coach_name || "Guide");
  const [archetype, setArchetype] = useState(user.coach_archetype || "empathetic");
  const [tone, setTone]           = useState(user.coach_tone || "Warm");
  const [voiceId, setVoiceId]     = useState(user.voice_id || "shimmer");
  const [pace, setPace]           = useState(user.speaking_pace || "normal");
  const [mode, setMode]           = useState(user.default_mode || "text");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      coach_name: guideName.trim() || "Guide",
      coach_archetype: archetype,
      coach_tone: tone,
      voice_id: voiceId,
      speaking_pace: pace,
      default_mode: mode,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      onSaved({
        coach_name: guideName.trim() || "Guide",
        coach_archetype: archetype,
        coach_tone: tone,
        voice_id: voiceId,
        speaking_pace: pace,
        default_mode: mode,
      });
      onClose();
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(42,32,53,0.42)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-t-[28px] px-5 py-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow-lg)" }}
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="w-8 h-1 rounded-full mx-auto mb-5" style={{ backgroundColor: "var(--border)" }} />

        <div className="flex items-center justify-between mb-6">
          <p className="font-semibold" style={{ color: "var(--plum)", fontFamily: "'Playfair Display', serif", fontSize: "1.05rem" }}>
            Guide settings
          </p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--ivory-dark)", color: "var(--mauve)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guide name */}
        <div className="mb-5">
          <p style={sLabel} className="mb-2">Guide name</p>
          <input type="text" value={guideName}
            onChange={e => setGuideName(e.target.value)}
            placeholder="e.g. Guide, Sage, Luna…"
            maxLength={20}
            className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none"
            style={{ backgroundColor: "var(--ivory)", border: "1.5px solid var(--border)", color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}
            onFocus={e => e.target.style.borderColor = "var(--rose-dust-light)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />
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
                  <p className="text-xs font-semibold" style={{ color: archetype === s.id ? "white" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: archetype === s.id ? "rgba(255,255,255,0.6)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{s.desc}</p>
                </div>
                {archetype === s.id && <Check className="w-4 h-4 flex-shrink-0 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-5">
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

        {/* Voice */}
        <div className="mb-5">
          <p style={sLabel} className="mb-2.5">Voice</p>
          <div className="space-y-1.5">
            {VOICES.map(v => (
              <button key={v.id} onClick={() => setVoiceId(v.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left transition-all"
                style={{
                  backgroundColor: voiceId === v.id ? "var(--rose-dust-subtle)" : "var(--ivory)",
                  border: `1.5px solid ${voiceId === v.id ? "var(--rose-dust-light)" : "var(--border)"}`,
                }}>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{v.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{v.desc}</p>
                </div>
                {voiceId === v.id && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--rose-dust)" }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Speaking pace */}
        <div className="mb-5">
          <p style={sLabel} className="mb-2.5">Speaking pace</p>
          <div className="flex gap-1.5">
            {PACES.map(p => (
              <button key={p.id} onClick={() => setPace(p.id)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  backgroundColor: pace === p.id ? "var(--plum)" : "var(--ivory)",
                  color: pace === p.id ? "white" : "var(--mauve)",
                  border: `1px solid ${pace === p.id ? "var(--plum)" : "var(--border)"}`,
                  fontFamily: "'Inter', sans-serif",
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Default mode */}
        <div className="mb-6">
          <p style={sLabel} className="mb-2.5">Default mode</p>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="px-3 py-2.5 rounded-2xl text-left transition-all"
                style={{
                  backgroundColor: mode === m.id ? "var(--plum)" : "var(--ivory)",
                  border: `1.5px solid ${mode === m.id ? "var(--plum)" : "var(--border)"}`,
                }}>
                <p className="text-xs font-semibold" style={{ color: mode === m.id ? "white" : "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{m.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: mode === m.id ? "rgba(255,255,255,0.6)" : "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--plum)", color: "white", fontFamily: "'Inter', sans-serif", opacity: saving ? 0.7 : 1 }}>
          {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
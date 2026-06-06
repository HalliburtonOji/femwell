import { Sparkles } from "lucide-react";

const PHASE_COLORS = {
  menstrual: "var(--rose-dust)",
  follicular: "var(--sage)",
  ovulatory: "#B89E6A",
  luteal: "var(--mauve)",
};
const PHASE_LABELS = {
  menstrual: "Menstrual phase",
  follicular: "Follicular phase",
  ovulatory: "Ovulatory phase",
  luteal: "Luteal phase",
};

const QUICK_PROMPTS = [
  "Why do I feel this way?",
  "What should I eat today?",
  "Help me understand my cycle",
  "I need some support",
];

export default function AssistantGreetingCard({ assistantName, profile, onSendPrompt }) {
  const phase = (() => {
    if (!profile?.last_period_start_date) return null;
    const cycleLen = profile.cycle_avg_length || 28;
    const periodLen = profile.period_length || 5;
    const today = new Date();
    const last = new Date(profile.last_period_start_date);
    const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    const cycleDay = (diff % cycleLen) + 1;
    if (cycleDay <= periodLen) return { phase: "menstrual", day: cycleDay };
    if (cycleDay <= 13) return { phase: "follicular", day: cycleDay };
    if (cycleDay <= 16) return { phase: "ovulatory", day: cycleDay };
    return { phase: "luteal", day: cycleDay };
  })();

  const buildContextPrompt = (prompt) => {
    if (!phase) return prompt;
    return `${prompt}\n\n[Context: I'm on cycle day ${phase.day} in my ${phase.phase} phase]`;
  };

  return (
    <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Greeting card */}
      <div style={{ backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", borderRadius: 20, padding: "18px 18px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: "var(--rose-dust)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles className="w-4 h-4" style={{ color: "white" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", }}>{assistantName}</p>
            {phase && (
              <p style={{ fontSize: 11, color: PHASE_COLORS[phase.phase], fontWeight: 500 }}>
                {PHASE_LABELS[phase.phase]} · Day {phase.day}
              </p>
            )}
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--plum)", lineHeight: 1.65 }}>
          Hi! I'm {assistantName}, your personal wellness guide. How can I help you today?
        </p>
      </div>

      {/* Quick prompt chips */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--mauve)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Quick start</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSendPrompt(buildContextPrompt(prompt))}
              style={{
                textAlign: "left", padding: "10px 14px", borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid var(--border)",
                backgroundColor: "var(--surface)", color: "var(--plum)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--ivory-dark)"; e.currentTarget.style.borderColor = "var(--rose-dust-light)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
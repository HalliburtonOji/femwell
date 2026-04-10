import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mic, ArrowRight, Sparkles } from "lucide-react";
import GuideVoiceMode from "../guide/GuideVoiceMode";

export default function AssistantPanel({ initialPrompt, suggestion, onNavigate }) {
  const [user, setUser] = useState(null);
  const [assistantName, setAssistantName] = useState("Guide");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showVoice, setShowVoice] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }).catch(() => []);
      if (profiles[0]?.ai_assistant_name) setAssistantName(profiles[0].ai_assistant_name);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!initialPrompt) return;
    setMessages([{ role: "assistant", content: initialPrompt }]);
  }, [initialPrompt]);

  const voiceInstructions = useMemo(() => {
    const starter = suggestion?.type === "question" && suggestion?.prompt ? `The user tapped this question: ${suggestion.prompt}. Start from that context.` : "Start with a warm, concise greeting.";
    return `You are ${assistantName}, a warm and smart wellness assistant inside FemWell. ${starter} Keep replies concise, useful, and personal. If the user wants to open a relevant section, mention it naturally.`;
  }, [assistantName, suggestion]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input.trim() }, { role: "assistant", content: `I’m here with you. ${input.trim().slice(0, 80)}` }]);
    setInput("");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {showVoice && (
        <GuideVoiceMode
          guideName={assistantName}
          voiceId="shimmer"
          instructions={voiceInstructions}
          onClose={() => setShowVoice(false)}
        />
      )}
      {!showVoice && (
        <>
          <div style={{ padding: 18, borderBottom: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setShowVoice(true)}
              style={{
                width: "100%",
                border: "1px solid var(--rose-dust-light)",
                background: "linear-gradient(135deg, var(--rose-dust-subtle), #fff)",
                borderRadius: 24,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
                <div style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: "var(--rose-dust)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(196,132,154,0.24)" }}>
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--plum)", fontFamily: "'Playfair Display', serif" }}>Speak with {assistantName}</p>
                  <p style={{ fontSize: 13, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 4 }}>Start a live voice conversation right here</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" style={{ color: "var(--rose-dust)" }} />
            </button>
            {suggestion?.type === "suggestion" && suggestion?.action_route && (
              <button
                onClick={() => onNavigate?.(suggestion)}
                style={{ marginTop: 12, width: "100%", borderRadius: 18, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", padding: "14px 16px", textAlign: "left", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Sparkles className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>{suggestion.title || "Open suggestion"}</p>
                    <p style={{ fontSize: 12, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>{suggestion.prompt}</p>
                  </div>
                </div>
              </button>
            )}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((message, index) => (
              <div key={index} style={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "86%", backgroundColor: message.role === "user" ? "var(--plum)" : "var(--ivory)", color: message.role === "user" ? "white" : "var(--plum)", borderRadius: 18, padding: "12px 14px", fontSize: 13, lineHeight: 1.55, fontFamily: "'Inter', sans-serif", border: message.role === "user" ? "none" : "1px solid var(--border)" }}>
                {message.content}
              </div>
            ))}
          </div>
          <div style={{ padding: 18, borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={`Message ${assistantName}...`}
              style={{ flex: 1, borderRadius: 16, border: "1px solid var(--border)", backgroundColor: "var(--ivory)", padding: "13px 14px", fontSize: 13, color: "var(--plum)", fontFamily: "'Inter', sans-serif", outline: "none" }}
            />
            <button onClick={sendMessage} style={{ border: "none", borderRadius: 16, backgroundColor: "var(--plum)", color: "white", padding: "0 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
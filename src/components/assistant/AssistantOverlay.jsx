import { X, MessageCircle, Sparkles } from "lucide-react";
import AssistantPanel from "./AssistantPanel";

export default function AssistantOverlay({ open, onClose, initialPrompt, suggestion, onNavigate }) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 90, backgroundColor: "rgba(42,32,53,0.42)", backdropFilter: "blur(8px)" }}
      />
      <div
        style={{
          position: "fixed",
          inset: "max(env(safe-area-inset-top),12px) 12px max(env(safe-area-inset-bottom),12px)",
          zIndex: 91,
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 28,
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Personal Assistant</p>
              <p style={{ fontSize: 11, color: "var(--mauve)", fontFamily: "'Inter', sans-serif" }}>
                {suggestion?.type === "question" ? "Continue the conversation" : "Quick help for this moment"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 9999, border: "none", backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <AssistantPanel initialPrompt={initialPrompt} suggestion={suggestion} onNavigate={onNavigate} />
        </div>
      </div>
    </>
  );
}
import { X, Sparkles } from "lucide-react";
import AssistantPanel from "./AssistantPanel";

export default function AssistantOverlay({ open, onClose, initialPrompt }) {
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: "var(--rose-dust-subtle)", border: "1px solid var(--rose-dust-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles className="w-4 h-4" style={{ color: "var(--rose-dust)" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--plum)", fontFamily: "'Inter', sans-serif" }}>Your Guide</p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9999, border: "none", backgroundColor: "var(--ivory-dark)", color: "var(--mauve)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <AssistantPanel initialPrompt={initialPrompt} embedded={true} />
        </div>
      </div>
    </>
  );
}
import AssistantPanel from "../components/assistant/AssistantPanel";

export default function Assistant() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory)", padding: "24px 16px 120px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 6 }}>Assistant</p>
          <h1 style={{ fontSize: 30, color: "var(--plum)", fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.1 }}>Talk things through</h1>
          <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginTop: 8 }}>Voice and chat now open inside the app instead of sending you away.</p>
        </div>
        <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 28, boxShadow: "var(--shadow-sm)", overflow: "hidden", minHeight: "70vh" }}>
          <AssistantPanel />
        </div>
      </div>
    </div>
  );
}
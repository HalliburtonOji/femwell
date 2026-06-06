// Sprint C C1 — Shared MHRA-aligned disclaimer rendered below every
// AI-generated insight surfaced in the app (Jess / Astra / nutrition AI
// / journal AI / etc). Subtle, italic, muted — present but not loud.
//
// Use: <AiDisclaimer /> directly under any AI-rendered text block.

export default function AiDisclaimer({ style = {}, label }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontStyle: "italic",
        color: "#9B8B7A", // FemWell muted
        margin: "10px 0 0",
        lineHeight: 1.5,
        ...style,
      }}
      data-mhra-disclaimer="true"
    >
      {label || "This is not medical advice. Always consult a healthcare professional."}
    </p>
  );
}

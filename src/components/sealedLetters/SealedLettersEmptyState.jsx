import { Mail } from "lucide-react";

export default function SealedLettersEmptyState({ onCompose }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 24px", textAlign: "center" }}>
      <Mail size={32} color="var(--mauve)" style={{ marginBottom: 20 }} />
      <h2 style={{ fontSize: 22, fontWeight: 500, color: "var(--plum-deep)", marginBottom: 10, lineHeight: 1.3 }}>
        No letters yet.
      </h2>
      <p style={{ fontSize: 14, color: "var(--mauve)", lineHeight: 1.55, maxWidth: 320, marginBottom: 28 }}>
        Write something to a future you. We'll hold it until the date you pick.
      </p>
      <button
        onClick={onCompose}
        style={{ fontSize: 14, fontWeight: 600, color: "var(--cream)", backgroundColor: "var(--rose-primary)", padding: "12px 24px", borderRadius: 9999, border: "none", cursor: "pointer" }}
      >
        Write your first letter
      </button>
    </div>
  );
}
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Assistant() {
  const navigate = useNavigate();

  useEffect(() => {
    // Pick up any pre-filled prompt from sessionStorage (e.g. the Ask Jess
    // button on the /Health letter writes one before navigating here).
    let pendingPrompt = null;
    try {
      pendingPrompt = sessionStorage.getItem("jess_initial_prompt");
      if (pendingPrompt) sessionStorage.removeItem("jess_initial_prompt");
    } catch (_) { /* sessionStorage may throw in private mode */ }
    window.dispatchEvent(new CustomEvent("fw_open_assistant", {
      detail: pendingPrompt ? { initialPrompt: pendingPrompt } : {},
    }));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div style={{ textAlign: "center" }}>
        <h1 className="fw-display" style={{ marginBottom: 16 }}>Jess</h1>
        <p style={{ fontSize: 14, color: "var(--mauve)", marginBottom: 16 }}>
          Assistant is open.
        </p>
        <button
          onClick={() => {
            window.dispatchEvent(new Event("fw_close_assistant"));
            navigate("/Today", { replace: true });
          }}
          style={{ fontSize: 13, color: "var(--rose-dust)", background: "none", border: "none", cursor: "pointer", }}
        >
          Back to Today
        </button>
      </div>
    </div>
  );
}
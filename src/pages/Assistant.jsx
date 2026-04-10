import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Assistant() {
  const navigate = useNavigate();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("fw_open_assistant", { detail: {} }));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--ivory)" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--mauve)", fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>
          Assistant is open.
        </p>
        <button
          onClick={() => {
            window.dispatchEvent(new Event("fw_close_assistant"));
            navigate("/Today", { replace: true });
          }}
          style={{ fontSize: 13, color: "var(--rose-dust)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
        >
          Back to Today
        </button>
      </div>
    </div>
  );
}
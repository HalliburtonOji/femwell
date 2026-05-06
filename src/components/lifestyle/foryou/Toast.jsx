import { useEffect } from "react";

export default function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 90,
        background: "var(--cream)",
        color: "var(--plum-deep)",
        border: "1px solid var(--ink-line)",
        boxShadow: "var(--shadow-card-hover)",
        borderRadius: 9999,
        padding: "10px 18px",
        font: "500 13px 'Inter', sans-serif",
        animation: "fy-fade 180ms ease-out",
      }}
    >
      {message}
    </div>
  );
}
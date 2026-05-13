import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HoroscopeToast — single non-intrusive notification bar for the horoscope tab.
//
// Sits fixed at the bottom of the viewport (above the bottom nav, ~80px up).
// Auto-dismisses after 4s. Supports three types: info | success | error.
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_STYLES = {
  info: {
    background: "rgba(27, 18, 40, 0.96)",
    border: "1px solid rgba(245,230,211,0.18)",
    color: "rgba(245,230,211,0.92)",
    dot: "rgba(245,230,211,0.55)",
  },
  success: {
    background: "rgba(27, 18, 40, 0.96)",
    border: "1px solid rgba(125,134,104,0.55)",
    color: "rgba(245,230,211,0.92)",
    dot: "#7D8668",
  },
  error: {
    background: "rgba(27, 18, 40, 0.96)",
    border: "1px solid rgba(160,49,42,0.55)",
    color: "#FFC4BC",
    dot: "#A0312A",
  },
};

export default function HoroscopeToast({ message, type = "info", onDismiss }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!message) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onDismiss?.();
    }, 4000);
    return () => clearTimeout(timerRef.current);
  }, [message, onDismiss]);

  if (!message) return null;

  const s = TYPE_STYLES[type] || TYPE_STYLES.info;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 88,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 18px",
        borderRadius: 9999,
        maxWidth: "calc(100vw - 40px)",
        background: s.background,
        border: s.border,
        boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
        backdropFilter: "blur(12px)",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        fontWeight: 500,
        color: s.color,
        letterSpacing: "0.01em",
        animation: "horo-toast-in 0.22s cubic-bezier(0.32,0.72,0.24,1)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      onClick={onDismiss}
    >
      <style>{`@keyframes horo-toast-in{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {message}
    </div>
  );
}
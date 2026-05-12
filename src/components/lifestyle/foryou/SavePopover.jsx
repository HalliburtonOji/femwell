import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

const ROWS_BASE = [
  { id: "now",        label: "Right now",        kind: "now" },
  { id: "luteal",     label: "Luteal phase",     kind: "phase" },
  { id: "follicular", label: "Follicular phase", kind: "phase" },
  { id: "ovulatory",  label: "Ovulatory phase",  kind: "phase" },
  { id: "menstrual",  label: "Menstrual phase",  kind: "phase" },
];

// Edge-clamped popover anchored near the heart. Auto-confirms "Right now" after 1.5s.
export default function SavePopover({ anchorRect, hasExistingPhase, onPick, onAutoConfirm }) {
  const ref = useRef(null);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const rows = hasExistingPhase
    ? [...ROWS_BASE, { id: "untag", label: "Untag", kind: "untag" }]
    : ROWS_BASE;

  // Auto-confirm "Right now" after 1.5s of inaction
  useEffect(() => {
    const t = setTimeout(() => onAutoConfirm?.(), 1500);
    return () => clearTimeout(t);
  }, [onAutoConfirm]);

  // Outside-tap, Esc, scroll → auto-confirm
  useEffect(() => {
    const dismiss = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onAutoConfirm?.();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onAutoConfirm?.();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIdx((i) => (i + 1) % rows.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIdx((i) => (i - 1 + rows.length) % rows.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        onPick?.(rows[focusedIdx]);
      }
    };
    const onScroll = () => onAutoConfirm?.();
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [focusedIdx, onAutoConfirm, onPick, rows]);

  // Edge-clamp position
  const W = 220;
  const ROW_H = 40;
  const HEADER_H = 36;
  const H = HEADER_H + rows.length * ROW_H + 12;
  const vw = typeof window !== "undefined" ? window.innerWidth : 360;
  const vh = typeof window !== "undefined" ? window.innerHeight : 640;

  let left = 16;
  let top = 16;
  if (anchorRect) {
    const heartCenterX = anchorRect.left + anchorRect.width / 2;
    const heartCenterY = anchorRect.top + anchorRect.height / 2;
    left = Math.max(16, Math.min(heartCenterX - W / 2, vw - W - 16));
    if (heartCenterY > 320) {
      top = Math.max(16, Math.min(anchorRect.top - H - 8, vh - H - 16));
    } else {
      top = Math.max(16, Math.min(anchorRect.bottom + 8, vh - H - 16));
    }
  }

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Save for later"
      style={{
        position: "fixed",
        left,
        top,
        width: W,
        zIndex: 100,
        background: "var(--cream)",
        border: "1px solid var(--ink-line)",
        borderRadius: 14,
        boxShadow: "var(--shadow-card-hover)",
        animation: "fy-pop 220ms cubic-bezier(.2,.8,.2,1)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px 8px",
          font: "italic 300 14px 'Fraunces', serif",
          color: "var(--plum-mute)",
        }}
      >
        Save for…
      </div>
      {rows.map((row, idx) => {
        const isPreselected = row.id === "now";
        const focused = idx === focusedIdx;
        const dotColor =
          row.kind === "now" ? "var(--rose-primary)" :
          row.kind === "phase" ? "var(--rose-soft)" :
          "transparent";
        const labelColor = row.kind === "untag" ? "var(--plum-mute)" : "var(--plum-deep)";
        return (
          <button
            key={row.id}
            role="menuitem"
            aria-current={isPreselected ? "true" : undefined}
            onMouseEnter={() => setFocusedIdx(idx)}
            onClick={() => onPick?.(row)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              height: ROW_H,
              padding: "0 16px",
              border: "none",
              cursor: "pointer",
              background: focused ? "var(--cream-2)" : "transparent",
              font: "500 14px 'Inter', sans-serif",
              color: labelColor,
              textAlign: "left",
              minHeight: 44,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              {row.kind !== "untag" && (
                <span
                  aria-hidden="true"
                  style={{
                    width: 8, height: 8, borderRadius: 9999, background: dotColor,
                    flexShrink: 0,
                  }}
                />
              )}
              {row.kind === "untag" && (
                <span aria-hidden="true" style={{ width: 8, opacity: 0 }} />
              )}
              {row.label}
            </span>
            <ChevronRight size={16} color="var(--ink-line)" />
          </button>
        );
      })}
    </div>
  );
}
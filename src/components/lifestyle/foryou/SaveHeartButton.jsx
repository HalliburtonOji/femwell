import { useRef, useState } from "react";
import { Heart } from "lucide-react";
import SavePopover from "./SavePopover";

// Round heart button + popover. Optimistic fill, debounced, auto-confirm.
export default function SaveHeartButton({
  itemId,
  size = 36,
  iconSize = 20,
  saved,
  hasPhaseTag,
  onSave,         // ({ id, phase }) — phase null for "now"
  onUnsave,       // (id)
  onUntag,        // (id) — only stripping phase, keep saved
}) {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const lastTapRef = useRef(0);
  const localSavedRef = useRef(saved);
  localSavedRef.current = saved;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < 250) return; // 250ms debounce
    lastTapRef.current = now;

    if (saved) {
      // Already saved → tapping heart re-opens chooser to retag/untag.
      setAnchorRect(btnRef.current?.getBoundingClientRect() || null);
      setOpen(true);
      return;
    }
    // Not saved yet → optimistic fill + open chooser.
    setAnchorRect(btnRef.current?.getBoundingClientRect() || null);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const handlePick = (row) => {
    if (row.kind === "untag") {
      onUntag?.(itemId);
      close();
      return;
    }
    if (row.kind === "now") {
      onSave?.({ id: itemId, phase: null });
      close();
      return;
    }
    if (row.kind === "phase") {
      onSave?.({ id: itemId, phase: row.id });
      close();
      return;
    }
    close();
  };

  const handleAutoConfirm = () => {
    if (!localSavedRef.current) {
      // Auto-confirm "Right now" save
      onSave?.({ id: itemId, phase: null });
    }
    close();
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        aria-label={saved ? "Saved — tap to retag or remove" : "Save article"}
        style={{
          width: size,
          height: size,
          minWidth: 44,
          minHeight: 44,
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 9999,
          background: "white",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Heart
          size={iconSize}
          strokeWidth={1.75}
          color={saved ? "var(--rose-primary)" : "var(--plum-mute)"}
          fill={saved ? "var(--rose-primary)" : "none"}
          style={{
            transition: "transform 220ms cubic-bezier(.2,.8,.2,1), color 80ms",
            transform: saved ? "scale(1)" : "scale(1)",
          }}
        />
      </button>
      {open && (
        <SavePopover
          anchorRect={anchorRect}
          hasExistingPhase={hasPhaseTag}
          onPick={handlePick}
          onAutoConfirm={handleAutoConfirm}
        />
      )}
    </>
  );
}
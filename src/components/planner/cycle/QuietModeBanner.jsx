import { useState } from "react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// QuietModeBanner — Planner Phase 2 C6 (MP-A2).
//
// Renders only when `profile.quiet_mode_until` is set AND in the future. Shows
// the duration that remains in "warm" copy ("You're in Quiet Mode until
// Saturday morning"), explains what's been paused (non-anchor tasks), and
// offers a one-tap **Undo** that clears the flag — restoring normal behaviour
// instantly.
//
// The trigger logic lives server-side in `evaluateQuietMode/entry.ts`. The FE
// is purely render + clear. Anchor tasks remain visible regardless.
//
// Spec ref: claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md §C6.
// ─────────────────────────────────────────────────────────────────────────────

function isFuture(iso) {
  if (!iso) return false;
  try { return new Date(iso).getTime() > Date.now(); } catch { return false; }
}

function fmtUntilLine(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `until ${weekday} ${time}`;
  } catch { return ""; }
}

export default function QuietModeBanner({ profile, onCleared }) {
  const [clearing, setClearing] = useState(false);
  const [err, setErr] = useState(null);

  if (!profile || !isFuture(profile.quiet_mode_until)) return null;

  const handleUndo = async () => {
    setClearing(true); setErr(null);
    try {
      await base44.entities.UserProfile.update(profile.id, { quiet_mode_until: null });
      if (onCleared) onCleared();
    } catch (e) {
      setErr(e?.message || "Couldn't lift Quiet Mode. Try again in a moment.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <section
      role="status"
      aria-label="Quiet mode active"
      style={{
        background: "linear-gradient(180deg, var(--cream, #FFFAF5) 0%, var(--cream-deep, #FAF4ED) 100%)",
        border: "1px solid var(--sage, #7A9E8E)",
        borderLeft: "4px solid var(--sage, #7A9E8E)",
        borderRadius: 14,
        padding: "12px 14px",
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={kickerStyle}>Quiet mode is on</p>
          <p style={mainStyle}>
            Non-anchor tasks are paused {fmtUntilLine(profile.quiet_mode_until)}. Anchors are still there if you want them.
          </p>
          <p style={subStyle}>
            We dialled things down because of the pattern in your last few days — you can lift it any time.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUndo}
          disabled={clearing}
          style={undoBtnStyle(clearing)}
          aria-label="Undo quiet mode"
        >
          {clearing ? "Lifting…" : "Undo"}
        </button>
      </div>
      {err && (
        <p role="alert" style={errStyle}>{err}</p>
      )}
    </section>
  );
}

const kickerStyle = {
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--sage, #7A9E8E)",
  fontFamily: "'Inter', sans-serif",
  margin: "0 0 4px",
};
const mainStyle = {
  fontFamily: "'Fraunces', serif",
  fontSize: 15,
  lineHeight: 1.4,
  color: "var(--plum, #4A2A3A)",
  letterSpacing: "-0.005em",
  margin: "0 0 4px",
};
const subStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 12.5,
  lineHeight: 1.5,
  color: "var(--plum-2, #6B4559)",
  margin: 0,
};
function undoBtnStyle(disabled) {
  return {
    padding: "7px 14px",
    borderRadius: 9999,
    border: "1px solid var(--plum, #4A2A3A)",
    background: "transparent",
    color: "var(--plum, #4A2A3A)",
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? "wait" : "pointer",
    minHeight: 34,
  };
}
const errStyle = {
  fontSize: 12,
  color: "var(--rose-primary, #D45E52)",
  fontFamily: "'Inter', sans-serif",
  margin: "8px 0 0",
};

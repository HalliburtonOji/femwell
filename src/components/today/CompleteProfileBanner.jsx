import { Link } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";

/**
 * Persistent nudge banner for users who haven't finished onboarding
 * OR who are missing cycle basics. Links to /Onboarding?mode=redo.
 *
 * Visible only when shouldShow=true. No dismiss button — it disappears
 * automatically once the required fields are filled.
 */
export default function CompleteProfileBanner({ shouldShow }) {
  if (!shouldShow) return null;

  return (
    <Link
      to="/Onboarding?mode=redo"
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: 16,
        backgroundColor: "var(--rose-dust-subtle)",
        border: "1px solid var(--rose-dust-light)",
        textDecoration: "none",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: "var(--rose-dust)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Sparkles style={{ width: 16, height: 16, color: "white" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 10, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em",
          color: "var(--rose-dust)",
          fontFamily: "'Inter', sans-serif",
        }}>
          Complete your profile
        </p>
        <p style={{
          fontSize: 13, fontWeight: 600,
          color: "var(--plum)",
          fontFamily: "'Inter', sans-serif",
          marginTop: 2,
        }}>
          Unlock cycle predictions and daily guidance
        </p>
      </div>
      <ChevronRight style={{ width: 18, height: 18, color: "var(--rose-dust)", flexShrink: 0 }} />
    </Link>
  );
}
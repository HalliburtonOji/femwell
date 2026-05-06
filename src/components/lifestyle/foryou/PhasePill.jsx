import { phaseLabel } from "@/utils/cyclePhase";

// "★ Luteal match" pill — transparent plum tint, used on matched cards
// (NOT the editorial hero). Star is U+2605 (typeset glyph, not emoji).
export default function PhasePill({ phase, style = {} }) {
  if (!phase) return null;
  const label = phaseLabel(phase);
  return (
    <span
      role="img"
      aria-label={`Matched to your ${phase} phase`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(122, 74, 94, 0.15)",
        border: "1px solid rgba(122, 74, 94, 0.20)",
        borderRadius: 9999,
        padding: "4px 10px",
        color: "var(--plum-deep)",
        font: "500 11px 'Inter', sans-serif",
        whiteSpace: "nowrap",
        animation: "fy-fade 180ms ease-out",
        ...style,
      }}
    >
      <span aria-hidden="true">★</span>
      {label} match
    </span>
  );
}
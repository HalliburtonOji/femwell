import { phaseLabel } from "@/utils/cyclePhase";
import { Star } from "lucide-react";

const VALID_PHASES = ["menstrual", "follicular", "ovulatory", "luteal"];

// "Luteal match" pill (Lucide Star + label) — transparent plum tint, used on matched cards
// (NOT the editorial hero). Star is U+2605 (typeset glyph, not emoji).
// Bug #5 (2026-06-01) — refuse sentinel values like "any"/"all"/"none"
// that occasionally leak in from legacy seed data; fall through to
// `fallbackPhase` (the user's actual current cycle phase) before
// giving up and rendering nothing.
export default function PhasePill({ phase, fallbackPhase, style = {} }) {
  const candidate = String(phase || "").toLowerCase();
  const effective = VALID_PHASES.includes(candidate)
    ? candidate
    : (VALID_PHASES.includes(String(fallbackPhase || "").toLowerCase())
        ? String(fallbackPhase).toLowerCase()
        : null);
  if (!effective) return null;
  const label = phaseLabel(effective);
  return (
    <span
      role="img"
      aria-label={`Matched to your ${effective} phase`}
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
      <Star aria-hidden="true" size={11} fill="currentColor" style={{ flexShrink: 0 }} />
      {label} match
    </span>
  );
}
// MoonPhaseGlyph — pure SVG moon. Eight phase variants, no emoji codepoints.
// Cream circle (#F5E6D3) with a plum overlay (#2B1E26) clipped to the unlit
// area. Phase keys mirror src/utils/astrology.js getMoonPhase() return shape.

const CREAM = "#F5E6D3";
const PLUM = "#2B1E26";

// For each phase: the SVG <path> that draws the UNLIT portion in plum.
// cx=12, cy=12, r=10. We use one outer half-arc + one inner terminator arc.
function unlitPath(phase) {
  // side = which half of the disc is unlit; curvature controls how the
  // terminator arc bulges. gibbous = true → unlit is the SMALL side
  // (terminator bulges into the lit area).
  const map = {
    new:              { side: "full" },
    waxing_crescent:  { side: "left", curvature: 0.7 },
    first_quarter:    { side: "left", curvature: 0.0 },
    waxing_gibbous:   { side: "left", curvature: 0.5, gibbous: true },
    full:             { side: "none" },
    waning_gibbous:   { side: "right", curvature: 0.5, gibbous: true },
    last_quarter:     { side: "right", curvature: 0.0 },
    waning_crescent:  { side: "right", curvature: 0.7 },
  };
  const cfg = map[phase] || map.new;
  if (cfg.side === "full") {
    return "M 12,2 A 10,10 0 1 1 12,22 A 10,10 0 1 1 12,2 Z";
  }
  if (cfg.side === "none") {
    return "";
  }
  const rx = Math.max(0.1, 10 * cfg.curvature);
  if (cfg.side === "left") {
    if (cfg.gibbous) {
      return `M 12,2 A 10,10 0 0 0 12,22 A ${rx},10 0 0 0 12,2 Z`;
    }
    return `M 12,2 A 10,10 0 0 0 12,22 A ${rx},10 0 0 1 12,2 Z`;
  }
  if (cfg.gibbous) {
    return `M 12,2 A 10,10 0 0 1 12,22 A ${rx},10 0 0 1 12,2 Z`;
  }
  return `M 12,2 A 10,10 0 0 1 12,22 A ${rx},10 0 0 0 12,2 Z`;
}

export default function MoonPhaseGlyph({ phase = "new", size = 24, title }) {
  const path = unlitPath(phase);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? "img" : "presentation"}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      <circle cx="12" cy="12" r="10" fill={CREAM} />
      {path && <path d={path} fill={PLUM} />}
    </svg>
  );
}

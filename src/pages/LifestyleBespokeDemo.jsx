// Lifestyle · FOCUS · BESPOKE (2026-09-16). The new deepening: each focused section opens its OWN
// complete, section-specific surface that pulls EVERYTHING for that section (new design, nothing
// behind buttons) — not a generic filtered layout. SKY is the reference implementation: focusing Sky
// renders the full rich horoscope (all 15 Track-R sections via HoroscopeTab) INLINE, not the old
// button-gated reader. Other sections fall back to the slider-free stacks layout until their bespoke
// surface is built (see the per-section plan). Same base (header → chip → focus → tap item). Live
// /Lifestyle untouched.
import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";

export default function LifestyleBespokeDemo() {
  // CLEAN (2026-09-22): the whole page in the §2.7 clean language behind the reversible `clean` flag —
  // one still header, one language across every band, every focus surface. Live /Lifestyle untouched.
  return <LifestyleEliteShell enableFocus layout="bespoke" clean />;
}

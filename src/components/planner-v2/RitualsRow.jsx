// RitualsRow — thin wrapper around the production RitualBundlesCarousel.
// Passes through all props; the carousel already places the "Create
// ritual" dashed card first per memory.

import React from "react";
import RitualBundlesCarousel from "@/components/planner/today/RitualBundlesCarousel";

export default function RitualsRow(props) {
  // Production RitualBundlesCarousel expects: userId, selectedDateStr,
  // currentPhase, plannerConfig, onRitualsAdded. All optional — falls back
  // to safe defaults when called from the v2 demo harness.
  return (
    <RitualBundlesCarousel {...props} />
  );
}

// Lifestyle · FOCUS · THE MOOD (2026-09-14). The live page + the confirmed base (header retained →
// section chips → tap a chip focuses the page on that section → tap a card opens the exact item),
// laid out SLIDER-FREE as intent-led clusters: within the focused section the items re-group by how
// you feel / time you have (a quick moment · settle in · fresh & new) — no horizontal carousels.
// 4 of 4 slider-free layouts. Live untouched.
import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";

export default function LifestyleMoodDemo() {
  return <LifestyleEliteShell enableFocus layout="mood" />;
}

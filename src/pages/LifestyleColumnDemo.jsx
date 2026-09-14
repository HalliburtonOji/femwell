// Lifestyle · FOCUS · THE COLUMN (2026-09-14). The live page + the confirmed base (header retained →
// section chips → tap a chip focuses the page on that section → tap a card opens the exact item),
// laid out SLIDER-FREE as a single flowing editorial column: a big lede card then a compact
// continuous feed — no shelves, no horizontal carousels. 2 of 4 slider-free layouts. Live untouched.
import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";

export default function LifestyleColumnDemo() {
  return <LifestyleEliteShell enableFocus layout="column" />;
}

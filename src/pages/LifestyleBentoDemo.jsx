// Lifestyle · FOCUS · THE BENTO (2026-09-14). The live page + the confirmed base (header retained →
// section chips → tap a chip focuses the page on that section → tap a card opens the exact item),
// laid out SLIDER-FREE as a 2-col mosaic: a featured tile spanning both columns then smaller tiles,
// everything visible at once — no horizontal carousels. 3 of 4 slider-free layouts. Live untouched.
import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";

export default function LifestyleBentoDemo() {
  return <LifestyleEliteShell enableFocus layout="bento" />;
}

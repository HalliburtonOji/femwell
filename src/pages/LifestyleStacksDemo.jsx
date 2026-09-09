// Lifestyle · FOCUS · THE STACKS (2026-09-09). The CURRENT live Lifestyle page + the confirmed base
// interaction (header retained → section chips → tap a chip focuses the page on that section → tap a
// card opens the exact item), laid out SLIDER-FREE as named vertical shelves: the focused section's
// real sub-groups become labelled full-width lists that flow straight down — no horizontal carousels
// anywhere. One of four slider-free layouts to compare. Live /Lifestyle untouched (this passes the
// default-off enableFocus + layout props; the live route passes neither).
import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";

export default function LifestyleStacksDemo() {
  return <LifestyleEliteShell enableFocus layout="stacks" />;
}

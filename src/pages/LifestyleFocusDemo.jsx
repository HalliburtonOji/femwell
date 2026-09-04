// Lifestyle · RETAIN-AND-FOCUS demo (2026-08-27). The CURRENT live Lifestyle page (LifestyleEliteShell)
// exactly as-is, with the chip-focus interaction turned ON via the default-off `enableFocus` prop:
// tap a controller chip → the page FOCUSES on that section (For-you filters to it, the boards collapse
// to that ONE board shown full, the glance stays global) → tap a card → the exact item opens; a clear
// "Showing: <section> · ✕ Everything" control returns to the full page. Nothing removed; live /Lifestyle
// (which renders the same shell WITHOUT the prop) is untouched. Real authenticated data.
import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";

export default function LifestyleFocusDemo() {
  return <LifestyleEliteShell enableFocus />;
}

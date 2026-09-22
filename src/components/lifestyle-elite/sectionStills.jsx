// sectionStills — the PLACEHOLDER stills for the ONE Lifestyle header (BRAND_IDENTITY §6.8, Lifestyle
// variant): until Halli's Higgsfield stills land, each section shows a rendered, print-like composition
// of its signature species from the real library (SpeciesBloom — static, no animation) on a soft
// ground. It is a designed slot, never the video hero and never a second flower header. When a real
// still arrives, SectionHeader's `image` config replaces this by data alone (SECTION_HEADER).
//
// Section → species + meaning (§5.1 floriography), chosen for the section's job:
//   read   → iris        (a message; the courage to begin a page)
//   listen → bluebell    (constancy; a sound that keeps)
//   books  → honeysuckle (devoted, the story that keeps)
//   story  → honeysuckle (merged with books)
//   sky    → morning-glory (the day's turning; the sky's flower)
//   good   → marigold    (warmth, the small joy)
//   yours  → forget-me-not (what she keeps)
import React from "react";
import { SpeciesBloom } from "@/components/brand/floraLibrary";
import { C } from "@/components/brand/cleanTokens";

export const SECTION_STILL = {
  read:   { species: "iris",          tint: "#EEF0F4", flower: { name: "Iris",          note: "the courage to begin a page" } },
  listen: { species: "bluebell",      tint: "#EDEFF3", flower: { name: "Bluebell",      note: "constancy — a sound that keeps" } },
  books:  { species: "honeysuckle",   tint: "#F3EFEA", flower: { name: "Honeysuckle",   note: "devoted — the story that keeps" } },
  story:  { species: "honeysuckle",   tint: "#F3EFEA", flower: { name: "Honeysuckle",   note: "devoted — the story that keeps" } },
  sky:    { species: "morning-glory", tint: "#EEEEF4", flower: { name: "Morning glory", note: "the day's turning — the sky's flower" } },
  good:   { species: "marigold",      tint: "#F5F1E6", flower: { name: "Marigold",      note: "warmth — the small joy" } },
  yours:  { species: "forget-me-not", tint: "#EEF1F4", flower: { name: "Forget-me-not", note: "what she keeps" } },
};

// A print-like still: a soft tinted ground, a faint ground ellipse, and a three-bloom composition
// (one large, two smaller) of the section's species. Static SVG via the library — zero fetch.
export function SectionStill({ sectionKey = "read", height = 236 }) {
  const cfg = SECTION_STILL[sectionKey] || SECTION_STILL.read;
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(172deg, #FBFAF8 0%, ${cfg.tint} 62%, ${cfg.tint} 100%)` }}>
      <div style={{ position: "absolute", left: "50%", bottom: "14%", width: "72%", height: "28%", transform: "translateX(-50%)", borderRadius: "50%", background: "rgba(25,21,16,.05)", filter: "blur(10px)" }} />
      <div style={{ position: "absolute", left: "50%", bottom: "8%", transform: "translateX(-50%)", lineHeight: 0 }}><SpeciesBloom name={cfg.species} size={Math.round(height * 0.66)} /></div>
      <div style={{ position: "absolute", left: "22%", bottom: "12%", transform: "translateX(-50%) rotate(-10deg)", opacity: .92, lineHeight: 0 }}><SpeciesBloom name={cfg.species} size={Math.round(height * 0.42)} /></div>
      <div style={{ position: "absolute", left: "78%", bottom: "14%", transform: "translateX(-50%) rotate(9deg)", opacity: .9, lineHeight: 0 }}><SpeciesBloom name={cfg.species} size={Math.round(height * 0.4)} /></div>
      <div style={{ position: "absolute", right: 12, bottom: 10, fontFamily: "ui-sans-serif,system-ui,sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.faint }}>Placeholder still</div>
    </div>
  );
}

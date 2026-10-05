import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";
import "@/components/lifestyle-elite/LivingAtelier.css";

export default function LivingAtelierDemo() {
  return <main className="fw-living-atelier">
    <nav className="fw-atelier-review" aria-label="Creative review"><a href="/Ideas">Ideas · review</a><span>Celestial Marginalia · first study</span></nav>
    <LifestyleEliteShell enableFocus layout="bespoke" clean previewActions initialSection="sky" continuousSky celestialSky firstFoldVariant="letter" dailySkyLessons artDirection="marginalia"/>
    <aside className="fw-atelier-notes"><details><summary>Creative brief &amp; build notes</summary><p>One new complete Sky composition. All six Lifestyle sections and their existing actions remain; bespoke extension artwork for the other sections follows separately.</p><p>Original celestial art, a calculated Moon, open reading, a learning folio and botanical incidents throughout. This is a review proposal, not an approved main-page design.</p><a href="/living-atelier/index.html">Five creative worlds &amp; research</a><a href="/FloralDreamDemo?section=sky&direction=living">Approved Living base</a><a href="/LivingLifestyleDemo?section=sky&direction=letter">Previous five studies</a></details></aside>
  </main>;
}

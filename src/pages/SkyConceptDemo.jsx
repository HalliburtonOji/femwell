import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";
import { C } from "@/components/brand/cleanTokens";
import { UI } from "@/components/journal/Editorial";

// Halli's correction: Sky is one complete Lifestyle subsection, not another hub.
// Reuse the connected surface so no content or capability is replaced by a sample clone.
export default function SkyConceptDemo() {
  return <div className="fw-sky-review">
    <style>{`.fw-sky-review [aria-label="Section actions"] button{color:#0B0805!important}body:has(.fw-sky-review) a[aria-label="Open Ideas (Design Lab — dev only)"]{position:relative!important;inset:auto!important;display:flex!important;width:fit-content;margin:0 auto 120px!important;transform:none!important}`}</style>
    <div style={{ background: C.ground, color: C.ink, fontFamily: UI, maxWidth: 430, margin: "0 auto", padding: "56px 64px 8px 16px", fontSize: 12, lineHeight: 1.5 }}>
      <a href="/Ideas?section=skyreview" style={{ color: C.ink, display: "inline-flex", alignItems: "center", minHeight: 44 }}>Sky review board</a>
      <p style={{ margin: "0 0 4px", fontWeight: 700 }}>Lifestyle · Sky · celestial preview</p>
      <p style={{ margin: 0 }}>New design & voice. Connected preview; actions can change your account. <a href="/sky-review/voice.html" style={{color:C.ink}}>What changed</a></p>
    </div>
    <LifestyleEliteShell enableFocus layout="bespoke" clean previewActions initialSection="sky" continuousSky celestialSky />
  </div>;
}

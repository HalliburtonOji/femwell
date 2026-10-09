import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";
import "@/components/lifestyle-elite/SkyWorlds.css";
import "@/components/lifestyle-elite/FocusedLifestyle.css";
import "@/components/lifestyle-elite/CalmLifestyle.css";

export default function CalmLifestyleDemo({ routeActive = true }) {
  return <div className="fw-sky-worlds fw-calm-lifestyle" data-world="petal-press">
    <nav className="fw-focused-preview-nav" aria-label="Calmer Lifestyle review"><span>Ideas · calmer Lifestyle</span><a href="/lifestyle-calm/index.html">What changed &amp; checks</a></nav>
    <LifestyleEliteShell routeActive={routeActive} enableFocus layout="bespoke" clean previewActions initialSection="sky" continuousSky celestialSky firstFoldVariant="living" dailySkyLessons artDirection="sky-worlds" skyWorld="petal-press" contentRoute="/CalmLifestyleDemo" focusedPreview calmLayout/>
  </div>;
}

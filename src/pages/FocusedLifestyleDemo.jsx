import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";
import "@/components/lifestyle-elite/SkyWorlds.css";
import "@/components/lifestyle-elite/FocusedLifestyle.css";

export default function FocusedLifestyleDemo() {
  return <div className="fw-sky-worlds" data-world="petal-press">
    <nav className="fw-focused-preview-nav" aria-label="Focused Lifestyle review"><span>Ideas · focused Lifestyle</span><a href="/lifestyle-tap-cleanup/index.html">What changed &amp; checks</a></nav>
    <LifestyleEliteShell enableFocus layout="bespoke" clean previewActions initialSection="good" continuousSky celestialSky firstFoldVariant="living" dailySkyLessons artDirection="sky-worlds" skyWorld="petal-press" contentRoute="/FocusedLifestyleDemo" focusedPreview/>
  </div>;
}

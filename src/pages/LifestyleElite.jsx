// /Lifestyle and /LifestyleElite share Halli's approved selected design.
// Revert this page's props to <LifestyleEliteShell /> to restore the prior presentation.
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";
import "@/components/lifestyle-elite/SkyWorlds.css";

export default function LifestyleElite() {
  return <main className="fw-sky-worlds fw-lifestyle-main" data-world="petal-press">
    <LifestyleEliteShell enableFocus layout="bespoke" clean previewActions initialSection="read" continuousSky celestialSky firstFoldVariant="living" dailySkyLessons artDirection="sky-worlds" skyWorld="petal-press" contentRoute="/Lifestyle" />
  </main>;
}

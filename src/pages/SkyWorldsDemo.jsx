import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";
import { SKY_WORLDS, getSkyWorld } from "@/components/lifestyle-elite/skyWorlds";
import "@/components/lifestyle-elite/SkyWorlds.css";

export default function SkyWorldsDemo() {
  const world = getSkyWorld(new URLSearchParams(window.location.search).get("direction"));
  const selected = world.id === "petal-press";
  return <main className="fw-sky-worlds" data-world={world.id}>
    <nav className="fw-world-review" aria-label="Sky design review"><a href="/Ideas">Ideas · review</a><a href={selected ? "/selected-lifestyle/index.html" : "/sky-worlds/index.html"}>{selected ? "Selected design" : "Five skies"}</a></nav>
    <LifestyleEliteShell enableFocus layout="bespoke" clean previewActions initialSection="sky" continuousSky celestialSky firstFoldVariant="living" dailySkyLessons artDirection="sky-worlds" skyWorld={world.id} contentRoute="/SkyWorldsDemo"/>
    <aside className="fw-world-review-footer"><p>{world.name}</p>{selected && <nav aria-label="Selected Lifestyle demos">{["sky","read","listen","books","good","yours"].map(section=><a key={section} href={`/SkyWorldsDemo?direction=petal-press&section=${section}`}>{section === "good" ? "Good life" : section[0].toUpperCase()+section.slice(1)}</a>)}</nav>}<details open={!selected}><summary>The five earlier Sky designs</summary><nav aria-label="Five Sky demos">{SKY_WORLDS.map(item=><a key={item.id} aria-current={world.id===item.id ? "page" : undefined} href={`/SkyWorldsDemo?direction=${item.id}&section=sky`}>{item.name}</a>)}</nav></details><details><summary>Research &amp; checks</summary><p>{selected ? <>Halli-approved design is now on <a href="/Lifestyle">main Lifestyle</a>.</> : "Earlier design studies remain available for comparison."}</p><a href={selected ? "/selected-lifestyle/index.html#checks" : "/sky-worlds/index.html#checks"}>Sources, tested journeys &amp; open gaps</a></details></aside>
  </main>;
}

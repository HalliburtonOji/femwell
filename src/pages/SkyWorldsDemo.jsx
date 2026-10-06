import React from "react";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";
import { SKY_WORLDS, getSkyWorld } from "@/components/lifestyle-elite/skyWorlds";
import "@/components/lifestyle-elite/SkyWorlds.css";

export default function SkyWorldsDemo() {
  const world = getSkyWorld(new URLSearchParams(window.location.search).get("direction"));
  return <main className="fw-sky-worlds" data-world={world.id}>
    <nav className="fw-world-review" aria-label="Sky design review"><a href="/Ideas">Ideas · review</a><a href="/sky-worlds/index.html">Five skies</a></nav>
    <LifestyleEliteShell enableFocus layout="bespoke" clean previewActions initialSection="sky" continuousSky celestialSky firstFoldVariant="living" dailySkyLessons artDirection="sky-worlds" skyWorld={world.id}/>
    <aside className="fw-world-review-footer"><p>{world.name}</p><nav aria-label="Five Sky demos">{SKY_WORLDS.map(item=><a key={item.id} aria-current={world.id===item.id ? "page" : undefined} href={`/SkyWorldsDemo?direction=${item.id}&section=sky`}>{item.name}</a>)}</nav><details><summary>Research &amp; checks</summary><p>Five working review designs. Main release waits for your go-ahead.</p><a href="/sky-worlds/index.html#checks">Sources, tested journeys &amp; open gaps</a></details></aside>
  </main>;
}

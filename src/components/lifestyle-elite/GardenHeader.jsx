import React, { useState } from "react";
import { Heart } from "@/components/journal/Editorial";
import { SpeciesBloom } from "@/components/brand/floraLibrary";
import { ALMANAC_TYPE } from "./AlmanacHeader";
import { SECTION_STILL } from "./sectionStills";
import { MoonDisc } from "./sky/CelestialSky";
import SkyMeaning from "./sky/SkyMeaning";

export const GARDEN_SCENES = {
  read: { name: "The curious garden", meaning: "Iris, a reading lens and a fallen petal: a small reminder that looking closely is its own kind of adventure.", line: "There is always more to notice." },
  listen: { name: "The listening garden", meaning: "Bluebells lean towards a tuning fork and rippling water. A garden for paying attention to what reaches you.", line: "Let the world lower its voice." },
  books: { name: "The story garden", meaning: "Jasmine winds through a bookmark while a fallen blossom keeps a page company. The story is allowed to take its time.", line: "A little overgrown with stories." },
  sky: { name: "The moon garden", meaning: "Morning glory grows around a little observatory. The Moon's phase and illumination are calculated; stars, solar rings and garden objects are decorative. This is a northern-view illustration, not your local sky angle.", line: "Even the stars leave room to grow." },
  good: { name: "The everyday garden", meaning: "Marigolds shelter a cup of tea. A petal has landed on the handle. Small pleasures rarely ask for a grand occasion.", line: "The kettle has excellent timing." },
};

function GardenSceneArt({ scene, species, moving, replay, onSettled }) {
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  return <>
    {failed ? <div className="little-garden-fallback" aria-hidden="true"><SpeciesBloom name={species} size={74}/></div> : <img
      key={`${replay}-${retry}`} className={`little-garden-art${moving ? " little-garden-moving" : ""}`}
      src={`/images/flora-dream/garden-${scene}-v4.webp${retry ? `?retry=${retry}` : ""}`}
      alt="" width="1254" height="1254" fetchPriority="high" onError={()=>setFailed(true)} onAnimationEnd={onSettled}/>
    }
    {failed && <button className="little-garden-retry" onClick={()=>{setRetry(n=>n+1);setFailed(false);}}>Reload garden artwork</button>}
  </>;
}

export default function GardenHeader({ active, moon }) {
  const key = active?.id === "story" ? "books" : active?.id;
  const scene = GARDEN_SCENES[key] ? key : "read";
  const cfg = GARDEN_SCENES[scene];
  const plant = SECTION_STILL[key] || SECTION_STILL.read;
  const [moving, setMoving] = useState(false);
  const [replay, setReplay] = useState(0);
  const title = (active?.title || "Something to read").trim().split(/\s+/);
  const lastWord = title.pop();
  return <header className="little-garden" data-garden={scene} data-moving={moving}>
    <style>{ALMANAC_TYPE}{`
      .little-garden{position:relative;color:#191510;--garden-ui:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}
      .little-garden-folio{display:flex;justify-content:space-between;gap:12px;padding:0 0 8px;font:500 12px/1.4 var(--garden-ui);color:#6E6A61;letter-spacing:.06em;text-transform:uppercase}
      .little-garden-stage{position:relative;isolation:isolate;aspect-ratio:1;min-height:0;background:radial-gradient(ellipse 75% 44% at 50% 66%,#EEEAF080,transparent 85%)}
      .little-garden-art{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;z-index:0}
      .little-garden-copy{position:absolute;z-index:2;left:44%;top:21%;width:47%;min-width:0}
      .little-garden h1{font:italic 600 clamp(27px,6.4vw,34px)/1.18 'FemWell Editorial',Georgia,serif!important;letter-spacing:-.02em;filter:none!important;text-shadow:none!important;margin:0!important;overflow-wrap:anywhere}
      .little-garden-last{white-space:nowrap}.little-garden-last svg{display:inline-block;vertical-align:middle;margin-left:4px}
      .little-garden-profile{font:italic 500 17px/1.3 'FemWell Editorial',Georgia,serif!important;line-height:1.3!important;color:#51444E!important;margin:12px 0 0!important}
      .little-garden-profile strong{font-weight:600!important}
      .little-garden[data-garden=read] .little-garden-copy{left:44%;top:21%;width:47%}
      .little-garden[data-garden=listen] .little-garden-copy{left:26%;top:21%;width:46%}
      .little-garden[data-garden=books] .little-garden-copy{left:29%;top:10%;width:49%}
      .little-garden[data-garden=sky] .little-garden-stage{background:radial-gradient(ellipse 70% 65% at 65% 36%,#E8E3ED90,transparent 84%)}
      .little-garden[data-garden=sky] .little-garden-copy{left:48%;top:29%;width:43%}
      .little-garden[data-garden=good] .little-garden-copy{left:44%;top:29%;width:46%}
      .little-garden[data-garden=sky] .little-garden-profile{margin-top:8px!important}
      .little-garden[data-garden=good] .little-garden-profile{max-width:90%}
      .little-garden-moon{position:absolute;top:8%;left:65%;width:23%;aspect-ratio:1;z-index:1;pointer-events:none}
      .little-garden-moon>svg{width:100%;height:100%;filter:drop-shadow(0 4px 8px #3A274026)}
      .little-garden-orbits{position:absolute;top:0;left:51%;width:46%;height:34%;z-index:0;pointer-events:none}
      .little-garden-foot{display:flex;align-items:flex-start;gap:8px;margin-top:4px;border-top:1px solid #EAE7E0}
      .little-garden-foot .sky-meaning{flex:1;min-width:0}
      .little-garden-foot .sky-meaning>div:first-child{padding-left:0!important;justify-content:flex-start!important}
      .little-garden-note{font:500 12px/1.4 var(--garden-ui)!important;color:#51444E!important;margin:0!important}
      .little-garden-motion,.little-garden-retry{font:500 12px/1.4 var(--garden-ui);color:#51444E;min-width:44px;min-height:44px;background:none;border:0;padding:0 4px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
      .little-garden-retry{position:absolute;bottom:0;right:0;z-index:3;background:#F5F4F1}
      .little-garden-fallback{position:absolute;left:0;bottom:0;opacity:.8}
      @keyframes littleGardenWake{from{transform:translateY(3px);opacity:.85}to{transform:none;opacity:1}}
      @keyframes littleGardenOrbit{from{transform:rotate(-8deg)}to{transform:none}}
      @media(prefers-reduced-motion:no-preference){.little-garden-moving{animation:littleGardenWake 3s ease-out both}.little-garden[data-moving=true] .little-garden-orbits{animation:littleGardenOrbit 3s ease-out both;transform-origin:55% 50%}}
      @media(prefers-reduced-motion:reduce){.little-garden-motion{display:none}}
      .little-garden button:focus-visible{outline:2px solid #51444E;outline-offset:3px}
    `}</style>
    <div className="little-garden-folio"><span>Lifestyle / {active?.label || "Read"}</span><span>{new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span></div>
    <div className="little-garden-stage" data-moving={moving}>
      <GardenSceneArt key={scene} scene={scene} species={plant.species} moving={moving} replay={replay} onSettled={()=>setMoving(false)}/>
      {scene==="sky" && moon && <>
        <svg className="little-garden-orbits" viewBox="0 0 180 120" fill="none" aria-hidden="true"><ellipse cx="99" cy="57" rx="71" ry="23" transform="rotate(-24 99 57)" stroke="#A8893F" strokeWidth=".65"/><ellipse cx="99" cy="57" rx="52" ry="47" transform="rotate(23 99 57)" stroke="#D9C79B" strokeWidth=".65"/><path d="M22 19v8m-4-4h8M149 98v6m-3-3h6M61 7v5m-2.5-2.5h5" stroke="#A8893F" strokeWidth=".8"/><g transform={`rotate(${(moon.position||0)*360} 99 57)`}><circle cx="99" cy="10" r="2.5" fill="#A8893F"/></g></svg>
        <div className="little-garden-moon"><MoonDisc textured position={moon.position} size={88} label={`${moon.name}, approximately ${moon.illumination}% illuminated`}/></div>
      </>}
      <div className="little-garden-copy"><h1>{title.join(" ")}{title.length>0 && " "}<span className="little-garden-last">{lastWord}<Heart size={13}/></span></h1><p className="little-garden-profile"><strong>{plant.flower.name}</strong><br/>{plant.flower.note}</p></div>
    </div>
    <div className="little-garden-foot"><SkyMeaning key={scene} label={cfg.name.toLowerCase()} explanation={cfg.meaning}><p className="little-garden-note">{scene==="sky" && moon ? `${moon.illumination}% illuminated · above us` : cfg.line}</p></SkyMeaning><button className="little-garden-motion" aria-label={moving ? "Still the garden" : "Replay garden movement"} onClick={()=>{setMoving(!moving);setReplay(n=>n+1);}}>{moving ? "Still" : "Replay"}</button></div>
  </header>;
}

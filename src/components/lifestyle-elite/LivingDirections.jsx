import React, { useState } from "react";
import { Heart } from "@/components/journal/Editorial";
import { SpeciesBloom } from "@/components/brand/floraLibrary";
import { SECTION_STILL } from "./sectionStills";
import { ALMANAC_TYPE } from "./AlmanacHeader";
import { MoonDisc } from "./sky/CelestialSky";
import SkyMeaning from "./sky/SkyMeaning";
import "./LivingDirections.css";

export const LIVING_DIRECTIONS = [
  { id: "letter", name: "Open Letter", line: "An open page, a garden at the margin." },
  { id: "horizon", name: "Garden Horizon", line: "A little landscape. A generous clearing." },
  { id: "observatory", name: "Quiet Observatory", line: "One beautiful thing to pause beside." },
  { id: "field", name: "Field Notes", line: "Close looking, useful little discoveries." },
  { id: "path", name: "Garden Path", line: "A garden that follows the conversation." },
];
export const isLivingDirection = id => LIVING_DIRECTIONS.some(direction => direction.id === id);

const SCENES = {
  sky: { line: "A little wonder. Both feet on the ground.", meaning: "Morning glory follows the day's turning. The Moon's phase and illumination are calculated; the gold orbit, stars and petals are garden art. A northern-view illustration, not the Moon's position above your home." },
  read: { line: "Leave a little room for a new thought.", meaning: "Iris carries a message: the courage to begin a page. The gold reading lens is a garden motif, not a measure of your reading." },
  listen: { line: "Something good between you and the noise.", meaning: "Bluebell stands for constancy — a sound that keeps. The ripples are an imagined echo; your actual listening controls live just below." },
  books: { line: "The story can wait. Your place will keep.", meaning: "Jasmine stands for devoted attachment — the story that keeps. A small bookmark and wandering stem make room for your shelf and today's chapter." },
  good: { line: "Small pleasures. Exceptionally good timing.", meaning: "Marigold carries warmth and the small joy. The little sun is a garden ornament, not a target or a promise about how you should feel." },
  yours: { line: "Some things are worth coming back to.", meaning: "Forget-me-not is what she keeps. The open fold is a place-holder for your own saves, never an invented collection." },
};

function SectionObject({ section, moon }) {
  if (section === "sky") return moon ? <MoonDisc textured position={moon.position} size={112} label={`${moon.name}, approximately ${moon.illumination}% illuminated`}/> : null;
  return <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
    {section === "read" ? <><circle cx="55" cy="50" r="30"/><circle cx="55" cy="50" r="26" opacity=".4"/><path d="m76 72 26 26"/></> :
      section === "listen" ? <><ellipse cx="60" cy="71" rx="43" ry="13"/><ellipse cx="60" cy="71" rx="29" ry="8" opacity=".45"/><path d="M51 18v33q9 14 18 0V18M60 57v32"/></> :
      section === "books" ? <><path d="M36 17h47v81L60 82 36 98Z"/><path d="M44 24h31M44 31h19" opacity=".5"/></> :
      section === "good" ? <><circle cx="60" cy="56" r="24"/>{Array.from({length:12},(_,i)=><path key={i} d="M60 20v7" transform={`rotate(${i*30} 60 56)`}/>)}<path d="M24 96h72" opacity=".4"/></> : <><path d="M22 30h76v60H22Z"/><path d="m22 30 38 33 38-33M22 90l27-27m49 27L71 63"/></>}
  </svg>;
}

// All five are complete shell compositions; this component only owns their masthead art.
export default function LivingDirectionHeader({ active, moon, direction }) {
  const section = active?.id === "story" ? "books" : (active?.id || "sky");
  const plant = SECTION_STILL[section] || SECTION_STILL.read;
  const scene = SCENES[section] || SCENES.read;
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [moving, setMoving] = useState(false);
  const [replay, setReplay] = useState(0);
  const words = (active?.title || "A few good things").trim().split(/\s+/);
  const last = words.pop();
  const art = section === "sky" ? "living-growth-v1" : `specimen-${plant.species}-v2`;
  return <header className="fw-living-header" data-direction={direction} data-plant={section} data-moving={moving}>
    <style>{ALMANAC_TYPE}</style>
    <div className="fw-living-folio"><span>Lifestyle / {active?.label || "Sky"}</span><time>{new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long"})}</time></div>
    <div className="fw-living-stage">
      <div className="fw-living-growth" key={`${section}-${replay}`} onAnimationEnd={()=>setMoving(false)} aria-hidden="true">
        {failed ? <SpeciesBloom name={plant.species} size={96}/> : <img src={`/images/flora-dream/${art}.webp${retry ? `?retry=${retry}` : ""}`} alt="" width={section === "sky" ? 900 : 640} height={section === "sky" ? 1200 : 640} fetchPriority="high" onError={()=>setFailed(true)}/>}
      </div>
      <div className="fw-living-object"><SectionObject section={section} moon={moon}/>
        {section === "sky" && <svg className="fw-living-orbit" viewBox="0 0 180 180" fill="none" aria-hidden="true"><path d="M22 126C-2 43 43 8 93 10s95 53 71 114"/><path d="M19 49v9m-4.5-4.5h9M147 140v7m-3.5-3.5h7"/><g transform={`rotate(${(moon?.position || 0)*360} 90 90)`}><circle cx="90" cy="10" r="2.5" fill="currentColor" stroke="none"/></g></svg>}
      </div>
      <div className="fw-living-copy"><h1>{words.join(" ")}{words.length>0 && " "}<span className="fw-living-last">{last}<Heart size={14}/></span></h1><p className="fw-living-flower"><strong>{plant.flower.name}</strong><br/>{plant.flower.note}</p></div>
      {section === "sky" && <img className="fw-living-petals" src="/images/flora-dream/living-petals-v1.webp" alt="" width="640" height="360"/>}
    </div>
    <div className="fw-living-caption"><SkyMeaning label={`${active?.label?.toLowerCase() || "sky"} garden`} explanation={scene.meaning}><span>{section === "sky" && moon ? `${moon.illumination}% illuminated · above us` : scene.line}</span></SkyMeaning>
      {failed ? <button onClick={()=>{setRetry(n=>n+1);setFailed(false);}}>Reload artwork</button> : <button className="fw-living-replay" aria-label={moving ? "Still the garden" : "Replay garden movement"} onClick={()=>{setMoving(!moving);setReplay(n=>n+1);}}>{moving ? "Still" : "Replay"}</button>}
    </div>
  </header>;
}

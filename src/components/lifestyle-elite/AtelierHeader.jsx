import React, { useState } from "react";
import { Heart } from "@/components/journal/Editorial";
import { SpeciesBloom } from "@/components/brand/floraLibrary";
import { SECTION_STILL } from "./sectionStills";
import { ALMANAC_TYPE } from "./AlmanacHeader";
import { MoonDisc } from "./sky/CelestialSky";
import SkyMeaning from "./sky/SkyMeaning";
import "./LivingAtelier.css";

const NOTES = {
  read: "A thought worth making room for.",
  listen: "Let the world wait a moment.",
  books: "The washing-up can wait a chapter.",
  good: "A small pleasure. No special occasion.",
  yours: "A little collection, entirely yours.",
};

// Decorative art is separate from every measured fact and control.
export function AtelierIncident({ kind = "petal" }) {
  return <div className={`fw-atelier-incident fw-atelier-incident--${kind}`} aria-hidden="true">
    <img src={`/images/living-atelier/${kind === "growth" ? "margin" : "petals"}-${kind === "growth" ? "v1" : "v2"}.webp`} alt="" loading="lazy" width={kind === "growth" ? 1086 : 1774} height={kind === "growth" ? 1448 : 887}/>
  </div>;
}

export default function AtelierHeader({ active, moon }) {
  const section = active?.id === "story" ? "books" : active?.id || "sky";
  const plant = SECTION_STILL[section] || SECTION_STILL.sky;
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [moving, setMoving] = useState(false);
  const [arrival, setArrival] = useState(0);
  const title = (active?.title || "Your sky").trim();
  const words = title.split(/\s+/); const last = words.pop();
  const sky = section === "sky";
  const explanation = sky
    ? "The Moon’s phase and illumination are calculated. The engraved sun, brass arcs and morning glory are original garden art, not your birth chart or local sky map. Northern-view illustration."
    : `${plant.flower.name} carries ${plant.flower.note}. The botanical drawing is garden art; your real reads, listens, chapters and keepsakes live below.`;
  const src = sky ? "/images/living-atelier/canopy-v1.webp" : `/images/flora-dream/specimen-${plant.species}-v2.webp`;
  return <header className="fw-atelier-header" data-garden={section} data-moving={moving}>
    <style>{ALMANAC_TYPE}</style>
    <div className="fw-atelier-folio"><span>Lifestyle / {active?.label || "Sky"}</span><time>{new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long"})}</time></div>
    <div className="fw-atelier-canopy">
      <div className="fw-atelier-canopy-art" key={`${arrival}-${attempt}`} aria-hidden="true" onAnimationEnd={()=>setMoving(false)}>
        {failed ? <SpeciesBloom name={plant.species} size={110}/> : <img src={`${src}${attempt ? `?retry=${attempt}` : ""}`} alt="" width={sky ? 1774 : 640} height={sky ? 887 : 640} fetchPriority="high" onError={()=>setFailed(true)}/>}
      </div>
      {sky && moon && <div className="fw-atelier-live-moon"><MoonDisc textured position={moon.position} size={84} label={`${moon.name}, approximately ${moon.illumination}% illuminated`}/></div>}
      {!sky && <div className="fw-atelier-section-trace" aria-hidden="true"><svg viewBox="0 0 160 80" fill="none">
        {section === "read" ? <><path d="M4 60C25 25 56 18 92 20M20 60c18-12 35-14 51-7m0-24v38M71 53c24-13 43-12 70-3"/><path d="M15 49c18-14 34-17 50-10m18 0c18-5 34-2 47 4"/></> :
          section === "listen" ? <><path d="M7 48c22-30 26 30 48 0s26 30 48 0 26 30 48 0M7 62c22-20 26 20 48 0s26 20 48 0 26 20 48 0"/></> :
          section === "books" ? <><path d="M12 59V22q31-12 62 2v43q-29-13-62-8ZM74 24q31-14 62-2v37q-33-5-62 8M23 32q20-5 37 1m28 0q19-6 37-1"/></> :
          section === "good" ? <><path d="M15 60h94M26 34h63v9a27 27 0 0 1-54 0v-9Zm63 3h8q17 1 10 14c-3 5-8 7-17 6M48 23c-11-9 11-8 0-19m18 19c-11-9 11-8 0-19"/></> :
          <><path d="M18 13v47q29-6 50 4V21q-26-13-50-8ZM68 21q26-13 50-8v47q-29-6-50 4M33 32h19m-19 10h19m31-10h19"/><path d="M129 15v38l8-5 8 5V15Z"/></>}
      </svg></div>}
    </div>
    <div className="fw-atelier-header-words"><h1 className={words.length < 4 ? "fw-display" : "fw-heading"}>{words.join(" ")}{words.length>0 && " "}<span>{last}<Heart size={14}/></span></h1>
      {sky && <svg className="fw-atelier-thread" viewBox="0 0 60 90" fill="none" aria-hidden="true"><path d="M52 1C55 25 45 36 27 40S2 59 18 72c8 7 21 6 27-3"/><path d="M45 69c-3-5-6-6-10-5 1 5 4 7 10 5Z"/></svg>}
      <p className="fw-atelier-flower"><strong>{plant.flower.name}</strong><span>{plant.flower.note}</span></p>
    </div>
    <div className="fw-atelier-caption"><SkyMeaning label={`${active?.label?.toLowerCase() || "sky"} artwork`} explanation={explanation}><span>{sky ? moon ? `${moon.illumination}% illuminated · astronomy` : "Moon data unavailable" : NOTES[section]}</span></SkyMeaning>
      {failed ? <button type="button" onClick={()=>{setAttempt(n=>n+1);setFailed(false);}}>Reload artwork</button> : <button type="button" className="fw-atelier-replay" aria-label={moving ? "Still the artwork" : "Replay artwork movement"} onClick={()=>{setMoving(v=>!v);setArrival(n=>n+1);}}>{moving ? "Still" : "Replay"}</button>}
    </div>
  </header>;
}

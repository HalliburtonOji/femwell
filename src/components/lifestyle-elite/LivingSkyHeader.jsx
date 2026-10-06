import React, { useEffect, useState } from "react";
import { Heart } from "@/components/journal/Editorial";
import { SpeciesBloom } from "@/components/brand/floraLibrary";
import { ALMANAC_TYPE } from "./AlmanacHeader";
import { SECTION_STILL } from "./sectionStills";
import { MoonDisc } from "./sky/CelestialSky";
import SkyMeaning from "./sky/SkyMeaning";
import "./LivingSkyHeader.css";

// Review-only page composition. The shell still owns all state and actions.
export default function LivingSkyHeader({ active, moon, breeze = false }) {
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [moving, setMoving] = useState(breeze);
  const [arrival, setArrival] = useState(0);
  useEffect(() => {
    if (!breeze || !moving) return undefined;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const still = () => { if (preference.matches) setMoving(false); };
    if (preference.matches) { setMoving(false); return undefined; }
    const timer = window.setTimeout(()=>setMoving(false),6500);
    preference.addEventListener?.("change",still);
    return ()=>{ window.clearTimeout(timer); preference.removeEventListener?.("change",still); };
  },[breeze,moving,arrival]);
  const words = (active?.title || "Your sky today").trim().split(/\s+/);
  const last = words.pop();
  const flower = SECTION_STILL.sky.flower;
  return <header className="living-sky-header" data-moving={moving} data-breeze={breeze || undefined}>
    <style>{ALMANAC_TYPE}</style>
    <div className="living-sky-folio"><span>Lifestyle / Sky</span><time>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</time></div>
    <div className="living-sky-stage">
      {breeze && <div className="living-sky-bud" key={arrival} aria-hidden="true"><img src="/images/living-atelier/margin-v1.webp" alt="" width="1086" height="1448"/></div>}
      {failed ? <div className="living-sky-fallback"><span aria-hidden="true"><SpeciesBloom name="morning-glory" size={96}/></span><button onClick={()=>{setRetry(n=>n+1);setFailed(false);}}>Reload garden artwork</button></div> : <img className="living-sky-growth" src={`/images/flora-dream/living-growth-v1.webp${retry ? `?retry=${retry}` : ""}`} width="900" height="1200" alt="" fetchPriority="high" onError={()=>setFailed(true)}/>}
      {moon && <div className="living-sky-lunar">
        <svg key={arrival} className={moving ? "living-sky-orbit is-moving" : "living-sky-orbit"} onAnimationEnd={()=>setMoving(false)} viewBox="0 0 180 180" fill="none" aria-hidden="true"><path d="M20 95C10 25 80 0 120 18C155 30 171 67 165 100" stroke="currentColor" strokeWidth=".65"/><path d="M23 41v10m-5-5h10M146 130v7m-3.5-3.5h7" stroke="currentColor" strokeWidth=".8"/><g transform={`rotate(${(moon.position || 0)*360} 90 90)`}><circle cx="90" cy="13" r="2.5" fill="currentColor"/></g></svg>
        <MoonDisc textured position={moon.position} size={116} label={`${moon.name}, approximately ${moon.illumination}% illuminated`}/>
      </div>}
      <div className="living-sky-copy"><h1>{words.join(" ")}{words.length>0 && " "}<span className="living-sky-last">{last}<Heart size={14}/></span></h1><p className="living-sky-profile"><strong>{flower.name}</strong><br/>{flower.note}</p></div>
    </div>
    <div className="living-sky-caption"><SkyMeaning label="the moon garden" explanation="The Moon's shape and illumination are calculated. The tendril, stars and open orbit are an imagined garden, not a map of your local sky. This is a northern-view illustration."><span>{moon ? `${moon.illumination}% illuminated · above us` : "A little wonder, rooted here."}</span></SkyMeaning><button className="living-sky-motion" aria-label={moving ? "Still the garden" : "Replay garden movement"} onClick={()=>{setMoving(v=>!v);setArrival(n=>n+1);}}>{moving ? "Still" : "Replay"}</button></div>
  </header>;
}


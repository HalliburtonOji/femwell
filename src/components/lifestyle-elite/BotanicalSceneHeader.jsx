import React, { useState } from "react";
import { C } from "@/components/brand/cleanTokens";
import { Heart, SERIF, UI } from "@/components/journal/Editorial";
import { SectionStill, SECTION_STILL } from "./sectionStills";
import { CelestialHeader } from "./sky/CelestialSky";

// Review-only treatment of the existing header slot. Its controls stay in the shell.
export default function BotanicalSceneHeader({ active, moon }) {
  const section = active?.id || active?.key || "read";
  const still = SECTION_STILL[section] || SECTION_STILL.read;
  const [imageFailed, setImageFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const sky = section === "sky";
  return <div className={`botanical-scene${sky ? " botanical-scene--sky" : ""}`} data-section={section}>
    <style>{`
      .botanical-scene{position:relative;color:${C.ink};background:radial-gradient(ellipse 70% 42% at 48% 37%,${still.tint}bb,${C.ground}00 100%)}
      .botanical-scene-stage{position:relative;height:250px;isolation:isolate}
      .botanical-scene-art{position:absolute;inset:0;pointer-events:none;mask-image:radial-gradient(ellipse 64% 58% at 50% 50%,#000 36%,#000b 58%,transparent 85%);-webkit-mask-image:radial-gradient(ellipse 64% 58% at 50% 50%,#000 36%,#000b 58%,transparent 85%)}
      .botanical-scene-art img{width:100%;height:100%;object-fit:cover;object-position:37% 48%;display:block}
      .botanical-scene-art [aria-hidden]{background:transparent!important}
      .botanical-scene-art [aria-hidden]>div:last-child{display:none}
      .botanical-scene-band{padding:0 4px 4px;text-align:center}
      .botanical-scene-band h1{font:italic 600 clamp(27px,6.4vw,34px)/1.18 ${SERIF};color:${C.ink};text-shadow:none;margin:0}
      .botanical-scene-profile{font:500 italic 15px/1.4 ${SERIF};color:${C.slate};margin:7px 0 0}
      .botanical-scene--sky .sky-moon-header h1{font:italic 600 clamp(27px,6.4vw,34px)/1.18 ${SERIF}!important}
      .botanical-scene--sky .sky-moon-header>p:first-of-type{margin:0!important}
      .botanical-scene--sky .sky-clock-stage{height:250px!important;width:250px!important;background:transparent!important}
      .botanical-scene button:focus-visible{outline:2px solid ${C.ink};outline-offset:3px}
      @media(prefers-reduced-motion:no-preference){.botanical-scene-art{animation:botanicalReveal .7s ease-out both}}
      @keyframes botanicalReveal{from{opacity:.65;transform:translateY(4px)}to{opacity:1;transform:none}}
    `}</style>
    {sky ? <CelestialHeader moon={moon} title={active?.title} flowerProfile={`${still.flower.name} — ${still.flower.note}`} /> : <>
      <div className="botanical-scene-stage">
        <div key={section} className="botanical-scene-art" aria-hidden="true">
          {section === "read" && !imageFailed
            ? <img src={`/images/flora-dream/observatory-dawn.webp${retry ? `?retry=${retry}` : ""}`} alt="" width="1200" height="800" onError={()=>setImageFailed(true)} />
            : <SectionStill sectionKey={section} height={280} />}
        </div>
      </div>
      <div className="botanical-scene-band">
        <h1>{active?.title || "Something to read"} <Heart size={15}/></h1>
        <p className="botanical-scene-profile">{still.flower.name} — {still.flower.note}</p>
        {section === "read" && imageFailed && <button onClick={()=>{setRetry(v=>v+1);setImageFailed(false);}} style={{minHeight:44,background:"transparent",border:0,color:C.ink,font:`600 12px ${UI}`,textDecoration:"underline"}}>Reload iris artwork</button>}
      </div>
    </>}
  </div>;
}

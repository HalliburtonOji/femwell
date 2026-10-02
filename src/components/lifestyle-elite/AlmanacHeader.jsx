import React, { useState } from "react";
import { Heart } from "@/components/journal/Editorial";
import { SpeciesBloom } from "@/components/brand/floraLibrary";
import { SECTION_STILL } from "./sectionStills";
import { MoonDisc } from "./sky/CelestialSky";
import SkyMeaning from "./sky/SkyMeaning";

// Same Cormorant files as the brand face; this preview measures actual type rather
// than inheriting the app's 150% font-face magnification. No global font changes.
export const ALMANAC_TYPE = `
@font-face{font-family:'FemWell Editorial';font-style:normal;font-weight:400 700;font-display:swap;src:url(https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYpHtKky2F7i6C.woff2) format('woff2')}
@font-face{font-family:'FemWell Editorial';font-style:italic;font-weight:400 700;font-display:swap;src:url(https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSqn7B6D.woff2) format('woff2')}
`;

function BotanicalArt({ species, moving, arrival, onFinish }) {
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  return <div className="almanac-specimen">
    {failed ? <><div aria-hidden="true"><SpeciesBloom name={species} size={130}/></div><button className="almanac-retry" onClick={()=>{setRetry(n=>n+1);setFailed(false);}}>Reload artwork</button></> :
      <img key={`${arrival}-${retry}`} className={moving ? "almanac-growing" : undefined} onAnimationEnd={onFinish} onError={()=>setFailed(true)} src={`/images/flora-dream/specimen-${species}-v2.webp${retry ? `?retry=${retry}` : ""}`} width="640" height="640" alt="" fetchPriority="high"/>}
  </div>;
}

export default function AlmanacHeader({ active, moon, variant="almanac" }) {
  const section = active?.id || "read";
  const plant = SECTION_STILL[section] || SECTION_STILL.read;
  const sky = section === "sky";
  const [moving, setMoving] = useState(false);
  const [arrival, setArrival] = useState(0);
  const words = (active?.title || "Something to read").split(/\s+/);
  const last = words.pop();
  return <header className={`almanac-header almanac-header--${variant}`} data-section={section}>
    <style>{ALMANAC_TYPE}{`
      .almanac-header{--botanical-tint:${plant.tint};position:relative;color:#191510;padding:8px 0 0;isolation:isolate}
      .almanac-header *{box-sizing:border-box}
      .almanac-folio{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 0 12px;border-bottom:1px solid #D9C79B;font:500 12px/1.4 ui-sans-serif,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#6E6A61}
      .almanac-composition{position:relative;isolation:isolate;display:grid;grid-template-columns:55% 45%;align-items:center;min-height:205px}
      .almanac-heading{position:relative;z-index:2;padding:18px 0}
      .almanac-header h1{font:italic 500 34px/1.02 'FemWell Editorial',Georgia,serif!important;letter-spacing:-.025em!important;filter:none!important;text-shadow:none!important;margin:0!important;overflow-wrap:anywhere}
      .almanac-heart{white-space:nowrap}.almanac-heart svg{display:inline-block;vertical-align:middle;margin-left:3px}
      .almanac-flower{font:italic 500 17px/1.25 'FemWell Editorial',Georgia,serif!important;color:#6E6A61!important;margin:12px 0 0!important;max-width:210px}
      .almanac-flower strong{font-weight:600!important;color:#51444E}
      .almanac-art{position:relative;align-self:stretch;min-height:205px;pointer-events:none}
      .almanac-art:before{content:'';position:absolute;inset:12% -10% 0 -12%;background:radial-gradient(ellipse,var(--botanical-tint),transparent 70%);z-index:-1}
      .almanac-specimen{position:absolute;inset:-8px 0 -4px -16px;display:grid;place-content:center;pointer-events:none}
      .almanac-specimen img{display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(2px 7px 5px #392B3610)}
      .almanac-header[data-section=sky] .almanac-specimen{inset:46px 0 0 -22px;z-index:1}
      .almanac-moon{position:absolute;right:7px;top:15px;z-index:2;filter:drop-shadow(0 5px 12px #44304618)}
      .almanac-orbit{position:absolute;right:-8px;top:0;width:128px;height:128px;opacity:.75}
      .almanac-footer{border-top:1px solid #E0DDD6;display:flex;align-items:flex-start;gap:8px;min-height:44px}
      .almanac-footer .sky-meaning{flex:1;min-width:0}
      .almanac-footer .sky-meaning>div:first-child{justify-content:flex-start!important;padding-left:0!important}
      .almanac-fact{font:500 12px/1.4 ui-sans-serif,system-ui,sans-serif!important;letter-spacing:0;margin:0!important;color:#51444E}
      .almanac-motion,.almanac-retry{min-height:44px;min-width:44px;background:none;border:0;padding:0 3px;color:#51444E;font:500 12px/1.4 ui-sans-serif,system-ui,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer;pointer-events:auto}
      .almanac-retry{position:absolute;bottom:0;right:0;background:#F5F4F1}
      .almanac-header--canopy .almanac-composition{display:block;min-height:0;padding-top:150px;background:radial-gradient(ellipse 80% 50% at 70% 24%,var(--botanical-tint),transparent 80%)}
      .almanac-header--canopy .almanac-heading{padding:6px 0 18px}
      .almanac-header--canopy .almanac-flower{max-width:none;margin-top:8px!important}
      .almanac-header--canopy .almanac-flower br{display:none}
      .almanac-header--canopy .almanac-flower strong:after{content:' — '}
      .almanac-header--canopy .almanac-art{position:absolute;right:0;top:0;width:100%;height:150px;min-height:0;z-index:0}
      .almanac-header--canopy .almanac-specimen{inset:4px 24px 0 70px;transform:rotate(24deg)}
      .almanac-header--canopy[data-section=sky] .almanac-specimen{inset:8px 28px 0 56px;transform:rotate(34deg)}
      .almanac-header--canopy .almanac-moon{right:54px;top:13px}
      .almanac-header--canopy .almanac-orbit{right:39px;top:-2px}
      .almanac-header--canopy h1{font-size:38px!important}
      @keyframes almanacUnfurl{from{transform:translateY(5px) rotate(-3deg)}to{transform:none}}
      @media(prefers-reduced-motion:no-preference){.almanac-growing{animation:almanacUnfurl 3s cubic-bezier(.2,.7,.3,1) both}}
      @media(prefers-reduced-motion:reduce){.almanac-motion{display:none}}
      .almanac-header button:focus-visible{outline:2px solid #51444E;outline-offset:2px}
    `}</style>
    <div className="almanac-folio"><span>Lifestyle / {active?.label || "Read"}</span><span>{new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span></div>
    <div className="almanac-composition">
      <div className="almanac-heading"><h1>{words.join(" ")}{words.length>0 && " "}<span className="almanac-heart">{last}<Heart size={13}/></span></h1><p className="almanac-flower"><strong>{plant.flower.name}</strong><br/>{plant.flower.note}</p></div>
      <div className="almanac-art">
        {sky && moon && <><svg className="almanac-orbit" viewBox="0 0 128 128" aria-hidden="true"><circle cx="64" cy="64" r="57" fill="none" stroke="#A8893F" strokeWidth=".5" strokeDasharray="1 6"/><g transform={`rotate(${(moon.position||0)*360} 64 64)`}><circle cx="64" cy="7" r="3" fill="#A8893F"/></g></svg><div className="almanac-moon"><MoonDisc textured position={moon.position} size={98} label={`${moon.name}, approximately ${moon.illumination}% illuminated`}/></div></>}
        <BotanicalArt key={plant.species} species={plant.species} moving={moving} arrival={arrival} onFinish={()=>setMoving(false)}/>
      </div>
    </div>
    <div className="almanac-footer">
      <SkyMeaning label={sky ? "the lunar clock" : `${plant.flower.name.toLowerCase()} symbolism`} explanation={sky ? "The dot follows the Moon's roughly 29½-day cycle. Its shape and illumination are calculated; the flowers are art. This is a northern-view illustration, not your local sky angle." : `${plant.flower.name} is this section's flower: ${plant.flower.note}. A little borrowed flower language, held as a metaphor—not a claim about how you feel.`}><p className="almanac-fact">{sky && moon ? `${moon.illumination}% illuminated · above us` : "A little flower language"}</p></SkyMeaning>
      <button className="almanac-motion" aria-label={moving ? "Still the botanical artwork" : "Replay botanical movement"} onClick={()=>{setMoving(!moving);setArrival(n=>n+1);}}>{moving ? "Still" : "Replay"}</button>
    </div>
  </header>;
}

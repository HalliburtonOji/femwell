import React, { useEffect, useState } from "react";
import { Heart } from "@/components/journal/Editorial";
import { SpeciesBloom } from "@/components/brand/floraLibrary";
import { ALMANAC_TYPE } from "./AlmanacHeader";
import { SECTION_STILL } from "./sectionStills";
import { MoonDisc } from "./sky/CelestialSky";
import SkyMeaning from "./sky/SkyMeaning";
import ReadingRoomHeader from "./ReadingRoomHeader";
import GardenHeader from "./GardenHeader";
import LivingDirectionHeader from "./LivingDirections";
import { getSkyWorld } from "./skyWorlds";
import "./SkyWorlds.css";

export default function SkyWorldHeader({ active, moon, direction }) {
  const world = getSkyWorld(direction);
  const section = active?.id === "story" ? "books" : active?.id;
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [moving, setMoving] = useState(false);
  const [arrival, setArrival] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(preference.matches);
      if (preference.matches) setMoving(false);
    };
    update();
    preference.addEventListener?.("change", update);
    return () => preference.removeEventListener?.("change", update);
  }, []);
  useEffect(() => {
    setFailed(false);
    setAttempt(0);
    setMoving(section === "sky" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setArrival(value => value + 1);
  }, [world.id, section]);
  useEffect(() => {
    if (!moving || reduced) return undefined;
    const timer = window.setTimeout(() => setMoving(false), 4200);
    return () => window.clearTimeout(timer);
  }, [moving, arrival, reduced]);

  if (section === "books") return <div className="fw-reading-room"><ReadingRoomHeader active={active} moon={moon}/></div>;
  if (section === "yours") return <LivingDirectionHeader active={active} moon={moon} direction="letter"/>;
  if (section !== "sky") return <GardenHeader active={active} moon={moon}/>;
  const words = (active?.title || "Your sky today").trim().split(/\s+/);
  const last = words.pop();
  const flower = SECTION_STILL.sky.flower;
  const moonLabel = moon ? `${moon.name}, approximately ${moon.illumination}% illuminated` : "";

  return <header className="fw-world-header" data-header-world={world.id} data-moving={moving && !reduced}>
    <style>{ALMANAC_TYPE}</style>
    <div className="fw-world-folio"><span>Lifestyle / Sky</span><time dateTime={new Date().toLocaleDateString("en-CA")}>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</time></div>
    <div className="fw-world-scene">
      <div className="fw-world-art-plane">
        {moon && <div className="fw-world-moon" style={{ left: `${world.moon.x}%`, top: `${world.moon.y}%`, width: `${world.moon.size}%` }}><MoonDisc textured position={moon.position} size={100} label={moonLabel}/></div>}
        {failed ? <div className="fw-world-bloom-fallback" aria-hidden="true"><SpeciesBloom name="morning-glory" size={100}/></div> : <img key={`${world.id}-${arrival}-${attempt}`} className="fw-world-art" src={`${world.asset}${attempt ? `?retry=${attempt}` : ""}`} width="1536" height="1024" alt="" fetchPriority="high" onError={() => setFailed(true)}/>}
      </div>
    </div>
    <div className="fw-world-clearing">
      <h1>{words.join(" ")}{words.length > 0 && " "}<span className="fw-world-last">{last}<Heart size={14}/></span></h1>
      <p className="fw-world-flower"><strong>{flower.name}</strong><span>{flower.note}</span></p>
    </div>
    <div className="fw-world-caption">
      <SkyMeaning label="this Moon" explanation="The percentage shows how much of the Moon’s face is sunlit. Its angle can look different from where you are."><span>{moon ? `${moon.illumination}% lit · ${world.caption}` : "Moon details aren’t here yet."}</span></SkyMeaning>
      {!reduced && <button type="button" className="fw-world-motion" aria-label={moving ? "Still the garden" : "Replay garden movement"} onClick={() => { setMoving(value => !value); setArrival(value => value + 1); }}>{moving ? "Still" : "Replay"}</button>}
    </div>
    {failed && <button type="button" className="fw-world-art-retry" onClick={() => { setAttempt(value => value + 1); setFailed(false); }}>Reload garden artwork</button>}
  </header>;
}

import React, { useEffect, useState } from "react";
import { Heart } from "@/components/journal/Editorial";
import { SpeciesBloom } from "@/components/brand/floraLibrary";
import { SECTION_STILL } from "./sectionStills";
import { ALMANAC_TYPE } from "./AlmanacHeader";
import { MoonDisc } from "./sky/CelestialSky";
import SkyMeaning from "./sky/SkyMeaning";
import ReadingRoomHeader from "./ReadingRoomHeader";
import "./SelectedLifestyle.css";

// Text, account state and controls remain live; only the scene is raster art.
export default function SelectedLifestyleHeader({ active, moon }) {
  const requested = active?.id === "story" ? "books" : active?.id;
  const section = ["read", "listen", "books", "sky", "good", "yours"].includes(requested) ? requested : "read";
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [moving, setMoving] = useState(false);
  const [arrival, setArrival] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { setReduced(preference.matches); if (preference.matches) setMoving(false); };
    update();
    preference.addEventListener?.("change", update);
    return () => preference.removeEventListener?.("change", update);
  }, []);
  useEffect(() => {
    setFailed(false);
    setAttempt(0);
    setMoving(section !== "books" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setArrival(value => value + 1);
  }, [section]);
  useEffect(() => {
    if (!moving || reduced) return undefined;
    const timer = window.setTimeout(() => setMoving(false), 4200);
    return () => window.clearTimeout(timer);
  }, [moving, reduced, arrival]);

  if (section === "books") return <div className="fw-reading-room"><ReadingRoomHeader active={active} moon={moon}/></div>;
  const plant = SECTION_STILL[section];
  const words = (active?.title || { read: "Something to read", listen: "Something to hear", sky: "Your sky today", good: "The good life", yours: "What you’ve kept" }[section]).trim().split(/\s+/);
  const last = words.pop();
  const names = { read: "Read", listen: "Listen", sky: "Sky", good: "Good life", yours: "Yours" };
  const meanings = {
    read: "Iris carries a message. Start with whichever catches you.",
    listen: "Bluebell means constancy. A good companion for the long way home.",
    good: "Marigold brings warmth. No productive reason required.",
    yours: "Forget-me-not means remembrance. You get to decide what stays.",
    sky: "The percentage shows how much of the Moon’s face is sunlit. Its angle can look different from where you are.",
  };
  const captions = { read: "A page worth your time.", listen: "Press play. Take the long way.", good: "A little pleasure counts.", yours: "Good things, kept close." };
  const now = new Date();
  const dateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const asset = section === "sky" ? "/images/sky-worlds/petal-v1.webp" : `/images/selected-lifestyle/${section}-v1.webp`;

  return <header className="fw-selected-header" data-header-world={section === "sky" ? "petal-press" : undefined} data-selected-section={section} data-moving={moving && !reduced}>
    <style>{ALMANAC_TYPE}</style>
    <div className="fw-selected-folio"><span>Lifestyle / {active?.overview ? "Everything" : names[section]}</span><time dateTime={dateTime}>{now.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</time></div>
    <div className="fw-selected-scene"><div className="fw-selected-art-plane">
      {section === "sky" && moon && <div className="fw-selected-moon"><MoonDisc textured position={moon.position} size={100} label={`${moon.name}, approximately ${moon.illumination}% illuminated`}/></div>}
      {failed ? <div className="fw-selected-bloom-fallback" aria-hidden="true"><SpeciesBloom name={plant.species} size={105}/></div> : <img key={`${section}-${arrival}-${attempt}`} className="fw-selected-art" src={`${asset}${attempt ? `?retry=${attempt}` : ""}`} width="1536" height="1024" alt="" fetchPriority="high" onError={() => setFailed(true)}/>}
    </div></div>
    <div className="fw-selected-clearing"><h1>{words.join(" ")}{words.length > 0 && " "}<span className="fw-selected-last">{last}<Heart size={14}/></span></h1><p className="fw-selected-flower"><strong>{plant.flower.name}</strong><span>{plant.flower.note}</span></p></div>
    <div className="fw-selected-caption"><SkyMeaning label={section === "sky" ? "this Moon" : plant.flower.name} explanation={meanings[section]}><span>{section === "sky" ? (moon ? `${moon.illumination}% lit · a little borrowed light.` : "Moon details aren’t here yet.") : active?.overview ? "A few good things. Choose your own order." : captions[section]}</span></SkyMeaning>{!reduced && <button type="button" className="fw-selected-motion" aria-label={section === "sky" ? (moving ? "Still the garden" : "Replay garden movement") : (moving ? "Still scene light" : "Replay scene light")} onClick={() => { setMoving(value => !value); setArrival(value => value + 1); }}>{moving ? "Still" : "Replay"}</button>}</div>
    {failed && <button type="button" className="fw-selected-retry" onClick={() => { setAttempt(value => value + 1); setFailed(false); }}>Reload garden artwork</button>}
  </header>;
}

// A cropped material edge belongs to a useful atom, not another miniature hero.
export function SelectedRoomDetail({ section }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [section]);
  if (failed || !["read", "listen", "good", "yours"].includes(section)) return null;
  return <div className="fw-selected-material" data-material-section={section} aria-hidden="true"><img src={`/images/selected-lifestyle/${section}-v1.webp`} width="1536" height="1024" alt="" loading="lazy" onError={() => setFailed(true)}/></div>;
}

import React, { useState } from "react";
import { Heart } from "@/components/journal/Editorial";
import { SpeciesBloom } from "@/components/brand/floraLibrary";
import { SECTION_STILL } from "./sectionStills";
import { ALMANAC_TYPE } from "./AlmanacHeader";
import GardenHeader from "./GardenHeader";
import LivingSkyHeader from "./LivingSkyHeader";
import LivingDirectionHeader from "./LivingDirections";
import SkyMeaning from "./sky/SkyMeaning";
import "./ReadingRoom.css";

// Scenery contains no title, account state or controls. The shell owns those.
export default function ReadingRoomHeader({ active, moon }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const section = active?.id === "story" ? "books" : active?.id;
  if (section === "sky") return <LivingSkyHeader active={active} moon={moon} breeze/>;
  if (section === "yours") return <LivingDirectionHeader active={active} moon={moon} direction="letter"/>;
  if (section !== "books") return <GardenHeader active={active} moon={moon}/>;
  const flower = SECTION_STILL.books.flower;
  const words = (active?.title || "Your reading corner").trim().split(/\s+/);
  const last = words.pop();
  return <header className="fw-room-header">
    <style>{ALMANAC_TYPE}</style>
    <div className="fw-room-folio"><span>Lifestyle / Books</span><time>{new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long"})}</time></div>
    <div className="fw-room-threshold">
      <div className="fw-room-table" aria-hidden="true">{failed ? <SpeciesBloom name="jasmine" size={110}/> : <img src={`/images/reading-room/table-v3.webp${attempt ? `?retry=${attempt}` : ""}`} width="1536" height="1024" alt="" fetchPriority="high" onError={()=>setFailed(true)}/>}</div>
      <div className="fw-room-clearing"><h1 className="fw-heading">{words.join(" ")}{words.length>0 && " "}<span>{last}<Heart size={14}/></span></h1><p className="fw-room-flower"><strong>{flower.name}</strong><span>{flower.note}</span></p></div>
    </div>
    <div className="fw-room-caption"><SkyMeaning label="the reading room" explanation="Jasmine stands for devotion. A fitting flower for ‘just one more chapter’."><span>One chapter. Then we’ll see.</span></SkyMeaning>{failed && <button type="button" onClick={()=>{setAttempt(n=>n+1);setFailed(false);}}>Reload room artwork</button>}</div>
  </header>;
}

export function RestingBook() {
  return <div className="fw-room-resting-book" aria-hidden="true"><img src="/images/reading-room/resting-book-v3.webp" alt="" loading="lazy" width="1536" height="1024"/></div>;
}

import React, { useState } from "react";
import useSkyDiary from "@/components/horoscope/hooks/useSkyDiary";
import { Card, Eyebrow, Title, Body } from "@/components/brand/cleanKit";
import { C } from "@/components/brand/cleanTokens";
import { UI, SERIF } from "@/components/journal/Editorial";

export default function ObservedSkyDiary({ userId }) {
  const [attempt, setAttempt] = useState(0);
  return <div style={{marginTop:24}}><DiaryEntries key={`${userId || "guest"}-${attempt}`} userId={userId} retry={()=>setAttempt(v=>v+1)}/></div>;
}
function DiaryEntries({ userId, retry }) {
  const { loading, periodStarts, readings } = useSkyDiary(userId);
  const [open, setOpen] = useState(null);
  const dates = [...new Map(periodStarts.slice().reverse().map(entry => [entry.date.toDateString(), entry])).values()];
  const plain = value => String(value || "").replace(/<[^>]*>/g, "").replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");
  const fmt = (date)=>new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
  return <Card>
    <Eyebrow cw="sage">Your sky diary</Eyebrow>
    <Title>A few moments, kept.</Title>
    <Body size={17}>Your recorded dates and readings. The gaps get to be gaps.</Body>
    {loading ? <p role="status" style={{font:`500 14px ${UI}`}}>Opening your diary…</p> : <>
      <p className="sky-kicker">Logged cycle starts</p>
      {periodStarts.length ? <ol style={{display:"flex",flexWrap:"wrap",gap:8,listStyle:"none",padding:0,margin:"0 0 20px"}}>{dates.map((entry,i)=><li key={entry.raw?.id || i} style={{font:`500 12px/1.5 ${UI}`,padding:"8px 10px",border:`1px solid ${C.goldHair}`,borderRadius:12}}>{fmt(entry.date)}</li>)}</ol> : <p className="sky-note">No cycle dates loaded. Nothing filled in on your behalf.</p>}
      <p className="sky-kicker">Recent readings</p>
      {readings.length ? readings.map((entry,i)=><div key={entry.id || i} style={{borderTop:`1px solid ${C.hair}`,padding:"10px 0"}}>
        <button aria-expanded={open===i} onClick={()=>setOpen(open===i ? null : i)} style={{minHeight:48,width:"100%",border:0,background:"transparent",textAlign:"left",color:C.ink,cursor:"pointer",font:`600 18px/1.4 ${SERIF}`}}>
          <span style={{display:"block",font:`500 12px ${UI}`,marginBottom:6}}>{entry.reading_date && !Number.isNaN(Date.parse(entry.reading_date)) ? fmt(entry.reading_date) : "Date unavailable"}</span>{plain(entry.headline) || "Your sky reading"}
        </button>
        {open===i && <Body size={17} style={{whiteSpace:"pre-line"}}>{plain(entry.narrative || "The text of this reading hasn't loaded.")}</Body>}
      </div>) : <p className="sky-note">No past readings loaded yet. A blank page is a perfectly good beginning.</p>}
      <button onClick={retry} style={{minHeight:44,font:`600 12px ${UI}`,color:C.ink,border:0,borderBottom:`1px solid ${C.goldHair}`,background:"transparent",padding:"10px 0",cursor:"pointer"}}>Refresh diary</button>
    </>}
  </Card>;
}

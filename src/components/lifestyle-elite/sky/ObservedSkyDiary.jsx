import React, { useId, useState } from "react";
import useSkyDiary from "@/components/horoscope/hooks/useSkyDiary";
import { Card, Eyebrow, Title, Body } from "@/components/brand/cleanKit";
import { C } from "@/components/brand/cleanTokens";
import { UI, SERIF } from "@/components/journal/Editorial";
import SkyMeaning from "./SkyMeaning";

export default function ObservedSkyDiary({ userId }) {
  const [attempt, setAttempt] = useState(0);
  return <div style={{marginTop:24}}><DiaryEntries key={`${userId || "guest"}-${attempt}`} userId={userId} retry={()=>setAttempt(v=>v+1)}/></div>;
}
function DiaryEntries({ userId, retry }) {
  const { loading, periodStarts, readings } = useSkyDiary(userId);
  const [open, setOpen] = useState(null);
  const [all, setAll] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const id = useId();
  const dates = [...new Map(periodStarts.slice().reverse().map(entry => [entry.date.toDateString(), entry])).values()];
  const plain = value => String(value || "").replace(/<[^>]*>/g, "").replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");
  const fmt = date=>new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
  const quiet = {minHeight:44,font:`600 12px ${UI}`,color:C.ink,border:0,background:"transparent",padding:"8px 0",cursor:"pointer",textDecoration:"underline",textUnderlineOffset:4};
  return <Card data-testid="observed-sky-diary" style={{padding:"14px 18px"}}>
    <SkyMeaning label="your sky diary" explanation="Your recent readings and logged cycle dates, kept together. Open a title to read it again; earlier entries stay a tap away. This is a diary, not a prediction."><Eyebrow cw="sage" style={{margin:0}}>Your sky diary</Eyebrow></SkyMeaning>
    <Title size={20}>A few moments, kept.</Title>
    {loading ? <p role="status" style={{font:`500 14px ${UI}`}}>Opening your diary…</p> : <>
      <div id={`${id}-readings`}>
        {readings.length ? (all ? readings : readings.slice(0,2)).map((entry,i)=><div key={entry.id || i} style={{borderTop:`1px solid ${C.hair}`}}>
          <button type="button" aria-expanded={open===i} aria-controls={`${id}-reading-${i}`} onClick={()=>setOpen(open===i ? null : i)} style={{minHeight:64,width:"100%",border:0,padding:"10px 0",background:"transparent",textAlign:"left",color:C.ink,cursor:"pointer"}}>
            <span style={{display:"block",font:`600 12px/1.4 ${UI}`,color:C.slate,marginBottom:3}}>{entry.reading_date && !Number.isNaN(Date.parse(entry.reading_date)) ? fmt(entry.reading_date) : "Date unavailable"}</span>
            <span style={{display:"flex",alignItems:"center",gap:8}}><span style={{font:`600 16px/1.3 ${SERIF}`,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",flex:1}}>{plain(entry.headline) || "Your sky reading"}</span><span aria-hidden="true" style={{font:`500 18px ${SERIF}`}}>{open===i ? "−" : "+"}</span></span>
          </button>
          <div id={`${id}-reading-${i}`} hidden={open!==i}>{open===i && <><p style={{font:`600 18px/1.3 ${SERIF}`,margin:"0 0 10px"}}>{plain(entry.headline) || "Your sky reading"}</p><Body size={17} style={{whiteSpace:"pre-line"}}>{plain(entry.narrative || "The text of this reading hasn't loaded.")}</Body></>}</div>
        </div>) : <p style={{font:`500 16px/1.55 ${SERIF}`,margin:"8px 0"}}>No past readings loaded yet. A blank page is a perfectly good beginning.</p>}
      </div>
      {readings.length>2 && <button type="button" aria-expanded={all} aria-controls={`${id}-readings`} onClick={()=>{setAll(v=>!v);setOpen(null);}} style={quiet}>{all ? "Show fewer readings" : `View all ${readings.length} readings`}</button>}
      <div style={{borderTop:`1px solid ${C.hair}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <button type="button" aria-expanded={showDates} aria-controls={`${id}-dates`} onClick={()=>setShowDates(v=>!v)} style={{...quiet,textAlign:"left"}}>{showDates ? "Hide cycle dates" : `Cycle dates${dates.length ? ` · ${dates.length}` : ""}`}</button>
        <button type="button" onClick={retry} style={quiet}>Refresh diary</button>
      </div>
      <div id={`${id}-dates`} hidden={!showDates}>{dates.length ? <ol style={{display:"flex",flexWrap:"wrap",gap:8,listStyle:"none",padding:0,margin:"4px 0 8px"}}>{dates.map((entry,i)=><li key={entry.raw?.id || i} style={{font:`600 12px/1.4 ${UI}`,padding:"6px 8px",border:`1px solid ${C.goldHair}`,borderRadius:8}}>{fmt(entry.date)}</li>)}</ol> : <p className="sky-note">No cycle dates loaded. Nothing filled in on your behalf.</p>}</div>
    </>}
  </Card>;
}
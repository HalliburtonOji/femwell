import React, { useId, useState } from "react";
import useSkyDiary from "@/components/horoscope/hooks/useSkyDiary";
import { Card, Eyebrow, Title, Body } from "@/components/brand/cleanKit";
import { C } from "@/components/brand/cleanTokens";
import { UI, SERIF } from "@/components/journal/Editorial";
import SkyMeaning from "./SkyMeaning";
import useObservedSkyDiary from "./useObservedSkyDiary";
import { skyParagraphs } from "./skySourceContracts";

export default function ObservedSkyDiary({ userId, human=false }) {
  const [attempt, setAttempt] = useState(0);
  return <div style={{marginTop:24}}><DiaryEntries key={`${userId || "guest"}-${attempt}`} userId={userId} human={human} retry={()=>setAttempt(v=>v+1)}/></div>;
}
function DiaryEntries({ userId, retry, human }) {
  return human ? <SelectedDiaryEntries userId={userId} retry={retry}/> : <LegacyDiaryEntries userId={userId} retry={retry}/>;
}
function SelectedDiaryEntries({userId,retry}) {
  const data=useObservedSkyDiary(userId);
  return <DiaryBody retry={retry} human data={data}/>;
}
function LegacyDiaryEntries({userId,retry}) {
  const data=useSkyDiary(userId);
  return <DiaryBody retry={retry} data={data}/>;
}
function DiaryBody({retry,human,data}) {
  const { loading, periodStarts, readings,readingError,cycleError } = data;
  const [open, setOpen] = useState(null);
  const [all, setAll] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const id = useId();
  const dates = [...new Map(periodStarts.slice().reverse().map(entry => [entry.date.toDateString(), entry])).values()];
  const plain = value => String(value || "").replace(/<[^>]*>/g, "").replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");
  const fmt = date=>new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
  const quiet = {minHeight:44,font:`600 12px ${UI}`,color:C.ink,border:0,background:"transparent",padding:"8px 0",cursor:"pointer",textDecoration:"underline",textUnderlineOffset:4};
  return <Card data-testid="observed-sky-diary" style={{padding:"14px 18px"}}>
    <SkyMeaning label="your sky diary" explanation={human ? "Your past readings, with the dates you’ve kept. Open one to revisit it." : "Your recent readings and logged cycle dates, kept together. Open a title to read it again; earlier entries stay a tap away. This is a diary, not a prediction."}><Eyebrow cw="sage" style={{margin:0}}>Your sky diary</Eyebrow></SkyMeaning>
    <Title size={20}>{human ? "Under earlier skies." : "A few moments, kept."}</Title>
    {loading ? <p role="status" style={{font:`500 14px ${UI}`}}>Opening your diary…</p> : <>
      {readingError && <p role="alert" className="daily-sky-status">{readingError} <button onClick={retry}>Try again</button></p>}
      <div id={`${id}-readings`}>
        {readings.length ? (all ? readings : readings.slice(0,2)).map((entry,i)=><div key={entry.id || i} style={{borderTop:`1px solid ${C.hair}`}}>
          <button type="button" aria-expanded={open===i} aria-controls={`${id}-reading-${i}`} onClick={()=>setOpen(open===i ? null : i)} style={{minHeight:64,width:"100%",border:0,padding:"10px 0",background:"transparent",textAlign:"left",color:C.ink,cursor:"pointer"}}>
            <span style={{display:"block",font:`600 12px/1.4 ${UI}`,color:C.slate,marginBottom:3}}>{entry.reading_date && !Number.isNaN(Date.parse(entry.reading_date)) ? fmt(entry.reading_date) : "Date unavailable"}</span>
            <span style={{display:"flex",alignItems:"center",gap:8}}><span style={{font:`600 16px/1.3 ${SERIF}`,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",flex:1}}>{plain(entry.headline) || "Your sky reading"}</span><span aria-hidden="true" style={{font:`500 18px ${SERIF}`}}>{open===i ? "−" : "+"}</span></span>
          </button>
          <div id={`${id}-reading-${i}`} hidden={open!==i}>{open===i && <><p style={{font:`600 18px/1.3 ${SERIF}`,margin:"0 0 10px"}}>{plain(entry.headline) || "Your sky reading"}</p>{human ? <>
            {skyParagraphs(entry.narrative || "The text of this reading hasn’t loaded.").map((text,p)=><Body key={p} size={17} style={{whiteSpace:"pre-line"}}>{text}</Body>)}
            {[["Power",entry.power_title,entry.power_body],["Pressure",entry.pressure_title,entry.pressure_body],["Trouble",entry.trouble_title,entry.trouble_body],["Sun",null,entry.triad_sun_desc],["Moon",null,entry.triad_moon_desc],["Rising",null,entry.triad_rising_desc],["Your two tides",entry.cycle_moon_headline,entry.cycle_moon_body],["Your goddess bench",null,entry.goddess_read]].map(([label,title,text])=>title || text ? <div key={label} style={{borderTop:`1px solid ${C.hair}`,paddingTop:10}}><p className="sky-kicker">{label}</p>{title && <p style={{font:`600 18px/1.3 ${SERIF}`}}>{plain(title)}</p>}{skyParagraphs(text).map((paragraph,p)=><Body key={p} size={17}>{paragraph}</Body>)}</div> : null)}
            {(entry.weather_energy || entry.weather_mood) && <p className="sky-note">{[entry.weather_energy && `Energy · ${entry.weather_energy}`,entry.weather_mood].filter(Boolean).join(" · ")}</p>}
          </> : <Body size={17} style={{whiteSpace:"pre-line"}}>{plain(entry.narrative || "The text of this reading hasn't loaded.")}</Body>}</>}</div>
        </div>) : !readingError && <p style={{font:`500 16px/1.55 ${SERIF}`,margin:"8px 0"}}>{human ? "No earlier skies here yet." : "No past readings loaded yet. A blank page is a perfectly good beginning."}</p>}
      </div>
      {readings.length>2 && <button type="button" aria-expanded={all} aria-controls={`${id}-readings`} onClick={()=>{setAll(v=>!v);setOpen(null);}} style={quiet}>{all ? "Show fewer readings" : `View all ${readings.length} readings`}</button>}
      <div style={{borderTop:`1px solid ${C.hair}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <button type="button" aria-expanded={showDates} aria-controls={`${id}-dates`} onClick={()=>setShowDates(v=>!v)} style={{...quiet,textAlign:"left"}}>{showDates ? "Hide cycle dates" : `Cycle dates${dates.length ? ` · ${dates.length}` : ""}`}</button>
        <button type="button" onClick={retry} style={quiet}>Refresh diary</button>
      </div>
      <div id={`${id}-dates`} hidden={!showDates}>{cycleError ? <p role="alert" className="daily-sky-status">{cycleError} <button onClick={retry}>Try again</button></p> : dates.length ? <ol style={{display:"flex",flexWrap:"wrap",gap:8,listStyle:"none",padding:0,margin:"4px 0 8px"}}>{dates.map((entry,i)=><li key={entry.raw?.id || i} style={{font:`600 12px/1.4 ${UI}`,padding:"6px 8px",border:`1px solid ${C.goldHair}`,borderRadius:8}}>{fmt(entry.date)}</li>)}</ol> : <p className="sky-note">{human ? "No cycle dates here yet." : "No cycle dates loaded. Nothing filled in on your behalf."}</p>}</div>
    </>}
  </Card>;
}

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, PenLine } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { saveItem, removeSavedItem, parseSavedMeta } from "@/lib/savedItems";
import { Card, Eyebrow, Title, Body } from "@/components/brand/cleanKit";
import SkyMeaning from "./SkyMeaning";
import { MoonLesson } from "./CelestialSky";
import { SKY_LESSONS, LESSON_VERSION, dailyLessonDeck, localSkyDay, skyLessonKey, skyLessonRoute } from "./skyLessons";
import "./DailySkyLesson.css";

function useLessonSaves(userId) {
  const [rows,setRows] = useState([]);
  const [error,setError] = useState(false);
  const [loading,setLoading] = useState(!!userId);
  const [attempt,setAttempt] = useState(0);
  useEffect(()=>{
    let cancelled = false;
    if(!userId){setRows([]);setLoading(false);return;}
    setLoading(true);
    base44.entities.SavedItems.filter({user_id:userId,item_type:"LIFESTYLE"},"-created_at",150)
      .then(items=>{if(!cancelled){setRows(items.filter(item=>parseSavedMeta(item).kind==="sky-lesson"));setError(false);}})
      .catch(()=>{if(!cancelled)setError(true);}).finally(()=>{if(!cancelled)setLoading(false);});
    return ()=>{cancelled=true;};
  },[userId,attempt]);
  useEffect(()=>{const refresh=()=>setAttempt(n=>n+1);window.addEventListener("fw_sky_lesson_saved",refresh);return()=>window.removeEventListener("fw_sky_lesson_saved",refresh);},[]);
  return {rows,error,loading,retry:()=>setAttempt(n=>n+1)};
}

export function SavedSkyLessons({userId,direction,onCount}) {
  const {rows,error,loading,retry}=useLessonSaves(userId);
  useEffect(()=>{if(onCount)onCount(loading || error ? 0 : rows.length);},[rows,loading,error,onCount]);
  return <Card className="daily-sky saved-sky-lessons" style={{marginTop:20}}>
    <Eyebrow cw="lavender" align="left">Your sky keepsakes</Eyebrow><Title align="left" size={26}>Little things you kept.</Title>
    {loading ? <p role="status">Opening your lessons…</p> : error ? <><p role="alert">Your saved lessons couldn’t load.</p><button onClick={retry}>Try again</button></> : rows.length ? rows.map(row=>{
      const meta=parseSavedMeta(row);const lesson=SKY_LESSONS.find(item=>item.id===meta.lessonId && item.version===meta.lessonVersion);
      return <a className="saved-sky-row" key={row.id} href={lesson ? skyLessonRoute(lesson,direction) : `${meta.route || "/LivingLifestyleDemo?section=sky"}`}><span>{row.title}</span><ArrowRight size={16} aria-hidden="true"/></a>;
    }) : <Body>Your saved Sky lessons will settle here. No collection invented on your behalf.</Body>}
    <a className="daily-sky-link" href="/Saved">All your saved things</a>
  </Card>;
}

export default function DailySkyLesson({userId,moon,direction="letter"}) {
  const [day,setDay]=useState(()=>localSkyDay());
  const [nextDay,setNextDay]=useState(null);
  const params=useRef(new URLSearchParams(window.location.search));
  const [exact,setExact]=useState(()=>params.current.get("lesson"));
  const requestedVersion=params.current.get("lessonVersion");
  const unavailable=exact && (!SKY_LESSONS.some(item=>item.id===exact) || (requestedVersion && requestedVersion!==String(LESSON_VERSION)));
  const deck=dailyLessonDeck(day,unavailable ? null : exact);
  const [index,setIndex]=useState(0);
  const [lessonHeight,setLessonHeight]=useState(null);
  const track=useRef(null);
  const saving=useRef(false);
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState("");
  const {rows:saves,error:saveReadError,loading:saveLoading,retry:retrySaves}=useLessonSaves(userId);
  const [writing,setWriting]=useState(false);
  const [drafts,setDrafts]=useState({});
  const [notes,setNotes]=useState([]);
  const [notesError,setNotesError]=useState(false);
  const [notesAttempt,setNotesAttempt]=useState(0);
  const lesson=deck[index] || deck[0];
  const key=skyLessonKey(lesson);
  const kept=saves.some(row=>row.item_id===key);
  const draft=drafts[key] || "";
  const previousNote=notes.find(note=>note.user_id===userId && note.content_key===key);

  useEffect(()=>{
    const active=track.current?.children[index];
    if(!active)return;
    const measure=()=>{const height=active.getBoundingClientRect().height;if(height>0)setLessonHeight(Math.ceil(height));};
    measure();
    if(typeof ResizeObserver==="undefined")return;
    const observer=new ResizeObserver(measure);observer.observe(active);
    return()=>observer.disconnect();
  },[index,key]);

  useEffect(()=>{const check=()=>{const current=localSkyDay();if(current!==day)setNextDay(current);};document.addEventListener("visibilitychange",check);const timer=setInterval(check,60000);return()=>{document.removeEventListener("visibilitychange",check);clearInterval(timer);};},[day]);
  useEffect(()=>{
    let cancelled=false;
    if(!userId){setNotes([]);return;}
    base44.entities.JournalEntries.filter({user_id:userId,tags:{$in:["Sky lesson"]}},"-created_date",100)
      .then(entries=>{if(!cancelled){setNotes(current=>[...current.filter(note=>note.user_id===userId && !entries.some(entry=>entry.id===note.id)),...entries]);setNotesError(false);}})
      .catch(()=>{if(!cancelled)setNotesError(true);});
    return()=>{cancelled=true;};
  },[userId,notesAttempt]);
  const go=next=>{
    if(busy)return;
    const clamped=Math.max(0,Math.min(deck.length-1,next));
    const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    track.current?.scrollTo({left:clamped*track.current.clientWidth,behavior:reduced ? "auto" : "smooth"});
    setIndex(clamped);setStatus("");
  };
  const save=async()=>{
    if(!userId){setStatus("Sign in to keep a lesson.");return;}
    if(saving.current)return;
    saving.current=true;setBusy(true);setStatus("");
    try{
      if(kept)await removeSavedItem("LIFESTYLE",key);
      else await saveItem({itemType:"LIFESTYLE",itemId:key,title:lesson.title,previewText:lesson.body,meta:{kind:"sky-lesson",lessonId:lesson.id,lessonVersion:lesson.version,date:day,route:skyLessonRoute(lesson,direction)}});
      setStatus(kept ? "Removed from your saves." : "Kept in Yours and your saved things.");
      window.dispatchEvent(new Event("fw_sky_lesson_saved"));
    }catch{setStatus("That didn’t save. Your lesson is still here; try again.");}
    finally{saving.current=false;setBusy(false);}
  };
  const saveNote=async event=>{
    event.preventDefault();if(!userId || !draft.trim() || saving.current)return;
    saving.current=true;setBusy(true);setStatus("");
    try{
      const now=new Date().toISOString();
      const record=await base44.entities.JournalEntries.create({user_id:userId,content_id:key,content_key:key,card_type:"reflection",text:draft.trim(),prompt:`What caught your eye in “${lesson.title}”?`,session_date:localSkyDay(),tags:["Sky lesson"],created_at:now,updated_at:now});
      setNotes(current=>[record,...current]);setDrafts(current=>({...current,[key]:""}));setWriting(false);setStatus("Kept in your journal, linked to this lesson.");
    }catch{setStatus("Your note didn’t save. We’ve kept your words here to try again.");}
    finally{saving.current=false;setBusy(false);}
  };
  return <section id="daily-sky-lesson" className="daily-sky-movement" aria-label="Daily Sky lessons">
    <Card className="daily-sky" style={{padding:"14px 18px",boxShadow:"none",border:"1px solid #D9C79B80",background:"linear-gradient(120deg,#fff,#F5F4F170)"}}>
      <SkyMeaning label="daily sky lessons" explanation="A short, authored astronomy lesson each day, using your device’s date. Swipe for four more; nothing changes automatically. Facts have sources. Personal notes and saves stay in your account. The eight Moon phases remain below."><span className="daily-sky-heading"><span className="daily-sky-eyebrow">A little sky wisdom</span><span className="daily-sky-date">{new Date(`${day}T12:00:00`).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} · astronomy</span></span></SkyMeaning>
      {unavailable && <p role="alert" className="daily-sky-status">That saved lesson or edition is unavailable. Today’s lessons are below; your saved record remains.</p>}
      <div className="daily-sky-track" ref={track} style={lessonHeight ? {height:lessonHeight} : undefined} data-busy={busy} tabIndex={busy ? -1 : 0} aria-label="Swipeable lesson cards" aria-roledescription="carousel" aria-busy={busy} onKeyDown={event=>{if(busy || event.target!==event.currentTarget)return;if(event.key==="ArrowRight"){event.preventDefault();go(index+1);}if(event.key==="ArrowLeft"){event.preventDefault();go(index-1);}}} onScroll={()=>{const el=track.current;if(el && !busy){const next=Math.round(el.scrollLeft/Math.max(el.clientWidth,1));if(next!==index){setIndex(next);setStatus("");}}}}>
        {deck.map((item,i)=><article className="daily-sky-slide" key={item.id} inert={i!==index ? "" : undefined} aria-label={`${i+1} of ${deck.length}`} aria-roledescription="slide"><h3>{item.title}</h3><p>{item.body}</p>{item.tryThis && <p className="daily-sky-try"><strong>Try noticing:</strong> {item.tryThis}</p>}</article>)}
      </div>
      <div className="daily-sky-controls"><button type="button" disabled={index===0 || busy} aria-label="Previous sky lesson" onClick={()=>go(index-1)}><ArrowLeft size={18}/></button><span className="daily-sky-position"><span aria-live="polite" aria-atomic="true">{index+1} / {deck.length} · {index===0 && !exact ? "today’s lesson" : "keep exploring"}</span><a className="daily-sky-source" href={lesson.source} target="_blank" rel="noreferrer">{lesson.source.includes("rmg.co.uk") ? "Royal Observatory" : "NASA"} · the facts</a></span><button type="button" disabled={index===deck.length-1 || busy} aria-label="Next sky lesson" onClick={()=>go(index+1)}><ArrowRight size={18}/></button></div>
      <div className="daily-sky-actions"><button type="button" disabled={busy || saveLoading || saveReadError} aria-pressed={kept} onClick={save}>{kept ? <Check size={15}/> : <Bookmark size={15}/>} {busy ? "Keeping…" : kept ? "Kept · undo" : "Keep this"}</button><button type="button" disabled={busy} aria-expanded={writing} onClick={()=>{setWriting(!writing);setStatus(userId ? "" : "Sign in to keep a private note.");}}><PenLine size={15}/> A private note</button></div>
      {saveReadError && <p className="daily-sky-status" role="alert">Your saves couldn’t load. <button onClick={retrySaves}>Try again</button></p>}
      {writing && userId && <form onSubmit={saveNote} className="daily-sky-form"><label htmlFor="sky-lesson-note">What caught your eye?</label><textarea id="sky-lesson-note" value={draft} readOnly={busy} maxLength={4000} onChange={event=>setDrafts(current=>({...current,[key]:event.target.value}))} rows={3}/><div><button type="submit" disabled={busy || !draft.trim()}>Keep in journal</button><button type="button" disabled={busy} onClick={()=>setWriting(false)}>Close · keep draft</button></div><p>Only your words are saved. This lesson keeps the link.</p></form>}
      {previousNote && <details className="daily-sky-kept-note"><summary>Your note on this lesson</summary><p>{previousNote.text}</p><a href="/Journal">Open your journal</a></details>}
      {notesError && <p className="daily-sky-status">Your notes couldn’t load. <button onClick={()=>setNotesAttempt(n=>n+1)}>Retry notes</button></p>}
      {status && <p role="status" className="daily-sky-status">{status}</p>}
      {nextDay && <button className="daily-sky-link" disabled={busy} onClick={()=>{setDay(nextDay);setNextDay(null);setExact(null);params.current.delete("lessonVersion");const url=new URL(window.location.href);url.searchParams.delete("lesson");url.searchParams.delete("lessonVersion");window.history.replaceState(window.history.state,"",url);go(0);}}>Read today’s new lesson</button>}
    </Card>
    <MoonLesson moon={moon}/>
  </section>;
}

// The existing SkyNote store, carried into the continuous demo; no new diary system.
export function PrivateSkyNotes({userId,moon}) {
  const [notes,setNotes]=useState([]);const [draft,setDraft]=useState("");const [busy,setBusy]=useState(false);const [status,setStatus]=useState("");const [error,setError]=useState(false);const [attempt,setAttempt]=useState(0);
  useEffect(()=>{let cancelled=false;if(!userId){setNotes([]);return;}base44.entities.SkyNote.filter({user_id:userId},"-created_date",40).then(rows=>{if(!cancelled){setNotes(current=>[...current.filter(note=>note.user_id===userId && !rows.some(row=>row.id===note.id)),...rows]);setError(false);}}).catch(()=>{if(!cancelled)setError(true);});return()=>{cancelled=true;};},[userId,attempt]);
  const write=async event=>{event.preventDefault();if(!userId || busy || !draft.trim())return;setBusy(true);setStatus("");try{const now=new Date().toISOString();const row=await base44.entities.SkyNote.create({user_id:userId,text:draft.trim(),moon_phase:moon?.name || "",date:localSkyDay(),created_at:now,updated_at:now});setNotes(current=>[row,...current]);setDraft("");setStatus("A moment kept in your Sky diary.");}catch{setStatus("Couldn’t keep this note. Your words are still here.");}finally{setBusy(false);}};
  return <Card className="daily-sky" style={{marginTop:18,padding:"18px"}}><Eyebrow cw="lavender" align="left">In your own words</Eyebrow><Title align="left" size={26}>A moment under this sky.</Title><form className="daily-sky-form" onSubmit={write}><label htmlFor="private-sky-note">Anything you’d like to keep?</label><textarea id="private-sky-note" readOnly={busy} rows={2} maxLength={4000} value={draft} onChange={event=>setDraft(event.target.value)}/><button disabled={!userId || busy || !draft.trim()}>{busy ? "Keeping…" : "Keep in Sky diary"}</button></form>{!userId && <p>Sign in to keep your own notes.</p>}{status && <p role="status">{status}</p>}{error ? <p role="alert">Your diary couldn’t load. <button onClick={()=>setAttempt(n=>n+1)}>Try again</button></p> : <>{notes.filter(note=>note.user_id===userId).slice(0,2).map(note=><details key={note.id} className="daily-sky-kept-note"><summary>{note.date || "A moment kept"} · your note</summary><p>{note.text}</p></details>)}{notes.filter(note=>note.user_id===userId).length>2 && <details className="daily-sky-kept-note"><summary>Earlier moments · {notes.filter(note=>note.user_id===userId).length-2}</summary>{notes.filter(note=>note.user_id===userId).slice(2).map(note=><div key={note.id}><small>{note.date}</small><p>{note.text}</p></div>)}</details>}</>}</Card>;
}

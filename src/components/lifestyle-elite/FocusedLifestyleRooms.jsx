import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Sprout, Flower2, Feather, Moon, Trees, Shirt, Dumbbell, Users, Compass, PartyPopper, Coffee, Coins } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isClickbait } from "@/utils/clickbait";
import { cleanTitle } from "@/utils/cleanTitle";
import { FocusedCardContents, focusedSourceParagraphs } from "@/components/brand/expandCards";
import FocusedLifestyleSheet, { firstSentences, FocusedText } from "./FocusedLifestyleSheet";
import * as BLUEPRINTS from "./roomBlueprints";

const ROOMS = [
  ["Mirror",Shirt,"Dress for how you feel"],["Move",Dumbbell,"Move for your mood"],["Kindred",Users,"Your kind of company"],
  ["Curious",Compass,"A good rabbit hole"],["Delight",PartyPopper,"For the sheer fun of it"],["Nest",Coffee,"Make yourself at home"],
  ["Tonight",Moon,"Let the day put its feet up"],["Becoming",Sprout,"A little room to grow"],["Make",Feather,"Make a lovely mess"],
  ["Outside",Trees,"Meet the very big sky"],["Money",Coins,"Money, gently"],
];

// Same eligibility as the inventoried rooms; no softened safety exclusions.
export function roomPool(room, items) {
  const d = BLUEPRINTS[room], any = (row,keys) => d.hasAny(row,keys);
  if (room === "Make") return [];
  return items.filter(row => {
    if (!row || isClickbait(row.title)) return false;
    if (room === "Mirror") return !d.FICTION.test(row.title || "");
    if (room === "Move") return (row.category === "Fitness" || (any(row,d.MOVE_KW) && !["Food","Nutrition"].includes(row.category))) && !any(row,d.DENY);
    if (d.isFiction(row)) return false;
    if (room === "Kindred") return !any(row,d.DENY) && (["Relationships","Sex Education"].includes(row.category) || any(row,d.CONN));
    if (room === "Curious") return !any(row,d.HEALTH) && !any(row,d.DENY) && (row.category === "Culture" || any(row,d.IDEAS));
    if (room === "Delight") return !any(row,d.HEALTH) && any(row,d.FUN) && !any(row,d.EXCLUDE) && !any(row,d.DENY);
    if (room === "Nest") return !any(row,d.NOT) && !any(row,d.DIET) && (any(row,d.HOME_KW) || any(row,d.FOOD_KW));
    if (room === "Tonight") return !any(row,d.NOT) && !any(row,d.DENY) && any(row,d.CALM) && (["VIDEO","PODCAST","PRACTICE"].includes(String(row.media_type || "").toUpperCase()) || any(row,["meditation","breath","sleep","unwind","restorative"]));
    if (room === "Becoming") return !any(row,d.NOT) && !any(row,d.DENY) && any(row,d.SELF);
    if (room === "Outside") return !any(row,d.NOT) && any(row,d.NATURE);
    return !any(row,d.NOT) && any(row,d.MONEY);
  });
}

function roomTopics(room) {
  const d = BLUEPRINTS[room];
  const original = d.MOODS || d.FEELINGS || d.HEART || d.LENS || d.FANCY;
  const extra = {
    Mirror:[{key:"skin",label:"Skin",kws:d.SKINCARE},{key:"body",label:"Body-neutral reads",kws:["body image","body neutral","body confidence","trust a body","come as you are","in every phase"]}],
    Move:[{key:"strength",label:"Strength",kws:["strength","weights","resistance","pull-up","squat","dumbbell","power"]},{key:"gentle",label:"Gentle",kws:["yoga","mobility","stretch","restorative","gentle","pilates","breath"]},{key:"mood",label:"Mood",kws:["walk","outdoor","dance","mood","mental","fresh air","run"]}],
    Nest:[{key:"home",label:"Home",kws:d.HOME_KW},{key:"cooking",label:"Comfort cooking",kws:d.FOOD_KW}],
  }[room] || [];
  return [...(original || []),...extra,{key:"all",label:"All reads in this room",kws:[]}];
}

function promptPool(room) {
  const d=BLUEPRINTS[room];
  return d.QUESTIONS || d.MAKES || d.PROMPTS || d.SNACKS || d.RITUALS || [];
}

const CONNECT = {
 Mirror:["Community","Jess"],Move:["Community","Jess","Planner"],Kindred:["Jess","Community","Journal","Events"],
 Curious:["Jess","Community","Journal","Events"],Delight:["Community","Jess","Planner","Journal"],Nest:["Community","Planner","Jess","Journal"],
 Tonight:["Jess","Journal","Planner"],Becoming:["Journal","Jess","Community"],Make:["Community","Journal","Jess","Events"],
 Outside:["Events","Planner","Jess","Community","Journal"],Money:["Deals","Jess","Community","Journal"],
};

export default function FocusedLifestyleRooms({ active, onClose, user, profile, shellItems, toCard, isSaved, onSave, onStory, onSky, horoscope, phaseKey }) {
  const [room,setRoom]=useState("Becoming"), [choices,setChoices]=useState({}), [turns,setTurns]=useState({}), [visibleCounts,setVisibleCounts]=useState({});
  const [library,setLibrary]=useState(null), [libraryError,setLibraryError]=useState(""), [revision,setRevision]=useState(0), [loading,setLoading]=useState(false);
  const [libraryHasMore,setLibraryHasMore]=useState(false);
  const [item,setItem]=useState(null), [saving,setSaving]=useState(false), [saveError,setSaveError]=useState("");
  const [intention,setIntention]=useState(BLUEPRINTS.Money.INTENTIONS[0]), [goalStatus,setGoalStatus]=useState(""), [goalBusy,setGoalBusy]=useState(false);
  const sheet=useRef(null), positions=useRef({}), pending=useRef(false), owner=useRef(user?.id);
  owner.current=user?.id;
  // One catalogue edition shared across all rooms. Fetch only after a room that
  // uses it opens. The existing 500-row coverage ceiling is stated, not hidden.
  useEffect(()=>{
    if (room === "Make" || library) return;
    let alive=true;setLoading(true);setLibraryError("");
    base44.entities.LifestyleItems.filter({status:"PUBLISHED"},"-engagement_score",500).then(rows=>{
      if (!Array.isArray(rows)) throw new Error("Unexpected library reply");
      if(alive){setLibrary(rows.filter(Boolean));setLibraryHasMore(rows.length===500);}
    }).catch(()=>{if(alive)setLibraryError("The library didn’t open. Your room is still here.");}).finally(()=>{if(alive)setLoading(false);});
    return ()=>{alive=false;};
  // Initial room is Becoming. Switching rooms reuses this in-flight/read edition.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[library,revision]);
  // Do not repeat the edition request on room changes while it is in flight.
  const d=BLUEPRINTS[room], topics=roomTopics(room), topic=topics.find(value=>value.key===choices[room]) || topics[0];
  const edition=[...new Map([...(shellItems || []),...(library || [])].filter(Boolean).map(row=>[row.id,row])).values()];
  let pool=roomPool(room,edition);
  if(room === "Mirror")pool=pool.filter(row=>{
    const skin=row.category === "Beauty" && d.hasAny(row,d.SKINCARE);
    const body=(row.category === "Body Image" || d.hasAny(row,["body image","body neutral","body confidence","trust a body","come as you are","in every phase"])) && !d.hasAny(row,d.DIET_DENY);
    const fashion=row.category === "Fashion" || (["Beauty","Lifestyle","Culture"].includes(row.category) && d.hasAny(row,d.FASHION));
    return topic.key === "skin" ? skin : topic.key === "body" ? body : topic.key === "all" ? skin || body || fashion : fashion;
  });
  const matches=topic.kws?.length ? pool.filter(row=>d.hasAny(row,topic.kws)) : pool;
  const candidates=room === "Kindred" && topic.key === "solitude" ? [] : matches.length>=2 ? matches : pool;
  const first=d.rotateDaily(candidates,6), ordered=[...first,...candidates.filter(row=>!first.some(other=>other.id===row.id))];
  const rows=ordered.slice(0,visibleCounts[`${room}:${topic.key}`] || 3);
  const prompts=promptPool(room), prompt=prompts[(d.dayOffset()+(turns[room]||0))%prompts.length];
  const RoomIcon=ROOMS.find(([name])=>name===room)[1];
  useLayoutEffect(()=>{if(sheet.current)sheet.current.scrollTop=item ? 0 : positions.current[room] || 0;},[item,room]);
  const switchRoom=next=>{if(sheet.current)positions.current[room]=sheet.current.scrollTop;setRoom(next);setItem(null);setSaveError("");};
  const open=row=>{positions.current[room]=sheet.current?.scrollTop || 0;setItem(toCard({...row,title:cleanTitle(row.title)},null));setSaveError("");};
  const loadMoreLibrary=async()=>{if(loading)return;setLoading(true);setLibraryError("");try{const rows=await base44.entities.LifestyleItems.filter({status:"PUBLISHED"},"-engagement_score",500,library?.length || 0);if(!Array.isArray(rows))throw new Error("Unexpected library reply");setLibrary(previous=>[...(previous || []),...rows.filter(Boolean)]);setLibraryHasMore(rows.length===500);}catch{setLibraryError("Couldn’t load more of the library. Your current pieces are still here.");}finally{setLoading(false);}};
  const save=async()=>{if(pending.current)return;pending.current=true;setSaving(true);setSaveError("");try{if(await onSave(!isSaved(item),item)===false)throw new Error("Save not acknowledged");}catch{setSaveError("That save didn’t stick. Try again.");}finally{pending.current=false;setSaving(false);}};
  const keepIntention=async()=>{
    if(goalBusy)return;
    const uid=owner.current,title=intention;setGoalBusy(true);setGoalStatus("");
    try{
      if(!uid)throw new Error("Sign in to keep an intention.");
      const current=await base44.auth.me();if(current?.id!==uid || owner.current!==uid)throw new Error("Your account changed. Reopen this room.");
      const existing=await base44.entities.Goal.filter({user_id:uid,domain:"Money",title},"-created_date",1);
      if(!Array.isArray(existing))throw new Error("Couldn’t check your intentions. Try again.");
      if(owner.current!==uid || (await base44.auth.me())?.id!==uid || owner.current!==uid)throw new Error("Your account changed. Reopen this room.");
      if(!existing.length)await base44.entities.Goal.create({user_id:uid,title,type:"short",domain:"Money",stage:"seed",status:"active",flower:"sunflower",accent:"#8FAF8F",next_action:""});
      const verified=await base44.entities.Goal.filter({user_id:uid,domain:"Money",title},"-created_date",1);
      if(owner.current!==uid || (await base44.auth.me())?.id!==uid || owner.current!==uid || !verified?.some(row=>row.user_id===uid && row.domain==="Money" && row.title===title))throw new Error("Couldn’t confirm it yet. Retry checks before saving again.");
      setGoalStatus("Kept in your garden.");
    }catch(error){setGoalStatus(error.message || "That didn’t stick. Try again.");}finally{setGoalBusy(false);}
  };
  return <FocusedLifestyleSheet title={item ? item.title : "Life’s rooms"} eyebrow={item ? room : "The rest of your life"} active={active} onClose={onClose} contentRef={sheet}
    footer={item && <><button className="fw-focused-button" onClick={()=>setItem(null)}><ArrowLeft size={16}/>Back to {room}</button><button className="fw-focused-button" onClick={save} disabled={saving} aria-pressed={isSaved(item)}><Bookmark size={16}/>{saving ? "Saving…" : isSaved(item) ? "Saved" : "Save"}</button></>}>
    {item ? <><FocusedCardContents item={item}/>{saveError && <p role="alert" className="fw-focused-note">{saveError}</p>}{!focusedSourceParagraphs(item).length && !item.audioSrc && !item.videoSrc && !item.youtubeId && !item._raw?.content_url && !item._raw?.source_url && item.actions?.map(action=><button key={action.label} className="fw-focused-button" onClick={()=>{onClose();action.onClick?.(item);}}>{action.label}</button>)}</> : <>
      <label className="fw-focused-note" htmlFor="fw-life-room">Room</label><select id="fw-life-room" className="fw-focused-button" style={{width:"100%",margin:"5px 0 20px"}} value={room} onChange={event=>switchRoom(event.target.value)}>{ROOMS.map(([name])=><option key={name}>{name}</option>)}</select>
      <div className="fw-focused-room-bar"><span className="fw-focused-room-mark"><RoomIcon size={20}/></span><h2>{room}</h2><Flower2 size={17} color="#A8893F" aria-hidden="true"/></div>
      {prompt ? <div className="fw-focused-prose"><p><FocusedText text={prompt}/></p><div className="fw-focused-room-links"><button className="fw-focused-button" onClick={()=>setTurns(values=>({...values,[room]:(values[room]||0)+1}))}>Another little thing <ArrowRight size={15}/></button>{room === "Becoming" && <a className="fw-focused-button" href="/Journal">Write in Journal</a>}</div></div> : null}
      {room === "Mirror" && <details className="fw-focused-depth"><summary>A three-minute getting-ready ritual</summary><p className="fw-focused-prose">One song, one thing you like in the mirror, out the door lighter.</p>{phaseKey && d.SKIN_NOTE[phaseKey] && <p className="fw-focused-note">{d.SKIN_NOTE[phaseKey]}</p>}</details>}
      {room === "Move" && phaseKey && d.ENERGY_NOTE[phaseKey] && <details className="fw-focused-depth"><summary>Your energy, your call</summary><p className="fw-focused-note">{d.ENERGY_NOTE[phaseKey]}</p></details>}
      {room === "Tonight" && <div className="fw-focused-room-links"><button className="fw-focused-button" onClick={()=>{onClose();onStory();}}>Tonight’s chapter</button><button className="fw-focused-button" disabled={!horoscope?.id} onClick={()=>{onClose();onSky();}}>Your sky</button></div>}
      {room === "Outside" && <details className="fw-focused-depth"><summary>No garden? Still counts.</summary><p className="fw-focused-prose">A windowsill, a tree on your street, the view through a window. Start where you are.</p></details>}
      {room === "Money" && <section style={{marginTop:20}}><label className="fw-focused-note" htmlFor="fw-money-intention">A money intention</label><select id="fw-money-intention" className="fw-focused-button" style={{width:"100%",margin:"8px 0",whiteSpace:"normal"}} value={intention} onChange={event=>{setIntention(event.target.value);setGoalStatus("");}}>{d.INTENTIONS.map(text=><option key={text}>{text}</option>)}</select><p className="fw-focused-prose">{intention}</p><button className="fw-focused-button" onClick={keepIntention} disabled={goalBusy}>{goalBusy ? "Checking…" : "Keep this intention"}</button>{goalStatus && <p role="status" className="fw-focused-note">{goalStatus}</p>}</section>}
      {room !== "Make" && <section style={{marginTop:24}}><label className="fw-focused-note" htmlFor="fw-room-topic">{room === "Move" ? "How do you feel?" : room === "Kindred" ? "What’s your heart asking for?" : "What do you fancy?"}</label><select id="fw-room-topic" className="fw-focused-button" style={{width:"100%",margin:"8px 0 12px"}} value={topic.key} onChange={event=>setChoices(values=>({...values,[room]:event.target.value}))}>{topics.map(value=><option value={value.key} key={value.key}>{value.label}</option>)}</select>
        {topic.line && <p className="fw-focused-note">{firstSentences(topic.line,1)}</p>}
        {room === "Kindred" && topic.nudge && <details className="fw-focused-depth"><summary>A little reach-out idea</summary><p className="fw-focused-prose">{d.REACH_OUT}</p></details>}
        {loading && <p role="status" className="fw-focused-note">Opening the library…</p>}{libraryError && <div role="alert"><p className="fw-focused-note">{libraryError}</p><button className="fw-focused-button" disabled={loading} onClick={()=>library ? loadMoreLibrary() : setRevision(value=>value+1)}>Try again</button></div>}
        <ul className="fw-focused-room-list">{rows.map(row=><li key={row.id}><button onClick={()=>open(row)}><span style={{flex:1}}>{cleanTitle(row.title)}<small>{row.source_name || row.channel_name || row.author_name}</small></span><ArrowRight size={16}/></button></li>)}</ul>
        {ordered.length>rows.length && <button className="fw-focused-button" onClick={()=>setVisibleCounts(values=>({...values,[`${room}:${topic.key}`]:(values[`${room}:${topic.key}`] || 3)+6}))}>More in this room</button>}
        {libraryHasMore && <details className="fw-focused-depth"><summary>Browse the wider library</summary><button className="fw-focused-button" disabled={loading} onClick={loadMoreLibrary}>{loading ? "Loading…" : "Load more published pieces"}</button></details>}
        {!rows.length && !loading && !libraryError && topic.key!=="solitude" && <p className="fw-focused-note">No published pieces here yet. Try another topic.</p>}
      </section>}
      <details className="fw-focused-depth"><summary>Carry it on</summary><div className="fw-focused-room-links">{CONNECT[room].map(destination=>destination === "Jess" ? <button key={destination} className="fw-focused-button" onClick={()=>{onClose();window.dispatchEvent(new CustomEvent("fw_open_assistant",{detail:{prompt:`I’d like to talk about ${room.toLowerCase()}.`}}));}}>Ask Jess</button> : <a key={destination} className="fw-focused-button" href={`/${destination}`}>{destination}</a>)}</div></details>
    </>}
  </FocusedLifestyleSheet>;
}


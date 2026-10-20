import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Sprout, Flower2, Feather, Moon, Trees, Shirt, Dumbbell, Users, Compass, PartyPopper, Coffee, Coins } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isClickbait } from "@/utils/clickbait";
import { cleanTitle } from "@/utils/cleanTitle";
import { FocusedCardContents, focusedSourceParagraphs, resolveCard } from "@/components/brand/expandCards";
import FocusedLifestyleSheet, { firstSentences, FocusedText } from "./FocusedLifestyleSheet";
import * as BLUEPRINTS from "./roomBlueprints";
import { LIFESTYLE_EDITORIAL_DRAFTS } from "@/data/lifestyleEditorialDrafts";
import { GOOD_LIFE_ROOM_EDITIONS } from "@/data/goodLifeRoomEditions";

// Only complete, source-mapped Ideas drafts get a first-room slot. The older
// keyword-ranked catalogue remains reachable; its PUBLISHED flag is not a review receipt.
const ROOM_DRAFT = {
  Mirror:{topic:"bright",id:"ideas-good-mirror-own-wardrobe"},
  Move:{topic:"energy",id:"ideas-good-move-choose-ten"},
  Kindred:{topic:"friend",id:"ideas-read-friendship-plans"},
  Curious:{topic:"science",id:"ideas-good-curious-twinkle"},
  Delight:{topic:"surprise",id:"ideas-read-day-off"},
  Nest:{topic:"home",id:"ideas-good-nest-one-corner"},
  Tonight:{topic:"all",id:"ideas-good-tonight-close-day"},
  Becoming:{topic:"trust",id:"ideas-good-becoming-small-yes"},
  Make:{id:"ideas-good-make-paper-garden"},
  Outside:{topic:"all",id:"ideas-good-outside-nearby"},
  Money:{id:"ideas-read-subscription-check"},
};
const ROOM_TOPIC_DRAFTS = {
  "Mirror:soft":"ideas-good-mirror-soft-outfit",
  "Move:rest":"ideas-good-move-rest-day",
  "Kindred:solitude":"ideas-good-kindred-own-company",
  "Curious:arts":"ideas-good-curious-one-work",
  "Delight:music":"ideas-good-delight-one-song",
  "Nest:cooking":"ideas-good-nest-cupboard-supper",
  "Becoming:boundaries":"ideas-good-becoming-short-no",
};
const ROOM_EDITION = [...LIFESTYLE_EDITORIAL_DRAFTS,...GOOD_LIFE_ROOM_EDITIONS];
const ROOM_SIGNATURE = {
  Mirror:["The dressing table","#94575f","#f5e9eb"],
  Move:["The movement note","#4e735d","#e9f0ea"],
  Kindred:["The letter","#88566a","#f2e9ee"],
  Curious:["The rabbit hole","#4d6d7f","#e9f0f2"],
  Delight:["A little delight","#906b2a","#f4efdf"],
  Nest:["The little room","#806642","#f3eee5"],
  Tonight:["Before lights out","#665e82","#eeebf3"],
  Becoming:["The open page","#745373","#f1eaf2"],
  Make:["The workbench","#9b5c49","#f5ebe6"],
  Outside:["The field note","#4f765b","#e9f1e9"],
  Money:["The money minute","#886b31","#f4eedf"],
};

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
const ALL_TOPIC_TITLES = {
  Mirror:"Start with what you own", Move:"A little movement", Kindred:"Make the first move",
  Curious:"Follow the interesting bit", Delight:"Do it for the fun of it", Nest:"A softer landing",
  Tonight:"Call it a night", Becoming:"Try the small yes", Make:"Make something, badly if you like",
  Outside:"Step out for a moment", Money:"Look at the numbers",
};
// A topic choice must change the useful first thing, not merely the archive
// query. These are small, authored actions; full factual pieces still require
// their own checked source and stay in Ideas until reviewed.
export const TOPIC_STARTS = {
  Mirror: {
    bright: "Wear the colourful thing with your plainest outfit. The scarf gets its moment; your feet still get sensible shoes.",
    soft: "Find the outfit you can sit, reach and breathe in. Keep the lovely soft part; retire the bit that needs constant adjusting.",
    sharp: "Pick one piece that makes getting dressed easier, then build around it. No new wardrobe required.",
    play: "Put together two things you would normally keep apart. Try them for a minute before deciding.",
    skin: "Look at what your skin actually needs today before adding another product. If it feels comfortable, you can leave it alone.",
    body: "Choose clothes that fit the body you're in today. The label doesn't get a vote.",
  },
  Move: {
    energy: "Put on one song and move until it ends. Want more? Choose the next song then.",
    willing: "Try a five-minute walk or a gentle stretch. Stopping after five is a complete choice.",
    tense: "Roll your shoulders slowly and unclench your hands. Take a break if it feels uncomfortable.",
    foggy: "Go to the nearest window or step outside for a minute. Move if you fancy it; fresh air isn't an assignment.",
    play: "Dance to the first song you like, even if the choreography is mostly elbows.",
    rest: "Rest. If moving sounds good later, the room will still be here.",
    strength: "Try a few comfortable sit-to-stands from a stable chair. Stop if it hurts; there is no target number.",
    gentle: "Stretch your arms overhead, then let them fall. Repeat only if it feels good.",
    mood: "Take a short walk, inside or out, and notice one thing that changed since yesterday.",
  },
  Kindred: {
    friend: "Send the friend you miss a plain hello. The perfect opening line can take the day off.",
    family: "Think of one family conversation you would actually welcome. If none comes to mind, you don't owe one today.",
    love: "Name one ordinary thing you enjoy doing together. You can suggest that, rather than a grand plan.",
    belong: "Is there a familiar place you'd like to revisit? A group, a café, a neighbour's doorstep all count.",
    solitude: "Keep this bit of time for yourself. Pick the thing you'd enjoy even if nobody hears about it.",
  },
  Curious: {
    science: "Look up one question about the world around you. Start with the thing you noticed, not a list of facts to memorise.",
    history: "Find a photograph of your street or town from another decade. What's familiar, and what's vanished?",
    mind: "Notice a habit you do on autopilot today. What starts it? That's a better question than diagnosing yourself.",
    arts: "Choose one painting, song or building and stay with it for a minute. You don't need to know the right answer.",
    surprise: "Choose the title you would normally scroll past. Give it one minute to earn your attention.",
  },
  Delight: {
    watch: "Pick the film or show you want tonight, not the one you're meant to have seen. Check its real length before pressing play.",
    laugh: "Send someone the joke that made you laugh. Explanation optional; timing probably terrible.",
    pop: "Follow a harmless bit of pop-culture gossip to its original interview. The comments can stay closed.",
    music: "Play the first song you loved before anyone told you what was cool. Yes, that one.",
    surprise: "Choose a tiny pleasure you did not plan for: a song, a game, or a very good biscuit.",
  },
  Nest: {
    home: "Clear the spot where you actually sit, then sit there. Do not let five minutes turn into a full-house project.",
    cooking: "Choose something you already know how to make. Check what is in the cupboard before opening a recipe tab.",
  },
  Becoming: {
    trust: "Say one small preference before asking what everyone else wants. Lunch is a perfectly good place to begin.",
    who: "Write down one thing you like that nobody recommended to you. It can be wonderfully ordinary.",
    purpose: "Think of the last hour you wanted to last longer. What part mattered to you?",
    new: "Name the smallest first step into something new. You need not announce a whole new life.",
    boundaries: "Try out a short no in private: ‘I can't this time.’ See how it sounds without a paragraph of reasons.",
  },
};

export default function FocusedLifestyleRooms({ active, onClose, user, profile, shellItems, toCard, isSaved, onSave, onStory, onSky, horoscope, phaseKey, editorialPreview = false, visualEdition = editorialPreview }) {
  const [room,setRoom]=useState("Becoming"), [choices,setChoices]=useState({}), [turns,setTurns]=useState({}), [visibleCounts,setVisibleCounts]=useState({});
  const [library,setLibrary]=useState(null), [libraryError,setLibraryError]=useState(""), [revision,setRevision]=useState(0), [loading,setLoading]=useState(false);
  const [browseRequested,setBrowseRequested]=useState(!visualEdition);
  const [libraryHasMore,setLibraryHasMore]=useState(false);
  const [item,setItem]=useState(null), [saving,setSaving]=useState(false), [saveError,setSaveError]=useState("");
  const [intention,setIntention]=useState(BLUEPRINTS.Money.INTENTIONS[0]), [goalStatus,setGoalStatus]=useState(""), [goalBusy,setGoalBusy]=useState(false);
  const sheet=useRef(null), positions=useRef({}), pending=useRef(false), owner=useRef(user?.id);
  owner.current=user?.id;
  // One catalogue edition shared across all rooms. Its 500-row history belongs
  // behind the optional Browse disclosure, not to every room opening.
  useEffect(()=>{
    if (!browseRequested || room === "Make" || library) return;
    let alive=true;setLoading(true);setLibraryError("");
    base44.entities.LifestyleItems.filter({status:"PUBLISHED"},"-engagement_score",500).then(rows=>{
      if (!Array.isArray(rows)) throw new Error("Unexpected library reply");
      if(alive){setLibrary(rows.filter(Boolean));setLibraryHasMore(rows.length===500);}
    }).catch(()=>{if(alive)setLibraryError("The wider library didn’t refresh. Anything already shown here is still available.");}).finally(()=>{if(alive)setLoading(false);});
    return ()=>{alive=false;};
  // Initial room is Becoming. Switching rooms reuses this in-flight/read edition.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[browseRequested,library,revision]);
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
  // A chosen topic stays chosen even when it has one or no matching pieces.
  // The existing All reads choice exposes the rest of the eligible room.
  const candidates=room === "Kindred" && topic.key === "solitude" ? [] : matches;
  const first=d.rotateDaily(candidates,6), ordered=[...first,...candidates.filter(row=>!first.some(other=>other.id===row.id))];
  const rows=ordered.slice(0,visibleCounts[`${room}:${topic.key}`] || 3);
  const draftSlot=ROOM_DRAFT[room];
  const topicDraftId=ROOM_TOPIC_DRAFTS[`${room}:${topic.key}`];
  const roomDraft=editorialPreview && (topicDraftId || (draftSlot && (!draftSlot.topic || draftSlot.topic===topic.key) && draftSlot.id))
    ? ROOM_EDITION.find(draft=>draft.id===(topicDraftId || draftSlot.id)) : null;
  const [signature,accent,wash]=ROOM_SIGNATURE[room];
  const prompts=promptPool(room);
  const topicStart=TOPIC_STARTS[room]?.[topic.key];
  const prompt=topicStart || prompts[(d.dayOffset()+(turns[room]||0))%prompts.length];
  const anotherIdea=()=>{
    // Keep the old rotating prompt feature. From a specific topic it returns
    // to All so the next room-wide prompt is never mislabelled as topic-fit.
    if(topicStart)setChoices(values=>({...values,[room]:"all"}));
    setTurns(values=>({...values,[room]:(values[room]||0)+1}));
  };
  const RoomIcon=ROOMS.find(([name])=>name===room)[1];
  useLayoutEffect(()=>{if(sheet.current)sheet.current.scrollTop=item ? 0 : positions.current[room] || 0;},[item,room]);
  const switchRoom=next=>{if(sheet.current)positions.current[room]=sheet.current.scrollTop;setRoom(next);setItem(null);setSaveError("");};
  const open=row=>{positions.current[room]=sheet.current?.scrollTop || 0;const card=toCard({...row,title:cleanTitle(row.title)},null);if(card.type === "book" && card.actions?.[0]){onClose();card.actions[0].onClick?.(card);return;}setItem(card);setSaveError("");};
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
  const moneyIntention=room === "Money" && <section style={{marginTop:20}}><label className="fw-focused-note" htmlFor="fw-money-intention">A money intention</label><select id="fw-money-intention" className="fw-focused-button" style={{width:"100%",margin:"8px 0",whiteSpace:"normal"}} value={intention} onChange={event=>{setIntention(event.target.value);setGoalStatus("");}}>{d.INTENTIONS.map(text=><option key={text}>{text}</option>)}</select><p className="fw-focused-prose">{intention}</p><button className="fw-focused-button" onClick={keepIntention} disabled={goalBusy}>{goalBusy ? "Checking…" : "Keep this intention"}</button>{goalStatus && <p role="status" className="fw-focused-note">{goalStatus}</p>}</section>;
  const libraryResults=<>
    {loading && <p role="status" className="fw-focused-note">Opening the library…</p>}{libraryError && <div role="alert"><p className="fw-focused-note">{libraryError}</p><button className="fw-focused-button" disabled={loading} onClick={()=>library ? loadMoreLibrary() : setRevision(value=>value+1)}>Try again</button></div>}
    <ul className="fw-focused-room-list">{rows.map(row=><li key={row.id}><button onClick={()=>open(row)}><span style={{flex:1}}>{resolveCard({title:cleanTitle(row.title)}).title}<small>{/^FEMWELL_AI/i.test(String(row.provider || "")) ? "Archive · source review pending" : row.source_name || row.channel_name || row.author_name || "Older library"}{String(row.media_type || "").toUpperCase() === "VIDEO" && !Number(row.duration_seconds) ? " · length unverified" : ""}</small></span><ArrowRight size={16}/></button></li>)}</ul>
    {ordered.length>rows.length && <button className="fw-focused-button" onClick={()=>setVisibleCounts(values=>({...values,[`${room}:${topic.key}`]:(values[`${room}:${topic.key}`] || 3)+6}))}>More in this room</button>}
    {libraryHasMore && <details className="fw-focused-depth"><summary>Browse the wider library</summary><button className="fw-focused-button" disabled={loading} onClick={loadMoreLibrary}>{loading ? "Loading…" : "Load more published pieces"}</button></details>}
    {!rows.length && !loading && !libraryError && topic.key!=="solitude" && <p role="status" className="fw-focused-note">{topic.key === "all" ? "No published pieces here yet." : `No ${topic.label.toLowerCase()} in this selection. Try All reads in this room${libraryHasMore ? " or load more" : ""}.`}</p>}
  </>;
  return <FocusedLifestyleSheet title={item ? item.title : visualEdition ? room : "Life’s rooms"} eyebrow={item ? `Good life · ${room}` : visualEdition ? "Good life · Life’s rooms" : "The rest of your life"} room="good" active={active} onClose={onClose} contentRef={sheet}
    footer={item && <><button className="fw-focused-button" onClick={()=>setItem(null)}><ArrowLeft size={16}/>Back to {room}</button>{item.saveable !== false && <button className="fw-focused-button" onClick={save} disabled={saving} aria-pressed={isSaved(item)}><Bookmark size={16}/>{saving ? "Saving…" : isSaved(item) ? "Saved" : "Save"}</button>}</>}>
    {item ? <div className={visualEdition ? "fw-life-article" : undefined}><FocusedCardContents item={item} room={visualEdition && ["article","guide"].includes(item.type) ? "read-ideas" : "good"}/>{saveError && <p role="alert" className="fw-focused-note">{saveError}</p>}{!focusedSourceParagraphs(item).length && !item.audioSrc && !item.videoSrc && !item.youtubeId && !item._raw?.content_url && !item._raw?.source_url && item.actions?.map(action=><button key={action.label} className="fw-focused-button" onClick={()=>{onClose();action.onClick?.(item);}}>{action.label}</button>)}</div> : <div className={visualEdition ? "fw-life-preview" : undefined} data-life-room={visualEdition ? room.toLowerCase() : undefined} style={visualEdition ? {"--good-accent":accent,"--good-wash":wash} : undefined}>
      {visualEdition ? <>
        <div className="fw-life-controls"><div className="fw-life-room-select"><label htmlFor="fw-life-room">Change room</label><select id="fw-life-room" value={room} aria-label="Room" onChange={event=>switchRoom(event.target.value)}>{ROOMS.map(([name])=><option key={name}>{name}</option>)}</select></div>
        {room !== "Make" && <div className="fw-life-topic"><label htmlFor="fw-room-topic">{room === "Move" ? "How do you feel?" : room === "Kindred" ? "What’s your heart asking for?" : "What do you fancy?"}</label><select id="fw-room-topic" value={topic.key} onChange={event=>setChoices(values=>({...values,[room]:event.target.value}))}>{topics.map(value=><option value={value.key} key={value.key}>{value.label}</option>)}</select></div>}</div>
        {roomDraft && <section className="fw-life-opening" aria-label={`${room} first piece`}><p className="fw-life-signature">{signature}</p><h2><button className="fw-life-title-action" onClick={()=>open(roomDraft)}><span>{roomDraft.title}</span><small>Read this piece <ArrowRight size={17} aria-hidden="true"/></small></button></h2><p className="fw-life-standfirst">{roomDraft.summary}</p><p className="fw-life-time">{roomDraft.duration_label}</p><p className="fw-life-status">Ideas draft · unreviewed</p></section>}
        {!roomDraft && <section className="fw-life-opening" aria-label={`${room} small start`}><p className="fw-life-signature">{signature}</p><h2 className="fw-life-prompt-title">{topic.key === "all" ? ALL_TOPIC_TITLES[room] : topic.label}</h2><p className="fw-life-standfirst"><FocusedText text={prompt}/></p><button className="fw-life-next-prompt" onClick={anotherIdea}>{topicStart ? "Surprise me" : "Another idea"} <ArrowRight size={16} aria-hidden="true"/></button></section>}
      </> : <>
        <label className="fw-focused-note" htmlFor="fw-life-room">Room</label><select id="fw-life-room" className="fw-focused-button" style={{width:"100%",margin:"5px 0 20px"}} value={room} onChange={event=>switchRoom(event.target.value)}>{ROOMS.map(([name])=><option key={name}>{name}</option>)}</select>
        <div className="fw-focused-room-bar"><span className="fw-focused-room-mark"><RoomIcon size={20}/></span><h2>{room}</h2><Flower2 size={17} color="#A8893F" aria-hidden="true"/></div>
      </>}
      {prompt && (!visualEdition || roomDraft) ? visualEdition && roomDraft
        ? <details className="fw-focused-depth"><summary>Another small start</summary><div className="fw-focused-prose"><p><FocusedText text={prompt}/></p><div className="fw-focused-room-links"><button className="fw-focused-button" onClick={anotherIdea}>{topicStart ? "Surprise me" : "Another little thing"} <ArrowRight size={15}/></button>{room === "Becoming" && <a className="fw-focused-button" href="/Journal">Write in Journal</a>}</div></div></details>
        : <div className="fw-focused-prose"><p><FocusedText text={prompt}/></p><div className="fw-focused-room-links"><button className="fw-focused-button" onClick={anotherIdea}>{topicStart ? "Surprise me" : "Another little thing"} <ArrowRight size={15}/></button>{room === "Becoming" && <a className="fw-focused-button" href="/Journal">Write in Journal</a>}</div></div> : null}
      {visualEdition && !roomDraft && room === "Becoming" && <a className="fw-focused-button" href="/Journal">Write in Journal</a>}
      {room === "Mirror" && <details className="fw-focused-depth"><summary>A three-minute getting-ready ritual</summary><p className="fw-focused-prose">One song, one thing you like in the mirror, out the door lighter.</p>{phaseKey && d.SKIN_NOTE[phaseKey] && <p className="fw-focused-note">{d.SKIN_NOTE[phaseKey]}</p>}</details>}
      {room === "Move" && phaseKey && d.ENERGY_NOTE[phaseKey] && <details className="fw-focused-depth"><summary>Your energy, your call</summary><p className="fw-focused-note">{d.ENERGY_NOTE[phaseKey]}</p></details>}
      {room === "Tonight" && <div className="fw-focused-room-links"><button className="fw-focused-button" onClick={()=>{onClose();onStory();}}>Tonight’s chapter</button><button className="fw-focused-button" disabled={!horoscope?.id} onClick={()=>{onClose();onSky();}}>Your sky</button></div>}
      {room === "Outside" && <details className="fw-focused-depth"><summary>No garden? Still counts.</summary><p className="fw-focused-prose">A windowsill, a tree on your street, the view through a window. Start where you are.</p></details>}
      {!visualEdition && moneyIntention}
      {room !== "Make" && <section style={{marginTop:24}}>{!visualEdition && <><label className="fw-focused-note" htmlFor="fw-room-topic">{room === "Move" ? "How do you feel?" : room === "Kindred" ? "What’s your heart asking for?" : "What do you fancy?"}</label><select id="fw-room-topic" className="fw-focused-button" style={{width:"100%",margin:"8px 0 12px"}} value={topic.key} onChange={event=>setChoices(values=>({...values,[room]:event.target.value}))}>{topics.map(value=><option value={value.key} key={value.key}>{value.label}</option>)}</select></>}
        {topic.line && !topicStart && <p className="fw-focused-note">{firstSentences(topic.line,1)}</p>}
        {topic.line && topicStart && <details className="fw-focused-depth"><summary>Why this topic?</summary><p className="fw-focused-note">{firstSentences(topic.line,1)}</p></details>}
        {room === "Kindred" && topic.nudge && <details className="fw-focused-depth"><summary>A little reach-out idea</summary><p className="fw-focused-prose">{d.REACH_OUT}</p></details>}
        {editorialPreview && !roomDraft && <p className="fw-focused-note">The reading shelf for {room.toLowerCase()} is being checked. The little idea above is ready now.</p>}
        {visualEdition ? <details className="fw-focused-depth" onToggle={event=>{if(event.currentTarget.open)setBrowseRequested(true);}}><summary>{editorialPreview ? "Browse unreviewed library" : "Browse the wider library"}{library ? ` · ${ordered.length}` : ""}</summary>{browseRequested ? libraryResults : <p className="fw-focused-note">Open to see older pieces from this room.</p>}</details> : libraryResults}
      </section>}
      {visualEdition && moneyIntention}
      <details className="fw-focused-depth"><summary>Carry it on</summary><div className="fw-focused-room-links">{CONNECT[room].map(destination=>destination === "Jess" ? <button key={destination} className="fw-focused-button" onClick={()=>{onClose();window.dispatchEvent(new CustomEvent("fw_open_assistant",{detail:{prompt:`I’d like to talk about ${room.toLowerCase()}.`}}));}}>Ask Jess</button> : <a key={destination} className="fw-focused-button" href={`/${destination}`}>{destination}</a>)}</div></details>
    </div>}
  </FocusedLifestyleSheet>;
}


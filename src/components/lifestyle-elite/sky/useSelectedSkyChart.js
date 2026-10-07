import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { newestOwnedReading } from "../finishLifestyle";

// Founder previews and exact historical links read what exists. Main preserves
// the original cached fallback when today's reading has not been produced.
const EMPTY = {user:null,astro:null,reading:null,userProfile:null,loading:true,refreshing:false,generatingReading:false,error:"",checkedDay:null,readingRequest:null};
const dayKey = () => new Date().toISOString().slice(0,10); // same key as the existing producer
const validReadingDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0,10) === value;
export default function useSelectedSkyChart(providedProfile, requestedReadingId = null, generateMissing = false) {
  const exactReading = requestedReadingId !== null;
  const validRequest = !exactReading || /^[\w-]{1,160}$/.test(requestedReadingId);
  const [state,setState] = useState(EMPTY);
  const [revision,setRevision] = useState(0);
  const [newDay,setNewDay]=useState(null);
  const owner = useRef(null);
  const liveReading = useRef(null);
  const currentState = useRef(state);
  currentState.current = state;
  useEffect(()=>{
    let cancelled=false;
    const liveAtStart=liveReading.current;
    const previousOwner=owner.current;
    if(previousOwner && revision>0 && state.readingRequest===requestedReadingId && (!providedProfile?.user_id || providedProfile.user_id===previousOwner))setState(previous=>({...previous,refreshing:true,error:""}));
    else {owner.current=null;setState({...EMPTY,readingRequest:requestedReadingId});}
    (async()=>{
      let user;
      try {user=await base44.auth.me();}
      catch {if(!cancelled)setState({...EMPTY,readingRequest:requestedReadingId,loading:false,error:"Sign in to open your personal sky."});return;}
      if(cancelled)return;
      if(!user?.id){setState({...EMPTY,readingRequest:requestedReadingId,loading:false,error:"Sign in to open your personal sky."});return;}
      if(previousOwner && previousOwner!==user.id)setState({...EMPTY,readingRequest:requestedReadingId});
      owner.current=user.id;
      const checkedDay=dayKey();
      const [charts,readings,profiles]=await Promise.allSettled([
        base44.entities.AstroProfile.filter({user_id:user.id},"-created_date",1),
        !validRequest ? Promise.resolve([]) : base44.entities.HoroscopeReading.filter(exactReading ? {user_id:user.id,id:requestedReadingId} : {user_id:user.id,reading_date:checkedDay},"-created_date",1),
        providedProfile?.user_id===user.id ? Promise.resolve([providedProfile]) : base44.entities.UserProfile.filter({user_id:user.id},"-updated_at",1),
      ]);
      if(cancelled || owner.current!==user.id)return;
      const firstOwn = result => result.status === "fulfilled" && Array.isArray(result.value) ? result.value.find(row=>row?.user_id===user.id) || null : null;
      const ownReading=readings.status==="fulfilled" && Array.isArray(readings.value) ? readings.value.find(row=>row?.user_id===user.id && typeof row.id==="string" && row.id.trim() && (exactReading ? row.id===requestedReadingId && validReadingDate(row.reading_date) : row.reading_date===checkedDay)) || null : null;
      const failedCollection = result => result.status==="rejected" || !Array.isArray(result.value);
      const failedReading=failedCollection(readings) || (readings.value.length>0 && !ownReading);
      const realtime=liveReading.current!==liveAtStart && liveReading.current?.owner===user.id && liveReading.current?.day===checkedDay && !exactReading ? liveReading.current.reading : null;
      const settledReading=realtime ? newestOwnedReading(realtime,ownReading,user.id,true) : ownReading;
      const readingError = exactReading ? !validRequest ? "This saved reading link isn’t complete. Open today’s sky, or return to your plan." : failedCollection(readings) ? "That saved reading couldn’t load. Try again; today’s reading hasn’t replaced it." : !ownReading ? "That saved reading isn’t available in your account. Try again, or open today’s sky." : "" : "";
      setState(previous=>({user,astro:failedCollection(charts) && previous.user?.id===user.id ? previous.astro : firstOwn(charts),reading:settledReading || (failedReading && previous.user?.id===user.id && previous.readingRequest===requestedReadingId ? previous.reading : null),userProfile:failedCollection(profiles) && previous.user?.id===user.id ? previous.userProfile : firstOwn(profiles),loading:false,refreshing:false,generatingReading:false,checkedDay,readingRequest:requestedReadingId,error:readingError || (failedReading || [charts,profiles].some(failedCollection) ? "Part of your sky didn't load. Your saved details haven't changed." : "")}));
      setNewDay(!exactReading && dayKey()!==checkedDay ? dayKey() : null);
      if(generateMissing && !exactReading && !failedCollection(charts) && !failedCollection(readings) && readings.value.length===0 && firstOwn(charts) && !settledReading && dayKey()===checkedDay){
        setState(previous=>({...previous,generatingReading:true}));
        try {
          const response=await base44.functions.invoke("generateHoroscopeReading",{user_id:user.id});
          if(cancelled || owner.current!==user.id)return;
          const next=response?.data?.reading || response?.reading;
          if(!next?.id || next.user_id!==user.id || !validReadingDate(next.reading_date))throw new Error("Reading wasn't confirmed");
          if(next.reading_date!==checkedDay){if(next.reading_date===dayKey()){setNewDay(next.reading_date);return;}throw new Error("Reading wasn't confirmed");}
          setState(previous=>previous.user?.id===user.id && previous.readingRequest===null && previous.checkedDay===checkedDay ? {...previous,reading:newestOwnedReading(previous.reading,next,user.id,liveReading.current!==liveAtStart)} : previous);
        } catch {
          if(!cancelled && owner.current===user.id)setState(previous=>previous.reading?.user_id===user.id && previous.reading?.reading_date===checkedDay ? previous : {...previous,error:previous.error || "Your reading couldn’t be made just yet. Your chart is here; try again."});
        } finally {
          if(!cancelled && owner.current===user.id)setState(previous=>({...previous,generatingReading:false}));
        }
      }
    })();
    return ()=>{cancelled=true;};
  // Request identity, not state, owns this read; state changes never start another query.
  },[providedProfile?.user_id,revision,requestedReadingId,generateMissing]);
  useEffect(()=>{
    const check=()=>{const current=dayKey();setNewDay(!exactReading && state.checkedDay && current!==state.checkedDay ? current : null);};
    document.addEventListener("visibilitychange",check);window.addEventListener("pageshow",check);const timer=setInterval(check,60000);
    return()=>{document.removeEventListener("visibilitychange",check);window.removeEventListener("pageshow",check);clearInterval(timer);};
  },[state.checkedDay,exactReading]);
  useEffect(()=>{
    if(!state.user?.id || exactReading)return;
    const userId=state.user.id;
    const checkedDay=state.checkedDay;
    let active=true;
    const unsubscribe=base44.entities.HoroscopeReading.subscribe(event=>{
      const row=event.data;
      if(!active || owner.current!==userId || currentState.current.readingRequest!==null || currentState.current.checkedDay!==checkedDay || !["create","update"].includes(event.type) || row?.user_id!==userId || typeof row.id!=="string" || !row.id.trim() || !validReadingDate(row.reading_date))return;
      if(row.reading_date===checkedDay){
        const live=liveReading.current?.owner===userId && liveReading.current?.day===checkedDay ? liveReading.current.reading : null;
        const latest=live ? newestOwnedReading(live,currentState.current.reading,userId,true) : currentState.current.reading;
        const accepted=newestOwnedReading(latest,row,userId);
        liveReading.current={owner:userId,day:checkedDay,reading:accepted};
        setState(previous=>previous.user?.id===userId && previous.readingRequest===null && previous.checkedDay===checkedDay ? {...previous,reading:newestOwnedReading(previous.reading,row,userId)} : previous);
      }
      else if(row.reading_date===dayKey())setNewDay(row.reading_date);
    });
    return()=>{active=false;if(typeof unsubscribe==="function")unsubscribe();};
  },[state.user?.id,state.checkedDay,exactReading]);
  const visible = state.readingRequest===requestedReadingId ? state : {...EMPTY,readingRequest:requestedReadingId};
  return {...visible,exactReading,requestedReadingId,newDay:exactReading ? null : newDay,setAstro:astro=>setState(previous=>({...previous,astro})),refresh:()=>setRevision(value=>value+1)};
}

import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

// The founder preview reads what exists. Opening it must not generate a reading.
const EMPTY = {user:null,astro:null,reading:null,userProfile:null,loading:true,refreshing:false,generatingReading:false,error:"",checkedDay:null};
const dayKey = () => new Date().toISOString().slice(0,10); // same key as the existing producer
export default function useSelectedSkyChart(providedProfile) {
  const [state,setState] = useState(EMPTY);
  const [revision,setRevision] = useState(0);
  const [newDay,setNewDay]=useState(null);
  const owner = useRef(null);
  useEffect(()=>{
    let cancelled=false;
    const previousOwner=owner.current;
    if(previousOwner && revision>0 && (!providedProfile?.user_id || providedProfile.user_id===previousOwner))setState(previous=>({...previous,refreshing:true,error:""}));
    else {owner.current=null;setState(EMPTY);}
    (async()=>{
      let user;
      try {user=await base44.auth.me();}
      catch {if(!cancelled)setState({...EMPTY,loading:false,error:"Sign in to open your personal sky."});return;}
      if(cancelled)return;
      if(!user?.id){setState({...EMPTY,loading:false,error:"Sign in to open your personal sky."});return;}
      if(previousOwner && previousOwner!==user.id)setState(EMPTY);
      owner.current=user.id;
      const checkedDay=dayKey();
      const [charts,readings,profiles]=await Promise.allSettled([
        base44.entities.AstroProfile.filter({user_id:user.id},"-created_date",1),
        base44.entities.HoroscopeReading.filter({user_id:user.id,reading_date:checkedDay},"-created_date",1),
        providedProfile?.user_id===user.id ? Promise.resolve([providedProfile]) : base44.entities.UserProfile.filter({user_id:user.id},"-updated_at",1),
      ]);
      if(cancelled || owner.current!==user.id)return;
      const firstOwn = result => result.status === "fulfilled" && Array.isArray(result.value) ? result.value.find(row=>row.user_id===user.id) || null : null;
      const ownReading=firstOwn(readings);
      setState(previous=>({user,astro:charts.status==="rejected" && previous.user?.id===user.id ? previous.astro : firstOwn(charts),reading:readings.status==="rejected" && previous.user?.id===user.id ? previous.reading : ownReading?.reading_date===checkedDay ? ownReading : null,userProfile:profiles.status==="rejected" && previous.user?.id===user.id ? previous.userProfile : firstOwn(profiles),loading:false,refreshing:false,generatingReading:false,checkedDay,error:[charts,readings,profiles].some(result=>result.status==="rejected") ? "Part of your sky didn't load. Your saved details haven't changed." : ""}));
      setNewDay(dayKey()!==checkedDay ? dayKey() : null);
    })();
    return ()=>{cancelled=true;};
  },[providedProfile?.user_id,revision]);
  useEffect(()=>{
    const check=()=>{if(state.checkedDay && dayKey()!==state.checkedDay)setNewDay(dayKey());};
    document.addEventListener("visibilitychange",check);const timer=setInterval(check,60000);
    return()=>{document.removeEventListener("visibilitychange",check);clearInterval(timer);};
  },[state.checkedDay]);
  useEffect(()=>{
    if(!state.user?.id)return;
    const userId=state.user.id;
    const checkedDay=state.checkedDay;
    return base44.entities.HoroscopeReading.subscribe(event=>{
      const row=event.data;
      if(owner.current!==userId || !["create","update"].includes(event.type) || row?.user_id!==userId)return;
      if(row.reading_date===checkedDay)setState(previous=>({...previous,reading:row}));
      else if(row.reading_date===dayKey())setNewDay(row.reading_date);
    });
  },[state.user?.id,state.checkedDay]);
  return {...state,newDay,setAstro:astro=>setState(previous=>({...previous,astro})),refresh:()=>setRevision(value=>value+1)};
}

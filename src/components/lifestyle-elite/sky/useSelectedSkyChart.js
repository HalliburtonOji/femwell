import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

// The founder preview reads what exists. Opening it must not generate a reading.
const EMPTY = {user:null,astro:null,reading:null,userProfile:null,loading:true,generatingReading:false,error:""};
const dayKey = () => new Date().toISOString().slice(0,10); // same key as the existing producer
export default function useSelectedSkyChart(providedProfile) {
  const [state,setState] = useState(EMPTY);
  const [revision,setRevision] = useState(0);
  const owner = useRef(null);
  useEffect(()=>{
    let cancelled=false;
    owner.current=null;setState(EMPTY);
    (async()=>{
      let user;
      try {user=await base44.auth.me();}
      catch {if(!cancelled)setState({...EMPTY,loading:false,error:"Sign in to open your personal sky."});return;}
      if(cancelled)return;
      if(!user?.id){setState({...EMPTY,loading:false,error:"Sign in to open your personal sky."});return;}
      owner.current=user.id;
      const [charts,readings,profiles]=await Promise.allSettled([
        base44.entities.AstroProfile.filter({user_id:user.id},"-created_date",1),
        base44.entities.HoroscopeReading.filter({user_id:user.id,reading_date:dayKey()},"-created_date",1),
        providedProfile?.user_id===user.id ? Promise.resolve([providedProfile]) : base44.entities.UserProfile.filter({user_id:user.id},"-updated_at",1),
      ]);
      if(cancelled || owner.current!==user.id)return;
      const firstOwn = result => result.status === "fulfilled" && Array.isArray(result.value) ? result.value.find(row=>row.user_id===user.id) || null : null;
      setState({user,astro:firstOwn(charts),reading:firstOwn(readings),userProfile:firstOwn(profiles),loading:false,generatingReading:false,error:[charts,readings,profiles].some(result=>result.status==="rejected") ? "Part of your sky didn't load. Your saved details haven't changed." : ""});
    })();
    return ()=>{cancelled=true;owner.current=null;};
  },[providedProfile?.user_id,revision]);
  useEffect(()=>{
    if(!state.user?.id)return;
    const userId=state.user.id;
    return base44.entities.HoroscopeReading.subscribe(event=>{
      const row=event.data;
      if(owner.current===userId && ["create","update"].includes(event.type) && row?.user_id===userId && row.reading_date===dayKey())setState(previous=>({...previous,reading:row}));
    });
  },[state.user?.id]);
  return {...state,setAstro:astro=>setState(previous=>({...previous,astro})),refresh:()=>setRevision(value=>value+1)};
}

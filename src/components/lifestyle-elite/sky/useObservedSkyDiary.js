import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { validSkyBirthday } from "./skyCompletion";

const EMPTY={owner:null,loading:false,periodStarts:[],readings:[],readingError:"",cycleError:""};
export default function useObservedSkyDiary(userId) {
  const [state,setState]=useState(EMPTY);
  useEffect(()=>{
    let cancelled=false;
    if(!userId){setState(EMPTY);return;}
    setState({...EMPTY,owner:userId,loading:true});
    (async()=>{
      const [cycles,readings]=await Promise.allSettled([
        base44.entities.CycleEvents.filter({user_id:userId},"-date",36),
        base44.entities.HoroscopeReading.filter({user_id:userId},"-reading_date",12),
      ]);
      if(cancelled)return;
      const starts=cycles.status==="fulfilled" && Array.isArray(cycles.value) ? cycles.value
        .filter(row=>row.user_id===userId && ["period_start","periodstart"].includes(String(row.type || "").toLowerCase()) && validSkyBirthday(row.date))
        .map(raw=>({date:new Date(`${raw.date}T12:00:00`),raw})).sort((a,b)=>b.date-a.date).slice(0,12) : [];
      const owned=readings.status==="fulfilled" && Array.isArray(readings.value) ? readings.value.filter(row=>row.user_id===userId) : [];
      setState({owner:userId,loading:false,periodStarts:starts,readings:owned,
        readingError:readings.status==="rejected" ? "Your earlier readings couldn’t load." : "",
        cycleError:cycles.status==="rejected" ? "Your cycle dates couldn’t load." : ""});
    })();
    return()=>{cancelled=true;};
  },[userId]);
  return state.owner===userId ? state : {...EMPTY,loading:!!userId};
}

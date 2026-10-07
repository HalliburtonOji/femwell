import { useEffect, useState } from "react";
import { localSkyDay } from "./skyLessons";

// Present-tense Moon facts share this clock. Dated readings and authored lesson
// decks keep their own identity and only change through their existing actions.
export default function useCurrentSkyDay(enabled = true) {
  const [day,setDay]=useState(()=>localSkyDay());
  useEffect(()=>{
    if(!enabled)return;
    const check=()=>setDay(localSkyDay());
    check();document.addEventListener("visibilitychange",check);window.addEventListener("pageshow",check);
    const timer=setInterval(check,60000);
    return()=>{document.removeEventListener("visibilitychange",check);window.removeEventListener("pageshow",check);clearInterval(timer);};
  },[enabled]);
  return day;
}

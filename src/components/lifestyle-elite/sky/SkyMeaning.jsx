import React, { useId, useRef, useState } from "react";
import { C } from "@/components/brand/cleanTokens";
import { SERIF } from "@/components/journal/Editorial";

// Small visible ornament; generous tap target. Content stays in the page flow.
export default function SkyMeaning({ label, explanation, children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const trigger = useRef(null);
  return <div className="sky-meaning" onKeyDown={event => {
    if (event.key === "Escape" && open) { setOpen(false); trigger.current?.focus(); }
  }}>
    <div style={{position:"relative",minHeight:44,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 44px"}}>
      {children}
      <button ref={trigger} type="button" aria-label={`About ${label}`} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(v=>!v)}
        style={{position:"absolute",right:0,top:0,width:44,height:44,border:0,background:"transparent",padding:10,cursor:"pointer",color:C.ink}}>
        <svg aria-hidden="true" viewBox="0 0 28 28" width="24" height="24">
          <path d="M14 2C18 2 17 6 21 5C25 5 23 10 26 12C28 16 23 17 23 21C22 25 18 22 16 26C12 28 11 23 7 23C3 23 5 18 2 16C0 12 5 11 5 7C5 3 10 5 12 2Z" fill={open ? C.goldHair : C.sunk} stroke={C.gold} strokeWidth=".8"/>
          <text x="14" y="19" textAnchor="middle" fill={C.ink} style={{font:`600 18px ${SERIF}`}}>?</text>
        </svg>
      </button>
    </div>
    <div id={id} hidden={!open} style={{padding:"10px 14px",margin:"0 0 14px",borderLeft:`1px solid ${C.gold}`,background:C.sunk,borderRadius:"0 12px 12px 0",textAlign:"left",color:C.ink,font:`500 16px/1.55 ${SERIF}`}}>{explanation}</div>
  </div>;
}

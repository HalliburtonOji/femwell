import React, { useId, useState } from "react";
import { C } from "@/components/brand/cleanTokens";
import { SERIF, UI, Heart } from "@/components/journal/Editorial";
import { getMoonPhase } from "@/utils/astrology";

// A northern-view phase schematic, not an observer-specific position or sky photograph.
// The curved terminator follows the same phase used by the numerical illumination label.
export function MoonDisc({ position = 0, size = 140, label }) {
  const id = useId().replace(/:/g, "");
  const p = ((position % 1) + 1) % 1;
  const half = p > 0.5 ? 1 - p : p;
  const rx = Math.abs(Math.cos(half * 2 * Math.PI)) * 50;
  const path = `M 0 -50 A 50 50 0 0 1 0 50 A ${Math.max(.001, rx)} 50 0 0 ${half < .25 ? 0 : 1} 0 -50 Z`;
  return <svg width={size} height={size} viewBox="-55 -55 110 110" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    <defs>
      <radialGradient id={`${id}light`} cx="32%" cy="28%"><stop stopColor={C.surface}/><stop offset=".65" stopColor="#ECE7DA"/><stop offset="1" stopColor="#C6BEB0"/></radialGradient>
      <radialGradient id={`${id}dark`} cx="30%" cy="20%"><stop stopColor="#695567"/><stop offset="1" stopColor="#2B1E26"/></radialGradient>
      <clipPath id={`${id}clip`}><path d={path}/></clipPath>
    </defs>
    <circle r="51" fill={`url(#${id}dark)`} stroke={C.goldHair} strokeWidth=".5"/>
    <g transform={`scale(${p > .5 ? -1 : 1} 1)`}>
      <path d={path} fill={`url(#${id}light)`}/>
      <g clipPath={`url(#${id}clip)`} fill="#655E69" opacity=".13">
        {[[-18,-24,12],[14,-10,16],[-9,19,14],[28,24,7],[-30,8,5],[7,-36,4],[12,35,5]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r}/>)}
      </g>
    </g>
  </svg>;
}

export const PHASE_LESSONS = [
  ["New moon", "The sunlit half faces away from Earth. A new cycle begins."],
  ["Waxing crescent", "A little more of the sunlit half comes into view each day."],
  ["First quarter", "Half-lit, a quarter of the way through the lunar cycle."],
  ["Waxing gibbous", "More than half is lit. The Moon is on its way to full."],
  ["Full moon", "We see almost all of the sunlit half. The Moon still borrows its light."],
  ["Waning gibbous", "The lit part we see is shrinking after the full moon."],
  ["Last quarter", "Half-lit again, now on the way towards the new moon."],
  ["Waning crescent", "A slim crescent remains before the cycle begins again."],
];

export function CelestialHeader({ moon }) {
  const current = moon || getMoonPhase(new Date());
  return <header className="sky-moon-header" style={{ textAlign:"center", color:C.ink }}>
    <div style={{ position:"relative", height:226, overflow:"hidden", borderRadius:"48% 48% 18px 18px", background:"radial-gradient(ellipse at 50% 47%, #E7DFEA 0%, #F5F4F1 65%)", display:"grid", placeItems:"center" }}>
      <svg aria-hidden="true" viewBox="0 0 360 240" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} fill="none" stroke={C.goldHair}>
        <ellipse cx="180" cy="121" rx="132" ry="92" transform="rotate(-18 180 121)"/>
        <ellipse cx="180" cy="121" rx="109" ry="103" strokeDasharray="2 8"/>
        {[[52,59],[284,38],[312,127],[87,189],[254,198],[127,32]].map(([x,y],i)=><path key={i} d={`M${x-4} ${y}h8 M${x} ${y-4}v8`} stroke={C.gold} strokeWidth=".8"/>)}
        <g stroke="#8E6E8E" strokeWidth="1.2" opacity=".85">
          <path d="M41 232Q52 180 107 159M58 198Q38 186 43 169Q62 173 58 198M74 181Q91 181 97 166Q80 164 74 181M91 168Q83 145 94 133Q111 143 107 159"/>
          <path d="M105 159Q93 140 105 130Q117 129 119 143Q136 140 137 152Q129 167 113 162Z"/>
          <path d="M107 159L119 146M107 159L130 153"/>
        </g>
      </svg>
      <div style={{ position:"relative", filter:"drop-shadow(0 14px 18px #69556730)" }}><MoonDisc position={current.position} size={146} label={`${current.name}, approximately ${current.illumination}% illuminated`}/></div>
      <span style={{ position:"absolute", top:8, left:0, right:0, font:`600 12px ${UI}`, letterSpacing:".15em", textTransform:"uppercase" }}>{new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long"})} · above us</span>
    </div>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginTop:4 }}><h1 style={{ font:`600 clamp(44px,9.5vw,56px)/1.05 ${SERIF}`, margin:0 }}>Your sky</h1><Heart size={16}/></div>
    <p style={{ font:`500 18px/1.4 ${SERIF}`, fontStyle:"italic", margin:"8px 0" }}>A little wonder. Both feet on the ground.</p>
    <p style={{ font:`600 12px/1.5 ${UI}`, margin:0 }}>{current.name} · about {current.illumination}% lit</p>
  </header>;
}

export function MoonLesson({ moon }) {
  const current = moon || getMoonPhase(new Date());
  const today = Math.max(0, ["new", "waxing_crescent", "first_quarter", "waxing_gibbous", "full", "waning_gibbous", "last_quarter", "waning_crescent"].indexOf(current.key));
  const [selected, setSelected] = useState(null);
  const index = selected ?? today;
  return <div className="sky-moon-lesson" style={{ marginTop:22, paddingTop:18, borderTop:`1px solid ${C.goldHair}` }}>
    <p className="sky-kicker">A small sky lesson</p>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:"8px 4px" }}>
      {PHASE_LESSONS.map(([name], i)=><button key={name} type="button" aria-label={`Learn about ${name.toLowerCase()}`} aria-pressed={index===i} onClick={()=>setSelected(i)} style={{ minHeight:64, borderRadius:12, padding:"7px 2px", border:`1px solid ${index===i ? C.goldHair : "transparent"}`, background:index===i ? C.surface : "transparent", color:C.ink, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}><MoonDisc position={i/8} size={24}/><span style={{ font:`500 12px/1.2 ${UI}` }}>{name}</span>{i===today && <span style={{font:`700 12px ${UI}`}}>Today</span>}</button>)}
    </div>
    <p aria-live="polite" style={{ minHeight:70, font:`500 18px/1.5 ${SERIF}`, margin:"14px 0 4px" }}><strong>{PHASE_LESSONS[index][0]}.</strong> {PHASE_LESSONS[index][1]}</p>
    <p style={{font:`500 12px/1.5 ${UI}`, color:C.slate, margin:0}}>Northern-view illustration; not your local sky angle. <a href="https://science.nasa.gov/moon/moon-phases/" target="_blank" rel="noreferrer" style={{color:C.ink}}>Moon facts · NASA</a></p>
  </div>;
}

export const CELESTIAL_CSS = `
.sky-celestial{--sky-plum:#8E6E8E;--sky-night:#2B1E26}
.sky-celestial .sky-kicker{font:700 12px/1.5 ${UI};letter-spacing:.12em;text-transform:uppercase;color:${C.ink};margin:0 0 12px}
.sky-celestial .sky-reading{padding:24px 22px;border-left:1px solid ${C.goldHair};background:linear-gradient(110deg,#FFFFFFDD,transparent);border-radius:0 24px 24px 0}
.sky-celestial .sky-reading p{line-height:1.65!important}
.sky-celestial .sky-reading:focus{outline:2px solid ${C.goldHair};outline-offset:4px}
.sky-celestial .sky-triad-icon{border:1px solid ${C.goldHair};box-shadow:0 0 0 5px ${C.surface},0 0 0 6px ${C.hair};border-radius:50%;width:44px;height:44px;align-items:center;margin:8px auto 18px}
.sky-celestial .sky-note{font:500 17px/1.5 ${SERIF};color:${C.ink};margin:12px 0}
.sky-celestial button:focus-visible,.sky-moon-lesson button:focus-visible{outline:2px solid ${C.ink};outline-offset:3px}
.sky-celestial section>div>h3{letter-spacing:-.02em}
`;

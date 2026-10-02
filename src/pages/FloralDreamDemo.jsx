import React, { useRef, useState } from "react";
import { Heart, SERIF, SCRIPT, UI } from "@/components/journal/Editorial";
import { C } from "@/components/brand/cleanTokens";
import { Card } from "@/components/brand/cleanKit";
import { Moth } from "@/components/brand/flora";
import { LifecycleStage, SpeciesBloom } from "@/components/brand/floraLibrary";
import SkyMeaning from "@/components/lifestyle-elite/sky/SkyMeaning";
import LifestyleEliteShell from "@/components/lifestyle-elite/LifestyleEliteShell";

export const DREAM_SCENES = [
  {id:"dawn",label:"Dawn",line:"It grew around the clock. Quite right, too.",alt:"A violet iris growing through an opaline glass petal observatory, with ferns and a small pearl moon held by a stem."},
  {id:"night",label:"After hours",line:"The garden has put the day down.",alt:"The same iris observatory in violet evening light, its glass catching soft moonlike reflections."},
  {id:"rest",label:"Rest",line:"Nothing to prove. Plenty still becoming.",alt:"The same living garden at rest, with a closed iris bud, a seed capsule and green fern beneath the glass."},
];
const STAGES = [
  {label:"Bud",name:"bud",line:"A beginning can be very small."},
  {label:"Bloom",name:"bloom",line:"Something has opened. Let it have its moment."},
  {label:"Seed",name:"seed (hip)",line:"Some things become something else."},
  {label:"Rest",name:"rest (cane)",line:"A quiet stretch is still part of the garden."},
  {label:"Return",name:"bud",line:"A familiar place. A new beginning."},
];
const ROOMS = [
  {label:"Today",line:"A little room for good things.",detail:"One generous scene at the top; the rest of your day stays clear."},
  {label:"Read",line:"A world between the pages.",detail:"An iris-led reading room. Covers carry the story; text gets clean space."},
  {label:"Sky",line:"The garden keeps its own time.",detail:"A lunar garden around a real phase dial, with a quiet explanation when you want it."},
];

export function FloralArtStudy() {
  const [scene,setScene] = useState(0);
  const [visitor,setVisitor] = useState(false);
  const [moving,setMoving] = useState(false);
  const [replay,setReplay] = useState(0);
  const [failed,setFailed] = useState(false);
  const [retry,setRetry] = useState(0);
  const [stage,setStage] = useState(1);
  const [room,setRoom] = useState(0);
  const sceneRef = useRef(null);
  const current = DREAM_SCENES[scene];
  return <main className="dream-study" style={{color:C.ink,background:C.ground,minHeight:"100vh"}}>
    <style>{`
      .dream-study{font-family:${SERIF};padding:64px 0 130px;max-width:680px;margin:auto}
      .dream-study *{box-sizing:border-box}
      .dream-study h1,.dream-study h2,.dream-study h3{text-shadow:none;color:${C.ink}}
      .dream-study h1{font:400 clamp(44px,9.5vw,56px)/1.14 ${SCRIPT};margin:10px 0 6px}
      .dream-study h2{font:600 clamp(27px,6.4vw,34px)/1.18 ${SERIF};margin:0 0 12px}
      .dream-study h3{font:600 20px/1.2 ${SERIF};margin:0 0 10px}
      .dream-study p{font:500 17px/1.55 ${SERIF};margin:8px 0}
      .dream-study a{color:${C.ink};text-underline-offset:4px}
      .dream-study button,.dream-study summary{cursor:pointer}
      .dream-study button:focus-visible,.dream-study a:focus-visible,.dream-study summary:focus-visible{outline:2px solid ${C.ink};outline-offset:3px}
      .dream-study .dream-meta{font:600 12px/1.4 ${UI};letter-spacing:.06em}
      .dream-study .dream-kicker{font:700 12px/1.3 ${UI};letter-spacing:.13em;text-transform:uppercase}
      .dream-study .dream-pad{padding:0 22px}
      .dream-study .dream-choices{display:flex;gap:5px;flex-wrap:wrap;justify-content:center}
      .dream-study .dream-choice{min-height:44px;padding:8px 14px;border:1px solid ${C.hair};border-radius:99px;background:${C.surface};color:${C.ink};font:600 12px/1.4 ${UI}}
      .dream-study .dream-choice[aria-pressed=true]{border-color:${C.ink};background:${C.ink};color:${C.surface}}
      .dream-study .dream-link{display:inline-flex;align-items:center;min-height:44px;font:600 12px/1.4 ${UI};padding:8px 0;background:none;border:0;color:${C.ink};text-decoration:underline;text-underline-offset:4px}
      .dream-study .dream-section{margin:36px 22px 0;padding-top:24px;border-top:1px solid ${C.goldHair}}
      .dream-study details{border-top:1px solid ${C.hair};padding:8px 0}
      .dream-study summary{font:600 14px/1.4 ${UI};min-height:44px;align-content:center}
      @keyframes dreamSettle{from{transform:scale(1.025);opacity:.8}to{transform:none;opacity:1}}
      @keyframes dreamVisitor{from{transform:translate(15px,-20px) rotate(12deg);opacity:0}to{transform:none;opacity:1}}
      .dream-study .dream-moving{animation:dreamSettle 4s cubic-bezier(.215,.61,.355,1) both}
      .dream-study .dream-visitor{animation:dreamVisitor 3s ease-out both}
      @media(prefers-reduced-motion:reduce){.dream-study .dream-moving,.dream-study .dream-visitor{animation:none!important}.dream-study .dream-motion{display:none!important}}
      body:has(.dream-study) a[aria-label="Open Ideas (Design Lab — dev only)"]{position:relative!important;inset:auto!important;display:flex!important;width:fit-content;margin:0 auto 110px!important;transform:none!important}
    `}</style>
    <nav className="dream-pad" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}><a className="dream-link" href="/Ideas?section=brand">Ideas · botanical study</a><a className="dream-link" href="/FloralDreamDemo">Lifestyle preview</a></nav>
    <div className="dream-pad" style={{textAlign:"center",paddingTop:12}}><p className="dream-kicker">FemWell · an imagined garden</p><h1>Wildly, quietly <span style={{whiteSpace:"nowrap"}}>yours <Heart size={16} style={{display:"inline-block",verticalAlign:"middle"}}/></span></h1><p style={{fontStyle:"italic",margin:"8px 0 18px"}}>The garden keeps its own time.</p></div>
    <div ref={sceneRef} style={{position:"relative",overflow:"hidden",aspectRatio:"3 / 2",background:C.sunk}}>
      {failed ? <div role="status" style={{height:"100%",display:"grid",placeContent:"center",textAlign:"center"}}><SpeciesBloom name="iris" size={100}/><p>The artwork couldn't load.</p><button className="dream-link" onClick={()=>{setRetry(v=>v+1);setFailed(false);}}>Reload artwork</button></div> : <img key={`${current.id}-${retry}-${replay}`} onError={()=>setFailed(true)} onAnimationEnd={()=>setMoving(false)} className={moving ? "dream-moving" : undefined} src={`/images/flora-dream/observatory-${current.id}.webp${retry ? `?retry=${retry}` : ""}`} alt={current.alt} width="1200" height="800" fetchPriority="high" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>}
      {visitor && <span className="dream-visitor" role="img" aria-label="Preview moth resting on the glass" style={{position:"absolute",left:"70%",top:"46%",pointerEvents:"none"}}><Moth size={22} animate={false} color="#8E6E8E" color2={C.goldHair} idx={915}/></span>}
    </div>
    <div className="dream-pad" style={{textAlign:"center",paddingTop:18}}>
      <div role="group" aria-label="Garden atmosphere" className="dream-choices">{DREAM_SCENES.map((item,i)=><button key={item.id} className="dream-choice" aria-pressed={scene===i} onClick={()=>{setScene(i);setFailed(false);setMoving(false);}}>{item.label}</button>)}</div>
      <p aria-live="polite" style={{minHeight:52,fontStyle:"italic",margin:"14px 0 0"}}>{current.line}</p>
      <div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}><button className="dream-link dream-motion" aria-label={moving ? "Still the garden" : "Replay garden movement"} onClick={()=>{setMoving(v=>!v);setReplay(v=>v+1);}}>{moving ? "Still" : "A little movement"}</button><button className="dream-link" aria-pressed={visitor} onClick={()=>setVisitor(v=>!v)}>{visitor ? "Let the visitor go" : "Preview a visitor"}</button></div>
      <p className="dream-meta">Art study · sample states · no account changes</p>
      <SkyMeaning label="this garden" explanation="The iris becomes the glass house; a stem borrows the clock's hand. This is FemWell's imagined world, not a sky measurement. The visitor is a preview of a return moment, not a reward for a streak."><span className="dream-meta">A little meaning</span></SkyMeaning>
    </div>

    <section className="dream-section">
      <p className="dream-kicker">One world, different rooms</p><h2>A recognisable home.</h2>
      <div role="group" aria-label="Surface preview" className="dream-choices" style={{justifyContent:"flex-start",marginBottom:16}}>{ROOMS.map((item,i)=><button key={item.label} className="dream-choice" aria-pressed={room===i} onClick={()=>setRoom(i)}>{item.label}</button>)}</div>
      <Card style={{padding:0,overflow:"hidden"}}><img src={`/images/flora-dream/observatory-${room===2 ? "night" : "dawn"}.webp`} alt="" loading="lazy" width="1200" height="800" style={{width:"100%",height:130,objectFit:"cover",objectPosition:room===1 ? "28% 20%" : "center 65%",display:"block"}}/><div style={{padding:"18px 20px"}}><p className="dream-kicker">{ROOMS[room].label} · layout study</p><h3>{ROOMS[room].line}</h3><p>{ROOMS[room].detail}</p>{room===2 && <a className="dream-link" href="/SkyConceptDemo">Open the connected Sky preview</a>}</div></Card>
      <p className="dream-meta">Placement studies; bespoke room compositions follow.</p>
    </section>

    <section className="dream-section">
      <p className="dream-kicker">A living ecosystem</p><h2>Five ways to be.</h2><p>Blooming is only one of them.</p>
      <div role="group" aria-label="Lifecycle preview" className="dream-choices">{STAGES.map((item,i)=><button key={item.label} className="dream-choice" aria-pressed={stage===i} onClick={()=>setStage(i)}>{item.label}</button>)}</div>
      <div style={{display:"flex",alignItems:"center",gap:20,minHeight:180,padding:"16px 0"}}><div role="img" aria-label={`${STAGES[stage].label} lifecycle illustration`} style={{position:"relative",flexShrink:0}}><LifecycleStage name={STAGES[stage].name} size={110}/>{stage===4 && <span aria-hidden="true" style={{position:"absolute",right:-12,bottom:0}}><SpeciesBloom name="fern" size={38}/></span>}</div><div><h3>{STAGES[stage].label}</h3><p aria-live="polite">{STAGES[stage].line}</p></div></div>
      <p className="dream-meta">Behaviour study using the existing botanical drawings. A matching generated artwork family is the next craft pass.</p>
    </section>

    <section className="dream-section"><h2>What changes in the Bible.</h2>
      <p>Real materials. Unexpected relationships. A garden with a point of view.</p>
      <details><summary>The creative standard</summary><p>Each scene needs one story: a petal becoming a room, a garden interrupting a clock, a seed holding the next beginning. Recognisable anatomy, imperfect edges and believable light make the impossible feel tangible.</p><p>We retire generic isolated stems as hero concepts. Small interface ornaments stay simple; larger artwork earns detail, atmosphere and personality.</p></details>
      <details><summary>The whole ecosystem audit</summary><p>Keep the species library, bouquets, Bloomprint, private presence blooms, meaning reveals and visitors. Upgrade their art without replacing their behaviour.</p><ul><li>Verify species silhouettes individually; catalogue coverage is not proof of hero-quality rendering.</li><li>Complete the five-state lifecycle; keep a living bud through rest.</li><li>Keep a person's identity stable across visits; let seasons change the scene.</li><li>Visitors need real, appropriate moments. Decorative art must never pretend to know what happened.</li><li>Fix invalid animation delays and verify quiet-mode motion.</li><li>Build enough reviewed omen lines before promising no repeats.</li></ul><p>These are documented repairs and proposals. This study does not claim those production engines have already changed.</p></details>
      <details><summary>Where the inspiration came from</summary><p><a href="https://www.vam.ac.uk/articles/objects-of-beauty-art-nouveau-glass-and-jewellery" target="_blank" rel="noreferrer">V&amp;A · Art Nouveau glass</a>: leaves and petals can become an object's structure.</p><p><a href="https://www.britishmuseum.org/collection/object/P_1897-0505-645" target="_blank" rel="noreferrer">Mary Delany · Sea Daffodil</a>: precise anatomy, layered edges and deliberate asymmetry.</p><p><a href="https://www.vam.ac.uk/blog/caring-for-our-collections/a-blueprint-for-the-future-cyanotypes-by-anna-atkins" target="_blank" rel="noreferrer">Anna Atkins · cyanotypes</a>: botanical form transformed through light.</p><p><a href="https://www.teamlab.art/w/ffgarden/" target="_blank" rel="noreferrer">Floating Flower Garden</a>: living growth makes space around the person.</p><p>These references informed principles. The scene is newly generated for FemWell, not a reproduction of those works.</p></details>
      <details><summary>Build checks and limits</summary><p>Preview controls change only this study. Artwork is generated and decorative; the moon here is not today's phase. Main-page rollout still needs Halli's approval.</p><p>Image load errors have a retry; motion is finite, optional and reduced-motion aware. Final test and phone evidence is recorded in the shared release log.</p></details>
      <nav style={{display:"flex",flexWrap:"wrap",gap:"4px 18px",marginTop:18}}><a className="dream-link" href="/FloraLabDemo">Existing flora library</a><a className="dream-link" href="/BloomprintDemo">Bloomprint study</a><a className="dream-link" href="/Ideas?section=brand">Brand Bible &amp; review board</a></nav>
    </section>
  </main>;
}

export default function FloralDreamDemo() {
  const [direction, setDirection] = useState(() => { const value = new URLSearchParams(window.location.search).get("direction"); return ["almanac", "canopy"].includes(value) ? value : "garden"; });
  if (new URLSearchParams(window.location.search).get("study") === "art") return <FloralArtStudy/>;
  const previous = new URLSearchParams(window.location.search).get("study") === "integrated";
  const changeDirection = value => {
    setDirection(value);
    const url = new URL(window.location.href);
    url.searchParams.set("direction", value);
    window.history.replaceState(window.history.state, "", url);
  };
  return <div className="fw-floral-review">
    <style>{`.fw-floral-review [aria-label="Section actions"] button{color:${C.ink}!important}.floral-review-nav{max-width:430px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:46px 16px 0;color:${C.ink};font:500 12px/1.4 ui-sans-serif,system-ui,sans-serif}.floral-review-nav a{color:inherit;min-height:44px;display:flex;align-items:center}.floral-review-nav button{font:inherit;min-height:44px;padding:0 10px;border:0;background:transparent;color:#6E6A61;border-bottom:2px solid transparent;cursor:pointer}.floral-review-nav button[aria-pressed=true]{color:#51444E;border-bottom-color:#51444E}.floral-review-notes{max-width:430px;margin:auto;padding:0 18px 24px;font:500 12px/1.6 ui-sans-serif,system-ui,sans-serif}.floral-review-notes summary,.floral-review-notes a{min-height:44px;align-content:center;color:#51444E}.floral-review-notes a{display:inline-block;margin-right:16px}body:has(.fw-floral-review) a[aria-label="Open Ideas (Design Lab — dev only)"]{position:relative!important;inset:auto!important;display:flex!important;width:fit-content;margin:0 auto 120px!important;transform:none!important}`}</style>
    <nav className="floral-review-nav" aria-label="Founder design comparison"><a href="/Ideas?section=brand">Ideas · review</a><div role="group" aria-label="Design direction"><button aria-pressed={direction==="garden"} onClick={()=>changeDirection("garden")}>Garden</button><button aria-pressed={direction==="almanac"} onClick={()=>changeDirection("almanac")}>Almanac</button><button aria-pressed={direction==="canopy"} onClick={()=>changeDirection("canopy")}>Canopy</button></div></nav>
    <LifestyleEliteShell enableFocus layout="bespoke" clean previewActions initialSection="sky" continuousSky celestialSky botanicalHeader firstFoldVariant={previous ? null : direction} />
    <aside className="floral-review-notes"><details><summary>The little-garden workflow</summary><p>Connected Lifestyle preview · actions use your account. Garden is the latest proposal; Almanac and Canopy retain the earlier designs. Main-page promotion awaits your approval.</p><p>Each header begins with its own story, correct plants, fallen petals and meaningful objects. The complete wording gets a clearing before the art is generated.</p><p>Read: iris and a reading lens. Listen: bluebells and rippling water. Books: jasmine through a bookmark. Sky: a garden observatory with its calculated Moon. Good life: marigolds around a tea nook.</p><p>Source and testing notes: five original generated compositions, no backend changes, existing actions retained. Mobile verification and any remaining gaps are recorded in the shared release log. Exact scenes remain for your review.</p><a href="https://www.kew.org/kew-gardens/whats-in-the-gardens/japanese-landscape" target="_blank" rel="noreferrer">Kew · activity and calm</a><a href="https://www.kew.org/kew-gardens/whats-in-the-gardens/bamboo-garden-and-minka-house" target="_blank" rel="noreferrer">Kew · objects within planting</a><a href="https://www.vam.ac.uk/shop/prints/floral-and-still-life/the-secret-garden-print-by-lucille-clerc-162065.html" target="_blank" rel="noreferrer">V&amp;A · an imagined garden</a><a href="/FloralDreamDemo?study=integrated">Previous integrated version</a><a href="/FloralDreamDemo?study=art">Earlier art study</a></details></aside>
  </div>;
}

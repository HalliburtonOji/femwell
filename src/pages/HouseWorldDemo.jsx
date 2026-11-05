import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Cat, Dog, Flower2, RotateCcw, Sun, Volume2, X } from "lucide-react";
import { getMoonPhase } from "@/utils/astrology";
import "./HouseWorldDemo.css";

const WORLDS = [
  { id: "miniature", label: "The miniature", note: "A little house with actual corners and a garden trying to get in." },
  { id: "glasshouse", label: "The glasshouse", note: "Light, glass and a very opinionated climbing vine." },
  { id: "folio", label: "The living folio", note: "An illustrated house that opens like a treasured book." },
];
const PETS = [
  { id: "cat", label: "Cat", Icon: Cat, line: "Your cat has chosen the chair. Jess has accepted this." },
  { id: "dog", label: "Dog", Icon: Dog, line: "Your dog is keeping a close eye on the garden gate." },
  { id: "bird", label: "Bird", Icon: Flower2, line: "Your bird thinks the window is excellent television." },
];
const STORAGE_KEY = "femwell_house_world_preview_v1";
const initial = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      world: WORLDS.some((w) => w.id === parsed.world) ? parsed.world : "miniature",
      pet: PETS.some((p) => p.id === parsed.pet) ? parsed.pet : "cat",
      seat: parsed.seat === "window" ? "window" : "books",
      flower: parsed.flower === "amber" ? "amber" : "violet",
    };
  } catch { return { world: "miniature", pet: "cat", seat: "books", flower: "violet" }; }
};

function PetPortrait({ kind }) {
  if (kind === "bird") return <g className="hw-pet-figure"><ellipse cx="0" cy="8" rx="22" ry="16" fill="#c58862"/><path d="M-14 6Q-29-17-9-12Q0-3 5 11" fill="#e8ba89"/><circle cx="17" cy="1" r="12" fill="#c58862"/><circle cx="22" cy="-2" r="2" fill="#252127"/><path d="M28 2l14 4-14 4" fill="#d8a655"/><path d="M-4 25v10m12-9v9" stroke="#805b44" strokeWidth="3"/></g>;
  if (kind === "dog") return <g className="hw-pet-figure"><ellipse cx="0" cy="17" rx="29" ry="20" fill="#bb8668"/><circle cx="18" cy="-8" r="18" fill="#c99675"/><path d="M6-22Q-11-30 1 3" fill="#80523f"/><path d="M28-22Q47-31 37 4" fill="#80523f"/><circle cx="23" cy="-10" r="2" fill="#2a2624"/><circle cx="36" cy="-8" r="2" fill="#2a2624"/><ellipse cx="30" cy="2" rx="4" ry="3" fill="#392923"/><path d="M-25 11Q-48-11-38-19" fill="none" stroke="#bb8668" strokeWidth="8" strokeLinecap="round"/><path d="M-17 31v11m30-10v10" stroke="#95664e" strokeWidth="8" strokeLinecap="round"/></g>;
  return <g className="hw-pet-figure"><ellipse cx="0" cy="18" rx="26" ry="21" fill="#a89389"/><circle cx="16" cy="-8" r="18" fill="#b7a399"/><path d="M0-19l1-21 17 15m11 0 14-18-2 26" fill="#b7a399"/><path d="M7-26l-2-9 8 7m19 1 7-9-2 12" fill="#c7949b"/><circle cx="19" cy="-9" r="2" fill="#322d2d"/><circle cx="34" cy="-9" r="2" fill="#322d2d"/><path d="M25-1l4 2-3 3" fill="#795b5f"/><path d="M-22 26Q-59 10-41-20" fill="none" stroke="#a89389" strokeWidth="11" strokeLinecap="round"/></g>;
}

function HouseIllustration({ world, pet, seat, flower, moon, onObject, reducedMotion }) {
  const hour = new Date().getHours();
  const evening = hour < 7 || hour > 18;
  return <div className={`hw-art hw-${world} ${reducedMotion ? "hw-still" : ""}`}>
    <svg className="hw-scene" viewBox="0 0 760 650" role="img" aria-label={`${WORLDS.find(w => w.id === world).label} preview: furnished room, Jess, ${pet}, garden and sky`}>
      <defs>
        <linearGradient id="hw-sky" x2="0" y2="1"><stop stopColor={evening ? "#333247" : "#d9dfdf"}/><stop offset="1" stopColor={evening ? "#846a80" : "#f3e1d6"}/></linearGradient>
        <linearGradient id="hw-wall" x2="0" y2="1"><stop stopColor={world === "folio" ? "#f9f2df" : "#f0e4d4"}/><stop offset="1" stopColor={world === "glasshouse" ? "#d7e7dd" : "#d9c7b2"}/></linearGradient>
        <linearGradient id="hw-floor" x2="0" y2="1"><stop stopColor="#a88064"/><stop offset="1" stopColor="#604c42"/></linearGradient>
        <linearGradient id="hw-glass" x2="0" y2="1"><stop stopColor="#d6e9e9" stopOpacity=".48"/><stop offset="1" stopColor="#bbc9c3" stopOpacity=".22"/></linearGradient>
        <radialGradient id="hw-lamp"><stop stopColor="#ffe8b7" stopOpacity=".8"/><stop offset="1" stopColor="#ffe8b7" stopOpacity="0"/></radialGradient>
        <filter id="hw-shadow"><feGaussianBlur stdDeviation="13"/></filter>
        <clipPath id="hw-window"><rect x="287" y="108" width="185" height="203" rx={world === "folio" ? 80 : 22}/></clipPath>
      </defs>
      <ellipse cx="380" cy="567" rx="307" ry="65" fill="#5c493c" opacity=".22" filter="url(#hw-shadow)"/>
      {world === "folio" && <><path d="M52 91Q369 33 712 91v486Q385 535 52 581Z" fill="#f7f0dd" stroke="#b79b72" strokeWidth="3"/><path d="M380 80v478" stroke="#c4aa82" strokeWidth="2" opacity=".65"/></>}
      {world === "glasshouse" ? <><path d="M65 192L380 42 696 192v322L380 610 65 514Z" fill="url(#hw-glass)" stroke="#69877e" strokeWidth="10"/><path d="M380 42v556M65 192l315 115 316-115M185 135v420m388-420v420" fill="none" stroke="#76968b" strokeWidth="7" opacity=".8"/></> : <><path d="M66 207L380 58 694 207v309L380 610 66 515Z" fill="url(#hw-wall)" stroke={world === "folio" ? "#aa846e" : "#684d48"} strokeWidth="10"/><path d="M62 207L380 58 698 207" fill="none" stroke="#4e3d40" strokeWidth="20" strokeLinecap="round"/><path d="M64 211v300l316 96V310Z" fill="#d9c8b7" opacity=".38"/><path d="M380 310v297l315-93V210Z" fill="#f8eddb" opacity=".45"/></>}
      <path d="M65 515L380 610 695 515 380 421Z" fill="url(#hw-floor)" stroke="#634a40" strokeWidth="7"/>
      <path d="M380 421v186M66 514l314-93 314 93" fill="none" stroke="#d9b58a" strokeWidth="2" opacity=".45"/>
      <g clipPath="url(#hw-window)"><rect x="287" y="108" width="185" height="203" fill="url(#hw-sky)"/>
        <circle cx="413" cy="158" r="35" fill="#fff4d8" opacity=".15"/>
        <circle cx="413" cy="158" r="21" fill="#fff1d4"/><circle cx={413 + (moon.waxing ? -12 : 12)} cy="151" r="20" fill={evening ? "#484058" : "#dce2e0"} opacity={moon.illumination < 92 ? ".95" : "0"}/>
        <path d="M285 281Q330 228 364 276T467 267v60H285Z" fill="#7c9985"/><path d="M287 295Q348 259 399 299T473 281v45H287Z" fill="#5b806e"/></g>
      <rect x="287" y="108" width="185" height="203" rx={world === "folio" ? 80 : 22} fill="none" stroke="#634c49" strokeWidth="10"/>
      <path d="M379 110v201M288 207h185" stroke="#9a7461" strokeWidth="7"/>
      <path className="hw-curtain" d="M287 112Q315 115 332 131Q318 211 293 299L287 300Z M472 112Q442 116 426 130Q442 230 468 298L472 299Z" fill={world === "glasshouse" ? "#e9eee7" : "#aa94b1"} opacity=".72"/>
      <path d="M468 244Q541 167 589 206Q622 239 605 332" fill="none" stroke="#668471" strokeWidth="10" strokeLinecap="round"/>
      {[[489,218,-22],[530,195,17],[574,207,-20],[603,247,18],[601,292,-24]].map(([x,y,r],i)=><g key={i} transform={`translate(${x} ${y}) rotate(${r})`}><path d="M0 0Q-17-27-25-3Q-13 15 0 0Z" fill="#749177"/><path d="M0 0Q19-22 25-1Q15 16 0 0Z" fill="#8ca588"/></g>)}
      <g className="hw-flowers" transform="translate(595 248)"><path d="M0 0Q-33-18-25-62" fill="none" stroke="#638373" strokeWidth="5"/>{[0,72,144,216,288].map((deg)=><ellipse key={deg} cx="0" cy="-20" rx="11" ry="22" transform={`rotate(${deg})`} fill={flower === "amber" ? "#e3b98b" : "#9b85ae"} opacity=".92"/>)}<circle r="12" fill="#e9c784"/></g>
      <g transform="translate(170 335)"><path d="M-67-75v148l84 26V-50Z" fill="#493b40"/><path d="M-60-66l66 20v125l-66-20Z" fill="#8e6757"/><path d="M-49-55v103m17-98v104m18-98v104" stroke="#4a3a3a" strokeWidth="4"/><path d="M-62 9l72 21m-72 5 72 21" stroke="#4a3a3a" strokeWidth="4"/>
        {[-44,-29,-14].map((x,i)=><rect key={i} x={x} y={-38+i*2} width="10" height="42" fill={["#c9a280","#8d879e","#d6bf8a"][i]}/>)}</g>
      <image href={`/images/house-world/${world}-v2.webp`} x="0" y="0" width="760" height="650" preserveAspectRatio="xMidYMid slice"/>
      <image className="hw-sprite-flower" href="/images/house-world/flower-v1.webp" x="629" y="310" width="63" height="77" opacity=".54" style={{ filter: flower === "amber" ? "sepia(.85) saturate(1.8) hue-rotate(-20deg)" : "none" }}/>
      <g className="hw-vector-seat" transform={`translate(${seat === "window" ? 490 : 506} ${seat === "window" ? 390 : 424})`}><ellipse cy="88" rx="78" ry="22" fill="#352b30" opacity=".24"/><path d="M-51 34Q-77-29-43-56Q3-78 52-44Q76-16 56 38Z" fill={world === "glasshouse" ? "#718b80" : "#6d5363"} stroke="#483941" strokeWidth="7"/><path d="M-55 26Q0 0 57 27l-9 31q-47 18-88-1Z" fill="#8c7283"/><path d="M-39 56l-11 41m86-40 13 41" stroke="#554047" strokeWidth="10" strokeLinecap="round"/><path d="M-48 23Q0-1 49 19" fill="none" stroke="#baa2a3" strokeWidth="4"/></g>
      <g className="hw-vector-table" transform="translate(274 435)"><ellipse cy="46" rx="94" ry="18" fill="#2b222b" opacity=".18"/><path d="M-58-16l63-21 65 17-62 22Z" fill="#ab866b" stroke="#5e473c" strokeWidth="5"/><path d="M-53-10v45m115-50v52" stroke="#604a40" strokeWidth="8"/><path d="M-13-30q14-12 27 0l13 10q-19-6-33 2l-12-1Z" fill="#f8efdb" stroke="#a58169" strokeWidth="2"/><path d="M-18-19q-17-3-28 4l28-15Z" fill="#f8efdb" stroke="#a58169" strokeWidth="2"/></g>
      <g className="hw-vector-table" transform="translate(143 458)"><path d="M0 27q-18-47-2-64m0 64q16-43 37-45M0 21q-41-25-43-47" fill="none" stroke="#577464" strokeWidth="7"/><path d="M-2-30q-22-22-27 3q9 13 27-3Zm39 12q0-21 25-22q-2 20-25 22Zm-68-8q-15-18-28-9q0 22 28 9Z" fill="#839b7c"/><path d="M-27 28h60l-9 36h-40Z" fill="#9a665f"/></g>
      <g className="hw-jess hw-vector-jess" transform="translate(355 391)"><ellipse cy="98" rx="27" ry="9" fill="#402e2c" opacity=".25"/><path d="M-20 44l-13 54m32-53 16 53" stroke="#463741" strokeWidth="12" strokeLinecap="round"/><path d="M-27-22q27-22 51 1l5 66h-62Z" fill="#7f5f70"/><path d="M-29-11l-24 39m74-37 28 30" stroke="#8f6c73" strokeWidth="10" strokeLinecap="round"/><ellipse cy="-54" rx="24" ry="30" fill="#b98168"/><path d="M-24-62Q-20-93 6-86Q37-81 25-36Q22-65 10-67Q-4-62-24-62Z" fill="#352b35"/><path d="M-27-58Q-38-28-27-19" stroke="#352b35" strokeWidth="12" strokeLinecap="round"/><circle cx="8" cy="-52" r="2" fill="#33262b"/></g>
      <g className="hw-vector-pet" transform="translate(436 506)"><PetPortrait kind={pet}/></g>
      <>
        <image className="hw-sprite hw-sprite-chair" href="/images/house-world/chair-v1.webp" x={seat === "window" ? 474 : 505} y={seat === "window" ? 310 : 363} width="162" height="171" preserveAspectRatio="xMidYMid meet"/>
        <image className="hw-sprite hw-sprite-jess" href="/images/house-world/jess-v1.webp" x="288" y="286" width="105" height="190" preserveAspectRatio="xMidYMid meet"/>
        <image className="hw-sprite hw-sprite-pet" href={`/images/house-world/${pet}-v1.webp`} x={pet === "bird" ? 466 : 424} y={pet === "bird" ? 324 : 458} width={pet === "bird" ? 68 : 85} height={pet === "bird" ? 85 : 95} preserveAspectRatio="xMidYMid meet"/>
      </>
      <path className="hw-vector-table" d="M75 515Q45 455 60 404M85 503Q115 460 111 417" fill="none" stroke="#6e8d71" strokeWidth="6"/>
      <path className="hw-vector-table" d="M57 448Q35 425 24 445q4 19 33 3Zm55 2q24-21 37-2q-7 21-37 2Z" fill="#8da78b"/>
      {world === "folio" && <path d="M63 527Q388 568 699 527" fill="none" stroke="#b79776" strokeWidth="3" strokeDasharray="7 8"/>}
    </svg>
    <button className="hw-hotspot hw-hotspot-window" onClick={() => onObject("sky")} aria-label="Open the sky" title="The sky"><Sun size={19}/><span>Sky</span></button>
    <button className="hw-hotspot hw-hotspot-book" onClick={() => onObject("book")} aria-label="Open Read" title="Read"><BookOpen size={19}/><span>Read</span></button>
    <button className="hw-hotspot hw-hotspot-jess" onClick={() => onObject("jess")} aria-label="Talk to Jess" title="Jess"><span className="hw-spark">✦</span><span>Jess</span></button>
    <button className="hw-hotspot hw-hotspot-pet" onClick={() => onObject("pet")} aria-label={`Meet your ${pet}`} title="Pet"><span className="hw-paw">✽</span><span>Pet</span></button>
    <button className="hw-hotspot hw-hotspot-garden" onClick={() => onObject("garden")} aria-label="Open your garden" title="Garden"><Flower2 size={19}/><span>Garden</span></button>
  </div>;
}

const OBJECTS = {
  sky: { title: "The sky outside", body: "The Moon changes for real. This window is artwork; your full Sky room has the reading.", label: "Open Sky", route: "/Lifestyle?section=sky" },
  book: { title: "A book on the table", body: "The proper reading lives in Read. This preview won't invent a book you haven't saved.", label: "Open Read", route: "/Lifestyle?section=read" },
  jess: { title: "Jess is home", body: "Jess can help with the real app. For now, this tiny room gives her an authored moment, not a made-up memory.", label: "Open Jess", route: "/Jess" },
  garden: { title: "Out through the garden", body: "Your existing garden, named bloom and chapters are still yours. The little window is a doorway to the real thing.", label: "Open Garden", route: "/Garden" },
  pet: { title: "Your pet", body: "An excellent housemate. No feeding debt, no sad face when you've been away.", label: null, route: null },
};

export default function HouseWorldDemo() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(saved);
  const [mode, setMode] = useState("live");
  const [selected, setSelected] = useState(null);
  const [prior, setPrior] = useState(null);
  const [quiet, setQuiet] = useState(() => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const moon = useMemo(() => getMoonPhase(new Date()), []);
  const pet = PETS.find(p => p.id === draft.pet);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const setChoice = (key, value) => { setPrior(draft); setDraft(current => ({ ...current, [key]: value })); };
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); } catch { /* preview still works */ } setSaved(draft); setMode("live"); setSelected(null); };
  const leaveBuild = () => { setDraft(saved); setMode("live"); setSelected(null); };
  const openObject = (object) => { setSelected(object); setMode("live"); };
  const returnToApp = () => navigate("/Today");
  return <main className="hw-page">
    <div className="hw-masthead"><button className="hw-back" onClick={returnToApp} aria-label="Back to Today"><ArrowLeft size={18}/> Today</button><span>FEMWELL / IDEAS · DEV</span><button className="hw-close" onClick={() => navigate("/Ideas")}>Ideas <ArrowRight size={15}/></button></div>
    <div className="hw-intro"><p className="hw-kicker">A little world to try</p><h1>The house is <em>yours.</em></h1><p>Jess is inside. Someone has stolen the good chair. The garden, naturally, has opinions.</p></div>
    <div className="hw-viewbar" role="tablist" aria-label="House art direction">{WORLDS.map(w => <button role="tab" aria-selected={draft.world === w.id} key={w.id} onClick={() => setChoice("world", w.id)}>{w.label}</button>)}</div>
    <div className="hw-scene-wrap"><HouseIllustration world={draft.world} pet={draft.pet} seat={draft.seat} flower={draft.flower} moon={moon} onObject={openObject} reducedMotion={quiet}/><div className="hw-scene-caption"><span>{WORLDS.find(w => w.id === draft.world).note}</span><span>Moon: {moon.name.toLowerCase()} · {moon.illumination}% lit</span></div></div>
    <div className="hw-actionbar"><button className={mode === "live" ? "active" : ""} onClick={leaveBuild}>Explore</button><button className={mode === "build" ? "active" : ""} onClick={() => { setMode("build"); setSelected(null); }}>Make it yours</button><button className="hw-quiet" onClick={() => setQuiet(v => !v)} aria-pressed={quiet}>{quiet ? "Motion off" : "Motion on"}</button></div>
    {mode === "build" ? <section className="hw-panel" aria-label="Make the house yours"><div className="hw-panel-heading"><div><p className="hw-kicker">Build / first room</p><h2>A little change goes a long way.</h2></div><button className="hw-panel-x" onClick={leaveBuild} aria-label="Close build mode"><X size={19}/></button></div>
      <div className="hw-control"><h3>Choose a housemate</h3><div className="hw-choice-row">{PETS.map(({ id, label, Icon }) => <button key={id} className={draft.pet === id ? "chosen" : ""} onClick={() => setChoice("pet", id)} aria-pressed={draft.pet === id}><Icon size={21}/>{label}</button>)}</div></div>
      <div className="hw-control"><h3>Where does the chair go?</h3><div className="hw-choice-row"><button className={draft.seat === "books" ? "chosen" : ""} onClick={() => setChoice("seat", "books")} aria-pressed={draft.seat === "books"}>By the books</button><button className={draft.seat === "window" ? "chosen" : ""} onClick={() => setChoice("seat", "window")} aria-pressed={draft.seat === "window"}>At the window</button></div></div>
      <div className="hw-control"><h3>What is climbing in?</h3><div className="hw-choice-row"><button className={draft.flower === "violet" ? "chosen" : ""} onClick={() => setChoice("flower", "violet")} aria-pressed={draft.flower === "violet"}>Violet morning glory</button><button className={draft.flower === "amber" ? "chosen" : ""} onClick={() => setChoice("flower", "amber")} aria-pressed={draft.flower === "amber"}>Amber bloom</button></div></div>
      <div className="hw-build-footer"><button onClick={() => { if (prior) { setDraft(prior); setPrior(null); } }} disabled={!prior}><RotateCcw size={16}/> Undo</button><button className="hw-save" onClick={save}>{dirty ? "Keep this room" : "Close build mode"}</button></div><p className="hw-note">This preview stays on this device. A proper cross-device house needs a separate build.</p>
    </section> : <section className="hw-panel hw-live-panel"><p className="hw-kicker">Inside today</p><h2>{selected ? OBJECTS[selected].title : pet.line}</h2><p>{selected ? OBJECTS[selected].body : "Tap the book, window, garden, Jess or pet in the room. Each has somewhere real to go."}</p><div className="hw-panel-actions">{selected && OBJECTS[selected].route && <button className="hw-save" onClick={() => navigate(OBJECTS[selected].route)}>{OBJECTS[selected].label} <ArrowRight size={16}/></button>}<button onClick={() => selected ? setSelected(null) : setMode("build")}>{selected ? "Back to the room" : "Change the room"}</button></div></section>}
    <nav className="hw-direct" aria-label="Direct app routes"><span>Go straight there</span><button onClick={() => navigate("/Lifestyle?section=read")}><BookOpen size={17}/> Read</button><button onClick={() => navigate("/Lifestyle?section=sky")}><Sun size={17}/> Sky</button><button onClick={() => navigate("/Lifestyle?section=listen")}><Volume2 size={17}/> Listen</button><button onClick={() => navigate("/Planner")}><CalendarDays size={17}/> Planner</button></nav>
    <p className="hw-disclaimer">A small Ideas test, with local choices and drawn characters. Your existing app is still there; this room has not replaced it.</p>
  </main>;
}

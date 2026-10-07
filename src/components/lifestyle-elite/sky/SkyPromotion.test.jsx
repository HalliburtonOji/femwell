import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const data = vi.hoisted(() => ({state:null,selected:vi.fn(),filter:vi.fn(async()=>[]),create:vi.fn(),update:vi.fn(),invoke:vi.fn(),refresh:vi.fn(),progress:vi.fn()}));
vi.mock("./useSelectedSkyChart",()=>({default:(...args)=>{data.selected(...args);return data.state;}}));
vi.mock("./useSkyCompletion",()=>({default:()=>({letter:null,unlocked:false,rw:null,loading:false,letterError:"",cycleError:"",retry:vi.fn()})}));
vi.mock("@/components/horoscope/hooks/useBirthChart",()=>({useBirthChart:()=>data.state}));
vi.mock("@/components/horoscope/hooks/useProfections",()=>({default:()=>({profection:null,saturn:null})}));
vi.mock("@/components/horoscope/hooks/useAsteroids",()=>({default:()=>({ceres:"Virgo"})}));
vi.mock("@/components/community/readingActivity",()=>({recordProgress:data.progress,hasReadLocally:()=>false}));
vi.mock("@/api/base44Client",()=>({base44:{auth:{me:vi.fn(async()=>({id:"a"}))},entities:new Proxy({},{get:()=>({filter:data.filter,create:data.create,update:data.update,subscribe:()=>()=>{}})}),functions:{invoke:data.invoke}}}));
import SkyFocus from "../SkyFocus";

const props={artDirection:"sky-worlds",direction:"petal-press",continuous:true,celestial:true,dailyLessons:true,contentRoute:"/Lifestyle"};
const oldReading={id:"older-reading",user_id:"a",reading_date:"2026-09-04",headline:"A little space for a new idea.",narrative:"The first thought stays with its own day.\n\nThe second paragraph is still part of that reading.",power_title:"Your opening",power_body:"A complete old power paragraph.",triad_sun_desc:"The full Sun reading from that date."};
function roomState(){return {user:{id:"a"},astro:{id:"chart-a",user_id:"a",birth_date:"1997-06-17",sun_sign:"Gemini",moon_sign:"Libra",rising_sign:"Virgo"},reading:oldReading,userProfile:{user_id:"a"},loading:false,generatingReading:false,refreshing:false,checkedDay:"2026-10-07",exactReading:true,requestedReadingId:"older-reading",error:"",newDay:null,setAstro:vi.fn(),refresh:data.refresh};}

beforeEach(()=>{vi.clearAllMocks();data.state=roomState();window.history.replaceState({},"","/Lifestyle?section=sky&reading=older-reading#today");Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:vi.fn()});});
afterEach(()=>{expect(data.create).not.toHaveBeenCalled();expect(data.update).not.toHaveBeenCalled();expect(data.invoke).not.toHaveBeenCalled();expect(data.progress).not.toHaveBeenCalled();vi.restoreAllMocks();delete HTMLElement.prototype.scrollIntoView;});

describe("promoted Sky exact source and public returns",()=>{
  it("opens the full dated reading beside explicitly current Sky tools and returns directly to today's main Sky",async()=>{
    render(<SkyFocus {...props}/>);
    expect(data.selected).toHaveBeenCalledWith(undefined,"older-reading",true);
    expect(screen.getByText("The second paragraph is still part of that reading.")).toBeVisible();
    expect(screen.getByText("A complete old power paragraph.")).toBeVisible();
    expect(screen.getByRole("button",{name:"Share your sky reading from 4 Sept 2026"})).toBeEnabled();
    expect(screen.getByText(/Saved reading · 4 Sept 2026. Moon facts, lessons and your chart are current/)).toBeVisible();
    expect(screen.getByRole("link",{name:"Open today’s sky"})).toHaveAttribute("href","/Lifestyle?section=sky");
    ["Sun, moon & rising","Your goddess bench","Your two tides","The house your year is in","What’s on your mind?","You two, under the stars.","How much you want to hear"].forEach(text=>expect(screen.getByText(text)).toBeVisible());
    const link=screen.getByRole("link",{name:"Take this lesson to the lounge"});
    const seed=new URL(link.href).searchParams.get("seed");expect(seed).toContain("https://femwells.com/Lifestyle?");expect(seed).toContain("lessonVersion=1");expect(seed).not.toContain("SkyWorldsDemo");
    await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
  it("keeps an owned historical reading readable when her current natal chart is absent",async()=>{
    data.state={...roomState(),astro:null};render(<SkyFocus {...props}/>);
    expect(screen.getByText("The second paragraph is still part of that reading.")).toBeVisible();
    expect(screen.queryByText("Your sky starts with a birthday.")).toBeNull();
    expect(screen.getByRole("button",{name:"Share your sky reading from 4 Sept 2026"})).toBeEnabled();
    await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
  it("keeps an unavailable exact reading recoverable without sharing or marking an invented replacement",async()=>{
    data.state={...roomState(),reading:null,error:"That saved reading isn’t available in your account. Try again, or open today’s sky."};render(<SkyFocus {...props}/>);
    expect(screen.getByRole("alert")).toHaveTextContent("That saved reading isn’t available in your account");
    expect(screen.getByRole("heading",{name:"This reading isn’t here."})).toBeVisible();
    ["Share today's sky","Reflect","Lounge","Ask Jess","Mark read"].forEach(name=>expect(screen.getByRole("button",{name,exact:true})).toBeDisabled());
    fireEvent.click(screen.getByRole("button",{name:"Try again"}));expect(data.refresh).toHaveBeenCalledOnce();
    expect(screen.getByRole("button",{name:"Next sky lesson"})).toBeEnabled();
    expect(screen.getByRole("textbox",{name:"Your question for the sky"})).toBeEnabled();
    expect(screen.getByRole("link",{name:"Open today’s sky"})).toHaveAttribute("href","/Lifestyle?section=sky");
    await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
  it("preserves an explicit founder-demo lesson return instead of silently rewriting it to main",async()=>{
    window.history.replaceState({},"","/SkyWorldsDemo?direction=petal-press&section=sky");data.state={...roomState(),exactReading:false,requestedReadingId:null};
    render(<SkyFocus {...props} contentRoute="/SkyWorldsDemo"/>);
    expect(data.selected).toHaveBeenCalledWith(undefined,null,false);
    const seed=new URL(screen.getByRole("link",{name:"Take this lesson to the lounge"}).href).searchParams.get("seed");
    expect(seed).toContain("https://femwells.com/SkyWorldsDemo?");expect(seed).not.toContain("https://femwells.com/Lifestyle?");
    await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
  it.each([true,false])("opens the actual diary directly when a current chart exists: %s",async(hasChart)=>{
    data.state={...roomState(),astro:hasChart ? roomState().astro : null,reading:null,exactReading:false};
    const handled=vi.fn();render(<SkyFocus {...props} actionRequest={{type:"diary"}} onActionHandled={handled}/>);
    const diary=document.getElementById("sky-observed-diary");expect(diary).toHaveFocus();
    expect(diary.scrollIntoView).toHaveBeenCalledWith({block:"start",behavior:"auto"});
    expect(handled).toHaveBeenCalledWith(null);expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
  it("reads an available historical source directly even without a current chart",async()=>{
    data.state={...roomState(),astro:null};render(<SkyFocus {...props} actionRequest={{type:"reading"}}/>);
    const reading=screen.getByText("The second paragraph is still part of that reading.").closest("section");expect(reading).toHaveFocus();
    expect(screen.queryByRole("dialog")).toBeNull();await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
  it("does not enable the main fallback merely because a founder preview receives a main content route",async()=>{
    window.history.replaceState({},"","/SkyWorldsDemo?section=sky");data.state={...roomState(),exactReading:false,requestedReadingId:null};render(<SkyFocus {...props}/>);
    expect(data.selected).toHaveBeenCalledWith(undefined,null,false);await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
  it("preserves the actual main alias fallback while public lessons retain the canonical Lifestyle return",async()=>{
    window.history.replaceState({},"","/LifestyleElite?section=sky");data.state={...roomState(),exactReading:false,requestedReadingId:null};render(<SkyFocus {...props}/>);
    expect(data.selected).toHaveBeenCalledWith(undefined,null,true);
    const seed=new URL(screen.getByRole("link",{name:"Take this lesson to the lounge"}).href).searchParams.get("seed");expect(seed).toContain("https://femwells.com/Lifestyle?");expect(seed).not.toContain("LifestyleElite?");
    await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
  it("updates its shared reading only after generation has settled with an actual owned identity",async()=>{
    const accept=vi.fn();data.state={...roomState(),generatingReading:true};const {rerender}=render(<SkyFocus {...props} onReadingState={accept}/>);
    expect(accept).not.toHaveBeenCalled();
    const produced={...oldReading,id:"produced-reading",reading_date:"2026-10-07",headline:"A grounded day for a new idea."};data.state={...roomState(),reading:produced,generatingReading:false};
    rerender(<SkyFocus {...props} onReadingState={accept}/>);expect(accept).toHaveBeenCalledExactlyOnceWith(produced,"a");
    await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
  it.each([null,{...oldReading,user_id:"b"},{...oldReading,id:""},{...oldReading,reading_date:"2026-02-30"}])("does not publish an unavailable or invalid owned reading to the shared summary: %j",async reading=>{
    const accept=vi.fn();data.state={...roomState(),reading};render(<SkyFocus {...props} onReadingState={accept}/>);expect(accept).not.toHaveBeenCalled();await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
  it("keeps the former edition out of the shared callback while a new read is still pending",async()=>{
    const accept=vi.fn();data.state={...roomState(),refreshing:true};const {rerender}=render(<SkyFocus {...props} onReadingState={accept}/>);expect(accept).not.toHaveBeenCalled();
    data.state={...roomState(),refreshing:false};rerender(<SkyFocus {...props} onReadingState={accept}/>);expect(accept).toHaveBeenCalledExactlyOnceWith(oldReading,"a");await waitFor(()=>expect(data.filter).toHaveBeenCalled());
  });
});

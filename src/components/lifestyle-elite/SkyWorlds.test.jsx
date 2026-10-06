import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import SkyWorldHeader from "./SkyWorldHeader";
import { DEFAULT_SKY_WORLD, SKY_WORLDS, getSkyWorld } from "./skyWorlds";

const directions = ["conservatory", "press", "petal", "workbench", "light"];
const active = {id:"sky",label:"Sky",title:"The sky around you"};
const quarter = {name:"First quarter",position:.25,illumination:50};
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();});

describe("Five Sky world selection",()=>{
  it("offers exactly the five review worlds with one documented default",()=>{
    expect(SKY_WORLDS.map(world=>world.id)).toEqual(directions);
    expect(new Set(SKY_WORLDS.map(world=>world.id)).size).toBe(5);
    expect(DEFAULT_SKY_WORLD).toBe("workbench");
  });
  it.each(directions)("selects %s from the direct preview URL",direction=>{
    const params=new URL(`https://femwells.com/SkyWorldsDemo?direction=${direction}&section=sky`).searchParams;
    const world=getSkyWorld(params.get("direction"));
    const {container}=render(<SkyWorldHeader active={active} moon={quarter} direction={world.id}/>);
    expect(container.querySelector("header")).toHaveAttribute("data-header-world",direction);
    expect(screen.getByRole("heading",{name:active.title,level:1})).toBeVisible();
    expect(screen.getByText("Morning glory",{exact:true})).toBeVisible();
    expect(screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"})).toBeVisible();
  });
  it.each(["",null,"unknown","LIGHT","../press","https://example.com"])("uses the actual default for invalid URL direction %s",direction=>{
    const params=new URLSearchParams(direction===null ? "section=sky" : `direction=${encodeURIComponent(direction)}`);
    expect(getSkyWorld(params.get("direction")).id).toBe("workbench");
  });
  it("selects the approved combination without replacing or adding to the five review candidates",()=>{
    const params=new URL("https://femwells.com/SkyWorldsDemo?direction=petal-press&section=sky").searchParams;
    expect(getSkyWorld(params.get("direction")).id).toBe("petal-press");
    expect(SKY_WORLDS.map(world=>world.id)).toEqual(directions);
    expect(getSkyWorld("petal-press-unknown").id).toBe(DEFAULT_SKY_WORLD);
  });
});

describe("Selected Petal × Star Press section identity",()=>{
  const sections=[
    {id:"read",label:"Read",title:"The article you chose",flower:"Iris",note:"the courage to begin a page"},
    {id:"listen",label:"Listen",title:"Your afternoon soundtrack",flower:"Bluebell",note:"constancy — a sound that keeps"},
    {id:"books",label:"Books",title:"A chapter with your name",flower:"Jasmine",note:"devoted — the story that keeps"},
    {id:"sky",label:"Sky",title:"The sky around you",flower:"Morning glory",note:"the day's turning — the sky's flower"},
    {id:"good",label:"Good life",title:"Your small good things",flower:"Marigold",note:"warmth — the small joy"},
    {id:"yours",label:"Yours",title:"The things you kept",flower:"Forget-me-not",note:"what she keeps"},
  ];
  it.each(sections)("preserves $label's actual title, date, floral language and heart",section=>{
    const {container}=render(<SkyWorldHeader active={section} moon={quarter} direction="petal-press"/>);
    const heading=screen.getByRole("heading",{name:section.title,level:1});
    expect(heading).toBeVisible();
    expect(heading.querySelectorAll("svg")).toHaveLength(1);
    expect(screen.getByText(`Lifestyle / ${section.label}`,{exact:true})).toBeVisible();
    expect(screen.getByText(section.flower,{exact:true})).toBeVisible();
    expect(screen.getByText(section.note,{exact:true})).toBeVisible();
    expect(container.querySelector("time")).toHaveTextContent(new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long"}));
    if(section.id==="sky") expect(screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"})).toBeVisible();
  });
  it("keeps the approved Books room when entering Books from the selected direction",()=>{
    const {container,rerender}=render(<SkyWorldHeader active={active} moon={quarter} direction="petal-press"/>);
    rerender(<SkyWorldHeader active={sections[2]} moon={quarter} direction="petal-press"/>);
    expect(container.querySelector(".fw-room-table img")).toHaveAttribute("src","/images/reading-room/table-v3.webp");
    expect(screen.getByRole("heading",{name:sections[2].title,level:1})).toBeVisible();
    expect(screen.getByText("Jasmine",{exact:true})).toBeVisible();
    expect(screen.queryByRole("img",{name:/First quarter/})).not.toBeInTheDocument();
  });
  it("clears failed Sky artwork on a section change and keeps live Moon data when returning",()=>{
    const {container,rerender}=render(<SkyWorldHeader active={active} moon={quarter} direction="petal-press"/>);
    fireEvent.error(container.querySelector("img.fw-selected-art"));
    expect(screen.getByRole("button",{name:"Reload garden artwork"})).toBeVisible();
    rerender(<SkyWorldHeader active={sections[1]} moon={quarter} direction="petal-press"/>);
    expect(container.querySelector("img.fw-selected-art")).toHaveAttribute("src","/images/selected-lifestyle/listen-v1.webp");
    expect(screen.queryByRole("button",{name:"Reload garden artwork"})).not.toBeInTheDocument();
    expect(screen.queryByRole("img",{name:/First quarter/})).not.toBeInTheDocument();
    expect(screen.getByRole("heading",{name:sections[1].title})).toBeVisible();
    rerender(<SkyWorldHeader active={active} moon={{name:"Full moon",position:.5,illumination:100}} direction="petal-press"/>);
    expect(container.querySelector("img.fw-selected-art")).toHaveAttribute("src",getSkyWorld("petal-press").asset);
    expect(screen.getByRole("img",{name:"Full moon, approximately 100% illuminated"})).toBeVisible();
    expect(screen.getByText("Morning glory",{exact:true})).toBeVisible();
  });
});

describe("Sky worlds identity, recovery and controlled motion",()=>{
  it.each([...directions,"petal-press"])("retains the %s identity and measured Moon through artwork failure and retry",direction=>{
    const world=getSkyWorld(direction);
    const {container,rerender}=render(<SkyWorldHeader active={active} moon={quarter} direction={direction}/>);
    const art=()=>container.querySelector("img.fw-world-art, img.fw-selected-art");
    const moon=screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"}).innerHTML;
    fireEvent.error(art());
    expect(art()).toBeNull();
    expect(container.querySelector(".fw-world-bloom-fallback svg, .fw-selected-bloom-fallback svg")).not.toBeNull();
    expect(screen.getByRole("heading",{name:active.title,level:1})).toBeVisible();
    expect(screen.getByText("Morning glory",{exact:true})).toBeVisible();
    expect(screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"}).innerHTML).toBe(moon);
    fireEvent.click(screen.getByRole("button",{name:"Reload garden artwork"}));
    expect(art()).toHaveAttribute("src",`${world.asset}?retry=1`);
    expect(screen.queryByRole("button",{name:"Reload garden artwork"})).not.toBeInTheDocument();
    const artwork=art();
    rerender(<SkyWorldHeader active={active} moon={{name:"Full moon",position:.5,illumination:100}} direction={direction}/>);
    expect(art()).toBe(artwork);
    expect(screen.queryByRole("img",{name:/First quarter/})).not.toBeInTheDocument();
    expect(screen.getByRole("img",{name:"Full moon, approximately 100% illuminated"})).toBeVisible();
  });
  it.each(["workbench","petal-press"])("stops and replays %s's finite movement without changing Moon data, and clears its timer on unmount",direction=>{
    vi.useFakeTimers();
    const {container,unmount}=render(<SkyWorldHeader active={active} moon={quarter} direction={direction}/>);
    const moon=screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"}).innerHTML;
    const still=screen.getByRole("button",{name:"Still the garden"});still.focus();fireEvent.click(still);
    expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
    const replay=screen.getByRole("button",{name:"Replay garden movement"});expect(replay).toHaveFocus();
    fireEvent.click(replay);act(()=>vi.advanceTimersByTime(4199));
    expect(screen.getByRole("button",{name:"Still the garden"})).toHaveFocus();
    expect(container.querySelector("header")).toHaveAttribute("data-moving","true");
    act(()=>vi.advanceTimersByTime(1));
    expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
    expect(screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"}).innerHTML).toBe(moon);
    fireEvent.click(screen.getByRole("button",{name:"Replay garden movement"}));
    unmount();expect(vi.getTimerCount()).toBe(0);
  });
  it.each(["petal","petal-press"])("responds to a changed reduced-motion preference in %s and removes its listener",direction=>{
    vi.useFakeTimers();
    const listeners=new Set();
    const changed=()=>listeners.forEach(listener=>listener());
    const preference={matches:false,addEventListener:vi.fn((type,listener)=>{listeners.add(listener);}),removeEventListener:vi.fn((type,listener)=>{listeners.delete(listener);})};
    vi.spyOn(window,"matchMedia").mockReturnValue(preference);
    const {container,unmount}=render(<SkyWorldHeader active={active} moon={quarter} direction={direction}/>);
    expect(screen.getByRole("button",{name:"Still the garden"})).toBeVisible();
    act(()=>{preference.matches=true;changed();});
    expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
    expect(screen.queryByRole("button",{name:/Still the garden|Replay garden movement/})).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"})).toBeVisible();
    act(()=>{preference.matches=false;changed();});
    expect(screen.getByRole("button",{name:"Replay garden movement"})).toBeVisible();
    expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
    unmount();expect(listeners.size).toBe(0);expect(preference.removeEventListener).toHaveBeenCalled();
  });
  it.each(["light","petal-press"])("starts %s static when reduced motion is already requested",direction=>{
    vi.spyOn(window,"matchMedia").mockReturnValue({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()});
    const {container}=render(<SkyWorldHeader active={active} moon={quarter} direction={direction}/>);
    expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
    expect(screen.queryByRole("button",{name:/Still the garden|Replay garden movement/})).not.toBeInTheDocument();
    expect(screen.getByRole("heading",{name:active.title})).toBeVisible();
  });
});

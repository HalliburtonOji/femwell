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
});

describe("Sky worlds identity, recovery and controlled motion",()=>{
  it.each(directions)("retains the %s identity and measured Moon through artwork failure and retry",direction=>{
    const world=getSkyWorld(direction);
    const {container,rerender}=render(<SkyWorldHeader active={active} moon={quarter} direction={direction}/>);
    const art=()=>container.querySelector("img.fw-world-art");
    const moon=screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"}).innerHTML;
    fireEvent.error(art());
    expect(art()).toBeNull();
    expect(container.querySelector(".fw-world-bloom-fallback svg")).not.toBeNull();
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
  it("stops and replays one finite movement without changing Moon data, and clears its timer on unmount",()=>{
    vi.useFakeTimers();
    const {container,unmount}=render(<SkyWorldHeader active={active} moon={quarter} direction="workbench"/>);
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
  it("responds to a changed reduced-motion preference and removes its listener",()=>{
    vi.useFakeTimers();
    let changed;
    const preference={matches:false,addEventListener:vi.fn((type,listener)=>{changed=listener;}),removeEventListener:vi.fn()};
    vi.spyOn(window,"matchMedia").mockReturnValue(preference);
    const {container,unmount}=render(<SkyWorldHeader active={active} moon={quarter} direction="petal"/>);
    expect(screen.getByRole("button",{name:"Still the garden"})).toBeVisible();
    act(()=>{preference.matches=true;changed();});
    expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
    expect(screen.queryByRole("button",{name:/Still the garden|Replay garden movement/})).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByRole("img",{name:"First quarter, approximately 50% illuminated"})).toBeVisible();
    act(()=>{preference.matches=false;changed();});
    expect(screen.getByRole("button",{name:"Replay garden movement"})).toBeVisible();
    expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
    unmount();expect(preference.removeEventListener).toHaveBeenCalledWith("change",changed);
  });
  it("starts static when reduced motion is already requested",()=>{
    vi.spyOn(window,"matchMedia").mockReturnValue({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()});
    const {container}=render(<SkyWorldHeader active={active} moon={quarter} direction="light"/>);
    expect(container.querySelector("header")).toHaveAttribute("data-moving","false");
    expect(screen.queryByRole("button",{name:/Still the garden|Replay garden movement/})).not.toBeInTheDocument();
    expect(screen.getByRole("heading",{name:active.title})).toBeVisible();
  });
});

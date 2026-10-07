import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Saved, { mergeSavedCollections, savedReturnRoute } from "./Saved";
import SavedItemCard from "@/components/saved/SavedItemCard";

const mock=vi.hoisted(()=>({me:vi.fn(),saved:vi.fn(),profiles:vi.fn(),lifestyle:vi.fn(),remove:vi.fn(),update:vi.fn()}));
vi.mock("@/api/base44Client",()=>({base44:{auth:{me:mock.me},entities:{SavedItems:{filter:mock.saved,delete:mock.remove},UserProfile:{filter:mock.profiles,update:mock.update},LifestyleItems:{filter:mock.lifestyle}}}}));
const row=(id="record",itemId="find")=>({id,user_id:"owner",item_type:"LIFESTYLE",item_id:itemId,title:"An actual keep",meta_json:JSON.stringify({route:`/LifestyleDetail?id=${itemId}`})});
const profile={id:"profile",user_id:"owner",saved_item_ids:["find"]};
beforeEach(()=>{vi.resetAllMocks();window.history.replaceState({},"","/Saved?tab=LIFESTYLE");mock.me.mockResolvedValue({id:"owner"});mock.saved.mockResolvedValue([]);mock.profiles.mockResolvedValue([]);mock.lifestyle.mockImplementation(async({id})=>[{id,title:`Find ${id}`,content_type:"ARTICLE"}]);mock.remove.mockResolvedValue();mock.update.mockResolvedValue({});});

describe("Saved identity and truthful exact returns",()=>{
  it("reconciles both stores once while retaining every physical record for removal",()=>{
    const records=[row("first"),row("second"),{...row("other-type"),item_type:"CONTENT"}];
    const merged=mergeSavedCollections(records,profile,new Map([["find",{item:{id:"find",title:"The exact article",summary:"<p>Real text.</p>"}}]]));
    expect(merged).toHaveLength(2);
    const keep=merged.find(item=>item.item_type==="LIFESTYLE");
    expect(keep._savedRecords.map(item=>item.id)).toEqual(["first","second"]);expect(keep._profileId).toBe("profile");
    expect(keep._savedRecords[0].meta_json).toBe(records[0].meta_json);
    expect(keep.title).toBe("The exact article");expect(keep.preview_text).toBe("Real text.");expect(keep._href).toBe("/LifestyleDetail?id=find");
  });
  it.each(["record","profile"])("keeps a deleted %s-origin find visible without a stale destination",origin=>{
    const merged=mergeSavedCollections(origin==="record" ? [row()] : [],origin==="profile" ? profile : null,new Map([["find",{item:null}]]));
    expect(merged).toHaveLength(1);expect(merged[0]._href).toBeNull();expect(merged[0]._unavailable).toBe("This find is no longer available.");
    expect(JSON.parse(merged[0].meta_json).route).toBeNull();
  });
  it.each(["record","profile"])("distinguishes a failed %s-origin read from a deleted item",origin=>{
    const merged=mergeSavedCollections(origin==="record" ? [row()] : [],origin==="profile" ? profile : null,new Map([["find",{error:true}]]));
    expect(merged[0]._href).toBeNull();expect(merged[0]._unavailable).toBe("This find couldn’t load.");
  });
  it.each(["/LivingLifestyleDemo","/LivingAtelierDemo","/LivingReadingRoomDemo","/SkyWorldsDemo"])("returns the precise saved edition through allowed %s",route=>{
    const saved={...row(),meta_json:JSON.stringify({kind:"sky-lesson",lessonId:"earthshine",lessonVersion:1,route:`${route}?direction=petal-press&lesson=old`})};
    expect(savedReturnRoute(saved)).toBe(`${route}?direction=petal-press&section=sky&lesson=earthshine&lessonVersion=1#daily-sky-lesson`);
  });
  it.each(["https://evil.example/SkyWorldsDemo?direction=petal-press","//evil.example/SkyWorldsDemo","/unknown","javascript:alert(1)"])("rejects unsafe or unrecognised saved Sky destination %s",route=>{
    expect(savedReturnRoute({...row(),meta_json:JSON.stringify({kind:"sky-lesson",lessonId:"earthshine",lessonVersion:1,route})})).toBeNull();
  });
  it("does not substitute today's lesson when a saved edition is unavailable",()=>{
    expect(savedReturnRoute({...row(),meta_json:JSON.stringify({kind:"sky-lesson",lessonId:"earthshine",lessonVersion:9,route:"/SkyWorldsDemo?direction=press"})})).toBe('/SkyWorldsDemo?direction=press&section=sky&lesson=earthshine&lessonVersion=9#daily-sky-lesson');
  });
  it("keeps a public catalogue lesson's exact edition when a legacy profile also references it",()=>{
    const lesson={...row("sky-save","sky-lesson:earthshine:v1"),meta_json:JSON.stringify({kind:"sky-lesson",lessonId:"earthshine",lessonVersion:1,route:"/SkyWorldsDemo?direction=petal-press"})};
    const keeps=mergeSavedCollections([lesson],{...profile,saved_item_ids:[lesson.item_id]},new Map([[lesson.item_id,{error:true}]]));
    expect(keeps).toHaveLength(1);expect(keeps[0]._href).toBe("/SkyWorldsDemo?direction=petal-press&section=sky&lesson=earthshine&lessonVersion=1#daily-sky-lesson");
    expect(keeps[0]._unavailable).toBeFalsy();expect(keeps[0]._savedRecords[0]).toEqual(lesson);
  });
  it("opens the exact resolved fiction rather than its category or stale metadata URL",()=>{
    expect(savedReturnRoute(row(),{id:"story / 2",content_type:"FICTION"})).toBe("/FictionReader?id=story%20%2F%202");
  });
});

describe("Saved collection loading and removal read-back",()=>{
  it("excludes foreign saves and profile keeps from the owner library",async()=>{
    mock.saved.mockResolvedValue([row(),{...row("foreign","other-find"),user_id:"other",title:"Another owner's save"}]);
    mock.profiles.mockResolvedValue([{...profile,user_id:"other",saved_item_ids:["private-profile-find"]}]);render(<Saved/>);
    await screen.findByRole("heading",{name:"An actual keep"});expect(screen.queryByText("Another owner's save")).not.toBeInTheDocument();
    expect(mock.lifestyle).not.toHaveBeenCalledWith({id:"private-profile-find"},undefined,1);
  });
  it("loads saves past the first page and exact profile-only keeps outside any Lifestyle feed",async()=>{
    const first=Array.from({length:150},(_,i)=>row(`record-${i}`,`find-${i}`));
    mock.saved.mockImplementation(async(criteria,order,limit,skip)=>skip===0 ? first : [{...row("late-record","late-find"),title:"An older kept find"}]);
    mock.profiles.mockResolvedValue([{...profile,saved_item_ids:["find-0","outside-feed"]}]);
    render(<Saved/>);
    expect(await screen.findByRole("heading",{name:"An older kept find"})).toBeVisible();
    expect(screen.getByRole("heading",{name:"Find outside-feed"})).toBeVisible();
    expect(mock.saved).toHaveBeenCalledWith({user_id:"owner"},"-created_at",150,150);
    expect(mock.lifestyle).toHaveBeenCalledWith({id:"outside-feed"},undefined,1);
    expect(screen.getAllByRole("heading",{name:"Find find-0"})).toHaveLength(1);
  });
  it("reports a collection read failure without labelling it an empty library, then retries",async()=>{
    mock.saved.mockRejectedValueOnce(new Error("offline"));render(<Saved/>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Some saves couldn’t load.");
    expect(screen.queryByText("Nothing saved here yet")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Try again"}));
    expect(await screen.findByText("Nothing saved here yet")).toBeVisible();expect(mock.saved).toHaveBeenCalledTimes(2);
  });
  it("retains only the remotely surviving duplicate after a partially failed removal",async()=>{
    let records=[row("first"),row("second")];mock.saved.mockImplementation(async()=>records);
    mock.remove.mockImplementation(async id=>{if(id==="second") throw new Error("offline");records=records.filter(item=>item.id!==id);});
    render(<Saved/>);fireEvent.click(await screen.findByRole("button",{name:"Remove An actual keep"}));
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn’t be removed completely");
    expect(screen.getByRole("heading",{name:"An actual keep"})).toBeVisible();
    mock.remove.mockResolvedValue();fireEvent.click(screen.getByRole("button",{name:"Remove An actual keep"}));
    await waitFor(()=>expect(screen.queryByRole("heading",{name:"An actual keep"})).not.toBeInTheDocument());
    expect(mock.remove.mock.calls.map(([id])=>id)).toEqual(["first","second","second"]);
  });
  it("refuses a foreign profile returned during removal and keeps an honest retry state",async()=>{
    let records=[row()];mock.saved.mockImplementation(async()=>records);mock.remove.mockImplementation(async()=>{records=[];});
    mock.profiles.mockResolvedValueOnce([profile]).mockResolvedValueOnce([{...profile,user_id:"other"}]).mockResolvedValue([profile]);
    render(<Saved/>);fireEvent.click(await screen.findByRole("button",{name:"Remove Find find"}));
    expect(await screen.findByRole("alert")).toHaveTextContent("couldn’t be removed completely");
    expect(mock.update).not.toHaveBeenCalled();expect(mock.remove).toHaveBeenCalledExactlyOnceWith("record");
    expect(screen.getByRole("heading",{name:"Find find"})).toBeVisible();
  });
});

describe("Saved card dates and pending removal",()=>{
  it("uses a valid legacy saved date and keeps the exact destination while removal is blocked",()=>{
    const onRemove=vi.fn();render(<SavedItemCard item={{...row(),created_date:"2026-10-06T12:00:00Z"}} onRemove={onRemove} disabled/>);
    expect(screen.getByText("Saved 06/10/2026")).toBeVisible();fireEvent.click(screen.getByRole("button",{name:"Remove An actual keep"}));expect(onRemove).not.toHaveBeenCalled();
    expect(screen.getByRole("link",{name:"Open",exact:true})).toHaveAttribute("href","/LifestyleDetail?id=find");
  });
  it("does not show an invented or invalid date when the stored date is malformed",()=>{
    render(<SavedItemCard item={{...row(),created_at:"not-a-date"}} onRemove={vi.fn()}/>);
    expect(screen.queryByText(/Saved |Invalid Date/)).not.toBeInTheDocument();expect(screen.getByRole("heading",{name:"An actual keep"})).toBeVisible();
  });
});

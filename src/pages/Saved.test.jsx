import React, { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("Saved confirmed collection recovery", () => {
  const deferred = () => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
  };
  const retry = () => fireEvent.click(screen.getAllByRole("button", { name: "Try again" })[0]);

  it("shows every confirmed first-page reference with an error when page two fails, then reconciles complete remaining/empty reads", async () => {
    const first = Array.from({ length: 150 }, (_, i) => ({ ...row(`save-${i}`, `find-${i}`), title: `Kept reference ${i}` }));
    mock.saved.mockImplementation(async (_query, _order, _limit, skip) => {
      if (skip === 0) return first;
      throw new Error("second page unavailable");
    });
    render(<Saved />);
    await screen.findByRole("heading", { name: "Kept reference 149" });
    expect(screen.getAllByRole("heading", { name: /Kept reference/ })).toHaveLength(150);
    expect(screen.getByRole("alert")).toHaveTextContent("Some saves couldn’t load.");
    expect(screen.queryByText("Nothing saved here yet")).toBeNull();
    mock.saved.mockResolvedValue([first[149]]);
    mock.profiles.mockRejectedValue(new Error("profile unavailable"));
    retry();
    await screen.findByRole("heading", { name: "Kept reference 149" });
    expect(screen.getAllByRole("heading", { name: /Kept reference/ })).toHaveLength(1);
    mock.saved.mockResolvedValue([]); mock.profiles.mockResolvedValue([]);
    retry();
    expect(await screen.findByText("Nothing saved here yet")).toBeVisible();
  });

  it("retains known rows, profile-only metadata and removal tools after failed refresh without claiming a failed source exists", async () => {
    mock.saved.mockResolvedValue([row("known", "known")]);
    mock.profiles.mockResolvedValue([{ ...profile, saved_item_ids: ["profile-only", "unresolved"] }]);
    mock.lifestyle.mockImplementation(async ({ id }) => {
      if (id === "unresolved") throw new Error("source unavailable");
      return [{ id, title: `Confirmed ${id}`, summary: "A confirmed full description", content_type: "ARTICLE" }];
    });
    render(<Saved />);
    await screen.findByRole("heading", { name: "Confirmed profile-only" });
    expect(screen.getByRole("heading", { name: "An actual keep" })).toBeVisible();
    mock.saved.mockRejectedValue(new Error("saved unavailable")); mock.profiles.mockRejectedValue(new Error("profile unavailable"));
    mock.lifestyle.mockRejectedValue(new Error("exact source unavailable"));
    retry();
    await screen.findByRole("heading", { name: "Confirmed profile-only" });
    expect(screen.getByRole("heading", { name: "An actual keep" })).toBeVisible();
    expect(screen.getByText("A confirmed full description")).toBeVisible();
    expect(screen.getAllByText("This find couldn’t load.")).toHaveLength(3);
    expect(screen.queryByText("This find is no longer available.")).toBeNull();
    expect(screen.queryByRole("link", { name: "Open", exact: true })).toBeNull();
    expect(screen.getAllByRole("button", { name: "Remove this save" })).toHaveLength(3);
    mock.saved.mockResolvedValue([]); mock.profiles.mockResolvedValue([]);
    retry();
    expect(await screen.findByText("Nothing saved here yet")).toBeVisible();
  });

  it("keeps confirmed profile references when a profile response is malformed", async () => {
    mock.profiles.mockResolvedValue([{ ...profile, saved_item_ids: ["profile-only"] }]);
    mock.saved.mockRejectedValue(new Error("saves unavailable"));
    render(<Saved />);
    await screen.findByRole("heading", { name: "Find profile-only" });
    mock.profiles.mockResolvedValue(null);
    retry();
    await screen.findByRole("heading", { name: "Find profile-only" });
    expect(screen.getByRole("alert")).toHaveTextContent("Your Lifestyle keeps couldn’t load.");
  });

  it("clears prior owner rows and profile references before handling the new owner's failed reads", async () => {
    mock.saved.mockResolvedValue([row()]); mock.profiles.mockResolvedValue([profile]);
    mock.lifestyle.mockRejectedValue(new Error("source unavailable"));
    render(<Saved />); await screen.findByRole("heading", { name: "An actual keep" });
    mock.me.mockResolvedValue({ id: "next-owner" });
    mock.saved.mockRejectedValue(new Error("new owner scan failed")); mock.profiles.mockRejectedValue(new Error("new profile failed"));
    mock.lifestyle.mockClear(); retry();
    await screen.findByText("Some saves couldn’t load.");
    expect(screen.queryByRole("heading", { name: "An actual keep" })).toBeNull();
    expect(mock.lifestyle).not.toHaveBeenCalled();
  });

  it("never resurrects an acknowledged deleted duplicate when the partial-removal read-back fails", async () => {
    mock.saved.mockResolvedValueOnce([row("first"), row("second")]).mockRejectedValue(new Error("read-back unavailable"));
    mock.remove.mockImplementation(async id => { if (id === "second") throw new Error("delete unavailable"); });
    render(<Saved />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove An actual keep" }));
    await screen.findByText("Some saves couldn’t load.");
    expect(screen.getByRole("heading", { name: "An actual keep" })).toBeVisible();
    expect(screen.getByText("That save couldn’t be removed completely. Try again.")).toBeVisible();
    mock.remove.mockResolvedValue();
    fireEvent.click(screen.getByRole("button", { name: "Remove An actual keep" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "An actual keep" })).toBeNull());
    expect(mock.remove.mock.calls.map(([id]) => id)).toEqual(["first", "second", "second"]);
  });

  it("does not restore a successfully removed profile-only save during a later failed refresh", async () => {
    mock.profiles.mockResolvedValue([{ ...profile, saved_item_ids: ["find", "unresolved"] }]);
    mock.lifestyle.mockImplementation(async ({ id }) => id === "unresolved" ? [] : [{ id, title: "Confirmed profile keep", content_type: "ARTICLE" }]);
    render(<Saved />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove Confirmed profile keep" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Confirmed profile keep" })).toBeNull());
    mock.profiles.mockRejectedValue(new Error("refresh unavailable")); retry();
    await screen.findByText("Your Lifestyle keeps couldn’t load.");
    expect(screen.queryByRole("heading", { name: "Confirmed profile keep" })).toBeNull();
    expect(screen.getByRole("heading", { name: "A kept Lifestyle find" })).toBeVisible();
    expect(mock.update).toHaveBeenCalledExactlyOnceWith("profile", { saved_item_ids: ["unresolved"] });
  });

  it("ignores an old exact-source response after unmount instead of contaminating a new owner's archive", async () => {
    const source = deferred();
    mock.saved.mockResolvedValue([row()]); mock.lifestyle.mockReturnValueOnce(source.promise);
    const old = render(<Saved />);
    await waitFor(() => expect(mock.lifestyle).toHaveBeenCalled()); old.unmount();
    mock.me.mockResolvedValue({ id: "next-owner" }); mock.saved.mockResolvedValue([]);
    render(<Saved />); await screen.findByText("Nothing saved here yet");
    await act(async () => source.resolve([{ id: "find", title: "Old owner source" }]));
    expect(screen.queryByRole("heading", { name: "An actual keep" })).toBeNull();
    expect(screen.getByText("Nothing saved here yet")).toBeVisible();
  });

  it("ignores a superseded auth lookup in StrictMode", async () => {
    const previous = deferred(); mock.me.mockReturnValueOnce(previous.promise).mockResolvedValueOnce({ id: "next-owner" });
    render(<StrictMode><Saved /></StrictMode>);
    await screen.findByText("Nothing saved here yet");
    await act(async () => previous.resolve({ id: "owner" }));
    expect(mock.saved).toHaveBeenCalledExactlyOnceWith({ user_id: "next-owner" }, "-created_at", 150, 0);
  });

  it("retains the complete mixed collection across tabs after a failed refresh", async () => {
    const types = [["ADVICE", "Advice"], ["CONTENT", "Sessions"], ["PROGRAM", "Programs"], ["JOURNAL", "Journal"], ["EVENT", "Events"]];
    mock.saved.mockResolvedValue(types.map(([type]) => ({ ...row(type, type), item_type: type, title: `Kept ${type}` })));
    mock.profiles.mockRejectedValue(new Error("profile unavailable"));
    render(<Saved />); await screen.findByText("Your Lifestyle keeps couldn’t load.");
    mock.saved.mockRejectedValue(new Error("scan unavailable")); retry();
    await screen.findByText("Some saves couldn’t load.");
    for (const [type, label] of types) {
      fireEvent.click(screen.getByRole("button", { name: label, exact: true }));
      expect(screen.getByRole("heading", { name: `Kept ${type}` })).toBeVisible();
      expect(screen.getByRole("button", { name: `Remove Kept ${type}` })).toBeEnabled();
    }
  });

  it("does not continue duplicate deletions after the archive unmounts", async () => {
    const deletion = deferred();
    mock.saved.mockResolvedValue([row("first"), row("second")]); mock.remove.mockReturnValueOnce(deletion.promise);
    const view = render(<Saved />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove An actual keep" }));
    expect(mock.remove).toHaveBeenCalledExactlyOnceWith("first");
    view.unmount();
    await act(async () => deletion.resolve());
    expect(mock.remove).toHaveBeenCalledExactlyOnceWith("first");
  });

  it("filters acknowledged deleted rows even out of a stale successful page followed by a failed page", async () => {
    const stale = [row("first"), row("second"), ...Array.from({ length: 148 }, (_, i) => ({ ...row(`other-${i}`, `other-${i}`), item_type: "JOURNAL" }))];
    let readBack = false;
    mock.saved.mockImplementation(async (_query, _order, _limit, skip) => {
      if (!readBack) return [row("first"), row("second")];
      if (skip === 0) return stale;
      throw new Error("page two failed");
    });
    mock.remove.mockImplementation(async id => { if (id === "second") { readBack = true; throw new Error("delete failed"); } });
    render(<Saved />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove An actual keep" }));
    await screen.findByText("Some saves couldn’t load.");
    mock.remove.mockResolvedValue();
    fireEvent.click(screen.getByRole("button", { name: "Remove An actual keep" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "An actual keep" })).toBeNull());
    expect(mock.remove.mock.calls.map(([id]) => id)).toEqual(["first", "second", "second"]);
  });

  it("accepts a confirmed same-profile re-add on a fresh explicit retry without remounting", async () => {
    const currentProfile = { ...profile, saved_item_ids: ["find", "unresolved"] };
    mock.profiles.mockResolvedValue([currentProfile]);
    mock.lifestyle.mockImplementation(async ({ id }) => id === "unresolved" ? [] : [{ id, title: "Re-addable find", content_type: "ARTICLE" }]);
    render(<Saved />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove Re-addable find" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Re-addable find" })).toBeNull());
    // Another surface added the same reference back to this same profile. The unrelated
    // unavailable reference exposes the existing retry path; this is the same mounted Saved.
    mock.profiles.mockResolvedValue([currentProfile]); retry();
    expect(await screen.findByRole("heading", { name: "Re-addable find" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Open", exact: true })).toHaveAttribute("href", "/LifestyleDetail?id=find");
    expect(mock.update).toHaveBeenCalledTimes(1);
  });

  it("keeps removal acknowledged after a profile refresh started from being revived by that older response", async () => {
    const currentProfile = { ...profile, saved_item_ids: ["find", "unresolved"] };
    const acknowledgement = deferred(), olderRead = deferred();
    mock.profiles.mockResolvedValueOnce([currentProfile]).mockResolvedValueOnce([currentProfile]).mockReturnValueOnce(olderRead.promise);
    mock.update.mockReturnValueOnce(acknowledgement.promise);
    mock.lifestyle.mockImplementation(async ({ id }) => id === "unresolved" ? [] : [{ id, title: "Removed find", content_type: "ARTICLE" }]);
    render(<Saved />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove Removed find" }));
    await waitFor(() => expect(mock.update).toHaveBeenCalledTimes(1));
    retry();
    await waitFor(() => expect(mock.profiles).toHaveBeenCalledTimes(3));
    await act(async () => acknowledgement.resolve({}));
    await act(async () => olderRead.resolve([currentProfile]));
    await screen.findByRole("heading", { name: "A kept Lifestyle find" });
    expect(screen.queryByRole("heading", { name: "Removed find" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Open", exact: true })).toBeNull();
  });
});

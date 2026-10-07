import React, { useState } from "react";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
const mocked=vi.hoisted(()=>({crisis:vi.fn(),cohort:vi.fn(),aggregate:vi.fn(),prediction:vi.fn(),room:vi.fn(),shelf:vi.fn(),club:vi.fn()}));
vi.mock("@/components/community/communityConfig",()=>({crisisCheck:mocked.crisis}));
vi.mock("@/components/community/chapterPrompts",()=>({promptFor:()=>({prompt:"What stayed with you?"})}));
vi.mock("@/components/community/readingActivity",()=>({recordPrediction:mocked.prediction,recordClubReflection:mocked.room,hasPredicted:()=>false,cohortReachedCount:mocked.cohort,predictionAggregate:mocked.aggregate,readingDaySet:()=>new Set()}));
vi.mock("@/components/community/bookshelf",()=>({loadShelf:mocked.shelf,readLocal:()=>[],addBook:vi.fn(),setStatus:vi.fn()}));
vi.mock("@/components/community/bookClubConfig",()=>({loadBookClubPick:mocked.club,clubReached:()=>-1}));
vi.mock("@/components/lifestyle/dailyStory",()=>({readingPosition:()=>null,isChapterRead:()=>false}));
vi.mock("../lifestyle-elite/ReadingRoomHeader",()=>({RestingBook:()=>null}));
vi.mock("@/api/base44Client",()=>({base44:{entities:{},auth:{}}}));
import ChapterEndCard from "./ChapterEndCard";
import ChapterHeadsUp from "./ChapterHeadsUp";
import CrisisSheetLite from "./CrisisSheetLite";
import { UK_RESOURCES } from "@/pages/communityShared";
import { warningFor } from "./chapterWarnings";
import BooksStoryFocus from "../lifestyle-elite/BooksStoryFocus";
const key="fw_read_reflect_514_2";
const note=()=>screen.getByPlaceholderText("A line is plenty — for yourself, or leave it blank.");
const keep=()=>screen.getByRole("button",{name:"Keep this for me"});
beforeEach(()=>{
  vi.clearAllMocks(); localStorage.clear();
  mocked.crisis.mockReturnValue({intercept:false}); mocked.cohort.mockResolvedValue(null); mocked.aggregate.mockResolvedValue([]);
  mocked.shelf.mockResolvedValue([]); mocked.club.mockResolvedValue({pick_key:"current",title:"Our book",checkpoints:[]});
  mocked.prediction.mockResolvedValue({ok:true});
});
afterEach(()=>vi.restoreAllMocks());
it("clean note preserves its exact source and authored prompt, traps focus, acknowledges failure/retry and returns to its opener",async()=>{
  function Host(){const [open,setOpen]=useState(false);return <><button onClick={()=>setOpen(true)}>Reflect</button>{open&&<ChapterEndCard cleanPreview bookId="514" chapterIndex={2} anytime sourceContext="Little Women · III. THE LAURENCE BOY" onClose={()=>setOpen(false)}/>}</>;}
  render(<Host/>); const opener=screen.getByRole("button",{name:"Reflect"}); opener.focus();fireEvent.click(opener);
  const input=screen.getByRole("textbox",{name:"Your note"});expect(input).toHaveFocus();
  expect(screen.getByText("Little Women · III. THE LAURENCE BOY")).toBeVisible();expect(screen.getByText("What stayed with you?")).toBeVisible();
  expect(input).toHaveAccessibleDescription("On this device Little Women · III. THE LAURENCE BOY");
  fireEvent.change(input,{target:{value:"My exact note"}});
  vi.spyOn(Storage.prototype,"setItem").mockImplementationOnce(()=>{throw new Error("Full");});
  const save=screen.getByRole("button",{name:"Keep my note"});fireEvent.click(save);expect(screen.getByRole("alert")).toBeVisible();expect(input).toHaveValue("My exact note");
  fireEvent.click(save);expect(screen.getByRole("status")).toHaveTextContent("Kept on this device.");expect(localStorage.getItem(key)).toBe("My exact note");
  save.focus();fireEvent.keyDown(save,{key:"Tab"});expect(screen.getByRole("button",{name:"Close"})).toHaveFocus();
  fireEvent.keyDown(document.activeElement,{key:"Tab",shiftKey:true});expect(save).toHaveFocus();
  opener.focus();expect(input).toHaveFocus();
  fireEvent.keyDown(input,{key:"Escape"});await waitFor(()=>expect(opener).toHaveFocus());expect(screen.queryByRole("dialog")).toBeNull();
});
it("clean note replacement keeps focus in actual support and returns to the original Reflect control after closing",async()=>{
  mocked.crisis.mockReturnValue({intercept:true});
  function Host(){const [sheet,setSheet]=useState(null);return <><button onClick={()=>setSheet("note")}>Reflect</button>{sheet==="note"&&<ChapterEndCard cleanPreview bookId="514" chapterIndex={2} anytime onClose={()=>setSheet(null)} onCrisis={()=>setSheet("support")}/>}{sheet==="support"&&<CrisisSheetLite cleanPreview onClose={()=>setSheet(null)}/>}</>;}
  render(<Host/>);const opener=screen.getByRole("button",{name:"Reflect"});opener.focus();fireEvent.click(opener);
  fireEvent.change(screen.getByRole("textbox",{name:"Your note"}),{target:{value:"Intercepted words"}});fireEvent.click(screen.getByRole("button",{name:"Keep my note"}));
  await act(async()=>{});expect(screen.getByRole("button",{name:"Close"})).toHaveFocus();
  for(const resource of UK_RESOURCES){expect(screen.getByText(resource.name)).toBeVisible();expect(screen.getByText(resource.detail)).toBeVisible();}
  expect(localStorage.getItem(key)).toBeNull();fireEvent.keyDown(document.activeElement,{key:"Escape"});await waitFor(()=>expect(opener).toHaveFocus());
});
it.each(["continue","defer","escape"])("clean warning preserves complete authored content and its %s exit",async(exit)=>{
  const continuation=vi.fn(),defer=vi.fn();
  render(<ChapterHeadsUp cleanPreview bookId="514" chapterIndex={14} onContinue={continuation} onDefer={defer}/>);
  expect(screen.getByText(warningFor("514",14).note)).toBeVisible();const ready=screen.getByRole("button",{name:"I’m ready — continue"});expect(ready).toHaveFocus();
  if(exit==="escape")fireEvent.keyDown(ready,{key:"Escape"});else fireEvent.click(exit==="continue"?ready:screen.getByRole("button",{name:"Not right now"}));
  expect(localStorage.getItem("fw_read_warn_514_14")).toBe("1");expect(exit==="defer"?defer:continuation).toHaveBeenCalledOnce();
});
it("clean chapter-end keeps the hunch, full reveal, cohort and exact discussion route",async()=>{
  mocked.cohort.mockResolvedValue(12);mocked.aggregate.mockResolvedValue(["A journey home.","She writes the letter."]);
  render(<MemoryRouter><ChapterEndCard cleanPreview bookId="514" chapterIndex={2} userId="owner" communityHref="/Community?view=bookclub&pick=exact" inClub/></MemoryRouter>);
  expect(await screen.findByText("A journey home.")).toBeVisible();expect(screen.getByText("She writes the letter.")).toBeVisible();expect(screen.getByText(/12 of you have reached chapter 3/)).toBeVisible();
  fireEvent.change(screen.getByRole("textbox",{name:"Your hunch"}),{target:{value:"They meet again."}});fireEvent.click(screen.getByRole("button",{name:"Add my hunch"}));
  await waitFor(()=>expect(mocked.prediction).toHaveBeenCalledWith("514",2,"They meet again.","owner"));
  expect(screen.getByRole("link",{name:"Discuss this in the Book Club"})).toHaveAttribute("href","/Community?view=bookclub&pick=exact");expect(screen.getByRole("button",{name:"Add to the room"})).toBeVisible();
});
it("confirmed private save uses the exact legacy key, reopens full text and tells mounted Books without sending note text",async()=>{
  localStorage.setItem(key,"Older note");
  const event=vi.fn(); window.addEventListener("fw_read_reflection_saved",event);
  const mounted=render(<MemoryRouter><BooksStoryFocus/><ChapterEndCard bookId="514" chapterIndex={2} anytime/></MemoryRouter>);
  await screen.findByText("Our book");
  fireEvent.change(note(),{target:{value:"  The sentence I want to remember.  "}}); fireEvent.click(keep());
  expect(within(screen.getByRole("dialog")).getByRole("status")).toHaveTextContent("Kept on this device.");
  expect(localStorage.getItem(key)).toBe("The sentence I want to remember.");
  expect(event).toHaveBeenCalledOnce(); expect(event.mock.calls[0][0].detail).toEqual({bookId:"514",chapterIndex:2});
  expect(screen.getByText("“The sentence I want to remember.”")).toBeVisible();
  expect(screen.getByText("a reading note you kept on this device")).toBeVisible();
  expect(mocked.room).not.toHaveBeenCalled(); expect(mocked.prediction).not.toHaveBeenCalled();
  mounted.unmount(); window.removeEventListener("fw_read_reflection_saved",event);
  render(<MemoryRouter><ChapterEndCard bookId="514" chapterIndex={2} anytime/></MemoryRouter>);
  expect(note()).toHaveValue("The sentence I want to remember.");
});
it("a rejected local write preserves draft and prior value, offers the same control to retry and emits no false confirmation",()=>{
  localStorage.setItem(key,"Prior saved words");
  const set=vi.spyOn(Storage.prototype,"setItem").mockImplementationOnce(()=>{throw new DOMException("Full","QuotaExceededError");});
  const event=vi.fn(); window.addEventListener("fw_read_reflection_saved",event);
  render(<MemoryRouter><ChapterEndCard bookId="514" chapterIndex={2} anytime/></MemoryRouter>);
  fireEvent.change(note(),{target:{value:"My new words"}}); fireEvent.click(keep());
  expect(screen.getByRole("alert")).toHaveTextContent("Couldn't keep"); expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(note()).toHaveValue("My new words"); expect(localStorage.getItem(key)).toBe("Prior saved words"); expect(event).not.toHaveBeenCalled();
  fireEvent.click(keep()); expect(screen.getByRole("status")).toHaveTextContent("Kept on this device.");
  expect(set).toHaveBeenCalledTimes(2); expect(localStorage.getItem(key)).toBe("My new words");
  window.removeEventListener("fw_read_reflection_saved",event);
});
it("mismatched read-back never reports success or updates mounted note consumer",()=>{
  render(<MemoryRouter><ChapterEndCard bookId="514" chapterIndex={2} anytime/></MemoryRouter>);
  vi.spyOn(Storage.prototype,"getItem").mockReturnValue("Different value");
  fireEvent.change(note(),{target:{value:"Actual draft"}}); fireEvent.click(keep());
  expect(screen.getByRole("alert")).toBeVisible(); expect(screen.queryByRole("status")).not.toBeInTheDocument(); expect(note()).toHaveValue("Actual draft");
});
it("blank and intercepted text never writes, and edits clear old success",()=>{
  const write=vi.spyOn(Storage.prototype,"setItem"), crisis=vi.fn();
  render(<MemoryRouter><ChapterEndCard bookId="514" chapterIndex={2} anytime onCrisis={crisis}/></MemoryRouter>);
  expect(keep()).toBeDisabled(); expect(write).not.toHaveBeenCalled();
  fireEvent.change(note(),{target:{value:"A thought"}}); mocked.crisis.mockReturnValueOnce({intercept:true}); fireEvent.click(keep());
  expect(crisis).toHaveBeenCalledOnce(); expect(write).not.toHaveBeenCalled();
  fireEvent.click(keep()); expect(screen.getByRole("status")).toBeVisible();
  fireEvent.change(note(),{target:{value:"An edit"}}); expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
it("changing the exact book or chapter opens its own note, never saving the previous draft there",()=>{
  localStorage.setItem("fw_read_reflect_105_0","Existing other note");
  const mounted=render(<MemoryRouter><ChapterEndCard bookId="514" chapterIndex={2} anytime/></MemoryRouter>);
  fireEvent.change(note(),{target:{value:"Unsent A draft"}});
  mounted.rerender(<MemoryRouter><ChapterEndCard bookId="105" chapterIndex={0} anytime/></MemoryRouter>);
  expect(note()).toHaveValue("Existing other note"); fireEvent.click(keep());
  expect(localStorage.getItem(key)).toBeNull(); expect(localStorage.getItem("fw_read_reflect_105_0")).toBe("Existing other note");
});
it("quick reflection performs no hidden aggregate requests; chapter-end still preserves both reads and prediction",async()=>{
  const mounted=render(<MemoryRouter><ChapterEndCard bookId="514" chapterIndex={2} anytime/></MemoryRouter>);
  expect(mocked.cohort).not.toHaveBeenCalled(); expect(mocked.aggregate).not.toHaveBeenCalled();
  expect(screen.queryByRole("button",{name:"Add my hunch"})).not.toBeInTheDocument();
  mounted.rerender(<MemoryRouter><ChapterEndCard bookId="514" chapterIndex={2}/></MemoryRouter>);
  await waitFor(()=>expect(mocked.cohort).toHaveBeenCalledWith("514",2)); expect(mocked.aggregate).toHaveBeenCalledWith("514",2);
  expect(within(screen.getByRole("dialog")).getByRole("button",{name:"Add my hunch"})).toBeVisible();
});
it("the unmapped room action keeps its draft and discussion route without orphan write or false delivery",()=>{
  render(<MemoryRouter><ChapterEndCard bookId="514" chapterIndex={2} anytime inClub userId="test-owner" communityHref="/Community?view=bookclub&pick=actual"/></MemoryRouter>);
  fireEvent.change(note(),{target:{value:"Words I might share"}});
  fireEvent.click(screen.getByRole("button",{name:"Add to the room"}));
  expect(screen.getByRole("alert")).toHaveTextContent("Not shared."); expect(note()).toHaveValue("Words I might share");
  expect(mocked.room).not.toHaveBeenCalled(); expect(localStorage.getItem(key)).toBeNull();
  expect(screen.queryByText(/Added to the room/)).not.toBeInTheDocument();
  expect(screen.getByRole("link",{name:"Discuss this in the Book Club"})).toHaveAttribute("href","/Community?view=bookclub&pick=actual");
  expect(keep()).toBeEnabled();
});
it("a pending or failed hunch keeps its draft, prevents double taps and clears only after confirmed retry",async()=>{
  let finish; mocked.prediction.mockReturnValueOnce(new Promise((_,reject)=>{finish=reject;}));
  render(<MemoryRouter><ChapterEndCard bookId="514" chapterIndex={2} userId="owner"/></MemoryRouter>);
  const input=screen.getByPlaceholderText(/What do you think happens next/);
  fireEvent.change(input,{target:{value:"I think she goes home."}}); fireEvent.click(screen.getByRole("button",{name:"Add my hunch"}));
  expect(screen.getByRole("button",{name:"Sending…"})).toBeDisabled(); expect(input).toHaveValue("I think she goes home.");
  fireEvent.click(screen.getByRole("button",{name:"Sending…"})); expect(mocked.prediction).toHaveBeenCalledOnce();
  await act(async()=>finish(new Error("offline"))); expect(screen.getByRole("alert")).toHaveTextContent("Your hunch is still here");
  expect(input).toHaveValue("I think she goes home."); fireEvent.click(screen.getByRole("button",{name:"Add my hunch"}));
  expect(await screen.findByText(/Your hunch is in/)).toBeVisible(); expect(screen.queryByPlaceholderText(/What do you think happens next/)).not.toBeInTheDocument();
  expect(mocked.prediction).toHaveBeenCalledTimes(2);
});

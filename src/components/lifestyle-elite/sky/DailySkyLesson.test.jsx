import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import DailySkyLesson, { SavedSkyLessons } from "./DailySkyLesson";
import { dailyLessonDeck, localSkyDay, SKY_LESSONS, skyLessonKey, skyLessonRoute } from "./skyLessons";

const mock = vi.hoisted(()=>({filter:vi.fn(),journals:vi.fn(),create:vi.fn(),save:vi.fn(),remove:vi.fn()}));
vi.mock("@/api/base44Client",()=>({base44:{entities:{SavedItems:{filter:mock.filter},JournalEntries:{filter:mock.journals,create:mock.create}}}}));
vi.mock("@/lib/savedItems",()=>({saveItem:mock.save,removeSavedItem:mock.remove,parseSavedMeta:item=>JSON.parse(item.meta_json || "{}")}));

beforeEach(()=>{vi.clearAllMocks();mock.filter.mockResolvedValue([]);mock.journals.mockResolvedValue([]);mock.save.mockResolvedValue({id:"saved"});mock.remove.mockResolvedValue({id:"saved"});window.history.replaceState({},"","/LivingLifestyleDemo?section=sky");HTMLElement.prototype.scrollTo=vi.fn();});

describe("daily astronomy and exact identity",()=>{
  it("uses calendar ordinals across month/DST boundaries and 24 distinct daily leads",()=>{
    const seen=new Set();for(let i=0;i<24;i++){const date=new Date(2026,9,5+i,12);const deck=dailyLessonDeck(localSkyDay(date));seen.add(deck[0].id);expect(new Set(deck.map(item=>item.id)).size).toBe(5);}expect(seen.size).toBe(24);
    expect(dailyLessonDeck("2026-10-29")[0].id).toBe(dailyLessonDeck("2026-10-05")[0].id);
    expect(dailyLessonDeck("2026-10-25")[0].id).not.toBe(dailyLessonDeck("2026-10-26")[0].id);
    expect(dailyLessonDeck("2026-10-04")[0].id).toBe(SKY_LESSONS[23].id);
  });
  it("reopens a saved lesson on a different date, keeping stable versioned identity",()=>{
    const exact=dailyLessonDeck("2026-11-12","earthshine");expect(exact[0].id).toBe("earthshine");expect(new Set(exact.map(item=>item.id)).size).toBe(5);expect(skyLessonKey(exact[0])).toBe("sky-lesson:earthshine:v1");expect(skyLessonRoute(exact[0],"path")).toContain("direction=path&section=sky&lesson=earthshine&lessonVersion=1");
  });
  it("keeps all eight phase definitions directly operable without birth details or auth",()=>{
    render(<DailySkyLesson moon={{key:"full",position:.5,illumination:100,name:"Full moon"}}/>);
    expect(screen.getAllByRole("button",{name:/Learn about/})).toHaveLength(8);
    fireEvent.click(screen.getByRole("button",{name:"Learn about first quarter"}));expect(screen.getByText(/Half-lit, a quarter/)).toBeVisible();
    fireEvent.click(screen.getByRole("button",{name:"A private note"}));expect(screen.getByText("Sign in to keep a private note.")).toBeVisible();expect(mock.create).not.toHaveBeenCalled();
  });
  it("keeps arrow focus and respects ends without wrapping or changing automatically",()=>{
    render(<DailySkyLesson/>);const next=screen.getByRole("button",{name:"Next sky lesson"});next.focus();fireEvent.click(next);expect(next).toHaveFocus();expect(screen.getByText("2 / 5 · keep exploring")).toBeVisible();for(let i=0;i<3;i++)fireEvent.click(next);expect(next).toBeDisabled();expect(screen.getByRole("button",{name:"Previous sky lesson"})).not.toBeDisabled();
  });
  it("reports an unavailable requested edition without pretending today's card is the saved edition",()=>{
    window.history.replaceState({},"","/LivingLifestyleDemo?lesson=earthshine&lessonVersion=9");render(<DailySkyLesson/>);expect(screen.getByRole("alert")).toHaveTextContent("edition is unavailable");
  });
});
describe("real save and private source-linked note contracts",()=>{
  it("returns an older save to its exact edition in the room and rejects an arbitrary preview destination",async()=>{
    const lesson=SKY_LESSONS.find(item=>item.id==="earthshine");
    expect(skyLessonRoute(lesson,"living","https://example.com")).toMatch(/^\/LivingLifestyleDemo\?/);
    mock.filter.mockResolvedValue([{id:"old",title:lesson.title,meta_json:JSON.stringify({kind:"sky-lesson",lessonId:lesson.id,lessonVersion:1,route:"/LivingAtelierDemo?lesson=earthshine"})}]);
    render(<SavedSkyLessons userId="owner" direction="living" previewRoute="/LivingReadingRoomDemo"/>);
    expect(await screen.findByRole("link",{name:/Earth lends/})).toHaveAttribute("href","/LivingReadingRoomDemo?direction=living&section=sky&lesson=earthshine&lessonVersion=1#daily-sky-lesson");
  });
  it("keeps the creative preview on its own exact lesson return, including older saves",async()=>{
    mock.filter.mockResolvedValue([{id:"one",title:"Earth lends a little light",meta_json:JSON.stringify({kind:"sky-lesson",lessonId:"earthshine",lessonVersion:1,route:"/LivingLifestyleDemo?lesson=earthshine"})}]);
    render(<SavedSkyLessons userId="owner" direction="letter" previewRoute="/LivingAtelierDemo"/>);
    const row=await screen.findByRole("link",{name:/Earth lends/});expect(row).toHaveAttribute("href","/LivingAtelierDemo?direction=letter&section=sky&lesson=earthshine&lessonVersion=1#daily-sky-lesson");
  });
  it("protects the submitted words and card position while persistence is pending",async()=>{
    let complete;mock.create.mockImplementation(()=>new Promise(resolve=>{complete=resolve;}));render(<DailySkyLesson userId="owner"/>);fireEvent.click(screen.getByRole("button",{name:"A private note"}));const input=screen.getByLabelText("What caught your eye?");fireEvent.change(input,{target:{value:"Keep these exact words."}});fireEvent.click(screen.getByRole("button",{name:"Keep in journal"}));expect(input).toHaveAttribute("readonly");expect(screen.getByRole("button",{name:"Next sky lesson"})).toBeDisabled();fireEvent.keyDown(screen.getByLabelText("Swipeable lesson cards"),{key:"ArrowRight"});expect(screen.getByText("1 / 5 · today’s lesson")).toBeVisible();await act(async()=>complete({id:"new",user_id:"owner",content_key:skyLessonKey(dailyLessonDeck(localSkyDay())[0]),text:"Keep these exact words."}));expect(screen.getByText(/Kept in your journal/)).toBeVisible();
  });
  it("keeps a just-created note when an earlier read resolves late",async()=>{
    let completeRead;mock.journals.mockImplementation(()=>new Promise(resolve=>{completeRead=resolve;}));mock.create.mockImplementation(async record=>({...record,id:"new"}));render(<DailySkyLesson userId="owner"/>);fireEvent.click(screen.getByRole("button",{name:"A private note"}));fireEvent.change(screen.getByLabelText("What caught your eye?"),{target:{value:"A new observation."}});fireEvent.click(screen.getByRole("button",{name:"Keep in journal"}));await screen.findByText(/Kept in your journal/);await act(async()=>completeRead([]));expect(screen.getByText("Your note on this lesson")).toBeVisible();
  });
  it("awaits persistence, reports save failure honestly and retries exact reference",async()=>{
    window.history.replaceState({},"","/LivingLifestyleDemo?lesson=earthshine");mock.save.mockRejectedValueOnce(new Error("offline"));render(<DailySkyLesson userId="owner" direction="field"/>);
    const button=screen.getByRole("button",{name:"Keep this"});await waitFor(()=>expect(button).not.toBeDisabled());fireEvent.click(button);await screen.findByText(/That didn’t save/);expect(button).toHaveAttribute("aria-pressed","false");fireEvent.click(button);await screen.findByText(/Kept in Yours/);expect(mock.save).toHaveBeenLastCalledWith(expect.objectContaining({itemId:"sky-lesson:earthshine:v1",meta:expect.objectContaining({kind:"sky-lesson",route:expect.stringContaining("direction=field&section=sky&lesson=earthshine")})}));
  });
  it("retains a draft on failure and keeps exact source identity on successful retry",async()=>{
    window.history.replaceState({},"","/LivingLifestyleDemo?lesson=earthshine");mock.create.mockRejectedValueOnce(new Error("offline")).mockImplementationOnce(async record=>({...record,id:"journal-1"}));render(<DailySkyLesson userId="owner"/>);
    fireEvent.click(screen.getByRole("button",{name:"A private note"}));const input=screen.getByLabelText("What caught your eye?");fireEvent.change(input,{target:{value:"The faint outline caught my eye."}});fireEvent.click(screen.getByRole("button",{name:"Keep in journal"}));await screen.findByText(/Your note didn’t save/);expect(input).toHaveValue("The faint outline caught my eye.");fireEvent.click(screen.getByRole("button",{name:"Keep in journal"}));await screen.findByText(/Kept in your journal/);expect(mock.create).toHaveBeenLastCalledWith(expect.objectContaining({user_id:"owner",content_id:"sky-lesson:earthshine:v1",content_key:"sky-lesson:earthshine:v1",card_type:"reflection",text:"The faint outline caught my eye."}));fireEvent.click(screen.getByText("Your note on this lesson"));expect(screen.getByText("The faint outline caught my eye.")).toBeVisible();
  });
  it("reads only the owner’s saves and adds the exact lesson return alongside existing Yours",async()=>{
    mock.filter.mockResolvedValue([{id:"one",title:"Earth lends a little light",meta_json:JSON.stringify({kind:"sky-lesson",lessonId:"earthshine",lessonVersion:1})}]);render(<SavedSkyLessons userId="owner" direction="horizon"/>);const row=await screen.findByRole("link",{name:/Earth lends/});expect(row).toHaveAttribute("href",expect.stringContaining("direction=horizon&section=sky&lesson=earthshine&lessonVersion=1"));expect(mock.filter).toHaveBeenCalledWith({user_id:"owner",item_type:"LIFESTYLE"},"-created_at",150);
  });
});

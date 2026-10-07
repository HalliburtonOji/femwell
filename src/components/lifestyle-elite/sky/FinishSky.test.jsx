import React from "react";
import { afterEach,beforeEach,describe,expect,it,vi } from "vitest";
import { act,fireEvent,render,renderHook,screen,waitFor } from "@testing-library/react";
import DailySkyLesson,{SavedSkyLessons,useLessonSaves,PrivateSkyNotes} from "./DailySkyLesson";
import ObservedSkyDiary from "./ObservedSkyDiary";
import {AskTheSky,Compatibility,Atelier,YearMovement} from "./SkyMovements";
import {skyCheckoutResult,skyPairingValue,skyParagraphs,safeSkySavedReturn} from "./skySourceContracts";
import {dailyLessonDeck,localSkyDay,skyLessonKey} from "./skyLessons";
import useObservedSkyDiary from "./useObservedSkyDiary";

const mock=vi.hoisted(()=>({saves:vi.fn(),journals:vi.fn(),createNote:vi.fn(),save:vi.fn(),remove:vi.fn(),skyNotes:vi.fn(),createSkyNote:vi.fn(),cycles:vi.fn(),readings:vi.fn(),threads:vi.fn(),messages:vi.fn(),invoke:vi.fn()}));
vi.mock("@/api/base44Client",()=>({base44:{entities:{SavedItems:{filter:mock.saves},JournalEntries:{filter:mock.journals,create:mock.createNote},SkyNote:{filter:mock.skyNotes,create:mock.createSkyNote},CycleEvents:{filter:mock.cycles},HoroscopeReading:{filter:mock.readings},AdviceThreads:{filter:mock.threads},AdviceMessages:{filter:mock.messages}},functions:{invoke:mock.invoke}}}));
vi.mock("@/lib/savedItems",()=>({saveItem:mock.save,removeSavedItem:mock.remove,parseSavedMeta:row=>JSON.parse(row.meta_json || "{}")}));
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return{resolve,promise};};
const lessonRow=(id="earthshine",owner="a",version=1)=>({id:`keep-${id}`,user_id:owner,item_id:`sky-lesson:${id}:v${version}`,title:"Earth lends a little light",meta_json:JSON.stringify({kind:"sky-lesson",lessonId:id,lessonVersion:version})});
beforeEach(()=>{
  vi.resetAllMocks();window.history.replaceState({},"","/SkyWorldsDemo?direction=petal-press&section=sky");HTMLElement.prototype.scrollTo=vi.fn();
  for(const source of [mock.saves,mock.journals,mock.skyNotes,mock.cycles,mock.readings,mock.threads,mock.messages])source.mockResolvedValue([]);
  mock.save.mockImplementation(async({itemId,title,meta})=>({id:"keep",user_id:"a",item_id:itemId,title,meta_json:JSON.stringify(meta)}));
  mock.remove.mockResolvedValue({id:"keep",user_id:"a"});mock.createNote.mockImplementation(async row=>({...row,id:"note"}));mock.createSkyNote.mockImplementation(async row=>({...row,id:"moment"}));
});
afterEach(()=>vi.useRealTimers());

describe("Sky source and public-return adapters",()=>{
  it("keeps HTML block boundaries, line breaks and literal encoded characters as safe text",()=>{
    expect(skyParagraphs("<p>First &amp; foremost.</p><p>A second thought.<br>Same paragraph.</p>")).toEqual(["First & foremost.","A second thought.\nSame paragraph."]);
    expect(skyParagraphs("A real first paragraph.\n\n**A second** paragraph.")).toEqual(["A real first paragraph.","A second paragraph."]);
    expect(skyParagraphs("&lt;img src=x onerror=bad&gt;")).toEqual(["<img src=x onerror=bad>"]);
  });
  it("adapts the actual 0–100 pairing scale without making missing measures zero",()=>{
    expect([null,undefined,"",70,200,-2,"not a score"].map(skyPairingValue)).toEqual([null,null,null,70,100,0,null]);
  });
  it("reads both real and simulated one-shot response contracts without a transaction",()=>{
    expect(skyCheckoutResult({data:{checkout_url:"https://checkout.stripe.com/a",simulated:false}})).toEqual({url:"https://checkout.stripe.com/a",simulated:false,error:""});
    expect(skyCheckoutResult({thank_you_url:"/OneShotThankYou?simulated=1",simulated:true}).simulated).toBe(true);
    expect(skyCheckoutResult({data:{error:"Unavailable"}}).url).toBe("");
  });
  it("retains exact old edition references and rejects arbitrary or mismatched returns",()=>{
    const fallback="/SkyWorldsDemo?direction=petal-press&section=sky&lesson=earthshine&lessonVersion=9#daily-sky-lesson";
    expect(safeSkySavedReturn("https://evil.example/read",fallback)).toBe(fallback);
    expect(safeSkySavedReturn("/LivingAtelierDemo?lesson=earthshine&lessonVersion=1",fallback)).toBe(fallback);
    expect(safeSkySavedReturn("/LivingAtelierDemo?lesson=earthshine&lessonVersion=9&secret=discard",fallback)).toBe("/LivingAtelierDemo?lesson=earthshine&lessonVersion=9&section=sky#daily-sky-lesson");
  });
});

describe("complete lesson keeps and source-linked notes",()=>{
  it("finds an older Sky edition beyond a full page of other Lifestyle saves",async()=>{
    const full=Array.from({length:150},(_,id)=>({id:String(id),user_id:"a",meta_json:'{"kind":"article"}'}));
    mock.saves.mockImplementation((filter,sort,limit,skip)=>Promise.resolve(skip===150 ? [lessonRow()] : full));
    const {result}=renderHook(()=>useLessonSaves("a"));
    await waitFor(()=>expect(result.current.loading).toBe(false));expect(result.current.rows.map(row=>row.id)).toEqual(["keep-earthshine"]);
    expect(mock.saves).toHaveBeenLastCalledWith({user_id:"a",item_type:"LIFESTYLE"},"-created_at",150,150);
  });
  it("rejects non-advancing pages honestly and ignores foreign returned rows",async()=>{
    mock.saves.mockResolvedValue(Array.from({length:150},(_,id)=>({...lessonRow(),id:String(id),user_id:"b"})));
    const {result}=renderHook(()=>useLessonSaves("a"));await waitFor(()=>expect(result.current.loading).toBe(false));expect(result.current.error).toBe(true);expect(result.current.rows).toEqual([]);
  });
  it("clears a former owner's visible keeps before their late read resolves",async()=>{
    const old=deferred();mock.saves.mockImplementation(({user_id})=>user_id==="a" ? old.promise : Promise.resolve([lessonRow("earthshine","b")]));
    const {result,rerender}=renderHook(({user})=>useLessonSaves(user),{initialProps:{user:"a"}});rerender({user:"b"});
    await waitFor(()=>expect(result.current.rows[0]?.user_id).toBe("b"));await act(async()=>old.resolve([lessonRow()]));expect(result.current.rows[0].user_id).toBe("b");
  });
  it("ends a failed new-owner read with Retry rather than an endless loading state",async()=>{
    mock.saves.mockResolvedValueOnce([lessonRow()]).mockRejectedValue(new Error("offline"));const {result,rerender}=renderHook(({user})=>useLessonSaves(user),{initialProps:{user:"a"}});
    await waitFor(()=>expect(result.current.rows).toHaveLength(1));rerender({user:"b"});await waitFor(()=>expect(result.current.error).toBe(true));expect(result.current.loading).toBe(false);expect(result.current.rows).toEqual([]);
  });
  it("keeps acknowledged state even when the following read is stale, and undo remains exact",async()=>{
    window.history.replaceState({},"","/SkyWorldsDemo?lesson=earthshine&lessonVersion=1");render(<DailySkyLesson userId="a"/>);
    const keep=screen.getByRole("button",{name:"Keep this"});await waitFor(()=>expect(keep).toBeEnabled());fireEvent.click(keep);
    const undo=await screen.findByRole("button",{name:"Kept · undo"});await waitFor(()=>expect(undo).toBeEnabled());fireEvent.click(undo);
    await screen.findByText("Removed from your saves.");expect(mock.remove).toHaveBeenCalledExactlyOnceWith("LIFESTYLE","sky-lesson:earthshine:v1");
    expect(screen.getByRole("button",{name:"Keep this"})).toHaveAttribute("aria-pressed","false");
  });
  it("does not claim a keep when the returned object has another owner or identity",async()=>{
    mock.save.mockResolvedValue({id:"wrong",user_id:"b",item_id:"other"});render(<DailySkyLesson userId="a"/>);
    const keep=screen.getByRole("button",{name:"Keep this"});await waitFor(()=>expect(keep).toBeEnabled());fireEvent.click(keep);
    await screen.findByText(/That didn’t save/);expect(keep).toHaveAttribute("aria-pressed","false");
  });
  it("makes each earlier note on an edition available with an exact Journal return",async()=>{
    window.history.replaceState({},"","/SkyWorldsDemo?lesson=earthshine&lessonVersion=1");mock.journals.mockResolvedValue([
      {id:"note-new",user_id:"a",content_key:"sky-lesson:earthshine:v1",text:"The newer thought."},
      {id:"note-old",user_id:"a",content_key:"sky-lesson:earthshine:v1",text:"The first thought.",session_date:"2026-09-01"},
    ]);render(<DailySkyLesson userId="a"/>);fireEvent.click(await screen.findByText("Earlier note · 2026-09-01"));expect(screen.getByText("The first thought.")).toBeVisible();
    expect(screen.getAllByRole("link",{name:"Open this journal note"}).map(link=>link.getAttribute("href"))).toContain("/Journal?entry=note-old&content_key=sky-lesson%3Aearthshine%3Av1");
  });
  it("does not carry a draft or a late former-owner save into the next account",async()=>{
    const pending=deferred();mock.createNote.mockReturnValue(pending.promise);const {rerender}=render(<DailySkyLesson userId="a"/>);
    fireEvent.click(screen.getByRole("button",{name:"A private note"}));fireEvent.change(screen.getByLabelText("What caught your eye?"),{target:{value:"A's private words."}});fireEvent.click(screen.getByRole("button",{name:"Keep in journal"}));
    rerender(<DailySkyLesson userId="b"/>);fireEvent.click(screen.getByRole("button",{name:"A private note"}));expect(screen.getByLabelText("What caught your eye?")).toHaveValue("");
    await act(async()=>pending.resolve({id:"old",user_id:"a",content_key:skyLessonKey(dailyLessonDeck(localSkyDay())[0]),text:"A's private words."}));
    expect(screen.queryByText("A's private words.")).toBeNull();expect(screen.queryByText(/Kept in your journal/)).toBeNull();
  });
  it("holds an active written draft across midnight until she saves or closes it",async()=>{
    vi.useFakeTimers({toFake:["Date"]});vi.setSystemTime(new Date(2026,9,6,23,59));render(<DailySkyLesson userId="a"/>);
    fireEvent.click(screen.getByRole("button",{name:"A private note"}));fireEvent.change(screen.getByLabelText("What caught your eye?"),{target:{value:"Stay with this lesson."}});
    const title=screen.getByRole("article",{name:"1 of 5"}).textContent;vi.setSystemTime(new Date(2026,9,7,0,1));fireEvent(document,new Event("visibilitychange"));
    expect(screen.getByRole("button",{name:"Read today’s new lesson"})).toBeDisabled();expect(screen.getByRole("article",{name:"1 of 5"})).toHaveTextContent(title);
    expect(screen.getByLabelText("What caught your eye?")).toHaveValue("Stay with this lesson.");
  });
  it("keeps an unavailable edition as an honest safe return rather than an arbitrary URL",async()=>{
    mock.saves.mockResolvedValue([{...lessonRow("earthshine","a",9),meta_json:JSON.stringify({kind:"sky-lesson",lessonId:"earthshine",lessonVersion:9,route:"https://evil.example"})}]);
    render(<SavedSkyLessons userId="a" direction="petal-press" previewRoute="/SkyWorldsDemo"/>);
    const link=await screen.findByRole("link",{name:/Earth lends.*Saved edition/});expect(link.getAttribute("href")).toContain("lessonVersion=9");expect(link.getAttribute("href")).toMatch(/^\/SkyWorldsDemo\?/);
  });
  it("isolates Sky diary drafts on owner changes too",async()=>{
    const {rerender}=render(<PrivateSkyNotes userId="a"/>);fireEvent.change(screen.getByLabelText("Anything you’d like to keep?"),{target:{value:"Not B's words."}});rerender(<PrivateSkyNotes userId="b"/>);
    expect(screen.getByLabelText("Anything you’d like to keep?")).toHaveValue("");expect(mock.createSkyNote).not.toHaveBeenCalled();
  });
});

describe("complete observed reading and existing client contracts",()=>{
  it("keeps real historical reading substance available when cycle fetch fails",async()=>{
    mock.cycles.mockRejectedValue(new Error("offline"));mock.readings.mockResolvedValue([{id:"reading-a",user_id:"a",reading_date:"2026-09-01",headline:"Earlier light",narrative:"<p>First paragraph.</p><p>Second paragraph.</p>",power_title:"A useful thought",power_body:"A whole interpretation.",triad_sun_desc:"The actual Sun interpretation."}]);
    render(<ObservedSkyDiary userId="a" human/>);fireEvent.click(await screen.findByRole("button",{name:/Earlier light/}));expect(screen.getByText("Second paragraph.")).toBeVisible();expect(screen.getByText("A whole interpretation.")).toBeVisible();expect(screen.getByText("The actual Sun interpretation.")).toBeVisible();
    fireEvent.click(screen.getByRole("button",{name:/Cycle dates/}));expect(screen.getByRole("alert")).toHaveTextContent("cycle dates couldn’t load");
  });
  it("clears history ownership and reports reading failure separately from true empty",async()=>{
    mock.readings.mockRejectedValue(new Error("offline"));const {result}=renderHook(()=>useObservedSkyDiary("a"));await waitFor(()=>expect(result.current.loading).toBe(false));expect(result.current.readingError).toContain("couldn’t load");expect(result.current.cycleError).toBe("");
  });
  it("renders the actual pairing narrative and four unsaturated 0–100 measures",async()=>{
    mock.invoke.mockResolvedValue({data:{reading:{id:"pair",user_id:"a",narrative:"First real paragraph.\n\nSecond real paragraph.",talk_score:70,touch_score:45,trust_score:80,grow_score:35}}});
    render(<Compatibility userId="a" complete celestial human/>);fireEvent.change(screen.getByLabelText("Their name"),{target:{value:"Zoë"}});fireEvent.change(screen.getByLabelText("Day"),{target:{value:"16"}});fireEvent.change(screen.getByLabelText("Month"),{target:{value:"5"}});fireEvent.change(screen.getByLabelText("Year"),{target:{value:"1998"}});fireEvent.click(screen.getByRole("button",{name:"Read this pairing"}));
    await screen.findByText("First real paragraph.");expect(screen.getByText("Second real paragraph.")).toBeVisible();for(const value of [70,45,80,35])expect(screen.getByText(`${value}/100`)).toBeVisible();
    expect(screen.getByRole("button",{name:/Copy pairing link/})).toBeVisible();expect(mock.invoke).toHaveBeenCalledExactlyOnceWith("generateCompatibility",{user_id:"a",their_name:"Zoë",their_birthday:"1998-05-16"});
  });
  it("retains a current question while retrying earlier answers",async()=>{
    mock.threads.mockRejectedValueOnce(new Error("offline"));render(<AskTheSky userId="a" complete celestial human/>);await screen.findByRole("alert");fireEvent.change(screen.getByLabelText("Your question for the sky"),{target:{value:"My current question."}});fireEvent.click(screen.getByRole("button",{name:"Reload earlier answers"}));
    await waitFor(()=>expect(screen.queryByRole("alert")).toBeNull());expect(screen.getByLabelText("Your question for the sky")).toHaveValue("My current question.");expect(mock.invoke).not.toHaveBeenCalled();
  });
  it("keeps an answer and reports when the real endpoint could not persist its history",async()=>{
    mock.invoke.mockResolvedValue({data:{answer:"A useful answer.",thread_id:null}});render(<AskTheSky userId="a" complete celestial human/>);fireEvent.change(screen.getByLabelText("Your question for the sky"),{target:{value:"A question."}});fireEvent.click(screen.getByRole("button",{name:"Ask the sky",exact:true}));
    await screen.findByText("A useful answer.");expect(screen.getByRole("status")).toHaveTextContent("couldn’t be kept in earlier answers");
  });
  it("sends the existing one-shot product contract, using only a mocked no-checkout response",async()=>{
    mock.invoke.mockResolvedValue({data:{error:"Fixture: checkout stays closed"}});render(<Atelier userId="a" complete hasAtelier/>);fireEvent.click(screen.getByRole("button",{name:"£19"}));
    await screen.findByRole("alert");expect(mock.invoke).toHaveBeenCalledExactlyOnceWith("createOneShotCheckout",{user_id:"a",product:"year_ahead"});
  });
  it("preserves the actual annual house, planet substance and next birthday",()=>{
    render(<YearMovement complete celestial profections={{profection:{house:7,house_sign:"Taurus",time_lord:"Venus",lit_house_copy:"The authored house theme.",time_lord_copy:"The full planet interpretation.",unlocks_on:"2027-05-16"}}}/>);
    expect(screen.getByText("The authored house theme.")).toBeVisible();fireEvent.click(screen.getByText("More about Venus"));expect(screen.getByText("The full planet interpretation.")).toBeVisible();expect(screen.getByText(/Next turn · 16 May/)).toBeVisible();
  });
});

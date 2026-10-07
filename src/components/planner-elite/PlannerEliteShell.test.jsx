import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import PlannerEliteShell, { plannerReturnLink, preserveBlockNotes } from "./PlannerEliteShell";

const mock=vi.hoisted(()=>({me:vi.fn(),profiles:vi.fn(),blocks:vi.fn(),update:vi.fn(),remove:vi.fn(),empty:vi.fn()}));
vi.mock("@/api/base44Client",()=>({base44:{auth:{me:mock.me},entities:{UserProfile:{filter:mock.profiles},PlannerItems:{filter:mock.blocks,update:mock.update,delete:mock.remove},HabitLogs:{filter:mock.empty},InvisibleTask:{filter:mock.empty},LifeAdminItem:{filter:mock.empty},WearableSync:{filter:mock.empty},DailyCheckins:{filter:mock.empty}}}}));
vi.mock("@/components/planner/MonthlyCalendarCard",()=>({default:()=>null}));
vi.mock("@/components/planner/DayDetailSheet",()=>({default:()=>null}));
// These are artwork-only wrappers; retain the real planner controls and edit sheet.
vi.mock("@/components/brand/PageTop",()=>({FwFloraHero:({title})=><h1>{title}</h1>}));
vi.mock("@/components/brand/ClipboardSlider",()=>({Clipboard:({title,children})=><section aria-label={title}>{children}</section>,ClipboardSlider:({children})=><div>{children}</div>}));
vi.mock("@/components/brand/flora",async importOriginal=>({...await importOriginal(),Bouquet:()=>null,Pollinator:()=>null}));
const block={id:"block",user_id:"owner",title:"Read Pride and Prejudice",time:"09:45",category:"reading",source:"books",ref:"gutenberg:1342",repeat:"weekly",notes:"t:task;d:30;reading note:chapter 4",is_completed:false};
beforeEach(()=>{vi.resetAllMocks();mock.me.mockResolvedValue({id:"owner"});mock.profiles.mockResolvedValue([]);mock.blocks.mockResolvedValue([block]);mock.empty.mockResolvedValue([]);mock.update.mockResolvedValue({});mock.remove.mockResolvedValue();});

describe("Planner precise source returns and note preservation",()=>{
  it("changes the encoded controls while retaining every unrelated note verbatim",()=>{
    expect(preserveBlockNotes("t:rest;d:30;reading note:chapter 4;user words;d:apple;custom:t:focus","task",60)).toBe("t:task;d:60;reading note:chapter 4;user words;d:apple;custom:t:focus");
    expect(preserveBlockNotes("A note with no controls","focus",45)).toBe("t:focus;d:45;A note with no controls");
  });
  it.each([
    [{source:"books",ref:"gutenberg:1342"},"/BookReader?gutenberg_id=1342"],
    [{source:"books",ref:"club:quiet-pages-2"},"/Community?club=quiet-pages-2"],
    [{source:"sky-lesson",ref:"sky-lesson:earthshine:v1"},"/Lifestyle?direction=petal-press&section=sky&lesson=earthshine&lessonVersion=1#daily-sky-lesson"],
    [{source:"sky",ref:"sky-lesson:earthshine:v9"},"/Lifestyle?direction=petal-press&section=sky&lesson=earthshine&lessonVersion=9#daily-sky-lesson"],
    [{source:"sky",ref:"sky-lesson:unknown:v1"},"/Lifestyle?direction=petal-press&section=sky&lesson=unknown&lessonVersion=1#daily-sky-lesson"],
  ])("opens the exact source recorded by %j",(item,href)=>{expect(plannerReturnLink(item)?.href).toBe(href);});
  it.each([{source:"books",ref:"gutenberg:0"},{source:"books",ref:"gutenberg:1342?x=1"},{source:"sky",ref:"sky-lesson:../unknown:v1"},{source:"sky",ref:"sky-lesson:unknown:v9000000"},{source:"unknown",ref:"sky-lesson:earthshine:v1"},{source:"books",ref:"https://evil.example"}])("does not invent a destination for %j",item=>{expect(plannerReturnLink(item)).toBeNull();});
});

describe("Planner actual edit and failure lifecycle",()=>{
  it.each([5,7])("opens and saves an exact joy at its stored %i minutes and precise time",async minutes=>{
    const joy={...block,title:"Let the kettle win",time:"19:10",source:"lifestyle",ref:"joy:quiet-kettle",notes:`d:${minutes};A small pause`,category:"wellbeing"};
    mock.blocks.mockResolvedValue([joy]);render(<PlannerEliteShell/>);
    const source=await screen.findByRole("link",{name:"Open this small joy: Let the kettle win"});
    expect(source).toHaveAttribute("href","/Lifestyle?direction=petal-press&section=good&joy=quiet-kettle");
    await waitFor(()=>expect(screen.queryAllByText("Opening this day…")).toHaveLength(0));
    fireEvent.click(await screen.findByRole("button",{name:/Let the kettle win.*Task/}));
    const title=await screen.findByDisplayValue(joy.title);const fieldset=title.closest("fieldset");
    const selects=within(fieldset).getAllByRole("combobox");
    expect(selects[0]).toHaveValue("19");expect(selects[0]).toHaveDisplayValue("7:10pm");
    expect(selects[1]).toHaveValue(String(minutes));expect(within(selects[1]).getByRole("option",{name:`${minutes} min`,exact:true})).toHaveValue(String(minutes));
    expect(screen.getByRole("link",{name:"Open this small joy",exact:true})).toHaveAttribute("href","/Lifestyle?direction=petal-press&section=good&joy=quiet-kettle");
    fireEvent.change(title,{target:{value:"Tea, then the world"}});fireEvent.click(screen.getByRole("button",{name:"Save",exact:true}));
    await waitFor(()=>expect(mock.update).toHaveBeenCalledWith("block",expect.objectContaining({title:"Tea, then the world",time:"19:10",notes:`t:task;d:${minutes};A small pause`,source:"lifestyle",ref:"joy:quiet-kettle",category:"wellbeing",repeat:"weekly",is_completed:false})));
    await waitFor(()=>expect(screen.queryByDisplayValue("Tea, then the world")).not.toBeInTheDocument());
    expect(screen.getByRole("link",{name:"Open this small joy: Tea, then the world"})).toHaveAttribute("href","/Lifestyle?direction=petal-press&section=good&joy=quiet-kettle");
  },15000);
  it("retains a failed edit draft and retries without losing precise time, notes or source metadata",async()=>{
    mock.update.mockRejectedValueOnce(new Error("offline"));const {container}=render(<PlannerEliteShell/>);
    await screen.findByRole("button",{name:/Read Pride and Prejudice.*Task/});
    await waitFor(()=>expect(screen.queryAllByText("Opening this day…")).toHaveLength(0));
    const editors=[...container.querySelectorAll("button")].filter(button=>button.textContent.includes(block.title));
    expect(editors.map(button=>button.textContent)).toContainEqual(expect.stringContaining("Task"));
    fireEvent.click(editors.find(button=>button.textContent.includes("Task")));
    const title=await screen.findByDisplayValue(block.title);const fieldset=title.closest("fieldset");
    fireEvent.change(title,{target:{value:"One more chapter, please"}});
    fireEvent.change(within(fieldset).getAllByRole("combobox")[1],{target:{value:"60"}});
    fireEvent.click(screen.getByRole("button",{name:"Save",exact:true}));
    expect(await screen.findByRole("alert")).toHaveTextContent("Your draft is still here.");expect(title).toHaveValue("One more chapter, please");
    const expected=expect.objectContaining({title:"One more chapter, please",time:"09:45",notes:"t:task;d:60;reading note:chapter 4",source:"books",ref:"gutenberg:1342",category:"reading",repeat:"weekly",is_completed:false});
    expect(mock.update).toHaveBeenLastCalledWith("block",expected);
    let finish;mock.update.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
    fireEvent.click(screen.getByRole("button",{name:"Save",exact:true}));expect(title).toBeDisabled();expect(screen.getByRole("button",{name:"Saving…"})).toBeDisabled();
    expect(screen.getByRole("link",{name:"Open this book",exact:true})).toHaveAttribute("aria-disabled","true");
    await act(async()=>finish({id:"block"}));await waitFor(()=>expect(screen.queryByDisplayValue("One more chapter, please")).not.toBeInTheDocument());
    expect(mock.update).toHaveBeenLastCalledWith("block",expected);expect(container).toHaveTextContent("One more chapter, please");
    expect(screen.getByRole("link",{name:"Open this book: One more chapter, please"})).toHaveAttribute("href","/BookReader?gutenberg_id=1342");
  },15000);
  it("keeps a block and its exact source available after removal fails",async()=>{
    mock.remove.mockRejectedValue(new Error("offline"));render(<PlannerEliteShell/>);
    await screen.findByRole("button",{name:/Read Pride and Prejudice.*Task/});
    await waitFor(()=>expect(screen.queryAllByText("Opening this day…")).toHaveLength(0));
    fireEvent.click(screen.getByRole("button",{name:/Read Pride and Prejudice.*Task/}));
    await screen.findByDisplayValue(block.title);fireEvent.click(screen.getByRole("button",{name:"Remove",exact:true}));
    expect(await screen.findByRole("alert")).toHaveTextContent("That block couldn’t be removed.");expect(screen.getByDisplayValue(block.title)).toBeVisible();
    expect(screen.getByRole("link",{name:"Open this book",exact:true})).toHaveAttribute("href","/BookReader?gutenberg_id=1342");
  });
  it("does not show another owner's returned block",async()=>{
    mock.blocks.mockResolvedValue([block,{...block,id:"foreign",user_id:"other",title:"A foreign private block"}]);render(<PlannerEliteShell/>);
    await screen.findAllByRole("button",{name:/Read Pride and Prejudice/});expect(screen.queryByText("A foreign private block")).not.toBeInTheDocument();
  });
  it("reports a failed agenda read without pretending the day is empty, and retries",async()=>{
    mock.blocks.mockRejectedValue(new Error("offline"));render(<PlannerEliteShell/>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Your blocks couldn’t load.");
    expect(screen.queryByText(/Nothing planned yet/)).not.toBeInTheDocument();
    mock.blocks.mockResolvedValue([block]);fireEvent.click(screen.getByRole("button",{name:"Try again"}));
    await screen.findAllByRole("button",{name:/Read Pride and Prejudice/});expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
const state = vi.hoisted(() => ({ load: vi.fn(), local: vi.fn(), add: vi.fn(), status: vi.fn(), club: vi.fn(), reached: vi.fn(), pos: null }));
vi.mock("@/components/community/bookshelf", () => ({ loadShelf: state.load, readLocal: state.local, addBook: state.add, setStatus: state.status }));
vi.mock("@/components/community/bookClubConfig", () => ({ loadBookClubPick: state.club, clubReached: state.reached }));
vi.mock("@/components/lifestyle/dailyStory", () => ({ readingPosition: () => state.pos, isChapterRead: () => false }));
vi.mock("@/components/community/readingActivity", () => ({ readingDaySet: () => new Set() }));
vi.mock("./ReadingRoomHeader", () => ({ RestingBook: () => <div aria-hidden="true"/> }));
vi.mock("@/components/lifestyle/booksMonthly", () => ({ monthlySet: () => ({ monthName:"October",featured:{title:"Persuasion",author:"Jane Austen",gutenberg_id:"105",why:"A second chance, beautifully told.",doorway:"comfort"},alternates:[],reveal:null }), DOORWAYS:{comfort:{label:"Comfort"}}, DOORWAY_KEYS:[],getDoorway:()=>"comfort",setDoorway:vi.fn(),passBook:vi.fn() }));
import BooksStoryFocus from "./BooksStoryFocus";
const pick = { pick_key:"actual",title:"Jane Eyre",author:"Charlotte Brontë",gutenberg_id:"1260",host_intro:"Our current read.",checkpoints:[{index:0,label:"First part",jess_prompt:"SECRET QUESTION"}] };
const shelf = [{key:"g:105",gutenberg_id:"105",title:"Persuasion",status:"want"}];
const deferred = () => { let resolve,reject; const promise = new Promise((a,b)=>{resolve=a;reject=b;}); return {promise,resolve,reject}; };
const storage = () => { const entries=new Map(); return {get length(){return entries.size;},key:index=>[...entries.keys()][index] ?? null,getItem:key=>entries.get(String(key)) ?? null,setItem:(key,value)=>entries.set(String(key),String(value)),removeItem:key=>entries.delete(String(key)),clear:()=>entries.clear()}; };
beforeEach(() => { vi.stubGlobal("localStorage", storage()); vi.clearAllMocks(); state.pos=null; state.load.mockResolvedValue(shelf); state.local.mockReturnValue(shelf); state.club.mockResolvedValue(pick); state.reached.mockReturnValue(-1); state.status.mockResolvedValue([{...shelf[0],status:"reading"}]); state.add.mockResolvedValue(shelf); });
afterEach(() => vi.unstubAllGlobals());
it("keeps the complete chapter run, real actions and locked chapters in approved table mode", async () => {
  const pool=Array.from({length:30},(_,i)=>({id:`chapter-${i}`,day_number:i+1,title:`Chapter ${i+1}`,segment_text:"The author’s actual opening."}));
  state.pos={pool,chapter:pool[1],index:1,total:30,unlockedCount:6,waiting:5};
  const read=vi.fn(); const {container}=render(<BooksStoryFocus artDirection="reading-room" userId="alice" onRead={read}/>);
  const run=container.querySelector(".fw-books-run6grid"); expect(run.querySelectorAll("button")).toHaveLength(30);
  const open=screen.getByRole("button",{name:"Chapter 5",exact:true}); expect(open).toHaveStyle({minHeight:"44px",minWidth:"44px"}); fireEvent.click(open); expect(read).toHaveBeenLastCalledWith(4);
  expect(screen.getByRole("button",{name:"Chapter 30 — opens later"})).toBeDisabled();
  fireEvent.click(screen.getByRole("button",{name:/Read straight through/})); expect(read).toHaveBeenLastCalledWith(0);
  await screen.findByText("Jane Eyre");
});
it("uses the actual club edition in scheduling and withholds unreached prompts", async () => {
  const schedule=vi.fn(); render(<BooksStoryFocus userId="alice" onSchedule={schedule}/>);
  await screen.findByText("Jane Eyre"); expect(screen.getByText(/Gutenberg 1260/)).toBeVisible(); expect(screen.queryByText("SECRET QUESTION")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:/Plan the club’s checkpoints/})); expect(schedule).toHaveBeenCalledWith({club:pick});
});
it("shows the actual checkpoint prompt only once the reader reached it", async () => {
  state.reached.mockReturnValue(0); render(<BooksStoryFocus/>); expect(await screen.findByText("SECRET QUESTION")).toBeVisible();
});
it("keeps the previous selected shelf status during a pending write and retains it on error before retry", async () => {
  const gate=deferred(); state.status.mockReturnValueOnce(gate.promise);
  render(<BooksStoryFocus userId="alice"/>); const reading=await screen.findByRole("button",{name:"Reading",exact:true});
  await waitFor(()=>expect(reading).not.toBeDisabled()); fireEvent.click(reading);
  expect(screen.getByRole("button",{name:"Want to read",pressed:true})).toBeDisabled(); expect(reading).toHaveAttribute("aria-pressed","false");
  gate.reject(new Error("offline")); await screen.findByRole("alert");
  expect(screen.getByRole("button",{name:"Want to read",pressed:true})).toBeVisible();
  fireEvent.click(screen.getByRole("button",{name:"Try again"})); await waitFor(()=>expect(screen.getByRole("button",{name:"Reading",pressed:true})).toBeVisible());
  expect(state.status).toHaveBeenCalledTimes(2);
});
it("does not substitute seed when the club cannot be read", async () => {
  state.club.mockRejectedValueOnce(new Error("offline")); render(<BooksStoryFocus/>);
  expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't refresh the book club"); expect(screen.queryByText("Little Women")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Try again"})); expect(await screen.findByText("Jane Eyre")).toBeVisible();
});
it("refuses a stale shelf acknowledgement after changing account", async () => {
  const gate=deferred(); state.status.mockReturnValueOnce(gate.promise);
  const {rerender}=render(<BooksStoryFocus userId="alice"/>);
  const reading=await screen.findByRole("button",{name:"Reading",exact:true}); await waitFor(()=>expect(reading).not.toBeDisabled()); fireEvent.click(reading);
  state.load.mockResolvedValue([]); state.local.mockReturnValue([]); rerender(<BooksStoryFocus userId="bob"/>);
  await waitFor(()=>expect(screen.getByRole("button",{name:"Add to shelf"})).not.toBeDisabled());
  gate.resolve([{...shelf[0],status:"reading"}]); await waitFor(()=>expect(screen.getByRole("button",{name:"Add to shelf"})).toBeVisible());
  expect(screen.queryByRole("button",{name:"Reading",pressed:true})).not.toBeInTheDocument();
});

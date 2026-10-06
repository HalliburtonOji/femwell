import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
const mock = vi.hoisted(() => ({ load:vi.fn(),cohort:vi.fn() }));
vi.mock("@/api/base44Client",()=>({base44:{entities:{},auth:{},functions:{}}}));
vi.mock("@/components/community/bookClubConfig",()=>({SEED_PICK:{pick_key:"seed",title:"Little Women",gutenberg_id:"514"},loadBookClubPick:mock.load,clubReached:()=>-1,setClubReached:vi.fn()}));
vi.mock("@/components/community/readingActivity",()=>({cohortReachedCount:mock.cohort}));
vi.mock("@/components/share/ShareButton",()=>({default:({artifact,label})=><button data-book={artifact.line} data-url={artifact.url}>{label}</button>}));
import { BookClubView, BooksCircleSharedRead, LibraryView } from "./Community";
const pick={pick_key:"current",title:"Persuasion",author:"Jane Austen",gutenberg_id:"105",host_intro:"Our actual current read.",checkpoints:[{index:0,label:"First part",jess_prompt:"HIDDEN PROMPT"}]};
beforeEach(()=>{vi.clearAllMocks();mock.load.mockResolvedValue(pick);mock.cohort.mockResolvedValue(null);});
it("book club retries a read failure without substituting the seed and retains its Back control",async()=>{
  mock.load.mockRejectedValueOnce(new Error("offline")); const back=vi.fn(); render(<MemoryRouter><BookClubView onBack={back}/></MemoryRouter>);
  expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't refresh"); expect(screen.queryByText("Little Women")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Community",exact:true})); expect(back).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button",{name:"Try again"})); expect(await screen.findByText("Persuasion")).toBeVisible();
  expect(screen.getByText("First part")).toBeVisible(); expect(screen.queryByText("HIDDEN PROMPT")).not.toBeInTheDocument(); expect(screen.getByRole("button",{name:/I've read this far/})).toBeVisible();
});
it("keeps a live book with no checkpoints without borrowing prompts from another book",async()=>{
  mock.load.mockResolvedValue({...pick,checkpoints:[]}); render(<MemoryRouter><BookClubView/></MemoryRouter>);
  expect(await screen.findByText("Persuasion")).toBeVisible(); expect(screen.getByText(/checkpoints haven’t been published/)).toBeVisible(); expect(screen.getByRole("button",{name:"Read it in the Library"})).toBeVisible();
});
it("Books circle uses the same canonical loader, retries failure and shows no invented cohort",async()=>{
  mock.load.mockRejectedValueOnce(new Error("offline")); render(<MemoryRouter><BooksCircleSharedRead/></MemoryRouter>);
  await screen.findByRole("alert"); expect(screen.queryByText(/Little Women/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Try again"})); expect(await screen.findByText("The Books circle is reading Persuasion.")).toBeVisible();
  expect(await screen.findByText(/No reading-along count/)).toBeVisible(); expect(mock.cohort).toHaveBeenCalledWith("105",0);
  expect(screen.getByRole("button",{name:"Read it in the Library"})).toBeVisible(); expect(screen.getByRole("button",{name:"The readers’ corner"})).toBeVisible();
});
it("Library room share and exact readers' corner identify the same real club book after retry",async()=>{
  mock.load.mockRejectedValueOnce(new Error("offline")); const corner=vi.fn(); render(<LibraryView onNav={vi.fn()} onOpenCorner={corner}/>);
  await screen.findByRole("alert"); expect(screen.queryByRole("button",{name:"Share this read"})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Try again"})); const share=await screen.findByRole("button",{name:"Share this read"});
  expect(share).toHaveAttribute("data-book","Persuasion"); expect(share).toHaveAttribute("data-url","https://femwells.com/Community?view=bookclub");
  fireEvent.click(screen.getByRole("button",{name:/Readers' corners/})); expect(corner).toHaveBeenCalledExactlyOnceWith("dailyread-105","Persuasion");
  expect(screen.queryByText(/Little Women/)).not.toBeInTheDocument();
});

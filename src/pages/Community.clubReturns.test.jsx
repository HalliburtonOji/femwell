import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PlannerSourceLink from "@/components/planner-v2/PlannerSourceLink";
import { CommunityInner, BookClubView } from "./Community";

const api = vi.hoisted(() => ({ picks:vi.fn(), checkpoints:vi.fn(), notes:vi.fn(), empty:vi.fn(), invoke:vi.fn() }));
vi.mock("@/api/base44Client",()=>({base44:{auth:{me:async()=>({id:"test-owner"})},functions:{invoke:api.invoke},entities:new Proxy({}, {get:(_,name)=>({filter:name==="BookClubPick"?api.picks:name==="ClubCheckpoint"?api.checkpoints:name==="ClubNote"?api.notes:api.empty})})}}));
const pick = key => ({pick_key:key,active:false,title:`Book ${key}`,author:"An author",gutenberg_id:"105",host_intro:"Its own introduction.",trigger_warnings:["Its own content note"]});
beforeEach(()=>{
  vi.clearAllMocks(); localStorage.clear(); window.history.replaceState({},"","/Planner");
  api.empty.mockResolvedValue([]); api.notes.mockResolvedValue([]);
  api.picks.mockImplementation(async query=>[pick(query.pick_key || "current")]);
  api.checkpoints.mockImplementation(async query=>[{pick_key:query.pick_key,index:0,label:`Part ${query.pick_key}`,jess_prompt:`Prompt ${query.pick_key}`}]);
});
function Controls() {
  const navigate=useNavigate(), location=useLocation();
  return <><output aria-label="Route">{location.pathname+location.search+location.hash}</output><button onClick={()=>navigate("/Community?view=bookclub&pick=past-b")}>Another edition</button><button onClick={()=>navigate(-1)}>Route Back</button></>;
}
it("actual Planner source opens its inactive exact edition and the existing reader returns to that query",async()=>{
  const planner=render(<PlannerSourceLink item={{title:"Read the first part",source:"books",ref:"club:past-a"}}/>);
  const href=screen.getByRole("link",{name:/Open the book club/}).getAttribute("href"); planner.unmount();
  render(<MemoryRouter initialEntries={["/Planner",href]} initialIndex={1}><Controls/><Routes><Route path="/Community" element={<CommunityInner/>}/><Route path="/BookReader" element={<p>Exact reader destination</p>}/></Routes></MemoryRouter>);
  expect(await screen.findByText("Book past-a")).toBeVisible();
  expect(api.picks).toHaveBeenCalledExactlyOnceWith({pick_key:"past-a"},"-created_date",1);
  expect(screen.getByText(/Its own content note/)).toBeVisible();
  expect(screen.queryByText("Prompt past-a")).not.toBeInTheDocument();
  expect(localStorage.getItem("fw_club_past-a")).toBeNull(); expect(api.invoke).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button",{name:"Read it in the Library"}));
  expect(screen.getByLabelText("Route")).toHaveTextContent("/BookReader?gutenberg_id=105");
  fireEvent.click(screen.getByRole("button",{name:"Route Back"}));
  expect(await screen.findByText("Book past-a")).toBeVisible();
  expect(screen.getByLabelText("Route")).toHaveTextContent(href);
  fireEvent.click(screen.getByRole("button",{name:"Another edition"}));
  expect(await screen.findByText("Book past-b")).toBeVisible();
  expect(screen.queryByText("Book past-a")).not.toBeInTheDocument();
  expect(localStorage.getItem("fw_club_past-b")).toBeNull(); expect(api.invoke).not.toHaveBeenCalled();
});
it("same-URL browser Back still returns Community home without reopening the requested book",async()=>{
  render(<MemoryRouter initialEntries={["/Community?view=bookclub&pick=past-a"]}><CommunityInner/></MemoryRouter>);
  await screen.findByText("Book past-a");
  await act(async()=>window.dispatchEvent(new PopStateEvent("popstate")));
  await waitFor(()=>expect(screen.queryByText("Book past-a")).not.toBeInTheDocument());
  expect(screen.queryByText(/Finding the club book/)).not.toBeInTheDocument();
});
it("pick changes never carry another checkpoint's draft or notes into reused index zero",async()=>{
  localStorage.setItem("fw_club_past-a","0"); localStorage.setItem("fw_club_past-b","0");
  const mounted=render(<MemoryRouter><BookClubView requestedPickKey="past-a"/></MemoryRouter>);
  await screen.findByText("Book past-a");
  fireEvent.change(screen.getByPlaceholderText("A few words — lurking counts too."),{target:{value:"Draft for A only"}});
  mounted.rerender(<MemoryRouter><BookClubView requestedPickKey="past-b"/></MemoryRouter>);
  await screen.findByText("Book past-b");
  expect(screen.getByPlaceholderText("A few words — lurking counts too.")).toHaveValue("");
  expect(screen.queryByText("Prompt past-a")).not.toBeInTheDocument();
  expect(api.invoke).not.toHaveBeenCalled();
});

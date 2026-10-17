import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ filter: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { entities: { LifestyleItems: { filter: api.filter } } } }));
vi.mock("@/components/lifestyle/DailyStoryReader", () => ({
  TEXT_SIZES: ["xs", "s", "m", "l", "xl"],
  default: ({ source, cleanPreview, onExit }) => <article aria-label="Complete story" data-clean={String(cleanPreview)}>
    {source.items.map((chapter) => <section key={chapter.id}><h2>{chapter.heading}</h2><p>{chapter.body}</p></section>)}
    <button onClick={onExit}>Close story</button>
  </article>,
}));

import FictionReader from "./FictionReader";

const first = { id: "flower-shop", title: "The Flower Shop", summary: "A beginning by the lake.", chapters_json: [
  { title: "First light", body: "The complete first chapter, with its ending intact." },
  { title: "The door", body: "The whole second chapter and its final line." },
] };
const second = { id: "another-story", title: "Another Story", chapters_json: [{ title: "Another opening", body: "Only the new story belongs here." }] };
function deferred() { let resolve; const promise = new Promise((yes) => { resolve = yes; }); return { promise, resolve }; }
function Destination() { const location = useLocation(); return <output aria-label="Destination">{location.pathname + location.search}</output>; }
function SwitchEdition() { const navigate = useNavigate(); return <button onClick={() => navigate("/FictionReader?id=another-story")}>Open another story</button>; }
function open(search = "id=flower-shop", withSwitcher = false) {
  window.history.replaceState({ idx: 0 }, "", `/FictionReader?${search}`);
  return render(<MemoryRouter initialEntries={[`/FictionReader?${search}`]}><Routes>
    <Route path="/FictionReader" element={<>{withSwitcher && <SwitchEdition />}<FictionReader /></>} />
    <Route path="/Lifestyle" element={<Destination />} />
    <Route path="/Saved" element={<Destination />} />
  </Routes></MemoryRouter>);
}

beforeEach(() => {
  vi.resetAllMocks();
  api.filter.mockImplementation(async ({ id }) => id === first.id ? [first] : id === second.id ? [second] : []);
});

describe("routed fiction from Lifestyle and older direct links", () => {
  it("opens every chapter on the clean owner and returns a direct link to main Books", async () => {
    open();
    expect(await screen.findByText("The Flower Shop")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Open book · 2 chapters/ }));
    const reader = screen.getByRole("article", { name: "Complete story" });
    expect(reader).toHaveAttribute("data-clean", "true");
    expect(reader).toHaveTextContent("The complete first chapter, with its ending intact.");
    expect(reader).toHaveTextContent("The whole second chapter and its final line.");
    fireEvent.click(screen.getByRole("button", { name: "Close story" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("status", { name: "Destination" })).toHaveTextContent("/Lifestyle?section=books");
    expect(api.filter).toHaveBeenCalledWith({ id: first.id }, undefined, 1);
  });

  it("keeps the already-completed Saved tab and main Yours returns", async () => {
    open("id=flower-shop&appearance=calm&from=lifestyle-main&via=saved&saved_tab=CONTENT");
    await screen.findByText("The Flower Shop");
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("status", { name: "Destination" })).toHaveTextContent("/Saved?tab=CONTENT&appearance=calm&from=lifestyle-main");
  });

  it("retries a failed exact-story read once without leaving the page", async () => {
    api.filter.mockRejectedValueOnce(new Error("fixture unavailable")).mockResolvedValueOnce([first]);
    open();
    expect(await screen.findByRole("alert")).toHaveTextContent("The story didn't load.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("The Flower Shop")).toBeVisible();
    expect(api.filter).toHaveBeenCalledTimes(2);
  });

  it("does not offer a reader for a record with no words", async () => {
    api.filter.mockResolvedValue([{ id: "flower-shop", title: "A story still being written" }]);
    open();
    expect(await screen.findByText("This story has no readable text yet.")).toBeVisible();
    expect(screen.queryByRole("button", { name: /Open story|Open book/ })).not.toBeInTheDocument();
  });

  it("does not invent a measured page count for one long chapter", async () => {
    api.filter.mockResolvedValue([{ id: "flower-shop", title: "A long story", chapters_json: [
      { title: "Chapter one", body: "A full chapter. ".repeat(1200) },
    ] }]);
    open();
    expect(await screen.findByText("A long story")).toBeVisible();
    expect(screen.getByRole("button", { name: "Open story" })).toBeVisible();
    expect(screen.queryByText(/1 page/)).not.toBeInTheDocument();
  });

  it("retires a late old story when only the query changes in the same app document", async () => {
    const old = deferred();
    api.filter.mockImplementation(({ id }) => id === first.id ? old.promise : Promise.resolve([second]));
    open("id=flower-shop", true);
    fireEvent.click(screen.getByRole("button", { name: "Open another story" }));
    expect(await screen.findByText("Another Story")).toBeVisible();
    await act(async () => { old.resolve([first]); });
    expect(screen.queryByText("The Flower Shop")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Open story/ }));
    expect(screen.getByRole("article", { name: "Complete story" })).toHaveTextContent("Only the new story belongs here.");
    expect(api.filter.mock.calls.map(([query]) => query.id)).toEqual([first.id, second.id]);
  });
});

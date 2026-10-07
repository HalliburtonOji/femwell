import React, { StrictMode } from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ picks: vi.fn(), checkpoints: vi.fn(), invoke: vi.fn(), me: vi.fn(), progress: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: {
  auth: { me: api.me }, functions: { invoke: api.invoke },
  entities: { BookClubPick: { filter: api.picks }, ClubCheckpoint: { filter: api.checkpoints } },
} }));
// Exercise the actual route and actual reflection card. This reader boundary lets tests
// drive chapter/marks events without relying on jsdom's nonexistent pagination layout.
vi.mock("@/components/lifestyle/DailyStoryReader", () => ({ default: (props) => (
  <article aria-label="Controlled book reader" data-book-id={props.bookId}>
    {props.source.items.map(item => <section key={item.id}><h3>{item.heading}</h3><p>{item.body}</p><small>{item.attribution}</small></section>)}
    <button onClick={() => props.onChapterReached(0)}>Reach first chapter</button>
    <button onClick={() => props.onChapterReached(1)}>Reach second chapter</button>
    <button onClick={() => props.onMarks({ currentIndex: 1, bookmarks: [{ chapterIndex: 0, ts: 1 }] })}>Mark second chapter</button>
    <button onClick={props.onReflect}>Reflect on where you are</button>
    <output aria-label="Requested chapter">{props.goToChapter?.index}</output>
  </article>
) }));
vi.mock("@/components/community/readingActivity", () => ({
  recordProgress: api.progress, recordPrediction: vi.fn(), recordClubReflection: vi.fn(),
  hasPredicted: () => false, cohortReachedCount: async () => null, predictionAggregate: async () => [],
}));
vi.mock("@/components/community/communityConfig", () => ({ crisisCheck: () => ({ intercept: false }) }));

import BookReader from "./BookReader";
import { promptFor } from "@/components/community/chapterPrompts";
import { dailyReadClubKey } from "@/components/community/clubsConfig";

const active = { pick_key: "persuasion-current", title: "Persuasion", gutenberg_id: 105, active: true };
const fullText = "CHAPTER I\nFirst chapter, preserved in full.\n\nCHAPTER II\nSecond chapter, also preserved in full.";
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function open(id = 105, strict = false) {
  window.history.replaceState({}, "", `/BookReader?gutenberg_id=${id}`);
  const element = <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><BookReader /></MemoryRouter>;
  return render(strict ? <StrictMode>{element}</StrictMode> : element);
}
const clubLink = () => screen.queryByRole("link", { name: "Discuss this book in the Book Club" });
const cornerLink = () => screen.queryByRole("link", { name: /Others reading this/ });

beforeEach(() => {
  vi.resetAllMocks();
  const storage = new Map();
  vi.stubGlobal("localStorage", {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
  });
  api.me.mockResolvedValue(null);
  api.picks.mockResolvedValue([active]);
  api.checkpoints.mockResolvedValue([]);
  api.invoke.mockImplementation(async (_name, { gutenberg_id }) => ({ data: {
    title: gutenberg_id === 514 ? "Little Women" : "Persuasion", author: "The original author",
    text: fullText, source_url: `https://www.gutenberg.org/ebooks/${gutenberg_id}`,
  } }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("BookReader canonical club identity", () => {
  it("keeps the complete reader open while waiting, then recognises active 105 as the club book", async () => {
    const pick = deferred(); api.picks.mockReturnValue(pick.promise);
    open();
    const reader = await screen.findByRole("article", { name: "Controlled book reader" });
    expect(within(reader).getByText("First chapter, preserved in full.")).toBeInTheDocument();
    expect(clubLink()).toBeNull(); expect(cornerLink()).toBeNull();
    expect(screen.getByRole("status", { name: "Book club lookup" })).toHaveTextContent("Checking the current club book");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Reflect on where you are" })));
    expect(screen.queryByRole("button", { name: "Add to the room" })).toBeNull();
    expect(screen.getByText(/You're in Chapter 1 of Persuasion/)).toBeInTheDocument();
    await act(async () => pick.resolve([active]));
    expect(clubLink()).toHaveAttribute("href", "/Community?view=bookclub");
    expect(screen.getByRole("button", { name: "Add to the room" })).toBeInTheDocument();
    expect(api.picks).toHaveBeenCalledWith({ active: true }, "-created_date", 1);
    expect(api.checkpoints).toHaveBeenCalledWith({ pick_key: active.pick_key }, "index", 150);
    expect(api.invoke).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: "Read at gutenberg.org" })).toHaveAttribute("href", "https://www.gutenberg.org/ebooks/105");
  });

  it("routes 514 to its own corner when 105 is active, while preserving 514's authored prompts and marks", async () => {
    open(514);
    await waitFor(() => expect(cornerLink()).toHaveAttribute("href", `/Community?club=${dailyReadClubKey(514)}&title=Little%20Women`));
    expect(clubLink()).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Mark second chapter" }));
    expect(screen.getByText("Your bookmark · Chapter 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Go to your mark" }));
    expect(screen.getByLabelText("Requested chapter")).toHaveTextContent("0");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Reflect on where you are" })));
    expect(screen.getByText(promptFor("514", 1).prompt)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add to the room" })).toBeNull();
    expect(screen.getByRole("link", { name: "Discuss this in the readers' corner" })).toHaveAttribute("href", cornerLink().getAttribute("href"));
  });

  it("preserves real chapter-boundary reflections for the book edition, independently of the current pick", async () => {
    open(514); await waitFor(() => expect(cornerLink()).not.toBeNull());
    const now = vi.spyOn(Date, "now").mockReturnValue(100000);
    fireEvent.click(screen.getByRole("button", { name: "Reach first chapter" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    now.mockReturnValue(140000);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Reach second chapter" })));
    expect(screen.getByText(promptFor("514", 1).prompt)).toBeInTheDocument();
    expect(api.progress).toHaveBeenLastCalledWith("514", 1, undefined);
    expect(screen.getByText("Guess what comes next")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add to the room" })).toBeNull();
  });

  it("uses seed 514 only after a successful empty active-pick query", async () => {
    api.picks.mockResolvedValue([]); open(514);
    await waitFor(() => expect(clubLink()).not.toBeNull());
    expect(api.picks).toHaveBeenCalledTimes(1);
    expect(api.checkpoints).not.toHaveBeenCalled();
  });

  it("shows a truthful failed lookup and retries only club data without reloading or replacing the book", async () => {
    api.picks.mockRejectedValueOnce(new Error("offline")); open(514);
    const retry = await screen.findByRole("button", { name: "Retry club lookup" });
    const reader = screen.getByRole("article");
    expect(screen.getByRole("status", { name: "Book club lookup" })).toHaveTextContent("couldn't check the current club book");
    expect(clubLink()).toBeNull(); expect(cornerLink()).toBeNull();
    const pending = deferred(); api.picks.mockReturnValueOnce(pending.promise);
    fireEvent.click(retry);
    expect(screen.getByRole("status", { name: "Book club lookup" })).toHaveTextContent("Checking the current club book");
    expect(screen.queryByRole("button", { name: "Retry club lookup" })).toBeNull();
    await act(async () => pending.resolve([active]));
    expect(cornerLink()).not.toBeNull(); expect(clubLink()).toBeNull();
    expect(screen.getByRole("article")).toBe(reader);
    expect(api.invoke).toHaveBeenCalledTimes(1); expect(api.picks).toHaveBeenCalledTimes(2);
  });

  it("waits for matching checkpoints and treats checkpoint failure as failure, not seed", async () => {
    const checkpoints = deferred(); api.checkpoints.mockReturnValueOnce(checkpoints.promise);
    open(); await screen.findByRole("article");
    expect(clubLink()).toBeNull(); expect(cornerLink()).toBeNull();
    await act(async () => checkpoints.reject(new Error("checkpoint read failed")));
    fireEvent.click(await screen.findByRole("button", { name: "Retry club lookup" }));
    await waitFor(() => expect(clubLink()).not.toBeNull());
    expect(api.invoke).toHaveBeenCalledTimes(1);
  });

  it("does not advertise a club after a malformed active response", async () => {
    api.picks.mockResolvedValue([{ active: true }]); open(514);
    await screen.findByRole("button", { name: "Retry club lookup" });
    expect(clubLink()).toBeNull(); expect(cornerLink()).toBeNull();
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("ignores a late superseded StrictMode lookup", async () => {
    const stale = deferred(); api.picks.mockReturnValueOnce(stale.promise).mockResolvedValueOnce([active]);
    open(105, true); await waitFor(() => expect(clubLink()).not.toBeNull());
    await act(async () => stale.resolve([]));
    expect(clubLink()).not.toBeNull(); expect(cornerLink()).toBeNull();
  });

  it("a lookup completing after unmount cannot replace a newly opened reader's identity", async () => {
    const stale = deferred(); api.picks.mockReturnValueOnce(stale.promise);
    const first = open(514); await screen.findByRole("article"); first.unmount();
    open(105); await waitFor(() => expect(clubLink()).not.toBeNull());
    await act(async () => stale.resolve([]));
    expect(clubLink()).not.toBeNull(); expect(screen.getByRole("article")).toHaveAttribute("data-book-id", "105");
  });

  it("preserves book-load error and manual book retry independently of successful club lookup", async () => {
    api.invoke.mockResolvedValueOnce({ data: { error: "source unavailable" } }); open();
    fireEvent.click(await screen.findByRole("button", { name: "Tap to try again" }));
    await screen.findByRole("article");
    expect(clubLink()).not.toBeNull(); expect(api.invoke).toHaveBeenCalledTimes(2);
    expect(api.picks).toHaveBeenCalledTimes(1);
  });

  it("does not request club or book data for an invalid book id", async () => {
    open("invalid"); await screen.findByText("We couldn't open this book just now.");
    expect(api.picks).not.toHaveBeenCalled(); expect(api.invoke).not.toHaveBeenCalled();
  });
});

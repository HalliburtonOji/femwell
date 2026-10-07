import React, { StrictMode } from "react";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
vi.mock("@/components/lifestyle/DailyStoryReader", async (importOriginal) => ({ ...(await importOriginal()), default: (props) => (
  <article aria-label="Controlled book reader" data-book-id={props.bookId} data-clean-preview={props.cleanPreview ? "true" : "false"}>
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

import BookReader, { splitChapters } from "./BookReader";
import { promptFor } from "@/components/community/chapterPrompts";
import { dailyReadClubKey } from "@/components/community/clubsConfig";

const active = { pick_key: "persuasion-current", title: "Persuasion", gutenberg_id: 105, active: true };
const fullText = "CHAPTER I\nFirst chapter, preserved in full.\n\nCHAPTER II\nSecond chapter, also preserved in full.";
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function open(id = 105, strict = false, cleanPreview = false) {
  window.history.replaceState({}, "", `/BookReader?gutenberg_id=${id}`);
  const element = <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><BookReader cleanPreview={cleanPreview} /></MemoryRouter>;
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

describe("daily marks at British summer-time midnight", () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

  it.each([false, true])("starts a fresh reader on chapter one at 00:15 BST (clean=%s)", async (cleanPreview) => {
    vi.stubEnv("TZ", "Europe/London");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-07T23:15:00Z"));
    expect(new Date().getHours()).toBe(0);
    expect(new Date().getDate()).toBe(8);
    open(37106, false, cleanPreview);
    await screen.findByRole("article", { name: "Controlled book reader" });
    expect(localStorage.getItem("fw_dailyread_start_37106")).toBe("2026-10-08");
    expect(screen.getByText(`${cleanPreview ? "Daily read" : "Today's daily read"} · Chapter 1`)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Mark second chapter" }));
    expect(screen.getByText(cleanPreview ? "Your place: chapter 2 · 1 chapter beyond the daily mark." : "You're ahead of the daily read — lovely.")).toBeVisible();
  });

  it("advances an existing previous-day start without rewriting its saved date", async () => {
    vi.stubEnv("TZ", "Europe/London");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-07T23:15:00Z"));
    localStorage.setItem("fw_dailyread_start_37106", "2026-10-07");
    open(37106, false, true);
    await screen.findByRole("article", { name: "Controlled book reader" });
    expect(screen.getByText("Daily read · Chapter 2")).toBeVisible();
    expect(localStorage.getItem("fw_dailyread_start_37106")).toBe("2026-10-07");
  });
});

describe("Ideas-only reader margin preview", () => {
  it("keeps the exact long-title book, chapter context and full prose through note save and close without another download", async () => {
    const title = "Little Women; Or, Meg, Jo, Beth, and Amy";
    api.invoke.mockResolvedValueOnce({ data: { title, author: "Louisa May Alcott", text: fullText, source_url: "https://www.gutenberg.org/ebooks/37106" } });
    open(37106, false, true);
    const reader = await screen.findByRole("article", { name: "Controlled book reader" });
    expect(reader).toHaveAttribute("data-book-id", "37106");
    expect(reader).toHaveAttribute("data-clean-preview", "true");
    expect(screen.getByRole("heading", { name: title, exact: true })).toBeVisible();
    expect(within(reader).getByText("First chapter, preserved in full.")).toBeVisible();
    expect(within(reader).getByText("Second chapter, also preserved in full.")).toBeVisible();
    await waitFor(() => expect(screen.getByRole("link", { name: "Reader’s corner · spoiler-safe" })).toHaveAttribute("href", `/Community?club=${dailyReadClubKey(37106)}&title=${encodeURIComponent(title)}`));
    expect(screen.getByRole("link", { name: "Project Gutenberg", exact: true })).toHaveAttribute("href", "https://www.gutenberg.org/ebooks/37106");
    expect(screen.getByText("Finding your place…")).toBeVisible();
    expect(screen.getByText("Finding your bookmark…")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Mark second chapter" }));
    expect(screen.getByText("Your place: chapter 2 · 1 chapter beyond the daily mark.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Open marked chapter" }));
    expect(screen.getByLabelText("Requested chapter")).toHaveTextContent("0");
    const opener = screen.getByRole("button", { name: "Reflect on where you are" });
    opener.focus(); fireEvent.click(opener);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(`${title} · CHAPTER II`)).toBeVisible();
    expect(within(dialog).getByText("A line, a character, a feeling — what’s stayed with you?")).toBeVisible();
    fireEvent.change(within(dialog).getByRole("textbox", { name: "Your note" }), { target: { value: "A kept line, from this exact edition." } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Keep my note" }));
    expect(localStorage.getItem("fw_read_reflect_37106_1")).toBe("A kept line, from this exact edition.");
    expect(within(dialog).getByRole("status")).toHaveTextContent("Kept on this device.");
    fireEvent.click(within(dialog).getByRole("button", { name: "Close", exact: true }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(opener).toHaveFocus());
    expect(screen.getByRole("article", { name: "Controlled book reader" })).toBe(reader);
    expect(api.invoke).toHaveBeenCalledExactlyOnceWith("fetchGutenbergBook", { gutenberg_id: 37106 });
  });

  it("preserves the original frame and note wording on the canonical main reader", async () => {
    open(37106);
    const reader = await screen.findByRole("article", { name: "Controlled book reader" });
    expect(reader).toHaveAttribute("data-clean-preview", "false");
    expect(reader.closest(".fw-book-preview")).toBeNull();
    expect(screen.queryByText("Ideas · reader preview")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reflect on where you are" }));
    expect(screen.getByRole("button", { name: "Keep this for me" })).toBeVisible();
    expect(screen.getByText(/You're in Chapter 1 of Persuasion/)).toBeVisible();
  });

  it("retains the clean frame through actual loading, structured error and explicit retry", async () => {
    const pending = deferred(); api.invoke.mockReturnValueOnce(pending.promise);
    const view = open(37106, false, true);
    expect(screen.getByText("Loading the book…").closest(".fw-book-preview")).not.toBeNull();
    await act(async () => pending.resolve({ data: { error: "Source unavailable" } }));
    expect(screen.getByText("We couldn’t open this book.").closest(".fw-book-preview")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Tap to try again" }));
    expect(await screen.findByRole("article", { name: "Controlled book reader" })).toHaveAttribute("data-clean-preview", "true");
    expect(api.invoke).toHaveBeenCalledTimes(2);
    view.unmount();
  });

  it("preserves honest empty text and all authored reflection context for the correct edition", async () => {
    api.invoke.mockResolvedValueOnce({ data: { title: "Empty source", text: "" } });
    const empty = open(37106, false, true);
    expect((await screen.findByText("This book has no readable text.")).closest(".fw-book-preview")).not.toBeNull();
    empty.unmount();
    open(514, false, true);
    await screen.findByRole("article", { name: "Controlled book reader" });
    fireEvent.click(screen.getByRole("button", { name: "Reflect on where you are" }));
    expect(screen.getByText(promptFor("514", 0).prompt)).toBeVisible();
    expect(screen.queryByText("A line, a character, a feeling — what’s stayed with you?")).toBeNull();
  });
});

// Public-domain primary sources downloaded 2026-10-07 from
// https://www.gutenberg.org/cache/epub/{id}/pg{id}.txt. Preserve the complete
// fixtures; production's existing fetch function strips only PG boilerplate.
function editionText(id) {
  return readFileSync(`src/pages/__fixtures__/gutenberg-${id}.txt`, "utf8")
    .split(/\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i)[1]
    .split(/\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i)[0].trim();
}
const normalText = text => text.replace(/\s+/g, " ").trim();
describe("actual Gutenberg chapter structure and complete source preservation", () => {
  it.each([
    [37106, 47, /^[ \t]*[IVXLCDM]+\.[ \t]*\r?$/gm],
    [514, 47, /^CHAPTER [A-Z-]+[ \t]*\r?$/gm],
    [1342, 61, /^Chapter [IVXLCDM]+\.?\]?[ \t]*\r?$/gim],
  ])("finds the actual %i edition's %i chapters and retains every other source word in order", (id, count, actualHeadingLines) => {
    const source = editionText(id), result = splitChapters(source);
    expect(result.real).toBe(true);
    expect(result.chapters).toHaveLength(count);
    expect(result.chapters.map(ch => ch.id)).toEqual(Array.from({ length: count }, (_, i) => `ch-${i + 1}`));
    // Compare the entire prose without dumping a megabyte-long diff on a failure.
    const digest = value => createHash("sha256").update(normalText(value)).digest("hex");
    expect(digest(result.chapters.map(ch => ch.body).join("\n"))).toBe(digest(source.replace(actualHeadingLines, "")));
    expect(Math.max(...result.chapters.map(ch => ch.body.length))).toBeLessThan(100000);
  });

  it("retains front matter and a short middle chapter without shifting edition chapter indexes", () => {
    const source = `An author's preface, to be kept.\n\nCHAPTER I\n${"Long first body. ".repeat(100)}\n\nCHAPTER II\nOne brief but complete chapter.\n\nCHAPTER III\n${"Long third body. ".repeat(100)}`;
    const result = splitChapters(source);
    expect(result.real).toBe(true); expect(result.chapters).toHaveLength(3);
    expect(result.chapters[0].body).toContain("An author's preface, to be kept.");
    expect(result.chapters[1]).toMatchObject({ id: "ch-2", day_number: 2, body: "One brief but complete chapter." });
    expect(normalText(result.chapters.map(ch => ch.body).join("\n"))).toBe(normalText(source.replace(/^CHAPTER [IVX]+$/gm, "")));
  });

  it("does not turn a contents label and a transcriber sentence into chapters", () => {
    const source = "CHAPTER\nA contents explanation.\n\nChapter Ten of that novel has a note.\nAll the prose remains here.";
    const result = splitChapters(source);
    expect(result.real).toBe(false);
    expect(normalText(result.chapters.map(ch => ch.body).join(" "))).toBe(normalText(source));
  });

  it("requires coherent numbering instead of any two isolated Roman labels", () => {
    const result = splitChapters("I.\nA quoted list.\n\nVIII.\nAnother quoted item.");
    expect(result.real).toBe(false);
  });

  it("retains titled chapter headings and the complete run beyond the old 120-match cap", () => {
    const source = Array.from({ length: 140 }, (_, i) => `Chapter ${i + 1} — A room\nBody of chapter ${i + 1}.`).join("\n\n");
    const result = splitChapters(source);
    expect(result.real).toBe(true); expect(result.chapters).toHaveLength(140);
    expect(result.chapters[139]).toMatchObject({ id: "ch-140", heading: "Chapter 140 — A room", body: "Body of chapter 140." });
  });
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

  it("feeds all 47 real illustrated-edition chapters into the existing reader without borrowing another edition's prompts", async () => {
    api.invoke.mockResolvedValueOnce({ data: { text: editionText(37106), title: "Little Women, illustrated", author: "Louisa May Alcott" } });
    open(37106);
    const reader = await screen.findByRole("article", { name: "Controlled book reader" });
    expect(within(reader).getAllByRole("heading")).toHaveLength(47);
    expect(within(reader).getByRole("heading", { name: "Chapter 47", exact: true })).toBeVisible();
    expect(reader).toHaveAttribute("data-book-id", "37106");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Reflect on where you are" })));
    expect(screen.getByText(/You're in Chapter 1 of Little Women, illustrated/)).toBeVisible();
    expect(screen.queryByText(promptFor("514", 0).prompt)).toBeNull();
    expect(api.invoke).toHaveBeenCalledExactlyOnceWith("fetchGutenbergBook", { gutenberg_id: 37106 });
  });
});

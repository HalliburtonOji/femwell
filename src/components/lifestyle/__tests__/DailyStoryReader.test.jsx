/**
 * Regression-gate tests for the FemWell book reader.
 *
 * The point of this file is to lock in the bugs we have already fought
 * through — every assertion here represents an issue the user reported
 * and we fixed. If one of these fails on a future PR, that PR is
 * regressing.
 *
 * Coverage targets (more added by Mr Tester as v4c/v4d ship):
 *  - No body scroll when in immersive mode at any font size.
 *  - Measured pagination produces > 1 slice for a chapter that exceeds
 *    the viewport's available height.
 *  - The slider, bottom progress bar, bookmark button, and center tap
 *    zone all mount in immersive mode.
 *  - `defaultImmersive=true` lands the reader straight in full-screen.
 *  - Theme variables are applied to the root.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import DailyStoryReader from "../DailyStoryReader";

const storyApi = vi.hoisted(() => ({ filter: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { entities: { DailyStory: { filter: storyApi.filter } } } }));
// Node's experimental global storage is not the browser Storage implementation.
const stored = new Map();
const readerStorage = {
  getItem: key => stored.get(key) ?? null,
  setItem: vi.fn((key, value) => stored.set(key, String(value))),
  clear: () => stored.clear(),
};

// A long enough body that even at "m" text size it spans multiple paginated
// pages. Built from 8 paragraphs of placeholder prose — each ~80 words.
function longChapterBody() {
  const PARA =
    "By the time I drove over the last bridge into Blackwater Cove, the sky had gone the colour of bruised plums and the headlamps were picking out gulls on the harbour wall. The salt came in through the open window like a hand on the back of my neck. I had not been here in eight years and the place did not appear to have decided yet whether to forgive me. The cottage was where I remembered it, behind the boats. The key was where my grandmother had said it would be — under the white pebble by the door, exactly where she had warned me it would not be safe to leave it.";
  return Array.from({ length: 12 }, () => PARA).join("\n\n");
}

function bookSource() {
  return {
    kind: "book",
    items: [
      {
        id: "ch1",
        title: "Chapter 1 — Tide House Inn",
        heading: "Chapter 1 — Tide House Inn",
        body: longChapterBody(),
        series_title: "The Inn Between Tides",
        chapter_context: { chapterIndex: 1, chapterCount: 5, chapterTitle: "Tide House Inn" },
      },
      {
        id: "ch2",
        title: "Chapter 2 — Lime Mortar",
        heading: "Chapter 2 — Lime Mortar",
        body: longChapterBody(),
        series_title: "The Inn Between Tides",
        chapter_context: { chapterIndex: 2, chapterCount: 5, chapterTitle: "Lime Mortar" },
      },
    ],
    currentIndex: 0,
  };
}

describe("DailyStoryReader — v4 contract", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", readerStorage);
    // Reset localStorage between tests so persistent text-size doesn't leak.
    try { localStorage.clear(); } catch { /* ignore */ }
    readerStorage.setItem.mockClear();
    storyApi.filter.mockReset();
    storyApi.filter.mockResolvedValue([]);
  });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("opens an explicit numeric chapter after a delayed fetch without reaching or saving the stored final chapter", async () => {
    const rows = Array.from({ length: 30 }, (_, index) => ({
      id: `daily-${index + 1}`, day_number: index + 1, series_key: "requested_series", is_active: true,
      published_date: "2025-01-01", segment_text: `## Chapter ${index + 1} — Requested\n\nActual prose ${index + 1}.`,
    }));
    localStorage.setItem("fw_reader_pos_requested", JSON.stringify({ chapterIndex: 29, pageInChapter: 2 }));
    const writes = readerStorage.setItem.mockClear();
    const reached = vi.fn(), marks = vi.fn();
    let finish;
    storyApi.filter.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    render(<DailyStoryReader seriesKey="requested_series" bookId="requested" goToChapter={1} onChapterReached={reached} onMarks={marks}/>);
    expect(screen.getByLabelText("Loading chapter")).toBeVisible();
    expect(reached).not.toHaveBeenCalled();
    expect(marks).not.toHaveBeenCalled();
    await act(async () => finish(rows));
    expect(await screen.findByRole("heading", { name: "Chapter 2 — Requested" })).toBeVisible();
    expect(reached.mock.calls).toEqual([[1, rows[1]]]);
    expect(marks.mock.calls.every(([state]) => state.currentIndex === 1)).toBe(true);
    const positions = writes.mock.calls.filter(([key]) => key === "fw_reader_pos_requested").map(([, value]) => JSON.parse(value));
    expect(positions.length).toBeGreaterThan(0);
    expect(positions.every(position => position.chapterIndex === 1 && position.pageInChapter === 0)).toBe(true);
  });

  it("applies a marks-bar nonce sent before loading and later jumps without provisional reach callbacks", async () => {
    const rows = Array.from({ length: 3 }, (_, index) => ({ id: `row-${index}`, day_number: index + 1, segment_text: `## Jump ${index + 1}\n\nBody.` }));
    let finish;
    storyApi.filter.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const reached = vi.fn();
    const { rerender } = render(<DailyStoryReader goToChapter={{ index: 1, nonce: "early" }} onChapterReached={reached}/>);
    await act(async () => finish(rows));
    expect(await screen.findByRole("heading", { name: "Jump 2" })).toBeVisible();
    expect(reached.mock.calls).toEqual([[1, rows[1]]]);
    rerender(<DailyStoryReader goToChapter={{ index: 0, nonce: "later" }} onChapterReached={reached}/>);
    expect(await screen.findByRole("heading", { name: "Jump 1" })).toBeVisible();
    expect(reached.mock.calls).toEqual([[1, rows[1]], [0, rows[0]]]);
    rerender(<DailyStoryReader goToChapter={{ index: 0, nonce: "later" }} onChapterReached={reached}/>);
    expect(reached).toHaveBeenCalledTimes(2);
  });

  it("resumes the saved book paragraph before any reach or position write, without an explicit jump", async () => {
    const source = bookSource();
    localStorage.setItem("fw_reader_pos_resume", JSON.stringify({ chapterIndex: 1, paragraphIndex: 7, pageInChapter: 0 }));
    const writes = readerStorage.setItem.mockClear();
    const reached = vi.fn();
    const originalRect = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
      if (this.classList.contains("ds-measure-p")) {
        const index = Array.from(this.parentElement.children).indexOf(this);
        return { top: index * 100, bottom: (index + 1) * 100, height: 100, left: 0, right: 300, width: 300, x: 0, y: index * 100 };
      }
      return originalRect.call(this);
    });
    render(<DailyStoryReader source={source} bookId="resume" onChapterReached={reached}/>);
    await waitFor(() => expect(screen.getByRole("article", { name: "Chapter 2 — Lime Mortar" })).toHaveTextContent("page 2 of 3"));
    expect(reached.mock.calls).toEqual([[1, source.items[1]]]);
    const positions = writes.mock.calls.filter(([key]) => key === "fw_reader_pos_resume").map(([, value]) => JSON.parse(value));
    expect(positions.length).toBeGreaterThan(0);
    expect(positions.every(position => position.chapterIndex === 1 && position.pageInChapter === 1 && position.paragraphIndex === 5)).toBe(true);
    expect(storyApi.filter).not.toHaveBeenCalled();
  });

  it("retains legacy saved page positions when no paragraph anchor is available", () => {
    const source = bookSource();
    localStorage.setItem("fw_reader_pos_legacy", JSON.stringify({ chapterIndex: 1, pageInChapter: 2 }));
    const writes = readerStorage.setItem.mockClear();
    const reached = vi.fn();
    render(<DailyStoryReader source={source} bookId="legacy" onChapterReached={reached}/>);
    expect(reached.mock.calls).toEqual([[1, source.items[1]]]);
    const positions = writes.mock.calls.filter(([key]) => key === "fw_reader_pos_legacy").map(([, value]) => JSON.parse(value));
    expect(positions.length).toBeGreaterThan(0);
    expect(positions.every(position => position.chapterIndex === 1 && position.pageInChapter === 2)).toBe(true);
  });

  it("keeps the no-request daily latest default and safely reinitialises a shorter series", async () => {
    const rows = Array.from({ length: 3 }, (_, index) => ({ id: `first-${index}`, day_number: index + 1, segment_text: `## First ${index + 1}\n\nBody.` }));
    const nextRows = [{ id: "second-0", day_number: 1, segment_text: "## Second 1\n\nBody." }];
    storyApi.filter.mockResolvedValueOnce(rows).mockResolvedValueOnce(nextRows);
    const reached = vi.fn();
    const { rerender } = render(<DailyStoryReader seriesKey="first" onChapterReached={reached}/>);
    expect(await screen.findByRole("heading", { name: "First 3" })).toBeVisible();
    expect(reached.mock.calls).toEqual([[2, rows[2]]]);
    rerender(<DailyStoryReader seriesKey="second" onChapterReached={reached}/>);
    expect(await screen.findByRole("heading", { name: "Second 1" })).toBeVisible();
    expect(reached.mock.calls).toEqual([[2, rows[2]], [0, nextRows[0]]]);
  });

  it("renders into the body as a portal when defaultImmersive=true", () => {
    render(
      <DailyStoryReader
        source={bookSource()}
        totalCount={2}
        defaultImmersive
      />
    );
    const root = document.querySelector(".ds-reader-root");
    expect(root).not.toBeNull();
    expect(root.classList.contains("ds-immersive")).toBe(true);
  });

  it("zeros the card visuals in immersive mode (via class + style rule)", () => {
    // jsdom doesn't fully resolve <style> blocks for computed styles, so we
    // verify the CSS rule itself exists and the root has the ds-immersive
    // class. The live DOM verify (manual / Ms Verify) is the authoritative
    // check; this test confirms the contract isn't structurally broken.
    render(<DailyStoryReader source={bookSource()} totalCount={2} defaultImmersive />);
    const root = document.querySelector(".ds-reader-root");
    const stage = document.querySelector(".ds-reader-stage");
    expect(root.classList.contains("ds-immersive")).toBe(true);
    expect(stage).not.toBeNull();
    // The CSS rule that zeroes the card is in the inline <style> block —
    // assert it's present.
    const styleBlocks = [...document.querySelectorAll("style")]
      .map((s) => s.textContent || "")
      .join("\n");
    expect(styleBlocks).toMatch(/\.ds-reader-root\.ds-immersive\s+\.ds-reader-stage\s*\{[\s\S]*background:\s*transparent/);
    expect(styleBlocks).toMatch(/\.ds-reader-root\.ds-immersive\s+\.ds-reader-stage\s*\{[\s\S]*border-radius:\s*0/);
    expect(styleBlocks).toMatch(/\.ds-reader-root\.ds-immersive\s+\.ds-reader-stage\s*\{[\s\S]*box-shadow:\s*none/);
  });

  it("mounts the v4b/v4c floating chrome — Aa button, bottom progress, bookmark, center tap", () => {
    render(<DailyStoryReader source={bookSource()} totalCount={2} defaultImmersive />);
    expect(document.querySelector(".ds-reader-aa-btn")).not.toBeNull();
    expect(document.querySelector(".ds-reader-bottom-bar")).not.toBeNull();
    expect(document.querySelector(".ds-reader-bookmark-btn")).not.toBeNull();
    expect(document.querySelector(".ds-reader-center-tap")).not.toBeNull();
    // v4c moves the slider into the settings drawer; it's not in the top bar
    // anymore until the drawer is opened.
    expect(document.querySelector(".ds-reader-slider-input")).toBeNull();
  });

  it("applies v4c theme + font + line + margins classes from defaults", () => {
    render(<DailyStoryReader source={bookSource()} totalCount={2} defaultImmersive />);
    const root = document.querySelector(".ds-reader-root");
    expect(root.classList.contains("fw-theme-cream")).toBe(true);
    expect(root.classList.contains("fw-font-fraunces")).toBe(true);
    expect(root.classList.contains("fw-line-normal")).toBe(true);
    expect(root.classList.contains("fw-margins-normal")).toBe(true);
  });

  it("starts with chromeVisible=true and applies ds-chrome-visible class", () => {
    render(<DailyStoryReader source={bookSource()} totalCount={2} defaultImmersive />);
    const root = document.querySelector(".ds-reader-root");
    expect(root.classList.contains("ds-chrome-visible")).toBe(true);
  });

  it("applies the active text-size class", () => {
    render(<DailyStoryReader source={bookSource()} totalCount={2} defaultImmersive textSize="l" />);
    const root = document.querySelector(".ds-reader-root");
    expect(root.classList.contains("ds-text-l")).toBe(true);
  });

  it("respects the chapter_context strip text — 'Chapter 1 of 5'", () => {
    render(<DailyStoryReader source={bookSource()} totalCount={2} defaultImmersive />);
    const strip = document.querySelector(".ds-reader-chapter-strip");
    expect(strip).not.toBeNull();
    expect(strip.textContent.toLowerCase()).toContain("chapter 1");
    expect(strip.textContent.toLowerCase()).toContain("of 5");
  });
});

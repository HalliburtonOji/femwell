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
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

  function measuredSource(kind = "book") {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const originalRect = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
      if (this.classList.contains("ds-reader-stage")) return { top: 0, bottom: 600, height: 600 };
      if (this.classList.contains("ds-reader-body")) return { top: 100, bottom: 600, height: 500 };
      if (this.classList.contains("ds-measure-p")) {
        const index = Array.from(this.parentElement.children).indexOf(this);
        return { top: index * 300, bottom: (index + 1) * 300, height: 300 };
      }
      return originalRect.call(this);
    });
    return { kind, currentIndex: 0, items: [
      { id: "measured-1", heading: "First chapter", body: "The first page opens beside the harbour.\n\nThe second page follows the path uphill.\n\nThe third page reaches the cottage.", chapter_context: { chapterIndex: 1, chapterCount: 2 } },
      { id: "measured-2", heading: "Second chapter", body: "The next chapter opens the door.", chapter_context: { chapterIndex: 2, chapterCount: 2 } },
    ] };
  }
  const visibleProse = () => document.querySelector(".ds-reader-body").textContent;
  const footer = () => within(document.querySelector(".ds-reader-nav"));

  it("enables footer Previous inside the first measured chapter and returns to the exact prior prose", () => {
    const source = measuredSource();
    render(<DailyStoryReader source={source} />);
    expect(screen.getByRole("article")).toHaveTextContent("page 1 of 3");
    const firstProse = visibleProse();
    expect(footer().getByRole("button", { name: /Previous/ })).toBeDisabled();
    expect(document.querySelector(".ds-reader-tap-left")).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(document.querySelector(".ds-reader-tap-left"));
    expect(visibleProse()).toBe(firstProse);
    fireEvent.click(footer().getByRole("button", { name: /Next/ }));
    expect(visibleProse()).toBe("The second page follows the path uphill.");
    expect(footer().getByRole("button", { name: /Previous/ })).toBeEnabled();
    fireEvent.click(footer().getByRole("button", { name: /Previous/ }));
    expect(visibleProse()).toBe(firstProse);
    expect(footer().getByRole("button", { name: /Previous/ })).toBeDisabled();
  });

  it("names page turns and chapter crossings accurately in both footer and tap zones", () => {
    const source = measuredSource(); render(<DailyStoryReader source={source} />);
    expect(screen.getAllByRole("button", { name: "Next page" })).toHaveLength(2);
    fireEvent.click(footer().getByRole("button", { name: "Next page" }));
    expect(screen.getAllByRole("button", { name: "Previous page" })).toHaveLength(2);
    expect(document.querySelector(".ds-reader-tap-left")).toHaveAttribute("aria-disabled", "false");
    fireEvent.click(document.querySelector(".ds-reader-tap-right"));
    expect(visibleProse()).toBe("The third page reaches the cottage.");
    expect(screen.getAllByRole("button", { name: "Next chapter" })).toHaveLength(2);
    fireEvent.click(footer().getByRole("button", { name: "Next chapter" }));
    expect(visibleProse()).toBe("The next chapter opens the door.");
    expect(screen.getAllByRole("button", { name: "Previous chapter" })).toHaveLength(2);
    expect(footer().getByRole("button", { name: "Previous chapter" })).toBeEnabled();
  });

  it("keeps locked next navigation inert while Back to chapter returns to its last measured page", () => {
    const source = measuredSource("daily_story"); source.items = source.items.slice(0, 1);
    render(<DailyStoryReader source={source} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.click(footer().getByRole("button", { name: "Next chapter" }));
    expect(screen.getByText("Reveals at midnight")).toBeVisible();
    expect(footer().getByRole("button", { name: "Next chapter" })).toBeDisabled();
    expect(document.querySelector(".ds-reader-tap-right")).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(footer().getByRole("button", { name: "Next chapter" }));
    fireEvent.click(document.querySelector(".ds-reader-tap-right"));
    expect(screen.getByText("Reveals at midnight")).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Back to chapter" })).toHaveLength(2);
    fireEvent.click(footer().getByRole("button", { name: "Back to chapter" }));
    expect(visibleProse()).toBe("The third page reaches the cottage.");
    expect(footer().getByRole("button", { name: "Previous page" })).toBeEnabled();
    const root = document.querySelector(".ds-reader-root");
    fireEvent.touchStart(root, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(root, { changedTouches: [{ clientX: 230, clientY: 110 }] });
    expect(visibleProse()).toBe("The second page follows the path uphill.");
  });

  it.each([true, false])("returns across a chapter boundary to its measured last page (reduced motion %s), preserving explicit jumps and bookmarks", async reducedMotion => {
    vi.useFakeTimers();
    try {
      const source = measuredSource();
      vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: reducedMotion })));
      const reached = vi.fn();
      const view = render(<DailyStoryReader source={source} bookId="boundary" onChapterReached={reached} />);
      const turn = async name => {
        fireEvent.click(footer().getByRole("button", { name }));
        await act(async () => { await vi.advanceTimersByTimeAsync(600); });
      };
      await turn("Next page"); await turn("Next page"); await turn("Next chapter");
      expect(visibleProse()).toBe("The next chapter opens the door.");
      await turn("Previous chapter");
      expect(visibleProse()).toBe("The third page reaches the cottage.");
      expect(screen.getByRole("article")).toHaveTextContent("page 3 of 3");
      expect(JSON.parse(localStorage.getItem("fw_reader_pos_boundary"))).toMatchObject({ chapterIndex: 0, pageInChapter: 2, paragraphIndex: 2 });
      fireEvent.click(screen.getByRole("button", { name: "Set your bookmark here" }));
      expect(JSON.parse(localStorage.getItem("fw_reader_bookmarks_boundary"))).toEqual([expect.objectContaining({ chapterIndex: 0, pageInChapter: 2 })]);
      expect(reached.mock.calls.map(([index]) => index)).toEqual([0, 1, 0]);
      view.rerender(<DailyStoryReader source={source} bookId="boundary" onChapterReached={reached} goToChapter={{ index: 0, nonce: "explicit-reset" }} />);
      expect(visibleProse()).toBe("The first page opens beside the harbour.");
      expect(JSON.parse(localStorage.getItem("fw_reader_pos_boundary"))).toMatchObject({ chapterIndex: 0, pageInChapter: 0, paragraphIndex: 0 });
      expect(JSON.parse(localStorage.getItem("fw_reader_bookmarks_boundary"))).toEqual([expect.objectContaining({ chapterIndex: 0, pageInChapter: 2 })]);
    } finally { vi.useRealTimers(); }
  });
  it("consumes backward page intent without a persistence key so the next chapter still opens at its beginning", () => {
    const source = measuredSource(); render(<DailyStoryReader source={source} />);
    fireEvent.click(footer().getByRole("button", { name: "Next page" }));
    fireEvent.click(footer().getByRole("button", { name: "Next page" }));
    fireEvent.click(footer().getByRole("button", { name: "Next chapter" }));
    fireEvent.click(footer().getByRole("button", { name: "Previous chapter" }));
    expect(visibleProse()).toBe("The third page reaches the cottage.");
    fireEvent.click(footer().getByRole("button", { name: "Next chapter" }));
    expect(visibleProse()).toBe("The next chapter opens the door.");
    expect(footer().getByRole("button", { name: "Previous chapter" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Previous page" })).toBeNull();
  });

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

  it("places visible immersive controls above both page-turn zones while settings remain above the controls", () => {
    render(<DailyStoryReader source={bookSource()} bookId="layers" defaultImmersive onExit={vi.fn()} />);
    const toolbar = screen.getByRole("toolbar", { name: "Reader controls" });
    const toolbarLayer = Number(getComputedStyle(toolbar).zIndex);
    for (const label of ["Previous chapter", "Next chapter"]) {
      const turnZone = screen.getByRole("button", { name: label });
      expect(toolbarLayer).toBeGreaterThan(Number(getComputedStyle(turnZone).zIndex));
    }
    expect(getComputedStyle(toolbar).pointerEvents).toBe("auto");
    expect(within(toolbar).getByRole("button", { name: "Close book" })).toBeEnabled();
    expect(within(toolbar).getByRole("button", { name: "Bookmark this page" })).toBeEnabled();
    fireEvent.click(within(toolbar).getByRole("button", { name: "Reader settings" }));
    expect(Number(getComputedStyle(screen.getByRole("dialog", { name: "Reader settings" })).zIndex)).toBeGreaterThan(toolbarLayer);
    expect(Number(getComputedStyle(document.querySelector(".ds-reader-scrim")).zIndex)).toBeGreaterThan(toolbarLayer);
  });

  it("closes, changes settings and bookmarks without turning a page, then still turns forwards and backwards", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const source = bookSource();
    source.items = source.items.map(item => ({ ...item, body: "A short, complete chapter." }));
    const onExit = vi.fn(), reached = vi.fn();
    render(<DailyStoryReader source={source} bookId="controls" defaultImmersive onExit={onExit} onChapterReached={reached} />);
    const firstHeading = () => screen.getByRole("heading", { name: "Chapter 1 — Tide House Inn" });
    fireEvent.click(screen.getByRole("button", { name: "Close book" }));
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(firstHeading()).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Reader settings" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Reader settings" })).getByRole("button", { name: /Honey/ }));
    expect(document.querySelector(".ds-reader-root")).toHaveClass("fw-theme-honey");
    fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
    expect(screen.queryByRole("dialog", { name: "Reader settings" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Bookmark this page" }));
    expect(screen.getByRole("button", { name: "Remove bookmark" })).toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(localStorage.getItem("fw_reader_bookmarks_controls"))).toEqual([
      expect.objectContaining({ chapterIndex: 0, pageInChapter: 0 }),
    ]);
    expect(firstHeading()).toBeVisible();
    expect(reached.mock.calls).toEqual([[0, source.items[0]]]);
    fireEvent.click(screen.getByRole("button", { name: "Next chapter" }));
    await screen.findByRole("heading", { name: "Chapter 2 — Lime Mortar" });
    fireEvent.click(screen.getByRole("button", { name: "Previous chapter" }));
    await waitFor(() => expect(firstHeading()).toBeVisible());
    expect(reached.mock.calls).toEqual([[0, source.items[0]], [1, source.items[1]], [0, source.items[0]]]);
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

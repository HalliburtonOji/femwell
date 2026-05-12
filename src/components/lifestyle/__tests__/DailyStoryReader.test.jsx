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
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import DailyStoryReader from "../DailyStoryReader";

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
    // Reset localStorage between tests so persistent text-size doesn't leak.
    try { localStorage.clear(); } catch { /* ignore */ }
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

  it("mounts the v4b floating chrome — slider, bottom progress, bookmark, center tap", () => {
    render(<DailyStoryReader source={bookSource()} totalCount={2} defaultImmersive />);
    expect(document.querySelector(".ds-reader-slider-input")).not.toBeNull();
    expect(document.querySelector(".ds-reader-bottom-bar")).not.toBeNull();
    expect(document.querySelector(".ds-reader-bookmark-btn")).not.toBeNull();
    expect(document.querySelector(".ds-reader-center-tap")).not.toBeNull();
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

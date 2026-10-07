import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { journalSourceReturn, lifestyleReturnLink } from "./lifestyleReturns";
import { mergeSavedCollections, savedReturnRoute } from "./savedCollections";
import DailySkyLesson, { SavedSkyLessons } from "@/components/lifestyle-elite/sky/DailySkyLesson";
import { safeSkySavedReturn } from "@/components/lifestyle-elite/sky/skySourceContracts";
import { SKY_LESSONS, skyLessonRoute, localSkyDay } from "@/components/lifestyle-elite/sky/skyLessons";

const mock = vi.hoisted(() => ({ saves: vi.fn(), journals: vi.fn(), save: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { entities: { SavedItems: { filter: mock.saves }, JournalEntries: { filter: mock.journals } } } }));
vi.mock("@/lib/savedItems", () => ({
  parseSavedMeta: row => JSON.parse(row.meta_json || "{}"),
  saveItem: mock.save, removeSavedItem: vi.fn(),
}));
const lesson = SKY_LESSONS.find(item => item.id === "earthshine");
const edition = "sky-lesson:earthshine:v1";
const href = "/Lifestyle?direction=petal-press&section=sky&lesson=earthshine&lessonVersion=1#daily-sky-lesson";
const keep = (route = href, version = 1) => ({ id: "keep", user_id: "owner", item_type: "LIFESTYLE", item_id: `sky-lesson:earthshine:v${version}`, title: lesson.title,
  meta_json: JSON.stringify({ kind: "sky-lesson", lessonId: lesson.id, lessonVersion: version, date: "2026-09-15", route }),
});
beforeEach(() => {
  vi.clearAllMocks(); mock.saves.mockResolvedValue([]); mock.journals.mockResolvedValue([]);
  mock.save.mockImplementation(async ({ itemId, meta }) => ({ id: "keep", user_id: "owner", item_id: itemId, meta_json: JSON.stringify(meta) }));
  window.history.replaceState({}, "", "/Lifestyle?section=sky&lesson=earthshine&lessonVersion=1");
  HTMLElement.prototype.scrollTo = vi.fn();
});

describe("canonical source returns with exact identity", () => {
  it("returns Planner and Journal lesson sources to the live edition, retaining its anchor", () => {
    expect(lifestyleReturnLink({ source: "sky-lesson", ref: edition })).toEqual({ href, label: "Open this Sky lesson" });
    expect(journalSourceReturn({ content_key: edition })).toEqual({ href, label: "Open this Sky lesson" });
    expect(lifestyleReturnLink({ _raw: { source: "sky", ref: edition } })?.href).toBe(href);
    expect(lifestyleReturnLink({ source: "lifestyle", ref: "joy:quiet-kettle" })?.href).toBe("/Lifestyle?direction=petal-press&section=good&joy=quiet-kettle");
  });
  it.each(["/LivingLifestyleDemo", "/LivingAtelierDemo", "/LivingReadingRoomDemo", "/SkyWorldsDemo"])("preserves an explicit %s lesson destination", route => {
    expect(lifestyleReturnLink({ source: "sky-lesson", ref: edition }, route)?.href).toBe(`${route}?direction=petal-press&section=sky&lesson=earthshine&lessonVersion=1#daily-sky-lesson`);
  });
  it("keeps explicit selected-demo joy returns while unsafe arguments fall back to main", () => {
    const item = { source: "lifestyle", ref: "joy:quiet-kettle" };
    expect(lifestyleReturnLink(item, "/SkyWorldsDemo")?.href).toBe("/SkyWorldsDemo?direction=petal-press&section=good&joy=quiet-kettle");
    expect(lifestyleReturnLink(item, "https://evil.example")?.href).toBe("/Lifestyle?direction=petal-press&section=good&joy=quiet-kettle");
  });
  it.each(["sky", "lifestyle"])("retains an actual dated reading ID for %s without inventing a joy", source => {
    expect(lifestyleReturnLink({ source, ref: "sky-reading:owned_reading-7" })).toEqual({ href: "/Lifestyle?section=sky&reading=owned_reading-7", label: "Open this Sky reading" });
  });
  it.each(["sky-reading:", "sky-reading:../other", "sky-reading:one?owner=other", `sky-reading:${"a".repeat(161)}`, "sky-lesson:../earthshine:v9", "sky-lesson:earthshine:v9000000"])("does not broaden an invalid source %s", ref => {
    expect(lifestyleReturnLink({ source: "sky", ref })).toBeNull();
  });
  it('preserves an unavailable exact lesson edition from Planner and Journal without substituting today',()=>{
    const missing='sky-lesson:earthshine:v9';
    const exact='/Lifestyle?direction=petal-press&section=sky&lesson=earthshine&lessonVersion=9#daily-sky-lesson';
    expect(lifestyleReturnLink({source:'sky-lesson',ref:missing})?.href).toBe(exact);
    expect(journalSourceReturn({content_key:missing})?.href).toBe(exact);
    window.history.replaceState({},'',exact);
    render(<DailySkyLesson userId="owner" direction="petal-press" previewRoute="/Lifestyle" human />);
    expect(screen.getByRole('alert')).toHaveTextContent('That saved lesson or edition is unavailable. Today’s lessons are below; your saved record remains.');
    expect(window.location.search).toContain('lessonVersion=9');
  });
  it("does not reinterpret other source namespaces", () => {
    expect(lifestyleReturnLink({ source: "books", ref: "gutenberg:11" })?.href).toBe("/BookReader?gutenberg_id=11");
    expect(lifestyleReturnLink({ source: "books", ref: "club:daily-read-11" })?.href).toBe("/Community?club=daily-read-11");
    expect(lifestyleReturnLink({ source: "sky-lesson", ref: "sky-reading:owned" })).toBeNull();
    expect(lifestyleReturnLink({ source: "unrecognised", ref: edition })).toBeNull();
  });
});

describe("main lesson save, reopen and public sharing", () => {
  it("persists the exact live lesson route and day; public share never includes a private draft", async () => {
    render(<DailySkyLesson userId="owner" direction="petal-press" previewRoute="/Lifestyle" human />);
    const button = screen.getByRole("button", { name: "Keep this" });
    await waitFor(() => expect(button).not.toBeDisabled()); fireEvent.click(button);
    await screen.findByText("Kept in Yours and your saved things.");
    expect(mock.save).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ itemId: edition,
      meta: { kind: "sky-lesson", lessonId: "earthshine", lessonVersion: 1, date: localSkyDay(), route: href },
    }));
    fireEvent.click(screen.getByRole("button", { name: "A private note" }));
    fireEvent.change(screen.getByLabelText("What caught your eye?"), { target: { value: "Only for my journal" } });
    const share = new URL(screen.getByRole("link", { name: "Take this lesson to the lounge" }).getAttribute("href"), "https://femwells.com");
    expect(share.pathname).toBe("/Community"); expect(share.searchParams.get("room")).toBe("lounge");
    expect(share.searchParams.get("seed")).toBe(`${lesson.title}\n\nhttps://femwells.com${href}`);
    expect(share.href).not.toContain("Only");
  });
  it("reopens an older keep in live Yours without rewriting its stored date or record", async () => {
    const row = keep("/SkyWorldsDemo?direction=petal-press&lesson=earthshine&lessonVersion=1");
    mock.saves.mockResolvedValue([row]);
    render(<SavedSkyLessons userId="owner" direction="petal-press" previewRoute="/Lifestyle" human />);
    expect(await screen.findByRole("link", { name: lesson.title })).toHaveAttribute("href", href);
    expect(JSON.parse(row.meta_json).date).toBe("2026-09-15"); expect(mock.save).not.toHaveBeenCalled();
  });
  it("accepts canonical Saved destinations but preserves recorded explicit demo routes and metadata", () => {
    expect(savedReturnRoute(keep())).toBe(href);
    const merged = mergeSavedCollections([keep()], null, new Map())[0];
    expect(merged._href).toBe(href); expect(JSON.parse(merged.meta_json).date).toBe("2026-09-15");
    for (const route of ["/LivingLifestyleDemo", "/LivingAtelierDemo", "/LivingReadingRoomDemo", "/SkyWorldsDemo"]) {
      expect(savedReturnRoute(keep(`${route}?direction=press`))).toBe(`${route}?direction=press&section=sky&lesson=earthshine&lessonVersion=1#daily-sky-lesson`);
    }
  });
  it("keeps unavailable exact editions truthful on main and blocks mismatches/external destinations", () => {
    const fallback = skyLessonRoute({ id: "earthshine", version: 9 }, "petal-press", "/Lifestyle");
    expect(savedReturnRoute(keep(href, 9))).toBe(fallback);
    expect(savedReturnRoute(keep('https://evil.example/Lifestyle',9))).toBeNull();
    expect(safeSkySavedReturn("/Lifestyle?section=sky&lesson=earthshine&lessonVersion=9&direction=petal-press&private=discard", fallback)).toBe("/Lifestyle?section=sky&lesson=earthshine&lessonVersion=9&direction=petal-press#daily-sky-lesson");
    expect(safeSkySavedReturn(href, fallback)).toBe(fallback);
    expect(safeSkySavedReturn("/Lifestyle?section=read&lesson=earthshine&lessonVersion=9&direction=petal-press", fallback)).toBe("/Lifestyle?section=sky&lesson=earthshine&lessonVersion=9&direction=petal-press#daily-sky-lesson");
    expect(safeSkySavedReturn("https://evil.example/Lifestyle?lesson=earthshine&lessonVersion=9", fallback)).toBe(fallback);
  });
});

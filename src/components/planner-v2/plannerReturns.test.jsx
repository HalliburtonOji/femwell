import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { lifestyleReturnLink } from "@/lib/lifestyleReturns";
import { plannerItemToBlock, plannerItemToPlanRow, plannerBlockPatch } from "./plannerItems";
import PlannerSourceLink from "./PlannerSourceLink";

const row = { id: "planned", user_id: "owner", title: "Read a little", time: "09:45", notes: "t:task;d:15;my note;d:apple;custom:t:focus", category: "personal", repeat: "weekly", source: "books", ref: "gutenberg:1342", is_completed: false };

describe("routed planner exact returns", () => {
  it.each([
    [{ source: "books", ref: "gutenberg:1342" }, "/BookReader?gutenberg_id=1342"],
    [{ source: "books", ref: "club:quiet-pages-2" }, "/Community?club=quiet-pages-2"],
    [{ source: "lifestyle", ref: "joy:walk-7fa8" }, "/Lifestyle?direction=petal-press&section=good&joy=walk-7fa8"],
    [{ source: "sky-lesson", ref: "sky-lesson:earthshine:v1" }, "/Lifestyle?direction=petal-press&section=sky&lesson=earthshine&lessonVersion=1#daily-sky-lesson"],
  ])("retains %j through agenda and schedule adapters", (source, href) => {
    const stored = { ...row, ...source };
    expect(lifestyleReturnLink(plannerItemToBlock(stored))?.href).toBe(href);
    expect(lifestyleReturnLink(plannerItemToPlanRow(stored))?.href).toBe(href);
  });
  it.each([{ source: "books", ref: "https://evil.example" }, { source: "books", ref: "gutenberg:0" }, { source: "books", ref: "club:x?redirect=evil" }, { source: "lifestyle", ref: "joy:x#evil" }, { source: "sky", ref: "sky-lesson:earthshine:v9" }, { source: "sky", ref: "sky-lesson:unknown:v1" }, { source: "unknown", ref: "gutenberg:1342" }])("does not invent a return for %j", item => expect(lifestyleReturnLink(item)).toBeNull());
  it("preserves minutes, provenance, recurrence and user notes through an edit and reload", () => {
    const block = plannerItemToBlock(row);
    expect(block.duration).toBe(15);
    const patch = plannerBlockPatch({ ...block, title: "Just one chapter", duration: 5, anchor: true });
    expect(patch).toMatchObject({ time: "09:45", source: "books", ref: "gutenberg:1342", repeat: "weekly", category: "personal", is_anchor: true, notes: "t:task;d:5;my note;d:apple;custom:t:focus" });
    const reloaded = plannerItemToBlock({ ...row, ...patch });
    expect(reloaded).toMatchObject({ title: "Just one chapter", duration: 5, anchor: true });
    expect(lifestyleReturnLink(reloaded)?.href).toBe("/BookReader?gutenberg_id=1342");
    expect(plannerBlockPatch({ ...block, hour: 10 }).time).toBe("10:00");
  });
  it("offers a distinct 44px source target without invoking its containing editor", () => {
    const edit = vi.fn();
    render(<div onClick={edit}><button onClick={edit}>Edit block</button><PlannerSourceLink item={plannerItemToBlock(row)} compact /></div>);
    const link = screen.getByRole("link", { name: "Open this book: Read a little" });
    expect(link).toHaveAttribute("href", "/BookReader?gutenberg_id=1342");
    fireEvent.click(link);
    expect(edit).not.toHaveBeenCalled();
    expect(link).toHaveStyle({ minHeight: "44px", minWidth: "44px" });
  });
});

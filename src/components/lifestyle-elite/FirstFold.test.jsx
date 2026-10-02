import React, { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { FirstFoldNavigation, FirstFoldSummary } from "./FirstFold";

const Icon = () => <svg aria-hidden="true"/>;
const fullRead = [
  { label: "Your reading", text: "The entire first passage remains available, including its last sentence." },
  { label: "Your sky", text: "The entire second passage remains available, including its last sentence." },
];
function SummaryHarness({ rows }) {
  const [open, setOpen] = useState(false);
  return <FirstFoldSummary orderedGlance={rows} jess={{ eyebrow: "A word from Jess", body: "There is room for a quieter moment today." }} sheetSections={fullRead} jessOpen={open} onJessOpen={()=>setOpen(true)} onJessClose={()=>setOpen(false)}/>;
}

describe("First fold navigation and complete summaries", () => {
  let fetchSpy;
  beforeEach(() => { vi.stubGlobal("fetch", fetchSpy = vi.fn()); });
  afterEach(() => { expect(fetchSpy).not.toHaveBeenCalled(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("should retain every navigation choice and send the selected card and clear-focus action to the shell", () => {
    const cards = ["Read", "Listen", "Books", "Sky", "Good life", "Yours"].map((label, index)=>({ id: String(index), label, Icon, cw: "plum" }));
    const select = vi.fn(), clear = vi.fn();
    const { rerender } = render(<FirstFoldNavigation cards={cards} activeIndex={0} onSelect={select} phaseLine="A quieter day" focusLabel="Reading" onClear={clear}/>);
    const nav = within(screen.getByRole("navigation", { name: "Lifestyle sections" }));
    expect(nav.getAllByRole("button")).toHaveLength(6);
    fireEvent.click(nav.getByRole("button", { name: "Books" }));
    expect(select).toHaveBeenCalledExactlyOnceWith(cards[2], 2);
    rerender(<FirstFoldNavigation cards={cards} activeIndex={2} onSelect={select} phaseLine="A quieter day" focusLabel="Reading" onClear={clear}/>);
    expect(nav.getAllByRole("button", { pressed: true })).toEqual([nav.getByRole("button", { name: "Books" })]);
    fireEvent.click(screen.getByRole("button", { name: "Everything" }));
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it("should render all three full glance rows and invoke only the matching row action", () => {
    const rows = ["Sky", "Read", "Books"].map(label=>({ Icon, label, text: `${label}: an intentionally long complete summary, with context and the final invitation still present.`, onClick: vi.fn() }));
    render(<SummaryHarness rows={rows}/>);
    for (const row of rows) {
      const button = screen.getByRole("button", { name: name => name.startsWith(row.label) && name.includes(row.text) });
      expect(button).toHaveTextContent(row.text);
      fireEvent.click(button);
      expect(row.onClick).toHaveBeenCalledTimes(1);
    }
    rows.forEach(row => expect(row.onClick).toHaveBeenCalledTimes(1));
  });

  it("should switch to Jess, preserve both full passages, and close by button or Escape with focus restored", () => {
    const { container } = render(<SummaryHarness rows={[]}/>);
    const track = container.querySelector(".fw-ff-summary-track");
    const scroll = vi.fn();
    Object.defineProperty(track, "clientWidth", { configurable: true, value: 320 });
    track.scrollTo = scroll;
    vi.stubGlobal("matchMedia", vi.fn(()=>({ matches: true })));
    const panels = container.querySelectorAll(".fw-ff-summary-panel");
    expect(panels[1]).toHaveAttribute("inert");
    fireEvent.click(screen.getByRole("button", { name: "Jess’s read", exact: true }));
    expect(scroll).toHaveBeenLastCalledWith({ left: 320, behavior: "auto" });
    expect(panels[0]).toHaveAttribute("inert");
    expect(panels[1]).not.toHaveAttribute("inert");
    const opener = screen.getByRole("button", { name: "Open Jess’s full read" });
    for (const method of ["button", "Escape"]) {
      fireEvent.click(opener);
      fullRead.forEach(section => expect(screen.getByText(section.text)).toBeVisible());
      const close = screen.getByRole("button", { name: "Close", exact: true });
      expect(close).toHaveFocus();
      if (method === "button") fireEvent.click(close);
      else fireEvent.keyDown(close, { key: "Escape" });
      expect(screen.queryByText(fullRead[0].text)).not.toBeInTheDocument();
      expect(opener).toHaveFocus();
    }
    track.scrollLeft = 0;
    fireEvent.scroll(track);
    expect(screen.getByRole("button", { name: "At a glance" })).toHaveAttribute("aria-pressed", "true");
    expect(panels[0]).not.toHaveAttribute("inert");
    expect(panels[1]).toHaveAttribute("inert");
  });
});

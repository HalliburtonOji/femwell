import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ReadFocus from "./ReadFocus";
import GoodLifeFocus from "./GoodLifeFocus";
vi.mock("@/api/base44Client", () => ({ base44: { auth: { me: vi.fn() }, entities: {}, functions: { invoke: vi.fn() } } }));

describe("calmer lists preserve exact source tasks", () => {
  it("keeps all secondary articles and stories, with direct reads and separate full details", () => {
    const onOpen = vi.fn(), onDetails = vi.fn();
    const rows = Array.from({ length: 7 }, (_, i) => ({ id: `source-${i}`, title: `Complete source ${i}`, type: "article", body: [`Full unshortened source ${i}.`], _raw: { id: `raw-${i}` } }));
    render(<ReadFocus calmLayout presentation="focused" articleCards={rows.slice(0, 4)} storyCards={rows.slice(4)} continueCards={[]} onOpen={onOpen} onDetails={onDetails}/>);
    for (const row of rows.slice(1)) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${row.title}.*Read$`) }));
      expect(onOpen).toHaveBeenLastCalledWith(row);
      fireEvent.click(screen.getByRole("button", { name: `Details & tools for ${row.title}` }));
      expect(onDetails).toHaveBeenLastCalledWith(row);
    }
    expect(onOpen).toHaveBeenCalledTimes(6);
  });

  it("keeps the complete joy collection and sends the chosen activity directly to its canonical planner", () => {
    const onPlan = vi.fn(), onSlip = vi.fn(), onOpenRooms = vi.fn();
    const joys = Array.from({ length: 12 }, (_, i) => ({ id: `joy-${i}`, type: "ritual", title: `Joy ${i}`, body: [`The complete activity ${i}.`] }));
    render(<GoodLifeFocus calmLayout presentation="focused" joys={joys} onPlan={onPlan} onSlip={onSlip} onOpenRooms={onOpenRooms}/>);
    expect(screen.queryByText("Joy 3")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "More small joys" }));
    for (const joy of joys) expect(screen.getByText(joy.title)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /^Joy 11.*Plan a time$/ }));
    expect(onPlan).toHaveBeenCalledExactlyOnceWith(joys[11]);
    fireEvent.click(screen.getByRole("button", { name: "Details & tools for Joy 11" }));
    expect(onSlip).toHaveBeenCalledExactlyOnceWith(joys[11]);
    fireEvent.click(screen.getByRole("button", { name: "A few is plenty" }));
    expect(screen.queryByText("Joy 11")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore life’s rooms" }));
    expect(onOpenRooms).toHaveBeenCalledOnce();
  });
});

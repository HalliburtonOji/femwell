import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlannerV2Shell, { BlockEditSheet } from "./PlannerV2Shell";
import { plannerItemToBlock, plannerBlockPatch } from "./plannerItems";

const mock = vi.hoisted(() => ({ filter: vi.fn(), empty: vi.fn(), update: vi.fn(), remove: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { entities: new Proxy({}, { get: (_, name) => name === "PlannerItems" ? { filter: mock.filter, update: mock.update, delete: mock.remove } : { filter: mock.empty } }), auth: { me: async () => ({ id: "owner" }) } } }));
vi.mock("@/components/UniversalLogger", () => ({ openLogger: vi.fn() }));
vi.mock("@/components/planner/cycle/MonthRibbon", () => ({ default: () => null }));
vi.mock("@/components/planner/VoiceScheduler", () => ({ default: () => null, VoiceMicButton: () => null }));

const stored = { id: "block", user_id: "owner", title: "Read one chapter", time: "09:45", notes: "t:task;d:15;my exact words", source: "books", ref: "gutenberg:1342", category: "personal", repeat: "weekly" };
beforeEach(() => { vi.clearAllMocks(); mock.filter.mockResolvedValue([stored]); mock.empty.mockResolvedValue([]); mock.update.mockResolvedValue({}); mock.remove.mockResolvedValue({}); });
describe("actual Planner V2 editor", () => {
  it("shows the exact source on the routed schedule preview, then saves from its actual editor", async () => {
    render(<MemoryRouter><PlannerV2Shell user={{ id: "owner" }} profile={{ display_name: "Halli" }} /></MemoryRouter>);
    const source = await screen.findByRole("link", { name: "Open this book: Read one chapter" });
    expect(source).toHaveAttribute("href", "/BookReader?gutenberg_id=1342");
    fireEvent.click(screen.getByRole("button", { name: "Expand schedule" }));
    fireEvent.click(screen.getByRole("button", { name: /Read one chapter.*15 MIN/ }));
    const title = screen.getByDisplayValue(stored.title);
    fireEvent.change(title, { target: { value: "A page before tea" } });
    fireEvent.click(within(screen.getByRole("dialog", { name: "Edit planned block" })).getByRole("button", { name: "Save", exact: true }));
    await waitFor(() => expect(mock.update).toHaveBeenCalledWith("block", expect.objectContaining({ title: "A page before tea", time: "09:45", source: "books", ref: "gutenberg:1342", notes: "t:task;d:15;my exact words" })));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit planned block" })).not.toBeInTheDocument());
    expect(screen.getAllByRole("link", { name: "Open this book: A page before tea" }).length).toBeGreaterThan(0);
  });
  it("keeps its failed draft/source, then locks and retries the exact edited record", async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error("offline"));
    const close = vi.fn();
    render(<BlockEditSheet block={plannerItemToBlock(stored)} onClose={close} onSave={save} onDelete={vi.fn()} />);
    const title = screen.getByDisplayValue(stored.title);
    fireEvent.change(title, { target: { value: "Just one more page" } });
    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save", exact: true }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Your draft is still here");
    expect(title).toHaveValue("Just one more page");
    expect(close).not.toHaveBeenCalled();
    const expected = { time: "09:45", title: "Just one more page", notes: "t:task;d:5;my exact words", source: "books", ref: "gutenberg:1342", repeat: "weekly" };
    expect(plannerBlockPatch(save.mock.calls[0][0])).toMatchObject(expected);
    let finish; save.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    fireEvent.click(screen.getByRole("button", { name: "Save", exact: true }));
    expect(title).toBeDisabled();
    const link = screen.getByRole("link", { name: "Open this book: Just one more page" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    expect(link.dispatchEvent(event)).toBe(false);
    await act(async () => finish());
    await waitFor(() => expect(title).not.toBeDisabled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(plannerBlockPatch(save.mock.calls[1][0])).toMatchObject(expected);
  });
  it("keeps the existing delete control and source when removal fails", async () => {
    const remove = vi.fn().mockRejectedValue(new Error("offline"));
    render(<BlockEditSheet block={plannerItemToBlock(stored)} onClose={vi.fn()} onSave={vi.fn()} onDelete={remove} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete", exact: true }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That block couldn’t be removed");
    expect(screen.getByDisplayValue(stored.title)).toBeVisible();
    expect(screen.getByRole("link", { name: "Open this book: Read one chapter" })).toHaveAttribute("href", "/BookReader?gutenberg_id=1342");
  });
});

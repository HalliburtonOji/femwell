import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlannerV2ShellClipboard, { BlockEditSheet } from "./PlannerV2ShellClipboard";
import { plannerItemToBlock } from "./plannerItems";

const mock = vi.hoisted(() => ({ filter: vi.fn(), empty: vi.fn(), update: vi.fn(), remove: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { entities: new Proxy({}, { get: (_, name) => name === "PlannerItems" ? { filter: mock.filter, update: mock.update, delete: mock.remove } : { filter: mock.empty } }), auth: { me: async () => ({ id: "owner" }) } } }));
vi.mock("@/components/UniversalLogger", () => ({ openLogger: vi.fn() }));
vi.mock("@/components/planner/cycle/MonthRibbon", () => ({ default: () => null }));
vi.mock("@/components/planner/VoiceScheduler", () => ({ default: () => null, VoiceMicButton: () => null }));

const stored = { id: "joy-plan", user_id: "owner", title: "Let the kettle win", time: "19:10", notes: "d:5;A small pause", source: "lifestyle", ref: "joy:quiet-kettle", category: "wellbeing", repeat: "weekly" };
beforeEach(() => {
  vi.clearAllMocks();
  mock.filter.mockResolvedValue([stored, { ...stored, id: "other-owner", user_id: "someone-else", title: "Someone else's plan" }]);
  mock.empty.mockResolvedValue([]);
  mock.update.mockResolvedValue({}); mock.remove.mockResolvedValue({});
});

describe("default Planner Clipboard source and duration", () => {
  it("retains the source in the real Plan a day list beside its existing completion control", async () => {
    mock.filter.mockResolvedValue([{ ...stored, date: new Date().toISOString().split("T")[0] }]);
    render(<MemoryRouter><PlannerV2ShellClipboard user={{ id: "owner" }} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Plan a day (morning brief)" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Today", exact: true }).at(-1));
    const source = await screen.findByRole("link", { name: "Open this small joy: Let the kettle win" });
    expect(source).toHaveAttribute("href", "/SkyWorldsDemo?direction=petal-press&section=good&joy=quiet-kettle");
    fireEvent.click(within(source.closest("li")).getByRole("checkbox"));
    await waitFor(() => expect(mock.update).toHaveBeenCalledWith("joy-plan", expect.objectContaining({ completed: true, is_completed: true })));
    expect(source).toHaveAttribute("href", "/SkyWorldsDemo?direction=petal-press&section=good&joy=quiet-kettle");
  });

  it("retains the canonical club return in the real Tomorrow tile", async () => {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    mock.filter.mockResolvedValue([{ ...stored, title: "Chapter two with the club", date: tomorrow.toISOString().split("T")[0], source: "books", ref: "club:club-42" }]);
    render(<MemoryRouter><PlannerV2ShellClipboard user={{ id: "owner" }} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Tomorrow", exact: true }));
    expect(await screen.findByRole("link", { name: "Open the book club: Chapter two with the club" })).toHaveAttribute("href", "/Community?club=club-42");
    expect(screen.getByRole("button", { name: "Plan tomorrow" })).toBeInTheDocument();
  });

  it("uses the real Hour by hour tile, edits five minutes and returns to the exact joy", async () => {
    render(<MemoryRouter><PlannerV2ShellClipboard user={{ id: "owner" }} profile={{ display_name: "Halli" }} /></MemoryRouter>);
    await waitFor(() => expect(mock.filter).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /Hour by hour/ }));
    const source = await screen.findByRole("link", { name: "Open this small joy: Let the kettle win" });
    expect(source).toHaveAttribute("href", "/SkyWorldsDemo?direction=petal-press&section=good&joy=quiet-kettle");
    expect(screen.queryByText("Someone else's plan")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Let the kettle win.*5 MIN/ }));
    const editor = screen.getByRole("dialog", { name: "Edit planned block" });
    expect(within(editor).getByRole("combobox", { name: "DURATION (MIN)" })).toHaveValue("5");
    expect(within(editor).getByRole("combobox", { name: "HOUR" })).toHaveDisplayValue("7:10 PM");
    fireEvent.change(within(editor).getByRole("textbox", { name: "TITLE" }), { target: { value: "Tea, then the world" } });
    fireEvent.click(within(editor).getByRole("button", { name: "Save", exact: true }));
    await waitFor(() => expect(mock.update).toHaveBeenCalledWith("joy-plan", expect.objectContaining({ title: "Tea, then the world", time: "19:10", duration_minutes: 5, notes: "t:habit;d:5;A small pause", source: "lifestyle", ref: "joy:quiet-kettle", repeat: "weekly" })));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit planned block" })).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Tea, then the world.*5 MIN/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open this small joy: Tea, then the world" })).toHaveAttribute("href", "/SkyWorldsDemo?direction=petal-press&section=good&joy=quiet-kettle");
  });

  it("keeps the real editor and draft open after a rejected write, then retries once", async () => {
    mock.update.mockRejectedValueOnce(new Error("offline"));
    render(<MemoryRouter><PlannerV2ShellClipboard user={{ id: "owner" }} /></MemoryRouter>);
    await waitFor(() => expect(mock.filter).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /Hour by hour/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Let the kettle win.*5 MIN/ }));
    const editor = screen.getByRole("dialog", { name: "Edit planned block" });
    fireEvent.change(within(editor).getByRole("textbox", { name: "TITLE" }), { target: { value: "Five minutes for me" } });
    fireEvent.click(within(editor).getByRole("button", { name: "Save", exact: true }));
    expect(await within(editor).findByRole("alert")).toHaveTextContent("Your draft is still here");
    expect(within(editor).getByRole("textbox", { name: "TITLE" })).toHaveValue("Five minutes for me");
    fireEvent.click(within(editor).getByRole("button", { name: "Save", exact: true }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit planned block" })).not.toBeInTheDocument());
    expect(mock.update).toHaveBeenCalledTimes(2);
    expect(mock.update.mock.calls[1]).toEqual(mock.update.mock.calls[0]);
  });

  it("includes unusual stored durations without silently selecting fifteen, and locks in flight", async () => {
    let finish;
    const save = vi.fn(() => new Promise(resolve => { finish = resolve; }));
    render(<BlockEditSheet block={plannerItemToBlock({ ...stored, notes: "d:7;pause" })} onClose={vi.fn()} onSave={save} onDelete={vi.fn()} />);
    const duration = screen.getByRole("combobox", { name: "DURATION (MIN)" });
    expect(duration).toHaveValue("7");
    expect(screen.getByRole("option", { name: "7", exact: true })).toHaveValue("7");
    fireEvent.click(screen.getByRole("button", { name: "Save", exact: true }));
    expect(duration).toBeDisabled();
    expect(screen.getByRole("link", { name: "Open this small joy: Let the kettle win" })).toHaveAttribute("aria-disabled", "true");
    await act(async () => finish());
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("retains Delete and the exact source when removal fails", async () => {
    const remove = vi.fn().mockRejectedValue(new Error("offline"));
    render(<BlockEditSheet block={plannerItemToBlock(stored)} onClose={vi.fn()} onSave={vi.fn()} onDelete={remove} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete", exact: true }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That block couldn’t be removed");
    expect(screen.getByRole("textbox", { name: "TITLE" })).toHaveValue(stored.title);
    expect(screen.getByRole("link", { name: "Open this small joy: Let the kettle win" })).toHaveAttribute("href", "/SkyWorldsDemo?direction=petal-press&section=good&joy=quiet-kettle");
  });
});

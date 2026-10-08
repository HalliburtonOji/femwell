import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import FocusedSectionActions from "./FocusedSectionActions";

const renderActions = (actions) => render(<FocusedSectionActions actions={actions} plum="#402D46" />);
const openChooser = (label) => {
  const opener = screen.getByRole("button", { name: label, exact: true });
  opener.focus();
  fireEvent.click(opener);
  return opener;
};

describe("FocusedSectionActions — preview interaction contract", () => {
  it("suspends a cached chooser without choosing or focusing its hidden origin, then restores its choices", async () => {
    const open = vi.fn(), item = { id: "book", title: "A real book" };
    const actions = [{ label: "Choose a book", items: [item], open }];
    const { rerender } = render(<><button>Destination control</button><FocusedSectionActions routeActive actions={actions} plum="#402D46"/></>);
    const opener = openChooser("Choose a book");
    await screen.findByRole("dialog", { name: "Choose a book" });
    const focus = vi.spyOn(opener, "focus");
    rerender(<><button>Destination control</button><FocusedSectionActions routeActive={false} actions={actions} plum="#402D46"/></>);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(open).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
    const destination = screen.getByRole("button", { name: "Destination control" });
    destination.focus(); fireEvent.keyDown(destination, { key: "Escape" });
    expect(destination).toHaveFocus();
    rerender(<><button>Destination control</button><FocusedSectionActions routeActive actions={actions} plum="#402D46"/></>);
    const dialog = await screen.findByRole("dialog", { name: "Choose a book" });
    fireEvent.click(within(dialog).getByRole("button", { name: item.title }));
    await waitFor(() => expect(open).toHaveBeenCalledExactlyOnceWith(item));
  });
  it("should run the matching action directly and leave disabled actions untouched", () => {
    const ask = vi.fn();
    const edit = vi.fn();
    renderActions([
      { label: "Ask the sky", run: ask },
      { label: "Edit your chart", run: edit, disabled: true },
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Ask the sky" }));
    expect(ask).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const disabled = screen.getByRole("button", { name: "Edit your chart" });
    expect(disabled).toBeDisabled();
    fireEvent.click(disabled);
    expect(edit).not.toHaveBeenCalled();
  });

  it("should open exactly the selected real item after closing its chooser, without replaying on cancellation", async () => {
    const first = { id: "read-1", title: "A gentler working week" };
    const second = { id: "read-2", title: "Making room for friendship" };
    const dialogPresentAtOpen = [];
    const open = vi.fn(() => dialogPresentAtOpen.push(!!screen.queryByRole("dialog")));
    renderActions([{ label: "Choose a read", items: [first, second], open }]);

    openChooser("Choose a read");
    const dialog = await screen.findByRole("dialog", { name: "Choose a read" });
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: second.title }));
    await waitFor(() => expect(open).toHaveBeenCalledExactlyOnceWith(second));
    expect(dialogPresentAtOpen).toEqual([false]);

    openChooser("Choose a read");
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "Close section actions" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(open).toHaveBeenCalledTimes(1);
  });

  it.each(["close button", "Escape"])("should return focus to the action when its chooser is dismissed with %s", async (method) => {
    renderActions([{ label: "Saved reads", items: [], open: vi.fn(), empty: "No saved reads yet." }]);
    const opener = openChooser("Saved reads");
    const dialog = await screen.findByRole("dialog", { name: "Saved reads" });
    if (method === "Escape") fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    else fireEvent.click(within(dialog).getByRole("button", { name: "Close section actions" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("should show the section's honest empty state without inventing selectable content", async () => {
    const open = vi.fn();
    const empty = "No reading in progress yet. Start a book and your place will appear here.";
    renderActions([{ label: "Continue reading", items: [], open, empty }]);
    openChooser("Continue reading");
    const dialog = await screen.findByRole("dialog", { name: "Continue reading" });
    expect(within(dialog).getByRole("status")).toHaveTextContent(empty);
    expect(within(dialog).getAllByRole("button")).toHaveLength(1);
    expect(open).not.toHaveBeenCalled();
  });

  it("should preserve a custom action's interactive content and description", async () => {
    const chooseTime = vi.fn();
    renderActions([{
      label: "Time for yourself",
      description: "Choose the time you have, then open a suggestion.",
      content: <button onClick={chooseTime}>Ten minutes</button>,
    }]);
    openChooser("Time for yourself");
    const dialog = await screen.findByRole("dialog", { name: "Time for yourself" });
    expect(dialog).toHaveAccessibleDescription("Choose the time you have, then open a suggestion.");
    expect(within(dialog).queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Ten minutes" }));
    expect(chooseTime).toHaveBeenCalledTimes(1);
  });

  it("should hand a custom selection to its destination only after the chooser releases focus", async () => {
    const selected = { id: "suggestion-1", title: "A quiet moment" };
    const observations = [];
    const open = vi.fn((item) => observations.push({ item, dialogOpen: !!screen.queryByRole("dialog") }));
    renderActions([{
      label: "Time for yourself",
      content: (afterClose) => <button onClick={() => afterClose(open, selected)}>Open this suggestion</button>,
    }]);
    openChooser("Time for yourself");
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Open this suggestion" }));
    await waitFor(() => expect(open).toHaveBeenCalledExactlyOnceWith(selected));
    expect(observations).toEqual([{ item: selected, dialogOpen: false }]);
  });

  it("should show newly loaded real content when items change while the chooser is open", async () => {
    const open = vi.fn();
    const item = { id: "saved-1", title: "A place for your thoughts" };
    const props = (items) => [{ label: "Open your saves", items, open, empty: "No saves yet." }];
    const { rerender } = renderActions(props([]));
    openChooser("Open your saves");
    await screen.findByRole("dialog");
    expect(screen.getByRole("status")).toHaveTextContent("No saves yet.");

    rerender(<FocusedSectionActions actions={props([item])} plum="#402D46" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: item.title }));
    await waitFor(() => expect(open).toHaveBeenCalledExactlyOnceWith(item));
  });
});

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JournalHub from "./JournalHub";

const mock = vi.hoisted(() => ({ me: vi.fn(), entries: vi.fn(), empty: vi.fn(), update: vi.fn(), remove: vi.fn() }));
// The real SDK creates a fresh handler on each access; keep that behaviour here.
vi.mock("@/api/base44Client", () => ({ base44: { auth: { me: mock.me }, entities: new Proxy({}, { get: (_, name) => name === "JournalEntries" ? { filter: mock.entries, update: mock.update, delete: mock.remove } : { filter: mock.empty } }) } }));
vi.mock("@/components/journal/UnpackWithJess", () => ({ default: () => null }));
vi.mock("@/components/share/ShareButton", () => ({ default: () => null }));
vi.mock("@/components/journal/NewEntrySheet", () => ({ default: ({ mode }) => <div role="dialog" aria-label="New journal entry">{mode}</div> }));
vi.mock("@/components/brand/ClipboardSlider", () => ({ ClipboardSlider: ({ children }) => <div>{children}</div>, Clipboard: ({ children }) => <div>{children}</div> }));
const note = { id: "old-note", user_id: "owner", content_key: "sky-lesson:earthshine:v1", text: "The faint outline caught my eye.", card_type: "reflection", session_date: "2026-09-01", tags: ["Sky lesson"] };
function mount(query = "?entry=old-note&content_key=sky-lesson%3Aearthshine%3Av1") { return render(<MemoryRouter initialEntries={[`/Journal${query}`]}><JournalHub /></MemoryRouter>); }
beforeEach(() => {
  vi.resetAllMocks(); mock.me.mockResolvedValue({ id: "owner" }); mock.empty.mockResolvedValue([]); mock.entries.mockImplementation(async filter => filter.id ? [note] : [{ ...note, id: "latest", text: "The recent entry." }]);
});

describe("actual /Journal hub exact note return", () => {
  it("opens an old exact owner note independently of its latest-200 ledger and preserves existing actions", async () => {
    mount(); const dialog = await screen.findByRole("dialog", { name: "Reflection entry" });
    expect(dialog).toHaveTextContent(note.text);
    expect(dialog).not.toHaveTextContent("The recent entry.");
    expect(mock.entries).toHaveBeenCalledWith({ user_id: "owner", id: "old-note", content_key: note.content_key }, "-created_date", 1);
    expect(screen.getByRole("link", { name: "Open this Sky lesson" })).toHaveAttribute("href", "/Lifestyle?direction=petal-press&section=sky&lesson=earthshine&lessonVersion=1#daily-sky-lesson");
    expect(screen.getByRole("button", { name: "Pin", exact: true })).toBeVisible();
    expect(screen.getByRole("button", { name: "Edit", exact: true })).toBeVisible();
    expect(screen.getByRole("button", { name: "Delete", exact: true })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Write a journal entry" }));
    expect(screen.getByRole("dialog", { name: "New journal entry" })).toBeVisible();
    expect(mock.entries.mock.calls.filter(([filter]) => filter.id)).toHaveLength(1);
  });
  it.each([{ ...note, user_id: "other" }, { ...note, id: "wrong" }, { ...note, content_key: "sky-lesson:same-face:v1" }])("never replaces a mismatched returned row with another entry (%j)", async returned => {
    mock.entries.mockImplementation(async filter => filter.id ? [returned] : []); mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("That note isn’t available");
    expect(screen.queryByRole("dialog", { name: /entry/ })).not.toBeInTheDocument();
    expect(screen.queryByText(note.text)).not.toBeInTheDocument();
  });
  it("distinguishes a failed exact read, retries and then opens the actual note", async () => {
    let calls = 0; mock.entries.mockImplementation(async filter => { if (!filter.id) return []; if (++calls === 1) throw new Error("offline"); return [note]; }); mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("Your note couldn’t load");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("dialog", { name: "Reflection entry" })).toHaveTextContent(note.text);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("does not request entries when authentication fails", async () => {
    mock.me.mockRejectedValue(new Error("signed out")); mount();
    expect(await screen.findByRole("alert")).toHaveTextContent("Sign in to your account");
    expect(mock.entries).not.toHaveBeenCalled();
  });
  it("does not open an exact read that resolves after the page unmounts", async () => {
    let finish; mock.entries.mockImplementation(filter => filter.id ? new Promise(resolve => { finish = resolve; }) : Promise.resolve([]));
    const mounted = mount(); await waitFor(() => expect(finish).toBeTypeOf("function")); mounted.unmount();
    await act(async () => finish([note])); expect(screen.queryByText(note.text)).not.toBeInTheDocument();
  });
});

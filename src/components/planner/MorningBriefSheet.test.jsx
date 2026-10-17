import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({
  me: vi.fn(), checkinsFilter: vi.fn(), checkinsCreate: vi.fn(), checkinsUpdate: vi.fn(),
  plansFilter: vi.fn(), mealsFilter: vi.fn(),
}));
vi.mock("@/api/base44Client", () => ({ base44: {
  auth: { me: api.me },
  entities: {
    DailyCheckins: { filter: api.checkinsFilter, create: api.checkinsCreate, update: api.checkinsUpdate },
    PlannerItems: { filter: api.plansFilter },
    MealLog: { filter: api.mealsFilter },
  },
} }));
vi.mock("@/hooks/useCycleDay", () => ({ useCycleDay: () => ({ phase: "unknown" }) }));
vi.mock("@/utils/userProfile", () => ({ displayFirstName: () => "Jess" }));
import MorningBriefSheet from "./MorningBriefSheet";

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const date = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const row = (uid, values = {}) => ({ id: `row-${uid}`, user_id: uid, date: date(), ...values });

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
  api.me.mockResolvedValue({ id: "owner-A" });
  api.checkinsFilter.mockResolvedValue([]);
  api.plansFilter.mockResolvedValue([]);
  api.mealsFilter.mockResolvedValue([]);
  api.checkinsCreate.mockImplementation(async (payload) => row(payload.user_id, payload));
  api.checkinsUpdate.mockImplementation(async (id, payload) => ({ id, ...payload }));
});
afterEach(() => { vi.clearAllMocks(); });

it("serialises rapid mood and energy into one owned row with acknowledged values", async () => {
  const first = deferred();
  api.checkinsCreate.mockReturnValueOnce(first.promise);
  render(<MorningBriefSheet user={{ id: "owner-A" }} profile={{}} onDismiss={vi.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Mood: Good" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Mood: Good" }));
  await waitFor(() => expect(api.checkinsCreate).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("button", { name: /Energy & sleep/ }));
  fireEvent.click(screen.getByRole("button", { name: "Energy: 3 of 5" }));
  expect(api.checkinsUpdate).not.toHaveBeenCalled();
  await act(async () => first.resolve(row("owner-A", api.checkinsCreate.mock.calls[0][0])));
  await waitFor(() => expect(api.checkinsUpdate).toHaveBeenCalledTimes(1));
  expect(api.checkinsUpdate.mock.calls[0][0]).toBe("row-owner-A");
  expect(api.checkinsCreate.mock.calls[0][0]).toEqual(expect.objectContaining({ mood: 4, mood_score: 4 }));
  expect(api.checkinsUpdate.mock.calls[0][1]).toEqual(expect.objectContaining({ energy: 3, energy_level: 3 }));
  await waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
});

it("never writes the previous owner's row after an account change", async () => {
  api.checkinsFilter.mockImplementation(async ({ user_id }) => user_id === "owner-A" ? [row("owner-A", { mood: 2 })] : []);
  const { rerender } = render(<MorningBriefSheet user={{ id: "owner-A" }} profile={{}} onDismiss={vi.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Mood: Low" })).toHaveAttribute("aria-pressed", "true"));
  api.me.mockResolvedValue({ id: "owner-B" });
  rerender(<MorningBriefSheet user={{ id: "owner-B" }} profile={{}} onDismiss={vi.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Mood: Good" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Mood: Good" }));
  await waitFor(() => expect(api.checkinsCreate).toHaveBeenCalledTimes(1));
  expect(api.checkinsCreate.mock.calls[0][0].user_id).toBe("owner-B");
  expect(api.checkinsUpdate).not.toHaveBeenCalled();
});

it("does not overwrite a newer energy value when only mood is changed", async () => {
  api.checkinsFilter.mockResolvedValue([row("owner-A", { mood: 2, energy: 1 })]);
  render(<MorningBriefSheet user={{ id: "owner-A" }} profile={{}} onDismiss={vi.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Mood: Low" })).toHaveAttribute("aria-pressed", "true"));
  fireEvent.click(screen.getByRole("button", { name: "Mood: Good" }));
  await waitFor(() => expect(api.checkinsUpdate).toHaveBeenCalledTimes(1));
  expect(api.checkinsUpdate.mock.calls[0][1]).toEqual(expect.objectContaining({ mood: 4, mood_score: 4 }));
  expect(api.checkinsUpdate.mock.calls[0][1]).not.toHaveProperty("energy");
  expect(api.checkinsUpdate.mock.calls[0][1]).not.toHaveProperty("energy_level");
});

it("does not report saved if the signed-in owner changes during a pending write", async () => {
  const pending = deferred();
  api.checkinsCreate.mockReturnValueOnce(pending.promise);
  render(<MorningBriefSheet user={{ id: "owner-A" }} profile={{}} onDismiss={vi.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Mood: Good" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Mood: Good" }));
  await waitFor(() => expect(api.checkinsCreate).toHaveBeenCalledTimes(1));
  api.me.mockResolvedValue({ id: "owner-B" });
  await act(async () => pending.resolve(row("owner-A", { mood: 4, mood_score: 4 })));
  await waitFor(() => expect(screen.getByText(/Couldn’t confirm this check-in/)).toBeInTheDocument());
  expect(screen.queryByText("Saved")).not.toBeInTheDocument();
});

it("does not create on a failed initial read and offers a real retry", async () => {
  api.checkinsFilter.mockRejectedValueOnce(new Error("offline")).mockResolvedValue([]);
  render(<MorningBriefSheet user={{ id: "owner-A" }} profile={{}} onDismiss={vi.fn()} />);
  await waitFor(() => expect(screen.getByText(/Couldn’t confirm this check-in/)).toBeInTheDocument());
  expect(screen.getByRole("button", { name: "Mood: Good" })).toBeDisabled();
  expect(api.checkinsCreate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Mood: Good" })).toBeEnabled());
  expect(screen.queryByText("Saved")).not.toBeInTheDocument();
});

it("reconciles an uncertain create before a retry, without a duplicate", async () => {
  api.checkinsFilter.mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([row("owner-A", { mood: 4 })]);
  api.checkinsCreate.mockRejectedValueOnce(new Error("timeout"));
  render(<MorningBriefSheet user={{ id: "owner-A" }} profile={{}} onDismiss={vi.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Mood: Good" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Mood: Good" }));
  await waitFor(() => expect(screen.getByText(/Couldn’t confirm this check-in/)).toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
  expect(api.checkinsCreate).toHaveBeenCalledTimes(1);
});

it("opens a proper dialog, labels choices and dismisses with Escape", async () => {
  const dismiss = vi.fn();
  render(<MorningBriefSheet user={{ id: "owner-A" }} profile={{}} onDismiss={dismiss} />);
  const dialog = screen.getByRole("dialog", { name: /Good .*Jess/ });
  expect(dialog).toHaveAttribute("open");
  expect(screen.getByRole("button", { name: "Not now, close morning brief" })).toHaveFocus();
  expect(screen.getByRole("button", { name: "Mood: Very low" })).toHaveAttribute("aria-pressed", "false");
  fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
  expect(dismiss).toHaveBeenCalledTimes(1);
});

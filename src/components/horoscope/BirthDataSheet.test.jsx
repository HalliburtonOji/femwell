import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BirthDataSheet from "./BirthDataSheet";

const api = vi.hoisted(() => ({ me: vi.fn(), update: vi.fn(), create: vi.fn(), filter: vi.fn(), invoke: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: {
  auth: { me: api.me }, entities: { AstroProfile: { update: api.update, create: api.create, filter: api.filter } },
  functions: { invoke: api.invoke },
} }));

const initial = { id: "chart-1", user_id: "owner", birth_date: "1990-04-12", birth_time: null, birth_place: null };
const saved = { ...initial, sun_sign: "Aries" };
beforeEach(() => {
  vi.clearAllMocks();
  api.me.mockResolvedValue({ id: "owner" });
  api.invoke.mockResolvedValue({});
});

describe("Sky chart write acknowledgement", () => {
  it("retains the draft and skips generation when an update cannot be read back", async () => {
    api.update.mockResolvedValue(undefined);
    api.filter.mockResolvedValue([]);
    const onSaved = vi.fn(), onClose = vi.fn();
    render(<BirthDataSheet open userId="owner" initial={initial} onSaved={onSaved} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Update chart" }));
    expect(await screen.findByText(/chart save could not be confirmed/i)).toBeVisible();
    expect(api.filter).toHaveBeenCalledWith({ id: "chart-1", user_id: "owner" }, undefined, 1);
    expect(api.invoke).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    api.filter.mockResolvedValue([saved]);
    fireEvent.click(screen.getByRole("button", { name: "Update chart" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved));
    expect(onClose).toHaveBeenCalledOnce();
    expect(api.invoke).toHaveBeenCalledOnce();
  });

  it("does not write for a different signed-in owner", async () => {
    api.me.mockResolvedValue({ id: "someone-else" });
    const onSaved = vi.fn(), onClose = vi.fn();
    render(<BirthDataSheet open userId="owner" initial={initial} onSaved={onSaved} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Update chart" }));
    expect(await screen.findByText(/account changed/i)).toBeVisible();
    expect(api.update).not.toHaveBeenCalled();
    expect(api.invoke).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("retries the exact pending create instead of making a second chart", async () => {
    api.create.mockResolvedValue({ id: "created-1" });
    api.filter.mockResolvedValueOnce([]).mockResolvedValueOnce([{ ...saved, id: "created-1" }]);
    const onSaved = vi.fn(), onClose = vi.fn();
    render(<BirthDataSheet open userId="owner" initial={{ ...initial, id: undefined }} onSaved={onSaved} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Tell us when" }));
    expect(await screen.findByText(/chart save could not be confirmed/i)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Tell us when" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith({ ...saved, id: "created-1" }));
    expect(api.create).toHaveBeenCalledOnce();
    expect(api.filter).toHaveBeenCalledWith({ id: "created-1", user_id: "owner" }, undefined, 1);
    expect(api.invoke).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("rejects a read-back row with another ID even when its data matches", async () => {
    api.create.mockResolvedValue({ id: "created-1" });
    api.filter.mockResolvedValue([{ ...saved, id: "different-row" }]);
    const onSaved = vi.fn(), onClose = vi.fn();
    render(<BirthDataSheet open userId="owner" initial={{ ...initial, id: undefined }} onSaved={onSaved} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Tell us when" }));
    expect(await screen.findByText(/chart save could not be confirmed/i)).toBeVisible();
    expect(api.invoke).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

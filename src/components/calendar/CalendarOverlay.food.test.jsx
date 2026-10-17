import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { format } from "date-fns";

const api = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { functions: { invoke: api.invoke } } }));
import { FoodLogSheet, cycleDayFor, cyclePhase, setLiveProfile } from "./CalendarOverlay";

const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

afterEach(() => { vi.restoreAllMocks(); api.invoke.mockReset(); setLiveProfile(null); });

it("counts UK spring clock-change dates as separate calendar days", () => {
  const previousTimezone = process.env.TZ;
  process.env.TZ = "Europe/London";
  try {
    setLiveProfile({ last_period_start_date: "2026-03-29", cycle_avg_length: 28, period_length: 1 });
    expect(cycleDayFor("2026-03-29")).toBe(1);
    expect(cycleDayFor("2026-03-30")).toBe(2);
    expect(cyclePhase("2026-03-29")).toBe("menstrual");
    expect(cyclePhase("2026-03-30")).toBe("follicular");
  } finally { process.env.TZ = previousTimezone; }
});

it("keeps reviewed food words and ignores a removed photo's late analysis", async () => {
  const previousImage = globalThis.Image;
  globalThis.Image = class {
    width = 1;
    height = 1;
    set src(_) { queueMicrotask(() => this.onload?.()); }
  };
  const oldPhoto = deferred();
  const newPhoto = deferred();
  api.invoke.mockReturnValueOnce(oldPhoto.promise).mockReturnValueOnce(newPhoto.promise);
  const onConfirm = vi.fn();
  try {
    const { container } = render(<FoodLogSheet sheet={{ date: format(new Date(), "yyyy-MM-dd"), mode: "log", initialMeal: "lunch", photoUrl: "data:image/png;base64,QQ==", suggested: "Reviewed soup", initialWords: "Soup I made at home" }} onBack={vi.fn()} onClose={vi.fn()} onConfirm={onConfirm} />);
    expect(screen.getByText("Reviewed soup")).toBeVisible();
    expect(screen.getByPlaceholderText("Anything to remember about this meal…")).toHaveValue("Soup I made at home");
    expect(screen.queryByText("Favourites")).not.toBeInTheDocument();
    expect(screen.queryByText("Recent")).not.toBeInTheDocument();
    await waitFor(() => expect(api.invoke).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "Remove food photo" }));
    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [new File(["new plate"], "plate.png", { type: "image/png" })] } });
    await waitFor(() => expect(api.invoke).toHaveBeenCalledTimes(2));
    await act(async () => newPhoto.resolve({ data: { items: [{ name: "Rice" }] } }));
    await act(async () => oldPhoto.resolve({ data: { items: [{ name: "Old peanuts" }] } }));
    expect(screen.getByText("Rice")).toBeVisible();
    expect(screen.queryByText("Old peanuts")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Log lunch/ }));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ mealType: "lunch", notes: "Soup I made at home", items: [{ name: "Reviewed soup", portion: "Medium" }, { name: "Rice", portion: "Medium" }] }));
  } finally { globalThis.Image = previousImage; }
});

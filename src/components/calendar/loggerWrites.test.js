import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const entities = {};
  for (const name of ["MealLog", "HydrationLog", "DailyCheckins", "SymptomLogs", "JournalEntries", "HabitLogs", "MedicationLogs", "PlannerItems", "CycleEvents", "UserProfile", "PersonalTasks"]) {
    entities[name] = { create: vi.fn(), filter: vi.fn(), update: vi.fn(), get: vi.fn() };
  }
  return { entities, invoke: vi.fn() };
});

vi.mock("@/api/base44Client", () => ({ base44: { entities: mocks.entities, functions: { invoke: mocks.invoke } } }));

import { commitEntries, writePeriod } from "./loggerWrites";

beforeEach(() => {
  let count = 0;
  for (const entity of Object.values(mocks.entities)) {
    entity.create.mockReset().mockImplementation(async (body) => ({ id: `row-${++count}`, ...body }));
    entity.filter.mockReset().mockResolvedValue([]);
    entity.update.mockReset().mockImplementation(async (id, body) => ({ id, ...body }));
    entity.get.mockReset().mockResolvedValue(null);
  }
  mocks.invoke.mockReset().mockResolvedValue({});
});

describe("calendar write acknowledgement and plan semantics", () => {
  it("refuses an unauthenticated save without creating a row", async () => {
    expect(await commitEntries(null, [{ date: "2026-10-17", type: "note", text: "A thought" }])).toMatchObject({ saved: 0, error: "Sign in before saving" });
    expect(mocks.entities.JournalEntries.create).not.toHaveBeenCalled();
  });

  it("puts future medicine, meals and water in plans, never taken logs or food analysis", async () => {
    const entries = [
      { date: "2099-01-02", type: "med", title: "Vitamin D", plan: true },
      { date: "2099-01-02", type: "meal", title: "Lunch", plan: true },
      { date: "2099-01-02", type: "water", plan: true },
    ];
    expect(await commitEntries("owner", entries)).toMatchObject({ saved: 3, attempted: 3 });
    expect(mocks.entities.PlannerItems.create).toHaveBeenCalledTimes(3);
    expect(mocks.entities.PlannerItems.create).toHaveBeenCalledWith(expect.objectContaining({ user_id: "owner", title: "Medication: Vitamin D", category: "health", is_completed: false }));
    expect(mocks.entities.MedicationLogs.create).not.toHaveBeenCalled();
    expect(mocks.entities.MealLog.create).not.toHaveBeenCalled();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it("stops at an unconfirmed row without replaying or advancing to later rows", async () => {
    mocks.entities.JournalEntries.create.mockRejectedValueOnce(new Error("offline"));
    const result = await commitEntries("owner", [
      { date: "2026-10-17", type: "task", title: "One" },
      { date: "2026-10-17", type: "note", text: "Two" },
      { date: "2026-10-17", type: "task", title: "Three" },
    ]);
    expect(result).toMatchObject({ saved: 1, attempted: 2, error: "offline" });
    expect(mocks.entities.PersonalTasks.create).toHaveBeenCalledTimes(1);
    expect(mocks.entities.JournalEntries.create).toHaveBeenCalledTimes(1);
  });

  it("does not count a returned void as a confirmed save", async () => {
    mocks.entities.JournalEntries.create.mockResolvedValueOnce(undefined);
    expect(await commitEntries("owner", [{ date: "2026-10-17", type: "note", text: "Keep this" }])).toMatchObject({ saved: 0, attempted: 1, error: "Note was not confirmed" });
  });

  it("does not count a foreign-owner receipt as a save", async () => {
    mocks.entities.JournalEntries.create.mockResolvedValueOnce({ id: "foreign", user_id: "someone-else", session_date: "2026-10-17" });
    expect(await commitEntries("owner", [{ date: "2026-10-17", type: "note", text: "Keep this" }])).toMatchObject({ saved: 0, attempted: 1, error: "Note could not be read back for this account and day" });
  });

  it("does not count a row returned for the wrong day", async () => {
    mocks.entities.PlannerItems.create.mockResolvedValueOnce({ id: "wrong-day", user_id: "owner", date: "2099-01-03" });
    expect(await commitEntries("owner", [{ date: "2099-01-02", type: "med", title: "Vitamin D", plan: true }])).toMatchObject({ saved: 0, attempted: 1, error: "Plan could not be read back for this account and day" });
  });

  it("stops a batch when its owner changes while a row is awaiting acknowledgement", async () => {
    let sameOwner = true;
    mocks.entities.PersonalTasks.create.mockImplementationOnce(async (body) => { sameOwner = false; return { id: "first", ...body }; });
    const result = await commitEntries("owner", [
      { date: "2026-10-17", type: "task", title: "First" },
      { date: "2026-10-17", type: "task", title: "Second" },
    ], () => sameOwner);
    expect(result).toMatchObject({ saved: 1, attempted: 1, error: "Account changed during save" });
    expect(mocks.entities.PersonalTasks.create).toHaveBeenCalledTimes(1);
  });

  it("uses the user's local day at the UK midnight boundary", async () => {
    const before = process.env.TZ;
    process.env.TZ = "Europe/London";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-17T23:15:00Z"));
    try {
      expect(new Date().getDate()).toBe(18);
      expect(await commitEntries("owner", [{ date: "2026-10-18", type: "mood", mood: 4 }])).toMatchObject({ saved: 1 });
      expect(mocks.entities.DailyCheckins.create).toHaveBeenCalledTimes(1);
      expect(mocks.entities.PlannerItems.create).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      process.env.TZ = before;
    }
  });

  it("passes selected symptom and reviewed note text to their actual entities", async () => {
    await commitEntries("owner", [
      { date: "2026-10-17", type: "symptom", symptoms: ["Headache"], title: "My head", notes: "after lunch" },
      { date: "2026-10-17", type: "note", title: "At the park", text: "At the park — I saw a fox" },
    ]);
    expect(mocks.entities.SymptomLogs.create).toHaveBeenCalledWith(expect.objectContaining({ symptom_type: "Headache", notes: "after lunch" }));
    expect(mocks.entities.JournalEntries.create).toHaveBeenCalledWith(expect.objectContaining({ text: "At the park — I saw a fox" }));
  });

  it("reports the cycle anchor failure after the event row instead of claiming a full update", async () => {
    mocks.entities.UserProfile.filter.mockResolvedValueOnce([{ id: "profile", user_id: "owner" }]);
    mocks.entities.UserProfile.update.mockRejectedValueOnce(new Error("profile write failed"));
    await expect(writePeriod("owner", "2026-10-17", { type: "PeriodStart" })).rejects.toThrow("profile write failed");
    expect(mocks.entities.CycleEvents.create).toHaveBeenCalledTimes(1);
  });

  it("records a historical period start without moving a newer cycle anchor backwards", async () => {
    mocks.entities.UserProfile.filter.mockResolvedValueOnce([{ id: "profile", user_id: "owner", last_period_start_date: "2026-10-10" }]);
    const result = await writePeriod("owner", "2026-09-09", { type: "PeriodStart", flow: "light" });
    expect(result).toMatchObject({ anchorUpdated: false, date: "2026-09-09", flow_level: "light" });
    expect(mocks.entities.CycleEvents.create).toHaveBeenCalledTimes(1);
    expect(mocks.entities.UserProfile.update).not.toHaveBeenCalled();
  });

  it("updates the cycle anchor for a later confirmed start", async () => {
    mocks.entities.UserProfile.filter.mockResolvedValueOnce([{ id: "profile", user_id: "owner", last_period_start_date: "2026-09-09" }]);
    mocks.entities.UserProfile.update.mockImplementationOnce(async (id, body) => ({ id, user_id: "owner", ...body }));
    const result = await writePeriod("owner", "2026-10-10", { type: "PeriodStart" });
    expect(result.anchorUpdated).toBe(true);
    expect(mocks.entities.UserProfile.update).toHaveBeenCalledWith("profile", { last_period_start_date: "2026-10-10" });
  });

  it("saves whole-day meal slots without inventing food analysis, but analyzes actual foods", async () => {
    const day = "2026-10-17";
    const result = await commitEntries("owner", [
      { date: day, type: "meal", title: "Breakfast", meal_type: "breakfast" },
      { date: day, type: "meal", title: "Lunch", meal_type: "lunch" },
      { date: day, type: "meal", title: "Dinner", meal_type: "dinner" },
    ]);
    expect(result).toMatchObject({ saved: 3 });
    expect(mocks.entities.MealLog.create).toHaveBeenCalledTimes(3);
    expect(mocks.invoke).not.toHaveBeenCalled();
    expect(await commitEntries("owner", [{ date: day, type: "meal", title: "Salmon and greens", meal_type: "dinner" }])).toMatchObject({ saved: 1 });
    expect(mocks.invoke).toHaveBeenCalledExactlyOnceWith("analyzeMeal", expect.objectContaining({ raw_text: "Salmon and greens" }));
  });
});

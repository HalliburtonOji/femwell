import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("@/api/base44Client", () => ({ base44: { functions: { invoke: vi.fn() } } }));
vi.mock("@/components/community/communityAnon", () => ({ communityHash: vi.fn() }));
import { base44 } from "@/api/base44Client";
import { markChapterRead, readingDaySet, recordProgress } from "./readingActivity";

beforeEach(() => {
  const rows = new Map();
  vi.stubGlobal("localStorage", {
    get length() { return rows.size; }, key: index => [...rows.keys()][index] ?? null,
    getItem: key => rows.get(key) ?? null, setItem: (key, value) => rows.set(key, String(value)),
  });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("nourishes the Garden on the reader's local day after a BST midnight", () => {
  vi.stubEnv("TZ", "Europe/London");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-15T23:15:00Z"));
  markChapterRead("1342", 0);
  expect(localStorage.getItem("fw_read_1342_0")).toBe("2026-10-16");
  expect(readingDaySet().has("2026-10-16")).toBe(true);
});

it("acknowledges a local Garden day and refuses an undeduplicated remote send when storage fails", () => {
  expect(recordProgress("story-one", 1, null)).toBe(true);
  expect(readingDaySet().size).toBe(1);
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => { throw new Error("storage denied"); } });
  expect(recordProgress("story-two", 2, "owner")).toBe(false);
  expect(base44.functions.invoke).not.toHaveBeenCalled();
});

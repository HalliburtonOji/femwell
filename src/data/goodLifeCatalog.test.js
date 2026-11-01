import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryClientInstance } from "@/lib/query-client";
import { goodLifePublishedCatalog } from "./goodLifeCatalog";

const mock = vi.hoisted(() => ({ filter: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { entities: { LifestyleItems: { filter: mock.filter } } } }));

beforeEach(() => { queryClientInstance.clear(); mock.filter.mockReset(); vi.useRealTimers(); });

describe("shared Good life published catalogue", () => {
  it("shares the exact 500-row edition across nearby rooms without changing its query", async () => {
    const rows = [{ id: "published" }];
    mock.filter.mockResolvedValue(rows);
    const [first, second] = await Promise.all([goodLifePublishedCatalog(), goodLifePublishedCatalog()]);
    expect(first).toBe(rows);
    expect(second).toBe(rows);
    expect(await goodLifePublishedCatalog()).toBe(rows);
    expect(mock.filter).toHaveBeenCalledExactlyOnceWith({ status: "PUBLISHED" }, "-engagement_score", 500);
  });
  it("retries a failed source on the next visit instead of caching an empty shelf", async () => {
    mock.filter.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([{ id: "recovered" }]);
    await expect(goodLifePublishedCatalog()).rejects.toThrow("offline");
    expect(await goodLifePublishedCatalog()).toEqual([{ id: "recovered" }]);
    expect(mock.filter).toHaveBeenCalledTimes(2);
  });
});

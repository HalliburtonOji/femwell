import { beforeEach, describe, expect, it, vi } from "vitest";
import { removeSavedItem, saveItem } from "./savedItems";

const mock = vi.hoisted(() => ({ owner: "a", rows: [], me: vi.fn(), filter: vi.fn(), create: vi.fn(), remove: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: {
  auth: { me: mock.me },
  entities: { SavedItems: { filter: mock.filter, create: mock.create, delete: mock.remove } },
} }));

const row = (owner, id = `keep-${owner}`) => ({ id, user_id: owner, item_type: "LIFESTYLE", item_id: "sky-lesson:earthshine:v1" });

beforeEach(() => {
  mock.owner = "a";
  mock.rows = [row("a"), row("b")];
  mock.me.mockReset().mockImplementation(async () => ({ id: mock.owner }));
  mock.filter.mockReset().mockImplementation(async ({ user_id, item_type, item_id }, _sort, limit, skip = 0) =>
    mock.rows.filter(item => item.user_id === user_id && item.item_type === item_type && item.item_id === item_id).slice(skip, limit ? skip + limit : undefined));
  mock.create.mockReset().mockImplementation(async item => {
    const created = { id: "new", ...item };
    mock.rows.push(created);
    return created;
  });
  mock.remove.mockReset().mockImplementation(async id => { mock.rows = mock.rows.filter(item => item.id !== id); });
});

describe("an expected owner's saved collection", () => {
  it("refuses a stale mounted owner before it touches the current account", async () => {
    mock.owner = "b";
    await expect(removeSavedItem("LIFESTYLE", row("a").item_id, "a")).rejects.toThrow("account changed");
    await expect(saveItem({ itemType: "LIFESTYLE", itemId: row("a").item_id, title: "Earthshine", expectedOwnerId: "a" })).rejects.toThrow("account changed");
    expect(mock.filter).not.toHaveBeenCalled();
    expect(mock.remove).not.toHaveBeenCalled();
    expect(mock.create).not.toHaveBeenCalled();
    expect(mock.rows).toHaveLength(2);
  });

  it("stops before deletion if the account changes during the matching lookup", async () => {
    mock.filter.mockImplementationOnce(async () => { mock.owner = "b"; return [row("a")]; });
    await expect(removeSavedItem("LIFESTYLE", row("a").item_id, "a")).rejects.toThrow("account changed");
    expect(mock.remove).not.toHaveBeenCalled();
    expect(mock.rows).toHaveLength(2);
  });

  it("removes only the expected exact row and confirms its absence", async () => {
    const removed = await removeSavedItem("LIFESTYLE", row("a").item_id, "a");
    expect(removed?.id).toBe("keep-a");
    expect(mock.rows.map(item => item.id)).toEqual(["keep-b"]);
    expect(await removeSavedItem("LIFESTYLE", row("a").item_id, "a")).toBeNull();
  });

  it("does not create a keep after the account changes during duplicate lookup", async () => {
    mock.rows = [];
    mock.filter.mockImplementationOnce(async () => { mock.owner = "b"; return []; });
    await expect(saveItem({ itemType: "LIFESTYLE", itemId: row("a").item_id, title: "Earthshine", expectedOwnerId: "a" })).rejects.toThrow("account changed");
    expect(mock.create).not.toHaveBeenCalled();
  });
});

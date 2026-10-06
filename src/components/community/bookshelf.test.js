import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const api = vi.hoisted(() => ({ filter: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { entities: { UserBook: api, Book: { filter: vi.fn().mockResolvedValue([{ id: "metadata" }]), create: vi.fn() } } } }));
import { addBook, loadShelf, readLocal, removeBook, setStatus } from "./bookshelf";
const book = { title: "Persuasion", author: "Jane Austen", gutenberg_id: "105", status: "want", source: "curated" };
const row = { ...book, id: "owned", user_id: "alice", book_key: "g:105" };
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const storage = () => { const entries = new Map(); return { get length() { return entries.size; }, key: index => [...entries.keys()][index] ?? null, getItem: key => entries.get(String(key)) ?? null, setItem: (key,value) => entries.set(String(key),String(value)), removeItem: key => entries.delete(String(key)), clear: () => entries.clear() }; };
beforeEach(() => { vi.stubGlobal("localStorage", storage()); vi.clearAllMocks(); api.filter.mockResolvedValue([]); api.create.mockResolvedValue({ id: "created" }); api.update.mockResolvedValue({}); api.delete.mockResolvedValue({}); });
afterEach(() => vi.unstubAllGlobals());
describe("one acknowledged Books shelf", () => {
  it("updates an existing want book to reading without creating a second record", async () => {
    api.filter.mockResolvedValue([row]);
    const rows = await addBook("alice", { ...book, status: "reading" });
    expect(api.create).not.toHaveBeenCalled();
    expect(api.update).toHaveBeenCalledWith("owned", expect.objectContaining({ status: "reading" }));
    expect(rows).toEqual([expect.objectContaining({ key: "g:105", status: "reading", source: "curated", _sync: "confirmed" })]);
  });
  it("keeps the prior status until the entity acknowledges the update", async () => {
    api.filter.mockResolvedValue([row]); await loadShelf("alice");
    const gate = deferred(); api.update.mockReturnValue(gate.promise);
    const saving = setStatus("alice", "g:105", "finished");
    await vi.waitFor(() => expect(api.update).toHaveBeenCalled());
    expect(readLocal("alice")[0].status).toBe("want");
    gate.resolve({}); await saving;
    expect(readLocal("alice")[0].status).toBe("finished");
  });
  it("retains prior mirror on rejected change and accepts a real retry", async () => {
    api.filter.mockResolvedValue([row]); await loadShelf("alice");
    api.update.mockRejectedValueOnce(new Error("offline"));
    await expect(setStatus("alice", "g:105", "reading")).rejects.toThrow("offline");
    expect(readLocal("alice")[0].status).toBe("want");
    await setStatus("alice", "g:105", "reading");
    expect(readLocal("alice")[0].status).toBe("reading");
  });
  it("serialises rapid adds of the same identity", async () => {
    let exists = false;
    api.filter.mockImplementation(async () => exists ? [row] : []);
    api.create.mockImplementation(async () => { exists = true; return { id: "created" }; });
    await Promise.all([addBook("alice", book), addBook("alice", { ...book, status: "reading" })]);
    expect(api.create).toHaveBeenCalledTimes(1);
    expect(readLocal("alice")).toHaveLength(1);
    expect(readLocal("alice")[0].status).toBe("reading");
  });
  it("does not treat failed lookup as permission to create", async () => {
    api.filter.mockRejectedValue(new Error("unavailable"));
    await expect(addBook("alice", book)).rejects.toThrow();
    expect(api.create).not.toHaveBeenCalled();
  });
  it("preserves duplicates physically while reconciling status on every owned row", async () => {
    api.filter.mockResolvedValue([row, { ...row, id: "duplicate" }, { ...row, id: "foreign", user_id: "bob" }]);
    await addBook("alice", { ...book, status: "set_aside" });
    expect(api.update.mock.calls.map(args => args[0]).sort()).toEqual(["duplicate", "owned"]);
    expect(api.delete).not.toHaveBeenCalled();
    expect(readLocal("alice")).toHaveLength(1);
  });
  it("reports partial duplicate deletion failure without falsely removing the mirror", async () => {
    api.filter.mockResolvedValue([row, { ...row, id: "duplicate" }]); await loadShelf("alice");
    api.delete.mockImplementation(id => id === "duplicate" ? Promise.reject(new Error("blocked")) : Promise.resolve());
    await expect(removeBook("alice", "g:105")).rejects.toThrow("blocked");
    expect(readLocal("alice")).toHaveLength(1);
    api.delete.mockResolvedValue({}); await removeBook("alice", "g:105");
    expect(readLocal("alice")).toEqual([]);
  });
  it("reads past 150 rows without dropping real books", async () => {
    const many = Array.from({ length: 151 }, (_, i) => ({ ...row, id: `r${i}`, book_key: `g:${i}`, gutenberg_id: String(i) }));
    api.filter.mockImplementation(async (_query, _sort, _limit, skip) => many.slice(skip, skip + 150));
    const rows = await loadShelf("alice", { strict: true });
    expect(rows).toHaveLength(151);
    expect(api.filter).toHaveBeenLastCalledWith({ user_id: "alice" }, "-created_date", 150, 150);
  });
  it("keeps owner scopes separate and never migrates the global offline shelf", async () => {
    localStorage.setItem("fw_bookshelf", JSON.stringify([book]));
    expect(await loadShelf("alice")).toEqual([]);
    expect(api.create).not.toHaveBeenCalled();
    await addBook("bob", book);
    expect(readLocal("alice")).toEqual([]);
    expect(readLocal("bob")).toHaveLength(1);
  });
  it("migrates the owner's legacy device book but does not resurrect deleted confirmed rows", async () => {
    localStorage.setItem("fw_bookshelf::alice", JSON.stringify([book]));
    await loadShelf("alice"); expect(api.create).toHaveBeenCalledTimes(1);
    expect(readLocal("alice")[0]._sync).toBe("confirmed");
    api.create.mockClear();
    expect(await loadShelf("alice")).toEqual([]);
    expect(api.create).not.toHaveBeenCalled();
  });
  it("prevents an older fetch from overwriting a newer acknowledged mutation", async () => {
    api.filter.mockResolvedValue([row]); await loadShelf("alice");
    const gate = deferred(); api.filter.mockImplementation(query => query.book_key ? Promise.resolve([row]) : gate.promise);
    const loading = loadShelf("alice");
    await setStatus("alice", "g:105", "finished"); gate.resolve([row]);
    expect((await loading)[0].status).toBe("finished");
    expect(readLocal("alice")[0].status).toBe("finished");
  });
  it("makes remote errors explicit in strict mode and labels device fallback otherwise", async () => {
    localStorage.setItem("fw_bookshelf::alice", JSON.stringify([book])); api.filter.mockRejectedValue(new Error("offline"));
    await expect(loadShelf("alice", { strict: true })).rejects.toThrow("offline");
    const rows = await loadShelf("alice"); expect(rows[0]._sync).toBe("device"); expect(rows.syncError).toMatch(/device/);
  });
  it("rejects invalid statuses without making an entity call", async () => {
    await expect(setStatus("alice", "g:105", "lost")).rejects.toThrow(); expect(api.filter).not.toHaveBeenCalled();
  });
});

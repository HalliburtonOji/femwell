import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLifestyleKeeps } from "./useLifestyleKeeps";

const api = vi.hoisted(() => ({ saved: vi.fn(), source: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { entities: {
  SavedItems: { filter: api.saved }, LifestyleItems: { filter: api.source },
} } }));
const keep = (id = "record", itemId = "read", owner = "owner") => ({ id, item_id: itemId, item_type: "LIFESTYLE", user_id: owner, title: `Kept ${itemId}` });
const item = (id = "read") => ({ id, title: `Source ${id}`, content_type: "ARTICLE", status: "PUBLISHED" });
const initial = () => ({ ownerId: "owner", enabled: true, profile: { id: "profile", user_id: "owner" }, savedIds: [], items: [], revision: 0 });
const deferred = () => { let resolve, reject; const promise = new Promise((ok, no) => { resolve = ok; reject = no; }); return { promise, resolve, reject }; };
beforeEach(() => { vi.resetAllMocks(); api.saved.mockResolvedValue([keep()]); api.source.mockImplementation(async ({ id }) => [item(id)]); });

describe("complete, owner-scoped Lifestyle keeps", () => {
  it("retains typed physical-only content and exact tools without an extra profile save", async () => {
    const { result } = renderHook(useLifestyleKeeps, { initialProps: initial() });
    await waitFor(() => expect(result.current.archiveKeeps).toHaveLength(1));
    expect(result.current.archiveKeeps[0]).toMatchObject({ _lifestyleItem: item(), _href: "/LifestyleDetail?id=read" });
    expect(result.current.archiveKeeps[0]._savedRecords).toEqual([keep()]);
  });
  it("reuses the collection and exact missing source across profile and pool re-renders", async () => {
    const props = initial(); const { result, rerender } = renderHook(useLifestyleKeeps, { initialProps: props });
    await waitFor(() => expect(result.current.archiveKeeps).toHaveLength(1));
    rerender({ ...props, profile: { ...props.profile, interests: ["books"] }, items: [item("another")] });
    await waitFor(() => expect(result.current.archiveKeeps[0]._lifestyleItem).toEqual(item()));
    expect(api.saved).toHaveBeenCalledTimes(1); expect(api.source).toHaveBeenCalledTimes(1);
  });
  it("shares a pending exact lookup when an unrelated pool arrives", async () => {
    const pending = deferred(); api.source.mockReturnValue(pending.promise);
    const props = { ...initial(), savedIds: ["read"] };
    const { result, rerender } = renderHook(useLifestyleKeeps, { initialProps: props });
    await waitFor(() => expect(api.source).toHaveBeenCalledTimes(1));
    rerender({ ...props, items: [item("another")] });
    await act(async () => pending.resolve([item()]));
    await waitFor(() => expect(result.current.archiveKeeps[0]._lifestyleItem).toEqual(item()));
    expect(api.source).toHaveBeenCalledTimes(1); expect(api.saved).toHaveBeenCalledTimes(1);
  });
  it("retains confirmed same-owner keeps on failure, then accepts a complete empty retry", async () => {
    const props = initial(); const { result, rerender } = renderHook(useLifestyleKeeps, { initialProps: props });
    await waitFor(() => expect(result.current.archiveKeeps).toHaveLength(1));
    api.saved.mockRejectedValueOnce(new Error("offline")); rerender({ ...props, revision: 1 });
    await waitFor(() => expect(result.current.keepsError).toMatch(/couldn’t load/));
    expect(result.current.archiveKeeps.map(row => row.id)).toEqual(["record"]);
    api.saved.mockResolvedValue([]); rerender({ ...props, revision: 2 });
    await waitFor(() => expect(result.current.archiveKeeps).toHaveLength(0));
    expect(result.current.keepsError).toBe("");
  });
  it("keeps successful pages visible when a later page fails; retry reads the complete history", async () => {
    const page = Array.from({ length: 150 }, (_, index) => keep(`row-${index}`, `read-${index}`));
    api.saved.mockImplementation(async (_query, _sort, _limit, skip) => { if (skip === 0) return page; throw new Error("page two offline"); });
    const props = initial(); const { result, rerender } = renderHook(useLifestyleKeeps, { initialProps: props });
    await waitFor(() => expect(result.current.archiveKeeps).toHaveLength(150));
    expect(result.current.keepsError).toMatch(/couldn’t load/);
    api.saved.mockImplementation(async (_query, _sort, _limit, skip) => skip === 0 ? page : [keep("older", "older-read")]);
    rerender({ ...props, revision: 1 });
    await waitFor(() => expect(result.current.archiveKeeps).toHaveLength(151));
    expect(result.current.keepsError).toBe("");
    expect(api.saved).toHaveBeenCalledWith({ user_id: "owner" }, "-created_at", 150, 150);
  });
  it("does not expose old rows or settle an old owner's pending response after account change", async () => {
    const pending = deferred(); const props = initial();
    api.saved.mockImplementation(async ({ user_id }) => user_id === "owner" ? pending.promise : [keep("new", "new-read", "next")]);
    const { result, rerender } = renderHook(useLifestyleKeeps, { initialProps: props });
    rerender({ ...props, ownerId: "next", profile: null });
    expect(result.current.archiveKeeps).toEqual([]);
    await waitFor(() => expect(result.current.archiveKeeps[0]?.user_id).toBe("next"));
    await act(async () => pending.resolve([keep()]));
    expect(result.current.archiveKeeps.map(row => row.id)).toEqual(["new"]);
    expect(api.source).not.toHaveBeenCalledWith({ id: "read" }, undefined, 1);
  });
  it("shows a failed source honestly, rejects wrong identity, and recovers on explicit retry", async () => {
    api.source.mockResolvedValue([{ ...item(), id: "wrong" }]);
    const props = initial(); const { result, rerender } = renderHook(useLifestyleKeeps, { initialProps: props });
    await waitFor(() => expect(result.current.archiveKeeps[0]?._unavailable).toBe("This find couldn’t load."));
    expect(result.current.archiveKeeps[0]._href).toBeNull();
    api.source.mockResolvedValue([item()]); rerender({ ...props, revision: 1 });
    await waitFor(() => expect(result.current.archiveKeeps[0]?._href).toBe("/LifestyleDetail?id=read"));
  });
  it("invalidates exact content on subscription without rescan of the saved collection", async () => {
    const { result } = renderHook(useLifestyleKeeps, { initialProps: initial() });
    await waitFor(() => expect(result.current.archiveKeeps).toHaveLength(1));
    api.source.mockResolvedValue([{ ...item(), title: "Updated source" }]);
    act(() => result.current.invalidateSources());
    await waitFor(() => expect(result.current.archiveKeeps[0]._lifestyleItem.title).toBe("Updated source"));
    expect(api.saved).toHaveBeenCalledTimes(1); expect(api.source).toHaveBeenCalledTimes(2);
  });
  it("does not resurrect an acknowledged removal on a later pool render or older refresh", async () => {
    const props = initial(); const { result, rerender } = renderHook(useLifestyleKeeps, { initialProps: props });
    await waitFor(() => expect(result.current.archiveKeeps).toHaveLength(1));
    const pending = deferred(); api.saved.mockReturnValue(pending.promise);
    rerender({ ...props, revision: 1 });
    act(() => result.current.removeConfirmed("owner", row => row.item_id === "read"));
    rerender({ ...props, revision: 1, items: [item("other")] });
    await act(async () => pending.resolve([keep()]));
    await waitFor(() => expect(result.current.archiveKeeps).toEqual([]));
  });
  it("clears the visible collection when signed out, including a pending exact response", async () => {
    const pending = deferred(); api.source.mockReturnValue(pending.promise);
    const props = initial(); const { result, rerender } = renderHook(useLifestyleKeeps, { initialProps: props });
    await waitFor(() => expect(api.source).toHaveBeenCalledTimes(1));
    rerender({ ...props, ownerId: null, profile: null });
    await act(async () => pending.resolve([item()]));
    expect(result.current.archiveKeeps).toEqual([]); expect(result.current.resolvedKeeps).toEqual([]);
  });
  it("does not relabel a previous owner's still-loading profile IDs as new-owner keeps", async () => {
    const props = { ...initial(), savedIds: ["private-old-read"] };
    const { result, rerender } = renderHook(useLifestyleKeeps, { initialProps: props });
    await waitFor(() => expect(result.current.archiveKeeps).toHaveLength(2));
    api.saved.mockResolvedValue([keep("new-record", "new-read", "next")]); api.source.mockClear();
    rerender({ ...props, ownerId: "next" });
    expect(result.current.archiveKeeps).toEqual([]);
    await waitFor(() => expect(result.current.archiveKeeps.map(row => row.item_id)).toEqual(["new-read"]));
    expect(api.source).not.toHaveBeenCalledWith({ id: "private-old-read" }, undefined, 1);
    expect(result.current.archiveKeeps[0]._profileId).toBeUndefined();
  });
  it("keeps unrelated physical saves when an actionable profile keep is removed during initial scan", async () => {
    const scan = deferred(); api.saved.mockReturnValue(scan.promise);
    const props = { ...initial(), savedIds: ["read"] };
    const { result, rerender } = renderHook(useLifestyleKeeps, { initialProps: props });
    await waitFor(() => expect(result.current.archiveKeeps[0]?.item_id).toBe("read"));
    act(() => { result.current.removeConfirmed("owner", row => row.item_id === "read"); rerender({ ...props, savedIds: [] }); });
    await act(async () => scan.resolve([keep(), keep("other-record", "other-read")]));
    await waitFor(() => expect(result.current.archiveKeeps.map(row => row.item_id)).toEqual(["other-read"]));
    expect(api.saved).toHaveBeenCalledTimes(1);
  });
  it("refreshes the actual existing save-change event, without polling or feed-triggered archive reads", async () => {
    const { result } = renderHook(useLifestyleKeeps, { initialProps: initial() });
    await waitFor(() => expect(result.current.archiveKeeps).toHaveLength(1));
    api.saved.mockResolvedValue([keep("new-record", "new-read")]);
    act(() => window.dispatchEvent(new Event("fw_sky_lesson_saved")));
    await waitFor(() => expect(result.current.archiveKeeps.map(row => row.item_id)).toEqual(["new-read"]));
    expect(api.saved).toHaveBeenCalledTimes(2);
  });
});

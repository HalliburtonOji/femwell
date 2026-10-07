import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLifestyleFeed } from "./useLifestyleFeed";
const api = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { functions: { invoke: api.invoke } } }));
const read = { id: "article", title: "The real read", content_type: "ARTICLE" };
const video = { id: "video", title: "A real watch", content_type: "VIDEO" };
const pending = () => { let resolve, reject; const promise = new Promise((ok, no) => { resolve = ok; reject = no; }); return { promise, resolve, reject }; };
beforeEach(() => { vi.resetAllMocks(); api.invoke.mockResolvedValue({ data: { items: [read, video] } }); });
describe("one personalised ranking for both existing views", () => {
  it("makes one function call for read picks and the complete phase rail; rerender adds none", async () => {
    const props = { ownerId: "owner", phase: "follicular" };
    const { result, rerender } = renderHook(({ ownerId, phase }) => useLifestyleFeed(ownerId, phase), { initialProps: props });
    await waitFor(() => expect(result.current.phaseFeed).toEqual([read, video]));
    expect(result.current.feed).toEqual([read]); rerender({ ...props });
    expect(api.invoke).toHaveBeenCalledTimes(1);
    expect(api.invoke).toHaveBeenCalledWith("getLifestyleFeed", { mode: "for_you", page: 0, page_size: 12, phase: "follicular" });
  });
  it("never replaces a new phase with a late old phase, including old failures", async () => {
    const old = pending(); api.invoke.mockReturnValueOnce(old.promise);
    const { result, rerender } = renderHook(({ phase }) => useLifestyleFeed("owner", phase), { initialProps: { phase: "follicular" } });
    rerender({ phase: "luteal" });
    await waitFor(() => expect(result.current.feed).toEqual([read]));
    await act(async () => old.reject(new Error("old phase offline")));
    expect(result.current.phaseFeed).toEqual([read, video]); expect(api.invoke).toHaveBeenCalledTimes(2);
  });
  it("does not expose an earlier account's ranking during a new pending request or sign-out", async () => {
    const next = pending(); api.invoke.mockResolvedValueOnce({ data: { items: [read] } }).mockReturnValueOnce(next.promise);
    const { result, rerender } = renderHook(({ owner }) => useLifestyleFeed(owner, "follicular"), { initialProps: { owner: "one" } });
    await waitFor(() => expect(result.current.feed).toEqual([read])); rerender({ owner: "two" });
    expect(result.current.feed).toBeNull(); expect(result.current.phaseFeed).toEqual([]);
    rerender({ owner: null }); await act(async () => next.resolve({ data: { items: [read] } }));
    expect(result.current.feed).toBeNull(); expect(result.current.phaseFeed).toEqual([]);
  });
  it("keeps non-phase read recommendations and permits recovery after rejected work", async () => {
    api.invoke.mockRejectedValueOnce(new Error("offline"));
    const { result, rerender } = renderHook(({ phase }) => useLifestyleFeed("owner", phase), { initialProps: { phase: null } });
    await act(async () => {}); expect(result.current.feed).toBeNull();
    rerender({ phase: "" }); await waitFor(() => expect(result.current.feed).toEqual([read]));
    expect(result.current.phaseFeed).toEqual([]); expect(api.invoke).toHaveBeenCalledTimes(2);
  });
});

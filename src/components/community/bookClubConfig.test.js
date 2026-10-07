import { beforeEach, expect, it, vi } from "vitest";
const api = vi.hoisted(() => ({ picks: vi.fn(), checkpoints: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { entities: { BookClubPick: { filter: api.picks }, ClubCheckpoint: { filter: api.checkpoints } } } }));
import { loadBookClubPick, SEED_PICK } from "./bookClubConfig";
beforeEach(() => { vi.clearAllMocks(); api.picks.mockResolvedValue([]); api.checkpoints.mockResolvedValue([]); });
it("uses actual live book and only its sorted, unique checkpoints", async () => {
  api.picks.mockResolvedValue([{ pick_key: "persuasion", title: "Persuasion", gutenberg_id: 105, active: true }]);
  api.checkpoints.mockResolvedValue([{ pick_key: "persuasion", index: 2, label: "End" }, { pick_key: "foreign", index: 0, label: "Other book" }, { pick_key: "persuasion", index: 0, label: "Start" }, { pick_key: "persuasion", index: 2, label: "Duplicate" }]);
  const pick = await loadBookClubPick(); expect(pick.title).toBe("Persuasion"); expect(pick.gutenberg_id).toBe("105"); expect(pick.checkpoints.map(cp => cp.label)).toEqual(["Start", "End"]);
});
it("uses authored seed only after a successful empty active query", async () => {
  expect(await loadBookClubPick()).toEqual({ ...SEED_PICK, _origin: "seed" }); expect(api.checkpoints).not.toHaveBeenCalled();
});
it("does not borrow the seed checkpoints when live pick has none", async () => {
  api.picks.mockResolvedValue([{ pick_key: "new", title: "New", active: true }]);
  expect((await loadBookClubPick()).checkpoints).toEqual([]);
});
it("rejects pick and checkpoint errors rather than silently substituting another book", async () => {
  api.picks.mockRejectedValueOnce(new Error("offline")); await expect(loadBookClubPick()).rejects.toThrow("offline");
  api.picks.mockResolvedValue([{ pick_key: "new", title: "New", active: true }]); api.checkpoints.mockRejectedValue(new Error("missing")); await expect(loadBookClubPick()).rejects.toThrow("missing");
});
it("rejects malformed active records rather than presenting a misleading seed", async () => {
  api.picks.mockResolvedValue([{id:"invalid",active:true}]); await expect(loadBookClubPick()).rejects.toThrow(/identify/);
});
it("loads an inactive exact pick and only its own checkpoints without an archive scan", async () => {
  api.picks.mockResolvedValue([{ pick_key: "past-read", title: "An earlier book", active: false, gutenberg_id: 105 }]);
  api.checkpoints.mockResolvedValue([{pick_key:"past-read",index:0,label:"Its first part"}]);
  expect((await loadBookClubPick("past-read")).title).toBe("An earlier book");
  expect(api.picks).toHaveBeenCalledExactlyOnceWith({pick_key:"past-read"},"-created_date",1);
  expect(api.checkpoints).toHaveBeenCalledExactlyOnceWith({pick_key:"past-read"},"index",150);
});
it("a missing requested pick stays missing and never substitutes the active or seed book", async () => {
  expect(await loadBookClubPick("removed-pick")).toBeNull();
  expect(api.checkpoints).not.toHaveBeenCalled();
  expect((await loadBookClubPick(SEED_PICK.pick_key)).pick_key).toBe(SEED_PICK.pick_key);
});
it.each(["", "../other", "pick?other", "x".repeat(161)])("invalid exact key %s makes no query", async key => {
  expect(await loadBookClubPick(key)).toBeNull(); expect(api.picks).not.toHaveBeenCalled();
});
it("foreign exact response and failed seed lookup are errors, never successful fallback", async () => {
  api.picks.mockResolvedValue([{pick_key:"current",title:"Other book",active:true}]);
  await expect(loadBookClubPick("past")).rejects.toThrow(/identify/);
  expect(api.checkpoints).not.toHaveBeenCalled();
  api.picks.mockRejectedValue(new Error("offline"));
  await expect(loadBookClubPick(SEED_PICK.pick_key)).rejects.toThrow("offline");
});

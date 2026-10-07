import React, { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLifestyleKeepAcknowledgements } from "./useLifestyleKeepAcknowledgements";
import { useLifestyleKeeps } from "./useLifestyleKeeps";
import LifestyleDetail from "@/pages/LifestyleDetail";
import Saved from "@/pages/Saved";

const api = vi.hoisted(() => ({ me: vi.fn(), profiles: vi.fn(), physical: vi.fn(), items: vi.fn(), update: vi.fn(), create: vi.fn(), remove: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: { auth: { me: api.me }, entities: {
  UserProfile: { filter: api.profiles, update: api.update, create: api.create },
  SavedItems: { filter: api.physical, delete: api.remove }, LifestyleItems: { filter: api.items },
} } }));
vi.mock("@/components/common/ContentActionBar", () => ({ default: () => <div>Reading tools</div> }));
vi.mock("@/components/share/ShareButton", () => ({ default: () => <button>Share this read</button> }));
const article = { id: "article", title: "A real kept story", content_type: "STORY", provider: "EDITORIAL", summary: "The complete story stays here.", category: "Culture" };
const itemPool = [article];
const physicalRow = { id: "physical", user_id: "reader", item_type: "LIFESTYLE", item_id: "article", title: article.title };
let serverProfile, serverPhysical;
function MountedYours({ ownerId = "reader", initialIds = [] }) {
  const [profile, setProfile] = useState({ id: "profile", user_id: "reader", saved_item_ids: initialIds, life_stage: "perimenopause" });
  const [savedIds, setSavedIds] = useState(initialIds);
  useLifestyleKeepAcknowledgements({ ownerId, setProfile, setSavedIds });
  const keeps = useLifestyleKeeps({ ownerId, enabled: true, profile, savedIds, items: itemPool, revision: 0 });
  return <><output aria-label="Mounted keeps">{keeps.archiveKeeps.map(row => row.title).join("|")}</output><output aria-label="Preserved phase">{profile?.life_stage}</output></>;
}
function open(initialIds = []) {
  return render(<MemoryRouter initialEntries={["/LifestyleDetail?id=article"]}><MountedYours initialIds={initialIds} /><LifestyleDetail /></MemoryRouter>);
}
beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear(); window.history.replaceState({}, "", "/LifestyleDetail?id=article");
  serverProfile = { id: "profile", user_id: "reader", saved_item_ids: [], liked_item_ids: [] }; serverPhysical = [];
  api.me.mockResolvedValue({ id: "reader" });
  api.profiles.mockImplementation(async () => [serverProfile]);
  api.physical.mockImplementation(async query => serverPhysical.filter(row => row.user_id === query.user_id && (!query.item_id || row.item_id === query.item_id)));
  api.items.mockImplementation(async query => query.id === article.id ? [article] : []);
  api.update.mockImplementation(async (id, fields) => { serverProfile = { ...serverProfile, ...fields }; return { ...serverProfile, id }; });
  api.create.mockImplementation(async fields => ({ id: "new-profile", ...fields }));
  api.remove.mockImplementation(async id => { serverPhysical = serverPhysical.filter(row => row.id !== id); return {}; });
});
describe("confirmed source actions reach the kept-open Yours consumer", () => {
  it("adds and removes a profile-only keep through the actual reader, bridge and archive without rescanning physical history", async () => {
    open(); await waitFor(() => expect(screen.getByRole("button", { name: "Keep this find" })).toBeEnabled());
    const scans = () => api.physical.mock.calls.filter(([query]) => !query.item_id).length;
    expect(scans()).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Keep this find" }));
    await waitFor(() => expect(screen.getByLabelText("Mounted keeps")).toHaveTextContent(article.title));
    expect(screen.getByLabelText("Preserved phase")).toHaveTextContent("perimenopause");
    expect(api.create).not.toHaveBeenCalled(); expect(scans()).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Remove from keeps" }));
    await waitFor(() => expect(screen.getByLabelText("Mounted keeps")).toBeEmptyDOMElement());
    expect(serverProfile.saved_item_ids).toEqual([]); expect(scans()).toBe(1);
  });
  it("cannot resurrect an acknowledged physical removal from the archive's older pending page", async () => {
    serverProfile.saved_item_ids = ["article"]; serverPhysical = [physicalRow];
    let finishPage;
    api.physical.mockImplementation(query => query.item_id ? Promise.resolve([...serverPhysical]) : new Promise(resolve => { finishPage = resolve; }));
    open(["article"]); await waitFor(() => expect(screen.getByRole("button", { name: "Remove from keeps" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Remove from keeps" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Keep this find" })).toBeEnabled());
    await act(async () => finishPage([physicalRow]));
    await waitFor(() => expect(screen.getByLabelText("Mounted keeps")).toBeEmptyDOMElement());
    expect(api.remove).toHaveBeenCalledExactlyOnceWith("physical");
  });
  it("keeps the mounted snapshot when an action's fresh authority fails", async () => {
    serverProfile.saved_item_ids = ["article"];
    open(["article"]); await waitFor(() => expect(screen.getByRole("button", { name: "Remove from keeps" })).toBeEnabled());
    await waitFor(() => expect(screen.getByLabelText("Mounted keeps")).toHaveTextContent(article.title));
    api.profiles.mockRejectedValue(new Error("offline"));
    fireEvent.click(screen.getByRole("button", { name: "Remove from keeps" }));
    expect(await screen.findByRole("button", { name: "Retry keeps and likes" })).toBeEnabled();
    expect(screen.getByLabelText("Mounted keeps")).toHaveTextContent(article.title);
    expect(api.remove).not.toHaveBeenCalled(); expect(api.update).not.toHaveBeenCalled(); expect(api.create).not.toHaveBeenCalled();
  });
  it("removes both prior and final acknowledged duplicate records after the actual full Saved partial retry", async () => {
    serverProfile.saved_item_ids = ["article"];
    serverPhysical = [physicalRow, { ...physicalRow, id: "second-physical" }];
    let failedOnce = false;
    api.remove.mockImplementation(async id => {
      if (id === "second-physical" && !failedOnce) { failedOnce = true; throw new Error("offline"); }
      serverPhysical = serverPhysical.filter(row => row.id !== id); return {};
    });
    window.history.replaceState({}, "", "/Saved?tab=LIFESTYLE");
    render(<MemoryRouter initialEntries={["/Saved?tab=LIFESTYLE"]}><MountedYours initialIds={["article"]} /><Saved /></MemoryRouter>);
    await waitFor(() => expect(screen.getByLabelText("Mounted keeps")).toHaveTextContent(article.title));
    fireEvent.click(await screen.findByRole("button", { name: `Remove ${article.title}` }));
    await screen.findByText("That save couldn’t be removed completely. Try again.");
    await waitFor(() => expect(screen.getByRole("button", { name: `Remove ${article.title}` })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: `Remove ${article.title}` }));
    await waitFor(() => expect(screen.queryByRole("button", { name: `Remove ${article.title}` })).toBeNull());
    await waitFor(() => expect(screen.getByLabelText("Mounted keeps")).toBeEmptyDOMElement());
    expect(api.remove.mock.calls.map(([id]) => id)).toEqual(["physical", "second-physical", "second-physical"]);
  });
  it("rejects foreign and malformed acknowledgement data and retains original untyped refresh", async () => {
    render(<MountedYours />); await waitFor(() => expect(api.physical).toHaveBeenCalled());
    const count = api.physical.mock.calls.length;
    await act(async () => {
      window.dispatchEvent(new CustomEvent("fw_sky_lesson_saved", { detail: { ownerId: "other", itemId: "article", profile: { id: "p", user_id: "other", saved_item_ids: ["article"] } } }));
      window.dispatchEvent(new CustomEvent("fw_sky_lesson_saved", { detail: { ownerId: "reader", itemId: "article", profile: { id: "profile", user_id: "reader", saved_item_ids: "article" } } }));
      window.dispatchEvent(new CustomEvent("fw_sky_lesson_saved", { detail: { ownerId: null, itemId: "article" } }));
    });
    expect(screen.getByLabelText("Mounted keeps")).toBeEmptyDOMElement(); expect(api.physical).toHaveBeenCalledTimes(count);
    serverPhysical = [physicalRow];
    act(() => window.dispatchEvent(new CustomEvent("fw_sky_lesson_saved")));
    await waitFor(() => expect(screen.getByLabelText("Mounted keeps")).toHaveTextContent(article.title));
    expect(api.physical).toHaveBeenCalledTimes(count + 1);
  });
});

import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({ me: vi.fn(), items: vi.fn(), profiles: vi.fn(), saved: vi.fn(), createProfile: vi.fn(), updateProfile: vi.fn(), remove: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: {
  auth: { me: api.me },
  entities: {
    LifestyleItems: { filter: api.items }, UserProfile: { filter: api.profiles, create: api.createProfile, update: api.updateProfile },
    SavedItems: { filter: api.saved, delete: api.remove },
  },
} }));
vi.mock("@/hooks/usePodcastPlayer", () => ({ usePodcastPlayer: () => null }));

import Becoming from "./Becoming";

const source = {
  id: "becoming-source", status: "PUBLISHED", media_type: "ARTICLE",
  title: "Self-trust in ordinary days", summary: "The opening in brief.",
  lede: "The first real paragraph.\n\nThe second real paragraph.",
  content_url: "https://publisher.example/complete-read", source_name: "The Publisher",
};

async function openFeaturedRead() {
  await waitFor(() => expect(document.querySelector(".fw-becoming-clean .fw-bec-shelf button")).not.toBeNull());
  fireEvent.click(document.querySelector(".fw-becoming-clean .fw-bec-shelf button"));
  return screen.findByRole("button", { name: "Save", exact: true });
}

beforeEach(() => {
  vi.clearAllMocks();
  api.me.mockResolvedValue({ id: "reader-a" });
  api.items.mockResolvedValue([source]);
  api.profiles.mockResolvedValue([]);
  api.saved.mockResolvedValue([]);
  api.createProfile.mockResolvedValue({ id: "profile-a", user_id: "reader-a", saved_item_ids: [source.id] });
  api.updateProfile.mockResolvedValue({ id: "profile-a", user_id: "reader-a", saved_item_ids: [source.id] });
  api.remove.mockResolvedValue(undefined);
});

it("opens the complete source and persists a Becoming read into the shared saved collection", async () => {
  let profile = null;
  api.profiles.mockImplementation(async () => profile ? [profile] : []);
  api.createProfile.mockImplementation(async () => {
    profile = { id: "profile-a", user_id: "reader-a", saved_item_ids: [source.id] };
    return profile;
  });
  render(<Becoming />);
  await openFeaturedRead();
  expect(await screen.findByText("The first real paragraph.")).toBeVisible();
  expect(screen.getByText("The second real paragraph.")).toBeVisible();
  expect(screen.getByRole("link", { name: /Read at The Publisher/ })).toHaveAttribute("href", source.content_url);
  const save = screen.getByRole("button", { name: "Save", exact: true });
  fireEvent.click(save);
  await waitFor(() => expect(api.createProfile).toHaveBeenCalledWith(expect.objectContaining({ user_id: "reader-a", saved_item_ids: [source.id] })));
  await waitFor(() => expect(screen.getByRole("button", { name: "Saved", exact: true })).toHaveAttribute("aria-pressed", "true"));
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await openFeaturedRead();
  await waitFor(() => expect(screen.getByRole("button", { name: "Saved", exact: true })).toHaveAttribute("aria-pressed", "true"));
});

it("keeps Save retryable when the backend does not acknowledge the item for this account", async () => {
  api.createProfile.mockResolvedValue({ id: "wrong", user_id: "someone-else", saved_item_ids: [source.id] });
  render(<Becoming />);
  fireEvent.click(await openFeaturedRead());
  expect(await screen.findByRole("alert")).toHaveTextContent("That save didn't stick. Try again.");
  expect(screen.getByRole("button", { name: "Save", exact: true })).toHaveAttribute("aria-pressed", "false");
});

it("does not remove another account's keep after the signed-in account changes", async () => {
  let currentOwner = "reader-a";
  api.me.mockImplementation(async () => ({ id: currentOwner }));
  api.profiles.mockResolvedValue([{ id: "profile-a", user_id: "reader-a", saved_item_ids: [source.id] }]);
  render(<Becoming />);
  await openFeaturedRead();
  const saved = await screen.findByRole("button", { name: "Saved", exact: true });
  currentOwner = "reader-b";
  fireEvent.click(saved);
  expect(await screen.findByRole("alert")).toHaveTextContent("That save didn't stick. Try again.");
  expect(api.remove).not.toHaveBeenCalled();
  expect(api.updateProfile).not.toHaveBeenCalled();
});

it("removes both existing physical and profile keeps before reporting unsaved", async () => {
  let profile = { id: "profile-a", user_id: "reader-a", saved_item_ids: [source.id] };
  let physical = [{ id: "physical-a", user_id: "reader-a", item_type: "LIFESTYLE", item_id: source.id }];
  api.profiles.mockImplementation(async () => [profile]);
  api.saved.mockImplementation(async () => physical);
  api.remove.mockImplementation(async () => { physical = []; });
  api.updateProfile.mockImplementation(async (_id, data) => { profile = { ...profile, ...data }; return profile; });
  const events = [];
  const onSaved = event => events.push(event.detail);
  window.addEventListener("fw_sky_lesson_saved", onSaved);
  render(<Becoming />);
  await openFeaturedRead();
  fireEvent.click(await screen.findByRole("button", { name: "Saved", exact: true }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Save", exact: true })).toHaveAttribute("aria-pressed", "false"));
  expect(api.remove).toHaveBeenCalledWith("physical-a");
  expect(api.updateProfile).toHaveBeenCalledWith("profile-a", { saved_item_ids: [] });
  expect(events.at(-1)).toEqual(expect.objectContaining({ ownerId: "reader-a", itemId: source.id, removedSavedRecordIds: ["physical-a"] }));
  window.removeEventListener("fw_sky_lesson_saved", onSaved);
});

it("retains a partial removal receipt when a different read is saved before retry", async () => {
  const second = { ...source, id: "second-trust", title: "Second self-trust read" };
  api.items.mockResolvedValue([source, second]);
  let profile = { id: "profile-a", user_id: "reader-a", saved_item_ids: [source.id] };
  let physical = [{ id: "physical-a", user_id: "reader-a", item_type: "LIFESTYLE", item_id: source.id }];
  let failOnce = true;
  api.profiles.mockImplementation(async () => [profile]);
  api.saved.mockImplementation(async query => physical.filter(row => row.item_id === query.item_id));
  api.remove.mockImplementation(async () => { physical = []; });
  api.updateProfile.mockImplementation(async (_id, data) => {
    if (failOnce) { failOnce = false; throw new Error("Offline after deletion"); }
    profile = { ...profile, ...data }; return profile;
  });
  const events = [], onSaved = event => events.push(event.detail);
  window.addEventListener("fw_sky_lesson_saved", onSaved);
  render(<Becoming />);
  await openFeaturedRead();
  fireEvent.click(await screen.findByRole("button", { name: "Saved", exact: true }));
  expect(await screen.findByRole("alert")).toHaveTextContent("That save didn't stick. Try again.");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  fireEvent.click(document.querySelectorAll(".fw-becoming-clean .fw-bec-shelf .fw-folio-card__open")[1]);
  fireEvent.click(await screen.findByRole("button", { name: "Save", exact: true }));
  await screen.findByRole("button", { name: "Saved", exact: true });
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await openFeaturedRead();
  fireEvent.click(await screen.findByRole("button", { name: "Saved", exact: true }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Save", exact: true })).toHaveAttribute("aria-pressed", "false"));
  expect(events.at(-1)).toEqual(expect.objectContaining({ itemId: source.id, removedSavedRecordIds: ["physical-a"] }));
  window.removeEventListener("fw_sky_lesson_saved", onSaved);
}, 15000);

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

import Mirror from "./Mirror";
import Move from "./Move";

const mirrorRead = { id: "mirror-read", status: "PUBLISHED", category: "Fashion", media_type: "ARTICLE", title: "Colour in your wardrobe", summary: "An honest style idea.", lede: "A real first paragraph.\n\nA useful second paragraph.", content_url: "https://publisher.example/style", source_name: "Style Journal" };
const moveRead = { id: "move-read", status: "PUBLISHED", category: "Fitness", media_type: "ARTICLE", title: "Dance for the pleasure of it", summary: "Movement without a target.", lede: "Start with a song.\n\nStop whenever you like.", content_url: "https://publisher.example/move", source_name: "Movement Journal" };

beforeEach(() => {
  vi.clearAllMocks();
  let profile = null;
  api.me.mockResolvedValue({ id: "reader-a", email: "reader@example.test" });
  api.items.mockResolvedValue([mirrorRead, moveRead]);
  api.profiles.mockImplementation(async () => profile ? [profile] : []);
  api.saved.mockResolvedValue([]);
  api.createProfile.mockImplementation(async data => { profile = { id: "profile-a", ...data }; return profile; });
  api.updateProfile.mockImplementation(async (_id, data) => { profile = { ...profile, ...data }; return profile; });
  api.remove.mockResolvedValue(undefined);
});

it.each([
  ["Mirror", Mirror, ".fw-mirror-clean", mirrorRead, "A real first paragraph.", "Style Journal"],
  ["Move", Move, ".fw-move-clean", moveRead, "Start with a song.", "Movement Journal"],
])("opens and keeps the complete %s source in the clean room", async (_name, Room, root, item, body, source) => {
  render(<Room />);
  await waitFor(() => expect(document.querySelector(`${root} .fw-folio-card__open`)).not.toBeNull());
  expect(document.querySelector(`${root} .fw-good-hero`)).not.toBeNull();
  expect(document.querySelector(`${root} .fw-good-library`)).not.toBeNull();
  fireEvent.click(document.querySelector(`${root} .fw-folio-card__open`));
  expect(await screen.findByText(body)).toBeVisible();
  expect(screen.getByRole("link", { name: `Read at ${source}` })).toHaveAttribute("href", item.content_url);
  fireEvent.click(screen.getByRole("button", { name: "Save", exact: true }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Saved", exact: true })).toHaveAttribute("aria-pressed", "true"));
  expect(api.createProfile).toHaveBeenCalledWith(expect.objectContaining({ user_id: "reader-a", saved_item_ids: [item.id] }));
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("makes Mirror's three-minute ritual a real, dismissible action", async () => {
  render(<Mirror />);
  const ritual = screen.getByRole("button", { name: /The 3-minute getting-ready ritual/ });
  expect(ritual).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(ritual);
  expect(screen.getByRole("region", { name: "Three-minute getting-ready ritual" })).toBeVisible();
  expect(ritual).toHaveAttribute("aria-expanded", "true");
  fireEvent.click(screen.getByRole("button", { name: "Done for now" }));
  expect(ritual).toHaveAttribute("aria-expanded", "false");
});

it("does not offer a dead Read this action for a summary-only Mirror item", async () => {
  api.items.mockResolvedValue([{ ...mirrorRead, lede: undefined, content_url: undefined }]);
  render(<Mirror />);
  await waitFor(() => expect(document.querySelector(".fw-mirror-shelf .fw-folio-card__open")).not.toBeNull());
  fireEvent.click(document.querySelector(".fw-mirror-shelf .fw-folio-card__open"));
  expect(await screen.findByText("Only a summary is published here so far.")).toBeVisible();
  expect(screen.queryByRole("button", { name: /Read this|Open full-screen|Watch/ })).toBeNull();
});

it("shows an honest Move read failure and retries without hiding the movement snack", async () => {
  api.items.mockRejectedValueOnce(new Error("Temporary read failure"));
  render(<Move />);
  expect(await screen.findByRole("alert")).toHaveTextContent("The sessions didn't arrive.");
  expect(screen.getByText("A movement snack")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(document.querySelector(".fw-move-shelf .fw-folio-card__open")).not.toBeNull());
  expect(screen.queryByRole("alert")).toBeNull();
});

it("carries a Move podcast as a playable episode with its actual source", async () => {
  api.items.mockResolvedValue([{ ...moveRead, id: "move-podcast", media_type: "PODCAST", audio_url: "https://media.example/episode.mp3", episode_url: "https://publisher.example/episode", content_url: undefined }]);
  render(<Move />);
  await waitFor(() => expect(document.querySelector(".fw-move-shelf .fw-folio-card[data-media='audio']")).not.toBeNull());
  expect(document.querySelector(".fw-move-shelf audio")?.getAttribute("src")).toBe("https://media.example/episode.mp3");
  fireEvent.click(document.querySelector(".fw-move-shelf .fw-folio-card__open"));
  expect(await screen.findByText("Start with a song.")).toBeVisible();
  expect(screen.getByRole("dialog").querySelector(".fw-focused-eyebrow")).toHaveTextContent("Listen · Move");
  expect(screen.getByRole("link", { name: "Listen at Movement Journal" })).toHaveAttribute("href", "https://publisher.example/episode");
});

it("does not remove a Mirror keep after the signed-in account changes", async () => {
  let account = "reader-a";
  api.me.mockImplementation(async () => ({ id: account }));
  api.profiles.mockResolvedValue([{ id: "profile-a", user_id: "reader-a", saved_item_ids: [mirrorRead.id] }]);
  render(<Mirror />);
  await waitFor(() => expect(document.querySelector(".fw-mirror-shelf .fw-folio-card__open")).not.toBeNull());
  fireEvent.click(document.querySelector(".fw-mirror-shelf .fw-folio-card__open"));
  const saved = await screen.findByRole("button", { name: "Saved", exact: true });
  account = "reader-b";
  fireEvent.click(saved);
  expect(await screen.findByRole("alert")).toHaveTextContent("That save didn't stick. Try again.");
  expect(api.updateProfile).not.toHaveBeenCalled();
  expect(api.remove).not.toHaveBeenCalled();
});

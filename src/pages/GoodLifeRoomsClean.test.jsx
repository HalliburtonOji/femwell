import React from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({ me: vi.fn(), items: vi.fn(), profiles: vi.fn(), saved: vi.fn(), createProfile: vi.fn(), updateProfile: vi.fn(), remove: vi.fn(), stories: vi.fn(), readings: vi.fn(), goals: vi.fn(), createGoal: vi.fn() }));
vi.mock("@/api/base44Client", () => ({ base44: {
  auth: { me: api.me },
  entities: {
    LifestyleItems: { filter: api.items }, UserProfile: { filter: api.profiles, create: api.createProfile, update: api.updateProfile },
    SavedItems: { filter: api.saved, delete: api.remove }, DailyStory: { filter: api.stories }, HoroscopeReading: { filter: api.readings },
    Goal: { filter: api.goals, create: api.createGoal },
  },
} }));
vi.mock("@/hooks/usePodcastPlayer", () => ({ usePodcastPlayer: () => null }));

import Mirror from "./Mirror";
import Move from "./Move";
import Kindred from "./Kindred";
import Curious from "./Curious";
import Delight from "./Delight";
import Nest from "./Nest";
import Tonight from "./Tonight";
import Make from "./Make";
import Outside from "./Outside";
import Money from "./Money";
import { isoDay } from "@/components/lifestyle/dailyStory";

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
  api.stories.mockResolvedValue([]);
  api.readings.mockResolvedValue([]);
  api.goals.mockResolvedValue([]);
  api.createGoal.mockResolvedValue({ id: "goal-one", user_id: "reader-a" });
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

it("keeps Kindred's solitude equal and opens a complete friendship source", async () => {
  const friendship = { id: "friend-1", status: "PUBLISHED", category: "Relationships", media_type: "ARTICLE", title: "An old friendship", summary: "Some friends stay.", lede: "The first real thought.\n\nThe second real thought.", content_url: "https://publisher.example/friends", source_name: "Kindred Review" };
  api.items.mockResolvedValue([friendship]);
  render(<Kindred />);
  await waitFor(() => expect(document.querySelector(".fw-kin-shelf .fw-folio-card__open")).not.toBeNull());
  fireEvent.click(screen.getByRole("button", { name: /Just solitude/ }));
  expect(screen.getByText(/Solitude you choose is rest/)).toBeVisible();
  expect(screen.queryByText(/A small hello/)).toBeNull();
  expect(screen.getByRole("link", { name: /See what's on in Events/ })).toBeVisible();
  expect(screen.queryByText(/Lonely tonight|meeting people beats/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /A friend/ }));
  fireEvent.click(document.querySelector(".fw-kin-shelf .fw-folio-card__open"));
  expect(await screen.findByText("The second real thought.")).toBeVisible();
  expect(screen.getByRole("link", { name: "Read at Kindred Review" })).toHaveAttribute("href", friendship.content_url);
});

it("keeps Kindred's library failure and Retry available during chosen solitude", async () => {
  api.items.mockRejectedValueOnce(new Error("read unavailable"));
  render(<Kindred />);
  fireEvent.click(screen.getByRole("button", { name: /Just solitude/ }));
  expect(await screen.findByRole("alert")).toHaveTextContent("The reads didn't arrive.");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  expect(screen.getByText(/Solitude you choose is rest/)).toBeVisible();
});

it("opens the Curious podcast from its separate source with audio and publisher exit", async () => {
  const read = { id: "science-1", status: "PUBLISHED", category: "Culture", media_type: "ARTICLE", title: "The science of a bluebell", summary: "A real question.", lede: "A full answer." };
  const podcast = { id: "pod-1", status: "PUBLISHED", category: "Culture", media_type: "PODCAST", title: "The history of bluebells", summary: "An episode.", lede: "The story begins.", audio_url: "https://media.example/bluebells.mp3", episode_url: "https://publisher.example/bluebells", source_name: "Wonder Radio" };
  api.items.mockImplementation(async query => query.media_type === "PODCAST" ? [podcast] : [read]);
  render(<Curious />);
  await waitFor(() => expect(document.querySelector(".fw-cur-shelf .fw-folio-card__open")).not.toBeNull());
  expect(document.querySelector(".fw-cur-rabbit.fw-good-shelf .fw-folio-card__open")).not.toBeNull();
  fireEvent.click(screen.getByText(/More trails · science/));
  await waitFor(() => expect(document.querySelector(".fw-cur-shelf .fw-folio-card[data-media='audio']")).not.toBeNull());
  expect(document.querySelector(".fw-cur-shelf audio")?.getAttribute("src")).toBe(podcast.audio_url);
  fireEvent.click(document.querySelector(".fw-cur-shelf .fw-folio-card[data-media='audio'] .fw-folio-card__open"));
  expect(await screen.findByText("The story begins.")).toBeVisible();
  expect(screen.getByRole("link", { name: "Listen at Wonder Radio" })).toHaveAttribute("href", podcast.episode_url);
});

it("distinguishes a failed Curious podcast query from an empty podcast shelf and retries", async () => {
  const read = { id: "science-2", status: "PUBLISHED", category: "Culture", media_type: "ARTICLE", title: "The science of rain", summary: "A question." };
  api.items.mockImplementationOnce(async () => [read]).mockRejectedValueOnce(new Error("podcast read failed")).mockResolvedValue([read]);
  render(<Curious />);
  fireEvent.click(screen.getByText(/More trails · science/));
  expect(await screen.findByRole("alert")).toHaveTextContent("The listens didn't arrive.");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
});

it("keeps Delight's mood choice, full watch, play door and optional shelves", async () => {
  const watch = { id: "delight-watch", status: "PUBLISHED", category: "Entertainment", media_type: "ARTICLE", title: "A very funny TV show", summary: "A show for tonight.", lede: "A full and funny look at it.", content_url: "https://publisher.example/show", source_name: "Screen Review" };
  api.items.mockResolvedValue([watch]);
  render(<Delight />);
  await waitFor(() => expect(document.querySelector(".fw-del-shelf .fw-folio-card__open")).not.toBeNull());
  expect(screen.getByRole("link", { name: /Fancy a game/ })).toHaveAttribute("href", "/Community?view=games");
  fireEvent.click(screen.getByRole("button", { name: /A laugh/ }));
  expect(screen.getByRole("button", { name: /A laugh/ })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByText(/Today's extra pick/));
  expect(screen.getByText("One purely joyful thing")).toBeVisible();
  fireEvent.click(document.querySelector(".fw-del-shelf .fw-folio-card__open"));
  expect(await screen.findByText("A full and funny look at it.")).toBeVisible();
  expect(screen.getByRole("link", { name: "Read at Screen Review" })).toHaveAttribute("href", watch.content_url);
});

it("shows Delight's failed content request and retains the game door", async () => {
  api.items.mockRejectedValueOnce(new Error("read failed"));
  render(<Delight />);
  expect(await screen.findByRole("alert")).toHaveTextContent("The picks didn't arrive.");
  expect(screen.getByRole("link", { name: /Fancy a game/ })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
});

it("does not bury Delight's only matching music pick under unrelated television", async () => {
  const music = { id: "music-one", media_type: "ARTICLE", category: "Entertainment", title: "A new music album", summary: "Listen to this album.", lede: "A real music read." };
  const tv = [1, 2, 3, 4].map(id => ({ id: `tv-${id}`, media_type: "ARTICLE", category: "Entertainment", title: `A funny TV show ${id}`, summary: "A show to watch." }));
  api.items.mockResolvedValue([...tv, music]);
  render(<Delight />);
  fireEvent.click(screen.getByRole("button", { name: "Music" }));
  await waitFor(() => expect(document.querySelectorAll(".fw-del-shelf .fw-folio-card__open").length).toBeGreaterThan(0));
  expect(document.querySelector(".fw-del-shelf .fw-folio-card__title")).toHaveTextContent("A new music album");
});

it("keeps Nest's direct ritual, complete home source and Community door", async () => {
  const home = { id: "nest-home", status: "PUBLISHED", category: "Home", media_type: "ARTICLE", title: "A cosy home tonight", summary: "A small space.", lede: "A real home thought.", content_url: "https://publisher.example/home", source_name: "Home Review" };
  api.items.mockResolvedValue([home]);
  render(<Nest />);
  expect(screen.getByRole("link", { name: /Lighter Side/ })).toHaveAttribute("href", "/Community?room=lighter");
  expect(document.querySelector(".fw-nest-one")).not.toBeNull();
  fireEvent.click(screen.getByText(/More cosy ideas/));
  await waitFor(() => expect(document.querySelector(".fw-nest-shelf .fw-folio-card__open")).not.toBeNull());
  expect(document.querySelectorAll(".fw-nest-clean .fw-good-library section").length).toBeGreaterThanOrEqual(3);
  fireEvent.click(document.querySelector(".fw-nest-shelf .fw-folio-card__open"));
  expect(await screen.findByText("A real home thought.")).toBeVisible();
  expect(screen.getByRole("link", { name: "Read at Home Review" })).toHaveAttribute("href", home.content_url);
});

it("keeps Nest's ritual and Retry when the library fails", async () => {
  api.items.mockRejectedValueOnce(new Error("read failed"));
  render(<Nest />);
  expect(document.querySelector(".fw-nest-one")).not.toBeNull();
  fireEvent.click(screen.getByText(/More cosy ideas/));
  expect(await screen.findByRole("alert")).toHaveTextContent("The reads didn't arrive.");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
});

it("never shows another account's nightly horoscope in Tonight", async () => {
  api.readings.mockResolvedValue([{ id: "other-sky", user_id: "reader-b", moon_phase: "Private moon", power_title: "Another woman's reading" }]);
  render(<Tonight />);
  await waitFor(() => expect(api.readings).toHaveBeenCalledWith({ user_id: "reader-a" }, "-reading_date", 1));
  expect(screen.queryByText("Another woman's reading")).toBeNull();
  expect(screen.queryByText("The night sky")).toBeNull();
});

it("opens Tonight's complete chapter in a clean sheet and keeps the sky owner scoped", async () => {
  api.stories.mockResolvedValue([{ id: "story-tonight", is_active: true, series_title: "The night garden", day_number: 8, segment_text: "The real first paragraph.\n\nThe real last paragraph." }]);
  api.readings.mockResolvedValue([{ id: "sky-a", user_id: "reader-a", reading_date: isoDay(), moon_phase: "Waxing", power_title: "Your own sky", power_body: "Your private reading." }]);
  render(<Tonight />);
  expect(document.querySelector(".fw-tonight-clean .fw-tonight-hero")).not.toBeNull();
  expect(document.querySelector(".fw-tonight-one")).not.toBeNull();
  const chapter = await screen.findByRole("button", { name: /Tonight's chapter/ });
  fireEvent.click(chapter);
  expect(await screen.findByText("The real first paragraph.")).toBeVisible();
  expect(screen.getByText("The real last paragraph.")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Save", exact: true })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  fireEvent.click(await screen.findByRole("button", { name: /Your sky tonight/ }));
  expect(await screen.findByText("Your private reading.")).toBeVisible();
  expect(api.readings).toHaveBeenCalledWith({ user_id: "reader-a" }, "-reading_date", 1);
});

it("does not offer a future chapter or an archived sky as tonight's", async () => {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  api.stories.mockResolvedValue([
    { id: "readable", is_active: true, series_key: "garden", day_number: 1, segment_text: "The readable chapter.", published_date: isoDay() },
    { id: "future", is_active: true, series_key: "garden", day_number: 2, segment_text: "The future spoiler.", published_date: isoDay(tomorrow) },
  ]);
  api.readings.mockResolvedValue([{ id: "old-sky", user_id: "reader-a", reading_date: "2020-01-01", moon_phase: "Full", power_title: "An older sky" }]);
  render(<Tonight />);
  fireEvent.click(await screen.findByRole("button", { name: /Tonight's chapter/ }));
  expect(await screen.findByText("The readable chapter.")).toBeVisible();
  expect(screen.queryByText("The future spoiler.")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByText("An older sky")).toBeNull();
  expect(screen.getByRole("link", { name: /Open Sky/ })).toHaveAttribute("href", "/Lifestyle?section=sky");
});

it("pairs Tonight's two-tides heading with its own body", async () => {
  api.readings.mockResolvedValue([{ id: "sky-pair", user_id: "reader-a", reading_date: isoDay(), moon_phase: "Waxing", cycle_moon_headline: "These two tides", cycle_moon_body: "Your own tide paragraph.", power_title: "Another power heading", power_body: "A different power paragraph." }]);
  render(<Tonight />);
  fireEvent.click(await screen.findByRole("button", { name: /Your sky tonight/ }));
  expect(await screen.findByRole("dialog", { name: /These two tides/ })).toBeVisible();
  expect(screen.getByText("Your own tide paragraph.")).toBeVisible();
  expect(screen.queryByText("A different power paragraph.")).toBeNull();
});

it("keeps Tonight's calm source and genuine audio in named depth", async () => {
  api.items.mockResolvedValue([{ id: "calm-a", status: "PUBLISHED", category: "Mindfulness", media_type: "PODCAST", title: "A gentle meditation", summary: "Settle for a moment.", lede: "The complete voice-led introduction.", audio_url: "https://media.example/calm.mp3", episode_url: "https://publisher.example/calm", source_name: "Calm Radio" }]);
  render(<Tonight />);
  fireEvent.click(screen.getByText(/More ways to wind down/));
  await waitFor(() => expect(document.querySelector(".fw-tonight-shelf .fw-folio-card__open")).not.toBeNull());
  fireEvent.click(document.querySelector(".fw-tonight-shelf .fw-folio-card__open"));
  expect(await screen.findByText("The complete voice-led introduction.")).toBeVisible();
  expect(screen.getByRole("link", { name: "Listen at Calm Radio" })).toHaveAttribute("href", "https://publisher.example/calm");
  expect(document.querySelector("audio")?.getAttribute("src")).toBe("https://media.example/calm.mp3");
});

it("separates Tonight's failed calm read from an empty shelf and offers Retry", async () => {
  api.items.mockRejectedValueOnce(new Error("failed")).mockResolvedValue([]);
  render(<Tonight />);
  fireEvent.click(screen.getByText(/More ways to wind down/));
  expect(await screen.findByRole("alert")).toHaveTextContent("The calm reads didn't arrive.");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
});

it("makes Make direct without losing its other ideas and exits", async () => {
  render(<Make />);
  expect(document.querySelector(".fw-make-clean .fw-make-hero")).not.toBeNull();
  expect(document.querySelector(".fw-make-first")).not.toBeNull();
  expect(screen.getByRole("link", { name: /Meet the Community/ })).toHaveAttribute("href", "/Community");
  fireEvent.click(screen.getByText("Three more things to try"));
  expect(document.querySelectorAll(".fw-make-more p")).toHaveLength(3);
  fireEvent.click(screen.getByText(/Make it elsewhere/));
  expect(screen.getByRole("link", { name: /Write something/ })).toHaveAttribute("href", "/Journal");
  expect(screen.getByRole("link", { name: /Ask Jess for an idea/ })).toHaveAttribute("href", "/Jess");
  expect(screen.getByRole("link", { name: /Look at Events/ })).toHaveAttribute("href", "/Events");
});

it("keeps Outside's access-first action, real source and all exits", async () => {
  const read = { id: "outside-read", status: "PUBLISHED", category: "Nature", media_type: "ARTICLE", title: "A city garden", summary: "The corner plot.", lede: "The complete garden paragraph.", content_url: "https://publisher.example/garden", source_name: "Green Review" };
  api.items.mockResolvedValue([read]);
  render(<Outside />);
  expect(document.querySelector(".fw-outside-clean .fw-outside-one")).not.toBeNull();
  expect(screen.getByRole("link", { name: /See what's on in Events/ })).toHaveAttribute("href", "/Events");
  fireEvent.click(screen.getByText(/More outside/));
  await waitFor(() => expect(document.querySelector(".fw-outside-shelf .fw-folio-card__open")).not.toBeNull());
  fireEvent.click(document.querySelector(".fw-outside-shelf .fw-folio-card__open"));
  expect(await screen.findByText("The complete garden paragraph.")).toBeVisible();
  expect(screen.getByRole("link", { name: "Read at Green Review" })).toHaveAttribute("href", read.content_url);
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  fireEvent.click(screen.getByText(/Carry it on · Planner/));
  expect(screen.getByRole("link", { name: /Visit Community|Notice it together/ })).toHaveAttribute("href", "/Community");
});

it("shows Outside's failed read separately and retries", async () => {
  api.items.mockRejectedValueOnce(new Error("offline")).mockResolvedValue([]);
  render(<Outside />);
  fireEvent.click(screen.getByText(/More outside/));
  expect(await screen.findByRole("alert")).toHaveTextContent("The reads didn't arrive.");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
});

it("keeps a Money intention only after current-owner acknowledgement and exact read-back", async () => {
  const rows = [];
  api.goals.mockImplementation(async () => [...rows]);
  api.createGoal.mockImplementation(async data => { const row = { id: "goal-one", ...data }; rows.push(row); return row; });
  render(<Money />);
  const keep = await screen.findByRole("button", { name: /Build a tiny buffer/ });
  fireEvent.click(keep);
  await waitFor(() => expect(keep).toHaveAttribute("aria-pressed", "true"));
  expect(api.createGoal).toHaveBeenCalledTimes(1);
  expect(api.createGoal).toHaveBeenCalledWith(expect.objectContaining({ user_id: "reader-a", domain: "Money", title: expect.stringContaining("Build a tiny buffer") }));
  fireEvent.click(screen.getByText(/More gentle ideas/));
  expect(document.querySelectorAll(".fw-money-intentions button")).toHaveLength(5);
  fireEvent.click(screen.getByText(/Elsewhere · Jess/));
  expect(screen.getByRole("link", { name: /See Deals/ })).toHaveAttribute("href", "/Deals");
});

it("does not invent a kept Money goal or duplicate an uncertain create", async () => {
  api.createGoal.mockRejectedValueOnce(new Error("unknown create outcome"));
  render(<Money />);
  const keep = await screen.findByRole("button", { name: /Build a tiny buffer/ });
  fireEvent.click(keep);
  expect(await screen.findByRole("alert")).toHaveTextContent("isn't confirmed yet");
  expect(keep).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(keep);
  await waitFor(() => expect(api.goals).toHaveBeenCalledTimes(4));
  expect(api.createGoal).toHaveBeenCalledTimes(1);
});

it("does not create an earlier owner's Money goal after an account switch during lookup", async () => {
  let active = "reader-a", release;
  api.me.mockImplementation(async () => ({ id: active, email: `${active}@example.test` }));
  api.goals.mockResolvedValueOnce([]).mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
  render(<Money />);
  await waitFor(() => expect(api.goals).toHaveBeenCalledTimes(1));
  const keep = screen.getByRole("button", { name: /Build a tiny buffer/ });
  fireEvent.click(keep);
  await waitFor(() => expect(release).toBeTypeOf("function"));
  active = "reader-b";
  release([]);
  await waitFor(() => expect(screen.getByRole("button", { name: /Build a tiny buffer/ })).not.toBeDisabled());
  expect(api.createGoal).not.toHaveBeenCalled();
  expect(keep).toHaveAttribute("aria-pressed", "false");
});

it("waits for Money account authority without holding the first ritual behind the content shelf", async () => {
  let release;
  api.me.mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
  render(<Money />);
  expect(document.querySelector(".fw-money-one")).not.toBeNull();
  const keep = screen.getByRole("button", { name: /Build a tiny buffer/ });
  expect(keep).toBeDisabled();
  expect(keep).toHaveTextContent("Checking account…");
  fireEvent.click(keep);
  expect(api.createGoal).not.toHaveBeenCalled();
  release({ id: "reader-a", email: "reader@example.test" });
  await waitFor(() => expect(keep).not.toBeDisabled());
});

it("keeps Money account failure distinct from a guest and retries without rereading all content", async () => {
  api.me.mockRejectedValueOnce(new Error("auth transport failed"));
  render(<Money />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Your kept intentions couldn't be checked.");
  expect(screen.getByRole("button", { name: /Build a tiny buffer/ })).toBeDisabled();
  const contentReads = api.items.mock.calls.length;
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  expect(api.items).toHaveBeenCalledTimes(contentReads);
  expect(screen.getByRole("button", { name: /Build a tiny buffer/ })).not.toBeDisabled();
});

it("treats a confirmed unauthenticated Money response as a sign-in path", async () => {
  api.me.mockRejectedValueOnce({ status: 401 });
  render(<Money />);
  const keep = screen.getByRole("button", { name: /Build a tiny buffer/ });
  await waitFor(() => expect(keep).not.toBeDisabled());
  expect(keep).toHaveTextContent("Keep this");
  expect(screen.queryByRole("alert")).toBeNull();
  expect(api.createGoal).not.toHaveBeenCalled();
});

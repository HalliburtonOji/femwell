import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ReadStoryVoice from "./ReadStoryVoice";
import { FocusedCardContents } from "@/components/brand/expandCards";

const mock = vi.hoisted(() => ({ player: null }));
vi.mock("@/hooks/usePodcastPlayer", () => ({ usePodcastPlayer: () => mock.player }));
beforeEach(() => { mock.player = null; });

it("plays exactly one of the existing voice files from the opened Ideas story without tracking progress", () => {
  const play = vi.fn(), pause = vi.fn();
  mock.player = { play, pause, currentEpisode: null, isPlaying: false, playbackStatus: "idle", error: null };
  render(<ReadStoryVoice/>);
  fireEvent.click(screen.getByRole("button", { name: "Hear George telling The long way home" }));
  expect(play).toHaveBeenCalledWith(expect.objectContaining({
    id: "ideas-read-long-way-home-george-v1",
    audio_url: "/lifestyle-content/voice-studio/audio/scene-george-v1.mp3",
    save_progress: false,
  }));
  expect(screen.getByRole("link", { name: /full audition/ })).toHaveAttribute("href", "/lifestyle-content/voice-studio/scene.html");
  mock.player = { ...mock.player, currentEpisode: play.mock.calls[0][0], isPlaying: true };
  render(<ReadStoryVoice/>);
  fireEvent.click(screen.getAllByRole("button", { name: "Pause George telling The long way home" })[0]);
  expect(pause).toHaveBeenCalledTimes(1);
  mock.player = { ...mock.player, isPlaying: false, playbackStatus: "paused" };
  render(<ReadStoryVoice/>);
  expect(screen.getAllByRole("button", { name: "Resume George telling The long way home" })[0]).toHaveTextContent("Resume George");
});

it("keeps a failed take retryable and the full written story readable", () => {
  const play = vi.fn();
  mock.player = { play, pause: vi.fn(), currentEpisode: { id: "ideas-read-long-way-home-laura-v1" }, isPlaying: false, playbackStatus: "failed", error: "Couldn’t start" };
  render(<ReadStoryVoice/>);
  fireEvent.click(screen.getByRole("button", { name: "Retry Laura telling The long way home" }));
  expect(play).toHaveBeenCalledWith(expect.objectContaining({ id: "ideas-read-long-way-home-laura-v1" }));
  expect(screen.getByRole("alert")).toHaveTextContent("keep reading");
});

it("shows the voice only for the exact Ideas fiction, never a main Read item or another draft", () => {
  const original = { id: "ideas-read-the-long-way-home-v1", editorial_local: true, content_type: "STORY", lede: "The complete printed story stays here." };
  const card = { id: original.id, type: "article", title: "The long way home", body: [original.lede], meta: [], actions: [], _raw: original };
  const { rerender } = render(<FocusedCardContents room="read-ideas" item={card}/>);
  expect(screen.getByRole("region", { name: "Hear The long way home" })).toBeVisible();
  expect(screen.getByText(original.lede)).toBeVisible();
  rerender(<FocusedCardContents room="read" item={card}/>);
  expect(screen.queryByRole("region", { name: "Hear The long way home" })).not.toBeInTheDocument();
  rerender(<FocusedCardContents room="read-ideas" item={{ ...card, _raw: { ...original, id: "other-fiction" } }}/>);
  expect(screen.queryByRole("region", { name: "Hear The long way home" })).not.toBeInTheDocument();
});

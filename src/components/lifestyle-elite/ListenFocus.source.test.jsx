import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ListenFocus from "./ListenFocus";

vi.mock("@/hooks/usePodcastPlayer", () => ({ usePodcastPlayer: () => null }));
vi.mock("@/components/brand/expandCards", () => ({
  CoverCard: ({ item, mediaPresentation }) => <div data-media-presentation={mediaPresentation}>{item.title}</div>,
  FloraAudio: () => <div>Playable audio</div>,
  FloraYouTube: () => <div>Playable video</div>,
  resolveCard: item => item,
}));
vi.mock("./SelectedLifestyleHeader", () => ({ SelectedRoomDetail: () => null }));

describe("Listen source action", () => {
  it("gives the Ideas choice a short reason and retains the remaining episode in Browse", () => {
    const unrelated = { id:"other", type:"audio", title:"First feed item", audioSrc:"https://publisher.example/other.mp3" };
    const chosen = { id:"chosen", type:"audio", title:"A culture episode", audioSrc:"https://publisher.example/chosen.mp3", editorialReason:"A real story with a useful turn.", editorialFollowedCategory:"Culture" };
    const archive = { id:"archive", type:"audio", title:"Third feed item", audioSrc:"https://publisher.example/archive.mp3" };
    render(<ListenFocus calmLayout editorialPreview presentation="folio" audioCards={[chosen, unrelated, archive]} />);
    expect(screen.getByText("From your Culture shelf · A real story with a useful turn.")).toBeVisible();
    const browse = screen.getByText("Browse all listens & watches · 1").closest("details");
    expect(browse).not.toHaveAttribute("open");
    fireEvent.click(screen.getByText("Browse all listens & watches · 1"));
    expect(browse).toHaveAttribute("open");
    expect(screen.getByText("Third feed item")).toBeVisible();
  });

  it("carries focused audio styling into the main featured folio player", () => {
    render(<ListenFocus calmLayout presentation="folio"
      audioCards={[{ id:"listen-1", type:"audio", title:"A real episode", audioSrc:"https://example.com/episode.mp3" }]} />);
    expect(screen.getByText("A real episode").getAttribute("data-media-presentation")).toBe("focused");
  });

  it("opens an external alternate video on the first source-labelled tap and keeps details separate", () => {
    const source = vi.fn(), details = vi.fn();
    render(<ListenFocus calmLayout presentation="folio"
      audioCards={[{ id:"listen-1", type:"audio", title:"A real episode", audioSrc:"https://example.com/episode.mp3" }]}
      videoCards={[{ id:"watch-1", type:"video", title:"A source-only watch", external:true, actions:[{ label:"Open source", onClick:source }] }]}
      onOpen={details} />);
    fireEvent.click(screen.getByRole("button", { name:/A source-only watch.*Watch at source/ }));
    expect(source).toHaveBeenCalledOnce();
    expect(details).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name:"Details & tools for A source-only watch" }));
    expect(details).toHaveBeenCalledOnce();
  });

});

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ListenFocus from "./ListenFocus";

vi.mock("@/hooks/usePodcastPlayer", () => ({ usePodcastPlayer: () => null }));
vi.mock("@/components/brand/expandCards", () => ({
  CoverCard: ({ item }) => <div>{item.title}</div>,
  FloraAudio: () => <div>Playable audio</div>,
  FloraYouTube: () => <div>Playable video</div>,
  resolveCard: item => item,
}));
vi.mock("./SelectedLifestyleHeader", () => ({ SelectedRoomDetail: () => null }));

describe("Listen source action", () => {
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

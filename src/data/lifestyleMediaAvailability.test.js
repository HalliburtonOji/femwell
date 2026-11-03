import { describe, expect, it } from "vitest";
import { availableEpisodeSource, firstPlayableEpisode, knownUnplayableAudio } from "./lifestyleMediaAvailability";

describe("source-specific audio availability", () => {
  const id = "6a59e9430cd4a2ee47b7c5e3";
  const url = "https://www.buzzsprout.com/1112270/episodes/19238113-rainbows-with-lulu-miller.mp3";
  it("demotes only the measured broken enclosure and permits a repaired feed URL", () => {
    expect(knownUnplayableAudio({id,audio_url:url})).toBe(true);
    expect(knownUnplayableAudio({id,audio_url:url+"?fresh=1"})).toBe(false);
    expect(knownUnplayableAudio({id,audio_url:"https://cdn.example/episode.mp3"})).toBe(false);
    expect(knownUnplayableAudio({id:"another",audio_url:url})).toBe(false);
    expect(knownUnplayableAudio({id:"6a59e9466f970292f31ea4a9",audio_url:"https://sphinx.acast.com/episode"})).toBe(false);
  });
  it("does not route a copied dead enclosure as a publisher page", () => {
    expect(availableEpisodeSource({id,audio_url:url,episode_url:url,content_url:url})).toBeNull();
    expect(availableEpisodeSource({id,audio_url:url,episode_url:"https://publisher.example/episode"})).toBe("https://publisher.example/episode");
  });
  it("keeps a broken or directory-only Today suggestion out of the first player", () => {
    const safe = {id:"safe",title:"A whole episode",audio_url:"https://publisher.example/live.mp3",duration_seconds:1800};
    expect(firstPlayableEpisode([
      {id,title:"Down today",audio_url:url,episode_url:url,duration_seconds:2200},
      {id:"directory",title:"The show",episode_url:"https://publisher.example/show"},
      safe,
    ])).toEqual(safe);
    expect(firstPlayableEpisode([{id,title:"Down today",audio_url:url,duration_seconds:2200}])).toBeNull();
  });
});

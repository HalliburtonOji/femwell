import { Headphones, Pause, Play } from "lucide-react";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";

// These are three already-rendered adaptations of the same original Ideas scene.
// Each tap uses the app's one persistent player; none creates a PodcastListens row.
const TAKES = [
  { id: "laura", name: "Laura", seconds: 58.32 },
  { id: "george", name: "George", seconds: 60.72 },
  { id: "river", name: "River", seconds: 55.12 },
];

export default function ReadStoryVoice() {
  const player = usePodcastPlayer();
  return <section className="fw-read-story-voice" aria-label="Hear The long way home">
    <div className="fw-read-story-voice-head"><Headphones size={17} aria-hidden="true"/><span>Hear this scene</span><small>About a minute</small></div>
    <div className="fw-read-story-voice-takes">
      {TAKES.map(take => {
        const id = `ideas-read-long-way-home-${take.id}-v1`;
        const active = player?.currentEpisode?.id === id;
        const loading = active && ["loading", "buffering"].includes(player?.playbackStatus);
        const failed = active && !!player?.error;
        const playing = active && player?.isPlaying;
        const paused = active && player?.playbackStatus === "paused";
        const verb = failed ? "Retry" : playing ? "Pause" : loading ? "Loading" : paused ? "Resume" : "Hear";
        return <button type="button" key={take.id} className={active ? "is-active" : ""} disabled={!player || loading}
          aria-label={`${verb} ${take.name} telling The long way home`} aria-pressed={!!playing}
          onClick={() => {
            if (playing) player.pause();
            else player?.play({ id, title: `The long way home · ${take.name}`, source_name: "FemWell · Read Ideas",
              audio_url: `/lifestyle-content/voice-studio/audio/scene-${take.id}-v1.mp3`, duration_seconds: take.seconds, save_progress: false });
          }}>
          {playing ? <Pause size={14} aria-hidden="true"/> : <Play size={14} aria-hidden="true"/>}
          <span>{failed ? `Retry ${take.name}` : paused ? `Resume ${take.name}` : take.name}</span>
        </button>;
      })}
    </div>
    {player?.currentEpisode?.id?.startsWith("ideas-read-long-way-home-") && player.error &&
      <p role="alert">That take didn’t start. Tap Retry, or keep reading.</p>}
    <p>Three different tellings of the scene below. <a href="/lifestyle-content/voice-studio/scene.html">Hear the full audition and read each performance script</a>.</p>
  </section>;
}

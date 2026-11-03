// Exact public RSS enclosures returning 404 HTML on a capped ranged GET,
// 3 November 2026. Keep their catalogue records and any future repaired URL.
const unavailableEnclosures = new Map([
  ["6a59e9430cd4a2ee47b7c5e3", "https://www.buzzsprout.com/1112270/episodes/19238113-rainbows-with-lulu-miller.mp3"],
  ["6a59e9420ae6a5759b0f6cc0", "https://www.buzzsprout.com/1112270/episodes/19290488-crying-in-baseball-with-julie-kliegman.mp3"],
  ["6a59e942befc66d9d655743d", "https://www.buzzsprout.com/1112270/episodes/19357249-the-jfk-assassination-part-1-with-mackenzie-joy-brennan.mp3"],
  ["6a59e9422b49a44a84a16fe4", "https://www.buzzsprout.com/1112270/episodes/19402579-the-jfk-assassination-part-2-with-mackenzie-joy-brennan.mp3"],
  ["6a59e9424056c83088660953", "https://www.buzzsprout.com/1112270/episodes/19490211-what-i-love-a-listener-summer-special.mp3"],
  ["6a0682263f872e447ddf0e97", "https://www.buzzsprout.com/1112270/episodes/18856103-how-to-deprogram-a-guy-in-10-days-with-endless-thread.mp3"],
  ["6a0682259b2e8b1c6d1e959e", "https://www.buzzsprout.com/1112270/episodes/18941360-crop-circles-with-chelsey-weber-smith.mp3"],
  ["6a068225cc43188deba26350", "https://www.buzzsprout.com/1112270/episodes/19010491-the-great-american-spelling-bee-with-gabe-henry.mp3"],
]);

export function knownUnplayableAudio(row) {
  return !!(row?.id && row.audio_url && unavailableEnclosures.get(row.id) === row.audio_url);
}

// A copied dead enclosure is not a publisher page. Real independent links stay.
export function availableEpisodeSource(row) {
  if (!row) return null;
  for (const value of [row.episode_url, row.source_url, row.content_url]) {
    if (!/^https?:\/\/\S+$/i.test(String(value || ""))) continue;
    if (knownUnplayableAudio(row) && value === row.audio_url) continue;
    return value;
  }
  return null;
}

// A first action on Today promises an in-app episode, like Lifestyle Listen.
// Keep the directory and untimed rows elsewhere; do not manufacture a player.
export function firstPlayableEpisode(rows) {
  return (rows || []).find(row => row?.title && row.audio_url && Number(row.duration_seconds) > 0 && !knownUnplayableAudio(row)) || null;
}

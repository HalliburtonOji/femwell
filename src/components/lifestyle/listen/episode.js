// Adapt an existing card without losing its canonical episode, words or publisher.
export function playableEpisode(item, audioUrl, duration, label) {
  const raw = item?._raw || item || {};
  return {...raw,...item,id:item?.id || raw.id,audio_url:audioUrl || raw.audio_url,
    title:item?.title || raw.title || label,source_name:item?.sourceName || raw.source_name || item?.kind || 'FemWell',
    image_url:item?.imageUrl || raw.image_url,duration_seconds:duration || raw.duration_seconds,
    transcript:item?.transcript || raw.transcript};
}
export function episodeSourceUrl(episode) {
  for (const value of [episode?.episode_url,episode?.content_url,episode?.source_url,episode?.audio_url]) {
    try {const url=new URL(value);if (['https:','http:'].includes(url.protocol)) return url.href;} catch { /* no real source */ }
  }
  return null;
}

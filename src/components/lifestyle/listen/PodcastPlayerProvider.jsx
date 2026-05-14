import { createContext, useState, useRef, useEffect, useCallback } from 'react';

// Singleton-ish podcast player context. Wrapped around the app shell in
// Layout.jsx. Manages a single <audio> element appended to document.body
// for its lifetime — that's the key to background-tab + lock-screen audio
// continuity (no Web Audio because cross-origin podcast hosts typically
// don't set CORS headers; plain <audio> direct works).
//
// C4 scope (this commit): provider + state + play/pause/seek + MediaSession
// scaffold. C5 wires the MiniPlayer + ExpandedPlayer UI. C6 adds the
// PodcastListens upsert for resume-from-position, sleep timer, speed
// control.

export const PodcastPlayerContext = createContext(null);

/**
 * Episode shape (the player only needs these fields; pass the full
 * LifestyleItems row to play() and it'll pluck them):
 *   id, title, source_name, image_url, audio_url, duration_seconds
 */
export function PodcastPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(null);

  // Mount the singleton <audio> element on first render. Lives at the body
  // root so it survives every component unmount inside the app.
  useEffect(() => {
    if (audioRef.current) return;
    const a = document.createElement('audio');
    a.preload = 'metadata';
    a.crossOrigin = 'anonymous'; // Best-effort; ignored when host doesn't return CORS headers.
    document.body.appendChild(a);
    audioRef.current = a;

    const onTime = () => setPosition(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    const onPlay = () => {
      setIsPlaying(true);
      if (typeof navigator !== 'undefined' && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };
    const onPause = () => {
      setIsPlaying(false);
      if (typeof navigator !== 'undefined' && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };
    const onErr = () => setError('Playback error');
    const onEnd = () => setIsPlaying(false);

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('durationchange', onMeta);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('error', onErr);
    a.addEventListener('ended', onEnd);

    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('durationchange', onMeta);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('error', onErr);
      a.removeEventListener('ended', onEnd);
      try { a.pause(); } catch { /* noop */ }
      try { a.remove(); } catch { /* noop */ }
      audioRef.current = null;
    };
    // intentional: mount once, lifetime of provider
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // MediaSession metadata + action handlers — gives the OS lock-screen +
  // Bluetooth + macOS Now Playing controls. Re-runs whenever the active
  // episode changes.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaSession) return;
    const ep = currentEpisode;
    if (!ep) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: ep.title || 'Untitled episode',
      artist: ep.source_name || 'FemWell',
      album: ep.source_name || 'FemWell',
      artwork: ep.image_url
        ? [
            { src: ep.image_url, sizes: '512x512', type: 'image/jpeg' },
            { src: ep.image_url, sizes: '256x256', type: 'image/jpeg' },
            { src: ep.image_url, sizes: '96x96', type: 'image/jpeg' },
          ]
        : [],
    });
    const a = audioRef.current;
    const handlers = [
      ['play', () => a?.play().catch(() => {})],
      ['pause', () => a?.pause()],
      ['seekbackward', (d) => { if (a) a.currentTime = Math.max(0, a.currentTime - (d?.seekOffset || 15)); }],
      ['seekforward', (d) => { if (a) a.currentTime = Math.min(a.duration || Infinity, a.currentTime + (d?.seekOffset || 30)); }],
      ['seekto', (d) => { if (a && d?.seekTime != null) a.currentTime = d.seekTime; }],
    ];
    for (const [action, cb] of handlers) {
      try { navigator.mediaSession.setActionHandler(action, cb); }
      catch { /* not all browsers support every action */ }
    }
    return () => {
      for (const [action] of handlers) {
        try { navigator.mediaSession.setActionHandler(action, null); }
        catch { /* noop */ }
      }
    };
  }, [currentEpisode]);

  const play = useCallback((episode) => {
    setError(null);
    const a = audioRef.current;
    if (!a || !episode) return;
    const audioUrl = episode.audio_url;
    if (!audioUrl) {
      setError('Episode has no audio URL');
      return;
    }
    // Same-episode resume vs new-episode load.
    if (!currentEpisode || currentEpisode.id !== episode.id) {
      setCurrentEpisode(episode);
      setPosition(0);
      setDuration(Number(episode.duration_seconds) || 0);
      a.src = audioUrl;
      a.load();
    }
    a.play().catch((err) => {
      // Most likely: autoplay-policy block on iOS Safari before user gesture.
      setError(err?.message || 'Could not start playback');
    });
  }, [currentEpisode]);

  const pause = useCallback(() => {
    const a = audioRef.current;
    if (a) a.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }, []);

  const seek = useCallback((sec) => {
    const a = audioRef.current;
    if (!a) return;
    const clamped = Math.max(0, Math.min(a.duration || Infinity, sec));
    a.currentTime = clamped;
    setPosition(clamped);
  }, []);

  const seekBy = useCallback((delta) => {
    const a = audioRef.current;
    if (!a) return;
    seek((a.currentTime || 0) + delta);
  }, [seek]);

  const close = useCallback(() => {
    const a = audioRef.current;
    if (a) { try { a.pause(); a.removeAttribute('src'); a.load(); } catch { /* noop */ } }
    setCurrentEpisode(null);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setIsExpanded(false);
    setError(null);
    if (typeof navigator !== 'undefined' && navigator.mediaSession) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    }
  }, []);

  const value = {
    currentEpisode,
    isPlaying,
    position,
    duration,
    isExpanded,
    error,
    play,
    pause,
    togglePlay,
    seek,
    seekBy,
    close,
    expand: () => setIsExpanded(true),
    collapse: () => setIsExpanded(false),
  };

  return (
    <PodcastPlayerContext.Provider value={value}>
      {children}
    </PodcastPlayerContext.Provider>
  );
}

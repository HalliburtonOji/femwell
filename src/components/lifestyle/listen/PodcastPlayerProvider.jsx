import { createContext, useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const SPEED_OPTIONS = [0.8, 1.0, 1.25, 1.5, 1.75, 2.0];
const COMPLETED_THRESHOLD = 0.95; // 95% of duration → mark completed
const PERSIST_DEBOUNCE_MS = 5000;
const STORAGE_KEY_SPEED = 'fw_podcast_playback_rate';

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
  const userIdRef = useRef(null);
  const lastPersistAtRef = useRef(0);
  const sleepTimerRef = useRef(null);
  // Refs that mirror state so the (mount-once) audio-event handlers can
  // read the current values without stale closures.
  const currentEpisodeRef = useRef(null);
  const playbackRateRef = useRef(1.0);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [playbackRate, setPlaybackRateState] = useState(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? Number(localStorage.getItem(STORAGE_KEY_SPEED)) : 0;
      return SPEED_OPTIONS.includes(stored) ? stored : 1.0;
    } catch {
      return 1.0;
    }
  });
  const [sleepTimerMin, setSleepTimerMinState] = useState(null); // null = off
  const [sleepRemainingSec, setSleepRemainingSec] = useState(0);

  // Resolve current user once for PodcastListens upserts. Non-fatal if it
  // fails — anonymous playback still works, just no resume persistence.
  useEffect(() => {
    let cancelled = false;
    base44.auth.me().then((u) => {
      if (!cancelled && u?.id) userIdRef.current = u.id;
    }).catch(() => { /* not signed in — that's fine */ });
    return () => { cancelled = true; };
  }, []);

  // Persist position + completion. Debounced server-side via the
  // lastPersistAtRef gate (one upsert per ~5s while playing). Used by
  // resume-from-position on the next episode load. Non-fatal — silently
  // skips if user_id is missing.
  const upsertListenRow = useCallback(async (episode, posSec, durSec, isCompleted) => {
    const uid = userIdRef.current;
    if (!uid || !episode?.id) return;
    try {
      const existing = await base44.entities.PodcastListens.filter(
        { user_id: uid, lifestyle_item_id: episode.id }, undefined, 1,
      ).catch(() => []);
      const payload = {
        user_id: uid,
        lifestyle_item_id: episode.id,
        position_sec: Math.max(0, Math.floor(posSec || 0)),
        duration_sec: Math.max(0, Math.floor(durSec || 0)),
        completed: !!isCompleted,
        last_played_at: new Date().toISOString(),
      };
      if (existing?.[0]?.id) {
        await base44.entities.PodcastListens.update(existing[0].id, payload);
      } else {
        await base44.entities.PodcastListens.create({ ...payload, created_at: new Date().toISOString() });
      }
    } catch { /* non-fatal — playback continues regardless */ }
  }, []);

  // Mount the singleton <audio> element on first render. Lives at the body
  // root so it survives every component unmount inside the app.
  useEffect(() => {
    if (audioRef.current) return;
    const a = document.createElement('audio');
    a.preload = 'metadata';
    a.crossOrigin = 'anonymous'; // Best-effort; ignored when host doesn't return CORS headers.
    document.body.appendChild(a);
    audioRef.current = a;

    const onTime = () => {
      const pos = a.currentTime || 0;
      const dur = a.duration || 0;
      setPosition(pos);
      // Debounced persistence — single PodcastListens upsert per ~5s.
      const now = Date.now();
      if (now - lastPersistAtRef.current > PERSIST_DEBOUNCE_MS && currentEpisodeRef.current) {
        lastPersistAtRef.current = now;
        const completed = dur > 0 && pos / dur >= COMPLETED_THRESHOLD;
        upsertListenRow(currentEpisodeRef.current, pos, dur, completed);
      }
    };
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
      // Persist immediately on pause — captures position before user leaves.
      const ep = currentEpisodeRef.current;
      if (ep) {
        const dur = a.duration || 0;
        const pos = a.currentTime || 0;
        upsertListenRow(ep, pos, dur, dur > 0 && pos / dur >= COMPLETED_THRESHOLD);
      }
    };
    const onErr = () => setError('Playback error');
    const onEnd = () => {
      setIsPlaying(false);
      // Mark completed.
      const ep = currentEpisodeRef.current;
      if (ep) {
        const dur = a.duration || 0;
        upsertListenRow(ep, dur, dur, true);
      }
    };

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

  const play = useCallback(async (episode) => {
    setError(null);
    const a = audioRef.current;
    if (!a || !episode) return;
    const audioUrl = episode.audio_url;
    if (!audioUrl) {
      setError('Episode has no audio URL');
      return;
    }
    // Same-episode resume vs new-episode load.
    const switching = !currentEpisode || currentEpisode.id !== episode.id;
    if (switching) {
      setCurrentEpisode(episode);
      currentEpisodeRef.current = episode;
      setPosition(0);
      setDuration(Number(episode.duration_seconds) || 0);
      a.src = audioUrl;
      a.load();
      // Apply persisted playback rate to the new audio source.
      try { a.playbackRate = playbackRateRef.current || 1.0; } catch { /* noop */ }
      // Resume from saved position if we have a PodcastListens row for this
      // user+episode. Non-fatal if the lookup fails.
      try {
        const uid = userIdRef.current;
        if (uid) {
          const rows = await base44.entities.PodcastListens.filter(
            { user_id: uid, lifestyle_item_id: episode.id }, undefined, 1,
          ).catch(() => []);
          const saved = rows?.[0];
          const resumeAt = Number(saved?.position_sec) || 0;
          if (saved && !saved.completed && resumeAt > 5) {
            // Seek after metadata loads — otherwise currentTime is rejected.
            const seekOnce = () => {
              try { a.currentTime = resumeAt; } catch { /* noop */ }
              a.removeEventListener('loadedmetadata', seekOnce);
            };
            a.addEventListener('loadedmetadata', seekOnce);
          }
        }
      } catch { /* noop */ }
    }
    try {
      await a.play();
    } catch (err) {
      // Most likely: autoplay-policy block on iOS Safari before user gesture.
      setError(err?.message || 'Could not start playback');
    }
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
    // Persist final position before tearing down.
    const ep = currentEpisodeRef.current;
    if (a && ep) {
      const dur = a.duration || 0;
      const pos = a.currentTime || 0;
      upsertListenRow(ep, pos, dur, dur > 0 && pos / dur >= COMPLETED_THRESHOLD);
    }
    if (a) { try { a.pause(); a.removeAttribute('src'); a.load(); } catch { /* noop */ } }
    setCurrentEpisode(null);
    currentEpisodeRef.current = null;
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setIsExpanded(false);
    setError(null);
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerMinState(null);
    setSleepRemainingSec(0);
    if (typeof navigator !== 'undefined' && navigator.mediaSession) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    }
  }, [upsertListenRow]);

  // Speed control — cycles through SPEED_OPTIONS. Persists to localStorage
  // so the user's preferred rate sticks across sessions + new episodes.
  const setPlaybackRate = useCallback((rate) => {
    const next = SPEED_OPTIONS.includes(rate) ? rate : 1.0;
    setPlaybackRateState(next);
    playbackRateRef.current = next;
    const a = audioRef.current;
    if (a) { try { a.playbackRate = next; } catch { /* noop */ } }
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY_SPEED, String(next));
    } catch { /* noop */ }
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(playbackRateRef.current || 1.0);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setPlaybackRate(next);
  }, [setPlaybackRate]);

  // Sleep timer — pauses playback when N minutes elapse. Pass null to cancel.
  // Tracks remaining seconds for the UI countdown.
  const setSleepTimer = useCallback((min) => {
    // Clear any existing interval first.
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (!min || min <= 0) {
      setSleepTimerMinState(null);
      setSleepRemainingSec(0);
      return;
    }
    setSleepTimerMinState(min);
    setSleepRemainingSec(Math.floor(min * 60));
    sleepTimerRef.current = setInterval(() => {
      setSleepRemainingSec((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          // Time's up — pause playback + clear interval.
          clearInterval(sleepTimerRef.current);
          sleepTimerRef.current = null;
          const a = audioRef.current;
          if (a) { try { a.pause(); } catch { /* noop */ } }
          setSleepTimerMinState(null);
          return 0;
        }
        return next;
      });
    }, 1000);
  }, []);

  // Clean up the sleep timer interval on unmount.
  useEffect(() => () => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
  }, []);

  // Apply playback rate whenever audio element changes (covers initial mount).
  useEffect(() => {
    const a = audioRef.current;
    if (a) { try { a.playbackRate = playbackRate; } catch { /* noop */ } }
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  const value = {
    currentEpisode,
    isPlaying,
    position,
    duration,
    isExpanded,
    error,
    playbackRate,
    sleepTimerMin,
    sleepRemainingSec,
    speedOptions: SPEED_OPTIONS,
    play,
    pause,
    togglePlay,
    seek,
    seekBy,
    close,
    expand: () => setIsExpanded(true),
    collapse: () => setIsExpanded(false),
    setPlaybackRate,
    cyclePlaybackRate,
    setSleepTimer,
  };

  return (
    <PodcastPlayerContext.Provider value={value}>
      {children}
    </PodcastPlayerContext.Provider>
  );
}

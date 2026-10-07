import { createContext, useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const SPEED_OPTIONS = [0.8, 1.0, 1.25, 1.5, 1.75, 2.0];
// The sleep timer FADES rather than cutting — a meditation stopped mid-breath is a jolt in
// the exact moment we promised calm. Ramp the last stretch, then pause. (Fade-out is still an
// open, unfulfilled request on Spotify — see mnt/femwell/research_inline_media_ux.md §E.)
const SLEEP_FADE_SEC = 20;
const COMPLETED_THRESHOLD = 0.95; // 95% of duration → mark completed
const PERSIST_DEBOUNCE_MS = 5000;
const STORAGE_KEY_SPEED = 'fw_podcast_playback_rate';

// ─────────────────────────────────────────────────────────────────────────────
// Module-level singleton — survives every component unmount.
//
// 2026-05-18 audio-cutout fix (Halli reported audio cuts when leaving the
// Lifestyle tab). Root cause: useRef + useEffect cleanup paused the audio
// AND removed event listeners when the provider unmounted, e.g. on
// StrictMode double-mount or any Layout re-render that re-mounted the
// provider. The audio <audio> stayed in the DOM but went silent because
// the cleanup explicitly called a.pause().
//
// Fix shape: pull the audio element + playing state into module scope so
// (1) the audio survives any unmount, (2) a remounted provider re-attaches
// to the same element and reads the current state, and (3) the cleanup
// stops calling a.pause()/a.remove(). This matches the audioManager
// pattern Halli specified.
// ─────────────────────────────────────────────────────────────────────────────
let _singletonAudio = null;
let _singletonEpisode = null; // current episode object, mirrors React state
let _singletonRate = 1.0;
let _singletonIntent = 0;
let _singletonStatus = 'idle';
let _singletonOwner = null;
let _singletonProgressReady = false;
const _listenWrites = new Map();
const _pendingPositions = new Map();
const finiteSeconds = value => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : 0;
function ownedListens(rows, uid, id) {
  if (!Array.isArray(rows) || rows.some(row => !row?.id || row.user_id !== uid || row.lifestyle_item_id !== id)) throw new Error('Listen lookup unavailable');
  const timestamp = row => [row.updated_at,row.updated_date,row.created_at,row.created_date].map(value=>Date.parse(value || '')).find(Number.isFinite) || 0;
  return [...rows].sort((a,b)=>timestamp(b)-timestamp(a));
}
// Subscribers used so other components could read state directly; today
// only the provider subscribes, but the hook is here for future use.
const _singletonSubscribers = new Set();
function _notifySingleton() {
  for (const fn of _singletonSubscribers) {
    try { fn(); } catch { /* noop */ }
  }
}

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
  const episodeOwnerRef = useRef(_singletonOwner);
  const progressReadyRef = useRef(_singletonProgressReady);
  const resumeCleanupRef = useRef(null);
  const controlsRef = useRef(null);
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
  const [playbackStatus, setPlaybackStatus] = useState('idle');
  const [progressError, setProgressError] = useState(null);
  const setTransport = useCallback(status => {
    _singletonStatus = status;setPlaybackStatus(status);setIsPlaying(status === 'playing');
  }, []);
  const cancelResume = useCallback(() => {
    _singletonIntent += 1;
    resumeCleanupRef.current?.();resumeCleanupRef.current = null;
  }, []);
  const setProgressReady = useCallback(ready => { progressReadyRef.current = ready;_singletonProgressReady = ready; },[]);
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
  const [sleepFading, setSleepFading] = useState(false);          // true during the final fade-out

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
  const upsertListenRow = useCallback(async (episode, posSec, durSec, isCompleted, owner = episodeOwnerRef.current) => {
    const uid = owner;
    if (!uid || !episode?.id || !progressReadyRef.current) return;
    const key = `${uid}:${episode.id}`;
    const snapshot = {episode,posSec,durSec,isCompleted,uid};
    _pendingPositions.set(key,snapshot);
    const task = (_listenWrites.get(key) || Promise.resolve()).catch(()=>{}).then(async()=>{
      try {
      if ((await base44.auth.me())?.id !== uid) return;
      const existing = ownedListens(await base44.entities.PodcastListens.filter(
        { user_id: uid, lifestyle_item_id: episode.id }, '-updated_at', 10,
      ),uid,episode.id);
      // Auth can change while a read is in flight. Never write using mount-time identity.
      if ((await base44.auth.me())?.id !== uid) return;
      const payload = {
        user_id: uid,
        lifestyle_item_id: episode.id,
        position_sec: Math.floor(finiteSeconds(posSec)),
        duration_sec: Math.floor(finiteSeconds(durSec)),
        completed: !!isCompleted,
        updated_at: new Date().toISOString(),
      };
      const acknowledgement = existing[0]?.id
        ? await base44.entities.PodcastListens.update(existing[0].id,payload)
        : await base44.entities.PodcastListens.create({...payload,created_at:new Date().toISOString()});
      if (!acknowledgement?.id || (acknowledgement.user_id && acknowledgement.user_id !== uid)) throw new Error('Listen not confirmed');
      if (_pendingPositions.get(key) === snapshot) _pendingPositions.delete(key);
      if (currentEpisodeRef.current?.id === episode.id && episodeOwnerRef.current === uid) setProgressError(null);
      } catch {
        if (currentEpisodeRef.current?.id === episode.id && episodeOwnerRef.current === uid) setProgressError('Your place hasn’t synced yet.');
      }
    });
    _listenWrites.set(key,task);
    await task;
    if (_listenWrites.get(key) === task) _listenWrites.delete(key);
  }, []);

  // Mount the singleton <audio> element on first render. Lives at the body
  // root so it survives every component unmount inside the app.
  useEffect(() => {
    if (audioRef.current) return;

    // Reuse the module-level singleton if a previous provider instance
    // already created one. This is the key audio-cutout fix — when the
    // provider remounts (StrictMode double-mount, dev hot reload, or any
    // Layout re-render), we attach to the SAME audio element so playback
    // continues seamlessly.
    let a;
    if (_singletonAudio) {
      a = _singletonAudio;
      // Re-sync React state from the live audio element. If a previous
      // instance was playing, this is what restores the mini-player UI on
      // navigation back to Lifestyle.
      if (_singletonEpisode) {
        setCurrentEpisode(_singletonEpisode);
        currentEpisodeRef.current = _singletonEpisode;
      }
      setTransport(a.paused ? (_singletonEpisode ? 'paused' : 'idle') : _singletonStatus);
      setPosition(finiteSeconds(a.currentTime));
      setDuration(finiteSeconds(a.duration));
    } else {
      a = document.createElement('audio');
      a.preload = 'metadata';
      // INTENTIONAL: do NOT set a.crossOrigin = 'anonymous'.
      // Most podcast CDNs (On Being's host, Megaphone, Simplecast, Libsyn,
      // BBC, NPR, etc.) don't return Access-Control-Allow-Origin headers.
      // Setting crossOrigin forces the browser to expect those headers and
      // reject the load when they're missing — that's what produced the
      // "Playback error" the founder saw on the Michael Pollan / On Being
      // episode. Plain HTMLAudio playback (no Web Audio API decoding)
      // works without CORS, so leaving crossOrigin unset is correct.
      document.body.appendChild(a);
      _singletonAudio = a;
    }
    audioRef.current = a;

    const onTime = () => {
      const pos = finiteSeconds(a.currentTime);
      const dur = finiteSeconds(a.duration);
      setPosition(pos);
      // Debounced persistence — single PodcastListens upsert per ~5s.
      const now = Date.now();
      if (now - lastPersistAtRef.current > PERSIST_DEBOUNCE_MS && currentEpisodeRef.current) {
        lastPersistAtRef.current = now;
        const completed = dur > 0 && pos / dur >= COMPLETED_THRESHOLD;
        upsertListenRow(currentEpisodeRef.current, pos, dur, completed);
      }
    };
    const onMeta = () => setDuration(finiteSeconds(a.duration));
    const onPlay = () => {
      if (a.paused || !currentEpisodeRef.current) return;
      setTransport('loading');
    };
    const onPlaying = () => {
      if (a.paused || !currentEpisodeRef.current) return;
      setError(null);setTransport('playing');
      if (typeof navigator !== 'undefined' && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };
    const onPause = () => {
      // pause events are queued: a newer Play may already have taken effect.
      if (!a.paused) return;
      cancelResume();setTransport(currentEpisodeRef.current ? 'paused' : 'idle');
      if (typeof navigator !== 'undefined' && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'paused';
      }
      // Persist immediately on pause — captures position before user leaves.
      const ep = currentEpisodeRef.current;
      if (ep) {
        const dur = finiteSeconds(a.duration);
        const pos = finiteSeconds(a.currentTime);
        upsertListenRow(ep, pos, dur, dur > 0 && pos / dur >= COMPLETED_THRESHOLD);
      }
    };
    const onErr = () => {
      if (!currentEpisodeRef.current) return;
      // Surface the kind of error so the UI can offer the right fallback.
      // Most podcast playback failures are CORS-style src rejections (code 4
      // MEDIA_ERR_SRC_NOT_SUPPORTED). For those we want the player to show an
      // "Open in podcast app" / "Open episode page" CTA rather than a dead
      // "Playback error" badge.
      const code = a?.error?.code;
      const msg = code === 4
        ? "Couldn't play here — opens externally instead"
        : code === 2
          ? 'Network hiccup — try again or open externally'
          : 'Playback error';
      cancelResume();setError(msg);setTransport('failed');
    };
    const onWaiting = () => { if (currentEpisodeRef.current && !a.paused) setTransport('buffering'); };
    const onEnd = () => {
      cancelResume();setTransport('ended');
      // Mark completed.
      const ep = currentEpisodeRef.current;
      if (ep) {
        const dur = finiteSeconds(a.duration);
        upsertListenRow(ep, dur, dur, true);
      }
    };

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('durationchange', onMeta);
    a.addEventListener('play', onPlay);
    a.addEventListener('playing', onPlaying);
    a.addEventListener('waiting', onWaiting);
    a.addEventListener('stalled', onWaiting);
    a.addEventListener('pause', onPause);
    a.addEventListener('error', onErr);
    a.addEventListener('ended', onEnd);

    return () => {
      // 2026-05-18 audio-cutout fix — do NOT pause or remove the audio
      // element on provider unmount. The DOM <audio> + module-level
      // singleton survive so playback continues across navigation. The
      // remounted provider will re-attach its own listeners and re-sync
      // React state from the live element.
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('durationchange', onMeta);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('playing', onPlaying);
      a.removeEventListener('waiting', onWaiting);
      a.removeEventListener('stalled', onWaiting);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('error', onErr);
      a.removeEventListener('ended', onEnd);
      cancelResume();
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
    const handlers = [
      ['play', () => controlsRef.current?.play(currentEpisodeRef.current)],
      ['pause', () => controlsRef.current?.pause()],
      ['seekbackward', (d) => controlsRef.current?.seekBy(-(d?.seekOffset || 15))],
      ['seekforward', (d) => controlsRef.current?.seekBy(d?.seekOffset || 30)],
      ['seekto', (d) => { if (d?.seekTime != null) controlsRef.current?.seek(d.seekTime); }],
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
    cancelResume();let intent = _singletonIntent;
    const retryOwner = episodeOwnerRef.current;
    const retryAt = currentEpisodeRef.current?.id === episode.id && a.error ? finiteSeconds(a.currentTime) : 0;
    const switching = !currentEpisodeRef.current || currentEpisodeRef.current.id !== episode.id || a.getAttribute('src') !== audioUrl || !!a.error;
    const resumeNeeded = switching || !progressReadyRef.current;
    const isCurrent = () => intent === _singletonIntent && audioRef.current === a && currentEpisodeRef.current?.id === episode.id && a.getAttribute('src') === audioUrl;
    if (switching) {
      const previous = currentEpisodeRef.current;
      if (previous) upsertListenRow(previous,finiteSeconds(a.currentTime),finiteSeconds(a.duration),finiteSeconds(a.duration)>0 && a.currentTime/a.duration>=COMPLETED_THRESHOLD);
      currentEpisodeRef.current = null;episodeOwnerRef.current = null;
      a.pause();
      // pause may invalidate previous work; this request now owns the source.
      intent = _singletonIntent;setProgressReady(false);
      setCurrentEpisode(episode);
      currentEpisodeRef.current = episode;
      _singletonEpisode = episode; // module-level so a remounted provider can re-sync
      _notifySingleton();
      setPosition(0);
      setDuration(finiteSeconds(episode.duration_seconds));setProgressError(null);
      a.src = audioUrl;
      a.load();
      // Apply persisted playback rate to the new audio source.
      try { a.playbackRate = playbackRateRef.current || 1.0; } catch { /* noop */ }
    }
    // Start synchronously within the tap: awaiting SDK calls first loses Safari's gesture.
    setTransport('loading');
    let startResult;
    const failedStart = () => { if (isCurrent()) { setError('Couldn’t start. Tap play to try again.');setTransport('failed'); } };
    try { startResult = Promise.resolve(a.play()).catch(failedStart); }
    catch { failedStart();startResult=Promise.resolve(); }
    try {
      const uid = (await base44.auth.me())?.id || null;
      if (!isCurrent()) return;
      const ownerChanged = episodeOwnerRef.current !== uid;
      if (ownerChanged) {
        setProgressReady(false);
        // An explicit play under a different account starts from that account's place.
        if (!switching) { try { a.currentTime=0;setPosition(0); } catch { /* source not ready */ } }
      }
      userIdRef.current = uid;episodeOwnerRef.current = uid;_singletonOwner=uid;
      if ((resumeNeeded || ownerChanged) && uid) {
        const rows = ownedListens(await base44.entities.PodcastListens.filter({user_id:uid,lifestyle_item_id:episode.id},'-updated_at',10),uid,episode.id);
        const confirmedOwner = (await base44.auth.me())?.id;
        if (!isCurrent() || confirmedOwner !== uid || episodeOwnerRef.current !== uid) return;
        const ownedRetryAt = retryOwner === uid ? retryAt : 0;
        const saved = rows[0], resumeAt = ownedRetryAt || finiteSeconds(saved?.position_sec);
        const confirmPlace = () => {
          setProgressReady(true);
          setProgressError(previous=>previous === 'Your saved place couldn’t load.' ? null : previous);
        };
        if (ownedRetryAt > 0 || (saved && !saved.completed && resumeAt > 5)) {
          const restore = async () => {
            try {
            if (!isCurrent()) return;
            if ((await base44.auth.me())?.id !== uid || !isCurrent()) return;
            const actualDuration = finiteSeconds(a.duration);
            const target = actualDuration ? Math.min(resumeAt,Math.max(0,actualDuration - 0.01)) : resumeAt;
            a.currentTime = target;setPosition(target);confirmPlace();
            resumeCleanupRef.current?.();resumeCleanupRef.current=null;
            } catch { if (isCurrent()) setProgressError('Your saved place couldn’t load.'); }
          };
          if (a.readyState >= 1) await restore();
          else {
            a.addEventListener('loadedmetadata',restore,{once:true});
            resumeCleanupRef.current=()=>a.removeEventListener('loadedmetadata',restore);
          }
        } else confirmPlace();
      }
    } catch {
      if (isCurrent()) setProgressError('Your saved place couldn’t load.');
    }
    await startResult;
  }, [cancelResume,setTransport,upsertListenRow,setProgressReady]);

  const pause = useCallback(() => {
    cancelResume();
    const a = audioRef.current;
    if (a) a.pause();
  }, [cancelResume]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused || a.error) play(currentEpisodeRef.current);
    else pause();
  }, [play,pause]);

  const seek = useCallback((sec) => {
    const a = audioRef.current;
    if (!a) return;
    if (!Number.isFinite(Number(sec))) return;
    cancelResume();
    setProgressReady(true);
    const dur = finiteSeconds(a.duration);
    const clamped = Math.max(0,dur ? Math.min(dur,Number(sec)) : Number(sec));
    a.currentTime = clamped;
    setPosition(clamped);
  }, [cancelResume,setProgressReady]);

  const seekBy = useCallback((delta) => {
    const a = audioRef.current;
    if (!a) return;
    seek((a.currentTime || 0) + delta);
  }, [seek]);

  const close = useCallback(() => {
    cancelResume();
    const a = audioRef.current;
    // Persist final position before tearing down.
    const ep = currentEpisodeRef.current;
    if (a && ep) {
      const dur = finiteSeconds(a.duration);
      const pos = finiteSeconds(a.currentTime);
      upsertListenRow(ep, pos, dur, dur > 0 && pos / dur >= COMPLETED_THRESHOLD);
    }
    currentEpisodeRef.current = null;
    episodeOwnerRef.current = null;
    _singletonOwner=null;setProgressReady(false);
    if (a) { try { a.pause(); a.volume = 1;a.removeAttribute('src'); a.load(); } catch { /* noop */ } }
    setCurrentEpisode(null);
    currentEpisodeRef.current = null;
    _singletonEpisode = null;
    _notifySingleton();
    setTransport('idle');setSleepFading(false);setProgressError(null);
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
  }, [upsertListenRow,cancelResume,setTransport,setProgressReady]);

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

  // Sleep timer — FADES OUT and then pauses when N minutes elapse. Pass null to cancel.
  //
  // RESEARCHED (16/07/2026): a hard stop is a jolt in the exact moment we promised calm — a
  // meditation cut off mid-breath. Fade-out is still an OPEN, unfulfilled user request on
  // Spotify, so it's a cheap on-brand win we can simply beat them to: we ramp the volume over
  // the last SLEEP_FADE_SEC and only then pause. `sleepFading` is exposed so the UI can fold
  // the flora closed as it goes. Volume is always restored (on end, on cancel, on unmount).
  const setSleepTimer = useCallback((min) => {
    // Clear any existing interval first.
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    const restoreVolume = () => { const a = audioRef.current; if (a) { try { a.volume = 1; } catch { /* noop */ } } };
    restoreVolume();
    if (!min || min <= 0) {
      setSleepTimerMinState(null);
      setSleepRemainingSec(0);
      setSleepFading(false);
      restoreVolume();   // cancelling mid-fade must not leave her audio quiet
      return;
    }
    setSleepTimerMinState(min);
    setSleepRemainingSec(Math.floor(min * 60));
    setSleepFading(false);
    sleepTimerRef.current = setInterval(() => {
      setSleepRemainingSec((prev) => {
        const next = prev - 1;
        const a = audioRef.current;
        if (next <= 0) {
          // Faded to nothing — now pause, clear, and restore the volume for next time.
          clearInterval(sleepTimerRef.current);
          sleepTimerRef.current = null;
          if (a) { try { a.pause(); } catch { /* noop */ } }
          restoreVolume();
          setSleepTimerMinState(null);
          setSleepFading(false);
          return 0;
        }
        // The last stretch: ease the volume down instead of cutting it.
        if (next <= SLEEP_FADE_SEC) {
          setSleepFading(true);
          if (a) { try { a.volume = Math.max(0, Math.min(1, next / SLEEP_FADE_SEC)); } catch { /* noop */ } }
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
    // The audio survives this provider. A cancelled fade must not leave it quiet.
    if (_singletonAudio) { try { _singletonAudio.volume = 1; } catch { /* iOS may own volume */ } }
  }, []);

  // Apply playback rate whenever audio element changes (covers initial mount).
  useEffect(() => {
    const a = audioRef.current;
    if (a) { try { a.playbackRate = playbackRate; } catch { /* noop */ } }
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  controlsRef.current = {play,pause,seek,seekBy};
  const value = {
    currentEpisode,
    isPlaying,
    position,
    duration,
    isExpanded,
    error,
    playbackStatus,
    progressError,
    retryProgress: () => {
      const ep=currentEpisodeRef.current,uid=episodeOwnerRef.current;
      const pending=ep && uid && _pendingPositions.get(`${uid}:${ep.id}`);
      if (pending) return upsertListenRow(ep,pending.posSec,pending.durSec,pending.isCompleted,uid);
    },
    playbackRate,
    sleepTimerMin,
    sleepRemainingSec,
    sleepFading,        // true during the final fade — the UI folds the flora closed as it goes
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

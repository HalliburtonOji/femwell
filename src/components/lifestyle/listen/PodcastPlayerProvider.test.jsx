import React, { useContext } from 'react';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({ me: vi.fn(), filter: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: { me: sdk.me },
    entities: { PodcastListens: { filter: sdk.filter, create: sdk.create, update: sdk.update } },
  },
}));

const episode = (id = 'episode-a') => ({
  id, title: `A real ${id}`, source_name: 'Publisher',
  audio_url: `https://audio.example/${id}.mp3`, duration_seconds: 180,
  episode_url: `https://publisher.example/${id}`, transcript: 'The supplied transcript.',
});
const saved = (id = 'episode-a', patch = {}) => ({
  id: `listen-${id}`, user_id: 'owner', lifestyle_item_id: id,
  position_sec: 68, duration_sec: 180, completed: false, ...patch,
});
const deferred = () => {
  let resolve; let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 8; i += 1) await Promise.resolve(); };

let owner;
let audio;
let context;
let Provider;
let PlayerContext;
let realCreate;

function ReaderOfPlayer() {
  context = useContext(PlayerContext);
  return <div data-testid="player-probe">{context.currentEpisode?.id || 'No episode'}</div>;
}

// Real HTMLAudioElement + real EventTarget delivery; only native media work is
// simulated. The provider, hooks, lifetime, async calls and context are genuine.
function makeAudio() {
  const element = realCreate('audio');
  const state = { paused: true, duration: NaN, readyState: 0, currentTime: 0, error: null };
  Object.keys(state).forEach((key) => Object.defineProperty(element, key, {
    configurable: true, get: () => state[key], set: (value) => { state[key] = value; },
  }));
  element.load = vi.fn(() => {
    state.currentTime = 0; state.readyState = 0; state.duration = NaN; state.paused = true; state.error = null;
  });
  element.play = vi.fn(() => {
    state.paused = false;
    element.dispatchEvent(new Event('play'));
    element.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  });
  element.pause = vi.fn(() => {
    if (state.paused) return;
    state.paused = true;
    element.dispatchEvent(new Event('pause'));
  });
  element.metadata = (duration = 180) => {
    state.duration = duration; state.readyState = 1;
    element.dispatchEvent(new Event('loadedmetadata'));
  };
  return element;
}

beforeEach(async () => {
  vi.resetModules(); vi.resetAllMocks(); localStorage.clear();
  owner = 'owner'; audio = null; context = null;
  sdk.me.mockImplementation(async () => owner ? { id: owner } : null);
  sdk.filter.mockResolvedValue([]);
  sdk.create.mockResolvedValue({ id: 'created-listen' });
  sdk.update.mockResolvedValue({ id: 'updated-listen' });
  realCreate = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((name, ...args) => {
    if (name.toLowerCase() === 'audio') { audio = makeAudio(); return audio; }
    return realCreate(name, ...args);
  });
  const module = await import('./PodcastPlayerProvider');
  Provider = module.PodcastPlayerProvider; PlayerContext = module.PodcastPlayerContext;
});

afterEach(() => {
  cleanup();
  audio?.remove();
  vi.restoreAllMocks(); vi.useRealTimers();
});

async function mount() {
  const view = render(<Provider><ReaderOfPlayer /></Provider>);
  await act(flush);
  expect(audio).toBeInstanceOf(HTMLAudioElement);
  return view;
}
async function begin(item = episode()) {
  let result;
  await act(async () => { result = context.play(item); await flush(); });
  return { promise: result };
}
async function event(name) { await act(async () => { audio.dispatchEvent(new Event(name)); await flush(); }); }

describe('latest episode intent and cached metadata', () => {
  it('should start in the user gesture before a deferred resume lookup finishes', async () => {
    const lookup = deferred(); sdk.filter.mockReturnValueOnce(lookup.promise);
    await mount(); await begin();
    expect(audio.play).toHaveBeenCalledTimes(1);
    await act(async () => { lookup.resolve([]); await flush(); });
    expect(audio.play).toHaveBeenCalledTimes(1);
  });

  it('should restore a real saved place when metadata loaded before the lookup result', async () => {
    const lookup = deferred(); sdk.filter.mockReturnValueOnce(lookup.promise);
    await mount(); const pending = await begin();
    act(() => audio.metadata());
    await act(async () => { lookup.resolve([saved()]); await pending.promise; await flush(); });
    expect(audio.currentTime).toBe(68);
    expect(context.position).toBe(68);
  });

  it('should ignore delayed episode A after the user has selected and started B', async () => {
    const lookupA = deferred(); sdk.filter.mockReturnValueOnce(lookupA.promise);
    await mount(); const pendingA = await begin();
    const pendingB = await begin(episode('episode-b'));
    await act(async () => { await pendingB.promise; audio.metadata(); audio.currentTime = 24; audio.dispatchEvent(new Event('timeupdate')); await flush(); });
    const playCount = audio.play.mock.calls.length;
    await act(async () => { lookupA.resolve([saved()]); await pendingA.promise; audio.dispatchEvent(new Event('loadedmetadata')); await flush(); });
    expect(context.currentEpisode.id).toBe('episode-b');
    expect(audio.src).toContain('episode-b.mp3');
    expect(audio.currentTime).toBe(24);
    expect(audio.play).toHaveBeenCalledTimes(playCount);
  });

  it('should keep Close final when an old saved-place lookup settles afterwards', async () => {
    const lookup = deferred(); sdk.filter.mockReturnValueOnce(lookup.promise);
    await mount(); const pending = await begin();
    await act(async () => { context.close(); await flush(); });
    const playCount = audio.play.mock.calls.length;
    await act(async () => { lookup.resolve([saved()]); await pending.promise; audio.dispatchEvent(new Event('loadedmetadata')); await flush(); });
    expect(context.currentEpisode).toBeNull();
    expect(audio.getAttribute('src')).toBeNull();
    expect(audio.paused).toBe(true);
    expect(context.isPlaying).toBe(false);
    expect(audio.play).toHaveBeenCalledTimes(playCount);
  });

  it.each(['pause', 'seek'])('should not override a deliberate %s with a late saved place', async (intent) => {
    const lookup = deferred(); sdk.filter.mockReturnValueOnce(lookup.promise);
    await mount(); const pending = await begin();
    act(() => audio.metadata());
    await act(async () => { if (intent === 'pause') context.pause(); else context.seek(32); await flush(); });
    const position = audio.currentTime; const playCount = audio.play.mock.calls.length;
    await act(async () => { lookup.resolve([saved()]); await pending.promise; audio.dispatchEvent(new Event('loadedmetadata')); await flush(); });
    expect(audio.currentTime).toBe(position);
    expect(audio.play).toHaveBeenCalledTimes(playCount);
    if (intent === 'pause') expect(audio.paused).toBe(true);
  });

  it('should not apply a previous owner’s saved position after auth changes during lookup', async () => {
    const lookup = deferred(); sdk.filter.mockReturnValueOnce(lookup.promise);
    await mount(); const pending = await begin(); act(() => audio.metadata()); owner = 'new-owner';
    await act(async () => { lookup.resolve([saved()]); await pending.promise; audio.dispatchEvent(new Event('loadedmetadata')); await flush(); });
    expect(audio.currentTime).toBe(0);
  });

  it('should apply an owned saved place once metadata arrives after a completed lookup', async () => {
    sdk.filter.mockResolvedValue([saved()]); await mount(); const pending = await begin();
    await act(async () => { await pending.promise; audio.metadata(); await flush(); });
    expect(audio.currentTime).toBe(68); expect(context.position).toBe(68);
    act(() => { audio.currentTime = 75; audio.dispatchEvent(new Event('loadedmetadata')); });
    expect(audio.currentTime).toBe(75);
  });

  it('should recover honestly when auth fails after lookup but at metadata readiness', async () => {
    sdk.filter.mockResolvedValue([saved()]); await mount(); const pending = await begin();
    await act(async () => { await pending.promise; await flush(); });
    sdk.me.mockRejectedValue(new Error('Temporary auth failure'));
    await act(async () => { audio.metadata(); await flush(); });
    expect(audio.currentTime).toBe(0); expect(context.progressError).toBeTruthy();
    expect(context.isPlaying).toBe(true);
  });

  it('should read a new owner’s place for the same episode instead of inheriting the old owner’s resume', async () => {
    sdk.filter.mockImplementation(async ({ user_id, lifestyle_item_id }) => [saved(lifestyle_item_id, {
      id: user_id === 'owner' ? 'owner-listen' : 'new-owner-listen',
      user_id, position_sec: user_id === 'owner' ? 68 : 24,
    })]);
    await mount(); const initial = await begin();
    await act(async () => { await initial.promise; audio.metadata(); await flush(); });
    expect(audio.currentTime).toBe(68);
    await act(async () => { context.pause(); await flush(); });
    owner = 'new-owner'; sdk.filter.mockClear(); sdk.create.mockClear(); sdk.update.mockClear();
    const nextOwner = await begin();
    await act(async () => { await nextOwner.promise; await flush(); });
    expect(sdk.filter).toHaveBeenCalledWith({ user_id: 'new-owner', lifestyle_item_id: 'episode-a' }, '-updated_at', 10);
    expect(audio.currentTime).toBe(24); expect(context.position).toBe(24);
    await act(async () => { context.pause(); await flush(); });
    await waitFor(() => expect(sdk.update).toHaveBeenCalledWith('new-owner-listen', expect.objectContaining({ user_id: 'new-owner', position_sec: 24 })));
  });

  it('should not let obsolete post-lookup auth mark a new episode ready before its saved place arrives', async () => {
    await mount(); const oldAuth = deferred(); const newLookup = deferred(); let newReads = 0;
    sdk.me.mockResolvedValueOnce({ id: 'owner' }).mockReturnValueOnce(oldAuth.promise);
    sdk.filter.mockImplementation(async ({ lifestyle_item_id }) => {
      if (lifestyle_item_id !== 'episode-b') return [];
      newReads += 1;
      return newReads === 1 ? newLookup.promise : [];
    });
    const pendingA = await begin();
    const pendingB = await begin(episode('episode-b')); act(() => audio.metadata());
    expect(newReads).toBe(1);
    await act(async () => { oldAuth.resolve({ id: 'owner' }); await pendingA.promise; await flush(); });
    await act(async () => { audio.currentTime = 12; audio.dispatchEvent(new Event('timeupdate')); await flush(); });
    expect(sdk.create).not.toHaveBeenCalled(); expect(sdk.update).not.toHaveBeenCalled();
    expect(newReads).toBe(1);
    await act(async () => { newLookup.resolve([saved('episode-b', { position_sec: 42 })]); await pendingB.promise; await flush(); });
    expect(context.currentEpisode.id).toBe('episode-b'); expect(audio.currentTime).toBe(42);
  });

  it('should ignore an earlier queued pause event after same-episode play retries a failed saved lookup', async () => {
    sdk.filter.mockRejectedValueOnce(new Error('Initial saved place unavailable'));
    await mount(); const initial = await begin();
    await act(async () => { await initial.promise; audio.metadata(); await flush(); });
    expect(context.progressError).toBeTruthy();
    // Native pause changes paused synchronously but delivers its event later.
    audio.pause.mockImplementationOnce(() => { audio.paused = true; });
    act(() => context.pause());
    const lookup = deferred(); sdk.filter.mockReturnValueOnce(lookup.promise);
    const restarted = await begin(); expect(audio.paused).toBe(false);
    await act(async () => { audio.dispatchEvent(new Event('pause')); await flush(); });
    await act(async () => { lookup.resolve([saved()]); await restarted.promise; await flush(); });
    expect(audio.currentTime).toBe(68); expect(context.position).toBe(68);
    expect(context.isPlaying).toBe(true); expect(context.playbackStatus).toBe('playing');
  });

  it('should use the new owner’s saved place rather than the previous owner’s local error-retry position', async () => {
    sdk.filter.mockImplementation(async ({ user_id, lifestyle_item_id }) => [saved(lifestyle_item_id, {
      id: user_id === 'owner' ? 'owner-listen' : 'new-owner-listen',
      user_id, position_sec: user_id === 'owner' ? 68 : 24,
    })]);
    await mount(); const initial = await begin();
    await act(async () => { await initial.promise; audio.metadata(); await flush(); });
    expect(audio.currentTime).toBe(68); act(() => { audio.error = { code: 2 }; }); await event('error');
    owner = 'new-owner'; const retry = await begin();
    await act(async () => { await retry.promise; audio.metadata(); await flush(); });
    expect(audio.currentTime).toBe(24); expect(context.position).toBe(24);
    expect(context.currentEpisode.id).toBe('episode-a');
  });

  it.each(['older row', 'confirmed absence'])('should retain the same owner’s local retry position when lookup returns %s', async (kind) => {
    sdk.filter.mockResolvedValue([saved('episode-a', { position_sec: 20 })]); await mount(); const initial = await begin();
    await act(async () => { await initial.promise; audio.metadata(); await flush(); });
    expect(audio.currentTime).toBe(20);
    act(() => { audio.currentTime = 43; audio.error = { code: 2 }; }); await event('error');
    sdk.filter.mockResolvedValue(kind === 'older row' ? [saved('episode-a', { position_sec: 20 })] : []);
    const retry = await begin();
    await act(async () => { await retry.promise; audio.metadata(); await flush(); });
    expect(audio.currentTime).toBe(43); expect(context.position).toBe(43);
    expect(context.error).toBeNull(); expect(context.playbackStatus).toBe('playing');
  });

  it('should clear a saved-place load error when the deliberate retry succeeds without a pending write', async () => {
    sdk.filter.mockRejectedValueOnce(new Error('Saved place lookup failed'));
    await mount(); const initial = await begin();
    await act(async () => { await initial.promise; audio.metadata(); await flush(); });
    expect(context.progressError).toBeTruthy(); sdk.filter.mockResolvedValue([saved()]);
    const retry = await begin();
    await act(async () => { await retry.promise; await flush(); });
    expect(audio.currentTime).toBe(68); expect(context.progressError).toBeNull();
  });

  it('should ignore an old play rejection after a newer episode has successfully started', async () => {
    await mount(); const denied = deferred(); audio.play.mockReturnValueOnce(denied.promise);
    const pendingA = await begin(); const pendingB = await begin(episode('episode-b'));
    await act(async () => { await pendingB.promise; denied.reject(new Error('Obsolete A failure')); await pendingA.promise; await flush(); });
    expect(context.currentEpisode.id).toBe('episode-b'); expect(context.error).toBeNull();
    expect(context.isPlaying).toBe(true);
  });
});

describe('acknowledged owner-safe listen persistence', () => {
  it('should not create a listen when pause or Close cannot confirm the existing collection', async () => {
    await mount(); await begin(); act(() => audio.metadata());
    sdk.filter.mockRejectedValue(new Error('Offline lookup'));
    await act(async () => { context.pause(); context.close(); await flush(); });
    expect(sdk.create).not.toHaveBeenCalled();
    expect(sdk.update).not.toHaveBeenCalled();
  });

  it.each([null, { rows: [] }, [null], [saved('episode-a', { user_id: 'other-owner' })], [saved('other-episode')], [{ id: 'identity-only' }]].map(rows => [rows]))(
    'should reject unconfirmed or mismatched listen rows instead of resuming or writing: %j', async (rows) => {
      sdk.filter.mockResolvedValue(rows);
      await mount(); const pending = await begin();
      await act(async () => { await pending.promise; audio.metadata(); context.pause(); await flush(); });
      expect(audio.currentTime).toBe(0);
      expect(sdk.create).not.toHaveBeenCalled();
      expect(sdk.update).not.toHaveBeenCalled();
    },
  );

  it('should use the current owner for a new episode rather than stale mount auth', async () => {
    await mount(); await begin(); owner = 'new-owner'; sdk.filter.mockClear();
    await begin(episode('episode-b'));
    expect(sdk.filter).toHaveBeenCalledWith(
      { user_id: 'new-owner', lifestyle_item_id: 'episode-b' }, '-updated_at', 10,
    );
  });

  it('should not mutate the old owner’s row if auth changes while a persistence read is pending', async () => {
    await mount(); await begin(); act(() => audio.metadata());
    const lookup = deferred(); sdk.filter.mockReturnValueOnce(lookup.promise);
    await act(async () => { context.pause(); await flush(); }); owner = 'new-owner';
    await act(async () => { lookup.resolve([saved()]); await flush(); });
    expect(sdk.create).not.toHaveBeenCalled(); expect(sdk.update).not.toHaveBeenCalled();
  });

  it('should keep anonymous playback usable without any owned resume or persistence calls', async () => {
    owner = null; await mount(); await begin();
    expect(context.isPlaying).toBe(true); expect(context.currentEpisode.id).toBe('episode-a');
    await act(async () => { context.pause(); context.close(); await flush(); });
    expect(sdk.filter).not.toHaveBeenCalled(); expect(sdk.create).not.toHaveBeenCalled(); expect(sdk.update).not.toHaveBeenCalled();
  });

  it('should serialise pause and Close so confirmed absence creates only one row', async () => {
    await mount(); await begin(); act(() => audio.metadata());
    const firstLookup = deferred(); let row = null;
    sdk.filter.mockImplementationOnce(() => firstLookup.promise).mockImplementation(async () => row ? [row] : []);
    sdk.create.mockImplementation(async (payload) => { row = { id: 'one-listen', ...payload }; return row; });
    await act(async () => { audio.currentTime = 43; context.pause(); context.close(); await flush(); });
    expect(sdk.create).not.toHaveBeenCalled();
    await act(async () => { firstLookup.resolve([]); await flush(); });
    await waitFor(() => expect(sdk.create).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(sdk.update).toHaveBeenCalledWith('one-listen', expect.objectContaining({ position_sec: 43 })));
    expect(sdk.create.mock.calls[0][0]).toEqual(expect.objectContaining({ updated_at: expect.any(String) }));
    expect(sdk.create.mock.calls[0][0]).not.toHaveProperty('last_played_at');
  });

  it('should resume and update the newest trusted duplicate regardless of received order', async () => {
    const older = saved('episode-a', { id: 'older-listen', position_sec: 19, updated_at: '2026-10-06T12:00:00Z' });
    const newer = saved('episode-a', { id: 'newer-listen', position_sec: 87, updated_at: '2026-10-07T12:00:00Z' });
    sdk.filter.mockResolvedValue([older, newer]);
    await mount(); const pending = await begin();
    await act(async () => { await pending.promise; audio.metadata(); await flush(); });
    expect(audio.currentTime).toBe(87); expect(context.position).toBe(87);
    await act(async () => { audio.currentTime = 91; context.pause(); await flush(); });
    await waitFor(() => expect(sdk.update).toHaveBeenCalledWith('newer-listen', expect.objectContaining({ position_sec: 91 })));
    expect(sdk.create).not.toHaveBeenCalled();
  });

  it('should retain an unsynced place and retry that acknowledged snapshot rather than a later seek', async () => {
    sdk.filter.mockResolvedValue([saved()]);
    await mount(); const pending = await begin();
    await act(async () => { await pending.promise; audio.metadata(); await flush(); });
    sdk.update.mockRejectedValueOnce(new Error('Temporary write failure'));
    await act(async () => { audio.currentTime = 43; context.pause(); await flush(); });
    await waitFor(() => expect(context.progressError).toBeTruthy());
    act(() => { audio.currentTime = 99; });
    await act(async () => { await context.retryProgress(); await flush(); });
    expect(sdk.update).toHaveBeenLastCalledWith('listen-episode-a', expect.objectContaining({ position_sec: 43 }));
    expect(context.progressError).toBeNull();
  });

  it('should expose an unacknowledged write as unsynced until a retry is acknowledged', async () => {
    await mount(); await begin(); act(() => audio.metadata()); sdk.create.mockResolvedValueOnce(undefined);
    await act(async () => { audio.currentTime = 43; context.pause(); await flush(); });
    await waitFor(() => expect(context.progressError).toBeTruthy());
    await act(async () => { await context.retryProgress(); await flush(); });
    expect(sdk.create).toHaveBeenLastCalledWith(expect.objectContaining({ position_sec: 43, user_id: 'owner' }));
    expect(context.progressError).toBeNull();
  });
});

describe('truthful transport state and retained capabilities', () => {
  it('should keep duration and seek state finite for a stream without a finite duration', async () => {
    await mount(); await begin(); act(() => audio.metadata(Infinity));
    expect(Number.isFinite(context.duration)).toBe(true);
    act(() => context.seek(NaN));
    expect(Number.isFinite(context.position)).toBe(true);
    expect(Number.isFinite(audio.currentTime)).toBe(true);
  });

  it('should show buffering until actual playing resumes and failed after a media error', async () => {
    await mount(); await begin();
    expect(context.playbackStatus).toBe('playing');
    await event('waiting');
    expect(context.playbackStatus).toBe('buffering'); expect(context.isPlaying).toBe(false);
    await event('playing');
    expect(context.playbackStatus).toBe('playing'); expect(context.isPlaying).toBe(true);
    act(() => { audio.error = { code: 2 }; }); await event('error');
    expect(context.playbackStatus).toBe('failed'); expect(context.isPlaying).toBe(false);
    expect(context.error).toBeTruthy();
  });

  it('should not label the play event as audible playback before the playing event', async () => {
    await mount();
    audio.play.mockImplementationOnce(() => { audio.paused = false; audio.dispatchEvent(new Event('play')); return Promise.resolve(); });
    await begin(); expect(context.isPlaying).toBe(false); expect(context.playbackStatus).toBe('loading');
    await event('playing'); expect(context.isPlaying).toBe(true); expect(context.playbackStatus).toBe('playing');
  });

  it('should expose a rejected retry rather than silently leave a paused transport', async () => {
    await mount(); await begin(); act(() => context.pause());
    audio.play.mockRejectedValueOnce(new Error('Playback denied'));
    await act(async () => { context.togglePlay(); await flush(); });
    expect(context.error).toBeTruthy(); expect(context.isPlaying).toBe(false);
    expect(context.playbackStatus).toBe('failed');
  });

  it('should resume the same episode in place without another source load or lookup', async () => {
    await mount(); await begin(); act(() => audio.metadata());
    act(() => { audio.currentTime = 39; context.pause(); }); await act(flush);
    const loads = audio.load.mock.calls.length;
    sdk.filter.mockClear();
    await begin();
    expect(audio.load).toHaveBeenCalledTimes(loads);
    expect(audio.currentTime).toBe(39);
    expect(sdk.filter).not.toHaveBeenCalled();
  });

  it('should start a previously completed episode afresh instead of resuming its final seconds', async () => {
    sdk.filter.mockResolvedValue([saved('episode-a', { position_sec: 179, completed: true })]);
    await mount(); const pending = await begin();
    await act(async () => { await pending.promise; audio.metadata(); await flush(); });
    expect(audio.currentTime).toBe(0);
  });

  it('should retain one live audio element, current episode, position and rate across provider remount', async () => {
    localStorage.setItem('fw_podcast_playback_rate', '1.5');
    const view = await mount(); await begin(); act(() => { audio.metadata(); audio.currentTime = 42; });
    const original = audio; const loads = original.load.mock.calls.length;
    view.unmount();
    await mount();
    expect(audio).toBe(original); expect(document.querySelectorAll('audio')).toHaveLength(1);
    expect(context.currentEpisode.id).toBe('episode-a'); expect(context.position).toBe(42);
    expect(context.isPlaying).toBe(true); expect(context.playbackRate).toBe(1.5);
    expect(audio.playbackRate).toBe(1.5); expect(audio.load).toHaveBeenCalledTimes(loads);
  });

  it('should preserve current-owner persistence when the active singleton provider remounts', async () => {
    const view = await mount(); await begin(); act(() => { audio.metadata(); audio.currentTime = 42; });
    view.unmount(); await mount(); sdk.filter.mockClear();
    await act(async () => { context.pause(); await flush(); });
    await waitFor(() => expect(sdk.filter).toHaveBeenCalledWith({ user_id: 'owner', lifestyle_item_id: 'episode-a' }, '-updated_at', 10));
    await waitFor(() => expect(sdk.create).toHaveBeenCalledWith(expect.objectContaining({ position_sec: 42, user_id: 'owner' })));
  });

  it('should keep the existing sleep fade, cancel restoration and timed pause', async () => {
    await mount(); await begin(); vi.useFakeTimers();
    act(() => context.setSleepTimer(1));
    act(() => vi.advanceTimersByTime(45000));
    expect(context.sleepFading).toBe(true); expect(audio.volume).toBeCloseTo(0.75);
    act(() => context.setSleepTimer(null));
    expect(audio.volume).toBe(1); expect(context.sleepFading).toBe(false);
    act(() => context.setSleepTimer(1)); act(() => vi.advanceTimersByTime(60000));
    expect(audio.paused).toBe(true); expect(context.sleepTimerMin).toBeNull();
    expect(audio.volume).toBe(1);
  });

  it('should restore full volume and cancel the fade when Close precedes a new episode', async () => {
    await mount(); await begin(); vi.useFakeTimers(); act(() => context.setSleepTimer(1));
    act(() => vi.advanceTimersByTime(45000)); expect(audio.volume).toBeCloseTo(0.75);
    await act(async () => { context.close(); await flush(); });
    expect(audio.volume).toBe(1); expect(context.sleepFading).toBe(false); expect(context.sleepTimerMin).toBeNull();
    await begin(episode('episode-b')); act(() => vi.advanceTimersByTime(20000));
    expect(audio.volume).toBe(1); expect(audio.paused).toBe(false); expect(context.currentEpisode.id).toBe('episode-b');
  });
});

import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { playableEpisode, episodeSourceUrl } from '@/components/lifestyle/listen/episode';

const calls = vi.hoisted(() => ({ filter: vi.fn(), audio: vi.fn() }));
vi.mock('@/api/base44Client', () => ({ base44: { entities: { LifestyleItems: { filter: calls.filter } } } }));
vi.mock('@/components/brand/PageTop', () => ({ FwFloraHero: () => <h1>Listen & watch</h1> }));
vi.mock('@/components/brand/FloraCover', () => ({ default: () => <div /> }));
vi.mock('@/components/brand/expandCards', () => ({
  FloraAudio: props => { calls.audio(props); return <button type="button">Play audio</button>; },
  FloraYouTube: () => <div />,
  decodeEntities: value => value,
}));

import WatchListen from './WatchListen';

const row = {
  id: 'podcast-one', media_type: 'PODCAST', status: 'PUBLISHED', title: 'A good hour',
  audio_url: 'https://audio.example/one.mp3', episode_url: 'https://publisher.example/one',
  source_url: 'https://publisher.example', source_name: 'The publisher',
  transcript: 'A complete transcript from the publisher.', duration_seconds: 3600,
};

beforeEach(() => { calls.filter.mockReset(); calls.audio.mockClear(); history.replaceState({}, '', '/WatchListen?appearance=calm&from=lifestyle-main&mode=listen'); });
afterEach(cleanup);

describe('opened Listen directory', () => {
  it('hands the full episode source and transcript to the shared player', async () => {
    calls.filter.mockImplementation(async query => query.media_type === 'PODCAST' ? [row] : []);
    render(<MemoryRouter><WatchListen /></MemoryRouter>);
    await waitFor(() => expect(calls.audio).toHaveBeenCalled());
    const props = calls.audio.mock.calls.find(([item]) => item.item.id === row.id)?.[0];
    const episode = playableEpisode(props.item, props.src, props.initialDuration, props.label);
    expect(episode.transcript).toBe(row.transcript);
    expect(episodeSourceUrl(episode)).toBe(row.episode_url);
    expect(episode.audio_url).toBe(row.audio_url);
  });

  it('reports a failed catalogue and lets the reader retry without a false empty shelf', async () => {
    calls.filter.mockRejectedValue(new Error('unavailable'));
    render(<MemoryRouter><WatchListen /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent("couldn't load");
    calls.filter.mockImplementation(async query => query.media_type === 'PODCAST' ? [row] : []);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(screen.getByText('A good hour')).toBeInTheDocument();
  });

  it('retains published practice audio from the mixed source window', async () => {
    const practice = { ...row, id: 'practice-one', media_type: 'PRACTICE', title: 'A useful pause' };
    calls.filter.mockImplementation(async query => query.media_type ? [] : [practice]);
    render(<MemoryRouter><WatchListen /></MemoryRouter>);
    expect(await screen.findByText('A useful pause')).toBeInTheDocument();
    expect(calls.audio.mock.calls.some(([props]) => props.item._raw.media_type === 'PRACTICE')).toBe(true);
  });
});

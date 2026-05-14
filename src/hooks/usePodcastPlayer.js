import { useContext } from 'react';
import { PodcastPlayerContext } from '@/components/lifestyle/listen/PodcastPlayerProvider';

/**
 * Access the singleton podcast player from anywhere in the app shell.
 *
 * Returns a shape with:
 *   currentEpisode, isPlaying, position, duration, isExpanded, error,
 *   play(episode), pause(), togglePlay(), seek(sec), seekBy(delta),
 *   close(), expand(), collapse().
 *
 * When called outside a PodcastPlayerProvider (e.g. server-side / tests)
 * returns null — callers should guard.
 */
export function usePodcastPlayer() {
  const ctx = useContext(PodcastPlayerContext);
  return ctx;
}

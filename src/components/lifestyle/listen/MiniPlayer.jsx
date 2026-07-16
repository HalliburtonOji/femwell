import { Play, Pause, X, ExternalLink } from 'lucide-react';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';

// Mini-player rendered at the bottom of the viewport, above the mobile
// bottom nav. Null-renders when no episode is loaded. Tap anywhere except
// controls → expand to the full ExpandedPlayer modal. Spec §2.2.
//
// Layout sits 80px above the viewport bottom on mobile to clear the nav.
// On wider screens (≥768px) we drop the offset since the nav is not in
// that position.

const MINI_HEIGHT = 56;

export default function MiniPlayer() {
  const player = usePodcastPlayer();
  if (!player) return null;
  const { currentEpisode, isPlaying, togglePlay, close, expand, error } = player;
  if (!currentEpisode) return null;

  // External fallback target — try the most specific link the episode carries.
  // LifestyleItems rows store `content_url` (the episode/article URL) and may
  // also carry a `source_url` (the show's website). Either is fine for
  // "Open externally" when in-app playback fails.
  const externalUrl = currentEpisode.content_url || currentEpisode.source_url || null;

  const handleClick = (e) => {
    // Clicks on the controls (play/pause + close) should not expand.
    if (e.target.closest('[data-mini-player-control]')) return;
    expand();
  };

  return (
    <div
      role="region"
      aria-label="Podcast mini player"
      onClick={handleClick}
      className="podcast-mini-player"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 80,
        zIndex: 90,
        margin: '0 12px',
        height: MINI_HEIGHT,
        background: '#7A1A12',
        color: '#F4EFE3',
        borderRadius: 14,
        boxShadow: '0 8px 22px -10px rgba(43,30,22,0.45)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 8px 0 8px',
        cursor: 'pointer',
        }}
    >
      <style>{`
        @media (min-width: 768px) {
          .podcast-mini-player {
            bottom: 16px !important;
            left: auto !important;
            right: 16px !important;
            margin: 0 !important;
            width: 380px;
          }
        }
      `}</style>

      {/* Album art */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#D8CFBC',
        }}
        aria-hidden="true"
      >
        {currentEpisode.image_url ? (
          <img
            src={currentEpisode.image_url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </div>

      {/* Title + source */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {currentEpisode.title || 'Untitled episode'}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#D8CFBC',
            opacity: 0.7,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {error
            ? <span style={{ color: '#FFB4B4' }}>{error}</span>
            : (currentEpisode.source_name || 'Podcast')}
        </div>
      </div>

      {/* Primary control — Play/pause normally; "Open externally" when
          playback errored and we have a destination to send the user to. */}
      {error && externalUrl ? (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-mini-player-control
          onClick={(e) => e.stopPropagation()}
          aria-label="Open episode externally"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            height: 36, padding: '0 12px',
            borderRadius: 9999,
            background: '#BC2E27',
            color: '#F4EFE3',
            border: 'none',
            textDecoration: 'none',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          <ExternalLink size={13} aria-hidden="true" />
          Open
        </a>
      ) : (
        <button
          type="button"
          data-mini-player-control
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isPlaying
            ? <Pause size={18} fill="currentColor" aria-hidden="true" />
            : <Play size={18} fill="currentColor" aria-hidden="true" style={{ marginLeft: 1 }} />}
        </button>
      )}

      {/* Close */}
      <button
        type="button"
        data-mini-player-control
        onClick={(e) => { e.stopPropagation(); close(); }}
        aria-label="Close player"
        style={{
          width: 32,
          height: 32,
          borderRadius: 9999,
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          opacity: 0.7,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

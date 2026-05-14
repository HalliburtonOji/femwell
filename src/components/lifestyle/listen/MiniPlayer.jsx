import { Play, Pause, X } from 'lucide-react';
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
  const { currentEpisode, isPlaying, togglePlay, close, expand } = player;
  if (!currentEpisode) return null;

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
        background: 'var(--plum-deep, #2b1e16)',
        color: 'var(--cream, #f7f0e6)',
        borderRadius: 14,
        boxShadow: '0 8px 22px -10px rgba(43,30,22,0.45)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 8px 0 8px',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif",
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
          background: 'var(--cream-2, #ede2d4)',
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
            fontSize: 11,
            color: 'var(--cream-2, #ede2d4)',
            opacity: 0.7,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {currentEpisode.source_name || 'Podcast'}
        </div>
      </div>

      {/* Play/pause */}
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

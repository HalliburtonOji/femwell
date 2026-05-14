import { useEffect, useRef } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, ExternalLink } from 'lucide-react';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';

// Full-screen modal version of the podcast player. Opens when the user
// taps the MiniPlayer body. Provides scrubber, ±15/30s skips, large play
// control. Speed/sleep/resume affordances come in C6.
//
// Per spec §2.2.

function formatTime(sec) {
  if (!sec || sec < 0) return '0:00';
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = String(m - h * 60).padStart(2, '0');
    const ss = String(r).padStart(2, '0');
    return `${h}:${mm}:${ss}`;
  }
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function ExpandedPlayer() {
  const player = usePodcastPlayer();
  const modalRef = useRef(null);

  // A11y: Escape closes, body scroll-lock while open, focus the close
  // button on open.
  useEffect(() => {
    if (!player?.isExpanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        player.collapse();
      }
    };
    window.addEventListener('keydown', handleKey);
    const closeBtn = modalRef.current?.querySelector('[data-expanded-close]');
    if (closeBtn) closeBtn.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.isExpanded]);

  if (!player || !player.isExpanded || !player.currentEpisode) return null;

  const {
    currentEpisode: ep,
    isPlaying,
    position,
    duration,
    togglePlay,
    seek,
    seekBy,
    collapse,
    error,
  } = player;

  const handleScrub = (e) => {
    const next = Number(e.target.value);
    seek(next);
  };

  const remaining = duration ? Math.max(0, duration - position) : 0;
  const pct = duration ? Math.min(100, Math.max(0, (position / duration) * 100)) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Podcast player"
      ref={modalRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'var(--cream, #f7f0e6)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 24px 48px',
        overflowY: 'auto',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top row: close */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          data-expanded-close
          type="button"
          onClick={collapse}
          aria-label="Close player"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            background: 'rgba(0,0,0,0.06)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Album art — large square */}
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          aspectRatio: '1/1',
          margin: '0 auto 24px',
          borderRadius: 16,
          overflow: 'hidden',
          background: 'var(--cream-2, #ede2d4)',
          boxShadow: '0 16px 40px -12px rgba(43,30,22,0.25)',
        }}
        aria-hidden="true"
      >
        {ep.image_url ? (
          <img
            src={ep.image_url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </div>

      {/* Title + source */}
      <div style={{ textAlign: 'center', marginBottom: 20, padding: '0 8px' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: 'var(--plum-mute, #8a7768)',
            margin: 0,
            marginBottom: 6,
          }}
        >
          {ep.source_name || 'Podcast'}
        </p>
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--plum-deep, #2b1e16)',
            margin: 0,
            lineHeight: 1.3,
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {ep.title || 'Untitled episode'}
        </h2>
      </div>

      {/* Scrubber */}
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto 12px' }}>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={1}
          value={Math.min(position, duration || 0)}
          onChange={handleScrub}
          aria-label="Episode progress"
          style={{
            width: '100%',
            accentColor: 'var(--rose-primary, #D45E52)',
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--plum-mute, #8a7768)',
            marginTop: 4,
          }}
        >
          <span>{formatTime(position)}</span>
          <span>−{formatTime(remaining)}</span>
        </div>
        <div
          aria-hidden="true"
          style={{ marginTop: 2, fontSize: 11, color: 'var(--plum-mute, #8a7768)', textAlign: 'center', opacity: 0.6 }}
        >
          {Math.round(pct)}%
        </div>
      </div>

      {/* Controls row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          margin: '8px 0 16px',
        }}
      >
        <button
          type="button"
          onClick={() => seekBy(-15)}
          aria-label="Skip back 15 seconds"
          style={ctrlButton}
        >
          <SkipBack size={26} aria-hidden="true" />
          <span style={ctrlLabel}>15</span>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          style={{
            ...ctrlButton,
            width: 72,
            height: 72,
            background: 'var(--plum-deep, #2b1e16)',
            color: 'var(--cream, #f7f0e6)',
            borderRadius: 9999,
          }}
        >
          {isPlaying
            ? <Pause size={28} fill="currentColor" aria-hidden="true" />
            : <Play size={28} fill="currentColor" aria-hidden="true" style={{ marginLeft: 2 }} />}
        </button>

        <button
          type="button"
          onClick={() => seekBy(30)}
          aria-label="Skip forward 30 seconds"
          style={ctrlButton}
        >
          <SkipForward size={26} aria-hidden="true" />
          <span style={ctrlLabel}>30</span>
        </button>
      </div>

      {/* C6 placeholder row: speed + sleep timer + open-in-your-app affordance */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginTop: 8,
          flexWrap: 'wrap',
        }}
      >
        <a
          href={ep.content_url || ep.episode_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--plum-mute, #8a7768)',
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={14} aria-hidden="true" />
          Open in your app
        </a>
      </div>

      {error && (
        <p
          role="alert"
          style={{
            fontSize: 12,
            color: 'var(--rose-primary, #D45E52)',
            textAlign: 'center',
            margin: '16px auto 0',
            maxWidth: 360,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

const ctrlButton = {
  position: 'relative',
  width: 56,
  height: 56,
  borderRadius: 9999,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--plum-deep, #2b1e16)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ctrlLabel = {
  position: 'absolute',
  top: -6,
  right: -2,
  fontSize: 9,
  fontWeight: 700,
  background: 'var(--cream-2, #ede2d4)',
  color: 'var(--plum-deep, #2b1e16)',
  padding: '1px 4px',
  borderRadius: 4,
  pointerEvents: 'none',
};

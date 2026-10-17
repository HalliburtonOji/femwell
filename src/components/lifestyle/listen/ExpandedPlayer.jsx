import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, ExternalLink, Gauge, Moon } from 'lucide-react';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import { FloraVisualiser } from '@/components/brand/expandCards';
import { useScrollLock } from '@/utils/useScrollLock';
import { episodeSourceUrl } from './episode';
import './ExpandedPlayer.css';

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

  // Body scroll-lock while open (shared, ref-counted hook — replaces the old
  // ad-hoc document.body.style.overflow lock).
  useScrollLock(!!player?.isExpanded);

  // A11y: Escape closes, focus the close button on open.
  useEffect(() => {
    if (!player?.isExpanded) return;
    const returnFocus = document.activeElement;
    const siblings = [...(modalRef.current?.parentElement?.children || [])]
      .filter(element => element !== modalRef.current)
      .map(element => ({ element, inert: element.inert, hidden: element.getAttribute('aria-hidden') }));
    siblings.forEach(({ element }) => { element.inert = true; element.setAttribute('aria-hidden', 'true'); });
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        player.collapse();
      } else if (e.key === 'Tab') {
        const controls = [...(modalRef.current?.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)') || [])]
          .filter(control => control.getClientRects().length > 0);
        if (!controls.length) { e.preventDefault(); return; }
        const first = controls[0], last = controls[controls.length - 1];
        if (!modalRef.current?.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    const closeBtn = modalRef.current?.querySelector('[data-expanded-close]');
    if (closeBtn) closeBtn.focus();
    return () => {
      window.removeEventListener('keydown', handleKey);
      siblings.forEach(({ element, inert, hidden }) => {
        element.inert = inert;
        if (hidden === null) element.removeAttribute('aria-hidden'); else element.setAttribute('aria-hidden', hidden);
      });
      const target = returnFocus?.isConnected && returnFocus !== document.body
        ? returnFocus : document.querySelector('button[aria-label="Expand player"]');
      target?.focus?.();
    };
  }, [player?.isExpanded]);

  const [sleepMenuOpen, setSleepMenuOpen] = useState(false);

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
    playbackStatus,
    progressError,
    retryProgress,
    playbackRate,
    cyclePlaybackRate,
    sleepRemainingSec,
    sleepTimerMin,
    sleepAtEnd,
    sleepFading,
    setSleepTimer,
    setSleepAtEnd,
  } = player;
  const externalUrl = episodeSourceUrl(ep);
  const active = isPlaying || ['loading','buffering'].includes(playbackStatus);

  const sleepLabel = sleepAtEnd ? 'End of story' : sleepTimerMin
    ? `${Math.floor(sleepRemainingSec / 60)}:${String(sleepRemainingSec % 60).padStart(2, '0')}`
    : 'Sleep';

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
      className="fw-sheet-safe fw-listen-expanded"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: '#F5F4F1',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 20px calc(30px + env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        }}
    >
      {/* Top row: close */}
      <div className="fw-listen-expanded__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span>Listen · now playing</span>
        <button
          data-expanded-close
          type="button"
          onClick={collapse}
          aria-label="Close player"
          style={{
            width: 44,
            height: 44,
            borderRadius: 9999,
            background: '#fff',
            border: '1px solid #DFE5E1',
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
        className="fw-listen-expanded__art"
        style={{
          width: '100%',
          maxWidth: 190,
          aspectRatio: '1/1',
          margin: '0 auto 14px',
          borderRadius: 24,
          overflow: 'hidden',
          background: '#E9F0EB',
          boxShadow: '0 12px 28px -18px rgba(49,69,58,0.35)',
        }}
        aria-hidden="true"
      >
        {ep.image_url ? (
          <img
            src={ep.image_url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          /* No artwork? Then the flora IS the artwork — our living-ecosystem visualiser
             (§6.7.7): stems + blooms swaying on unsynced seeded phases while it plays, and
             FOLDING CLOSED over the sleep timer's final fade. */
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'end center', padding: '0 10px 14px' }}>
            <FloraVisualiser playing={isPlaying} fading={!!sleepFading} height={110} />
          </div>
        )}
      </div>

      {/* Title + source */}
      <div style={{ textAlign: 'center', marginBottom: 14, padding: '0 8px' }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: '#42634C',
            margin: 0,
            marginBottom: 6,
          }}
        >
          {ep.source_name || 'Podcast'}
        </p>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 27,
            fontWeight: 500,
            color: '#51444E',
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
            '--fw-progress': `${pct}%`,
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#51444E',
            marginTop: 4,
          }}
        >
          <span>{formatTime(position)}</span>
          <span>−{formatTime(remaining)}</span>
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
          aria-label={active ? 'Pause' : error ? 'Retry playback' : 'Play'}
          style={{
            ...ctrlButton,
            width: 72,
            height: 72,
            background: '#51444E',
            color: '#FFFFFF',
            borderRadius: 9999,
          }}
        >
          {active
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

      {/* Speed + sleep + open-in-your-app row. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginTop: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Speed pill — cycles through 0.8x → 2.0x */}
        <button
          type="button"
          onClick={cyclePlaybackRate}
          aria-label={`Playback speed (currently ${playbackRate}x)`}
          style={pillButton}
        >
          <Gauge size={14} aria-hidden="true" />
          <span>{playbackRate}x</span>
        </button>

        {/* Sleep timer — opens a sub-menu with preset durations */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setSleepMenuOpen((v) => !v)}
            aria-label={sleepAtEnd ? 'Sleep at end of story' : sleepTimerMin ? `Sleep in ${sleepLabel}` : 'Set sleep timer'}
            aria-expanded={sleepMenuOpen}
            style={{ ...pillButton, ...(sleepTimerMin || sleepAtEnd ? activePill : null) }}
          >
            <Moon size={14} aria-hidden="true" />
            <span>{sleepLabel}</span>
          </button>
          {sleepMenuOpen && (
            <div
              role="menu"
              aria-label="Sleep timer options"
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translate(-50%, -8px)',
                background: '#FFFFFF',
                border: '1px solid #DFE5E1',
                borderRadius: 12,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                minWidth: 170,
                maxHeight: 'min(55dvh, 380px)',
                overflowY: 'auto',
                boxShadow: '0 12px 24px -10px rgba(43,30,22,0.2)',
                zIndex: 10,
              }}
            >
              {/* Spotify's set + 10 (research: 5/10/15/30/45/60 + end-of-track) */}
              {[5, 10, 15, 30, 45, 60].map((min) => (
                <button
                  key={min}
                  type="button"
                  role="menuitem"
                  onClick={() => { setSleepTimer(min); setSleepMenuOpen(false); }}
                  style={menuItem}
                >
                  {min} min
                </button>
              ))}
              {/* "End of story" — stop when this one finishes (audiobook convention) */}
              {duration > 0 && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setSleepAtEnd(); setSleepMenuOpen(false); }}
                  style={menuItem}
                >
                  End of story
                </button>
              )}
              {(sleepTimerMin || sleepAtEnd) && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setSleepTimer(null); setSleepMenuOpen(false); }}
                  style={{ ...menuItem, color: '#7A1A12' }}
                >
                  Cancel timer
                </button>
              )}
              {/* Tell her it won't cut — the promise is the point */}
              <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic', fontSize: 14, color: '#51444E', textAlign: 'center', padding: '4px 2px 0', borderTop: '1px solid #DFE5E1', marginTop: 2 }}>
                Fades out gently — never a hard stop.
              </span>
            </div>
          )}
        </div>

        {externalUrl && <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: '#51444E',
            textDecoration: 'none',
            padding: '6px 10px',
            minHeight: 44,
          }}
        >
          <ExternalLink size={14} aria-hidden="true" />
          Open episode
        </a>}
      </div>

      {['loading','buffering'].includes(playbackStatus) && <p role="status" style={{textAlign:'center',fontSize:15}}>{playbackStatus === 'buffering' ? 'Buffering…' : 'Starting…'}</p>}
      {progressError && <p role="status" style={{textAlign:'center',fontSize:15}}>{progressError} <button type="button" style={{minHeight:44}} onClick={progressError.includes('load') ? ()=>player.play(ep) : retryProgress}>{progressError.includes('load') ? 'Retry saved place' : 'Retry sync'}</button></p>}
      {error && (
        <p
          role="alert"
          style={{
            fontSize: 14,
            color: '#BC2E27',
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
  color: '#7A1A12',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ctrlLabel = {
  position: 'absolute',
  top: -6,
  right: -2,
  fontSize: 12,
  fontWeight: 700,
  background: '#E8EEE9',
  color: '#51444E',
  padding: '1px 4px',
  borderRadius: 4,
  pointerEvents: 'none',
};

const pillButton = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  borderRadius: 9999,
  background: '#FFFFFF',
  color: '#51444E',
  border: '1px solid #DFE5E1',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  minHeight: 44,
};

const activePill = {
  background: '#51444E',
  color: '#FFFFFF',
};

const menuItem = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  background: 'transparent',
  border: 'none',
  textAlign: 'left',
  fontSize: 13,
  fontWeight: 500,
  color: '#51444E',
  cursor: 'pointer',
  borderRadius: 12,
  minHeight: 44,
};

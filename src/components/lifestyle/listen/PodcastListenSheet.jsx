import { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import {
  derivePodcastLinks,
  setPreferredPodcastApp,
} from '@/utils/podcastLinks';

// Per spec §1.4 — three-button slide-up sheet (centred modal on desktop) for
// choosing where to open a podcast. Brand-coloured pills; localStorage choice
// persistence is handled in setPreferredPodcastApp.
//
// Brand rule: Lucide icons only (no emoji codepoints). All three buttons use
// the same ExternalLink glyph; brand-coloured pills + bold label do the
// differentiation. This avoids platform-specific SVG glyphs we'd have to
// licence + keeps the visual language consistent with the rest of FemWell.

const APP_CONFIGS = [
  {
    key: 'spotify',
    label: 'Spotify',
    subtitle: 'Open in the Spotify app',
    bg: '#1DB954',
    fg: '#ffffff',
  },
  {
    key: 'apple',
    label: 'Apple Podcasts',
    subtitle: 'Open in Apple Podcasts',
    bg: '#832BC1',
    fg: '#ffffff',
  },
  {
    key: 'pocketCasts',
    label: 'Pocket Casts',
    subtitle: 'Open in Pocket Casts',
    bg: '#F43E37',
    fg: '#ffffff',
  },
];

export default function PodcastListenSheet({ item, source, onClose }) {
  const sheetRef = useRef(null);
  const previousFocusRef = useRef(null);

  const links = derivePodcastLinks({
    feedUrl: item?.feed_url || source?.feed_url || '',
    applePodcastsCollectionId:
      item?.apple_collection_id || source?.apple_collection_id || '',
  });

  // Focus management: remember whoever was focused before, focus the close
  // button on open, restore previous focus on close.
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const sheet = sheetRef.current;
    if (sheet) {
      const closeBtn = sheet.querySelector('[data-podcast-sheet-close]');
      if (closeBtn) closeBtn.focus();
    }
    return () => {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  // Escape closes; Tab traps focus inside the dialog.
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusables = sheet.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handlePick = (appKey) => {
    const primaryUrl = links[appKey];
    if (!primaryUrl) return;
    setPreferredPodcastApp(appKey);
    // For pocketCasts native scheme we still try window.open; if pktc:// isn't
    // registered on the user's device, browser will silently fail. Web
    // fallback (pocketCastsWeb) is exposed as a secondary affordance below.
    window.open(primaryUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(20,16,32,0.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      className="podcast-sheet-backdrop"
    >
      <style>{`
        @media (min-width: 768px) {
          .podcast-sheet-backdrop {
            align-items: center !important;
          }
          .podcast-sheet-panel {
            border-radius: 16px !important;
            max-width: 480px;
            width: calc(100% - 32px);
            max-height: 80vh;
          }
        }
      `}</style>
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Choose where to listen"
        className="podcast-sheet-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          background: 'var(--cream, #f7f0e6)',
          borderRadius: '20px 20px 0 0',
          padding: '20px 20px 32px',
          boxShadow: '0 -10px 30px rgba(43,30,22,0.18)',
        }}
      >
        {/* Drag handle (visual only on mobile bottom-sheet) */}
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 9999,
              backgroundColor: 'var(--ink-line, #d8cfc4)',
            }}
          />
        </div>

        {/* Close button */}
        <button
          data-podcast-sheet-close
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 9999,
            background: 'rgba(0,0,0,0.06)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 16, paddingRight: 32 }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--plum-mute, #8a7768)',
              margin: 0,
              marginBottom: 4,
            }}
          >
            Listen in your app
          </p>
          <h3
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 20,
              fontWeight: 500,
              color: 'var(--plum-deep, #2b1e16)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {item?.title || 'This episode'}
          </h3>
        </div>

        {/* Three buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {APP_CONFIGS.map((cfg) => {
            const url = links[cfg.key];
            const disabled = !url;
            return (
              <button
                key={cfg.key}
                type="button"
                onClick={() => handlePick(cfg.key)}
                disabled={disabled}
                aria-label={`${cfg.label} — ${cfg.subtitle}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: 'none',
                  background: disabled ? 'var(--ink-line, #d8cfc4)' : cfg.bg,
                  color: disabled ? 'var(--plum-mute, #8a7768)' : cfg.fg,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  fontFamily: "'Inter', sans-serif",
                  minHeight: 56,
                  opacity: disabled ? 0.6 : 1,
                  transition: 'transform 0.1s, filter 0.1s',
                }}
                onMouseDown={(e) => {
                  if (!disabled) e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <ExternalLink size={20} aria-hidden="true" strokeWidth={2} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>
                    {cfg.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 400,
                      opacity: 0.85,
                      marginTop: 2,
                    }}
                  >
                    {disabled ? 'Not available for this show' : cfg.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pocket Casts web fallback hint — only when the native scheme button
            would silently fail because the user's device lacks the PC app.
            We can't detect installation; surface the web fallback as a tiny
            secondary link. */}
        {links.pocketCastsWeb && (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              color: 'var(--plum-mute, #8a7768)',
              textAlign: 'center',
              margin: '14px 0 0',
            }}
          >
            No Pocket Casts app installed?{' '}
            <a
              href={links.pocketCastsWeb}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--rose-primary, #D45E52)', textDecoration: 'underline' }}
            >
              Open in browser
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ExternalLink, Headphones } from 'lucide-react';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';
import { getCategoryGradient, attachFallbackOverlay } from '@/utils/imageFallback';
import PodcastListenSheet from './PodcastListenSheet';

function ListenIndicator() {
  // Halli 2026-05-18: podcasts are external-link-only. The hover state on the
  // card art now reads "Listen in your app" with a headphones glyph so the
  // affordance is clear before the listen sheet opens.
  return (
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '8px 14px',
      borderRadius: 9999,
      background: 'rgba(20,16,32,0.55)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      pointerEvents: 'none',
      color: 'var(--cream)',
      fontFamily: "'Inter', sans-serif",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}>
      <Headphones size={14} strokeWidth={2} />
      Listen in your app
    </div>
  );
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function PodcastCard({ item, saved, hasPhaseTag, onSave, onUntag }) {
  const isPractice = item.media_type === 'PRACTICE';
  const pillKind = isPractice ? 'PRACTICE' : 'PODCAST';
  const pillFallback = isPractice ? 'CLIP' : 'EPISODE';
  const articleLabel = isPractice ? 'Practice' : 'Podcast';

  const [sheetOpen, setSheetOpen] = useState(false);

  // Halli 2026-05-18 — podcasts are external-link-only.
  //
  // The in-app PodcastPlayerProvider stays mounted (it still owns the
  // singleton <audio> for any guided practices or meditations we host),
  // but PodcastCard no longer routes to it. Every podcast card tap opens
  // the PodcastListenSheet so the user picks their own app — Spotify,
  // Apple Podcasts, Pocket Casts, or the show page. This fixes the
  // navigation-pause issue (audio could cut when leaving Lifestyle) and
  // matches Halli's preference: podcasts belong in podcast apps, not
  // inside FemWell's player.
  //
  // Practice rows (legacy code path — feature removed from Listen) keep
  // the direct content_url window.open behaviour for safety.
  const handleClick = () => {
    if (isPractice) {
      if (item.content_url) {
        window.open(item.content_url, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    setSheetOpen(true);
  };

  const handleOpenInApp = (e) => {
    e.stopPropagation();
    setSheetOpen(true);
  };

  // Only podcasts get the listen sheet + change-app affordance. Practice
  // rows (legacy code path) fall through to the standard window.open.
  const showListenSheet = !isPractice;

  return (
    <>
    <div
      role="article"
      aria-label={`${articleLabel}: ${item.title || ''}`}
      style={{
        borderRadius: 14,
        boxShadow: 'var(--shadow-card)',
        background: 'var(--cream)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      {/* 4:3 image area with blurred backdrop */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
        {/* Blurred backdrop */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: item.image_url ? `url(${item.image_url})` : undefined,
          background: item.image_url ? undefined : getCategoryGradient(item.category),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px) brightness(0.85)',
          transform: 'scale(1.1)',
        }} />

        {/* Square cover centered */}
        {item.image_url && (
          <img
            src={item.image_url}
            alt=""
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              height: '100%', aspectRatio: '1/1',
              objectFit: 'cover',
            }}
            onError={e => attachFallbackOverlay(e, item.category)}
          />
        )}

        {/* Top-left meta pill */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.6px',
          color: 'var(--cream)', background: 'rgba(0,0,0,0.35)',
          padding: '4px 10px', borderRadius: 9999,
          fontFamily: "'Inter', sans-serif",
          pointerEvents: 'none',
        }}>
          {`${pillKind}${item.duration_label ? ' · ' + item.duration_label : ' · ' + pillFallback}`}
        </div>

        {/* Top-right: Save heart */}
        <div
          style={{ position: 'absolute', top: 6, right: 6 }}
          onClick={e => e.stopPropagation()}
        >
          <SaveHeartButton
            itemId={item.id}
            size={34}
            iconSize={18}
            saved={saved}
            hasPhaseTag={hasPhaseTag}
            onSave={onSave}
            onUntag={onUntag}
          />
        </div>

        {/* Listen-in-app indicator (replaces the old in-app Play icon) */}
        <ListenIndicator />
      </div>

      {/* Body */}
      <div style={{ padding: 16, position: 'relative' }}>
        <h3 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 20, fontWeight: 400,
          color: 'var(--plum-deep)',
          lineHeight: 1.3,
          margin: '0 0 6px',
          paddingRight: showListenSheet ? 28 : 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {item.title}
        </h3>
        <p style={{
          fontSize: 12, fontWeight: 500,
          color: 'var(--plum-mute)',
          fontFamily: "'Inter', sans-serif",
          margin: 0,
        }}>
          {[item.source_name, formatRelativeDate(item.published_at)].filter(Boolean).join(' · ')}
        </p>

        {/* "Open in your app" affordance — top-right of body. Always
            opens the Phase 1 listen sheet for Spotify / Apple / Pocket
            Casts. In Phase 2, primary tap plays in-app; this is the
            secondary CTA per spec §2.5. B2 (MP-B) bumps the tap target to
            ≥40×40 (WCAG) and broadens the aria-label so screen readers
            announce the three destinations. The visible glyph stays at
            16px — the larger hit area is invisible and centred on the
            icon via padding. */}
        {showListenSheet && (
          <button
            type="button"
            onClick={handleOpenInApp}
            aria-label="Open in your app — Spotify, Apple Podcasts, Pocket Casts"
            title="Open in your podcast app"
            style={{
              position: 'absolute',
              top: 4,
              right: 2,
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--plum-mute, #8a7768)',
            }}
          >
            <ExternalLink size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
    {sheetOpen && (
      <PodcastListenSheet
        item={item}
        source={null}
        onClose={() => setSheetOpen(false)}
      />
    )}
    </>
  );
}
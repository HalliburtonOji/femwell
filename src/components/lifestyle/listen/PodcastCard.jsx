import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';
import { getCategoryGradient, attachFallbackOverlay } from '@/utils/imageFallback';
import { usePodcastPlayer } from '@/hooks/usePodcastPlayer';
import PodcastListenSheet from './PodcastListenSheet';
import { T } from '@/components/journal/Editorial';
import { CardFrame } from '@/components/brand/flora';
import { fmtDuration } from '@/utils/duration';

function PlayIndicator() {
  return (
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 56, height: 56,
      borderRadius: '50%',
      background: 'rgba(20,16,32,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <Play
        size={24}
        strokeWidth={1.5}
        fill="var(--cream)"
        color="var(--cream)"
        style={{ marginLeft: 2 }}
      />
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
  const player = usePodcastPlayer();

  // Phase 2 tap behaviour (spec §2.5):
  //   - Primary tap on card body → play episode in-app via PodcastPlayer.
  //     Mini-player appears at bottom of viewport, ExpandedPlayer one
  //     more tap away.
  //   - Falls back to opening the link-out sheet if (a) the audio_url is
  //     missing or (b) the PodcastPlayerProvider isn't mounted (e.g.
  //     rendered outside Layout).
  //   - Bottom-right ExternalLink "↗" button always opens the link-out
  //     sheet — the Phase 1 link-out flow is now a secondary affordance.
  // Practice rows fall through to the legacy content_url path. The
  // PRACTICE feature was removed from Listen in Cowork's 8fa3e6f, so this
  // branch is effectively dead in main but kept for safety.
  const handleClick = () => {
    if (isPractice) {
      if (item.content_url) {
        window.open(item.content_url, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    if (player && item.audio_url) {
      player.play(item);
      return;
    }
    // No in-app player available → graceful fallback to link-out sheet.
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
        // lush botanical card frame (BRAND_IDENTITY §4.2/§6.1) — gold-led.
        background: `linear-gradient(165deg, ${T.paperHi} 0%, ${T.gold}14 100%)`,
        border: `1px solid ${T.paperDeep}`,
        borderLeft: `4px solid ${T.gold}`,
        boxShadow: '0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={handleClick}
    >
      <CardFrame variant="sprig" color={T.gold} size={44} opacity={0.55} />
      <div style={{ position: 'relative', zIndex: 1 }}>
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
          fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.6px',
          color: 'var(--cream)', background: 'rgba(0,0,0,0.35)',
          padding: '4px 10px', borderRadius: 9999,
          pointerEvents: 'none',
        }}>
          {`${pillKind}${fmtDuration(item) ? ' · ' + fmtDuration(item) : ' · ' + pillFallback}`}
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

        {/* Play indicator */}
        <PlayIndicator />
      </div>

      {/* Body */}
      <div style={{ padding: 16, position: 'relative' }}>
        <h3 style={{
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
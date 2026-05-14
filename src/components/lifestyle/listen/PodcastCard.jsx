import { useState } from 'react';
import { Play, MoreHorizontal } from 'lucide-react';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';
import { getCategoryGradient, attachFallbackOverlay } from '@/utils/imageFallback';
import {
  derivePodcastLinks,
  getPreferredPodcastApp,
} from '@/utils/podcastLinks';
import PodcastListenSheet from './PodcastListenSheet';

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

  // Phase 1 podcast tap behaviour (spec §1.5):
  //   - First tap (no localStorage preference): open the listen sheet.
  //   - Subsequent tap with preference set: deep-link straight to the
  //     preferred app, bypass the sheet.
  //   - Bottom-right "..." affordance always opens the sheet so the user
  //     can change which app they prefer.
  // Practice rail rows fall through to the legacy content_url path (the
  // PRACTICE feature was removed from Listen in Cowork's 8fa3e6f, so this
  // branch is dead in main but kept for symmetry — PodcastCard is only
  // mounted from the Podcasts shelf today).
  const handleClick = () => {
    if (isPractice) {
      if (item.content_url) {
        window.open(item.content_url, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    const preferred = getPreferredPodcastApp();
    if (preferred) {
      const links = derivePodcastLinks({
        feedUrl: item?.feed_url || '',
        applePodcastsCollectionId: item?.apple_collection_id || '',
      });
      const url = links[preferred];
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      // Preferred app not available for this show — fall through to sheet
      // so the user can pick an alternative.
    }
    setSheetOpen(true);
  };

  const handleChangeApp = (e) => {
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

        {/* Play indicator */}
        <PlayIndicator />
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

        {/* Change-app affordance — small horizontal-dots icon top-right of
            body. Always opens the sheet (lets the user override the saved
            preference). Stops propagation so card-click doesn't fire too. */}
        {showListenSheet && (
          <button
            type="button"
            onClick={handleChangeApp}
            aria-label="Choose which app to open in"
            style={{
              position: 'absolute',
              top: 12,
              right: 10,
              width: 28,
              height: 28,
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
            <MoreHorizontal size={18} aria-hidden="true" />
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
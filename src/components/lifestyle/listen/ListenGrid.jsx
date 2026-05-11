import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PodcastCard from './PodcastCard';
import SessionCard from './SessionCard';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';
import { getCategoryGradient, attachFallbackOverlay } from '@/utils/imageFallback';

// Shared play indicator — used by inline video card
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

const EMPTY_STATES = {
  all:      { title: 'Nothing to play just yet',   body: 'New audio and video lands here weekly. Pop back soon.' },
  videos:   { title: 'No videos here yet',          body: 'Short reels and longer pieces will arrive in this lane.' },
  podcasts: { title: 'No podcasts here yet',        body: 'We add a few episodes a week. They\'ll appear here.' },
  sessions: { title: 'No sessions here yet',        body: 'Meditations and breathwork will appear here as we add them.' },
};

const fallbackGradient = 'linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)';

function VideoCard({ item, saved, hasPhaseTag, onSave, onUntag }) {
  const navigate = useNavigate();
  const handleClick = () => {
    // Route to LifestyleDetail so the YouTube iframe embeds in-app
    // (LifestyleDetail embeds for VIDEO items — no more bouncing users to youtube.com).
    // Use react-router so the browser back stack is preserved.
    if (item.id) {
      navigate(createPageUrl(`LifestyleDetail?id=${item.id}`));
    } else if (item.content_url) {
      window.open(item.content_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      role="article"
      aria-label={`Video: ${item.title || ''}`}
      style={{
        borderRadius: 14,
        boxShadow: 'var(--shadow-card)',
        background: 'var(--cream)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      {/* 4:3 image area */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: getCategoryGradient(item.category) }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => attachFallbackOverlay(e, item.category)}
          />
        ) : (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 12, textAlign: 'center',
              fontFamily: "'Fraunces', serif",
              fontStyle: 'italic', fontWeight: 400, fontSize: 18,
              color: 'var(--cream)', opacity: 0.7,
              pointerEvents: 'none',
            }}
          >
            {item.category || 'More like this'}
          </span>
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
          {`VIDEO${item.duration_label ? ' · ' + item.duration_label : ''}`}
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

        <PlayIndicator />
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        <h3 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 20, fontWeight: 400,
          color: 'var(--plum-deep)',
          lineHeight: 1.3,
          margin: '0 0 6px',
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
          {[item.channel_name, formatRelativeDate(item.published_at)].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--cream-2)' }}>
      <style>{`
        @keyframes lg-sheen { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @media (prefers-reduced-motion: reduce) { .lg-skeleton { animation: none !important; } }
      `}</style>
      <div
        className="lg-skeleton"
        style={{
          aspectRatio: '4/3',
          background: 'linear-gradient(90deg, var(--cream-2) 25%, var(--ivory-dark) 50%, var(--cream-2) 75%)',
          backgroundSize: '200% 100%',
          animation: 'lg-sheen 1.4s ease-in-out infinite',
        }}
      />
      <div style={{ padding: 16 }}>
        <div className="lg-skeleton" style={{ height: 18, borderRadius: 6, marginBottom: 8, background: 'linear-gradient(90deg, var(--cream-2) 25%, var(--ivory-dark) 50%, var(--cream-2) 75%)', backgroundSize: '200% 100%', animation: 'lg-sheen 1.4s ease-in-out infinite' }} />
        <div className="lg-skeleton" style={{ height: 12, width: '60%', borderRadius: 6, background: 'linear-gradient(90deg, var(--cream-2) 25%, var(--ivory-dark) 50%, var(--cream-2) 75%)', backgroundSize: '200% 100%', animation: 'lg-sheen 1.4s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

export default function ListenGrid({ items, activeChip, onSave, onUntag, savedSet, savedPhases, loading, error, onRetry }) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gap: 12,
  };

  if (loading) {
    return (
      <>
        <style>{`
          @media (min-width: 768px) { .lg-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; } }
          @media (min-width: 1024px) { .lg-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 20px !important; } }
        `}</style>
        <div className="lg-grid" style={gridStyle}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ fontSize: 14, color: 'var(--plum-mute)', fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>
          Couldn't load.
        </p>
        <button
          onClick={onRetry}
          style={{ fontSize: 14, color: 'var(--rose-primary)', fontFamily: "'Inter', sans-serif", background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    const empty = EMPTY_STATES[activeChip] || EMPTY_STATES.all;
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, color: 'var(--plum-deep)', marginBottom: 8 }}>
          {empty.title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--plum-mute)', fontFamily: "'Inter', sans-serif", margin: 0 }}>
          {empty.body}
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (min-width: 768px) { .lg-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; } }
        @media (min-width: 1024px) { .lg-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 20px !important; } }
      `}</style>
      <div className="lg-grid" style={gridStyle}>
        {items.map(item => {
          if (item._isSession || (!item.media_type && item.content_type)) {
            return (
              <SessionCard
                key={item.id}
                item={item}
                saved={savedSet?.has(item.id)}
                onSave={onSave}
              />
            );
          }
          if (item.media_type === 'PODCAST') {
            return (
              <PodcastCard
                key={item.id}
                item={item}
                saved={savedSet?.has(item.id)}
                hasPhaseTag={!!(savedPhases?.[item.id])}
                onSave={onSave}
                onUntag={onUntag}
              />
            );
          }
          // VIDEO (default for media items)
          return (
            <VideoCard
              key={item.id}
              item={item}
              saved={savedSet?.has(item.id)}
              hasPhaseTag={!!(savedPhases?.[item.id])}
              onSave={onSave}
              onUntag={onUntag}
            />
          );
        })}
      </div>
    </>
  );
}
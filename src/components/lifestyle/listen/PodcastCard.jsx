import { Play } from 'lucide-react';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';

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
  const handleClick = () => {
    if (item.content_url) {
      window.open(item.content_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      role="article"
      aria-label={`Podcast: ${item.title || ''}`}
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
          background: item.image_url ? undefined : 'linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)',
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
            onError={e => { e.target.style.display = 'none'; }}
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
          {`PODCAST${item.duration_label ? ' · ' + item.duration_label : ' · EPISODE'}`}
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
          {[item.source_name, formatRelativeDate(item.published_at)].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  );
}
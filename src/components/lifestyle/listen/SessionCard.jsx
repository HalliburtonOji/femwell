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

export default function SessionCard({ item, saved, onSave }) {
  const handleClick = () => {
    if (item.content_key) {
      window.location.href = `/ContentPlayer?key=${item.content_key}`;
    } else {
      console.warn('SessionCard: no content_key on item', item.id);
    }
  };

  const hasThumbnail = !!item.thumbnail_url;

  return (
    <div
      role="article"
      aria-label={`Session: ${item.title || ''}`}
      style={{
        borderRadius: 14,
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      {/* 4:3 area with title inside gradient */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
        {/* Background */}
        {hasThumbnail ? (
          <>
            <img
              src={item.thumbnail_url}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, var(--plum-deep) 0%, var(--rose-primary) 100%)',
              opacity: 0.4,
            }} />
          </>
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, var(--plum-deep) 0%, var(--rose-primary) 100%)',
          }} />
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
          {`SESSION${item.duration_minutes ? ' · ' + item.duration_minutes + ' MIN' : ''}`}
        </div>

        {/* Top-right: Save heart — saves immediately, no popover */}
        <div
          style={{ position: 'absolute', top: 6, right: 6 }}
          onClick={e => {
            e.stopPropagation();
            onSave?.({ id: item.id, phase: null, isSession: true });
          }}
        >
          <button
            type="button"
            aria-label={saved ? 'Saved' : 'Save session'}
            style={{
              width: 34, height: 34, minWidth: 44, minHeight: 44,
              padding: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 9999,
              background: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={saved ? 'var(--rose-primary)' : 'var(--plum-mute)'}
              strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
              style={{ fill: saved ? 'var(--rose-primary)' : 'none' }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Play indicator */}
        <PlayIndicator />

        {/* Title inside gradient — bottom left */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: 16,
          background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)',
        }}>
          <h3 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 20, fontWeight: 400, fontStyle: 'italic',
            color: 'var(--cream)',
            lineHeight: 1.3,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {item.title}
          </h3>
        </div>
      </div>

      {/* 12px rhythm pad below */}
      <div style={{ height: 12, background: 'var(--cream)' }} />
    </div>
  );
}
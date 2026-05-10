import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';

export default function TikTokRail({ items, savedSet, savedPhases, onSave, onUntag }) {
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    if (!openItem) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpenItem(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openItem]);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Eyebrow */}
      <p style={{
        padding: '0 16px',
        marginBottom: 10,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        color: 'var(--plum-mute)',
        fontFamily: "'Inter', sans-serif",
      }}>
        TRENDING ON TIKTOK
      </p>

      {/* Rail */}
      <div
        className="lf-scroll"
        style={{
          display: 'flex',
          gap: 12,
          padding: '0 16px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map(item => (
          <TikTokCard
            key={item.id}
            item={item}
            saved={savedSet?.has(item.id)}
            hasPhaseTag={!!(savedPhases?.[item.id])}
            onOpen={() => setOpenItem(item)}
            onSave={onSave}
            onUntag={onUntag}
          />
        ))}
      </div>

      {/* Modal */}
      {openItem && (
        <TikTokModal item={openItem} onClose={() => setOpenItem(null)} />
      )}
    </div>
  );
}

function TikTokCard({ item, saved, hasPhaseTag, onOpen, onSave, onUntag }) {
  const fallbackBg = 'linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)';

  return (
    <div
      role="article"
      aria-label={`TikTok: ${item.title || item.author_name || ''}`}
      onClick={onOpen}
      style={{
        flexShrink: 0,
        width: 168,
        height: 299,
        borderRadius: 14,
        boxShadow: 'var(--shadow-card)',
        background: 'var(--cream)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        scrollSnapAlign: 'start',
      }}
    >
      {/* Thumbnail */}
      {item.image_url ? (
        <img
          src={item.image_url}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: fallbackBg }} />
      )}

      {/* Top-left: TIKTOK pill */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
        color: 'var(--cream)', background: 'rgba(0,0,0,0.45)',
        padding: '3px 6px', borderRadius: 4,
        fontFamily: "'Inter', sans-serif",
        pointerEvents: 'none',
      }}>
        TIKTOK
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

      {/* Bottom gradient + author */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
        padding: '24px 10px 10px',
      }}>
        <p style={{
          fontSize: 12, fontWeight: 500, color: 'var(--cream)',
          fontFamily: "'Inter', sans-serif",
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          margin: 0,
        }}>
          {item.author_name ? `@${item.author_name}` : item.channel_name || ''}
        </p>
      </div>
    </div>
  );
}

function TikTokModal({ item, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="TikTok video"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(20,16,32,0.78)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        position: 'relative', width: '100%', maxWidth: 360,
        background: 'var(--cream)', borderRadius: 14, overflow: 'hidden',
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 8, right: 8, zIndex: 10,
            width: 32, height: 32, borderRadius: 9999,
            background: 'rgba(0,0,0,0.4)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={20} color="white" />
        </button>
        <blockquote
          className="tiktok-embed"
          cite={item.content_url}
          data-video-id={item.video_id}
          style={{ margin: 0 }}
        >
          <a href={item.content_url}>{item.title || `@${item.author_name}`}</a>
        </blockquote>
        <script async src="https://www.tiktok.com/embed.js" />
      </div>
    </div>
  );
}
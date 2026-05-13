import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ExternalLink } from 'lucide-react';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';

function getCategoryGradient(category) {
  const map = {
    'Relationships': 'linear-gradient(135deg, #f7e0e8 0%, #edd5e0 100%)',
    'Mental Wellness': 'linear-gradient(135deg, #e0e8f7 0%, #d5dded 100%)',
    'Culture': 'linear-gradient(135deg, #f7f0e0 0%, #ede5d5 100%)',
    'Mindfulness': 'linear-gradient(135deg, #e0f7ee 0%, #d5ede4 100%)',
    'Lifestyle': 'linear-gradient(135deg, #f7e8e0 0%, #edddd5 100%)',
  };
  return map[category] || 'linear-gradient(135deg, #f3ede6 0%, #e8e0d8 100%)';
}

function formatDuration(sec) {
  if (!sec || sec <= 0) return '';
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}h` : `${h}h ${r}m`;
}

function PracticeCard({ item, saved, hasPhaseTag, onOpen, onSave, onUntag }) {
  const fallbackBg = getCategoryGradient(item.category);
  const durLabel = item.duration_label || formatDuration(item.duration_seconds);
  return (
    <div
      role="article"
      aria-label={`Practice: ${item.title || ''}`}
      onClick={onOpen}
      style={{
        flexShrink: 0,
        width: 168,
        borderRadius: 14,
        boxShadow: '0 8px 22px -12px rgba(74,42,58,0.18)',
        background: 'var(--cream, #f7f0e6)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        scrollSnapAlign: 'start',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: fallbackBg, flexShrink: 0 }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
          color: 'var(--cream, #f7f0e6)', background: 'rgba(0,0,0,0.45)',
          padding: '3px 6px', borderRadius: 4,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.4px',
        }}>
          PRACTICE
        </div>
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
        {durLabel && (
          <div style={{
            position: 'absolute', bottom: 6, right: 6,
            fontSize: 10, fontWeight: 600,
            color: 'var(--cream, #f7f0e6)', background: 'rgba(0,0,0,0.55)',
            padding: '3px 7px', borderRadius: 9999,
            fontFamily: "'Inter', sans-serif",
          }}>
            {durLabel}
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{
          fontSize: 12.5, fontWeight: 500, color: 'var(--plum-deep, #2b1e16)',
          fontFamily: "'Inter', sans-serif",
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.35,
        }}>
          {item.title || ''}
        </p>
        <p style={{
          fontSize: 10.5, color: 'var(--plum-mute, #8a7768)',
          fontFamily: "'Inter', sans-serif",
          margin: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.source_name || 'FemWell Practice'}
        </p>
      </div>
    </div>
  );
}

function PracticeSheet({ item, onClose }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); }
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); }
    else { a.pause(); setPlaying(false); }
  };

  const durLabel = item.duration_label || formatDuration(item.duration_seconds);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title || 'Practice'}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(20,16,32,0.78)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div style={{
        position: 'relative', width: '100%', maxWidth: 560,
        background: 'var(--cream, #f7f0e6)', borderRadius: '14px 14px 0 0',
        padding: '20px 20px 36px',
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: 9999,
            background: 'rgba(0,0,0,0.08)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {item.image_url && (
            <img
              src={item.image_url}
              alt=""
              style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.6px', color: 'var(--plum-mute, #8a7768)', margin: 0,
            }}>
              {[item.source_name || 'FemWell Practice', durLabel].filter(Boolean).join(' · ')}
            </p>
            <h3 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 18, fontWeight: 500, color: 'var(--plum-deep, #2b1e16)',
              margin: '4px 0 0', lineHeight: 1.3,
            }}>
              {item.title || ''}
            </h3>
          </div>
        </div>
        {item.summary && (
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13.5, lineHeight: 1.55, color: 'var(--plum-mute, #8a7768)',
            margin: '0 0 14px',
            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {item.summary}
          </p>
        )}
        {item.audio_url ? (
          <>
            <button
              type="button"
              onClick={toggle}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', minHeight: 48, borderRadius: 9999,
                background: 'var(--rose-primary, #D45E52)', color: 'white',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
              }}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
              <span>{playing ? 'Pause' : 'Begin practice'}</span>
            </button>
            {/* eslint-disable-next-line */}
            <audio ref={audioRef} src={item.audio_url} style={{ width: '100%', marginTop: 12 }} controls />
          </>
        ) : item.episode_url ? (
          <a
            href={item.episode_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', minHeight: 48, borderRadius: 9999,
              background: 'var(--rose-primary, #D45E52)', color: 'white',
              textDecoration: 'none',
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
            }}
          >
            <ExternalLink size={18} />
            <span>Open practice</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function PracticeRail({ items, savedSet, savedPhases, onSave, onUntag }) {
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
      <p style={{
        padding: '0 16px',
        marginBottom: 10,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        color: 'var(--plum-mute, #8a7768)',
        fontFamily: "'Inter', sans-serif",
        margin: '0 0 10px',
      }}>
        PRACTICE FOR TODAY
      </p>

      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '4px 16px 8px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map(item => (
          <PracticeCard
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

      {openItem && (
        <PracticeSheet item={openItem} onClose={() => setOpenItem(null)} />
      )}
    </div>
  );
}

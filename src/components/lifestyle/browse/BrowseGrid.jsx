import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { createPageUrl } from '@/utils';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';
import PhasePill from '@/components/lifestyle/foryou/PhasePill';
import { getCategoryGradient, attachFallbackOverlay } from '@/utils/imageFallback';

const FALLBACK_GRADIENT = 'linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)';

const EMPTY_STATES = {
  all:      { title: 'Nothing here yet',        body: 'Fresh pieces land each week — check back.' },
  articles: { title: 'No articles here yet',    body: 'Articles will appear here as we publish them.' },
  fiction:  { title: 'No fiction here yet',     body: 'New fiction lands weekly.' },
  stories:  { title: 'No stories here yet',     body: 'Stories appear here as creators share them.' },
  guides:   { title: 'No guides here yet',      body: 'Guides cover the basics — they\'ll appear here as we add them.' },
};

function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 14,
      overflow: 'hidden',
      background: 'var(--cream-2)',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ height: 180, background: 'var(--cream-2)', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes bg-sheen {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @media (prefers-reduced-motion: reduce) {
            .bg-sheen-bar { animation: none !important; }
          }
        `}</style>
        <div className="bg-sheen-bar" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          animation: 'bg-sheen 1.4s ease-in-out infinite',
        }} />
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ height: 14, borderRadius: 6, background: 'var(--border)', marginBottom: 8, width: '80%' }} />
        <div style={{ height: 12, borderRadius: 6, background: 'var(--border)', width: '55%' }} />
      </div>
    </div>
  );
}

export default function BrowseGrid({
  items, loading, error, onRetry,
  activeChip, searchQuery,
  savedSet, savedPhases, onHeartClick, onUntag, currentPhase,
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}
        className="bg-grid-responsive">
        <style>{`
          .bg-grid-responsive { grid-template-columns: 1fr; }
          @media (min-width: 768px) { .bg-grid-responsive { grid-template-columns: 1fr 1fr; gap: 16px; } }
          @media (min-width: 1024px) { .bg-grid-responsive { grid-template-columns: repeat(3, 1fr); gap: 20px; } }
        `}</style>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'var(--plum-mute)', marginBottom: 12 }}>
          Couldn't load.
        </p>
        <button
          type="button"
          onClick={onRetry}
          style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'var(--rose-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Retry
        </button>
      </div>
    );
  }

  const q = (searchQuery || '').trim().toLowerCase();
  const filtered = q
    ? items.filter(it =>
        (it.title || '').toLowerCase().includes(q) ||
        (it.summary || '').toLowerCase().includes(q) ||
        (Array.isArray(it.tags) ? it.tags.join(' ').toLowerCase() : '').includes(q)
      )
    : items;

  if (items.length > 0 && filtered.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 24px' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'var(--plum-mute)', marginBottom: 10 }}>
          Nothing here matches '{searchQuery}'.
        </p>
        <button
          type="button"
          onClick={() => onRetry('clearSearch')}
          style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'var(--rose-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Clear search
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    const es = EMPTY_STATES[activeChip] || EMPTY_STATES.all;
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, color: 'var(--plum-deep)', marginBottom: 10 }}>
          {es.title}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'var(--plum-mute)' }}>
          {es.body}
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .bg-grid-responsive { grid-template-columns: 1fr; }
        @media (min-width: 768px) { .bg-grid-responsive { grid-template-columns: 1fr 1fr; gap: 16px !important; } }
        @media (min-width: 1024px) { .bg-grid-responsive { grid-template-columns: repeat(3, 1fr); gap: 20px !important; } }
        @media (prefers-reduced-motion: no-preference) {
          .bg-card-item:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover) !important; }
        }
        .bg-card-item { transition: transform 220ms ease-out, box-shadow 220ms ease-out; }
      `}</style>
      <div className="bg-grid-responsive" style={{ display: 'grid', gap: 12 }}>
        {filtered.map((item) => {
          const isSaved = savedSet?.has(item.id);
          const hasPhaseTag = !!(savedPhases?.[item.id]);
          const phaseMatch = !!(currentPhase && Array.isArray(item.phase_tags) && item.phase_tags.includes(currentPhase));
          const byline = [item.source_name, item.published_at ? formatRelativeDate(item.published_at) : null].filter(Boolean).join(' · ');

          return (
            <div
              key={item.id}
              role="article"
              aria-label={`${item.content_type || 'Item'}: ${item.title}`}
              className="bg-card-item"
              onClick={() => navigate(createPageUrl(`LifestyleDetail?id=${item.id}`))}
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                background: 'var(--cream)',
                boxShadow: 'var(--shadow-card)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* Image */}
              <div style={{
                height: 180,
                background: item.image_gradient || getCategoryGradient(item.category),
                position: 'relative',
                overflow: 'hidden',
              }}>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => attachFallbackOverlay(e, item.category)}
                  />
                )}
                {/* Category pill top-left */}
                {item.category && (
                  <span style={{
                    position: 'absolute', top: 10, left: 10,
                    padding: '4px 10px', borderRadius: 9999,
                    background: 'rgba(0,0,0,0.35)', color: 'var(--cream)',
                    fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {item.category}
                  </span>
                )}
                {/* Phase pill */}
                {phaseMatch && (
                  <div style={{ position: 'absolute', top: item.category ? 38 : 10, left: 10 }}>
                    <PhasePill phase={currentPhase} />
                  </div>
                )}
                {/* Save heart top-right */}
                <div style={{ position: 'absolute', top: 8, right: 8 }} onClick={(e) => e.stopPropagation()}>
                  <SaveHeartButton
                    itemId={item.id}
                    saved={isSaved}
                    hasPhaseTag={hasPhaseTag}
                    onSave={onHeartClick}
                    onUnsave={onHeartClick}
                    onUntag={onUntag}
                  />
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: 16 }}>
                <p style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 20,
                  fontWeight: 400,
                  color: 'var(--plum-deep)',
                  margin: 0,
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {item.title}
                </p>
                {item.summary && (
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 400,
                    color: 'var(--plum-accent)',
                    marginTop: 6,
                    marginBottom: 0,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.summary}
                  </p>
                )}
                {byline && (
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--plum-mute)',
                    marginTop: 8,
                    marginBottom: 0,
                  }}>
                    {byline}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
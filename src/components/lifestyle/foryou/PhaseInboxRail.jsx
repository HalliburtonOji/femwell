import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const FALLBACK_GRADIENT = 'linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--cream-2) 100%)';

const COPY = {
  menstrual: {
    title: 'Held for the slow days',
    sub: "Pieces we set aside for when you'd want quiet.",
    empty: "Nothing held back yet — we'll save quieter pieces as they come in.",
  },
  follicular: {
    title: "For while you're rising",
    sub: "What's been waiting for the curious days.",
    empty: "Nothing waiting yet — the rising-day shelf fills as new pieces land.",
  },
  ovulatory: {
    title: 'For the bright stretch',
    sub: 'Saved for the days you feel most outward.',
    empty: "Nothing on the bright shelf yet — we'll queue items as they come in.",
  },
  luteal: {
    title: 'For the soften phase',
    sub: 'What we held back for when the body asks for less.',
    empty: "Nothing held yet — the luteal shelf fills as new pieces land.",
  },
};

const VALID_PHASES = ['menstrual', 'follicular', 'ovulatory', 'luteal'];

export default function PhaseInboxRail({ items, currentPhase }) {
  const navigate = useNavigate();

  if (!currentPhase || !VALID_PHASES.includes(currentPhase)) return null;

  const copy = COPY[currentPhase];

  const phaseItems = (items || []).filter(it =>
    it?.status === 'PUBLISHED' &&
    Array.isArray(it?.phase_tags) &&
    it.phase_tags.includes(currentPhase)
  ).slice(0, 8);

  return (
    <section style={{ marginTop: 20 }} aria-label="Phase inbox">
      <div style={{ padding: '0 16px', marginBottom: 10 }}>
        <h3 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 22,
          fontWeight: 500,
          fontStyle: 'normal',
          color: 'var(--plum-deep)',
          margin: '0 0 4px 0',
          lineHeight: 1.2,
        }}>
          {copy.title}
        </h3>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          fontWeight: 400,
          color: 'var(--mauve)',
          margin: 0,
        }}>
          {copy.sub}
        </p>
      </div>

      {phaseItems.length === 0 ? (
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: 'var(--mauve)',
          padding: '0 16px',
          margin: 0,
        }}>
          {copy.empty}
        </p>
      ) : (
        <div
          className="fy-scroll"
          style={{
            display: 'flex',
            gap: 12,
            padding: '0 16px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
          }}
        >
          {phaseItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(createPageUrl(`LifestyleDetail?id=${item.id}`))}
              style={{
                flexShrink: 0,
                width: 140,
                height: 180,
                scrollSnapAlign: 'start',
                position: 'relative',
                borderRadius: 14,
                overflow: 'hidden',
                background: 'var(--cream)',
                boxShadow: 'var(--shadow-card)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                height: 110,
                width: '100%',
                background: item.image_gradient || FALLBACK_GRADIENT,
              }}>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt=""
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
              <div style={{ padding: '8px 10px' }}>
                <p style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 13,
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
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
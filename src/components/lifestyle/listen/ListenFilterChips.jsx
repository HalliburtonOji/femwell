import { useRef } from 'react';

const CHIPS = [
  { id: 'all',      label: 'All' },
  { id: 'videos',   label: 'Videos' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'sessions', label: 'Sessions' },
];

export default function ListenFilterChips({ activeChip, onChange }) {
  const containerRef = useRef(null);

  const handleClick = (chipId) => {
    onChange(chipId);
    // Scroll active chip to viewport center
    if (containerRef.current) {
      const btn = containerRef.current.querySelector(`[data-chip="${chipId}"]`);
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Listen content filters"
      style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 6,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      className="lf-scroll"
    >
      {CHIPS.map(chip => (
        <button
          key={chip.id}
          data-chip={chip.id}
          onClick={() => handleClick(chip.id)}
          aria-pressed={chip.id === activeChip}
          style={{
            flexShrink: 0,
            padding: '8px 16px',
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: activeChip === chip.id ? 600 : 500,
            cursor: 'pointer',
            border: 'none',
            fontFamily: "'Inter', sans-serif",
            whiteSpace: 'nowrap',
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: activeChip === chip.id ? 'var(--rose-primary)' : 'var(--cream)',
            color: activeChip === chip.id ? 'white' : 'var(--plum-deep)',
            transition: 'all 0.15s',
          }}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
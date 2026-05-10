import { useRef } from 'react';

const CHIPS = [
  { id: 'all',      label: 'All' },
  { id: 'articles', label: 'Articles' },
  { id: 'fiction',  label: 'Fiction' },
  { id: 'stories',  label: 'Stories' },
  { id: 'books',    label: 'Books' },
  { id: 'guides',   label: 'Guides' },
];

export default function BrowseFilterChips({ activeChip, onChange }) {
  const scrollRef = useRef(null);

  const handleChip = (id) => {
    onChange(id);
    // Scroll active chip into center
    const container = scrollRef.current;
    if (!container) return;
    const btn = container.querySelector(`[data-chip="${id}"]`);
    if (btn) {
      const containerMid = container.offsetWidth / 2;
      const btnMid = btn.offsetLeft + btn.offsetWidth / 2;
      container.scrollTo({ left: btnMid - containerMid, behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={scrollRef}
      role="group"
      aria-label="Browse content filters"
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '8px 0',
        scrollSnapType: 'x mandatory',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      <style>{`.bf-chips::-webkit-scrollbar{display:none}`}</style>
      {CHIPS.map((chip) => {
        const active = chip.id === activeChip;
        return (
          <button
            key={chip.id}
            data-chip={chip.id}
            type="button"
            aria-pressed={active}
            onClick={() => handleChip(chip.id)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              minHeight: 44,
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              scrollSnapAlign: 'start',
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              transition: 'background 180ms ease-out, color 180ms ease-out',
              backgroundColor: active ? 'var(--rose-primary)' : 'var(--cream-2)',
              color: active ? 'var(--cream)' : 'var(--plum-deep)',
              border: active ? 'none' : '1px solid var(--ink-line)',
            }}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
import { useRef, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

export default function BrowseSearch({ value, onChange }) {
  const [local, setLocal] = useState(value || '');
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocal(value || '');
  }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setLocal(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(v), 200);
  };

  const handleClear = () => {
    setLocal('');
    clearTimeout(debounceRef.current);
    onChange('');
  };

  return (
    <div style={{ marginTop: 10, marginBottom: 4 }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 400,
        marginLeft: 'auto',
      }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--plum-mute)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          role="searchbox"
          aria-label="Search Lifestyle content"
          value={local}
          onChange={handleChange}
          placeholder="Look for something in particular"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 38px 10px 36px',
            backgroundColor: 'var(--cream-2)',
            border: '1px solid var(--ink-line)',
            borderRadius: 12,
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: 'var(--plum-deep)',
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--rose-primary)'; e.target.style.boxShadow = '0 0 0 2px var(--rose-soft-bg)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--ink-line)'; e.target.style.boxShadow = 'none'; }}
        />
        {local && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--plum-mute)',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
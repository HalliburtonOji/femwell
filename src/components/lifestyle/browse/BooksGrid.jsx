import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';

const FALLBACK_GRADIENT = 'linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--gold) 100%)';

export function bookSaveId(book) {
  if (book._kind === 'femwell') return `book:femwell:${book._itemId}`;
  if (book._kind === 'gutenberg') return `book:gutenberg:${book._gutenbergId}`;
  return `book:unknown:${(book.title || '').slice(0, 60)}`;
}

function clampStyle(lines) {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };
}

function BookCardShell({ children, onClick, ariaLabel }) {
  return (
    <div
      role="article"
      aria-label={ariaLabel}
      className="book-card-item"
      onClick={onClick}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--cream)',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
}

function FemwellBookCard({ book, isSaved, onHeartClick, onOpen }) {
  const saveId = bookSaveId(book);
  return (
    <BookCardShell
      ariaLabel={`FemWell story: ${book.title}`}
      onClick={() => onOpen(book)}
    >
      <div style={{
        paddingTop: '133.33%',
        position: 'relative',
        background: FALLBACK_GRADIENT,
        overflow: 'hidden',
      }}>
        {book.cover_url && (
          <img
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%', objectFit: 'cover',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            top: 8, left: 8,
            padding: '4px 8px',
            borderRadius: 9999,
            background: 'var(--rose-primary)',
            color: 'var(--cream)',
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          FemWell Original
        </div>
        <div
          style={{ position: 'absolute', top: 8, right: 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <SaveHeartButton
            itemId={saveId}
            saved={isSaved}
            hasPhaseTag={false}
            aria-label={`Save story: ${book.title}`}
            onSave={({ id }) => onHeartClick({ id, phase: null, isBook: true })}
            onUnsave={({ id }) => onHeartClick({ id, phase: null, isBook: true })}
            onUntag={() => {}}
          />
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <p style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 17, fontWeight: 500,
          color: 'var(--plum-deep)',
          margin: 0, lineHeight: 1.3,
          ...clampStyle(2),
        }}>
          {book.title}
        </p>
        {book.lede && (
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13, fontWeight: 400,
            color: 'var(--plum-mute)',
            marginTop: 8, marginBottom: 0,
            lineHeight: 1.5,
            ...clampStyle(3),
          }}>
            {book.lede}
          </p>
        )}
      </div>
    </BookCardShell>
  );
}

function GutenbergBookCard({ book, isSaved, onHeartClick }) {
  const saveId = bookSaveId(book);
  const handleTap = () => {
    if (!book.reader_url) return;
    window.open(book.reader_url, '_blank', 'noopener,noreferrer');
  };
  return (
    <BookCardShell
      ariaLabel={`Public-domain book: ${book.title} by ${book.author}`}
      onClick={handleTap}
    >
      <div style={{
        paddingTop: '133.33%',
        position: 'relative',
        background: FALLBACK_GRADIENT,
        overflow: 'hidden',
      }}>
        {book.cover_url && (
          <img
            src={book.cover_url}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%', objectFit: 'cover',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div
          style={{ position: 'absolute', top: 8, right: 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <SaveHeartButton
            itemId={saveId}
            saved={isSaved}
            hasPhaseTag={false}
            aria-label={`Save book: ${book.title}`}
            onSave={({ id }) => onHeartClick({ id, phase: null, isBook: true })}
            onUnsave={({ id }) => onHeartClick({ id, phase: null, isBook: true })}
            onUntag={() => {}}
          />
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <p style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 17, fontWeight: 500,
          color: 'var(--plum-deep)',
          margin: 0, lineHeight: 1.3,
          ...clampStyle(2),
        }}>
          {book.title}
        </p>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12, fontWeight: 500,
          color: 'var(--plum-mute)',
          marginTop: 6, marginBottom: 0,
        }}>
          {book.author} &middot; Public domain
        </p>
      </div>
    </BookCardShell>
  );
}

export default function BooksGrid({ books, loading, savedSet, onHeartClick }) {
  const navigate = useNavigate();

  const openFemwell = (book) => {
    if (!book?._itemId) return;
    navigate(createPageUrl(`LifestyleDetail?id=${book._itemId}`));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'var(--plum-mute)' }}>
          Loading books&hellip;
        </p>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, color: 'var(--plum-deep)', marginBottom: 10 }}>
          No books here yet
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'var(--plum-mute)' }}>
          FemWell originals + free public-domain books from Project Gutenberg.
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .books-grid-responsive { grid-template-columns: 1fr; }
        @media (min-width: 768px) { .books-grid-responsive { grid-template-columns: 1fr 1fr; gap: 16px !important; } }
        @media (min-width: 1024px) { .books-grid-responsive { grid-template-columns: repeat(3, 1fr); gap: 20px !important; } }
        @media (prefers-reduced-motion: no-preference) {
          .book-card-item:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover) !important; }
        }
        .book-card-item { transition: transform 220ms ease-out, box-shadow 220ms ease-out; }
      `}</style>
      <div className="books-grid-responsive" style={{ display: 'grid', gap: 12 }}>
        {books.map((book) => {
          const saveId = bookSaveId(book);
          const isSaved = savedSet?.has(saveId);
          if (book._kind === 'femwell') {
            return (
              <FemwellBookCard
                key={saveId}
                book={book}
                isSaved={isSaved}
                onHeartClick={onHeartClick}
                onOpen={openFemwell}
              />
            );
          }
          return (
            <GutenbergBookCard
              key={saveId}
              book={book}
              isSaved={isSaved}
              onHeartClick={onHeartClick}
            />
          );
        })}
      </div>
    </>
  );
}

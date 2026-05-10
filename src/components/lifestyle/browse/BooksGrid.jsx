import { format, parseISO } from 'date-fns';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';

const FALLBACK_GRADIENT = 'linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--gold) 100%)';

export function bookSaveId(book) {
  if (book.isbn) return `book:${book._pickId}:${book.isbn}`;
  return `book:${book._pickId}:${(book.title || '').slice(0, 60)}`;
}

function formatWeekStart(dateStr) {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'd MMM');
  } catch {
    return dateStr;
  }
}

export default function BooksGrid({ books, savedSet, onHeartClick }) {
  if (!books || books.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, color: 'var(--plum-deep)', marginBottom: 10 }}>
          No book picks here yet
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: 'var(--plum-mute)' }}>
          We curate one a week — fresh books land Sundays.
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
        {books.map((book, idx) => {
          const saveId = bookSaveId(book);
          const isSaved = savedSet?.has(saveId);

          // Books-1: Goodreads links retired (reviews-with-zero-reviews experience).
          // Tap now opens Bookshop.org UK — UK indie bookshop network, on-brand for FemWell.
          // Prefer ISBN deep-link; fall back to keyword search by title + author.
          const handleTap = () => {
            const isbn = (book.isbn || '').replace(/[^0-9X]/gi, '');
            const url = isbn
              ? `https://uk.bookshop.org/books?keywords=${encodeURIComponent(isbn)}`
              : `https://uk.bookshop.org/books?keywords=${encodeURIComponent(`${book.title || ''} ${book.author || ''}`.trim())}`;
            window.open(url, '_blank', 'noopener,noreferrer');
          };

          const meta = [
            book.isbn ? `ISBN ${book.isbn}` : null,
            book.read_time_mins ? `${book.read_time_mins} min read` : null,
          ].filter(Boolean).join(' · ');

          return (
            <div
              key={`${book._pickId}-${idx}`}
              role="article"
              aria-label={`Book: ${book.title} by ${book.author}`}
              className="book-card-item"
              onClick={handleTap}
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                background: 'var(--cream)',
                boxShadow: 'var(--shadow-card)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* Portrait 3:4 cover */}
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
                {/* Save heart top-right */}
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

              {/* Body */}
              <div style={{ padding: 16 }}>
                {book._weekStart && (
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--plum-mute)', marginBottom: 6, marginTop: 0,
                  }}>
                    WEEK OF {formatWeekStart(book._weekStart)}
                  </p>
                )}
                <p style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 20, fontWeight: 400,
                  color: 'var(--plum-deep)',
                  margin: 0, lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {book.title}
                </p>
                {book.author && (
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13, fontWeight: 500,
                    color: 'var(--plum-accent)',
                    marginTop: 6, marginBottom: 0,
                  }}>
                    by {book.author}
                  </p>
                )}
                {meta && (
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12, fontWeight: 500,
                    color: 'var(--plum-mute)',
                    marginTop: 8, marginBottom: 0,
                  }}>
                    {meta}
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
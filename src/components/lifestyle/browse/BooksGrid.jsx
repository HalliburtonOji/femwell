import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SaveHeartButton from '@/components/lifestyle/foryou/SaveHeartButton';
import { getBookCover } from '@/utils/bookCover';
// Brand-P2 font fix: card is a <button>; pin §1 SERIF on title/summary (else system sans).
import { SERIF } from '@/components/journal/Editorial';

const FALLBACK_GRADIENT = 'linear-gradient(135deg, var(--rose-soft-bg) 0%, var(--gold) 100%)';

// Render a deterministic gradient + serif initial when image_url is missing.
// Cover renders independent of book kind so FemWell originals and Gutenberg
// picks share the same visual language when no real cover image is available.
function BookCoverArt({ title, kindLabel }) {
  const { gradient, accent, initial } = getBookCover(title);
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Big translucent serif initial */}
      <span
        style={{
          fontWeight: 300,
          fontSize: 'clamp(120px, 32vw, 200px)',
          lineHeight: 1,
          color: accent,
          letterSpacing: '-0.05em',
          userSelect: 'none',
          textShadow: '0 4px 20px rgba(0,0,0,0.10)',
        }}
      >
        {initial}
      </span>
      {/* Title overlay at bottom */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 16,
        textAlign: 'center',
      }}>
        <p style={{
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(15px, 3.4vw, 18px)',
          lineHeight: 1.2,
          color: 'rgba(255,250,242,0.92)',
          margin: 0,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          textShadow: '0 1px 2px rgba(0,0,0,0.20)',
        }}>
          {title}
        </p>
        {kindLabel && (
          <p style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,250,242,0.78)',
            margin: '6px 0 0',
          }}>
            {kindLabel}
          </p>
        )}
      </div>
    </div>
  );
}

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
        {/* Generated cover art is always rendered as a base layer; if the
            record has an image_url we overlay it on top. Means we never see
            a flat panel while the image loads. */}
        <BookCoverArt title={book.title} kindLabel="FemWell Original" />
        {book.cover_url && (
          <img
            src={book.cover_url}
            alt=""
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
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            zIndex: 2,
          }}
        >
          FemWell Original
        </div>
        <div
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
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
          fontFamily: SERIF,
          fontSize: 18, fontWeight: 600,
          color: 'var(--plum-deep)',
          margin: 0, lineHeight: 1.3,
          ...clampStyle(2),
        }}>
          {book.title}
        </p>
        {/* Card synopsis: short summary (1-2 sentences). Never show the
            chapter prose here — that's what the reader is for. */}
        {book.summary && (
          <p style={{
            fontFamily: SERIF,
            fontSize: 14, fontWeight: 500,
            color: 'var(--plum-mute)',
            marginTop: 8, marginBottom: 0,
            lineHeight: 1.5,
            ...clampStyle(3),
          }}>
            {book.summary}
          </p>
        )}
        {/* Genre / theme tags + chapter count */}
        {(Array.isArray(book.tags) && book.tags.length > 0) || book.chapterCount ? (
          <div style={{
            marginTop: 10,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            alignItems: 'center',
          }}>
            {(book.tags || []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'var(--plum-mute)',
                  background: 'var(--rose-soft-bg, rgba(212,94,82,0.10))',
                  padding: '3px 8px',
                  borderRadius: 9999,
                }}
              >
                {tag}
              </span>
            ))}
            {book.chapterCount > 1 && (
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'var(--plum-mute)',
                marginLeft: 'auto',
              }}>
                {book.chapterCount} chapter{book.chapterCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </BookCardShell>
  );
}

function GutenbergBookCard({ book, isSaved, onHeartClick, onOpen }) {
  const saveId = bookSaveId(book);
  const handleTap = () => {
    if (book._gutenbergId && onOpen) {
      onOpen(book);
      return;
    }
    // Fallback to Gutenberg's HTML reader if we somehow don't have an id.
    if (book.reader_url) window.open(book.reader_url, '_blank', 'noopener,noreferrer');
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
        <BookCoverArt title={book.title} kindLabel="Public Domain" />
        {book.cover_url && (
          <img
            src={book.cover_url}
            alt=""
            loading="lazy"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%', objectFit: 'cover',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
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
          fontFamily: SERIF,
          fontSize: 18, fontWeight: 600,
          color: 'var(--plum-deep)',
          margin: 0, lineHeight: 1.3,
          ...clampStyle(2),
        }}>
          {book.title}
        </p>
        <p style={{
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

  // FemWell-generated fiction goes through the dedicated FictionReader Kindle
  // surface (drop cap, page flip, gradient cover), not the article reader.
  const openFemwell = (book) => {
    if (!book?._itemId) return;
    navigate(createPageUrl(`FictionReader?id=${book._itemId}`));
  };

  // Open Gutenberg books inside the FemWell BookReader (Kindle UI) instead of
  // bouncing the user to gutenberg.org. Falls back to the external HTML
  // reader if no _gutenbergId is present.
  const openGutenberg = (book) => {
    if (!book?._gutenbergId) {
      if (book?.reader_url) window.open(book.reader_url, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(createPageUrl(`BookReader?gutenberg_id=${book._gutenbergId}`));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontSize: 13, color: 'var(--plum-mute)' }}>
          Loading books&hellip;
        </p>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ fontSize: 22, fontWeight: 400, color: 'var(--plum-deep)', marginBottom: 10 }}>
          No books here yet
        </p>
        <p style={{ fontSize: 14, color: 'var(--plum-mute)' }}>
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
              onOpen={openGutenberg}
            />
          );
        })}
      </div>
    </>
  );
}
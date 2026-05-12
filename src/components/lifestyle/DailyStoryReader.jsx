import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// DailyStoryReader — Kindle-flip reader for Lifestyle → Daily Story tab.
// Generic ReaderSource contract:
//   { kind: 'daily_story' | 'book' | 'article', items: ChapterLike[], currentIndex: number }
// ChapterLike = { id, day_number?, title?, heading?, body, cliffhanger? }
// ─────────────────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// Parse `## Chapter N — Title` from segment_text
function parseChapter(segment_text) {
  if (!segment_text) return { heading: "", body: "" };
  const lines = String(segment_text).split("\n");
  const firstNonEmpty = lines.findIndex((l) => l.trim().length > 0);
  if (firstNonEmpty < 0) return { heading: "", body: "" };
  const first = lines[firstNonEmpty];
  const headMatch = first.match(/^#{1,3}\s+(.+)$/);
  if (headMatch) {
    const heading = headMatch[1].trim();
    const body = lines.slice(firstNonEmpty + 1).join("\n").trim();
    return { heading, body };
  }
  return { heading: "", body: segment_text.trim() };
}

function splitParagraphs(body) {
  if (!body) return [];
  return String(body).split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
}

function secondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight - now) / 1000));
}

function fmtCountdown(total) {
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots({ current, total }) {
  const clamp = Math.min(total, 30);
  return (
    <div className="ds-reader-dots" aria-hidden="true">
      {Array.from({ length: clamp }).map((_, i) => {
        let cls = "ds-reader-dot";
        if (i < current) cls += " ds-reader-dot-visited";
        else if (i === current) cls += " ds-reader-dot-current";
        else cls += " ds-reader-dot-future";
        return <span key={i} className={cls} />;
      })}
    </div>
  );
}

// ─── Single chapter page ──────────────────────────────────────────────────────
function ChapterPage({ chapter, dayLabel, indexHint, total, animClass }) {
  const { heading, body } = useMemo(
    () => parseChapter(chapter.body || chapter.segment_text || ""),
    [chapter]
  );
  const paragraphs = useMemo(() => splitParagraphs(body), [body]);
  const headingText =
    heading ||
    chapter.title ||
    chapter.heading ||
    (chapter.day_number ? `Chapter ${chapter.day_number}` : "");

  return (
    <div
      className={`ds-reader-page ${animClass || ""}`}
      role="article"
      aria-label={headingText}
    >
      {headingText && (
        <>
          <h1 className="ds-reader-h1">{headingText}</h1>
          <div className="ds-reader-ornament" aria-hidden="true">· · ·</div>
        </>
      )}

      <div className="ds-reader-body">
        {paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? "ds-reader-p ds-reader-p-first" : "ds-reader-p"}>
            {p}
          </p>
        ))}
      </div>

      {chapter.attribution && (
        <p className="ds-reader-attribution">{chapter.attribution}</p>
      )}

      {dayLabel && (
        <p className="ds-reader-footer-label">{dayLabel}</p>
      )}

      {typeof indexHint === "number" && typeof total === "number" && (
        <ProgressDots current={indexHint} total={total} />
      )}
    </div>
  );
}

// ─── Locked cliffhanger screen ────────────────────────────────────────────────
function LockedCliffhanger({ cliffhanger, animClass }) {
  const [count, setCount] = useState(secondsUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setCount(secondsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`ds-reader-lock ${animClass || ""}`}
      role="status"
      aria-live="polite"
    >
      <p className="ds-reader-lock-eyebrow">Next chapter</p>
      <div className="ds-reader-lock-ornament" aria-hidden="true">· · ·</div>
      <p className="ds-reader-lock-teaser">{cliffhanger}</p>
      <div className="ds-reader-lock-countdown" aria-label="Time until next chapter">
        {fmtCountdown(count)}
      </div>
      <p className="ds-reader-lock-sub">Reveals at midnight</p>
      <div className="ds-reader-lock-curl" aria-hidden="true">
        <Lock size={14} />
      </div>
    </div>
  );
}

// ─── Main reader ──────────────────────────────────────────────────────────────
export default function DailyStoryReader({
  source: providedSource,
  seriesKey = "the_long_room",
  // When the caller doesn't pass totalCount we fall back to the actual
  // number of fetched chapters below, so the page indicator stays honest
  // (no more "Chapter 5 / 30" when only 5 chapters exist).
  totalCount: totalCountProp,
}) {
  const [chapters, setChapters] = useState(providedSource?.items || []);
  const [currentIndex, setCurrentIndex] = useState(providedSource?.currentIndex ?? 0);
  const [loading, setLoading] = useState(!providedSource);
  const [error, setError] = useState(false);
  const [flipState, setFlipState] = useState({ phase: "idle", dir: 0 });
  // Books (kind='book') have all chapters unlocked — no lock screen.
  const noLock = providedSource?.kind === "book";
  const [showLocked, setShowLocked] = useState(false);
  const touchStartRef = useRef(null);
  const reducedMotion = prefersReducedMotion();

  // Fetch DailyStory rows if no external source provided
  useEffect(() => {
    if (providedSource) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const today = todayISO();
        const all = await base44.entities.DailyStory.filter(
          { series_key: seriesKey, is_active: true }
        ).catch(() => []);
        const visible = (all || [])
          .filter((r) => !r.published_date || r.published_date <= today)
          .sort((a, b) => (a.day_number || 0) - (b.day_number || 0));
        if (cancelled) return;
        if (!visible.length) {
          setError(true);
          setChapters([]);
        } else {
          setChapters(visible);
          setCurrentIndex(visible.length - 1);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [providedSource, seriesKey]);

  const latestRevealed = chapters.length - 1;

  const flipForward = useCallback(() => {
    if (showLocked) return;
    if (currentIndex >= latestRevealed) {
      if (noLock) return; // books: no lock screen, just stay on last chapter
      if (reducedMotion) {
        setShowLocked(true);
      } else {
        setFlipState({ phase: "flipping", dir: 1 });
        setTimeout(() => {
          setShowLocked(true);
          setFlipState({ phase: "idle", dir: 0 });
        }, 600);
      }
      return;
    }
    if (reducedMotion) {
      setCurrentIndex((i) => Math.min(i + 1, latestRevealed));
    } else {
      setFlipState({ phase: "flipping", dir: 1 });
      setTimeout(() => {
        setCurrentIndex((i) => Math.min(i + 1, latestRevealed));
        setFlipState({ phase: "idle", dir: 0 });
      }, 600);
    }
  }, [currentIndex, latestRevealed, reducedMotion, showLocked]);

  const flipBackward = useCallback(() => {
    if (showLocked) {
      if (reducedMotion) {
        setShowLocked(false);
      } else {
        setFlipState({ phase: "flipping", dir: -1 });
        setTimeout(() => {
          setShowLocked(false);
          setFlipState({ phase: "idle", dir: 0 });
        }, 600);
      }
      return;
    }
    if (currentIndex <= 0) return;
    if (reducedMotion) {
      setCurrentIndex((i) => Math.max(i - 1, 0));
    } else {
      setFlipState({ phase: "flipping", dir: -1 });
      setTimeout(() => {
        setCurrentIndex((i) => Math.max(i - 1, 0));
        setFlipState({ phase: "idle", dir: 0 });
      }, 600);
    }
  }, [currentIndex, reducedMotion, showLocked]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); flipForward(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); flipBackward(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipForward, flipBackward]);

  // Touch swipe
  const onTouchStart = (e) => {
    if (!e.touches || !e.touches[0]) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    const start = touchStartRef.current;
    if (!start) return;
    const end = (e.changedTouches && e.changedTouches[0]) || null;
    if (!end) return;
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) flipForward(); else flipBackward();
    }
    touchStartRef.current = null;
  };

  if (loading) {
    return (
      <div className="ds-reader-loading">
        <div className="ds-reader-spinner" aria-label="Loading chapter" />
        <p className="ds-reader-loading-text">Loading the chapter…</p>
      </div>
    );
  }

  if (error || !chapters.length) {
    return (
      <div className="ds-reader-empty">
        The story is being written. Check back soon.
      </div>
    );
  }

  const currentChapter = chapters[currentIndex];
  const latestChapter = chapters[latestRevealed];
  const cliffhanger = latestChapter?.cliffhanger || "The next page hasn't been written yet.";
  // Prefer the series title carried on the record; only fall back to a
  // generic "Daily Story" label so empty data doesn't surface a raw key.
  const seriesTitle = currentChapter?.series_title || "Daily Story";
  // Honour the caller's totalCount if given, otherwise use the fetched
  // chapter count. Avoids the "Chapter 5 / 30" bug when fewer than 30
  // chapters are revealed yet.
  const totalCount = totalCountProp ?? chapters.length;

  const animClass =
    flipState.phase === "flipping"
      ? flipState.dir > 0
        ? "is-flipping-fwd"
        : "is-flipping-back"
      : "";

  const displayIndex = showLocked ? chapters.length : currentIndex;
  const chapterLabel = showLocked
    ? "Locked"
    : noLock
    ? `Chapter ${currentIndex + 1} / ${chapters.length}`
    : `Chapter ${currentChapter.day_number || currentIndex + 1} / ${totalCount}`;

  return (
    <div
      className="ds-reader-root"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ReaderStyles reducedMotion={reducedMotion} />

      {/* Series label */}
      <p className="ds-reader-series-label">{seriesTitle}</p>

      {/* Tap zones — invisible halves */}
      <div
        className="ds-reader-tap-left"
        onClick={flipBackward}
        aria-label="Previous chapter"
        role="button"
        tabIndex={-1}
      />
      <div
        className="ds-reader-tap-right"
        onClick={flipForward}
        aria-label="Next chapter"
        role="button"
        tabIndex={-1}
      />

      {/* 3D stage */}
      <div className="ds-reader-stage">
        {showLocked ? (
          <LockedCliffhanger cliffhanger={cliffhanger} animClass={animClass} />
        ) : (
          <ChapterPage
            chapter={currentChapter}
            dayLabel={null}
            indexHint={currentIndex}
            total={totalCount}
            animClass={animClass}
          />
        )}
      </div>

      {/* Visible nav row */}
      <div className="ds-reader-nav">
        <button
          className="ds-reader-nav-btn"
          onClick={flipBackward}
          disabled={!showLocked && currentIndex <= 0}
          aria-label="Previous chapter"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="ds-reader-chapter-label">{chapterLabel}</span>
        <button
          className="ds-reader-nav-btn"
          onClick={flipForward}
          disabled={showLocked}
          aria-label="Next chapter"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoped styles — respects prefers-reduced-motion
// ─────────────────────────────────────────────────────────────────────────────
function ReaderStyles({ reducedMotion }) {
  const flipAnim = reducedMotion
    ? `
      .is-flipping-fwd  { animation: ds-fade 0.2s ease; }
      .is-flipping-back { animation: ds-fade 0.2s ease; }
      @keyframes ds-fade { from { opacity: 0.3; } to { opacity: 1; } }
    `
    : `
      .is-flipping-fwd  { animation: ds-flip-fwd  0.6s cubic-bezier(0.4,0,0.2,1) both; }
      .is-flipping-back { animation: ds-flip-back 0.6s cubic-bezier(0.4,0,0.2,1) both; }
      @keyframes ds-flip-fwd  {
        0%   { transform: perspective(900px) rotateY(0deg);    opacity: 1; }
        49%  { transform: perspective(900px) rotateY(-90deg);  opacity: 0; }
        50%  { transform: perspective(900px) rotateY(90deg);   opacity: 0; }
        100% { transform: perspective(900px) rotateY(0deg);    opacity: 1; }
      }
      @keyframes ds-flip-back {
        0%   { transform: perspective(900px) rotateY(0deg);   opacity: 1; }
        49%  { transform: perspective(900px) rotateY(90deg);  opacity: 0; }
        50%  { transform: perspective(900px) rotateY(-90deg); opacity: 0; }
        100% { transform: perspective(900px) rotateY(0deg);   opacity: 1; }
      }
    `;

  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400&display=swap');

      .ds-reader-root {
        position: relative;
        max-width: 640px;
        margin: 0 auto;
        padding: 0 0 32px;
        font-family: 'Inter', sans-serif;
        user-select: none;
      }

      .ds-reader-series-label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--mauve);
        text-align: center;
        margin: 0 0 16px;
        font-family: 'Inter', sans-serif;
      }

      /* Invisible tap zones */
      .ds-reader-tap-left,
      .ds-reader-tap-right {
        position: absolute;
        top: 36px;
        bottom: 60px;
        width: 45%;
        z-index: 10;
        cursor: pointer;
      }
      .ds-reader-tap-left  { left: 0; }
      .ds-reader-tap-right { right: 0; }

      /* Book stage */
      .ds-reader-stage {
        background: var(--surface, #fff);
        border: 1px solid var(--border, #EDE8E4);
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(42,32,53,0.10), 0 2px 8px rgba(42,32,53,0.06);
        min-height: 520px;
        padding: 40px 32px 32px;
        position: relative;
        transform-style: preserve-3d;
        overflow: hidden;
      }

      @media (max-width: 480px) {
        .ds-reader-stage { padding: 28px 20px 24px; min-height: 460px; }
      }

      /* Chapter page */
      .ds-reader-page {
        height: 100%;
      }

      .ds-reader-h1 {
        font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
        font-size: clamp(18px, 4vw, 22px);
        font-weight: 500;
        color: var(--plum-deep, #2b1e16);
        letter-spacing: -0.01em;
        line-height: 1.3;
        margin: 0 0 10px;
        text-align: center;
      }

      .ds-reader-ornament {
        text-align: center;
        color: var(--rose-primary, #D45E52);
        font-size: 14px;
        letter-spacing: 0.3em;
        margin: 0 0 24px;
        user-select: none;
      }

      /* Body */
      .ds-reader-body {
        max-height: 380px;
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .ds-reader-body::-webkit-scrollbar { display: none; }

      .ds-reader-p {
        font-family: 'Fraunces', Georgia, serif;
        font-size: clamp(15px, 2.5vw, 17px);
        color: var(--plum, #2A2035);
        line-height: 1.78;
        margin: 0 0 18px;
      }

      /* Drop cap on first paragraph */
      .ds-reader-p-first::first-letter {
        font-family: 'Fraunces', Georgia, serif;
        font-size: 4.2em;
        font-weight: 400;
        line-height: 0.78;
        float: left;
        margin: 6px 8px -2px 0;
        color: var(--rose-primary, #D45E52);
      }

      .ds-reader-attribution {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        color: var(--mauve, #8A7E88);
        font-style: italic;
        text-align: right;
        margin-top: 8px;
      }

      .ds-reader-footer-label {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        color: var(--mauve, #8A7E88);
        text-align: center;
        margin-top: 16px;
      }

      /* Progress dots */
      .ds-reader-dots {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin-top: 20px;
        flex-wrap: wrap;
      }
      .ds-reader-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .ds-reader-dot-visited { background: var(--rose-soft, #d4a5a0); }
      .ds-reader-dot-current { background: var(--rose-primary, #D45E52); width: 10px; border-radius: 3px; }
      .ds-reader-dot-future  { background: var(--border, #EDE8E4); }

      /* Locked screen */
      .ds-reader-lock {
        min-height: 460px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: linear-gradient(160deg, #2A2035 0%, #1a1224 100%);
        border-radius: 18px;
        padding: 40px 28px;
        position: relative;
        overflow: hidden;
      }

      .ds-reader-lock-eyebrow {
        font-family: 'Inter', sans-serif;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: rgba(247,240,230,0.55);
        margin: 0 0 12px;
      }

      .ds-reader-lock-ornament {
        color: var(--rose-primary, #D45E52);
        font-size: 14px;
        letter-spacing: 0.3em;
        margin: 0 0 20px;
      }

      .ds-reader-lock-teaser {
        font-family: 'Fraunces', Georgia, serif;
        font-size: clamp(15px, 3vw, 18px);
        font-style: italic;
        font-weight: 400;
        color: rgba(247,240,230,0.88);
        line-height: 1.7;
        max-width: 420px;
        margin: 0 0 32px;
      }

      .ds-reader-lock-countdown {
        font-family: 'Inter', sans-serif;
        font-size: clamp(26px, 7vw, 38px);
        font-weight: 700;
        color: var(--cream, #f7f0e6);
        letter-spacing: 0.06em;
        margin-bottom: 10px;
        font-variant-numeric: tabular-nums;
      }

      .ds-reader-lock-sub {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        color: rgba(247,240,230,0.5);
        margin: 0;
      }

      /* Page-curl hint at bottom-right */
      .ds-reader-lock-curl {
        position: absolute;
        bottom: 14px;
        right: 16px;
        color: rgba(247,240,230,0.3);
      }

      /* Nav row */
      .ds-reader-nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-top: 18px;
      }

      .ds-reader-nav-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid var(--border, #EDE8E4);
        background: var(--surface, #fff);
        color: var(--plum, #2A2035);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }
      .ds-reader-nav-btn:disabled {
        opacity: 0.3;
        cursor: default;
      }
      .ds-reader-nav-btn:not(:disabled):hover {
        background: var(--ivory-dark, #F3EFE9);
      }

      .ds-reader-chapter-label {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 600;
        color: var(--mauve, #8A7E88);
        min-width: 120px;
        text-align: center;
      }

      /* Loading */
      .ds-reader-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 24px;
        gap: 14px;
      }
      .ds-reader-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--rose-soft-bg, #FBE9E6);
        border-top-color: var(--rose-primary, #D45E52);
        border-radius: 50%;
        animation: ds-spin 0.7s linear infinite;
      }
      @keyframes ds-spin { to { transform: rotate(360deg); } }
      .ds-reader-loading-text {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: var(--mauve, #8A7E88);
      }

      .ds-reader-empty {
        text-align: center;
        padding: 60px 24px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: var(--mauve, #8A7E88);
      }

      ${flipAnim}
    `}</style>
  );
}
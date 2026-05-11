import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

// ─────────────────────────────────────────────────────────────────────────────
// DailyStoryReader — Kindle-flip book reader for the Daily Story tab.
//
// Generic `ReaderSource` contract:
//   { kind: 'daily_story' | 'book' | 'article',
//     items: ChapterLike[],
//     currentIndex: number }
//
// ChapterLike = { id, day_number?, title?, heading?, body, cliffhanger? }
//
// For now this component owns the data fetch for `daily_story` (the most
// common path: Lifestyle → Daily Story tab). For `book` / `article` callers
// pass in a `source` prop with a pre-built items array.
// ─────────────────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// Parse `## Chapter N — Title` from segment_text. Returns { heading, body }.
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

// Split body into paragraphs preserving blank-line separation.
function splitParagraphs(body) {
  if (!body) return [];
  return String(body).split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
}

// HH:MM:SS until next midnight (local time).
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

// ─────────────────────────────────────────────────────────────────────────────
// Page (a single revealed chapter)
// ─────────────────────────────────────────────────────────────────────────────
function ChapterPage({ chapter, dayLabel, indexHint, total, animClass }) {
  const { heading, body } = useMemo(() => parseChapter(chapter.body || chapter.segment_text || ""), [chapter]);
  const paragraphs = useMemo(() => splitParagraphs(body), [body]);

  const headingText = heading || chapter.title || chapter.heading || (dayLabel ? `Chapter ${chapter.day_number || ""}` : "");

  return (
    <div className={`ds-reader-page ${animClass || ""}`} role="article" aria-label={headingText}>
      {/* Chapter heading */}
      {headingText && (
        <>
          <h1 className="ds-reader-h1">{headingText}</h1>
          <div className="ds-reader-ornament" aria-hidden="true">· · ·</div>
        </>
      )}

      {/* Body — first paragraph gets drop cap */}
      <div className="ds-reader-body">
        {paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? "ds-reader-p ds-reader-p-first" : "ds-reader-p"}>
            {p}
          </p>
        ))}
      </div>

      {/* Attribution slot (used by BookReader; harmless when empty) */}
      {chapter.attribution && (
        <p className="ds-reader-attribution">{chapter.attribution}</p>
      )}

      {/* Footer */}
      {dayLabel && (
        <p className="ds-reader-footer-label">
          {dayLabel}
        </p>
      )}
      {typeof indexHint === "number" && typeof total === "number" && (
        <ProgressDots current={indexHint} total={total} />
      )}
    </div>
  );
}

function ProgressDots({ current, total }) {
  return (
    <div className="ds-reader-dots" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => {
        let cls = "ds-reader-dot";
        if (i < current) cls += " ds-reader-dot-visited";
        else if (i === current) cls += " ds-reader-dot-current";
        else cls += " ds-reader-dot-future";
        return <span key={i} className={cls} />;
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Locked cliffhanger screen
// ─────────────────────────────────────────────────────────────────────────────
function LockedCliffhanger({ cliffhanger, animClass }) {
  const [count, setCount] = useState(secondsUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setCount(secondsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={`ds-reader-lock ${animClass || ""}`} role="status" aria-live="polite">
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

// ─────────────────────────────────────────────────────────────────────────────
// Main reader
// ─────────────────────────────────────────────────────────────────────────────
export default function DailyStoryReader({
  source: providedSource,           // optional pre-built source
  seriesKey = "the_long_room",      // default DailyStory series
  totalCount = 30,                  // arc length for footer / progress
}) {
  const [chapters, setChapters] = useState(providedSource?.items || []);
  const [currentIndex, setCurrentIndex] = useState(providedSource?.currentIndex ?? 0);
  const [loading, setLoading] = useState(!providedSource);
  const [error, setError] = useState(false);
  const [flipState, setFlipState] = useState({ phase: "idle", dir: 0 }); // idle | flipping | locked-shake
  const [showLocked, setShowLocked] = useState(false);
  const touchStartRef = useRef(null);
  const reducedMotion = prefersReducedMotion();

  // Fetch DailyStory rows if no external source provided.
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
        // Client-side filter for published_date <= today; sort ASC by day_number.
        const visible = (all || [])
          .filter((r) => !r.published_date || r.published_date <= today)
          .sort((a, b) => (a.day_number || 0) - (b.day_number || 0));
        if (cancelled) return;
        if (!visible.length) {
          setError(true);
          setChapters([]);
        } else {
          setChapters(visible);
          // Default to latest revealed chapter
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

  // The latest revealed index (chapters is already filtered to revealed)
  const latestRevealed = chapters.length - 1;

  // Try to flip forward
  const flipForward = useCallback(() => {
    if (showLocked) return; // already on locked screen
    if (currentIndex >= latestRevealed) {
      // Show locked cliffhanger screen instead
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

  // Tap halves
  const onTapZone = (zone) => () => {
    if (zone === "left") flipBackward();
    else if (zone === "right") flipForward();
  };

  // Loading / empty
  if (loading) {
    return (
      <div className="ds-reader-shell">
        <div className="ds-reader-empty">Loading the chapter…</div>
        <ReaderStyles />
      </div>
    );
  }
  if (error || !chapters.length) {
    return (
      <div className="ds-reader-shell">
        <div className="ds-reader-empty">The story is being written. Check back soon.</div>
        <ReaderStyles />
      </div>
    );
  }

  const currentChapter = chapters[currentIndex];
  const latestChapter = chapters[latestRevealed];
  const cliffhanger = latestChapter?.cliffhanger || "The next page hasn't been written yet.";
  const seriesTitle = currentChapter?.series_title || "The Long Room";

  // animClass: when flipping, apply a 3D rotateY based on direction.
  const animClass = flipState.phase === "flipping"
    ? (flipState.dir > 0 ? "is-flipping-fwd" : "is-flipping-back")
    : "";

  return (
    <div
      className="ds-reader-shell"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Tap zones — invisible halves to flip. Live behind any clickable content. */}
      <button
        type="button"
        className="ds-reader-tap ds-reader-tap-left"
        aria-label="Previous chapter"
        onClick={onTapZone("left")}
      />
      <button
        type="button"
        className="ds-reader-tap ds-reader-tap-right"
        aria-label="Next chapter"
        onClick={onTapZone("right")}
      />

      {/* 3D stage */}
      <div className="ds-reader-stage">
        {showLocked ? (
          <LockedCliffhanger cliffhanger={cliffhanger} animClass={animClass} />
        ) : (
          <ChapterPage
            chapter={currentChapter}
            dayLabel={`Day ${currentChapter.day_number || (currentIndex + 1)} of ${totalCount} · ${seriesTitle}`}
            indexHint={currentIndex}
            total={Math.max(totalCount, chapters.length)}
            animClass={animClass}
          />
        )}
      </div>

      {/* Visible flip controls (desktop convenience, also touch fallback) */}
      <div className="ds-reader-controls" aria-hidden="false">
        <button
          type="button"
          className="ds-reader-ctrl"
          onClick={flipBackward}
          disabled={!showLocked && currentIndex === 0}
          aria-label="Previous chapter"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="ds-reader-pageno" aria-live="polite">
          {showLocked
            ? "Locked"
            : `Day ${currentChapter.day_number || (currentIndex + 1)}`}
        </span>
        <button
          type="button"
          className="ds-reader-ctrl"
          onClick={flipForward}
          aria-label="Next chapter"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <ReaderStyles />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles (scoped via class names; respects prefers-reduced-motion)
// ─────────────────────────────────────────────────────────────────────────────
function ReaderStyles() {
  return (
    <style>{`
      .ds-reader-shell {
        position: relative;
        margin: 0 auto;
        max-width: 640px;
        min-height: 640px;
        perspective: 1500px;
        border-radius: 22px;
        background: linear-gradient(180deg, #FAF4EA 0%, #F7EFE1 100%);
        box-shadow:
          0 1px 2px rgba(43,30,22,0.05),
          0 8px 22px -8px rgba(43,30,22,0.16),
          0 24px 56px -16px rgba(43,30,22,0.12);
        overflow: hidden;
        user-select: text;
      }
      /* Page-curl shadow on right edge — Kindle look */
      .ds-reader-shell::after {
        content: "";
        position: absolute;
        top: 0; right: 0; bottom: 0;
        width: 38px;
        background: linear-gradient(270deg, rgba(43,30,22,0.10), rgba(43,30,22,0) 70%);
        pointer-events: none;
        z-index: 2;
      }

      .ds-reader-stage {
        position: relative;
        transform-style: preserve-3d;
        will-change: transform;
      }

      .ds-reader-tap {
        position: absolute;
        top: 0;
        bottom: 60px;
        width: 24%;
        background: transparent;
        border: none;
        cursor: pointer;
        z-index: 3;
        padding: 0;
      }
      .ds-reader-tap-left  { left: 0; }
      .ds-reader-tap-right { right: 0; }
      .ds-reader-tap:focus-visible {
        outline: 2px solid var(--rose-primary);
        outline-offset: -8px;
      }

      .ds-reader-controls {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 22px 18px;
        background: linear-gradient(180deg, rgba(247,239,225,0) 0%, rgba(247,239,225,0.95) 60%);
        z-index: 4;
      }
      .ds-reader-ctrl {
        width: 36px; height: 36px;
        border-radius: 9999px;
        background: rgba(255,255,255,0.7);
        border: 1px solid var(--ink-line, rgba(43,30,22,0.12));
        color: var(--plum-deep, #2b1e16);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
      }
      .ds-reader-ctrl:disabled { opacity: 0.4; cursor: default; }
      .ds-reader-pageno {
        font-family: 'Fraunces', serif;
        font-style: italic;
        font-size: 13px;
        color: var(--plum-mute, #6b4a56);
      }

      /* Page */
      .ds-reader-page {
        position: relative;
        padding: 28px 32px 80px;
        min-height: 640px;
        transform-origin: left center;
        backface-visibility: hidden;
      }
      @media (min-width: 768px) {
        .ds-reader-page { padding: 48px 56px 96px; min-height: 720px; }
      }

      .ds-reader-h1 {
        font-family: 'Fraunces', serif;
        font-weight: 400;
        font-style: italic;
        font-size: 28px;
        line-height: 1.2;
        color: var(--plum-deep, #2b1e16);
        text-align: center;
        margin: 8px 0 6px;
        letter-spacing: -0.2px;
      }
      .ds-reader-ornament {
        text-align: center;
        color: var(--rose-primary, #D45E52);
        font-size: 12px;
        letter-spacing: 8px;
        margin-bottom: 22px;
      }
      .ds-reader-body { color: var(--plum-deep, #2b1e16); }
      .ds-reader-p {
        font-family: 'Fraunces', serif;
        font-size: 17px;
        line-height: 1.78;
        color: var(--plum-deep, #2b1e16);
        margin: 0 0 16px;
      }
      .ds-reader-p-first::first-letter {
        font-family: 'Fraunces', serif;
        font-weight: 500;
        font-size: 64px;
        float: left;
        line-height: 0.88;
        padding: 6px 10px 0 0;
        color: var(--rose-primary, #D45E52);
      }
      .ds-reader-attribution {
        font-family: 'Inter', sans-serif;
        font-style: italic;
        font-size: 11px;
        color: var(--plum-mute, #6b4a56);
        text-align: center;
        margin: 24px 0 8px;
        letter-spacing: 0.02em;
      }
      .ds-reader-footer-label {
        position: absolute;
        bottom: 64px; left: 0; right: 0;
        text-align: center;
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        color: var(--plum-mute, #6b4a56);
        letter-spacing: 0.08em;
        margin: 0;
      }
      .ds-reader-dots {
        position: absolute;
        bottom: 48px; left: 0; right: 0;
        display: flex; gap: 4px; justify-content: center;
      }
      .ds-reader-dot {
        width: 4px; height: 4px; border-radius: 9999px;
        background: var(--cream-2, #F0E6D0);
      }
      .ds-reader-dot-visited { background: var(--rose-primary, #D45E52); opacity: 0.5; }
      .ds-reader-dot-current { background: var(--plum-deep, #2b1e16); width: 8px; }
      .ds-reader-dot-future  { background: var(--cream-2, #F0E6D0); }

      /* Locked cliffhanger */
      .ds-reader-lock {
        position: relative;
        padding: 90px 36px 110px;
        min-height: 640px;
        background:
          radial-gradient(ellipse at top, rgba(107,74,86,0.55), rgba(43,30,22,0.95) 70%),
          linear-gradient(180deg, #2b1e16 0%, #1a1108 100%);
        color: var(--cream, #FAF8F5);
      }
      @media (min-width: 768px) { .ds-reader-lock { min-height: 720px; } }
      .ds-reader-lock-eyebrow {
        font-family: 'Fraunces', serif;
        font-style: italic;
        font-size: 13px;
        color: rgba(250,248,245,0.6);
        text-align: center;
        margin: 0 0 18px;
        letter-spacing: 0.05em;
      }
      .ds-reader-lock-ornament {
        text-align: center;
        color: var(--gold, #C8A86B);
        font-size: 10px;
        letter-spacing: 12px;
        margin: 0 0 28px;
      }
      .ds-reader-lock-teaser {
        font-family: 'Fraunces', serif;
        font-style: italic;
        font-weight: 300;
        font-size: 22px;
        line-height: 1.5;
        color: var(--cream, #FAF8F5);
        text-align: center;
        max-width: 380px;
        margin: 0 auto 40px;
        letter-spacing: 0.01em;
      }
      .ds-reader-lock-countdown {
        font-family: 'Inter', ui-monospace, monospace;
        font-variant-numeric: tabular-nums;
        font-weight: 300;
        font-size: 32px;
        color: var(--gold, #C8A86B);
        text-align: center;
        margin: 0 0 6px;
        letter-spacing: 2px;
      }
      .ds-reader-lock-sub {
        font-family: 'Fraunces', serif;
        font-style: italic;
        font-size: 13px;
        color: rgba(250,248,245,0.6);
        text-align: center;
        margin: 0;
      }
      .ds-reader-lock-curl {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(250,248,245,0.3);
      }

      .ds-reader-empty {
        padding: 60px 24px;
        text-align: center;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: var(--plum-mute, #6b4a56);
      }

      /* 3D flip animations — page-curl effect */
      @keyframes ds-flip-fwd {
        0%   { transform: rotateY(0deg); box-shadow: 0 0 0 rgba(0,0,0,0); }
        50%  { transform: rotateY(-12deg); box-shadow: -8px 0 16px rgba(43,30,22,0.18); }
        100% { transform: rotateY(0deg); box-shadow: 0 0 0 rgba(0,0,0,0); }
      }
      @keyframes ds-flip-back {
        0%   { transform: rotateY(0deg); }
        50%  { transform: rotateY(12deg); box-shadow: 8px 0 16px rgba(43,30,22,0.18); }
        100% { transform: rotateY(0deg); }
      }
      .is-flipping-fwd  { animation: ds-flip-fwd 600ms ease-in-out; transform-origin: right center; }
      .is-flipping-back { animation: ds-flip-back 600ms ease-in-out; transform-origin: left center; }

      @media (prefers-reduced-motion: reduce) {
        .is-flipping-fwd, .is-flipping-back { animation: none; }
      }
    `}</style>
  );
}

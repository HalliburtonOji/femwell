import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Lock, ArrowLeft, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

// 5 text-size levels, exported so callers can use them in shared logic.
export const TEXT_SIZES = ["xs", "s", "m", "l", "xl"];
export const TEXT_SIZE_INDEX = (s) => Math.max(0, TEXT_SIZES.indexOf(s));

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

// ─── Font-size slider control ─────────────────────────────────────────────────
// A real range slider — small "A" on the left, large "A" on the right, the
// thumb drags between five discrete positions (xs · s · m · l · xl).
function FontSliderControl({ textSize, setSize, variant }) {
  const i = TEXT_SIZE_INDEX(textSize);
  const isImm = variant === "immersive";
  const onChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    if (Number.isFinite(idx) && idx >= 0 && idx < TEXT_SIZES.length) {
      setSize(TEXT_SIZES[idx]);
    }
  };
  return (
    <div
      className={`ds-reader-slider ${isImm ? "is-immersive" : ""}`}
      role="group"
      aria-label="Text size"
    >
      <span className="ds-reader-slider-mark ds-reader-slider-mark-min" aria-hidden="true">A</span>
      <input
        type="range"
        min="0"
        max={TEXT_SIZES.length - 1}
        step="1"
        value={i}
        onChange={onChange}
        className="ds-reader-slider-input"
        aria-valuemin={0}
        aria-valuemax={TEXT_SIZES.length - 1}
        aria-valuenow={i}
        aria-valuetext={`Text size ${TEXT_SIZES[i].toUpperCase()}`}
      />
      <span className="ds-reader-slider-mark ds-reader-slider-mark-max" aria-hidden="true">A</span>
    </div>
  );
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

// ─── Single chapter page (measured pagination) ───────────────────────────────
// Each chapter receives its full body and decides at render-time how many
// pages of paragraphs fit in the available viewport — and the user can flip
// inside the chapter without ever scrolling. Re-measures when the textSize
// changes or the viewport resizes.
function ChapterPage({ chapter, dayLabel, indexHint, total, animClass, textSize, pageInChapter, onPageCount, immersive }) {
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
  const ctx = chapter.chapter_context;

  // Slice each chapter into pages that fit the visible viewport.
  // slices: [[startParaIdx, endParaIdx], ...] — end is inclusive.
  const measureRef = useRef(null);
  const [slices, setSlices] = useState(null);
  const [vpKey, setVpKey] = useState(0);

  useEffect(() => {
    const onResize = () => setVpKey(k => k + 1);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (!measureRef.current) return;
    const ps = Array.from(measureRef.current.querySelectorAll(".ds-measure-p"));
    if (!ps.length) {
      setSlices([[0, 0]]);
      onPageCount && onPageCount(chapter.id, 1);
      return;
    }
    // How much vertical room is actually available inside the stage:
    // viewport height minus the reader chrome (control bar + chapter strip +
    // heading + footer dots + stage padding). Tuned conservatively so the
    // last paragraph never gets clipped, even with the drop-cap on the first.
    const reserved = immersive ? 220 : 280;
    const minAvail = 260;
    const available = Math.max(minAvail, window.innerHeight - reserved);

    const out = [];
    let start = 0;
    let topAtStart = ps[0].offsetTop;
    for (let i = 0; i < ps.length; i++) {
      const bottom = ps[i].offsetTop + ps[i].offsetHeight;
      const heightFromStart = bottom - topAtStart;
      if (heightFromStart > available && i > start) {
        out.push([start, i - 1]);
        start = i;
        topAtStart = ps[i].offsetTop;
      }
    }
    out.push([start, ps.length - 1]);
    setSlices(out);
    onPageCount && onPageCount(chapter.id, out.length);
  // We intentionally watch chapter.id, textSize, vpKey, immersive.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id, paragraphs.length, textSize, vpKey, immersive]);

  // Clamp pageInChapter into range — re-flow may shrink the count.
  const safePage = Math.max(0, Math.min((slices?.length ?? 1) - 1, pageInChapter || 0));
  const [from, to] = slices ? slices[safePage] : [0, paragraphs.length - 1];
  const pageCount = slices ? slices.length : 1;
  const isFirstPage = safePage === 0;

  return (
    <div
      className={`ds-reader-page ${animClass || ""}`}
      role="article"
      aria-label={headingText || ctx?.chapterTitle || ""}
    >
      {/* Always-on chapter context strip — page-of-N now derived from the
          actual measured slices, not pre-computed in FictionReader. */}
      {(ctx || pageCount > 1) && (
        <p className="ds-reader-chapter-strip">
          {ctx ? `Chapter ${ctx.chapterIndex} of ${ctx.chapterCount}` : ""}
          {ctx && pageCount > 1 ? " · " : ""}
          {pageCount > 1 ? `page ${safePage + 1} of ${pageCount}` : ""}
        </p>
      )}

      {/* Big chapter heading — only on the first measured page of the chapter */}
      {isFirstPage && headingText && (
        <>
          <h1 className="ds-reader-h1">{headingText}</h1>
          <div className="ds-reader-ornament" aria-hidden="true">· · ·</div>
        </>
      )}

      {/* Visible slice */}
      <div className="ds-reader-body">
        {slices && paragraphs.slice(from, to + 1).map((p, j) => {
          const i = from + j;
          // Drop cap only on the very first paragraph of the very first page.
          const dropCap = i === 0 && isFirstPage;
          return (
            <p key={i} className={dropCap ? "ds-reader-p ds-reader-p-first" : "ds-reader-p"}>
              {p}
            </p>
          );
        })}
      </div>

      {/* Hidden measuring container — same width, paragraphs marked
          ds-measure-p so useLayoutEffect can find them. Visually invisible
          but laid out at the same width so offsetTop / offsetHeight are
          accurate. */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="ds-reader-measure"
      >
        {paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? "ds-reader-p ds-measure-p ds-reader-p-first" : "ds-reader-p ds-measure-p"}>
            {p}
          </p>
        ))}
      </div>

      {chapter.attribution && safePage === pageCount - 1 && (
        <p className="ds-reader-attribution">{chapter.attribution}</p>
      )}

      {dayLabel && safePage === pageCount - 1 && (
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
  // Controlled text-size mode: FictionReader lifts this state up so it can
  // re-paginate chapters when the user changes size. If the caller passes
  // textSize + onTextSizeChange we use those; otherwise we fall back to
  // local state + localStorage. Either way the controls and CSS classes
  // behave identically.
  textSize: textSizeProp,
  onTextSizeChange,
  // When true, the reader starts in full-screen "movie mode" — the page IS
  // the screen, no card, no host-app chrome. FictionReader sets this when
  // the user taps "Open book" because that gesture is "I'm here to read."
  defaultImmersive = false,
}) {
  const [chapters, setChapters] = useState(providedSource?.items || []);
  const [currentIndex, setCurrentIndex] = useState(providedSource?.currentIndex ?? 0);
  // pageInChapter — measured pagination tracks WHICH page within the current
  // chapter is visible. Resets to 0 on chapter change.
  const [pageInChapter, setPageInChapter] = useState(0);
  // chapter id → page count (reported back by ChapterPage's measurement pass)
  const [chapterPageCounts, setChapterPageCounts] = useState({});
  const reportPageCount = useCallback((chapterId, count) => {
    if (!chapterId) return;
    setChapterPageCounts(prev =>
      prev[chapterId] === count ? prev : { ...prev, [chapterId]: count }
    );
  }, []);
  const [loading, setLoading] = useState(!providedSource);
  const [error, setError] = useState(false);
  const [flipState, setFlipState] = useState({ phase: "idle", dir: 0 });
  // Books (kind='book') have all chapters unlocked — no lock screen.
  const noLock = providedSource?.kind === "book";
  const [showLocked, setShowLocked] = useState(false);
  const touchStartRef = useRef(null);
  const reducedMotion = prefersReducedMotion();

  // Reader UX — 5-level text size (xs / s / m / l / xl) + immersive toggle.
  // Sizes persist to localStorage. Caller can also drive textSize via prop.
  const [localTextSize, setLocalTextSize] = useState(() => {
    try {
      const stored = localStorage.getItem("fw_reader_text_size") || "m";
      // Legacy values from when we had 3 sizes — accept all 5.
      return TEXT_SIZES.includes(stored) ? stored : "m";
    } catch { return "m"; }
  });
  const textSize = textSizeProp || localTextSize;
  const setSize = useCallback((next) => {
    if (!TEXT_SIZES.includes(next)) return;
    if (onTextSizeChange) {
      onTextSizeChange(next);
    } else {
      setLocalTextSize(next);
    }
    try { localStorage.setItem("fw_reader_text_size", next); } catch { /* silent */ }
  }, [onTextSizeChange]);
  const stepSize = useCallback((dir) => {
    const i = TEXT_SIZE_INDEX(textSize);
    const next = TEXT_SIZES[Math.max(0, Math.min(TEXT_SIZES.length - 1, i + dir))];
    setSize(next);
  }, [textSize, setSize]);

  const [immersive, setImmersive] = useState(defaultImmersive);
  // DND tip — show once per immersive session, then auto-dismiss. Anchored to
  // a localStorage seen-flag so we don't badger returning readers.
  const [showDndTip, setShowDndTip] = useState(false);
  useEffect(() => {
    if (!immersive) { setShowDndTip(false); return; }
    let seen = false;
    try { seen = localStorage.getItem("fw_reader_dnd_seen") === "1"; } catch { /* silent */ }
    if (seen) return;
    setShowDndTip(true);
    const t = setTimeout(() => setShowDndTip(false), 6000);
    return () => clearTimeout(t);
  }, [immersive]);
  const dismissDndTip = useCallback(() => {
    setShowDndTip(false);
    try { localStorage.setItem("fw_reader_dnd_seen", "1"); } catch { /* silent */ }
  }, []);
  // Lock body scroll while immersive so the page behind doesn't drift.
  useEffect(() => {
    if (!immersive) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e) => { if (e.key === "Escape") setImmersive(false); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onEsc);
    };
  }, [immersive]);

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
  const currentChapterRef = chapters[currentIndex];
  const currentChapterPages = chapterPageCounts[currentChapterRef?.id] || 1;
  // Reset to page 0 whenever we move to a different chapter.
  useEffect(() => { setPageInChapter(0); }, [currentIndex]);

  const flipForward = useCallback(() => {
    if (showLocked) return;
    // Step inside the current chapter first.
    if (pageInChapter < currentChapterPages - 1) {
      if (reducedMotion) {
        setPageInChapter(p => p + 1);
      } else {
        setFlipState({ phase: "flipping", dir: 1 });
        setTimeout(() => {
          setPageInChapter(p => p + 1);
          setFlipState({ phase: "idle", dir: 0 });
        }, 350);
      }
      return;
    }
    // At end of chapter — go to next chapter (or lock).
    if (currentIndex >= latestRevealed) {
      if (noLock) return; // books: no lock screen, stay on last page
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
  }, [pageInChapter, currentChapterPages, currentIndex, latestRevealed, reducedMotion, showLocked, noLock]);

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
    // Step inside the current chapter first.
    if (pageInChapter > 0) {
      if (reducedMotion) {
        setPageInChapter(p => p - 1);
      } else {
        setFlipState({ phase: "flipping", dir: -1 });
        setTimeout(() => {
          setPageInChapter(p => p - 1);
          setFlipState({ phase: "idle", dir: 0 });
        }, 350);
      }
      return;
    }
    if (currentIndex <= 0) return;
    // Jumping to previous chapter — land on its LAST page so flipping back
    // feels continuous instead of teleporting to its first.
    const prevChapter = chapters[currentIndex - 1];
    const prevPageCount = chapterPageCounts[prevChapter?.id] || 1;
    if (reducedMotion) {
      setCurrentIndex(i => Math.max(i - 1, 0));
      setPageInChapter(prevPageCount - 1);
    } else {
      setFlipState({ phase: "flipping", dir: -1 });
      setTimeout(() => {
        setCurrentIndex(i => Math.max(i - 1, 0));
        setPageInChapter(prevPageCount - 1);
        setFlipState({ phase: "idle", dir: 0 });
      }, 600);
    }
  }, [pageInChapter, currentIndex, reducedMotion, showLocked, chapters, chapterPageCounts]);

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

  const readerBody = (
    <div
      className={`ds-reader-root ds-text-${textSize} ${immersive ? "ds-immersive" : ""}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ReaderStyles reducedMotion={reducedMotion} />

      {/* Reader controls — non-immersive: series label + volume-style font + ⤢
          Immersive: a slim top bar with ← (exit immersive) + Aa volume +
          ✕ (also exits) — nothing else, "like watching a movie". */}
      {immersive ? (
        <div className="ds-reader-immersive-bar" role="toolbar" aria-label="Reader controls">
          <button
            type="button"
            className="ds-reader-imm-btn"
            onClick={() => setImmersive(false)}
            aria-label="Exit full screen"
            title="Exit (Esc)"
          >
            <ArrowLeft size={18} />
          </button>
          <FontSliderControl
            textSize={textSize}
            setSize={setSize}
            variant="immersive"
          />
          <button
            type="button"
            className="ds-reader-imm-btn"
            onClick={() => setImmersive(false)}
            aria-label="Close"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div className="ds-reader-controls" role="toolbar" aria-label="Reader controls">
          <p className="ds-reader-series-label ds-reader-series-inline">{seriesTitle}</p>
          <div className="ds-reader-controls-right">
            <FontSliderControl
              textSize={textSize}
              setSize={setSize}
            />
            <button
              type="button"
              className="ds-reader-ctrl-btn ds-reader-ctrl-fullscreen"
              onClick={() => setImmersive(true)}
              aria-label="Full screen"
              title="Full screen"
            >⤢</button>
          </div>
        </div>
      )}

      {/* DND tip — once per session, dismissable. Movie-mode feel. */}
      {immersive && showDndTip && (
        <div className="ds-reader-dnd-tip" role="status">
          <span>Turn on Do Not Disturb for an uninterrupted read.</span>
          <button
            type="button"
            className="ds-reader-dnd-dismiss"
            onClick={dismissDndTip}
            aria-label="Dismiss tip"
          >Got it</button>
        </div>
      )}

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
            textSize={textSize}
            pageInChapter={pageInChapter}
            onPageCount={reportPageCount}
            immersive={immersive}
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

  // Immersive renders through a portal to document.body so it floats above
  // EVERY app surface (bottom nav, FABs, sticky headers) — "like watching a
  // movie". Non-immersive renders inline.
  if (immersive && typeof document !== "undefined") {
    return createPortal(readerBody, document.body);
  }
  return readerBody;
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
        max-width: 880px;
        margin: 0 auto;
        padding: 0 0 32px;
        font-family: 'Inter', sans-serif;
        user-select: none;
      }
      /* Immersive — Reader v4a, "page IS the screen" (Atelier spec).
         No card, no border, no radius, no shadow. The page background is
         the paper. The reading column is 580px max. Generous breathing
         margins. Body scroll is hard-clipped — measured pagination handles
         fit, even at XL font. */
      .ds-reader-root.ds-immersive {
        position: fixed;
        inset: 0;
        z-index: 9999;
        max-width: none;
        background: var(--paper, #FFFAF5);
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        /* theme defaults — Cream */
        --paper: #FFFAF5;
        --ink: #2A2035;
        --ink-mute: #8A7E88;
        --accent: #D45E52;
        --rule: rgba(74,42,58,0.10);
      }
      /* Theme overrides (applied via root class fw-theme-honey / -plum) */
      .ds-reader-root.ds-immersive.fw-theme-honey {
        --paper: #F5E6CD; --ink: #3A2818; --ink-mute: #7A6048;
        --accent: #B68A3C; --rule: rgba(58,40,24,0.14);
      }
      .ds-reader-root.ds-immersive.fw-theme-plum {
        --paper: #2B1E26; --ink: #F5E6D3; --ink-mute: #C9B8B0;
        --accent: #E89289; --rule: rgba(245,230,211,0.14);
      }
      /* The stage in immersive is no longer a card — it's a transparent
         reading column floated on the paper. The visible body is the page. */
      .ds-reader-root.ds-immersive .ds-reader-stage {
        background: transparent;
        border: none;
        border-radius: 0;
        box-shadow: none;
        max-width: 580px;
        margin: 0 auto;
        width: 100%;
        flex: 1;
        min-height: 0;
        max-height: none;
        overflow: hidden;
        padding: 64px 32px 56px;
        color: var(--ink, #2A2035);
      }
      @media (max-width: 768px) {
        .ds-reader-root.ds-immersive .ds-reader-stage {
          padding: 56px 24px 40px;
        }
      }
      /* Visible body inside the stage uses --ink for prose; clipped so a
         miscount can't overflow. */
      .ds-reader-root.ds-immersive .ds-reader-body { overflow: hidden; }
      .ds-reader-root.ds-immersive .ds-reader-p { color: var(--ink, #2A2035); }
      .ds-reader-root.ds-immersive .ds-reader-h1 { color: var(--ink, #2A2035); }
      .ds-reader-root.ds-immersive .ds-reader-p-first::first-letter {
        color: var(--accent, #D45E52);
      }
      .ds-reader-root.ds-immersive .ds-reader-ornament { color: var(--accent, #D45E52); }
      .ds-reader-root.ds-immersive .ds-reader-chapter-strip {
        color: var(--ink-mute, #8A7E88);
      }
      /* In immersive, the inline series label is irrelevant — the bar
         carries identity. Hide it so the page is unambiguously the page. */
      .ds-reader-root.ds-immersive .ds-reader-series-inline { display: none; }
      /* The bottom Prev / Next chevron row is also redundant; tap zones
         handle navigation. Hide it. v4b reintroduces a minimal floating
         progress bar at the bottom. */
      .ds-reader-root.ds-immersive .ds-reader-nav { display: none; }
      /* Lift the top control bar so it floats over the page rather than
         pushing the stage down. v4b makes it auto-hide. */
      .ds-reader-root.ds-immersive .ds-reader-immersive-bar {
        position: absolute;
        top: 0; left: 0; right: 0;
        margin: 0;
        padding: 12px 16px;
        background: linear-gradient(to bottom, var(--paper, #FFFAF5) 0%, rgba(255,250,245,0) 100%);
        z-index: 2;
      }
      /* Make sure the stage starts below the top bar visually. */
      .ds-reader-root.ds-immersive .ds-reader-stage {
        padding-top: max(72px, 64px);
      }
      @media (max-width: 768px) {
        .ds-reader-root.ds-immersive .ds-reader-stage { padding-top: 64px; }
      }

      /* Control bar — series label inline + volume-style font + fullscreen */
      .ds-reader-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin: 0 0 14px;
        flex-wrap: wrap;
      }
      .ds-reader-controls-right {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .ds-reader-ctrl-btn {
        min-width: 32px;
        height: 32px;
        padding: 0 10px;
        border: 1px solid var(--border, #EDE8E4);
        background: var(--surface, #fff);
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: var(--plum-mute, #8A7E88);
        border-radius: 9999px;
        cursor: pointer;
        transition: background 120ms, color 120ms;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ds-reader-ctrl-btn:hover { color: var(--plum-deep, #2b1e16); }
      .ds-reader-ctrl-fullscreen { font-size: 14px; }

      /* True range-slider font control — small A · [thumb on track] · big A */
      .ds-reader-slider {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: var(--surface, #fff);
        border: 1px solid var(--border, #EDE8E4);
        border-radius: 9999px;
        padding: 4px 12px;
        min-width: 180px;
      }
      .ds-reader-slider-mark {
        font-family: 'Fraunces', Georgia, serif;
        color: var(--plum-mute, #8A7E88);
        line-height: 1;
        font-weight: 500;
        user-select: none;
      }
      .ds-reader-slider-mark-min { font-size: 11px; }
      .ds-reader-slider-mark-max { font-size: 19px; }
      .ds-reader-slider-input {
        -webkit-appearance: none;
        appearance: none;
        flex: 1;
        height: 18px;
        background: transparent;
        margin: 0;
        cursor: pointer;
      }
      /* WebKit track + thumb */
      .ds-reader-slider-input::-webkit-slider-runnable-track {
        height: 3px;
        background: var(--border, #EDE8E4);
        border-radius: 2px;
      }
      .ds-reader-slider-input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px; height: 16px;
        margin-top: -7px;
        border-radius: 9999px;
        background: var(--rose-primary, #D45E52);
        border: 2px solid var(--surface, #fff);
        box-shadow: 0 1px 3px rgba(74,42,58,0.25);
        cursor: pointer;
      }
      /* Firefox track + thumb */
      .ds-reader-slider-input::-moz-range-track {
        height: 3px;
        background: var(--border, #EDE8E4);
        border-radius: 2px;
      }
      .ds-reader-slider-input::-moz-range-thumb {
        width: 16px; height: 16px;
        border-radius: 9999px;
        background: var(--rose-primary, #D45E52);
        border: 2px solid var(--surface, #fff);
        box-shadow: 0 1px 3px rgba(74,42,58,0.25);
        cursor: pointer;
      }
      .ds-reader-slider.is-immersive {
        background: rgba(255,255,255,0.85);
        backdrop-filter: blur(8px);
      }

      /* Hidden measuring layer — visually invisible but laid out at the same
         width so paragraph offsetTop / offsetHeight are accurate. */
      .ds-reader-measure {
        position: absolute;
        top: 0; left: 0; right: 0;
        visibility: hidden;
        pointer-events: none;
        opacity: 0;
        max-width: 720px;
        margin: 0 auto;
        padding: 0;
      }
      .ds-immersive .ds-reader-measure { max-width: 720px; }

      /* Immersive top bar — minimal: ← Aa-volume ✕ */
      .ds-reader-immersive-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 4px;
        margin: 0 0 14px;
      }
      .ds-reader-imm-btn {
        width: 38px; height: 38px;
        border-radius: 9999px;
        border: 1px solid var(--border, rgba(43,30,22,0.10));
        background: var(--surface, rgba(255,255,255,0.85));
        color: var(--plum-deep, #2b1e16);
        cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        backdrop-filter: blur(8px);
      }
      .ds-reader-imm-btn:hover { background: var(--rose-soft-bg, #fbe9e6); }
      .ds-reader-vol.is-immersive {
        background: rgba(255,255,255,0.85);
        backdrop-filter: blur(8px);
      }

      /* DND tip — soft banner under the immersive top bar */
      .ds-reader-dnd-tip {
        max-width: 560px;
        margin: 0 auto 18px;
        padding: 10px 16px;
        border-radius: 12px;
        background: var(--rose-soft-bg, #fbe9e6);
        color: var(--plum-deep, #2b1e16);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        animation: ds-tip-in 240ms ease both;
      }
      @keyframes ds-tip-in {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .ds-reader-dnd-dismiss {
        flex: 0 0 auto;
        border: none;
        background: var(--rose-primary, #D45E52);
        color: white;
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 9999px;
        cursor: pointer;
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
      .ds-reader-series-inline {
        margin: 0;
        text-align: left;
        flex: 0 1 auto;
      }

      /* Always-on chapter context strip — keeps multi-page chapters from
         feeling scattered. Hidden when the page already shows the big
         chapter heading (first page of each chapter) by being smaller and
         visually subservient to the heading. */
      .ds-reader-chapter-strip {
        font-family: 'Inter', sans-serif;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--mauve, #8A7E88);
        text-align: center;
        margin: 0 0 14px;
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

      /* Book stage — content is hard-clipped here. The reader's measured
         pagination computes how many paragraphs fit and only renders that
         slice into the visible body; the rest is held in a hidden measurer
         off to the side. */
      .ds-reader-stage {
        background: var(--surface, #fff);
        border: 1px solid var(--border, #EDE8E4);
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(42,32,53,0.10), 0 2px 8px rgba(42,32,53,0.06);
        min-height: 520px;
        max-height: calc(100vh - 220px);
        padding: 40px 32px 32px;
        position: relative;
        transform-style: preserve-3d;
        overflow: hidden;
      }
      /* And the visible body inside the stage clips too. */
      .ds-reader-body { overflow: hidden; }

      @media (max-width: 480px) {
        .ds-reader-stage { padding: 28px 20px 24px; min-height: 460px; }
      }

      /* Chapter page */
      .ds-reader-page {
        height: 100%;
      }

      .ds-reader-h1 {
        font-family: 'Fraunces', 'Fraunces', Georgia, serif;
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

      /* Body — no clipped scroll-box; the chapter flows naturally and the stage
         expands. Pagination already splits chapters into page-sized chunks. */
      .ds-reader-body {
        /* intentionally no max-height/overflow — pages should flow */
      }

      .ds-reader-p {
        font-family: 'Fraunces', Georgia, serif;
        font-size: clamp(16px, 2.5vw, 18px);
        color: var(--plum, #2A2035);
        line-height: 1.78;
        margin: 0 0 18px;
      }

      /* Text-size variants — absolute px per Atelier v4 spec (no clamp; we
         control the page width via the 580px reading column). */
      .ds-text-xs .ds-reader-p { font-size: 15px; line-height: 1.65; margin: 0 0 14px; }
      .ds-text-s  .ds-reader-p { font-size: 16px; line-height: 1.70; margin: 0 0 16px; }
      .ds-text-m  .ds-reader-p { font-size: 18px; line-height: 1.75; margin: 0 0 18px; }
      .ds-text-l  .ds-reader-p { font-size: 20px; line-height: 1.80; margin: 0 0 20px; }
      .ds-text-xl .ds-reader-p { font-size: 23px; line-height: 1.84; margin: 0 0 22px; }

      /* h1 = 1.55em of body, centred, tight leading. Drop-cap sizes follow. */
      .ds-reader-h1 { font-size: 1.55em; line-height: 1.25; margin: 0 0 8px; text-align: center; font-weight: 500; }
      .ds-text-xs .ds-reader-p-first::first-letter { font-size: 3.4em; }
      .ds-text-s  .ds-reader-p-first::first-letter { font-size: 3.8em; }
      .ds-text-m  .ds-reader-p-first::first-letter { font-size: 4.2em; }
      .ds-text-l  .ds-reader-p-first::first-letter { font-size: 4.6em; }
      .ds-text-xl .ds-reader-p-first::first-letter { font-size: 5.0em; }

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
      .ds-text-s .ds-reader-p-first::first-letter { font-size: 3.6em; }
      .ds-text-l .ds-reader-p-first::first-letter { font-size: 4.8em; }

      /* Immersive (full-page) mode — let the reader breathe */
      .ds-immersive .ds-reader-stage {
        min-height: calc(100vh - 220px);
        padding: 48px 40px 40px;
      }
      .ds-immersive .ds-reader-body {
        max-width: 720px;
        margin: 0 auto;
      }
      @media (max-width: 640px) {
        .ds-immersive .ds-reader-stage {
          padding: 32px 22px 28px;
          min-height: calc(100vh - 180px);
        }
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
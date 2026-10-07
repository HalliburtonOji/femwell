import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Lock, ArrowLeft, Bookmark, Feather } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useScrollLock } from "@/utils/useScrollLock";
// §6.7.8 — the reader reads its measure/type standard from the ONE source, so it can never
// drift from the other readers again.
import { READING } from "@/components/brand/ReadingColumn";

// v4c — persisted reader preferences (theme, typeface, line, margins).
// All keys live in one place so other components could read them if needed.
const PREF_KEYS = {
  theme: "fw_reader_theme",     // cream | honey | plum
  font: "fw_reader_font",       // fraunces | inter
  line: "fw_reader_line",       // tight | normal | relaxed
  margins: "fw_reader_margins", // narrow | normal | wide
};
const THEMES = ["cream", "honey", "plum"];
const FONTS = ["fraunces", "inter"];
const LINES = ["tight", "normal", "relaxed"];
const MARGINS = ["narrow", "normal", "wide"];
function readPref(key, valid, fallback) {
  try {
    const v = localStorage.getItem(key);
    return valid.includes(v) ? v : fallback;
  } catch { return fallback; }
}
function writePref(key, value) {
  try { localStorage.setItem(key, value); } catch { /* silent */ }
}

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

// Snapshot ownership during capture: a sheet may remove itself before the
// reader's window listener runs, but that same key must not reach the page below.
const eventOwners = new WeakMap();
function isVisibleKeySurface(element) {
  if (!element?.isConnected) return false;
  for (let node = element; node instanceof Element; node = node.parentElement) {
    if (node.hidden || node.inert || node.getAttribute("aria-hidden") === "true") return false;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false;
  }
  return true;
}
function eventOwner(event, includeFocus = true) {
  const native = event.nativeEvent || event;
  if (eventOwners.has(native)) return eventOwners.get(native);
  const controls = 'input,textarea,select,button,a[href],summary,[data-reader-scroll-region="true"],[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],[role="textbox"],[role="searchbox"],[role="slider"],[role="spinbutton"],[role="combobox"],[role="checkbox"],[role="radio"],[role="switch"],[role="tab"],[role="menuitem"],[role="option"],[role="listbox"],[role="tree"],[role="grid"]';
  const path = [...(native.composedPath?.() || [event.target]), ...(includeFocus ? [document.activeElement] : [])];
  const ownedControls = path.flatMap(node => node instanceof Element
    ? [node.closest(controls) || (node.isContentEditable ? node : null)].filter(Boolean) : []);
  const context = {
    controls: ownedControls,
    dialogs: [...document.querySelectorAll('[role="dialog"],[role="alertdialog"],dialog[open]')].filter(isVisibleKeySurface),
  };
  eventOwners.set(native, context);
  return context;
}
function ownsModifiedKey(event) {
  return event.defaultPrevented || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey;
}

// Opt-in sheets share focus ownership without changing legacy reader consumers.
let pendingCleanDialogReturn = null;
export function useCleanReaderDialog(enabled, dialogRef, onClose, initialSelector = "button") {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!enabled || !dialog) return;
    const active = document.activeElement;
    const previous = (active === document.body || !active?.isConnected) && pendingCleanDialogReturn?.isConnected
      ? pendingCleanDialogReturn : active;
    const top = () => [...document.querySelectorAll("[data-clean-reader-layer]")]
      .filter(isVisibleKeySurface).sort((a, b) => Number(b.dataset.cleanReaderLayer) - Number(a.dataset.cleanReaderLayer))[0];
    const controls = () => [...dialog.querySelectorAll('button,a[href],input,textarea,select,[tabindex]')]
      .filter(node => !node.disabled && node.tabIndex >= 0 && isVisibleKeySurface(node));
    const focusFirst = () => (dialog.querySelector(initialSelector) || controls()[0] || dialog).focus({ preventScroll: true });
    if (top() === dialog) focusFirst();
    const onKey = event => {
      if (top() !== dialog || event.defaultPrevented || event.isComposing) return;
      if (event.key === "Escape") {
        event.preventDefault(); event.stopPropagation(); closeRef.current?.();
      } else if (event.key === "Tab") {
        const items = controls(), first = items[0] || dialog, last = items[items.length - 1] || dialog;
        if (!dialog.contains(document.activeElement) || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
          event.preventDefault(); (event.shiftKey ? last : first).focus({ preventScroll: true });
        }
      }
    };
    const onFocus = event => { if (top() === dialog && !dialog.contains(event.target)) focusFirst(); };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("focusin", onFocus);
      // A crisis sheet may replace the note in the same commit. Never steal its focus.
      pendingCleanDialogReturn = previous;
      queueMicrotask(() => {
        const next = top();
        if (previous?.isConnected && (!next || next.contains(previous))) previous.focus?.({ preventScroll: true });
        if (pendingCleanDialogReturn === previous) pendingCleanDialogReturn = null;
      });
    };
  }, [enabled, dialogRef, initialSelector]);
}

export function CleanReaderDialogStyles() {
  return <style>{`
    .fw-reader-clean-dialog { color: #191510; text-shadow: none; }
    .fw-reader-clean-dialog .fw-sheet-safe { padding: 20px 20px max(var(--fw-sheet-safe), env(safe-area-inset-bottom)) !important; max-height: calc(100dvh - 24px) !important; scroll-padding-block: 20px max(var(--fw-sheet-safe), env(safe-area-inset-bottom)); }
    .fw-reader-clean-dialog button, .fw-reader-clean-dialog a { min-height: 44px; min-width: 44px; box-sizing: border-box; }
    .fw-reader-clean-dialog textarea { font-size: 18px !important; line-height: 1.6 !important; }
    .fw-reader-clean-dialog :is(button,a,input,textarea,select):focus-visible { outline: 2px solid #527364 !important; outline-offset: 3px; }
    .fw-reader-clean-dialog label { display: block; font: 600 13px/1.5 ui-sans-serif,system-ui,sans-serif; color: #191510; margin: 0 0 8px; }
  `}</style>;
}

// ─── Font-size slider control ─────────────────────────────────────────────────
// A real range slider — small "A" on the left, large "A" on the right, the
// thumb drags between five discrete positions (xs · s · m · l · xl).
function FontSliderControl({ textSize, setSize, variant, cleanPreview = false }) {
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
        aria-label={cleanPreview ? "Text size" : undefined}
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

// ─── Settings drawer (v4c) ────────────────────────────────────────────────────
// Bottom sheet (60vh) with 5 sections: text size, theme, typeface, line
// spacing, margins. All changes persist immediately to localStorage. Closes
// on scrim click, Esc, or the close button.
function SettingsDrawer({
  textSize, setSize,
  theme, setTheme,
  font, setFont,
  line, setLine,
  margins, setMargins,
  onClose,
  cleanPreview = false,
}) {
  const sheetRef = useRef(null);
  useCleanReaderDialog(cleanPreview, sheetRef, onClose, 'input[type="range"]');
  useEffect(() => {
    if (cleanPreview) return;
    const onKey = (e) => {
      if (e.key !== "Escape" || ownsModifiedKey(e)) return;
      if (!isVisibleKeySurface(sheetRef.current)) return;
      // BookReader's reflection/support overlays sit above reader settings.
      // Their own handlers own Escape, even when focus has not moved there yet.
      if (eventOwner(e).dialogs.some(dialog => dialog !== sheetRef.current)) return;
      e.preventDefault(); onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, cleanPreview]);

  const themeLabel = { cream: "Cream", honey: "Honey", plum: "Plum Night" };
  const lineLabel = { tight: "Tight", normal: "Default", relaxed: "Relaxed" };
  const marginLabel = { narrow: "Narrow", normal: "Default", wide: "Wide" };

  return (
    <>
      <div
        className="ds-reader-scrim"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className={`ds-reader-sheet${cleanPreview ? " fw-reader-clean-dialog" : ""}`}
        data-clean-reader-layer={cleanPreview ? "10001" : undefined}
        tabIndex={cleanPreview ? -1 : undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Reader settings"
      >
        <button
          type="button"
          className="ds-reader-sheet-handle"
          onClick={onClose}
          aria-label="Close settings"
        >{cleanPreview ? "Close settings" : null}</button>
        <div className={`ds-reader-sheet-content${cleanPreview ? " fw-sheet-safe" : ""}`}>
          {cleanPreview && <p className="ds-reader-sheet-label">Your usual reading settings.</p>}
          {/* Section 1 — Text size */}
          <div className="ds-reader-sheet-section">
            <p className="ds-reader-sheet-label">Text size</p>
            <FontSliderControl textSize={textSize} setSize={setSize} variant="sheet" cleanPreview={cleanPreview} />
          </div>

          {/* Section 2 — Theme */}
          <div className="ds-reader-sheet-section">
            <p className="ds-reader-sheet-label">Theme</p>
            <div className="ds-reader-tile-row">
              {THEMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`ds-reader-tile ds-reader-tile-theme fw-theme-${t} ${theme === t ? "is-selected" : ""}`}
                  onClick={() => setTheme(t)}
                  aria-pressed={theme === t}
                >
                  <span className="ds-reader-tile-aa">Aa</span>
                  <span className="ds-reader-tile-label">{themeLabel[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3 — Typeface */}
          <div className="ds-reader-sheet-section">
            <p className="ds-reader-sheet-label">Typeface</p>
            <div className="ds-reader-tile-row">
              {FONTS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`ds-reader-tile ds-reader-tile-font fw-font-${f} ${font === f ? "is-selected" : ""}`}
                  onClick={() => setFont(f)}
                  aria-pressed={font === f}
                >
                  <span className="ds-reader-tile-aa">Aa</span>
                  <span className="ds-reader-tile-label">{f === "fraunces" ? "Serif" : "Sans"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4 — Line spacing */}
          <div className="ds-reader-sheet-section">
            <p className="ds-reader-sheet-label">Line spacing</p>
            <div className="ds-reader-pill-row">
              {LINES.map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`ds-reader-pill ${line === l ? "is-selected" : ""}`}
                  onClick={() => setLine(l)}
                  aria-pressed={line === l}
                >
                  {lineLabel[l]}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5 — Margins */}
          <div className="ds-reader-sheet-section">
            <p className="ds-reader-sheet-label">Margins</p>
            <div className="ds-reader-pill-row">
              {MARGINS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`ds-reader-pill ${margins === m ? "is-selected" : ""}`}
                  onClick={() => setMargins(m)}
                  aria-pressed={margins === m}
                >
                  {marginLabel[m]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
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
function ChapterPage({ chapter, dayLabel, indexHint, total, animClass, textSize, pageInChapter, onPageCount, immersive, layoutKey, onPassageTap }) {
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
  const [tallPages, setTallPages] = useState([]);
  const [availableHeight, setAvailableHeight] = useState(null);
  const passageGesture = useRef(null);
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
    let cancelled = false;
    let raf = 0;

    const measure = () => {
      if (cancelled || !measureRef.current) return;
      const ps = Array.from(measureRef.current.querySelectorAll(".ds-measure-p"));
      if (!ps.length) {
        setSlices([[0, 0]]);
        onPageCount && onPageCount(chapter.id, 1, 0);
        return;
      }

      // EXACT available height — MEASURED, not guessed.
      // Was: `window.innerHeight - (immersive ? 220 : 280)` — a magic number hand-tuned to the
      // old chrome AND the old 1.5x-remapped type. Any type/chrome change silently invalidates
      // it (which is exactly what the §6.7.8 pass would have done). Now we read the real
      // geometry: from where the real body starts to where the stage's content box ends.
      // getBoundingClientRect is sub-pixel; offsetTop/offsetHeight are INTEGER-ROUNDED, and
      // ~1px is precisely enough to admit or drop a line at a page edge.
      let available = 0;
      const stage = measureRef.current.closest(".ds-reader-stage");
      const realBody = measureRef.current.closest(".ds-reader-page")?.querySelector(".ds-reader-body");
      if (stage && realBody) {
        const padB = parseFloat(getComputedStyle(stage).paddingBottom) || 0;
        available = (stage.getBoundingClientRect().bottom - padB) - realBody.getBoundingClientRect().top;
      }
      // Fallback only when the geometry isn't readable yet (keeps the old conservative guess).
      if (!(available > 160)) available = Math.max(260, window.innerHeight - (immersive ? 220 : 280));
      setAvailableHeight(available);

      const out = [];
      const tall = [];   // slices that CANNOT fit — see the guard below
      let start = 0;
      let topAtStart = ps[0].getBoundingClientRect().top;
      const pushSlice = (a, b) => {
        const h = ps[b].getBoundingClientRect().bottom - ps[a].getBoundingClientRect().top;
        if (h > available) tall.push(out.length);   // a single paragraph taller than the page
        out.push([a, b]);
      };
      for (let i = 0; i < ps.length; i++) {
        const bottom = ps[i].getBoundingClientRect().bottom;
        if (bottom - topAtStart > available && i > start) {
          pushSlice(start, i - 1);
          start = i;
          topAtStart = ps[i].getBoundingClientRect().top;
        }
      }
      pushSlice(start, ps.length - 1);
      if (cancelled) return;
      // GUARD: this engine breaks only BETWEEN paragraphs (so orphans/widows are impossible
      // by construction). The one case it cannot fit is a single paragraph taller than the
      // page — previously that silently CLIPPED, i.e. lost her words in a hard-hidden body.
      // Letting that rare page scroll is the honest trade: a scroll is a nuisance, missing
      // text is a bug. (The full fix is mid-paragraph breaking via Range.getClientRects —
      // noted as the upgrade path, not smuggled into a measure pass.)
      setTallPages(tall);
      setSlices(out);
      // report the slices so the parent can resume by a STABLE PARAGRAPH ANCHOR, not a page index
      onPageCount && onPageCount(chapter.id, out.length, ps.length, out);
    };

    // Measure now so the page paints — then AGAIN once the webfonts land. Our faces are remote
    // woff2: measuring before they swap paginates against FALLBACK metrics, so every break
    // would be wrong the moment the real font arrives. (`size-adjust` needs no special
    // handling — measuring in the same declared font accounts for it automatically.)
    measure();
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!cancelled) raf = requestAnimationFrame(measure); }).catch(() => {});
    }
    return () => { cancelled = true; if (raf) cancelAnimationFrame(raf); };
  // layoutKey carries font / line-spacing / margins — changing any of them reflows the column,
  // so pagination MUST recompute (it previously did not, leaving stale, clipped pages).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id, paragraphs.length, textSize, vpKey, immersive, layoutKey]);

  // Clamp pageInChapter into range — re-flow may shrink the count.
  const safePage = Math.max(0, Math.min((slices?.length ?? 1) - 1, pageInChapter || 0));
  const [from, to] = slices ? slices[safePage] : [0, paragraphs.length - 1];
  const pageCount = slices ? slices.length : 1;
  const isFirstPage = safePage === 0;
  const scrollablePassage = tallPages.includes(safePage) && availableHeight > 0;
  const startPassageGesture = e => {
    const point = e.touches?.[0] || e;
    passageGesture.current = { x: point.clientX, y: point.clientY, time: Date.now(), moved: false };
  };
  const movePassageGesture = e => {
    const start = passageGesture.current, point = e.touches?.[0] || e.changedTouches?.[0] || e;
    if (start && (Math.abs(point.clientX - start.x) > 8 || Math.abs(point.clientY - start.y) > 8)) start.moved = true;
  };
  const tapPassage = e => {
    const gesture = passageGesture.current;
    passageGesture.current = null;
    if (gesture?.moved || (gesture && Date.now() - gesture.time > 500) || window.getSelection()?.isCollapsed === false) return;
    onPassageTap?.(e);
  };

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
      <div
        key={`${chapter.id}:${from}`}
        className={`ds-reader-body${tallPages.includes(safePage) ? " ds-body-scroll" : ""}`}
        data-reader-scroll-region={scrollablePassage ? "true" : undefined}
        role={scrollablePassage ? "region" : undefined}
        aria-label={scrollablePassage ? "Reading passage" : undefined}
        tabIndex={scrollablePassage ? 0 : undefined}
        style={scrollablePassage ? { maxHeight: availableHeight } : undefined}
        onPointerDown={scrollablePassage ? startPassageGesture : undefined}
        onPointerMove={scrollablePassage ? movePassageGesture : undefined}
        onTouchStart={scrollablePassage ? startPassageGesture : undefined}
        onTouchMove={scrollablePassage ? movePassageGesture : undefined}
        onTouchEnd={scrollablePassage ? movePassageGesture : undefined}
        onScroll={scrollablePassage ? () => { if (passageGesture.current) passageGesture.current.moved = true; } : undefined}
        onClick={scrollablePassage ? tapPassage : undefined}
      >
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
  // Optional exit handler — called when the user taps the immersive ←
  // button or ✕ close. When FictionReader wraps us, this returns to the
  // book cover. Falls back to "exit immersive only" when not provided.
  onExit,
  // v4d — per-book persistence key. When provided, the reader saves
  // reading position + bookmarks under fw_reader_pos_{bookId} /
  // fw_reader_bookmarks_{bookId}. Falls back to no-persistence (Daily
  // Story tab, where each chapter is its own day).
  bookId,
  // Phase-1 Books — fired (with the 0-based chapter index) whenever a chapter
  // is REACHED, including the first chapter on mount. Spoiler-safe by contract:
  // callers only ever act on chapters <= the one reached. The reader never
  // awaits it, so a slow handler can't block a page flip.
  onChapterReached,
  // Two-marks support (BookReader): an external jump request ({ index, nonce })
  // and a callback fired with the live { currentIndex, bookmarks } so the host
  // can render the physical bookmark + smart (schedule) marks bar.
  goToChapter,
  onMarks,
  // Anytime-reflect: when provided, a Reflect icon appears in the controls. Tapping it asks the
  // host to open a context-aware reflection for wherever she is (not only at chapter end).
  onReflect,
  cleanPreview = false,
}) {
  const readerRootRef = useRef(null);
  const [chapters, setChapters] = useState(providedSource?.items || []);
  const [currentIndex, setCurrentIndex] = useState(providedSource?.currentIndex ?? 0);
  // A requested chapter or saved position must settle before it is shown or recorded.
  const [positionReady, setPositionReady] = useState(false);
  const initialPositionRef = useRef(false);
  const fetchingChaptersRef = useRef(!providedSource);
  const [appliedJump, setAppliedJump] = useState(null);
  const jumpKind = typeof goToChapter === "number" ? "number" : "object";
  const rawJumpIndex = jumpKind === "number" ? goToChapter : goToChapter?.index;
  const jumpIndex = Number.isFinite(rawJumpIndex) ? Math.trunc(rawJumpIndex) : null;
  const jumpNonce = jumpKind === "number" ? jumpIndex : (goToChapter?.nonce ?? jumpIndex);
  const jumpPending = jumpIndex !== null && !(appliedJump?.kind === jumpKind && Object.is(appliedJump?.nonce, jumpNonce));
  // pageInChapter — measured pagination tracks WHICH page within the current
  // chapter is visible. Resets to 0 on chapter change.
  const [pageInChapter, setPageInChapter] = useState(0);
  // v4d — bookmarks live in localStorage per book.
  const bookmarksKey = bookId ? `fw_reader_bookmarks_${bookId}` : null;
  const posKey = bookId ? `fw_reader_pos_${bookId}` : null;
  const [bookmarks, setBookmarks] = useState(() => {
    if (!bookmarksKey) return [];
    try { return JSON.parse(localStorage.getItem(bookmarksKey) || "[]"); }
    catch { return []; }
  });
  const isCurrentBookmarked = useMemo(() => {
    return bookmarks.some(
      (b) => b.chapterIndex === currentIndex && b.pageInChapter === pageInChapter
    );
  }, [bookmarks, currentIndex, pageInChapter]);
  const toggleBookmark = useCallback(() => {
    if (!bookmarksKey) return;
    setBookmarks((prev) => {
      const exists = prev.some(
        (b) => b.chapterIndex === currentIndex && b.pageInChapter === pageInChapter
      );
      const next = exists
        ? prev.filter((b) => !(b.chapterIndex === currentIndex && b.pageInChapter === pageInChapter))
        : [...prev, { chapterIndex: currentIndex, pageInChapter, ts: Date.now() }];
      try { localStorage.setItem(bookmarksKey, JSON.stringify(next)); }
      catch { /* silent */ }
      return next;
    });
  }, [bookmarksKey, currentIndex, pageInChapter]);
  // chapter id → page count (reported back by ChapterPage's measurement pass)
  const [chapterPageCounts, setChapterPageCounts] = useState({});
  // Slices per chapter — kept so resume can land on a STABLE PARAGRAPH ANCHOR rather than a
  // page index. A page index is meaningless across a reflow: change the type, the margins or
  // the phone's orientation and "page 7" is a different place in the book — which is exactly
  // why resume used to jump.
  const chapterSlicesRef = useRef({});
  const reportPageCount = useCallback((chapterId, count, _paraCount, slices) => {
    if (!chapterId) return;
    if (slices) chapterSlicesRef.current[chapterId] = slices;
    setChapterPageCounts(prev =>
      prev[chapterId] === count ? prev : { ...prev, [chapterId]: count }
    );
  }, []);
  // Which page currently holds a given paragraph (the anchor → page lookup after any reflow).
  const pageForParagraph = useCallback((chapterId, paraIdx) => {
    const slices = chapterSlicesRef.current[chapterId];
    if (!slices || !slices.length) return 0;
    const i = slices.findIndex(([from, to]) => paraIdx >= from && paraIdx <= to);
    return i < 0 ? 0 : i;
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
  // v4c — settings drawer (Aa button) + persisted prefs.
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setThemeState] = useState(() => readPref(PREF_KEYS.theme, THEMES, "cream"));
  const [font, setFontState] = useState(() => readPref(PREF_KEYS.font, FONTS, "fraunces"));
  const [line, setLineState] = useState(() => readPref(PREF_KEYS.line, LINES, "normal"));
  const [margins, setMarginsState] = useState(() => readPref(PREF_KEYS.margins, MARGINS, "normal"));
  const setTheme = useCallback((v) => { setThemeState(v); writePref(PREF_KEYS.theme, v); }, []);
  const setFont = useCallback((v) => { setFontState(v); writePref(PREF_KEYS.font, v); }, []);
  const setLine = useCallback((v) => { setLineState(v); writePref(PREF_KEYS.line, v); }, []);
  const setMargins = useCallback((v) => { setMarginsState(v); writePref(PREF_KEYS.margins, v); }, []);
  // v4b — chrome (top bar + bottom progress) auto-hides after 3s of no
  // input in immersive mode. Tap the center of the page to toggle. Any
  // input (touch, click, keypress, slider drag) resets the timer.
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimerRef = useRef(null);
  const showChrome = useCallback(() => {
    setChromeVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setChromeVisible(false), 3000);
  }, []);
  useEffect(() => {
    if (!immersive) {
      setChromeVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      return;
    }
    showChrome();
    const onActivity = () => showChrome();
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [immersive, showChrome]);
  const toggleChrome = useCallback(() => {
    setChromeVisible((v) => {
      const next = !v;
      if (next) showChrome(); // restart 3s timer if showing
      else if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      return next;
    });
  }, [showChrome]);
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
  // Lock body scroll while immersive so the page behind doesn't drift (shared,
  // ref-counted hook — replaces the old ad-hoc document.body.style.overflow lock).
  useScrollLock(immersive);

  // Fetch DailyStory rows if no external source provided
  useEffect(() => {
    if (providedSource) return;
    let cancelled = false;
    (async () => {
      fetchingChaptersRef.current = true;
      initialPositionRef.current = false;
      setPositionReady(false);
      setAppliedJump(null);
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
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) {
          fetchingChaptersRef.current = false;
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [providedSource, seriesKey]);

  const latestRevealed = chapters.length - 1;
  const currentChapterRef = chapters[currentIndex];
  // measuredPages is undefined until ChapterPage reports this chapter's real page count.
  // Until then we must NOT advance to the next chapter (else a fast flip skips a whole,
  // unmeasured chapter — the "Chapter 4 for 30 pages then 5 then 6" jump). Default 1 only
  // for within-chapter math; the advance path guards on measuredPages being known.
  const measuredPages = currentChapterRef ? chapterPageCounts[currentChapterRef.id] : undefined;
  const currentChapterPages = measuredPages || 1;
  // Reset to page 0 whenever we move to a different chapter — unless we're
  // currently restoring a saved position (which sets pageInChapter directly
  // and shouldn't be stomped). v4d uses pendingPageRef for that.
  const pendingPageRef = useRef(null);
  // The saved PARAGRAPH anchor, waiting for this chapter's slices to be measured.
  const pendingAnchorRef = useRef(null);
  useEffect(() => {
    if (pendingPageRef.current != null) {
      setPageInChapter(pendingPageRef.current);
      // Non-persistent readers have no position-save effect to consume the hint.
      if (!posKey) pendingPageRef.current = null;
    } else if (pendingAnchorRef.current == null) {
      setPageInChapter(0);
    }
  }, [currentIndex]);

  // Land the anchor once the chapter has actually been measured: the paragraph she left off
  // at may now sit on a different page (bigger type, wider margins, a rotated phone) — so we
  // resolve the page from the anchor rather than trusting a stale page number.
  useEffect(() => {
    if (pendingAnchorRef.current == null || !currentChapterRef) return;
    if (measuredPages === undefined) return;   // wait for the measurement pass
    const restoredPage = pageForParagraph(currentChapterRef.id, pendingAnchorRef.current);
    pendingPageRef.current = restoredPage;
    setPageInChapter(restoredPage);
    pendingAnchorRef.current = null;
  }, [measuredPages, currentChapterRef, pageForParagraph]);

  // Resolve once after loading. Explicit numeric/marks-bar selections outrank resume;
  // an ordinary book open retains its saved paragraph anchor or legacy page number.
  useEffect(() => {
    if (loading || fetchingChaptersRef.current || !chapters.length) return;
    const clamp = value => Math.min(Math.max(0, Number.isFinite(value) ? Math.trunc(value) : 0), chapters.length - 1);
    if (!initialPositionRef.current) {
      let index = providedSource ? clamp(providedSource.currentIndex ?? 0) : chapters.length - 1;
      let page = 0;
      if (jumpIndex !== null) {
        index = clamp(jumpIndex);
        setAppliedJump({kind: jumpKind, nonce: jumpNonce});
      } else if (posKey) {
        try {
          const saved = JSON.parse(localStorage.getItem(posKey) || "null");
          if (saved) {
            index = clamp(saved.chapterIndex);
            pendingAnchorRef.current = Number.isFinite(saved.paragraphIndex) ? Math.max(0, saved.paragraphIndex) : null;
            page = pendingAnchorRef.current == null && Number.isFinite(saved.pageInChapter) ? Math.max(0, saved.pageInChapter) : 0;
            pendingPageRef.current = page;
          }
        } catch { /* invalid saved positions leave the normal starting chapter intact */ }
      }
      initialPositionRef.current = true;
      setCurrentIndex(index);
      setPageInChapter(page);
      setPositionReady(true);
      return;
    }
    if (!jumpPending) return;
    // Consume the request only when it can actually be applied, never before fetch.
    pendingAnchorRef.current = null;
    pendingPageRef.current = null;
    setShowLocked(false);
    setPageInChapter(0);
    setCurrentIndex(clamp(jumpIndex));
    setAppliedJump({kind: jumpKind, nonce: jumpNonce});
  }, [loading, chapters.length, posKey, jumpIndex, jumpKind, jumpNonce, jumpPending, providedSource?.currentIndex]);

  // Phase-1 Books — fire the chapter-boundary hook whenever the reader REACHES a
  // chapter (initial mount included). Fire-and-forget + guarded so a throwing or
  // slow handler can never wedge the reader. Only fires for real chapters.
  const onChapterReachedRef = useRef(onChapterReached);
  onChapterReachedRef.current = onChapterReached;
  useEffect(() => {
    const cb = onChapterReachedRef.current;
    if (typeof cb !== "function") return;
    if (!positionReady || fetchingChaptersRef.current || jumpPending) return;
    if (!chapters.length || currentIndex < 0 || currentIndex >= chapters.length) return;
    try { cb(currentIndex, chapters[currentIndex]); } catch { /* never let a handler break the reader */ }
  }, [currentIndex, chapters, positionReady, jumpPending]);

  // v4d — save reading position whenever it changes (after restore).
  useEffect(() => {
    if (!posKey || !positionReady || fetchingChaptersRef.current || jumpPending || pendingAnchorRef.current != null) return;
    if (pendingPageRef.current != null) {
      if (pageInChapter !== pendingPageRef.current) return;
      pendingPageRef.current = null;
    }
    try {
      const slices = currentChapterRef ? chapterSlicesRef.current[currentChapterRef.id] : null;
      const paragraphIndex = slices && slices[pageInChapter] ? slices[pageInChapter][0] : null;
      localStorage.setItem(posKey, JSON.stringify({
        chapterIndex: currentIndex,
        // the ANCHOR — survives any reflow (type size, margins, rotation, a font swap)
        paragraphIndex,
        // kept for backwards-compat with older builds reading this key
        pageInChapter,
        ts: Date.now(),
      }));
    } catch { /* silent */ }
  }, [posKey, currentIndex, pageInChapter, measuredPages, positionReady, jumpPending]);

  // Report the live marks (current chapter + bookmarks) up to the host marks bar.
  const onMarksRef = useRef(onMarks);
  onMarksRef.current = onMarks;
  useEffect(() => {
    if (!positionReady || fetchingChaptersRef.current || jumpPending) return;
    if (typeof onMarksRef.current === "function") onMarksRef.current({ currentIndex, bookmarks });
  }, [currentIndex, bookmarks, positionReady, jumpPending]);

  const flipForward = useCallback(() => {
    if (showLocked) return;
    if (flipState.phase === "flipping") return;   // one flip at a time — rapid taps can't queue skips
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
    // Don't leave this chapter until its REAL page count is known — otherwise a fast flip on a
    // freshly-entered (unmeasured, defaults-to-1) chapter skips the whole chapter, making the
    // chapter label jump erratically. Wait one frame for ChapterPage to report the count.
    if (measuredPages === undefined) return;
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
  }, [pageInChapter, currentChapterPages, measuredPages, currentIndex, latestRevealed, reducedMotion, showLocked, noLock, flipState.phase]);

  const flipBackward = useCallback(() => {
    if (flipState.phase === "flipping") return;   // one flip at a time
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
    const reachPreviousChapter = () => {
      // The chapter-change effect normally resets to page zero. Preserve this
      // deliberate backward landing until that effect and position saving settle.
      pendingPageRef.current = prevPageCount - 1;
      setCurrentIndex(i => Math.max(i - 1, 0));
      setPageInChapter(prevPageCount - 1);
    };
    if (reducedMotion) {
      reachPreviousChapter();
    } else {
      setFlipState({ phase: "flipping", dir: -1 });
      setTimeout(() => {
        reachPreviousChapter();
        setFlipState({ phase: "idle", dir: 0 });
      }, 600);
    }
  }, [pageInChapter, currentIndex, reducedMotion, showLocked, chapters, chapterPageCounts, flipState.phase]);

  // Keyboard nav
  useEffect(() => {
    const capture = e => {
      if (["ArrowRight", "ArrowLeft", "Escape"].includes(e.key)) eventOwner(e);
    };
    const onKey = (e) => {
      if (!["ArrowRight", "ArrowLeft", "Escape"].includes(e.key) || ownsModifiedKey(e)) return;
      if (!isVisibleKeySurface(readerRootRef.current)) return;
      const owner = eventOwner(e);
      if (owner.dialogs.length) return;
      // Escape still exits from our own toolbar; native editing controls and
      // controls outside this reader keep their own keyboard behaviour.
      const ownEscapeControl = e.key === "Escape" && owner.controls.every(control =>
        readerRootRef.current.contains(control) && control.matches('button,[role="button"],[data-reader-scroll-region="true"]'));
      if (owner.controls.length && !ownEscapeControl) return;
      if (e.key === "ArrowRight") { e.preventDefault(); flipForward(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); flipBackward(); }
      else if (immersive) { e.preventDefault(); setImmersive(false); }
    };
    window.addEventListener("keydown", capture, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", capture, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [flipForward, flipBackward, immersive]);

  // Touch swipe
  const controlOwnsTouch = e => {
    const owner = eventOwner(e, false);
    return owner.dialogs.length || owner.controls.some(control =>
      !control.matches('.ds-reader-tap-left,.ds-reader-tap-right,.ds-reader-center-tap,[data-reader-scroll-region="true"]'));
  };
  const onTouchStart = (e) => {
    touchStartRef.current = null;
    if (controlOwnsTouch(e)) return;
    if (!e.touches || !e.touches[0]) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || controlOwnsTouch(e) || window.getSelection()?.isCollapsed === false) return;
    const end = (e.changedTouches && e.changedTouches[0]) || null;
    if (!end) return;
    const dx = end.clientX - start.x;
    const dy = end.clientY - start.y;
    // Calmer, less twitchy: require a deliberate, clearly-horizontal swipe (was 50px / 1:1).
    // A bigger threshold + a 1.6:1 horizontal-dominance ratio stops small/diagonal drags from
    // flipping pages. The flip-in-progress guard already coalesces rapid repeats.
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      if (dx < 0) flipForward(); else flipBackward();
    }
  };

  const tapPassage = e => {
    const rect = readerRootRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    const position = (e.clientX - rect.left) / rect.width;
    if (position < 0.45) flipBackward();
    else if (position > 0.55) flipForward();
    else if (immersive) toggleChrome();
  };

  if (loading || (!positionReady && chapters.length > 0)) {
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
  const previousDisabled = !showLocked && currentIndex <= 0 && pageInChapter <= 0;
  const previousLabel = showLocked ? "Back to chapter" : pageInChapter > 0 ? "Previous page" : "Previous chapter";
  const nextLabel = !showLocked && pageInChapter < currentChapterPages - 1 ? "Next page" : "Next chapter";

  const readerBody = (
    <div
      ref={readerRootRef}
      className={[
        "ds-reader-root",
        cleanPreview ? "fw-reader-clean" : "",
        `ds-text-${textSize}`,
        immersive ? "ds-immersive" : "",
        immersive && !chromeVisible ? "ds-chrome-hidden" : "ds-chrome-visible",
        `fw-theme-${theme}`,
        `fw-font-${font}`,
        `fw-line-${line}`,
        `fw-margins-${margins}`,
      ].filter(Boolean).join(" ")}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ReaderStyles reducedMotion={reducedMotion} />
      {cleanPreview && <><CleanReaderStyles /><CleanReaderDialogStyles /></>}

      {/* Reader controls — non-immersive: series label + volume-style font + ⤢
          Immersive: a slim top bar with ← (exit immersive) + Aa volume +
          ✕ (also exits) — nothing else, "like watching a movie". */}
      {immersive ? (
        <>
          {/* Center tap zone — single tap toggles chrome (top + bottom bars).
              Sits BETWEEN the existing left/right flip zones so it doesn't
              swallow page-flip gestures. */}
          <button
            type="button"
            className="ds-reader-center-tap"
            onClick={toggleChrome}
            aria-label={chromeVisible ? "Hide reader chrome" : "Show reader chrome"}
            tabIndex={-1}
          />
          {/* Top floating bar — auto-hides after 3s. The Aa button opens the
              settings drawer (v4c). Bookmark is still a visual affordance;
              real bookmarks land in v4d alongside position persistence. */}
          <div className="ds-reader-immersive-bar" role="toolbar" aria-label="Reader controls">
            <button
              type="button"
              className="ds-reader-imm-btn"
              onClick={() => onExit ? onExit() : setImmersive(false)}
              aria-label={onExit ? "Close book" : "Exit full screen"}
              title={onExit ? "Close book" : "Exit (Esc)"}
            >
              <ArrowLeft size={18} />
            </button>
            <div className="ds-reader-imm-right">
              {onReflect && (
                <button
                  type="button"
                  className="ds-reader-imm-btn ds-reader-reflect-btn"
                  onClick={() => onReflect()}
                  aria-label="Reflect on where you are"
                  title="Reflect"
                >
                  <Feather size={19} />
                </button>
              )}
              <button
                type="button"
                className="ds-reader-imm-btn ds-reader-aa-btn"
                onClick={() => setShowSettings(true)}
                aria-label="Reader settings"
                title="Reader settings"
              >
                <span className="ds-reader-aa-glyph">Aa</span>
              </button>
              <button
                type="button"
                className={`ds-reader-imm-btn ds-reader-bookmark-btn ${isCurrentBookmarked ? "is-bookmarked" : ""}`}
                onClick={toggleBookmark}
                aria-label={isCurrentBookmarked ? "Remove bookmark" : "Bookmark this page"}
                aria-pressed={isCurrentBookmarked}
                title={isCurrentBookmarked ? "Remove bookmark" : "Bookmark"}
                disabled={!bookmarksKey}
              >
                <Bookmark size={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="ds-reader-controls" role="toolbar" aria-label="Reader controls">
          <p className="ds-reader-series-label ds-reader-series-inline">{seriesTitle}</p>
          <div className="ds-reader-controls-right">
            <FontSliderControl
              textSize={textSize}
              setSize={setSize}
              cleanPreview={cleanPreview}
            />
            {onReflect && (
              <button
                type="button"
                className="ds-reader-ctrl-btn ds-reader-ctrl-reflect"
                onClick={() => onReflect()}
                aria-label="Reflect on where you are"
                title="Reflect"
              >
                <Feather size={16} />
              </button>
            )}
            {bookmarksKey && (
              <button
                type="button"
                className="ds-reader-ctrl-btn ds-reader-ctrl-bookmark"
                onClick={toggleBookmark}
                aria-label={isCurrentBookmarked ? "Remove bookmark" : "Set your bookmark here"}
                aria-pressed={isCurrentBookmarked}
                title={isCurrentBookmarked ? "Remove bookmark" : "Set your bookmark here"}
                style={isCurrentBookmarked ? { color: "var(--accent, #BC2E27)" } : undefined}
              >
                <Bookmark size={16} fill={isCurrentBookmarked ? "currentColor" : "none"} />
              </button>
            )}
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
        aria-label={previousLabel}
        aria-disabled={previousDisabled}
        role="button"
        tabIndex={-1}
      />
      <div
        className="ds-reader-tap-right"
        onClick={flipForward}
        aria-label={nextLabel}
        aria-disabled={showLocked}
        role="button"
        tabIndex={-1}
      />

      {/* 3D stage */}
      <div className="ds-reader-stage">
        {cleanPreview && isCurrentBookmarked && !showLocked && <span className="ds-clean-bookmark-ribbon" role="status" aria-label="This page is bookmarked"><Bookmark size={14} aria-hidden="true" /></span>}
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
            onPassageTap={tapPassage}
            layoutKey={`${font}|${line}|${margins}|${cleanPreview}`}
          />
        )}
      </div>

      {/* v4c — settings drawer. Bottom sheet with text-size slider, theme
          picker (3 tiles), typeface picker (2 tiles), line spacing (3
          steps), margins (3 steps). Scrim dismisses; Esc closes. All
          changes persist immediately to localStorage. */}
      {immersive && showSettings && (
        <SettingsDrawer
          textSize={textSize}
          setSize={setSize}
          theme={theme}
          setTheme={setTheme}
          font={font}
          setFont={setFont}
          line={line}
          setLine={setLine}
          margins={margins}
          setMargins={setMargins}
          onClose={() => setShowSettings(false)}
          cleanPreview={cleanPreview}
        />
      )}

      {/* v4b — bottom progress bar (immersive only). Text-only, auto-hides
          with the rest of the chrome. Pulls the chapter context from the
          current chapter + measured pageInChapter/page-count to show
          "CHAPTER N · PAGE M OF P · ZZ%". */}
      {immersive && !showLocked && (() => {
        const ctx = currentChapter?.chapter_context;
        const totalPagesInChapter = chapterPageCounts[currentChapter?.id] || 1;
        const chapterIdx = ctx?.chapterIndex || (currentIndex + 1);
        const chapterCount = ctx?.chapterCount || chapters.length;
        // Rough whole-book progress: chapters already done + fraction of current.
        const priorPages = chapters.slice(0, currentIndex)
          .reduce((sum, c) => sum + (chapterPageCounts[c.id] || 1), 0);
        const totalPages = chapters
          .reduce((sum, c) => sum + (chapterPageCounts[c.id] || 1), 0) || 1;
        const currentGlobalPage = priorPages + pageInChapter + 1;
        const pct = Math.min(100, Math.max(0, Math.round((currentGlobalPage / totalPages) * 100)));
        return (
          <div className="ds-reader-bottom-bar" aria-live="polite">
            <span className="ds-reader-bottom-text">
              {`Chapter ${chapterIdx} of ${chapterCount}`}
              {totalPagesInChapter > 1 ? ` · Page ${pageInChapter + 1} of ${totalPagesInChapter}` : ""}
              {` · ${pct}%`}
            </span>
          </div>
        );
      })()}

      {/* Visible nav row */}
      <div className="ds-reader-nav">
        <button
          className="ds-reader-nav-btn"
          onClick={flipBackward}
          disabled={previousDisabled}
          aria-label={previousLabel}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="ds-reader-chapter-label">{chapterLabel}</span>
        <button
          className="ds-reader-nav-btn"
          onClick={flipForward}
          disabled={showLocked}
          aria-label={nextLabel}
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
function CleanReaderStyles() {
  return <style>{`
    .ds-reader-root.fw-reader-clean {
      --paper: #FFFFFF; --ink: #191510; --ink-mute: #6E6A61; --accent: #527364; --rule: #EAE7E0; --border: #EAE7E0; --reader-control: #FFFFFF;
      background: transparent; color: var(--ink); text-shadow: none;
    }
    .ds-reader-root.fw-reader-clean.fw-theme-honey { --paper: #FFFCF5; --reader-control: #FFFFFF; --ink: #191510; --ink-mute: #6E6A61; --accent: #65734F; --rule: #E7E3D9; }
    .ds-reader-root.fw-reader-clean.fw-theme-plum { --paper: #22262B; --reader-control: #30363B; --ink: #F3F4F1; --ink-mute: #BCC4C5; --accent: #B3CCBD; --rule: #4B545B; --border: #4B545B; }
    .ds-reader-root.fw-reader-clean.ds-immersive { background: var(--paper); }
    .fw-reader-clean .ds-reader-stage { background: var(--paper); color: var(--ink); border: 0; border-radius: 0; box-shadow: none; padding: 28px 20px 24px; }
    .ds-reader-root.fw-reader-clean.ds-immersive .ds-reader-stage { padding: 84px 20px 64px; }
    .fw-reader-clean .ds-reader-controls { margin: 0; padding: 12px 20px; gap: 8px; border-block: 0; border-bottom: 1px solid var(--rule); background: var(--paper); }
    .fw-reader-clean .ds-reader-series-label { color: var(--ink-mute); font-family: ui-sans-serif,system-ui,sans-serif; font-size: 13px; line-height: 1.5; font-weight: 400; text-transform: none; letter-spacing: normal; white-space: normal; overflow-wrap: anywhere; }
    .fw-reader-clean .ds-reader-controls-right { width: 100%; gap: 8px; flex-wrap: wrap; }
    .fw-reader-clean .ds-reader-slider { flex: 1 1 0; min-width: 140px; box-sizing: border-box; min-height: 44px; padding: 4px 10px; gap: 8px; background: var(--reader-control); border-color: var(--rule); }
    .fw-reader-clean .ds-reader-slider-input { min-width: 0; height: 44px; background: transparent !important; accent-color: var(--accent); }
    .fw-reader-clean .ds-reader-slider-input::-webkit-slider-runnable-track { background: var(--rule) !important; }
    .fw-reader-clean .ds-reader-slider-input::-moz-range-track { background: var(--rule) !important; }
    .fw-reader-clean .ds-reader-slider-input::-webkit-slider-thumb { background: var(--accent) !important; border-color: var(--reader-control); box-shadow: none; }
    .fw-reader-clean .ds-reader-slider-input::-moz-range-thumb { background: var(--accent) !important; border-color: var(--reader-control); box-shadow: none; }
    .fw-reader-clean .ds-reader-slider-mark { color: var(--ink); font-family: ui-sans-serif,system-ui,sans-serif; }
    .fw-reader-clean .ds-reader-ctrl-btn, .fw-reader-clean .ds-reader-nav-btn { flex-shrink: 0; min-width: 44px; width: 44px; height: 44px; padding: 0; color: var(--ink); background: var(--reader-control); border-color: var(--rule); }
    .fw-reader-clean .ds-reader-imm-btn { background: var(--reader-control); color: var(--ink); border: 1px solid var(--rule); box-shadow: none; }
    .fw-reader-clean .ds-reader-imm-btn:hover { background: var(--reader-control); color: var(--accent); border-color: var(--accent); box-shadow: none; }
    .fw-reader-clean .ds-reader-ctrl-btn[aria-pressed="true"], .fw-reader-clean .ds-reader-bookmark-btn.is-bookmarked { color: var(--accent); border-color: var(--accent); }
    .fw-reader-clean .ds-reader-chapter-strip, .fw-reader-clean .ds-reader-chapter-label, .fw-reader-clean .ds-reader-bottom-text { font-family: ui-sans-serif,system-ui,sans-serif; color: var(--ink-mute); text-shadow: none; }
    .fw-reader-clean .ds-reader-h1 { font-family: ${READING.fontStack}; color: var(--ink); text-shadow: none; overflow-wrap: anywhere; }
    .fw-reader-clean .ds-reader-nav { margin-top: 0; padding: 12px 20px; border-top: 1px solid var(--rule); background: var(--paper); }
    .fw-reader-clean .ds-reader-dnd-tip { background: var(--reader-control); color: var(--ink); border: 1px solid var(--rule); }
    .fw-reader-clean .ds-reader-dnd-dismiss { min-width: 44px; min-height: 44px; background: var(--reader-control); color: var(--accent); font-family: ui-sans-serif,system-ui,sans-serif; }
    .fw-reader-clean .ds-reader-lock { border-radius: 0; background: var(--paper); border-block: 1px solid var(--rule); }
    .fw-reader-clean .ds-reader-lock-eyebrow, .fw-reader-clean .ds-reader-lock-teaser, .fw-reader-clean .ds-reader-lock-countdown, .fw-reader-clean .ds-reader-lock-sub { color: var(--ink); text-shadow: none; }
    .fw-reader-clean .ds-reader-lock-curl { color: var(--ink-mute); }
    .fw-reader-clean .ds-reader-sheet { background: #FFFFFF; color: #191510; --paper: #FFFFFF; --ink: #191510; --ink-mute: #6E6A61; --accent: #527364; --rule: #EAE7E0; height: min(70dvh, 620px); max-height: calc(100dvh - 24px); padding-bottom: env(safe-area-inset-bottom); box-sizing: border-box; }
    .fw-reader-clean .ds-reader-sheet-content { padding: 12px 20px 28px; scroll-padding-bottom: 28px; }
    .fw-reader-clean .ds-reader-sheet-label { font-family: ui-sans-serif,system-ui,sans-serif; color: #6E6A61; }
    .fw-reader-clean .ds-reader-sheet-handle { width: auto; height: auto; min-height: 44px; padding: 0 16px; margin: 10px 20px 0 auto; border: 1px solid #EAE7E0; background: #FFFFFF; color: #191510; font: 600 13px/1.4 ui-sans-serif,system-ui,sans-serif; }
    .fw-reader-clean .ds-reader-pill, .fw-reader-clean .ds-reader-tile { font-family: ui-sans-serif,system-ui,sans-serif; min-height: 44px; }
    .fw-reader-clean .ds-reader-tile-theme.fw-theme-cream { background: #FFFFFF; }
    .fw-reader-clean .ds-reader-tile-theme.fw-theme-honey { background: #FFFCF5; }
    .fw-reader-clean .ds-reader-tile-theme.fw-theme-plum { background: #22262B; color: #F3F4F1; }
    .fw-reader-clean .ds-reader-tile-theme.fw-theme-plum .ds-reader-tile-label { color: #F3F4F1; }
    .fw-reader-clean :is(button,input,a):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
    .ds-clean-bookmark-ribbon { position: absolute; right: 20px; top: 0; width: 24px; height: 36px; display: flex; justify-content: center; padding-top: 6px; background: var(--accent); color: var(--paper); clip-path: polygon(0 0,100% 0,100% 100%,50% 78%,0 100%); pointer-events: none; }
  `}</style>;
}

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
      /* Real Fraunces is NOT imported: 'Fraunces' is an app-wide alias remapped to
         Cormorant (size-adjusted) in index.css. Importing real Fraunces here would
         override that remap and render off-palette Fraunces. Palette = Ephesis + Cormorant. */

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
        background: var(--paper, #ECE7DA);
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        /* theme defaults — CREAM (the brand paper world: §2 tokens, oxblood accent) */
        --paper: #ECE7DA;
        --ink: #0B0805;
        --ink-mute: #2E261B;
        --accent: #7A1A12;
        --rule: rgba(58,44,26,0.14);
      }
      /* Theme overrides (applied via root class fw-theme-honey / -plum) — on-brand alternates */
      .ds-reader-root.ds-immersive.fw-theme-honey {
        --paper: #F4EFE3; --ink: #0B0805; --ink-mute: #2E261B;
        --accent: #A8893F; --rule: rgba(58,44,26,0.14);
      }
      .ds-reader-root.ds-immersive.fw-theme-plum {
        --paper: #2E261B; --ink: #F4EFE3; --ink-mute: #D8CFBC;
        --accent: #E8B4B8; --rule: rgba(244,239,227,0.14);
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
        color: var(--ink, #0B0805);
      }
      @media (max-width: 768px) {
        .ds-reader-root.ds-immersive .ds-reader-stage {
          padding: 56px 24px 40px;
        }
      }
      /* Visible body inside the stage uses --ink for prose; clipped so a
         miscount can't overflow. */
      .ds-reader-root.ds-immersive .ds-reader-body { overflow: hidden; }
      /* The rare page holding one paragraph taller than the screen: let it scroll rather than
         clip her words. Never reached for normal prose. */
      .ds-reader-body.ds-body-scroll,
      .ds-reader-root.ds-immersive .ds-reader-body.ds-body-scroll { overflow-y: auto; -webkit-overflow-scrolling: touch; }
      .ds-reader-root.ds-immersive .ds-reader-p { color: var(--ink, #0B0805); }
      .ds-reader-root.ds-immersive .ds-reader-h1 { color: var(--ink, #0B0805); }
      .ds-reader-root.ds-immersive .ds-reader-p-first::first-letter {
        color: var(--accent, #7A1A12);
      }
      .ds-reader-root.ds-immersive .ds-reader-ornament { color: var(--accent, #7A1A12); }
      .ds-reader-root.ds-immersive .ds-reader-chapter-strip {
        color: var(--ink-mute, #2E261B);
      }
      /* In immersive, the inline series label is irrelevant — the bar
         carries identity. Hide it so the page is unambiguously the page. */
      .ds-reader-root.ds-immersive .ds-reader-series-inline { display: none; }
      /* The bottom Prev / Next chevron row is also redundant; tap zones
         handle navigation. Hide it. v4b reintroduces a minimal floating
         progress bar at the bottom. */
      .ds-reader-root.ds-immersive .ds-reader-nav { display: none; }
      /* Lift the top control bar so it floats over the page rather than
         pushing the stage down. v4b: auto-hides with chrome state. */
      .ds-reader-root.ds-immersive .ds-reader-immersive-bar {
        position: absolute;
        top: 0; left: 0; right: 0;
        margin: 0;
        padding: 14px 20px 18px;
        min-height: 72px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(to bottom, var(--paper, #ECE7DA) 60%, rgba(255,250,245,0) 100%);
        /* Visible controls must receive taps above the page-turn overlays. */
        z-index: 20;
        transition: opacity 200ms ease, transform 200ms ease;
      }
      .ds-reader-root.ds-immersive.ds-chrome-hidden .ds-reader-immersive-bar {
        opacity: 0;
        transform: translateY(-12px);
        pointer-events: none;
      }
      .ds-reader-root.ds-immersive.ds-chrome-visible .ds-reader-immersive-bar {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      /* v4b — bottom progress bar: Inter 11px text-only, gradient fade. */
      .ds-reader-bottom-bar {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 40px;
        padding: 0 16px;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(to top, var(--paper, #ECE7DA) 0%, rgba(255,250,245,0) 100%);
        z-index: 4;
        transition: opacity 200ms ease, transform 200ms ease;
        pointer-events: none;
      }
      .ds-reader-bottom-text {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink-mute, #2E261B);
        white-space: nowrap;
      }
      .ds-reader-root.ds-chrome-hidden .ds-reader-bottom-bar {
        opacity: 0;
        transform: translateY(12px);
      }
      .ds-reader-root.ds-chrome-visible .ds-reader-bottom-bar {
        opacity: 1;
        transform: translateY(0);
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-reader-root.ds-immersive .ds-reader-immersive-bar,
        .ds-reader-bottom-bar {
          transition: none;
        }
      }

      /* Center tap zone — toggles chrome. Sits inside the central column,
         spans the height between the floating bars. Width is the central
         60% so left/right edges still flip pages. */
      .ds-reader-center-tap {
        position: absolute;
        top: 60px; bottom: 50px;
        left: 20%; right: 20%;
        background: transparent;
        border: none;
        cursor: pointer;
        z-index: 1;
      }
      .ds-reader-center-tap:focus { outline: none; }

      /* Bookmark button — sits inside the immersive-bar right side. */
      .ds-reader-bookmark-btn { color: var(--ink-mute, #2E261B); }
      .ds-reader-bookmark-btn:hover { color: var(--accent, #7A1A12); }

      /* v4c — right-side cluster (Aa + Bookmark) — gap matches button size */
      .ds-reader-imm-right { display: inline-flex; align-items: center; gap: 10px; }
      .ds-reader-aa-btn { font-family: 'Fraunces', Georgia, serif; }
      .ds-reader-aa-glyph {
        font-weight: 500;
        font-size: 22px;
        line-height: 1;
        color: currentColor;
        display: inline-block;
      }
      .ds-reader-aa-glyph::first-letter { font-size: 0.62em; vertical-align: 6px; }
      /* The bookmark icon inside the chunky pill follows currentColor too. */
      .ds-reader-bookmark-btn { color: currentColor; }
      .ds-reader-bookmark-btn.is-bookmarked { color: var(--accent, #7A1A12); }
      .ds-reader-bookmark-btn.is-bookmarked svg { fill: var(--accent, #7A1A12); }

      /* v4c — settings drawer (60vh bottom sheet) */
      .ds-reader-scrim {
        position: fixed;
        inset: 0;
        background: rgba(74, 42, 58, 0.30);
        backdrop-filter: blur(2px);
        z-index: 10000;
        animation: ds-scrim-in 180ms ease both;
      }
      @keyframes ds-scrim-in { from { opacity: 0; } to { opacity: 1; } }
      .ds-reader-sheet {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        max-width: 560px;
        margin: 0 auto;
        height: 60vh;
        max-height: 560px;
        background: var(--paper, #ECE7DA);
        color: var(--ink, #0B0805);
        border-radius: 24px 24px 0 0;
        box-shadow: 0 -8px 32px rgba(74,42,58,0.18);
        z-index: 10001;
        display: flex;
        flex-direction: column;
        animation: ds-sheet-in 240ms cubic-bezier(0.32, 0.72, 0.24, 1) both;
      }
      @keyframes ds-sheet-in {
        from { transform: translateY(100%); }
        to   { transform: translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-reader-scrim, .ds-reader-sheet { animation: none; }
      }
      .ds-reader-sheet-handle {
        align-self: center;
        margin: 10px 0 6px;
        width: 36px;
        height: 4px;
        border-radius: 9999px;
        background: var(--rule, rgba(74,42,58,0.16));
        border: none;
        cursor: pointer;
        padding: 0;
      }
      .ds-reader-sheet-content {
        padding: 14px 24px 24px;
        overflow-y: auto;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
      }
      .ds-reader-sheet-section {
        margin-bottom: 22px;
      }
      .ds-reader-sheet-section:last-child { margin-bottom: 8px; }
      .ds-reader-sheet-label {
        font-family: 'Fraunces', Georgia, serif;
        font-style: italic;
        font-weight: 500;
        font-size: 13px;
        color: var(--ink-mute, #2E261B);
        margin: 0 0 10px;
      }

      /* Tile rows for theme + typeface */
      .ds-reader-tile-row { display: flex; gap: 10px; }
      .ds-reader-tile {
        flex: 1;
        min-height: 88px;
        border-radius: 14px;
        border: 1px solid var(--rule, rgba(74,42,58,0.16));
        background: var(--paper, #ECE7DA);
        color: var(--ink, #0B0805);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px;
        transition: outline-offset 120ms, transform 120ms;
        outline: 2px solid transparent;
        outline-offset: -2px;
      }
      .ds-reader-tile.is-selected {
        outline-color: var(--accent, #7A1A12);
        outline-width: 2px;
      }
      .ds-reader-tile:hover:not(.is-selected) { transform: translateY(-1px); }
      .ds-reader-tile-aa {
        font-family: 'Fraunces', Georgia, serif;
        font-size: 28px;
        line-height: 1;
        font-weight: 500;
      }
      .ds-reader-tile-font.fw-font-inter .ds-reader-tile-aa { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }
      .ds-reader-tile-label {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        letter-spacing: 0.04em;
        color: var(--ink-mute, #2E261B);
      }

      /* Pill rows for line spacing + margins */
      .ds-reader-pill-row { display: flex; gap: 8px; }
      .ds-reader-pill {
        flex: 1;
        padding: 10px 12px;
        border-radius: 9999px;
        border: 1px solid var(--rule, rgba(74,42,58,0.16));
        background: var(--paper, #ECE7DA);
        color: var(--ink, #0B0805);
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 500;
      }
      .ds-reader-pill.is-selected {
        background: var(--accent, #7A1A12);
        color: #F4EFE3;
        border-color: var(--accent, #7A1A12);
      }

      /* Variant: the slider lives inside the sheet too — match the paper bg */
      .ds-reader-slider.is-sheet {
        background: transparent;
        border-color: var(--rule, rgba(74,42,58,0.16));
        width: 100%;
      }

      /* v4c — typeface override. When user picks Inter, body paragraphs use
         Inter; the h1 and drop-cap stay Fraunces (per Atelier). */
      .fw-font-inter .ds-reader-p { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; }

      /* v4c — line-spacing override. Multiplies the per-size line-height. */
      .fw-line-tight   .ds-reader-p { line-height: 1.55 !important; }
      .fw-line-normal  .ds-reader-p { /* default */ }
      .fw-line-relaxed .ds-reader-p { line-height: 1.95 !important; }

      /* v4c — margins override (changes the reading column max-width in
         immersive mode only — the inline non-immersive reader keeps 880). */
      .fw-margins-narrow.ds-immersive  .ds-reader-stage { max-width: 480px; }
      .fw-margins-normal.ds-immersive  .ds-reader-stage { /* default 580px */ }
      .fw-margins-wide.ds-immersive    .ds-reader-stage { max-width: 680px; }
      /* Make sure the stage starts below the top bar visually. */
      .ds-reader-root.ds-immersive .ds-reader-stage {
        padding-top: max(72px, 64px);
      }
      @media (max-width: 768px) {
        .ds-reader-root.ds-immersive .ds-reader-stage { padding-top: 64px; }
      }

      /* Control bar — series label inline + volume-style font + fullscreen */
      .ds-reader-controls {
        /* Wrapped inline controls must receive taps above the page-turn zones. */
        position: relative;
        z-index: 20;
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
        background: var(--paper, #ECE7DA);
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: var(--ink-mute, #2E261B);
        border-radius: 9999px;
        cursor: pointer;
        transition: background 120ms, color 120ms;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .ds-reader-ctrl-btn:hover { color: var(--ink, #0B0805); }
      .ds-reader-ctrl-fullscreen { font-size: 14px; }

      /* True range-slider font control — small A · [thumb on track] · big A */
      .ds-reader-slider {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: var(--paper, #ECE7DA);
        border: 1px solid var(--border, #EDE8E4);
        border-radius: 9999px;
        padding: 4px 12px;
        min-width: 180px;
      }
      .ds-reader-slider-mark {
        font-family: 'Fraunces', Georgia, serif;
        color: var(--ink-mute, #2E261B);
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
        background: var(--accent, #7A1A12);
        border: 2px solid var(--paper, #ECE7DA);
        box-shadow: 0 1px 3px rgba(58,44,26,0.25);
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
        background: var(--accent, #7A1A12);
        border: 2px solid var(--paper, #ECE7DA);
        box-shadow: 0 1px 3px rgba(58,44,26,0.25);
        cursor: pointer;
      }
      .ds-reader-slider.is-immersive {
        background: rgba(255,255,255,0.85);
        backdrop-filter: blur(8px);
      }

      /* Hidden measuring layer.
         🔴 THE BUG (fixed 2026-07-16): this was capped at max-width:720px while the REAL
         reading column is 580px (480/680 on the narrow/wide margin settings). Width is THE
         determinant of measured text height, so the mirror measured every paragraph in a
         column ~24% wider than it renders → it under-counted lines → the slicer packed too
         many paragraphs onto a page → the last one overflowed a hard-clipped body. That is
         exactly the "cut off last line" symptom.
         It must inherit the page's real width (left:0/right:0, NO max-width of its own), so
         it measures what actually renders. visibility:hidden is deliberate — display:none
         generates no boxes, so there would be nothing to measure. */
      .ds-reader-measure {
        position: absolute;
        top: 0; left: 0; right: 0;
        visibility: hidden;
        pointer-events: none;
        opacity: 0;
        margin: 0;
        padding: 0;
      }

      /* Immersive top bar — minimal: ← Aa-volume ✕ */
      .ds-reader-immersive-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 4px;
        margin: 0 0 14px;
      }
      /* v4d — chunky high-contrast pills. Reading-app buttons should never
         blend into the paper. 48×48 hit target (above WCAG/Apple HIG),
         solid paper background, ink-coloured border + glyph, soft shadow
         for lift. Active state scales down for tactile feedback. */
      .ds-reader-imm-btn {
        width: 48px; height: 48px;
        border-radius: 9999px;
        border: 1.5px solid var(--ink, #0B0805);
        background: var(--paper, #ECE7DA);
        color: var(--ink, #0B0805);
        cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 10px rgba(74,42,58,0.18);
        transition: background 120ms, color 120ms, transform 120ms, box-shadow 120ms;
      }
      .ds-reader-imm-btn:hover {
        background: var(--accent, #7A1A12);
        color: var(--paper, #ECE7DA);
        border-color: var(--accent, #7A1A12);
        box-shadow: 0 4px 14px rgba(212,94,82,0.30);
      }
      .ds-reader-imm-btn:active { transform: scale(0.94); }
      .ds-reader-imm-btn:focus-visible {
        outline: 3px solid var(--accent, #7A1A12);
        outline-offset: 2px;
      }
      /* Dark theme — flip the chip to ink-on-paper so it pops on plum */
      .fw-theme-plum .ds-reader-imm-btn {
        background: var(--ink, #F4EFE3);
        color: var(--paper, #2E261B);
        border-color: var(--ink, #F4EFE3);
      }
      .fw-theme-plum .ds-reader-imm-btn:hover {
        background: var(--accent, #E8B4B8);
        color: var(--paper, #2E261B);
        border-color: var(--accent, #E8B4B8);
      }
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
        color: var(--ink, #0B0805);
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
        background: var(--accent, #7A1A12);
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
        color: var(--ink-mute, #2E261B);
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
        color: var(--ink-mute, #2E261B);
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
        background: var(--paper, #ECE7DA);
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
        /* Absolute measurement uses this same padded prose column in every consumer. */
        position: relative;
        height: 100%;
      }
      [data-reader-scroll-region="true"] { position: relative; z-index: 11; overscroll-behavior: contain; touch-action: pan-y; }
      [data-reader-scroll-region="true"]:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

      .ds-reader-h1 {
        font-family: 'Fraunces', 'Fraunces', Georgia, serif;
        font-size: clamp(18px, 4vw, 22px);
        font-weight: 500;
        color: var(--ink, #0B0805);
        letter-spacing: -0.01em;
        line-height: 1.3;
        margin: 0 0 10px;
        text-align: center;
      }

      .ds-reader-ornament {
        text-align: center;
        color: var(--accent, #7A1A12);
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

      /* §6.7.8 — the UN-ADJUSTED stack. This used 'Fraunces', but src/index.css remaps BOTH
         'Fraunces' and 'Inter' at size-adjust:150%, so every size here rendered 1.5x its
         nominal px: the 18px default was really ~27px → ~29 characters per line (XL was ~22).
         That is the whole reason this reader read too big and broke pages oddly. On the
         un-adjusted stack a size means what it says, and the pagination measures what it
         renders. Sizes come from the ONE standard (READING.scale). */
      .ds-reader-p {
        font-family: ${READING.fontStack};
        font-size: ${READING.scale.m}px;
        color: var(--ink, #0B0805);
        line-height: 1.7;
        margin: 0 0 18px;
      }

      /* Text-size variants — absolute px, re-baselined for the un-adjusted face.
         xs is the absolute floor (16px): we never shrink type to buy characters. */
      .ds-text-xs .ds-reader-p { font-size: ${READING.scale.xs}px; line-height: 1.65; margin: 0 0 14px; }
      .ds-text-s  .ds-reader-p { font-size: ${READING.scale.s}px;  line-height: 1.68; margin: 0 0 16px; }
      .ds-text-m  .ds-reader-p { font-size: ${READING.scale.m}px;  line-height: 1.70; margin: 0 0 18px; }
      .ds-text-l  .ds-reader-p { font-size: ${READING.scale.l}px;  line-height: 1.76; margin: 0 0 20px; }
      .ds-text-xl .ds-reader-p { font-size: ${READING.scale.xl}px; line-height: 1.80; margin: 0 0 22px; }

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
        color: var(--accent, #7A1A12);
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
        color: var(--ink-mute, #2E261B);
        font-style: italic;
        text-align: right;
        margin-top: 8px;
      }

      .ds-reader-footer-label {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        color: var(--ink-mute, #2E261B);
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
      .ds-reader-dot-current { background: var(--accent, #7A1A12); width: 10px; border-radius: 3px; }
      .ds-reader-dot-future  { background: var(--border, #EDE8E4); }

      /* Locked screen */
      .ds-reader-lock {
        min-height: 460px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: linear-gradient(160deg, #2E261B 0%, #1A140D 100%);
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
        color: var(--accent, #7A1A12);
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
        background: var(--paper, #ECE7DA);
        color: var(--ink, #0B0805);
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
        color: var(--ink-mute, #2E261B);
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
        border-top-color: var(--accent, #7A1A12);
        border-radius: 50%;
        animation: ds-spin 0.7s linear infinite;
      }
      @keyframes ds-spin { to { transform: rotate(360deg); } }
      .ds-reader-loading-text {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: var(--ink-mute, #2E261B);
      }

      .ds-reader-empty {
        text-align: center;
        padding: 60px 24px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: var(--ink-mute, #2E261B);
      }

      ${flipAnim}
    `}</style>
  );
}

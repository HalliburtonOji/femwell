// SwipeMonths — a WHOLE-CARD month carousel that mirrors the app's card sliders
// (ClipboardSlider / CardDeck, BRAND_IDENTITY §6.10): native CSS scroll-snap, so the
// ENTIRE month card slides horizontally — current card slides off one side as the next
// month's whole card slides in from the other. Compositor-driven (60fps, transform-free),
// finger-tracked, crisp snap — no framer JS animation, no lag, no clunk.
//
// Infinite paging via a 3-card WINDOW: we render [prev · current · next] full cards, keep
// the view centered on the middle (current). A swipe/arrow that settles on a neighbour
// commits the month change and RE-CENTERS to the middle instantly (in a layout effect,
// before paint) — the middle card now holds the month you moved to, so it's seamless.
//
// `render(monthDate)` returns the WHOLE card for that month. Arrows call controlsRef.
import { useEffect, useLayoutEffect, useRef } from "react";
import { addMonths } from "date-fns";

const reduceMotion = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

export default function SwipeMonths({ month, onChange, render, controlsRef }) {
  const trackRef = useRef(null);
  const idleRef = useRef(null);       // scroll-idle debounce
  const committingRef = useRef(false); // guard against double-commit during recenter

  // center on the MIDDLE (current) card on mount and after every month change — before
  // paint, so the recenter is invisible (no flash).
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    committingRef.current = true;
    el.scrollLeft = el.clientWidth; // middle of 3 full-width cards
    // release the guard on the next frame, after the browser has applied scrollLeft
    const id = requestAnimationFrame(() => { committingRef.current = false; });
    return () => cancelAnimationFrame(id);
  }, [month]);

  // when the horizontal scroll settles on a neighbour, commit the month + recenter.
  const onScroll = () => {
    const el = trackRef.current;
    if (!el || committingRef.current) return;
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => {
      const node = trackRef.current;
      if (!node || committingRef.current) return;
      const w = node.clientWidth || 1;
      const idx = Math.round(node.scrollLeft / w); // 0 prev · 1 current · 2 next
      if (idx === 1) return;
      const dir = idx === 2 ? 1 : -1;
      committingRef.current = true; // block re-entry until the layout effect recenters
      onChange(addMonths(month, dir));
    }, 90);
  };

  useEffect(() => () => { if (idleRef.current) clearTimeout(idleRef.current); }, []);

  // arrows → scroll to the neighbour; onScroll settles + commits (smooth, or instant for reduced-motion)
  const go = (dir) => {
    const el = trackRef.current;
    if (!el || committingRef.current) return;
    el.scrollTo({ left: el.clientWidth * (1 + dir), behavior: reduceMotion() ? "auto" : "smooth" });
  };
  if (controlsRef) controlsRef.current = { prev: () => go(-1), next: () => go(1) };

  const prev = addMonths(month, -1);
  const next = addMonths(month, 1);
  const cell = { flex: "0 0 100%", width: "100%", minWidth: 0, boxSizing: "border-box", scrollSnapAlign: "center" };
  return (
    <div
      ref={trackRef}
      onScroll={onScroll}
      className="fw-month-track"
      style={{
        display: "flex",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        overscrollBehaviorX: "contain",   // don't chain the horizontal scroll into a parent sheet
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}
    >
      <style>{`.fw-month-track::-webkit-scrollbar{display:none}`}</style>
      <div style={cell} aria-hidden>{render(prev)}</div>
      <div style={cell}>{render(month)}</div>
      <div style={cell} aria-hidden>{render(next)}</div>
    </div>
  );
}

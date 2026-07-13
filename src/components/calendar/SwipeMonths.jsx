// SwipeMonths — a real horizontal month carousel (the app's card-slider feel).
//
// WHY the old approach was clunky: it constrained the drag to snap back to 0, then
// committed the month change and played a SEPARATE AnimatePresence enter animation —
// so you felt a rubber-band-back followed by a delayed fade-in, not a slide. It also
// remounted the grid (a `key` change) each switch → a heavy re-render mid-animation.
//
// THIS: a windowed 3-up track (prev · current · next) whose x is a `useMotionValue`
// (no React re-render per drag frame — the DOM transform updates directly). The drag
// tracks the finger; on release it settles to the neighbour with a crisp spring
// (~250ms), THEN commits the month and recenters instantly. Current slides out as the
// next slides in — real depth. Arrows call the same slide.
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { addMonths } from "date-fns";

const SETTLE = { type: "spring", stiffness: 460, damping: 40 };
const SNAP = { type: "spring", stiffness: 520, damping: 42 };

export default function SwipeMonths({ month, onChange, render, controlsRef, gap = 0 }) {
  const wrapRef = useRef(null);
  const [w, setW] = useState(0);
  const x = useMotionValue(0);
  const busy = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setW(el.offsetWidth || 0);
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(el);
    else if (typeof window !== "undefined") window.addEventListener("resize", measure);
    return () => { if (ro) ro.disconnect(); else if (typeof window !== "undefined") window.removeEventListener("resize", measure); };
  }, []);

  // slide to a neighbour (dir: -1 prev, +1 next), then commit + recenter instantly.
  const slide = (dir) => {
    if (dir === 0) { animate(x, 0, SNAP); return; }
    if (busy.current || !w) { animate(x, 0, SNAP); return; }
    busy.current = true;
    animate(x, dir > 0 ? -w : w, {
      ...SETTLE,
      onComplete: () => { onChange(addMonths(month, dir)); x.set(0); busy.current = false; },
    });
  };

  // expose prev/next to the parent's ‹ › arrows (fresh closure each render)
  if (controlsRef) controlsRef.current = { prev: () => slide(-1), next: () => slide(1) };

  const onDragEnd = (_e, info) => {
    const off = info.offset.x, vel = info.velocity.x;
    if (off < -w * 0.24 || vel < -420) slide(1);
    else if (off > w * 0.24 || vel > 420) slide(-1);
    else animate(x, 0, SNAP);
  };

  const prev = addMonths(month, -1);
  const next = addMonths(month, 1);
  return (
    <div ref={wrapRef} style={{ position: "relative", overflow: "hidden", touchAction: "pan-y" }}>
      <motion.div
        drag="x"
        style={{ x }}
        dragElastic={0.05}
        dragConstraints={{ left: -w, right: w }}
        dragMomentum={false}
        onDragEnd={onDragEnd}
      >
        {/* prev — parked just to the LEFT (its right edge at the container's left edge) */}
        <div aria-hidden style={{ position: "absolute", top: 0, right: "100%", width: "100%", paddingRight: gap }}>{render(prev)}</div>
        {/* current — in normal flow, so it defines the height */}
        <div>{render(month)}</div>
        {/* next — parked just to the RIGHT */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: "100%", width: "100%", paddingLeft: gap }}>{render(next)}</div>
      </motion.div>
    </div>
  );
}

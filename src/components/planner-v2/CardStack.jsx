// CardStack — physical-deck slider used by every horizontal Planner row.
//
// Replaces the prior scroll-snap track. Cards are absolutely positioned;
// the active one sits on top at full size, and 1–2 cards behind peek
// out from below offset by translateY + scale to read as a deck.
//
// Interaction model:
//   - Tap the top card → it slides up + fades, then the next card becomes
//     active. 280ms animation, cubic-bezier(0.16,1,0.3,1).
//   - Swipe up on the top card → same as tap.
//   - Left/right arrows in the row header — kept for accessibility +
//     keyboard navigation.
//   - Dot indicators under the row show position in the stack.
//
// Depth visuals:
//   - Top (depth 0): scale 1.00, translateY 0, opacity 1.00,
//                    shadow 0 8px 32px rgba(58,44,26,0.22)
//                          + 0 2px 8px (0.12)
//   - Depth 1:       scale 0.96, translateY 8px, opacity 0.85,
//                    shadow 0 4px 16px (0.14)
//   - Depth 2:       scale 0.92, translateY 14px, opacity 0.65,
//                    shadow 0 2px 8px (0.08)
//   - Depth 3+:      hidden (not rendered)
//
// The container background sits on cream-dark (#EDE6D5) so the scaled-
// down back cards reveal a hairline of that "paper underneath" colour
// at the bottom and along the sides.

import React, { Children, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const C = {
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  dotIdle:  "#D4C9B4",
};

// Horizontal deck: top card sits flush, deeper cards shift to the RIGHT
// so you see their right edge peeking from behind the front card. No
// vertical offset — Halli specifically wants a fanned-out hand of cards
// look, not a downward stack.
//
// `left` is an extra horizontal nudge that makes the deeper cards
// progressively narrower-on-the-left as well, so the back cards' left
// edges sit slightly inset (the visual reads as a sliver to the right
// of the front card without the back card's left edge poking out under
// the front card's left edge).
const DEPTH_STYLE = [
  // depth 0 — active card on top
  {
    left: 0,
    transform: "translateX(0) scale(1)",
    opacity: 1,
    boxShadow:
      "0 8px 32px rgba(58,44,26,0.22), 0 2px 8px rgba(58,44,26,0.10), 0 -1px 0 rgba(212,175,55,0.22), inset 0 1px 0 rgba(255,255,255,0.7)",
    zIndex: 3,
    cursor: "pointer",
    pointerEvents: "auto",
  },
  // depth 1 — peeks from RIGHT edge of card 1
  {
    left: 12,
    transform: "translateX(28px) scale(0.97)",
    opacity: 0.85,
    boxShadow:
      "0 4px 16px rgba(58,44,26,0.14), inset 0 1px 0 rgba(255,255,255,0.5)",
    zIndex: 2,
    cursor: "default",
    pointerEvents: "none",
  },
  // depth 2 — peeks from behind card 2
  {
    left: 20,
    transform: "translateX(48px) scale(0.94)",
    opacity: 0.65,
    boxShadow:
      "0 2px 8px rgba(58,44,26,0.08), inset 0 1px 0 rgba(255,255,255,0.4)",
    zIndex: 1,
    cursor: "default",
    pointerEvents: "none",
  },
];

export default function CardStack({
  label,
  showHeader = true,
  children,
}) {
  const childArray = Children.toArray(children).filter(Boolean);
  const count = childArray.length;
  const [idx, setIdx] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const wasSwipeRef = useRef(false);

  function advance() {
    if (leaving || count < 2) return;
    setLeaving(true);
    // Animate-out duration must match plannerStackLeave below.
    window.setTimeout(() => {
      setIdx((i) => (i + 1) % count);
      setLeaving(false);
    }, 280);
  }
  function back() {
    if (leaving || count < 2) return;
    setIdx((i) => (i - 1 + count) % count);
  }
  function jumpTo(target) {
    if (leaving || count < 2) return;
    setIdx(((target % count) + count) % count);
  }

  function onTouchStart(e) {
    touchStartXRef.current = e.touches[0]?.clientX ?? 0;
    touchStartYRef.current = e.touches[0]?.clientY ?? 0;
    wasSwipeRef.current = false;
  }
  function onTouchMove(e) {
    const x = e.touches[0]?.clientX ?? 0;
    const y = e.touches[0]?.clientY ?? 0;
    if (Math.abs(touchStartXRef.current - x) > 8 || Math.abs(touchStartYRef.current - y) > 8) {
      wasSwipeRef.current = true;
    }
  }
  function onTouchEnd(e) {
    const endX = e.changedTouches?.[0]?.clientX ?? 0;
    const endY = e.changedTouches?.[0]?.clientY ?? 0;
    const dx = touchStartXRef.current - endX;
    const dy = touchStartYRef.current - endY;
    // Advance on a leftward swipe (positive dx) that is predominantly
    // horizontal. The horizontal predominance check keeps a downward
    // page scroll from accidentally dismissing a card.
    if (wasSwipeRef.current && dx > 50 && Math.abs(dx) > Math.abs(dy)) {
      advance();
    }
  }
  function onTopClick() {
    // If the user just finished a swipe, the touch handler already
    // dispatched advance(); the trailing synthetic click should no-op.
    if (wasSwipeRef.current) {
      wasSwipeRef.current = false;
      return;
    }
    advance();
  }

  return (
    <section style={rowShell} aria-label={label || "row"}>
      {showHeader && (label || count > 1) && (
        <div style={rowHead}>
          <span style={kicker}>{label ? label.toUpperCase() : ""}</span>
          {count > 1 && (
            <div style={rowNav}>
              <button
                type="button"
                onClick={back}
                aria-label="Previous"
                style={rowArrow}
              ><ChevronLeft size={14} /></button>
              {Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to card ${i + 1}`}
                  onClick={() => jumpTo(i)}
                  style={{
                    width: 6, height: 6, borderRadius: 9999,
                    background: i === idx ? C.gold : C.dotIdle,
                    border: "none", padding: 0,
                    transform: i === idx ? "scale(1.25)" : "scale(1)",
                    transition: "background 200ms ease, transform 200ms ease",
                    cursor: "pointer",
                  }}
                />
              ))}
              <button
                type="button"
                onClick={advance}
                aria-label="Next"
                style={rowArrow}
              ><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      )}

      {/* Stack container — paperback paper tone behind the cards lets
          the scaled-back cards' edges read as a physical deck. */}
      <div style={stackBox}>
        {childArray.map((child, i) => {
          const depth = (i - idx + count) % count;
          if (depth > 2) return null;
          const isTop = depth === 0;

          // The TOP card uses position:relative so it sizes the stack
          // container naturally. Deeper cards layer absolutely behind
          // it (anchored at top:0), shifted right via translateX so
          // their right edge peeks out from under the front card.
          // Width is consistent across the deck: calc(100% - 40px) on
          // every card so the deeper ones don't overflow when shifted.
          const positionStyle = isTop
            ? { position: "relative", width: "calc(100% - 40px)" }
            : { position: "absolute", top: 0, right: "auto", width: "calc(100% - 40px)" };

          const isLeavingTop = isTop && leaving;

          return (
            <div
              key={i}
              style={{
                ...positionStyle,
                ...DEPTH_STYLE[depth],
                borderRadius: 20,
                transition: leaving
                  ? "none"
                  : "transform 320ms cubic-bezier(0.16,1,0.3,1), opacity 320ms ease, box-shadow 320ms ease",
                willChange: "transform, opacity",
                ...(isLeavingTop
                  ? { animation: "plannerStackLeave 280ms cubic-bezier(0.16,1,0.3,1) forwards" }
                  : {}),
              }}
              onClick={isTop ? onTopClick : undefined}
              onTouchStart={isTop ? onTouchStart : undefined}
              onTouchMove={isTop ? onTouchMove : undefined}
              onTouchEnd={isTop ? onTouchEnd : undefined}
              aria-hidden={!isTop}
              role={isTop ? "button" : undefined}
              tabIndex={isTop ? 0 : -1}
              onKeyDown={isTop ? (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advance(); }
                if (e.key === "ArrowRight") { e.preventDefault(); advance(); }
                if (e.key === "ArrowLeft")  { e.preventDefault(); back(); }
              } : undefined}
            >
              {child}
            </div>
          );
        })}
      </div>

      {/* Keyframe is scoped here so each stack carries its own animation
          definition; styles cost is negligible vs hoisting to global. */}
      <style>{`
        @keyframes plannerStackLeave {
          0%   { transform: translateX(0)      scale(1);    opacity: 1; }
          100% { transform: translateX(-140%)  scale(0.94); opacity: 0; }
        }
      `}</style>
    </section>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const rowShell = { marginBottom: 18 };
const rowHead = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 16px", marginBottom: 8,
};
const kicker = {
  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
  color: C.muted, fontWeight: 700,
  fontFamily: "'Inter', sans-serif",
};
const rowNav = { display: "flex", alignItems: "center", gap: 5 };
const rowArrow = {
  width: 22, height: 22, borderRadius: 9999,
  background: "transparent", border: "none", color: C.muted, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};
const stackBox = {
  // Cream-dark backdrop so the scaled-back peek reads as "paper
  // underneath" rather than empty space. Padding leaves room for the
  // 14px translate of the deepest visible card, and 16px breathing
  // room on the sides so the deck doesn't kiss the screen edges.
  position: "relative",
  margin: "0 16px",
  padding: "0 0 18px",
  background: "transparent",
};

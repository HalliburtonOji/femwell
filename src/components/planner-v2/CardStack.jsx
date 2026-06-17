// CardStack — horizontal scroll-snap slider used by every Planner row.
//
// Reverted from the absolute-positioned stack experiments (`3a6ba6f` /
// `7985a15`) back to the scroll-snap peek approach from `0f8eb28`:
// cards sit side-by-side in a native horizontal scroll track, the
// active card claims ~85% of the row width, and the next card peeks
// in from the right edge for ~15% — telegraphing "swipe for more"
// without occluding the active content.
//
// API unchanged: <CardStack label="…">{children}</CardStack>. All the
// rest of PlannerV2Shell (Item-1/2/3/4 from commit 4c780c4) keeps
// working as before — only the internal presentation flips.

import React, { Children, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const C = {
  espresso: "#3A2C1A",
  muted:    "#9B8B7A",
  gold:     "#D4AF37",
  dotIdle:  "#D4C9B4",
};

// `pager` (opt-in, default off so /Planner is byte-for-byte unchanged): a
// full-width paged variant — each card fills the track (no side-peek of the
// next card at rest), header aligns to the content edge. Same 3D depth,
// 320ms motion and ‹ • • › dots/arrows nav. Used by TodayDemo6's section rows.
export default function CardStack({ label, showHeader = true, pager = false, children }) {
  const childArray = Children.toArray(children).filter(Boolean);
  const count = childArray.length;
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);

  const trackStyle = pager ? { ...rowTrack, padding: "8px 0" } : rowTrack;
  const headStyle  = pager ? { ...rowHead, padding: "0 2px" } : rowHead;
  const slotFlex   = pager ? "0 0 100%" : "0 0 calc(100% - 40px)";

  // Scroll the track so the target slot is centred at the scroll start.
  function jumpTo(target) {
    if (count < 2) return;
    const clamped = ((target % count) + count) % count;
    setIdx(clamped);
    const track = trackRef.current; if (!track) return;
    const child = track.children[clamped];
    if (child) {
      track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
    }
  }
  function next() { jumpTo(idx + 1); }
  function prev() { jumpTo(idx - 1); }

  // Detect the closest slot to the scroll position — drives the pagination
  // dot highlighting + the active/peek styling.
  function onScroll() {
    const track = trackRef.current; if (!track) return;
    let best = 0, bestDist = Infinity;
    Array.from(track.children).forEach((el, i) => {
      const left = el.offsetLeft - track.offsetLeft;
      const dist = Math.abs(left - track.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    if (best !== idx) setIdx(best);
  }

  return (
    <section style={rowShell} aria-label={label || "row"}>
      {showHeader && (label || count > 1) && (
        <div style={headStyle}>
          <span style={kicker}>{label ? label.toUpperCase() : ""}</span>
          {count > 1 && (
            <div style={rowNav}>
              <button
                type="button"
                onClick={prev}
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
                onClick={next}
                aria-label="Next"
                style={rowArrow}
              ><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      )}

      {/* Native horizontal scroll track. Right-padding lets the next card
          peek in from the edge; scroll-snap-type:x mandatory locks it
          to one card per swipe. */}
      <div ref={trackRef} onScroll={onScroll} style={trackStyle}>
        {childArray.map((child, i) => (
          <div key={i} style={{ ...rowSlot, flex: slotFlex, ...(i === idx ? rowSlotActive : null) }}>
            {child}
          </div>
        ))}
      </div>
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
  };
const rowNav = { display: "flex", alignItems: "center", gap: 5 };
const rowArrow = {
  width: 22, height: 22, borderRadius: 9999,
  background: "transparent", border: "none", color: C.muted, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};
const rowTrack = {
  display: "flex", overflowX: "auto",
  scrollSnapType: "x mandatory", gap: 12,
  // Planner audit fix — right padding ~24px so the next card peeks
  // ~15% from the right edge. Combined with the 16px left padding
  // and the card width `calc(100% - 40px)`, this gives the
  // dominant-card layout the spec calls for on every viewport.
  padding: "8px 24px 8px 16px",
  scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
};
// Base slot — non-active card. Slightly scaled down + dimmed so the
// active card reads as forward, the peeking right-edge as "more behind".
//
// Planner audit fix — removed the `maxWidth: 520` cap. With the cap,
// desktop viewports (~1475px) fit 3 cards at ~520px each side-by-side
// instead of one dominant card with a 15%-peek of the next. Cards
// now fill `calc(100% - 40px)` of the scroll container width on
// every viewport (≈350px on mobile @ 390px viewport, ≈1435px on
// desktop), and the next card consistently peeks ~40px from the
// right edge.
const rowSlot = {
  flex: "0 0 calc(100% - 40px)",
  scrollSnapAlign: "start",
  borderRadius: 20,
  transform: "scale(0.96)",
  opacity: 0.85,
  transition: "transform 320ms cubic-bezier(0.16,1,0.3,1), opacity 320ms ease, box-shadow 320ms ease",
  boxShadow:
    "0 4px 16px rgba(58,44,26,0.14), inset 0 1px 0 rgba(255,255,255,0.5)",
  willChange: "transform, opacity",
};
// Active slot — full scale, deeper shadow, gold rim along the top.
const rowSlotActive = {
  transform: "scale(1)",
  opacity: 1,
  boxShadow:
    "0 8px 32px rgba(58,44,26,0.18), 0 2px 8px rgba(58,44,26,0.10), 0 -1px 0 rgba(212,175,55,0.22), inset 0 1px 0 rgba(255,255,255,0.7)",
};

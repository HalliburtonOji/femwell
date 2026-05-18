// Shared horizontal-snap slider row primitive used by every planner-v2 row.
// Mirrors the pattern used in UnifiedPlannerDemo (signed off by Halli).

import React, { useRef, useState, Children } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const C = { espresso: "#3A2C1A", muted: "#9B8B7A" };

function Row({ label, children, slotWidth = "calc(100% - 32px)", maxSlotWidth = 520 }) {
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const count = Children.count(children);

  function jumpTo(i) {
    const clamped = Math.max(0, Math.min(count - 1, i));
    setIdx(clamped);
    const track = trackRef.current; if (!track) return;
    const child = track.children[clamped];
    if (child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }
  function onScroll() {
    const track = trackRef.current; if (!track) return;
    let best = 0, bestDist = Infinity;
    Array.from(track.children).forEach((el, i) => {
      const left = el.offsetLeft - track.offsetLeft;
      const dist = Math.abs(left - track.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setIdx(best);
  }

  return (
    <section style={{ marginBottom: 18 }} aria-label={label || "row"}>
      {(label || count > 1) && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", marginBottom: 8,
        }}>
          <span style={{
            fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.muted, fontWeight: 700,
          }}>{label ? label.toUpperCase() : ""}</span>
          {count > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <button onClick={() => jumpTo(idx - 1)} style={arrowBtn}><ChevronLeft size={14} /></button>
              {Array.from({ length: count }).map((_, i) => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: 9999,
                  background: i === idx ? C.espresso : "rgba(58,44,26,0.20)",
                }} />
              ))}
              <button onClick={() => jumpTo(idx + 1)} style={arrowBtn}><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      )}
      <div ref={trackRef} onScroll={onScroll} style={{
        display: "flex", overflowX: "auto",
        scrollSnapType: "x mandatory", gap: 12,
        padding: "4px 16px",
        scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
      }}>
        {Children.map(children, (child, i) => (
          <div key={i} style={{
            flex: `0 0 ${slotWidth}`,
            maxWidth: maxSlotWidth,
            scrollSnapAlign: "start",
          }}>{child}</div>
        ))}
      </div>
    </section>
  );
}

const arrowBtn = {
  width: 22, height: 22, borderRadius: 9999,
  background: "transparent", border: "none", color: C.muted, cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
};

export default React.memo(Row);

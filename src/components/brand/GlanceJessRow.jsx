// GlanceJessRow — the §6.8.2 top sliding row: TWO uniform-height panels.
//   slide 1 · "today, at a glance"   slide 2 · Jess's written read (+ an upward inner sheet)
//
// Only the GENERIC bits live here (the swiper + the sheet). The panels themselves stay with
// the page, because their content IS the page's character — Nutrition's glance is plate/water,
// Lifestyle's is chapter/reading/sky. `FwCard` (brand/Card.jsx) is the shared card shell both use.
//
// Uniform height is the point: two panels of different heights make the row jump as you swipe,
// which is the "dead space" the canonical structure exists to remove.
import { useRef, useState } from "react";
import { ChevronUp, X } from "lucide-react";
import { T, SERIF, UI } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";

export const GLANCE_SWIPE_H = 380;

export function GlanceJessSwipe({ accent, glancePanel, jessPanel, hint = "swipe for Jess's read →", backHint = "← today's glance" }) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);
  const go = (i) => { const el = ref.current; if (!el) return; el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" }); setIdx(i); };
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    if (i !== idx) setIdx(i);
  };
  return (
    <div>
      <div ref={ref} onScroll={onScroll} className="fw-gj"
        style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain", scrollbarWidth: "none" }}>
        <style>{`.fw-gj::-webkit-scrollbar{display:none}`}</style>
        <div style={{ flex: "0 0 100%", scrollSnapAlign: "center", minWidth: 0 }}>{glancePanel}</div>
        <div style={{ flex: "0 0 100%", scrollSnapAlign: "center", minWidth: 0 }}>{jessPanel}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 8 }}>
        {[0, 1].map((i) => (
          <button key={i} onClick={() => go(i)} aria-label={i === 0 ? "Today at a glance" : "Jess's read"}
            style={{ width: idx === i ? 16 : 6, height: 6, borderRadius: 999, background: idx === i ? accent : T.paperDeep, border: "none", padding: 0, cursor: "pointer", transition: "width .2s" }} />
        ))}
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: T.muted, marginLeft: 4 }}>{idx === 0 ? hint : backHint}</span>
      </div>
    </div>
  );
}

// The deep read — slides UP over the card face (not a route, not a full-screen sheet).
// `open` is LIFTED to the page so it survives the shell's frequent re-renders.
export function JessSheet({ open, onClose, accent, title = "Jess's full read", sections = [] }) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: T.paperHi, borderRadius: 18, zIndex: 20, display: "flex", flexDirection: "column", overflow: "hidden", animation: "fwJessUp .3s cubic-bezier(.32,.72,.24,1)" }}>
      <style>{`@keyframes fwJessUp{from{transform:translateY(101%)}to{transform:translateY(0)}}@media (prefers-reduced-motion:reduce){[style*="fwJessUp"]{animation:none!important}}`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 14px 9px", borderBottom: `1px solid ${accent}22`, flexShrink: 0 }}>
        <span style={{ flex: 1, fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: OXBLOOD }}>{title}</span>
        <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper, color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><X size={16} /></button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 14px 16px" }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            {s.label && <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: accent, marginBottom: 5 }}>{s.label}</div>}
            <p style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.55, margin: 0 }}>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function JessOpenCTA({ accent, onClick, label = "Open Jess's full read" }) {
  return (
    <button onClick={onClick} className="fw-elite-press"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 16px", fontFamily: UI, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
      {label} <ChevronUp size={16} />
    </button>
  );
}

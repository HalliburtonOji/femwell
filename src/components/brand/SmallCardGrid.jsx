import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronDown, Check } from "lucide-react";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { OXBLOOD, lbl } from "@/components/brand/SliderKit";

// ── SmallCardGrid (piece D) — a 2-column grid of small FOCUSED cards for a
// StackedCard TOP shelf. Distinct from PeekShelf (a horizontal peek slider of big
// cover cards): this is the DOORWAY shelf for an actionable "room" — a scannable
// set of little cards, each an entry into a choice or a small doing.
//
// Why a 2-col grid, not a slider (evidence, research_piece_d_smallcard_grid.md):
// for 5–8 scannable items a carousel hides half (NN/g — most people stop after 3–4,
// dots are weak signifiers); a 2-col grid is direct-access to every item at once.
//
// TWO HARD RULES, both learned the hard way:
//   • §6.7 6a — every card carries a REAL one-line signal, never a bare label. A card
//     with no `signal` is a bug; the caller is expected to always pass a measured
//     signal (a count, a duration, a real preview) or an honest empty-state — never a
//     decorative fake number (NN/g: false cues erode trust).
//   • The whole card is the tap target (min 96px tall → well past WCAG 2.5.8's 24px,
//     2.5.5's 44px and Material's 48dp) so nothing here is a thin hit-zone.
//
// A card is one of two kinds:
//   • kind:"door" → a chevron; tapping OPENS a FaceOverlay (the CHOOSE surface). The
//     board never navigates.
//   • kind:"do"   → a real write (Planner/Journal …) that TICKS in place — `done` flips
//     the card to a check + "Saved", per §6.7.6 (act without leaving).
//
// The grid scrolls VERTICALLY inside the fixed shelf half; the board still swipes
// horizontally, so `overscrollBehavior:"contain"` keeps the two gestures from fighting.
// And because OSs hide scrollbars (Baymard: silent truncation is the #1 inline-scroll
// miss — cropped items read as "not offered"), when there IS more below we fade the
// bottom edge + drop a chevron so the shelf never lies about how much it holds.
export function SmallCard({ Icon, label, signal, accent = T.gold, done = false, onClick }) {
  return (
    <button onClick={onClick} className="fw-elite-press" aria-label={label}
      style={{ position: "relative", textAlign: "left", cursor: "pointer", minHeight: 96, width: "100%",
        border: `1px solid ${done ? accent : T.paperDeep}`, borderRadius: 15,
        background: done ? `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}1A 100%)` : T.paperHi,
        boxShadow: "0 2px 8px rgba(58,44,26,.07)", display: "flex", flexDirection: "column",
        padding: "12px 12px 11px" }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}1C`, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon size={17} color={accent} />
        </span>
        {done
          ? <span style={{ width: 22, height: 22, borderRadius: 999, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={13} color="#fff" /></span>
          : <ChevronRight size={16} color={T.paperDeep} style={{ flexShrink: 0 }} />}
      </span>
      <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 16, lineHeight: 1.16, color: OXBLOOD }}>{label}</span>
      <span style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: done ? accent : T.muted, marginTop: 4, lineHeight: 1.3,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {done ? "Saved — it's in your planner" : signal}
      </span>
    </button>
  );
}

export default function SmallCardGrid({ label, children }) {
  const ref = useRef(null);
  const [more, setMore] = useState(false);
  const check = useCallback(() => {
    const el = ref.current; if (!el) return;
    setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 6);
  }, []);
  useEffect(() => { check(); }, [children, check]);
  const mask = more ? "linear-gradient(to bottom, #000 calc(100% - 24px), transparent)" : "none";
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      {label && <div style={{ ...lbl, marginBottom: 8, flexShrink: 0 }}>{label}</div>}
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <div ref={ref} onScroll={check} className="fw-smallgrid"
          style={{ height: "100%", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignContent: "start", padding: "1px 1px 4px",
            WebkitMaskImage: mask, maskImage: mask }}>
          <style>{`.fw-smallgrid::-webkit-scrollbar{width:0}`}</style>
          {children}
        </div>
        {more && (
          <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 1, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
            <ChevronDown size={16} color={T.muted} />
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { reduceMotion } from "@/components/brand/expandCards";
import { FlowerGlyph } from "@/components/brand/flora";

// ── FaceOverlay — an IN-BOARD cover for a StackedCard face ────────────────────
// The clipboard's cards have TWO expand modes now, and they mean different things:
//   • ExpandDetailCard (position:fixed, full-screen) = CONSUME — read the whole item.
//   • FaceOverlay      (position:absolute, in-board)  = CHOOSE  — see what's on offer,
//     pick one, or do a small todo, then BACK returns you to the card you were on.
// Because it's the "choose" surface, it must NOT be full-screen: it covers only the
// board face, and its back arrow is a real return, not a route pop.
//
// CONTRACT: the nearest positioned ancestor MUST be position:relative — the overlay
// covers that box (inset:0). Place <FaceOverlay/> as a sibling of the board content
// inside that relative wrapper. Slides up translateY(101%)→0; scrim rises behind it.
export default function FaceOverlay({ open, onClose, title, sub, accent = T.gold, children }) {
  const backRef = useRef(null);
  const rootRef = useRef(null);
  const close = useCallback(() => { onClose && onClose(); }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => { try { backRef.current && backRef.current.focus({ preventScroll: true }); } catch (_) {} }, 40);
    // the board face is tall (900px); if it was mid-scroll, the header (back arrow) can sit
    // above the fold. Bring the overlay's top just below the top chrome so BACK is always reachable.
    const t2 = setTimeout(() => {
      try {
        const el = rootRef.current; if (!el) return;
        const r = el.getBoundingClientRect(); const target = 66;
        if (r.top < 8 || r.top > target + 24) window.scrollBy({ top: r.top - target, behavior: reduceMotion() ? "auto" : "smooth" });
      } catch (_) {}
    }, 60);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(t); clearTimeout(t2); };
  }, [open, close]);

  if (!open) return null;
  const rm = reduceMotion();

  return (
    <div ref={rootRef} role="dialog" aria-modal="true" aria-label={title || "Choices"}
      style={{ position: "absolute", inset: 0, zIndex: 40 }}>
      <style>{`@keyframes fwFaceUp{from{transform:translateY(101%)}to{transform:translateY(0)}}@keyframes fwFaceScrim{from{opacity:0}to{opacity:1}}`}</style>
      {/* scrim over the card behind — visible as the panel rises, and a tap-target to go back */}
      <div aria-hidden onClick={close}
        style={{ position: "absolute", inset: 0, background: "rgba(28,20,12,0.30)", backdropFilter: "blur(1.5px)",
          animation: rm ? "none" : "fwFaceScrim .26s ease" }} />
      {/* the sliding panel — covers the whole face */}
      <div style={{ position: "absolute", inset: 0, background: T.paperHi, borderRadius: 20, border: `1px solid ${T.paperDeep}`,
        boxShadow: "0 -8px 26px rgba(58,44,26,0.18)", display: "flex", flexDirection: "column", overflow: "hidden",
        animation: rm ? "none" : "fwFaceUp .34s cubic-bezier(.32,.72,.24,1)" }}>
        {/* header — back arrow + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 10px",
          borderBottom: `1px solid ${accent}22`, flexShrink: 0 }}>
          <button ref={backRef} onClick={close} aria-label="Back"
            style={{ width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paper,
              color: OXBLOOD, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <ArrowLeft size={17} />
          </button>
          <div style={{ minWidth: 0 }}>
            {title && <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 17, color: OXBLOOD, lineHeight: 1.15,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>}
            {sub && <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 600, letterSpacing: ".02em", color: T.muted, marginTop: 1 }}>{sub}</div>}
          </div>
        </div>
        {/* body — scrolls if the choices overflow the face; a botanical close sits at the
            foot so a face with short content reads as calm space, never an empty box (§brand) */}
        <div className="fw-face-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch",
          padding: "13px 14px 18px", display: "flex", flexDirection: "column" }}>
          <style>{`.fw-face-body::-webkit-scrollbar{width:0}`}</style>
          <div style={{ flex: "0 0 auto" }}>{children}</div>
          <div aria-hidden style={{ marginTop: "auto", paddingTop: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, opacity: 0.6 }}>
            <FlowerGlyph variant="marigold" size={24} color={accent} color2={T.gold} idx="faceclose" />
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: T.muted }}>Tap back when you're done.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

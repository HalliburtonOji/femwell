// l2Frame.jsx — the ADDITIVE wrapper for the "+2" demos. Mounts the page's REAL current
// live elite shell (every existing feature, nothing removed), then appends a clearly-divided
// "✦ Level +2 — proposed additions ✦" section below it. So the demo = the full live page +
// the proposed +2 layer. Live pages untouched.
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T, UI, SERIF, PAPER_BG } from "@/components/journal/Editorial";
import { OXBLOOD, SliderArrows } from "@/components/brand/SliderKit";
import { floraKeyframes } from "@/components/brand/flora";

export const L2_MOTION = `.fw-l2-in{animation:fwL2In .5s cubic-bezier(.215,.61,.355,1) both}@keyframes fwL2In{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.fw-elite-press{transition:transform .12s ease}.fw-elite-press:active{transform:scale(.97)}@media (prefers-reduced-motion:reduce){.fw-l2-in,.fw-elite-press{animation:none!important;transition:none!important}}`;

// L2Frame — shell (the real live page) on top, the +2 children below the divider.
export function L2Frame({ shell, label, children }) {
  const navigate = useNavigate();
  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", overflowX: "clip" }}>
      <style>{floraKeyframes}{L2_MOTION}</style>

      {/* ── THE FULL CURRENT LIVE PAGE — every existing feature, nothing removed ── */}
      {shell}

      {/* ── ✦ the proposed +2 layer ✦ ── */}
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "4px 16px calc(110px + env(safe-area-inset-bottom))" }} className="fw-l2-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 12px" }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${OXBLOOD}, transparent)`, opacity: 0.5 }} />
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: OXBLOOD, whiteSpace: "nowrap" }}>✦ Level +2 — proposed additions ✦</span>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${OXBLOOD}, transparent)`, opacity: 0.5 }} />
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", lineHeight: 1.5, margin: "0 0 12px" }}>
          Everything <b>above</b> is the current live {label} page — nothing removed. Everything <b>below</b> is the proposed +2 layer (real where non-gated, “Needs sign-off” where gated).
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <button onClick={() => navigate(createPageUrl("Ideas"))} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.muted }}><ArrowLeft size={13} /> Back to Ideas</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// L2Slider — a board slider for the +2 section with SCOPED arrows (the live shell above also
// renders a .fw-clipboard-track, so the arrows must target THIS slider's wrapper, not the first).
export function L2Slider({ children }) {
  const ref = useRef(null);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <SliderArrows sliderRef={ref} />
      {children}
    </div>
  );
}

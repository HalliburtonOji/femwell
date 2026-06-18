// demoKit — small shared chrome for the page-redesign DEMOS (HealthDemo, ProfileDemo, …).
// These are the brand-constant pieces every demo reuses (loader, page vines, the sticky Jump-to,
// the bottom-sheet, the done-row, button style, animation CSS). The PAGE-LEVEL LAYOUT is deliberately
// different in each demo — this module only carries the consistent brand chrome, not the composition.

import { T, UI, SERIF, PAPER_BG, InkFilter } from "@/components/journal/Editorial";
import { VineMotifV2 } from "@/components/brand/flora";
import { Grid2x2, X, Check } from "lucide-react";

export const withTimeout = (p, ms = 7000) => Promise.race([
  Promise.resolve(p).catch(() => null),
  new Promise((res) => setTimeout(() => res(null), ms)),
]);
export function todayKey() { try { return new Date().toISOString().slice(0, 10); } catch { return ""; } }
export const CLAMP = (n) => ({ minWidth: 0, overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word", display: "-webkit-box", WebkitLineClamp: n, WebkitBoxOrient: "vertical" });
export const clip = (s, n) => (s && String(s).length > n ? String(s).slice(0, n).trim() + "…" : (s || ""));

export const ICON_DISC = (Icon, accent, size = 32) => (
  <span style={{ width: size, height: size, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={Math.round(size / 2)} strokeWidth={1.7} color={accent} />
  </span>
);

export function Loader() {
  return <div style={{ ...PAPER_BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><InkFilter /><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: T.paperDeep, borderTopColor: T.gold }} /></div>;
}

// per-fold low-opacity vines (positions vary by page height — pass an array of {top,left|right,flip})
export function PageVines({ a = T.gold, b = T.sage, spots }) {
  const S = spots || [
    { top: 130, right: -26 }, { top: 780, left: -28, flip: true }, { top: 1440, right: -24 },
  ];
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {S.map((s, i) => (
        <div key={i} style={{ position: "absolute", ...(s.top != null ? { top: s.top } : {}), ...(s.left != null ? { left: s.left } : {}), ...(s.right != null ? { right: s.right } : {}) }}>
          <VineMotifV2 color={i % 2 ? b : a} color2={i % 2 ? a : b} opacity={0.09} w={i % 2 ? 140 : 150} flip={!!s.flip} idx={`pv${i}`} />
        </div>
      ))}
    </div>
  );
}

export function JumpPill({ onClick, label = "Jump to" }) {
  return <button onClick={onClick} aria-label="Jump to a section" style={{ position: "fixed", top: "calc(10px + env(safe-area-inset-top))", left: 12, zIndex: 45, display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(244,239,227,0.92)", backdropFilter: "blur(6px)", border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "8px 13px", cursor: "pointer", fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.muted, boxShadow: "0 2px 10px rgba(58,44,26,0.12)" }}><Grid2x2 size={14} /> {label}</button>;
}

export function JumpSheet({ sections, onClose, onPick }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Jump to a section" className="fw-scrim-anim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(11,8,5,0.42)", animation: "fwScrimIn .22s ease both" }}>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-anim" style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "20px 20px 0 0", padding: "18px 18px calc(96px + env(safe-area-inset-bottom))", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", animation: "fwSheetIn .3s cubic-bezier(.32,.72,.24,1) both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.muted }}>Jump to</span>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "inline-flex" }}><X size={18} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {sections.map((s) => (
            <button key={s.key} onClick={() => onPick(s.key)} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${s.accent || T.gold}`, borderRadius: 13, padding: "12px 12px", cursor: "pointer" }}>
              {ICON_DISC(s.Icon, s.accent || T.gold)}
              <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, ...CLAMP(2) }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DoneRow({ accent, label }) {
  return <div className="fw-fade" style={{ display: "flex", alignItems: "center", gap: 10, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "12px 13px", animation: "fwFadeUp .3s ease both" }}><span style={{ width: 30, height: 30, borderRadius: 99, background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={17} color="#fff" strokeWidth={3} /></span><span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>{label}</span></div>;
}

export function btnStyle(accent, disabled) {
  return { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1, textDecoration: "none" };
}

export const DEMO_CSS = `@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.demo-noscroll::-webkit-scrollbar{display:none}.demo-noscroll{scrollbar-width:none}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-fade{animation:none!important}}`;

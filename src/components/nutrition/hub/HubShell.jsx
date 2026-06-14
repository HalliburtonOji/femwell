// NutritionHub shell primitives — the bottom-sheet + slider-card chrome shared by
// the real Nutrition Daily Hub (src/pages/NutritionHub.jsx).
//
// NEW FILE. Does not touch any existing nutrition component. Pure presentation:
// no base44, no entities — the page wires real data and passes it in as children.
//
// Brand: Editorial cream/plum tokens. Phone-first. No emoji. Lucide + SVG only.
// Bottom sheets carry: backdrop + drag-handle + dusk header + close button + Escape.
import { X } from "lucide-react";
import {
  T, UI, SERIF, Eyebrow, Script, PAPER_BG, useEscape,
} from "@/components/journal/Editorial";
import { useScrollLock } from "@/utils/useScrollLock";

// ── Bottom sheet ─────────────────────────────────────────────────────────────
// Slides up from the bottom over a dimmed backdrop. Dusk header with a script
// title + close. Escape closes (useEscape). Body scrolls; the real surface
// component renders inside as children.
export function HubSheet({ title, eyebrow, onClose, children }) {
  useEscape(onClose);
  useScrollLock(true);   // lock the background page while the sheet is open (no scroll-bleed)
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60, display: "flex",
        flexDirection: "column", justifyContent: "flex-end",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(11,8,5,0.42)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: "relative", ...PAPER_BG, backgroundColor: T.paper,
          borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: "90%",
          width: "100%", maxWidth: 640, margin: "0 auto",
          display: "flex", flexDirection: "column",
          boxShadow: "0 -18px 50px rgba(11,8,5,0.32)", borderTop: `1px solid ${T.paperDeep}`,
        }}
      >
        {/* handle + dusk header */}
        <div style={{
          background: T.dusk, borderTopLeftRadius: 22, borderTopRightRadius: 22,
          padding: "10px 18px 14px", position: "relative", flexShrink: 0,
        }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(244,239,227,0.4)", margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              {eyebrow ? (
                <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.6, color: T.wax, textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>
                  {eyebrow}
                </div>
              ) : null}
              <Script size={34} color={T.paper} carve={false}>{title}</Script>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                background: "rgba(244,239,227,0.12)", border: "1px solid rgba(244,239,227,0.3)",
                color: T.paper, display: "grid", placeItems: "center", cursor: "pointer",
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>
        {/* scrolling body — the real surface lives here. flex:1+minHeight:0 makes THIS the
            scroller (capped by the sheet's maxHeight); overscroll-behavior:contain stops the
            scroll bleeding to the locked page behind; -webkit-overflow-scrolling for iOS. */}
        <div style={{
          flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch", padding: "16px 16px 28px",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Soft progress bar (gentle glance, never a scoreboard) ────────────────────
export function SoftBar({ value, guide, color = T.gold }) {
  const p = guide > 0 ? Math.min(100, Math.round((value / guide) * 100)) : 0;
  return (
    <div style={{ height: 6, borderRadius: 999, background: T.paperDeep, overflow: "hidden" }}>
      <div style={{ width: `${p}%`, height: "100%", background: color, borderRadius: 999 }} />
    </div>
  );
}

// ── Gentle energy ring (soft arc, % only — no shouted target) ────────────────
export function Ring({ value, guide, size = 72, label }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const p = guide > 0 ? Math.min(100, Math.round((value / guide) * 100)) : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "none" }} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.paperDeep} strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.gold} strokeWidth={5}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (p / 100) * c}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: SERIF, fontSize: size > 80 ? 18 : 13, fill: T.ink, fontWeight: 600 }}>
        {label != null ? label : `${p}%`}
      </text>
    </svg>
  );
}

// ── Hero surface card — the rich summary that opens a full surface ───────────
// Used in the Hero Card Slider. Tall, scroll-snapped, the next card peeks at the
// right edge. The whole card is clickable; primaryLabel is the one clear action.
export function SurfaceCard({ cardW, label, blurb, accent = T.gold, onOpen, primaryLabel, primaryIcon: Icon, children }) {
  return (
    <section
      className="hub-surface-card"
      style={{
        scrollSnapAlign: "center", flex: `0 0 ${cardW}px`, width: cardW,
        background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 20,
        // stay BIG (minHeight), only scroll the body when content genuinely exceeds a tall
        // safety cap — never a shrunk fixed height.
        padding: 20, display: "flex", flexDirection: "column", minHeight: 528, maxHeight: "84vh",
        boxShadow: "0 10px 26px -18px rgba(11,8,5,0.5)",
      }}
    >
      <style>{`.hub-surface-card .hub-card-body::-webkit-scrollbar{display:none}`}</style>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 4, flex: "none" }}>
        <Eyebrow color={accent}>{label}</Eyebrow>
        {blurb ? (
          <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.5, color: T.muted, fontWeight: 700, textTransform: "uppercase" }}>
            {blurb}
          </span>
        ) : null}
      </div>
      <Rule />
      {/* long content (Insights, long lists) scrolls WITHIN the card instead of clipping */}
      <div className="hub-card-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", marginTop: 12, scrollbarWidth: "none" }}>
        {children}
      </div>
      <button
        onClick={onOpen}
        style={{
          width: "100%", marginTop: 16, display: "inline-flex", alignItems: "center", justifyContent: "center",
          gap: 8, background: T.ink, color: T.paper, border: "none", borderRadius: 12, padding: "13px 16px",
          fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", cursor: "pointer",
        }}
      >
        {Icon ? <Icon size={15} /> : null}
        {primaryLabel}
      </button>
    </section>
  );
}

// thin hairline used inside SurfaceCard (local import to keep this file standalone)
function Rule() {
  return <div style={{ width: "100%", height: 1, background: T.paperDeep }} />;
}

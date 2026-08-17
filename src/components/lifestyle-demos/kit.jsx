// Shared BASELINE-FIX KIT for the four Lifestyle redesign demos (audit 2026-08-09).
// Every demo reuses this so the audit's baseline is guaranteed, not re-litigated per demo:
//   • AA-CONTRAST TOKENS — the live app's label-gold (#A8893F) measured ~2:1 on cream (fails WCAG
//     4.5:1). These clear AA for SMALL text on paper; bright gold/crimson are reserved for LARGE
//     or decorative only.  • 44px min hit area (Tap).  • Labelled nav header (DemoNav) — a back
//     control with a WORD, never an icon-guess.
import React from "react";
import { ChevronLeft } from "lucide-react";

// paper #ECE7DA has rel-luminance ~0.80; AA 4.5:1 needs text rel-lum ≤ ~0.14. These clear it.
export const AA = {
  paper: "#ECE7DA", paperHi: "#F4EFE3", paperDeep: "#D8CFBC",
  ink: "#141009", inkSoft: "#2e2618",
  label: "#6b5518",      // dark gold — ~6:1 on cream. Eyebrows / kickers / meta.
  muted: "#4a4234",      // ~8:1. Secondary text.
  crimson: "#9a1f17",    // AA crimson for SMALL text.
  crimsonBig: "#BC2E27", // bright crimson — LARGE / decorative headings only.
  sage: "#3f5f38",       // AA sage for small text.
  line: "#d8cfbc",
};
export const SERIF = "'Fraunces', Georgia, serif";
export const UI = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// PAPER background (flat paper, no busy fill — the audit flagged low-contrast busy grounds).
export const PAGE = { minHeight: "100vh", overflowX: "clip", background: AA.paper };

// 44px MIN HIT AREA. Pads the touch target without resizing the glyph; use for every tappable.
export function Tap({ as: Comp = "button", style, children, label, ...rest }) {
  return (
    <Comp {...rest} aria-label={label} style={{ minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", ...style }}>
      {children}
    </Comp>
  );
}

// AA eyebrow / kicker.
export function Eyebrow({ children, color = AA.label, style }) {
  return <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color, ...style }}>{children}</div>;
}

// A full-width, AA-contrast, ≥44px primary action.
export function ActionButton({ children, onClick, bg = AA.crimsonBig, style }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 48, boxSizing: "border-box", background: bg, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 15, fontWeight: 700, cursor: "pointer", ...style }}>
      {children}
    </button>
  );
}

// LABELLED nav header — a worded back control (not an icon guess) + a clear title. The demos'
// answer to the audit's "scent-free Menu / icon-only nav" finding.
export function DemoNav({ title, kicker = "Lifestyle redesign", backTo = "/Ideas", backLabel = "Ideas" }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: AA.paper, borderBottom: `1px solid ${AA.line}` }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <Tap as="a" href={backTo} label={`Back to ${backLabel}`} style={{ gap: 5, padding: "8px 12px 8px 8px", border: `1px solid ${AA.paperDeep}`, borderRadius: 999, background: AA.paperHi, color: AA.ink, textDecoration: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>
          <ChevronLeft size={17} /> {backLabel}
        </Tap>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: AA.label }}>{kicker}</div>
          <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: AA.crimsonBig, lineHeight: 1.15 }}>{title}</div>
        </div>
      </div>
    </div>
  );
}

// A small dev note explaining the demo's thesis (so a reviewer knows what they're looking at).
export function ThesisNote({ children }) {
  return (
    <div style={{ background: AA.paperHi, border: `1px solid ${AA.line}`, borderLeft: `4px solid ${AA.label}`, borderRadius: 10, padding: "11px 13px", margin: "0 0 22px" }}>
      <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", color: AA.label, marginBottom: 3 }}>THE THESIS</div>
      <div style={{ fontFamily: UI, fontSize: 13.5, color: AA.muted, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

// cleanKit — the shared CLEAN & CLASSY section primitives (BRAND_IDENTITY §2.7). Every Lifestyle
// focus surface composes from THESE so the whole page is literally one language: the centred gold
// eyebrow with its colourway meaning-rosette (the per-card floral detail Halli kept), the Cormorant
// title, the reading body, the quiet outlined CTA, the soft white card, the stateful summary line,
// and the botanical dividers from the real engine. No texture, no oxblood running text, one lift.
import React from "react";
import { SERIF, UI } from "@/components/journal/Editorial";
import { cwOf, MeaningRosette, BrandFrame, LeafDivider, FleuronDivider } from "@/components/brand/flora";
import { C, CLEAN_SHADOW } from "@/components/brand/cleanTokens";

export const Eyebrow = ({ cw = "gold", children, align = "center", style }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: align === "left" ? "flex-start" : "center", gap: 7, fontFamily: UI, fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: C.gold, margin: "0 0 9px", ...style }}>
    <MeaningRosette color={cwOf(cw).petal} centre={cw === "gold" ? C.ink : C.gold} /> {children}
  </div>
);
export const Title = ({ children, align = "center", size = 24, style }) => (
  <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: size, letterSpacing: -0.2, color: C.ink, margin: "0 0 14px", textAlign: align, lineHeight: 1.12, textShadow: "none", ...style }}>{children}</h3>
);
export const Body = ({ children, size = 17, style }) => (
  <p style={{ fontFamily: SERIF, fontSize: size, fontWeight: 500, color: C.ink, lineHeight: 1.65, margin: "0 0 12px", ...style }}>{children}</p>
);
export const Meta = ({ children, style }) => <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: C.slate, letterSpacing: ".03em", ...style }}>{children}</span>;
export const Sep = () => <span style={{ fontFamily: UI, fontSize: 12, color: C.faint }}>·</span>;

// the quiet outlined CTA (ONE per surface) + a filled ink variant for the single strongest action
export function Cta({ onClick, Icon, children, filled = false, style, ...rest }) {
  return (
    <button onClick={onClick} className="fw-elite-press" {...rest}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, width: "100%", minHeight: 46, padding: "12px 14px", borderRadius: 13, background: filled ? C.ink : "transparent", border: `1px solid ${C.ink}`, color: filled ? "#fff" : C.ink, fontFamily: UI, fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", cursor: "pointer", ...style }}>
      {Icon ? <Icon size={14} color={filled ? "#fff" : C.ink} strokeWidth={1.7} /> : null} {children}
    </button>
  );
}
// a small ghost link-button ("Read straight through ›")
export const Quiet = ({ onClick, children, style }) => (
  <button onClick={onClick} className="fw-elite-press" style={{ display: "block", width: "100%", background: "transparent", border: "none", cursor: "pointer", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: C.slate, letterSpacing: ".04em", padding: "10px 0 0", textAlign: "center", ...style }}>{children}</button>
);

// the soft white card — content that EARNS enclosure (a module, a dial, a form)
export const Card = ({ children, style, wash = null, framed = false, ...rest }) => {
  const base = { background: wash ? `linear-gradient(165deg, ${C.surface} 0%, ${cwOf(wash).petal}14 100%)` : C.surface, border: "none", borderRadius: 20, padding: "22px 20px", boxShadow: CLEAN_SHADOW, position: "relative", overflow: "hidden", ...style };
  if (framed) return <BrandFrame color={C.gold} opacity={0.7} size={44} style={base} {...rest}>{children}</BrandFrame>;
  return <section style={base} {...rest}>{children}</section>;
};
// an open editorial block (no box) — most sections
export const Block = ({ children, style, ...rest }) => <section style={{ margin: 0, ...style }} {...rest}>{children}</section>;

// the stateful, section-specific summary line (§19.4)
export function Summary({ Icon, cw = "gold", children }) {
  const petal = cwOf(cw).petal;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "0 0 18px" }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: C.surface, border: `1px solid ${C.hair}`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>{Icon ? <Icon size={15} color={petal} strokeWidth={1.8} /> : null}</span>
      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, fontWeight: 500, lineHeight: 1.45, color: C.ink, margin: 0 }}>{children}</p>
    </div>
  );
}
export const Leaf = ({ my = 22 }) => <LeafDivider color={C.gold} my={my} />;
export const Fleuron = ({ my = 22 }) => <FleuronDivider color={C.gold} my={my} />;
export const Foot = ({ children }) => <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: C.faint, textAlign: "center", lineHeight: 1.5, margin: "8px 16px 0" }}>{children}</p>;

// a fine tag (Energy · steady) and a tappable pill-tag
export const Tag = ({ children, tone }) => <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: tone || C.slate, letterSpacing: ".03em" }}>{children}</span>;
export const Chip = ({ on, onClick, children, style }) => (
  <button onClick={onClick} className="fw-elite-press" aria-pressed={!!on} style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".03em", color: on ? "#fff" : C.ink, background: on ? C.ink : C.surface, border: `1px solid ${on ? C.ink : C.hair}`, borderRadius: 999, padding: "7px 12px", cursor: "pointer", ...style }}>{children}</button>
);
// a compact one-line row (icon · text · chevron) used in lists
export function Row({ Icon, cw = "gold", label, text, onClick, right, first }) {
  const petal = cwOf(cw).petal;
  return (
    <button onClick={onClick} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", background: "transparent", border: "none", borderTop: first ? "none" : `1px solid ${C.hair}`, padding: "11px 2px", cursor: onClick ? "pointer" : "default" }}>
      {Icon ? <span style={{ width: 28, height: 28, borderRadius: 8, background: `${petal}18`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={14} color={petal} strokeWidth={1.8} /></span> : null}
      <span style={{ flex: 1, minWidth: 0 }}>
        {label ? <span style={{ display: "block", fontFamily: UI, fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: C.gold, marginBottom: 2 }}>{label}</span> : null}
        {text ? <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{text}</span> : null}
      </span>
      {right}
    </button>
  );
}

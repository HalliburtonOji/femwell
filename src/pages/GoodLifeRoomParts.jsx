import React from "react";
import { T, SERIF } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { CoverCard } from "@/components/brand/expandCards";

// Stable component identities keep focus and scroll position when a room choice changes.
export function GoodLifeSection({ Icon, title, sub, accent, children }) {
  return <section className="fw-good-section" style={{ marginTop: 26 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 4px" }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: `${accent}1F`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={16} color={accent} /></span>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: OXBLOOD }}>{title}</div>
    </div>
    {sub && <p style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5, margin: "0 2px 12px" }}>{sub}</p>}
    {children}
  </section>;
}

export function GoodLifeShelf({ cards, empty, onOpen, room }) {
  if (!cards.length) return empty ? <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "0 2px" }}>{empty}</p> : null;
  return <div className={`fw-${room}-shelf`} style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 0 8px 16px", margin: "0 -16px", scrollbarWidth: "none", WebkitMaskImage: "linear-gradient(90deg, #000 0, #000 calc(100% - 26px), transparent 100%)", maskImage: "linear-gradient(90deg, #000 0, #000 calc(100% - 26px), transparent 100%)" }}>
    {cards.map(it => <div key={it.id} style={{ flex: "0 0 89vw", maxWidth: 400 }}><CoverCard item={it} compact presentation="folio" onOpen={() => onOpen(it)} /></div>)}
  </div>;
}

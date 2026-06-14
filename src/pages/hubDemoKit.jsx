// hubDemoKit — shared scaffold for the "rich summary HEADER + big horizontal SLIDING
// CARDS" design language (the current live Nutrition-hub direction), so Journal and
// Nutrition demos feel like ONE design system.
//
// Structure: a page-appropriate rich summary header on top, then a horizontal
// scroll-snap slider of LARGE cards — ONE feature per card, each big enough to hold
// that feature richly inline (the bigger-card-does-more principle). A label rail +
// dot row + arrows make the paging obvious. FemWell editorial: cream/plum paper,
// Ephesis + Cormorant, Lucide/SVG, no emoji, no scoreboards.
//
// Self-contained: useState/useRef/useEffect only. No base44, no network. Each demo
// supplies its header node + an array of one-feature cards.
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  T, SERIF, UI, SCRIPT, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

const COL = 430;        // phone column
const CARD_VW = 0.86;   // each big card ~86% of the column → a peek of the next

// one large feature card frame — icon disc + title + essence header, then the body
function BigCard({ card, w }) {
  const Icon = card.icon;
  return (
    <section className="hd-card" style={{
      scrollSnapAlign: "center", flex: `0 0 ${w}px`, width: w,
      background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 26,
      boxShadow: "0 18px 44px -28px rgba(33,26,18,0.5), inset 0 1px 0 rgba(255,253,247,0.7)",
      padding: 18, display: "flex", flexDirection: "column", height: 470, maxHeight: "72vh", position: "relative", overflow: "hidden",
    }}>
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 78, borderRadius: "26px 26px 0 0", background: `linear-gradient(${card.accent}12, ${card.accent}00)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14, flex: "none" }}>
        <span style={{
          width: 44, height: 44, borderRadius: 13, flex: "none", display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          background: T.wax, border: `1px solid ${T.paperDeep}`, color: card.accent,
        }}>
          <Icon size={22} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {card.script
            ? <span style={{ fontFamily: SCRIPT, fontSize: 34, lineHeight: 1.05, color: T.ink, display: "block", filter: "url(#inkCarveSm)" }}>{card.title}</span>
            : <div style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{card.title}</div>}
          {card.essence && (
            <div style={{ fontFamily: SERIF, fontSize: 14, fontStyle: "italic", color: T.muted, marginTop: 3, lineHeight: 1.3 }}>{card.essence}</div>
          )}
        </div>
      </div>
      {/* long content scrolls WITHIN the card (Insights, long lists) instead of clipping */}
      <div className="hd-card-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none" }}>
        <style>{`.hd-card .hd-card-body::-webkit-scrollbar{display:none}`}</style>
        {card.render()}
      </div>
    </section>
  );
}

export default function HubDemo({ banner, header, cards, footer }) {
  useEditorialFonts();
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const cardRefs = useRef({});
  const cardW = Math.round(COL * CARD_VW);

  // track which card is centred for the dot/label state
  useEffect(() => {
    const root = trackRef.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          setActive(Number(e.target.getAttribute("data-i")));
        }
      });
    }, { root, threshold: [0.6] });
    Object.values(cardRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [cards.length]);

  const go = (i) => {
    const idx = Math.max(0, Math.min(cards.length - 1, i));
    cardRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", fontFamily: SERIF, color: T.ink, paddingBottom: 40 }}>
      <InkFilter />
      <div style={{ height: 30, background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {banner}
      </div>

      <div style={{ maxWidth: COL, margin: "0 auto" }}>
        {/* RICH SUMMARY HEADER */}
        <header style={{ padding: "18px 18px 6px" }}>{header}</header>

        {/* label rail — which feature you're on + arrows */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", marginTop: 6, marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 7, overflowX: "auto", scrollbarWidth: "none" }} className="hd-rail">
            <style>{`.hd-rail::-webkit-scrollbar{display:none}.hd-track::-webkit-scrollbar{display:none}`}</style>
            {cards.map((c, i) => (
              <button key={c.id} onClick={() => go(i)} style={{
                flex: "none", fontFamily: UI, fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
                padding: "6px 11px", borderRadius: 999, cursor: "pointer",
                background: active === i ? T.ink : "transparent", color: active === i ? T.paper : T.muted,
                border: `1px solid ${active === i ? T.ink : T.paperDeep}`,
              }}>{c.title}</button>
            ))}
          </div>
        </div>

        {/* THE BIG SLIDING CARDS — horizontal scroll-snap, one feature each, peek of next */}
        <div ref={trackRef} className="hd-track" style={{
          display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory",
          padding: "4px 18px 6px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
        }}>
          {cards.map((c, i) => (
            <div key={c.id} data-i={i} ref={(el) => { cardRefs.current[i] = el; }} style={{ display: "flex", flex: `0 0 ${cardW}px` }}>
              <BigCard card={c} w={cardW} />
            </div>
          ))}
        </div>

        {/* dots + arrows */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 12 }}>
          <button onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous"
            style={{ ...navBtn, opacity: active === 0 ? 0.3 : 1 }}><ChevronLeft size={16} /></button>
          <div style={{ display: "flex", gap: 6 }}>
            {cards.map((c, i) => (
              <span key={c.id} style={{ width: active === i ? 18 : 7, height: 7, borderRadius: 999, background: active === i ? T.ink : T.paperDeep, transition: "width .2s" }} />
            ))}
          </div>
          <button onClick={() => go(active + 1)} disabled={active === cards.length - 1} aria-label="Next"
            style={{ ...navBtn, opacity: active === cards.length - 1 ? 0.3 : 1 }}><ChevronRight size={16} /></button>
        </div>

        {footer && <div style={{ padding: "14px 24px 0" }}>{footer}</div>}
      </div>
    </div>
  );
}

const navBtn = {
  width: 34, height: 34, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi,
  color: T.ink, cursor: "pointer", display: "grid", placeItems: "center",
};

// ── shared body atoms (so both demos look like one system) ───────────────────
export function Action({ children, accent = T.ink }) {
  return (
    <button style={{
      width: "100%", marginTop: "auto", display: "inline-flex", alignItems: "center",
      justifyContent: "center", gap: 8, background: accent, color: T.paper, border: "none",
      borderRadius: 14, padding: "13px 16px", fontFamily: UI, fontSize: 12, fontWeight: 700,
      letterSpacing: 0.6, textTransform: "uppercase", cursor: "pointer", flex: "none",
    }}>{children}</button>
  );
}
export function Inset({ children, style }) {
  return <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: 13, ...style }}>{children}</div>;
}
export function Tag({ children, accent = T.gold }) {
  return <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, color: accent, background: `${accent}14`, border: `1px solid ${accent}33`, borderRadius: 999, padding: "2px 9px" }}>{children}</span>;
}
export function Eyebrow2({ children, color = T.muted }) {
  return <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, fontWeight: 700, textTransform: "uppercase", color, marginBottom: 6 }}>{children}</div>;
}

// controlCenterKit — shared scaffold for the 3 Control-Center concept demos.
//
// CORRECTED CONCEPT (Halli's spec): Apple's Control Center is a VERTICAL stack of
// large modules you swipe UP/DOWN through — ONE module per screen, each module the
// full canvas for ONE thing. We translate that, NOT a horizontal grid:
//   • a HEADER page at the very top (the page's summary "now")
//   • then a VERTICAL scroll-snap slider of FULL-COVER rounded cards — ONE FEATURE
//     PER CARD, each large enough to hold that single feature richly inline. Swipe
//     up → the next feature, full-screen. Never multiple features squeezed in a grid.
//   • a right-pinned vertical DOT rail = where you are + jump to any feature.
//
// Apple's feel (big rounded full-cover module, soft lift, snap paging) reinterpreted
// in FemWell EDITORIAL: cream/plum paper, Ephesis + Cormorant, Lucide/SVG. No Apple
// dark glass, no emoji, no scoreboards.
//
// Self-contained: useState/useRef/useEffect only. No base44, no network, no props
// from the app. Each demo supplies its header + an array of one-feature cards.
import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  T, SERIF, UI, SCRIPT, InkFilter, useEditorialFonts, PAPER_BG,
} from "@/components/journal/Editorial";

const BANNER_H = 30;

// the full-cover page metrics — one card ≈ one screen, with a peek of the next
const PAGE_STYLE = () => ({
  scrollSnapAlign: "start",
  scrollSnapStop: "always",
  flex: "none",
  minHeight: "calc(100vh - 152px)",     // full-cover minus banner + a peek of the next card
  borderRadius: 30,
  border: `1px solid ${T.paperDeep}`,
  background: T.paperHi,
  boxShadow:
    "0 28px 64px -32px rgba(33,26,18,0.55), inset 0 1px 0 rgba(255,253,247,0.8)",
  padding: "18px 18px 18px",
  paddingRight: 56,                       // reserve room for the pinned dot rail
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
});

// the little "pulled-up sheet" grip + a soft tinted accent wash at the card top
function Grip({ accent }) {
  return (
    <>
      <div aria-hidden style={{
        position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)",
        width: 44, height: 4, borderRadius: 999, background: T.paperDeep,
      }} />
      {accent && (
        <div aria-hidden style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 86, borderRadius: "30px 30px 0 0",
          background: `linear-gradient(${accent}14, ${accent}00)`, pointerEvents: "none",
        }} />
      )}
    </>
  );
}

// the card's own header band — icon disc + title (+ kicker) — consistent across cards
function CardHead({ card, index, total }) {
  const Icon = card.icon;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12, marginTop: 6 }}>
      <span style={{
        width: 42, height: 42, borderRadius: 13, flex: "none", display: "inline-flex",
        alignItems: "center", justifyContent: "center",
        background: T.wax, border: `1px solid ${T.paperDeep}`, color: card.accent,
        boxShadow: "inset 0 1px 0 rgba(255,253,247,0.7)",
      }}>
        <Icon size={21} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.6, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 2 }}>
          {card.kicker || `${String(index + 1).padStart(2, "0")} · ${total}`}
        </div>
        {card.script
          ? <span style={{ fontFamily: SCRIPT, fontSize: 33, lineHeight: 1.05, color: T.ink, display: "block", filter: "url(#inkCarveSm)" }}>{card.title}</span>
          : <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{card.title}</div>}
        {card.essence && (
          <div style={{ fontFamily: SERIF, fontSize: 14.5, fontStyle: "italic", color: T.muted, marginTop: 3, lineHeight: 1.3 }}>
            {card.essence}
          </div>
        )}
      </div>
    </div>
  );
}

// ── reusable card-body atoms the demos share ────────────────────────────────
export function Action({ children, accent = T.ink, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", marginTop: "auto", display: "inline-flex", alignItems: "center",
      justifyContent: "center", gap: 8, background: accent, color: T.paper, border: "none",
      borderRadius: 14, padding: "13px 16px", fontFamily: UI, fontSize: 12, fontWeight: 700,
      letterSpacing: 0.6, textTransform: "uppercase", cursor: "pointer", flex: "none",
    }}>{children}</button>
  );
}
export function Tag({ children, accent = T.gold }) {
  return (
    <span style={{
      fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, color: accent,
      background: `${accent}14`, border: `1px solid ${accent}33`, borderRadius: 999, padding: "2px 9px",
    }}>{children}</span>
  );
}
export function Inset({ children, style }) {
  return (
    <div style={{
      background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 15, padding: 13, ...style,
    }}>{children}</div>
  );
}

// ── the right-pinned vertical DOT rail (position + jump) ─────────────────────
function DotRail({ cards, active, onJump }) {
  return (
    <div style={{
      position: "fixed", right: 8, top: "50%", transform: "translateY(-50%)", zIndex: 40,
      display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
      padding: "10px 7px", background: "rgba(239,227,201,0.82)", backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)", border: `1px solid ${T.paperDeep}`, borderRadius: 999,
      boxShadow: "0 8px 22px -14px rgba(33,26,18,0.5)",
    }}>
      <button onClick={() => onJump(-1)} aria-label="Top" title="Top" style={dotBtn(active === -1)}>
        <ChevronUp size={13} color={active === -1 ? T.paper : T.muted} />
      </button>
      {cards.map((c, i) => {
        const on = active === i;
        const Icon = c.icon;
        return (
          <button key={c.id} onClick={() => onJump(i)} aria-label={c.title} title={c.title}
            style={{ ...dotBtn(on), gap: 6 }}>
            {on && <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, color: T.paper, whiteSpace: "nowrap" }}>{c.title}</span>}
            <Icon size={13} color={on ? T.paper : c.accent} />
          </button>
        );
      })}
    </div>
  );
}
const dotBtn = (on) => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 26, padding: on ? "0 9px" : 0, width: on ? "auto" : 26, borderRadius: 999, cursor: "pointer",
  background: on ? T.ink : "transparent", border: `1px solid ${on ? T.ink : "transparent"}`,
  transition: "background .18s",
});

// ── the page shell ──────────────────────────────────────────────────────────
// banner: string · header: ReactNode (the summary "now" page body) · cards:
// [{ id, title, essence, kicker?, script?, icon, accent, render: () => node }]
export default function ControlCenter({ banner, header, cards, footer }) {
  useEditorialFonts();
  const [active, setActive] = useState(-1);   // -1 = header page
  const scrollRef = useRef(null);
  const refs = useRef({});

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.55) {
          const k = e.target.getAttribute("data-k");
          setActive(k === "h" ? -1 : Number(k));
        }
      });
    }, { root, threshold: [0.55] });
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [cards.length]);

  const jump = (i) => {
    const el = refs.current[i === -1 ? "h" : i];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ ...PAPER_BG, height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: SERIF, color: T.ink }}>
      <InkFilter />

      {/* mock-data banner (exact spec) */}
      <div style={{ height: BANNER_H, flex: "none", background: T.ink, color: T.paper, fontFamily: UI, fontSize: 10.5, letterSpacing: 0.4, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {banner}
      </div>

      {/* the VERTICAL snap pager — header page, then one full-cover card per feature */}
      <div ref={scrollRef} className="cc-pager" style={{
        flex: 1, overflowY: "auto", scrollSnapType: "y mandatory",
        padding: "14px 14px 28px", display: "flex", flexDirection: "column", gap: 16,
        scrollbarWidth: "none", position: "relative",
      }}>
        <style>{`.cc-pager::-webkit-scrollbar{display:none}`}</style>

        {/* HEADER page (full-cover summary) */}
        <section data-k="h" ref={(el) => { refs.current.h = el; }} style={PAGE_STYLE()}>
          <Grip />
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", paddingTop: 4 }}>
            {header}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 10, color: T.muted, flex: "none" }}>
            <ChevronUp size={14} />
            <span style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: 0.5 }}>swipe up · {cards.length} cards, one each</span>
          </div>
        </section>

        {/* one FULL-COVER card per feature */}
        {cards.map((card, i) => (
          <section key={card.id} data-k={i} ref={(el) => { refs.current[i] = el; }} style={PAGE_STYLE(card.accent)}>
            <Grip accent={card.accent} />
            <CardHead card={card} index={i} total={cards.length} />
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {card.render()}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 10, color: T.paperDeep, flex: "none" }}>
              {i < cards.length - 1
                ? <><ChevronDown size={13} color={T.muted} /><span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.4, color: T.muted }}>{cards[i + 1].title}</span></>
                : <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 0.4, color: T.muted }}>that's the set</span>}
            </div>
          </section>
        ))}

        {footer}
      </div>

      {/* right-pinned vertical dot rail */}
      <DotRail cards={cards} active={active} onJump={jump} />
    </div>
  );
}

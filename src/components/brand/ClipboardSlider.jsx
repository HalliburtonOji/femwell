// ClipboardSlider — BRAND_IDENTITY §6.10 "The Clipboard Stack Slider" (Halli's component).
//
// A "clipboard" is a BIG framed card that HOLDS a stack/grid of smaller cards; you slide it sideways
// to reveal ANOTHER whole clipboard holding a different stack — like flipping between two big boards.
//
// This is the SHARED implementation (the Brand Bible owner documented the spec; this is the code).
// Generic + content-agnostic so Today (rituals) and Planner can both reuse it. Rides the Card.jsx
// framing language (paperHi gradient · paperDeep hairline · 4-corner sprigs · a gold "clip" at top) +
// flora.jsx glyphs. NO new backend, no new function. Motion per §6.9: horizontal scroll-snap, slight
// lift on the active board, edge-peek of the next board, page dots; reduced-motion → instant (no slide).
//
// Usage:
//   <ClipboardSlider hint="Slide for your rituals →">
//     <Clipboard title="Your day"     sub="…" accent={T.sage} flower="rose">{listOne}</Clipboard>
//     <Clipboard title="Your rituals" sub="…" accent={T.gold} flower="lavender">{listTwo}</Clipboard>
//   </ClipboardSlider>

import { Children, cloneElement, isValidElement, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { T, UI, Script } from "@/components/journal/Editorial";
import { CardCorner, FlowerGlyph } from "@/components/brand/flora";
import { FW_CARD_W, FW_CARD_MINH } from "@/components/brand/Card";

// UNIFORM SIZE (§6.7.1 / §6.10): every clipboard board IS the standard Today "across your day" card
// size — width FW_CARD_W (365) · minHeight FW_CARD_MINH (488) — and the slider stretches all boards to
// equal height, so board 1 and board 2 never mismatch. No size mismatch between any boards or cards.
const GAP = 14;

const reduceMotion = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

function Frame4({ color, opacity = 0.55, size = 44 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant="sprig" color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

// The little gold "clip" at the top-centre of a clipboard (§6.10 anatomy). Pure CSS, no blur.
// `light` = a smaller, quieter clip so the frame reads as chrome, not furniture.
function ClipDetail({ light = false }) {
  const w = light ? 40 : 50, h = light ? 11 : 14;
  return (
    <div aria-hidden style={{ position: "absolute", top: light ? -6 : -8, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ width: w, height: h, borderRadius: 8, background: "linear-gradient(180deg, #CDB06A 0%, #A8893F 70%, #8C7235 100%)", border: "1px solid rgba(58,44,26,0.24)", boxShadow: light ? "0 1px 3px rgba(58,44,26,0.14), inset 0 1px 0 rgba(255,253,247,0.45)" : "0 2px 5px rgba(58,44,26,0.20), inset 0 1px 0 rgba(255,253,247,0.5)" }} />
      <span style={{ width: light ? 9 : 11, height: light ? 6 : 7, borderRadius: "0 0 5px 5px", background: "#A8893F", marginTop: -1, border: "1px solid rgba(58,44,26,0.2)", borderTop: "none" }} />
    </div>
  );
}

// ── one clipboard — a big Card.jsx-framed surface holding a stack/grid (the `children`) ──────────────
// `light` (opt-in, default off so every existing caller is byte-unchanged) = the lighter-frame
// pass: trimmed padding, a 3px spine (was 4), quieter corner sprigs + clip, and a softer shadow —
// so the CONTENT dominates, not the frame (BRAND §6.7 "cream-on-cream, hairline + a tiny shadow").
export function Clipboard({ title, sub, accent = T.gold, flower = "lavender", idx = "cb", titleColor = T.ink, light = false, children }) {
  return (
    <section
      aria-label={title}
      style={{
        position: "relative", overflow: "hidden", width: "100%", boxSizing: "border-box",
        background: `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}14 100%)`,
        border: `1px solid ${T.paperDeep}`, borderLeft: `${light ? 3 : 4}px solid ${accent}`, borderRadius: light ? 18 : 20,
        padding: light ? "18px 13px 14px" : "24px 18px 18px", minHeight: FW_CARD_MINH,
        boxShadow: light ? "0 3px 14px rgba(58,44,26,0.09), 0 1px 3px rgba(58,44,26,0.05)" : "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
      }}
    >
      <Frame4 color={accent} opacity={light ? 0.4 : 0.55} size={light ? 34 : 44} />
      <ClipDetail light={light} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <Script size={30} color={titleColor}>{title}</Script>
          {flower && <FlowerGlyph variant={flower} size={28} color={accent} idx={idx} />}
        </div>
        {sub && <p style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, margin: "1px 0 14px", fontWeight: 600, letterSpacing: 0.2 }}>{sub}</p>}
        {!sub && <div style={{ height: 12 }} />}
        {children}
      </div>
    </section>
  );
}

// ── the slider — a horizontal scroll-snap pager of clipboards, edge-peek + dots ──────────────────────
// `wide` (opt-in) = the focused board fills ~88% of the viewport (responsive, capped) with a real
// edge-peek, instead of a fixed 365px that reads small on wider phones. `light` = pass the lighter
// frame down to every board. Both default OFF so existing callers (Community, Doctor Export, demos)
// are unchanged until the pass is approved to roll wider.
export function ClipboardSlider({ children, hint, accent = T.gold, wide = false, light = false }) {
  const boards = Children.toArray(children).filter(Boolean)
    .map((b, i) => (light && isValidElement(b) ? cloneElement(b, { light: true, key: b.key ?? i }) : b));
  const boardBasis = wide ? "min(88vw, 430px)" : `${FW_CARD_W}px`;
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const last = boards.length - 1;

  // Real boards only — the track also holds a <style> node (first child) and a trailing spacer; both
  // have ~0/small width, so filter by offsetWidth to keep indices aligned with `boards`/the dots.
  const realBoards = (el) => [...el.children].filter((c) => c.offsetWidth > 40);
  const onScroll = () => {
    const el = trackRef.current; if (!el) return;
    let best = 0, bd = Infinity;
    realBoards(el).forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - el.offsetLeft - el.scrollLeft);
      if (d < bd) { bd = d; best = i; }
    });
    if (best !== active) setActive(best);
  };
  const goTo = (i) => {
    const idx = Math.max(0, Math.min(last, i));
    setActive(idx);
    // Direct scrollLeft is the reliable method (scrollIntoView / smooth scroll can no-op on nested
    // snap tracks); matches SliderKit's SliderArrows. Instant is also reduced-motion-safe.
    const el = trackRef.current; if (!el) return;
    const child = realBoards(el)[idx];
    if (child) el.scrollLeft = child.offsetLeft - el.offsetLeft;
  };

  return (
    <div>
      {hint && boards.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, padding: "0 2px 8px", fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.muted }}>
          {hint} <ChevronRight size={14} />
        </div>
      )}
      <div
        ref={trackRef} onScroll={onScroll} className="fw-clipboard-track"
        style={{ display: "flex", alignItems: "stretch", gap: GAP, overflowX: "auto", scrollSnapType: "x mandatory", padding: "10px 2px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", margin: "0 -2px" }}
      >
        <style>{`.fw-clipboard-track::-webkit-scrollbar{display:none}`}</style>
        {boards.map((b, i) => (
          <div key={i} style={{
            flex: `0 0 ${boardBasis}`, width: boardBasis, display: "flex", scrollSnapAlign: "start", borderRadius: 20,
            transform: reduceMotion() ? "none" : (i === active ? "translateY(0) scale(1)" : "translateY(2px) scale(0.985)"),
            opacity: i === active ? 1 : 0.9,
            transition: reduceMotion() ? "none" : "transform 260ms ease-out, opacity 260ms ease-out",
          }}>
            {b}
          </div>
        ))}
        {/* trailing spacer so the last board can snap fully into view past the peek */}
        <div aria-hidden style={{ flex: "0 0 16px" }} />
      </div>

      {boards.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "12px 0 0" }}>
          <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous board" style={navBtn(active === 0)}><ChevronLeft size={16} /></button>
          <div style={{ display: "flex", gap: 7 }}>
            {boards.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Board ${i + 1}`} style={{ width: i === active ? 18 : 7, height: 7, borderRadius: 999, border: "none", padding: 0, background: i === active ? accent : T.paperDeep, cursor: "pointer", transition: "width .2s" }} />
            ))}
          </div>
          <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next board" style={navBtn(active === last)}><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}

function navBtn(disabled) {
  return { width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : T.paperHi, color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 };
}

// ── CardDeck — "SLIDE WITHIN THE CARD" (§6.10 nested). A horizontal scroll-snap sub-deck you swipe
// INSIDE a clipboard board to move between its PEER items (one item per page), instead of stacking them
// vertically. Reuses the same native scroll-snap mechanics as the outer slider (compositor-driven, 60fps,
// transform-free) + reduced-motion safe.
//
// GESTURE HANDLING — the inner and outer slides must not fight. `overscrollBehaviorX: "contain"` stops the
// inner deck's horizontal scroll from CHAINING into the outer ClipboardSlider: a swipe that starts on the
// deck stays in the deck (even at its edges), so it can never accidentally drag the board behind it. The
// board's title/sub area above the deck (and the outer dots/arrows) remain the handle for moving between
// BOARDS. Net: swipe on the deck → moves items; swipe on the header / tap outer dots → moves boards.
export function CardDeck({ children, accent = T.gold, peek = false }) {
  const items = Children.toArray(children).filter(Boolean);
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const last = items.length - 1;
  if (items.length <= 1) return <div>{items}</div>;   // nothing to slide through

  const onScroll = () => {
    const el = trackRef.current; if (!el) return;
    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    if (i !== active) setActive(Math.max(0, Math.min(last, i)));
  };
  const goTo = (i) => {
    const idx = Math.max(0, Math.min(last, i));
    setActive(idx);
    const el = trackRef.current; if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: reduceMotion() ? "auto" : "smooth" });
  };

  return (
    <div>
      <div
        ref={trackRef} onScroll={onScroll} className="fw-deck-track"
        style={{
          display: "flex", overflowX: "auto", scrollSnapType: "x mandatory",
          overscrollBehaviorX: "contain",                 // ← the inner/outer gesture firewall
          WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
        }}
      >
        <style>{`.fw-deck-track::-webkit-scrollbar{display:none}`}</style>
        {items.map((c, i) => (
          <div key={i} style={{
            flex: `0 0 ${peek ? 92 : 100}%`, width: peek ? "92%" : "100%",
            minWidth: 0, boxSizing: "border-box", scrollSnapAlign: "start", paddingRight: peek ? 8 : 0,
          }}>{c}</div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "10px 0 0" }}>
        <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous item" style={navBtn(active === 0)}><ChevronLeft size={15} /></button>
        <div style={{ display: "flex", gap: 6 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`Item ${i + 1}`}
              style={{ width: i === active ? 16 : 6, height: 6, borderRadius: 999, border: "none", padding: 0, background: i === active ? accent : T.paperDeep, cursor: "pointer", transition: "width .2s" }} />
          ))}
        </div>
        <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next item" style={navBtn(active === last)}><ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

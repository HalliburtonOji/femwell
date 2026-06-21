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

import { Children, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { T, UI, Script } from "@/components/journal/Editorial";
import { CardCorner, FlowerGlyph } from "@/components/brand/flora";

const reduceMotion = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

function Frame4({ color, opacity = 0.55, size = 44 }) {
  return <>{["tl", "tr", "br", "bl"].map((c) => <CardCorner key={c} variant="sprig" color={color} corner={c} size={size} opacity={opacity} />)}</>;
}

// The little gold "clip" at the top-centre of a clipboard (§6.10 anatomy). Pure CSS, no blur.
function ClipDetail() {
  return (
    <div aria-hidden style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ width: 50, height: 14, borderRadius: 8, background: "linear-gradient(180deg, #CDB06A 0%, #A8893F 70%, #8C7235 100%)", border: "1px solid rgba(58,44,26,0.28)", boxShadow: "0 2px 5px rgba(58,44,26,0.20), inset 0 1px 0 rgba(255,253,247,0.5)" }} />
      <span style={{ width: 11, height: 7, borderRadius: "0 0 5px 5px", background: "#A8893F", marginTop: -1, border: "1px solid rgba(58,44,26,0.22)", borderTop: "none" }} />
    </div>
  );
}

// ── one clipboard — a big Card.jsx-framed surface holding a stack/grid (the `children`) ──────────────
export function Clipboard({ title, sub, accent = T.gold, flower = "lavender", idx = "cb", children }) {
  return (
    <section
      aria-label={title}
      style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(165deg, ${T.paperHi} 0%, ${accent}14 100%)`,
        border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accent}`, borderRadius: 20,
        padding: "24px 18px 18px", minHeight: 300,
        boxShadow: "0 4px 20px rgba(58,44,26,0.12), 0 1px 4px rgba(58,44,26,0.08)",
      }}
    >
      <Frame4 color={accent} />
      <ClipDetail />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <Script size={30} color={T.ink}>{title}</Script>
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
export function ClipboardSlider({ children, hint, accent = T.gold }) {
  const boards = Children.toArray(children).filter(Boolean);
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const last = boards.length - 1;

  const onScroll = () => {
    const el = trackRef.current; if (!el) return;
    let best = 0, bd = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - el.offsetLeft - el.scrollLeft);
      if (d < bd) { bd = d; best = i; }
    });
    if (best !== active) setActive(best);
  };
  const goTo = (i) => {
    const idx = Math.max(0, Math.min(last, i));
    setActive(idx);
    const el = trackRef.current; const child = el?.children?.[idx];
    if (child) child.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "nearest", inline: "start" });
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
        style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", padding: "10px 2px 4px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", margin: "0 -2px" }}
      >
        <style>{`.fw-clipboard-track::-webkit-scrollbar{display:none}`}</style>
        {boards.map((b, i) => (
          <div key={i} style={{
            flex: "0 0 calc(100% - 28px)", scrollSnapAlign: "start", borderRadius: 20,
            transform: reduceMotion() ? "none" : (i === active ? "translateY(0) scale(1)" : "translateY(2px) scale(0.985)"),
            opacity: i === active ? 1 : 0.9,
            transition: reduceMotion() ? "none" : "transform 260ms ease-out, opacity 260ms ease-out",
          }}>
            {b}
          </div>
        ))}
        {/* trailing spacer so the last board can snap fully into view past the peek */}
        <div aria-hidden style={{ flex: "0 0 14px" }} />
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

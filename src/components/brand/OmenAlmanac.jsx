// OmenAlmanac.jsx — the UI for the flora-omen engine (§10.2–10.5). A tappable "almanac"
// moment: the day's omen (a creature or flower chosen from REAL signals, rotating on a daily
// seed) → tap → a 3-layer reveal (the fixed meaning · the "they say…" line · the personal
// "why now" + a small nudge) → optional "press to your journal" (rides the existing
// JournalEntries write — NO new function). Reduced-motion-safe; oxblood heading.
import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Feather, X, Check } from "lucide-react";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { Pollinator, FlowerGlyph, cwOf } from "@/components/brand/flora";
import { pickOmen, omenSeed } from "@/components/brand/floraOmen";

const KEYFRAMES = `
@keyframes fwOmenIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes fwOmenSheet{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes fwOmenScrim{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.fw-omen-anim{animation:none!important}}`;

// the glyph for an omen (a Pollinator for creatures, a FlowerGlyph for flowers)
function OmenGlyph({ omen, size = 38, animate = true }) {
  const c = cwOf(omen.accent || "gold");
  if (omen.kind === "creature") {
    const col = omen.glyph === "bee" ? T.gold : omen.glyph === "ladybird" || omen.glyph === "robin" ? T.crimson : c.petal;
    return <Pollinator kind={omen.glyph} size={omen.glyph === "ladybird" ? size - 6 : size} color={col} color2={c.tip} animate={animate} idx={`omen-${omen.key}`} />;
  }
  return <FlowerGlyph variant={omen.glyph} size={size} color={c.petal} color2={c.tip} idx={`omen-${omen.key}`} />;
}

// pick today's omen (memoised). signals from buildOmenSignals(); userId → the daily seed.
export function useOmen(signals, userId) {
  return useMemo(() => { const seed = omenSeed(userId); return pickOmen(signals || {}, seed); }, [signals, userId]);
}

// THE 3-LAYER REVEAL SHEET (portaled — escapes card overflow/transform contexts)
export function OmenReveal({ omen, onClose, onPressToJournal }) {
  const [pressed, setPressed] = useState(false);
  useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  if (typeof document === "undefined") return null;
  const c = cwOf(omen.accent || "gold");
  const press = async () => { setPressed(true); try { await onPressToJournal?.(omen); } catch { /* optimistic */ } };
  return createPortal(
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <style>{KEYFRAMES}</style>
      <div onClick={onClose} className="fw-omen-anim" style={{ position: "absolute", inset: 0, background: "rgba(11,8,5,0.44)", animation: "fwOmenScrim .22s ease-out" }} />
      <div className="fw-omen-anim fw-sheet-safe" style={{ position: "relative", width: "100%", maxWidth: 480, maxHeight: "86vh", overflowY: "auto", background: T.paperHi, borderRadius: "22px 22px 0 0", borderTop: `1px solid ${T.paperDeep}`, boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", padding: 18, animation: "fwOmenSheet .3s cubic-bezier(.32,.72,.24,1)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gold }}>Today's almanac</div>
            <h3 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: OXBLOOD, margin: "2px 0 0", lineHeight: 1.2 }}>{omen.meaning}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 34, height: 34, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><X size={16} color={T.muted} /></button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 12px" }}><OmenGlyph omen={omen} size={56} /></div>
        {/* layer 2 — the "they say…" line */}
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: T.ink, lineHeight: 1.5, margin: "0 0 12px", textAlign: "center" }}>{omen.line}</p>
        {/* layer 3 — why now + the nudge */}
        <div style={{ background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${c.petal}`, borderRadius: 12, padding: "11px 14px", marginBottom: 14 }}>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: c.petal, marginBottom: 4 }}>Why now</div>
          <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5, margin: 0 }}>{omen.why}</p>
          {omen.nudge && <p style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5, margin: "8px 0 0" }}>{omen.nudge}</p>}
        </div>
        {onPressToJournal && (pressed
          ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: `${cwOf("sage").petal}14`, border: `1px solid ${cwOf("sage").petal}`, borderRadius: 12, padding: "12px 14px", fontFamily: UI, fontSize: 13, fontWeight: 700, color: "#3f6b3f" }}><Check size={15} /> Pressed into your journal</div>
          : <button onClick={press} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: c.petal, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}><Feather size={15} /> Press to your journal</button>)}
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, textAlign: "center", margin: "10px 0 0", lineHeight: 1.5 }}>One omen a day, hope-only — never a promise. The garden just notices.</p>
      </div>
    </div>,
    document.body
  );
}

// THE FLAGSHIP ALMANAC MOMENT (Today) — the day's omen line + a tap to reveal.
export function OmenAlmanac({ signals, userId, onPressToJournal, style }) {
  const omen = useOmen(signals, userId);
  const [open, setOpen] = useState(false);
  if (!omen) return null;
  const c = cwOf(omen.accent || "gold");
  return (
    <>
      <button onClick={() => setOpen(true)} className="fw-omen-anim" aria-label="Read today's almanac"
        style={{ width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}14 100%)`, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${c.petal}`, borderRadius: 18, padding: "14px 15px", boxShadow: "0 4px 18px rgba(58,44,26,0.10)", animation: "fwOmenIn .5s cubic-bezier(.215,.61,.355,1) both", ...style }}>
        <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 12, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center" }}><OmenGlyph omen={omen} size={32} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gold, display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={12} /> Today's almanac</span>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.ink, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginTop: 2 }}>{omen.line}</span>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: c.petal, marginTop: 3, display: "inline-block" }}>Tap to read ›</span>
        </span>
      </button>
      {open && <OmenReveal omen={omen} onClose={() => setOpen(false)} onPressToJournal={onPressToJournal} />}
    </>
  );
}

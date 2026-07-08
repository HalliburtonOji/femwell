// SliderKit — the shared "dense sliding-card" layout primitives proven on the Planner demo.
// One HORIZONTAL board slider (Clipboard/ClipboardSlider) + in-card decks that can be horizontal
// (Deck) AND/OR a vertical up↕down segment slide (VSeg). Every Panel is a uniform CARD_H and fills
// it → no long empty space. Plus the top-area chrome pills, colour pills, and the bottom-sheet shell.
//
// Reused by /PlannerNewDemo (inline today), /NutritionNewDemo, /LifestyleNewDemo. Brand: oxblood
// (#7A1A12 == bible --fw-heading-color) script headings, paper surfaces, Lucide only, no emoji.
import { useState, useRef, forwardRef, useImperativeHandle, Children, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Grid2x2, CalendarRange } from "lucide-react";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { cwOf } from "@/components/brand/flora";

export const OXBLOOD = "#7A1A12";   // deep-red script heading colour
export const CARD_H = 432;          // legacy single-panel height (kept for back-compat)
export const BOARD_BODY_H = 820;    // FULL-LENGTH board body → split 50/50, each half fits its lens (no internal scroll)

export const lbl = { fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted };
export const subCard = (accent) => ({ background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: "10px 12px" });
export const focusPill = (c) => ({ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 12px", borderRadius: 999, background: c, color: "#fff", border: "none", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 2px 8px ${c}40` });
export const navBtn = (disabled) => ({ width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: disabled ? "transparent" : T.paperHi, color: disabled ? T.paperDeep : T.muted, display: "grid", placeItems: "center", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0 });
export const fieldLabel = { fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, display: "block", marginBottom: 6 };
export const inputBase = { width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 11, background: T.paper, border: `1px solid ${T.paperDeep}`, fontFamily: SERIF, fontSize: 15, color: T.ink, outline: "none" };

// focused COLOUR PILL — filled (action) or tinted (option)
export function Pill({ Icon, children, cw = "gold", filled, onClick, active }) {
  const c = cwOf(cw).petal;
  const style = filled || active ? { background: c, color: "#fff", border: `1px solid ${c}` } : { background: `${c}14`, color: T.inkSoft, border: `1px solid ${c}55` };
  return <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer", ...style }}>{Icon && <Icon size={13} color={filled || active ? "#fff" : c} />}{children}</button>;
}

// a FILL panel (header + content) — fills its parent's height. The unit of a sub-slider lens.
export function Panel({ label, Icon, accent, children }) {
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      {(label || Icon) && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9, flexShrink: 0 }}>
          {Icon && <Icon size={14} color={accent} />}<span style={{ ...lbl, color: accent }}>{label}</span>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

// a fixed-height board body — wraps a board's content so every board is the SAME height (no inter-board gap)
export function BoardBody({ children, h = BOARD_BODY_H }) {
  return <div style={{ height: h, minHeight: 0, display: "flex", flexDirection: "column" }}>{children}</div>;
}

// horizontal in-card deck (lens sub-slider) — FILLS its parent height; direct-scroll, ref-controllable
export const Deck = forwardRef(function Deck({ children, accent = T.gold }, ref) {
  const items = Children.toArray(children).filter(Boolean);
  const trackRef = useRef(null); const [active, setActive] = useState(0); const last = items.length - 1;
  const goTo = (i) => { const idx = Math.max(0, Math.min(last, i)); setActive(idx); const el = trackRef.current; if (el) el.scrollLeft = idx * el.clientWidth; };
  useImperativeHandle(ref, () => ({ goTo }), [last]);
  const onScroll = () => { const el = trackRef.current; if (!el) return; const i = Math.round(el.scrollLeft / (el.clientWidth || 1)); if (i !== active) setActive(Math.max(0, Math.min(last, i))); };
  if (items.length <= 1) return <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>{items}</div>;
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div ref={trackRef} onScroll={onScroll} className="fw-deck-track" style={{ flex: 1, minHeight: 0, display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", overscrollBehaviorX: "contain", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        <style>{`.fw-deck-track::-webkit-scrollbar{display:none}`}</style>
        {items.map((c, i) => <div key={i} style={{ flex: "0 0 100%", width: "100%", height: "100%", minWidth: 0, boxSizing: "border-box", scrollSnapAlign: "start", display: "flex", flexDirection: "column" }}>{c}</div>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "7px 0 0", flexShrink: 0 }}>
        <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous lens" style={navBtn(active === 0)}><ChevronLeft size={15} /></button>
        <div style={{ display: "flex", gap: 6 }}>{items.map((_, i) => <button key={i} onClick={() => goTo(i)} aria-label={`Lens ${i + 1}`} style={{ width: i === active ? 16 : 6, height: 6, borderRadius: 999, border: "none", padding: 0, background: i === active ? accent : T.paperDeep, cursor: "pointer", transition: "width .2s" }} />)}</div>
        <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Next lens" style={navBtn(active === last)}><ChevronRight size={15} /></button>
      </div>
    </div>
  );
});

// STACKED CARD — ONE long card split into TWO demarcations (top + bottom), EACH its own horizontal
// sub-slider. The card stays full length; the two halves each fill ~half and slide sideways independently.
// (Vertical reveal is allowed only WITHIN a lens via its own overflow — never as a whole-card swap.)
export function StackedCard({ top, bottom, topAccent = T.gold, bottomAccent = T.gold }) {
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0 }}><Deck accent={topAccent}>{top}</Deck></div>
      {/* quiet gold hairline between the top and bottom demarcations (fades at the ends) */}
      <div aria-hidden style={{ flexShrink: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, opacity: 0.5, margin: "9px 0" }} />
      <div style={{ flex: 1, minHeight: 0 }}><Deck accent={bottomAccent}>{bottom}</Deck></div>
    </div>
  );
}

// SliderArrows — subtle on-brand ‹ › to move between the BIGGER cards (the main board slider) by tap,
// not only swipe. Place INSIDE a position:relative wrapper around <ClipboardSlider>. Direct-scrolls the
// board track by one board (reliable; smooth scroll on nested tracks can no-op).
export function SliderArrows({ sliderRef, top = 92 }) {
  const go = (dir) => {
    const track = sliderRef.current?.querySelector(".fw-clipboard-track"); if (!track) return;
    const kids = [...track.children].filter((c) => c.offsetWidth > 40); if (kids.length < 2) return;
    const pitch = kids[1].offsetLeft - kids[0].offsetLeft || track.clientWidth;
    const cur = Math.round(track.scrollLeft / pitch);
    const t = Math.max(0, Math.min(kids.length - 1, cur + dir));
    track.scrollLeft = kids[t].offsetLeft - track.offsetLeft;
  };
  const base = { position: "absolute", top, zIndex: 6, width: 30, height: 30, borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: "rgba(244,239,227,0.86)", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(58,44,26,0.14)" };
  return (
    <>
      <button onClick={() => go(-1)} aria-label="Previous board" style={{ ...base, left: -2 }}><ChevronLeft size={16} color={T.gold} /></button>
      <button onClick={() => go(1)} aria-label="Next board" style={{ ...base, right: -2 }}><ChevronRight size={16} color={T.gold} /></button>
    </>
  );
}

// VERTICAL 2-(or-more)-segment in-card slide (up segment ↕ down segment)
export function VSeg({ children, accent = T.gold }) {
  const items = Children.toArray(children).filter(Boolean);
  const trackRef = useRef(null); const [active, setActive] = useState(0); const last = items.length - 1;
  const goTo = (i) => { const idx = Math.max(0, Math.min(last, i)); setActive(idx); const el = trackRef.current; if (el) el.scrollTop = idx * el.clientHeight; };
  const onScroll = () => { const el = trackRef.current; if (!el) return; const i = Math.round(el.scrollTop / (el.clientHeight || 1)); if (i !== active) setActive(Math.max(0, Math.min(last, i))); };
  if (items.length <= 1) return <div>{items}</div>;
  return (
    <div style={{ position: "relative", height: CARD_H }}>
      <div ref={trackRef} onScroll={onScroll} className="fw-vseg-track" style={{ height: "100%", overflowY: "auto", scrollSnapType: "y mandatory", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        <style>{`.fw-vseg-track::-webkit-scrollbar{display:none}`}</style>
        {items.map((c, i) => <div key={i} style={{ height: CARD_H, scrollSnapAlign: "start", boxSizing: "border-box", paddingRight: 34 }}>{c}</div>)}
      </div>
      <div style={{ position: "absolute", right: 2, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
        <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Slide up" style={navBtn(active === 0)}><ChevronUp size={15} /></button>
        {items.map((_, i) => <button key={i} onClick={() => goTo(i)} aria-label={`Segment ${i + 1}`} style={{ width: 6, height: i === active ? 16 : 6, borderRadius: 999, border: "none", padding: 0, background: i === active ? accent : T.paperDeep, cursor: "pointer", transition: "height .2s" }} />)}
        <button onClick={() => goTo(active + 1)} disabled={active === last} aria-label="Slide down" style={navBtn(active === last)}><ChevronDown size={15} /></button>
      </div>
    </div>
  );
}

// fixed top-left Jump-to pill (every page). GO-LIVE 2026-07: the per-page top-RIGHT
// "Calendar" pill is RETIRED — the persistent global calendar icon (Layout, top-right)
// is now the single calendar entry, so this used to sit UNDER it. `onCalendar` is
// accepted-but-ignored so existing callers don't break.
export function TopChrome({ onJump }) {
  const base = { position: "fixed", top: "calc(env(safe-area-inset-top,0px) + 10px)", zIndex: 45, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999, border: `1px solid ${T.paperDeep}`, background: T.paperHi, fontFamily: UI, fontSize: 12, fontWeight: 700, color: T.inkSoft, boxShadow: "0 2px 12px rgba(58,44,26,0.18)", cursor: "pointer" };
  return (
    <>
      <button onClick={onJump} aria-label="Jump to an area" style={{ ...base, left: 12 }}><Grid2x2 size={13} style={{ color: T.gold }} /> Jump to</button>
    </>
  );
}

// the canonical bottom-sheet shell
export function SheetShell({ title, eyebrowText, accent, onClose, children }) {
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9990, background: "rgba(11,8,5,0.42)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: T.paperHi, borderRadius: "22px 22px 0 0", borderTop: `3px solid ${accent}`, padding: "16px 18px calc(24px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 32px rgba(58,44,26,0.22)", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <div style={{ flex: 1 }}><div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>{eyebrowText}</div><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, fontWeight: 600, color: T.ink }}>{title}</div></div>
          <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.muted, cursor: "pointer", display: "grid", placeItems: "center" }}><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// JumpSheet — lists the page's boards; tapping calls onJump(idx) (scrolls the slider)
export function JumpSheet({ boards, onClose, onJump }) {
  const accents = [cwOf("gold").petal, cwOf("sage").petal, cwOf("crimson").petal, cwOf("plum").petal, cwOf("blush").petal];
  return (
    <SheetShell title="Jump to" eyebrowText="This page" accent={cwOf("gold").petal} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{boards.map((b, i) => (
        <button key={b.t} onClick={() => onJump(i)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "13px 14px", borderRadius: 14, background: T.paper, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${accents[i % accents.length]}`, cursor: "pointer", textAlign: "left" }}>
          <span><span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, fontWeight: 600, color: OXBLOOD, display: "block", lineHeight: 1.1 }}>{b.t}</span><span style={{ fontFamily: UI, fontSize: 13, color: T.muted }}>{b.sub}</span></span>
          <ChevronRight size={16} color={T.muted} style={{ marginLeft: "auto", flexShrink: 0, alignSelf: "center" }} />
        </button>
      ))}</div>
    </SheetShell>
  );
}

// CalendarOverlay — the UNIFIED app-wide calendar (same MonthlyCalendarCard + DayDetailSheet Today uses)
export function makeCalendarOverlay(MonthlyCalendarCard, DayDetailSheet) {
  return function CalendarOverlay({ user, profile, onClose }) {
    const [selectedDay, setSelectedDay] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9990, background: T.paper, overflowY: "auto" }} role="dialog" aria-modal="true" aria-label="Calendar">
        <div style={{ position: "sticky", top: 0, zIndex: 1, display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: T.paperHi, borderBottom: `1px solid ${T.paperDeep}` }}>
          <button onClick={onClose} aria-label="Close calendar" style={{ width: 32, height: 32, borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.inkSoft, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={16} /></button>
          <div style={{ flex: 1 }}><div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.gold }}>Across FemWell</div><div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, fontWeight: 600, color: OXBLOOD }}>Calendar</div></div>
          <CalendarRange size={20} color={T.gold} />
        </div>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "14px 16px 40px" }}>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, margin: "0 0 14px" }}>Tap any day to plan or log it. This is the one calendar across FemWell — the same month view your Today page uses.</p>
          <MonthlyCalendarCard userId={user?.id} profile={profile} refreshKey={refreshKey} onDayPress={(day, dayData) => setSelectedDay({ day, dayData })} />
          {selectedDay && <DayDetailSheet date={selectedDay.day} dayData={selectedDay.dayData} userId={user?.id} onClose={() => setSelectedDay(null)} onDataChanged={() => setRefreshKey((k) => k + 1)} />}
        </div>
      </div>
    );
  };
}

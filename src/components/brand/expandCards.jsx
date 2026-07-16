// ─────────────────────────────────────────────────────────────────────────────
// expandCards.jsx — the shared "tap-to-expand" card language (Breeze-inspired,
// content-only). A collapsed FloraCover CoverCard → tap → a full-screen ExpandDetailCard
// (big flora cover · Fraunces title · inline player · detail rows · topic chips · rich
// body · sticky Save + primary actions) with a smooth scale-fade expand + back/Esc/scrim.
// Extracted so /ClipboardExpandDemo and /StackedExpandDemo share the SAME expand + covers.
// Content only — people/connection must run through the DM safety rails (see the doc).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from "react";
import { T, SERIF, UI, PAPER_BG, Heart } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import FloraCover from "@/components/brand/FloraCover";
import { cwOf, Pollinator, floraKeyframes } from "@/components/brand/flora";
import {
  ChevronRight, ArrowLeft, Play, Pause, Bookmark, BookmarkCheck,
  BookOpen, Feather, Headphones, Moon, Clock, HeartPulse, Book, Users, Flame,
  MessageCircle, Sparkles, Leaf,
} from "lucide-react";

export const SCRIPT = '"Ephesis","Pinyon Script",cursive';
export const FRAUNCES = '"Fraunces","Cormorant Garamond",Georgia,serif';
export const reduceMotion = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };
export const ICON = { BookOpen, Feather, Headphones, Moon, Clock, HeartPulse, Book, Users, Flame, MessageCircle, Sparkles, Leaf, Play, ChevronRight };

export const Chip = ({ children, accent }) => (
  <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: accent, background: `${accent}14`, border: `1px solid ${accent}44`, borderRadius: 999, padding: "5px 12px" }}>#{children}</span>
);

// a SIMULATED inline player (the reference's "anthem") — play/pause + progress
export function InlinePlayer({ label, duration = 300, accent }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const raf = useRef(null);
  const last = useRef(0);
  const tick = useCallback((now) => {
    if (!last.current) last.current = now;
    const dt = (now - last.current) / 1000; last.current = now;
    setT((prev) => {
      const next = prev + dt;
      if (next >= duration) { setPlaying(false); return 0; }
      raf.current = requestAnimationFrame(tick);
      return next;
    });
  }, [duration]);
  useEffect(() => {
    if (playing) { last.current = 0; raf.current = requestAnimationFrame(tick); }
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [playing, tick]);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = Math.min(100, (t / duration) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 16, padding: "12px 14px", boxShadow: "inset 0 1px 0 rgba(255,253,247,0.6)" }}>
      <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} style={{ width: 46, height: 46, borderRadius: 999, background: accent, color: "#fff", border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, boxShadow: `0 4px 14px ${accent}55` }}>
        {playing ? <Pause size={19} /> : <Play size={19} style={{ marginLeft: 2 }} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        <div style={{ height: 5, borderRadius: 999, background: T.paperDeep, margin: "8px 0 4px", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: accent, borderRadius: 999, transition: "width .15s linear" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: UI, fontSize: 10.5, fontWeight: 600, color: T.muted }}>
          <span>{fmt(t)}</span><span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

// COLLAPSED card — cover + title + meta + "open" affordance. `compact` = the smaller
// variant used inside a StackedCard half (shorter cover, one meta line).
export function CoverCard({ item, onOpen, compact = false }) {
  const c = cwOf(item.cw);
  const I = ICON[item.Icon] || Sparkles;
  return (
    <button onClick={onOpen} className="fw-ce-press" style={{ width: "100%", height: "100%", textAlign: "left", padding: 0, border: `1px solid ${T.paperDeep}`, borderRadius: 18, overflow: "hidden", cursor: "pointer", background: `linear-gradient(165deg, ${T.paperHi} 0%, ${c.petal}12 100%)`, boxShadow: "0 6px 22px rgba(58,44,26,.10), 0 1px 4px rgba(58,44,26,.06)", display: "flex", flexDirection: "column" }}>
      <FloraCover title={item.title} category={item.category} colorway={item.cw} seed={item.id} height={compact ? 120 : 158} roundTop showTitle={false} idx={`cov-${item.id}`} />
      <div style={{ padding: compact ? "10px 13px 12px" : "13px 15px 15px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: c.petal }}><I size={12} /> {item.kind}</div>
        <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: compact ? 18 : 22, lineHeight: 1.12, color: OXBLOOD, margin: "5px 0 3px" }}>{item.title}</div>
        {!compact && <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.4 }}>{item.subtitle}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto", paddingTop: 9 }}>
          {(compact ? item.meta.slice(0, 1) : item.meta).map(([ic, label]) => { const M = ICON[ic] || Clock; return (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11.5, fontWeight: 600, color: T.muted }}><M size={13} color={c.accent} /> {label}</span>
          ); })}
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3, fontFamily: UI, fontSize: 12, fontWeight: 800, color: c.petal }}>Open <ChevronRight size={15} /></span>
        </div>
      </div>
    </button>
  );
}

// EXPANDED full-screen detail card (the Breeze "big card") — used by both demos
export function ExpandDetailCard({ item, onClose }) {
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const c = cwOf(item.cw);
  const I = ICON[item.Icon] || Sparkles;
  useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true));
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(r); window.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const close = () => { setShow(false); setTimeout(onClose, reduceMotion() ? 0 : 280); };
  const anim = reduceMotion() ? {} : { opacity: show ? 1 : 0, transform: show ? "scale(1) translateY(0)" : "scale(0.96) translateY(14px)", transition: "opacity .28s ease, transform .32s cubic-bezier(.32,.72,.24,1)" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(28,20,12,0.28)", backdropFilter: "blur(2px)", display: "flex", justifyContent: "center" }} onClick={close}>
      <style>{floraKeyframes}{`.fw-ce-press{transition:transform .12s ease}.fw-ce-press:active{transform:scale(0.98)}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ ...PAPER_BG, width: "100%", maxWidth: 460, height: "100%", overflowY: "auto", position: "relative", ...anim }}>
        <div style={{ position: "relative" }}>
          <FloraCover title={item.title} category={item.category} colorway={item.cw} seed={item.id} height={288} radius={0} showTitle={false} animate idx={`xcov-${item.id}`} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 0" }}>
            <button onClick={close} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(244,239,227,0.86)", border: `1px solid ${T.paperDeep}`, color: T.ink, display: "grid", placeItems: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}><ArrowLeft size={19} /></button>
            <button onClick={() => setSaved((s) => !s)} aria-label="Save" style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(244,239,227,0.86)", border: `1px solid ${saved ? c.petal : T.paperDeep}`, color: saved ? c.petal : T.ink, display: "grid", placeItems: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}>{saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 20px 16px", background: "linear-gradient(180deg, transparent, rgba(236,231,218,0.72) 55%, var(--paper,#ECE7DA))" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: c.petal }}><I size={13} /> {item.kind}</div>
          </div>
        </div>

        <div style={{ maxWidth: 440, margin: "0 auto", padding: "6px 20px 130px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Heart size={15} />
            <span style={{ fontFamily: SCRIPT, fontSize: 30, color: c.accent, lineHeight: 1 }}>{item.overline || "for you"}</span>
          </div>
          <h1 style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: 30, lineHeight: 1.1, color: OXBLOOD, margin: "6px 0 6px" }}>{item.title}</h1>
          {item.author && <p style={{ fontFamily: SERIF, fontSize: 15, color: c.accent, margin: "0 0 4px", fontWeight: 600 }}>{item.author}</p>}
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: T.muted, lineHeight: 1.45, margin: "0 0 16px" }}>{item.subtitle}</p>

          {item.player && <div style={{ marginBottom: 16 }}><InlinePlayer label={item.playerLabel || item.title} duration={item.duration} accent={c.petal} /></div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
            {item.meta.map(([ic, label], i) => { const M = ICON[ic] || Clock; return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderTop: i ? `1px solid ${T.paperDeep}` : "none" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `${c.petal}1C`, display: "grid", placeItems: "center", flexShrink: 0 }}><M size={15} color={c.petal} /></span>
                <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{label}</span>
              </div>
            ); })}
            {item.safe && (
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderTop: `1px solid ${T.paperDeep}`, background: `${T.sage}10` }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `${T.sage}22`, display: "grid", placeItems: "center", flexShrink: 0 }}><Heart size={14} /></span>
                <span style={{ fontFamily: SERIF, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.35 }}>Anonymous by default, screened for kindness — a content room, never a place you're put on show.</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {item.chips.map((ch) => <Chip key={ch} accent={c.petal}>{ch}</Chip>)}
          </div>

          {item.body.map((p, i) => (
            <p key={i} style={{ fontFamily: SERIF, fontSize: 16.5, color: T.ink, lineHeight: 1.62, margin: "0 0 13px" }}>{p}</p>
          ))}

          <div style={{ display: "grid", placeItems: "center", margin: "18px 0 0" }}>
            <Pollinator kind="butterfly" size={30} color={c.petal} color2={T.gold} pattern="bands" animate idx={`xcr-${item.id}`} />
          </div>
        </div>

        {/* sticky primary actions */}
        <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, padding: "12px 16px calc(14px + env(safe-area-inset-bottom))", background: "linear-gradient(180deg, transparent, var(--paper,#ECE7DA) 34%)", display: "flex", gap: 10, maxWidth: 460, margin: "0 auto" }}>
          <button onClick={() => setSaved((s) => !s)} className="fw-ce-press" aria-label="Save" style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 7, background: T.paperHi, border: `1px solid ${saved ? c.petal : T.paperDeep}`, color: saved ? c.petal : T.muted, borderRadius: 14, padding: "13px 15px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{item.actions.length < 2 ? (saved ? " Saved" : " Save") : ""}</button>
          {item.actions.map((a) => { const A = ICON[a.Icon] || ChevronRight; return (
            <button key={a.label} className="fw-ce-press" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: a.primary ? c.petal : T.paperHi, color: a.primary ? "#fff" : c.petal, border: a.primary ? "none" : `1px solid ${c.petal}`, borderRadius: 14, padding: "13px 12px", fontFamily: UI, fontSize: 13.5, fontWeight: 800, cursor: "pointer", boxShadow: a.primary ? `0 4px 16px ${c.petal}44` : "none" }}><A size={16} /> {a.label}</button>
          ); })}
        </div>
      </div>
    </div>
  );
}

// YourDayRituals — the RITUAL BUILDER surfaced on Today (slide-left from "Your day").
//
// A clipboard-board of ~4 ritual mini-cards. Each opens the §6.7.6 QUICK-ACTION POPUP ("do it right
// here" → it ticks; never a bare checkbox, never a link-out), and completing a ritual GROWS THE GARDEN:
// it waters the companion (tendCompanion — existing path, no new function) and, after a few, a
// pollinator (butterfly) visits. Brand: Cormorant/Ephesis, one flora accent per ritual, a meaning-bloom
// that opens on completion instead of a cold checkmark, no emoji, reduced-motion-safe.

import { useEffect, useState } from "react";
import { Wind, Droplet, Footprints, Sparkles, X, Check, Plus } from "lucide-react";
import { T, UI, SERIF, Hand } from "@/components/journal/Editorial";
import { FlowerGlyph, Butterfly, RichBloomV2, lighten } from "@/components/brand/flora";
import { tendCompanion } from "@/components/nurture/companion";
import { useScrollLock } from "@/utils/useScrollLock";

const ritualsFor = (phase) => [
  { key: "rest", Icon: Wind, accent: "#8E6E8E", flower: "lavender", label: "A moment of rest", sub: "three slow breaths", kind: "breath", done: "Rested — your companion softened." },
  { key: "water", Icon: Droplet, accent: T.sage, flower: "snowdrop", label: "A glass of water", sub: phase === "luteal" ? "extra kind this luteal week" : "a small kindness", kind: "water", done: "Hydrated — a little greener." },
  { key: "move", Icon: Footprints, accent: T.gold, flower: "sunflower", label: "Gentle movement", sub: "two easy minutes", kind: "move", done: "Moved — the garden stirs." },
  { key: "intention", Icon: Sparkles, accent: T.crimson, flower: "iris", label: "Set an intention", sub: "one word for today", kind: "intention", done: "Planted — a seed for today." },
];

const ICON_DISC = (Icon, accent) => (
  <span style={{ width: 32, height: 32, borderRadius: 9, background: T.wax, border: `1px solid ${T.paperDeep}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
    <Icon size={16} strokeWidth={1.7} color={accent} />
  </span>
);

export default function YourDayRituals({ uid, phase, companionForm = "peony", companionAccent = T.blush, onTend }) {
  const rituals = ritualsFor(phase);
  const [done, setDone] = useState({});
  const [active, setActive] = useState(null);     // ritual being done in the popup
  const tendedCount = Object.values(done).filter(Boolean).length;
  const pollinator = tendedCount >= 3;            // a pollinator visits once a few rituals are tended

  const complete = (r) => {
    setDone((d) => ({ ...d, [r.key]: true }));
    try { if (uid) tendCompanion(uid, `Ritual: ${r.label}`); } catch { /* ignore */ }
    onTend && onTend(`Ritual: ${r.label}`);
    setActive(null);
  };

  return (
    <div>
      <Hand size={15} color={T.muted} style={{ display: "block", margin: "0 0 12px", lineHeight: 1.5 }}>
        {tendedCount > 0 ? `${tendedCount} of ${rituals.length} tended — each one waters your garden.` : "Small acts, done in the moment. Each one grows your companion."}
      </Hand>

      {/* 2×2 grid of ritual mini-cards (§6.10 stack) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {rituals.map((r) => {
          const isDone = !!done[r.key];
          return (
            <button
              key={r.key}
              onClick={() => !isDone && setActive(r)}
              aria-label={r.label}
              style={{
                position: "relative", overflow: "hidden", textAlign: "left", cursor: isDone ? "default" : "pointer",
                background: `linear-gradient(165deg, ${T.paperHi} 0%, ${r.accent}14 100%)`,
                border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${r.accent}`, borderRadius: 16,
                padding: "13px 13px 14px", minHeight: 132, display: "flex", flexDirection: "column",
                boxShadow: "0 4px 14px rgba(58,44,26,0.09)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {ICON_DISC(r.Icon, r.accent)}
                <span style={{ marginLeft: "auto" }}>
                  {isDone
                    ? <FlowerGlyph variant={r.flower} size={26} color={r.accent} idx={`rd-${r.key}`} />
                    : <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: r.accent, border: `1px solid ${r.accent}66`, borderRadius: 99, padding: "2px 7px" }}>do it</span>}
                </span>
              </div>
              <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: isDone ? T.muted : T.ink, lineHeight: 1.25, textDecoration: isDone ? "line-through" : "none" }}>{r.label}</span>
              <span style={{ fontFamily: UI, fontSize: 12, color: T.muted, marginTop: 3, lineHeight: 1.35 }}>{isDone ? "tended" : r.sub}</span>
            </button>
          );
        })}
      </div>

      {/* garden-growth footer — the companion bloom grows with each ritual; a pollinator visits at 3+ */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, padding: "12px 13px", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 14 }}>
        <div style={{ position: "relative", flexShrink: 0, width: 56, height: 56 }}>
          <RichBloomV2 form={companionForm} color={companionAccent} color2={lighten(companionAccent, 0.34)} accent={T.gold} size={56} animate soft idx="ritual-bloom" />
          {pollinator && <div style={{ position: "absolute", top: -8, right: -10 }}><Butterfly size={28} color={companionAccent} color2={T.gold} pattern="spots" animate idx="ritual-bf" /></div>}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, lineHeight: 1.3 }}>
            {pollinator ? "A butterfly came to visit." : tendedCount > 0 ? "Your companion is blooming." : "Your companion is resting."}
          </div>
          <div style={{ fontFamily: UI, fontSize: 12.5, color: T.muted, marginTop: 2 }}>
            {pollinator ? "Tended enough today to earn a pollinator." : `${tendedCount} of ${rituals.length} rituals · ${rituals.length - tendedCount} more to draw a pollinator.`}
          </div>
        </div>
      </div>

      {active && <RitualQuickPopup ritual={active} onClose={() => setActive(null)} onDone={() => complete(active)} />}
    </div>
  );
}

// ── §6.7.6 quick-action popup — do the ritual in place, then it ticks + a bloom opens ────────────────
function RitualQuickPopup({ ritual, onClose, onDone }) {
  useScrollLock(true);
  const [text, setText] = useState("");
  useEffect(() => { const k = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const a = ritual.accent;
  const canDone = ritual.kind === "intention" ? text.trim().length > 0 : true;
  const cta = ritual.kind === "water" ? "Add the glass" : ritual.kind === "intention" ? "Plant it" : "Done";

  return (
    <div role="dialog" aria-modal="true" aria-label={ritual.label} className="fw-scrim-anim"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 220, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(11,8,5,0.42)", animation: "fwScrimIn .22s ease both" }}>
      <style>{`@keyframes fwScrimIn{from{opacity:0}to{opacity:1}}@keyframes fwSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fwBreath{0%,100%{transform:scale(0.78);opacity:.55}50%{transform:scale(1.12);opacity:1}}@media (prefers-reduced-motion:reduce){.fw-sheet-anim,.fw-scrim-anim,.fw-breath{animation:none!important}}`}</style>
      <div onClick={(e) => e.stopPropagation()} className="fw-sheet-anim fw-sheet-safe"
        style={{ background: T.paperHi, width: "100%", maxWidth: 460, borderRadius: "20px 20px 0 0", padding: "16px 18px 24px", maxHeight: "86vh", overflowY: "auto", boxShadow: "0 -8px 32px rgba(11,8,5,0.22)", animation: "fwSheetIn .3s cubic-bezier(.32,.72,.24,1) both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: a }}>Ritual · on Today</span>
          <button onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "inline-flex" }}><X size={18} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
          {ICON_DISC(ritual.Icon, a)}
          <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: T.ink, margin: 0 }}>{ritual.label}</h2>
        </div>

        {/* per-type body */}
        {ritual.kind === "breath" && (
          <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
            <div className="fw-breath" style={{ width: 86, height: 86, margin: "6px auto 10px", borderRadius: "50%", background: `radial-gradient(circle, ${a}55 0%, ${a}1A 70%, transparent 100%)`, animation: "fwBreath 5s ease-in-out infinite" }} />
            <p style={{ fontFamily: SERIF, fontSize: 17, color: T.inkSoft, lineHeight: 1.5, margin: 0 }}>Breathe in as it grows… and out as it softens. Three slow rounds, then tap done.</p>
          </div>
        )}
        {ritual.kind === "water" && (
          <p style={{ fontFamily: SERIF, fontSize: 17, color: T.inkSoft, lineHeight: 1.5, margin: "2px 0 4px" }}>A glass of water, right now. Small, kind, and your body will thank you{ritual.sub.includes("luteal") ? " — especially this week" : ""}.</p>
        )}
        {ritual.kind === "move" && (
          <p style={{ fontFamily: SERIF, fontSize: 17, color: T.inkSoft, lineHeight: 1.5, margin: "2px 0 4px" }}>Two easy minutes — a stretch at the window, a slow walk down the hall, roll your shoulders. Nothing strenuous. Move, then tap done.</p>
        )}
        {ritual.kind === "intention" && (
          <div style={{ padding: "2px 0 4px" }}>
            <p style={{ fontFamily: SERIF, fontSize: 17, color: T.inkSoft, lineHeight: 1.5, margin: "0 0 10px" }}>One word for today — soft, brave, slow, enough…</p>
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={40} placeholder="your word…" autoFocus
              style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "12px 13px", fontFamily: SERIF, fontSize: 18, color: T.ink, outline: "none" }} />
          </div>
        )}

        <button onClick={() => canDone && onDone()} disabled={!canDone}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", marginTop: 16, background: a, color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px", fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: canDone ? "pointer" : "default", opacity: canDone ? 1 : 0.5 }}>
          {ritual.kind === "intention" ? <Sparkles size={15} /> : ritual.kind === "water" ? <Plus size={15} /> : <Check size={15} />} {cta}
        </button>
        <p style={{ fontFamily: UI, fontSize: 12, color: T.muted, textAlign: "center", margin: "10px 0 0" }}>Completing it waters your companion — a little growth, not a score.</p>
      </div>
    </div>
  );
}

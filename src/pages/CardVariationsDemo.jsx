// ─────────────────────────────────────────────────────────────────────────────
// CardVariationsDemo.jsx — THE CARD SET (§6.7.7). Every content type the clipboard
// houses, on the ONE shared pattern: a FloraCover cover-card → tap → the full-screen
// ExpandDetailCard, with the right typed blocks + inline action per type.
//   article · book · audio · session · daily story · video · ritual · quote · horoscope · recipe
// Driven entirely by CARD_TYPES + SAMPLE_CARDS from brand/expandCards.jsx — the same
// components the live pages (Lifestyle/Library/Programs) consume. Content only.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { T, SERIF, UI, PAPER_BG, Heart } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { ClipboardSlider } from "@/components/brand/ClipboardSlider";
import { cwOf, floraKeyframes } from "@/components/brand/flora";
import { CoverCard, ExpandDetailCard, SCRIPT, CARD_TYPES, SAMPLE_CARDS, ICON, resolveCard } from "@/components/brand/expandCards";
import { ChevronLeft, Sparkles } from "lucide-react";

// what each type's expand leads with — the "why this variant exists" line
const BLOCK_NOTE = {
  article: "Body prose · optional narrated player",
  book: "Author + an excerpt · Talk about it / Open reader",
  audio: "Inline player + show notes",
  session: "Voiced player + what you'll do",
  daily_story: "Today's excerpt + read on",
  video: "Inline video player + watch",
  ritual: "Numbered steps + begin",
  quote: "A big pull-quote + set as today's",
  horoscope: "An almanac reading (hope-only)",
  recipe: "Ingredients + method + cook",
};

export default function CardVariationsDemo() {
  const [open, setOpen] = useState(null);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 60 }}>
      <style>{floraKeyframes}{`.fw-ce-press{transition:transform .12s ease}.fw-ce-press:active{transform:scale(0.98)}`}</style>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "16px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/Ideas" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.muted, textDecoration: "none" }}><ChevronLeft size={15} /> Ideas</a>
        <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: T.gold }}>Founder demo · The card set</span>
      </div>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "8px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Heart size={15} />
          <span style={{ fontFamily: SCRIPT, fontSize: 40, color: OXBLOOD, lineHeight: 1 }}>The card set</span>
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: T.muted, lineHeight: 1.5, margin: "6px 0 4px", maxWidth: 350 }}>
          Ten content types, one card language. Same flora cover, same swipe, same tap-to-open — only the detail blocks and the inline action change. Tap any card to see its variant.
        </p>
      </div>

      {/* the legend — the SET at a glance */}
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "12px 16px 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {Object.entries(CARD_TYPES).map(([key, t]) => {
            const c = cwOf(t.cw); const I = ICON[t.Icon] || Sparkles;
            return (
              <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${c.petal}12`, border: `1px solid ${c.petal}44`, borderRadius: 999, padding: "5px 11px", fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: c.accent }}>
                <I size={12} color={c.petal} /> {key.replace("_", " ")}
              </span>
            );
          })}
        </div>
      </div>

      {/* the ten cards — tap → the typed expand */}
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "12px 14px 0" }}>
        <ClipboardSlider hint="Slide the set" accent={T.gold}>
          {SAMPLE_CARDS.map((it) => (
            <CoverCard key={it.id} item={it} onOpen={() => setOpen(it)} />
          ))}
        </ClipboardSlider>
      </div>

      {/* what each variant leads with */}
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "18px 16px 0" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, fontWeight: 600, color: OXBLOOD, marginBottom: 9 }}>What each one opens into</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, overflow: "hidden" }}>
          {SAMPLE_CARDS.map((raw, i) => {
            const it = resolveCard(raw); const c = cwOf(it.cw); const I = ICON[it.Icon] || Sparkles;
            return (
              <button key={it.id} onClick={() => setOpen(raw)} className="fw-ce-press" style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderTop: i ? `1px solid ${T.paperDeep}` : "none", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: `${c.petal}1C`, display: "grid", placeItems: "center", flexShrink: 0 }}><I size={15} color={c.petal} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: UI, fontSize: 12, fontWeight: 800, color: c.accent }}>{it.kind}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft }}>{BLOCK_NOTE[raw.type]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "20px auto 0", maxWidth: 320, lineHeight: 1.5 }}>
        These are the components the live pages consume. Content only — people &amp; connection run through the DM safety rails.
      </p>

      {open && <ExpandDetailCard item={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

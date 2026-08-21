// Lifestyle · CALM (progressive disclosure) — redesign demo #1 (2026-08-09).
// THESIS: "show me one good thing; let me ask for the rest." The first screen is ~3 elements — one
// hero pick + one action + a single LABELLED disclosure ("More of your life ▾"). The 11 domains stay
// collapsed until explicitly opened. The inverse of today's show-everything-at-once. One decision at
// a time (Hick's law). Baseline audit fixes via the shared kit. Seeded/self-contained; live
// /Lifestyle untouched; reversible.
import React, { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw, ChevronRight } from "lucide-react";
import { AA, SERIF, UI, PAGE, Tap, Eyebrow, ActionButton, DemoNav, ThesisNote } from "@/components/lifestyle-demos/kit";
import { DEMO_ITEMS, ItemReader } from "@/components/lifestyle-demos/content";

export default function LifestyleCalmDemo() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(null);
  const hero = DEMO_ITEMS[heroIdx];
  const heroAccentText = hero.accent === AA.crimsonBig ? AA.crimson : hero.accent;
  const rest = DEMO_ITEMS.filter((_, i) => i !== heroIdx);

  return (
    <div style={PAGE}>
      <DemoNav title="Calm · progressive disclosure" />
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "20px 18px calc(80px + env(safe-area-inset-bottom))" }}>
        <ThesisNote>The first screen is ~3 things: one hero pick, one action, and a single labelled "more". The whole-life breadth stays folded away until you ask for it — the inverse of showing everything at once. One decision at a time.</ThesisNote>

        {/* minimal masthead */}
        <Eyebrow>Follicular · day 10 · a building week</Eyebrow>
        <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 600, color: AA.crimsonBig, lineHeight: 1.14, margin: "3px 0 20px" }}>One thing, to start.</h1>

        {/* THE ONE HERO — a single focused card */}
        <div style={{ background: AA.paperHi, border: `1px solid ${AA.line}`, borderTop: `3px solid ${hero.accent}`, borderRadius: 16, padding: "18px 17px 17px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: `${hero.accent}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><hero.Icon size={17} color={heroAccentText} /></span>
            <Eyebrow color={heroAccentText} style={{ marginBottom: 0 }}>{hero.kicker}</Eyebrow>
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: AA.ink, lineHeight: 1.2, margin: "0 0 8px" }}>{hero.hook}</h2>
          <p style={{ fontFamily: SERIF, fontSize: 16.5, color: AA.inkSoft, lineHeight: 1.55, margin: "0 0 16px" }}>{hero.line}</p>
          <ActionButton bg={hero.accent} onClick={() => setOpen(hero)}><hero.Icon size={17} /> {hero.act}</ActionButton>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <Tap onClick={() => { setHeroIdx((heroIdx + 1) % DEMO_ITEMS.length); setExpanded(false); }} style={{ gap: 6, padding: "8px 14px", background: "transparent", border: "none", color: AA.muted, fontFamily: UI, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
              <RefreshCw size={14} /> Not that? Show me another
            </Tap>
          </div>
        </div>

        {/* THE SINGLE DISCLOSURE — everything else lives behind this one labelled control */}
        <Tap onClick={() => setExpanded(!expanded)} aria-expanded={expanded} style={{ width: "100%", justifyContent: "space-between", marginTop: 22, padding: "15px 16px", background: AA.paperHi, border: `1px solid ${AA.line}`, borderRadius: 14, cursor: "pointer" }}>
          <span style={{ fontFamily: UI, fontSize: 15, fontWeight: 700, color: AA.ink }}>{expanded ? "That's plenty for now" : "More of your life"}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: AA.muted, fontFamily: UI, fontSize: 13, fontWeight: 700 }}>
            {expanded ? "Show less" : `${rest.length} more, when you want them`} {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </Tap>

        {/* revealed only on request — a calm labelled LIST (no sliders), each opens in place */}
        {expanded && (
          <div style={{ marginTop: 12, border: `1px solid ${AA.line}`, borderRadius: 14, overflow: "hidden" }}>
            {rest.map((it, i) => { const acc = it.accent === AA.crimsonBig ? AA.crimson : it.accent; return (
              <Tap key={it.id} onClick={() => setOpen(it)} style={{ width: "100%", justifyContent: "flex-start", gap: 12, padding: "14px 15px", background: AA.paperHi, border: "none", borderTop: i === 0 ? "none" : `1px solid ${AA.line}`, cursor: "pointer", textAlign: "left" }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: `${it.accent}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><it.Icon size={17} color={acc} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: acc }}>{it.kicker}</span>
                  <span style={{ display: "block", fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: AA.ink, lineHeight: 1.25, marginTop: 1 }}>{it.hook}</span>
                </span>
                <ChevronRight size={18} color={AA.muted} style={{ flexShrink: 0 }} />
              </Tap>
            ); })}
          </div>
        )}

        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: AA.muted, textAlign: "center", lineHeight: 1.55, margin: "30px 0 0" }}>Nothing else is asking for you. It's all here the moment you want it — and quiet until then.</p>
      </div>
      {open && <ItemReader item={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

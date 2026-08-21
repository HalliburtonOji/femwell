// Lifestyle · GUIDED (task-first) — redesign demo #4 (2026-08-09).
// THESIS: "start from what you feel like doing, not from 11 rooms." The page leads with INTENT —
// a few large human buckets (read · watch · listen · move · connect · treat) — and routes into the
// right content. The 11 domains become the machinery behind ~6 goals. Organised around how people
// actually think ("I want something to watch"), not our sitemap. Fewer choices (Hick's law); matches
// the real world (Nielsen H2). Baseline audit fixes via the shared kit. Seeded/self-contained.
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AA, SERIF, UI, PAGE, Tap, Eyebrow, ActionButton, DemoNav, ThesisNote } from "@/components/lifestyle-demos/kit";
import { DEMO_ITEMS, INTENTS, ItemReader } from "@/components/lifestyle-demos/content";

export default function LifestyleGuidedDemo() {
  const [intent, setIntent] = useState(null);   // selected intent key, or null (the buckets)
  const [open, setOpen] = useState(null);
  useEffect(() => { const k = (e) => e.key === "Escape" && (open ? setOpen(null) : setIntent(null)); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open]);
  const chosen = INTENTS.find((x) => x.key === intent);
  const picks = intent ? DEMO_ITEMS.filter((it) => it.intent === intent) : [];
  const chosenAccentText = chosen && chosen.accent === AA.crimsonBig ? AA.crimson : (chosen && chosen.accent);

  return (
    <div style={PAGE}>
      <DemoNav title="Guided · task-first" />
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "20px 18px calc(80px + env(safe-area-inset-bottom))" }}>
        {!intent && (
          <>
            <ThesisNote>You start from a goal, not a taxonomy. Six human intents — read, watch, listen, move, feel-less-alone, treat myself — route you to the right content. The 11 domains are the machinery behind them. Fewer choices; matches how you actually think.</ThesisNote>
            <Eyebrow>Follicular · day 10</Eyebrow>
            <h1 style={{ fontFamily: SERIF, fontSize: 29, fontWeight: 600, color: AA.crimsonBig, lineHeight: 1.12, margin: "3px 0 4px" }}>What do you feel like?</h1>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: AA.muted, lineHeight: 1.5, margin: "0 0 18px" }}>Pick a feeling — we'll bring the right bit of your life to you.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {INTENTS.map((it) => { const acc = it.accent === AA.crimsonBig ? AA.crimson : it.accent; return (
                <Tap key={it.key} onClick={() => setIntent(it.key)} style={{ width: "100%", justifyContent: "flex-start", gap: 14, padding: "16px 16px", minHeight: 72, background: AA.paperHi, border: `1px solid ${AA.line}`, borderLeft: `4px solid ${it.accent}`, borderRadius: 14, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: `${it.accent}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><it.Icon size={22} color={acc} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: AA.ink, lineHeight: 1.15 }}>{it.label}</span>
                    <span style={{ display: "block", fontFamily: UI, fontSize: 13, color: AA.muted, marginTop: 2 }}>{it.sub}</span>
                  </span>
                  <ChevronRight size={20} color={AA.muted} style={{ flexShrink: 0 }} />
                </Tap>
              ); })}
            </div>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: AA.muted, textAlign: "center", lineHeight: 1.55, margin: "28px 0 0" }}>No rooms to learn, no sliders to hunt — just say what you're in the mood for.</p>
          </>
        )}

        {intent && (
          <>
            <Tap onClick={() => setIntent(null)} label="Back to feelings" style={{ gap: 5, padding: "9px 14px 9px 10px", marginBottom: 16, background: AA.paperHi, border: `1px solid ${AA.paperDeep}`, borderRadius: 999, color: AA.ink, fontFamily: UI, fontSize: 14, fontWeight: 700, cursor: "pointer" }}><ChevronLeft size={17} /> What else do I feel like?</Tap>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 4 }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: `${chosen.accent}1f`, display: "grid", placeItems: "center" }}><chosen.Icon size={20} color={chosenAccentText} /></span>
              <h1 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: AA.crimsonBig, lineHeight: 1.15, margin: 0 }}>{chosen.label}</h1>
            </div>
            <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: AA.muted, lineHeight: 1.5, margin: "0 0 18px" }}>{chosen.sub} — here's what's good right now.</p>

            {picks.length ? picks.map((it) => { const acc = it.accent === AA.crimsonBig ? AA.crimson : it.accent; return (
              <article key={it.id} style={{ background: AA.paperHi, border: `1px solid ${AA.line}`, borderTop: `3px solid ${it.accent}`, borderRadius: 15, padding: "15px 15px", marginBottom: 13 }}>
                <Eyebrow color={acc}>{it.kicker}</Eyebrow>
                <h2 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: AA.ink, lineHeight: 1.2, margin: "6px 0 6px" }}>{it.hook}</h2>
                <p style={{ fontFamily: SERIF, fontSize: 15.5, color: AA.inkSoft, lineHeight: 1.5, margin: "0 0 13px" }}>{it.line}</p>
                <ActionButton bg={it.accent} onClick={() => setOpen(it)}><it.Icon size={17} /> {it.act}</ActionButton>
              </article>
            ); }) : <p style={{ fontFamily: SERIF, fontSize: 16, color: AA.muted }}>Nothing queued here today — try another feeling.</p>}
          </>
        )}
      </div>
      {open && <ItemReader item={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

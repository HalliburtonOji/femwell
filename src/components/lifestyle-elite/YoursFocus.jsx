// YoursFocus — the bespoke §19 surface for "Yours" (reached from Handy → Your saved). Her drawer:
// everything she's saved, auto-grouped into collections by kind (Reads · Listens · Watches · Books ·
// Stories), then this week's phase-tuned set. Deliberately ordered saved → for-your-phase. Reads her
// real saves + cycle phase. Tap → opens the exact saved item in place. Cream design.
import React from "react";
import { Bookmark } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { T, SERIF, UI, PAPER_TEX } from "@/components/journal/Editorial";
import { cwOf, CardFrame } from "@/components/brand/flora";

const OX = "#7A1A12";
// kind → collection label + accent, in display order
const KINDS = [
  { test: (t) => t === "article" || t === "guide", label: "Reads", accent: "plum" },
  { test: (t) => t === "audio", label: "Listens", accent: "sage" },
  { test: (t) => t === "video", label: "Watches", accent: "gold" },
  { test: (t) => t === "book", label: "Books", accent: "sky" },
  { test: (t) => t === "daily_story" || t === "story", label: "Stories", accent: "crimson" },
];

function YoursCard({ eyebrow, title, accent = "gold", children }) {
  const petal = cwOf(accent).petal;
  return (
    <section style={{ position: "relative", overflow: "hidden", background: T.paperHi || "#F4EFE3", border: `1px solid ${T.line || "#d8cfbc"}`, borderLeft: `4px solid ${petal}`, borderRadius: 18, padding: "16px 17px", boxShadow: "0 6px 22px rgba(58,44,26,.08), 0 1px 3px rgba(58,44,26,.05)" }}>
      <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${PAPER_TEX})`, backgroundSize: "180px", mixBlendMode: "multiply", opacity: 0.4, pointerEvents: "none" }} />
      <CardFrame color={petal} opacity={0.4} size={40} />
      <div style={{ position: "relative" }}>
        {eyebrow ? <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#A8893F", marginBottom: 6 }}>{eyebrow}</div> : null}
        {title ? <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: T.ink, lineHeight: 1.2, margin: "0 0 12px" }}>{title}</h3> : null}
        {children}
      </div>
    </section>
  );
}

export default function YoursFocus({ savedCards = [], savedSummary, phaseCards = [], phaseWord, onOpen }) {
  const groups = KINDS.map((k) => ({ ...k, items: savedCards.filter((c) => k.test(String(c.type || ""))) })).filter((g) => g.items.length);
  const hasSaved = savedCards.length > 0;
  if (!hasSaved && !phaseCards.length) {
    return (
      <YoursCard eyebrow="Yours" title="Your saved things live here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>Tap the heart on any read, listen, watch or book and it waits for you here — grouped by kind, ready when the moment's right. Nothing owed.</p>
      </YoursCard>
    );
  }
  const summary = hasSaved
    ? `${savedCards.length} saved${savedSummary ? ` · ${savedSummary}` : ""}${phaseCards.length ? ` — and this week's set` : ""}.`
    : `Your saved drawer's empty — but here's a set tuned to your ${phaseWord || "week"}.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 0 · section-specific, stateful summary */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "2px 2px" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("gold").petal}1f`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><Bookmark size={18} color={cwOf("gold").petal} /></span>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: OX, lineHeight: 1.5, margin: 0 }}>{summary}</p>
      </div>

      {/* 1 · SAVED — auto-grouped collections by kind */}
      {groups.map((g) => (
        <YoursCard key={g.label} eyebrow="Saved" title={g.label} accent={g.accent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {g.items.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </YoursCard>
      ))}

      {/* 2 · FOR YOUR PHASE — this week's tuned set */}
      {phaseCards.length ? (
        <YoursCard eyebrow="Tuned to your week" title={phaseWord ? `For your ${phaseWord} week` : "For your phase"} accent="sage">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {phaseCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </YoursCard>
      ) : null}

      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", margin: "2px 14px 0", lineHeight: 1.55 }}>Kept for when the moment's right — open any of it whenever, nothing owed.</p>
    </div>
  );
}

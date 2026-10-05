// YoursFocus — the bespoke §19 surface for "Yours" (reached from Handy → Your saved). Her drawer:
// everything she's saved, auto-grouped into collections by kind (Reads · Listens · Watches · Books ·
// Stories), then this week's phase-tuned set. Deliberately ordered saved → for-your-phase. Reads her
// real saves + cycle phase. Tap → opens the exact saved item in place. Cream design.
import React from "react";
import { Bookmark } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { SERIF, UI } from "@/components/journal/Editorial";
import { cwOf } from "@/components/brand/flora";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Card as CleanCard, Summary, Foot } from "@/components/brand/cleanKit";

// kind → collection label + accent, in display order
const KINDS = [
  { test: (t) => t === "article" || t === "guide", label: "Reads", accent: "plum" },
  { test: (t) => t === "audio", label: "Listens", accent: "sage" },
  { test: (t) => t === "video", label: "Watches", accent: "gold" },
  { test: (t) => t === "book", label: "Books", accent: "sky" },
  { test: (t) => t === "daily_story" || t === "story", label: "Stories", accent: "crimson" },
];

function YoursCard({ eyebrow, title, accent = "gold", children, style }) {
  // CLEAN (§2.7): one shared clean surface — white, a single soft lift, a gold eyebrow carrying its
  // colourway meaning-rosette (the per-card floral detail Halli kept). No texture, no rainbow rim.
  return (
    <CleanCard style={style}>
      {eyebrow ? <Eyebrow cw={accent} align="left">{eyebrow}</Eyebrow> : null}
      {title ? <Title align="left" size={21}>{title}</Title> : null}
      {children}
    </CleanCard>
  );
}

export default function YoursFocus({ savedCards = [], savedSummary, phaseCards = [], phaseWord, onOpen, skySavedCount = 0 }) {
  const groups = KINDS.map((k) => ({ ...k, items: savedCards.filter((c) => k.test(String(c.type || ""))) })).filter((g) => g.items.length);
  const hasSaved = savedCards.length > 0;
  if (!hasSaved && !skySavedCount && !phaseCards.length) {
    return (
      <YoursCard eyebrow="Yours" title="Your saved things live here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.6, margin: 0 }}>Tap the heart on any read, listen, watch or book and it waits for you here — grouped by kind, ready when the moment's right. Nothing owed.</p>
      </YoursCard>
    );
  }
  const summary = skySavedCount
    ? `${skySavedCount} Sky ${skySavedCount === 1 ? "lesson" : "lessons"} kept above${hasSaved ? ` · ${savedCards.length} more saved finds` : ""}${phaseCards.length ? " — and this week's set below" : ""}.`
    : hasSaved
    ? `${savedCards.length} saved${savedSummary ? ` · ${savedSummary}` : ""}${phaseCards.length ? ` — and this week's set` : ""}.`
    : `Your saved drawer's empty — but here's a set tuned to your ${phaseWord || "week"}.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 0 · section-specific, stateful summary */}
      <Summary Icon={Bookmark} cw="gold">{summary}</Summary>

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

      <Foot>Kept for when the moment's right — open any of it whenever, nothing owed.</Foot>
    </div>
  );
}

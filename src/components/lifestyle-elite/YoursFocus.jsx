// YoursFocus — the bespoke §19 surface for "Yours" (reached from Handy → Your saved). Her drawer:
// everything she's saved, auto-grouped into collections by kind (Reads · Listens · Watches · Books ·
// Stories), then this week's phase-tuned set. Deliberately ordered saved → for-your-phase. Reads her
// real saves + cycle phase. Tap → opens the exact saved item in place. Cream design.
import React from "react";
import { Bookmark } from "lucide-react";
import { CoverCard, resolveCard } from "@/components/brand/expandCards";
import { SERIF } from "@/components/journal/Editorial";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Card as CleanCard, Summary, Foot } from "@/components/brand/cleanKit";
import { SelectedRoomDetail } from "./SelectedLifestyleHeader";
import { CalmFindRow } from "./CalmLifestyle";

// kind → collection label + accent, in display order
const KINDS = [
  { test: (t) => t === "article" || t === "guide", label: "Reads", accent: "plum" },
  { test: (t) => t === "audio", label: "Listens", accent: "sage" },
  { test: (t) => t === "video", label: "Watches", accent: "gold" },
  { test: (t) => t === "book", label: "Books", accent: "sky" },
  { test: (t) => t === "daily_story" || t === "story", label: "Stories", accent: "crimson" },
];

function YoursCard({ eyebrow, title, accent = "gold", children, style, className }) {
  // CLEAN (§2.7): one shared clean surface — white, a single soft lift, a gold eyebrow carrying its
  // colourway meaning-rosette (the per-card floral detail Halli kept). No texture, no rainbow rim.
  return (
    <CleanCard style={style} className={className}>
      {eyebrow ? <Eyebrow cw={accent} align="left">{eyebrow}</Eyebrow> : null}
      {title ? <Title align="left" size={21}>{title}</Title> : null}
      {children}
    </CleanCard>
  );
}

export default function YoursFocus({ savedCards = [], savedSummary, phaseCards = [], phaseWord, onOpen, onDetails, skySavedCount = 0, presentation, calmLayout = false }) {
  const groups = KINDS.map((k) => ({ ...k, items: savedCards.filter((c) => k.test(String(c.type || ""))) })).filter((g) => g.items.length);
  const other = savedCards.filter(c => !KINDS.some(k => k.test(String(c.type || ""))));
  if (presentation && other.length) groups.push({label:"Other keeps",accent:"gold",items:other});
  const hasSaved = savedCards.length > 0;
  // Same-title sources can be different stories. Distinguish them with their own
  // words, keeping every original item/action rather than merging by title.
  const titleCounts = new Map();
  phaseCards.forEach(item => { const title = resolveCard(item).title; titleCounts.set(title, (titleCounts.get(title) || 0) + 1); });
  const discoveryContext = item => {
    const card = resolveCard(item);
    if (!calmLayout || titleCounts.get(card.title) < 2) return undefined;
    const words = String(card.summary || "").trim().split(/\s+/).filter(Boolean);
    return words.length ? words.slice(0, 18).join(" ") + (words.length > 18 ? "…" : "") : undefined;
  };
  if (!hasSaved && !skySavedCount && !phaseCards.length) {
    return (
      <YoursCard eyebrow="Yours" title="Your saved things live here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.6, margin: 0 }}>{presentation ? "Keep a read, listen, watch or book and it waits here for you." : "Tap the heart on any read, listen, watch or book and it waits for you here — grouped by kind, ready when the moment's right. Nothing owed."}</p>
      </YoursCard>
    );
  }
  const summary = skySavedCount
    ? `${skySavedCount} Sky ${skySavedCount === 1 ? "lesson" : "lessons"} kept above${hasSaved ? ` · ${savedCards.length} more saved finds` : ""}${phaseCards.length ? " — and this week's set below" : ""}.`
    : hasSaved
    ? `${savedCards.length} saved${savedSummary ? ` · ${savedSummary}` : ""}${phaseCards.length ? ` — and this week's set` : ""}.`
    : `Your keeps will live here. A few discoveries to start you off.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 0 · section-specific, stateful summary */}
      {!calmLayout && <Summary Icon={Bookmark} cw="gold">{summary}</Summary>}

      {/* 1 · SAVED — auto-grouped collections by kind */}
      {groups.map((g, index) => (
        <YoursCard className="fw-selected-collection" key={g.label} eyebrow="Saved" title={g.label} accent={g.accent}>
          {presentation && index === 0 && <SelectedRoomDetail section="yours"/>}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {g.items.map((it) => calmLayout && !it.audioSrc && !it.youtubeId && !it.videoSrc ? <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails} label={it._keep?._unavailable ? "Retry source" : ["article","daily_story","book"].includes(it.type) ? "Read" : "Open source"}/> : <CoverCard presentation={presentation} key={it.id} item={it} compact onOpen={() => (onDetails || onOpen)?.(it)} onConsume={presentation && !it.audioSrc && !it.youtubeId && !it.videoSrc ? ()=>onOpen?.(it) : undefined} consumeLabel={it._keep?._unavailable ? "Retry source" : ["article","daily_story","book"].includes(it.type) ? "Read" : "Open source"} />)}
          </div>
        </YoursCard>
      ))}

      {/* 2 · FOR YOUR PHASE — this week's tuned set */}
      {phaseCards.length ? (
        <YoursCard className="fw-selected-phase" eyebrow={presentation ? "Something new" : "Tuned to your week"} title={presentation ? "A few discoveries" : phaseWord ? `For your ${phaseWord} week` : "For your phase"} accent="sage">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {phaseCards.map((it) => calmLayout && !it.audioSrc && !it.youtubeId && !it.videoSrc ? <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails} label="Open" context={discoveryContext(it)}/> : <CoverCard presentation={presentation} previewText={calmLayout ? "" : undefined} key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </YoursCard>
      ) : null}

      <Foot>{presentation ? "Your excellent taste, filed loosely." : "Kept for when the moment's right — open any of it whenever, nothing owed."}</Foot>
    </div>
  );
}

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
import { CalmFindRow, CalmMore } from "./CalmLifestyle";
import { reviewedDiscoveriesFirst } from "./finishLifestyle";

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

export default function YoursFocus({ savedCards = [], savedSummary, phaseCards = [], phaseWord, onOpen, onDetails, skySavedCount = 0, skyKeepsakes = null, ownedLoading = false, ownedError = false, presentation, calmLayout = false, editorialPreview = false }) {
  const groups = KINDS.map((k) => ({ ...k, items: savedCards.filter((c) => k.test(String(c.type || ""))) })).filter((g) => g.items.length);
  const other = savedCards.filter(c => !KINDS.some(k => k.test(String(c.type || ""))));
  if (presentation && other.length) groups.push({label:"Other keeps",accent:"gold",items:other});
  const hasSaved = savedCards.length > 0;
  const hasOwned = hasSaved || skySavedCount > 0;
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
  if (!editorialPreview && !ownedLoading && !ownedError && !hasSaved && !skySavedCount && !phaseCards.length) {
    return (<>
      <YoursCard eyebrow="Yours" title="Your saved things live here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.6, margin: 0 }}>Nothing saved yet. Keep the good bits as you go.</p>
      </YoursCard>
      {skyKeepsakes}
    </>);
  }
  const summary = skySavedCount
    ? `${skySavedCount} Sky ${skySavedCount === 1 ? "lesson" : "lessons"} kept above${hasSaved ? ` · ${savedCards.length} more saved finds` : ""}${phaseCards.length ? " — and this week's set below" : ""}.`
    : hasSaved
    ? `${savedCards.length} saved${savedSummary ? ` · ${savedSummary}` : ""}${phaseCards.length ? ` — and this week's set` : ""}.`
    : `Your keeps will live here. A few discoveries to start you off.`;
  const renderSaved = it => calmLayout && !it.audioSrc && !it.youtubeId && !it.videoSrc ? <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails} label={it._keep?._unavailable ? "Retry source" : ["article","daily_story","book"].includes(it.type) ? "Read" : "Open source"}/> : <CoverCard presentation={presentation} key={it.id} item={it} compact onOpen={() => (onDetails || onOpen)?.(it)} onConsume={presentation && !it.audioSrc && !it.youtubeId && !it.videoSrc ? ()=>onOpen?.(it) : undefined} consumeLabel={it._keep?._unavailable ? "Retry source" : ["article","daily_story","book"].includes(it.type) ? "Read" : "Open source"} />;
  const renderDiscovery = it => calmLayout && !it.audioSrc && !it.youtubeId && !it.videoSrc ? <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails} label="Open" context={discoveryContext(it)}/> : <CoverCard presentation={presentation} previewText={calmLayout ? "" : undefined} key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />;
  const discoveries = calmLayout ? reviewedDiscoveriesFirst(phaseCards) : phaseCards;
  const readyDiscoveries = calmLayout ? discoveries.filter(it => !["Archive · source review pending", "Generated fiction · archive"].includes(it.sourceName)) : discoveries;
  const primaryDiscoveries = [];
  const moreDiscoveries = [];
  const primaryTitles = new Set();
  readyDiscoveries.forEach(it => {
    const title = resolveCard(it).title;
    if (calmLayout && (primaryDiscoveries.length >= 2 || primaryTitles.has(title))) moreDiscoveries.push(it);
    else { primaryDiscoveries.push(it); primaryTitles.add(title); }
  });
  if (calmLayout) moreDiscoveries.push(...discoveries.filter(it => it.sourceName === "Generated fiction · archive"));
  const pendingDiscoveries = calmLayout ? discoveries.filter(it => it.sourceName === "Archive · source review pending") : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 0 · section-specific, stateful summary */}
      {!calmLayout && <Summary Icon={Bookmark} cw="gold">{summary}</Summary>}

      {/* 1 · SAVED — auto-grouped collections by kind */}
      {!hasSaved && !skySavedCount && ownedLoading && <p role="status" style={{fontFamily:SERIF,fontSize:16,color:C.ink,margin:0}}>Finding what you kept…</p>}
      {editorialPreview && !hasSaved && !skySavedCount && !ownedLoading && !ownedError && <YoursCard eyebrow="Yours" title="Keep what you love">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.5, margin: 0 }}>A read, a voice or a page worth coming back to. Save it where you find it; it will wait here.</p>
      </YoursCard>}
      {groups.map((g, index) => (
        <YoursCard className="fw-selected-collection" key={g.label} eyebrow="Saved" title={g.label} accent={g.accent}>
          {presentation && index === 0 && <SelectedRoomDetail section="yours"/>}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {g.items.slice(0, calmLayout ? 3 : undefined).map(renderSaved)}
            <CalmMore enabled={calmLayout && g.items.length > 3} title={`More ${g.label.toLowerCase()} · ${Math.max(0, g.items.length - 3)}`}>{calmLayout && g.items.slice(3).map(renderSaved)}</CalmMore>
          </div>
        </YoursCard>
      ))}

      {skyKeepsakes}

      {/* 2 · FOR YOUR PHASE — this week's tuned set */}
      {phaseCards.length ? <CalmMore enabled={calmLayout && hasOwned} title={`Other finds · ${phaseCards.length}`}>
        <YoursCard className="fw-selected-phase" eyebrow={calmLayout ? "From the wider library" : "Tuned to your week"} title={calmLayout ? "Other finds" : phaseWord ? `For your ${phaseWord} week` : "For your phase"} accent="sage">
          {calmLayout && <p style={{fontFamily:SERIF,fontSize:15,color:C.ink,lineHeight:1.45,margin:"0 0 12px"}}>A few finds from elsewhere. Your saves stay above.</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {primaryDiscoveries.map(renderDiscovery)}
            {calmLayout && !readyDiscoveries.length && <p>These finds need a source check before we lead with them.</p>}
            <CalmMore enabled={calmLayout && moreDiscoveries.length > 0} title={`More discoveries · ${moreDiscoveries.length}`}>{calmLayout && moreDiscoveries.map(renderDiscovery)}</CalmMore>
            <CalmMore enabled={calmLayout && pendingDiscoveries.length > 0} title={`Archive · source review pending · ${pendingDiscoveries.length}`}>{calmLayout && pendingDiscoveries.map(renderDiscovery)}</CalmMore>
          </div>
        </YoursCard>
      </CalmMore> : null}

      <Foot>Come back when you fancy. ‘Later’ has no deadline.</Foot>
    </div>
  );
}

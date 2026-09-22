// ReadFocus — the bespoke §19 surface for the Read chip. Reader-forward editorial: continue-reading
// resumes in place first, then the day's editorial pick, her fresh reads (ranked by the feed —
// interests + history + phase), then stories & fiction. Deliberately ordered resume → today → fresh
// → fiction. Reads real state (what she's part-way through, her ranked feed). Tap → resumes /opens
// the exact reader in place. Reuses the real CoverCard reader in the cream design.
import React from "react";
import { BookOpen, PlayCircle } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { SERIF, UI } from "@/components/journal/Editorial";
import { cwOf } from "@/components/brand/flora";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Card as CleanCard, Summary, Foot } from "@/components/brand/cleanKit";


function ReadCard({ eyebrow, title, accent = "plum", children, style }) {
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

export default function ReadFocus({ continueCards = [], articleCards = [], storyCards = [], phaseWord, onOpen }) {
  const hasAny = continueCards.length || articleCards.length || storyCards.length;
  if (!hasAny) {
    return (
      <ReadCard eyebrow="Something to read" title="Fresh reads land here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.6, margin: 0 }}>Essays, guides and stories will appear here as they're published — chosen for where you are, a chapter or an article at a time. No streaks, nothing owed.</p>
      </ReadCard>
    );
  }
  const featured = articleCards[0] || null;
  const restArticles = featured ? articleCards.slice(1) : articleCards;
  const summary = `${continueCards.length ? `${continueCards.length} on the go · ` : ""}${articleCards.length} fresh read${articleCards.length === 1 ? "" : "s"}${phaseWord ? ` tuned to your ${phaseWord} week` : ""}${storyCards.length ? ` · ${storyCards.length} to lose yourself in` : ""}.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 0 · section-specific, stateful summary */}
      <Summary Icon={BookOpen} cw="plum">{summary}</Summary>

      {/* 1 · CONTINUE — resume where she left off, in place */}
      {continueCards.length ? (
        <ReadCard eyebrow="Pick up where you left off" title="Reading now" accent="plum">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {continueCards.map((it) => <CoverCard key={it.id} item={it} onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </ReadCard>
      ) : null}

      {/* 2 · TODAY'S READ — the top personalised editorial pick, featured */}
      {featured ? (
        <ReadCard eyebrow="Chosen for you today" title="Today's read" accent="crimson">
          <CoverCard item={featured} onOpen={() => onOpen && onOpen(featured)} />
        </ReadCard>
      ) : null}

      {/* 3 · FRESH READS — the ranked feed */}
      {restArticles.length ? (
        <ReadCard eyebrow="For a spare ten minutes" title="Fresh reads & guides" accent="plum">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {restArticles.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </ReadCard>
      ) : null}

      {/* 4 · STORIES & FICTION */}
      {storyCards.length ? (
        <ReadCard eyebrow="Get lost in one" title="Stories & fiction" accent="crimson">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {storyCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </ReadCard>
      ) : null}

      <Foot>A chapter or an article at a time, at your pace — your place is saved, nothing expires.</Foot>
    </div>
  );
}

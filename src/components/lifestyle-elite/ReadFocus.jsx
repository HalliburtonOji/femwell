// ReadFocus — the bespoke §19 surface for the Read chip. Reader-forward editorial: continue-reading
// resumes in place first, then the day's editorial pick, her fresh reads (ranked by the feed —
// interests + history + phase), then stories & fiction. Deliberately ordered resume → today → fresh
// → fiction. Reads real state (what she's part-way through, her ranked feed). Tap → resumes /opens
// the exact reader in place. Reuses the real CoverCard reader in the cream design.
import React from "react";
import { BookOpen } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { SERIF } from "@/components/journal/Editorial";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Card as CleanCard, Summary, Foot } from "@/components/brand/cleanKit";
import { SelectedRoomDetail } from "./SelectedLifestyleHeader";
import { CalmFindRow, CalmMore } from "./CalmLifestyle";
import { firstSentences } from "./FocusedLifestyleSheet";


function ReadCard({ eyebrow, title, accent = "plum", children, style, className }) {
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

export default function ReadFocus({ continueCards = [], articleCards = [], storyCards = [], phaseWord, onOpen, onDetails, presentation, calmLayout = false }) {
  const hasAny = continueCards.length || articleCards.length || storyCards.length;
  if (!hasAny) {
    return (
      <ReadCard eyebrow="Something to read" title="Fresh reads land here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.6, margin: 0 }}>{presentation ? "The reading desk is quiet today. New essays and stories will land here." : "Essays, guides and stories will appear here as they're published — chosen for where you are, a chapter or an article at a time. No streaks, nothing owed."}</p>
      </ReadCard>
    );
  }
  const featured = articleCards[0] || null;
  const restArticles = featured ? articleCards.slice(1) : articleCards;
  const summary = `${continueCards.length ? `${continueCards.length} on the go · ` : ""}${articleCards.length} fresh read${articleCards.length === 1 ? "" : "s"}${!presentation && phaseWord ? ` tuned to your ${phaseWord} week` : ""}${storyCards.length ? ` · ${storyCards.length} to lose yourself in` : ""}.`;

  if (calmLayout) {
    // A saved place is the strongest honest recommendation we have. A complete
    // story is the contrasting choice; the full article/history list stays one tap away.
    const namedResume = continueCards.find(item => !/^Project Gutenberg book \d+$/i.test(item.title || ""));
    const labelledFiction = storyCards.find(item => /fiction/i.test(item._raw?.author_name || item.sourceName || ""));
    const primary = namedResume || continueCards[0] || featured || labelledFiction || storyCards[0];
    const alternate = continueCards.includes(primary) ? labelledFiction || featured
      : storyCards.includes(primary) ? featured : labelledFiction;
    const second = alternate?.id === primary?.id ? null : alternate;
    const used = new Set([primary?.id, second?.id]);
    const remaining = [
      ...continueCards.map(item => ({ item, label: "Continue" })),
      ...articleCards.map(item => ({ item, label: "Read" })),
      ...storyCards.map(item => ({ item, label: "Read" })),
    ].filter(({ item }) => item && !used.has(item.id) && used.add(item.id));
    const primaryIsResume = continueCards.includes(primary);
    return <ReadCard className="fw-selected-reading-choice" eyebrow="Your next page" title={primaryIsResume ? "Pick up here" : "Start here"} accent="plum">
      {presentation && <SelectedRoomDetail section="read"/>}
      <p style={{ fontFamily: SERIF, color: C.slate, margin: "0 0 12px", lineHeight: 1.45 }}>
        {primaryIsResume ? "Your place is saved on this device." : storyCards.includes(primary) ? "A story from the current shelf." : "A complete read from today's shelf."}
      </p>
      <CalmFindRow item={primary} onOpen={onOpen} onDetails={onDetails} label={primaryIsResume ? "Continue" : "Read"}/>
      {second && <div style={{ marginTop: 16 }}>
        <p style={{ fontFamily: SERIF, color: C.slate, margin: "0 0 6px", lineHeight: 1.4 }}>Or take a different page.</p>
        <CalmFindRow item={second} onOpen={onOpen} onDetails={onDetails} label="Read"/>
      </div>}
      <CalmMore enabled={remaining.length > 0} title={`Browse all reading · ${remaining.length}`}>
        {remaining.map(({ item, label }) => <CalmFindRow key={item.id} item={item} onOpen={onOpen} onDetails={onDetails} label={label}/>)}
      </CalmMore>
    </ReadCard>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 0 · section-specific, stateful summary */}
      {!calmLayout && <Summary Icon={BookOpen} cw="plum">{summary}</Summary>}

      {/* 1 · CONTINUE — resume where she left off, in place */}
      {continueCards.length ? (
        <ReadCard className="fw-selected-resume" eyebrow="Pick up where you left off" title="Reading now" accent="plum">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {continueCards.map((it) => calmLayout ? <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails} label="Continue"/> : <CoverCard presentation={presentation} key={it.id} item={it} onOpen={() => (onDetails || onOpen)?.(it)} onConsume={presentation ? () => onOpen?.(it) : undefined} consumeLabel={it._continue ? "Continue" : "Read"} />)}
          </div>
        </ReadCard>
      ) : null}

      {/* 2 · TODAY'S READ — the top personalised editorial pick, featured */}
      {featured ? (
        <ReadCard className="fw-selected-lead" eyebrow={presentation ? "On the reading desk" : "Chosen for you today"} title="Today's read" accent="crimson">
          {presentation && <SelectedRoomDetail section="read"/>}
          <CoverCard presentation={presentation} previewText={calmLayout ? firstSentences(featured.summary || featured.excerpt,1) : undefined} item={featured} onOpen={() => (onDetails || onOpen)?.(featured)} onConsume={presentation ? () => onOpen?.(featured) : undefined} consumeLabel={featured._continue ? "Continue" : "Read"} />
        </ReadCard>
      ) : null}

      {/* 3 · FRESH READS — the ranked feed */}
      {restArticles.length ? (
        <ReadCard className="fw-selected-fresh" eyebrow="A fresh page" title="Fresh reads & guides" accent="plum">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {restArticles.slice(0, calmLayout ? 1 : undefined).map((it) => calmLayout ? <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails}/> : <CoverCard presentation={presentation} key={it.id} item={it} compact onOpen={() => (onDetails || onOpen)?.(it)} onConsume={presentation ? () => onOpen?.(it) : undefined} consumeLabel={it._continue ? "Continue" : "Read"} />)}
            <CalmMore enabled={calmLayout && restArticles.length > 1} title={`More reads & guides · ${Math.max(0, restArticles.length - 1)}`}>
              {calmLayout && restArticles.slice(1).map(it => <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails}/>)}
            </CalmMore>
          </div>
        </ReadCard>
      ) : null}

      {/* 4 · STORIES & FICTION */}
      {storyCards.length ? (
        <ReadCard className="fw-selected-fiction" eyebrow="Get lost in one" title="Stories & fiction" accent="crimson">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {storyCards.slice(0, calmLayout ? 1 : undefined).map((it) => calmLayout ? <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails}/> : <CoverCard presentation={presentation} key={it.id} item={it} compact onOpen={() => (onDetails || onOpen)?.(it)} onConsume={presentation ? () => onOpen?.(it) : undefined} consumeLabel={it._continue ? "Continue" : "Read"} />)}
            <CalmMore enabled={calmLayout && storyCards.length > 1} title={`More stories · ${Math.max(0, storyCards.length - 1)}`}>
              {calmLayout && storyCards.slice(1).map(it => <CalmFindRow key={it.id} item={it} onOpen={onOpen} onDetails={onDetails}/>)}
            </CalmMore>
          </div>
        </ReadCard>
      ) : null}

      <Foot>{presentation ? "A rabbit hole, with better punctuation." : "A chapter or an article at a time, at your pace — your place is saved, nothing expires."}</Foot>
    </div>
  );
}

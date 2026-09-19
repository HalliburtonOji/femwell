// ReadFocus — the bespoke §19 surface for the Read chip. Reader-forward editorial: continue-reading
// resumes in place first, then the day's editorial pick, her fresh reads (ranked by the feed —
// interests + history + phase), then stories & fiction. Deliberately ordered resume → today → fresh
// → fiction. Reads real state (what she's part-way through, her ranked feed). Tap → resumes /opens
// the exact reader in place. Reuses the real CoverCard reader in the cream design.
import React from "react";
import { BookOpen, PlayCircle } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { T, SERIF, UI, PAPER_TEX } from "@/components/journal/Editorial";
import { cwOf, CardFrame } from "@/components/brand/flora";

const OX = "#7A1A12";

function ReadCard({ eyebrow, title, accent = "plum", children }) {
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

export default function ReadFocus({ continueCards = [], articleCards = [], storyCards = [], phaseWord, onOpen }) {
  const hasAny = continueCards.length || articleCards.length || storyCards.length;
  if (!hasAny) {
    return (
      <ReadCard eyebrow="Something to read" title="Fresh reads land here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>Essays, guides and stories will appear here as they're published — chosen for where you are, a chapter or an article at a time. No streaks, nothing owed.</p>
      </ReadCard>
    );
  }
  const featured = articleCards[0] || null;
  const restArticles = featured ? articleCards.slice(1) : articleCards;
  const summary = `${continueCards.length ? `${continueCards.length} on the go · ` : ""}${articleCards.length} fresh read${articleCards.length === 1 ? "" : "s"}${phaseWord ? ` tuned to your ${phaseWord} week` : ""}${storyCards.length ? ` · ${storyCards.length} to lose yourself in` : ""}.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 0 · section-specific, stateful summary */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "2px 2px" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("plum").petal}1f`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><BookOpen size={18} color={cwOf("plum").petal} /></span>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: OX, lineHeight: 1.5, margin: 0 }}>{summary}</p>
      </div>

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

      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", margin: "2px 14px 0", lineHeight: 1.55 }}>A chapter or an article at a time, at your pace — your place is saved, nothing expires.</p>
    </div>
  );
}

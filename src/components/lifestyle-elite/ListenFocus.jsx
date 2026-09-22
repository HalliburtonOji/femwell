// ListenFocus — the bespoke §19 surface for the Listen chip. Player-forward: it leads with a featured
// listen whose player plays INLINE and keeps going while she wanders the app (the card audio routes
// into the app's real background player), then her podcasts & shows, then watch & trending — the
// complete Listen section, in the cream design, deliberately ordered now → hear → watch. Reads the
// feed's real ranking (her interests + history + phase). Tap a card → it plays / opens the exact item.
import React from "react";
import { Headphones, Play } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { SERIF, UI } from "@/components/journal/Editorial";
import { cwOf } from "@/components/brand/flora";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Card as CleanCard, Summary, Foot } from "@/components/brand/cleanKit";

const durOf = (it) => {
  const m = (it?.meta || []).find((row) => /min|hr|:/.test(String(row?.[1] || "")));
  return m ? String(m[1]) : null;
};

function ListenCard({ eyebrow, title, accent = "sage", children, style }) {
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

export default function ListenFocus({ audioCards = [], videoCards = [], onOpen }) {
  const featured = audioCards[0] || videoCards[0] || null;
  const restAudio = audioCards.slice(featured && featured === audioCards[0] ? 1 : 0);
  const hasAny = featured || restAudio.length || videoCards.length;

  if (!hasAny) {
    return (
      <ListenCard eyebrow="Something to hear" title="Fresh listens land here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.6, margin: 0 }}>Podcasts, shows and short listens will appear here as they're published — press play and they keep going while you wander the app.</p>
      </ListenCard>
    );
  }

  const fDur = durOf(featured);
  const summary = featured
    ? `Something to hear — ${featured.title}${fDur ? ` (${fDur})` : ""}. Press play and it keeps going while you wander.`
    : "Something to hear — press play and it keeps going while you wander the app.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 0 · section-specific, stateful summary */}
      <Summary Icon={Headphones} cw="sage">{summary}</Summary>

      {/* 1 · NOW — the featured listen, player-forward (plays inline, keeps going) */}
      {featured ? (
        <ListenCard eyebrow="Start here" title="Today's listen" accent="sage">
          <CoverCard item={featured} onOpen={() => onOpen && onOpen(featured)} />
        </ListenCard>
      ) : null}

      {/* 2 · PODCASTS & SHOWS */}
      {restAudio.length ? (
        <ListenCard eyebrow="For the kettle or the commute" title="Podcasts & shows" accent="sage">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {restAudio.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </ListenCard>
      ) : null}

      {/* 3 · WATCH & TRENDING */}
      {videoCards.length ? (
        <ListenCard eyebrow="Ten minutes to watch" title="Watch & trending" accent="gold">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {videoCards.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </ListenCard>
      ) : null}

      <Foot>Press play and let it run — it keeps going, on the lock screen too, while you read or wander.</Foot>
    </div>
  );
}

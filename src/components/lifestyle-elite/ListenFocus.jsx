// ListenFocus — the bespoke §19 surface for the Listen chip. Player-forward: it leads with a featured
// listen whose player plays INLINE and keeps going while she wanders the app (the card audio routes
// into the app's real background player), then her podcasts & shows, then watch & trending — the
// complete Listen section, in the cream design, deliberately ordered now → hear → watch. Reads the
// feed's real ranking (her interests + history + phase). Tap a card → it plays / opens the exact item.
import React from "react";
import { Headphones, Play } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { T, SERIF, UI, PAPER_TEX } from "@/components/journal/Editorial";
import { cwOf, CardFrame } from "@/components/brand/flora";

const OX = "#7A1A12";
const durOf = (it) => {
  const m = (it?.meta || []).find((row) => /min|hr|:/.test(String(row?.[1] || "")));
  return m ? String(m[1]) : null;
};

function ListenCard({ eyebrow, title, accent = "sage", children }) {
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

export default function ListenFocus({ audioCards = [], videoCards = [], onOpen }) {
  const featured = audioCards[0] || videoCards[0] || null;
  const restAudio = audioCards.slice(featured && featured === audioCards[0] ? 1 : 0);
  const hasAny = featured || restAudio.length || videoCards.length;

  if (!hasAny) {
    return (
      <ListenCard eyebrow="Something to hear" title="Fresh listens land here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.6, margin: 0 }}>Podcasts, shows and short listens will appear here as they're published — press play and they keep going while you wander the app.</p>
      </ListenCard>
    );
  }

  const fDur = durOf(featured);
  const summary = featured
    ? `Something to hear — ${featured.title}${fDur ? ` (${fDur})` : ""}. Press play and it keeps going while you wander.`
    : "Something to hear — press play and it keeps going while you wander the app.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 0 · section-specific, stateful summary */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "2px 2px" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("sage").petal}1f`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><Headphones size={18} color={cwOf("sage").petal} /></span>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: OX, lineHeight: 1.5, margin: 0 }}>{summary}</p>
      </div>

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

      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", margin: "2px 14px 0", lineHeight: 1.55 }}>Press play and let it run — it keeps going, on the lock screen too, while you read or wander.</p>
    </div>
  );
}

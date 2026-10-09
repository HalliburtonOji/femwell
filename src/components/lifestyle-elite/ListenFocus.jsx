// ListenFocus — the bespoke §19 surface for the Listen chip. Player-forward: it leads with a featured
// listen whose player plays INLINE and keeps going while she wanders the app (the card audio routes
// into the app's real background player), then her podcasts & shows, then watch & trending — the
// complete Listen section, in the cream design, deliberately ordered now → hear → watch. Reads the
// feed's real ranking (her interests + history + phase). Tap a card → it plays / opens the exact item.
import React from "react";
import { Headphones } from "lucide-react";
import { CoverCard, FloraAudio, resolveCard } from "@/components/brand/expandCards";
import { SERIF } from "@/components/journal/Editorial";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Card as CleanCard, Summary, Foot } from "@/components/brand/cleanKit";
import { SelectedRoomDetail } from "./SelectedLifestyleHeader";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";

const durOf = (it) => {
  const m = (it?.meta || []).find((row) => /min|hr|:/.test(String(row?.[1] || "")));
  return m ? String(m[1]) : null;
};

function ListenCard({ eyebrow, title, accent = "sage", children, style, className }) {
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

export default function ListenFocus({ audioCards = [], videoCards = [], onOpen, presentation, calmLayout = false }) {
  const player = usePodcastPlayer();
  const current = presentation ? player?.currentEpisode : null;
  const active = current && (audioCards.find(card=>card.id===current.id) || (current.audio_url ? {
    id:current.id,type:"audio",title:current.title,audioSrc:current.audio_url,duration:current.duration_seconds,
    sourceName:current.source_name,imageUrl:current.image_url,_raw:current,
    meta:[["Headphones",current.source_name || "Podcast"]],body:[],actions:[],
  } : null));
  const featured = active || audioCards[0] || videoCards[0] || null;
  const restAudio = audioCards.filter(card=>card.id!==featured?.id);
  const watches = presentation && featured === videoCards[0] ? videoCards.slice(1) : videoCards;
  const hasAny = featured || restAudio.length || videoCards.length;

  if (!hasAny) {
    return (
      <ListenCard eyebrow="Something to hear" title="Fresh listens land here">
        <p style={{ fontFamily: SERIF, fontSize: 16, color: C.ink, lineHeight: 1.6, margin: 0 }}>{presentation ? "A quiet sound room today. New episodes and shows will land here." : "Podcasts, shows and short listens will appear here as they're published — press play and they keep going while you wander the app."}</p>
      </ListenCard>
    );
  }

  const fDur = durOf(featured);
  const summary = presentation ? `${audioCards.length} listen${audioCards.length === 1 ? "" : "s"} · ${videoCards.length} watch${videoCards.length === 1 ? "" : "es"}${fDur ? ` · start with ${fDur}` : ""}.` : featured
    ? `Something to hear — ${featured.title}${fDur ? ` (${fDur})` : ""}. Press play and it keeps going while you wander.`
    : "Something to hear — press play and it keeps going while you wander the app.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 0 · section-specific, stateful summary */}
      {!calmLayout && <Summary Icon={Headphones} cw="sage">{summary}</Summary>}

      {/* 1 · NOW — the featured listen, player-forward (plays inline, keeps going) */}
      {featured ? (
        <ListenCard className="fw-selected-now" eyebrow={active ? player?.isPlaying ? "On air" : "Pick up your listen" : "Worth your headphones"} title={presentation && featured.type === "video" ? "Today's watch" : "Today's listen"} accent="sage">
          {presentation && <SelectedRoomDetail section="listen"/>}
          <CoverCard presentation={presentation} previewText={calmLayout ? "" : undefined} item={featured} onOpen={() => onOpen && onOpen(featured)} />
        </ListenCard>
      ) : null}

      {/* 2 · PODCASTS & SHOWS */}
      {restAudio.length ? (
        <ListenCard className="fw-selected-audio" eyebrow="For the kettle or the commute" title="Podcasts & shows" accent="sage">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {restAudio.map((it) => calmLayout && it.audioSrc ? <div key={it.id} className="fw-calm-audio-row"><h4>{resolveCard(it).title}</h4><FloraAudio compact presentation="focused" src={it.audioSrc} label={`Play ${resolveCard(it).title}`} item={it} initialDuration={it.duration || 0}/><button onClick={()=>onOpen?.(it)}>Details &amp; tools</button></div> : <CoverCard presentation={presentation} previewText={calmLayout ? "" : undefined} key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </ListenCard>
      ) : null}

      {/* 3 · WATCH & TRENDING */}
      {watches.length ? (
        <ListenCard className="fw-selected-watch" eyebrow="Something worth watching" title="Watch & trending" accent="gold">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {watches.map((it) => <CoverCard presentation={presentation} previewText={calmLayout ? "" : undefined} key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />)}
          </div>
        </ListenCard>
      ) : null}

      <Foot>{presentation ? "Audio can come along while you browse. Videos like your company here." : "Press play and let it run — it keeps going, on the lock screen too, while you read or wander."}</Foot>
    </div>
  );
}

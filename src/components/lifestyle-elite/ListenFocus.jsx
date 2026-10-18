// ListenFocus — the bespoke §19 surface for the Listen chip. Player-forward: it leads with a featured
// listen whose player plays INLINE and keeps going while she wanders the app (the card audio routes
// into the app's real background player), then her podcasts & shows, then watch & trending — the
// complete Listen section, in the cream design, deliberately ordered now → hear → watch. Reads the
// feed's real ranking (her interests + history + phase). Tap a card → it plays / opens the exact item.
import React from "react";
import { Headphones } from "lucide-react";
import { CoverCard, FloraAudio, FloraYouTube, resolveCard } from "@/components/brand/expandCards";
import { SERIF } from "@/components/journal/Editorial";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Card as CleanCard, Summary, Foot } from "@/components/brand/cleanKit";
import { SelectedRoomDetail } from "./SelectedLifestyleHeader";
import { usePodcastPlayer } from "@/hooks/usePodcastPlayer";
import { CalmFindRow, CalmMore } from "./CalmLifestyle";

const durOf = (it) => {
  const m = (it?.meta || []).find((row) => /min|hr|:/.test(String(row?.[1] || "")));
  return m ? String(m[1]) : null;
};

// One publisher-checked actual episode, not a show homepage or a keyword guess.
// The full changing RSS catalogue remains in Browse when this edition drops out.
const isCheckedRoundtable = card => card?.audioSrc
  && /how to fail with elizabeth day/i.test(card.sourceName || "")
  && /mel giedroyc and aj odudu/i.test(card.title || "");

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

export default function ListenFocus({ audioCards = [], videoCards = [], onOpen, presentation, calmLayout = false, editorialPreview = false }) {
  const player = usePodcastPlayer();
  const current = presentation ? player?.currentEpisode : null;
  const active = current && (audioCards.find(card=>card.id===current.id) || (current.audio_url ? {
    id:current.id,type:"audio",title:current.title,audioSrc:current.audio_url,duration:current.duration_seconds,
    sourceName:current.source_name,imageUrl:current.image_url,_raw:current,
    meta:[["Headphones",current.source_name || "Podcast"]],body:[],
    actions:/^https?:\/\/\S+$/i.test(String(current.episode_url || "")) ? [{
      label:"At publisher",primary:false,onClick:()=>window.open(current.episode_url,"_blank","noopener,noreferrer"),
    }] : [],
  } : null));
  // In the focused preview, a source-only show is still browsable, but must not
  // displace something the user can actually start here. The old fallback put a
  // two-hour external health lecture in the first slot when the live RSS pool
  // was empty. Keep the active episode first and every external source below.
  const featured = active || (calmLayout
    ? (editorialPreview ? audioCards.find(card => card.audioSrc) : audioCards.find(isCheckedRoundtable)) || audioCards.find(card => card.audioSrc) || videoCards[0] || audioCards[0]
    : audioCards[0] || videoCards[0]) || null;
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
  const renderAudio = it => calmLayout && it.audioSrc ? <div key={it.id} className="fw-calm-audio-row"><h4>{resolveCard(it).title}</h4>{editorialPreview && it.editorialReason && <p style={{fontFamily:SERIF,fontSize:15,lineHeight:1.35,color:C.slate,margin:"0 0 6px"}}>{it.editorialFollowedCategory ? `From your ${it.editorialFollowedCategory} shelf · ` : ""}{it.editorialReason}</p>}<FloraAudio compact presentation="focused" src={it.audioSrc} label={it.sourceName || "Podcast"} accent="#567861" item={it} initialDuration={it.duration || 0}/><button onClick={()=>onOpen?.(it)}>Details &amp; tools</button></div> : <CoverCard presentation={presentation} previewText={calmLayout ? "" : undefined} key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />;
  const renderWatch = it => <CoverCard presentation={presentation} previewText={calmLayout ? "" : undefined} key={it.id} item={it} compact onOpen={() => onOpen && onOpen(it)} />;

  if (calmLayout) {
    const externalLead = featured?.type === "audio" && featured.external && !featured.audioSrc;
    const alternate = featured?.type === "video"
      ? restAudio.find(card => card.audioSrc) || watches[0]
      : watches[0] || restAudio.find(card => card.audioSrc);
    const used = new Set([featured?.id, alternate?.id]);
    const moreAudio = restAudio.filter(item => !used.has(item.id));
    const moreWatches = watches.filter(item => !used.has(item.id));
    const moreCount = moreAudio.length + moreWatches.length;
    const alternateSourceAction = alternate?.type === "video" && (alternate.actions || []).find(action => typeof action?.onClick === "function" && /open|watch/i.test(action.label || ""));
    return <ListenCard className="fw-selected-listening-choice" style={editorialPreview && featured?.audioSrc ? { paddingTop: 8 } : undefined} eyebrow={active ? player?.isPlaying ? "On air" : "Pick up your listen" : featured?.type === "video" ? "Watch here" : externalLead ? "Listen elsewhere" : isCheckedRoundtable(featured) ? "From the listening desk" : "Worth your headphones"} title={editorialPreview && featured?.audioSrc ? undefined : featured?.type === "video" ? "Put this on" : externalLead ? "Choose a show" : "Press play"} accent="sage">
      {presentation && <SelectedRoomDetail section="listen"/>}
      {featured && editorialPreview && featured.audioSrc ? <div className="fw-calm-audio-row">
        <h4>{resolveCard(featured).title}</h4>
        <FloraAudio compact presentation="focused" src={featured.audioSrc} label={featured.sourceName || "Podcast"} accent="#567861" item={featured} initialDuration={featured.duration || 0}/>
        {featured.editorialReason && <p style={{ fontFamily: SERIF, color: C.slate, margin: "10px 0 0", lineHeight: 1.35 }}>{featured.editorialFollowedCategory ? `From your ${featured.editorialFollowedCategory} shelf · ` : ""}{featured.editorialReason}</p>}
        <button type="button" onClick={() => onOpen?.(featured)}>Details &amp; tools</button>
      </div> : featured && <>
        <p style={{ fontFamily: SERIF, color: C.slate, margin: "0 0 12px", lineHeight: 1.45 }}>
          {active ? "Your last listen is ready where you left it." : editorialPreview && featured.editorialReason ? `${featured.editorialFollowedCategory ? `From your ${featured.editorialFollowedCategory} shelf · ` : ""}${featured.editorialReason}` : isCheckedRoundtable(featured) ? "Mel, AJ and Elizabeth on friendship and reinvention. Forty-five minutes; includes Dove sponsorship." : featured.audioSrc ? "An episode, ready here in the app." : featured.type === "video" ? "A watch, ready here in the app." : "This show opens at its source."}
        </p>
        <CoverCard presentation={presentation} mediaPresentation="focused" previewText="" item={featured} onOpen={() => onOpen?.(featured)}/>
      </>}
      {alternate && <div style={{ marginTop: 16 }}>
        <p style={{ fontFamily: SERIF, color: C.slate, margin: "0 0 6px", lineHeight: 1.4 }}>Want {alternate.type === "video" ? "something to watch" : "another voice"}?</p>
        {alternate.type === "video" && alternate.youtubeId && !alternate.external ? <div className="fw-calm-watch-choice">
          <h4>{resolveCard(alternate).title}</h4>
          <FloraYouTube videoId={alternate.youtubeId} item={alternate} accent="#8faa9a"/>
          <button type="button" onClick={() => onOpen?.(alternate)}>Details &amp; tools</button>
        </div> : <CalmFindRow item={alternate} onOpen={alternateSourceAction ? () => alternateSourceAction.onClick() : onOpen} onDetails={alternateSourceAction ? onOpen : undefined} label={alternateSourceAction ? "Watch at source" : alternate.type === "video" ? "Details" : "Listen"} context={alternate.type === "video" && !alternate.duration ? "Creator video" : durOf(alternate)}/>}
      </div>}
      <CalmMore enabled={moreCount > 0} title={`Browse all listens & watches · ${moreCount}`}>
        {moreAudio.map(renderAudio)}
        {moreWatches.map(renderWatch)}
      </CalmMore>
    </ListenCard>;
  }

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
            {restAudio.slice(0, calmLayout ? 1 : undefined).map(renderAudio)}
            <CalmMore enabled={calmLayout && restAudio.length > 1} title={`More listens · ${Math.max(0, restAudio.length - 1)}`}>{calmLayout && restAudio.slice(1).map(renderAudio)}</CalmMore>
          </div>
        </ListenCard>
      ) : null}

      {/* 3 · WATCH & TRENDING */}
      {watches.length ? (
        <ListenCard className="fw-selected-watch" eyebrow="A proper watch" title={calmLayout ? "Watch something longer" : "Watch & trending"} accent="gold">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {watches.slice(0, calmLayout ? 1 : undefined).map(renderWatch)}
            <CalmMore enabled={calmLayout && watches.length > 1} title={`More to watch · ${Math.max(0, watches.length - 1)}`}>{calmLayout && watches.slice(1).map(renderWatch)}</CalmMore>
          </div>
        </ListenCard>
      ) : null}

      <Foot>{presentation ? "Audio can come along while you browse. Videos like your company here." : "Press play and let it run — it keeps going, on the lock screen too, while you read or wander."}</Foot>
    </div>
  );
}

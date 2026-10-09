// GoodLifeFocus — the bespoke §19 surface for the Good life chip. Actionable, do-it-now: the real
// time-picker reads how long she's got and filters to what's worth those minutes, then a small joy /
// permission to enjoy it (opens in place), then the 11 whole-life rooms as doors she can step into.
// Deliberately ordered time → joy → rooms. The picker + slips are the real wired widgets in cream.
import React from "react";
import { Clock, Shirt, Dumbbell, Users, Compass, PartyPopper, Coffee, Moon, Sprout, Feather, Trees, Coins } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { createPageUrl } from "@/utils";
import { SERIF, UI } from "@/components/journal/Editorial";
import { cwOf } from "@/components/brand/flora";
import { C } from "@/components/brand/cleanTokens";
import { Eyebrow, Title, Card as CleanCard, Summary, Foot } from "@/components/brand/cleanKit";
import { SelectedRoomDetail } from "./SelectedLifestyleHeader";
import { CalmFindRow } from "./CalmLifestyle";

// Authored invitations belong to the actual activity. Full prose/tools stay in Details.
const JOY_HOOKS = {
  "A slow Sunday, just for you": "The bath can wait. Or you can stay in it.",
  "A long walk somewhere new": "Give your usual route the day off.",
  "Cook something that takes all afternoon": "Something bubbling. Absolutely no rush.",
  "Visit a gallery alone": "Stay with the painting you like. Skip the rest.",
  "A film and an early night": "The credits roll. So do you, into bed.",
  "A pottering day — small jobs you actually like, in no order": "Follow the small job that takes your fancy.",
  "A making day — paint, write, bake, nobody watching": "Make a little mess. See what happens.",
  "A whole day with a friend and no plan": "Excellent company. Questionable itinerary.",
  "A wander through town with nowhere to be": "Turn down the street you usually pass.",
  "A duvet, a stack of books, and the door shut": "A very selective guest list: you and the books.",
  "A morning market, a long lunch, an afternoon nap": "A little browsing. A proper lunch. Horizontal finale.",
  "Write one line you're proud of": "Keep it. Even if nobody else reads it.",
  "Ten minutes outside, no phone": "Leave the small screen. Try the very big sky.",
  "Text the friend you've been meaning to": "Start with hello. The perfect message can retire.",
  "Wear the good earrings on a nothing day": "The earrings didn't ask for an occasion.",
  "Play the song you loved at fifteen": "You probably still know every word.",
  "Buy the flowers, not for an occasion": "The occasion is that you like flowers.",
  "Learn the name of a tree on your street": "Meet a neighbour with considerably more leaves.",
  "Send a voice note instead of a text": "Let them hear your laugh in the middle.",
  "Take the long way home for no reason": "A small detour. See what you notice.",
  "Start the book you keep circling": "Page one. Finally.",
  "Tuck a little something away for future-you": "A small kindness with a later delivery date.",
  "Dance to one song in the kitchen": "The kitchen has no audition process.",
  "Move one thing back to where it makes you happy": "Your favourite corner could use its favourite thing.",
  "Say the idea out loud in the meeting": "Let the thought leave your notebook.",
  "Read one poem, out loud, to no one": "Let the words have a voice. Yours will do.",
  "Watch the sky change for five whole minutes": "Clouds have excellent commitment to the bit.",
};

// the 11 whole-life rooms (health is one room, not the house) — doors into the deeper surfaces.
const ROOMS = [
  { label: "Mirror", sub: "dress for how you feel", href: "Mirror", Icon: Shirt, cw: "blush" },
  { label: "Move", sub: "five minutes, for your mood", href: "Move", Icon: Dumbbell, cw: "sage" },
  { label: "Kindred", sub: "friendship & belonging", href: "Kindred", Icon: Users, cw: "crimson" },
  { label: "Curious", sub: "fall down a rabbit hole", href: "Curious", Icon: Compass, cw: "sky" },
  { label: "Delight", sub: "fun, gossip & play", href: "Delight", Icon: PartyPopper, cw: "gold" },
  { label: "Nest", sub: "a soft place to land", href: "Nest", Icon: Coffee, cw: "gold" },
  { label: "Tonight", sub: "the evening wind-down", href: "Tonight", Icon: Moon, cw: "lavender" },
  { label: "Becoming", sub: "growth, gently", href: "Becoming", Icon: Sprout, cw: "sage" },
  { label: "Make", sub: "create for the pleasure", href: "Make", Icon: Feather, cw: "blush" },
  { label: "Outside", sub: "a breath of air", href: "Outside", Icon: Trees, cw: "sage" },
  { label: "Money", sub: "money, gently", href: "Money", Icon: Coins, cw: "gold" },
];

function GoodCard({ eyebrow, title, accent = "gold", children, style, className }) {
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

export default function GoodLifeFocus({ timeLens, joys = [], onSlip, onPlan, timeOfDay, presentation, onOpenRooms, calmLayout = false }) {
  const [moreJoys,setMoreJoys]=React.useState(false);
  const greet = timeOfDay === "morning" ? "What have you got time for this morning?"
    : timeOfDay === "evening" ? "What have you got time for this evening?"
    : "What have you got time for right now?";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 0 · section-specific summary */}
      {!calmLayout && <Summary Icon={Clock} cw="gold">{greet}{!presentation && " A small joy — and permission to enjoy it."}</Summary>}

      {/* 1 · TIME — the real picker, filters to what's worth the minutes she has */}
      {timeLens ? (
        <GoodCard className="fw-selected-time" eyebrow="Pick by the time you have" title={presentation ? "How long have you got?" : "A few minutes, or a whole evening"} accent="gold">
          {presentation && <SelectedRoomDetail section="good"/>}
          {timeLens}
        </GoodCard>
      ) : null}

      {/* 2 · A SMALL JOY / PERMISSION — opens in place */}
      {joys.length ? (
        <GoodCard className="fw-selected-joys" eyebrow={presentation ? "For the pleasure of it" : "No streaks, nothing owed"} title={presentation ? "Small joys" : "Small joys & permission"} accent="plum">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(onOpenRooms && !moreJoys ? joys.slice(0,3) : joys).map((it) => calmLayout ? <CalmFindRow key={it.id} item={it} onOpen={onPlan} onDetails={onSlip} label="Plan a time"/> : <CoverCard presentation={presentation} key={it.id} item={it} previewText={presentation ? (it.type === "quote" ? "" : JOY_HOOKS[it.title] ?? it.subtitle) : undefined} compact onOpen={() => onSlip && onSlip(it)} onConsume={presentation && onPlan ? ()=>onPlan(it) : undefined} consumeLabel="Plan a time" />)}
            {onOpenRooms && joys.length>3 && <button className="fw-focused-button" onClick={()=>setMoreJoys(value=>!value)}>{moreJoys ? "A few is plenty" : "More small joys"}</button>}
          </div>
        </GoodCard>
      ) : null}

      {/* 3 · YOUR ROOMS — the 11 whole-life doors (health is one room, not the house) */}
      {onOpenRooms ? <button className="fw-focused-button" onClick={onOpenRooms} style={{alignSelf:"flex-start"}}><Sprout size={17}/>Explore life’s rooms</button> : <GoodCard className="fw-selected-doors" eyebrow="The rest of your life" title="Step into a room" accent="crimson">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {ROOMS.map((r) => (
            <a key={r.href} href={createPageUrl(r.href)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", background: C.sunk, border: `1px solid ${C.hair}`, borderRadius: 13, padding: "11px 12px" }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: `${cwOf(r.cw).petal}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={16} color={cwOf(r.cw).petal} /></span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 15.5, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{r.label}</span>
                <span style={{ display: "block", fontFamily: UI, fontSize: 11, color: C.faint, lineHeight: 1.25, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </GoodCard>}

      <Foot>{presentation ? "Some things are worth doing badly, just for fun." : "Leisure is the point — a little is plenty, and “not today” is a fine answer."}</Foot>
    </div>
  );
}

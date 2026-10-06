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

export default function GoodLifeFocus({ timeLens, joys = [], onSlip, onPlan, timeOfDay, presentation }) {
  const greet = timeOfDay === "morning" ? "What have you got time for this morning?"
    : timeOfDay === "evening" ? "What have you got time for this evening?"
    : "What have you got time for right now?";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 0 · section-specific summary */}
      <Summary Icon={Clock} cw="gold">{greet}{!presentation && " A small joy — and permission to enjoy it."}</Summary>

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
            {joys.map((it) => <CoverCard presentation={presentation} key={it.id} item={it} compact onOpen={() => onSlip && onSlip(it)} onConsume={presentation && onPlan ? ()=>onPlan(it) : undefined} consumeLabel="Plan a time" />)}
          </div>
        </GoodCard>
      ) : null}

      {/* 3 · YOUR ROOMS — the 11 whole-life doors (health is one room, not the house) */}
      <GoodCard className="fw-selected-doors" eyebrow="The rest of your life" title="Step into a room" accent="crimson">
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
      </GoodCard>

      <Foot>{presentation ? "Some things are worth doing badly, just for fun." : "Leisure is the point — a little is plenty, and “not today” is a fine answer."}</Foot>
    </div>
  );
}

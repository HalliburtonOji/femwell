// GoodLifeFocus — the bespoke §19 surface for the Good life chip. Actionable, do-it-now: the real
// time-picker reads how long she's got and filters to what's worth those minutes, then a small joy /
// permission to enjoy it (opens in place), then the 11 whole-life rooms as doors she can step into.
// Deliberately ordered time → joy → rooms. The picker + slips are the real wired widgets in cream.
import React from "react";
import { Clock, Shirt, Dumbbell, Users, Compass, PartyPopper, Coffee, Moon, Sprout, Feather, Trees, Coins, ChevronRight } from "lucide-react";
import { CoverCard } from "@/components/brand/expandCards";
import { createPageUrl } from "@/utils";
import { T, SERIF, UI, PAPER_TEX } from "@/components/journal/Editorial";
import { cwOf, CardFrame } from "@/components/brand/flora";

const OX = "#7A1A12";

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

function GoodCard({ eyebrow, title, accent = "gold", children }) {
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

export default function GoodLifeFocus({ timeLens, joys = [], onSlip, timeOfDay }) {
  const greet = timeOfDay === "morning" ? "What have you got time for this morning?"
    : timeOfDay === "evening" ? "What have you got time for this evening?"
    : "What have you got time for right now?";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 0 · section-specific summary */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "2px 2px" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${cwOf("gold").petal}1f`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}><Clock size={18} color={cwOf("gold").petal} /></span>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: OX, lineHeight: 1.5, margin: 0 }}>{greet} A small joy — and permission to enjoy it.</p>
      </div>

      {/* 1 · TIME — the real picker, filters to what's worth the minutes she has */}
      {timeLens ? (
        <GoodCard eyebrow="Pick by the time you have" title="A few minutes, or a whole evening" accent="gold">
          {timeLens}
        </GoodCard>
      ) : null}

      {/* 2 · A SMALL JOY / PERMISSION — opens in place */}
      {joys.length ? (
        <GoodCard eyebrow="No streaks, nothing owed" title="Small joys & permission" accent="plum">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {joys.map((it) => <CoverCard key={it.id} item={it} compact onOpen={() => onSlip && onSlip(it)} />)}
          </div>
        </GoodCard>
      ) : null}

      {/* 3 · YOUR ROOMS — the 11 whole-life doors (health is one room, not the house) */}
      <GoodCard eyebrow="The rest of your life" title="Step into a room" accent="crimson">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {ROOMS.map((r) => (
            <a key={r.href} href={createPageUrl(r.href)} className="fw-elite-press" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", background: T.paper || "#ECE7DA", border: `1px solid ${T.line}`, borderRadius: 13, padding: "11px 12px" }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: `${cwOf(r.cw).petal}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={16} color={cwOf(r.cw).petal} /></span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: SERIF, fontSize: 15.5, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{r.label}</span>
                <span style={{ display: "block", fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.25, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </GoodCard>

      <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: T.muted, textAlign: "center", margin: "2px 14px 0", lineHeight: 1.55 }}>Leisure is the point — a little is plenty, and “not today” is a fine answer.</p>
    </div>
  );
}

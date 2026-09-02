// SHARED POLISHED KIT for the four Lifestyle redesign directions (A Today-first · B Rooms ·
// C Almanac · D Compass). Extracted from the calibration build (The Almanac) so all four inherit
// the SAME high-craft card / shelf / reader language and the SAME retained flora header — each
// direction differs only in INFORMATION ARCHITECTURE, never in craft or feature-set. This is the
// guard against the "rushed / shallow / stripped" failure: the craft lives here, once.
//
// Craft contract (to/above §6.7/§6.8/§6.10): 8-pt rhythm · greyscale-first + ONE accent per
// section · whitespace confidence · named capped See-all shelves + peeking card (no dot-only) ·
// AA contrast · ≥44px targets · corner sprigs + paper-grain + double-shadow cards. Seeded.
import React, { useEffect, useState } from "react";
import { Feather, BookOpen, Headphones, Play, Library, Moon, Sparkles, Clock, Bookmark, ChevronRight, ArrowRight, X } from "lucide-react";
import { PAPER_BG, PAPER_TEX } from "@/components/journal/Editorial";
import { cwOf, CardFrame, clampLines } from "@/components/brand/flora";
import FloraCover from "@/components/brand/FloraCover";
import { FwFloraHero } from "@/components/brand/PageTop";
import { AA, SERIF, UI, Tap, ActionButton } from "./kit";
import { ROOMS, ItemReader } from "./content";

export { PAPER_BG, PAPER_TEX, ROOMS, ItemReader, cwOf, FloraCover };
export const OX = "#7A1A12";
// colourway name → AA-safe small-text accent (greyscale-first; ONE accent per section)
export const accentText = (a) => (a === "crimson" ? AA.crimson : a === "sage" ? AA.sage : a === "plum" ? AA.plum : AA.label);

// ── seeded content — the 6 content boards; each shelf capped, every item opens a real reader ────
const mk = (id, kind, title, line, body, act = "Read") => ({ id, kicker: kind, hook: title, line, body, act, accent: AA.crimsonBig });
export const SHELVES = [
  { key: "read", title: "Read", sub: "Articles, guides & fiction", flower: "iris", cw: "plum", Icon: BookOpen,
    items: [
      mk("r1", "Today's chapter", "Small Mends — The Envelope", "The envelope had sat on Hilary's desk since Wednesday. She had not opened it.", ["The envelope had been on Hilary's desk since the Wednesday, propped against the tin where the fire-door keys live. She had not opened it.", "Ivan Prewitt came at two, in a coat bought for a different job, carrying a clipboard the way a man carries an umbrella he does not believe in."]),
      mk("r2", "For your season", "Iron, magnesium & dark chocolate — eat these on your period", "The steady, un-preachy version of what actually helps a bleeding week.", ["Not a rule, not a cleanse — iron to replace what you lose, magnesium for the cramping, and a square of dark chocolate that earns its place.", "Warmth over willpower. A little is plenty."]),
      mk("r3", "Read · Kindred", "The friendships nobody warns you about", "The slow unravel of a friendship, and the tending that mends it.", ["A tender essay on adult friendship — how it drifts without anyone deciding, and the small deliberate acts that keep it.", "You don't have to fix it. You have to tend it."]),
      mk("r4", "Read · Becoming", "The difference between being kind and being scared", "A guide to unwinding people-pleasing, gently.", ["People-pleasing looks like kindness from the outside. From the inside, it's fear — and there's a kinder way to hold both.", "Being kind to yourself is the practice under all of it."]),
      mk("r5", "Read · Curious", "The weight of paper cranes", "A quiet, strange, wonderful thing to fall into.", ["The first time Evie was ten, sitting alone on a park bench, folding a paper crane she couldn't quite finish.", "Learning for the sheer aliveness of it — no test, no deadline."]),
    ] },
  { key: "watch", title: "Listen & watch", sub: "Podcasts, shows & short films", flower: "marigold", cw: "sage", Icon: Play,
    items: [
      mk("w1", "Listen · 45 min", "The Cycle-Synced Work Week", "Mel Giedroyc & AJ Odudu on working with your body, not against it.", ["A warm, funny conversation about pacing a working week to your energy — the follicular sprint, the luteal wind-down, and why 'push through' is often the worst advice.", "It keeps playing while you wander the app."], "Listen"),
      mk("w2", "Watch · Move", "A ten-minute morning flow — nothing to achieve", "Gentle mobility for a slow start. Move to feel better.", ["A slow, kind mobility sequence that meets a menstrual-week body where it is. No counting, no burn.", "Plays in place, one tap, on the card face."], "Watch"),
      mk("w3", "Watch · Delight", "Do not watch if you are anti-romper", "Something silly, for no reason at all.", ["Pure joy, zero utility — the kind of thing you send to a friend with no caption.", "You don't have to earn or get anything out of it."], "Watch"),
      mk("w4", "Listen · Curious", "The JFK Assassination, Part 2", "With Mackenzie Joy Brennan — learn while your hands are busy.", ["A gripping, well-told history for the washing-up, the walk, the commute.", "Press play and let it run."], "Listen"),
      mk("w5", "Watch · Nest", "In the kitchen with Deliciously Ella", "Something warm on the stove.", ["Comfort and pleasure — a stew, a bake, a proper Sunday something. Nothing to count.", "Cook to feel cosy, not to perform."], "Watch"),
    ] },
  { key: "books", title: "Books", sub: "Your shelf & free classics", flower: "rose", cw: "gold", Icon: Library,
    items: [
      mk("b1", "On your shelf", "Little Women — pick up where you left off", "A chapter a day, spoiler-safe, no streaks.", ["Your place is saved. A free classic, a chapter at a time, at exactly your pace — lurking and skipping and re-reading all allowed.", "No 'you're behind', no streak to break."]),
      mk("b2", "Free classic", "Pride and Prejudice", "The comfort re-read, whenever you fancy it.", ["Open it anywhere. A whole library of free classics, a chapter a day.", "Reading is allowed to be slow."]),
      mk("b3", "Book club", "A book, together — at our own pace", "One read, spoiler-safe checkpoints, no streaks.", ["The season's read, discussed gently in the rooms — come for the book, stay for the company.", "Lurking counts."], "Open"),
      mk("b4", "New this week", "The season's shelf", "Five reads chosen for a follicular week.", ["Fresh picks tuned to where you are — a little ambition, a little rest.", "Add any to your shelf."]),
    ] },
  { key: "story", title: "Today's story & your sky", sub: "The daily chapter & the night sky", flower: "poppy", cw: "crimson", Icon: Feather,
    items: [
      mk("s1", "Daily story", "Small Mends — Chapter 14", "Today's instalment, new this morning.", ["A finished, serialised story — a chapter a day. Today's picks up on last night's cliffhanger.", "A few quiet minutes, whenever you have them."]),
      mk("s2", "The night sky", "Waxing crescent, 39% lit tonight", "Held lightly, just for the comfort of it.", ["As the moon grows, the folklore leans toward beginnings — a night to nurture an idea, not finish one.", "No fate, no score. Just the sky."], "Open"),
      mk("s3", "Your reading", "A follicular week, gently read", "What this phase means for your energy.", ["Energy building, a good week to start something — read week by week, honestly, never prescribed.", "Add your dates and it reads your season."]),
    ] },
  { key: "good", title: "The good life", sub: "What have you got time for · small joys", flower: "chamomile", cw: "gold", Icon: Clock,
    items: [
      mk("g1", "A few minutes", "One song — dance the whole thing", "Five minutes counts. A complete workout for your mood.", ["Even ≤5-minute bouts lift mood and fitness (2022 Nature Medicine). One song, danced badly, in the kitchen.", "Not to your body — to your head."], "Try"),
      mk("g2", "Fifteen minutes", "Make something badly, on purpose", "A biro and an envelope is enough kit.", ["Making for the pleasure of it — the wonk is the whole charm. It doesn't have to become anything.", "Leisure is the point."], "Open"),
      mk("g3", "A whole evening", "A quiet hour, permission granted", "An evening that's yours, owed to no one.", ["Book a slow evening in — nowhere to be, nothing to finish. Put it in the planner like you'd keep it for a friend.", "Rest is productive."], "Open"),
      mk("g4", "Money, gently", "Open the banking app, look, close it", "No action needed. No shame, no dread.", ["One small, low-stakes money thing — every one optional, 'not today' is a fine answer. Today: just look, without flinching.", "You are not behind."]),
    ] },
  { key: "yours", title: "Yours", sub: "Saved & for your phase", flower: "lavender", cw: "plum", Icon: Bookmark,
    items: [
      mk("y1", "Saved", "The things you kept", "Everything you've saved, in one place.", ["Your saved reads, listens and slips — kept for when the moment's right.", "Nothing owed; open any of it whenever."], "Open"),
      mk("y2", "For your phase", "Tuned to your follicular week", "Six things chosen for where you are.", ["A gentle, phase-aware set — a little ambition, a little rest — refreshed as your week turns.", "Never prescribed, always optional."]),
    ] },
];
// a cross-domain "for you today" deck (curated across boards)
export const forYouDeck = () => [SHELVES[3].items[0], SHELVES[1].items[0], SHELVES[0].items[1], SHELVES[4].items[1], SHELVES[2].items[0]];
export const ledeItem = () => SHELVES[0].items[0];

// ══ shared chrome ══════════════════════════════════════════════════════════════════════════════
// The four directions and their PUBLIC routes — the ribbon carries an A·B·C·D switcher so the four
// can be compared by tapping, with no dependence on the (founder-gated, flaky) Ideas pill.
export const DIRECTIONS = [
  { letter: "A", name: "Today, first", href: "/LifestyleTodayDemo" },
  { letter: "B", name: "The Rooms", href: "/LifestyleRoomsDemo" },
  { letter: "C", name: "The Almanac", href: "/LifestyleAlmanacDemo" },
  { letter: "D", name: "The Compass", href: "/LifestyleCompassDemo" },
];
export function DemoRibbon({ label, current }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <a href="/Ideas" style={{ display: "inline-flex", alignItems: "center", gap: 5, minHeight: 36, padding: "6px 12px 6px 9px", border: `1px solid ${AA.paperDeep}`, borderRadius: 999, background: AA.paperHi, color: AA.ink, textDecoration: "none", fontFamily: UI, fontSize: 13, fontWeight: 700 }}>‹ Ideas</a>
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: AA.label }}>{label}</span>
      </div>
      {/* A·B·C·D switcher — compare the four directions, no pill needed */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 700, color: AA.muted, marginRight: 2 }}>Compare:</span>
        {DIRECTIONS.map((d) => {
          const on = d.letter === current;
          return (
            <a key={d.letter} href={d.href} aria-current={on ? "page" : undefined} style={{ display: "inline-flex", alignItems: "center", gap: 5, minHeight: 34, padding: "6px 11px", borderRadius: 999, textDecoration: "none", fontFamily: UI, fontSize: 12.5, fontWeight: 700, background: on ? AA.crimsonBig : AA.paperHi, color: on ? "#fff" : AA.ink, border: `1px solid ${on ? AA.crimsonBig : AA.line}`, cursor: "pointer" }}>
              <span style={{ fontWeight: 800 }}>{d.letter}</span> <span style={{ opacity: on ? 1 : 0.85 }}>{d.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// the RETAINED flora/video header — byte-identical across all four directions.
export function FloraHeader({ colorway = "crimson" }) {
  return (
    <FwFloraHero title="Your Lifestyle" colorway={colorway} bloom="cosmos" openness={1} creature="butterfly" flankL="iris" flankR="sunflower" titleColor={OX} line="A little of everything — read a little, feel a little, whenever the moment's yours." garden="lifestyle" photo="lifestyle" />
  );
}

export function PhaseChip({ style }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 16px", ...style }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: AA.paperHi, border: `1px solid ${AA.line}`, borderRadius: 999 }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: cwOf("sage").petal }} />
        <span style={{ fontFamily: UI, fontSize: 12.5, fontWeight: 700, letterSpacing: ".01em", color: AA.inkSoft }}>Follicular · Day 10 · a building week</span>
      </span>
    </div>
  );
}

// ══ section head — Fraunces title + optional icon + optional "See all · N →" door ═══════════════
export function SectionHead({ title, sub, count, accent, Icon, onSeeAll, size = 25 }) {
  const at = accentText(accent);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, margin: "0 0 12px" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Icon && <span style={{ width: 26, height: 26, borderRadius: 8, background: `${cwOf(accent).petal}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={15} color={at} /></span>}
          <h2 style={{ fontFamily: SERIF, fontSize: size, fontWeight: 600, color: AA.ink, lineHeight: 1.1, margin: 0, letterSpacing: -0.3 }}>{title}</h2>
        </div>
        {sub && <div style={{ fontFamily: UI, fontSize: 12.5, color: AA.muted, marginTop: 3, marginLeft: Icon ? 34 : 0 }}>{sub}</div>}
      </div>
      {onSeeAll && (
        <Tap onClick={onSeeAll} label={`See all ${title}`} style={{ gap: 4, padding: "9px 12px", background: "transparent", border: `1px solid ${AA.line}`, borderRadius: 999, color: at, fontFamily: UI, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
          See all {count ? `· ${count}` : ""} <ArrowRight size={15} />
        </Tap>
      )}
    </div>
  );
}

// ══ horizontal shelf — capped, peeking next card via fade-mask (NOT dot-only), ≥44px cards ═══════
export function Shelf({ items, accent, onOpen }) {
  const at = accentText(accent);
  return (
    <div className="sk-shelf" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 2px 10px", margin: "0 -18px", paddingLeft: 18, paddingRight: 18, scrollbarWidth: "none", WebkitMaskImage: "linear-gradient(90deg,#000 0,#000 calc(100% - 30px),transparent 100%)", maskImage: "linear-gradient(90deg,#000 0,#000 calc(100% - 30px),transparent 100%)", scrollSnapType: "x proximity" }}>
      <style>{`.sk-shelf::-webkit-scrollbar{display:none}`}</style>
      {items.map((it) => { const petal = cwOf(accent).petal; return (
        <button key={it.id} onClick={() => onOpen(it)} className="fw-ce-press" style={{ position: "relative", overflow: "hidden", scrollSnapAlign: "start", flex: "0 0 clamp(224px, 78vw, 296px)", height: 202, textAlign: "left", cursor: "pointer", background: `linear-gradient(165deg, ${AA.paperHi} 0%, ${petal}12 100%)`, border: `1px solid ${AA.line}`, borderLeft: `4px solid ${petal}`, borderRadius: 18, padding: 16, boxShadow: "0 6px 22px rgba(58,44,26,.10), 0 1px 3px rgba(58,44,26,.05)", display: "flex", flexDirection: "column" }}>
          <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${PAPER_TEX})`, backgroundSize: "170px", mixBlendMode: "multiply", opacity: 0.45, pointerEvents: "none" }} />
          <CardFrame color={petal} opacity={0.42} size={38} />
          <span style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
            <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: at, marginBottom: 6 }}>{it.kicker}</span>
            <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: AA.ink, lineHeight: 1.18, margin: "0 0 6px", ...clampLines(2) }}>{it.hook}</span>
            <span style={{ fontFamily: SERIF, fontSize: 14.5, color: AA.inkSoft, lineHeight: 1.45, flex: 1, ...clampLines(3) }}>{it.line}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 800, color: at }}>{it.act} <ChevronRight size={15} /></span>
          </span>
        </button>
      ); })}
      <span style={{ flex: "0 0 6px" }} aria-hidden />
    </div>
  );
}

// ══ a single tall editorial card (for a stacked / vertical layout — Today-first, Compass picks) ══
export function StackCard({ item, accent, onOpen }) {
  const petal = cwOf(accent).petal; const at = accentText(accent);
  return (
    <button onClick={() => onOpen(item)} className="fw-ce-press" style={{ position: "relative", overflow: "hidden", width: "100%", textAlign: "left", cursor: "pointer", background: `linear-gradient(165deg, ${AA.paperHi} 0%, ${petal}12 100%)`, border: `1px solid ${AA.line}`, borderLeft: `4px solid ${petal}`, borderRadius: 16, padding: "15px 16px", boxShadow: "0 6px 22px rgba(58,44,26,.10), 0 1px 3px rgba(58,44,26,.05)", display: "block" }}>
      <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${PAPER_TEX})`, backgroundSize: "170px", mixBlendMode: "multiply", opacity: 0.4, pointerEvents: "none" }} />
      <CardFrame color={petal} opacity={0.4} size={34} />
      <span style={{ position: "relative", display: "block" }}>
        <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: at }}>{item.kicker}</span>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: AA.ink, lineHeight: 1.2, margin: "5px 0 5px" }}>{item.hook}</span>
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, color: AA.inkSoft, lineHeight: 1.45, ...clampLines(2) }}>{item.line}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 11, fontFamily: UI, fontSize: 13, fontWeight: 800, color: at }}>{item.act} <ChevronRight size={15} /></span>
      </span>
    </button>
  );
}

// ══ the big LEDE card (today's chapter, flora cover) ═════════════════════════════════════════════
export function LedeCard({ onOpen }) {
  const lede = ledeItem();
  return (
    <button onClick={() => onOpen(lede)} className="fw-ce-press" style={{ position: "relative", display: "block", width: "100%", textAlign: "left", cursor: "pointer", padding: 0, border: `1px solid ${AA.line}`, borderRadius: 20, overflow: "hidden", background: AA.paperHi, boxShadow: "0 10px 34px rgba(58,44,26,.14), 0 2px 6px rgba(58,44,26,.06)" }}>
      <FloraCover title="Small Mends" category="Fiction" colorway="crimson" seed="sk-lede" height={188} roundTop showTitle={false} idx="sk-lede" />
      <CardFrame color={cwOf("crimson").petal} opacity={0.5} size={46} />
      <div style={{ position: "relative", padding: 18 }}>
        <span aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${PAPER_TEX})`, backgroundSize: "200px", mixBlendMode: "multiply", opacity: 0.4, pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: AA.crimson, marginBottom: 6 }}>Today's chapter · new this morning</div>
          <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 600, color: AA.ink, lineHeight: 1.1, margin: "0 0 9px", letterSpacing: -0.5 }}>Small Mends — The Envelope</div>
          <div style={{ fontFamily: SERIF, fontSize: 16.5, color: AA.inkSoft, lineHeight: 1.5, marginBottom: 15 }}>The envelope had sat on Hilary's desk since Wednesday, propped against the tin. She had not opened it — which Alison thought, afterwards, was the most honest thing about it.</div>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", boxSizing: "border-box", background: AA.crimsonBig, color: "#fff", borderRadius: 12, fontFamily: UI, fontSize: 15, fontWeight: 700 }}><Feather size={17} /> Read today's chapter</span>
        </div>
      </div>
    </button>
  );
}

// ══ See-all overlay — the full grid of a shelf (the labelled door leads somewhere real) ══════════
export function SeeAllOverlay({ shelf, onClose, onOpen }) {
  useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const at = accentText(shelf.cw);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, background: AA.paper, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, background: AA.paper, borderBottom: `1px solid ${AA.line}`, zIndex: 2 }}>
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: OX }}>{shelf.title} · all {shelf.items.length}</div>
          <Tap onClick={onClose} label="Close" style={{ gap: 5, padding: "8px 12px", border: `1px solid ${AA.paperDeep}`, borderRadius: 999, background: AA.paperHi, color: AA.ink, fontFamily: UI, fontSize: 14, fontWeight: 700 }}><X size={16} /> Close</Tap>
        </div>
      </div>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "16px 18px 60px", display: "flex", flexDirection: "column", gap: 12 }}>
        {shelf.items.map((it) => (
          <button key={it.id} onClick={() => onOpen(it)} className="fw-ce-press" style={{ textAlign: "left", cursor: "pointer", background: AA.paperHi, border: `1px solid ${AA.line}`, borderLeft: `4px solid ${cwOf(shelf.cw).petal}`, borderRadius: 14, padding: "14px 15px" }}>
            <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: at, marginBottom: 4 }}>{it.kicker}</div>
            <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: AA.ink, lineHeight: 1.2 }}>{it.hook}</div>
            <div style={{ fontFamily: SERIF, fontSize: 14.5, color: AA.inkSoft, lineHeight: 1.45, marginTop: 5 }}>{it.line}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ══ room reader — the whole-life domain opens in place ══════════════════════════════════════════
export function RoomReader({ room, onClose }) {
  useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const at = accentText(room.accent === AA.crimson ? "crimson" : room.accent === AA.sage ? "sage" : room.accent === AA.plum ? "plum" : "gold");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 95, background: AA.paper, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, background: AA.paper, borderBottom: `1px solid ${AA.line}` }}>
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "10px 16px", display: "flex", justifyContent: "flex-end" }}>
          <Tap onClick={onClose} label="Close" style={{ gap: 5, padding: "8px 12px", border: `1px solid ${AA.paperDeep}`, borderRadius: 999, background: AA.paperHi, color: AA.ink, fontFamily: UI, fontSize: 14, fontWeight: 700 }}><X size={16} /> All rooms</Tap>
        </div>
      </div>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "18px 18px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: 13, background: `${room.accent}1f`, display: "grid", placeItems: "center" }}><room.Icon size={23} color={room.accent} /></span>
          <div><div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: at }}>The {room.label} room</div><h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: AA.ink, lineHeight: 1.15, margin: "1px 0 0" }}>{room.sub}</h1></div>
        </div>
        {room.body.map((p, i) => <p key={i} style={{ fontFamily: SERIF, fontSize: 18, color: AA.inkSoft, lineHeight: 1.6, margin: "0 0 14px" }}>{p}</p>)}
        <div style={{ marginTop: 16 }}><ActionButton bg={AA.crimsonBig} onClick={onClose}>Enter {room.label}</ActionButton></div>
      </div>
    </div>
  );
}

// ══ closing line ════════════════════════════════════════════════════════════════════════════════
export function ClosingLine({ children }) {
  return <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: AA.muted, margin: "34px auto 0", maxWidth: 340, lineHeight: 1.55 }}>{children}</p>;
}

// ══ SECTION DECK — the core two-level reveal-in-place interaction ════════════════════════════════
// A row of SECTION cards (the content boards). TAP a section → its focused cards open IN PLACE right
// beneath the row (a focused vertical set, staying on the page — no navigation). TAP a card → the
// exact item opens (onOpen). This is the progressive-disclosure "reveal in place" pattern.
export function SectionDeck({ shelves, onOpen, onSeeAll, startKey }) {
  const [act, setAct] = useState(startKey !== undefined ? startKey : null); // closed until tapped
  const active = shelves.find((s) => s.key === act) || null;
  return (
    <div>
      {/* the section row — tappable cards, horizontally scrollable with a peek cue */}
      <div className="sk-secrow" style={{ display: "flex", gap: 9, overflowX: "auto", padding: "2px 2px 4px", scrollbarWidth: "none", WebkitMaskImage: "linear-gradient(90deg,#000 0,#000 calc(100% - 24px),transparent 100%)", maskImage: "linear-gradient(90deg,#000 0,#000 calc(100% - 24px),transparent 100%)" }}>
        <style>{`.sk-secrow::-webkit-scrollbar{display:none}`}</style>
        {shelves.map((s) => {
          const on = s.key === act; const petal = cwOf(s.cw).petal; const at = accentText(s.cw);
          return (
            <button key={s.key} onClick={() => setAct(on ? null : s.key)} aria-pressed={on} className="fw-elite-press" style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: 5, minHeight: 62, padding: "10px 13px", borderRadius: 13, cursor: "pointer", background: on ? `linear-gradient(160deg, ${AA.paperHi} 0%, ${petal}1e 100%)` : AA.paperHi, border: `1px solid ${on ? petal : AA.line}`, boxShadow: on ? `0 0 0 1px ${petal}, 0 2px 8px ${petal}30` : "0 1px 3px rgba(58,44,26,.07)", transform: on ? "translateY(-1px)" : "none", transition: "all .15s" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: on ? `${petal}22` : `${AA.label}14`, display: "grid", placeItems: "center" }}><s.Icon size={15} color={on ? at : AA.muted} /></span>
                <span style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 600, color: AA.ink, whiteSpace: "nowrap" }}>{s.title}</span>
              </span>
              <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, letterSpacing: ".02em", color: on ? at : AA.muted, marginLeft: 33 }}>{s.items.length} inside</span>
            </button>
          );
        })}
      </div>

      {/* the reveal — the active section's focused cards, in place */}
      {active && (
        <div key={active.key} className="sk-reveal" style={{ marginTop: 16 }}>
          <style>{`@keyframes skReveal{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.sk-reveal{animation:skReveal .22s ease-out}`}</style>
          <SectionHead title={active.title} sub={active.sub} accent={active.cw} count={active.items.length} onSeeAll={onSeeAll ? () => onSeeAll(active) : undefined} />
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {active.items.slice(0, 3).map((it) => <StackCard key={it.id} item={it} accent={active.cw} onOpen={onOpen} />)}
          </div>
          {active.items.length > 3 && onSeeAll && (
            <button onClick={() => onSeeAll(active)} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", minHeight: 46, marginTop: 11, background: "transparent", border: `1px dashed ${cwOf(active.cw).petal}`, borderRadius: 12, cursor: "pointer", fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: accentText(active.cw) }}>
              See all {active.items.length} in {active.title} <ArrowRight size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ══ the 11 rooms as a compact 2-col bento (featured tile spans both cols, owns the accent) ═══════
// Shared by C/A/D; greyscale-first, one accent on the featured tile only. B uses its own richer gallery.
export function RoomsBento({ onOpen }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {ROOMS.map((r, i) => {
        const feature = i === 0; const crim = AA.crimsonBig;
        return (
          <button key={r.key} onClick={() => onOpen(r)} className="fw-ce-press" style={{ position: "relative", overflow: "hidden", gridColumn: feature ? "1 / -1" : "auto", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: feature ? "row" : "column", alignItems: feature ? "center" : "flex-start", justifyContent: "flex-start", gap: feature ? 14 : 9, padding: 14, minHeight: feature ? 104 : 96, background: feature ? `linear-gradient(160deg, ${AA.paperHi} 0%, ${crim}0f 100%)` : AA.paperHi, border: `1px solid ${AA.line}`, ...(feature ? { borderLeft: `4px solid ${crim}` } : {}), borderRadius: 14 }}>
            {feature && <CardFrame color={cwOf("crimson").petal} opacity={0.4} size={38} />}
            <span style={{ width: feature ? 46 : 38, height: feature ? 46 : 38, borderRadius: 11, background: feature ? `${crim}1f` : `${AA.label}14`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={feature ? 23 : 19} color={feature ? AA.crimson : AA.muted} /></span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontFamily: SERIF, fontSize: feature ? 22 : 18, fontWeight: 600, color: AA.ink, lineHeight: 1.1 }}>{r.label}</span>
              <span style={{ display: "block", fontFamily: UI, fontSize: 12, color: AA.muted, lineHeight: 1.3, marginTop: 2 }}>{feature ? r.sub + " · " + r.fresh : r.fresh}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// page shell — max-width column on paper ground with nav-safe bottom padding.
export function Page({ children }) {
  return (
    <div style={{ minHeight: "100vh", overflowX: "clip", ...PAPER_BG }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "14px 18px calc(90px + env(safe-area-inset-bottom))" }}>{children}</div>
    </div>
  );
}

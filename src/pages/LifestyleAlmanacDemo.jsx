// Lifestyle · THE ALMANAC (editorial magazine) — redesign demo, the calibration bar-setter (2026-08-22).
// THESIS: preserve EVERY feature, relocate behind labelled doors, never delete — cut overwhelm through
// hierarchy + grouping + progressive disclosure, and make it genuinely beautiful (editorial register).
// Research-backed: hero + short for-you leads (Headspace/Calm) · 11 domains as a scannable bento, not
// 11 sliders (Airbnb + bento ≤12–15 + Hick's) · each shelf = titled header + count + See-all + peeking
// card, capped ~5–6 (Apple News+ / NN/g). Craft: 8-pt rhythm, one accent per section, whitespace, AA
// contrast, ≥44px. RETAINS the real FwFloraHero header untouched. Seeded/self-contained; live untouched.
import React, { useState, useRef, useEffect } from "react";
import { Feather, BookOpen, Headphones, Play, Library, Moon, Sparkles, Coins, ChevronRight, ArrowRight, X, Clock, Bookmark, Grid2x2, Compass } from "lucide-react";
import { T, PAPER_BG } from "@/components/journal/Editorial";
import { cwOf } from "@/components/brand/flora";
import FloraCover from "@/components/brand/FloraCover";
import { FwFloraHero } from "@/components/brand/PageTop";
import { AA, SERIF, UI, Tap, ActionButton } from "@/components/lifestyle-demos/kit";
import { ROOMS, ItemReader } from "@/components/lifestyle-demos/content";

const OX = "#7A1A12";
const accentText = (a) => (a === "crimson" ? AA.crimson : a === "sage" ? AA.sage : a === "plum" ? AA.plum : AA.label);
// map a colourway name → the section's single accent (greyscale-first; ONE accent per section)
const CW = { read: "plum", watch: "sage", listen: "gold", story: "crimson", good: "gold", yours: "plum" };

// ── seeded content — each shelf capped, every item opens a real reader ─────────────────────────
const mk = (id, kind, title, line, body, act = "Read") => ({ id, kicker: kind, hook: title, line, body, act, accent: AA.crimsonBig });
const SHELVES = [
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

// ── polished sub-components (craft to the §6.7 bar) ────────────────────────────────────────────
function SectionHead({ title, sub, count, accent, Icon, onSeeAll }) {
  const at = accentText(accent);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, margin: "0 0 12px" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Icon && <span style={{ width: 26, height: 26, borderRadius: 8, background: `${cwOf(accent).petal}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={15} color={at} /></span>}
          <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: AA.ink, lineHeight: 1.1, margin: 0, letterSpacing: -0.3 }}>{title}</h2>
        </div>
        {sub && <div style={{ fontFamily: UI, fontSize: 12.5, color: AA.muted, marginTop: 3, marginLeft: 34 }}>{sub}</div>}
      </div>
      {onSeeAll && (
        <Tap onClick={onSeeAll} label={`See all ${title}`} style={{ gap: 4, padding: "9px 12px", background: "transparent", border: `1px solid ${AA.line}`, borderRadius: 999, color: at, fontFamily: UI, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
          See all {count ? `· ${count}` : ""} <ArrowRight size={15} />
        </Tap>
      )}
    </div>
  );
}

// horizontal shelf — capped, peeking next card via fade-mask (NOT dot-only), ≥44px cards.
function Shelf({ items, accent, onOpen }) {
  const at = accentText(accent);
  return (
    <div className="alm-shelf" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 2px 10px", margin: "0 -18px", paddingLeft: 18, paddingRight: 18, scrollbarWidth: "none", WebkitMaskImage: "linear-gradient(90deg,#000 0,#000 calc(100% - 30px),transparent 100%)", maskImage: "linear-gradient(90deg,#000 0,#000 calc(100% - 30px),transparent 100%)", scrollSnapType: "x proximity" }}>
      <style>{`.alm-shelf::-webkit-scrollbar{display:none}`}</style>
      {items.map((it) => (
        <button key={it.id} onClick={() => onOpen(it)} className="fw-ce-press" style={{ scrollSnapAlign: "start", flex: "0 0 clamp(220px, 78vw, 300px)", textAlign: "left", cursor: "pointer", background: `linear-gradient(165deg, ${AA.paperHi} 0%, ${cwOf(accent).petal}0f 100%)`, border: `1px solid ${AA.line}`, borderTop: `3px solid ${cwOf(accent).petal}`, borderRadius: 16, padding: "15px 15px 14px", boxShadow: "0 4px 18px rgba(58,44,26,.07), 0 1px 3px rgba(58,44,26,.05)", display: "flex", flexDirection: "column", minHeight: 172 }}>
          <div style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: at, marginBottom: 6 }}>{it.kicker}</div>
          <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: AA.ink, lineHeight: 1.18, margin: "0 0 6px" }}>{it.hook}</div>
          <div style={{ fontFamily: SERIF, fontSize: 14.5, color: AA.inkSoft, lineHeight: 1.45, flex: 1 }}>{it.line}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, fontFamily: UI, fontSize: 13, fontWeight: 800, color: at }}>{it.act} <ChevronRight size={15} /></div>
        </button>
      ))}
      <span style={{ flex: "0 0 6px" }} aria-hidden />
    </div>
  );
}

// See-all overlay — the full grid of a shelf (the labelled door leads somewhere real).
function SeeAllOverlay({ shelf, onClose, onOpen }) {
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

function RoomReader({ room, onClose }) {
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
        <div style={{ marginTop: 16 }}><ActionButton bg={room.accent} onClick={onClose}>Enter {room.label}</ActionButton></div>
      </div>
    </div>
  );
}

// ── the header controller (content-type chips — jump to a section; keeps the live feature) ─────
const HERO = [
  { key: "read", label: "Read", Icon: BookOpen, cw: "plum" },
  { key: "watch", label: "Listen", Icon: Headphones, cw: "sage" },
  { key: "books", label: "Books", Icon: Library, cw: "gold" },
  { key: "story", label: "Story & sky", Icon: Feather, cw: "crimson" },
  { key: "good", label: "Good life", Icon: Clock, cw: "gold" },
  { key: "yours", label: "Yours", Icon: Bookmark, cw: "plum" },
];

export default function LifestyleAlmanacDemo() {
  const [heroI, setHeroI] = useState(0);
  const [open, setOpen] = useState(null);     // reader item
  const [seeAll, setSeeAll] = useState(null); // shelf grid overlay
  const [room, setRoom] = useState(null);     // room reader
  const refs = useRef({});
  const active = HERO[heroI];
  const aCol = cwOf(active.cw).petal;
  const lede = SHELVES[0].items[0]; // today's chapter
  const forYou = [SHELVES[3].items[0], SHELVES[1].items[0], SHELVES[0].items[1], SHELVES[4].items[1]]; // curated across domains
  const jump = (key) => { const el = refs.current[key]; if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div style={{ minHeight: "100vh", overflowX: "clip", ...PAPER_BG }}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "14px 18px calc(90px + env(safe-area-inset-bottom))" }}>
        {/* tiny demo ribbon (not chrome) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <a href="/Ideas" style={{ display: "inline-flex", alignItems: "center", gap: 5, minHeight: 36, padding: "6px 12px 6px 9px", border: `1px solid ${AA.paperDeep}`, borderRadius: 999, background: AA.paperHi, color: AA.ink, textDecoration: "none", fontFamily: UI, fontSize: 13, fontWeight: 700 }}>‹ Ideas</a>
          <span style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: AA.label }}>Lifestyle redesign · The Almanac</span>
        </div>

        {/* ══ BAND 0 · HEADER (RETAINED — the real FwFloraHero, untouched) ══ */}
        <FwFloraHero title="Your Lifestyle" colorway={active.cw} bloom="cosmos" openness={1} creature="butterfly" flankL="iris" flankR="sunflower" titleColor={OX} line="A little of everything — read a little, feel a little, whenever the moment's yours." garden="lifestyle" photo="lifestyle" />

        {/* controller chips — now a jump-to-section switcher (keeps the feature, gives it a job) */}
        <div className="alm-ctl" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 2px 2px", scrollbarWidth: "none", WebkitMaskImage: "linear-gradient(90deg,#000 0,#000 calc(100% - 22px),transparent 100%)", maskImage: "linear-gradient(90deg,#000 0,#000 calc(100% - 22px),transparent 100%)" }}>
          <style>{`.alm-ctl::-webkit-scrollbar{display:none}`}</style>
          {HERO.map((c, i) => { const on = i === heroI; const col = cwOf(c.cw).petal; return (
            <button key={c.key} onClick={() => { setHeroI(i); jump(c.key); }} aria-pressed={on} className="fw-elite-press" style={{ flex: "0 0 74px", minHeight: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 14, cursor: "pointer", background: on ? `linear-gradient(160deg, ${AA.paperHi} 0%, ${col}20 100%)` : AA.paperHi, border: `1px solid ${on ? col : AA.line}`, boxShadow: on ? `0 0 0 1px ${col}, 0 2px 8px ${col}30` : "0 1px 3px rgba(58,44,26,0.07)", transform: on ? "translateY(-1px)" : "none", transition: "all .15s" }}>
              <span style={{ width: 27, height: 27, borderRadius: 8, background: `${col}1f`, display: "grid", placeItems: "center" }}><c.Icon size={15} color={accentText(c.cw)} /></span>
              <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 700, color: on ? accentText(c.cw) : AA.muted }}>{c.label}</span>
            </button>
          ); })}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "12px 0 14px" }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: cwOf("sage").petal }} />
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: AA.inkSoft }}>Follicular · Day 10 · a building week</span>
        </div>

        {/* ══ BAND 1 · THE LEDE — one big editorial pick ══ */}
        <button onClick={() => setOpen(lede)} className="fw-ce-press" style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", padding: 0, border: `1px solid ${AA.line}`, borderRadius: 20, overflow: "hidden", background: AA.paperHi, boxShadow: "0 8px 30px rgba(58,44,26,.12), 0 2px 6px rgba(58,44,26,.06)" }}>
          <FloraCover title="Small Mends" category="Fiction" colorway="crimson" seed="alm-lede" height={188} roundTop showTitle={false} idx="alm-lede" />
          <div style={{ padding: "16px 17px 17px" }}>
            <div style={{ fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: AA.crimson, marginBottom: 6 }}>Today's chapter · new this morning</div>
            <div style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 600, color: AA.ink, lineHeight: 1.14, margin: "0 0 8px", letterSpacing: -0.4 }}>Small Mends — The Envelope</div>
            <div style={{ fontFamily: SERIF, fontSize: 16.5, color: AA.inkSoft, lineHeight: 1.5, marginBottom: 15 }}>The envelope had sat on Hilary's desk since Wednesday, propped against the tin. She had not opened it — which Alison thought, afterwards, was the most honest thing about it.</div>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", boxSizing: "border-box", background: AA.crimsonBig, color: "#fff", borderRadius: 12, fontFamily: UI, fontSize: 15, fontWeight: 700 }}><Feather size={17} /> Read today's chapter</span>
          </div>
        </button>

        {/* ══ BAND 2 · FOR YOU TODAY — short capped strip + See all ══ */}
        <div style={{ marginTop: 34 }}>
          <SectionHead title="For you today" sub="Gathered for your follicular week" accent="gold" Icon={Sparkles} count={9} onSeeAll={() => setSeeAll({ title: "For you today", cw: "gold", items: SHELVES.flatMap((s) => s.items).slice(0, 9) })} />
          <Shelf items={forYou} accent="gold" onOpen={setOpen} />
        </div>

        {/* ══ BAND 3 · YOUR ROOMS — the 11 domains as a bento (findability fix) ══ */}
        <div style={{ marginTop: 34 }}>
          <SectionHead title="Your rooms" sub="Eleven corners of your life — tap to step in" accent="crimson" Icon={Grid2x2} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {ROOMS.map((r, i) => {
              const feature = i === 0; // one featured tile spans both columns
              return (
                <button key={r.key} onClick={() => setRoom(r)} className="fw-ce-press" style={{ gridColumn: feature ? "1 / -1" : "auto", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: feature ? "16px 16px" : "13px 13px", minHeight: feature ? 84 : 96, flexDirection: feature ? "row" : "column", justifyContent: "flex-start", alignItems: feature ? "center" : "flex-start", background: `linear-gradient(160deg, ${AA.paperHi} 0%, ${r.accent}10 100%)`, border: `1px solid ${AA.line}`, borderLeft: `4px solid ${r.accent}`, borderRadius: 14 }}>
                  <span style={{ width: feature ? 44 : 36, height: feature ? 44 : 36, borderRadius: 11, background: `${r.accent}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><r.Icon size={feature ? 22 : 19} color={r.accent} /></span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: SERIF, fontSize: feature ? 21 : 18, fontWeight: 600, color: AA.ink, lineHeight: 1.1 }}>{r.label}</span>
                    <span style={{ display: "block", fontFamily: UI, fontSize: 12, color: AA.muted, lineHeight: 1.3, marginTop: 2 }}>{feature ? r.sub + " · " + r.fresh : r.fresh}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ BAND 4 · THE CONTENT — named, capped, See-all shelves ══ */}
        {SHELVES.map((s) => (
          <section key={s.key} ref={(el) => (refs.current[s.key] = el)} style={{ marginTop: 36, scrollMarginTop: 12 }}>
            <SectionHead title={s.title} sub={s.sub} accent={s.cw} Icon={s.Icon} count={s.items.length} onSeeAll={() => setSeeAll(s)} />
            <Shelf items={s.items} accent={s.cw} onOpen={setOpen} />
          </section>
        ))}

        {/* ══ BAND 5 · HANDY (slim) + CLOSING ══ */}
        <div style={{ marginTop: 38 }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, fontWeight: 600, color: OX, margin: "0 0 10px" }}>Handy right now</div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {[["Today's chapter", Feather, "crimson", () => setOpen(lede)], ["Your sky tonight", Moon, "gold", () => setOpen(SHELVES[3].items[1])], ["Your saved", Bookmark, "plum", () => jump("yours")], ["Jump to…", Compass, "sage", () => jump("read")]].map(([label, Ic, cw, on]) => (
              <button key={label} onClick={on} className="fw-elite-press" style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 44, padding: "10px 14px", background: AA.paperHi, border: `1px solid ${AA.line}`, borderLeft: `3px solid ${cwOf(cw).petal}`, borderRadius: 12, fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: AA.ink, cursor: "pointer" }}><Ic size={15} color={accentText(cw)} /> {label}</button>
            ))}
          </div>
        </div>
        <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: AA.muted, margin: "34px auto 0", maxWidth: 340, lineHeight: 1.55 }}>Everything's here — read a little, feel a little — and nothing's owed. A whole life, one calm page.</p>
      </div>

      {open && <ItemReader item={open} onClose={() => setOpen(null)} />}
      {seeAll && <SeeAllOverlay shelf={seeAll} onClose={() => setSeeAll(null)} onOpen={(it) => { setSeeAll(null); setOpen(it); }} />}
      {room && <RoomReader room={room} onClose={() => setRoom(null)} />}
    </div>
  );
}

// Lifestyle · FINDABLE (all doors) — redesign demo #2 (2026-08-09).
// THESIS: "every life-domain is a visible, labelled door — nothing hidden sideways." The horizontal
// board-carousel (thin peek, easily missed) is replaced by a persistent labelled GRID of all the
// whole-life rooms — icon + word + one-line "what's inside" — so nothing is off-screen and everything
// has scent. You pick a room, then see its content. The page is a HUB, not a feed. Recognition over
// recall. Baseline audit fixes via the shared kit. Seeded/self-contained; live /Lifestyle untouched.
import React, { useState, useEffect } from "react";
import { Shirt, Dumbbell, Users, Compass, PartyPopper, Home, Moon, Sprout, Palette, Trees, Coins, ChevronLeft, X } from "lucide-react";
import { AA, SERIF, UI, PAGE, Tap, Eyebrow, ActionButton, DemoNav, ThesisNote } from "@/components/lifestyle-demos/kit";

// The 11 whole-life ROOMS the live app buries in a horizontal carousel — here, every one a visible
// labelled door with scent (what's inside). Each opens its room.
const DOORS = [
  { key: "mirror", label: "Mirror", sub: "Fashion & meeting yourself", Icon: Shirt, accent: AA.crimson,
    body: ["Style, beauty and how you meet yourself in the mirror — for the joy of it, never a flaw to fix.", "Inside: what to wear to how you FEEL, a skin read for your week, and gentle 'get-ready-with-me' company."] },
  { key: "move", label: "Move", sub: "Movement for your mood", Icon: Dumbbell, accent: AA.sage,
    body: ["Movement for strength, energy and mood — for the pleasure of a body that can, never to shrink it.", "Inside: pick a feeling and it meets you there; five-minute snacks; gentle-is-training-too."] },
  { key: "kindred", label: "Kindred", sub: "Friendship & belonging", Icon: Users, accent: AA.crimson,
    body: ["Friendship, family, love and belonging — held as equals. However you're connected today, you belong here.", "Inside: what your heart's asking for, reads on the friendships nobody warns you about, and the rooms."] },
  { key: "curious", label: "Curious", sub: "Learn for the joy of it", Icon: Compass, accent: AA.label,
    body: ["Learning for the sheer aliveness of it — no test, no deadline, no reason it has to be useful.", "Inside: follow a curiosity, fall down a rabbit hole, learn while your hands are busy."] },
  { key: "delight", label: "Delight", sub: "Fun, gossip & play", Icon: PartyPopper, accent: AA.crimson,
    body: ["Joy, fun and play — for absolutely no reason at all. You don't have to earn or get anything out of it.", "Inside: what do you fancy, something to watch, a good laugh, a bit of gossip, fancy a game?"] },
  { key: "nest", label: "Nest", sub: "A soft place to land", Icon: Home, accent: AA.sage,
    body: ["Home as a soft place to land — cosy for your own comfort, never to be presentable. No budget, no Pinterest.", "Inside: small cosy rituals, a cosy home, something on the stove, a soft place for people."] },
  { key: "tonight", label: "Tonight", sub: "The evening wind-down", Icon: Moon, accent: AA.label,
    body: ["A soft landing at the end of the day. Rest for its own sake — no routine to nail, no sleep to score.", "Inside: tonight's wind-down, tonight's chapter, the night sky, something calm to end on."] },
  { key: "becoming", label: "Becoming", sub: "Growth, gently", Icon: Sprout, accent: AA.sage,
    body: ["Growth as unfolding, not repair — becoming more yourself, never rejecting yourself. No fixing, no 'best version'.", "Inside: an honest question, where you're becoming, being kind to yourself, holding your ground."] },
  { key: "make", label: "Make", sub: "Create for the pleasure", Icon: Palette, accent: AA.sage,
    body: ["Making things for the pleasure of it — badly, pointlessly, unfinished, unseen. The doing is the whole reward.", "Inside: a few tiny invitations to make a thing today, and permission to be no good at it."] },
  { key: "outside", label: "Outside", sub: "A breath of air", Icon: Trees, accent: AA.sage,
    body: ["A bit of green, a breath of air — nature as it actually is for you. A window, a street tree, a park bench.", "Inside: get outside today, into the green, no garden? nature's still yours, outside with others."] },
  { key: "money", label: "Money", sub: "Money, gently", Icon: Coins, accent: AA.label,
    body: ["A calm, kind corner for the most emotional subject there is. No shame, no lectures, no sums you'll dread.", "Inside: a gentle money thing today, a gentle money intention, a read worth your time."] },
];

function RoomReader({ door, onClose }) {
  useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const acc = door.accent;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: AA.paper, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, background: AA.paper, borderBottom: `1px solid ${AA.line}` }}>
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Tap onClick={onClose} label="Back to the rooms" style={{ gap: 5, padding: "8px 12px 8px 8px", border: `1px solid ${AA.paperDeep}`, borderRadius: 999, background: AA.paperHi, color: AA.ink, fontFamily: UI, fontSize: 14, fontWeight: 700 }}><ChevronLeft size={17} /> All rooms</Tap>
          <Tap onClick={onClose} label="Close" style={{ padding: "8px 10px", background: "transparent", border: "none", color: AA.muted }}><X size={18} /></Tap>
        </div>
      </div>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "18px 18px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: `${acc}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><door.Icon size={22} color={acc} /></span>
          <div><Eyebrow color={acc}>The {door.label} room</Eyebrow><h1 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: AA.ink, lineHeight: 1.15, margin: "1px 0 0" }}>{door.sub}</h1></div>
        </div>
        {door.body.map((p, i) => <p key={i} style={{ fontFamily: SERIF, fontSize: 18, color: AA.inkSoft, lineHeight: 1.6, margin: "0 0 14px" }}>{p}</p>)}
        <div style={{ marginTop: 18 }}><ActionButton bg={acc === AA.crimson ? AA.crimsonBig : acc} onClick={onClose}>Enter {door.label}</ActionButton></div>
      </div>
    </div>
  );
}

export default function LifestyleFindableDemo() {
  const [open, setOpen] = useState(null);
  return (
    <div style={PAGE}>
      <DemoNav title="Findable · all doors" />
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "20px 18px calc(80px + env(safe-area-inset-bottom))" }}>
        <ThesisNote>Every life-room is a visible, labelled door with scent — no thin-peek carousel to miss. The page is a hub, not a feed: you see all the rooms at once (recognition, not recall), pick one, and its content opens. Nothing is hidden sideways.</ThesisNote>

        <Eyebrow>Your whole life, one tap each</Eyebrow>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 600, color: AA.crimsonBig, lineHeight: 1.12, margin: "3px 0 4px" }}>Where do you want to go?</h1>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: AA.muted, lineHeight: 1.5, margin: "0 0 18px" }}>Eleven rooms, all in the open — pick the one that fits your day.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {DOORS.map((d) => (
            <Tap key={d.key} onClick={() => setOpen(d)} style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", gap: 7, padding: "14px 13px", minHeight: 108, background: AA.paperHi, border: `1px solid ${AA.line}`, borderLeft: `4px solid ${d.accent}`, borderRadius: 13, cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box" }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: `${d.accent}1f`, display: "grid", placeItems: "center" }}><d.Icon size={19} color={d.accent} /></span>
              <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: AA.ink, lineHeight: 1.1 }}>{d.label}</span>
              <span style={{ fontFamily: UI, fontSize: 12, color: AA.muted, lineHeight: 1.3 }}>{d.sub}</span>
            </Tap>
          ))}
        </div>

        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: AA.muted, textAlign: "center", lineHeight: 1.55, margin: "26px 0 0" }}>Every door in plain sight, named — nothing to swipe for, nothing to miss.</p>
      </div>
      {open && <RoomReader door={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

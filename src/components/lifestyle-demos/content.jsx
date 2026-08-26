// Shared SEEDED CONTENT + ItemReader for the Lifestyle redesign demos (#1 Calm, #2 Findable,
// #4 Guided all reuse this; #3 Editorial keeps its own inline copy — verified, left untouched).
// One curated pick per life-domain, so each demo can show the whole-life breadth from ONE source
// and differ only in STRUCTURE. Every item carries a real hook + a fuller reader body.
import React, { useEffect } from "react";
import { BookOpen, Play, Headphones, Feather, Sparkles, Moon, Coins, MessagesSquare, Library, Dumbbell, X } from "lucide-react";
import { AA, SERIF, UI, Tap, Eyebrow, ActionButton } from "./kit";

// intent = the human bucket a Guided demo groups by (read / watch / listen / move / connect / treat).
export const DEMO_ITEMS = [
  { id: "chapter", domain: "Read", intent: "read", Icon: Feather, kicker: "Today's chapter", act: "Read", accent: AA.crimsonBig,
    hook: "Small Mends — Chapter 14: The Envelope",
    line: "The envelope had been on Hilary's desk since Wednesday, propped against the tin. She had not opened it.",
    body: ["The envelope had been on Hilary's desk since the Wednesday, propped against the tin where the fire-door keys live. She had not opened it. She had not put it in a drawer either, which Alison thought afterwards was the most honest thing about it.",
      "Ivan Prewitt came at two. Forty-odd, in a coat bought for a different job, carrying a clipboard the way a man carries an umbrella he does not believe in.",
      "They got twenty people into a back office with room for nine. Bernie stood in the doorway; Margo sat on the filing cabinet and did not apologise for it."] },
  { id: "watch", domain: "Watch", intent: "watch", Icon: Play, kicker: "Something to watch", act: "Watch", accent: AA.sage,
    hook: "A ten-minute morning flow — nothing to achieve",
    line: "Gentle mobility for a slow start. Move to feel better, not to earn anything.",
    body: ["A slow, kind mobility sequence — the kind that meets a menstrual-week body where it is. No counting, no burn, no before-and-after. Ten minutes, on the floor, in whatever you slept in.",
      "It plays in place, one tap, on the card face — you never leave the page."] },
  { id: "listen", domain: "Listen", intent: "listen", Icon: Headphones, kicker: "A listen for the kettle", act: "Listen", accent: AA.label,
    hook: "The Cycle-Synced Work Week — 45 min",
    line: "Mel Giedroyc and AJ Odudu on working with your body, not against it.",
    body: ["A warm, funny conversation about pacing a working week to your energy instead of fighting it — the follicular sprint, the luteal wind-down, and why 'push through' is often the worst advice.",
      "It keeps playing while you wander the rest of the app — the player stays with you."] },
  { id: "move", domain: "Move", intent: "move", Icon: Dumbbell, kicker: "A movement snack", act: "Try", accent: AA.sage,
    hook: "One song — put it on and dance the whole thing",
    line: "Five minutes counts, really counts. A complete workout for your mood.",
    body: ["The science: even ≤5-minute bouts genuinely lift mood and fitness (2022 Nature Medicine). So this is the whole prescription — one song, danced start to finish, in the kitchen, badly.",
      "Not to your body — to your head. A walk, a stretch, a dance shifts a mood faster than a to-do list."] },
  { id: "season", domain: "Read", intent: "read", Icon: BookOpen, kicker: "For your season", act: "Read", accent: AA.crimsonBig,
    hook: "Iron, magnesium and dark chocolate — eat these on your period",
    line: "The steady, un-preachy version: what actually helps a bleeding week feel kinder.",
    body: ["Not a rule, not a cleanse — a short, evidence-steady note on the foods that genuinely help during menstruation: iron to replace what you lose, magnesium for the cramping, and yes, a square of dark chocolate that earns its place.",
      "Warmth over willpower. A little is plenty."] },
  { id: "make", domain: "Make", intent: "treat", Icon: Sparkles, kicker: "A five-minute make", act: "Open", accent: AA.sage,
    hook: "Make something badly, on purpose",
    line: "A biro and the back of an envelope is more than enough kit. The wonk is the whole charm.",
    body: ["Making for the pleasure of it — badly, pointlessly, unfinished, unseen. The doing is the whole reward. Draw in the margin of whatever's nearest; it doesn't have to become anything.",
      "Leisure is the point — this lands softly in your day, and nothing nags you if it doesn't."] },
  { id: "money", domain: "Money", intent: "treat", Icon: Coins, kicker: "Money, gently", act: "Read", accent: AA.label,
    hook: "Open the banking app, look, and close it. No action needed.",
    line: "A calm, kind corner for the most emotional subject there is. No shame, no sums you'll dread.",
    body: ["One small, low-stakes money thing today — every single one is optional, and 'not today' is a perfectly good answer. Today's: just look, without flinching, and close it again.",
      "You are not behind, not bad with money, not a failure at this."] },
  { id: "sky", domain: "Sky", intent: "treat", Icon: Moon, kicker: "The night sky", act: "Read", accent: AA.crimsonBig,
    hook: "Waxing crescent, 39% lit tonight",
    line: "Held lightly, just for the comfort of it — as you move through this follicular phase.",
    body: ["The moon is a waxing crescent, 39% lit. As it grows, the folklore leans toward beginnings and gentle ambition — a night to nurture an idea rather than finish one.",
      "No fate here, no horoscope that scores you. Just the sky, and a moment to match your pace to it."] },
  { id: "rooms", domain: "Rooms", intent: "connect", Icon: MessagesSquare, kicker: "From the rooms", act: "Open", accent: AA.sage,
    hook: "4 women in your season left a line like yours this week",
    line: "You're tending the same weather. No names, no contact — just company.",
    body: ["Someone anonymous, in the same phase, wrote something this week that rhymes with where you are. Not advice, not a thread you have to answer — just the quiet proof that you're not the only garden with this going on.",
      "Anonymous, 18+, kind by design. Open the rooms when you fancy the company."] },
  { id: "shelf", domain: "Shelf", intent: "read", Icon: Library, kicker: "On your shelf", act: "Read", accent: AA.label,
    hook: "Little Women — pick up where you left off",
    line: "A chapter a day, spoiler-safe, no streaks. Reading is allowed to be slow.",
    body: ["Your place is saved. A free classic, a chapter at a time, at exactly your pace — lurking and skipping and re-reading all allowed.",
      "No 'you're behind', no streak to break. Just the book, when you want it."] },
];

// The intents a Guided demo leads with (human goals, not app taxonomy).
export const INTENTS = [
  { key: "read", label: "Read something", sub: "a chapter, a guide, your shelf", Icon: BookOpen, accent: AA.crimsonBig },
  { key: "watch", label: "Watch something", sub: "short, gentle, in place", Icon: Play, accent: AA.sage },
  { key: "listen", label: "Have a listen", sub: "for the kettle or the commute", Icon: Headphones, accent: AA.label },
  { key: "move", label: "Move a little", sub: "five minutes, for your mood", Icon: Dumbbell, accent: AA.sage },
  { key: "connect", label: "Feel less alone", sub: "the rooms, anonymously", Icon: MessagesSquare, accent: AA.crimsonBig },
  { key: "treat", label: "Treat myself", sub: "make · money · the sky", Icon: Sparkles, accent: AA.label },
];

// The 11 whole-life ROOMS (the domains the live app buries in a 17-chip scroller) — for the bento
// overview. Each carries a live-feeling "fresh today" line + a short room body.
import { Shirt, Users, PartyPopper, Home, Sprout, Palette, Trees, Compass } from "lucide-react";
export const ROOMS = [
  { key: "mirror", label: "Mirror", sub: "Fashion & meeting yourself", fresh: "What to wear to how you feel", Icon: Shirt, accent: AA.crimson,
    body: ["Style, beauty and how you meet yourself in the mirror — for the joy of it, never a flaw to fix.", "Inside: dress for how you FEEL today, a skin read for your week, gentle get-ready company."] },
  { key: "move", label: "Move", sub: "Movement for your mood", fresh: "A five-minute dance snack", Icon: Dumbbell, accent: AA.sage,
    body: ["Movement for strength, energy and mood — never to shrink. A body that can, met where it is.", "Inside: pick a feeling and it meets you there; five-minute snacks; gentle-is-training-too."] },
  { key: "kindred", label: "Kindred", sub: "Friendship & belonging", fresh: "The friendships nobody warns you about", Icon: Users, accent: AA.crimson,
    body: ["Friendship, family, love and belonging — held as equals. However you're connected today, you belong.", "Inside: what your heart's asking for, honest reads on friendship, and the rooms."] },
  { key: "curious", label: "Curious", sub: "Learn for the joy of it", fresh: "Fall down a rabbit hole", Icon: Compass, accent: AA.label,
    body: ["Learning for the sheer aliveness of it — no test, no deadline, no reason it has to be useful.", "Inside: follow a curiosity, a rabbit hole, learn while your hands are busy."] },
  { key: "delight", label: "Delight", sub: "Fun, gossip & play", fresh: "Something silly to watch", Icon: PartyPopper, accent: AA.crimson,
    body: ["Joy, fun and play — for no reason at all. You don't have to earn or get anything out of it.", "Inside: what do you fancy, something to watch, a good laugh, a bit of gossip, a game."] },
  { key: "nest", label: "Nest", sub: "A soft place to land", fresh: "Something on the stove", Icon: Home, accent: AA.sage,
    body: ["Home as a soft place to land — cosy for your comfort, never to be presentable. No budget, no Pinterest.", "Inside: small cosy rituals, a cosy home, something on the stove, a soft place for people."] },
  { key: "tonight", label: "Tonight", sub: "The evening wind-down", fresh: "Tonight's chapter + your sky", Icon: Moon, accent: AA.label,
    body: ["A soft landing at the end of the day. Rest for its own sake — nothing to nail, no sleep to score.", "Inside: tonight's wind-down, tonight's chapter, the night sky, something calm to end on."] },
  { key: "becoming", label: "Becoming", sub: "Growth, gently", fresh: "An honest question for today", Icon: Sprout, accent: AA.sage,
    body: ["Growth as unfolding, not repair — becoming more yourself, never rejecting yourself. No 'best version'.", "Inside: an honest question, where you're becoming, being kind to yourself, holding your ground."] },
  { key: "make", label: "Make", sub: "Create for the pleasure", fresh: "Make something badly, on purpose", Icon: Palette, accent: AA.sage,
    body: ["Making for the pleasure of it — badly, pointlessly, unfinished, unseen. The doing is the whole reward.", "Inside: tiny invitations to make a thing today, and permission to be no good at it."] },
  { key: "outside", label: "Outside", sub: "A breath of air", fresh: "Notice the sky once today", Icon: Trees, accent: AA.sage,
    body: ["A bit of green, a breath of air — nature as it actually is for you. A window, a street tree, a bench.", "Inside: get outside today, into the green, no-garden nature, outside with others."] },
  { key: "money", label: "Money", sub: "Money, gently", fresh: "Open the app, look, close it", Icon: Coins, accent: AA.label,
    body: ["A calm, kind corner for the most emotional subject there is. No shame, no lectures, no dread.", "Inside: a gentle money thing today, a gentle money intention, a read worth your time."] },
];

// Shared in-place reader (audit fixes: AA contrast, ≥44px labelled Close).
export function ItemReader({ item, onClose }) {
  useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  if (!item) return null;
  const accentText = item.accent === AA.crimsonBig ? AA.crimson : item.accent;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: AA.paper, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, background: AA.paper, borderBottom: `1px solid ${AA.line}` }}>
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Eyebrow color={accentText}>{item.kicker}</Eyebrow>
          <Tap onClick={onClose} label="Close" style={{ gap: 5, padding: "8px 12px", border: `1px solid ${AA.paperDeep}`, borderRadius: 999, background: AA.paperHi, color: AA.ink, fontFamily: UI, fontSize: 14, fontWeight: 700 }}><X size={16} /> Close</Tap>
        </div>
      </div>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "18px 18px 60px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 600, color: AA.ink, lineHeight: 1.2, margin: "4px 0 16px" }}>{item.hook}</h1>
        {item.body.map((p, i) => <p key={i} style={{ fontFamily: SERIF, fontSize: 18, color: AA.inkSoft, lineHeight: 1.62, margin: "0 0 15px" }}>{p}</p>)}
        <div style={{ marginTop: 20 }}><ActionButton bg={item.accent} onClick={onClose}>Done</ActionButton></div>
      </div>
    </div>
  );
}

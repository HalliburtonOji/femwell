// Lifestyle · EDITORIAL (single column) — redesign demo #3 (2026-08-09).
// THESIS: "a magazine you scroll, not a dashboard you operate." ONE vertical column, ZERO horizontal
// sliders, ZERO controller-chips — the day's whole-life picks flow top-to-bottom, curated (fewer,
// better). Density is controlled by curation, not by hiding content sideways. Baseline audit fixes
// baked in via the shared kit (AA contrast, ≥44px targets, labelled nav, no dev-pill occlusion).
// Seeded + self-contained; does NOT touch the live /Lifestyle. Reversible (delete the route entry).
import React, { useState, useEffect } from "react";
import { BookOpen, Play, Headphones, Feather, Sparkles, Moon, Coins, MessagesSquare, Library, X } from "lucide-react";
import { AA, SERIF, UI, PAGE, Tap, Eyebrow, ActionButton, DemoNav, ThesisNote } from "@/components/lifestyle-demos/kit";

// The curated issue — one representative pick per life-domain, so the ONE column shows the whole-life
// breadth without 11 boards or 12 sliders. Each item carries a real hook + a fuller "read" body.
const ISSUE = [
  { id: "chapter", Icon: Feather, kicker: "Today's chapter", act: "Read", accent: AA.crimsonBig,
    hook: "Small Mends — Chapter 14: The Envelope",
    line: "The envelope had been on Hilary's desk since Wednesday, propped against the tin. She had not opened it.",
    body: ["The envelope had been on Hilary's desk since the Wednesday, propped against the tin where the fire-door keys live. She had not opened it. She had not put it in a drawer either, which Alison thought afterwards was the most honest thing about it.",
      "Ivan Prewitt came at two. Forty-odd, in a coat bought for a different job, carrying a clipboard the way a man carries an umbrella he does not believe in.",
      "They got twenty people into a back office with room for nine. Bernie stood in the doorway; Margo sat on the filing cabinet and did not apologise for it."] },
  { id: "watch", Icon: Play, kicker: "Something to watch", act: "Watch", accent: AA.sage,
    hook: "A ten-minute morning flow — nothing to achieve",
    line: "Gentle mobility for a slow start. Move to feel better, not to earn anything.",
    body: ["A slow, kind mobility sequence — the kind that meets a menstrual-week body where it is. No counting, no burn, no before-and-after. Ten minutes, on the floor, in whatever you slept in.",
      "It plays in place, one tap, on the card face — you never leave the page. (In this demo it's a still; live, the video is inline.)"] },
  { id: "listen", Icon: Headphones, kicker: "A listen for the kettle", act: "Listen", accent: AA.label,
    hook: "The Cycle-Synced Work Week — 45 min",
    line: "Mel Giedroyc and AJ Odudu on working with your body, not against it.",
    body: ["A warm, funny conversation about pacing a working week to your energy instead of fighting it — the follicular sprint, the luteal wind-down, and why 'push through' is often the worst advice.",
      "It keeps playing while you wander the rest of the app — the player stays with you."] },
  { id: "season", Icon: BookOpen, kicker: "For your season", act: "Read", accent: AA.crimsonBig,
    hook: "Iron, magnesium and dark chocolate — eat these on your period",
    line: "The steady, un-preachy version: what actually helps a bleeding week feel kinder.",
    body: ["Not a rule, not a cleanse — a short, evidence-steady note on the foods that genuinely help during menstruation: iron to replace what you lose, magnesium for the cramping, and yes, a square of dark chocolate that earns its place.",
      "Warmth over willpower. A little is plenty."] },
  { id: "make", Icon: Sparkles, kicker: "A five-minute make", act: "Open", accent: AA.sage,
    hook: "Make something badly, on purpose",
    line: "A biro and the back of an envelope is more than enough kit. The wonk is the whole charm.",
    body: ["Making for the pleasure of it — badly, pointlessly, unfinished, unseen. The doing is the whole reward. Draw in the margin of whatever's nearest; it doesn't have to become anything.",
      "Leisure is the point — this lands softly in your day, and nothing nags you if it doesn't."] },
  { id: "money", Icon: Coins, kicker: "Money, gently", act: "Read", accent: AA.label,
    hook: "Open the banking app, look, and close it. No action needed.",
    line: "A calm, kind corner for the most emotional subject there is. No shame, no sums you'll dread.",
    body: ["One small, low-stakes money thing today — every single one is optional, and 'not today' is a perfectly good answer. Today's: just look, without flinching, and close it again.",
      "You are not behind, not bad with money, not a failure at this."] },
  { id: "sky", Icon: Moon, kicker: "The night sky", act: "Read", accent: AA.crimsonBig,
    hook: "Waxing crescent, 39% lit tonight",
    line: "Held lightly, just for the comfort of it — as you move through this follicular phase.",
    body: ["The moon is a waxing crescent, 39% lit. As it grows, the folklore leans toward beginnings and gentle ambition — a night to nurture an idea rather than finish one.",
      "No fate here, no horoscope that scores you. Just the sky, and a moment to match your pace to it."] },
  { id: "rooms", Icon: MessagesSquare, kicker: "From the rooms", act: "Open", accent: AA.sage,
    hook: "4 women in your season left a line like yours this week",
    line: "You're tending the same weather. No names, no contact — just company.",
    body: ["Someone anonymous, in the same phase, wrote something this week that rhymes with where you are. Not advice, not a thread you have to answer — just the quiet proof that you're not the only garden with this going on.",
      "Anonymous, 18+, kind by design. Open the rooms when you fancy the company."] },
  { id: "shelf", Icon: Library, kicker: "On your shelf", act: "Read", accent: AA.label,
    hook: "Little Women — pick up where you left off",
    line: "A chapter a day, spoiler-safe, no streaks. Reading is allowed to be slow.",
    body: ["Your place is saved. A free classic, a chapter at a time, at exactly your pace — lurking and skipping and re-reading all allowed.",
      "No 'you're behind', no streak to break. Just the book, when you want it."] },
];

function Reader({ item, onClose }) {
  useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: AA.paper, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, background: AA.paper, borderBottom: `1px solid ${AA.line}` }}>
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Eyebrow color={item.accent === AA.crimsonBig ? AA.crimson : item.accent}>{item.kicker}</Eyebrow>
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

export default function LifestyleEditorialDemo() {
  const [open, setOpen] = useState(null);
  const now = new Date();
  const dateLine = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div style={PAGE}>
      <DemoNav title="Editorial · single column" />
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "20px 18px calc(80px + env(safe-area-inset-bottom))" }}>
        <ThesisNote>One vertical column. No horizontal sliders, no controller-chips. The whole-life breadth (chapter · watch · listen · season · make · money · sky · rooms · shelf) flows top-to-bottom, curated — you scroll a magazine, you don't operate a dashboard.</ThesisNote>

        {/* masthead */}
        <Eyebrow>{dateLine}</Eyebrow>
        <h1 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: AA.crimsonBig, lineHeight: 1.12, margin: "4px 0 6px" }}>Your life, today</h1>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: AA.muted, lineHeight: 1.5, margin: "0 0 8px" }}>A little of everything — read a little, feel a little, whenever the moment's yours.</p>

        {ISSUE.map((it, i) => (
          <article key={it.id} style={{ borderTop: `1px solid ${AA.line}`, padding: "24px 0 4px", marginTop: i === 0 ? 20 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: `${it.accent}1f`, display: "grid", placeItems: "center", flexShrink: 0 }}><it.Icon size={16} color={it.accent === AA.crimsonBig ? AA.crimson : it.accent} /></span>
              <Eyebrow color={it.accent === AA.crimsonBig ? AA.crimson : it.accent} style={{ marginBottom: 0 }}>{it.kicker}</Eyebrow>
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 600, color: AA.ink, lineHeight: 1.2, margin: "0 0 7px" }}>{it.hook}</h2>
            <p style={{ fontFamily: SERIF, fontSize: 16.5, color: AA.inkSoft, lineHeight: 1.55, margin: "0 0 15px" }}>{it.line}</p>
            <ActionButton bg={it.accent} onClick={() => setOpen(it)}>
              <it.Icon size={17} /> {it.act}
            </ActionButton>
          </article>
        ))}

        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15.5, color: AA.muted, textAlign: "center", lineHeight: 1.55, margin: "34px 0 0" }}>That's the issue. Nothing owed, nothing hidden sideways — just your life, in one calm column.</p>
      </div>
      {open && <Reader item={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

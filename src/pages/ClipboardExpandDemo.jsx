// ─────────────────────────────────────────────────────────────────────────────
// ClipboardExpandDemo.jsx — "browse cards → tap → a big rich detail card" (Breeze-
// inspired), adapted to the FemWell brand for CONTENT (not people). A ClipboardSlider
// carousel of FloraCover content cards (edge-peek + pager dots) → tap → the shared
// full-screen ExpandDetailCard. The card language lives in brand/expandCards.jsx and is
// shared with /StackedExpandDemo so the swipe-through + tap-to-open feel identical.
// Content only — people/connection must run through the DM safety rails (see the doc).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { T, SERIF, UI, PAPER_BG, Heart } from "@/components/journal/Editorial";
import { OXBLOOD } from "@/components/brand/SliderKit";
import { ClipboardSlider } from "@/components/brand/ClipboardSlider";
import { floraKeyframes } from "@/components/brand/flora";
import { CoverCard, ExpandDetailCard, SCRIPT } from "@/components/brand/expandCards";
import { ChevronLeft } from "lucide-react";

const CONTENT = [
  { id: "essay-leave-early", kind: "Read · Essay", Icon: "BookOpen", category: "essay slow read", cw: "cream",
    title: "The quiet power of leaving early", subtitle: "On protecting your evenings without apology.",
    meta: [["BookOpen", "8 min read"], ["Feather", "The FemWell desk"]], chips: ["boundaries", "slow living", "self-worth"],
    body: ["There is a particular freedom in being the first to leave — coat on while the room is still warm, the night still yours to spend as you like.",
      "It isn't rudeness; it's a kind of self-trust. You know what tomorrow-you needs, and you're willing to give it to her tonight."],
    actions: [{ label: "Read this", Icon: "BookOpen", primary: true }] },
  { id: "sleep-lighthouse", kind: "Listen · Sleep story", Icon: "Moon", category: "story sleep rest", cw: "plum",
    title: "The lighthouse keeper's good night", subtitle: "A ten-minute story to drift off to.",
    meta: [["Headphones", "10 min"], ["Moon", "Bedtime"]], chips: ["sleep", "calm", "wind-down"], player: true, duration: 600,
    body: ["Far out where the sea goes quiet, a keeper trims the last lamp and lets the dark do its slow, kind work.",
      "Let the words blur. You don't have to reach the end — the story keeps your place."],
    actions: [{ label: "Play the story", Icon: "Play", primary: true }] },
  { id: "reset-breath", kind: "Session · Guided", Icon: "HeartPulse", category: "calm mind breathe meditation", cw: "sky",
    title: "A five-minute reset for a racing mind", subtitle: "Follow the breath; let the day settle.",
    meta: [["Clock", "5 min"], ["HeartPulse", "Anytime"]], chips: ["anxiety", "reset", "breathe"], player: true, duration: 300,
    body: ["No app-face, no counting streaks. Just five minutes of following one breath, and then the next.",
      "If your mind wanders — and it will — that noticing is the practice, not a failure."],
    actions: [{ label: "Begin", Icon: "Play", primary: true }] },
  { id: "book-hamnet", kind: "Book club · This month", Icon: "Book", category: "book read fiction", cw: "gold",
    title: "This month we're reading: Hamnet", subtitle: "Grief, motherhood, and a marriage — Maggie O'Farrell.",
    meta: [["Book", "Chapter 1 open"], ["Users", "A room reading along"]], chips: ["book club", "fiction", "together"],
    body: ["A boy falls ill in a house in Warwickshire, and a mother reads the plague in his skin before anyone will say the word.",
      "We read a chapter a week, and talk about it anonymously — no spoilers past where the room is."],
    actions: [{ label: "Open the reader", Icon: "Book", primary: true }] },
  { id: "recipe-butterbeans", kind: "Recipe · Tonight", Icon: "Flame", category: "recipe nourish cook", cw: "coral",
    title: "One-pan harissa butter beans", subtitle: "Fifteen minutes, one pan, deeply kind to a tired Tuesday.",
    meta: [["Clock", "15 min"], ["Flame", "One pan"]], chips: ["easy dinner", "iron-rich", "batch-friendly"],
    body: ["Soften an onion, spoon in harissa and a knob of butter, tip in two tins of butter beans and let them get jammy.",
      "Finish with lemon and whatever green is wilting in the drawer. Bread, obviously."],
    actions: [{ label: "Cook this", Icon: "Flame", primary: true }] },
  { id: "circle-slow-sunday", kind: "Circle · Content room", Icon: "Users", category: "community circle belong", cw: "blush",
    title: "The Sunday Slow Club", subtitle: "A gentle room for unhurried weekends — a prompt, a photo, a cup of something.",
    meta: [["MessageCircle", "This week's prompt"], ["Users", "Anonymous · safe"]], chips: ["community", "slow sunday", "cosy"],
    body: ["Not a chat to keep up with — a slow room you dip into. This week's prompt: the smallest thing that made your weekend feel like yours.",
      "Anonymous by default, screened for kindness. You're never on show."],
    actions: [{ label: "Peek inside", Icon: "MessageCircle", primary: true }], safe: true },
  { id: "discover-petrichor", kind: "Discover · Today", Icon: "Sparkles", category: "wonder nature garden", cw: "sage",
    title: "Today's small wonder: petrichor", subtitle: "That after-rain smell has a name — and a reason you love it.",
    meta: [["Sparkles", "1 min"], ["Leaf", "A little joy"]], chips: ["small joys", "did you know"],
    body: ["Petrichor: the earthy scent when rain meets dry ground. It's partly an oil plants release, partly a bacterium called geosmin your nose can catch at a few parts per trillion.",
      "Which is to say: you are, biologically, very good at loving the smell of rain."],
    actions: [{ label: "Read it", Icon: "Sparkles", primary: true }] },
];

export default function ClipboardExpandDemo() {
  const [openId, setOpenId] = useState(null);
  const item = CONTENT.find((x) => x.id === openId);
  useEffect(() => { document.body.style.overflow = openId ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [openId]);

  return (
    <div style={{ ...PAPER_BG, minHeight: "100vh", paddingBottom: 60 }}>
      <style>{floraKeyframes}{`.fw-ce-press{transition:transform .12s ease}.fw-ce-press:active{transform:scale(0.98)}`}</style>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "16px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/Ideas" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: T.muted, textDecoration: "none" }}><ChevronLeft size={15} /> Ideas</a>
        <span style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: T.gold }}>Founder demo · Card interaction</span>
      </div>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "8px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Heart size={15} />
          <span style={{ fontFamily: SCRIPT, fontSize: 40, color: OXBLOOD, lineHeight: 1 }}>Discover</span>
        </div>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16.5, color: T.muted, lineHeight: 1.5, margin: "6px 0 4px", maxWidth: 340 }}>
          Slide the cards, tap one — it opens into a whole page. A browse-then-dive pattern for FemWell content: reads, listens, sessions, books, recipes, rooms.
        </p>
      </div>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "4px 14px 0" }}>
        <ClipboardSlider hint="Slide to browse" accent={T.gold}>
          {CONTENT.map((it) => (
            <CoverCard key={it.id} item={it} onOpen={() => setOpenId(it.id)} />
          ))}
        </ClipboardSlider>
      </div>

      <p style={{ textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: T.muted, margin: "18px auto 0", maxWidth: 300, lineHeight: 1.5 }}>
        Content only — for people &amp; connection, this same pattern runs through the DM safety rails.
      </p>

      {item && <ExpandDetailCard item={item} onClose={() => setOpenId(null)} />}
    </div>
  );
}

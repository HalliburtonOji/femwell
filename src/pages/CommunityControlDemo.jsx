// CommunityControlDemo — Control-Center concept, CORRECTED to Halli's spec.
//
// VERTICAL snap slider, ONE room per FULL-COVER card. A warm Jess header at top,
// then swipe UP through: Question of the Day · The Lounge · Echo Wall · The
// Lighter Side (games) · Library · Circles · Love · Money & Work · Style · Health
// Room · Talk It Out — each its own full-screen card holding that one room richly
// inline. FemWell editorial (cream/plum, Ephesis/Cormorant, Lucide). No grid, no
// Apple dark glass, no emoji, anonymous-first / 18+ / no scoreboards.
//
// Self-contained DEMO: useState only, mock data inline.
import {
  MessageCircleHeart, Radio, Sparkles, BookOpen, Users, Heart,
  Wallet, Shirt, Stethoscope, Mic, HelpCircle, ShieldCheck, ArrowRight,
} from "lucide-react";
import { T, SERIF, UI, Eyebrow, Script, Hand } from "@/components/journal/Editorial";
import ControlCenter, { Action, Inset } from "./controlCenterKit";

// ── mock data ────────────────────────────────────────────────────────────────
const JESS = {
  greeting: "Evening",
  presence: "Women in your season are here tonight",
  season: "Perimenopause circle",
  qotd: "What did you let yourself off the hook for this week?",
  invite: "Share as little or as much as you like — anonymous, always.",
};
const QOTD_ANSWERS = [
  "Cancelled the plans I'd been dreading. Slept instead. No regrets.",
  "Stopped pretending I wasn't tired. Asked for help with the school run.",
];
const ROOMS = [
  { id: "qotd", title: "Question of the Day", icon: HelpCircle, accent: T.gold, essence: "One gentle prompt, answered anonymously.", qotd: true },
  { id: "lounge", title: "The Lounge", icon: MessageCircleHeart, accent: T.crimson, essence: "Anonymous vent — say the unsayable.", ambient: "A few quiet conversations open",
    samples: ["Just need somewhere to put this down for a minute.", "Anyone else's brain at 2am? Solidarity."] },
  { id: "echo", title: "Echo Wall", icon: Radio, accent: T.gold, essence: "One line. It fades by morning.", ambient: "Someone left a line a moment ago",
    samples: ["Proud of myself for a small thing today.", "It's heavy, but I'm still here."] },
  { id: "lighter", title: "The Lighter Side", icon: Sparkles, accent: T.sage, essence: "Games, horoscope, a softer hour.", ambient: "Tonight's horoscope is up",
    samples: ["Daily word game · 4 of us playing", "Perimenopause bingo — gentle, funny, true"] },
  { id: "library", title: "Library · Book Club", icon: BookOpen, accent: T.gold, essence: "Reading together, slowly.", ambient: "This month's chapter is open",
    samples: ["June read · chapters 4–6", "A quiet thread on the ending"] },
  { id: "circles", title: "Circles & Clubs", icon: Users, accent: T.sage, essence: "Smaller rooms by what you love.", ambient: "A new circle is gathering",
    samples: ["Walking & wild swimming", "Carers who need a breather"] },
  { id: "love", title: "Love & Relationships", icon: Heart, accent: T.crimson, essence: "Partners, parents, the heart of it.", ambient: "A gentle thread is unfolding",
    samples: ["How do you ask for what you need?", "Reconnecting after a hard year"] },
  { id: "money", title: "Money & Work", icon: Wallet, accent: T.gold, essence: "Pay, bills, work — no judgement.", ambient: "Someone's asking the brave question",
    samples: ["Asking for the raise — pep talk?", "Budgeting when everything went up"] },
  { id: "style", title: "Style", icon: Shirt, accent: T.sage, essence: "Dressing the body you have today.", ambient: "A few fits shared this evening",
    samples: ["Comfort that still feels like me", "Layering for the hot-flush surprise"] },
  { id: "health", title: "The Health Room", icon: Stethoscope, accent: T.crimson, essence: "Peer support — shared, not prescribed.", ambient: "Women comparing notes kindly", safe: true,
    samples: ["What helped your sleep in peri?", "GP appointment — what to ask?"] },
  { id: "talk", title: "Talk It Out", icon: Mic, accent: T.gold, essence: "Voices, not typing. Press to speak.", ambient: "A warm voice room is open",
    samples: ["Evening wind-down room · 5 listening", "Press to speak — no video, ever"] },
];
const SAFE_LINE = "Peer support, not medical advice. If something feels urgent, we'll point you to NHS 111 or 999.";

// ── card bodies ─────────────────────────────────────────────────────────────
function QotdBody() {
  return (
    <>
      <Inset style={{ padding: 18 }}>
        <Eyebrow mb={8}>Tonight's question</Eyebrow>
        <div style={{ fontFamily: SERIF, fontSize: 21, fontStyle: "italic", color: T.ink, lineHeight: 1.3 }}>{JESS.qotd}</div>
      </Inset>
      <Eyebrow mb={4} mt={4}>A few quiet answers</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {QOTD_ANSWERS.map((a, i) => (
          <Inset key={i}>
            <div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.35 }}>“{a}”</div>
            <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, marginTop: 6 }}>Anonymous · held warmly</div>
          </Inset>
        ))}
      </div>
      <Action accent={T.gold}><ArrowRight size={15} /> Add your answer</Action>
    </>
  );
}

function RoomBody({ room }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: T.muted }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: room.accent, flex: "none" }} />
        {room.ambient}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 2 }}>
        {room.samples.map((s, i) => (
          <Inset key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <MessageCircleHeart size={15} color={room.accent} style={{ marginTop: 2, flex: "none" }} />
            <div style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.3 }}>{s}</div>
          </Inset>
        ))}
      </div>
      {room.safe && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 2 }}>
          <ShieldCheck size={13} color={T.sage} style={{ marginTop: 3, flex: "none" }} />
          <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, lineHeight: 1.4 }}>{SAFE_LINE}</span>
        </div>
      )}
      <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.3, marginTop: 2 }}>Anonymous-first · 18+ · no scoreboards</div>
      <Action accent={room.accent}><ArrowRight size={15} /> Enter {room.title}</Action>
    </>
  );
}

const CARDS = ROOMS.map((room) => ({
  id: room.id,
  title: room.title,
  essence: room.essence,
  icon: room.icon,
  accent: room.accent,
  render: room.qotd ? QotdBody : () => <RoomBody room={room} />,
}));

function Header() {
  return (
    <>
      <Eyebrow mb={10}>{JESS.greeting.toUpperCase()} · {JESS.season.toUpperCase()}</Eyebrow>
      <Script size={40} style={{ marginBottom: 14 }}>you're not alone here</Script>
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 16 }}>
        <Users size={15} color={T.sage} style={{ marginTop: 5, flex: "none" }} />
        <Hand size={17} color={T.inkSoft}>{JESS.presence}.</Hand>
      </div>
      <Inset style={{ marginBottom: 14 }}>
        <Eyebrow mb={6} color={T.gold}>Question of the day</Eyebrow>
        <div style={{ fontFamily: SERIF, fontSize: 17, fontStyle: "italic", color: T.ink, lineHeight: 1.3 }}>{JESS.qotd}</div>
      </Inset>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: "auto" }}>
        <ShieldCheck size={13} color={T.sage} style={{ marginTop: 3, flex: "none" }} />
        <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, lineHeight: 1.4 }}>{JESS.invite}</span>
      </div>
    </>
  );
}

export default function CommunityControlDemo() {
  return (
    <ControlCenter
      banner="Community · Control-Center concept — mock data"
      header={<Header />}
      cards={CARDS}
      footer={
        <div style={{ textAlign: "center", padding: "6px 20px 0", flex: "none" }}>
          <div style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted }}>
            Anonymous-first · 18+ · just women, here.
          </div>
        </div>
      }
    />
  );
}

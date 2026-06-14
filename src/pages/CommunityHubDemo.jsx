// CommunityHubDemo — the "rich summary HEADER + big horizontal SLIDING CARDS" design
// language applied to COMMUNITY (the page Halli actually wanted, alongside Journal;
// Nutrition is already live in this style so its demo is just reference). Rich header =
// season/circle + Jess welcome + Question of the Day + tonight's activity peek; big
// sliding cards for ALL Community surfaces (QOTD, Lounge, Echo, Lighter Side/games,
// Library, Circles, Love, Money, Style, Health Room, Talk It Out). Same kit as
// JournalHubDemo so they read as ONE system. Self-contained mock data. FemWell brand,
// anonymous-first, no emoji/scoreboards.
import {
  MessageCircleHeart, Radio, Sparkles, BookOpen, Users, Heart,
  Wallet, Shirt, Stethoscope, Mic, HelpCircle, ShieldCheck, ArrowRight,
} from "lucide-react";
import { T, SERIF, UI, Script, Hand } from "@/components/journal/Editorial";
import HubDemo, { Action, Inset, Eyebrow2 } from "./hubDemoKit";

const JESS = {
  greeting: "Evening",
  season: "Perimenopause circle",
  presence: "Women in your season are here tonight",
  qotd: "What did you let yourself off the hook for this week?",
  invite: "Share as little or as much as you like — anonymous, always.",
};
const QOTD_ANSWERS = [
  "Cancelled the plans I'd been dreading. Slept instead. No regrets.",
  "Stopped pretending I wasn't tired. Asked for help with the school run.",
];
const SAFE_LINE = "Peer support, not medical advice. If something feels urgent, we'll point you to NHS 111 or 999.";

const ROOMS = [
  { id: "lounge", title: "The Lounge", icon: MessageCircleHeart, accent: T.crimson, essence: "Anonymous vent — say the unsayable.", ambient: "A few quiet conversations open",
    samples: ["Just need somewhere to put this down for a minute.", "Anyone else's brain at 2am? Solidarity."] },
  { id: "echo", title: "Echo Wall", icon: Radio, accent: T.gold, essence: "One line. It fades by morning.", ambient: "Someone left a line a moment ago",
    samples: ["Proud of myself for a small thing today.", "It's heavy, but I'm still here."] },
  { id: "lighter", title: "The Lighter Side", icon: Sparkles, accent: T.sage, essence: "Games, horoscope, a softer hour.", ambient: "Tonight's horoscope is up",
    samples: ["Daily word game · a few of us playing", "Perimenopause bingo — gentle, funny, true"] },
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
    samples: ["Evening wind-down room · a few listening", "Press to speak — no video, ever"] },
];

// big CIRCULAR centerpiece — a ring of women (the circle) around a blooming flower (the
// circle's life). Community's visual anchor, the analogue of Nutrition's energy ring.
function CommunityRing({ size = 176 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 12;
  const N = 9, dotCol = [T.sage, T.blush, T.gold, T.crimson];
  const dots = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), col: dotCol[i % dotCol.length] };
  });
  const petals = [0, 60, 120, 180, 240, 300];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: "none" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.paperDeep} strokeWidth={4} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={5.5} fill={d.col} stroke={T.paper} strokeWidth={1.5} />
      ))}
      {/* the bloom at the centre */}
      <g transform={`translate(${cx} ${cy})`}>
        {petals.map((deg) => (
          <ellipse key={deg} cx={0} cy={-16} rx={7.5} ry={17} fill={T.blush} stroke={T.sage} strokeWidth={1.2} transform={`rotate(${deg})`} opacity={0.9} />
        ))}
        <circle r={7} fill={T.gold} stroke={T.paper} strokeWidth={1.5} />
      </g>
    </svg>
  );
}

function QotdBody() {
  return (<>
    <Inset style={{ padding: 16 }}><Eyebrow2 color={T.gold}>Tonight's question</Eyebrow2>
      <div style={{ fontFamily: SERIF, fontSize: 20, fontStyle: "italic", color: T.ink, lineHeight: 1.3 }}>{JESS.qotd}</div></Inset>
    <Eyebrow2>A few quiet answers</Eyebrow2>
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {QOTD_ANSWERS.map((a, i) => <Inset key={i}><div style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.35 }}>“{a}”</div>
        <div style={{ fontFamily: UI, fontSize: 9.5, color: T.muted, marginTop: 6 }}>Anonymous · held warmly</div></Inset>)}
    </div>
    <Action accent={T.gold}><ArrowRight size={15} /> Add your answer</Action>
  </>);
}

function makeRoomBody(room) {
  return function RoomBody() {
    return (<>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: T.muted }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: room.accent, flex: "none" }} />{room.ambient}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 2 }}>
        {room.samples.map((s, i) => <Inset key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <MessageCircleHeart size={15} color={room.accent} style={{ marginTop: 2, flex: "none" }} />
          <div style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.3 }}>{s}</div></Inset>)}
      </div>
      {room.safe && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 2 }}>
          <ShieldCheck size={13} color={T.sage} style={{ marginTop: 3, flex: "none" }} />
          <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, lineHeight: 1.4 }}>{SAFE_LINE}</span>
        </div>
      )}
      <div style={{ fontFamily: UI, fontSize: 10, color: T.muted, letterSpacing: 0.3, marginTop: 2 }}>Anonymous-first · 18+ · no scoreboards</div>
      <Action accent={room.accent}><ArrowRight size={15} /> Enter {room.title}</Action>
    </>);
  };
}

const CARDS = [
  { id: "qotd", title: "Question of the Day", essence: "One gentle prompt, answered anonymously.", icon: HelpCircle, accent: T.gold, render: QotdBody },
  ...ROOMS.map((r) => ({ id: r.id, title: r.title, essence: r.essence, icon: r.icon, accent: r.accent, render: makeRoomBody(r) })),
];

function Header() {
  return (<>
    <div style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: 1.6, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>
      {JESS.greeting.toUpperCase()} · {JESS.season.toUpperCase()}
    </div>
    <Script size={40} carve>you're not alone here</Script>

    {/* CENTREPIECE — the circle-of-women + bloom ring (Community's anchor, like the
        energy ring), with the presence line beneath. Centered, full visual weight. */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "14px 0 16px" }}>
      <CommunityRing size={176} />
      <div style={{ fontFamily: UI, fontSize: 8.5, letterSpacing: 0.6, color: T.muted, textTransform: "uppercase", marginTop: 8 }}>your circle · tonight</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
        <Users size={14} color={T.sage} style={{ flex: "none" }} />
        <Hand size={16} color={T.inkSoft} style={{ textAlign: "center" }}>{JESS.presence}.</Hand>
      </div>
    </div>

    {/* Jess welcome (dusk — mirrors Nutrition's Jess card) */}
    <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "14px 15px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ width: 22, height: 22, borderRadius: 999, background: T.sage, display: "grid", placeItems: "center" }}><Heart size={12} color={T.dusk} /></span>
        <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess</span>
      </div>
      <Hand size={16} color={T.paper}>However tonight finds you, there's a room here that fits. Quietly, anonymously, at your pace.</Hand>
    </div>

    {/* Question of the Day (prominent — mirrors Nutrition's suggested card) */}
    <Inset style={{ marginBottom: 12 }}>
      <Eyebrow2 color={T.gold}>Question of the day</Eyebrow2>
      <div style={{ fontFamily: SERIF, fontSize: 17, fontStyle: "italic", color: T.ink, lineHeight: 1.3 }}>{JESS.qotd}</div>
    </Inset>

    {/* tonight's activity peek */}
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <ShieldCheck size={13} color={T.sage} style={{ marginTop: 3, flex: "none" }} />
      <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, lineHeight: 1.4 }}>{JESS.invite}</span>
    </div>
  </>);
}

export default function CommunityHubDemo() {
  return (
    <HubDemo
      banner="Community · Hub-style demo — mock data"
      header={<Header />}
      cards={CARDS}
      footer={<div style={{ textAlign: "center" }}><div style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted }}>Anonymous-first · 18+ · just women, here.</div></div>}
    />
  );
}

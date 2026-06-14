// JournalControlDemo — Control-Center concept, CORRECTED to Halli's spec.
//
// VERTICAL snap slider, ONE feature per FULL-COVER card. A summary header at top,
// then swipe UP through: Write · Echo Wall · Witness · Phase Twin · Insights ·
// On This Day — each its own full-screen card holding that one surface richly
// inline. FemWell editorial (cream/plum, Ephesis/Cormorant, Lucide). No grid, no
// Apple dark glass, no emoji.
//
// Self-contained DEMO: useState only, mock data inline.
import {
  PenLine, Megaphone, HeartHandshake, Users, Sparkles, CalendarHeart,
  Feather, MessageSquareText, Clock, ArrowRight,
} from "lucide-react";
import { T, SERIF, UI, Eyebrow, Script, Hand } from "@/components/journal/Editorial";
import ControlCenter, { Action, Tag, Inset } from "./controlCenterKit";

// ── mock "today" state ───────────────────────────────────────────────────────
const ME = { phase: "Luteal", day: 22, entriesWeek: 4, lastEntry: "2 days ago" };
const JESS_PROMPT = "The luteal pull turns you inward — let the page hold what you'd rather not say aloud.";
const BLOSSOM = "What's been quietly growing in you this week?";
const MODES = ["Write", "Guided", "One-line", "Voice", "Burn"];

const ECHOES = [
  { line: "Tired in a way sleep doesn't fix. Naming it helps.", held: 12, phase: "Luteal" },
  { line: "Said no to something today and the sky didn't fall.", held: 21, phase: "Follicular" },
  { line: "Some days the win is just a glass of water and a deep breath.", held: 9, phase: "Luteal" },
];
const WITNESS_LINE = { line: "I keep apologising for taking up space. I'm trying to stop.", phase: "Ovulatory", waited: "8 min" };
const TWIN = { line: "The quiet before my bleed always feels like this — heavy, then clear.", when: "an hour ago" };
const PATTERNS = [
  { title: "Tenderness peaks pre-bleed", detail: "Your softest entries cluster in the days before your period." },
  { title: "Mornings carry the weight", detail: "You write longest before 9am — the page holds the early hours." },
  { title: "Gratitude follows rest", detail: "Calmer days in your log tend to follow a good night's sleep." },
];
const ONTHISDAY = { date: "June 14, 2025", excerpt: "I didn't think I'd make it through that week — and here I am, a year on, writing in the morning light with the window open." };

// ── per-feature card bodies ─────────────────────────────────────────────────
function WriteBody() {
  return (
    <>
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
        <Feather size={15} color={T.crimson} style={{ marginTop: 4, flex: "none" }} />
        <Hand size={16} color={T.inkSoft}>{JESS_PROMPT}</Hand>
      </div>
      <Inset style={{ marginTop: 2 }}>
        <Eyebrow mb={6}>Today's blossom</Eyebrow>
        <div style={{ fontFamily: SERIF, fontSize: 18, fontStyle: "italic", color: T.ink, lineHeight: 1.3 }}>{BLOSSOM}</div>
        <div style={{ marginTop: 12, height: 1, background: T.paperDeep }} />
        <div style={{ marginTop: 10, fontFamily: SERIF, fontSize: 14, color: T.paperDeep, fontStyle: "italic" }}>start writing here…</div>
      </Inset>
      <Eyebrow mb={6} mt={4}>How would you like to write?</Eyebrow>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {MODES.map((m) => (
          <span key={m} style={{ fontFamily: UI, fontSize: 11, fontWeight: 600, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "6px 13px" }}>{m}</span>
        ))}
      </div>
      <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 4 }}>Last entry · {ME.lastEntry}</div>
      <Action accent={T.crimson}><PenLine size={15} /> Compose entry</Action>
    </>
  );
}

function EchoBody() {
  return (
    <>
      <Hand size={14} color={T.muted} style={{ paddingLeft: 2 }}>Share one line into the quiet of others — anonymous, gone by morning.</Hand>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {ECHOES.map((e, i) => (
          <Inset key={i}>
            <div style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, fontStyle: "italic", lineHeight: 1.3 }}>“{e.line}”</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <Tag accent={T.gold}>{e.phase}</Tag>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI, fontSize: 10.5, color: T.muted }}>
                <HeartHandshake size={13} color={T.crimson} /> {e.held} held
              </span>
            </div>
          </Inset>
        ))}
      </div>
      <Action accent={T.gold}><Megaphone size={15} /> Share a line</Action>
    </>
  );
}

function WitnessBody() {
  return (
    <>
      <Hand size={14} color={T.muted} style={{ paddingLeft: 2 }}>Hold space for one stranger's single line. No reply — just presence.</Hand>
      <Inset style={{ background: T.dusk, border: "none", padding: 18, marginTop: 4 }}>
        <Eyebrow mb={10} color={T.blush}>Someone in {WITNESS_LINE.phase.toLowerCase()} wrote</Eyebrow>
        <div style={{ fontFamily: SERIF, fontSize: 19, fontStyle: "italic", color: T.paper, lineHeight: 1.35 }}>“{WITNESS_LINE.line}”</div>
        <div style={{ fontFamily: UI, fontSize: 10, color: T.blush, marginTop: 12, letterSpacing: 0.4 }}>waiting {WITNESS_LINE.waited} to be held</div>
      </Inset>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted, marginTop: 2 }}>
        <Clock size={13} /> 3 more lines waiting tonight
      </div>
      <Action accent={T.sage}><HeartHandshake size={15} /> Hold this</Action>
    </>
  );
}

function TwinBody() {
  return (
    <>
      <Inset style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: 999, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: T.wax, border: `1px solid ${T.paperDeep}` }}>
          <Users size={20} color={T.gold} />
        </span>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>A woman in {ME.phase.toLowerCase()}, day {ME.day}</div>
          <div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 2 }}>Same tide as you · paired</div>
        </div>
      </Inset>
      <Eyebrow mb={4} mt={4}>She wrote {TWIN.when}</Eyebrow>
      <Inset>
        <div style={{ fontFamily: SERIF, fontSize: 16, fontStyle: "italic", color: T.ink, lineHeight: 1.35 }}>“{TWIN.line}”</div>
      </Inset>
      <Hand size={13.5} color={T.muted} style={{ paddingLeft: 2, marginTop: 2 }}>You move through the month together — never alone in a phase.</Hand>
      <Action accent={T.gold}><ArrowRight size={15} /> Write back</Action>
    </>
  );
}

function InsightsBody() {
  return (
    <>
      <Hand size={14} color={T.muted} style={{ paddingLeft: 2 }}>Gentle patterns Jess noticed across your pages — never a verdict.</Hand>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 4 }}>
        {PATTERNS.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <Sparkles size={15} color={T.crimson} style={{ marginTop: 3, flex: "none" }} />
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{p.title}</div>
              <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, lineHeight: 1.4, marginTop: 2 }}>{p.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function OnThisDayBody() {
  return (
    <>
      <Eyebrow mb={6}>{ONTHISDAY.date} · one entry</Eyebrow>
      <Inset style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: 20 }}>
        <Hand size={20} color={T.ink}>“{ONTHISDAY.excerpt}”</Hand>
      </Inset>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted, marginTop: 2 }}>
        <CalendarHeart size={13} /> A year ago today — look how far.
      </div>
      <Action accent={T.sage}><MessageSquareText size={15} /> Reflect on this</Action>
    </>
  );
}

// ── card set — ONE feature per full-cover card ──────────────────────────────
const CARDS = [
  { id: "write", title: "Write", script: true, essence: "Compose today's entry — unhurried, unjudged.", icon: PenLine, accent: T.crimson, render: WriteBody },
  { id: "echo", title: "Echo Wall", essence: "One line into the quiet of others.", icon: Megaphone, accent: T.gold, render: EchoBody },
  { id: "witness", title: "Witness", essence: "Hold a stranger's single line.", icon: HeartHandshake, accent: T.sage, render: WitnessBody },
  { id: "twin", title: "Phase Twin", essence: "Someone in the same tide as you.", icon: Users, accent: T.gold, render: TwinBody },
  { id: "insights", title: "Insights", essence: "Patterns Jess noticed in your pages.", icon: Sparkles, accent: T.crimson, render: InsightsBody },
  { id: "onthisday", title: "On This Day", essence: "What you wrote a year ago today.", icon: CalendarHeart, accent: T.sage, render: OnThisDayBody },
];

function Header() {
  return (
    <>
      <Eyebrow mb={10}>YOUR JOURNAL · {ME.phase.toUpperCase()} · DAY {ME.day}</Eyebrow>
      <Script size={42} style={{ marginBottom: 14 }}>the page is yours</Script>
      <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 16 }}>
        <Feather size={15} color={T.crimson} style={{ marginTop: 5, flex: "none" }} />
        <Hand size={17} color={T.inkSoft}>{JESS_PROMPT}</Hand>
      </div>
      <Inset style={{ marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{ME.entriesWeek} entries this week</span>
          <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted }}>last · {ME.lastEntry}</span>
        </div>
      </Inset>
    </>
  );
}

export default function JournalControlDemo() {
  return (
    <ControlCenter
      banner="Journal · Control-Center concept — mock data"
      header={<Header />}
      cards={CARDS}
      footer={
        <div style={{ textAlign: "center", padding: "6px 20px 0", flex: "none" }}>
          <div style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted }}>
            Locked to you. Always.
          </div>
        </div>
      }
    />
  );
}

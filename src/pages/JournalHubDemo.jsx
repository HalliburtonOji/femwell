// JournalHubDemo — the SAME "rich summary HEADER + big horizontal SLIDING CARDS" design
// language as NutritionHubDemo, applied to JOURNAL, so the two read as one design system.
// Header = today's reflection (streak-free) + a Jess line; cards = Write / Echo Wall /
// Witness / Phase Twin / Insights / On This Day, each a big card holding that surface.
// Self-contained demo, mock data inline. FemWell editorial.
import {
  PenLine, Megaphone, HeartHandshake, Users, Sparkles, CalendarHeart,
  Feather, MessageSquareText, Clock, ArrowRight,
} from "lucide-react";
import { T, SERIF, UI, Script, Hand } from "@/components/journal/Editorial";
import HubDemo, { Action, Inset, Tag, Eyebrow2 } from "./hubDemoKit";

const ME = { phase: "Luteal", day: 22, entriesWeek: 4, lastEntry: "2 days ago" };
const JESS_PROMPT = "The luteal pull turns you inward — let the page hold what you'd rather not say aloud.";
const BLOSSOM = "What's been quietly growing in you this week?";
const MODES = ["Write", "Guided", "One-line", "Voice", "Burn"];
const ECHOES = [
  { line: "Tired in a way sleep doesn't fix. Naming it helps.", held: 12, phase: "Luteal" },
  { line: "Said no to something today and the sky didn't fall.", held: 21, phase: "Follicular" },
];
const WITNESS = { line: "I keep apologising for taking up space. I'm trying to stop.", phase: "Ovulatory", waited: "8 min" };
const TWIN = { line: "The quiet before my bleed always feels like this — heavy, then clear.", when: "an hour ago" };
const PATTERNS = [
  { title: "Tenderness peaks pre-bleed", detail: "Your softest entries cluster in the days before your period." },
  { title: "Mornings carry the weight", detail: "You write longest before 9am — the page holds the early hours." },
];
const ONTHISDAY = { date: "June 14, 2025", excerpt: "I didn't think I'd make it through that week — and here I am, a year on, writing in the morning light with the window open." };

function WriteBody() {
  return (<>
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}><Feather size={14} color={T.crimson} style={{ marginTop: 3, flex: "none" }} /><Hand size={15} color={T.inkSoft}>{JESS_PROMPT}</Hand></div>
    <Inset><Eyebrow2>Today's blossom</Eyebrow2><div style={{ fontFamily: SERIF, fontSize: 17, fontStyle: "italic", color: T.ink, lineHeight: 1.3 }}>{BLOSSOM}</div>
      <div style={{ marginTop: 10, fontFamily: SERIF, fontSize: 13.5, color: T.paperDeep, fontStyle: "italic" }}>start writing here…</div></Inset>
    <Eyebrow2>How would you like to write?</Eyebrow2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{MODES.map((m) => <span key={m} style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 600, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 12px" }}>{m}</span>)}</div>
    <Action accent={T.crimson}><PenLine size={15} /> Compose entry</Action>
  </>);
}
function EchoBody() {
  return (<>
    <Hand size={13.5} color={T.muted}>Share one line into the quiet of others — anonymous, gone by morning.</Hand>
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {ECHOES.map((e, i) => <Inset key={i}><div style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.3 }}>“{e.line}”</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}><Tag accent={T.gold}>{e.phase}</Tag>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 10, color: T.muted }}><HeartHandshake size={12} color={T.crimson} /> {e.held} held</span></div></Inset>)}
    </div>
    <Action accent={T.gold}><Megaphone size={15} /> Share a line</Action>
  </>);
}
function WitnessBody() {
  return (<>
    <Hand size={13.5} color={T.muted}>Hold space for one stranger's single line. No reply — just presence.</Hand>
    <Inset style={{ background: T.dusk, border: "none", padding: 16 }}><Eyebrow2 color={T.blush}>Someone in {WITNESS.phase.toLowerCase()} wrote</Eyebrow2>
      <div style={{ fontFamily: SERIF, fontSize: 18, fontStyle: "italic", color: T.paper, lineHeight: 1.35 }}>“{WITNESS.line}”</div>
      <div style={{ fontFamily: UI, fontSize: 9.5, color: T.blush, marginTop: 10, letterSpacing: 0.4 }}>waiting {WITNESS.waited} to be held</div></Inset>
    <Action accent={T.sage}><HeartHandshake size={15} /> Hold this</Action>
  </>);
}
function TwinBody() {
  return (<>
    <Inset style={{ display: "flex", alignItems: "center", gap: 11 }}><span style={{ width: 42, height: 42, borderRadius: 999, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: T.wax, border: `1px solid ${T.paperDeep}` }}><Users size={19} color={T.gold} /></span>
      <div><div style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 600, color: T.ink }}>A woman in {ME.phase.toLowerCase()}, day {ME.day}</div><div style={{ fontFamily: UI, fontSize: 10, color: T.muted, marginTop: 2 }}>Same tide as you · paired</div></div></Inset>
    <Eyebrow2>She wrote {TWIN.when}</Eyebrow2>
    <Inset><div style={{ fontFamily: SERIF, fontSize: 15.5, fontStyle: "italic", color: T.ink, lineHeight: 1.35 }}>“{TWIN.line}”</div></Inset>
    <Action accent={T.gold}><ArrowRight size={15} /> Write back</Action>
  </>);
}
function InsightsBody() {
  return (<>
    <Hand size={13.5} color={T.muted}>Gentle patterns Jess noticed across your pages — never a verdict.</Hand>
    <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 2 }}>
      {PATTERNS.map((p, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><Sparkles size={14} color={T.crimson} style={{ marginTop: 3, flex: "none" }} />
        <div><div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: T.ink, lineHeight: 1.2 }}>{p.title}</div><div style={{ fontFamily: UI, fontSize: 11, color: T.muted, lineHeight: 1.4, marginTop: 2 }}>{p.detail}</div></div></div>)}
    </div>
  </>);
}
function OnThisDayBody() {
  return (<>
    <Eyebrow2>{ONTHISDAY.date} · one entry</Eyebrow2>
    <Inset style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: 18 }}><Hand size={19} color={T.ink}>“{ONTHISDAY.excerpt}”</Hand></Inset>
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: SERIF, fontSize: 12.5, fontStyle: "italic", color: T.muted, marginTop: 2 }}><CalendarHeart size={13} /> A year ago today — look how far.</div>
    <Action accent={T.sage}><MessageSquareText size={15} /> Reflect on this</Action>
  </>);
}

const CARDS = [
  { id: "write", title: "Write", script: true, essence: "Compose today's entry — unhurried, unjudged.", icon: PenLine, accent: T.crimson, render: WriteBody },
  { id: "echo", title: "Echo Wall", essence: "One line into the quiet of others.", icon: Megaphone, accent: T.gold, render: EchoBody },
  { id: "witness", title: "Witness", essence: "Hold a stranger's single line.", icon: HeartHandshake, accent: T.sage, render: WitnessBody },
  { id: "twin", title: "Phase Twin", essence: "Someone in the same tide as you.", icon: Users, accent: T.gold, render: TwinBody },
  { id: "insights", title: "Insights", essence: "Patterns Jess noticed in your pages.", icon: Sparkles, accent: T.crimson, render: InsightsBody },
  { id: "onthisday", title: "On This Day", essence: "What you wrote a year ago today.", icon: CalendarHeart, accent: T.sage, render: OnThisDayBody },
];

function Header() {
  return (<>
    <div style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: 1.6, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>
      YOUR JOURNAL · {ME.phase.toUpperCase()} · DAY {ME.day}
    </div>
    <Script size={40} carve>the page is yours</Script>
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", margin: "12px 0 14px" }}><Feather size={15} color={T.crimson} style={{ marginTop: 4, flex: "none" }} /><Hand size={16} color={T.inkSoft}>{JESS_PROMPT}</Hand></div>
    <Inset style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{ME.entriesWeek} entries this week</span>
      <span style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={12} /> last · {ME.lastEntry}</span>
    </Inset>
  </>);
}

export default function JournalHubDemo() {
  return (
    <HubDemo
      banner="Journal · Hub-style demo — mock data"
      header={<Header />}
      cards={CARDS}
      footer={<div style={{ textAlign: "center" }}><div style={{ fontFamily: SERIF, fontSize: 13, fontStyle: "italic", color: T.muted }}>Locked to you. Always.</div></div>}
    />
  );
}

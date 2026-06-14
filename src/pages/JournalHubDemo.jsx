// JournalHubDemo — the "rich summary HEADER + big horizontal SLIDING CARDS" design
// language applied to JOURNAL, matching the Nutrition page's header richness. The header
// is a real visual summary area (cycle phase + day · a mood sparkline + how-the-week-felt
// line · entries/last-entry/phase stat row · a Jess prompt card · an On-This-Day peek) —
// the Journal equivalent of Nutrition's energy ring + macro bars + Jess + suggested.
// Cards cover the FULL Journal feature set. Self-contained demo, mock data. FemWell brand.
import {
  PenLine, Megaphone, HeartHandshake, Users, Sparkles, CalendarHeart,
  Feather, MessageSquareText, Mail, MessagesSquare, Flame, Moon, ArrowRight,
} from "lucide-react";
import { T, SERIF, UI, Script, Hand } from "@/components/journal/Editorial";
import HubDemo, { Action, Inset, Tag, Eyebrow2 } from "./hubDemoKit";
import { JournalDiaryRing } from "@/components/hub/Centerpieces";

const ME = { phase: "Luteal", day: 22, entriesWeek: 4, lastEntry: "2 days ago" };
const MOOD_WEEK = [5, 6, 4, 7, 6, 8, 7];   // last 7 days, gentle (1–10), for the header sparkline
const JESS_PROMPT = "The luteal pull turns you inward — let the page hold what you'd rather not say aloud.";
const BLOSSOM = "What's been quietly growing in you this week?";
const MODES = ["Write", "Guided", "One-line", "Voice", "Burn"];
const ENTRY_TYPES = ["Free", "Gratitude", "Dream", "Affirmation", "Letter", "Worry", "Win"];
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
const SEALED = { count: 2, next: "one opens this autumn", triggers: ["A hard day", "A milestone", "To future me", "Before a decision"] };
const THREADS = [
  { title: "On rest", entries: 5 }, { title: "Letting go", entries: 3 }, { title: "My body & me", entries: 7 },
];
const CYCLE_MIRROR = [
  { when: "This time last cycle", line: "Restless, but I walked every morning — it helped." },
  { when: "Two cycles ago", line: "The same heaviness. It passed in three days." },
];

function Spark({ data, w = 230, h = 40, color = T.crimson }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - ((v - min) / (max - min || 1)) * (h - 8) - 4).toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w, y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
        return <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 3 : 1.6} fill={color} />;
      })}
    </svg>
  );
}
function StatMini({ label, value }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: T.ink, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: T.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── feature card bodies (ALL Journal surfaces) ───────────────────────────────
function WriteBody() {
  return (<>
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}><Feather size={14} color={T.crimson} style={{ marginTop: 3, flex: "none" }} /><Hand size={15} color={T.inkSoft}>{JESS_PROMPT}</Hand></div>
    <Inset><Eyebrow2>Today's blossom</Eyebrow2><div style={{ fontFamily: SERIF, fontSize: 17, fontStyle: "italic", color: T.ink, lineHeight: 1.3 }}>{BLOSSOM}</div>
      <div style={{ marginTop: 10, fontFamily: SERIF, fontSize: 13.5, color: T.paperDeep, fontStyle: "italic" }}>start writing here…</div></Inset>
    <Eyebrow2>How would you like to write?</Eyebrow2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{MODES.map((m) => <span key={m} style={{ fontFamily: UI, fontSize: 10.5, fontWeight: 600, color: T.inkSoft, background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 999, padding: "5px 12px" }}>{m}</span>)}</div>
    <Eyebrow2>Entry type</Eyebrow2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{ENTRY_TYPES.map((t) => <Tag key={t} accent={T.muted}>{t}</Tag>)}</div>
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
function SealedBody() {
  return (<>
    <Hand size={13.5} color={T.muted}>Letters to a future you — sealed with a key only this device holds, opened only when you choose.</Hand>
    <Inset style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <span style={{ width: 40, height: 40, borderRadius: 11, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: T.wax, border: `1px solid ${T.paperDeep}` }}><Mail size={18} color={T.gold} /></span>
      <div><div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, color: T.ink }}>{SEALED.count} sealed letters</div><div style={{ fontFamily: UI, fontSize: 10.5, color: T.muted, marginTop: 2 }}>{SEALED.next}</div></div>
    </Inset>
    <Eyebrow2>Seal one for…</Eyebrow2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{SEALED.triggers.map((t) => <Tag key={t} accent={T.gold}>{t}</Tag>)}</div>
    <Action accent={T.gold}><Mail size={15} /> Write a sealed letter</Action>
  </>);
}
function ThreadsBody() {
  return (<>
    <Hand size={13.5} color={T.muted}>Follow a feeling across many entries — threads gather what belongs together.</Hand>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {THREADS.map((t, i) => <Inset key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 9, minWidth: 0 }}><MessagesSquare size={15} color={T.sage} style={{ flex: "none" }} /><span style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, fontWeight: 600 }}>{t.title}</span></span>
        <span style={{ fontFamily: UI, fontSize: 10, color: T.muted, flexShrink: 0 }}>{t.entries} entries</span></Inset>)}
    </div>
    <Action accent={T.sage}><MessagesSquare size={15} /> Open a thread</Action>
  </>);
}
function CycleMirrorBody() {
  return (<>
    <Hand size={13.5} color={T.muted}>On this day in your cycle, here's what you wrote before — a gentle mirror, never a rule.</Hand>
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {CYCLE_MIRROR.map((c, i) => <Inset key={i}><Eyebrow2 color={T.gold}>{c.when}</Eyebrow2><div style={{ fontFamily: SERIF, fontSize: 14.5, fontStyle: "italic", color: T.inkSoft, lineHeight: 1.35 }}>“{c.line}”</div></Inset>)}
    </div>
  </>);
}
function BurnBody() {
  return (<>
    <Hand size={13.5} color={T.muted}>Write it down to let it go. Burn mode keeps nothing — the words turn to ash when you're done.</Hand>
    <Inset style={{ background: T.dusk, border: "none", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, padding: 22 }}>
      <Flame size={26} color={T.blush} />
      <div style={{ fontFamily: SERIF, fontSize: 16, fontStyle: "italic", color: T.paper, textAlign: "center", lineHeight: 1.35 }}>Some things only need to be said once — to no one, and then released.</div>
    </Inset>
    <Action accent={T.crimson}><Flame size={15} /> Write & release</Action>
  </>);
}

const CARDS = [
  { id: "write", title: "Write", script: true, essence: "Compose today's entry — unhurried, unjudged.", icon: PenLine, accent: T.crimson, render: WriteBody },
  { id: "echo", title: "Echo Wall", essence: "One line into the quiet of others.", icon: Megaphone, accent: T.gold, render: EchoBody },
  { id: "witness", title: "Witness", essence: "Hold a stranger's single line.", icon: HeartHandshake, accent: T.sage, render: WitnessBody },
  { id: "twin", title: "Phase Twin", essence: "Someone in the same tide as you.", icon: Users, accent: T.gold, render: TwinBody },
  { id: "insights", title: "Insights", essence: "Patterns Jess noticed in your pages.", icon: Sparkles, accent: T.crimson, render: InsightsBody },
  { id: "onthisday", title: "On This Day", essence: "What you wrote a year ago today.", icon: CalendarHeart, accent: T.sage, render: OnThisDayBody },
  { id: "sealed", title: "Sealed Letters", essence: "Notes to a future you, not yet opened.", icon: Mail, accent: T.gold, render: SealedBody },
  { id: "threads", title: "Threads", essence: "Follow a feeling across entries.", icon: MessagesSquare, accent: T.sage, render: ThreadsBody },
  { id: "mirror", title: "Cycle Mirror", essence: "What you wrote at this point before.", icon: Moon, accent: T.gold, render: CycleMirrorBody },
  { id: "burn", title: "Burn Mode", essence: "Write it, release it — nothing kept.", icon: Flame, accent: T.crimson, render: BurnBody },
];

// ── the RICH header — Journal's equivalent of Nutrition's plate summary ───────
function Header() {
  return (<>
    <div style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: 1.6, fontWeight: 700, textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>
      YOUR JOURNAL · {ME.phase.toUpperCase()} · DAY {ME.day}
    </div>
    <Script size={40} carve>the page is yours</Script>

    {/* CENTREPIECE — the big pen-on-diary ring (Journal's anchor, like the energy ring),
        with the week's mood beneath it. Centered, full visual weight. */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "14px 0 16px" }}>
      <JournalDiaryRing size={176} fraction={ME.entriesWeek / 7} />
      <div style={{ width: 150, marginTop: 8 }}><Spark data={MOOD_WEEK} h={30} /></div>
      <div style={{ fontFamily: UI, fontSize: 8.5, letterSpacing: 0.6, color: T.muted, textTransform: "uppercase", marginTop: 3 }}>mood · 7 days</div>
      <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: T.ink, marginTop: 10, textAlign: "center" }}>A tender, lifting week</div>
      <div style={{ fontFamily: UI, fontSize: 11.5, color: T.muted, marginTop: 3, textAlign: "center", lineHeight: 1.4 }}>heavier midweek, brighter by the weekend — gentle, not a grade.</div>
    </div>

    {/* stat row (mirrors the macro mini-bars): entries · last · phase */}
    <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
      <StatMini label="Entries this week" value={ME.entriesWeek} />
      <StatMini label="Last entry" value={ME.lastEntry} />
      <StatMini label="Phase" value={`${ME.phase} · ${ME.day}`} />
    </div>

    {/* Jess prompt card (dusk — mirrors Nutrition's Jess card) */}
    <div style={{ background: T.dusk, color: T.paper, borderRadius: 16, padding: "14px 15px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ width: 22, height: 22, borderRadius: 999, background: T.blush, display: "grid", placeItems: "center" }}><Feather size={12} color={T.dusk} /></span>
        <span style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: 1.4, color: T.wax, textTransform: "uppercase", fontWeight: 700 }}>Jess</span>
      </div>
      <Hand size={16} color={T.paper}>{JESS_PROMPT}</Hand>
    </div>

    {/* On This Day peek (mirrors the suggested-dinner peek) */}
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderRadius: 14, padding: "12px 14px" }}>
      <span style={{ width: 36, height: 36, borderRadius: 11, background: T.ink, color: T.paper, display: "grid", placeItems: "center", flexShrink: 0 }}><CalendarHeart size={16} /></span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: UI, fontSize: 9, letterSpacing: 1, color: T.muted, textTransform: "uppercase" }}>On this day · last year</div>
        <div style={{ fontFamily: SERIF, fontSize: 13.5, fontStyle: "italic", color: T.ink, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>“{ONTHISDAY.excerpt}”</div>
      </div>
    </div>
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

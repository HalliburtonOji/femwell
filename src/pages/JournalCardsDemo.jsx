// JournalCardsDemo — STANDALONE preview applying the approved card system to
// Journal (§6.7/§6.8). Prompts span life, not just symptoms. Live Journal untouched.
import { useNavigate } from "react-router-dom";
import { Feather, PenLine, BookMarked, Heart, Sparkles, Sun } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard, LogActionCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";

const PROMPTS = [
  { id: "p1", kind: "Gratitude", q: "What's one small thing that went right today?", accent: T.gold, flower: "sunflower" },
  { id: "p2", kind: "Love & dating", q: "When did you last feel truly seen — and by whom?", accent: T.crimson, flower: "poppy" },
  { id: "p3", kind: "Career", q: "What did you do this week that your younger self would be proud of?", accent: "#8E6E8E", flower: "violet" },
  { id: "p4", kind: "Just vent", q: "What do you need to get off your chest, no filter?", accent: "#8FAF8F", flower: "fern" },
];
const RECENT = [
  { id: "e1", title: "Tuesday, late", excerpt: "Booked the flights. Terrified and thrilled in exactly equal measure, which feels about right.", when: "2 days ago" },
  { id: "e2", title: "The good kind of tired", excerpt: "Finished the deck. Walked home the long way. Let myself be a bit proud.", when: "5 days ago" },
];
const COLLECTIONS = [
  { id: "c1", title: "Wins", count: 23, accent: T.gold, flower: "sunflower" },
  { id: "c2", title: "Letters to myself", count: 9, accent: T.crimson, flower: "poppy" },
  { id: "c3", title: "Dreams & maybes", count: 14, accent: "#8E6E8E", flower: "violet" },
];

export default function JournalCardsDemo() {
  const navigate = useNavigate();
  const go = (path) => navigate(createPageUrl(path));
  const recs = [
    { Icon: PenLine, label: "Today", text: "You haven't written yet — 2 quiet minutes?", onClick: () => go("Journal?compose=1") },
    { Icon: Sun, label: "Prompt", text: PROMPTS[0].q, onClick: () => go(`Journal?prompt=${PROMPTS[0].id}`) },
    { Icon: Sparkles, label: "Streak", text: "4 days in a row — gently kept", onClick: () => go("Journal?view=streak") },
  ];
  return (
    <CardDemoPage label="Demo · Journal · card system"
      hero={{ title: "Journal", bloom: "lily", colorway: "blush", flankL: "primrose", flankR: "violet", creature: "moth", line: "A private place to think out loud — about all of it, not just how you slept." }}>
      <DemoSummary><SummaryCard eyebrow="A moment for you" rows={recs} /></DemoSummary>

      <FwCardRow label="Quick write" Icon={PenLine} accent={T.crimson} items={[{ id: "w" }]}
        render={() => (
          <LogActionCard key="w" Icon={PenLine} eyebrow="Right now" flower="poppy" accent={T.crimson}
            title="Three lines is enough" line="No blank-page dread. Start with one sentence — you can always stop there.">
            <FwCardCTA accent={T.crimson} onClick={() => go("Journal?compose=1")} icon={Feather}>Start writing</FwCardCTA>
          </LogActionCard>
        )} />

      <FwCardRow label="Today's prompts" Icon={Sun} accent={T.gold} items={PROMPTS}
        render={(p) => (
          <FwCard key={p.id} accent={p.accent} Icon={Heart} eyebrow={p.kind} flower={p.flower} title={p.q}
            line="Tap to answer in your own words — or just let it sit with you today." idx={`pr-${p.id}`}
            action={<FwCardCTA accent={p.accent} onClick={() => go(`Journal?prompt=${p.id}`)}>Answer this</FwCardCTA>}
            onOpen={() => go(`Journal?prompt=${p.id}`)} openLabel="Open the prompt" />
        )} />

      <FwCardRow label="Recent entries" Icon={Feather} accent="#8E6E8E" items={RECENT}
        render={(e) => (
          <FwCard key={e.id} accent="#8E6E8E" Icon={Feather} eyebrow={e.when} flower="forget" title={e.title}
            line={e.excerpt} idx={`re-${e.id}`}
            action={<FwCardCTA accent="#8E6E8E" onClick={() => go(`Journal?entry=${e.id}`)}>Reread</FwCardCTA>}
            onOpen={() => go(`Journal?entry=${e.id}`)} openLabel="Open the entry" />
        )} />

      <FwCardRow label="Collections" Icon={BookMarked} accent={T.gold} items={COLLECTIONS}
        render={(c) => (
          <FwCard key={c.id} accent={c.accent} Icon={BookMarked} eyebrow="Collection" flower={c.flower} title={c.title}
            line={`${c.count} entries gathered here.`} idx={`co-${c.id}`}
            action={<FwCardCTA accent={c.accent} onClick={() => go(`Journal?collection=${c.id}`)}>Open</FwCardCTA>}
            onOpen={() => go(`Journal?collection=${c.id}`)} openLabel="Open the collection" />
        )} />
    </CardDemoPage>
  );
}

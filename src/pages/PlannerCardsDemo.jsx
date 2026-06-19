// PlannerCardsDemo — STANDALONE preview applying the approved card system to the
// CONTENT side of Planner (§6.7/§6.8): intentions, rituals, gentle focus — NOT a
// calendar grid or hour-by-hour day view (those stay as the live Planner owns them).
// Live Planner untouched.
import { useNavigate } from "react-router-dom";
import { ListChecks, Sparkles, Sun, Repeat, Bell, Feather } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard, LogActionCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";

const INTENTIONS = [
  { id: "i1", title: "Move my body, kindly", line: "A 20-minute walk, no step goal. Just air.", eyebrow: "Today", accent: "#8FAF8F", flower: "fern" },
  { id: "i2", title: "Text Mum back", line: "The small thing that's been on the list all week.", eyebrow: "Today", accent: T.crimson, flower: "poppy" },
  { id: "i3", title: "One slow coffee", line: "Sit down for it. No phone, no laptop.", eyebrow: "Today", accent: T.gold, flower: "sunflower" },
];
const RITUALS = [
  { id: "r1", title: "Sunday reset", line: "Tidy, plan loosely, light a candle. Your weekly soft landing.", cadence: "Weekly", accent: "#8E6E8E", flower: "violet" },
  { id: "r2", title: "Morning three lines", line: "A tiny journal before the day grabs you.", cadence: "Daily", accent: T.gold, flower: "primrose" },
];

export default function PlannerCardsDemo() {
  const navigate = useNavigate();
  const go = (path) => navigate(createPageUrl(path));
  const recs = [
    { Icon: ListChecks, label: "Today", text: "3 gentle intentions — none of them urgent", onClick: () => go("Planner") },
    { Icon: Sun, label: "Focus", text: "This week: protect your evenings", onClick: () => go("Planner?view=week") },
    { Icon: Repeat, label: "Ritual", text: "Sunday reset is coming up", onClick: () => go("Planner?ritual=r1") },
  ];
  return (
    <CardDemoPage label="Demo · Planner (content) · card system"
      hero={{ title: "Planner", bloom: "cosmos", colorway: "sage", flankL: "clover", flankR: "chamomile", creature: "butterfly", line: "Not a wall of appointments — a few kind intentions and the rituals that hold your week." }}>
      <DemoSummary><SummaryCard eyebrow="Today, lightly" rows={recs} /></DemoSummary>

      <FwCardRow label="Add an intention" Icon={Feather} accent={T.gold} items={[{ id: "add" }]}
        render={() => (
          <LogActionCard key="add" Icon={Feather} eyebrow="Right now" flower="sunflower" accent={T.gold}
            title="What matters today?" line="Add one small intention — a kindness, not a to-do. You can check it off in place.">
            <FwCardCTA accent={T.gold} onClick={() => go("Planner?add=1")} icon={Feather}>Add an intention</FwCardCTA>
          </LogActionCard>
        )} />

      <FwCardRow label="Today's intentions" Icon={ListChecks} accent="#8FAF8F" items={INTENTIONS}
        render={(it) => (
          <FwCard key={it.id} accent={it.accent} Icon={ListChecks} eyebrow={it.eyebrow} flower={it.flower} title={it.title}
            line={it.line} idx={`in-${it.id}`}
            action={<FwCardCTA accent={it.accent} onClick={() => go(`Planner?check=${it.id}`)}>Mark done</FwCardCTA>}
            onOpen={() => go(`Planner?item=${it.id}`)} openLabel="Open" />
        )} />

      <FwCardRow label="Your rituals" Icon={Repeat} accent="#8E6E8E" items={RITUALS}
        render={(r) => (
          <FwCard key={r.id} accent={r.accent} Icon={Repeat} eyebrow={r.cadence} flower={r.flower} title={r.title}
            line={r.line} idx={`ri-${r.id}`}
            action={<FwCardCTA accent={r.accent} onClick={() => go(`Planner?ritual=${r.id}`)}>Open ritual</FwCardCTA>}
            onOpen={() => go(`Planner?ritual=${r.id}`)} openLabel="Open the ritual" />
        )} />

      <FwCardRow label="Gentle reminders" Icon={Bell} accent={T.crimson} items={[{ id: "rem" }]}
        render={() => (
          <FwCard key="rem" accent={T.crimson} Icon={Sparkles} eyebrow="Coming up" flower="poppy"
            title="A soft nudge, not an alarm" line="Period likely in ~5 days · a friend's birthday Saturday · your Sunday reset. Tap to see the week."
            idx="rem" action={<FwCardCTA accent={T.crimson} onClick={() => go("Planner?view=week")}>See the week</FwCardCTA>}
            onOpen={() => go("Planner?view=week")} openLabel="Open the week" />
        )} />
    </CardDemoPage>
  );
}

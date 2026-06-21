// GrowthTodayDemo — the daily loop, baked into Today (added to the existing cards,
// nothing stripped). Intention · line of the day · today's tiny mission · the
// day-off nudge · Tier-0 resonance. Preview-only; live Today untouched.
import { Sun, Sprout, Heart, Users } from "lucide-react";
import { T } from "@/components/journal/Editorial";
import { FwCardRow, SummaryCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";
import { GrowthStyles, GrowthStack, IntentionCard, LineOfDayCard, TinyMissionCard, DayOffCard, ResonanceCard, BakeNote } from "@/components/demos/growthKit";

export default function GrowthTodayDemo() {
  const recs = [
    { Icon: Sprout, label: "Plant the day", text: "Set today's intention — a value, not a to-do", onClick: () => {} },
    { Icon: Sun, label: "The line of the day", text: "Your soulful, user-specific morning line", onClick: () => {} },
    { Icon: Heart, label: "Tiny mission", text: "One small, optional thing that grows your garden", onClick: () => {} },
  ];
  return (
    <CardDemoPage label="Demo · Today · the daily loop"
      hero={{ title: "Today", bloom: "poppy", colorway: "crimson", flankL: "snowdrop", flankR: "daffodil", creature: "butterfly",
        line: "Your day, growing — an intention to carry, a line just for you, and one small mission. All optional, all gentle." }}>
      <GrowthStyles />
      <DemoSummary><SummaryCard eyebrow="Your day, growing" rows={recs} /></DemoSummary>

      <GrowthStack>
        <IntentionCard />
        <LineOfDayCard />
        <TinyMissionCard />
      </GrowthStack>

      <FwCardRow label="A day for you" Icon={Sun} accent={T.gold} items={[{ id: "do" }]} render={() => <DayOffCard key="do" />} />
      <FwCardRow label="Someone like you" Icon={Users} accent="#8FAF8F" items={[{ id: "re" }]} render={() => <ResonanceCard key="re" />} />

      <BakeNote>On the live Today page these sit AMONG your existing cards (check-in, your garden, daily story, recommendations) — added, never removed. Writes ride existing dispatchers (HabitLogs / DailyCheckins); the line-of-day is a static front-end engine. No new function.</BakeNote>
    </CardDemoPage>
  );
}

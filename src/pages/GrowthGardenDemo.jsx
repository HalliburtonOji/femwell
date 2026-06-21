// GrowthGardenDemo — the LIVING VIEW (the flagship). Everything you tend shows as
// growth: intentions = seeds/sprouts, short goals bloom, long goals + bucket-list
// quests become trees, missions water it. Builds on the existing NurtureGarden;
// nothing stripped. Preview-only.
import { Flower2, TreePine, Heart, MapPin } from "lucide-react";
import { T } from "@/components/journal/Editorial";
import { FwCardRow, SummaryCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";
import { GrowthStyles, GrowthStack, StageLegend, GoalCard, BucketCard, TinyMissionCard, GOALS, BUCKET_LIST, BakeNote } from "@/components/demos/growthKit";

export default function GrowthGardenDemo() {
  const recs = [
    { Icon: Flower2, label: "What's growing", text: "Self-kindness, Rest and Connection are all taking root", onClick: () => {} },
    { Icon: TreePine, label: "Your orchard", text: "Long goals and bucket-list quests stand as trees", onClick: () => {} },
    { Icon: Heart, label: "Tend", text: "A tiny mission waters the whole garden", onClick: () => {} },
  ];
  return (
    <CardDemoPage label="Demo · Garden · the living view"
      hero={{ title: "Garden", bloom: "peony", colorway: "blush", flankL: "rose", flankR: "cosmos", creature: "butterfly",
        line: "Your whole life, growing in one place. The stage of each plant IS the meaning — and rest is a season, never a failure." }}>
      <GrowthStyles />
      <DemoSummary><SummaryCard eyebrow="Your garden today" rows={recs} /></DemoSummary>

      <StageLegend />

      <FwCardRow label="What you're growing — goals" Icon={Flower2} accent={T.gold} items={GOALS}
        render={(g) => <GoalCard key={g.id} goal={g} onAdd={() => {}} />} />

      <FwCardRow label="Big-life missions — your bucket list" Icon={MapPin} accent="#E08A6A" items={BUCKET_LIST}
        render={(b) => <BucketCard key={b.id} item={b} />} />

      <GrowthStack>
        <TinyMissionCard />
      </GrowthStack>

      <BakeNote>This is the existing NurtureGarden, made to hold everything you tend — not just the cycle companion. Each plant's growth comes from real signals (kept intentions, goal next-actions, completed missions); a sustained run earns a rare bloom or a pollinator. Rests show as resting soil, never red. No new function; new entities (Intention/Goal/BucketItem) feed the same garden.</BakeNote>
    </CardDemoPage>
  );
}

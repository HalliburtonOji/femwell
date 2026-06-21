// GrowthLifestyleDemo — "A day for you": days-off activities found FOR her. ONE
// curated pick at a time (choice-overload research), whole-life and joyful — not a
// chore list. A new lane in Lifestyle (For You / Read / Listen / Books / Daily
// Story / Horoscope / A day for you). Solo only in Phase 0. Preview-only.
import { Sun, Heart } from "lucide-react";
import { T } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";
import { GrowthStyles, GrowthStack, DayOffCard, DAYOFF_ACTIVITIES, BakeNote } from "@/components/demos/growthKit";

export default function GrowthLifestyleDemo() {
  const recs = [
    { Icon: Sun, label: "Today's pick", text: "One lovely thing for your day off — chosen for you", onClick: () => {} },
    { Icon: Heart, label: "Show me another", text: "Not feeling it? One tap for a fresh idea", onClick: () => {} },
  ];
  const others = DAYOFF_ACTIVITIES.slice(1);
  return (
    <CardDemoPage label="Demo · Lifestyle · a day for you"
      hero={{ title: "A day for you", bloom: "tulip", colorway: "gold", flankL: "cornflower", flankR: "marigold", creature: "butterfly",
        line: "Your day off, found for you. One thing at a time — outdoors, creative, restful, joyful. No catalogue to sift." }}>
      <GrowthStyles />
      <DemoSummary><SummaryCard eyebrow="A day for you" rows={recs} /></DemoSummary>

      <GrowthStack>
        <DayOffCard />
      </GrowthStack>

      <FwCardRow label="Or one of these" Icon={Sun} accent={T.gold} items={others}
        render={(a) => (
          <FwCard key={a.id} accent={a.accent} Icon={Sun} eyebrow={`A day for you · ${a.kind}`} flower={a.flower} title={a.title} line={a.why} idx={`alt-${a.id}`}
            action={<FwCardCTA accent={a.accent} onClick={() => {}} icon={Heart}>Save it for the day</FwCardCTA>} />
        )} />

      <BakeNote>A new 7th lane in Lifestyle, beside For You / Read / Listen / Books / Daily Story / Horoscope — nothing removed. Signals: a free day (Planner), energy/phase (gentle tint only — never a clinical claim), weather/interests. Pulls from existing LifestyleItems + a small curated experiences set. Solo only in Phase 0; social/local activities (Events/Deals, opt-in coarse location) come later. No new function.</BakeNote>
    </CardDemoPage>
  );
}

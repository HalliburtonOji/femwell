// GrowthPlannerDemo — the intention as the day's "why" above the agenda; goals
// break into tiny next-actions that drop into the day; a free day gets detected
// and a day-off suggestion offered; the bucket list gives a gentle horizon.
// Builds on the existing Planner (PlannerItems / Quiet Mode); nothing stripped.
import { Sprout, Flower2, Sun, MapPin } from "lucide-react";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { FwCardRow, SummaryCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";
import { GrowthStyles, GrowthStack, IntentionCard, GoalCard, BucketCard, DayOffCard, GOALS, BUCKET_LIST, BakeNote } from "@/components/demos/growthKit";

// A small faux-agenda so the "intention above the day" placement is legible.
function AgendaPeek() {
  const items = [
    { t: "08:30", x: "Morning ritual — three lines" },
    { t: "10:00", x: "Module 5 of the course (goal → next action)" },
    { t: "13:00", x: "Walk + lunch outside" },
    { t: "19:30", x: "Wind-down" },
  ];
  return (
    <div style={{ background: T.paperHi, border: `1px solid ${T.paperDeep}`, borderLeft: `4px solid ${T.sage}`, borderRadius: 18, padding: "16px 16px" }}>
      <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.crimson, marginBottom: 2 }}>Today, you're tending</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: T.ink, marginBottom: 12 }}>“go gently — it's a rest week”</div>
      <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.sage, marginBottom: 8 }}>Your day</div>
      {items.map((it) => (
        <div key={it.t} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: `1px solid ${T.paperDeep}` }}>
          <span style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: T.muted, width: 46, flexShrink: 0 }}>{it.t}</span>
          <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>{it.x}</span>
        </div>
      ))}
    </div>
  );
}

export default function GrowthPlannerDemo() {
  const recs = [
    { Icon: Sprout, label: "The day's why", text: "Your intention sits above the agenda", onClick: () => {} },
    { Icon: Flower2, label: "Goals → next actions", text: "Each goal offers one tiny step to drop into today", onClick: () => {} },
    { Icon: Sun, label: "Day off detected", text: "A light day? Here's something for it", onClick: () => {} },
  ];
  return (
    <CardDemoPage label="Demo · Planner · intention above the day"
      hero={{ title: "Planner", bloom: "daisy", colorway: "sage", flankL: "cornflower", flankR: "iris", creature: "dragonfly",
        line: "The day with a reason. An intention to frame it, goals that become small steps, and a free day the garden notices for you." }}>
      <GrowthStyles />
      <DemoSummary><SummaryCard eyebrow="Plan today, gently" rows={recs} /></DemoSummary>

      <GrowthStack>
        <IntentionCard />
        <AgendaPeek />
      </GrowthStack>

      <FwCardRow label="Goals → today's tiny step" Icon={Flower2} accent={T.gold} items={GOALS}
        render={(g) => <GoalCard key={g.id} goal={g} onAdd={() => {}} />} />

      <FwCardRow label="A light day — something for it" Icon={Sun} accent={T.gold} items={[{ id: "do" }]} render={() => <DayOffCard key="do" />} />

      <FwCardRow label="Look ahead — your bucket list" Icon={MapPin} accent="#E08A6A" items={BUCKET_LIST}
        render={(b) => <BucketCard key={b.id} item={b} />} />

      <BakeNote>Rides existing PlannerItems / PersonalTasks and the Quiet-Mode "rest" framing to spot a free day — no new function. A goal's next-action drops in as a gentle, optional item; it's never a chore in the agenda.</BakeNote>
    </CardDemoPage>
  );
}

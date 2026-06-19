// GardenCardsDemo — STANDALONE preview applying the approved card system to the
// Garden (§6.7/§6.8). Companion-led, ritual cards with in-place actions. Live Garden untouched.
import { useNavigate } from "react-router-dom";
import { Flower2, Feather, Sprout, Award, Share2, Heart } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard, LogActionCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";

const GROWING = [
  { id: "g1", name: "Self-kindness", blurb: "Grown from 4 days of journalling — a steady little bloom.", icon: Heart, accent: T.crimson, flower: "poppy" },
  { id: "g2", name: "Rest", blurb: "Watered by three early nights this week.", icon: Sprout, accent: "#8E6E8E", flower: "violet" },
  { id: "g3", name: "Connection", blurb: "Two messages to friends you'd been meaning to text.", icon: Flower2, accent: T.gold, flower: "sunflower" },
];
const MILESTONES = [
  { id: "m1", title: "First bloom", blurb: "You tended your garden 7 days in a row.", accent: T.gold, flower: "sunflower" },
  { id: "m2", title: "Named your companion", blurb: "Meadowlight has been with you 3 weeks.", accent: "#8FAF8F", flower: "fern" },
];

export default function GardenCardsDemo() {
  const navigate = useNavigate();
  const go = (path) => navigate(createPageUrl(path));
  const recs = [
    { Icon: Flower2, label: "Companion", text: "Meadowlight is blooming — tended 4 days running", onClick: () => go("Garden") },
    { Icon: Feather, label: "Leave a line", text: "A note to your garden becomes part of its growth", onClick: () => go("Garden?leave=1") },
    { Icon: Sprout, label: "Growing", text: "Self-kindness and Rest are both taking root", onClick: () => go("Garden?view=growing") },
  ];
  return (
    <CardDemoPage label="Demo · Garden · card system"
      hero={{ title: "Garden", bloom: "peony", colorway: "blush", flankL: "rose", flankR: "cosmos", creature: "butterfly", line: "Your companion and the small, real things you're growing — one tended day at a time." }}>
      <DemoSummary><SummaryCard eyebrow="Your garden today" rows={recs} /></DemoSummary>

      <FwCardRow label="Your companion" Icon={Flower2} accent="#8FAF8F" items={[{ id: "c" }]}
        render={() => (
          <LogActionCard key="c" Icon={Flower2} eyebrow="Meadowlight" flower="fern" accent="#8FAF8F"
            title="She's looking bright today" line="Tending takes a breath — water her, and she remembers. (Felt that.)">
            <FwCardCTA accent="#8FAF8F" onClick={() => go("Garden?tend=1")} icon={Heart}>Tend the garden</FwCardCTA>
          </LogActionCard>
        )} />

      <FwCardRow label="Leave a line" Icon={Feather} accent={T.crimson} items={[{ id: "l" }]}
        render={() => (
          <LogActionCard key="l" Icon={Feather} eyebrow="A note" flower="poppy" accent={T.crimson}
            title="Tell your garden something" line="A hope, a thank-you, a worry set down. It becomes part of what grows here.">
            <FwCardCTA accent={T.crimson} onClick={() => go("Garden?leave=1")} icon={Feather}>Leave a line</FwCardCTA>
          </LogActionCard>
        )} />

      <FwCardRow label="What's growing" Icon={Sprout} accent={T.gold} items={GROWING}
        render={(g) => (
          <FwCard key={g.id} accent={g.accent} Icon={g.icon} eyebrow="Growing" flower={g.flower} title={g.name}
            line={g.blurb} idx={`gr-${g.id}`}
            action={<FwCardCTA accent={g.accent} onClick={() => go(`Garden?plant=${g.id}`)}>Nurture this</FwCardCTA>}
            onOpen={() => go(`Garden?plant=${g.id}`)} openLabel="Open" />
        )} />

      <FwCardRow label="Milestones" Icon={Award} accent="#8E6E8E" items={MILESTONES}
        render={(m) => (
          <FwCard key={m.id} accent={m.accent} Icon={Award} eyebrow="Milestone" flower={m.flower} title={m.title}
            line={m.blurb} idx={`ms-${m.id}`}
            action={<FwCardCTA accent={m.accent} onClick={() => go("Garden?view=milestones")}>See more</FwCardCTA>}
            onOpen={() => go("Garden?view=milestones")} openLabel="Open milestones" />
        )} />

      <FwCardRow label="Share" Icon={Share2} accent="#8FAF8F" items={[{ id: "sh" }]}
        render={() => (
          <FwCard key="sh" accent="#8FAF8F" Icon={Share2} eyebrow="If you'd like" flower="snowdrop"
            title="Show someone your garden" line="A gentle, private snapshot you can share with a friend or partner — only if you want to."
            idx="share" action={<FwCardCTA accent="#8FAF8F" onClick={() => go("Garden?share=1")}>Make a snapshot</FwCardCTA>} />
        )} />
    </CardDemoPage>
  );
}

// GrowthCommunityDemo — Tier 0 ANONYMOUS connection only. "Someone like you"
// resonance (k-anon, no contact) + async season/domain prompt rooms (everyone
// answers the SAME prompt, reactions only). NO 1:1, no DMs, no profiles, no
// location. The gated tiers are explicitly HELD. Builds on existing anonymous
// Community (rooms / Echo Wall / QOTD); nothing stripped. Preview-only.
import { Users, MessageCircle } from "lucide-react";
import { T } from "@/components/journal/Editorial";
import { FwCardRow, SummaryCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";
import { GrowthStyles, GrowthStack, ResonanceCard, PromptRoomCard, PROMPT_ROOMS, HeldFlag, BakeNote } from "@/components/demos/growthKit";

export default function GrowthCommunityDemo() {
  const recs = [
    { Icon: Users, label: "Someone like you", text: "Women in your season felt the same — anonymously", onClick: () => {} },
    { Icon: MessageCircle, label: "Prompt rooms", text: "Answer the same gentle prompt as everyone else", onClick: () => {} },
  ];
  return (
    <CardDemoPage label="Demo · Community · Tier 0 (anonymous)"
      hero={{ title: "Community", bloom: "cosmos", colorway: "sage", flankL: "clover", flankR: "sunflower", creature: "bee",
        line: "Less alone, gently. Feel the company of women like you and answer a shared prompt — anonymously, no 1:1, no contact." }}>
      <GrowthStyles />
      <DemoSummary><SummaryCard eyebrow="Connection, the gentle way" rows={recs} /></DemoSummary>

      <GrowthStack>
        <ResonanceCard />
      </GrowthStack>

      <FwCardRow label="Async prompt rooms — everyone answers the same thing" Icon={MessageCircle} accent={T.gold} items={PROMPT_ROOMS}
        render={(r) => <PromptRoomCard key={r.id} room={r} />} />

      <HeldFlag lines={[
        "Built here (Tier 0, non-gated): anonymous resonance ('someone like you', no contact) + async prompt rooms (shared prompt, reactions only). No DMs, no profiles, no matching, no location.",
        "HELD until your safety sign-off: any 1:1 connection — the sealed-letter pen-pal, matching, direct messages. The UK Online Safety Act (no size exemption) + ICO Children's Code mean these need decisions first: a moderation model, an 18+ gate, and a no-location rule.",
        "These gated features are not built and not reachable. The safe path here is also the warm one — the version women prefer is the version with the lightest legal duty.",
      ]} />

      <BakeNote>Builds on the existing anonymous Community (topic rooms, Echo Wall, Question of the Day, Circles, k-anon reveal floors) — nothing removed. Resonance counts come from existing aggregate signals; prompt-room answers ride existing Community entities. No new function.</BakeNote>
    </CardDemoPage>
  );
}

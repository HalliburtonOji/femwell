// GrowthDemo — the HUB for the Phase-0 "Growth & Connection" demo set.
// Links the six per-surface demos that bake Halli's approved directions into
// EXISTING pages (no new nav tab). Built-vs-held is stated plainly. Preview-only.
import { useNavigate } from "react-router-dom";
import { Sun, Sprout, Flower2, CalendarDays, Compass, Users, User } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";
import { HeldFlag, GrowthStyles } from "@/components/demos/growthKit";

const SURFACES = [
  { id: "GrowthTodayDemo", icon: Sun, accent: T.crimson, flower: "poppy", title: "Today — the daily loop", line: "Set an intention, read your line of the day, do today's tiny mission, get nudged toward a day off." },
  { id: "GrowthGardenDemo", icon: Flower2, accent: T.blush, flower: "peony", title: "Garden — the living view", line: "Intentions are seeds, short goals bloom, long goals and bucket-list quests grow into trees; missions water it all." },
  { id: "GrowthPlannerDemo", icon: CalendarDays, accent: "#8FAF8F", flower: "daisy", title: "Planner — intention above the day", line: "The day's 'why' sits above your agenda; goals break into tiny next-actions; days off get detected." },
  { id: "GrowthLifestyleDemo", icon: Compass, accent: T.gold, flower: "tulip", title: "Lifestyle — a day for you", line: "One curated thing for your day off, found FOR you — not a catalogue to sift." },
  { id: "GrowthCommunityDemo", icon: Users, accent: "#8FAF8F", flower: "cosmos", title: "Community — Tier 0, anonymous", line: "'Someone like you' resonance + async prompt rooms. No 1:1, no contact. The gated tiers are held." },
  { id: "GrowthProfileDemo", icon: User, accent: "#8E6E8E", flower: "magnolia", title: "Profile — what you're growing", line: "Edit your goals and your bucket list, identity-framed across your whole life." },
];

export default function GrowthDemo() {
  const navigate = useNavigate();
  const go = (id) => navigate(createPageUrl(id));
  const recs = SURFACES.slice(0, 4).map((s) => ({ Icon: s.icon, label: s.title.split(" — ")[0], text: s.title.split(" — ")[1], onClick: () => go(s.id) }));
  return (
    <CardDemoPage label="Demo · Growth & Connection · Phase 0"
      hero={{ title: "Growth & Connection", bloom: "sunflower", colorway: "gold", flankL: "iris", flankR: "cosmos", creature: "bee",
        line: "Intentions, a line of the day, goals, tiny missions, a big-life bucket list, days off, and gentle anonymous connection — baked into the pages you already have." }}>
      <GrowthStyles />
      <DemoSummary><SummaryCard eyebrow="Six surfaces — pick one to explore" rows={recs} /></DemoSummary>

      <FwCardRow label="Where it bakes in (no new nav tab)" Icon={Sprout} accent={T.gold} items={SURFACES}
        render={(s) => (
          <FwCard key={s.id} accent={s.accent} Icon={s.icon} eyebrow="Demo surface" flower={s.flower} title={s.title} line={s.line} idx={`hub-${s.id}`}
            action={<FwCardCTA accent={s.accent} onClick={() => go(s.id)}>Open this demo</FwCardCTA>} onOpen={() => go(s.id)} openLabel="Open" />
        )} />

      <HeldFlag lines={[
        "Built (non-gated, Phase 0): daily intentions · the line of the day · goals (long + short) · tiny missions · the big-life bucket list · solo days-off activities · Tier 0 ANONYMOUS connection (resonance + async prompt rooms, no 1:1).",
        "Held until your safety sign-off: any 1:1 connection — sealed-letter pen-pal, matching, DMs. These need a moderation model, an 18+ gate, and a no-location rule decided first (UK Online Safety Act + ICO Children's Code).",
        "Nothing in the gated tier is built or reachable here. Turn the dials in the 'No Garden Grows Alone' plan and I'll build them next.",
      ]} />
    </CardDemoPage>
  );
}

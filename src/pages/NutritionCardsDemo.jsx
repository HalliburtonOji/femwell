// NutritionCardsDemo — STANDALONE preview applying the approved card system to
// Nutrition (§6.7/§6.8). Joyful, whole-life food — not a clinical macro tracker.
// Live Nutrition / NutritionHub untouched. Seeded so the full experience shows.
import { useNavigate } from "react-router-dom";
import { Utensils, Soup, Droplet, Cookie, Heart, Bookmark, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard, LogActionCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";

const RECIPES = [
  { id: "r1", title: "Lemon & herb traybake chicken", why: "One tin, ten minutes of effort, leftovers that taste better the next day.", time: "35 min", accent: T.gold, flower: "sunflower" },
  { id: "r2", title: "Cosy red lentil dal", why: "Iron-rich and gentle — lovely in the days before your period.", time: "25 min", accent: "#BC2E27", flower: "poppy" },
  { id: "r3", title: "Green shakshuka", why: "Brunch that feels like a treat and a vegetable at the same time.", time: "20 min", accent: "#8FAF8F", flower: "fern" },
];
const QUICK = [
  { id: "q1", title: "Dark chocolate & almond bark", why: "A proper little treat — magnesium, and joy.", time: "5 min", accent: "#8E6E8E", flower: "violet" },
  { id: "q2", title: "Whipped feta toast", why: "Three things, one slice, zero faff.", time: "6 min", accent: T.gold, flower: "primrose" },
];
const SAVED = [
  { id: "s1", title: "Overnight oats, six ways", why: "Your saved breakfast rotation.", time: "5 min", accent: "#8FAF8F", flower: "snowdrop" },
];

export default function NutritionCardsDemo() {
  const navigate = useNavigate();
  const go = (path) => navigate(createPageUrl(path));
  const recs = [
    { Icon: Utensils, label: "Tonight", text: RECIPES[0].title, onClick: () => go(`Nutrition?recipe=${RECIPES[0].id}`) },
    { Icon: Droplet, label: "Hydration", text: "4 of 8 glasses — one more this afternoon?", onClick: () => go("Nutrition?log=hydration") },
    { Icon: Heart, label: "For your phase", text: "Iron-friendly meals for the days ahead", onClick: () => go("Nutrition?filter=iron") },
  ];
  const recipeCard = (r, eyebrow) => (
    <FwCard key={r.id} accent={r.accent} Icon={Soup} eyebrow={eyebrow} flower={r.flower} title={r.title}
      line={r.why} idx={`rec-${r.id}`} inset={{ eyebrow: "Ready in", text: r.time }}
      action={<FwCardCTA accent={r.accent} onClick={() => go(`Nutrition?recipe=${r.id}`)}>Cook this</FwCardCTA>}
      onOpen={() => go(`Nutrition?recipe=${r.id}`)} openLabel="Open the recipe" />
  );
  return (
    <CardDemoPage label="Demo · Nutrition · card system"
      hero={{ title: "Nutrition", bloom: "marigold", colorway: "gold", flankL: "chamomile", flankR: "lavender", creature: "ladybird", line: "Food that's kind to you — joyful, simple, and a little phase-aware when you want it." }}>
      <DemoSummary><SummaryCard eyebrow="Today's plate" rows={recs} /></DemoSummary>

      <FwCardRow label="For you" Icon={Utensils} accent={T.gold} items={RECIPES} render={(r) => recipeCard(r, "Recipe")} />

      <FwCardRow label="Quick & joyful" Icon={Cookie} accent="#8E6E8E" items={QUICK} render={(r) => recipeCard(r, "5-minute")} />

      <FwCardRow label="Hydration" Icon={Droplet} accent="#5F7E8E" items={[{ id: "hyd" }]}
        render={() => (
          <LogActionCard key="hyd" Icon={Droplet} eyebrow="Water" flower="bluebell" accent="#5F7E8E"
            title="4 of 8 glasses today" line="A small, kind habit. Tap to add a glass — no streak pressure, just a nudge.">
            <FwCardCTA accent="#5F7E8E" onClick={() => go("Nutrition?log=hydration")} icon={Droplet}>Add a glass</FwCardCTA>
          </LogActionCard>
        )} />

      <FwCardRow label="Saved" Icon={Bookmark} accent="#8FAF8F" items={SAVED} render={(r) => recipeCard(r, "Saved")} />

      <FwCardRow label="A little treat" Icon={Sparkles} accent={T.crimson} items={[{ id: "treat" }]}
        render={() => (
          <FwCard key="treat" accent={T.crimson} Icon={Sparkles} eyebrow="Because today" flower="poppy"
            title="Permission slip: pudding counts" line="Wellness isn't a punishment. Here's a 10-minute warm berry crumble for two."
            idx="treat" action={<FwCardCTA accent={T.crimson} onClick={() => go("Nutrition?recipe=crumble")}>Make it</FwCardCTA>}
            onOpen={() => go("Nutrition?recipe=crumble")} openLabel="Open the recipe" />
        )} />
    </CardDemoPage>
  );
}

// ProfileCardsDemo — STANDALONE preview applying the approved card system to
// Profile (§6.7/§6.8). Identity-first, whole-life — not a settings list.
import { useNavigate } from "react-router-dom";
import { Sparkles, Flower2, Users, Bookmark, Target, Shield, Heart } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard, LogActionCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";

const TILES = [
  { id: "garden", name: "Your garden", blurb: "Your flora fingerprint and the companion growing with you.", icon: Flower2, accent: "#8FAF8F", flower: "fern", to: "Garden" },
  { id: "people", name: "Your people", blurb: "Partner, close friends, the circle you've chosen to share with.", icon: Users, accent: T.crimson, flower: "poppy", to: "PartnerSync" },
  { id: "saved", name: "Saved", blurb: "Articles, recipes, books and threads you tucked away for later.", icon: Bookmark, accent: T.gold, flower: "sunflower", to: "Saved" },
  { id: "privacy", name: "Privacy", blurb: "Anonymous by default. You decide what's shared, always.", icon: Shield, accent: "#8E6E8E", flower: "violet", to: "Privacy" },
];

export default function ProfileCardsDemo() {
  const navigate = useNavigate();
  const go = (path) => navigate(createPageUrl(path));
  const recs = [
    { Icon: Sparkles, label: "You", text: "Ojihalliburton · Reproductive years · member since April", onClick: () => go("Profile") },
    { Icon: Target, label: "Intention", text: "“More slow mornings” — set for this season", onClick: () => go("Profile?edit=intentions") },
    { Icon: Flower2, label: "Your garden", text: "Meadowlight is blooming — you've tended 4 days running", onClick: () => go("Garden") },
  ];
  return (
    <CardDemoPage label="Demo · Profile · card system"
      hero={{ title: "You", bloom: "peony", colorway: "blush", flankL: "primrose", flankR: "sunflower", line: "Not a settings list — a little portrait of who you are and what you're growing toward." }}>
      <DemoSummary><SummaryCard eyebrow="This is you today" rows={recs} /></DemoSummary>

      <FwCardRow label="Your intentions" Icon={Target} accent={T.crimson} items={[{ id: "i" }]}
        render={() => (
          <LogActionCard key="i" Icon={Target} eyebrow="This season" flower="poppy" accent={T.crimson}
            title="What are you reaching for?" line="Set one gentle intention — it tints your prompts, programmes and nudges, softly.">
            <FwCardCTA accent={T.crimson} onClick={() => go("Profile?edit=intentions")} icon={Heart}>Write an intention</FwCardCTA>
          </LogActionCard>
        )} />

      <FwCardRow label="Your spaces" Icon={Flower2} accent="#8FAF8F" items={TILES}
        render={(t) => (
          <FwCard key={t.id} accent={t.accent} Icon={t.icon} eyebrow="Yours" flower={t.flower} title={t.name}
            line={t.blurb} idx={`tile-${t.id}`}
            action={<FwCardCTA accent={t.accent} onClick={() => go(t.to)}>Open</FwCardCTA>}
            onOpen={() => go(t.to)} openLabel={`Open ${t.name.toLowerCase()}`} />
        )} />

      <FwCardRow label="Membership" Icon={Sparkles} accent={T.gold} items={[{ id: "m" }]}
        render={() => (
          <FwCard key="m" accent={T.gold} Icon={Sparkles} eyebrow="FemWell member" flower="sunflower"
            title="Your story so far" line="Joined April 2026 · 38 journal entries · 2 programmes · a garden that's properly taken root."
            idx="mem" action={<FwCardCTA accent={T.gold} onClick={() => go("Profile")}>See your profile</FwCardCTA>}
            onOpen={() => go("Profile")} openLabel="Open profile" />
        )} />
    </CardDemoPage>
  );
}

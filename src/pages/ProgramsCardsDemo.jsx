// ProgramsCardsDemo — STANDALONE preview applying the approved card system to
// Programs (§6.7/§6.8). Guided arcs across life, not just health. Each card → the
// EXACT programme/session. Live Programs untouched.
import { useNavigate } from "react-router-dom";
import { Play, Compass, Heart, Briefcase, Moon, Sparkles } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard, RecommendationCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";

const PROGRAMS = [
  { key: "perimenopause-foundations", title: "Perimenopause Foundations", blurb: "Ten short evenings to understand what's changing — and feel ahead of it.", cat: "Body", days: 10, accent: T.crimson, flower: "poppy" },
  { key: "confidence-reset", title: "The Confidence Reset", blurb: "Two weeks of tiny brave things — at work, in the mirror, in the group chat.", cat: "Mindset", days: 14, accent: T.gold, flower: "sunflower" },
  { key: "better-sleep", title: "Kinder Nights", blurb: "A gentle wind-down ritual that actually sticks.", cat: "Rest", days: 7, accent: "#8E6E8E", flower: "violet" },
  { key: "money-confidence", title: "Money, Calmly", blurb: "Five sessions to stop avoiding the bank app and start feeling in charge.", cat: "Money", days: 5, accent: "#8FAF8F", flower: "fern" },
];

export default function ProgramsCardsDemo() {
  const navigate = useNavigate();
  const go = (path) => navigate(createPageUrl(path));
  const active = PROGRAMS[0];
  const recs = [
    { Icon: Play, label: "Continue", text: `${active.title} · Day 1 of ${active.days}`, onClick: () => go(`ProgramDay?key=${active.key}&day=1`) },
    { Icon: Compass, label: "Browse", text: "Four new arcs across body, mindset, rest & money", onClick: () => go("ProgramsHub") },
    { Icon: Sparkles, label: "Tonight", text: "10 quiet minutes is all today's session asks", onClick: () => go(`ProgramDay?key=${active.key}&day=1`) },
  ];
  const card = (p, eyebrow) => (
    <FwCard key={p.key} accent={p.accent} Icon={Compass} eyebrow={eyebrow || p.cat} flower={p.flower} title={p.title}
      line={p.blurb} idx={`pg-${p.key}`} inset={{ eyebrow: "Length", text: `${p.days} short sessions` }}
      action={<FwCardCTA accent={p.accent} onClick={() => go(`ProgramsHub?program_key=${p.key}`)}>Start this</FwCardCTA>}
      onOpen={() => go(`ProgramsHub?program_key=${p.key}`)} openLabel="Open the programme" />
  );
  return (
    <CardDemoPage label="Demo · Programs · card system"
      hero={{ title: "Programs", bloom: "daisy", colorway: "gold", flankL: "sunflower", flankR: "fern", line: "Short, guided arcs you can actually finish — for your body, your head, and your life." }}>
      <DemoSummary><SummaryCard eyebrow="Where you are" rows={recs} /></DemoSummary>

      <FwCardRow label="Continue" Icon={Play} accent={T.gold} items={[active]}
        render={(p) => (
          <RecommendationCard key={p.key} item={{ id: p.key, title: p.title }} eyebrow="Pick up where you left off"
            reason={`You're on Day 1 of ${p.days}. Tonight: a 10-minute check-in.`} accent={p.accent} flower={p.flower}
            onOpen={() => go(`ProgramDay?key=${p.key}&day=1`)} />
        )} />

      <FwCardRow label="Body" Icon={Heart} accent={T.crimson} items={PROGRAMS.filter((p) => p.cat === "Body")} render={(p) => card(p)} />
      <FwCardRow label="Mindset" Icon={Sparkles} accent={T.gold} items={PROGRAMS.filter((p) => p.cat === "Mindset")} render={(p) => card(p)} />
      <FwCardRow label="Rest" Icon={Moon} accent="#8E6E8E" items={PROGRAMS.filter((p) => p.cat === "Rest")} render={(p) => card(p)} />
      <FwCardRow label="Money & work" Icon={Briefcase} accent="#8FAF8F" items={PROGRAMS.filter((p) => p.cat === "Money")} render={(p) => card(p)} />
    </CardDemoPage>
  );
}

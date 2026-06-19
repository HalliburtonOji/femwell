// PulseCardsDemo — STANDALONE preview applying the approved card system to Pulse
// (§6.7/§6.8). Insight cards spanning life (mood, energy, patterns), not a clinical
// chart wall. Live Pulse untouched. Seeded so the cards read fully.
import { useNavigate } from "react-router-dom";
import { Activity, TrendingUp, Heart, CalendarHeart, Sparkles, Moon } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";

const INSIGHTS = [
  { id: "mood", title: "Your mood lifted midweek", line: "Wednesday and Thursday were brighter — both days you'd seen a friend. Worth noticing.", eyebrow: "Mood", accent: T.crimson, flower: "poppy", to: "Pulse?view=mood" },
  { id: "energy", title: "Energy dips after 3pm", line: "Five days running. A short walk or a real lunch break seems to soften it.", eyebrow: "Energy", accent: T.gold, flower: "sunflower", to: "Pulse?view=energy" },
  { id: "sleep", title: "You sleep better on quiet evenings", line: "Nights without screens past 10 ran about 40 minutes longer.", eyebrow: "Rest", accent: "#8E6E8E", flower: "violet", to: "Pulse?view=sleep" },
];
const PATTERNS = [
  { id: "p1", title: "Confidence tracks your cycle", line: "You logged your boldest work moments around ovulation two months running — plan the big asks here.", eyebrow: "Pattern", accent: "#8FAF8F", flower: "fern", to: "Pulse?view=patterns" },
  { id: "p2", title: "Saturdays are your reset", line: "Mood, energy and steps all peak at the weekend. Protect them.", eyebrow: "Pattern", accent: T.gold, flower: "primrose", to: "Pulse?view=patterns" },
];

export default function PulseCardsDemo() {
  const navigate = useNavigate();
  const go = (path) => navigate(createPageUrl(path));
  const recs = [
    { Icon: TrendingUp, label: "This week", text: "Brighter midweek, dips after 3pm — a clear, gentle shape", onClick: () => go("Pulse") },
    { Icon: Heart, label: "Noticed", text: "Your mood lifts on the days you see people", onClick: () => go("Pulse?view=mood") },
    { Icon: CalendarHeart, label: "Phase", text: "Follicular · Day 1 — energy on the way up", onClick: () => go("Pulse?view=phase") },
  ];
  const card = (p) => (
    <FwCard key={p.id} accent={p.accent} Icon={Activity} eyebrow={p.eyebrow} flower={p.flower} title={p.title}
      line={p.line} idx={`in-${p.id}`}
      action={<FwCardCTA accent={p.accent} onClick={() => go(p.to)}>See the trend</FwCardCTA>}
      onOpen={() => go(p.to)} openLabel="Open the detail" />
  );
  return (
    <CardDemoPage label="Demo · Pulse · card system"
      hero={{ title: "Pulse", bloom: "dahlia", colorway: "plum", flankL: "iris", flankR: "cornflower", creature: "dragonfly", line: "Your week, gently read back to you — the small patterns across mood, energy and life." }}>
      <DemoSummary><SummaryCard eyebrow="Your week, gently" rows={recs} /></DemoSummary>

      <FwCardRow label="This week" Icon={TrendingUp} accent={T.gold} items={INSIGHTS} render={card} />
      <FwCardRow label="Patterns worth knowing" Icon={Sparkles} accent="#8FAF8F" items={PATTERNS} render={card} />

      <FwCardRow label="Your phase" Icon={Moon} accent={T.crimson} items={[{ id: "ph" }]}
        render={() => (
          <FwCard key="ph" accent={T.crimson} Icon={Moon} eyebrow="Follicular · Day 1" flower="poppy"
            title="Energy on the way up" line="A rising phase — often a good window for new starts and brave conversations. Plan with it, not against it."
            idx="phase" action={<FwCardCTA accent={T.crimson} onClick={() => go("Pulse?view=phase")}>What this means</FwCardCTA>}
            onOpen={() => go("Pulse?view=phase")} openLabel="Open phase detail" />
        )} />
    </CardDemoPage>
  );
}

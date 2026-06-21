// GrowthProfileDemo — "What you're growing": the editor for goals + the big-life
// bucket list, identity-framed across the whole of life. Plus the gentle prefs
// (solo/social lean, opt out of location). Builds on existing Profile; nothing
// stripped. Preview-only.
import { useState } from "react";
import { Flower2, TreePine, MapPin, Plus, Sparkles } from "lucide-react";
import { T, UI, SERIF } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";
import { GrowthStyles, GoalCard, BucketCard, GOALS, BUCKET_LIST, QuickActionSheet, BakeNote } from "@/components/demos/growthKit";

const DOMAINS = ["Career", "Money", "Friendship", "Love", "Creativity", "Travel", "Learn", "Health", "Joy", "Identity"];

function AddCard({ accent, icon: Icon, eyebrow, title, line, cta, fields }) {
  const [open, setOpen] = useState(false);
  return (
    <FwCard accent={accent} Icon={Icon} eyebrow={eyebrow} flower="primrose" title={title} line={line} idx={`add-${eyebrow}`}
      action={<FwCardCTA accent={accent} onClick={() => setOpen(true)} icon={Plus}>{cta}</FwCardCTA>}>
      <QuickActionSheet open={open} onClose={() => setOpen(false)} eyebrow={eyebrow} title={title} accent={accent} doneLabel="Plant it" onDone={() => setOpen(false)}>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.55, margin: "0 0 12px" }}>{fields.frame}</p>
        <input placeholder={fields.placeholder} style={{ width: "100%", boxSizing: "border-box", background: T.paper, border: `1px solid ${T.paperDeep}`, borderRadius: 11, padding: "11px 13px", fontFamily: SERIF, fontSize: 16, color: T.ink, outline: "none", marginBottom: 12 }} />
        <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Which part of life?</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {DOMAINS.map((d) => <span key={d} style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, padding: "6px 11px", borderRadius: 999, background: T.paper, border: `1px solid ${T.paperDeep}`, color: T.inkSoft }}>{d}</span>)}
        </div>
      </QuickActionSheet>
    </FwCard>
  );
}

export default function GrowthProfileDemo() {
  const recs = [
    { Icon: Flower2, label: "Goals", text: "Long-term perennials and this-season annuals", onClick: () => {} },
    { Icon: TreePine, label: "Bucket list", text: "Big-life missions — your trees", onClick: () => {} },
    { Icon: Sparkles, label: "How you want it", text: "Solo or social, and your privacy", onClick: () => {} },
  ];
  return (
    <CardDemoPage label="Demo · Profile · what you're growing"
      hero={{ title: "What you're growing", bloom: "magnolia", colorway: "plum", flankL: "iris", flankR: "rose", creature: "butterfly",
        line: "The garden, by intention. Set what you're becoming — across work, money, love, creativity, travel — and the rest of the app tends it." }}>
      <GrowthStyles />
      <DemoSummary><SummaryCard eyebrow="What you're growing" rows={recs} /></DemoSummary>

      <FwCardRow label="Your goals" Icon={Flower2} accent={T.gold} items={[...GOALS, { _add: "goal" }]}
        render={(g) => g._add
          ? <AddCard key="add-goal" accent={T.gold} icon={Plus} eyebrow="A new goal" title="Plant a goal" line="“I'm becoming someone who…” — a perennial for life-direction, or an annual for this season." cta="Add a goal"
              fields={{ frame: "Goals work best framed as identity, not output: “I'm becoming someone who makes things,” not “write 50,000 words.”", placeholder: "I'm becoming someone who…" }} />
          : <GoalCard key={g.id} goal={g} onAdd={() => {}} />} />

      <FwCardRow label="Your bucket list — big-life missions" Icon={MapPin} accent="#E08A6A" items={[...BUCKET_LIST, { _add: "bucket" }]}
        render={(b) => b._add
          ? <AddCard key="add-bucket" accent="#E08A6A" icon={Plus} eyebrow="A new quest" title="Add a big-life mission" line="“Go to Spain.” “Learn one whole song.” A tree, not a to-do — long-horizon, no deadline, no guilt." cta="Add a quest"
              fields={{ frame: "Dream big and specific. A bucket-list quest is a tree: it grows across seasons, and every small step is a bud on the way up.", placeholder: "One day, I want to…" }} />
          : <BucketCard key={b.id} item={b} />} />

      <BakeNote>Lives in the existing Profile — the editor for goals + bucket list, identity-framed across your whole life (health is one part, not the point). Prefs (solo/social lean, opt out of any location, what to show in the garden) live here too. New entities (Goal/BucketItem) are fine; no new function.</BakeNote>
    </CardDemoPage>
  );
}

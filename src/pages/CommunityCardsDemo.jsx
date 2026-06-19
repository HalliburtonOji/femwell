// CommunityCardsDemo — STANDALONE preview applying the approved card system to
// Community (BRAND_IDENTITY §6.7/§6.8). Whole-life rooms, not clinical support only.
// Live Community untouched. Seeded so the full experience is visible.
import { useNavigate } from "react-router-dom";
import { Users, MessageCircle, Heart, Sparkles, Briefcase, Coffee, Feather } from "lucide-react";
import { createPageUrl } from "@/utils";
import { T } from "@/components/journal/Editorial";
import { FwCard, FwCardCTA, FwCardRow, SummaryCard, StoryCard, LogActionCard } from "@/components/brand/Card";
import { CardDemoPage, DemoSummary } from "@/components/demos/cardDemoKit";

const ROOMS = [
  { id: "dating", name: "Dating & Marriage", blurb: "From first-date nerves to long-marriage MOTs — the conversation most apps skip.", icon: Heart, accent: T.crimson, flower: "poppy", live: "82 talking now" },
  { id: "career", name: "Career & Money", blurb: "Pay rises, pivots, side-hustles and the imposter voice. Bring the spreadsheet and the feelings.", icon: Briefcase, accent: T.gold, flower: "sunflower", live: "with 41 today" },
  { id: "friendship", name: "Friendship", blurb: "Making friends as a grown-up, drifting apart, the group chat that keeps you sane.", icon: Coffee, accent: "#8FAF8F", flower: "bluebell", live: "63 talking now" },
  { id: "venting", name: "Just Venting", blurb: "No fixing, no advice unless you ask. Say the thing. Anonymous and safe.", icon: MessageCircle, accent: "#8E6E8E", flower: "violet", live: "always open" },
];
const THREADS = [
  { id: "t1", room: "Career & Money", title: "I asked for the raise. Here's exactly what I said.", snippet: "I rehearsed it in the mirror for a week. Turns out the number wasn't the scary part — the silence after was…", replies: 47 },
  { id: "t2", room: "Dating & Marriage", title: "Ten years in. We started 'dating' again on Thursdays.", snippet: "Same café, no phones, one rule: no logistics talk. It's stupid and it's working…", replies: 31 },
  { id: "t3", room: "Friendship", title: "How do you make a new friend at 34?", snippet: "Moved cities for work and realised I haven't made a brand-new friend since uni. Where do grown women even…", replies: 58 },
];
const STORIES = [
  { id: "s1", title: "She posted her first 'win' here — then landed the job", summary: "How a vent in Career & Money turned into a CV swap, a mock interview, and an offer three weeks later." },
  { id: "s2", title: "The group that meets IRL now", summary: "Six women from the Friendship room who turned a thread into a monthly supper club." },
];

export default function CommunityCardsDemo() {
  const navigate = useNavigate();
  const go = (path) => navigate(createPageUrl(path));
  const recs = [
    { Icon: MessageCircle, label: "Trending", text: THREADS[0].title, onClick: () => go(`Community?thread=${THREADS[0].id}`) },
    { Icon: Users, label: "Your rooms", text: "Career & Money has 3 new replies for you", onClick: () => go("Community?room=career") },
    { Icon: Sparkles, label: "Prompt", text: "“What's one small win this week?” — share anonymously", onClick: () => go("Community?compose=1") },
  ];
  return (
    <CardDemoPage label="Demo · Community · card system"
      hero={{ title: "Community", bloom: "peony", colorway: "crimson", flankL: "violet", flankR: "poppy", line: "Real talk, kindly. Pull up a chair in any room — anonymous and safe." }}>
      <DemoSummary><SummaryCard eyebrow="What's alive today" rows={recs} /></DemoSummary>

      <FwCardRow label="Rooms" Icon={Users} accent={T.crimson} items={ROOMS}
        render={(r) => (
          <FwCard key={r.id} accent={r.accent} Icon={r.icon} eyebrow="Room" flower={r.flower} title={r.name}
            line={r.blurb} idx={`room-${r.id}`}
            inset={{ eyebrow: "Live", text: r.live }}
            action={<FwCardCTA accent={r.accent} onClick={() => go(`Community?room=${r.id}`)}>Enter room</FwCardCTA>}
            onOpen={() => go(`Community?room=${r.id}`)} openLabel="Open the room" />
        )} />

      <FwCardRow label="Trending threads" Icon={MessageCircle} accent="#8E6E8E" items={THREADS}
        render={(t) => (
          <FwCard key={t.id} accent="#8E6E8E" Icon={MessageCircle} eyebrow={t.room} flower="forget" title={t.title}
            line={t.snippet} idx={`thread-${t.id}`}
            action={<FwCardCTA accent="#8E6E8E" onClick={() => go(`Community?thread=${t.id}`)}>Read &amp; reply</FwCardCTA>}
            onOpen={() => go(`Community?thread=${t.id}`)} openLabel="Open the thread" />
        )} />

      <FwCardRow label="Share something" Icon={Feather} accent={T.sage} items={[{ id: "compose" }]}
        render={() => (
          <LogActionCard key="compose" Icon={Feather} eyebrow="Your turn" flower="snowdrop" accent={T.sage}
            title="Got something to say?" line="A win, a worry, a question, a vent — post it anonymously to any room.">
            <FwCardCTA accent={T.sage} onClick={() => go("Community?compose=1")} icon={Feather}>Start a post</FwCardCTA>
          </LogActionCard>
        )} />

      <FwCardRow label="Member stories" Icon={Sparkles} accent={T.gold} items={STORIES}
        render={(s) => <StoryCard key={s.id} item={s} onOpen={() => go(`Community?story=${s.id}`)} />} />
    </CardDemoPage>
  );
}

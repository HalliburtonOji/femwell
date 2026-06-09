// WholeLifeDoc — in-app readable mirror of claude-state/WHOLE_LIFE_REBALANCE.html.
// FoundersOS dev surface. The whole-life rebalance: health is one room, not the house.

import React from "react";
import { DocShell, Eyebrow, Title, H2, P, Card, Bullets, Pull, Badge, Pills, Table, Foot, D } from "./DocKit";

export default function WholeLifeDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Strategic Correction · 2026-06-09</Eyebrow>
      <Title sub="How every surface broadens from a clinical tracker to a whole-life wellness app — and how they all wire together. Mirror of claude-state/WHOLE_LIFE_REBALANCE.html.">
        The Whole-Life Rebalance
      </Title>

      <Pull>Health is one room, not the house. Women don't return for tracking — they return for belonging, voice, identity and lightness.</Pull>

      <Card accent={D.rose}>
        <P><strong>The correction.</strong> FemWell was built as a clinical/cycle tracker. It must be a <strong>whole-life</strong> app spanning relationships, dating, friendship, career, money, hobbies, fashion/beauty, creativity, identity, joy, entertainment, and gossip/venting. Two failures fixed: (a) we only wire 2–3 (always clinical) surfaces; (b) features hammer the clinical — even the games are cycle quizzes.</P>
      </Card>

      <H2>The two standing rules (now in CLAUDE.md)</H2>
      <Bullets items={[
        <span><strong>RULE 1 — span life, not just health.</strong> No feature is clinical-only. Lighthearted by default; life-stage gently <em>tints</em>, never dominates.</span>,
        <span><strong>RULE 2 — wire ALL surfaces, every time.</strong> Name a role for each of: Today, Journal, Community, Nutrition, Lifestyle (+ subdivisions), Health, Pulse/Trends/Insights, Planner, Profile, Programs, Doctor Export, Jess, Events, Deals.</span>,
      ]} />
      <Pills items={["relationships", "dating / marriage", "friendship", "career / work", "money", "hobbies", "fashion / beauty", "creativity", "identity", "joy / fun", "entertainment", "gossip / venting"]} />

      <H2>Surface inventory — how clinical is each page today?</H2>
      <P style={{ fontSize: 14 }}>Clinical-skew %: 0 = pure lifestyle/joy · 100 = pure clinical. <Badge tone="red">red ≥80</Badge> <Badge tone="amber">amber 45–79</Badge> <Badge tone="green">green ≤40 asset</Badge></P>
      <Table rows={[
        ["Surface", "Skew", "Whole-life gap"],
        ["Doctor Export", "100", "Clinical GP report by design (stays clinical)"],
        ["Pulse · Trends", "98", "Pure symptom analytics"],
        ["Insights", "95", "Symptom-correlation console"],
        ["Health", "90", "All 7 letters are clinical education"],
        ["Planner", "80", "'Capacity' is hormonal; no social/career/hobby planning"],
        ["Today", "70", "Front door opens on a cycle banner; no life cards"],
        ["Programs · Explore", "70–75", "Every track/video is a symptom remedy"],
        ["Profile", "65", "Identity = reproductive stage only"],
        ["Jess", "60", "Health companion, not life confidante"],
        ["Nutrition", "55", "No social eating, dining out, food-joy, budget"],
        ["Journal · Community · Deals", "45", "Wholeness tags only / 4-of-6 health rooms / no fashion-beauty"],
        ["Lifestyle hub", "35", "Taxonomy still health-led"],
        ["Listen · Horoscope", "20–25", "Broad — but under-promoted"],
        ["Events", "10", "Already dating/nightlife/social/culture"],
        ["Daily Story · BookReader", "0–5", "Pure entertainment — buried"],
      ]} />
      <P><strong>Structural finding:</strong> the whole-life capability lives in <strong>Lifestyle + Events + Journal</strong>, while the surfaces hit <em>first</em> (Today, Planner, the Pulse/Trends/Insights trio, Health) are 70–98% clinical. The lever = consolidate the triple analytics consoles, de-cycle-frame Today/Planner/Profile/Community, and <strong>promote the buried whole-life surfaces.</strong></P>

      <H2>Per-page rebalance (headlines)</H2>
      <Bullets items={[
        <span><strong>Today</strong> → a Skimm-style "smart-friend brief" mixing a cycle note with QOTD, a Daily Story card, a Circle nudge, an Event, a win to celebrate (cycle = one card).</span>,
        <span><strong>Journal</strong> → give each Wholeness domain its own prompts + resurfacing; a Career/Joy entry can become a Lounge vent / Circle post / book-club note.</span>,
        <span><strong>Nutrition</strong> → food-as-joy &amp; culture: Recipe Joy Swap, dining-out, cooking-for-friends, £ filters, a community cookbook. Macros opt-in.</span>,
        <span><strong>Lifestyle</strong> → promote Daily Story/BookReader (the joy engine), broaden taxonomy beyond hormones, weight interests as much as cycle.</span>,
        <span><strong>Pulse/Trends/Insights</strong> → consolidate the three near-identical consoles into ONE Health room reachable from the menu, not a primary slot.</span>,
        <span><strong>Planner</strong> → "capacity" becomes whole-life energy: friend dates, creative projects, career goals, Events (cycle = one input).</span>,
        <span><strong>Profile</strong> → "Me / My Shelf" taste identity (what she loves), not just reproductive stage.</span>,
        <span><strong>Programs</strong> → add confidence, money/work, creativity, friendship, style tracks alongside symptom programmes.</span>,
        <span><strong>Jess</strong> → warm life confidante + game host; money/career/relationship guidance; vents-with-you (never just fixes).</span>,
        <span><strong>Events / Deals</strong> → promote Events (dating/social/culture); broaden Deals to fashion/beauty/home/hobby/books.</span>,
      ]} />

      <H2>The whole-life rooms (the new IA spine)</H2>
      <Table rows={[
        ["Room", "What it serves"],
        ["The Lounge", "Anonymous warm vent / 'AIBU' / spill-it — the daily-engagement engine"],
        ["Circles", "Interest-first friendship — match on interest + stage, never a lead photo"],
        ["Me / My Shelf", "Taste identity (reading/watching/listening, hobbies)"],
        ["Money & Work", "Non-condescending confidence + ask-the-dumb-question"],
        ["Love & Relationships", "Anonymous peer/expert advice, upvote-surfaced"],
        ["Style & Self-Expression", "Confidence & identity; never hot-or-not"],
        ["The Lighter Side", "Skimm-style daily + playful astrology/quizzes"],
        ["Health", "The clinical room — one room, not the house"],
      ]} />

      <H2>Non-clinical activities for the Community pillar (catalogue)</H2>
      <P>Role-play, fashion, hot-takes, archetype play, ask-the-room, exquisite-corpse story, dream-boards — joyful, low-pressure, never clinical-only:</P>
      <Table rows={[
        ["Activity", "Concept", "Domain"],
        ["This-or-That Tuesday", "One-tap fork — frictionless first contribution", "fun"],
        ["Kind Hot-Takes", "Low-stakes 'unpopular opinions' (telly/food only)", "fun"],
        ["Vulnerability Ladder", "Opt-in 3-level WNRS deck: Light → Deeper → Reflect", "connection"],
        ["One-Line Story", "Exquisite-corpse: each adds a line, the tale revealed", "creativity"],
        ["Rate-my-Styling", "Feedback on the choice (colour/occasion), never the body", "fashion"],
        ["Which-Era-Are-You", "Fun archetype/era quizzes for self-knowledge", "identity"],
        ["Dream-Life Board", "Collaborative async vision board", "career / hope"],
        ["Ask the Room", "Crowdsource gentle peer advice (career/money/love)", "career / money"],
        ["Kind Confessions", "Anonymous wall, kindness-by-design, supportive crests", "belonging"],
        ["Role-Play Rooms", "'You're opening your dream café — what's its name?'", "creativity / fun"],
        ["Recommend-Me", "Rotating book/film/music/podcast swaps", "entertainment"],
        ["Wednesday Wins / Friday Five", "Weekly 'share a win' — non-comparison ritual", "wellbeing"],
        ["Build-It-Together", "Slow collective project that completes", "collaboration"],
      ]} />
      <P style={{ fontSize: 14 }}><em>Safety: rate the choice/character — never the body or worth; one gentle thing/day (Wordle law); round-based with real endpoints (Jackbox); reactions not scores; kindness-by-design moderation; crisis one tap away; Lucide/SVG crests, no emoji.</em></P>

      <H2>Cross-surface wiring (all of them)</H2>
      <Bullets items={[
        "Today = the smart-friend brief (QOTD, Daily Story, Circle nudge, Event, a win — cycle one card)",
        "Journal = private seed → Lounge / Circle / Ask-the-Room / book-club note",
        "Nutrition → community cookbook; Lifestyle ▸ Daily Story → Book Club; Listen → Recommend-Me; Horoscope → archetype play",
        "Health/Pulse/Trends/Insights = the consolidated clinical room; never the front door; excluded from social content",
        "Planner plans Events / friend dates / creative projects; Profile = Me-My-Shelf taste identity → Circle matching",
        "Events promoted + wired to Today/Planner/Circles; Deals broadened → Style room",
        "Doctor Export = clinical only, excludes all whole-life/social/voice; Jess = warm host across every room",
      ]} />

      <Foot>
        Mirror of <strong>claude-state/WHOLE_LIFE_REBALANCE.html</strong> · built from a 4-agent cited research pass (~120 sources: Pew friendship/loneliness, gossip-as-bonding, UK money-confidence gap, warm-vs-clinical UX, Peanut/Skimm/Letterboxd, WNRS/Jackbox). The .html remains the fuller source.
      </Foot>
    </DocShell>
  );
}

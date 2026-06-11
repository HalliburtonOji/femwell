// ConnectivityMapDoc — FoundersOS mirror of claude-state/APP_CONNECTIVITY_MAP.html.
// Whole-app cross-feature connectivity PROPOSAL (approval checklist). NOT built.
// Cream/ink editorial, no emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, P, Card, Bullets, Badge, Table, Foot } from "@/components/founders/DocKit";

const S = <Badge tone="plum">S</Badge>;
const M = <Badge tone="amber">M</Badge>;
const L = <Badge tone="red">L</Badge>;
const HI = <Badge tone="red">High</Badge>;
const MED = <Badge tone="amber">Med</Badge>;
const LO = <Badge tone="plum">Low</Badge>;
const DO = <Badge tone="green">DO</Badge>;
const OPT = <Badge tone="plum">OPT</Badge>;
const LATER = <Badge tone="plum">LATER</Badge>;

export default function ConnectivityMapDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Whole-app connective tissue · PROPOSAL — approval only, NOT built</Eyebrow>
      <Title sub="Every surface + the concrete links it could have to Community, Journal, Jess, and each other. An approval checklist. Surfaces from pages.config.js (45 routes) + a 4-agent code sweep. 2026-06-11.">
        App Connectivity Map
      </Title>

      <Card accent="#4A2A3A">
        <P><b>Core finding:</b> the app's <i>doing</i> surfaces (Journal, Community, Jess) and its <i>content</i> surfaces (Lifestyle reads, Horoscope, Daily Story, Listen, Nutrition, Programs, Events, Deals, SkinHair) live in <b>near-total isolation</b>. A woman reads a piece, finishes a program day, or gets her horoscope — and there's <b>no thread back into reflecting, discussing, or asking Jess.</b> The highest-leverage move is one reusable <b>"Reflect · Discuss · Ask Jess" action bar</b> on every content surface.</P>
      </Card>

      <H2>The reusable mechanisms (build once, reuse everywhere)</H2>
      <Table rows={[
        ["Pattern", "What it is", "Enabling primitive"],
        ["P1 Reflect→Journal", "Opens the Journal composer seeded with a prompt about what you read/did.", "Composer accepts a seed already; add /Journal?compose=1&seed=…"],
        ["P2 Discuss→Community", "Drops you into a relevant room with a seeded composer (or seeds the day's Q).", "Add /Community?room=…&seed=… deep-link."],
        ["P3 Ask Jess", "Opens the Jess assistant with context.", "fw_open_assistant event already exists."],
        ["P4 Content→QOTD/Echo seed", "Editorial content seeds the day's community talking point.", "QOTD is a static rotation; add an editorial seed."],
        ["P5 Aggregate belonging", "Count-free 'others in your season notice this too' link — never exposes the user's data.", "Reuse the SeasonCard framing."],
        ["P6 Interests→Circles", "Map onboarding followed_categories → suggested Circles/Clubs.", "Interests captured; Circles are static — a simple map."],
        ["P7 Stage→Circle handoff", "A life-stage hub hands off to its matching Circle.", "Pregnancy/Menopause/PCOS Circles already exist."],
      ]} />
      <P><b>Keystone:</b> P1+P2+P3 as one "Reflect · Discuss · Ask Jess" component unlocks ~15 of the lines below. Approving it once is the big decision.</P>

      <H2>Top recommendations (highest leverage)</H2>
      <Card accent="#6B8F5A">
        <Bullets items={[
          <span><b>1. The "Reflect · Discuss · Ask Jess" action bar</b> on every content surface. {M}×{HI} {DO} — one component threads all content into the doing-surfaces.</span>,
          <span><b>2. Horoscope → journal prompt + a Lighter-Side talking point</b> (Halli's example). {S}×{HI} {DO}</span>,
          <span><b>3. Daily Read / article → Reflect + Discuss</b> (Halli's example). {S}×{HI} {DO}</span>,
          <span><b>4. Lifestyle interests → Circle/Club suggestions</b> (data already captured). {M}×{HI} {DO}</span>,
          <span><b>5. LifeStageCare → its matching Circle</b> (Pregnancy/Menopause Circles exist). {S}×{HI} {DO}</span>,
          <span><b>6. Analytics → reflect-in-Journal + a count-free belonging link.</b> {M}×{MED} {DO}</span>,
          <span><b>7. Onboarding → special-category consent + Tier-0 belonging</b> (compliance + §6.9). {M}×{HI} {DO}</span>,
          <span><b>8. Jess as the connective host</b> — proactively offers reflect/discuss. {L}×{HI} {OPT} (ongoing).</span>,
        ]} />
      </Card>

      <H2>Lifestyle — Read / Article Detail</H2>
      <P><b>Exists:</b> save/like + interests filter For-You. No reflect/discuss/Jess.</P>
      <Table rows={[
        ["Connection", "Mechanism", "E×I", "Rec"],
        ["Article → Journal", "P1 'Reflect on this' — seeded composer", "S·Hi", "DO"],
        ["Article → Community", "P2 'Discuss' — opens the on-topic room seeded", "M·Hi", "DO"],
        ["Article → Jess", "P3 'Ask Jess about this'", "S·Med", "DO"],
        ["Lead read → QOTD", "P4 the read seeds the Question of the Day", "M·Med", "OPT"],
      ]} />

      <H2>Lifestyle — Horoscope</H2>
      <P><b>Exists:</b> nothing. (Keep astrology lighter-lane; never gates health.)</P>
      <Table rows={[
        ["Connection", "Mechanism", "E×I", "Rec"],
        ["Horoscope → Journal", "P1 'Write to today's sky' — seeded reflection", "S·Hi", "DO"],
        ["Horoscope → Community (Lighter Side)", "P4 a daily 'today's sky' talking point (opt-in, never health)", "M·Med", "OPT"],
        ["'Inner season' voice → Community tone", "cosmetic; keep clinical framing neutral", "S·Low", "LATER"],
      ]} />

      <H2>Daily Story / Listen</H2>
      <Table rows={[
        ["Connection", "Mechanism", "E×I", "Rec"],
        ["Daily Story → Library room", "surface serialized fiction in Community's Library", "S·Med", "OPT"],
        ["Story chapter → Journal/Community", "P1/P2 'what did this stir?' / spoiler-safe thread", "M·Med", "OPT"],
        ["After audio → reflect/discuss", "P1/P2 on the player end-state", "S·Low", "LATER"],
      ]} />

      <H2>Analytics — Pulse · Trends · Insights · HealthDashboard</H2>
      <P><b>Exists:</b> HealthDashboard → Jess; Health letters → Jess + Doctor Export. Pulse/Trends/Insights: none. No belonging signal.</P>
      <Table rows={[
        ["Connection", "Mechanism", "E×I", "Rec"],
        ["Insight/pattern → Journal", "P1 'Reflect on this pattern' — seeded entry", "M·Hi", "DO"],
        ["Analytics → Community belonging", "P5 count-free 'others in your season notice this' (NEVER the user's numbers)", "M·Med", "DO"],
        ["Pulse/Insights → Jess", "P3 'Ask Jess about this trend'", "S·Med", "DO"],
        ["Insight → Doctor Export", "'Bring this to your GP' — extend the Health handoff", "S·Med", "OPT"],
      ]} />
      <Card accent="#C4849A"><P><b>Privacy guardrail:</b> analytics→Community is a belonging nudge only — generic, count-free, life-stage-keyed. Never post/expose/aggregate the user's symptom or mood numbers to peers. Doctor Export stays isolated.</P></Card>

      <H2>Planner · Track</H2>
      <P><b>Exists:</b> Planner → Journal (FAB) · Planner → ProgramsHub · Planner diary → Doctor Export.</P>
      <Table rows={[
        ["Connection", "Mechanism", "E×I", "Rec"],
        ["Late-luteal day → gentler Community copy", "P5 a soft belonging nudge on hard days", "M·Med", "OPT"],
        ["A logged win → the weekly pool / Wednesday-Wins", "P2 'add this to the room' (aggregate-only)", "M·Med", "OPT"],
        ["Habit streak → reflect-in-Journal", "P1 a gentle milestone reflection (never public)", "S·Low", "LATER"],
      ]} />

      <H2>Nutrition · Programs · Reading</H2>
      <Table rows={[
        ["Connection", "Mechanism", "E×I", "Rec"],
        ["Recipe → Community food thread", "P2 'share this recipe' (anonymised card)", "M·Med", "OPT"],
        ["Recipe/meal → Jess", "P3 'tweak this for my phase'", "S·Med", "OPT"],
        ["Program day reflection → 'view in Journal'", "link into the JournalEntry it already creates", "S·Med", "DO"],
        ["Program → a program-scoped Club/cohort", "a time-boxed Club that closes with the program", "L·Hi", "OPT"],
        ["Reader → Book Club checkpoint thread", "P2 'discuss this far' back into the Library club", "M·Med", "DO"],
        ["Reader → Journal", "P1 'reflect on what you read'", "S·Med", "OPT"],
      ]} />

      <H2>SkinHair · LifeStageCare · Events · Deals</H2>
      <Table rows={[
        ["Connection", "Mechanism", "E×I", "Rec"],
        ["LifeStageCare → matching Circle (Pregnancy/Menopause)", "P7 'find your people' handoff (Circle exists)", "S·Hi", "DO"],
        ["SkinHair → Style room / Journal", "P2/P1 'phase skincare' / 'note how your skin feels'", "S·Low", "LATER"],
        ["Event → Community", "P2 'anyone else going?' thread or meet-up Club", "M·Med", "OPT"],
        ["Deal → Style/Money room", "P2 'is this worth it?' peer opinion (no shilling)", "S·Low", "LATER"],
        ["PartnerSync — keep private", "no Community link by design", "—", "—"],
      ]} />

      <H2>Profile · Onboarding · Settings (identity + consent)</H2>
      <P><b>Exists:</b> Profile → Community (just built) · Settings: anonymous-posts + circle-finder toggles · Onboarding captures interests + life_stage (feeds Lifestyle/Jess, NOT Circles) · consent lives in Settings.</P>
      <Table rows={[
        ["Connection", "Mechanism", "E×I", "Rec"],
        ["Onboarding interests → suggested Circles/Clubs", "P6 map followed_categories → Circles", "M·Hi", "DO"],
        ["Onboarding → special-category consent + Tier-0 belonging", "capture §7 consent here + belonging from day one (§6.9)", "M·Hi", "DO"],
        ["Settings → Echo/Community privacy controls", "echo visibility, consent withdrawal, GDPR delete-cascade (§6.10)", "M·Med", "OPT"],
        ["Profile interests → Circle suggestions", "P6 editing interests suggests Circles", "M·Med", "OPT"],
      ]} />

      <H2>Jess — the connective host</H2>
      <Table rows={[
        ["Connection", "Mechanism", "E×I", "Rec"],
        ["Jess surfaces cross-links", "proactively offers 'reflect on this?' / 'others in your season are talking about this'", "L·Hi", "OPT"],
        ["'Ask Jess' on every surface", "P3 extend the event to analytics + lifestyle", "S·Med", "DO"],
      ]} />

      <H2>Already wired (do NOT re-propose)</H2>
      <Bullets items={[
        "Community ↔ Journal: four-lives chooser; Witness/Twin deep-links; Echo Wall on Community; Ask-Jess; Today→Community; Profile→Community (all just built).",
        "Planner → Journal (FAB) · Planner → ProgramsHub · Planner diary → Doctor Export.",
        "Health letters → Jess + Doctor Export · HealthDashboard → Jess · ProgramDay reflection → JournalEntries (write only).",
        "Browse → BookReader · Community Book Club → BookReader · Onboarding interests → For-You · life_stage → Jess/SeasonCard · Settings anon/circle-finder toggles.",
      ]} />

      <H2>Locked guardrails (every line)</H2>
      <Bullets items={[
        "Doctor's Export stays isolated — no Community/Echo/Witness/Twin in; no peer content out.",
        "Whole-life not clinical — content links route to the right whole-life room.",
        "Anonymity + no scoreboards — content→Community shares anonymous; aggregate-only belonging; no counts/streaks.",
        "Crisis routing on every new text input; 18+ gate on Community entry; no emoji; cream/plum + Ephesis/Cormorant; Lucide only.",
        "Astrology never gates health — horoscope links stay lighter-lane.",
      ]} />

      <Foot>FemWell — App Connectivity Map · 2026-06-11. PROPOSAL for approval — nothing built. 45 routes enumerated + a 4-agent code sweep; existing cross-links verified in code. The "Reflect · Discuss · Ask Jess" action bar (rec #1) is the keystone.</Foot>
    </DocShell>
  );
}

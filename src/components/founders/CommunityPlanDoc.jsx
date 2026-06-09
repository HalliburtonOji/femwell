// CommunityPlanDoc — in-app readable mirror of claude-state/COMMUNITY_MEGA_PLAN.md (v2-FINAL).
// FoundersOS dev surface. Editorial, readable. Source of truth remains the .md.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Badge, Pills, Table, Foot, D } from "./DocKit";

export default function CommunityPlanDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · The Consolidated Community Plan · v2-FINAL · 2026-06-09</Eyebrow>
      <Title sub="The single authoritative Community spec. Mirror of claude-state/COMMUNITY_MEGA_PLAN.md — consolidates the mega plan, the Whole-Life Rebalance, the Audio design and every locked decision.">
        Community — the whole picture
      </Title>

      <Pull>"Journal owns the writer. Community owns the peer shapes" — and Community is a whole-life room, not a clinical one. Build belonging, voice, identity and lightness, not tracking.</Pull>

      <H2>Where we are</H2>
      <Card accent={D.sage}>
        <P><Badge tone="green">LIVE</Badge> &nbsp;<strong>Echo Wall</strong> (anonymous one-line phase-cohort wall) + <strong>Witness Mode</strong> (one entry held by one matched sister, 4 fixed responses) are built, deployed, live-verified. Entities Echo / WitnessRequest / WitnessStrike are live.</P>
      </Card>
      <Card accent={D.plum}>
        <P><strong>Locked decisions (2026-06-09):</strong> retire the off-thesis MP8 likes-forum and make the <strong>editorial anonymity-first surface the real /Community</strong>; <strong>18+ adults-only</strong> (collapses the children's-code / age-assurance burden); <strong>Halli = named senior accountable person</strong> for OSA/ICO; <strong>whole-life, not clinical-only</strong>.</P>
      </Card>
      <P><strong>Next:</strong> Phase 2 rebuilds the 5 Community demos in FoundersOS against this plan (approval artefacts), then production. The OSA/ICO legal floor is specced, Halli-owned, not yet executed — the gate before any scaled real-traffic surface.</P>

      <H2>Locked constraints (never re-litigate)</H2>
      <Pills items={["18+ adults-only", "anonymous-first", "UK (NHS/£/GMC)", "no emoji (Lucide/SVG)", "Editorial type kit", "one bottom nav", "no scoreboards / streaks / likes", "no paywalls on peer surfaces", "Jess as warm host (never a roast)", "whole-life not clinical-only", "evidence-informed, never a clinical promise"]} />

      <H2>A · The surface</H2>
      <P>/Community becomes the <strong>editorial anonymity-first home</strong> (the Demo5 hub), replacing the retired MP8 likes-forum. It hosts the gradient peer surfaces, the whole-life rooms, the Shared-Experience pillar and (later) audio. Warm, not clinical.</P>

      <H2>B · Built &amp; live — keep, surface properly</H2>
      <Bullets dot={D.sage} items={[
        <span><strong>Echo Wall</strong> — anonymous one-line wall, hold-only, 48h fade, 4-reaction lexicon (Same · Hold · Hear you · Saved), on-device crisis intercept + scrub, service-identity writes. <em>Needs mounting on the real /Community.</em></span>,
        <span><strong>Witness Mode</strong> — one entry → one matched sister → 4 fixed responses or pass; held-3 gate, 6h reroute, 3-strike removal, per-request crypto. <em>Needs a discoverable Witness Dock on Community.</em></span>,
        <span><strong>"One entry, four lives"</strong> — lock / echo / seal / witness all exist as mechanics; the <strong>unified entry-level chooser UI is the key unbuilt bridge.</strong></span>,
      ]} />

      <H2>C · The Shared-Experience pillar</H2>
      <P>Community as a shared experience, <strong>not a feed.</strong> One gentle thing a day, collective-not-competitive, aggregate-not-individual, Jess-hosted:</P>
      <Bullets items={[
        <span><strong>Question of the Day</strong> — the daily heartbeat; one-tap floor; descriptive-norm reveal ("most women said…"), never a per-person count.</span>,
        <span><strong>Book Club</strong> — built on the existing Lifestyle BookReader; one curated pick + Jess host; spoiler-gated, paced, latecomer-safe; framed as a wellbeing intervention.</span>,
        <span><strong>Cooperative games</strong> — Wordle-law (one a day, same for all, no leaderboard); body-literacy myth-busters + non-clinical play (see Whole-Life doc).</span>,
        <span><strong>Collective build / shared pool</strong> — a growing community artefact; "together we logged 412 moments of rest" — contribution, not competition.</span>,
        <span><strong>Ambient presence + rituals</strong> — "31 women are reflecting right now" (aggregate, never named); weekly "close the week" + seasonal moments as soft windows.</span>,
      ]} />

      <H2>D · Whole-life rooms (the rebalance)</H2>
      <P>Health is <strong>one</strong> room, not the house:</P>
      <Table rows={[
        ["Room", "What it is"],
        ["The Lounge", "Anonymous warm vent / 'AIBU' / spill-it — the daily-engagement engine"],
        ["Circles", "Interest-first friendship cohorts — match on interest + stage, never a lead photo"],
        ["Love & Relationships", "Anonymous peer (+ optional vetted expert) advice; upvote-surfaced"],
        ["Money & Work", "Bite-size, plain-English, never-condescending confidence + ask-the-dumb-question"],
        ["Style & Self-Expression", "Fashion/beauty as confidence; advice not hot-or-not; rate the choice, never the body"],
        ["The Lighter Side", "Skimm-style daily 'smart-friend' digest + playful astrology / quizzes"],
        ["Me / My Shelf", "Taste identity — what she loves (reading/watching/listening, hobbies)"],
        ["Health", "The clinical room — accurate, NHS-grounded — one room, not the house"],
      ]} />

      <H2>E · Non-clinical activities &amp; broadened games</H2>
      <P>De-clinicalise the pillar — role-play, fashion, gossip, interests, career, creativity, fun. The 22-item catalogue (full list + safety rules in the Whole-Life doc):</P>
      <Pills items={["This-or-That", "Kind Hot-Takes", "Vulnerability Ladder", "One-Line Story", "Rate-my-Styling", "Which-Era-Are-You", "Dream-Life Board", "Ask the Room", "Kind Confessions", "Role-Play Rooms", "Caption This", "Recommend-Me", "Wednesday Wins", "Build-It-Together"]} />
      <P style={{ fontSize: 14 }}><em>Load-bearing rule: rate the choice/character, never the body or worth; one gentle thing/day; reactions not scores; kindness-by-design moderation; crisis help one tap away; phase tints the prompt, never makes it clinical.</em></P>

      <H2>F · Audio / Talk-It-Out (the spoken sibling)</H2>
      <P>Three modes, <strong>async-first</strong> (full design in the Audio doc):</P>
      <Bullets items={[
        <span><strong>Mode A — async voice-notes</strong> ("a voice echo"): record → optional mask → STT crisis-scan + cooling-hold → a phase-sister holds it → fades. <Badge tone="green">buildable in-repo now</Badge></span>,
        <span><strong>Mode B — 1:1 turn-based "talk it out"</strong>: 3-min talk / listen / swap, "hold, don't fix", closing reflection. <Badge tone="amber">needs LiveKit + Halli's keys + OSA RA</Badge></span>,
        <span><strong>Mode C — small live status-flattened Circles</strong> (5–8, Peanut-Pods model, host-present, listen-only allowed). <Badge tone="red">last — highest moderation/legal burden</Badge></span>,
      ]} />

      <H2>G · Cross-page wiring (RULE 2 — account for ALL surfaces)</H2>
      <Bullets items={[
        "Book Club ↔ Lifestyle BookReader (built ON the existing reader)",
        "Question of the Day ↔ Today + cycle phase + Echo Wall",
        "Games / pools ↔ Planner + Health (aggregate only; never an individual's data to peers)",
        "Me-My-Shelf ↔ Profile + interest-first Circle matching",
        "Events ↔ Today / Planner / Circles  ·  Style ↔ Deals",
        "Doctor Export EXCLUDES all whole-life / social / voice content",
        "Jess hosts everything  ·  Notifications informational-only, never FOMO/streak",
      ]} />

      <H2>H · Rollout</H2>
      <Table rows={[
        ["Phase", "Scope"],
        ["3.5", "Route correction (editorial /Community) + QOTD + Tier-0 presence + the Lounge + async voice-notes + legal floor + MP8 retirement"],
        ["4", "Circles + Book Club + cooperative games + collective build + rituals + Living Wisdom + Money/Love/Style rooms"],
        ["5", "Phase Twin + 1:1 audio + live audio Circles + expert AMA layer"],
      ]} />
      <P><strong>Money:</strong> all peer surfaces free by principle; monetise expert depth only (AMAs, specialist content) — never the wall, Witness, Twin, or the rooms.</P>

      <H2>I · Chosen UX + Comments + Jess-as-games-master (2026-06-09)</H2>
      <P><strong>Chosen production UX:</strong> the <strong>Rooms + Tabs hybrid</strong> (~65/35) — rooms-as-doors is the home (the easy jump-in); a sticky tab bar is the in-room navigation. Demo: <strong>CommunityDemo6</strong> (the production candidate).</P>
      <H3>Comments (decided 2026-06-09)</H3>
      <Bullets items={[
        <span><strong>OPEN-write by default</strong> — anyone can write a comment; the poster keeps the option to switch a post to reaction-only (flippable, never deletes).</span>,
        <span><strong>Backend auto-moderation that REMOVES</strong> — every comment is screened server-side; harmful / out-of-place ones are auto-removed, shown as a gentle "Removed by Jess" tombstone. Real = OpenAI Moderation API + crisis check via a Base44 fn (needs the OpenAI key).</span>,
        <span><strong>Jess is an active participant</strong> — she chips in with warm support inline in threads (a reply, a nudge, surfacing help on heavy topics), distinct from members, tone-locked, never clinical/preachy.</span>,
        <span><strong>Flat, not threaded</strong> — every comment addresses the poster; removes the pile-on / co-rumination substrate. Lurking first-class (publicly readable; reading replies lowers anxiety); empty threads softened, never "0 comments".</span>,
        <span><strong>Kind-by-design + crisis-safe</strong> — "peer support, not medical advice", a kindness prompt, char limit, slow-mode, no counts; crisis pre-check routes to UK support (never silent-drop); a health-vocab allowlist so clinical words are never auto-blocked.</span>,
      ]} />
      <H3>Jess as host — games master + support</H3>
      <P>Jess hosts a gentle timed round (one shared prompt, generous countdown, then she reveals <strong>only the aggregate</strong> — "most of you said…", <strong>no winner</strong>), AND participates as warm support inline in comment threads. She celebrates, never judges (the post-Fable safe line); never clinical or preachy.</P>
      <H3>AI moderation — feasibility verdicts</H3>
      <Table rows={[
        ["Capability", "Verdict"],
        ["Jess games-master (timed)", "Buildable on Base44 now — client countdown + a Deno fn calling the built-in Claude integration; NOT live multiplayer"],
        ["Comment moderation", "Buildable now — needs only an OpenAI API key (free Moderation API) + the keyword crisis-check + health allowlist"],
        ["Async voice-note moderation", "Buildable — needs an external STT (AssemblyAI / Deepgram) → classify → hold-before-delivery"],
        ["Live audio moderation", "DEFER — can't pre-screen live safely; use structural + human (no recording)"],
      ]} />
      <P style={{ fontSize: 14 }}><em>OSA: AI pre-screening helps the legal floor, but the ToS must disclose proactive-tech use + keep human oversight + appeals. Owner: Halli.</em></P>

      <Foot>
        Mirror of <strong>claude-state/COMMUNITY_MEGA_PLAN.md (v2-FINAL)</strong> · companions: Whole-Life &amp; Audio tabs · FoundersOS dev surface. The .md remains the source of truth.
      </Foot>
    </DocShell>
  );
}

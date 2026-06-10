// BuildPlanDoc — in-app mirror of claude-state/COMMUNITY_BUILD_PLAN.html.
// FoundersOS dev surface. The sequenced plan to take Demo 6 to production /Community.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Badge, Table, Foot, D } from "./DocKit";

export default function BuildPlanDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Community Production Build Plan · 2026-06-09</Eyebrow>
      <Title sub="The sequenced plan to take the approved Demo 6 (Rooms + Tabs hybrid) to the real /Community. Mirror of claude-state/COMMUNITY_BUILD_PLAN.html; derived from COMMUNITY_MEGA_PLAN v2-FINAL.">
        Demo 6 → production /Community
      </Title>

      <Pull>Ship the editorial hybrid as the real /Community first (retire MP8) — home, rooms, Question of the Day, the Lounge with comments — then Jess games-master, then async voice-notes. Defer live audio + Phase Twin. The two true blockers are Halli's: an OpenAI key + the legal floor.</Pull>

      <H2>Architecture</H2>
      <H3>Entities (repo .jsonc + sync — the proven free path)</H3>
      <Table rows={[
        ["Entity", "Purpose", "Status"],
        ["Echo / WitnessRequest / WitnessStrike", "Echo Wall + Witness", "LIVE"],
        ["CommunityPost", "Lounge / room posts (+ comments_mode)", "NEW"],
        ["Comment", "Flat comments (post_id, author_hash, body, by, status)", "NEW"],
        ["Reaction", "Kind reactions (dedup; never counted)", "NEW"],
        ["QotdPrompt / QotdAnswer", "Question of the Day + answers (aggregate only)", "NEW"],
        ["GameRound / GameResponse", "Jess games-master round + answers", "NEW"],
        ["Circle / CircleMember", "Interest cohorts", "Phase 4"],
        ["VoiceNote", "Async voice-notes", "Audio"],
      ]} />
      <P style={{ fontSize: 14 }}><em>Anonymity (as for Echo/Witness): rows carry only a device-derived author_hash; all writes via asServiceRole so created_by is the service. No public counts stored.</em></P>

      <H3>Serverless functions (Base44 Deno, asServiceRole)</H3>
      <Table rows={[
        ["Function", "Does", "External"],
        ["postCommunityPost", "Create a post under the service identity", "—"],
        ["postComment ★", "Crisis pre-check → OpenAI Moderation API → auto-remove harmful (tombstone) / publish; health-vocab allowlist", "OpenAI key"],
        ["jessSupport", "One warm Jess support comment on heavy threads (by:jess), tone-locked", "Claude"],
        ["openGameRound / finalizeGameRound", "Claude generates prompt; close → aggregate + warm reveal (no winner)", "Claude (+ cron/lazy)"],
        ["postQotd / react / reportContent", "QOTD answer + norm; one-way reaction; report→hide", "—"],
        ["postVoiceNote (audio)", "STT → classify → hold-before-delivery", "STT (AssemblyAI/Deepgram)"],
      ]} />

      <H3>External dependencies + secrets</H3>
      <Bullets items={[
        <span><Badge tone="amber">BLOCKER</Badge> <strong>OpenAI API key</strong> → Base44 secrets (free Moderation API for comments) — gate for M2.</span>,
        <span><strong>Anthropic Claude integration</strong> enabled (Jess support + games-master).</span>,
        <span><strong>Cron / scheduled trigger</strong> for game rounds — or the lazy "open-on-first-view" fallback (no cron).</span>,
        <span>(Audio) <strong>STT</strong> key — AssemblyAI (cheapest) / Deepgram Nova-3 (UK accents).</span>,
      ]} />

      <H2>Sequenced rollout</H2>
      <Card accent={D.sage}>
        <P><strong>M1 · Phase 3.5a — Route correction (ship first).</strong> Retire MP8; mount the editorial Rooms+Tabs hybrid as the real /Community. Ship Home (rooms-as-doors + presence), the whole-life Rooms, Question of the Day, the Lounge with open-write comments + reactions. Productionise CommunityDemo6 → Community.jsx (swap mock data for entity reads/writes; keep the exact shell/palette/fonts). Add the 18+ gate + ToS disclosure + consent. <em>Exit: /Community = editorial hybrid; MP8 retired; comments post + read.</em></P>
      </Card>
      <Card accent={D.gold}>
        <P><strong>M2 · Phase 3.5b — Comment auto-moderation + Jess support</strong> <Badge tone="amber">needs OpenAI key</Badge>. postComment = the safety spine: crisis check → Moderation API → auto-remove harmful (tombstone) / publish; health allowlist; human-review queue for borderline + appeals. jessSupport (Claude) inline support. ToS MUST disclose proactive moderation; name the human-review owner (Halli). <em>Exit: harmful comment auto-removed server-side; Jess support posts; clinical words never blocked.</em></P>
      </Card>
      <Card accent={D.gold}>
        <P><strong>M3 · Phase 3.6 — Jess games-master.</strong> Daily gentle round: one shared prompt, generous countdown, simultaneous aggregate reveal, no winner. GameRound/GameResponse + openGameRound/finalizeGameRound (Claude; cron or lazy). Client countdown cosmetic; round server-authoritative; reveal via real-time sync. NOT live multiplayer. <em>Exit: a daily round runs end-to-end.</em></P>
      </Card>
      <Card accent={D.rose}>
        <P><strong>M4 · Phase 4 — Async voice-notes</strong> <Badge tone="amber">needs STT</Badge>. Record → optional mask → STT → classify → hold-before-delivery → a sister holds it → fades. VoiceNote + postVoiceNote. <em>Exit: a note is screened + held before delivery.</em></P>
      </Card>
      <Card accent={D.red}>
        <P><strong>Deferred (do NOT build at launch):</strong> live audio (needs WebRTC provider + OSA RA; real-time AI mod unsafe), Phase Twin (Q4), expert AMA, Circles formalisation, Witness true zero-knowledge E2E (current = at-rest + access-gated; security upgrade, not launch-blocking).</P>
      </Card>

      <H2>Blocked on Halli</H2>
      <Bullets items={[
        <span><Badge tone="amber">KEY</Badge> <strong>OpenAI API key → Base44 secrets</strong> (gate for M2).</span>,
        <span>Confirm the <strong>Claude integration</strong> is enabled + whether a <strong>cron</strong> exists (else lazy open).</span>,
        <span><strong>Legal floor (accountable person = Halli):</strong> illegal-content RA · ToS proactive-moderation disclosure · APD + DPIA · explicit special-category consent · 18+ age-gate · human-review + appeals owner.</span>,
        <span><strong>Retire-MP8 sign-off</strong>; (audio phase) an <strong>STT key</strong>.</span>,
      ]} />

      <H2>Build order — checklist</H2>
      <Bullets items={[
        "M1a — create entities (CommunityPost, Comment, Reaction, Qotd*) via repo .jsonc + sync",
        "M1b — productionise Demo 6 → Community.jsx (entity reads/writes) + post/react/report/qotd functions",
        "M1c — route correction: mount hybrid at /Community; retire MP8; 18+ gate + ToS + consent",
        "M1d — verify (build/lint/Playwright/live-walk) + deploy + hash-flip confirm",
        "M2a — [OpenAI key] postComment: crisis-check + Moderation API + allowlist + review queue",
        "M2b — jessSupport (Claude); human-review + appeals owner named",
        "M3 — games-master: GameRound/GameResponse + open/close (Claude; cron or lazy)",
        "M4 — [STT] async voice-notes (VoiceNote + postVoiceNote)",
        "Deferred — live audio · Phase Twin · expert AMA · Circles · Witness ZK-E2E",
      ]} />

      <H2>Open decisions</H2>
      <Bullets items={[
        "Comments before the key? Launch reads+reactions at M1; gate comment WRITING on M2 so nothing posts unscreened (rec).",
        "Cron vs lazy for game rounds (depends on Base44 scheduled-trigger availability).",
        "STT choice when audio lands (AssemblyAI cheapest vs Deepgram UK-accent).",
        "Reaction persistence: server entity (cross-device dedup) vs local-only (rec: server, no counts).",
        "Jess support trigger: auto on heavy vs on-tap (rec: gentle auto + a manual 'ask Jess').",
        "Char limit + slow-mode thresholds.",
      ]} />

      <Foot>
        Mirror of <strong>claude-state/COMMUNITY_BUILD_PLAN.html</strong> · derived from COMMUNITY_MEGA_PLAN v2-FINAL. Planning + docs only — no features built. The .html is the fuller, formatted source for Halli.
      </Foot>
    </DocShell>
  );
}

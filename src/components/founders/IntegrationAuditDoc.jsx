// IntegrationAuditDoc — FoundersOS mirror of claude-state/COMMUNITY_INTEGRATION_AUDIT.html.
// How the live /Community connects to every other surface vs COMMUNITY_MEGA_PLAN §6.
// Cream/ink editorial, no emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, P, Card, Bullets, Badge, Table, Foot } from "@/components/founders/DocKit";

const CRIT = <Badge tone="red">CRITICAL</Badge>;
const HIGH = <Badge tone="amber">HIGH</Badge>;
const MED = <Badge tone="plum">MED</Badge>;
const LOW = <Badge tone="green">LOW</Badge>;
const BUILD = <Badge tone="green">BUILD</Badge>;
const DECIDE = <Badge tone="plum">DECISION</Badge>;

export default function IntegrationAuditDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Community · Cross-surface integration audit</Eyebrow>
      <Title sub="How the live /Community actually connects to every other surface vs the intended connections in COMMUNITY_MEGA_PLAN §6. Evidence-based (4-agent code sweep). Each gap: severity + BUILD (clear fix) vs DECISION (needs Halli). 2026-06-11.">
        How well is Community connected?
      </Title>

      <Card accent="#BC2E27">
        <P><b>Headline:</b> the bones are wired — Community is reachable; rooms/QOTD/Clubs/Book-Club work; the <b>Doctor's-Export privacy contract holds (no peer-content leak)</b>. But Community is <b>siloed from the peer features the mega-plan calls its spine</b>: the <b>Echo Wall is displayed nowhere live</b> (echoes written but never readable), and Witness, Phase Twin, Today, and the Jess assistant have no entry points to/from Community.</P>
      </Card>

      <H2>The one that matters most — the Echo Wall is dark</H2>
      <Card accent="#BC2E27">
        <P>{CRIT} {BUILD} <b>The Echo Wall is mounted nowhere in the live app.</b> The Journal can write an echo (FourLivesChooser → ShareAsEchoSheet → postEcho, wired). But the wall that displays echoes — EchoWall.jsx — renders <b>only inside CommunityDemo3.jsx</b> (a FoundersOS demo). No live page calls Echo.filter. So a woman shares a line into the void and <b>no one — not even she — can read the wall.</b> Dropped when Community was rebuilt as Demo 6.</P>
        <P><b>Fix (clear):</b> mount the existing EchoWall.jsx on Community as a home card + view. Self-contained (own load/empty/error, reactions, retract). Restores the flagship wall with no new backend.</P>
      </Card>

      <H2>1. Journal ↔ Community (§6.1 — the spine)</H2>
      <Table rows={[
        ["Connection", "State", "Gap / tag"],
        ["Four-lives chooser (lock/echo/seal/witness)", "WIRED", "Journal-only entry — fine."],
        ["Echo Wall display", "MISSING", "CRIT · BUILD — echoes written, never displayed live."],
        ["Witness inbox (hold space)", "PARTIAL", "HIGH · BUILD — Journal tab only; not discoverable from Community; no 'someone's waiting' signal."],
        ["Phase Twin entry", "PARTIAL", "MED · BUILD — Journal tab only; no 'find a twin' in Community."],
        ["'My echoes' (writer sees own echoes)", "MISSING", "MED · DECISION — where it lives."],
        ["Living Wisdom reverse (echo → Journal compose)", "MISSING", "LOW · DECISION — planned, unbuilt."],
      ]} />

      <H2>2. Today ↔ Community (§6.2)</H2>
      <Card accent="#BC2E27"><P>{HIGH} {BUILD} <b>Today surfaces nothing from Community</b> — no QOTD teaser, no Tier-0 belonging card, no Living Wisdom card, no "share an echo on a heavy day." <b>Fix:</b> one quiet Today → Community card (belonging line + QOTD teaser, deep-linking to /Community). One-way, opt-in, no counts.</P></Card>

      <H2>3. Health / cycle ↔ Community (§6.3)</H2>
      <Table rows={[
        ["Connection", "State", "Gap / tag"],
        ["life_stage → SeasonCard + tone", "WIRED", "Good — belonging card is real once a profile exists."],
        ["Cycle PHASE → phase-aware tone (late-luteal gentler copy)", "MISSING", "MED · DECISION — useCycleDay exists (Today/Planner) but Community never uses phase."],
        ["Privacy: never writes Health / exposes a symptom", "WIRED", "Contract holds (reads life_stage only)."],
      ]} />

      <H2>4. Lifestyle / Library / Book Club ↔ Community (§6.5)</H2>
      <Table rows={[
        ["Connection", "State", "Gap / tag"],
        ["Book Club → real BookReader", "WIRED", "createPageUrl('BookReader?gutenberg_id=514'); param validated."],
        ["Library room → real catalogue", "PARTIAL", "MED · DECISION — LibraryView is a stub; only BookReader exists, no catalogue page."],
        ["Lifestyle interest tags → Circle matching", "MISSING", "LOW · DECISION — bigger feature."],
        ["'Discuss in Community' on reads/story/horoscope", "MISSING", "LOW · DECISION — cross-promo."],
      ]} />

      <H2>5. Jess ↔ Community (§6.7)</H2>
      <Table rows={[
        ["Connection", "State", "Gap / tag"],
        ["Jess as host (QOTD, games-master, moderation, support)", "WIRED", "Consistent host voice (jessSupport, 'Jess hosts' labels)."],
        ["Community → Jess assistant (chat)", "MISSING", "MED · BUILD — fw_open_assistant opens Jess from nav/Health, never from Community. Add 'Ask Jess'."],
      ]} />

      <H2>6. Doctor's Export ↔ Community (§6.6 — privacy)</H2>
      <Card accent="#6B8F5A"><P><b>PASS — WIRED · PRIVATE. No leak.</b> DoctorExport reads only UserProfile/DailyCheckins/SymptomLogs/MedicationLogs/JournalEntries/Correlations — <b>zero</b> Echo/Witness/Twin/CommunityPost/Comment references. Community-tier content is structurally unreachable from the GP export, exactly as §6.6 requires. Keep it that way.</P></Card>

      <H2>7. Planner · Nutrition · Programs · Profile</H2>
      <Table rows={[
        ["Surface", "State", "Gap / tag"],
        ["Planner ↔ Community (program-scoped circles)", "MISSING", "LOW · DECISION — a feature, not a quick wire."],
        ["Nutrition ↔ Community", "MISSING", "LOW · DECISION — not specced; likely N/A."],
        ["Programs ↔ Community", "MISSING", "LOW · DECISION — no cross-promo today."],
        ["Profile ↔ Community (life_stage)", "PARTIAL", "LOW · BUILD — reads/writes life_stage (drives SeasonCard) but no Profile → Community link, no taste tags → Circles."],
      ]} />

      <H2>8. Navigation, orphans &amp; general gaps</H2>
      <Bullets items={[
        "Reachability GOOD — Community in bottom nav + sidebar + menu; routed behind the 18+ AgeGate.",
        "Deep links OK — BookReader param validated; AgeGate decline → /Today (exists). No broken routes.",
        "LOW · BUILD — orphaned dead code: CommunityFeed.jsx imported nowhere, uses legacy Posts entity — safe to remove.",
        "LOW · BUILD — comment-fetch has no error state (.catch(()=>[])); a failure shows empty, not an error.",
        "LOW · DECISION — legacy entities (CommunityPosts/Posts/Reaction(s)/Reports) linger unused; live app uses CommunityPost + Comment + function-side reactions/reports.",
        "Demos/MP8 acceptable — URL-routable but absent from user nav (FoundersOS-only). The EchoWall-in-a-demo is the bug above, not a nav issue.",
        "MED · DECISION — Living Wisdom population: promoteWisdom (admin) exists + the library reads WisdomEntry + a curated seed, but no auto-promotion of well-held Echoes (needs the curation decision + a cron).",
      ]} />

      <H2>Phase 2 — clear build-wins (proposed, batched)</H2>
      <Card accent="#6B8F5A">
        <Bullets items={[
          "W1 — Mount the Echo Wall on Community (CRIT). Restores the write→read loop, no backend change.",
          "W2 — Today → Community card (HIGH): belonging + QOTD teaser deep-linking to /Community.",
          "W3 — 'Ask Jess' entry from Community (MED): dispatch the existing fw_open_assistant event.",
          "W4 — Witness + Phase Twin discoverable from Community (MED): needs a small Journal deep-link param (edges into a decision).",
          "W5 — Cleanups (LOW): remove CommunityFeed.jsx; comment-fetch error state; Profile → Community link.",
        ]} />
      </Card>

      <H2>Decisions for Halli (won't guess)</H2>
      <Bullets items={[
        "Echo Wall placement: a home card + full-screen view, or a dedicated 'Echo Wall' room door? (Recommend card + view near the top.)",
        "Witness/Twin from Community: deep-link into the Journal overlays (needs a Journal URL param), or light pointers only?",
        "Phase-aware tone (late-luteal gentler copy) — wire cycle phase into Community?",
        "'My echoes' archive — Journal or Community?",
        "Library catalogue — build a browsable catalogue, or keep one curated club?",
        "Lifestyle interest → Circle matching, program-scoped Circles, Living-Wisdom auto-promotion — prioritise?",
        "Legacy entity cleanup — do it or leave it?",
      ]} />

      <Foot>FemWell — Community Integration Audit · 2026-06-11. 4-agent read-only code sweep vs COMMUNITY_MEGA_PLAN §6. Severity CRITICAL/HIGH/MED/LOW; BUILD (clear) vs DECISION (Halli). Doctor's-Export privacy verified intact.</Foot>
    </DocShell>
  );
}

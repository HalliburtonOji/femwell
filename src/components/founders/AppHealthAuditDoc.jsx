// AppHealthAuditDoc — FoundersOS mirror of claude-state/APP_HEALTH_AUDIT.html.
// Scan 1 of the full-app health audit: the write-failure / hang class. Cream/ink editorial, no emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, P, Card, Bullets, Badge, Table, Foot } from "@/components/founders/DocKit";

const BLOCKER = <Badge tone="plum">BLOCKER</Badge>;
const HIGH = <Badge tone="amber">HIGH</Badge>;
const MED = <Badge tone="amber">MED</Badge>;
const FIXED = <Badge tone="green">FIXED</Badge>;
const CLEAN = <Badge tone="green">CLEAN</Badge>;
const QUEUED = <Badge tone="plum">QUEUED</Badge>;
const HALLI = <Badge tone="plum">NEEDS-HALLI</Badge>;

export default function AppHealthAuditDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · App Health Audit · Scan 1 — the write-failure / hang class, app-wide</Eyebrow>
      <Title sub="2026-06-12 · companion to the posting saga (8d4f79f · d1eeafc · 661e338). Findings by CODE INSPECTION (RLS, unguarded awaits, unindexed sorts). The mock harness hid the posting bug — so write-path fixes are tagged needs-live-verify; Halli confirms against the live app.">
        Where else does the posting bug class hide?
      </Title>

      <H2>1(a) — RLS / write-permission audit &nbsp; {CLEAN}</H2>
      <Card accent="#6B8F5A">
        <P><b>No entity currently denies a legitimate write.</b> Enumerated all <b>134</b> entities.</P>
        <Bullets items={[
          "22 entities carry the write-lock, now role:\"admin\" — asServiceRole (admin-level) satisfies it; direct clients (role:\"user\") are blocked (intended B3 protection). ZERO role:\"system\" remain (that was the app-wide bug — it denied the service too).",
          "112 entities have no RLS block → platform default → owner writes + service writes both succeed.",
          "Read policies correct: 13 locked entities keep public read (lurkable); 9 are read-locked to admin (private peer data). Confirmed NO client reads any of those 9 directly — all via service functions, so the lock doesn't break a read.",
        ]} />
        <P><b>Residual (LOW):</b> the 112 default entities let a signed-in client write its OWN rows directly — fine for personal data; a service-only hardening pass is separate (not a write-failure).</P>
      </Card>

      <H2>1(b) — Function hang audit &nbsp; {HIGH}</H2>

      <P><b>B1 — Unguarded awaited calls in interactive functions.</b> {HIGH} &nbsp; <b>49 of 59</b> client-invoked functions have an awaited entity call (get/filter/create/update/delete) or external <code>fetch</code>/<code>InvokeLLM</code> that is NOT timeout-guarded — the exact posting class (a <code>.catch</code> only catches a throw; a call that HANGS never settles and wedges the function).</P>
      <Table rows={[
        ["Batch", "Functions", "State"],
        ["1 — Echo + Community react/report", "reactCommunity, reportCommunity, reactEcho, reportEcho, retractEcho (retractEcho had a BARE uncaught await delete)", "FIXED af70814"],
        ["2 — Memberships", "joinCircle, leaveCircle, joinClub, leaveClub, createClub", "QUEUED"],
        ["3 — Peer 1:1 (Witness/Twin)", "postWitnessRequest, claimWitness, respondWitness, cancel/flag/deliver, getWitnessStatus, joinTwin, postTwinEntry, getTwinDay, cancelTwin", "QUEUED"],
        ["4 — Pool / game / voice", "collectivePool, openGameRound, markSessionComplete, postVoiceNote", "QUEUED"],
        ["5 — AI / content-gen", "generate* (×14), askStars, analyzeMeal, expandContent, guideActions… — guard InvokeLLM/fetch so a slow model fails gracefully", "QUEUED"],
      ]} />
      <P><small>Fix pattern (proven on posting): wrap every awaited platform/external call in withTimeout(p, ms). Reads fail-open (skip + proceed); writes return a clean 500. Guards are the UNIVERSAL protection — they hold regardless of index state or model latency.</small></P>

      <Card accent="#C4849A">
        <P><b>B2 — App-wide unindexed sorts.</b> {HIGH} {HALLI} &nbsp; ~100 sorted reads sort on a field with NO index — what tipped the posting rate-cap read into a 27s+ hang. Only the 10 community entities (661e338) are covered; everything else sorts unindexed (DailyCheckins.date ×14, LifestyleItems.published_at ×15, UserProfile ×9, JournalEntries, MealLog, HabitLogs, Programs…).</P>
        <P><b>Judgment call — why NOT auto-add 100 indexes:</b> the app runs daily on these reads, so unindexed sorts degrade/crawl but don't UNIVERSALLY hang (posting needed a big table + the RLS-denial interaction to tip over). So:</P>
        <Bullets items={[
          "Primary fix = the B1 guards (universal) — no read can wedge a function regardless of index.",
          "Indexes = targeted optimization where live latency shows slowness. Suggested first set: DailyCheckins.date, JournalEntries.created_date/session_date, MealLog, UserProfile, HabitLogs.date, LifestyleItems.published_at, Programs, UserPrograms. Halli decides scope (additive low-risk schema change; cost is the entity sync).",
        ]} />
      </Card>

      <P><b>B3 — Client write-flows gating success on a slow read.</b> {MED} &nbsp; The client "Posting…" class. Community posts/comments/circle/club/club-notes fixed to optimistic + background refetch (661e338). Next: sweep other pages' submit handlers (journal, planner, logs, nutrition) for an awaited reload after a write that gates the UI. (part of SCAN 2)</P>

      <H2>Method &amp; next waves</H2>
      <Card accent="#4A2A3A">
        <Bullets items={[
          "This wave: 1(a) verdict (clean) · 1(b) full risk map · batch-1 guards FIXED (af70814).",
          "Next waves: B1 batches 2–5 (guards, committed per batch to deploy+verify) · B2 index subset (on greenlight) · SCAN 2 (dead/mis-wired buttons, missing empty/loading/error states, referenced-but-undeployed entities, awaited fire-and-forget).",
          "Live-verify, not mock: every write-path fix is needs-live-verify — Halli runs the real action; the mock harness is not trusted to declare a write working.",
        ]} />
      </Card>

      <Foot>FemWell — App Health Audit · Scan 1 · 2026-06-12. Companion to the STATUS.md posting-saga close-out. {FIXED} batch 1 · {QUEUED} batches 2–5 + indexes + Scan 2. {BLOCKER}/{HIGH}/{MED} legend per item above.</Foot>
    </DocShell>
  );
}

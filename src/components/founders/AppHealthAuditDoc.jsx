// AppHealthAuditDoc — FoundersOS mirror of claude-state/APP_HEALTH_AUDIT.html.
// Scan 1 (write-failure/hang class) + Scan 2 (functional sweep). Cream/ink editorial, no emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, P, Card, Bullets, Badge, Table, Foot } from "@/components/founders/DocKit";

const BLOCKER = <Badge tone="plum">BLOCKER</Badge>;
const HIGH = <Badge tone="amber">HIGH</Badge>;
const MED = <Badge tone="amber">MED</Badge>;
const FIXED = <Badge tone="green">FIXED</Badge>;
const CLEAN = <Badge tone="green">CLEAN</Badge>;
const HALLI = <Badge tone="plum">NEEDS-HALLI</Badge>;

export default function AppHealthAuditDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · App Health Audit · Scan 1 (write-failure/hang) + Scan 2 (functional)</Eyebrow>
      <Title sub="2026-06-12 · companion to the posting saga. Findings by CODE INSPECTION; the mock harness hid the posting bug, so every write-path fix is needs-live-verify (Halli runs the real action on the live backend).">
        B1 + B2 + Scan-2 first pass — COMPLETE
      </Title>

      <Card accent="#6B8F5A">
        <P><b>Status:</b> all 59 interactive functions guarded; 8 hot entities indexed; the JessConversation silent-no-save bug fixed; 11 client write-flows de-gated. Awaiting one consolidated deploy + a live write-sweep.</P>
      </Card>

      <H2>1(a) — RLS / write-permission &nbsp; {CLEAN}</H2>
      <Card accent="#6B8F5A">
        <P><b>No entity denies a legitimate write.</b> 134 entities enumerated; 0 role:"system" remain; 22 role:"admin" (service writes ok, client blocked); 112 platform-default (owner+service ok). The 9 read-locked private entities are never read directly by the client. Read policies correct.</P>
      </Card>

      <H2>1(b) — function hang audit &nbsp; B1 {FIXED}</H2>
      <P><b>Was 49/59 functions with unguarded awaited calls. Now 0.</b> Every awaited entity read/write, <code>fetch</code>, and <code>InvokeLLM</code> is guarded (withTimeout / Promise.race / AbortSignal). Verified: guard audit shows 0 unguarded lines + deno check.</P>
      <Table rows={[
        ["Batch", "Commit"],
        ["1 — Echo + Community react/report (retractEcho had a bare uncaught await delete)", "af70814"],
        ["2 — Membership / echo / game / QOTD / pool / screen", "a9268eb"],
        ["3 — Witness peer-support", "c5ce77b"],
        ["4 — Twin / voice / partner / Jess", "b2620c5"],
        ["5 — AI/content-gen + guideActions (22 calls) + checkout (Stripe @15s, no retries)", "a4fc91a"],
      ]} />
      <P><small>Reads fail-open (2.5s); writes clean 500 (6s); LLM/gen 20s; fetch 8s. AI-gen fns are JS-in-.ts with pre-existing type noise (0 new errors; deploy via SWC).</small></P>

      <P><b>B2 — sort indexes on hot entities.</b> {FIXED} (da31c53) &nbsp; 8 highest-traffic entities had NO indexes block and were sorted on every read. Added the hot fields (targeted): DailyCheckins(date), JournalEntries(created_date,session_date), MealLog, UserProfile, HabitLogs(date), LifestyleItems(published_at), Programs, UserPrograms. {HALLI} the remaining ~90 unindexed-sort entities are guarded (B1) so safe — index only where live latency shows slowness.</P>

      <H2>Scan 2 — functional sweep</H2>
      <Card accent="#C4849A">
        <P><b>S2.1 — JessConversation silent no-save.</b> {BLOCKER} {FIXED} (cd6bbc9) &nbsp; JessVoiceMode wrote to <code>entities.JessConversations</code> (PLURAL, nonexistent) with <code>?.create</code> — undefined → silent no-op → voice sessions never saved. Fixed to <code>JessConversation</code> + added conversation_type / transcript fields so the transcript persists.</P>
      </Card>
      <P><b>S2.2 — gate-UI-on-slow-read (B3).</b> {MED} {FIXED} (cd6bbc9) &nbsp; 11 submit handlers awaited a refetch after their write (froze the spinner on the read) → converted to background refetch: SymptomDiary, ShoppingList, TrackTab, NutritionProgress, KickTracker, KickCounter, MedReminder, MenopauseReport, DailyPlan, PainMap, GuideThreadSidebar.</P>
      <Card accent="#C4849A">
        <P><b>S2.3 — referenced-but-undeployed entities.</b> {HIGH} {HALLI} &nbsp; 3 entities are read/written by the client but have no repo .jsonc — confirm on Base44 (commit their schema if deployed; the feature is broken if not): <code>AtelierLetters</code>, <code>HoroscopePersistedClassification</code>, <code>PodcastListens</code>.</P>
      </Card>

      <H2>Remaining flags (next wave)</H2>
      <Card accent="#4A2A3A">
        <Bullets items={[
          "B2 index tail — ~90 more entities sort unindexed; guarded so safe; index per live latency (Halli scope).",
          "Scan-2 deep UI pass — per-page audit of dead/mis-wired buttons + missing empty/loading/ERROR states is its own wave (this pass covered the programmatic + write-flow classes).",
          "Service-only hardening — decide which default-RLS entities should block direct client writes.",
        ]} />
      </Card>

      <Foot>FemWell — App Health Audit · Scan 1 + 2 first pass · 2026-06-12. Commits: af70814 · a9268eb · c5ce77b · b2620c5 · a4fc91a (B1) · da31c53 (B2) · cd6bbc9 (Scan 2). Awaiting consolidated deploy + live write-sweep.</Foot>
    </DocShell>
  );
}

// JournalAuditDoc — in-app mirror of claude-state/JOURNAL_AUDIT.html.
// FoundersOS dev surface. Full end-to-end QA/security audit of the Journal
// (front + back + process + edge) run 2026-06-10 before Community.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Badge, Foot, D } from "./DocKit";

const SEV = { Blocker: "red", High: "amber", Medium: "plum", Low: "green", Polish: "gold" };
const ACC = { Blocker: "#BC2E27", High: D.gold, Medium: D.plum, Low: D.sage, Polish: D.inkSoft };

function Finding({ sev, area, title, loc, children, fix }) {
  return (
    <Card accent={ACC[sev]}>
      <div style={{ marginBottom: 5 }}>
        <Badge tone={SEV[sev]}>{sev}</Badge>{" "}
        <span style={{ fontFamily: 'ui-sans-serif,system-ui,sans-serif', fontSize: 11, color: D.inkSoft, fontWeight: 600 }}>{area}</span>
      </div>
      <P><strong>{title}</strong></P>
      {loc && <P style={{ fontSize: 12.5 }}><code style={{ fontFamily: "ui-monospace,Menlo,monospace", color: D.plumMid }}>{loc}</code></P>}
      <P style={{ fontSize: 14.5 }}>{children}</P>
      {fix && <P style={{ fontSize: 14 }}><strong style={{ color: D.sage }}>FIX</strong> · {fix}</P>}
    </Card>
  );
}

export default function JournalAuditDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Journal · Full QA / Security Audit · 2026-06-10</Eyebrow>
      <Title sub="Front + back + process + edge cases, before Community. Live bundle index--wKXIhLD.js. Three parallel deep-inspection passes re-verified against the code + Playwright webkit renders. Full source: claude-state/JOURNAL_AUDIT.html.">
        The Journal — audited end to end
      </Title>

      <Pull>Is it 100%? — No, not yet. The core journaling surface is mature and well-built (real empty/loading/error states, strong token kit, zero emoji, thoughtful anonymity + on-device crypto). But the newest peer-to-peer features carry real risk: 3 Blockers + several High issues must be fixed before adults are put into community-style contact. The biggest unknown isn't in the repo — whether the Base44 entities are actually locked server-side (B3).</Pull>

      <P>
        <Badge tone="red">Blocker ×3</Badge>{"  "}<Badge tone="amber">High ×8</Badge>{"  "}<Badge tone="plum">Medium ×11</Badge>{"  "}<Badge tone="green">Low ×6</Badge>{"  "}<Badge tone="gold">Polish ×4</Badge>
      </P>

      <H2>Must fix before Community</H2>
      <Bullets items={[
        <span><strong>Lock the peer entities server-side</strong> (Echo, WitnessRequest, WitnessStrike, TwinPair, TwinEntry) — deny client read/write of others' rows; service-role only; verify live. The whole anonymity guarantee rests on this. <em>(B3)</em></span>,
        <span><strong>Crisis interception on Phase Twin</strong> — client + server. The one peer surface with none. <em>(B1)</em></span>,
        <span><strong>Fix the ZK key-delivery lifecycle</strong> so the receiver can't dead-end waiting on a writer who closed the app. <em>(B2)</em></span>,
        <span><strong>Unify the mood lexicon</strong> — Insights mislabels every mood today. <em>(H2)</em></span>,
        <span><strong>Reconcile witness state vs the server</strong> — clear stale SENT_KEY; resume currentClaim. <em>(H3, H4)</em></span>,
        <span><strong>Server-side Echo rate limit</strong> (5/day is client-only → floodable). <em>(H5)</em></span>,
        <span><strong>Editorial cleanup</strong> — masthead onto tokens + script title; remove off-palette fills. <em>(H1, H6)</em></span>,
        <span><strong>Z-index discipline</strong> — one scale; the 18+ AgeGate always on top. <em>(H8)</em></span>,
      ]} />

      <H2>Blockers</H2>
      <Finding sev="Blocker" area="back · privacy" title="B3 · Peer entities are directly client-accessible — anonymity rests on out-of-repo config"
        loc="EchoWall.jsx:59,65,93,102 · entities/*.jsonc (no permissions)"
        fix="Deny-by-default entity permissions (service-role only) checked into the repo; route Echo react/report through functions; live-verify a direct client read of each entity is forbidden.">
        The Echo wall reads every non-hidden row and updates/deletes rows it doesn't own — proving clients have cross-user entity access in this app. The anonymity entities declare no access control in the repo, so a tampered client could read every ciphertext, hash, wrapped_key and pairing. Cannot be confirmed from the repo — needs a live authed probe.
      </Finding>
      <Finding sev="Blocker" area="back · safety" title="B1 · Phase Twin delivers peer text with no crisis interception (client or server)"
        loc="twin/PhaseTwin.jsx handleShare · functions/postTwinEntry"
        fix="crisisCheck(draft) before posting (divert to UK resources) + mirror server-side in postTwinEntry.">
        A daily twin answer is shared verbatim with a stranger, yet neither client nor server screens for crisis content — on a surface built for heavy disclosures. Echo + Witness both gate; Twin is the hole. Safety-of-life, not privacy.
      </Finding>
      <Finding sev="Blocker" area="edge · process" title="B2 · ZK 'maximum privacy' receiver dead-ends forever if the writer never returns"
        loc="WitnessInbox.jsx keypending · AskForWitnessSheet.jsx (delivery only while sheet polls)"
        fix="Bound the keypending wait to open_deadline/expires_at with a terminal 'back in the pool' state; move wrapping to a background reconcile on the writer's next app-open.">
        The DEK is delivered only by the writer's device while its sheet is open + polling. The moment the writer taps Done, delivery can never fire — the receiver polls "this opens shortly" forever, with no timeout or pass-back. The inherent pull-pairing-ZK tradeoff, currently unhandled.
      </Finding>

      <H2>High (8)</H2>
      <Finding sev="High" area="process · data" title="H2 · Insights mislabels every mood — two incompatible scales"
        loc="JournalInsightsTab.jsx:14 (Calm/Stressed/Low/Energized/Angry/Anxious) vs NewEntrySheet.jsx:107 (1 Low→5 Bright)"
        fix="One mood lexicon (1–5 Low→Bright) imported everywhere; drop the unused 6th value.">
        The composer writes 1–5 Low→Bright; Insights maps the same integers through a different 6-value lexicon, so "Bright (5)" reports as "Angry" and "Neutral (3)" as "Low". Reader + Cycle Mirror use the correct scale — the same entry is described two contradictory ways.
      </Finding>
      <Finding sev="High" area="front · brand" title="H1 · Sticky masthead runs on the legacy plum/mauve palette + a non-script title"
        loc="Journal.jsx:103–157 (var(--plum/--mauve/--surface/--border)); title :111 bare sans"
        fix="Tokens throughout (CTA = T.ink); render the title with <Script>.">
        The whole sticky header — title, dates, the purple Write CTA, season strip — uses the old CSS vars, not T.* tokens, and the title is bare system-sans not Ephesis. First thing the eye hits; clashes with the editorial byline beneath it.
      </Finding>
      <Finding sev="High" area="front · brand" title="H6 · Off-palette fills: gold pill, purple dusk card, espresso mood, ledger rainbow"
        loc="Journal.jsx:200 · TonightReflection.jsx:21 · NewEntrySheet.jsx:111 · JournalLedger.jsx:20"
        fix="Active pill = ink fill / gold border; one dark 'dusk' token (no violet); brightest mood = ink; ledger type = gold-hairline + ink label.">
        Brand bans gold fills, espresso fills, and off-palette colour. The active wholeness pill is a solid gold block; the Tonight card is a violet-charcoal gradient; the brightest mood face is espresso; the ledger encodes card type as an off-palette rainbow (colour-only, 10px label) that leaks into the reader.
      </Finding>
      <Finding sev="High" area="edge" title="H3 · Stale SENT_KEY strands the writer on a 'Held by one sister' screen — locked out"
        loc="AskForWitnessSheet.jsx:44,297 · witnessAnon.forgetSent"
        fix="On restore, fetch real status first; if gone/failed clear SENT_KEY and fall through; always render a Done/clear affordance.">
        Any value in mySentId() jumps to the 'sent' screen with no entry; if the status lookup fails the screen sticks forever with no 'Take it back' — and since it's 1 send/day, the user is locked out of Witness. forgetSent() only fires on a successful cancel.
      </Finding>
      <Finding sev="High" area="edge" title="H4 · WitnessInbox always re-claims instead of resuming the in-flight hold"
        loc="WitnessInbox.jsx:118 vs witnessAnon.currentClaim (written, never read on load)"
        fix="On load, if currentClaim() exists re-fetch + resume; only claim anew when there's no live claim.">
        rememberClaim() is stored but never read on mount — the inbox unconditionally re-claims. A receiver who closes before responding can pull a second stranger's entry while the first is still hers (or lose it). The persisted claim id is dead code on the read path.
      </Finding>
      <Finding sev="High" area="back · safety" title="H5 · Echo 5/day cap is client-only — the wall is floodable"
        loc="functions/postEcho (no count) · echoAnon bumpEchoesToday (localStorage)"
        fix="Count Echo.filter({author_hash}) since start-of-day in postEcho; return {error:'rate'} past the cap.">
        postEcho does crisis + length checks but never counts prior echoes; the daily cap lives only in localStorage. A scripted/storage-cleared client floods the lightest-moderation peer surface unbounded. Witness enforces 1/day server-side — Echo should match.
      </Finding>
      <Finding sev="High" area="edge" title="H7 · Insights tab has no loading/error state + an uncaught Promise.all"
        loc="JournalInsightsTab.jsx:43"
        fix="Loading skeleton + a .catch setting a 'couldn't load your insights' state.">
        The overlay renders while data is empty (cards flash then pop) and the Promise.all has no .catch — a rejected request throws unhandled and cards silently stay empty, looking broken. No error fallback unlike the rest of the feature.
      </Finding>
      <Finding sev="High" area="front · a11y" title="H8 · Z-index ladder incoherent — the 18+ AgeGate isn't guaranteed on top"
        loc="AgeGate.jsx:25 (z90) = NewEntrySheet (z90) < SealedLetterCompose (z92); child sheets nested under parents"
        fix="One Z scale in Editorial (sheet/modal/gate); AgeGate at the top, non-backdrop-dismissible.">
        The overlay stack is unsorted (60→92) and child sheets render inside higher-z parents (their value only 'works' by DOM order). A safety boundary below a composer is wrong; any refactor mis-stacks.
      </Finding>

      <H2>Medium (11) · Low (6) · Polish (4)</H2>
      <H3>Medium</H3>
      <Bullets dot={D.plum} items={[
        "Escape-to-close + focus trap on only 3 of 12 modals; no role=dialog (front · a11y).",
        "'Sealed Letters' hub item opens an off-screen inline section — reads as a dead tap (process).",
        "Burn mode shares the composer text state — can persist or wipe unexpectedly (process).",
        "postTwinEntry result never checked — silent not-active/wrong-day failures (back).",
        "claimWitness / joinTwin assign races are read-then-write, not atomic (back).",
        "deliverWitnessKey can wrap to a stale receiver after reroute → unreadable entry (back).",
        "No-cycle user: phase lenses/letters silently vanish; cold-start card never satisfiable (edge).",
        "Encryption-unavailable Sealed letter lets you write a long letter then can't seal it (edge).",
        "Witness gate ('hold 3 first') discoverable only by being blocked; counts from localStorage (process).",
        "flagWitness 'strike' has no auth — any user can strike any receiver_hash out of the pool (back).",
        "Phase Twin 'cancel search' never tells the server; abandons silently after 72h (edge).",
      ]} />
      <H3>Low &amp; Polish</H3>
      <Bullets dot={D.sage} items={[
        "Ledger row is a clickable div — not keyboard-operable; type is colour-only (Low · front).",
        "Voice auto-restart can silently stop on network/no-speech (Low · edge).",
        "Delete is permanent, no undo; failed delete still removes the row locally (Low · process).",
        "Echo react/report/retract optimistically mutate + swallow errors (Low · edge).",
        "getTwinDay returns twinAnswered before you write — small metadata lurk (Low · back).",
        "Un-tokenised creams (#EFE3C9) + CaptureShield hardcodes #2E261B (Low · front).",
        "Close affordances inconsistent across sheets; 'share' offered in 3 forms (Polish).",
        "Tiny type — FourLives 'Default' 9px; mood tap targets ~38px (Polish).",
        "Gate/rate 'errors' return HTTP 200 with {error} — status-only clients fail open (Polish · back).",
      ]} />

      <H2>What's genuinely solid</H2>
      <Bullets dot={D.sage} items={[
        "Anonymity: every peer write is asServiceRole (created_by = service); device hashes in separate namespaces (echo::/witness::/twin::), no cross-surface correlation.",
        "Witness zero-knowledge (FWWT2) is correctly keyless at rest; FWWT1 + plaintext letters still open (clean version detection, additive fields).",
        "Crisis interception consistently wired on Echo + Witness (correct UK resources, never posts). (Twin is the gap — B1.)",
        "Real empty/loading/error states on the parent page, Echo Wall, Sealed Letters, Search, BreakSeal; on-brand cold-start copy.",
        "Editorial token kit well-built; zero emoji anywhere; fluid at 390px.",
        "On-device privacy framing consistent; long-entry caps respected.",
      ]} />

      <Foot>
        Full source + every finding: <strong>claude-state/JOURNAL_AUDIT.html</strong>. Method: 3 parallel deep-inspection passes (back/front/UX+edge) over the whole Journal, every Blocker + High re-verified against the code, + Playwright webkit. Not covered: live entity-permission config (B3 — needs an authed probe), real multi-user concurrency, native screenshot blocking. 32 findings · 3 Blocker · 8 High · 11 Medium · 6 Low · 4 Polish.
      </Foot>
    </DocShell>
  );
}

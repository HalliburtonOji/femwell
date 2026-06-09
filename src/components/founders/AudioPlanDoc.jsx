// AudioPlanDoc — in-app readable mirror of claude-state/AUDIO_TALK_IT_OUT.html.
// FoundersOS dev surface. The Audio / Talk-It-Out feature design.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Badge, Table, Foot, D } from "./DocKit";

export default function AudioPlanDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · New Feature Design · 2026-06-09</Eyebrow>
      <Title sub="Being heard out loud — anonymously, safely, without anyone fixing you. Three modes, one warm room. Mirror of claude-state/AUDIO_TALK_IT_OUT.html.">
        Audio / Talk-It-Out
      </Title>

      <Pull>Sometimes a woman doesn't want to type — she wants to say it out loud and be heard. The spoken sibling of Echo (anonymous lines) and Witness (one held entry).</Pull>

      <Card accent={D.sage}>
        <P><strong>Feasibility verdict.</strong> <Badge tone="green">Mode A (async voice-notes) is buildable in-repo today</Badge> — record in-browser (MediaRecorder) → Base44 file upload → a <code>VoiceNote</code> entity, reusing Echo's anonymity/fade/crisis scaffolding. <Badge tone="red">Modes B &amp; C (live) are NOT possible on Base44 alone</Badge> — live media must route through an external WebRTC provider (rec. LiveKit); Base44 can host the token function, but Halli must create the provider account + keys, the entity, and an OSA risk assessment. <strong>Ship async-first.</strong></P>
      </Card>

      <H2>Two hard truths the design must respect</H2>
      <Bullets dot={D.rose} items={[
        <span><strong>Co-rumination.</strong> Two people rehashing distress without resolution <em>worsens</em> mood; distress is contagious. So a turn-timer + a gentle closing reflection ("what would help this week?") steer toward expressive disclosure, not a doom-loop. A requirement, not a nicety.</span>,
        <span><strong>Live-only kills products.</strong> Clubhouse lost ~93% of engagement; liveness is high-friction. Async is the healthy core; live is an occasional layer.</span>,
      ]} />

      <H2>Mode A — Async voice-notes (ship first)</H2>
      <P>The "voice Echo" — lowest-pressure, healthiest, simplest.</P>
      <Card>
        <P style={{ fontSize: 14 }}><strong>Flow:</strong> record a short note (~60s) → optional voice-mask → on-device STT crisis-scan + cooling-hold → delivered to a phase/interest-matched sister's "held for you" → fades in 48h. The holder sends back one fixed response (the Witness 4 lines) or holds in silence — never a thread.</P>
      </Card>
      <Bullets items={[
        <span><strong>Matching:</strong> phase + life-stage + interest, never self; pull-based claim (like Witness).</span>,
        <span><strong>Anonymity:</strong> device-derived hash + optional voice mask. <em>Honest limit: masking makes a voice harder to recognise, not anonymous — voiceprints can survive naive modulation.</em></span>,
        <span><strong>Safety advantage:</strong> async lets you scan/hold the recording <em>before</em> delivery — STT → the existing text crisis lexicon → route to support if tripped, never deliver.</span>,
        <span><strong>Data:</strong> new <code>VoiceNote</code> entity (audio_url, author_hash, phase, masked, live_at, expires_at, held_by_hash, response_code, hidden) — parallels Echo.</span>,
        <span><strong>Infra:</strong> MediaRecorder → Base44 UploadFile → entity row. No realtime provider. <Badge tone="amber">verify</Badge> confirm Base44 UploadFile accepts audio MIME (10-min spike).</span>,
      ]} />

      <H2>Mode B — 1:1 turn-based "Talk It Out"</H2>
      <P>The talking-stick vent — live, but structured so it can't become advice-giving or cross-talk.</P>
      <Card>
        <P style={{ fontSize: 14 }}><strong>Flow:</strong> charter (once: anonymous · no recording · "hold, don't fix" · 18+) → match a phase/interest sister → turn 1: you talk 3 min, she holds (mic auto-muted, "holding with you") → swap → optional 2nd round → closing reflection → seal (nothing stored). A visible timer per turn; leave / mute / block / report any time; panic-exit ends instantly.</P>
      </Card>
      <Bullets items={[
        "Evidence base: 7 Cups trains every listener and FORBIDS advice; the Samaritans model is 'listen actively, reflect back without adding suggestions' — the literal 'hold, don't fix'.",
        "Safety (audio is harder): no keyword scan in live audio — so crisis safety is human + structural: an always-visible signpost card (Samaritans 116 123 · NHS 111 · Shout 85258 · Mind), one-tap panic-exit, report → instant leave + block. No recording.",
        <span><strong>Infra:</strong> needs LiveKit + a Base44 token function. <Badge tone="amber">needs Halli's provider keys + OSA RA</Badge></span>,
      ]} />

      <H2>Mode C — Small live audio Circles (last)</H2>
      <P>5–8 women, a gentle topic, Jess-seeded — book chat, career vent, "spill it" night. Not clinical-only.</P>
      <Bullets items={[
        "Status-flattened (Peanut Pods model: no stage/podium, everyone equal); audience muted by default; request-to-speak; a host present; listen-only allowed (lurking is full membership); ephemeral, no recording.",
        "Highest moderation + legal burden of the three → ships last.",
      ]} />

      <H2>Realtime infra — the critical dependency</H2>
      <P>Every live mode = React client ⇄ WebRTC media via an external SFU + a backend token function holding the API secret.</P>
      <Table rows={[
        ["Provider", "Token", "Audio free tier", "Fit"],
        ["LiveKit ★", "Stateless JWT — 'ideal for serverless'", "~5,000 part-min/mo", "Excellent; open-source escape hatch"],
        ["Daily", "Meeting token via REST", "~10,000 min/mo", "Excellent, easiest — near-tie"],
        ["Agora", "Token-server RTC token", "~10,000 min/mo", "Good; more to wire"],
        ["Twilio / 100ms / Vonage", "Access / server token", "custom / trial", "Only if already in stack / heavier"],
      ]} />
      <H3>Base44 feasibility verdict</H3>
      <Table rows={[
        ["Piece", "Verdict"],
        ["Async voice-notes (Mode A) end-to-end", "IN-REPO NOW (MediaRecorder → UploadFile → VoiceNote, reuses Echo)"],
        ["LiveKit token function", "IN-REPO (Deno fn signs an AccessToken JWT from secrets)"],
        ["Realtime media (Modes B, C)", "NOT ON BASE44 — must route through the external provider"],
        ["Provider account + API keys", "NEEDS HALLI — the only true blocker for live"],
        ["VoiceNote / TalkSession / AudioRoom entities", "Create via repo .jsonc + sync (the verified free path)"],
        ["OSA risk assessment for live audio", "NEEDS HALLI — before live audio scales"],
      ]} />

      <H2>How it ties to Echo / Witness / Circles</H2>
      <Bullets items={[
        "Echo ↔ Mode A: a voice-note is 'an echo you can hear' — same anonymity, fade, crisis, hold-don't-reply ethos.",
        "Witness ↔ Mode B: Talk-It-Out is Witness in voice — one held entry becomes one held conversation; the 4 fixed responses carry over.",
        "Circles ↔ Mode C: a live room is a Circle's voice session — dating/career/book/vent topics, not clinical-only.",
        "Jess hosts/seeds prompts and scaffolds the closing reflection; never records or advises clinically.",
      ]} />

      <H2>UK legal note</H2>
      <P>The OSA contemplates voice + text chat. A truly peer-to-peer 1:1 live call <em>may</em> be exempt — but routing through a provider SFU likely brings it in scope. So <strong>do not assume the 1:1 exemption applies</strong> — a written illegal-content risk assessment is the safe default before live audio carries real traffic (Halli, as named accountable person).</P>

      <Foot>
        Mirror of <strong>claude-state/AUDIO_TALK_IT_OUT.html</strong> · sources: 7 Cups/Samaritans (listening), co-rumination &amp; Clubhouse post-mortems, Peanut Pods, V-Cloak/VoicePM (voice-mask limits), LiveKit/Daily/Agora + Base44 docs, OSA explainer. Recommended phasing: async → 1:1 → live Circles.
      </Foot>
    </DocShell>
  );
}

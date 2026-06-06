// JournalPlanDoc — the master plan for FemWell's Journal feature.
//
// Synthesises four design demos (journal_demo, journal_community_v2,
// journal_sharing_concepts, journal_sharing_deep), the current
// production code state, and external best-practice research into one
// coherent direction. Lives at /Ideas → Journal Plan tab.
//
// Structure follows the ResearchView pattern: hero · principles ·
// surface inventory · feature catalog · reconciliations · evidence
// base · rollout ladder · open questions · risks.

import React, { useState } from "react";

// Local tokens — mirror the RX palette used by ResearchView.
const J = {
  cream:       "#F4EDDB",
  creamWarm:   "#FBF6E6",
  paper:       "#F8F2E4",
  paperHi:     "#F4EFE3",
  espresso:    "#3A2C1A",
  espressoMid: "#6B5840",
  plum:        "#4A2A3A",
  plumMid:     "#7B5E6B",
  rose:        "#D45E52",
  gold:        "#C9A95C",
  goldDeep:    "#A6862B",
  sage:        "#6B8F5A",
  blush:       "#E8B4B8",
  rule:        "rgba(58,44,26,0.10)",
  // Gradient stops for the solitude → witness ladder.
  g1: "#5E7C5A", // solo
  g2: "#A6862B", // light
  g3: "#C17B4E", // mid
  g4: "#8B2635", // deep
  g5: "#4A2A3A", // deepest
};

const eyebrow = {
  fontSize: 10,
  letterSpacing: "0.20em", textTransform: "uppercase",
  fontWeight: 700, color: J.espressoMid,
};
const subEyebrow = {
  fontSize: 9,
  letterSpacing: "0.20em", textTransform: "uppercase",
  fontWeight: 700, color: J.goldDeep, margin: "16px 0 8px",
};
const card = {
  background: J.creamWarm, borderRadius: 14,
  border: `1px solid ${J.rule}`, padding: "16px 18px",
  marginTop: 14,
};
const h2 = {
  fontSize: 24, fontWeight: 500, color: J.espresso,
  letterSpacing: "-0.015em", margin: "32px 0 4px", lineHeight: 1.2,
};
const introP = {
  fontSize: 13.5,
  color: J.espressoMid, marginTop: 6, lineHeight: 1.55,
};

function Bullet({ children, dotColor = J.gold }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: J.espresso, lineHeight: 1.5 }}>
      <span style={{ width: 5, height: 5, borderRadius: 9999, background: dotColor, marginTop: 8, flexShrink: 0 }} />
      <span>{children}</span>
    </li>
  );
}

function NumberedItem({ idx, children }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <span style={{
        width: 24, height: 24, borderRadius: 9999, background: J.plum, color: J.cream,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontStyle: "italic",
        fontSize: 12, fontWeight: 600, flexShrink: 0,
      }}>{idx + 1}</span>
      <span style={{ flex: 1, fontSize: 13.5, color: J.espresso, lineHeight: 1.5, paddingTop: 2 }}>{children}</span>
    </li>
  );
}

function Pull({ children }) {
  return (
    <blockquote style={{
      margin: "18px 0 0", padding: "14px 16px",
      background: J.cream, borderRadius: 10,
      borderLeft: `3px solid ${J.gold}`,
      fontStyle: "italic",
      fontSize: 14, color: J.plum, lineHeight: 1.55,
    }}>{children}</blockquote>
  );
}

// ------------------------------------------------------------
// Data — all content tables for the doc.
// ------------------------------------------------------------

const FOUR_DEMOS = [
  {
    file: "femwell_journal_demo.html",
    label: "The baseline",
    one_line: "Phase-aware, private-by-default writer. Solo only. Jess curates, never reads without invitation.",
    surface: "Hero prompt · Tonight carousel · 4 compose modes · 6 threads · gentle pattern heat strip · tonight reflection · unpack-with-Jess · locked footer.",
  },
  {
    file: "femwell_journal_community_v2.html",
    label: "Journal + Community as one system",
    one_line: '"Journal owns the writer. Community owns the peer shapes." One entry can flow through both.',
    surface: "Cycle Mirror · Sealed Letters · anniversary surfacing · Share-as-Echo slot · Send-to-Witness slot · Echo Wall · Witness dock · Phase Twin · handoff diagram.",
  },
  {
    file: "femwell_journal_sharing_concepts.html",
    label: "Five concepts on a gradient",
    one_line: "Solitude → Witness ladder. Five concepts walk the user along it as trust builds.",
    surface: "01 Echo Wall · 02 Sealed Letters · 03 Cycle Mirror · 04 Witness Mode · 05 Phase Twin. Each with 2 phone mocks + LD notes.",
  },
  {
    file: "femwell_journal_sharing_deep.html",
    label: "Deep dive — ship rules",
    one_line: '"Ship the solo features now. Earn the paired ones." Full flows, base44 entities, moderation rails, quarterly ladder.',
    surface: "Jess scrub · cooling pause · crisis intercept · screenshot block · receiver strikes · rate limits · fade defaults · deletion cascade · letter threads · witness gate.",
  },
];

const PRINCIPLES = [
  "Locked to you. Always. Encrypted on-device, never on a server unencrypted. Jess reads an entry only when handed to her.",
  "Solo before social. Cycle Mirror and Sealed Letters earn the trust that Echo Wall, Witness, and Phase Twin spend.",
  "Anonymity is the default for any peer surface; Jess scrubs names, places, dates, substances before anything leaves the device.",
  "Reactions are emotional, not transactional. The lexicon: same · hold · hear you · saved. No like. No emoji pile-on. No follow.",
  "Phase-aware copy across the board — luteal voice, follicular voice, ovulatory voice, menstrual voice. Fraunces italic for the human; Inter for chrome.",
  "Evidence-informed, never clinical promise. Pennebaker, Neff and Narrative Exposure Therapy as a bibliography, not a marketing line.",
  "No emoji codepoints anywhere in the surface. Lucide icons + custom SVG only. (Live JotterCard breaks this rule today — first fix on the ledger.)",
  "Cycle-count rhythm, never streak shame. \"4 entries this cycle — you're building a pattern\" beats \"21-day streak\" every time for cyclical women.",
];

const SURFACE_INVENTORY = [
  { surface: "Journal route shell", live: "✓", direction: "Keep — but reframe header from streak to phase + cycle day + italic seasonal line.", gap: "Header is utilitarian; demo header is hero-grade." },
  { surface: "Compose / new entry", live: "✓", direction: "Keep type picker + type-aware form. Add 4-mode strip (Write · Voice · One-line · Guided). Strip emoji from picker.", gap: "Emoji throughout. No voice. No one-line mode. No celebration screen." },
  { surface: "Entry card (JotterCard)", live: "✓", direction: "Keep sticky-note metaphor + tilt + colours. Strip emoji from type pill + mood. Replace with Lucide icons.", gap: "Emoji on every card violates brand rule." },
  { surface: "Filter pills", live: "✓", direction: "Keep, but add `affirmation` (schema has it; filter row doesn't).", gap: "1 filter missing from a 7-type schema." },
  { surface: "Insights tab", live: "✓ (LLM)", direction: "Keep as-is. Already the most polished surface — has real cycle × mood chart, 7-day rhythm, top tags, LLM weekly reflection.", gap: "None significant — minor copy passes." },
  { surface: "Phase prompt carousel", live: "✗", direction: "Add — 5-prompt carousel under header, phase-tinted accent, ◀▶ + dots.", gap: "Live route surfaces prompts only inside the textarea." },
  { surface: "Today / Tonight reflection", live: "✗", direction: "Add — dusk close-out card, 90-second prompt, phase-aware.", gap: "Demo's signature closing ritual." },
  { surface: "Unpack with Jess", live: "✗", direction: "Add — \"talk it out, still locked\" CTA from the entry detail.", gap: "Demo has it as the bridge between writer and AI; live has nothing." },
  { surface: "Cycle Mirror (On This Day)", live: "✗", direction: "Add — up to 5 past entries on same cycle day, Jess gloss, \"Reply to past-you\" CTA.", gap: "Highest-value solo feature missing." },
  { surface: "Sealed Letters", live: "✗", direction: "Add — future-me / cross-phase / anniversary. Friction-as-feature: can't open early.", gap: "Entire surface missing." },
  { surface: "Echo Wall", live: "✗", direction: "Add (Q2) — Community-side rail of anonymous one-liners, hold only.", gap: "Community surface; needs scrubber + cooling pause to ship." },
  { surface: "Witness Mode", live: "✗", direction: "Add (Q3) — single shared entry to one matched sister; 4 fixed responses.", gap: "Requires pairing engine + 3 strikes + crisis intercept." },
  { surface: "Phase Twin", live: "✗", direction: "Add (Q4) — 12-day pairing with shared daily prompt; reply blurred until you write.", gap: "Hardest infra; ships last." },
];

const FIVE_CONCEPTS = [
  {
    pos: 1,
    color: J.g1,
    label: "Cycle Mirror",
    one_line: "Past-you as witness.",
    body: "Up to 5 past entries on the same cycle day, surfaced in-line with a Jess gloss. Secondary views: same phase / same thread / one year ago / same mood. Lives inside Journal — never leaves the device.",
    moat: "No tracker app surfaces your own history this way. Stardust explains phases prettily; nobody mirrors your own writing back to you.",
    copy: '"You\'ve been here before. Your body is consistent. You\'re not imagining it."',
    quarter: "Q1 — solo, ship first",
  },
  {
    pos: 2,
    color: J.g2,
    label: "Sealed Letters",
    one_line: "You, across time.",
    body: "Letters to future-you, unlocking by date, phase, or anniversary. Three flavours: future-me / cross-phase / anniversary drop. Encrypted client-side until the unlock date — even Jess can't peek. Letter library tabs: sealed · opened · threads.",
    moat: "Day One pioneered the encrypted-then-revealed journal entry. No women's app has built it phase-anchored.",
    copy: '"Sealed, encrypted, unreadable until next follicular. Not even Jess can peek."',
    quarter: "Q1 — solo, ship first",
  },
  {
    pos: 3,
    color: J.g3,
    label: "Echo Wall",
    one_line: "A room of one-liners.",
    body: "Anonymous one-line entries from women in the same phase, holding only (no replies, no DMs). Fades on a default window. Jess scrubs identifying content on-device before any echo leaves.",
    moat: "Clue publishes phase statistics; Flo runs topic chat. Nobody runs a phase-cohort one-line feed with hold-only reactions. This is the highest-leverage differentiating play.",
    copy: '"Five women on luteal d18–20 wrote something one line long, this hour."',
    quarter: "Q2 — light social, after solo trust earned",
  },
  {
    pos: 4,
    color: J.g4,
    label: "Witness Mode",
    one_line: "Read this. Hold it.",
    body: "Single entry handed to one matched sister. 4 fixed responses or pass silently. No thread. No chat. No screenshot. Writer can cancel before she reads. Receiver picks one line — never her own words.",
    moat: "The pattern doesn't exist commercially. It's the answer to \"I need to be heard, I don't need a conversation\" — the most common emotional state in the luteal data.",
    copy: '"I\'m holding this with you."',
    quarter: "Q3 — paired, requires witness-gate + 3 strikes",
  },
  {
    pos: 5,
    color: J.g5,
    label: "Phase Twin",
    one_line: "Twelve days. One shape.",
    body: "Seasonal 12-day pairing with another woman in the same phase + life stage. One shared prompt a day. Her answer blurred until you write yours. Container closes at next period day 1; no re-entry that cycle.",
    moat: "BabyCenter cohorts by due date; nobody cohorts by phase for a finite ritual. Closest analogue is Strava beacon — a contained, time-bound, shared experience without an open chat surface.",
    copy: '"A 12-day container. Not a friendship."',
    quarter: "Q4 — deepest pairing, last to ship",
  },
];

const RECONCILIATIONS = [
  {
    name: "Echo fade window",
    a: "v2 demo: 47h / 48h",
    b: "deep demo: 7 days",
    decision: "48h ships first (more protective; lower retention pressure on the writer). Move to 7d only after 3 cycles of cohort data show no harm pattern.",
  },
  {
    name: "Holds count visibility",
    a: "v2 demo: public count on each echo (\"Held · 118\")",
    b: "concepts demo: private to writer only",
    decision: "Private to writer only. A public count creates ranking incentives the brand can't carry. Writer sees count in their own journal; readers see the hold gesture only as their own.",
  },
  {
    name: "Witness re-route on no-response",
    a: "v2: re-routes once after 6h",
    b: "deep: silent on re-route, adds 2h cancellation",
    decision: "Both. 2h writer cancellation window. If receiver doesn't open within 6h, route to one fallback receiver with a small \"this was sent on after waiting\" note. After that, archive to the writer's letter library.",
  },
  {
    name: "Letter threading",
    a: "v2: single-shot letters",
    b: "deep: cross-phase reply threads (luteal-you → follicular-you reply)",
    decision: "v1 ships single-shot. v2 of Sealed Letters adds threading once the single-shot pattern has 3 cycles of usage data — threading is a complexity tax until the base behaviour proves out.",
  },
  {
    name: "Cultural names in seed data",
    a: "v2 + concepts: Naija-coded sample names (Amara O., Funmi A., Oji)",
    b: "Locked UK market context",
    decision: "Sweep seed/sample names to a UK-balanced set during the build pass. Echo Wall is anonymous in production, so this only affects the demo strings — but it sets the brand register.",
  },
];

const EVIDENCE_BASE = [
  { source: "Pennebaker — expressive writing", line: "100+ studies, d ≈ 0.16 overall. 15–20 min over 3–4 sessions reduces anxiety, improves immune markers. Framing — emotion acceptance over solution-seeking — matters more than duration." },
  { source: "Neff — self-compassion", line: "Three components (self-kindness · common humanity · mindfulness). The common-humanity leg is the academic justification for cycle-cohort framing (Echo Wall, Phase Twin)." },
  { source: "Narrative Exposure Therapy", line: "18 RCTs supporting effectiveness for complex trauma. VA recognises expressive writing as evidence-based for PTSD. Sealed Letters can carry NET-shaped prompts for grief, miscarriage, birth trauma." },
  { source: "CHI 2024 — post-Roe privacy", line: "Women's top fear is government/law-enforcement access to cycle data. Visible privacy beats invisible privacy. \"Privacy not included\" labels are now a brand-trust gate." },
  { source: "Vulnerability-Amplifying Interaction Loops (2025)", line: "Names the failure mode where chatbot supportiveness aligns with mechanisms that sustain a user's vulnerability — the sycophancy trap. Jess must observe, not companion." },
];

const COMPETITIVE_READ = [
  { app: "Stardust", strength: "Phase-aware voice in copy; engagement-grade.", gap: "No real journal surface. Clinical depth + inclusivity criticised." },
  { app: "Moody Month", strength: "Audio journaling already exists in a cycle app.", gap: "Buried in UI; reports lean dashboard not narrative." },
  { app: "Clue", strength: "Phase Insights publishes anonymous aggregated phase data.", gap: "Framed as stats, not belonging. Journal is a notes field." },
  { app: "Flo", strength: "Anonymous Secret Chats; diary function.", gap: "Subscription-gated; paywall pop-ups in diary; topic-keyed not phase-keyed." },
  { app: "Day One", strength: "End-to-end AES-256, biometric, per-journal conceal toggles.", gap: "Not phase-aware; no women's framing." },
  { app: "Stoic", strength: "Template variety — therapy prep, CBT, dream, gratitude.", gap: "Not phase-aware; stoic-male register; no peer surface." },
  { app: "Reflectly", strength: "Claims CBT.", gap: "CBT theatre — no actual lessons. Cautionary tale on \"clinical\" marketing." },
  { app: "Ovia", strength: "Auto-anchored entries (date + week of pregnancy as scaffold).", gap: "Pregnancy only." },
  { app: "BabyCenter", strength: "Birth Club cohort-by-due-date; Bumpie time-lapse.", gap: "Pregnancy only; doesn't translate to cyclical cohorts as-is." },
];

const ROLLOUT = [
  {
    title: "Now",
    subtitle: "Cleanup before any new surface ships",
    color: J.rose,
    items: [
      "Strip emoji from JotterCard (TYPE_META) and NewEntrySheet (MOOD_EMOJI) — Lucide icons only.",
      "Add `affirmation` to the filter pill row (schema already supports it).",
      "Decide fate of orphan files: JournalEntrySheet · JournalEntryCard · JournalComposer. Keep one, delete the other two.",
      "Header reframe: streak line → LUTEAL · INNER AUTUMN · Day 9 of 12 + italic seasonal line.",
      "Rhythm card reframe: \"X-day streak\" → \"X entries this cycle — you're building a pattern.\"",
    ],
  },
  {
    title: "Q1",
    subtitle: "Solo features — earn the trust",
    color: J.sage,
    items: [
      "Phase Prompt Carousel — 5 phase-tuned prompts under header, ◀▶ + dots, phase-tinted accent.",
      "Cycle Mirror — On-This-Day card: up to 5 past entries on the same cycle day, expandable, with Jess gloss + Reply-to-past-self CTA.",
      "Sealed Letters v1 — single-shot future-me letters; date / phase / anniversary unlock; encrypted client-side; letter library tabs: sealed · opened.",
      "Tonight's Reflection card — dusk close-out, 90s, phase-aware prompt.",
      "Unpack with Jess — \"talk it out, still locked\" surface from any entry; uses existing InvokeLLM, no server retention.",
    ],
  },
  {
    title: "Q2",
    subtitle: "Light social — anonymous, fading, hold-only",
    color: J.gold,
    items: [
      "Echo Wall — anonymous one-liner feed, scoped by phase; fades 48h; hold-only reaction; rate limit 5 echoes/day.",
      "Share-as-Echo slot — inline opt-in inside Journal; Jess offers one shareable line; cooling pause defaults on for late luteal.",
      "Jess scrub pipeline — regex + on-device LLM strip of names, places, dates, substances before any post leaves.",
      "Crisis intercept — keyword + context model on-device routes to Panic Mode + UK NHS / Samaritans / Mind resources.",
      "Hold count visible to writer only in their own journal.",
    ],
  },
  {
    title: "Q3",
    subtitle: "Paired — earned, gated, one-shot",
    color: J.g3,
    items: [
      "Witness Mode — single entry handed to one matched sister; 4 fixed responses or pass; writer cancels within 2h; receiver opens within 6h or routes once.",
      "Witness gate — \"held 3 before you send.\" Pay-it-forward; prevents drive-by senders.",
      "3-strike receiver policy — screenshot attempts, ignored entries, or rule-breaks remove from receiver pool.",
      "FLAG_SECURE (Android) + iOS capture prevention on Witness receiver view.",
      "Pairing engine — phase + life-stage + language match; no profile, no handle, no carry-over.",
    ],
  },
  {
    title: "Q4",
    subtitle: "Deepest pairing — contained, finite, ritual",
    color: J.plum,
    items: [
      "Phase Twin — 12-day pairing; shared daily prompt; twin's answer blurred until you write yours; archive read-only at day 12.",
      "Container rules — opens at matching, closes at next period day 1, no re-entry that cycle.",
      "Sealed Letters v2 — letter threads (luteal → follicular reply → follicular reply etc).",
      "Anniversary surfacing — \"a year ago today\" card with auto-generated write-back letter prompt.",
      "Voice-first compose — on-device Whisper-small transcription for luteal-phase / caregiving days.",
    ],
  },
];

const OPEN_QUESTIONS = [
  "Where does the Echo Wall live — inside Journal as a tab, or in Community as a rail? (Provisional: Community-side rail with a Journal-side opt-in slot.)",
  "Phase scope for Echo Wall cohorts — exact phase day, +/-1 day window, or whole phase? Smaller windows = more resonance, less density.",
  "Letter library threading — sealed / opened / threads tabs from day 1, or sealed + opened only and add threads in v2?",
  "Voice transcription pipeline — on-device Whisper-small (heavier bundle, true privacy) or Apple/Google on-device (smaller, platform-locked)?",
  "Crisis intercept escalation — auto-disable peer surfaces for 24h after intercept fires, or surface a soft toggle?",
  "Tier 4 paywall hook — does Cycle Mirror's secondary views (same thread / one year ago / same mood) sit behind Plus, or all free?",
  "Onboarding sequence — does the user pick a sharing comfort level during onboarding, or earn surfaces as they accumulate entries?",
  "Naming — is it \"Witness\" or \"Hold\"? The deep file uses Witness Mode; the gesture is hold. Decide once and sweep.",
];

const RISKS = [
  {
    name: "AI companion drift",
    body: "Jess is observer, not friend. If she gets praised, named, anthropomorphised, the Replika failure mode is one product cycle away. Anti-pattern: \"Hi, I'm Jess, I missed you today.\" Right pattern: \"You wrote about sleep on 4 of 5 luteal d19s.\"",
  },
  {
    name: "Privacy theatre",
    body: "Brand promises encryption — must deliver. If we ship \"locked to you\" with cleartext server logs, one screenshot ends the brand. Day One's documented AES-GCM-256 is the public bar to clear.",
  },
  {
    name: "Public-feed creep",
    body: "Every social mechanic eventually grows a follow button. The brand requires hard rules: no handles, no threads, no DMs, no like, no leaderboard, no \"most relatable.\" Echo Wall and Witness die the moment they grow conversation.",
  },
  {
    name: "Streak shame",
    body: "Cyclical women don't write equally across the cycle. A streak counter punishes follicular days. Cycle-count rhythm (\"X entries this cycle\") is the only honest metric.",
  },
  {
    name: "Cultural mis-register",
    body: "UK market is locked. Sample names, examples, NHS / Samaritans / Mind links must be UK-local. Sweep sample data; never lean Naija-coded or US-coded.",
  },
  {
    name: "Clinical promise",
    body: "Pennebaker, Neff, NET in the bibliography; never in marketing. \"Evidence-informed\" is the ceiling. Promising depression / anxiety reduction crosses MHRA territory in the UK.",
  },
];

const HERO_QUOTES = [
  "Locked to you. Always.",
  "Same phase, same day — across time.",
  "You've been here before. Your body is consistent. You're not imagining it.",
  "A 12-day container. Not a friendship.",
  "I'm holding this with you.",
  "You can hold someone when you've been held.",
  "One thing your body carried today — name it, thank it, close the book.",
  "A room of one-liners. No handles, no threads, just sisters holding sentences.",
  "This sounds heavy. A peer isn't the right shape for tonight. You deserve more than a sister can hold. Not less. More.",
  "A thread is forming. Four phases, four letters. This is you becoming a witness to yourself.",
];

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function JournalPlanDoc() {
  const [openConcept, setOpenConcept] = useState(1);
  const [openRec, setOpenRec] = useState(null);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "8px 16px 80px" }}>

      {/* ============ Hero ============ */}
      <header style={{ paddingTop: 28 }}>
        <div style={eyebrow}>Master plan · Journal · May 2026</div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 500, color: J.espresso, letterSpacing: "-0.022em",
          margin: "10px 0 0", lineHeight: 1.1,
        }}>
          The journal is the<br/>
          <em style={{ color: J.plum }}>loneliest page in FemWell.</em><br/>
          Let&apos;s give it shape.
        </h1>
        <p style={{
          fontSize: 14,
          color: J.espressoMid, marginTop: 14, lineHeight: 1.55,
        }}>
          Four design demos, the live production code, and external best practice — all
          combined into one direction. Journal owns the writer. Community owns the peer
          shapes. The five concepts (Cycle Mirror · Sealed Letters · Echo Wall · Witness ·
          Phase Twin) walk a user along a <strong>solitude → witness gradient</strong> as trust
          builds. We ship the solo features first, earn the paired ones.
        </p>
        <Pull>
          Journal gets the depth. Community earns the proximity.
        </Pull>
      </header>

      {/* ============ The four demos, at a glance ============ */}
      <h2 style={h2}>The four demos, at a glance</h2>
      <p style={introP}>Inputs to this plan, in chronological order of creation.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {FOUR_DEMOS.map((d, i) => (
          <article key={d.file} style={{
            background: J.creamWarm, borderRadius: 12, border: `1px solid ${J.rule}`,
            padding: "14px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontStyle: "italic",
                fontSize: 14, color: J.gold, fontWeight: 500,
              }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{
                fontSize: 17,
                fontWeight: 500, color: J.espresso,
              }}>{d.label}</span>
            </div>
            <div style={{
              fontSize: 10,
              fontWeight: 700, color: J.espressoMid, letterSpacing: "0.04em",
              marginTop: 2,
            }}>{d.file}</div>
            <p style={{
              fontStyle: "italic", fontSize: 13.5,
              color: J.plum, marginTop: 8, lineHeight: 1.5,
            }}>{d.one_line}</p>
            <p style={{
              fontSize: 12.5,
              color: J.espressoMid, marginTop: 6, lineHeight: 1.5,
            }}>{d.surface}</p>
          </article>
        ))}
      </div>

      {/* ============ Principles ============ */}
      <h2 style={h2}>What&apos;s locked</h2>
      <p style={introP}>Direction-defining principles. Every shipped feature must sit inside these.</p>
      <section style={card}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {PRINCIPLES.map((p, i) => <NumberedItem key={i} idx={i}>{p}</NumberedItem>)}
        </ul>
      </section>

      {/* ============ Surface inventory ============ */}
      <h2 style={h2}>Where we are today</h2>
      <p style={introP}>
        Every Journal surface, mapped: what&apos;s live, what the demos call for, and the
        gap that separates them. Plain-language audit so the build queue is obvious.
      </p>
      <div style={{
        background: J.creamWarm, borderRadius: 14,
        border: `1px solid ${J.rule}`, marginTop: 16, overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1.4fr 0.5fr 1.8fr",
          padding: "10px 14px", borderBottom: `1px solid ${J.rule}`,
          fontSize: 10, letterSpacing: "0.10em", fontWeight: 700,
          color: J.espressoMid, textTransform: "uppercase",
        }}>
          <span>Surface</span><span style={{ textAlign: "center" }}>Live</span><span>Direction</span>
        </div>
        {SURFACE_INVENTORY.map((row, i) => (
          <div key={row.surface} style={{
            display: "grid", gridTemplateColumns: "1.4fr 0.5fr 1.8fr",
            padding: "12px 14px",
            borderBottom: i === SURFACE_INVENTORY.length - 1 ? "none" : `1px solid ${J.rule}`,
            alignItems: "start", gap: 8,
          }}>
            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 500, color: J.espresso, lineHeight: 1.3,
              }}>{row.surface}</div>
              <div style={{
                fontSize: 11,
                color: J.espressoMid, marginTop: 3, lineHeight: 1.45, fontStyle: "italic",
              }}>{row.gap}</div>
            </div>
            <div style={{ textAlign: "center", paddingTop: 2 }}>
              <span style={{
                display: "inline-block", width: 22, height: 22, borderRadius: 9999,
                background: row.live === "✓" || row.live.startsWith("✓") ? J.sage : J.rule,
                color: row.live === "✓" || row.live.startsWith("✓") ? J.cream : J.espressoMid,
                fontSize: 12, fontWeight: 700,
                lineHeight: "22px",
              }}>{row.live === "✓ (LLM)" ? "L" : row.live}</span>
            </div>
            <div style={{
              fontSize: 12.5,
              color: J.espresso, lineHeight: 1.5,
            }}>{row.direction}</div>
          </div>
        ))}
      </div>

      {/* ============ The Solitude → Witness gradient ============ */}
      <h2 style={h2}>The solitude → witness gradient</h2>
      <p style={introP}>
        The five concepts aren&apos;t competing — they form a ladder. A user walks along
        it as trust accumulates. Tap each to expand.
      </p>

      {/* Visual gradient strip */}
      <div style={{ display: "flex", marginTop: 18, borderRadius: 9999, overflow: "hidden", height: 14, border: `1px solid ${J.rule}` }}>
        {FIVE_CONCEPTS.map((c) => (
          <div key={c.label} style={{ flex: 1, background: c.color }} />
        ))}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: 8,
        fontSize: 10,
        color: J.espressoMid, letterSpacing: "0.10em", fontWeight: 700,
        textTransform: "uppercase",
      }}>
        <span>Solo</span><span>Witness</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {FIVE_CONCEPTS.map((c) => {
          const open = openConcept === c.pos;
          return (
            <article key={c.label} style={{
              background: J.creamWarm, borderRadius: 14,
              border: `1px solid ${J.rule}`,
              borderLeft: `3px solid ${c.color}`,
              overflow: "hidden",
            }}>
              <button
                onClick={() => setOpenConcept(open ? null : c.pos)}
                aria-expanded={open}
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "transparent", border: "none",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 9999, background: c.color,
                  color: J.cream, display: "inline-flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                  fontStyle: "italic",
                  fontSize: 13, fontWeight: 600,
                }}>{c.pos}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 500, color: J.espresso, fontStyle: "italic",
                  }}>{c.label}</div>
                  <div style={{
                    fontStyle: "italic", fontSize: 12.5,
                    color: J.plumMid, marginTop: 2,
                  }}>{c.one_line}</div>
                </div>
                <span aria-hidden="true" style={{
                  fontSize: 14,
                  color: J.espressoMid, fontWeight: 700,
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}>▾</span>
              </button>
              {open && (
                <div style={{ padding: "0 18px 18px" }}>
                  <p style={{
                    fontSize: 13.5,
                    color: J.espresso, lineHeight: 1.55, margin: 0,
                  }}>{c.body}</p>

                  <div style={subEyebrow}>Why it&apos;s a moat</div>
                  <p style={{
                    fontSize: 12.5,
                    color: J.espressoMid, lineHeight: 1.55, margin: 0,
                  }}>{c.moat}</p>

                  <div style={subEyebrow}>Voice</div>
                  <blockquote style={{
                    margin: 0, padding: "10px 12px", background: J.cream, borderRadius: 8,
                    fontStyle: "italic", fontSize: 13,
                    color: J.plum, lineHeight: 1.5,
                  }}>{c.copy}</blockquote>

                  <div style={{
                    display: "inline-block", marginTop: 12,
                    padding: "4px 10px", borderRadius: 9999,
                    background: c.color, color: J.cream,
                    fontSize: 10,
                    fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>{c.quarter}</div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* ============ Reconciliations ============ */}
      <h2 style={h2}>The reconciliations</h2>
      <p style={introP}>
        Where the four demos disagree — and what we picked. Decisions made here so a build
        agent never has to choose at the keyboard.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {RECONCILIATIONS.map((r, i) => {
          const open = openRec === i;
          return (
            <article key={r.name} style={{
              background: J.paperHi, borderRadius: 12,
              border: `1px solid ${J.rule}`,
              padding: "12px 14px",
            }}>
              <button onClick={() => setOpenRec(open ? null : i)} style={{
                background: "transparent", border: "none", padding: 0,
                width: "100%", textAlign: "left", cursor: "pointer",
                display: "flex", alignItems: "baseline", gap: 8,
              }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700, color: J.rose, letterSpacing: "0.10em",
                  textTransform: "uppercase", flexShrink: 0,
                }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{
                  fontSize: 15,
                  fontWeight: 500, color: J.espresso, flex: 1,
                }}>{r.name}</span>
                <span style={{ color: J.espressoMid, fontSize: 12 }}>{open ? "▾" : "▸"}</span>
              </button>
              {open && (
                <div style={{ marginTop: 10, fontSize: 12.5, color: J.espresso, lineHeight: 1.5 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div style={{ background: J.cream, borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ ...eyebrow, fontSize: 9, color: J.gold }}>Demo A</div>
                      <div style={{ marginTop: 4 }}>{r.a}</div>
                    </div>
                    <div style={{ background: J.cream, borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ ...eyebrow, fontSize: 9, color: J.gold }}>Demo B</div>
                      <div style={{ marginTop: 4 }}>{r.b}</div>
                    </div>
                  </div>
                  <div style={{
                    background: J.plum, color: J.cream, padding: "10px 12px",
                    borderRadius: 8, lineHeight: 1.5,
                  }}>
                    <div style={{ ...eyebrow, fontSize: 9, color: J.gold, marginBottom: 6 }}>Decision</div>
                    {r.decision}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* ============ Evidence base ============ */}
      <h2 style={h2}>The evidence base</h2>
      <p style={introP}>
        The literature behind the design. Evidence-informed, never clinical promise. These
        names belong in the bibliography of any spec, not in the marketing copy.
      </p>
      <section style={card}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {EVIDENCE_BASE.map((e) => (
            <li key={e.source} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{
                fontSize: 14,
                fontWeight: 600, color: J.espresso,
              }}>{e.source}</span>
              <span style={{
                fontSize: 12.5,
                color: J.espressoMid, lineHeight: 1.55,
              }}>{e.line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ Competitive read ============ */}
      <h2 style={h2}>What no one does yet</h2>
      <p style={introP}>
        Every major app in this category has under-built journaling. That&apos;s the gap.
        The opportunity is at the intersection of <em>phase-aware prompts × cohort
        common-humanity × visible privacy</em> — and none of these apps occupies that
        triangle.
      </p>
      <div style={{
        background: J.creamWarm, borderRadius: 14, border: `1px solid ${J.rule}`,
        marginTop: 16, overflow: "hidden",
      }}>
        {COMPETITIVE_READ.map((c, i) => (
          <div key={c.app} style={{
            padding: "10px 14px",
            borderBottom: i === COMPETITIVE_READ.length - 1 ? "none" : `1px solid ${J.rule}`,
            display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: 10,
            alignItems: "start",
          }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600, color: J.espresso,
            }}>{c.app}</div>
            <div style={{
              fontSize: 12,
              color: J.sage, lineHeight: 1.5,
            }}><strong>Borrow:</strong> {c.strength}</div>
            <div style={{
              fontSize: 12,
              color: J.rose, lineHeight: 1.5,
            }}><strong>Gap:</strong> {c.gap}</div>
          </div>
        ))}
      </div>

      {/* ============ Rollout ladder ============ */}
      <h2 style={h2}>The rollout ladder</h2>
      <p style={introP}>
        Runway: 6-month sale window, 9-month soft cap. The Now list is hygiene; Q1 is the
        new chrome users feel; Q2 is the first social move; Q3 and Q4 are the moat.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        {ROLLOUT.map((r) => (
          <article key={r.title} style={{
            background: J.creamWarm, borderRadius: 14, border: `1px solid ${J.rule}`,
            borderTop: `3px solid ${r.color}`, padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <div style={{
                fontSize: 26,
                fontWeight: 500, color: r.color, fontStyle: "italic",
              }}>{r.title}</div>
              <div style={{
                fontSize: 11,
                color: J.espressoMid, letterSpacing: "0.04em",
                flex: 1, minWidth: 0,
              }}>{r.subtitle}</div>
            </div>
            <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {r.items.map((it, i) => <Bullet key={i} dotColor={r.color}>{it}</Bullet>)}
            </ul>
          </article>
        ))}
      </div>

      {/* ============ Open questions ============ */}
      <h2 style={h2}>Open questions</h2>
      <p style={introP}>To resolve before the build agent starts each surface.</p>
      <section style={card}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {OPEN_QUESTIONS.map((q, i) => <NumberedItem key={i} idx={i}>{q}</NumberedItem>)}
        </ul>
      </section>

      {/* ============ Risk register ============ */}
      <h2 style={h2}>Risk register</h2>
      <p style={introP}>The ways this goes wrong if we&apos;re not careful.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {RISKS.map((r, i) => (
          <article key={r.name} style={{
            background: J.creamWarm, borderRadius: 10,
            border: `1px solid ${J.rule}`, borderLeft: `2px solid ${J.rose}`,
            padding: "12px 14px",
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700, color: J.rose, letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}>Risk {String(i + 1).padStart(2, "0")}</div>
            <div style={{
              fontSize: 15,
              fontWeight: 500, color: J.espresso, marginTop: 3,
            }}>{r.name}</div>
            <div style={{
              fontSize: 12.5,
              color: J.espressoMid, marginTop: 4, lineHeight: 1.55,
            }}>{r.body}</div>
          </article>
        ))}
      </div>

      {/* ============ Voice — the hero quotes ============ */}
      <h2 style={h2}>The voice</h2>
      <p style={introP}>
        Ten quotable lines that set the register. Short, second-person, ritual-tinged,
        never perky. Read them aloud — if a new piece of copy clashes with this register,
        rewrite the copy, not the register.
      </p>
      <div style={{
        background: J.plum, borderRadius: 14, padding: "20px 22px", marginTop: 16,
      }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {HERO_QUOTES.map((q, i) => (
            <li key={i} style={{
              fontStyle: "italic", fontSize: 14.5,
              color: J.cream, lineHeight: 1.5, opacity: 0.95,
            }}>&ldquo;{q}&rdquo;</li>
          ))}
        </ul>
      </div>

      {/* ============ Footer ============ */}
      <footer style={{
        marginTop: 36, paddingTop: 20, borderTop: `1px solid ${J.rule}`,
        fontSize: 11,
        color: J.espressoMid, lineHeight: 1.55, textAlign: "center",
      }}>
        Synthesis inputs: <code>femwell_journal_demo.html</code> · <code>femwell_journal_community_v2.html</code> · <code>femwell_journal_sharing_concepts.html</code> · <code>femwell_journal_sharing_deep.html</code> · live <code>src/pages/Journal.jsx</code> + <code>JournalEntries</code> · 7 external research threads.
      </footer>
    </div>
  );
}

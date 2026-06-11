// GroupsLibraryGamesDoc — FoundersOS in-app mirror of
// claude-state/GROUPS_LIBRARY_GAMES_BRAINSTORM.html. Research + brainstorm only
// (NO build): a Library room + a Games room + user-creatable Clubs, reconciled
// with the built Circles. Cream/ink editorial, no emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Table, Foot } from "@/components/founders/DocKit";

const IA = ({ children }) => (
  <pre style={{ fontFamily: "ui-sans-serif,system-ui,sans-serif", fontSize: 12, background: "#FBF6E6", border: "1px solid rgba(58,44,26,0.12)", borderRadius: 10, padding: "13px 15px", whiteSpace: "pre", overflowX: "auto", color: "#2E261B", lineHeight: 1.5, margin: "12px 0" }}>{children}</pre>
);

export default function GroupsLibraryGamesDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Community · Research + Brainstorm (NO build)</Eyebrow>
      <Title sub="Reconciling Halli's idea — a Library room, a Games room, and member-creatable groups (book clubs hosted by Jess OR members) — with the Circles already built. Research + thinking only. 2026-06-11.">
        Library, Games &amp; User-Created Groups
      </Title>

      <Card accent="#4A2A3A">
        <Pull>"a room called library and another specifically for games, and specific groups users can create and join and have meaningful conversations… book clubs hosted by Jess or others hosted by users." — Halli</Pull>
        <P>The hardest question isn't "can we build groups" — it's <b>how a member-hosted space sits safely inside an 18+, anonymous-first, UK women's-health app under the Online Safety Act</b>, and <b>how it relates to the curated Circles we shipped</b>. Cited research: claude-state/product-research/user_created_groups_2026-06-11.md.</P>
      </Card>

      <H2>1. Reconciliation — two primitives, one spine</H2>
      <P>Don't merge Circles and user-created groups. They answer different questions and carry different risk:</P>
      <Table rows={[
        ["", "Circles (built)", "Clubs / Groups (new)"],
        ["Answers", "Who you are — identity/experience cohorts", "What you do together — an activity/intention, with specific people"],
        ["Origin", "Curated fixed catalogue (like the rooms)", "Created by a member or by Jess"],
        ["Size/feel", "Large, low-commitment, lurk-first belonging", "Smaller, higher-commitment, ongoing"],
        ["Safety surface", "Safe by construction (no creation/host power)", "The real new risk — member hosting, OSA, abandonment"],
        ["Lifecycle", "Permanent", "Forms → active → dormant → can end"],
      ]} />
      <Card><P><b>Recommendation: two distinct primitives, one shared safety + data spine.</b> Circles stay as built. The new thing is separate. Both ride the same anonymity (author_hash), crisis intercept, moderation, reaction/report tools, and CommunityPost backbone — a group-scoped post is just CommunityPost.group_id, like circle is today.</P></Card>
      <H3>Naming (real UX risk)</H3>
      <P>"Circles" and "Groups" sound identical. Proposed warm, distinct taxonomy:</P>
      <Pull><b>Rooms</b> — the fixed houses Jess keeps. · <b>Circles</b> — who you are. · <b>Clubs</b> — what you do together.</Pull>
      <P>"Clubs" matches the lead use-case (book club, walking club, creativity club). This doc uses <b>Clubs</b> for the new member/Jess-created primitive. <i>(Q1.)</i></P>

      <H2>2. The unified IA</H2>
      <P>Library + Games are fixed Rooms; Book Club becomes a Club living in the Library; the games-master lives in the Games room.</P>
      <IA>{`Community  (18+ gate · crisis intercept on every input)
│
├─ HOME — rooms-as-doors · QOTD · Living Wisdom · "Together this week" pool
│
├─ ROOMS  (fixed · Jess-presided → no abandonment)
│    Lounge · Love · Money · Style · The Lighter Side · Health Corner
│    ├─ LIBRARY (NEW)  → BookReader catalogue + Book Clubs
│    │     • Jess's flagship Book Club (Little Women pillar → a Jess-hosted Club)
│    │     • directory of member-made Book Clubs (Clubs of type "book")
│    └─ GAMES (NEW)    → Jess games-master + light social games
│
├─ CIRCLES (fixed curated cohorts)      —— WHO YOU ARE
│    Life stages · Living with (consent) · Shared loves
│
└─ CLUBS (NEW · member OR Jess-created · hosted)  —— WHAT YOU DO TOGETHER
     book clubs · movement · creativity · stage-buddies · …`}</IA>
      <P>A <b>Club</b> is the one new primitive. A book club is a Club surfaced in the Library; a game night is a Club surfaced in Games. Book Club &amp; Games stop being one-offs and become instances of Rooms + Clubs.</P>

      <H2>3. Library &amp; Games as rooms (low-risk half)</H2>
      <H3>Library</H3>
      <Bullets items={[
        "The existing BookReader catalogue becomes a Room, not a buried link.",
        "Jess's flagship Book Club = today's Book Club pillar (curated pick, Jess intro, trigger warnings, position-gated spoiler-safe checkpoints) reframed as a Jess-hosted Club.",
        "A directory of member-made Book Clubs (Phase C): pick a Library book, set a cadence, others join, progress-gated discussion (Fable spoiler-free chapter rooms + StoryGraph page-locked comments).",
      ]} />
      <H3>Games</H3>
      <Bullets items={[
        "Today's Jess-as-games-master (timed round, aggregate reveal, no winners/scores) gets a proper room.",
        "Light, kind, async social games — would-you-rather, daily one-line prompt — Jess-hosted, aggregate-only, no scoreboards.",
        "Member-run game-nights are a later Club type (Jess-hosted play covers most of the need with none of the member-hosting risk).",
      ]} />
      <Card accent="#6B8F5A"><P><b>Why low-risk:</b> Rooms are fixed + Jess-presided — no user creation, no host powers, no abandonment, no new OSA surface. Library + Games are mostly IA + reusing built pieces (BookReader, Book Club pillar, games-master). Can move before member-created Clubs.</P></Card>

      <H2>4. Member-hosted Clubs — the safety model (the crux)</H2>
      <P><b>Under the OSA, FemWell — not the volunteer host — is liable for everything in a member-run space.</b> Duties apply "regardless of size and composition," no exemption for small/private spaces, and delegating hosting does NOT transfer the duty (Bristows; Ofcom). So: central control, limited supervised host powers.</P>
      <H3>4.1 Auto-moderation always applies — centrally, never delegated</H3>
      <P>Every post/comment in a Club runs the SAME pipeline as the open rooms (crisis intercept → OpenAI moderation + keyword + health allowlist). The host cannot turn it off. Host facilitates; platform is moderator-of-record. (Discord's auto + human + central T&amp;S model.)</P>
      <H3>4.2 Host powers — limited, not unilateral</H3>
      <Table rows={[
        ["A host CAN", "A host CANNOT"],
        ["Set topic, intro, cadence, prompts", "See any member's identity (anonymous even to the host)"],
        ["Pin a message; seed a prompt", "Ban/block a person platform-wide"],
        ["Remove a post from their Club → to the central review queue (not a silent delete)", "Override or disable central auto-moderation"],
        ["Close the Club they created", "Read DMs or export member data"],
      ]} />
      <P>Narrower than Facebook/Discord on purpose — concentrating unvetted unilateral power in one volunteer is the documented host-abuse + abandonment risk (Northwestern; arXiv 2205.14529).</P>
      <H3>4.3 Vetting + friction to create</H3>
      <P><b>Gated at launch: request-to-host, reviewed by Halli</b> (low volume, safest). Later, open with guardrails: host caps (1–2 active Clubs), a cooldown, a one-tap host pledge — never a frictionless create button.</P>
      <H3>4.4 Co-hosts (≥2)</H3>
      <P>Solo hosting → burnout + single-point abandonment; mods prefer teams (arXiv 2205.14529). Nudge two co-hosts; consider requiring above a size threshold. <i>(Q3.)</i></P>
      <H3>4.5 Abandonment — Jess as fallback host</H3>
      <IA>{`forming → active → (no host activity N days) DORMANT → prompt host
      → still dormant → offer co-host hand-off
      → no taker → JESS ADOPTS as caretaker (never un-moderated)
      → zero activity, long window → ARCHIVED (read-only)`}</IA>
      <P>Jess-as-fallback solves the dead-group decay AND the "no qualified host" gap — a move no big platform can make. <i>(Q5.)</i></P>
      <H3>4.6 Reporting &amp; escalation</H3>
      <Bullets items={[
        "Report inside a Club → the same central human review queue (Halli) + de-list/remove/'Removed by Jess' tombstone tools as the open rooms.",
        "A host who misuses power → privileges revoked; Club reassigned to Jess or closed.",
        "Crisis content anywhere in a Club → crisis intercept fires (UK resources).",
      ]} />
      <H3>4.7 Anonymity in small Clubs (k-anonymity)</H3>
      <P>Small Club + 11 life stages + free-text health detail can re-identify a member (k-anonymity). Mitigations:</P>
      <Bullets items={[
        "Minimum viable size (k): a Club stays 'forming' (not discoverable / posts held) until k members — no one is the only PMDD-club member from one town. (What k? — Q6.)",
        "Per-Club namespaced pseudonym: author_hash stable within a Club, salted per-Club → no cross-surface tracking.",
        "On-device scrub warning before posting identifying detail (reuse the Echo scrub); discourage location precision.",
        "Identity link held platform-side only, for safety escalation.",
      ]} />
      <H3>4.8 Privacy taxonomy</H3>
      <P>Mighty-Networks model: <b>Open</b> (discoverable, lurkable) · <b>Closed</b> (discoverable, posts hidden until joined) · <b>Secret</b> (invite-only). <b>Open + Closed at launch only</b> — Secret + anonymity + health is the highest k-anon + hardest-to-moderate combo. <i>(Q4.)</i></P>

      <H2>5. Discovery, join &amp; lifecycle</H2>
      <Bullets items={[
        "Clubs directory (like the Circles directory): browse by type; cards show intro, host, cadence — NO member counts. Join or Lurk.",
        "Lurk-first everywhere — read before committing.",
        "Cross-surfacing: book Clubs in the Library; movement Clubs near the relevant room; Jess recommends a Club from your stage/interests.",
        "Seasons: a Club can run for a season (a book; a cycle) and sunset gracefully — no zombie groups.",
        "Anti-silence: engagement ≠ membership (a 2,000-member club had ~20 comments). Small prompted cohorts; Jess seeds a prompt when a Club goes quiet; scheduled checkpoints.",
      ]} />

      <H2>6. What we reuse (mostly assembly)</H2>
      <Bullets items={[
        "Data: CommunityPost.group_id mirrors CommunityPost.circle; Club + ClubMembership mirror CircleMembership (RLS-locked); book Clubs reuse BookClubPick/ClubCheckpoint/ClubNote.",
        "Functions: createClub/joinClub/leaveClub mirror joinCircle/leaveCircle; posting reuses createCommunityPost + addComment (already moderated).",
        "Safety: crisis intercept, OpenAI moderation, health allowlist, report→tombstone, reaction-only, on-device scrub — all built.",
        "Host: Jess (games-master / Book-Club host) is the ready-made flagship + fallback host.",
      ]} />

      <H2>7. Phased path (legal gate in the right place)</H2>
      <Table rows={[
        ["Phase", "What", "New risk", "Gate"],
        ["A (now)", "Fixed Library + Games rooms; Book Club → Jess-hosted Club; games-master gets a room. Mostly IA + reuse.", "None new", "—"],
        ["B (next)", "Jess-hosted Clubs beyond books (walking, creativity). Proves the primitive, no member hosting.", "Low", "—"],
        ["C (gated)", "Member-created Clubs: gated request-to-host, Open/Closed, ≥2 co-hosts nudged, central moderation, Jess-fallback, k-anon guards.", "HIGH — the real OSA surface", "OSA/ICO legal floor"],
        ["D (later)", "Open host creation (cap+cooldown+pledge), Secret Clubs, member game-nights.", "High", "Post-floor + tooling"],
      ]} />
      <Card accent="#BC2E27"><P><b>Hard sequencing rule:</b> member-created Clubs (Phase C+) wait behind the same OSA/ICO legal floor as the public Community launch — illegal-content risk assessment, proactive-moderation disclosure, DPIA + special-category consent, 18+ age-assurance, named human-review/appeals owner (Halli). User-led spaces materially increase the moderation surface, so they can't precede the floor. Library + Games + Jess-hosted Clubs (A–B) carry no new user-hosting risk and can move earlier.</P></Card>

      <H2>8. Open questions for Halli</H2>
      <Bullets items={[
        "Q1. One system or two? (Recommend two primitives on one spine.) And naming: Rooms · Circles · Clubs — does 'Clubs' work, or 'Tables'/'Gatherings'?",
        "Q2. Member-hosting at launch — gated request-to-host (recommended) or open-with-cap?",
        "Q3. Co-hosts — nudged, or required above a size threshold (which)?",
        "Q4. Privacy types at launch — Open + Closed only (recommended), or include Secret?",
        "Q5. Jess as fallback host — OK for Jess to adopt an abandoned Club as caretaker?",
        "Q6. Minimum Club size (k) before live/discoverable — what k (5? 8?)?",
        "Q7. Confirm member-created Clubs wait behind the OSA/ICO floor while Library + Games + Jess-hosted Clubs move earlier.",
        "Q8. Games scope — Jess-only at launch, member game-nights deferred to Phase D?",
        "Q9. Monetisation — Clubs stay free (monetise only the expert layer)? Recommend yes.",
        "Q10. Book-club spoiler model — progress/percentage-gated comments (Fable/StoryGraph), reusing the self-attested checkpoint gate?",
      ]} />

      <Foot>FemWell — Library, Games &amp; User-Created Groups brainstorm · 2026-06-11. Research + thinking only; nothing here is built. Cited brief: claude-state/product-research/user_created_groups_2026-06-11.md. Locked constraints honoured: whole-life not clinical, anonymous-first, 18+, Jess as host, no scoreboards/vanity counts, crisis routing on every input, no emoji.</Foot>
    </DocShell>
  );
}

// BooksBookClubsDoc — Founders Corner: the Books & Book Clubs brainstorm + research.
// RESEARCH/DESIGN ONLY — nothing here is built. Grounded in the existing Library/Book Club
// (bookClubConfig, clubsConfig, BookReader, Community BookClubView/games-master, NurtureGarden).
// Phone-readable companion: femwell-handoff/books-book-clubs_20260616.html. No emoji.

import React from "react";
import { DocShell, Eyebrow, Title, H2, H3, P, Card, Bullets, Pull, Badge, Pills, Table, Foot } from "./DocKit";

export default function BooksBookClubsDoc() {
  return (
    <DocShell>
      <Eyebrow>FemWell · Community · Books &amp; Book Clubs · brainstorm + research</Eyebrow>
      <Title sub="Research + design only — nothing here is built. The craft is extracting the belonging-and-curiosity engine of social reading while leaving the competition-and-guilt engine on the floor. Everything below extends the Library/Book Club we already have — no new reader, no new anonymity model.">
        Books &amp; Book Clubs — read accompanied
      </Title>

      <Pull>Stop asking her to finish a book; start letting her feel understood through one — anonymously, in company, at her own pace. Fiction gives permission: it&apos;s easier to say something true about yourself through Jo or Beth than in the first person.</Pull>

      <H2>The thesis</H2>
      <P>FemWell&apos;s reader is often in a life-stage that&apos;s isolating and under-narrated — perimenopause no one warned her about, the two-week wait, postpartum fog. A book becomes a safe, displaced container for hard feelings, and shared reading turns private recognition into quiet belonging: <em>other women felt the same thing at the same page</em>. That&apos;s the BookTok energy, made gentle, anonymous and safe. The honest finding up front: almost every sticky reading product runs on mechanics that break at least one FemWell lock — so we borrow surgically.</P>

      <H2>1 · How social &amp; serial reading works</H2>
      <P>Each reference app, with what to borrow (the belonging/curiosity engine) and what to leave (the guilt/competition engine):</P>
      <Table rows={[
        ["Source", "Borrow", "Avoid"],
        ["Fable", "Hosted clubs; chapter-gated discussion; projective prompts; a season with a finish line", "AI “roast”/personality summaries of a reader (the 2024 incident)"],
        ["Goodreads", "Shelves as low-effort identity; spoiler-tagged group threads", "“X books behind schedule”; annual numeric goals"],
        ["StoryGraph", "Mood/feel tagging over star ratings; position-locked buddy-read comments", "Reading challenges/goals; rating culture"],
        ["BookTok", "Emotional testimony (“the part that stayed with me”); shared scene reference points", "Hype/performance; hauls; public likes; completionism"],
        ["Wattpad", "Inline passage comments; between-chapter author voice; cliffhanger cadence; lists", "Vote counts; rankings; coin-gated chapters"],
        ["Vella / Radish", "Appointment cadence; anticipation as a non-guilt pull", "Pay-to-continue; weekly thumbs tallies"],
        ["Duolingo", "Tiny completable units; penalty-free return; cue-based gentle nudges", "Streaks; leagues; XP; loss-aversion guilt"],
        ["Silent Book Club", "Lurk-first togetherness; a trusted single host; a soft shared milestone", "Assigned homework; public deadlines as obligation"],
      ]} />
      <H3>Ten takeaways</H3>
      <Bullets items={[
        "A human host beats an algorithm — every durable club has one trusted voice (Fable hosts, Reese's, Jenna). Jess is our unfair advantage.",
        "Make the discussion prompt the unit, not the page count — a non-finisher still belongs.",
        "Position-gating is the whole spoiler-safety model (StoryGraph buddy reads, Fable chapter rooms) — we already have it in clubReached.",
        "Emotional testimony is the native voice of women's social reading — “the part that wrecked me” beats a star rating.",
        "The margin is a social space (Wattpad) — a prompt attached to a passage makes a solo reader feel accompanied.",
        "Cadence creates appointment behaviour without guilt (Vella/Radish) — anticipation, not a streak.",
        "Aggregate, never rank — reuse our collectivePool “only rises, no names, no scores” primitive.",
        "Shelves/lists are pure belonging — curation as identity, built from our existing save-heart.",
        "The penalty-free return is the de-guilted habit loop — the same forgiving model as the companion's resting season.",
        "Spoilers and co-rumination are the two failure modes specific to reading + women's wellness — gate the spoilers; aim prompts at meaning and agency.",
      ]} />

      <H2>2 · The FemWell design</H2>
      <P>Principle throughout: <strong>extend, don&apos;t reinvent.</strong> Everything rides existing primitives — <code>BookReader</code>/<code>DailyStoryReader</code>, <code>ClubNote</code>/<code>ClubCheckpoint</code>, the <code>dailyread-*</code> readers&apos; corners, the self-attested <code>clubReached</code> gate, the games-master aggregate-reveal, the <code>books</code> Circle, and the NurtureGarden day-sets.</P>

      <H3>2.1 Chapter-end reflective prompts <Badge tone="green">Quick-win</Badge></H3>
      <P>At a chapter boundary, a calm dismissible card from Jess poses one <strong>projective/empathy prompt</strong> about the chapter just read — <em>“If you were Emily, would you have opened the letter?”</em>, <em>“What do you think that letter contained?”</em>, <em>“Which sister did you recognise — in yourself, or someone you love?”</em> Works for <strong>solo</strong> (private reflection, optionally saved to Journal) and <strong>club</strong> (threads into the cohort&apos;s checkpoint). Authored like <code>bookClubConfig.checkpoints[]</code> — a per-book, per-chapter prompt map shipped in code (live with no DB seeding). Only ever appears after chapter n, references chapter ≤ n. Dismiss is frictionless; no “you skipped a reflection” state, ever.</P>

      <H3>2.2 Community &ldquo;guess the next chapter&rdquo; <Badge tone="amber">Bigger-bet</Badge></H3>
      <P>A warm projective prediction at a chapter boundary, collected from the cohort and <strong>revealed only as an aggregate, after the cohort has passed that chapter</strong> — no winners, no right/wrong. This is the games-master pattern (<code>GameRound</code> → <code>submitGameResponse</code> → Jess&apos;s &ldquo;no winners, just us&rdquo; reveal) bound to <code>read:&lt;book&gt;:&lt;chapter&gt;</code>. Spoiler-gated by the <code>clubReached</code> gate <em>plus</em> a k-floor (<code>REVEAL_K_FLOOR</code>) so a near-empty cohort never exposes one identifiable guess. Deliberately never reveals whose guess was &ldquo;right&rdquo; — the value is &ldquo;we wondered together.&rdquo;</P>

      <H3>2.3 Shared-read books — read &amp; reach milestones together <Badge tone="green">Quick-win</Badge> <Badge tone="amber">+ Bigger-bet</Badge></H3>
      <P>A cohort reads the same book, discusses spoiler-safe by chapter, and crosses milestones <em>together</em> — never a race. ~70% already built (the Jess-hosted Book Club + <code>clubReached</code> + <code>ClubNote</code>). The design is how cohorts form and how &ldquo;together&rdquo; feels like company, not a deadline:</P>
      <Bullets items={[
        "Seasonal pick (live): one curated, Jess-hosted book per season — everyone reading it IS the cohort, no sign-up, lurking counts.",
        "Circle-based (next): the books Circle surfaces “this season we're reading X together” — a cohort inside the safe Circle primitive, no new hosting surface.",
        "Per-book corners (live): any Library book already spawns a spoiler-safe dailyread-* readers' corner.",
        "Company, not deadline: a count-free, k-floored “where the room tends to be” line (“most of us are around Beth's chapters — no rush, the thread waits, no one is late”), never a progress race.",
        "Milestone moment: when the cohort (k-floor) passes a checkpoint, Jess opens that discussion + reveals the prediction aggregate — arriving somewhere together, not finishing first.",
      ]} />

      <H3>2.4 Ties to rooms, the hosted club, the gated floor &amp; the companion <Badge tone="green">Quick-win</Badge></H3>
      <Bullets items={[
        "Rooms: Library is a fixed Jess-presided Room; the club, prompts, predictions and corners live INSIDE it — no new top-level surface.",
        "Hosted club + corners: from BookReader's “join the readers' corner” link, a reader on the seasonal pick sees the checkpoint discussion; everyone else sees the general spoiler-safe corner. Same deep-link, two depths.",
        "The gated floor stays put: everything here is Jess-hosted or curated — zero new member-hosting surface — so it ships AHEAD of the CLUBS_USER_CREATE_ENABLED / OSA floor. Member-CREATED shared reads stay gated.",
        "The companion: today reading acts do NOT feed NurtureGarden — that's the hook. Add a fw_read_*/fw_club_* key family to communityActs() + a warm FED_NOUN entry so a reflection saved, a club note, a prediction, a checkpoint reached gently tends the garden. Day-sets not counts; resting-season law preserved; reading is a way to tend, equal in weight to a journal line.",
      ]} />

      <H2>3 · Emotional hook · retention · whole-life</H2>
      <P><strong>Hook:</strong> read accompanied, feel understood. The projective prompt lets her say something true about herself through a character, anonymously, with no exposure.</P>
      <P><strong>Whole-life:</strong> reading is the clearest expression of &ldquo;for all of you, not just your cycle&rdquo; — the books Circle and Library sit beside Love, Money, Style. Picks can gently rhyme with a life-stage season, <em>never</em> gated on cycle phase.</P>
      <P><strong>Retention = accumulation &amp; belonging, never guilt</strong> — three forgiving surfaces, none of which can be &ldquo;lost&rdquo;:</P>
      <Bullets items={[
        "A shelf that only grows — “my reads” from the existing save-heart + reflections kept (Goodreads shelves, NOT the challenge).",
        "A companion that's nourished, not scored — reading tends the garden; a return after a gap is a resting season, warmly welcomed.",
        "A cohort that waits — “the thread waits, no one is late.” The pull forward is anticipation (the next checkpoint opens together), never obligation.",
      ]} />

      <H2>4 · Risks &amp; guardrails</H2>
      <Bullets items={[
        "Spoilers (the central risk): position-gating everywhere via clubReached + a k-floor before any aggregate reveal; corners stay “no endings, no twists given away.”",
        "Co-rumination: prompts authored toward meaning, agency and recognition (“what would you do”) not distress-mining; every text input runs the SAME crisisCheck → UK resources (NHS 111, Samaritans).",
        "Content sensitivity: extend the existing trigger_warnings “gentle heads-up” to chapter level for heavy chapters.",
        "Moderation: every reading input runs the central pipeline (crisis intercept → publish-then-screen → report→tombstone). Jess aggregate reveals are tone-locked + human-checked (the Fable “roast” is the reason).",
        "Anonymity / k-anonymity: all writes use the anonymous author_hash (no handles, no DMs, no likes); aggregates + cohort lines are k-floored; solo reflections default private.",
        "No scoreboards (the lock): no books-read count, no streak, no “X behind,” no fastest-reader, no right/wrong on predictions, no reading-XP. Every aggregate uses “only rises — no names, no scores.”",
        "UK / OSA floor: Jess-hosted/curated ships ahead of the floor; member-CREATED shared reads stay behind CLUBS_USER_CREATE_ENABLED + the OSA/ICO floor (risk assessment, DPIA + special-category consent, 18+ AgeGate, named review owner).",
      ]} />

      <H2>5 · Phased path</H2>
      <Card accent="#6B8F5A">
        <P><Badge tone="green">Phase 1 · quick-wins</Badge> &nbsp;Chapter-end reflective prompts (solo + club); the count-free &ldquo;company, not race&rdquo; cohort line + appointment-cadence nudge; reading nourishes the companion (the smallest change, high emotional payoff); a &ldquo;my reads&rdquo; only-grows shelf. All assembly over existing primitives — ships ahead of the floor.</P>
      </Card>
      <Card accent="#A6862B">
        <P><Badge tone="amber">Phase 2 · bigger-bets</Badge> &nbsp;Predictions / &ldquo;guess the next chapter&rdquo; (games-master bound to a book+chapter, k-floored, no winners); Circle-based seasonal shared reads; chapter-level trigger warnings + richer prompt follow-ups. Still all Jess-hosted/curated.</P>
      </Card>
      <Card accent="#BC2E27">
        <P><Badge tone="red">Phase 3 · gated</Badge> &nbsp;Member-created shared reads (the already-built StartBookClub path, unlocked only with the OSA/ICO floor); async voice notes about a book (screen-before-deliver); much later, scheduled live book chats. Do not unlock early.</P>
      </Card>
      <P><strong>Hard sequencing rule:</strong> Jess-hosted/curated (Phases 1–2) carries no new user-hosting risk and moves first; member-created (Phase 3) waits behind the same OSA/ICO floor as the public Community launch.</P>

      <Foot>
        <P>Sources cited: Fable, Goodreads, StoryGraph, BookTok/TikTok, Wattpad, Kindle Vella, Radish, Duolingo, Silent Book Club, Reese&apos;s / Read With Jenna read-alongs. Extends: <code>bookClubConfig.js</code>, <code>clubsConfig.js</code>, <code>circlesConfig.js</code>, <code>BookReader.jsx</code>, <code>Community.jsx</code> (BookClubView / games-master / collectivePool / crisisCheck), <code>NurtureGarden.jsx</code>, <code>GroupsLibraryGamesDoc.jsx</code>.</P>
        <Pills items={["RESEARCH/DOC ONLY — not built", "UK / en-GB / NHS", "anonymity-first (author_hash)", "no scoreboards / streaks / winners", "18+", "no emoji", "spoiler-safe by chapter", "crisis-aware"]} />
      </Foot>
    </DocShell>
  );
}

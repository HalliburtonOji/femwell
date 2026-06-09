# FemWell Community — THE CONSOLIDATED PLAN (production build spec, Editorial direction) — v2-FINAL
_Owner: Mr Lead Manager. Craft: Ms Atelier. Research: Ms Deep Search. Verification gate: Ms Verify._
_v2-FINAL 2026-06-09 — the single authoritative Community spec. Consolidates v1 (the 12-section mega plan), the **Whole-Life Rebalance** (`WHOLE_LIFE_REBALANCE.html`), the **Audio / Talk-It-Out** design (`AUDIO_TALK_IT_OUT.html`), and all locked decisions of 2026-06-09. v1 was built from all five `CommunityDemo*.jsx` + `CommunityMP8.jsx`, the prior specs captured 1:1, the live echo/witness/community code read line-by-line, and seven cited research streams (~190 sources). Read §0.5 first for the whole picture; §1–§12 are the depth._

> **THESIS (locked):** *"Journal owns the writer. Community owns the peer shapes"* — and **Community is a whole-life room, not a clinical one** ("health is one room, not the house"). One reflection has **four lives** — stay locked (default) · become an echo · be sealed to future-you · be handed to one witness — **decided at the entry level, never by default.** The anonymous peer surfaces sit on a **solitude → witness gradient** (Cycle Mirror → Sealed Letters → Echo Wall → Witness → Phase Twin); around them sit the **whole-life rooms** (Lounge/vent · interest Circles · Love & Relationships · Money & Work · Style · The Lighter Side) and the **Shared-Experience pillar** (Question-of-the-Day · Book Club · cooperative games · collective build · rituals · audio). The widest anything travels is one scrubbed line — no public profile, no scoreboard. **Sell common humanity, not disclosure volume. Build belonging, voice, identity and lightness — not tracking.**

> **WHERE WE ARE (2026-06-09):** **Echo Wall + Witness Mode are BUILT, deployed, live-verified** (Echo `index-CfnX9e_7.js`; Witness `index-BEPB6rBK.js`; entities live). **Locked decisions:** retire the off-thesis MP8 likes-forum and make the **editorial anonymity-first surface the real `/Community`**; **18+ adults-only** (collapses the children's-code/age-assurance burden); **Halli = named senior accountable person** for OSA/ICO; **whole-life, not clinical-only.** Unbuilt: the editorial-surface route correction, the four-lives chooser as a unified UI, the whole-life rooms, the Shared-Experience pillar, Circles, Phase Twin, audio, the expert layer. **Next: Phase 2 = rebuild the 5 Community demos in FoundersOS against THIS plan** (approval artefacts), then production. The OSA/ICO legal floor is specced, Halli-owned, not executed — the gate before any scaled real-traffic surface.

> **Hard locked constraints (never re-litigate):** **18+ adults-only** · **anonymous-first** · UK (NHS/Samaritans/Mind/Refuge, GMC/NMC/HCPC, £, UK GDPR/DPA 2018) · **no emoji** (Lucide + SVG only) · Editorial type kit · one unified bottom nav · **no scoreboards / no streaks / no leaderboards / no likes-counts** · **no paywalls on peer surfaces** (monetise expert depth only) · **Jess as warm host** (never a roast — the Fable cautionary tale) · **whole-life not clinical-only** · evidence-informed, never a clinical promise.

# §0.5 — v2-FINAL CONSOLIDATION (the whole Community in one view)
Everything decided, integrated. The fuller treatment of each is in §1–§12 + the PILLAR section + the two companion HTML plans.

**A. The surface.** `/Community` becomes the **editorial anonymity-first home** (the Demo5 hub), replacing the retired MP8 likes-forum. It hosts: the gradient peer surfaces, the whole-life rooms, the Shared-Experience pillar, and (later) audio. One unified bottom nav; warm not clinical.

**B. Built + live (keep, surface properly).**
- **Echo Wall** — anonymous one-line phase-cohort wall, hold-only, 48h fade, 4-reaction lexicon, crisis intercept, service-identity writes. *Built; needs mounting on the real `/Community`.*
- **Witness Mode** — one entry → one matched sister → 4 fixed responses or pass; gate, reroute, strikes, per-request crypto. *Built; needs a discoverable Witness Dock on Community.*
- **"One entry, four lives"** — lock / echo / seal / witness all exist as mechanics; the **unified entry-level chooser UI is the key unbuilt bridge.**

**C. The Shared-Experience pillar (Community as a shared experience, not a feed).** One gentle thing/day, collective-not-competitive, aggregate-not-individual, Jess-hosted:
- **Question of the Day** (daily heartbeat, one-tap, descriptive-norm reveal) · **Book Club** (on the existing Lifestyle BookReader; spoiler-gated, paced, Jess-hosted) · **cooperative games** · **collective build / shared pool** · **ambient presence + weekly/seasonal rituals**. Full spec in the PILLAR section.

**D. Whole-life rooms (the rebalance — Community is not clinical-only).** Health is *one* room:
- **The Lounge** (anonymous warm vent / "AIBU" / spill-it — the daily-engagement engine) · **interest-first Circles** (match on interest + stage, never a lead photo) · **Love & Relationships** (anonymous peer/expert advice) · **Money & Work** (non-condescending confidence + ask-the-dumb-question) · **Style & Self-Expression** (advice not hot-or-not, rate the choice never the body) · **The Lighter Side** (Skimm-style daily + playful astrology/quizzes) · **Me / My Shelf** (taste identity) · **Health** (the clinical room — accurate, NHS-grounded, one room not the house).

**E. Non-clinical activities + broadened games (de-clinicalise the pillar).** The 22-item catalogue — This-or-That, Kind Hot-Takes, the Vulnerability Ladder, One-Line Story (exquisite corpse), Rate-my-Styling (the choice, never the body), Which-Era-Are-You archetype play, Dream-Life Board, Ask the Room, Kind Confessions, Role-Play Rooms, Caption This, Recommend-Me, Wednesday Wins / Friday Five, Build-It-Together. Role-play, fashion, gossip, interests, career, creativity, fun — **not health-only.** (Catalogue + safety rules in `WHOLE_LIFE_REBALANCE.html` §5.)

**F. Audio / Talk-It-Out (the spoken sibling).** Three modes, **async-first**:
- **Mode A — async voice-notes** ("a voice echo": record → optional mask → STT crisis-scan + cooling-hold → a phase-sister holds it → fades). **Buildable in-repo now** (MediaRecorder → Base44 UploadFile → `VoiceNote` entity).
- **Mode B — 1:1 turn-based "talk it out"** (3-min talk / listen / swap, "hold, don't fix", closing reflection vs co-rumination). Needs LiveKit + a token function + Halli's provider keys + OSA RA.
- **Mode C — small live status-flattened Circles** (5–8, Peanut-Pods model, host-present, listen-only allowed). Highest moderation/legal burden — last.

**G. Cross-page wiring (whole-life RULE 2 — account for ALL surfaces).** Book Club ↔ Lifestyle BookReader; QOTD ↔ Today + cycle phase + Echo Wall; games/pools ↔ Planner/Health (aggregate only); Me-My-Shelf ↔ Profile + interest Circles; Events ↔ Today/Planner/Circles; Style ↔ Deals; Doctor Export **excludes** all whole-life/social/voice content; **Jess hosts everything**; notifications informational-only. (Full matrix in §6 + `WHOLE_LIFE_REBALANCE.html` §6.)

**H. Rollout (mapped to FemWell phases).** Phase 3.5: route correction + QOTD + Tier-0 presence + the Lounge + async voice-notes + legal floor + MP8 retirement. Phase 4: Circles + Book Club + games + collective build + rituals + Living Wisdom + Money/Love/Style rooms. Phase 5: Phase Twin + 1:1 + live audio + expert AMA layer. All peer surfaces free; monetise expert depth only.

---

# §0 — HOW TO READ THIS DOC

This is the authoritative Community spec. It supersedes `COMMUNITY_BUILD_SPEC.md` v2 where they differ (v2 predates the Echo/Witness ship and the routing reality). Section map:
- **§1** Vision & the 12 locked principles.
- **§2** Source material captured 1:1 — the demos, the prior specs, **and the demo→built RECONCILIATION** (Halli's specific ask: which journal-related demo ideas are not built).
- **§3** Full feature inventory (the build queue) — every surface, all states, entities, edge cases, phase tag.
- **§4** External research, cited (4 streams).
- **§5** Competitive read (EMULATE/AVOID + cautionary tale + the wedge).
- **PILLAR — Community as a SHARED EXPERIENCE (not a feed):** the shared things we DO together (Question of the Day, Book Club on the BookReader, cooperative games, collective build, shared rituals/presence) — vision fit, per-activity spec, Jess-as-host guardrails, cross-page wiring, rollout slotting, research. *(Sits between §5 and §6; added v1.1.)*
- **§6** Cross-app relationships — the dedicated section: Journal · Today · Health/Pulse · Planner · Lifestyle · Doctor-export · Jess · Horoscope · onboarding · Settings · notifications.
- **§7** Safety · privacy · compliance (anonymity limits, tiers, OSA/ICO floor).
- **§8** Risk register. **§9** Phased rollout. **§10** Source map. **§11** Open decisions for Halli. **§12** Definition-of-Done checklist (self-graded).

**Legend (phase tags, used throughout §3/§9):** **Live** = built, deployed, verified · **Built-not-live** = built but not on the production route · **Patch** = small change to a built surface · **Demo** = exists only as a mock `CommunityDemo*` page · **Plan** = designed, unbuilt.

---

# §1 — VISION & PRINCIPLES

## 1.1 Thesis (locked)
*"Journal owns the writer. Community owns the peer shapes."* The Journal is for you and future-you; Community is for everything that needs another person — **anonymous first, earned slowly.** The product's defensible core is not a feed; it is the **solitude→witness gradient** that walks a woman from writing alone, to one scrubbed line among phase-sisters, to one entry held by one matched woman, to twelve days written beside a twin. Competitors can clone a forum in a sprint; they cannot clone six months of a woman's accumulated Cycle Mirror + Echo holds + Phase-Twin history.

## 1.2 Design philosophy
Three commitments, each settling arguments below:
1. **Evidence-aligned, not engagement-aligned.** The behaviours that make a support community feel "close" — co-rumination, reassurance-seeking, reading others' acute distress on an infinite feed — are exactly the behaviours that *worsen and spread* low mood (§4). FemWell's mechanics (one line, hold-only, no threads, fade-by-default, fixed responses, closing cohorts) are an **evidence-based countermeasure**, not an aesthetic.
2. **Healthy-by-design (Self-Determination Theory).** Every surface must increase at least one of **autonomy / competence / relatedness** and reduce none (§4 A1). If a mechanic only moves a number, it is cut.
3. **Protection over personalisation.** FemWell's 11 life-stages are a **shield** first and a personalisation engine second: a TTC woman must never have a pregnancy scan pushed at her; a woman who logged a loss must never see "success" content (§4 B2). Phase drives *timing and tone*; **stage + identity + interest** drives *grouping* (§4, phase-aware research).

## 1.3 The twelve locked principles (each can reject a design)
1. **Anonymity is the default for any peer surface.** UUID/hash-only rows, device-derived author token, retract-by-hash, no handles/profile/carry-over. *(Rejects: a "profile" or "followers" feature.)*
2. **Solo before social.** Cycle Mirror + Sealed Letters earn the trust Echo Wall/Witness/Twin spend. *(Rejects: opening Phase Twin to a brand-new user.)*
3. **Reactions are emotional, never transactional.** Fixed empathy lexicon; counts never rank a feed; no like/emoji pile-on/follow. *(Rejects: a "top posts" sort.)*
4. **Phase-aware in copy and timing — never as a hard wall.** Soft "your phase" weighting; gentler surfaces in the late-luteal window; phase never *segregates* the graph. *(Rejects: a "luteal-only room" as the primary grouping — §4 says this concentrates low mood.)*
5. **No scoreboards anywhere.** No streaks, XP, badges, leaderboards, "most relatable," public follower/like counts. *(Rejects: the MP8 `likes_count`.)*
6. **Evidence-informed, never a clinical promise.** A visible NHS/Samaritans/Mind escalation path sits *beside* peer content; the platform makes no medical claims and signposts the NHS for anything clinical. *(Rejects: peer "cures" surfaced as advice.)*
7. **No emoji codepoints anywhere** (Lucide + SVG only).
8. **Public-feed creep is the enemy.** No handles, threads, DMs, likes, leaderboards. *"Echo Wall + Witness die the moment they grow conversation."* *(Rejects: a reply box on an echo.)*
9. **Belonging before posting.** A zero-disclosure Tier-0 "others in your phase" signal precedes any social surface — the lurker (who benefits measurably, §4) is a first-class citizen. *(Rejects: gating all value behind posting.)*
10. **Anonymity must survive metadata.** Aggregate-only counts, k-anonymity floor (suppress below ~20), unlinkable-token rate limits, and **honest disclosure of what the platform can still see.** *(Rejects: a per-card public hold-count that could de-anonymise a tiny cohort.)*
11. **Experts moderate; peers never carry medical authority at scale.** Verified UK clinicians (GMC/NMC/HCPC, register number shown) provide general, non-individualised content and misinformation correction; peer chat is never the medical voice. *(Rejects: an un-moderated medical-advice thread — §4 B3 shows this is the documented harm path.)*
12. **Owned and portable.** The community lives on FemWell's surface (not a platform that can delete it overnight — §5 Reddit cautionary tale), and users can export/delete their own contributions (GDPR erasure + anti-lock-in).

## 1.4 Strategic framing
**6-month sale window, 9-month soft cap** (the standing FoundersOS runway). The engagement layer is *"the part a buyer's diligence team spends the most time on, because it is the part competitors cannot trivially clone."* Target: a **buyer-demo-quality** Community by ~**November 2026** — anonymity-first, phase-aware, healthy-by-design, with the legal floor visibly handled. **Peer surfaces are free by principle** — paywalling peer support reads as exploiting vulnerability; monetise **expert depth** (AMAs, specialist content), never the wall.

---

# §2 — SOURCE MATERIAL, CAPTURED 1:1

Three source classes: (A) the five editorial demos + the live MP8 build; (B) the prior specs (Community v2, Journal v3, master-plan); (C) the live code. Then **(D) the demo→built reconciliation** — the heart of Halli's ask.

## 2.1 The editorial demos (mock data, brand-pure — the intended direction)

**Demo 1 — Echo Wall** (`CommunityDemo1.jsx`). A room of anonymous one-liners from same-phase women; **hold-only** (no replies/threads/DMs); each line **fades 48h** after going live. Mechanics: phase-weighted feed ("sisters first"); **"Your phase"** gold chip; live cohort line (*"Five women in their inner autumn left a line in this hour"*); two one-way reactions **Held / Me too**; **48h fade label**; **report→auto-hide**; author-only **"Still cooling · Pull it back"** strip; composer **"Leave a line — from your Journal."** Multi-stage **Share-as-Echo**: write → **Jess scrub** (shows what was removed: *name "Sarah"*, *weekday "Monday"*) → **cooling notice** (10-min) → **crisis intercept** (lexicon → UK resources Samaritans 116 123 · NHS 111 · Shout 85258 · Mind, *"You deserve more than a sister can hold."*). Verbatim manifesto: *"No handles, no threads, no replies. Just sisters holding sentences — each one fades two days after it lands."*

**Demo 2 — Witness Mode** (`CommunityDemo2.jsx`). *"Read this. Hold it."* One journal entry handed to one matched sister; she replies with **one of four fixed lines** (*"I'm holding this with you / Me too / You're not alone in this / I hear you"*) **or passes silently** — never her own words. Mechanics: writer toggle (*"Want one sister to witness this?"*); **held-3 reciprocity gate**; matching (2–4h, same phase + life stage, "no profile is read"); **2h cancel-before-read / re-seal** (*"Re-sealed. She never knew. It's back in your Journal, under your lock."*); **Witness Dock** receiver inbox ("a dock, not a page"); locked no-copy/no-screenshot receiver view; the **6-rail Witness Charter** (Anonymous · One-shot · Cancel-before-read · **Not for crisis → routes to Panic Mode** · No names/places (Jess detects) · You choose her shape). Design rule: **dark-plum "trust-ink" gradient reserved for fragile peer surfaces.**

**Demo 3 — Phase Twin** (`CommunityDemo3.jsx`). *"Twelve days. One shape. Not a friendship."* A 12-day container with one same-phase/life-stage woman; **one shared daily prompt**; **her answer blurred until you write yours**; auto-closes at next period day 1, no re-entry that cycle. Mechanics: match screen (tags: luteal phase · reproductive · no kids · #work-stress); a 4-sees / 4-never-sees visibility matrix; both-wrote reveal gate; **Jess one bridging note/day**; **day-12 closing ritual** (*"12 days · 8 shared entries"*, Jess names shared themes); **parting-line exchange** (carry one of her lines for 48h); new twin each cycle, same Jess.

**Demo 4 — Circles + "Others in your phase"** (`CommunityDemo4.jsx`). The belonging layer. **Aggregate card** (*"You're one of 312 women in their inner autumn tonight"* / *"847 in your luteal phase logged something heavy this week. No names. No content."*) with a **k-anonymity floor `K_FLOOR = 20`** (*"We'd rather show nothing than risk that"*). **Circle taxonomy** (5 categories): Phase (Luteal Softness), Program (Sleep Reset cohort), Region (UK Women Wellness), Life stage (Perimenopause Watch, Postpartum First Year), Condition (PCOS Honest, PMDD Support). Join/Joined toggle. Footer: *"echoes you leave can stay circle-scoped."*

**Demo 5 — Community Home** (`CommunityDemo5.jsx`) — **the densest journal↔community file.** The two-home model (Journal "owns the writer" — Mirror · Sealed Letters · Share-as-Echo; Community "owns the peer shapes" — Echo Wall · Witness · Phase Twin · Circles). **"One entry, four lives"** (stay locked · become an echo · be sealed · handed to a witness). The **solitude→witness gradient** (5 ordered surfaces, each unlocked by trust the prior built). Governance rule: *"One reflection can cross between them — but only ever at the entry level, never by default."* No-scoreboard manifesto: *"No handles. No threads. No DMs. No likes, no leaderboards."* Roadmap tags: Echo Wall now · Witness Q3 · Phase Twin Q4.

**CommunityMP8** (`CommunityMP8.jsx`) — **the live `/Community`, and the odd one out.** A conventional Base44-wired forum: categorised `CommunityPosts` (Question/Support/Celebration/Tip) with titles/bodies, **like counts**, topic tags, "post anonymously" checkbox. Rose/crimson palette (`#E11D48`), **not** the Editorial kit. **No journal bridge, no Jess, no scrub, no phase-matching — and a `likes_count` that violates principle #5.** This is the current production surface; the demos are the intended replacement.

## 2.2 Prior specs (captured)
- **`COMMUNITY_BUILD_SPEC` v2** — already structured to the framework; its thesis, 10 principles, feature queue (§2.0–§2.G), safety model, and rollout are folded into this doc and **superseded where they predate the ship**. Key v2 facts carried: the `author_hash = SHA-256(userId :: per-device-secret)` model; the **confirmed `created_by` leak** caveat (now fixed via `postEcho`/`asServiceRole`); the sensitivity tiers; the OSA/ICO legal floor; the 15 open questions.
- **`JOURNAL_BUILD_SPEC` v3** — the **five-concept gradient** (Cycle Mirror · Sealed Letters · Echo Wall · Witness · Phase Twin) with body/moat/voice/quarter; the **"one entry, four lives"** contract; **Share-as-Echo**, **Send-to-Witness**, **Living Wisdom** (the reverse Community→Journal bridge); the five already-made reconciliations (48h fade ships first; holds private to writer; 2h-cancel/6h-reroute; v1 single-shot letters; UK-balanced seed names); the granular rails (cooling, night/late-luteal throttle, rate limits 5 echoes/1 witness send/3 receives/1 twin).
- **`master-plan.md`** (authority — wins conflicts) — the **data-moat** framing; OnThisDay/Friend6Months/PhaseInbox **shipped** (MP-Eng-1); SecureStore + Sealed Letters **shipped** (MP-Eng-2); Living Wisdom holds≥3; Care Bridge v2 (London endo cohort ≤30) on a separate B2B track.

## 2.3 Conflicts flagged (with "which wins")
1. **Witness 4-line lexicon.** master-plan (*"I heard you / I'm with you / you're not alone / thank you for trusting me"*) vs Journal+Community spec + **shipped code** (*"Holding with you / Me too / Not alone / I hear you"*). **WHICH WINS: the shipped code** (Halli locked it this session). Update the master-plan copy to match.
2. **Echo reaction lexicon.** master-plan/legacy `same · hold · hear you · saved` (4) vs early shipped `held · me too` (2). **WHICH WINS: the current shipped code — 4 reactions `Same · Hold · Hear you · Saved`** (reconciled this session, live).
3. **Echo fade window.** 48h (locked, shipped) vs 7d (demos' Settings mock). **WHICH WINS: 48h ships first;** 7d only after 3 cycles of safe cohort data.
4. **Holds visibility.** "private to writer only" (reconciliation) vs shipped wall showing per-card counts to all. **WHICH WINS: needs Halli (§11);** recommend small aggregate counts retained but reviewed against de-anonymisation in tiny cohorts (principle #10).
5. **Living Wisdom eligibility.** holds≥3 (master-plan) vs holds≥5 (Journal/Community spec). **WHICH WINS: holds≥5** (more conservative; principle #2/#10). Revisit after data.
6. **Two community visions.** Editorial anonymity-first demos vs live MP8 forum. **WHICH WINS: the editorial direction** (it is the locked thesis + honours the principles; MP8's `likes_count`/handles violate #5/#8). See §11 decision 1.

## 2.4 ⭐ DEMO → BUILT RECONCILIATION (Halli's specific ask)

Legend: **Live** (deployed) · **Built-not-live** (built, off the production route) · **Partial** · **Plan** (unbuilt) · **Conflict**.

| # | Demo idea (source) | Journal-related? | Status | Evidence / gap |
|---|---|---|---|---|
| 1 | **Echo Wall feed** (Demo1) | Yes (journal→echo) | **Built-not-live on Community** | Fully built `EchoWall.jsx`, live-deployed, BUT only mounted on `/CommunityLegacy` + reachable from Journal. Live `/Community` = MP8 forum. **Action: mount on real `/Community`.** |
| 2 | **Share-as-Echo** (Jess scrub → cooling → crisis) (Demo1/5) | **Yes** | **Live (via Journal)** | `ShareAsEchoSheet.jsx`, `Journal.jsx:327`, `NewEntrySheet.jsx:706`. Server-anon via `postEcho`. |
| 3 | **Echo reactions / fade / report / phase-weighting / cooling** (Demo1) | Yes | **Live** | `echoConfig/echoSafety/echoScrub.js`, `EchoWall.jsx`. 4-reaction lexicon, 48h fade, threshold-2 hide, +600/+150 weighting. |
| 4 | **Witness Mode** (writer + dock + 4 responses + charter) (Demo2) | **Yes** | **Live (via Journal)** | `AskForWitnessSheet.jsx`, `WitnessInbox.jsx`, 6 functions, gate, reroute, strikes. Entry points in Journal, not Community. |
| 5 | **"One entry, four lives" unified chooser** (Demo5) | **Yes (the master bridge)** | **Partial** | All 4 *mechanics* exist (lock=default ✓, echo ✓, sealed ✓ SealedLetters, witness ✓) but there is **NO single entry-level "four lives" chooser** surfacing them together. **The signature journal→community UI is unbuilt.** |
| 6 | **Cycle Mirror** ("on this day last cycle you wrote…") (Demo5) | **Yes** | **Partial** | master-plan says OnThisDay/Friend6Months/PhaseInbox **shipped** (MP-Eng-1) — the *mirror* surfaces exist in Journal, but the editorial Cycle-Mirror-as-gradient-root and its "same phase / one year ago / same mood" secondary views need confirming/finishing. |
| 7 | **Sealed Letters** ("a letter to future-you, under your key") (Demo5) | **Yes** | **Built (Journal, per master-plan MP-Eng-2)** | SecureStore + Sealed Letters shipped; `sealed/*` components present. Confirm editorial parity + the Community-home link. |
| 8 | **Phase Twin** (12-day paired journaling + parting-line) (Demo3) | **Yes** | **Plan (Demo only)** | No `TwinPairs/TwinEntries/TwinPrompts` entities; no code. Q4. Entities now repo-creatable (see §7/§9). |
| 9 | **Circles taxonomy** (Phase/Program/Region/Life-stage/Condition) (Demo4) | Partly | **Plan (Demo only)** | `Echo.visibility` enum supports `circles` but app always writes `"all"` — circle-scoping dormant. No Circle entity. |
| 10 | **"Others in your phase tonight" aggregate + k-floor** (Demo4) | **Yes** (derived from "logged something heavy") | **Plan** | No `PhaseAggregates` view. The zero-disclosure belonging card — high value, low risk — is unbuilt. |
| 11 | **Living Wisdom** (faded echo surfaced into compose as company) (Journal spec) | **Yes (reverse bridge)** | **Plan** | No `WisdomIndex`/`JessWisdomSurfacings`. Depends on Echo Wall accumulating ≥30 days. |
| 12 | **Expert AMA / verified-clinician surface** (v2 §2.F.4) | No | **Plan** | No AMA/Experts entity wired. The trust+misinformation wedge (§4/§5) is unbuilt. |
| 13 | **Legacy `Posts` feed + `CommunityFeed.jsx`** | No | **Conflict/dormant** | `Community.jsx` writes `Posts` "approved" (moderation bypassed); `CommunityFeed.jsx` orphaned; `Posts` carries two contradictory reaction schemas. Cleanup needed. |
| 14 | **MP8 `CommunityPosts` forum (likes/handles)** | No | **Live — but off-thesis** | The actual `/Community`. Violates principle #5 (`likes_count`). **Decide its fate (§11).** |
| 15 | **`AnonymousSession` entity** | — | **Dormant** | Zero references in `src/`; anonymity uses localStorage hashes instead. |

**Headline for Halli:** the journal-related demo ideas split three ways. **Built & live:** Share-as-Echo, the Echo Wall mechanics, Witness Mode. **Built but hidden / partial:** Sealed Letters and the Cycle-Mirror surfaces (in the Journal, not surfaced in Community), and — critically — the **"one entry, four lives" unified chooser is NOT built** (the four fates exist as separate features but were never unified into the signature entry-level chooser the demo sells). **Demo-only / unbuilt:** Phase Twin, Circles, the "others in your phase" aggregate, Living Wisdom, and the expert AMA layer. And the structural shock: **the live `/Community` is the off-thesis MP8 forum, not the editorial Echo Wall.**

---

# §3 — FULL FEATURE INVENTORY (the build queue)

Each feature: **Purpose · IA placement · States · Data wiring (entities/fields) · Interactions · Edge cases · Phase.** Tags per the §0 legend.

## 3.1 Community shell + the route correction  **[Built-not-live → Patch]**
- **Purpose:** make the anonymity-first editorial surface the real `/Community`; demote MP8.
- **IA:** route `/Community` → an editorial `CommunityHome` (the Demo5 hub) with sub-surfaces Echo Wall · Witness Dock · Circles · (later) Phase Twin. Bottom-nav "Community" unchanged.
- **States:** loading (spinner) · empty (first-run, no echoes → Tier-0 belonging card + "leave the first line, from your Journal") · populated · error (wall couldn't open) · offline (cached last view, compose disabled).
- **Data:** reads `Echo.filter({hidden:false}, "-created_date", 200)`; Tier-0 from a `PhaseAggregates` count query; no new PII.
- **Interactions:** tab/segment between Echo Wall / Witness / Circles; entry to Share-as-Echo routes through the Journal (principle: echoes originate from a written entry).
- **Edge cases:** no cycle anchor (phase unknown → "sisters across the cycle" copy, no weighting); cohort below k-floor (Tier-0 card suppressed); MP8 in-flight posts (migration/retirement plan, §9).
- **Phase:** Phase 3.5 (route correction) — **the unblocking move.**

## 3.2 Echo Wall (the one-line wall)  **[Live]**
- **Purpose:** anonymous phase-cohort one-liners, hold-only, ephemeral.
- **States:** empty · loading · populated · cooling (author-only) · expired (auto-deleted on load) · hidden (reported) · rate-limited (5/day) · crisis-intercepted (compose).
- **Data:** `Echo` (body, author_hash, phase, life_stage, cycle_day, source_entry_hash, live_at, expires_at, held/metoo/hearyou/saved_count, report_count, hidden, visibility). Feed weighting on-device (recency 6h half-life +600 same-phase +150 same-stage). Functions `postEcho`/`retractEcho` (asServiceRole).
- **Interactions:** hold (4-reaction lexicon, one-way, local dedup) · report (→threshold-2 hide) · pull-back (cooling) · share-as-echo (from Journal).
- **Edge cases:** clearing site data loses retract ability (fades in 48h anyway, disclosed); daily limit is local-only (server-enforce in 3.5).
- **Phase:** Live. **Patch:** server-enforce the 5/day limit; reconcile per-card hold-count visibility (§11).

## 3.3 Share-as-Echo (Journal → wall bridge)  **[Live]**
- Purpose/States/Data as the Echo Wall composer: write → scrub (shows removed) → cooling/throttle → crisis intercept → share/edit/keep-private. `scrubToEcho()` + `crisisCheck()` on-device; mirrored server-side in `postEcho`.
- **Edge case:** scrub leaves <3 letters or a surviving identifier → blocks the post with a reason.
- **Phase:** Live.

## 3.4 Witness Mode (1:1 held entry)  **[Live]**
- Purpose/States/Data/Interactions: see the Witness ship (gate held-3, pull-pairing on phase+stage+language, 4 fixed responses + pass, 6h reroute cap-1 + ignored strike, 3-strike removal, 2h cancel, charter, per-request-key crypto). Entities `WitnessRequest`/`WitnessStrike`; functions `postWitnessRequest`/`claimWitness`/`respondWitness`/`cancelWitness`/`flagWitness`/`getWitnessStatus`.
- **IA gap to close:** Witness entry points live in the Journal; add a **Witness Dock** card on `CommunityHome` so the receiver inbox is discoverable from Community (it is "a dock, not a page").
- **Edge cases:** claim race (re-read mitigation, not eliminated); E2E is at-rest+access-gated, not zero-knowledge (honest limit, §7).
- **Phase:** Live (Journal); **Patch:** surface the dock on Community.

## 3.5 Tier-0 "Others in your phase tonight"  **[Plan — recommend pull-forward]**
- **Purpose:** zero-disclosure belonging signal *before* any posting (principle #9; lurkers benefit, §4).
- **IA:** top of `CommunityHome` + an onboarding moment.
- **States:** populated (*"You're one of N women in their inner autumn tonight"*) · **suppressed** (below k-floor 20 → *"Too few in your phase right now to show a count without naming anyone"*) · loading · no-phase (generic copy).
- **Data:** derived `PhaseAggregates` view — counts only, no rows joined to users, no content; "logged something heavy" = a count over private journal signals, **never the content**.
- **Edge cases:** small UK cohorts at night (k-floor); time-zone bucketing ("tonight").
- **Phase:** Phase 3.5.

## 3.6 Circles (themed cohorts)  **[Plan]**
- **Purpose:** the belonging layer — self-select into a smaller, relevant room (§4: stage cohorts beat one feed).
- **IA:** a Circles carousel on `CommunityHome`; joining scopes Echo visibility to the circle.
- **States:** list (5 taxonomy tabs) · joined/not · circle feed (echoes with `visibility:circles`) · empty circle · below-k-floor circle (suppress counts).
- **Data:** new `Circle` + `CircleMember` entities (name, category, member_count, today_count); `Echo.visibility="circles"` + `circle_id`. **Match on stage + interest, never on cycle phase as a wall (§4).**
- **Edge cases:** tiny circles (k-floor); a condition circle (PMDD/PCOS/endo) is **special-category** → explicit consent + careful copy (§7).
- **Phase:** Phase 4.

## 3.7 Phase Twin (12-day paired journaling)  **[Plan / Demo]**
- **Purpose:** the deepest pairing — 12 days, one shared prompt/day, blurred-until-you-write reveal, closing ritual.
- **States:** match · contract (4-sees/4-never-sees) · a-day (write→reveal) · twin-quiet (no blame) · exit-any-day · day-12 closing · re-entry-next-cycle.
- **Data:** `TwinPairs` (cycle_start/end, partner_a/b_hash, shared_tags[], closed_at), `TwinEntries` (pair_id, author_hash, prompt_id, entry_text, written_at; **delete day 13**), `TwinPrompts` (~40/phase, no repeat within 3 cycles). Server **reveal gate** returns both entries only after both `written_at`. Jess one bridge/day.
- **Edge cases:** twin goes silent (graceful, archive); cohort too small to match (queue + Tier-0 fallback); both write within seconds (reveal animation race).
- **Phase:** Phase 5 (Q4). Depends on Witness's 3-strike infra + SecureStore.

## 3.8 Living Wisdom (reverse bridge: wall → compose)  **[Plan]**
- **Purpose:** surface ONE faded, well-held echo into the writing flow as **company, not advice**.
- **States:** eligible-surfaced (max 1/session) · none-eligible · repeat-locked (90-day) · suppressed (crisis/onboarding-14-days/Explore).
- **Data:** `WisdomIndex` (eligible = clean ∧ holds≥5 ∧ age≤180d), `JessWisdomSurfacings` (audit, never-repeat, matched_on). Ranking phase×topic×recency×holds. **Un-screenshottable; topic signal from the user's own words, never shared back.**
- **Phase:** Phase 4–5 (needs ≥30 days of wall data).

## 3.9 Expert layer — AMA / verified clinicians  **[Plan]**
- **Purpose:** the trust + anti-misinformation wedge (§4 B3/B7); general, non-individualised expert content + correction.
- **IA:** an "Ask an Expert" surface **quarantined from peer chat** (Flo model); scheduled live or async Q&A.
- **States:** upcoming AMA · live · archived · expert-answered (badged with GMC/NMC/HCPC register + number) · "not personal medical advice — see your GP/NHS" interstitial.
- **Data:** `Expert` (name, register, number, verified_at), `AMASession`, `AMAQuestion`/`AMAAnswer`. Tier 1 (public-in-app).
- **Edge cases:** an AMA answer drifting into individualised advice (Bolam/GMC risk → templated general-only framing); unverified "expert" (block until register-checked).
- **Phase:** Phase 5+ (post-sale-demo optional, but a strong buyer signal).

## 3.10 Cohort-aware safety surfaces  **[Plan — woven across]**
- **Loss state** (the anti-"72%-of-apps-fail" pathway): a real state that **pauses pregnancy/success content**, offers grief-appropriate support, signposts Tommy's / Miscarriage Association / NHS.
- **Late-luteal gentling:** softer copy, lower-pressure prompts in the late-luteal window (§4 A1).
- **Crisis layer** (already in Echo/Witness): self-harm/abuse detection → UK helpline card (Samaritans 116 123 · Shout 85258 · NHS 111/999 · Mind · Papyrus · **Refuge NDAH 0808 2000 247**) + a **quick-exit** control on abuse-adjacent surfaces.
- **Phase:** woven into 3.5 → 5.

## 3.11 Legacy cleanup  **[Patch]**
- Retire/relocate MP8 `CommunityPosts` (decision §11); delete orphaned `CommunityFeed.jsx`; resolve the `Posts` dual-reaction-schema; run the final no-emoji sweep on any legacy copy.
- **Phase:** Phase 3.5.

---

# §4 — EXTERNAL RESEARCH (cited)

Confidence: **[HIGH]** peer-reviewed/statutory · **[DIR]** directional. Full URLs in §10. Four streams; each finding ends in a design implication.

## 4.1 Evidence base — why these mechanics help
- **Anonymity raises disclosure.** Meta-analysis: anonymity positively correlates with online self-disclosure ("benign disinhibition"); pseudonymous throwaway posts on sensitive topics get *more and better* support. **[HIGH]** → *Design:* pseudonymous-by-default + an "extra-private" affordance for the most stigmatised topics (loss, abuse, fertility).
- **Peer support works — conditionally.** Infertility forum RCT (n=220): **posters had significantly lower anxiety/stress at 8 weeks; lurkers still benefited** ("I healed through reading"). **[HIGH]** → *Design:* make lurking first-class (principle #9); nudge high-distress lurkers to a low-stakes first line (Echo).
- **Moderation is the load-bearing variable.** Benefits materialise **only** with trained, supervised, co-produced moderation; expert moderation measurably reduces agreement with misinformation (β=−0.23). **[HIGH]** → *Design:* hybrid auto-triage + human review; experts moderate medical claims (principle #11).
- **SDT is the rubric.** Autonomy/competence/relatedness drive durable, non-compulsive engagement. **[HIGH]** → *Design:* every surface increases ≥1 need; kill metric-only mechanics.
- **Gratitude/witnessing are evidenced rituals** (meta-analysis, 25 RCTs) — frame as wellbeing ritual, not treatment. **[HIGH]** → *Design:* hold / witness / parting-line as gift mechanics, not scores.
- **Cycle phase shifts mood/social need:** negative mood peaks late-luteal; interpersonal anxiety/withdrawal cluster premenstrually. **[HIGH]** → *Design:* gentler surfaces + proactive "we know this week is hard" in late-luteal; **never** a "luteal-only room" (concentrates low mood).

## 4.2 Domain/market research — how others do it
- **Phase-aware content shielding** (Peanut hides pregnancy scans from TTC users) is the single most important safety pattern; Reddit's opt-in **BFP / good-news threads** are the community-evolved version. **[DIR/HIGH]** → *Design:* gate triggering content by life-stage; good news lives in opt-in rooms, never the default surface.
- **Anonymity engineering** (Flo Anonymous Mode decouples identity from data via OHTTP; auto-assigned avatars) precedes anonymity *marketing*. **[DIR]** → *Design:* engineer so FemWell *cannot* link community identity to health data, and say so (Clue-style stance) under UK GDPR.
- **Ritual recurring threads** (Reddit daily/weekly check-ins) build habit and **contain** emotional load. **[HIGH/DIR]** → *Design:* per-stage rituals (luteal-week thread, two-week-wait check-in) over an infinite feed.
- **Expert quarantine** (Flo "Ask an Expert" separate from peer chat; Peppy/Balance clinician-led; Maven Care Advocate). **[DIR]** → *Design:* a separate expert surface, explicit "not medical advice" framing, register numbers shown.
- **Cohort/buddy matching axis:** match on **interest/identity/stage**, NOT diagnosis/severity (Buddy Project; perinatal realist review — diagnosis-matching breeds "mine is worse"). **[HIGH]** → *Design:* phase drives timing/tone; stage+interest drives grouping.
- **Cohort-specific language is load-bearing** (Tommy's: wrong baby-loss vocabulary re-traumatises; "no agreed way" for families to state preference — a product gap to fill). **[HIGH]** → *Design:* let users set their own loss vocabulary; never auto-apply clinical terms.

## 4.3 Failure modes → mitigations
- **Toxicity is contagious** (diffuses across users/time); moderated communities draw *more* participation. **[HIGH]** → small closed cohorts + active moderation + no public counts (removes pile-on fuel).
- **Social comparison harms** (TTC "everyone's pregnant but me"; girls/women most sensitive to likes/counts; 72% of pregnancy apps fail loss). **[HIGH]** → stage/state-aware gating; a real loss state; no success-broadcast surface; **no likes/leaderboards** (principle #5 is evidence-based).
- **Medical misinformation spreads faster than truth in echo chambers.** **[HIGH]** → expert oversight; NHS signposting; gentle "not medical advice" labels; **empower peer correction** (don't just delete); auto-triage high-risk claims; no engagement-ranked feed.
- **Loneliness amplification** (passive infinite-scroll use predicts rising loneliness over 9 years). **[HIGH]** → design for *stimulation not displacement*: recurring reciprocal cohorts, bounded sessions, no passive infinite feed.
- **Triggering content** (pro-ED/self-harm contagion; blunt removal backfires/silences the vulnerable). **[HIGH]** → soft moderation (warnings, opt-in, redirects to NHS/Beat/Samaritans); distinguish venting from promotion; crisis help one tap away.

## 4.4 The four mechanics the best women's-health communities win on
(1) **anonymity-by-default with engineered identity/data separation**; (2) **phase-/stage-aware shielding of triggering content**; (3) **ritualised recurring threads, not an infinite comparison feed, with no vanity metrics**; (4) **trained, co-produced moderation with expert content walled off from peer chat.** FemWell's locked design already aligns to all four — this research is *confirmatory*, and it upgrades the no-scoreboard rule from brand preference to **evidence-based requirement.**

---

# §5 — COMPETITIVE READ

| Product | Mechanic | EMULATE | AVOID |
|---|---|---|---|
| **Peanut** | Stage rooms; Pods (status-flattened live audio); **phase-aware content shielding**; MVP power-user mods; anonymous *post*, accountable *reply* | Content shielding by life-stage; status-flat audio; asymmetric anonymity; stage rooms | Swipe-to-match as primary entry (shallow); high host-burden live audio |
| **Flo** | "Secret Chats" auto-avatars; hard ban on identifying info; **"Ask an Expert" quarantined**; Anonymous Mode (OHTTP) | Auto-anonymity; expert/peer firewall; "medical advice deleted"; identity/data decoupling | The **FTC found Flo shared health data with Facebook/Google** despite privacy promises — privacy *engineering* must precede *marketing* |
| **Clue** | Loud GDPR stance ("won't comply with subpoenas") | Privacy-as-feature, legally grounded | — |
| **Stardust** | "Privacy first" marketing | — | Policy fine-print contradicts the marketing (will comply with authorities) — fastest way to lose this audience |
| **Maven / Peppy** | Care Advocate human anchor; clinician chat; **expert live broadcast events** | Single human anchor vs "where do I start"; expert broadcast (lower-risk than open peer audio) | Clinician-heavy staffing FemWell can't replicate — borrow the *structure*, not the model |
| **Balance (Newson)** | Free expert content + **balance+ live Q&A**; ORCHA-certified | Expert AMA as the monetisable depth (not the wall) | — |
| **Reddit** (r/TTC, r/Menopause, r/PMDD, r/PCOS, r/endo) | Pseudonymity → disclosure; **recurring ritual threads**; opt-in BFP rooms; supportive-by-design rules; flair | Rituals; opt-in good-news rooms; "be supportive or lurk"; community self-curation | Platform dependence (Reddit **removed** women's-health subs in a 2020 sweep) — own your surface + offer export |
| **Discord** | Channels-as-cohorts; third-place ephemerality | Stage/topic channels; ephemerality (no permanent scoreboard) | Poor discovery + unmoderated-by-default — needs far more structure for health |
| **MP8 (our own live build)** | Likes-and-handles forum | — | **It violates our own principles (#5/#8)** — the cautionary tale is internal |

**Cautionary tale, dissected — Flo × FTC (2021):** Flo marketed privacy while its SDKs **shared "user is menstruating / intends to get pregnant" with Facebook and Google analytics**; the FTC settlement forced consent, third-party data destruction, and user notice. The lesson governs FemWell's entire data posture: **zero third-party analytics/marketing SDKs on health or community data; enforce object-level authorization on every endpoint (the Glow 25M-record breach); never let employers/payers near community data (Ovia); make the policy match the marketing exactly.**

**The wedge (the gap no competitor occupies):** *an anonymity-first, phase-aware, healthy-by-design peer layer that grows OUT of a private journal* — "one entry, four lives." Peanut/Flo bolt community onto a tracker; Maven/Peppy bolt community onto clinicians; none make the **private reflection the seed of every peer interaction**, none run the **hold-only ephemeral one-line wall**, and none structure peer support as an **earned solitude→witness gradient.** That is FemWell's defensible, diligence-proof moat.

---

# PILLAR — COMMUNITY AS A SHARED EXPERIENCE (not a feed)
_Added v1.1 (2026-06-09) per Halli: "shared activities and stuff, maybe a book, a game and stuff, something to keep people engaged, questions to drive people talking — it needs to be a shared app experience." Written to the SPEC_FRAMEWORK depth standard; built from a fresh three-stream cited research pass (cooperative/collective engagement · book-club / shared reading · question-of-the-day + cooperative games)._

## P.0 Why a pillar, not a feature
The §1–§5 surfaces (Echo Wall, Witness, Circles) are **places to be anonymous together**. This pillar is the **shared things we DO together** — the daily heartbeat, the book we're reading, the gentle game, the collective build, the weekly close — that make Community feel like *one room everyone is in*, not a scroll. It is the antidote to the death-spiral (a feed looks dead at low activity; a shared ritual + ever-present aggregate never does) and the engine of belonging (SDT: relatedness without competition).

## P.1 Vision fit + the locked form
Every activity in this pillar takes the **same shape**, derived directly from the research and the locked principles:
- **Collective, not competitive.** Cooperative play promotes prosocial sharing; competition in mental-health contexts is *contraindicated* and disproportionately harms the anxious/comparison-sensitive — exactly FemWell's audience. **[HIGH]** *(PLOS One coop-play; JMIR 2020 social-comparison meta-review; CHI 2025)*
- **Aggregate, never individual.** Replace every count with a community aggregate ("together, women here logged 412 moments of rest"). Surface the **descriptive norm** ("most women in their luteal phase said they felt more tired"), which normalises without shaming — never a per-person number. **[HIGH]** *(social-norms literature; Gas/tbh equity design)*
- **One gentle thing per day, same for everyone, hard-capped (the Wordle law).** One puzzle/prompt a day, identical for all, no second helping — this is *intrinsically* anti-addiction (predictable + scarce, not variable-reward) and creates the shared-experience bond. **[HIGH]** *(Psychology Today on Wordle)*
- **No streaks, no scoreboards, no loss-aversion.** Streaks weaponise loss aversion and add guilt on bad days (luteal, postpartum, loss); the evidence makes "no scoreboard" an *evidence-based requirement*, not a brand preference. **[HIGH]** *(NerdSip; Medium/Bootcamp; the streak-abandonment literature)*
- **Lurking is full membership; design for the 90%.** 90-9-1: ~90% lurk, 9% occasional, 1% create. One-tap/one-word floors let the 90% belong; presence itself feeds the aggregate. Never over-reward the 1% (another reason no leaderboard). **[HIGH]** *(NN/g participation inequality)*
- **Jess is the host — warm, never a roast.** Jess generates prompts/picks/facts/bridges, **tone-locked + template-bounded + reviewed**. The explicit anti-pattern: Fable's Dec-2024 LLM "roast" summaries produced bigoted output about race/disability/sexuality and Fable pulled *all* AI in response. Jess must never be snarky or judge identity/body/life-stage. **[HIGH]** *(Literary Hub; Book Riot; AI Incident DB #882)*
- **Ambient presence, never named.** "31 women are reflecting right now" builds belonging via ambient awareness; a *named* presence ("Sarah is online") imports the FOMO/status pressure we forbid. Aggregate, user-controllable, temporally fading. **[HIGH]** *(ambient-awareness PMC4853799; FOMO Frontiers 2025)*
- **Soft windows, not timed pings.** BeReal's single timed prompt manufactured the very pressure it tried to remove, and bred authenticity-policing — so communal moments are **opt-in soft windows with no record of who skipped.** **[HIGH]** *(CHI 2024 BeReal; Sage 2025)*
- **18+, anonymous-first, no paywalls, UK, no emoji** — inherited, unchanged.

## P.2 The shared-experience surfaces (each fully specced)

### P.2.1 Question of the Day — the daily heartbeat  **[Plan → Phase 3.5]**
- **Purpose:** one low-pressure daily prompt that drives talking and makes Community feel alive every day; the descriptive-norm reveal tells a woman her experience is normal.
- **IA:** top of `CommunityHome` + a card on **Today**; one-tap answerable in place. (Ties to Echo Wall: the one-line format is the same.)
- **UX:** ONE prompt/day, same for everyone. **One-tap or one-word floor** + an *optional* open line (graded depth ladder — light/closed default, depth earned, WNRS model). After answering → **aggregate reveal** ("most women said…", k-floored). **Phase-aware tone:** gentler, validating, non-probing in late luteal (heightened negative-stimulus salience is real, [HIGH]); skip at **zero cost**. Jess draws from a large curated, clinician-screened bank with no near-term repeats; **run ≥60 days consistently** before judging (Reddit ritual rule).
- **States:** unanswered · answered (shows aggregate) · below-k-floor (prompt shown, aggregate suppressed) · skipped · no-phase-anchor (neutral tone) · crisis-intercepted (open line) · offline (cached).
- **Data:** `DailyPrompt` (id, text, type[one_tap/one_word/open], options[], phase_tone[gentle/neutral], life_stage_scope, date) · `PromptAnswer` (prompt_id, author_hash, choice/one_word/line, phase, created_date). Aggregate computed server-side, k-floor 20. Writes `asServiceRole`.
- **Safety:** bank screened for comparison/loss/fertility landmines; phase-tone gating; crisis check on any open line; aggregate-only; zero-cost skip.
- **Metrics:** breadth (% who tapped), prompt-bank diversity, skip rate, "felt seen" qualitative — **never** per-user streaks.
- **Edge cases:** tiny cohort (suppress aggregate); prompt fatigue (large rotated bank; give the aggregate back as the daily payoff); awkward prompt (skip + report a prompt).

### P.2.2 The Book Club / Shared Reading — on the existing BookReader  **[Plan → Phase 4]**
- **Purpose:** shared reading as a **wellbeing intervention** (bibliotherapy/The Reader evidence: reduces isolation, eases loneliness via "feeling understood") — one curated pick, Jess host, predictable cadence.
- **IA:** built **ON the Lifestyle Library/BookReader**; a Book Club card on `CommunityHome`; reading + discussion happen inside the existing reader.
- **UX:** ONE curated pick per cadence (**monthly or 6-weekly — never weekly**, the Oprah-burnout + phase-energy lesson), revealed on a fixed day (ritual). Free **per-life-stage Folios** (curated lists, Fable's free-Folio pattern). **Section-boundary "Let's discuss" prompts** authored by Jess, surfaced inside BookReader **with a tutorial** (avoid Fable's "buried treasure"). **Position-gated spoiler safety** (StoryGraph): a checkpoint's discussion unlocks only when *your* progress reaches it → spoiler-safe AND latecomer-safe. **Persistent per-checkpoint async threads** — "the thread is waiting when you arrive; no one is late." **The Reader's "no pressure to speak or read aloud" norm** — lurking, highlighting, reacting all count. **Soft progress indicator, never a "books-read" leaderboard or streak** (performative-reading evidence; StoryGraph's anti-performative model). **Content/trigger warnings per pick** (loss/fertility/trauma).
- **States:** pick-revealed · reading · checkpoint-unlocked (thread open) · checkpoint-locked (not yet reached) · finished · didn't-finish (no penalty, archived) · tiny-club (k-floor counts) · between-picks.
- **Data:** reuses the existing **Library/BookReader** book entity. New: `BookClubPick` (book_id, host_intro, cadence_start, life_stage_scope, trigger_warnings[]) · `ClubCheckpoint` (pick_id, index, label, unlock_position, jess_prompt) · `ClubNote` (pick_id, checkpoint_index, author_hash, line, created_date) · `ClubProgress` (pick_id, reader_hash, position). Tier 2, anonymous hashes, `asServiceRole`.
- **Safety:** spoiler-gating; trigger warnings; crisis check on notes; moderation; **Jess prompts tone-locked (Fable cautionary tale)**; no scoreboard.
- **Metrics:** % who started a pick, checkpoint-thread breadth, "felt less alone" — **never** books-read counts.
- **Edge cases:** latecomer (threads persist, unlock on catch-up); book not in Library (curate from the existing Library, or flag for acquisition — no new store); club goes quiet (Jess keeps cadence — Goodreads' dead-group lesson).

### P.2.3 Cooperative light games / gentle play  **[Plan → Phase 4 (myth-buster variant 3.5)]**
- **Purpose:** shared ritual play without competition or addiction (the Wordle pattern).
- **Formats (one unit/day max, same for everyone, no leaderboard, predictable reward):**
  - **Body-literacy myth-buster** — supportive, *teaching not testing*: a fact + gentle reassurance on **every** answer, **clinician-checked**, **NHS-signposted**, no score/rank/timer. (Body-literacy field is explicit this must empower, not test punitively.)
  - **Collective story-building** — one line each, shared authorship, no right/wrong (defined by shared authorship, non-competitive).
  - **Guess-the-aggregate / word-association** — the "answer" is the community's collective response, not an individual's score.
- **States:** open · contributed · revealed-aggregate · below-k-floor · crisis-intercepted (free contribution).
- **Data:** `DailyActivity` (id, type[trivia/story/aggregate], date, payload, jess_facts[], nhs_links[]) · `ActivityContribution` (activity_id, author_hash, contribution, created_date).
- **Safety:** trivia facts **pre-authored + clinician-checked + NHS-signposted** — never crowdsource medical claims (the JMIR misinformation evidence: ~60% of peer health-threads carry uncorrected misinformation). **No weight/calorie/competitive content** (banned). Crisis check on free contributions.
- **Metrics:** participation breadth; learning (qualitative). **No scores.**
- **Edge cases:** low participation (a collective story reads fine with few lines); misinformation in a free contribution (moderation + facts are authored, not crowdsourced).

### P.2.4 Collective build / shared-goal pool  **[Plan → Phase 4-5]**
- **Purpose:** belonging via a shared, growing artefact or collective goal — **contribution, not competition** (r/place "impossible to build alone" + collective-impact + gift-economy).
- **UX:** a **collective build** (a community garden / quilt / constellation that grows from contributions — every contribution adds *equally*, none ranked or attributed competitively) OR a **collective wellbeing pool** ("together this week, women here logged 412 moments of rest" — ONE shared bar that only rises, never zeroes, never per-person). Gentle health-positive behaviours only (rest, hydration, gentle movement, a mindful pause).
- **States:** contributing · shared-progress · milestone-reached · cycle-reset (new build) · stalled (Jess gently reframes, never shames).
- **Data:** `CollectiveGoal` (id, kind[build/pool], theme, target, cadence, current_total) · `GoalContribution` (goal_id, author_hash, amount/element, created_date). Aggregate only.
- **Safety:** no individual ranking/attribution; no streak; behaviours screened (no weight/calorie); k-floor on any sub-counts.
- **Metrics:** community-level progress + breadth of contribution. **No individual streaks.**
- **Edge cases:** goal stalls (reframe, never shame); a single contribution still visibly "lands" in the pool (anti-death-spiral).

### P.2.5 Shared rituals & ambient presence  **[Plan → presence 3.5, rituals 4]**
- **Purpose:** belonging without pressure.
- **UX:** **Ambient aggregate presence** ("31 women are reflecting right now / you're not alone") — never named, never online-dots, **user-controllable, temporally fading**. **Recurring communal moments** — a weekly **"close the week"** reflection, seasonal/monthly (new-moon/solstice) gentle moments — delivered as a **soft window**, opt-in, **no record of who skipped** (BeReal lesson).
- **States:** presence-shown · presence-below-k-floor ("among a quiet few tonight" or suppress) · ritual-open (window) · ritual-contributed · ritual-closed (archives) · opted-out.
- **Data:** `PresenceSignal` (derived count, k-floor) · `RitualMoment` (id, kind[weekly_close/seasonal], window_start/end, jess_prompt) · `RitualContribution` (moment_id, author_hash, line).
- **Safety:** aggregate-only presence (k-floor); soft windows not pings; no skip-record; crisis check.
- **Metrics:** ritual participation breadth; presence as a belonging cue (never shown competitively).
- **Edge cases:** missed window (no penalty, contribution archives); quiet night (gentle copy, never "nobody's here").

## P.3 Jess as host (the spine) — guardrails
Jess generates/curates **all** of it: QOTD prompts, book-club discussion prompts, clinician-checked trivia facts, daily bridges, ritual prompts. **Hard rules:** warm + supportive; **never roasting, snarky, or judging identity/body/life-stage**; template-bounded; tone-locked; reviewed; clinical facts clinician-checked + NHS-signposted. **Cautionary tale in-spec:** Fable's 2025 AI-roast incident (and its all-AI pullback) is the explicit thing not to do.

## P.4 Cross-page wiring (this pillar's interlocks)
- **Book Club ↔ Lifestyle Library / BookReader** *(planned):* the club is built **on** the existing BookReader; picks come from the Library; reading + section-boundary discussion prompts happen inside the reader. The single biggest reuse — no new reading engine.
- **QOTD ↔ Today + cycle phase + Echo Wall** *(planned):* QOTD is the daily heartbeat surfaced on **Today**; **phase drives tone** (gentler in luteal); the one-tap/one-line format **is** the Echo Wall format — a QOTD open answer can *optionally* become an echo (one-tap → "share as a line").
- **Games / collective pools ↔ Planner + Health** *(planned):* a logged gentle behaviour the **Planner/Health** already tracks (a rest moment, a glass of water) can be **contributed to the community pool** — **aggregate only, never the individual's data exposed to peers** (the §6.3 Health contract holds). Body-literacy trivia ties to the cycle/Health model.
- **Jess (AI) as host** *(shipped scrub/crisis; planned generation):* the prompt/pick/fact generator for every surface, tone-locked.
- **Circles as the container** *(planned):* a Circle (stage/interest cohort, §3.6) can run **its own** QOTD, book pick, collective build or ritual — the shared-experience surfaces are the *content* that fills the Circles container. Global vs Circle-scoped is an open question (P.6).
- **Notifications** *(planned):* informational only ("the new book pick is live", "this week's close-the-week is open") — **never** FOMO/streak/count nudges (§6.11 holds).

## P.5 Rollout slotting (into the existing phases)
- **Phase 3.5 (with the route correction):** **QOTD** (the daily heartbeat — makes the new `/Community` feel alive from day one and defeats the death-spiral); **ambient aggregate presence**; a **body-literacy myth-buster** as a QOTD variant. Low entity cost; high belonging payoff.
- **Phase 4:** **Book Club** on BookReader; **cooperative games** (story-building, guess-the-aggregate); **collective build / pool**; **weekly/seasonal rituals**; **Circles-as-container**.
- **Phase 5:** deepen — per-cohort activities, expert-led / clinician-curated book picks (ties to the §3.9 expert layer), seasonal events.
- **Paywall:** all free by principle. Expert-curated picks/AMAs are the only monetisable depth — never the activities themselves.

## P.6 New open questions (this pillar — folded into §11)
- **Book-club cadence:** monthly vs 6-weekly? *(Rec: 6-weekly — gentler for low-energy phases.)*
- **Collective-build metaphor:** garden / quilt / constellation / tapestry? *(Rec: a seasonal one that resets per cycle — Ms Atelier to choose.)*
- **Do QOTD answers feed the Echo Wall** (one-tap → optional echo), or stay separate? *(Rec: optional opt-in bridge, never automatic.)*
- **Trivia fact-bank clinician sign-off owner** — ties to the §3.9 expert layer. *(Rec: same verified-clinician pool.)*
- **Activity scope:** global, Circle-scoped, or both? *(Rec: global at launch, Circle-scoped in Phase 4 once Circles exist.)*

## P.7 Research basis (cited; full lists in the three agent passes + §10)
Cooperative > competitive for wellbeing/inclusion: PLOS One coop-play (https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0221092) [HIGH]; competition contraindicated in mental-health apps: JMIR 2020 (https://www.jmir.org/2020/3/e15642/) [HIGH]. Collective build / contribution-not-competition: r/place (https://en.wikipedia.org/wiki/R/place) [DIR]; gift-economy First Monday (https://firstmonday.org/ojs/index.php/fm/article/download/1101/1021) [HIGH]. Streak/loss-aversion harm: NerdSip (https://nerdsip.com/blog/gamification-gone-wrong-when-streaks-become-the-point) [HIGH]. Participation inequality 90-9-1: NN/g (https://www.nngroup.com/articles/participation-inequality/) [HIGH]. Ambient presence: PMC4853799 (https://pmc.ncbi.nlm.nih.gov/articles/PMC4853799/) [HIGH]; FOMO: Frontiers 2025 (https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1582572/full) [HIGH]. BeReal soft-moment lesson: CHI 2024 (https://dl.acm.org/doi/10.1145/3613904.3642690) [HIGH]. Wordle once-a-day shared-not-competitive: Psychology Today (https://www.psychologytoday.com/ca/blog/the-asymmetric-brain/202201/the-psychology-behind-wordle) [HIGH]. Book club: StoryGraph buddy-reads/spoiler-gating (https://thestorygraph.freshdesk.com/support/solutions/articles/79000141943-buddy-reads-and-readalongs-on-the-storygraph) [HIGH]; Fable mechanics + AI cautionary tale (https://bookriot.com/fable-book-club-app-review/ , https://lithub.com/fables-ai-generated-end-of-year-reading-summaries-veered-into-bigotry/) [HIGH]; Reese/Oprah/Jenna curated-pick model (https://reesesbookclub.com/faqs/) [HIGH]; bibliotherapy/The Reader wellbeing evidence (https://www.thereader.org.uk/shared-reading-wwd/our-research/ , https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2025.1681462/full) [HIGH]. QOTD/descriptive-norm + one-tap floor: Nulab QOTD (https://nulab.com/learn/collaboration/question-of-the-day-examples/) [HIGH], Gas equity design (https://en.wikipedia.org/wiki/Gas_(app)) [HIGH], WNRS depth ladder (https://www.werenotreallystrangers.com/) [HIGH]. Luteal emotional-salience (phase-aware prompts): PLOS One (https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0059780) [HIGH]. Health-trivia misinformation guardrail: JMIR 2025 (https://www.jmir.org/2025/1/e71140) [HIGH].

---

# §6 — CROSS-APP / CROSS-FEATURE RELATIONSHIPS

The interlock map. Direction notation: → (data/affordance flows that way). **Shipped** vs **Planned** marked per block.

## 6.1 Journal ↔ Community  *(the spine)*
- **Journal → Echo Wall** *(shipped):* an entry → Share-as-Echo → Jess scrub → cooled → `Echo` row carrying `source_entry_hash` (one-way, not joinable to the entry). Entry point: `Journal.jsx`/`NewEntrySheet`.
- **Journal → Witness** *(shipped):* an entry → "Ask for a witness" → encrypted `entry_ciphertext` in `WitnessRequest`. Re-seals back to the Journal on cancel.
- **Journal → Phase Twin** *(planned):* both twins write `TwinEntries` to a shared `TwinPrompt`; the Journal is the writing surface.
- **Community → Journal (reverse: Living Wisdom)** *(planned):* a faded well-held `Echo` surfaces into the compose flow as company; **never** screenshotted/exported.
- **The unifying contract:** **"one entry, four lives"** — a per-entry chooser (lock/echo/seal/witness), **at the entry level, never by default.** *(This unified chooser is the key unbuilt bridge — §2.4 #5.)*
- **Shared primitive:** **FemWell SecureStore** (`journalCrypto.js`) — Tier-3 client crypto built for Sealed Letters, reused for Witness ciphertext and Twin entries.

## 6.2 Today ↔ Community
- **Today → Community** *(partly shipped — OnThisDay/PhaseInbox):* the Today surface can host the **Tier-0 "others in your phase tonight"** belonging card and a **Living Wisdom** surfacing slot (planned). The morning ritual can gently invite an echo on a heavy day.
- **Community → Today:** never a raw feed; only the aggregate belonging signal and a single opt-in wisdom card.

## 6.3 Health / Pulse ↔ Community
- **Health → Community** *(planned):* the **phase + life-stage anchor** (cycle day, stage) that drives Echo weighting, Witness/Twin matching, and Tier-0 cohorts comes from the Health/cycle model. A logged symptom severity (e.g. luteal "heavy" signal) feeds the **anonymised aggregate count only** — never content.
- **Contract:** Community reads phase/stage; it **never writes** to Health, and never exposes an individual's Health data to peers.

## 6.4 Planner ↔ Community
- **Planner → Community** *(planned):* a **Circle** can be program-scoped (e.g. "Sleep Reset cohort") so a Planner program spawns a closing, time-boxed support cohort. Late-luteal Planner days can surface the gentler community copy.

## 6.5 Lifestyle ↔ Community
- *(planned, light):* Lifestyle interest tags can seed **interest-based circle matching** (the evidence-backed matching axis, §4) — match on interest/stage, not diagnosis.

## 6.6 Doctor Export ↔ Community  *(the commonly-forgotten one — explicit)*
- **Contract (critical):** the Doctor/GP export reads **`JournalEntries` only**, and **EXCLUDES** burns, sealed letters, echoes, witness entries, and twin entries. Community-tier content is **anonymous and ephemeral and must never appear in a clinical export** (it isn't the user's clinical record, and exporting a peer's held entry would breach their anonymity). *Echoes/Witness/Twin are Tier-2/Tier-3 and are out of scope of the export by design.*

## 6.7 Jess (AI) ↔ Community  *(the connective tissue)*
- **Jess → Community** *(shipped for Echo/Witness scrub + crisis; planned for Twin/Wisdom):* Jess **scrubs** an entry to one shareable line, **detects** identifying detail and **crisis** content (routes to support, never to a peer), writes the **one daily bridge note** between twins, and **synthesises** the day-12 themes. Jess is "the only voice between" paired users.
- **Hard rule:** Jess's "Jess-noticed" closer is **absent** on pages where the user's own content is the lead (Journal, Community). Jess never editorialises a peer's words.
- **Misinformation contract** *(planned):* Jess + verified experts are the medical voice; peer chat never is.

## 6.8 Horoscope ↔ Community
- *(planned, light/optional):* phase-cohort copy can borrow the "inner season" voice; **keep clinical framing neutral** — astrology must never gate or moralise health content (§5 Stardust caution). Likely N/A for the core peer surfaces.

## 6.9 Onboarding ↔ Community
- **Onboarding → Community** *(planned):* deliver the **Tier-0 belonging signal during onboarding** regardless of the comfort-level decision (§4: lurkers benefit immediately). Capture **explicit special-category consent** (§7) here. Decide the **teen routing** here (§7/§11).

## 6.10 Settings ↔ Community
- *(planned):* Echo Wall settings (who-can-see → `visibility`; guardrails; fade window); consent withdrawal; **data export + delete** (GDPR erasure → deletion cascade burns echoes/witness/twin/sealed); the quick-exit/abuse safety toggle.

## 6.11 Notifications ↔ Community  *(the commonly-forgotten one — explicit)*
- **Rule:** notifications are **informational and respectful, never manufactured FOMO** (§4 A2). Allowed: "a sister is holding your entry"; "your twin wrote today"; an AMA you opted into. **Forbidden:** "5 people are active now," streak reminders, "you're missing out," any count-based or variable-reward nudge. **No red-dot engagement bait.** Late-luteal: reduce notification pressure.

---

# §7 — SAFETY · PRIVACY · COMPLIANCE

## 7.1 Anonymity / identity model (with honest limits)
- **Model:** pseudonymous-by-default at the data layer — rows carry **no user id/email/name**, only a device-derived hash (`author_hash` for Echo, a separate-namespace `witness_hash` for Witness so the two can't be joined). Writes go through **`asServiceRole` service-identity functions** so the platform `created_by` is the service, not the author (the prior live `created_by` leak is **fixed** for Echo and Witness).
- **Honest limits (flagged, not hidden):** (a) retract-by-hash only works from the same browser/device; clearing site data loses it (content fades anyway). (b) **Witness "E2E" is at-rest + access-gated, NOT zero-knowledge** — a per-request key rides in the envelope; true E2E between anonymous strangers needs a SecureStore key-exchange v2 (#1 open crypto item). (c) Client-only rate limits (Echo 5/day) are bypassable until server-enforced (Phase 3.5). (d) A determined platform operator with DB access can still see hashes + timing metadata — principle #10 mitigations (aggregate-only, k-floor, unlinkable tokens) reduce but do not eliminate this.

## 7.2 Data pipeline
- **On-device:** raw entry text, the scrub, crisis check, device secret, all hashing. Raw text never leaves the device for Echo; for Witness it leaves only as ciphertext released solely to the assigned receiver.
- **Server (asServiceRole):** the scrubbed echo line, hashes, lifecycle timestamps, counts. Never the user id.
- **Never stored:** raw journal text on the wall; crisis content (a **data dead-end** — nothing reusable, nothing to analytics/AI/commercial); any peer's name/region/photo.

## 7.3 Sensitivity tiers + deletion cascade
- **Tier 1 (public-in-app):** Circles, AMASessions, legacy Posts.
- **Tier 2 (server, per-user-encrypted):** Echoes, EchoHolds, TwinPairs/TwinEntries, PhaseAggregates (derived).
- **Tier 3 (E2E/client-only keys):** WitnessRequests, WitnessStrikes, Sealed Letters, Journal locked entries.
- **Deletion cascade:** account delete **burns** sealed letters, echoes, witness requests, twin entries (GDPR erasure). Condition-circle membership and consent records purge with the account.

## 7.4 Moderation / abuse model
- **Hybrid:** automated first-pass (self-harm/abuse/illegal/medical-misinformation flagging) → human review queue. Proportionate to a small service.
- **Rate limits + reputation/account-age gating** blunt throwaway abuse without banning throwaways.
- **Health-misinformation lane:** clinician/expert escalation — never algorithm-only on clinical claims; **empower peer correction**.
- **Witness/Twin:** 3-strike removal, FLAG_SECURE intent (best-effort on web), report→hide.
- **Moderator welfare:** rotation + debriefs even for a tiny team (Samaritans guidance).

## 7.5 Crisis handling
- Detection (self-harm/suicide/abuse) → a **non-judgemental UK support card** *before/alongside* moderation: **Samaritans 116 123 · Shout text 85258 · NHS 111 / 999 · Mind · Papyrus HOPELINE · Refuge NDAH 0808 2000 247.** No method/location detail; content warnings on sensitive threads; **quick-exit ("hide page")** on abuse-adjacent surfaces; **no algorithmic amplification** of distress; suppress harmful autocomplete. *(Ms Verify: confirm the NDAH + Papyrus numbers against refuge.org.uk / papyrus-uk.org before ship.)*

## 7.6 UK legal floor (requirement vs nice-to-have; owners named)
**This is the deploy-blocker for any scaled real-traffic wall.** Three statutes stack:
- **[LEGAL — REQUIRED] Online Safety Act 2023.** The Community is a **regulated user-to-user service**; baseline duties bind *all* in-scope services regardless of size (Ofcom runs a "small but risky" taskforce). Required: a written **illegal-content risk assessment** (was due **16 Mar 2025**), **content-reporting (s.20) + complaints (s.21)** systems, a named **senior accountable individual**, **ToS** describing protections + any proactive tech; and — because the **teen** life-stage can reach a social surface — a **children's-access assessment** (due 16 Apr 2025) and likely a **children's risk assessment** (due 24 Jul 2025) with Primary-Priority-Content gating (self-harm/ED/suicide/porn). Fines up to **£18m or 10% of qualifying worldwide revenue**; senior-manager criminal liability for ignoring Ofcom. **Owner: Halli (must appoint the accountable individual + commission the risk assessments).**
- **[LEGAL — REQUIRED] UK GDPR / DPA 2018.** Every health post is **special-category (Art. 9)** data → Art. 6 basis **+** a separate Art. 9 condition. **Use explicit consent (Art. 9(2)(a))**, captured in onboarding, withdrawable — **not** 9(2)(e) "made public" (it's narrow and forfeits erasure rights). Required artefacts: an **Appropriate Policy Document**, a **DPIA** (health + likely-children = high-risk), a documented retention/deletion policy, working erasure. **Owner: Halli / DPO.**
- **[RESOLVED BY THE 18+ DECISION] ICO Children's Code.** Community is **18+ adults-only**, so the Children's Code does not bind the peer surface (no minors reach it). High-privacy defaults, data minimisation and geolocation-off remain good practice for the wider app. **An 18+ age-gate is required at the Community boundary. Owner: Halli.**
- **[✅ DECIDED 2026-06-09 — 18+ ONLY] Teen routing.** Community is **adults-only (18+)**; under-18s have **no access** to any peer surface. This removes the ICO Children's Code + OSA children's-RA + minor age-assurance burden **entirely** — only an **18+ age-gate** remains at the Community boundary. **Named senior accountable person: Halli.**
- **Status:** all of the above is **specced, none executed.** Safe for a **controlled sale demo with seeded/no real user data**; **required before any real user posts at scale.**

---

# §8 — RISK REGISTER

| # | Risk (failure it prevents) | Countermeasure (in this design) |
|---|---|---|
| 1 | **Off-thesis live surface** — `/Community` is the MP8 likes-forum, violating principles #5/#8 and undercutting the diligence story | Route correction (3.1): make the editorial anonymity-first surface the real `/Community`; retire MP8's `likes_count` (§9, §11 decision 1) |
| 2 | **De-anonymisation** — a reader links a row to a person | Service-identity writes (done for Echo/Witness); separate hash namespaces; aggregate-only + **k-floor 20**; honest limits disclosed (principle #10) |
| 3 | **Privacy theatre** — claiming anonymity the architecture doesn't deliver | §7.1 honest-limits block; fix client-only rate limits server-side (3.5); SecureStore key-exchange v2 on the roadmap; **policy matches marketing** (Flo/Stardust lesson) |
| 4 | **OSA/ICO non-compliance** — unlawful user-to-user health service | §7.6 legal floor with named owner + deadlines; s.20/s.21 UI; risk assessments; explicit consent + APD + DPIA; teen routing decision |
| 5 | **Medical misinformation harms a user** | Expert moderation lane (principle #11); NHS signposting; "not medical advice" labels; empower peer correction; no engagement-ranked feed (§4 B3) |
| 6 | **Social-comparison / loss re-traumatisation** (TTC, baby loss) | Stage/state-aware content gating; a real **loss state** (anti-72%-failure); good news in opt-in rooms only; **no likes/leaderboards** (§4 B2) |
| 7 | **Toxicity / pile-on** | Small closed cohorts; active hybrid moderation; **no public counts to ratio**; treat abuse as contagious — intervene early (§4 B3/B1) |
| 8 | **Loneliness amplification** | Design for stimulation not displacement; bounded sessions; **no passive infinite feed**; recurring reciprocal cohorts (§4 B4) |
| 9 | **Engagement dark-patterns creep in** | No streaks/variable-reward/red-dot notifications; SDT rubric; informational-only notifications (§6.11) |
| 10 | **Brand drift** — emoji, US/Naija register, scoreboards | No-emoji rule; UK locale (NHS/£/GP/Samaritans); no-scoreboard principle is now *evidence-backed* (§4) |
| 11 | **Phase-as-wall mistake** — a "luteal room" concentrates low mood | Phase drives timing/tone only; grouping is by stage+interest (§4 phase-aware) |
| 12 | **Platform/portability risk** — community hostage to one platform | Owned surface; data export + erasure (principle #12; Reddit-takedown lesson) |
| 13 | **Cohort-language harm** (wrong baby-loss terms) | User-set loss vocabulary; never auto-apply clinical terms (§4 Tommy's) |
| 14 | **FLAG_SECURE is best-effort on web** (screenshot of a witnessed entry) | Honest limit; capture-attempt strike; native Capacitor FLAG_SECURE when packaged; charter sets the norm |
| 15 | **Legacy data debt** (`Posts` dual schema, orphaned feed, dormant entity) | Phase 3.5 cleanup (3.11) |

---

# §9 — PHASED ROLLOUT ROADMAP

Mapped to FemWell's phase numbering. Each phase is independently shippable + live-walked; Ms Atelier crafts → Ms Verify gates → a STATUS ship-log line per commit.

**Phase 3 — Echo Wall tier — ✅ LIVE.** Echo Wall + Share-as-Echo + scrub + crisis + cooling + 4-reactions + fade + report + service-anon (`postEcho`). *Not done by design:* server rate-limits, aggregate card, Circles.

**Phase 3.5 — Route correction + belonging + legal floor — NEXT (the unblock).**
- Scope: **make the editorial surface the real `/Community`** (3.1); surface the **Witness Dock** there; ship the **Tier-0 "others in your phase" card** (3.5) + k-floor; **server-enforce Echo rate limits**; **legacy cleanup** (3.11: retire/relocate MP8, delete orphaned feed, fix `Posts` schema, no-emoji sweep); **execute the OSA/ICO legal floor** (risk assessments, s.20/s.21 UI, explicit-consent onboarding, APD, DPIA, teen routing).
- Entities/functions: `PhaseAggregates` (derived), server rate-limit in `postEcho`.
- Mod/risk cost: low-moderate (the legal paperwork is the real cost — Halli-owned).
- **Exit gate:** `/Community` renders the editorial surface; Tier-0 card live + k-floor verified; legal artefacts on file; Ms Verify webkit walk.
- Dependencies: the §11 decision on MP8's fate.

**Phase 4 — Circles + Living Wisdom + dock hardening — Q3-equivalent.**
- Scope: **Circles** taxonomy (stage/interest matching, circle-scoped echoes via `visibility:circles`); **Living Wisdom** v1 (needs ≥30 days wall data); Witness dock formalised; condition-circle consent flows.
- Entities: `Circle`, `CircleMember`, `WisdomIndex`, `JessWisdomSurfacings`. (Created the free repo way — `base44/entities/*.jsonc` — see the verified entity-creation finding.)
- Exit gate: a joined circle scopes echoes; one wisdom card surfaces under its transparency rules; condition circles gated by explicit consent.
- Dependencies: Phase 3.5 cohorts + accumulated wall data.

**Phase 5 — Phase Twin + Expert layer — Q4-equivalent.**
- Scope: **Phase Twin** (match → contract → blurred-reveal → Jess bridge → day-12 ritual → parting-line); **Expert AMA** surface (verified GMC/NMC/HCPC, quarantined from peer chat); the **loss state** + late-luteal gentling woven through.
- Entities: `TwinPairs`, `TwinEntries`, `TwinPrompts`, `Expert`, `AMASession`, `AMAQuestion`/`AMAAnswer`; server **reveal gate** + Jess bridge functions.
- Exit gate: a 12-day container opens/closes correctly; reveal gate server-enforced; an AMA answer carries a register number + "not medical advice" framing.
- Dependencies: Witness 3-strike infra + SecureStore (key-exchange v2 ideally).

**Separate track (Halli's call, not on the anonymous-peer roadmap):** Circle of Three (private named circle), Partner Sync, Care Bridge v2 (clinician share — B2B, GMC-verified, London endo cohort ≤30).

**Paywall parking:** peer surfaces are **free by principle**. The Plus/Pro tier, if any, monetises **expert depth** (AMAs, specialist content) and the separate clinical track — never the wall, Witness, or Twin.

---

# §10 — SOURCE MAP

| Spec area | Source(s) |
|---|---|
| Demos (features/copy) | `src/pages/CommunityDemo1–5.jsx`, `CommunityMP8.jsx` (read in full) |
| Prior specs | `claude-state/COMMUNITY_BUILD_SPEC.md` v2, `JOURNAL_BUILD_SPEC.md` v3, `master-plan.md` |
| Built status / code | `src/pages/Community.jsx`, `CommunityMP8.jsx`, `src/components/community/CommunityFeed.jsx`, `src/components/journal/echo/*`, `src/components/journal/witness/*`, `src/App.jsx` (routing), `base44/entities/{Echo,WitnessRequest,WitnessStrike,Posts,CommunityPosts,Reports,AnonymousSession}.jsonc`, `base44/functions/{postEcho,retractEcho,postWitnessRequest,claimWitness,respondWitness,cancelWitness,flagWitness,getWitnessStatus,moderatePost}` |
| Framework | `claude-state/SPEC_FRAMEWORK.md` v1 |
| Entity-creation finding | `claude-state/STATUS.md` KEY FINDING 2026-06-08; `memory/base44-entities-via-repo.md` |

**Research URLs (selected; full lists in agent outputs folded into §4/§5):**
- Online Safety Act 2023 — https://www.legislation.gov.uk/ukpga/2023/50 · gov.uk explainer — https://www.gov.uk/government/publications/online-safety-act-explainer/online-safety-act-explainer · Ofcom illegal-content duties — https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/illegal-content-duties-under-the-online-safety-act
- ICO special-category data — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/ · ICO Children's Code — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/ · ICO APD — https://ico.org.uk/about-the-ico/our-information/safeguards-policy/policy-document-our-processing-of-special-categories-of-personal-data-and-criminal-offence-data/
- Samaritans tech-industry guidelines — https://www.samaritans.org/about-samaritans/research-policy/internet-suicide/guidelines-tech-industry/
- FTC v Flo — https://www.ftc.gov/news-events/news/press-releases/2021/01/developer-popular-womens-fertility-tracking-app-settles-ftc-allegations-it-misled-consumers-about
- Infertility peer-support RCT (n=220) — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8158233/ · PMDD Reddit study — https://www.nature.com/articles/s41598-025-19220-2 · Buddy Project (matching axis) — https://mental.jmir.org/2021/1/e21819/ · Perinatal peer-support realist review — https://pmc.ncbi.nlm.nih.gov/articles/PMC10410814/
- Misinformation + expert moderation — https://pmc.ncbi.nlm.nih.gov/articles/PMC10436646/ · Quality/misinformation in peer groups — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12125560/
- Loneliness 9-year study — https://news.web.baylor.edu/news/story/2025/social-medias-double-edged-sword-study-links-both-active-and-passive-use-rising · Ephemerality & comparison — https://www.mdpi.com/2076-0760/12/2/87 · SDT/online communities — https://www.nature.com/articles/s41598-024-74878-4
- Cycle phase × mood — https://pmc.ncbi.nlm.nih.gov/articles/PMC8906247/ · Tommy's baby-loss language — https://www.tommys.org/about-us/news-views/language-around-baby-loss-still-causing-harm-says-new-report · IAPMD self-harm/suicidality — https://www.iapmd.org/self-harm-suicidality · Endometriosis UK — https://www.endometriosis-uk.org/support-groups · Verity (PCOS) — https://www.verity-pcos.org.uk/
- Peanut (phase shielding, Pods) — https://techcrunch.com/2021/04/27/social-networking-app-for-women-peanut-adds-live-audio-rooms/ · Flo Secret Chats rules — https://flo.health/secret-chats-rules · Flo Anonymous Mode — https://techcrunch.com/2022/09/14/period-tracking-app-flo-anonymous-mode/ · Balance/Newson — https://www.balance-menopause.com/balance-app/ · Maven — https://www.mavenclinic.com/programs/menopause · Peppy — https://www.peppy.health/what-we-do/menopause/ · GMC registers — https://www.gmc-uk.org/registration-and-licensing/our-registers · HCPC — https://www.hcpc-uk.org/public/which-professions-do-hcpc-regulate/

*(The four agent research reports — with per-finding confidence flags and the full ~70-source list — are reproduced in the build session transcript; the high-value primaries are mirrored above.)*

---

# §11 — OPEN DECISIONS FOR HALLI

**Blocking (deploy of a scaled, real-traffic Community can't proceed without these):**
1. **✅ DECIDED (2026-06-09) — MP8's fate / route correction.** Option (a) ACCEPTED: **retire the MP8 forum entirely and make the editorial anonymity-first surface the real `/Community`.** (MP8's `likes_count`/handles violated principles #5/#8; this is the locked thesis + the diligence story.) Now a Phase 3.5 build item, not an open question.
2. **✅ DECIDED (2026-06-09) — OSA/ICO owner.** **Halli is the named senior accountable person.** Community is **18+ adults-only**, which removes the children's risk assessments + minor age-assurance. Still to execute (Phase 3.5 gate, Halli-owned): the **illegal-content risk assessment**, **s.20/s.21** report+complaints UI, **APD**, **DPIA**, **explicit special-category consent flow**, and an **18+ age-gate**. Safe to demo on seeded data meanwhile.
3. **✅ DECIDED (2026-06-09) — Community is 18+ (adults only).** Under-18s have **no access** to any peer surface. Removes the ICO Children's Code + OSA children's-RA + minor age-assurance burden entirely; only an **18+ age-gate** (self-declared + proportionate assurance) remains.

**Important (shape the build, not blocking a demo):**
4. **Per-card hold-count visibility** — keep small aggregate counts on echoes, or move counts to the author's private "My Echoes" only (the reconciliation said "private to writer")? **Recommendation:** keep small counts but review against de-anonymisation in tiny cohorts (k-floor logic).
5. **Phase scope for cohorts** — exact cycle day, ±1-day window, or whole phase for weighting/matching? **Recommendation:** whole-phase soft weighting (shipped); revisit with data.
6. **Crisis-intercept escalation** — auto-disable peer surfaces 24h after an intercept fires, or a soft toggle? **Recommendation:** soft toggle + a gentle check-in; auto-disable risks punishing the most vulnerable.
7. **Onboarding** — let users pick a sharing comfort level, or earn surfaces as entries accumulate? **Recommendation:** earn surfaces (principle #2), but deliver the **Tier-0 belonging signal immediately** regardless.
8. **Circles investment** — build the full phase/program/region/life-stage/condition taxonomy with circle-scoped echoes, or stay light? **Recommendation:** yes in Phase 4 — it is the evidence-backed "small cohort" unit (§4), but **match on stage+interest, never phase-as-wall.**
9. **Expert AMA layer** — in scope before the sale demo (a strong buyer signal + the misinformation wedge), or post-sale? **Recommendation:** a lightweight async "Ask an Expert" before the demo if a verified clinician is available; full live AMAs post-demo.
10. **Separate track** — do Circle of Three / Partner Sync / Care Bridge v2 join the Community roadmap or stay separate? **Recommendation:** stay separate (narrow-private/clinical, not anonymous-peer).

**Shared-experience pillar (new, 2026-06-09 — full detail in P.6):** book-club cadence (rec: 6-weekly); collective-build metaphor (garden/quilt/constellation — Atelier's call); whether QOTD answers can opt-in to become echoes (rec: optional, never automatic); who clinician-signs-off the body-literacy fact bank (rec: the §3.9 expert pool); activity scope global vs Circle-scoped (rec: global at launch, Circle-scoped in Phase 4).

**WHOLE-LIFE REBALANCE (new, 2026-06-09 — full plan: `claude-state/WHOLE_LIFE_REBALANCE.html`).** Strategic correction from Halli: FemWell over-indexed on clinical/cycle; it must be a whole-life app ("health is one room, not the house"). Now baked into CLAUDE.md as two standing rules (span life not just health; wire ALL surfaces). Decisions surfaced: **(a)** restructure IA around whole-life rooms (Lounge/Circles/Me-My-Shelf/Money&Work/Love/Style/Lighter Side/Health) vs broaden in place — *rec: broaden + consolidate the clinical trio*; **(b)** consolidate Pulse/Trends/Insights into one Health room (the biggest clinical over-index) — *rec: yes*; **(c)** add interests/identity capture to onboarding for interest-first matching — *rec: yes*; **(d)** green-light **The Lounge** (anonymous kind vent/gossip, the daily-engagement engine, heavy moderation, 18+) — *rec: yes*; **(e)** broaden the Shared-Experience pillar with the 22-item NON-clinical activity catalogue (role-play, fashion, hot-takes, archetype play, ask-the-room, etc.) — *rec: yes*; **(f)** sale-demo priority order of new rooms (Lounge + QOTD + Book Club + Me-My-Shelf = highest belonging-per-effort).

**AUDIO / TALK-IT-OUT (new, 2026-06-09 — full design: `claude-state/AUDIO_TALK_IT_OUT.html`).** A spoken sibling to Echo/Witness/Circles in three modes. Decisions: **(a)** build **async voice-notes (Mode A)** next — buildable in-repo (MediaRecorder → Base44 UploadFile → `VoiceNote` entity, reuses Echo scaffolding) — *rec: yes*; **(b)** offer **voice masking** with the honest "harder to recognise, not anonymous" framing — *rec: opt-in*; **(c)** **live audio (Modes B 1:1 turn-based, C small Circles) needs an external WebRTC provider — recommend LiveKit** — Base44 can host the token function but **Halli must create the provider account + keys + the entity + an OSA risk assessment** before live scales; **(d)** does the held-3 gate apply to 1:1 Talk-It-Out (rec: lighter gate). **Feasibility verdict: async-first in-repo now; live is a later phase gated on Halli's provider setup + OSA RA.**

**Carried from source docs (still open):** the "Witness" vs "Hold" naming sweep (gesture vs feature name); the legacy `Posts` feed's long-term fate; the Living Wisdom holds-threshold (recommended 5) after data.

---

# §12 — DEFINITION OF DONE / DEPTH CHECKLIST (self-graded)

**Structure & capture**
- [x] All 12 sections present.
- [x] Every source read word-for-word and captured 1:1 (§2; demos, specs, live code) — verbatim copy in quotes; tables reproduced; **the demo→built reconciliation is the centrepiece (§2.4)**.
- [x] Source-vs-source conflicts flagged with a "which wins" ruling (§2.3, 6 conflicts).

**Feature inventory**
- [x] Every feature has purpose · IA · states · data wiring with named entities · interactions · edge cases · phase tag (§3).
- [x] No feature "wired to the database" without a named entity.
- [x] Phase-tag legend defined (§0).

**Research & competition**
- [x] Many credible, resolving sources cited with confidence flags (§4, §10; ~70 across the four agent passes).
- [x] Evidence base separated from domain/market research (§4.1 vs §4.2).
- [x] Every finding ends in a design implication (§4).
- [x] Multiple named competitors in an EMULATE/AVOID table with concrete mechanics (§5, 9 products).
- [x] A cautionary tale dissected (Flo×FTC, §5) + the wedge named (§5).

**Cross-app & data**
- [x] Cross-app relationships are their own substantial section with data-flow direction + entry points + shared primitives (§6, 11 surfaces).
- [x] Doctor-export / Jess / notifications interlocks explicitly addressed (§6.6, §6.7, §6.11).

**Safety, risk, compliance**
- [x] Anonymity/identity model stated with honest limits (§7.1).
- [x] Sensitivity tier + deletion cascade stated (§7.3).
- [x] UK legal floor explicit — OSA duties, ICO special-category consent + APD, Children's Code + age assurance; legal-vs-nice-to-have distinguished; owner named (§7.6).
- [x] Risk register — each risk has a countermeasure in the design (§8, 15 risks).

**Rollout, provenance, decisions**
- [x] Each phase independently shippable with exit gate + "not done by design" (§9).
- [x] Source map traces areas to origin; research URLs included (§10).
- [x] Open decisions with options + recommendation; blocking ones flagged distinctly (§11).

**Brand & craft**
- [x] No emoji in any specified UI.
- [x] UK locale throughout (NHS/Samaritans/Mind/Refuge, GP, £, en-GB).
- [x] No scoreboards/streak-shame in any specified mechanic (and the MP8 `likes_count` is flagged for removal).
- [x] Craft bar named (Editorial kit; Ms Atelier crafts → Ms Verify gates, §9).

**Self-grade**
- [x] This checklist reproduced and ticked. **One waiver:** §6.8 (Horoscope) is marked likely-N/A for core peer surfaces with a one-line reason rather than a full interlock — justified because the peer layer is deliberately kept clinically neutral (§5 Stardust caution).

---

# APPENDIX A — Entities to create (the free repo path: `base44/entities/<Name>.jsonc`, Echo.jsonc shape)
- **Phase 3.5:** `PhaseAggregates` (or a derived count query — may need no entity).
- **Phase 4:** `Circle`, `CircleMember`, `WisdomIndex`, `JessWisdomSurfacings`.
- **Phase 5:** `TwinPairs`, `TwinEntries`, `TwinPrompts`, `Expert`, `AMASession`, `AMAQuestion`, `AMAAnswer`.
- (Entity creation is verified-free via repo `.jsonc` + sync — see the KEY FINDING in STATUS.md.)

# APPENDIX B — Server functions to add
- **Phase 3.5:** server-side Echo rate-limit (extend `postEcho`); aggregate count function for Tier-0.
- **Phase 4:** circle join/scope; `surfaceWisdom` (eligibility + repeat-lock).
- **Phase 5:** Phase-Twin `matchTwin` / `revealGate` / `twinBridge` (Jess); AMA post/answer with register verification.
- All writes `asServiceRole` for anonymity parity with Echo/Witness.

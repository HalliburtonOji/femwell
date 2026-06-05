# FemWell Community — BUILD SPEC (production, Editorial direction) — v2

_Owner: Mr Lead Manager. Craft: Ms Atelier. Research: Ms Deep Search. Verification gate: Ms Verify._
_v2 2026-06-05 — rebuilt to the `SPEC_FRAMEWORK.md` v1 standard and brought to the depth of `JOURNAL_BUILD_SPEC.md` v3. Every source read in full, word for word; the live Echo Wall read line by line; a **fresh, deeply-cited research pass** (two Ms Deep Search briefs, 2025–2026 sources) folded in; a real brainstorming pass (§5) for the non-obvious shape; cross-app relations promoted to their own section (§7). Community is the **peer-shapes half** of the same system the Journal spec covers — this doc is its twin._

> **THESIS (locked, from the Journal master plan):** **"Journal owns the writer. Community owns the peer shapes."** One entry can flow through both — **"one entry, four lives":** stay locked (default) · become an **echo** · be **sealed** to future-you · be handed to **one witness**. Community is where the peer shapes live: **Echo Wall → Witness → Phase Twin**, on a **solitude → witness gradient**, plus **Circles** and the **Living Wisdom** flywheel. **Ship the solo features first, earn the paired ones.** Community is anonymous-first; the widest anything travels is **one scrubbed line to the in-app wall** — no public profile, no web-public audience, no named feed.
>
> **THE ONE LINE THAT SHOULD SURVIVE EVERY REVISION (the research verdict):** *sell common humanity, not disclosure volume.* The evidence (§4) is that the very behaviour which makes a support community feel "close" — co-rumination, reassurance-seeking, reading others' distress — is the behaviour that worsens mood and spreads it. FemWell's whole differentiated design (one line, hold-only, no threads, fade-by-default, fixed responses, phase-cohort belonging) is an **evidence-aligned countermeasure** to that, not just an aesthetic. Protect it.
>
> **WHERE WE ARE (2026-06-05):** Live anchor = **origin/main `647754a`**, bundle **`index-B3BplAS-.js`**. The first social tier — **Echo Wall (Phase 3)** — is BUILT and **patch-ready** (`femwell_journal_phase3_echowall_2026-06-03.patch`, on `484fafe`), **LIVE-QA'd end-to-end on `index-B3BplAS-.js` with zero functional bugs (session l)**, but **NOT deployed**, and blocked on **one base44 action by Halli: create the `Echo` entity** (no programmatic create path — §8.2 / Appendix A / `claude-state/ECHO_ENTITY_base44_prompt.md`). A real anonymity caveat is confirmed live (base44 stamps `created_by` and returns it to wall readers — §8.1). Witness (Q3) and Phase Twin (Q4) are designed but unbuilt. This spec captures the **whole** Community surface so the remaining quarters ship against one authority.
>
> **Hard brand rules:** UK market (NHS, GMC/NMC/HCPC, £, UK GDPR/DPA 2018) · **no emoji anywhere** (Lucide + custom SVG only) · Editorial type kit (Ephesis script · Caveat hand · Cormorant serif · Inter chrome) · one unified bottom nav at all viewports · **no scoreboards** (no likes, follows, handles, karma, leaderboards) · evidence-informed, never a clinical promise.

---

# §0 — HOW TO READ THIS DOC
- **§1** captures the master-plan Community vision 1:1 (the peer half of the Journal master plan + the sharing demos).
- **§2** is the FULL FEATURE INVENTORY — every Community surface, its states, data wiring, base44 entities, and phase. This is the build queue.
- **§3** is the EXTERNAL RESEARCH pass (cited, 2025–2026), evidence base + design implications.
- **§4** — wait, see the map below; sections are ordered to the framework but grouped for reading.

**Section map (to `SPEC_FRAMEWORK.md` v1):** §1 Vision & principles · §2 Feature inventory (framework §3) · §3 1:1 source capture lives inline in §1 + §2 and is indexed in §10 · §4 External research (framework §4) · §5 Brainstorming + non-obvious shape *(FemWell addition — the ideation the brief asked for)* · §6 Competitive read (framework §5) · §7 Cross-app relations (framework §6) · §8 Safety/privacy/compliance (framework §7) · §9 Risk register (framework §8) · §10 Phased roadmap (framework §9) · §11 Source map (framework §10) · §12 Open decisions (framework §11) · §13 Definition of Done (framework §12) · §14 Craft bar · Appendix A entities.

---

# §1 — VISION & PRINCIPLES (the master plan, captured 1:1)

## 1.0 The frame
Community is **"for sisters, near and anonymous"** — anything that needs another person. It is the deliberate counterweight to the Journal (**"for you and future-you"**, everything under your lock). The Journal master plan draws a single system across both pages and walks the user along a **solitude → witness gradient** as trust builds:

> **Cycle Mirror → Sealed Letters → Echo Wall → Witness Mode → Phase Twin.**
> The first two are SOLO (they live in the Journal). The last three are PEER (they live in Community). **"Journal gets the depth. Community earns the proximity."**

Runway framing: **6-month sale window, 9-month soft cap** — Community is the differentiating moat (the Echo Wall in particular: _"the highest-leverage differentiating play"_), so it is built carefully, not rushed.

## 1.1 The peer concepts on the gradient *(verbatim: body · moat · voice · quarter)*
Concept colours `g3 #C17B4E (Echo) → g4 #8B2635 (Witness) → g5 #4A2A3A (Twin)`.

3. **Echo Wall — "A room of one-liners."** _(Q2 — BUILT, patch-ready, live-QA'd)_
   - Body: Anonymous one-line entries from women in the same phase, **holding only (no replies, no DMs).** Fades on a default window. Jess scrubs identifying content on-device before any echo leaves.
   - Moat: _"Clue publishes phase statistics; Flo runs topic chat. Nobody runs a phase-cohort one-line feed with hold-only reactions. This is the highest-leverage differentiating play."_
   - Voice: _"Five women on luteal d18–20 wrote something one line long, this hour."_ / _"A room of one-liners. No handles, no threads, just sisters holding sentences."_
4. **Witness Mode — "Read this. Hold it."** _(Q3, paired — requires witness-gate + 3 strikes)_
   - Body: Single entry handed to one matched sister. **4 fixed responses or pass silently.** No thread. No chat. No screenshot. Writer can cancel before she reads. Receiver picks one line — never her own words.
   - Moat: _"The pattern doesn't exist commercially. The answer to 'I need to be heard, I don't need a conversation' — the most common emotional state in the luteal data."_
   - Voice: _"I'm holding this with you."_
5. **Phase Twin — "Twelve days. One shape."** _(Q4, deepest — last to ship)_
   - Body: Seasonal **12-day pairing** with another woman in the same phase + life stage. One shared prompt a day. **Her answer blurred until you write yours.** Container closes at next period day 1; no re-entry that cycle.
   - Moat: _"BabyCenter cohorts by due date; nobody cohorts by phase for a finite ritual. Closest analogue is Strava beacon."_
   - Voice: _"A 12-day container. Not a friendship."_

## 1.2 What's locked — the Community principles *(adapted from the master plan's 8, peer-specific; each is a decision that can reject a design)*
1. **Anonymity is the default** for any peer surface. UUID-only echoes, hashed author token (retract without de-anonymising), no handles, no profile, no carry-over between sessions/pairings. _"No public profile — Community is anonymous-first."_
2. **Solo before social.** Cycle Mirror and Sealed Letters (Journal) earn the trust that Echo Wall, Witness, and Phase Twin spend.
3. **Reactions are emotional, not transactional.** No like. No emoji pile-on. No follow. Counts are never used to rank a feed. (Lexicon: see §12 reconciliation — master plan `same · hold · hear you · saved` vs shipped Echo Wall `held · me too`.)
4. **Phase-aware copy across the board** — luteal/follicular/ovulatory/menstrual voice; "your phase" weighting, never a hard filter that walls a sister out.
5. **No scoreboards anywhere.** No streaks, XP, badges, leaderboards, "most relatable," public popularity. Every mechanic that would gamify gets a gentler replacement (hold not like; Phase Twin not leaderboard). *Research backs this hard: popularity ranking buries accurate-but-unpopular health info and amplifies anecdote (§4.6).*
6. **Evidence-informed, never clinical promise.** A peer is not a clinician; the surface always has a visible escalation path to NHS/Samaritans/Mind that sits **beside** peer content, never blended into it (§4.5 Maven lesson).
7. **No emoji codepoints anywhere** — Lucide + custom SVG only (the shipped Echo Wall already obeys this; the legacy Posts feed still has emoji and is the one fix on the ledger).
8. **Public-feed creep is the enemy.** Every social mechanic grows a follow button if you let it. Hard rules: **no handles, no threads, no DMs, no like, no leaderboard.** Echo Wall + Witness die the moment they grow conversation. *Research-reinforced: the no-threads rule is also the #1 co-rumination countermeasure (§4.1).*
9. **(NEW, v2) Belonging before posting.** The first tier of community is a zero-disclosure, zero-moderation *aggregate* ("others in your phase felt this too"), delivered before the user is ever asked to post. The Clue model (§4.4) + the first-session-belonging retention finding (§4.7) make this Tier 0, ahead of any social surface.
10. **(NEW, v2) Anonymity must survive metadata.** Reactions/holds are aggregate-only and never reveal *who* reacted (the Telegram de-anon trap, §4.8 / §8.1); surfaced cohort counts respect a **k-anonymity floor** (suppress below ~20); rate limits are enforced without reconstructing identity (§8.5). Honesty over claims: pseudonymous-to-peers is stated plainly; what the platform can still see is disclosed, never marketed away (the Stardust line, §6).

## 1.3 "One entry, four lives" — the Journal↔Community handoff *(from community_v2)*
The same reflection, decided **at the entry level, never by default**, can take four lives:
- **Stay locked** — default; lives in the Journal under the user's key. (Tier 3, E2E.)
- **Become an echo** — Jess offers ONE scrubbed line; it goes to the Echo Wall, anonymous, fades in 48h. (Entry point: a **Share-as-Echo slot** on the Journal composer + on an individual entry.)
- **Be sealed** — a Sealed Letter to future-you (Journal-side, solo).
- **Be handed to one witness** — Witness Mode (Community-side, paired). (Entry point: a **"Feels heavy? Hand it to a witness"** slot on an individual entry.)

The handoff is the system's spine: **Journal = the writer's page** (locked by default; Mirror + Sealed Letters + Share-as-Echo slot). **Community = the peer-shape page** (anonymous by default; Echo Wall + Witness dock + Phase Twin card + Circles + AMAs). Full detail in §7.

## 1.4 The two pages, element by element *(community_v2 "kept / new / shifted" maps — verbatim)*
**Journal page (writer):** KEPT — Jess prompt · Tonight's prompts · Threads · Pattern card · Privacy footer. NEW — Cycle Mirror (d19 × 5) · Sealed Letters rail · Anniversary surfacing · **Share-as-Echo slot**. _(All built across Journal Phases 0–3; see the Journal spec.)_

**Community page (peer):** KEPT — Composer · **Circles carousel** · Gentle reactions · AMA card · Quiet mode. SHIFTED — _Jess "smart pick" → Echo Wall_ (the wall replaces the old "Jess picked for you" named-author surfacing as the primary peer surface). NEW — **Echo Wall feed** · **Witness dock** · **Phase Twin card** · Composer extended with witness + echo tools. _("Witness Mode is a dock, not a page — receive one, be one. Phase Twin is a seasonal opt-in card. Circles + AMAs stay.")_

## 1.5 The reconciliations already made *(master plan §1.5 — peer items)*
1. **Echo fade window** — **48h ships first** (more protective; lower retention pressure). Move to 7d only after 3 cycles of cohort data show no harm. _(SHIPPED at 48h. Note: the sharing_deep demo + the Echo Wall Settings demo both show "7 days default · max 14" — that is the demo target, not the ship floor. Keep 48h until 3 safe cycles.)_
2. **Holds count visibility** — **private to writer only.** A public count creates ranking incentives the brand can't carry. _(NB: the shipped Echo Wall shows aggregate counts on the card to all viewers — see §12 open decision; the demo "My echoes" tab is where private holds live: "8 echoes posted · 4 live · 419 holds received".)_
3. **Witness re-route on no-response** — **both:** 2h writer-cancel window; if the receiver doesn't open within 6h, route to one fallback receiver with a "sent on after waiting" note; after that, archive to the writer's letter library.
4. **Echo Wall home** — **Community-side rail with a Journal-side opt-in slot.** _(SHIPPED exactly this way.)_
5. **Cultural register** — **UK-locked.** Echo Wall is anonymous in production, so this affects demo strings + brand register + crisis resources (Samaritans/NHS 111/Shout/Mind). _(SHIPPED UK; legacy demo names like Ada/Amara/Nneka are superseded.)_

## 1.6 The evidence base *(bibliography, never marketing — peer-relevant threads; deepened in §4)*
- **Neff — self-compassion → common humanity:** the **common-humanity** leg is the justification for cycle-cohort framing (Echo Wall, Phase Twin) — "you're not the only one in your inner autumn tonight." Its opposite, *isolation* ("feeling all alone in one's suffering"), is exactly what the Journal is "the loneliest page" against.
- **CHI 2024 — post-Roe privacy:** the top fear is government/law-enforcement access to cycle data. **Visible privacy beats invisible privacy.** Community must be *visibly* un-compellable (no PII at rest).
- **Vulnerability-Amplifying Interaction Loops (2025):** names the sycophancy failure mode — **Jess must observe, not companion.** The Living Wisdom flywheel must surface *company, not advice*.
- **Co-rumination / emotional-contagion (the central finding, §4.1):** *reading* others' distress in peer-support networks is itself a documented source of worry and contagion; co-rumination and excessive reassurance-seeking predict *worse* mood and mediate depression/anxiety contagion between peers. This is the single biggest design constraint and it **validates** the one-line / fade / non-transactional / no-thread design as a countermeasure.

---

# §2 — FULL FEATURE INVENTORY (the build queue)

Legend — **Live** = shipped to production · **Patch** = built, patch-ready, not deployed · **Demo** = designed in a demo/spec, not built · **Plan** = named, needs design.
States checked for every surface: **empty / loading / error / partial / populated** (+ surface-specific).

---

## 2.0 — TIER 0: "Others in your phase" aggregate belonging card — **Plan (NEW, research-driven; recommend pulling forward to 3.5)**
*The cheapest, safest community primitive — and per §4 the one that should arrive FIRST.*
- **What:** a zero-disclosure, zero-moderation belonging signal that needs no post and no peer exposure — "847 women in your luteal phase logged something heavy this week" / "you're one of 312 in your inner autumn tonight." Borrowed from Clue's sub-phase aggregate (§4.4 / §6); converts cold stats into *you're-not-alone* with no 1:1 exposure and nothing to moderate. Delivered in **onboarding** (first-session belonging, §4.7) and as a quiet header on the wall.
- **Purpose:** give the comfort of a cohort before the user is asked to disclose anything; raise first-session retention; soften the empty Echo Wall.
- **IA placement:** onboarding step; Community Echo Wall header; optionally Today's reflective stack.
- **States:** loading · populated · **suppressed** (cohort below the k-anonymity floor — see below — show normalisation copy without a number) · error.
- **Data wiring:** a derived count over `Echo` (or over anonymised cycle/phase aggregates), never naming anyone; **k-anonymity floor ≥ 20** before any number is shown (§4.8 / §8.1).
- **Interactions:** none required (read-only); optional "leave the first line" CTA into Share-as-Echo when the cohort is small.
- **Edge cases:** brand-new app with no cohort data → pure normalisation copy, no count; tiny phase cohort → suppressed.
- **Entities:** a derived `PhaseAggregates` view (or a count query); no new PII.
- **Phase:** 3.5 (recommend pulling forward; near-zero cost, high leverage).

---

## 2.A — SHIPPED / PATCH-READY (Phase 3 — the Echo Wall tier)

### 2.A.1 Community page shell + Echo Wall / Posts view toggle — **Patch**
- **What:** `src/pages/Community.jsx` gains a top **Echo Wall / Posts** view toggle. **Echo Wall is the default.** The legacy Posts feed (FAB, new-post sheet, category pills, its pre-existing emoji) is fully preserved under the Posts tab, gated and untouched ("no brick on bread").
- **Purpose:** make the anonymous wall the primary peer surface without destroying the working legacy feed.
- **IA placement:** Community page; top view toggle.
- **States:** toggle persists view; each sub-view owns its own empty/loading/error.
- **Data:** Echo Wall → `Echo` entity; Posts → existing `CommunityPosts`/circles primitive (untouched).
- **Entities:** `Echo` (NEW — must be created). Posts feed reuses existing entities.
- **Phase:** 3 (patch-ready). **Decision flag (§12):** Echo Wall defaults on — one-line flip to default-Posts if Halli prefers.

### 2.A.2 Echo Wall feed — **Patch** *(`src/components/journal/echo/EchoWall.jsx`)*
- **What:** a phase-weighted feed of anonymous one-liners. Everyone's live echoes are eligible; the feed is **WEIGHTED toward the viewer's phase sisters** (soft boost in ranking — `PHASE_MATCH_BOOST 600` + `LIFE_STAGE_BOOST 150` + recency half-life 6h — **never a hard filter**). A "your phase" chip marks sister echoes. A live cohort line heads the wall ("3 of women in their inner autumn left a line in this window"). Demo register: _"A room of one lines · 312 echoes tonight · same phase only"_, with a filter strip **Same phase / All phases / Follicular / Ovulatory / Luteal / Period**.
- **Purpose:** ambient, anonymous "you're not alone in this phase tonight."
- **IA placement:** Community page, Echo Wall view (default).
- **States:** **loading** (gold spinner) · **error** ("The wall couldn't open just now…") · **empty** ("Quiet, for now — No echoes in this window yet. If something is true for you, you can leave the first — from your Journal.") · **populated** (ranked cards with fade label, e.g. "fades in 6d 23h" / shipped "Echoes fade after…").
- **Data wiring:** `base44.entities.Echo.filter({ hidden: false }, "-created_date", 200)`; live/cooling/expired decided **on-device** (time-derived from `live_at`/`expires_at`); `rankFeed()` from `echoSafety.js`.
- **Interactions:** filter by phase; hold / me too; flag; (own) pull-it-back.
- **Edge cases:** all echoes in window are cooling/expired → empty state; viewer has no phase anchor → unknown-phase weighting (no sister boost, still interleaves).
- **Entities:** `Echo`.
- **Phase:** 3.

### 2.A.3 Share-as-Echo — **Patch** *(`ShareAsEchoSheet.jsx` + Journal entry points)*
- **What:** the Journal-side composer flow: write → **Jess offers a scrubbed line** (shows what was removed) → **crisis intercept** (UK resources, never posts) → cooling/throttle notice → **Share / Edit first / Keep private** → "It's held" / blocked / rate-limited. Entry points: a **Share-as-Echo slot** that replaced the honest "Echo wall · Coming" teaser on `Journal.jsx`, **and** a "Share a line from this as an echo" affordance in `NewEntrySheet.jsx` Write mode (appears once there's text, seeded with the draft). Demo copy: _"Here's a line that won't give you away — rewritten from your entry, phase-tagged, untraceable"_; the scrub heads-up: _"your entry mentioned sleep meds. Jess left that out. Anything that names you, a person, or a substance gets scrubbed before it hits the wall."_
- **Purpose:** turn one private line into anonymous company without exposing the writer.
- **IA placement:** Journal composer + individual-entry affordance; overlay sheet.
- **States:** offered / edited / crisis-intercepted / cooling-notice / shared("It's held") / blocked(identifier remained) / rate-limited(5/day) / kept-private.
- **Data wiring:** `scrubToEcho()` + `crisisCheck()` (on-device, `echoScrub.js`); `computeCooling()` (`echoSafety.js`); `authorHash()` + `bumpEchoesToday()` (`echoAnon.js`); `Echo.create({...})` with the scrubbed body, never the raw text.
- **Edge cases:** scrub leaves too little to post → blocked with a gentle reason; late-luteal/late-night → held to next 06:00; over daily limit → rate-limited message.
- **Entities:** `Echo`.
- **Phase:** 3.

### 2.A.4 Still-cooling / "Pull it back" strip — **Patch**
- **What:** the author's own still-cooling echoes (between post and `live_at`) appear **only to them**, dashed, with the go-live time and a **"Pull it back"** (retract) control. Retract = `Echo.delete` + `forgetMine`.
- **States:** present when the author has cooling echoes; hidden otherwise.
- **Data:** filtered on `author_hash === myHash && isCooling(e)`.
- **Entities:** `Echo`.
- **Phase:** 3.

### 2.A.5 Echo reactions — **Patch** (fixed lexicon `held` / `me too`)
- **What:** two non-transactional reactions (`HeartHandshake` = held, `Users` = me too), one-way (you can hold, you can't un-hold), on-device dedup. Counts shown on the card; never used to rank.
- **States:** un-reacted / reacted(disabled, gold).
- **Data:** `hasReacted/markReacted` (local); `Echo.update(id, {held_count|metoo_count})`.
- **Entities:** `Echo`. **De-anon rule (§8.1):** counts are aggregate-only — the wall must never reveal *who* held (the Telegram trap, §4.8).
- **Phase:** 3. **Reconciliation flag (§12):** master plan lexicon `same · hold · hear you · saved` (4); shipped wall `held · me too` (2). Decide one and sweep.

### 2.A.6 Report → auto-hide — **Patch**
- **What:** a `Flag` on each echo; `report_count` increments; at `REPORT_AUTOHIDE_THRESHOLD (2)` the client sets `hidden=true` and the echo vanishes for everyone. On-device report dedup.
- **States:** un-reported / reported(disabled).
- **Data:** `hasReported/markReported`; `Echo.update(id, {report_count, hidden})`.
- **Entities:** `Echo`. **Honest limit:** community-moderation counters are client-enforced in v1 (any signed-in user can update counters by design) — server-side moderation is Q3 hardening (§4.3).
- **Phase:** 3.

### 2.A.7 Auto-unpost (expired-echo cleanup) — **Patch**
- **What:** on wall load, the author's own expired echoes are **hard-deleted** (`Echo.delete`), and no echo past `expires_at` ever renders. Master-plan "auto-unpost after 48h app absence" is approximated client-side.
- **Entities:** `Echo`. **Honest limit:** a scheduled server-side purge is the Q3 complement (so echoes from a device that never returns still get cleaned).
- **Phase:** 3.

### 2.A.8 The Echo entity + its rails (the substrate)
- **Schema-as-code:** `base44/entities/Echo.jsonc` — fields `body · author_hash · phase(enum) · life_stage · cycle_day · source_entry_hash · live_at · expires_at · held_count · metoo_count · report_count · hidden · visibility(enum same_phase/circles/all, default all)`. Required: body, author_hash, live_at, expires_at. Indexes: phase, expires_at, hidden. Read: all signed-in; Create/Update: any signed-in; **Delete: creator only.** No user_id/email by design.
- **Config (`echoConfig.js`):** FADE_HOURS 48 · COOL_MINUTES_BASE 10 / LATE_LUTEAL 30 · NIGHT 22:00–06:00 · LATE_LUTEAL_DAY 22 · MAX_ECHO_LEN 180 · DAILY_ECHO_LIMIT 5 · REPORT_AUTOHIDE_THRESHOLD 2 · feed weights · the `held`/`me too` lexicon · phase-cohort copy · **UK crisis resources (Samaritans 116 123 · NHS 111 · Shout 85258 · Mind 0300 123 3393)** + crisis pattern lexicon.
- **>>> base44 ACTION FOR HALLI (Appendix A): create the `Echo` entity ONCE <<<** — no programmatic create path exists; Data tab → Create entity (preferred, no AI build points) or the one authorized chat-builder prompt in `claude-state/ECHO_ENTITY_base44_prompt.md`. **Verified live (session j/l): the entity did not exist, then was created by Halli; the wall round-trips 200 on create/read/update/delete with no 403.**

---

## 2.B — DESIGNED, NOT BUILT (Echo Wall depth — Q3 hardening pass)

### 2.B.1 "My Echoes" tab — **Demo** *(sharing_deep PHONE 1C)*
- **What:** the author's own echoes: **Live (n) / Faded (n) / Drafts** tabs; per-echo hold count, "Edit line", "Unpost"; a header tally ("8 echoes posted · 4 live · 419 holds received"); a **Quiet mode** toggle ("auto-unpost all my echoes if I don't open the app for 48 hours"). This is where **holds are private to the writer** (reconciliation #2).
- **States:** live / faded / drafts / quiet-mode on-off / empty (no echoes yet).
- **Data:** filter `Echo` by `author_hash === myHash`; needs an `edited_at` field if "Edit line" persists; Drafts need a local or entity store.
- **Entities:** `Echo` (+ optional `edited_at` field; Drafts may be on-device).
- **Phase:** 3.5 / Q3.

### 2.B.2 Echo Wall Settings — **Demo** *(sharing_deep PHONE 1D)*
- **What:** "How you show up on the wall. All changes apply to future echoes only." Three sections: **Who can see my echoes** — *Same-phase sisters only* [default] · *My circles* (e.g. Peri Watch, Luteal Softness) · *All sisters* (widest reach, least context) → drives the `visibility` enum already reserved on `Echo`; **Guardrails** — *Jess rewrites before I see the line* (scrubs names/locations/dates/substances) · *Hold me for 10 minutes before posting* (cooling, cancellable) · *Block posts during late luteal d24–28* (can override); **Fading** — *Echoes fade after 7 days [default, max 14]* · *Holds are private to me* (counts visible, identities never).
- **States:** standard settings; reflects current `visibility` + guardrail toggles.
- **Data wiring:** user-level preferences (a `EchoPrefs`/`UserPreferences` field set); the audience choice sets the `visibility` written on new echoes (the field exists but v1 always writes `all`).
- **Entities:** `Echo.visibility` (exists) + a prefs store (`UserPreferences` extension or new `EchoPrefs`).
- **Phase:** 3.5 / Q3. **Note:** the demo defaults fade to 7d; the shipped reconciliation is **48h first**, move to 7d only after 3 cycles of safe data — keep 48h until then. "Block during late luteal" maps to the already-shipped late-luteal throttle.

### 2.B.3 Server-side moderation + anonymity hardening — **Plan** *(research §4.3 / §4.8)*
- **What:** the Q3 complement that takes the v1 client rails to a compliant, abuse-resistant server posture: a **`postEcho`** function writing under a service identity (true anonymity — removes the `created_by` leak, §8.1); a **scheduled purge** function (server-side fade + auto-unpost); **server-enforced rate limits** via an unlinkable-token / nullifier scheme (§8.5); an **`EchoFlags`** entity for auditable reports (replaces client-only dedup); and an **AI pre-screen** (text + username filters + known-image hashing) gating posts before they're visible, with **human spot-check** on flags (the Samaritans hybrid model, §4.3).
- **States:** N/A (infrastructure) — observable as: posts held pending pre-screen; flags routed to a human queue; crisis-flagged posts pulled from feed.
- **Entities:** `EchoFlags`; server functions `postEcho`, `purgeEchoes`, rate-limit token issuer.
- **Phase:** 3.5 / Q3. **This is a legal-floor item, not polish — see §8.**

---

## 2.C — WITNESS MODE (Q3, paired) — **Demo** *(sharing_deep §04 + community_v2 dock)*

### 2.C.1 Witness dock (Community-side) — **Demo**
- **What:** _"Witness Mode is a dock, not a page — receive one, be one."_ A card on Community: "A sister shared once. Will you read it?" → opens a **locked, no-copy, no-screenshot** single entry + the 4 fixed responses + pass-silently.
- **States:** none-waiting / one-waiting / reading / responded / passed.
- **Entities:** `WitnessRequests`.
- **Phase:** 4 (Q3).

### 2.C.2 Writer toggle + match (Journal/entry-side) — **Demo**
- **What:** "Want one sister to witness this?" on a Journal entry → "Send to one witness · matched in the next 2–4h · no handle exchanged · you can cancel before it's read." Match-by criteria (default: same phase + life stage; tighten/loosen). Pulsing "a sister is being matched…" state.
- **States:** toggle off / matching / matched / read / cancelled (2h window) / re-routed (6h fallback) / archived to letter library.
- **Data wiring:** the **pairing engine** — phase + life-stage + language match; no profile, no handle, no carry-over; matching in a separate VPC; double-hashed witness tokens never joined to users.
- **Entities:** `WitnessRequests` (`writer_hash · entry_ciphertext · match_criteria · matched_at · read_at · response_code(1–4|null)`). **Tier 3, E2E** (the entry is ciphertext — reuse the SecureStore primitive built with Sealed Letters in Journal Phase 2).
- **Phase:** 4 (Q3).

### 2.C.3 Receiver view (4 fixed responses) — **Demo**
- **What:** "A sister needs a witness. Will you read one thing, once?" → locked entry (no copy) + the **4 fixed Fraunces/Caveat lines**: _"I'm holding this with you. / Me too. / You're not alone in this. / I hear you."_ + **pass silently** ("she won't know you read it"). After choosing, the entry seals again and leaves no history. *The fixed-response lexicon is the single biggest abuse/contagion reducer (§4.1) — no free text, ever.*
- **States:** request / reading / one-of-4 chosen / passed.
- **Entities:** `WitnessRequests` (response_code).
- **Phase:** 4 (Q3).

### 2.C.4 Witness gate ("held 3 before you send") — **Demo**
- **What:** _"You can hold someone when you've been held."_ Only sisters **witnessed ≥ 3 times** can volunteer to be a witness — pay-it-forward, prevents drive-by senders. Pathway card ("you've been witnessed 2 times. One more to unlock."). *This is FemWell's version of the Wisdo "Helper" giving-loop (§4.7) — reward giving, not seeking.*
- **Entities:** counts derived from `WitnessRequests`.
- **Phase:** 4 (Q3).

### 2.C.5 Witness charter (first-time consent, 6 rails) — **Demo**
- **What:** shown once (re-readable from Settings). The 6 rails: **Anonymous** (she sees entry + phase + life stage, never handle/photo/region) · **One-shot** (one read, one fixed response, no DM/follow/re-view) · **Cancel before she reads** (2h re-seal) · **Not for crisis** (self-harm → Panic Mode + trained resources, never a peer) · **No names/locations** (Jess asks you to edit if she detects identifying detail) · **You choose her shape** (default same phase + life stage; tighten/loosen). The receiver-side charter adds: not a therapist; choose from the 4 lines or pass; **never screenshot** (OS-level no-copy; attempting is a strike); never discuss it; opt out anytime.
- **Phase:** 4 (Q3).

### 2.C.6 3-strike receiver policy + FLAG_SECURE — **Demo**
- **What:** _"3 strikes and the door closes."_ Screenshot attempts, replying outside the 4 lines, or flagging innocuous entries as crisis removes a receiver from the pool (strike record opaque to the user; trust team sees full record). **FLAG_SECURE** (Android) + iOS capture prevention on the receiver view + Phase Twin reveal.
- **Entities:** `WitnessStrikes` (`witness_hash · strike_type · occurred_at`). **Tier 3.**
- **Phase:** 4 (Q3). **Note:** FLAG_SECURE/iOS capture-prevention is a **native** capability — needs the Capacitor wrap (cross-link `project_capacitor_stripe_paywall`). Flag as a native dependency.

### 2.C.7 Crisis escalation routing (writer-side) — **Demo** *(extends the shipped Echo crisis intercept)*
- **What:** _"This sounds heavy. A peer isn't the right shape for tonight. You deserve more than a sister can hold. Not less. More."_ Keyword+context hit → route to **Panic Mode + UK resources (Samaritans 116 123, NHS 111, Shout 85258, your Person)** — never to a peer. The entry stays sealed; nothing is sent. Writer may still send to Witness after opening at least one resource card — Jess checks. (The Echo Wall already ships this intercept logic in `echoScrub.js`/`echoConfig.js`; Witness reuses it.)
- **Phase:** 4 (Q3) — but the underlying intercept is **already shipped** in Phase 3. *This is an OSA-mandated layer, not optional (§8.4).*

---

## 2.D — PHASE TWIN (Q4, deepest) — **Demo** *(sharing_deep §05)*

### 2.D.1 Match screen — **Demo**
- **What:** "Day 1 of 12 · luteal match. You've been matched with one sister for this cycle." Shared tags (e.g. #work-stress), life stage, "no kids"; **today's shared prompt**; "you'll see her entry the moment you both write. Not before." Container-closes countdown. Twin avatar rendered **blurred** (never resolves to a person).
- **States:** matched-day-1 / unwritten / waiting-on-twin / both-written / twin-quiet (4+ days → gentle re-match) / exited.
- **Entities:** `TwinPairs` (`cycle_start · cycle_end · partner_a_hash · partner_b_hash · shared_tags[] · closed_at`).
- **Phase:** 5 (Q4).

### 2.D.2 Both-wrote reveal + Jess bridging — **Demo**
- **What:** entries reveal **only after a server-side gate confirms both `written_at`**; Jess posts **one bridging note per day** ("two luteal women, two different edges to soften — inbox and mother — and both of you called it… sit with that"); a "days written together" counter.
- **Data wiring:** **server-side reveal gate** (returns both entries only after both written — so neither lives in two realities). Entry is also writable to the writer's own journal, marked as a twin-entry.
- **Entities:** `TwinEntries` (`pair_id · author_hash · prompt_id · entry_text · written_at`; delete on day 13), `TwinPrompts` (~40/phase, no repeat within 3 cycles).
- **Phase:** 5 (Q4).

### 2.D.3 Opt-in onboarding (12-day contract) — **Demo**
- **What:** _"A 12-day container. Not a friendship. Jess is the only voice between you."_ Contract (verbatim from the demo): *One shared prompt per day — you each write privately, see hers only after you've written yours · No chat, ever — Jess is the only voice between you · 12 days then it ends (re-enter next cycle) · She can go quiet (4+ days → gentle re-match, no blame) · You can exit any day (both just stop seeing each other).* A **shared / not-shared matrix:** she sees phase+day, life stage, shared tag, today's entry only; she never sees name/handle, other entries, region/photo, past cycles.
- **Phase:** 5 (Q4).

### 2.D.4 Closing ritual (day 12 keepsake) — **Demo**
- **What:** day 12 — "12 days. 8 shared entries. One shape you both wrote." Jess names the shared themes (the keepsake arc: "softening work on days 1,3,7 · mothers on 2,6 · saying no on 9,10 · sleep on 11 — four edges, one luteal, two sisters"); each carries **one of the other's lines** (parting-line exchange, 48h window). "The container has closed. You can re-enter on your next cycle — a new twin, same Jess."
- **Container rules:** opens at matching, closes at next period day 1, **no re-entry that cycle.** Max 1 active twin at a time. A 12-day cron closes the pair; 48h parting-line window; then archived read-only to each writer's own journal.
- **Entities:** `TwinPairs` (closed_at), `TwinEntries`.
- **Phase:** 5 (Q4).

---

## 2.E — LIVING WISDOM (Echo × Jess flywheel) — **Demo/Plan** *(living_wisdom demo, copy_deck, roadmap #10)*
- **What:** collective Echo wisdom surfaced **into the compose flow as company, not advice.** Journal trigger: 60s sustained writing + phase/topic match ≥ threshold → **one faded wisdom card inline, max 1/session** ("someone 19 days in wrote this · 42 holds"). Ranking phase×topic×recency×holds; **90-day repeat lock**; topic signals from the user's own words, **never shared back**; the surfaced Echo **cannot be screenshotted/exported.** Surfaces: journal / today / panic_afterglow / jess_drawer.
- **Purpose:** make every Echo an atomic piece of collective wisdom that compounds retention and can't be replicated by a generic cycle app.
- **States:** no-eligible-wisdom / one-card-surfaced / dismissed.
- **Data wiring:** needs Echo Wall data first (eligible = clean ∧ holds ≥ 5 ∧ age ≤ 180d).
- **Entities:** `WisdomIndex` (phase-keyed eligible echoes), `JessWisdomSurfacings` (audit + never-repeat + `matched_on` transparency).
- **Phase:** 3+/Q3 (depends on Echo Wall volume).
- **Risk to honour:** the sycophancy/contagion failure mode (§4.1) — Jess surfaces *company*, never advice; never reinforces a spiral; disclosed-as-Jess, never posing as a live peer (the Koko line, §6).

---

## 2.F — CIRCLES + LEGACY POSTS (the existing Community primitive)

### 2.F.1 Circles carousel — **Live (legacy) / formalise later**
- **What:** themed cohorts the user joins, by **type**: **Phase** (Luteal Softness · 1.4k · 23 today) · **Program** (Sleep Reset cohort · 84 · starts tonight) · **Region** (UK Women Wellness · 2.1k · 41 today) · **Life stage** (Perimenopause Watch · 890 · 12 today · Postpartum First Year · 310 · opens this week) · **Condition** (PCOS Honest · 760 · 18 today · PMDD Support). "6 circles · 12 sisters posting today."
- **States:** browse / joined / circle feed / new circle opening ("Day 1" / "New" badges).
- **Entities:** existing `Circles` (Community-side, public) + `CommunityPosts`. _Master plan: "Circles + AMAs stay."_ A formalisation pass (consistent join/leave, phase/program/region/life-stage/condition taxonomy, circle-scoped Echo visibility via the reserved `visibility: circles`) is **Q3+.**
- **Phase:** existing; formalise Q3+.

### 2.F.2 Legacy Posts feed — **Live (preserved under tab)**
- **What:** the pre-existing named/anonymous post feed. Composer tools: **Anonymous (first-class) · Add phase · Circle · Ask Jess.** Feed tabs: **For you / Your circles / Same phase / Anonymous / Saved.** Posts carry a phase chip, circle, tags, gentle reactions, replies. Preserved verbatim under the **Posts** tab when Echo Wall is the default.
- **Carries the only remaining emoji in Community** (e.g. a tulip emoji codepoint on the legacy follicular "win" post) — a no-emoji sweep is the one outstanding brand fix here.
- **Entities:** `CommunityPosts`, `Circles`.
- **Phase:** existing. **Decision (§12):** keep the Posts feed long-term, or retire it once Echo Wall + circles + AMAs cover its job?

### 2.F.3 Gentle reactions (legacy lexicon) — **Live**
- **What:** the legacy post reactions: **same · hold · hear you · saved** (the master plan's canonical 4) + a reply count (↩). Counts never ranked; feed order phase + recency.
- **Reconciliation (§12):** Echo Wall narrowed this to `held · me too`. Pick one lexicon across all peer surfaces and sweep.
- **Phase:** existing.

### 2.F.4 Expert AMA card — **Live (legacy)**
- **What:** "This week's AMA · Dr [name], OB-GYN · Topic: PMS vs PMDD — when to seek care · Live Thurs 8pm BST · 43 sisters in · Reserve." Expert-adjacency — the research's safest model (§4.5): a credible escalation path *beside* peer content, never blended into it.
- **Entities:** existing `AMASessions`/`Experts`.
- **Phase:** existing; deepen Q4 (live AMA channel; cross-link the roadmap "Dr Aisha Patel AMA channel" + async Q&A).

### 2.F.5 Composer (extended) — **Demo**
- **What:** the Community composer extended with the peer tools: **Anonymous · Add phase · Circle · Post as echo · Send to a witness · (Ask Jess).** "Post with Jess" affordance: _"Want to share something but not sure how to say it? I'll help you shape it — anon or not."_
- **Phase:** the echo + witness tools land with Phases 3/4 respectively.

### 2.F.6 Quiet mode — **Live (legacy)**
- **What:** a Community-wide "Quiet on" toggle that softens surfacing/notifications: _"Softer notifications through your period · Mentions and replies only. No circle pings. Turns off on its own when follicular starts."_ Keep; align with the Echo "quiet mode auto-unpost" idea.
- **Phase:** existing.

---

## 2.G — SEPARATE TRACK (private named-circle / partner / clinical sharing — NOT the anonymous wall)
These are sourced from `future_features_brainstorm` + `roadmap_brainstorm` + the Journal spec §2.1. They are **narrow-private**, not anonymous-peer — Halli decides if they ride the Community roadmap or stay separate Network/Clinical features (§12).

### 2.G.1 Circle of Three (private named circle) — **Plan**
- **What:** 2–3 chosen people (mother/sister/best friend) get a **narrow read** = current phase label + last week's felt-sense summary; **no logs, no Jess notes; quarterly re-consent.** Not public community — a private circle. **Abuse-aware:** someone adds their mother then regrets it → quarterly re-consent prompt; fast revoke.
- **Entities (NEW):** `Circles(private)` (distinct from public Community Circles), `CircleMembers`, `CircleDigests`.
- **Phase:** separate track.

### 2.G.2 Partner Sync — **Demo** *(partner_sync demo + roadmap #1)*
- **What:** consent-gated "cycle weather" for ONE person — today's phase chip + a mood word the user chose + a 3-item "what helps me today" list she curates (Jess drafts from recent entries, user approves). No symptoms, no journal. Partner gets a stripped FemWell Lite + phase-transition notification; optional gentle voice notes ("thinking of you on day 22"). **Fast revoke; no coercive re-connect** (abuse-aware — ex-partners, abusive relationships).
- **Entities (NEW):** `PartnerLinks`, `PartnerShareStates`/`PartnerViews`, `PartnerMessages` (E2E).
- **Phase:** separate track (Pro+).

### 2.G.3 Care Bridge (clinician share) — **Demo** *(care_bridge_v2 demo + roadmap #2)*
- **What:** v1 = a PDF export of the last 90 days for a GP (cycle regularity, symptom heat-map, meds, a Jess-drafted "what I want to talk about"). v2 = a clinician "invited reviewer" link (14-day expiry) with a narrow read-only view + one async note per visit. **UK GDPR + DPA 2018 compliance, audit trail; rigorous clinician credentialing.**
- **Entities (NEW for v2):** `ClinicianLinks`, `ClinicianNotes`, `ClinicianAudit`.
- **Phase:** separate track (Pro+). _(Clinical, not peer — included for completeness; the Doctor-Ready Diary already ships free from the Journal.)_

---

# §3 — (External research lives in §4; this number reserved so §-numbers ≈ framework. See §0 section map.)

---

# §4 — EXTERNAL RESEARCH (cited, fresh 2025–2026 pass — Ms Deep Search)

Two research passes were run for v2: (A) competitive mechanics of anonymous women's-health & mental-wellness communities; (B) the safety/contagion psychology + UK compliance floor. Confidence flags: **[High]** peer-reviewed / statutory / primary-source; **[Med]** credible secondary; **[Dir]** directional (vendor/marketing/single-source). Full URLs in §11.

**The one finding that should set the whole design:** *every cautionary tale in this space is a privacy or disclosure failure, not a UX failure* — Stardust, Crisis Text Line/Loris.ai, Koko, Flo's 2021 FTC settlement. For an anonymous self-disclosure feature, **the data architecture IS the product.**

## 4.1 Co-rumination & emotional contagion — the core risk **[High]**
- **Co-rumination is a documented socioemotional trade-off, not a neutral good.** Rose's longitudinal work: co-rumination (excessive, repeated problem-dwelling) predicted *increased* depressive AND anxiety symptoms over time *and* closer friendships — you get the bond and the symptom escalation together.
- **The online channel is specifically worse.** A 2023 Frontiers in Psychiatry study of adolescent girls: support-seeking *from friends offline* was associated with **lower** depression/anxiety, but seeking support **online** with **higher** — with co-rumination as the mediating mechanism.
- **Emotional contagion is empirically confirmed in online depression communities** (MDPI/Healthcare 2021): a user's emotional state measurably shifts toward the emotion they *receive*; negative posts draw more negative replies, increasing negative posting the following week (a self-amplifying spiral). **Reading others' distress is itself a vector** — you don't have to post to catch it.
- **Excessive reassurance-seeking (ERS)** (Joiner et al.): the request-and-reassure loop elicits interpersonal rejection over time and is linked to "contagious depression."
- **Design implication (load-bearing):** forbid the threaded co-rumination loop **architecturally** — short-form, fixed-length, ephemeral entries; non-transactional fixed responses (holds / 4 fixed lines), never free-text reassurance-on-demand; never let one distress post accumulate an escalating reply chain. **This is exactly FemWell's Echo Wall + Witness design — the spec's central mechanics are the evidence-based countermeasure.** *(Honest caveat: no study A/B-tests "ephemeral/fixed-response reduces co-rumination harm in a live app" end-to-end; the countermeasures are inferred from the mechanism literature — instrument FemWell to measure mood post-launch.)*

## 4.2 The benefits side — loneliness, belonging, common humanity **[High/Med]**
- Peer support is associated with reduced depression, loneliness and anxiety (scoping reviews PMC9358944, PMC9316011) — **but the evidence is heterogeneous** and a US National Academy review found weak overall effects, weaker for under-represented groups. Effect depends on design, dose, and linkage to formal care; peer support is not automatically beneficial.
- **The "social cure" / shared-identity mechanism** (UK social-prescribing research): wellbeing improves specifically when people identify with a meaningful *new group compatible with their sense of self* — the case for **phase-cohorts** over generic "community."
- **Neff's common humanity** is the psychological prize: perceiving suffering as shared rather than isolating. A cohort can deliver this **without** the co-ruminative problem-talk that harms.
- **Strongest domain evidence is perinatal/postpartum** (RCTs + meta-analysis): peer support improves perinatal depression, self-efficacy, recovery. **Menopause peer-support outcomes are promising-but-unproven** (thin base) — don't over-claim (ties to §8.4 MHRA/ASA caution).
- **Design implication:** engineer for *common-humanity normalisation* (Tier 0 aggregate, §2.0) rather than disclosure volume; lean hardest on perinatal/postpartum cohorts; treat menopause claims carefully in copy.

## 4.3 Trust & safety / moderation **[High]**
- **Hybrid (AI pre-screen + human spot-check) is consensus best practice.** AI sweeps at scale and *prioritises* for humans; humans handle nuance.
- **Samaritans' UK guidance is the authoritative spec for self-harm/suicide content:** *"never rely solely on AI"* — use it to prioritise human moderation; appropriate AI = text filters (method/theme words), username filters at registration, report triage, image hashing; **safe-messaging on removal** (kind, empathetic, non-judgemental, with 24/7 signposting); reporting must be easy and prominent.
- **Reactive/volunteer-only moderation fails:** it publishes harmful content before action (the contagion window); a Harvard/Togetherall study found an *active moderator's presence* increased candid disclosure AND reduced bad behaviour — proactive shapes culture, reactive doesn't. Reddit AutoMod data: ~1-in-7 mod actions are *disputed among mods themselves* — governance friction is structural; volunteer mods can't cover 24/7.
- **Reddit AutoMod is the cheap automated front line:** keyword/regex slur+crisis detection, **account-age + karma + rate gates on new accounts** (the single best anti-brigade/anti-spam lever), auto-reply with resources.
- **Design implication:** ship a **hybrid pipeline** — AI pre-screen gates posts before they're visible; human spot-check on flags; a crisis-intercept lane surfacing UK Samaritans/NHS signposting and pulling the post pending review; empathetic safe-messaging copy on every removal. Reserve heavyweight pre-moderation for *new/low-trust accounts and flagged keywords* (Flo pre-moderates everything — safe but a cost-centre and adds latency that kills the "vent at 3am" use case).

## 4.4 Clue — the aggregate belonging primitive **[High]**
- Clue splits the cycle into **six sub-phases** and surfaces **"aggregated, anonymized insights from others in the same sub-phase"** — *belonging without a forum*: the social-proof comfort of a cohort with **zero moderation surface and zero PII risk.** Clean consent model (de-identification; research data only with explicit separate consent; "does not sell your data").
- **Design implication:** ship the **Tier 0 "others in your phase" aggregate (§2.0)** as the first, frictionless tier of belonging — but suppress any count below a k-anonymity floor (§4.8).

## 4.5 Maven — expert-adjacency, and the wrong model to copy **[High]**
- Maven is an identified, clinical, employer-benefit telehealth clinic. **Why it's the wrong model for anonymous self-harm-risk content:** identity is structural (it's an insurance benefit); employer-adjacency is chilling for mental-health/fertility/abortion-adjacent disclosure; a peer forum that *looks* clinical invites duty-of-care expectations without the staffing.
- **The one good idea:** **expert-adjacency** — a clearly-separated escalation lane (UK crisis lines + "speak to a professional" signposting) *beside* peer content. FemWell's AMA card + crisis intercept already do this.
- **Design implication:** keep Community pseudonymous and *non-clinical by design*; route anything clinical/crisis OUT to real services; never imply medical authority in the peer space.

## 4.6 Reddit / popularity ranking caution **[Dir]**
- Upvote/karma ranking creates visibility-by-popularity, which in health contexts **buries accurate-but-unpopular info and amplifies anecdote.** **Design implication:** prefer recency + cohort-relevance ranking over popularity (FemWell's no-likes, holds-don't-rank design already does this — keep it).

## 4.7 Peer-support models + retention loops **[High mechanics / Dir stats]**
- **Wisdo's "Helper" role rewards GIVING support** (acquired by Talkspace, Oct 2025) — the giving-help-helps-the-helper loop is a genuine retention/wellbeing flywheel and cheaper to sustain than constant content supply. **→ FemWell's Witness gate ("held 3 before you send") is exactly this loop.**
- **7 Cups** — shared-experience matching is good; but **under-trained listeners (~20-min training)** are its core weakness → **never over-claim "trained peer."**
- **Koko (the AI red line)** — ran ~4,000 GPT-3 support responses with no real disclosure/consent; backlash was severe, and tellingly *even disclosed* AI empathy "felt empty" once users knew. **→ disclose any AI loudly; never let Jess pose as a live peer; use AI for moderation/safety, not for faking support.**
- **First-session belonging drives ~2x retention [Dir];** cohort-based onboarding builds belonging by design; combined human+automated support lifts activation/retention. **→ deliver the Tier 0 cohort-belonging moment in onboarding before asking for a post; never leak content on the lockscreen.**

## 4.8 Anonymity engineering **[High]**
- **The Telegram de-anon trap:** a feature that records *who* did a lightweight interaction (reaction, read receipt, view tied to identity) can re-link an "anonymous" user — Telegram reactions publicly displayed anonymous admins' real accounts. **→ no identity-linked holds/reactions/read-receipts; aggregate-only, stored unlinkably.**
- **k-anonymity floor:** a record should be indistinguishable from ≥ k−1 others; floors of k=5 typical, k=10–15 for higher sensitivity. **→ treat k≥5 as a floor for special-category cohorts; never display a surfaced count under the floor (use ~20 for the Tier 0 card to be safe); never show reactor identities.**
- **Privacy-preserving rate limiting:** **Rate-Limiting Nullifier (RLN)** (zero-knowledge, Semaphore/PSE) and **Cloudflare anonymous credentials / Privacy Pass** (blinded, cryptographically unlinkable tokens, Oct 2025) enforce per-user limits **without correlating requests to identity.** **→ implement Echo/witness/twin rate limits via an unlinkable-token / nullifier scheme, not user-ID counters.**

## 4.9 The cautionary tales, dissected **[High]** *(cite verbatim in §9)*
- **Stardust (2022):** surged to #1 on a false E2E promise; TechCrunch found it **shipped phone numbers to Mixpanel**, carried a **"voluntary law-enforcement cooperation"** clause, and **uploaded locally-generated keys to its own servers** (not E2E); quietly deleted "E2E" from its policy when asked. The growth story *became* the scandal.
- **Crisis Text Line / Loris.ai (2022):** shared crisis-conversation data with a for-profit spinoff; ended within ~3 days under outcry. **→ crisis content is a data dead-end: surface help, store nothing reusable, route nothing into analytics/AI/commercial.**
- **Flo 2021 FTC settlement / Mozilla "Privacy Not Included":** Mozilla flagged **18 of 25** period/fertility apps; **8 failed minimum security** (passwords as weak as "1"); the systemic fault is **vague law-enforcement-sharing language.** **→ differentiate on a plain-English, specific disclosure policy; strong auth; don't tie anonymous posts to identifiable cycle/sex-life records.**

## 4.10 UK regulatory floor **[High]** *(the launch-blocking compliance layer)*
- **Online Safety Act 2023** — a Community wall is a **user-to-user service** hosting *exactly* the priority-harm category (self-harm/suicide). Duties: documented **illegal-content + children's risk assessments**; proportionate measures to prevent/remove illegal & priority content; easy reporting. **Timeline (in force):** illegal-content duties **live 17 Mar 2025**; **Protection of Children Codes in force 25 Jul 2025** (first children's risk assessments due 24 Jul 2025). **FemWell has a teen life-stage → children's duties + highly-effective age assurance apply.** **Penalties:** up to **£18M or 10% of qualifying worldwide revenue.** **Enforcement is active:** by Oct 2025 Ofcom had 5 enforcement programmes + 21 investigations; fines landing include **£50,000+£5,000** (Itai Tech, Nov 2025), and **£1.35M** (8579 LLC, early 2026 — largest age-assurance fine to date). Ofcom's statutory age-assurance effectiveness report is due **Jul 2026**.
- **ICO special-category data** — cycle/pregnancy/sexual-activity/perimenopause data = **special-category (Art. 9).** Need an **Art. 6 lawful basis AND an Art. 9 condition.** Explicit consent must be a clear affirmative opt-in, **specifying the nature of the data**, withdrawable, **separate from general T&Cs.** An **Appropriate Policy Document** is required for most non-consent Schedule 1 conditions (not required if you rely purely on explicit consent).
- **Design implication:** OSA risk assessments + the §4.3 hybrid-moderation + crisis intercept as the "proportionate measures" + easy reporting + **age assurance** (teen stage) are **launch-blocking**, not polish. Gate community participation behind a **separate explicit special-category consent**; if any non-consent basis is used (e.g. safeguarding), maintain an APD. Data-minimise: store phase/cohort, not raw identifiable health detail, alongside anonymous posts.

## 4.11 Top design takeaways (one screen)
1. **Kill the co-rumination loop by architecture** — short-form, ephemeral, fixed-response, **no threads** (§4.1). #1 safety lever.
2. **Sell common humanity, not disclosure volume** — Tier 0 aggregate normalisation (§4.2/§4.4).
3. **Hybrid moderation + crisis-intercept from day one** — AI pre-screen, human spot-check, Samaritans safe-messaging (§4.3). Reactive/volunteer-only is non-compliant and unsafe.
4. **Anonymity that survives metadata** — no identity-linked reactions (Telegram), k≥5 (→20) suppression, unlinkable-token rate limits (§4.8).
5. **Compliance is launch-blocking** — OSA risk assessments + age assurance + separate special-category consent + plain-English disclosure policy (§4.10).
6. **Disclose any AI loudly; never let it pose as a peer** (§4.7 Koko).
7. **Phase-cohort + topic + aggregate "others like you" is the wedge no competitor fully owns** (§6).

---

# §5 — BRAINSTORMING: the non-obvious shape *(the ideation pass — push past the obvious list)*

The feature inventory (§2) is the *what*. This section is the *why these and what else* — the non-obvious moves the research and the gradient suggest, scored loosely on **moat fit × build cost × safety leverage**. Marked **[ship]**, **[explore]**, or **[avoid]**.

**A. Belonging is a ladder, and the first rung has no posting on it. [ship]**
The instinct is "build a feed." The research says the first, highest-retention, zero-risk rung is the **Tier 0 aggregate** (§2.0): "you're one of 312 in your inner autumn tonight," delivered in onboarding before the user is ever asked to disclose. It converts the Journal's loneliest-page problem with no moderation surface. Non-obvious consequence: **the empty Echo Wall stops being a failure state** — a quiet wall still shows belonging via the aggregate. Rung 1 = read echoes; rung 2 = hold; rung 3 = leave a line; rung 4 = be witnessed; rung 5 = witness; rung 6 = twin. Each rung is *earned*, never defaulted.

**B. Reverse the helper economy: you earn proximity by giving it. [ship]**
Wisdo's "Helper" loop (§4.7) and the master-plan witness gate ("held 3 before you send") are the same idea: the antidote to reassurance-seeking (§4.1) is to **reward giving over seeking.** Non-obvious extension: the *only* currency in Community is having-held-others — and it's invisible (no badge, no count shown publicly, no scoreboard). It unlocks capability (you may now send to a witness), never status. This is the no-scoreboard principle turned into a growth loop.

**C. Make privacy a visible feature, not a footer. [ship]**
CHI 2024 + Stardust (§4.9): *visible* privacy beats invisible privacy. Non-obvious move: surface the safety machinery *as* the product — "Jess left out: sleep meds" shown in the share sheet (already shipped); a wall header that says "we only show a number when 20+ sisters are here" (k-anonymity as a trust signal); a plain-English "what FemWell can and can't see" line on the wall. The thing that protects her is the thing that makes her trust it.

**D. Time is a safety rail, and it can be tender instead of clinical. [ship]**
Cooling pause, late-luteal/late-night throttle, 48h fade (all shipped) are co-rumination/contagion countermeasures (§4.1) — but framed as care, not friction: "Held for 10 minutes — you can pull it back any time"; "your most-regretted-post window, d24–28"; "echoes fade, like the feeling." Non-obvious: the throttle that blocks a 2am late-luteal post is the same mechanic as a friend saying "sleep on it" — name it that way.

**E. The aggregate can become gentle wisdom without ever becoming advice. [explore]**
Living Wisdom (§2.E) surfaces one faded echo as *company* mid-writing. Non-obvious guardrail from §4.7 (Koko): it must be visibly Jess-surfaced and visibly *another woman's words*, never synthesised empathy posing as a peer; un-screenshottable; max 1/session; 90-day repeat lock. The flywheel: every hold makes an echo more "wisdom-eligible," so *holding* (the gentle act) is what curates the corpus — not voting.

**F. Phase Twin is a finite container precisely because friendships create obligation. [ship-as-designed]**
The non-obvious insight already in the master plan: the *hard ending* is the feature. A 12-day container with no chat, no re-entry that cycle, and a parting-line exchange gives intimacy without the maintenance burden that turns peer support into another source of guilt (a co-rumination risk if it became an open DM). Resist every pressure to let it grow a chat box.

**G. Crisis is a dead-end by design — and that's a selling point. [ship]**
§4.9 (Crisis Text Line): the moment crisis disclosure touches anything reusable, you have a scandal. Non-obvious framing: FemWell's crisis intercept *stores nothing, sends nothing, routes to humans* — and we can say so. "If something is too heavy for a sister, it never becomes an echo; it goes to people trained to hold it." Honesty as differentiation.

**H. Notifications are where anonymous communities leak. [ship the constraint]**
§4.7: never leak content on the lockscreen. Non-obvious: Community notifications should be *cohort-shaped, content-free* — "3 new lines in your luteal window" never the line itself; "your twin wrote today" never her words. Quiet mode (shipped) already softens this; extend the content-free rule everywhere.

**I. The "one entry, four lives" gradient is the actual product — not any single surface. [frame]**
The non-obvious strategic point: no competitor has the *handoff*. Clue has aggregates, Flo has chat, Peanut has stages — but only FemWell lets a single private line *choose* to stay locked, become an echo, be sealed, or be witnessed, decided per-entry. The moat is the spine (§7), not the wall alone. Every surface should reinforce that the writer is always in control of how far a line travels.

**J. Ideas to AVOID (the research's red lines made concrete). [avoid]**
Live audio rooms (Peanut Pods) — high moderation cost, de-anonymising, can't staff 24/7. Free-text replies/DMs anywhere — the co-rumination engine (§4.1). Public hold/relatability counts that rank — status creep (§4.6, principle 5). Paywalling peer support — reads as exploiting vulnerability; monetise expert depth, not the wall. Pre-moderating *everything* forever — Flo's cost-centre; go hybrid as volume grows. "Trained peer" labels — 7 Cups' liability (§4.7). Any undisclosed AI — Koko (§4.7).

---

# §6 — COMPETITIVE READ (cited; the EMULATE / AVOID table)

| Platform | EMULATE (concrete mechanic) | AVOID |
|---|---|---|
| **Peanut** | **Life-stage self-selection as the master belonging axis**, set once at onboarding, used everywhere (the model for FemWell's 11 stages). Per-user **report + block that acts instantly**. A blunt, quotable policy (lifetime ban for hate). Menopause expansion (Sept 2021) proves the multi-stage arc. | **Anonymity behind a paywall** (Incognito = Peanut+) — anonymity is a safety primitive, not an upsell. **Live audio rooms (Pods)** — high-moderation, de-anonymising, can't staff. Real-name-ish friend graphs. |
| **Flo "Secret Chats" / Anonymous Mode** | **Lift the rules lexicon near-verbatim:** the no-PII rule (*"don't share full name, phone, email, social usernames… faces, birthmarks, tattoos, location"*) and the **no-medical-advice** rule (delete dosage/treatment specifics — UK GMC/NMC exposure). **Random-avatar pseudonymity.** **Graduated enforcement** (warning → 7-day read-only suspension → permanent) + **documented appeals.** **Radical honesty:** "anonymous to peers, visible to us for integrity." **Free.** | **Pure pre-moderation forever** (every comment pre-approved) — safe but a cost-centre + latency that kills the 3am vent. **Topic-only keying** (loses phase belonging — keep phase primary). |
| **Reddit women's-health subs** | **AutoMod-style automated front line:** keyword/regex slur+crisis detection, **account-age + rate gates on new accounts** (best anti-brigade lever), auto-reply with UK crisis resources. **Crisis-counsellor handoff** (Reddit×Crisis Text Line → FemWell×Samaritans/Shout). Pseudonymity drives candour. | **Karma/upvote popularity ranking on health content** (buries accurate info). **Volunteer/reactive-only moderation** (burnout; ~1-in-7 actions disputed; brigades outpace it). **Routing crisis data into any commercial/ML pipeline.** |
| **Clue** | The **"others in your sub-phase" anonymised aggregate** as a zero-moderation belonging signal (ship it — §2.0). De-identification + explicit, separable research consent. | Letting aggregate stats be the *only* community surface — it's belonging-lite, not support. |
| **Stardust (cautionary)** | Only that phase framing drives engagement. | **EVERYTHING about its data posture:** phone numbers to third-party analytics; "voluntary law-enforcement cooperation" language; keys on its own servers marketed as "E2E"; deleting claims when asked. The growth story became the scandal. |
| **Maven Clinic** | **Expert-adjacency** — peer support is safest with a visible escalation path to a real professional, surfaced *beside* peer content (AMA card + crisis intercept). | Modelling the Community itself on a clinical/employer forum (identity is structural; employer-adjacency chills disclosure; clinical-look invites duty-of-care without staffing). |
| **7 Cups / Wisdo / Koko / TalkLife** | Wisdo's **"Helper" giving-loop** (→ witness gate). 7 Cups' **shared-experience matching** + **auto-escalation** when serious symptoms surface. TalkLife's **24/7 real-time safeguarding** ambition + HealthUnlocked's **charity/NHS-org partnership** for credibility. | 7 Cups' **under-trained "peer" labels** (~20-min training = liability). **Koko's undisclosed AI** — *and* the subtler trap that even *disclosed* AI empathy "feels empty" once known. Marketing "clinically proven" on non-randomised evidence. |

**The wedge (named):** Peanut groups by stage; Flo groups by topic; Clue surfaces sub-phase aggregates — **nobody fully combines life-stage cohort + topic + Clue-style aggregate belonging, delivered first-session before any posting, on a per-entry "four lives" handoff** (§1.3 / §5-I). That is the differentiated mechanic, and it is also the *safest* one.

**Confidence:** platform mechanics + OSA/ICO/Mozilla = High; vendor retention stats = Directional; peer-support efficacy studies are largely non-randomised — don't over-claim.

---

# §7 — CROSS-APP / CROSS-FEATURE RELATIONSHIPS (Community's own section)

Community is not a silo — it is the peer half of a system whose spine is the **"one entry, four lives"** handoff (§1.3). For each surface, the interlock, the direction of data flow, the entry points, and shipped-vs-planned.

## 7.1 Journal ↔ Community — the spine *(shipped Share-as-Echo; planned Send-to-Witness)*
- **Direction:** Journal → Community. A private entry is the *source* of every echo and every witness send. **Entry points (shipped):** the Share-as-Echo slot on `Journal.jsx` (replaced the "Echo wall · Coming" teaser) + the "Share a line from this as an echo" affordance in `NewEntrySheet.jsx`. **Entry point (planned, Q3):** a "Feels heavy? Hand it to a witness" slot on an individual entry.
- **Contract:** the raw entry never leaves the device; only the **scrubbed line** (Echo) or **ciphertext** (Witness, Tier 3) travels. Burn-mode entries and Sealed Letters can never become echoes (they aren't ordinary persisted entries). The writer always chooses the "life" per-entry; default is stay-locked.
- **Shared primitive:** the **SecureStore / `journalCrypto.js`** built in Journal Phase 2 is reused for Witness `entry_ciphertext` (Tier 3 E2E).
- **Reverse flow (planned):** **Living Wisdom** (§2.E) surfaces a faded community echo back *into* the Journal compose flow as company — the only path where community data re-enters the writer's page, and it is read-only, un-screenshottable, Jess-mediated.

## 7.2 Community ↔ Today
- **Direction:** Community → Today (surfacing). Today's reflective stack can carry a content-free Community nudge ("3 new lines in your luteal window") and the **Tier 0 aggregate** belonging card (§2.0). Quiet mode (shipped) governs whether Community pings Today at all. **Constraint:** never surface an echo's text or a twin's words on Today or the lockscreen (§4.7 / §5-H).
- **Phase:** Tier 0 card 3.5; Living Wisdom on Today is a Living-Wisdom surface (Q3).

## 7.3 Community ↔ Planner
- **Direction:** Planner → Community (context). The Planner's phase/cycle-day is the **cohort key** for Echo Wall weighting, Witness matching, and Phase Twin pairing (same phase + life stage). Late-luteal day (d22+/d24–28) drives the cooling throttle and the "block during late luteal" guardrail. **No Community content flows back into Planner** (the Planner stays a planning surface). 
- **Phase:** the cohort-key dependency is live (Echo Wall reads phase); deeper Planner integration N/A.

## 7.4 Community ↔ Health / Pulse
- **Direction:** Pulse → Community (cohort/condition keys only). Life-stage + condition circles (PCOS Honest, Perimenopause Watch) key off the user's profile/Pulse data. **No symptom data ever travels to a peer surface** — circles are joined by *identity/stage*, never by shared symptom logs. The aggregate (§2.0) may count over anonymised phase data but never names a symptom for an individual.
- **Phase:** existing (circles); aggregate 3.5.

## 7.5 Community ↔ Jess
- **Direction:** two-way, but Jess is **observer/curator, never a peer** (§4.7 Koko line; §1.6 sycophancy). Jess: scrubs the echo line on-device (`echoScrub.js`); offers the share line; runs the crisis intercept; authors Phase Twin's daily prompts + one bridging note/day; surfaces Living Wisdom; drafts the "what helps me today" list for Partner Sync (user approves). **Hard rule:** any Jess presence in Community is disclosed-as-Jess and never simulates a live sister. The "Ask Jess / Post with Jess" composer affordance helps shape a post; it never posts as a human.
- **Phase:** scrub + intercept + share line shipped; bridging/wisdom Q3–Q4.

## 7.6 Community ↔ Doctor-export (the commonly-forgotten interlock)
- **Direction:** none, by design — and that is the contract. The **Doctor-Ready Diary** (`generateDoctorReadyDiary`, NICE NG23, jsPDF A4) reads **JournalEntries only**, and **excludes** burns + sealed letters. **Echoes, witness sends, and twin entries must NEVER enter the Doctor export** (they are anonymous/peer artefacts, not the writer's clinical record). Witness/Twin entries are also writable to the writer's own journal (marked as such) — the spec must ensure those marked entries are either included intentionally or excluded from the export per Halli's call (§12). 
- **Phase:** exclusion contract must be honoured from Phase 3; explicit test in Ms Verify's gate.

## 7.7 Community ↔ Horoscope / Rituals / Programs
- **Horoscope:** Quiet-Mode shadow-language suppression already aligns with Community Quiet mode; a "Void-of-Course" tone could gate Community surfacing on heavy sky days (explore). **Rituals:** a phase-tagged ritual could be *shared* as an echo ("started 4-7-8 breath tonight") — a clean, low-risk echo source. **Programs:** the "Sleep Reset cohort" circle is a Program-keyed circle (program cohorts = circles). 
- **Phase:** Rituals→echo explore; program-circles existing.

## 7.8 Community ↔ onboarding, Settings, notifications
- **Onboarding:** the Tier 0 belonging moment is delivered here (first-session retention, §4.7); the **separate explicit special-category consent** for community participation is captured here (§4.10) — and a **sharing comfort level** choice (open decision §12.3). **Settings:** Echo Wall Settings (§2.B.2), Witness charter re-read, Quiet mode, account-delete cascade (burns echoes/witness/twin). **Notifications:** content-free, cohort-shaped, lockscreen-safe (§5-H); governed by Quiet mode.
- **Phase:** consent + comfort level 3.5/Q3; Settings surfaces per their phases.

## 7.9 Community ↔ the Separate Track (Partner / Circle of Three / Care Bridge)
- These are **narrow-private**, not anonymous-peer — they share the *consent + revoke + Tier-2/3 + abuse-aware* machinery with Community but live on their own track (§2.G). Partner Sync reuses the "what helps me today" Jess-draft pattern; Care Bridge reuses the Doctor-export PDF primitive; Circle of Three reuses the private-visibility model. Halli decides if they ride the Community roadmap (§12.12).

---

# §8 — SAFETY · ANONYMITY · COMPLIANCE MODEL

This is the spine of the whole feature (§4 makes the case that *the data architecture is the product*). The shipped Echo Wall already implements most of v1; the research (§4) and the UK legal floor define the hardening.

## 8.1 The anonymity model (shipped v1 + the honest gaps)
- **Author token:** `author_hash = SHA-256(userId :: per-device-secret)`, computed on-device; the secret lives only in `localStorage (fw_echo_anon_v1)` and never leaves. Rows carry **no user_id/email/name.** The author's own device recomputes the hash to find + retract its echoes **without de-anonymising anyone.**
- **THE CONFIRMED CAVEAT (live-reproduced, session l — needs Halli/Code, NOT client-fixable):** base44's platform auto-stamps **`created_by: "<email>"`** on every row **and returns it in the read payload to any wall reader.** A reader can de-anonymise authors via the network response / devtools. This is the documented Q3 item — **true server-side anonymity needs a `postEcho` function writing under a service identity** (§2.B.3). **It is required, not optional, before the wall carries real traffic.**
- **Other honest limits (flagged Q3):** reaction/report/rate-limit dedup is **on-device** (best-effort, not server-enforced); retract works from the posting device only (echoes fade in 48h regardless); the scrub is regex-deterministic on-device (an on-device-LLM rewrite is a future layer that **must also stay on-device**).
- **De-anon discipline (§4.8):** reactions/holds stay **aggregate-only — never reveal *who* held** (the Telegram trap). The shipped wall obeys this. Watch correlation risk: timestamp + phase + cycle_day can narrow a cohort — keep cohorts above a **k-anonymity floor** (k≥5; ~20 for the Tier 0 count) before showing "n in your phase."

## 8.2 The scrub (the "Jess scrub", on-device) — **shipped** *(`echoScrub.js`)*
Deterministic regex/string work; **raw text never leaves the device.** Strips emails/phones/handles/links/dates/weekdays/months/ages/money/years/substances/common-names/UK-places + a proper-noun heuristic; reduces to a single line ≤ 180 chars; **final leak re-scan blocks the post** if a hard identifier survived (or too little remains). Aligns with Flo's no-PII lexicon (§6): faces/tattoos/birthmarks would be the image-equivalent if images are ever added (don't add images without hashing, §4.3). Future on-device LLM rewrite sits on top — **never** send raw text to a server to "scrub" it.

## 8.3 Crisis intercept (the OSA-mandated layer) — **shipped** *(`echoConfig.CRISIS_PATTERNS` + `crisisCheck`)*
Keyword+light-context lexicon (deliberately broad — a false positive only routes a sister to support, the safe direction to fail), incl. self-harm, suicide, domestic-abuse signals. On a crisis hit, the draft is **NEVER** turned into an echo; the sheet shows **UK resources (Samaritans 116 123 · NHS 111 · Shout 85258 · Mind 0300 123 3393).** Witness Mode reuses the same intercept. **Crisis content is a data dead-end** (§4.9 Crisis Text Line): nothing stored reusable, nothing routed to analytics/AI/commercial. Samaritans safe-messaging tone on any removal (§4.3).

## 8.4 Timing rails — **shipped** *(`echoSafety.js`)*
**Cooling pause** (10m base / 30m late-luteal d22+). **Late-night + late-luteal throttle:** a late, late-luteal post is held until next **06:00**, past the vulnerable window. **48h fade.** Visibility is **purely time-derived** (`isLive/isCooling/isExpired`). These are research-aligned countermeasures to **co-rumination / contagion** (§4.1) — short-form + ephemeral + paced — framed as care, not friction (§5-D).

## 8.5 Rate limits + moderation — **shipped v1 (client) → Q3 (server/hybrid)**
- **Rate limit:** 5 echoes/day, on-device. Master-plan witness/twin limits: 1 witness send/day, 3 receives/day, 1 twin/cycle. **Q3:** server-enforced via the `postEcho` function using an **unlinkable-token / nullifier scheme** (RLN or Privacy-Pass style, §4.8) so limits hold without revealing identity.
- **Moderation:** report→auto-hide at threshold (client, v1). **Q3 hybrid (§4.3):** **AI pre-screen** (text + username filters + image hashing) gating posts before visible + **human spot-check** on flags; empathetic safe-messaging on removal; AutoMod-style **account-age + rate gates on new accounts** as the anti-brigade front line. Consider **pre-moderation while volume is low** (Flo model), relaxing to hybrid as it scales (§12.8). Avoid reactive-only/volunteer-only (Reddit burnout).
- **Fixed-response lexicon, not free text** — the single biggest abuse/contagion reducer (§4.1); Echo Wall (reactions only) and Witness (4 fixed lines) both obey it. Lock it in.

## 8.6 Sensitivity tiers + SecureStore *(strategic_synthesis §4, Journal spec §2.1)*
- **Tier 1 (public/indexed):** Circles, CommunityPosts (anonymous), AMASessions — no consent beyond T&Cs, 30-day soft-delete.
- **Tier 2 (server, per-user-encrypted):** Echoes, EchoHolds, TwinPairs/TwinEntries — one-click clear by domain, 7-day grace.
- **Tier 3 (E2E, client-only keys):** **WitnessRequests, WitnessStrikes** (+ Journal locked entries, Sealed Letters) — instant hard-delete, no server copy. **Reuse the one "FemWell SecureStore" primitive** (built for Sealed Letters in Journal Phase 2's `journalCrypto.js`) for the Witness entry ciphertext.
- **Deletion cascade:** account delete burns sealed letters / echoes / twin entries; pair history for others kept as `deleted_by_partner` (entry + Jess bridging removed; no trace).

## 8.7 UK data posture (the anti-Stardust stance, §4.9 / §4.10)
- **Cycle/community data = special-category** (UK GDPR / DPA 2018) → **explicit, separate consent** (specifying the nature of the data, not bundled into general T&Cs) + an **Appropriate Policy Document** (condition + lawful basis + retention/deletion) where any non-consent basis is used.
- **Online Safety Act 2023:** the wall is a user-to-user service hosting priority self-harm content → **illegal-content + children's risk assessments**, the §8.5 hybrid-moderation + crisis intercept + easy reporting as proportionate measures, and **highly-effective age assurance** because of the teen stage. Penalties up to **£18M / 10% worldwide revenue**; enforcement active (§4.10). **Legal floor before a public wall scales** — owner + deadline are an open action (§12.13).
- **Be visibly un-compellable:** no PII in the community; posts not linkable to account identity at rest (blocked today by the `created_by` leak — §8.1); **no "voluntary law-enforcement cooperation" language**; no third-party analytics carrying identifiers; strong auth (no weak-password loophole, §4.9 Mozilla); minimise what's held; fade-by-default shrinks the corpus. _"Visible privacy beats invisible privacy"_ (CHI 2024).
- **Requirement vs nice-to-have:** *Requirements* — OSA risk assessments, crisis intercept + report flow, age assurance, separate special-category consent, plain-English disclosure policy, server-side anonymity before scale. *Hardening* — `postEcho`, scheduled purge, server rate limits, `EchoFlags`, AI pre-screen, Tier-0 aggregate. *Owners* named in §12.13.

---

# §9 — RISK REGISTER

1. **De-anonymisation (the live one).** Failure prevented: a wall reader identifying an author. Countermeasure: no PII on rows; aggregate-only reactions; k-anonymity floor; **AND the `created_by` server leak must be closed by `postEcho` before real traffic** (§8.1) — currently the top blocker, not client-fixable.
2. **Co-rumination / emotional contagion** (§4.1). Failure prevented: the community making women's mood *worse* and spreading it. Countermeasure: no threads, one line, fixed responses, fade, cooling/throttle, Tier-0 normalisation over disclosure; instrument mood post-launch.
3. **OSA / self-harm duties** (§4.10). Failure prevented: an Ofcom enforcement action (up to £18M / 10%) for an un-risk-assessed user-to-user service hosting self-harm content. Countermeasure: risk assessments + hybrid moderation + crisis intercept + age assurance + easy reporting; owner/deadline (§12.13).
4. **Privacy theatre / over-claim** (§4.9 Stardust). Failure prevented: marketing "anonymous/encrypted" beyond what the architecture delivers → total reputational blast radius. Countermeasure: honest limits documented (§8.1); plain-English disclosure policy; no "voluntary cooperation" clause; claim only what ships.
5. **Public-feed creep** (principle 8). Failure prevented: holds growing into likes, echoes growing into threads, witness growing into DMs. Countermeasure: hard rules — no handles/threads/DMs/like/leaderboard; the no-threads rule is also the co-rumination countermeasure.
6. **Scoreboard / status creep** (principle 5, §4.6). Failure prevented: popularity ranking burying good info + status competition. Countermeasure: counts never rank; the only currency (having-held-others) unlocks capability, never status, and is never shown publicly.
7. **Undisclosed / peer-posing AI** (§4.7 Koko). Failure prevented: a Koko-scale trust collapse. Countermeasure: any Jess presence disclosed-as-Jess; never simulates a live sister; AI used for safety/curation, not faked support.
8. **Clinical over-claim** (§4.2 / MHRA/ASA). Failure prevented: implying the community treats depression/menopause. Countermeasure: evidence-informed copy only; menopause peer-support is "promising-but-unproven"; escalation lane beside, not blended.
9. **Native-capability dependency.** Failure prevented: shipping Witness/Twin without screenshot protection. Countermeasure: FLAG_SECURE/iOS capture-prevention flagged as a **Capacitor** dependency (cross-link `project_capacitor_stripe_paywall`); don't ship the receiver view without it.
10. **Cultural mis-register.** Failure prevented: US/Naija register leaking in. Countermeasure: UK-locked (NHS/Samaritans/Mind, GP, £, en-GB); legacy demo names (Ada/Amara/Nneka) superseded; the one outstanding fix is the legacy Posts feed emoji sweep.

---

# §10 — PHASED ROLLOUT ROADMAP

Mapped onto FemWell's Journal/Community phase numbering. Each phase = a reviewable, shippable, live-walked pass (Ms Atelier crafts → Ms Verify gates → STATUS SHIP LOG line per commit).

**Phase 3 = Q2 · Echo Wall tier — BUILT, PATCH-READY, LIVE-QA'd (deploy blocked on the `Echo` entity):**
Echo Wall feed (phase-weighted) · Share-as-Echo (composer + entry) · on-device Jess scrub · crisis intercept (UK) · cooling + late-luteal/night throttle · 48h fade · `held`/`me too` reactions · report→auto-hide · still-cooling/pull-it-back · auto-unpost · the `Echo` entity + rails. **Exit gate:** vite build + lint + 26 unit tests + emoji/anonymity audit + a live walk (done, session l: zero functional bugs). **NEXT ACTION:** Halli creates the `Echo` entity → apply patch → push → deploy → record the new bundle hash. **Not done by design:** server-side anonymity, server moderation, the aggregate card.

**Phase 3.5 · Echo Wall hardening (recommended next — includes legal-floor items):**
Server-side **`postEcho`** (true anonymity under a service identity — closes the `created_by` leak) · scheduled **purge** (server-side fade/unpost) · server-enforced rate limits (unlinkable-token) · **`EchoFlags`** (auditable reports) · **AI pre-screen + human spot-check** + account-age/rate gates · **OSA risk assessment + self-harm policy doc + separate special-category consent + Appropriate Policy Document + age assurance** · **Tier-0 "others in your phase" aggregate card** (cheap, high-leverage — pull forward) · **My Echoes tab + Echo Wall Settings** · the **no-emoji sweep of the legacy Posts feed** · reaction-lexicon reconciliation sweep. **Exit gate:** as Phase 3 + a privacy/compliance review. **Dependency:** the legal-floor items gate scaling a public wall.

**Phase 4 = Q3 · Witness tier (paired):**
Witness dock + writer toggle + receiver (4 fixed responses) · witness gate (held-3) · 3-strike policy + `WitnessStrikes` · FLAG_SECURE/iOS capture-prevention (native — Capacitor dependency) · pairing engine (phase + life-stage + language, separate VPC, double-hashed tokens) · the witness charter · crisis routing (reuses shipped intercept) · `WitnessRequests` (Tier 3, reuse SecureStore) · **Living Wisdom v1** (needs Echo data) · circles formalisation pass. **Dependency:** ship only after the Echo Wall moderation runbook is real (sharing_deep ladder). **Not done by design:** Phase Twin.

**Phase 5 = Q4 · Phase Twin tier (deepest):**
Phase Twin match · both-wrote server reveal gate · Jess bridging · 12-day container rules · closing ritual + parting-line exchange · `TwinPairs`/`TwinEntries`/`TwinPrompts` · visibility picker (`same_phase`/`circles`/`all`) wired through. **Dependency:** prompt bank + matching VPC + the solo + Echo + Witness layers all real first.

**Separate track (Halli's call, §12.12):** Circle of Three (`Circles(private)`/`CircleMembers`/`CircleDigests`) · Partner Sync (`PartnerLinks`/`PartnerShareStates`/`PartnerMessages`) · Care Bridge v2 (`ClinicianLinks`/`ClinicianNotes`/`ClinicianAudit`).

_(Paywall/Plus parked until the sale window — Community peer surfaces are **free** by principle; the research is explicit that paywalling peer support reads as exploiting vulnerability. Monetise expert depth, not the wall.)_

---

# §11 — SOURCE MAP

| Area | Source |
|---|---|
| **The peer vision, gradient, 3 concepts (Echo/Witness/Twin), reconciliations, principles, evidence base, risks** | `src/components/JournalPlanDoc.jsx` (FoundersOS Master Plan, `/Ideas → Journal Plan tab`) — captured in `claude-state/JOURNAL_BUILD_SPEC.md` §1 |
| **The Journal↔Community system, "one entry four lives", kept/new/shifted maps, handoff, the two pages** | `femwell_journal_community_v2.html` |
| **Echo Wall (share modal · wall feed · my echoes · settings), Sealed-Letter threads, Witness Mode (writer toggle · receiver 4 lines · charter 6 rails · gate held-3 · 3-strike · crisis routing), Phase Twin (match · reveal · opt-in matrix · closing ritual), base44 entity appendix, moderation rails appendix, rollout ladder appendix** | `femwell_journal_sharing_deep.html` (read line by line: §01–§05 + Appendix A/B/C + decision footer) (+ `femwell_journal_sharing_concepts.html`) |
| **Standalone Community page: circles taxonomy (phase/program/region/life-stage/condition), composer (Anonymous/Add phase/Circle/Ask Jess), gentle reactions (same/hold/hear you/saved), AMA card, feed tabs (For you/Your circles/Same phase/Anonymous/Saved), quiet mode, FAB, nav** | `femwell_community_demo.html` (read in full) |
| **LIVE Echo Wall (shipped code, read line by line)** | `src/components/journal/echo/{echoConfig,echoSafety,echoScrub,echoAnon}.js`, `EchoWall.jsx`, `ShareAsEchoSheet.jsx`; `base44/entities/Echo.jsonc`; `claude-state/ECHO_ENTITY_base44_prompt.md`; `claude-state/STATUS.md` (sessions j + l) |
| **3-tier sensitivity, SecureStore, anonymity mechanics, no-scoreboard table, Free/Pro tiers, consent-on-surface, reactions lexicon** | `femwell_strategic_synthesis.md` |
| **Circle of Three (private), Partner Sync, Care Bridge v2 — entities + abuse-aware consent; Rituals/Smart Nudges/TTC/Living Wisdom adjacents** | `femwell_future_features_brainstorm.md`, `femwell_roadmap_brainstorm.md`, `femwell_partner_sync_demo.html`, `femwell_care_bridge_v2_demo.html`, Journal spec §2.1 |
| **Living Wisdom flywheel (WisdomIndex/JessWisdomSurfacings)** | `femwell_living_wisdom_demo.html`, `copy_deck_30_pages.md`, roadmap #10 |
| **Reactions lexicon, Witness dock, GentleReactions, dark-card rule** | `femwell_component_library.html` |
| **Competitive read + safety/moderation/contagion research + UK OSA/GDPR floor (fresh 2025–2026 pass)** | Ms Deep Search v2 research (§4/§6) — URLs below. |

**Research source URLs (§4 / §6):**
_Competitive mechanics:_ Peanut — en.wikipedia.org/wiki/Peanut_App · techcrunch.com/2021/04/27/social-networking-app-for-women-peanut-adds-live-audio-rooms/ · peanut-app.io/blog/pods-safety · techcrunch.com/2021/09/07/social-network-peanut-expands-to-include-more-women-with-launch-of-peanut-menopause/ · techcrunch.com/2022/04/04/social-network-peanut-offering-connect-women-doulas-therapist/ — Flo — flo.health/secret-chats-rules · help.flo.health/hc/en-us/articles/360052675971 · flo.health/product-tour/secret-chats · flo.health/product-tour/anonymous-mode — Reddit — support.reddithelp.com/hc/en-us/articles/15484574206484-Automoderator · dl.acm.org/doi/fullHtml/10.1145/3338243 · fastcompany.com/90472072/reddit-will-now-automatically-connect-potentially-suicidal-users-with-a-hotline · techcrunch.com/2020/03/05/reddit-partners-and-integrates-with-mental-health-service-crisis-text-line/ — Crisis Text Line — en.wikipedia.org/wiki/Crisis_Text_Line · popsci.com/technology/crisis-text-line-stops-sharing-data-loris-ai/ — Clue — helloclue.com/articles/about-clue/discover-cycle-phase-insights-understand-your-body-feel-empowered · helloclue.com/articles/about-clue/scientific-research-at-clue · helloclue.com/articles/how-to-use-clue/how-you-can-manage-your-data-in-clue — Stardust — techcrunch.com/2022/06/27/stardust-period-tracker-phone-number/ · vice.com/en/article/the-1-period-tracker-on-the-app-store-will-hand-over-data-without-a-warrant/ · siliconrepublic.com/enterprise/stardust-period-app-encryption — Maven — mavenclinic.com/about · prnewswire.com (Maven Intelligence) · mavenclinic.com/for-employers — 7 Cups/Wisdo/Koko/TalkLife — healthline.com/health/mental-health/7-cups · bhbusiness.com/2025/04/18/therapist-criticize-digital-health-app-7-cups-for-creating-profiles-without-permission/ · mhealth.jmir.org/2018/2/e38/ · wisdo.com · medcitynews.com/2025/10/talkspace-wisdo-peer-support/ · nbcnews.com/tech/internet/chatgpt-ai-experiment-mental-health-tech-app-koko-rcna65110 · gizmodo.com/mental-health-therapy-app-ai-koko-chatgpt-rob-morris-1849965534 · talklife.com · intuitionlabs.ai/software/telepsychiatry-digital-mental-health/peer-support-apps/talklife — onboarding/retention (Dir) — saasfactor.co/blogs/saas-user-activation-... · disco.co/blog/how-to-build-a-cohort-based-onboarding-program-...
_Safety/contagion/compliance:_ Co-rumination/contagion/ERS — researchgate.net/publication/6231179_Prospective_Associations_of_Co-Rumination... · pubmed.ncbi.nlm.nih.gov/12487497/ · frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2023.1040636/full · ncbi.nlm.nih.gov/pmc/articles/PMC10027699/ · mdpi.com/2227-9032/9/12/1609 · pmc.ncbi.nlm.nih.gov/articles/PMC8700837/ · journals.plos.org/plosone/article?id=10.1371/journal.pone.0142390 · researchgate.net/publication/233885562_Depression_and_Excessive_Reassurance-Seeking · psych.rochester.edu/research/starrlab/.../meta-analysis.pdf · ncbi.nlm.nih.gov/pmc/articles/PMC10785508/ — Benefits/loneliness/common-humanity — pmc.ncbi.nlm.nih.gov/articles/PMC9358944/ · ncbi.nlm.nih.gov/pmc/articles/PMC9316011/ · pmc.ncbi.nlm.nih.gov/articles/PMC8648986/ · ncbi.nlm.nih.gov/pmc/articles/PMC12166162/ · self-compassion.org/wp-content/uploads/publications/SCtheoryarticle.pdf · self-compassion.org/what-is-self-compassion/ · sciencedirect.com/science/article/abs/pii/S016383432100164X · jmir.org/2019/8/e12410/ · ncbi.nlm.nih.gov/pmc/articles/PMC12071810/ — Moderation — samaritans.org/about-samaritans/research-policy/internet-suicide/guidelines-tech-industry/effective-content-moderation/ · samaritans.org/.../developing-content-policy/ · media.samaritans.org/documents/Online_Harms_guidelines_FINAL_1.pdf · arxiv.org/pdf/2005.09225 · togetherall.com/en-us/research/role-of-moderators-in-online-mental-health-communities-harvard-study/ · mental.jmir.org/2024/1/e55750 · infosysbpm.com/blogs/trust-safety/hybrid-moderation-models-balancing-ai-and-human-oversight.html — Anonymity engineering — bugs.telegram.org/c/12862/10 · researchgate.net/publication/284332229_k-Anonymity_A_Model_for_Protecting_Privacy · sciencedirect.com/topics/computer-science/k-anonymity · rate-limiting-nullifier.github.io/rln-docs/ · medium.com/privacy-scaling-explorations/rate-limiting-nullifier-... · blog.cloudflare.com/private-rate-limiting/ · blog.cloudflare.com/privacy-pass-standard/ — UK regulatory — en.wikipedia.org/wiki/Online_Safety_Act_2023 · cms-lawnow.com/en/ealerts/2025/03/online-safety-act-illegal-content-duties-are-now-in-force · whitecase.com/insight-alert/uk-online-safety-act-protection-children-codes-come-force · ofcom.org.uk/.../online-safety-enforcement-guidance.pdf · inforrm.org/2026/03/11/ofcom-steps-up-online-safety-act-enforcement-... · cms-lawnow.com/en/ealerts/2025/12/2025-uk-online-safety-act-round-up · ico.org.uk/.../special-category-data/what-are-the-conditions-for-processing/ · ico.org.uk/.../special-category-data/what-are-the-rules-on-special-category-data/ · mozillafoundation.org/en/privacynotincluded/articles/in-post-roe-v-wade-era-mozilla-labels-18-of-25-popular-period-and-pregnancy-tracking-tech-with-privacy-not-included-warning/

---

# §12 — OPEN DECISIONS FOR HALLI

**A. The master plan's own open questions (peer-relevant):**
1. **Echo phase scope** — exact phase day, ±1-day window, or whole phase for cohort weighting/copy? _(Shipped: whole-phase soft weighting.)_
2. **Crisis-intercept escalation** — auto-disable peer surfaces for 24h after an intercept fires, or a soft toggle?
3. **Onboarding** — does the user pick a sharing comfort level during onboarding, or earn surfaces as entries accumulate? _(Research nudge: deliver the Tier-0 belonging moment in onboarding regardless, §4.7.)_
4. **"Witness" vs "Hold" naming** — the deep file uses Witness Mode; the gesture is hold. Decide once and sweep.

**B. Community-specific decisions:**
5. **Reaction lexicon reconciliation** — master plan + legacy Posts use **`same · hold · hear you · saved`** (4); the shipped Echo Wall uses **`held · me too`** (2). Pick one across all peer surfaces and sweep. _(Recommendation: keep the 2-reaction wall for ephemeral echoes — cleaner — but align labels and the legacy feed.)_
6. **Echo Wall default vs Posts default** — Echo Wall currently defaults on; one-line flip available. _(Recommendation: keep Echo Wall default.)_
7. **Public hold counts** — the shipped wall shows aggregate counts on every card (to all viewers); reconciliation #2 says "private to writer only." Keep public aggregate counts, or move counts to the "My Echoes" tab only? _(Note: public counts risk mild status creep, §4.6 — but aggregate-only never reveals who.)_
8. **Pre-moderation at launch?** — adopt pre-moderation while volume is low (Flo model, safest/OSA-friendly) and relax to AI-prescreen + human-spot-check hybrid as it scales — or go hybrid from day one? _(Recommendation: pre-moderate the small early wall, plan the hybrid.)_
9. **"Others in your phase" aggregate (Tier 0)** — ship the zero-moderation belonging card alongside the wall + in onboarding? _(Recommendation: yes, pull forward to 3.5 — cheap, high-leverage, retention-positive.)_
10. **Legacy Posts feed fate** — keep the named/anonymous Posts feed long-term, or retire it once Echo Wall + Circles + AMAs cover its job? (And: run the no-emoji sweep on it now regardless.)
11. **Circles formalisation** — invest in a proper phase/program/region/life-stage/condition taxonomy with circle-scoped Echo visibility (the reserved `visibility: circles`), or leave circles as the legacy primitive?
12. **Separate track on the roadmap?** — do **Circle of Three / Partner Sync / Care Bridge v2** join the Community roadmap, or stay separate Network/Clinical features?

**C. Blocking / legal-floor decisions (flagged distinctly):**
13. **[BLOCKS DEPLOY OF A SCALED WALL] OSA 2023 + ICO compliance owner & deadline** — who writes the illegal-content + children's risk assessments, the self-harm content policy, the separate special-category consent flow, the Appropriate Policy Document, and stands up **age assurance** (teen stage), and by when? This is a legal requirement once the wall carries real traffic (§4.10 / §8.7), with active Ofcom enforcement and fines up to £18M/10%.
14. **[BLOCKS REAL TRAFFIC] Server-side anonymity timing** — the live `created_by` leak (§8.1) means any wall reader can de-anonymise authors today. Is the on-device `author_hash` acceptable **only for the sale demo with seeded/no real data**, or is the `postEcho` service-identity function a **pre-real-traffic must**? _(Recommendation: must-fix before any real user posts; safe for a controlled demo.)_
15. **[DEPLOY PREREQUISITE] Create the `Echo` entity** — still the single base44 action gating the Phase 3 deploy (Appendix A). Confirmed created by Halli in session j/l; re-confirm it persists before applying the patch.

---

# §13 — DEFINITION OF DONE / DEPTH CHECKLIST *(per `SPEC_FRAMEWORK.md` §12)*

**Structure & capture** — [x] all 12 framework sections present · [x] every source read word-for-word + captured 1:1 (community_demo, sharing_deep incl. appendices, community_v2, brainstorms, live echo code, STATUS) · [x] source-vs-source conflicts flagged (fade 48h-vs-7d; lexicon 2-vs-4; holds public-vs-private).
**Feature inventory** — [x] every feature has purpose · IA · all states · data wiring + named entities/fields · interactions · edge cases · phase · [x] no "wired to the database" without a named entity · [x] phase-tag legend defined.
**Research & competition** — [x] many credible resolving sources cited with confidence flags · [x] evidence base separated from market research · [x] every finding ends in a design implication · [x] 7+ named competitors in EMULATE/AVOID with concrete mechanics · [x] cautionary tales dissected (Stardust/CTL/Koko/Flo) · [x] wedge named.
**Cross-app & data** — [x] cross-app is its own substantial section (§7) with data-flow direction + entry points + shared primitives · [x] Doctor-export / Jess / notifications interlocks explicit (§7.5/§7.6/§7.8).
**Safety, risk, compliance** — [x] anonymity model with honest limits (the `created_by` leak) · [x] sensitivity tiers + deletion cascade · [x] UK legal floor explicit (OSA + ICO + age assurance) with requirement-vs-nice-to-have + owners flagged (§12.13) · [x] every risk has a countermeasure in the design.
**Rollout, provenance, decisions** — [x] each phase independently shippable + live-walked with exit gate + "not done by design" · [x] source map traces every area + full research URLs · [x] open decisions with options + recommendation; blocking ones flagged (§12.13–15).
**Brand & craft** — [x] no emoji in specified UI (the one legacy-Posts emoji is flagged as the outstanding fix) · [x] UK locale throughout · [x] no scoreboards / streak-shame · [x] craft bar stated (§14); Ms Atelier → Ms Verify gate named.
**Self-grade** — [x] this checklist reproduced and ticked.

---

# §14 — CRAFT BAR
Echo Wall already ships the Editorial system: real cotton-paper over cream, debossed ink, **Ephesis script / Caveat hand / Cormorant serif / Inter chrome**, gold accent at emotional beats, Lucide glyphs only (`Waves`/`HeartHandshake`/`Users`/`Flag`/`Undo2`/`Clock`/`ShieldAlert`/`Phone`/`Check`), **no emoji**. Every new peer surface inherits it. The **dark plum "trust-ink" gradient** is reserved for fragile surfaces (Witness dock, crisis intercept, consent gates) — never ordinary cards. Witness/Twin entries render in the **reading engine** (the page IS the screen; shared with the Journal Reader + Daily Story). **Ms Atelier crafts → Ms Verify gates every visual change against the reference/spec before ship.** Pen-depth remains FROZEN (Journal locked decision).

---

# APPENDIX A — base44 ENTITIES THAT NEED CREATING (Halli-in-the-UI actions)
base44 does not instantiate entities from `.jsonc` on deploy, and there is no programmatic schema-create API. Every entity below must be created once via **Data tab → Create entity** (preferred, no AI build points) or a single authorized chat-builder prompt.

| Entity | Tier | For | Phase | Status |
|---|---|---|---|---|
| **`Echo`** | 2 | Echo Wall (body, author_hash, phase, life_stage, cycle_day, source_entry_hash, live_at, expires_at, held_count, metoo_count, report_count, hidden, visibility) | 3 | **Created by Halli (session j/l), round-trips 200. Re-confirm persists before applying the patch. Prompt: `claude-state/ECHO_ENTITY_base44_prompt.md`.** |
| `EchoFlags` | 2 | auditable server-side reports (replaces client-only dedup) | 3.5 | not created |
| `EchoPrefs` (or `UserPreferences` fields) | 2 | Echo Wall Settings (audience/guardrails/fade) | 3.5/Q3 | not created |
| `PhaseAggregates` (or a count query) | derived | Tier-0 "others in your phase" card | 3.5 | not created |
| `WitnessRequests` | 3 (E2E) | Witness Mode (writer_hash, entry_ciphertext, match_criteria, matched_at, read_at, response_code) | 4/Q3 | not created |
| `WitnessStrikes` | 3 | 3-strike receiver policy (witness_hash, strike_type, occurred_at) | 4/Q3 | not created |
| `TwinPairs` | 2 | Phase Twin (cycle_start/end, partner_a/b_hash, shared_tags[], closed_at) | 5/Q4 | not created |
| `TwinEntries` | 2 | Phase Twin daily entries (pair_id, author_hash, prompt_id, entry_text, written_at; delete day 13) | 5/Q4 | not created |
| `TwinPrompts` | 1 | ~40 prompts/phase, no repeat within 3 cycles | 5/Q4 | not created |
| `WisdomIndex` | 2 | Living Wisdom eligible echoes (phase-keyed) | Q3 | not created |
| `JessWisdomSurfacings` | 2 | Living Wisdom audit + never-repeat + matched_on | Q3 | not created |
| `Circles(private)` / `CircleMembers` / `CircleDigests` | 2 | Circle of Three (private named circle) | separate | not created |
| `PartnerLinks` / `PartnerShareStates` / `PartnerMessages` | 2/3 | Partner Sync | separate | not created |
| `ClinicianLinks` / `ClinicianNotes` / `ClinicianAudit` | 2/3 | Care Bridge v2 | separate | not created |

**Server-side functions to add (Q3+, not entities):** `postEcho` (write echoes under a service identity = true anonymity + server-enforced rate limits via an unlinkable-token/nullifier scheme) · a scheduled **purge** function (server-side fade/auto-unpost) · the Phase-Twin **reveal gate** (returns both entries only after both `written_at`) · an **AI pre-screen** hook (text + username filters + image hashing) feeding a human spot-check queue.

_End of v2. This doc is the Community twin of `JOURNAL_BUILD_SPEC.md` v3 and is written + graded to `SPEC_FRAMEWORK.md` v1. The master plan (JournalPlanDoc) wins any conflict; where this doc adds research or production detail the master plan doesn't spell out, it is marked. Update on every shipped pass + every decision resolved in §12._

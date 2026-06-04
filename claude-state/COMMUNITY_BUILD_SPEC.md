# FemWell Community — BUILD SPEC (production, Editorial direction) — v1

_Owner: Mr Lead Manager. Craft: Ms Atelier. Research: Ms Deep Search. Verification gate: Ms Verify._
_v1 2026-06-04 — written the way `JOURNAL_BUILD_SPEC.md` v3 was: every source read in full, word for word; the live Echo Wall read line by line; a fresh cited research pass folded in. Community is the **peer-shapes half** of the same system the Journal spec covers — this doc is its twin._

> **THESIS (locked, from the Journal master plan):** **"Journal owns the writer. Community owns the peer shapes."** One entry can flow through both — **"one entry, four lives":** stay locked (default) · become an **echo** · be **sealed** to future-you · be handed to **one witness**. Community is where the peer shapes live: **Echo Wall → Witness → Phase Twin**, on a **solitude → witness gradient**, plus **Circles** and the **Living Wisdom** flywheel. **Ship the solo features first, earn the paired ones.** Community is anonymous-first; the widest anything travels is **one scrubbed line to the in-app wall** — there is no public profile, no web-public audience, no named feed.
>
> **WHERE WE ARE (2026-06-04):** Live anchor = **origin/main `647754a`**, bundle **`index-B3BplAS-.js`**. The first social tier — **Echo Wall (Phase 3)** — is BUILT and **patch-ready** (`femwell_journal_phase3_echowall_2026-06-03.patch`, on `484fafe`) but **NOT deployed**, and it is blocked on **one base44 action by Halli: create the `Echo` entity** (no programmatic create path — see §3.2 / `claude-state/ECHO_ENTITY_base44_prompt.md`). Witness (Q3) and Phase Twin (Q4) are designed but unbuilt. This spec captures the **whole** Community surface so the remaining quarters ship against one authority.
>
> **Hard brand rules:** UK market (NHS, GMC/NMC/HCPC, £, UK GDPR/DPA 2018) · **no emoji anywhere** (Lucide + custom SVG only) · Editorial type kit (Ephesis script · Caveat hand · Cormorant serif · Inter chrome) · one unified bottom nav at all viewports · **no scoreboards** (no likes, follows, handles, karma, leaderboards) · evidence-informed, never a clinical promise.

---

# §0 — HOW TO READ THIS DOC
- **§1** captures the master-plan Community vision 1:1 (the peer half of the Journal master plan + the sharing demos), the same way the Journal spec's §1 did.
- **§2** is the FULL FEATURE INVENTORY — every Community surface, its states, its data wiring, the base44 entities it needs, and its phase. This is the build queue.
- **§3** is the safety / anonymity / moderation model (shipped rails + the research-driven hardening + the UK legal floor).
- **§4** is the competitive read (the cited research pass).
- **§5** is the phased rollout roadmap.
- **§6** is the craft bar.
- **§7** is OPEN DECISIONS FOR HALLI.
- **§8** is the SOURCE MAP (which doc each piece came from).
- **Appendix A** is the entity-creation checklist (every base44 entity that needs Halli in the UI).

---

# §1 — THE COMMUNITY VISION, CAPTURED 1:1

## 1.0 The frame
Community is **"for sisters, near and anonymous"** — anything that needs another person. It is the deliberate counterweight to the Journal (**"for you and future-you"**, everything under your lock). The Journal master plan draws a single system across both pages and walks the user along a **solitude → witness gradient** as trust builds:

> **Cycle Mirror → Sealed Letters → Echo Wall → Witness Mode → Phase Twin.**
> The first two are SOLO (they live in the Journal). The last three are PEER (they live in Community). **"Journal gets the depth. Community earns the proximity."**

Runway framing: **6-month sale window, 9-month soft cap** — Community is the differentiating moat (the Echo Wall in particular: _"the highest-leverage differentiating play"_), so it is built carefully, not rushed.

## 1.1 The peer concepts on the gradient *(verbatim: body · moat · voice · quarter)*
Concept colours `g3 #C17B4E (Echo) → g4 #8B2635 (Witness) → g5 #4A2A3A (Twin)`.

3. **Echo Wall — "A room of one-liners."** _(Q2 — BUILT, patch-ready)_
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

## 1.2 What's locked — the Community principles *(adapted from the master plan's 8, peer-specific)*
1. **Anonymity is the default** for any peer surface. UUID-only echoes, hashed author token (retract without de-anonymising), no handles, no profile, no carry-over between sessions/pairings. _"No public profile — Community is anonymous-first."_
2. **Solo before social.** Cycle Mirror and Sealed Letters (Journal) earn the trust that Echo Wall, Witness, and Phase Twin spend.
3. **Reactions are emotional, not transactional.** No like. No emoji pile-on. No follow. Counts are never used to rank a feed. (Lexicon: see the §7 reconciliation — the master plan's `same · hold · hear you · saved` vs the shipped Echo Wall's `held · me too`.)
4. **Phase-aware copy across the board** — luteal/follicular/ovulatory/menstrual voice; "your phase" weighting, never a hard filter that walls a sister out.
5. **No scoreboards anywhere.** No streaks, XP, badges, leaderboards, "most relatable," public popularity. Every mechanic that would gamify gets a gentler replacement (hold not like; Phase Twin not leaderboard).
6. **Evidence-informed, never clinical promise.** A peer is not a clinician; the surface always has a visible escalation path to NHS/Samaritans/Mind.
7. **No emoji codepoints anywhere** — Lucide + custom SVG only (the shipped Echo Wall already obeys this; the legacy Posts feed still has emoji and is the one fix on the ledger).
8. **Public-feed creep is the enemy.** Every social mechanic grows a follow button if you let it. Hard rules: **no handles, no threads, no DMs, no like, no leaderboard.** Echo Wall + Witness die the moment they grow conversation.

## 1.3 "One entry, four lives" — the Journal↔Community handoff *(from community_v2)*
The same reflection, decided **at the entry level, never by default**, can take four lives:
- **Stay locked** — default; lives in the Journal under the user's key. (Tier 3, E2E.)
- **Become an echo** — Jess offers ONE scrubbed line; it goes to the Echo Wall, anonymous, fades in 48h. (Entry point: a **Share-as-Echo slot** on the Journal composer + on an individual entry.)
- **Be sealed** — a Sealed Letter to future-you (Journal-side, solo).
- **Be handed to one witness** — Witness Mode (Community-side, paired). (Entry point: a **"Feels heavy? Hand it to a witness"** slot on an individual entry.)

The handoff is the system's spine: **Journal = the writer's page** (locked by default; Mirror + Sealed Letters + Share-as-Echo slot). **Community = the peer-shape page** (anonymous by default; Echo Wall + Witness dock + Phase Twin card + Circles + AMAs).

## 1.4 The two pages, element by element *(community_v2 "kept / new / shifted" maps — verbatim)*
**Journal page (writer):** KEPT — Jess prompt · Tonight's prompts · Threads · Pattern card · Privacy footer. NEW — Cycle Mirror (d19 × 5) · Sealed Letters rail · Anniversary surfacing · **Share-as-Echo slot**. _(All built across Journal Phases 0–3; see the Journal spec.)_

**Community page (peer):** KEPT — Composer · **Circles carousel** · Gentle reactions · AMA card · Quiet mode. SHIFTED — _Jess "smart pick" → Echo Wall_ (the wall replaces the old "Jess picked for you" named-author surfacing as the primary peer surface). NEW — **Echo Wall feed** · **Witness dock** · **Phase Twin card** · Composer extended with witness + echo tools. _("Witness Mode is a dock, not a page — receive one, be one. Phase Twin is a seasonal opt-in card. Circles + AMAs stay.")_

## 1.5 The reconciliations already made *(master plan §1.5 — peer items)*
1. **Echo fade window** — **48h ships first** (more protective; lower retention pressure). Move to 7d only after 3 cycles of cohort data show no harm. _(SHIPPED at 48h.)_
2. **Holds count visibility** — **private to writer only.** A public count creates ranking incentives the brand can't carry. _(NB: the shipped Echo Wall shows aggregate counts on the card to all viewers — see §7 open decision; the demo "My echoes" tab is where private holds live.)_
3. **Witness re-route on no-response** — **both:** 2h writer-cancel window; if the receiver doesn't open within 6h, route to one fallback receiver with a "sent on after waiting" note; after that, archive to the writer's letter library.
4. **Echo Wall home** — **Community-side rail with a Journal-side opt-in slot.** _(SHIPPED exactly this way.)_
5. **Cultural register** — **UK-locked.** Echo Wall is anonymous in production, so this affects demo strings + brand register + crisis resources (Samaritans/NHS 111/Shout/Mind). _(SHIPPED UK; legacy demo names like Ada/Amara/Nneka are superseded.)_

## 1.6 The evidence base *(bibliography, never marketing — peer-relevant threads)*
- **Neff — self-compassion → common humanity:** the **common-humanity** leg is the justification for cycle-cohort framing (Echo Wall, Phase Twin) — "you're not the only one in your inner autumn tonight."
- **CHI 2024 — post-Roe privacy:** the top fear is government/law-enforcement access to cycle data. **Visible privacy beats invisible privacy.** Community must be *visibly* un-compellable (no PII at rest).
- **Vulnerability-Amplifying Interaction Loops (2025):** names the sycophancy failure mode — **Jess must observe, not companion.** The Living Wisdom flywheel must surface *company, not advice*.
- **(NEW, from the v1 research pass — see §4)** the **co-rumination / emotional-contagion** literature: *reading* others' distress in peer-support networks is itself a documented source of worry and contagion. This is the single biggest design constraint and it **validates** the one-line / fade / non-transactional / no-thread design as a countermeasure.

---

# §2 — FULL FEATURE INVENTORY (the build queue)

Legend — **Live** = shipped to production · **Patch** = built, patch-ready, not deployed · **Demo** = designed in a demo/spec, not built · **Plan** = named, needs design.
States checked for every surface: **empty / loading / error / populated** (+ surface-specific).

---

## 2.A — SHIPPED / PATCH-READY (Phase 3 — the Echo Wall tier)

### 2.A.1 Community page shell + Echo Wall / Posts view toggle — **Patch**
- **What:** `src/pages/Community.jsx` gains a top **Echo Wall / Posts** view toggle. **Echo Wall is the default.** The legacy Posts feed (FAB, new-post sheet, category pills, its pre-existing emoji) is fully preserved under the Posts tab, gated and untouched ("no brick on bread").
- **States:** toggle persists view; each sub-view owns its own empty/loading/error.
- **Data:** Echo Wall → `Echo` entity; Posts → existing `CommunityPosts`/circles primitive (untouched).
- **Entities:** `Echo` (NEW — must be created). Posts feed reuses existing entities.
- **Phase:** 3 (patch-ready). **Decision flag (§7):** Echo Wall defaults on — one-line flip to default-Posts if Halli prefers.

### 2.A.2 Echo Wall feed — **Patch** *(`src/components/journal/echo/EchoWall.jsx`)*
- **What:** a phase-weighted feed of anonymous one-liners. Everyone's live echoes are eligible; the feed is **WEIGHTED toward the viewer's phase sisters** (soft boost in ranking — `PHASE_MATCH_BOOST 600` + `LIFE_STAGE_BOOST 150` + recency half-life 6h — **never a hard filter**). A "your phase" chip marks sister echoes. A live cohort line heads the wall ("3 of women in their inner autumn left a line in this window").
- **States:** **loading** (gold spinner) · **error** ("The wall couldn't open just now…") · **empty** ("Quiet, for now — No echoes in this window yet. If something is true for you, you can leave the first — from your Journal.") · **populated** (ranked cards with fade label).
- **Data wiring:** `base44.entities.Echo.filter({ hidden: false }, "-created_date", 200)`; live/cooling/expired decided **on-device** (time-derived from `live_at`/`expires_at`); `rankFeed()` from `echoSafety.js`.
- **Entities:** `Echo`.
- **Phase:** 3.

### 2.A.3 Share-as-Echo — **Patch** *(`ShareAsEchoSheet.jsx` + Journal entry points)*
- **What:** the Journal-side composer flow: write → **Jess offers a scrubbed line** (shows what was removed) → **crisis intercept** (UK resources, never posts) → cooling/throttle notice → **Share / Edit first / Keep private** → "It's held" / blocked / rate-limited. Entry points: a **Share-as-Echo slot** that replaced the honest "Echo wall · Coming" teaser on `Journal.jsx`, **and** a "Share a line from this as an echo" affordance in `NewEntrySheet.jsx` Write mode (appears once there's text, seeded with the draft).
- **States:** offered / edited / crisis-intercepted / cooling-notice / shared("It's held") / blocked(identifier remained) / rate-limited(5/day) / kept-private.
- **Data wiring:** `scrubToEcho()` + `crisisCheck()` (on-device, `echoScrub.js`); `computeCooling()` (`echoSafety.js`); `authorHash()` + `bumpEchoesToday()` (`echoAnon.js`); `Echo.create({...})` with the scrubbed body, never the raw text.
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
- **Entities:** `Echo`.
- **Phase:** 3. **Reconciliation flag (§7):** the master plan's lexicon is `same · hold · hear you · saved` (4); the shipped wall uses `held · me too` (2). Decide one and sweep.

### 2.A.6 Report → auto-hide — **Patch**
- **What:** a `Flag` on each echo; `report_count` increments; at `REPORT_AUTOHIDE_THRESHOLD (2)` the client sets `hidden=true` and the echo vanishes for everyone. On-device report dedup.
- **States:** un-reported / reported(disabled).
- **Data:** `hasReported/markReported`; `Echo.update(id, {report_count, hidden})`.
- **Entities:** `Echo`.
- **Phase:** 3. **Honest limit:** community-moderation counters are client-enforced in v1 (any signed-in user can update counters by design) — server-side moderation is Q3 hardening.

### 2.A.7 Auto-unpost (expired-echo cleanup) — **Patch**
- **What:** on wall load, the author's own expired echoes are **hard-deleted** (`Echo.delete`), and no echo past `expires_at` ever renders. Master-plan "auto-unpost after 48h app absence" is approximated client-side.
- **Entities:** `Echo`. **Honest limit:** a scheduled server-side purge is the Q3 complement (so echoes from a device that never returns still get cleaned).
- **Phase:** 3.

### 2.A.8 The Echo entity + its rails (the substrate)
- **Schema-as-code:** `base44/entities/Echo.jsonc` — fields `body · author_hash · phase(enum) · life_stage · cycle_day · source_entry_hash · live_at · expires_at · held_count · metoo_count · report_count · hidden · visibility(enum same_phase/circles/all, default all)`. Required: body, author_hash, live_at, expires_at. Indexes: phase, expires_at, hidden. Read: all signed-in; Create/Update: any signed-in; **Delete: creator only.** No user_id/email by design.
- **Config (`echoConfig.js`):** FADE_HOURS 48 · COOL_MINUTES_BASE 10 / LATE_LUTEAL 30 · NIGHT 22:00–06:00 · LATE_LUTEAL_DAY 22 · MAX_ECHO_LEN 180 · DAILY_ECHO_LIMIT 5 · REPORT_AUTOHIDE_THRESHOLD 2 · feed weights · the `held`/`me too` lexicon · phase-cohort copy · **UK crisis resources (Samaritans 116 123 · NHS 111 · Shout 85258 · Mind 0300 123 3393)** + crisis pattern lexicon.
- **>>> base44 ACTION FOR HALLI (Appendix A): create the `Echo` entity ONCE <<<** — no programmatic create path exists; Data tab → Create entity (preferred) or the one authorized chat-builder prompt in `claude-state/ECHO_ENTITY_base44_prompt.md`.

---

## 2.B — DESIGNED, NOT BUILT (Echo Wall depth — Q3 hardening pass)

### 2.B.1 "My Echoes" tab — **Demo** *(sharing_deep PHONE 1C)*
- **What:** the author's own echoes: **Live (n) / Faded (n) / Drafts** tabs; per-echo hold count, "Edit line", "Unpost"; a header tally ("8 echoes posted · 4 live · 419 holds received"); a **Quiet mode** toggle ("auto-unpost all my echoes if I don't open the app for 48 hours"). This is where **holds are private to the writer** (reconciliation #2).
- **States:** live / faded / drafts / quiet-mode on-off.
- **Data:** filter `Echo` by `author_hash === myHash`; needs an `edited_at` field if "Edit line" persists; Drafts need a local or entity store.
- **Entities:** `Echo` (+ optional `edited_at` field; Drafts may be on-device).
- **Phase:** 3.5 / Q3.

### 2.B.2 Echo Wall Settings — **Demo** *(sharing_deep PHONE 1D)*
- **What:** "How you show up on the wall. All changes apply to future echoes only." Three sections: **Audience** (Same phase [default] · My circles · All sisters) → drives the `visibility` enum already reserved on `Echo`; **Guardrails** (Jess rewrites before I see the line · 10-min cooling pause · block posts during late luteal d24–28 [can override]); **Fading** (echoes fade after — 7 days default · max 14; holds are private to me).
- **States:** standard settings; reflects current `visibility` + guardrail toggles.
- **Data wiring:** user-level preferences (a `EchoPrefs`/`UserPreferences` field set); the audience choice sets the `visibility` written on new echoes (the field exists but v1 always writes `all`).
- **Entities:** `Echo.visibility` (exists) + a prefs store (`UserPreferences` extension or new `EchoPrefs`).
- **Phase:** 3.5 / Q3. **Note:** the demo defaults fade to 7d; the shipped reconciliation is **48h first**, move to 7d only after 3 cycles of safe data — keep 48h until then.

### 2.B.3 "Others in your phase" aggregate belonging card — **Plan (NEW, research-driven)**
- **What:** a **zero-moderation-cost** belonging signal alongside the wall — "847 women in your luteal phase logged something heavy this week" / "you're one of 312 in your inner autumn tonight." Borrowed from Clue's sub-phase aggregate (see §4); converts cold stats into *you're-not-alone* with no 1:1 exposure and no content to moderate.
- **States:** loading / populated / suppressed (cohort too small to be non-identifying — floor e.g. ≥ 20).
- **Data wiring:** a derived count over `Echo` (or over anonymised cycle aggregates), never naming anyone; k-anonymity floor.
- **Entities:** a derived `PhaseAggregates` view (or a count query); no new PII.
- **Phase:** 3.5 / Q3 (cheap, high-leverage — recommend pulling forward).

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
- **Entities:** `WitnessRequests` (`writer_hash · entry_ciphertext · match_criteria · matched_at · read_at · response_code(1–4|null)`). **Tier 3, E2E** (the entry is ciphertext — reuse the SecureStore primitive built with Sealed Letters).
- **Phase:** 4 (Q3).

### 2.C.3 Receiver view (4 fixed responses) — **Demo**
- **What:** "A sister needs a witness. Will you read one thing, once?" → locked entry (no copy) + the **4 fixed Fraunces/Caveat lines**: _"I'm holding this with you. / Me too. / You're not alone in this. / I hear you."_ + **pass silently** ("she won't know you read it"). After choosing, the entry seals again and leaves no history.
- **States:** request / reading / one-of-4 chosen / passed.
- **Entities:** `WitnessRequests` (response_code).
- **Phase:** 4 (Q3).

### 2.C.4 Witness gate ("held 3 before you send") — **Demo**
- **What:** _"You can hold someone when you've been held."_ Only sisters **witnessed ≥ 3 times** can volunteer to be a witness — pay-it-forward, prevents drive-by senders. Pathway card ("you've been witnessed 2 times. One more to unlock.").
- **Entities:** counts derived from `WitnessRequests`.
- **Phase:** 4 (Q3).

### 2.C.5 Witness charter (first-time consent, 6 rails) — **Demo**
- **What:** shown once (re-readable from Settings). The 6 rails: **Anonymous** (she sees entry + phase + life stage, never handle/photo/region) · **One-shot** (one read, one fixed response, no DM/follow/re-view) · **Cancel before she reads** (2h re-seal) · **Not for crisis** (self-harm → Panic Mode + trained resources, never a peer) · **No names/locations** (Jess asks you to edit if she detects identifying detail) · **You choose her shape** (default same phase + life stage; tighten/loosen). The receiver-side charter adds: not a therapist; choose from the 4 lines or pass; **never screenshot** (OS-level no-copy; attempting is a strike); never discuss it; opt out anytime.
- **Phase:** 4 (Q3).

### 2.C.6 3-strike receiver policy + FLAG_SECURE — **Demo**
- **What:** _"3 strikes and the door closes."_ Screenshot attempts, replying outside the 4 lines, or flagging innocuous entries as crisis removes a receiver from the pool. **FLAG_SECURE** (Android) + iOS capture prevention on the receiver view.
- **Entities:** `WitnessStrikes`. **Tier 3.**
- **Phase:** 4 (Q3). **Note:** FLAG_SECURE/iOS capture-prevention is a **native** capability — likely needs the Capacitor wrap (cross-link `project_capacitor_stripe_paywall`). Flag as a native dependency.

### 2.C.7 Crisis escalation routing (writer-side) — **Demo** *(extends the shipped Echo crisis intercept)*
- **What:** _"This sounds heavy. A peer isn't the right shape for tonight. You deserve more than a sister can hold. Not less. More."_ Keyword+context hit → route to **Panic Mode + UK resources (Samaritans 116 123, NHS 111, Shout 85258, your Person)** — never to a peer. The entry stays sealed; nothing is sent. (The Echo Wall already ships this intercept logic in `echoScrub.js`/`echoConfig.js`; Witness reuses it.)
- **Phase:** 4 (Q3) — but the underlying intercept is **already shipped** in Phase 3.

---

## 2.D — PHASE TWIN (Q4, deepest) — **Demo** *(sharing_deep §05)*

### 2.D.1 Match screen — **Demo**
- **What:** "Day 1 of 12 · luteal match. You've been matched with one sister for this cycle." Shared tags (e.g. #work-stress), life stage, "no kids"; **today's shared prompt**; "you'll see her entry the moment you both write. Not before." Container-closes countdown.
- **States:** matched-day-1 / unwritten / waiting-on-twin / both-written / twin-quiet (4+ days → gentle re-match) / exited.
- **Entities:** `TwinPairs` (`cycle_start · cycle_end · partner_a_hash · partner_b_hash · shared_tags[] · closed_at`).
- **Phase:** 5 (Q4).

### 2.D.2 Both-wrote reveal + Jess bridging — **Demo**
- **What:** entries reveal **only after a server-side gate confirms both `written_at`**; Jess posts **one bridging note per day** ("two luteal women, two different edges to soften — inbox and mother — and both of you called it… sit with that"); a "days written together" counter.
- **Data wiring:** **server-side reveal gate** (returns both entries only after both written — so neither lives in two realities).
- **Entities:** `TwinEntries` (delete on day 13), `TwinPrompts` (~40/phase, no repeat within 3 cycles).
- **Phase:** 5 (Q4).

### 2.D.3 Opt-in onboarding (12-day contract) — **Demo**
- **What:** _"A 12-day container. Not a friendship. Jess is the only voice between you."_ Contract: 12 days then it ends (re-enter next cycle); she can go quiet (4+ days → gentle re-match, no blame); you can exit any day (both just stop seeing each other). A **shared / not-shared matrix:** she sees phase+day, life stage, shared tag, today's entry only; she never sees name/handle, other entries, region/photo, past cycles.
- **Phase:** 5 (Q4).

### 2.D.4 Closing ritual (day 12 keepsake) — **Demo**
- **What:** day 12 — "12 days. 8 shared entries. One shape you both wrote." Jess names the shared themes; each carries **one of the other's lines** (parting-line exchange, 48h window). "The container has closed. You can re-enter on your next cycle — a new twin, same Jess."
- **Container rules:** opens at matching, closes at next period day 1, **no re-entry that cycle.**
- **Entities:** `TwinPairs` (closed_at), `TwinEntries`.
- **Phase:** 5 (Q4).

---

## 2.E — LIVING WISDOM (Echo × Jess flywheel) — **Demo/Plan** *(living_wisdom demo, copy_deck, roadmap #10)*
- **What:** collective Echo wisdom surfaced **into the compose flow as company, not advice.** Journal trigger: 60s sustained writing + phase/topic match ≥ threshold → **one faded wisdom card inline, max 1/session** ("someone 19 days in wrote this · 42 holds"). Ranking phase×topic×recency×holds; **90-day repeat lock**; topic signals from the user's own words, **never shared back**; the surfaced Echo **cannot be screenshotted/exported.** Surfaces: journal / today / panic_afterglow / jess_drawer.
- **States:** no-eligible-wisdom / one-card-surfaced / dismissed.
- **Data wiring:** needs Echo Wall data first (eligible = clean ∧ holds ≥ 5 ∧ age ≤ 180d).
- **Entities:** `WisdomIndex` (phase-keyed eligible echoes), `JessWisdomSurfacings` (audit + never-repeat + `matched_on` transparency).
- **Phase:** 3+/Q3 (depends on Echo Wall volume).
- **Risk to honour:** the sycophancy/contagion failure mode — Jess surfaces *company*, never advice; never reinforces a spiral.

---

## 2.F — CIRCLES + LEGACY POSTS (the existing Community primitive)

### 2.F.1 Circles carousel — **Live (legacy) / formalise later**
- **What:** themed cohorts the user joins, by **type**: **Phase** (Luteal Softness · 1.4k) · **Program** (Sleep Reset cohort) · **Region** (UK Women Wellness · 2.1k) · **Life stage** (Perimenopause Watch · 890 · Postpartum First Year · 310) · **Condition** (PCOS Honest · 760 · PMDD Support). "6 circles · 12 sisters posting today."
- **States:** browse / joined / circle feed / new circle opening.
- **Entities:** existing `Circles` (Community-side, public) + `CommunityPosts`. _Master plan: "Circles + AMAs stay."_ A formalisation pass (consistent join/leave, phase/program/region/life-stage/condition taxonomy, circle-scoped Echo visibility) is **Q3+.**
- **Phase:** existing; formalise Q3+.

### 2.F.2 Legacy Posts feed — **Live (preserved under tab)**
- **What:** the pre-existing named/anonymous post feed (composer with Anonymous/Add phase/Circle, gentle reactions, replies, AMA card). Preserved verbatim under the **Posts** tab when Echo Wall is the default. **Carries the only remaining emoji in Community** (e.g. the legacy follicular "win" post) — a no-emoji sweep is the one outstanding brand fix here.
- **Entities:** `CommunityPosts`, `Circles`.
- **Phase:** existing. **Decision (§7):** keep the Posts feed long-term, or retire it once Echo Wall + circles + AMAs cover its job?

### 2.F.3 Gentle reactions (legacy lexicon) — **Live**
- **What:** the legacy post reactions: **same · hold · hear you · saved** (the master plan's canonical 4). Counts never ranked; feed order phase + recency.
- **Reconciliation (§7):** Echo Wall narrowed this to `held · me too`. Pick one lexicon across all peer surfaces and sweep.
- **Phase:** existing.

### 2.F.4 Expert AMA card — **Live (legacy)**
- **What:** "This week's AMA · Dr Aisha Patel, OB-GYN · Topic: PMS vs PMDD · Live Thurs 8pm BST · Reserve." Expert-adjacency (the research's safest model — a credible escalation path beside peer content).
- **Entities:** existing `AMASessions`/`Experts`.
- **Phase:** existing; deepen Q4 (live AMA channel).

### 2.F.5 Composer (extended) — **Demo**
- **What:** the Community composer extended with the peer tools: **Anonymous · Add phase · Circle · Post as echo · Send to a witness · (Ask Jess).**
- **Phase:** the echo + witness tools land with Phases 3/4 respectively.

### 2.F.6 Quiet mode — **Live (legacy)**
- **What:** a Community-wide "Quiet on" toggle that softens surfacing/notifications. Keep; align with the Echo "quiet mode auto-unpost" idea.
- **Phase:** existing.

---

## 2.G — SEPARATE TRACK (private named-circle / partner / clinical sharing — NOT the anonymous wall)
These are sourced from `future_features_brainstorm` + `roadmap_brainstorm` + the Journal spec §2.1. They are **narrow-private**, not anonymous-peer — Halli decides if they ride the Community roadmap or stay separate Network/Clinical features (§7).

### 2.G.1 Circle of Three (private named circle) — **Plan**
- **What:** 2–3 chosen people (mother/sister/best friend) get a **narrow read** = current phase label + last week's felt-sense summary; **no logs, no Jess notes; quarterly re-consent.** Not public community — a private circle.
- **Entities (NEW):** `Circles(private)` (distinct from public Community Circles), `CircleMembers`, `CircleDigests`.
- **Phase:** separate track.

### 2.G.2 Partner Sync — **Demo** *(partner_sync demo)*
- **What:** consent-gated "cycle weather" for ONE person — today's phase chip + a mood word the user chose + a 3-item "what helps me today" list she curates (Jess drafts, user approves). No symptoms, no journal. Partner gets a stripped FemWell Lite + phase-transition notification; optional gentle voice notes. **Fast revoke; no coercive re-connect** (abuse-aware).
- **Entities (NEW):** `PartnerLinks`, `PartnerShareStates`/`PartnerViews`, `PartnerMessages` (E2E).
- **Phase:** separate track (Pro+).

### 2.G.3 Care Bridge (clinician share) — **Demo** *(care_bridge_v2 demo)*
- **What:** v1 = a PDF export of the last 90 days for a GP (cycle regularity, symptom heat-map, meds, a Jess-drafted "what I want to talk about"). v2 = a clinician "invited reviewer" link (14-day expiry) with a narrow read-only view + one async note per visit. **UK GDPR + DPA 2018 compliance, audit trail.**
- **Entities (NEW for v2):** `ClinicianLinks`, `ClinicianNotes`, `ClinicianAudit`.
- **Phase:** separate track (Pro+). _(Clinical, not peer — included for completeness; the Doctor-Ready Diary already ships free from the Journal.)_

---

# §3 — SAFETY · ANONYMITY · MODERATION MODEL

This is the spine of the whole feature. The shipped Echo Wall already implements most of v1; the research pass (§4) and the UK legal floor define the hardening.

## 3.1 The anonymity model (shipped v1 + the honest gaps)
- **Author token:** `author_hash = SHA-256(userId :: per-device-secret)`, computed on-device; the secret lives only in `localStorage (fw_echo_anon_v1)` and never leaves. Rows carry **no user_id/email/name.** The author's own device recomputes the hash to find + retract its echoes **without de-anonymising anyone.**
- **HONEST LIMITS (documented, flagged Q3):** (1) base44's platform `created_by` still records the creator — the app never writes/queries/surfaces it, but **true server-side anonymity needs a `postEcho` function writing under a service identity** (Q3). (2) reaction/report/rate-limit dedup is **on-device** (best-effort, not server-enforced). (3) retract works from the posting device only; echoes fade in 48h regardless. (4) the scrub is regex-deterministic on-device; an on-device-LLM rewrite is a future layer that **must also stay on-device.**
- **De-anon discipline (research, §4):** reactions must stay **aggregate-only — never reveal *who* reacted** (the Telegram de-anon trap). The shipped wall obeys this (counts only). Watch correlation risk: timestamp + phase + cycle_day can narrow a cohort — keep cohorts above a k-anonymity floor before showing "n in your phase."

## 3.2 The scrub (the "Jess scrub", on-device) — **shipped** *(`echoScrub.js`)*
Deterministic regex/string work; **raw text never leaves the device.** Strips emails/phones/handles/links/dates/weekdays/months/ages/money/years/substances/common-names/UK-places + a proper-noun heuristic; reduces to a single line ≤ 180 chars; **final leak re-scan blocks the post** if a hard identifier survived (or too little remains). Future on-device LLM rewrite sits on top — **never** send raw text to a server to "scrub" it (that defeats the promise).

## 3.3 Crisis intercept (the OSA-mandated layer) — **shipped** *(`echoConfig.CRISIS_PATTERNS` + `crisisCheck`)*
- Keyword+light-context lexicon (deliberately broad — a false positive only routes a sister to support, the safe direction to fail), incl. self-harm, suicide, and domestic-abuse signals. On crisis hit, the draft is **NEVER** turned into an echo; the sheet shows **UK resources (Samaritans 116 123 · NHS 111 · Shout 85258 · Mind 0300 123 3393).** Witness Mode reuses the same intercept (route to Panic Mode + resources, never a peer).
- **Legal note (research §4.10):** under the **Online Safety Act 2023**, a FemWell anonymous wall is a UGC service that could host self-harm material — a self-harm content policy + report flow + crisis intercept + an **OSA risk assessment** are **legal requirements, not nice-to-haves** (Ofcom fines up to £18M / 10% of worldwide revenue). The crisis intercept + report→auto-hide already exist; the **written OSA risk assessment + self-harm policy doc** are an open action (§7).

## 3.4 Timing rails — **shipped** *(`echoSafety.js`)*
- **Cooling pause** before an echo goes live (10m base / 30m late-luteal d22+). **Late-night + late-luteal throttle:** a late, late-luteal post is held until next **06:00**, past the vulnerable window. **48h fade.** Visibility is **purely time-derived** (`isLive/isCooling/isExpired`) so no echo appears during its cooling pause and none past fade. These are research-aligned countermeasures to **co-rumination / contagion** (§4.8) — short-form + ephemeral + paced.

## 3.5 Rate limits + moderation — **shipped v1 (client) → Q3 (server/hybrid)**
- **Rate limit:** 5 echoes/day, on-device (`echoAnon`). Master-plan witness/twin limits: 1 witness send/day, 3 receives/day, 1 twin/cycle. **Q3:** server-enforced via the `postEcho` function (anonymous-credential / nullifier pattern — see §4.9 — so limits hold without revealing identity).
- **Moderation:** report→auto-hide at threshold (client, v1). **Q3 hybrid (research §4.8):** AI pre-screen for self-harm/abuse + **human spot-check** as volume grows; auto-response on every distress-flagged post; consider **pre-moderation at launch while volume is low** (Flo's model — nothing un-screened goes live), relaxing to hybrid as it scales (§7 decision). Avoid reactive-only/volunteer-only moderation (Reddit's burnout failure).
- **Fixed-response lexicon, not free text** — the single biggest abuse/contagion reducer; Echo Wall (reactions only) and Witness (4 fixed lines) both obey it. Lock it in.

## 3.6 Sensitivity tiers + SecureStore *(strategic_synthesis §4, Journal spec §2.1)*
- **Tier 1 (public/indexed):** Circles, CommunityPosts (anonymous), AMASessions — no consent, 30-day soft-delete.
- **Tier 2 (server, per-user-encrypted):** Echoes, EchoHolds, TwinPairs/TwinEntries — one-click clear by domain, 7-day grace.
- **Tier 3 (E2E, client-only keys):** **WitnessRequests, WitnessStrikes** (+ Journal locked entries, Sealed Letters) — instant hard-delete, no server copy. **Reuse the one "FemWell SecureStore" primitive** (already built for Sealed Letters in Journal Phase 2's `journalCrypto.js`) for the Witness entry ciphertext.
- **Deletion cascade:** account delete burns sealed letters / echoes / twin entries.

## 3.7 UK data posture (research §4.10 — the anti-Stardust stance)
- **Cycle/community data = special-category data** (UK GDPR / DPA 2018) → needs **explicit, separate consent** (specifying the nature of the data, not bundled into general T&Cs) + an **Appropriate Policy Document** (condition + lawful basis + retention/deletion).
- **Be visibly un-compellable:** no PII in the community; posts not linkable to account identity at rest; **no "voluntary law-enforcement cooperation" language**; no third-party analytics carrying identifiers (Stardust's fatal mistakes); minimise what's held; fade-by-default shrinks the corpus. _"Visible privacy beats invisible privacy"_ (CHI 2024).

---

# §4 — COMPETITIVE READ (cited research pass — Ms Deep Search)

| Platform | EMULATE | AVOID |
|---|---|---|
| **Peanut** | Life-stage self-selection as the primary grouping key; a named safety layer ("Safety Shields"); monetise *expert depth* not community access; an early "you-belong" moment. | Live audio rooms (high-moderation, de-anonymising); identity-linked friend graphs. |
| **Flo Secret Chats** | **Pre-moderation** for a vulnerable cohort (nothing un-screened goes live); random-avatar anonymity + an explicit "don't share PII" rule lexicon; keep community **free**. | Topic-only keying (loses phase belonging — keep phase primary); pre-moderating *everything* doesn't scale → plan a hybrid. |
| **Reddit women's-health subs** | Pseudonymity drives candour (FemWell goes further); AutoMod-style automated keyword/rate gate as the first filter; **crisis-counsellor handoff** (Reddit×Crisis Text Line → FemWell×Samaritans/Shout); megathread-style containment for spikes. | Mod burnout (volunteer/reactive-only); karma/upvote status competition + reassurance-seeking; brigading. FemWell's no-likes design removes the status engine — **keep it.** |
| **Clue (Phase Insights)** | The **"others in your sub-phase" anonymised aggregate** as a zero-moderation belonging signal (ship it — §2.B.3); anonymised-data + research-use consent. | Don't let aggregate stats be the *only* community surface — it's belonging-lite, not support. |
| **Stardust (cautionary)** | Only that phase/astrology framing drives engagement. | EVERYTHING about its data posture: "voluntary law-enforcement cooperation" language; shipping phone numbers/IDs to third-party analytics; marketing "E2E" you don't have (keys on your own servers ≠ E2E). |
| **Maven Clinic** | **Expert-adjacency** — peer support is safest with a visible escalation path to a real professional; surface expert-authored content beside peer content. | An employer-benefit clinical forum isn't a model for moderating *anonymous* self-harm-risk content; expert-backing alone ≠ safe anonymous space. |
| **7 Cups / Wisdo / Koko** | Trained listeners with lived experience + active-listening (→ Witness Mode); shared-experience matching + a **"Helper" role that rewards giving** support (counters reassurance-seeking). | Under-trained/unvetted listeners (7 Cups' weak spot); **NEVER deploy AI support without disclosure + consent** (Koko's GPT-3 scandal — directly relevant given Jess); badge gamification tipping into status-seeking. |

**The contagion constraint (the central safety finding):** peer-reviewed evidence shows **co-rumination** and **excessive reassurance-seeking** predict *worse* mood and **mediate depression/anxiety contagion between peers**; *reading* others' distress online is itself a source of worry and contagion. → The one-line / fade / non-transactional / no-thread design is an **evidence-aligned countermeasure**. Don't let reactions become a reassurance-seeking loop.

**Top design takeaways:** phase-cohort is the right spine · pre-moderate at launch then hybrid · fixed-response lexicons over free text · fade-by-default is a safety feature · reactions aggregate-only (never the reactor) · ship the crisis-intercept (UK/OSA) · ship the "others in your phase" aggregate · rate limits + cooling-off · reward giving not seeking (non-transactional) · be visibly un-compellable on data.

**Red flags that kill these communities:** free-text co-rumination loops · de-anon reaction/metadata leaks · weak/vague law-enforcement posture · reactive-only volunteer moderation · undisclosed AI in support · under-trained peer listeners · paywalling peer support · status/gamification creep · ignoring OSA self-harm duties.

_(Full source URLs in §8. Confidence notes: platform mechanics + OSA/ICO/Mozilla = high; vendor retention stats = directional; the 7 Cups efficacy study is non-randomised — don't overclaim peer-support efficacy.)_

---

# §5 — PHASED ROLLOUT ROADMAP

Mapped onto FemWell's existing Journal/Community phase numbering. Each phase = a reviewable, shippable, live-walked pass (Ms Atelier crafts → Ms Verify gates → STATUS SHIP LOG line per commit).

**Phase 3 = Q2 · Echo Wall tier — BUILT, PATCH-READY (deploy blocked on the `Echo` entity):**
Echo Wall feed (phase-weighted) · Share-as-Echo (composer + entry) · on-device Jess scrub · crisis intercept (UK) · cooling + late-luteal/night throttle · 48h fade · `held`/`me too` reactions · report→auto-hide · still-cooling/pull-it-back · auto-unpost · the `Echo` entity + rails. **NEXT ACTION: Halli creates the `Echo` entity → apply patch → push → deploy → record the new bundle hash.**

**Phase 3.5 · Echo Wall hardening (recommended next):**
Server-side `postEcho` function (true anonymity under a service identity) · scheduled purge function (server-side fade/unpost) · server-enforced rate limits · `EchoFlags` for auditable reports · **OSA risk assessment + self-harm policy doc + explicit separate special-category consent + Appropriate Policy Document** · **"others in your phase" aggregate card** (cheap, high-leverage) · the no-emoji sweep of the legacy Posts feed.

**Phase 4 = Q3 · Witness tier (paired):**
Witness dock + writer toggle + receiver (4 fixed responses) · witness gate (held-3) · 3-strike policy + `WitnessStrikes` · FLAG_SECURE/iOS capture-prevention (native — Capacitor dependency) · pairing engine (phase + life-stage + language, separate VPC, double-hashed tokens) · the witness charter · crisis routing (reuses shipped intercept) · `WitnessRequests` (Tier 3, reuse SecureStore) · **My Echoes tab + Echo Wall Settings** · **Living Wisdom v1** (needs Echo data) · circles formalisation pass.

**Phase 5 = Q4 · Phase Twin tier (deepest):**
Phase Twin match · both-wrote server reveal gate · Jess bridging · 12-day container rules · closing ritual + parting-line exchange · `TwinPairs`/`TwinEntries`/`TwinPrompts` · visibility picker (`same_phase`/`circles`/`all`) wired through.

**Separate track (Halli's call, §7):** Circle of Three (`Circles(private)`/`CircleMembers`/`CircleDigests`) · Partner Sync (`PartnerLinks`/`PartnerShareStates`/`PartnerMessages`) · Care Bridge v2 (`ClinicianLinks`/`ClinicianNotes`/`ClinicianAudit`).

_(Paywall/Plus parked until the sale window — Community peer surfaces are **free** by principle; the research is explicit that paywalling peer support reads as exploiting vulnerability. Monetise expert depth, not the wall.)_

---

# §6 — CRAFT BAR
Echo Wall already ships the Editorial system: real cotton-paper over cream, debossed ink, **Ephesis script / Caveat hand / Cormorant serif / Inter chrome**, gold accent at emotional beats, Lucide glyphs only (`Waves`/`HeartHandshake`/`Users`/`Flag`/`Undo2`/`Clock`/`ShieldAlert`/`Phone`/`Check`), **no emoji**. Every new peer surface inherits it. The **dark plum "trust-ink" gradient** is reserved for fragile surfaces (Witness dock, crisis intercept, consent gates) — never ordinary cards. Witness/Twin entries render in the **reading engine** (the page IS the screen). **Ms Atelier crafts → Ms Verify gates every visual change against the reference/spec before ship.** Pen-depth remains FROZEN (Journal locked decision).

---

# §7 — OPEN DECISIONS FOR HALLI

**A. The master plan's own open questions (peer-relevant):**
1. **Echo phase scope** — exact phase day, ±1-day window, or whole phase for the cohort weighting/copy? (Smaller = more resonance, less density.) _(Shipped: whole-phase soft weighting.)_
2. **Crisis-intercept escalation** — auto-disable peer surfaces for 24h after an intercept fires, or a soft toggle?
3. **Onboarding** — does the user pick a sharing comfort level during onboarding, or earn surfaces as entries accumulate?
4. **"Witness" vs "Hold" naming** — the deep file uses Witness Mode; the gesture is hold. Decide once and sweep.

**B. Community-specific decisions:**
5. **Reaction lexicon reconciliation** — the master plan + legacy Posts use **`same · hold · hear you · saved`** (4); the shipped Echo Wall uses **`held · me too`** (2). Pick one across all peer surfaces and sweep. _(Recommendation: keep the 2-reaction wall for ephemeral echoes; it's cleaner — but align labels.)_
6. **Echo Wall default vs Posts default** — Echo Wall currently defaults on; one-line flip available.
7. **Public hold counts** — the shipped wall shows aggregate counts on every card (to all viewers); reconciliation #2 says "private to writer only." Keep public aggregate counts, or move counts to the "My Echoes" tab only?
8. **Pre-moderation at launch?** — Flo pre-approves every post. Adopt pre-moderation while volume is low (safest, OSA-friendly) and relax to AI-prescreen + human-spot-check hybrid as it scales — or go hybrid from day one?
9. **"Others in your phase" aggregate** — ship the zero-moderation belonging card alongside the wall? (Recommend yes, Phase 3.5.)
10. **Legacy Posts feed fate** — keep the named/anonymous Posts feed long-term, or retire it once Echo Wall + Circles + AMAs cover its job? (And: run the no-emoji sweep on it now regardless.)
11. **Circles formalisation** — invest in a proper phase/program/region/life-stage/condition circle taxonomy with circle-scoped Echo visibility (the reserved `visibility: circles`), or leave circles as the legacy primitive?
12. **Separate track on the roadmap?** — do **Circle of Three / Partner Sync / Care Bridge v2** join the Community roadmap, or stay separate Network/Clinical features?
13. **OSA 2023 compliance owner** — who writes the risk assessment + self-harm content policy + the special-category consent flow + Appropriate Policy Document, and by when? (Legal floor before a public wall scales.)
14. **Server-side anonymity timing** — is the on-device `author_hash` (with `created_by` still at the platform layer) acceptable for the sale demo, or is the `postEcho` service-identity function a pre-deploy must?

---

# §8 — SOURCE MAP

| Area | Source |
|---|---|
| **The peer vision, gradient, 3 concepts (Echo/Witness/Twin), reconciliations, principles, evidence base, risks** | `src/components/JournalPlanDoc.jsx` (the FoundersOS Master Plan, `/Ideas → Journal Plan tab`) — captured in `claude-state/JOURNAL_BUILD_SPEC.md` §1 |
| **The Journal↔Community system, "one entry four lives", kept/new/shifted maps, handoff diagram, the two pages** | `femwell_journal_community_v2.html` |
| **Echo Wall (share modal · wall feed · my echoes · settings), Sealed-Letter threads, Witness Mode (writer toggle · receiver · charter 6 rails · gate held-3 · 3-strike · crisis routing), Phase Twin (match · reveal · opt-in matrix · closing ritual), base44 entities, moderation rails** | `femwell_journal_sharing_deep.html` (+ `femwell_journal_sharing_concepts.html`) |
| **Standalone Community page: circles taxonomy (phase/program/region/life-stage/condition), composer, gentle reactions, AMA, feed tabs** | `femwell_community_demo.html` |
| **LIVE Echo Wall (shipped code, read line by line)** | `src/components/journal/echo/{echoConfig,echoSafety,echoScrub,echoAnon}.js`, `EchoWall.jsx`, `ShareAsEchoSheet.jsx`; `base44/entities/Echo.jsonc`; `claude-state/ECHO_ENTITY_base44_prompt.md`; `claude-state/STATUS.md` (session j) |
| **3-tier sensitivity, SecureStore, anonymity mechanics, no-scoreboard table, Free/Pro tiers, consent-on-surface, reactions lexicon** | `femwell_strategic_synthesis.md` |
| **Circle of Three (private), Partner Sync, Care Bridge v2 — entities + abuse-aware consent** | `femwell_future_features_brainstorm.md`, `femwell_roadmap_brainstorm.md`, `femwell_partner_sync_demo.html`, `femwell_care_bridge_v2_demo.html`, Journal spec §2.1 |
| **Living Wisdom flywheel (WisdomIndex/JessWisdomSurfacings)** | `femwell_living_wisdom_demo.html`, `copy_deck_30_pages.md`, roadmap #10 |
| **Reactions lexicon, Witness dock, GentleReactions, dark-card rule** | `femwell_component_library.html` |
| **Competitive read + safety/moderation/contagion research + UK OSA/GDPR floor** | Ms Deep Search v1 research pass (§4) — Peanut/Flo/Reddit/Clue/Stardust/Maven/7 Cups/Wisdo/Koko + ICO special-category guidance, Mozilla *Privacy Not Included*, Online Safety Act 2023, co-rumination/contagion literature. URLs below. |

**Research source URLs (§4):**
Peanut: en.wikipedia.org/wiki/Peanut_App · techcrunch.com/2021/04/27/social-networking-app-for-women-peanut-adds-live-audio-rooms/ · techcrunch.com/2021/09/07/social-network-peanut-expands-to-include-more-women-with-launch-of-peanut-menopause/ — Flo: flo.health/product-tour/secret-chats · help.flo.health/hc/en-us/articles/360052675971 · flo.health/secret-chats-rules · flo.health/product-tour/anonymous-mode — Reddit: support.reddithelp.com/hc/en-us/articles/15484574206484-Automoderator · mods.reddithelp.com/hc/en-us/articles/360008425592 — Clue: helloclue.com/articles/about-clue/discover-cycle-phase-insights-understand-your-body-feel-empowered · helloclue.com/articles/about-clue/the-journey-of-a-single-data-point — Stardust: techcrunch.com/2022/06/27/stardust-period-tracker-phone-number/ · vice.com/en/article/the-1-period-tracker-on-the-app-store-will-hand-over-data-without-a-warrant/ · privacyinternational.org/long-read/5568/stardust-research-findings · gizmodo.com/stardust-roe-v-wade-encrypted-period-tracking-app-abort-1849113572 — Maven: mavenclinic.com · mavenclinic.com/virtual-clinic · time.com/article/2026/03/10/maven-clinic-digital-womens-health-services/ — Mental-health peer support: en.wikipedia.org/wiki/7_Cups · pmc.ncbi.nlm.nih.gov/articles/PMC5829455/ · wisdo.com · businesswire.com/news/home/20251006563968/en/ · nbcnews.com/tech/internet/chatgpt-ai-experiment-mental-health-tech-app-koko-rcna65110 · popsci.com/technology/koko-ai-chatbot-mental-health/ — Moderation & contagion: link.springer.com/chapter/10.1007/978-3-030-49576-3_7 · sightengine.com/self-harm-mental-health-suicide-moderation-guide · link.springer.com/article/10.1007/s44206-025-00166-x · pmc.ncbi.nlm.nih.gov/articles/PMC10027699/ · ncbi.nlm.nih.gov/pmc/articles/PMC5684514/ · pmc.ncbi.nlm.nih.gov/articles/PMC6195473/ — Anonymity/safety patterns: bugs.telegram.org/c/12862/10 · blog.cloudflare.com/private-rate-limiting/ · medium.com/privacy-scaling-explorations/rate-limiting-nullifier-a-spam-protection-mechanism-for-anonymous-environments-bbe4006a57d — UK regulatory: ico.org.uk special-category-data guidance (rules + conditions) · mozillafoundation.org/en/privacynotincluded/articles/in-post-roe-v-wade-era-mozilla-labels-18-of-25... · en.wikipedia.org/wiki/Online_Safety_Act_2023 · legislation.gov.uk/ukpga/2023/50

---

# APPENDIX A — base44 ENTITIES THAT NEED CREATING (Halli-in-the-UI actions)
base44 does not instantiate entities from `.jsonc` on deploy, and there is no programmatic schema-create API. Every entity below must be created once via **Data tab → Create entity** (preferred, no AI build points) or a single authorized chat-builder prompt.

| Entity | Tier | For | Phase | Status |
|---|---|---|---|---|
| **`Echo`** | 2 | Echo Wall (body, author_hash, phase, life_stage, cycle_day, source_entry_hash, live_at, expires_at, held_count, metoo_count, report_count, hidden, visibility) | 3 | **PENDING — blocks the Phase 3 deploy. Prompt ready: `claude-state/ECHO_ENTITY_base44_prompt.md`.** |
| `EchoFlags` | 2 | auditable server-side reports (replaces client-only dedup) | 3.5 | not created |
| `EchoPrefs` (or `UserPreferences` fields) | 2 | Echo Wall Settings (audience/guardrails/fade) | 3.5/Q3 | not created |
| `WitnessRequests` | 3 (E2E) | Witness Mode (writer_hash, entry_ciphertext, match_criteria, matched_at, read_at, response_code) | 4/Q3 | not created |
| `WitnessStrikes` | 3 | 3-strike receiver policy | 4/Q3 | not created |
| `TwinPairs` | 2 | Phase Twin (cycle_start/end, partner_a/b_hash, shared_tags[], closed_at) | 5/Q4 | not created |
| `TwinEntries` | 2 | Phase Twin daily entries (delete day 13) | 5/Q4 | not created |
| `TwinPrompts` | 1 | ~40 prompts/phase, no repeat within 3 cycles | 5/Q4 | not created |
| `WisdomIndex` | 2 | Living Wisdom eligible echoes (phase-keyed) | Q3 | not created |
| `JessWisdomSurfacings` | 2 | Living Wisdom audit + never-repeat + matched_on | Q3 | not created |
| `Circles(private)` / `CircleMembers` / `CircleDigests` | 2 | Circle of Three (private named circle) | separate | not created |
| `PartnerLinks` / `PartnerShareStates` / `PartnerMessages` | 2/3 | Partner Sync | separate | not created |
| `ClinicianLinks` / `ClinicianNotes` / `ClinicianAudit` | 2/3 | Care Bridge v2 | separate | not created |

**Server-side functions to add (Q3+, not entities):** `postEcho` (write echoes under a service identity = true anonymity + server-enforced rate limits) · a scheduled **purge** function (server-side fade/auto-unpost) · the Phase-Twin **reveal gate** (returns both entries only after both `written_at`).

_End of v1. This doc is the Community twin of `JOURNAL_BUILD_SPEC.md` v3. The master plan (JournalPlanDoc) wins any conflict; where this doc adds research or production detail the master plan doesn't spell out, it is marked. Update on every shipped pass + every decision resolved in §7._

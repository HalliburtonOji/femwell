# FemWell Journal — BUILD SPEC (production, Editorial direction) — v2

_Owner: Mr Lead Manager. Craft: Ms Atelier. Research: Ms Deep Search. Verification gate: Ms Verify._
_v1 created 2026-06-03. **v2 2026-06-03 — exhaustive archaeology pass** (Ms Deep Search swept every journal source in the space: 3 sharing HTML demos, community_v2, journal_demo, strategic synthesis, sealed-letters MP, e-reader research, future-features brainstorm, horoscope/rituals/today/story crossovers, STATUS ship log + JournalPlanDoc reconciliations, memory). v2 recovers the **private/public visibility model** Halli flagged as missing, plus ~25 features/nuances thin-or-absent in v1._
_Pairs with `journal_editorial/JOURNAL_GRAND_PLAN.md` + `journal_editorial/JOURNAL_BRIEF_everything_we_know.md`._

> **DECISION (Halli, 2026-06-03):** Build the Journal **for real on production `Journal.jsx` (Target B)**, not the `/Ideas` demo. The Editorial treatment proven in `JournalDemo1.jsx` is the basis. Many revision cycles expected.
>
> **Live baseline this spec is written against:** `origin/main 91b3bd5`. Editorial demo at `/Ideas → Journal Demos → Demo 1` (route `/JournalDemo1`); production `Journal.jsx` is still the pre-existing utilitarian page.
>
> **Hard brand rules (every line of this build):** UK market (NHS, GMC/NMC/HCPC, £, UK GDPR) · **no emoji anywhere** (Lucide + custom SVG only) · Fraunces + Inter base type with the journal's voice faces layered in (§5) · **one unified bottom nav** at all viewports · cycle-count rhythm never streak shame · evidence-informed never a clinical promise.
>
> **How to read v2:** §1 principles · **§2 the private/public model (the big v1 gap)** · §3 exhaustive feature inventory · §4 migration · §5 craft + reading engine · §6 roadmap · §7 open decisions · **§8 sourced conflicts to resolve** · **§9 source map** · **§10 needs-Halli-to-expand** · **§11 mentioned-but-not-found (honest gaps)**.

---

## 1. VISION & PRINCIPLES

### 1.1 Thesis
A **phase-aware, private-by-default writing space** whose moat is cycle data: _"Only a cycle-aware app can write you letters across phases and mirror your own history back to you. Period-tracker diaries cannot."_ The Journal is the heart of FemWell's move from cycle app → women's app. **Solo first**; social surfaces are earned, anonymous, thin. The feeling: a **private letterpress notebook** that **remembers you**.

### 1.2 The eight locked principles
1. **Locked to you. Always.** Encrypted on-device; Jess reads an entry only when handed it.
2. **Solo before social.** Cycle Mirror + Sealed Letters earn the trust Echo Wall / Witness / Phase Twin spend.
3. **Anonymity is the default** for any peer surface; Jess scrubs names, places, dates, substances before anything leaves the device.
4. **Reactions are emotional, not transactional** — lexicon _same · hold · hear you · saved_. No like, no follow, no emoji pile-on. Counts are never a score; feed order is phase + recency, never engagement.
5. **Phase-aware copy across the board** (luteal/follicular/ovulatory/menstrual voices). Serif italic for the human; Inter for chrome.
6. **Evidence-informed, never a clinical promise** — Pennebaker (expressive writing, d≈0.16 meta), Neff (self-compassion + common humanity), Narrative Exposure Therapy (18 RCTs) as a bibliography, not a marketing line.
7. **No emoji anywhere** — Lucide + custom SVG only.
8. **Cycle-count rhythm, never streak shame.**

### 1.3 The solitude → witness gradient (the safety spine + the retention engine)
One-directional, shipped safest-first. _"These five aren't competing features. They're a gradient of solitude → witness the user walks along as trust builds … Nobody is forced to Phase Twin."_ (sharing_concepts). _"The gradient itself is a retention engine — there's always a next step."_

```
 SOLITUDE ───────────────────────────────────────────────────────────────── WITNESS
 private entry ─ Cycle Mirror ─ Sealed Letters ─┃─ Share-as-Echo → Echo Wall ─ Witness ─ Phase Twin
   (you alone)   (you + past-you)  (you + future-you) ┃  (one scrubbed line, anon)  (1:1 anon)  (12-day pair)
                                                      ┃
                       everything LEFT of the line ships first and stands alone (Journal page).
                       everything RIGHT lives on the Community page; one entry can flow through both.
```

### 1.4 Why this is a moat
_"Nobody runs a phase-cohort, hold-only, mirror-your-own-history journal"_ with cross-phase sealed letters. Stardust mirrors nothing back; Clue/Flo publish stats not belonging; Day One is encrypted-then-revealed but not phase-anchored; Moody Month has phase voice but no real journal. Defensible because it needs the cycle engine FemWell already has. Jess follows the **"mirror-not-companion"** pattern (Mindsera precedent); the explicit anti-pattern is the 2025 "Vulnerability-Amplifying Interaction Loop" / sycophancy trap.

---

## 2. THE PRIVATE vs PUBLIC / VISIBILITY MODEL  *(the major v1 gap — recovered in full)*

This is the part Halli flagged. Reconstructed from `femwell_journal_sharing_deep.html` (master), `_concepts.html`, `femwell_journal_community_v2.html`, `femwell_strategic_synthesis.md`, `femwell_future_features_brainstorm.md`. The journal is **not** a binary private/public switch — it is a **gradient the user positions each entry on, at the entry level, never by default.**

### 2.1 "One entry, four lives" — the per-entry destiny model  *(community_v2)*
> _"The same 4-sentence reflection can **stay locked, become an echo, be sealed for later, or be handed to one witness**. The user decides at the entry level — never by default."_

| Destiny | What it is | Where it surfaces | Visibility |
|---|---|---|---|
| **Locked (default)** | Private by default; stays under your lock. | Journal. Feeds Cycle Mirror + pattern detection. | Only you, forever. |
| **Sealed** | A letter to a future phase / future-you / anniversary. Client-side encrypted. | Returns to **you** in Journal (next follicular, anniversary, on-request) — **never Community**. | Only you, later. |
| **Echo** | One scrubbed line shared anonymously. | **Community · Echo Wall.** | Anonymous; same-phase / circles / all (see 2.2). |
| **Witness hand-off** | The whole entry handed to one matched sister, once. | **Community · Witness dock.** | One anonymous reader, one read, then re-sealed. |

Echo + Witness appear as **opt-in slots on individual entries — never defaults.** Most entries simply stay locked.

### 2.2 The visibility spectrum — exact values  *(sharing_deep, Echo Wall settings "Who can see my echoes")*
An entity field **`visibility (same_phase | circles | all)`**:
- **Same-phase sisters only** — _"Women whose cycle is in the same phase as yours when you post."_ **Default.**
- **My circles** — _"Sisters in the circles you belong to (e.g. Peri Watch, Luteal Softness)."_
- **All sisters** — _"The whole wall. Widest reach, **least context**."_ (Discouraged, never default.)

There is **no "world / public-outside-the-app" level.** The widest any single piece travels is **one scrubbed line** to the in-app wall. The journal itself never becomes a public object. _"No public profile — Community is anonymous-first."_ (strategic_synthesis).

### 2.3 Circles  *(community_v2, sharing_deep)*
Pre-existing Community primitive the sharing model plugs into (entity marked "existing · as-is"). Four kinds, with real examples from the demo:
- **Phase** — "Luteal Softness · 1.4k · 23 today"
- **Program** — "Sleep Reset cohort · 84 · starts tonight"
- **Region** — "UK Women Wellness · 2.1k · 41 today"
- **Life stage** — "Perimenopause Watch · 890 · 12 today"

Echoes can be scoped to circle audiences (Echo Wall feed has a "Your circles" tab alongside Same-phase / All phases / Held-by-you).

### 2.4 Circle of Three — the PRIVATE named circle  *(future_features_brainstorm §2.2 — NOT in v1, distinct from public Circles)*
> _"Some users want 2-3 chosen people (mother, sister, best friend) to have a narrow view. **Not public community — private circle.** Each member gets a narrow read of: current phase label + last week's felt-sense summary. No logs, no Jess notes."_
- Entities: **Circles (new, private — distinct from public Circles on Community), CircleMembers, CircleDigests.**
- Risk + rail: _"someone adds their mother, then regrets it. Build in **quarterly re-consent prompt.**"_
- **Adjacent: Partner Sync** — narrow read-only share of phase + mood + what-helps, never raw symptoms; "no public profile, no chat bloat"; gentle voice notes.
- **Decision owed (§7):** do Circle of Three + Partner Sync belong on the Journal's privacy roadmap, or stay Network/Community features? They materially change "who can see what."

### 2.5 Journal page vs Community page — the two-home architecture  *(community_v2)*
> _"**Journal owns the writer** (cycle mirror, sealed letters, share-as-echo slot) — anything you make for yourself or future-you. **Community owns the peer shapes** (echo wall, witness mode, phase twin) — anything that involves another person, even anonymously. One entry can flow through both."_ LD call: **"Journal gets the depth. Community earns the proximity."**

- **Journal page (solo writer, "for you and future-you"):** kept — Jess prompt, Tonight's prompts, Threads, Pattern card, Privacy footer; new — **Cycle Mirror, Sealed Letters rail, Anniversary surfacing, Share-as-Echo slot.** "Sealed Letters and Cycle Mirror are first-class here because they have no other audience."
- **Community page (peer shapes, "for sisters, near and anonymous"):** kept — Composer, Circles carousel, Gentle reactions, AMA card, Quiet mode; new — **Echo Wall feed, Witness dock, Phase Twin card, composer echo/witness tools**; shifted — **"Jess pick" → Echo Wall** (Echo Wall replaces "Jess pick" as the primary peer surface). "Witness Mode is a dock, not a page."

> **Scoping note for THIS build:** v2's production target is the **Journal page**. The Community-side surfaces (Echo Wall feed, Witness dock, Phase Twin card) are later phases and may live on a Community route; what the Journal page owns now is the **solo writer + the opt-in share slots that hand an entry off** to those surfaces.

### 2.6 Anonymity mechanics  *(sharing_deep "under the hood" + appendix B)*
- Echoes: _"No user_id on echo · UUID only · **hashed author token lets writer retract without deanonymising**."_ Author can retract via a **one-way hash the server can invalidate but not reverse.**
- Holds: _"holder_hash is **daily-rotated, unlinkable to user**."_
- Witness: _"no user_id pairing surface · **double-hashed anon tokens** · rotated per-cycle · never joined to Users in any exposed query path · **matching service runs in a separate VPC.**"_
- Twin: _"**pair_id never joined to user_id at query time**."_

### 2.7 Three-tier sensitivity model + SecureStore  *(strategic_synthesis §4.1)*
- **Tier 1 — Public / platform-indexed:** ExploreItems, CommunityPosts (anonymous), Circles.
- **Tier 2 — Private user data (server-stored, per-user-encrypted at rest):** CyclePatterns, TwinPairs, TwinEntries, EchoHolds, Echoes.
- **Tier 3 — End-to-end encrypted (client-only keys):** **SealedLetters, Journal locked entries, WitnessRequests, WitnessStrikes.**
- **Rule:** one E2E crypto primitive **"FemWell SecureStore"** shared across all Tier-3 entities. _"Build this once (**Sealed Letters first**), then everything else reuses it. If the crypto is wrong, we can't ship any E2E feature."_
- **Per-tier deletion:** Tier 1 = 30-day soft-delete; **Tier 3 = instant hard-delete, no server copy exists; Jess can never read encrypted content, only metadata the user opts to share.**

### 2.8 Consent-on-surface (visibility made visible)  *(strategic_synthesis §2.2-2.4)*
- _"Every sensitive feature shows its privacy state **inline, not in a settings screen.** 'Let Jess…' not 'Enable…'."_ Journal locked entries show a **padlock chip** on the entry card; Witness dock shows a **strike-count chip** ("3-strike policy · you have 3 left").
- **Dark plum→night gradient** is reserved for fragile/private surfaces: consent gates, Panic Mode, **Sealed Letters, Witness dock**, Jess tool-consent, data-delete. It signals "this is fragile, we're being careful." (Ms Atelier: the dark "trust ink" card.)
- Post-Roe framing: **"visible privacy beats invisible privacy."** The Journal footer "Locked to you. Always." + lock glyph is the public one-line promise.

---

## 3. FULL FEATURE INVENTORY (exhaustive)

Per feature: purpose · IA · components · states · data wiring · interactions · edges · phase · **source**. "Demo-now" = proven in `JournalDemo1.jsx`.

### 3.1 Entries — create / read / edit / delete
Atomic object: a private, phase-stamped piece of writing. Ledger lists them; Reader opens them; Composer creates/edits. States: empty (editorial invitation, never a blank box) · loading (paper renders first, hairline skeletons, **no spinner**) · partial · populated · error (guard all list parses — production had a `tags.split` crash, fixed `cda3e96`). Data: `JournalEntries` — `body, type/entry_type, mood, phase, cycle_day, mode, thread, created_at, is_burn/burn_at, affirmation, lock`. **`created_at` was null on historical rows** (pipeline bug) — sort defensively + backfill. Metadata chips per entry: **phase · mood · mode · thread · lock**; moods enum **soft / bright / heavy / steady**. **Phase 1.** _Source: BRIEF §3, journal_demo._

### 3.2 Compose modes — Write · Voice · One-line · Guided
Meet the writer where her energy is. Composer mode switch. Write = free serif (Phase 1, demo-now). Guided = multi-prompt scaffold ("6 prompts", e.g. new-cycle intentions; Phase 1b). One-line = single big field (also a "one-line luteal journal" ritual; Phase 2). Voice = record → **auto-transcribed** transcript; on-device only, do not upload raw audio without explicit consent (Phase 2, "coming" until then; benchmarked vs Moody Month/Memoir voice journals). Switching Write↔Guided↔One-line preserves the text buffer; Voice is additive. **Source: BRIEF §3, journal_demo, GRAND_PLAN §B6.**

### 3.3 Entry types (12) + type-aware prompts
Free write · Reflection · Gratitude · Mood · Work · Relationships · Money · Creative · Grief · Joy · Identity · **Affirmation**. (Burn is a _mode_, not a 13th type.) Type picker drives `TYPE_PROMPTS`; `TYPE_COLOUR` stripes the Ledger. **Owed fix: production filter pills are missing `Affirmation`.** **Phase 1.** _Source: JournalDemo1, BRIEF §3._

### 3.4 Prompts — daily prompt + carousel + Jess's note
The day's invitation in Jess's voice — _"Not a form field — a voice."_ "Jess's note" block + 3–5 prompt carousel; each prompt's "Write to this" opens the Composer seeded with it. Reuse/extend the production `JessJournalPrompt` wing (Feature 4, shipped `2359640`). Phase-tuned; lightly personalised by Jess (LLM, cost-bounded, cached 24h, deterministic fallback bank — the Planner `RitualReframeShimmer` pattern). **Phase 1 (demo-now).** _Source: GRAND_PLAN §A, journal_demo, BRIEF §7._

### 3.5 The Ledger
Recent writing as a literary table-of-contents (hanging dates, type stripe, drop-initial on the latest only) — **replaces production's `JotterCard` sticky-note grid.** Sort `created_at` desc with null-safe fallback. Burn rows show a countdown. Tap → Reader; filter pills (type/phase/thread) scope it. **Phase 1 (demo-now visual; wire to real data).** _Source: GRAND_PLAN §C, BRIEF §7._

### 3.6 Cycle Mirror — "On This Day" (the marquee solo feature, the moat)
Your own words from the **same cycle day last cycle**, so you feel your body's consistency. _"You've been here before. Your body is consistent. You're not imagining it."_
- **Up to 5 past-self entries** from the same cycle day, newest→oldest; each tap reopens the full entry ("past-self becomes a clickable archive").
- **Five secondary lenses** (one-tap switch): **same cycle day · same phase · same thread · one year ago today · same mood.** *(v1 named the feature but not the lens set.)*
- **Jess gloss / pattern overlay:** _"Pattern found — you wrote about sleep disruption on 4 of 5 luteal day 19s."_
- **Pattern catalogue** ("7 patterns found"): recurring themes across ≥2 cycles, each with cycles-observed + strength + Jess insight + a **28-day heatmap**. Qualifies at ≥3 mentions across ≥2 cycles; "strong" at ≥4 cycles.
- **First-cycle empty state:** _"Cycle Mirror needs at least 2 full cycles … If you've journaled elsewhere, I can **scaffold a mirror from photos of past entries**."_ + a 3-minute check-in catch-up.
- **Anniversary view** auto-activates on hard dates (loss, diagnosis) if tagged: "Same date. Different you." + "Write a letter to 2025-you?" (feeds Sealed Letters).
- **Data:** `JournalEntries` + new **`EntryTags`** (`id, entry_id, phase, cycle_day, mood, thread, body_signal[]`) + derived **`CyclePatterns`** view (`user_id, pattern_name, cycles_observed, strength, insight_text`, Jess-authored, refreshed weekly). **100% on-device computation; no server-side pattern extraction; nothing leaves the journal.** Irregular cycles → ±1-day match window.
- **Phase 1** (the marquee wiring). **⚠ Tier conflict:** strategic_synthesis Free-vs-Pro gates Cycle Mirror behind **Pro**; this spec treats it as the free Phase-1 marquee — see §8. _Source: sharing_deep/concepts, BRIEF §3._

### 3.7 Tonight's Reflection (dusk close-out ritual)
~90-second phase-aware evening reflection; bookends the day. Time-aware "close the day" card (dark `PRESS_DARK` stock). Writes a normal reflection-type `JournalEntries` row. **⚠ Coordinate with Planner's existing `TonightCard`** — avoid two competing "tonight" surfaces (§7/§8). **Phase 1 (demo-now).** _Source: GRAND_PLAN §A, journal_demo, PLANNER_MASTER_PLAN._

### 3.8 Insights (pattern engine — production's strongest existing surface)
Mood × cycle chart, 7-day / 28-day rhythm, top tags, weekly Jess reflection. **A kept tab** (`Journal | Insights`) plus a one-line teaser ("A line from the week") on the page that opens it. Guard the historical `tags.split` crash. Empty state "Patterns appear after a few entries." **Tab exists today (keep); teaser = Phase 1; chart→filtered-Ledger linking = Phase 2.** _Source: BRIEF §3/§7, JournalDemo1 Insights modal._

### 3.9 Sealed Letters (encrypted letters to future-you)  *(deep recovery — two source generations)*
Write a letter even Jess can't read until a trigger. Cross-phase letters are a cycle-app-only superpower.
- **Trigger model — conceptual (richer, the long-term target):** 4 types — **future-me (date) · cross-phase (phase switch) · anniversary (365d) · custom.** Cross-phase: "Luteal-you → follicular-you, unlocks on next phase switch." _"Sealed on save — you cannot open early. Friction is a feature."_
- **Trigger model — production v1 (MP-Eng-2, narrowed):** **date-only** via `seal_date`; quick chips "In 1 month / In 6 months / In 1 year" + custom date. Deferred from v1: phase/anniversary triggers, AI-suggested dates.
- **Library/vault tabs — conceptual:** sealed · opened · **drafts** · **threads**. **Production v1:** two sections only — "Ready to read" / "Still held"; no drafts, no threads.
- **Letter threading (conceptual; deferred "v1 single-shot"):** a reply chains a correspondence — _"A thread is forming. Four phases, four letters. This is you becoming a witness to yourself."_ Self-referential via `replied_letter_id`.
- **Break-seal ritual:** slow tap / long-press, **haptic thump, wax-crack animation**; "skip today → stays sealed, asks tomorrow; no nags after 3 attempts." 30-day grace on late unlock, then stored indefinitely until opened.
- **Encryption — ⚠ conflict (§8):** conceptual = **client-side encrypted ciphertext, "not even Jess can peek," ghost-seals (account delete burns letters)**; production v1 MP stores `body` as **plaintext** with a client-side `unsealed_at`/`seal_date` gate only ("self-tamper harms only the author"). If marketing says "encrypted on-device," v1 must actually encrypt.
- **Entity (production MP-Eng-2, authoritative build schema):** new **`SealedLetters`** entity (NOT extending JournalEntries — avoids `sealed_until: null` filters across ~9 query sites + leak risk into DoctorExport). Fields: `body` (text, req), `seal_date` (ISO date, req, > today), `unsealed_at` (datetime, null), `unseal_seen_at` (datetime, null), `title` (string, captured but **not rendered in v1**). Indexes `user_id`, `seal_date`. Mechanic = **Option A** client-side check on every mount (not a scheduled function). Today surfaces an **`UnsealedLetterCard`** (225° gradient; distinct from Daily Chapter 135° / Friend-6-Months 315°); `unseal_seen_at` set after a 500ms delay.
- **⚠ Home conflict (§8):** the MP spec places Sealed Letters **OUTSIDE Journal**, as a stand-alone Lifestyle surface — _"Journal is daily and routine; letters are slow and ceremonial."_ This Journal spec folds a locked card → vault into the Journal page. Resolve with Halli.
- **Excluded from DoctorExport** ("DoctorExport queries JournalEntries only"), burns, and Cycle-Mirror matches. Full locked copy exists (compose "A letter to a future you" / placeholder "Dear future me…" / "Seal it" / vault "Letters to yourself / Held in private until the date you picked").
- **Phase:** locked teaser demo-now; **Sealed Letters v1 = Phase 2** (built on SecureStore). _Source: lifestyle_sealed_letters_spec + 2 base44 prompts, sharing_deep/concepts, BRIEF §3._

### 3.10 Burn Mode  *(thinnest core feature — see §10)*
Write something that auto-deletes; a pressure-release. A **quiet option inside the Composer** (not top-level — it can read dark), with a `Moon` glyph. Burn rows show a countdown; excluded from Insights, exports, Doctor handoff, Cycle Mirror. `is_burn`/`burn_at`; server-side cleanup must fire even if the app is closed. **⚠ No demo, copy, or entity spec exists anywhere — needs design (§10).** Composer affordance demo-now; full lifecycle = Phase 2. _Source: BRIEF §3, GRAND_PLAN §B5._

### 3.11 Share-as-Echo slot (the composer bridge solo→social)  *(distinct surface, under-represented in v1)*
After/within an entry, **Jess offers one line worth sharing**, scrubs PII/substances, and **rewrites it to a single sentence in the writer's voice**: _"There's one line in here that might help someone tonight. Share it — anonymously?"_ Buttons: **Share this line / Edit first / Keep private.** This is the hand-off that turns a private entry into an anonymous Echo — it lives in the Composer/entry card, the Echo Wall feed lives on Community. **Phase 3 (with Echo Wall); the slot UI can stub earlier.** _Source: community_v2, sharing_concepts/deep._

### 3.12 Living Wisdom — Echo Wall × Jess flywheel (wisdom surfaced INTO the journal)  *(entirely new vs v1)*
The inverse of sharing: collective wisdom surfaced **into your writing flow as company, not advice.**
- _"Every Echo on Community is an atomic piece of collective wisdom. Jess surfaces one at the contextually right moment."_ Surfaces: **journal / today / panic_afterglow / jess_drawer.**
- **Journal trigger:** 60s of sustained writing + phase/topic match ≥ threshold → **one faded wisdom card inline. Max 1 per writing session.** Framed "someone 19 days in wrote this."
- **Ranking** = phase-match × topic-match × recency × holds. **90-day repeat lock** (won't re-show an Echo for 90 days). Topic signals derived from **your own words, never shared back.**
- **Must NOT appear:** push notifications, Community main feed, Partner Sync, onboarding (first 14 days).
- **Entities:** **`WisdomIndex`** (`phase_day, hold_count_snapshot, eligible = flag_state=clean AND hold_count ≥ 5 AND age_days ≤ 180`), **`JessWisdomSurfacings`** (log + `matched_on` for a transparency panel).
- **You cannot screenshot/export a surfaced Echo** (respect for the writer).
- **Phase:** depends on Echo Wall existing → **Phase 3+.** _Source: femwell_living_wisdom_demo, copy_deck._

### 3.13 Echo Wall (Community, Q2/Q3 — first social step)
Anonymous one-liners scoped by phase; **hold-only** (no like/comment/reply/DM); writer sees hold count **privately, never who held.** Phase chip is the only identifier and is **frozen at post time, not live.** Feed filters: Same phase / All phases / per-phase / **Your circles** / Held-by-you. **Fade:** demos say **7-day** (max 14); JournalPlanDoc reconciliation says **48h ships first** (§8). Caps: **≤5 echo posts/day.** Cold start: first 7 days seeded with Jess-curated prompts + past opt-in entries. Crisis keywords never enter the queue → Panic Mode. **Entities:** `Echoes` (`id, author_hash, phase, life_stage, line, source_entry_hash, fades_at, visibility(same_phase/circles/all), edited_at`), `EchoHolds` (`holder_hash daily-rotated`), `EchoFlags`. Settings: audience, Jess-scrub toggle, 10-min cooling pause, late-luteal block, fade window, holds-private, auto-unpost-after-48h-absence. **Phase 3.** _Source: sharing_deep appendix B, community_v2._

### 3.14 Witness Mode (Community, Q3)  *(pay-it-forward gate + charter were missing in v1)*
One entry → one matched sister; she replies with **one of 4 fixed Fraunces-italic lines or passes silently** (writer never knows she read it). The 4 lines: **"I'm holding this with you. / Me too. / You're not alone in this. / I hear you."** No DM, no thread, no follow-up — _"the thread closes on send."_ Match by phase (default) + life-stage + optional region/tag, 2–4h batch; **writer cancels before read.** Toggle **per-entry, not per-account.**
- **Pay-it-forward gate (NEW):** _"To witness, first be witnessed."_ Must have been witnessed **≥3×** before acting as a witness. *(community_v2 variant: "received 2 + charter" — §8.)*
- **Witness Charter** shown once (re-readable from Settings): read once with care / 4 lines or pass / **never screenshot** / never discuss / opt out anytime.
- **Safety:** **FLAG_SECURE** screenshot block; **3 strikes** (screenshot, out-of-bounds reply, false crisis flag) → removed (90-day per one source); crisis interception routes to Panic Mode + UK resources before send.
- **Entities:** `WitnessRequests` (`writer_hash, entry_ciphertext, match_criteria, matched_at, read_at, response_code(1–4|null)`), `WitnessStrikes`. Rate: **1 send/day, 3 receives/day**, no late-luteal d24–28 sends unless override.
- **⚠ Reply-window conflict (§8):** sharing_deep = 2–4h match + immediate response; component_library says "**three days to reply**."
- **Phase 4** ("ship only after Echo Wall moderation runbook is real"). _Source: sharing_deep, component_library._

### 3.15 Phase Twin (Community, Q4)
12-day container, **same phase + life stage**, one partner, ends with the cycle, **no re-entry until next cycle, max 1 active.** One Jess-authored phase-tuned shared prompt/day; **you see hers only after you've written yours** ("blurred until you write"); Jess posts **one bridging note/day** tying the two entries without forcing a takeaway. Re-match if twin goes quiet 4+ days (no blame). Closing ritual: stats + each picks one line from the other to carry forward (48h parting-line window), then pair archived read-only. **Entities:** `TwinPairs` (`cycle_start, cycle_end, partner_a_hash, partner_b_hash, shared_tags[], closed_at`), `TwinEntries` (deletes day 13), `TwinPrompts` (~40 prompts/phase, no repeat within 3 cycles). Reveal = server-side gate (returns both only after both `written_at` set). Shared/not-shared matrix: she sees phase+day, life stage, shared tag, today's entry; never name/handle, other entries, region/photo, past cycles. **Phase 5.** _Source: sharing_deep/concepts._

### 3.16 Threads, tags, search & filter
**Threads** — follow one life-strand (6 ongoing: Body listening, Work & me, Mum stuff, Sleep notes, Hard days, Money thoughts). `JournalEntries.thread`; a filter and a Cycle-Mirror lens. **Phase 1b.** **Tags** — drive Insights "top tags"; null/format-safe parsing. **Phase 1.** **Filter pills** (type/phase/thread) on the Ledger — **add `Affirmation`.** **Phase 1.** **Full-text search** across bodies, on-device — **Phase 2.** _Source: journal_demo, BRIEF._

### 3.17 Privacy, on-device & safety rails (cross-cutting, non-negotiable)  *(specific mechanics recovered)*
On-device / E2E (SecureStore, §2.7); Sealed Letters keyed time+phase. Jess reads only handed entries. Per-share machinery, recovered in full from `sharing_deep` Appendix A:
- **Jess scrub** — regex + on-device LLM strips names, locations, dates, substances before anything leaves the device.
- **Cooling pause** — **10-min hold** before any outgoing share, cancellable; off-by-default in follicular, **on-by-default in late luteal (d24–28)**.
- **Night/late-luteal throttle** — "**30-min hold-to-share delay between 10pm and 6am on cycle days 22+**."
- **Crisis intercept** — on-device keyword+context model → Panic Mode + UK resources (**Samaritans 116 123, Shout 85258, NHS**); _"Not for crisis."_ "Writer can still send to Witness after opening ≥1 resource card — Jess checks."
- **Screenshot block** — FLAG_SECURE (Android) / iOS capture-prevention on Witness receiver + Twin reveal.
- **Strikes** — 3 = removed (screenshot / out-of-bounds reply / false crisis flag).
- **Rate limits** — 1 Witness send/day · 3 receives/day · 1 Twin pairing/cycle · 5 Echo posts/day.
- **Retract / unpost** — by one-way hash the server can invalidate but not reverse; auto-unpost after 48h app absence.
- **Fade by default**; **deletion cascade** — account delete **burns** sealed letters, echoes, twin entries; others' pair history kept as counts only. _"No trace."_
- **6-rail first-time consent** gate per peer feature.
- **Consent-on-surface** (§2.8): padlock chip on entries, strike-count chip on Witness, "Let Jess…" not "Enable…", dark trust-ink gradient.
The privacy **footer + contract** ("Locked to you. Always.") ships **Phase 1**; the scrub/intercept/strike machinery lands with the social phases. _Source: BRIEF §5, sharing_deep Appendix A, strategic_synthesis §2._

### 3.18 Reactions lexicon (the only "social" verbs)
**same** (same phase/feeling) · **hold** (holding space, not fixing) · **hear you** (acknowledged) · **saved**. Counts **never ranked**; feed order phase + recency, **never engagement.** Echo Wall uses **"hold" as the only response.** Component: `GentleReactions`. _Source: component_library, community_v2, BRIEF §2._

### 3.19 Export & Doctor handoff ties
Journal mood/phase patterns (**excluding burns + sealed letters**) can feed the existing Doctor-Ready Diary (`generateDoctorReadyDiary`, NICE NG23-aligned, jsPDF A4). Related Today-page tracking (DRSP/PMDD daily severity, rage/mood granularity) also exports a GP PDF. Decide what journal content is eligible (likely mood/symptom-tagged reflections, never raw prose without explicit opt-in). **Cross-link = Phase 2; deeper synthesis = Phase 3.** _Source: BRIEF, sealed_letters_spec §9, research_first_feed, today_pillars._

### 3.20 Crossovers (recovered — keep the journal aware of the rest of the app)
- **Rituals ↔ Journal:** auto-infer "tend" events from entries ("had ginger tea" inferred) **only with explicit opt-in**; a "journal" ritual category; "one-line luteal journal" is itself a ritual; Jess's **season reflection** is "drafted from your Pulse + Journal · editable · **never shared**." The garden is private — "no share-your-garden feature, ever."
- **Horoscope ↔ Journal:** **Sky Diary** (cycle×sky 12-cycle timeline, three-axis cycle+moon+chronotype overlay); **Sky-aware Smart Save on Journal** (deferred — depends on Lifestyle pipeline); **Void-of-Course Moon "VoC" pip** inside journal save actions ("the moon is void-of-course; finish old things, don't start new"); **Quiet Mode** shadow-language suppression (a tone control for journal-prompt voice); **Saturn Return Letter** (age 27–30 unlock — a sealed-letter-adjacent idea); **Moon Phase Diary** (lunar+cycle journal prompts — currently slotted to Lifestyle).
- **Today ↔ Journal:** reflective stack **OnThisDay → Friend-6-Months → UnsealedLetter (past + future)**; affirmation story bubble; Mind pillar (gratitude/mood correlation + journaling-prompt suggestion).
- **Daily Story ↔ Journal:** no feature crossover — but **shares the reading/craft engine** (§5.2) with the entry Reader and the Sealed-Letters reader.
_Source: rituals/living_wisdom/today_pillars demos, horoscope_v2 specs, research_first_feed, daily_story_arc._

### 3.21 Notifications, streaks & rhythm
Gentle return nudges (morning prompt, dusk reflection, "a letter is ready") — **never streak shame.** Rhythm shows as **cycle-count dots**, not a fire streak (28-day dot-grid in Insights, demo-now). Respect Planner Quiet Mode / quiet hours. Notification scheduling = Phase 2+. **Owed copy fix:** reframe production "X-day streak" → "X entries this cycle — you're building a pattern." _Source: BRIEF §2 principle 8, STATUS item 0._

### 3.22 Jess integration (observer, never companion)
Jess curates the daily prompt, writes the Cycle Mirror gloss, generates the weekly insight, runs the on-device scrub + crisis intercept before any share, surfaces Living Wisdom, and offers **"unpack with Jess" only on invitation** — _"still locked, still yours."_ **Jess never reads an entry unless handed it.** All Jess LLM touches cost-bounded + cached + deterministic fallback. Prompt + gloss + weekly insight = **Phase 1**; scrub/intercept = with social phases. _Source: BRIEF §4, journal_demo._

---

## 4. PRODUCTION MIGRATION PLAN (Editorial demo → real `Journal.jsx`)

### 4.1 Production today
Utilitarian header · tabs `Journal | Insights` (`JournalInsightsTab` is the strong surface) · `JessJournalPrompt` wing · `JotterCard` sticky notes (historically emoji) · filter pills (no Affirmation) · Composer (type picker + form). **Missing:** Cycle Mirror, Sealed Letters, Tonight's Reflection, prompt carousel, Share-as-Echo, the social gradient. Already live to build on: cycle-phase unification (`09839c2`), Insights crash guard (`cda3e96`).

### 4.2 Orphan files + "Now"-column cleanup (owed regardless)  *(STATUS item 0)*
- **Three orphan files** named but unimported by the live route: `JournalEntrySheet.jsx`, `JournalEntryCard.jsx`, `JournalComposer.jsx` — **decide delete vs rewire.** Note: `JournalComposer` "has an LLM daily prompt + post-save reflection that the live `NewEntrySheet` lacks — worth keeping as the basis for Q1 work."
- **Emoji strip:** `JotterCard` `TYPE_META` (✍️🙏💭✅🪞⚡🌙 → Lucide) and `NewEntrySheet` `MOOD_EMOJI` (😞😕😐🙂😊 → Lucide Frown/Meh/Smile).
- **Affirmation filter pill** added.
- **Header reframe:** → `LUTEAL · INNER AUTUMN · Day 9 of 12 — softness over speed`.
- **Streak reframe:** "X-day streak" → "X entries this cycle."

### 4.3 What the Editorial demo proves (the system to port)  *(JournalDemo1.jsx)*
Palette `T`: paper `#E8E3D5`, paperHi `#F1ECDD`, paperDeep `#D6CDBA`, ink `#15110C`, inkSoft `#463E33`, muted `#8C8273`, gold `#B89A55`, **crimson `#C0322B` — the single colour pop**. Type roles: `SCRIPT` Allura (large voice), `HAND` Caveat (smaller voice/CTA), `SERIF` Cormorant/Fraunces (**all reading bodies**), `UI` Inter (chrome). `PRESS`/`PRESS_DARK` letterpress shadows. Real cotton-paper PNG multiplied over cream. Components: Masthead, JessNote, Mirror, InsightTeaser, Ledger, Tonight, SealedLetters, EchoComing, Footer, Composer (12 types, serif textarea, Burn), Reader, Insights modal.

### 4.4 What replaces what
| Production today | Becomes | How |
|---|---|---|
| Utilitarian header | **Masthead** | phase issue-title + season + cycle day + date + red heart + rule |
| `JessJournalPrompt` | **Jess's note + carousel** | reuse wing data; reskin; add carousel + "Write to this" |
| _(none)_ | **Cycle Mirror** | new; same-cycle-day query + 5 lenses + Jess gloss + pattern catalogue |
| _(none)_ | **Insight teaser strip** | one line → kept Insights tab |
| `JotterCard` grid | **The Ledger** | editorial TOC, drop-initial, tap → Reader |
| _(none)_ | **Tonight's Reflection** | dusk card; coordinate with Planner `TonightCard` |
| _(none)_ | **Sealed Letters** card | teaser now; vault Phase 2 (SecureStore) |
| _(none)_ | **Share-as-Echo slot** | composer hand-off (Phase 3) |
| _(none)_ | **Echo Wall "coming"** teaser | honest; 
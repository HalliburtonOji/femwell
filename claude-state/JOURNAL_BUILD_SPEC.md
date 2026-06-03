# FemWell Journal — BUILD SPEC (production, Editorial direction) — v3

_Owner: Mr Lead Manager. Craft: Ms Atelier. Research: Ms Deep Search. Verification gate: Ms Verify._
_v3 2026-06-03 — **rebuilt against the authoritative FoundersOS Journal Master Plan**, read in full, word for word._

> **AUTHORITATIVE SOURCE — read in full for v3:** `src/components/JournalPlanDoc.jsx` (~827 lines), rendered live at **`/Ideas → Journal Plan tab`** (the `journalplan` topTab in `Ideas.jsx`). Introduced commit `7bd7264`; read verbatim from `origin/main 7ea2639`. STATUS calls it _"the authoritative spec for the Journal feature."_ **§1 below captures it 1:1 — every section, table, and item.** §2 folds in the wider research/MP sweep as clearly-marked **supplements that never override the master plan.**
>
> **DECISION (Halli):** build the Journal for real on production `Journal.jsx` (Target B). The Editorial treatment proven in `JournalDemo1.jsx` is the visual basis. Many revision cycles expected.
>
> **Hard brand rules:** UK market (NHS, GMC/NMC/HCPC, £, UK GDPR) · **no emoji anywhere** (Lucide + custom SVG only) · Fraunces + Inter base type + the journal's voice faces (§3.3) · one unified bottom nav at all viewports · cycle-count rhythm never streak shame · evidence-informed never a clinical promise.

---

# §1 — THE MASTER PLAN, CAPTURED 1:1  *(source: `JournalPlanDoc.jsx`)*

## 1.0 Hero / thesis
> _"The journal is the **loneliest page in FemWell.** Let's give it shape."_

Four design demos + live production code + external best practice → one direction. **"Journal owns the writer. Community owns the peer shapes."** The five concepts (Cycle Mirror · Sealed Letters · Echo Wall · Witness · Phase Twin) walk a user along a **solitude → witness gradient** as trust builds. **Ship the solo features first, earn the paired ones.** Pull quote: **"Journal gets the depth. Community earns the proximity."** Runway framing: **6-month sale window, 9-month soft cap.**

## 1.1 The four demos, at a glance  *(synthesis inputs, chronological)*
| # | Demo file | Label | One line | Surface |
|---|---|---|---|---|
| 01 | `femwell_journal_demo.html` | **The baseline** | Phase-aware, private-by-default writer. Solo only. Jess curates, never reads without invitation. | Hero prompt · Tonight carousel · 4 compose modes · 6 threads · gentle pattern heat strip · tonight reflection · unpack-with-Jess · locked footer. |
| 02 | `femwell_journal_community_v2.html` | **Journal + Community as one system** | "Journal owns the writer. Community owns the peer shapes." One entry can flow through both. | Cycle Mirror · Sealed Letters · anniversary surfacing · Share-as-Echo slot · Send-to-Witness slot · Echo Wall · Witness dock · Phase Twin · handoff diagram. |
| 03 | `femwell_journal_sharing_concepts.html` | **Five concepts on a gradient** | Solitude → Witness ladder. Five concepts walk the user along it as trust builds. | 01 Echo Wall · 02 Sealed Letters · 03 Cycle Mirror · 04 Witness Mode · 05 Phase Twin. Each with 2 phone mocks + LD notes. |
| 04 | `femwell_journal_sharing_deep.html` | **Deep dive — ship rules** | "Ship the solo features now. Earn the paired ones." Full flows, base44 entities, moderation rails, quarterly ladder. | Jess scrub · cooling pause · crisis intercept · screenshot block · receiver strikes · rate limits · fade defaults · deletion cascade · letter threads · witness gate. |

## 1.2 What's locked — the 8 principles  *(verbatim)*
1. **Locked to you. Always.** Encrypted on-device, never on a server unencrypted. Jess reads an entry only when handed to her.
2. **Solo before social.** Cycle Mirror and Sealed Letters earn the trust that Echo Wall, Witness, and Phase Twin spend.
3. **Anonymity is the default** for any peer surface; Jess scrubs names, places, dates, substances before anything leaves the device.
4. **Reactions are emotional, not transactional.** The lexicon: **same · hold · hear you · saved.** No like. No emoji pile-on. No follow.
5. **Phase-aware copy across the board** — luteal voice, follicular voice, ovulatory voice, menstrual voice. Fraunces italic for the human; Inter for chrome.
6. **Evidence-informed, never clinical promise.** Pennebaker, Neff and Narrative Exposure Therapy as a bibliography, not a marketing line.
7. **No emoji codepoints anywhere** in the surface. Lucide icons + custom SVG only. _(Live JotterCard breaks this today — first fix on the ledger.)_
8. **Cycle-count rhythm, never streak shame.** "4 entries this cycle — you're building a pattern" beats "21-day streak" for cyclical women.

## 1.3 Surface inventory — all 13 surfaces (live · direction · gap)  *(the build queue)*
| # | Surface | Live | Direction | Gap |
|---|---|---|---|---|
| 1 | **Journal route shell** | ✓ | Keep — reframe header from streak to phase + cycle day + italic seasonal line. | Header is utilitarian; demo header is hero-grade. |
| 2 | **Compose / new entry** | ✓ | Keep type picker + type-aware form. **Add 4-mode strip (Write · Voice · One-line · Guided).** Strip emoji from picker. | Emoji throughout. No voice. No one-line mode. **No celebration screen.** |
| 3 | **Entry card (JotterCard)** | ✓ | Keep sticky-note metaphor + tilt + colours. Strip emoji from type pill + mood → Lucide. | Emoji on every card violates brand rule. |
| 4 | **Filter pills** | ✓ | Keep, but add **`affirmation`** (schema has it; filter row doesn't). | 1 filter missing from a 7-type schema. |
| 5 | **Insights tab** | ✓ (LLM) | **Keep as-is** — most polished surface: real cycle × mood chart, 7-day rhythm, top tags, LLM weekly reflection. | None significant — minor copy passes. |
| 6 | **Phase prompt carousel** | ✗ | Add — 5-prompt carousel under header, phase-tinted accent, ◀▶ + dots. | Live route surfaces prompts only inside the textarea. |
| 7 | **Today / Tonight reflection** | ✗ | Add — dusk close-out card, 90-second prompt, phase-aware. | Demo's signature closing ritual. |
| 8 | **Unpack with Jess** | ✗ | Add — "talk it out, still locked" CTA from the entry detail. | Demo has it as the bridge between writer and AI; live has nothing. |
| 9 | **Cycle Mirror (On This Day)** | ✗ | Add — up to 5 past entries on same cycle day, Jess gloss, "Reply to past-you" CTA. | Highest-value solo feature missing. |
| 10 | **Sealed Letters** | ✗ | Add — future-me / cross-phase / anniversary. Friction-as-feature: can't open early. | Entire surface missing. |
| 11 | **Echo Wall** | ✗ | Add (Q2) — Community-side rail of anonymous one-liners, hold only. | Community surface; needs scrubber + cooling pause to ship. |
| 12 | **Witness Mode** | ✗ | Add (Q3) — single shared entry to one matched sister; 4 fixed responses. | Requires pairing engine + 3 strikes + crisis intercept. |
| 13 | **Phase Twin** | ✗ | Add (Q4) — 12-day pairing with shared daily prompt; reply blurred until you write. | Hardest infra; ships last. |

## 1.4 The solitude → witness gradient — the five concepts  *(verbatim: body · moat · voice · quarter)*
Visual: a 5-stop gradient strip, Solo → Witness. Concept colours `g1 #5E7C5A → g2 #A6862B → g3 #C17B4E → g4 #8B2635 → g5 #4A2A3A`.

1. **Cycle Mirror — "Past-you as witness."** _(Q1, solo, ship first)_
   - Body: Up to 5 past entries on the same cycle day, surfaced in-line with a Jess gloss. **Secondary views: same phase / same thread / one year ago / same mood.** Lives inside Journal — never leaves the device.
   - Moat: No tracker app surfaces your own history this way. Stardust explains phases prettily; nobody mirrors your own writing back to you.
   - Voice: _"You've been here before. Your body is consistent. You're not imagining it."_
2. **Sealed Letters — "You, across time."** _(Q1, solo, ship first)_
   - Body: Letters to future-you, unlocking by date, phase, or anniversary. Three flavours: **future-me / cross-phase / anniversary drop.** Encrypted client-side until the unlock date — even Jess can't peek. **Letter library tabs: sealed · opened · threads.**
   - Moat: Day One pioneered the encrypted-then-revealed entry. No women's app has built it phase-anchored.
   - Voice: _"Sealed, encrypted, unreadable until next follicular. Not even Jess can peek."_
3. **Echo Wall — "A room of one-liners."** _(Q2, light social, after solo trust earned)_
   - Body: Anonymous one-line entries from women in the same phase, **holding only (no replies, no DMs).** Fades on a default window. Jess scrubs identifying content on-device before any echo leaves.
   - Moat: Clue publishes phase statistics; Flo runs topic chat. **Nobody runs a phase-cohort one-line feed with hold-only reactions. This is the highest-leverage differentiating play.**
   - Voice: _"Five women on luteal d18–20 wrote something one line long, this hour."_
4. **Witness Mode — "Read this. Hold it."** _(Q3, paired, requires witness-gate + 3 strikes)_
   - Body: Single entry handed to one matched sister. **4 fixed responses or pass silently.** No thread. No chat. No screenshot. Writer can cancel before she reads. Receiver picks one line — never her own words.
   - Moat: The pattern doesn't exist commercially. The answer to "I need to be heard, I don't need a conversation" — the most common emotional state in the luteal data.
   - Voice: _"I'm holding this with you."_
5. **Phase Twin — "Twelve days. One shape."** _(Q4, deepest, last to ship)_
   - Body: Seasonal **12-day pairing** with another woman in the same phase + life stage. One shared prompt a day. **Her answer blurred until you write yours.** Container closes at next period day 1; no re-entry that cycle.
   - Moat: BabyCenter cohorts by due date; nobody cohorts by phase for a finite ritual. Closest analogue is Strava beacon.
   - Voice: _"A 12-day container. Not a friendship."_

## 1.5 The reconciliations — 5 DECISIONS (already made; not open)  *(verbatim)*
1. **Echo fade window** — A: v2 demo 47/48h · B: deep demo 7 days. **Decision: 48h ships first** (more protective; lower retention pressure). Move to 7d only after 3 cycles of cohort data show no harm.
2. **Holds count visibility** — A: public count per echo · B: private to writer. **Decision: private to writer only.** A public count creates ranking incentives the brand can't carry.
3. **Witness re-route on no-response** — A: re-routes once after 6h · B: 2h cancellation. **Decision: both.** 2h writer-cancel window; if receiver doesn't open within 6h, route to one fallback receiver with a "sent on after waiting" note; after that, archive to the writer's letter library.
4. **Letter threading** — A: single-shot · B: cross-phase reply threads. **Decision: v1 single-shot;** v2 adds threading after 3 cycles of usage data.
5. **Cultural names in seed data** — A: Naija-coded sample names · B: locked UK market. **Decision: sweep seed/sample names to a UK-balanced set** during the build pass (Echo Wall is anonymous in production, so this affects demo strings + brand register).

## 1.6 The evidence base — 5 threads  *(bibliography, never marketing)*
- **Pennebaker — expressive writing:** 100+ studies, **d ≈ 0.16** overall; 15–20 min over 3–4 sessions; emotion-acceptance framing matters more than duration.
- **Neff — self-compassion:** self-kindness · common humanity · mindfulness. The **common-humanity** leg justifies cycle-cohort framing (Echo Wall, Phase Twin).
- **Narrative Exposure Therapy:** 18 RCTs for complex trauma; VA recognises expressive writing for PTSD. Sealed Letters can carry NET-shaped prompts (grief, miscarriage, birth trauma).
- **CHI 2024 — post-Roe privacy:** top fear is government/law-enforcement access to cycle data. **Visible privacy beats invisible privacy.** "Privacy not included" labels are a brand-trust gate.
- **Vulnerability-Amplifying Interaction Loops (2025):** names the sycophancy failure mode. **Jess must observe, not companion.**

## 1.7 Competitive read — 9 apps (borrow / gap)
| App | Borrow | Gap |
|---|---|---|
| **Stardust** | Phase-aware voice in copy; engagement-grade. | No real journal surface; clinical depth + inclusivity criticised. |
| **Moody Month** | Audio journaling already in a cycle app. | Buried in UI; reports lean dashboard not narrative. |
| **Clue** | Phase Insights publishes anonymous aggregated phase data. | Framed as stats, not belonging; journal is a notes field. |
| **Flo** | Anonymous Secret Chats; diary function. | Subscription-gated; paywall pop-ups in diary; topic-keyed not phase-keyed. |
| **Day One** | E2E AES-256, biometric, per-journal conceal toggles. | Not phase-aware; no women's framing. |
| **Stoic** | Template variety (therapy prep, CBT, dream, gratitude). | Not phase-aware; stoic-male register; no peer surface. |
| **Reflectly** | Claims CBT. | CBT theatre — no actual lessons. Cautionary tale on "clinical" marketing. |
| **Ovia** | Auto-anchored entries (date + week of pregnancy as scaffold). | Pregnancy only. |
| **BabyCenter** | Birth Club cohort-by-due-date; Bumpie time-lapse. | Pregnancy only; doesn't translate to cyclical cohorts as-is. |

Opportunity triangle: **phase-aware prompts × cohort common-humanity × visible privacy** — no app occupies it.

## 1.8 The rollout ladder — Now / Q1 / Q2 / Q3 / Q4  *(every item verbatim — THIS is the build sequence)*

**NOW — cleanup before any new surface ships (rose):**
- Strip emoji from `JotterCard` (`TYPE_META`) and `NewEntrySheet` (`MOOD_EMOJI`) — Lucide icons only.
- Add **`affirmation`** to the filter pill row (schema already supports it).
- Decide fate of orphan files: **`JournalEntrySheet` · `JournalEntryCard` · `JournalComposer`. Keep one, delete the other two.**
- Header reframe: streak line → **`LUTEAL · INNER AUTUMN · Day 9 of 12`** + italic seasonal line.
- Rhythm card reframe: "X-day streak" → **"X entries this cycle — you're building a pattern."**

**Q1 — solo features, earn the trust (sage):**
- **Phase Prompt Carousel** — 5 phase-tuned prompts under header, ◀▶ + dots, phase-tinted accent.
- **Cycle Mirror** — On-This-Day card: up to 5 past entries on the same cycle day, expandable, Jess gloss + Reply-to-past-self CTA.
- **Sealed Letters v1** — single-shot future-me letters; date / phase / anniversary unlock; encrypted client-side; library tabs **sealed · opened**.
- **Tonight's Reflection card** — dusk close-out, 90s, phase-aware prompt.
- **Unpack with Jess** — "talk it out, still locked" surface from any entry; uses existing **InvokeLLM, no server retention.**

**Q2 — light social: anonymous, fading, hold-only (gold):**
- **Echo Wall** — anonymous one-liner feed, scoped by phase; fades **48h**; hold-only; rate limit **5 echoes/day**.
- **Share-as-Echo slot** — inline opt-in inside Journal; Jess offers one shareable line; **cooling pause defaults on for late luteal**.
- **Jess scrub pipeline** — regex + on-device LLM strip of names, places, dates, substances before any post leaves.
- **Crisis intercept** — keyword + context model on-device → Panic Mode + **UK NHS / Samaritans / Mind** resources.
- **Hold count visible to writer only** in their own journal.

**Q3 — paired: earned, gated, one-shot (g3 clay):**
- **Witness Mode** — single entry handed to one matched sister; 4 fixed responses or pass; **writer cancels within 2h; receiver opens within 6h or routes once.**
- **Witness gate** — **"held 3 before you send."** Pay-it-forward; prevents drive-by senders.
- **3-strike receiver policy** — screenshot attempts, ignored entries, or rule-breaks remove from receiver pool.
- **FLAG_SECURE** (Android) + iOS capture prevention on the Witness receiver view.
- **Pairing engine** — **phase + life-stage + language** match; no profile, no handle, no carry-over.

**Q4 — deepest pairing: contained, finite, ritual (plum):**
- **Phase Twin** — 12-day pairing; shared daily prompt; twin's answer blurred until you write yours; archive read-only at day 12.
- **Container rules** — opens at matching, closes at next period day 1, no re-entry that cycle.
- **Sealed Letters v2** — letter threads (luteal → follicular reply → follicular reply…).
- **Anniversary surfacing** — "a year ago today" card with auto-generated write-back letter prompt.
- **Voice-first compose** — on-device **Whisper-small** transcription for luteal-phase / caregiving days.

## 1.9 Open questions — the master plan's own 8  *(resolve before each surface is built)*
1. **Where does Echo Wall live** — a Journal tab or a Community rail? _(Provisional: Community-side rail with a Journal-side opt-in slot.)_
2. **Phase scope for Echo Wall cohorts** — exact phase day, ±1-day window, or whole phase? (Smaller = more resonance, less density.)
3. **Letter library threading** — sealed / opened / threads tabs from day 1, or sealed + opened only with threads in v2?
4. **Voice transcription pipeline** — on-device Whisper-small (heavier bundle, true privacy) or Apple/Google on-device (smaller, platform-locked)?
5. **Crisis intercept escalation** — auto-disable peer surfaces for 24h after intercept fires, or a soft toggle?
6. **Tier-4 paywall hook** — do Cycle Mirror's **secondary views** (same thread / one year ago / same mood) sit behind Plus, or all free? _(NB: the base Cycle Mirror is free Q1; only the secondary views are the paywall question.)_
7. **Onboarding sequence** — does the user pick a sharing comfort level during onboarding, or earn surfaces as entries accumulate?
8. **Naming** — "Witness" or "Hold"? The deep file uses Witness Mode; the gesture is hold. **Decide once and sweep.**

## 1.10 Risk register — 6
1. **AI companion drift** — Jess is observer, not friend. Anti-pattern: "Hi, I'm Jess, I missed you today." Right: "You wrote about sleep on 4 of 5 luteal d19s." (Replika failure mode is one cycle away.)
2. **Privacy theatre** — brand promises encryption, must deliver. Cleartext server logs + one screenshot ends the brand. Day One's AES-GCM-256 is the public bar.
3. **Public-feed creep** — every social mechanic grows a follow button. Hard rules: no handles, no threads, no DMs, no like, no leaderboard, no "most relatable." Echo Wall + Witness die the moment they grow conversation.
4. **Streak shame** — cyclical women don't write equally across the cycle; a streak punishes follicular days. Cycle-count rhythm is the only honest metric.
5. **Cultural mis-register** — UK market is locked. Sample names + NHS/Samaritans/Mind links must be UK-local; never Naija- or US-coded.
6. **Clinical promise** — Pennebaker/Neff/NET in the bibliography, never marketing. "Evidence-informed" is the ceiling; promising depression/anxiety reduction crosses MHRA territory in the UK.

## 1.11 The voice — 10 hero quotes (the register)
Short, second-person, ritual-tinged, never perky. If new copy clashes with this register, rewrite the copy.
1. "Locked to you. Always."
2. "Same phase, same day — across time."
3. "You've been here before. Your body is consistent. You're not imagining it."
4. "A 12-day container. Not a friendship."
5. "I'm holding this with you."
6. "You can hold someone when you've been held."
7. "One thing your body carried today — name it, thank it, close the book."
8. "A room of one-liners. No handles, no threads, just sisters holding sentences."
9. "This sounds heavy. A peer isn't the right shape for tonight. You deserve more than a sister can hold. Not less. More."
10. "A thread is forming. Four phases, four letters. This is you becoming a witness to yourself."

---

# §2 — SUPPLEMENTS (other swept sources — DO NOT override §1)

These add depth the master plan references but doesn't fully spell out. Where a supplement conflicts with §1, **§1 (the master plan) wins**; conflicts are flagged.

## 2.1 The private/public visibility model *(sharing_deep, community_v2, strategic_synthesis, future_features)*
The master plan's "Journal owns the writer / Community owns the peer shapes" is the frame; the mechanics beneath it:
- **"One entry, four lives":** the same reflection can **stay locked (default) · become an echo · be sealed · be handed to one witness** — decided **at the entry level, never by default.**
- **Visibility levels (entity field `visibility`):** **`same_phase` (default) · `circles` · `all`.** No external/web-public level; the widest anything travels is one scrubbed line to the in-app wall. "No public profile — Community is anonymous-first."
- **Circles:** phase / program / region / life-stage (e.g. Luteal Softness, Sleep Reset cohort, UK Women Wellness, Perimenopause Watch). Pre-existing Community primitive.
- **Circle of Three (private named circle, NOT in the master plan):** 2–3 chosen people (mother/sister/best friend) get a narrow read = current phase label + last week's felt-sense summary; no logs, no Jess notes; **quarterly re-consent**. Entities `Circles(private)/CircleMembers/CircleDigests`. **Plus Partner Sync** (narrow read of phase+mood+what-helps). → **Decision for Halli (§6): do these join the Journal roadmap or stay Network features?**
- **Anonymity mechanics:** UUID-only echoes, hashed author token (retract without deanonymising), daily-rotated holder_hash, double-hashed witness tokens never joined to users, twin pair_id never joined at query time, matching in a separate VPC.
- **3-tier sensitivity + SecureStore:** Tier 1 public-indexed · Tier 2 server-stored per-user-encrypted · **Tier 3 E2E client-only keys (Sealed Letters, Journal locked entries, WitnessRequests, WitnessStrikes).** One **"FemWell SecureStore"** primitive, **built once with Sealed Letters first**, reused everywhere. Tier 3 = instant hard-delete, no server copy.
- **Consent-on-surface:** privacy state shown inline (padlock chip on entries, strike-count chip on Witness), "Let Jess…" not "Enable…"; dark plum "trust-ink" gradient reserved for fragile surfaces.

> **Honest gap (unchanged from v2):** neither the master plan nor any doc contains a **whole-journal "make public" mode, an external/web-public audience, or named (non-anonymous) sharing.** Everything is anonymous-first or narrow-private. If Halli means more than per-entry anonymous sharing, it's from memory and currently unsourced.

## 2.2 Cycle Mirror — depth beneath §1.4/§1.8
Five secondary lenses (same cycle day / same phase / same thread / one year ago / same mood); **Pattern catalogue** ("7 patterns found": recurring themes across ≥2 cycles, each with cycles-observed + strength + Jess insight + a 28-day heatmap; qualifies ≥3 mentions/≥2 cycles, "strong" ≥4 cycles); first-cycle empty state **"needs at least 2 full cycles"** with **scaffold-from-photos** of past entries + a 3-min check-in; **Anniversary view** auto-activates on tagged hard dates (loss/diagnosis). Entities: `JournalEntries` + new **`EntryTags`** (`entry_id, phase, cycle_day, mood, thread, body_signal[]`) + derived **`CyclePatterns`** view (`user_id, pattern_name, cycles_observed, strength, insight_text`). 100% on-device; ±1-day match for irregular cycles. _Source: sharing_deep/concepts._

## 2.3 Sealed Letters — production schema + the home/encryption tension
Conceptual (master plan + demos): inside Journal, Q1, client-side encrypted, triggers future-me/cross-phase/anniversary, tabs sealed·opened (threads v2), break-seal ritual (wax-crack, haptic), ghost-seals, 30-day grace.
**Production MP-Eng-2 (`lifestyle_sealed_letters_spec` + 2 base44 prompts):** new **`SealedLetters`** entity (NOT extending JournalEntries) — fields `body`(text,req), `seal_date`(ISO,req,>today), `unsealed_at`, `unseal_seen_at`, `title`(captured, not rendered v1); indexes `user_id`,`seal_date`; **Option A** client-side mount-check (no scheduled fn); Today **`UnsealedLetterCard`** (225° gradient); full locked copy ("A letter to a future you" / "Dear future me…" / "Seal it" / "Letters to yourself / Held in private until the date you picked"). **⚠ Two conflicts with §1 (master plan wins):** (a) the MP places letters **outside** Journal on Lifestyle ("slow and ceremonial") whereas the master plan puts them **inside** Journal Q1 — **follow the master plan (inside Journal)**; (b) the MP v1 stores `body` as **plaintext** + client gate, whereas the master plan + Risk 02 require **real client-side encryption** — **follow the master plan (encrypt for real).** _Source: lifestyle_sealed_letters_*._

## 2.4 Echo / Witness / Phase Twin — entities + the granular rails behind §1.8
- **Echoes** (`id, author_hash, phase, life_stage, line, source_entry_hash, fades_at, visibility(same_phase/circles/all), edited_at`), **EchoHolds** (`holder_hash` daily-rotated), **EchoFlags**. Cold start: first 7 days seeded.
- **WitnessRequests** (`writer_hash, entry_ciphertext, match_criteria, matched_at, read_at, response_code(1–4|null)`), **WitnessStrikes**. The 4 fixed lines: _"I'm holding this with you. / Me too. / You're not alone in this. / I hear you."_ + pass silently. **Witness Charter** shown once.
- **TwinPairs** (`cycle_start, cycle_end, partner_a_hash, partner_b_hash, shared_tags[], closed_at`), **TwinEntries** (delete day 13), **TwinPrompts** (~40/phase, no repeat within 3 cycles); reveal = server gate after both `written_at`; Jess posts one bridging note/day; closing ritual = each carries one of the other's lines (48h window).
- **Granular safety rails** (sharing_deep Appendix A): Jess scrub · **10-min cooling pause** (off in follicular, on in late luteal d24–28) · **30-min night throttle 10pm–6am on cycle days 22+** · crisis intercept · FLAG_SECURE · 3-strike removal · **rate limits 1 witness send/day, 3 receives/day, 1 twin/cycle, 5 echoes/day** · auto-unpost after 48h app absence · retract-by-one-way-hash · **deletion cascade** (account delete burns sealed letters/echoes/twin entries) · 6-rail first-time consent. _Source: sharing_deep, community_v2, component_library._

## 2.5 Living Wisdom — Echo Wall × Jess flywheel (wisdom surfaced INTO the journal) *(new; not in master plan)*
Collective Echo wisdom surfaced **into your compose flow as company, not advice.** Journal trigger: 60s sustained writing + phase/topic match ≥ threshold → **one faded wisdom card inline, max 1/session** ("someone 19 days in wrote this"). Ranking phase×topic×recency×holds; **90-day repeat lock**; topic signals from your own words, **never shared back**; you cannot screenshot/export a surfaced Echo. Surfaces: journal / today / panic_afterglow / jess_drawer. Entities **`WisdomIndex`** (eligible = clean ∧ holds≥5 ∧ age≤180d), **`JessWisdomSurfacings`** (+ `matched_on` transparency). Phase 3+ (needs Echo Wall). _Source: femwell_living_wisdom_demo, copy_deck._

## 2.6 Reactions lexicon + Share-as-Echo detail
**same / hold / hear you / saved** — counts **never ranked**; feed order phase + recency, never engagement; Echo Wall uses **hold** as the only response (`GentleReactions` component). **Share-as-Echo:** Jess offers one line, scrubs PII/substances, **rewrites it to a single sentence in the writer's voice**; buttons Share / Edit first / Keep private. _Source: component_library, community_v2._

## 2.7 The reading engine ("the page IS the screen") — the entry Reader inherits it
15 rules: page is the screen (no card/shadow/radius — the v3 "card-on-cream" was rejected); chrome auto-hides one-tap; 50–75 cpl (66); line-height ≥1.5; humanist serif (Fraunces); **3 themes** Cream `#FFFAF5` / Honey `#F5E6CD` / Plum Night `#2B1E26`; horizontal page-turn; muted page indicator; **measurement-based pagination**; drop-cap + `· · ·` ornaments + ruled pull-quotes; settings bottom-sheet (5 size steps, theme, typeface, line spacing, margins, persisted `fw_reader_*`); soft slide-fade turns (280ms, reduced-motion → cross-fade); persist anchor across resize. Shared with Daily Story + the Sealed-Letters reader. _Source: research_ereader_ux, atelier_reader_v4, reader_v3_brainstorm, reader_card_audit._

## 2.8 Crossovers (keep the journal aware of the app)
**Rituals:** auto-infer "tend" events from entries (opt-in only); "journal" ritual category; Jess season reflection drafted from Pulse + Journal, never shared; garden is private. **Horoscope:** Sky Diary (cycle×sky), Sky-aware Smart Save (deferred), **Void-of-Course Moon "VoC" pip** in journal save actions, Quiet-Mode shadow-language suppression, **Saturn Return Letter** (age 27–30 sealed-letter-adjacent), Moon Phase Diary. **Today:** reflective stack OnThisDay → Friend-6-Months → UnsealedLetter; affirmation bubble; Mind pillar (gratitude/mood correlation + journaling-prompt suggestion). **Doctor:** journal patterns (excluding burns + sealed letters) feed the Doctor-Ready Diary (`generateDoctorReadyDiary`, NICE NG23, jsPDF A4). **Daily Story:** shares the reading engine only. _Source: rituals/living_wisdom/today_pillars demos, horoscope specs, research_first_feed, sealed_letters_spec §9._

## 2.9 Burn Mode *(named in the wider brief, NOT in the master plan — flag)*
Write-something-that-auto-deletes; a quiet Composer option (Moon glyph); `is_burn`/`burn_at`; excluded from Insights/exports/Doctor/Cycle-Mirror; server cleanup must fire offline. **The master plan does not list Burn Mode.** No demo, copy, or entity anywhere → **needs design + a decision whether it's in scope at all (§6/§7).** _Source: JOURNAL_BRIEF §3, GRAND_PLAN §B5._

---

# §3 — PRODUCTION MIGRATION

## 3.1 Production today + the "Now" cleanup (master plan §1.8 NOW)
Utilitarian header · tabs `Journal | Insights` (`JournalInsightsTab` strong) · `JessJournalPrompt` wing · `JotterCard` sticky notes (emoji) · filter pills (no Affirmation) · Composer (type picker + form). Missing: prompt carousel, Cycle Mirror, Sealed Letters, Tonight's Reflection, Unpack-with-Jess, the social gradient. Already live: cycle-phase unification (`09839c2`), Insights crash guard (`cda3e96`). **NOW tasks (do first):** strip emoji `JotterCard TYPE_META` + `NewEntrySheet MOOD_EMOJI` → Lucide; add `affirmation` filter pill; **orphan-file decision — keep ONE of `JournalEntrySheet`/`JournalEntryCard`/`JournalComposer`, delete the other two** (note: `JournalComposer` "has an LLM daily prompt + post-save reflection the live `NewEntrySheet` lacks — worth keeping as the Q1 basis"); header reframe; streak→"X entries this cycle" reframe.

## 3.2 What the Editorial demo provides (the visual layer) *(JournalDemo1.jsx)*
Palette `T` (paper `#E8E3D5`, ink `#15110C`, crimson `#C0322B` = the only colour pop). Type roles: SCRIPT Allura (large voice), HAND Caveat (small voice/CTA), SERIF Cormorant/Fraunces (all reading bodies), UI Inter (chrome). `PRESS`/`PRESS_DARK` letterpress; real cotton-paper PNG. Components: Masthead, JessNote, Mirror, InsightTeaser, Ledger, Tonight, SealedLetters, EchoComing, Footer, Composer, Reader, Insights. **The Editorial treatment is how the master plan's surfaces should LOOK; the master plan is WHAT they do.**

## 3.3 Routing, nav, fonts, deps
Route `/Journal` keeps the `Journal | Insights` tabs; Composer + Reader are full-screen overlays (not routes) so the one unified bottom nav stays consistent. `/JournalDemo1` stays the craft reference until sign-off. Load Allura + Pinyon + Caveat + Cormorant via the production font pipeline (no FOUT). Confirm/add `JournalEntries` fields (`mode, thread, is_burn/burn_at, affirmation`, reliable `cycle_day`+`created_at`, backfill nulls). New entities by phase: `EntryTags`, `CyclePatterns`, `SealedLetters`, `Echoes/EchoHolds/EchoFlags`, `WitnessRequests/WitnessStrikes`, `TwinPairs/TwinEntries/TwinPrompts`, `WisdomIndex/JessWisdomSurfacings`, (private) `Circles/CircleMembers/CircleDigests`. **Build SecureStore once, Sealed Letters first.** Schema changes via the AI builder (never the web editor — build points; schema-only prompts, split per the prompt-size lesson).

---

# §4 — CRAFT BAR
Real cotton-paper PNG over `#E8E3D5`, soft light, vignette; near-black debossed ink `#15110C` (`PRESS`/`PRESS_DARK`); SCRIPT only for short large voiced moments, HAND for small voice/CTA, **all reading bodies SERIF** at ~66 cpl ≤580px; Inter chrome only; **no script paragraphs**; red heart `#C0322B` the only colour pop at emotional beats; dark plum "trust-ink" for fragile surfaces; **no emoji ever**. Reading engine per §2.7.
> **⚠ OPEN, UNSOLVED craft item — pen/ink depth.** Iterated 3× across sessions d→f, each Ms-Verify-approved vs IMG_9854, **but Halli is still not satisfied** with the nib-pressed-into-fibre depth. Treat as **ongoing**; re-examine every journal-voice pass; do not mark done without Halli's phone sign-off. **Ms Atelier crafts → Ms Verify gates every visual change before ship.**

---

# §5 — BUILD PHASING (the master plan's ladder is the authority)
Follow §1.8 **Now → Q1 → Q2 → Q3 → Q4** exactly. Map to reviewable engineering passes (each shippable + live-walked; STATUS SHIP LOG line per commit; Ms Atelier → Ms Verify on every visual change):
- **Phase 0 = NOW** + Editorial shell scaffold (paper/masthead/footer/fonts) onto production `Journal.jsx`. Pen-depth check #1.
- **Phase 1 = Q1** (several sub-passes): Phase Prompt Carousel · **Cycle Mirror + secondary lenses** · **Sealed Letters v1 (inside Journal, real client-side encryption, SecureStore)** · Tonight's Reflection · Unpack-with-Jess. Wire the Ledger/Reader/Composer to real data; reading engine §2.7. Pen-depth check #2.
- **Phase 2 = Q2:** Echo Wall (48h, hold-only, 5/day) + Share-as-Echo slot + Jess scrub + crisis intercept + hold-count-private + **Living Wisdom surfacing**.
- **Phase 3 = Q3:** Witness Mode + witness gate (held-3) + 3-strike + FLAG_SECURE + pairing engine.
- **Phase 4 = Q4:** Phase Twin + container rules + **Sealed Letters v2 threading** + anniversary surfacing + **voice-first compose (Whisper-small)**.
- **Separate track:** Circle of Three + Partner Sync (private named-circle sharing) — only if Halli puts them on the Journal roadmap.
_(Paywall/Plus parked until the sale window — except the explicit open question on Cycle-Mirror secondary views, §1.9 Q6.)_

---

# §6 — OPEN DECISIONS FOR HALLI
**A. The master plan's own 8** (§1.9): Echo Wall home · Echo phase scope · letter threading tabs day-1-vs-v2 · voice pipeline (Whisper-small vs platform) · crisis escalation (auto-disable 24h vs toggle) · **Cycle-Mirror secondary views free vs Plus** · onboarding (pick comfort vs earn) · **"Witness" vs "Hold" naming — decide + sweep.**
**B. Supplement-level decisions:** 1 Sealed-Letters encryption — confirm **real client-side encryption from v1** (master plan + Risk 02), overriding the production MP's plaintext-gate. · 2 Visibility picker — ship full `same_phase/circles/all` or start same-phase-only. · 3 Circle of Three + Partner Sync — on the Journal roadmap or separate. · 4 **Burn Mode — in scope at all?** (not in the master plan; needs design if yes.) · 5 Tonight's Reflection vs Planner `TonightCard` home. · 6 Fonts — confirm Allura + Caveat (Tangerine superseded). · 7 Pen-depth — keep iterating in Phase 0/1 or freeze until the sale demo. · 8 Demo retirement — keep `/JournalDemo1` as craft reference or retire.

---

# §7 — SOURCE MAP
| Area | Source |
|---|---|
| **The whole spine (§1): principles, 13-surface inventory, 5 concepts, 5 reconciliations, evidence base, 9-app competitive read, Now/Q1–Q4 ladder, 8 open questions, 6 risks, 10 hero quotes** | **`src/components/JournalPlanDoc.jsx` (the FoundersOS Master Plan, `/Ideas → Journal Plan tab`)** |
| Editorial visual system (palette, type roles, components) | `journal_editorial/JournalDemo1.jsx`, `JOURNAL_GRAND_PLAN.md` |
| Thesis, 8 principles long form, production reality | `journal_editorial/JOURNAL_BRIEF_everything_we_know.md` |
| Private/public mechanics, Circles, anonymity, all sharing flows + entities | `femwell_journal_sharing_deep.html`, `_concepts.html`, `_community_v2.html` |
| 3-tier sensitivity, SecureStore, consent-on-surface, Free-vs-Pro | `femwell_strategic_synthesis.md` |
| Circle of Three (private), Partner Sync | `femwell_future_features_brainstorm.md` |
| Sealed Letters production schema/copy/edges | `lifestyle_sealed_letters_spec.md` + 2 base44 prompts |
| Living Wisdom flywheel | `femwell_living_wisdom_demo.html`, `copy_deck_30_pages.md` |
| Reading engine | `research_ereader_ux.md`, `atelier_reader_v4_spec.md`, `reader_v3_brainstorm.md`, `reader_card_audit.md` |
| Crossovers (rituals/horoscope/today/doctor) | rituals/today_pillars demos, `horoscope_v2_spec.md`, `research_first_feed.md` |
| Reactions lexicon, Witness dock, dark-card rule | `femwell_component_libra
# FemWell Journal — BUILD SPEC (production, Editorial direction)

_Owner: Mr Lead Manager. Craft: Ms Atelier. Research: Ms Deep Search. Verification gate: Ms Verify._
_Created 2026-06-03. Status: PLANNING ONLY — no code yet. Pairs with `journal_editorial/JOURNAL_GRAND_PLAN.md` + `journal_editorial/JOURNAL_BRIEF_everything_we_know.md`._

> **DECISION (Halli, 2026-06-03):** We now build the Journal **for real on the PRODUCTION `Journal.jsx` page (Target B)** — not the `/Ideas` demo. The Editorial design + features proven in `JournalDemo1.jsx` become the basis for production `Journal.jsx`. Expect **many** revision cycles.
>
> **Live baseline this spec is written against:** `origin/main e6f1906`, live bundle `index-DA-OrqI_.js`. The Editorial demo lives at `/Ideas → Journal Demos → Demo 1` (route `/JournalDemo1`); production `Journal.jsx` is still the pre-existing utilitarian page.
>
> **Hard brand rules (non-negotiable, apply to every line of this build):** UK market (NHS, GMC/NMC/HCPC, £, UK GDPR) · **no emoji anywhere** (Lucide + custom SVG only) · Fraunces + Inter as the app's base type, with the journal's own voice faces layered in (see §4) · **one unified bottom nav** at all viewports, no desktop sidebar · cycle-count rhythm, never streak shame · evidence-informed, never a clinical promise.

---

## 1. VISION & PRINCIPLES

### 1.1 The thesis (what the Journal IS)
A **phase-aware, private-by-default writing space** whose moat is cycle data. The one-line claim: _"Only a cycle-aware app can write you letters across phases and mirror your own history back to you. Period-tracker diaries cannot."_ The Journal is the heart of FemWell's strategic move from **cycle app → women's app**. It is **solo first**; social surfaces are earned, anonymous, and deliberately thin.

The core feeling, set by Halli's reference (cream handmade paper, fine script, one small red heart): the journal should feel like a **private letterpress notebook**, not an app screen — and like **a place that remembers you**. Editorial craft + cycle memory is the combination no competitor has.

### 1.2 The eight locked principles
1. **Locked to you. Always.** Encrypted on-device; Jess reads an entry only when explicitly handed to her.
2. **Solo before social.** Cycle Mirror + Sealed Letters earn the trust that Echo Wall / Witness / Phase Twin later spend.
3. **Anonymity is the default** for any peer surface; Jess scrubs names, places, dates, substances before anything leaves the device.
4. **Reactions are emotional, not transactional** — lexicon: _same · hold · hear you · saved_. No like. No follow. No emoji pile-on.
5. **Phase-aware copy across the board** — luteal / follicular / ovulatory / menstrual voices. Serif italic for the human; Inter for chrome.
6. **Evidence-informed, never a clinical promise** — Pennebaker (expressive writing), Neff (self-compassion), Narrative Exposure Therapy as a bibliography, never a marketing claim.
7. **No emoji anywhere** — Lucide + custom SVG glyphs only.
8. **Cycle-count rhythm, never streak shame.**

### 1.3 The solitude → witness gradient (the safety spine)
The whole product is arranged as a one-directional gradient from private to social, shipped **safest-first**. Each step out costs trust the prior step earned:

```
  SOLITUDE                                                           WITNESS
  └ private entry ─ Cycle Mirror ─ Sealed Letters ─┃─ Echo Wall ─ Witness ─ Phase Twin
     (you alone)     (you + past you)  (you + future you) ┃  (anon crowd) (1:1 anon) (12-day pair)
                                                          ┃
                         everything LEFT of this line ships first and stands alone.
```
Solo features (left of the line) are the product's spine and must be excellent on their own. Social features (right) are **rooms off the hallway**, never crammed into the main scroll, and each arrives as its own quiet surface — never an open chat, never a feed you scroll for dopamine.

### 1.4 Why this is a moat (competitive read)
Stardust explains phases prettily but mirrors nothing back. Clue/Flo publish phase _stats_, not _belonging_. Day One pioneered encrypted-then-revealed entries but isn't phase-anchored. Moody Month has phase voice but no real journal. **Nobody runs a phase-cohort, hold-only, mirror-your-own-history journal with cross-phase sealed letters.** That is the open lane, and it is defensible precisely because it requires the cycle engine FemWell already has.

### 1.5 The experience spine (single scrolling "issue")
Production `/Journal` is composed like one vertical literary-journal issue you scroll, plus an Insights tab and full-screen Composer/Reader. End-state IA:

```
/Journal  (Editorial page — "a publication of one")
├─ Masthead        phase as issue title ("Luteal · Inner Autumn · Day 26") · hairline rule · date · one red heart
├─ Jess's note     one phase-tuned prompt line in the journal voice + a 3–5 prompt carousel ("Write to this")
├─ On This Day     Cycle Mirror — your own words from the same cycle day last cycle + Jess gloss + "reply to past self"
├─ A line from the week   insight teaser (one sentence) → opens the Insights tab
├─ The Ledger      your entries as an editorial table-of-contents: hanging dates, hairline rules, drop-initial on the latest
├─ Tonight's Reflection   dusk close-out ritual card (phase-aware, ~90s)
├─ Sealed Letters  locked card hinting at letters to future-you → vault
├─ Echo Wall — coming   single quiet teaser (honest about Q2)
└─ Footer          "Locked to you. Always." + small lock glyph

Tab: Insights   cycle × mood chart · 7-day/28-day rhythm · top tags · weekly Jess reflection
Composer (full-screen)   type picker (12 types) · phase-tuned prompt · 4 modes (Write/Guided/One-line/Voice) · Save / Burn
Reader (entry detail)    "the page is the screen" — serif, drop-cap, soft fade
```

---

## 2. FULL FEATURE INVENTORY (exhaustive — nothing omitted)

Format per feature: **Purpose · IA placement · Components · States · Data wiring · Interactions · Edge cases · Phase (demo-now vs later).** "Demo-now" = already proven in `JournalDemo1.jsx`; "Phase N" = build milestone in §5.

### 2.1 Entries — create / read / edit / delete (the core object)
- **Purpose.** The atomic unit: a private, phase-stamped piece of writing.
- **IA.** Created via Composer; listed in the Ledger; opened in the Reader.
- **Components.** `Ledger` (list/TOC), `Reader` (detail), `Composer` (create/edit).
- **States.**
  - _Empty_ (no entries ever): editorial empty-state — masthead + Jess's note + a single "Begin your first entry" line in the journal hand; the Ledger shows a one-line invitation, not a blank box.
  - _Loading_: paper background renders immediately; entry rows fade in (skeleton hairlines, no spinner — spinners break the paper illusion).
  - _Partial_ (1–4 entries): Ledger shows what exists; drop-initial on the latest only.
  - _Populated_: full TOC with hanging dates + type stripe colour.
  - _Error_ (fetch fails): quiet inline line "Couldn't open your journal just now — pull to retry," never a crash; production today had a `tags.split` crash on Insights (fixed in `cda3e96`) — guard all list parses.
- **Data wiring.** Base44 `JournalEntries` entity. Fields in play: `body` (text), `type`/`entry_type`, `mood`, `phase`, `cycle_day`, `mode` (Write/Guided/One-line/Voice), `thread`, `created_at`, `is_burn`/`burn_at`, `affirmation` support, `lock` flag. **Note:** `created_at` was null on historical rows (pipeline bug, see memory `project_femwell_pipeline_hidden_bugs`); the Ledger must sort defensively (fallback to update time / id) and the migration must backfill.
- **Interactions.** Tap a Ledger row → Reader. Long-press / overflow → edit, delete, change type/thread. Edit re-opens Composer seeded with the entry. Delete = confirm sheet ("This can't be undone") → cascade-safe remove.
- **Edge cases.** Very long entries (Reader paginates by measure, not word count); entries with no type (default "Free write"); burn entries (render with crimson eyebrow + countdown, never in exports); entries created offline (queue + reconcile).
- **Phase.** Read/list/create = **Phase 1**. Edit/delete polish = **Phase 1**. Threads = **Phase 1b**.

### 2.2 Compose modes — Write · Guided · One-line · Voice
- **Purpose.** Meet the writer where her energy is (luteal ≠ follicular): long-form, scaffolded, single-sentence, or spoken.
- **IA.** Mode selector inside the full-screen Composer (above the type picker or as a small segmented row).
- **Components.** `Composer` with a `mode` switch; `GuidedComposer` (prompt-step scaffold); `OneLineComposer` (single field, big type); `VoiceComposer` (record → on-device transcript).
- **States.** Each mode has empty/typing/saving/saved. Voice adds: mic-permission-needed, recording, transcribing, transcript-editable, transcribe-failed (fall back to keep-audio + manual note).
- **Data wiring.** `JournalEntries.mode`. Voice stores transcript as `body`; audio blob handling is a Phase-2 decision (on-device only; do not upload raw audio without explicit consent — privacy principle #1).
- **Interactions.** Switching mode mid-write preserves text where possible (Write↔Guided↔One-line share the text buffer; Voice is additive).
- **Edge cases.** Voice on unsupported browser → hide the mode, don't error. One-line enforces a soft length nudge, not a hard cap.
- **Phase.** Write = **Phase 1** (demo-now). Guided = **Phase 1b** (demo shows the slot). One-line = **Phase 2**. Voice = **Phase 2** ("coming" affordance until then).

### 2.3 Entry types (12) + type-aware prompts
- **Purpose.** Lightweight taxonomy that also tunes the prompt.
- **Set (locked, from demo):** Free write · Reflection · Gratitude · Mood · Work · Relationships · Money · Creative · Grief · Joy · Identity · **Affirmation**. (Burn is a _mode_ on top of a type, not a 13th type.)
- **Components.** Type picker row in Composer; `TYPE_COLOUR` stripe in the Ledger; `TYPE_PROMPTS` map drives the seeded prompt.
- **Data wiring.** `JournalEntries.type`; **production filter pills are currently missing `Affirmation`** — adding it is a Phase-1 fix owed regardless (grand plan §B7).
- **Edge cases.** Legacy entries with retired/typo types map to "Free write".
- **Phase.** **Phase 1** (type set + Affirmation filter fix + type colours).

### 2.4 Prompts — daily prompt + carousel + Jess's note
- **Purpose.** The day's invitation in Jess's voice; not a form field, a voiced line.
- **IA.** "Jess's note" block near the top of the page; a 3–5 prompt carousel; each prompt has a "Write to this" CTA that opens the Composer seeded with that prompt.
- **Components.** `JessNote` (current carousel of `MOCK.prompts`), `PromptCarousel`.
- **States.** Loading (show yesterday's cached prompt or a safe default); populated; error (fallback to a static phase-appropriate line).
- **Data wiring.** Phase + cycle day → prompt selection. Production has a `JessJournalPrompt` wing (Feature 4, shipped `2359640`) already surfacing a daily phase prompt — **reuse/extend it**, don't duplicate. Prompts should be phase-tuned and, ideally, lightly personalised by Jess (LLM) with a deterministic fallback bank (cost-bounded, cache 24h — same pattern as Planner `RitualReframeShimmer`).
- **Edge cases.** No phase data yet (new user) → neutral universal prompts.
- **Phase.** Daily prompt + carousel = **Phase 1** (demo-now).

### 2.5 The Ledger (entries as an editorial table-of-contents)
- **Purpose.** Recent writing presented like a literary contents page, not sticky notes. Replaces production's `JotterCard` sticky-note grid.
- **IA.** Mid-page, the largest section.
- **Components.** `Ledger`, row = hanging date + type stripe + serif preview line; drop-initial on the latest entry only.
- **States.** Empty/partial/populated/error as §2.1. Burn rows show countdown ("burns in 4h").
- **Data wiring.** `JournalEntries` sorted by `created_at` desc (with the null-safe fallback). Type colour from `TYPE_COLOUR`.
- **Interactions.** Tap row → Reader. Filter pills (type/phase/thread) scope the list. Search (§2.13).
- **Edge cases.** Mixed null dates; pagination/lazy-load beyond ~20 rows.
- **Phase.** **Phase 1** (demo-now visual; wire to real data).

### 2.6 Cycle Mirror — "On This Day" (the highest-value solo feature, the moat)
- **Purpose.** Surface your own words from the **same cycle day last cycle** (and secondary lenses), so you _feel_ your body's consistency. The emotional hook competitors cannot copy. _"You've been here before. Your body is consistent. You're not imagining it."_
- **IA.** Dedicated section under Jess's note.
- **Components.** `Mirror` (past entry card + Jess gloss + "Reply to who you were" CTA). Secondary lens switcher: same cycle day / same phase / same thread / one year ago / same mood.
- **States.**
  - _No match_ (new user / no prior same-day entry): graceful — "No echo for day 26 yet. This becomes your first." Never blank.
  - _Single match_: show it with Jess gloss.
  - _Multiple matches_ (up to 5): show the most recent, with a "more echoes" affordance.
  - _Loading_: hairline placeholder.
- **Data wiring.** Query `JournalEntries` where `cycle_day == today's cycle_day` AND `created_at` in a prior cycle, scoped to the user. **Never leaves the device.** Jess gloss = LLM on the matched entry, generated on-device/handed-to-Jess only, with a deterministic fallback. Requires reliable `cycle_day` stamping (depends on the unified `computeCycleDay`, fixed `09839c2`).
- **Interactions.** "Reply to past self" opens the Composer seeded ("Reflecting on what I wrote a cycle ago…"). Lens switch re-queries.
- **Edge cases.** Irregular cycles (day numbers drift) → match on ±1 day window, like Planner's Cycle Mirror Sunday tile. Sparse history → secondary lenses or empty-state.
- **Phase.** **Phase 1** (demo-now visual; the marquee wiring task).

### 2.7 Tonight's Reflection (the dusk close-out ritual)
- **Purpose.** Bookend the day with a ~90-second phase-aware reflection; the evening counterpart to the morning prompt.
- **IA.** Lower on the page (a "close the day" card); time-aware (emphasised after dusk).
- **Components.** `Tonight` (dusk card, `PRESS_DARK` letterpress on a darker stock).
- **States.** Day (de-emphasised/teaser) vs evening (active); done-for-tonight state after a reflection is written.
- **Data wiring.** Phase-tuned prompt; writes a normal `JournalEntries` row tagged as a reflection. Coordinates with Planner's existing `TonightCard` (avoid two competing "tonight" surfaces — decide one home or cross-link).
- **Edge cases.** Timezone (UK default); user already reflected → confirm + offer "add more".
- **Phase.** **Phase 1** (demo-now).

### 2.8 Insights (the pattern engine — production's strongest existing surface)
- **Purpose.** Show real patterns: mood by phase, writing rhythm, top tags, a weekly Jess reflection.
- **IA.** A **tab** (`Journal | Insights`) — kept deep — plus a one-line teaser ("A line from the week") on the main page that opens it.
- **Components.** `JournalInsightsTab` (existing; cycle×mood chart, 7-day rhythm, top tags, weekly LLM reflection), `InsightTeaser` (page strip), `Insights` modal (demo's Jess line + 28-day rhythm dot-grid + community line).
- **States.** Empty (not enough entries → "Patterns appear after a few entries"), partial, populated, error (the historical `tags.split` crash must stay guarded).
- **Data wiring.** Aggregates `JournalEntries` by phase/mood/tag/date; weekly reflection is an LLM call (cost-bounded, cached). Mood × cycle requires `mood` + `phase`/`cycle_day` on entries.
- **Interactions.** Teaser → Insights tab. Chart tap → filtered Ledger (optional, Phase 2).
- **Edge cases.** Tag strings that are null/comma-malformed; single-phase users.
- **Phase.** Tab exists today (**keep**); teaser strip = **Phase 1**; deeper chart→ledger linking = **Phase 2**.

### 2.9 Sealed Letters (encrypted letters to future-you)
- **Purpose.** Write a letter that even Jess can't read until a trigger — a **date / phase / anniversary**. Cross-phase letters are a cycle-app-only superpower.
- **IA.** Locked card on the page → a vault surface with tabs: **sealed · opened · threads**. Unsealed letters surface on Today (a `UnsealedLetterCard`) when ready.
- **Components.** `SealedLetters` (locked teaser, demo-now), `SealNewLetter` (compose + choose trigger), `Vault` (sealed/opened/threads), `UnsealedLetterCard` (Today + Journal).
- **States.** None-yet (empty vault invite), sealed (count + next unlock "opens at your next follicular"), ready-to-unseal, opened, error.
- **Data wiring.** Dedicated **`SealedLetters` entity** (separate from `JournalEntries`, by design). Known fields: `body` (text, required), `seal_date` (ISO string, required), `unsealed_at` (nullable), `unseal_seen_at` (nullable), `title` (optional); plus phase/anniversary trigger fields to add. Client-side encryption — "time + phase as the key." Indexes on `user_id` + `seal_date` for the "ready to unseal" query.
- **Interactions.** Seal → choose trigger → confirm (irreversible until trigger). On trigger: a gentle reveal animation; mark `unsealed_at`; `unseal_seen_at` when actually read.
- **Edge cases.** Trigger in the past at creation (block); device/key loss (document the recovery story — privacy vs recoverability tension is an open decision, §6); clock tampering.
- **Phase.** Locked teaser = demo-now; **Sealed Letters v1 = Phase 2** (entity already specced in `lifestyle_sealed_letters_*`).

### 2.10 Burn Mode (the relief valve)
- **Purpose.** Write something that auto-deletes — a pressure-release for things you need to say but not keep.
- **IA.** A quiet option **inside the Composer** (not a top-level surface — it can read dark; keep it understated). Demo places a "Burn this entry" affordance with a `Moon` glyph.
- **Components.** Burn toggle in Composer; burn rows in Ledger show a countdown; a `BurnConfirm`.
- **States.** Composing-to-burn, burning-soon (countdown), burned (gone — no tombstone in exports).
- **Data wiring.** `JournalEntries.is_burn` + `burn_at`; a cleanup job removes expired burns (deletion cascade). Burns are **excluded** from Insights, exports, Doctor handoff, and Cycle Mirror matches.
- **Edge cases.** App closed before burn time (server-side cleanup must still fire); user wants to "un-burn" before expiry (allow within the window only).
- **Phase.** Composer affordance demo-now; full lifecycle = **Phase 2**.

### 2.11 Echo Wall (Q2 — first social step)
- **Purpose.** Anonymous one-liners scoped by phase; you see you're not alone tonight without anyone seeing you.
- **IA.** Its own quiet surface; on the main page only a single honest "Echo Wall — coming" teaser until it ships.
- **Components.** `EchoComing` (teaser, demo-now), later `EchoWall` (feed of fading one-liners, hold-only).
- **Rules (locked).** Anonymous; **hold-only** reactions (no like); fades ~48h; ≤5 posts/day; **Jess scrub** of names/places/dates/substances before anything leaves the device; on-device crisis intercept → Panic Mode + UK resources (Samaritans 116 123, Shout 85258, NHS); 3-strike removal; FLAG_SECURE screenshot block.
- **Data wiring.** New anonymous-post entity (server-side, no author linkage), phase-scoped, TTL/expiry.
- **Phase.** Teaser demo-now; **Echo Wall = Phase 3 (Q2)**.

### 2.12 Witness (Q3) & Phase Twin (Q4) — the far end of the gradient
- **Witness.** One entry handed to one matched sister; she returns one of 4 fixed responses **or passes**. No chat, no screenshot. Writer can cancel ≤2h; receiver opens ≤6h. **Phase 4.**
- **Phase Twin.** 12-day pairing, same phase + life-stage; one shared daily prompt; the twin's answer is blurred until you write; closes at next period day 1. **Phase 5.**
- Both are gated, one-shot, finite, anonymous, Jess-scrubbed, crisis-aware. Neither is an open inbox. Out of scope for the first production passes; specced here so the IA leaves room (a single far-future teaser at most).

### 2.13 Threads, tags, search & filter
- **Threads.** Follow one life-strand across entries (work, money, mum, sleep, body, the-hard-stuff). `JournalEntries.thread`. Surfaces as a filter and as a Cycle Mirror lens. **Phase 1b.**
- **Tags.** Free tags drive Insights "top tags." Parsing must be null/format-safe (historical crash). **Phase 1** (already in Insights).
- **Search & filter.** Filter pills (type/phase/thread) on the Ledger — **add `Affirmation`** (owed fix). Text search across entry bodies (on-device). Filter = **Phase 1**; full-text search = **Phase 2**.

### 2.14 Privacy, on-device & safety rails (cross-cutting, non-negotiable)
- On-device / E2E encryption; Sealed Letters keyed on time+phase. Jess reads only handed entries. On-device **crisis intercept** routes to Panic Mode + UK resources before any share; **Jess scrub** strips identifiers pre-share. Rate limits, screenshot block (FLAG_SECURE), 3-strike pool removal, fade/expiry defaults, deletion cascade. Post-Roe framing: **"visible privacy beats invisible privacy"** — make the lock _visible_ (the footer "Locked to you. Always." + lock glyph). The privacy footer is **Phase 1**; the scrub/intercept machinery lands with the social phases but the _copy/contract_ ships from day one.

### 2.15 Export & Doctor handoff ties
- **Purpose.** Let a woman hand a clean, clinical-register summary to her GP. FemWell already has `DoctorExport` / Doctor-Ready Diary (Planner C4, `generateDoctorReadyDiary`, NICE NG23-aligned, jsPDF A4).
- **Wiring.** Journal entries (mood/phase patterns, _excluding burns and sealed letters_) can feed the Doctor-Ready Diary. Cross-link rather than rebuild. Decide what journal content is eligible (likely: mood/symptom-tagged reflections, never raw private prose without explicit opt-in).
- **Phase.** Cross-link = **Phase 2**; deeper journal→diary synthesis = **Phase 3**.

### 2.16 Notifications, streaks & rhythm
- **Purpose.** Gentle return nudges (morning prompt, dusk reflection, "a letter is ready to open") — **never streak shame** (principle #8). Rhythm shows as cycle-count dots, not a fire streak.
- **Components.** 28-day rhythm dot-grid (in Insights, demo-now); optional local notifications.
- **Phase.** Rhythm grid demo-now; notification scheduling = **Phase 2+** (respect quiet hours / Planner Quiet Mode).

### 2.17 Jess integration (observer, never companion)
- **Role.** Jess **observes, never companions** — the explicit anti-pattern is the 2025 "Vulnerability-Amplifying Interaction Loop" / sycophancy trap. Jess: curates the daily prompt, writes the Cycle Mirror gloss, generates the weekly insight, runs the on-device scrub + crisis intercept before any share, and offers "unpack with Jess" **only on invitation**. **Jess never reads an entry unless it is handed to her.**
- **Wiring.** All Jess LLM touches are cost-bounded + cached + have deterministic fallbacks (the Planner shimmer pattern). No background reading of private entries — ever.
- **Phase.** Prompt + gloss + weekly insight = **Phase 1**; scrub/intercept = with social phases.

---

## 3. PRODUCTION MIGRATION PLAN (Editorial demo → real `Journal.jsx`)

### 3.1 What production `Journal.jsx` has today
- A utilitarian header (plan wants it reframed to phase + cycle day + an italic seasonal line).
- Tabs: **Journal | Insights**. `JournalInsightsTab` is the strong surface (cycle×mood chart, 7-day rhythm, top tags, weekly LLM reflection).
- `JessJournalPrompt` wing (Feature 4) — daily phase prompt card.
- `JotterCard` sticky-note entries (historically carried emoji — flagged for Lucide swap).
- Filter pills (missing `Affirmation`).
- Composer = type picker + type-aware form.
- **Missing from production:** Cycle Mirror, Sealed Letters, Tonight's Reflection, prompt carousel, the whole social gradient.
- The cycle-phase unification fix (`09839c2`) and the `cda3e96` Insights crash guard are already live — build on them.

> **Action item for the build session:** before writing code, pull the real `src/pages/Journal.jsx` + `src/components/.../JournalInsightsTab.jsx` from `origin/main e6f1906` and confirm exact component names/props (the Cowork mount is a partial mirror; the demo lives at `journal_editorial/JournalDemo1.jsx`). This spec names the surfaces; the build confirms the symbols.

### 3.2 What the Editorial demo proves (the design system to port)
From `JournalDemo1.jsx` (demo-only, `/Ideas`):
- **Palette `T`:** paper `#E8E3D5`, paperHi `#F1ECDD`, paperDeep `#D6CDBA`, ink `#15110C` (near-true-black), inkSoft `#463E33`, muted `#8C8273`, gold `#B89A55` (hairline accent only), **crimson `#C0322B` — the single colour pop (the heart)**, plus brand blush/sage.
- **Type roles (4):** `SCRIPT` = Allura/Pinyon (large pointed-pen display voice — phase word, big pull-quotes only); `HAND` = Caveat (legible handwriting for smaller voice/accent/CTA lines); `SERIF` = Cormorant Garamond/Fraunces (**all long-form reading bodies** — Ledger previews, Reader, composer textarea); `UI` = Inter (eyebrows, dates, type-picker chrome).
- **Letterpress depth:** `PRESS` (light lower-edge highlight + dark upper recess + soft drop = ink debossed into cream) and `PRESS_DARK` (inverted, for the dusk card) text-shadows on SCRIPT/HAND.
- **Real paper:** a tileable cotton-paper PNG (procedural seamless grain), base64-embedded, multiplied over cream, with soft top-left light + edge vignette (replaced the earlier `feTurbulence` CSS).
- **Components:** `Heart`, `Paper`, `Eyebrow`, `Rule`, `Script`, `Hand`, `Masthead`, `JessNote`, `Mirror`, `InsightTeaser`, `Ledger`, `Tonight`, `SealedLetters`, `EchoComing`, `Footer`, `Composer`, `Reader`, `Insights`.
- **Composer:** full-screen; 12-type picker; type→prompt seed; serif textarea; Save + "Burn this entry."
- **Reader:** centered modal, serif italic body, gold rule, "page is the screen."
- **Insights modal:** Jess line (HAND) + 28-day rhythm dot-grid + community line.

### 3.3 The migration (what replaces what)
| Production today | Becomes | How |
|---|---|---|
| Utilitarian header | **Masthead** | Phase as issue title + season + cycle day + date + one red heart + hairline rule. |
| `JessJournalPrompt` card | **Jess's note + carousel** | Reuse the Feature-4 wing's data; re-skin to the journal voice; add 3–5 prompt carousel + "Write to this." |
| _(none)_ | **Cycle Mirror** | New section; query same-cycle-day past entries; Jess gloss; "reply to past self." |
| _(none)_ | **Insight teaser strip** | One line that opens the kept Insights tab. |
| `JotterCard` sticky grid | **The Ledger** | Editorial TOC: hanging dates, type stripe, drop-initial on latest; tap → Reader. |
| _(none)_ | **Tonight's Reflection** | Dusk card; coordinate with Planner `TonightCard`. |
| _(none)_ | **Sealed Letters** locked card | Teaser now; vault in Phase 2 on the `SealedLetters` entity. |
| _(none)_ | **Echo Wall "coming"** teaser | Single honest teaser; real surface Phase 3. |
| _(none)_ | **Privacy footer** | "Locked to you. Always." + lock glyph. |
| Filter pills (no Affirmation) | Filter pills **+ Affirmation** | Owed fix. |
| Sticky-note emoji | Lucide/SVG only | Brand sweep (production may already be clean; verify). |
| `JournalInsightsTab` | **kept**, lightly reskinned | Keep the deep tab; add the page teaser. |

### 3.4 Routing & nav
- Production route stays `/Journal` (the consumer page) with the `Journal | Insights` tab control. Composer + Reader are full-screen overlays (z-indexed), not routes, so the bottom nav stays consistent (one unified bottom nav, all viewports).
- The Editorial demo at `/JournalDemo1` (`/Ideas`) **remains** as the reference/review surface until production sign-off, then can be retired or kept as the craft reference.
- **Fonts in production:** the demo injects faces via a runtime `<link>`. In production, load Allura + Pinyon Script + Caveat + Cormorant Garamond through the app's existing font pipeline (the Fraunces/Inter loader) so there's no FOUT and no per-page injection. Keep ink near-black `#15110C`.

### 3.5 Data & function dependencies to confirm/build
- `JournalEntries`: confirm/add fields — `mode`, `thread`, `is_burn`/`burn_at`, `affirmation`, reliable `cycle_day` + `created_at` (backfill nulls).
- `SealedLetters`: create per the existing schema spec (Phase 2).
- Echo/Witness/Twin entities: Phase 3+.
- Jess functions: reuse prompt wing; add Cycle-Mirror-gloss + weekly-insight (cost-bounded, cached, deterministic fallback). Confirm base44 schema changes go via the AI builder (schema viewer is read-only) — but **never type into the web editor for build points**; schema-only prompts, split per the prompt-size lesson.

---

## 4. CRAFT BAR (the aesthetic standard)

**Target feeling.** A private letterpress notebook on warm cotton paper, written in a human hand, with one small red heart. A reviewer should feel: _this is a private, beautiful place that remembers me_ — not "another notes app with a cycle tag."

**Standards (Ms Atelier owns; Ms Verify gates every visual change against the reference IMG_9854 + this bar):**
- **Paper.** Real textured cotton stock (the embedded PNG), multiplied over `#E8E3D5`, soft top-left light, edge vignette. No flat fills. No CSS-only noise as the final answer.
- **Ink.** Near-true-black `#15110C`, **debossed** (PRESS/PRESS_DARK), so it reads pressed _into_ the paper.
- **Type discipline.** SCRIPT (Allura) only for short large voiced moments (phase word, big pull-quote, the heart-line). HAND (Caveat) for smaller voice/accent/CTA lines. **All reading bodies stay SERIF** (Cormorant/Fraunces) at ~66 characters per line, line-height ≥1.5, reading column ≤~580px. Inter for chrome only. Script paragraphs are forbidden (beautiful but tiring).
- **The red heart.** Crimson `#C0322B` is the **only** colour pop; appears only at emotional beats (Jess's signature, a "hold", a save). Scarcity makes it land.
- **Reading craft ("the page is the screen").** Drop-cap on the latest/opened entry; `· · ·` ornaments; pull-quotes with thin rules; generous asymmetric margins; measured (not word-count) pagination; soft slide-fade page turns; `prefers-reduced-motion` respected. Optional reading themes: Cream `#FFFAF5`, Honey/sepia `#F5E6CD`, Plum Night `#2B1E26`.
- **No emoji, ever** — Lucide + custom SVG (the hand-drawn `Heart`, `Lock`, `Moon`, `Feather`).

**⚠ OPEN CRAFT PROBLEM — pen/ink depth not yet solved.** Across sessions d→f we iterated paper and ink three times (Allura hand → 4-layer paper → real-PNG paper + letterpress deboss), each Ms-Verify-approved against the reference, **but Halli is still not fully satisfied with the pen depth** (the sense of a real nib pressing ink into fibre). Treat letterpress/pen-depth as an **ongoing craft item**, not done. Every production pass on the journal voice should re-examine it; do not mark it "solved" without Halli's explicit sign-off on a phone live-walk.

---

## 5. PHASED REVISION ROADMAP

Each phase is independently shippable + verifiable (live-walk before "done"). Heavy iteration is expected within each phase; ship small, review on phone, iterate. **Every visual change: Ms Atelier crafts → Ms Verify checks vs reference/spec BEFORE ship.** Every landed commit gets a STATUS.md SHIP LOG line (commit + shipped/demo + bundle hash + verification).

**Phase 0 — Scaffold the production page (shippable).**
Port the Editorial shell onto production `Journal.jsx` behind the existing tab: Paper + Masthead + privacy Footer + the design tokens/fonts in the production font pipeline. Keep existing entries/Insights working underneath. _Exit:_ production `/Journal` renders the paper + masthead + footer, no regressions, fonts load with no FOUT. Pen-depth check #1.

**Phase 1 — Solo core wired to real data (the big one; likely several sub-passes).**
Ledger (real `JournalEntries`, null-safe sort) · Reader · Composer (Write mode, 12 types incl. **Affirmation filter fix**, type prompts) · Jess's note + carousel (reuse Feature-4 wing) · **Cycle Mirror "On This Day"** (the marquee wiring) · Tonight's Reflection · Insight teaser → kept Insights tab · emoji sweep. _Exit:_ a real user with cycle history sees her own past words mirrored; can write/read/list/delete; no crashes; phone live-walk + Ms Verify pass. Pen-depth check #2.

**Phase 1b — Threads + Guided mode.**
`thread` field + thread filter + thread as a Cycle Mirror lens; Guided composer scaffold. _Exit:_ threads filter the Ledger and lens the Mirror; Guided mode writes real entries.

**Phase 2 — Sealed Letters v1 + Burn lifecycle + One-line/Voice + full-text search + Doctor cross-link.**
Create `SealedLetters` entity (schema-only prompt first) → seal/vault/unseal + Today `UnsealedLetterCard`; Burn auto-delete lifecycle + cleanup job; One-line mode; Voice mode (on-device transcript); on-device full-text search; cross-link entries → Doctor-Ready Diary. _Exit:_ a sealed letter unlocks on trigger; a burn entry disappears on time; voice→transcript works or degrades gracefully. Pen-depth check #3.

**Phase 3 — Echo Wall (Q2, first social step).**
Anonymous phase-scoped one-liners; hold-only; ≤5/day; ~48h fade; **Jess scrub + crisis intercept** machinery; FLAG_SECURE; 3-strike. _Exit:_ a post is scrubbed, appears anonymously to same-phase users, fades, and crisis content is intercepted to UK resources.

**Phase 4 — Witness (Q3).** One entry → one matched sister; 4 fixed responses or pass; cancel/open windows; no chat/screenshot.

**Phase 5 — Phase Twin (Q4).** 12-day same-phase/life-stage pairing; one shared daily prompt; blurred-until-you-write; closes at next period.

_(Paywall/Plus-tier gating is parked until the sale window per standing guidance — do not pre-build it into these phases.)_

---

## 6. OPEN DECISIONS FOR HALLI (consolidated)

The four earlier open questions plus everything surfaced building this spec. Each needs a yes/no or a pick.

1. **Entry body font — serif or script?** Recommendation: **serif for reading, script/hand for voiced lines only** (script paragraphs are beautiful but tiring). Confirm prompts/quotes/phase-word are script/hand and the entries you _read back_ are elegant serif. _(Lead recommendation: confirm serif-for-reading.)_
2. **Which display script?** Demo currently uses **Allura** (authentic connected pointed-pen) for the large voice + **Caveat** for smaller hand lines, after moving off Tangerine. Approve Allura+Caveat, or swap (Parisienne/Petit Formal Script were the earlier alternates).
3. **Social tier in production now?** Default: a **single tasteful "Echo Wall — coming" teaser**, nothing deeper, until Phase 3. Confirm — or hide social entirely for an honestly-solo first ship.
4. **Insights — tab or inline?** Recommendation: **keep the deep Insights tab**, add a one-line teaser on the page. Confirm (vs folding insights into the scroll).
5. **Sealed Letters / Burn / Voice prominence.** Defaults: Burn = quiet option inside the Composer (not top-level); Sealed Letters = locked card → vault; Voice = "coming" until Phase 2. Confirm these stay understated, or raise any to a more prominent surface.
6. **Tonight's Reflection home.** Planner already has a `TonightCard`. Should the dusk reflection live in the Journal, in the Planner, or both with a cross-link? (Avoid two competing "tonight" surfaces.)
7. **Affirmation + emoji cleanup timing.** Fold the owed `Affirmation` filter fix + any remaining emoji sweep into Phase 0/1 of this build? _(Lead recommendation: yes, Phase 1.)_
8. **Pen/ink depth — when is it "good enough"?** It's an open craft problem you're not yet satisfied with. Do we keep iterating it inside Phase 0/1, or freeze the current treatment and revisit before the sale demo? Need a phone live-walk sign-off to call it done.
9. **Sealed Letters recovery story.** Client-side encryption keyed on time+phase means a lost device/key could mean lost letters. Pure-privacy (no recovery) vs a recoverable escrow — which side of the trade? (Affects Phase 2 design.)
10. **Voice audio retention.** Store only the on-device transcript, or keep the audio blob (on-device only)? Privacy principle #1 leans transcript-only unless you want playback.
11. **Demo retirement.** Once production sign-off lands, keep `/JournalDemo1` as the craft reference or retire it from `/Ideas`?

---

_End of spec. Build per §5, confirm §6 with Halli first, gate every visual change through Ms Atelier → Ms Verify, and update STATUS.md per the baton rule on every landed commit._

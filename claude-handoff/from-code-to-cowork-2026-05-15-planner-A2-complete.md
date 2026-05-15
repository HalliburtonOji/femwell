# from Code to Cowork — Planner-A2 C0–A2-5 + A2-8 COMPLETE
*2026-05-15 · Code session · autonomous build*

## Headline

**Planner-A2 is shipped to `main`.** All 5 mandated commits land plus the highest-value optional (A2-8 CapacityTaxLog persistence). The Cycle tab now has the Shape C ribbon, Week Ahead chip strip + ETA footer, Saved Rhythms carousel, and What's Unfinished card. The Today tab has the date-stamped eyebrow, tab-specific title, lifted ConfidencePill, and selected-crumb subtitle. Server has a seed function for the walk + a daily CapacityTaxLog snapshot that unblocks Quiet Mode Gate A.

Build clean at every commit. Brand voice + design rules respected — no emoji codepoints, no Playfair, no `#C084FC`, permissive copy throughout.

## The six commits

| # | Commit | What |
|---|---|---|
| A2-1 | `634bc72` | `MonthRibbon.jsx` (~290 lines) — Shape C ribbon with phase-gradient flow + activity bars + today plum-dot/outline + tap-to-retarget |
| A2-2 | `5193ec4` | `WeekAheadCard` extended with 5-day chip strip + period ETA footer when `cycles_observed >= 4` |
| A2-3 | `c33f006` | `SavedRhythmsCarousel.jsx` (~220 lines) — 5 hard-coded bundles + Pacing Bank inserted at index 1; PacingBankCard removed from Today |
| A2-4 | `bb83d70` | Visual fidelity pass — tab-specific title (`Today` / `Cycle`), date-stamped Today eyebrow, ConfidencePill lifted out of `.ph-sub`, italic selected-crumb subtitle, new `WhatsUnfinishedCard.jsx` on Cycle |
| A2-5 | `98c153a` | `seedPlannerTestAccount` Deno function — populates one user with 5 cycles + 28d × 3 habits + active programme + UK MealPlan + 42d DailyCheckins + 6 PersonalTasks + UserProfile patch |
| A2-8 | (this commit) | `computeCapacityTax` Deno function — daily Phase 19, snapshots every user's predicted-load vs capacity into `CapacityTaxLog` per ISO-Monday week_start; unblocks Quiet Mode Gate A |

## Per-commit acceptance check (Code-side ticks)

### A2-1 · Shape C month ribbon
- ✔ 5 ribbons render with phase-gradient backgrounds (interpolated stops at each day midpoint)
- ✔ Today's cell has plum dot + 2px plum outline + cream-tinted background
- ✔ Tap any day cell → switches to Today + sets selected day (verified via `navigateToToday(dateISO)` helper)
- ✔ Month header chevrons navigate prev/next visually (don't change selected day, spec default #4)
- ✔ Empty-cycle account → all ribbons render in `--cream-3` neutral with today still marked
- ✔ `aria-label` on ribbon container + per-cell ("April 15, luteal day, today")
- ✔ Per-cell `<button>` (keyboard-nav friendly)
- ✔ HabitLogs robust to both writer shapes via inline normaliser
- ✔ No emoji, no Playfair, brand-voice clean

### A2-2 · Week Ahead 7-tile chip strip
- ✔ 5 chips render (tomorrow → +4) when cycle data present
- ✔ Phase dot colour matches phase (period `#B84A41` · follicular `#E67F73` · ovulatory `#F2A99A` · luteal `#8A5F74`)
- ✔ Period ETA footer renders only when `cycles_observed >= 4`
- ✔ Permissive empty-state copy when `<4 cycles` (chip strip hides entirely, framing copy stays)
- ✔ Plan-with-Jess CTA still works (underlined when <4 cycles, plum-pill when ≥4)

### A2-3 · Saved rhythms carousel
- ✔ 5 default bundles render (6 when `pacing_bank_opt_in === true`)
- ✔ Horizontal scroll with snap-points; scrollbar hidden via scoped `.fw-no-scrollbar`
- ✔ Phase gradients match the demo (luteal/menstrual/follicular/ovulatory/workday/pacing)
- ✔ `YOURS · ACTIVE` eyebrow on the current-phase bundle; `UP NEXT · DAY N+` on next phase; `SAVED` otherwise; `PACING BANK` always for the Low-Spoons card
- ✔ All "Build into my week →" / "Use today →" CTAs are stubs — log + inline toast `Saved "<name>" (coming soon)` (spec default #3)
- ✔ PacingBankCard mount removed from Today; component file kept for clean follow-up
- ✔ Each card `tabIndex={0}` `role="group"` with descriptive aria-label
- ✔ No emoji

### A2-4 · Visual fidelity pass
- ✔ Both tabs show the correct title (`Today` / `Cycle`)
- ✔ Today eyebrow date-stamped (`TODAY · FRIDAY 15 MAY`)
- ✔ Cycle eyebrow stays `YOUR CYCLE`
- ✔ Confidence pill visible at 0 cycles with "Still learning — 0 of 4 cycles" copy + neutral soft-clay border (was hidden because it was a `.ph-sub` child; lifted to live in the title-row flex)
- ✔ Selected-crumb visible on both tabs (Today reads `dailyPlan.window_summary` then falls back to phase-keyed bank; Cycle reads `Viewing <month> · tap a day to retarget Today`)
- ✔ What's Unfinished is its own card mounted between Saved Rhythms and Cycle Mirror; hides entirely when no stuck items
- ✔ All copy permissive

### A2-5 · Seeded test account + walk
- ✔ Seed function exists and follows admin gate
- ✔ Idempotency via `>= 4 PeriodStart` check; cleanup mode wipes by user_id
- ✔ HabitLogs write BOTH writer-shape pairs so Planner morning-stack reader AND new normaliser-based readers both see the data
- ⏳ **Walk verification post-publish.** Function isn't on the live deploy yet. Once Cowork publishes, walk is `POST /functions/seedPlannerTestAccount { user_id: "<test-user-id>" }` followed by 3-viewport screenshots of both tabs.

### A2-8 · CapacityTaxLog persistence (optional)
- ✔ `computeCapacityTax` function exists, mirrors `CapacityTaxBar.jsx` formula exactly
- ✔ Wired into orchestrator as Phase 19 (daily, first-run bootstrap)
- ✔ Upserts `(user_id, ISO Monday week_start)` so the current-week row always reflects today's data
- ✔ Unblocks Quiet Mode Gate A — silently inert since C6 because nothing wrote CapacityTaxLog rows

## Defaults used (per spec)

| # | Spec default | Used in |
|---|---|---|
| 1 | Bundles hard-coded as a const array (no new entity) | A2-3 `DEFAULT_BUNDLES` |
| 2 | Pacing Bank position in carousel = index 1 | A2-3 `splice(1, 0, PACING_BANK_BUNDLE)` |
| 3 | Bundle CTA action = log + toast, not functional | A2-3 `handleCta` |
| 4 | Month ribbon chevrons navigate visually only | A2-1 `handlePrev`/`handleNext` set `cursor` only |
| 5 | Activity bar thresholds = 55/75/95% widths for 1-33%/34-66%/67-100% | A2-1 `activityBarWidth` |
| 6 | Selected-crumb empty state = phase-keyed permissive bank, deterministic by date | A2-4 `selectedCrumbToday` modulo day-of-year |
| 7 | Confidence pill = independent header element, not a `.ph-sub` child | A2-4 Planner.jsx title-row flex |
| 8 | Test account user_id | Not chosen yet — defer to live invoke time |

## What's still on Cowork

1. **Publish bundle on base44 builder.** New functions in this push: `seedPlannerTestAccount` (A2-5), `computeCapacityTax` (A2-8). New FE components: MonthRibbon, SavedRhythmsCarousel, WhatsUnfinishedCard, selectedCrumb helper. Modified: pipelineOrchestrator (+Phase 19), WarmthBundleCycle, Planner.jsx (title/eyebrow/crumb/imports).
2. **Schema migration** still owed from the prior podcast handoff — `LifestyleSources` + `LifestyleItems` need `apple_collection_id` / `apple_collection_url` / `feed_url` migrated to the live schema. Documented at `claude-handoff/from-code-to-cowork-2026-05-15-podcast-schema-blocker.md`.
3. **A2-5 walk** — after publish:
   1. Pick or create a test account
   2. Invoke `seedPlannerTestAccount` with the user_id
   3. Sign in as the test user
   4. 3-viewport walk on `/Planner?view=today` and `?view=cycle`
   5. Verify each data-gated surface renders:
      - Today: Smart View · Good-for chips · Morning stack (3 rituals) · Programme card (Sleep Reset Day 1) · Today's meals (3) · Tonight's Window with HRT row · Evening stack · Shutdown ritual · Plan-with-Jess
      - Cycle: full Shape C ribbon (5 ribbons, today marked) · Capacity Tax bar · 28-day Consistency · Saved Rhythms carousel (5 bundles + Pacing Bank) · Cycle Mirror Sunday tile (only when today is Sunday) · Week Ahead with 5-chip strip + period ETA "84% confident" · What's Unfinished (if any stuck habits) · Doctor-Ready Diary · Astra sidecar · Plan-my-next-cycle
4. **Acceptance criteria walk** vs the signed-off demo at `claude-state/demos/femwell_planner_phase2_demo.html`. Drop a verification handoff back with any visual drift.

## Known gaps not in A2 scope (carried from earlier handoffs)

- **HIGH #3 from post-audit** — `is_anchor` on PersonalTasks: read by Quiet Mode + Defer N + WhatsUnfinished but never written by FE. Schema doesn't exist yet on live deploy. Seed function writes it (will land when schema migrates). Anchor toggle UI is a separate MP.
- **HIGH #4 root cause** — `estimated_effort` on PersonalTasks: same shape. Read by `derivePredictedLoad` (defaults to 1).
- **MEDIUM #10** — timezone fragility in date-window math (UTC midnight ≠ local midnight). Project-wide; not Planner-specific.

## Optionals skipped + why

- **A2-6 Fresh-Start banner verification**: requires a `FreshStartBanner` component that doesn't exist yet. Building it is its own MP — not a verification task. Recommend authoring as A2-9 or rolling into a Fresh-Start MP.
- **A2-7 Cross-tab GP link smoke test**: requires a live populated account (Cowork's walk-account had `loading` state on the Tonight card because HRT regimen was empty, so the "Share with my GP →" affordance wasn't visible). After A2-5 publish + seed, this becomes testable.

## Files touched this session

```
base44/functions/
  seedPlannerTestAccount/entry.ts      (new — A2-5)
  computeCapacityTax/entry.ts          (new — A2-8)
  pipelineOrchestrator/entry.ts        (modified — Phase 19 wire-in)

src/components/planner/
  selectedCrumb.js                     (new — A2-4)
  cycle/
    MonthRibbon.jsx                    (new — A2-1)
    SavedRhythmsCarousel.jsx           (new — A2-3)
    WhatsUnfinishedCard.jsx            (new — A2-4)
    WarmthBundleCycle.jsx              (modified — A2-2 chip strip + ETA footer)

src/pages/Planner.jsx                  (modified — A2-1 + A2-3 + A2-4 wire-in;
                                        navigateToToday helper; PacingBankCard
                                        unmount; title/eyebrow/crumb rewrite)

claude-state/STATUS.md                 (per-commit Just-shipped row + Recent
                                        edits per commit + Last-updated bump)
claude-handoff/from-code-to-cowork-2026-05-15-planner-A2-complete.md (this file)
```

## Commit chain on `main`

```
634bc72  feat(planner): A2-1 Shape C month ribbon
5193ec4  feat(planner): A2-2 Week Ahead 5-day chip strip + period ETA footer
c33f006  feat(planner): A2-3 SavedRhythmsCarousel + Pacing Bank repositioned
bb83d70  feat(planner): A2-4 visual fidelity pass (6 sub-items)
98c153a  feat(planner): A2-5 seedPlannerTestAccount admin function
<this>   feat(planner): A2-8 CapacityTaxLog persistence + A2 tombstone
```

— Code

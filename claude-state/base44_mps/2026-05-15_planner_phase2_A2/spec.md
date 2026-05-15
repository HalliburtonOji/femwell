# Planner Phase 2 — A2 spec (close the gap to the signed-off demo)

**Authored 2026-05-15 by Cowork (Ms Lead Manager + Ms Atelier hats).** Planner-A C0–C9 shipped the skeleton + most of the new Phase-2 mechanics. After Halli's verification walk on `femwells.com/Planner` two thirds of the visual still reads as stub or incomplete vs the signed-off two-tab demo at `claude-state/demos/femwell_planner_phase2_demo.html`. This spec closes the gap.

**Canvas (locked):** `claude-state/demos/femwell_planner_phase2_demo.html` — the same two-phone demo Halli signed off. Don't deviate.

**Build mandate (binding for this session):** autonomous build, A2-1 → A2-5, push the whole chain, drop one comprehensive tombstone at the end. Same protocol as A1 (`claude-handoff/from-cowork-to-code-2026-05-14-planner-build-all-autonomous.md`). Defaults documented for any decision point so Code never blocks waiting for Halli.

---

## What landed in A1 (so we don't redo it)

| Surface | Tab | Status |
|---|---|---|
| Segmented control + `?view=` routing + localStorage persistence | both | ✅ shipped C0 |
| `CapacityTaxLog` entity + `UserProfile` additions + `migratePlannerPhase2` | — | ✅ shipped C1 |
| Smart View card + 5-state chip row + good-for chips with info icon | Today | ✅ shipped C5 |
| Capacity Tax bar + Defer N pill | Cycle | ✅ shipped C3 |
| Doctor-Ready Diary with 4/6/8/12-week window + jsPDF export | Cycle | ✅ shipped C4 |
| Quiet Mode auto + banner + Undo + day-list filter | both | ✅ shipped C6 |
| Reframe shimmer (gpt_5_mini, 24h cache, ≥3 day stuck gate) | Today | ✅ shipped C7 |
| 28-day Consistency card + period-week auto-freeze | Cycle | ✅ shipped C7 |
| Cycle Mirror Sunday tile (Sunday + ≥4 cycles gate) | Cycle | ✅ shipped C8 |
| TonightCard + ShutdownRitualCard + PacingBankCard | Today | ✅ shipped C9 |
| WeekAheadCard (framing + period ETA + Plan-with-Jess CTA) | Cycle | ✅ shipped C9 |
| AstraSidecar + PlanMyNextCycleCTA | Cycle | ✅ shipped C9 |
| Post-audit fixes (SDK filter ops, HabitLogs field normaliser, shimmer cost gate, a11y) | — | ✅ shipped `2ecdefb` |

---

## What A2 ships — 5 commits

| # | Commit | Build | Why |
|---|---|---|---|
| **A2-1** | **Shape C month ribbon** | The signature "snake-like calendar" — 5 weekly ribbons with phase-gradient backgrounds, day cells with activity bars, today highlighted, tap-to-retarget Today tab. Replaces the C0 "Coming soon" stub. | The headline visual of the whole Planner. Halli explicitly flagged this. Without it the Cycle tab reads as 40% complete. |
| **A2-2** | **Week Ahead 7-tile chip strip** | Extend `WeekAheadCard.jsx` with the 5-day forecast chip row above the Plan-with-Jess CTA — day-of-week label, day number in Fraunces, phase-coloured dot. Period ETA footer with confidence. | Current card reads as a stub. The chip strip is the meat of the surface. |
| **A2-3** | **Saved rhythms carousel + Pacing Bank inside it** | New `SavedRhythmsCarousel.jsx` on Cycle tab. Horizontal scroll of 5+ bundles (Luteal Softness · Period Rest · Follicular Focus · Ovulation Power · Workday Stack + Pacing Bank Low Spoons when opt-in). Each card has phase-gradient background, eyebrow, Fraunces name, count line, "Build into my week →" CTA. **Move `PacingBankCard` out of Today** into the carousel. | Reusable craft surface; lifts both tabs visually; consolidates Pacing Bank into the bundles family where it belongs visually. |
| **A2-4** | **Visual fidelity pass** | (a) Page title changes per tab — "Today" / "Cycle" not both "Planner". (b) Today eyebrow becomes date-stamped — "TODAY · FRIDAY 15 MAY". (c) Cycle eyebrow stays "YOUR CYCLE" but Cycle page title becomes "Cycle". (d) Confidence pill renders on empty account with "Still learning · 0 of 4 cycles" + neutral border (not hidden). (e) Selected-crumb subtitles render on both tabs. (f) Extract What's Unfinished from Week Ahead into its own card. | Multiple small visual deviations from the demo. Done together so the visual settles in one commit. |
| **A2-5** | **Seeded test account + data-gated walk** | New `seedPlannerTestAccount/entry.ts` admin-gated function. Populates a chosen user with 4 cycles of `CycleEvents`, 28 days of `HabitLogs` across 3 ritual habits, an active `Programme`, a 7-day `MealPlan`, an `hrt_regimen`, 6 weeks of `DailyCheckins`. Idempotent + cleanup-mode. Code invokes via CLI on a test account, walks all 9 data-gated surfaces (Morning stack, Programme, Meals, Evening stack, Plan-with-Jess Today, Tonight HRT row, Cycle Mirror Sunday tile, Quiet Mode banner, RitualReframeShimmer), fixes anything that doesn't render. Tombstone documents which surfaces rendered cleanly + which needed fixes. | The only way to verify Planner-A1 actually works for a populated user (right now the live state is sparse because the test account has no data). |

**Optional follow-ups (do these if A2-1 through A2-5 land with time left in the session — drop a tombstone note if skipped):**

- **A2-6** — Fresh-Start banner verification. Confirm `FreshStartBanner` triggers on cycle-day-1 OR fresh-Monday OR post-illness (per spec_v2 §"What it unlocks"). If not wired, build the gate.
- **A2-7** — Cross-tab GP link smoke test. From Today's Tonight card "Share with my GP →" → should navigate to `?view=cycle&scrollTo=doctor` and scroll Doctor-Ready Diary into view. Capture in the tombstone.
- **A2-8** — C3.5 CapacityTaxLog persistence. Code's A1 tombstone flagged this — a small Deno function that snapshots the weekly captax pct into `CapacityTaxLog` rows. Makes Quiet Mode's Gate A live (currently inert).

---

## Per-commit detail

### A2-1 · Shape C month ribbon

**Component:** `src/components/planner/cycle/MonthRibbon.jsx` (~250 lines).

**Mounts:** Cycle tab, replaces the current `<div>` containing "Month ribbon" + "The wider arc of your cycle will live here. Coming soon." at the `monthRibbon` anchor.

**Visual reference:** demo HTML lines for the `.ribbons` block. Key CSS already in the demo (the Code base may already have it under `src/components/planner/cycle/`; if not, import the styles from the canvas demo):

```html
<div class="month-head">
  <div>
    <div class="mh-title">April 2026</div>
    <div class="mh-meta">luteal week · period week of 27</div>
  </div>
  <div>
    <span class="mh-chev">‹</span><span class="mh-chev">›</span>
  </div>
</div>
<div class="weekday-row">
  <div class="wd">M</div><div class="wd">T</div><div class="wd">W</div><div class="wd">T</div><div class="wd">F</div><div class="wd">S</div><div class="wd">S</div>
</div>
<div class="ribbons">
  <div class="ribbon w1">
    <div class="rcell off"><div class="rday">30</div></div>
    ...
  </div>
  <div class="ribbon w2">...</div>
  <div class="ribbon w3">...</div>
  <div class="ribbon w4">...</div>
  <div class="ribbon w5">...</div>
</div>
```

**Structure:**

1. **Month header** — Fraunces month + year + chevrons (‹ ›). Chevrons navigate prev/next month (state inside the component).
2. **Weekday row** — M T W T F S S labels, Inter, plum-mute, letterspaced.
3. **5 ribbons** — one per ISO-week of the month. Each ribbon is a `display: grid; grid-template-columns: repeat(7, 1fr); min-height: 72px;` with rounded corners.
4. **Ribbon background** — linear-gradient that flows the phase colours across the 7 cells. Use the dominant phase per day, with smooth transitions:
   - period → `var(--period)` `#B84A41`
   - follicular → `var(--follicular)` `#E67F73`
   - ovulatory → `var(--ovulatory)` `#F2A99A`
   - luteal → `var(--luteal)` `#8A5F74`
   - off-month days → `var(--cream-3)` `#F0E5D8`
5. **Day cells** — each cell has `.rday` (day number, Fraunces or Inter bold, white on coloured background, plum-2 at 35% opacity on off-month days). Below the day number, an `.rbar` activity bar — width 55% / 75% / 95% based on `habitsCompletedThatDay / totalHabits` ratio.
6. **Today** — `.rcell.is-today` gets a 5×5 plum dot top-right + `.rcell.sel-today` outline (2px plum, offset -1px).
7. **Tap interaction** — clicking any day cell calls the cross-tab `navigateToToday(dateISO)` helper from C0 plumbing; switches view to Today and retargets that date.

**Phase derivation:**

For each day in the rendered month, compute `phaseForDate(date, profile)`:
1. Read latest `PeriodStart` event from `CycleEvents`.
2. Compute days-since-start (modulo cycle length from `cycle_prediction_meta` or default 28).
3. Map to phase:
   - days 0–4 → menstrual (period)
   - days 5–12 → follicular
   - days 13–16 → ovulatory
   - days 17–end → luteal
4. Fall back to neutral `--cream-3` for users with no cycle data (entire month renders in neutral; today still gets the dot).

**Data sources:**

- `CycleEvents` filtered by `user_id` — for phase derivation
- `HabitLogs` filtered by `user_id` and date range — for activity bar widths (aggregate completed/total per day)
- `UserProfile.cycle_prediction_meta` — for cycle length fallback

**Performance:**

- Render-time only — no async fetches inside the component, lift data fetching to `Planner.jsx` like the other Cycle-tab components.
- Memoize `monthDays` + `phaseByDay` + `activityByDay` with `useMemo` keyed off `(year, month, cycleEvents, habitLogs)`.

**Acceptance:**

- 5 ribbons render with phase-gradient backgrounds
- Today's cell has plum dot + outline (visually distinct)
- Tap any day cell → switches to Today tab at that date (verify via URL change + selected day-chip)
- Month header chevrons navigate to prev/next month
- On a no-cycle account, ribbons render in neutral `--cream-3` with today still marked
- aria-label on the ribbon container: "Cycle ribbon for April 2026. Tap any day to view in Today."
- Keyboard nav: each day cell is a `<button>` with `aria-label` "April 15, luteal day 18"
- No emoji, no Playfair, brand-voice clean

---

### A2-2 · Week Ahead 7-tile chip strip

**Component:** Extend `src/components/planner/cycle/WeekAheadCard.jsx`.

**Insert above the existing "Plan with Jess →" CTA:**

```html
<div class="ahead-row">
  <!-- 5 chips for the next 5 days starting tomorrow -->
  <div class="ahead-chip">
    <div class="ac-day">MON</div>
    <div class="ac-num">20</div>
    <div class="ac-phase l"></div>  <!-- phase dot, .p .f .o .l classes -->
  </div>
  ...
</div>
<!-- footer row below ahead-row, above Jess CTA -->
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:9px;padding-top:9px;border-top:1px solid rgba(74,42,58,0.06);">
  <div style="font-size:10px;color:var(--plum-mute);letter-spacing:0.04em;">
    Period ETA <strong style="color:var(--plum);">Mon 27</strong> · ± 1 day · 84% confident
  </div>
  <div style="font-size:10.5px;padding:5px 11px;border-radius:9999px;background:var(--plum);color:var(--cream);font-weight:700;letter-spacing:0.04em;">
    Plan with Jess →
  </div>
</div>
```

**Logic:**

- 5 chips: `tomorrow`, `+1`, `+2`, `+3`, `+4` days.
- Each chip's `.ac-day` is the day-of-week (Mon/Tue/Wed), `.ac-num` is the day number, `.ac-phase` is a 5px dot coloured by phase.
- Phase dot class: `.p` (period) / `.f` (follicular) / `.o` (ovulatory) / `.l` (luteal).
- Period ETA footer:
  - When `cycles_observed >= 4`: render "Period ETA Mon 27 · ± N day · NN% confident" using `cycle_prediction_meta.next_period_eta`, `eta_window_days`, `confidence_pct`.
  - When `cycles_observed < 4`: render permissive "Logging a couple more cycles will tighten next-period estimates." (current copy stays — works as the empty state.)

**Empty state:**

If `cycle_prediction_meta` is null or `next_period_eta` is null: hide the chip strip entirely, keep the current framing copy + Plan-with-Jess CTA. Don't show phase dots without data.

**Acceptance:**

- 5+ chips render when cycle data exists
- Phase dot colour matches phase
- Period ETA shown only when ≥4 cycles
- Permissive empty state when <4 cycles
- Plan-with-Jess CTA still works

---

### A2-3 · Saved rhythms carousel

**Component:** New `src/components/planner/cycle/SavedRhythmsCarousel.jsx`.

**Mounts:** Cycle tab, between 28-day Consistency card and Week Ahead card.

**Visual reference:** demo `.bundles` block:

```html
<div class="divider">
  <div class="div-title">Saved rhythms</div>
  <div class="div-meta">SWIPE →</div>
</div>
<div class="bundles">
  <div class="bundle luteal">
    <div class="bundle-eyebrow">YOURS · ACTIVE</div>
    <div class="bundle-name">Luteal Softness</div>
    <div class="bundle-count">6 rituals · day 18</div>
    <span class="bundle-cta">Build into my week →</span>
  </div>
  <div class="bundle pacing">
    <div class="bundle-eyebrow">ⓟ2 PACING BANK</div>
    <div class="bundle-name">Low Spoons day</div>
    <div class="bundle-count">2 anchors · rest deferred</div>
    <span class="bundle-cta">Use today →</span>
  </div>
  <div class="bundle period">
    <div class="bundle-eyebrow">UP NEXT · DAY 27</div>
    <div class="bundle-name">Period Rest Day</div>
    <div class="bundle-count">4 rituals · warming</div>
    <span class="bundle-cta">Build into week →</span>
  </div>
  <div class="bundle follicular">
    <div class="bundle-eyebrow">SAVED</div>
    <div class="bundle-name">Follicular Focus</div>
    <div class="bundle-count">5 rituals · deep work</div>
    <span class="bundle-cta">Build into week →</span>
  </div>
  <div class="bundle ovulatory">
    <div class="bundle-eyebrow">SAVED</div>
    <div class="bundle-name">Ovulation Power</div>
    <div class="bundle-count">5 rituals · peak days</div>
    <span class="bundle-cta">Build into week →</span>
  </div>
</div>
```

**Bundle gradients (use the demo CSS):**

- `.bundle.luteal` — gradient luteal → `#6C4F62`, cream text
- `.bundle.period` — gradient period → `#9B3E37`, cream text
- `.bundle.follicular` — gradient follicular → `#C96557`, cream text
- `.bundle.ovulatory` — gradient ovulatory → `#DF8978`, plum text
- `.bundle.workday` — gradient `#C9A95C` → `#A48740`, cream text
- `.bundle.pacing` — gradient `#5F8A85` → `#3F6864`, cream text (teal sage)

**Data approach (defer the entity question):**

For first ship: **hard-code 5 default bundles as a const array** inside the component. No new entity. State (active/up-next/saved) derived from current cycle phase:

```js
const DEFAULT_BUNDLES = [
  { id: 'luteal',     name: 'Luteal Softness',   count: '6 rituals',          phase: 'luteal',     order: 0 },
  { id: 'period',     name: 'Period Rest Day',   count: '4 rituals · warming', phase: 'menstrual',  order: 1 },
  { id: 'follicular', name: 'Follicular Focus',  count: '5 rituals · deep work', phase: 'follicular', order: 2 },
  { id: 'ovulatory',  name: 'Ovulation Power',   count: '5 rituals · peak days', phase: 'ovulatory',  order: 3 },
  { id: 'workday',    name: 'Workday Stack',     count: '4 rituals · any phase', phase: 'any',        order: 4 },
];
```

Eyebrow logic:
- If `bundle.phase === currentPhase` → "YOURS · ACTIVE"
- Else if `bundle.phase === nextPhase` → "UP NEXT · DAY N"
- Else → "SAVED"

**Pacing Bank Low Spoons** — insert at index 1 in the array only when `UserProfile.pacing_bank_opt_in === true`. Eyebrow always "ⓟ2 PACING BANK", CTA "Use today →" (different action — sets today's day-list to anchor-only mode).

**CTA action:**

For first ship, all "Build into my week →" CTAs are stubs — log to console + show a toast "Bundle saved (coming soon)". The full Build-into-week flow is a follow-up MP. The CTAs being non-functional is acceptable because the visual surface is the headline.

**Move PacingBankCard from Today:**

Remove the `PacingBankCard` mount from `WarmthBundleToday.jsx`. The component file can stay for now if you want a follow-up to delete it cleanly; just unmount it. The Pacing Bank surface now lives only inside this carousel.

**Carousel behaviour:**

- Horizontal scroll (`overflow-x: auto`).
- `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` per demo.
- Edge padding `0 -18px / 0 18px 6px` so the first card aligns with the page content edge.
- On touch devices: native momentum scroll.
- On desktop: keyboard arrow keys move focus card-to-card (`tabindex="0"` on each `.bundle`).

**Acceptance:**

- 5 bundles render (6 when Pacing Bank opt-in)
- Horizontal scroll works
- Phase gradients match the demo
- "YOURS · ACTIVE" eyebrow on the current-phase bundle
- "Build into my week →" CTAs log + toast (no-op for now)
- PacingBankCard no longer mounts on Today
- aria-label on the carousel: "Saved cycle rhythms, swipe horizontally"
- No emoji

---

### A2-4 · Visual fidelity pass

**Six small edits in one commit:**

1. **Page title per tab.** In `Planner.jsx`, the `<h1 class="ph-title">` should resolve based on `view`:
   - `view === 'today'` → "Today"
   - `view === 'cycle'` → "Cycle"

2. **Today page eyebrow.** Replace "YOUR WEEK" with a date-stamped eyebrow when `view === 'today'`:
   ```
   TODAY · FRIDAY 15 MAY
   ```
   Format: `format(new Date(), "EEEE d MMMM").toUpperCase()` with a "TODAY · " prefix.

3. **Cycle page eyebrow.** Stays "YOUR CYCLE" — no change.

4. **Confidence pill renders on empty account.** Update `ConfidencePill.jsx`:
   - When `cycles_observed === 0` OR `cycle_prediction_meta` is null → render "Still learning · 0 of 4 cycles" with neutral soft-clay border (per Code's existing C2 logic for <4 cycles, just extend to 0).
   - Currently the pill hides because it attaches to `.ph-sub` which doesn't render without phase data. Fix: mount the pill independently in the header, not as a `.ph-sub` child.

5. **Selected-crumb subtitle.** Under the page title + confidence pill, add a small italic plum-mute line:
   - Today: read `dailyPlan?.window_summary` if present, else generate from current phase ("A soft start · steady afternoon · earlier bedtime tonight" for luteal; one line per phase keyed off `phaseForToday`). Use a permissive bank of 4 lines per phase.
   - Cycle: "Viewing {monthName} · tap a day to retarget Today"

6. **Extract What's Unfinished from Week Ahead.** Currently the stuck-items list is in Week Ahead (or rolled into it). Split it into its own `WhatsUnfinishedCard.jsx` mounted between Week Ahead and Saved Rhythms. Existing reframe shimmer logic stays. Empty state: hide the card entirely if no stuck items.

**Acceptance:**

- Both tabs show the correct title ("Today" / "Cycle")
- Today eyebrow date-stamped
- Confidence pill visible at 0 cycles with "Still learning" copy
- Selected crumb visible on both tabs
- What's Unfinished is its own card
- All copy permissive

---

### A2-5 · Seeded test account + data-gated walk

**New function:** `base44/functions/seedPlannerTestAccount/entry.ts`

Admin-gated. Accepts `{ user_id: string, cleanup?: boolean }`. Modes:
- Default: populates the user with a known-good seed
- `cleanup: true`: deletes seeded rows (for re-running)

**What it seeds:**

| Entity | Rows | Notes |
|---|---|---|
| `CycleEvents` | 5 `PeriodStart` events spread 26-29 days apart over the past 130 days + 5 matching `PeriodEnd` events 4-5 days later | Gives `cycles_observed = 4` for the period ETA + confidence pill |
| `HabitLogs` | 28 days of logs across 3 ritual habits ("Morning walk", "Drink water", "5-minute reading") with realistic 70-80% completion rate | Triggers Consistency card + good-for chips + Cycle Mirror |
| `Programmes` (active) | 1 active `Programme` "Sleep Reset" with `current_day: 1`, `total_days: 7` | Triggers Programme card on Today |
| `MealPlans` | 7 days of meal plans (breakfast/lunch/dinner) — UK-local meals (porridge oats, lentil & chicken stew, roasted salmon) | Triggers Today's meals row |
| `DailyCheckins` | 42 days of mood + energy scores (4-5 range, occasionally dipping to 2-3 to test Quiet Mode Gate B) | Triggers Quiet Mode evaluation + Doctor-Ready Diary mood pages |
| `UserProfile.hrt_regimen` | `{ active: true, method: 'patch', evening_dose: 'Estradiol 50mcg', reminder_time: '21:00' }` | Triggers HRT row in Tonight |
| `UserProfile.cycle_prediction_meta` | `{ confidence_pct: 84, cycles_observed: 4, next_period_eta: '<future date>', eta_window_days: 1 }` | Triggers full confidence pill state + Week Ahead chip strip |
| `UserProfile.pacing_bank_opt_in` | `true` | Triggers Pacing Bank inside Saved Rhythms |
| `PersonalTasks` | 6 tasks for today (mix of `is_anchor: true` and `false`) | Triggers Defer N pill, day-list rendering |

**Idempotency:** before seeding, check if the user already has `CycleEvents` count >= 4 — if so, skip seed (return existing state). `cleanup: true` mode wipes the seeded rows.

**Walk after seeding:**

Code creates a test account (or uses an existing test account Halli provides), invokes the seed, then takes screenshots of:
- Today tab — should show: Smart View, Good-for chips, Morning stack (3 rituals), Programme card (Sleep Reset Day 1), Today's meals row (3 meals), Tonight's Window with HRT row, Evening stack, Shutdown ritual, Plan-with-Jess
- Cycle tab — should show: full Shape C ribbon (5 ribbons), Capacity Tax bar, 28-day Consistency, Saved Rhythms carousel (5 bundles + Pacing Bank), Week Ahead with 5-chip strip + period ETA "84% confident", What's Unfinished (if any stuck habits), Doctor-Ready Diary, Astra sidecar, Plan-my-next-cycle

Document each render in the tombstone with a one-line ✔ or ✗.

**Acceptance:**

- Seed function exists and runs idempotently
- All 9 data-gated surfaces from the verification walk render correctly with seeded data
- Screenshots logged in the tombstone
- Any surfaces that don't render get a focused fix in this commit

---

## Brand-voice guardrails (binding, same as A1)

- Permissive language: "often", "tends to" — not "should", "must"
- Lead with the user's own data, not population averages
- No body-negative framing — "softer day" not "low day"
- Invitations not imperatives
- Confidence-honest predictions
- No emoji codepoints anywhere
- Lucide icons + SVG glyphs only
- Fraunces for serif, Inter for UI — no Playfair Display literals
- UK English throughout — no Naija-local strings

Reference: `claude-state/research_planner_2026-05-13.md` §8 (cycle-syncing trap) + `claude-state/feedback_planner_two_tab_signed_off.md` (binding two-tab rule).

---

## Decisions Code makes — defaults documented

Don't wait on Halli for any of these. Use the default, document the choice in the commit message.

1. **Bundles entity vs hard-code?** **Default: hard-code 5 defaults in a const array** (see A2-3). Entity if/when "Build into my week" actually does something.
2. **Pacing Bank position in carousel** — index 1 (right after the active bundle). Default applied.
3. **Bundle CTA action** — log + toast for now, not functional. Default applied.
4. **Month ribbon chevron behaviour** — navigate prev/next month visually only; doesn't change selected day. Default applied.
5. **Activity bar threshold** — `rbar` (55%) / `rbar.b2` (75%) / `rbar.b3` (95%) widths map to 1-33% / 34-66% / 67-100% of habits completed that day. Default applied.
6. **Selected-crumb empty state** — when `dailyPlan?.window_summary` missing, use the phase-keyed permissive bank (4 lines per phase, deterministic by date so it doesn't flicker on each render). Default applied.
7. **Confidence pill placement** — independent header element, not a `.ph-sub` child. Default applied.
8. **Test account user_id for A2-5** — Code picks a known test user OR creates one. Default: pick the existing `ojihalliburton57@gmail.com` if it has admin-test marker, else create `planner-test-2026-05-15@femwell.test`.

---

## Process rules (binding for this build)

1. **STATUS.md per commit** — add a row to "Just shipped" + bump "Last updated" + add Recent-edits note. Same protocol as A1.
2. **Build clean check** — `npm run build` succeeds before every commit; lint baseline preserved.
3. **Don't wait for Cowork publish** — push all commits to `main` as a chain. Halli publishes at the end. If a rebase conflict happens because Cowork pushed mid-build, resolve and continue.
4. **One comprehensive tombstone at the end** — `claude-handoff/from-code-to-cowork-2026-05-15-planner-A2-complete.md`:
   - All commit SHAs with one-line summaries
   - Per-commit acceptance checklist with your-side ticks
   - A2-5 walk results — surface-by-surface ✔ or ✗
   - Any defaults you used + reasoning
   - Cowork's TODO (publish + final visual walk vs the signed-off demo)

5. **If you finish early** — pick from the optional follow-ups (A2-6 Fresh-Start verify, A2-7 cross-tab smoke test, A2-8 C3.5 CapacityTaxLog persistence). Document what you did and what you skipped.

---

## When Cowork picks up

After the final tombstone lands:
1. Cowork reads it end-to-end
2. Publishes via base44 builder (one bundle)
3. 3-viewport walk both tabs on `femwells.com/Planner`
4. Verifies vs the signed-off demo
5. Drops a verification handoff back with any drift

— Cowork (Ms Lead Manager + Ms Atelier), 2026-05-15

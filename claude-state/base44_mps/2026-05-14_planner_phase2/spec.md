# Planner Phase 2 (Planner-A) build spec — Mr Lead Manager

**Author:** Cowork (Mr Lead Manager hat). **Audience:** Code. **Status:** Draft, awaiting Halli sign-off on demo.
**Background:** `claude-state/research_planner_2026-05-13.md` (full research, 205 lines). **Demo:** `femwell-demos/planner_phase2/planner_phase2_demo.html` (paired with this spec, ship-after-sign-off).

---

## What's already live (Phase 1)

`src/pages/Planner.jsx` ships:
- Page head + 7-day chips with phase dot + cycle-day index.
- Day heading + DailyPlan intention pull (when present).
- Active program day card (UserPrograms).
- Habits ritual stack (HabitLogs morning rituals).
- Today's meals (MealPlans by weekday key).
- PlannerItems + PersonalTasks commitments grid.
- Brand sweep (cream/plum/rose/gold, Fraunces + Inter, Lucide icons).

`Phase 1 == data unification only`. The page is no longer empty for users with active data; it does NOT yet have the retargeting / forecast / ritual bundles / Plan-with-Jess layers from the signed-off demo.

---

## What this spec ships (Planner-A scope, ~3 MPs)

### MP-A1 — Smart View retargeting

**Goal.** Replace the simple "Today's intention" eyebrow with an adaptive Smart View card stack that surfaces *what's most useful right now* based on the user's state.

**Four states:**

| State | Trigger | Card shown |
|---|---|---|
| `IDLE` | No active program AND no HabitLogs in the last 7 days | "Start somewhere small" — surfaces 1 ritual bundle CTA + 1 program-pick CTA |
| `STREAKY` | 3+ habits hit in the last 3 days | "Quiet rhythm" — gentle-streak ribbon, no fanfare, no number |
| `STUCK` | Active program but `last_completed_day_date` 7+ days ago | "Continue where you paused: Day {N}" — single-CTA Continue button |
| `DRIFTING` | No habit log AND no DailyPlan write AND no page open in 3+ days | "Soft re-entry" — 1-tap "Just check in for today" → opens checkin modal |

**Computed where?** Inline in `Planner.jsx` from existing state (no new entity). Cheap — same data already fetched in Phase 1.

**Acceptance:**
- All 4 states demonstrable on the operator account via dev-only `?_smartView=idle|streaky|stuck|drifting` URL param.
- State recomputes when user marks a habit / completes a program day / writes DailyPlan.
- Card is the FIRST surface below the 7-day chip strip — above program / habits / meals.
- 3-viewport visual walk passes.

### MP-A2 — Phase-tense forecast strip with confidence

**Goal.** Replace the implicit "8 days to your period" sentence (currently scattered across the app) with an explicit 7-day forecast strip on Planner: colour-blocked phase ribbons + confidence label.

**Visual.** A horizontal row of 7 small tiles directly under the day chips. Each tile shows day-of-week initial + phase gradient (per `PHASE_COLORS` map) + cycle day number. Below the strip, a single line: `"Estimated, {confidence}% confidence — based on your last {n} cycles"`.

**Confidence calculation.** `confidence_pct = min(100, max(40, n_cycles × 20))` where `n_cycles` is the count of complete cycles in `CycleLogs` for this user, capped at 5 cycles = 100%. Below 3 cycles, render the line as `"Tracking your rhythm — early days, predictions soften after a few cycles"` instead of a percentage.

**Source of truth.** Use the same cycle-phase math `Planner.jsx` already does (`phaseForDate`). Forecast strip just iterates `[+0, +1, +2, +3, +4, +5, +6]` days from today.

**Acceptance:**
- Strip renders 7 phase-coloured tiles.
- Each tile is keyboard-focusable; Enter/click sets the focused day in the chip row (so user can tap a future day to plan).
- Confidence label correct per cycles-tracked.
- 3-viewport pass — strip wraps gracefully on mobile (390px = 7 tiles of ~50px each).

### MP-A3 — Future-tense Week Ahead replacement

**Goal.** The signed-off demo replaces the "Week ahead" card with a more dynamic forecast. The forecast strip from MP-A2 absorbs the visual; this MP replaces the *content* with a Jess-signed week-ahead sentence + 1 actionable nudge.

**Content shape:**
```
THIS WEEK
{Jess voice sentence — e.g. "A softer late luteal stretch ahead. Your sleep has been off the
last three nights — Friday's a good day to clear the calendar early."}
{actionable nudge — e.g. "Pull Friday's evening commitments?"  [Yes, suggest a clearer Friday]}
```

**LLM call.** Reuse existing `personal_assistant` function with a new system prompt `planner_week_ahead.md`. Input: user's last 7 days of HabitLogs + DailyAggregates + cycle phase + upcoming PlannerItems. Output: 2-line sentence + 1 nudge. Cached daily per user — regenerated only when (today changes) OR (a habit/plan write happens after generation).

**Acceptance:**
- Card visible above the morning stack, below the forecast strip.
- LLM call doesn't fire on every render — only on cache miss.
- If LLM fails, falls back to a phase-default sentence + no nudge.
- 3-viewport pass.

---

## Schema additions

**None for MP-A1.** Pure derived state from existing entities.

**MP-A2:** No new entity. Reads existing `UserProfile.last_period_start_date` + `CycleLogs`. (Confirm `CycleLogs` is the entity name — Phase 1 may already query it; if not, fall back to counting distinct `last_period_start_date` history in `UserProfile`.)

**MP-A3:** Add `WeekAheadCache` entity (or reuse `JessMemory` with a `key='planner_week_ahead'` row per user). One row per user. Fields: `user_id`, `generated_at`, `sentence`, `nudge_label`, `nudge_action` (enum: pull_evening, defer_commitment, add_rest_day, none), `cycle_phase`, `valid_until_day_key`. Server-side compound unique on `(user_id)` — one row per user.

---

## Out of scope (Planner-B / -C)

Per research §9:
- Ritual bundles carousel write-path (Planner-B MP-B1)
- Plan-with-Jess weekly draft (Planner-B MP-B2)
- Tonight's Window HRT row (Planner-B MP-B3)
- Shutdown ritual (Planner-B MP-B4)
- Pacing Bank (Planner-B MP-B4 stretch)
- Cervical screening row (Planner-C / UK-local)
- Calendar export (Planner-C / Settings)

Reference: `claude-state/research_planner_2026-05-13.md` §7 ranking.

---

## Brand-voice guardrails (from research §8 trap)

Every Planner copy line touching phase MUST:
1. Use permissive language ("often", "tends to", "many women report") — not prescriptive ("should", "must", "always").
2. Lead with the user's own data ("your last three cycles") — not population averages.
3. Avoid body-negative framing ("low day" → "softer day"). No "fix" / "broken" / "off-balance".
4. Replace imperatives with invitations ("you should rest" → "want a clearer Friday?").
5. Confidence-honest predictions — never claim certainty for a 78%-confidence forecast.

Reference: `feedback_femwell_is_uk.md` + research §8.

---

## Commit boundaries (7 commits)

| # | What | Files |
|---|---|---|
| C1 | MP-A1 Smart View retargeting — state computation + 4-state card stack | `src/pages/Planner.jsx`, new `src/components/planner/SmartView.jsx` |
| C2 | MP-A1 polish — dev URL param + 3-viewport verify | `Planner.jsx`, screenshot tombstone |
| C3 | MP-A2 forecast strip + confidence label | new `src/components/planner/ForecastStrip.jsx`, wired into `Planner.jsx` |
| C4 | MP-A2 polish — tile keyboard nav + mobile wrap + verify | `ForecastStrip.jsx` |
| C5 | MP-A3 schema + LLM call (server-side) | new `base44/entities/WeekAheadCache.jsonc` (or `JessMemory` extension), new function `base44/functions/generatePlannerWeekAhead/entry.ts`, system prompt `planner_week_ahead.md` |
| C6 | MP-A3 client render — Week Ahead card + cache read | new `src/components/planner/WeekAheadCard.jsx`, wired into `Planner.jsx` |
| C7 | MP-A3 polish + 3-viewport tombstone | all 3 components, screenshots |

Each commit: build clean, push, drop tombstone, Cowork publishes + verifies.

---

## Acceptance criteria (full Planner-A exit gate)

Live walk at mobile (390×844), tablet (768×1024), desktop (1440×900) on `femwells.com/Planner`:

1. ✅ Page loads with no empty state for operator account.
2. ✅ Smart View card shows correct state (IDLE/STREAKY/STUCK/DRIFTING) given current data.
3. ✅ Forecast strip shows 7 phase-tinted tiles with cycle-day numbers.
4. ✅ Confidence label correct.
5. ✅ Week Ahead card shows Jess-signed sentence + 1 nudge.
6. ✅ No copy line breaks brand-voice guardrails (manual audit).
7. ✅ Tapping a forecast tile sets the day chip + scrolls to the day's content.
8. ✅ Smart View recomputes after a HabitLog write within 1 page reload.
9. ✅ No new entity write storms — Smart View is derived, Week Ahead is cached.
10. ✅ a11y: tab order is chip strip → forecast strip → Smart View → Week Ahead → morning stack → ... Each focusable element has `aria-label`.

---

## Open questions for Code while building

1. Does `CycleLogs` exist as an entity, or are cycles tracked on `UserProfile.cycle_history` JSON? Confirm before MP-A2.
2. Are HabitLogs keyed by `date` (YYYY-MM-DD) or `created_date` (timestamp)? Smart View triggers depend on this — confirm via base44-cli.
3. `WeekAheadCache` vs `JessMemory.key='planner_week_ahead'` — Halli's preference? Default to `JessMemory` reuse (avoids new entity), but if it gets too crowded, split.
4. LLM call: same `personal_assistant` function with a different system prompt, or new function `generatePlannerWeekAhead`? Default to a new function for cleaner cost tracking.

Drop a handoff if any of these block.

— Cowork (Mr Lead Manager), 2026-05-14

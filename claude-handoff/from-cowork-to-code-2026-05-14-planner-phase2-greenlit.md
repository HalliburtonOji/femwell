# Cowork → Code, 2026-05-14: Planner Phase 2 — Atelier signed off, green-lit to ship

## TL;DR

Halli looked at `mnt/femwell/femwell_planner_phase2_demo.html` and approved **Section 4 — Full stack (Phase 1 + Phase 2)** as the visual target. Spec at `claude-state/base44_mps/2026-05-14_planner_phase2/spec.md` is the build brief. Start with C1 whenever you're free.

## What "Section 4" means for the build

Halli's "this" on Section 4 = the **composition order** is locked. Top-to-bottom on every Planner day:

1. Eyebrow + h1 ("Discover" / "Planner")
2. Day chips (Phase 1, already shipped)
3. **Forecast strip** + confidence label *(NEW — MP-A2)*
4. **Smart View card** *(NEW — MP-A1, 4 adaptive states)*
5. **Week Ahead card** *(NEW — MP-A3, Jess-signed)*
6. Programme card (Phase 1)
7. Morning rhythm stack (Phase 1)
8. Today's meals, commitments, tonight's window (Phase 1)

Sections 1-3 in the demo are the *variant breakouts* of those new surfaces — Smart View has 4 states, Forecast strip has 2 confidence variants, Week Ahead has 2 example sentences (luteal + follicular). All of those variants compose into the same vertical order from Section 4.

## Visual treatment locked

Per the demo, all of these are sign-off:
- **Smart View states** — eyebrow colour by state (rose for Idle/Stuck, green for Streaky, gold for Drifting). Background gradient only on Streaky + Drifting (subtle cream → blush). Idle + Stuck stay solid white with rose accents.
- **Forecast strip** — 7 tiles, gradient by phase, ~50px each, fday letter (9px) above fnum (14px Fraunces). Confidence label centred underneath in mauve.
- **Week Ahead card** — warm cream background (#FBF6EE), gold eyebrow, Fraunces italic body, white pill nudge button.

## Open questions you still need to answer in code

From spec §"Open questions":
1. `CycleLogs` exists as entity? Or cycles on `UserProfile.cycle_history` JSON? Confirm before MP-A2.
2. HabitLogs keyed by `date` (YYYY-MM-DD) or `created_date` (timestamp)? Smart View `STREAKY` trigger depends on this.
3. `WeekAheadCache` new entity vs `JessMemory.key='planner_week_ahead'` reuse — default to JessMemory.
4. LLM call — same `personal_assistant` function with new prompt, or new function `generatePlannerWeekAhead`? Default to new function for clean cost tracking.

If any of these need a decision Halli should make, drop a handoff. Otherwise you have full autonomy on those four within the defaults.

## Build path

Per spec §"Commit boundaries":

| # | What | Build clean → drop tombstone → Cowork publishes & verifies |
|---|---|---|
| C1 | MP-A1 — Smart View state computation + 4-state card | ← start here |
| C2 | MP-A1 polish — dev `?_smartView=` param + 3-viewport verify |
| C3 | MP-A2 — Forecast strip + confidence label |
| C4 | MP-A2 polish — tile keyboard nav + mobile wrap |
| C5 | MP-A3 — schema + LLM call (server-side) |
| C6 | MP-A3 — client render + cache read |
| C7 | MP-A3 polish + full Planner-A tombstone |

## Brand-voice guardrails (binding)

Spec §"Brand-voice guardrails" — every Planner copy line touching phase must:
- Use permissive language ("often", "tends to") not prescriptive ("should", "must").
- Lead with the user's own data, not population averages.
- No body-negative framing — "softer day" not "low day".
- Replace imperatives with invitations.
- Confidence-honest predictions.

Research source: `claude-state/research_planner_2026-05-13.md` §8 (the "strong cycle-syncing trap").

## Phase 2 podcast player — not blocked by Planner

You've got C5 (MiniPlayer + ExpandedPlayer UI) queued for podcast Phase 2. Take whichever you want first. Both are clear-path now.

## What Cowork is doing next

Parked until Halli sends new notes or one of these:
- 3-viewport visual walk after you publish each Planner commit.
- Verification of `backfillLongreadsImages` first-run output once cron fires.
- Master plan rev 5 capture (today was massive — STATUS.md baton, ONE_SHOT_PHASES, Capacitor note, podcast Phase 1, Lifestyle refactor, Planner Phase 2 spec/demo).

— Cowork (Ms Atelier hat), 2026-05-14

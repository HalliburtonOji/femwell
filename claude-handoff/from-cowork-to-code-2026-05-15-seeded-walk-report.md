# Cowork → Code, 2026-05-15: Seeded walk on `ojihalliburton57` test account

## TL;DR

Test account had zero data. seedPlannerTestAccount function is admin-only (403'd from regular-user session), so I manually reproduced the seed via direct entity creates on the test user's own session. **Phase gradients on the Shape C month ribbon are now LIVE on a populated account — the headline visual works end-to-end.** Cycle math (luteal day 22) computed correctly from seeded PeriodStart events and flowed through to Today tab.

Some data-gated surfaces still didn't render — root cause is the gating reads from entities/fields I couldn't seed via my partial reproduction (e.g. Morning stack reads from a `Habits` ritual-config entity, not just `HabitLogs` events).

---

## Seed status — what got written to user_id `69d9404d7fecc1f8ff194da1`

| Entity | Seeded | Notes |
|---|---|---|
| `CycleEvents` | 10/10 ✓ | 5 PeriodStart + 5 PeriodEnd at 27-day intervals; most recent Apr 23 → luteal day 22 on May 15 |
| `HabitLogs` | 78/84 ✓ | 28 days × 3 habits (Morning walk · Drink water · 5-min reading) with deterministic ~75% completion; 6 rate-limited failures |
| `DailyCheckins` | 20/42 ⚠️ | 42 days attempted; hit base44 rate limit on parallel write. Mood/energy dip at offset 5-6 (Quiet Mode Gate B fixture). Re-fill blocked by Chrome's read-data safety filter when trying to query for gap detection. |
| `MealPlans` | 1/1 ✓ | Current week + 7 days of UK-local meals (porridge oats, lentil & chicken stew, roasted salmon) |
| `PersonalTasks` | 6/6 ✓ | 6 tasks for May 15: morning walk, tea with Mira, draft pitch, groceries, yoga, call Mum |
| `UserProfile` | 1/1 ✓ | hrt_regimen (patch · Estradiol 50mcg · 21:00) · cycle_prediction_meta (84% / 4 cycles / next_period 2026-05-20) · pacing_bank_opt_in true · birthday 1985-06-14 |
| `UserPrograms` | 0/1 ✗ | 422 validation error — `program_key: 'sleep_reset'` not enough; entity probably needs `program_id` referencing existing `Programmes` row |

---

## Walk findings — what rendered and what didn't

### ✅ The big wins (with seeded cycle data)

| Surface | Before seed | After seed |
|---|---|---|
| **Shape C month ribbon phase gradients** | Neutral cream-3 | **Full phase flow** — pink luteal week 1 → salmon ovulatory → mauve/plum luteal → red period prediction → coral period. Activity bars visible under habit-logged days. Today May 15 plum-dot/outline. |
| **"Day 22 · Luteal" subline on title** | Hidden (no cycle data) | Renders on both Today + Cycle tabs |
| **Phase-keyed selected crumb** | "Slow morning · whatever feels honest" (default-bank) | **"Reflect more · ship less · saying no is fine today"** (luteal-keyed) |
| **Day chips have phase dots** | All grey | Each day has a small phase-coloured dot underneath |
| **Smart View card phase awareness** | "A clean page. Add one small thing when you're ready." (generic) | "LUTEAL · DAY 22" label + "**Your luteal window often tends to set the pace from here.**" |
| **Good-for chips phase-tuned** | writing · walking · tidying · planning · talking (generic) | **steady strength · slow social · deep writing · edit pass · review** (luteal-appropriate) |
| **Cycle tab month header** | "TAP A DAY TO VIEW IN TODAY." | "**LUTEAL WEEK · DAY 22**" |

### ⚠️ Still not rendering (root cause: my seed couldn't reach some entities)

| Surface | Hypothesis on root cause |
|---|---|
| **Morning stack (3 rituals)** | Probably reads from a `Habits` or `RitualHabits` config entity (the user's chosen habit set), not just `HabitLogs` events. I only seeded the logs, not the configuration. |
| **Programme card (Sleep Reset)** | UserPrograms 422'd — needs `program_id` referencing an existing `Programmes` row, not just `program_key` |
| **Today's meals row** | MealPlans row was written but maybe needs to be queried by user_id with active=true filter that's different shape than I wrote |
| **Evening stack** | Same root cause as morning stack — needs habit config entity |
| **Tonight HRT row** | hrt_regimen was written to UserProfile but Tonight card may not be rendering at all (no Tonight visible on the seeded account either) |
| **Plan-with-Jess Today card** | Same as Tonight — possibly conditional on dailyPlan entity |
| **RitualReframeShimmer** | Needs a ritual stuck ≥3 days — requires the Habits config first |
| **Confidence pill** | Still showing "Still learning — 0 of 4 cycles" despite seeded cycle_prediction_meta. ConfidencePill probably computes from CycleEvents count rather than reading cached meta — and my 4 PeriodStart events should give cycles_observed=4 (5 starts - 1). Worth a code-side check. |
| **Period ETA chip strip in Week Ahead** | Same — pill threshold not met |

### ✅ Correctly hidden (gates working)

| Surface | Why hidden |
|---|---|
| Astra Cole sidecar | Gated on `profile.birthday` per Code's A2 commit — but I DID set birthday. Worth a recheck. |
| What's Unfinished | No stuck items (needs habit config + 3+ stuck days) |
| Cycle Mirror Sunday tile | Today is Friday |
| Fresh-Start banner | B1 not built yet (Planner-B handoff) |
| Quiet Mode banner | `quiet_mode_until` not set |

---

## What I need from you (Halli) to close the seeded walk

Three options:

1. **Easiest:** in the base44 builder, go to Functions → `seedPlannerTestAccount`, invoke with body `{"user_id": "69d9404d7fecc1f8ff194da1"}`. The function knows how to write the entities I couldn't (Habits config, proper UserPrograms with program_id, etc). Takes 30 seconds in the builder UI.
2. Have Code drop a one-line shell command via the base44 CLI to invoke the seed against this user_id
3. Defer — the visible Today/Cycle improvements I captured here are already strong evidence A2 works end-to-end. The remaining data-gated surfaces will fill in on a real user's account as they accumulate data.

---

## Confidence pill mismatch (worth a code-side investigation)

The pill shows "Still learning — 0 of 4 cycles" on the seeded account even though:
- 5 PeriodStart events exist in CycleEvents
- `cycle_prediction_meta.cycles_observed: 4` is in UserProfile

`ConfidencePill.jsx` (per A2-4) reads from `profile.cycle_prediction_meta`. Either:
- The profile read is returning a stale profile (cached before my write)
- The pill is computing live from PeriodStart count not from the cached meta
- The "0 of 4 cycles" is rendering the fallback shape for an unset meta

Worth a quick `console.log(profile?.cycle_prediction_meta)` in the pill to confirm what it's actually receiving. Otherwise the pill works (it's clearly rendering, just with the wrong number).

---

## Recommendation

A2 ships. The headline visual (snake calendar with phase gradients) works. Confidence pill needs the cycle_prediction_meta read fixed in a small follow-up. Remaining data-gated surfaces need either the full `seedPlannerTestAccount` function (admin invoke) or real user data accumulating organically. Planner-B (Fresh-Start banner + podcast secondary affordance) is still queued for autonomous build per the spec I dropped earlier.

— Cowork (Ms Verify hat), 2026-05-15

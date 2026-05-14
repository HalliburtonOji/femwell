# Planner Phase 2 — spec v2 (best-in-market 2026)

**Supersedes:** `spec.md` from 2026-05-14 morning. Spec v1 covered 3 surfaces (Smart View 4-state, Forecast strip, Week Ahead). After Halli pushed for "the best the market has to offer", a fresh deep-research drop landed at `claude-state/research_planner_best_in_market_2026-05-14.md`. This spec v2 absorbs spec v1's three surfaces and adds six more under MP-A1/A2/A3.

**Canvas:** `mnt/femwell/femwell_planner_final.html` (signed-off Planner composition — Shape C month ribbon + Smart View + good-for chips + morning/evening stacks + program card + meals + tonight's window + ritual bundles carousel + gentle streaks + Plan-with-Jess). All Phase-1 sections stay in place.

**Phase 2 visual target:** `mnt/femwell/femwell_planner_phase2_demo.html` — same canvas, nine new mechanics layered as inline `ⓟ2 NEW` deltas. Vertical order is locked.

**Brand-voice guardrails (binding):** permissive language ("often", "tends to") not prescriptive ("should", "must"); lead with user's own data, not population averages; no body-negative framing ("softer day" not "low day"); invitations not imperatives; confidence-honest predictions. Research source: `research_planner_2026-05-13.md` §8 (cycle-syncing trap).

---

## The 9 Phase 2 mechanics — what no other UK women's wellness app currently combines

| # | Mechanic | Why it's in market-leading territory | Phase-2 MP |
|---|---|---|---|
| 1 | **Capacity Tax bar** | Predicted load vs available capacity, shown as one strip with a single "Defer N" pill. Translates cycle-aware planning into a number a user can act on in 1 tap. Closest precedent (Moonai) is text-only. | MP-A1 |
| 2 | **Doctor-Ready Diary (NICE-NG23 PDF)** | 4-page PDF export aligned to NICE NG23 — bleed pattern, mood, sleep, HRT, symptom flags. GPs are trained to read this exact shape. No competitor ships this. | MP-A1 |
| 3 | **Confidence pill** (with cycles-of-data shown) | Honest prediction quality. "84% · 4 cycles". Sets up the Doctor-Ready Diary as a credible artefact. | MP-A1 |
| 4 | **5-state Smart View** (idle / streaky / stuck / drifting / quiet-mode) | Adaptive single-card replacement for fixed dashboards. State chip row visible; current state highlighted. Quiet Mode is new. | MP-A1 (3 states) → MP-A2 (5 states) |
| 5 | **Capacity-composite good-for chips** | "Good-for" chips no longer derive only from cycle phase. They composite phase × Capacity Tax × historical hit-rate. Info icon shows the breakdown. | MP-A1 |
| 6 | **Quiet Mode auto** | Fires automatically when load > 120% for 3 days OR mood/energy red for 2 days. Pulls back non-anchor tasks 48h. Undo always one tap. | MP-A2 |
| 7 | **Reframe shimmer + 28-day consistency** | Stuck items get a gold italic line that reframes pause as data. Streaks become "consistency over 28 days" with period-week auto-freeze. | MP-A2 |
| 8 | **Cycle-Mirror Sunday tile** | Sunday-only retrospective tile: "Across your last 4 luteal weeks, X happened Y% of nights." Pattern, not verdict. | MP-A2 |
| 9 | **Identity-anchor cue chips** (anchor / soften / fresh-start) + **Fresh-Start banner** + **Shutdown ritual** + **Pacing Bank Low-Spoons bundle** + **HRT row in Tonight's Window** + **Astra Cole horoscope sidecar** + **Plan-my-next-cycle CTA** | The "warmth bundle" — small craft details that close the loop between cycle data and lived day. | MP-A3 |

---

## Commit boundaries (Planner-A · C1–C9)

Each row = one tombstone-able commit. Build clean, drop tombstone in `claude-state/STATUS.md`, then Cowork publishes + verifies.

| # | What | Acceptance |
|---|---|---|
| **C1** | **MP-A1 schema** — `CycleConfidenceCache` entity (or extend `UserProfile.cycle_prediction_meta` JSON); `CapacityTaxLog` entity for week-grain rolling history. Migration script populates first run. | Schema lint green. `cycle_confidence_pct` + `cycles_observed` readable from FE. |
| **C2** | **MP-A1 confidence pill** — render under `.ph-sub`. Pulls from `cycle_prediction_meta`. Show 4-cycle minimum threshold; if below, render "still learning · 1 of 4 cycles". | Pill renders on `/planner` + `/today` at 3 viewports. Permissive copy. |
| **C3** | **MP-A1 Capacity Tax bar** — inserted between month ribbon and Smart View. Computes: `predictedLoad = sum(PersonalTask.estimated_effort * phase_modifier) + sum(active habits * 1) + sum(active programmes * 1.5)`. `capacityForPhase = baseline × phase_multiplier (menstrual 0.55, follicular 1.1, ovulatory 1.2, luteal 0.85)`. Shows percent + 1-tap Defer pill (filters reschedulable PersonalTasks to follicular). | Bar renders + Defer pill moves N tasks + acceptance toast. Keyboard nav on Defer button. |
| **C4** | **MP-A1 Doctor-Ready Diary v1** — backend function `generateDoctorReadyDiary(userId, weeks=6)` returns PDF buffer. Pulls from CycleEvents + HabitLogs + MoodLogs + UserProfile.hrt_regimen. Layout: bleed grid · symptom heatmap · HRT timeline · 3-bullet summary. NICE-NG23 field naming. | PDF downloads; opens in mobile Safari preview; renders correctly at A4. |
| **C5** | **MP-A1 Smart View shell** — extract `SmartViewCard` component with `state` prop (`idle\|streaky\|stuck\|drifting\|quiet`). State chip row visible. State 3 fixed for C5 (3 states wired). Good-for chips drive from capacity composite. | 3 states render with `?_smartView=` dev param. Chip row above card. |
| **C6** | **MP-A2 Quiet Mode auto-pull-back** — server-side gate: if `captax.pct > 120` 3 days running OR `mood < 3 && energy < 3` for 2 days, set `UserProfile.quiet_mode_until = now()+72h`. FE renders banner. Pulls non-anchor tasks. Undo button restores. | Test fixture flips flag; banner renders; tasks hidden; undo restores. Toggleable in dev. |
| **C7** | **MP-A2 Reframe shimmer + 28-day consistency** — Stuck items in Smart View get italic gold line via LLM (cheap call, `personal_assistant` function with short prompt). Rhythm card label changes to "Consistency over 28 days" with period-week auto-freeze badge. | Shimmer renders below stuck cards; rhythm shows period-week freeze chip during menstrual phase. |
| **C8** | **MP-A2 Cycle-Mirror Sunday tile** — only renders if today is Sunday AND user has >= 4 cycles of data. Backward-looks at HabitLogs + MoodLogs at same phase-day across last 4 cycles. 2 cells: pattern % + strongest anchor. Single closing question CTA. | Renders only on Sundays at qualifying users. Permissive copy. |
| **C9** | **MP-A3 warmth bundle** — Week Ahead Jess-nudge CTA + HRT row in Tonight (visible only if `hrt_regimen` exists) + Shutdown ritual block under Evening stack + Pacing Bank Low-Spoons bundle in carousel + Astra Cole horoscope sidecar (LifestyleItems where `category=horoscope`) + Plan-my-next-cycle CTA in Plan-with-Jess. | All 6 surfaces render. HRT row hides if no regimen. Astra sidecar deep-links to `/lifestyle?tab=horoscope`. |

Polish work (`C10`+) — keyboard nav for the new chips, screen-reader labels for Capacity Tax bar (it's data viz — needs `aria-label="Predicted load 122 percent of capacity, 22 percent over"`), 3-viewport visual walks per commit.

---

## Schema additions

```jsonc
// entities/UserProfile.json — additions
{
  "cycle_prediction_meta": {
    "type": "object",
    "properties": {
      "confidence_pct": { "type": "number" },
      "cycles_observed": { "type": "integer" },
      "next_period_eta": { "type": "string", "format": "date" },
      "eta_window_days": { "type": "integer" }
    }
  },
  "hrt_regimen": {
    "type": "object",
    "properties": {
      "active": { "type": "boolean" },
      "method": { "type": "string", "enum": ["patch", "gel", "tablet", "implant", "none"] },
      "evening_dose": { "type": "string" },
      "reminder_time": { "type": "string" }
    }
  },
  "quiet_mode_until": { "type": "string", "format": "date-time", "nullable": true },
  "pacing_bank_opt_in": { "type": "boolean", "default": false }
}

// new entity: CapacityTaxLog.json
{
  "type": "object",
  "required": ["user_id", "week_start"],
  "properties": {
    "user_id": { "type": "string", "format": "uuid" },
    "week_start": { "type": "string", "format": "date" },
    "predicted_load": { "type": "number" },
    "phase_capacity": { "type": "number" },
    "pct_of_capacity": { "type": "number" },
    "deferred_count": { "type": "integer" },
    "computed_at": { "type": "string", "format": "date-time" }
  }
}
```

---

## LLM cost estimates

| Surface | Function | Frequency | Cost per call | Notes |
|---|---|---|---|---|
| Reframe shimmer (C7) | new `generateReframeLine` | only when `stuck >= 3 days` (~10% of users/day) | ~$0.0002 (Haiku, ~80 tok prompt + 30 tok response) | Cache 24h per (user × habit). |
| Cycle Mirror copy (C8) | new `generateCycleMirrorLine` | weekly per qualifying user | ~$0.001 (Sonnet, longer prompt for permissive framing) | Cache 7 days. |
| Astra Cole sidecar (C9) | reads `LifestyleItem.summary` | none — already generated | $0 | Pull existing horoscope row. |
| Capacity Tax messaging | static string templates | none | $0 | Permissive copy is deterministic. |
| Doctor-Ready Diary 3-bullet summary | new `generateDoctorDiarySummary` | once per export | ~$0.002 (Sonnet) | Cache by `(user × week_range)` for 24h. |

Estimated total monthly LLM cost at 5k MAU with daily Planner visits: ~£60-80.

---

## Open questions for Halli (need a yes/no before C1)

1. **DTAC submission yes/no.** The Doctor-Ready Diary makes FemWell adjacent to a regulated digital health product. DTAC submission (NHS-aligned framework) is ~6 weeks lead time. Yes adds market credibility; no keeps speed. **Default if no answer:** ship without DTAC, but write the diary copy to be DTAC-ready (no diagnostic language).

2. **Pacing Bank opt-in or opt-out.** Spoon theory is loved by some users (chronic illness, ME/CFS, long-COVID) and feels infantilising to others. **Default if no answer:** opt-in via Settings.

3. **Apple Health sync — Planner-B or Planner-C.** Capacity Tax could pull HRV/sleep from Apple Health for sharper signal. This is Capacitor-scope (memory rule `project_capacitor_stripe_paywall.md`). **Default if no answer:** ship Planner-A first with manual + cycle-only signals, schedule Apple Health for Planner-B once Capacitor wrap exists.

4. **Plus tier scope.** Doctor-Ready Diary is the obvious paywall surface (£4.99/mo or £39/yr). Quiet Mode, Cycle Mirror, Astra sidecar — free or Plus? **Default if no answer:** Doctor-Ready Diary = Plus; everything else free.

5. **`CapacityTaxLog` retention.** Keep forever for Cycle Mirror history, or 12 months rolling? **Default if no answer:** 12 months rolling; archive older to compressed summary on UserProfile.

6. **HRT row visibility logic.** If a user has `hrt_regimen.active = true`, always show? Or also requires evening-dose? **Default if no answer:** show whenever `active && method != 'none'`.

7. **Astra Cole sidecar** — show always, or only when user has set zodiac sign in `Horoscope.preference`? **Default if no answer:** only when sign is set.

If any of these need a decision Halli should make, Code drops a `claude-handoff/` note. Otherwise Code has full autonomy on the defaults.

---

## What "done" looks like

After C1–C9 ship, the Planner is:
- the only UK women's wellness app that shows **predicted load vs available capacity** as a one-line strip with a one-tap defer pill
- the only app exporting a **NICE-NG23-aligned PDF** GPs are trained to read
- the only app with **autonomous Quiet Mode** that pulls back tasks before user has to ask
- the only app whose **streaks reframe as 28-day consistency** with period-week auto-freezes
- the only app with a **Cycle-Mirror Sunday reflection** comparing same phase-day across 4 cycles

That's the "best in market" claim, defensible.

— Cowork (Ms Atelier hat), 2026-05-14

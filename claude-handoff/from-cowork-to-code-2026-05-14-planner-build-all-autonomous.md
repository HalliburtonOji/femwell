# Cowork → Code, 2026-05-14: BUILD ALL OF PLANNER-A AUTONOMOUSLY

## TL;DR

Halli signed off the two-tab Planner. Now he wants you to build **the full Planner-A sequence (C0 → C9) independently for the next few hours** without checking back. He'll do live verification + adjustments via Chrome MCP afterwards.

**Your mandate:** ship every commit in the sequence. Use documented defaults for the 7 open questions. Don't wait for Cowork publishes between commits. Drop a comprehensive tombstone at the end. If a real blocker hits — schema decision a default can't cover, a build that breaks the app at runtime — drop a handoff and keep going on the rest.

---

## Read first (in this order — everything is in the repo, no `mnt/` paths needed)

1. **`claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md`** — full spec with C0-C9 acceptance criteria, schema additions, LLM cost, 7 open questions + their defaults. **Source of truth for what to build.**
2. **`claude-state/demos/femwell_planner_phase2_demo.html`** — signed-off two-phone visual target (Today + Cycle). Open in browser. **Source of truth for visual fidelity.** Don't deviate.
3. **`claude-state/demos/femwell_planner_final.html`** — the Phase-1 signed-off canvas the Phase-2 demo is built on. Reference when you need to see what was already shipped.
4. **`claude-state/research_planner_best_in_market_2026-05-14.md`** — the 10K-word brainstorm. Read §C for section-by-section copy + §B for mechanic rationale + §A for market landscape.
5. **`claude-state/feedback_planner_two_tab_signed_off.md`** — binding rule: Today = next 24h action, Cycle = bigger arc pattern. Every new Planner surface declares its tab.
6. **`claude-state/feedback_signed_off_demo_is_canvas.md`** — binding rule: build on the canvas, don't author a parallel visual.

Supporting docs (already in your repo, dip in as needed):
- **`claude-state/research_planner_2026-05-13.md`** — the earlier research with §8 "strong cycle-syncing trap" (binding for brand voice).
- **`claude-state/research_care_multi_stage_2026-05-13.md`** — context on the clinical/regulatory direction Doctor-Ready Diary aligns to.
- **`claude-state/STATUS.md`** — the shared baton. Read latest "Just shipped" rows for what's already on main.
- **`CLAUDE.md`** — repo-level binding rules including the STATUS.md per-commit contract.

---

## Build path — C0 through C9 in one session

### C0 · MP-A0 — Tab shell + routing  *(start here)*

- New `src/components/planner/PlannerTabs.jsx` segmented control. Sticky at top of `/planner` page.
- URL state via `useSearchParams`: `?view=today` (default) | `?view=cycle`.
- Persist last view to `localStorage.fw_planner_view`; on mount, if URL is empty and localStorage exists, restore.
- Split existing `Planner.jsx` page body into `PlannerTodayView` + `PlannerCycleView`. Move existing month-ribbon section into `PlannerCycleView` (the rest is mostly Today by default — meals, stacks, tonight, etc.).
- Cross-tab deep links — two helpers:
  - `navigateToCycle(scrollTo?: string)` → pushes `?view=cycle` + optional `#<scrollTo>` anchor.
  - `navigateToToday(date?: string, toast?: string)` → pushes `?view=today` + optional date retarget + optional toast.
- Acceptance: route renders both tabs, switches via segmented control, persists across reload, `?view=cycle&scrollTo=doctor` scrolls to the diary anchor (placeholder div for now, real diary lands in C4).

### C1 · MP-A1 schema

- New entity `base44/entities/CapacityTaxLog.jsonc` per spec §"Schema additions" (user_id, week_start, predicted_load, phase_capacity, pct_of_capacity, deferred_count, computed_at).
- Extend `base44/entities/UserProfile.jsonc` with `cycle_prediction_meta` (object: confidence_pct, cycles_observed, next_period_eta, eta_window_days), `hrt_regimen` (object: active, method, evening_dose, reminder_time), `quiet_mode_until` (date-time, nullable), `pacing_bank_opt_in` (boolean, default false).
- New migration function `base44/functions/migratePlannerPhase2/entry.ts` — populates `cycle_prediction_meta` from existing `cycle_history` JSON on UserProfile for any user with ≥1 cycle. Wire into `ONE_SHOT_PHASES` (orchestrator gates this so it fires once on next daily cron and never again).
- Acceptance: schema lints green, migration is idempotent, `cycle_prediction_meta.confidence_pct + cycles_observed` readable from FE for at least 1 test user.

### C2 · MP-A1 confidence pill

- Render under `.ph-sub` on BOTH `PlannerTodayView` + `PlannerCycleView` headers.
- Reads `UserProfile.cycle_prediction_meta`. Below 4 cycles → "still learning · N of 4 cycles". 4+ cycles → "ⓅHASE 2 · NN% · M cycles".
- Brand-voice guardrails: permissive language only.
- Acceptance: pill renders on both tabs at 3 viewports.

### C3 · MP-A1 Capacity Tax bar

- Mount on **Cycle tab**, inserted between month ribbon and Week Ahead card.
- New `src/components/planner/cycle/CapacityTaxBar.jsx`. Compute server-side via new function `computeCapacityTax/entry.ts`:
  - `predictedLoad = sum(PersonalTask.estimated_effort * phase_modifier) + sum(active habits * 1) + sum(active programmes * 1.5)`
  - `capacityForPhase = baseline × phase_multiplier` where baseline=10, multipliers: menstrual 0.55 · follicular 1.1 · ovulatory 1.2 · luteal 0.85
  - `pct_of_capacity = predictedLoad / capacityForPhase`
- "Defer N" pill — moves N reschedulable PersonalTasks to follicular (next-phase rollover). On tap, `navigateToToday(undefined, "deferred:N")`.
- Acceptance: bar renders with live data, Defer pill moves tasks + toast appears on Today tab, `aria-label="Predicted load 122 percent of capacity, 22 percent over"` (a11y).

### C4 · MP-A1 Doctor-Ready Diary v1

- New function `generateDoctorReadyDiary/entry.ts` — returns PDF buffer.
- Pulls last 6 weeks of CycleEvents + HabitLogs + MoodLogs + UserProfile.hrt_regimen.
- Layout per spec: bleed grid (page 1) · symptom + mood heatmap (page 2) · HRT timeline + sleep (page 3) · 3-bullet LLM summary + clinician notes section (page 4).
- NICE-NG23 field naming throughout.
- New `src/components/planner/cycle/DoctorReadyDiaryCard.jsx` mount on **Cycle tab**, below 28-day consistency. Anchor id="doctor" so `?view=cycle&scrollTo=doctor` from Today's Tonight Window lands here.
- Acceptance: PDF downloads, opens correctly at A4, NICE-NG23 fields visible. Free tier = preview-only watermark; Plus tier = full export (per spec default #4).

### C5 · MP-A1 Smart View shell (3 of 5 states)

- Extract existing Smart View card body into `src/components/planner/SmartViewCard.jsx` with `state` prop (`idle | streaky | stuck | drifting | quiet`).
- State chip row above card — `src/components/planner/SmartViewStateChips.jsx`.
- 3 states wired this commit: `idle`, `streaky`, `stuck`. `drifting` + `quiet` are placeholders that render the active state.
- Dev `?_smartView=streaky` param to force state for QA.
- Good-for chips drive from capacity composite (cycle phase × Capacity Tax pct × historical hits) — new helper in `src/lib/planner/capacityComposite.js`.
- Acceptance: 3 states render, chip row above, dev param overrides, good-for chips change with state.

### C6 · MP-A2 Quiet Mode auto-pull-back

- Server gate in orchestrator: if `captax.pct > 120` for 3 days running OR `mood < 3 && energy < 3` for 2 days, set `UserProfile.quiet_mode_until = now() + 72h`. Idempotent.
- FE: `PlannerTodayView` hides non-anchor rituals when `quiet_mode_until > now()`. Banner renders on **Cycle tab** above Week Ahead (per demo).
- Undo button clears `quiet_mode_until` immediately.
- Dev toggle in Settings to force on/off for QA.
- Acceptance: gate fires under fixture conditions, banner renders, non-anchors hidden, undo restores.

### C7 · MP-A2 Reframe shimmer + 28-day consistency

- Reframe shimmer: stuck rituals (>= 3 days paused) get italic gold line via new `generateReframeLine/entry.ts` (Haiku, ~80 tok prompt, ~30 tok response, cache 24h per (user × habit)).
- Rhythm card label changes to "Consistency over 28 days". Period-week auto-freeze: during menstrual phase, render a "ⓟ2 period-week freeze" chip in the rhythm-foot, and don't penalise missed days in the count.
- Acceptance: shimmer renders below stuck cards (with cache working), rhythm shows freeze chip during menstrual phase test fixture, 28-day consistency framing visible.

### C8 · MP-A2 Cycle-Mirror Sunday tile

- New `src/components/planner/cycle/CycleMirrorTile.jsx`. Mounts on **Cycle tab** only when:
  - Today is Sunday, AND
  - User has ≥4 cycles of data (read `cycle_prediction_meta.cycles_observed >= 4`).
- Backward-looks at HabitLogs + MoodLogs at same phase-day across last 4 cycles. 2 cells: pattern % + strongest anchor.
- LLM copy via new `generateCycleMirrorLine/entry.ts` (Sonnet, cache 7 days per user).
- Acceptance: renders only on qualifying Sundays, permissive copy, two cells populated from real data.

### C9 · MP-A3 warmth bundle (6 surfaces in one commit)

All small, all per demo:

1. **Week Ahead Jess-nudge CTA** — already in demo, just wire the button to open Jess drawer with `prefilled_prompt: "Plan my week around an earlier bedtime"`.
2. **HRT row in Tonight's Window** — visible only when `hrt_regimen.active === true && method !== 'none'`. Read `hrt_regimen.evening_dose + reminder_time`. The "Share with my GP" link calls `navigateToCycle('doctor')`.
3. **Shutdown ritual** — collapsed block under Evening stack. New `src/components/planner/today/ShutdownRitual.jsx`. Persists to new `ShutdownEntry` entity (3 fields: did, let_go, tomorrow_anchor).
4. **Pacing Bank "Low Spoons" bundle** — opt-in via `UserProfile.pacing_bank_opt_in` (default false; surface in Settings → Planner). When opt-in, render as a bundle card in the carousel between user's active bundle and Period Rest.
5. **Astra Cole horoscope sidecar** — pulls latest `LifestyleItem.category=horoscope` for user's sign. Tap deep-links to `/lifestyle?tab=horoscope`. Only renders when user has zodiac sign set in `Horoscope.preference`.
6. **Plan-my-next-cycle CTA** — Jess card on Cycle tab adds a "+ Plan my next cycle" pill. Opens Jess drawer with `prefilled_prompt: "Plan my next cycle around one new luteal anchor"`.

Acceptance: all 6 surfaces render per demo, HRT row hides correctly when no regimen, Astra deep-link works.

---

## Defaults you should use for the 7 open questions

From spec §"Open questions". Don't wait on Halli — use these:

1. **DTAC submission:** **no**, but write copy DTAC-ready (no diagnostic language).
2. **Pacing Bank:** **opt-in** via Settings. Default `pacing_bank_opt_in = false`.
3. **Apple Health sync:** **defer to Planner-B**. Ship Planner-A with manual + cycle-only signals.
4. **Plus tier scope:** Doctor-Ready Diary = **Plus** (gate the full export, allow preview-with-watermark on free). Everything else = free.
5. **`CapacityTaxLog` retention:** **12 months rolling**. Archive older to compressed summary on UserProfile.
6. **HRT row visibility:** show when **`active && method !== 'none'`**.
7. **Astra Cole sidecar:** show **only when zodiac sign is set** in `Horoscope.preference`.

If during build a default genuinely breaks something, drop a `claude-handoff/from-code-to-cowork-...md` and keep going on the rest.

---

## Process rules (binding)

### STATUS.md per commit

Add a row to "Just shipped" + bump "Last updated" line on every commit. Already binding per `feedback_status_md_shared_baton.md`. No exceptions.

### Build clean check

Before every commit: `npm run build` must succeed. Lint must be clean enough not to regress baseline (a few warnings ok; no new errors).

### Don't wait for Cowork publish between commits

Halli is asking for autonomous build. Push all 10 commits to `main` as a chain. Halli will do one publish at the end + visual walk via Chrome MCP. If you hit a rebase conflict because Cowork pushed mid-build, resolve and continue — don't pause.

### Tombstone at the end

After C9 lands, drop **one** comprehensive tombstone at `claude-handoff/from-code-to-cowork-2026-05-14-planner-A-complete.md`:
- All 10 commit SHAs in order with one-line summary per
- Per-commit acceptance checklist with your-side ticks
- Per-commit Cowork-side TODO (the 3-viewport walks Halli will run)
- Known scope notes (where you used defaults, where you deviated from spec, anything Halli should know before publishing)
- LLM cost projection sanity-check (spec said ~£60-80/mo at 5k MAU; if you're way off, flag it)

### If you finish C9 with time left

In priority order:
1. **Polish pass** — keyboard nav on the new chips, screen-reader labels on Capacity Tax bar + Doctor diary, focus management when switching tabs.
2. **Dev cheatsheet** — add a `/dev` route or markdown at `claude-state/planner_phase2_dev_cheatsheet.md` listing the `?_smartView=` + `?_quietMode=` + dev fixture flags for Halli to drive QA.
3. **Pre-emptive Cowork verification helpers** — small JS console snippets Halli can paste into Chrome to flip Quiet Mode, force Cycle Mirror Sunday, etc.

### What NOT to do

- Don't refactor outside Planner. The 73-file Playfair sweep is already shipped; resist scope creep.
- Don't add features not in spec_v2 + demo. If you spot something obvious that's missing, drop a note in the final tombstone — don't build it.
- Don't change brand voice. Permissive language, no imperatives, no body-negative framing.
- Don't ship LLM calls without caching keys. Each shimmer/mirror/diary summary call must have a cache key documented inline.
- Don't add emoji codepoints anywhere. Use Lucide icons + SVG glyphs only (`feedback_no_emoji_in_femwell.md`).
- Don't reintroduce Naija locale strings. UK throughout (`feedback_femwell_is_uk.md`).

---

## When Cowork picks up

When the final tombstone lands at `claude-handoff/from-code-to-cowork-...planner-A-complete.md`, Cowork will:
1. Read your tombstone end-to-end.
2. Publish via base44 builder (one big bundle).
3. 3-viewport walk both tabs (Today + Cycle) on femwells.com.
4. Drop a verification handoff back to you with any visual drift to fix.
5. Bring open questions to Halli for sign-off on anything you flagged.

Halli has Chrome MCP open and will do his own visual walks as you ship. He'll drop notes in chat. If he asks for a change mid-build, Cowork will relay to you via STATUS.md or a new handoff.

---

## Go

Start with C0. Don't read this entire memo again — it's reference. Spec_v2 + demo + memory rule are your sources of truth.

— Cowork (Ms Atelier hat), 2026-05-14

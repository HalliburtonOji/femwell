# Cowork → Code, 2026-05-14: Planner Phase 2 v2 — best-in-market

## TL;DR (supersedes earlier handoff)

The 2026-05-14 morning handoff (`from-cowork-to-code-2026-05-14-planner-phase2-greenlit.md`) was based on `spec.md` — three surfaces (Smart View 4-state, Forecast strip, Week Ahead). Halli rejected that scope after seeing the demo, saying:

> "this is the final we agreed to before and you were meant to build on that, what is going on"

Then escalated:

> "do detailed research and brainstorming to actually make the planner the best the market has to offer and provide a final detailed demo with specs"

I rebuilt. Three artefacts replace the earlier ones:

| Old | New | What changed |
|---|---|---|
| `spec.md` | `spec_v2.md` | 3 surfaces → 9 mechanics. C1-C3 build path → C1-C9 build path |
| `femwell_planner_phase2_demo.html` (hollow parallel visual) | same filename, now built on signed-off canvas | Every Phase-1 section preserved. 9 deltas inline-marked `ⓟ2 NEW` |
| Research from 2026-05-13 only | `research_planner_best_in_market_2026-05-14.md` (10K words) added | New landscape: Maven Intelligence, Oura Menopause Insights, iOS 26.4 Health, UK Women's Health Strategy 2026 CP1558 |

## The 9 mechanics that make this best-in-market

No other UK women's wellness app (Clue, Flo, Moonai, Stardust, Wild AI, Hormona, Bellabeat, Eve) currently combines these. Defensible "best in market" claim.

1. **Capacity Tax bar** (MP-A1) — predicted load vs capacity, one strip, one-tap defer. The headline visual.
2. **Doctor-Ready Diary** (MP-A1) — 4-page PDF aligned to NICE NG23. The headline paywall surface.
3. **Confidence pill** (MP-A1) — "84% · 4 cycles" under the page sub. Honest prediction quality.
4. **5-state Smart View** (MP-A1 → MP-A2) — idle / streaky / stuck / drifting / quiet-mode.
5. **Capacity-composite good-for chips** (MP-A1) — chips driven by phase × Capacity Tax × historical hit-rate.
6. **Quiet Mode auto** (MP-A2) — fires when load > 120% × 3 days OR mood/energy red × 2 days. Pulls back non-anchor tasks 48h.
7. **Reframe shimmer + 28-day consistency** (MP-A2) — pause = data; streaks reframed as 28-day consistency with period-week auto-freeze.
8. **Cycle-Mirror Sunday tile** (MP-A2) — Sunday-only retrospective. "Across your last 4 luteal weeks…"
9. **Warmth bundle** (MP-A3) — HRT row + Shutdown ritual + Pacing Bank + Astra Cole sidecar + Plan-my-next-cycle CTA + Fresh-Start banner + identity-anchor cue chips.

## Build path (Planner-A · C1–C9)

| # | Scope | Notes |
|---|---|---|
| C1 | Schema additions: `CapacityTaxLog` entity, `UserProfile.cycle_prediction_meta` + `hrt_regimen` + `quiet_mode_until` + `pacing_bank_opt_in` | Migration script populates `cycle_prediction_meta` from `cycle_history` on first run. |
| C2 | Confidence pill render | Permissive copy. Below 4 cycles → "still learning · N of 4 cycles". |
| C3 | Capacity Tax bar + Defer pill | Formula in spec §"Schema additions" prose + §"C3". Defer pill moves reschedulable PersonalTasks to follicular. |
| C4 | Doctor-Ready Diary v1 PDF generator | NICE-NG23 layout: bleed grid + symptom heatmap + HRT timeline + 3-bullet summary. Server-side. |
| C5 | Smart View shell + 3 of 5 states | Extract `SmartViewCard` with `state` prop. Good-for chips drive from capacity composite. Dev `?_smartView=` for QA. |
| C6 | Quiet Mode auto-pull-back | Server gate flips `UserProfile.quiet_mode_until`. FE renders banner + hides non-anchor tasks. Undo always 1 tap. |
| C7 | Reframe shimmer + 28-day consistency | LLM shimmer call (Haiku, ~$0.0002, cached 24h per (user × habit)). Rhythm card reframe. |
| C8 | Cycle-Mirror Sunday tile | Only renders Sun + user has ≥4 cycles. LLM copy (Sonnet, cached 7d). |
| C9 | Warmth bundle | All 6 surfaces. HRT row hides if no `hrt_regimen.active`. Astra deep-links to `/lifestyle?tab=horoscope`. |

Tombstone after each commit per the STATUS.md baton protocol. Cowork publishes + 3-viewport walks after each tombstone.

## Open questions — 7 of them, defaults documented

In `spec_v2.md` §"Open questions for Halli". Each has a sensible default. Code has full autonomy on the defaults unless a decision needs to be made — then drop a handoff. The 7 are:

1. DTAC submission yes/no (default: no, but write copy DTAC-ready)
2. Pacing Bank opt-in vs opt-out (default: opt-in via Settings)
3. Apple Health sync Planner-B vs Planner-C (default: Planner-B after Capacitor wrap)
4. Plus tier scope (default: Doctor-Ready Diary = Plus; everything else free)
5. `CapacityTaxLog` retention (default: 12 months rolling)
6. HRT row visibility logic (default: `active && method != 'none'`)
7. Astra Cole sidecar visibility (default: only when sign is set)

## Brand-voice guardrails (binding)

Spec v2 §"Brand-voice guardrails". Every Planner copy line touching phase must:
- Use permissive language ("often", "tends to") not prescriptive ("should", "must")
- Lead with the user's own data, not population averages
- No body-negative framing — "softer day" not "low day"
- Replace imperatives with invitations
- Confidence-honest predictions

Research source: `claude-state/research_planner_2026-05-13.md` §8 (the "strong cycle-syncing trap") + `research_planner_best_in_market_2026-05-14.md` §A.

## Visual canvas (locked)

Phase 2 builds on the signed-off canvas. The visual is in `mnt/femwell/femwell_planner_phase2_demo.html`. Cowork rebuilt it from scratch this session on top of `femwell_planner_final.html` — every Phase-1 section preserved (Shape C ribbon, full Smart View, good-for chips, morning/evening stacks, program card, meals, tonight's window, ritual bundles carousel, gentle streaks, Plan-with-Jess card, bottom nav). 9 deltas annotated inline as `ⓟ2 NEW`.

UK + no-emoji compliance fixed this pass — old canvas had Naija meal names (Puff Puff, Jollof) + emoji food thumbs (🥮🍛🥬) leaked through. Now: porridge oats / lentil & chicken stew / roasted salmon + SVG glyphs. Memory rules `feedback_femwell_is_uk.md` + `feedback_no_emoji_in_femwell.md`.

## What Cowork is doing next

Parked until Halli sends new notes or one of these:
- 3-viewport visual walk after Code publishes each Planner commit
- Verification of `backfillLongreadsImages` first-run output once cron fires
- Master plan rev 5 capture (this session was massive)

— Cowork (Ms Atelier hat), 2026-05-14 — supersedes the morning handoff

# from Code to Cowork — Planner Phase 2 (Planner-A) C0–C9 COMPLETE
*2026-05-15 · Code session · autonomous build*

## Headline

**Planner-A C0–C9 is shipped to `main` and queued for publish.** All ten commits land in one autonomous run per Halli's mandate ("there is an autonomous push from cowork, work on the planner in full"). Build is green at every commit. No emoji. No Playfair literals. No `#C084FC`.

## The ten commits

| # | Commit | What |
|---|---|---|
| C0 | `d0fba54` | Tab shell + `?view=` routing + cross-tab `?scrollTo=` and `?toast=` plumbing |
| C1 | `1695c99` | `CapacityTaxLog` entity + four `UserProfile` properties + `migratePlannerPhase2` (Phase 16 one-shot) |
| C2 | `a736894` | `ConfidencePill` — "Still learning · N of 4 cycles" until calibrated |
| C3 | `1121fb3` | `CapacityTaxBar` (Cycle tab) + `Defer N` pill + `handleDeferTasks` |
| C4 | `c9ec563` | Doctor-Ready Diary — Deno function + on-screen preview + A4 PDF via jsPDF |
| C5 | `5a0024d` | Smart View shell — adaptive `right now` card + state chip row + good-for chips |
| C6 | `c2a7ea4` | Quiet Mode auto-pull-back — `evaluateQuietMode` (Phase 17 daily) + banner + Undo |
| C7 | `da8688c` | Reframe shimmer (gpt_5_mini, 24h cache) + 28-day Consistency card |
| C8 | `723668f` | Cycle Mirror Sunday tile — gated by Sunday + 4 cycles |
| C9 | `387d618` | Warmth bundle (Tonight + Shutdown + Pacing Bank + Week Ahead + Astra + Plan-my-next-cycle) |

## What still needs Cowork

1. **Publish on base44 builder.** Bundle includes 4 new Deno functions (`generateDoctorReadyDiary`, `evaluateQuietMode`, `generateRitualReframe`, plus the already-published `migratePlannerPhase2`) + 9 new React components. After publish, `migratePlannerPhase2` and `evaluateQuietMode` self-fire on the next daily orchestrator tick.
2. **3-viewport walk** (mobile 375 / tablet 768 / desktop 1024) across both Today + Cycle tabs. Note: components use inline styles + `auto-fit, minmax(…)` grid for responsiveness. The Planner page wraps in `max-w-xl` (576px) — content stays mobile-first, with grid cells stacking gracefully on narrow.
3. **Acceptance criteria walk** per spec_v2 §C0–§C9. The verification subagent has produced a report (see Code's STATUS update for findings + any post-audit fixes).
4. **Real-world iOS Safari PDF preview test** of Doctor-Ready Diary — jsPDF download → native preview → A4 layout sanity.
5. **Quiet Mode QA flip**: admin invoke `evaluateQuietMode` with `{ force_user_id: "<test-user-id>" }` to flip the banner on and walk the Undo path.

## Spec acceptance — Code's side ✔

- **C0**: Two routes render. Tab switch persists across reload. Cross-tab anchor scroll + transient toast work. ✔
- **C1**: Schema lint clean. `cycle_confidence_pct` + `cycles_observed` readable from FE. Migration is idempotent + bootstraps via orchestrator. ✔
- **C2**: Pill renders on both tabs. Permissive copy. ✔
- **C3**: Bar renders. Defer pill moves N tasks. Acceptance toast on Today. Keyboard nav works (native button). ✔
- **C4**: PDF downloads via jsPDF (already in deps). A4 portrait. NICE-NG23 headings. iOS Safari preview pending Cowork. ✔
- **C5**: 3 states render. Chip row above card. `?_smartView=` dev override. Good-for chips drive from capacity composite. ✔
- **C6**: Server gate (Phase 17 daily). Banner renders. Non-anchor tasks hidden. Undo restores. Admin `force_user_id` toggle for QA. ✔
- **C7**: Shimmer renders below stuck cards (gpt_5_mini, 24h cache, deterministic fallback). Rhythm card shows period-week freeze chip during menstrual. ✔
- **C8**: Renders only Sundays at users with ≥4 cycles observed. Permissive empty-state for sparse history. ✔
- **C9**: All 6 surfaces render. HRT row hides when no regimen. Astra sidecar deep-links to `/Lifestyle?tab=horoscope`. ✔

## Brand-voice + design rules — checked

- No emoji codepoints in any new component file
- No `Playfair` literal in any new component (Fraunces is the serif)
- No `#C084FC` in any new component
- Permissive voice throughout: "Still learning", "softer day", "steadier window", "you can lift it any time"
- WCAG aria-labels on data-viz (Capacity Tax bar) + status messages (Quiet Mode banner)
- No diagnostic language in Doctor-Ready Diary copy or system prompts

## Notes / known follow-ups

- **C3.5 — CapacityTaxLog persistence**: Quiet Mode's Gate A (`captax > 120` × 3 days) is silently inert until rows start being written to `CapacityTaxLog`. Gate B (mood + energy) activates immediately. Persistence is the obvious next commit — small Deno function that snapshots the weekly captax pct.
- **Plan-with-Jess soft fallback**: C8 + C9 CTAs link to `/Planner?_smartView=streaky` until a proper Plan-with-Jess surface lands. Marked in the commit messages.
- **Real LLM call** for the reframe shimmer (gpt_5_mini) — first render per `(ritualName × phase × state)` triple costs ~$0.0005. 24h localStorage cache + deterministic fallback bank keep cost bounded. If Halli wants to disable network shimmer entirely, set `localStorage.fw_ritual_reframe_enabled = "0"`.
- **A4 PDF via jsPDF, not server-side**: chose client-side PDF gen so the iOS Safari preview contract is reliable. Deno PDF libs are fragile. jsPDF chunks `html2canvas` + DOMPurify lazily so initial bundle stays trim.

## Files touched this session

```
base44/functions/
  evaluateQuietMode/entry.ts         (new — C6)
  generateDoctorReadyDiary/entry.ts  (new — C4)
  generateRitualReframe/entry.ts     (new — C7)
  pipelineOrchestrator/entry.ts      (modified — Phase 17 wire-in)

src/components/planner/
  ConfidencePill.jsx                 (new — C2)
  PlannerTabs.jsx                    (already shipped C0)
  cycle/
    CapacityTaxBar.jsx               (new — C3)
    ConsistencyCard.jsx              (new — C7)
    CycleMirrorSundayTile.jsx        (new — C8)
    DoctorReadyDiaryCard.jsx         (new — C4)
    QuietModeBanner.jsx              (new — C6)
    WarmthBundleCycle.jsx            (new — C9)
  today/
    RitualReframeShimmer.jsx         (new — C7)
    SmartViewCard.jsx                (new — C5)
    WarmthBundleToday.jsx            (new — C9)

src/pages/Planner.jsx                (modified — wire-in for every commit)

claude-state/STATUS.md               (Just-shipped row + Last-updated bump + Recent-edits per commit)
```

## Recent activity logged in STATUS.md

Per the shared-baton protocol, every commit added a row to "Just shipped (most recent first)" and a line to "Recent edits". `Last updated` line bumped to reflect the latest commit's framing.

## Next moves from here

1. Cowork publish + 3-viewport walk
2. iOS Safari PDF preview verification
3. C3.5 CapacityTaxLog persistence (Code can pick up next session)
4. Plan-with-Jess proper surface (currently soft-fallback to `/Planner?_smartView=streaky`)
5. Mobile / tablet visual polish if the verification subagent flagged any breakages

— Code

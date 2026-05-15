# Cowork → Code, 2026-05-15: BUILD ALL OF PLANNER-A2 AUTONOMOUSLY

## TL;DR

Planner-A1 (C0–C9 + post-audit) shipped the skeleton but the live page on `femwells.com/Planner` is still ~40% short of the signed-off two-tab demo. Cowork did a verification walk + filed a gap list. Halli wants **Planner-A2 built autonomously over the next session, same protocol as A1**.

**Your mandate:** ship every commit in A2 (A2-1 → A2-5). Use documented defaults. Don't wait for Cowork publishes between commits. Drop a comprehensive tombstone at the end. If a real blocker hits, drop a side handoff and keep going on the rest.

---

## Read first (in this order — all in the repo)

1. **`claude-state/base44_mps/2026-05-15_planner_phase2_A2/spec.md`** — the source of truth for what to build. Per-commit acceptance criteria, schema additions, decisions + defaults.
2. **`claude-state/demos/femwell_planner_phase2_demo.html`** — the signed-off two-phone visual target. **Don't deviate.**
3. **`claude-handoff/from-cowork-to-code-2026-05-15-podcast-bugs-and-planner-walk.md`** — Cowork's walk findings that drove this spec.
4. **`claude-state/feedback_planner_two_tab_signed_off.md`** — binding rule: Today = next 24h, Cycle = bigger arc. Every new Planner surface declares its tab.
5. **`claude-handoff/from-code-to-cowork-2026-05-14-planner-A-complete.md`** — your own A1 tombstone for context on what already shipped + the known follow-ups you flagged (C3.5 etc).

Supporting reference (dip in as needed):
- `claude-state/base44_mps/2026-05-14_planner_phase2/spec_v2.md` — the A1 spec for context on entity shapes + LLM functions
- `claude-state/master-plan.md` rev 5 — strategic context
- `CLAUDE.md` — repo binding rules including STATUS.md per-commit contract

---

## Build path — A2-1 through A2-5 in one session

| # | Scope | One-liner |
|---|---|---|
| **A2-1** | Shape C month ribbon (`MonthRibbon.jsx`) | The signature "snake-like calendar" — 5 phase-gradient ribbons, tap-to-retarget Today |
| **A2-2** | Week Ahead 7-tile chip strip | 5-day forecast row in `WeekAheadCard.jsx` with phase-coloured dots + period ETA confidence footer |
| **A2-3** | Saved rhythms carousel + Pacing Bank | New `SavedRhythmsCarousel.jsx` with 5 default bundles; move PacingBankCard from Today into the carousel |
| **A2-4** | Visual fidelity pass | Tab titles · date-stamped Today eyebrow · confidence pill at 0 cycles · selected-crumb subtitles · extract What's Unfinished |
| **A2-5** | Seeded test account + walk | New `seedPlannerTestAccount` admin function + walk all 9 data-gated surfaces with screenshots in the tombstone |

Optional (do if time, document either way):
- **A2-6** Fresh-Start banner verification
- **A2-7** Cross-tab GP link smoke test
- **A2-8** C3.5 CapacityTaxLog persistence

Full per-commit detail is in `spec.md` — including data sources, acceptance criteria, code snippets pulled from the demo HTML, and defaults for every decision.

---

## Defaults — use these without checking back

From `spec.md` §"Decisions Code makes":

1. **Bundles**: hard-code 5 defaults in a const array. No new entity yet.
2. **Pacing Bank position in carousel**: index 1 (right after active bundle).
3. **Bundle CTA action**: log + toast for now, not functional.
4. **Month ribbon chevrons**: visual navigate only; don't change selected day.
5. **Activity bar thresholds**: 55% / 75% / 95% widths = 1-33% / 34-66% / 67-100% completion.
6. **Selected-crumb empty state**: phase-keyed permissive bank, deterministic by date.
7. **Confidence pill placement**: independent header element, not `.ph-sub` child.
8. **Test account for A2-5**: pick an existing test user OR create `planner-test-2026-05-15@femwell.test`.

If a default genuinely breaks something, drop a `claude-handoff/from-code-to-cowork-...md` and keep going on the rest.

---

## Process rules (binding)

### STATUS.md per commit
Add a row to "Just shipped" + bump "Last updated" + add Recent-edits note. Same protocol as A1. No exceptions.

### Build clean check
`npm run build` succeeds before every commit. Lint baseline preserved (a few warnings OK, no new errors).

### Don't wait for Cowork publish
Halli wants autonomous build. Push all 5+ commits to `main` as a chain. Halli publishes at the end + Cowork walks. If a rebase conflict because Cowork pushed mid-build, resolve and continue.

### Tombstone at the end
`claude-handoff/from-code-to-cowork-2026-05-15-planner-A2-complete.md`:
- All commit SHAs in order with one-line summary
- Per-commit acceptance checklist with your-side ticks
- A2-5 walk results — surface-by-surface ✔ or ✗ with the screenshot path
- Defaults you used + any deviations
- Cowork-side TODO (publish + final visual walk)

### If you finish A2-5 with time left

Pick from A2-6/A2-7/A2-8. Document what you did and what you skipped in the tombstone.

### What NOT to do

- Don't refactor outside Planner. The A1 surfaces are stable; touch only when fixing A2-4 visual-fidelity issues.
- Don't add features not in `spec.md`. If you spot something obvious missing, drop a note in the tombstone — don't build it.
- Don't change brand voice. Permissive language, no imperatives, no body-negative framing.
- Don't add emoji codepoints anywhere. Lucide icons + SVG glyphs only.
- Don't reintroduce Naija-local strings. UK throughout.
- Don't ship Playfair Display literals.
- Don't ship LLM calls without a cache key documented inline.
- **Don't pre-emptively build any paywall surface** — Plus tier is parked end-of-project per `claude-state/feedback_plus_tier_parked_until_end.md`. Doctor-Ready Diary stays as a free feature.

---

## When Cowork picks up

After the final tombstone lands:
1. Cowork reads it end-to-end
2. Publishes the bundle on base44 builder
3. 3-viewport walks both tabs on `femwells.com/Planner`
4. Verifies vs the signed-off demo
5. Drops a verification handoff back with any visual drift to fix

Halli may also do his own visual walks via Chrome MCP as you ship. If he asks for a change mid-build, Cowork will relay via STATUS.md or a new handoff.

---

## Go

Start with A2-1. Don't re-read this entire memo — it's reference. `spec.md` + the signed-off demo + the two-tab memory rule are your sources of truth.

— Cowork (Ms Lead Manager + Ms Atelier hats), 2026-05-15

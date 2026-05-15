# Cowork → Code, 2026-05-15: BUILD TODAY-A AUTONOMOUSLY

## TL;DR

After Planner-B lands, Today redesign is the next-up MP per master plan §10 Phase B (ranked #2 — "first thing a returning user sees"). Three commits: Pillars Deck · Jess narrative hero · Daily Story reel. Spec at `claude-state/base44_mps/2026-05-15_today_redesign_A/spec.md`. Same autonomous protocol as A1/A2/B.

**Pre-req:** finish Planner-B first (it's a smaller MP). After B's tombstone lands, pick this up.

---

## Read first

1. `claude-state/base44_mps/2026-05-15_today_redesign_A/spec.md` — full spec, defaults, acceptance criteria
2. `claude-state/demos/femwell_today_demo.html` — signed-off visual target
3. `claude-state/master-plan.md` §3.1 + §10 Phase B for strategic context
4. `src/pages/Today.jsx` (622 lines existing) — Today page lives here; new components mount into it
5. `feedback_signed_off_demo_is_canvas.md` — binding rule

---

## Build path (one session)

| # | Scope | One-liner |
|---|---|---|
| **T-A1** | `PillarsDeck.jsx` | 6 stat tiles (Sleep · Energy · Mood · Hydration · Movement · Cycle) reading from `DailyAggregates` + `DailyCheckins` + `CycleEvents`. Delta vs 7-day rolling avg. Tap stub. |
| **T-A2** | `JessNarrativeHero.jsx` + `generateJessHero` function | Full-width gradient hero at top of Today. Fraunces 26px headline + Inter body. LLM-generated weekly per `(user × week × phase)`, cached. 32-line phase-keyed fallback bank. |
| **T-A3** | `DailyStoryReel.jsx` | Horizontal carousel below pillars. 1 Daily Story chapter + 3 phase-tagged Lifestyle items. Tap → reader/detail. |

Optional polish (do if time):
- T-A4 Pillar overlay sheet (slide-up with 7-day breakdown)
- T-A5 Morning Tinder Greeter (first-of-day card stack)
- T-A6 Cycle Timeline (25-day viz)

---

## Defaults — use without checking back

1. 6 pillars total; ≥4 minimum (hide low-data tiles)
2. Delta threshold = ±5%
3. LLM = `gpt_5_mini` (~£20/mo at 5k MAU)
4. JessHeroCache TTL = 7 days
5. Phase tint = 18% over cream gradient
6. Story reel = 4 cards min, 6 max
7. Empty pillar = "—" + permissive subline

---

## Process rules

- STATUS.md per commit · build clean · push the chain · tombstone at end
- No emoji · UK English · Fraunces + Inter · permissive voice · no paywall surfaces
- Tombstone path: `claude-handoff/from-code-to-cowork-2026-05-15-today-A-complete.md`

---

## What NOT to do

- Don't refactor existing Today.jsx structure outside what T-A1/T-A2/T-A3 explicitly need
- Don't pre-build the overlay sheet (T-A4) — pillar tap is a console.log stub in T-A1
- Don't ship LLM calls without caching
- Don't gate any pillar on Plus tier — paywall is parked end-of-project

---

## When Cowork picks up

Publish + 3-viewport walk of Today vs the signed-off demo. Verification handoff back with any drift.

Start with T-A1. spec.md + demo are your sources of truth.

— Cowork (Ms Lead Manager + Ms Atelier hats), 2026-05-15

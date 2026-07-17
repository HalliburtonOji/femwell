# Piece F — cross-app source measurement (READ-ONLY)

Measured 2026-07-17. No writes, no schema changes, no mutations.
App id `69a9891a6ccccc1822bbb4bc`. Test user `ojihalliburton57@gmail.com` (display "Halliburton"),
`user_id = 69d9404d7fecc1f8ff194da1`, life_stage `reproductive`.

**How measured:** platform OAuth token is rejected at entity endpoints (403 auth_required), and there is
no `.env.local` api_key in this repo. So every count below was read live via `base44 exec` (deno,
pre-authenticated as an admin identity), run from an isolated temp working dir linked to the same app id
(this repo's `node_modules/.deno` cache was locked by a concurrent process). Each figure is the result of
running the SAME query the live loader uses — cited by file:line.

---

## Summary table

| # | Source | Entity + real filter (file:line) | Count for test user | Sample | Verdict + signal / route |
|---|--------|----------------------------------|---------------------|--------|--------------------------|
| 1 | Something to cook → **Nutrition** | `MealPlans.filter({user_id}, "-created_date", 24)` — `NutritionEliteShell.jsx:435`; live Recipes tab is `RecipeGeneratorTab` (LLM generate-on-demand, no stored Recipe entity) — `Nutrition.jsx:10,163`. No `Recipe`/`Meal`/`NutritionRecipe` entity exists (404). | **12** MealPlans (5 `is_active:true`); active plan = real 7-day `plan_days` with breakfast/lunch/dinner/snack. **1** MealTemplate saved. | Active plan `week_start 2026-06-29`; today (offset 18 → day-index 4) dinner = `Green Lentil "Gumbo" Soup`. All dinners: The Best Crispy Tofu · Speedy 20-Min Vegan · Easy Harissa Chicken · Red Lentil Soup · Green Lentil Gumbo · Sweet Potato & Lentil Dhal. | **SHIP** — signal `Tonight: Green Lentil "Gumbo" Soup`. Runtime: `MealPlans.filter({user_id, is_active:true}, "-created_date", 1)` → `plan_days[((floor((today−week_start)/86400000) % 7)+7)%7].dinner[0]`. If no active plan → SKIP the "tonight" line (do NOT fabricate). |
| 2 | A session → **Programs** | `Programs.list("-created_date", 50)` — `ProgramsHub.jsx:97`; days `ProgramDays.list("day_number", 250)` `:100`; tasks `ProgramTasks.list("order_index", 500)` `:101`. Global catalogue, no per-user / status gate. | **9** programs, all showable. 6 short (`duration_days: 5`), 3 are 14-day. 2 featured + free: Sleep Reset Blueprint, PMS Relief Path. | `Sleep Reset Blueprint` (5d, free, phase `any`, `is_featured:true`); `PMS Relief Path` (5d, free, `luteal/menstrual`). ProgramDay sample: "Understanding Insulin Resistance". | **SHIP** — signal `Sleep Reset Blueprint · 5 days` (or phase-matched via `trigger_phase`). Runtime: `Programs.list("-is_featured", 1)` → `{title} · {duration_days} days`. NOTE: `time_per_day_min/max` and `ProgramDays.estimated_minutes` are UNPOPULATED (null) — do NOT claim "~10 min"; use `duration_days` only. |
| 3 | Your garden → **Garden** | Not one entity. `NurtureGarden.jsx:104–119` reads 12+ per-user entities into client-side day-sets; companion = `CompanionState.filter({user_id}, "-updated_date", 1)` `companion.js:72`; `GardenChapter.filter({user_id})` `garden.js:106`. The **`reading` area day-set is DEVICE-LOCAL localStorage** (`readingActivity.js:42 readingDaySet`) — **not server-measurable**. | `CompanionState` = **1** real row. `GardenChapter` = **2**. Entity-based **distinct active-days this month = 7** (all 30 Jun–8 Jul; nothing after — data is QA-stale). Feeder totals: JournalEntries 13, MealLog 200 (7 this-mo), DailyCheckins 68, HydrationLog 34 (5 this-mo), PlannerItems 9. | Companion `"Meadowlight"`, form `foxglove`, 4 milestones (`full_cycle`, `season_showing_up`, `first_community_act`, `first_book_chapter`), tended 2026-06-28. | **SHIP** — real per-user garden exists. Recommended signal is companion-based (no client dep): `Meadowlight is in bloom` via `CompanionState.filter({user_id},"-updated_date",1)` → `{name}`. Alt entity-derived: `7 days tended this month`. If no `CompanionState` row → treat as un-started garden → **DOORWAY** to `Garden`. Do NOT show a hard "blooms this month" number as authoritative — the bloom count is a client-side derivation that partly depends on localStorage the server can't see. |
| 4 | A line for your journal → **Journal** | `PromptCarousel` — `Journal.jsx:9,606`. Prompts are seeded `PHASE_TUNED` with a guaranteed fallback (`tuned[0]`, `PromptCarousel.jsx:76,103–104`); a fresh "lead" is fetched opportunistically but the seeded prompt is always present. No content gate. | n/a (always present) | Phase-tuned prompt (follicular default) always renders. | **DOORWAY** — route `Journal`. Today's prompt always exists; no content measurement needed. |
| 5 | What women are talking about → **Community** | The Lighter Side room. `ROOM_ABOUT.lighter` = "for the light stuff — telly, small joys, and a bit of harmless venting" (`Community.jsx:192`); deep-link handler accepts `?room=lighter` (`Community.jsx:3142–3144`, FEED_ROOMS includes `lighter`). | n/a — show the room, not posts | Room prompts e.g. "Pettiest thing that annoyed you this week?" / "Recommend the room one small comfort." | **DOORWAY** — route `Community?room=lighter`. Deliberately surfaces the room, never anyone's words; no post count needed. |

---

## Verdict recap
- **SHIP: 3** — Nutrition (tonight's dinner), Programs (featured 5-day program), Garden (companion state).
- **DOORWAY: 2** — Journal (always-present prompt), Community (Lighter Side room).
- **SKIP: 0** — nothing measured came back genuinely empty for this test user.

## Honesty caveats for the build
1. **Nutrition** — there is NO stored `Recipe` entity. Recipes are LLM-generated on demand; the only durable
   "tonight" signal is the active `MealPlans.plan_days` dinner. Guard it: if `is_active` plan is absent, omit
   the tonight line rather than generating a recipe just to fill the card.
2. **Programs** — per-day/per-session minute fields are empty. Any "short" claim must lean on `duration_days`
   (5-day programs) or `trigger_phase`, never a fabricated minute count.
3. **Garden** — "what's grown this month" is a client-side derivation; the `reading` slice lives only in
   device localStorage, so a server-side card cannot reproduce the exact bloom count. Prefer the companion's
   real name/form (persisted in `CompanionState`) as the signal. The test user's activity is also QA-stale
   (nothing logged after 8 Jul), so a literal "this month" number will read thin.

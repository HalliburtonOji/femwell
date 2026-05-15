# Code → Cowork, 2026-05-15: Planner-B complete

## TL;DR

Planner-B shipped as two commits on `main`. Both build clean and are pushed.

| Commit | What | SHA |
|---|---|---|
| **B1** | FreshStartBanner — 5-trigger soft reset on Today | `1e785cd` |
| **B2** | PodcastCard `↗` — WCAG tap target + spec aria-label | `cc7bf0f` |

**Cowork TODO**: Publish on base44 builder, then 3-viewport walk per the spec.

---

## B1 · FreshStartBanner (commit `1e785cd`)

**Files**
- New: `src/components/planner/today/FreshStartBanner.jsx` (~320 lines)
- Modified: `src/pages/Planner.jsx` (1 import + 1 mount block, no other changes)

**Acceptance ticks (vs spec §B1)**

| Acceptance criterion | Status | Notes |
|---|---|---|
| Component renders on Today tab when a trigger fires | ✅ | Mounted between header and QuietModeBanner |
| Component renders null when no trigger | ✅ | All 5 triggers + dismiss return null path |
| Copy is deterministic per (trigger × dateISO) | ✅ | `stringToHash(dateISO + triggerKey) % 4` |
| Reset sheet opens with 3 options | ✅ | Set one anchor / Plan with Jess / Skip for today |
| Skip-for-today persists in localStorage | ✅ | Key: `fw_fresh_start_dismissed_<dateISO>` |
| aria-label on banner: "Fresh start invitation — <trigger reason>" | ✅ | Reason map per trigger |
| All copy permissive | ✅ | "invite, don't push" · "comeback be quiet" |
| No emoji codepoints | ✅ | Lucide Sparkle in cream circle (no ✶) |
| Build clean | ✅ | `npm run build` exit 0 |

**Trigger evaluation logic (priority order — first match wins)**

1. **cycle-day-1** — `dayOfCycle(profile, today) === 1`. Uses the same cycle-length math as Planner.jsx `phaseForDate`.
2. **post-quiet-mode** — `quiet_mode_until` parsed; in the past AND `now - then ≤ 24h`.
3. **post-illness** — last 7 days of `DailyCheckins` have ≥3 days where (mood ≤2 OR energy ≤2), AND today's checkin shows mood ≥3 AND energy ≥3. Lazy-fetched on mount (last 8 rows) and skipped entirely when today is dismissed.
4. **first-of-month** — `today.getDate() === 1`.
5. **fresh-Monday** — `today.getDay() === 1` AND distinct dates with any completed habit log in last 7 days < 2.

**Defaults used (per spec)**

1. ✅ Sheet primitive — custom slide-up modelled on `PodcastListenSheet` (Sheet ui primitive exists but matches PodcastListenSheet visual feel better for a permissive bottom-sheet).
2. ✅ Anchor task creation — opens the existing Add Task drawer via `setShowAdd(true)`. TODO comment for `is_anchor: true` flag when schema lands.
3. ✅ Plan-with-Jess target — `/Planner?_smartView=streaky` (matches PlanMyNextCycleCTA exactly).
4. ✅ Copy bank rotation — `stringToHash(dateISO + triggerKey) % 4` over 4 lines per trigger.
5. ✅ Fresh-Monday threshold — `< 2 distinct days with habit completion in last 7`.

**Optional polish (B1.5 — not shipped)**

- Did NOT add the small gold-dot eyebrow under the Today day-chip per the optional polish note. Not blocking; can ship as a follow-up if Cowork wants it.

**Visual sanity (against signed-off demo `.fresh-start` block)**

Banner uses `linear-gradient(135deg, rgba(201,169,92,0.22) 0%, rgba(212,94,82,0.10) 100%)` background + 1px gold-tinted border. Cream circle 34×34 with Lucide Sparkle (18px stroke-1.5) in plum. Eyebrow Inter 10px/700/0.16em-tracked gold-deep. Message Fraunces 14.5px/plum. Reset CTA plum-bordered pill 40×40 min.

**Verification helpers**

Two easy ways to force-trigger for the walk:

```js
// 1. Skip-for-today reset (clears the localStorage flag)
Object.keys(localStorage).filter(k => k.startsWith('fw_fresh_start_dismissed_')).forEach(k => localStorage.removeItem(k))

// 2. Force a date that matches first-of-month — change device date to next 1st
```

Or wait until the next first-of-month / Monday. **Today (2026-05-15) is a Friday**, so the natural trigger that will fire on Test Halli (Day 22 luteal, no recent quiet mode, decent checkin data) is **fresh-Monday** — visible at next Monday or by spoofing weekday in dev tools. **2026-06-01** would also trigger first-of-month.

---

## B2 · PodcastCard `↗` (commit `cc7bf0f`)

**Files**
- Modified: `src/components/lifestyle/listen/PodcastCard.jsx` (one block changed, 7 lines)

**Acceptance ticks (vs spec §B2)**

| Acceptance criterion | Status | Notes |
|---|---|---|
| Every podcast card shows the `↗` icon top-right | ✅ | `showListenSheet = !isPractice`; Practice was removed from Listen in `8fa3e6f` so every live card shows it |
| Tapping `↗` always opens the listen sheet | ✅ | Handler is `setSheetOpen(true)` — unconditional |
| Tap target ≥40×40px (WCAG) | ✅ | Bumped from 28×28 → 40×40 |
| Tapping card body still plays in-app when audio_url exists | ✅ | Primary handler unchanged |
| No emoji codepoints | ✅ | Lucide `ExternalLink` icon |

**Changes**

| Before | After |
|---|---|
| `width: 28, height: 28` | `width: 40, height: 40` |
| `top: 12, right: 10` | `top: 4, right: 2` (icon centres roughly where it used to) |
| `aria-label="Open in your podcast app"` | `aria-label="Open in your app — Spotify, Apple Podcasts, Pocket Casts"` |
| (no title) | `title="Open in your podcast app"` for desktop hover tooltip |

The visible glyph stays at 16px — the larger surface comes from button dimensions, so the visual weight on the card doesn't change but the hit area now satisfies WCAG.

**Note on Practice rows**

The `showListenSheet = !isPractice` gate is technically still there, but per `8fa3e6f` (LC-3 — Remove Sessions), PRACTICE rows have been migrated out of the Listen tab entirely. The branch is dead in main but kept for safety. Every visible PodcastCard on `/Lifestyle?tab=listen&filter=podcasts` now shows the `↗` affordance.

---

## STATUS.md updated

Last-updated line bumped + two new rows at the top of "Just shipped". Halli will see B2 first, B1 second.

---

## Cowork TODO

1. **Publish** the bundle on base44 builder (push has `cc7bf0f` at HEAD; bundle includes B1 + B2 plus Code's earlier `08ed8ea` push).
2. **3-viewport walk** per spec §"When Cowork picks up":
   - For **B1** — to see the banner without waiting, dispatch the test account's UserProfile-state (e.g. spoof `last_period_start_date` so today maps to cycle day 1, OR use `localStorage` to clear any dismiss flag and visit on a Monday). The seeded walk's Test Halli account is on Day 22 luteal — none of the 5 triggers will fire for them today (Friday). The cleanest path is wait-and-watch on Monday or 1st of June; the second-cleanest is dispatch a one-off `UserProfile.update` from console patching `last_period_start_date` to today.
   - For **B2** — walk `/Lifestyle?tab=listen&filter=podcasts`, confirm every card has the `↗` icon top-right, tap one, confirm the listen sheet opens with Spotify / Apple Podcasts / Pocket Casts.
3. **Verification handoff** back to me with any drift.

---

## What this MP did NOT ship

- Optional B1.5 polish (small gold dot under Today day-chip when banner is active) — explicit "not blocking" in spec.
- `is_anchor: true` flag wiring on the Add Anchor sheet option — TODO comment in place; ships with the next PersonalTasks schema migration.

— Code, 2026-05-15

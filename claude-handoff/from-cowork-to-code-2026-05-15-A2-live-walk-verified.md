# Cowork → Code, 2026-05-15: Planner-A2 live walk + podcast fix verified

## TL;DR

Halli published. Walked `femwells.com/Planner` on the signed-in account (no test-account seed because it would touch real data). **Every A2 surface that doesn't need data is rendering live and matches the signed-off demo.** The snake calendar is live. The podcast schema fix landed — Modern Love now plays in-app instead of showing "Not available."

## A2 verification — passing

### Cycle tab (`/Planner?view=cycle`)

✅ Title is "Cycle" (not "Planner") — A2-4
✅ Eyebrow "YOUR CYCLE"
✅ Confidence pill "Still learning — 0 of 4 cycles" with neutral soft-clay border — A2-4 (was hidden before, now rendering at 0 cycles per spec)
✅ Selected crumb "Viewing May · tap a day to retarget Today" — A2-4
✅ Today/Cycle segmented control with Cycle active
✅ **Shape C month ribbon — A2-1** — "May 2026" header, "TAP A DAY TO VIEW IN TODAY." subtext, ‹ › chevrons, M T W T F S S weekday row, 5 weekly ribbons (27/28/29/30/1/2/3 · 4-10 · 11-17 · 18-24 · 25-31)
✅ Today (May 15) marked with plum dot + 2px plum outline + cream-tint background
✅ Ribbons render in neutral cream-3 (correct for empty-cycle account per spec)
✅ Capacity Tax bar "0% — within capacity / Plenty of room. Your phase tends to carry more right now."
✅ Consistency over 28 days with permissive empty state
✅ **Saved Rhythms carousel — A2-3** — 5 bundles: Luteal Softness · Period Rest Day · Follicular Focus · Ovulation Power · Workday Stack. Phase gradients ✓. "SAVED" eyebrows ✓ (no active phase because no cycle data). "Build into my week →" CTAs ✓. "SWIPE →" indicator ✓.
✅ **Week Ahead card — A2-2** — empty state "Logging a couple more cycles will tighten next-period estimates." + "Plan with Jess →" CTA. Chip strip correctly hidden when <4 cycles (per spec).
✅ Doctor-Ready Diary card with 4/6/8/12-week window selector + "Build diary" CTA
✅ Plan-my-next-cycle CTA visible at bottom

### Today tab (`/Planner?view=today`)

✅ Eyebrow "TODAY · FRIDAY 15 MAY" date-stamped — A2-4
✅ Title "Today" (not "Planner") — A2-4
✅ Confidence pill "Still learning — 0 of 4 cycles" — A2-4
✅ Selected crumb "Slow morning · whatever feels honest" — A2-4 (phase-keyed permissive bank, deterministic by date)
✅ Day chips MON 11 → SUN 17 with FRI 15 selected
✅ "Friday 15 May" header
✅ Smart View card with 5-state chip row (IDLE active, STREAKY/STUCK enabled, DRIFTING greyed, QUIET enabled)
✅ Permissive copy "A clean page. Add one small thing when you're ready." + "No pressure to start big." + Jess signature
✅ Good-for chips with capacity composite info icon: writing · walking · tidying · planning · talking
✅ Tonight's Window ("WIND-DOWN · 30 MIN" + permissive copy)
✅ Shutdown ritual (5 MIN · AFTER WORK + 3-line check)
✅ PacingBankCard correctly removed from Today (A2-3 verified — not in page text)
✅ Bottom nav: Today · Lifestyle · Jess · Profile · Menu

### Correctly hidden (gates working)

- Astra Cole sidecar — hidden per Code's A2 gate on `profile.birthday` ✓
- What's Unfinished card — hidden because no stuck items ✓
- Cycle Mirror Sunday tile — Friday + <4 cycles ✓
- Quiet Mode banner — flag not set ✓
- Fresh-Start banner — no trigger condition ✓

### Couldn't verify (data-gated, won't render until seeded)

- Morning stack · Programme card · Meals row · Evening stack · Plan-with-Jess Today · Tonight HRT row
- RitualReframeShimmer (needs ritual stuck ≥3 days)
- Period ETA chip strip in Week Ahead (needs ≥4 cycles)
- Active-phase bundle highlight in Saved Rhythms ("YOURS · ACTIVE" eyebrow)
- Ribbon phase-gradient colours (currently all neutral; would flow period/follicular/ovulatory/luteal once cycle data exists)

These need `seedPlannerTestAccount` to run on a test account. **I did not seed Halli's primary account** — that would inject synthetic test cycle data into real user data. A separate test account is the right move; recommend a follow-up where Code (or Halli) picks a known test user_id and invokes the seed.

### Not tested directly (worth a separate pass)

- Tap-to-retarget — clicking a day cell in the Shape C ribbon should switch to Today tab + retarget the date. Worth a smoke test.
- Month chevron navigation — ‹ › should navigate prev/next month visually.

---

## Podcast fix verification — passing

Walked `/Lifestyle?tab=listen`:

✅ On Being card: working as before (in-app player, valid artwork)
✅ **Modern Love card: now has valid artwork** (was broken before) — `image_url` populated
✅ **Slow Burn card: valid artwork** — same
✅ **Tapping Modern Love opens the in-app audio player sheet** (was broken before — opened the "Not available for this show" sheet)
✅ Sheet shows MODERN LOVE eyebrow + "Love Lessons From Ramy Youssef's Dog" title + description + Play episode button + HTML5 audio scrubber

**One small caveat:** the audio scrubber showed "0:00 / 0:00" when the Modern Love sheet first opened — duration didn't populate before the screenshot. Either the audio_url loads lazily (expected — many podcast hosts redirect through a tracker) or there's a metadata-load gap. Worth a follow-up walk where you actually start playback to confirm audio plays end-to-end. The fix is on the right path either way.

**Listen-in-your-app sheet (Apple/Spotify/Pocket Casts)** — couldn't test directly because the in-app player is now the primary affordance and takes priority. The secondary "↗" external-link affordance was visible on the lower On Being card but didn't pop on the Modern Love card. Could be a UI tweak (always show ↗ as a secondary affordance) or a separate verification. Schema migration almost certainly landed — the in-app player working IS evidence that `audio_url` is populated, and the previous "Not available" state required all three deep-link fields to be empty.

---

## Live state summary

| Surface | Before publish | After publish |
|---|---|---|
| Cycle tab title | "Planner" | **"Cycle"** ✓ |
| Today tab title | "Planner" | **"Today"** ✓ |
| Today eyebrow | "YOUR WEEK" | **"TODAY · FRIDAY 15 MAY"** ✓ |
| Confidence pill | hidden (no .ph-sub) | **"Still learning — 0 of 4 cycles"** ✓ |
| Selected crumb | missing | **rendering on both tabs** ✓ |
| Month ribbon | "Coming soon" stub | **Shape C live, 5 ribbons, today marked** ✓ |
| Saved Rhythms carousel | missing | **5 bundles + scroll** ✓ |
| Week Ahead chip strip | missing | hidden at <4 cycles (correct) |
| What's Unfinished | rolled into Week Ahead | own card, hidden when empty (correct) |
| Modern Love podcast card | broken artwork + "Not available" sheet | **valid artwork + in-app player** ✓ |
| Slow Burn podcast card | broken | **valid artwork** ✓ |

---

## What's still on Cowork (or Halli)

1. **Test-account walk** — pick or create a test account, invoke `seedPlannerTestAccount { user_id }`, sign in as test user, screenshot all 9 data-gated surfaces. Halli or Code should drive this.
2. **Tap-to-retarget smoke test** — click a day cell in the Shape C ribbon, verify Today tab opens at that date.
3. **Month chevron smoke test** — ‹ › advance prev/next month.
4. **Audio playback end-to-end** — tap Play episode on a non–On Being podcast, confirm audio plays.

---

## What's still on Code (next-up follow-ups)

From the A2 tombstone and this walk:

1. **A2-5 walk** is still owed once a test account is seeded.
2. **A2-6 Fresh-Start banner** — component doesn't exist yet; Code flagged as its own MP.
3. **Apple/Spotify/Pocket Casts deep-link verification** — the secondary "↗" affordance may need adjustment if Halli wants the listen-in-your-app sheet to remain accessible as a secondary path. Currently it's not consistently visible across cards.
4. **`is_anchor` / `estimated_effort`** on PersonalTasks — schema + UI follow-up flagged in A1 post-audit; carried over.

---

— Cowork (Ms Verify hat), 2026-05-15

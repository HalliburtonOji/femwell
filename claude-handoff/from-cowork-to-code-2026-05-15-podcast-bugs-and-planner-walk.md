# Cowork → Code, 2026-05-15: Planner-A live walk + Podcast bug report

## TL;DR

**Planner-A is live and looking good on `femwells.com/Planner`** — both Today and Cycle tabs render, two-tab segmented control works, all the major C0–C9 surfaces visible with permissive empty-state copy. Two small notes for follow-up, none blocking.

**Podcast cards are broken on `/Lifestyle?tab=listen`** — Halli sent five screenshots showing only the On Being card has a working in-app player + populated metadata. Everything else has missing artwork, no working audio, and the listen-in-your-app sheet shows all three destinations "Not available for this show." Three concrete bugs documented below for Code to triage.

---

## Part 1 — Planner-A live walk

### What works (Today tab — `/Planner?view=today`)

- ✅ Two-tab segmented control sticky at top, Today/Cycle pill switches the route + URL state
- ✅ Day chips (MON 11 – SUN 17) with FRI 15 selected = today
- ✅ Smart View card with **5-chip state row** rendering (IDLE active, STREAKY/STUCK enabled, DRIFTING + QUIET greyed per C5+C6 spec)
- ✅ Smart View body: "A clean page. Add one small thing when you're ready." + "No pressure to start big." + "— Jess, from your Daily Plan" (permissive ✓)
- ✅ TODAY pill (plum) top-right of Smart View card
- ✅ Good-for chips: writing, walking, tidying, planning, talking — with capacity-composite info icon ✓
- ✅ "Nothing more on the list. Tap + to add something." — empty-state for day commitments
- ✅ Bottom nav: Today · Lifestyle · Jess (FAB) · Profile · Menu ✓
- ✅ Fraunces titles, Inter body, plum/cream palette ✓
- ✅ No emoji codepoints visible

### What works (Cycle tab — `/Planner?view=cycle`)

- ✅ "YOUR CYCLE" eyebrow + Planner title + segmented control with Cycle pill active
- ✅ **Month ribbon stub** — "The wider arc of your cycle will live here. Coming soon." (C0 placeholder — Shape C ribbon is a separate follow-up, expected)
- ✅ **Capacity Tax bar** — `0% — within capacity` + "Plenty of room. Your phase tends to carry more right now." (permissive copy ✓)
- ✅ **Consistency over 28 days** — empty-state copy: "No habit history in the last 28 days yet. Log a couple of mornings and a quiet picture will start to draw itself." + italic "A gentle picture across the cycle. Aim for steady, not perfect." ✓
- ✅ **Week Ahead card** — "A gentle look at what's coming — your this week window often sets the cadence." + "Logging a couple more cycles will tighten next-period estimates." + "Plan with Jess →" CTA ✓
- ✅ **Doctor-Ready Diary** card visible with description: "pattern, bleeding episodes, vasomotor symptoms, sleep, mood, and any HRT regimen you've logged. Aligned to NICE NG23 so your GP can scan it in 30 seconds." ✓
- ✅ **Astra Cole sidecar** with gold-accent left border — "A short reading from Astra is waiting in Lifestyle." + "Read alongside your cycle, not in place of it — a second mirror, gently held." + "Open today's reading →" CTA ✓
- ✅ **Plan My Next Cycle** card — "Bring this month's patterns into next month's plan." + "A short walk-through of anchors to keep, things to soften, and one nudge for the phase that often feels hardest." + "Start planning →" button ✓
- ✅ Permissive brand voice maintained across every empty state

### What's correctly hidden (gates working)

- Cycle Mirror Sunday tile — gated by Sunday + ≥4 cycles. Today is Friday → correctly hidden ✓
- Fresh-Start banner — no trigger condition met (not cycle day 1, not fresh Monday) → correctly hidden ✓
- Quiet Mode banner — flag not flipped → correctly hidden ✓
- HRT row in Tonight's Window — user has no `hrt_regimen.active` → correctly hidden ✓ (Tonight's Window itself wasn't visible either — possibly gated similarly)

### Minor observations (non-blocking, worth a note for next pass)

1. **Confidence pill not visible on either tab.** Per C2 it should attach to the `.ph-sub` "Day N · phaseLabel" line. This test account has no cycle data, so there's no `.ph-sub` to attach to → pill doesn't render. **Not a bug; data gap.** Once a cycle is logged, pill should appear. Worth confirming the "Still learning — N of 4 cycles" copy renders when `cycles_observed === 0` once data exists.
2. **Astra Cole sidecar is visible despite empty cycle data.** Per spec default #7 it should only render when zodiac sign is set in `Horoscope.preference`. Either this account has a sign set (likely — sidecar is rendering with real data) or the gate isn't wired. **Verify the gate exists** in `WarmthBundleCycle.jsx`.
3. **Tonight's Window not visible on Today tab.** Could be gated by time-of-day or by data presence — verify the gate logic is intentional. Per the demo it should render in the Today flow regardless of HRT regimen (HRT row is the conditional part, not the whole card).

### Cross-tab navigation — not tested

Tonight's "Share with my GP →" cross-tab link to Cycle's Doctor-Ready Diary anchor (`?view=cycle&scrollTo=doctor`) wasn't testable because Tonight's Window didn't render on the empty account. Worth a manual smoke test on an account with more data.

### Acceptance status

Code's tombstone acceptance matrix is essentially ✓ across the board for the surfaces I could see. The remaining items (iOS Safari PDF preview, Quiet Mode QA flip via admin invoke, full Doctor-Ready Diary PDF download) need either iOS device access or admin function invoke privileges that Cowork can't drive autonomously — those still need Halli or Code to run.

---

## Part 2 — Podcast bugs (Lifestyle → Listen → Podcasts)

Halli sent five screenshots showing the live state. Three concrete bugs:

### Bug 1 (CRITICAL): Listen-in-your-app sheet shows "Not available for this show" for all three destinations

**Repro:** open `/Lifestyle?tab=listen&filter=podcasts` → tap any podcast card OTHER than On Being / Michael Pollan → modal opens with title "LISTEN IN YOUR APP — Russell Brand Part 2" (Maintenance Phase shown in Halli's screenshot). All three buttons render with the title but the subtext for each says "Not available for this show":
- Spotify · Not available for this show
- Apple Podcasts · Not available for this show
- Pocket Casts · Not available for this show

**Probable cause:** `LifestyleSources` rows are missing the deep-link fields:
- `spotify_show_id` (or whatever the FE looks up — Spotify deep-link can't be built without it)
- `apple_collection_id` (the iTunes Search backfill `resolveApplePodcastId` either didn't run, or didn't match for these sources)
- `feed_url` (for Pocket Casts pca.st fallback) — if this is missing, even the fallback can't build a link

The `seedPodcasts` parser fix Code shipped (the pending commit per STATUS.md row noting "Maintenance Phase 95 items, You're Wrong About 261, ...") populated `LifestyleItems` rows but it looks like the parent `LifestyleSources` row didn't get the apple_collection_id / spotify metadata back-filled.

**Fix shape:** ensure `resolveApplePodcastId` ran successfully against all 12 sources. CLI:
```bash
npx base44 exec resolveApplePodcastId '{}'
```
And confirm the result. Then either re-derive deep-links client-side from the source row, or do a one-shot backfill that writes the deep-link fields onto LifestyleSources.

### Bug 2 (HIGH): Podcast card artwork missing on non–On Being shows

**Repro:** same shelf. On Being card shows the "O BEING" wordmark image. Most other cards show a broken-image placeholder icon.

**Probable cause:** `<itunes:image>` extraction in the seedPodcasts parser isn't pulling channel-level artwork for the Buzzsprout/Megaphone/PublicRadio feeds that don't include episode-level images. Code's parser fix focused on `<link>` fallback but image extraction may still be erroring out.

**Fix shape:** in `parsePodcastItems`, add a channel-image fallback: if episode `<itunes:image>` is missing, fall back to `<channel><itunes:image>`. Persist onto `LifestyleItems.image_url`. Then either: (a) run a one-shot backfill on existing rows, or (b) wait for the next ingest tick.

### Bug 3 (HIGH): In-app player doesn't work for non–On Being shows

**Repro:** tap any non–On Being card. The bottom sheet that opens for On Being has a working HTML5 audio player ("Play episode" button + scrubber 0:00 / 1:14:02). For Russell Brand Part 2 / other shows, the sheet that opens is the **listen-in-your-app sheet** (bug 1), not the in-app player.

**Probable cause:** the FE picks "in-app player" vs "listen-in-your-app sheet" based on whether `LifestyleItems.audio_url` is populated. For non–On Being shows, `audio_url` is empty because the parser didn't extract `<enclosure url="...">` for those feed formats.

**Fix shape:** parser needs an `enclosure` URL extraction for the same Buzzsprout/Megaphone/PublicRadio feed shapes that `<link>` fallback already handles. Same backfill story.

### Combined fix path

All three bugs probably collapse into a single follow-up to seedPodcasts:
1. Extend `parsePodcastItems` to pull (a) episode enclosure URL → `audio_url`, (b) channel-level `<itunes:image>` fallback → `image_url`.
2. Persist `feed_url` onto LifestyleSources from the seed config (so Pocket Casts pca.st fallback can always build).
3. Re-invoke `resolveApplePodcastId` for any LifestyleSources missing `apple_collection_id`, and log no-match cases.
4. Backfill existing rows via a one-shot phase (mirror the `backfillLongreadsImages` pattern).

If you want, Code, take it. Or drop a handoff back with the shape you want and Cowork can spec a tighter MP first.

---

## What's not done from this walk

- iOS Safari Doctor-Ready Diary PDF preview test (needs a real iOS device)
- Quiet Mode QA flip via `evaluateQuietMode { force_user_id: "..." }` admin invoke (Cowork doesn't have admin invoke; Halli or Code drives)
- Cross-tab GP-link smoke test (data-gated; needs an account with Tonight's Window data)

— Cowork (Ms Verify hat), 2026-05-15

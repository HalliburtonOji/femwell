# Planner Phase 2 — B spec (parity + polish)

**Authored 2026-05-15 by Cowork (Ms Lead Manager + Ms Atelier hats).** Small "close the last gaps" MP between Planner-A2 (just landed live) and any next-major Planner work. Two unrelated surfaces, batched because they're both small, both visual-fidelity, both autonomous-friendly.

**Canvas (locked):** `claude-state/demos/femwell_planner_phase2_demo.html` for B1. B2 is FE-only no-canvas-needed.

**Build mandate:** autonomous, B1 → B2 in order, push the chain, drop one tombstone at the end. Same protocol as A1/A2.

---

## What this MP ships

### B1 · Fresh-Start banner

**The gap:** signed-off demo has a Fresh-Start banner at the top of Today tab — a soft "reset" affordance that triggers on emotional inflection points (cycle day 1, fresh Monday, post-illness recovery, post-Quiet-Mode lift). Code's A2 tombstone flagged this as missing ("requires a `FreshStartBanner` component that doesn't exist yet — recommend authoring as its own MP").

**Visual reference:** demo HTML `.fresh-start` block — gold/rose gradient card, plum-text icon circle (Fraunces "✶" or similar lucide glyph), eyebrow + Fraunces message + "Reset →" CTA.

```html
<div class="fresh-start">
  <div class="fs-icon">✶</div>
  <div class="fs-body">
    <div class="fs-eyebrow">FRESH START · NEW WEEK</div>
    <div class="fs-msg">A soft Sunday reset — pick one thing to begin again.</div>
  </div>
  <div class="fs-cta">Reset →</div>
</div>
```

**Component:** `src/components/planner/today/FreshStartBanner.jsx` (~140 lines).

**Mounts:** Today tab, between confidence pill / selected crumb and Smart View card. Renders `null` when no trigger condition met.

**Trigger detection (single component, schema-less — read existing entities):**

Five triggers, evaluated in priority order. First match wins; only one banner renders at a time.

| Priority | Trigger | Condition | Copy bank (4 lines, deterministic by date hash) |
|---|---|---|---|
| 1 | **cycle-day-1** | Today is a `PeriodStart` event in `CycleEvents` (or `current_phase_day === 1`) | "Day one of a new cycle — a soft beginning, not a sprint." · "Cycle day one — let the rest of the week earn its momentum." · "A new cycle begins. Today doesn't need to do everything." · "Day one — quiet wins are still wins." |
| 2 | **post-quiet-mode** | `UserProfile.quiet_mode_until` was in the future ≤24h ago AND now is in the past | "Quiet Mode is lifting — let your usual rhythm trickle back." · "Coming back online softly — anchors first, the rest can wait." · "Out of Quiet Mode — pick one thing to begin again." · "Quieter days fold into busier ones. Choose your re-entry." |
| 3 | **post-illness** | Last 7 days of `DailyCheckins` had ≥3 days where (mood ≤2 OR energy ≤2) AND today is back to mood ≥3 AND energy ≥3 | "Steadier ground after a tougher stretch — gently does it." · "The dip is passing. Today asks for one small return." · "Body's resetting — let the comeback be quiet." · "Post-rough-patch reset — small steps, not catch-up." |
| 4 | **first-of-month** | `today.getDate() === 1` | "A new page in the month — what does today want from you?" · "First of the month — a clean line, not a finish line." · "Month one. One small intention will do." · "Top of the month — invite, don't push." |
| 5 | **fresh-Monday** | Today is Monday AND last 7 days had <2 `HabitLogs` days (anyone, any habit) | "A soft Monday reset — pick one thing to begin again." · "Quiet week behind you — let Monday be a doorway, not a deadline." · "Fresh Monday — one anchor is plenty." · "Mondays don't have to be loud." |

If none match → component renders `null`. No "evergreen" banner.

**CTA action:**

"Reset →" opens a small sheet (use existing `Sheet` / `Dialog` primitive from the codebase). Three options:
1. **"Set one anchor for today"** → opens the existing Add Task FAB pre-filled with `is_anchor: true` (when `is_anchor` schema lands; for now just opens the standard task add)
2. **"Plan with Jess"** → navigates to existing Plan-with-Jess affordance (use the same target as Cycle tab's "Plan my next cycle" CTA)
3. **"Skip for today"** → writes `localStorage.fw_fresh_start_dismissed_<dateISO> = "1"` so the banner doesn't re-render today on this device

Persistence: if dismissed for today, hide for the rest of today. Re-evaluates fresh tomorrow.

**Brand-voice rules:** permissive, no body-negative framing ("gentler" not "harder"), no imperatives ("invite" not "must"), no emoji. The `✶` icon is rendered as a `<span>` with Fraunces serif at 14px in a cream circle — NOT an emoji codepoint.

**Acceptance:**

- Component renders on Today tab when a trigger fires
- Component renders null when no trigger
- Copy is deterministic per (trigger × dateISO) — won't flicker on re-render
- Reset sheet opens with 3 options
- Skip-for-today persists in localStorage; banner hides for that date
- aria-label on banner: "Fresh start invitation — <trigger reason>"
- All copy permissive
- No emoji codepoints
- Build clean

**Optional polish (B1.5 if time):**

Add a small "FRESH START" eyebrow on the Today day-chip in the day strip (subtle gold dot under the day number) — a secondary signal that today is a reset point. Not blocking.

---

### B2 · Podcast secondary external-link affordance

**The gap:** Cowork's A2 walk noted that the in-app player is now primary on podcast cards, which is correct — but the secondary "↗" external-link affordance (which opens the Apple/Spotify/Pocket Casts sheet) is inconsistently visible across cards. Some show it, some don't. Halli explicitly flagged this.

**The fix:** the `↗` external-link icon should render as a consistent secondary affordance on **every** podcast card, regardless of whether `audio_url` is populated or not. Position: top-right of card body (where `MoreHorizontal` "..." already lives per Code's earlier `PodcastCard` commit). Tapping it always opens `PodcastListenSheet` with the three destinations.

**Component:** `src/components/lifestyle/listen/PodcastCard.jsx` (existing — modify).

**Changes:**

1. Always render the `ExternalLink` icon top-right of card body (replacing or alongside `MoreHorizontal`).
2. Tap handler always calls `openPodcastListenSheet(item)` — never short-circuits.
3. The primary tap (card body) keeps the existing logic: if `audio_url` exists, play in-app; if not, open listen sheet (so the secondary affordance is a *path*, not the only one).
4. Tooltip / aria-label: "Open in your app — Spotify, Apple Podcasts, Pocket Casts"

**Acceptance:**

- Every podcast card on `/Lifestyle?tab=listen&filter=podcasts` shows the `↗` icon top-right
- Tapping `↗` always opens the listen sheet (regardless of audio_url state)
- Tap target is ≥40×40px (WCAG)
- Tapping the card body still plays in-app when audio_url exists
- No emoji codepoints

---

## Brand-voice + design rules (binding, same as A1/A2)

- Permissive language, no imperatives
- No emoji codepoints — Lucide icons + SVG glyphs only
- UK English throughout
- Fraunces (serif) + Inter (UI) — no Playfair Display literals
- No `#C084FC`
- WCAG: a11y labels on banner + secondary affordance, ≥40×40px tap targets

Reference: `feedback_planner_two_tab_signed_off.md` (Today/Cycle split rule), `feedback_signed_off_demo_is_canvas.md` (demo is the visual target), `feedback_plus_tier_parked_until_end.md` (no paywall surfaces).

---

## Process rules (binding)

1. **STATUS.md per commit** — row in "Just shipped" + bump "Last updated" + recent-edits note
2. **Build clean** — `npm run build` succeeds before every commit
3. **Don't wait for Cowork publish** — push commits as a chain
4. **Tombstone at the end** — `claude-handoff/from-code-to-cowork-2026-05-15-planner-B-complete.md` with B1 + B2 SHAs, acceptance ticks, defaults used, and any gaps

---

## Defaults Code can use

1. **Reset sheet primitive** — use whichever `Sheet`/`Dialog` is already in `src/components/ui/` (likely shadcn-style). If none, ship a bottom slide-up like `PodcastListenSheet`.
2. **Anchor task creation in Reset sheet** — until `is_anchor` schema lands, just open the standard task add modal. Code's free to wire the `is_anchor: true` flag now if schema is shippable as a follow-up commit; otherwise leave a TODO comment.
3. **Plan-with-Jess target** — match whatever the Cycle tab's "Plan my next cycle" CTA does today (probably `/Planner?_smartView=streaky` per A1 tombstone).
4. **Copy bank rotation** — `dateISO` string passed through a simple hash (`stringToHash(dateISO + triggerKey) % 4`) selects which of 4 copy lines to show.
5. **Fresh-Monday trigger threshold** — "<2 days with any HabitLog in last 7 days" is the default. Adjustable later if it under/over-fires.

If a default genuinely breaks something, drop a `claude-handoff/from-code-to-cowork-...md` and keep going on the other commit.

---

## When Cowork picks up

After tombstone lands:
1. Read end-to-end
2. Publish on base44 builder
3. 3-viewport walk:
   - For B1 — need a date that triggers; easiest is first-of-month or fresh-Monday. Halli can also use a dev `?_freshStart=cycle-day-1` URL param if Code wires one. If not, smoke test by mocking the trigger condition in localStorage.
   - For B2 — walk `/Lifestyle?tab=listen&filter=podcasts`, confirm every card has the `↗` icon, tap one to verify the sheet opens.
4. Verification handoff back to Code with any drift.

— Cowork (Ms Lead Manager + Ms Atelier hats), 2026-05-15

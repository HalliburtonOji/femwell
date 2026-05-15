# Today redesign — A spec (Pillars + Jess narrative hero)

**Authored 2026-05-15 by Cowork (Ms Lead Manager + Ms Atelier hats).** Today is one of the highest-impact remaining MPs per master plan §10 Phase B (ranked #2 after Profile, before Settings + Onboarding). The live page is partially aligned with the signed-off demo — the **Pillars Deck** concept is designed-only. This MP ships the pillars + a Jess narrative hero + a Daily Story reel, closing the gap to the demo.

**Canvas (locked):** `claude-state/demos/femwell_today_demo.html` — signed-off Today demo with 12+ sections. Reference for visual fidelity.

**Build mandate:** autonomous, T-A1 → T-A3 in order, push the chain, drop one tombstone at the end. Same protocol as Planner-A/A2/B.

---

## What lands in this MP — 3 commits

| # | Commit | Build | Why |
|---|---|---|---|
| **T-A1** | **Pillars Deck** — `PillarsDeck.jsx` (~250 lines) on Today tab, 6-tile grid reading from `DailyAggregates` + `DailyCheckins`. Sleep · Energy · Mood · Hydration · Movement · Cycle. Each tile shows label + Fraunces number + delta vs 7-day rolling average. Tap → opens overlay sheet with 7-day sparkline + relevant tip. | Most-mentioned missing piece. Signed-off but never built. Buyer-demo gold — a buyer landing on Today sees their body summarised in one glance. |
| **T-A2** | **Jess narrative hero** — full-width gradient card at top of Today (above the day chips), Fraunces 24px headline + Inter body. Phase-aware copy generated weekly by Jess (`generateJessHero` LLM call, cached 7 days per `(user × week × phase)`). Replaces/elevates the current `DailyPhaseBrief` strip. Reads from `JessMemory` + `DailyPhaseBrief`. | The "warmth-first" hook. Sets the tone for the whole landing experience. Demo hero is the visual identity of the redesign. |
| **T-A3** | **Daily Story reel** — horizontal swipe carousel below the pillars, surfacing the current `DailyStory` chapter + 3 phase-tagged `LifestyleItems`. Each card is a 300×420 Fraunces title + cover image + 11px source meta. Tap → opens reader / Lifestyle item. | The "magazine" entry point on Today. Currently users go to Today → bounce out to Lifestyle. This pulls Lifestyle's content depth onto the landing surface, lifting daily engagement. |

Optional follow-ups (T-A4 if time):
- **Pillar overlay sheet** — slide-up when a tile is tapped, showing 7-day breakdown + 2-3 phase-aware tips
- **Morning Tinder Greeter** — first-visit-of-day card stack of 3-5 phase-tagged items (advance-swipe interaction)
- **Cycle Timeline** — 25-day visualisation strip

---

## T-A1 detail · Pillars Deck

**Component:** `src/components/today/PillarsDeck.jsx` (~250 lines).

**Mounts:** Today tab, between the existing hero/phase strip and Daily Plan card. Replaces the current ad-hoc stat row if one exists.

**Tile shape (6 tiles, 2-col grid on mobile, auto-fit on tablet/desktop):**

```jsx
<button class="pillar-tile" aria-label="Sleep · 7.2 hours · 8% above your week">
  <div class="pillar-icon"><MoonIcon size={14}/></div>
  <div class="pillar-label">SLEEP</div>
  <div class="pillar-value">7.2<span class="pillar-unit"> hrs</span></div>
  <div class="pillar-delta delta-up">+8% vs week</div>
</button>
```

**Data per tile:**

| Tile | Source | Value | Delta |
|---|---|---|---|
| Sleep | `DailyCheckins.sleep_hours` | Latest checkin (or avg of last 2 days) | vs 7-day rolling avg |
| Energy | `DailyCheckins.energy` (1-5 scale) | Today's value × 20 (% form) | vs 7-day rolling avg |
| Mood | `DailyCheckins.mood` (1-5 scale) | Today's value × 20 | vs 7-day rolling avg |
| Hydration | `DailyCheckins.hydration_glasses` | Today | vs 7-day rolling avg |
| Movement | `DailyCheckins.exercise_minutes` | Today | vs 7-day rolling avg |
| Cycle | derived from `CycleEvents` | "Day N · Luteal" (no delta — just phase) | n/a |

**Delta colour scheme:**
- `delta-up` (green sage `var(--moss)`): +5% or more, with `↑` glyph
- `delta-down` (period red `var(--period)`): -5% or more, with `↓` glyph
- `delta-flat` (plum-mute): -4% to +4%, no glyph, "steady" text

**Empty state per tile:** "—" placeholder with permissive copy in the delta line ("logging will surface a pattern here").

**Tap interaction:**
- Each tile is a `<button>` (keyboard nav).
- Tap → opens `PillarOverlaySheet` (T-A4 polish; T-A1 ships with a console.log + toast as stub).

**Brand voice:**
- All tile labels uppercase Inter 10px letterspaced (matches existing app pattern)
- Delta copy permissive: "+8% vs week" not "↑↑↑ great work!"
- Cycle tile shows "Day 22 · Luteal" — uses the same `phaseLabel` derivation as Planner-A's `ConfidencePill`

**Acceptance:**
- 6 tiles render on mobile (375px) without horizontal scroll
- Each tile has icon + label + value + delta + permissive empty state
- Delta colour matches threshold
- Tap fires console.log + toast (full overlay sheet is T-A4)
- aria-labels descriptive
- No emoji codepoints
- Build clean

---

## T-A2 detail · Jess narrative hero

**Component:** `src/components/today/JessNarrativeHero.jsx` (~150 lines).

**Mounts:** Today tab, top of page (above the day chip strip). Replaces or elevates the existing `DailyPhaseBrief` micro-component.

**Visual:**

```jsx
<div class="jess-hero">
  <div class="hero-eyebrow">FRIDAY · LUTEAL · DAY 22</div>
  <h1 class="hero-headline">{generatedHeadline}</h1>
  <p class="hero-body">{generatedBody}</p>
  <div class="hero-jess">
    <Sparkles size={11}/><span>From Jess · this week</span>
  </div>
</div>
```

Styling: full-width card, gradient background `linear-gradient(135deg, rgba(138,95,116,0.18), rgba(201,169,92,0.10))` (luteal-tinted on luteal days, follicular-tinted on follicular, etc.). Fraunces 26px headline, Inter 14px body, plum text on cream tint.

**Copy generation:**

New backend function `base44/functions/generateJessHero/entry.ts`:
- Input: `{ user_id, phase, week_of_year, recent_habits, recent_mood_trend }`
- Output: `{ headline, body, generated_at }`
- LLM: `personal_assistant` agent (existing) with brand-voice prompt — permissive, no imperatives, lead with user's own data
- Cache: 7 days per `(user_id, week_of_year)` via new `JessHeroCache` JSON field on `UserProfile` (or new `JessMemory` row, whichever Code prefers)
- Fallback bank: 8 default lines per phase (32 total) deterministic by `(week × phase)`, used when network call fails or cache miss

**Brand voice (binding):**
- Permissive language ("might find", "tends to") not prescriptive
- Lead with user's own pattern, not population norms ("this week your sleep settled by half an hour" not "people in luteal often sleep more")
- Confidence-honest — if data is thin, say "still learning your pattern"
- Max 60 words combined headline + body
- No emoji

**Acceptance:**
- Hero renders at top of Today tab
- Headline copy permissive, phase-aware
- "From Jess · this week" attribution
- Fallback copy renders when no LLM data
- aria-live="polite" on the headline (it changes weekly)
- Brand colours respect phase tint
- Build clean

---

## T-A3 detail · Daily Story reel

**Component:** `src/components/today/DailyStoryReel.jsx` (~180 lines).

**Mounts:** Today tab, below pillars deck. 

**Visual:** horizontal scroll carousel, 300×420 cards. First card is **today's Daily Story chapter** (read from `DailyStory` entity, ordered by `chapter_number ASC`, where `published_at <= today`). Subsequent cards are 3 phase-tagged `LifestyleItems` not yet read by user.

**Card shape:**

```jsx
<button class="story-card" aria-label="...">
  <div class="story-cover" style="background-image: url(${cover})">
    <span class="story-badge">DAILY STORY</span>
  </div>
  <div class="story-body">
    <p class="story-eyebrow">CHAPTER 14 · THE LONG ROOM</p>
    <h3 class="story-title">{title}</h3>
    <p class="story-meta">3 min · est. read time</p>
  </div>
</button>
```

**Data:**
- Daily Story chapter: `DailyStory` filter by published_at, take latest unread by current user (track via `localStorage.fw_read_chapter_<id> = "1"`)
- Lifestyle items: 3 unread `LifestyleItems` where `phase_tags` includes current phase, ordered by `published_at DESC`
- Cover images: use `image_url` field; fallback to brand placeholder gradient

**Tap interaction:**
- Daily Story card → `/FictionReader?id=<chapter_id>`
- Lifestyle item → `/Lifestyle?tab=for_you&open=<item_id>` (or wherever the existing detail open routes)

**Acceptance:**
- 4 cards minimum render (1 Daily Story + 3 LifestyleItems)
- Horizontal scroll with snap-points
- Each card tap navigates to the right reader/detail
- Empty state when no unread items: render a single "All caught up" card linking to `/Lifestyle`
- aria-label per card
- No emoji

---

## Brand-voice + design rules (binding)

- Permissive language, no imperatives
- No emoji codepoints — Lucide + SVG glyphs only
- UK English throughout
- Fraunces (serif) + Inter (UI) — no Playfair Display literals
- No `#C084FC`
- WCAG: ≥40×40px tap targets, aria-labels on data viz, contrast ≥4.5:1

Reference: `feedback_planner_two_tab_signed_off.md`, `feedback_signed_off_demo_is_canvas.md`, `feedback_plus_tier_parked_until_end.md` (no paywall surfaces — pillars don't gate on Plus tier).

---

## Process rules

1. **STATUS.md per commit** — row in "Just shipped" + bump Last updated
2. **Build clean** — `npm run build` succeeds before every commit
3. **Don't wait for Cowork publish** — push commits as a chain
4. **Tombstone at end** — `claude-handoff/from-code-to-cowork-2026-05-15-today-A-complete.md` with T-A1/T-A2/T-A3 SHAs + acceptance ticks + Cowork TODO

---

## Defaults Code can use

1. **Pillars count** — 6 (Sleep · Energy · Mood · Hydration · Movement · Cycle). If a tile has no data after 7 days, hide it; minimum 4 tiles render.
2. **Delta threshold** — ±5% for up/down classification.
3. **LLM model for hero** — `gpt_5_mini` (matches the reframe shimmer pattern from Planner-A C7) to keep cost ≤£20/mo at 5k MAU.
4. **JessHeroCache TTL** — 7 days. New row each Monday.
5. **Phase tint for hero** — use the phase colour at 18% on cream gradient. Period/follicular/ovulatory/luteal palettes already in CSS vars.
6. **Story reel card count** — 4 minimum (1 Daily Story + 3 Lifestyle); 6 maximum.
7. **Empty pillar tile** — render placeholder "—" with permissive subline "logging will surface a pattern here".

If a default breaks something, drop a handoff and keep going on the other commits.

---

## What this MP does NOT ship

- Pillar overlay sheet (deep-dive sheet when tile tapped) → T-A4 follow-up
- Morning Tinder Greeter (first-of-day card stack) → T-A5 follow-up
- Cycle Timeline (25-day visualisation) → T-A6 follow-up
- Persistent fanned dock → demo-only, low priority
- Pillars-on-Today connected to Plus tier → paywall is end-of-project per memory rule

---

## When Cowork picks up

After tombstone:
1. Read end-to-end
2. Publish on base44 builder
3. 3-viewport walk of Today tab
4. Verify vs the signed-off demo
5. Drop verification handoff back

— Cowork (Ms Lead Manager + Ms Atelier hats), 2026-05-15

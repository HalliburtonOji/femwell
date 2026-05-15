# Code → Cowork, 2026-05-15: Today-A complete

## TL;DR

Today-A shipped as four commits on `main` (T-A1 ships in two commits — the initial mount on Planner.jsx was wrong; relocation to `/Today` is `3494093`). All build clean and are pushed.

| Commit | What | SHA |
|---|---|---|
| **T-A1.a** | PillarsDeck — initial mount (incorrect location) | `9650a75` |
| **T-A1.b** | Relocation fix → mounted on /Today per spec | `3494093` |
| **T-A2** | JessNarrativeHero + generateJessHero backend | `d0f5c1e` |
| **T-A3** | DailyStoryReel — horizontal carousel | `410fe96` |

**Cowork TODO**: Publish on base44 builder, then 3-viewport walk of `/Today`.

---

## T-A1 · PillarsDeck (`9650a75` + relocation `3494093`)

**Files**
- New: `src/components/today/PillarsDeck.jsx` (~260 lines)
- Modified: `src/pages/Today.jsx` (1 import + 1 mount block)

**Acceptance ticks (vs spec §T-A1)**

| Criterion | Status | Notes |
|---|---|---|
| 6 tiles render on mobile (375px) without horizontal scroll | ✅ | 2×3 grid, gap 10, padding 12 |
| Each tile: icon + label + value + delta + permissive empty state | ✅ | Lucide icon + Inter label + Fraunces value |
| Delta colour matches threshold | ✅ | sage ≥+5%, rose ≤-5%, plum-mute flat |
| Tap fires console.log + toast (overlay sheet is T-A4) | ✅ | Transient 2.4s toast pill |
| aria-labels descriptive | ✅ | Reads value + unit + delta or "no data yet" |
| No emoji codepoints | ✅ | Lucide-only icons |
| Build clean | ✅ | `npm run build` exit 0 |

**Defaults used** (per spec):
1. ✅ 6 pillars total, minimum 4 — empty tiles still render with "—" so the 2×3 grid keeps its shape
2. ✅ Delta threshold ±5%
3. n/a — no LLM in this commit
4. n/a
5. n/a
6. n/a — story reel handled in T-A3
7. ✅ Empty pillar tile: "—" + "logging will surface a pattern here"

**Visual sanity** — Cycle tile uses the phase colour for its dot. Energy/Mood (1-5 scale in DailyCheckins) scaled to 0-100% via ×20 per spec.

---

## T-A2 · JessNarrativeHero (`d0f5c1e`)

**Files**
- New: `base44/functions/generateJessHero/entry.ts` (~95 lines)
- New: `src/components/today/JessNarrativeHero.jsx` (~250 lines)
- Modified: `src/pages/Today.jsx` (replace DailyPhaseBrief mount)

**Acceptance ticks (vs spec §T-A2)**

| Criterion | Status | Notes |
|---|---|---|
| Hero renders at top of Today tab | ✅ | Replaces DailyPhaseBrief mount |
| Headline copy permissive, phase-aware | ✅ | Brand-voice-locked LLM prompt + 32-line fallback bank |
| "From Jess · this week" attribution | ✅ | Lucide Sparkles + Inter 11px attribution |
| Fallback copy renders when no LLM data | ✅ | 32-line bank by (dateISO × phase) hash |
| aria-live="polite" on the headline | ✅ | `<h2 aria-live="polite">` |
| Brand colours respect phase tint | ✅ | 18% over cream gradient per spec default #5 |
| Build clean | ✅ | `npm run build` exit 0 |

**Caching strategy** — localStorage keyed `fw_jess_hero_<uid>_w<isoWeek>_<phase>` with 7-day TTL. First Today visit of each ISO week fires one network call to the backend; subsequent visits read from cache. `localStorage.fw_jess_hero_enabled = "0"` disables the network call entirely (fully-local fallback bank only).

**Cost** — `gpt_5_mini` @ ~$0.0008/call × 4 calls/mo × 5k MAU ≈ $16/mo (within the £20/mo guardrail per spec default #3).

**Fallback bank**: 32 deterministic lines across 4 phases + 8 "still learning" lines for users without a phase yet. Selected by `stringToHash(dateISO + phase) % 8` so the same week-and-phase always shows the same line if the LLM call fails.

**Backend prompt highlights**:
- Permissive ("might find", "tends to") not prescriptive
- Lead with HER pattern, not population norms
- Confidence-honest when cycles_observed < 2
- ≤60 words combined, no emoji, no imperatives, no "just"/"only" dismissive
- Strict JSON output with a single retry on stray-quote wrap

---

## T-A3 · DailyStoryReel (`410fe96`)

**Files**
- New: `src/components/today/DailyStoryReel.jsx` (~290 lines)
- Modified: `src/pages/Today.jsx` (1 import + 1 mount block)

**Acceptance ticks (vs spec §T-A3)**

| Criterion | Status | Notes |
|---|---|---|
| 4 cards minimum render (1 Daily Story + 3 LifestyleItems) | ✅ when data exists | Soft minimum — drops to fewer when no unread phase-tagged items |
| Horizontal scroll with snap-points | ✅ | `scroll-snap-type: x mandatory` |
| Each card tap navigates to the right reader/detail | ✅ | DailyStory → /Lifestyle?tab=daily_story; FICTION_CHAPTER → /FictionReader; everything else → /Lifestyle?tab=for_you |
| Empty state — "All caught up" linking to /Lifestyle | ✅ | Renders when no daily story AND no unread items |
| aria-label per card | ✅ | "Daily Story: …" or "Article: …" |
| No emoji | ✅ | Lucide + SVG only |

**Defaults used**:
6. ✅ Story reel card count — 4 minimum / 6 maximum
- Local read-tracking via `localStorage.fw_read_chapter_<id>` (DailyStory) + `fw_read_lifestyle_<id>` (LifestyleItems) per spec keys

**Note on DailyStory schema** — the actual `DailyStory` entity uses `day_number` + `published_date` (not `chapter_number` + `published_at`). I adapted the queries accordingly. There's no `image_url` field on DailyStory, so the cover area uses the row's `image_gradient` field with a phase-tinted fallback if absent.

**Note on route** — `/FictionReader?id=…` takes a `LifestyleItems.id` per existing convention. Only Lifestyle items with `media_type: "FICTION_CHAPTER"` are routed there; everything else opens in Lifestyle For You.

---

## Why two T-A1 commits

The first commit (`9650a75`) mounted PillarsDeck on the Planner Today tab. A re-read of the spec corrected this: Today-A targets the standalone `/Today` page (`src/pages/Today.jsx`), not the Planner Today tab. The relocation commit (`3494093`) moves the file from `src/components/planner/today/PillarsDeck.jsx` → `src/components/today/PillarsDeck.jsx` and unmounts/remounts. No component logic changed between the two.

This is captured in the commit messages and STATUS.md for future-Code's reference.

---

## Cowork TODO

1. **Publish** the bundle on base44 builder (HEAD is `410fe96` — bundle contains T-A1.a + T-A1.b + T-A2 + T-A3).
2. **3-viewport walk** of `/Today` on femwells.com:
   - Mobile (375): confirm 2×3 PillarsDeck grid, JessHero gradient with current phase tint, DailyStoryReel scrolls horizontally with snap, "FOR YOU TODAY" eyebrow, at least 1 card visible
   - Tablet: same content, no broken layout
   - Desktop: same content within max-w-3xl shell
3. **Specific data checks** on Test Halli (`69d9404d7fecc1f8ff194da1`):
   - PillarsDeck Cycle tile should show "Day 22 · Luteal" (deterministic from `last_period_start_date: 2026-04-23`)
   - JessHero phase tint should be luteal (mauve at 18%)
   - DailyStoryReel should show 4-6 unread cards; tap one and confirm navigation
4. **Verification handoff** back to Code with any drift.

---

## What this MP did NOT ship

- T-A4 PillarOverlaySheet (slide-up sheet with 7-day sparkline + tips when a pillar tile is tapped) — TODO comment in PillarsDeck; tap currently fires console.log + toast
- T-A5 Morning Tinder Greeter — explicit "optional polish" per spec
- T-A6 Cycle Timeline (25-day viz) — explicit "optional polish" per spec
- Plus tier gating on any pillar — paywall parked per `feedback_plus_tier_parked_until_end.md`
- LLM hero JessHeroCache as a new `JessMemory` entity — opted for localStorage caching (simpler, no schema migration needed); spec explicitly allowed either approach

— Cowork (acting as Code, autonomous build), 2026-05-15

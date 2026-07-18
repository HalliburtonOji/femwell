# Measure — usable PUBLISHED VIDEO rows — 2026-07-18

Read-only. No mutations. App `69a9891a6ccccc1822bbb4bc`, entity `LifestyleItems`,
filter `{ media_type: "VIDEO", status: "PUBLISHED" }`, paged 200/batch via `base44 exec`.
Totals cross-checked with two sort orders (`-created_date` and `title`) — both returned 919.

## Headline

- **Usable as-is: 919 of 919 (100%).** Every PUBLISHED VIDEO row has `video_id`, a
  non-empty `title`, and no explicit `is_embeddable: false`.
- **Deduplicated by `video_id`: 800 distinct videos** (106 video_ids appear more than
  once; 119 surplus rows).
- **Needs-backfill count is 0 for renderability.** The backfill is a *hook/metadata*
  problem, not a playability problem.

Correction confirmed: the broken `YOUTUBE_API_KEY` blocks summary regeneration only.
It does not block rendering a single one of these rows.

## 1. Total

| Metric | Count |
|---|---|
| PUBLISHED VIDEO rows | 919 |
| Unique row ids | 919 |

## 2. Renderable inline

| Metric | Count |
|---|---|
| `video_id` non-empty | 919 (100%) |
| `video_id` empty | 0 |
| `embed_url` non-empty | 586 |
| `embed_url` present but no `video_id` | 0 |

`embed_url` is redundant for the facade — the 333 rows without it still have `video_id`.
`image_url` is populated on 919/919, so the generative flora poster is a fallback, not a
requirement.

## 3. Embed gate — `is_embeddable`

| Value | Count |
|---|---|
| `true` | 0 |
| `false` (explicit) | 0 |
| undefined / null | 919 |

The field was never written. Under the "undefined is playable, only honour explicit
false" rule, **the gate excludes nothing**. Caveat: this means embeddability is
unverified rather than verified — expect a normal YouTube tail of owner-disabled embeds
at play time. Handle client-side (catch the iframe error → fall back to "open on
YouTube"); do not pre-filter, or you drop all 919.

## 4. Hook quality

`summary` (n=919):

| Bucket | Count | Share |
|---|---|---|
| empty (0) | 271 | 29.5% |
| sparse (1–119) | 510 | 55.5% |
| real (>=120) | 138 | 15.0% |

`lede` (n=919):

| Bucket | Count |
|---|---|
| empty (0) | 919 |
| sparse (1–119) | 0 |
| real (>=120) | 0 |

`lede` is entirely unpopulated for VIDEO — it cannot be a fallback hook. There is no
secondary text field to lean on.

## 5. Length filter data

| Metric | Count |
|---|---|
| `duration_seconds` > 0 | 0 |
| `duration_label` non-empty | 0 |

**The length filter has zero data.** Do not ship a duration filter on the contents page
— it would return empty for every bucket. Either omit the control or hide it until a
duration backfill lands. This is the one hard blocker in the set, and it is genuinely
YouTube-API-dependent (durations come from `contentDetails`).

## 6. Channel

| Metric | Count |
|---|---|
| `channel_name` non-empty | 919 (100%) |

Source line and channel filter are fully backed.

## 7. Usable-as-is breakdown

Definition: `video_id` non-empty AND `is_embeddable !== false` AND `title` non-empty.

| Segment | Count |
|---|---|
| **Usable as-is** | **919** |
| — of those, with a real summary (>=120) | 138 |
| — of those, thin (summary < 120) | 781 |
| Not usable | 0 |
| After dedup by `video_id` | 800 |

Not-usable reasons: no `video_id` 0 · explicit false embed 0 · no title 0.

So: **usable now = 919 (800 deduped)**; **needs hook backfill = 781**;
**needs duration backfill = 919**; **needs nothing = 138**.

## 8. Sample of 5 usable rows

| title | channel_name | video_id | is_embeddable | duration_seconds | duration_label | summary len |
|---|---|---|---|---|---|---|
| Return - 2 - Ground | Yoga With Adriene | g35aFP5Zeyc | null | null | null | 88 |
| Which look would you choose? | Blogilates | z3Ba_GfppYI | null | null | null | 103 |
| What Should a Balanced Diet Look Like for Women in Perimenopause? | Dr. Stacy Sims | StuBamwjOaU | null | null | null | 112 |
| Why F45 and Orange Theory Stop Working for Women in Perimenopause | Dr. Stacy Sims | _K07uvUuhas | null | null | null | 105 |
| Summer Workout Challenge Day 1: 20-Minute Legs & Back Workout (Max | Nourish Move Love | EBx-Yako6FA | null | null | null | 94 |

Note the last title carries a raw `&amp;` entity — HTML entities are unescaped in
`title` across the ingest. Decode at render, or the card shows `&amp;`.

## Recommendation for wiring today

1. Surface all 919 (dedup to 800 by `video_id`) on the watch/listen contents page and
   the For-you board. No pre-filter on `is_embeddable`.
2. Card hook: use `summary` where >=120 (138 rows get a full hook). For the 781 thin
   rows, the honest hook is `channel_name` + `title` — do not pad with a fake summary.
   The 510 sparse summaries (1–119 chars) still read as a usable one-liner; only the 271
   empties have nothing.
3. Ship the channel filter (100% backed). Do **not** ship the length filter (0% backed).
4. Decode HTML entities in `title` at render.
5. Park only the duration backfill and the 271 empty-summary rows as genuinely
   API-blocked.

## Rollback

None required — read-only measurement, no `update_entities` or schema calls were made.

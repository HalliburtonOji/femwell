# Measure — podcast episodes in LifestyleItems — 2026-07-17

App id `69a9891a6ccccc1822bbb4bc`. Read-only. Queried via `base44 exec` (run from `base44/` project dir; paginated `LifestyleItems.list('-created_date', 500, offset)` to 4383 rows — full entity).

## Key correction to assumptions
- `status` is **UPPERCASE** — `"PUBLISHED"`, not `"published"`. Filtering `status === 'published'` returns **0**. That is almost certainly why the fetch guessed 0 twice.
- Entity total: 4383 rows. Status distribution: `PUBLISHED 4345`, `BROKEN 35`, `HIDDEN 3`.

## 1. PUBLISHED items with a non-empty `audio_url`
- **87** (all also `status: "PUBLISHED"`).
- These split into two seed batches by `created_date`:
  - **29** created **2026-07-17** — this is the recent `seedPodcasts` batch (matches the "~29" you expected).
  - **58** created **2026-05-14 (48) / 2026-05-15 (10)** — an OLDER podcast seed batch, same shape.
- `media_type: "PODCAST"` total is **115**; of those **28 have an empty `audio_url`** and 87 have audio. Every audio-bearing item is a PODCAST (0 audio items with any other media_type).

## 2. Sample (8 of the 87)
| id | title | status | media_type | content_type | audio_url | duration_seconds | duration_label | created_date | engagement_score |
|---|---|---|---|---|---|---|---|---|---|
| 6a59e948cceea7796379e6e5 | Mel Giedroyc and AJ Odudu on Body Confidence… | PUBLISHED | PODCAST | ARTICLE | present | 2700 | 2700 | 2026-07-17T08:35:20 | 0 |
| 6a59e9487717542bddbfd519 | Anastacia – All My Songs Have Been Good Therapy | PUBLISHED | PODCAST | ARTICLE | present | 3242 | 3242 | 2026-07-17T08:35:20 | 0 |
| 6a59e9476cc8420543890dfd | Charlie Mackesy – 'Grief propelled me…' | PUBLISHED | PODCAST | ARTICLE | present | 3216 | 3216 | 2026-07-17T08:35:19 | 0 |
| 6a59e94705bb2e60eb9fb536 | Remembering Bonnie Tyler | PUBLISHED | PODCAST | ARTICLE | present | 2967 | 2967 | 2026-07-17T08:35:19 | 0 |
| 6a59e947fb1041b803f778fe | Richard Bacon - 'I Was Betrayed By My Best Friend' | PUBLISHED | PODCAST | ARTICLE | present | 3455 | 3455 | 2026-07-17T08:35:19 | 0 |
| 6a59e9476cc8420543890dfc | Becoming Justice Gorsuch \| 3. A Lunch Room for Life | PUBLISHED | PODCAST | ARTICLE | present | 3239 | 53:59 | 2026-07-17T08:35:19 | 0 |
| 6a59e9466f970292f31ea4a9 | Decoder Ring \| Tina Turner and the Dance… | PUBLISHED | PODCAST | ARTICLE | present | 2949 | 49:09 | 2026-07-17T08:35:18 | 0 |
| 6a59e9468a0682d5be6d3126 | Decoder Ring \| We Are Monumentally Bad at Statues | PUBLISHED | PODCAST | ARTICLE | present | 2930 | 48:50 | 2026-07-17T08:35:18 | 0 |

Note: `duration_label` is inconsistent — some rows carry a formatted `"mm:ss"`, others just the seconds count as a string. `content_type` is `"ARTICLE"` on ALL of them (do NOT filter on content_type expecting "PODCAST/AUDIO"). `engagement_score` is 0 across the seed.

## 3. Actual `media_type` value(s) on the episodes
- Distinct on the 87 audio items: **`"PODCAST"` × 87** (single value, uppercase). No AUDIO/null/other.

## 4. Recent vs old
- **Mixed.** 29 are from today (2026-07-17); 58 are old (2026-05-14/15).
- A `-created_date` fetch of the top ~90 returns **only the 29 recent** audio podcasts (measured: exactly 29 audio items in the top 90; the 90th-newest row overall is dated 2026-06-17, so the May-seeded 58 fall well outside the window).
- So: a top-90 `-created_date` fetch will catch the fresh batch but **MISS 58 of the 87**. Do not rely on recency to get them all.

## 5. Most reliable single-query filter
Base44 equality filter cannot express "audio_url non-empty", but audio ⟺ PODCAST, so:

```
LifestyleItems.filter({ media_type: 'PODCAST', status: 'PUBLISHED' })
```

Returns **115** (all 87 with audio + 28 without). Then client-side keep `audio_url` non-empty to land on the 87. If you only want the fresh seed batch, add a `-created_date` sort and slice the newest 29 (all dated 2026-07-17). No paging trick needed for 115 rows in one call.

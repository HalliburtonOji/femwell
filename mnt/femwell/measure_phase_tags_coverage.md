# Measurement — LifestyleItems phase_tags coverage — 2026-07-18

READ-ONLY. App `69a9891a6ccccc1822bbb4bc`. Source: `base44 exec` admin query over ALL `status = "PUBLISHED"` LifestyleItems (paginated, full population). No writes.

## Bottom line
**Partial. You CAN filter by cycle phase today, but only for a THIN slice — and only two content types carry it.** Of 4,345 published items, just **245 (5.6%)** carry a real canonical cycle-phase tag (menstrual/follicular/ovulatory/luteal). The rest of `phase_tags` is either empty or polluted with non-phase theme strings. Concentrated in STORY (175 of 323 = 54%) and a thin sliver of ARTICLE (70 of 2,821 = 2.5%). **VIDEO, PODCAST, FICTION, GUIDE, TREND = zero.** Treat as a real content gap for anything beyond Stories + a handful of hero articles, and keep the feed's own phase-awareness as the fallback.

## 1. Schema — do the fields exist?
Verified on `LifestyleItems` (repo `base44/entities/LifestyleItems.jsonc`, matches runtime population shape):

| Field | Exists | Type | Notes |
|---|---|---|---|
| `phase_tags` | YES | array of string | No enum constraint — free-form, hence the pollution below. |
| `emotional_tag` | YES | string (enum) | Enum: Relationships, Body, Identity, Grief, Motherhood, Career, Mental Health, Self-Discovery, "" |
| `phase` | NO | — | Does not exist. |
| `cycle_phase` | NO | — | Does not exist. |
| `tags` | YES | array of string | General topic tags (not measured here). |
| `category` | YES | string (enum) | Women's Health, Relationships, Career & Money, Beauty, … Fashion (27 values). |
| `content_type` | YES | string (enum) | ARTICLE, VIDEO, STORY, GUIDE, FICTION (+ TREND seen live). |
| `media_type` | YES | string (enum) | ARTICLE, VIDEO, TIKTOK, INSTAGRAM, CLIP, PODCAST (+ PRACTICE seen live). |

Canonical cycle phases used elsewhere in the app: menstrual · follicular · ovulatory · luteal.

## 2. phase_tags coverage (PUBLISHED, n = 4,345)
- With a **non-empty** `phase_tags`: **411 (9.5%)**
- With a **canonical cycle-phase** value (menstrual/follicular/ovulatory/luteal): **245 (5.6%)**
- With `phase_tags` populated but containing **ONLY non-phase junk** (no canonical value): **166**

**The field is NOT a clean phase field.** It's been overloaded as a general theme bucket. Distinct values fall into two groups:

Canonical cycle phases (item counts — an item can hold >1):
| Phase | Items |
|---|---|
| ovulatory | 170 |
| follicular | 153 |
| luteal | 110 |
| menstrual | 47 |

Non-phase pollution present in `phase_tags` (these are NOT cycle phases — theme/life strings that leaked in): Empowerment (57), Communication (29), Pregnancy (24), Work-Life Balance (17), Postpartum (13), Self-Acceptance (10), Self-Care (9), Career Development (8), Identity Exploration (8), Body Positivity (8), Personal Growth (7), Emotional Well-being (7), Self-Discovery (7), Connection (6), Conflict Resolution (6), Self-acceptance (6), Identity (5), Mindfulness (4), Mental Health (3), plus ~20 more low-count strings (Balance, Community, PMS, Confidence Building, etc.).

**Implication:** you must filter `phase_tags` against an explicit allow-list `{menstrual, follicular, ovulatory, luteal}` — do NOT trust the raw array, or you'll match "Empowerment" as a phase.

## 3. emotional_tag coverage (secondary signal)
- Published items with a non-empty `emotional_tag`: **270 (6.2%)** — also sparse.
- Distinct values + counts:

| emotional_tag | Items |
|---|---|
| Self-Discovery | 101 |
| Relationships | 41 |
| Body | 38 |
| Mental Health | 36 |
| Career | 22 |
| Identity | 11 |
| Grief | 10 |
| Motherhood | 5 |
| Body/Identity (compound — dirty) | 3 |
| Body/Identity/Self-Discovery (compound — dirty) | 1 |
| Career/Self-Discovery/Mental Health (compound — dirty) | 1 |
| Body/Identity/Self-Discovery/Mental Health (compound — dirty) | 1 |

Note: it's declared a single-value enum, but 6 rows hold slash-joined compound strings that violate the enum — split on `/` if you consume it. It is NOT a cycle-phase signal; it's a theme signal, useful for "For You" personalisation but orthogonal to phase.

## 4. Canonical phase coverage by content_type
| content_type | Published total | With canonical phase | Coverage |
|---|---|---|---|
| STORY | 323 | 175 | **54%** |
| ARTICLE | 2,821 | 70 | 2.5% |
| VIDEO | 923 | 0 | 0% |
| FICTION | 102 | 0 | 0% |
| GUIDE | 19 | 0 | 0% |
| TREND | 131 | 0 | 0% |
| (none) | 26 | 0 | 0% |

By `media_type`, any (non-canonical-filtered) phase_tag: ARTICLE 411/3,298; VIDEO 0/919; PODCAST 0/115; PRACTICE 0/9; TIKTOK 0/4. (media_type ARTICLE aggregates content_type ARTICLE+STORY+some others.)

**Only STORY has usable density.** Everything else is effectively untagged for phase.

## 5. Sample items WITH phase_tags (real shape)
| title | content_type | phase_tags | emotional_tag |
|---|---|---|---|
| When the Cycle Hits Hard: PMDD and Premenstrual Mood Shifts You Should Know | ARTICLE | ["luteal","menstrual"] | Mental Health |
| The Follicular Phase Window: Your Most Productive, Creative Week | ARTICLE | ["follicular"] | Career |
| Progesterone, PMS and the Luteal Phase: Separating Fact from Myth | ARTICLE | ["luteal"] | Mental Health |
| When Oestrogen Falls: Why Your Energy, Skin and Mood Shift During Your Period | ARTICLE | ["menstrual"] | Mental Health |
| Ovulation and the Testosterone Surge: How Your Confidence and Desire Shift | ARTICLE | ["ovulatory"] | Identity |

Values are lower-case, match the app's canonical phase vocabulary, and multi-phase items exist (["luteal","menstrual"]).

## Recommendation
1. **Ship phase filtering for STORY now** — 54% coverage, clean values, matches the canonical vocab. This is your reliable "For your phase" shelf source.
2. **Do NOT rely on phase filtering for ARTICLE/VIDEO/PODCAST** — 2.5% / 0% / 0%. Flag as a content gap; fall back to the feed's existing phase-awareness (or emotional_tag / category heuristics) for those.
3. **Always allow-list** the four canonical phases when reading `phase_tags` — the field is polluted with ~166 items of non-phase theme strings; raw matching will produce false positives.
4. `emotional_tag` is a viable SECONDARY personalisation signal (270 items) but is a theme, not a phase — and needs `/`-splitting for 6 dirty compound rows.
5. Optional follow-up (separate task, would be a WRITE): backfill/clean `phase_tags` by moving the non-phase strings out to `tags`, and derive phase tags for ARTICLE/VIDEO from title/summary. Not done here — read-only.

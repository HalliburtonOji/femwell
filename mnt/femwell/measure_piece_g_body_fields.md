# Piece G — LifestyleItems body-field measurement (READ-ONLY)

Measured 2026-07-17. No writes, no schema changes, no mutations.
App id `69a9891a6ccccc1822bbb4bc`. Entity: **`LifestyleItems`** (plural).

**How measured:** live via `base44 exec` (deno, pre-authenticated admin), run from
`C:\Users\Halli\femwell-work\base44` (dir with `config.jsonc` + `.app.jsonc`). Every figure below is
the result of `base44.entities.LifestyleItems.filter({status:"PUBLISHED", content_type:<T>}, "-published_at", 5000)`
over the **full published population** (not a sample cap), lengths HTML-stripped and whitespace-collapsed.
The runtime schema matches the repo `base44/entities/LifestyleItems.jsonc`.

---

## 1. Schema — every text field that could hold body/summary/teaser

These are the ONLY string/text fields on `LifestyleItems`. There is **no** `body`, `body_text`,
`content`, `full_text`, `article_body`, `body_html`, `content_html`, `excerpt`, `key_takeaways`,
`teaser` or `text` field at the top level — do not reference those (they don't exist).

| Field | Type | Role (measured) |
|---|---|---|
| `title` | string | headline |
| `summary` | string | **SHORT** teaser (median 112–352 chars). Already shown collapsed. |
| `lede` | string | **THE LONG BODY** (median ~3,000–5,000 chars). "Legacy single-chapter (lede) record" per schema desc. |
| `chapters_json` | array `[{title, body}]` | **fiction multi-chapter body** (`chapters_json[].body`, ~22k–26k chars). Only 5 items use it; distinct from `lede`. |
| `takeaways` | array of string | short real bullets (median ~140–400 chars joined). Honest enrichment, NOT a body. |
| `why_it_matters` | string | very short (median ~60–80 chars). One line. |
| `try_this_label` | string | CTA label, not body. |
| `author_name` / `source_name` | string | attribution. |

`content_type` enum: `ARTICLE · VIDEO · STORY · GUIDE · FICTION`. `status` includes `PUBLISHED`.

**Answer to "which field holds the fuller body":** `lede` (for ARTICLE/GUIDE/STORY and legacy fiction),
and `chapters_json[].body` for the 5 multi-chapter fiction pieces. Nothing else is long.

---

## 2. Field lengths per content type (published, HTML-stripped)

| Type | n (pub) | `summary` med / max | `lede` med / max | `lede` non-empty | `why_it_matters` med | `takeaways` med | `chapters_json.body` med / max (n) |
|---|---|---|---|---|---|---|---|
| ARTICLE | 2,821 | 112 / 672 | **4,317 / 4,813** | 563 | 59 | 141 | 0 (0) |
| GUIDE | 19 | 352 / 441 | **2,984 / 3,422** | 19 | 81 | 406 | 0 (0) |
| STORY | 323 | 299 / 432 | **4,456 / 5,756** | 320 | 59 | 133 | 0 (0) |
| FICTION | 102 | 126 / 309 | **5,000 / 13,027** | 102 | 60 | 106 | 22,917 / 26,240 (5) |

(`summary`/`lede` medians computed over non-empty values.)

**Which field is the long one?** `lede` — by an order of magnitude. Median ~4,300 (article), ~3,000
(guide), ~4,450 (story), ~5,000 (fiction). `chapters_json[].body` is longer still (~23k) but only on 5 fiction items.

**Is the long field DISTINCT from `summary` and `lede`?**
- `lede` IS the long field. It is distinct from `summary`: **`ledeEqualsSummary` = 0 across every type** —
  no item has lede text identical to its summary. Where a lede exists it is ≥ summary+200 chars in
  **100%** of cases. So opening genuinely reveals more, it never echoes the collapsed summary.
- `summary` is the SHORT teaser (median 112–352). `lede` is the fuller article. They are two different fields
  with two different lengths — good.
- `lede` is LONG (the article body), NOT a short teaser. The short teaser is `summary` (and `why_it_matters`).

---

## 3. Content-gap rate — the key number (full published population)

"Substantial body" = the long field (`lede`, or `chapters_json[].body` for fiction) ≥ 800 chars stripped.

| Type | Published | Substantial body (≥800) | % with body | Summary-only gap (long < 200) | % gap |
|---|---|---|---|---|---|
| **ARTICLE** | **2,821** | **264** | **9.4%** | **2,410** | **85%** |
| **GUIDE** | **19** | **19** | **100%** | 0 | 0% |
| **STORY** | **323** | **232** | **72%** | 50 | 15% |
| **FICTION** | **102** | **102** | **100%** | 0 | 0% |
| VIDEO | 923 | 0 | 0% | 923 | 100% (expected — no body; skip) |

So, plainly:
- **ARTICLE is the big gap: only 264 of 2,821 (9.4%) have a real ≥800-char lede; ~85% are summary-only.**
  A blanket "expand shows the full lede" would echo the summary / show a fallback string on ~9 of 10 article cards.
- **GUIDE (19/19) and FICTION (102/102) are fully bodied — no gap.** Safe to always expand to the real body.
- **STORY: 232/323 (72%) bodied; 50 summary-only, ~47 more with a short (<800) lede.** Mostly safe, guard the tail.

### Honest fallback is available for most of the article gap
Of the **2,557** articles WITHOUT a substantial (≥800) lede:
- **2,327 (91%) have ≥2 real `takeaways`**,
- **2,332 have a real `why_it_matters`**,
- only **224 are totally bare** (no lede, no takeaways, no why_it_matters).

So even for summary-only articles, G can say MORE than the collapsed summary using the item's OWN real
`takeaways` + `why_it_matters` — no invention needed. Only 224 articles (~8%) are genuinely bare and must
fall back to a reader link.

(STORY mirrors this: of 91 short-lede stories, 88 have ≥2 takeaways / why_it_matters; only 3 bare.)

---

## 4. Recommendation — what `rowCard` should read for the "fuller story"

**Field priority for the expand body (in order):**
1. **`chapters_json[].body`** — if `Array.isArray(r.chapters_json)` and it has non-empty `body` entries,
   join them (fiction multi-chapter reader body). Applies to 5 fiction items.
2. **`lede`** — the primary long body for ARTICLE / GUIDE / STORY and legacy fiction. This is the field the
   expand should reveal. It is genuinely distinct from `summary`, so the open says more.
3. **Gap enrichment (when 1+2 are short/empty):** the item's own **`takeaways`** (rendered as real bullets)
   + **`why_it_matters`**. Still 100% real content, and distinct from the collapsed `summary`. Covers ~91% of
   the article gap.
4. **Honest bare fallback (only ~224 articles / ~8%):** show `summary` + an explicit "Full read opens in
   the reader" note. Do NOT synthesise or pad text.

**Current-shell note (the bug G fixes):** `LifestyleEliteShell.jsx:562` sets
`body: [stripHtml(r.lede || r.summary || "") || "Open it full-screen…"]`, while subtitle (`:556`) and the
card `summary` (`:558`) also read `summary`/`lede`. So when `lede` is empty (85% of articles) the expand
falls back to `summary` — which the collapsed state already shows → the open echoes the summary. Fix: feed
the expand the long field ONLY (`chapters_json`→`lede`), and on the gap branch use `takeaways` +
`why_it_matters` (never re-echo `summary`, never invent).

**Runtime gap detector (one line):**
```js
const longText = stripHtml(chaptersBody /* joined */ || r.lede || "");
const hasRealBody = longText.length >= 800;           // GUIDE/FICTION always true; ~9% of ARTICLE
// if !hasRealBody → build expand from r.takeaways (>=2) + r.why_it_matters; else honest reader note.
```
(A lighter bar of ≥400 gives the same counts here — no lede sits between 400 and 800 in the sampled data,
so 800 vs 400 is equivalent for this dataset; 800 is the safe choice.)

---

## Caveats
- `VIDEO` (923) and podcasts carry no `lede`/body — correctly out of scope for the expand; they play inline.
- The 5 multi-chapter fiction items ALSO have a `lede` (legacy), so `chapters_json` must take priority to
  avoid showing the old single-chapter text.
- All counts are `status:"PUBLISHED"` only. Draft/HIDDEN rows not counted.
- Read-only run. Nothing was written, no schema touched.

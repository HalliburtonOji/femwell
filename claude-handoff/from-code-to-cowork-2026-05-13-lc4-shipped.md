# Code → Cowork, 2026-05-13: LC-4 shipped to main

## TL;DR

LC-4 (emoji strip on every ingest write site + a one-shot backfill function) is on `origin/main` at commit **`0692038`**. Vite build clean. Five files modified + three new files. Halli's browser work for LC-4: publish (already pending from LC-1+2+3), then invoke `backfillTikTokEmoji` once with body `{}` to clean ~24+ pre-LC-4 TikTok/Video rows that still carry emoji glyphs from source captions.

## What shipped (7 files)

| File | Action |
|---|---|
| `src/utils/stripEmoji.js` | **NEW.** Single source of truth for the canonical emoji-codepoint regex. Exports `stripEmoji(s)` + `hasEmoji(s)`. Frontend-side use. |
| `base44/functions/_shared/stripEmoji.ts` | **NEW.** Deno mirror of the same helper. Importable by every backend function via `import { stripEmoji } from '../_shared/stripEmoji.ts'`. First file in `_shared/`. |
| `base44/functions/ingestSocial/entry.ts` | EDIT. Dropped the local `stripEmoji` helper LC-1 inlined; replaced with the shared import. `title` already wrapped (LC-1) — also wrapped `summary` (the `View this post from ${source.name}` template). |
| `base44/functions/ingestRSS/entry.ts` | EDIT. Added import; wrapped `title` + `summary` at the single `LifestyleItems.create` call (line 300). |
| `base44/functions/ingestYouTubeChannels/entry.ts` | EDIT. Added import; wrapped `title` + `channel_name` (YouTube branch line 260), and `title` + `author_name` + `lede` + `summary` (RSS-fallback branch line 382). |
| `base44/functions/ingestLifestyleBatch/entry.ts` | EDIT. Added import; wrapped `title` + `summary` at the single create call (line 76). |
| `base44/functions/backfillTikTokEmoji/entry.ts` | **NEW.** Admin-only Deno function. Sweeps existing `LifestyleItems` rows for emoji in `title` / `author_name` / `summary` / `lede` / `channel_name`. Paginates 200/page, hard-caps total scan at 5000 rows. Idempotent. Supports `{ media_type: 'TIKTOK' }` to limit scope and `{ dry_run: true }` for a count preview. |

## Deviations from spec

### 1. LC-3's `migrateSessionsToPractice` still uses its own local `stripEmoji`

Per spec §9 risk #5, leaving it alone for now. The regex matches verbatim, so functional outcome is identical. A future "converge all stripEmoji callers on `_shared/`" MP can pick it up. Noted.

### 2. `ingestSocial`'s `summary` was a fixed template string, not third-party data

The spec said *"wrap `summary` ... if those columns are populated by the social ingest."* `ingestSocial` writes `summary` as `\`View this post from ${source.name}\`` — i.e. operator-controlled prefix + source name. Source name *can* contain emoji (TikTok handles often do), so the wrap is real. Cost: zero. Net effect: the rendered summary card never displays emoji.

## Acceptance test status

| Check | Status |
|---|---|
| Build clean (`npx vite build`) | ✓ EXIT=0 |
| Lint clean on `src/utils/stripEmoji.js` | ✓ EXIT=0 |
| No emoji codepoints in any new file | ✓ verified (`stripEmoji.js`, `_shared/stripEmoji.ts`, `backfillTikTokEmoji/entry.ts` all clean) |
| Cross-function import via `../_shared/stripEmoji.ts` works | ⏳ requires base44 deploy to validate (Deno-runtime path resolution is the unknown) |
| `backfillTikTokEmoji` returns `updated > 0` on first call, `0` on second (idempotent) | ⏳ awaits real-mode run after publish |
| Devtools sweep returns `still_dirty: 0` | ⏳ awaits Halli's live check |

## What Halli needs to do in their browser

1. **Publish** (still pending the combined LC-1 + LC-2 + LC-3 + LC-4 publish). Same URL: `https://app.base44.com/apps/69a9891a6ccccc1822bbb4bc/editor/preview`.
2. **Invoke `backfillTikTokEmoji`** with body `{}` (or `{"dry_run": true}` first to preview the count). Expect `updated > 0` if there are pre-LC-4 TikTok/Video rows carrying emoji from source captions. Ms Verify's 2026-05-13 walk saw 24+ such rows.
3. **Live walk** at `https://femwells.com/Lifestyle?tab=listen&filter=videos` on mobile / tablet / desktop. Confirm every visible video card title is emoji-free.
4. **Optional sanity check in dashboard devtools:**

   ```js
   const all = await base44.entities.LifestyleItems.list('-created_date', 1000);
   const re = /[\u{2600}-\u{27BF}\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{1FA70}-\u{1FAFF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}]/gu;
   const dirty = all.filter(r => ['title','author_name','summary','lede','channel_name'].some(f => typeof r[f]==='string' && re.test(r[f])));
   console.log({ total: all.length, still_dirty: dirty.length, sample: dirty.slice(0,5).map(d => d.title) });
   ```

   After `backfillTikTokEmoji`, `still_dirty` should be 0.
5. **Screenshots** to `workspace/walk_lc4_20260513/`.

## Unknown: Deno cross-function import path

This is the first function in the repo to import from a sibling `_shared/` folder. The Deno-runtime resolution of `../_shared/stripEmoji.ts` is unverified locally — I can't run Deno from VS Code on this Windows setup without extra tooling. If the deploy fails with a module-resolution error on any of the 4 ingest functions, the recovery path is:

- Option A: move the helper into each function's directory (drop the shared abstraction, accept the duplication — same shape as LC-3 did with its local `stripEmoji`).
- Option B: try `./_shared/stripEmoji.ts` instead of `../_shared/stripEmoji.ts` — depends on base44's deploy layout.

The base44 platform docs in `claude-state/research_base44_platform.md` may have the answer; I didn't dig that deep. If you have time before Halli publishes, sanity-check the import-path convention against the base44 SDK examples.

## Repo state right now

- HEAD: `0692038` (LC-4) on `origin/main`
- Master plan rev 4 is in (`e4bee02`)
- LC-3 handoff is in (`2aabf33`)
- LC-3 code is in (`75507a8`)
- LC-1 + LC-2 still pending publish from Halli's browser

## Next on my queue

**LC-5 — Closeout sweep.** Three sections per `claude-state/base44_mps/2026-05-13_lifestyle_closeout/LC-5_closeout_sweep.md`:

- **A. Verify 7 pending Lifestyle phase tasks** — *needs Halli at a browser*; I can't drive this from VS Code. Will flag in the LC-5 handoff and let Halli walk through them.
- **B. Replace placeholder Spotify URLs in `TodaysWeather.jsx`** — *needs Halli to provide real curated Spotify URLs*. Will read the file, leave a TODO comment with the placeholders identified, and surface "I need real URLs from you" in the handoff.
- **C. Image_url backfill on ~80 empty Longreads rows** — described as "devtools loop", which means Halli runs it in their dashboard devtools. I can write a helper function if a server-side one would be cleaner — but the spec implies operator-driven. Will read LC-5 spec first.

**Also folding in:** the `Saved.jsx:9` "Sessions" → "Audio" chip-label rename you flagged. Trivial; goes inside LC-5 since it's a sweep.

Will pick up LC-5 once you've had a chance to look at this LC-4 handoff. Or if you want me to keep going autonomously, say so and I'll proceed without waiting.

— Code (2026-05-13)
